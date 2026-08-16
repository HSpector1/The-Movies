// World-First Live Week Advance V1 — deterministic browser-acceptance authority.
//
// Run from the repository root:
//   node_modules/.bin/vite-node scripts/gen-live-week-advance-fixtures.mts
//
// Every fixture is built only through public Engine/adapter actions. The generator
// validates the live SaveFileV12 envelope, byte-identical import/export roundtrip,
// exact pre-state claim, and exact next authoritative advance before writing.

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyActions } from '../src/core/index.ts'
import {
  advanceWeek,
  explainRelease,
  exportSaveJson,
  freelancerMarketCards,
  foundStudioAction,
  foundingApplicantCards,
  greenlight,
  hiringMarketCards,
  importSaveJson,
  newGame,
  productionDecision,
  releaseNewspaper,
  requiredNegative,
  runProductionCommand,
  signContractAction,
  startDevelopmentCastingAnnexAction,
  studioDevelopment,
  studioLotSnapshot,
} from '../ui/src/engine/adapter.ts'
import type {
  CreativeRole,
  DraftPackage,
  GameState,
} from '../ui/src/engine/adapter.ts'

const GENERATOR = 'scripts/gen-live-week-advance-fixtures.mts'
const OUTPUT_DIRECTORY = 'ui/e2e/live-week-advance-v1'
const TERM_WEEKS = 104
const FOUNDING_COUNTS: Readonly<Record<CreativeRole, number>> = {
  actor: 8,
  director: 2,
  writer: 3,
  craft: 2,
}
const ROLE_ORDER = ['actor', 'director', 'writer', 'craft'] as const satisfies readonly CreativeRole[]
const PACKAGE_SHAPE = {
  opening: 'slowSetup',
  midpoint: 'reversal',
  ending: 'bittersweet',
} as const
const PACKAGE_PROMISE_RANGES: {
  intimacy: [number, number]
  tonalWeight: [number, number]
  kineticEnergy: [number, number]
} = {
  intimacy: [-0.4, 0.4],
  tonalWeight: [-0.4, 0.4],
  kineticEnergy: [-0.4, 0.4],
}
const MARKETING_BUDGET = 400_000

type FoundingSigning = {
  id: string
  name: string
  role: CreativeRole
  termWeeks: number
}

type PackageRecipe = {
  conceptId: string
  conceptTitle: string
  genre: string
  shape: typeof PACKAGE_SHAPE
  promise: {
    intendedSegments: ['adult']
    ranges: typeof PACKAGE_PROMISE_RANGES
  }
  assignments: {
    writer: { id: string; name: string }
    director: { id: string; name: string }
    lead: { id: string; name: string }
    antagonist: { id: string; name: string }
    support: { id: string; name: string }
    craft: { id: string; name: string }
  }
  budget: { negative: number; marketing: number }
}

type GeneratedFixture = {
  id: string
  file: string
  seed: string
  state: GameState
  claim: Record<string, unknown>
  actionRecipe: readonly Record<string, unknown>[]
  nextAdvance: Record<string, unknown>
}

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`live-week fixture invariant: ${message}`)
}

function mustNext(
  outcome: { ok: true; next: GameState } | { ok: false; error: string },
  action: string,
): GameState {
  if (!outcome.ok) throw new Error(`${action} rejected — ${outcome.error}`)
  return outcome.next
}

function sha256(bytes: string): string {
  return createHash('sha256').update(bytes, 'utf8').digest('hex')
}

function person(state: GameState, id: string): { id: string; name: string } {
  const talent = state.talent.find((candidate) => candidate.id === id)
  invariant(talent !== undefined, `unknown talent id ${JSON.stringify(id)}`)
  return { id: talent.id, name: talent.name }
}

function contractedIds(state: GameState, role: CreativeRole): string[] {
  return state.contracts
    .map((contract) => contract.talentId)
    .filter((id) => state.talent.find((talent) => talent.id === id)?.role === role)
}

