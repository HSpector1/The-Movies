// World-First Scenery Load-In V1 — deterministic browser-acceptance authority.
//
// Run from the repository root:
//   node_modules/.bin/vite-node scripts/gen-world-first-scenery-load-in-fixtures.mts
//
// The emitted blocked and ready saves are produced only through public Engine and
// adapter actions. The unassigned predecessor and scheduled successor remain
// in-memory proof anchors; the successor must match the already-frozen Live Week
// Advance V1 fixture byte for byte.

import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyActions } from '../src/core/index.ts'
import {
  advanceWeek,
  exportSaveJson,
  freelancerMarketCards,
  foundStudioAction,
  foundingApplicantCards,
  greenlight,
  importSaveJson,
  newGame,
  productionDecision,
  requiredNegative,
  runProductionCommand,
  signContractAction,
  studioLotSnapshot,
} from '../ui/src/engine/adapter.ts'
import type {
  CreativeRole,
  DraftPackage,
  GameState,
  ProductionCommandView,
} from '../ui/src/engine/adapter.ts'

const GENERATOR = 'scripts/gen-world-first-scenery-load-in-fixtures.mts'
const OUTPUT_DIRECTORY = 'ui/e2e/world-first-scenery-load-in-v1'
const SCHEDULED_REFERENCE =
  'ui/e2e/live-week-advance-v1/week-30-nights-of-watchtower-stage-7-scheduled.save.json'
const SEED = 'marathon-annex-play'
const PRODUCTION_ID = 'prod-0026'
const TASK_ID = 'shooting:prod-0026'
const TERM_WEEKS = 104
const FOUNDING_COUNTS: Readonly<Record<CreativeRole, number>> = {
  actor: 8,
  director: 2,
  writer: 3,
  craft: 2,
}
const ROLE_ORDER = ['actor', 'director', 'writer', 'craft'] as const satisfies readonly CreativeRole[]
const EXPECTED_FILES = [
  'manifest.json',
  'week-30-nights-of-watchtower-stage-7-blocked.save.json',
  'week-30-nights-of-watchtower-stage-7-ready.save.json',
] as const
const EXPECTED_ANCHORS = {
  unassigned: {
    byteLength: 227_430,
    sha256: '2b352e3ef1be5ab9d5e0ba0abfbeb6c0a717f5334afe7d6a60ff5a81cef584ca',
  },
  blocked: {
    byteLength: 227_479,
    sha256: '7534518e4db3970bb4ca988b0b0fa78975f5053ee67fd42377f69b80ebe711dc',
  },
  ready: {
    byteLength: 227_425,
    sha256: '6760b72739608e930da84726067685c515d87817cb3793f9d9d37fa9f2063f92',
  },
  scheduled: {
    byteLength: 227_429,
    sha256: 'e922f9b7e957388bed7c7674be8c17596245823200e478371dc7ff970458f46b',
  },
} as const
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

type AnchorName = keyof typeof EXPECTED_ANCHORS
type FoundingSigning = {
  id: string
  name: string
  role: CreativeRole
  termWeeks: number
}
type VerifiedSave = {
  bytes: string
  byteLength: number
  sha256: string
  saveVersion: 11
  importMode: 'native-v11'
  converted: false
}

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`scenery-load-in fixture invariant: ${message}`)
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

