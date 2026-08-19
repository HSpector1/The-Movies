// ── Casting Sessions V1 ─────────────────────────────────────────────────────────────────────
// Authoritative, deterministic camera-test lifecycle. This module is pure: it
// consumes no mutable RNG stream, wall clock, cash, ledger, payroll, or actor
// assignment state, and it never mutates caller-owned inputs.

import { clamp } from './math.js'
import {
  facilitySlotKey,
  occupiedResourceSlots,
  resourceSlotClaimsOf,
} from './occupancy.js'
import { QueueableCapacityRefusal } from './productionQueue.js'
import { stream } from './rng.js'
import { resolveShape } from './shape.js'
import { castSlotExecution } from './talentSummary.js'
import {
  CASTING_CANDIDATES_PER_ROLE,
  CASTING_MIN_UNIQUE_CANDIDATES,
  CASTING_OBSERVATION_SIGMA,
  CASTING_RESULT_HALF_WIDTH,
  CASTING_SESSION_WEEKS,
} from './tuning.js'
import type {
  AuditionResult,
  CastSlot,
  CastingReservation,
  CastingResults,
  CastingSession,
  CastingSessions,
  CastingSlate,
  DevelopmentCastingOccupancy,
  FilmConcept,
  ScriptDevelopment,
  ScriptProject,
  StartCastingSessionPayload,
  StudioOperations,
  Talent,
} from './types.js'

const CAST_SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support']

export type CastingStartSources = {
  talent: readonly Talent[]
  // Exact current contracted-or-freelancer-market union, derived by the action
  // boundary. Keeping it explicit prevents this domain module from inventing a
  // second employment-market law.
  assignableTalentIds: ReadonlySet<string>
  // Ordinary active-production + active-screenplay availability at start.
  busyTalentIds: ReadonlySet<string>
}

export type CastingCompletionSources = {
  seed: string
  concepts: readonly FilmConcept[]
  talent: readonly Talent[]
  scriptDevelopment: ScriptDevelopment
}

export type CastingSessionsInvariantContext = {
  currentWeek: number
  operations: StudioOperations
  scriptDevelopment: ScriptDevelopment
  talent: readonly Talent[]
}

export function emptyCastingSessions(): CastingSessions {
  return { mode: 'legacy', sessions: [] }
}

export function initialManagedCastingSessions(): CastingSessions {
  return { mode: 'managed', sessions: [] }
}

export function canonicalCastingSessionId(index: number): string {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error(`casting sessions: session index must be a non-negative integer, got ${String(index)}`)
  }
  return `casting-${String(index).padStart(4, '0')}`
}

export function nextCastingSessionId(casting: CastingSessions): string {
  return canonicalCastingSessionId(casting.sessions.length)
}

export function castingSessionForProject(
  casting: CastingSessions,
  projectId: string,
): CastingSession | undefined {
  return casting.sessions.find((session) => session.projectId === projectId)
}

export function castingSessionsNeedingReview(casting: CastingSessions): CastingSession[] {
  return casting.sessions
    .filter((session) => session.status === 'review')
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
}

export function nextCastingSessionNeedingReview(
  casting: CastingSessions,
): CastingSession | undefined {
  return castingSessionsNeedingReview(casting)[0]
}

export function castingSlateTalentIds(slate: CastingSlate): string[] {
  const ids: string[] = []
  for (const slot of CAST_SLOTS) {
    const pair = slate[slot]
    if (!Array.isArray(pair)) continue
    for (const id of pair) ids.push(id)
  }
  return ids
}

function castingError(message: string): never {
  throw new Error(`casting sessions: ${message}`)
}

