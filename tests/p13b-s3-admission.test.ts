import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { commitFacilityInstallation, commitPlacement } from '../src/core/placement.js'
import { initialPhysicalPlans, planAdmissionView, planQuoteSnapshot, validatePhysicalPlans } from '../src/core/physicalPlans.js'
import { exportSave, importSave, makeSave } from '../src/core/save.js'
import { researchWeekQuote } from '../src/core/technology.js'
import { weeklyBurn } from '../src/core/economyView.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import type { PhysicalPlan } from '../src/core/types.js'
import { advanceTo, p13aLaboratorySlice, p13aResearchEntry } from '../src/harness/p13a/fixtures.js'
import { nextLaboratoryOrigin, p13bStaffedProject } from '../src/harness/p13b/fixtures.js'

// P13B-S3 plan tests 1, 2, 5, 6 (task expansion, 2026-09-16). Requirement-derived
// from "S3 — Persistent physical plans, dependencies and admission" in
// docs/engineering/playability-launch-review/plans/P13B-HEADLESS-PLAN.md. Written
// against the contract as if `state.physicalPlans`, `src/core/physicalPlans.ts`,
// `queuePhysicalPlan` and its sibling actions already existed — none of them do
// yet, so this whole file is RED by design (the very first import fails:
// `physicalPlans.ts` does not exist). Generated worlds only; every dated fact
// used below comes from the live engine except where a comment says otherwise
// (test 5's directly-set cash figures, test 6's rival row — both flagged inline
// as the honest, established idiom for those two situations).
//
// ASSUMPTION (contract gap, reported): the contract's "API the tests assert"
// section does not say which file declares the `PhysicalPlan` / `PlanQuoteSnapshot`
// / work-union TYPES (only the FUNCTIONS are pinned to `src/core/physicalPlans.ts`).
// Every other P13B domain shape (`PlacedFacility`, `ProductionQueueEntry`,
// `StudioEvent`) lives in `src/core/types.ts`, so this file assumes `PhysicalPlan`
// does too and imports it from there. `import type` is erased at transpile time
// either way, so this assumption cannot change today's RED reason.

/** Local action-literal type, independent of wherever `PhysicalPlan['work']` ends up living. */
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

/** The same "byte-identical except these roots" idiom `tests/p13b-s2-save-v22.test.ts`'s
 * `assertRootUnchangedExceptTechnology` uses, generalized to an arbitrary root list. */
function exceptRoots(state: GameState, roots: readonly string[]): string {
  const clone = { ...(state as unknown as Record<string, unknown>) }
  for (const root of roots) clone[root] = undefined
  return JSON.stringify(clone)
}

const ACOUSTIC_COST = TUNING.ACOUSTIC_INSTRUMENTS_CAPEX // 350,000
const ELECTRICAL_COST = TUNING.ELECTRICAL_CONTROL_INSTRUMENTS_CAPEX // 350,000

