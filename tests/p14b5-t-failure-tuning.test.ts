// 684-T — P14B.5-T: the REQUIREMENT REGRESSION for the activated tuning ruling. RED FIRST.
//
// AUTHORITY. Record 683 ("OWNER RULINGS ACTIVATED on record 680"), activated ruling 1:
// `RELATIONSHIP_FAILURE_DELTA` moves to 5 as PROVISIONAL CANDIDATE TUNING so that repeated
// failure becomes capable of producing **Strained** on the applicable low-proximity path.
// Brief: 684-T-tuning-red-brief.md. This file is written BEFORE the production change; a
// separate writer moves the constant in `src/core/relationships.ts:72`. NO production file,
// no existing test, fixture, helper, config or timeout is touched by this file.
//
// WHAT IS RED AND WHY (group 1 only). The repeated-collaboration cycle for ONE low-proximity
// pair with no dormancy is, per cycle after the accelerator caps:
//     +RELATIONSHIP_PROXIMITY_LOW  +RELATIONSHIP_REPEAT_CAP  −RELATIONSHIP_FAILURE_DELTA
// = 2 + 3 − F. At the OLD F that nets +1 a cycle, so a chain of nothing but flops CLIMBS and
// the pair can never reach the negative band (record 681 measured the constructed floor at
// exactly RELATIONSHIP_TIER_FLOOR.Acquaintances = 45, one point above the Strained ceiling).
// At the adopted F the capped cycle nets 0 and the chain settles inside Strained. Group 1
// asserts the ADOPTED law and is therefore expected to FAIL until the writer lands it.
// Groups 2–7 are phrased so they read correctly at EITHER value and must be green at both.
//
// STAGING DISCLOSURE — read this before any number below is quoted.
//   * CONSTRUCTED (groups 1–6) is not natural play: no seed decides these seats, no campaign
//     chose these pictures. Four staged people (`person-d` director, `person-l` lead,
//     `person-n` antagonist, `person-s` support), one production shape re-issued under new ids,
//     a take and its release one week apart with NO dormancy (the whole chain sits inside
//     RELATIONSHIP_DRIFT_GRACE_WEEKS, so drift contributes nothing and every movement is a driver).
//   * Groups 1–4 run over a PARTIAL object cast to `GameState`. Named in full, nothing else is
//     populated: `relationships`, `firstTakes`, `promises` (the two roots `requirePromiseRoots`
//     demands), `talent` (the four people the root validator checks membership against),
//     `market.tick` + `studioHistory.recordingStartedWeek` (the recording interval the REAL
//     `validateRelationshipsRoot` reads) and `hollywood.playerStudioId` (non-null, the seam's guard).
//     The real `validateRelationshipsRoot` certifies the root after EVERY write.
//   * Groups 5–6 run the same constructed chain over a REAL full `GameState` — the generated
//     campaign `p13a-core-causal-01` advanced by the live `tick` to week 6, BEFORE that seed mints
//     any natural edge (week 8, record 682) — because `makeSave` validates the whole world and a
//     partial object cannot carry that. The four people are real talent of that world (its first
//     director and its first three actors); the pictures, their seats and their takes are still
//     constructed, minted through the real `appendFirstTakes`.
//   * Group 7 is NATURAL WORLD: the live `tick` on the standard seed, no constructed input at all.
//   * No closeness asserted anywhere is hand-applied. Every value comes out of the real write path
//     `advanceRelationshipsWeek` / the real release join. No edge is forged into the negative band,
//     no validator is loosened, no RNG, no wall clock, no unseeded entropy of any kind.
//   * The ONE staged VALUE in this file is group 6's historical driver delta, explicitly relabelled
//     on an already-written root to stand for a pre-change stamp; it is never called engine output.
import assert from 'node:assert/strict'
import { describe, expect, it } from 'vitest'
import { appendFirstTakes } from '../src/core/promises.js'
import {
  RELATIONSHIP_BASELINE, RELATIONSHIP_DRIFT_GRACE_WEEKS, RELATIONSHIP_DRIFT_RETURN_WEEKS,
  RELATIONSHIP_FAILURE_CRITIC_SCORE, RELATIONSHIP_FAILURE_DELTA, RELATIONSHIP_PROXIMITY_HIGH,
  RELATIONSHIP_PROXIMITY_LOW, RELATIONSHIP_PROXIMITY_MID, RELATIONSHIP_REPEAT_CAP,
  RELATIONSHIP_SUCCESS_CRITIC_SCORE, RELATIONSHIP_SUCCESS_DELTA, RELATIONSHIP_TIER_FLOOR,
  advanceRelationshipsWeek, currentCloseness, currentTier, pairChemistry, validateRelationshipsRoot,
} from '../src/core/relationships.js'
import { LIVE_SAVE_VERSION, makeSave, migrateToLive, validateSaveV37 } from '../src/core/save.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { tick } from '../src/core/tick.js'
import type { FilmResult, GameState, Production, RelationshipDriver, RelationshipEdge } from '../src/core/types.js'

