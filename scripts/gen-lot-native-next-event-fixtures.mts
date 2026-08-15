// World-First Lot-native Next Event V1 — hostile deterministic corpus.
//
// Run from the repository root:
//   node_modules/.bin/vite-node scripts/gen-lot-native-next-event-fixtures.mts
//
// Stored states are built only through public Core/adapter constructors, actions,
// and authoritative advance functions. The generator validates native SaveFileV11,
// byte-identical import/export, the exact next-event result, and a second replay from
// the serialized fixture before writing a timestamp-free manifest.

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyActions, generateWorld } from '../src/core/index.ts'
import {
  advanceToNextEvent,
  advanceWeek,
  castingSessionsBoard,
  commissionScriptAction,
  exportSaveJson,
  findConcept,
  foundManagedStudioAction,
  foundingApplicantCards,
  foundStudioAction,
  greenlight,
  importSaveJson,
  newGame,
  releaseNewspaper,
  requiredNegative,
  runProductionCommand,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  startCastingSessionAction,
  startDevelopmentCastingAnnexAction,
  studioDecision,
  studioDevelopment,
  studioLotSnapshot,
} from '../ui/src/engine/adapter.ts'
import type {
  CommissionScriptPayload,
  CreativeRole,
  DraftPackage,
  GameState,
  SimResult,
  StartCastingSessionPayload,
} from '../ui/src/engine/adapter.ts'
import {
  acceptedLotNextEventGuardNeutral,
  acceptedLotNextEventReceipt,
} from '../ui/src/lot/snapshot/nextEvent.ts'

const GENERATOR = 'scripts/gen-lot-native-next-event-fixtures.mts'
const OUTPUT_DIRECTORY = 'ui/e2e/lot-native-next-event-v1'
const REPRODUCE_COMMAND = `node_modules/.bin/vite-node ${GENERATOR}`
const ROLE_ORDER = ['actor', 'director', 'writer', 'craft'] as const satisfies readonly CreativeRole[]
const FOUNDING_COUNTS: Readonly<Record<CreativeRole, number>> = {
  actor: 8,
  director: 2,
  writer: 3,
  craft: 2,
}
const SHAPE = {
  opening: 'slowSetup',
  midpoint: 'reversal',
  ending: 'bittersweet',
} as const
const PROMISE_RANGES: {
  intimacy: [number, number]
  tonalWeight: [number, number]
  kineticEnergy: [number, number]
} = {
  intimacy: [-0.4, 0.4],
  tonalWeight: [-0.4, 0.4],
  kineticEnergy: [-0.4, 0.4],
}
const MARKETING_BUDGET = 400_000

type FoundingMode = 'legacy' | 'operations' | 'all-managed'

type FoundingSigning = {
  id: string
  name: string
  role: CreativeRole
  termWeeks: number
}

type BuiltStudio = {
  state: GameState
  recipe: Record<string, unknown>[]
}

type BuiltPackage = {
  pkg: DraftPackage
  recipe: Record<string, unknown>
}

type ExactExpectation = {
  arm: 'exact'
  target: Record<string, unknown>
}

type ReleaseExpectation = {
  arm: 'release'
  target: {
    kind: 'release'
    route: 'gazette-newspaper' | 'release-result'
    releases: { productionId: string; title: string }[]
  }
}

type NeutralExpectation = {
  arm: 'neutral'
  target: null
  neutralKind: 'next-event-neutral'
}

type GeneratedFixture = {
  id: string
  file: string
  seed: string
  state: GameState
  actionRecipe: readonly Record<string, unknown>[]
  claim: Record<string, unknown>
  result: SimResult
  presentation: ExactExpectation | ReleaseExpectation | NeutralExpectation
}

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`lot-native next-event fixture invariant: ${message}`)
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

function jsonEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function person(state: GameState, id: string): { id: string; name: string } {
  const candidate = state.talent.find((talent) => talent.id === id)
  invariant(candidate !== undefined, `unknown talent id ${JSON.stringify(id)}`)
  return { id: candidate.id, name: candidate.name }
}

function contractedIds(state: GameState, role: CreativeRole): string[] {
  return state.contracts
    .map((contract) => contract.talentId)
    .filter((id) => state.talent.find((talent) => talent.id === id)?.role === role)
}

