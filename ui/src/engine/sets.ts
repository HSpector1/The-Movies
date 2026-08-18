// ═════════════════════════════════════════════════════════════════════════════
// C2a-M2 — THE SET A PICTURE STANDS ON (charter §3.1; the §12-M2 LEGIBILITY gate)
// ═════════════════════════════════════════════════════════════════════════════
//
// A picture no longer merely occupies a soundstage: it stands on a NAMED SET, and
// which set it stands on changes what the film becomes and how many people turn up.
// The gate this module exists for is stated in §12-M2 — "the package/greenlight
// surface names the bound set and shows quality/novelty/condition/fit with the
// projected uplift" — so every number below arrives with the facts that produced it.
//
// ── WHY THIS IS A SIBLING OF `adapter.ts` AND NOT A SECTION INSIDE IT ────────
//
// The UI/core boundary is one LAYER (`ui/src/engine/`), and `adapter.ts` is its
// original and principal module: no component may import `src/core` directly, and
// none does. This module is the second module of that same layer, and it exists as
// a separate file for an ownership reason rather than an architectural one — the
// C2a-M2 SCREENS and WORLD lanes both land in this milestone, and `adapter.ts` is
// the WORLD lane's write surface for the lot snapshot's own set projection. Two
// lanes writing one 7,000-line file is exactly the "one writer per shared surface"
// violation the campaign laws forbid. Folding this back into `adapter.ts` after
// both lanes have sealed is a pure move with no semantic content, and is recorded
// as such rather than done half-way now.
//
// NOTHING HERE IS A FORMULA. quality/novelty/condition are the set's own persisted
// stats; fit is `setGenreFit`; the uplift is `setBindingUplift`; the draw multiplier
// is `setNoveltyReceptionFactor`; every refusal sentence is the engine's own
// `set*RefusalCopy`. This module's whole job is to gather them for ONE picture at
// ONE moment, and to name which set the studio WOULD use — never to decide.
//
// THE PLAN IS A PREDICTION, AND EVERY SENTENCE BUILT ON IT SAYS SO. Binding happens
// atomically with the stage at REHEARSAL ENTRY, weeks after greenlight, so
// `planned` answers "if the lot stood as it does today". It mirrors the allocator's
// own walk exactly — facilities ascending by id, the first stage with a free
// production slot that carries a bindable set — and a test greenlights a picture,
// advances it into rehearsal and asserts the set the ENGINE bound is the set this
// predicted. A prediction nobody checks is a lie with a schedule.
//
// FIT IS ADVISORY, NEVER A GATE (§3.1). Any set can shoot any picture; a poorly
// matched set costs uplift and refuses nothing. No value in this module, and no
// surface reading it, may present set demand as a blocker.

import {
  SET_BLUEPRINTS,
  TUNING,
  applyActions,
  bindableSetsOnStage,
  clamp,
  commissionSetRefusal as coreCommissionSetRefusal,
  facilitySlotKey,
  hasFreeSceneryCapacity,
  occupiedResourceSlots,
  productionBoundToSet,
  repairSetRefusal as coreRepairSetRefusal,
  setBindingUplift,
  setBlueprintById,
  setCommissionRefusalCopy,
  setDemolitionRefund,
  setGenreFit,
  setIsUnderRepair,
  setIsUsable,
  setMountedOn,
  setNoveltyReceptionFactor,
  setRepairRefusalCopy,
  setStrikeRefusalCopy,
  setTypeLabel,
  strikeSetRefusal as coreStrikeSetRefusal,
} from '../../../src/core/index.ts'
import type {
  GameState,
  Genre,
  SetBlueprint,
  SetRefusalCopy,
  StudioSet,
} from '../../../src/core/index.ts'
import type { ActionOutcome } from './adapter.ts'

export type { SetBlueprint, SetRefusalCopy, StudioSet }

/** What a set's condition MEANS, so no surface has to re-read the threshold. */
export type SetConditionBand = 'sound' | 'wearing' | 'unusable'

/**
 * A set's state in the studio's own words. `building` and `repairing` are told
 * apart because the remedies differ and because the engine already distinguishes
 * them (`setIsUnderRepair`); `struck` is the retired arm.
 */
export type SetStandingStatus = 'standing' | 'building' | 'repairing' | 'struck'