// ── the law, BY NAME (no delta literal appears anywhere in this file) ───────────────────────────
const LOW = RELATIONSHIP_PROXIMITY_LOW
const MID = RELATIONSHIP_PROXIMITY_MID
const HIGH = RELATIONSHIP_PROXIMITY_HIGH
const CAP = RELATIONSHIP_REPEAT_CAP
const FAIL_DELTA = -RELATIONSHIP_FAILURE_DELTA
const SUCCESS_DELTA = RELATIONSHIP_SUCCESS_DELTA
/** The top of the Strained band, derived from the owner's floors, never typed. */
const STRAINED_CEILING = RELATIONSHIP_TIER_FLOOR.Acquaintances - 1
/** A picture the release join reads as a flop / a hit / neither (§5.4 :440-441 thresholds). */
const FLOP_SCORE = RELATIONSHIP_FAILURE_CRITIC_SCORE - 1
const HIT_SCORE = RELATIONSHIP_SUCCESS_CRITIC_SCORE
const NEUTRAL_SCORE = RELATIONSHIP_FAILURE_CRITIC_SCORE // exactly ON the failure edge: not below it, not a hit

const clamp = (value: number): number => Math.max(0, Math.min(100, value))
const canon = (x: string, y: string): [string, string] => (x < y ? [x, y] : [y, x])
const edgesOf = (state: GameState): readonly RelationshipEdge[] => state.relationships
const rootBytes = (state: GameState): string => JSON.stringify(state.relationships)
function findEdge(state: GameState, x: string, y: string): RelationshipEdge {
  const [a, b] = canon(x, y)
  const edge = edgesOf(state).find((e) => e.a === a && e.b === b)
  assert.ok(edge, `no edge for the pair "${a}" / "${b}" — the chain did not mint what this case reads`)
  return edge
}
/** The §5.5 :467 drift formula as WRITTEN, an independent oracle; never `currentCloseness` itself. */
function driftOracle(closeness: number, dormant: number): number {
  if (dormant <= RELATIONSHIP_DRIFT_GRACE_WEEKS) return closeness
  const span = Math.min(dormant - RELATIONSHIP_DRIFT_GRACE_WEEKS, RELATIONSHIP_DRIFT_RETURN_WEEKS)
  return closeness + Math.trunc((RELATIONSHIP_BASELINE - closeness) * span / RELATIONSHIP_DRIFT_RETURN_WEEKS)
}

// ── the constructed chain, driven through the REAL write path ──────────────────────────────────
type Quartet = { director: string; lead: string; antagonist: string; support: string }
type Seat = { x: string; y: string; weight: number }
/** §5.4 :439's six pairs in the receipt's own seat order with their proximity class. */
const seats = (q: Quartet): readonly Seat[] => [
  { x: q.director, y: q.lead, weight: HIGH }, { x: q.director, y: q.antagonist, weight: MID },
  { x: q.director, y: q.support, weight: LOW }, { x: q.lead, y: q.antagonist, weight: HIGH },
  { x: q.lead, y: q.support, weight: MID }, { x: q.antagonist, y: q.support, weight: LOW },
]
const shot = (id: string, q: Quartet): Production =>
  ({ id, directorId: q.director, cast: { lead: q.lead, antagonist: q.antagonist, support: q.support } } as unknown as Production)
/** The clock the real root validator reads. RAISED, never lowered: on the constructed world it is
 * the staged week; on the real carrier the live clock already stands at the chain's end. */
const at = (state: GameState, week: number): GameState =>
  (state.market.tick >= week ? state : { ...state, market: { ...state.market, tick: week } } as GameState)

