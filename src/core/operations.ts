// ── Production Operations V1 ────────────────────────────────────────────────
// Authoritative, deterministic facility allocation and production workflow.
// This module is pure: it consumes no RNG, reads no wall clock, and never mutates
// caller-owned state.

import {
  assertNoDoubleBookedResourceSlots,
  facilitySlotKey,
  occupiedResourceSlots,
} from './occupancy.js'
import type { OccupancySources } from './occupancy.js'
import { QueueableCapacityRefusal } from './productionQueue.js'
import {
  nextProductionPhase,
  productionPhaseForRemainingTicks,
  reachableCapacityBlockerForRemainingTicks,
  requirementsForPhase,
} from './productionPhases.js'
import {
  bindableSetsOn,
  heldSetIds,
  setBindingUplift,
  wearSetAtWrap,
} from './sets.js'
import { disabledStudioEventSink, StudioEventSink } from './studioEvents.js'
import { TUNING } from './tuning.js'
import type {
  FacilityCapability,
  FacilityReservation,
  Genre,
  Production,
  ProductionBlocker,
  ProductionPhase,
  ProductionWorkflow,
  ShootingTask,
  StudioFacility,
  StudioOperations,
  StudioSet,
  WorkflowBindings,
} from './types.js'

/**
 * C2a-M2 — everything the allocator needs to bind a SET as well as a stage.
 *
 * Threaded in rather than reached for, because `operations.ts` is the pure
 * allocation authority and `state.sets` lives outside it. `genreOf` answers what
 * a picture is, which is what the fit half of the uplift is computed from; a
 * production whose concept cannot be resolved gets a null genre and therefore
 * only the quality half, which is honest rather than convenient.
 *
 * ABSENT means "this caller cannot see the sets root" — the frozen save
 * projections and the directly-constructed test states — and every one of those
 * paths carries `requiresSetBinding: false`, so nothing binds and nothing changes.
 */
export type SetBindingContext = {
  sets: readonly StudioSet[]
  genreOf: (productionId: string) => Genre | null
}

// Deep-frozen because this template is part of the public core surface. The live
// state always receives mutable-by-replacement clones; no consumer can alter the
// authoritative defaults or the invariant baseline through this singleton.
//
// C2a-M0: the capacities are named TUNING constants, not literals. The identities,
// names, capabilities, and ARRAY ORDER stay here — they are facility identity, not
// tuning — but "how many shared slots a founding studio starts with" is a number
// C2 is about to make the player change, so it lives in §16 TUNING.
export const INITIAL_STUDIO_FACILITIES: readonly StudioFacility[] = Object.freeze([
  Object.freeze({
    id: 'facility-development-casting',
    name: 'Development & Casting',
    capability: 'development-casting',
    capacity: TUNING.FOUNDING_DEVELOPMENT_CASTING_CAPACITY,
  }),
  Object.freeze({
    id: 'facility-post-building',
    name: 'Post Building',
    capability: 'post',
    capacity: TUNING.FOUNDING_POST_CAPACITY,
  }),
  Object.freeze({
    id: 'facility-scenery-shop',
    name: 'Scenery Shop',
    capability: 'set-scenery',
    capacity: TUNING.FOUNDING_SCENERY_CAPACITY,
  }),
  Object.freeze({
    id: 'facility-soundstage-07',
    name: 'Soundstage 7',
    capability: 'soundstage',
    capacity: TUNING.FOUNDING_SOUNDSTAGE_CAPACITY,
  }),
  Object.freeze({
    id: 'facility-soundstage-12',
    name: 'Soundstage 12',
    capability: 'soundstage',
    capacity: TUNING.FOUNDING_SOUNDSTAGE_CAPACITY,
  }),
]) as readonly StudioFacility[]

// The one construction-created facility authorized by Development & Casting
// Annex V1. Keep this canonical object beside the allocation authority so save,
// construction, and read models cannot drift into lookalike facility records.
export const DEVELOPMENT_CASTING_ANNEX_FACILITY = Object.freeze({
  id: 'facility-development-casting-annex',
  name: 'Development & Casting Annex',
  capability: 'development-casting',
  capacity: 1,
} as const satisfies StudioFacility)

export function emptyStudioOperations(): StudioOperations {
  return { mode: 'legacy', facilities: [], workflows: [] }
}

export function initialManagedStudioOperations(): StudioOperations {
  return {
    mode: 'managed',
    facilities: INITIAL_STUDIO_FACILITIES.map((facility) => ({ ...facility })),
    workflows: [],
  }
}

// The countdown→phase and phase→capability tables now live in ONE place
// (`productionPhases.ts`) that the save validator reads too. Re-exported here
// because this module has been their public address since V8.
export { productionPhaseForRemainingTicks }

function compareId<T extends { id: string }>(a: T, b: T): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

// ── C2a-M1 — the bindings leaf (charter §8.1/§8.3) ──────────────────────────
//
// `bindings` records a production's claim on PHYSICAL production capacity. At M1
// exactly one of its six fields is live: `stageFacilityId`, which mirrors the
// workflow's soundstage reservation, plus `heldSinceWeek`, stamped when that
// stage is acquired and PRESERVED across sticky retention (rehearsal → shooting
// keeps the same stage, so it keeps the same acquisition week — that is the whole
// meaning of the field).
//
// The other four are minted null/false and stay that way this milestone:
//   * `setId`, `lockedNovelty`, `lockedUplift` — bound atomically with the stage
//     at rehearsal entry, which is M2's designed engine change.
//   * `requiresSetBinding` — FALSE for every workflow M1 creates, and that is the
//     literal truth of the state it describes: no production requires a set
//     binding until M2 makes set binding real. M2 mints it true at greenlight.
//     A marker minted true today would be a flag asserting a law nothing enforces.

