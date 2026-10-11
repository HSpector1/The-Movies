// Record 1344-C: RED tests for the rival screenplay shelving law (D-1329-1), staged
// against BASE c214094478f47c3e861d757ef568a124cbf3bd71, branch wip/headless-program-20260916-ts.
// Authority: docs/engineering/playability-launch-review/evidence/p14b4-20260919/
//   1344-A-rival-screenplay-shelving-charter.md (§3, §5, §6 items 1,2,3,4,5,6,7,8,10)
//   1344-F-parent-shelving-charter-adoption.md (Amendments 1-3 govern over 1344-A)
//   1340-O-owner-rulings-20260929.md (D-1329-1)
//
// RED MECHANISM (memory: "vite binds missing named exports to undefined — assert
// existence first"). None of TUNING_FUTURE.HOLLYWOOD_SHELVE_AFTER_REJECTIONS/
// HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS/HOLLYWOOD_SHELVED_RETRY_WEEKS,
// hollywoodPolicy.searchIndustryPackages, RivalBusiness.screenplayShelving, or the
// IndustryReceipt kind 'screenplayShelved' exist at BASE. The "API decisions" block
// below asserts existence first (namespace import + typeof/property checks); every
// other leaf reads the not-yet-existing field/kind through a local future-shape cast
// (house pattern, tests/p14b9-save-v42.test.ts) so it fails on the ASSERTED VALUE
// (undefined, missing receipt, wrong count), not on an unrelated TypeScript shape
// mismatch. See 1344-C-shelving-red-handback.md for the exact tsc output this
// produces and the receipts-derived facts tests 1 and (indirectly) 2/4 rest on.
//
// GENUINE FIXTURES: tests/fixtures/p14/genuine-v42-pre-shelving/ (1344-P), loaded via
// ./p14d1-rival-shelving-fixtures.ts (importSave -> migrateToLive(save).state, never
// loadSave alone). Week 130: studio-aca408ec-r01 holds ready ordinals [6,11], no
// production, no promises, cash ~18.4M; studio-aca408ec-r02 similarly [11,13]. Week
// 100: r01 holds ready ordinal 6 PLUS a running production (ordinal 10, remainingTicks
// 5) — the genuine "a week with a running production" input for test 2's third clause.

import { describe, expect, it, vi } from 'vitest'
import { tick, TUNING } from '../src/core/index.js'
import * as hollywoodPolicy from '../src/core/hollywoodPolicy.js'
import * as talentMarket from '../src/core/talentMarket.js'
import * as careerLifecycle from '../src/core/careerLifecycle.js'
import * as saveModule from '../src/core/save.js'
import { promiseFeasibility } from '../src/core/promises.js'
import { marketingCapacityForInputs, marketingMenuFromCapacity } from '../src/core/marketingMenu.js'
import type { GameState } from '../src/core/types.js'
import type { RivalBusiness, IndustryReceipt } from '../src/core/hollywoodTypes.js'
import { RIVAL_MONEY_KINDS, rivalWeeklyOperatingCost } from '../src/core/hollywood.js'
import { validatePowerRankingArchive } from '../src/core/powerRankingArchive.js'
import { liveWeek100, liveWeek130, RIVAL_R01 } from './p14d1-rival-shelving-fixtures.js'
import { genuineV42Week77 } from './p14d1-week77-fixture.js'
import type { PromiseDraft } from '../src/core/promises.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'

const HARNESS_GENESIS = (): GameState => p13aGeneratedStudio('p13a-core-causal-01')

// ── future-shape local types (1344-A §4 / 1344-F, not yet on hollywoodTypes.ts) ──
type ScreenplayShelving = {
  version: 1
  rejections: readonly { ordinal: number; count: number }[]
  shelved: readonly { ordinal: number; week: number; retryWeek: number }[]
  commissionHoldUntilWeek: number
}
type ShelvedBusiness = RivalBusiness & { screenplayShelving: ScreenplayShelving }
type ScreenplayShelvedReceipt = { eventId: string; week: number; studioId: string
  kind: 'screenplayShelved'; scriptProjectId: string; conceptId: string; rejections: number }
const shelving = (b: RivalBusiness): ScreenplayShelving => (b as unknown as ShelvedBusiness).screenplayShelving
/** `ScreenplayShelvedReceipt` is not (yet) a member of the real `IndustryReceipt`
 * union, so a `r is IndustryReceipt & ScreenplayShelvedReceipt` type predicate is
 * unsatisfiable (TS2677) and a `r is ScreenplayShelvedReceipt` one fails TS2677's
 * "assignable to its parameter's type" check the same way. Filter with a plain
 * boolean predicate and cast the RESULT array once, here, instead of per call site. */
const shelvedReceiptsOf = (receipts: readonly IndustryReceipt[]): ScreenplayShelvedReceipt[] =>
  receipts.filter(r => (r as unknown as { kind: string }).kind === 'screenplayShelved') as unknown as ScreenplayShelvedReceipt[]
const EMPTY_SHELVING: ScreenplayShelving = { version: 1, rejections: [], shelved: [], commissionHoldUntilWeek: 0 }
/** Bare `TUNING.HOLLYWOOD_SHELVE_*` access is a real, expected tsc TS2339 until
 * tuning.ts adds these three keys (see the "API decisions" block above, and the
 * 1344-C handback's type-gate section); cast once here so later uses read cleanly. */
const TUNING_FUTURE = TUNING as unknown as {
  HOLLYWOOD_SHELVE_AFTER_REJECTIONS: number
  HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS: number
  HOLLYWOOD_SHELVED_RETRY_WEEKS: number
}

function business(state: GameState, studioId: string): RivalBusiness {
  const b = state.hollywood!.businesses.find(row => row.studioId === studioId)
  expect(b, `route premise: ${studioId} exists in this fixture`).toBeDefined()
  return b!
}
function ordinalOf(b: RivalBusiness, scriptProjectId: string): number {
  const i = b.development.projects.findIndex(p => p.id === scriptProjectId)
  expect(i, `route premise: ${scriptProjectId} exists in ${b.studioId}'s development`).toBeGreaterThanOrEqual(0)
  return i
}
function newReceipts(before: GameState, after: GameState): readonly IndustryReceipt[] {
  return after.hollywood!.receipts.slice(before.hollywood!.receipts.length)
}
function periodSums(b: RivalBusiness): Record<string, number> {
  const sums: Record<string, number> = Object.fromEntries(RIVAL_MONEY_KINDS.map(k => [k, 0]))
  for (const p of b.account.periods) for (const [k, v] of Object.entries(p.movements)) sums[k] = (sums[k] ?? 0) + v
  return sums
}
/** The set of money-movement kinds that moved (non-negligibly) between two business
 * snapshots of the SAME studio. Used to compare a candidate week's movement pattern
 * against a control week's, per the brief ("compare the ledger movement kinds against
 * a control week") rather than asserting every kind is zero (research/hiring noise
 * unrelated to shelving can legitimately move in any given week). */
function nonzeroDeltaKinds(before: RivalBusiness, after: RivalBusiness): string[] {
  const a = periodSums(before), b = periodSums(after)
  const kinds = new Set([...Object.keys(a), ...Object.keys(b)])
  const out: string[] = []
  for (const k of kinds) if (Math.abs((b[k] ?? 0) - (a[k] ?? 0)) > 1e-6) out.push(k)
  return out.sort()
}
/** Every ordering of 3 distinct cast-slot indices (3! = 6), generated, never a
 * literal — used in place of hollywoodPolicy.ts's private BILLINGS constant
 * (1344-D Blocking 1: "do NOT hard-code 54"). */
function permutationsOfThree(): [number, number, number][] {
  const out: [number, number, number][] = []
  for (const a of [0, 1, 2]) for (const b of [0, 1, 2]) for (const c of [0, 1, 2]) {
    if (a !== b && b !== c && a !== c) out.push([a, b, c])
  }
  return out
}
/** Replicates chooseIndustryPackage's own candidate-cost formula
 * (hollywoodPolicy.ts, the lockScreenplay===true / single-shape branch) over a REAL
 * captured (input, policy) pair, to find the real cost of every one of its 54
 * candidates — never assumed. Uses only already-exported functions
 * (perceivedPlanningInputs, marketingCapacityForInputs, marketingMenuFromCapacity,
 * TUNING.HOLLYWOOD_NEGATIVE_CHOICES), so this derivation itself carries no RED risk. */
