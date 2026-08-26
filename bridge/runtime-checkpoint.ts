import { createHash, randomUUID } from 'node:crypto'

import {
  exportSave,
  importSave,
  type SaveFileV15,
} from '../src/core/index.js'
import {
  BRIDGE_SCHEMA,
  PROTOCOL_VERSION,
  SCHEMA_ID,
} from './protocol.ts'
import { canonicalJson } from './schema/canonical.ts'
import type {
  BridgeAcceptedCommandResponse,
  BridgeAcceptedSaveResponse,
  BridgeControlEnvelope,
  BridgeRejectedResponse,
  BridgeSubmitIntentCommand,
} from './schema/bridge-schema.ts'
import { parseWireValue } from './schema/runtime.ts'

export const BRIDGE_RUNTIME_CHECKPOINT_FORMAT = 'project-studio-bridge-runtime-checkpoint' as const
export const BRIDGE_RUNTIME_CHECKPOINT_VERSION = 1 as const
export const LEGACY_BRIDGE_RUNTIME_PROTOCOL_VERSION = 3 as const
export const LEGACY_BRIDGE_RUNTIME_SCHEMA_ID =
  'sha256:3e812c30081ae8c9af3999e8907246c040957dfffedcbcf9909a19c1eeb317ac' as const
// P03A: the one carry-forward slot moves to the outgoing v8 identity. A v8
// runtime dir migrates with the documented cost (journal discarded, revision
// reset, fresh sessionId, both save slots preserved); v7 dirs now fail closed.
export const PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID =
  'sha256:0285e92f32c27cd2960df802b3f7ea156a15372f05001ad1f4964c2f25db55b5' as const

export const DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS = Object.freeze({
  maxCheckpointBytes: 32 * 1024 * 1024,
  maxJournalEntries: 512,
  maxJournalBytes: 16 * 1024 * 1024,
})

/** Session-facing short name; the longer export remains for format-specific call sites. */
export const DEFAULT_BRIDGE_RUNTIME_LIMITS = DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS

export type BridgeRuntimeCheckpointLimits = {
  maxCheckpointBytes: number
  maxJournalEntries: number
  maxJournalBytes: number
}

export type BridgeRuntimeLimits = BridgeRuntimeCheckpointLimits

export type BridgeRuntimeJournalRoute = 'command' | 'save' | 'load'

export type BridgeRuntimeJournalEntryV1 = {
  route: BridgeRuntimeJournalRoute
  commandId: string
  requestJson: string
  responseJson: string
}

export type BridgeRuntimeJournalEntry = BridgeRuntimeJournalEntryV1

export type BridgeRuntimeCheckpointV1 = {
  format: typeof BRIDGE_RUNTIME_CHECKPOINT_FORMAT
  checkpointVersion: typeof BRIDGE_RUNTIME_CHECKPOINT_VERSION
  protocolVersion: typeof PROTOCOL_VERSION
  schemaId: typeof SCHEMA_ID
  sessionId: string
  stateRevision: number
  currentSaveJson: string
  currentStateDigest: string
  savedSaveJson: string | null
  savedStateDigest: string | null
  journalDigest: string
  journal: readonly BridgeRuntimeJournalEntryV1[]
}

export type BridgeRuntimeJournalResponse =
  | BridgeAcceptedCommandResponse
  | BridgeAcceptedSaveResponse
  | BridgeRejectedResponse

type HydratedEntryBase = BridgeRuntimeJournalEntryV1 & {
  response: BridgeRuntimeJournalResponse
}

export type HydratedBridgeRuntimeJournalEntry =
  | HydratedEntryBase & {
      route: 'command'
      request: BridgeSubmitIntentCommand
      response: BridgeAcceptedCommandResponse | BridgeRejectedResponse
    }
  | HydratedEntryBase & {
      route: 'save'
      request: BridgeControlEnvelope
      response: BridgeAcceptedSaveResponse | BridgeRejectedResponse
    }
  | HydratedEntryBase & {
      route: 'load'
      request: BridgeControlEnvelope
      response: BridgeAcceptedCommandResponse | BridgeRejectedResponse
    }

export type HydratedBridgeRuntimeCheckpoint = {
  checkpoint: BridgeRuntimeCheckpointV1
  currentSave: SaveFileV15
  savedSave: SaveFileV15 | null
  journal: readonly HydratedBridgeRuntimeJournalEntry[]
  checkpointBytes: number
  journalBytes: number
}

export type LoadedBridgeRuntimeCheckpoint = {
  hydrated: HydratedBridgeRuntimeCheckpoint
  migratedFromProtocolVersion:
    | typeof LEGACY_BRIDGE_RUNTIME_PROTOCOL_VERSION
    | typeof PROTOCOL_VERSION
    | null
}

export type CreateBridgeRuntimeCheckpointInput = {
  sessionId: string
  stateRevision: number
  currentSaveJson: string
  savedSaveJson: string | null
  journal: readonly BridgeRuntimeJournalEntryV1[]
}

