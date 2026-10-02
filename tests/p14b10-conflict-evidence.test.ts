// Record 1348-C — independent-test-engineer RED for P14B relationship rulings SLICE A, item 1
// (tier law v2 with conflict evidence) and item 2 (D5, Amendment 2: shipped order unchanged) and
// item 4 (negative D-1312-1 cases). Authored on a scratch tree (1327-C method) at BASE
// f5b2ab92651d10e33c58f3f628b5d6eca3e96ca8, branch wip/headless-program-20260916-ts.
//
// REVISION 1348-C2 (review 1348-D returned REFINE; parent response 1348-F): (1) fixed the D1
// roster predicate citation from talentMarket.ts:894-900 (wrong range, D2/D6/D7 descriptors) to
// the actual :867-874 (non-blocking note); (2) added a settlement-level D5 leaf reusing the real
// `bandsFor` — see the D5 SCOPE NOTE below for where it landed and why. No other line in this
// file's assertions changed.
//
// AUTHORITY (read in full before use):
//   docs/engineering/playability-launch-review/evidence/p14b4-20260919/1340-O-owner-rulings-20260929.md
//     (D-1312-1, :59-67; HIS-014, :80-90)
//   docs/.../1342-O-owner-rulings-p14-p18-approved.txt item 8 (:83-95, friend/enemy precedence)
//   docs/.../1347-A-p14b-relationship-rulings-charter.md §2.1-2.2 (:29-41), §3 (:78), §5
//   docs/.../1347-B-relationship-charter-review.md (blocking defect 2, D5)
//   docs/.../1347-F-parent-relationship-charter-adoption.md Amendment 2 (:27-43): "The parent's
//     decision is to change nothing in D5 ... D5 applies its existing order to the reachable
//     tiers ... with both on the roster, D5 reads `close ties here` (2) ... with only an enemy,
//     `enemies here` (0)." This supersedes 1347-A's own "enemies here wins" §5 test line.
//
// PARENT API DECISIONS UNDER TEST (brief-1348-rel-sliceA-red.md):
//   src/core/relationships.ts: RELATIONSHIP_RULES_VERSION = 2 (was 1); new
//   RELATIONSHIP_CONFLICT_COMPETITIONS = 3; currentTier(edge: Pick<RelationshipEdge,
//   'closeness'|'lastEventWeek'|'sharedCompetitions'>, week); new hasConflictEvidence(edge:
//   Pick<RelationshipEdge, 'sharedCompetitions'>): boolean.
//
// RED MECHANISM (memory: "RED-first tests import from a missing module — vite binds a missing
// NAMED export of an EXISTING module to `undefined`, not a resolution error"). `relationships.ts`
// already exists (unlike a brand-new module), so `RELATIONSHIP_CONFLICT_COMPETITIONS` and
// `hasConflictEvidence` import successfully as bindings but resolve to `undefined` at HEAD
// f5b2ab92. The FIRST test below asserts `typeof hasConflictEvidence === 'function'` and the
// exact value of `RELATIONSHIP_CONFLICT_COMPETITIONS` BEFORE any other leaf calls them, so a
// partially-implemented module can never turn a later leaf green by accident (undefined() throws
// TypeError, never a silent pass, but the constant/typeof checks catch it one step earlier and
// name the reason precisely). `currentTier` and `RELATIONSHIP_RULES_VERSION` already exist at
// HEAD (V1 values) — their RED is behavioral, checked by direct value/output assertions, never
// existence alone.
//
// CONTROL LEAVES (explicitly not RED): several assertions below already hold on UNCHANGED source
// because V1's `tierOf` already redirects EVERY value in the Enemies/Nemeses band to Strained
// unconditionally (relationships.ts:152-155, current HEAD) — so "1 or 2 competitions still read
// Strained", "flops/cancellations alone never read Enemies", and the real 3-competition driver
// arithmetic (unrelated to the evidence gate; recordCastingCompetition is untouched by slice A)
// are already true today. These are marked `redStatus: 'control-passes'` in the classification
// JSON and are kept as regression guards, not as claims of new behavior.
//
// STAGED EDGES (I3-style IN-MEMORY / reader-admitted, validator-checked variant, the p14b5
// `stagedEdge`/`live` precedent, tests/p14b5-relationships.test.ts:221-228): every edge below is
// either (a) fed directly to the pure functions `currentTier`/`currentCloseness`/`hasConflictEvidence`
// with no wrapping state at all, or (b) spliced into a genuinely-generated `p13aGeneratedStudio()`
// world and passed through the LIVE validator (`makeSave`) before any D5 read, exactly as
// tests/p14b5-relationships.test.ts's `stage()`/`live()` helpers do. No edge here claims to have
// been minted by a real event unless explicitly built through one (the "3 real competitions"
// leaf below IS built through the real `recordCastingCompetition` route, no staging).
//
// D5 SCOPE NOTE (revised in 1348-C2 per review 1348-D blocking defect 2 and parent response
// 1348-F item 2): `bandsFor`'s descriptor combinator (talentMarket.ts:911-918) is PRIVATE
// (unexported). 1348-D correctly flagged that the `d5Band()` helper below, a hand-copied literal
// of that ternary, verifies only a frozen snapshot of the ternary TEXT, never the live function —
// acceptable as a targeted `tiersOnRoster` exercise (the exact, exported "D5 / reservation read",
// relationships.ts:410-412 docstring) with a REAL D1 roster (the identical `startWeek < W &&
// (endedWeek === null || W < endedWeek)` predicate, quoted from talentMarket.ts:867-874,
// re-derived here rather than imported since `rosterAt` is private there too), but NOT a
// substitute for exercising the real, live `bandsFor` through an actual settlement. Per the
// parent response, that settlement-level leaf now exists at
// tests/p14b5-relationships.test.ts, describe block "family 6b — D5 SETTLEMENT-LEVEL through the
// real bandsFor" (reusing that file's own `f6Base()`/`settlementAt208()` apparatus; PLAYER issuer
// only — r01's own roster for the subject is genuinely empty in that fixture, measured and
// documented there). The `d5Band()` leaves below are KEPT, explicitly as documentation/unit-level
// coverage of `tiersOnRoster` for both a player AND a rival issuer (the settlement-level leaf
// covers player only) — not as the evidence for "D5's shipped order is unchanged" anymore.
//
// SLICE A EXCLUSIONS (out of scope here; nothing from slice B): no romance, no Professional
// Rivals, no `competitions` log, no Save44, no projection change (1347-F Addendum: "slice A
// publishes nothing new").