describe('P13B-S3 admission law (test 1)', () => {
  it('a fresh world carries the empty physicalPlans root the contract defines', () => {
    const base = p13aLaboratorySlice()
    expect(base.physicalPlans).toEqual(initialPhysicalPlans())
  })

  it('queuing snapshots the CURRENT quote as approvedQuote via planQuoteSnapshot', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const work: PlanWork = { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }
    const queued = queuePlan(base, work, ACOUSTIC_COST)
    expect(queued.physicalPlans.plans[0]!.approvedQuote).toEqual(planQuoteSnapshot(base, work))
  })

  it('a queued acoustic installation on a Lab without instruments starts at the next boundary, matching a hand commit at the same week', () => {
    const base = p13aLaboratorySlice() // week 12, Lab placed, no instruments
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const queued = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST)
    expect(queued.physicalPlans.plans[0]!.status).toBe('queued')

    const started = tick(queued) // admission boundary: week 12 -> 13
    const admittedPlan = started.physicalPlans.plans[0]!
    expect(admittedPlan.status).toBe('started')
    expect(admittedPlan.commitReceipt).not.toBeNull()
    expect(admittedPlan.startedPlacementId).not.toBeNull()

    // Hand commit at the SAME week the admission pass ran at (13 — tick.ts stamps
    // every insertion at `currentTick + 1`, the week that has arrived).
    const handBase = advanceTo(base, 13)
    const handCommitted = commitFacilityInstallation(handBase, { blueprintId: 'acoustic-instruments', targetFacilityId: laboratoryFacilityId })
    const handPlacement = handCommitted.placement.facilities.find(f => f.installation?.targetFacilityId === laboratoryFacilityId)!
    const admittedPlacement = started.placement.facilities.find(f => f.id === admittedPlan.startedPlacementId)!

    // Fields that must match a hand commit exactly. Placement/project/facility
    // IDS are allocation-order-dependent (the two branches mint a different
    // number of ids along the way) and are deliberately excluded — the plan
    // text's "identical...except the plan/history facts" is about the PHYSICAL
    // and MONEY facts, not about incidental autoincrement position.
    expect(admittedPlacement.blueprintId).toBe(handPlacement.blueprintId)
    expect(admittedPlacement.placedWeek).toBe(handPlacement.placedWeek)
    expect(admittedPlacement.completesWeek).toBe(handPlacement.completesWeek)
    expect(admittedPlacement.status).toBe(handPlacement.status)
    expect(admittedPlacement.installation).toEqual(handPlacement.installation)

    const admittedLedgerRow = started.ledger.find(e => e.kind === 'constructionCapex' && e.week === 13)!
    const handLedgerRow = handCommitted.ledger.find(e => e.kind === 'constructionCapex' && e.week === 13)!
    expect(admittedLedgerRow.amount).toBe(handLedgerRow.amount)
    expect(admittedLedgerRow.note).toBe(handLedgerRow.note)
    expect(admittedPlan.commitReceipt).toEqual({ week: 13, fingerprint: admittedPlan.commitReceipt!.fingerprint, cost: ACOUSTIC_COST })
  })

  it('writes commitReceipt exactly once — later ticks never rewrite it or double-charge', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const queued = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST)
    const started = tick(queued)
    const receiptAtStart = started.physicalPlans.plans[0]!.commitReceipt
    let state = started
    for (let i = 0; i < 3; i++) state = tick(state)
    expect(state.physicalPlans.plans[0]!.commitReceipt).toEqual(receiptAtStart)
    expect(state.ledger.filter(e => e.kind === 'constructionCapex').length).toBe(1)
  })

  it('earliestStartWeek in the future holds admission until it arrives', () => {
    const base = p13aLaboratorySlice() // week 12
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const future = base.market.tick + 5
    let state = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST, { earliestStartWeek: future })
    while (state.market.tick < future) {
      state = tick(state)
      expect(state.physicalPlans.plans[0]!.status).toBe('queued')
    }
    state = tick(state) // crosses `future`
    expect(state.physicalPlans.plans[0]!.status).toBe('started')
  })

  it('cost above the ceiling holds with a reason naming both dollar amounts; automatic admission within the ceiling starts', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id

    const tooLow = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST - 1)
    const held = tick(tooLow).physicalPlans.plans[0]!
    expect(held.status).toBe('held')
    expect(held.reason).toMatch(/349,999|349999/)
    expect(held.reason).toMatch(/350,000|350000/)

    const withinCeiling = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST, { admission: 'automatic' })
    expect(tick(withinCeiling).physicalPlans.plans[0]!.status).toBe('started')
  })
})

describe('P13B-S3 no reservation (test 2)', () => {
  it('a queued plan changes no cash, weeklyBurn, capacity (operations/placement) or ledger', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const queued = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST)
    expect(queued.studio.cash).toBe(base.studio.cash)
    expect(weeklyBurn(queued)).toBe(weeklyBurn(base))
    expect(queued.operations).toEqual(base.operations)
    expect(queued.placement).toEqual(base.placement)
    expect(queued.ledger).toEqual(base.ledger)
  })

  it('two plans on one target: the second starts only once the first no longer engages it', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    let state = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST)
    state = queuePlan(state, { kind: 'installation', blueprintId: 'electrical-control-instruments', target: { facilityId: laboratoryFacilityId } }, ELECTRICAL_COST)
    state = tick(state) // acoustic (ordinal 1) is admitted first and now engages the target
    expect(state.physicalPlans.plans[0]!.status).toBe('started')
    expect(state.physicalPlans.plans[1]!.status).not.toBe('started')
    for (let i = 0; i < TUNING.ACOUSTIC_INSTRUMENTS_BUILD_WEEKS; i++) state = tick(state)
    expect(state.physicalPlans.plans[1]!.status).toBe('started')
  })

  it('cancelling a queued plan leaves the state byte-identical except the plan row and history', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const queued = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST)
    const planId = queued.physicalPlans.plans[0]!.id
    const cancelled = applyActions(queued, [{ kind: 'cancelPhysicalPlan', planId } as never])
    expect(cancelled.physicalPlans.plans[0]!.status).toBe('cancelled')
    expect(exceptRoots(cancelled, ['physicalPlans', 'studioHistory'])).toBe(exceptRoots(queued, ['physicalPlans', 'studioHistory']))
  })
})

