// ── The Studio Queue — the DERIVED law-2 surface (charter §3.3) ──────────────
//
// Owner law 2, in full: *when capacity is unavailable, QUEUE, DON'T MAGICALLY
// FORBID — the player must know WHAT IS WAITING, WHAT IT NEEDS, WHAT OCCUPIES
// IT, and HOW TO RELIEVE THE BOTTLENECK.* Four facts. The engine has always had
// the first two on the blocker and the third on the occupancy board; nothing ever
// joined them, and nothing at all answered the fourth.
//
// This module is that join, and it is DERIVED — computed fresh from the blocker,
// the occupancy union, the countdown and the catalogs. Nothing here enters
// GameState: `occupiedBy`, `alsoMissing` and `remedies` are §3.3's named derived
// fields, and catalog-derived values must never touch byte-parity.
//
// It lives beside `studioCalendar()` and is fed by the same authorities, because
// two readings of "who is waiting for what" is one reading too many.

import { facilitySlotKey } from './occupancy.js'
import { productionWaitWeeks } from './operations.js'
import {
  productionPhaseForRemainingTicksOrNull,
  requirementsForPhase,
} from './productionPhases.js'
import {
  queueEntryLabel,
  queueInPriorityOrder,
  queueWaitWeeks,
} from './productionQueue.js'
import { bindableSetsOn, heldSetIds, setIsUnderRepair } from './sets.js'
import { studioCalendar } from './studioCalendar.js'
import type { StudioCalendarFacilityView } from './studioCalendar.js'
import { FACILITY_BLUEPRINTS, SET_BLUEPRINTS, TUNING } from './tuning.js'
import type {
  FacilityCapability,
  GameState,
  ProductionPhase,
  ProductionQueueEntry,
  StudioSet,
} from './types.js'

/** What a waiter is missing. A capability, or the scenery that stands on one. */
export type StudioQueueNeedView = {
  kind: 'facility' | 'set'
  capability: FacilityCapability | null
  /** The studio's own word for it — "a Post Building slot", "a standing set". */
  label: string
}

/** WHO OCCUPIES IT, and WHEN IT FREES — law 2's third and fourth facts joined. */
export type StudioQueueOccupantView = {
  /** `facilityId:slot` for a room, `set:<id>` for scenery. */
  resourceId: string
  ownerId: string
  title: string
  activity: string
  /**
   * Weeks until this holder gives the resource back, or null when the answer is
   * not a countdown (a screenplay whose due week is unknown, a set with no
   * completion week). PROJECTED: it assumes every command in between is resolved
   * on time, the same assumption the calendar's release week already states.
   */
  freesInWeeks: number | null
}

/** HOW TO RELIEVE IT — the §3.3 Remedy union, and every arm is actionable. */
export type StudioQueueRemedy =
  | {
      /**
       * Build the thing that relieves this — a ROOM from the facility catalog or
       * SCENERY from the set catalog. One arm for both, because "what would fix
       * this" is one question and a player who is short of a set is not short of
       * a different KIND of remedy.
       */
      kind: 'build-blueprint'
      catalog: 'facility' | 'set'
      blueprintId: string
      label: string
      cost: number
      weeks: number
      /** The capacity a facility blueprint adds; null for scenery. */
      capability: FacilityCapability | null
    }
  | { kind: 'wait-for-holder'; ownerId: string; title: string; freesInWeeks: number | null }
  | { kind: 'repair-set'; setId: string; setName: string; cost: number; weeks: number }
  | { kind: 'strike-and-mount'; setId: string; setName: string; stageFacilityId: string; refund: number }
  | { kind: 'cancel-queued-intent'; ordinal: number; label: string }

export type StudioQueueWaiterView = {
  /** A picture already greenlit, or an intent still at the front door. */
  kind: 'production' | 'intent'
  /** `productionId`, or `queue-<ordinal>` for an intent that has no picture yet. */
  id: string
  /** The queue ordinal for an intent; null for a production, which has none. */
  ordinal: number | null
  /** WHAT IS WAITING, in the studio's words. */
  title: string
  /** The phase it is trying to enter, or null for a front-door intent. */
  targetPhase: ProductionPhase | null
  waitingSinceWeek: number
  waitWeeks: number
  /** WHAT IT NEEDS — the thing that actually refused it. */
  needs: StudioQueueNeedView
  /** Everything ELSE the same transition is short of, in requirement order. */
  alsoMissing: readonly StudioQueueNeedView[]
  /** WHAT OCCUPIES IT. */
  occupiedBy: readonly StudioQueueOccupantView[]
  /** WHAT RELIEVES IT. */
  remedies: readonly StudioQueueRemedy[]
  headline: string
  detail: string
}

