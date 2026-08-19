// ── occupiedResourceSlots — THE named union producer ─────────────────────────
// Charter §3.2 / §12-M0. One function answers "what is holding studio capacity
// right now", and every consumer reads it.
//
// WHAT IT REPLACED. Nine separate walks over the same persisted roots, in five
// files, each re-deciding which roots can hold capacity and how to read a
// reservation off them:
//
//   * `productionOccupiedFacilitySlots` ×2 — `scriptDevelopment.ts`, `castingSessions.ts`
//   * `scriptOccupiedFacilitySlots`     ×2 — `scriptDevelopment.ts`, `castingSessions.ts`
//   * `studioCalendar.facilityViews`' walk
//   * three invariant walks — `operations.ts`, `scriptDevelopment.ts`, `castingSessions.ts`
//   * `facilityEngagements` — `placement.ts`
//
// Nine copies of one list is nine chances to forget a root. Sets (§3.1) add a
// SIXTH kind of holder at M2; adding it to nine places and missing one is how a
// resource silently double-books. So the list of roots lives here, once, and the
// consumers keep only their own vocabulary and their own error words.
//
// THE ROOTS, and why each one is walked (keep this list and the code in step):
//   1. `operations.workflows[].reservations` — the authoritative per-owner
//      `facilityId:slot` claim. Open-ended: held for the whole phase.
//   2. `operations.workflows[].shootingTask.soundstageFacilityId` — the shooting
//      task's DENORMALIZED copy of its stage. Facility-level, not slot-level: it
//      names no slot, so it can never double-book one. Walked because a move or
//      demolition must still refuse the building underneath it.
//   3. `scriptDevelopment.projects[].reservation` — a screenplay in drafting or
//      rewriting. Tested on the RESERVATION, never the status, so a malformed
//      state fails CLOSED rather than reading as idle.
//   4. `castingSessions.sessions[].reservation` — an audition running this week.
//      Same reservation-not-status rule.
//   5. `construction.projects[].facilityId` — the retired V11 construction root.
//      Provably empty under V12 and later; walked so a migrated or forged save
//      cannot slip past.
//   6. `sets[]` — C2a-M2, THE SIXTH HOLDER this module was written for. A set
//      holds two different things and they are deliberately not the same claim:
//        * MOUNT (`mount:<facilityId>`) — every set that is not retired occupies
//          the mount on the stage it is built on. Never waited on, acquired
//          instantly at commission (§3.1), and never a production slot: a stage
//          with a set on it still has its production slot free, which is why the
//          endowed studio's Stage 7 is available at week 0.
//        * a `set-scenery` SLOT, while the set is going up or being repaired. A
//          standing set holds no scenery crew — the carpenters have gone home.
//      A bound set's exclusivity (`set:<setId>`) is claimed by the PRODUCTION
//      that bound it, from `workflow.bindings`, because the picture is what holds
//      the set — the set does not hold itself.
//
// KEYS. The producer's key is KIND-QUALIFIED — `facility:<facilityId>:<slot>` —
// and the qualification is a RUNTIME fact only: nothing here is persisted, and no
// save shape changes. `facility:` is the only kind that exists today. The
// namespace is reserved now so the M2+ kinds land beside it instead of colliding
// with it:
//
//   * `stage:<facilityId>:<slot>` — a soundstage slot, once stages stop being
//     ordinary facilities and become the N-stage world of §3.1;
//   * `set:<setId>` — SET EXCLUSIVITY (§3.2: bindings are not reservations; a set's
//     exclusivity is enforced through THIS producer, keyed by set id);
//   * `mount:<facilityId>` — an acquired-instantly mount, never waited on (§3.1).
//
// The allocation paths still exchange the BARE `facilityId:slot` key
// (`facilitySlotKey`) they have used since V8. That is deliberate: those sets are
// runtime-only too, the engine behaviour must be byte-identical this milestone,
// and re-keying them buys nothing until a second kind actually exists. M2 flips
// them when it adds one.
//
// This module is pure: no RNG, no clock, no I/O, no mutation of any input.

