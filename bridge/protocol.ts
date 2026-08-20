import { createHash } from 'node:crypto'

export const PROTOCOL_VERSION = 2 as const
export const SNAPSHOT_VERSION = 2 as const

export const AVAILABLE_INTENT_KEYS = [
  'intentId',
  'kind',
  'label',
  'detail',
  'projectId',
  'castingSessionId',
  'productionId',
] as const

/**
 * Cross-language contract source. Unlike protocol 1, the schema identity covers
 * the current lot DTO's nested identities and presentation fields as well as the
 * command/response envelopes. Unity pins SCHEMA_ID and fails closed on drift.
 */
export const BRIDGE_CONTRACT = {
  id: 'project-studio-current-game-unity-bridge',
  protocolVersion: PROTOCOL_VERSION,
  snapshotVersion: SNAPSHOT_VERSION,
  transport: 'http-json-localhost',
  snapshotEnvelope: {
    required: [
      'protocolVersion',
      'schemaId',
      'snapshotVersion',
      'sessionId',
      'stateRevision',
      'gameWeek',
      'stateDigest',
      'snapshot',
      'availableIntents',
      'metrics',
    ],
  },
  availableIntent: {
    exact: AVAILABLE_INTENT_KEYS,
    kinds: [
      'commissionScreenplay',
      'advanceWeek',
      'acceptScreenplay',
      'requestRewrite',
      'startAuditions',
      'acknowledgeAuditions',
      'greenlightPicture',
      'resolveProductionBlocker',
      'startConstruction',
    ],
    nullableIdentityFields: ['projectId', 'castingSessionId', 'productionId'],
  },
  commandEnvelope: {
    exact: [
      'protocolVersion',
      'schemaId',
      'sessionId',
      'commandId',
      'expectedStateRevision',
      'type',
      'payload',
    ],
    type: 'submitIntent',
    payloadExact: ['intentId'],
  },
  controlEnvelope: {
    exact: [
      'protocolVersion',
      'schemaId',
      'sessionId',
      'commandId',
      'expectedStateRevision',
    ],
    routes: ['save', 'load'],
  },
  acceptedCommandResponse: {
    spreads: 'snapshotEnvelope',
    requiredAdditional: ['commandId', 'accepted', 'message', 'processingMs'],
  },
  acceptedSaveResponse: {
    required: [
      'protocolVersion',
      'schemaId',
      'sessionId',
      'commandId',
      'accepted',
      'message',
      'stateRevision',
      'gameWeek',
      'stateDigest',
      'saveJson',
      'processingMs',
    ],
  },
  rejectedResponse: {
    required: [
      'protocolVersion',
      'schemaId',
      'sessionId',
      'commandId',
      'accepted',
      'reasonCode',
      'message',
      'stateRevision',
      'gameWeek',
      'stateDigest',
      'processingMs',
    ],
  },
  rejectionCodes: [
    'INVALID_JSON',
    'INVALID_COMMAND',
    'INVALID_CONTROL',
    'PROTOCOL_MISMATCH',
    'SCHEMA_MISMATCH',
    'SESSION_MISMATCH',
    'STALE_REVISION',
    'COMMAND_ID_REUSE',
    'INTENT_NOT_AVAILABLE',
    'ENGINE_REJECTED',
    'NO_SAVE',
    'SAVE_REJECTED',
  ],
  studioSnapshotSchema: {
    rootRequired: [
      'studioName', 'week', 'cash', 'cashBand', 'standing', 'standingValues',
      'publicityOffers', 'annexWork', 'placement', 'property', 'activeProductions',
      'releasedFilms', 'releasePresence', 'latestReleaseTitle', 'people', 'buildings',
      'gateHiringMarket', 'selectedBuildingId', 'sceneSeed', 'firstFilmJourney',
      'operationsMode', 'stageAssignmentAuthority', 'productionOperations',
    ],
    rootManaged: ['presence', 'weekTheater', 'stages', 'sets', 'weekEvents'],
    standingValues: ['awareness', 'prestige', 'confidence'],
    placement: [
      'mode', 'currentWeek', 'buildEnabled', 'lotWidth', 'lotDepth', 'parcels',
      'placements', 'catalog', 'weeklyOperatingCost',
    ],
    parcel: ['id', 'label', 'terrain', 'rect', 'roadFrontage', 'occupiedCells', 'placedFacilityIds'],
    placedFacility: [
      'id', 'blueprintId', 'capability', 'name', 'facilityId', 'parcelId', 'origin',
      'cells', 'status', 'placedWeek', 'completesWeek', 'weeksRemaining', 'progress01',
      'weeklyOperatingCost', 'mutation',
    ],
    property: ['bounds', 'buildings'],
    propertyBuilding: [
      'id', 'label', 'role', 'origin', 'footprint', 'placedFacilityId', 'blueprintId',
      'capability', 'status',
    ],
    stage: ['facilityId', 'facilityName', 'buildingId', 'origin', 'standing'],
    set: [
      'id', 'name', 'locationLabel', 'mountedOnFacilityId', 'status', 'repairing',
      'completesWeek', 'weeksRemaining', 'quality', 'condition', 'novelty', 'usable',
      'sceneryFacilityId',
    ],
    productionCard: [
      'id', 'title', 'genre', 'stageId', 'progress01', 'weeksRemaining', 'active',
      'stageState', 'attentionReason',
    ],
    productionOperation: [
      'productionId', 'title', 'phase', 'phaseLabel', 'weeksRemaining', 'progress01',
      'locationBuildingId', 'facilityLabel', 'directorId', 'directorName', 'leadId',
      'leadName', 'companyMembers', 'taskStatus', 'statusLabel', 'blocker', 'attention',
      'currentCommand',
    ],
    productionBlocker: ['kind', 'headline', 'detail'],
    productionCommand: ['kind', 'productionId', 'directorId', 'label'],
    person: ['id', 'name', 'role', 'authority', 'productionId', 'productionTitle'],
    presence: ['week', 'beatsPerWeek', 'staticBeat', 'people', 'withheldTalentIds'],
    presencePerson: [
      'talentId', 'name', 'creativeRole', 'engagement', 'credit', 'ownerId', 'facilityId',
      'slot', 'beats', 'blockedReason', 'facilityName', 'workTitle', 'activity',
    ],
    weekTheater: ['week', 'beatsPerWeek', 'staticBeat', 'subjects', 'withheld'],
    releasedFilm: ['id', 'title', 'reception', 'weeksAgo'],
    building: [
      'id', 'available', 'underDressed', 'attention', 'attentionReason',
      'constructionStatus', 'constructionProgress01', 'constructionProgressText',
    ],
    firstFilmJourney: [
      'stage', 'beat', 'productionId', 'scriptProjectId', 'pictureTitle', 'ordinal',
      'headline', 'whatHappened', 'whyItMatters', 'detail', 'next', 'waiting', 'blocked',
    ],
    journeyNext: ['kind', 'label', 'site'],
    journeyWaiting: ['untilWeek', 'reason'],
    journeyBlocked: ['reason'],
  },
} as const

