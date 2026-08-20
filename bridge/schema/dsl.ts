export type JsonSchema<T = unknown> = Readonly<Record<string, unknown>> & {
  readonly __wireType?: T
}

export type InferSchema<TSchema extends JsonSchema> =
  TSchema extends JsonSchema<infer TValue> ? TValue : never

type OptionalProperty<TSchema extends JsonSchema> = {
  readonly optional: true
  readonly schema: TSchema
}

type PropertySchema = JsonSchema | OptionalProperty<JsonSchema>

type RequiredPropertyKeys<TProperties extends Record<string, PropertySchema>> = {
  [TKey in keyof TProperties]: TProperties[TKey] extends OptionalProperty<JsonSchema>
    ? never
    : TKey
}[keyof TProperties]

type OptionalPropertyKeys<TProperties extends Record<string, PropertySchema>> = {
  [TKey in keyof TProperties]: TProperties[TKey] extends OptionalProperty<JsonSchema>
    ? TKey
    : never
}[keyof TProperties]

type PropertyValue<TProperty extends PropertySchema> =
  TProperty extends OptionalProperty<infer TSchema>
    ? InferSchema<TSchema>
    : TProperty extends JsonSchema
      ? InferSchema<TProperty>
      : never

type ObjectValue<TProperties extends Record<string, PropertySchema>> = {
  [TKey in RequiredPropertyKeys<TProperties>]: PropertyValue<TProperties[TKey]>
} & {
  [TKey in OptionalPropertyKeys<TProperties>]?: PropertyValue<TProperties[TKey]>
}

type NumericOptions = {
  minimum?: number
  maximum?: number
}

type StringOptions = {
  minLength?: number
  pattern?: string
}

export function text(options: StringOptions = {}): JsonSchema<string> {
  return { type: 'string', ...options }
}

export function enumeration<const TValues extends readonly string[]>(
  values: TValues,
): JsonSchema<TValues[number]> {
  return { type: 'string', enum: values }
}

export function literal<const TValue extends string | number | boolean>(
  value: TValue,
): JsonSchema<TValue> {
  const type = typeof value === 'number' && Number.isInteger(value) ? 'integer' : typeof value
  return { const: value, type }
}

export function integer(options: NumericOptions = {}): JsonSchema<number> {
  return {
    type: 'integer',
    minimum: options.minimum ?? -2_147_483_648,
    maximum: options.maximum ?? 2_147_483_647,
  }
}

export function number(options: NumericOptions = {}): JsonSchema<number> {
  return { type: 'number', ...options }
}

export function boolean(): JsonSchema<boolean> {
  return { type: 'boolean' }
}

export function array<TItemSchema extends JsonSchema>(
  items: TItemSchema,
): JsonSchema<Array<InferSchema<TItemSchema>>> {
  return { type: 'array', items }
}

export function nullable<TSchema extends JsonSchema>(
  schema: TSchema,
): JsonSchema<InferSchema<TSchema> | null> {
  return { anyOf: [schema, { type: 'null' }] }
}

export function union<const TSchemas extends readonly JsonSchema[]>(
  csharpName: string,
  schemas: TSchemas,
): JsonSchema<InferSchema<TSchemas[number]>> {
  return { anyOf: schemas, 'x-csharp-name': csharpName }
}

export function optional<TSchema extends JsonSchema>(
  schema: TSchema,
): OptionalProperty<TSchema> {
  return { optional: true, schema }
}

export function object<const TProperties extends Record<string, PropertySchema>>(
  csharpName: string,
  properties: TProperties,
): JsonSchema<ObjectValue<TProperties>> {
  const entries = Object.entries(properties)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
  const required = entries
    .filter(([, property]) => !('optional' in property))
    .map(([name]) => name)
  const wireProperties = Object.fromEntries(
    entries.map(([name, property]) => [
      name,
      'optional' in property ? property.schema : property,
    ]),
  )
  return {
    type: 'object',
    properties: wireProperties,
    required,
    additionalProperties: false,
    'x-csharp-name': csharpName,
  }
}

export function reference<TSchema extends JsonSchema>(
  definitionName: string,
  _schema: TSchema,
): JsonSchema<InferSchema<TSchema>> {
  return { $ref: `#/$defs/${definitionName}` }
}