import type {
  CastingReservation,
  CastingSessionStatus,
  CastingSessions,
  ConstructionProject,
  FacilityCapability,
  FacilityReservation,
  ProductionPhase,
  ScriptDevelopment,
  ScriptProjectStatus,
  ScriptReservation,
  ShootingTask,
  StudioConstruction,
  StudioOperations,
  StudioSet,
} from './types.js'

/**
 * The kinds of resource a claim can name. `facility` addresses a schedulable slot
 * inside a building; `set` and `mount` address things that are not slots at all
 * and are exclusive by identity (C2a-M2). `stage` stays reserved.
 */
export type ResourceKind = 'facility' | 'set' | 'mount'

/** Every persisted root that can hold studio capacity. */
export type ResourceOwnerKind =
  | 'production'
  | 'shootingTask'
  | 'screenplay'
  | 'castingSession'
  | 'legacyConstructionProject'
  | 'set'

type ResourceClaimBase = {
  /** Kind-qualified runtime key. Slot claims carry the slot; facility-level ones do not. */
  readonly key: string
  /** The bare `facilityId:slot` key the allocation paths exchange; null when slotless. */
  readonly facilitySlotKey: string | null
  readonly kind: ResourceKind
  readonly facilityId: string
  /** null means "claims the BUILDING, not a schedulable slot" — it can never double-book one. */
  readonly slot: number | null
  readonly capability: FacilityCapability | null
  readonly ownerId: string
}

/**
 * One live claim on studio capacity. Discriminated by `owner`, and each arm
 * carries the persisted record it was read from, so a consumer can apply its own
 * cross-checks without re-walking state.
 */
export type ResourceClaim =
  | (ResourceClaimBase & {
      readonly owner: 'production'
      readonly slot: number
      readonly capability: FacilityCapability
      readonly facilitySlotKey: string
      readonly phase: ProductionPhase
      readonly reservation: FacilityReservation
    })
  | (ResourceClaimBase & {
      readonly owner: 'shootingTask'
      readonly slot: null
      readonly capability: null
      readonly facilitySlotKey: null
      readonly task: ShootingTask
    })
  | (ResourceClaimBase & {
      readonly owner: 'screenplay'
      readonly slot: number
      readonly capability: FacilityCapability
      readonly facilitySlotKey: string
      readonly status: ScriptProjectStatus
      readonly reservation: ScriptReservation
    })
  | (ResourceClaimBase & {
      readonly owner: 'castingSession'
      readonly slot: number
      readonly capability: FacilityCapability
      readonly facilitySlotKey: string
      readonly status: CastingSessionStatus
      readonly reservation: CastingReservation
    })
  | (ResourceClaimBase & {
      readonly owner: 'legacyConstructionProject'
      readonly slot: null
      readonly capability: null
      readonly facilitySlotKey: null
      readonly project: ConstructionProject
    })
  // C2a-M2. Three shapes, one owner: the scenery slot a set under work holds, the
  // mount it stands on, and the set itself while a picture is bound to it.
  | (ResourceClaimBase & {
      readonly owner: 'set'
      readonly kind: 'facility'
      readonly slot: number
      readonly capability: 'set-scenery'
      readonly facilitySlotKey: string
      readonly set: StudioSet
    })
  | (ResourceClaimBase & {
      readonly owner: 'set'
      readonly kind: 'mount'
      readonly slot: null
      readonly capability: null
      readonly facilitySlotKey: null
      readonly set: StudioSet
    })
  | (ResourceClaimBase & {
      readonly owner: 'production'
      readonly kind: 'set'
      readonly slot: null
      readonly capability: null
      readonly facilitySlotKey: null
      readonly setId: string
    })

/** A claim that occupies a SCHEDULABLE slot — the only kind that can be double-booked. */
export type ResourceSlotClaim = Extract<ResourceClaim, { slot: number }>

/**
 * The state roots the producer reads. `GameState` satisfies this structurally, so
 * `occupiedResourceSlots(state)` is the ordinary call; a caller holding only part
 * of the state passes only that part and gets the claims that part can prove.
 *
 * Every root is optional so a per-domain view can ask a narrow question honestly
 * ("which slots do SCREENPLAYS hold") instead of manufacturing an empty root to
 * satisfy a signature. Pair a narrow source with the matching `owners` filter so
 * the intent is written down, not inferred.
 */
