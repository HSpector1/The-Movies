// Owner ruling 14B (2026-10-23), on audit finding L-31 (FAC-05).
//
// Since the L-31 fix a body built by a physical plan could never be demolished: a started
// plan never leaves `started`, `cancelPhysicalPlan` refuses started plans, and the demolition
// refusal named the plan as an `installation` holder. Before that fix the demolition was
// admitted and every later save failed, because the plan validator demanded the placement.
// The ruling admits the demolition and lets the plan validator accept the demolished
// placement through its `facilityDemolitionRefund` row, the way operating-cost history
// already reconstructs a demolished facility from its capex and refund rows.
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { planAdmissionView } from '../src/core/physicalPlans.js'
import { blueprintById, facilityDemolitionRefund, facilityDemolitionRefusal } from '../src/core/placement.js'
import { makeSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { p13aLaboratorySlice } from '../src/harness/p13a/fixtures.js'
import { nextLaboratoryOrigin } from '../src/harness/p13b/fixtures.js'

const admitted = (state: GameState): GameState => { expect(() => makeSave(state)).not.toThrow(); return state }

describe('a plan-built body demolishes through its refund row (14B)', () => {
  it('the Lot verb is admitted, the plan stays started, saves and ticks stay lawful, and a dependent plan says why it can never start', () => {
    const base = p13aLaboratorySlice()
    const own = base.hollywood!.playerStudioId
    const bodyPlanId = `${own}:plan:${String(base.physicalPlans.nextPlanId)}`
    const queued = applyActions(base, [
      { kind: 'queuePhysicalPlan', work: { kind: 'placement', blueprintId: 'research-laboratory', origin: nextLaboratoryOrigin(base) }, approvedMaximumDebit: 5_000_000 } as never,
      // An installation on the planned body is a dependency on that body (the queue verb adds it).
      { kind: 'queuePhysicalPlan', work: { kind: 'installation', blueprintId: 'acoustic-instruments', target: { planId: bodyPlanId } }, approvedMaximumDebit: 5_000_000 } as never,
    ])
    const started = admitted(tick(queued))
    const plan = started.physicalPlans.plans.find((p) => p.id === bodyPlanId)!
    expect(plan.status, 'premise: the body plan was admitted at the boundary').toBe('started')
    const dependent = started.physicalPlans.plans.find((p) => p.dependsOn.includes(bodyPlanId))!
    expect(dependent.status, 'premise: the dependent installation waits for its body').toBe('queued')
    const placed = started.placement.facilities.find((f) => f.id === plan.startedPlacementId)!
    expect(placed.status).toBe('underConstruction')

    // The hold is lifted: no holder, so the Lot's demolish verb is enabled.
    expect(facilityDemolitionRefusal(started, { placementId: placed.id })).toBeNull()
    const demolished = admitted(applyActions(started, [{ kind: 'demolishFacility', demolition: { placementId: placed.id } }]))
    expect(demolished.placement.facilities.some((f) => f.id === placed.id)).toBe(false)
    const refunds = demolished.ledger.filter((row) => row.kind === 'facilityDemolitionRefund' && row.constructionProjectId === placed.projectId)
    expect(refunds).toHaveLength(1)
    expect(refunds[0]!.amount).toBe(facilityDemolitionRefund(blueprintById('research-laboratory')!))
    expect(demolished.studio.cash).toBe(started.studio.cash + refunds[0]!.amount)
    const after = demolished.physicalPlans.plans.find((p) => p.id === bodyPlanId)!
    expect(after.status).toBe('started')
    expect(after.startedPlacementId).toBe(placed.id)

    // A dependent can never start; the derived reason says so instead of "waiting".
    expect(planAdmissionView(demolished, dependent, demolished.market.tick + 1)).toMatchObject({
      outcome: 'wait', reason: `dependency ${bodyPlanId} built a placement that has since been demolished`,
    })

    // Before the ruling's validator change every save from here failed:
    // "plan … names placement N, which does not exist".
    let state = demolished
    for (let i = 0; i < 3; i++) state = admitted(tick(state))
    expect(state.physicalPlans.plans.find((p) => p.id === dependent.id)!.status).toBe('queued')

    // A forged file with the refund row removed is refused by the plan law, which runs before
    // the placement and cash laws in the save chain. Cash is left as written, so the missing
    // row is the only fact the plan validator can see.
    const forged: GameState = { ...demolished, ledger: demolished.ledger.filter((row) => row !== refunds[0]) }
    expect(() => makeSave(forged)).toThrow(
      `plan ${bodyPlanId} names placement ${String(placed.id)}, which does not exist and no demolition refund row proves it was demolished`)
  }, 120_000)
})
