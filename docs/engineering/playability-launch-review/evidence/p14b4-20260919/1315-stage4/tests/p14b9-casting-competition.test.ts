// Task 1315-C3, mode STAGE RED (test source only). Repo HEAD e65012e5, branch
// wip/headless-program-20260916-ts.
//
// STAGED FILE. Import paths below are written for this file's INTENDED destination,
// `tests/p14b9-casting-competition.test.ts` (one level below repo root, beside every other
// `tests/*.test.ts`) — the same staging convention `tests/p14r3-save-v41.test.ts` documents in
// its own header (physically staged under a `*-stage3/tests/` evidence directory; not executed,
// type-checked, or moved from there by this author). It is physically staged at
// docs/engineering/playability-launch-review/evidence/p14b4-20260919/1315-stage3/tests/.
//
// REVISION 1315-C3: UNCHANGED from `1315-stage2` (`1315-X2-red-r2-dry-run.md` confirms every
// leaf in this file already passes on the parent's Save42 draft — the two remaining 1315-C3
// defects are in `p14b9-casting-expiry.test.ts` and `p14b9-save-v42.test.ts` only). Copied here
// only so the full five-file set is present together in one staged revision.
//
// REVISION 1315-C2 (over the frozen `1315-stage` draft, per `1315-X-red-dry-run.md` defect 1 and
// the queue-admission "also" note): the parent's scratch dry run measured this file's chained
// world running out of cash — cash before each greenlight was 17,557,036 / 12,797,806 /
// 10,458,092 / 6,243,551 (concepts 0-3, weeks 10/12/14/16), and the P3 re-greenlight after cancel
// then met 812,344 against a 5,431,207 commitment, refused by the D-12 solvency gate (a cancel
// refunds nothing). Fix: the house disclosed-cash bootstrap (`tests/helpers/p14b2-fixtures.ts:
// 15-19`, `fund()`: sets `state.studio.cash` to a fixed figure with an EQUAL, disclosed ledger
// entry, "P14B.2 fixture disclosed cash bootstrap") is applied once right after founding (before
// any signing), AND AGAIN after every cancel in this file's chain — a deviation from "once" that
// I am naming explicitly: this file runs SIX greenlights (P1, P2, P-dedup, P3 x2, P-no-session),
// more than the four the dry run measured before it ran out, and 30,000,000 applied only once did
// not, by my own arithmetic against the measured per-production cost (~2.3M-5.4M), leave
// confident headroom for all six. The coordinator's own instruction allows the same repeated
// bootstrap for the copy/readers files "if their chain needs more than one greenlight"; I apply
// that same allowance here, generalized to a six-greenlight chain. No law assertion changed by
// this fix (`fund()` touches only `state.studio.cash`/`state.ledger`, never `state.relationships`
// or any casting-session/production field these tests actually assert on). The queue-admission
// leaf additionally now validates the injected state WHOLE with the live validator
// (`makeSave`+`validateSave`, must not throw) before the `tick()` that admits it, per the
// coordinator's "also" note; the header note below is updated to say explicitly that this
// injection substitutes for genuine front-door contention (unchanged reasoning, restated).
//
// LAW UNDER TEST (read in full before use): 1313-A §1/§4 item 1
// (docs/.../1313-A-casting-drivers-expansion.md), as amended by 1313-F Amendments 1-3 and
// notes 5, 7, 9 (docs/.../1313-F-parent-casting-drivers-adoption.md), independently reviewed by
// 1313-B (required changes 1-4, notes 5-10). This file covers 1315-C required leaves 1 and 2
// (drivers on a generated world through a real casting session and greenlight; no rival edge
// carries either new kind across a bounded natural run).
//
// RED MECHANISM (memory: "RED-first tests import from a missing module — vite binds missing
// named exports to undefined"). `RELATIONSHIP_COMPETITION_DELTA` and
// `RELATIONSHIP_COMPETITION_REPEAT_CAP` do not exist in `src/core/relationships.ts` at HEAD
// d8e90042 (unchanged since 75233cc2 — task 1315-C names these as the required export names, from 1313-A §1's "hypothesis
// 3"/"hypothesis 2"). Both are used in real arithmetic below (never merely imported), so a
// missing binding fails the SPECIFIC assertion that reads it (TypeError from `-undefined` is
// `NaN`, or a direct `typeof` check below), never spuriously passes. Every other symbol imported
// here (`applyActions`, `tick`, `hiringMarketIds`, `p13aGeneratedStudio`, `advanceTo`,
// `queueGreenlightScriptProject`, `gateSlotAvailable`, `currentTier`, `RELATIONSHIP_BASELINE`)
// already exists on the unchanged engine — every route below runs on PUBLIC, ALREADY-LEGAL
// actions; the route itself does not throw, and the RED is entirely in the missing driver kind
// and the missing `sharedCompetitions` field, never in a route failure.
//
// MEASURED ROUTE: 1314-P (docs/.../1314-P-casting-route-probe.ts / .txt) and 1313-F's own
// "Measured route" section. Seed `r1314-casting-01`'s week-0 hiring market holds exactly one
// writer (t-wri-05), one director (t-dir-04), one craft (t-cra-09) and four actors (t-act-24,
// t-act-08, t-act-20, t-act-12) — measured facts, reused here for the SAME seed, but every id
// below is DERIVED from `hiringMarketIds` at runtime (never hardcoded), per the task's "derive
// ids from the market as the producer does, never hardcode a guess the route did not measure."
//
// ROUTE DESIGN (this file's own extension of the measured route, not itself measured — every
// premise below that I could not settle without execution is repeated in the 1315-C handback):
// 1313-F Amendment 1 places the mint SYNCHRONOUSLY inside `applyGreenlight`, so no shoot or
// release is needed to observe it — every production cycle below greenlights, captures the
// state, then immediately CANCELS (freeing the shared director/craft/actor pool for the next
// cycle; `applyCancel` removes the production from `activeProductions` immediately, and a first
// take never exists, so `recordCancelledAfterFirstTake`'s early return applies and mints
// nothing extra — `src/core/actions.ts:618-624`). Four actors (a, b, c, d) support every
// scenario below:
//   P1  (concept 0): slate { lead: [a,d], antagonist: [b,d], support: [a,b] }, cast
//       { lead: a, antagonist: b, support: c }. Lead and antagonist are ON-slate (mint (a,d) and
//       (b,d)); support is OFF-slate (seated c is not a candidate of [a,b]) and mints nothing for
//       that slot. d is never seated in P1 or P2, so it never gains a sharedProduction edge.
//   P2  (concept 1): slate { lead: [a,d], antagonist: [b,c], support: [c,a] }, same cast. Pair
//       (a,d) competes a SECOND time (a different production) — 1313-A's named arithmetic
//       "50 - 3 = 47, then 47 - 3 - 1 = 43" (Strained, never Enemies, since d is never seated
//       against a — sharedProductions stays 0 for this pair). (b,c) and (a,c) are each fresh.
//   P-dedup (concept 2): slate { lead: [a,b], antagonist: [a,b], support: [c,d] }, cast
//       { lead: a, antagonist: b, support: c } — a and b each win one slot from the other
//       (1313-F Amendment 2's own named example), so the SAME canonical pair (a,b) appears in
//       two slots of ONE production; the law records exactly one competition for it here.
//   P3  (concept 3): the canonical 3-pair slate { lead: [a,b], antagonist: [b,c],
//       support: [c,a] }, cast { lead: a, antagonist: b, support: c }. Greenlit, captured,
//       cancelled (no shoot), then re-greenlit against the SAME still-complete casting session
//       (1313-F Amendment 3) — a distinct production id, one more competition per pair.
//   P-no-session (concept 4): a Ready script project that never had a `startCastingSession`
//       call at all, greenlit with the same three actors — the task's "a greenlight with no
//       casting session for its project mints nothing."
// The "queue-admitted greenlight" and "state.hollywood undefined" bullets are each their own
// describe block below, with their own route notes.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { gateSlotAvailable, queueGreenlightScriptProject } from '../src/core/productionQueue.js'
import { makeSave, validateSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { fund } from './helpers/p14b2-fixtures.js'
import type { CastingSlate, CastSlot, GameState } from '../src/core/types.js'
// RED (see header): RELATIONSHIP_COMPETITION_DELTA / RELATIONSHIP_COMPETITION_REPEAT_CAP are
// absent from src/core/relationships.ts at HEAD d8e90042; both are CALLED in arithmetic below.
import { RELATIONSHIP_BASELINE, RELATIONSHIP_COMPETITION_DELTA, RELATIONSHIP_COMPETITION_REPEAT_CAP, currentTier } from '../src/core/relationships.js'

const SEED = 'r1314-casting-01'
const STAGE = 'facility-soundstage-07'
const SHAPE = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const
const RANGES = { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] }

