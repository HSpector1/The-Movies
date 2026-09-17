import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { Action, GameState, ProductionWorkflow, StudioSet } from '../src/core/types.js'
import { operationsStudio, productionPayload, withCash } from './contracts/_contractFixtures.js'
// RED-by-design: `src/core/productionSetup.ts` does not exist yet — see
// tests/p13b-r07-recipes.test.ts's header for the full RED-design rationale
// (shared across every P13B-S5-R07 test-author file). `validateProductionSetup`
// is the ONLY import from the new module.
import { validateProductionSetup } from '../src/core/productionSetup.js'

// P13B-S5-R07 test 4 (task expansion, 2026-09-17, plan lines 672-733).
// Requirement-derived from test-list item 4 (line 727-728): "controls: legacy
// timeline byte-identical; occupied-stage competition and stage-release law
// unchanged; changed pre-Shooting sound choice independent of setup;
// different-binding restart preserves prior work without recycling credit; no
// filming/quality/research/P14 change; a forged operational flag is refused by
// the validator."
//
// INTERPRETATIONS NAMED:
//   1. `validateProductionSetup(state): string[]` — a live-state, engine-level
//      validator (returning violation strings, the SAME shape convention as
//      `validateTechnology`), distinct from `tests/p13b-r07-save-v25.test.ts`'s
//      SAVE-LOADING-TIME validator concern. The plan's own delegated decision
//      names the validator's checks under the "Save V25" bullet, but the
//      requirement list also places "a forged operational flag is refused by the
//      validator" under CONTROLS (this file) — read as: the validator is an
//      engine-level invariant the save layer also enforces at load time, not two
//      different laws. This file exercises it directly over a live state; the
//      save-specific angle (an on-disk forged envelope) is file 5's concern.
//   2. "different-binding restart": no PURE action sequence changes which stage
//      or Set a rehearsing production is bound to today (retention keeps a bound
//      Set exclusively through shooting; there is no rebind primitive). This test
//      exercises the LAW over a directly-constructed before/after pair — the same
//      technique tests/p13b-r07-recipes.test.ts uses for "unusable Set" — stating
//      the precondition (a hand-authored prior binding with credited work) and
//      the postcondition (`priorWork` carries it, credit does not carry) rather
//      than deriving the rebind's own trigger mechanism, which is not specified
//      by the plan text and is not invented here.
//   3. "changed pre-Shooting sound choice": uses the EXISTING, real
//      `setProductionTechnology` action with `method: 'silent', adoptionId: null`
//      (technology.ts:413-422) — lawful and immediate (no adoption to wait for),
//      and NOT blocked by a setup hold: `productionHasBegunFilming` (the gate
//      that action already checks) reads `remainingTicks <= 5`, which stays FALSE
//      throughout the hold (remainingTicks stays 6 by the delegated decision's
//      own law), so an unrelated technology selection during the hold is exactly
//      as lawful today as it will be once R07 lands.
//
// MEASURED WEEKS: reuses tests/p13b-r07-timeline.test.ts's own conventional
// ballroom fixture verbatim (commission week 0, standing 8, greenlight 8,
// rehearsal 11, TODAY's gate-less Shooting entry 12) and its lighting ballroom
// fixture (research complete 791, lighting operational 795, ballroom standing
// 803, greenlight 803, rehearsal 806, gate-check 807) — see that file's header
// for the full probe trace.

const STAGE_7 = 'facility-soundstage-07'
const STAGE_12 = 'facility-soundstage-12'

type ProductionSetupRecipeId = 'ballroom-reveal-lighting-01' | 'ordinary-interior-01'
type ProductionSetupRecord = {
  recipeId: ProductionSetupRecipeId
  planRevision: number
  admittedWeek: number
  route: 'conventional' | 'lighting'
  adoptionId: string | null
  equipmentAssetId: string | null
  stageFacilityId: string
  setId: string
  requiredUnits: number
  creditedUnits: number
  lastCreditedWeek: number | null
  completedWeek: number | null
  priorWork: readonly ProductionSetupRecord[]
}
type WorkflowWithSetup = ProductionWorkflow & { setup: ProductionSetupRecord | null }

function workflowOf(state: GameState, index = 0): WorkflowWithSetup {
  return state.operations.workflows[index]! as WorkflowWithSetup
}

function selectRecipe(state: GameState, productionId: string, recipeId: ProductionSetupRecipeId): GameState {
  return applyActions(state, [
    { kind: 'setProductionSetupRecipe', productionId, recipeId, expectedPlanRevision: 0 } as unknown as Action,
  ])
}

/** Measured (tests/p13b-r07-timeline.test.ts): rehearsal (bound STAGE_7) week
 * 11; TODAY's gate-less Shooting entry week 12. */
function conventionalBallroomAtRehearsal(seed: string, offset = 0): GameState {
  let state = withCash(operationsStudio(seed), 30_000_000)
  state = applyActions(state, [{ kind: 'strikeSet', setId: 'set-0' }])
  state = applyActions(state, [
    { kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE_7 } },
  ])
  for (let week = 0; week < TUNING.SET_BUILD_WEEKS_BAND_HIGH; week++) state = tick(state)
  state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state, offset) }])
  state = tick(state)
  state = tick(state)
  state = tick(state)
  return state
}

