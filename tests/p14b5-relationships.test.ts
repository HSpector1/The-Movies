// 654-T (record 653 NEXT653; plan T1 "independent test-author RED against accepted predecessor").
// P14B.5 First Shared-Work Bond Core — the SYNTHETIC/ENGINE RED: families 1–8 and 10 of the inserted
// expansion (docs/engineering/playability-launch-review/plans/P14-HEADLESS-PLAN.md, "## P14B.5 — First
// Shared-Work Bond Core — task expansion (… audit applied)", the Tests paragraph) plus the family-9
// one-edge `migrateToV30` refusal (record 653 parent ruling (4): every reader-admitted synthetic variant
// lives in this file, B4 plan :391-393). Authored at HEAD 74bd325b on a clean tree; no production,
// helper, fixture or timeout is touched.
//
// RED MECHANISM (memory rule: vite binds a MISSING named export to `undefined`, so a missing symbol
// alone can pass spuriously): every case imports VALUE bindings from the ABSENT `src/core/relationships.ts`,
// so this whole file fails at module resolution (0 collected) until T2 creates the module; the first
// case of every `describe` then asserts each binding it calls is a function/defined, so a partial
// module can never turn a family green by accident.
//
// EXPECTATIONS ARE DERIVED FROM THE LAW, never from current output:
//   scope (1)   the root `relationships: RelationshipEdge[]` at the top level, the edge fields as
//               proposed ("the T1 RED pins the fields it reads, T2 may rename with the ruling recorded");
//   scope (2)   ONE seam `advanceRelationshipsWeek(state, { takes, releases }, week)` at the tick tail
//               between `appendFirstTakes` and `advancePromisesWeek`, minting FROM THE DELTA; guard
//               order copied from `appendFirstTakes` :125-127; every tail driver stamped
//               `week = state.market.tick` (647-B R1); (2a) six pairs in the receipt's seat order with
//               proximity weights and the repeat accelerator; (2b) success/failure at release by
//               `criticScore`; (2c) `recordCancelledAfterFirstTake` at the player cancel, the
//               complement of `breakPromisesOnCancel` :788;
//   scope (3)   integer 0–100, `RELATIONSHIP_BASELINE` 50 (647-B ruling (i) on OPEN 4), tier edges as
//               NAMED constants, drift-on-read with `GRACE`/`RETURN`, tier under `RELATIONSHIP_RULES_VERSION`
//               = 1 with the §5.3 evidence condition (no conflict record ⇒ Strained);
//   scope (4)   `RELATIONSHIP_FAILURE_DELTA > RELATIONSHIP_PROXIMITY_LOW` BY NAME (647-B ruling (ii) on
//               OPEN 5); Enemies/Nemeses unreachable BY RULE;
//   scope (5)   D5 in the chooser with the D1 roster predicate `startWeek < W && (endedWeek === null ||
//               W < endedWeek)`, subject excluded, strict at both ends (647-B D1);
//   scope (6)   `nemesisOnRoster` enumerated, never emitted;  (7) `pairChemistry` read-only, no consumer;
//   scope (8)   no RNG, no order dependence, copy-on-write;   (9) fold-by-count at `RELATIONSHIP_RECENT_CAP`;
//   scope (10)  the V31 root validator and the one-edge downgrade refusal.
//
// INTERPRETATIONS NAMED (the parent rules; none is a refusal):
//   I1. The seven tier edges are read as ONE exported record `RELATIONSHIP_TIER_FLOOR` keyed by tier
//       (`Nemeses` at 0, the other seven the named lower edges); the ladder and the driver kinds are read
//       as the runtime catalogues `RELATIONSHIP_TIERS` / `RELATIONSHIP_DRIVER_KINDS` the validator needs.
//       These NAMES are the RED's; T2 may rename with the ruling recorded (plan scope (1)).
//   I2. A release whose take predates the recording of any edge (a pre-migration take: Q3, no backfill,
//       "edges are minted only by live events") mints NOTHING — the validator's
//       `sharedSuccesses + sharedFailures ≤ sharedProductions` admits no other reading.
//   I3. The "live flop" of family 4 is exercised on the REAL first take and the REAL release fact with
//       ONE field varied (`criticScore` one below the failure edge) fed to the seam directly, labelled
//       IN-MEMORY RELEASE-RESULT VARIANT, because the natural score of the one genuine player picture is
//       not the test's to choose; the natural release is ALSO asserted on whichever branch its real
//       score selects.
//   I4. The D5 sentence is identified as the ONE settled-receipt reason outside the eight frozen
//       sentences of `talentMarket.ts` (six `DESCRIPTOR_REASON` strings and the two fallbacks); its
//       wording is a copy hypothesis, its CLASS (ordering-only, no person, tier or number) is pinned.
//
// PREMISES MEASURED on unchanged source (654-T ledger, scratchpad/654-T-ledger.md): the family-6 base
// (the B.2 T3 controlled staging on `p13-public-commercial-adoption`, subject r04-3, two survivors
// player + r01, three bidders dropped by IMPOSSIBLE attachments, standing equalised) DECLINES at 208
// with "this person could not separate 2 equally ranked proposals." — every landed band ties; the
// player's D1 roster at 208 is exactly the actor signed at 60 for 156 weeks; r01's and r04's are empty.
// The family-1 world (`genuine-v30-first-take-at-five` + assign + schedule + one tick) mints
// `first-take-event-24` at 61 and leaves `rngState` at "2598418427,508725886,1318803286,3129010527";
// the release commits at 64 (Release Ready) and lands at 65 with `releaseTick` 64.

import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import * as marketModule from '../src/core/talentMarket.js'
import { publicPreferredTerm, publicPriorityOrder, submitProposal, type FreezeDrop } from '../src/core/talentMarket.js'
import { attachPromise } from '../src/core/promises.js'
import { LIVE_SAVE_VERSION, makeSave, migrateToV25, migrateToV26, migrateToV27, migrateToV28, migrateToV29, migrateToV30, migrateToV31, validateSaveV30, validateSaveV31 } from '../src/core/save.js'
import { TUNING } from '../src/core/tuning.js'
import { careerIdentity } from '../src/core/talentSummary.js'
import { advanceTo, fund, p13aGeneratedStudio, player } from './helpers/p14b2-fixtures.js'
import type { CastSlot, FilmResult, GameState, Production, TalentMarketCase, TalentMarketReceipt } from '../src/core/types.js'
// RED-by-design: src/core/relationships.ts does not exist. Every binding below is CALLED.
import {
  RELATIONSHIP_BASELINE, RELATIONSHIP_CANCEL_DELTA, RELATIONSHIP_DRIFT_GRACE_WEEKS, RELATIONSHIP_DRIFT_RETURN_WEEKS,
  RELATIONSHIP_DRIVER_KINDS, RELATIONSHIP_FAILURE_CRITIC_SCORE, RELATIONSHIP_FAILURE_DELTA, RELATIONSHIP_PROXIMITY_HIGH,
  RELATIONSHIP_PROXIMITY_LOW, RELATIONSHIP_PROXIMITY_MID, RELATIONSHIP_RECENT_CAP, RELATIONSHIP_REPEAT_CAP,
  RELATIONSHIP_RULES_VERSION, RELATIONSHIP_SUCCESS_CRITIC_SCORE, RELATIONSHIP_SUCCESS_DELTA, RELATIONSHIP_TIERS,
  RELATIONSHIP_TIER_FLOOR, advanceRelationshipsWeek, currentCloseness, currentTier, driverGain, pairChemistry,
  projectRelationshipsPreV31, recordCancelledAfterFirstTake, requireRelationshipsRoot, validateRelationshipsRoot,
} from '../src/core/relationships.js'

// ── shapes read by this RED (plan scope (1) PROPOSED SHAPE; field names pinned here) ────────────────
type Tier = 'Nemeses' | 'Enemies' | 'Strained' | 'Acquaintances' | 'Colleagues' | 'Friends' | 'CloseFriends' | 'Inseparable'
type DriverKind = 'sharedProduction' | 'repeatedCollaboration' | 'sharedSuccess' | 'sharedFailure' | 'cancelledAfterFirstTake'
type Driver = { kind: DriverKind; week: number; ref: string; delta: number }
type Edge = {
  edgeId: string; a: string; b: string; closeness: number; firstSharedWeek: number; lastEventWeek: number
  sharedProductions: number; sharedSuccesses: number; sharedFailures: number; sharedCancellations: number
  peakTier: Tier; peakTierWeek: number; recent: readonly Driver[]
}
type Chemistry = { tier: Tier | null; sign: -1 | 0 | 1; reasons: readonly string[] }
type TakeEntry = { studioId: string; production: Production }
const LADDER: readonly Tier[] = ['Nemeses', 'Enemies', 'Strained', 'Acquaintances', 'Colleagues', 'Friends', 'CloseFriends', 'Inseparable']
const KINDS: readonly DriverKind[] = ['sharedProduction', 'repeatedCollaboration', 'sharedSuccess', 'sharedFailure', 'cancelledAfterFirstTake']
// The eight FROZEN settlement sentences of talentMarket.ts (:671-678 DESCRIPTOR_REASON; :877, :885 fallbacks).
const FROZEN_REASONS: ReadonlySet<string> = new Set([
  'their compensation band ranked above the others', 'their term matched what this person prefers', 'they offered an opportunity',
  'their record with this person ranked above the others', 'their studio standing ranked higher', 'they are the current employer',
  'theirs was the only proposal on the table', 'their proposal ranked above the others overall',
])
const TIE_SENTENCE = 'this person could not separate 2 equally ranked proposals.'
// Companion §2.1.7 :120 — the SEVEN-member public orders (asserted against the companion, never the landed array).
const UNPROVEN_ORDER = ['opportunity', 'compensation', 'relationships', 'term', 'trust', 'standing', 'incumbency'] as const
const PROVEN_ORDER = ['compensation', 'term', 'trust', 'relationships', 'incumbency', 'standing', 'opportunity'] as const