type Market = { writer: string; director: string; craft: string; actors: readonly string[] }

function deriveMarket(s: GameState): Market {
  const market = hiringMarketIds(s, 0)
  const byRole = (role: string) => market.filter((id) => s.talent.find((t) => t.id === id)?.role === role)
  const writer = byRole('writer')[0]
  const director = byRole('director')[0]
  const craft = byRole('craft')[0]
  const actors = byRole('actor')
  if (writer === undefined || director === undefined || craft === undefined || actors.length < 4) {
    throw new Error(
      `route premise failed: seed "${SEED}" week-0 hiring market does not hold a writer, a director, a craft ` +
      `and four actors (1314-P measured exactly this) — got ${JSON.stringify({ writer, director, craft, actors })}`,
    )
  }
  return { writer, director, craft, actors }
}

/** 1314-P's own founding sequence, up to (not including) any script/casting cycle. The house
 * disclosed-cash bootstrap (`fund()`) is applied once, right here, right after founding and
 * before any signing bonus is debited (1315-C2 revision, defect 1). */
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

/** One managed script -> (optional casting session) -> greenlight cycle, stopping immediately
 * after greenlight. The mint is synchronous at greenlight (1313-F Amendment 1), so no shoot or
 * release is needed to observe it. `slate: null` skips `startCastingSession` entirely (the
 * "no casting session" scenario). */