/**
 * The bindings a workflow holding no stage carries.
 *
 * `requiresSetBinding` is the MARKER, and C2a-M2 mints it TRUE for every picture
 * greenlit in managed mode (§3.1). It is a parameter rather than a constant
 * because the same empty leaf is what a legacy, migrated, or directly-constructed
 * workflow carries, and those are grandfathered: a picture already in flight when
 * set binding arrived keeps its scenery-shop reservation byte-for-byte and never
 * acquires a set.
 */
export function emptyWorkflowBindings(requiresSetBinding = false): WorkflowBindings {
  return {
    requiresSetBinding,
    stageFacilityId: null,
    setId: null,
    lockedNovelty: null,
    lockedUplift: null,
    heldSinceWeek: null,
  }
}

/**
 * Re-derive the bindings leaf from the reservations a workflow now holds.
 *
 * The soundstage reservation is the AUTHORITY — bindings mirror it, never the
 * other way round — so there is exactly one place a stage claim is recorded and
 * the leaf can never drift from it. `week` is the week being advanced, the same
 * clock reading the cash ledger stamps its rows with.
 */
function deriveBindings(
  previous: WorkflowBindings,
  reservations: readonly FacilityReservation[],
  week: number,
): WorkflowBindings {
  const stage = reservations.find((reservation) => reservation.capability === 'soundstage')
  if (stage === undefined) {
    return { ...previous, stageFacilityId: null, heldSinceWeek: null }
  }
  const retained =
    previous.stageFacilityId === stage.facilityId && previous.heldSinceWeek !== null
  return {
    ...previous,
    stageFacilityId: stage.facilityId,
    heldSinceWeek: retained ? previous.heldSinceWeek : week,
  }
}

// Every slot this workflow must treat as taken: the OTHER productions' slots,
// from the one union producer, plus whatever the tick boundary already knows
// screenplays and auditions are holding. The workflow's own slots are excluded so
// retention can re-claim them.
function occupiedSlots(
  operations: StudioOperations,
  excludingProductionId: string,
  externallyOccupiedSlots: ReadonlySet<string> = new Set<string>(),
): Set<string> {
  const occupied = new Set<string>(externallyOccupiedSlots)
  for (const key of occupiedResourceSlots(
    { operations },
    {
      owners: ['production'],
      excludeOwner: 'production',
      excludeOwnerId: excludingProductionId,
    },
  ).keys()) {
    occupied.add(key)
  }
  return occupied
}

type AllocationResult =
  | { ok: true; reservations: FacilityReservation[]; boundSet: StudioSet | null }
  | { ok: false; blocker: ProductionBlocker }

/**
 * Whether this workflow must hold a SET to enter `targetPhase`.
 *
 * The composite is stage + set, so the requirement lands exactly where the stage
 * requirement does — no second table, and no phase can require a set without
 * requiring somewhere to put it.
 */
function requiresSetForPhase(
  workflow: ProductionWorkflow,
  targetPhase: ProductionPhase,
  binding: SetBindingContext | undefined,
): boolean {
  return (
    binding !== undefined &&
    workflow.bindings?.requiresSetBinding === true &&
    requirementsForPhase(targetPhase).includes('soundstage')
  )
}

