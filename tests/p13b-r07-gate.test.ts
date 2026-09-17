import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { Action, GameState, ProductionWorkflow } from '../src/core/types.js'
import { advanceTo } from '../src/harness/p13a/fixtures.js'
import { p13bTwoLabWorld } from '../src/harness/p13b/fixtures.js'
import { productionPayload } from './contracts/_contractFixtures.js'
// RED-by-design: `src/core/productionSetup.ts` does not exist yet — see
// tests/p13b-r07-recipes.test.ts's header for the full RED-design rationale
// (shared across every P13B-S5-R07 test-author file). `SETUP_RECIPES` is the
// ONLY import from the new module (referenced once, to keep the import from
// being flagged unused under `noUnusedLocals`).
import { SETUP_RECIPES } from '../src/core/productionSetup.js'

// P13B-S5-R07 test 3 (task expansion, 2026-09-17, plan lines 672-733).
// Requirement-derived from test-list item 3 (line 725-726): "gate:
// knowledge-only, Lab-only, wrong-stage, active-retrofit, cancelled-installation
// and unheld-asset cases take the conventional route; the exact-stage
// operational adoption takes lighting."
//
// COORDINATOR ADJUDICATION (received mid-task, 2026-09-17, binding on this
// file): the "cancelled-installation" and "unheld-asset" sub-cases depend on S6
// state that cannot exist under the landed S5 engine — no cancelled placement
// status exists, `holderAdoptionId` is never null today, and `cancelPhysicalPlan`
// refuses a started plan. Per that ruling: DO NOT construct or forge those
// states, do not invent cancellation semantics. Those two sub-cases are OMITTED
// here and named OPEN, pending S6 ("S6 must exercise cancellation/restoration
// eligibility against this consumer" — plan line 801-802). The remaining four
// reachable sub-cases (knowledge-only, Lab-only, wrong-stage, active-retrofit /
// unfinished installation) plus the positive exact-stage-operational case are
// tested below.
//
// Two engine facts from that same adjudication, both reused directly: during
// the rehearsal hold no `ShootingTask` exists (created only when `enterPhase`
// targets shooting); stage + Set are already bound at rehearsal entry
// (`bindings.stageFacilityId`/`setId`), so "reserved operational soundstage" =
// the workflow's bound stage.
//
// MEASURED WEEKS (throwaway vite-node probes against this exact source tree,
// 2026-09-17; all five cases below share ONE base fixture, `p13bTwoLabWorld()`
// — a generated two-Laboratory world at week 780, both Laboratories' discipline
// modules already operational, matching src/harness/p13b/fixtures.ts's own
// doc comment):
//   Lab-only (no lighting research begun at all): ballroom commissioned week
//     780, standing 788, greenlight 788, rehearsal (bound STAGE_7) 791, gate-check
//     (today's gate-less Shooting-entry-equivalent) 792.
//   knowledge-only / wrong-stage (lighting research completes 791, matching
//     tests/fixtures/p13b/PROVENANCE.md's V24 lighting fixture's own
//     committed-791 figure exactly): ballroom commissioned 791, standing 799,
//     greenlight 799, rehearsal 802, gate-check 803.
//   active-retrofit / unfinished installation: SAME 791/799/799/802 timeline as
//     above, adoption committed at week 802 (the SAME week rehearsal binds) so
//     `operationalWeek` (committedWeek + `deploymentWeeks` 4) = 806, strictly
//     after gate-check week 803 — genuinely mid-deployment at the gate check,
//     not yet operational.
//   exact-stage operational (positive case): lighting adopted on STAGE_7
//     immediately at 791, operational 795 (matches PROVENANCE.md's
//     operational-795 figure exactly); ballroom commissioned AFTER that, at 795,
//     standing 803, greenlight 803, rehearsal 806, gate-check 807.

const STAGE_7 = 'facility-soundstage-07'
const STAGE_12 = 'facility-soundstage-12'

type ProductionSetupRecipeId = 'ballroom-reveal-lighting-01' | 'ordinary-interior-01'
type ProductionSetupRecord = {
  route: 'conventional' | 'lighting'
  adoptionId: string | null
  equipmentAssetId: string | null
  requiredUnits: number
}
type WorkflowWithSetup = ProductionWorkflow & { setup: ProductionSetupRecord | null }

function fundTo(state: GameState, target: number): GameState {
  const delta = target - state.studio.cash
  if (delta === 0) return state
  return {
    ...state,
    studio: { ...state.studio, cash: target },
    ledger: [
      ...state.ledger,
      { week: state.market.tick, kind: (delta > 0 ? 'studioRevenue' : 'overhead') as 'studioRevenue' | 'overhead', amount: delta, note: 'r07-gate fixture fund' },
    ],
  }
}

/** p13bTwoLabWorld only signs the eight Scientist candidates; a production also
 * needs one writer/director/3-actor/craft. Fixed-seed world (p13aGeneratedStudio's
 * default seed) so this is fully deterministic across calls. */