function candidateCosts(input: Parameters<typeof hollywoodPolicy.chooseIndustryPackage>[0],
  policy: Parameters<typeof hollywoodPolicy.chooseIndustryPackage>[1]): number[] {
  const planning = hollywoodPolicy.perceivedPlanningInputs(input)
  const actors = [planning.cast.lead, planning.cast.antagonist, planning.cast.support]
  const required = planning.concept.baseNegativeCost * planning.shapeEffects.budgetDemandMultiplier * planning.era.costScale
  const costs: number[] = []
  for (const billing of permutationsOfThree()) {
    const cast = { lead: actors[billing[0]]!, antagonist: actors[billing[1]]!, support: actors[billing[2]]! }
    for (const scale of TUNING.HOLLYWOOD_NEGATIVE_CHOICES) {
      const negative = Math.round(required * scale * policy.negativeScale)
      const base = { ...planning, cast, budget: { negative, marketing: 0 } }
      for (const marketing of marketingMenuFromCapacity(marketingCapacityForInputs(base, true))) costs.push(negative + marketing)
    }
  }
  return costs
}
/** Shared by shelving-retry and rivalPromiseProjectCandidates: hand-marks one
 * ordinal shelved (removed from activeScriptOrdinals, added to screenplayShelving
 * with a matching receipt) exactly as the law's own shape describes (1344-A §4). */
function markShelved(state: GameState, studioId: string, ordinal: number, week: number, retryWeek: number): GameState {
  const h = state.hollywood!
  const businesses = h.businesses.map(b => {
    if (b.studioId !== studioId) return b
    const current = (b as unknown as ShelvedBusiness).screenplayShelving ?? EMPTY_SHELVING
    const nextShelving: ScreenplayShelving = {
      version: 1,
      rejections: current.rejections.filter(r => r.ordinal !== ordinal),
      shelved: [...current.shelved, { ordinal, week, retryWeek }].sort((a, c) => a.ordinal - c.ordinal),
      commissionHoldUntilWeek: current.commissionHoldUntilWeek,
    }
    return {
      ...b,
      activeScriptOrdinals: b.activeScriptOrdinals.filter(i => i !== ordinal),
      screenplayShelving: nextShelving,
    } as unknown as RivalBusiness
  })
  const receipt: ScreenplayShelvedReceipt = {
    eventId: `industry-event-${h.nextReceipt}`, week, studioId, kind: 'screenplayShelved',
    scriptProjectId: h.businesses.find(b => b.studioId === studioId)!.development.projects[ordinal]!.id,
    conceptId: h.businesses.find(b => b.studioId === studioId)!.projects[ordinal]!.conceptId,
    rejections: TUNING_FUTURE.HOLLYWOOD_SHELVE_AFTER_REJECTIONS,
  }
  return { ...state, hollywood: { ...h, businesses, receipts: [...h.receipts, receipt as unknown as IndustryReceipt], nextReceipt: h.nextReceipt + 1 } }
}

// ── API decisions (1344-C brief "PARENT API DECISIONS") — existence asserted first ──
describe('API decisions this file exercises (asserted to exist first, per PITFALL)', () => {
  it('TUNING.HOLLYWOOD_SHELVE_AFTER_REJECTIONS is a positive integer, 13', () => {
    const v = (TUNING as unknown as Record<string, unknown>).HOLLYWOOD_SHELVE_AFTER_REJECTIONS
    expect(typeof v).toBe('number')
    expect(Number.isInteger(v) && (v as number) > 0).toBe(true)
    expect(v).toBe(13)
  })
  it('TUNING.HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS is a positive integer, 13', () => {
    const v = (TUNING as unknown as Record<string, unknown>).HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS
    expect(typeof v).toBe('number')
    expect(Number.isInteger(v) && (v as number) > 0).toBe(true)
    expect(v).toBe(13)
  })
  it('TUNING.HOLLYWOOD_SHELVED_RETRY_WEEKS is a positive integer, 26', () => {
    const v = (TUNING as unknown as Record<string, unknown>).HOLLYWOOD_SHELVED_RETRY_WEEKS
    expect(typeof v).toBe('number')
    expect(Number.isInteger(v) && (v as number) > 0).toBe(true)
    expect(v).toBe(26)
  })
  it('hollywoodPolicy.searchIndustryPackages exists as a function', () => {
    const fn = (hollywoodPolicy as unknown as Record<string, unknown>).searchIndustryPackages
    expect(typeof fn).toBe('function')
  })
  it('save.ts LIVE_SAVE_VERSION is 46, and validateSaveV43/convertV42ToV43/convertV43ToV42 exist', () => {
    expect(saveModule.LIVE_SAVE_VERSION).toBe(46)
    const mods = saveModule as unknown as Record<string, unknown>
    expect(typeof mods.validateSaveV43).toBe('function')
    expect(typeof mods.convertV42ToV43).toBe('function')
    expect(typeof mods.convertV43ToV42).toBe('function')
  })
  it('talentMarket.rivalPromiseProjectCandidates exists as a function (1344-X2)', () => {
    const fn = (talentMarket as unknown as Record<string, unknown>).rivalPromiseProjectCandidates
    expect(typeof fn).toBe('function')
  })
})