export type StudioQueueView = {
  week: number
  /** In service order: longest-waiting-first, ordinal tie-break (§3.3). */
  waiters: readonly StudioQueueWaiterView[]
  summary: {
    waitingProductions: number
    waitingIntents: number
    longestWaitWeeks: number
  }
}

/**
 * THE STUDIO'S OWN WORDS for the four capabilities and the six phases.
 *
 * EXPORTED at C2a-M5, not copied. `development-casting` and `preProduction` are
 * engine identifiers; `Development & Casting` and `Pre-production` are what a
 * studio calls them, and the tycoon floor (`00F`) says the player only ever sees
 * the second kind. Every surface that has to name a capability or a phase to a
 * player reads THESE — the queue panel that has always used them, and now the
 * Call Board on the lot, which is the same fact drawn on a placard.
 */
export const CAPABILITY_LABEL: Record<FacilityCapability, string> = {
  'development-casting': 'Development & Casting',
  soundstage: 'Soundstage',
  'set-scenery': 'Scenery Shop',
  post: 'Post Building',
}

export const PHASE_LABEL: Record<ProductionPhase, string> = {
  development: 'Development',
  preProduction: 'Pre-production',
  rehearsal: 'Rehearsal',
  shooting: 'Shooting',
  postProduction: 'Post-production',
  releaseReady: 'Release Ready',
}

function facilityNeed(capability: FacilityCapability): StudioQueueNeedView {
  return { kind: 'facility', capability, label: `a ${CAPABILITY_LABEL[capability]} slot` }
}

const SET_NEED: StudioQueueNeedView = {
  kind: 'set',
  capability: null,
  label: 'a standing set to shoot on',
}

/**
 * How many advances until a picture gives this capability back.
 *
 * Derived from the countdown and the one phase table: walk forward from where
 * the picture is and stop at the first week its phase no longer requires the
 * capability. Retention is already in that answer, because a phase that requires
 * it keeps it.
 */
function weeksUntilCapabilityFrees(
  remainingTicks: number,
  capability: FacilityCapability,
): number | null {
  for (let ticks = remainingTicks; ticks >= 1; ticks--) {
    const phase = productionPhaseForRemainingTicksOrNull(ticks)
    if (phase === null) return null
    if (!requirementsForPhase(phase).includes(capability)) return remainingTicks - ticks
  }
  // Held to the end: the picture releases everything when it leaves for release.
  return remainingTicks
}

function occupantsOf(
  state: GameState,
  capability: FacilityCapability,
  facilities: readonly StudioCalendarFacilityView[],
  excludingOwnerId: string,
): StudioQueueOccupantView[] {
  const occupants: StudioQueueOccupantView[] = []
  for (const facility of facilities) {
    if (facility.capability !== capability) continue
    for (const slot of facility.slots) {
      const occupant = slot.occupant
      if (occupant === null || occupant.ownerId === excludingOwnerId) continue
      occupants.push({
        resourceId: facilitySlotKey(facility.facilityId, slot.slot),
        ownerId: occupant.ownerId,
        title: occupant.title,
        activity: occupant.activity,
        freesInWeeks: freesInWeeksFor(state, occupant.owner, occupant.ownerId, capability),
      })
    }
  }
  return occupants
}

function freesInWeeksFor(
  state: GameState,
  owner: 'production' | 'script' | 'casting',
  ownerId: string,
  capability: FacilityCapability,
): number | null {
  if (owner === 'production') {
    const production = state.studio.activeProductions.find(
      (candidate) => candidate.id === ownerId,
    )
    if (production === undefined) return null
    return weeksUntilCapabilityFrees(production.remainingTicks, capability)
  }
  if (owner === 'script') {
    const project = state.scriptDevelopment.projects.find((candidate) => candidate.id === ownerId)
    if (project?.dueWeek == null) return null
    return Math.max(0, project.dueWeek - state.market.tick)
  }
  const session = state.castingSessions.sessions.find((candidate) => candidate.id === ownerId)
  if (session?.dueWeek == null) return null
  return Math.max(0, session.dueWeek - state.market.tick)
}