function signCreativeRoster(state: GameState): GameState {
  const already = new Set(state.contracts.map((c) => c.talentId))
  const byRole = (role: string) => state.talent.filter((t) => t.role === role && !already.has(t.id))
  const roster = [...byRole('writer').slice(0, 1), ...byRole('director').slice(0, 1), ...byRole('actor').slice(0, 3), ...byRole('craft').slice(0, 1)]
  return applyActions(state, roster.map((t) => ({ kind: 'signContract' as const, talentId: t.id, termWeeks: 208 })))
}

/** Strikes whatever stands on `stageFacilityId` (if anything) and commissions +
 * builds a grand-ballroom Set there (real ticks, `TUNING.SET_BUILD_WEEKS_BAND_HIGH`). */
function ballroomStanding(state: GameState, stageFacilityId: string): GameState {
  let s = fundTo(state, 30_000_000)
  const mounted = s.sets.find((set) => set.mountedOn === stageFacilityId && set.status !== 'retired')
  if (mounted !== undefined) s = applyActions(s, [{ kind: 'strikeSet', setId: mounted.id }])
  s = applyActions(s, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId } }])
  for (let week = 0; week < TUNING.SET_BUILD_WEEKS_BAND_HIGH; week++) s = tick(s)
  return s
}

function lightingResearchComplete(): GameState {
  const { state: world, laboratoryFacilityIds: [, lab2], candidateIds } = p13bTwoLabWorld()
  let state = applyActions(
    world,
    candidateIds
      .slice(0, 4)
      .map((scientistId) => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'lighting-control-01' as const })),
  )
  const project = state.technology.projects.find((p) => p.technologyId === 'lighting-control-01')!
  state = applyActions(state, [{ kind: 'beginResearch', projectId: project.id, budgetPerWeek: 40_000 }])
  while (state.technology.projects.find((p) => p.id === project.id)!.status !== 'completed') {
    if (state.market.tick > 900) throw new Error('r07-gate fixture: lighting research did not complete before week 900')
    state = advanceTo(state, state.market.tick + 1)
  }
  return state
}

function selectRecipe(state: GameState, productionId: string, recipeId: ProductionSetupRecipeId): GameState {
  return applyActions(state, [
    { kind: 'setProductionSetupRecipe', productionId, recipeId, expectedPlanRevision: 0 } as unknown as Action,
  ])
}

function workflowOf(state: GameState, index = 0): WorkflowWithSetup {
  return state.operations.workflows[index]! as WorkflowWithSetup
}

