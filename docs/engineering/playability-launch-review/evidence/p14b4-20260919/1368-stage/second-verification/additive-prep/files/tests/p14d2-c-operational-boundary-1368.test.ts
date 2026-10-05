// Separately named genuine26→46 paid construction route. No synthetic body, cash or history.
import { expect, it } from 'vitest'
import { genuineRenewal196 } from './helpers/1368-renewal-fixture.js'
import { admitRivalPlans, rivalFacilityDisposalEligibility, disposeRivalFacility } from '../src/core/rivalResearch.js'
import { blueprintById, facilityDemolitionRefund } from '../src/core/placement.js'
import { tick } from '../src/core/tick.js'
import { makeSave, validateSaveV46, stableStringify } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
const bytes = stableStringify
function admitted(s: GameState) {
  const before = bytes(s), value = makeSave(s)
  expect(validateSaveV46(value)).toBe(value); expect(bytes(s)).toBe(before)
}
it('C5 genuine26 idle input, actual paid first labs and12 ordinary ticks reach zero lab-opex operational boundary', () => {
  const original = genuineRenewal196(); admitted(original)
  expect(original.market.tick).toBe(196)
  const prior = bytes(original), result = admitRivalPlans(original)
  expect(result.history).toEqual([]); expect(bytes(original)).toBe(prior)
  let state = result.state; admitted(state)
  const firstLabs = state.physicalPlans.plans.filter(plan => plan.commitReceipt?.week === 196
    && plan.work.kind === 'placement' && plan.work.blueprintId === 'research-laboratory'
    && !original.physicalPlans.plans.some(old => old.id === plan.id))
  expect(firstLabs.length, 'UNMET GENUINE196 PREMISE: real quote/reserve must admit paid first laboratory').toBeGreaterThan(0)
  const blueprint = blueprintById('research-laboratory')!
  expect(blueprint.buildWeeks).toBe(12)
  for (const plan of firstLabs) {
    expect(plan.status).toBe('started')
    expect(plan.commitReceipt!.cost).toBe(blueprint.capex)
    expect(plan.approvedQuote.cost).toBe(blueprint.capex)
    const oldOwner = original.hollywood!.businesses.find(row => row.studioId === plan.studioId)!
    const paidOwner = state.hollywood!.businesses.find(row => row.studioId === plan.studioId)!
    expect(paidOwner.account.cash).toBe(oldOwner.account.cash - blueprint.capex)
    expect(oldOwner.operations.facilities.filter(f => f.capability === 'laboratory')).toHaveLength(0)
    expect(state.hollywood!.receipts.filter(r => r.kind === 'laboratoryCommitted' && r.planId === plan.id)).toHaveLength(1)
  }
  for (let count = 0; count < 12; count++) {
    const before = bytes(state), next = tick(state)
    expect(bytes(state)).toBe(before); admitted(next); state = next
  }
  expect(state.market.tick).toBe(208)
  const beforeSelection = bytes(state)
  let witness: { state: GameState; id: string; facilityId: string; naturalSince: number | null } | undefined
  for (const plan of firstLabs) {
    const b = state.hollywood!.businesses.find(row => row.studioId === plan.studioId)!
    const initialOwner = original.hollywood!.businesses.find(row => row.studioId === plan.studioId)!
    if (initialOwner.productions.length || initialOwner.runs.length || original.talentMarket.proposals.some(p => p.issuerStudioId === b.studioId)) continue
    const receipt = state.hollywood!.receipts.find(r => r.kind === 'laboratoryCommitted' && r.planId === plan.id)
    if (receipt?.kind !== 'laboratoryCommitted' || b.operations.facilities.length !== 5) continue
    const candidate = structuredClone(state), selected = candidate.hollywood!.businesses.find(row => row.studioId === b.studioId)!
    const naturalSince = selected.costCutting.since
    if (naturalSince === null) {
      if (selected.productions.length || selected.runs.length || candidate.talentMarket.proposals.some(p => p.issuerStudioId === b.studioId)) continue
      selected.costCutting.since = 208 // explicit synthetic policy control only when actual null/idle premise holds
    }
    admitted(candidate)
    if (rivalFacilityDisposalEligibility(candidate, b.studioId, receipt.facilityId).eligible) {
      witness = { state: candidate, id: b.studioId, facilityId: receipt.facilityId, naturalSince }; break
    }
  }
  expect(bytes(state)).toBe(beforeSelection)
  expect(witness, 'UNMET OPERATIONAL208 PREMISE: actual completed first body, five facilities and eligible natural/synthetic cutting owner').toBeDefined()
  const { state: input, id, facilityId, naturalSince } = witness!
  const b = input.hollywood!.businesses.find(row => row.studioId === id)!
  const operation = input.hollywood!.receipts.find(r => r.kind === 'laboratoryOperational' && r.studioId === id && r.facilityId === facilityId)!
  expect(operation.week).toBe(208)
  const entered = input.hollywood!.identities.find(row => row.studioId === id)!.enteredWeek!
  const core = ['development-casting-office', 'stage-standard', 'scenery-shop', 'post-building']
    .reduce((n, id) => n + blueprintById(id)!.weeklyOperatingCost, 0)
  const opex = b.account.periods.reduce((n, period) => n + period.movements.facilityOpex, 0)
  expect(opex).toBe(-(208 - entered) * core) // exact original C5 cumulative assertion
  const before = bytes(input), after = disposeRivalFacility(input, id, facilityId); admitted(after)
  expect(bytes(input)).toBe(before)
  const afterOwner = after.hollywood!.businesses.find(row => row.studioId === id)!
  expect(afterOwner.account.periods.reduce((n, period) => n + period.movements.facilityOpex, 0)).toBe(opex)
  expect(afterOwner.account.cash - b.account.cash).toBe(facilityDemolitionRefund(blueprint))
  console.log('1368_C_OPERATIONAL_WITNESS', JSON.stringify({ week: 208, studioId: id, facilityId,
    entryKind: naturalSince === null ? 'explicit-synthetic-since208' : 'actual-natural-cutting-retained', naturalSince }))
  expect(bytes(original)).toBe(prior)
}, 120_000)