function foundOperationsStudio(seed: string): {
  state: GameState
  signings: FoundingSigning[]
} {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  const signings: FoundingSigning[] = []

  for (const role of ROLE_ORDER) {
    const selected = cards
      .filter((card) => card.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])
    invariant(
      selected.length === FOUNDING_COUNTS[role],
      `${seed} has ${String(selected.length)} founding ${role} applicants, expected ${String(FOUNDING_COUNTS[role])}`,
    )
    for (const card of selected) {
      state = mustNext(
        signContractAction(state, card.profile.id, TERM_WEEKS),
        `signContract(${card.profile.id})`,
      )
      signings.push({
        id: card.profile.id,
        name: card.profile.name,
        role,
        termWeeks: TERM_WEEKS,
      })
    }
  }

  state = mustNext(foundStudioAction(state), 'foundStudio')
  state = applyActions(state, [{ kind: 'activateStudioOperations' }])
  invariant(state.operations.mode === 'managed', 'activateStudioOperations did not enter managed mode')
  invariant(state.scriptDevelopment.mode === 'legacy', 'fixture unexpectedly activated Script Projects')
  invariant(state.castingSessions.mode === 'legacy', 'fixture unexpectedly activated Casting Sessions')
  return { state, signings }
}

function advanceExactly(state: GameState, count: number): GameState {
  let next = state
  for (let i = 0; i < count; i++) next = advanceWeek(next).next
  return next
}

function packageFor(
  state: GameState,
  conceptTitle?: string,
  directorName?: string,
): { pkg: DraftPackage; recipe: PackageRecipe } {
  const concept = conceptTitle === undefined
    ? state.concepts[0]
    : state.concepts.find((candidate) => candidate.title === conceptTitle)
  invariant(concept !== undefined, `concept ${JSON.stringify(conceptTitle)} is absent`)

  const writerId = contractedIds(state, 'writer')[0]
  const directorIds = [
    ...contractedIds(state, 'director'),
    ...freelancerMarketCards(state)
      .filter((card) => card.profile.role === 'director')
      .map((card) => card.profile.id),
  ]
  const directorId = directorName === undefined
    ? directorIds[0]
    : directorIds.find((id) => state.talent.find((talent) => talent.id === id)?.name === directorName)
  const actorIds = contractedIds(state, 'actor')
  const craftId = contractedIds(state, 'craft')[0]
  invariant(writerId !== undefined, 'no contracted writer')
  invariant(directorId !== undefined, 'no contracted director')
  invariant(actorIds.length >= 3, 'fewer than three contracted actors')
  invariant(craftId !== undefined, 'no contracted craft hire')

  const negative = requiredNegative(concept, PACKAGE_SHAPE, state)
  const pkg: DraftPackage = {
    conceptId: concept.id,
    shape: PACKAGE_SHAPE,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: PACKAGE_PROMISE_RANGES,
    },
    writerId,
    directorId,
    cast: {
      lead: actorIds[0]!,
      antagonist: actorIds[1]!,
      support: actorIds[2]!,
    },
    craftIds: [craftId],
    budget: { negative, marketing: MARKETING_BUDGET },
  }
  return {
    pkg,
    recipe: {
      conceptId: concept.id,
      conceptTitle: concept.title,
      genre: concept.genre,
      shape: PACKAGE_SHAPE,
      promise: {
        intendedSegments: ['adult'],
        ranges: PACKAGE_PROMISE_RANGES,
      },
      assignments: {
        writer: person(state, writerId),
        director: person(state, directorId),
        lead: person(state, actorIds[0]!),
        antagonist: person(state, actorIds[1]!),
        support: person(state, actorIds[2]!),
        craft: person(state, craftId),
      },
      budget: { negative, marketing: MARKETING_BUDGET },
    },
  }
}