function allocateForPhase(
  operations: StudioOperations,
  workflow: ProductionWorkflow,
  targetPhase: ProductionPhase,
  externallyOccupiedSlots: ReadonlySet<string> = new Set<string>(),
  binding?: SetBindingContext,
): AllocationResult {
  const occupied = occupiedSlots(operations, workflow.productionId, externallyOccupiedSlots)
  const reservations: FacilityReservation[] = []
  const facilities = [...operations.facilities].sort(compareId)

  // ── THE STAGE+SET COMPOSITE (charter §3.2) ────────────────────────────────
  //
  // ATOMIC, and that is the whole design: a stage with no set on it is not a
  // place a picture can shoot, so the allocator may not hand one out. Acquiring
  // them together is what makes lane 2's X1 deadlock cycle impossible rather than
  // merely unlikely — there is no moment at which a picture holds one and waits
  // for the other.
  //
  // RETENTION FIRST. A picture already standing on its set keeps it through
  // shooting, exactly as it keeps its stage: `bindings.setId` survives, no
  // candidate search runs, and the crew does not move.
  const needsSet = requiresSetForPhase(workflow, targetPhase, binding)
  const retainedSetId = workflow.bindings?.setId ?? null
  const retainingSet =
    needsSet &&
    retainedSetId !== null &&
    workflow.reservations.some((reservation) => reservation.capability === 'soundstage')
  let boundSet: StudioSet | null = null
  if (needsSet && !retainingSet && binding !== undefined) {
    const held = heldSetIds(operations, workflow.productionId)
    let sawFreeStage = false
    for (const facility of facilities) {
      if (facility.capability !== 'soundstage') continue
      let free = -1
      for (let slot = 0; slot < facility.capacity; slot++) {
        if (!occupied.has(facilitySlotKey(facility.id, slot))) {
          free = slot
          break
        }
      }
      if (free < 0) continue
      sawFreeStage = true
      const candidates = bindableSetsOn(binding.sets, facility.id, held)
      // AUTO-BIND WHEN EXACTLY ONE CANDIDATE IS FREE (§3.1). In V1 a stage carries
      // at most one set, so "the first candidate on the first stage that has one"
      // IS that rule — and it is deterministic, because both walks are in a fixed
      // order.
      if (candidates.length === 0) continue
      boundSet = candidates[0]!
      break
    }
    if (boundSet === null) {
      // TWO DIFFERENT REFUSALS, and telling them apart is the point. A picture
      // with nowhere to shoot is waiting on a STAGE; a picture with a stage and
      // no scenery on it is waiting on a SET, and the remedy for the second one
      // is to build or repair a set rather than to wait for a stage to clear.
      return {
        ok: false,
        blocker: sawFreeStage
          ? { kind: 'set-unavailable', targetPhase }
          : { kind: 'facility-capacity', capability: 'soundstage', targetPhase },
      }
    }
  }

  // STICKY RETENTION, FOR EVERY CAPABILITY (charter §3.2, the R-1
  // contract-conformance repair). A reservation whose capability the next phase
  // ALSO requires is retained — same facility, same slot — instead of being
  // re-allocated first-fit.
  //
  // This was soundstage-only, and that was a defect, not a design:
  // DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:500 requires "no reservation
  // migration", :243-244 that "existing reservations never move merely because
  // another facility became available", and :494-495 that
  // "Development-to-Pre-production retains the production's existing slot". Under
  // first-fit-ascending-by-id, a picture holding the Annex moved to
  // `facility-development-casting` the moment a base slot freed — and the lot
  // renders those as two different buildings, so the crew visibly teleported
  // across the lot for no authoritative reason.
  //
  // Retaining is always legal here: the workflow's own slots are excluded from
  // `occupied`, so the slot it already holds is by construction free to re-claim.
  const alreadyRetained = new Set<FacilityCapability>()

  for (const capability of requirementsForPhase(targetPhase)) {
    // One held reservation per capability may be carried across; a second
    // requirement of the same capability allocates fresh.
    const retained = alreadyRetained.has(capability)
      ? undefined
      : workflow.reservations.find((reservation) => reservation.capability === capability)
    if (retained !== undefined) {
      alreadyRetained.add(capability)
      reservations.push({ ...retained, phase: targetPhase })
      occupied.add(facilitySlotKey(retained.facilityId, retained.slot))
      continue
    }

    let allocated: FacilityReservation | null = null
    for (const facility of facilities) {
      if (facility.capability !== capability) continue
      // The composite already chose the stage — the one its set stands on — so
      // the general first-fit walk is not allowed to pick a different one.
      if (capability === 'soundstage' && boundSet !== null && facility.id !== boundSet.mountedOn) {
        continue
      }
      for (let slot = 0; slot < facility.capacity; slot++) {
        const key = facilitySlotKey(facility.id, slot)
        if (occupied.has(key)) continue
        allocated = {
          productionId: workflow.productionId,
          facilityId: facility.id,
          capability,
          slot,
          phase: targetPhase,
        }
        occupied.add(key)
        break
      }
      if (allocated !== null) break
    }

    if (allocated === null) {
      return {
        ok: false,
        blocker: { kind: 'facility-capacity', capability, targetPhase },
      }
    }
    reservations.push(allocated)
  }

  return { ok: true, reservations, boundSet }
}

// ── C2a-M1 — the studioEvents producers (charter §5) ────────────────────────
//
// The engine states the FACT; the log stamps it. These are the REAL transition
// sites — the places where a reservation is actually granted or released and a
// phase is actually entered — not a summary pass that re-derives them afterwards.
// A re-derived event is a second implementation of the same truth, and the whole
// reason this ledger exists is that seventeen consumers were each doing exactly
// that.
//
// `resourceKey` is the BARE `facilityId:slot` address the allocation layer has
// exchanged since V8 — deliberately NOT the union producer's kind-qualified
// runtime key. C2a-M0 reserved the `facility:` / `stage:` / `set:` / `mount:`
// namespace as a RUNTIME fact and stated plainly that nothing kind-qualified is
// persisted; writing one into a save would freeze that namespace into the file
// format a milestone before the kinds it reserves actually exist, and there is a
// sealed M0 assertion that says so. When M2 gives a set its own address, the
// milestone that adds the kind can rule on what its rows carry.

/**
 * Record what a workflow's reservation set GAINED and LOST across a transition.
 *
 * Retention is invisible here by construction: a slot present on both sides
 * produces no row, which is exactly right — a picture that keeps the stage it
 * already had neither released nor was granted anything, and saying otherwise
 * would make the log claim the crew moved when nobody moved.
 *
 * Releases are recorded before grants, in the workflow's own reservation order,
 * so the sequence is a deterministic function of state.
 */
function recordReservationTransition(
  events: StudioEventSink,
  workflow: ProductionWorkflow,
  next: readonly FacilityReservation[],
): void {
  if (!events.enabled) return
  const keyOf = (reservation: FacilityReservation): string =>
    facilitySlotKey(reservation.facilityId, reservation.slot)
  const before = workflow.reservations.map(keyOf)
  const after = next.map(keyOf)
  for (const key of before) {
    if (!after.includes(key)) {
      events.append({ kind: 'reservationReleased', ownerId: workflow.productionId, resourceKey: key })
    }
  }
  for (const key of after) {
    if (!before.includes(key)) {
      events.append({ kind: 'reservationGranted', ownerId: workflow.productionId, resourceKey: key })
    }
  }
}

function replaceWorkflow(
  operations: StudioOperations,
  replacement: ProductionWorkflow,
): StudioOperations {
  return {
    ...operations,
    workflows: operations.workflows.map((workflow) =>
      workflow.productionId === replacement.productionId ? replacement : workflow,
    ),
  }
}

