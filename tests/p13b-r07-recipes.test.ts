import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { setById, setIsUsable } from '../src/core/sets.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { Action, GameState, ProductionWorkflow } from '../src/core/types.js'
import { operationsStudio, productionPayload, withCash } from './contracts/_contractFixtures.js'
// RED-by-design: `src/core/productionSetup.ts` does not exist yet (S5-R07 T1/T2
// engine increment is not landed — verified 2026-09-17: `ls src/core/productionSetup.ts`
// fails, and neither `ProductionWorkflow` (types.ts:656) nor `advanceManagedProductions`
// (operations.ts:1452) carries a setup substate today). `SETUP_RECIPES` and
// `setupForecast` are the ONLY imports from the new module and nothing else in
// this file can run before they resolve, so the whole file fails at module
// resolution for exactly one cause — the SAME idiom every P13B test-author file
// uses (tests/p13b-s5-quotes.test.ts's own MEASURED FINDING comment: importing a
// real, existing module's missing named export risks vite binding it to
// `undefined` instead of failing resolution; a genuinely new module path does
// not have that failure mode). Every other import above is a real, existing
// module.
import { SETUP_RECIPES } from '../src/core/productionSetup.js'

// P13B-S5-R07 test 1 (task expansion, 2026-09-17, "S5-R07 — Lighting production
// consumer: Ballroom-reveal setup units" in docs/engineering/playability-launch-
// review/plans/P13B-HEADLESS-PLAN.md lines 672-733; "Delegated implementation
// decisions" and "Tests" in that section are the law). Requirement-derived from
// test-list item 1 (line 723-724): "recipe selection and refusals (wrong Set
// type/size, unusable Set, no bound stage, after Shooting, stale revision,
// simpler recipe = new plan)."
//
// INTERPRETATIONS NAMED (the plan text explicitly delegates the action's "final
// naming" and record internals; nothing below is a product decision):
//   1. Module surface: `SETUP_RECIPES: readonly ProductionSetupRecipe[]` (catalogue
//      data) and the action dispatched through the EXISTING `applyActions` pipeline
//      as `{ kind: 'setProductionSetupRecipe', productionId, recipeId,
//      expectedPlanRevision }`, refusing by THROWING — the same convention already
//      proven for `commissionSet`/`strikeSet`/`adoptSynchronizedSound`
//      (`rejectRefusedSetVerb`, actions.ts:1585-1602; and p13b-s5-quotes.test.ts's
//      own comment naming the `adoptSynchronizedSound` throw-on-refusal parity).
//   2. "simpler recipe = new plan": the two catalogue recipes require DISJOINT Set
//      types (`grand-ballroom` vs `generic-interior`/`apartment-interior`), so a
//      bound production can never satisfy both recipes' Set-type gates on the SAME
//      physical Set. Read literally against the delegated decision's own gloss —
//      "the same recipe cannot skip preparation by being called ordinary" — this
//      test file proves that gloss directly: selecting `ordinary-interior-01` for a
//      production standing in the grand-ballroom (or the reverse) is refused as a
//      WRONG-SET-TYPE case, not a distinct code path. A genuine mid-flight recipe
//      SWITCH on an unchanged physical Set has no lawful trigger in today's engine
//      (no primitive changes which Set a rehearsing production is bound to without
//      a full rebind — see tests/p13b-r07-controls.test.ts's own note on
//      "different-binding restart").
//   3. "unusable Set": the engine's OWN bind law (`allocateForPhase`,
//      operations.ts:296-330) only ever binds a production to a set that is
//      standing and usable at bind time, and RETENTION then holds that reference
//      through shooting regardless of later wear to OTHER sets — so a production
//      already bound to set X can never observe X becoming unusable while it still
//      holds X (nothing else can wrap on X while X is claimed: "never lets two
//      pictures stand on one set"). There is therefore no PURE action sequence
//      reaching "a rehearsing production's bound Set is currently unusable" today.
//      This file exercises that refusal law over a DIRECTLY-CONSTRUCTED edge state
//      (condition patched below threshold on the already-bound Set) — the SAME
//      technique this repository already uses for edge states with no action path
//      (tests/c2a-m2-set-binding.test.ts's `handmade` state; this plan section's
//      own test 4 "a forged operational flag is refused by the validator").
//   4. "wrong ... size": UNSATISFIABLE today and named, not invented. The recipe's
//      "standard size class" gate has no counterpart in the engine — no size
//      classification exists on `StudioSet` at all, and CAT-011 oversized Sets /
//      the K4 large-stage body stay explicitly OPEN, with their own owners, per
//      this same plan section's Authority line (674-675) and the S5 scope
//      record's boundary (777-781). Every Set the current engine can construct is
//      therefore implicitly "standard size", so there is no lawful way to build a
//      wrong-size Set to refuse. This file tests wrong Set TYPE only.
//
// Fixtures: `tests/contracts/_contractFixtures.ts` (`operationsStudio`,
// `productionPayload`, `withCash` — real, existing, shared by every P13A/P13B
// test-author) plus `commissionSet`/`strikeSet`/`greenlight`/`tick()` real ticks,
// mirroring tests/c2a-m2-set-binding.test.ts's own `atRehearsal()` idiom exactly,
// swapping the endowed house Set for a commissioned `set-grand-ballroom`.
// Real-tick weeks below were MEASURED with a throwaway vite-node probe against
// this exact source tree on 2026-09-17 (not guessed): a founded studio started at
// week 0, ballroom commissioned week 0, standing week 8 (buildWeeks 8), greenlit
// week 8, rehearsal (bound) week 11, and — under TODAY's engine, with no setup
// gate — Shooting entry week 12. See tests/p13b-r07-timeline.test.ts's header for
// the full probe trace and the three fixtures' measured weeks.