// Exact V1 pair and Hall-matching law. Same-person reads in different role pairs
// remain legal; each pair itself must be distinct and the full slate needs three
// distinct people so some legal three-person assignment exists.
export function assertCastingSlateLaw(slate: CastingSlate): void {
  const unique = new Set<string>()
  for (const slot of CAST_SLOTS) {
    const pair = slate[slot]
    if (!Array.isArray(pair) || pair.length !== CASTING_CANDIDATES_PER_ROLE) {
      castingError(`${slot} must contain exactly ${String(CASTING_CANDIDATES_PER_ROLE)} candidates`)
    }
    const first = pair[0]
    const second = pair[1]
    if (typeof first !== 'string' || first.length === 0 || typeof second !== 'string' || second.length === 0) {
      castingError(`${slot} candidates must be non-empty talent IDs`)
    }
    if (first === second) castingError(`${slot} candidates must be distinct`)
    unique.add(first)
    unique.add(second)
  }
  if (unique.size < CASTING_MIN_UNIQUE_CANDIDATES) {
    castingError(
      `the complete slate must contain at least ${String(CASTING_MIN_UNIQUE_CANDIDATES)} distinct people`,
    )
  }
}

export function assertCastingSlateEligibility(
  slate: CastingSlate,
  project: ScriptProject,
  sources: CastingStartSources,
): void {
  assertCastingSlateLaw(slate)
  const talentById = new Map(sources.talent.map((person) => [person.id, person]))
  for (const talentId of new Set(castingSlateTalentIds(slate))) {
    const person = talentById.get(talentId)
    if (person === undefined) castingError(`candidate "${talentId}" does not exist`)
    if (person.role !== 'actor') {
      castingError(`candidate "${talentId}" is not a primary Actor`)
    }
    if (talentId === project.writerId) {
      castingError(`candidate "${talentId}" is the screenplay's locked writer`)
    }
    if (sources.busyTalentIds.has(talentId)) {
      castingError(`candidate "${talentId}" is currently busy`)
    }
    if (!sources.assignableTalentIds.has(talentId)) {
      castingError(
        `candidate "${talentId}" is neither studio-contracted nor in the current freelancer market`,
      )
    }
  }
}

// C2a-M0: a thin view over the one union producer. The two private
// `productionOccupiedFacilitySlots` / `scriptOccupiedFacilitySlots` copies that
// used to sit beside it — duplicates of the same helpers in
// `scriptDevelopment.ts` — are gone.
export function castingOccupiedFacilitySlots(
  casting: CastingSessions,
  excludingSessionId?: string,
): Set<string> {
  return new Set(
    occupiedResourceSlots(
      { castingSessions: casting },
      excludingSessionId === undefined
        ? { owners: ['castingSession'] }
        : {
            owners: ['castingSession'],
            excludeOwner: 'castingSession',
            excludeOwnerId: excludingSessionId,
          },
    ).keys(),
  )
}

export function castingDevelopmentCastingOccupancy(
  operations: StudioOperations,
  casting: CastingSessions,
): DevelopmentCastingOccupancy[] {
  const facilityById = new Map(operations.facilities.map((facility) => [facility.id, facility]))
  const occupancy: DevelopmentCastingOccupancy[] = []
  for (const session of casting.sessions) {
    if (session.reservation === null) continue
    const facility = facilityById.get(session.reservation.facilityId)
    if (facility === undefined) {
      castingError(
        `session "${session.id}" reservation references unknown facility "${session.reservation.facilityId}"`,
      )
    }
    occupancy.push({
      facilityId: facility.id,
      facilityName: facility.name,
      slot: session.reservation.slot,
      owner: 'casting',
      ownerId: session.id,
      activity: 'auditioning',
    })
  }
  return occupancy.sort((a, b) => {
    if (a.facilityId !== b.facilityId) return a.facilityId < b.facilityId ? -1 : 1
    if (a.slot !== b.slot) return a.slot - b.slot
    return a.ownerId < b.ownerId ? -1 : a.ownerId > b.ownerId ? 1 : 0
  })
}