/** ONE set, as a player sees it. Every field is the engine's own answer. */
export type StudioSetView = {
  setId: string
  /** The set's own name — its identity to a player, and what the ledger calls it. */
  name: string
  /** "City Street", "Standing Interior" — the location, never the type id. */
  locationLabel: string
  blueprintId: string
  stageFacilityId: string
  /** The engine facility name — the single spoken authority (§3.1). */
  stageName: string
  status: SetStandingStatus
  /** Weeks of scenery work still owed, or null when nothing is under way. */
  weeksRemaining: number | null
  /** 0..100 — how well this place is built. */
  quality: number
  /** 0..1 — how fresh it is to an audience. */
  novelty: number
  /** 0..100 — how much wear the scenery carries. */
  condition: number
  conditionBand: SetConditionBand
  /** Standing AND in good enough repair to shoot on today. */
  usable: boolean
  /** The production filming on it right now, or null. */
  occupiedByProductionId: string | null
  /** What striking it would return to the studio. */
  strikeRefund: number
}

/** How one set suits ONE picture, with the two effects that follow from it. */
export type SetPictureFitView = {
  /** The genre the fit is measured against, or null when the concept resolves none. */
  genre: Genre | null
  /** 0..1 — the authored weight plus the priority bonus, clamped (`setGenreFit`). */
  fit: number
  /** True when this place was built FOR this picture's genre. */
  builtForThisGenre: boolean
  /** The genre this set was built for, whatever the picture is. */
  priorityGenre: Genre
  /** Craft points the set's quality contributes. */
  qualityPoints: number
  /** Craft points the set's genre fit contributes. */
  fitPoints: number
  /** Their sum — the ONE bounded uplift, locked at bind (`setBindingUplift`). */
  upliftPoints: number
  /** The multiplier this set's novelty puts on the opening (`setNoveltyReceptionFactor`). */
  noveltyFactor: number
}

export type SetCandidateView = StudioSetView & SetPictureFitView

/**
 * Why no set is planned for this picture, with the facts a remedy needs.
 *
 * These refine the two refusals the allocator itself produces — a picture with no
 * free stage waits on a BUILDING; a picture with a free stage and no scenery on it
 * waits on a SET — by WHICH of the four conditions is true of the first free stage,
 * because "build one", "wait three weeks", "repair that one" and "wait for the
 * picture on it to wrap" are four different things to do.
 */
export type SetPlanBlock =
  | { code: 'noStages' }
  | { code: 'stagesBusy' }
  | { code: 'stageBare'; stageName: string }
  | { code: 'setBuilding'; stageName: string; setName: string; weeksRemaining: number | null }
  | { code: 'setWorn'; stageName: string; setName: string; condition: number }
  | { code: 'setInUse'; stageName: string; setName: string }

export type PackageSetPlanView = {
  /** Would a picture greenlit right now be required to stand on a set at all? */
  required: boolean
  genre: Genre | null
  /** The set the lot would send this picture to, if it stood as it does today. */
  planned: SetCandidateView | null
  /** Why not, when there is no plan. Null exactly when `planned` is present. */
  block: SetPlanBlock | null
  /** Every standing set, scored for this picture, in the studio's own order. */
  standing: SetCandidateView[]
  /** Sets the scenery crews are still working on, scored the same way. */
  underWork: SetCandidateView[]
  /** The best uplift any STANDING set could give this picture today. */
  bestStandingUplift: number
  /** The most any set could ever give: SET_QUALITY_UPLIFT_MAX + SET_GENRE_FIT_UPLIFT_MAX. */
  maxUplift: number
  /** The best uplift the catalogue could reach for it, if the studio built for it. */
  bestBuildableUplift: number
  /** The catalogue entry that would reach `bestBuildableUplift`, or null. */
  bestBuildable: SetOfferView | null
}

/** The bounds every set number lives inside, published once so no surface guesses. */
export const SET_UPLIFT_MAX = TUNING.SET_QUALITY_UPLIFT_MAX + TUNING.SET_GENRE_FIT_UPLIFT_MAX
export const SET_QUALITY_UPLIFT_MAX = TUNING.SET_QUALITY_UPLIFT_MAX
export const SET_GENRE_FIT_UPLIFT_MAX = TUNING.SET_GENRE_FIT_UPLIFT_MAX
export const SET_NOVELTY_FACTOR_MIN = TUNING.SET_NOVELTY_RECEPTION_FACTOR_MIN
export const SET_CONDITION_UNUSABLE_THRESHOLD = TUNING.SET_CONDITION_UNUSABLE_THRESHOLD
export const SET_CONDITION_WEAR_PER_PRODUCTION = TUNING.SET_CONDITION_WEAR_PER_PRODUCTION
export const SET_NOVELTY_DEPLETION_PER_RELEASE = TUNING.SET_NOVELTY_DEPLETION_PER_RELEASE
export const SET_REPAIR_COST = TUNING.SET_REPAIR_COST
export const SET_REPAIR_WEEKS = TUNING.SET_REPAIR_WEEKS

