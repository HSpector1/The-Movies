// P04A.2 — shared fixtures for the writer-credit law suite.
//
// NOT a test file (no `.test.` in the name — vitest ignores it), following the house
// pattern of `_presenceFixtures.ts` / `_m4Fixtures.ts`.
//
// WHY THIS MODULE EXISTS AT ALL. The §19 suite has two halves that cannot live in one
// file: the core half (`p04a2-writer-credit-law.test.ts`) and the bridge half
// (`bridge-p04a2-writer-credit-law.test.ts`). `tsconfig.json` EXCLUDES `tests/bridge*.test.ts`
// and `tsconfig.bridge.json` INCLUDES only those, because bridge sources import with
// explicit `.ts` extensions; a non-`bridge*` test that imports `../bridge/**` breaks
// `npm run typecheck`. So the bridge-seam clause (§19E) has to sit in a `bridge*` file,
// and both files share this one builder rather than drifting apart.
//
// Everything here is built by calling PUBLIC actions with a NAMED seed. Nothing
// hand-edits cash, contracts, workflows or reservations.

import { expect } from 'vitest'

import {
  activeScriptWriterAssignments,
  applyActions,
  beginFounding,
  busyTalentIds,
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

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures — carried over verbatim from the Wave 0 witness.
// ─────────────────────────────────────────────────────────────────────────────

function applicants(state: GameState): Talent[] {
  return state.founding!.applicantIds.map(
    (id) => state.talent.find((talent) => talent.id === id)!,
  )
}

function byRole(talent: readonly Talent[], role: CreativeRole): Talent[] {
  return talent.filter((person) => person.role === role)
}

/**
 * The repo-conventional founding fixture. `extra` deepens NON-WRITER disciplines
 * only: every scenario in this file keeps EXACTLY ONE contracted writer, because
 * the one-writer studio is the world the deadlock existed in.
 */
export function foundedStudio(
  seed: string,
  extra: Partial<Record<CreativeRole, number>> = {},
): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = applicants(state)
  const wanted: Record<CreativeRole, number> = {
    actor: FOUNDING_MINIMUMS.actor + (extra.actor ?? 0),
    director: FOUNDING_MINIMUMS.director + (extra.director ?? 0),
    writer: FOUNDING_MINIMUMS.writer + (extra.writer ?? 0),
    craft: FOUNDING_MINIMUMS.craft + (extra.craft ?? 0),
  }
  const hires: Talent[] = []
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const available = byRole(pool, role)
    if (available.length < wanted[role]) {
      throw new Error(
        `p04a2 fixture: founding draft for seed "${seed}" offers ${String(available.length)} ${role}s, needs ${String(wanted[role])}`,
      )
    }
    hires.push(...available.slice(0, wanted[role]))
  }
  for (const hire of hires) {
    state = applyActions(state, [
      { kind: 'signContract', talentId: hire.id, termWeeks: 104 },
    ])
  }
  return applyActions(state, [{ kind: 'foundStudio' }])
}

export function contractedByRole(state: GameState, role: CreativeRole): Talent[] {
  const contractedIds = new Set(state.contracts.map((contract) => contract.talentId))
  return state.talent.filter(
    (talent) => talent.role === role && contractedIds.has(talent.id),
  )
}

