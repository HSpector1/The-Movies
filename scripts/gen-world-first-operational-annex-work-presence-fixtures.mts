// World-First Operational Annex Work Presence V1 — native SaveFileV13 authority.
//
// Run from the repository root:
//   node_modules/.bin/vite-node scripts/gen-world-first-operational-annex-work-presence-fixtures.mts
//
// All saves are built only through public Engine/adapter actions. Available is
// the exact Week-13 completed Annex. Script Working adds three public screenplay
// commissions. Production Working uses the ordinary two-picture sequence. In
// both cases deterministic allocation places the claimed work in the Annex.

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  advanceWeek,
  commissionScriptAction,
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  greenlightScriptProject,
  importSaveJson,
  newGame,
  runScriptProjectAction,
  signContractAction,
  startDevelopmentCastingAnnexAction,
  studioCalendarBoard,
  studioLotSnapshot,
  scriptProjectsBoard,
} from '../ui/src/engine/adapter.ts'
import type {
  CommissionScriptPayload,
  CreativeRole,
  DraftPackage,
  GameState,
  SegmentId,
} from '../ui/src/engine/adapter.ts'
import { operationalAnnexWorkContext } from '../ui/src/lot/snapshot/annexWork.ts'
import type { LotAnnexWorkOccupant } from '../ui/src/lot/snapshot/annexWork.ts'

const GENERATOR = 'scripts/gen-world-first-operational-annex-work-presence-fixtures.mts'
const OUTPUT_DIRECTORY = 'ui/e2e/world-first-operational-annex-work-presence-v1'
const SEED = 'world-first-operational-annex-work'
const TERM_WEEKS = 104
const ANNEX_FACILITY_ID = 'facility-development-casting-annex'
const ROLE_ORDER = ['actor', 'director', 'writer', 'craft'] as const satisfies readonly CreativeRole[]
const FOUNDING_COUNTS: Readonly<Record<CreativeRole, number>> = {
  actor: 3,
  director: 1,
  writer: 3,
  craft: 1,
}
const PRODUCTION_FOUNDING_COUNTS: Readonly<Record<CreativeRole, number>> = {
  actor: 6,
  director: 2,
  writer: 3,
  craft: 2,
}
const EXPECTED_FILES = [
  'manifest.json',
  'week-13-operational-annex-available.save.json',
  'week-13-operational-annex-script-working.save.json',
  'week-14-operational-annex-production-development-working.save.json',
] as const

type FoundingSigning = {
  id: string
  name: string
  role: CreativeRole
  termWeeks: number
}

type Fixture = {
  id: string
  file: (typeof EXPECTED_FILES)[1 | 2 | 3]
  state: GameState
  claim: Record<string, unknown>
  publicActionDerivation: readonly Record<string, unknown>[]
}

type VerifiedSave = {
  bytes: string
  byteLength: number
  sha256: string
}

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`operational Annex fixture invariant: ${message}`)
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

function advanceExactly(state: GameState, count: number): GameState {
  let next = state
  for (let index = 0; index < count; index++) next = advanceWeek(next).next
  return next
}

