// ── P13B-S4 — Direct gap-aware Office conversion: P09/S3 INTEGRATION (test 4) ─
//
// Requirement-derived from "S4 — Direct gap-aware Office conversion (Ready row 4)
// — task expansion" in docs/engineering/playability-launch-review/plans/
// P13B-HEADLESS-PLAN.md, test 4's list ("the conversion is a normal placement
// record... S3 plans queue a conversion, hold it on targetEngaged while a slot
// is occupied, and admit it at the next boundary once free; chained I->II then
// II->III plans via dependsOn; occupancy/presence unchanged (no cells)"). Written
// against the contract as if `src/core/officeConversion.ts` and the two new
// `office-conversion-ii`/`office-conversion-iii` blueprints already existed --
// neither does, so this whole file is RED by design (the first import fails at
// module resolution). See `tests/p13b-s4-quotes.test.ts`'s header for the full
// statement of the recorded process rule this follows.
//
// Built on the SAME `queuePlan`/S3 patterns `tests/p13b-s3-admission.test.ts`
// and `tests/p13b-s3-dependencies.test.ts` already prove for the acoustic/
// electrical installation pair, applied here to the two new conversion
// blueprints. Generated worlds only; every dated fact used below comes from the
// live engine.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { commitFacilityInstallation } from '../src/core/placement.js'
// RED-by-design import: src/core/officeConversion.ts does not exist yet.
import { developmentStandard } from '../src/core/officeConversion.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aLaboratorySlice } from '../src/harness/p13a/fixtures.js'
import { contractedByRole, managedStudio } from './contracts/_contractFixtures.js'

/** Local action-literal type, independent of wherever `PhysicalPlan['work']` ends up living (same idiom `tests/p13b-s3-admission.test.ts` uses). */
type PlanWork =
  | { kind: 'placement'; blueprintId: string; origin: { gx: number; gy: number } }
  | { kind: 'installation'; blueprintId: string; target: { facilityId: string } | { planId: string } }

function queuePlan(
  state: GameState,
  work: PlanWork,
  approvedMaximumDebit: number,
  extra: { dependsOn?: string[]; earliestStartWeek?: number; admission?: 'reviewChangedQuote' | 'automatic' } = {},
): GameState {
  return applyActions(state, [{ kind: 'queuePhysicalPlan', work, approvedMaximumDebit, ...extra } as never])
}