describe('P13B-S5-R07 lighting-route gate (test 3)', () => {
  it('SETUP_RECIPES names the ballroom recipe with a lighting-halved unit count (sanity for the route assertions below)', () => {
    const ballroom = SETUP_RECIPES.find((r: { id: string }) => r.id === 'ballroom-reveal-lighting-01')!
    expect(ballroom.units).toEqual({ conventional: 4, lighting: 2 })
  })

  it('knowledge-only: lighting research complete (access acquired), no adoption anywhere -> conventional route', () => {
    let state = ballroomStanding(lightingResearchComplete(), STAGE_7) // 791 -> standing 799
    expect(state.market.tick).toBe(799)
    state = signCreativeRoster(state)
    state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state) }])
    const productionId = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
    state = tick(state); state = tick(state); state = tick(state) // rehearsal, bound STAGE_7, week 802
    expect(state.market.tick).toBe(802)
    state = tick(state) // gate-check week 803
    expect(state.market.tick).toBe(803)
    expect(state.technology.access.some((a) => a.technologyId === 'lighting-control-01')).toBe(true)
    expect(state.technology.adoptions.length).toBe(0)

    state = selectRecipe(state, productionId, 'ballroom-reveal-lighting-01')
    const record = workflowOf(state).setup!
    expect(record.route).toBe('conventional')
    expect(record.requiredUnits).toBe(4)
    expect(record.adoptionId).toBeNull()
  })

  it('Lab-only: the electrical-control-instruments module is operational, but lighting research was never begun -> conventional route', () => {
    let state = ballroomStanding(p13bTwoLabWorld().state, STAGE_7) // 780 -> standing 788
    expect(state.market.tick).toBe(788)
    state = signCreativeRoster(state)
    state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state) }])
    const productionId = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
    state = tick(state); state = tick(state); state = tick(state) // rehearsal, week 791
    expect(state.market.tick).toBe(791)
    state = tick(state) // gate-check week 792
    expect(state.market.tick).toBe(792)
    expect(state.technology.access.some((a) => a.technologyId === 'lighting-control-01')).toBe(false)

    state = selectRecipe(state, productionId, 'ballroom-reveal-lighting-01')
    const record = workflowOf(state).setup!
    expect(record.route).toBe('conventional')
  })

  it('wrong-stage: lighting is operational, but on a DIFFERENT stage than the one this production is bound to -> conventional route', () => {
    let state = lightingResearchComplete() // 791
    state = fundTo(state, 5_000_000)
    state = applyActions(state, [{ kind: 'adoptTechnology', technologyId: 'lighting-control-01', stageFacilityId: STAGE_12 } as unknown as Action])
    const adoption = state.technology.adoptions.find((a) => a.technologyId === 'lighting-control-01' && a.stageFacilityId === STAGE_12)!
    while (state.technology.adoptions.find((a) => a.id === adoption.id)!.operationalWeek === null) state = tick(state)
    expect(state.market.tick).toBe(795)

    state = ballroomStanding(state, STAGE_7) // the PRODUCTION's stage — commissioned at 795 (after the STAGE_12 wait), standing 803
    state = signCreativeRoster(state)
    state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state) }])
    const productionId = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
    state = tick(state); state = tick(state); state = tick(state) // rehearsal, bound STAGE_7
    state = tick(state) // gate-check
    expect(workflowOf(state).bindings.stageFacilityId).toBe(STAGE_7)
    expect(state.technology.adoptions.find((a) => a.id === adoption.id)!.stageFacilityId).toBe(STAGE_12)

    state = selectRecipe(state, productionId, 'ballroom-reveal-lighting-01')
    const record = workflowOf(state).setup!
    expect(record.route).toBe('conventional')
  })

  it('active-retrofit / unfinished installation: adoption committed on the exact bound stage but not yet operational at the gate check -> conventional route', () => {
    let state = lightingResearchComplete() // 791
    state = ballroomStanding(state, STAGE_7) // -> standing 799
    expect(state.market.tick).toBe(799)
    state = signCreativeRoster(state)
    state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state) }])
    const productionId = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
    state = tick(state); state = tick(state); state = tick(state) // rehearsal, bound STAGE_7, week 802
    expect(state.market.tick).toBe(802)
    expect(workflowOf(state).bindings.stageFacilityId).toBe(STAGE_7)

    // Committed the SAME week rehearsal binds — operationalWeek = 802 + deploymentWeeks(4) = 806.
    state = fundTo(state, 5_000_000)
    state = applyActions(state, [{ kind: 'adoptTechnology', technologyId: 'lighting-control-01', stageFacilityId: STAGE_7 } as unknown as Action])
    const adoption = state.technology.adoptions.find((a) => a.technologyId === 'lighting-control-01' && a.stageFacilityId === STAGE_7)!
    expect(adoption.committedWeek).toBe(802)

    state = tick(state) // gate-check week 803
    expect(state.market.tick).toBe(803)
    const liveAdoption = state.technology.adoptions.find((a) => a.id === adoption.id)!
    expect(liveAdoption.operationalWeek === null || liveAdoption.operationalWeek > 803).toBe(true) // genuinely still installing

    state = selectRecipe(state, productionId, 'ballroom-reveal-lighting-01')
    const record = workflowOf(state).setup!
    expect(record.route).toBe('conventional')
  })

  it('exact-stage operational adoption -> lighting route, halving the unit count to 2', () => {
    let state = lightingResearchComplete() // 791
    state = fundTo(state, 5_000_000)
    state = applyActions(state, [{ kind: 'adoptTechnology', technologyId: 'lighting-control-01', stageFacilityId: STAGE_7 } as unknown as Action])
    const adoption = state.technology.adoptions.find((a) => a.technologyId === 'lighting-control-01' && a.stageFacilityId === STAGE_7)!
    while (state.technology.adoptions.find((a) => a.id === adoption.id)!.operationalWeek === null) state = tick(state)
    expect(state.market.tick).toBe(795)

    state = ballroomStanding(state, STAGE_7) // -> standing 803
    expect(state.market.tick).toBe(803)
    state = signCreativeRoster(state)
    state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state) }])
    const productionId = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
    state = tick(state); state = tick(state); state = tick(state) // rehearsal, bound STAGE_7, week 806
    expect(state.market.tick).toBe(806)
    state = tick(state) // gate-check week 807
    expect(state.market.tick).toBe(807)
    expect(workflowOf(state).phase).toBe('rehearsal') // held — not yet in Shooting even under today's engine's own numbering, this is the visit R07 intercepts
    expect(workflowOf(state).shootingTask).toBeNull()

    state = selectRecipe(state, productionId, 'ballroom-reveal-lighting-01')
    const record = workflowOf(state).setup!
    expect(record.route).toBe('lighting')
    expect(record.requiredUnits).toBe(2)
    expect(record.adoptionId).toBe(adoption.id)
    expect(record.equipmentAssetId).not.toBeNull()
  })
})

// OPEN, pending S6 (coordinator adjudication, 2026-09-17): "cancelled-installation"
// (a cancelled/restoring lighting-control-stage placement does not qualify) and
// "unheld-asset" (the equipment asset's holderAdoptionId is null, e.g. after a
// cancellation) cannot be constructed under the landed S5 engine — no cancelled
// placement status exists yet, `holderAdoptionId` is never null today, and
// `cancelPhysicalPlan` refuses a started plan. S6 owns exercising these two
// sub-cases against this consumer once it lands (plan line 801-802).
