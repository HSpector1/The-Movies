// ── Presence Projection V1 ──────────────────────────────────────────────────
// The engine-owned canonical answer to "who is where, doing what, this week".
//
// `studioPresence(state)` is a PURE, SAVE-NEUTRAL projection. It reads existing
// authoritative truth (managed production workflows and their facility
// reservations, screenplay tasks, casting sessions, contracts, talent) and
// decomposes the CURRENT week into BEATS_PER_WEEK integer beats per named
// person. It:
//
//   • changes zero outcomes and persists nothing,
//   • alters no tick step and is called by none,
//   • consumes ZERO simulation RNG (the cosmetic departure stagger comes from a
//     DERIVED stream keyed (seed, 'presence-v1', `${talentId}:${week}`), exactly
//     the 'casting-v1' precedent — `state.rngState` is never read or advanced),
//   • never throws on malformed input: an ambiguity WITHHOLDS the affected person
//     (or the whole projection, when the ambiguity is global) with a stated
//     reason. Withholding is recorded, never silent (operational laws 17 / 21).
//
// AUTHORITY. Everything below the "attendance canon" heading is PRESENTATION
// CANON: a documented, deterministic reading of where a company member plausibly
// is, given the reservations the production actually holds. It is NOT outcome
// law. No attendance rule here feeds a decision, a cost, a duration, or a tick.
// Where existing truth could not support a rule, the rule was DOWNGRADED to what
// truth supports rather than invented (see "known truth gaps" below).
//
// KNOWN TRUTH GAPS (recorded, not filled):
//  1. A `facility-capacity` blocker carries only {capability, targetPhase} — it
//     names NO specific full facility, and in general every facility of that
//     capability is full, so "the full facility" does not exist as a single
//     authoritative id. The waiting rule is therefore downgraded: the company
//     waits AT THE SITE IT ACTUALLY HOLDS (its current-phase reservation), and
//     `blockedReason` names the capability and phase it is queued for. That is
//     the honest queue truth available today.
//  2. Casting has no modelled personnel (no casting director exists in state).
//     The people projected at an auditioning session are its SLATE candidates —
//     the exact ids state says are being camera-tested at that reserved slot this
//     week. No casting staff is invented.
//  3. `releaseReady` holds no reservation, so its company is claimed by nobody;
//     contracted members fall through to the roster tier, and a non-contracted
//     (freelance) member of a releaseReady production is not projected at all.

import { stream } from './rng.js'
import type {
  CastSlot,
  CreativeRole,
  FacilityCapability,
  GameState,
  ProductionPhase,
  Talent,
} from './types.js'

// ── frozen presentation law (named constants, never inlined) ─────────────────
// These are presence-local constants, not a tuning surface — the same house
// pattern as the frozen Casting Sessions V1 numbers. They are law for the
// projection's shape, so a renderer can rely on them.

/** Integer beats the projection decomposes one week into. Indices 0 … 9. */
export const BEATS_PER_WEEK = 10
/** Cosmetic stagger window: a worker departs home on beat 0, 1, or 2. */
export const PRESENCE_DEPARTURE_WINDOW = 3
/** The last beat of the working day; beat 9 is always the return home. */
export const PRESENCE_LAST_WORK_BEAT = 8

export type PresenceBeat = 'home' | 'travel' | 'at-site' | 'waiting'

/** Which authority claims the person's week. Precedence order, highest first. */
export type PresenceEngagement = 'production' | 'script' | 'casting' | 'roster'

/**
 * What the person is credited as at the claimed site. Derived from exact truth
 * (production role assignment, screenplay writer, casting slate membership);
 * `null` for an unclaimed roster week.
 */
export type PresenceCredit =
  | 'writer'
  | 'director'
  | 'lead'
  | 'antagonist'
  | 'support'
  | 'craft'
  | 'auditionee'
  | null

