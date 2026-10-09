// ── Sets — the V14 root, and the founding endowment (charter §3.1) ───────────
//
// A Soundstage is a buildable FACILITY; a Set is a first-class ENTITY; shooting
// requires both. This module owns the Set root's empty/initial values and the
// minimal `SET_TYPES` vocabulary the endowment needs.
//
// M1 landed the SCHEMA and the ENDOWMENT. C2a-M2 lands the LIFE: commission,
// build, repair, strike, wear, novelty, and the two numbers a bound set gives the
// picture standing on it.
//
// ── THE ONE THING TO UNDERSTAND BEFORE CHANGING ANYTHING HERE ───────────────
//
// V14 is the COMPLETE schema (§8) and M2 adds no member to `StudioSet`. Two
// facts that look like they need a field therefore do not have one, and are
// DERIVED instead — each from a property that is true by construction:
//
//   1. WHICH SCENERY SLOT a set under work is holding. Derived by
//      `occupancy.ts`, from the claims every other owner is already making. A set
//      never has to remember it, because nothing about the set depends on which
//      crew is doing the work.
//
//   2. WHETHER an `under-construction` set is being BUILT or REPAIRED.
//      `condition === 0` means, and can only mean, "this set has never stood":
//      nothing is up yet, so there is nothing to be in condition. A repair keeps
//      the set's worn condition until it completes, and a standing set's
//      condition can never reach 0 because
//      SET_CONDITION_UNUSABLE_THRESHOLD > SET_CONDITION_WEAR_PER_PRODUCTION —
//      a set worn below the threshold cannot be bound, so it cannot be worn
//      again. That inequality is a bounded-term test, not a habit.
//
// THE ENDOWMENT IS A COMPATIBILITY DEVICE, not permanent founding law (owner
// ruling `00E`.12). It exists so migrated saves, the sealed First-Movie-Journey
// fixtures, pre-Flip C2a, and the bounded harnesses keep working across the V14
// bump — founding capacity stays EXACTLY today's (2 stages, 2 sets, scenery 2,
// dev/casting 2, post 2), so every sealed spec runs unmodified and contention
// still begins with the third picture. Once the bare-start experience lands
// (C2b), fresh games start bare and build their own sets, and the fixtures adapt
// rather than the product law weakening.
//
// This module is pure data + total functions: no RNG, no clock, no I/O.

import { clamp } from './math.js'
import {
  facilitySlotKey,
  occupiedResourceSlots,
  resourceClaimsOf,
} from './occupancy.js'
import { StudioEventSink } from './studioEvents.js'
import {
  GENRE_ORDER,
  SET_TYPE_LABELS,
  SET_TYPES,
  TUNING,
  setBlueprintById,
  type KnownSetTypeId,
  type SetBlueprint,
} from './tuning.js'
import type {
  CommissionSetPayload,
  GameState,
  Genre,
  StudioOperations,
  StudioSet,
} from './types.js'

// The CLOSED authored location vocabulary lives in TUNING (charter §9) beside the
// blueprint catalog that guarantees every entry in it is buildable. It is
// RE-EXPORTED here because `sets.ts` has been its public address since M1 and the
// save validator reads it from here.
export { SET_TYPES, SET_TYPE_LABELS, type KnownSetTypeId } from './tuning.js'

/** The starter entry: the undressed stage interior every house set is. */
export const STARTER_SET_TYPE: KnownSetTypeId = SET_TYPES[0]

/** The player-facing name of a location, falling back to its id for a stranger. */
export function setTypeLabel(setType: string): string {
  return SET_TYPE_LABELS[setType as KnownSetTypeId] ?? setType
}

/**
 * The blueprint id the two endowed house sets carry. The catalog itself (costs,
 * durations, attractiveness, per-genre weights as DATA) is M2's; the id is fixed
 * now so a migrated save and a newly activated studio name the same thing and no
 * later catalog correction can rewrite what has already been endowed.
 */
export const HOUSE_SET_BLUEPRINT_ID = 'set-house-generic'

/** The stages the endowment mounts on, in the order the sets are minted. */
export const ENDOWED_HOUSE_SET_STAGES: readonly { facilityId: string; name: string }[] =
  Object.freeze([
    Object.freeze({ facilityId: 'facility-soundstage-07', name: 'Stage 7 House Set' }),
    Object.freeze({ facilityId: 'facility-soundstage-12', name: 'Stage 12 House Set' }),
  ])