function foundStudio(seed: string, termWeeks: number, mode: FoundingMode): BuiltStudio {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  const signings: FoundingSigning[] = []

  for (const role of ROLE_ORDER) {
    const selected = cards
      .filter((card) => card.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])
    invariant(
      selected.length === FOUNDING_COUNTS[role],
      `${seed} has ${String(selected.length)} founding ${role} candidates`,
    )
    for (const card of selected) {
      state = mustNext(
        signContractAction(state, card.profile.id, termWeeks),
        `signContract(${card.profile.id})`,
      )
      signings.push({
        id: card.profile.id,
        name: card.profile.name,
        role,
        termWeeks,
      })
    }
  }

  if (mode === 'all-managed') {
    state = mustNext(foundManagedStudioAction(state), 'foundManagedStudio')
  } else {
    state = mustNext(foundStudioAction(state), 'foundStudio')
    if (mode === 'operations') {
      state = applyActions(state, [{ kind: 'activateStudioOperations' }])
    }
  }

  invariant(state.founding === null, `${seed} did not leave the founding draft`)
  invariant(
    state.operations.mode === (mode === 'legacy' ? 'legacy' : 'managed'),
    `${seed} operations mode disagrees with ${mode}`,
  )
  invariant(
    state.scriptDevelopment.mode === (mode === 'all-managed' ? 'managed' : 'legacy'),
    `${seed} script mode disagrees with ${mode}`,
  )
  invariant(
    state.castingSessions.mode === (mode === 'all-managed' ? 'managed' : 'legacy'),
    `${seed} casting mode disagrees with ${mode}`,
  )

  return {
    state,
    recipe: [
      { action: 'newGame', seed },
      {
        action: 'signContract',
        selector: 'first N foundingApplicantCards in authoritative draft order for each role',
        roleOrder: ROLE_ORDER,
        counts: FOUNDING_COUNTS,
        termWeeks,
        resolvedSignings: signings,
      },
      {
        action: mode === 'all-managed' ? 'foundManagedStudio' : 'foundStudio',
        atomicManagedSystems:
          mode === 'all-managed'
            ? ['Studio Operations', 'Script Projects', 'Casting Sessions']
            : [],
      },
      ...(mode === 'operations'
        ? [{ action: 'activateStudioOperations' }]
        : []),
    ],
  }
}

function advanceExactly(state: GameState, count: number): GameState {
  let next = state
  for (let index = 0; index < count; index += 1) next = advanceWeek(next).next
  return next
}

function packageForContractedRoster(
  state: GameState,
  conceptIndex: number,
  crewIndex: number,
): BuiltPackage {
  const concept = state.concepts[conceptIndex]
  invariant(concept !== undefined, `missing concept at index ${String(conceptIndex)}`)
  const writerId = contractedIds(state, 'writer')[crewIndex]
  const directorId = contractedIds(state, 'director')[crewIndex]
  const craftId = contractedIds(state, 'craft')[crewIndex]
  const actors = contractedIds(state, 'actor').slice(crewIndex * 3, crewIndex * 3 + 3)
  invariant(writerId !== undefined, `missing contracted writer ${String(crewIndex)}`)
  invariant(directorId !== undefined, `missing contracted director ${String(crewIndex)}`)
  invariant(craftId !== undefined, `missing contracted craft ${String(crewIndex)}`)
  invariant(actors.length === 3, `missing contracted cast ${String(crewIndex)}`)
  const negative = requiredNegative(concept, SHAPE, state)
  const pkg: DraftPackage = {
    conceptId: concept.id,
    shape: SHAPE,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: PROMISE_RANGES,
    },
    writerId,
    directorId,
    craftIds: [craftId],
    cast: {
      lead: actors[0]!,
      antagonist: actors[1]!,
      support: actors[2]!,
    },
    budget: { negative, marketing: MARKETING_BUDGET },
  }
  return {
    pkg,
    recipe: {
      concept: { id: concept.id, title: concept.title, genre: concept.genre },
      shape: SHAPE,
      promise: { intendedSegments: ['adult'], ranges: PROMISE_RANGES },
      assignments: {
        writer: person(state, writerId),
        director: person(state, directorId),
        lead: person(state, actors[0]!),
        antagonist: person(state, actors[1]!),
        support: person(state, actors[2]!),
        craft: person(state, craftId),
      },
      budget: pkg.budget,
    },
  }
}

