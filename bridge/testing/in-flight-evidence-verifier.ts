import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { TextDecoder } from 'node:util'

import {
  DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,
  decodeBridgeRuntimeCheckpoint,
  type HydratedBridgeRuntimeJournalEntry,
} from '../runtime-checkpoint.ts'
import { canonicalJson } from '../schema/canonical.ts'

const reportFileName = 'bridge-inflight-recovery-proof.json'
const checkpointRelativePath = path.join('runtime', 'bridge-runtime-v1.json')
const logsDirectoryName = 'logs'
const postCommitPrefix = '[bridge:test] post-commit '
const replayPrefix = '[bridge:test] replay '
const markerStem = '[bridge:test]'
const routes = ['command', 'save', 'load'] as const
const maxReportBytes = 1024 * 1024
const maxLogBytes = 8 * 1024 * 1024
const maxLogFiles = 64
const sha256Pattern = /^[0-9a-f]{64}$/
const commandIdPattern = /^[\x20-\x7e]{1,256}$/
const noncePattern = /^[A-Za-z0-9_-]{1,64}$/

type Route = typeof routes[number]

type PostCommitMarker = {
  action: 'hold'
  commandId: string
  committedSessionId: string
  committedStateDigest: string
  committedStateRevision: number
  event: 'post-commit-response'
  nonce: string
  requestUtf8Sha256: string
  responseJsonSha256: string
  route: Route
  version: 1
}

type ReplayMarker = {
  commandId: string
  event: 'post-commit-replay'
  requestUtf8Sha256: string
  responseJsonSha256: string
  route: Route
  version: 1
}

type RecoveredPost = {
  route: `/${Route}`
  commandId: string
  requestSha256: string
  responseSha256: string
  revisionBefore: number
  revisionAfter: number
  digestBefore: string
  digestAfter: string
}

type ProofReport = {
  runtimeInstanceId: string
  initialRuntimeInstanceId: string
  sessionId: string
  openingClassification: 'raw-founding'
  openingRevision: 0
  openingWeek: 0
  openingDigest: string
  automationPreludeApplied: false
  automationPreludeAcceptedIntentCount: 0
  automationPreludeRevisionStart: 0
  automationPreludeRevisionEnd: 0
  automationFoundingSigningCount: 0
  automationFoundStudioCount: 0
  automationFoundingAccountingPassed: false
  automationPreludeAcceptedIntents: readonly []
  finalRevision: number
  finalWeek: number
  finalDigest: string
  savedDigest: string
  restoredDigest: string
  inFlightInitialSessionId: string
  inFlightInitialRevision: number
  inFlightInitialDigest: string
  inFlightExpectedFinalRevision: number
  inFlightRuntimeReplacements: number
  inFlightTransportOutages: number
  inFlightRetryCount: number
  inFlightRecoveredCount: number
  recoveredPosts: readonly RecoveredPost[]
}

export type BridgeInFlightEvidenceValidation = {
  event: 'bridge-inflight-evidence-verified'
  finalStateDigest: string
  finalStateRevision: number
  journalEntries: 3
  postCommitMarkers: 3
  recoveredPosts: readonly {
    commandId: string
    requestSha256: string
    responseSha256: string
    route: Route
  }[]
  replayMarkers: 3
  sessionId: string
  version: 1
}

export class BridgeInFlightEvidenceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BridgeInFlightEvidenceError'
  }
}

function fail(message: string): never {
  throw new BridgeInFlightEvidenceError(message)
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(`${label} must be a JSON object.`)
  }
  return value as Record<string, unknown>
}

function requireExactKeys(
  record: Record<string, unknown>,
  expected: readonly string[],
  label: string,
): void {
  if (Object.keys(record).sort().join('\0') !== [...expected].sort().join('\0')) {
    fail(`${label} must use its exact closed schema.`)
  }
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) fail(`${label} must be a non-empty string.`)
  return value
}

function requireBoolean(value: unknown, expected: boolean, label: string): void {
  if (value !== expected) fail(`${label} must be ${String(expected)}.`)
}