export function allocateCastingReservation(
  casting: CastingSessions,
  operations: StudioOperations,
  scriptDevelopment: ScriptDevelopment,
  sessionId: string,
  externallyOccupiedSlots: ReadonlySet<string> = new Set<string>(),
): CastingReservation | null {
  const occupied = new Set(externallyOccupiedSlots)
  // Productions, screenplays, and every OTHER audition — one traversal, from the
  // one union producer. This allocator has always been cross-owner aware; what
  // changes is that it no longer re-derives the owner list itself.
  for (const key of occupiedResourceSlots(
    { operations, scriptDevelopment, castingSessions: casting },
    {
      owners: ['production', 'screenplay', 'castingSession'],
      excludeOwner: 'castingSession',
      excludeOwnerId: sessionId,
    },
  ).keys()) {
    occupied.add(key)
  }

  const facilities = operations.facilities
    .filter((facility) => facility.capability === 'development-casting')
    .slice()
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))

  for (const facility of facilities) {
    for (let slot = 0; slot < facility.capacity; slot++) {
      if (occupied.has(facilitySlotKey(facility.id, slot))) continue
      return {
        sessionId,
        facilityId: facility.id,
        capability: 'development-casting',
        slot,
      }
    }
  }
  return null
}

function requireManaged(casting: CastingSessions, action: string): void {
  if (casting.mode !== 'managed') {
    castingError(`${action} rejected — Casting Sessions are not managed`)
  }
}

function cloneSlate(slate: CastingSlate): CastingSlate {
  return {
    lead: [slate.lead[0], slate.lead[1]],
    antagonist: [slate.antagonist[0], slate.antagonist[1]],
    support: [slate.support[0], slate.support[1]],
  }
}

export function startCastingSession(
  casting: CastingSessions,
  operations: StudioOperations,
  scriptDevelopment: ScriptDevelopment,
  payload: StartCastingSessionPayload,
  currentWeek: number,
  sources: CastingStartSources,
): CastingSessions {
  requireManaged(casting, 'start')
  if (operations.mode !== 'managed') {
    castingError('start rejected — managed Studio Operations are not active')
  }
  if (scriptDevelopment.mode !== 'managed') {
    castingError('start rejected — managed Script Development is not active')
  }
  if (!Number.isInteger(currentWeek) || currentWeek < 0) {
    castingError('start week must be a non-negative integer')
  }
  const project = scriptDevelopment.projects.find((candidate) => candidate.id === payload.projectId)
  if (project === undefined) castingError(`start references unknown project "${payload.projectId}"`)
  if (project.status !== 'ready') {
    castingError(`start rejected — project "${project.id}" is not Ready`)
  }
  if (castingSessionForProject(casting, project.id) !== undefined) {
    castingError(`start rejected — project "${project.id}" already owns a casting session`)
  }
  assertCastingSlateEligibility(payload.slate, project, sources)

  const id = nextCastingSessionId(casting)
  const reservation = allocateCastingReservation(casting, operations, scriptDevelopment, id)
  if (reservation === null) {
    // C2a-M4 (§3.3): the SAME sentence, now a NAMED refusal — the one an audition
    // front door converts into a queued intent. Every refusal above it (unknown
    // project, not Ready, already cast, an ineligible slate) still throws here and
    // now, because none of those is a thing waiting can fix.
    throw new QueueableCapacityRefusal(
      'casting sessions: start rejected — no Development & Casting slot is available',
    )
  }
  const session: CastingSession = {
    id,
    projectId: project.id,
    status: 'auditioning',
    slate: cloneSlate(payload.slate),
    startedWeek: currentWeek,
    dueWeek: currentWeek + CASTING_SESSION_WEEKS,
    reservation,
    results: null,
  }
  return { ...casting, sessions: [...casting.sessions, session] }
}