import assert from 'node:assert/strict'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import { makeSave } from '../src/core/save.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { fund } from './helpers/p14b2-fixtures.js'
import { TUNING } from '../src/core/tuning.js'
import type { CastingSlate, CastSlot, GameState, RelationshipEdge, RelationshipTier } from '../src/core/types.js'
// RED (see header): `RELATIONSHIP_CONFLICT_COMPETITIONS` and `hasConflictEvidence` are absent
// from src/core/relationships.ts at BASE f5b2ab92 (bind to `undefined`, an EXISTING module).
// `RELATIONSHIP_RULES_VERSION` exists (value 1); `currentTier`/`tiersOnRoster`/`currentCloseness`
// exist and are called directly — every RED here is a value/behavioral assertion.
import {
  RELATIONSHIP_BASELINE, RELATIONSHIP_CONFLICT_COMPETITIONS, RELATIONSHIP_DRIFT_GRACE_WEEKS,
  RELATIONSHIP_DRIFT_RETURN_WEEKS, RELATIONSHIP_RULES_VERSION, RELATIONSHIP_TIER_FLOOR,
  currentCloseness, currentTier, hasConflictEvidence, tiersOnRoster,
} from '../src/core/relationships.js'

const floor = (tier: RelationshipTier): number => (RELATIONSHIP_TIER_FLOOR as Record<RelationshipTier, number>)[tier]
const canon = (x: string, y: string): readonly [string, string] => (x < y ? [x, y] : [y, x])