export function addManagedProductionWorkflow(
  operations: StudioOperations,
  production: Production,
  externallyOccupiedSlots: ReadonlySet<string> = new Set<string>(),
  events: StudioEventSink = disabledStudioEventSink(),
  // C2a-M2: whether this greenlight requires a set. TRUE at every managed V14+
  // greenlight; the default is false so every frozen projection and
  // directly-constructed test state keeps the grandfathered leaf it had.
  requiresSetBinding = false,
): StudioOperations {
  if (operations.mode !== 'managed') return operations
  if (operations.workflows.some((workflow) => workflow.productionId === production.id)) {
    throw new Error(
      `applyActions: managed greenlight found duplicate workflow for productionId "${production.id}"`,
    )
  }
  const phase = productionPhaseForRemainingTicks(production.remainingTicks)
  const draft: ProductionWorkflow = {
    productionId: production.id,
    phase,
    reservations: [],
    shootingTask: null,
    blocker: null,
    bindings: emptyWorkflowBindings(requiresSetBinding),
  }
  const withDraft: StudioOperations = {
    ...operations,
    workflows: [...operations.workflows, draft],
  }
  const allocation = allocateForPhase(
    withDraft,
    draft,
    phase,
    externallyOccupiedSlots,
  )
  if (!allocation.ok) {
    // C2a-M4 (§3.3): the SAME sentence, now a NAMED refusal. A greenlight opens
    // in Development, whose only requirement is the shared Development & Casting
    // slot, so this refusal is always the gate's — and the front door turns it
    // into a queued intent instead of throwing a finished picture away.
    throw new QueueableCapacityRefusal(
      `applyActions: managed greenlight rejected — no ${allocation.blocker.kind === 'facility-capacity' ? allocation.blocker.capability : 'required facility'} capacity for productionId "${production.id}"`,
      allocation.blocker.kind === 'facility-capacity'
        ? allocation.blocker.capability
        : 'development-casting',
    )
  }
  // GREENLIGHT FORMATION, recorded where it happens: the picture takes its first
  // slots and enters Development. Both rows are Tier W — this is operating
  // history, not identity — and the production id they carry is already
  // permanent by the time the ledger sees it.
  recordReservationTransition(events, draft, allocation.reservations)
  events.append({ kind: 'phaseEntered', productionId: production.id, phase })
  return replaceWorkflow(withDraft, {
    ...draft,
    reservations: allocation.reservations,
    // A greenlight opens in Development, which holds no stage, so this derives
    // the empty leaf today. It is derived rather than assumed so the leaf has ONE
    // producer: the reservations a workflow actually holds. `startTick` is the
    // greenlight week — the production's own record of when it began.
    bindings: deriveBindings(draft.bindings, allocation.reservations, production.startTick),
  })
}

export function removeManagedProductionWorkflow(
  operations: StudioOperations,
  productionId: string,
): StudioOperations {
  if (operations.mode !== 'managed') return operations
  return {
    ...operations,
    workflows: operations.workflows.filter((workflow) => workflow.productionId !== productionId),
  }
}

function requireManagedWorkflow(
  operations: StudioOperations,
  productionId: string,
  actionName: string,
): ProductionWorkflow {
  if (operations.mode !== 'managed') {
    throw new Error(`applyActions: ${actionName} rejected — studio operations are not managed`)
  }
  const workflow = operations.workflows.find((candidate) => candidate.productionId === productionId)
  if (workflow === undefined) {
    throw new Error(
      `applyActions: ${actionName} references productionId "${productionId}" without an active managed workflow`,
    )
  }
  return workflow
}

export function assignShootingDirector(
  operations: StudioOperations,
  production: Production,
  directorId: string,
): StudioOperations {
  const workflow = requireManagedWorkflow(operations, production.id, 'assignShootingDirector')
  if (workflow.phase !== 'shooting' || workflow.shootingTask === null) {
    throw new Error(
      `applyActions: assignShootingDirector rejected — productionId "${production.id}" is not in Shooting`,
    )
  }
  if (directorId !== production.directorId || directorId !== workflow.shootingTask.directorId) {
    throw new Error(
      `applyActions: assignShootingDirector rejected — directorId "${directorId}" is not productionId "${production.id}"'s locked director`,
    )
  }
  if (workflow.shootingTask.status !== 'unassigned' || workflow.blocker !== null) {
    throw new Error(
      `applyActions: assignShootingDirector rejected — productionId "${production.id}" task is ${workflow.shootingTask.status}`,
    )
  }
  const task: ShootingTask = { ...workflow.shootingTask, status: 'blocked' }
  return replaceWorkflow(operations, {
    ...workflow,
    shootingTask: task,
    blocker: { kind: 'scenery-load-in', taskId: task.id },
  })
}

export function clearSceneryLoadIn(
  operations: StudioOperations,
  productionId: string,
  events: StudioEventSink = disabledStudioEventSink(),
): StudioOperations {
  const workflow = requireManagedWorkflow(operations, productionId, 'clearSceneryLoadIn')
  const task = workflow.shootingTask
  if (
    workflow.phase !== 'shooting' ||
    task === null ||
    task.status !== 'blocked' ||
    workflow.blocker?.kind !== 'scenery-load-in' ||
    workflow.blocker.taskId !== task.id
  ) {
    throw new Error(
      `applyActions: clearSceneryLoadIn rejected — productionId "${productionId}" has no active scenery-load-in blocker`,
    )
  }
  // The scenery reached the stage — the one load-in fact the world already
  // animates and the only thing standing between a blocked take and a ready one.
  events.append({ kind: 'sceneryArrived', productionId })
  return replaceWorkflow(operations, {
    ...workflow,
    shootingTask: { ...task, status: 'ready' },
    blocker: null,
  })
}