export class BridgeRuntimeCheckpointError extends Error {
  constructor(
    readonly checkpointPath: string,
    message: string,
  ) {
    super(`${checkpointPath}: ${message}`)
    this.name = 'BridgeRuntimeCheckpointError'
  }
}

export class BridgeRuntimeCheckpointCapacityError extends BridgeRuntimeCheckpointError {
  constructor(checkpointPath: string, message: string) {
    super(checkpointPath, message)
    this.name = 'BridgeRuntimeCheckpointCapacityError'
  }
}

/** The next entry fits an empty journal, so a logical-session rollover can recover safely. */
export class BridgeRuntimeCheckpointHistoryFullError extends BridgeRuntimeCheckpointCapacityError {
  constructor(readonly capacityCause: BridgeRuntimeCheckpointCapacityError) {
    super(
      capacityCause.checkpointPath,
      'the existing replay journal reached its bound; logical-session rollover is required',
    )
    this.name = 'BridgeRuntimeCheckpointHistoryFullError'
  }
}

const CHECKPOINT_KEYS = [
  'format',
  'checkpointVersion',
  'protocolVersion',
  'schemaId',
  'sessionId',
  'stateRevision',
  'currentSaveJson',
  'currentStateDigest',
  'savedSaveJson',
  'savedStateDigest',
  'journalDigest',
  'journal',
] as const

const JOURNAL_ENTRY_KEYS = [
  'route',
  'commandId',
  'requestJson',
  'responseJson',
] as const

const DIGEST_PATTERN = /^[0-9a-f]{64}$/

function fail(path: string, message: string): never {
  throw new BridgeRuntimeCheckpointError(path, message)
}

function capacityFail(path: string, message: string): never {
  throw new BridgeRuntimeCheckpointCapacityError(path, message)
}

function exactRecord(
  value: unknown,
  path: string,
  expectedKeys: readonly string[],
): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return fail(path, 'must be a plain object')
  }
  const prototype = Object.getPrototypeOf(value)
  if (prototype !== Object.prototype && prototype !== null) {
    return fail(path, 'must be a plain object')
  }
  if (Object.getOwnPropertySymbols(value).length > 0) {
    return fail(path, 'must not contain symbol properties')
  }
  const record = value as Record<string, unknown>
  const actualKeys = Object.getOwnPropertyNames(record)
  for (const key of expectedKeys) {
    if (!Object.prototype.hasOwnProperty.call(record, key)) {
      fail(path, `is missing required field ${JSON.stringify(key)}`)
    }
  }
  const allowed = new Set(expectedKeys)
  const unknown = actualKeys.find((key) => !allowed.has(key))
  if (unknown !== undefined) {
    fail(path, `has unknown field ${JSON.stringify(unknown)}`)
  }
  return record
}

function requireString(value: unknown, path: string, allowEmpty = false): string {
  if (typeof value !== 'string' || (!allowEmpty && value.length === 0)) {
    return fail(path, `must be ${allowEmpty ? 'a' : 'a non-empty'} string`)
  }
  return value
}

function requireRevision(value: unknown, path: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0 || (value as number) > 2_147_483_647) {
    return fail(path, 'must be an integer from 0 through 2147483647')
  }
  return value as number
}

function requireDigest(value: unknown, path: string): string {
  const digest = requireString(value, path)
  if (!DIGEST_PATTERN.test(digest)) {
    fail(path, 'must be a lowercase SHA-256 digest')
  }
  return digest
}

function requireNullableString(value: unknown, path: string): string | null {
  if (value === null) return null
  return requireString(value, path)
}