describe('P13B-S4 P09/S3 integration (test 4)', () => {
  it('a conversion queued as an S3 plan admits at the next boundary through the same P09 commit as a hand commit at that week', () => {
    const base = p13aLaboratorySlice()
    const officeFacilityId = base.operations.facilities.find(f => f.capability === 'development-casting')!.id
    const queued = queuePlan(base, { kind: 'installation', blueprintId: 'office-conversion-ii', target: { facilityId: officeFacilityId } }, 500_000)
    expect(queued.physicalPlans.plans[0]!.status).toBe('queued')

    const started = tick(queued)
    const admittedPlan = started.physicalPlans.plans[0]!
    expect(admittedPlan.status).toBe('started')
    expect(admittedPlan.commitReceipt).not.toBeNull()
    expect(admittedPlan.startedPlacementId).not.toBeNull()

    // Hand commit at the SAME week the admission pass ran at, the same
    // "identical...except the plan/history facts" comparison
    // `tests/p13b-s3-admission.test.ts` uses.
    const handBase = advanceTo(base, base.market.tick + 1)
    const handCommitted = commitFacilityInstallation(handBase, { blueprintId: 'office-conversion-ii', targetFacilityId: officeFacilityId })
    const handPlacement = handCommitted.placement.facilities.find(f => f.installation?.targetFacilityId === officeFacilityId)!
    const admittedPlacement = started.placement.facilities.find(f => f.id === admittedPlan.startedPlacementId)!

    expect(admittedPlacement.blueprintId).toBe(handPlacement.blueprintId)
    expect(admittedPlacement.placedWeek).toBe(handPlacement.placedWeek)
    expect(admittedPlacement.completesWeek).toBe(handPlacement.completesWeek)
    expect(admittedPlacement.status).toBe(handPlacement.status)
    expect(admittedPlacement.installation).toEqual(handPlacement.installation)
    // Occupancy/presence unchanged: an installation claims no ground.
    expect(admittedPlacement.cells).toEqual([])
    expect(handPlacement.cells).toEqual([])

    const admittedCapex = started.ledger.find(e => e.kind === 'constructionCapex' && e.constructionProjectId === admittedPlacement.projectId)!
    const handCapex = handCommitted.ledger.find(e => e.kind === 'constructionCapex' && e.constructionProjectId === handPlacement.projectId)!
    expect(admittedCapex.amount).toBe(handCapex.amount)
    expect(admittedCapex.week).toBe(handCapex.week)
  })

  it('a plan queued while the office is occupied by a drafting screenplay holds on targetEngaged and admits the boundary the slot frees (C2a-M4 queue idiom, same ordering S3 test 2 proves for an installation holder)', () => {
    let state = managedStudio('p13b-s4-plans-engaged')
    const officeFacilityId = state.operations.facilities.find(f => f.capability === 'development-casting')!.id
    const writer = contractedByRole(state, 'writer')[0]!
    state = applyActions(state, [{
      kind: 'commissionOriginalScreenplay',
      screenplay: {
        writerId: writer.id,
        genre: 'drama',
        shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: {
          genre: 'drama',
          intendedSegments: ['adult'],
          ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
        },
      },
    } as never])
    const draftingProject = state.scriptDevelopment.projects.find(p => p.writerId === writer.id)!
    const dueWeek = draftingProject.dueWeek!
    expect(dueWeek).toBeGreaterThan(state.market.tick) // a real, not-yet-complete draft

    state = queuePlan(state, { kind: 'installation', blueprintId: 'office-conversion-ii', target: { facilityId: officeFacilityId } }, 500_000)
    expect(state.physicalPlans.plans[0]!.status).toBe('queued')

    // Script/casting completions (tick.ts step 0.5) run BEFORE queue admission
    // (step 1.05) within the SAME tick, so the plan is held through every
    // advance up to but not including the one that lands exactly on `dueWeek`
    // -- that final advance both completes the draft and admits the plan.
    while (state.market.tick < dueWeek - 1) {
      state = tick(state)
      expect(state.physicalPlans.plans[0]!.status).toBe('held')
      expect(state.physicalPlans.plans[0]!.reason).toMatch(/targetEngaged/)
    }
    state = tick(state)
    expect(state.market.tick).toBe(dueWeek)
    expect(state.physicalPlans.plans[0]!.status).toBe('started')
  })

  it('a chained I->II then II->III plan pair via dependsOn: the second starts the boundary after the first completes', () => {
    const base = p13aLaboratorySlice()
    const officeFacilityId = base.operations.facilities.find(f => f.capability === 'development-casting')!.id
    let state = queuePlan(base, { kind: 'installation', blueprintId: 'office-conversion-ii', target: { facilityId: officeFacilityId } }, 500_000)
    const planAId = state.physicalPlans.plans[0]!.id
    // ASSUMPTION (contract gap, reported): `office-conversion-iii`'s quote is
    // SOURCE-DEPENDENT (§ delegated decisions) -- at the moment this second
    // plan is queued the body is still standard I, so `planQuoteSnapshot`
    // freezes the DIRECT I->III price/fingerprint (1,250,000/16w), not the
    // staged II->III price (850,000/8w) this plan will actually be admitted
    // at once its dependency clears. `admission:'reviewChangedQuote'` (the
    // default) requires the fingerprint to be UNCHANGED at admission and
    // would therefore predictably `hold: 'quote changed since approval'`
    // rather than admit. `admission:'automatic'` is used here instead because
    // it forgives a moved fingerprint/cost and checks only the component
    // LABEL list (physicalPlans.ts `planAdmissionView`) -- which the S4
    // contract's own wording ("components list the conversion only") implies
    // is the SAME single label for both the direct and staged quote. If a
    // real implementation gives the two quotes DIFFERENT component labels,
    // this plan will legitimately land on `held: 'quote changed since
    // approval'` instead of `started` -- that failure is evidence of a real
    // chaining gap in the S4 contract (a price that depends on a predecessor
    // has nowhere to freeze correctly at queue time), not a broken test.
    state = queuePlan(
      state,
      { kind: 'installation', blueprintId: 'office-conversion-iii', target: { facilityId: officeFacilityId } },
      1_250_000,
      { dependsOn: [planAId], admission: 'automatic' },
    )
    const w = state.market.tick

    state = tick(state) // w -> w+1: plan A admits (nothing else is ahead of it)
    expect(state.physicalPlans.plans[0]!.status).toBe('started')
    expect(state.physicalPlans.plans[1]!.status).not.toBe('started')

    // office-conversion-ii builds for 4 weeks from w+1 (the week it was admitted).
    for (let week = w + 1; week < w + 1 + 4; week++) {
      state = tick(state)
      expect(state.physicalPlans.plans[1]!.status).not.toBe('started')
    }
    expect(developmentStandard(state, officeFacilityId)).toBe('II') // plan A's conversion is operational

    state = tick(state) // the FOLLOWING boundary: plan B now sees the met dependency
    expect(state.physicalPlans.plans[1]!.status).toBe('started')
  })
})
