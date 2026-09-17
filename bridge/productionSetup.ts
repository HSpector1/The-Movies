/**
 * P13B-S5-R07 (projection 38) — the production SETUP read side.
 *
 * The engine owns every rule here. `src/core/productionSetup.ts` holds the recipe
 * catalogue, the route derivation and the reviewed verb; the weekly advance owns
 * admission and credit. This module publishes what that engine already decided
 * and asks it, by dry run, what it would refuse — it never re-states a rule, and
 * it never withholds a decision the engine would accept.
 */
import { applyActions } from '../src/core/actions.js'
import { campaignDate } from '../src/core/calendar.js'
import {
  deriveSetupProvenance,
  SETUP_RECIPES,
  setupForecast,
  setupRecipeById,
} from '../src/core/productionSetup.js'
import { setById } from '../src/core/sets.js'
import type {
  Action,
  GameState,
  ProductionSetupRecipeId,
  ProductionSetupRecord,
  ProductionSetupRoute,
} from '../src/core/types.js'
import type { AvailableIntent } from './protocol.ts'

export type SetProductionSetupRecipeAction = Extract<Action, { kind: 'setProductionSetupRecipe' }>

/** The workflow's own setup record, plus the two weeks a client cannot derive itself. */
export type BridgeProductionSetup = {
  recipeId: ProductionSetupRecipeId
  recipeLabel: string
  route: ProductionSetupRoute
  creditedUnits: number
  requiredUnits: number
  admittedWeek: number | null
  nextUnitWeek: number | null
  forecastShootingEntryWeek: number | null
  completedWeek: number | null
  adoptionId: string | null
  stageFacilityId: string
  setId: string
  planRevision: number
}

export type SetupRecipeActionSpec = {
  id: string
  productionId: string
  recipeId: ProductionSetupRecipeId
  planRevision: number
  action: SetProductionSetupRecipeAction
  label: string
  detail: string
  enabled: boolean
  disabledReason: string | null
  /**
   * The S4 disclosure pattern, sized to what this engine verb actually states:
   * `applySetProductionSetupRecipe` refuses by THROWING its primary refusal and
   * publishes no list, so this carries that ONE refusal rather than a list this
   * bridge assembled from rules it does not own. Empty exactly when the row is
   * actionable, so `enabled`, `disabledReason`, `refusal` and `rejections` can
   * never disagree.
   */
  rejections: string[]
  refusal: string | null
}

export type BridgeSetupRecipeAction = Omit<SetupRecipeActionSpec, 'action'> & {
  intent: AvailableIntent | null
}

export type ProductionSetupIntent = { spec: SetupRecipeActionSpec; option: AvailableIntent }

export function productionSetupSnapshot(record: ProductionSetupRecord): BridgeProductionSetup {
  const admitted = record.admittedWeek
  return {
    recipeId: record.recipeId,
    // The catalogue's own word. A record whose recipe left the catalogue cannot
    // be loaded (`validateProductionSetup` refuses it), so this never guesses.
    recipeLabel: setupRecipeById(record.recipeId)?.name ?? record.recipeId,
    route: record.route,
    creditedUnits: record.creditedUnits,
    requiredUnits: record.requiredUnits,
    admittedWeek: admitted,
    // One unit per eligible week AFTER admission (`advanceSetupWeek`), so the
    // next one falls the week after the last credit, or the week after admission
    // when nothing has credited yet. Null before admission (nothing is owed yet)
    // and once the setup is complete (nothing further is owed at all).
    nextUnitWeek: admitted === null || record.completedWeek !== null
      ? null
      : (record.lastCreditedWeek ?? admitted) + 1,
    forecastShootingEntryWeek: admitted === null ? null : setupForecast(admitted, record.requiredUnits),
    completedWeek: record.completedWeek,
    adoptionId: record.adoptionId,
    stageFacilityId: record.stageFacilityId,
    setId: record.setId,
    planRevision: record.planRevision,
  }
}

function statusLabelFor(setup: BridgeProductionSetup): string {
  if (setup.forecastShootingEntryWeek === null) {
    return `Setup planned: ${setup.recipeLabel}. The work begins when this week's rehearsal closes.`
  }
  return `Setup: ${String(setup.creditedUnits)} of ${String(setup.requiredUnits)} weeks done. ` +
    `Shooting begins ${campaignDate(setup.forecastShootingEntryWeek).label}.`
}

/**
 * Every setup-recipe decision this studio can reach, with the ENGINE's own refusal
 * on the rows it would not accept — the same dry run the Laboratory, Plans and
 * Office pages use. Cached per immutable state, exactly as `officeActionSpecs` is.
 *
 * Rows exist only where the engine's verb can be accepted at all: a managed
 * workflow still in rehearsal that holds both a stage and a Set. A picture that
 * has entered Shooting therefore publishes none — its setup plan is closed.
 */