function requireInteger(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    fail(`${label} must be a non-negative safe integer.`)
  }
  return value as number
}

function requireSha256(value: unknown, label: string): string {
  if (typeof value !== 'string' || !sha256Pattern.test(value)) {
    fail(`${label} must be a lowercase SHA-256 digest.`)
  }
  return value
}

function requireCommandId(value: unknown, label: string): string {
  if (typeof value !== 'string' || !commandIdPattern.test(value)) {
    fail(`${label} must be a printable command identity from 1 to 256 bytes.`)
  }
  return value
}

function requireRoute(value: unknown, label: string): Route {
  if (value !== 'command' && value !== 'save' && value !== 'load') {
    fail(`${label} must be command, save, or load.`)
  }
  return value
}

function requireDirectory(directoryPath: string, label: string): void {
  let stat: fs.Stats
  try {
    stat = fs.lstatSync(directoryPath)
  } catch {
    fail(`${label} is missing or unreadable.`)
  }
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    fail(`${label} must be a real directory, not a link.`)
  }
}

function readBoundedUtf8(filePath: string, maxBytes: number, label: string): string {
  let stat: fs.Stats
  try {
    stat = fs.lstatSync(filePath)
  } catch {
    fail(`${label} is missing or unreadable.`)
  }
  if (stat.isSymbolicLink() || !stat.isFile()) {
    fail(`${label} must be a regular file, not a link.`)
  }
  if (stat.size > maxBytes) fail(`${label} exceeds its byte limit.`)

  let bytes: Buffer
  try {
    bytes = fs.readFileSync(filePath)
  } catch {
    fail(`${label} could not be read.`)
  }
  if (bytes.length !== stat.size || bytes.length > maxBytes) {
    fail(`${label} changed while it was read or exceeds its byte limit.`)
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    fail(`${label} must contain valid UTF-8.`)
  }
}

function parseJson(text: string, label: string): unknown {
  try {
    return JSON.parse(text) as unknown
  } catch {
    fail(`${label} must contain valid JSON.`)
  }
}

function parsePostCommitMarker(record: Record<string, unknown>, label: string): PostCommitMarker {
  requireExactKeys(record, [
    'action',
    'commandId',
    'committedSessionId',
    'committedStateDigest',
    'committedStateRevision',
    'event',
    'nonce',
    'requestUtf8Sha256',
    'responseJsonSha256',
    'route',
    'version',
  ], label)
  if (record['action'] !== 'hold') fail(`${label}.action must be hold.`)
  if (record['event'] !== 'post-commit-response') {
    fail(`${label}.event must be post-commit-response.`)
  }
  if (record['version'] !== 1) fail(`${label}.version must be 1.`)
  if (typeof record['nonce'] !== 'string' || !noncePattern.test(record['nonce'])) {
    fail(`${label}.nonce is invalid.`)
  }
  return {
    action: 'hold',
    commandId: requireCommandId(record['commandId'], `${label}.commandId`),
    committedSessionId: requireString(record['committedSessionId'], `${label}.committedSessionId`),
    committedStateDigest: requireSha256(
      record['committedStateDigest'],
      `${label}.committedStateDigest`,
    ),
    committedStateRevision: requireInteger(
      record['committedStateRevision'],
      `${label}.committedStateRevision`,
    ),
    event: 'post-commit-response',
    nonce: record['nonce'],
    requestUtf8Sha256: requireSha256(
      record['requestUtf8Sha256'],
      `${label}.requestUtf8Sha256`,
    ),
    responseJsonSha256: requireSha256(
      record['responseJsonSha256'],
      `${label}.responseJsonSha256`,
    ),
    route: requireRoute(record['route'], `${label}.route`),
    version: 1,
  }
}