function greenlightPackage(
  state: GameState,
  conceptTitle?: string,
  directorName?: string,
): { state: GameState; recipe: PackageRecipe } {
  const built = packageFor(state, conceptTitle, directorName)
  return {
    state: mustNext(greenlight(state, built.pkg), `greenlight(${built.recipe.conceptTitle})`),
    recipe: built.recipe,
  }
}

function resolveShootingCommands(state: GameState): {
  state: GameState
  commandKinds: string[]
} {
  let next = state
  const commandKinds: string[] = []
  for (let guard = 0; guard < 3; guard++) {
    const command = productionDecision(next)?.command
    invariant(command !== null && command !== undefined, `missing shooting command ${String(guard + 1)}`)
    commandKinds.push(command.kind)
    next = mustNext(runProductionCommand(next, command), command.kind)
  }
  invariant(
    JSON.stringify(commandKinds) === JSON.stringify([
      'assignShootingDirector',
      'clearSceneryLoadIn',
      'scheduleShootingTake',
    ]),
    `unexpected shooting command sequence ${JSON.stringify(commandKinds)}`,
  )
  return { state: next, commandKinds }
}

function foundingRecipe(seed: string, signings: readonly FoundingSigning[]): Record<string, unknown>[] {
  return [
    { action: 'newGame', seed },
    {
      action: 'signContract',
      selector: 'first N foundingApplicantCards in authoritative draft order for each role',
      roleOrder: ROLE_ORDER,
      counts: FOUNDING_COUNTS,
      termWeeks: TERM_WEEKS,
      resolvedSignings: signings,
    },
    { action: 'foundStudio' },
    { action: 'activateStudioOperations' },
  ]
}

function makeNamedDirectorAssignable(
  state: GameState,
  name: string,
): { state: GameState; recipe: Record<string, unknown> } {
  const target = state.talent.find((talent) => talent.role === 'director' && talent.name === name)
  invariant(target !== undefined, `world has no director named ${name}`)
  if (contractedIds(state, 'director').includes(target.id)) {
    return {
      state,
      recipe: { action: 'useContractedDirector', talent: person(state, target.id) },
    }
  }
  if (freelancerMarketCards(state).some((card) => card.profile.id === target.id)) {
    return {
      state,
      recipe: {
        action: 'selectAvailableFreelancer',
        market: 'freelancerMarketCards',
        week: state.market.tick,
        talent: person(state, target.id),
      },
    }
  }
  if (hiringMarketCards(state).some((card) => card.profile.id === target.id)) {
    return {
      state: mustNext(signContractAction(state, target.id, TERM_WEEKS), `signContract(${target.id})`),
      recipe: {
        action: 'signContract',
        market: 'hiringMarketCards',
        week: state.market.tick,
        talent: person(state, target.id),
        termWeeks: TERM_WEEKS,
      },
    }
  }
  throw new Error(`${name} is neither contracted nor present in the Week ${String(state.market.tick)} public markets`)
}