function digest(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

function validateLimits(limits: BridgeRuntimeCheckpointLimits): BridgeRuntimeCheckpointLimits {
  const positive = (value: number, name: string): number => {
    if (!Number.isSafeInteger(value) || value < 1) {
      fail(`limits.${name}`, 'must be a positive safe integer')
    }
    return value
  }
  const nonNegative = (value: number, name: string): number => {
    if (!Number.isSafeInteger(value) || value < 0) {
      fail(`limits.${name}`, 'must be a non-negative safe integer')
    }
    return value
  }
  return {
    maxCheckpointBytes: positive(limits.maxCheckpointBytes, 'maxCheckpointBytes'),
    maxJournalEntries: nonNegative(limits.maxJournalEntries, 'maxJournalEntries'),
    maxJournalBytes: nonNegative(limits.maxJournalBytes, 'maxJournalBytes'),
  }
}

function parseCanonicalJson(json: string, path: string): unknown {
  let parsed: unknown
  try {
    parsed = JSON.parse(json) as unknown
  } catch (error) {
    fail(path, `is not valid JSON: ${(error as Error).message}`)
  }
  if (canonicalJson(parsed) !== json) {
    fail(path, 'must use canonical JSON with no leading or trailing whitespace')
  }
  return parsed
}

function validateCanonicalV15(
  saveJson: string,
  path: string,
  cache: Map<string, SaveFileV15>,
): SaveFileV15 {
  const cached = cache.get(saveJson)
  if (cached !== undefined) return cached
  let imported
  try {
    imported = importSave(saveJson)
  } catch (error) {
    fail(path, `is not a valid TypeScript save: ${(error as Error).message}`)
  }
  if (imported.saveVersion !== 15) {
    fail(path, `must be a current V15 save, received V${String(imported.saveVersion)}`)
  }
  if (exportSave(imported) !== saveJson) {
    fail(path, 'must preserve the canonical V15 save bytes exactly')
  }
  const current = imported as SaveFileV15
  cache.set(saveJson, current)
  return current
}

function parseRequest(
  route: BridgeRuntimeJournalRoute,
  json: string,
  path: string,
): BridgeSubmitIntentCommand | BridgeControlEnvelope {
  const parsed = parseCanonicalJson(json, path)
  try {
    return route === 'command'
      ? parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeIntentRequest, parsed)
      : parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeControlRequest, parsed)
  } catch (error) {
    fail(path, `does not match the ${route} request contract: ${(error as Error).message}`)
  }
}

function parseResponse(
  route: BridgeRuntimeJournalRoute,
  json: string,
  path: string,
): BridgeRuntimeJournalResponse {
  const parsed = parseCanonicalJson(json, path)
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return fail(path, 'must be a bridge response object')
  }
  const accepted = (parsed as Record<string, unknown>)['accepted']
  try {
    if (accepted === false) {
      return parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeRejectedResponse, parsed)
    }
    if (accepted !== true) {
      return fail(`${path}.accepted`, 'must be true or false')
    }
    return route === 'save'
      ? parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSaveResponse, parsed)
      : parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeAcceptedCommandResponse, parsed)
  } catch (error) {
    if (error instanceof BridgeRuntimeCheckpointError) throw error
    fail(path, `does not match the ${route} response contract: ${(error as Error).message}`)
  }
}

function requireRoute(value: unknown, path: string): BridgeRuntimeJournalRoute {
  if (value === 'command' || value === 'save' || value === 'load') return value
  return fail(path, 'must be command, save, or load')
}

function hydrateEntry(
  value: unknown,
  index: number,
  sessionId: string,
  stateRevision: number,
  saveCache: Map<string, SaveFileV15>,
): HydratedBridgeRuntimeJournalEntry {
  const path = `checkpoint.journal[${String(index)}]`
  const record = exactRecord(value, path, JOURNAL_ENTRY_KEYS)
  const route = requireRoute(record['route'], `${path}.route`)
  const commandId = requireString(record['commandId'], `${path}.commandId`)
  const requestJson = requireString(record['requestJson'], `${path}.requestJson`)
  const responseJson = requireString(record['responseJson'], `${path}.responseJson`)
  const request = parseRequest(route, requestJson, `${path}.requestJson`)
  const response = parseResponse(route, responseJson, `${path}.responseJson`)

  if (request.commandId !== commandId) {
    fail(path, 'commandId does not match the canonical request')
  }
  if (request.sessionId !== sessionId) {
    fail(path, 'request sessionId does not match the checkpoint session')
  }
  if (request.schemaId !== SCHEMA_ID) {
    fail(path, 'request schemaId does not match the checkpoint schema')
  }
  if (response.commandId !== commandId) {
    fail(path, 'response commandId does not match the journal identity')
  }
  if (response.sessionId !== sessionId) {
    fail(path, 'response sessionId does not match the checkpoint session')
  }
  if (response.schemaId !== SCHEMA_ID) {
    fail(path, 'response schemaId does not match the checkpoint schema')
  }
  if (response.stateRevision > stateRevision) {
    fail(path, 'response revision is newer than the checkpoint state')
  }
  requireDigest(response.stateDigest, `${path}.responseJson.stateDigest`)

  if (response.accepted) {
    const expectedRevision = route === 'save'
      ? request.expectedStateRevision
      : request.expectedStateRevision + 1
    if (response.stateRevision !== expectedRevision) {
      fail(path, `accepted ${route} response revision does not match its request`)
    }
    if (route === 'save') {
      const acceptedSave = response as BridgeAcceptedSaveResponse
      validateCanonicalV15(acceptedSave.saveJson, `${path}.responseJson.saveJson`, saveCache)
      if (digest(acceptedSave.saveJson) !== acceptedSave.stateDigest) {
        fail(path, 'accepted save response digest does not match its V15 bytes')
      }
    }
  } else {
    const allowedReasons = route === 'command'
      ? ['STALE_REVISION', 'INTENT_NOT_AVAILABLE', 'ENGINE_REJECTED']
      : route === 'save'
        ? ['STALE_REVISION']
        : ['STALE_REVISION', 'NO_SAVE', 'SAVE_REJECTED']
    if (!allowedReasons.includes(response.reasonCode)) {
      fail(path, `${response.reasonCode} is not a journalable ${route} rejection`)
    }
    if (
      response.reasonCode === 'STALE_REVISION' &&
      response.stateRevision === request.expectedStateRevision
    ) {
      fail(path, 'STALE_REVISION must identify a different authoritative revision')
    }
    if (
      response.reasonCode !== 'STALE_REVISION' &&
      response.stateRevision !== request.expectedStateRevision
    ) {
      fail(path, `${response.reasonCode} must preserve the expected authoritative revision`)
    }
  }

  const base = { route, commandId, requestJson, responseJson, request, response }
  if (route === 'command') {
    return base as HydratedBridgeRuntimeJournalEntry & { route: 'command' }
  }
  if (route === 'save') {
    return base as HydratedBridgeRuntimeJournalEntry & { route: 'save' }
  }
  return base as HydratedBridgeRuntimeJournalEntry & { route: 'load' }
}