function packageForLegacyOpenPool(state: GameState): BuiltPackage {
  const concept = state.concepts[0]
  invariant(concept !== undefined, 'legacy world has no concept')
  const byRole = (role: CreativeRole): string[] =>
    state.talent.filter((talent) => talent.role === role).map((talent) => talent.id)
  const writers = byRole('writer')
  const directors = byRole('director')
  const actors = byRole('actor')
  const craft = byRole('craft')
  invariant(writers[0] !== undefined, 'legacy world has no writer')
  invariant(directors[0] !== undefined, 'legacy world has no director')
  invariant(actors.length >= 3, 'legacy world has fewer than three actors')
  invariant(craft[0] !== undefined, 'legacy world has no craft hire')
  const negative = requiredNegative(concept, SHAPE, state)
  const pkg: DraftPackage = {
    conceptId: concept.id,
    shape: SHAPE,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: PROMISE_RANGES,
    },
    writerId: writers[0],
    directorId: directors[0],
    craftIds: [craft[0]],
    cast: {
      lead: actors[0]!,
      antagonist: actors[1]!,
      support: actors[2]!,
    },
    budget: { negative, marketing: MARKETING_BUDGET },
  }
  return {
    pkg,
    recipe: {
      concept: { id: concept.id, title: concept.title, genre: concept.genre },
      shape: SHAPE,
      promise: { intendedSegments: ['adult'], ranges: PROMISE_RANGES },
      assignments: {
        writer: person(state, writers[0]),
        director: person(state, directors[0]),
        lead: person(state, actors[0]!),
        antagonist: person(state, actors[1]!),
        support: person(state, actors[2]!),
        craft: person(state, craft[0]),
      },
      budget: pkg.budget,
    },
  }
}

function greenlightPackage(state: GameState, built: BuiltPackage): GameState {
  return mustNext(greenlight(state, built.pkg), `greenlight(${String(built.pkg.conceptId)})`)
}

function commissionPayload(state: GameState): CommissionScriptPayload {
  const board = scriptProjectsBoard(state)
  const concept = board.commission.concepts[0]
  const writer = board.commission.writers.find((candidate) => candidate.available)
  invariant(concept !== undefined, 'script commission has no concept')
  invariant(writer !== undefined, 'script commission has no available writer')
  return {
    conceptId: concept.id,
    writerId: writer.id,
    shape: SHAPE,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: PROMISE_RANGES,
    },
  }
}

function castingSlate(state: GameState): StartCastingSessionPayload {
  const project = castingSessionsBoard(state).sections.readyToPlan[0]
  invariant(project !== undefined, 'casting setup has no Ready project')
  const candidates = project.candidates.lead.map((candidate) => candidate.id)
  invariant(candidates.length >= 3, 'casting setup has fewer than three candidates')
  return {
    projectId: project.projectId,
    slate: {
      lead: [candidates[0]!, candidates[1]!],
      antagonist: [candidates[0]!, candidates[1]!],
      support: [candidates[0]!, candidates[2]!],
    },
  }
}

function resolveShootingCommands(state: GameState): {
  state: GameState
  recipe: Record<string, unknown>
} {
  let next = state
  const commands: Record<string, unknown>[] = []
  for (let index = 0; index < 3; index += 1) {
    const selected = studioDecision(next)
    invariant(selected?.kind === 'productionDecision', `shooting command ${String(index + 1)} missing`)
    const command = selected.decision.command
    invariant(command !== null, `shooting command ${String(index + 1)} is null`)
    commands.push(structuredClone(command) as unknown as Record<string, unknown>)
    next = mustNext(runProductionCommand(next, command), command.kind)
  }
  invariant(
    jsonEqual(commands.map((command) => command.kind), [
      'assignShootingDirector',
      'clearSceneryLoadIn',
      'scheduleShootingTake',
    ]),
    `unexpected shooting command sequence ${JSON.stringify(commands)}`,
  )
  return {
    state: next,
    recipe: { action: 'runProductionCommand', commands },
  }
}

function exactFixture(
  input: Omit<GeneratedFixture, 'result' | 'presentation'> & {
    expectedReason: Exclude<SimResult['stopReason'], 'release' | 'limit'>
    expectedTarget: Record<string, unknown>
  },
): GeneratedFixture {
  invariant(studioDecision(input.state) === null, `${input.id} starts with a waiting decision`)
  const result = advanceToNextEvent(input.state)
  invariant(result.stopReason === input.expectedReason, `${input.id} stopped for ${result.stopReason}`)
  const receipt = acceptedLotNextEventReceipt(input.state, result)
  invariant(receipt !== null, `${input.id} did not produce an accepted exact receipt`)
  invariant(
    jsonEqual(receipt.target, input.expectedTarget),
    `${input.id} target ${JSON.stringify(receipt.target)} disagrees with ${JSON.stringify(input.expectedTarget)}`,
  )
  return {
    id: input.id,
    file: input.file,
    seed: input.seed,
    state: input.state,
    actionRecipe: input.actionRecipe,
    claim: input.claim,
    result,
    presentation: { arm: 'exact', target: structuredClone(receipt.target) as unknown as Record<string, unknown> },
  }
}