const specsByState = new WeakMap<GameState, readonly SetupRecipeActionSpec[]>()
export function setupRecipeActionSpecs(state: GameState): readonly SetupRecipeActionSpec[] {
  const prior = specsByState.get(state)
  if (prior !== undefined) return prior
  const specs: SetupRecipeActionSpec[] = []
  if (state.operations.mode !== 'managed') {
    specsByState.set(state, specs)
    return specs
  }
  for (const workflow of state.operations.workflows) {
    const stageFacilityId = workflow.bindings.stageFacilityId
    const setId = workflow.bindings.setId
    if (workflow.phase !== 'rehearsal' || stageFacilityId === null || setId === null) continue
    const stageName = state.operations.facilities.find(facility => facility.id === stageFacilityId)?.name
      ?? stageFacilityId
    const set = setById(state.sets, setId)
    for (const recipe of SETUP_RECIPES) {
      const action: SetProductionSetupRecipeAction = {
        kind: 'setProductionSetupRecipe',
        productionId: workflow.productionId,
        recipeId: recipe.id,
        expectedPlanRevision: workflow.planRevision,
      }
      let refusal: string | null = null
      try {
        const after = applyActions(state, [action]).operations.workflows
          .find(candidate => candidate.productionId === workflow.productionId)
        // The engine treats a resend of the SAME plan as the same plan and
        // returns the record untouched. Nothing would move, so this row is not a
        // decision — and saying so is more honest than accepting a commit that
        // changes nothing.
        if (after === undefined || after.setup === workflow.setup) {
          refusal = 'This production’s setup plan already names this recipe on this stage and Set.'
        }
      } catch (error) {
        refusal = (error as Error).message
      }
      // The route is derived by the engine at today's week; admission re-derives
      // it, so this is a quote of the route as it stands, never a promise.
      const provenance = deriveSetupProvenance(state, recipe, stageFacilityId, state.market.tick)
      const halved = provenance.route === 'lighting'
        ? ' Its operational lighting adoption on this exact stage earns the shorter route.'
        : ''
      specs.push({
        // A production id ALREADY contains hyphens: the recipe id is appended, never parsed back out.
        id: `setup-recipe-${workflow.productionId}-${recipe.id}`,
        productionId: workflow.productionId,
        recipeId: recipe.id,
        planRevision: workflow.planRevision,
        action,
        label: `Plan ${recipe.name}`,
        detail: `${String(provenance.requiredUnits)} weeks of setup on the ${provenance.route} route, ` +
          `on ${stageName}${set === null ? '' : ` using the ${set.name}`}, before this picture enters Shooting.${halved}`,
        enabled: refusal === null,
        disabledReason: refusal,
        rejections: refusal === null ? [] : [refusal],
        refusal,
      })
    }
  }
  specsByState.set(state, specs)
  return specs
}

/**
 * The projection-38 members on each production row. Composed at the bridge
 * boundary over the broad lot selector's own rows, so the browser's snapshot and
 * the adapter's projection stay untouched.
 *
 * `weeksRemaining` follows the FORECAST while a setup holds the picture:
 * `remainingTicks` is frozen at 6 for the whole hold (the sweep deliberately does
 * not call `enterPhase`), so publishing it every week would state a countdown
 * that never counts. Nothing is clamped — a forecast behind the current week
 * would fail the wire's own non-negative bound loudly rather than read plausibly.
 */
export function withProductionSetupRows<
  TRow extends { productionId: string; weeksRemaining: number; statusLabel: string },
>(
  state: GameState,
  rows: readonly TRow[],
  intents: readonly ProductionSetupIntent[],
): Array<TRow & { setup: BridgeProductionSetup | null; setupRecipeActions: BridgeSetupRecipeAction[] }> {
  const options = new Map(intents.map(intent => [intent.spec.id, intent.option]))
  const specs = setupRecipeActionSpecs(state)
  return rows.map(row => {
    const record = state.operations.workflows
      .find(workflow => workflow.productionId === row.productionId)?.setup ?? null
    const setup = record === null ? null : productionSetupSnapshot(record)
    const holding = setup !== null && setup.completedWeek === null
    return {
      ...row,
      weeksRemaining: holding && setup.forecastShootingEntryWeek !== null
        ? setup.forecastShootingEntryWeek - state.market.tick
        : row.weeksRemaining,
      statusLabel: holding ? statusLabelFor(setup) : row.statusLabel,
      setup,
      setupRecipeActions: specs
        .filter(spec => spec.productionId === row.productionId)
        .map(({ action: _action, ...spec }) => ({
          ...spec,
          // Published only for a row the current authority would actually accept,
          // exactly as the Office and Laboratory pages publish theirs.
          intent: options.get(spec.id) ?? null,
        })),
    }
  })
}