/** Every blueprint that would ADD capacity of this capability, with its price. */
function buildRemedies(capability: FacilityCapability): StudioQueueRemedy[] {
  return FACILITY_BLUEPRINTS.filter(
    (blueprint) => blueprint.capability === capability && blueprint.capacity > 0,
  ).map((blueprint) => ({
    kind: 'build-blueprint' as const,
    catalog: 'facility' as const,
    blueprintId: blueprint.id,
    label: blueprint.name,
    cost: blueprint.capex,
    weeks: blueprint.buildWeeks,
    capability,
  }))
}

/**
 * Scenery this studio could BUILD to relieve a set wait.
 *
 * A picture with a stage and nothing standing on it has exactly one remedy that
 * always exists: commission a set. Repair and strike only exist when there is
 * something to repair or strike, which is why they cannot be the whole answer.
 */
function buildSetRemedies(): StudioQueueRemedy[] {
  return SET_BLUEPRINTS.map((blueprint) => ({
    kind: 'build-blueprint' as const,
    catalog: 'set' as const,
    blueprintId: blueprint.id,
    label: blueprint.name,
    cost: blueprint.capex,
    weeks: blueprint.buildWeeks,
    capability: null,
  }))
}

function waitRemedies(occupants: readonly StudioQueueOccupantView[]): StudioQueueRemedy[] {
  return occupants.map((occupant) => ({
    kind: 'wait-for-holder' as const,
    ownerId: occupant.ownerId,
    title: occupant.title,
    freesInWeeks: occupant.freesInWeeks,
  }))
}

/**
 * The scenery remedies for a picture that has a stage and nothing standing on
 * it: repair what is broken, or strike what cannot be used and mount something
 * that can.
 */
function setRemedies(state: GameState, excludingProductionId: string): StudioQueueRemedy[] {
  const remedies: StudioQueueRemedy[] = []
  const held = heldSetIds(state.operations, excludingProductionId)
  for (const set of state.sets) {
    if (set.status !== 'standing') continue
    if (held.has(set.id)) continue
    if (setIsUnderRepair(set)) {
      remedies.push({
        kind: 'repair-set',
        setId: set.id,
        setName: set.name,
        cost: TUNING.SET_REPAIR_COST,
        weeks: TUNING.SET_REPAIR_WEEKS,
      })
      continue
    }
    remedies.push({
      kind: 'strike-and-mount',
      setId: set.id,
      setName: set.name,
      stageFacilityId: set.mountedOn,
      refund: strikeRefundFor(set),
    })
  }
  return remedies
}

function strikeRefundFor(set: StudioSet): number {
  const blueprint = SET_BLUEPRINTS.find((candidate) => candidate.id === set.blueprintId)
  if (blueprint === undefined) return 0
  return Math.round(blueprint.capex * TUNING.SET_DEMOLITION_REFUND_FRACTION)
}

/** Which requirements of the target phase this picture cannot satisfy right now. */
function unmetFor(
  facilities: readonly StudioCalendarFacilityView[],
  targetPhase: ProductionPhase,
  held: readonly FacilityCapability[],
): FacilityCapability[] {
  const unmet: FacilityCapability[] = []
  for (const capability of requirementsForPhase(targetPhase)) {
    if (held.includes(capability)) continue
    const free = facilities
      .filter((facility) => facility.capability === capability)
      .reduce((sum, facility) => sum + facility.available, 0)
    if (free === 0) unmet.push(capability)
  }
  return unmet.filter((capability) => capability !== undefined)
}

/**
 * THE QUEUE, joined (§3.3).
 *
 * Every waiter — a picture held at a phase gate and an intent still at a front
 * door — with all four law-2 facts filled in from authoritative state. Order is
 * the service order: longest-waiting-first, ordinal tie-break.
 */
