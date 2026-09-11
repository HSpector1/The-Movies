// Bundle this entry against the exact accepted P12 worktree using
// build-performance-probes.mjs, then run the emitted bundle after the quiet window.
// This only wraps already-generated canonical V19 bytes in their ORIGINAL
// accepted runtime checkpoint. It never calls a gameplay action, tick or migration.
import { BridgeSession } from '../../bridge/session.ts'
import { PROTOCOL_VERSION, PROJECTION_VERSION, SCHEMA_ID } from '../../bridge/protocol.ts'
import { validateSaveV19, exportSave } from '../../src/core/save.ts'
import { readFileSync, writeFileSync, mkdirSync, existsSync, lstatSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ACCEPTED_HEAD = '592e926bfbf4574df94b38fc8dd594fc5df2ac8d'
const ACCEPTED_ROOT = '/Users/bruce/The Movies - P13A Accepted Baseline TS'
const ACCEPTED_BRANCH = 'wip/p13a-performance-baseline-01'
const SOURCE_SCHEMA = 'sha256:8b2569b1f925bedf214ee556841fe28b61e544f1f13bb4741c84a0a318e81a85'
const CONSUMER_SCHEMA = 'sha256:e64a3b659e4247b98631f1caa1f0e9eb0b6016aac92b0f46be590360ff9cee48'
const SOURCE_SAVE_SHA256 = '350d29eab350a5bd0ff06b3a363711f9437de7a7868b5e5abd0c01f79ba9e08f'
const SOURCE_SAVE_BYTES = 2_079_437
const sha = value => createHash('sha256').update(value).digest('hex')
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const [outputArgument, saveArgument] = process.argv.slice(2)
assert(outputArgument && saveArgument, 'Usage: accepted-v19-checkpoint.mjs OUTPUT_DIRECTORY ACCEPTED_WEEK_316_SAVE')
const outputDirectory = resolve(outputArgument)
const sourceSavePath = resolve(saveArgument)
const executablePath = fileURLToPath(import.meta.url)
const sourceBindingPath = resolve(dirname(executablePath), 'accepted-v19-checkpoint-binding.json')
const checkpointPath = resolve(outputDirectory, 'accepted-p12-week-316.checkpoint.json')
const manifestPath = resolve(outputDirectory, 'manifest.json')
assert(!existsSync(checkpointPath) && !existsSync(manifestPath), 'Incoming P12 evidence already exists; refusing to overwrite it')
const sourceBindingBytes = readFileSync(sourceBindingPath)
const binding = JSON.parse(sourceBindingBytes.toString('utf8'))
assert(binding.head === ACCEPTED_HEAD && resolve(binding.sourceRoot) === ACCEPTED_ROOT && binding.branch === ACCEPTED_BRANCH,
  'The emitted converter must bind the exact accepted P12 worktree and commit')
assert(binding.status === '', 'Accepted source must have been clean when the converter was emitted')
assert(binding.bundleSha256 === sha(readFileSync(executablePath)), 'The converter bytes differ from their emitted source binding')
assert(PROTOCOL_VERSION === 4 && PROJECTION_VERSION === 29 && SCHEMA_ID === SOURCE_SCHEMA,
  'Converter imports are not the accepted protocol4/projection29/schema8b2569 authority')
const sourceStat = lstatSync(sourceSavePath)
assert(sourceStat.isFile() && !sourceStat.isSymbolicLink() && sourceStat.size === SOURCE_SAVE_BYTES,
  'Expected the original generated week316 regular SaveV19 file')
const sourceSaveBytes = readFileSync(sourceSavePath)
assert(sha(sourceSaveBytes) === SOURCE_SAVE_SHA256, 'Original accepted week316 SaveV19 digest differs')
const sourceSaveJson = sourceSaveBytes.toString('utf8')
const save = validateSaveV19(JSON.parse(sourceSaveJson))
assert(save.saveVersion === 19 && save.state.market.tick === 316, 'Expected incoming SaveV19 at week316')
assert(exportSave(save) === sourceSaveJson, 'Original accepted SaveV19 is not canonical')
const state = save.state
assert(state.founding === null && state.economyEngagedEver === true && state.operations.mode === 'managed',
  'Incoming world must be an active economy-engaged studio, outside the founding draft')
assert(state.hollywood && state.hollywood.origin === 'fresh' && state.hollywood.businesses.length === 4,
  'Incoming world must retain its actual live Hollywood businesses')
assert(state.hollywood.identities.some(identity => identity.studioId === state.hollywood.playerStudioId && identity.enteredWeek !== null),
  'Incoming player studio must actually have entered Hollywood')
assert(state.studio.activeProductions.length === 1 && state.contracts.length >= 6,
  'Incoming checkpoint must retain its real staffed player film')
assert(!Object.hasOwn(state, 'technology') && !state.talent.some(person => person.role === 'scientist'),
  'Accepted source cannot contain P13 technology or a Scientist')

const session = BridgeSession.fromSaveJson(sourceSaveJson, 'p13a-incoming-accepted-p12-week-316')
const snapshot = session.snapshot()
assert(snapshot.gameWeek === 316 && snapshot.stateDigest === SOURCE_SAVE_SHA256 && snapshot.schemaId === SOURCE_SCHEMA && snapshot.snapshotVersion === 29,
  'Accepted bridge snapshot must preserve exact incoming authority and its old contract')
const exported = session.exportRuntimeCheckpointEncoded()
assert(exported.checkpoint.schemaId === SOURCE_SCHEMA && exported.checkpoint.protocolVersion === 4,
  'Original checkpoint must retain the accepted source schema')
assert(exported.checkpoint.currentSaveJson === sourceSaveJson && exported.checkpoint.savedSaveJson === sourceSaveJson &&
  exported.checkpoint.currentStateDigest === SOURCE_SAVE_SHA256 && exported.checkpoint.savedStateDigest === SOURCE_SAVE_SHA256,
  'Checkpoint wrapping changed original save bytes or digests')
assert(exported.checkpoint.stateRevision === 0 && exported.checkpoint.journal.length === 0,
  'Checkpoint conversion must not fabricate a gameplay command or revision')
assert(readFileSync(sourceSavePath).equals(sourceSaveBytes), 'Original accepted save changed during read-only conversion')

const manifest = {
  kind: 'p13a-generated-evidence/v1',
  source: 'live engine generated fixture; no user campaign input',
  scenario: 'incoming-accepted-v19', seed: save.seed, week: 316,
  checkpoint: checkpointPath, sha256: sha(exported.encoded), bytes: Buffer.byteLength(exported.encoded),
  // The native preview driver uses this existing field for CONSUMER admission.
  // It must not be mistaken for the schema embedded in the incoming checkpoint.
  schemaId: CONSUMER_SCHEMA,
  schemaIdMeaning: 'Expected current native consumer contract; incoming checkpoint retains sourceCheckpointSchema below.',
  currentConsumerSchema: CONSUMER_SCHEMA, currentConsumerProtocolVersion: 4, currentConsumerProjectionVersion: 30,
  sourceCheckpointSchema: SOURCE_SCHEMA, sourceCheckpointProtocolVersion: 4, sourceCheckpointProjectionVersion: 29,
  sourceCheckpointVersion: exported.checkpoint.checkpointVersion,
  sourceSaveVersion: 19, sourceSavePath, sourceSaveSha256: SOURCE_SAVE_SHA256, sourceSaveBytes: SOURCE_SAVE_BYTES,
  sourceStateDigest: SOURCE_SAVE_SHA256, sourceWeek: 316,
  sourceProduct: {head: ACCEPTED_HEAD, branch: ACCEPTED_BRANCH, worktree: ACCEPTED_ROOT},
  converterBinding: {path: sourceBindingPath, sha256: sha(sourceBindingBytes), bundleSha256: binding.bundleSha256,
    harnessSourceSha256: binding.harnessSourceSha256, inputFiles: binding.inputs.length},
  existingFacts: {worldId: state.hollywood.worldId, playerStudioId: state.hollywood.playerStudioId,
    hollywoodBusinesses: state.hollywood.businesses.length, hollywoodFilms: state.hollywood.films.length,
    talent: state.talent.length, activePlayerProductions: state.studio.activeProductions.map(production => production.id),
    contracts: state.contracts.length, cash: state.studio.cash},
  assertions: {acceptedSourceSnapshotPassed: true, exactOriginalSaveBytes: true, exactOriginalSaveDigest: true,
    noGameplayActionOrTick: true, noMigrationPerformedByConverter: true, originalFileUnchanged: true},
  consumerRecovery: {status: 'not executed by this converter', expectedSaveVersion: 20,
    expectedEmptyTechnologyRecordingStartedWeek: 316,
    qualification: 'Current native runtime must perform the governed incoming-V19 recovery. Its migrated digest must be recorded separately; additive V20 leaves change it.'},
}
mkdirSync(outputDirectory, {recursive: true})
writeFileSync(checkpointPath, exported.encoded, {flag: 'wx'})
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', {flag: 'wx'})
console.log(JSON.stringify(manifest, null, 2))