export type PersonPresence = {
  talentId: string
  name: string
  /** The person's PRIMARY profession (`Talent.role`), not the week's credit. */
  role: CreativeRole
  engagement: PresenceEngagement
  credit: PresenceCredit
  /** productionId | scriptProjectId | castingSessionId, or null for roster. */
  ownerId: string | null
  /** The claimed facility id, or null when the week carries no workplace claim. */
  site: string | null
  /** The exact reserved slot index at `site`, or null when there is no claim. */
  slot: number | null
  /** Exactly BEATS_PER_WEEK entries. */
  beats: PresenceBeat[]
  blockedReason: string | null
}

/**
 * A person (or the whole week) deliberately omitted because truth was ambiguous
 * or malformed. `talentId: null` marks a GLOBAL withholding — when any is
 * present, `week` is null and `people` is empty.
 */
export type PresenceWithholding = { talentId: string | null; reason: string }

export type StudioPresence = {
  /** The projected week (`market.tick`), or null when the week is unknowable. */
  week: number | null
  /** Ascending by talentId. Each talentId appears at most once. */
  people: PersonPresence[]
  /** Ascending by talentId, global entries first. */
  withheld: PresenceWithholding[]
}

// ── attendance canon (presentation canon — see AUTHORITY above) ──────────────
//
// phase           who                                    where (owned reservation)
// ─────────────── ────────────────────────────────────── ─────────────────────────
// development     writer, director                       development-casting
// preProduction   writer, director                       development-casting
// rehearsal       director, lead, antagonist, support    soundstage
// shooting        director, lead, antagonist, support    soundstage
// shooting        craft…                                 set-scenery
// postProduction  director, craft…                       post
// releaseReady    (nobody — the phase holds no reservation)
//
// Each row is anchored to a reservation the production ACTUALLY holds for that
// phase (`requirementsForPhase` in operations.ts allocates exactly these
// capabilities), so every projected site is a claim the engine already made.
// Rationale per row:
//  • development / preProduction — the phase's single reservation is the
//    Development & Casting slot; the writer and director are the company members
//    whose work that building exists for.
//  • rehearsal — the phase reserves the soundstage; rehearsal is the director
//    working with the cast on that stage. Craft and writer hold no claim.
//  • shooting — the ONLY hard law here is ShootingTask, which names the director
//    and the exact `soundstageFacilityId`: the director is at the stage by
//    engine truth, and the cast is with him by canon. Shooting also holds a
//    second, set-scenery reservation; craft is the discipline that reservation
//    exists for, so craft is projected there rather than leaving an owned slot
//    unattended. (A `scenery-load-in` blocker is NOT a capacity queue — those
//    people are on site, working — so it never produces `waiting`.)
//  • postProduction — the phase reserves the post facility; the director and
//    craft finish the picture there. The cast is released to the roster.
type Attendance = {
  talentId: string
  credit: PresenceCredit
  capability: FacilityCapability
}

const CAST_SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support'] as const

/** Ordered, deterministic attendance rows for one production in one phase. */
function attendanceForPhase(
  phase: ProductionPhase,
  production: {
    writerId: string
    directorId: string
    craftIds: readonly string[]
    cast: Record<CastSlot, string>
  },
): Attendance[] {
  const rows: Attendance[] = []
  const cast = (): void => {
    for (let i = 0; i < CAST_SLOTS.length; i++) {
      const slot = CAST_SLOTS[i]!
      rows.push({ talentId: production.cast[slot], credit: slot, capability: 'soundstage' })
    }
  }
  const craft = (capability: FacilityCapability): void => {
    for (let i = 0; i < production.craftIds.length; i++) {
      rows.push({ talentId: production.craftIds[i]!, credit: 'craft', capability })
    }
  }
  switch (phase) {
    case 'development':
    case 'preProduction':
      rows.push({ talentId: production.directorId, credit: 'director', capability: 'development-casting' })
      rows.push({ talentId: production.writerId, credit: 'writer', capability: 'development-casting' })
      return rows
    case 'rehearsal':
      rows.push({ talentId: production.directorId, credit: 'director', capability: 'soundstage' })
      cast()
      return rows
    case 'shooting':
      rows.push({ talentId: production.directorId, credit: 'director', capability: 'soundstage' })
      cast()
      craft('set-scenery')
      return rows
    case 'postProduction':
      rows.push({ talentId: production.directorId, credit: 'director', capability: 'post' })
      craft('post')
      return rows
    case 'releaseReady':
      return rows
  }
}