function checkpointBytes(checkpoint: BridgeRuntimeCheckpointV1): number {
  return Buffer.byteLength(`${canonicalJson(checkpoint)}\n`, 'utf8')
}

function journalEntryBytes(entry: BridgeRuntimeJournalEntryV1): number {
  return Buffer.byteLength(canonicalJson(entry), 'utf8')
}

type SupportedPriorProtocolVersion =
  | typeof LEGACY_BRIDGE_RUNTIME_PROTOCOL_VERSION
  | typeof PROTOCOL_VERSION

type SupportedPriorSchemaId =
  | typeof LEGACY_BRIDGE_RUNTIME_SCHEMA_ID
  | typeof PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID

function migratePriorContractJson(
  json: string,
  path: string,
  priorProtocolVersion: SupportedPriorProtocolVersion,
  priorSchemaId: SupportedPriorSchemaId,
): string {
  const parsed = parseCanonicalJson(json, path)
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return fail(path, 'must be a bridge contract object')
  }
  const record = parsed as Record<string, unknown>
  if (record['protocolVersion'] !== priorProtocolVersion) {
    fail(`${path}.protocolVersion`, `must be ${String(priorProtocolVersion)}`)
  }
  if (record['schemaId'] !== priorSchemaId) {
    fail(`${path}.schemaId`, 'does not match the supported prior bridge schema')
  }
  return canonicalJson({
    ...record,
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
  })
}

