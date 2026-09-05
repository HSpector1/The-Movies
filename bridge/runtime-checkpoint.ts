import { createHash, randomUUID } from 'node:crypto'

import {
  exportSave,
  importSave,
  migrateToV18,
  type SaveFileV18,
} from '../src/core/index.js'
import { exportSaveJson } from '../ui/src/engine/adapter.ts'
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
// P03A named this the one carry-forward slot; P04A REOPEN retires that ceiling.
// The Owner's durable profile checkpoint proved a real runtime dir can sit on
// ANY historical protocol-4 schema, not just the one immediately prior to the
// running schema, so a single slot fails closed on everything older. This
// constant is kept (unchanged value, still the projection-v8 identity) purely
// because existing call sites already name it; it is now one entry among many
// in SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS below, not a distinguished slot.
export const PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID =
  'sha256:0285e92f32c27cd2960df802b3f7ea156a15372f05001ad1f4964c2f25db55b5' as const

// P04A REOPEN: every distinct protocol-4 schema identity that has ever shipped,
// enumerated by walking the full commit history of
// generated/unity/StudioBridgeDtos.Generated.cs (`git log --format=%h -- <path>`,
// then `git show <sha>:<path> | grep -m1 "Schema identity"` for each commit) and
// collecting every DISTINCT value, excluding the current running schema
// (SCHEMA_ID, sha256:01f15efc...) and the protocol-3 legacy identity
// (LEGACY_BRIDGE_RUNTIME_SCHEMA_ID above). The era label mirrors the
// generator's ProjectionVersion constant at the introducing commit. Two
// commits can share a ProjectionVersion number yet still mint distinct schema
// identities when the schema content changed without a version bump — both
// are enumerated (suffixed "-early") because a durable checkpoint written in
// that window would carry the earlier hash, and this map is keyed on the
// hash, not the label.
export const SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS: ReadonlyMap<string, string> = new Map<string, string>([
  // projection-v4-early: 720826b "authenticate durable runtime sessions" — the
  // first protocol-4 schema; superseded two days later within the same
  // generator ProjectionVersion=4 label by the entry below.
  ['sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f', 'projection-v4-early'],
  // projection-v4: d0223c1 "raw Week-0 founding opening with GUI cast choice" —
  // the identity carried by the Owner's stuck durable profile checkpoint that
  // opened this P04A REOPEN lane.
  ['sha256:f84ae77ec59a0d7ca7cdd89115456504ddecbde2c6e3839936e4951bd65bce61', 'projection-v4'],
  // projection-v5: de32b41 "LL-CP9 founding-arrival view, treasury pulse,
  // founding at Core minimum"
  ['sha256:be7ed660d04ed9b1056f48e946f86f26c10cab42b950a273d57ad9cba372f5bb', 'projection-v5'],
  // projection-v6: 72c373c "projection v6 — Madden-style arrival stats (fame,
  // work ethic, market standing)"
  ['sha256:15033cf9ca43be65abcb25fc6f910f9487ac23056090126ec7d3e2353f6ce587', 'projection-v6'],
  // projection-v7: 57fde6f "projection v7 — the specialty signal and the
  // payroll pulse"
  ['sha256:7e3af4db0d3d18cdeaab00082e0034f304a9141f46ea87e9e64e5a99d985483c', 'projection-v7'],
  // projection-v8: 6761178 "projection v8 — the signed roster becomes
  // authoritative" — this was the P03A single carry-forward slot
  // (PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID above); referenced by name
  // here so existing call sites that import that constant keep working.
  [PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID, 'projection-v8'],
  // projection-v9-early: a75b20c "projection v9 — the Development board and
  // the commission quote seam" — superseded eleven minutes later within the
  // same generator ProjectionVersion=9 label by the entry below.
  ['sha256:510f08e4a551827a30e0f3d93bbe09fa5ddadbd39366b4dcfa93530500c7979c', 'projection-v9-early'],
  // projection-v9: 2ddf080 "the commission catalog names the genres"
  ['sha256:80f2f0fcd14d1b25e713c2624286a6c05a98c53ea5cfcb2b47612f8c030f5e47', 'projection-v9'],
  // projection-v10: 84c47d4 "P04A — casting projection v10 + quote union +
  // SaveV15 cutover" (also c056f2b, a same-day generator fix that reproduces
  // the identical hash — one P04A-interim value, not two).
  ['sha256:92317ec179456cdc5bd5cc7c4ca47dd066b768a9e2e45519f1263ef921a211a4', 'projection-v10'],
  // projection-v11: the P04A.3-accepted / P05A-static-contract-gate identity —
  // the OUTGOING schema of the P05A W2 projection bump to v12 (the schema-bump
  // law: at every projection/schema bump, append the outgoing identity here so
  // durable checkpoints written under it keep migrating).
  ['sha256:01f15efc8fc33fd810b051242857385ca23b5e1c775b357db1bfe5a70e907e1e', 'projection-v11'],
  // projection-v12-stale-urn: the P05A W2 WIP-branch intermediate — v12
  // content under a canonical $id still reading projection-11 (the W2 range
  // review's F2). Never in any campaign branch or player build; appended per
  // the schema-bump law because checkpoints written by W2–W4 dev/proof runs
  // on the WIP branch carry it.
  ['sha256:a481d14f3810ffbafcba2bbf509db7340263f3f0fd665a059507a1567d98923d', 'projection-v12-stale-urn'],
  // projection-v12: 93895b7..e2ab80d "P05A closed Production projection"
  // through P05A.2 — the identity every P05-era Owner checkpoint carries.
  ['sha256:a6f374596e956800f9547ad538fdd859c01bda3460aac8b877279c67686c6f4b', 'projection-v12'],
  // P06A W2 (the schema-bump law above, obeyed): the P05A.3-sealed identity —
  // the one the final-P05 Owner checkpoint carries — became prior the moment
  // projection 14 minted the P06 identity.
  ['sha256:0474ceafd6c148f329fe99eac328c79ed0b0caf906e0f7442b7f3cf0fe40cb4f', 'projection-v13'],
  // projection-v15: the P07-accepted identity (campaign c4c65db4 / TS da848225,
  // schema ddce1c39…) — the OUTGOING schema of the P08A W2 projection bump to
  // v16 (the schema-bump law, obeyed): every accepted P07 profile and candidate
  // checkpoint carries it and keeps migrating.
  ['sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99', 'projection-v15'],
  // P08A W2 — projection 16 (Standing & Studio History section); superseded by P09's projection 17.
  ['sha256:85a6d125960dce49b4775f842d7b56d7360c81cef3638cd819057c79c99f0236', 'projection-v16'],
  // projection-v17-early: 71a879be — the first projection-17 identity (placement quote
  // family), superseded within the same ProjectionVersion=17 label by W1b (roads +
  // bare-lot journey beat); a checkpoint written in that window carries this hash.
  ['sha256:c9dad9f3d8bb94445db1a5425d90db3f9894da9354f47a07992ff96261cfc399', 'projection-v17-early'],
])

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
  currentSave: CurrentEnvelopeSave
  savedSave: CurrentEnvelopeSave | null
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