export function scheduleShootingTake(
  operations: StudioOperations,
  productionId: string,
): StudioOperations {
  const workflow = requireManagedWorkflow(operations, productionId, 'scheduleShootingTake')
  const task = workflow.shootingTask
  if (
    workflow.phase !== 'shooting' ||
    task === null ||
    task.status !== 'ready' ||
    workflow.blocker !== null
  ) {
    throw new Error(
      `applyActions: scheduleShootingTake rejected — productionId "${productionId}" shooting task is not ready`,
    )
  }
  return replaceWorkflow(operations, {
    ...workflow,
    shootingTask: { ...task, status: 'scheduled' },
  })
}

function invariant(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`operations invariant: ${message}`)
}

/**
 * The blockers that describe "the NEXT phase cannot start yet" — as opposed to
 * `scenery-load-in`, which is a THIS-phase blocker and may exist only in
 * Shooting. `facility-capacity` (no slot) and `set-unavailable` (no standing set)
 * are the same shape of refusal about two different kinds of resource.
 */
function isNextPhaseBlocker(blocker: ProductionBlocker | null): boolean {
  return (
    blocker === null || blocker.kind === 'facility-capacity' || blocker.kind === 'set-unavailable'
  )
}

// Shared core/save boundary. Callers should first establish the outer object/array
// shape; this assertion then enforces every cross-reference and capacity law.
export function assertStudioOperationsInvariants(
  operations: StudioOperations,
  productions: readonly Production[],
  options?: {
    facilityPolicy?: 'initial-v1' | 'configured' | 'annex-v1' | 'placement-v12'
    annexOperational?: boolean
    // Required with `placement-v12`: the exact operational placed facilities that
    // must follow the initial five, in weekly-completion append order.
    placedFacilities?: readonly StudioFacility[]
    // C2a-M0 defense-in-depth (§3.2). The OTHER roots that can hold a facility
    // slot, when the caller can see them. Supplying them turns the overbooking
    // invariant below from "productions against each other" into the full
    // cross-owner refusal. Allocation is already cross-owner aware, so this must
    // never fire on a legal state — it exists for the day a new holder is added
    // and one allocator is missed.
    sharedOccupancy?: Omit<OccupancySources, 'operations'>
  },
): void {
  if (operations.mode === 'legacy') {
    invariant(operations.facilities.length === 0, 'legacy mode must have no facilities')
    invariant(operations.workflows.length === 0, 'legacy mode must have no workflows')
    return
  }
  invariant(operations.mode === 'managed', `unknown mode ${String(operations.mode)}`)
  const facilityIds = new Set<string>()
  const facilityCapabilities = new Set<FacilityCapability>()
  for (const facility of operations.facilities) {
    invariant(facility.id.length > 0, 'facility id must be non-empty')
    invariant(facility.name.length > 0, `facility "${facility.id}" name must be non-empty`)
    invariant(!facilityIds.has(facility.id), `duplicate facility id "${facility.id}"`)
    invariant(
      Number.isInteger(facility.capacity) && facility.capacity > 0,
      `facility "${facility.id}" capacity must be a positive integer`,
    )
    facilityIds.add(facility.id)
    facilityCapabilities.add(facility.capability)
  }
  for (const capability of [
    'development-casting',
    'soundstage',
    'set-scenery',
    'post',
  ] as const) {
    invariant(facilityCapabilities.has(capability), `managed operations have no ${capability} facility`)
  }

  const facilityPolicy = options?.facilityPolicy ?? 'initial-v1'
  if (facilityPolicy === 'initial-v1') {
    invariant(
      operations.facilities.length === INITIAL_STUDIO_FACILITIES.length,
      'managed V1 facility count differs from the initial facility truth',
    )
    for (let i = 0; i < INITIAL_STUDIO_FACILITIES.length; i++) {
      const actual = operations.facilities[i]!
      const expected = INITIAL_STUDIO_FACILITIES[i]!
      invariant(
        actual.id === expected.id &&
          actual.name === expected.name &&
          actual.capability === expected.capability &&
          actual.capacity === expected.capacity,
        `managed facility at index ${String(i)} differs from ${expected.id}`,
      )
    }
  } else if (facilityPolicy === 'annex-v1') {
    invariant(
      typeof options?.annexOperational === 'boolean',
      'annex-v1 policy requires an exact annexOperational lifecycle fact',
    )
    const expected = options.annexOperational
      ? [...INITIAL_STUDIO_FACILITIES, DEVELOPMENT_CASTING_ANNEX_FACILITY]
      : INITIAL_STUDIO_FACILITIES
    invariant(
      operations.facilities.length === expected.length,
      'managed Annex V1 facility count disagrees with construction lifecycle',
    )
    for (let i = 0; i < expected.length; i++) {
      const actual = operations.facilities[i]!
      const canonical = expected[i]!
      invariant(
        actual.id === canonical.id &&
          actual.name === canonical.name &&
          actual.capability === canonical.capability &&
          actual.capacity === canonical.capacity,
        `managed Annex V1 facility at index ${String(i)} differs from ${canonical.id}`,
      )
    }
  } else if (facilityPolicy === 'placement-v12') {
    // The V12 facility set is the initial five followed by every OPERATIONAL
    // placed facility, in the order the weekly completion pass appends them.
    // A construction site contributes nothing until it flips.
    const placed = options?.placedFacilities
    invariant(
      placed !== undefined,
      'placement-v12 policy requires the exact operational placed facility list',
    )
    const expected = [...INITIAL_STUDIO_FACILITIES, ...placed]
    invariant(
      operations.facilities.length === expected.length,
      'managed V12 facility count disagrees with the placement lifecycle',
    )
    for (let i = 0; i < expected.length; i++) {
      const actual = operations.facilities[i]!
      const canonical = expected[i]!
      invariant(
        actual.id === canonical.id &&
          actual.name === canonical.name &&
          actual.capability === canonical.capability &&
          actual.capacity === canonical.capacity,
        `managed V12 facility at index ${String(i)} differs from ${canonical.id}`,
      )
    }
  }

  const productionById = new Map<string, Production>()
  for (const production of productions) {
    invariant(!productionById.has(production.id), `duplicate active productionId "${production.id}"`)
    productionById.set(production.id, production)
  }
  invariant(
    operations.workflows.length === productions.length,
    'managed active productions and workflows must be one-to-one',
  )
  const workflowIds = new Set<string>()
  const facilityById = new Map(operations.facilities.map((facility) => [facility.id, facility]))

  for (const workflow of operations.workflows) {
    invariant(!workflowIds.has(workflow.productionId), `duplicate workflow for "${workflow.productionId}"`)
    workflowIds.add(workflow.productionId)
    const production = productionById.get(workflow.productionId)
    invariant(production !== undefined, `workflow "${workflow.productionId}" has no active production`)
    invariant(
      workflow.phase === productionPhaseForRemainingTicks(production.remainingTicks),
      `workflow "${workflow.productionId}" phase disagrees with remainingTicks`,
    )

    const expectedCapabilities = [...requirementsForPhase(workflow.phase)].sort()
    const actualCapabilities = workflow.reservations.map((reservation) => reservation.capability).sort()
    invariant(
      JSON.stringify(actualCapabilities) === JSON.stringify(expectedCapabilities),
      `workflow "${workflow.productionId}" has the wrong current-phase reservation set`,
    )
    for (const reservation of workflow.reservations) {
      const facility = facilityById.get(reservation.facilityId)
      invariant(facility !== undefined, `reservation references unknown facility "${reservation.facilityId}"`)
      invariant(
        reservation.productionId === workflow.productionId,
        `reservation owner disagrees with workflow "${workflow.productionId}"`,
      )
      invariant(
        reservation.capability === facility.capability,
        `reservation capability disagrees with facility "${facility.id}"`,
      )
      invariant(reservation.phase === workflow.phase, 'reservation phase disagrees with workflow phase')
      invariant(
        Number.isInteger(reservation.slot) && reservation.slot >= 0 && reservation.slot < facility.capacity,
        `reservation slot is outside facility "${facility.id}" capacity`,
      )
    }

    // C2a-M1: the bindings leaf MIRRORS the reservations, so the two can never
    // disagree about which stage a picture is standing on. Everything else on the
    // leaf is M2's; this is the one law that exists to enforce today, and it is
    // the law the V14 migration derivation depends on being true.
    //
    // The leaf is checked ONLY WHEN PRESENT, and that is not laxity: this
    // authority also runs over FROZEN pre-V14 fragments (the save validators
    // strip the V14 roots and re-validate the older shape), and a genuine V13
    // workflow has no `bindings` at all. Refusing those would make every save on
    // a player's disk unreadable — version-awareness has two halves, and this is
    // the second one. The V14 validator separately REQUIRES the leaf, so a V14
    // save cannot reach here without it.
    const bindings = workflow.bindings as WorkflowBindings | undefined
    if (bindings !== undefined) {
      const boundStage = workflow.reservations.find(
        (reservation) => reservation.capability === 'soundstage',
      )
      invariant(
        bindings.stageFacilityId === (boundStage?.facilityId ?? null),
        `workflow "${workflow.productionId}" bindings.stageFacilityId disagrees with its soundstage reservation`,
      )
      invariant(
        bindings.heldSinceWeek === null ||
          (Number.isInteger(bindings.heldSinceWeek) && bindings.heldSinceWeek >= 0),
        `workflow "${workflow.productionId}" bindings.heldSinceWeek must be a week or null`,
      )
    }

    if (workflow.phase === 'shooting') {
      const task = workflow.shootingTask
      invariant(task !== null, `shooting workflow "${workflow.productionId}" has no shooting task`)
      invariant(task.id === `shooting:${production.id}`, 'shooting task id is not canonical')
      invariant(task.productionId === production.id, 'shooting task owner disagrees with production')
      invariant(task.directorId === production.directorId, 'shooting task director is not the locked director')
      const stage = workflow.reservations.find(
        (reservation) => reservation.capability === 'soundstage',
      )
      invariant(stage !== undefined, 'shooting task has no soundstage reservation')
      invariant(
        task.soundstageFacilityId === stage.facilityId,
        'shooting task destination disagrees with its soundstage reservation',
      )
      if (production.remainingTicks === 4) {
        invariant(task.status === 'completed', 'second Shooting week requires a completed take')
      } else {
        invariant(production.remainingTicks === 5, 'Shooting remainingTicks must be 5 or 4')
        invariant(task.status !== 'completed', 'take cannot be completed before its advancing tick')
      }
      if (task.status === 'blocked') {
        invariant(
          workflow.blocker?.kind === 'scenery-load-in' && workflow.blocker.taskId === task.id,
          'blocked shooting task must own the scenery-load-in blocker',
        )
      } else if (task.status === 'completed') {
        invariant(
          isNextPhaseBlocker(workflow.blocker),
          'a completed take may only be held by next-phase facility capacity',
        )
      } else {
        invariant(workflow.blocker === null, `shooting task status ${task.status} cannot have a blocker`)
      }
    } else {
      invariant(workflow.shootingTask === null, 'shooting task must be cleared outside Shooting')
      invariant(
        isNextPhaseBlocker(workflow.blocker),
        'scenery blocker may exist only in Shooting',
      )
    }

    // C2a-M1: the `set-unavailable` arm is persisted schema with no producer
    // until M2 binds sets. It is admitted here — rather than refused as an
    // unknown kind — so the save validator and this authority agree about what a
    // legal state may CARRY; what it may MEAN is M2's. The one law that applies
    // today is the one every next-phase blocker obeys: it names the next
    // scheduled phase and nothing else.
    if (workflow.blocker?.kind === 'set-unavailable') {
      invariant(
        nextProductionPhase(workflow.phase) === workflow.blocker.targetPhase,
        `set-unavailable blocker must target the next scheduled phase after ${workflow.phase}`,
      )
    }

    if (workflow.blocker?.kind === 'facility-capacity') {
      // Derived from the one phase table, not hand-tabled a third time: the only
      // reachable refusal is the first capability the NEXT phase requires that
      // this phase does not already hold and carry across (sticky retention).
      const reachableBlocker = reachableCapacityBlockerForRemainingTicks(
        production.remainingTicks,
      )
      invariant(
        reachableBlocker !== null,
        `workflow "${workflow.productionId}" cannot have a capacity blocker at remainingTicks ${String(production.remainingTicks)}`,
      )
      invariant(
        workflow.blocker.targetPhase === reachableBlocker.targetPhase &&
          workflow.blocker.capability === reachableBlocker.capability,
        `capacity blocker must be ${reachableBlocker.capability} for ${reachableBlocker.targetPhase}`,
      )
    }
  }

  // FAIL-CLOSED, from the one union producer. Every reservation above has already
  // proved its facility, capability, phase, and slot range; what is left is the
  // cross-owner question — is any slot claimed twice? — and that question now has
  // exactly one implementation, so the day Sets become a sixth holder there is
  // one place to teach.
  //
  // `sharedOccupancy` widens it from "productions against each other" to the full
  // cross-owner check. Callers that can see the screenplay and audition roots pass
  // them; callers that legitimately cannot (the frozen V8 save projection) still
  // get the production-against-production law.
  assertNoDoubleBookedResourceSlots(
    { operations, ...(options?.sharedOccupancy ?? {}) },
    (booking) => `operations invariant: facility slot "${booking.facilitySlotKey}" is overbooked`,
  )

  for (const production of productions) {
    invariant(workflowIds.has(production.id), `active production "${production.id}" has no workflow`)
  }
}