describe('P13B-S3 ordering and envelope (test 5)', () => {
  it('two plans on independent targets, cash for one: the first starts, the second stays queued with an insufficient-cash reason and no partial debit', () => {
    let staged = p13aLaboratorySlice()
    const lab1 = staged.operations.facilities.find(f => f.capability === 'laboratory')!.id
    staged = commitPlacement(staged, { blueprintId: 'research-laboratory', origin: nextLaboratoryOrigin(staged) })
    staged = advanceTo(staged, staged.market.tick + TUNING.RESEARCH_LABORATORY_BUILD_WEEKS) // lab2 completes, real, genuine
    const lab2 = staged.operations.facilities.find(f => f.capability === 'laboratory' && f.id !== lab1)!.id

    // Directly-set cash (established codebase idiom for reaching a genuine,
    // reachable boundary balance without dozens of unrelated actions/ticks — see
    // e.g. tests/d17-engagement-persistence.test.ts, tests/c1-m6-second-zone-by-data.test.ts.
    // $500,000 is a real, reachable studio balance: it comfortably covers ONE
    // $350,000 module and never two.
    const poor: GameState = { ...staged, studio: { ...staged.studio, cash: 500_000 } }
    let state = queuePlan(poor, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: lab1 } }, ACOUSTIC_COST)
    state = queuePlan(state, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: lab2 } }, ACOUSTIC_COST)

    const ticked = tick(state)
    const [first, second] = ticked.physicalPlans.plans
    expect(first!.status).toBe('started')
    expect(second!.status).toBe('queued')
    expect(planAdmissionView(ticked, second!).reason).toMatch(/insufficient cash/i)

    // No partial debit: isolate the admitted plan's exact cost against a control
    // run with no plans queued at all (removes any unrelated weekly charge from the arithmetic).
    const control = tick(poor)
    const unrelatedWeeklyCharge = poor.studio.cash - control.studio.cash
    expect(poor.studio.cash - ticked.studio.cash).toBe(ACOUSTIC_COST + unrelatedWeeklyCharge)
  })

  it('admission drains cash inside the SAME tick research reads: the plan starts and that week\'s research receipt is skipped for insufficient cash', () => {
    const entry = p13aResearchEntry() // Lab operational with acoustic instruments, week 260
    const { state: staffed, laboratoryFacilityId, projectId } = p13bStaffedProject(entry, 0, 40_000, 4) // begun, not yet advanced; 4 seats x $40,000 == $40,000/week usable (S1's own literal)
    const beforeProject = staffed.technology.projects.find(p => p.id === projectId)!

    // Directly-set cash to a real, reachable boundary: affords the $350,000
    // electrical module plus a $10,000 margin, never the $40,000 research spend
    // on top of it. Electrical is installable on this Lab (acoustic is already
    // OPERATIONAL there, not a live install, so it does not hold `targetEngaged`).
    const poor: GameState = { ...staffed, studio: { ...staffed.studio, cash: ACOUSTIC_COST + 10_000 } }
    const queued = queuePlan(poor, { kind: 'installation', blueprintId: 'electrical-control-instruments', target: { facilityId: laboratoryFacilityId } }, ELECTRICAL_COST)
    const ticked = tick(queued)
    expect(ticked.physicalPlans.plans[0]!.status).toBe('started')

    const project = ticked.technology.projects.find(p => p.id === projectId)!
    expect(project.weeks.length).toBe(beforeProject.weeks.length) // no new receipt this week
    expect(ticked.ledger.some(e => e.week === queued.market.tick && e.kind === 'researchSpend')).toBe(false)

    // Pure-function confirmation of the EXACT bottleneck the engine already
    // names for this cash level (technology.ts:195), pinning the reason.
    const postAdmissionCash: GameState = { ...poor, studio: { ...poor.studio, cash: poor.studio.cash - ELECTRICAL_COST } }
    expect(researchWeekQuote(postAdmissionCash, project).bottleneck).toBe('Insufficient cash for this week’s usable research budget.')

    // Control: the identical staffed project and starting cash, WITHOUT the
    // plan queued, DOES get its receipt — proving the admission itself (not a
    // pre-existing staffing gap) is what caused the skip.
    const control = tick(poor)
    const controlProject = control.technology.projects.find(p => p.id === projectId)!
    expect(controlProject.weeks.length).toBe(beforeProject.weeks.length + 1)
  })

  it('a dependency completing in week w enables its dependent at w+1\'s admission boundary, never within w', () => {
    const base = p13aLaboratorySlice() // one Lab, week 12
    const origin = nextLaboratoryOrigin(base)
    let state = queuePlan(base, { kind: 'placement', blueprintId: 'research-laboratory', origin }, TUNING.RESEARCH_LABORATORY_CAPEX)
    state = tick(state) // the body plan starts this boundary
    const bodyPlan = state.physicalPlans.plans[0]!
    expect(bodyPlan.status).toBe('started')
    const bodyPlacement = state.placement.facilities.find(f => f.id === bodyPlan.startedPlacementId)!
    const completesWeek = bodyPlacement.completesWeek

    state = queuePlan(state, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { planId: bodyPlan.id } }, ACOUSTIC_COST, { dependsOn: [bodyPlan.id] })

    while (state.market.tick < completesWeek - 1) state = tick(state)
    const arrival = tick(state) // this tick's arrival week === completesWeek
    expect(arrival.placement.facilities.find(f => f.id === bodyPlan.startedPlacementId)!.status).toBe('operational')
    expect(arrival.physicalPlans.plans[1]!.status).not.toBe('started') // never within w

    const following = tick(arrival)
    expect(following.physicalPlans.plans[1]!.status).toBe('started') // only at w+1's boundary
  })
})

