import {
  BRIDGE_SCHEMA,
  StudioLotSnapshotSchema,
  StudioProjectionBundleSchema,
  type BridgeStudioLotSnapshot,
  type BridgeStudioProjectionBundle,
} from './bridge-schema.ts'
import type { InferSchema, JsonSchema } from './dsl.ts'

type SchemaRecord = Record<string, unknown>

export class BridgeSchemaError extends Error {
  constructor(
    readonly wirePath: string,
    message: string,
  ) {
    super(`${wirePath}: ${message}`)
    this.name = 'BridgeSchemaError'
  }
}

type ProjectionOptions = {
  stripAdditionalProperties: boolean
}

function schemaRecord(value: unknown, context: string): SchemaRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Invalid bridge schema at ${context}.`)
  }
  return value as SchemaRecord
}

function valueRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new BridgeSchemaError(path, 'expected an object')
  }
  return value as Record<string, unknown>
}

function resolveReference(schema: SchemaRecord): SchemaRecord {
  const reference = schema['$ref']
  if (typeof reference !== 'string') return schema
  const prefix = '#/$defs/'
  if (!reference.startsWith(prefix)) throw new Error(`Unsupported bridge schema reference ${reference}.`)
  const name = reference.slice(prefix.length)
  const definitions = schemaRecord(BRIDGE_SCHEMA.$defs, '$defs')
  const resolved = definitions[name]
  if (resolved === undefined) throw new Error(`Unknown bridge schema definition ${name}.`)
  return schemaRecord(resolved, reference)
}

function assertConstraints(schema: SchemaRecord, value: string | number, path: string): void {
  if (typeof value === 'string') {
    const minLength = schema['minLength']
    if (typeof minLength === 'number' && value.length < minLength) {
      throw new BridgeSchemaError(path, `expected at least ${String(minLength)} character(s)`)
    }
    const pattern = schema['pattern']
    if (typeof pattern === 'string' && !new RegExp(pattern).test(value)) {
      throw new BridgeSchemaError(path, `does not match ${pattern}`)
    }
    return
  }
  const minimum = schema['minimum']
  if (typeof minimum === 'number' && value < minimum) {
    throw new BridgeSchemaError(path, `expected a value >= ${String(minimum)}`)
  }
  const maximum = schema['maximum']
  if (typeof maximum === 'number' && value > maximum) {
    throw new BridgeSchemaError(path, `expected a value <= ${String(maximum)}`)
  }
}

const hasOwn = (record: Record<string, unknown>, key: string): boolean => Object.prototype.hasOwnProperty.call(record, key)

/**
 * The first refusal `project` would throw for `value` against `schema`, read without throwing, projecting or
 * building anything: `undefined` when every check this walk can settle passes (the full projection may still refuse
 * deeper), a message when the projection would refuse here. Exact by construction: it repeats `project`'s own checks
 * in `project`'s own order (reference, const, enum, type, required, additional properties, then each present property
 * in declaration order) and stops at the first property it cannot settle completely (an array or object, a constrained
 * string or number), so a message it returns is the one the projection would throw. Union probing uses it so a
 * discriminated alternative that does not match costs one comparison, not a thrown error and a partial projection:
 * the schema runtime spent a quarter of the bridge-p12 campaign-library time constructing refused-alternative errors
 * (playtest-response measure-r1 CPU profile).
 */
export function firstRefusal(unresolvedSchema: SchemaRecord, value: unknown, path: string, options: ProjectionOptions): string | undefined {
  const schema = resolveReference(unresolvedSchema)
  if (Array.isArray(schema['oneOf']) || Array.isArray(schema['anyOf'])) return undefined
  if ('const' in schema) return value === schema['const'] ? undefined : `${path}: expected literal ${JSON.stringify(schema['const'])}`
  const enumValues = schema['enum']
  if (Array.isArray(enumValues)) return enumValues.includes(value) ? undefined : `${path}: expected one of ${enumValues.map(String).join(', ')}`
  switch (schema['type']) {
    case 'null': return value === null ? undefined : `${path}: expected null`
    case 'string': return typeof value === 'string' ? undefined : `${path}: expected a string`
    case 'boolean': return typeof value === 'boolean' ? undefined : `${path}: expected a boolean`
    case 'integer': return Number.isSafeInteger(value) ? undefined : `${path}: expected a safe integer`
    case 'number': return typeof value === 'number' && Number.isFinite(value) ? undefined : `${path}: expected a finite number`
    case 'array': return Array.isArray(value) ? undefined : `${path}: expected an array`
    case 'object': {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) return `${path}: expected an object`
      const record = value as Record<string, unknown>
      const properties = schema['properties']
      const required = schema['required']
      // A malformed required list is a plain Error in `project`, which escapes a union; never settle it here (review FIX-1 item 3).
      if (typeof properties !== 'object' || properties === null || !Array.isArray(required) || !required.every((key) => typeof key === 'string')) return undefined
      for (const key of required as string[]) {
        if (!hasOwn(record, key) || record[key] === undefined) return `${path}.${key}: required property is missing`
      }
      if (!options.stripAdditionalProperties && schema['additionalProperties'] === false) {
        const unknown = Object.keys(record).find((key) => !hasOwn(properties as Record<string, unknown>, key))
        if (unknown !== undefined) return `${path}.${unknown}: additional properties are not allowed`
      }
      for (const [key, propertySchema] of Object.entries(properties as SchemaRecord)) {
        if (!hasOwn(record, key) || record[key] === undefined) continue
        const property = resolveReference(schemaRecord(propertySchema, `${path}.${key}`))
        const refusal = firstRefusal(property, record[key], `${path}.${key}`, options)
        if (refusal !== undefined) return refusal
        // Settled completely only for a literal, an enumeration, null, a boolean or an unconstrained safe int32 or
        // finite number or string; anything else may still refuse deeper, so the walk stops here.
        if (!settledCompletely(property, record[key])) return undefined
      }
      return undefined
    }
    default: return undefined
  }
}

/** Whether a passing `firstRefusal` on this resolved schema is the whole of `project`'s checks for `value`. */
function settledCompletely(schema: SchemaRecord, value: unknown): boolean {
  if (Array.isArray(schema['oneOf']) || Array.isArray(schema['anyOf'])) return false
  // A literal or an enumeration still runs its type's checks after the value matched (an untyped const falls to the
  // `default` below and is never settled), so the type switch decides (review FIX-1 item 3).
  switch (schema['type']) {
    case 'null': case 'boolean': return true
    case 'string': return schema['minLength'] === undefined && schema['pattern'] === undefined
    case 'number': return schema['minimum'] === undefined && schema['maximum'] === undefined
    case 'integer': return schema['minimum'] === undefined && schema['maximum'] === undefined
      && (value as number) <= 2147483647 && (value as number) >= -2147483648
    default: return false
  }
}

function project(
  unresolvedSchema: SchemaRecord,
  value: unknown,
  path: string,
  options: ProjectionOptions,
): unknown {
  const schema = resolveReference(unresolvedSchema)
  const exclusiveAlternatives = schema['oneOf']
  if (Array.isArray(exclusiveAlternatives)) {
    const matches: unknown[] = []
    const failures: string[] = []
    for (const alternative of exclusiveAlternatives) {
      const resolved = schemaRecord(alternative, `${path}.oneOf`)
      const refusal = firstRefusal(resolved, value, path, options)
      if (refusal !== undefined) {
        failures.push(refusal)
        continue
      }
      try {
        matches.push(project(resolved, value, path, options))
      } catch (error) {
        if (!(error instanceof BridgeSchemaError)) throw error
        failures.push(error.message)
      }
    }
    if (matches.length === 1) return matches[0]
    if (matches.length === 0) {
      throw new BridgeSchemaError(path, `matched no allowed shape (${failures.join('; ')})`)
    }
    throw new BridgeSchemaError(path, `matched ${String(matches.length)} mutually exclusive shapes`)
  }
  const alternatives = schema['anyOf']
  if (Array.isArray(alternatives)) {
    const failures: string[] = []
    for (const alternative of alternatives) {
      const resolved = schemaRecord(alternative, `${path}.anyOf`)
      const refusal = firstRefusal(resolved, value, path, options)
      if (refusal !== undefined) {
        failures.push(refusal)
        continue
      }
      try {
        return project(resolved, value, path, options)
      } catch (error) {
        if (!(error instanceof BridgeSchemaError)) throw error
        failures.push(error.message)
      }
    }
    throw new BridgeSchemaError(path, `matched no allowed type (${failures.join('; ')})`)
  }

  if ('const' in schema && value !== schema['const']) {
    throw new BridgeSchemaError(path, `expected literal ${JSON.stringify(schema['const'])}`)
  }
  const enumValues = schema['enum']
  if (Array.isArray(enumValues) && !enumValues.includes(value)) {
    throw new BridgeSchemaError(path, `expected one of ${enumValues.map(String).join(', ')}`)
  }

  switch (schema['type']) {
    case 'null':
      if (value !== null) throw new BridgeSchemaError(path, 'expected null')
      return null
    case 'string':
      if (typeof value !== 'string') throw new BridgeSchemaError(path, 'expected a string')
      assertConstraints(schema, value, path)
      return value
    case 'boolean':
      if (typeof value !== 'boolean') throw new BridgeSchemaError(path, 'expected a boolean')
      return value
    case 'integer':
      if (!Number.isSafeInteger(value)) throw new BridgeSchemaError(path, 'expected a safe integer')
      // A declared bound answers first, with its own message: every schema `integer()` (dsl.ts)
      // already carries the int32 bounds the generated C# consumer reads (`int`). The range check
      // below is the floor for a hand-written schema that declares none (stabilization 2026-10-22, L-24).
      assertConstraints(schema, value as number, path)
      if ((value as number) > 2147483647 || (value as number) < -2147483648) {
        throw new BridgeSchemaError(path, 'expected a 32-bit integer (the published C# consumer types every integer as int)')
      }
      return value
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new BridgeSchemaError(path, 'expected a finite number')
      }
      assertConstraints(schema, value, path)
      return value
    case 'array': {
      if (!Array.isArray(value)) throw new BridgeSchemaError(path, 'expected an array')
      const itemSchema = schemaRecord(schema['items'], `${path}.items`)
      return value.map((entry, index) => project(itemSchema, entry, `${path}[${String(index)}]`, options))
    }
    case 'object': {
      const record = valueRecord(value, path)
      const properties = schemaRecord(schema['properties'], `${path}.properties`)
      const required = schema['required']
      if (!Array.isArray(required) || !required.every((entry) => typeof entry === 'string')) {
        throw new Error(`Bridge object schema at ${path} has no valid required list.`)
      }
      for (const key of required) {
        if (!Object.prototype.hasOwnProperty.call(record, key) || record[key] === undefined) {
          throw new BridgeSchemaError(`${path}.${key}`, 'required property is missing')
        }
      }
      if (!options.stripAdditionalProperties && schema['additionalProperties'] === false) {
        const unknown = Object.keys(record).find(
          (key) => !Object.prototype.hasOwnProperty.call(properties, key),
        )
        if (unknown !== undefined) {
          throw new BridgeSchemaError(`${path}.${unknown}`, 'additional properties are not allowed')
        }
      }
      const result: Record<string, unknown> = {}
      for (const [key, propertySchema] of Object.entries(properties)) {
        if (!Object.prototype.hasOwnProperty.call(record, key) || record[key] === undefined) continue
        result[key] = project(schemaRecord(propertySchema, `${path}.${key}`), record[key], `${path}.${key}`, options)
      }
      return result
    }
    default:
      throw new Error(`Unsupported bridge schema type ${String(schema['type'])} at ${path}.`)
  }
}

/** `project` under explicit options, for the differential exactness test of `firstRefusal`. */
export function projectForTest(schema: JsonSchema, value: unknown, options: ProjectionOptions): unknown {
  return project(schemaRecord(schema, '$'), value, '$', options)
}

export function parseWireValue<TSchema extends JsonSchema>(
  schema: TSchema,
  value: unknown,
): InferSchema<TSchema> {
  return project(schemaRecord(schema, '$'), value, '$', {
    stripAdditionalProperties: false,
  }) as InferSchema<TSchema>
}

/** Selects only schema-owned Unity fields and validates every selected value. */
export function projectStudioLotSnapshot(value: unknown): BridgeStudioLotSnapshot {
  return project(schemaRecord(StudioLotSnapshotSchema, '$defs.StudioLotSnapshot'), value, '$.snapshot', {
    stripAdditionalProperties: true,
  }) as BridgeStudioLotSnapshot
}

/** Decomposes one broad authoritative selector result into one atomic Unity projection bundle. */
export function projectStudioProjectionBundle(value: unknown): BridgeStudioProjectionBundle {
  const source = valueRecord(value, '$.studioLotSnapshot')
  const section = (
    name: keyof typeof BRIDGE_SCHEMA.$defs,
    wireName: string,
  ): unknown =>
    project(
      schemaRecord(BRIDGE_SCHEMA.$defs[name], `$defs.${name}`),
      source,
      `$.snapshot.${wireName}`,
      { stripAdditionalProperties: true },
    )
  const candidate = {
    industry:section('StudioIndustryProjection','industry'),
    lot: section('StudioLotProjection', 'lot'),
    productions: section('StudioProductionsProjection', 'productions'),
    people: section('StudioPeopleProjection', 'people'),
    construction: section('StudioConstructionProjection', 'construction'),
    journeyNotices: section('StudioJourneyNoticesProjection', 'journeyNotices'),
    releaseResults: section('StudioReleaseResultsProjection', 'releaseResults'),
    development: section('StudioDevelopmentProjection', 'development'),
    casting: section('StudioCastingProjection', 'casting'),
    release: section('StudioReleaseProjection', 'release'),
    history: section('StudioHistoryProjection', 'history'),
    operationsEvents: section('StudioOperationsEventsProjection', 'operationsEvents'),
    finance: section('StudioFinanceProjection', 'finance'),
    talent: section('StudioTalentProjection', 'talent'),
  }
  return project(
    schemaRecord(StudioProjectionBundleSchema, '$defs.StudioProjectionBundle'),
    candidate,
    '$.snapshot',
    { stripAdditionalProperties: false },
  ) as BridgeStudioProjectionBundle
}

export function schemaDefinition(name: keyof typeof BRIDGE_SCHEMA.$defs): JsonSchema {
  return BRIDGE_SCHEMA.$defs[name]
}