function foundOperationsStudio(): { state: GameState; signings: FoundingSigning[] } {
  let state = newGame(SEED)
  const cards = foundingApplicantCards(state)
  const signings: FoundingSigning[] = []

  for (const role of ROLE_ORDER) {
    const selected = cards
      .filter((card) => card.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])
    invariant(
      selected.length === FOUNDING_COUNTS[role],
      `${SEED} has ${String(selected.length)} founding ${role} applicants, expected ${String(FOUNDING_COUNTS[role])}`,
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
  invariant(state.operations.mode === 'managed', 'Studio Operations did not enter managed mode')
  invariant(state.scriptDevelopment.mode === 'legacy', 'Script Projects unexpectedly left legacy mode')
  invariant(state.castingSessions.mode === 'legacy', 'Casting Sessions unexpectedly left legacy mode')
  return { state, signings }
}

function advanceExactly(state: GameState, count: number): GameState {
  let next = state
  for (let index = 0; index < count; index++) next = advanceWeek(next).next
  return next
}

function verifyAnchor(state: GameState, name: AnchorName, requireRoundtrip = false): VerifiedSave {
  const bytes = exportSaveJson(state)
  const envelope = JSON.parse(bytes) as { saveVersion?: unknown; seed?: unknown }
  invariant(envelope.saveVersion === 11, `${name} exported SaveFileV${String(envelope.saveVersion)}`)
  invariant(envelope.seed === SEED, `${name} envelope seed is ${JSON.stringify(envelope.seed)}`)
  const byteLength = Buffer.byteLength(bytes, 'utf8')
  const hash = sha256(bytes)
  const expected = EXPECTED_ANCHORS[name]
  invariant(byteLength === expected.byteLength, `${name} is ${String(byteLength)} bytes, expected ${String(expected.byteLength)}`)
  invariant(hash === expected.sha256, `${name} sha256 ${hash}, expected ${expected.sha256}`)

  if (requireRoundtrip) {
    const imported = importSaveJson(bytes)
    invariant(imported.ok, `${name} native SaveFileV11 import was rejected${imported.ok ? '' : ` — ${imported.error}`}`)
    invariant(imported.converted === false, `${name} native SaveFileV11 was reported as converted`)
    invariant(exportSaveJson(imported.state) === bytes, `${name} native SaveFileV11 roundtrip changed bytes`)
  }

  return {
    bytes,
    byteLength,
    sha256: hash,
    saveVersion: 11,
    importMode: 'native-v11',
    converted: false,
  }
}

function exactCommand(
  state: GameState,
  expected: ProductionCommandView,
): ProductionCommandView {
  const decision = productionDecision(state)
  invariant(decision !== null, `missing ${expected.kind} production decision`)
  invariant(
    JSON.stringify(decision.command) === JSON.stringify(expected),
    `${expected.kind} command ${JSON.stringify(decision.command)}, expected ${JSON.stringify(expected)}`,
  )
  return decision.command
}

function assertProductionState(
  state: GameState,
  status: 'unassigned' | 'blocked' | 'ready' | 'scheduled',
): void {
  invariant(state.market.tick === 30, `${status} state is Week ${String(state.market.tick)}`)
  invariant(state.studio.cash === 11_160_898.29, `${status} cash is ${String(state.studio.cash)}`)
  invariant(
    state.rngState === '859994619,1336761036,2793876205,1849893007',
    `${status} RNG is ${state.rngState}`,
  )
  invariant(state.ledger.length === 62, `${status} ledger has ${String(state.ledger.length)} rows`)

  const production = state.studio.activeProductions.find((candidate) => candidate.id === PRODUCTION_ID)
  invariant(production !== undefined, `${status} state lacks production ${PRODUCTION_ID}`)
  invariant(production.conceptId === 'c-01', `${status} concept is ${production.conceptId}`)
  invariant(production.directorId === 't-dir-01', `${status} director is ${production.directorId}`)
  invariant(production.writerId === 't-wri-03', `${status} writer is ${production.writerId}`)
  invariant(
    JSON.stringify(production.cast) ===
      JSON.stringify({ lead: 't-act-13', antagonist: 't-act-04', support: 't-act-16' }),
    `${status} cast is ${JSON.stringify(production.cast)}`,
  )
  invariant(JSON.stringify(production.craftIds) === JSON.stringify(['t-cra-01']), `${status} craft ids changed`)
  invariant(production.budget.negative === 2_700_505.71, `${status} negative is ${String(production.budget.negative)}`)
  invariant(production.budget.marketing === 400_000, `${status} marketing is ${String(production.budget.marketing)}`)
  invariant(production.remainingTicks === 5, `${status} countdown is ${String(production.remainingTicks)}`)

  const workflow = state.operations.workflows.find((candidate) => candidate.productionId === PRODUCTION_ID)
  invariant(workflow !== undefined, `${status} state lacks workflow ${PRODUCTION_ID}`)
  invariant(workflow.phase === 'shooting', `${status} phase is ${workflow.phase}`)
  invariant(workflow.shootingTask !== null, `${status} state lacks shooting task`)
  invariant(workflow.shootingTask.id === TASK_ID, `${status} task is ${workflow.shootingTask.id}`)
  invariant(workflow.shootingTask.status === status, `${status} task is ${workflow.shootingTask.status}`)
  invariant(workflow.shootingTask.directorId === 't-dir-01', `${status} task director changed`)
  invariant(
    workflow.shootingTask.soundstageFacilityId === 'facility-soundstage-07',
    `${status} task soundstage is ${workflow.shootingTask.soundstageFacilityId}`,
  )
  invariant(
    workflow.reservations.every(
      (reservation) => reservation.productionId === PRODUCTION_ID && reservation.phase === 'shooting',
    ),
    `${status} reservation ownership changed`,
  )
  const reservationFacts = workflow.reservations.map(({ facilityId, capability, slot }) => ({
    facilityId,
    capability,
    slot,
  }))
  invariant(
    JSON.stringify(reservationFacts) ===
      JSON.stringify([
        { facilityId: 'facility-soundstage-07', capability: 'soundstage', slot: 0 },
        { facilityId: 'facility-scenery-shop', capability: 'set-scenery', slot: 0 },
      ]),
    `${status} reservations changed to ${JSON.stringify(reservationFacts)}`,
  )
  const expectedBlocker =
    status === 'blocked' ? { kind: 'scenery-load-in', taskId: TASK_ID } : null
  invariant(
    JSON.stringify(workflow.blocker) === JSON.stringify(expectedBlocker),
    `${status} workflow blocker is ${JSON.stringify(workflow.blocker)}`,
  )

  const operation = studioLotSnapshot(state).productionOperations?.find(
    (candidate) => candidate.productionId === PRODUCTION_ID,
  )
  invariant(operation !== undefined, `${status} state lacks lot operation ${PRODUCTION_ID}`)
  invariant(operation.title === 'Nights of Watchtower', `${status} title is ${operation.title}`)
  invariant(operation.locationBuildingId === 'stage-a', `${status} lot location is ${operation.locationBuildingId}`)
  invariant(operation.facilityLabel === 'Soundstage 7 + Scenery Shop', `${status} facility is ${operation.facilityLabel}`)
  invariant(operation.taskStatus === status, `${status} lot task is ${String(operation.taskStatus)}`)
  const expectedProjection = {
    unassigned: {
      statusLabel: 'Decision required',
      blockerKind: 'director-dispatch',
      commandKind: 'assignShootingDirector',
    },
    blocked: {
      statusLabel: 'Production hold',
      blockerKind: 'scenery-load-in',
      commandKind: 'clearSceneryLoadIn',
    },
    ready: {
      statusLabel: 'Decision required',
      blockerKind: 'take-scheduling',
      commandKind: 'scheduleShootingTake',
    },
    scheduled: {
      statusLabel: 'Take scheduled',
      blockerKind: null,
      commandKind: null,
    },
  } as const
  invariant(operation.statusLabel === expectedProjection[status].statusLabel, `${status} status label is ${operation.statusLabel}`)
  invariant(
    (operation.blocker?.kind ?? null) === expectedProjection[status].blockerKind,
    `${status} projected blocker is ${String(operation.blocker?.kind ?? null)}`,
  )
  invariant(
    (operation.currentCommand?.kind ?? null) === expectedProjection[status].commandKind,
    `${status} projected command is ${String(operation.currentCommand?.kind ?? null)}`,
  )
}

function writeVerified(path: string, verified: VerifiedSave): 'unchanged' | 'written' {
  const unchanged = existsSync(path) && readFileSync(path, 'utf8') === verified.bytes
  writeFileSync(path, verified.bytes, 'utf8')
  const disk = readFileSync(path, 'utf8')
  invariant(disk === verified.bytes, `disk verification changed ${path}`)
  invariant(Buffer.byteLength(disk, 'utf8') === verified.byteLength, `disk byte length changed ${path}`)
  invariant(sha256(disk) === verified.sha256, `disk hash changed ${path}`)
  const imported = importSaveJson(disk)
  invariant(imported.ok, `disk SaveFileV11 import rejected for ${path}${imported.ok ? '' : ` — ${imported.error}`}`)
  invariant(imported.converted === false, `disk SaveFileV11 was reported as converted for ${path}`)
  invariant(exportSaveJson(imported.state) === disk, `disk SaveFileV11 roundtrip changed ${path}`)
  return unchanged ? 'unchanged' : 'written'
}

const founded = foundOperationsStudio()
let state = advanceExactly(founded.state, 26)
invariant(state.market.tick === 26, `pre-greenlight state landed in Week ${String(state.market.tick)}`)

const estelle = freelancerMarketCards(state).find((card) => card.profile.id === 't-dir-01')
invariant(estelle !== undefined, 'Week-26 freelancer market lacks t-dir-01')
invariant(estelle.profile.name === 'Estelle Delgado', `t-dir-01 is ${estelle.profile.name}`)
const concept = state.concepts.find((candidate) => candidate.id === 'c-01')
invariant(concept !== undefined, 'world lacks concept c-01')
invariant(concept.title === 'Nights of Watchtower', `c-01 is ${concept.title}`)
const negative = requiredNegative(concept, SHAPE, state)
invariant(negative === 2_700_505.71, `required negative is ${String(negative)}`)

const filmPackage: DraftPackage = {
  conceptId: 'c-01',
  shape: SHAPE,
  promise: {
    genre: concept.genre,
    intendedSegments: ['adult'],
    ranges: PROMISE_RANGES,
  },
  writerId: 't-wri-03',
  directorId: 't-dir-01',
  cast: {
    lead: 't-act-13',
    antagonist: 't-act-04',
    support: 't-act-16',
  },
  craftIds: ['t-cra-01'],
  budget: { negative, marketing: 400_000 },
}
state = mustNext(greenlight(state, filmPackage), 'greenlight(Nights of Watchtower)')
state = advanceExactly(state, 4)

assertProductionState(state, 'unassigned')
const unassigned = verifyAnchor(state, 'unassigned', true)
const assignCommand = exactCommand(state, {
  kind: 'assignShootingDirector',
  productionId: PRODUCTION_ID,
  directorId: 't-dir-01',
  label: 'Call Estelle Delgado to Soundstage 7',
})
state = mustNext(runProductionCommand(state, assignCommand), assignCommand.kind)

assertProductionState(state, 'blocked')
const blocked = verifyAnchor(state, 'blocked', true)
const clearCommand = exactCommand(state, {
  kind: 'clearSceneryLoadIn',
  productionId: PRODUCTION_ID,
  label: 'Clear scenery load-in',
})
state = mustNext(runProductionCommand(state, clearCommand), clearCommand.kind)

assertProductionState(state, 'ready')
const ready = verifyAnchor(state, 'ready', true)
const expectedReadyEnvelope = JSON.parse(blocked.bytes) as {
  state: {
    operations: {
      workflows: Array<{
        productionId: string
        blocker: unknown
        shootingTask: { status: string } | null
      }>
    }
  }
}
const transitionedWorkflow = expectedReadyEnvelope.state.operations.workflows.find(
  (candidate) => candidate.productionId === PRODUCTION_ID,
)
invariant(transitionedWorkflow !== undefined, 'blocked envelope lacks the governed workflow')
invariant(transitionedWorkflow.shootingTask !== null, 'blocked envelope lacks the governed shooting task')
transitionedWorkflow.shootingTask.status = 'ready'
transitionedWorkflow.blocker = null
invariant(
  JSON.stringify(expectedReadyEnvelope) === JSON.stringify(JSON.parse(ready.bytes)),
  'blocked → ready changed serialized state beyond shootingTask.status and workflow.blocker',
)
const scheduleCommand = exactCommand(state, {
  kind: 'scheduleShootingTake',
  productionId: PRODUCTION_ID,
  label: 'Schedule the shooting take',
})
state = mustNext(runProductionCommand(state, scheduleCommand), scheduleCommand.kind)

assertProductionState(state, 'scheduled')
const scheduled = verifyAnchor(state, 'scheduled', true)

const here = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = join(here, '..')
const scheduledReferencePath = join(repositoryRoot, SCHEDULED_REFERENCE)
invariant(existsSync(scheduledReferencePath), `scheduled reference is absent at ${SCHEDULED_REFERENCE}`)
const scheduledReferenceBytes = readFileSync(scheduledReferencePath, 'utf8')
invariant(
  Buffer.byteLength(scheduledReferenceBytes, 'utf8') === EXPECTED_ANCHORS.scheduled.byteLength,
  'frozen scheduled reference byte length changed',
)
invariant(sha256(scheduledReferenceBytes) === EXPECTED_ANCHORS.scheduled.sha256, 'frozen scheduled reference hash changed')
invariant(scheduled.bytes === scheduledReferenceBytes, 'reconstructed scheduled state differs from frozen scheduled fixture')

const outputDirectory = join(repositoryRoot, OUTPUT_DIRECTORY)
mkdirSync(outputDirectory, { recursive: true })
const blockedFile = EXPECTED_FILES[1]
const readyFile = EXPECTED_FILES[2]
const blockedStatus = writeVerified(join(outputDirectory, blockedFile), blocked)
const readyStatus = writeVerified(join(outputDirectory, readyFile), ready)

const commonRecipe = [
  { action: 'newGame', seed: SEED },
  {
    action: 'signContract',
    selector: 'first N foundingApplicantCards in authoritative draft order for each role',
    roleOrder: ROLE_ORDER,
    counts: FOUNDING_COUNTS,
    termWeeks: TERM_WEEKS,
    resolvedSignings: founded.signings,
  },
  { action: 'foundStudio' },
  { action: 'activateStudioOperations' },
  { action: 'advanceWeek', count: 26, resultWeek: 26 },
  {
    action: 'selectAvailableFreelancer',
    market: 'freelancerMarketCards',
    week: 26,
    talent: person(state, 't-dir-01'),
  },
  {
    action: 'greenlight',
    package: {
      conceptId: 'c-01',
      conceptTitle: 'Nights of Watchtower',
      genre: concept.genre,
      shape: SHAPE,
      promise: { intendedSegments: ['adult'], ranges: PROMISE_RANGES },
      assignments: {
        writer: person(state, 't-wri-03'),
        director: person(state, 't-dir-01'),
        lead: person(state, 't-act-13'),
        antagonist: person(state, 't-act-04'),
        support: person(state, 't-act-16'),
        craft: person(state, 't-cra-01'),
      },
      budget: { negative, marketing: 400_000 },
    },
    resultWeek: 26,
  },
  { action: 'advanceWeek', count: 4, resultWeek: 30 },
] as const

const claimBase = {
  week: 30,
  cash: 11_160_898.29,
  rngState: '859994619,1336761036,2793876205,1849893007',
  ledgerRows: 62,
  productionId: PRODUCTION_ID,
  title: 'Nights of Watchtower',
  phase: 'shooting',
  taskId: TASK_ID,
  locationBuildingId: 'stage-a',
  authoritativeFacility: 'Soundstage 7 + Scenery Shop',
  directorId: 't-dir-01',
  directorName: 'Estelle Delgado',
  weeksRemaining: 5,
  reservations: [
    { facilityId: 'facility-soundstage-07', capability: 'soundstage', slot: 0 },
    { facilityId: 'facility-scenery-shop', capability: 'set-scenery', slot: 0 },
  ],
} as const

const manifest = `${JSON.stringify({
  schemaVersion: 'world-first-scenery-load-in-fixtures-v1',
  generatedBy: GENERATOR,
  reproduceCommand: 'node_modules/.bin/vite-node scripts/gen-world-first-scenery-load-in-fixtures.mts',
  outputDirectory: OUTPUT_DIRECTORY,
  authority: {
    stateConstruction: 'public Engine actions and UI adapter action boundaries only',
    serialization: 'exportSaveJson / importSaveJson live SaveFileV11 boundary',
    importMode: 'native SaveFileV11; converted === false',
    deterministic: true,
    generatedFilesAreHandEdited: false,
    unassignedAndScheduledAreInMemoryOnly: true,
  },
  commonFoundingRecipe: {
    applicantSelection: 'first N foundingApplicantCards in authoritative draft order for each role',
    roleOrder: ROLE_ORDER,
    counts: FOUNDING_COUNTS,
    termWeeks: TERM_WEEKS,
    managedSystemsActivated: ['Studio Operations'],
    systemsRetainedInLegacyMode: ['Script Projects', 'Casting Sessions'],
  },
  fixtures: [
    {
      id: 'week-30-nights-of-watchtower-stage-7-blocked',
      file: blockedFile,
      saveVersion: blocked.saveVersion,
      importMode: blocked.importMode,
      converted: blocked.converted,
      byteLength: blocked.byteLength,
      sha256: blocked.sha256,
      seed: SEED,
      claim: {
        ...claimBase,
        taskStatus: 'blocked',
        blocker: { kind: 'scenery-load-in', taskId: TASK_ID },
        projectedCommand: clearCommand,
      },
      publicActionDerivation: [
        ...commonRecipe,
        { action: 'runProductionCommand', command: assignCommand, consumesWeeks: 0 },
      ],
    },
    {
      id: 'week-30-nights-of-watchtower-stage-7-ready',
      file: readyFile,
      saveVersion: ready.saveVersion,
      importMode: ready.importMode,
      converted: ready.converted,
      byteLength: ready.byteLength,
      sha256: ready.sha256,
      seed: SEED,
      claim: {
        ...claimBase,
        taskStatus: 'ready',
        blocker: null,
        derivedDecisionBlocker: { kind: 'take-scheduling' },
        projectedCommand: scheduleCommand,
      },
      publicActionDerivation: [
        ...commonRecipe,
        { action: 'runProductionCommand', command: assignCommand, consumesWeeks: 0 },
        { action: 'runProductionCommand', command: clearCommand, consumesWeeks: 0 },
      ],
    },
  ],
  inMemoryProofAnchors: {
    unassigned: {
      saveVersion: unassigned.saveVersion,
      byteLength: unassigned.byteLength,
      sha256: unassigned.sha256,
      taskStatus: 'unassigned',
      projectedCommand: assignCommand,
      written: false,
    },
    scheduled: {
      saveVersion: scheduled.saveVersion,
      byteLength: scheduled.byteLength,
      sha256: scheduled.sha256,
      taskStatus: 'scheduled',
      comparedByteForByteTo: SCHEDULED_REFERENCE,
      written: false,
    },
  },
}, null, 2)}\n`

const manifestPath = join(outputDirectory, EXPECTED_FILES[0])
const manifestStatus = existsSync(manifestPath) && readFileSync(manifestPath, 'utf8') === manifest
  ? 'unchanged'
  : 'written'
writeFileSync(manifestPath, manifest, 'utf8')
invariant(readFileSync(manifestPath, 'utf8') === manifest, 'manifest disk verification changed bytes')
const actualFiles = readdirSync(outputDirectory).sort()
invariant(
  JSON.stringify(actualFiles) === JSON.stringify([...EXPECTED_FILES].sort()),
  `output directory contains ${JSON.stringify(actualFiles)}, expected exactly ${JSON.stringify([...EXPECTED_FILES].sort())}`,
)

// eslint-disable-next-line no-console
console.log(`${blockedStatus}: ${blockedFile} · ${String(blocked.byteLength)} bytes · sha256 ${blocked.sha256} · native V11 roundtrip`)
// eslint-disable-next-line no-console
console.log(`${readyStatus}: ${readyFile} · ${String(ready.byteLength)} bytes · sha256 ${ready.sha256} · native V11 roundtrip`)
// eslint-disable-next-line no-console
console.log(`${manifestStatus}: manifest.json · ${String(Buffer.byteLength(manifest, 'utf8'))} bytes · sha256 ${sha256(manifest)}`)
// eslint-disable-next-line no-console
console.log(`proved in memory: unassigned · ${String(unassigned.byteLength)} bytes · sha256 ${unassigned.sha256}`)
// eslint-disable-next-line no-console
console.log(`proved against frozen fixture: scheduled · ${String(scheduled.byteLength)} bytes · sha256 ${scheduled.sha256}`)