function parseReplayMarker(record: Record<string, unknown>, label: string): ReplayMarker {
  requireExactKeys(record, [
    'commandId',
    'event',
    'requestUtf8Sha256',
    'responseJsonSha256',
    'route',
    'version',
  ], label)
  if (record['event'] !== 'post-commit-replay') fail(`${label}.event must be post-commit-replay.`)
  if (record['version'] !== 1) fail(`${label}.version must be 1.`)
  return {
    commandId: requireCommandId(record['commandId'], `${label}.commandId`),
    event: 'post-commit-replay',
    requestUtf8Sha256: requireSha256(
      record['requestUtf8Sha256'],
      `${label}.requestUtf8Sha256`,
    ),
    responseJsonSha256: requireSha256(
      record['responseJsonSha256'],
      `${label}.responseJsonSha256`,
    ),
    route: requireRoute(record['route'], `${label}.route`),
    version: 1,
  }
}

function parseMarkers(logsDirectory: string): {
  postCommit: PostCommitMarker[]
  replay: ReplayMarker[]
} {
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(logsDirectory, { withFileTypes: true })
  } catch {
    fail('Evidence logs directory is unreadable.')
  }
  if (entries.length === 0 || entries.length > maxLogFiles) {
    fail(`Evidence logs directory must contain from 1 to ${String(maxLogFiles)} files.`)
  }

  const postCommit: PostCommitMarker[] = []
  const replay: ReplayMarker[] = []
  const topology: string[] = []
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name, 'en'))) {
    if (!entry.isFile() || entry.isSymbolicLink()) {
      fail('Evidence logs directory may contain only regular files.')
    }
    const text = readBoundedUtf8(
      path.join(logsDirectory, entry.name),
      maxLogBytes,
      `Evidence log ${entry.name}`,
    )
    const lines = text.split('\n')
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index] ?? ''
      const terminated = index < lines.length - 1
      if (!line.includes(markerStem)) continue
      const label = `Evidence marker ${entry.name}:${String(index + 1)}`
      if (!terminated) fail(`${label} is not newline-complete.`)

      let encoded: string
      let kind: 'post-commit' | 'replay'
      if (line.startsWith(postCommitPrefix)) {
        encoded = line.slice(postCommitPrefix.length)
        kind = 'post-commit'
      } else if (line.startsWith(replayPrefix)) {
        encoded = line.slice(replayPrefix.length)
        kind = 'replay'
      } else {
        fail(`${label} uses an unsupported test marker prefix.`)
      }
      const value = parseJson(encoded, label)
      if (canonicalJson(value) !== encoded) fail(`${label} must use canonical JSON.`)
      const record = asRecord(value, label)
      if (kind === 'post-commit') {
        const marker = parsePostCommitMarker(record, label)
        postCommit.push(marker)
        topology.push(`${entry.name}:post-commit:${marker.route}`)
      } else {
        const marker = parseReplayMarker(record, label)
        replay.push(marker)
        topology.push(`${entry.name}:replay:${marker.route}`)
      }
    }
  }
  if (postCommit.length !== routes.length) {
    fail('Evidence must contain exactly three post-commit markers.')
  }
  if (replay.length !== routes.length) {
    fail('Evidence must contain exactly three replay markers.')
  }
  const expectedTopology = [
    'bridge-1-command-hold.log:post-commit:command',
    'bridge-2-save-hold.log:replay:command',
    'bridge-2-save-hold.log:post-commit:save',
    'bridge-3-load-hold.log:replay:save',
    'bridge-3-load-hold.log:post-commit:load',
    'bridge-4-final-replay.log:replay:load',
  ]
  if (topology.join('\0') !== expectedTopology.join('\0')) {
    fail('Evidence markers do not prove the exact command/save/load restart topology.')
  }
  if (new Set(postCommit.map((marker) => marker.nonce)).size !== routes.length) {
    fail('Post-commit marker nonces must be unique.')
  }
  return { postCommit, replay }
}