/** The set-id format. Monotonic, never recycled, never rolled back (§8.1). */
export function setId(ordinal: number): string {
  return `set-${String(ordinal)}`
}

/** NEUTRAL genre weights: the same weight on every genre, so the house set favours nothing. */
export function neutralGenreWeights(): Record<Genre, number> {
  const weights = {} as Record<Genre, number>
  for (const genre of GENRE_ORDER) weights[genre] = TUNING.HOUSE_SET_GENRE_WEIGHT
  return weights
}

/**
 * The TWO generic house sets a managed studio is founded with, in mint order.
 * `nextSetId` is therefore 2 afterwards — ordinals 0 and 1 are consumed and can
 * never be handed out again.
 *
 * `completesWeek` is null and `status` is `'standing'`: these sets were not
 * built, they were endowed, and claiming a completion week the studio never
 * lived would be a fact nobody could check.
 */
export function endowedHouseSets(): StudioSet[] {
  return ENDOWED_HOUSE_SET_STAGES.map((stage, ordinal) => ({
    id: setId(ordinal),
    name: stage.name,
    blueprintId: HOUSE_SET_BLUEPRINT_ID,
    mountedOn: stage.facilityId,
    setType: STARTER_SET_TYPE,
    status: 'standing' as const,
    completesWeek: null,
    quality: TUNING.HOUSE_SET_QUALITY,
    novelty: TUNING.SET_NOVELTY_INITIAL,
    condition: TUNING.SET_CONDITION_INITIAL,
    genreWeights: neutralGenreWeights(),
    priorityGenre: TUNING.HOUSE_SET_PRIORITY_GENRE,
  }))
}

/** The next set ordinal a managed studio hands out after the endowment. */
export const ENDOWED_NEXT_SET_ID = ENDOWED_HOUSE_SET_STAGES.length

// ═══════════════════════════════════════════════════════════════════════════
// C2a-M2 — the life of a Set
// ═══════════════════════════════════════════════════════════════════════════

/** The canonical ledger notes. The set's NAME is its identity to a player. */
export function setCapexLedgerNote(name: string): string {
  return `${name} — set construction`
}
export function setRepairLedgerNote(name: string): string {
  return `${name} — set repair`
}
export function setStrikeLedgerNote(name: string): string {
  return `${name} — set struck`
}

/** What striking a set returns: a depreciated fraction of what it cost to build. */
export function setDemolitionRefund(blueprint: SetBlueprint): number {
  return Math.round(blueprint.capex * TUNING.SET_DEMOLITION_REFUND_FRACTION)
}

/** The set standing (or going up) on a stage, or null. At most one, ever. */
export function setMountedOn(
  sets: readonly StudioSet[],
  stageFacilityId: string,
): StudioSet | null {
  for (const set of sets) {
    if (set.status !== 'retired' && set.mountedOn === stageFacilityId) return set
  }
  return null
}

/** The set with this id, or null. */
export function setById(sets: readonly StudioSet[], id: string): StudioSet | null {
  return sets.find((set) => set.id === id) ?? null
}

/**
 * Whether a standing set is in good enough repair to shoot on.
 *
 * The threshold GATES USE ONLY in V1 — a worn set is refused, never quietly
 * penalised. The corpus contradicts itself on whether disrepair also costs
 * quality (lane 3 §6 records both readings); this ships the manual-corroborated
 * one and says so rather than picking silently.
 */
export function setIsUsable(set: StudioSet): boolean {
  return (
    set.status === 'standing' && set.condition >= TUNING.SET_CONDITION_UNUSABLE_THRESHOLD
  )
}

/** True while the work on an under-construction set is a REPAIR, not a first build. */
export function setIsUnderRepair(set: StudioSet): boolean {
  return set.status === 'under-construction' && set.condition > 0
}

/**
 * How well a set suits a picture's genre: its authored weight for that genre,
 * plus a named bonus when the set was built FOR it. Clamped to 0..1, which is
 * what keeps the uplift bounded by its own maximum rather than by arithmetic
 * that happens to stay small.
 *
 * Fit is ADVISORY, never a gate (§3.1): any set can shoot any picture, and poor
 * fit costs uplift rather than refusing the work.
 */