/** A STAGED (reader-admitted) edge — never a claim that any engine event minted it (I3 pattern,
 * tests/p14b5-relationships.test.ts:220-227). `index` must be unique across edges placed in the
 * SAME state (the live validator requires the ordinal `relationship-edge-<index>` id). */
function stagedEdge(index: number, x: string, y: string, closeness: number, lastEventWeek: number,
  extra: Partial<RelationshipEdge> = {}): RelationshipEdge {
  const [a, b] = canon(x, y)
  return {
    edgeId: `relationship-edge-${String(index)}`, a, b, closeness, firstSharedWeek: lastEventWeek, lastEventWeek,
    sharedProductions: 1, sharedSuccesses: 0, sharedFailures: 0, sharedCancellations: 0, sharedCompetitions: 0,
    peakTier: 'Acquaintances', peakTierWeek: lastEventWeek,
    recent: [{ kind: 'sharedProduction', week: lastEventWeek, ref: 'staged-production', delta: 2 }],
    // 1358-N S6: Save44 gives every edge an empty log and a null romance (convertV43ToV44).
    competitions: [], romance: null,
    ...extra,
  }
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('P14B10 T1 — the new bindings exist (RED at behavior, never a vacuous undefined pass)', () => {
  it('hasConflictEvidence is a function and RELATIONSHIP_CONFLICT_COMPETITIONS is the Owner\'s named 3', () => {
    // Owner ruling D-1312-1 (1340-O:59-63): "Choose repeated competition: initially three..."
    expect(typeof hasConflictEvidence).toBe('function')
    expect(RELATIONSHIP_CONFLICT_COMPETITIONS).toBe(3)
    expect(typeof currentTier).toBe('function')
    expect(typeof tiersOnRoster).toBe('function')
  })

  it('RELATIONSHIP_RULES_VERSION moves to 2 (1347-A §3:86, "RELATIONSHIP_RULES_VERSION moves to 2")', () => {
    expect(RELATIONSHIP_RULES_VERSION).toBe(2)
  })
})

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('tier law v2 — conflict evidence gates Enemies/Nemeses (1347-A §2.2, 1347-F unchanged)', () => {
  it('hasConflictEvidence is exactly sharedCompetitions >= RELATIONSHIP_CONFLICT_COMPETITIONS (boundary at 2 vs 3)', () => {
    expect(hasConflictEvidence({ sharedCompetitions: 0 })).toBe(false)
    expect(hasConflictEvidence({ sharedCompetitions: RELATIONSHIP_CONFLICT_COMPETITIONS - 1 })).toBe(false)
    expect(hasConflictEvidence({ sharedCompetitions: RELATIONSHIP_CONFLICT_COMPETITIONS })).toBe(true)
    expect(hasConflictEvidence({ sharedCompetitions: RELATIONSHIP_CONFLICT_COMPETITIONS + 5 })).toBe(true)
  })

  it('one competition in the Enemies band reads Strained [control: already true at V1 — every Enemies/Nemeses value redirects unconditionally]', () => {
    const edge = stagedEdge(0, 'p-a', 'p-b', floor('Enemies'), 10, { sharedCompetitions: 1 })
    expect(currentTier(edge, 10)).toBe('Strained')
  })

  it('two competitions in the Enemies band reads Strained [control: already true at V1]', () => {
    const edge = stagedEdge(0, 'p-a', 'p-b', floor('Enemies'), 10, { sharedCompetitions: 2 })
    expect(currentTier(edge, 10)).toBe('Strained')
  })

  it('three competitions (the Owner\'s named threshold) in the Enemies band reads Enemies [RED: V1 always reads Strained here]', () => {
    const edge = stagedEdge(0, 'p-a', 'p-b', floor('Enemies'), 10, { sharedCompetitions: 3 })
    expect(hasConflictEvidence(edge)).toBe(true)
    expect(currentTier(edge, 10)).toBe('Enemies')
  })

  it('three competitions with closeness at or below 10 reads Nemeses [RED: V1 always reads Strained here]', () => {
    const edge = stagedEdge(0, 'p-a', 'p-b', 10, 10, { sharedCompetitions: 3 })
    expect(currentTier(edge, 10)).toBe('Nemeses')
    const zero = stagedEdge(1, 'p-a', 'p-b', 0, 10, { sharedCompetitions: 4 })
    expect(currentTier(zero, 10)).toBe('Nemeses')
  })

  it('a pair with only flops/cancellations (no competitions) never reads Enemies, whatever the closeness [control: already true at V1]', () => {
    const edge = stagedEdge(0, 'p-a', 'p-b', floor('Enemies'), 10, { sharedCompetitions: 0, sharedFailures: 5, sharedCancellations: 2 })
    expect(currentTier(edge, 10)).toBe('Strained')
    const nemesesBand = stagedEdge(1, 'p-a', 'p-b', 5, 10, { sharedCompetitions: 0, sharedFailures: 5 })
    expect(currentTier(nemesesBand, 10)).toBe('Strained')
  })

  it('a pair with only flops/cancellations reports no conflict evidence [RED: hasConflictEvidence does not exist at BASE]', () => {
    const edge = stagedEdge(0, 'p-a', 'p-b', floor('Enemies'), 10, { sharedCompetitions: 0, sharedFailures: 5, sharedCancellations: 2 })
    expect(hasConflictEvidence(edge)).toBe(false)
  })

  it('evidence never moves closeness: two edges differing ONLY in sharedCompetitions read the identical currentCloseness at every week [control: currentCloseness\'s own Pick type never reads sharedCompetitions]', () => {
    const noEvidence = stagedEdge(0, 'p-a', 'p-b', floor('Enemies'), 10, { sharedCompetitions: 0 })
    const withEvidence = stagedEdge(1, 'p-a', 'p-b', floor('Enemies'), 10, { sharedCompetitions: 5 })
    for (const week of [10, 60, 150, 400]) {
      expect(currentCloseness(withEvidence, week)).toBe(currentCloseness(noEvidence, week))
    }
  })

  it('recovery through positive drivers still works: closeness at a positive band reads its true tier regardless of evidence [control: already true at V1]', () => {
    const recovered = stagedEdge(0, 'p-a', 'p-b', floor('Colleagues'), 10, { sharedCompetitions: 5 })
    expect(currentTier(recovered, 10)).toBe('Colleagues')
  })

  it('recovery keeps the evidence counter itself [RED: hasConflictEvidence does not exist at BASE]', () => {
    const recovered = stagedEdge(0, 'p-a', 'p-b', floor('Colleagues'), 10, { sharedCompetitions: 5 })
    expect(hasConflictEvidence(recovered)).toBe(true) // evidence kept, never erased by recovery
  })

  it('drift to Acquaintances at baseline still works with evidence kept [RED: at week 10 this pair reads Enemies under v2, never under v1]', () => {
    const lastEventWeek = 100
    const edge = stagedEdge(0, 'p-a', 'p-b', floor('Enemies'), lastEventWeek, { sharedCompetitions: 3 })
    // premise: at the anchor week this pair is genuinely in the Enemies band with evidence (RED under v1).
    expect(currentTier(edge, lastEventWeek)).toBe('Enemies')
    const driftedWeek = lastEventWeek + RELATIONSHIP_DRIFT_GRACE_WEEKS + RELATIONSHIP_DRIFT_RETURN_WEEKS
    expect(currentCloseness(edge, driftedWeek)).toBe(RELATIONSHIP_BASELINE) // full return to baseline
    expect(currentTier(edge, driftedWeek)).toBe('Acquaintances')
    expect(hasConflictEvidence(edge)).toBe(true) // the evidence counter itself never decays
  })

  it('tiers read current closeness, never peakTier: a pair that peaked Inseparable and is now Enemies (with evidence) reads Enemies [RED under v1]', () => {
    const edge = stagedEdge(0, 'p-a', 'p-b', floor('Enemies'), 10, { sharedCompetitions: 3, peakTier: 'Inseparable', peakTierWeek: 1 })
    expect(currentTier(edge, 10)).toBe('Enemies')
  })
})

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
// A minimal REAL casting-competition route (not staged): one pair (a,b) reaches sharedCompetitions
// = 3 through the genuine, UNCHANGED `recordCastingCompetition` write path (relationships.ts:363-406),
// via one script/casting cycle greenlit three times (cancel + re-greenlight against the same
// still-complete session twice, 1313-F Amendment 3). This is the pattern p14b9's `castingCompetitionWorld`
// establishes, trimmed to the ONE pair this leaf needs. MEASURED on this scratch tree (dry run,
// scratchpad probe1348b, not archived in the real repo): closeness lands at 38 (Strained band,
// UNCHANGED by slice A — 38 needs no evidence gate to read Strained), sharedCompetitions = 3,
// `recent` holds exactly 3 `castingCompetitionLost` rows (-3 each) and 2 `repeatedCompetition` rows
// (-1 at the 2nd competition, -2 at the 3rd, `min(n-1, RELATIONSHIP_COMPETITION_REPEAT_CAP=2)`) —
// no extra driver kind, no extra row, nothing applied twice. This leaf is a CONTROL: it already
// passes at RED (recordCastingCompetition is untouched by slice A) and is kept as the regression
// guard for "the third competition applies exactly the existing drivers and no more."
const SEED = 'r1314-casting-01'
const STAGE = 'facility-soundstage-07'
const SHAPE = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const
const RANGES = { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] }
type Market = { writer: string; director: string; craft: string; actors: readonly string[] }
function deriveMarket(s: GameState): Market {
  const market = hiringMarketIds(s, 0)
  const byRole = (role: string) => market.filter((id) => s.talent.find((t) => t.id === id)?.role === role)
  const writer = byRole('writer')[0], director = byRole('director')[0], craft = byRole('craft')[0], actors = byRole('actor')
  assert.ok(writer && director && craft && actors.length >= 3, `route premise failed: seed "${SEED}" week-0 market lacks a writer/director/craft/3 actors`)
  return { writer, director, craft, actors }
}
function foundStudio(): { state: GameState; market: Market } {
  let s = fund(p13aGeneratedStudio(SEED))
  const market = deriveMarket(s)
  for (const id of [market.writer, market.director, market.craft, ...market.actors.slice(0, 3)]) {
    s = applyActions(s, [{ kind: 'signContract', talentId: id, termWeeks: 208 }])
  }
  const mounted = s.sets.find((x) => x.mountedOn === STAGE && x.status !== 'retired')
  if (mounted !== undefined) s = applyActions(s, [{ kind: 'strikeSet', setId: mounted.id }])
  s = applyActions(s, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE } }])
  s = advanceTo(s, TUNING.SET_BUILD_WEEKS_BAND_HIGH)
  s = applyActions(s, [{ kind: 'activateScriptDevelopment' }, { kind: 'activateCastingSessions' }])
  return { state: s, market }
}
function greenlightCycle(input: GameState, market: Market, conceptIndex: number, slate: CastingSlate | null,
  cast: Record<CastSlot, string>, reuseProjectId?: string): { state: GameState; productionId: string; projectId: string } {
  let s = input, projectId = reuseProjectId
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
  s = applyActions(s, [{ kind: 'greenlightScriptProject', production: { projectId, directorId: market.director, craftIds: [market.craft], cast, budget: { negative: concept.baseNegativeCost, marketing: 0 } } }])
  const productionId = s.studio.activeProductions.at(-1)!.id
  return { state: s, productionId, projectId }
}
function edgeOf(s: GameState, x: string, y: string) {
  return s.relationships.find((e) => (e.a === x && e.b === y) || (e.a === y && e.b === x))
}
let castingWorld: { state: GameState; a: string; b: string } | undefined
function threeRealCompetitions() {
  if (castingWorld === undefined) {
    const { state: s0, market } = foundStudio()
    const [a, b, c] = market.actors as [string, string, string]
    const slate: CastingSlate = { lead: [a, b], antagonist: [b, c], support: [c, a] }
    const g1 = greenlightCycle(s0, market, 0, slate, { lead: a, antagonist: b, support: c })
    let s = fund(applyActions(g1.state, [{ kind: 'cancel', productionId: g1.productionId }]))
    const g2 = greenlightCycle(s, market, 0, null, { lead: a, antagonist: b, support: c }, g1.projectId)
    s = fund(applyActions(g2.state, [{ kind: 'cancel', productionId: g2.productionId }]))
    const g3 = greenlightCycle(s, market, 0, null, { lead: a, antagonist: b, support: c }, g1.projectId)
    castingWorld = { state: g3.state, a, b }
  }
  return castingWorld
}