function greenlightCycle(
  s: GameState, market: Market, conceptIndex: number, slate: CastingSlate | null, cast: Record<CastSlot, string>,
): { before: GameState; after: GameState; productionId: string; projectId: string } {
  const concept = s.concepts[conceptIndex]!
  s = applyActions(s, [{
    kind: 'commissionScript',
    project: { conceptId: concept.id, writerId: market.writer, shape: SHAPE, promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: RANGES } },
  }])
  const projectId = s.scriptDevelopment.projects.at(-1)!.id
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
  const before = s
  s = applyActions(s, [{
    kind: 'greenlightScriptProject',
    production: { projectId, directorId: market.director, craftIds: [market.craft], cast, budget: { negative: concept.baseNegativeCost, marketing: 0 } },
  }])
  const productionId = s.studio.activeProductions.at(-1)!.id
  return { before, after: s, productionId, projectId }
}

function cancelProduction(s: GameState, productionId: string): GameState {
  return applyActions(s, [{ kind: 'cancel', productionId }])
}

/** Cancel, then re-apply the house disclosed-cash bootstrap (1315-C2 revision, defect 1): a
 * cancel refunds nothing, and this file's chain runs six greenlights, so every cycle starts
 * funded again rather than draining across the whole chain. */
function cancelAndRefund(s: GameState, productionId: string): GameState {
  return fund(cancelProduction(s, productionId))
}