export function setGenreFit(set: StudioSet, genre: Genre | null): number {
  // A picture whose concept cannot be resolved has no genre to fit, so it earns
  // the quality half of the uplift and nothing else. Honest, not convenient: an
  // unknown genre is not a neutral one.
  if (genre === null) return 0
  const weight = set.genreWeights[genre] ?? 0
  const bonus = set.priorityGenre === genre ? TUNING.SET_GENRE_FIT_PRIORITY_BONUS : 0
  return clamp(weight + bonus, 0, 1)
}

/**
 * The ONE bounded additive uplift a bound set gives the picture's craft — owner
 * law 3's teeth, and §9's single ratified economy exception.
 *
 * Two capped channels, summed:  quality (0..100) and fit (0..1). At the authored
 * maxima the whole lever is 10 points of a 0..100 craft score, and it is locked
 * at BIND so a set's own wear and staleness during the shoot cannot retroactively
 * change what it gave the picture standing on it.
 */
export function setBindingUplift(set: StudioSet, genre: Genre | null): number {
  return (
    TUNING.SET_QUALITY_UPLIFT_MAX * clamp(set.quality / 100, 0, 1) +
    TUNING.SET_GENRE_FIT_UPLIFT_MAX * setGenreFit(set, genre)
  )
}

/**
 * The bounded multiplier a set's novelty puts on a release's draw.
 *
 * Exactly 1.0 at full novelty — a bit-exact IEEE no-op, which is what makes an
 * unbound picture and a freshly built set byte-identical to the world before
 * this milestone rather than merely equal to it.
 */
export function setNoveltyReceptionFactor(novelty: number | null): number {
  if (novelty === null) return 1
  const min = TUNING.SET_NOVELTY_RECEPTION_FACTOR_MIN
  return min + (1 - min) * clamp(novelty, 0, 1)
}

// ── commissioning ───────────────────────────────────────────────────────────

/**
 * Why a commission was refused. STRUCTURED, never a string — the engine decides
 * the fact, and it also supplies the two sentences a surface owes the player,
 * because "obvious remedy" is a product law and a UI cannot invent one it does
 * not have the facts for.
 */
export type SetCommissionRefusal =
  | { code: 'notManaged' }
  | { code: 'unknownBlueprint'; blueprintId: string }
  | { code: 'unknownStage'; stageFacilityId: string }
  | { code: 'stageAlreadyDressed'; stageFacilityId: string; setId: string; setName: string }
  | { code: 'noSceneryCapacity' }
  | { code: 'insufficientFunds'; cost: number; cash: number }

export type SetRepairRefusal =
  | { code: 'notManaged' }
  | { code: 'unknownSet'; setId: string }
  | { code: 'notStanding'; setId: string }
  | { code: 'alreadyWhole'; setId: string }
  | { code: 'setInUse'; setId: string; productionId: string }
  | { code: 'noSceneryCapacity' }
  | { code: 'insufficientFunds'; cost: number; cash: number }

export type SetStrikeRefusal =
  | { code: 'notManaged' }
  | { code: 'unknownSet'; setId: string }
  | { code: 'alreadyRetired'; setId: string }
  | { code: 'setInUse'; setId: string; productionId: string }

/** One refusal, said twice: what happened, and what to do about it. */
export type SetRefusalCopy = { reason: string; remedy: string }

/**
 * The player-facing words for a commission refusal.
 *
 * FILMMAKING LANGUAGE, and a remedy that names something the player can actually
 * do (`00F`). No engine term, no id, no code — a refusal a player cannot act on
 * is a dead end wearing an explanation's clothes.
 */
export function setCommissionRefusalCopy(
  refusal: SetCommissionRefusal,
  context: { stageName?: string; blueprintName?: string },
): SetRefusalCopy {
  const stage = context.stageName ?? 'that stage'
  switch (refusal.code) {
    case 'notManaged':
      return {
        reason: 'The studio is not running its own production operations yet.',
        remedy: 'Take over operations before commissioning scenery.',
      }
    case 'unknownBlueprint':
      return {
        reason: 'That is not a set the shop knows how to build.',
        remedy: 'Choose a set from the catalogue.',
      }
    case 'unknownStage':
      return {
        reason: 'The studio has no such soundstage.',
        remedy: 'Choose one of the studio’s stages.',
      }
    case 'stageAlreadyDressed':
      return {
        reason: `${refusal.setName} is already standing on ${stage}.`,
        remedy: `Strike ${refusal.setName} first, or build on another stage.`,
      }
    case 'noSceneryCapacity':
      return {
        reason: 'Every scenery crew is already working.',
        remedy: 'Wait for a crew to finish, or build another Scenery Shop.',
      }
    case 'insufficientFunds':
      return {
        reason: 'The studio cannot cover the cost of the build.',
        remedy: 'Wait for a picture to earn, or choose a cheaper set.',
      }
  }
}