function releaseFixture(
  input: Omit<GeneratedFixture, 'result' | 'presentation'> & {
    gazetteCapable: boolean
    expectConstructionCompletion: boolean
  },
): GeneratedFixture {
  invariant(studioDecision(input.state) === null, `${input.id} starts with a waiting decision`)
  const result = advanceToNextEvent(input.state)
  invariant(result.stopReason === 'release', `${input.id} stopped for ${result.stopReason}`)
  invariant(result.released.length > 0, `${input.id} release result is empty`)
  invariant(
    (result.constructionCompletion !== null) === input.expectConstructionCompletion,
    `${input.id} construction co-event disagreement`,
  )
  const gazetteFlags = result.released.map((film) => releaseNewspaper(result.next, film) !== null)
  invariant(
    gazetteFlags.every((flag) => flag === input.gazetteCapable),
    `${input.id} Gazette capability ${JSON.stringify(gazetteFlags)} disagrees`,
  )
  const releases = result.released.map((film) => ({
    productionId: film.productionId,
    title: findConcept(result.next, film.conceptId)?.title ?? film.conceptId,
  }))
  return {
    id: input.id,
    file: input.file,
    seed: input.seed,
    state: input.state,
    actionRecipe: input.actionRecipe,
    claim: input.claim,
    result,
    presentation: {
      arm: 'release',
      target: {
        kind: 'release',
        route: input.gazetteCapable ? 'gazette-newspaper' : 'release-result',
        releases,
      },
    },
  }
}

function scriptReviewFixture(): GeneratedFixture {
  const seed = 'lot-next-event-script-review'
  const founded = foundStudio(seed, 104, 'all-managed')
  const payload = commissionPayload(founded.state)
  const state = mustNext(commissionScriptAction(founded.state, payload), 'commissionScript')
  const project = scriptProjectsBoard(state).sections.inDevelopment[0]
  invariant(project !== undefined, 'commissioned screenplay is absent')
  return exactFixture({
    id: 'script-review',
    file: 'script-review.save.json',
    seed,
    state,
    actionRecipe: [
      ...founded.recipe,
      { action: 'commissionScript', payload, resolvedProject: { projectId: project.projectId, title: project.title } },
    ],
    claim: { week: state.market.tick, projectId: project.projectId, title: project.title, status: project.status },
    expectedReason: 'scriptReview',
    expectedTarget: {
      kind: 'script',
      projectId: project.projectId,
      title: project.title,
      buildingId: 'writers',
    },
  })
}

function castingReviewFixture(): GeneratedFixture {
  const seed = 'lot-next-event-casting-review'
  const founded = foundStudio(seed, 104, 'all-managed')
  const commission = commissionPayload(founded.state)
  let state = mustNext(commissionScriptAction(founded.state, commission), 'commissionScript')
  state = advanceWeek(state).next
  const review = scriptProjectsBoard(state).sections.needsReview[0]
  invariant(review !== undefined, 'screenplay did not reach review after one advance')
  const accept = review.legalActions.find((action) => action.kind === 'acceptScript')
  invariant(accept !== undefined, 'screenplay review has no accept action')
  state = mustNext(runScriptProjectAction(state, accept), 'acceptScript')
  const session = castingSlate(state)
  state = mustNext(startCastingSessionAction(state, session), 'startCastingSession')
  const board = castingSessionsBoard(state)
  const active = board.sections.auditioning.find((candidate) => candidate.projectId === session.projectId)
  invariant(active !== undefined, 'started casting session is absent')
  return exactFixture({
    id: 'casting-review',
    file: 'casting-review.save.json',
    seed,
    state,
    actionRecipe: [
      ...founded.recipe,
      { action: 'commissionScript', payload: commission },
      { action: 'advanceWeek', count: 1, resultWeek: 1 },
      { action: 'runScriptProjectAction', command: accept },
      { action: 'startCastingSession', payload: session, resolvedSessionId: active.sessionId },
    ],
    claim: {
      week: state.market.tick,
      sessionId: active.sessionId,
      projectId: active.projectId,
      title: active.title,
      status: active.status,
    },
    expectedReason: 'castingReview',
    expectedTarget: {
      kind: 'casting',
      sessionId: active.sessionId,
      projectId: active.projectId,
      title: active.title,
      buildingId: 'casting',
    },
  })
}

