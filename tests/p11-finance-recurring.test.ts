import { describe, expect, it } from 'vitest'
import {
  applyActions, beginFounding, commitPlacement, demolishFacility, expectedWeeklyOperatingCostAt,
  financeView, generateWorld, stableStringify, tick, TUNING, weeklyBurn, weeklyFacilityOperatingCost,
  FOUNDING_MINIMUMS, hiringMarketIds, contractOffer, postSigningRunway, runway, commitmentPreview, prospectiveCycleFixedCost,
  type GameState,
} from '../src/core/index.js'

function managed(seed: string): GameState {
  return applyActions({ ...generateWorld(seed), economyEngagedEver: true }, [{ kind: 'activateStudioOperations' }])
}
function advance(state: GameState, weeks: number): GameState {
  for (let n = 0; n < weeks; n++) state = tick(state)
  return state
}
function proveNextCharge(state: GameState): GameState {
  const before = stableStringify(state)
  const finance = financeView(state)
  const next = tick(state)
  const rows = next.ledger.slice(state.ledger.length)
  const recurring = rows.filter(r => ['payroll', 'overhead', 'facilityOpex'].includes(r.kind))
  expect(weeklyBurn(state)).toBe(recurring.reduce((sum, r) => sum - r.amount, 0))
  expect(finance.weeklyFacilityOperatingCost).toBe(rows.filter(r => r.kind === 'facilityOpex').reduce((sum, r) => sum - r.amount, 0))
  expect(finance.netWeeklyCash).toBe(finance.expectedWeeklyRunRevenue - finance.weeklyBurn)
  expect(stableStringify(state)).toBe(before)
  return next
}

describe('P11 W0 complete recurring reporting reconciles with actual advances', () => {
  it('preserves the real bare-lot office capital, completion and first $5,500 charge', () => {
    let state = beginFounding(generateWorld('p11-bare-office', { regime: 'bare-lot' }))
    const applicants = state.founding!.applicantIds.map(id => state.talent.find(t => t.id === id)!)
    for (const role of ['actor', 'director', 'writer', 'craft'] as const)
      for (const person of applicants.filter(t => t.role === role).slice(0, FOUNDING_MINIMUMS[role]))
        state = applyActions(state, [{kind:'signContract',talentId:person.id,termWeeks:104}])
    state = applyActions(state, [{kind:'foundStudio'},{kind:'activateStudioOperations'}])
    const cashBefore = state.studio.cash
    state = commitPlacement(state, {blueprintId:'development-casting-office',origin:{gx:12,gy:14}})
    expect(cashBefore - state.studio.cash).toBe(1_500_000)
    expect(state.placement.facilities[0]!.completesWeek).toBe(14)
    state = advance(state, 13)
    expect(weeklyFacilityOperatingCost(state)).toBe(0)
    state = proveNextCharge(state)
    expect(state.market.tick).toBe(14)
    expect(weeklyFacilityOperatingCost(state)).toBe(5_500)
    const next = proveNextCharge(state)
    expect(next.ledger.slice(state.ledger.length).find(r => r.kind === 'facilityOpex')).toMatchObject({week:14,amount:-5_500})
  })
  it('includes effect-only property in real hiring and commitment preview consumers', () => {
    let state = commitPlacement(managed('p11-effect-property'), {blueprintId:'development-office-2',origin:{gx:0,gy:9}})
    expect(state.placement.facilities).toHaveLength(1)
    state = advance(state, state.placement.facilities[0]!.completesWeek)
    expect(weeklyFacilityOperatingCost(state)).toBe(2_500)
    proveNextCharge(state)
    const talentId = hiringMarketIds(state)[0]!
    const offer = contractOffer(state, talentId, 104)
    const preview = postSigningRunway(state, offer)
    const signed = applyActions(state, [{kind:'signContract',talentId,termWeeks:104}])
    expect(signed.contracts).toHaveLength(1)
    expect(preview.cashAfter).toBe(signed.studio.cash)
    expect(preview.burnAfter).toBe(weeklyBurn(signed))
    expect(preview.after).toEqual(runway(signed))
    proveNextCharge(signed)
    expect(commitmentPreview(signed, 250_000).postWeeklyBurn).toBe(weeklyBurn(signed))
    expect(prospectiveCycleFixedCost(signed).weeklyBurn).toBe(weeklyBurn(signed))
  })
  it('includes operational Opex only after completion and excludes capital paid now', () => {
    const base = managed('p11-rising')
    let state = commitPlacement(base, { blueprintId: 'development-casting-annex', origin: { gx: 7, gy: 15 } })
    expect(state.ledger.at(-1)?.kind).toBe('constructionCapex')
    expect(weeklyBurn(state)).toBe(weeklyBurn(base))
    const completion = state.placement.facilities[0]!.completesWeek
    state = advance(state, completion - 1)
    expect(weeklyFacilityOperatingCost(state)).toBe(0)
    state = proveNextCharge(state)
    expect(state.placement.facilities[0]!.status).toBe('operational')
    expect(weeklyFacilityOperatingCost(state)).toBe(TUNING.PLACEMENT_ANNEX_WEEKLY_OPERATING_COST)
    const rising = commitPlacement(state, { blueprintId: 'development-casting-annex', origin: { gx: 0, gy: 9 } })
    expect(rising.placement.facilities).toHaveLength(2)
    expect(weeklyFacilityOperatingCost(rising)).toBe(TUNING.PLACEMENT_ANNEX_WEEKLY_OPERATING_COST)
    proveNextCharge(rising)
  })
  it('retains overhead without employees and stops current Opex on demolition without erasing history', () => {
    let state = commitPlacement(managed('p11-demolition'), { blueprintId: 'development-casting-annex', origin: { gx: 0, gy: 9 } })
    state = advance(state, state.placement.facilities[0]!.completesWeek + 2)
    const priorWeek = state.market.tick - 1
    expect(state.contracts).toHaveLength(0)
    proveNextCharge(state)
    state = demolishFacility(state, { placementId: state.placement.facilities[0]!.id })
    expect(state.placement.facilities).toHaveLength(0)
    expect(weeklyFacilityOperatingCost(state)).toBe(0)
    expect(expectedWeeklyOperatingCostAt(state.placement, state.ledger, priorWeek)).toBe(TUNING.PLACEMENT_ANNEX_WEEKLY_OPERATING_COST)
    expect(expectedWeeklyOperatingCostAt(state.placement, state.ledger, state.market.tick)).toBe(0)
    proveNextCharge(state)
  })
  it('keeps a founding draft charge-free and pays the final contract week before expiry', () => {
    let draft = beginFounding(generateWorld('p11-contract-boundary'))
    draft = applyActions(draft, [{ kind: 'signContract', talentId: draft.founding!.applicantIds[0]!, termWeeks: 52 }])
    expect(draft.contracts.length).toBeGreaterThan(0)
    expect(financeView(draft).weeklyPayroll).toBeGreaterThan(0)
    expect(weeklyBurn(draft)).toBe(0)
    proveNextCharge(draft)
    const state: GameState = { ...draft, founding: null, economyEngagedEver: true,
      market: { ...draft.market, tick: draft.contracts[0]!.endWeekExclusive - 1 } }
    const next = proveNextCharge(state)
    expect(financeView(state).weeklyPayroll).toBeGreaterThan(0)
    expect(financeView(next).weeklyPayroll).toBe(0)
    proveNextCharge(next)
  })
})