function migratePriorCheckpoint(
  bytes: string,
  configuredLimits: BridgeRuntimeCheckpointLimits,
  createSessionId: () => string,
  priorProtocolVersion: SupportedPriorProtocolVersion,
  priorSchemaId: SupportedPriorSchemaId,
): LoadedBridgeRuntimeCheckpoint {
  const limits = validateLimits(configuredLimits)
  const byteLength = Buffer.byteLength(bytes, 'utf8')
  if (byteLength > limits.maxCheckpointBytes) {
    capacityFail('checkpoint', `uses ${String(byteLength)} bytes; maximum is ${String(limits.maxCheckpointBytes)}`)
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(bytes) as unknown
  } catch (error) {
    fail('checkpoint', `is not valid JSON: ${(error as Error).message}`)
  }
  const record = exactRecord(parsed, 'checkpoint', CHECKPOINT_KEYS)
  if (record['format'] !== BRIDGE_RUNTIME_CHECKPOINT_FORMAT) {
    fail('checkpoint.format', `must be ${JSON.stringify(BRIDGE_RUNTIME_CHECKPOINT_FORMAT)}`)
  }
  if (record['checkpointVersion'] !== BRIDGE_RUNTIME_CHECKPOINT_VERSION) {
    fail('checkpoint.checkpointVersion', `must be ${String(BRIDGE_RUNTIME_CHECKPOINT_VERSION)}`)
  }
  if (record['protocolVersion'] !== priorProtocolVersion) {
    fail(
      'checkpoint.protocolVersion',
      `must be ${String(priorProtocolVersion)} for forward migration`,
    )
  }
  if (record['schemaId'] !== priorSchemaId) {
    fail('checkpoint.schemaId', 'does not match the supported prior bridge schema')
  }

  const legacySessionId = requireString(record['sessionId'], 'checkpoint.sessionId')
  const stateRevision = requireRevision(record['stateRevision'], 'checkpoint.stateRevision')
  const currentSaveJson = requireString(record['currentSaveJson'], 'checkpoint.currentSaveJson')
  const currentStateDigest = requireDigest(record['currentStateDigest'], 'checkpoint.currentStateDigest')
  const savedSaveJson = requireNullableString(record['savedSaveJson'], 'checkpoint.savedSaveJson')
  const savedStateDigest = record['savedStateDigest'] === null
    ? null
    : requireDigest(record['savedStateDigest'], 'checkpoint.savedStateDigest')
  const journalDigest = requireDigest(record['journalDigest'], 'checkpoint.journalDigest')
  if (!Array.isArray(record['journal'])) fail('checkpoint.journal', 'must be an array')
  if (record['journal'].length > limits.maxJournalEntries) {
    capacityFail(
      'checkpoint.journal',
      `contains ${String(record['journal'].length)} entries; maximum is ${String(limits.maxJournalEntries)}`,
    )
  }

  const saveCache = new Map<string, SaveFileV15>()
  const currentSave = validateCanonicalV15(currentSaveJson, 'checkpoint.currentSaveJson', saveCache)
  if (digest(currentSaveJson) !== currentStateDigest) {
    fail('checkpoint.currentStateDigest', 'does not match currentSaveJson')
  }
  if ((savedSaveJson === null) !== (savedStateDigest === null)) {
    fail('checkpoint.savedStateDigest', 'must be null exactly when savedSaveJson is null')
  }
  let savedSave: SaveFileV15 | null = null
  if (savedSaveJson !== null) {
    savedSave = validateCanonicalV15(savedSaveJson, 'checkpoint.savedSaveJson', saveCache)
    if (digest(savedSaveJson) !== savedStateDigest) {
      fail('checkpoint.savedStateDigest', 'does not match savedSaveJson')
    }
  }
  if (priorSchemaId === PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID) {
    if (currentSave.state.founding !== null) {
      fail(
        'checkpoint.currentSaveJson',
        'previous protocol-4 production authority cannot contain an open founding draft',
      )
    }
    if (savedSave !== null && savedSave.state.founding !== null) {
      fail(
        'checkpoint.savedSaveJson',
        'previous protocol-4 production authority cannot contain an open founding draft',
      )
    }
  }

  const identities = new Set<string>()
  const normalizedJournal: BridgeRuntimeJournalEntryV1[] = []
  let totalJournalBytes = 0
  let previousResponseRevision = -1
  let lastAcceptedSaveJson: string | null = null
  for (let index = 0; index < record['journal'].length; index++) {
    const path = `checkpoint.journal[${String(index)}]`
    const legacy = exactRecord(record['journal'][index], path, JOURNAL_ENTRY_KEYS)
    const route = requireRoute(legacy['route'], `${path}.route`)
    const commandId = requireString(legacy['commandId'], `${path}.commandId`)
    const requestJson = requireString(legacy['requestJson'], `${path}.requestJson`)
    const responseJson = requireString(legacy['responseJson'], `${path}.responseJson`)
    if (identities.has(commandId)) fail(`${path}.commandId`, 'duplicates an earlier journal identity')

    const hydrated = hydrateEntry({
      route,
      commandId,
      requestJson: migratePriorContractJson(
        requestJson,
        `${path}.requestJson`,
        priorProtocolVersion,
        priorSchemaId,
      ),
      responseJson: migratePriorContractJson(
        responseJson,
        `${path}.responseJson`,
        priorProtocolVersion,
        priorSchemaId,
      ),
    }, index, legacySessionId, stateRevision, saveCache)
    if (hydrated.response.stateRevision < previousResponseRevision) {
      fail(path, 'response revisions must be non-decreasing')
    }
    if (hydrated.response.stateRevision === stateRevision) {
      if (hydrated.response.stateDigest !== currentStateDigest ||
          hydrated.response.gameWeek !== currentSave.state.market.tick) {
        fail(path, 'terminal response does not match the current checkpoint state')
      }
    }
    if (hydrated.route === 'save' && hydrated.response.accepted) {
      lastAcceptedSaveJson = hydrated.response.saveJson
    }
    identities.add(commandId)
    previousResponseRevision = hydrated.response.stateRevision
    const normalized = { route, commandId, requestJson, responseJson }
    normalizedJournal.push(normalized)
    totalJournalBytes += journalEntryBytes(normalized)
    if (totalJournalBytes > limits.maxJournalBytes) {
      capacityFail(
        'checkpoint.journal',
        `uses ${String(totalJournalBytes)} bytes; maximum is ${String(limits.maxJournalBytes)}`,
      )
    }
  }
  if (normalizedJournal.length === 0 && stateRevision !== 0) {
    fail('checkpoint.stateRevision', 'must be 0 when the journal is empty')
  }
  if (normalizedJournal.length > 0 && previousResponseRevision !== stateRevision) {
    fail('checkpoint.stateRevision', 'must equal the terminal journal response revision')
  }
  if (lastAcceptedSaveJson !== null && savedSaveJson !== lastAcceptedSaveJson) {
    fail('checkpoint.savedSaveJson', 'does not match the latest accepted save journal response')
  }
  if (journalDigest !== digest(canonicalJson(normalizedJournal))) {
    fail('checkpoint.journalDigest', 'does not match the canonical journal bytes')
  }

  const normalizedLegacy = {
    format: BRIDGE_RUNTIME_CHECKPOINT_FORMAT,
    checkpointVersion: BRIDGE_RUNTIME_CHECKPOINT_VERSION,
    protocolVersion: priorProtocolVersion,
    schemaId: priorSchemaId,
    sessionId: legacySessionId,
    stateRevision,
    currentSaveJson,
    currentStateDigest,
    savedSaveJson,
    savedStateDigest,
    journalDigest,
    journal: normalizedJournal,
  }
  if (bytes !== `${canonicalJson(normalizedLegacy)}\n`) {
    fail('checkpoint', 'must be canonical JSON followed by exactly one LF')
  }

  const nextSessionId = requireString(createSessionId(), 'migration.sessionId')
  if (nextSessionId === legacySessionId) {
    fail('migration.sessionId', 'must differ from the prior logical session')
  }
  const checkpoint = createBridgeRuntimeCheckpoint({
    sessionId: nextSessionId,
    stateRevision: 0,
    currentSaveJson,
    savedSaveJson,
    journal: [],
  }, limits)
  return {
    hydrated: hydrateBridgeRuntimeCheckpoint(checkpoint, limits),
    migratedFromProtocolVersion: priorProtocolVersion,
  }
}