describe('the real casting-competition route reaches genuine evidence with no double-application [control]', () => {
  it('pair (a,b) reaches sharedCompetitions = 3 with exactly the existing drivers (-3, -3+-1, -3+-2) and no extra kind or row', () => {
    const { state, a, b } = threeRealCompetitions()
    const edge = edgeOf(state, a, b)
    assert.ok(edge, 'route premise: pair (a,b) never formed an edge')
    expect(edge.sharedCompetitions).toBe(3)
    expect(edge.sharedProductions).toBe(0) // never seated together — competition-only edge
    expect(edge.closeness).toBe(RELATIONSHIP_BASELINE - 3 - 3 - 1 - 3 - 2)
    const kinds = edge.recent.map((d) => d.kind)
    expect(kinds).toEqual(['castingCompetitionLost', 'castingCompetitionLost', 'repeatedCompetition', 'castingCompetitionLost', 'repeatedCompetition'])
    expect(edge.recent.filter((d) => d.kind === 'castingCompetitionLost').every((d) => d.delta === -3)).toBe(true)
    expect(edge.recent.filter((d) => d.kind === 'repeatedCompetition').map((d) => d.delta)).toEqual([-1, -2])
    // 38 (Strained band, floor 31) needs no evidence gate: unchanged by slice A.
    expect(currentTier(edge, state.market.tick)).toBe('Strained')
  }, 60_000)

  it('the real 3-competition pair reports conflict evidence [RED: hasConflictEvidence does not exist at BASE]', () => {
    const { state, a, b } = threeRealCompetitions()
    const edge = edgeOf(state, a, b)
    assert.ok(edge, 'route premise: pair (a,b) never formed an edge')
    expect(hasConflictEvidence(edge)).toBe(true)
  }, 60_000)
})

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
// D5 (1347-F Amendment 2): D5's own combinator code (talentMarket.ts:911-918) does not change.
// This exercises `tiersOnRoster` (the exported D5 read) with a REAL D1 roster for a player and a
// rival issuer, staged relationship edges for the tier signal, and the SHIPPED combinator quoted
// verbatim below (comment cites talentMarket.ts:916-918) — see the file header D5 SCOPE NOTE for
// why this is not a full settlement-receipt test.
describe('D5 — the shipped order is unchanged; evidence merely makes `enemies here` reachable (1347-F Amendment 2)', () => {
  /** talentMarket.ts:867-874's own D1 roster predicate, re-derived (private there). */
  function rosterAt(state: GameState, issuer: string, subject: string, week: number): ReadonlySet<string> {
    const roster = new Set<string>()
    for (const row of state.hollywood!.employment) {
      if (row.studioId !== issuer || row.terms.talentId === subject) continue
      if (row.terms.startWeek < week && (row.endedWeek === null || week < row.endedWeek)) roster.add(row.terms.talentId)
    }
    return roster
  }
  /** talentMarket.ts:916-918, quoted verbatim (never reimplemented judgment): the D5 relationships band. */
  function d5Band(tiers: readonly RelationshipTier[]): 0 | 1 | 2 {
    return tiers.some((t) => t === 'CloseFriends' || t === 'Inseparable') ? 2
      : tiers.some((t) => t === 'Enemies' || t === 'Nemeses') ? 0 : 1
  }

  let world: { state: GameState; subject: string; playerId: string; rivalId: string; closeTie: string; enemy: string; rivalCloseTie: string; rivalEnemy: string; week: number } | undefined
  function d5World() {
    if (world === undefined) {
      let s = fund(p13aGeneratedStudio())
      s = advanceTo(s, 5)
      const week0 = s.market.tick
      const actors = hiringMarketIds(s, week0).map((id) => s.talent.find((t) => t.id === id))
        .filter((t): t is NonNullable<typeof t> => t !== undefined && t.role === 'actor')
      assert.ok(actors.length >= 2, 'D5 fixture premise: at least two free actors at week 5')
      const closeTie = actors[0]!, enemy = actors[1]!
      s = applyActions(s, [{ kind: 'signContract', talentId: closeTie.id, termWeeks: 100 }, { kind: 'signContract', talentId: enemy.id, termWeeks: 100 }])
      s = advanceTo(s, week0 + 1)
      const week = s.market.tick
      const playerId = s.hollywood!.playerStudioId
      const rivalId = s.hollywood!.identities.find((i) => i.studioId !== playerId)!.studioId
      const subject = s.talent.find((t) => t.role === 'writer' && t.id !== closeTie.id && t.id !== enemy.id)!.id
      const rivalRoster = [...rosterAt(s, rivalId, subject, week)]
      assert.ok(rivalRoster.length >= 2, 'D5 fixture premise: at least two pre-existing rival employees')
      const [rivalCloseTie, rivalEnemy] = rivalRoster as [string, string]
      const edges: RelationshipEdge[] = [
        stagedEdge(0, subject, closeTie.id, floor('CloseFriends'), week),
        stagedEdge(1, subject, enemy.id, floor('Enemies'), week, { sharedCompetitions: 3 }),
        stagedEdge(2, subject, rivalCloseTie, floor('CloseFriends'), week),
        stagedEdge(3, subject, rivalEnemy, floor('Enemies'), week, { sharedCompetitions: 3 }),
      ]
      s = { ...s, relationships: edges }
      const validated = makeSave(s)
      world = { state: validated.state as GameState, subject, playerId, rivalId, closeTie: closeTie.id, enemy: enemy.id, rivalCloseTie, rivalEnemy, week }
    }
    return world
  }

  it('a player issuer: both a close tie and an enemy on the roster reads `close ties here` (2) [control: unchanged combinator order]', () => {
    const w = d5World()
    const roster = rosterAt(w.state, w.playerId, w.subject, w.week)
    expect([...roster]).toEqual(expect.arrayContaining([w.closeTie, w.enemy]))
    const tiers = tiersOnRoster(w.state, w.subject, roster, w.week)
    expect(d5Band(tiers)).toBe(2)
  })

  it('a player issuer: only an enemy on the roster reads `enemies here` (0) [RED under v1: no evidence-gated Enemies tier exists yet]', () => {
    const w = d5World()
    const enemyOnlyRoster = new Set([w.enemy])
    const tiers = tiersOnRoster(w.state, w.subject, enemyOnlyRoster, w.week)
    expect(tiers).toEqual(['Enemies']) // RED under v1 (would read ['Strained'])
    expect(d5Band(tiers)).toBe(0)
  })

  it('a rival issuer: both a close tie and an enemy on the roster reads `close ties here` (2) [control: unchanged combinator order]', () => {
    const w = d5World()
    const roster = rosterAt(w.state, w.rivalId, w.subject, w.week)
    expect([...roster]).toEqual(expect.arrayContaining([w.rivalCloseTie, w.rivalEnemy]))
    const tiers = tiersOnRoster(w.state, w.subject, roster, w.week)
    expect(d5Band(tiers)).toBe(2)
  })

  it('a rival issuer: only an enemy on the roster reads `enemies here` (0) [RED under v1]', () => {
    const w = d5World()
    const enemyOnlyRoster = new Set([w.rivalEnemy])
    const tiers = tiersOnRoster(w.state, w.subject, enemyOnlyRoster, w.week)
    expect(tiers).toEqual(['Enemies'])
    expect(d5Band(tiers)).toBe(0)
  })
})