function shoot(state: GameState, studioId: string, q: Quartet, week: number, productionId: string): GameState {
  const production = shot(productionId, q)
  const staged = appendFirstTakes(at(state, week), [{ studioId, production }], week) // the REAL receipt writer
  const written = advanceRelationshipsWeek(staged, { takes: [{ studioId, production }], releases: [] }, week)
  validateRelationshipsRoot(written)
  return written
}
function release(state: GameState, week: number, productionId: string, criticScore: number): GameState {
  const film = { productionId, criticScore } as unknown as FilmResult // the two fields the release join reads
  const written = advanceRelationshipsWeek(at(state, week), { takes: [], releases: [film] }, week)
  validateRelationshipsRoot(written)
  return written
}

type Step = { label: string; week: number; state: GameState }
/** take-1, release-1, take-2, release-2 … one week apart, no dormancy, one new production id each. */
function driveChain(start: GameState, studioId: string, q: Quartet, firstWeek: number, productions: number, criticScore: number): Step[] {
  const trail: Step[] = []
  let state = start
  let week = firstWeek
  for (let p = 1; p <= productions; p++) {
    if (p > 1) week += 1
    state = shoot(state, studioId, q, week, `${studioId}:t684-p${String(p)}`)
    trail.push({ label: `take-${String(p)}`, week, state })
    week += 1
    state = release(state, week, `${studioId}:t684-p${String(p)}`, criticScore)
    trail.push({ label: `release-${String(p)}`, week, state })
  }
  return trail
}
/** The SAME trajectory from the exported constants alone — the arithmetic the requirement rests on.
 * Mirrors the write path driver by driver (mint = baseline + weight; a repeat take = weight then
 * `min(sharedProductions − 1, CAP)`; a release = its delta), each step clamped exactly as the
 * owner clamps. Contains no tier arithmetic: bands are always read through the owner's `currentTier`. */
function expectedTrail(weight: number, releaseDelta: number, firstWeek: number, productions: number): { label: string; week: number; closeness: number }[] {
  const trail: { label: string; week: number; closeness: number }[] = []
  let closeness = clamp(RELATIONSHIP_BASELINE + weight)
  let week = firstWeek
  for (let p = 1; p <= productions; p++) {
    if (p > 1) {
      week += 1
      closeness = clamp(clamp(closeness + weight) + Math.min(p - 1, CAP))
    }
    trail.push({ label: `take-${String(p)}`, week, closeness })
    week += 1
    closeness = clamp(closeness + releaseDelta)
    trail.push({ label: `release-${String(p)}`, week, closeness })
  }
  return trail
}
const measured = (trail: Step[], seat: Seat): { label: string; week: number; closeness: number }[] =>
  trail.map((s) => ({ label: s.label, week: s.week, closeness: currentCloseness(findEdge(s.state, seat.x, seat.y), s.week) }))
const printTrail = (rows: { label: string; week: number; closeness: number }[]): string =>
  rows.map((r) => `${r.label}@${String(r.week)}=${String(r.closeness)}`).join(' ')

// ── the CONSTRUCTED partial world (groups 1–4); every populated field is named in the header ───
const STAGED: Quartet = { director: 'person-d', lead: 'person-l', antagonist: 'person-n', support: 'person-s' }
const STAGED_STUDIO = 'studio-684t'
const STAGED_FIRST_WEEK = 10
const stagedWorld = (): GameState => ({
  relationships: [], firstTakes: [], promises: [],
  talent: [STAGED.director, STAGED.lead, STAGED.antagonist, STAGED.support].map((id) => ({ id })),
  market: { tick: STAGED_FIRST_WEEK }, studioHistory: { recordingStartedWeek: 0 },
  hollywood: { playerStudioId: STAGED_STUDIO },
} as unknown as GameState)
const LOW_SEAT: Seat = { x: STAGED.director, y: STAGED.support, weight: LOW } // the applicable low-proximity path
/** Six cycles: at the adopted value the third flop crosses the band floor and the three after it
 * show the pair STAYS there (the capped cycle nets zero); at the old value six cycles show the
 * same chain climbing steadily AWAY from the band. */
const REQUIREMENT_PRODUCTIONS = 6