function stage7DecisionFixture(): GeneratedFixture {
  const seed = 'lot-next-event-stage-7-decision'
  const founded = foundStudio(seed, 104, 'operations')
  const film = packageForContractedRoster(founded.state, 0, 0)
  const state = greenlightPackage(founded.state, film)
  const production = state.studio.activeProductions[0]
  invariant(production !== undefined, 'Stage 7 production was not greenlit')
  const title = findConcept(state, production.conceptId)?.title ?? production.conceptId
  return exactFixture({
    id: 'stage-7-production-decision',
    file: 'stage-7-production-decision.save.json',
    seed,
    state,
    actionRecipe: [...founded.recipe, { action: 'greenlight', package: film.recipe, resultWeek: 0 }],
    claim: { week: 0, productionId: production.id, title, expectedSoundstage: 'Soundstage 7' },
    expectedReason: 'productionDecision',
    expectedTarget: { kind: 'production', productionId: production.id, title, location: 'stage-7' },
  })
}

function stage12DecisionFixture(): GeneratedFixture {
  const seed = 'lot-next-event-stage-12-decision'
  const founded = foundStudio(seed, 104, 'operations')
  const first = packageForContractedRoster(founded.state, 0, 0)
  let state = greenlightPackage(founded.state, first)
  state = advanceWeek(state).next
  const second = packageForContractedRoster(state, 1, 1)
  state = greenlightPackage(state, second)
  state = advanceExactly(state, 3)
  const resolved = resolveShootingCommands(state)
  state = resolved.state
  invariant(studioDecision(state) === null, 'Stage 7 commands did not clear before Stage 12 start')
  const secondProduction = state.studio.activeProductions.find(
    (production) => production.conceptId === second.pkg.conceptId,
  )
  invariant(secondProduction !== undefined, 'Stage 12 production is absent')
  const title = findConcept(state, secondProduction.conceptId)?.title ?? secondProduction.conceptId
  const operation = studioLotSnapshot(state).productionOperations?.find(
    (candidate) => candidate.productionId === secondProduction.id,
  )
  invariant(operation?.locationBuildingId === 'stage-b', 'second production is not reserved on Stage 12')
  return exactFixture({
    id: 'stage-12-production-decision',
    file: 'stage-12-production-decision.save.json',
    seed,
    state,
    actionRecipe: [
      ...founded.recipe,
      { action: 'greenlight', package: first.recipe, resultWeek: 0 },
      { action: 'advanceWeek', count: 1, resultWeek: 1 },
      { action: 'greenlight', package: second.recipe, resultWeek: 1 },
      { action: 'advanceWeek', count: 3, resultWeek: 4 },
      resolved.recipe,
    ],
    claim: {
      week: state.market.tick,
      productionId: secondProduction.id,
      title,
      authoritativeSoundstage: operation.facilityLabel,
      locationBuildingId: operation.locationBuildingId,
      earlierStage7CommandsResolved: true,
    },
    expectedReason: 'productionDecision',
    expectedTarget: {
      kind: 'production',
      productionId: secondProduction.id,
      title,
      location: 'stage-12-semantic',
    },
  })
}

function simultaneousRunsFixture(): GeneratedFixture {
  const seed = 'lot-next-event-simultaneous-runs'
  const founded = foundStudio(seed, 208, 'legacy')
  const first = packageForContractedRoster(founded.state, 0, 0)
  const second = packageForContractedRoster(founded.state, 1, 1)
  let state = greenlightPackage(founded.state, first)
  state = greenlightPackage(state, second)
  const release = advanceToNextEvent(state)
  invariant(release.stopReason === 'release', `two-film setup stopped for ${release.stopReason}`)
  invariant(release.released.length === 2, `two-film setup released ${String(release.released.length)} films`)
  state = release.next
  const activeRuns = state.theatricalRuns.filter((run) => run.status === 'active')
  invariant(activeRuns.length === 2, `two-film setup has ${String(activeRuns.length)} active runs`)
  const expectedRuns = activeRuns.map((run) => ({
    productionId: run.productionId,
    title: findConcept(state, run.conceptId)?.title ?? run.conceptId,
  }))
  return exactFixture({
    id: 'simultaneous-completed-runs',
    file: 'simultaneous-completed-runs.save.json',
    seed,
    state,
    actionRecipe: [
      ...founded.recipe,
      { action: 'greenlight', package: first.recipe, resultWeek: 0 },
      { action: 'greenlight', package: second.recipe, resultWeek: 0 },
      {
        action: 'advanceToNextEvent',
        fromWeek: 0,
        toWeek: release.toWeek,
        stopReason: release.stopReason,
        releaseProductionIds: release.released.map((film) => film.productionId),
      },
    ],
    claim: {
      week: state.market.tick,
      activeRuns: activeRuns.map((run) => ({
        productionId: run.productionId,
        status: run.status,
        weekIndex: run.weekIndex,
        totalWeeks: run.totalWeeks,
      })),
    },
    expectedReason: 'runCompleted',
    expectedTarget: { kind: 'run-completed', runs: expectedRuns, buildingId: 'theater' },
  })
}

