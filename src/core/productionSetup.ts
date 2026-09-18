// ── Production setup recipes and the setup subtask (P13B-S5-R07) ─────────────
//
// LAW: a production whose plan names a setup recipe spends real WEEKS preparing
// its stage between rehearsal and Shooting. The recipes are DATA: what a
// location demands (the Set types it can be built on) and how many setup units
// it costs by route. The lighting route halves the Ballroom reveal, and it is
// earned by exactly one thing — an operational lighting adoption on the EXACT
// stage this picture is bound to, whose equipment this studio still holds.
// Knowledge alone, the Laboratory module, a different stage, and an installation
// still going in do not qualify, and none of them is worth a discount the studio
// has not built.
//
// This module owns the catalogue, the route derivation, the reviewed selection
// verb and the live validator. `operations.ts` owns the weekly credit and the
// hold (it imports TYPES from here only, through `types.ts`); `save.ts` calls
// `validateProductionSetup` at the V25 boundary so a forged record cannot be
// loaded from a file either.

import { setById, setIsUsable } from './sets.js'
import { adoptionChainOperational } from './technologyAdoption.js'
import type { TechnologyAdoption, TechnologyId } from './technologyTypes.js'
import type {
  Action,
  GameState,
  ProductionSetupProvenance,
  ProductionSetupRecipeId,
  ProductionSetupRecord,
  ProductionWorkflow,
  SetTypeId,
} from './types.js'

export type ProductionSetupRecipe = {
  id: ProductionSetupRecipeId
  name: string
  /** The Set types this recipe can lawfully be built on. Closed, and disjoint per recipe. */
  requiredSetTypes: readonly SetTypeId[]
  /** Setup units by route — the lighting figure is the halved one. */
  units: { conventional: number; lighting: number }
  /** The technology whose operational adoption on the bound stage earns the lighting route. */
  technologyId: TechnologyId
}

/**
 * The two adopted recipes, in stable order (candidate tuning, not final balance).
 *
 * There is NO size class here. The engine has no Set size classification at all
 * — every Set it can build is the neutral standard class — and CAT-011's
 * oversized Sets stay OPEN with their own owner, so a "wrong size" refusal would
 * be a rule about a fact this build cannot state.
 */
export const SETUP_RECIPES: readonly ProductionSetupRecipe[] = Object.freeze([
  Object.freeze({
    id: 'ballroom-reveal-lighting-01',
    name: 'Ballroom reveal — foreground, entrance and background lighting cues',
    requiredSetTypes: Object.freeze(['grand-ballroom']) as readonly SetTypeId[],
    units: Object.freeze({ conventional: 4, lighting: 2 }),
    technologyId: 'lighting-control-01',
  }),
  Object.freeze({
    id: 'ordinary-interior-01',
    name: 'Ordinary single-zone interior',
    requiredSetTypes: Object.freeze(['generic-interior', 'apartment-interior']) as readonly SetTypeId[],
    units: Object.freeze({ conventional: 1, lighting: 1 }),
    technologyId: 'lighting-control-01',
  }),
]) as readonly ProductionSetupRecipe[]

export function setupRecipeById(recipeId: string): ProductionSetupRecipe | null {
  return SETUP_RECIPES.find((recipe) => recipe.id === recipeId) ?? null
}

/**
 * The week a setup admitted at `admittedWeek` reaches Shooting: one unit per
 * eligible week after admission, so entry = admission + units. The admission
 * week itself earns nothing — it is the week the rehearsal work finished.
 */
export function setupForecast(admittedWeek: number, requiredUnits: number): number {
  return admittedWeek + requiredUnits
}

function playerStudioId(state: GameState): string | null {
  return state.hollywood?.playerStudioId ?? null
}

function workflowOf(state: GameState, productionId: string): ProductionWorkflow | null {
  return state.operations.workflows.find((workflow) => workflow.productionId === productionId) ?? null
}