// ── searchIndustryPackages counts contract (1344-D Blocking 1, 1344-F2 item 1) ──
// Revision 1344-C2, additive: the 43 leaves above/below are unchanged. Uses the spy
// technique of tests/helpers/p14p3-fixtures.ts's rivalStep (packageSpy/originalPackage,
// ~:833,:887-896): vi.spyOn(hollywoodPolicy, 'chooseIndustryPackage') during a real
// tick() over the genuine week-130 input, so the captured (input, policy, options) are
// the REAL arguments decide() builds — no reimplementation of the private inputsFor().
describe('searchIndustryPackages counts contract (1344-D Blocking 1)', () => {
  it('on a captured genuine economic-rejection call: choice matches chooseIndustryPackage; affordable+unaffordable equals the independently-derived candidate count (never the literal 54); viable<=affordable; (choice===null)===(viable===0)', () => {
    const original = hollywoodPolicy.chooseIndustryPackage
    type PackageArgs = Parameters<typeof original>
    const captured: { input: PackageArgs[0]; policy: PackageArgs[1]; options: PackageArgs[2]; result: ReturnType<typeof original> }[] = []
    const spy = vi.spyOn(hollywoodPolicy, 'chooseIndustryPackage').mockImplementation((input, policy, options) => {
      const result = original(input, policy, options)
      if (options.lockScreenplay && options.key.startsWith(`${RIVAL_R01}:package:`)) captured.push({ input, policy, options, result })
      return result
    })
    let state = liveWeek130()
    try {
      state = tick(state)
    } finally {
      spy.mockRestore()
    }
    expect(captured.length, 'route/RED premise: r01 has a ready screenplay evaluated this week').toBeGreaterThan(0)
    const call = captured[0]! // ordinal 6, evaluated first (activeScriptOrdinals sorted [6,11])
    // Law-independent fact (reads chooseIndustryPackage's own real return value, not
    // screenplayShelving): no candidate is viable at the real, effectively-unlimited
    // week-130 cash, matching 1329-A's measured stall.
    expect(call.result, 'route premise: a genuine economic rejection at real cash').toBeNull()

    // Independently-derived candidate universe size (1344-D: "do NOT hard-code 54"):
    // 1 locked shape x every permutation of 3 cast slots x HOLLYWOOD_NEGATIVE_CHOICES
    // x the marketing menu's own fixed length (marketingMenuFromCapacity always
    // returns exactly 3 rungs, by construction — Math.max(a+1,...) strictly orders
    // three distinct values regardless of capacity).
    expect(call.options.lockScreenplay).toBe(true)
    const shapesCount = 1
    const billingsCount = permutationsOfThree().length
    const scalesCount = TUNING.HOLLYWOOD_NEGATIVE_CHOICES.length
    const marketingCount = marketingMenuFromCapacity(marketingCapacityForInputs(call.input, true)).length
    const expectedCandidateCount = shapesCount * billingsCount * scalesCount * marketingCount
    // Self-check only (not a RED assertion about the not-yet-existing search): confirms
    // this file's independent derivation reproduces 1329-A's own measured 54 today,
    // using only already-exported functions/constants.
    expect(expectedCandidateCount).toBe(54)

    const mods = hollywoodPolicy as unknown as {
      searchIndustryPackages: (input: PackageArgs[0], policy: PackageArgs[1], options: PackageArgs[2]) =>
        { choice: ReturnType<typeof original>; affordable: number; unaffordable: number; viable: number }
    }
    const searched = mods.searchIndustryPackages(call.input, call.policy, call.options)
    expect(searched.choice).toEqual(call.result)
    expect(searched.affordable + searched.unaffordable).toBe(expectedCandidateCount)
    expect(searched.viable).toBeLessThanOrEqual(searched.affordable)
    expect(searched.choice === null).toBe(searched.viable === 0)
  }, 15_000)

  it('decide-level: partly unaffordable but all-hopeless packages count as economic rejection under 1363 Part A', () => {
    const original = hollywoodPolicy.chooseIndustryPackage
    type PackageArgs = Parameters<typeof original>
    const captured: { input: PackageArgs[0]; policy: PackageArgs[1]; result: ReturnType<typeof original> }[] = []
    const spy = vi.spyOn(hollywoodPolicy, 'chooseIndustryPackage').mockImplementation((input, policy, options) => {
      const result = original(input, policy, options)
      if (options.lockScreenplay && options.key === `${RIVAL_R01}:package:script-0006`) captured.push({ input, policy, result })
      return result
    })
    let state = liveWeek130()
    try {
      state = tick(state) // warm-up: one economic rejection at real (unlimited) cash
    } finally {
      spy.mockRestore()
    }
    expect(captured.length, 'route/RED premise: ordinal 6 (script-0006) is evaluated this week').toBeGreaterThan(0)
    const { input, policy, result } = captured[0]!
    expect(result, 'law-independent premise: no candidate viable at real cash').toBeNull()
    const b1 = business(state, RIVAL_R01)
    expect(b1.development.projects[6]!.status, 'law-independent premise: not greenlit this week').toBe('ready')

    // Derivation: the real cost (negative+marketing) of every one of the 54 real
    // candidates, from the REAL captured (input, policy) — never assumed.
    const costs = candidateCosts(input, policy)
    expect(costs.length).toBe(54)
    const minCost = Math.min(...costs), maxCost = Math.max(...costs)
    expect(minCost, 'a distinct cost range to sit a midpoint cash value strictly inside').toBeLessThan(maxCost)
    const cashBetween = Math.floor((minCost + maxCost) / 2)
    expect(cashBetween).toBeGreaterThan(minCost)
    expect(cashBetween).toBeLessThan(maxCost)
    // Since EVERY one of the 54 candidates is non-viable at real (unlimited) cash
    // (established above via call.result===null — viability does not depend on
    // cashAvailable, only whether a candidate clears the cash gate to be scored at
    // all), any smaller cash's AFFORDABLE subset is a subset of an all-non-viable
    // set, so it is non-viable too: "no affordable one is viable" follows logically,
    // without replicating the score/forecast formula.

    const h = state.hollywood!
    const reserve = rivalWeeklyOperatingCost(b1, h, state.market.tick) * b1.policy.reserveWeeks
    let blocked: GameState = {
      ...state,
      hollywood: {
        ...h,
        businesses: h.businesses.map(row => row.studioId === RIVAL_R01
          ? { ...row, account: { ...row.account, cash: reserve + cashBetween } } : row),
      },
    }
    for (let i = 0; i < 3; i++) {
      blocked = tick(blocked)
      const b = business(blocked, RIVAL_R01)
      expect(shelving(b).rejections.find(r => r.ordinal === 6)?.count,
        `1363 economic-rejection week ${i} advances despite partial unaffordability (real cost range [${minCost},${maxCost}], cash set to reserve+${cashBetween})`).toBe(i + 2)
    }
  }, 15_000)
})

// ── 1. shelving-stalled-route (1344-A §6.1) ──────────────────────────────────────
describe('shelving-stalled-route (1344-A §6.1)', () => {
  it('a stalled rival with staff and cash available shelves after exactly 13 evaluated economic rejections; the week is derived from receipts, never hard-coded', () => {
    let state = liveWeek130()
    const b0 = business(state, RIVAL_R01)
    // Route premise (fixture facts, not asserted-into-existence): two ready, active
    // screenplays, no production, cash far above reserve, no open promises.
    expect([...b0.activeScriptOrdinals].sort((a, x) => a - x)).toEqual([6, 11])
    expect(b0.productions.length).toBe(0)
    expect(state.promises).toEqual([])
    // Search bound: the law requires exactly 13 evaluated economic rejections: with
    // margin for a slow week this loop still terminates well inside the core 5s
    // budget (each tick over this genuine world measured ~25-40ms; see handback).
    const BOUND = 16
    let before: GameState | null = null
    let shelvingWeek: number | null = null
    let shelvingReceipts: ScreenplayShelvedReceipt[] = []
    let after: GameState | null = null
    for (let i = 0; i < BOUND; i++) {
      before = state
      state = tick(state)
      const fresh = shelvedReceiptsOf(newReceipts(before, state)).filter(r => r.studioId === RIVAL_R01)
      if (fresh.length > 0) { shelvingWeek = before.market.tick; shelvingReceipts = fresh; after = state; break }
    }
    expect(shelvingWeek, `route/RED premise: ${RIVAL_R01} shelves within ${BOUND} weeks of week 130`).not.toBeNull()
    expect(before).not.toBeNull(); expect(after).not.toBeNull()
    // "Exactly one screenplayShelved receipt" is scoped per screenplay (§3.2): both of
    // r01's ready screenplays reached 13 rejections together on this route (they were
    // evaluated identically every week since week 130), so this week may carry a
    // receipt for ordinal 6, for ordinal 11, or both — the handback records which.
    expect(shelvingReceipts.length).toBeGreaterThanOrEqual(1)
    expect(shelvingReceipts.length).toBeLessThanOrEqual(2)
    for (const receipt of shelvingReceipts) {
      const b0r = business(before!, RIVAL_R01), b1 = business(after!, RIVAL_R01)
      const ordinal = ordinalOf(b1, receipt.scriptProjectId)
      // Exactly one receipt THIS WEEK for THIS screenplay AT THIS STUDIO. scriptProjectId
      // alone is not a global key: canonicalScriptProjectId(ordinal) repeats across rival
      // studios (1344-E correction 1), so an unscoped filter could count another studio's
      // same-ordinal receipt this week and hide a real over-count at r01.
      expect(shelvedReceiptsOf(newReceipts(before!, after!))
        .filter(r => r.studioId === receipt.studioId && r.scriptProjectId === receipt.scriptProjectId)).toHaveLength(1)
      expect(receipt.rejections).toBe(TUNING_FUTURE.HOLLYWOOD_SHELVE_AFTER_REJECTIONS)
      expect(receipt.conceptId).toBe(b1.projects[ordinal]!.conceptId)
      // The ordinal leaves activeScriptOrdinals, which frees the slot.
      expect(b1.activeScriptOrdinals).not.toContain(ordinal)
      // It keeps status 'ready', its ScriptProject, and its RivalProjectCosts row.
      expect(b1.development.projects[ordinal]!.status).toBe('ready')
      expect(b1.development.projects[ordinal]).toEqual(b0r.development.projects[ordinal])
      expect(b1.projects[ordinal]).toEqual(b0r.projects[ordinal])
      // Its own rejection count reached the threshold at shelving.
      expect(shelving(b0r).rejections.find(r => r.ordinal === ordinal)?.count).toBe(TUNING_FUTURE.HOLLYWOOD_SHELVE_AFTER_REJECTIONS - 1)
    }
    // No money moves beyond the ordinary recurring kinds: the shelving week's nonzero
    // movement-kind set equals the immediately preceding (pure economic-rejection)
    // week's set, for the SAME business.
    const bShelvingBefore = business(before!, RIVAL_R01), bShelvingAfter = business(after!, RIVAL_R01)
    // Control week: the tick immediately BEFORE the shelving tick (one more economic
    // rejection, week shelvingWeek-1 -> shelvingWeek), re-derived from week 130 by the
    // same deterministic route (guaranteed to exist: the threshold is 13, so
    // shelvingWeek is at least 12 ticks after week 130).
    let controlState = liveWeek130()
    for (let w = 130; w < before!.market.tick - 1; w++) controlState = tick(controlState)
    expect(controlState.market.tick).toBe(before!.market.tick - 1)
    const controlAfterTick = tick(controlState)
    const controlKinds = nonzeroDeltaKinds(business(controlState, RIVAL_R01), business(controlAfterTick, RIVAL_R01))
    const shelvingKinds = nonzeroDeltaKinds(bShelvingBefore, bShelvingAfter)
    expect(shelvingKinds).toEqual(controlKinds)
    // Promises unchanged (empty throughout this route).
    expect(after!.promises).toEqual(before!.promises)
  }, 20_000)
})

