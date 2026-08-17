// ── Blueprint Requirements (C1-M2) — the declarative unlock evaluator ────────
//
// LAW: a blueprint's preconditions are DATA, and this module is the ONE thing
// that reads them. Nothing else in the engine may ask "is this building
// unlocked?"; nothing else may invent an answer, and no other module may hold a
// second copy of the copy a player is shown.
//
// WHY IT IS A MODULE OF ITS OWN: the recovered original engine gated its catalog
// with a numbered `requires` list per blueprint. That shape is right, and keeping
// its evaluator separate from `placement.ts` is what makes the shape hold — the
// moment unlock logic lives inside the placement query it starts growing branches
// that only the placement query can reach, and the catalog screen (C1-M5) ends up
// re-deriving availability from scratch. Both surfaces call this instead.
//
// PURE, TOTAL, AND HONEST:
//   • PURE — no RNG, no wall clock, no I/O, no mutation. It reads `state` and the
//     blueprint and returns a fresh value. Consumes ZERO bytes of `state.rngState`.
//   • TOTAL — it never throws, for any requirement, on any state. Availability is
//     something a preview asks constantly; a thrown error is not an answer.
//   • HONEST — five kinds name systems that do not exist yet (rank, certificate,
//     award, research, landZone). They evaluate as UNMET and say so in words. They
//     are NEVER treated as satisfied "for now", because a gate that silently
//     passes is a gate that ships wrong the day its system lands.
//
// THE LOCKED-REASON VOCABULARY: every `reason` here is PRODUCT COPY. C1-M5 renders
// these strings verbatim in the build catalog, so they are written as sentences a
// player reads, never as diagnostics. They name no code, no milestone, and no
// campaign. Engine-side accusations belong in invariant messages, not here.

import { propertyOf } from './lot.js'
import type {
  BlueprintAvailability,
  BlueprintRequirement,
  FacilityBlueprint,
  GameState,
  PropertyState,
  StudioPlacement,
  UnmetRequirement,
} from './types.js'

/**
 * The requirement kinds whose backing systems exist today and can therefore be
 * genuinely satisfied by play. Everything else is declared, evaluatable, and
 * not yet attainable.
 *
 * This list is the C3/C4 activation checklist: moving a kind out of
 * `NOT_YET_ATTAINABLE_KINDS` and into `satisfied` below is the whole change.
 */
export const LIVE_REQUIREMENT_KINDS: readonly BlueprintRequirement['kind'][] = [
  'date',
  'facility',
  'structure',
]

/**
 * Kinds that no amount of play can satisfy yet, each with the sentence that says
 * so. The copy is deliberately about the SYSTEM, not the specific gate: a player
 * told "Awards are not part of the game yet" learns something true and general,
 * where "you cannot get this award" reads like a bug.
 */
const NOT_YET_ATTAINABLE_KINDS: Readonly<Record<string, string>> = {
  rank: 'Studio rank is not part of the game yet.',
  certificate: 'Certificates are not part of the game yet.',
  award: 'Awards are not part of the game yet.',
  research: 'Research is not part of the game yet.',
  landZone: 'Buying land is not part of the game yet.',
}

/** The name a player knows a blueprint by, falling back to its id. */
function blueprintName(catalog: readonly FacilityBlueprint[], blueprintId: string): string {
  for (const blueprint of catalog) {
    if (blueprint.id === blueprintId) return blueprint.name
  }
  return blueprintId
}

/** The label a player knows a structure by, falling back to its id. */
function structureLabel(property: PropertyState, structureId: string): string {
  for (const structure of property.structures) {
    if (structure.id === structureId) return structure.label
  }
  return structureId
}

/** At least one OPERATIONAL placement of the blueprint stands on the property. */
function hasOperationalPlacement(placement: StudioPlacement, blueprintId: string): boolean {
  return placement.facilities.some(
    (placed) => placed.blueprintId === blueprintId && placed.status === 'operational',
  )
}

/**
 * The player-facing sentence for ONE unmet requirement.
 *
 * Exported because C1-M5's catalog and any future "why is this locked?" surface
 * must render the SAME words, and because a vocabulary that lives in one function
 * can be reviewed as copy in one place.
 */