// ── the REAL carrier for groups 5–6 (a full GameState `makeSave` will validate) ────────────────
const CARRIER_SEED = 'p13a-core-causal-01'
const CARRIER_WEEK = 6 // before this seed mints its first natural edge at week 8 (record 682)
const CARRIER_PRODUCTIONS = 3
const CARRIER_FIRST_WEEK = CARRIER_WEEK - (2 * CARRIER_PRODUCTIONS - 1)
let carrierCache: GameState | undefined
/** The generated campaign at week 6. Every relationship function is pure and spread-preserving, so
 * the memoised state is never mutated by a case and is shared, not cloned. */
function carrier(): { state: GameState; studioId: string; quartet: Quartet } {
  carrierCache ??= advanceTo(p13aGeneratedStudio(CARRIER_SEED), CARRIER_WEEK)
  const state = carrierCache
  expect(state.market.tick).toBe(CARRIER_WEEK)
  expect(edgesOf(state)).toEqual([]) // premise: no NATURAL edge yet, so every edge below is the constructed one
  expect(state.studioHistory.recordingStartedWeek).toBeLessThanOrEqual(CARRIER_FIRST_WEEK)
  // Real people of that world, chosen by role in the world's own talent order (the relationship
  // module reads seats, never roles; the seating itself is the constructed part).
  const director = state.talent.find((person) => person.role === 'director')
  const actors = state.talent.filter((person) => person.role === 'actor').slice(0, 3)
  assert.ok(director && actors.length === 3, `premise: ${CARRIER_SEED} at week ${String(CARRIER_WEEK)} has no director plus three actors`)
  const quartet: Quartet = { director: director.id, lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id }
  expect(new Set(Object.values(quartet)).size).toBe(4)
  return { state, studioId: state.hollywood!.playerStudioId, quartet }
}
function carrierChain(criticScore: number): Step[] {
  const { state, studioId, quartet } = carrier()
  return driveChain(state, studioId, quartet, CARRIER_FIRST_WEEK, CARRIER_PRODUCTIONS, criticScore)
}

// ───────────────────────────────────────────────────────────────────────────────────────────────
describe('CONSTRUCTED group 1 — THE REQUIREMENT: repeated shared failure must reach Strained (record 683 ruling 1)', () => {
  it('a low-proximity pair whose shared pictures repeatedly flop reaches the negative band', () => {
    // The chain: six pictures by the same staged quartet, each taken and then released one week
    // later below the failure edge, no dormancy anywhere. The low pair is director–support.
    const trail = driveChain(stagedWorld(), STAGED_STUDIO, STAGED, STAGED_FIRST_WEEK, REQUIREMENT_PRODUCTIONS, FLOP_SCORE)
    const rows = measured(trail, LOW_SEAT)
    // The trajectory is derived from the constants, never from output. Green at EITHER value:
    // this is the arithmetic, and the next two assertions are the requirement it produces.
    expect(rows).toEqual(expectedTrail(LOW, FAIL_DELTA, STAGED_FIRST_WEEK, REQUIREMENT_PRODUCTIONS))
    const last = trail.at(-1)!
    const lowest = Math.min(...rows.map((r) => r.closeness))
    const finalTier = currentTier(findEdge(last.state, LOW_SEAT.x, LOW_SEAT.y), last.week)
    const finalSign = pairChemistry(last.state, LOW_SEAT.x, LOW_SEAT.y, last.week).sign
    // The whole observation travels with every failure message, so a RED run reads as a measurement.
    const printed = `${printTrail(rows)} | lowest=${String(lowest)} strainedCeiling=${String(STRAINED_CEILING)}`
      + ` finalTier=${finalTier} sign=${String(finalSign)} cappedCycleNet=${String(LOW + CAP - RELATIONSHIP_FAILURE_DELTA)}`
    // THE REQUIREMENT (record 683 ruling 1). Under the old value the capped cycle nets
    // LOW + CAP − FAILURE = +1 and this chain never descends past RELATIONSHIP_TIER_FLOOR
    // .Acquaintances (record 681 measured that floor); under the adopted value it nets 0 and
    // the chain settles inside the Strained band.
    expect(lowest, `the repeated-flop chain must reach the Strained band: ${printed}`).toBeLessThanOrEqual(STRAINED_CEILING)
    expect(finalTier, `the pair must READ Strained at the end of the chain: ${printed}`).toBe('Strained')
    expect(finalSign, `chemistry must read the negative sign for this pair: ${printed}`).toBe(-1)
    expect(LOW + CAP - RELATIONSHIP_FAILURE_DELTA,
      `a capped repeated-flop cycle must not net POSITIVE, or repeated failure can never hold a pair down: ${printed}`)
      .toBeLessThanOrEqual(0)
  })
})