// ── 2. shelving-blocked-weeks-hold (1344-A §6.2) ────────────────────────────────
describe('shelving-blocked-weeks-hold (1344-A §6.2)', () => {
  it('staffingBlocked weeks (no seatable triple that survives staff()) leave the rejection count unchanged and evaluate no package', () => {
    let state = liveWeek130()
    const RIVAL = RIVAL_R01
    // Warm up one real economic rejection first so there is a nonzero count to hold.
    state = tick(state)
    const b1 = business(state, RIVAL)
    const ordinal = 6
    const countAfterOneRejection = shelving(b1).rejections.find(r => r.ordinal === ordinal)?.count
    expect(countAfterOneRejection, 'route/RED premise: one economic rejection recorded').toBe(1)
    // End one actor's employment (r01 has exactly 3 actors; removing one leaves 2). staff()
    // runs BEFORE decide() within one weekly pass (hollywoodTick.ts advanceHollywoodWeek) and
    // would otherwise re-hire into the vacant slot before decide() ever reads the roster
    // (1344-E corrections 2/3), so ending the contract alone does not reproduce staffingBlocked.
    // The re-hire's own affordability gate is `cash - signingBonus < reserveAfterOffer(terms)`
    // (hollywoodTick.ts staff(), ~:158); driving cash to the PRE-hire reserve+1 fails that gate
    // for any signingBonus>0, because hiring one more person can only raise (never lower) the
    // weekly operating cost the reserve is priced from, so reserveAfterOffer(terms) with the
    // slot refilled is never below the pre-hire reserve.
    const h = state.hollywood!
    const actorOrdinal = h.activeEmploymentOrdinals.find(i => {
      const e = h.employment[i]!
      return e.studioId === RIVAL && state.talent.find(t => t.id === e.terms.talentId)?.role === 'actor'
    })
    expect(actorOrdinal, 'route premise: r01 has a seatable actor to remove').toBeDefined()
    const week = state.market.tick
    const reserve = rivalWeeklyOperatingCost(b1, h, week) * b1.policy.reserveWeeks
    let blocked: GameState = {
      ...state,
      hollywood: {
        ...h,
        employment: h.employment.map((e, i) => i === actorOrdinal ? { ...e, endedWeek: week } : e),
        activeEmploymentOrdinals: h.activeEmploymentOrdinals.filter(i => i !== actorOrdinal),
        businesses: h.businesses.map(row => row.studioId === RIVAL ? { ...row, account: { ...row.account, cash: reserve + 1 } } : row),
      },
    }
    const originalChoose = hollywoodPolicy.chooseIndustryPackage
    const evaluated: unknown[] = []
    const spy = vi.spyOn(hollywoodPolicy, 'chooseIndustryPackage').mockImplementation((input, policy, options) => {
      if (options.lockScreenplay && options.key.startsWith(`${RIVAL}:package:`)) evaluated.push(options.key)
      return originalChoose(input, policy, options)
    })
    try {
      for (let i = 0; i < 3; i++) {
        blocked = tick(blocked)
        const b = business(blocked, RIVAL)
        expect(shelving(b).rejections.find(r => r.ordinal === ordinal)?.count, `staffingBlocked week ${i} holds the count`).toBe(1)
      }
    } finally {
      spy.mockRestore()
    }
    expect(evaluated, 'no package is evaluated for r01 across the staffingBlocked weeks (cash blocks the re-hire, not the package)').toEqual([])
  }, 15_000)

  it('all-hopeless weeks below every candidate still advance the rejection count under 1363 Part A', () => {
    let state = liveWeek130()
    const RIVAL = RIVAL_R01
    state = tick(state)
    const ordinal = 6
    const b1 = business(state, RIVAL)
    expect(shelving(b1).rejections.find(r => r.ordinal === ordinal)?.count).toBe(1)
    // Drive cash to zero: every (negative,marketing) candidate exceeds cashAvailable,
    // so chooseIndustryPackage sees zero affordable candidates. 1363 Part A asks whether
    // any skipped candidate is viable; on this all-hopeless premise none is.
    let blocked: GameState = {
      ...state,
      hollywood: {
        ...state.hollywood!,
        businesses: state.hollywood!.businesses.map(row => row.studioId === RIVAL
          ? { ...row, account: { ...row.account, cash: 0 } } : row),
      },
    }
    for (let i = 0; i < 3; i++) {
      blocked = tick(blocked)
      const b = business(blocked, RIVAL)
      expect(shelving(b).rejections.find(r => r.ordinal === ordinal)?.count, `1363 economic-rejection week ${i} advances despite no affordable package`).toBe(i + 2)
    }
  }, 15_000)

  it('a week with a running production evaluates nothing (count unchanged while productions.length>0; resumes after)', () => {
    // GENUINE input: week 100, r01 has ready ordinal 6 AND a running production
    // (ordinal 10, remainingTicks 5) simultaneously — no fixture editing needed.
    let state = liveWeek100()
    const RIVAL = RIVAL_R01
    const ordinal = 6
    const b0 = business(state, RIVAL)
    expect(b0.productions.length, 'route premise: r01 has a running production at week 100').toBeGreaterThan(0)
    expect(b0.development.projects[ordinal]!.status).toBe('ready')
    let sawFlatWhileRunning = false, resumedCount: number | null = null
    for (let i = 0; i < 10; i++) {
      state = tick(state)
      const b = business(state, RIVAL)
      const count = shelving(b).rejections.find(r => r.ordinal === ordinal)?.count ?? 0
      if (b.productions.length > 0) { expect(count, `week ${state.market.tick}: count flat while a production runs`).toBe(0); sawFlatWhileRunning = true }
      else if (resumedCount === null && count > 0) { resumedCount = count; break }
    }
    expect(sawFlatWhileRunning, 'route/RED premise: at least one week was observed with productions.length>0').toBe(true)
    expect(resumedCount, 'route/RED premise: evaluation resumes (count>0) within 10 weeks of the production finishing').not.toBeNull()
  }, 15_000)

  it('a mixed sequence (staffing-blocked, then economic rejections) shelves only after 13 economic rejections, never 13 calendar weeks', () => {
    let state = liveWeek130()
    const RIVAL = RIVAL_R01
    const ordinal = 6
    const h = state.hollywood!
    const actorOrdinal = h.activeEmploymentOrdinals.find(i => {
      const e = h.employment[i]!
      return e.studioId === RIVAL && state.talent.find(t => t.id === e.terms.talentId)?.role === 'actor'
    })!
    // 1363-F ruling 5: an actual cash refusal now correctly enters cost-cutting.
    // Keep this counting leaf on a noncash staffing block. The original reserve+1
    // arrangement remains a separately labeled Part B entry unit case.
    saveModule.makeSave(state)
    const actorId = h.employment[actorOrdinal]!.terms.talentId
    const originalAssignmentRefusal = careerLifecycle.assignmentRefusal
    const unavailable = vi.spyOn(careerLifecycle, 'assignmentRefusal').mockImplementation((input, personId, atWeek, profession) =>
      personId === actorId ? 'test-only temporary staffing unavailability'
        : originalAssignmentRefusal(input, personId, atWeek, profession))
    let mixed: GameState = state
    const originalChoose = hollywoodPolicy.chooseIndustryPackage
    const evaluatedDuringBlock: unknown[] = []
    const spy = vi.spyOn(hollywoodPolicy, 'chooseIndustryPackage').mockImplementation((input, policy, options) => {
      if (options.lockScreenplay && options.key.startsWith(`${RIVAL}:package:`)) evaluatedDuringBlock.push(options.key)
      return originalChoose(input, policy, options)
    })
    try {
      for (let i = 0; i < 3; i++) mixed = tick(mixed)
    } finally {
      spy.mockRestore()
      unavailable.mockRestore()
    }
    expect(shelving(business(mixed, RIVAL)).rejections.find(r => r.ordinal === ordinal)?.count ?? 0).toBe(0)
    expect(evaluatedDuringBlock, 'no package is evaluated for r01 across the staffingBlocked weeks').toEqual([])
    // Removing the noncash availability control restores the real unchanged
    // employment and accounting state. No cash, contract or receipt is restored.
    saveModule.makeSave(mixed)
    const cutting = business(mixed, RIVAL) as RivalBusiness & { costCutting: { version: 1; since: number | null } }
    expect(cutting.costCutting.since, 'noncash staffing must not enter cost-cutting').toBeNull()
    let shelvedAt: number | null = null
    for (let i = 0; i < 16; i++) {
      const before = mixed
      mixed = tick(mixed)
      const count = shelving(business(mixed, RIVAL)).rejections.find(r => r.ordinal === ordinal)?.count ?? 0
      // Studio-AND-screenplay scoped (1344-E correction 1: scriptProjectId repeats across
      // studios), the same fix applied at the stalled-route leaf above.
      const fresh = shelvedReceiptsOf(newReceipts(before, mixed)).filter(r => r.studioId === RIVAL && r.scriptProjectId === business(mixed, RIVAL).development.projects[ordinal]!.id)
      if (fresh.length > 0) { shelvedAt = i + 1; break } // i+1 = number of economic-rejection ticks since restoring staffing
      expect(count).toBe(i + 1)
    }
    expect(shelvedAt, 'route/RED premise: shelving occurs after exactly 13 economic-rejection weeks post-restoration').toBe(13)
  }, 20_000)
})