function enterPhase(
  operations: StudioOperations,
  workflow: ProductionWorkflow,
  production: Production,
  targetPhase: ProductionPhase,
  externallyOccupiedSlots: ReadonlySet<string>,
  week: number,
  events: StudioEventSink,
  binding?: SetBindingContext,
  sets: readonly StudioSet[] = [],
): {
  operations: StudioOperations
  production: Production
  advanced: boolean
  sets: readonly StudioSet[]
} {
  const allocation = allocateForPhase(
    operations,
    workflow,
    targetPhase,
    externallyOccupiedSlots,
    binding,
  )
  if (!allocation.ok) {
    return {
      operations: replaceWorkflow(operations, { ...workflow, blocker: allocation.blocker }),
      production,
      advanced: false,
      sets,
    }
  }

  // ── THE WRAP EVENT (charter §4.3-M1) ──────────────────────────────────────
  //
  // Wrap is the authoritative completion of SHOOTING — automatic, never a player
  // command — and this is the boundary it happens on: the silent
  // `remainingTicks 4 → 3` transition out of Shooting. The row is Tier D and
  // PERMANENT, because "this picture wrapped on this stage in this week" is the
  // studio's history, not its operating chatter.
  //
  // It is emitted UNCONDITIONALLY at that boundary — nothing about Post's
  // availability gates it, because wrap is a fact about the work that finished,
  // not about the work that comes next.
  //
  // WHAT IS NOT HERE, stated so the next milestone does not have to infer it: the
  // RESOURCE-RELEASE LAW (`00E`.5) says a completed phase releases its resources
  // even when the next resource is unavailable — shooting completes, stage and
  // set release, the picture queues for Post holding nothing. Today's transition
  // is still atomic, so the stage is released as part of entering Post. That
  // split is M4's designed engine change; M1's event lands on the boundary AS IT
  // EXISTS, which is exactly what the charter asks for.
  //
  // `setId` is null until M2 binds sets. It is null, not absent: the row's shape
  // is permanent, and a picture that shot on no bound set shot on no bound set.
  let nextSets = sets
  if (workflow.phase === 'shooting' && targetPhase === 'postProduction') {
    const stage = workflow.reservations.find(
      (reservation) => reservation.capability === 'soundstage',
    )
    if (stage === undefined) {
      throw new Error(
        `tick: shooting productionId "${production.id}" completed without a soundstage reservation`,
      )
    }
    // C2a-M2: the row now names the SET the picture shot on as well as the stage
    // it stood in. `null` still means what it always meant — this picture was
    // bound to no set — and that is the literal truth of a legacy, migrated, or
    // pre-V14 production.
    const wrappedSetId = workflow.bindings?.setId ?? null
    events.append({
      kind: 'wrapped',
      productionId: production.id,
      stageFacilityId: stage.facilityId,
      setId: wrappedSetId,
    })
    // THE WEAR, at the moment the work finished. Per-USE and deterministic (§3.1)
    // — one wrap, one wear, no clock and no draw — and applied HERE rather than
    // at release because it is the shooting that wore the scenery out, and a
    // picture that never reaches an audience wore it just the same.
    nextSets = wearSetAtWrap(nextSets, wrappedSetId)
  }

  recordReservationTransition(events, workflow, allocation.reservations)
  events.append({ kind: 'phaseEntered', productionId: production.id, phase: targetPhase })

  const shootingTask: ShootingTask | null =
    targetPhase === 'shooting'
      ? {
          id: `shooting:${production.id}`,
          productionId: production.id,
          directorId: production.directorId,
          soundstageFacilityId: allocation.reservations.find(
            (reservation) => reservation.capability === 'soundstage',
          )!.facilityId,
          status: 'unassigned',
        }
      : null

  // ── THE LOCK (charter §3.1) ───────────────────────────────────────────────
  //
  // Quality and fit become ONE number at the moment of binding, and novelty is
  // snapshotted beside it. Both are locked because a set's novelty depletes and
  // its condition wears while a picture is shooting on it: if the picture read
  // the set's live numbers at release, its own use of the set would retroactively
  // change what the set gave it.
  //
  // The lock happens exactly once, on the advance that acquires the set. A
  // retained binding keeps the numbers it was given.
  const derived = deriveBindings(workflow.bindings, allocation.reservations, week)
  const bindings: WorkflowBindings =
    allocation.boundSet === null
      ? derived
      : {
          ...derived,
          setId: allocation.boundSet.id,
          lockedNovelty: allocation.boundSet.novelty,
          lockedUplift: setBindingUplift(
            allocation.boundSet,
            binding?.genreOf(production.id) ?? null,
          ),
        }

  const replacement: ProductionWorkflow = {
    ...workflow,
    phase: targetPhase,
    reservations: allocation.reservations,
    shootingTask,
    blocker: null,
    bindings,
  }
  return {
    operations: replaceWorkflow(operations, replacement),
    production: { ...production, remainingTicks: production.remainingTicks - 1 },
    advanced: true,
    sets: nextSets,
  }
}