function edgeOf(s: GameState, x: string, y: string) {
  return s.relationships.find((e) => (e.a === x && e.b === y) || (e.a === y && e.b === x))
}
function driversOf(s: GameState, x: string, y: string, kind: string) {
  return (edgeOf(s, x, y)?.recent ?? []).filter((d) => d.kind === kind)
}

type World = {
  market: Market
  afterP1: GameState; p1: string
  afterP2: GameState; p2: string
  beforeDedup: GameState; afterDedup: GameState; pDedup: string
  afterP3a: GameState; p3a: string
  afterP3b: GameState; p3b: string
  beforeNoSession: GameState; afterNoSession: GameState; pNoSession: string
  rngBeforeP1Greenlight: unknown; rngAfterP1Greenlight: unknown
}

let cachedWorld: World | null = null

/** Builds the whole chained route ONCE (memo cache — task instruction "keep memo caches for
 * expensive routes"); every `it()` below reads a `structuredClone` of the cached result so no
 * test can mutate another's fixture. ~6 script/casting cycles, each bounded at 30 ticks to
 * reach review (measured: script review at week 9, casting review at week 10 for the FIRST
 * cycle on this seed — later cycles are NOT separately measured and use the same bounded
 * tick-until-condition loop `1314-P` itself uses, not a fixed week count). */
function castingCompetitionWorld(): World {
  if (cachedWorld !== null) return structuredClone(cachedWorld)
  const { state: s0, market } = foundStudio()
  const [a, b, c, d] = market.actors as [string, string, string, string]

  // P1 — off-slate support slot + a fourth actor (d) who loses every slot it is a candidate
  // for and is never seated (1313-A §4 item 1).
  const p1Slate: CastingSlate = { lead: [a, d], antagonist: [b, d], support: [a, b] }
  const p1 = greenlightCycle(s0, market, 0, p1Slate, { lead: a, antagonist: b, support: c })
  let s = cancelAndRefund(p1.after, p1.productionId)

  // P2 — pair (a,d) competes again on a distinct production (1313-A's named 50->47->43).
  const p2Slate: CastingSlate = { lead: [a, d], antagonist: [b, c], support: [c, a] }
  const p2 = greenlightCycle(s, market, 1, p2Slate, { lead: a, antagonist: b, support: c })
  s = cancelAndRefund(p2.after, p2.productionId)

  // P-dedup — the SAME pair (a,b) named in two slots of ONE production, each winning one slot
  // from the other (1313-F Amendment 2's own example).
  const dedupSlate: CastingSlate = { lead: [a, b], antagonist: [a, b], support: [c, d] }
  const beforeDedup = s
  const pDedup = greenlightCycle(s, market, 2, dedupSlate, { lead: a, antagonist: b, support: c })
  s = cancelAndRefund(pDedup.after, pDedup.productionId)

  // P3 — greenlight, cancel (no shoot, no first take), re-greenlight the SAME still-complete
  // casting session (1313-F Amendment 3). Funded again between the two greenlights too: a
  // cancel refunds nothing, and the second greenlight commits the SAME concept budget again.
  const p3Slate: CastingSlate = { lead: [a, b], antagonist: [b, c], support: [c, a] }
  const p3a = greenlightCycle(s, market, 3, p3Slate, { lead: a, antagonist: b, support: c })
  const afterP3aCancel = fund(cancelProduction(p3a.after, p3a.productionId))
  const concept3 = afterP3aCancel.concepts[3]!
  const p3bAfter = applyActions(afterP3aCancel, [{
    kind: 'greenlightScriptProject',
    production: {
      projectId: p3a.projectId, directorId: market.director, craftIds: [market.craft],
      cast: { lead: a, antagonist: b, support: c }, budget: { negative: concept3.baseNegativeCost, marketing: 0 },
    },
  }])
  const p3b = p3bAfter.studio.activeProductions.at(-1)!.id
  s = cancelAndRefund(p3bAfter, p3b)

  // P-no-session — a Ready script project that never had a casting session at all.
  const beforeNoSession = s
  const pNoSession = greenlightCycle(s, market, 4, null, { lead: a, antagonist: b, support: c })
  s = cancelAndRefund(pNoSession.after, pNoSession.productionId)

  const world: World = {
    market,
    afterP1: p1.after, p1: p1.productionId,
    afterP2: p2.after, p2: p2.productionId,
    beforeDedup, afterDedup: pDedup.after, pDedup: pDedup.productionId,
    afterP3a: p3a.after, p3a: p3a.productionId,
    afterP3b: p3bAfter, p3b,
    beforeNoSession, afterNoSession: pNoSession.after, pNoSession: pNoSession.productionId,
    rngBeforeP1Greenlight: p1.before.rngState, rngAfterP1Greenlight: p1.after.rngState,
  }
  cachedWorld = world
  return structuredClone(world)
}