/** The player-facing words for a repair refusal. */
export function setRepairRefusalCopy(
  refusal: SetRepairRefusal,
  context: { setName?: string },
): SetRefusalCopy {
  const name = context.setName ?? 'That set'
  switch (refusal.code) {
    case 'notManaged':
      return {
        reason: 'The studio is not running its own production operations yet.',
        remedy: 'Take over operations before ordering repairs.',
      }
    case 'unknownSet':
      return { reason: 'The studio has no such set.', remedy: 'Choose one of the studio’s sets.' }
    case 'notStanding':
      return {
        reason: `${name} is not standing — work is already going on there.`,
        remedy: 'Wait for the work in progress to finish.',
      }
    case 'alreadyWhole':
      return {
        reason: `${name} is in good repair.`,
        remedy: 'Nothing needs doing here.',
      }
    case 'setInUse':
      return {
        reason: `${name} is being filmed on.`,
        remedy: 'Wait for the picture to wrap, then order the repair.',
      }
    case 'noSceneryCapacity':
      return {
        reason: 'Every scenery crew is already working.',
        remedy: 'Wait for a crew to finish, or build another Scenery Shop.',
      }
    case 'insufficientFunds':
      return {
        reason: 'The studio cannot cover the cost of the repair.',
        remedy: 'Wait for a picture to earn before ordering the work.',
      }
  }
}

/** The player-facing words for a strike refusal. */
export function setStrikeRefusalCopy(
  refusal: SetStrikeRefusal,
  context: { setName?: string },
): SetRefusalCopy {
  const name = context.setName ?? 'That set'
  switch (refusal.code) {
    case 'notManaged':
      return {
        reason: 'The studio is not running its own production operations yet.',
        remedy: 'Take over operations before striking scenery.',
      }
    case 'unknownSet':
      return { reason: 'The studio has no such set.', remedy: 'Choose one of the studio’s sets.' }
    case 'alreadyRetired':
      return { reason: `${name} has already been struck.`, remedy: 'Nothing needs doing here.' }
    case 'setInUse':
      return {
        reason: `${name} is being filmed on.`,
        remedy: 'Wait for the picture to wrap, then strike the set.',
      }
  }
}

/** The name a newly commissioned set takes. Unique by construction. */
export function mintSetName(
  sets: readonly StudioSet[],
  blueprint: SetBlueprint,
  ordinal: number,
): string {
  // The blueprint's own name while it is free — "Graveyard" reads better than
  // "Graveyard 4" — and the mint ordinal after that. The ordinal is unique and
  // never reused, so no two sets can ever share a name, which is what lets the
  // cash ledger carry a set's identity in words a player recognises.
  const taken = new Set(sets.map((set) => set.name))
  return taken.has(blueprint.name) ? `${blueprint.name} ${String(ordinal)}` : blueprint.name
}

/**
 * Whether the studio has a free scenery crew — one `set-scenery` slot nobody is
 * holding.
 *
 * Asked through the ONE union producer, so a picture shooting, a screenplay
 * drafting, and another set already going up all count, and none of them has to
 * be remembered separately here.
 */
export function hasFreeSceneryCapacity(state: GameState): boolean {
  const occupied = occupiedResourceSlots(state)
  for (const facility of state.operations.facilities) {
    if (facility.capability !== 'set-scenery') continue
    for (let slot = 0; slot < facility.capacity; slot++) {
      if (!occupied.has(facilitySlotKey(facility.id, slot))) return true
    }
  }
  return false
}

/** The production filming on this set right now, or null. */
export function productionBoundToSet(state: GameState, id: string): string | null {
  for (const workflow of state.operations.workflows) {
    if (workflow.bindings?.setId !== id) continue
    if (workflow.phase === 'rehearsal' || workflow.phase === 'shooting') {
      return workflow.productionId
    }
  }
  return null
}

