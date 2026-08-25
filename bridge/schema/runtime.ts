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
      try {
        matches.push(project(schemaRecord(alternative, `${path}.oneOf`), value, path, options))
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
      try {
        return project(schemaRecord(alternative, `${path}.anyOf`), value, path, options)
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
      assertConstraints(schema, value as number, path)
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
    lot: section('StudioLotProjection', 'lot'),
    productions: section('StudioProductionsProjection', 'productions'),
    people: section('StudioPeopleProjection', 'people'),
    construction: section('StudioConstructionProjection', 'construction'),
    journeyNotices: section('StudioJourneyNoticesProjection', 'journeyNotices'),
    releaseResults: section('StudioReleaseResultsProjection', 'releaseResults'),
    development: section('StudioDevelopmentProjection', 'development'),
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