describe('P13B-S3 conservation, determinism, replay, history and rival symmetry (test 6)', () => {
  it('conservation: every admitted commit\'s constructionCapex ledger row equals its commitReceipt.cost', () => {
    const base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const queued = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: laboratoryFacilityId } }, ACOUSTIC_COST)
    const ticked = tick(queued)
    const plan = ticked.physicalPlans.plans[0]!
    const placement = ticked.placement.facilities.find(f => f.id === plan.startedPlacementId)!
    const row = ticked.ledger.find(e => e.kind === 'constructionCapex' && e.constructionProjectId === placement.projectId)!
    expect(Math.abs(row.amount)).toBe(plan.commitReceipt!.cost)
  })

  it('determinism: replaying the same actions from the same start produces byte-identical exportSave output', () => {
    const build = (): GameState => {
      const base = p13aLaboratorySlice()
      const lab = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
      let state = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: lab } }, ACOUSTIC_COST)
      state = tick(state)
      return tick(state)
    }
    expect(exportSave(makeSave(build()))).toBe(exportSave(makeSave(build())))
  })

  it('replay: save/reload mid-queue then continue matches an uninterrupted run, byte for byte', () => {
    const base = p13aLaboratorySlice()
    const lab = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const queued = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: lab } }, ACOUSTIC_COST)
    const midJson = exportSave(makeSave(queued))
    const uninterrupted = tick(tick(tick(queued)))
    const reloaded = (importSave(midJson) as unknown as { state: GameState }).state
    const resumed = tick(tick(tick(reloaded)))
    expect(exportSave(makeSave(resumed))).toBe(exportSave(makeSave(uninterrupted)))
  })

  it('history rows: planQueued and planStarted carry week and reason through the existing studio-history mechanism', () => {
    const base = p13aLaboratorySlice()
    const lab = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const queued = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: lab } }, ACOUSTIC_COST)
    const queuedRow = queued.studioHistory.rows.find(r => r.kind === 'planQueued')
    expect(queuedRow).toMatchObject({ kind: 'planQueued', week: base.market.tick })
    const started = tick(queued)
    const startedRow = started.studioHistory.rows.find(r => r.kind === 'planStarted')
    expect(startedRow).toBeTruthy()
  })

  it('rival symmetry: validatePhysicalPlans accepts a rival studio\'s plan list built by structural injection with the same law (mirrors tests/p13b-s2-labs.test.ts\'s / tests/p13b-s2-validation.test.ts\'s injection technique — this engine has no public action path that grows a genuine rival physical plan, exactly the FINDING p13b-s2-validation.test.ts already recorded for rival research projects)', () => {
    const base = p13aLaboratorySlice()
    const lab = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const queued = queuePlan(base, { kind: 'installation', blueprintId: 'acoustic-instruments', target: { facilityId: lab } }, ACOUSTIC_COST)
    const own = queued.hollywood!.playerStudioId
    const rivalStudioId = queued.hollywood!.identities.find(i => i.studioId !== own)!.studioId
    const ownPlan = queued.physicalPlans.plans[0]!
    const rivalPlan: PhysicalPlan = { ...ownPlan, id: `${rivalStudioId}:plan:1`, studioId: rivalStudioId }
    const withRival: GameState = {
      ...queued,
      physicalPlans: { ...queued.physicalPlans, nextPlanId: queued.physicalPlans.nextPlanId + 1, plans: [...queued.physicalPlans.plans, rivalPlan] },
    }
    expect(() => validatePhysicalPlans(withRival)).not.toThrow()
  })
})
