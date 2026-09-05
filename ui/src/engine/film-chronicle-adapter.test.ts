// ── Film Chronicle V1 adapter proof ─────────────────────────────────────────────────
// This suite crosses the real GameState adapter boundary. Three sequential managed
// films put the subject's Produced ScriptProject and production debit between unrelated
// witnesses, proving that the Chronicle correlates by productionId rather than position.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../../../src/core/index.ts'
import {
  advanceWeek,
  commissionScriptAction,
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  greenlightScriptProject,
  importSaveJson,
  newGame,
  releaseNewspaper,
  requiredNegative,
  runProductionCommand,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  studioDecision,
} from './adapter.ts'
import type {
  CommissionScriptPayload,
  CreativeRole,
  DraftPackage,
  FilmResult,
  FilmShape,
  GameState,
} from './adapter.ts'

const FOUNDING_COUNTS: Record<CreativeRole, number> = {
  actor: 3,
  director: 1,
  writer: 1,
  craft: 1,
}

type FilmSpec = {
  conceptIndex: number
  shape: FilmShape
  rewrite: boolean
}

const FILMS: readonly FilmSpec[] = [
  {
    conceptIndex: 0,
    shape: { opening: 'immediateAction', midpoint: 'revelation', ending: 'bittersweet' },
    rewrite: false,
  },
  {
    conceptIndex: 1,
    shape: { opening: 'mysteryHook', midpoint: 'escalation', ending: 'ambiguous' },
    rewrite: true,
  },
  {
    conceptIndex: 2,
    shape: { opening: 'slowSetup', midpoint: 'reversal', ending: 'tragic' },
    rewrite: false,
  },
]

function managedStudio(seed: string): GameState {
  let state = newGame(seed)
  const applicants = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const applicant of applicants
      .filter((candidate) => candidate.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])) {
      const signed = signContractAction(state, applicant.profile.id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  return founded.next
}

function commission(state: GameState, spec: FilmSpec): { state: GameState; projectId: string } {
  const board = scriptProjectsBoard(state)
  const concept = board.commission.concepts[spec.conceptIndex % board.commission.concepts.length]!
  const writer = board.commission.writers.find(
    (candidate) => candidate.available && candidate.primaryRole === 'writer',
  )
  if (!writer) throw new Error('setup: no available contracted writer')
  const payload: CommissionScriptPayload = {
    conceptId: concept.id,
    writerId: writer.id,
    shape: spec.shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult', 'prestige'],
      ranges: {
        intimacy: [-0.4, 0.6],
        tonalWeight: [-0.1, 0.8],
        kineticEnergy: [-0.7, 0.4],
      },
    },
  }
  const result = commissionScriptAction(state, payload)
  if (!result.ok) throw new Error(result.error)
  const created = result.next.scriptDevelopment.projects.at(-1)
  if (!created) throw new Error('setup: commission created no project')
  return { state: result.next, projectId: created.id }
}

function runReviewAction(
  state: GameState,
  projectId: string,
  kind: 'acceptScript' | 'requestScriptRewrite',
): GameState {
  const action = scriptProjectsBoard(state).sections.needsReview
    .find((project) => project.projectId === projectId)
    ?.legalActions.find((candidate) => candidate.kind === kind)
  if (!action) throw new Error(`setup: no ${kind} action for ${projectId}`)
  const result = runScriptProjectAction(state, action)
  if (!result.ok) throw new Error(result.error)
  return result.next
}

function packageFor(state: GameState, projectId: string): DraftPackage {
  const ready = scriptProjectsBoard(state).packages.find((candidate) => candidate.projectId === projectId)
  if (!ready) throw new Error(`setup: no Ready package for ${projectId}`)
  const concept = state.concepts.find((candidate) => candidate.id === ready.concept.id)
  if (!concept) throw new Error('setup: Ready project lost its concept')
  const contracted = new Set(state.contracts.map((contract) => contract.talentId))
  const ids = (role: CreativeRole) =>
    state.talent
      .filter((candidate) => candidate.role === role && contracted.has(candidate.id))
      .map((candidate) => candidate.id)
  const actors = ids('actor')
  return {
    conceptId: ready.concept.id,
    shape: ready.lockedShape,
    promise: ready.lockedPromise,
    writerId: ready.writer.id,
    directorId: ids('director')[0]!,
    craftIds: [ids('craft')[0]!],
    cast: {
      lead: actors[0]!,
      antagonist: actors[1]!,
      support: actors[2]!,
    },
    budget: {
      negative: requiredNegative(concept, ready.lockedShape, state),
      marketing: 0,
    },
  }
}

function advanceManagedProduction(state: GameState): {
  state: GameState
  film: FilmResult
} {
  let current = state
  for (let guard = 0; guard < 40; guard++) {
    const decision = studioDecision(current)
    if (decision?.kind === 'scriptReview') {
      throw new Error('setup: unexpected script review during production')
    }
    if (decision?.kind === 'productionDecision') {
      const command = decision.decision.command
      if (command === null) throw new Error('setup: production decision has no command')
      const result = runProductionCommand(current, command)
      if (!result.ok) throw new Error(result.error)
      current = result.next
      continue
    }
    // P06A W1: a Release Ready picture HOLDS until explicitly committed — resolve the
    // decision the instant it appears so this walk still finds a real release.
    if (decision?.kind === 'releaseReview') {
      current = applyActions(current, [
        { kind: 'commitPictureToRelease', productionId: decision.decision.productionId },
      ])
      continue
    }
    const step = advanceWeek(current)
    if (step.released.length > 0) return { state: step.next, film: step.released[0]! }
    current = step.next
  }
  throw new Error('setup: managed production did not release')
}