// ───────────────────────────────────────────────────────────────────────────────────────────────
describe('CONSTRUCTED group 2 — POSITIVE CONTROL: the success driver, the proximity weights and the accelerator are untouched', () => {
  it('every one of the six pairs climbs on its own proximity weight and the capped accelerator, with the success delta by name', () => {
    const productions = CAP + 3 // enough cycles for the LOW pair to top the ladder
    const trail = driveChain(stagedWorld(), STAGED_STUDIO, STAGED, STAGED_FIRST_WEEK, productions, HIT_SCORE)
    for (const seat of seats(STAGED)) {
      expect(measured(trail, seat)).toEqual(expectedTrail(seat.weight, SUCCESS_DELTA, STAGED_FIRST_WEEK, productions))
    }
    // The drivers themselves: the mint weight, the capped accelerator and the success delta BY NAME.
    const last = trail.at(-1)!
    for (const seat of seats(STAGED)) {
      const edge = findEdge(last.state, seat.x, seat.y)
      expect(edge.sharedProductions).toBe(productions)
      expect(edge.sharedSuccesses).toBe(productions)
      expect(edge.sharedFailures).toBe(0)
      expect(edge.recent.filter((d) => d.kind === 'sharedSuccess').map((d) => d.delta)).toEqual(
        edge.recent.filter((d) => d.kind === 'sharedSuccess').map(() => SUCCESS_DELTA))
    }
    const firstTake = trail[0]!
    for (const seat of seats(STAGED)) {
      expect(findEdge(firstTake.state, seat.x, seat.y).recent).toEqual(
        [{ kind: 'sharedProduction', week: STAGED_FIRST_WEEK, ref: `${STAGED_STUDIO}:t684-p1`, delta: seat.weight }])
    }
    const secondTake = trail.find((s) => s.label === 'take-2')!
    for (const seat of seats(STAGED)) {
      expect(findEdge(secondTake.state, seat.x, seat.y).recent.at(-1)).toEqual(
        { kind: 'repeatedCollaboration', week: secondTake.week, ref: `${STAGED_STUDIO}:t684-p2`, delta: Math.min(1, CAP) })
    }
  })

  it('the top of the ladder is reached on the SAME picture the constants predict, and the prediction holds no failure term', () => {
    const productions = CAP + 3
    const trail = driveChain(stagedWorld(), STAGED_STUDIO, STAGED, STAGED_FIRST_WEEK, productions, HIT_SCORE)
    // The band is always the owner's read; only the VALUE comes from the constant-derived model.
    const topOf = (rows: { label: string; week: number; closeness: number }[]): string | undefined =>
      rows.find((r) => currentTier({ closeness: r.closeness, lastEventWeek: r.week }, r.week) === 'Inseparable')?.label
    for (const seat of seats(STAGED)) {
      const predicted = topOf(expectedTrail(seat.weight, SUCCESS_DELTA, STAGED_FIRST_WEEK, productions))
      assert.ok(predicted, `premise: the ${String(seat.weight)}-weight pair does not top the ladder within ${String(productions)} pictures`)
      expect(topOf(measured(trail, seat))).toBe(predicted)
      const last = trail.at(-1)!
      expect(currentTier(findEdge(last.state, seat.x, seat.y), last.week)).toBe('Inseparable')
    }
  })
})

