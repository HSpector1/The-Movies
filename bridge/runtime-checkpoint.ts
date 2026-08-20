import { createHash } from 'node:crypto'

import {
  exportSave,
  importSave,
  type SaveFileV14,
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
  currentSave: SaveFileV14
  savedSave: SaveFileV14 | null
  journal: readonly HydratedBridgeRuntimeJournalEntry[]
  checkpointBytes: number
  journalBytes: number
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

function validateCanonicalV14(
  saveJson: string,
  path: string,
  cache: Map<string, SaveFileV14>,
): SaveFileV14 {
  const cached = cache.get(saveJson)
  if (cached !== undefined) return cached
  let imported
  try {
    imported = importSave(saveJson)
  } catch (error) {
    fail(path, `is not a valid TypeScript save: ${(error as Error).message}`)
  }
  if (imported.saveVersion !== 14) {
    fail(path, `must be a current V14 save, received V${String(imported.saveVersion)}`)
  }
  if (exportSave(imported) !== saveJson) {
    fail(path, 'must preserve the canonical V14 save bytes exactly')
  }
  const current = imported as SaveFileV14
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
  saveCache: Map<string, SaveFileV14>,
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
      validateCanonicalV14(acceptedSave.saveJson, `${path}.responseJson.saveJson`, saveCache)
      if (digest(acceptedSave.saveJson) !== acceptedSave.stateDigest) {
        fail(path, 'accepted save response digest does not match its V14 bytes')
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

  const saveCache = new Map<string, SaveFileV14>()
  const currentSave = validateCanonicalV14(currentSaveJson, 'checkpoint.currentSaveJson', saveCache)
  if (digest(currentSaveJson) !== currentStateDigest) {
    fail('checkpoint.currentStateDigest', 'does not match currentSaveJson')
  }
  if ((savedSaveJson === null) !== (savedStateDigest === null)) {
    fail('checkpoint.savedStateDigest', 'must be null exactly when savedSaveJson is null')
  }
  const savedSave = savedSaveJson === null
    ? null
    : validateCanonicalV14(savedSaveJson, 'checkpoint.savedSaveJson', saveCache)
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