// ── T0 corpus (tests/fixtures/p14/genuine-v30-pre-b5/MANIFEST.json; pins read from the MANIFEST at HEAD) ──
const V30_PINS = {
  'first-take-at-five': { raw: '3eab4f7af55917d3a011776850f129dc5dc135da8215d8ebec6845dfb8db620d', gz: '62df3d07eee0a01da767203f51b0ce89edfdb281177511f848a740293ca4ceb7', week: 60 },
  'rival-current-p1-and-p2': { raw: 'c155f636a8758f33e6ee002f124e5da2f51ffb5f37404cbbcf9d7cea736a52a1', gz: 'e2e8ac939875a1b23bd898c10773f707f8c64d77d476802499a591961d2316c1', week: 196 },
  'current-p1': { raw: 'b7a32680df6f002c10829e7edd644a394b9b0cdac1427a7af0aef5395501aebe', gz: 'a13704632d58909b9edc330f2f6d946f3e3fe7bfc1d9d2adb3ab2a430fd540fd', week: 45 },
} as const
type CorpusName = keyof typeof V30_PINS
const corpus = (file: string) => new URL('./fixtures/p14/genuine-v30-pre-b5/' + file, import.meta.url)
const legacyV28 = new URL('./fixtures/p14/legacy-v28-shooting-5.json.gz', import.meta.url)
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const clone = <T>(value: T): T => structuredClone(value)
// Measured on unchanged source at HEAD 74bd325b (scratchpad/654-T-ledger.md §F1); frozen controls, CANNOT-MOVE class.
const FROZEN = {
  takeEventId: 'first-take-event-24', takeWeek: 61, productionId: 'prod-0052', directorId: 't-dir-01',
  cast: { lead: 't-act-09', antagonist: 't-act-12', support: 't-act-11' } as Record<CastSlot, string>,
  rngAfterTake: '2598418427,508725886,1318803286,3129010527',
  rngAfterRelease: '3273107727,1382938971,2227203681,3129010529',
  releaseCommitWeek: 64, releaseWeek: 65,
  // sha256 of JSON.stringify(post-tick state with the `relationships` key removed) after the family-1 tick.
  postTakeDigestStripped: '6403ac2bb1dd59249db054732115f9227a104f5f2afd9f699e9f89d393388d21',
  // The rival chain from `rival-current-p1-and-p2` (196): first post-migration take, its release, the repeat take.
  rival: { studioId: 'studio-aca408ec-r01', firstTake: 'studio-aca408ec-r01:film:11', firstTakeWeek: 213, firstReleaseWeek: 217,
    repeatTake: 'studio-aca408ec-r01:film:6', repeatTakeWeek: 222 },
} as const

function fixture(name: CorpusName) {
  const file = `genuine-v30-${name}.json.gz`
  assert.ok(existsSync(corpus(file)), 'T0 NOT COMPLETE: genuine V30 artifact missing: ' + file)
  const compressed = readFileSync(corpus(file))
  const raw = gunzipSync(compressed).toString('utf8')
  expect(sha(compressed)).toBe(V30_PINS[name].gz)
  expect(sha(raw)).toBe(V30_PINS[name].raw)
  const save = validateSaveV30(JSON.parse(raw)) // the genuine frozen validator FIRST
  expect(save.state.market.tick).toBe(V30_PINS[name].week)
  return save
}
/** The lifted V31 world: EMPTY root, everything else the V30 bytes (family 9 proves it byte-for-byte). */
function lifted(name: CorpusName): GameState {
  const state = migrateToV31(fixture(name)).state as GameState
  expect(edges(state)).toEqual([])
  return state
}
const edges = (state: GameState): readonly Edge[] => (state as unknown as { relationships: readonly Edge[] }).relationships
const withEdges = (state: GameState, relationships: readonly Edge[]): GameState => ({ ...state, relationships } as unknown as GameState)
/** The governed strict entry (no manual version stamp): admitted iff the live validator admits it. */
function live(state: GameState): GameState {
  const validated = makeSave(state)
  expect(validated.saveVersion).toBe(LIVE_SAVE_VERSION)
  return validated.state as GameState
}
const canon = (x: string, y: string): [string, string] => (x < y ? [x, y] : [y, x]) // §5.7 :486, code-unit order
const findEdge = (state: GameState, x: string, y: string): Edge | undefined => {
  const [a, b] = canon(x, y)
  return edges(state).find((e) => e.a === a && e.b === b)
}
const weightOf = { HIGH: () => RELATIONSHIP_PROXIMITY_HIGH, MID: () => RELATIONSHIP_PROXIMITY_MID, LOW: () => RELATIONSHIP_PROXIMITY_LOW }
/** The six pairs in the RECEIPT'S OWN SEAT ORDER with the §5.4 :439 proximity class (scope (2a)). */
function seatPairs(take: { directorId: string; cast: Record<CastSlot, string> }): { x: string; y: string; weight: keyof typeof weightOf }[] {
  return [
    { x: take.directorId, y: take.cast.lead, weight: 'HIGH' }, { x: take.directorId, y: take.cast.antagonist, weight: 'MID' },
    { x: take.directorId, y: take.cast.support, weight: 'LOW' }, { x: take.cast.lead, y: take.cast.antagonist, weight: 'HIGH' },
    { x: take.cast.lead, y: take.cast.support, weight: 'MID' }, { x: take.cast.antagonist, y: take.cast.support, weight: 'LOW' },
  ]
}
const clamp = (v: number) => Math.max(0, Math.min(100, v))
/** Independent drift oracle — plan scope (3), the formula as written; never `currentCloseness` as its own oracle. */
function driftOracle(closeness: number, dormant: number): number {
  if (dormant <= RELATIONSHIP_DRIFT_GRACE_WEEKS) return closeness
  const span = Math.min(dormant - RELATIONSHIP_DRIFT_GRACE_WEEKS, RELATIONSHIP_DRIFT_RETURN_WEEKS)
  return closeness + Math.trunc((RELATIONSHIP_BASELINE - closeness) * span / RELATIONSHIP_DRIFT_RETURN_WEEKS)
}
const floor = (tier: Tier): number => (RELATIONSHIP_TIER_FLOOR as Record<Tier, number>)[tier]
function bandOracle(closeness: number): Tier {
  let band: Tier = 'Nemeses'
  for (const tier of LADDER) if (closeness >= floor(tier)) band = tier
  return band
}
/** §5.3 :423-425 under RULES 1: Nemeses/Enemies need a conflict record; B.5 mints none ⇒ those bands READ Strained. */
const tierOracle = (closeness: number): Tier => { const band = bandOracle(closeness); return band === 'Nemeses' || band === 'Enemies' ? 'Strained' : band }
const rank = (tier: Tier) => LADDER.indexOf(tier)
function mintedEdge(index: number, x: string, y: string, weight: number, week: number, ref: string): Edge {
  const [a, b] = canon(x, y)
  const closeness = clamp(RELATIONSHIP_BASELINE + weight)
  return { edgeId: `relationship-edge-${String(index)}`, a, b, closeness, firstSharedWeek: week, lastEventWeek: week,
    sharedProductions: 1, sharedSuccesses: 0, sharedFailures: 0, sharedCancellations: 0, peakTier: tierOracle(closeness), peakTierWeek: week,
    recent: [{ kind: 'sharedProduction', week, ref, delta: weight }] }
}
/** A STAGED (reader-admitted, validator-checked) edge — never a claim that the engine minted it. */
function stagedEdge(state: GameState, x: string, y: string, closeness: number, lastEventWeek: number, extra: Partial<Edge> = {}): Edge {
  const [a, b] = canon(x, y)
  const tier = tierOracle(closeness)
  return { edgeId: `relationship-edge-${String(edges(state).length)}`, a, b, closeness, firstSharedWeek: lastEventWeek, lastEventWeek,
    sharedProductions: 1, sharedSuccesses: 0, sharedFailures: 0, sharedCancellations: 0, peakTier: tier, peakTierWeek: lastEventWeek,
    recent: [{ kind: 'sharedProduction', week: lastEventWeek, ref: 'staged-production', delta: RELATIONSHIP_PROXIMITY_HIGH }], ...extra }
}
const stage = (state: GameState, edge: Edge): GameState => live(withEdges(state, [...edges(state), edge]))
const bytes = (state: GameState): string => { const { relationships: _r, ...rest } = state as unknown as Record<string, unknown>; return JSON.stringify(rest) }
function stripRoot(state: GameState): GameState { const { relationships: _r, ...rest } = state as unknown as Record<string, unknown>; return rest as unknown as GameState }

// ── the family-1 world: the genuine player picture at remainingTicks 5, the take scheduled, ONE tick ──
let takeCache: { pre: GameState; after: GameState; production: Production } | undefined
function takeWorld() {
  if (takeCache === undefined) {
    const state = lifted('first-take-at-five')
    const production = state.studio.activeProductions.find((p) => p.id === FROZEN.productionId)
    assert.ok(production, 'T0 premise: prod-0052 missing on genuine-v30-first-take-at-five')
    expect(production.remainingTicks).toBe(5)
    expect(production.directorId).toBe(FROZEN.directorId)
    expect(production.cast).toEqual(FROZEN.cast)
    expect(state.firstTakes.some((t) => t.productionId === production.id)).toBe(false)
    const pre = applyActions(state, [{ kind: 'assignShootingDirector', productionId: production.id, directorId: production.directorId },
      { kind: 'scheduleShootingTake', productionId: production.id }])
    expect(edges(pre)).toEqual([]) // an action mints nothing (S20: the take is the event)
    const after = tick(pre)
    takeCache = { pre, after, production: clone(production) }
  }
  return { pre: clone(takeCache.pre), after: clone(takeCache.after), production: clone(takeCache.production) }
}
/** The real release: Release Ready at 64, the ONE explicit commitment, landed at 65 (releaseTick 64). */
let releaseCache: { before: GameState; after: GameState; film: FilmResult } | undefined
function releaseWorld() {
  if (releaseCache === undefined) {
    let state = takeWorld().after
    for (let guard = 0; state.operations.workflows.find((w) => w.productionId === FROZEN.productionId)?.phase !== 'releaseReady'; guard++) {
      if (guard > 6) throw new Error('UNEXECUTED premise: the genuine picture never reached Release Ready within 6 ticks of its take')
      state = tick(state)
    }
    expect(state.market.tick).toBe(FROZEN.releaseCommitWeek)
    const before = applyActions(state, [{ kind: 'commitPictureToRelease', productionId: FROZEN.productionId }])
    const after = tick(before)
    const film = after.studio.releasedFilms.find((f) => f.productionId === FROZEN.productionId)
    assert.ok(film, 'UNEXECUTED premise: the committed picture did not release on the next tick')
    expect(after.market.tick).toBe(FROZEN.releaseWeek)
    expect(film.releaseTick).toBe(FROZEN.releaseWeek - 1) // tick.ts :623/:642 — the pre-increment week
    releaseCache = { before, after, film: clone(film) }
  }
  return { before: clone(releaseCache.before), after: clone(releaseCache.after), film: clone(releaseCache.film) }
}
/** The rival chain on `rival-current-p1-and-p2` (196): states after the first post-migration rival take, its release
 * and the same studio's repeat take. Weeks are FROZEN premises (the 208 churn on this campaign is not D5-exposed:
 * ledger §C), asserted, never searched for. */