function setConditionBand(set: StudioSet): SetConditionBand {
  if (set.condition < TUNING.SET_CONDITION_UNUSABLE_THRESHOLD) return 'unusable'
  return set.condition >= TUNING.SET_CONDITION_INITIAL ? 'sound' : 'wearing'
}

function setStandingStatus(set: StudioSet): SetStandingStatus {
  if (set.status === 'retired') return 'struck'
  if (set.status === 'standing') return 'standing'
  return setIsUnderRepair(set) ? 'repairing' : 'building'
}

function stageNameOf(state: GameState, facilityId: string): string {
  return (
    state.operations.facilities.find((facility) => facility.id === facilityId)?.name ?? facilityId
  )
}

/** ONE set, projected. Pure gathering: no number the engine owns is recomputed here. */
export function studioSetView(state: GameState, set: StudioSet): StudioSetView {
  const blueprint = setBlueprintById(set.blueprintId)
  return {
    setId: set.id,
    name: set.name,
    locationLabel: setTypeLabel(set.setType),
    blueprintId: set.blueprintId,
    stageFacilityId: set.mountedOn,
    stageName: stageNameOf(state, set.mountedOn),
    status: setStandingStatus(set),
    weeksRemaining:
      set.status === 'under-construction' && set.completesWeek !== null
        ? Math.max(0, set.completesWeek - state.market.tick)
        : null,
    quality: set.quality,
    novelty: set.novelty,
    condition: set.condition,
    conditionBand: setConditionBand(set),
    usable: setIsUsable(set),
    occupiedByProductionId: productionBoundToSet(state, set.id),
    strikeRefund: blueprint === null ? 0 : setDemolitionRefund(blueprint),
  }
}

function setPictureFit(set: StudioSet, genre: Genre | null): SetPictureFitView {
  const fit = setGenreFit(set, genre)
  return {
    genre,
    fit,
    builtForThisGenre: genre !== null && set.priorityGenre === genre,
    priorityGenre: set.priorityGenre,
    qualityPoints: TUNING.SET_QUALITY_UPLIFT_MAX * clamp(set.quality / 100, 0, 1),
    fitPoints: TUNING.SET_GENRE_FIT_UPLIFT_MAX * fit,
    upliftPoints: setBindingUplift(set, genre),
    noveltyFactor: setNoveltyReceptionFactor(set.novelty),
  }
}

/** ONE set, scored for ONE picture. */
export function setCandidateView(
  state: GameState,
  set: StudioSet,
  genre: Genre | null,
): SetCandidateView {
  return { ...studioSetView(state, set), ...setPictureFit(set, genre) }
}

/** The stages the studio owns, ascending by id — the allocator's own walk order. */
function stagesInAllocationOrder(state: GameState) {
  return state.operations.facilities
    .filter((facility) => facility.capability === 'soundstage')
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
}

/**
 * Whether a stage has a production slot free right now.
 *
 * The MOUNT slot is deliberately not consulted: a mounted set never consumes the
 * production slot (§3.1), so a dressed stage nobody is filming on is a free stage.
 */
function stageHasFreeProductionSlot(
  facilityId: string,
  capacity: number,
  occupied: ReadonlySet<string>,
): boolean {
  for (let slot = 0; slot < capacity; slot++) {
    if (!occupied.has(facilitySlotKey(facilityId, slot))) return true
  }
  return false
}

/**
 * The set a picture greenlit now would stand on, if the lot stood as it does today
 * — and, when there is none, the most fundamental reason why.
 *
 * The walk MIRRORS `allocateForPhase`: stages ascending by id, the first one with a
 * free production slot carrying a bindable set wins, and its first candidate is the
 * one bound (a stage carries at most one set in V1, so "first candidate" IS the
 * whole rule). The mirror is proved by test against a real greenlight, not asserted.
 */
