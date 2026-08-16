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
  FOUNDING_MINIMUMS,
  generateWorld,
  tick,
} from '../src/core/index.js'
import type {
  CastSlot,
  CommissionScriptPayload,
  CreativeRole,
  FilmConcept,
  GameState,
  GreenlightScriptProjectPayload,
  SegmentId,
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