describe('P13B-S5-R07 controls (test 4)', () => {
  it('legacy timeline byte-identical: a production that never selects a recipe keeps setup: null and today\'s EXACT schedule', () => {
    const rehearsing = conventionalBallroomAtRehearsal('r07-controls-legacy')
    expect(rehearsing.market.tick).toBe(11)
    expect(workflowOf(rehearsing).setup).toBeNull()
    const shooting = tick(rehearsing) // no recipe ever selected -> unconditional advance, exactly as today
    expect(shooting.market.tick).toBe(12)
    expect(workflowOf(shooting).phase).toBe('shooting')
    expect(workflowOf(shooting).setup).toBeNull()
    // The production's own remainingTicks countdown never held.
    expect(shooting.studio.activeProductions[0]!.remainingTicks).toBe(5)
  })

  it('occupied-stage competition: an extended setup hold on one stage never affects an unrelated production on a different stage', () => {
    // Production A: ballroom recipe on STAGE_7, held for several weeks.
    let state = conventionalBallroomAtRehearsal('r07-controls-competition', 0)
    state = tick(state) // gate-check week 12
    const productionAId = state.studio.activeProductions[0]!.id
    state = selectRecipe(state, productionAId, 'ballroom-reveal-lighting-01')
    expect(workflowOf(state, 0).setup!.requiredUnits).toBe(4)

    // Production B: the endowed house Set on STAGE_12, greenlit the SAME week, no recipe ever selected.
    state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state, 1) }])
    const productionBId = state.studio.activeProductions[1]!.id
    state = tick(state) // 13 — A: 1/4 credited; B: no advance (greenlight tick)
    state = tick(state) // 14 — A: 2/4; B: Development -> Pre-production
    state = tick(state) // 15 — A: 3/4; B: Pre-production -> Rehearsal, bound STAGE_12
    expect(workflowOf(state, 1).bindings.stageFacilityId).toBe(STAGE_12)
    expect(workflowOf(state, 1).phase).toBe('rehearsal')
    state = tick(state) // 16 — A: 4/4, completes, enters Shooting; B: unconditional advance (no recipe), enters Shooting too
    expect(workflowOf(state, 0).phase).toBe('shooting')
    expect(workflowOf(state, 1).phase).toBe('shooting') // B was NEVER held — its own schedule ran on its own clock, untouched by A's hold
    expect(workflowOf(state, 1).setup).toBeNull()
  })

  it('stage-release law unchanged: the held stage stays bound to the SAME production throughout the extended hold (never released early)', () => {
    let state = conventionalBallroomAtRehearsal('r07-controls-stage-release')
    state = tick(state) // 12
    const productionId = state.studio.activeProductions[0]!.id
    state = selectRecipe(state, productionId, 'ballroom-reveal-lighting-01')
    const originalBinding = workflowOf(state).bindings
    for (let i = 0; i < 3; i++) {
      state = tick(state)
      expect(workflowOf(state).bindings.stageFacilityId).toBe(originalBinding.stageFacilityId)
      expect(workflowOf(state).bindings.setId).toBe(originalBinding.setId)
      expect(workflowOf(state).bindings.heldSinceWeek).toBe(originalBinding.heldSinceWeek) // never re-acquired
    }
  })

  it('a changed pre-Shooting sound choice mid-hold is lawful and leaves the setup record untouched — INTERPRETATION 3', () => {
    let state = conventionalBallroomAtRehearsal('r07-controls-sound-independent')
    state = tick(state) // 12
    const productionId = state.studio.activeProductions[0]!.id
    state = selectRecipe(state, productionId, 'ballroom-reveal-lighting-01')
    state = tick(state) // 13: 1/4 credited
    const before = workflowOf(state).setup!
    expect(before.creditedUnits).toBe(1)

    state = applyActions(state, [{ kind: 'setProductionTechnology', productionId, method: 'silent', adoptionId: null }])
    const after = workflowOf(state).setup!
    expect(after.creditedUnits).toBe(before.creditedUnits)
    expect(after.route).toBe(before.route)
    expect(after.requiredUnits).toBe(before.requiredUnits)
    expect(after.planRevision).toBe(before.planRevision) // an unrelated technology choice is not a binding change
  })

  it('different-binding restart preserves prior work without recycling credit — INTERPRETATION 2: directly-constructed before/after pair', () => {
    let state = conventionalBallroomAtRehearsal('r07-controls-rebind')
    state = tick(state) // 12
    const productionId = state.studio.activeProductions[0]!.id
    state = selectRecipe(state, productionId, 'ballroom-reveal-lighting-01')
    state = tick(state) // 13: 1/4 credited
    state = tick(state) // 14: 2/4 credited
    const priorRecord = workflowOf(state).setup!
    expect(priorRecord.creditedUnits).toBe(2)
    const priorBindings = workflowOf(state).bindings

    // Hand-authored: a second, independently-standing grand-ballroom Set on the
    // OTHER stage, and the production's binding externally moved onto it (no
    // lawful trigger for this exists today — see INTERPRETATION 2 above).
    const reboundSet: StudioSet = {
      id: 'set-rebind-99',
      name: 'Grand Ballroom (rebind fixture)',
      blueprintId: 'set-grand-ballroom',
      mountedOn: STAGE_12,
      setType: 'grand-ballroom',
      status: 'standing',
      completesWeek: null,
      quality: 85,
      novelty: 1,
      condition: 100,
      genreWeights: state.sets.find((s) => s.setType === 'grand-ballroom')!.genreWeights,
      priorityGenre: 'romance',
    }
    const rebound: GameState = {
      ...state,
      sets: [...state.sets, reboundSet],
      operations: {
        ...state.operations,
        workflows: state.operations.workflows.map((w, i) =>
          i === 0
            ? {
                ...w,
                bindings: { ...priorBindings, stageFacilityId: STAGE_12, setId: reboundSet.id, heldSinceWeek: state.market.tick },
                setup: {
                  recipeId: 'ballroom-reveal-lighting-01',
                  planRevision: priorRecord.planRevision + 1, // any binding change bumps it (delegated decision, plan line 698-699)
                  admittedWeek: state.market.tick,
                  route: 'conventional',
                  adoptionId: null,
                  equipmentAssetId: null,
                  stageFacilityId: STAGE_12,
                  setId: reboundSet.id,
                  requiredUnits: 4,
                  creditedUnits: 0, // NOT recycled
                  lastCreditedWeek: null,
                  completedWeek: null,
                  priorWork: [priorRecord],
                } satisfies ProductionSetupRecord,
              }
            : w,
        ),
      },
    }
    const record = workflowOf(rebound).setup!
    expect(record.creditedUnits).toBe(0)
    expect(record.priorWork).toHaveLength(1)
    expect(record.priorWork[0]!.creditedUnits).toBe(2) // the earlier binding's work is PRESERVED, not discarded
    expect(record.priorWork[0]!.stageFacilityId).toBe(STAGE_7)
  })

  it('no quality/research change: the setup record carries no quality-bearing field, and bind-time lockedUplift/lockedNovelty never move across the hold', () => {
    let state = conventionalBallroomAtRehearsal('r07-controls-no-quality-drift')
    state = tick(state) // 12
    const productionId = state.studio.activeProductions[0]!.id
    const lockedBefore = workflowOf(state).bindings
    state = selectRecipe(state, productionId, 'ballroom-reveal-lighting-01')
    const record = workflowOf(state).setup!
    expect(Object.keys(record).some((key) => ['quality', 'uplift', 'novelty', 'appeal', 'craft'].includes(key.toLowerCase()))).toBe(false)

    for (let i = 0; i < 4; i++) {
      state = tick(state)
      expect(workflowOf(state).bindings.lockedUplift).toBe(lockedBefore.lockedUplift)
      expect(workflowOf(state).bindings.lockedNovelty).toBe(lockedBefore.lockedNovelty)
    }
    expect(workflowOf(state).phase).toBe('shooting')
  })

  it('no research-root change: ticking through an entire setup hold writes no new technology access/project row', () => {
    let state = conventionalBallroomAtRehearsal('r07-controls-no-research-drift')
    state = tick(state) // 12
    const productionId = state.studio.activeProductions[0]!.id
    const accessBefore = JSON.stringify(state.technology.access)
    const projectsBefore = JSON.stringify(state.technology.projects)
    state = selectRecipe(state, productionId, 'ballroom-reveal-lighting-01')
    for (let i = 0; i < 4; i++) state = tick(state)
    expect(JSON.stringify(state.technology.access)).toBe(accessBefore)
    expect(JSON.stringify(state.technology.projects)).toBe(projectsBefore)
  })

  it('a forged operational flag (route: lighting with no matching operational adoption) is refused by validateProductionSetup — INTERPRETATION 1', () => {
    let state = conventionalBallroomAtRehearsal('r07-controls-forged-flag')
    state = tick(state) // 12
    const productionId = state.studio.activeProductions[0]!.id
    state = selectRecipe(state, productionId, 'ballroom-reveal-lighting-01')
    expect(validateProductionSetup(state)).toEqual([]) // the genuine conventional record is clean

    const bindings = workflowOf(state).bindings
    const genuine = workflowOf(state).setup!
    const forged: GameState = {
      ...state,
      operations: {
        ...state.operations,
        workflows: state.operations.workflows.map((w, i) =>
          i === 0
            ? {
                ...w,
                setup: {
                  ...genuine,
                  route: 'lighting',
                  requiredUnits: 2,
                  adoptionId: 'forged-adoption-id-not-in-technology-root',
                  equipmentAssetId: 'forged-equipment-id-not-held',
                } satisfies ProductionSetupRecord,
              }
            : w,
        ),
      },
    }
    expect(bindings.stageFacilityId).toBe(STAGE_7)
    expect(forged.technology.adoptions.some((a) => a.id === 'forged-adoption-id-not-in-technology-root')).toBe(false)
    expect(validateProductionSetup(forged).length).toBeGreaterThan(0)
  })
})