export function commissionPayload(
  concept: FilmConcept,
  writerId: string,
): CommissionScriptPayload {
  return {
    conceptId: concept.id,
    writerId,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
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

/** A full legal casting package: director, three distinct actors, craft lead, budgets. */
export function remainingPackage(
  state: GameState,
  concept: FilmConcept,
  offsets: { director?: number; craft?: number; actor?: number } = {},
): Omit<GreenlightScriptProjectPayload, 'projectId'> {
  const actors = contractedByRole(state, 'actor')
  const a = offsets.actor ?? 0
  return {
    directorId: contractedByRole(state, 'director')[offsets.director ?? 0]!.id,
    craftIds: [contractedByRole(state, 'craft')[offsets.craft ?? 0]!.id],
    cast: {
      lead: actors[a + 0]!.id,
      antagonist: actors[a + 1]!.id,
      support: actors[a + 2]!.id,
    } satisfies Record<CastSlot, string>,
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

export function projectById(state: GameState, projectId: string) {
  return state.scriptDevelopment.projects.find((p) => p.id === projectId)!
}

export function writingIds(state: GameState): string[] {
  return activeScriptWriterAssignments(state.scriptDevelopment, state.concepts).map(
    (assignment) => assignment.talentId,
  )
}

/**
 * Issue whatever shooting commands the week is waiting on (the house idiom, copied
 * from tests/c2a-m4-release-law.test.ts). A picture does not shoot itself, so a walk
 * to Release has to drive the takes.
 */
export function driveTakes(state: GameState): GameState {
  let next = state
  for (const workflow of state.operations.workflows) {
    if (workflow.phase !== 'shooting' || workflow.shootingTask === null) continue
    const production = state.studio.activeProductions.find(
      (candidate) => candidate.id === workflow.productionId,
    )!
    if (workflow.shootingTask.status === 'unassigned') {
      // P05A W1: due-at-call settles inside the Director call itself.
      next = applyActions(next, [
        {
          kind: 'assignShootingDirector',
          productionId: production.id,
          directorId: production.directorId,
        },
      ])
    }
    const settled = next.operations.workflows.find(
      (candidate) => candidate.productionId === production.id,
    )
    if (settled?.shootingTask?.status === 'ready') {
      next = applyActions(next, [
        { kind: 'scheduleShootingTake', productionId: production.id },
      ])
    }
  }
  return next
}

/** Tick (driving takes each week) until `ready` holds, or throw. */
export function runUntil(
  state: GameState,
  ready: (candidate: GameState) => boolean,
  limit = 60,
): GameState {
  let next = state
  for (let i = 0; i < limit; i++) {
    if (ready(next)) return next
    next = driveTakes(next)
    next = tick(next)
  }
  if (!ready(next)) throw new Error('runUntil: condition not reached')
  return next
}

export function refusal(run: () => unknown): string {
  try {
    run()
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
  throw new Error('expected a refusal, but the action succeeded')
}

export type Scenario = {
  /** Screenplay A accepted → Ready. The writer is drafting NOTHING. */
  readyOnly: GameState
  /** Same, plus the SAME writer now drafting screenplay B. */
  deadlock: GameState
  writerId: string
  projectAId: string
  projectBId: string
  conceptA: FilmConcept
  conceptB: FilmConcept
  packageA: Omit<GreenlightScriptProjectPayload, 'projectId'>
}

/**
 * ONE contracted writer; screenplay A written by them and Ready; the SAME writer then
 * drafting screenplay B. This is the exact shape of the Owner's playtest failure (1).
 */
export function buildScenario(
  seed: string,
  extra: Partial<Record<CreativeRole, number>> = {},
): Scenario {
  let state = foundedStudio(seed, extra)
  state = applyActions(state, [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
  ])

  // 1. EXACTLY ONE contracted Writer (D-11.D cycle-4: FOUNDING_MINIMUMS.writer === 1).
  const writers = contractedByRole(state, 'writer')
  expect(writers).toHaveLength(1)
  const writerId = writers[0]!.id

  const conceptA = state.concepts[0]!
  const conceptB = state.concepts[1]!
  expect(conceptB.id).not.toBe(conceptA.id)

  // 2. The Writer drafts screenplay A.
  state = applyActions(state, [
    { kind: 'commissionScript', project: commissionPayload(conceptA, writerId) },
  ])
  const projectAId = state.scriptDevelopment.projects[0]!.id
  expect(projectById(state, projectAId).status).toBe('drafting')
  expect(busyTalentIds(state).has(writerId)).toBe(true)

  // 3. A reaches Review, then is Accepted → Ready for Casting.
  state = tick(state)
  expect(projectById(state, projectAId).status).toBe('review')
  state = applyActions(state, [{ kind: 'acceptScript', projectId: projectAId }])
  const projectA = projectById(state, projectAId)
  expect(projectA.status).toBe('ready')
  expect(projectA.writerId).toBe(writerId)

  // 4. The writer is genuinely RELEASED from A's active writing assignment (law B).
  expect(writingIds(state)).not.toContain(writerId)
  expect(busyTalentIds(state).has(writerId)).toBe(false)
  expect(projectA.reservation).toBeNull()
  expect(projectA.dueWeek).toBeNull()

  const readyOnly = state

  // 5. The SAME writer begins drafting screenplay B.
  const deadlock = applyActions(readyOnly, [
    { kind: 'commissionScript', project: commissionPayload(conceptB, writerId) },
  ])
  const projectB = deadlock.scriptDevelopment.projects.find(
    (p) => p.conceptId === conceptB.id,
  )!
  expect(projectB.status).toBe('drafting')
  expect(writingIds(deadlock)).toContain(writerId)

  // 6. A full legal casting package for A, with talent distinct from the writer.
  const packageA = remainingPackage(deadlock, conceptA)
  const packageIds = [
    packageA.directorId,
    packageA.cast.lead,
    packageA.cast.antagonist,
    packageA.cast.support,
    ...packageA.craftIds,
  ]
  expect(new Set(packageIds).size).toBe(5)
  expect(packageIds).not.toContain(writerId)

  return {
    readyOnly,
    deadlock,
    writerId,
    projectAId,
    projectBId: projectB.id,
    conceptA,
    conceptB,
    packageA,
  }
}

/** The greenlight command for screenplay A with its full legal package. */
export function greenlightA(scenario: Scenario) {
  return {
    kind: 'greenlightScriptProject' as const,
    production: { projectId: scenario.projectAId, ...scenario.packageA },
  }
}

export const SEED = 'p04a2-writer-credit-deadlock'