export function auditionObservation(
  seed: string,
  sessionId: string,
  talent: Talent,
  slot: CastSlot,
  concept: FilmConcept,
  project: Pick<ScriptProject, 'shape' | 'promise'>,
): AuditionResult {
  const execution = castSlotExecution(
    talent,
    concept,
    slot,
    resolveShape(project.shape),
    project.promise,
    'actual',
    project.shape,
  )
  const noise = stream(seed, 'casting-v1', `${sessionId}:${talent.id}:${slot}`).gaussian(
    0,
    CASTING_OBSERVATION_SIGMA,
  )
  const estimate = Math.round(clamp(execution + noise, 0, 100))
  return {
    talentId: talent.id,
    estimate,
    low: Math.max(0, estimate - CASTING_RESULT_HALF_WIDTH),
    high: Math.min(100, estimate + CASTING_RESULT_HALF_WIDTH),
  }
}

function completeSession(
  session: CastingSession,
  sources: CastingCompletionSources,
): CastingSession {
  const project = sources.scriptDevelopment.projects.find(
    (candidate) => candidate.id === session.projectId,
  )
  if (project === undefined) {
    castingError(`due session "${session.id}" references unknown project "${session.projectId}"`)
  }
  if (project.status !== 'ready') {
    castingError(`due session "${session.id}" project "${project.id}" is not Ready`)
  }
  const concept = sources.concepts.find((candidate) => candidate.id === project.conceptId)
  if (concept === undefined) {
    castingError(`due session "${session.id}" references unknown concept "${project.conceptId}"`)
  }
  const talentById = new Map(sources.talent.map((person) => [person.id, person]))
  const resultFor = (slot: CastSlot, talentId: string): AuditionResult => {
    const person = talentById.get(talentId)
    if (person === undefined) {
      castingError(`due session "${session.id}" references unknown talent "${talentId}"`)
    }
    return auditionObservation(sources.seed, session.id, person, slot, concept, project)
  }
  const results: CastingResults = {
    lead: [resultFor('lead', session.slate.lead[0]), resultFor('lead', session.slate.lead[1])],
    antagonist: [
      resultFor('antagonist', session.slate.antagonist[0]),
      resultFor('antagonist', session.slate.antagonist[1]),
    ],
    support: [
      resultFor('support', session.slate.support[0]),
      resultFor('support', session.slate.support[1]),
    ],
  }
  return {
    ...session,
    status: 'review',
    dueWeek: null,
    reservation: null,
    results,
  }
}

// Completes every due session in canonical stored order. Each observation owns a
// derived stream key, so changing traversal order would still produce the same
// result and state.rngState is outside this function's input entirely.
export function completeDueCastingSessions(
  casting: CastingSessions,
  currentWeek: number,
  sources: CastingCompletionSources,
): CastingSessions {
  if (casting.mode === 'legacy') return casting
  if (!Number.isInteger(currentWeek) || currentWeek < 0) {
    castingError('completion week must be a non-negative integer')
  }
  let changed = false
  const sessions = casting.sessions.map((session) => {
    if (
      session.status !== 'auditioning' ||
      session.dueWeek === null ||
      session.dueWeek > currentWeek
    ) {
      return session
    }
    changed = true
    return completeSession(session, sources)
  })
  return changed ? { ...casting, sessions } : casting
}

export function acknowledgeCastingSession(
  casting: CastingSessions,
  sessionId: string,
): CastingSessions {
  requireManaged(casting, 'acknowledge')
  const session = casting.sessions.find((candidate) => candidate.id === sessionId)
  if (session === undefined) castingError(`acknowledge references unknown session "${sessionId}"`)
  if (session.status !== 'review') {
    castingError(`acknowledge rejected — session "${sessionId}" does not need review`)
  }
  return {
    ...casting,
    sessions: casting.sessions.map((candidate) =>
      candidate.id === sessionId ? { ...candidate, status: 'complete' } : candidate,
    ),
  }
}

function invariant(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`casting sessions invariant: ${message}`)
}