describe('1313-A/F casting-competition drivers — a generated world through a real casting session and greenlight', () => {
  it('the named law constants bind to real numbers (RED gate: a missing named export binds to undefined under vite)', () => {
    expect(typeof RELATIONSHIP_COMPETITION_DELTA).toBe('number')
    expect(typeof RELATIONSHIP_COMPETITION_REPEAT_CAP).toBe('number')
  })

  it('P1: lead and antagonist each mint one castingCompetitionLost driver on the right pair, ref = the production id, delta = -RELATIONSHIP_COMPETITION_DELTA through driverGain (identity today)', () => {
    const w = castingCompetitionWorld()
    const [a, b, , d] = w.market.actors
    const leadDriver = driversOf(w.afterP1, a, d, 'castingCompetitionLost')
    expect(leadDriver).toHaveLength(1)
    expect(leadDriver[0]).toMatchObject({ ref: w.p1, delta: -RELATIONSHIP_COMPETITION_DELTA })
    const antagonistDriver = driversOf(w.afterP1, b, d, 'castingCompetitionLost')
    expect(antagonistDriver).toHaveLength(1)
    expect(antagonistDriver[0]).toMatchObject({ ref: w.p1, delta: -RELATIONSHIP_COMPETITION_DELTA })
  }, 60_000)

  it('P1: the off-slate support slot (seated c, candidates [a,b]) mints nothing for that slot', () => {
    const w = castingCompetitionWorld()
    const [a, b, c] = w.market.actors
    expect(driversOf(w.afterP1, a, c, 'castingCompetitionLost').filter((dr) => dr.ref === w.p1)).toHaveLength(0)
    expect(driversOf(w.afterP1, b, c, 'castingCompetitionLost').filter((dr) => dr.ref === w.p1)).toHaveLength(0)
  })

  it('P1: a competition-only edge is created with sharedProductions 0, sharedCompetitions 1, firstSharedWeek = the greenlight week', () => {
    const w = castingCompetitionWorld()
    const [a, , , d] = w.market.actors
    const edge = edgeOf(w.afterP1, a, d)!
    expect(edge).toBeDefined()
    expect(edge.sharedProductions).toBe(0)
    // RED: `sharedCompetitions` is not a field of RelationshipEdge yet (1313-A §3).
    expect((edge as unknown as { sharedCompetitions: number }).sharedCompetitions).toBe(1)
    expect(edge.firstSharedWeek).toBe(w.afterP1.market.tick)
  })

  it('P2: pair (a,d) competes a second time on a different production — repeatedCompetition, delta = -min(n-1, RELATIONSHIP_COMPETITION_REPEAT_CAP); the pair never shares a production and reaches Strained (1313-A: "50 - 3 = 47, then 47 - 3 - 1 = 43")', () => {
    const w = castingCompetitionWorld()
    const [a, , , d] = w.market.actors
    const edge = edgeOf(w.afterP2, a, d)!
    expect(edge.sharedProductions).toBe(0) // d is never seated across P1 or P2
    expect((edge as unknown as { sharedCompetitions: number }).sharedCompetitions).toBe(2)
    const losses = driversOf(w.afterP2, a, d, 'castingCompetitionLost')
    expect(losses).toHaveLength(2)
    expect(new Set(losses.map((l) => l.ref))).toEqual(new Set([w.p1, w.p2]))
    const repeats = driversOf(w.afterP2, a, d, 'repeatedCompetition')
    expect(repeats).toHaveLength(1)
    expect(repeats[0]).toMatchObject({ ref: w.p2, delta: -Math.min(2 - 1, RELATIONSHIP_COMPETITION_REPEAT_CAP) })
    const expectedCloseness = RELATIONSHIP_BASELINE - RELATIONSHIP_COMPETITION_DELTA - RELATIONSHIP_COMPETITION_DELTA - Math.min(1, RELATIONSHIP_COMPETITION_REPEAT_CAP)
    expect(edge.closeness).toBe(expectedCloseness)
    expect(currentTier(edge, w.afterP2.market.tick)).toBe('Strained')
  })

  it('P2: (b,c) and (a,c) are each fresh competition-only edges', () => {
    const w = castingCompetitionWorld()
    const [a, b, c] = w.market.actors
    const bc = edgeOf(w.afterP2, b, c)!
    expect(bc.sharedProductions).toBe(0)
    expect((bc as unknown as { sharedCompetitions: number }).sharedCompetitions).toBe(1)
    const ac = edgeOf(w.afterP2, a, c)!
    expect(ac.sharedProductions).toBe(0)
    expect((ac as unknown as { sharedCompetitions: number }).sharedCompetitions).toBe(1)
  })

  it('P-dedup: a slate naming the same pair in two slots (each winning one from the other) records ONE competition for that production, not two (1313-F Amendment 2)', () => {
    const w = castingCompetitionWorld()
    const [a, b] = w.market.actors
    const beforeCount = (edgeOf(w.beforeDedup, a, b) as unknown as { sharedCompetitions: number } | undefined)?.sharedCompetitions ?? 0
    const after = edgeOf(w.afterDedup, a, b)!
    expect((after as unknown as { sharedCompetitions: number }).sharedCompetitions).toBe(beforeCount + 1)
    const thisProduction = driversOf(w.afterDedup, a, b, 'castingCompetitionLost').filter((dr) => dr.ref === w.pDedup)
    expect(thisProduction).toHaveLength(1)
  })

  it('P3: a re-greenlight after a cancel mints again under the new production id (1313-F Amendment 3) — no first take exists at the cancel, so recordCancelledAfterFirstTake mints nothing extra there', () => {
    const w = castingCompetitionWorld()
    const [a, b] = w.market.actors
    expect(w.p3a).not.toBe(w.p3b)
    const afterFirst = (edgeOf(w.afterP3a, a, b) as unknown as { sharedCompetitions: number }).sharedCompetitions
    const afterSecond = (edgeOf(w.afterP3b, a, b) as unknown as { sharedCompetitions: number }).sharedCompetitions
    expect(afterSecond).toBe(afterFirst + 1)
    const losses = driversOf(w.afterP3b, a, b, 'castingCompetitionLost')
    expect(losses.some((l) => l.ref === w.p3a)).toBe(true)
    expect(losses.some((l) => l.ref === w.p3b)).toBe(true)
  })

  it('P-no-session: a greenlight for a project with no casting session mints nothing for any of its seated pairs', () => {
    const w = castingCompetitionWorld()
    const [a, b, c] = w.market.actors
    for (const [x, y] of [[a, b], [b, c], [a, c]] as const) {
      const before = (edgeOf(w.beforeNoSession, x, y) as unknown as { sharedCompetitions: number } | undefined)?.sharedCompetitions ?? 0
      const after = (edgeOf(w.afterNoSession, x, y) as unknown as { sharedCompetitions: number } | undefined)?.sharedCompetitions ?? 0
      expect(after).toBe(before)
      expect(driversOf(w.afterNoSession, x, y, 'castingCompetitionLost').some((dr) => dr.ref === w.pNoSession)).toBe(false)
    }
  })

  it('rngState is unchanged by the greenlight\'s minting (regression pin — driverGain is identity and no RNG stream exists today, so this is ALREADY true before the law lands; 1313-A: "No RNG, no reservation, no charge")', () => {
    const w = castingCompetitionWorld()
    expect(w.rngAfterP1Greenlight).toEqual(w.rngBeforeP1Greenlight)
  })
})