export function hydrateBridgeRuntimeCheckpoint(
  value: unknown,
  configuredLimits: BridgeRuntimeCheckpointLimits = DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,
): HydratedBridgeRuntimeCheckpoint {
  const limits = validateLimits(configuredLimits)
  const record = exactRecord(value, 'checkpoint', CHECKPOINT_KEYS)
  if (record['format'] !== BRIDGE_RUNTIME_CHECKPOINT_FORMAT) {
    fail('checkpoint.format', `must be ${JSON.stringify(BRIDGE_RUNTIME_CHECKPOINT_FORMAT)}`)
  }
  if (record['checkpointVersion'] !== BRIDGE_RUNTIME_CHECKPOINT_VERSION) {
    fail('checkpoint.checkpointVersion', `must be ${String(BRIDGE_RUNTIME_CHECKPOINT_VERSION)}`)
  }
  if (record['protocolVersion'] !== PROTOCOL_VERSION) {
    fail('checkpoint.protocolVersion', `must be ${String(PROTOCOL_VERSION)}`)
  }
  if (record['schemaId'] !== SCHEMA_ID) {
    fail('checkpoint.schemaId', 'does not match the running TypeScript bridge schema')
  }

  const sessionId = requireString(record['sessionId'], 'checkpoint.sessionId')
  const stateRevision = requireRevision(record['stateRevision'], 'checkpoint.stateRevision')
  const currentSaveJson = requireString(record['currentSaveJson'], 'checkpoint.currentSaveJson')
  const currentStateDigest = requireDigest(record['currentStateDigest'], 'checkpoint.currentStateDigest')
  const savedSaveJson = requireNullableString(record['savedSaveJson'], 'checkpoint.savedSaveJson')
  const savedStateDigest = record['savedStateDigest'] === null
    ? null
    : requireDigest(record['savedStateDigest'], 'checkpoint.savedStateDigest')
  const journalDigest = requireDigest(record['journalDigest'], 'checkpoint.journalDigest')
  if (!Array.isArray(record['journal'])) {
    fail('checkpoint.journal', 'must be an array')
  }
  if (record['journal'].length > limits.maxJournalEntries) {
    capacityFail(
      'checkpoint.journal',
      `contains ${String(record['journal'].length)} entries; maximum is ${String(limits.maxJournalEntries)}`,
    )
  }

  const saveCache = new Map<string, SaveFileV15>()
  const currentSave = validateCanonicalV15(currentSaveJson, 'checkpoint.currentSaveJson', saveCache)
  if (digest(currentSaveJson) !== currentStateDigest) {
    fail('checkpoint.currentStateDigest', 'does not match currentSaveJson')
  }
  if ((savedSaveJson === null) !== (savedStateDigest === null)) {
    fail('checkpoint.savedStateDigest', 'must be null exactly when savedSaveJson is null')
  }
  const savedSave = savedSaveJson === null
    ? null
    : validateCanonicalV15(savedSaveJson, 'checkpoint.savedSaveJson', saveCache)
  if (savedSaveJson !== null && digest(savedSaveJson) !== savedStateDigest) {
    fail('checkpoint.savedStateDigest', 'does not match savedSaveJson')
  }

  const identities = new Set<string>()
  const hydratedJournal: HydratedBridgeRuntimeJournalEntry[] = []
  const normalizedJournal: BridgeRuntimeJournalEntryV1[] = []
  let previousResponseRevision = -1
  let lastAcceptedSaveJson: string | null = null
  let totalJournalBytes = 0
  for (let index = 0; index < record['journal'].length; index++) {
    const hydrated = hydrateEntry(
      record['journal'][index],
      index,
      sessionId,
      stateRevision,
      saveCache,
    )
    if (identities.has(hydrated.commandId)) {
      fail(`checkpoint.journal[${String(index)}].commandId`, 'duplicates an earlier journal identity')
    }
    if (hydrated.response.stateRevision < previousResponseRevision) {
      fail(`checkpoint.journal[${String(index)}]`, 'response revisions must be non-decreasing')
    }
    identities.add(hydrated.commandId)
    previousResponseRevision = hydrated.response.stateRevision
    if (hydrated.response.stateRevision === stateRevision) {
      if (hydrated.response.stateDigest !== currentStateDigest) {
        fail(
          `checkpoint.journal[${String(index)}].responseJson.stateDigest`,
          'does not match the current checkpoint state at the same revision',
        )
      }
      if (hydrated.response.gameWeek !== currentSave.state.market.tick) {
        fail(
          `checkpoint.journal[${String(index)}].responseJson.gameWeek`,
          'does not match the current checkpoint state at the same revision',
        )
      }
    }
    if (hydrated.route === 'save' && hydrated.response.accepted) {
      lastAcceptedSaveJson = hydrated.response.saveJson
    }
    hydratedJournal.push(hydrated)
    const normalized = {
      route: hydrated.route,
      commandId: hydrated.commandId,
      requestJson: hydrated.requestJson,
      responseJson: hydrated.responseJson,
    }
    normalizedJournal.push(normalized)
    totalJournalBytes += journalEntryBytes(normalized)
    if (totalJournalBytes > limits.maxJournalBytes) {
      capacityFail(
        'checkpoint.journal',
        `uses ${String(totalJournalBytes)} bytes; maximum is ${String(limits.maxJournalBytes)}`,
      )
    }
  }
  if (hydratedJournal.length === 0 && stateRevision !== 0) {
    fail('checkpoint.stateRevision', 'must be 0 when the journal is empty')
  }
  if (hydratedJournal.length > 0 && previousResponseRevision !== stateRevision) {
    fail(
      'checkpoint.stateRevision',
      'must equal the terminal journal response revision',
    )
  }
  if (lastAcceptedSaveJson !== null && savedSaveJson !== lastAcceptedSaveJson) {
    fail(
      'checkpoint.savedSaveJson',
      'does not match the latest accepted save journal response',
    )
  }
  const computedJournalDigest = digest(canonicalJson(normalizedJournal))
  if (journalDigest !== computedJournalDigest) {
    fail('checkpoint.journalDigest', 'does not match the canonical journal bytes')
  }

  const checkpoint: BridgeRuntimeCheckpointV1 = {
    format: BRIDGE_RUNTIME_CHECKPOINT_FORMAT,
    checkpointVersion: BRIDGE_RUNTIME_CHECKPOINT_VERSION,
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId,
    stateRevision,
    currentSaveJson,
    currentStateDigest,
    savedSaveJson,
    savedStateDigest,
    journalDigest,
    journal: normalizedJournal,
  }
  const totalCheckpointBytes = checkpointBytes(checkpoint)
  if (totalCheckpointBytes > limits.maxCheckpointBytes) {
    capacityFail(
      'checkpoint',
      `uses ${String(totalCheckpointBytes)} bytes; maximum is ${String(limits.maxCheckpointBytes)}`,
    )
  }
  return {
    checkpoint,
    currentSave,
    savedSave,
    journal: hydratedJournal,
    checkpointBytes: totalCheckpointBytes,
    journalBytes: totalJournalBytes,
  }
}

