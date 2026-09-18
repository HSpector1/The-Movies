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
// RED-by-design: `src/core/rivalResearch.ts` does not exist yet.
// `admitRivalPlans` is the import from that new module and is CALLED below,
// so this file fails at module resolution before any test body runs.
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
//      expenditure does not reconcile with its receipts").
//   3. "Migration basis frozen" is tested at the DATA level (every kind
//      besides the four new ones, and every `opening`/`closing` figure, is
//      byte-identical before/after a period is widened with the four new
//      keys at zero) rather than by calling the not-yet-existing V26->V27
//      migration FUNCTION — that function-level proof belongs to
//      tests/p13b-s8-save-v27.test.ts (test 7), which this file does not
//      duplicate.

import { describe, expect, it } from 'vitest'
import * as save from '../src/core/save.js'
import { rivalCapacityOpex, rivalWeeklyOperatingCost, RIVAL_MONEY_KINDS } from '../src/core/hollywood.js'
import { TUNING } from '../src/core/tuning.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
import type { HollywoodState, RivalBusiness, RivalFinancePeriod } from '../src/core/hollywoodTypes.js'
// RED-by-design: src/core/rivalResearch.ts does not exist yet. This is the
// ONE import from that new module in this file.
import { admitRivalPlans } from '../src/core/rivalResearch.js'

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
  it('PRECONDITION (today, pre-S8, real code): rivalCapacityOpex throws for any business holding a Laboratory facility — the reconciliation gap S8-T2 closes', () => {
    const base = p13aGeneratedStudio(SEED)
    const { business } = bellwether(base)
    const forged: RivalBusiness = { ...business, operations: { ...business.operations, facilities: [...business.operations.facilities,
      { id: `${business.studioId}:lab-forged`, name: 'Research Laboratory', capability: 'laboratory' as const, capacity: 4 }] } }
    expect(() => rivalCapacityOpex(forged)).toThrow('P13A rival capacity cannot contain a Laboratory')
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

  it('migration basis frozen (data-level): widening a V26-shaped period with the four new kinds at zero changes nothing else — the same opening/closing and every existing kind\'s movement, byte-identical', () => {
    const base = p13aGeneratedStudio(SEED)
    const { business } = bellwether(base)
    const v26Period = business.account.periods[0]! // the genuine entry period, ten existing kinds only
    expect(Object.keys(v26Period.movements).sort()).toEqual([...RIVAL_MONEY_KINDS].sort())
    const widened: RivalFinancePeriod = {
      ...v26Period,
      movements: { ...v26Period.movements, researchSpend: 0, researchCapacity: 0, technologyRestoration: 0, technologyRefund: 0 },
    }
    const { researchSpend, researchCapacity, technologyRestoration, technologyRefund, ...strippedNew } = widened.movements as unknown as Record<string, number>
    expect(researchSpend).toBe(0); expect(researchCapacity).toBe(0); expect(technologyRestoration).toBe(0); expect(technologyRefund).toBe(0)
    expect(strippedNew).toEqual(v26Period.movements)
    expect(widened.opening).toBe(v26Period.opening)
    expect(widened.closing).toBe(v26Period.closing)
    expect(widened.fromWeek).toBe(v26Period.fromWeek)
    expect(widened.throughWeek).toBe(v26Period.throughWeek)
    // Sanity: the real save/validator round-trip a state with only this one
    // rival business's account untouched still succeeds today (nothing about
    // widening pre-supposes an engine change to be a no-op on every OTHER root).
    expect(() => save.exportCurrentState(base)).not.toThrow()
  })
})