function scriptPayload(
  state: GameState,
  conceptIndex: number,
  writerId: string,
): CommissionScriptPayload {
  const concept = state.concepts[conceptIndex]
  invariant(concept !== undefined, `missing concept at index ${String(conceptIndex)}`)
  return {
    conceptId: concept.id,
    writerId,
    shape: {
      opening: conceptIndex % 2 === 0 ? 'slowSetup' : 'mysteryHook',
      midpoint: conceptIndex % 2 === 0 ? 'revelation' : 'escalation',
      ending: conceptIndex % 2 === 0 ? 'bittersweet' : 'ambiguous',
    },
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

function foundOperationalStudio(
  counts: Readonly<Record<CreativeRole, number>> = FOUNDING_COUNTS,
): {
  state: GameState
  signings: FoundingSigning[]
  commonRecipe: Record<string, unknown>[]
} {
  let state = newGame(SEED)
  const cards = foundingApplicantCards(state)
  const signings: FoundingSigning[] = []

  for (const role of ROLE_ORDER) {
    const selected = cards
      .filter((card) => card.profile.role === role)
      .slice(0, counts[role])
    invariant(
      selected.length === counts[role],
      `${SEED} has ${String(selected.length)} founding ${role} applicants, expected ${String(counts[role])}`,
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

  state = mustNext(foundManagedStudioAction(state), 'foundManagedStudio')
  state = mustNext(
    startDevelopmentCastingAnnexAction(state),
    'startDevelopmentCastingAnnex',
  )
  state = advanceExactly(state, 13)

  invariant(state.market.tick === 13, `operational state landed in Week ${String(state.market.tick)}`)
  // Placement Core V12: the Annex is a placed facility on the legacy parcel.
  invariant(state.placement.facilities[0]?.status === 'operational', 'Annex did not complete')
  invariant(state.placement.facilities[0]?.completesWeek === 13, 'Annex did not complete in Week 13')

  return {
    state,
    signings,
    commonRecipe: [
      { action: 'newGame', seed: SEED },
      {
        action: 'signContract',
        selector: 'first N foundingApplicantCards in authoritative draft order for each role',
        roleOrder: ROLE_ORDER,
        counts,
        termWeeks: TERM_WEEKS,
        resolvedSignings: signings,
      },
      {
        action: 'foundManagedStudio',
        managedSystemsActivated: [
          'Studio Operations',
          'Script Projects',
          'Casting Sessions',
        ],
      },
      { action: 'startDevelopmentCastingAnnex', resultWeek: 0 },
      { action: 'advanceWeek', count: 13, resultWeek: 13 },
    ],
  }
}

function exactAnnexClaim(state: GameState): {
  capacity: 1
  occupied: 0 | 1
  available: 0 | 1
  slot: 0
  occupant: LotAnnexWorkOccupant | null
} {
  const calendar = studioCalendarBoard(state)
  const rows = calendar.facilities.filter(
    (facility) => facility.facilityId === ANNEX_FACILITY_ID,
  )
  invariant(rows.length === 1, `Calendar has ${String(rows.length)} exact Annex rows`)
  const row = rows[0]!
  invariant(row.facilityName === 'Development & Casting Annex', `Annex name is ${row.facilityName}`)
  invariant(row.capability === 'development-casting', `Annex capability is ${row.capability}`)
  invariant(row.capacity === 1, `Annex capacity is ${String(row.capacity)}`)
  invariant(row.slots.length === 1 && row.slots[0]?.slot === 0, 'Annex does not expose exact slot 0')

  const snapshot = studioLotSnapshot(state)
  const context = operationalAnnexWorkContext(snapshot)
  invariant(context !== null, 'Lot rejected the exact operational Annex projection')
  invariant(snapshot.annexWork !== null, 'Lot omitted operational Annex work')
  invariant(snapshot.annexWork.facilityId === ANNEX_FACILITY_ID, 'Lot projected the wrong Annex id')
  invariant(snapshot.annexWork.occupied === row.occupied, 'Lot occupied count disagrees with Calendar')
  invariant(snapshot.annexWork.available === row.available, 'Lot available count disagrees with Calendar')
  const calendarOccupant = row.slots[0]!.occupant
  if (calendarOccupant === null) {
    invariant(snapshot.annexWork.occupant === null, 'Lot invented an Annex occupant')
  } else {
    invariant(snapshot.annexWork.occupant !== null, 'Lot omitted the Calendar Annex occupant')
    invariant(
      snapshot.annexWork.occupant.owner === calendarOccupant.owner
        && snapshot.annexWork.occupant.ownerId === calendarOccupant.ownerId
        && snapshot.annexWork.occupant.title === calendarOccupant.title
        && snapshot.annexWork.occupant.activity === calendarOccupant.activity,
      'Lot Annex occupant disagrees with the exact Calendar row',
    )
  }

  return {
    capacity: 1,
    occupied: snapshot.annexWork.occupied,
    available: snapshot.annexWork.available,
    slot: 0,
    occupant: snapshot.annexWork.occupant,
  }
}

function rosterIds(state: GameState, role: CreativeRole): string[] {
  const contracted = new Set(state.contracts.map((contract) => contract.talentId))
  return state.talent
    .filter((talent) => talent.role === role && contracted.has(talent.id))
    .map((talent) => talent.id)
}

function acceptReadyScript(state: GameState, projectId: string): GameState {
  const action = scriptProjectsBoard(state).sections.needsReview
    .find((card) => card.projectId === projectId)
    ?.legalActions.find((candidate) => candidate.kind === 'acceptScript')
  invariant(action !== undefined, `${projectId} has no public acceptScript action`)
  return mustNext(runScriptProjectAction(state, action), `acceptScript(${projectId})`)
}

function readyPackage(state: GameState, projectId: string, rosterSlot: 0 | 1): DraftPackage {
  const ready = scriptProjectsBoard(state).packages.find(
    (candidate) => candidate.projectId === projectId,
  )
  invariant(ready !== undefined, `${projectId} is not publicly package-ready`)
  const concept = state.concepts.find((candidate) => candidate.id === ready.concept.id)
  invariant(concept !== undefined, `${projectId} references a missing concept`)
  const actors = rosterIds(state, 'actor')
  const actorStart = rosterSlot * 3
  return {
    conceptId: ready.concept.id,
    shape: ready.lockedShape,
    promise: ready.lockedPromise,
    writerId: ready.writer.id,
    directorId: rosterIds(state, 'director')[rosterSlot]!,
    craftIds: [rosterIds(state, 'craft')[rosterSlot]!],
    cast: {
      lead: actors[actorStart]!,
      antagonist: actors[actorStart + 1]!,
      support: actors[actorStart + 2]!,
    },
    budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
  }
}

function buildFixtures(): Fixture[] {
  const founded = foundOperationalStudio()
  const availableState = founded.state
  const available = exactAnnexClaim(availableState)
  invariant(available.occupied === 0, 'Available fixture is occupied')
  invariant(available.available === 1, 'Available fixture has no available slot')
  invariant(available.occupant === null, 'Available fixture has an occupant')

  let workingState = availableState
  const writers = workingState.contracts
    .map((contract) => workingState.talent.find((talent) => talent.id === contract.talentId)!)
    .filter((talent) => talent.role === 'writer')
  invariant(writers.length >= 3, `working fixture has ${String(writers.length)} contracted writers`)

  const commissions: Record<string, unknown>[] = []
  for (let index = 0; index < 3; index++) {
    const project = scriptPayload(workingState, index, writers[index]!.id)
    workingState = mustNext(
      commissionScriptAction(workingState, project),
      `commissionScript(${project.conceptId})`,
    )
    commissions.push({
      action: 'commissionScript',
      actionIndex: index,
      conceptId: project.conceptId,
      conceptTitle: workingState.concepts.find((concept) => concept.id === project.conceptId)!.title,
      writerId: project.writerId,
      resultProjectId: workingState.scriptDevelopment.projects.at(-1)!.id,
    })
  }

  const working = exactAnnexClaim(workingState)
  invariant(working.occupied === 1, 'Working fixture is not occupied')
  invariant(working.available === 0, 'Working fixture still reports an available slot')
  invariant(working.occupant !== null, 'Working fixture has no occupant')
  invariant(working.occupant.owner === 'script', `Working owner is ${working.occupant.owner}`)
  invariant(working.occupant.activity === 'drafting', `Working activity is ${working.occupant.activity}`)
  invariant(working.occupant.workState === 'working', `Working state is ${working.occupant.workState}`)
  invariant(working.occupant.statusLabel === null, 'Script fixture invented a production status')
  invariant(working.occupant.blocker === null, 'Script fixture invented a blocker')

  const productionFounded = foundOperationalStudio(PRODUCTION_FOUNDING_COUNTS)
  let productionState = productionFounded.state
  const productionWriters = rosterIds(productionState, 'writer')
  invariant(productionWriters.length >= 3, 'Production fixture needs three writers')
  for (let index = 0; index < 2; index++) {
    productionState = mustNext(
      commissionScriptAction(
        productionState,
        scriptPayload(productionState, index, productionWriters[index]!),
      ),
      `commissionScript(${String(index)}) for production fixture`,
    )
  }
  productionState = advanceExactly(productionState, 1)
  productionState = acceptReadyScript(productionState, 'script-0000')
  productionState = acceptReadyScript(productionState, 'script-0001')
  productionState = mustNext(
    greenlightScriptProject(
      productionState,
      'script-0000',
      readyPackage(productionState, 'script-0000', 0),
    ),
    'greenlightScriptProject(script-0000)',
  )
  const baseProductionId = productionState.studio.activeProductions.at(-1)?.id
  invariant(baseProductionId !== undefined, 'First greenlight created no production')
  productionState = mustNext(
    commissionScriptAction(
      productionState,
      scriptPayload(productionState, 2, productionWriters[2]!),
    ),
    'commissionScript(script-0002) for production allocation',
  )
  productionState = mustNext(
    greenlightScriptProject(
      productionState,
      'script-0001',
      readyPackage(productionState, 'script-0001', 1),
    ),
    'greenlightScriptProject(script-0001)',
  )
  const annexProductionId = productionState.studio.activeProductions.at(-1)?.id
  invariant(annexProductionId !== undefined, 'Second greenlight created no production')
  const productionWorking = exactAnnexClaim(productionState)
  invariant(productionState.market.tick === 14, 'Production fixture did not land in Week 14')
  invariant(productionWorking.occupied === 1, 'Production fixture is not occupied')
  invariant(productionWorking.occupant !== null, 'Production fixture has no occupant')
  invariant(
    productionWorking.occupant.owner === 'production',
    `Production fixture owner is ${productionWorking.occupant.owner}`,
  )
  invariant(
    productionWorking.occupant.activity === 'development',
    `Production fixture activity is ${productionWorking.occupant.activity}`,
  )
  invariant(productionWorking.occupant.workState === 'working', 'Production fixture is not Working')
  invariant(productionWorking.occupant.statusLabel === 'On schedule', 'Production status is not On schedule')
  invariant(productionWorking.occupant.blocker === null, 'Production fixture invented a blocker')

  return [
    {
      id: 'week-13-operational-annex-available',
      file: EXPECTED_FILES[1],
      state: availableState,
      claim: {
        week: 13,
        constructionStatus: 'operational',
        completedWeek: 13,
        annex: available,
        contextState: 'available',
      },
      publicActionDerivation: founded.commonRecipe,
    },
    {
      id: 'week-13-operational-annex-script-working',
      file: EXPECTED_FILES[2],
      state: workingState,
      claim: {
        week: 13,
        constructionStatus: 'operational',
        completedWeek: 13,
        annex: working,
        contextState: 'working',
      },
      publicActionDerivation: [...founded.commonRecipe, ...commissions],
    },
    {
      id: 'week-14-operational-annex-production-development-working',
      file: EXPECTED_FILES[3],
      state: productionState,
      claim: {
        week: 14,
        constructionStatus: 'operational',
        completedWeek: 13,
        annex: productionWorking,
        contextState: 'working',
      },
      publicActionDerivation: [
        ...productionFounded.commonRecipe,
        { action: 'commissionScript', projectIds: ['script-0000', 'script-0001'] },
        { action: 'advanceWeek', count: 1, resultWeek: 14 },
        { action: 'acceptScript', projectIds: ['script-0000', 'script-0001'] },
        { action: 'greenlightScriptProject', projectId: 'script-0000', resultProductionId: baseProductionId },
        { action: 'commissionScript', projectId: 'script-0002', allocationPurpose: 'occupy base slot 1' },
        { action: 'greenlightScriptProject', projectId: 'script-0001', resultProductionId: annexProductionId },
      ],
    },
  ]
}

function verifiedSave(state: GameState): VerifiedSave {
  const bytes = exportSaveJson(state)
  const envelope = JSON.parse(bytes) as { saveVersion?: unknown; seed?: unknown }
  invariant(envelope.saveVersion === 13, `exported SaveFileV${String(envelope.saveVersion)}`)
  invariant(envelope.seed === SEED, `envelope seed is ${JSON.stringify(envelope.seed)}`)
  const first = importSaveJson(bytes)
  invariant(first.ok, `native SaveFileV13 import rejected${first.ok ? '' : ` — ${first.error}`}`)
  invariant(first.converted === false, 'native SaveFileV13 was reported as converted')
  const firstReplay = exportSaveJson(first.state)
  invariant(firstReplay === bytes, 'first SaveFileV13 import/export replay changed bytes')
  const second = importSaveJson(firstReplay)
  invariant(second.ok, `replayed SaveFileV13 import rejected${second.ok ? '' : ` — ${second.error}`}`)
  invariant(second.converted === false, 'replayed SaveFileV13 was reported as converted')
  invariant(exportSaveJson(second.state) === bytes, 'second SaveFileV13 replay changed bytes')
  return {
    bytes,
    byteLength: Buffer.byteLength(bytes, 'utf8'),
    sha256: sha256(bytes),
  }
}

function writeVerified(path: string, verified: VerifiedSave): 'unchanged' | 'written' {
  const unchanged = existsSync(path) && readFileSync(path, 'utf8') === verified.bytes
  writeFileSync(path, verified.bytes, 'utf8')
  const disk = readFileSync(path, 'utf8')
  invariant(disk === verified.bytes, `disk bytes changed for ${path}`)
  invariant(Buffer.byteLength(disk, 'utf8') === verified.byteLength, `disk length changed for ${path}`)
  invariant(sha256(disk) === verified.sha256, `disk hash changed for ${path}`)
  const imported = importSaveJson(disk)
  invariant(imported.ok, `disk SaveFileV13 import rejected${imported.ok ? '' : ` — ${imported.error}`}`)
  invariant(imported.converted === false, 'disk SaveFileV13 was reported as converted')
  invariant(exportSaveJson(imported.state) === disk, `disk SaveFileV13 replay changed ${path}`)
  return unchanged ? 'unchanged' : 'written'
}

function writeExact(path: string, bytes: string): 'unchanged' | 'written' {
  const unchanged = existsSync(path) && readFileSync(path, 'utf8') === bytes
  writeFileSync(path, bytes, 'utf8')
  const disk = readFileSync(path, 'utf8')
  invariant(disk === bytes, `disk bytes changed for ${path}`)
  invariant(sha256(disk) === sha256(bytes), `disk hash changed for ${path}`)
  return unchanged ? 'unchanged' : 'written'
}

const firstBuild = buildFixtures()
const replayBuild = buildFixtures()
for (let index = 0; index < firstBuild.length; index++) {
  invariant(
    exportSaveJson(firstBuild[index]!.state) === exportSaveJson(replayBuild[index]!.state),
    `${firstBuild[index]!.id} public-action reconstruction is not deterministic`,
  )
}

const here = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = join(here, '..')
const outputDirectory = join(repositoryRoot, OUTPUT_DIRECTORY)
mkdirSync(outputDirectory, { recursive: true })

const manifestFixtures = firstBuild.map((fixture) => {
  const verified = verifiedSave(fixture.state)
  const status = writeVerified(join(outputDirectory, fixture.file), verified)
  // eslint-disable-next-line no-console
  console.log(
    `${status}: ${fixture.file} · ${String(verified.byteLength)} bytes · sha256 ${verified.sha256}`,
  )
  return {
    id: fixture.id,
    file: fixture.file,
    saveVersion: 13,
    importMode: 'native-v13',
    converted: false,
    byteLength: verified.byteLength,
    sha256: verified.sha256,
    seed: SEED,
    claim: fixture.claim,
    publicActionDerivation: fixture.publicActionDerivation,
  }
})

const manifest = `${JSON.stringify({
  schemaVersion: 'world-first-operational-annex-work-presence-fixtures-v1',
  generatedBy: GENERATOR,
  reproduceCommand:
    'node_modules/.bin/vite-node scripts/gen-world-first-operational-annex-work-presence-fixtures.mts',
  outputDirectory: OUTPUT_DIRECTORY,
  authority: {
    stateConstruction: 'public Engine and UI adapter actions only',
    construction: 'exact Week-13 authoritative Development & Casting Annex completion',
    allocation: 'ordinary deterministic shared development-casting allocation',
    serialization: 'exportSaveJson / importSaveJson native SaveFileV13 boundary',
    importMode: 'native SaveFileV13; converted === false',
    deterministic: true,
    generatedFilesAreHandEdited: false,
    configuredHeldSave: false,
  },
  fixtures: manifestFixtures,
}, null, 2)}\n`
const manifestByteLength = Buffer.byteLength(manifest, 'utf8')
const manifestHash = sha256(manifest)
const manifestStatus = writeExact(join(outputDirectory, 'manifest.json'), manifest)
invariant(
  readdirSync(outputDirectory).sort().join('\n') === [...EXPECTED_FILES].sort().join('\n'),
  'output directory contains an unexpected file set',
)
// eslint-disable-next-line no-console
console.log(
  `${manifestStatus}: manifest.json · ${String(manifestByteLength)} bytes · sha256 ${manifestHash}`,
)