/** What a commission costs, or null when the blueprint is unknown. */
export function setCommissionCost(blueprintId: string): number | null {
  return setBlueprintById(blueprintId)?.capex ?? null
}

/**
 * THE ATOMIC REFUSAL (§3.1). A commission acquires the scenery slot AND the
 * stage's mount together, or it refuses UP FRONT holding nothing — the placement
 * pattern, in a fixed order so the reported reason is the most fundamental one
 * true of the request.
 */
export function commissionSetRefusal(
  state: GameState,
  payload: CommissionSetPayload,
  affordable: (cost: number) => boolean = (cost) => state.studio.cash >= cost,
): SetCommissionRefusal | null {
  if (state.operations.mode !== 'managed') return { code: 'notManaged' }
  const blueprint = setBlueprintById(payload.blueprintId)
  if (blueprint === null) return { code: 'unknownBlueprint', blueprintId: payload.blueprintId }
  const stage = state.operations.facilities.find(
    (facility) => facility.id === payload.stageFacilityId && facility.capability === 'soundstage',
  )
  if (stage === undefined) {
    return { code: 'unknownStage', stageFacilityId: payload.stageFacilityId }
  }
  // THE MOUNT. One set per stage, and a set going up counts — the flats are
  // already in the building.
  const mounted = setMountedOn(state.sets, stage.id)
  if (mounted !== null) {
    return {
      code: 'stageAlreadyDressed',
      stageFacilityId: stage.id,
      setId: mounted.id,
      setName: mounted.name,
    }
  }
  if (!hasFreeSceneryCapacity(state)) return { code: 'noSceneryCapacity' }
  if (!affordable(blueprint.capex)) {
    return { code: 'insufficientFunds', cost: blueprint.capex, cash: state.studio.cash }
  }
  return null
}

/**
 * Commission a set at a named stage. Returns the SAME state by reference on any
 * refusal, exactly as `commitPlacement` does, so a caller that skipped the probe
 * still cannot half-apply a build.
 *
 * A newly commissioned set is `under-construction` with `novelty: 0` and
 * `condition: 0`: nothing is standing yet, so it is neither fresh nor whole, and
 * claiming either would be a number about a thing that does not exist. Both are
 * set at completion.
 */
export function commissionSet(state: GameState, payload: CommissionSetPayload): GameState {
  if (commissionSetRefusal(state, payload) !== null) return state
  const blueprint = setBlueprintById(payload.blueprintId)
  if (blueprint === null) return state
  const ordinal = state.nextSetId
  const name = mintSetName(state.sets, blueprint, ordinal)
  const set: StudioSet = {
    id: setId(ordinal),
    name,
    blueprintId: blueprint.id,
    mountedOn: payload.stageFacilityId,
    setType: blueprint.setType,
    status: 'under-construction',
    completesWeek: state.market.tick + blueprint.buildWeeks,
    quality: blueprint.quality,
    novelty: 0,
    condition: 0,
    genreWeights: { ...blueprint.genreWeights },
    priorityGenre: blueprint.priorityGenre,
  }
  return {
    ...state,
    sets: [...state.sets, set],
    nextSetId: ordinal + 1,
    studio: { ...state.studio, cash: state.studio.cash - blueprint.capex },
    ledger: [
      ...state.ledger,
      {
        week: state.market.tick,
        kind: 'setCapex',
        amount: -blueprint.capex,
        note: setCapexLedgerNote(name),
      },
    ],
  }
}

// ── repair ──────────────────────────────────────────────────────────────────

/** Why a repair was refused, in a fixed order. */
export function repairSetRefusal(
  state: GameState,
  id: string,
  affordable: (cost: number) => boolean = (cost) => state.studio.cash >= cost,
): SetRepairRefusal | null {
  if (state.operations.mode !== 'managed') return { code: 'notManaged' }
  const set = setById(state.sets, id)
  if (set === null) return { code: 'unknownSet', setId: id }
  if (set.status !== 'standing') return { code: 'notStanding', setId: id }
  if (set.condition >= TUNING.SET_CONDITION_INITIAL) return { code: 'alreadyWhole', setId: id }
  const holder = productionBoundToSet(state, id)
  if (holder !== null) return { code: 'setInUse', setId: id, productionId: holder }
  if (!hasFreeSceneryCapacity(state)) return { code: 'noSceneryCapacity' }
  if (!affordable(TUNING.SET_REPAIR_COST)) {
    return { code: 'insufficientFunds', cost: TUNING.SET_REPAIR_COST, cash: state.studio.cash }
  }
  return null
}