export function studioQueueView(state: GameState): StudioQueueView {
  const week = state.market.tick
  if (state.operations.mode !== 'managed') {
    return {
      week,
      waiters: [],
      summary: { waitingProductions: 0, waitingIntents: 0, longestWaitWeeks: 0 },
    }
  }
  const calendar = studioCalendar(state)
  const facilities = calendar.facilities
  const waiters: StudioQueueWaiterView[] = []

  // ── Waiters that are PICTURES ───────────────────────────────────────────
  const blocked = state.operations.workflows.filter(
    (workflow) =>
      workflow.blocker !== null &&
      (workflow.blocker.kind === 'facility-capacity' ||
        workflow.blocker.kind === 'set-unavailable'),
  )
  for (const workflow of blocked) {
    const production = state.studio.activeProductions.find(
      (candidate) => candidate.id === workflow.productionId,
    )
    if (production === undefined) continue
    const concept = state.concepts.find((candidate) => candidate.id === production.conceptId)
    const title = concept?.title ?? production.id
    const blocker = workflow.blocker
    if (blocker === null || blocker.kind === 'scenery-load-in') continue
    const targetPhase = blocker.targetPhase
    const held = workflow.reservations.map((reservation) => reservation.capability)
    const waitWeeks = productionWaitWeeks(production, week)

    if (blocker.kind === 'set-unavailable') {
      // A stage IS free — this picture has nowhere to shoot, not nowhere to
      // stand, and the remedy is scenery rather than a building. The stage named
      // is the one the allocator would have taken: the first with a free slot, in
      // the same fixed order it walks.
      const heldSets = heldSetIds(state.operations, production.id)
      const stage = facilities.find(
        (facility) =>
          facility.capability === 'soundstage' &&
          facility.available > 0 &&
          bindableSetsOn(state.sets, facility.facilityId, heldSets).length === 0,
      )
      const occupiedBy: StudioQueueOccupantView[] = state.sets
        .filter((set) => heldSets.has(set.id))
        .map((set) => {
          const owner = state.operations.workflows.find(
            (candidate) => candidate.bindings?.setId === set.id,
          )
          const ownerProduction = state.studio.activeProductions.find(
            (candidate) => candidate.id === owner?.productionId,
          )
          const ownerConcept = state.concepts.find(
            (candidate) => candidate.id === ownerProduction?.conceptId,
          )
          return {
            resourceId: `set:${set.id}`,
            ownerId: owner?.productionId ?? set.id,
            title: ownerConcept?.title ?? set.name,
            activity: owner === undefined ? 'standing' : PHASE_LABEL[owner.phase],
            freesInWeeks:
              ownerProduction === undefined
                ? null
                : weeksUntilCapabilityFrees(ownerProduction.remainingTicks, 'soundstage'),
          }
        })
      waiters.push({
        kind: 'production',
        id: production.id,
        ordinal: null,
        title,
        targetPhase,
        waitingSinceWeek: week - waitWeeks,
        waitWeeks,
        needs: SET_NEED,
        alsoMissing: [],
        occupiedBy,
        remedies: [
          ...setRemedies(state, production.id),
          ...buildSetRemedies(),
          ...waitRemedies(occupiedBy),
        ],
        headline: `${title} has a stage and no set to shoot on`,
        detail:
          stage === undefined
            ? 'No standing set is free for this picture.'
            : `${stage.facilityName} is free, but nothing this picture can shoot on is standing there.`,
      })
      continue
    }

    const occupiedBy = occupantsOf(state, blocker.capability, facilities, production.id)
    const alsoMissing = unmetFor(facilities, targetPhase, held)
      .filter((capability) => capability !== blocker.capability)
      .map(facilityNeed)
    waiters.push({
      kind: 'production',
      id: production.id,
      ordinal: null,
      title,
      targetPhase,
      waitingSinceWeek: week - waitWeeks,
      waitWeeks,
      needs: facilityNeed(blocker.capability),
      alsoMissing,
      occupiedBy,
      remedies: [...waitRemedies(occupiedBy), ...buildRemedies(blocker.capability)],
      headline: `${PHASE_LABEL[targetPhase]} is waiting for ${CAPABILITY_LABEL[blocker.capability]}`,
      // THE HOLDER IS NAMED. The presence truth-gap closes here: the blocker
      // itself still carries only {capability, targetPhase}, and this view is
      // where it is joined to the picture that is actually in the room.
      detail:
        occupiedBy.length === 0
          ? `No ${CAPABILITY_LABEL[blocker.capability]} slot exists for ${title} to move into.`
          : occupiedBy
              .map(
                (occupant) =>
                  `${occupant.title} holds ${CAPABILITY_LABEL[blocker.capability]}${
                    occupant.freesInWeeks === null
                      ? ''
                      : ` and frees it in ${String(occupant.freesInWeeks)} week${occupant.freesInWeeks === 1 ? '' : 's'}`
                  }`,
              )
              .join('; '),
    })
  }

  // ── Waiters that are INTENTS (nothing greenlit, nothing held) ───────────
  const gateOccupants = occupantsOf(state, 'development-casting', facilities, '')
  for (const entry of queueInPriorityOrder(state.productionQueue)) {
    const waitWeeks = queueWaitWeeks(entry, week)
    waiters.push({
      kind: 'intent',
      id: `queue-${String(entry.ordinal)}`,
      ordinal: entry.ordinal,
      title: intentTitle(state, entry),
      targetPhase: null,
      waitingSinceWeek: entry.queuedWeek,
      waitWeeks,
      needs: facilityNeed('development-casting'),
      alsoMissing: [],
      occupiedBy: gateOccupants,
      remedies: [
        ...waitRemedies(gateOccupants),
        ...buildRemedies('development-casting'),
        {
          kind: 'cancel-queued-intent',
          ordinal: entry.ordinal,
          label: `Cancel this ${queueEntryLabel(entry).toLowerCase()}`,
        },
      ],
      headline: `${queueEntryLabel(entry)} is waiting for Development & Casting`,
      detail:
        gateOccupants.length === 0
          ? 'Every Development & Casting slot is spoken for.'
          : gateOccupants
              .map(
                (occupant) =>
                  `${occupant.title} is ${occupant.activity} there${
                    occupant.freesInWeeks === null
                      ? ''
                      : ` and finishes in ${String(occupant.freesInWeeks)} week${occupant.freesInWeeks === 1 ? '' : 's'}`
                  }`,
              )
              .join('; '),
    })
  }

  waiters.sort(
    (a, b) =>
      b.waitWeeks - a.waitWeeks ||
      (a.ordinal ?? -1) - (b.ordinal ?? -1) ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  )

  return {
    week,
    waiters,
    summary: {
      waitingProductions: waiters.filter((waiter) => waiter.kind === 'production').length,
      waitingIntents: waiters.filter((waiter) => waiter.kind === 'intent').length,
      longestWaitWeeks: waiters.reduce((longest, waiter) => Math.max(longest, waiter.waitWeeks), 0),
    },
  }
}

