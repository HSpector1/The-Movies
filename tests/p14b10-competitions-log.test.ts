// Record 1358-C — independent-test-engineer RED for P14B relationship rulings SLICE B, the
// COMPETITIONS LOG (1347-A §2.1's append-only log, as amended/adopted by 1347-F; D-1312-1's
// history requirement, 1340-O:59-67). Authored on a scratch tree (1327-C method) at BASE
// c614b7e9ed62dcb889118ba1eadb8a2bafa7934a (the real repo's HEAD at start of this record) with
// slice A applied (1348-rel-sliceA-red-r5.patch + 1348-rel-sliceA-production-step3.patch,
// committed `slice-a`), branch wip/headless-program-20260916-ts. Revised as record 1358-C5 (RED r5)
// under 1358-F4: the P3 week check can now fail, and one leaf shows a row outliving its driver.
//
// AUTHORITY (read in full before use):
//   docs/.../1340-O-owner-rulings-20260929.md D-1312-1 (:59-67): "for history (ruling 8:
//     'preserve ... conflict events') and for the Rivals label, each edge gains an append-only
//     log ... The same helper writes it, one row per competition, where `slots` lists the cast
//     slots the pair contested on that production."
//   docs/.../1347-A-p14b-relationship-rulings-charter.md §2.1 (:29-34), §2.4 "How Rivals differs
//     from conflict evidence" (:67-70): "A pair that contests both lead and support on one
//     production records one competition with two slots."
//   brief-1358-sliceB-red.md scope item 3 (verbatim): "recordCastingCompetition appends one row
//     per pair per production {week, productionId, slots} with slots the non-empty subset of
//     ['lead','antagonist','support'] that pair contested, in slot order; a pair contesting two
//     slots of one production is one row with two slots; a re-greenlight after a cancel counts
//     once per production; the row count never exceeds sharedCompetitions; no RNG draw."
//
// PARENT API DECISION UNDER TEST (brief PARENT API DECISIONS): src/core/relationships.ts:
// `RelationshipEdge` gains `competitions: RelationshipCompetition[]` with
// `RelationshipCompetition = { week: number; productionId: string; slots: CastSlot[] }`. The
// EXISTING, UNCHANGED-SIGNATURE `recordCastingCompetition` (relationships.ts:384-427, slice A/pre)
// is the "same helper" D-1312-1 names; this file exercises IT, never an invented second entry
// point.
//
// RED MECHANISM: `recordCastingCompetition` already exists and already writes `sharedCompetitions`
// (an existing, unchanged field) — every leaf below reads the NEW `edge.competitions` field off a
// REAL, engine-minted edge. At BASE this field is `undefined` (`RelationshipEdge` does not carry it
// yet), so every `.competitions`-touching assertion throws a genuine TypeError ("Cannot read
// properties of undefined") — a real, specific, per-leaf RED, never a vacuous pass. This mirrors
// tests/p14b10-conflict-evidence.test.ts's "the real casting-competition route reaches genuine
// evidence" leaves, which reuse the SAME `sharedCompetitions`/`hasConflictEvidence` facts this
// file's fixture also produces (that file's leaves are unaffected by this file; nothing here edits
// it).
//
// FIXTURE: an independent copy of the `foundStudio`/`greenlightCycle` route already established
// and measured in tests/p14b9-casting-competition.test.ts and tests/p14b10-conflict-evidence.test.ts
// (same seed, same founding sequence) — per this codebase's own convention, each RED file keeps its
// own copy of this route rather than importing another test file's private module scope (neither
// file exports these helpers). Trimmed to the THREE productions this file's own leaves need:
//   P1  (concept 0): slate { lead:[a,d], antagonist:[b,d], support:[a,b] }, cast
//       { lead:a, antagonist:b, support:c } — TWO DIFFERENT pairs, each contesting ONE slot on the
//       SAME production: (a,d) via lead, (b,d) via antagonist. Proves "one row per PAIR per
//       production" (two rows, one per pair, not one row for the production).
//   P2  (concept 1, the "dedup" slate): slate { lead:[a,b], antagonist:[a,b], support:[c,d] }, cast
//       { lead:a, antagonist:b, support:c } — the SAME pair (a,b) named in two slots of ONE
//       production (1313-F Amendment 2's own example). Proves "two contested slots -> one row with
//       two slots", in slot order (lead before antagonist).
//   P3a/P3b (concept 2): slate { lead:[a,b], antagonist:[b,c], support:[c,a] }, cast
//       { lead:a, antagonist:b, support:c }, greenlit, captured, CANCELLED (no shoot, so no first
//       take — `recordCancelledAfterFirstTake`'s early return applies, minting nothing extra), then
//       RE-GREENLIT against the same still-complete casting session (1313-F Amendment 3) — a
//       distinct production id. Proves "a re-greenlight after a cancel counts once per production"
//       (pair (a,b) gets TWO rows, one per production id, not a single row nor a skipped second row).