// ───────────────────────────────────────────────────────────────────────────────────────────────
describe('CONSTRUCTED group 3 — NEUTRAL CONTROL: a picture between the thresholds mints nothing', () => {
  it('a release in the neutral band returns the SAME state and moves no pair', () => {
    const minted = driveChain(stagedWorld(), STAGED_STUDIO, STAGED, STAGED_FIRST_WEEK, 1, NEUTRAL_SCORE)
    const take = minted[0]!
    const week = take.week + 1
    const staged = at(take.state, week) // ONE pre-state object, so the identity check below compares the same input
    for (const score of [NEUTRAL_SCORE, RELATIONSHIP_SUCCESS_CRITIC_SCORE - 1]) {
      const film = { productionId: `${STAGED_STUDIO}:t684-p1`, criticScore: score } as unknown as FilmResult
      // Single effect: nothing minted ⇒ the ledger never commits ⇒ the same reference comes back.
      expect(advanceRelationshipsWeek(staged, { takes: [], releases: [film] }, week)).toBe(staged)
    }
    for (const seat of seats(STAGED)) {
      const edge = findEdge(minted.at(-1)!.state, seat.x, seat.y)
      expect(edge.closeness).toBe(clamp(RELATIONSHIP_BASELINE + seat.weight))
      expect({ successes: edge.sharedSuccesses, failures: edge.sharedFailures }).toEqual({ successes: 0, failures: 0 })
      expect(edge.recent.map((d) => d.kind)).toEqual(['sharedProduction'])
    }
  })

  it('a chain with no flop follows a trajectory that holds no failure term at all', () => {
    const productions = CAP + 1
    const trail = driveChain(stagedWorld(), STAGED_STUDIO, STAGED, STAGED_FIRST_WEEK, productions, NEUTRAL_SCORE)
    for (const seat of seats(STAGED)) {
      expect(measured(trail, seat)).toEqual(expectedTrail(seat.weight, 0, STAGED_FIRST_WEEK, productions))
    }
    const last = trail.at(-1)!
    for (const edge of edgesOf(last.state)) expect(edge.sharedFailures).toBe(0)
  })
})

// ───────────────────────────────────────────────────────────────────────────────────────────────
describe('CONSTRUCTED group 4 — DRIFT IS READ-ONLY AND UNCHANGED by this tuning', () => {
  it('a flopped edge below the baseline drifts UP toward it, lands exactly on it, and never passes it', () => {
    const trail = driveChain(stagedWorld(), STAGED_STUDIO, STAGED, STAGED_FIRST_WEEK, 1, FLOP_SCORE)
    const flopped = trail.at(-1)!
    const edge = findEdge(flopped.state, LOW_SEAT.x, LOW_SEAT.y)
    // The ONE pinned relation (647-B (ii)): FAILURE > PROXIMITY_LOW, so this edge sits BELOW the baseline.
    expect(edge.closeness).toBe(clamp(RELATIONSHIP_BASELINE + LOW + FAIL_DELTA))
    expect(edge.closeness).toBeLessThan(RELATIONSHIP_BASELINE)
    const anchor = edge.lastEventWeek
    expect(currentCloseness(edge, anchor + RELATIONSHIP_DRIFT_GRACE_WEEKS)).toBe(edge.closeness) // no drift inside the grace window
    let previous = edge.closeness
    for (let dormant = RELATIONSHIP_DRIFT_GRACE_WEEKS; dormant <= RELATIONSHIP_DRIFT_GRACE_WEEKS + RELATIONSHIP_DRIFT_RETURN_WEEKS + 20; dormant += 13) {
      const read = currentCloseness(edge, anchor + dormant)
      expect(read).toBe(driftOracle(edge.closeness, dormant)) // the independent oracle, not the engine's own answer
      expect(read).toBeGreaterThanOrEqual(previous) // upward, from below
      expect(read).toBeLessThanOrEqual(RELATIONSHIP_BASELINE) // never past the baseline
      previous = read
    }
    const completed = anchor + RELATIONSHIP_DRIFT_GRACE_WEEKS + RELATIONSHIP_DRIFT_RETURN_WEEKS
    expect(currentCloseness(edge, completed)).toBe(RELATIONSHIP_BASELINE)
    expect(currentCloseness(edge, completed + RELATIONSHIP_DRIFT_RETURN_WEEKS)).toBe(RELATIONSHIP_BASELINE)
  })

  it('reading a drifted edge changes no stored value, no counter, no firstSharedWeek and no peakTier', () => {
    const trail = driveChain(stagedWorld(), STAGED_STUDIO, STAGED, STAGED_FIRST_WEEK, 2, FLOP_SCORE)
    const state = trail.at(-1)!.state
    const before = rootBytes(state)
    const edge = findEdge(state, LOW_SEAT.x, LOW_SEAT.y)
    const snapshot = JSON.stringify(edge)
    for (const week of [edge.lastEventWeek, edge.lastEventWeek + RELATIONSHIP_DRIFT_GRACE_WEEKS + 1, edge.lastEventWeek + RELATIONSHIP_DRIFT_RETURN_WEEKS]) {
      currentCloseness(edge, week); currentTier(edge, week); pairChemistry(state, LOW_SEAT.x, LOW_SEAT.y, week)
    }
    expect(JSON.stringify(edge)).toBe(snapshot)
    expect(rootBytes(state)).toBe(before)
    expect({ productions: edge.sharedProductions, failures: edge.sharedFailures, first: edge.firstSharedWeek, peak: edge.peakTier })
      .toEqual({ productions: 2, failures: 2, first: STAGED_FIRST_WEEK, peak: currentTier({ closeness: clamp(RELATIONSHIP_BASELINE + LOW), lastEventWeek: STAGED_FIRST_WEEK }, STAGED_FIRST_WEEK) })
  })
})