export const SCHEMA_ID = `sha256:${createHash('sha256')
  .update(JSON.stringify(BRIDGE_CONTRACT))
  .digest('hex')}`

export type AvailableIntentKind = (typeof BRIDGE_CONTRACT.availableIntent.kinds)[number]

export type AvailableIntent = {
  intentId: string
  kind: AvailableIntentKind
  label: string
  detail: string
  projectId: string | null
  castingSessionId: string | null
  productionId: string | null
}

export type SubmitIntentCommand = {
  protocolVersion: typeof PROTOCOL_VERSION
  schemaId: string
  sessionId: string
  commandId: string
  expectedStateRevision: number
  type: 'submitIntent'
  payload: { intentId: string }
}

export type ControlEnvelope = {
  protocolVersion: typeof PROTOCOL_VERSION
  schemaId: string
  sessionId: string
  commandId: string
  expectedStateRevision: number
}

export type RejectionCode =
  | 'INVALID_JSON'
  | 'INVALID_COMMAND'
  | 'INVALID_CONTROL'
  | 'PROTOCOL_MISMATCH'
  | 'SCHEMA_MISMATCH'
  | 'SESSION_MISMATCH'
  | 'STALE_REVISION'
  | 'COMMAND_ID_REUSE'
  | 'INTENT_NOT_AVAILABLE'
  | 'ENGINE_REJECTED'
  | 'NO_SAVE'
  | 'SAVE_REJECTED'