function cashCrossingFixture(): GeneratedFixture {
  const seed = 'lot-next-event-cash-crossing'
  const founded = foundStudio(seed, 400, 'legacy')
  return exactFixture({
    id: 'cash-negative-crossing',
    file: 'cash-negative-crossing.save.json',
    seed,
    state: founded.state,
    actionRecipe: founded.recipe,
    claim: { week: 0, cash: founded.state.studio.cash, contractTermWeeks: 400 },
    expectedReason: 'cashNegative',
    expectedTarget: { kind: 'cash', buildingId: 'admin' },
  })
}

function renewalWindowFixture(): GeneratedFixture {
  const seed = 'lot-next-event-renewal-window'
  const founded = foundStudio(seed, 52, 'legacy')
  return exactFixture({
    id: 'renewal-window-opening',
    file: 'renewal-window-opening.save.json',
    seed,
    state: founded.state,
    actionRecipe: founded.recipe,
    claim: { week: 0, contracts: founded.state.contracts.length, contractTermWeeks: 52 },
    expectedReason: 'renewalWindow',
    expectedTarget: { kind: 'contracts', change: 'renewal', buildingId: null },
  })
}

function contractExpiryFixture(): GeneratedFixture {
  const seed = 'lot-next-event-contract-expiry'
  const founded = foundStudio(seed, 52, 'legacy')
  const renewal = advanceToNextEvent(founded.state)
  invariant(renewal.stopReason === 'renewalWindow', `expiry setup stopped for ${renewal.stopReason}`)
  return exactFixture({
    id: 'contract-expiry',
    file: 'contract-expiry.save.json',
    seed,
    state: renewal.next,
    actionRecipe: [
      ...founded.recipe,
      {
        action: 'advanceToNextEvent',
        fromWeek: renewal.fromWeek,
        toWeek: renewal.toWeek,
        stopReason: renewal.stopReason,
        playerActionAtBoundary: 'none',
      },
    ],
    claim: {
      week: renewal.next.market.tick,
      contracts: renewal.next.contracts.length,
      renewalWindowAlreadyOpen: true,
    },
    expectedReason: 'contractExpired',
    expectedTarget: { kind: 'contracts', change: 'expired', buildingId: null },
  })
}

function constructionOnlyFixture(): GeneratedFixture {
  const seed = 'lot-next-event-construction-only'
  const founded = foundStudio(seed, 104, 'operations')
  const state = mustNext(
    startDevelopmentCastingAnnexAction(founded.state),
    'startDevelopmentCastingAnnex',
  )
  const construction = studioDevelopment(state)
  invariant(construction.status === 'building', 'construction-only fixture did not start the Annex')
  return exactFixture({
    id: 'construction-only-completion',
    file: 'construction-only-completion.save.json',
    seed,
    state,
    actionRecipe: [
      ...founded.recipe,
      { action: 'startDevelopmentCastingAnnex', resultWeek: state.market.tick },
    ],
    claim: {
      week: state.market.tick,
      projectId: construction.projectId,
      facilityId: construction.facilityId,
      status: construction.status,
      dueWeek: construction.dueWeek,
    },
    expectedReason: 'constructionCompleted',
    expectedTarget: {
      kind: 'construction',
      projectId: construction.projectId,
      facilityId: construction.facilityId,
      name: construction.name,
      buildingId: 'expansion',
    },
  })
}

