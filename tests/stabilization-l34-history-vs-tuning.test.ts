// Owner ruling 11A (2026-10-23), on audit finding L-34 (FAC-08).
//
// Placement history was validated against LIVE tuning: the capex row against the blueprint's
// capex, the recorded span against its buildWeeks, the demolition refund against
// capex x FACILITY_DEMOLITION_REFUND_FRACTION. Retuning any CANDIDATE number would have refused
// every save that already held the old one. The ruling reconciles history against the committed
// rows instead: the capex row is the price, the placement's span is the build time, and every
// record that restates the price (cancellation receipt, demolition refund, cash) is checked
// against that row.
//
// Tuning has no injection seam: the catalog is a module constant. Its blueprint objects are not
// frozen, so W1 retunes one in place (restored in `finally`), the closest thing to a tuning
// edit a test can run. The refund fraction is an ES `export const`, which a test cannot
// reassign, so W2 and W3 re-stamp the committed rows in a copied state instead (cash adjusted
// with them), which is what a save written under older numbers looks like to the validator.
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { blueprintById, commitFacilityInstallation, commitPlacement, demolishFacility } from '../src/core/placement.js'
import { loadSave, makeSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { FACILITY_DEMOLITION_REFUND_FRACTION } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aLaboratorySlice } from '../src/harness/p13a/fixtures.js'
import { nextLaboratoryOrigin } from '../src/harness/p13b/fixtures.js'
import { s4BareOfficeStudio } from '../src/harness/p13b/s4-fixtures.js'

const admitted = (state: GameState): GameState => { expect(() => makeSave(state)).not.toThrow(); return state }

/** The same world with one project's capex row re-stamped to `amount`, cash moved with it. */
function restampCapex(state: GameState, projectId: string, amount: number): GameState {
  const row = state.ledger.find((entry) => entry.kind === 'constructionCapex' && entry.constructionProjectId === projectId)!
  return {
    ...state,
    studio: { ...state.studio, cash: state.studio.cash - row.amount + amount },
    ledger: state.ledger.map((entry) => (entry === row ? { ...entry, amount } : entry)),
  }
}

/** A cancelled Office II conversion that owed a restoration-office job (the R2 journey). */
function cancelledConversion(seed: string): GameState {
  const { state: bare, officeFacilityId } = s4BareOfficeStudio(seed)
  let state = commitFacilityInstallation(bare, { blueprintId: 'office-conversion-ii', targetFacilityId: officeFacilityId })
  state = advanceTo(state, state.market.tick + 1)
  const job = state.placement.facilities.find((f) => f.blueprintId === 'office-conversion-ii' && f.status === 'underConstruction')!
  state = applyActions(state, [{ kind: 'cancelInstallation', projectId: job.projectId }])
  expect(state.placement.facilities.some((f) => f.blueprintId === 'restoration-office' && f.status === 'underConstruction'),
    'premise: cancelling after site work began owes a restoration').toBe(true)
  return admitted(state)
}

/** A hand-built Research Laboratory beside the slice's own, still under construction. */
function secondLaboratory(): { state: GameState; projectId: string; placementId: number } {
  const base = p13aLaboratorySlice()
  const origin = nextLaboratoryOrigin(base)
  const state = commitPlacement(base, { blueprintId: 'research-laboratory', origin })
  const placed = state.placement.facilities.find((f) => f.origin.gx === origin.gx && f.origin.gy === origin.gy && f.installation === undefined)!
  return { state, projectId: placed.projectId, placementId: placed.id }
}