export type ValidationFailure = {
  ok: false
  reasonCode: RejectionCode
  message: string
  commandId: string | null
}

export type CommandValidation =
  | { ok: true; command: SubmitIntentCommand }
  | ValidationFailure

export type ControlValidation =
  | { ok: true; control: ControlEnvelope }
  | ValidationFailure

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort()
  const expected = [...keys].sort()
  return actual.length === expected.length && actual.every((key, index) => key === expected[index])
}

function commandIdOf(value: unknown): string | null {
  return isRecord(value) && typeof value.commandId === 'string' ? value.commandId : null
}

function validateVersionedRecord(
  value: unknown,
  invalidCode: 'INVALID_COMMAND' | 'INVALID_CONTROL',
): ValidationFailure | null {
  const commandId = commandIdOf(value)
  if (!isRecord(value)) {
    return { ok: false, reasonCode: invalidCode, message: 'Envelope must be a JSON object.', commandId }
  }
  if (value.protocolVersion !== PROTOCOL_VERSION) {
    return {
      ok: false,
      reasonCode: 'PROTOCOL_MISMATCH',
      message: `Bridge protocol ${String(value.protocolVersion)} is unsupported; expected ${String(PROTOCOL_VERSION)}.`,
      commandId,
    }
  }
  if (value.schemaId !== SCHEMA_ID) {
    return {
      ok: false,
      reasonCode: 'SCHEMA_MISMATCH',
      message: 'Bridge schema identity does not match the running TypeScript authority.',
      commandId,
    }
  }
  return null
}

function validIdentityFields(value: Record<string, unknown>): boolean {
  return (
    typeof value.sessionId === 'string' && value.sessionId.length > 0 &&
    typeof value.commandId === 'string' && value.commandId.length > 0 &&
    Number.isSafeInteger(value.expectedStateRevision) &&
    (value.expectedStateRevision as number) >= 0
  )
}

export function validateCommand(value: unknown): CommandValidation {
  const failed = validateVersionedRecord(value, 'INVALID_COMMAND')
  if (failed !== null) return failed
  const record = value as Record<string, unknown>
  const commandId = commandIdOf(value)
  if (!exactKeys(record, BRIDGE_CONTRACT.commandEnvelope.exact)) {
    return { ok: false, reasonCode: 'INVALID_COMMAND', message: 'Command envelope has missing or unknown fields.', commandId }
  }
  if (!validIdentityFields(record) || record.type !== 'submitIntent' || !isRecord(record.payload)) {
    return { ok: false, reasonCode: 'INVALID_COMMAND', message: 'Command identity, revision, type, or payload is invalid.', commandId }
  }
  if (!exactKeys(record.payload, BRIDGE_CONTRACT.commandEnvelope.payloadExact) ||
      typeof record.payload.intentId !== 'string' || record.payload.intentId.length === 0) {
    return { ok: false, reasonCode: 'INVALID_COMMAND', message: 'submitIntent payload must contain one non-empty intentId.', commandId }
  }
  return {
    ok: true,
    command: {
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: record.sessionId as string,
      commandId: record.commandId as string,
      expectedStateRevision: record.expectedStateRevision as number,
      type: 'submitIntent',
      payload: { intentId: record.payload.intentId },
    },
  }
}

export function validateControl(value: unknown): ControlValidation {
  const failed = validateVersionedRecord(value, 'INVALID_CONTROL')
  if (failed !== null) return failed
  const record = value as Record<string, unknown>
  const commandId = commandIdOf(value)
  if (!exactKeys(record, BRIDGE_CONTRACT.controlEnvelope.exact) || !validIdentityFields(record)) {
    return { ok: false, reasonCode: 'INVALID_CONTROL', message: 'Control envelope has missing, unknown, or invalid fields.', commandId }
  }
  return {
    ok: true,
    control: {
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: record.sessionId as string,
      commandId: record.commandId as string,
      expectedStateRevision: record.expectedStateRevision as number,
    },
  }
}