function gazetteAnnexCoeventFixture(): GeneratedFixture {
  const seed = 'lot-next-event-gazette-annex-coevent'
  const founded = foundStudio(seed, 104, 'operations')
  let state = mustNext(
    startDevelopmentCastingAnnexAction(founded.state),
    'startDevelopmentCastingAnnex',
  )
  state = advanceExactly(state, 4)
  const film = packageForContractedRoster(state, 0, 0)
  state = greenlightPackage(state, film)
  state = advanceExactly(state, 4)
  const resolved = resolveShootingCommands(state)
  state = advanceExactly(resolved.state, 4)
  const construction = studioDevelopment(state)
  const production = state.studio.activeProductions[0]
  invariant(production !== undefined, 'Gazette co-event production is absent')
  invariant(production.remainingTicks === 1, 'Gazette co-event production is not release-next')
  invariant(construction.remainingAdvances === 1, 'Gazette co-event Annex is not completion-next')
  return releaseFixture({
    id: 'gazette-release-with-annex-completion',
    file: 'gazette-release-with-annex-completion.save.json',
    seed,
    state,
    actionRecipe: [
      ...founded.recipe,
      { action: 'startDevelopmentCastingAnnex', resultWeek: 0 },
      { action: 'advanceWeek', count: 4, resultWeek: 4 },
      { action: 'greenlight', package: film.recipe, resultWeek: 4 },
      { action: 'advanceWeek', count: 4, resultWeek: 8 },
      resolved.recipe,
      { action: 'advanceWeek', count: 4, resultWeek: 12 },
    ],
    claim: {
      week: state.market.tick,
      productionId: production.id,
      remainingTicks: production.remainingTicks,
      annexStatus: construction.status,
      annexRemainingAdvances: construction.remainingAdvances,
    },
    gazetteCapable: true,
    expectConstructionCompletion: true,
  })
}

function nonGazetteReleaseFixture(): GeneratedFixture {
  const seed = 'lot-next-event-non-gazette-release'
  const legacyWorld = generateWorld(seed)
  invariant(legacyWorld.founding === null, 'legacy constructor unexpectedly opened founding')
  invariant(legacyWorld.contracts.length === 0, 'legacy constructor unexpectedly has contracts')
  const film = packageForLegacyOpenPool(legacyWorld)
  const state = greenlightPackage(legacyWorld, film)
  const production = state.studio.activeProductions[0]
  invariant(production !== undefined, 'legacy release production is absent')
  invariant(production.participants === undefined, 'legacy release unexpectedly persisted participants')
  return releaseFixture({
    id: 'non-gazette-release',
    file: 'non-gazette-release.save.json',
    seed,
    state,
    actionRecipe: [
      {
        action: 'generateWorld',
        seed,
        authority: 'public Core legacy/M0A constructor retained for disengaged compatibility',
      },
      { action: 'greenlight', package: film.recipe, resultWeek: 0 },
    ],
    claim: {
      week: state.market.tick,
      productionId: production.id,
      participantsPersisted: false,
      compatibilityBoundary: 'disengaged M0A',
    },
    gazetteCapable: false,
    expectConstructionCompletion: false,
  })
}

function guardFixture(): GeneratedFixture {
  const seed = 'lot-next-event-520-week-guard'
  const state = generateWorld(seed)
  invariant(studioDecision(state) === null, 'guard state starts with a studio decision')
  invariant(state.studio.activeProductions.length === 0, 'guard state starts with a production')
  invariant(state.contracts.length === 0, 'guard state starts with a contract')
  const result = advanceToNextEvent(state)
  invariant(result.stopReason === 'limit', `guard fixture stopped for ${result.stopReason}`)
  invariant(result.guardHit, 'guard fixture did not report guardHit')
  invariant(result.weeks === 520, `guard fixture advanced ${String(result.weeks)} weeks`)
  invariant(result.preTick === state, 'guard fixture did not retain the rendered state as preTick')
  const neutral = acceptedLotNextEventGuardNeutral(state, result)
  invariant(neutral !== null, 'guard fixture did not produce accepted neutral facts')
  return {
    id: 'week-520-guard',
    file: 'week-520-guard.save.json',
    seed,
    state,
    actionRecipe: [
      {
        action: 'generateWorld',
        seed,
        authority: 'public Core deterministic adapter-level guard construction',
      },
    ],
    claim: {
      week: state.market.tick,
      contracts: 0,
      activeProductions: 0,
      directAdapterBoundary: true,
    },
    result,
    presentation: { arm: 'neutral', target: null, neutralKind: neutral.kind },
  }
}

function resultProjection(result: SimResult): Record<string, unknown> {
  return {
    fromWeek: result.fromWeek,
    toWeek: result.toWeek,
    weeks: result.weeks,
    stopReason: result.stopReason,
    stopMessage: result.stopMessage,
    guardHit: result.guardHit,
    released: result.released.map((film) => ({ productionId: film.productionId, conceptId: film.conceptId })),
    completedRuns: result.completedRuns,
    productionDecision: result.productionDecision,
    scriptDecision: result.scriptDecision,
    castingDecision: result.castingDecision,
    constructionCompletion: result.constructionCompletion,
    summary: result.summary,
    nextSaveSha256: sha256(exportSaveJson(result.next)),
  }
}