// ── 3. shelving-viable-control (1344-F Amendment 2) ─────────────────────────────
describe('shelving-viable-control (1344-F Amendment 2)', () => {
  it('genesis to week 77: admitted candidate matches the genuine old input under the existing projections; zero shelves precede its own first visible shelving', () => {
    // 1363-F11 trigger: measured Part A receipt week77 first appears at produced week78.
    // Keep the old week93 fixture. This new original-engine capture does not assert
    // that earlier Hollywood divergence is harmless; exact comparison below decides.
    const mods = saveModule as unknown as {
      convertV42ToV43(s: unknown): { state: GameState }
      convertV43ToV44(s: unknown): { state: GameState }
      validateSaveV46(s: unknown): unknown
      convertV46ToV45(s: unknown): { state: GameState }
    }
    const genuine = genuineV42Week77(), originalBytes = saveModule.stableStringify(genuine)
    const genuineState = mods.convertV43ToV44(mods.convertV42ToV43(genuine)).state
    expect(saveModule.stableStringify(genuine)).toBe(originalBytes)
    let state = HARNESS_GENESIS()
    for (let week = 0; week < 77; week++) state = tick(state)
    expect(state.market.tick).toBe(77)
    const stateBytes = saveModule.stableStringify(state)
    const ordinary = saveModule.makeSave(state), ordinaryBytes = saveModule.stableStringify(ordinary)
    let candidate45: GameState
    if (Number(ordinary.saveVersion) === 45) {
      // Part A-only Save45: validate the actual ordinary candidate before projections.
      expect(saveModule.validateSaveV45(ordinary)).toBe(ordinary)
      candidate45 = ordinary.state
    } else {
      // Combined Save46: admit it, then require empty recovery before a real downgrade.
      expect(Number(ordinary.saveVersion)).toBe(46)
      expect(mods.validateSaveV46(ordinary)).toBe(ordinary)
      for (const business of ordinary.state.hollywood!.businesses) {
        expect((business as unknown as { costCutting: unknown }).costCutting,
          'UNMET PREMISE: recovery entered before historical comparison').toEqual({ version: 1, since: null })
        for (const period of business.account.periods)
          expect((period.movements as unknown as Record<string, number>).facilityDemolitionRefund,
            'UNMET PREMISE: real refund cannot be projected away').toBe(0)
      }
      expect(ordinary.state.hollywood!.receipts.some(r => (r.kind as string) === 'facilityDisposed'),
        'UNMET PREMISE: real disposal cannot be projected away').toBe(false)
      const historical = mods.convertV46ToV45(ordinary)
      expect(saveModule.validateSaveV45(historical)).toBe(historical)
      candidate45 = historical.state
    }
    expect(saveModule.stableStringify(ordinary)).toBe(ordinaryBytes)
    expect(saveModule.stableStringify(state)).toBe(stateBytes)
    const strip = (s: GameState) => ({ ...s, hollywood: s.hollywood === null ? null : {
      ...s.hollywood, businesses: s.hollywood.businesses.map(b => {
        const { screenplayShelving: _drop, ...rest } = b as unknown as Record<string, unknown>
        return rest
      }),
    } })
    // Canonical JSON retains array order and the save format's existing -0→0 law.
    const canon = (v: unknown): unknown => Array.isArray(v) ? v.map(canon)
      : v !== null && typeof v === 'object' ? Object.fromEntries(Object.keys(v as object).sort().map(k => [k, canon((v as Record<string, unknown>)[k])])) : v
    const withoutSliceB = (s: GameState) => ({ ...s, relationships: (s.relationships ?? []).map(e => ({ ...e, competitions: [], romance: null })) })
    expect((candidate45.relationships ?? []).every(e => e.competitions.length === 0)).toBe(true)
    // Existing authorized P15 projection, still guarded by every original premise.
    expect(candidate45.sharedMarket.assessments).toEqual([])
    expect(candidate45.campaignLegacy.official).toBeNull()
    expect(candidate45.campaignLegacy.endOfRun).toBeNull()
    expect(() => validatePowerRankingArchive(candidate45 as unknown as Record<string, unknown>)).not.toThrow()
    expect(() => saveModule.validateP15Allocator(candidate45 as unknown as Record<string, unknown>, 'week-77 control')).not.toThrow()
    const withoutP15 = (s: GameState) => {
      const { powerRanking: _pr, p15Sequence: _seq, sharedMarket: _sm, campaignLegacy: _cl, ...rest } = s
      return rest as unknown as GameState
    }
    expect(JSON.stringify(canon(strip(withoutSliceB(withoutP15(candidate45)))))).toBe(JSON.stringify(canon(strip(genuineState))))
    expect(state.hollywood!.receipts).toEqual(genuineState.hollywood!.receipts)
    expect(shelvedReceiptsOf(state.hollywood!.receipts), 'route premise: zero shelving through produced week77').toHaveLength(0)
    const BOUND = 16
    let probe = state, found = false
    for (let i = 0; i < BOUND; i++) {
      const before = probe
      probe = tick(probe)
      if (shelvedReceiptsOf(newReceipts(before, probe)).length > 0) { found = true; break }
    }
    expect(found, `first visible shelving must occur within ${BOUND} later ticks from the exact compared state`).toBe(true)
    expect(saveModule.stableStringify(state)).toBe(stateBytes)
    expect(saveModule.stableStringify(genuine)).toBe(originalBytes)
  }, 30_000)

  it('a business with at least one recorded greenlight and zero economic rejections in the first 5 weeks keeps the empty screenplayShelving state', () => {
    // 1344-F2 non-blocking note 1: assert the leaf's own premise, not just its
    // conclusion. A direct trace (recorded here, reproducible) showed the ORIGINAL
    // 20-week window is unsound: on this seed, EVERY rival's first screenplay
    // greenlights immediately and cleanly (week 3 for r01/r03, week 4 for r02/r04,
    // zero-gap: ready and filmAnnounced the SAME week), but by week 5-6 every rival's
    // SECOND screenplay goes 'ready' and then stays ready-and-unevaluated for
    // several REAL consecutive weeks (a genuine early rejection sequence, not a
    // decision-cadence artifact — e.g. r01's second screenplay is ready from week 6
    // through week 11, six straight non-greenlighting evaluations, before finally
    // greenlighting at week 12). So no rival has a truly rejection-free run inside a
    // 20-week window on this seed; 1344-D's own suggestion ("narrow the window to
    // right after the observed greenlight") is the sound fix, not a weaker premise
    // check layered on the original window. This leaf narrows to 5 weeks — enough
    // for every rival's clean first greenlight, short of every rival's second
    // screenplay ever going 'ready' — and still asserts the premise explicitly
    // (never had a ready screenplay persist un-greenlit) rather than assuming it.
    let state = HARNESS_GENESIS()
    const WINDOW = 5
    const greenlitStudios = new Set<string>()
    const stuckReadyStudios = new Set<string>()
    for (let week = 0; week < WINDOW; week++) {
      const before = state
      state = tick(state)
      const freshFilmAnnouncedStudios = new Set(newReceipts(before, state).filter(r => r.kind === 'filmAnnounced').map(r => r.studioId))
      for (const studioId of freshFilmAnnouncedStudios) greenlitStudios.add(studioId)
      for (const b of before.hollywood!.businesses) {
        const readyBefore = b.activeScriptOrdinals.filter(i => b.development.projects[i]!.status === 'ready')
        if (readyBefore.length === 0) continue
        const after = state.hollywood!.businesses.find(row => row.studioId === b.studioId)!
        const stillReadyAfter = readyBefore.some(i => after.development.projects[i]!.status === 'ready')
        if (stillReadyAfter && !freshFilmAnnouncedStudios.has(b.studioId)) stuckReadyStudios.add(b.studioId)
      }
    }
    const clean = [...greenlitStudios].filter(id => !stuckReadyStudios.has(id))
    expect(clean.length, `route/RED premise: at least one rival both greenlights and never has a ready screenplay persist un-greenlit, within ${WINDOW} weeks of genesis`).toBeGreaterThan(0)
    const b = business(state, clean[0]!)
    expect(shelving(b)).toEqual(EMPTY_SHELVING)
  }, 15_000)
})