const STAGE_7 = 'facility-soundstage-07'

type ProductionSetupRecipeId = 'ballroom-reveal-lighting-01' | 'ordinary-interior-01'
type ProductionSetupRoute = 'conventional' | 'lighting'
type ProductionSetupRecord = {
  recipeId: ProductionSetupRecipeId
  planRevision: number
  admittedWeek: number
  route: ProductionSetupRoute
  adoptionId: string | null
  equipmentAssetId: string | null
  stageFacilityId: string
  setId: string
  requiredUnits: number
  creditedUnits: number
  lastCreditedWeek: number | null
  completedWeek: number | null
  priorWork: readonly unknown[]
}
type WorkflowWithSetup = ProductionWorkflow & { setup: ProductionSetupRecord | null }

function workflowOf(state: GameState, index = 0): WorkflowWithSetup {
  return state.operations.workflows[index]! as WorkflowWithSetup
}

/** A production at rehearsal, bound to a usable standing grand-ballroom Set on
 * its own reserved stage (STAGE_7) — real ticks only, the SAME idiom as
 * tests/c2a-m2-set-binding.test.ts's `atRehearsal()`, with the endowed house Set
 * struck and a `set-grand-ballroom` commissioned and built in its place.
 * `facilities.sort(compareId)` (operations.ts:287) tries STAGE_7 first, and the
 * ballroom is its only candidate, so the bind is deterministic without touching
 * STAGE_12 (removing a facility trips `assertStudioPlacementInvariants` on the
 * next set-verb — measured 2026-09-17 — so STAGE_12's house set is left alone).
 * Measured: commission week 0, standing week 8, greenlight week 8, rehearsal
 * (bound) week 11.
 */
function atBallroomRehearsal(seed: string, offset = 0): GameState {
  let state = withCash(operationsStudio(seed), 30_000_000)
  state = applyActions(state, [{ kind: 'strikeSet', setId: 'set-0' }])
  state = applyActions(state, [
    { kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE_7 } },
  ])
  for (let week = 0; week < TUNING.SET_BUILD_WEEKS_BAND_HIGH; week++) state = tick(state)
  state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state, offset) }])
  state = tick(state) // greenlight tick: no advance
  state = tick(state) // Development -> Pre-production
  state = tick(state) // Pre-production -> Rehearsal (auto-binds the ballroom)
  return state
}

/** A production at rehearsal, bound to the endowed house Set (`generic-interior`,
 * STAGE_7) — no commissioning needed. Measured: greenlight week 0, rehearsal
 * (bound) week 3. */
function atOrdinaryRehearsal(seed: string, offset = 0): GameState {
  let state = withCash(operationsStudio(seed), 5_000_000)
  // AMENDED (coordinator adjudication, 2026-09-17): the D-12 solvency gate
  // refuses this greenlight at $5,000,000 for both callers below (measured
  // commitments $5,659,528 / $5,256,375) — funded above the greenlight, the
  // same ledger-written `withCash` idiom this file already imports (no new
  // `fundTo` duplicate needed).
  state = withCash(state, 5_700_000)
  state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state, offset) }])
  state = tick(state)
  state = tick(state)
  state = tick(state)
  return state
}

function selectRecipe(
  state: GameState,
  productionId: string,
  recipeId: ProductionSetupRecipeId,
  expectedPlanRevision: number,
): GameState {
  return applyActions(state, [
    { kind: 'setProductionSetupRecipe', productionId, recipeId, expectedPlanRevision } as unknown as Action,
  ])
}