export function encodeBridgeRuntimeCheckpoint(
  value: unknown,
  limits: BridgeRuntimeCheckpointLimits = DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,
): string {
  const hydrated = hydrateBridgeRuntimeCheckpoint(value, limits)
  return `${canonicalJson(hydrated.checkpoint)}\n`
}

export function decodeBridgeRuntimeCheckpoint(
  bytes: string,
  configuredLimits: BridgeRuntimeCheckpointLimits = DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,
): HydratedBridgeRuntimeCheckpoint {
  const limits = validateLimits(configuredLimits)
  const byteLength = Buffer.byteLength(bytes, 'utf8')
  if (byteLength > limits.maxCheckpointBytes) {
    capacityFail('checkpoint', `uses ${String(byteLength)} bytes; maximum is ${String(limits.maxCheckpointBytes)}`)
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(bytes) as unknown
  } catch (error) {
    fail('checkpoint', `is not valid JSON: ${(error as Error).message}`)
  }
  const hydrated = hydrateBridgeRuntimeCheckpoint(parsed, limits)
  const canonicalBytes = `${canonicalJson(hydrated.checkpoint)}\n`
  if (bytes !== canonicalBytes) {
    fail('checkpoint', 'must be canonical JSON followed by exactly one LF')
  }
  return hydrated
}

