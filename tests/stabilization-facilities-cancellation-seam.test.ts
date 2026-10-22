// Stabilization 2026-10-22, audit findings L-06 (FAC-01), L-07 (FAC-02), L-08 (FAC-03), FAC-04 and FAC-05.
//
// The cancellation seam between placement, office conversion, technology and physical plans
// kept four private copies of "which installation records are live". Each copy answered a
// cancel-and-restart journey differently from the invariants, and the campaign could then
// neither tick nor save:
//   R1 cancelling an Office III conversion on a body already at II charged the operational II
//      increment twice in the historical reconstruction (status-blind `onBody`);
//   R2 a second cancellation on one body minted a second restoration and tripped the one-record
//      duplicate rule (a restoration is the cost of EACH cancellation);
//   R4 a body whose only installation record was cancelled could be moved (the record's address
//      then disagreed with its body) or demolished (the record dangled);
//   R5 a plan-built body that was moved failed its plan's coordinate check at every save.
// R3 (re-adopting sound on a Post whose earlier fit-out was cancelled) is in the second describe.
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { facilityDemolitionRefusal, facilityMoveRefusal, commitFacilityInstallation, commitPlacement, moveFacility } from '../src/core/placement.js'
import { makeSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aLaboratorySlice } from '../src/harness/p13a/fixtures.js'
import { nextLaboratoryOrigin } from '../src/harness/p13b/fixtures.js'
import { s4BareOfficeStudio, s4NextOrigin } from '../src/harness/p13b/s4-fixtures.js'

const admitted = (state: GameState): GameState => { expect(() => makeSave(state)).not.toThrow(); return state }
const conversion = (state: GameState, blueprintId: string, targetFacilityId: string) =>
  state.placement.facilities.find((f) => f.blueprintId === blueprintId && f.installation?.targetFacilityId === targetFacilityId && f.status !== 'cancelled')!
const cancel = (state: GameState, projectId: string): GameState => applyActions(state, [{ kind: 'cancelInstallation', projectId }])
function ticksAdmitted(state: GameState, n: number): GameState {
  let next = state
  for (let i = 0; i < n; i++) next = admitted(tick(next))
  return next
}