// ───────────────────────────────────────────────────────────────────────────────────────────────
describe('CONSTRUCTED group 5 — REPLAY AND IDEMPOTENCY on the real carrier world', () => {
  it('the same advance from the same pre-state writes a byte-identical root, and a second advance over the same production id mints nothing twice', () => {
    const { state, studioId, quartet } = carrier()
    const production = shot(`${studioId}:t684-replay`, quartet)
    const week = CARRIER_WEEK
    const pre = appendFirstTakes(state, [{ studioId, production }], week)
    const delta = { takes: [{ studioId, production }], releases: [] as readonly FilmResult[] }
    const once = advanceRelationshipsWeek(pre, delta, week)
    const twice = advanceRelationshipsWeek(pre, delta, week)
    expect(rootBytes(twice)).toBe(rootBytes(once))
    expect(edgesOf(once)).toHaveLength(seats(quartet).length)
    // Idempotent by (edgeId, kind, ref): nothing moves, so the SAME reference comes back.
    expect(advanceRelationshipsWeek(once, delta, week)).toBe(once)
    const film = { productionId: production.id, criticScore: FLOP_SCORE } as unknown as FilmResult
    const released = advanceRelationshipsWeek(once, { takes: [], releases: [film] }, week)
    expect(rootBytes(advanceRelationshipsWeek(once, { takes: [], releases: [film] }, week))).toBe(rootBytes(released))
    expect(advanceRelationshipsWeek(released, { takes: [], releases: [film] }, week)).toBe(released)
  })

  it('rngState is byte-equal before and after every write of the whole chain (B.5 uses no RNG)', () => {
    const { state } = carrier()
    const before = JSON.stringify(state.rngState)
    for (const step of carrierChain(FLOP_SCORE)) expect(JSON.stringify(step.state.rngState)).toBe(before)
  })
})

// ───────────────────────────────────────────────────────────────────────────────────────────────
describe('CONSTRUCTED group 6 — SAVE AND LOAD ACROSS THE CHANGE: historical deltas are carried, never restamped', () => {
  it('a genuinely written root round-trips through makeSave / validateSaveV32 / migrateToV32 with every driver delta verbatim', () => {
    const chain = carrierChain(FLOP_SCORE)
    const state = chain.at(-1)!.state
    const written = edgesOf(state).map((e) => e.recent.map((d) => d.delta))
    expect(written.every((row) => row.includes(FAIL_DELTA))).toBe(true) // the chain really recorded failures
    const save = makeSave(state)
    expect(save.saveVersion).toBe(LIVE_SAVE_VERSION)
    expect(validateSaveV37(save)).toEqual(save)
    const migrated = migrateToLive(save)
    expect(JSON.stringify(migrated.state.relationships)).toBe(JSON.stringify(save.state.relationships))
    expect(migrated.state.relationships.map((e) => e.recent.map((d) => d.delta))).toEqual(written)
  })

  it('a root whose stored failure deltas carry a value the CURRENT constant does not produce is admitted, carried verbatim and never restamped', () => {
    // The one staged value in this file, and it is a RELABEL of an already-written root, never engine
    // output: a delta one point smaller in magnitude than the live constant — exactly the class of
    // stamp every pre-change campaign holds once the writer moves the constant. Record 683: the save
    // format is untouched, `validateRelationshipsRoot` requires `delta` to be an integer and pins no
    // value, so a historical row stays valid and is NOT rewritten. This is what makes the change prospective.
    const chain = carrierChain(FLOP_SCORE)
    const historicalDelta = FAIL_DELTA + 1
    expect(historicalDelta).not.toBe(FAIL_DELTA)
    const restamp = (edge: RelationshipEdge): RelationshipEdge => ({
      ...edge,
      recent: edge.recent.map((d: RelationshipDriver) => (d.kind === 'sharedFailure' ? { ...d, delta: historicalDelta } : d)),
    })
    const historical = { ...chain.at(-1)!.state, relationships: edgesOf(chain.at(-1)!.state).map(restamp) } as GameState
    expect(() => { validateRelationshipsRoot(historical) }).not.toThrow()
    const save = makeSave(historical)
    const carried = save.state.relationships.flatMap((e) => e.recent.filter((d) => d.kind === 'sharedFailure').map((d) => d.delta))
    expect(carried.length).toBeGreaterThan(0)
    expect(new Set(carried)).toEqual(new Set([historicalDelta]))
    const migrated = migrateToLive(validateSaveV37(save))
    expect(JSON.stringify(migrated.state.relationships)).toBe(JSON.stringify(save.state.relationships))
    expect(migrated.state.relationships.flatMap((e) => e.recent.filter((d) => d.kind === 'sharedFailure').map((d) => d.delta)))
      .toEqual(carried)
    // and the closeness stored beside those historical drivers is carried too — a resumed campaign
    // continues from its stored value; nothing is recomputed at the boundary.
    expect(migrated.state.relationships.map((e) => e.closeness)).toEqual(edgesOf(historical).map((e) => e.closeness))
  })
})