export function blueprintRequirementReason(
  requirement: BlueprintRequirement,
  context: { property: PropertyState; catalog: readonly FacilityBlueprint[] },
): string {
  switch (requirement.kind) {
    case 'date':
      return `Available from Week ${String(requirement.week)}.`
    case 'facility':
      return `Requires an operational ${blueprintName(context.catalog, requirement.blueprintId)}.`
    case 'structure':
      return `Requires the ${structureLabel(context.property, requirement.structureId)}.`
    case 'rank':
      return `Requires ${requirement.tier} rank. ${NOT_YET_ATTAINABLE_KINDS.rank!}`
    case 'certificate':
      return `Requires the ${requirement.certificateId} certificate. ${NOT_YET_ATTAINABLE_KINDS.certificate!}`
    case 'award':
      return `Requires the ${requirement.awardId} award. ${NOT_YET_ATTAINABLE_KINDS.award!}`
    case 'research':
      return `Requires the ${requirement.packId} research. ${NOT_YET_ATTAINABLE_KINDS.research!}`
    case 'landZone':
      return `Requires owning ${requirement.zoneId}. ${NOT_YET_ATTAINABLE_KINDS.landZone!}`
    default:
      // Unreachable while the union is exhaustive. A future kind that reaches
      // here is UNMET and says nothing it cannot back up — the evaluator never
      // guesses a building open, and never throws inside a preview.
      return 'This is not available yet.'
  }
}

/** Whether a requirement's backing system exists today at all. */
export function requirementIsAttainable(requirement: BlueprintRequirement): boolean {
  return (LIVE_REQUIREMENT_KINDS as readonly string[]).includes(requirement.kind)
}

/** Whether ONE requirement is satisfied by the current state. Never throws. */
export function blueprintRequirementMet(
  state: GameState,
  requirement: BlueprintRequirement,
): boolean {
  switch (requirement.kind) {
    case 'date':
      return state.market.tick >= requirement.week
    case 'facility':
      return hasOperationalPlacement(state.placement, requirement.blueprintId)
    case 'structure':
      return propertyOf(state).structures.some(
        (structure) => structure.id === requirement.structureId,
      )
    // Declared, evaluatable, not yet attainable. These are UNMET on purpose: the
    // systems that would satisfy them land in C3/C4, and each activates here by
    // reading the state root its system adds — one case, no new kind, no new
    // rejection code, no change to any caller.
    case 'rank':
    case 'certificate':
    case 'award':
    case 'research':
    case 'landZone':
      return false
    default:
      return false
  }
}

/**
 * Evaluate a blueprint's whole requirement list.
 *
 * `unmet` preserves the AUTHORED order of `blueprint.requires`, so the catalog
 * shows its reasons in the order the designer wrote them and that order never
 * churns between renders. A blueprint with no requirements is available, which is
 * what every V12 blueprint was and what the Annex remains.
 */
export function evaluateBlueprintRequirements(
  state: GameState,
  blueprint: FacilityBlueprint,
  // The catalog is only ever used to turn a `facility` requirement's blueprint id
  // into the name a player knows. It is a parameter so this module never has to
  // import the catalog and create a cycle with `tuning.ts`; `placement.ts` passes
  // the real one.
  catalog: readonly FacilityBlueprint[] = [],
): BlueprintAvailability {
  const property = propertyOf(state)
  const unmet: UnmetRequirement[] = []
  for (const requirement of blueprint.requires) {
    if (blueprintRequirementMet(state, requirement)) continue
    unmet.push({
      requirement,
      reason: blueprintRequirementReason(requirement, { property, catalog }),
      notYetAttainable: !requirementIsAttainable(requirement),
    })
  }
  return { available: unmet.length === 0, unmet }
}

// ── instance limits ──────────────────────────────────────────────────────────

/**
 * How many placements of a blueprint already stand, in EVERY status.
 *
 * A site under construction has already reserved its instance. The alternative —
 * counting only operational ones — lets a player queue five of a one-per-studio
 * building and only discover the problem as they complete, having spent the
 * capital. Founding structures are deliberately not counted; see the note on
 * `FacilityBlueprint.maxInstances` for why property is not a placement.
 */
export function blueprintInstanceCount(
  placement: StudioPlacement,
  blueprintId: string,
): number {
  let count = 0
  for (const placed of placement.facilities) {
    if (placed.blueprintId === blueprintId) count++
  }
  return count
}

/** The blueprint's allowance, or null when it is unlimited (the default). */
export function blueprintMaxInstances(blueprint: FacilityBlueprint): number | null {
  return blueprint.maxInstances ?? null
}

/** Whether one more of this blueprint would exceed its authored allowance. */
export function blueprintAtInstanceLimit(
  placement: StudioPlacement,
  blueprint: FacilityBlueprint,
): boolean {
  const max = blueprintMaxInstances(blueprint)
  if (max === null) return false
  return blueprintInstanceCount(placement, blueprint.id) >= max
}