/**
 * The adoption a lighting claim on this exact stage stands on, or null.
 *
 * Every clause is required and none is a proxy for another: the studio's own
 * acquired access, ITS adoption on THIS stage, operational by `week`, the P09
 * fit-out actually completed on that stage (S5's own chain check), and the
 * equipment asset still HELD by that adoption.
 */
function lightingAdoption(
  state: GameState,
  studioId: string | null,
  technologyId: TechnologyId,
  stageFacilityId: string,
  week: number,
): TechnologyAdoption | null {
  if (studioId === null) return null
  const access = state.technology.access.some(
    (row) =>
      row.studioId === studioId &&
      row.technologyId === technologyId &&
      row.acquiredWeek !== null &&
      row.acquiredWeek <= week,
  )
  if (!access) return null
  const adoption = state.technology.adoptions.find(
    (row) =>
      row.studioId === studioId &&
      row.technologyId === technologyId &&
      row.stageFacilityId === stageFacilityId &&
      row.operationalWeek !== null &&
      row.operationalWeek <= week,
  )
  if (adoption === undefined) return null
  // The completed, non-cancelled fit-out on that exact body, read through S5's
  // own chain authority rather than a second copy of the rule. P13B-S8: that
  // authority resolves PER STUDIO — the player's chain is its placements; a rival
  // owns none, so its own deployment clock (already read above) and its held
  // equipment are what stand behind the claim.
  if (!adoptionChainOperational(state, adoption)) return null
  const held = state.technology.equipment.some(
    (asset) =>
      asset.id === adoption.equipmentAssetId &&
      asset.studioId === studioId &&
      asset.holderAdoptionId === adoption.id,
  )
  return held ? adoption : null
}

/** Route, provenance and unit count for one recipe on one stage, as of `week`. */
export function deriveSetupProvenance(
  state: GameState,
  recipe: ProductionSetupRecipe,
  stageFacilityId: string,
  week: number,
  // P13B-S8 (audit item 5): whose stage this is. The default is the player, so
  // both existing call sites are unchanged; a rival production asks about its own
  // plant and one studio's adoption is never mistaken for another's.
  studioId: string | null = playerStudioId(state),
): ProductionSetupProvenance {
  const adoption = lightingAdoption(state, studioId, recipe.technologyId, stageFacilityId, week)
  if (adoption === null) {
    return { route: 'conventional', adoptionId: null, equipmentAssetId: null, requiredUnits: recipe.units.conventional }
  }
  return {
    route: 'lighting',
    adoptionId: adoption.id,
    equipmentAssetId: adoption.equipmentAssetId,
    requiredUnits: recipe.units.lighting,
  }
}

/**
 * The resolver the weekly advance consults at setup admission. Bound to the
 * state the advance began from, exactly like the technology policy beside it.
 */
export function createProductionSetupRouteResolver(state: GameState) {
  return (input: { stageFacilityId: string; recipeId: ProductionSetupRecipeId; week: number }): ProductionSetupProvenance => {
    const recipe = setupRecipeById(input.recipeId)
    if (recipe === null) {
      throw new Error(`tick: production setup names unknown recipe ${JSON.stringify(input.recipeId)}`)
    }
    return deriveSetupProvenance(state, recipe, input.stageFacilityId, input.week)
  }
}

/** Retained prior work, flattened: one linear history, never a nest of nests. */
function withPriorWork(
  previous: ProductionSetupRecord,
  record: Omit<ProductionSetupRecord, 'priorWork'>,
): ProductionSetupRecord {
  return {
    ...record,
    priorWork: [...previous.priorWork, { ...previous, priorWork: [] }],
  }
}

/**
 * P13B-S5-R07: the reviewed setup-plan verb. Refuses by THROWING, the same
 * convention every reviewed studio verb already uses.
 */