export type OccupancySources = {
  readonly operations?: StudioOperations
  readonly scriptDevelopment?: ScriptDevelopment
  readonly castingSessions?: CastingSessions
  readonly construction?: StudioConstruction
  /** C2a-M2 — `state.sets`. Absent means "this caller cannot see the sets root". */
  readonly sets?: readonly StudioSet[]
}

/** The bare allocation key that has addressed a facility slot since V8. */
export function facilitySlotKey(facilityId: string, slot: number): string {
  return `${facilityId}:${String(slot)}`
}

/** The kind-qualified runtime key. See the KEYS note in this module's header. */
export function resourceSlotKey(kind: ResourceKind, facilityId: string, slot: number): string {
  return `${kind}:${facilityId}:${String(slot)}`
}

/** The kind-qualified runtime key for a whole-building claim that names no slot. */
export function resourceFacilityKey(kind: ResourceKind, facilityId: string): string {
  return `${kind}:${facilityId}`
}

/** The mount on one stage. Exactly one set may occupy it (C2a-M2). */
export function mountKey(stageFacilityId: string): string {
  return resourceFacilityKey('mount', stageFacilityId)
}

/** One set's exclusivity key. Exactly one picture may hold it (§3.2). */
export function setExclusivityKey(setId: string): string {
  return `set:${setId}`
}

/** True when the claim occupies a schedulable slot rather than a whole building. */
export function isResourceSlotClaim(claim: ResourceClaim): claim is ResourceSlotClaim {
  return claim.slot !== null
}

/**
 * The producer's return shape: OCCUPIED KEY → everything claiming it, in source
 * order.
 *
 * A Map of ARRAYS, not of single claims, and that is the whole point. The
 * question this module exists to answer is "is any resource claimed twice", so
 * the answer has to be representable: a legal state gives every key exactly one
 * claimant, and a forged or pre-fix state shows both of them side by side instead
 * of one silently overwriting the other.
 *
 * Slot claims key on the bare `facilityId:slot` the allocation layer has spoken
 * since V8; whole-building claims key on the bare `facilityId`. The kind
 * qualification (`facility:` today, `stage:`/`set:`/`mount:` at M2+) rides on each
 * claim's own `key`, so the namespace is reserved without re-teaching every
 * allocator a new string this milestone.
 */
export type ResourceOccupancy = Map<string, ResourceClaim[]>

function occupancyKeyOf(claim: ResourceClaim): string {
  // A FACILITY claim keys exactly as it has since V8 — the bare `facilityId:slot`
  // for a slot, the bare `facilityId` for a whole building — so no existing key
  // moves. The C2a-M2 kinds address things that are not facility slots and key on
  // their own qualified name, which is what makes a double MOUNT or a double SET
  // visible in the same map that has always shown a double slot.
  if (claim.kind !== 'facility') return claim.key
  return claim.facilitySlotKey ?? claim.facilityId
}

/**
 * THE PRODUCER. Every live claim on studio capacity, in a FIXED source order —
 * production reservations and the shooting task that shadows them, then
 * screenplays, then auditions, then the retired construction root — and, within a
 * source, in state order.
 *
 * Deterministic by construction: no sorting, no set iteration, no clock. A
 * refusal derived from this map reads the same on every replay.
 */
export function occupiedResourceSlots(
  sources: OccupancySources,
  filter?: OccupiedSlotFilter,
): ResourceOccupancy {
  const occupancy: ResourceOccupancy = new Map()
  for (const claim of resourceClaims(sources)) {
    if (!claimPasses(claim, filter)) continue
    const key = occupancyKeyOf(claim)
    const existing = occupancy.get(key)
    if (existing === undefined) occupancy.set(key, [claim])
    else existing.push(claim)
  }
  return occupancy
}

/** Every claim the producer found, flattened back into one ordered stream. */
export function resourceClaimsOf(occupancy: ResourceOccupancy): ResourceClaim[] {
  const claims: ResourceClaim[] = []
  for (const held of occupancy.values()) claims.push(...held)
  return claims
}

/**
 * The raw ordered enumeration behind the producer. Exported for the rare consumer
 * that wants the stream without the key index; `occupiedResourceSlots` is the one
 * every module should reach for.
 */