const PRODUCTION_PHASES: readonly ProductionPhase[] = [
  'development',
  'preProduction',
  'rehearsal',
  'shooting',
  'postProduction',
  'releaseReady',
] as const

// ── beat timeline canon ──────────────────────────────────────────────────────
// home… → travel (1 beat) → at-site | waiting (through PRESENCE_LAST_WORK_BEAT)
// → home (beat 9). The return trip is folded into the final home beat so a
// staggered departure never costs a work beat. Roster people stay home all week.

function homeWeek(): PresenceBeat[] {
  const beats: PresenceBeat[] = []
  for (let i = 0; i < BEATS_PER_WEEK; i++) beats.push('home')
  return beats
}

function workWeek(departureBeat: number, working: 'at-site' | 'waiting'): PresenceBeat[] {
  const beats: PresenceBeat[] = []
  for (let i = 0; i < BEATS_PER_WEEK; i++) {
    if (i < departureBeat) beats.push('home')
    else if (i === departureBeat) beats.push('travel')
    else if (i <= PRESENCE_LAST_WORK_BEAT) beats.push(working)
    else beats.push('home')
  }
  return beats
}

/**
 * The cosmetic departure beat. DERIVED stream only — `state.rngState` is never
 * read, so the projection consumes zero simulation RNG and is replay-exact.
 */
function departureBeat(seed: string, talentId: string, week: number): number {
  const value = stream(seed, 'presence-v1', `${talentId}:${String(week)}`).next()
  const beat = Math.floor(value * PRESENCE_DEPARTURE_WINDOW)
  return beat < 0 ? 0 : beat > PRESENCE_DEPARTURE_WINDOW - 1 ? PRESENCE_DEPARTURE_WINDOW - 1 : beat
}

// ── defensive reads (law 17: present-but-malformed ≠ absent) ─────────────────

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function slotKey(facilityId: string, slot: number): string {
  return `${facilityId}:${String(slot)}`
}

// ── claim resolution ─────────────────────────────────────────────────────────
// One person, one claimed site per week. Precedence: production > script >
// casting > roster. A person legally CAN sit in two tiers at once (a contracted
// actor already shooting may still appear on an audition slate), and precedence
// — not a guess — decides which claim the week shows.

type Claim = {
  talentId: string
  engagement: PresenceEngagement
  credit: PresenceCredit
  ownerId: string
  /**
   * C2a-M4 (`00E`.5): NULL when the company is engaged but holds no site — a
   * picture whose completed phase released its resources and is now waiting for
   * the next one. It is still working for that production; it is simply not
   * anywhere the studio owns this week.
   */
  facilityId: string | null
  slot: number | null
  blockedReason: string | null
}

type ClaimTier = 'production' | 'script' | 'casting'

const TIER_RANK: Record<ClaimTier, number> = { production: 0, script: 1, casting: 2 }

function blockedReasonFor(capability: string, targetPhase: string): string {
  return `awaiting ${capability} capacity to enter ${targetPhase}`
}

/** The set half of the same sentence (§3.3's `set-unavailable` arm). */
function blockedSetReasonFor(targetPhase: string): string {
  return `awaiting a standing set to enter ${targetPhase}`
}

/**
 * The one canonical decomposition of the current week. Pure, save-neutral,
 * RNG-neutral; never throws.
 */