export function packageSetPlan(state: GameState, genre: Genre | null): PackageSetPlanView {
  const required = state.operations.mode === 'managed' && state.nextSetId > 0
  const live = state.sets.filter((set) => set.status !== 'retired')
  const standing = live
    .filter((set) => set.status === 'standing')
    .map((set) => setCandidateView(state, set, genre))
  const underWork = live
    .filter((set) => set.status === 'under-construction')
    .map((set) => setCandidateView(state, set, genre))
  const bestBuildable = setOffersFor(genre).reduce<SetOfferView | null>(
    (best, offer) => (best === null || offer.upliftPoints > best.upliftPoints ? offer : best),
    null,
  )
  const base = {
    required,
    genre,
    standing,
    underWork,
    bestStandingUplift: standing.reduce((best, set) => Math.max(best, set.upliftPoints), 0),
    maxUplift: SET_UPLIFT_MAX,
    bestBuildableUplift: bestBuildable?.upliftPoints ?? 0,
    bestBuildable,
  }

  const stages = stagesInAllocationOrder(state)
  if (stages.length === 0) {
    return { ...base, planned: null, block: required ? { code: 'noStages' } : null }
  }
  const occupied = new Set(occupiedResourceSlots(state, { owners: ['production'] }).keys())
  let firstFreeStage: { id: string; name: string } | null = null
  for (const stage of stages) {
    if (!stageHasFreeProductionSlot(stage.id, stage.capacity, occupied)) continue
    if (firstFreeStage === null) firstFreeStage = { id: stage.id, name: stage.name }
    const chosen = bindableSetsOnStage(state, stage.id)[0]
    if (chosen === undefined) continue
    return { ...base, planned: setCandidateView(state, chosen, genre), block: null }
  }

  // No plan. The reason is read off the FIRST free stage, because that is the stage
  // the allocator reached — and its own condition is what a remedy would act on.
  if (firstFreeStage === null) return { ...base, planned: null, block: { code: 'stagesBusy' } }
  const mounted = setMountedOn(state.sets, firstFreeStage.id)
  if (mounted === null) {
    return { ...base, planned: null, block: { code: 'stageBare', stageName: firstFreeStage.name } }
  }
  if (mounted.status === 'under-construction') {
    return {
      ...base,
      planned: null,
      block: {
        code: 'setBuilding',
        stageName: firstFreeStage.name,
        setName: mounted.name,
        weeksRemaining:
          mounted.completesWeek === null
            ? null
            : Math.max(0, mounted.completesWeek - state.market.tick),
      },
    }
  }
  if (!setIsUsable(mounted)) {
    return {
      ...base,
      planned: null,
      block: {
        code: 'setWorn',
        stageName: firstFreeStage.name,
        setName: mounted.name,
        condition: mounted.condition,
      },
    }
  }
  return {
    ...base,
    planned: null,
    block: { code: 'setInUse', stageName: firstFreeStage.name, setName: mounted.name },
  }
}

// ── The Scenery Shop's own board: what the studio may build, and where ───────

/** ONE catalogue entry, scored against the genre asked about. */
export type SetOfferView = {
  blueprintId: string
  name: string
  locationLabel: string
  quality: number
  cost: number
  buildWeeks: number
  priorityGenre: Genre
  /** 0..1 against the genre asked about; 0 when no genre was named. */
  fit: number
  builtForThisGenre: boolean
  /** What a set built from this blueprint would give a picture of that genre. */
  upliftPoints: number
}

function offerFromBlueprint(blueprint: SetBlueprint, genre: Genre | null): SetOfferView {
  // The catalogue's own weights, read through the SAME engine functions a standing
  // set is scored with, by shaping the blueprint into the set it would become. Only
  // the three fields those functions read are supplied; nothing else is invented.
  const asBuilt: Pick<StudioSet, 'genreWeights' | 'priorityGenre' | 'quality'> = {
    genreWeights: blueprint.genreWeights,
    priorityGenre: blueprint.priorityGenre,
    quality: blueprint.quality,
  }
  return {
    blueprintId: blueprint.id,
    name: blueprint.name,
    locationLabel: setTypeLabel(blueprint.setType),
    quality: blueprint.quality,
    cost: blueprint.capex,
    buildWeeks: blueprint.buildWeeks,
    priorityGenre: blueprint.priorityGenre,
    fit: setGenreFit(asBuilt as StudioSet, genre),
    builtForThisGenre: genre !== null && blueprint.priorityGenre === genre,
    upliftPoints: setBindingUplift(asBuilt as StudioSet, genre),
  }
}