export function resourceClaims(sources: OccupancySources): ResourceClaim[] {
  const claims: ResourceClaim[] = []

  // 1 + 2. Production workflows, and the shooting task's denormalized copy.
  for (const workflow of sources.operations?.workflows ?? []) {
    for (const reservation of workflow.reservations) {
      claims.push({
        key: resourceSlotKey('facility', reservation.facilityId, reservation.slot),
        facilitySlotKey: facilitySlotKey(reservation.facilityId, reservation.slot),
        kind: 'facility',
        facilityId: reservation.facilityId,
        slot: reservation.slot,
        capability: reservation.capability,
        owner: 'production',
        ownerId: workflow.productionId,
        phase: workflow.phase,
        reservation,
      })
    }
    if (workflow.shootingTask !== null) {
      claims.push({
        key: resourceFacilityKey('facility', workflow.shootingTask.soundstageFacilityId),
        facilitySlotKey: null,
        kind: 'facility',
        facilityId: workflow.shootingTask.soundstageFacilityId,
        slot: null,
        capability: null,
        owner: 'shootingTask',
        ownerId: workflow.productionId,
        task: workflow.shootingTask,
      })
    }
  }

  // 3. Screenplays. Tested on the reservation, never the status.
  for (const project of sources.scriptDevelopment?.projects ?? []) {
    if (project.reservation === null) continue
    claims.push({
      key: resourceSlotKey('facility', project.reservation.facilityId, project.reservation.slot),
      facilitySlotKey: facilitySlotKey(project.reservation.facilityId, project.reservation.slot),
      kind: 'facility',
      facilityId: project.reservation.facilityId,
      slot: project.reservation.slot,
      capability: project.reservation.capability,
      owner: 'screenplay',
      ownerId: project.id,
      status: project.status,
      reservation: project.reservation,
    })
  }

  // 4. Audition sessions. Same reservation-not-status rule.
  for (const session of sources.castingSessions?.sessions ?? []) {
    if (session.reservation === null) continue
    claims.push({
      key: resourceSlotKey('facility', session.reservation.facilityId, session.reservation.slot),
      facilitySlotKey: facilitySlotKey(session.reservation.facilityId, session.reservation.slot),
      kind: 'facility',
      facilityId: session.reservation.facilityId,
      slot: session.reservation.slot,
      capability: session.reservation.capability,
      owner: 'castingSession',
      ownerId: session.id,
      status: session.status,
      reservation: session.reservation,
    })
  }

  // 5. The retired V11 construction root. Provably empty under V12 and later.
  for (const project of sources.construction?.projects ?? []) {
    claims.push({
      key: resourceFacilityKey('facility', project.facilityId),
      facilitySlotKey: null,
      kind: 'facility',
      facilityId: project.facilityId,
      slot: null,
      capability: null,
      owner: 'legacyConstructionProject',
      ownerId: project.id,
      project,
    })
  }

  // 6. SETS (C2a-M2), in three passes so the order inside the source is fixed.
  const sets = sources.sets ?? []

  //   6a. The MOUNT. Every set that has not retired stands on a stage, whether it
  //       is finished or still going up, and that stage's mount is spoken for.
  for (const set of sets) {
    if (set.status === 'retired') continue
    claims.push({
      key: mountKey(set.mountedOn),
      facilitySlotKey: null,
      kind: 'mount',
      facilityId: set.mountedOn,
      slot: null,
      capability: null,
      owner: 'set',
      ownerId: set.id,
      set,
    })
  }

  //   6b. The SCENERY SLOT a set under work holds.
  //
  //       DERIVED, NOT PERSISTED, and deliberately so: V14's `StudioSet` is the
  //       complete schema and M2 adds no member to it (§8). The assignment is a
  //       pure function of the claims ALREADY produced above plus the sets in
  //       state order, so it is deterministic and it can never collide with a
  //       claim another owner is holding — the derivation reads their slots and
  //       skips them. Productions are told about these slots in turn through
  //       `setOccupiedFacilitySlots`, which is what stops the two from racing.
  //
  //       A set that finds NO free slot produces no claim rather than a forged
  //       one. That state is unreachable through the actions (a commission
  //       refuses up front unless a slot is free, and scenery capacity cannot be
  //       demolished out from under a set that is holding one), and the sets
  //       invariant refuses it if a forged save carries it.
  const setsUnderWork = sets.filter((set) => set.status === 'under-construction')
  if (setsUnderWork.length > 0) {
    const taken = new Set<string>()
    for (const claim of claims) {
      if (claim.facilitySlotKey !== null) taken.add(claim.facilitySlotKey)
    }
    const shops = (sources.operations?.facilities ?? [])
      .filter((facility) => facility.capability === 'set-scenery')
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    for (const set of setsUnderWork) {
      let assigned = false
      for (const shop of shops) {
        for (let slot = 0; slot < shop.capacity && !assigned; slot++) {
          const key = facilitySlotKey(shop.id, slot)
          if (taken.has(key)) continue
          taken.add(key)
          assigned = true
          claims.push({
            key: resourceSlotKey('facility', shop.id, slot),
            facilitySlotKey: key,
            kind: 'facility',
            facilityId: shop.id,
            slot,
            capability: 'set-scenery',
            owner: 'set',
            ownerId: set.id,
            set,
          })
        }
        if (assigned) break
      }
    }
  }

  //   6c. SET EXCLUSIVITY, claimed by the PICTURE that bound it (§3.2: bindings
  //       are not reservations, and a set's exclusivity is enforced HERE). The
  //       claim exists only while the picture is physically on the set, and
  //       C2a-M4 states what that means exactly: WHILE IT HOLDS THE STAGE THE SET
  //       STANDS ON. Stage and set are one composite (§3.2), acquired together
  //       and released together, so the stage reservation IS the tenancy.
  //
  //       This is the release law (`00E`.5) reaching the set: a picture that
  //       wrapped has released the stage, so it has released the set that week —
  //       even though it is still standing in the `shooting` phase waiting for
  //       Post. Keying on the phase name would have kept the scenery hostage to
  //       a picture that had already gone home. `bindings.setId` survives as the
  //       picture's RECORD of what it shot on, and a record holds nothing.
  for (const workflow of sources.operations?.workflows ?? []) {
    const bound = workflow.bindings?.setId ?? null
    if (bound === null) continue
    if (!workflow.reservations.some((reservation) => reservation.capability === 'soundstage')) {
      continue
    }
    claims.push({
      key: setExclusivityKey(bound),
      facilitySlotKey: null,
      kind: 'set',
      facilityId: workflow.bindings.stageFacilityId ?? '',
      slot: null,
      capability: null,
      owner: 'production',
      ownerId: workflow.productionId,
      setId: bound,
    })
  }

  return claims
}

