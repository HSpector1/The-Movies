import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { commitPlacement, installationQuoteFingerprint, queryFacilityInstallation } from '../src/core/placement.js'
import { planQuoteSnapshot, validatePhysicalPlans } from '../src/core/physicalPlans.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aLaboratorySlice } from '../src/harness/p13a/fixtures.js'
import { nextLaboratoryOrigin } from '../src/harness/p13b/fixtures.js'
import { s3ForgeAndReimport } from '../src/harness/p13b/s3-fixtures.js'

// P13B-S3 plan tests 3 and 4 (task expansion, 2026-09-16). Requirement-derived
// from "S3 — Persistent physical plans, dependencies and admission" in
// docs/engineering/playability-launch-review/plans/P13B-HEADLESS-PLAN.md. Written
// against the contract as if `src/core/physicalPlans.ts` and `queuePhysicalPlan`
// already existed — RED by design (the first import fails: `physicalPlans.ts`
// does not exist). Generated worlds only, except the ONE named forged fact test
// 4's drift cases need (a stale `approvedQuote.fingerprint` — see the module
// header of `src/harness/p13b/s3-fixtures.ts` for why forging is the honest way
// to reach that state in a constant-tuning, deterministic engine).
//
// CONTRACT GAP (reported, not resolved here): "self/cyclic dependencies refused
// at queue time" — a genuine multi-node CYCLE appears structurally unreachable
// through `queuePhysicalPlan` alone: `dependsOn` is set once, at creation, and
// every edge it can name points at an ALREADY-EXISTING plan, so a fresh plan can
// only add edges INTO the existing DAG, never one an existing plan could complete
// a cycle back through (no action mutates an existing plan's `dependsOn`). Only a
// SELF edge (a plan naming its own about-to-be-minted id) is queue-time reachable
// at all, so that is the only case exercised below (3b); no assertion is made
// about a true 2+-node cycle at queue time.

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

/** Forge ONLY `approvedQuote.fingerprint` on the first physical plan, byte-round-tripped through the save JSON. */
function forgeFirstPlanFingerprint(state: GameState): GameState {
  return s3ForgeAndReimport(state, parsed => {
    const s = parsed.state as { physicalPlans: { plans: { studioId: string; approvedQuote: { fingerprint: string } }[] }; hollywood: { playerStudioId: string } | null }
    const plan = ownPlans(s)[0]!
    plan.approvedQuote.fingerprint = `${plan.approvedQuote.fingerprint}-forged-drift`
  })
}

const ACOUSTIC_COST = TUNING.ACOUSTIC_INSTRUMENTS_CAPEX
const ELECTRICAL_COST = TUNING.ELECTRICAL_CONTROL_INSTRUMENTS_CAPEX

/**
 * P13B-S8 sweep: the physical-plan root is shared by every studio (`PhysicalPlan
 * .studioId`), and a rival now admits its own Laboratory plans onto it. Every
 * positional read below means THE PLAYER's own plans, in its own order.
 */
function ownPlans<T extends { studioId: string }>(state: { physicalPlans: { plans: readonly T[] }; hollywood: { playerStudioId: string } | null }): readonly T[] {
  return state.physicalPlans.plans.filter(plan => plan.studioId === state.hollywood!.playerStudioId)
}