function produce(state: GameState, spec: FilmSpec): { state: GameState; film: FilmResult } {
  const commissioned = commission(state, spec)
  let current = advanceWeek(commissioned.state).next
  if (spec.rewrite) {
    current = runReviewAction(current, commissioned.projectId, 'requestScriptRewrite')
    current = advanceWeek(current).next
  }
  current = runReviewAction(current, commissioned.projectId, 'acceptScript')
  const greenlit = greenlightScriptProject(current, commissioned.projectId, packageFor(current, commissioned.projectId))
  if (!greenlit.ok) throw new Error(greenlit.error)
  return advanceManagedProduction(greenlit.next)
}

function threeFilmState(seed: string): { state: GameState; films: FilmResult[] } {
  let state = managedStudio(seed)
  const films: FilmResult[] = []
  for (const spec of FILMS) {
    const released = produce(state, spec)
    state = released.state
    films.push(released.film)
  }
  return { state, films }
}

describe('Film Chronicle V1 — real adapter wiring', () => {
  it('associates the middle film with its exact Produced project and production debit', () => {
    const { state, films } = threeFilmState('chronicle-adapter-correlation')
    const film = films[1]!
    const produced = state.scriptDevelopment.projects.filter((project) => project.status === 'produced')
    const productionRows = state.ledger.filter((entry) => entry.kind === 'production')
    const projectIndex = produced.findIndex((project) => project.productionId === film.productionId)
    const rowIndex = productionRows.findIndex((entry) => entry.productionId === film.productionId)

    // Exact subject witnesses have unrelated, valid film witnesses before and after them.
    expect(produced).toHaveLength(3)
    expect(productionRows).toHaveLength(3)
    expect(projectIndex).toBe(1)
    expect(rowIndex).toBe(1)
    const project = produced[projectIndex]!
    const debit = productionRows[rowIndex]!
    expect(project.rewriteCount).toBe(1)
    expect(project.shape).toEqual(FILMS[1]!.shape)
    expect(produced[0]!.shape).toEqual(FILMS[0]!.shape)
    expect(produced[2]!.shape).toEqual(FILMS[2]!.shape)

    const stateBefore = structuredClone(state)
    const rngBefore = state.rngState
    const view = releaseNewspaper(state, film)
    expect(view).not.toBeNull()
    const creative = view!.chronicle.creativeRecord
    const chronology = view!.chronicle.productionRecord
    expect(creative.available).toBe(true)
    expect(chronology.available).toBe(true)
    if (!creative.available || !chronology.available) return
    expect(creative.shape).toEqual(project.shape)
    expect(creative.promise).toEqual(project.promise)
    expect(creative.commissionedWeek).toBe(project.commissionedWeek)
    expect(creative.rewriteCount).toBe(project.rewriteCount)
    expect(chronology.greenlightWeek).toBe(debit.week)
    expect(chronology.releaseWeek).toBe(film.releaseTick)
    expect(chronology.elapsedWeeks).toBe(film.releaseTick - debit.week)
    expect(view!.chronicle.credits.available && view!.chronicle.credits.participants.writer.talentId)
      .toBe(project.writerId)

    // A read-model call consumes no RNG and writes nothing into authoritative state.
    expect(state.rngState).toBe(rngBefore)
    expect(state).toEqual(stateBefore)
    expect(releaseNewspaper(state, film)).toEqual(view)
    expect(state.rngState).toBe(rngBefore)
    expect(state).toEqual(stateBefore)
  })

  it('uses current market week as the chronology gate and reconstructs deeply after V13 reload', () => {
    const { state, films } = threeFilmState('chronicle-adapter-reload')
    const film = films[1]!
    const atRelease = structuredClone(state)
    atRelease.market.tick = film.releaseTick
    const atReleaseFilm = atRelease.studio.releasedFilms.find(
      (candidate) => candidate.productionId === film.productionId,
    )!
    const accepted = releaseNewspaper(atRelease, atReleaseFilm)
    expect(accepted?.chronicle.productionRecord.available).toBe(true)

    const beforeRelease = structuredClone(state)
    beforeRelease.market.tick = film.releaseTick - 1
    const beforeReleaseFilm = beforeRelease.studio.releasedFilms.find(
      (candidate) => candidate.productionId === film.productionId,
    )!
    const rejected = releaseNewspaper(beforeRelease, beforeReleaseFilm)
    expect(rejected?.chronicle.creativeRecord.available).toBe(true)
    expect(rejected?.chronicle.credits.available).toBe(true)
    expect(rejected?.chronicle.productionRecord).toEqual({
      available: false,
      message: 'Detailed production chronology unavailable',
    })

    const stateBefore = structuredClone(state)
    const rngBefore = state.rngState
    const before = releaseNewspaper(state, film)
    expect(before).not.toBeNull()
    const json = exportSaveJson(state)
    expect((JSON.parse(json) as { saveVersion: number }).saveVersion).toBe(18) // P06A
    const imported = importSaveJson(json)
    expect(imported.ok).toBe(true)
    if (!imported.ok) return
    expect(imported.converted).toBe(false)
    const reloadedFilm = imported.state.studio.releasedFilms.find(
      (candidate) => candidate.productionId === film.productionId,
    )!
    expect(reloadedFilm).toBeDefined()
    expect(releaseNewspaper(imported.state, reloadedFilm)).toEqual(before)
    expect(state.rngState).toBe(rngBefore)
    expect(state).toEqual(stateBefore)
  })
})