/**
 * The scenery slots the SETS root is holding — the view production allocation
 * needs, in the same shape `scriptOccupiedFacilitySlots` and
 * `castingOccupiedFacilitySlots` already hand it.
 *
 * Bare `facilityId:slot` keys, because that is the vocabulary the allocator
 * speaks.
 */
export function setOccupiedFacilitySlots(
  sets: readonly StudioSet[],
  operations: StudioOperations,
  scriptDevelopment?: ScriptDevelopment,
  castingSessions?: CastingSessions,
): Set<string> {
  const held = new Set<string>()
  const sources: OccupancySources = {
    sets,
    operations,
    ...(scriptDevelopment === undefined ? {} : { scriptDevelopment }),
    ...(castingSessions === undefined ? {} : { castingSessions }),
  }
  for (const claim of resourceClaims(sources)) {
    if (claim.owner !== 'set') continue
    if (claim.facilitySlotKey !== null) held.add(claim.facilitySlotKey)
  }
  return held
}

/** Restrict a claim list to the owners a caller is entitled to see. */
export type OccupiedSlotFilter = {
  /** Only these owners contribute. Omit for all of them. */
  readonly owners?: readonly ResourceOwnerKind[]
  /** Drop the claims of this owner id — "everyone's slots but mine". */
  readonly excludeOwnerId?: string
  /**
   * Scope `excludeOwnerId` to one owner kind. Ids are namespaced per owner today
   * (`script-0000` / `casting-0000` / a production id), but "my own slot" is a
   * claim about ONE owner and saying so keeps a future id collision from
   * silently freeing somebody else's slot.
   */
  readonly excludeOwner?: ResourceOwnerKind
  /** Only claims on this capability contribute. */
  readonly capability?: FacilityCapability
}

