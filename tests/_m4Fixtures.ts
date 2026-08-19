// ── C2a-M4 fixtures — a CONTENDED studio ────────────────────────────────────
//
// Every law this milestone adds is a law about scarcity, and scarcity needs a
// studio that has run out of something. These fixtures build one out of the
// founding lot: two pictures in Development hold BOTH Development & Casting
// slots, and they hold them for two consecutive advances (Development and
// Pre-production both require the slot), which is the only way a queue is still a
// queue when the next week arrives.
//
// Built on `tests/contracts/_contractFixtures.ts` rather than beside it — the
// founding, the cash identity and the advance helper all already exist there.

import { applyActions, busyTalentIds, tick } from '../src/core/index.js'
import type {
  CastSlot,
  GameState,
  GreenlightScriptProjectPayload,
  SegmentId,
  StartCastingSessionPayload,
} from '../src/core/index.js'
import { contractedByRole, managedStudio, withCash } from './contracts/_contractFixtures.js'

/** The roster depth a contended fixture needs: two full packages plus a spare slate. */
export const CONTENDED_DEPTH = { actor: 9, writer: 6, director: 3, craft: 3 } as const

export function commissionFor(state: GameState, conceptIndex: number, writerIndex: number) {
  const concept = state.concepts[conceptIndex]!
  return {
    conceptId: concept.id,
    writerId: contractedByRole(state, 'writer')[writerIndex]!.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: {
        intimacy: [-0.5, 0.5] as [number, number],
        tonalWeight: [-0.5, 0.5] as [number, number],
        kineticEnergy: [-0.5, 0.5] as [number, number],
      },
    },
  }
}

/**
 * The remaining package for a Ready screenplay, staffed from whoever is NOT
 * already engaged — so a second and third picture can be packaged without the
 * fixture tripping talent exclusivity, which is a different law than the one
 * under test.
 */
export function freePackage(
  state: GameState,
  projectId: string,
): GreenlightScriptProjectPayload {
  const payload = freePackageOrNull(state, projectId)
  if (payload === null) {
    throw new Error(`c2a-m4 fixture: project "${projectId}" cannot be staffed from the free roster`)
  }
  return payload
}

/**
 * The same package, or NULL when the roster is exhausted — which a contention
 * fixture has to be able to ask, because a studio with four pictures in flight
 * runs out of bodies before it runs out of rooms and the test is about rooms.
 */
export function freePackageOrNull(
  state: GameState,
  projectId: string,
): GreenlightScriptProjectPayload | null {
  const project = state.scriptDevelopment.projects.find((entry) => entry.id === projectId)
  if (project === undefined) return null
  const concept = state.concepts.find((entry) => entry.id === project.conceptId)
  if (concept === undefined) return null
  const busy = busyTalentIds(state)
  const free = (role: 'actor' | 'director' | 'craft') =>
    contractedByRole(state, role).filter(
      (person) => !busy.has(person.id) && person.id !== project.writerId,
    )
  const actors = free('actor')
  const director = free('director')[0]
  const craft = free('craft')[0]
  if (director === undefined || craft === undefined || actors.length < 3) return null
  return {
    projectId,
    directorId: director.id,
    craftIds: [craft.id],
    cast: {
      lead: actors[0]!.id,
      antagonist: actors[1]!.id,
      support: actors[2]!.id,
    } satisfies Record<CastSlot, string>,
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

/**
 * The next commission this studio could legally make — an unclaimed premise and
 * a writer with nothing on their desk — or NULL when it has run out of one.
 * A pressure loop has to be able to ask, because "no writer is free" is a
 * different refusal than the one under test.
 */
export function nextCommissionOrNull(state: GameState) {
  const claimed = new Set(state.scriptDevelopment.projects.map((project) => project.conceptId))
  const queuedConcepts = new Set(
    state.productionQueue.flatMap((entry) =>
      entry.kind === 'commissionScript' ? [entry.payload.conceptId] : [],
    ),
  )
  const concept = state.concepts.find(
    (candidate) => !claimed.has(candidate.id) && !queuedConcepts.has(candidate.id),
  )
  if (concept === undefined) return null
  const busy = busyTalentIds(state)
  const queuedWriters = new Set(
    state.productionQueue.flatMap((entry) =>
      entry.kind === 'commissionScript' || entry.kind === 'commissionOriginalScreenplay'
        ? [entry.payload.writerId]
        : [],
    ),
  )
  const writer = contractedByRole(state, 'writer').find(
    (candidate) => !busy.has(candidate.id) && !queuedWriters.has(candidate.id),
  )
  if (writer === undefined) return null
  return {
    conceptId: concept.id,
    writerId: writer.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: {
        intimacy: [-0.5, 0.5] as [number, number],
        tonalWeight: [-0.5, 0.5] as [number, number],
        kineticEnergy: [-0.5, 0.5] as [number, number],
      },
    },
  }
}

/**
 * An audition slate of three actors NO picture has locked — the contended
 * fixture's spare bodies, so a queued audition waits for capacity and never for
 * staffing.
 */
export function freeSlate(state: GameState, projectId: string): StartCastingSessionPayload {
  const busy = busyTalentIds(state)
  const actors = contractedByRole(state, 'actor').filter((person) => !busy.has(person.id))
  return {
    projectId,
    slate: {
      lead: [actors[0]!.id, actors[1]!.id],
      antagonist: [actors[0]!.id, actors[2]!.id],
      support: [actors[1]!.id, actors[2]!.id],
    },
  }
}

export type ContendedStudio = {
  /** Both Development & Casting slots held by two pictures in Development. */
  state: GameState
  /** Two Ready screenplays nobody has greenlit — the queue's raw material. */
  readyProjectIds: readonly string[]
  /** The two pictures already in flight, in greenlight order. */
  productionIds: readonly string[]
}

export function contendedStudio(seed: string): ContendedStudio {
  let state = withCash(managedStudio(seed, CONTENDED_DEPTH), 200_000_000)
  const projectIds: string[] = []
  // Four screenplays, two at a time — the studio has exactly two slots, so the
  // fixture itself respects the capacity it is about to contend.
  for (const pair of [
    [0, 1],
    [2, 3],
  ]) {
    for (const index of pair) {
      state = applyActions(state, [
        { kind: 'commissionScript', project: commissionFor(state, index, index) },
      ])
    }
    state = tick(state)
    for (const project of state.scriptDevelopment.projects) {
      if (project.status !== 'review') continue
      state = applyActions(state, [{ kind: 'acceptScript', projectId: project.id }])
      projectIds.push(project.id)
    }
  }
  const productionIds: string[] = []
  for (const projectId of projectIds.slice(0, 2)) {
    state = applyActions(state, [
      { kind: 'greenlightScriptProject', production: freePackage(state, projectId) },
    ])
    productionIds.push(
      state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id,
    )
  }
  return { state, readyProjectIds: projectIds.slice(2), productionIds }
}