import assert from 'node:assert/strict'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { fund } from './helpers/p14b2-fixtures.js'
import type { CastingSlate, CastSlot, GameState, Production } from '../src/core/types.js'
import { RELATIONSHIP_CONFLICT_COMPETITIONS, advanceRelationshipsWeek, hasConflictEvidence } from '../src/core/relationships.js'

// The exact new shape under test (locally declared: `RelationshipCompetition` does not exist on
// `src/core/types.ts` at BASE, so a `import type` of it would depend on an export that is not yet
// there — the established in-repo convention, tests/p14b5-relationships.test.ts's own local `type
// Edge`/`type Driver` redeclarations, is followed here instead of a brittle type-only import).
type RelationshipCompetition = { week: number; productionId: string; slots: CastSlot[] }
type EdgeWithLog = { a: string; b: string; sharedCompetitions: number; competitions: readonly RelationshipCompetition[]; recent: readonly { kind: string }[] }

const SEED = 'r1314-casting-01'
const STAGE = 'facility-soundstage-07'
const SHAPE = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const
const RANGES = { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] }
type Market = { writer: string; director: string; craft: string; actors: readonly string[] }

function deriveMarket(s: GameState): Market {
  const market = hiringMarketIds(s, 0)
  const byRole = (role: string) => market.filter((id) => s.talent.find((t) => t.id === id)?.role === role)
  const writer = byRole('writer')[0], director = byRole('director')[0], craft = byRole('craft')[0], actors = byRole('actor')
  assert.ok(writer && director && craft && actors.length >= 4, `route premise failed: seed "${SEED}" week-0 market lacks a writer/director/craft/4 actors`)
  return { writer, director, craft, actors }
}
function foundStudio(): { state: GameState; market: Market } {
  let s = fund(p13aGeneratedStudio(SEED))
  const market = deriveMarket(s)
  for (const id of [market.writer, market.director, market.craft, ...market.actors]) {
    s = applyActions(s, [{ kind: 'signContract', talentId: id, termWeeks: 208 }])
  }
  const mounted = s.sets.find((x) => x.mountedOn === STAGE && x.status !== 'retired')
  if (mounted !== undefined) s = applyActions(s, [{ kind: 'strikeSet', setId: mounted.id }])
  s = applyActions(s, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE } }])
  s = advanceTo(s, TUNING.SET_BUILD_WEEKS_BAND_HIGH)
  s = applyActions(s, [{ kind: 'activateScriptDevelopment' }, { kind: 'activateCastingSessions' }])
  return { state: s, market }
}
function greenlightCycle(s: GameState, market: Market, conceptIndex: number, slate: CastingSlate | null, cast: Record<CastSlot, string>,
  reuseProjectId?: string): { before: GameState; after: GameState; productionId: string; projectId: string } {
  let projectId = reuseProjectId
  if (projectId === undefined) {
    const concept = s.concepts[conceptIndex]!
    s = applyActions(s, [{ kind: 'commissionScript', project: { conceptId: concept.id, writerId: market.writer, shape: SHAPE, promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: RANGES } } }])
    projectId = s.scriptDevelopment.projects.at(-1)!.id
    for (let n = 0; s.scriptDevelopment.projects.find((p) => p.id === projectId)!.status !== 'review'; n++) {
      if (n >= 30) throw new Error(`route premise failed: project "${projectId}" did not reach review within 30 ticks`)
      s = tick(s)
    }
    s = applyActions(s, [{ kind: 'acceptScript', projectId }])
    if (slate !== null) {
      s = applyActions(s, [{ kind: 'startCastingSession', session: { projectId, slate } }])
      const sessionId = s.castingSessions.sessions.find((x) => x.projectId === projectId)!.id
      for (let n = 0; s.castingSessions.sessions.find((x) => x.id === sessionId)!.status !== 'review'; n++) {
        if (n >= 30) throw new Error(`route premise failed: session "${sessionId}" did not reach review within 30 ticks`)
        s = tick(s)
      }
      s = applyActions(s, [{ kind: 'acknowledgeCastingSession', sessionId }])
    }
  }
  const concept = s.concepts[conceptIndex]!
  const before = s
  s = applyActions(s, [{ kind: 'greenlightScriptProject', production: { projectId, directorId: market.director, craftIds: [market.craft], cast, budget: { negative: concept.baseNegativeCost, marketing: 0 } } }])
  const productionId = s.studio.activeProductions.at(-1)!.id
  return { before, after: s, productionId, projectId }
}
function cancelAndRefund(s: GameState, productionId: string): GameState {
  return fund(applyActions(s, [{ kind: 'cancel', productionId }]))
}
function edgeOf(s: GameState, x: string, y: string): EdgeWithLog | undefined {
  return (s.relationships as unknown as EdgeWithLog[]).find((e) => (e.a === x && e.b === y) || (e.a === y && e.b === x))
}