describe('office conversion seam (R1, R2, R4)', () => {
  it('R1: cancelling III on a body at II keeps the historical opex reconstruction consistent with the live charge', () => {
    const { state: bare, officeFacilityId } = s4BareOfficeStudio('stabilization-fac-r1')
    let state = commitFacilityInstallation(bare, { blueprintId: 'office-conversion-ii', targetFacilityId: officeFacilityId })
    const second = conversion(state, 'office-conversion-ii', officeFacilityId)
    state = admitted(advanceTo(state, second.completesWeek + 4))
    expect(state.placement.facilities.find((f) => f.id === second.id)!.status).toBe('operational')
    state = commitFacilityInstallation(state, { blueprintId: 'office-conversion-iii', targetFacilityId: officeFacilityId })
    const third = conversion(state, 'office-conversion-iii', officeFacilityId)
    state = admitted(advanceTo(state, state.market.tick + 2))
    state = admitted(cancel(state, third.projectId))
    expect(state.placement.facilities.find((f) => f.id === third.id)!.status).toBe('cancelled')
    // Before the fix the first advance after the cancellation refused the world (operating-cost history).
    state = ticksAdmitted(state, 3)
    const restoration = state.placement.facilities.find((f) => f.blueprintId.startsWith('restoration-') && f.installation?.targetFacilityId === officeFacilityId)
    expect(restoration, 'premise: cancelling after site work began owes a restoration').toBeDefined()
    state = ticksAdmitted(state, Math.max(0, restoration!.completesWeek - state.market.tick) + 2)
    // Past the cancelled job's own committed completion week: from here the second half of the
    // law (a cancelled job never becomes a standing standard) is what the reconstruction reads.
    state = ticksAdmitted(state, Math.max(0, third.completesWeek - state.market.tick) + 2)
    expect(state.market.tick).toBeGreaterThan(third.completesWeek)
    admitted(state)
    // A forged file whose refund row no longer dates the stop is refused by name: the frozen eras
    // read that row (the receipt is stripped before they see the record); the live era reads the receipt.
    const forged: GameState = { ...state, ledger: state.ledger.map((row) =>
      row.kind === 'constructionRefund' && row.constructionProjectId === third.projectId
        ? { ...row, constructionProjectId: `${row.constructionProjectId}-forged` }
        : row) }
    expect(() => makeSave(forged)).toThrow(/has neither a cancellation receipt nor a constructionRefund row/)
  }, 90_000)

  it('R2: two cancel cycles on one body carry two restorations, one in flight at a time', () => {
    const { state: bare, officeFacilityId } = s4BareOfficeStudio('stabilization-fac-r2')
    let state = commitFacilityInstallation(bare, { blueprintId: 'office-conversion-ii', targetFacilityId: officeFacilityId })
    state = admitted(advanceTo(state, state.market.tick + 1))
    state = admitted(cancel(state, conversion(state, 'office-conversion-ii', officeFacilityId).projectId))
    const first = state.placement.facilities.find((f) => f.blueprintId === 'restoration-office' && f.installation?.targetFacilityId === officeFacilityId)
    expect(first, 'premise: the first cancellation owes a restoration').toBeDefined()
    state = admitted(advanceTo(state, first!.completesWeek))
    expect(state.placement.facilities.find((f) => f.id === first!.id)!.status).toBe('operational')
    state = admitted(commitFacilityInstallation(state, { blueprintId: 'office-conversion-ii', targetFacilityId: officeFacilityId }))
    state = admitted(advanceTo(state, state.market.tick + 1))
    // Before the fix this cancellation minted a second restoration-office record and the next tick threw.
    state = admitted(cancel(state, conversion(state, 'office-conversion-ii', officeFacilityId).projectId))
    const restorations = state.placement.facilities.filter((f) => f.blueprintId === 'restoration-office' && f.installation?.targetFacilityId === officeFacilityId)
    expect(restorations.map((f) => f.status)).toEqual(['operational', 'underConstruction'])
    state = ticksAdmitted(state, restorations[1]!.completesWeek - state.market.tick + 1)
    expect(state.placement.facilities.filter((f) => f.blueprintId === 'restoration-office').map((f) => f.status)).toEqual(['operational', 'operational'])
  }, 60_000)

  it('R4: a body whose only installation record is cancelled can be moved (the record follows) but not demolished (history is retained)', () => {
    const { state: bare, officeFacilityId } = s4BareOfficeStudio('stabilization-fac-r4')
    let state = commitFacilityInstallation(bare, { blueprintId: 'office-conversion-ii', targetFacilityId: officeFacilityId })
    state = admitted(cancel(state, conversion(state, 'office-conversion-ii', officeFacilityId).projectId))
    const body = state.placement.facilities.find((f) => f.facilityId === officeFacilityId && f.installation === undefined)!
    const cancelled = state.placement.facilities.find((f) => f.installation?.targetFacilityId === officeFacilityId)!
    expect(cancelled.status).toBe('cancelled')
    expect(state.placement.facilities.filter((f) => f.installation?.targetFacilityId === officeFacilityId)).toHaveLength(1)
    const origin = s4NextOrigin(state, 'development-casting-office')
    expect(facilityMoveRefusal(state, { placementId: body.id, origin })).toBeNull()
    const moved = moveFacility(state, { placementId: body.id, origin })
    expect(moved.placement.facilities.find((f) => f.id === body.id)!.origin).toEqual(origin)
    expect(moved.placement.facilities.find((f) => f.id === cancelled.id)!.origin).toEqual(origin)
    ticksAdmitted(admitted(moved), 2)
    const refusal = facilityDemolitionRefusal(state, { placementId: body.id })
    expect(refusal?.code).toBe('facilityEngaged')
    expect(refusal && 'holders' in refusal ? refusal.holders.map((h) => h.holderId) : []).toEqual([cancelled.projectId])
  }, 30_000)
})