describe('P13B-S5-R07 recipe catalogue and selection/refusal law (test 1)', () => {
  it('SETUP_RECIPES carries exactly the two adopted recipes, in stable order, with the plan-pinned unit counts', () => {
    expect(SETUP_RECIPES.map((r: { id: string }) => r.id)).toEqual([
      'ballroom-reveal-lighting-01',
      'ordinary-interior-01',
    ])
    const ballroom = SETUP_RECIPES.find((r: { id: string }) => r.id === 'ballroom-reveal-lighting-01')!
    expect(ballroom.units).toEqual({ conventional: 4, lighting: 2 })
    expect(ballroom.requiredSetTypes).toEqual(['grand-ballroom'])
    const ordinary = SETUP_RECIPES.find((r: { id: string }) => r.id === 'ordinary-interior-01')!
    expect(ordinary.units).toEqual({ conventional: 1, lighting: 1 })
    expect([...ordinary.requiredSetTypes].sort()).toEqual(['apartment-interior', 'generic-interior'])
  })

  it('admits ballroom-reveal-lighting-01 for a production bound to a usable standing grand-ballroom Set on its own reserved stage', () => {
    const state = atBallroomRehearsal('r07-recipes-ballroom-ok')
    const productionId = state.studio.activeProductions[0]!.id
    const bindings = workflowOf(state).bindings
    expect(bindings.stageFacilityId).toBe(STAGE_7)
    const set = setById(state.sets, bindings.setId!)!
    expect(set.setType).toBe('grand-ballroom')
    expect(setIsUsable(set)).toBe(true)

    const admitted = selectRecipe(state, productionId, 'ballroom-reveal-lighting-01', 0)
    const record = workflowOf(admitted).setup!
    expect(record).not.toBeNull()
    expect(record.recipeId).toBe('ballroom-reveal-lighting-01')
    expect(record.stageFacilityId).toBe(STAGE_7)
    expect(record.setId).toBe(bindings.setId)
    expect(record.creditedUnits).toBe(0)
    expect(record.completedWeek).toBeNull()
  })

  it('admits ordinary-interior-01 for a production bound to the endowed generic-interior house Set', () => {
    const state = atOrdinaryRehearsal('r07-recipes-ordinary-ok')
    const productionId = state.studio.activeProductions[0]!.id
    const admitted = selectRecipe(state, productionId, 'ordinary-interior-01', 0)
    const record = workflowOf(admitted).setup!
    expect(record.recipeId).toBe('ordinary-interior-01')
    expect(record.requiredUnits).toBe(1) // conventional route by default (no lighting anywhere in this fixture)
  })

  it('refuses ballroom-reveal-lighting-01 for a production bound to the wrong Set type (generic-interior)', () => {
    const state = atOrdinaryRehearsal('r07-recipes-wrong-type-a')
    const productionId = state.studio.activeProductions[0]!.id
    expect(() => selectRecipe(state, productionId, 'ballroom-reveal-lighting-01', 0)).toThrow()
  })

  it('refuses ordinary-interior-01 for a production standing in the grand-ballroom — INTERPRETATION 2: "the same recipe cannot skip preparation by being called ordinary"', () => {
    const state = atBallroomRehearsal('r07-recipes-wrong-type-b')
    const productionId = state.studio.activeProductions[0]!.id
    expect(() => selectRecipe(state, productionId, 'ordinary-interior-01', 0)).toThrow()
  })

  it('refuses selection once the bound Set has become unusable — INTERPRETATION 3: directly-constructed edge state, no pure action sequence reaches it', () => {
    const state = atBallroomRehearsal('r07-recipes-unusable')
    const productionId = state.studio.activeProductions[0]!.id
    const setId = workflowOf(state).bindings.setId!
    const unusable: GameState = {
      ...state,
      sets: state.sets.map((set) => (set.id === setId ? { ...set, condition: TUNING.SET_CONDITION_UNUSABLE_THRESHOLD - 1 } : set)),
    }
    expect(setIsUsable(setById(unusable.sets, setId)!)).toBe(false)
    expect(() => selectRecipe(unusable, productionId, 'ballroom-reveal-lighting-01', 0)).toThrow()
  })

  it('refuses selection before any stage is bound (Development phase, bindings.stageFacilityId null)', () => {
    let state = withCash(operationsStudio('r07-recipes-no-stage'), 5_000_000)
    state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state) }])
    const productionId = state.studio.activeProductions[0]!.id
    expect(workflowOf(state).bindings.stageFacilityId).toBeNull()
    expect(() => selectRecipe(state, productionId, 'ordinary-interior-01', 0)).toThrow()
  })

  it('refuses selection after Shooting entry (a production that reached Shooting without ever selecting a recipe — today\'s only lawful post-Shooting production, since a selected recipe would itself hold the 6->5 transition once implemented)', () => {
    let state = atBallroomRehearsal('r07-recipes-after-shooting')
    state = tick(state) // today's engine: rehearsal(6) -> shooting(5), unconditionally (no gate exists yet)
    const productionId = state.studio.activeProductions[0]!.id
    expect(workflowOf(state).phase).toBe('shooting')
    expect(() => selectRecipe(state, productionId, 'ballroom-reveal-lighting-01', 0)).toThrow()
  })

  it('refuses a stale expectedPlanRevision, and leaves the existing record untouched', () => {
    const state = atBallroomRehearsal('r07-recipes-stale-revision')
    const productionId = state.studio.activeProductions[0]!.id
    const admitted = selectRecipe(state, productionId, 'ballroom-reveal-lighting-01', 0)
    const before = workflowOf(admitted).setup!
    expect(() => selectRecipe(admitted, productionId, 'ballroom-reveal-lighting-01', before.planRevision + 1)).toThrow()
    expect(() => selectRecipe(admitted, productionId, 'ballroom-reveal-lighting-01', before.planRevision - 1)).toThrow()
    // Wrong revision never mutates the record it failed to touch (thrown action, no committed state).
  })
})