export function applySetProductionSetupRecipe(
  state: GameState,
  action: Extract<Action, { kind: 'setProductionSetupRecipe' }>,
): GameState {
  const recipe = setupRecipeById(action.recipeId)
  if (recipe === null) throw new Error('That setup recipe is not in this studio’s catalogue.')
  const production = state.studio.activeProductions.find((entry) => entry.id === action.productionId)
  if (production === undefined) throw new Error('That production is not active in this campaign.')
  const workflow = workflowOf(state, action.productionId)
  if (workflow === null || state.operations.mode !== 'managed') {
    throw new Error('This production has no managed workflow.')
  }
  if (workflow.phase !== 'rehearsal') {
    if (workflow.phase === 'development' || workflow.phase === 'preProduction') {
      throw new Error('This film has no stage yet. A setup plan is reviewed once rehearsal holds its stage and Set.')
    }
    throw new Error('This film has entered the filming phase. A setup plan is reviewed before Shooting entry, and cannot be changed after it.')
  }
  const stageFacilityId = workflow.bindings.stageFacilityId
  const setId = workflow.bindings.setId
  if (stageFacilityId === null || setId === null) {
    throw new Error('This film has no stage yet. A setup plan is reviewed once rehearsal holds its stage and Set.')
  }
  if (action.expectedPlanRevision !== workflow.planRevision) {
    throw new Error('This production plan has changed since this recipe was reviewed. Review the current plan and choose again.')
  }
  const set = setById(state.sets, setId)
  if (set === null || !setIsUsable(set)) {
    throw new Error('This film’s Set is not standing and usable. Repair or rebuild it before planning its setup.')
  }
  if (set.mountedOn !== stageFacilityId) {
    throw new Error('This film’s Set does not stand on the stage it reserved.')
  }
  if (!recipe.requiredSetTypes.includes(set.setType)) {
    throw new Error(`${recipe.name} needs a different location. This film stands on a ${set.setType} Set.`)
  }
  const previous = workflow.setup
  if (previous !== null && previous.completedWeek !== null) {
    throw new Error('This film’s setup is already complete.')
  }
  // A resent command for the SAME recipe on the SAME binding is the same plan,
  // not a new one: it neither restarts the work nor credits a week for asking.
  if (
    previous !== null &&
    previous.recipeId === recipe.id &&
    previous.stageFacilityId === stageFacilityId &&
    previous.setId === setId
  ) {
    return state
  }
  const provenance = deriveSetupProvenance(state, recipe, stageFacilityId, state.market.tick)
  const fresh: Omit<ProductionSetupRecord, 'priorWork'> = {
    recipeId: recipe.id,
    planRevision: workflow.planRevision,
    admittedWeek: null,
    route: provenance.route,
    adoptionId: provenance.adoptionId,
    equipmentAssetId: provenance.equipmentAssetId,
    stageFacilityId,
    setId,
    requiredUnits: provenance.requiredUnits,
    creditedUnits: 0,
    lastCreditedWeek: null,
    completedWeek: null,
  }
  // A different recipe is a DIFFERENT, revalidated plan: a new record, with the
  // work already done kept in history and never recycled into its credit.
  const record: ProductionSetupRecord = previous === null ? { ...fresh, priorWork: [] } : withPriorWork(previous, fresh)
  return {
    ...state,
    operations: {
      ...state.operations,
      workflows: state.operations.workflows.map((candidate) =>
        candidate.productionId === action.productionId ? { ...candidate, setup: record } : candidate,
      ),
    },
  }
}