type World = {
  market: Market
  afterP1: GameState; p1: string
  afterP2: GameState; p2: string
  afterP3a: GameState; p3a: string; rngBeforeP3a: unknown; rngAfterP3a: unknown
  afterP3b: GameState; p3b: string
}
let cachedWorld: World | undefined
/** Built ONCE (memo cache, the house convention for expensive multi-cycle routes); every `it()`
 * reads a `structuredClone` of the cached result so no leaf can mutate another's fixture. */
function competitionsLogWorld(): World {
  if (cachedWorld !== undefined) return structuredClone(cachedWorld)
  const { state: s0, market } = foundStudio()
  const [a, b, c, d] = market.actors as [string, string, string, string]

  // P1 — two DIFFERENT pairs, one slot each, on the SAME production.
  const p1Slate: CastingSlate = { lead: [a, d], antagonist: [b, d], support: [a, b] }
  const p1 = greenlightCycle(s0, market, 0, p1Slate, { lead: a, antagonist: b, support: c })
  let s = cancelAndRefund(p1.after, p1.productionId)

  // P2 — the SAME pair (a,b) named in two slots of ONE production (1313-F Amendment 2).
  const p2Slate: CastingSlate = { lead: [a, b], antagonist: [a, b], support: [c, d] }
  const p2 = greenlightCycle(s, market, 1, p2Slate, { lead: a, antagonist: b, support: c })
  s = cancelAndRefund(p2.after, p2.productionId)

  // P3a/P3b — greenlight, cancel (no shoot), re-greenlight the SAME still-complete casting
  // session (1313-F Amendment 3) — a distinct production id, one more competition per pair.
  const p3Slate: CastingSlate = { lead: [a, b], antagonist: [b, c], support: [c, a] }
  const p3a = greenlightCycle(s, market, 2, p3Slate, { lead: a, antagonist: b, support: c })
  const afterP3aCancel = fund(applyActions(p3a.after, [{ kind: 'cancel', productionId: p3a.productionId }]))
  const concept2 = afterP3aCancel.concepts[2]!
  const p3bAfter = applyActions(afterP3aCancel, [{ kind: 'greenlightScriptProject',
    production: { projectId: p3a.projectId, directorId: market.director, craftIds: [market.craft],
      cast: { lead: a, antagonist: b, support: c }, budget: { negative: concept2.baseNegativeCost, marketing: 0 } } }])
  const p3b = p3bAfter.studio.activeProductions.at(-1)!.id

  const world: World = {
    market,
    afterP1: p1.after, p1: p1.productionId,
    afterP2: p2.after, p2: p2.productionId,
    afterP3a: p3a.after, p3a: p3a.productionId, rngBeforeP3a: p3a.before.rngState, rngAfterP3a: p3a.after.rngState,
    afterP3b: p3bAfter, p3b,
  }
  cachedWorld = world
  return structuredClone(world)
}