// P06A W2: the W1 compatibility window is CLOSED. The P06 schema identity is
// minted (projection 14) and the P05A.3 identity (`0474ceaf…`) is registered
// prior above — every pre-P06 checkpoint now takes the governed prior path
// (journal discarded as opaque history, saves re-imported through the
// canonical chain). A CURRENT-schema checkpoint is therefore always written
// by this build and always carries live V16 bytes.
type CurrentEnvelopeSave = SaveFileV18

function validateCanonicalCurrentSave(
  saveJson: string,
  path: string,
  cache: Map<string, CurrentEnvelopeSave>,
): CurrentEnvelopeSave {
  const cached = cache.get(saveJson)
  if (cached !== undefined) return cached
  let imported
  try {
    imported = importSave(saveJson)
  } catch (error) {
    fail(path, `is not a valid TypeScript save: ${(error as Error).message}`)
  }
  if (imported.saveVersion !== 18) {
    fail(path, `must be a current V18 save, received V${String(imported.saveVersion)}`)
  }
  if (exportSave(imported) !== saveJson) {
    fail(path, 'must preserve the canonical V18 save bytes exactly')
  }
  const current = imported as CurrentEnvelopeSave
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
  saveCache: Map<string, CurrentEnvelopeSave>,
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
      validateCanonicalCurrentSave(acceptedSave.saveJson, `${path}.responseJson.saveJson`, saveCache)
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

// Widened (P04A REOPEN): was the two-member literal union
// `LEGACY_BRIDGE_RUNTIME_SCHEMA_ID | PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID`.
// The set of accepted protocol-4 identities is now a runtime map
// (SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS), so it cannot be expressed as a
// closed compile-time literal union; membership is checked at the dispatch
// site (loadBridgeRuntimeCheckpoint) instead.
type SupportedPriorSchemaId = typeof LEGACY_BRIDGE_RUNTIME_SCHEMA_ID | string

// Used only by the protocol-3 legacy path below — protocol-4 prior imports
// never hydrate/parse journal bodies under the current contract (see
// migratePriorProtocol4Checkpoint's compatibility-boundary comment).
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

// Protocol-3 legacy import — UNCHANGED law (kept byte-for-byte from the prior
// single-path implementation; only the two former parameters are now fixed
// `const`s naming what was always their one caller). Still hydrates/parses
// every journal request and response body under the CURRENT contract via
// hydrateEntry, and still cross-checks the terminal journal response against
// the root revision/digest/week and the latest accepted save. Do not change
// this function to "fix" it to match the protocol-4 compatibility boundary
// below — the frozen law is explicit that protocol-3 law stays untouched.
function migrateLegacyProtocol3Checkpoint(
  bytes: string,
  configuredLimits: BridgeRuntimeCheckpointLimits,
  createSessionId: () => string,
): LoadedBridgeRuntimeCheckpoint {
  const priorProtocolVersion = LEGACY_BRIDGE_RUNTIME_PROTOCOL_VERSION
  const priorSchemaId = LEGACY_BRIDGE_RUNTIME_SCHEMA_ID
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

  const saveCache = new Map<string, CurrentEnvelopeSave>()
  const currentSave = validateCanonicalCurrentSave(currentSaveJson, 'checkpoint.currentSaveJson', saveCache)
  if (digest(currentSaveJson) !== currentStateDigest) {
    fail('checkpoint.currentStateDigest', 'does not match currentSaveJson')
  }
  if ((savedSaveJson === null) !== (savedStateDigest === null)) {
    fail('checkpoint.savedStateDigest', 'must be null exactly when savedSaveJson is null')
  }
  let savedSave: CurrentEnvelopeSave | null = null
  if (savedSaveJson !== null) {
    savedSave = validateCanonicalCurrentSave(savedSaveJson, 'checkpoint.savedSaveJson', saveCache)
    if (digest(savedSaveJson) !== savedStateDigest) {
      fail('checkpoint.savedStateDigest', 'does not match savedSaveJson')
    }
  }
  if ((priorSchemaId as string) === PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID) {
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

// Parse then live-migrate a prior save slot through the EXISTING core save
// path — `importSave` then `migrateToV17` (accepts V1..V17, refuses malformed
// or unknown versions loudly; the same two-step chain `bridge/session.ts`'s
// own `importSaveJsonCurrent` wraps, and what the ui adapter's `importSaveJson`
// mirrors) — then re-serialize via `exportSaveJson`. This is the
// ONLY place a prior identity's save bytes are interpreted; the surrounding
// checkpoint envelope and journal are handled as opaque bytes (see
// migratePriorProtocol4Checkpoint below).
function importPriorSaveViaCanonicalChain(
  json: string,
  path: string,
): { json: string; state: SaveFileV18['state'] } {
  let migrated: SaveFileV18
  try {
    migrated = migrateToV18(importSave(json))
  } catch (error) {
    fail(path, `is not a save the current save contract can import: ${(error as Error).message}`)
  }
  return { json: exportSaveJson(migrated.state), state: migrated.state }
}

// Unified prior import (P04A REOPEN) for ANY enumerated protocol-4 identity in
// SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.
//
// COMPATIBILITY BOUNDARY: a prior protocol-4 checkpoint's journal is opaque,
// discarded history. This function verifies the checkpoint ENVELOPE and
// journal STRUCTURE against the original bytes exactly (exact keys, exact
// format/checkpointVersion/protocolVersion/schemaId, canonical-JSON-plus-LF
// against the normalized record, array bounds, per-entry exact keys, valid
// route strings, non-empty ids, unique commandIds, and the journalDigest/
// currentStateDigest/savedStateDigest byte digests) — but it never parses or
// hydrates a journal entry's requestJson/responseJson body under the current
// contract, and it never checks savedSaveJson against a journal response.
// Prior journal bodies were shaped under a schema up to seven versions removed
// from the one running now; there is no meaning-preserving way to replay them
// under today's contract, and the documented migration cost already discards
// the journal outright (stateRevision resets to 0, journal becomes []). Only
// the two authoritative V15 save slots are living state, and only they are
// interpreted — via the existing core save path, never invented.
function migratePriorProtocol4Checkpoint(
  bytes: string,
  configuredLimits: BridgeRuntimeCheckpointLimits,
  createSessionId: () => string,
  priorSchemaId: string,
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
  if (record['protocolVersion'] !== PROTOCOL_VERSION) {
    fail(
      'checkpoint.protocolVersion',
      `must be ${String(PROTOCOL_VERSION)} for forward migration`,
    )
  }
  if (record['schemaId'] !== priorSchemaId) {
    fail('checkpoint.schemaId', 'does not match the supported prior bridge schema')
  }

  const priorSessionId = requireString(record['sessionId'], 'checkpoint.sessionId')
  const priorStateRevision = requireRevision(record['stateRevision'], 'checkpoint.stateRevision')
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

  // Old-artifact integrity ON THE ORIGINAL BYTES: a plain byte digest, never a
  // schema/version check — the raw currentSaveJson/savedSaveJson may be any
  // pre-V15 canonical save shape.
  if (digest(currentSaveJson) !== currentStateDigest) {
    fail('checkpoint.currentStateDigest', 'does not match currentSaveJson')
  }
  if ((savedSaveJson === null) !== (savedStateDigest === null)) {
    fail('checkpoint.savedStateDigest', 'must be null exactly when savedSaveJson is null')
  }
  if (savedSaveJson !== null && digest(savedSaveJson) !== savedStateDigest) {
    fail('checkpoint.savedStateDigest', 'does not match savedSaveJson')
  }

  // Journal: opaque discarded history for prior identities (see the
  // compatibility-boundary comment above). Verify structure and identity only
  // — never parse requestJson/responseJson, never cross-check against the
  // save slots or the root revision.
  const identities = new Set<string>()
  const normalizedJournal: BridgeRuntimeJournalEntryV1[] = []
  let totalJournalBytes = 0
  for (let index = 0; index < record['journal'].length; index++) {
    const path = `checkpoint.journal[${String(index)}]`
    const raw = exactRecord(record['journal'][index], path, JOURNAL_ENTRY_KEYS)
    const route = requireRoute(raw['route'], `${path}.route`)
    const commandId = requireString(raw['commandId'], `${path}.commandId`)
    const requestJson = requireString(raw['requestJson'], `${path}.requestJson`)
    const responseJson = requireString(raw['responseJson'], `${path}.responseJson`)
    if (identities.has(commandId)) fail(`${path}.commandId`, 'duplicates an earlier journal identity')
    identities.add(commandId)
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
  if (journalDigest !== digest(canonicalJson(normalizedJournal))) {
    fail('checkpoint.journalDigest', 'does not match the canonical journal bytes')
  }

  const normalizedPrior = {
    format: BRIDGE_RUNTIME_CHECKPOINT_FORMAT,
    checkpointVersion: BRIDGE_RUNTIME_CHECKPOINT_VERSION,
    protocolVersion: PROTOCOL_VERSION,
    schemaId: priorSchemaId,
    sessionId: priorSessionId,
    stateRevision: priorStateRevision,
    currentSaveJson,
    currentStateDigest,
    savedSaveJson,
    savedStateDigest,
    journalDigest,
    journal: normalizedJournal,
  }
  if (bytes !== `${canonicalJson(normalizedPrior)}\n`) {
    fail('checkpoint', 'must be canonical JSON followed by exactly one LF')
  }

  // Save import via the canonical chain (§2b): parse + live-migrate + re-serialize.
  const migratedCurrent = importPriorSaveViaCanonicalChain(currentSaveJson, 'checkpoint.currentSaveJson')
  const migratedSaved = savedSaveJson === null
    ? null
    : importPriorSaveViaCanonicalChain(savedSaveJson, 'checkpoint.savedSaveJson')

  // The founding-draft guard applies to BOTH slots, checked on the MIGRATED
  // save: a durable prior-protocol-4 checkpoint is production authority, and
  // production authority cannot be mid-founding.
  if (migratedCurrent.state.founding !== null) {
    fail(
      'checkpoint.currentSaveJson',
      'previous protocol-4 production authority cannot contain an open founding draft',
    )
  }
  if (migratedSaved !== null && migratedSaved.state.founding !== null) {
    fail(
      'checkpoint.savedSaveJson',
      'previous protocol-4 production authority cannot contain an open founding draft',
    )
  }

  const nextSessionId = requireString(createSessionId(), 'migration.sessionId')
  if (nextSessionId === priorSessionId) {
    fail('migration.sessionId', 'must differ from the prior logical session')
  }
  const checkpoint = createBridgeRuntimeCheckpoint({
    sessionId: nextSessionId,
    stateRevision: 0,
    currentSaveJson: migratedCurrent.json,
    savedSaveJson: migratedSaved === null ? null : migratedSaved.json,
    journal: [],
  }, limits)
  return {
    hydrated: hydrateBridgeRuntimeCheckpoint(checkpoint, limits),
    migratedFromProtocolVersion: PROTOCOL_VERSION,
  }
}

function migratePriorCheckpoint(
  bytes: string,
  configuredLimits: BridgeRuntimeCheckpointLimits,
  createSessionId: () => string,
  priorProtocolVersion: SupportedPriorProtocolVersion,
  priorSchemaId: SupportedPriorSchemaId,
): LoadedBridgeRuntimeCheckpoint {
  if (priorProtocolVersion === LEGACY_BRIDGE_RUNTIME_PROTOCOL_VERSION) {
    return migrateLegacyProtocol3Checkpoint(bytes, configuredLimits, createSessionId)
  }
  return migratePriorProtocol4Checkpoint(bytes, configuredLimits, createSessionId, priorSchemaId)
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

  const saveCache = new Map<string, CurrentEnvelopeSave>()
  const currentSave = validateCanonicalCurrentSave(currentSaveJson, 'checkpoint.currentSaveJson', saveCache)
  if (digest(currentSaveJson) !== currentStateDigest) {
    fail('checkpoint.currentStateDigest', 'does not match currentSaveJson')
  }
  if ((savedSaveJson === null) !== (savedStateDigest === null)) {
    fail('checkpoint.savedStateDigest', 'must be null exactly when savedSaveJson is null')
  }
  const savedSave = savedSaveJson === null
    ? null
    : validateCanonicalCurrentSave(savedSaveJson, 'checkpoint.savedSaveJson', saveCache)
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
        typeof record['schemaId'] === 'string' &&
        SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(record['schemaId'])) {
      return migratePriorCheckpoint(
        bytes,
        configuredLimits,
        createSessionId,
        PROTOCOL_VERSION,
        record['schemaId'],
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