/** The whole authored catalogue, in the engine's own order, scored for one genre. */
export function setOffersFor(genre: Genre | null): SetOfferView[] {
  return SET_BLUEPRINTS.map((blueprint) => offerFromBlueprint(blueprint, genre))
}

/** A stage, and whatever is standing (or going up) on it. */
export type SceneryStageView = {
  stageFacilityId: string
  stageName: string
  mounted: StudioSetView | null
}

export type SceneryBoardView = {
  /** Managed operations with at least one soundstage — the board says nothing otherwise. */
  available: boolean
  cash: number
  /** Is any scenery crew free this week? */
  freeSceneryCrew: boolean
  stages: SceneryStageView[]
  offers: SetOfferView[]
  /** Every non-retired set the studio owns, in mint order. */
  sets: StudioSetView[]
  repairCost: number
  repairWeeks: number
}

/**
 * Everything the Scenery Shop surface needs, gathered once.
 *
 * `genre` is optional and only scores the catalogue: a player standing in the shop
 * is usually not thinking about one picture, and a catalogue that silently ranked
 * itself against a picture nobody named would be answering a question nobody asked.
 */
export function sceneryBoard(state: GameState, genre: Genre | null = null): SceneryBoardView {
  const stages = stagesInAllocationOrder(state)
  return {
    available: state.operations.mode === 'managed' && stages.length > 0,
    cash: state.studio.cash,
    freeSceneryCrew: state.operations.mode === 'managed' && hasFreeSceneryCapacity(state),
    stages: stages.map((stage) => {
      const mounted = setMountedOn(state.sets, stage.id)
      return {
        stageFacilityId: stage.id,
        stageName: stage.name,
        mounted: mounted === null ? null : studioSetView(state, mounted),
      }
    }),
    offers: setOffersFor(genre),
    sets: state.sets
      .filter((set) => set.status !== 'retired')
      .map((set) => studioSetView(state, set)),
    repairCost: TUNING.SET_REPAIR_COST,
    repairWeeks: TUNING.SET_REPAIR_WEEKS,
  }
}

/** What the UI asks for when it commissions a set. Structurally the engine's payload. */
export type SetCommissionRequest = { blueprintId: string; stageFacilityId: string }

/**
 * Why this exact commission would be refused, in the STUDIO's words, or null.
 *
 * The words are the engine's own (`setCommissionRefusalCopy`), because a remedy the
 * UI invented would be a remedy the UI cannot guarantee. The refusal is ATOMIC: it
 * is the most fundamental reason true of the request, decided before anything is
 * held (§3.1), so a surface showing it is never showing a second-order excuse.
 */
export function setCommissionRefusal(
  state: GameState,
  request: SetCommissionRequest,
): SetRefusalCopy | null {
  const refusal = coreCommissionSetRefusal(state, request)
  if (refusal === null) return null
  const blueprintName = setBlueprintById(request.blueprintId)?.name
  return setCommissionRefusalCopy(refusal, {
    stageName: stageNameOf(state, request.stageFacilityId),
    ...(blueprintName === undefined ? {} : { blueprintName }),
  })
}

/** Why a repair would be refused, in the studio's words, or null. */
export function setRepairRefusal(state: GameState, setId: string): SetRefusalCopy | null {
  const refusal = coreRepairSetRefusal(state, setId)
  if (refusal === null) return null
  const setName = state.sets.find((set) => set.id === setId)?.name
  return setRepairRefusalCopy(refusal, setName === undefined ? {} : { setName })
}

/** Why a strike would be refused, in the studio's words, or null. */
export function setStrikeRefusal(state: GameState, setId: string): SetRefusalCopy | null {
  const refusal = coreStrikeSetRefusal(state, setId)
  if (refusal === null) return null
  const setName = state.sets.find((set) => set.id === setId)?.name
  return setStrikeRefusalCopy(refusal, setName === undefined ? {} : { setName })
}

export function commissionSetAction(
  state: GameState,
  commission: SetCommissionRequest,
): ActionOutcome {
  try {
    return { ok: true, next: applyActions(state, [{ kind: 'commissionSet', commission }]) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export function repairSetAction(state: GameState, setId: string): ActionOutcome {
  try {
    return { ok: true, next: applyActions(state, [{ kind: 'repairSet', setId }]) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export function strikeSetAction(state: GameState, setId: string): ActionOutcome {
  try {
    return { ok: true, next: applyActions(state, [{ kind: 'strikeSet', setId }]) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