/**
 * Order a repair. The set goes back under work for SET_REPAIR_WEEKS holding one
 * scenery slot, and comes back whole.
 *
 * Its condition is KEPT while the work runs, which is both honest — the set is
 * still as worn as it was until the crew finishes — and load-bearing: a non-zero
 * condition is precisely what tells a repair apart from a first build without a
 * schema member (see this module's header). Novelty is untouched: repainting a
 * set does not make the audience forget it.
 */
export function repairSet(state: GameState, id: string): GameState {
  if (repairSetRefusal(state, id) !== null) return state
  const set = setById(state.sets, id)
  if (set === null) return state
  return {
    ...state,
    sets: state.sets.map((candidate) =>
      candidate.id === id
        ? {
            ...candidate,
            status: 'under-construction' as const,
            completesWeek: state.market.tick + TUNING.SET_REPAIR_WEEKS,
          }
        : candidate,
    ),
    studio: { ...state.studio, cash: state.studio.cash - TUNING.SET_REPAIR_COST },
    ledger: [
      ...state.ledger,
      {
        week: state.market.tick,
        kind: 'setMaintenance',
        amount: -TUNING.SET_REPAIR_COST,
        note: setRepairLedgerNote(set.name),
      },
    ],
  }
}

// ── strike ──────────────────────────────────────────────────────────────────

/** Why a strike was refused, in a fixed order. */
export function strikeSetRefusal(state: GameState, id: string): SetStrikeRefusal | null {
  if (state.operations.mode !== 'managed') return { code: 'notManaged' }
  const set = setById(state.sets, id)
  if (set === null) return { code: 'unknownSet', setId: id }
  if (set.status === 'retired') return { code: 'alreadyRetired', setId: id }
  const holder = productionBoundToSet(state, id)
  if (holder !== null) return { code: 'setInUse', setId: id, productionId: holder }
  return null
}

/**
 * Strike a set. INSTANT (`SET_STRIKE_WEEKS` is a named zero): the flats come
 * down and the stage is clear the same week.
 *
 * The set RETIRES rather than disappearing — its id is permanent, so the
 * `wrapped` rows that name it stay meaningful for the rest of the campaign — and
 * the studio recovers a depreciated fraction of what it paid, which is strictly
 * less than the capex, so build-then-strike can never be farmed.
 */
export function strikeSet(state: GameState, id: string, events: StudioEventSink): GameState {
  if (strikeSetRefusal(state, id) !== null) return state
  const set = setById(state.sets, id)
  if (set === null) return state
  const blueprint = setBlueprintById(set.blueprintId)
  const refund = blueprint === null ? 0 : setDemolitionRefund(blueprint)
  events.append({ kind: 'setRetired', setId: set.id, refund })
  return {
    ...state,
    sets: state.sets.map((candidate) =>
      candidate.id === id
        ? { ...candidate, status: 'retired' as const, completesWeek: null }
        : candidate,
    ),
    studio: { ...state.studio, cash: state.studio.cash + refund },
    ledger:
      refund > 0
        ? [
            ...state.ledger,
            {
              week: state.market.tick,
              kind: 'setDemolitionRefund' as const,
              amount: refund,
              note: setStrikeLedgerNote(set.name),
            },
          ]
        : state.ledger,
  }
}

// ── the weekly pass, and the two per-picture effects ─────────────────────────

/**
 * Sets whose work finishes on arrival at `arrivalWeek` come up standing.
 *
 * Placed in the tick beside construction and placement completion, and for the
 * same reason: a set that finishes during this advance was still scaffolding for
 * the week that just ran, so it contributes nothing to the allocation that
 * already happened.
 *
 * A FIRST BUILD is fresh and whole and says so in the studio's permanent history
 * (Tier-D `setBuilt`). A REPAIR comes back whole, keeps whatever novelty it had
 * left, and records NOTHING: the set was built once, and a second `setBuilt` row
 * for the same id would be a false entry in a history the campaign cannot edit.
 */