describe('physical plans seam (R5)', () => {
  it('R5: a plan-built body keeps its plan\'s proof after a move; demolition is refused while the plan names it', () => {
    const base = p13aLaboratorySlice()
    const origin = nextLaboratoryOrigin(base)
    const queued = applyActions(base, [{ kind: 'queuePhysicalPlan', work: { kind: 'placement', blueprintId: 'research-laboratory', origin }, approvedMaximumDebit: 5_000_000 } as never])
    const started = admitted(tick(queued))
    const plan = started.physicalPlans.plans.find((p) => p.status === 'started' && p.startedPlacementId !== null)
    expect(plan, 'premise: the placement plan admitted at the boundary').toBeDefined()
    const placed = started.placement.facilities.find((f) => f.id === plan!.startedPlacementId)!
    expect(placed.origin).toEqual(origin)
    const destination = nextLaboratoryOrigin(started)
    expect(destination).not.toEqual(origin)
    expect(facilityMoveRefusal(started, { placementId: placed.id, origin: destination })).toBeNull()
    const moved = moveFacility(started, { placementId: placed.id, origin: destination })
    expect(moved.placement.facilities.find((f) => f.id === placed.id)!.origin).toEqual(destination)
    // Before the fix every save of the moved world failed: "plan … names a placement standing somewhere else".
    ticksAdmitted(admitted(moved), 2)
    const refusal = facilityDemolitionRefusal(moved, { placementId: placed.id })
    expect(refusal?.code).toBe('facilityEngaged')
    expect(refusal && 'holders' in refusal ? refusal.holders.map((h) => h.holderId) : []).toEqual([plan!.id])
  }, 30_000)
})

describe('an unrelated placement still demolishes', () => {
  it('a bare lab with no installation record and no plan demolishes as before', () => {
    const base = p13aLaboratorySlice()
    const origin = nextLaboratoryOrigin(base)
    const placedState = commitPlacement(base, { blueprintId: 'research-laboratory', origin })
    const placed = placedState.placement.facilities.find((f) => f.origin.gx === origin.gx && f.origin.gy === origin.gy)!
    expect(facilityDemolitionRefusal(placedState, { placementId: placed.id })).toBeNull()
  })
})

describe('technology adoption seam (R3)', () => {
  it('R3: re-adopting sound on another stage with the SAME Post after a cancelled fit-out saves and completes', async () => {
    const { s6SoundReady } = await import('../src/harness/p13b/s6-fixtures.js')
    const { state: committed, adoptionId, postFacilityId, stageFacilityId } = s6SoundReady()
    let state = admitted(advanceTo(committed, committed.market.tick + 3))
    state = admitted(applyActions(state, [{ kind: 'cancelAdoption', adoptionId }]))
    expect(state.placement.facilities.filter((f) => f.installation?.targetFacilityId === postFacilityId).map((f) => f.status)).toEqual(['cancelled'])
    const otherStage = state.operations.facilities.find((f) => f.capability === 'soundstage' && f.id !== stageFacilityId)
    expect(otherStage, 'premise: a second soundstage to re-adopt on').toBeDefined()
    state = applyActions(state, [{ kind: 'adoptSynchronizedSound', stageFacilityId: otherStage!.id, postFacilityId }])
    const readopted = state.technology.adoptions.find((a) => a.technologyId === 'synchronized-sound' && a.stageFacilityId === otherStage!.id)!
    expect(readopted).toBeDefined()
    const postJobs = state.placement.facilities.filter((f) => f.installation?.targetFacilityId === postFacilityId)
    expect(postJobs.map((f) => f.status)).toEqual(['cancelled', 'underConstruction'])
    // Before the fix the validator found the CANCELLED Post record first: "adoption lacks its compatible Post commitment".
    admitted(state)
    const completes = Math.max(...state.placement.facilities.filter((f) => readopted.physicalProjectIds.includes(f.projectId)).map((f) => f.completesWeek))
    state = ticksAdmitted(state, completes - state.market.tick + 1)
    expect(state.technology.adoptions.find((a) => a.id === readopted.id)!.operationalWeek).toBe(completes)
  }, 90_000)
})