function week30Stage7Fixture(): GeneratedFixture {
  const seed = 'marathon-annex-play'
  const founded = foundOperationsStudio(seed)
  let state = advanceExactly(founded.state, 26)
  const director = makeNamedDirectorAssignable(state, 'Estelle Delgado')
  state = director.state
  const greenlit = greenlightPackage(state, 'Nights of Watchtower', 'Estelle Delgado')
  state = advanceExactly(greenlit.state, 4)
  invariant(state.market.tick === 30, `Stage 7 prestate landed in Week ${String(state.market.tick)}`)
  invariant(
    productionDecision(state)?.command?.kind === 'assignShootingDirector',
    'Week-30 state did not request the Soundstage 7 director assignment',
  )
  const resolved = resolveShootingCommands(state)
  state = resolved.state

  const operation = studioLotSnapshot(state).productionOperations?.[0]
  invariant(operation !== undefined, 'Week-30 Stage 7 operation is absent')
  invariant(operation.title === 'Nights of Watchtower', `unexpected title ${operation.title}`)
  invariant(operation.locationBuildingId === 'stage-a', 'production is not reserved on exact Soundstage 7')
  invariant(operation.taskStatus === 'scheduled', `Stage 7 task is ${String(operation.taskStatus)}`)
  invariant(operation.directorName === 'Estelle Delgado', `unexpected Stage 7 director ${operation.directorName}`)

  const step = advanceWeek(state)
  invariant(step.next.market.tick === 31, 'Stage 7 next advance did not land in Week 31')
  invariant(step.released.length === 0, 'Stage 7 next advance unexpectedly released a film')
  const successor = studioLotSnapshot(step.next).productionOperations?.find(
    (candidate) => candidate.productionId === operation.productionId,
  )
  invariant(successor !== undefined, 'Stage 7 production disappeared after its scheduled take')
  invariant(successor.taskStatus === 'completed', `scheduled take advanced to ${String(successor.taskStatus)}`)

  return {
    id: 'week-30-nights-of-watchtower-stage-7-scheduled',
    file: 'week-30-nights-of-watchtower-stage-7-scheduled.save.json',
    seed,
    state,
    claim: {
      week: 30,
      productionId: operation.productionId,
      title: operation.title,
      phase: operation.phase,
      locationBuildingId: operation.locationBuildingId,
      authoritativeFacility: operation.facilityLabel,
      directorId: operation.directorId,
      directorName: operation.directorName,
      taskStatus: operation.taskStatus,
    },
    actionRecipe: [
      ...foundingRecipe(seed, founded.signings),
      { action: 'advanceWeek', count: 26, resultWeek: 26 },
      director.recipe,
      { action: 'greenlight', package: greenlit.recipe, resultWeek: 26 },
      { action: 'advanceWeek', count: 4, resultWeek: 30 },
      { action: 'runProductionCommand', sequence: resolved.commandKinds, consumesWeeks: 0 },
    ],
    nextAdvance: {
      fromWeek: 30,
      toWeek: 31,
      releaseCount: 0,
      productionId: operation.productionId,
      taskStatus: successor.taskStatus,
      constructionCompletion: false,
    },
  }
}

function annexCompletionFixture(): GeneratedFixture {
  const seed = 'live-week-annex-completion'
  const founded = foundOperationsStudio(seed)
  let state = mustNext(
    startDevelopmentCastingAnnexAction(founded.state),
    'startDevelopmentCastingAnnex',
  )
  state = advanceExactly(state, 12)
  const construction = studioDevelopment(state)
  invariant(state.market.tick === 12, `Annex prestate landed in Week ${String(state.market.tick)}`)
  invariant(construction.status === 'building', `Annex prestate is ${construction.status}`)
  invariant(construction.completedAdvances === 12, `Annex has ${String(construction.completedAdvances)} advances`)
  invariant(construction.remainingAdvances === 1, `Annex has ${String(construction.remainingAdvances)} advances left`)

  const step = advanceWeek(state)
  invariant(step.released.length === 0, 'isolated Annex completion unexpectedly released a film')
  invariant(step.constructionCompletion !== null, 'Annex did not complete on its next advance')
  const completed = studioDevelopment(step.next)
  invariant(completed.status === 'operational', `Annex advanced to ${completed.status}`)
  invariant(completed.completedWeek === 13, `Annex completed in Week ${String(completed.completedWeek)}`)

  return {
    id: 'week-12-annex-completion-next',
    file: 'week-12-annex-completion-next.save.json',
    seed,
    state,
    claim: {
      week: 12,
      status: construction.status,
      projectId: construction.projectId,
      facilityId: construction.facilityId,
      startedWeek: construction.startedWeek,
      dueWeek: construction.dueWeek,
      completedAdvances: construction.completedAdvances,
      remainingAdvances: construction.remainingAdvances,
    },
    actionRecipe: [
      ...foundingRecipe(seed, founded.signings),
      { action: 'startDevelopmentCastingAnnex', resultWeek: 0 },
      { action: 'advanceWeek', count: 12, resultWeek: 12 },
    ],
    nextAdvance: {
      fromWeek: 12,
      toWeek: 13,
      releaseCount: 0,
      constructionCompletion: true,
      completedWeek: completed.completedWeek,
      status: completed.status,
    },
  }
}