function assertPersistedResult(
  result: AuditionResult,
  talentId: string,
  sessionId: string,
  slot: CastSlot,
): void {
  invariant(result !== null && typeof result === 'object', `session "${sessionId}" has malformed ${slot} evidence`)
  invariant(result.talentId === talentId, `session "${sessionId}" ${slot} result order disagrees with its slate`)
  invariant(
    Number.isInteger(result.estimate) && result.estimate >= 0 && result.estimate <= 100,
    `session "${sessionId}" has an invalid ${slot} estimate`,
  )
  invariant(
    Number.isInteger(result.low) &&
      result.low === Math.max(0, result.estimate - CASTING_RESULT_HALF_WIDTH),
    `session "${sessionId}" has an invalid ${slot} lower band`,
  )
  invariant(
    Number.isInteger(result.high) &&
      result.high === Math.min(100, result.estimate + CASTING_RESULT_HALF_WIDTH),
    `session "${sessionId}" has an invalid ${slot} upper band`,
  )
}

function assertPersistedResults(session: CastingSession): void {
  invariant(session.results !== null, `session "${session.id}" has no results`)
  for (const slot of CAST_SLOTS) {
    const pair = session.results[slot]
    invariant(
      Array.isArray(pair) && pair.length === CASTING_CANDIDATES_PER_ROLE,
      `session "${session.id}" has malformed ${slot} results`,
    )
    assertPersistedResult(pair[0], session.slate[slot][0], session.id, slot)
    assertPersistedResult(pair[1], session.slate[slot][1], session.id, slot)
  }
}

function assertCastingReservation(
  session: CastingSession,
  operations: StudioOperations,
  occupied: Set<string>,
): void {
  invariant(session.reservation !== null, `auditioning session "${session.id}" has no reservation`)
  const reservation = session.reservation
  invariant(reservation.sessionId === session.id, `session "${session.id}" reservation owner disagrees`)
  invariant(
    reservation.capability === 'development-casting',
    `session "${session.id}" reservation capability is not development-casting`,
  )
  const facility = operations.facilities.find((candidate) => candidate.id === reservation.facilityId)
  invariant(facility !== undefined, `session "${session.id}" reservation facility is unknown`)
  invariant(
    facility.capability === 'development-casting',
    `session "${session.id}" reservation facility has the wrong capability`,
  )
  invariant(
    Number.isInteger(reservation.slot) && reservation.slot >= 0 && reservation.slot < facility.capacity,
    `session "${session.id}" reservation slot is outside facility capacity`,
  )
  const key = facilitySlotKey(reservation.facilityId, reservation.slot)
  invariant(!occupied.has(key), `facility slot "${key}" is overbooked across productions/scripts/casting`)
  occupied.add(key)
}

// C2a-M0: the walk is the one union producer's, in its fixed source order
// (production reservations, then screenplays); only the per-owner refusal words
// stay here, because they are what this module's contract pins.
function initialDevelopmentCastingOccupancy(
  operations: StudioOperations,
  scriptDevelopment: ScriptDevelopment,
): Set<string> {
  const occupied = new Set<string>()
  for (const claim of resourceSlotClaimsOf(
    occupiedResourceSlots(
      { operations, scriptDevelopment },
      { owners: ['production', 'screenplay'] },
    ),
  )) {
    if (claim.owner === 'production' && claim.capability !== 'development-casting') continue
    invariant(
      !occupied.has(claim.facilitySlotKey),
      claim.owner === 'production'
        ? `facility slot "${claim.facilitySlotKey}" is duplicated by production reservations`
        : `facility slot "${claim.facilitySlotKey}" is overbooked across productions/scripts`,
    )
    occupied.add(claim.facilitySlotKey)
  }
  return occupied
}