function claimPasses(claim: ResourceClaim, filter: OccupiedSlotFilter | undefined): boolean {
  if (filter === undefined) return true
  if (filter.owners !== undefined && !filter.owners.includes(claim.owner)) return false
  if (
    filter.excludeOwnerId !== undefined &&
    claim.ownerId === filter.excludeOwnerId &&
    (filter.excludeOwner === undefined || claim.owner === filter.excludeOwner)
  ) {
    return false
  }
  if (filter.capability !== undefined && claim.capability !== filter.capability) return false
  return true
}

/** Every SLOT claim the producer found, flattened in source order. */
export function resourceSlotClaimsOf(occupancy: ResourceOccupancy): ResourceSlotClaim[] {
  const slots: ResourceSlotClaim[] = []
  for (const claim of resourceClaimsOf(occupancy)) {
    if (isResourceSlotClaim(claim)) slots.push(claim)
  }
  return slots
}

/**
 * The thin per-domain view of the SCREENPLAY root, kept at the public address
 * `scriptDevelopment.scriptOccupiedFacilitySlots` since V9.
 *
 * A caller completing due screenplay work first receives a set with those newly
 * released slots absent, which is what makes the governed tick order explicit.
 */
export function screenplayOccupiedSlotKeys(
  development: ScriptDevelopment,
  excludingProjectId?: string,
): Set<string> {
  return new Set(
    occupiedResourceSlots(
      { scriptDevelopment: development },
      excludingProjectId === undefined
        ? { owners: ['screenplay'] }
        : {
            owners: ['screenplay'],
            excludeOwner: 'screenplay',
            excludeOwnerId: excludingProjectId,
          },
    ).keys(),
  )
}

/** Two owners found on one slot. The engine states the FACT; callers own the words. */
export type ResourceDoubleBooking = {
  /** Kind-qualified runtime key. */
  readonly key: string
  /** Bare `facilityId:slot` key — what the existing invariant messages quote. */
  readonly facilitySlotKey: string
  readonly facilityId: string
  readonly slot: number
  readonly held: ResourceSlotClaim
  readonly claimed: ResourceSlotClaim
}

/**
 * The first slot claimed by two owners, or null. Producer order decides "first",
 * so the answer is deterministic.
 *
 * DEFENSE IN DEPTH, not the primary defence: allocation is already cross-owner
 * aware — every allocator is handed the other owners' slots before it picks
 * (`castingSessions.allocateCastingReservation`, `tick`'s
 * `externallyOccupiedSlots`). This is the check that catches the day someone adds
 * a sixth holder and forgets one allocator, and it is the extension point Sets
 * need (§3.2: set exclusivity is enforced HERE, keyed `set:<setId>`).
 *
 * It must never fire on a legal state. Facility-level claims — the shooting
 * task's denormalized stage, the retired construction root — deliberately do not
 * participate: they name a building, not a slot, and a stage legitimately carries
 * both its production's reservation and that production's shooting task.
 */
export function findDoubleBookedResourceSlot(
  sources: OccupancySources,
): ResourceDoubleBooking | null {
  for (const claims of occupiedResourceSlots(sources).values()) {
    const slots = claims.filter(isResourceSlotClaim)
    if (slots.length < 2) continue
    const held = slots[0]!
    const claimed = slots[1]!
    return {
      key: claimed.key,
      facilitySlotKey: claimed.facilitySlotKey,
      facilityId: claimed.facilityId,
      slot: claimed.slot,
      held,
      claimed,
    }
  }
  return null
}

/**
 * Fail-closed: refuse any state in which one slot has two owners. `message` lets
 * a caller keep the exact words its own contract already pins.
 */
export function assertNoDoubleBookedResourceSlots(
  sources: OccupancySources,
  message?: (booking: ResourceDoubleBooking) => string,
): void {
  const booking = findDoubleBookedResourceSlot(sources)
  if (booking === null) return
  throw new Error(
    message?.(booking) ??
      `occupancy invariant: resource slot "${booking.key}" is claimed by ${booking.held.owner} "${booking.held.ownerId}" and ${booking.claimed.owner} "${booking.claimed.ownerId}"`,
  )
}