function annexProgressThenCompletionFixture(): GeneratedFixture {
  const seed = 'live-week-annex-progress-then-completion'
  const founded = foundOperationsStudio(seed)
  let state = mustNext(
    startDevelopmentCastingAnnexAction(founded.state),
    'startDevelopmentCastingAnnex',
  )
  state = advanceExactly(state, 11)
  const construction = studioDevelopment(state)
  invariant(state.market.tick === 11, `Annex progress prestate landed in Week ${String(state.market.tick)}`)
  invariant(construction.status === 'building', `Annex progress prestate is ${construction.status}`)
  invariant(construction.completedAdvances === 11, `Annex has ${String(construction.completedAdvances)} advances`)
  invariant(construction.remainingAdvances === 2, `Annex has ${String(construction.remainingAdvances)} advances left`)

  const progressStep = advanceWeek(state)
  invariant(progressStep.next.market.tick === 12, 'Annex progress advance did not land in Week 12')
  invariant(progressStep.released.length === 0, 'Annex progress advance unexpectedly released a film')
  invariant(progressStep.constructionCompletion === null, 'Annex completed during its progress-only advance')
  const progressed = studioDevelopment(progressStep.next)
  invariant(progressed.status === 'building', `Annex progress advance reached ${progressed.status}`)
  invariant(progressed.completedAdvances === 12, `Annex repainted ${String(progressed.completedAdvances)} advances`)
  invariant(progressed.remainingAdvances === 1, `Annex repaint has ${String(progressed.remainingAdvances)} advances left`)

  const completionStep = advanceWeek(progressStep.next)
  invariant(completionStep.next.market.tick === 13, 'Annex completion advance did not land in Week 13')
  invariant(completionStep.released.length === 0, 'Annex completion advance unexpectedly released a film')
  invariant(completionStep.constructionCompletion !== null, 'Annex did not complete after its progress repaint')
  const completed = studioDevelopment(completionStep.next)
  invariant(completed.status === 'operational', `Annex completion advance reached ${completed.status}`)
  invariant(completed.completedWeek === 13, `Annex completed in Week ${String(completed.completedWeek)}`)

  return {
    id: 'week-11-annex-progress-then-completion',
    file: 'week-11-annex-progress-then-completion.save.json',
    seed,
    state,
    claim: {
      week: 11,
      status: construction.status,
      projectId: construction.projectId,
      facilityId: construction.facilityId,
      startedWeek: construction.startedWeek,
      dueWeek: construction.dueWeek,
      completedAdvances: construction.completedAdvances,
      remainingAdvances: construction.remainingAdvances,
    },
    actionRecipe: [
      ...foundingRecipe(seed, founded.signings),
      { action: 'startDevelopmentCastingAnnex', resultWeek: 0 },
      { action: 'advanceWeek', count: 11, resultWeek: 11 },
    ],
    nextAdvance: {
      fromWeek: 11,
      toWeek: 12,
      releaseCount: 0,
      constructionCompletion: false,
      status: progressed.status,
      completedAdvances: progressed.completedAdvances,
      remainingAdvances: progressed.remainingAdvances,
      followingAuthoritativeAdvance: {
        fromWeek: 12,
        toWeek: 13,
        releaseCount: 0,
        constructionCompletion: true,
        completedWeek: completed.completedWeek,
        status: completed.status,
      },
    },
  }
}