// ── 4. shelving-commission-hold (1344-A §6.4) ───────────────────────────────────
describe('shelving-commission-hold (1344-A §6.4)', () => {
  it('no new development project for the shelving studio during its commission hold; commissionHoldUntilWeek is exactly week+HOLD; a commission is not permanently blocked', () => {
    let state = liveWeek130()
    const RIVAL = RIVAL_R01
    const BOUND = 16
    let shelvingWeek: number | null = null
    let projectsAtShelving: number | null = null
    let costRowsAtShelving: number | null = null
    for (let i = 0; i < BOUND; i++) {
      const before = state
      state = tick(state)
      const fresh = shelvedReceiptsOf(newReceipts(before, state)).filter(r => r.studioId === RIVAL)
      if (fresh.length > 0) {
        shelvingWeek = before.market.tick
        const b = business(state, RIVAL)
        projectsAtShelving = b.development.projects.length
        costRowsAtShelving = b.projects.length
        break
      }
    }
    expect(shelvingWeek, 'route/RED premise (shared with test 1)').not.toBeNull()
    const bAtShelving = business(state, RIVAL)
    const hold = shelving(bAtShelving).commissionHoldUntilWeek
    expect(hold).toBe(shelvingWeek! + TUNING_FUTURE.HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS)
    let commissionedAt: number | null = null
    for (let i = 0; i < 30; i++) {
      const week = state.market.tick
      state = tick(state)
      const b = business(state, RIVAL)
      if (week < hold) {
        expect(b.development.projects.length, `week ${week} (< hold ${hold}): no new development project`).toBe(projectsAtShelving)
        expect(b.projects.length, `week ${week} (< hold ${hold}): no new cost row`).toBe(costRowsAtShelving)
      } else if (commissionedAt === null && b.development.projects.length > projectsAtShelving!) {
        commissionedAt = week + 1
      }
    }
    expect(commissionedAt, 'a commission is possible once the hold has elapsed (writer free: a ready screenplay does not occupy the writer; cash far above reserve on this route)').not.toBeNull()
    expect(commissionedAt!).toBeGreaterThanOrEqual(hold)
  }, 30_000)
})

// ── 5. shelving-retry (1344-F Amendment 1) ──────────────────────────────────────
describe('shelving-retry (1344-F Amendment 1: retry reads b.development.projects[ordinal] directly, not through hotDevelopment)', () => {
  it('no retry before retryWeek', () => {
    let state = liveWeek130()
    const RIVAL = RIVAL_R01, ordinal = 6, week = state.market.tick
    state = markShelved(state, RIVAL, ordinal, week, week + 100)
    for (let i = 0; i < 3; i++) {
      state = tick(state)
      const b = business(state, RIVAL)
      expect(b.activeScriptOrdinals).not.toContain(ordinal)
      const entry = shelving(b).shelved.find(s => s.ordinal === ordinal)
      expect(entry, 'shelved entry persists (not due)').toBeDefined()
      expect(entry!.retryWeek).toBe(week + 100)
    }
  }, 15_000)

  it('a viable retry re-enters the slot and greenlights, removing the shelved entry', () => {
    // Genuine, derived viable moment: at genesis week 3, r01's ordinal 0 is 'ready'
    // and naturally greenlights on the very next tick (verified by exploration
    // against unmodified HEAD; see handback). Marking it shelved-and-due here, with
    // nothing else in the state changed, must reproduce the SAME greenlight.
    let state = HARNESS_GENESIS()
    for (let week = 0; week < 3; week++) state = tick(state)
    expect(state.market.tick).toBe(3)
    const RIVAL = RIVAL_R01
    const before = business(state, RIVAL)
    expect(before.activeScriptOrdinals).toEqual([0])
    expect(before.development.projects[0]!.status).toBe('ready')
    state = markShelved(state, RIVAL, 0, 3, 3)
    const after = tick(state)
    const b = business(after, RIVAL)
    expect(b.activeScriptOrdinals).toContain(0)
    expect(shelving(b).shelved.find(s => s.ordinal === 0)).toBeUndefined()
    expect(newReceipts(state, after).some(r => r.kind === 'filmAnnounced' && r.studioId === RIVAL)).toBe(true)
    expect(b.development.projects[0]!.status).toBe('inProduction')
  }, 15_000)

  it('an unviable retry advances retryWeek and stays shelved (and never re-enters the slot, so it cannot be shelved twice)', () => {
    let state = liveWeek130()
    const RIVAL = RIVAL_R01, ordinal = 6, week = state.market.tick
    state = markShelved(state, RIVAL, ordinal, week, week)
    const before = state
    state = tick(state)
    const b = business(state, RIVAL)
    expect(b.activeScriptOrdinals).not.toContain(ordinal)
    const entry = shelving(b).shelved.find(s => s.ordinal === ordinal)
    expect(entry, 'stays shelved').toBeDefined()
    expect(entry!.retryWeek).toBe(week + TUNING_FUTURE.HOLLYWOOD_SHELVED_RETRY_WEEKS)
    expect(shelvedReceiptsOf(newReceipts(before, state)).filter(r => r.scriptProjectId === b.development.projects[ordinal]!.id)).toHaveLength(0)
  }, 15_000)

  it('no retry without a free slot (both original ordinals stay active, and a synthetic third due-shelved entry is not promoted)', () => {
    let state = liveWeek130()
    const RIVAL = RIVAL_R01
    const week = state.market.tick
    const h = state.hollywood!
    // Synthetic third "ready, due" entry: flip an already-produced project's status
    // back to 'ready' for this gate check only (isolated from the money/receipt
    // invariants tests 1/6 already cover) and mark it shelved-and-due.
    const b0 = h.businesses.find(row => row.studioId === RIVAL)!
    const syntheticOrdinal = 0
    expect(b0.development.projects[syntheticOrdinal]!.status).toBe('produced')
    const flippedBusinesses = h.businesses.map(row => row.studioId !== RIVAL ? row : {
      ...row,
      development: { ...row.development, projects: row.development.projects.map((p, i) => i === syntheticOrdinal ? { ...p, status: 'ready' as const } : p) },
    })
    state = { ...state, hollywood: { ...h, businesses: flippedBusinesses } }
    state = markShelved(state, RIVAL, syntheticOrdinal, week, week)
    const bBefore = business(state, RIVAL)
    expect([...bBefore.activeScriptOrdinals].sort((a, c) => a - c)).toEqual([6, 11]) // both slots full
    const before = state
    state = tick(state)
    const bAfter = business(state, RIVAL)
    expect(bAfter.activeScriptOrdinals).not.toContain(syntheticOrdinal)
    const entry = shelving(bAfter).shelved.find(s => s.ordinal === syntheticOrdinal)
    expect(entry, 'no free slot: the due retry is not attempted, so the entry is untouched').toBeDefined()
    expect(entry!.retryWeek).toBe(week) // unchanged: no attempt at all, not even an unviable one
    expect(newReceipts(before, state).some(r => r.kind === 'filmAnnounced' && r.studioId === RIVAL)).toBe(false)
  }, 15_000)

  it('at most one retry per decision: two shelved-and-due entries in the same week advance at most one', () => {
    let state = liveWeek130()
    const RIVAL = RIVAL_R01
    const week = state.market.tick
    const h = state.hollywood!
    const b0 = h.businesses.find(row => row.studioId === RIVAL)!
    expect([...b0.activeScriptOrdinals].sort((a, c) => a - c)).toEqual([6, 11])
    let clearedState: GameState = {
      ...state,
      hollywood: { ...h, businesses: h.businesses.map(row => row.studioId !== RIVAL ? row : { ...row, activeScriptOrdinals: [] }) },
    }
    clearedState = markShelved(clearedState, RIVAL, 6, week, week)
    clearedState = markShelved(clearedState, RIVAL, 11, week, week)
    const after = tick(clearedState)
    const bAfter = business(after, RIVAL)
    const entry6 = shelving(bAfter).shelved.find(s => s.ordinal === 6)
    const entry11 = shelving(bAfter).shelved.find(s => s.ordinal === 11)
    const changed = [entry6, entry11].filter(e => e !== undefined && e.retryWeek !== week).length
      + (bAfter.activeScriptOrdinals.includes(6) ? 1 : 0) + (bAfter.activeScriptOrdinals.includes(11) ? 1 : 0)
    expect(changed, 'at most one of the two due entries is processed this decision').toBeLessThanOrEqual(1)
  }, 15_000)
})