export function studioPresence(state: GameState): StudioPresence {
  const withheldByTalent = new Map<string, string>()
  const globalWithholdings: string[] = []

  const raw = state as unknown
  if (!isObject(raw)) {
    return { week: null, people: [], withheld: [{ talentId: null, reason: 'state is not an object' }] }
  }
  const market = raw['market']
  const week = isObject(market) && isNonNegativeInteger(market['tick']) ? (market['tick'] as number) : null
  if (week === null) globalWithholdings.push('market.tick is not a non-negative integer week')
  if (!isNonEmptyString(raw['seed'])) globalWithholdings.push('state.seed is not a non-empty string')
  if (!Array.isArray(raw['talent'])) globalWithholdings.push('state.talent is not an array')
  if (!Array.isArray(raw['contracts'])) globalWithholdings.push('state.contracts is not an array')
  const studio = raw['studio']
  if (!isObject(studio) || !Array.isArray(studio['activeProductions'])) {
    globalWithholdings.push('state.studio.activeProductions is not an array')
  }
  const operations = raw['operations']
  if (
    !isObject(operations) ||
    !Array.isArray(operations['facilities']) ||
    !Array.isArray(operations['workflows'])
  ) {
    globalWithholdings.push('state.operations is not a well-formed operations root')
  }
  const development = raw['scriptDevelopment']
  if (!isObject(development) || !Array.isArray(development['projects'])) {
    globalWithholdings.push('state.scriptDevelopment.projects is not an array')
  }
  const casting = raw['castingSessions']
  if (!isObject(casting) || !Array.isArray(casting['sessions'])) {
    globalWithholdings.push('state.castingSessions.sessions is not an array')
  }
  if (week === null || globalWithholdings.length > 0) {
    // `week === null` always already pushed its own global reason; the fallback
    // only exists so the projected week's type can never be a guess.
    const reasons =
      globalWithholdings.length > 0
        ? globalWithholdings
        : ['market.tick is not a non-negative integer week']
    return { week: null, people: [], withheld: reasons.map((reason) => ({ talentId: null, reason })) }
  }

  const seed = state.seed
  const currentWeek: number = week

  // ── talent identity ────────────────────────────────────────────────────────
  // A duplicated id makes "the person" ambiguous: which record is the name and
  // primary role? Neither — the id is withheld outright rather than guessed.
  const talentById = new Map<string, Talent>()
  for (let i = 0; i < state.talent.length; i++) {
    const person = state.talent[i]!
    if (!isObject(person) || !isNonEmptyString(person.id)) continue
    if (talentById.has(person.id)) {
      withheldByTalent.set(person.id, 'duplicate talent record for this id')
      continue
    }
    talentById.set(person.id, person)
  }

  const withhold = (talentId: string, reason: string): void => {
    if (!withheldByTalent.has(talentId)) withheldByTalent.set(talentId, reason)
  }

  // ── one occupancy union (law 22): every reservation, from every owner ──────
  // A facility slot claimed more than once is contradictory truth. Nobody
  // resolving to that slot is projected.
  const slotOwners = new Map<string, number>()
  const countSlot = (facilityId: unknown, slot: unknown): void => {
    if (!isNonEmptyString(facilityId) || !isNonNegativeInteger(slot)) return
    const key = slotKey(facilityId, slot)
    slotOwners.set(key, (slotOwners.get(key) ?? 0) + 1)
  }
  for (let i = 0; i < state.operations.workflows.length; i++) {
    const workflow = state.operations.workflows[i]!
    if (!isObject(workflow) || !Array.isArray(workflow.reservations)) continue
    for (let r = 0; r < workflow.reservations.length; r++) {
      const reservation = workflow.reservations[r]!
      if (!isObject(reservation)) continue
      countSlot(reservation.facilityId, reservation.slot)
    }
  }
  for (let i = 0; i < state.scriptDevelopment.projects.length; i++) {
    const project = state.scriptDevelopment.projects[i]!
    if (!isObject(project) || !isObject(project.reservation)) continue
    countSlot(project.reservation.facilityId, project.reservation.slot)
  }
  for (let i = 0; i < state.castingSessions.sessions.length; i++) {
    const session = state.castingSessions.sessions[i]!
    if (!isObject(session) || !isObject(session.reservation)) continue
    countSlot(session.reservation.facilityId, session.reservation.slot)
  }

  const facilityIds = new Set<string>()
  for (let i = 0; i < state.operations.facilities.length; i++) {
    const facility = state.operations.facilities[i]!
    if (isObject(facility) && isNonEmptyString(facility.id)) facilityIds.add(facility.id)
  }

  // A site is usable only when the facility exists AND its slot is claimed once.
  const siteFailure = (facilityId: string, slot: number): string | null => {
    if (!facilityIds.has(facilityId)) return `reservation references unknown facility "${facilityId}"`
    if ((slotOwners.get(slotKey(facilityId, slot)) ?? 0) > 1) {
      return `facility slot "${slotKey(facilityId, slot)}" is claimed by more than one owner`
    }
    return null
  }

  // ── claims, highest-precedence tier first ─────────────────────────────────
  const claims = new Map<string, Claim>()
  const claimTier = new Map<string, ClaimTier>()

  const addClaim = (tier: ClaimTier, claim: Claim): void => {
    if (withheldByTalent.has(claim.talentId)) return
    const existing = claims.get(claim.talentId)
    if (existing === undefined) {
      claims.set(claim.talentId, claim)
      claimTier.set(claim.talentId, tier)
      return
    }
    const existingTier = claimTier.get(claim.talentId)!
    if (TIER_RANK[tier] > TIER_RANK[existingTier]) return // lower precedence loses
    if (TIER_RANK[tier] < TIER_RANK[existingTier]) {
      claims.set(claim.talentId, claim)
      claimTier.set(claim.talentId, tier)
      return
    }
    // Same tier. Identical site ⇒ the same claim seen twice (keep the first,
    // which is the fixed-order credit). Different site ⇒ the person is in two
    // places at once, which no legal state can produce — withhold, never guess.
    if (existing.facilityId === claim.facilityId && existing.slot === claim.slot) return
    claims.delete(claim.talentId)
    claimTier.delete(claim.talentId)
    withhold(
      claim.talentId,
      `claimed by two ${tier} sites this week ("${existing.ownerId}" and "${claim.ownerId}")`,
    )
  }

  // Tier 1 — active productions and their managed workflows.
  for (let i = 0; i < state.operations.workflows.length; i++) {
    const workflow = state.operations.workflows[i]!
    if (!isObject(workflow) || !isNonEmptyString(workflow.productionId)) continue
    const production = state.studio.activeProductions.find(
      (candidate) => isObject(candidate) && candidate.id === workflow.productionId,
    )
    // A workflow without its production has no company to place. The operations
    // invariants already forbid it; presence simply projects nobody.
    if (production === undefined) continue
    if (!PRODUCTION_PHASES.includes(workflow.phase)) continue
    if (
      !isNonEmptyString(production.writerId) ||
      !isNonEmptyString(production.directorId) ||
      !Array.isArray(production.craftIds) ||
      !isObject(production.cast)
    ) {
      continue
    }
    // `waiting` appears IFF the workflow carries a facility-capacity blocker. A
    // scenery-load-in blocker is work in progress on site, not a capacity queue.
    const blocker = workflow.blocker
    let blockedReason: string | null = null
    if (
      isObject(blocker) &&
      blocker['kind'] === 'facility-capacity' &&
      isNonEmptyString(blocker['capability']) &&
      isNonEmptyString(blocker['targetPhase'])
    ) {
      blockedReason = blockedReasonFor(blocker['capability'], blocker['targetPhase'])
    } else if (
      isObject(blocker) &&
      blocker['kind'] === 'set-unavailable' &&
      isNonEmptyString(blocker['targetPhase'])
    ) {
      // C2a-M4: the second next-phase wait. A picture with a stage available and
      // no scenery to shoot on is waiting for a SET, and saying so is the whole
      // reason the arm exists.
      blockedReason = blockedSetReasonFor(blocker['targetPhase'])
    }

    const rows = attendanceForPhase(workflow.phase, production)
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r]!
      if (!isNonEmptyString(row.talentId)) continue
      const reservations = Array.isArray(workflow.reservations) ? workflow.reservations : []
      const matching = reservations.filter(
        (reservation) => isObject(reservation) && reservation.capability === row.capability,
      )
      if (matching.length === 0 && blockedReason !== null) {
        // ── THE COMPANY THAT HOLDS NOTHING (C2a-M4, `00E`.5) ─────────────
        //
        // Truth gap 1 is CLOSED for this case rather than widened. The old
        // reading — "the company waits AT THE SITE IT ACTUALLY HOLDS" — assumed
        // a waiting picture is always holding something, and the resource-release
        // law makes that false on purpose: a completed phase's resources go back
        // even when the next one is unavailable, so a picture waiting for a stage
        // (or for Post) holds nothing at all.
        //
        // A company with no site is NOT a contradiction and must not be withheld:
        // withholding would make the crew of every waiting picture VANISH from
        // the world, which is the opposite of "the player must know what is
        // waiting". They are projected as engaged, waiting, with the reason they
        // are waiting and no site — the honest reading of a state in which they
        // are between rooms.
        addClaim('production', {
          talentId: row.talentId,
          engagement: 'production',
          credit: row.credit,
          ownerId: workflow.productionId,
          facilityId: null,
          slot: null,
          blockedReason,
        })
        continue
      }
      if (matching.length !== 1) {
        withhold(
          row.talentId,
          matching.length === 0
            ? `production "${workflow.productionId}" holds no ${row.capability} reservation in ${workflow.phase}`
            : `production "${workflow.productionId}" holds ${String(matching.length)} ${row.capability} reservations in ${workflow.phase}`,
        )
        continue
      }
      const reservation = matching[0]!
      if (!isNonEmptyString(reservation.facilityId) || !isNonNegativeInteger(reservation.slot)) {
        withhold(row.talentId, `production "${workflow.productionId}" reservation is malformed`)
        continue
      }
      const failure = siteFailure(reservation.facilityId, reservation.slot)
      if (failure !== null) {
        withhold(row.talentId, failure)
        continue
      }
      addClaim('production', {
        talentId: row.talentId,
        engagement: 'production',
        credit: row.credit,
        ownerId: workflow.productionId,
        facilityId: reservation.facilityId,
        slot: reservation.slot,
        blockedReason,
      })
    }
  }

  // Tier 2 — screenplays being drafted or rewritten at their reserved slot.
  for (let i = 0; i < state.scriptDevelopment.projects.length; i++) {
    const project = state.scriptDevelopment.projects[i]!
    if (!isObject(project) || !isNonEmptyString(project.id)) continue
    if (project.status !== 'drafting' && project.status !== 'rewriting') continue
    if (!isNonEmptyString(project.writerId)) continue
    if (!isObject(project.reservation)) {
      // Active screenplay work always owns a slot (script invariants). Present
      // but reservation-less is malformed truth, not an absent claim.
      withhold(project.writerId, `screenplay "${project.id}" is ${project.status} without a reservation`)
      continue
    }
    const reservation = project.reservation
    if (!isNonEmptyString(reservation.facilityId) || !isNonNegativeInteger(reservation.slot)) {
      withhold(project.writerId, `screenplay "${project.id}" reservation is malformed`)
      continue
    }
    const failure = siteFailure(reservation.facilityId, reservation.slot)
    if (failure !== null) {
      withhold(project.writerId, failure)
      continue
    }
    // C2a-M3 (`00E`.9): the whole script pool is AT the office, not only the
    // attributed writer. "Everything belongs to a system" (`00C`.6) — a writer
    // the roster reports as busy on this screenplay has to be somewhere, and the
    // somewhere is the room the screenplay reserved. Read defensively like every
    // other field here: a fragment with no `writerIds` is one writer, which is
    // what every pre-M3 state is.
    const pooled = Array.isArray(project.writerIds)
      ? (project.writerIds as unknown[]).filter(
          (id): id is string => isNonEmptyString(id) && id !== project.writerId,
        )
      : []
    for (const talentId of [project.writerId, ...pooled]) {
      addClaim('script', {
        talentId,
        engagement: 'script',
        credit: 'writer',
        ownerId: project.id,
        facilityId: reservation.facilityId,
        slot: reservation.slot,
        blockedReason: null,
      })
    }
  }

  // Tier 3 — auditioning casting sessions. The slate is the site activity; no
  // casting personnel exist in state and none is invented.
  for (let i = 0; i < state.castingSessions.sessions.length; i++) {
    const session = state.castingSessions.sessions[i]!
    if (!isObject(session) || !isNonEmptyString(session.id)) continue
    if (session.status !== 'auditioning') continue
    if (!isObject(session.reservation) || !isObject(session.slate)) continue
    const reservation = session.reservation
    if (!isNonEmptyString(reservation.facilityId) || !isNonNegativeInteger(reservation.slot)) continue
    const failure = siteFailure(reservation.facilityId, reservation.slot)
    const candidates: string[] = []
    for (let s = 0; s < CAST_SLOTS.length; s++) {
      const pair = session.slate[CAST_SLOTS[s]!]
      if (!Array.isArray(pair)) continue
      for (let c = 0; c < pair.length; c++) {
        const id = pair[c]
        // One person may legally appear in several slots of the same slate; the
        // person attends the session once.
        if (isNonEmptyString(id) && !candidates.includes(id)) candidates.push(id)
      }
    }
    for (let c = 0; c < candidates.length; c++) {
      const talentId = candidates[c]!
      if (failure !== null) {
        withhold(talentId, failure)
        continue
      }
      addClaim('casting', {
        talentId,
        engagement: 'casting',
        credit: 'auditionee',
        ownerId: session.id,
        facilityId: reservation.facilityId,
        slot: reservation.slot,
        blockedReason: null,
      })
    }
  }

  // ── population = every claimed person ∪ every contracted employee ──────────
  const population: string[] = []
  const seen = new Set<string>()
  const include = (talentId: string): void => {
    if (seen.has(talentId)) return
    seen.add(talentId)
    population.push(talentId)
  }
  for (const talentId of claims.keys()) include(talentId)
  for (let i = 0; i < state.contracts.length; i++) {
    const contract = state.contracts[i]!
    if (!isObject(contract) || !isNonEmptyString(contract.talentId)) continue
    if (!isNonNegativeInteger(contract.startWeek) || !isNonNegativeInteger(contract.endWeekExclusive)) continue
    if (contract.startWeek <= currentWeek && currentWeek < contract.endWeekExclusive) {
      include(contract.talentId)
    }
  }

  const people: PersonPresence[] = []
  for (let i = 0; i < population.length; i++) {
    const talentId = population[i]!
    if (withheldByTalent.has(talentId)) continue
    const person = talentById.get(talentId)
    if (person === undefined) {
      withhold(talentId, 'no talent record for this id')
      continue
    }
    if (!isNonEmptyString(person.name) || !isNonEmptyString(person.role)) {
      withhold(talentId, 'talent record has no usable name or primary role')
      continue
    }
    const claim = claims.get(talentId)
    if (claim === undefined) {
      people.push({
        talentId,
        name: person.name,
        role: person.role,
        engagement: 'roster',
        credit: null,
        ownerId: null,
        site: null,
        slot: null,
        beats: homeWeek(),
        blockedReason: null,
      })
      continue
    }
    const departure = departureBeat(seed, talentId, currentWeek)
    people.push({
      talentId,
      name: person.name,
      role: person.role,
      engagement: claim.engagement,
      credit: claim.credit,
      ownerId: claim.ownerId,
      site: claim.facilityId,
      slot: claim.slot,
      beats: workWeek(departure, claim.blockedReason === null ? 'at-site' : 'waiting'),
      blockedReason: claim.blockedReason,
    })
  }

  people.sort((a, b) => (a.talentId < b.talentId ? -1 : a.talentId > b.talentId ? 1 : 0))

  const withheld: PresenceWithholding[] = []
  const withheldIds: string[] = []
  for (const talentId of withheldByTalent.keys()) withheldIds.push(talentId)
  withheldIds.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  for (let i = 0; i < withheldIds.length; i++) {
    const talentId = withheldIds[i]!
    withheld.push({ talentId, reason: withheldByTalent.get(talentId)! })
  }

  return { week: currentWeek, people, withheld }
}