function releaseCoeventFixture(): GeneratedFixture {
  const seed = 'live-week-release-annex-coevent'
  const founded = foundOperationsStudio(seed)
  let state = mustNext(
    startDevelopmentCastingAnnexAction(founded.state),
    'startDevelopmentCastingAnnex',
  )
  state = advanceExactly(state, 4)
  const greenlit = greenlightPackage(state)
  state = advanceExactly(greenlit.state, 4)
  invariant(
    productionDecision(state)?.command?.kind === 'assignShootingDirector',
    'release co-event did not reach its first shooting command after four advances',
  )
  const resolved = resolveShootingCommands(state)
  state = advanceExactly(resolved.state, 4)

  const construction = studioDevelopment(state)
  invariant(state.market.tick === 12, `release co-event prestate landed in Week ${String(state.market.tick)}`)
  invariant(construction.status === 'building', `release co-event Annex is ${construction.status}`)
  invariant(construction.completedAdvances === 12, 'release co-event Annex is not completion-next')
  invariant(state.studio.activeProductions.length === 1, 'release co-event must have one active film')
  invariant(state.studio.activeProductions[0]!.remainingTicks === 1, 'release co-event film is not release-next')

  const step = advanceWeek(state)
  invariant(step.next.market.tick === 13, 'release co-event next advance did not land in Week 13')
  invariant(step.released.length === 1, `release co-event produced ${String(step.released.length)} releases`)
  invariant(step.constructionCompletion !== null, 'release co-event did not complete the Annex')
  const film = step.released[0]!
  const title = step.next.concepts.find((concept) => concept.id === film.conceptId)?.title
  invariant(title !== undefined, `release co-event has unknown concept ${film.conceptId}`)
  invariant(film.participants !== undefined, 'release co-event film lacks persisted participants')
  invariant(releaseNewspaper(step.next, film) !== null, 'release co-event film is not Gazette-capable')
  const otherSameWeekReleases = step.released
    .filter((released) => released.productionId !== film.productionId)
    .map((released) => ({
      productionId: released.productionId,
      title: step.next.concepts.find((concept) => concept.id === released.conceptId)?.title ?? released.conceptId,
    }))
  const autopsy = explainRelease(
    step.preTick,
    step.next.studio.standing,
    film,
    otherSameWeekReleases,
  )
  invariant(autopsy.productionId === film.productionId, 'autopsy returned the wrong production identity')
  invariant(autopsy.conceptTitle === title, `autopsy returned title ${autopsy.conceptTitle}`)
  invariant(
    autopsy.sameWeekReleases.length === otherSameWeekReleases.length,
    'autopsy did not retain the exact other-release set',
  )

  return {
    id: 'week-12-release-annex-coevent-next',
    file: 'week-12-release-annex-coevent-next.save.json',
    seed,
    state,
    claim: {
      week: 12,
      productionId: state.studio.activeProductions[0]!.id,
      title,
      remainingTicks: state.studio.activeProductions[0]!.remainingTicks,
      annexStatus: construction.status,
      annexCompletedAdvances: construction.completedAdvances,
      annexRemainingAdvances: construction.remainingAdvances,
    },
    actionRecipe: [
      ...foundingRecipe(seed, founded.signings),
      { action: 'startDevelopmentCastingAnnex', resultWeek: 0 },
      { action: 'advanceWeek', count: 4, resultWeek: 4 },
      { action: 'greenlight', package: greenlit.recipe, resultWeek: 4 },
      { action: 'advanceWeek', count: 4, resultWeek: 8 },
      { action: 'runProductionCommand', sequence: resolved.commandKinds, consumesWeeks: 0 },
      { action: 'advanceWeek', count: 4, resultWeek: 12 },
    ],
    nextAdvance: {
      fromWeek: 12,
      toWeek: 13,
      releaseCount: 1,
      productionId: film.productionId,
      title,
      gazetteCapable: true,
      sessionAutopsyCapable: true,
      constructionCompletion: true,
      coevent: 'film release + Development & Casting Annex completion',
    },
  }
}

