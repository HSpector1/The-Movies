// Presence Projection V1 scenario fixtures. NOT a test file (no `.test.` in the
// name — vitest ignores it).
//
// Every world here is built by calling PUBLIC actions with a NAMED seed, in the
// house pattern used by the Casting Sessions and Placement suites: found a
// studio out of its own applicant pool, activate managed operations, commission
// screenplays, greenlight them. Nothing hand-edits cash, contracts, workflows,
// or reservations — the point of these fixtures is that presence is projected
// from truth the engine itself produced.

import {
  applyActions,
  beginFounding,
  BEATS_PER_WEEK,
  FOUNDING_MINIMUMS,
  generateWorld,
  rosterHomeFacilityId,
  tick,
} from '../src/core/index.js'
import type {
  CastSlot,
  CommissionScriptPayload,
  CreativeRole,
  FilmConcept,
  GameState,
  GreenlightScriptProjectPayload,
  PersonPresence,
  PresenceBeat,
  SegmentId,
  StudioPresence,
  Talent,
} from '../src/core/index.js'

export const FIXTURE_SHAPE = {
  opening: 'slowSetup',
  midpoint: 'revelation',
  ending: 'bittersweet',
} as const

function applicants(state: GameState): Talent[] {
  return state.founding!.applicantIds.map((id) => state.talent.find((t) => t.id === id)!)
}

function byRole(pool: readonly Talent[], role: CreativeRole): Talent[] {
  return pool.filter((person) => person.role === role)
}

/**
 * Found a studio, signing `counts` applicants of each primary role out of the
 * founding draft (defaults to the required minimums). The founding recruitment
 * fund — not cash — pays the bonuses, exactly as the D-11 law intends.
 */
export function foundedStudio(
  seed: string,
  counts: Partial<Record<CreativeRole, number>> = {},
): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = applicants(state)
  const wanted: Record<CreativeRole, number> = {
    actor: counts.actor ?? FOUNDING_MINIMUMS.actor,
    director: counts.director ?? FOUNDING_MINIMUMS.director,
    writer: counts.writer ?? FOUNDING_MINIMUMS.writer,
    craft: counts.craft ?? FOUNDING_MINIMUMS.craft,
  }
  const hires: Talent[] = []
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const available = byRole(pool, role)
    if (available.length < wanted[role]) {
      throw new Error(
        `presence fixture: founding draft for seed "${seed}" offers ${String(available.length)} ${role}s, needs ${String(wanted[role])}`,
      )
    }
    hires.push(...available.slice(0, wanted[role]))
  }
  for (const hire of hires) {
    state = applyActions(state, [{ kind: 'signContract', talentId: hire.id, termWeeks: 208 }])
  }
  return applyActions(state, [{ kind: 'foundStudio' }])
}