function verifiedSave(fixture: GeneratedFixture): {
  bytes: string
  byteLength: number
  sha256: string
  nextStateSha256: string
  replayProjection: Record<string, unknown>
} {
  const bytes = exportSaveJson(fixture.state)
  const envelope = JSON.parse(bytes) as { saveVersion?: unknown }
  invariant(envelope.saveVersion === 11, `${fixture.id} exported SaveFileV${String(envelope.saveVersion)}`)
  const imported = importSaveJson(bytes)
  invariant(imported.ok, `${fixture.id} import rejected — ${imported.ok ? '' : imported.error}`)
  invariant(imported.converted === false, `${fixture.id} import reported conversion`)
  invariant(exportSaveJson(imported.state) === bytes, `${fixture.id} import/export changed bytes`)

  const replay = advanceToNextEvent(imported.state)
  const expectedProjection = resultProjection(fixture.result)
  const replayProjection = resultProjection(replay)
  invariant(
    jsonEqual(replayProjection, expectedProjection),
    `${fixture.id} next-event replay changed its exact result`,
  )
  invariant(
    exportSaveJson(replay.next) === exportSaveJson(fixture.result.next),
    `${fixture.id} replay changed final SaveFileV11 bytes`,
  )

  return {
    bytes,
    byteLength: Buffer.byteLength(bytes, 'utf8'),
    sha256: sha256(bytes),
    nextStateSha256: sha256(exportSaveJson(replay.next)),
    replayProjection,
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
  scriptReviewFixture(),
  castingReviewFixture(),
  stage7DecisionFixture(),
  stage12DecisionFixture(),
  simultaneousRunsFixture(),
  cashCrossingFixture(),
  contractExpiryFixture(),
  renewalWindowFixture(),
  constructionOnlyFixture(),
  gazetteAnnexCoeventFixture(),
  nonGazetteReleaseFixture(),
  guardFixture(),
]

const here = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = join(here, '..')
const outputDirectory = join(repositoryRoot, OUTPUT_DIRECTORY)
mkdirSync(outputDirectory, { recursive: true })

const manifestFixtures = fixtures.map((fixture) => {
  const verified = verifiedSave(fixture)
  const status = writeVerified(join(outputDirectory, fixture.file), verified.bytes)
  // eslint-disable-next-line no-console
  console.log(
    `${status}: ${fixture.file} · ${String(verified.byteLength)} bytes · sha256 ${verified.sha256}`,
  )
  return {
    id: fixture.id,
    file: fixture.file,
    seed: fixture.seed,
    publicActionRecipe: fixture.actionRecipe,
    saveVersion: 11,
    byteLength: verified.byteLength,
    sha256: verified.sha256,
    expectedStartWeek: fixture.result.fromWeek,
    expectedEndWeek: fixture.result.toWeek,
    expectedWeeksAdvanced: fixture.result.weeks,
    expectedStopReason: fixture.result.stopReason,
    expectedPresentation: fixture.presentation,
    expectedConstructionCompletion: fixture.result.constructionCompletion,
    expectedFinalSaveSha256: verified.nextStateSha256,
    claim: fixture.claim,
  }
})

const manifest = `${JSON.stringify({
  schemaVersion: 'world-first-lot-native-next-event-hostile-corpus-v1',
  generatedBy: GENERATOR,
  reproduceCommand: REPRODUCE_COMMAND,
  outputDirectory: OUTPUT_DIRECTORY,
  authority: {
    stateConstruction: 'public Core/adapter constructors, actions, and authoritative advance functions only',
    ordinaryPlayerConstruction: 'newGame, founding cards, contracts, founding, managed activation, screenplay, casting, construction, greenlight, production commands, and real ticks',
    compatibilityConstruction: 'generateWorld is used only for the retained disengaged M0A non-Gazette path and the contract-authorized direct 520-week adapter guard boundary',
    nextEvent: 'advanceToNextEvent is the sole stop authority',
    serialization: 'exportSaveJson / importSaveJson native SaveFileV11 boundary',
    importedConverted: false,
    byteIdenticalImportExport: true,
    byteIdenticalNextEventReplay: true,
    deterministic: true,
    generatedFilesAreHandEdited: false,
    timestampsPresent: false,
  },
  minimality: {
    storedFixtures: fixtures.length,
    coveredBoundaries: 12,
    overlap: 'Gazette release is the higher-priority stop sharing Annex completion',
    blockers: [],
  },
  fixtures: manifestFixtures,
}, null, 2)}\n`
const manifestStatus = writeVerified(join(outputDirectory, 'manifest.json'), manifest)
// eslint-disable-next-line no-console
console.log(
  `${manifestStatus}: manifest.json · ${String(Buffer.byteLength(manifest, 'utf8'))} bytes · sha256 ${sha256(manifest)}`,
)