// Save validation establishes exact keys/scalar types before calling this shared
// lifecycle assertion. It deliberately rechecks durable identity and all three
// Development & Casting owners, but not start-time market/busy facts that history
// cannot reconstruct after the week advances.
export function assertCastingSessionsInvariants(
  casting: CastingSessions,
  context: CastingSessionsInvariantContext,
): void {
  invariant(
    Number.isInteger(context.currentWeek) && context.currentWeek >= 0,
    'current week must be a non-negative integer',
  )
  if (casting.mode === 'legacy') {
    invariant(casting.sessions.length === 0, 'legacy mode must have no sessions')
    return
  }
  invariant(casting.mode === 'managed', `unknown mode ${String(casting.mode)}`)
  invariant(context.operations.mode === 'managed', 'managed casting requires managed studio operations')
  invariant(
    context.scriptDevelopment.mode === 'managed',
    'managed casting requires managed script development',
  )

  const talentById = new Map(context.talent.map((person) => [person.id, person]))
  const projectById = new Map(
    context.scriptDevelopment.projects.map((project) => [project.id, project]),
  )
  const projectIds = new Set<string>()
  const occupied = initialDevelopmentCastingOccupancy(
    context.operations,
    context.scriptDevelopment,
  )

  for (let index = 0; index < casting.sessions.length; index++) {
    const session = casting.sessions[index]!
    invariant(
      session.id === canonicalCastingSessionId(index),
      `session at index ${String(index)} must be ${canonicalCastingSessionId(index)}`,
    )
    invariant(!projectIds.has(session.projectId), `duplicate project session "${session.projectId}"`)
    projectIds.add(session.projectId)
    const project = projectById.get(session.projectId)
    invariant(project !== undefined, `session "${session.id}" references unknown project`)
    invariant(
      Number.isInteger(session.startedWeek) &&
        session.startedWeek >= 0 &&
        session.startedWeek <= context.currentWeek,
      `session "${session.id}" has an invalid or future start week`,
    )

    assertCastingSlateLaw(session.slate)
    for (const talentId of new Set(castingSlateTalentIds(session.slate))) {
      const person = talentById.get(talentId)
      invariant(person !== undefined, `session "${session.id}" references unknown talent "${talentId}"`)
      invariant(
        person.role === 'actor',
        `session "${session.id}" candidate "${talentId}" is not a primary Actor`,
      )
      invariant(
        talentId !== project.writerId,
        `session "${session.id}" candidate "${talentId}" is its locked writer`,
      )
    }

    switch (session.status) {
      case 'auditioning':
        invariant(project.status === 'ready', `auditioning session "${session.id}" project is not Ready`)
        invariant(
          session.dueWeek === session.startedWeek + CASTING_SESSION_WEEKS &&
            session.dueWeek > context.currentWeek,
          `auditioning session "${session.id}" has an invalid due week`,
        )
        invariant(session.results === null, `auditioning session "${session.id}" already has results`)
        assertCastingReservation(session, context.operations, occupied)
        break
      case 'review':
        invariant(project.status === 'ready', `review session "${session.id}" project is not Ready`)
        invariant(
          context.currentWeek >= session.startedWeek + CASTING_SESSION_WEEKS,
          `review session "${session.id}" must have elapsed at least one week`,
        )
        invariant(session.dueWeek === null, `review session "${session.id}" has a due week`)
        invariant(session.reservation === null, `review session "${session.id}" holds capacity`)
        assertPersistedResults(session)
        break
      case 'complete':
        invariant(
          project.status === 'ready' || project.status === 'inProduction' || project.status === 'produced',
          `complete session "${session.id}" has an incompatible screenplay status`,
        )
        invariant(
          context.currentWeek >= session.startedWeek + CASTING_SESSION_WEEKS,
          `complete session "${session.id}" must have elapsed at least one week`,
        )
        invariant(session.dueWeek === null, `complete session "${session.id}" has a due week`)
        invariant(session.reservation === null, `complete session "${session.id}" holds capacity`)
        assertPersistedResults(session)
        break
      default:
        invariant(false, `session "${session.id}" has unknown status ${String(session.status)}`)
    }
  }
}