export function completeDueSets(
  sets: readonly StudioSet[],
  arrivalWeek: number,
  events: StudioEventSink,
): { sets: readonly StudioSet[]; completed: readonly StudioSet[] } {
  if (!sets.some((set) => set.status === 'under-construction' && set.completesWeek !== null && set.completesWeek <= arrivalWeek)) {
    return { sets, completed: [] }
  }
  const completed: StudioSet[] = []
  const next = sets.map((set) => {
    if (set.status !== 'under-construction') return set
    if (set.completesWeek === null || set.completesWeek > arrivalWeek) return set
    const wasRepair = setIsUnderRepair(set)
    const done: StudioSet = {
      ...set,
      status: 'standing',
      completesWeek: null,
      condition: TUNING.SET_CONDITION_INITIAL,
      novelty: wasRepair ? set.novelty : TUNING.SET_NOVELTY_INITIAL,
    }
    if (!wasRepair) {
      // Stamped with the set's OWN committed completion week, not the week being
      // advanced — the same rule a completing building follows, and for the same
      // reason: that week is already on the record this row describes, and two
      // dates for one fact is one date too many.
      events.append({ kind: 'setBuilt', setId: set.id }, set.completesWeek)
      completed.push(done)
    }
    return done
  })
  return { sets: next, completed }
}

/**
 * A picture wrapped on this set: the scenery took a season of work, and it shows.
 *
 * PER-USE and deterministic (§3.1) — one wrap, one wear, no clock and no draw.
 * Floored at zero so a forged or extreme state can never make condition negative;
 * in play the floor is unreachable, because a set below
 * SET_CONDITION_UNUSABLE_THRESHOLD cannot be bound and so cannot be worn again.
 */
export function wearSetAtWrap(
  sets: readonly StudioSet[],
  id: string | null,
): readonly StudioSet[] {
  if (id === null) return sets
  if (!sets.some((set) => set.id === id)) return sets
  return sets.map((set) =>
    set.id === id
      ? {
          ...set,
          condition: clamp(set.condition - TUNING.SET_CONDITION_WEAR_PER_PRODUCTION, 0, 100),
        }
      : set,
  )
}

/**
 * A film shot on this set REACHED AN AUDIENCE, so the set is that much less of a
 * novelty next time.
 *
 * At RELEASE, never at greenlight and never at wrap: §3.1 rules that a cancelled
 * production burns no novelty, and a picture nobody has seen has not shown
 * anybody this street corner.
 */
export function depleteSetNoveltyForRelease(
  sets: readonly StudioSet[],
  id: string | null,
): readonly StudioSet[] {
  if (id === null) return sets
  if (!sets.some((set) => set.id === id)) return sets
  return sets.map((set) =>
    set.id === id
      ? {
          ...set,
          novelty: clamp(set.novelty - TUNING.SET_NOVELTY_DEPLETION_PER_RELEASE, 0, 1),
        }
      : set,
  )
}

// ── binding candidates ──────────────────────────────────────────────────────

/**
 * The sets a picture could shoot on at a given stage, right now.
 *
 * A candidate is STANDING, in good enough repair, mounted on that stage, and not
 * already held by another picture. Order is state order, so "exactly one
 * candidate" and "the first candidate" are both deterministic.
 *
 * A stage carries at most one set in V1, so this list is empty or a single entry
 * — it is written as a list because that is the shape the rule is about, and
 * because multi-set staging (§3.1's X2) is out of V1 rather than out of the
 * language.
 */
export function bindableSetsOn(
  sets: readonly StudioSet[],
  stageFacilityId: string,
  heldSetIds: ReadonlySet<string>,
): StudioSet[] {
  return sets.filter(
    (set) => set.mountedOn === stageFacilityId && setIsUsable(set) && !heldSetIds.has(set.id),
  )
}

/** The sets other pictures are physically standing on right now. */
export function heldSetIds(
  operations: StudioOperations,
  excludingProductionId?: string,
): Set<string> {
  const held = new Set<string>()
  for (const workflow of operations.workflows) {
    if (workflow.productionId === excludingProductionId) continue
    const bound = workflow.bindings?.setId ?? null
    if (bound === null) continue
    // C2a-M4 (`00E`.5): a picture holds its set exactly as long as it holds the
    // STAGE the set stands on — the composite is acquired and released as one.
    // A wrapped picture waiting for Post has released both, so the set is
    // bindable again the same week, which is the whole point of the release law.
    if (workflow.reservations.some((reservation) => reservation.capability === 'soundstage')) {
      held.add(bound)
    }
  }
  return held
}

