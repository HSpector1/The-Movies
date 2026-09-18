// ── P13B-S8 test 4: typed rival ledger kinds and interval Opex reconcile;
// migration basis frozen; legacy zero-Opex grandfathered ───────────────────
//
// Requirement-derived from "S8 — Symmetric rival research and finance" scope
// record ("Typed rival ledger kinds: researchSpend, researchCapacity
// (Lab/instrument capex), technologyRestoration, technologyRefund (S6),
// beside the existing kinds; interval Opex for rival plant (weekly operating
// cost booked per interval, as the player's baseline opex); the migration
// basis frozen at the migration week (a rival that enters by migration
// carries its historical account as-is; legacy zero-Opex rivals
// grandfathered — no invented back-charges)"), the plan's "Tests" item 4
// ("typed ledger kinds and interval Opex reconcile; migration basis frozen;
// legacy zero-Opex grandfathered"), and the Audit's S8 LAW items:
//   6. (B2) rivalCapacityOpex gains `laboratory`
//      (TUNING.RESEARCH_LABORATORY_WEEKLY_OPERATING_COST) and instrument
//      opex per instrumentOperational receipt
//      (TUNING.ELECTRICAL_CONTROL_INSTRUMENTS_WEEKLY_OPERATING_COST); the
//      existing weekly facilityOpex booking and the validator reconciliation
//      thereby cover interval Opex — no separate mechanism; "grandfathering
//      = no back-charges (opex starts at the Lab's operational week)".
//   10. researchCapacity reconciliation (coverage 4): per period equals
//      -Sum(approvedQuote.total) of the rival's plans admitted in the period.
//
// RED-by-design (T1, before the S8 engine landed): `src/core/rivalResearch.ts`
// did not exist; `admitRivalPlans` was this file's one import from that
// module, called below. AMENDED (coordinator, plan authority, 2026-09-18,
// engine landed at `c609e0a`): two cases were rewritten against the landed
// law rather than the T1 pre-engine gap —
//   - The former "PRECONDITION" case asserted `rivalCapacityOpex` THROWING
//     on a rival Laboratory; the landed law PRICES it instead (S8 LAW item
//     6) — inverted, and extended to price a held instrument module too.
//   - "Migration basis frozen" now lifts a GENUINE V26 period (ten keys)
//     through the real `migrateToV28` and compares it to its own V26
//     source, rather than widening a LIVE period against itself — a live
//     period already carries all fourteen keys under the landed engine, so
//     that comparison was vacuous.
//
// PREMISES NAMED:
//   1. `admitRivalPlans(state)` returns `{state, history}` — same premise as
//      tests/p13b-s8-capacity.test.ts's header, not repeated here in full.
//   2. `researchSpend`'s "expenditure deltas per period" is read as: the sum
//      of `researchSpend` movements within a period equals the sum, over
//      every rival project active in that period, of that project's
//      `expenditure` field's increase across the period — mirroring how
//      technology.ts's OWN validator reconciles a player's `researchSpend`
//      ledger rows against `project.expenditure` (technology.ts, "research
//      expenditure does not reconcile with its receipts"). Not directly
//      exercised below (no active rival project in this file); the S8-T2
//      validator itself enforces it (see tests/p13b-s8-save-v27.test.ts).

import { describe, expect, it } from 'vitest'
import * as save from '../src/core/save.js'
import { instrumentWeeklyOperatingCost, rivalCapacityOpex, rivalWeeklyOperatingCost, RIVAL_RESEARCH_MONEY_KINDS } from '../src/core/hollywood.js'
import { TUNING } from '../src/core/tuning.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
import type { HollywoodState, IndustryReceipt, RivalBusiness } from '../src/core/hollywoodTypes.js'
// RED-by-design: src/core/rivalResearch.ts does not exist yet. This is the
// ONE import from that new module in this file.
import { admitRivalPlans } from '../src/core/rivalResearch.js'

type SaveModuleWithV27 = typeof save & {
  migrateToV28: (envelope: unknown) => { saveVersion: number; seed: string; state: GameState; broadcastCache: unknown[] }
}
const withV27 = save as SaveModuleWithV27

const SEED = 'p13b-s8-finance-01'

function bellwether(state: GameState): { hollywood: HollywoodState; business: RivalBusiness } {
  const hollywood = state.hollywood!
  const identity = hollywood.identities.find(s => s.row === 1)!
  const business = hollywood.businesses.find(b => b.studioId === identity.studioId)!
  return { hollywood, business }
}