describe('the competitions log exists on the engine-minted edge (RED: RelationshipEdge.competitions is undefined at BASE)', () => {
  it('P1: two different pairs each get their OWN row for the same production, slots = the one slot each contested', () => {
    const w = competitionsLogWorld()
    const [a, , , d] = w.market.actors
    const [, b] = w.market.actors
    const adEdge = edgeOf(w.afterP1, a, d)!
    assert.ok(adEdge, 'route premise: pair (a,d) never formed an edge')
    expect(adEdge.competitions).toEqual([{ week: w.afterP1.market.tick, productionId: w.p1, slots: ['lead'] }])
    const bdEdge = edgeOf(w.afterP1, b, d)!
    assert.ok(bdEdge, 'route premise: pair (b,d) never formed an edge')
    expect(bdEdge.competitions).toEqual([{ week: w.afterP1.market.tick, productionId: w.p1, slots: ['antagonist'] }])
  }, 60_000) // 1356-F5: vitest cannot stop a synchronous body, so this timeout is not a budget

  it('P2: the SAME pair (a,b) contesting two slots of ONE production is ONE row, slots in slot order [lead, antagonist]', () => {
    const w = competitionsLogWorld()
    const [a, b] = w.market.actors
    const edge = edgeOf(w.afterP2, a, b)!
    assert.ok(edge, 'route premise: pair (a,b) never formed an edge')
    // Exactly one row for P2 (never two rows, one per slot).
    const p2Rows = edge.competitions.filter((row) => row.productionId === w.p2)
    expect(p2Rows).toHaveLength(1)
    expect(p2Rows[0]).toEqual({ week: w.afterP2.market.tick, productionId: w.p2, slots: ['lead', 'antagonist'] })
    expect(edge.sharedCompetitions).toBe(1) // the existing counter: one competition, not two
  }, 60_000) // 1356-F5: vitest cannot stop a synchronous body, so this timeout is not a budget

  it('P3a/P3b: a re-greenlight after a cancel counts once per production — pair (a,b) gets TWO rows, one per production id, each slots=[\'lead\']', () => {
    const w = competitionsLogWorld()
    const [a, b] = w.market.actors
    const edge = edgeOf(w.afterP3b, a, b)!
    assert.ok(edge, 'route premise: pair (a,b) never formed an edge')
    const p3Rows = edge.competitions.filter((row) => row.productionId === w.p3a || row.productionId === w.p3b)
    expect(p3Rows).toHaveLength(2)
    expect(new Set(p3Rows.map((row) => row.productionId))).toEqual(new Set([w.p3a, w.p3b]))
    for (const row of p3Rows) expect(row.slots).toEqual(['lead'])
    // 1358-C5 (1358-F4; 1358-D check 2): r4 compared the weeks with `<=`, which always held, and its
    // comment called P3b "strictly later". P3b is greenlit in P3a's own week, right after the cancel, so
    // both rows carry that week and the append-only log holds P3a's row first.
    expect(w.afterP3b.market.tick).toBe(w.afterP3a.market.tick) // route premise: no tick between P3a and P3b
    expect(p3Rows.map((row) => row.productionId)).toEqual([w.p3a, w.p3b])
    for (const row of p3Rows) expect(row.week).toBe(w.afterP3a.market.tick)
  }, 60_000) // 1356-F5: vitest cannot stop a synchronous body, so this timeout is not a budget

  it('the row count never exceeds sharedCompetitions for ANY edge in the final world (in this route, always exactly equal)', () => {
    const w = competitionsLogWorld()
    for (const edge of w.afterP3b.relationships as unknown as EdgeWithLog[]) {
      expect(edge.competitions.length).toBeLessThanOrEqual(edge.sharedCompetitions)
      expect(edge.competitions.length).toBe(edge.sharedCompetitions) // this route's own invariant: one row per counted competition
    }
  }, 60_000) // 1356-F5: vitest cannot stop a synchronous body, so this timeout is not a budget

  it('no RNG draw: rngState is unchanged by the P3a greenlight\'s minting (the existing recordCastingCompetition contract, unaffected by the new log field)', () => {
    const w = competitionsLogWorld()
    expect(w.rngAfterP3a).toEqual(w.rngBeforeP3a)
  })

  it('cross-check: pair (a,b) with sharedCompetitions=3 (P2 dedup + P3a + P3b) reports conflict evidence, independent of the log field [control: existing D-1312-1 arithmetic, unaffected by the log]', () => {
    const w = competitionsLogWorld()
    const [a, b] = w.market.actors
    const edge = edgeOf(w.afterP3b, a, b)!
    expect(edge.sharedCompetitions).toBe(RELATIONSHIP_CONFLICT_COMPETITIONS)
    expect(hasConflictEvidence(edge)).toBe(true)
  }, 60_000) // 1356-F5: vitest cannot stop a synchronous body, so this timeout is not a budget

  it('a log row survives after its driver folds out of recent: each row keeps its week, production and slots (1347-A:13, :33)', () => {
    // 1358-C5 (1358-F4 note 10): the log exists because `recent` keeps only the last eight drivers.
    const w = competitionsLogWorld()
    const [a, b, c] = w.market.actors
    const before = edgeOf(w.afterP3b, a, b)!
    assert.ok(before, 'route premise: pair (a,b) never formed an edge')
    expect(before.competitions.length).toBe(3) // P2, P3a and P3b
    // Five later shared takes add 1 + 2 + 2 + 2 + 2 drivers (the accelerator starts at the second), so
    // every competition driver on (a,b) folds out of `recent`, which keeps eight.
    let s = w.afterP3b
    for (let n = 1; n <= 5; n++) {
      const take = { id: `log-survives-take-${String(n)}`, directorId: w.market.director, cast: { lead: a, antagonist: b, support: c } } as unknown as Production
      s = advanceRelationshipsWeek(s, { takes: [{ studioId: s.hollywood!.playerStudioId, production: take }], releases: [] }, w.afterP3b.market.tick + n)
    }
    const after = edgeOf(s, a, b)!
    assert.ok(after.recent.every((driver) => driver.kind !== 'castingCompetitionLost' && driver.kind !== 'repeatedCompetition'),
      'route premise: every competition driver on (a,b) has folded out of recent')
    expect(after.sharedCompetitions).toBe(3) // the counter keeps only the count (1347-A:13)
    expect(after.competitions).toEqual(before.competitions) // the log keeps each date and slot
  }, 60_000) // 1356-F5: vitest cannot stop a synchronous body, so this timeout is not a budget
})