describe('1313-F Amendment 1 — a queue-admitted greenlight mints the same as a direct one', () => {
  // Genuine front-door capacity contention needs a SECOND idle director and a SECOND idle
  // craft (a seat holds from greenlight through release — src/core/employment.ts:132-134 "R2:
  // ... A seat holds from greenlight through release" — so two concurrently-ACTIVE productions
  // cannot share one director), and this seed's week-0 market measures exactly one of each
  // (1314-P). I could not verify without execution whether, or after how many
  // `HIRING_MARKET_ROTATION_WEEKS` (13-week) epochs, the signable universe ever offers a second
  // director and a second craft — flagged in the 1315-C handback as an unsettled route premise
  // for the parent to measure. Rather than guess at that bound, this leaf drives the DEQUEUE
  // COMMIT directly and lawfully: `queueGreenlightScriptProject` (src/core/productionQueue.ts,
  // exported, the SAME payload-normalizing builder `admitOrQueue`'s enqueue closure calls at the
  // front door) builds a legally-shaped `ProductionQueueEntry` from a REAL, complete script
  // project and casting session; it is inserted into `state.productionQueue` directly (the
  // `withPromiseVariant` precedent's technique, tests/helpers/p14c2c-fixtures.ts — only the
  // QUEUE POSITION is synthesized, nothing about the project/session/relationship data). THIS
  // INJECTION SUBSTITUTES FOR GENUINE FRONT-DOOR CONTENTION (1315-C route premise 3, restated
  // per 1315-X's own "Interpretations for the review" note) — it is not a claim that genuine
  // contention is unreachable, only that I could not build it without execution; the injected
  // state is validated WHOLE with the live validator (`makeSave` must not throw) before the
  // `tick()` that admits it, so the substitute state is at least a save-legal one. `tick()`
  // then runs the real `admitQueuedIntents` step (src/core/queueAdmission.ts:53), which finds
  // the slot genuinely free (`gateSlotAvailable`, asserted below) and grants the entry through
  // `commitQueuedIntent` -> `applyGreenlightScriptProject(..., allowQueue=false)` ->
  // `applyGreenlightScriptProjectNow` -> `applyGreenlight` — the exact dequeue path the task
  // names, and the exact function 1313-F's seam sits inside.
  it('a synthetic queue entry, granted by the real tick-driven admission step, mints the same castingCompetitionLost drivers as a direct greenlight', () => {
    const { state: s0, market } = foundStudio()
    const [a, b, c] = market.actors
    const concept = s0.concepts[5]!
    let s = applyActions(s0, [{
      kind: 'commissionScript',
      project: { conceptId: concept.id, writerId: market.writer, shape: SHAPE, promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: RANGES } },
    }])
    const projectId = s.scriptDevelopment.projects.at(-1)!.id
    for (let n = 0; s.scriptDevelopment.projects.find((p) => p.id === projectId)!.status !== 'review'; n++) {
      if (n >= 30) throw new Error('route premise failed: the screenplay did not reach review within 30 ticks')
      s = tick(s)
    }
    s = applyActions(s, [{ kind: 'acceptScript', projectId }])
    const slate: CastingSlate = { lead: [a, b], antagonist: [b, c], support: [c, a] }
    s = applyActions(s, [{ kind: 'startCastingSession', session: { projectId, slate } }])
    const sessionId = s.castingSessions.sessions.find((x) => x.projectId === projectId)!.id
    for (let n = 0; s.castingSessions.sessions.find((x) => x.id === sessionId)!.status !== 'review'; n++) {
      if (n >= 30) throw new Error('route premise failed: the audition did not reach review within 30 ticks')
      s = tick(s)
    }
    s = applyActions(s, [{ kind: 'acknowledgeCastingSession', sessionId }])
    expect(gateSlotAvailable(s)).toBe(true) // sanity: nothing else occupies the Development & Casting slot
    const payload = {
      projectId, directorId: market.director, craftIds: [market.craft],
      cast: { lead: a, antagonist: b, support: c }, budget: { negative: concept.baseNegativeCost, marketing: 0 },
    }
    const queued: GameState = { ...s, productionQueue: queueGreenlightScriptProject(s.productionQueue, projectId, payload, s.market.tick) }
    // The injected state is validated WHOLE with the live validator before the admitting tick
    // (1315-C2 revision, "also" note): the substitute queue entry does not put the state outside
    // what the live writer itself accepts.
    expect(() => validateSave(makeSave(queued))).not.toThrow()
    const after = tick(queued)
    expect(after.productionQueue).toHaveLength(0) // granted, not still waiting
    const productionId = after.studio.activeProductions.at(-1)?.id
    expect(productionId).toBeDefined()
    const leadDriver = driversOf(after, a, b, 'castingCompetitionLost').filter((dr) => dr.ref === productionId)
    expect(leadDriver).toHaveLength(1)
    expect(leadDriver[0]).toMatchObject({ delta: -RELATIONSHIP_COMPETITION_DELTA })
  }, 60_000)
})