/** What a queued intent is called on a board — the picture, not the payload. */
function intentTitle(state: GameState, entry: ProductionQueueEntry): string {
  switch (entry.kind) {
    case 'commissionScript': {
      const concept = state.concepts.find(
        (candidate) => candidate.id === entry.payload.conceptId,
      )
      return concept === undefined
        ? queueEntryLabel(entry)
        : `“${concept.title}” (screenplay commission)`
    }
    case 'commissionOriginalScreenplay': {
      const writer = state.talent.find((candidate) => candidate.id === entry.payload.writerId)
      return writer === undefined
        ? queueEntryLabel(entry)
        : `An original ${entry.payload.genre} screenplay by ${writer.name}`
    }
    case 'startCastingSession': {
      const project = state.scriptDevelopment.projects.find(
        (candidate) => candidate.id === entry.payload.projectId,
      )
      const concept = state.concepts.find((candidate) => candidate.id === project?.conceptId)
      return concept === undefined
        ? queueEntryLabel(entry)
        : `Camera tests for “${concept.title}”`
    }
    case 'greenlightScriptProject': {
      const project = state.scriptDevelopment.projects.find(
        (candidate) => candidate.id === entry.scriptProjectId,
      )
      const concept = state.concepts.find((candidate) => candidate.id === project?.conceptId)
      return concept === undefined ? queueEntryLabel(entry) : `“${concept.title}” (greenlight)`
    }
  }
}
