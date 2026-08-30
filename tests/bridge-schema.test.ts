import { readFileSync } from 'node:fs'

import Ajv2020 from 'ajv/dist/2020.js'
import { describe, expect, it } from 'vitest'

import {
  BRIDGE_SCHEMA,
  PROTOCOL_VERSION,
  PROJECTION_VERSION,
  SCHEMA_ID,
} from '../bridge/protocol.ts'
import {
  createBridgeInitialState,
  BridgeSession,
  selectJourneyIntent,
} from '../bridge/session.ts'
import { canonicalJson, canonicalJsonPretty, schemaIdentity } from '../bridge/schema/canonical.ts'
import { StudioLotSnapshotSchema } from '../bridge/schema/bridge-schema.ts'
import { integer, literal, object, text, union } from '../bridge/schema/dsl.ts'
import { applyActions } from '../src/core/index.ts'
import {
  BridgeSchemaError,
  parseWireValue,
  projectStudioLotSnapshot,
  projectStudioProjectionBundle,
} from '../bridge/schema/runtime.ts'
import { studioLotSnapshot } from '../ui/src/engine/adapter.ts'
import { developmentProjection } from '../bridge/development.ts'
import { castingProjection } from '../bridge/casting.ts'

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
      protocolVersion: 4,
      projectionVersion: 11,
      transport: 'http-json-localhost',
    })
    expect(BRIDGE_SCHEMA.$id).toBe('urn:project-studio:bridge:protocol-4:projection-11')
  })

  it('projects a real authoritative snapshot to the exact Unity DTO and validates the full envelope', () => {
    const state = createBridgeInitialState('bridge-schema-live-snapshot')
    // P03A/P04A: the Development and Casting boards join the broad selector
    // result at the bridge boundary (exactly as BridgeSession.snapshotFor composes it).
    const broadSnapshot = {
      ...studioLotSnapshot(state),
      development: developmentProjection(state),
      casting: castingProjection(state),
    }
    const projected = projectStudioLotSnapshot(broadSnapshot)
    const bundle = projectStudioProjectionBundle(broadSnapshot)
    expect(broadSnapshot).toHaveProperty('cash')
    expect(projected).not.toHaveProperty('cash')
    expect(projected).not.toHaveProperty('operationsMode')
    expect(projected.firstFilmJourney.ordinal).toBe(1)
    expect(bundle.journeyNotices.firstFilmJourney).toEqual(projected.firstFilmJourney)
    expect(bundle.lot.property).toEqual(projected.property)
    expect(bundle.productions.productionOperations).toEqual(projected.productionOperations)
    expect(bundle.people.people).toEqual(projected.people)
    expect(bundle.construction.placement).toEqual(projected.placement)
    expect(bundle.releaseResults.releasedFilms).toEqual(projected.releasedFilms)
    expect(bundle.development.development).toEqual(projected.development)
    expect(bundle.casting.casting).toEqual(projected.casting)

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
      BRIDGE_SCHEMA.$defs.StudioProjectionBundle.properties as Record<string, unknown>,
    )
    expect(Object.keys(envelope.snapshot).every((key) => allowedRootKeys.includes(key))).toBe(true)
  })

  it('keeps live location identities in the projection-v4 building namespace', () => {
    const session = new BridgeSession(
      createBridgeInitialState('bridge-schema-location-identities'),
      'bridge-schema-location-identities',
    )
    let envelope = session.snapshot()
    let constructionIdentityFound = false
    const assertLocationIdentities = (candidate: typeof envelope): void => {
      const propertyBuildings = candidate.snapshot.lot.property?.buildings
      const stages = candidate.snapshot.lot.stages
      if (propertyBuildings === undefined || stages === undefined) {
        throw new Error('Managed bridge fixture did not expose property and stage identities.')
      }

      const lotBuildingIds = candidate.snapshot.lot.buildings.map((building) => building.id)
      const propertyBuildingIds = propertyBuildings.map((building) => building.id)
      expect(new Set(lotBuildingIds).size).toBe(lotBuildingIds.length)
      expect(new Set(propertyBuildingIds).size).toBe(propertyBuildingIds.length)
      for (const buildingId of propertyBuildingIds) {
        expect(lotBuildingIds.filter((id) => id === buildingId)).toHaveLength(1)
        expect(buildingId.startsWith('facility-')).toBe(false)
      }

      // `expansion` is authoritative parcel/presentation ground, not a physical body.
      expect(lotBuildingIds.filter((id) => id === 'expansion')).toHaveLength(1)
      expect(propertyBuildingIds).not.toContain('expansion')
      for (const requiredId of ['admin', 'stage-a', 'stage-b', 'post']) {
        expect(propertyBuildingIds.filter((id) => id === requiredId)).toHaveLength(1)
      }

      const stageBuildingIds = stages.map((stage) => stage.buildingId)
      const stageFacilityIds = stages.map((stage) => stage.facilityId)
      expect(new Set(stageBuildingIds).size).toBe(stageBuildingIds.length)
      expect(new Set(stageFacilityIds).size).toBe(stageFacilityIds.length)
      for (const stage of stages) {
        expect(propertyBuildingIds.filter((id) => id === stage.buildingId)).toHaveLength(1)
        expect(stage.buildingId.startsWith('facility-')).toBe(false)
      }

      for (const production of candidate.snapshot.productions.activeProductions) {
        expect(propertyBuildingIds.filter((id) => id === production.stageId)).toHaveLength(1)
        expect(production.stageId.startsWith('facility-')).toBe(false)
      }
      for (const operation of candidate.snapshot.productions.productionOperations) {
        expect(
          propertyBuildingIds.filter((id) => id === operation.locationBuildingId),
        ).toHaveLength(1)
        expect(operation.locationBuildingId.startsWith('facility-')).toBe(false)
      }

      const constructionPlacements =
        candidate.snapshot.construction.placement?.placements ?? []
      const constructionIdentityMatches = constructionPlacements.filter(
        (placement) => placement.facilityId === 'facility-scenery-shop-1',
      )
      if (constructionIdentityMatches.length > 0) {
        expect(constructionIdentityMatches).toHaveLength(1)
        expect(constructionIdentityMatches[0]).toMatchObject({
          id: 1,
          facilityId: 'facility-scenery-shop-1',
        })
        expect(
          propertyBuildings
            .filter((building) => building.placedFacilityId === 1)
            .map((building) => building.id),
        ).toEqual(['placed-1'])
        expect(lotBuildingIds.filter((id) => id === 'placed-1')).toHaveLength(1)
        expect(lotBuildingIds).not.toContain('facility-scenery-shop-1')
        expect(propertyBuildingIds).not.toContain('facility-scenery-shop-1')
        constructionIdentityFound = true
      }

      const buildingIdentityFields = [
        ...propertyBuildingIds,
        ...stageBuildingIds,
        ...candidate.snapshot.productions.activeProductions.map((production) => production.stageId),
        ...candidate.snapshot.productions.productionOperations.map(
          (operation) => operation.locationBuildingId,
        ),
      ]
      expect(buildingIdentityFields).not.toContain('facility-administration')
    }

    assertLocationIdentities(envelope)
    const sceneryConstructionState = applyActions(
      createBridgeInitialState('bridge-schema-scenery-construction-identity'),
      [{
        kind: 'placeFacility',
        placement: {
          blueprintId: 'scenery-shop',
          origin: { gx: 0, gy: 2 },
        },
      }],
    )
    assertLocationIdentities(new BridgeSession(
      sceneryConstructionState,
      'bridge-schema-scenery-construction-identity',
    ).snapshot())
    expect(
      envelope.snapshot.lot.stages
        ?.filter((stage) => stage.facilityId === 'facility-soundstage-07')
        .map(({ buildingId, facilityId }) => ({ buildingId, facilityId })),
    ).toEqual([{
      buildingId: 'stage-a',
      facilityId: 'facility-soundstage-07',
    }])
    expect(
      envelope.snapshot.lot.stages
        ?.filter((stage) => stage.facilityId === 'facility-soundstage-12')
        .map(({ buildingId, facilityId }) => ({ buildingId, facilityId })),
    ).toEqual([{
      buildingId: 'stage-b',
      facilityId: 'facility-soundstage-12',
    }])

    let stageSevenOperationFound = false
    for (let guard = 0; guard < 32; guard++) {
      assertLocationIdentities(envelope)
      const operations = envelope.snapshot.productions.productionOperations ?? []
      if (operations.some((operation) => operation.locationBuildingId === 'stage-a')) {
        stageSevenOperationFound = true
        break
      }

      const intent = selectJourneyIntent(
        envelope.availableIntents,
        envelope.snapshot.journeyNotices.firstFilmJourney,
      )
      if (intent === undefined) {
        throw new Error('Movie #2 did not expose a legal journey intent before reaching Stage 7.')
      }
      const response = session.command({
        protocolVersion: PROTOCOL_VERSION,
        schemaId: SCHEMA_ID,
        sessionId: session.sessionId,
        commandId: `location-identity-${String(guard)}`,
        expectedStateRevision: session.stateRevision,
        type: 'submitIntent',
        payload: { intentId: intent.intentId },
      })
      if (!response.accepted) throw new Error(response.message)
      envelope = response
    }
    expect(stageSevenOperationFound).toBe(true)
    expect(constructionIdentityFound).toBe(true)
  })

  it('owns every legacy projection field exactly once with byte-equivalent schema semantics', () => {
    const ownership: Record<string, Record<string, unknown>> = {
      lot: BRIDGE_SCHEMA.$defs.StudioLotProjection.properties as Record<string, unknown>,
      productions: BRIDGE_SCHEMA.$defs.StudioProductionsProjection.properties as Record<string, unknown>,
      people: BRIDGE_SCHEMA.$defs.StudioPeopleProjection.properties as Record<string, unknown>,
      construction: BRIDGE_SCHEMA.$defs.StudioConstructionProjection.properties as Record<string, unknown>,
      journeyNotices: BRIDGE_SCHEMA.$defs.StudioJourneyNoticesProjection.properties as Record<string, unknown>,
      releaseResults: BRIDGE_SCHEMA.$defs.StudioReleaseResultsProjection.properties as Record<string, unknown>,
      development: BRIDGE_SCHEMA.$defs.StudioDevelopmentProjection.properties as Record<string, unknown>,
      casting: BRIDGE_SCHEMA.$defs.StudioCastingProjection.properties as Record<string, unknown>,
    }
    const fields = Object.values(ownership).flatMap((properties) => Object.keys(properties))
    const legacyFields = Object.keys(StudioLotSnapshotSchema.properties as Record<string, unknown>)
    expect(fields.sort()).toEqual(legacyFields.sort())
    expect(new Set(fields).size).toBe(fields.length)
    for (const properties of Object.values(ownership)) {
      for (const [field, schema] of Object.entries(properties)) {
        expect(schema).toEqual(
          (StudioLotSnapshotSchema.properties as Record<string, unknown>)[field],
        )
      }
    }
  })

  it('rejects missing, additional, wrong-enum, wrong-nullability, and old-projection data', () => {
    const envelope = new BridgeSession(
      createBridgeInitialState('bridge-schema-negative'),
      'bridge-schema-negative',
    ).snapshot()
    const definition = BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse

    const extra = clone(envelope) as typeof envelope & { snapshot: typeof envelope.snapshot & { debug?: boolean } }
    extra.snapshot.journeyNotices.firstFilmJourney = {
      ...extra.snapshot.journeyNotices.firstFilmJourney,
      debug: true,
    } as typeof extra.snapshot.journeyNotices.firstFilmJourney
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
    wrongNull.snapshot.lot.studioName = null as unknown as string
    expect(() => parseWireValue(definition, wrongNull)).toThrow(/expected a string/)

    const int32Overflow = clone(envelope)
    int32Overflow.stateRevision = 2_147_483_648
    expect(() => parseWireValue(definition, int32Overflow)).toThrow(/<= 2147483647/)

    const oldProjection = { ...clone(envelope), snapshotVersion: 5 }
    expect(PROJECTION_VERSION).toBe(11)
    expect(() => parseWireValue(definition, oldProjection)).toThrow(/expected literal 11/)

    const missingSection = clone(envelope)
    delete (missingSection.snapshot as Partial<typeof missingSection.snapshot>).releaseResults
    expect(() => parseWireValue(definition, missingSection)).toThrow(/required property is missing/)

    const legacyFlat = clone(envelope) as typeof envelope & { snapshot: typeof envelope.snapshot & { studioName?: string } }
    legacyFlat.snapshot.studioName = legacyFlat.snapshot.lot.studioName
    expect(() => parseWireValue(definition, legacyFlat)).toThrow(/additional properties are not allowed/)
  })

  it('preserves required nullable numeric fields through schema projection', () => {
    const envelope = clone(new BridgeSession(
      createBridgeInitialState('bridge-schema-nullable-numbers'),
      'bridge-schema-nullable-numbers',
    ).snapshot())
    const snapshot = envelope.snapshot
    const presencePerson = snapshot.people.presence?.people[0]
    const firstSet = snapshot.lot.sets?.[0]
    const firstCatalog = snapshot.construction.placement.catalog[0]
    if (presencePerson === undefined || firstSet === undefined || firstCatalog === undefined) {
      throw new Error('Managed bridge fixture did not expose nullable-number DTOs.')
    }
    presencePerson.slot = null
    firstSet.completesWeek = null
    firstCatalog.maxInstances = null
    if (snapshot.journeyNotices.weekTheater === undefined) {
      throw new Error('Managed bridge fixture did not expose week theater.')
    }
    snapshot.journeyNotices.weekTheater.subjects.push({
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
      beats: Array.from({ length: snapshot.journeyNotices.weekTheater.beatsPerWeek }, () => 'idle' as const),
    })

    const parsed = parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, envelope)
    expect(parsed.snapshot.people.presence?.people[0]?.slot).toBeNull()
    expect(parsed.snapshot.lot.sets?.[0]?.completesWeek).toBeNull()
    expect(parsed.snapshot.construction.placement.catalog[0]?.maxInstances).toBeNull()
    expect(parsed.snapshot.journeyNotices.weekTheater?.subjects.at(-1)?.distance).toBeNull()

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
    expect(BRIDGE_SCHEMA.$defs.StudioBridgeAcceptedCommandResponse.properties).not.toHaveProperty(
      'rejection',
    )
    expect(() => parseWireValue(
      BRIDGE_SCHEMA.$defs.StudioBridgeAcceptedCommandResponse,
      { ...accepted, rejection: null },
    )).toThrow(/additional properties are not allowed/)
    expect(BRIDGE_SCHEMA.$defs).not.toHaveProperty('StudioBridgeLoadResponse')
  })

  it('requires one closed structured rejection with non-empty guidance and a nullable holder', () => {
    const session = new BridgeSession(
      createBridgeInitialState('bridge-schema-rejection'),
      'bridge-schema-rejection',
    )
    const rejected = session.protocolReject(
      'rejected-command',
      'STALE_REVISION',
      'Authority moved.',
    )
    const responseSchema = BRIDGE_SCHEMA.$defs.StudioBridgeRejectedResponse
    const factsSchema = BRIDGE_SCHEMA.$defs.StudioBridgeRejection

    expect(responseSchema.required).toContain('rejection')
    expect(factsSchema.additionalProperties).toBe(false)
    expect(factsSchema.required).toEqual(['blocker', 'category', 'currentHolder', 'remedy'])
    expect(() => parseWireValue(responseSchema, rejected)).not.toThrow()
    expect(() => parseWireValue(BRIDGE_SCHEMA, rejected)).not.toThrow()

    const missingRejection = clone(rejected) as Partial<typeof rejected>
    delete missingRejection.rejection
    expect(() => parseWireValue(responseSchema, missingRejection)).toThrow(/required property is missing/)

    for (const field of ['blocker', 'remedy'] as const) {
      const missingGuidance = clone(rejected) as unknown as {
        rejection: Record<string, unknown>
      }
      delete missingGuidance.rejection[field]
      expect(() => parseWireValue(responseSchema, missingGuidance)).toThrow(
        /required property is missing/,
      )

      const nullGuidance = clone(rejected) as unknown as {
        rejection: Record<string, unknown>
      }
      nullGuidance.rejection[field] = null
      expect(() => parseWireValue(responseSchema, nullGuidance)).toThrow(/expected a string/)

      const blankGuidance = clone(rejected) as unknown as {
        rejection: Record<string, unknown>
      }
      blankGuidance.rejection[field] = ''
      expect(() => parseWireValue(responseSchema, blankGuidance)).toThrow(/at least 1 character/)
    }

    const missingHolder = clone(rejected)
    delete (missingHolder.rejection as Partial<typeof missingHolder.rejection>).currentHolder
    expect(() => parseWireValue(responseSchema, missingHolder)).toThrow(/required property is missing/)

    const additional = clone(rejected) as typeof rejected & {
      rejection: typeof rejected.rejection & { inferredCapacity?: number }
    }
    additional.rejection.inferredCapacity = 0
    expect(() => parseWireValue(responseSchema, additional)).toThrow(
      /additional properties are not allowed/,
    )

    const wrongCategory = clone(rejected)
    wrongCategory.rejection.category = 'capacity' as typeof wrongCategory.rejection.category
    expect(() => parseWireValue(responseSchema, wrongCategory)).toThrow(/expected one of/)

    const emptyMessage = clone(rejected)
    emptyMessage.message = ''
    expect(() => parseWireValue(responseSchema, emptyMessage)).toThrow(/at least 1 character/)

    const requiredNullableHolder = clone(rejected)
    requiredNullableHolder.rejection.currentHolder = null
    expect(() => parseWireValue(responseSchema, requiredNullableHolder)).not.toThrow()
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
      runtimeInstanceId: 'opaque-process-incarnation-01',
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

    for (const [name, definition, envelope] of [
      ['session', BRIDGE_SCHEMA.$defs.StudioBridgeSessionResponse, session],
      ['health', BRIDGE_SCHEMA.$defs.StudioBridgeHealthResponse, { ...session, status: 'ok' as const }],
    ] as const) {
      const missing = clone(envelope) as Record<string, unknown>
      delete missing['runtimeInstanceId']
      expect(
        () => parseWireValue(definition, missing),
        `${name} must require runtimeInstanceId`,
      ).toThrow(/required property is missing/)

      expect(
        () => parseWireValue(definition, { ...envelope, runtimeInstanceId: '' }),
        `${name} must reject a blank runtimeInstanceId`,
      ).toThrow(/at least 1 character/)

      expect(
        () => parseWireValue(definition, { ...envelope, runtimeInstanceIdAlias: 'forged' }),
        `${name} must remain closed`,
      ).toThrow(/additional properties are not allowed/)
    }

    for (const definition of [
      BRIDGE_SCHEMA.$defs.StudioBridgeIntentRequest,
      BRIDGE_SCHEMA.$defs.StudioBridgeControlRequest,
      BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse,
      BRIDGE_SCHEMA.$defs.StudioBridgeAcceptedCommandResponse,
      BRIDGE_SCHEMA.$defs.StudioBridgeSaveResponse,
      BRIDGE_SCHEMA.$defs.StudioBridgeRejectedResponse,
      BRIDGE_SCHEMA.$defs.StudioBridgeContractResponse,
    ]) {
      expect(definition.properties).not.toHaveProperty('runtimeInstanceId')
    }
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
    expect(generatedCsharp).toContain('public const int ProtocolVersion = 4;')
    expect(generatedCsharp).toContain('public const int ProjectionVersion = 11;')
    expect(generatedCsharp).toContain('public int protocolVersion;')
    expect(generatedCsharp).toContain('public int snapshotVersion;')
    expect(generatedCsharp.match(/public string runtimeInstanceId;/g)).toHaveLength(2)
    expect(generatedCsharp).toContain('public int? slot;')
    expect(generatedCsharp).toContain('public int? completesWeek;')
    expect(generatedCsharp).toContain('public double? distance;')
    expect(generatedCsharp).toContain('public int? maxInstances;')
    expect(generatedCsharp).toContain('public sealed partial class StudioProjectionBundle')
    expect(generatedCsharp).not.toContain('public sealed partial class StudioLotSnapshot')
    expect(generatedCsharp).toContain('public static readonly string CanonicalSchemaJson')
    expect(generatedCsharp).not.toContain('class StudioBridgeLoadResponse')
    expect(generatedCsharp).toContain('public sealed partial class StudioBridgeRejection')
    expect(generatedCsharp).toContain('public static class StudioBridgeRejectionCategoryValues')
    expect(generatedCsharp).toContain('public StudioBridgeRejection rejection;')
    expect(generatedCsharp).toContain(
      '[JsonProperty("blocker", Required = Required.Always)]',
    )
    expect(generatedCsharp).toContain(
      '[JsonProperty("currentHolder", Required = Required.AllowNull, NullValueHandling = NullValueHandling.Include)]',
    )
    expect(generatedCsharp).toContain(
      '[JsonProperty("remedy", Required = Required.Always)]',
    )
    // CF-08: the quote response is a closed discriminated base with concrete
    // commission/casting members. Member-specific nullability remains on its
    // member rather than being widened across an aggregate.
    expect(generatedCsharp).toContain('public abstract partial class StudioQuoteSnapshot')
    expect(generatedCsharp).toContain(
      'public sealed partial class StudioCommissionQuoteSnapshot : StudioQuoteSnapshot',
    )
    expect(generatedCsharp).toContain(
      'public sealed partial class StudioCastingQuoteSnapshot : StudioQuoteSnapshot',
    )
    expect(generatedCsharp).toContain('public sealed class StudioQuoteSnapshotJsonConverter')
    expect(generatedCsharp).toContain(
      '[JsonProperty("noFeeLine", Required = Required.AllowNull, NullValueHandling = NullValueHandling.Include)]',
    )
    expect(generatedCsharp).toContain(
      '[JsonProperty("noFeeLine", Required = Required.Always)]',
    )
    expect(generatedCsharp).toContain(
      'public sealed partial class StudioQuoteCastingRequest : StudioBridgeQuoteRequest',
    )
    expect(generatedCsharp).toContain('public StudioCastingDraftPayload draft;')
    expect(generatedCsharp).toContain(
      'public sealed partial class StudioQuoteCommissionRequest : StudioBridgeQuoteRequest',
    )
    expect(generatedCsharp).toContain('public StudioCommissionDraftPayload draft;')
    expect(generatedCsharp).toContain(
      'public sealed partial class StudioAssignShootingDirectorCommand : StudioProductionCommandSnapshot',
    )
  })

  // P04A Lane B STEP 1: the quote request/response seam (§2.1) needs a real
  // top-level `union(...)` of object alternatives distinguished ONLY by a
  // literal `type` field (the `StudioProductionCommandSnapshot` precedent).
  // `parseWireValue`'s `anyOf` handling (bridge/schema/runtime.ts) was never
  // exercised by an existing test with more than one object alternative, so
  // this is the required spike/proof that it actually dispatches — not just
  // declares — before any casting schema work depends on it.
  describe('parseWireValue anyOf dispatch on a discriminated object union (P04A Lane B Step 1 spike)', () => {
    const AlphaMember = object('ProbeAlpha', {
      type: literal('alpha'),
      alphaOnly: text({ minLength: 1 }),
    })
    const BetaMember = object('ProbeBeta', {
      type: literal('beta'),
      betaOnly: integer({ minimum: 0 }),
    })
    const ProbeUnion = union('ProbeUnion', [AlphaMember, BetaMember])

    it('dispatches each member by its literal discriminant and preserves its own fields', () => {
      expect(parseWireValue(ProbeUnion, { type: 'alpha', alphaOnly: 'hello' })).toEqual({
        type: 'alpha',
        alphaOnly: 'hello',
      })
      expect(parseWireValue(ProbeUnion, { type: 'beta', betaOnly: 7 })).toEqual({
        type: 'beta',
        betaOnly: 7,
      })
    })

    it('rejects a value matching neither member', () => {
      expect(() => parseWireValue(ProbeUnion, { type: 'gamma', alphaOnly: 'x' })).toThrow(
        BridgeSchemaError,
      )
    })

    it('rejects a mixed member carrying fields from both alternatives', () => {
      // additionalProperties: false on BOTH members means a value carrying the
      // other member's field can match neither closed shape.
      expect(() =>
        parseWireValue(ProbeUnion, { type: 'alpha', alphaOnly: 'hello', betaOnly: 7 }),
      ).toThrow(BridgeSchemaError)
      expect(() =>
        parseWireValue(ProbeUnion, { type: 'beta', betaOnly: 7, alphaOnly: 'hello' }),
      ).toThrow(BridgeSchemaError)
    })

    it('rejects a member whose discriminant is right but whose own field is malformed', () => {
      expect(() => parseWireValue(ProbeUnion, { type: 'alpha', alphaOnly: '' })).toThrow(
        BridgeSchemaError,
      )
      expect(() => parseWireValue(ProbeUnion, { type: 'beta', betaOnly: -1 })).toThrow(
        BridgeSchemaError,
      )
    })
  })

  // P04A Lane B STEP 5: closed-union coverage for the real casting members —
  // not the probe schema above, the ACTUAL registered `StudioBridgeQuoteRequest`
  // (commission | casting) and `StudioQuoteSnapshot` (commission | casting)
  // unions, plus the kind-discriminant, nullable-by-kind `StudioCastingDraftPayload`.
  describe('P04A casting schema — closed union coverage', () => {
    const envelope = {
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: 'session-1',
      commandId: 'command-1',
      expectedStateRevision: 0,
    }
    const commissionDraft = {
      source: 'market' as const,
      conceptId: 'concept-0001',
      genre: null,
      writerId: 'talent-writer',
      opening: 'slowSetup' as const,
      midpoint: 'revelation' as const,
      ending: 'bittersweet' as const,
      intendedSegments: ['adult' as const],
      intimacyCenter: 1,
      tonalWeightCenter: 1,
      kineticEnergyCenter: 1,
    }
    const screenTestDraft = {
      kind: 'screenTest' as const,
      projectId: 'script-0001',
      slateLead: ['talent-0001', 'talent-0002'],
      slateAntagonist: ['talent-0001', 'talent-0003'],
      slateSupport: ['talent-0002', 'talent-0003'],
      directorId: null,
      castLead: null,
      castAntagonist: null,
      castSupport: null,
      craftLeadId: null,
      budgetNegative: null,
      budgetMarketing: null,
    }
    const greenlightDraft = {
      kind: 'greenlightPackage' as const,
      projectId: 'script-0001',
      slateLead: null,
      slateAntagonist: null,
      slateSupport: null,
      directorId: 'talent-0004',
      castLead: 'talent-0001',
      castAntagonist: 'talent-0002',
      castSupport: 'talent-0003',
      craftLeadId: 'talent-0005',
      budgetNegative: 1_000_000,
      budgetMarketing: 200_000,
    }

    it('validates a quoteCommission and a quoteCasting request through the SAME StudioBridgeQuoteRequest union', () => {
      const commissionRequest = { ...envelope, type: 'quoteCommission', draft: commissionDraft }
      const screenTestRequest = { ...envelope, type: 'quoteCasting', draft: screenTestDraft }
      const greenlightRequest = { ...envelope, type: 'quoteCasting', draft: greenlightDraft }
      expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteRequest, commissionRequest)).toEqual(
        commissionRequest,
      )
      expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteRequest, screenTestRequest)).toEqual(
        screenTestRequest,
      )
      expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteRequest, greenlightRequest)).toEqual(
        greenlightRequest,
      )
    })

    it('rejects a request carrying an extra key on either union member', () => {
      const withExtra = { ...envelope, type: 'quoteCasting', draft: screenTestDraft, extra: true }
      expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteRequest, withExtra)).toThrow(
        BridgeSchemaError,
      )
      const draftWithExtra = { ...screenTestDraft, extraField: 1 }
      const withDraftExtra = { ...envelope, type: 'quoteCasting', draft: draftWithExtra }
      expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteRequest, withDraftExtra)).toThrow(
        BridgeSchemaError,
      )
    })

    it('rejects a request whose `type` and `draft` shape disagree (mixed member)', () => {
      const mismatched = { ...envelope, type: 'quoteCommission', draft: screenTestDraft }
      expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteRequest, mismatched)).toThrow(
        BridgeSchemaError,
      )
      const reversed = { ...envelope, type: 'quoteCasting', draft: commissionDraft }
      expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteRequest, reversed)).toThrow(
        BridgeSchemaError,
      )
    })

    it('StudioCastingDraftPayload keeps every by-kind field REQUIRED (nullable, never optional)', () => {
      expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioCastingDraftPayload, screenTestDraft)).toEqual(
        screenTestDraft,
      )
      expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioCastingDraftPayload, greenlightDraft)).toEqual(
        greenlightDraft,
      )
      const { slateLead: _omitted, ...missingSlateLead } = screenTestDraft
      expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioCastingDraftPayload, missingSlateLead)).toThrow(
        BridgeSchemaError,
      )
      const { craftLeadId: _omitted2, ...missingCraftLeadId } = greenlightDraft
      expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioCastingDraftPayload, missingCraftLeadId)).toThrow(
        BridgeSchemaError,
      )
    })

    it('validates a commission AND a casting quote through the SAME StudioQuoteSnapshot union, closed and burn/runway-free', () => {
      const commissionQuote = {
        intentId: 'intent-1',
        kind: 'commissionScreenplay',
        commitLabel: 'Commission screenplay',
        startsNow: true,
        queues: false,
        title: 'Some Title',
        writerName: 'Writer',
        draftWeeks: 4,
        reviewWeek: 10,
        consequence: 'One week passes.',
        paceNote: null,
        richnessNote: null,
        officeUpliftLine: null,
        noFeeLine: 'No fee.',
        queueNote: null,
      }
      const screenTestQuote = {
        intentId: 'intent-2',
        kind: 'startAuditions',
        commitLabel: 'Start camera tests',
        startsNow: true,
        queues: false,
        projectId: 'script-0001',
        title: 'Some Title',
        weekLine: 'Camera tests conclude at week 5.',
        slotLine: 'Uses one shared Development & Casting slot.',
        noFeeLine: 'No casting fee is charged.',
        noHoldLine: 'No hold.',
        uniquePeople: 3,
        negative: null,
        marketing: null,
        freelancerFees: null,
        totalImmediate: null,
        cashBefore: null,
        cashAfter: null,
        affordable: null,
        strongestAssignmentLine: null,
        weakestAssignmentLine: null,
        forecastLine: null,
        setDemandLine: null,
        queueNote: null,
      }
      const greenlightQuote = {
        intentId: 'intent-3',
        kind: 'greenlightPicture',
        commitLabel: 'Greenlight picture',
        startsNow: true,
        queues: false,
        projectId: 'script-0001',
        title: 'Some Title',
        weekLine: null,
        slotLine: null,
        noFeeLine: null,
        noHoldLine: null,
        uniquePeople: null,
        negative: 1_000_000,
        marketing: 200_000,
        freelancerFees: 50_000,
        totalImmediate: 1_250_000,
        cashBefore: 5_000_000,
        cashAfter: 3_750_000,
        affordable: true,
        strongestAssignmentLine: 'Strongest: Director Some Director — Fit 80/100.',
        weakestAssignmentLine: 'Weakest: Support Some Actor — Fit 40/100.',
        forecastLine: 'Forecast profit: $1 to $2 (expected $3).',
        setDemandLine: 'Adequately funded.',
        queueNote: null,
      }
      expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioQuoteSnapshot, commissionQuote)).toEqual(commissionQuote)
      expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioQuoteSnapshot, screenTestQuote)).toEqual(screenTestQuote)
      expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioQuoteSnapshot, greenlightQuote)).toEqual(greenlightQuote)

      // Structurally closed: neither member — nor the union — tolerates a
      // burn/runway/recurring-delta field even if a caller tried to add one.
      const withBurn = { ...greenlightQuote, weeklyBurn: 100 }
      expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioQuoteSnapshot, withBurn)).toThrow(
        BridgeSchemaError,
      )
      const withRunway = { ...greenlightQuote, runwayWeeks: 10 }
      expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioQuoteSnapshot, withRunway)).toThrow(
        BridgeSchemaError,
      )
    })
  })
})