function checkRecordShape(
  state: GameState,
  label: string,
  record: ProductionSetupRecord,
  violations: string[],
): void {
  const recipe = setupRecipeById(record.recipeId)
  if (recipe === null) {
    violations.push(`${label}: names unknown recipe ${JSON.stringify(record.recipeId)}`)
    return
  }
  if (record.requiredUnits !== recipe.units[record.route]) {
    violations.push(
      `${label}: requiredUnits ${String(record.requiredUnits)} is not the ${record.route} cost of ${record.recipeId}`,
    )
  }
  if (record.creditedUnits < 0 || record.creditedUnits > record.requiredUnits) {
    violations.push(`${label}: creditedUnits ${String(record.creditedUnits)} is outside 0..${String(record.requiredUnits)}`)
  }
  if (record.admittedWeek === null) {
    if (record.creditedUnits !== 0 || record.lastCreditedWeek !== null || record.completedWeek !== null) {
      violations.push(`${label}: credits work it was never admitted for`)
    }
  } else {
    if (record.lastCreditedWeek !== null && record.lastCreditedWeek <= record.admittedWeek) {
      violations.push(`${label}: credited a unit in the admission week or earlier`)
    }
    if (record.creditedUnits > 0 && record.lastCreditedWeek === null) {
      violations.push(`${label}: credits units with no credited week`)
    }
    if (record.completedWeek !== null) {
      if (record.creditedUnits !== record.requiredUnits) {
        violations.push(`${label}: completed with ${String(record.creditedUnits)} of ${String(record.requiredUnits)} units`)
      }
      if (record.completedWeek !== record.lastCreditedWeek) {
        violations.push(`${label}: completedWeek disagrees with the last credited week`)
      }
      if (setupForecast(record.admittedWeek, record.requiredUnits) !== record.completedWeek) {
        violations.push(`${label}: completedWeek ${String(record.completedWeek)} is not admission + units`)
      }
    }
  }
  // Route provenance, re-derived at the week it was admitted against.
  const week = record.admittedWeek ?? state.market.tick
  if (record.route === 'lighting') {
    const adoption = lightingAdoption(state, playerStudioId(state), recipe.technologyId, record.stageFacilityId, week)
    if (adoption === null || adoption.id !== record.adoptionId) {
      violations.push(
        `${label}: route "lighting" is not re-derivable on ${record.stageFacilityId} at week ${String(week)}`,
      )
    } else if (record.equipmentAssetId !== adoption.equipmentAssetId) {
      violations.push(`${label}: names an equipment asset that adoption does not hold`)
    }
  } else if (record.adoptionId !== null || record.equipmentAssetId !== null) {
    violations.push(`${label}: the conventional route names an adoption or equipment asset`)
  }
  for (let i = 0; i < record.priorWork.length; i++) {
    const prior = record.priorWork[i]!
    if (prior.creditedUnits < 0 || prior.creditedUnits > prior.requiredUnits) {
      violations.push(`${label}.priorWork[${String(i)}]: creditedUnits is outside its own bounds`)
    }
    if (prior.priorWork.length > 0) {
      violations.push(`${label}.priorWork[${String(i)}]: nests further prior work`)
    }
  }
}

/**
 * The live invariant: every setup record on this state is one the engine could
 * have written. Returns the violations it found, empty when the state is clean.
 *
 * A forged operational flag is exactly what it refuses: a record claiming the
 * lighting route without an operational adoption on its own bound stage names a
 * discount this studio never built.
 */
export function validateProductionSetup(state: GameState): string[] {
  const violations: string[] = []
  const workflows = state.operations?.workflows ?? []
  for (let index = 0; index < workflows.length; index++) {
    const workflow = workflows[index]!
    const record = workflow.setup ?? null
    if (!Number.isInteger(workflow.planRevision) || workflow.planRevision < 0) {
      violations.push(`workflows[${String(index)}]: planRevision is not a non-negative integer`)
    }
    if (record === null) continue
    const label = `workflows[${String(index)}].setup`
    if (workflow.phase === 'development' || workflow.phase === 'preProduction') {
      violations.push(`${label}: a production that holds no stage carries a setup record`)
    }
    if (workflow.phase !== 'rehearsal' && record.completedWeek === null) {
      violations.push(`${label}: an unfinished setup stands on a production that has left rehearsal`)
    }
    if (record.stageFacilityId !== workflow.bindings.stageFacilityId || record.setId !== workflow.bindings.setId) {
      violations.push(`${label}: names a stage or Set this production is not bound to`)
    }
    if (record.planRevision > workflow.planRevision) {
      violations.push(`${label}: was reviewed against a later plan revision than this plan has`)
    }
    checkRecordShape(state, label, record, violations)
  }
  return violations
}