type RivalWorlds = { atFirstTake: GameState; beforeFirstTake: GameState; atRelease: GameState; beforeRelease: GameState; atRepeat: GameState; beforeRepeat: GameState }
let rivalCache: RivalWorlds | undefined
function rivalWorld(): RivalWorlds {
  if (rivalCache === undefined) {
    let state = lifted('rival-current-p1-and-p2')
    const takesBefore = state.firstTakes.length
    const out: Partial<RivalWorlds> = {}
    for (let guard = 0; state.market.tick < FROZEN.rival.repeatTakeWeek; guard++) {
      if (guard > 40) throw new Error('UNEXECUTED premise: the rival chain did not reach the repeat take')
      const before = state
      state = tick(state)
      const week = state.market.tick
      const newTakes = state.firstTakes.slice(before.firstTakes.length)
      const newFilms = state.hollywood!.films.slice(before.hollywood!.films.length)
      if (week === FROZEN.rival.firstTakeWeek) {
        expect(newTakes.map((t) => t.productionId)).toEqual([FROZEN.rival.firstTake]) // moved premise ⇒ loud
        expect(state.firstTakes.length).toBe(takesBefore + 1)
        out.beforeFirstTake = before; out.atFirstTake = state
      } else if (week === FROZEN.rival.firstReleaseWeek) {
        expect(newFilms.map((f) => f.filmId)).toEqual([FROZEN.rival.firstTake])
        out.beforeRelease = before; out.atRelease = state
      } else if (week === FROZEN.rival.repeatTakeWeek) {
        expect(newTakes.map((t) => t.productionId)).toEqual([FROZEN.rival.repeatTake])
        out.beforeRepeat = before; out.atRepeat = state
      } else {
        expect(newTakes).toEqual([]) // no other take between 196 and 222 on this chain (measured)
      }
    }
    for (const key of ['atFirstTake', 'beforeFirstTake', 'atRelease', 'beforeRelease', 'atRepeat', 'beforeRepeat'] as const) {
      assert.ok(out[key], `chain premise: ${key} was not reached on the rival chain (moved chain, not a pass)`)
    }
    rivalCache = out as RivalWorlds
  }
  return clone(rivalCache)
}