function parseRecoveredPost(value: unknown, label: string): RecoveredPost {
  const record = asRecord(value, label)
  requireExactKeys(record, [
    'commandId',
    'digestAfter',
    'digestBefore',
    'requestSha256',
    'responseSha256',
    'revisionAfter',
    'revisionBefore',
    'route',
  ], label)
  const routeValue = requireString(record['route'], `${label}.route`)
  if (routeValue !== '/command' && routeValue !== '/save' && routeValue !== '/load') {
    fail(`${label}.route must be /command, /save, or /load.`)
  }
  return {
    route: routeValue,
    commandId: requireCommandId(record['commandId'], `${label}.commandId`),
    requestSha256: requireSha256(record['requestSha256'], `${label}.requestSha256`),
    responseSha256: requireSha256(record['responseSha256'], `${label}.responseSha256`),
    revisionBefore: requireInteger(record['revisionBefore'], `${label}.revisionBefore`),
    revisionAfter: requireInteger(record['revisionAfter'], `${label}.revisionAfter`),
    digestBefore: requireSha256(record['digestBefore'], `${label}.digestBefore`),
    digestAfter: requireSha256(record['digestAfter'], `${label}.digestAfter`),
  }
}

function parseProofReport(text: string): ProofReport {
  const record = asRecord(parseJson(text, 'Unity proof report'), 'Unity proof report')
  if (record['schemaVersion'] !== 7) fail('Unity proof report.schemaVersion must be 7.')
  if (record['status'] !== 'complete') fail('Unity proof report.status must be complete.')
  if (record['failure'] !== '') fail('Unity proof report.failure must be empty.')
  if (record['openingClassification'] !== 'raw-founding') {
    fail('Unity proof report.openingClassification must be raw-founding.')
  }
  const openingRevision = requireInteger(
    record['openingRevision'],
    'Unity proof report.openingRevision',
  )
  const openingWeek = requireInteger(record['openingWeek'], 'Unity proof report.openingWeek')
  if (openingRevision !== 0 || openingWeek !== 0) {
    fail('Unity proof report opening revision and week must both be 0.')
  }
  const openingDigest = requireSha256(
    record['openingDigest'],
    'Unity proof report.openingDigest',
  )
  requireBoolean(
    record['automationPreludeApplied'],
    false,
    'Unity proof report.automationPreludeApplied',
  )
  const automationPreludeAcceptedIntentCount = requireInteger(
    record['automationPreludeAcceptedIntentCount'],
    'Unity proof report.automationPreludeAcceptedIntentCount',
  )
  const automationPreludeRevisionStart = requireInteger(
    record['automationPreludeRevisionStart'],
    'Unity proof report.automationPreludeRevisionStart',
  )
  const automationPreludeRevisionEnd = requireInteger(
    record['automationPreludeRevisionEnd'],
    'Unity proof report.automationPreludeRevisionEnd',
  )
  if (automationPreludeAcceptedIntentCount !== 0 ||
      automationPreludeRevisionStart !== openingRevision ||
      automationPreludeRevisionEnd !== openingRevision ||
      record['automationFoundingSigningCount'] !== 0 ||
      record['automationFoundStudioCount'] !== 0 ||
      record['automationFoundingAccountingPassed'] !== false ||
      !Array.isArray(record['automationPreludeAcceptedIntents']) ||
      record['automationPreludeAcceptedIntents'].length !== 0) {
    fail('Unity in-flight proof report must expose an empty, zero-width automation prelude.')
  }
  requireBoolean(
    record['inFlightRecoveryComplete'],
    true,
    'Unity proof report.inFlightRecoveryComplete',
  )
  for (const field of [
    'engineOutageObserved',
    'actionsDisabledDuringOutage',
    'lastProjectionRetainedDuringOutage',
    'engineRestartDetected',
    'authorityStableAcrossRestart',
  ] as const) {
    requireBoolean(record[field], true, `Unity proof report.${field}`)
  }
  if (record['tornReadCount'] !== 0) fail('Unity proof report.tornReadCount must be 0.')

  if (!Array.isArray(record['recoveredPosts']) || record['recoveredPosts'].length !== routes.length) {
    fail('Unity proof report.recoveredPosts must contain exactly three entries.')
  }
  const recoveredPosts = record['recoveredPosts'].map((entry, index) =>
    parseRecoveredPost(entry, `Unity proof report.recoveredPosts[${String(index)}]`))
  if (new Set(recoveredPosts.map((post) => post.route)).size !== recoveredPosts.length) {
    fail('Unity recovered posts duplicates route command.')
  }
  if (new Set(recoveredPosts.map((post) => post.commandId)).size !== recoveredPosts.length) {
    fail('Unity recovered posts duplicates a command identity.')
  }
  if (recoveredPosts.map((post) => post.route).join('\0') !== '/command\0/save\0/load') {
    fail('Unity proof report.recoveredPosts must use command/save/load order.')
  }

  const report: ProofReport = {
    runtimeInstanceId: requireString(
      record['runtimeInstanceId'],
      'Unity proof report.runtimeInstanceId',
    ),
    initialRuntimeInstanceId: requireString(
      record['initialRuntimeInstanceId'],
      'Unity proof report.initialRuntimeInstanceId',
    ),
    sessionId: requireString(record['sessionId'], 'Unity proof report.sessionId'),
    openingClassification: 'raw-founding',
    openingRevision: 0,
    openingWeek: 0,
    openingDigest,
    automationPreludeApplied: false,
    automationPreludeAcceptedIntentCount: 0,
    automationPreludeRevisionStart: 0,
    automationPreludeRevisionEnd: 0,
    automationFoundingSigningCount: 0,
    automationFoundStudioCount: 0,
    automationFoundingAccountingPassed: false,
    automationPreludeAcceptedIntents: [],
    finalRevision: requireInteger(record['finalRevision'], 'Unity proof report.finalRevision'),
    finalWeek: requireInteger(record['finalWeek'], 'Unity proof report.finalWeek'),
    finalDigest: requireSha256(record['finalDigest'], 'Unity proof report.finalDigest'),
    savedDigest: requireSha256(record['savedDigest'], 'Unity proof report.savedDigest'),
    restoredDigest: requireSha256(record['restoredDigest'], 'Unity proof report.restoredDigest'),
    inFlightInitialSessionId: requireString(
      record['inFlightInitialSessionId'],
      'Unity proof report.inFlightInitialSessionId',
    ),
    inFlightInitialRevision: requireInteger(
      record['inFlightInitialRevision'],
      'Unity proof report.inFlightInitialRevision',
    ),
    inFlightInitialDigest: requireSha256(
      record['inFlightInitialDigest'],
      'Unity proof report.inFlightInitialDigest',
    ),
    inFlightExpectedFinalRevision: requireInteger(
      record['inFlightExpectedFinalRevision'],
      'Unity proof report.inFlightExpectedFinalRevision',
    ),
    inFlightRuntimeReplacements: requireInteger(
      record['inFlightRuntimeReplacements'],
      'Unity proof report.inFlightRuntimeReplacements',
    ),
    inFlightTransportOutages: requireInteger(
      record['inFlightTransportOutages'],
      'Unity proof report.inFlightTransportOutages',
    ),
    inFlightRetryCount: requireInteger(
      record['inFlightRetryCount'],
      'Unity proof report.inFlightRetryCount',
    ),
    inFlightRecoveredCount: requireInteger(
      record['inFlightRecoveredCount'],
      'Unity proof report.inFlightRecoveredCount',
    ),
    recoveredPosts,
  }

  if (report.sessionId !== report.inFlightInitialSessionId) {
    fail('Unity proof report changed logical session identity.')
  }
  if (report.openingRevision !== report.inFlightInitialRevision ||
      report.openingDigest !== report.inFlightInitialDigest) {
    fail('Unity proof report raw founding opening does not match initial in-flight authority.')
  }
  if (report.runtimeInstanceId === report.initialRuntimeInstanceId) {
    fail('Unity proof report did not change process-scoped runtime identity.')
  }
  if (report.inFlightExpectedFinalRevision !== report.inFlightInitialRevision + 2 ||
      report.finalRevision !== report.inFlightExpectedFinalRevision) {
    fail('Unity proof report final revision does not prove one command and one load transition.')
  }
  if (report.finalDigest !== report.savedDigest || report.finalDigest !== report.restoredDigest) {
    fail('Unity proof report final, saved, and restored digests must match exactly.')
  }
  if (report.inFlightRuntimeReplacements !== 3 || report.inFlightTransportOutages < 3 ||
      report.inFlightRetryCount !== 3 || report.inFlightRecoveredCount !== 3) {
    fail('Unity proof report in-flight recovery counts are incomplete.')
  }
  return report
}