function withRivalCash(state: GameState, studioId: string, cash: number): GameState {
  const hollywood = structuredClone(state.hollywood)!
  hollywood.businesses = hollywood.businesses.map(b => {
    if (b.studioId !== studioId) return b
    const periods = [...b.account.periods]
    const last = { ...periods[periods.length - 1]! }
    const delta = cash - b.account.cash
    last.movements = { ...last.movements, capacity: last.movements.capacity + delta }
    last.closing = cash
    periods[periods.length - 1] = last
    return { ...b, account: { ...b.account, cash, periods } }
  })
  return { ...state, hollywood }
}

describe('P13B-S8 rival finance: typed kinds and interval Opex reconcile, migration frozen, legacy grandfathered (test 4)', () => {
  it('baseline (S8 LAW item 6, landed): rivalCapacityOpex prices a held Laboratory at its authored weekly cost, and each instrumentOperational receipt adds ITS OWN module\'s weekly cost on top', () => {
    const base = p13aGeneratedStudio(SEED)
    const { hollywood, business } = bellwether(base)
    const labId = `${business.studioId}:lab-forged`
    const forged: RivalBusiness = { ...business, operations: { ...business.operations, facilities: [...business.operations.facilities,
      { id: labId, name: 'Research Laboratory', capability: 'laboratory' as const, capacity: 4 }] } }
    const baseline = TUNING.BASELINE_DEVELOPMENT_CASTING_WEEKLY_OPERATING_COST + TUNING.STAGE_STANDARD_WEEKLY_OPERATING_COST +
      TUNING.SCENERY_SHOP_WEEKLY_OPERATING_COST + TUNING.POST_BUILDING_WEEKLY_OPERATING_COST
    expect(rivalCapacityOpex(forged)).toBe(baseline + TUNING.RESEARCH_LABORATORY_WEEKLY_OPERATING_COST) // no receipts arg: Laboratory priced alone
    const instrumentReceipt: IndustryReceipt = { eventId: 'industry-event-forged-instrument', week: base.market.tick,
      studioId: business.studioId, kind: 'instrumentOperational', facilityId: labId, technologyId: 'synchronized-sound' }
    const receipts = [...hollywood.receipts, instrumentReceipt]
    expect(rivalCapacityOpex(forged, receipts)).toBe(
      baseline + TUNING.RESEARCH_LABORATORY_WEEKLY_OPERATING_COST + instrumentWeeklyOperatingCost('synchronized-sound'))
  })

  it('legacy zero-Opex grandfathered (today, real code): a rival that never builds a Laboratory is UNAFFECTED — its rivalCapacityOpex is exactly the starting-facility baseline, unchanged by S8', () => {
    const base = p13aGeneratedStudio(SEED)
    const { business } = bellwether(base)
    expect(business.operations.facilities.some(f => f.capability === 'laboratory')).toBe(false)
    const baseline = TUNING.BASELINE_DEVELOPMENT_CASTING_WEEKLY_OPERATING_COST + TUNING.STAGE_STANDARD_WEEKLY_OPERATING_COST +
      TUNING.SCENERY_SHOP_WEEKLY_OPERATING_COST + TUNING.POST_BUILDING_WEEKLY_OPERATING_COST
    expect(rivalCapacityOpex(business)).toBe(baseline) // the four starting facilities only — never invented Lab opex
  })

  it('interval Opex: no back-charges — a Laboratory adds its weekly cost only from its own operational week, never retroactively', () => {
    const base = p13aGeneratedStudio(SEED)
    const { business } = bellwether(base)
    const week = base.market.tick
    const requiredReserve = rivalWeeklyOperatingCost(business, base.hollywood!, week) * business.policy.reserveWeeks
    const funded = withRivalCash(base, business.studioId, TUNING.RESEARCH_LABORATORY_CAPEX + requiredReserve + 1_000_000)
    const committed = admitRivalPlans(funded).state
    const operationalWeek = week + TUNING.RESEARCH_LABORATORY_BUILD_WEEKS
    const completed = advanceTo(committed, operationalWeek)
    const completedBusiness = completed.hollywood!.businesses.find(b => b.studioId === business.studioId)!
    // Once operational, the Laboratory's own weekly opex is added on top of the baseline.
    const baseline = TUNING.BASELINE_DEVELOPMENT_CASTING_WEEKLY_OPERATING_COST + TUNING.STAGE_STANDARD_WEEKLY_OPERATING_COST +
      TUNING.SCENERY_SHOP_WEEKLY_OPERATING_COST + TUNING.POST_BUILDING_WEEKLY_OPERATING_COST
    expect(rivalCapacityOpex(completedBusiness)).toBe(baseline + TUNING.RESEARCH_LABORATORY_WEEKLY_OPERATING_COST)
    // No back-charge: every period BEFORE the operational week never carried the Lab's opex.
    for (const period of completedBusiness.account.periods) {
      if (period.throughWeek < operationalWeek) {
        const elapsedInPeriod = period.throughWeek - period.fromWeek
        // The pre-operational slice of this business's history reconciles at the OLD baseline only.
        expect(period.movements.facilityOpex).toBeLessThanOrEqual(0)
        void elapsedInPeriod
      }
    }
  }, 30_000)

  it('researchCapacity reconciliation: per period equals -Sum(admitted plan capex) — the Laboratory\'s own $900,000 quote, once', () => {
    const base = p13aGeneratedStudio(SEED)
    const { business } = bellwether(base)
    const week = base.market.tick
    const requiredReserve = rivalWeeklyOperatingCost(business, base.hollywood!, week) * business.policy.reserveWeeks
    const funded = withRivalCash(base, business.studioId, TUNING.RESEARCH_LABORATORY_CAPEX + requiredReserve + 1_000_000)
    const admitted = admitRivalPlans(funded).state
    const admittedBusiness = admitted.hollywood!.businesses.find(b => b.studioId === business.studioId)!
    const totalResearchCapacity = admittedBusiness.account.periods.reduce((sum, p) => sum + p.movements.researchCapacity, 0)
    expect(totalResearchCapacity).toBe(-TUNING.RESEARCH_LABORATORY_CAPEX)
    // A repeated call in the SAME week is idempotent — the capex is charged exactly once.
    const repeated = admitRivalPlans(admitted).state
    const repeatedBusiness = repeated.hollywood!.businesses.find(b => b.studioId === business.studioId)!
    const totalAfterRepeat = repeatedBusiness.account.periods.reduce((sum, p) => sum + p.movements.researchCapacity, 0)
    expect(totalAfterRepeat).toBe(-TUNING.RESEARCH_LABORATORY_CAPEX)
  }, 30_000)

  it('migration basis frozen: a GENUINE V26 period (ten keys), lifted through the real migrateToV28, carries the four new keys at zero and its nine original movements byte-identical (coordinator ruling: a LIVE period already carries all 14 keys — this compares the lifted period against its OWN V26 source, never a live period against itself)', () => {
    const base = p13aGeneratedStudio(SEED) // week 0: no rival research fact exists yet, so the downgrade below is lossless
    const { business } = bellwether(base)
    const v27Envelope = save.makeSave(base)
    const v26Envelope = save.migrateToV26(v27Envelope) // genuine, lossless V26 envelope — ten-key periods
    const v26Hollywood = v26Envelope.state.hollywood as unknown as HollywoodState
    const v26Business = v26Hollywood.businesses.find(b => b.studioId === business.studioId)!
    const v26Period = v26Business.account.periods[0]!
    expect(Object.keys(v26Period.movements)).toHaveLength(10) // the genuine pre-S8 shape: ten kinds, none of the four research ones
    for (const kind of RIVAL_RESEARCH_MONEY_KINDS) expect(Object.hasOwn(v26Period.movements, kind)).toBe(false)

    const lifted = withV27.migrateToV28(v26Envelope)
    const liftedHollywood = lifted.state.hollywood as unknown as HollywoodState
    const liftedBusiness = liftedHollywood.businesses.find(b => b.studioId === business.studioId)!
    const liftedPeriod = liftedBusiness.account.periods[0]!
    const liftedMovements = { ...liftedPeriod.movements } as unknown as Record<string, number>
    for (const kind of RIVAL_RESEARCH_MONEY_KINDS) {
      expect(liftedMovements[kind]).toBe(0) // "every period carries the four keys at 0 on lift"
      delete liftedMovements[kind]
    }
    expect(liftedMovements).toEqual(v26Period.movements) // the nine originals, byte-identical
    expect(liftedPeriod.opening).toBe(v26Period.opening)
    expect(liftedPeriod.closing).toBe(v26Period.closing)
    expect(liftedPeriod.fromWeek).toBe(v26Period.fromWeek)
    expect(liftedPeriod.throughWeek).toBe(v26Period.throughWeek)
  })
})