// ── the family-6 base: the B.2 T3 controlled staging (plan :573) under the D1 predicate (647-B R7) ──
// Two survivors (player + r01), every landed band equal, three bidders dropped by IMPOSSIBLE attachments;
// the player's roster at 208 holds ONE off-cycle `player-contract` row (signed at 60 for 156 weeks), one row
// closed AT 208 (signed at 0 for 208 weeks) and nothing else. Measured on unchanged source: DECLINE by the tie order.
const F6 = { seed: 'p13-public-commercial-adoption', subject: 'person-studio-5a47d054-r04-3', incumbent: 'studio-5a47d054-r04', W: 208 } as const
function signActor(state: GameState, termWeeks: number, exclude: readonly string[] = []) {
  const id = hiringMarketIds(state, state.market.tick).map((i) => state.talent.find((t) => t.id === i))
    .find((t) => t?.role === 'actor' && !exclude.includes(t.id))?.id
  if (id === undefined) throw new Error('fixture premise failed: no signable actor')
  return { state: applyActions(state, [{ kind: 'signContract', talentId: id, termWeeks }]), id }
}
/** The D1 predicate (plan scope (5)): strict at W on both ends, subject excluded. */
function rosterAt(state: GameState, issuer: string, subject: string, week: number): string[] {
  return state.hollywood!.employment
    .filter((e) => e.studioId === issuer && e.terms.talentId !== subject && e.terms.startWeek < week && (e.endedWeek === null || week < e.endedWeek))
    .map((e) => e.terms.talentId)
}
type F6Base = { at207: GameState; playerId: string; r01: string; reliable: string; closedAtW: string; offCycle: string; free: string }
let f6Cache: F6Base | undefined
function f6Base(): F6Base {
  if (f6Cache === undefined) {
    let state = fund(p13aGeneratedStudio(F6.seed))
    const reliable = signActor(state, 52); state = reliable.state // ranToEnd at 52: the player's Reliable studio fallback
    const closedAtW = signActor(state, 208, [reliable.id]); state = closedAtW.state // 0 → 208: closed AT W by finishHollywoodWeek
    state = advanceTo(state, 60)
    const offCycle = signActor(state, 156, [reliable.id, closedAtW.id]); state = offCycle.state // 60 → 216: ON the roster at 208
    state = advanceTo(state, 195)
    let preMarket196: GameState | undefined
    const real = marketModule.advanceTalentMarketWeek
    const capture = vi.spyOn(marketModule, 'advanceTalentMarketWeek').mockImplementation((input) => {
      if (input.market.tick === 196) preMarket196 = clone(input)
      return real(input)
    })
    try { tick(state) } finally { capture.mockRestore() }
    if (preMarket196 === undefined) throw new Error('F6 premise: no real week-196 market input captured')
    state = preMarket196
    const playerId = player(state)
    const row = state.hollywood!.employment.find((e) => e.studioId === F6.incumbent && e.terms.talentId === F6.subject && e.endedWeek === null)
    assert.ok(row, 'F6 premise: the subject holds no live r04 row at 196')
    expect(row.terms.endWeekExclusive).toBe(F6.W)
    expect(state.talentMarket.cases.some((c) => c.talentId === F6.subject)).toBe(false)
    const counter = state.talentMarket.receipts.length
    const kase: TalentMarketCase = { talentId: F6.subject, subjectStudioId: F6.incumbent, contractId: row.contractId, openedWeek: 196, outcome: null, closedWeek: null, reason: null }
    const discovery: TalentMarketReceipt = { eventId: `talent-market-event-${String(counter)}`, kind: 'discovered', week: 196, talentId: F6.subject, studioId: F6.incumbent, reasons: [], dropped: [] }
    state = { ...state, talentMarket: { ...state.talentMarket, cases: [...state.talentMarket.cases, kase], receipts: [...state.talentMarket.receipts, discovery] } }
    const entered = state.hollywood!.identities.filter((s) => s.enteredWeek !== null)
    expect(entered).toHaveLength(5)
    for (const issuer of entered) state = submitProposal(state, { talentId: F6.subject, issuerStudioId: issuer.studioId, termWeeks: 208, premiumTier: 1 })
    state = advanceTo(marketModule.advanceTalentMarketWeek(state), 207)
    expect(marketModule.currentProposals(state, F6.subject)).toHaveLength(5)
    const r01 = entered.find((s) => s.studioId.endsWith('-r01'))!.studioId
    for (const issuer of entered.filter((s) => ![playerId, r01].includes(s.studioId))) {
      // The B.2 T3 device: a staged IMPOSSIBLE draft is refused at freeze (promiseNotFeasible); no drop is forged.
      state = attachPromise(state, F6.subject, issuer.studioId, { family: 'APPEARANCE_COUNT', predicate: { count: 999 }, windowStartWeek: 415, dueWeekExclusive: 416 })
    }
    // Explicit synthetic Standing INPUT (identical in every branch), never a claimed standing event.
    const standing = state.hollywood!.businesses.find((b) => b.studioId === r01)!.standing
    state = { ...state, studio: { ...state.studio, standing: { ...standing } } }
    // 662-T2b amendment (RED-side premise, no law decided): the hiring market rotates every
    // HIRING_MARKET_ROTATION_WEEKS (13) and 208 = 16 x 13 opens a new epoch, so the week-207 listing is
    // resampled at 208. The committed-at-W probe signs the SAME actor at 207 (branch ii) and inside the 208
    // pass (branch i), so the actor must be listed in BOTH weeks; the :851 guard still measures the 208 listing
    // on the real pre-market input, never a forged row.
    const listedAt208 = new Set(hiringMarketIds(state, F6.W))
    const free = hiringMarketIds(state, 207).map((i) => state.talent.find((t) => t.id === i))
      .find((t) => t?.role === 'actor' && listedAt208.has(t.id) && ![reliable.id, closedAtW.id, offCycle.id].includes(t.id))?.id
    if (free === undefined) throw new Error('F6 premise: no actor listed at both 207 and 208 for the committed-at-W probe')
    expect(state.market.tick).toBe(207)
    // 662-T2 amendment (658-W item 1; plan (2a) is symmetric across studios — family 2 asserts a RIVAL take mints
    // six edges, so the root is NOT empty on this campaign at 207). The premise family 6 needs: the player filmed
    // nothing (no player take), so no edge touches anyone on the player's roster at W — the staged edge is the
    // ONLY D5 signal the player can hold, and the base is a pure tie.
    expect(state.firstTakes.filter((t) => t.studioId === playerId)).toEqual([])
    const playerRosterAtW = new Set(rosterAt(state, playerId, F6.subject, F6.W))
    expect(playerRosterAtW.has(offCycle.id)).toBe(true)
    expect(edges(state).filter((e) => playerRosterAtW.has(e.a) || playerRosterAtW.has(e.b))).toEqual([])
    expect(findEdge(state, F6.subject, offCycle.id)).toBeUndefined()
    f6Cache = { at207: state, playerId, r01, reliable: reliable.id, closedAtW: closedAtW.id, offCycle: offCycle.id, free }
  }
  return clone(f6Cache)
}
function settlementAt208(state: GameState) {
  const receipt = state.talentMarket.receipts.find((r) => r.talentId === F6.subject && r.week === F6.W && (r.kind === 'settled' || r.kind === 'declined'))
  assert.ok(receipt, 'F6: no settlement receipt at 208')
  return receipt
}
const newSentences = (reasons: readonly string[]) => reasons.filter((s) => !FROZEN_REASONS.has(s))

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('P14B.5 T1 — the module and its named exports exist (RED at import; never a spurious pass)', () => {
  it('every binding this file calls is a function or a defined constant', () => {
    for (const fn of [advanceRelationshipsWeek, recordCancelledAfterFirstTake, currentCloseness, currentTier, pairChemistry,
      validateRelationshipsRoot, projectRelationshipsPreV31, driverGain, requireRelationshipsRoot, migrateToV31, validateSaveV31]) {
      expect(typeof fn).toBe('function')
    }
    for (const constant of [RELATIONSHIP_BASELINE, RELATIONSHIP_PROXIMITY_HIGH, RELATIONSHIP_PROXIMITY_MID, RELATIONSHIP_PROXIMITY_LOW,
      RELATIONSHIP_REPEAT_CAP, RELATIONSHIP_SUCCESS_DELTA, RELATIONSHIP_FAILURE_DELTA, RELATIONSHIP_CANCEL_DELTA,
      RELATIONSHIP_SUCCESS_CRITIC_SCORE, RELATIONSHIP_FAILURE_CRITIC_SCORE, RELATIONSHIP_DRIFT_GRACE_WEEKS,
      RELATIONSHIP_DRIFT_RETURN_WEEKS, RELATIONSHIP_RECENT_CAP, RELATIONSHIP_RULES_VERSION]) {
      expect(Number.isInteger(constant)).toBe(true)
    }
    expect(RELATIONSHIP_TIER_FLOOR).toBeDefined()
    expect([...RELATIONSHIP_TIERS]).toEqual(LADDER)
    expect([...RELATIONSHIP_DRIVER_KINDS].sort()).toEqual([...KINDS].sort())
  })

  it('the hypothesis constants carry the companion values named in the expansion and the ONE pinned relation', () => {
    // 647-B ruling (i) on OPEN 4: integer 0–100, baseline 50 fixed (§5.1 :401's random 45–55 replaced by one constant).
    expect(RELATIONSHIP_BASELINE).toBe(50)
    expect(RELATIONSHIP_DRIFT_GRACE_WEEKS).toBe(52) // §5.5 :467
    expect(RELATIONSHIP_DRIFT_RETURN_WEEKS).toBe(260) // §5.5 :467
    expect(RELATIONSHIP_RECENT_CAP).toBe(8) // OPEN 16 as folded
    expect(RELATIONSHIP_RULES_VERSION).toBe(1) // scope (3), code-only
    // 647-B ruling (ii) on OPEN 5: pinned BY NAME — a relation between two hypotheses, not a value.
    expect(RELATIONSHIP_FAILURE_DELTA).toBeGreaterThan(RELATIONSHIP_PROXIMITY_LOW)
    // §5.4 :439 proximity classes: director–lead / co-leads highest, supporting lowest.
    expect(RELATIONSHIP_PROXIMITY_HIGH).toBeGreaterThanOrEqual(RELATIONSHIP_PROXIMITY_MID)
    expect(RELATIONSHIP_PROXIMITY_MID).toBeGreaterThanOrEqual(RELATIONSHIP_PROXIMITY_LOW)
    for (const delta of [RELATIONSHIP_PROXIMITY_LOW, RELATIONSHIP_REPEAT_CAP, RELATIONSHIP_SUCCESS_DELTA, RELATIONSHIP_FAILURE_DELTA, RELATIONSHIP_CANCEL_DELTA]) {
      expect(delta).toBeGreaterThan(0) // every driver has a sign (§5.4); a zero delta would be a driver with no effect
    }
    expect(RELATIONSHIP_SUCCESS_CRITIC_SCORE).toBeGreaterThanOrEqual(RELATIONSHIP_FAILURE_CRITIC_SCORE) // "above a threshold" / below one; a gap may be empty, never inverted
    // The seven tier edges (I1): strictly ascending, Nemeses at 0, the baseline INSIDE Acquaintances (§5.3 :426 "neutral baseline").
    expect(floor('Nemeses')).toBe(0)
    for (let i = 1; i < LADDER.length; i++) expect(floor(LADDER[i]!)).toBeGreaterThan(floor(LADDER[i - 1]!))
    expect(floor('Inseparable')).toBeLessThanOrEqual(100)
    expect(RELATIONSHIP_BASELINE).toBeGreaterThanOrEqual(floor('Acquaintances'))
    expect(RELATIONSHIP_BASELINE).toBeLessThan(floor('Colleagues'))
    // OPEN 1 (Q2, stays OPEN): the reversible mechanism is a pure pass-through today.
    const world = takeWorld().after
    expect(driverGain(world, FROZEN.cast.lead, FROZEN.directorId, RELATIONSHIP_PROXIMITY_HIGH)).toBe(RELATIONSHIP_PROXIMITY_HIGH)
    expect(driverGain(world, FROZEN.cast.lead, FROZEN.directorId, -RELATIONSHIP_FAILURE_DELTA)).toBe(-RELATIONSHIP_FAILURE_DELTA)
  })
})

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('family 1 — EDGE MINTING at the tick tail from the advance\'s delta (scope (2), (2a))', () => {
  it('the seam exists and refuses in the copied guard order: empty delta before the root guard, then the LOUD root guard, then hollywood null', () => {
    expect(typeof advanceRelationshipsWeek).toBe('function')
    const world = takeWorld().pre
    const rootless = stripRoot(world)
    // appendFirstTakes :125-127 order (647-B record-only): an EMPTY delta returns the state unchanged BEFORE the root guard.
    expect(advanceRelationshipsWeek(rootless, { takes: [], releases: [] }, world.market.tick)).toBe(rootless)
    // A non-empty delta on a state without the root is a migration fault, refused loudly (the requirePromiseRoots model :88-92).
    const production = world.studio.activeProductions.find((p) => p.id === FROZEN.productionId)!
    const entry: TakeEntry = { studioId: player(world), production }
    expect(() => advanceRelationshipsWeek(rootless, { takes: [entry], releases: [] }, world.market.tick)).toThrow(/relationships|V31|migrate/i)
    expect(() => requireRelationshipsRoot(rootless)).toThrow(/relationships|V31|migrate/i)
    expect(requireRelationshipsRoot(world)).toBeUndefined()
  })

  it('advancing the genuine player picture through its first take mints EXACTLY six edges in the receipt\'s seat order, each with the proximity delta and every week = the tail week', () => {
    const { after, production } = takeWorld()
    const week = after.market.tick
    expect(week).toBe(FROZEN.takeWeek)
    const take = after.firstTakes.find((t) => t.productionId === production.id)
    assert.ok(take)
    expect(take).toMatchObject({ eventId: FROZEN.takeEventId, week, studioId: player(after), directorId: FROZEN.directorId, cast: FROZEN.cast })
    // Q3 by construction: the 24 pre-migration rival takes on this world mint NOTHING; only this advance's delta does.
    const expected = seatPairs(take).map((p, i) => mintedEdge(i, p.x, p.y, weightOf[p.weight](), week, production.id))
    expect(edges(after)).toEqual(expected)
    expect(edges(after).map((e) => e.edgeId)).toEqual(expected.map((_, i) => `relationship-edge-${String(i)}`))
    for (const edge of edges(after)) {
      expect(edge.a < edge.b).toBe(true)
      expect(Number.isInteger(edge.closeness) && edge.closeness >= 0 && edge.closeness <= 100).toBe(true)
      expect(edge.firstSharedWeek).toBe(week); expect(edge.lastEventWeek).toBe(week)
      expect(edge.recent.every((d) => d.week === week && d.ref === production.id)).toBe(true)
      expect(currentTier(edge, week)).toBe(edge.peakTier)
    }
  })

  it('a second advance from the same pre-take state mints byte-identical edges (replay); re-ticking the post-take state leaves the six untouched (idempotent) and mints only from THAT week\'s delta', () => {
    const { pre, after } = takeWorld()
    const again = tick(clone(pre))
    expect(JSON.stringify(edges(again))).toBe(JSON.stringify(edges(after)))
    expect(JSON.stringify(again)).toBe(JSON.stringify(after)) // scope (8): deterministic, copy-on-write, no cache
    const six = edges(after)
    const next = tick(after)
    for (const edge of six) expect(findEdge(next, edge.a, edge.b)).toEqual(edge)
    // Anything new was minted from THIS week's takes only (never a scan of a root).
    const newTakes = next.firstTakes.slice(after.firstTakes.length)
    for (const extra of edges(next).filter((e) => !six.some((s) => s.edgeId === e.edgeId))) {
      expect(extra.firstSharedWeek).toBe(next.market.tick)
      expect(newTakes.some((t) => seatPairs(t).some((p) => canon(p.x, p.y)[0] === extra.a && canon(p.x, p.y)[1] === extra.b))).toBe(true)
    }
    // The seam replayed on the SAME delta mints nothing twice: idempotent by (edgeId, kind, ref).
    const production = pre.studio.activeProductions.find((p) => p.id === FROZEN.productionId)!
    const replayed = advanceRelationshipsWeek(after, { takes: [{ studioId: player(after), production }], releases: [] }, after.market.tick)
    expect(JSON.stringify(edges(replayed))).toBe(JSON.stringify(six))
  })

  it('no RNG reaches the seam: rngState is byte-equal before/after the seam and the tick\'s rngState equals the frozen control; everything but the root is byte-identical to the frozen post-tick state', () => {
    const { pre, after } = takeWorld()
    expect(JSON.stringify(after.rngState)).toBe(JSON.stringify(pre.rngState)) // the take week consumes no sim RNG (measured)
    expect(after.rngState).toBe(FROZEN.rngAfterTake)
    expect(sha(bytes(after))).toBe(FROZEN.postTakeDigestStripped) // CANNOT-MOVE class: the pre-settlement chain
    const production = pre.studio.activeProductions.find((p) => p.id === FROZEN.productionId)!
    const direct = advanceRelationshipsWeek(withEdges(pre, []), { takes: [{ studioId: player(pre), production }], releases: [] }, pre.market.tick + 1)
    expect(JSON.stringify(direct.rngState)).toBe(JSON.stringify(pre.rngState))
    expect(edges(direct)).toHaveLength(6)
  })

  it('a person seated twice on one take is refused loudly, never skipped', () => {
    const { pre } = takeWorld()
    const production = pre.studio.activeProductions.find((p) => p.id === FROZEN.productionId)!
    const twice: Production = { ...production, cast: { ...production.cast, support: production.cast.lead } } // explicitly malformed seam input
    expect(() => advanceRelationshipsWeek(pre, { takes: [{ studioId: player(pre), production: twice }], releases: [] }, pre.market.tick + 1)).toThrow()
  })

  it('a headless world (legacy-v28-shooting-5: hollywood null) lifted through migrateToV31 keeps relationships empty across a tick', () => {
    assert.ok(existsSync(legacyV28), 'frozen fixture missing: legacy-v28-shooting-5.json.gz (plan :523)')
    const raw = JSON.parse(gunzipSync(readFileSync(legacyV28)).toString('utf8')) as { saveVersion: number }
    expect(raw.saveVersion).toBe(28)
    const state = migrateToV31(raw).state as GameState
    expect(state.hollywood).toBeNull()
    expect(state.market.tick).toBe(16)
    expect(edges(state)).toEqual([])
    const next = tick(state)
    expect(edges(next)).toEqual([])
    expect(next.firstTakes).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('family 2 — CANONICAL KEY and REPETITION on the rival chain (scope (2a); S25 symmetry)', () => {
  it('the first post-migration RIVAL take mints six edges under the same law; the 45 pre-migration takes mint none (Q3)', () => {
    expect(typeof advanceRelationshipsWeek).toBe('function')
    const { beforeFirstTake, atFirstTake } = rivalWorld()
    expect(edges(beforeFirstTake)).toEqual([])
    const take = atFirstTake.firstTakes.find((t) => t.productionId === FROZEN.rival.firstTake)!
    expect(take.studioId).toBe(FROZEN.rival.studioId)
    const expected = seatPairs(take).map((p, i) => mintedEdge(i, p.x, p.y, weightOf[p.weight](), atFirstTake.market.tick, take.productionId))
    expect(edges(atFirstTake)).toEqual(expected)
  }, 60_000)

  it('the same pair on a second production is ONE edge with sharedProductions 2 and a repeatedCollaboration driver of the capped accelerator; a < b regardless of seat order', () => {
    const { beforeRepeat, atRepeat } = rivalWorld()
    const week = atRepeat.market.tick
    const repeat = atRepeat.firstTakes.find((t) => t.productionId === FROZEN.rival.repeatTake)!
    const first = atRepeat.firstTakes.find((t) => t.productionId === FROZEN.rival.firstTake)!
    const repeated = seatPairs(repeat).filter((p) => seatPairs(first).some((q) => canon(q.x, q.y).join('|') === canon(p.x, p.y).join('|')))
    assert.ok(repeated.length > 0, 'chain premise: the repeat take shares no pair with the first take (moved chain, not a pass)')
    for (const p of seatPairs(repeat)) {
      const before = findEdge(beforeRepeat, p.x, p.y)
      const edge = findEdge(atRepeat, p.x, p.y)
      assert.ok(edge)
      expect([edge.a, edge.b]).toEqual(canon(p.x, p.y))
      expect(edges(atRepeat).filter((e) => e.a === edge.a && e.b === edge.b)).toHaveLength(1)
      const weight = weightOf[p.weight]()
      if (before === undefined) {
        expect(edge).toMatchObject({ sharedProductions: 1, firstSharedWeek: week, lastEventWeek: week, recent: [{ kind: 'sharedProduction', week, ref: repeat.productionId, delta: weight }] })
        continue
      }
      const accelerator = Math.min(before.sharedProductions + 1 - 1, RELATIONSHIP_REPEAT_CAP) // :442 "increasing, capped"
      expect(edge.sharedProductions).toBe(before.sharedProductions + 1)
      expect(edge.firstSharedWeek).toBe(before.firstSharedWeek)
      expect(edge.lastEventWeek).toBe(week)
      expect(edge.recent.slice(-2)).toEqual([
        { kind: 'sharedProduction', week, ref: repeat.productionId, delta: weight },
        { kind: 'repeatedCollaboration', week, ref: repeat.productionId, delta: accelerator },
      ])
      expect(edge.closeness).toBe(clamp(driftOracle(before.closeness, week - before.lastEventWeek) + weight + accelerator))
      expect(edge.sharedSuccesses).toBe(before.sharedSuccesses); expect(edge.sharedFailures).toBe(before.sharedFailures)
      expect(rank(edge.peakTier)).toBeGreaterThanOrEqual(rank(before.peakTier))
    }
  }, 60_000)
})

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('family 3 — DRIFT ON READ and FOLD-BY-COUNT (scope (3), (9); §5.5 :467-468)', () => {
  const staged = (closeness: number, lastEventWeek: number): Edge => {
    const world = takeWorld().after
    return stagedEdge(world, FROZEN.cast.lead, FROZEN.cast.support, closeness, lastEventWeek)
  }

  it('currentCloseness/currentTier are functions; inside the grace window the stored value and tier read unchanged', () => {
    expect(typeof currentCloseness).toBe('function'); expect(typeof currentTier).toBe('function')
    const w = 61
    const edge = staged(floor('CloseFriends'), w)
    for (const at of [w, w + 1, w + RELATIONSHIP_DRIFT_GRACE_WEEKS]) {
      expect(currentCloseness(edge, at)).toBe(edge.closeness)
      expect(currentTier(edge, at)).toBe('CloseFriends')
    }
  })

  it('past the grace window the value drifts toward the baseline by the plan formula (independent oracle), from either side, never past it, and is fully returned at GRACE + RETURN', () => {
    const w = 61
    for (const start of [floor('Inseparable'), floor('CloseFriends'), floor('Friends'), floor('Colleagues'), floor('Strained'), floor('Enemies'), 0, 100]) {
      const edge = staged(start, w)
      let previous = start
      for (let dormant = RELATIONSHIP_DRIFT_GRACE_WEEKS + 1; dormant <= RELATIONSHIP_DRIFT_GRACE_WEEKS + RELATIONSHIP_DRIFT_RETURN_WEEKS + 5; dormant += 7) {
        const value = currentCloseness(edge, w + dormant)
        expect(value).toBe(driftOracle(start, dormant))
        expect(Number.isInteger(value)).toBe(true)
        // toward the baseline, monotone, never past it
        if (start >= RELATIONSHIP_BASELINE) { expect(value).toBeLessThanOrEqual(previous); expect(value).toBeGreaterThanOrEqual(RELATIONSHIP_BASELINE) }
        else { expect(value).toBeGreaterThanOrEqual(previous); expect(value).toBeLessThanOrEqual(RELATIONSHIP_BASELINE) }
        expect(currentTier(edge, w + dormant)).toBe(tierOracle(value))
        previous = value
      }
      expect(currentCloseness(edge, w + RELATIONSHIP_DRIFT_GRACE_WEEKS + RELATIONSHIP_DRIFT_RETURN_WEEKS)).toBe(RELATIONSHIP_BASELINE)
      expect(currentTier(edge, w + RELATIONSHIP_DRIFT_GRACE_WEEKS + RELATIONSHIP_DRIFT_RETURN_WEEKS)).toBe('Acquaintances')
    }
  })

  it('drift never moves a tier AWAY from Acquaintances and touches no counter, milestone or peak (a read is pure)', () => {
    const w = 61
    for (const start of [floor('Inseparable'), floor('Strained'), 5]) {
      const edge = staged(start, w)
      const frozen = JSON.stringify(edge)
      const startRank = rank(tierOracle(start))
      for (let dormant = 0; dormant <= RELATIONSHIP_DRIFT_GRACE_WEEKS + RELATIONSHIP_DRIFT_RETURN_WEEKS; dormant += 13) {
        const tier = currentTier(edge, w + dormant)
        // the distance from Acquaintances never grows
        expect(Math.abs(rank(tier) - rank('Acquaintances'))).toBeLessThanOrEqual(Math.abs(startRank - rank('Acquaintances')))
        expect(JSON.stringify(edge)).toBe(frozen)
      }
    }
  })

  it('a WRITE after dormancy materialises the drifted value first, then applies the delta; counters, firstSharedWeek and the peak survive; recent folds by count at the cap', () => {
    const { after: world, production } = takeWorld()
    const { film } = releaseWorld()
    const w = world.market.tick
    const dormantWeek = w + RELATIONSHIP_DRIFT_GRACE_WEEKS + Math.trunc(RELATIONSHIP_DRIFT_RETURN_WEEKS / 2)
    // Staged variant of ONE genuinely minted edge (director–support): a full `recent` window and a raised value.
    const base = findEdge(world, FROZEN.directorId, FROZEN.cast.support)!
    const full: Driver[] = Array.from({ length: RELATIONSHIP_RECENT_CAP }, (_, i) => ({ kind: 'sharedProduction', week: w, ref: `staged-${String(i)}`, delta: RELATIONSHIP_PROXIMITY_LOW }))
    const variant: Edge = { ...base, closeness: floor('Inseparable'), peakTier: 'Inseparable', peakTierWeek: w, sharedProductions: RELATIONSHIP_RECENT_CAP, recent: full }
    const stagedWorld = live(withEdges(world, edges(world).map((e) => (e.edgeId === base.edgeId ? variant : e))))
    // A dormant world at `dormantWeek`: only the clock moves (pure-read input), the release fact is the real one.
    const dormant: GameState = { ...stagedWorld, market: { ...stagedWorld.market, tick: dormantWeek } }
    const success: FilmResult = { ...film, criticScore: RELATIONSHIP_SUCCESS_CRITIC_SCORE } // IN-MEMORY RELEASE-RESULT VARIANT (I3)
    const written = advanceRelationshipsWeek(dormant, { takes: [], releases: [success] }, dormantWeek)
    const edge = findEdge(written, FROZEN.directorId, FROZEN.cast.support)!
    const drifted = driftOracle(variant.closeness, dormantWeek - variant.lastEventWeek)
    expect(drifted).toBeLessThan(variant.closeness) // the dormancy really moved it (premise of the materialisation check)
    expect(edge.closeness).toBe(clamp(drifted + RELATIONSHIP_SUCCESS_DELTA))
    expect(edge.lastEventWeek).toBe(dormantWeek)
    expect(edge.firstSharedWeek).toBe(variant.firstSharedWeek)
    expect(edge).toMatchObject({ sharedProductions: RELATIONSHIP_RECENT_CAP, sharedSuccesses: 1, sharedFailures: 0, sharedCancellations: 0, peakTier: 'Inseparable', peakTierWeek: w })
    expect(edge.recent).toHaveLength(RELATIONSHIP_RECENT_CAP) // fold-by-count: the oldest folds OUT at write, the counters keep the count
    expect(edge.recent[0]).toEqual(full[1])
    expect(edge.recent.at(-1)).toEqual({ kind: 'sharedSuccess', week: dormantWeek, ref: production.id, delta: RELATIONSHIP_SUCCESS_DELTA })
    expect(edges(written).every((e) => e.recent.length <= RELATIONSHIP_RECENT_CAP)).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('family 4 — TIER RULE under RELATIONSHIP_RULES_VERSION 1 and the D2 reachability (scope (3)-(4))', () => {
  it('eight members, byte-equal output for byte-equal input, and a value in the Enemies/Nemeses bands WITHOUT a conflict record reads Strained', () => {
    expect(typeof currentTier).toBe('function')
    expect(RELATIONSHIP_RULES_VERSION).toBe(1)
    expect(new Set(RELATIONSHIP_TIERS).size).toBe(8)
    const world = takeWorld().after
    for (const tier of LADDER) {
      const edge = stagedEdge(world, FROZEN.cast.lead, FROZEN.cast.support, floor(tier), world.market.tick)
      const read = currentTier(edge, world.market.tick)
      expect(read).toBe(tierOracle(floor(tier)))
      expect(currentTier(clone(edge), world.market.tick)).toBe(read)
      if (tier === 'Nemeses' || tier === 'Enemies') expect(read).toBe('Strained') // §5.3 :423-425 evidence condition; B.5 mints no conflict record
    }
    expect(currentTier(stagedEdge(world, FROZEN.cast.lead, FROZEN.cast.support, 0, world.market.tick), world.market.tick)).toBe('Strained')
    expect(currentTier(stagedEdge(world, FROZEN.cast.lead, FROZEN.cast.support, 100, world.market.tick), world.market.tick)).toBe('Inseparable')
  })

  it('a released flop nets a LOW-proximity pair below where it stood before the take (FAILURE > PROXIMITY_LOW by name)', () => {
    const { after: world } = takeWorld()
    const { film } = releaseWorld()
    const week = world.market.tick + 4
    const flop: FilmResult = { ...film, criticScore: RELATIONSHIP_FAILURE_CRITIC_SCORE - 1 } // IN-MEMORY RELEASE-RESULT VARIANT (I3)
    const written = advanceRelationshipsWeek({ ...world, market: { ...world.market, tick: week } }, { takes: [], releases: [flop] }, week)
    for (const pair of [[FROZEN.directorId, FROZEN.cast.support], [FROZEN.cast.antagonist, FROZEN.cast.support]] as const) {
      const edge = findEdge(written, pair[0], pair[1])!
      expect(edge.closeness).toBe(clamp(RELATIONSHIP_BASELINE + RELATIONSHIP_PROXIMITY_LOW - RELATIONSHIP_FAILURE_DELTA))
      expect(edge.closeness).toBeLessThan(RELATIONSHIP_BASELINE)
      expect(edge.recent.at(-1)).toEqual({ kind: 'sharedFailure', week, ref: FROZEN.productionId, delta: -RELATIONSHIP_FAILURE_DELTA })
      expect(edge.sharedFailures).toBe(1)
    }
  })

  it('a staged pair at the Acquaintances floor reads Strained after one flop and pairChemistry reads sign −1; Enemies/Nemeses never read on any B.5-minted edge', () => {
    const { after: world } = takeWorld()
    const { film } = releaseWorld()
    const base = findEdge(world, FROZEN.directorId, FROZEN.cast.support)!
    const variant: Edge = { ...base, closeness: floor('Acquaintances'), peakTier: 'Acquaintances' } // staged value on a genuinely minted edge
    const stagedWorld = live(withEdges(world, edges(world).map((e) => (e.edgeId === base.edgeId ? variant : e))))
    const week = world.market.tick + 4
    const flop: FilmResult = { ...film, criticScore: RELATIONSHIP_FAILURE_CRITIC_SCORE - 1 }
    const written = advanceRelationshipsWeek({ ...stagedWorld, market: { ...stagedWorld.market, tick: week } }, { takes: [], releases: [flop] }, week)
    const edge = findEdge(written, FROZEN.directorId, FROZEN.cast.support)!
    expect(edge.closeness).toBe(clamp(floor('Acquaintances') - RELATIONSHIP_FAILURE_DELTA))
    expect(edge.closeness).toBeLessThan(floor('Acquaintances'))
    expect(currentTier(edge, week)).toBe('Strained')
    expect(pairChemistry(written, FROZEN.directorId, FROZEN.cast.support, week)).toMatchObject({ tier: 'Strained', sign: -1 })
    for (const e of edges(written)) expect(['Enemies', 'Nemeses']).not.toContain(currentTier(e, week))
    // The natural release on whichever branch its real score selects: the driver, and no Enemies/Nemeses anywhere.
    const { after } = releaseWorld()
    for (const e of edges(after)) expect(['Enemies', 'Nemeses']).not.toContain(currentTier(e, after.market.tick))
  })
})

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('family 5 — RELEASE and CANCEL drivers (scope (2b)-(2c); 647-B R1 week stamp; coexistence with the promise seam)', () => {
  it('the genuine player release mints the driver its real criticScore selects on all six pairs ONCE, stamped driver.week = state.market.tick = film.releaseTick + 1; rngState equals the frozen release control', () => {
    expect(typeof advanceRelationshipsWeek).toBe('function')
    const { before, after, film } = releaseWorld()
    const week = after.market.tick
    expect(week).toBe(film.releaseTick + 1)
    expect(after.rngState).toBe(FROZEN.rngAfterRelease) // the release consumes the FROZEN reception stream only
    const kind: DriverKind | null = film.criticScore >= RELATIONSHIP_SUCCESS_CRITIC_SCORE ? 'sharedSuccess'
      : film.criticScore < RELATIONSHIP_FAILURE_CRITIC_SCORE ? 'sharedFailure' : null
    for (const p of seatPairs({ directorId: FROZEN.directorId, cast: FROZEN.cast })) {
      const was = findEdge(before, p.x, p.y)!
      const edge = findEdge(after, p.x, p.y)!
      if (kind === null) { expect(edge).toEqual(was); continue } // between the edges: nothing (:440-441 "above a threshold")
      const delta = kind === 'sharedSuccess' ? RELATIONSHIP_SUCCESS_DELTA : -RELATIONSHIP_FAILURE_DELTA
      expect(edge.recent.filter((d) => d.kind === kind)).toEqual([{ kind, week, ref: FROZEN.productionId, delta }])
      expect(edge.closeness).toBe(clamp(driftOracle(was.closeness, week - was.lastEventWeek) + delta))
      expect(edge.lastEventWeek).toBe(week)
      expect(edge[kind === 'sharedSuccess' ? 'sharedSuccesses' : 'sharedFailures']).toBe(1)
      expect(edge.sharedProductions).toBe(was.sharedProductions)
    }
    // idempotent across a re-tick: the next advance carries no release for THIS picture, so its six pairs are
    // untouched (662-T2 amendment, 658-W item 2: a RIVAL release in that same week lawfully drives ITS pairs —
    // plan (2b) is symmetric — so the loop is scoped to the player's six pairs, never to every edge)
    const again = tick(after)
    for (const p of seatPairs({ directorId: FROZEN.directorId, cast: FROZEN.cast })) expect(findEdge(again, p.x, p.y)).toEqual(findEdge(after, p.x, p.y))
    // and the seam replayed on the SAME release mints nothing twice (idempotent by (edgeId, kind, productionId))
    const replayed = advanceRelationshipsWeek(after, { takes: [], releases: [film] }, week)
    expect(JSON.stringify(edges(replayed))).toBe(JSON.stringify(edges(after)))
  })

  it('a rival release (hollywood.films / industry.growth) mints under the same law; a release whose take predates every edge mints nothing (I2)', () => {
    const { beforeRelease, atRelease } = rivalWorld()
    const week = atRelease.market.tick
    const released = atRelease.hollywood!.films.find((f) => f.filmId === FROZEN.rival.firstTake)
    assert.ok(released && released.provenance === 'simulation/v1', 'chain premise: the rival film is not a live release')
    expect(released.result.releaseTick).toBe(week - 1)
    const take = atRelease.firstTakes.find((t) => t.productionId === FROZEN.rival.firstTake)!
    const kind: DriverKind | null = released.result.criticScore >= RELATIONSHIP_SUCCESS_CRITIC_SCORE ? 'sharedSuccess'
      : released.result.criticScore < RELATIONSHIP_FAILURE_CRITIC_SCORE ? 'sharedFailure' : null
    for (const p of seatPairs(take)) {
      const was = findEdge(beforeRelease, p.x, p.y)!
      const edge = findEdge(atRelease, p.x, p.y)!
      if (kind === null) { expect(edge).toEqual(was); continue }
      const delta = kind === 'sharedSuccess' ? RELATIONSHIP_SUCCESS_DELTA : -RELATIONSHIP_FAILURE_DELTA
      expect(edge.recent.filter((d) => d.kind === kind)).toEqual([{ kind, week, ref: released.filmId, delta }])
      expect(edge.closeness).toBe(clamp(driftOracle(was.closeness, week - was.lastEventWeek) + delta))
    }
    // Every OTHER film released between 196 and the repeat take took its first take before the recording of any edge: no edge, no driver.
    const { atRepeat } = rivalWorld()
    const preMigrationTakes = new Set(lifted('rival-current-p1-and-p2').firstTakes.map((t) => t.productionId))
    for (const film of atRepeat.hollywood!.films.filter((f) => preMigrationTakes.has(f.filmId))) {
      expect(edges(atRepeat).some((e) => e.recent.some((d) => d.ref === film.filmId))).toBe(false)
    }
    expect(edges(atRepeat).every((e) => e.sharedSuccesses + e.sharedFailures <= e.sharedProductions)).toBe(true)
  }, 60_000)

  it('a player cancel of a picture WITH a first take mints cancelledAfterFirstTake on its six pairs once (week = the action week) while breakPromisesOnCancel is a no-op for it', () => {
    expect(typeof recordCancelledAfterFirstTake).toBe('function')
    const { after: world } = takeWorld()
    const week = world.market.tick
    const promise = world.promises.find((p) => p.promiseId === 'promise-0')!
    expect(promise.outcome).toBe('SATISFIED') // the take satisfied it; :788 returns early for a filmed picture
    const cancelled = applyActions(world, [{ kind: 'cancel', productionId: FROZEN.productionId }])
    expect(cancelled.studio.activeProductions.some((p) => p.id === FROZEN.productionId)).toBe(false)
    expect(cancelled.promises.find((p) => p.promiseId === 'promise-0')).toEqual(promise) // the promise seam untouched
    expect(cancelled.firstTakes).toEqual(world.firstTakes) // a first take is never un-taken
    for (const p of seatPairs({ directorId: FROZEN.directorId, cast: FROZEN.cast })) {
      const was = findEdge(world, p.x, p.y)!
      const edge = findEdge(cancelled, p.x, p.y)!
      expect(edge.recent.filter((d) => d.kind === 'cancelledAfterFirstTake')).toEqual([{ kind: 'cancelledAfterFirstTake', week, ref: FROZEN.productionId, delta: -RELATIONSHIP_CANCEL_DELTA }])
      expect(edge.closeness).toBe(clamp(was.closeness - RELATIONSHIP_CANCEL_DELTA))
      expect(edge.sharedCancellations).toBe(1)
      expect(edge.lastEventWeek).toBe(week)
    }
    expect(JSON.stringify(cancelled.rngState)).toBe(JSON.stringify(world.rngState))
    // the pure helper directly: idempotent, and a no-op for a picture without a take
    const production = world.studio.activeProductions.find((p) => p.id === FROZEN.productionId)!
    const twice = recordCancelledAfterFirstTake(cancelled, player(cancelled), production)
    expect(JSON.stringify(edges(twice))).toBe(JSON.stringify(edges(cancelled)))
    const noTake = { ...production, id: 'prod-never-filmed' }
    expect(recordCancelledAfterFirstTake(cancelled, player(cancelled), noTake)).toBe(cancelled)
  })

  it('a cancel of a picture WITHOUT a take mints nothing while the promise seam judges on its own (coexistence; both seams fire independently)', () => {
    const { pre } = takeWorld() // the take is scheduled but not taken: no receipt for prod-0052
    expect(pre.firstTakes.some((t) => t.productionId === FROZEN.productionId)).toBe(false)
    const cancelled = applyActions(pre, [{ kind: 'cancel', productionId: FROZEN.productionId }])
    expect(edges(cancelled)).toEqual([])
    // The FROZEN promise law (never touched by B.5, scope (12)): measured on unchanged source this cancel leaves
    // promise-0 OPEN (a path remains before its due week 92); the seam judged, the relationship seam did not.
    expect(cancelled.promises.find((p) => p.promiseId === 'promise-0')!.outcome).toBeNull()
    expect(cancelled.firstTakes).toEqual(pre.firstTakes)
  })
})

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('family 6 — D5 IN THE CHOOSER under the D1 roster predicate (scope (5); companion :116, :120)', () => {
  const closeTieAt207 = (base: F6Base, counterpart: string, lastEventWeek = 207): GameState =>
    stage(base.at207, stagedEdge(base.at207, F6.subject, counterpart, floor('CloseFriends'), lastEventWeek))

  it('the base (no edge) declines by the tie order: every landed band ties between the two survivors (measured premise)', () => {
    expect(typeof pairChemistry).toBe('function')
    const base = f6Base()
    const after = tick(base.at207)
    const receipt = settlementAt208(after)
    expect(receipt.kind).toBe('declined')
    expect(receipt.reasons).toEqual([TIE_SENTENCE])
    expect(receipt.dropped).toHaveLength(3)
    expect(rosterAt(after, base.playerId, F6.subject, F6.W)).toEqual([base.offCycle])
    expect(rosterAt(after, base.r01, F6.subject, F6.W)).toEqual([])
    expect(rosterAt(after, F6.incumbent, F6.subject, F6.W)).toEqual([]) // the churned incumbent: every row closed AT W (647-B D1)
    expect(after.hollywood!.employment.some((e) => e.studioId === base.playerId && e.terms.talentId === base.closedAtW && e.endedWeek === F6.W)).toBe(true)
    expect(newSentences(receipt.reasons.filter((s) => s !== TIE_SENTENCE))).toEqual([])
  }, 120_000)

  it('a CloseFriends counterpart on the player\'s OFF-CYCLE row (startWeek < W, active at W) settles the case for the player with the D5 sentence as the ONLY reason', () => {
    const base = f6Base()
    const treated = closeTieAt207(base, base.offCycle)
    const after = tick(treated)
    const receipt = settlementAt208(after)
    expect(receipt.kind).toBe('settled')
    expect(receipt.studioId).toBe(base.playerId)
    const sentence = newSentences(receipt.reasons)
    expect(sentence).toHaveLength(1)
    expect(receipt.reasons).toEqual(sentence) // bands equal elsewhere: nothing but D5 is strictly won
    expect(sentence[0]).not.toMatch(/\d/) // ordering-only: no number
    for (const name of [F6.subject, base.offCycle, ...LADDER]) expect(sentence[0]).not.toContain(name) // no person, no tier
    expect(receipt.dropped).toEqual(settlementAt208(tick(base.at207)).dropped)
    expect(after.hollywood!.employment.some((e) => e.studioId === base.playerId && e.terms.talentId === F6.subject && e.terms.startWeek === F6.W && e.endedWeek === null)).toBe(true)
    expect(pairChemistry(after, F6.subject, base.offCycle, F6.W).tier).toBe('CloseFriends')
    expect(JSON.stringify(after.rngState)).toBe(JSON.stringify(tick(base.at207).rngState))
  }, 120_000)

  it('the same case at a W where that edge has DRIFTED below Close Friends declines by the tie order', () => {
    const base = f6Base()
    const lastEventWeek = F6.W - RELATIONSHIP_DRIFT_GRACE_WEEKS - Math.trunc(RELATIONSHIP_DRIFT_RETURN_WEEKS / 2)
    expect(lastEventWeek).toBeGreaterThanOrEqual(base.at207.studioHistory.recordingStartedWeek)
    const treated = closeTieAt207(base, base.offCycle, lastEventWeek)
    const edge = findEdge(treated, F6.subject, base.offCycle)!
    expect(rank(currentTier(edge, F6.W))).toBeLessThan(rank('CloseFriends')) // the premise, by the versioned rule
    expect(currentTier(edge, lastEventWeek)).toBe('CloseFriends')
    const receipt = settlementAt208(tick(treated))
    expect(receipt.kind).toBe('declined')
    expect(receipt.reasons).toEqual([TIE_SENTENCE])
  }, 120_000)

  it('a row CLOSED AT W (the actor signed at 0 for 208 weeks) never counts — the predicate\'s strict upper end', () => {
    const base = f6Base()
    const receipt = settlementAt208(tick(closeTieAt207(base, base.closedAtW)))
    expect(receipt.kind).toBe('declined')
    expect(receipt.reasons).toEqual([TIE_SENTENCE])
  }, 120_000)

  it('a row COMMITTED AT W (startWeek === W) never counts — the predicate\'s strict lower end; the same row one week earlier does', () => {
    const base = f6Base()
    const treated = closeTieAt207(base, base.free)
    // (i) the counterpart signed INSIDE the week-208 pass, before settlement: startWeek === W ⇒ off the roster
    let preMarket208: GameState | undefined
    const real = marketModule.advanceTalentMarketWeek
    const capture = vi.spyOn(marketModule, 'advanceTalentMarketWeek').mockImplementation((input) => {
      if (input.market.tick === F6.W) { preMarket208 = clone(input); throw new Error('captured') }
      return real(input)
    })
    try { expect(() => tick(treated)).toThrow('captured') } finally { capture.mockRestore() }
    assert.ok(preMarket208, 'F6 premise: no real pre-market week-208 input captured')
    assert.ok(hiringMarketIds(preMarket208, F6.W).includes(base.free), 'F6 premise: the free actor was taken before the 208 pass; never forge a row')
    const signedAtW = applyActions(preMarket208, [{ kind: 'signContract', talentId: base.free, termWeeks: 208 }])
    expect(signedAtW.hollywood!.employment.some((e) => e.studioId === base.playerId && e.terms.talentId === base.free && e.terms.startWeek === F6.W)).toBe(true)
    const receipt = settlementAt208(marketModule.advanceTalentMarketWeek(signedAtW))
    expect(receipt.kind).toBe('declined')
    expect(receipt.reasons).toEqual([TIE_SENTENCE])
    // (ii) the same counterpart signed at 207 (startWeek 207 < 208, active at 208): counts.
    const signedBefore = applyActions(treated, [{ kind: 'signContract', talentId: base.free, termWeeks: 208 }])
    const settled = settlementAt208(tick(signedBefore))
    expect(settled.kind).toBe('settled')
    expect(settled.studioId).toBe(base.playerId)
    expect(newSentences(settled.reasons)).toHaveLength(1)
  }, 120_000)

  it('`enemies here` is never read: without a Close Friends counterpart no D5 sentence appears, whatever the value on the record', () => {
    const base = f6Base()
    // A negative-band edge (Strained by rule) with its counterpart on the player's roster at W: D5 reads `none`, not `enemies here`.
    const strained = stage(base.at207, stagedEdge(base.at207, F6.subject, base.offCycle, floor('Enemies'), 207))
    expect(currentTier(findEdge(strained, F6.subject, base.offCycle)!, F6.W)).toBe('Strained')
    const receipt = settlementAt208(tick(strained))
    expect(receipt.kind).toBe('declined')
    expect(receipt.reasons).toEqual([TIE_SENTENCE])
  }, 120_000)
})

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('family 7 — PUBLIC ORDER: the SEVEN-member companion orders (§2.1.7 :120), term preference unchanged', () => {
  it('publicPriorityOrder is byte-equal to the companion order for both archetypes and publicPreferredTerm is value-identical', () => {
    expect(typeof pairChemistry).toBe('function')
    const state = p13aGeneratedStudio()
    const unproven = state.talent.find((p) => p.age < 30 && careerIdentity(p).identityDisciplines.length === 0)
    const proven = state.talent.find((p) => p.age >= 30 || careerIdentity(p).identityDisciplines.length > 0)
    assert.ok(unproven && proven, 'fixture premise failed: both archetypes must exist on the default seed')
    expect(publicPriorityOrder(state, unproven.id)).toEqual(UNPROVEN_ORDER)
    expect(publicPriorityOrder(state, proven.id)).toEqual(PROVEN_ORDER)
    const options = TUNING.CONTRACT_TERM_OPTIONS
    expect(publicPreferredTerm(state, proven.id)).toBe(options[options.length - 1])
    expect(publicPreferredTerm(state, unproven.id)).toBe(options[0])
  })
})

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('family 8 — RESERVATION enumerated and CHEMISTRY read-only (scope (6)-(7); §5.6 :476, :482)', () => {
  it('pairChemistry returns {null, 0, []} without an edge, sign +1 for Colleagues and above, −1 for Strained and below, no digit in any reason, and reads nothing but the record', () => {
    expect(typeof pairChemistry).toBe('function')
    const { after: world } = takeWorld()
    const week = world.market.tick
    expect(pairChemistry(world, FROZEN.cast.lead, 't-wri-03', week)).toEqual({ tier: null, sign: 0, reasons: [] }) // the writer seat is EXCLUDED (no edge)
    expect(pairChemistry(world, 'nobody-1', 'nobody-2', week)).toEqual({ tier: null, sign: 0, reasons: [] })
    for (const tier of LADDER) {
      const staged = stage(world, stagedEdge(world, FROZEN.cast.lead, 't-wri-03', floor(tier), week))
      const forward = pairChemistry(staged, FROZEN.cast.lead, 't-wri-03', week) as Chemistry
      const backward = pairChemistry(staged, 't-wri-03', FROZEN.cast.lead, week) as Chemistry
      expect(backward).toEqual(forward) // the canonical key is an identity, not a choice
      expect(forward.tier).toBe(tierOracle(floor(tier)))
      expect(forward.sign).toBe(rank(forward.tier!) >= rank('Colleagues') ? 1 : forward.tier === 'Acquaintances' ? 0 : -1)
      expect(forward.reasons.length).toBeGreaterThan(0)
      for (const reason of forward.reasons) { expect(reason).not.toMatch(/\d/); expect(typeof reason).toBe('string') }
      expect(JSON.stringify(staged.rngState)).toBe(JSON.stringify(world.rngState))
    }
    // A pair at the Acquaintances floor reads sign 0 (§5.3 :426 "no effect"); the ladder is symmetric about it.
    const neutral = stage(world, stagedEdge(world, FROZEN.cast.lead, 't-wri-03', RELATIONSHIP_BASELINE, week))
    expect((pairChemistry(neutral, FROZEN.cast.lead, 't-wri-03', week) as Chemistry)).toMatchObject({ tier: 'Acquaintances', sign: 0 })
  })

  it('nemesisOnRoster is an enumerated FreezeDrop member; Nemeses needs a conflict record B.5 never mints, so no genuine edge can trip it', () => {
    const member: FreezeDrop = 'nemesisOnRoster' // type-level pin on the closed vocabulary (typecheck)
    expect(member).toBe('nemesisOnRoster')
    const { after: world } = takeWorld()
    for (const e of edges(world)) expect(currentTier(e, world.market.tick)).not.toBe('Nemeses')
    expect(edges(world).every((e) => e.recent.every((d) => KINDS.includes(d.kind)))).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────────────────────────────
describe('family 10 — the V31 ROOT VALIDATOR refuses every malformed edge; family 9\'s ONE-EDGE downgrade refusal (scope (10))', () => {
  const v31 = () => { const { after } = takeWorld(); return JSON.parse(JSON.stringify(makeSave(after))) as { saveVersion: number; seed: string; state: Record<string, unknown> & { relationships: Edge[] }; broadcastCache: unknown } }
  const expectRefused = (mutate: (edges: Edge[], state: Record<string, unknown>) => void, pattern: RegExp) => {
    const save = v31()
    mutate(save.state.relationships, save.state)
    expect(() => validateSaveV31(save)).toThrow(pattern)
    expect(() => validateRelationshipsRoot(save.state)).toThrow(pattern)
  }

  it('validateSaveV31/validateRelationshipsRoot exist and admit the genuinely minted world round-trip', () => {
    expect(typeof validateSaveV31).toBe('function'); expect(typeof validateRelationshipsRoot).toBe('function')
    const save = v31()
    expect(save.saveVersion).toBe(LIVE_SAVE_VERSION)
    expect(save.state.relationships).toHaveLength(6)
    expect(validateSaveV31(save)).toEqual(save)
  })

  it('refuses a missing root', () => {
    const save = v31()
    Reflect.deleteProperty(save.state, 'relationships')
    expect(() => validateSaveV31(save)).toThrow(/relationships/)
  })
  it('refuses a non-ordinal edgeId', () => expectRefused((e) => { e[0]!.edgeId = 'edge-x' }, /edgeId/))
  it('refuses a duplicate pair', () => expectRefused((e) => { e[1]!.a = e[0]!.a; e[1]!.b = e[0]!.b }, /duplicate|pair/i))
  it('refuses a non-canonical key', () => expectRefused((e) => { const [a, b] = [e[0]!.a, e[0]!.b]; e[0]!.a = b; e[0]!.b = a }, /canonical|order|a < b|\ba\b/i))
  it('refuses a person not in state.talent', () => expectRefused((e) => { e[0]!.b = 'zz-not-a-person' }, /person|talent/i))
  it('refuses firstSharedWeek > lastEventWeek', () => expectRefused((e) => { e[0]!.firstSharedWeek = e[0]!.lastEventWeek + 1 }, /firstSharedWeek|lastEventWeek/))
  it('refuses a week outside the recording interval (before the boundary; after market.tick)', () => {
    expectRefused((e) => { e[0]!.firstSharedWeek = -1 }, /recording|interval|firstSharedWeek/i)
    expectRefused((e, state) => { const tick = (state.market as { tick: number }).tick; e[0]!.lastEventWeek = tick + 1; e[0]!.recent = [] }, /recording|interval|lastEventWeek/i)
  })
  it('refuses a driver week after lastEventWeek', () => expectRefused((e) => { e[0]!.recent = [{ ...e[0]!.recent[0]!, week: e[0]!.lastEventWeek + 1 }] }, /week|driver/i))
  it('refuses recent over the cap', () => expectRefused((e) => { e[0]!.recent = Array.from({ length: RELATIONSHIP_RECENT_CAP + 1 }, () => ({ ...e[0]!.recent[0]! })) }, /recent|cap/i))
  it('refuses peakTier outside the catalogue', () => expectRefused((e) => { (e[0] as unknown as { peakTier: string }).peakTier = 'Partners' }, /peakTier|tier/i))
  it('refuses closeness outside 0..100 or non-integer', () => {
    expectRefused((e) => { e[0]!.closeness = 101 }, /closeness/)
    expectRefused((e) => { e[0]!.closeness = -1 }, /closeness/)
    expectRefused((e) => { e[0]!.closeness = 50.5 }, /closeness/)
  })
  it('refuses inconsistent counters', () => {
    expectRefused((e) => { e[0]!.sharedSuccesses = e[0]!.sharedProductions + 1 }, /sharedSuccesses|sharedFailures|sharedProductions|counter/i)
    expectRefused((e) => { e[0]!.sharedCancellations = e[0]!.sharedProductions + 1 }, /sharedCancellations|sharedProductions|counter/i)
    expectRefused((e) => { e[0]!.sharedProductions = -1 }, /sharedProductions|counter|non-negative/i)
  })
  it('refuses an unknown driver kind, an empty ref and a non-integer delta', () => {
    expectRefused((e) => { (e[0]!.recent[0] as unknown as { kind: string }).kind = 'conflict' }, /kind/)
    expectRefused((e) => { (e[0]!.recent[0] as unknown as { ref: string }).ref = '' }, /ref/)
    expectRefused((e) => { (e[0]!.recent[0] as unknown as { delta: number }).delta = 1.5 }, /delta/)
  })
  it('refuses an extra key on an edge', () => expectRefused((e) => { (e[0] as unknown as Record<string, unknown>).closenessShown = 1 }, /field|key|closenessShown/i))

  it('a V31 world holding ONE edge refuses migrateToV30 with the downgrade message and refuses every older migrateToVn; empty is lossless', () => {
    expect(typeof projectRelationshipsPreV31).toBe('function')
    const save = v31()
    const one = { ...save, state: { ...save.state, relationships: [save.state.relationships[0]!] } }
    const admitted = validateSaveV31(one)
    const before = JSON.stringify(admitted)
    expect(() => projectRelationshipsPreV31(one.state)).toThrow()
    expect(() => migrateToV30(admitted)).toThrow(/cannot downgrade SaveFileV31 or discard the relationship record/)
    for (const older of [migrateToV29, migrateToV28, migrateToV27, migrateToV26, migrateToV25]) {
      expect(() => older(admitted as never)).toThrow(/cannot downgrade|SaveFileV31|relationship/)
    }
    expect(JSON.stringify(admitted)).toBe(before)
    const empty = validateSaveV31({ ...save, state: { ...save.state, relationships: [] } })
    expect(projectRelationshipsPreV31(empty.state)).toBeUndefined()
    const downgraded = migrateToV30(empty)
    expect(downgraded.saveVersion).toBe(30)
    const { relationships: _r, ...rest } = empty.state
    expect(JSON.stringify(downgraded.state)).toBe(JSON.stringify(rest))
  })
})