function indexExactlyOneByRoute<Value extends { route: Route }>(
  values: readonly Value[],
  label: string,
): ReadonlyMap<Route, Value> {
  const result = new Map<Route, Value>()
  const commandIds = new Set<string>()
  for (const value of values) {
    const commandId = (value as Value & { commandId?: string }).commandId
    if (result.has(value.route)) fail(`${label} duplicates route ${value.route}.`)
    if (commandId !== undefined && commandIds.has(commandId)) {
      fail(`${label} duplicates a command identity.`)
    }
    result.set(value.route, value)
    if (commandId !== undefined) commandIds.add(commandId)
  }
  for (const route of routes) {
    if (!result.has(route)) fail(`${label} is missing route ${route}.`)
  }
  return result
}

function sha256Utf8(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

function requireAcceptedJournalEntry(
  entry: HydratedBridgeRuntimeJournalEntry,
  route: Route,
  commandId: string,
): void {
  if (entry.route !== route || entry.commandId !== commandId) {
    fail(`Checkpoint journal identity does not match recovered ${route}.`)
  }
  if (!entry.response.accepted) fail(`Checkpoint journal ${route} response was not accepted.`)
}

export function verifyBridgeInFlightEvidence(
  evidenceRoot: string,
): BridgeInFlightEvidenceValidation {
  const root = path.resolve(evidenceRoot)
  requireDirectory(root, 'Evidence root')
  const logsDirectory = path.join(root, logsDirectoryName)
  requireDirectory(logsDirectory, 'Evidence logs directory')
  const runtimeDirectory = path.join(root, 'runtime')
  requireDirectory(runtimeDirectory, 'Evidence runtime directory')

  const reportText = readBoundedUtf8(
    path.join(root, reportFileName),
    maxReportBytes,
    'Unity proof report',
  )
  const checkpointText = readBoundedUtf8(
    path.join(root, checkpointRelativePath),
    DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS.maxCheckpointBytes,
    'Bridge runtime checkpoint',
  )
  const report = parseProofReport(reportText)
  const checkpoint = decodeBridgeRuntimeCheckpoint(checkpointText)
  const markers = parseMarkers(logsDirectory)

  if (checkpoint.checkpoint.journal.length !== routes.length) {
    fail('Bridge runtime checkpoint must contain exactly three journal entries.')
  }
  if (checkpoint.checkpoint.journal.map((entry) => entry.route).join('\0') !== routes.join('\0')) {
    fail('Bridge runtime checkpoint journal must use command/save/load order.')
  }
  if (checkpoint.checkpoint.sessionId !== report.sessionId ||
      checkpoint.checkpoint.stateRevision !== report.finalRevision ||
      checkpoint.checkpoint.currentStateDigest !== report.finalDigest ||
      checkpoint.checkpoint.savedStateDigest !== report.savedDigest) {
    fail('Bridge runtime checkpoint final authority does not match the Unity proof report.')
  }
  if (checkpoint.currentSave.state.market.tick !== report.finalWeek) {
    fail('Bridge runtime checkpoint final week does not match the Unity proof report.')
  }
  if (checkpoint.currentSave.state.founding === null ||
      checkpoint.currentSave.state.contracts.length !== 1) {
    fail('Bridge runtime checkpoint must retain raw founding with exactly one recovered signing.')
  }

  const recoveredSigning = checkpoint.journal[0]
  if (recoveredSigning === undefined || recoveredSigning.route !== 'command' ||
      !recoveredSigning.response.accepted ||
      recoveredSigning.response.availableIntents.length === 0 ||
      recoveredSigning.response.availableIntents.some(
        (intent) => intent.kind !== 'signFoundingContract',
      ) ||
      recoveredSigning.response.snapshot.journeyNotices.firstFilmJourney.stage !== 'no-picture' ||
      recoveredSigning.response.snapshot.journeyNotices.firstFilmJourney.beat !== 'no-picture' ||
      recoveredSigning.response.snapshot.journeyNotices.firstFilmJourney.blocked === null) {
    fail('Recovered command is not the exact first raw-founding signing transition.')
  }

  const postCommitByRoute = indexExactlyOneByRoute(markers.postCommit, 'Post-commit markers')
  const replayByRoute = indexExactlyOneByRoute(markers.replay, 'Replay markers')
  const recoveredByRoute = indexExactlyOneByRoute(
    report.recoveredPosts.map((post) => ({ ...post, route: post.route.slice(1) as Route })),
    'Unity recovered posts',
  )
  const journalByRoute = indexExactlyOneByRoute(checkpoint.journal, 'Checkpoint journal')

  const verifiedPosts: BridgeInFlightEvidenceValidation['recoveredPosts'][number][] = []
  for (const route of routes) {
    const committed = postCommitByRoute.get(route)
    const replay = replayByRoute.get(route)
    const recovered = recoveredByRoute.get(route)
    const journal = journalByRoute.get(route)
    if (committed === undefined || replay === undefined ||
        recovered === undefined || journal === undefined) {
      fail(`Recovered ${route} evidence is incomplete.`)
    }
    requireAcceptedJournalEntry(journal, route, committed.commandId)

    const responseSha256 = sha256Utf8(journal.responseJson)
    if (committed.commandId !== replay.commandId || committed.commandId !== recovered.commandId ||
        committed.requestUtf8Sha256 !== replay.requestUtf8Sha256 ||
        committed.requestUtf8Sha256 !== recovered.requestSha256 ||
        committed.responseJsonSha256 !== replay.responseJsonSha256 ||
        committed.responseJsonSha256 !== recovered.responseSha256 ||
        committed.requestUtf8Sha256 !== sha256Utf8(journal.requestJson) ||
        committed.responseJsonSha256 !== responseSha256) {
      fail(`Recovered ${route} wire identity or exact byte digest does not match.`)
    }
    if (committed.committedSessionId !== report.sessionId ||
        journal.response.sessionId !== report.sessionId ||
        journal.response.stateRevision !== committed.committedStateRevision ||
        journal.response.stateDigest !== committed.committedStateDigest ||
        journal.response.gameWeek !== report.finalWeek) {
      fail(`Recovered ${route} committed authority does not match its journal response.`)
    }

    const expectedRevisionBefore = route === 'command'
      ? report.inFlightInitialRevision
      : report.inFlightInitialRevision + 1
    const expectedRevisionAfter = route === 'load'
      ? report.inFlightInitialRevision + 2
      : report.inFlightInitialRevision + 1
    const expectedDigestBefore = route === 'command'
      ? report.inFlightInitialDigest
      : report.finalDigest
    if (recovered.revisionBefore !== expectedRevisionBefore ||
        recovered.revisionAfter !== expectedRevisionAfter ||
        recovered.digestBefore !== expectedDigestBefore ||
        recovered.digestAfter !== report.finalDigest ||
        committed.committedStateRevision !== expectedRevisionAfter ||
        committed.committedStateDigest !== report.finalDigest ||
        journal.request.expectedStateRevision !== expectedRevisionBefore) {
      fail(`Recovered ${route} revision or digest chain is inconsistent.`)
    }
    if (route === 'command' && recovered.digestBefore === recovered.digestAfter) {
      fail('Recovered command did not change authoritative state digest.')
    }

    verifiedPosts.push({
      commandId: committed.commandId,
      requestSha256: committed.requestUtf8Sha256,
      responseSha256: committed.responseJsonSha256,
      route,
    })
  }

  return {
    event: 'bridge-inflight-evidence-verified',
    finalStateDigest: report.finalDigest,
    finalStateRevision: report.finalRevision,
    journalEntries: 3,
    postCommitMarkers: 3,
    recoveredPosts: verifiedPosts,
    replayMarkers: 3,
    sessionId: report.sessionId,
    version: 1,
  }
}