/**
 * Startup-only compatibility boundary. Prior response bytes cannot be replayed under the
 * current closed contract, so a valid checkpoint is rolled into a fresh logical session while
 * preserving both authoritative V15 save slots exactly.
 */
export function loadBridgeRuntimeCheckpoint(
  bytes: string,
  configuredLimits: BridgeRuntimeCheckpointLimits = DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,
  createSessionId: () => string = randomUUID,
): LoadedBridgeRuntimeCheckpoint {
  let parsed: unknown
  try {
    parsed = JSON.parse(bytes) as unknown
  } catch {
    return {
      hydrated: decodeBridgeRuntimeCheckpoint(bytes, configuredLimits),
      migratedFromProtocolVersion: null,
    }
  }
  if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
    const record = parsed as Record<string, unknown>
    if (record['protocolVersion'] === LEGACY_BRIDGE_RUNTIME_PROTOCOL_VERSION ||
        record['schemaId'] === LEGACY_BRIDGE_RUNTIME_SCHEMA_ID) {
      return migratePriorCheckpoint(
        bytes,
        configuredLimits,
        createSessionId,
        LEGACY_BRIDGE_RUNTIME_PROTOCOL_VERSION,
        LEGACY_BRIDGE_RUNTIME_SCHEMA_ID,
      )
    }
    if (record['protocolVersion'] === PROTOCOL_VERSION &&
        record['schemaId'] === PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID) {
      return migratePriorCheckpoint(
        bytes,
        configuredLimits,
        createSessionId,
        PROTOCOL_VERSION,
        PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID,
      )
    }
  }
  return {
    hydrated: decodeBridgeRuntimeCheckpoint(bytes, configuredLimits),
    migratedFromProtocolVersion: null,
  }
}

export function createBridgeRuntimeCheckpoint(
  input: CreateBridgeRuntimeCheckpointInput,
  limits: BridgeRuntimeCheckpointLimits = DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,
): BridgeRuntimeCheckpointV1 {
  const journal = [...input.journal]
  const candidate: BridgeRuntimeCheckpointV1 = {
    format: BRIDGE_RUNTIME_CHECKPOINT_FORMAT,
    checkpointVersion: BRIDGE_RUNTIME_CHECKPOINT_VERSION,
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: input.sessionId,
    stateRevision: input.stateRevision,
    currentSaveJson: input.currentSaveJson,
    currentStateDigest: digest(input.currentSaveJson),
    savedSaveJson: input.savedSaveJson,
    savedStateDigest: input.savedSaveJson === null ? null : digest(input.savedSaveJson),
    journalDigest: digest(canonicalJson(journal)),
    journal,
  }
  return hydrateBridgeRuntimeCheckpoint(candidate, limits).checkpoint
}

/**
 * Validate a prospective append against the complete checkpoint and all count/byte limits.
 * The caller can replace its journal with the returned normalized value only after this succeeds.
 */
export function appendBridgeRuntimeJournalEntry(
  checkpoint: BridgeRuntimeCheckpointV1,
  entry: BridgeRuntimeJournalEntry,
  limits: BridgeRuntimeLimits = DEFAULT_BRIDGE_RUNTIME_LIMITS,
): BridgeRuntimeCheckpointV1 {
  const journal = [...checkpoint.journal, entry]
  return hydrateBridgeRuntimeCheckpoint({
    ...checkpoint,
    journalDigest: digest(canonicalJson(journal)),
    journal,
  }, limits).checkpoint
}

export function createBridgeRuntimeJournalEntry(
  route: 'command',
  request: BridgeSubmitIntentCommand,
  response: BridgeAcceptedCommandResponse | BridgeRejectedResponse,
): BridgeRuntimeJournalEntryV1
export function createBridgeRuntimeJournalEntry(
  route: 'save',
  request: BridgeControlEnvelope,
  response: BridgeAcceptedSaveResponse | BridgeRejectedResponse,
): BridgeRuntimeJournalEntryV1
export function createBridgeRuntimeJournalEntry(
  route: 'load',
  request: BridgeControlEnvelope,
  response: BridgeAcceptedCommandResponse | BridgeRejectedResponse,
): BridgeRuntimeJournalEntryV1
export function createBridgeRuntimeJournalEntry(
  route: BridgeRuntimeJournalRoute,
  request: BridgeSubmitIntentCommand | BridgeControlEnvelope,
  response: BridgeRuntimeJournalResponse,
): BridgeRuntimeJournalEntryV1 {
  const candidate = {
    route,
    commandId: request.commandId,
    requestJson: canonicalJson(request),
    responseJson: canonicalJson(response),
  }
  const maxRevision = Math.max(request.expectedStateRevision + 1, response.stateRevision)
  const hydrated = hydrateEntry(candidate, 0, request.sessionId, maxRevision, new Map())
  return {
    route: hydrated.route,
    commandId: hydrated.commandId,
    requestJson: hydrated.requestJson,
    responseJson: hydrated.responseJson,
  }
}