describe('1313-A §4 item 2 — no rival edge carries either new kind across a bounded natural run (1312-F Amendment 1: rivals hold no casting session)', () => {
  // This is a NEGATIVE / symmetry assertion: it is already vacuously true before the law lands
  // (the two new kinds do not exist anywhere in the engine yet), so it does not itself go RED —
  // it is included as required regression coverage (1313-A §4 item 2), the same "regression pin
  // — already true" status `tests/p14r3-save-v41.test.ts`'s frozen-reader describe block names
  // for its own pre-existing-but-required checks. The bound: 60 further ticks (weeks) past the
  // end of `castingCompetitionWorld()`'s own route, with ZERO further player actions, so any
  // castingCompetitionLost/repeatedCompetition driver found anywhere must trace to one of the
  // six production ids THIS FILE itself greenlit as the player.
  it('60 further weeks, zero player actions: every castingCompetitionLost/repeatedCompetition driver anywhere in state.relationships has ref in the set of productions this file greenlit as the player', () => {
    const w = castingCompetitionWorld()
    const knownRefs = new Set([w.p1, w.p2, w.pDedup, w.p3a, w.p3b, w.pNoSession])
    let s = w.afterNoSession
    for (let i = 0; i < 60; i++) s = tick(s)
    for (const edge of s.relationships) {
      for (const driver of edge.recent) {
        if (driver.kind === 'castingCompetitionLost' || driver.kind === 'repeatedCompetition') {
          expect(knownRefs.has(driver.ref)).toBe(true)
        }
      }
    }
  }, 60_000)
})

describe('1313-A §1 — with state.hollywood null, nothing is minted', () => {
  // NOT STAGED: I could not find a lawful route, within this task's no-execution limit, to a
  // world where `state.hollywood === null` while `scriptDevelopment.mode === 'managed'` and a
  // casting session can complete. `p13aGeneratedStudio` (src/harness/p13a/fixtures.ts)
  // unconditionally calls `initializeHollywood(..., 'fresh')`, and every managed-casting route
  // this task authorizes is built on that harness. Left unstaged; see the 1315-C handback.
  it.skip('requires a lawful route to a null-hollywood managed-casting world — not found without execution; see 1315-C handback', () => {
    expect(true).toBe(true)
  })
})