function verifiedSave(state: GameState): { bytes: string; sha256: string; byteLength: number } {
  const bytes = exportSaveJson(state)
  const envelope = JSON.parse(bytes) as { saveVersion?: unknown }
  invariant(envelope.saveVersion === 12, `exported envelope is SaveFileV${String(envelope.saveVersion)}`)
  const imported = importSaveJson(bytes)
  invariant(imported.ok, `generated SaveFileV12 import rejected — ${imported.ok ? '' : imported.error}`)
  invariant(imported.converted === false, 'generated SaveFileV12 was reported as converted')
  invariant(exportSaveJson(imported.state) === bytes, 'SaveFileV12 import/export roundtrip changed bytes')
  return {
    bytes,
    sha256: sha256(bytes),
    byteLength: Buffer.byteLength(bytes, 'utf8'),
  }
}

function writeVerified(path: string, bytes: string): 'unchanged' | 'written' {
  const unchanged = existsSync(path) && readFileSync(path, 'utf8') === bytes
  writeFileSync(path, bytes, 'utf8')
  const disk = readFileSync(path, 'utf8')
  invariant(disk === bytes, `disk verification failed for ${path}`)
  invariant(sha256(disk) === sha256(bytes), `disk hash verification failed for ${path}`)
  return unchanged ? 'unchanged' : 'written'
}

const fixtures = [
  week30Stage7Fixture(),
  annexProgressThenCompletionFixture(),
  annexCompletionFixture(),
  releaseCoeventFixture(),
]
const here = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = join(here, '..')
const outputDirectory = join(repositoryRoot, OUTPUT_DIRECTORY)
mkdirSync(outputDirectory, { recursive: true })

const manifestFixtures = fixtures.map((fixture) => {
  const verified = verifiedSave(fixture.state)
  const status = writeVerified(join(outputDirectory, fixture.file), verified.bytes)
  // eslint-disable-next-line no-console
  console.log(
    `${status}: ${fixture.file} · ${String(verified.byteLength)} bytes · sha256 ${verified.sha256}`,
  )
  return {
    id: fixture.id,
    file: fixture.file,
    saveVersion: 12,
    byteLength: verified.byteLength,
    sha256: verified.sha256,
    seed: fixture.seed,
    claim: fixture.claim,
    actionRecipe: fixture.actionRecipe,
    nextAuthoritativeAdvance: fixture.nextAdvance,
  }
})

const manifest = `${JSON.stringify({
  schemaVersion: 'world-first-live-week-advance-fixtures-v1',
  generatedBy: GENERATOR,
  reproduceCommand: 'node_modules/.bin/vite-node scripts/gen-live-week-advance-fixtures.mts',
  outputDirectory: OUTPUT_DIRECTORY,
  authority: {
    stateConstruction: 'public Engine actions and UI adapter action boundaries only',
    weeklyTransition: 'advanceWeek (one tick with normal-play development enabled)',
    serialization: 'exportSaveJson / importSaveJson live SaveFileV12 boundary',
    deterministic: true,
    generatedFilesAreHandEdited: false,
  },
  commonFoundingRecipe: {
    applicantSelection: 'first N foundingApplicantCards in authoritative draft order for each role',
    roleOrder: ROLE_ORDER,
    counts: FOUNDING_COUNTS,
    termWeeks: TERM_WEEKS,
    managedSystemsActivated: ['Studio Operations'],
    systemsRetainedInLegacyMode: ['Script Projects', 'Casting Sessions'],
  },
  fixtures: manifestFixtures,
}, null, 2)}\n`
const manifestStatus = writeVerified(join(outputDirectory, 'manifest.json'), manifest)
// eslint-disable-next-line no-console
console.log(
  `${manifestStatus}: manifest.json · ${String(Buffer.byteLength(manifest, 'utf8'))} bytes · sha256 ${sha256(manifest)}`,
)
