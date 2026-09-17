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
import { hiringMarketIds } from '../src/core/employment.js'
import { commitFacilityInstallation } from '../src/core/placement.js'
// RED-by-design import: src/core/officeConversion.ts does not exist yet.
import { developmentStandard } from '../src/core/officeConversion.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aLaboratorySlice } from '../src/harness/p13a/fixtures.js'

/**
 * The first week (searched forward, never hardcoded -- deterministic per seed
 * but not worth pinning to one week number) `hiringMarketIds`' rotation offers
 * a writer to sign. `p13aLaboratorySlice()` starts with no contracted talent
 * at all, and signing during the founding draft is not available once the
 * studio is already operating, so this is the lawful route to one real,
 * contracted writer on that exact world.
 */
function firstWriterInHiringMarket(state: GameState): { state: GameState; writerId: string } {
  let current = state
  for (let i = 0; i < 80; i++) {
    const writer = hiringMarketIds(current).map(id => current.talent.find(t => t.id === id)).find(t => t?.role === 'writer')
    if (writer !== undefined) return { state: current, writerId: writer.id }
    current = tick(current)
  }
  throw new Error('p13b-s4 plans fixture: no writer entered the hiring market within 80 weeks')
}

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
    // FIXTURE PREMISE FIX (measured 2026-09-17, evidence PROBE B): the
    // ORIGINAL fixture here was `managedStudio(...)`, whose `state.hollywood`
    // root carries `playerStudioId: null` (it predates the Hollywood/P13
    // machinery and never calls `initializeHollywood`) -- `queuePhysicalPlan`'s
    // `ownStudio()` refuses "Found the studio before planning physical work."
    // before any S4 law runs, on EVERY plan queued from that base, regardless
    // of occupancy. `p13aLaboratorySlice()` (used by this file's other cases)
    // carries a real player studio id and is used here instead.
    //
    // A "two installations on one target" alternative (S3's own idiom for a
    // Laboratory module) was tried and does NOT reproduce here (measured
    // directly against the real engine, 2026-09-17): once the first
    // conversion commits, `facilityOffline` zeroes the office's registry
    // capacity, and the `installation` claim generator (`occupancy.ts`
    // `resourceClaims`) iterates `0..facility.capacity` for an
    // underConstruction installation -- zero capacity means zero claims, so a
    // SECOND conversion query on the SAME body sees no `targetEngaged` holder
    // from the first at all; both admitted in the same tick instead. A
    // SCREENPLAY's claim is keyed to its own recorded `project.reservation`,
    // taken BEFORE the office ever goes offline, so it is the occupant that
    // genuinely demonstrates `targetEngaged` for a conversion.
    // `p13aLaboratorySlice()` starts with no contracted writer, so one is
    // signed from the live hiring-market rotation.
    let state = applyActions(p13aLaboratorySlice(), [{ kind: 'activateScriptDevelopment' }])
    const officeFacilityId = state.operations.facilities.find(f => f.capability === 'development-casting')!.id
    const found = firstWriterInHiringMarket(state)
    state = applyActions(found.state, [{ kind: 'signContract', talentId: found.writerId, termWeeks: 104 }])
    state = applyActions(state, [{
      kind: 'commissionOriginalScreenplay',
      screenplay: {
        writerId: found.writerId,
        genre: 'drama',
        shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: {
          genre: 'drama',
          intendedSegments: ['adult'],
          ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
        },
      },
    } as never])
    const draftingProject = state.scriptDevelopment.projects.find(p => p.writerId === found.writerId)!
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

  it('queueing a conversion against a body already at its target standard is refused at QUEUE time (standardAlreadyMet is a permanent refusal, never merely held)', () => {
    let state = p13aLaboratorySlice()
    const officeFacilityId = state.operations.facilities.find(f => f.capability === 'development-casting')!.id
    state = commitFacilityInstallation(state, { blueprintId: 'office-conversion-iii', targetFacilityId: officeFacilityId })
    state = advanceTo(state, state.market.tick + 16)
    expect(developmentStandard(state, officeFacilityId)).toBe('III')

    expect(() =>
      queuePlan(state, { kind: 'installation', blueprintId: 'office-conversion-iii', target: { facilityId: officeFacilityId } }, 1_250_000),
    ).toThrow(/standardAlreadyMet/)
  })

  it('a chained I->II then II->III plan pair via dependsOn: the second starts the boundary after the first completes', () => {
    const base = p13aLaboratorySlice()
    const officeFacilityId = base.operations.facilities.find(f => f.capability === 'development-casting')!.id
    let state = queuePlan(base, { kind: 'installation', blueprintId: 'office-conversion-ii', target: { facilityId: officeFacilityId } }, 500_000)
    const planAId = state.physicalPlans.plans[0]!.id
    // ADJUDICATED 2026-09-17 (coordinator, in response to this file's original
    // "assumption" finding): `office-conversion-iii`'s quote is SOURCE-
    // DEPENDENT (cost/weeks vary with the target's standard at quote time) but
    // carries ONE CONSTANT component label regardless of source -- at the
    // moment this second plan is queued the body is still standard I, so
    // `planQuoteSnapshot` freezes the DIRECT I->III price/fingerprint
    // (1,250,000/16w), and the LIVE quote moves to the staged II->III price
    // (850,000/8w) once the dependency clears. `admission:'automatic'`
    // forgives exactly that (a moved fingerprint/cost with an unchanged
    // component label list) and is therefore the LAWFUL admission mode for a
    // chained pair queued ahead of time, within the approved ceiling. The
    // sibling test below proves the DEFAULT `reviewChangedQuote` admission
    // holds instead, exactly as designed, for a human to re-approve.
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

  it('the same chained pair under the DEFAULT reviewChangedQuote admission holds on the changed quote and starts once reviewPhysicalPlan re-approves at the live price', () => {
    const base = p13aLaboratorySlice()
    const officeFacilityId = base.operations.facilities.find(f => f.capability === 'development-casting')!.id
    let state = queuePlan(base, { kind: 'installation', blueprintId: 'office-conversion-ii', target: { facilityId: officeFacilityId } }, 500_000)
    const planAId = state.physicalPlans.plans[0]!.id
    // DEFAULT admission ('reviewChangedQuote', omitted below): the direct-
    // I->III price/fingerprint frozen at queue time (the body is still
    // standard I) legitimately drifts once plan A completes and the body
    // reads II -- this is the lawful counterpart to the 'automatic' case
    // above (adjudicated 2026-09-17): `reviewChangedQuote` is designed to
    // HOLD here for a human to re-approve, not to admit silently.
    state = queuePlan(
      state,
      { kind: 'installation', blueprintId: 'office-conversion-iii', target: { facilityId: officeFacilityId } },
      1_250_000,
      { dependsOn: [planAId] },
    )
    const w = state.market.tick

    state = tick(state) // w -> w+1: plan A admits
    for (let week = w + 1; week < w + 1 + 4; week++) state = tick(state) // office-conversion-ii: 4 build weeks
    expect(developmentStandard(state, officeFacilityId)).toBe('II')

    state = tick(state) // the boundary the dependency clears: plan B's live quote has moved
    const held = state.physicalPlans.plans[1]!
    expect(held.status).toBe('held')
    expect(held.reason).toMatch(/quote changed/)
    expect(held.pendingQuote).not.toBeNull()
    expect(held.pendingQuote!.cost).toBe(850_000) // the live, correctly source-dependent II->III price

    state = applyActions(state, [{ kind: 'reviewPhysicalPlan', planId: held.id, approvedMaximumDebit: 850_000 } as never])
    expect(state.physicalPlans.plans[1]!.status).toBe('queued')
    expect(state.physicalPlans.plans[1]!.approvedQuote.cost).toBe(850_000)

    state = tick(state) // the FOLLOWING boundary: the re-approved plan starts
    expect(state.physicalPlans.plans[1]!.status).toBe('started')
  })
})