describe('P13B-S3 dependencies (test 3)', () => {
  it('an installation on a queued Laboratory body (target: {planId}) resolves the facility id at start and waits for the body to be operational', () => {
    const base = p13aLaboratorySlice()
    const origin = nextLaboratoryOrigin(base)
    let state = queuePlan(base, { kind: 'placement', blueprintId: 'research-laboratory', origin }, TUNING.RESEARCH_LABORATORY_CAPEX)
    const bodyPlanId = ownPlans(state)[0]!.id
    state = queuePlan(state, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { planId: bodyPlanId } }, ACOUSTIC_COST, { dependsOn: [bodyPlanId] })

    state = tick(state) // body plan starts
    const bodyPlan = ownPlans(state)[0]!
    expect(bodyPlan.status).toBe('started')
    expect(ownPlans(state)[1]!.status).not.toBe('started') // still waits — body not operational yet

    const bodyPlacement = state.placement.facilities.find(f => f.id === bodyPlan.startedPlacementId)!
    while (state.placement.facilities.find(f => f.id === bodyPlan.startedPlacementId)!.status !== 'operational') {
      state = tick(state)
      expect(ownPlans(state)[1]!.status).not.toBe('started') // never within the body's own completion week
    }
    state = tick(state) // the FOLLOWING boundary (test 5's w+1 law)
    const dependent = ownPlans(state)[1]!
    expect(dependent.status).toBe('started')
    const dependentPlacement = state.placement.facilities.find(f => f.id === dependent.startedPlacementId)!
    expect(dependentPlacement.installation).toEqual({ targetFacilityId: bodyPlacement.facilityId })
  })

  it('a plan cannot depend on itself — refused at queue time, using the predicted next plan id', () => {
    const base = p13aLaboratorySlice()
    const own = base.hollywood!.playerStudioId
    const selfId = `${own}:plan:${base.physicalPlans.nextPlanId}`
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    expect(() => queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST, { dependsOn: [selfId] }))
      .toThrow(/depends on itself|cycle/i)
  })

  it('an unknown dependency id is refused at queue time', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    expect(() => queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST, { dependsOn: ['bogus:plan:999'] }))
      .toThrow(/unknown/i)
  })

  it('a dependency on a cancelled plan is refused at queue time', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    let state = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST)
    const planId = ownPlans(state)[0]!.id
    state = applyActions(state, [{ kind: 'cancelPhysicalPlan', planId } as never])
    expect(ownPlans(state)[0]!.status).toBe('cancelled')
    expect(() => queuePlan(state, { kind: 'installation', blueprintId: 'electrical-control-instruments', target: { facilityId: laboratoryFacilityId } }, ELECTRICAL_COST, { dependsOn: [planId] }))
      .toThrow(/cancelled|blocked/i)
  })

  it('cancelling a predecessor immediately blocks its dependent, naming it, and the dependent never starts (never counts as completion)', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    let state = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST)
    const predecessorId = ownPlans(state)[0]!.id
    state = queuePlan(state, { kind: 'installation', blueprintId: 'electrical-control-instruments', target: { facilityId: laboratoryFacilityId } }, ELECTRICAL_COST, { dependsOn: [predecessorId] })
    state = applyActions(state, [{ kind: 'cancelPhysicalPlan', planId: predecessorId } as never])
    expect(ownPlans(state)[0]!.status).toBe('cancelled')
    const dependent = ownPlans(state)[1]!
    expect(dependent.status).toBe('blocked')
    expect(dependent.reason).toContain(predecessorId)

    let after = state
    for (let i = 0; i < 10; i++) after = tick(after)
    expect(ownPlans(after)[1]!.status).toBe('blocked') // never starts
  })

  it('reordering a dependent before its dependency is refused', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    let state = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST)
    const predecessorId = ownPlans(state)[0]!.id
    state = queuePlan(state, { kind: 'installation', blueprintId: 'electrical-control-instruments', target: { facilityId: laboratoryFacilityId } }, ELECTRICAL_COST, { dependsOn: [predecessorId] })
    const dependentId = ownPlans(state)[1]!.id
    expect(() => applyActions(state, [{ kind: 'reorderPhysicalPlans', planIds: [dependentId, predecessorId] } as never]))
      .toThrow(/before its dependency/i)
  })

  it('a lawful reorder persists the new ordinals and revalidates', () => {
    const base = p13aLaboratorySlice()
    const lab1 = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    let state = commitPlacement(base, { blueprintId: 'research-laboratory', origin: nextLaboratoryOrigin(base) })
    state = advanceTo(state, state.market.tick + TUNING.RESEARCH_LABORATORY_BUILD_WEEKS)
    const lab2 = state.operations.facilities.find(f => f.capability === 'laboratory' && f.id !== lab1)!.id
    state = queuePlan(state, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: lab1 } }, ACOUSTIC_COST)
    state = queuePlan(state, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: lab2 } }, ACOUSTIC_COST)
    const [planA, planB] = ownPlans(state)
    const reordered = applyActions(state, [{ kind: 'reorderPhysicalPlans', planIds: [planB!.id, planA!.id] } as never])
    expect(ownPlans(reordered).map(p => p.id)).toEqual([planB!.id, planA!.id])
    expect(ownPlans(reordered)[0]!.ordinal).toBeLessThan(ownPlans(reordered)[1]!.ordinal)
    expect(() => validatePhysicalPlans(reordered)).not.toThrow()
  })
})

describe('P13B-S3 changed quote (test 4)', () => {
  it('identical quotes give identical fingerprints across weeks — completion week (which moves every tick) is excluded from the digest', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const quoteNow = queryFacilityInstallation(base, { blueprintId: 'acoustic-instruments', targetFacilityId: laboratoryFacilityId })
    const later = advanceTo(base, base.market.tick + 10)
    const quoteLater = queryFacilityInstallation(later, { blueprintId: 'acoustic-instruments', targetFacilityId: laboratoryFacilityId })
    expect(quoteNow.completesOnWeek).not.toBe(quoteLater.completesOnWeek) // the clock genuinely moved
    expect(installationQuoteFingerprint(quoteNow)).toBe(installationQuoteFingerprint(quoteLater))
  })

  it('a forged approvedQuote.fingerprint holds under reviewChangedQuote (the default) at the next boundary, with pendingQuote set to the fresh quote and a reason matching /quote changed/', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const queued = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST)
    const forged = forgeFirstPlanFingerprint(queued)
    const heldState = tick(forged)
    const held = ownPlans(heldState)[0]!
    expect(held.status).toBe('held')
    expect(held.reason).toMatch(/quote changed/i)
    expect(held.pendingQuote).toEqual(planQuoteSnapshot(heldState, held.work))
  })

  it('automatic admission ignores a stale fingerprint and starts anyway, once blueprint/target/component labels are unchanged and cost is within the ceiling', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const queued = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST, { admission: 'automatic' })
    const forged = forgeFirstPlanFingerprint(queued)
    expect(ownPlans(tick(forged))[0]!.status).toBe('started')
  })

  it('reviewPhysicalPlan re-approves a held plan (pendingQuote promoted to approvedQuote), which starts at the FOLLOWING boundary', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const queued = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST)
    const forged = forgeFirstPlanFingerprint(queued)
    const held = tick(forged)
    const heldPlan = ownPlans(held)[0]!
    expect(heldPlan.status).toBe('held')
    const pendingBefore = heldPlan.pendingQuote!

    const reviewed = applyActions(held, [{ kind: 'reviewPhysicalPlan', planId: heldPlan.id, approvedMaximumDebit: ACOUSTIC_COST } as never])
    const reviewedPlan = ownPlans(reviewed)[0]!
    expect(reviewedPlan.status).toBe('queued')
    expect(reviewedPlan.approvedQuote).toEqual(pendingBefore)
    expect(reviewedPlan.pendingQuote).toBeNull()

    expect(ownPlans(tick(reviewed))[0]!.status).toBe('started')
  })
})