// ── 6. shelving-promise-guard (1344-A §3.3, §6.6) ───────────────────────────────
describe('shelving-promise-guard (1344-A §3.3)', () => {
  it('an open SPECIFIC_PROJECT promise naming the screenplay defers shelving (count held at 13); shelving proceeds at the next economic rejection after it settles', () => {
    let state = liveWeek130()
    const RIVAL = RIVAL_R01, ordinal = 6
    // Tick to count 12 (one short of the threshold), derived, not hard-coded.
    for (let i = 0; i < 12; i++) state = tick(state)
    const b12 = business(state, RIVAL)
    expect(shelving(b12).rejections.find(r => r.ordinal === ordinal)?.count).toBe(12)
    const scriptProjectId = b12.development.projects[ordinal]!.id
    // Hand-built open promise (contractId: null keeps it inert to advancePromisesWeek's
    // automatic settlement — `evaluable` requires contractId !== null — so the test
    // controls exactly when it "settles", per the brief's editing convention).
    const promise = {
      promiseId: 'promise-1344-guard-0', family: 'SPECIFIC_PROJECT' as const, version: 1,
      issuerStudioId: RIVAL, beneficiaryPersonId: b12.development.projects.find(p => p.status !== 'produced')!.writerId,
      predicate: { kind: 'projectOpportunity' as const, count: 1 as const, seatClass: 'allCast' as const, scriptProjectId },
      windowStartWeek: state.market.tick, dueWeekExclusive: state.market.tick + 52,
      feasibilityReceipt: { classification: 'FRAGILE' as const, bottleneck: 'synthetic for 1344-C test isolation', inputsDigest: 'test', rulesVersion: 7, week: state.market.tick },
      progress: 0, evidenceRefs: [], outcome: null, outcomeWeek: null, outcomeCause: null, outcomeEventId: null, contractId: null,
      supersededByPromiseId: null,
    }
    state = { ...state, promises: [...state.promises, promise as unknown as GameState['promises'][number]] }
    // The tick that would have shelved it: count stays AT the threshold, no receipt for
    // THIS screenplay at THIS studio (1344-E correction 5: count only r01's named
    // screenplay — other screenplays, at r01 or another rival, lawfully shelve the same
    // week, so an unfiltered receipt count is too strong a guard).
    let before = state
    state = tick(state)
    let b = business(state, RIVAL)
    expect(shelving(b).rejections.find(r => r.ordinal === ordinal)?.count).toBe(13)
    expect(b.activeScriptOrdinals).toContain(ordinal)
    expect(shelvedReceiptsOf(newReceipts(before, state)).filter(r => r.studioId === RIVAL && r.scriptProjectId === scriptProjectId)).toHaveLength(0)
    // Two more weeks with the promise still open: holds at 13, still not shelved.
    for (let i = 0; i < 2; i++) {
      before = state
      state = tick(state)
      b = business(state, RIVAL)
      expect(shelving(b).rejections.find(r => r.ordinal === ordinal)?.count).toBe(13)
      expect(b.activeScriptOrdinals).toContain(ordinal)
      expect(shelvedReceiptsOf(newReceipts(before, state)).filter(r => r.studioId === RIVAL && r.scriptProjectId === scriptProjectId)).toHaveLength(0)
    }
    // Settle it under the existing law (simulated directly, per the brief's editing
    // convention — the full talent-market settlement path is out of this file's scope).
    state = {
      ...state,
      promises: state.promises.map(p => (p as unknown as { promiseId: string }).promiseId === 'promise-1344-guard-0'
        ? { ...p, outcome: 'BROKEN', outcomeWeek: state.market.tick, outcomeCause: '1344-C test: simulated settlement' } as unknown as typeof p
        : p),
    }
    before = state
    state = tick(state)
    b = business(state, RIVAL)
    expect(shelvedReceiptsOf(newReceipts(before, state)).filter(r => r.studioId === RIVAL && r.scriptProjectId === scriptProjectId)).toHaveLength(1)
    expect(b.activeScriptOrdinals).not.toContain(ordinal)
  }, 20_000)
})