describe('placement history reconciles against the committed rows, not live tuning (11A)', () => {
  it('W1: retuning restoration-office (capex and weeks) still loads, saves and ticks a save that holds the old job', () => {
    const state = cancelledConversion('stabilization-l34-w1')
    const saved = makeSave(state)
    const retuned = blueprintById('restoration-office')! as unknown as {
      capex: number; buildWeeks: number; installationComponents: { cost: number; weeks: number }[]
    }
    const component = retuned.installationComponents[0]!
    const original = { capex: retuned.capex, buildWeeks: retuned.buildWeeks, cost: component.cost, weeks: component.weeks }
    try {
      retuned.capex = original.capex + 15_000
      component.cost = original.cost + 15_000
      retuned.buildWeeks = original.buildWeeks + 2
      component.weeks = original.weeks + 2
      // Before the fix: "completesWeek must equal placedWeek + 3" (then the capex law).
      expect(() => loadSave(saved)).not.toThrow()
      let next = admitted(state)
      for (let i = 0; i < 3; i++) next = admitted(tick(next))
      // The old job keeps its committed clock: it completed after its recorded week, not the retuned three.
      const job = next.placement.facilities.find((f) => f.blueprintId === 'restoration-office')!
      expect(job.completesWeek - job.placedWeek).toBe(original.buildWeeks)
      expect(job.status).toBe('operational')
    } finally {
      retuned.capex = original.capex
      component.cost = original.cost
      retuned.buildWeeks = original.buildWeeks
      component.weeks = original.weeks
    }
  }, 90_000)

  it('W2: a demolished body charged at an older price and refunded at an older fraction still validates', () => {
    const { state: built, projectId, placementId } = secondLaboratory()
    const razed = demolishFacility(built, { placementId })
    const refund = razed.ledger.find((row) => row.kind === 'facilityDemolitionRefund' && row.constructionProjectId === projectId)!
    const charged = -razed.ledger.find((row) => row.kind === 'constructionCapex' && row.constructionProjectId === projectId)!.amount
    const olderPrice = charged - 100_000
    const olderRefund = Math.round(olderPrice * 0.4)
    const restamped = restampCapex(razed, projectId, -olderPrice)
    const history: GameState = {
      ...restamped,
      studio: { ...restamped.studio, cash: restamped.studio.cash - refund.amount + olderRefund },
      ledger: restamped.ledger.map((row) => (row === refund ? { ...row, amount: olderRefund } : row)),
    }
    // Before the fix: "amount is not the depreciated fraction of its capital cost" (live capex x live fraction).
    admitted(history)
  }, 30_000)

  it('W3: a demolition refunds a fraction of the COMMITTED capex row, never of the catalog price', () => {
    const { state: built, projectId, placementId } = secondLaboratory()
    const charged = -built.ledger.find((row) => row.kind === 'constructionCapex' && row.constructionProjectId === projectId)!.amount
    const olderPrice = charged - 100_000
    const restamped = admitted(restampCapex(built, projectId, -olderPrice))
    const razed = admitted(demolishFacility(restamped, { placementId }))
    const refund = razed.ledger.find((row) => row.kind === 'facilityDemolitionRefund' && row.constructionProjectId === projectId)!
    expect(refund.amount).toBe(Math.round(olderPrice * FACILITY_DEMOLITION_REFUND_FRACTION))
    expect(razed.studio.cash).toBe(restamped.studio.cash + refund.amount)
  }, 30_000)

  it('F1: a capex row that disagrees with the cancellation receipt that priced it is still refused by name', () => {
    const state = cancelledConversion('stabilization-l34-f1')
    const cancelled = state.placement.facilities.find((f) => f.blueprintId === 'office-conversion-ii' && f.status === 'cancelled')!
    const charged = state.ledger.find((row) => row.kind === 'constructionCapex' && row.constructionProjectId === cancelled.projectId)!.amount
    const forged = restampCapex(state, cancelled.projectId, charged - 1_000)
    expect(() => makeSave(forged)).toThrow(`placed facility ${String(cancelled.id)} receipt prices work this project was never charged for`)
  }, 60_000)

  it('F2: a capex row restated below the refund it paid is still refused by name', () => {
    const { state: built, projectId, placementId } = secondLaboratory()
    const razed = demolishFacility(built, { placementId })
    const refund = razed.ledger.find((row) => row.kind === 'facilityDemolitionRefund' && row.constructionProjectId === projectId)!
    const forged = restampCapex(razed, projectId, -refund.amount)
    expect(() => makeSave(forged)).toThrow(`demolition refund "${projectId}" amount is not the depreciated fraction of its capital cost`)
  }, 30_000)
})