export function activateManaged(state: GameState): GameState {
  return applyActions(state, [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}

/** Contracted talent of a primary role, in stable `state.talent` order. */
export function contractedByRole(state: GameState, role: CreativeRole): Talent[] {
  const contracted = new Set(state.contracts.map((contract) => contract.talentId))
  return state.talent.filter((person) => person.role === role && contracted.has(person.id))
}

/** The n cheapest concepts by negative cost — keeps multi-film fixtures solvent. */
export function cheapestConcepts(state: GameState, n: number): FilmConcept[] {
  return [...state.concepts]
    .sort((a, b) =>
      a.baseNegativeCost !== b.baseNegativeCost
        ? a.baseNegativeCost - b.baseNegativeCost
        : a.id < b.id
          ? -1
          : 1,
    )
    .slice(0, n)
}

export function commissionPayload(concept: FilmConcept, writerId: string): CommissionScriptPayload {
  return {
    conceptId: concept.id,
    writerId,
    shape: { ...FIXTURE_SHAPE },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult', 'prestige'] as SegmentId[],
      ranges: {
        intimacy: [-0.4, 0.6],
        tonalWeight: [0, 0.8],
        kineticEnergy: [-0.7, 0.2],
      },
    },
  }
}

export function packagePayload(
  state: GameState,
  projectId: string,
  company: { directorId: string; craftIds: string[]; cast: Record<CastSlot, string> },
): GreenlightScriptProjectPayload {
  const project = state.scriptDevelopment.projects.find((candidate) => candidate.id === projectId)!
  const concept = state.concepts.find((candidate) => candidate.id === project.conceptId)!
  return {
    projectId,
    directorId: company.directorId,
    craftIds: company.craftIds,
    cast: company.cast,
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

// ── the projection's laws, checked against the state that produced it ────────
// Returns every violated law as a string so a test can assert `[]` and read the
// exact failure. Kept here so every presence spec applies the SAME laws to every
// world it builds, rather than each test re-deciding what "correct" means.

const BEAT_VALUES: readonly PresenceBeat[] = ['home', 'travel', 'at-site', 'waiting']

/** home* → travel → (at-site|waiting)+ → home, or a full week at home. */
function beatShapeViolation(beats: readonly PresenceBeat[]): string | null {
  if (beats.length !== BEATS_PER_WEEK) return `beats length ${String(beats.length)}`
  for (const beat of beats) {
    if (!BEAT_VALUES.includes(beat)) return `unknown beat "${String(beat)}"`
  }
  if (beats.every((beat) => beat === 'home')) return null
  const travelAt = beats.indexOf('travel')
  if (travelAt < 0) return 'a working week has no travel beat'
  if (beats.lastIndexOf('travel') !== travelAt) return 'more than one travel beat'
  for (let i = 0; i < travelAt; i++) {
    if (beats[i] !== 'home') return `beat ${String(i)} before travel is "${String(beats[i])}"`
  }
  const working = beats[travelAt + 1]
  if (working !== 'at-site' && working !== 'waiting') return 'travel is not followed by work'
  let i = travelAt + 1
  while (i < beats.length && beats[i] === working) i++
  for (; i < beats.length; i++) {
    if (beats[i] !== 'home') return `beat ${String(i)} after work is "${String(beats[i])}"`
  }
  if (beats[beats.length - 1] !== 'home') return 'the week does not end at home'
  return null
}

function reservationHolds(
  state: GameState,
  person: PersonPresence,
): string | null {
  const { engagement, ownerId, site, slot } = person
  if (ownerId === null || site === null || slot === null) return 'claim is missing owner/site/slot'
  if (engagement === 'production') {
    const workflow = state.operations.workflows.find(
      (candidate) => candidate.productionId === ownerId,
    )
    if (workflow === undefined) return `no workflow "${ownerId}"`
    const held = workflow.reservations.some(
      (reservation) => reservation.facilityId === site && reservation.slot === slot,
    )
    return held ? null : `production "${ownerId}" holds no reservation at ${site}:${String(slot)}`
  }
  if (engagement === 'script') {
    const project = state.scriptDevelopment.projects.find((candidate) => candidate.id === ownerId)
    if (project === undefined) return `no screenplay "${ownerId}"`
    const reservation = project.reservation
    if (reservation === null) return `screenplay "${ownerId}" holds no reservation`
    return reservation.facilityId === site && reservation.slot === slot
      ? null
      : `screenplay "${ownerId}" reservation is not ${site}:${String(slot)}`
  }
  const session = state.castingSessions.sessions.find((candidate) => candidate.id === ownerId)
  if (session === undefined) return `no casting session "${ownerId}"`
  const reservation = session.reservation
  if (reservation === null) return `casting session "${ownerId}" holds no reservation`
  return reservation.facilityId === site && reservation.slot === slot
    ? null
    : `casting session "${ownerId}" reservation is not ${site}:${String(slot)}`
}

export function presenceViolations(state: GameState, presence: StudioPresence): string[] {
  const problems: string[] = []
  const seen = new Set<string>()
  const facilityIds = new Set(state.operations.facilities.map((facility) => facility.id))

  for (let i = 0; i < presence.people.length; i++) {
    const person = presence.people[i]!
    if (seen.has(person.talentId)) problems.push(`${person.talentId}: projected more than once`)
    seen.add(person.talentId)
    if (i > 0 && !(presence.people[i - 1]!.talentId < person.talentId)) {
      problems.push(`${person.talentId}: out of ascending talentId order`)
    }
    const talent = state.talent.find((candidate) => candidate.id === person.talentId)
    if (talent === undefined) problems.push(`${person.talentId}: no talent record`)
    else if (talent.name !== person.name || talent.role !== person.role) {
      problems.push(`${person.talentId}: name/role disagree with the talent record`)
    }

    const shape = beatShapeViolation(person.beats)
    if (shape !== null) problems.push(`${person.talentId}: ${shape}`)

    const waiting = person.beats.includes('waiting')
    if (waiting !== (person.blockedReason !== null)) {
      problems.push(`${person.talentId}: waiting beats and blockedReason disagree`)
    }

    if (person.engagement === 'roster') {
      // Roster attendance canon (LL-CP1): an unclaimed contracted member
      // reports to their profession's home facility when it exists. A roster
      // week therefore either attends the exact canon home site (slot-less,
      // standard work-week shape) or stays entirely home; it never carries a
      // slot, owner, credit, or blocker either way.
      if (person.slot !== null || person.ownerId !== null) {
        problems.push(`${person.talentId}: a roster week claims a reservation`)
      }
      if (person.credit !== null) problems.push(`${person.talentId}: a roster week carries a credit`)
      if (person.blockedReason !== null) problems.push(`${person.talentId}: a roster week is blocked`)
      if (person.site !== null) {
        if (person.site !== rosterHomeFacilityId(person.role)) {
          problems.push(`${person.talentId}: a roster week attends a non-home site`)
        }
        if (!facilityIds.has(person.site)) {
          problems.push(`${person.talentId}: roster home site "${person.site}" is not a studio facility`)
        }
        if (person.beats.every((beat) => beat === 'home')) {
          problems.push(`${person.talentId}: an attending roster week never leaves home`)
        }
      } else if (!person.beats.every((beat) => beat === 'home')) {
        problems.push(`${person.talentId}: a home roster week leaves home`)
      }
      continue
    }

    if (person.site === null || person.slot === null) {
      problems.push(`${person.talentId}: a claimed week has no site`)
      continue
    }
    if (!facilityIds.has(person.site)) {
      problems.push(`${person.talentId}: site "${person.site}" is not a studio facility`)
    }
    if (!Number.isInteger(person.slot) || person.slot < 0) {
      problems.push(`${person.talentId}: slot ${String(person.slot)} is not a slot index`)
    }
    const held = reservationHolds(state, person)
    if (held !== null) problems.push(`${person.talentId}: ${held}`)

    if (waiting) {
      if (person.engagement !== 'production') {
        problems.push(`${person.talentId}: only a production company can queue`)
      } else {
        const workflow = state.operations.workflows.find(
          (candidate) => candidate.productionId === person.ownerId,
        )
        if (workflow?.blocker?.kind !== 'facility-capacity') {
          problems.push(`${person.talentId}: waits without a facility-capacity blocker`)
        }
      }
    }
  }

  // The converse: every facility-capacity blocker puts its company in the queue.
  for (const workflow of state.operations.workflows) {
    if (workflow.blocker?.kind !== 'facility-capacity') continue
    const queued = presence.people.filter(
      (person) => person.ownerId === workflow.productionId && person.engagement === 'production',
    )
    for (const person of queued) {
      if (!person.beats.includes('waiting')) {
        problems.push(`${person.talentId}: blocked company member is not waiting`)
      }
    }
  }

  for (const entry of presence.withheld) {
    if (entry.talentId === null) {
      if (presence.people.length > 0) problems.push('a global withholding still projected people')
      continue
    }
    if (seen.has(entry.talentId)) problems.push(`${entry.talentId}: withheld yet projected`)
    if (entry.reason.length === 0) problems.push(`${entry.talentId}: withheld without a reason`)
  }

  return problems
}

/** Commission one screenplay, run its single drafting week, and accept it. */
export function readyScript(
  state: GameState,
  concept: FilmConcept,
  writerId: string,
): { state: GameState; projectId: string } {
  let next = applyActions(state, [
    { kind: 'commissionScript', project: commissionPayload(concept, writerId) },
  ])
  const projectId = next.scriptDevelopment.projects.find(
    (project) => project.conceptId === concept.id,
  )!.id
  next = tick(next)
  next = applyActions(next, [{ kind: 'acceptScript', projectId }])
  return { state: next, projectId }
}