// ── 7. shelving-feasibility-readers (1344-A §3.6, §6.7) ─────────────────────────
// Sub-clause (c), "authorRivalPromise excludes shelved screenplays from its project
// candidates", could not be independently exercised through `authorRivalPromise`
// itself in 1344-C: it is private to talentMarket.ts, and two exploratory probes
// (recorded in the 1344-C handback) found 0 rival SPECIFIC_PROJECT promises in 80
// weeks from genesis and 0 in the week 130-230 renewal window on r01 — the two
// count-family candidates authorRivalPromise tries first resolve every time this
// route was sampled. Per 1344-X2's parent API decision, production now exports
// `rivalPromiseProjectCandidates(state, studioId): ScriptProject[]` from
// talentMarket.ts (the issuer's non-produced, non-shelved screenplays, sorted by id,
// first two) and `authorRivalPromise` uses it — tested directly below, covering §6
// item 7(c) without needing the private negotiation-trigger path.
describe('rivalPromiseProjectCandidates (1344-X2 parent API decision; covers 1344-A §6 item 7(c))', () => {
  type Candidates = (state: GameState, studioId: string) => { id: string; status: string }[]
  const candidatesOf = (): Candidates => (talentMarket as unknown as { rivalPromiseProjectCandidates: Candidates }).rivalPromiseProjectCandidates

  it('a shelved screenplay is absent from the candidates', () => {
    let state = liveWeek130()
    const week = state.market.tick
    state = markShelved(state, RIVAL_R01, 6, week, week + 200)
    const b = business(state, RIVAL_R01)
    const shelvedId = b.development.projects[6]!.id
    const result = candidatesOf()(state, RIVAL_R01)
    expect(result.some(p => p.id === shelvedId), 'the shelved screenplay must be absent').toBe(false)
  })

  it('with nothing shelved, the result equals the first two non-produced screenplays by id', () => {
    const state = liveWeek130()
    const b = business(state, RIVAL_R01)
    const expected = [...b.development.projects].filter(p => p.status !== 'produced')
      .sort((x, y) => x.id < y.id ? -1 : x.id > y.id ? 1 : 0).slice(0, 2)
    expect(expected.map(p => p.id), 'route premise: two non-produced screenplays are the ready ordinals 6 and 11').toEqual(['script-0006', 'script-0011'])
    const result = candidatesOf()(state, RIVAL_R01)
    expect(result).toEqual(expected)
  })
})

describe('shelving-feasibility-readers (1344-A §3.6)', () => {
  it('a shelved screenplay changes the feasibility digest (unproducedScripts must stop counting it, promises.ts:410-411)', () => {
    const stateA = liveWeek130()
    const draft: PromiseDraft = {
      family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', issuerStudioId: RIVAL_R01,
      beneficiaryPersonId: business(stateA, RIVAL_R01).development.projects[6]!.writerId === 'person-studio-aca408ec-r01-2'
        ? 'person-studio-aca408ec-r01-3' : 'person-studio-aca408ec-r01-2',
      predicate: { kind: 'castRoleCount', count: 1, seatClass: 'leadOrAntagonist' },
      startWeek: stateA.market.tick, termWeeks: 104, windowStartWeek: stateA.market.tick, dueWeekExclusive: stateA.market.tick + 60,
    }
    const receiptA = promiseFeasibility(stateA, draft, stateA.market.tick)
    const h = stateA.hollywood!
    const shelvedBusinesses = h.businesses.map(row => row.studioId !== RIVAL_R01 ? row : { ...row, activeScriptOrdinals: row.activeScriptOrdinals.filter(i => i !== 6) })
    const stateB: GameState = { ...stateA, hollywood: { ...h, businesses: shelvedBusinesses } }
    const receiptB = promiseFeasibility(stateB, draft, stateB.market.tick)
    expect(receiptB.inputsDigest, 'RED premise: today unproducedScripts filters by status only, so removing ordinal 6 from activeScriptOrdinals alone does not change the digest; once shelved screenplays are excluded from the count, it must').not.toBe(receiptA.inputsDigest)
  })

  it('opportunity paths mark a shelved screenplay impossible with reason "the named script project is shelved"', () => {
    // 1344-E correction 6: the project must actually be shelved before the quote — this
    // leaf previously named ordinal 6 as "shelvedProjectId" without ever calling the
    // file's own markShelved helper, so it quoted an unmodified, still-active/ready
    // project. markShelved builds a validator-lawful shelved state (1344-D2 §5).
    let state = liveWeek130()
    const week = state.market.tick
    state = markShelved(state, RIVAL_R01, 6, week, week + 26)
    const b = business(state, RIVAL_R01)
    const shelvedProjectId = b.development.projects[6]!.id
    expect(b.activeScriptOrdinals, 'route/RED premise: markShelved actually removed ordinal 6 from the active set').not.toContain(6)
    const actorId = 'person-studio-aca408ec-r01-2'
    const draft: PromiseDraft = {
      family: 'SPECIFIC_PROJECT', issuerStudioId: RIVAL_R01, beneficiaryPersonId: actorId,
      predicate: { kind: 'projectOpportunity', count: 1, seatClass: 'allCast', scriptProjectId: shelvedProjectId },
      startWeek: state.market.tick, termWeeks: 104, windowStartWeek: state.market.tick, dueWeekExclusive: state.market.tick + 90,
    }
    const receipt = promiseFeasibility(state, draft, state.market.tick)
    expect(receipt.classification).toBe('IMPOSSIBLE')
    expect(receipt.bottleneck).toBe('the named script project is shelved')
  })
})

// ── 8. shelving-chart-output (1344-A §6.8) ──────────────────────────────────────
describe('shelving-chart-output (1344-A §6.8)', () => {
  it('the 13-week chart row equals released (produced) films with a shelved screenplay present, and the state validates', () => {
    let state = liveWeek130()
    const RIVAL = RIVAL_R01
    let sawShelving = false
    // week 130 is itself a chart week (130 = 13*10); tick forward to the first LATER
    // chart week (week%13===0) at or after a shelving.
    for (let i = 0; i < 40; i++) {
      const before = state
      state = tick(state)
      if (shelvedReceiptsOf(newReceipts(before, state)).some(r => r.studioId === RIVAL)) sawShelving = true
      if (sawShelving && state.market.tick % 13 === 0) break
    }
    expect(sawShelving, 'route/RED premise: a shelving occurred before the next chart week').toBe(true)
    expect(state.market.tick % 13).toBe(0)
    const b = business(state, RIVAL)
    expect(shelving(b).shelved.length, 'route/RED premise: at least one shelved screenplay present at this chart week').toBeGreaterThan(0)
    const row = state.hollywood!.chart!.rows.find(r => r.studioId === RIVAL)
    expect(row, 'route premise: r01 has a chart row').toBeDefined()
    // 1344-E correction 7: expected output = produced + authored films, exactly as the
    // validator's own chart-output law defines it for a non-player studio
    // (hollywoodValidation.ts: a rival's output counts h.films at this studioId where
    // provenance is 'authored-start/v1' (unconditionally) OR the film is a released
    // simulation/v1 film (result.releaseTick before this observation week) — NOT
    // development.projects[*].status==='produced', which omits the two authored
    // canonical starting films entirely.
    const h = state.hollywood!
    const authoredCount = h.films.filter(f => f.studioId === RIVAL && f.provenance === 'authored-start/v1').length
    const releasedSimulationCount = h.films.filter(f => f.studioId === RIVAL && f.provenance === 'simulation/v1' && f.result.releaseTick < state.market.tick).length
    expect(authoredCount, 'route premise: r01 has its two canonical starting (authored) films').toBe(2)
    expect(row!.output).toBe(releasedSimulationCount + authoredCount)
    const mods = saveModule as unknown as { validateSaveV46: (s: unknown) => unknown }
    expect(() => mods.validateSaveV46(saveModule.makeSave(state))).not.toThrow()
  }, 20_000)
})

// ── 10. shelving-player-symmetry (1344-A §3.6) ──────────────────────────────────
// CLASSIFICATION NOTE: this leaf is expected to pass at RED too (a real "control"),
// because no screenplayShelved receipt of ANY kind exists yet at BASE, so the
// assertion "never for the player" holds vacuously today. It remains a meaningful
// regression guard once GREEN lands real screenplayShelved receipts for rivals.
describe('shelving-player-symmetry (1344-A §3.6, control at RED)', () => {
  it('no screenplayShelved receipt ever names the player studio, across a long natural route', () => {
    let state = HARNESS_GENESIS()
    for (let week = 0; week < 60; week++) state = tick(state)
    const playerStudioId = state.hollywood!.playerStudioId
    expect(shelvedReceiptsOf(state.hollywood!.receipts).some(r => r.studioId === playerStudioId)).toBe(false)
    // The player's own ScriptDevelopment root never gains a screenplayShelving-shaped key.
    expect(Object.hasOwn(state.scriptDevelopment as unknown as object, 'screenplayShelving')).toBe(false)
  }, 15_000)
})