export type ManagedProductionAdvance = {
  productions: Production[]
  operations: StudioOperations
  /** The sets root after this advance — wear at wrap is the only thing that moves it. */
  sets: readonly StudioSet[]
}

export function advanceManagedProductions(
  operations: StudioOperations,
  productions: readonly Production[],
  currentTick: number,
  externallyOccupiedSlots: ReadonlySet<string> = new Set<string>(),
  events: StudioEventSink = disabledStudioEventSink(),
  binding?: SetBindingContext,
): ManagedProductionAdvance {
  let sets: readonly StudioSet[] = binding?.sets ?? []
  if (operations.mode !== 'managed') {
    return {
      productions: productions.map((production) =>
        production.startTick < currentTick
          ? { ...production, remainingTicks: production.remainingTicks - 1 }
          : production,
      ),
      operations,
      sets,
    }
  }

  let nextOperations = operations
  const byId = new Map<string, Production>()
  for (const production of productions) byId.set(production.id, production)
  const ordered = [...productions].sort(compareId)

  for (const original of ordered) {
    if (original.startTick >= currentTick) continue
    let production = byId.get(original.id)!
    const workflow = nextOperations.workflows.find(
      (candidate) => candidate.productionId === production.id,
    )
    if (workflow === undefined) {
      throw new Error(
        `tick: managed productionId "${production.id}" has no authoritative workflow`,
      )
    }
    const expectedPhase = productionPhaseForRemainingTicks(production.remainingTicks)
    if (workflow.phase !== expectedPhase) {
      throw new Error(
        `tick: managed productionId "${production.id}" phase ${workflow.phase} disagrees with remainingTicks ${String(production.remainingTicks)}`,
      )
    }

    // The first Shooting week advances only after the authoritative take was
    // scheduled; that same tick completes it. All other same-phase weeks advance.
    if (production.remainingTicks === 5) {
      const task = workflow.shootingTask
      if (task === null || task.status !== 'scheduled' || workflow.blocker !== null) continue
      production = { ...production, remainingTicks: 4 }
      nextOperations = replaceWorkflow(nextOperations, {
        ...workflow,
        shootingTask: { ...task, status: 'completed' },
      })
      byId.set(production.id, production)
      continue
    }

    const nextRemaining = production.remainingTicks - 1
    if (nextRemaining === 0) {
      byId.set(production.id, { ...production, remainingTicks: 0 })
      // The workflow leaves with the picture. `releaseReady` requires no
      // capability, so today this releases nothing and records nothing — it is
      // written as a transition rather than assumed empty so the day a phase
      // holds something at release, the release is in the log.
      recordReservationTransition(events, workflow, [])
      nextOperations = removeManagedProductionWorkflow(nextOperations, production.id)
      continue
    }

    const targetPhase = productionPhaseForRemainingTicks(nextRemaining)
    if (targetPhase === workflow.phase) {
      byId.set(production.id, { ...production, remainingTicks: nextRemaining })
      continue
    }

    const result = enterPhase(
      nextOperations,
      workflow,
      production,
      targetPhase,
      externallyOccupiedSlots,
      currentTick,
      events,
      // The sets the NEXT picture in this advance can bind are the sets as they
      // stand after the previous one wore its own. One walk, one authority.
      binding === undefined ? undefined : { ...binding, sets },
      sets,
    )
    nextOperations = result.operations
    sets = result.sets
    if (result.advanced) byId.set(production.id, result.production)
  }

  // Preserve the caller's production-array order; allocation order alone is the
  // governed ascending-id order.
  return {
    productions: productions.map((production) => byId.get(production.id)!),
    operations: nextOperations,
    sets,
  }
}