export function bindableSetsOnStage(
  state: GameState,
  stageFacilityId: string,
  excludingProductionId?: string,
): StudioSet[] {
  return bindableSetsOn(
    state.sets,
    stageFacilityId,
    heldSetIds(state.operations, excludingProductionId),
  )
}

// ── the invariant ───────────────────────────────────────────────────────────

function setInvariant(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`sets invariant: ${message}`)
}

/**
 * The cross-reference laws the save validator's structural pass cannot see.
 *
 * Structure, ranges, id monotonicity and `mountedOn`-names-a-soundstage are
 * already proved by `save.ts`. What is proved HERE is everything that needs the
 * REST of the state: one set per stage, the derived scenery slot exists for every
 * set under work, the build/repair discriminator holds, and a set nobody may
 * shoot on is not being shot on.
 */
export function assertSetsInvariants(state: GameState): void {
  if (state.operations.mode !== 'managed') {
    setInvariant(state.sets.length === 0, 'legacy operations may hold no sets')
    setInvariant(state.nextSetId === 0, 'legacy operations may not have minted a set id')
    return
  }

  const mounted = new Map<string, string>()
  const stageIds = new Set(
    state.operations.facilities
      .filter((facility) => facility.capability === 'soundstage')
      .map((facility) => facility.id),
  )
  for (const set of state.sets) {
    if (set.status === 'retired') {
      setInvariant(
        set.completesWeek === null,
        `retired set "${set.id}" cannot still promise a completion week`,
      )
      continue
    }
    setInvariant(stageIds.has(set.mountedOn), `set "${set.id}" is mounted on no soundstage`)
    const other = mounted.get(set.mountedOn)
    setInvariant(
      other === undefined,
      `sets "${other ?? ''}" and "${set.id}" both stand on "${set.mountedOn}"`,
    )
    mounted.set(set.mountedOn, set.id)
    if (set.status === 'standing') {
      setInvariant(
        set.completesWeek === null,
        `standing set "${set.id}" cannot still promise a completion week`,
      )
      // The discriminator, asserted rather than assumed: a set that has stood has
      // a condition, and only a set that has never stood has none.
      setInvariant(set.condition > 0, `standing set "${set.id}" has no condition`)
    } else {
      setInvariant(
        set.completesWeek !== null,
        `set "${set.id}" is under work and owes a completion week`,
      )
    }
  }

  // Every set under work is holding a real scenery slot. The assignment is
  // derived, so this is where "derived" is proved to have produced an answer.
  const underWork = state.sets.filter((set) => set.status === 'under-construction')
  if (underWork.length > 0) {
    const holding = new Set<string>()
    for (const claim of resourceClaimsOf(occupiedResourceSlots(state))) {
      if (claim.owner === 'set' && claim.facilitySlotKey !== null) holding.add(claim.ownerId)
    }
    for (const set of underWork) {
      setInvariant(
        holding.has(set.id),
        `set "${set.id}" is under work with no scenery crew on it`,
      )
    }
  }

  // A bound set is a set that may be shot on. This is the one law the whole
  // condition gate exists to enforce, so it is checked where a forged save has to
  // pass through it.
  for (const workflow of state.operations.workflows) {
    const bound = workflow.bindings?.setId ?? null
    if (bound === null) continue
    const set = setById(state.sets, bound)
    setInvariant(set !== null, `workflow "${workflow.productionId}" is bound to unknown set "${bound}"`)
    if (workflow.phase === 'rehearsal' || workflow.phase === 'shooting') {
      setInvariant(
        set.status === 'standing',
        `workflow "${workflow.productionId}" is filming on set "${bound}", which is not standing`,
      )
      // The release law (\`00E\`.5): a picture that wrapped has released the
      // stage while still in the shooting phase waiting for Post — its
      // bindings keep \`setId\` purely as the RECORD of what it shot on, and
      // \`stageFacilityId\` is null because it holds nothing. The mounted-on
      // agreement is a law about a HELD stage; a released record holds none.
      // (Reproduced by the W7 hostile-correction walk: post capacity 1, the
      // second wrapped picture waiting a week, the invariant read the record
      // as tenancy and killed a lawful state on read.)
      setInvariant(
        workflow.bindings.stageFacilityId === null ||
          set.mountedOn === workflow.bindings.stageFacilityId,
        `workflow "${workflow.productionId}" holds a stage its bound set does not stand on`,
      )
    }
  }
}
