import { readFileSync } from 'node:fs'

import Ajv2020 from 'ajv/dist/2020.js'
import { describe, expect, it } from 'vitest'

import {
  BRIDGE_SCHEMA,
  PROJECTION_VERSION,
  SCHEMA_ID,
} from '../bridge/protocol.ts'
import { createBridgeInitialState, BridgeSession } from '../bridge/session.ts'
import { canonicalJson, canonicalJsonPretty, schemaIdentity } from '../bridge/schema/canonical.ts'
import {
  parseWireValue,
  projectStudioLotSnapshot,
} from '../bridge/schema/runtime.ts'
import { studioLotSnapshot } from '../ui/src/engine/adapter.ts'

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function assertEveryObjectIsClosed(value: unknown): void {
  if (Array.isArray(value)) {
    for (const entry of value) assertEveryObjectIsClosed(entry)
    return
  }
  if (typeof value !== 'object' || value === null) return
  const schema = value as Record<string, unknown>
  if (schema['type'] === 'object') expect(schema['additionalProperties']).toBe(false)
  for (const entry of Object.values(schema)) assertEveryObjectIsClosed(entry)
}

describe('canonical Unity bridge schema', () => {
  it('uses fixed ordinal key order, including non-ASCII keys, independent of insertion order', () => {
    const left = { 'é': 4, z: 2, 'ä': 3, a: { 'β': 2, a: 1 } }
    const right = { a: { a: 1, 'β': 2 }, 'ä': 3, z: 2, 'é': 4 }
    expect(canonicalJson(left)).toBe('{"a":{"a":1,"β":2},"z":2,"ä":3,"é":4}')
    expect(canonicalJson(right)).toBe(canonicalJson(left))
    expect(schemaIdentity(right)).toBe(schemaIdentity(left))
  })

  it('hashes the complete canonical contract and changes on structural wire drift', () => {
    expect(SCHEMA_ID).toBe(schemaIdentity(BRIDGE_SCHEMA))
    expect(SCHEMA_ID).toMatch(/^sha256:[0-9a-f]{64}$/)
    expect(schemaIdentity({ ...BRIDGE_SCHEMA, title: 'drift' })).not.toBe(SCHEMA_ID)
    expect(schemaIdentity({
      ...BRIDGE_SCHEMA,
      $defs: {
        ...BRIDGE_SCHEMA.$defs,
        StudioBridgeIntentOption: {
          ...BRIDGE_SCHEMA.$defs.StudioBridgeIntentOption,
          additionalProperties: true,
        },
      },
    })).not.toBe(SCHEMA_ID)
  })

  it('closes every declared object recursively and publishes explicit protocol metadata', () => {
    assertEveryObjectIsClosed(BRIDGE_SCHEMA)
    expect(BRIDGE_SCHEMA['x-project-studio']).toMatchObject({
      protocolVersion: 2,
      projectionVersion: 3,
      transport: 'http-json-localhost',
    })
  })

  it('projects a real authoritative snapshot to the exact Unity DTO and validates the full envelope', () => {
    const state = createBridgeInitialState('bridge-schema-live-snapshot')
    const broadSnapshot = studioLotSnapshot(state)
    const projected = projectStudioLotSnapshot(broadSnapshot)
    expect(broadSnapshot).toHaveProperty('cash')
    expect(projected).not.toHaveProperty('cash')
    expect(projected).not.toHaveProperty('operationsMode')
    expect(projected.firstFilmJourney.ordinal).toBe(1)

    const session = new BridgeSession(state, 'bridge-schema-session')
    const envelope = session.snapshot()
    expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, envelope)).not.toThrow()
    expect(() => parseWireValue(BRIDGE_SCHEMA, envelope)).not.toThrow()
    const ajv = new Ajv2020({ strict: true })
    ajv.addKeyword({ keyword: 'x-csharp-name' })
    ajv.addKeyword({ keyword: 'x-project-studio' })
    const validate = ajv.compile(BRIDGE_SCHEMA)
    expect(validate(envelope), JSON.stringify(validate.errors)).toBe(true)
    const allowedRootKeys = Object.keys(
      BRIDGE_SCHEMA.$defs.StudioLotSnapshot.properties as Record<string, unknown>,
    )
    expect(Object.keys(envelope.snapshot).every((key) => allowedRootKeys.includes(key))).toBe(true)
  })

  it('rejects missing, additional, wrong-enum, wrong-nullability, and old-projection data', () => {
    const envelope = new BridgeSession(
      createBridgeInitialState('bridge-schema-negative'),
      'bridge-schema-negative',
    ).snapshot()
    const definition = BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse

    const extra = clone(envelope) as typeof envelope & { snapshot: typeof envelope.snapshot & { debug?: boolean } }
    extra.snapshot.firstFilmJourney = {
      ...extra.snapshot.firstFilmJourney,
      debug: true,
    } as typeof extra.snapshot.firstFilmJourney
    expect(() => parseWireValue(definition, extra)).toThrow(/additional properties are not allowed/)

    const prototypeShadow = clone(envelope) as typeof envelope & { constructor?: string }
    prototypeShadow.constructor = 'shadow-contract'
    expect(() => parseWireValue(definition, prototypeShadow)).toThrow(/additional properties are not allowed/)

    const missing = clone(envelope)
    delete (missing as Partial<typeof missing>).stateDigest
    expect(() => parseWireValue(definition, missing)).toThrow(/required property is missing/)

    const wrongEnum = clone(envelope)
    wrongEnum.availableIntents[0]!.kind = 'not-an-intent' as typeof wrongEnum.availableIntents[0]['kind']
    expect(() => parseWireValue(definition, wrongEnum)).toThrow(/expected one of/)

    const wrongNull = clone(envelope)
    wrongNull.snapshot.studioName = null as unknown as string
    expect(() => parseWireValue(definition, wrongNull)).toThrow(/expected a string/)

    const int32Overflow = clone(envelope)
    int32Overflow.stateRevision = 2_147_483_648
    expect(() => parseWireValue(definition, int32Overflow)).toThrow(/<= 2147483647/)

    const oldProjection = { ...clone(envelope), snapshotVersion: 2 }
    expect(PROJECTION_VERSION).toBe(3)
    expect(() => parseWireValue(definition, oldProjection)).toThrow(/expected literal 3/)
  })

  it('preserves required nullable numeric fields through schema projection', () => {
    const envelope = clone(new BridgeSession(
      createBridgeInitialState('bridge-schema-nullable-numbers'),
      'bridge-schema-nullable-numbers',
    ).snapshot())
    const snapshot = envelope.snapshot
    const presencePerson = snapshot.presence?.people[0]
    const firstSet = snapshot.sets?.[0]
    const firstCatalog = snapshot.placement.catalog[0]
    if (presencePerson === undefined || firstSet === undefined || firstCatalog === undefined) {
      throw new Error('Managed bridge fixture did not expose nullable-number DTOs.')
    }
    presencePerson.slot = null
    firstSet.completesWeek = null
    firstCatalog.maxInstances = null
    if (snapshot.weekTheater === undefined) {
      throw new Error('Managed bridge fixture did not expose week theater.')
    }
    snapshot.weekTheater.subjects.push({
      kind: 'stage-dark',
      id: 'nullable-distance-fixture',
      facilityId: null,
      facilityName: null,
      productionId: null,
      productionTitle: null,
      phase: null,
      setId: null,
      weeksRemaining: null,
      distance: null,
      reason: null,
      beats: Array.from({ length: snapshot.weekTheater.beatsPerWeek }, () => 'idle' as const),
    })

    const parsed = parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, envelope)
    expect(parsed.snapshot.presence?.people[0]?.slot).toBeNull()
    expect(parsed.snapshot.sets?.[0]?.completesWeek).toBeNull()
    expect(parsed.snapshot.placement.catalog[0]?.maxInstances).toBeNull()
    expect(parsed.snapshot.weekTheater?.subjects.at(-1)?.distance).toBeNull()

    const overflow = clone(envelope)
    overflow.stateRevision = 2_147_483_648
    expect(() => parseWireValue(
      BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse,
      overflow,
    )).toThrow(/expected a value <= 2147483647/)
  })

  it('models accepted load/command responses as one flat projection envelope', () => {
    const snapshot = new BridgeSession(
      createBridgeInitialState('bridge-schema-flat-response'),
      'bridge-schema-flat-response',
    ).snapshot()
    const accepted = {
      ...snapshot,
      commandId: 'load-1',
      accepted: true as const,
      message: 'Loaded.',
      processingMs: 0,
    }
    expect(() => parseWireValue(
      BRIDGE_SCHEMA.$defs.StudioBridgeAcceptedCommandResponse,
      accepted,
    )).not.toThrow()
    expect(BRIDGE_SCHEMA.$defs.StudioBridgeAcceptedCommandResponse.required).toContain('snapshot')
    expect(BRIDGE_SCHEMA.$defs).not.toHaveProperty('StudioBridgeLoadResponse')
  })

  it('models the schema discovery response without a self-referential object contract', () => {
    const response = {
      schemaId: SCHEMA_ID,
      contractJson: canonicalJson(BRIDGE_SCHEMA),
    }
    expect(() => parseWireValue(
      BRIDGE_SCHEMA.$defs.StudioBridgeContractResponse,
      response,
    )).not.toThrow()
    expect(JSON.parse(response.contractJson)).toEqual(BRIDGE_SCHEMA)
  })

  it('validates the session and health handshake envelopes', () => {
    const snapshot = new BridgeSession(
      createBridgeInitialState('bridge-schema-handshake'),
      'bridge-schema-handshake',
    ).snapshot()
    const session = {
      protocolVersion: snapshot.protocolVersion,
      schemaId: snapshot.schemaId,
      snapshotVersion: snapshot.snapshotVersion,
      sessionId: snapshot.sessionId,
      stateRevision: snapshot.stateRevision,
      gameWeek: snapshot.gameWeek,
      stateDigest: snapshot.stateDigest,
    }
    expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSessionResponse, session)).not.toThrow()
    expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeHealthResponse, {
      ...session,
      status: 'ok',
    })).not.toThrow()
  })

  it('keeps checked-in JSON and generated C# byte-derived from the canonical schema', () => {
    const checkedInSchema = readFileSync(
      new URL('../bridge/schema/project-studio-bridge.schema.json', import.meta.url),
      'utf8',
    )
    const generatedCsharp = readFileSync(
      new URL('../generated/unity/StudioBridgeDtos.Generated.cs', import.meta.url),
      'utf8',
    )
    expect(checkedInSchema).toBe(canonicalJsonPretty(BRIDGE_SCHEMA))
    expect(generatedCsharp).toContain(`public const string SchemaId = "${SCHEMA_ID}";`)
    expect(generatedCsharp).toContain('public const int ProjectionVersion = 3;')
    expect(generatedCsharp).toContain('public int protocolVersion;')
    expect(generatedCsharp).toContain('public int snapshotVersion;')
    expect(generatedCsharp).toContain('public int? slot;')
    expect(generatedCsharp).toContain('public int? completesWeek;')
    expect(generatedCsharp).toContain('public double? distance;')
    expect(generatedCsharp).toContain('public int? maxInstances;')
    expect(generatedCsharp).toContain('public sealed partial class StudioLotSnapshot')
    expect(generatedCsharp).toContain('public static readonly string CanonicalSchemaJson')
    expect(generatedCsharp).not.toContain('class StudioBridgeLoadResponse')
  })
})