// ───────────────────────────────────────────────────────────────────────────────────────────────
describe('NATURAL WORLD group 7 — one standard seed, what is TRUE and nothing more', () => {
  // The seed is the recorded standard set's first campaign (654-T-ledger.md §B). NO player action is
  // taken; the campaign is advanced ONE WEEK AT A TIME through the real `tick` until the engine itself
  // records a shared failure. This group asserts the DRIVER and the arithmetic, never that a natural
  // campaign reaches Strained: records 679/682 measured `strainedEverRead false` on all four standard
  // seeds at the old value, and whether any reaches it at the adopted value is the parent's post-row
  // re-run (record 683's pre-declared natural-chain attribution), not a test's to assume.
  const NATURAL_WEEK_BOUND = 40
  it('the first natural shared failure stores exactly −RELATIONSHIP_FAILURE_DELTA and moves closeness by exactly that', () => {
    let state = p13aGeneratedStudio(CARRIER_SEED)
    let before = state
    let week = state.market.tick
    let flopped: readonly RelationshipEdge[] = []
    while (state.market.tick < NATURAL_WEEK_BOUND && flopped.length === 0) {
      before = state
      state = tick(state)
      week = state.market.tick
      flopped = edgesOf(state).filter((e) => e.recent.some((d) => d.kind === 'sharedFailure' && d.week === week))
    }
    assert.ok(flopped.length > 0,
      `UNEXECUTED premise: no natural shared failure on ${CARRIER_SEED} through week ${String(NATURAL_WEEK_BOUND)}`)
    expect(edgesOf(state).length).toBeGreaterThan(0)
    // Every flop driver written this week carries the constant, whatever the constant is.
    for (const edge of flopped) {
      for (const driver of edge.recent.filter((d) => d.kind === 'sharedFailure' && d.week === week)) {
        expect(driver.delta).toBe(FAIL_DELTA)
      }
    }
    // The closeness identity, on the edges whose ONLY movement this week was that flop.
    const clean = flopped.filter((edge) => {
      const was = edgesOf(before).find((e) => e.edgeId === edge.edgeId)
      return was !== undefined && edge.recent.filter((d) => d.week === week).length === 1
    })
    assert.ok(clean.length > 0, `premise: every edge flopped at week ${String(week)} also moved for another reason`)
    for (const edge of clean) {
      const was = edgesOf(before).find((e) => e.edgeId === edge.edgeId)!
      expect(edge.closeness).toBe(clamp(driftOracle(was.closeness, week - was.lastEventWeek) + FAIL_DELTA))
      expect(edge.sharedFailures).toBe(was.sharedFailures + 1)
      expect(edge.lastEventWeek).toBe(week)
    }
    validateRelationshipsRoot(state)
  })
})
