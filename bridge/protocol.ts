import {
  AVAILABLE_INTENT_KEYS,
  AVAILABLE_INTENT_KINDS,
  BRIDGE_SCHEMA,
  PROJECTION_VERSION,
  PROTOCOL_VERSION,
  REJECTION_CODES,
  type BridgeAvailableIntent,
  type BridgeControlEnvelope,
  type BridgeRejectionCode,
  type BridgeSubmitIntentCommand,
} from './schema/bridge-schema.ts'
import { schemaIdentity } from './schema/canonical.ts'
import { BridgeSchemaError, parseWireValue } from './schema/runtime.ts'

export {
  AVAILABLE_INTENT_KEYS,
  AVAILABLE_INTENT_KINDS,
  BRIDGE_SCHEMA,
  PROJECTION_VERSION,
  PROTOCOL_VERSION,
  REJECTION_CODES,
}

/** Backwards-compatible export name for the canonical JSON Schema document. */
export const BRIDGE_CONTRACT = BRIDGE_SCHEMA
export const SNAPSHOT_VERSION = PROJECTION_VERSION
export const SCHEMA_ID = schemaIdentity(BRIDGE_SCHEMA)

export type AvailableIntentKind = BridgeAvailableIntent['kind']
export type AvailableIntent = BridgeAvailableIntent
export type SubmitIntentCommand = BridgeSubmitIntentCommand
export type ControlEnvelope = BridgeControlEnvelope
export type RejectionCode = BridgeRejectionCode

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

function invalidEnvelope(
  error: unknown,
  reasonCode: 'INVALID_COMMAND' | 'INVALID_CONTROL',
  commandId: string | null,
): ValidationFailure {
  const detail = error instanceof BridgeSchemaError ? error.message : 'wire schema validation failed'
  return {
    ok: false,
    reasonCode,
    message: `${reasonCode === 'INVALID_COMMAND' ? 'Command' : 'Control'} envelope is invalid: ${detail}.`,
    commandId,
  }
}

export function validateCommand(value: unknown): CommandValidation {
  const failed = validateVersionedRecord(value, 'INVALID_COMMAND')
  if (failed !== null) return failed
  try {
    return {
      ok: true,
      command: parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeIntentRequest, value),
    }
  } catch (error) {
    return invalidEnvelope(error, 'INVALID_COMMAND', commandIdOf(value))
  }
}

export function validateControl(value: unknown): ControlValidation {
  const failed = validateVersionedRecord(value, 'INVALID_CONTROL')
  if (failed !== null) return failed
  try {
    return {
      ok: true,
      control: parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeControlRequest, value),
    }
  } catch (error) {
    return invalidEnvelope(error, 'INVALID_CONTROL', commandIdOf(value))
  }
}
