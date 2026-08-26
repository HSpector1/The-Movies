import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import {
  BRIDGE_SCHEMA,
  PROJECTION_VERSION,
  PROTOCOL_VERSION,
} from '../bridge/schema/bridge-schema.ts'
import { canonicalJsonPretty, schemaIdentity } from '../bridge/schema/canonical.ts'

type Schema = Record<string, unknown>

const root = process.cwd()
const schemaPath = resolve(root, 'bridge/schema/project-studio-bridge.schema.json')
const csharpPath = resolve(root, 'generated/unity/StudioBridgeDtos.Generated.cs')
const checkOnly = process.argv.includes('--check')

function argumentValue(name: string): string | null {
  const index = process.argv.indexOf(name)
  if (index < 0) return null
  const value = process.argv[index + 1]
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`${name} requires a path.`)
  }
  return value
}

const unityProject = argumentValue('--unity-project') ?? process.env.PROJECT_STUDIO_UNITY_PROJECT ?? null
const unityCsharpPath = unityProject === null
  ? null
  : resolve(unityProject, 'Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs')

function asSchema(value: unknown, context: string): Schema {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Expected schema object at ${context}.`)
  }
  return value as Schema
}

const definitions = asSchema(BRIDGE_SCHEMA.$defs, '$defs')

function ordinal(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function resolveSchema(schema: Schema): Schema {
  const reference = schema['$ref']
  if (typeof reference !== 'string') return schema
  const prefix = '#/$defs/'
  if (!reference.startsWith(prefix)) throw new Error(`Unsupported reference ${reference}.`)
  return asSchema(definitions[reference.slice(prefix.length)], reference)
}

function definitionName(schema: Schema): string | null {
  const reference = schema['$ref']
  if (typeof reference === 'string') return reference.slice('#/$defs/'.length)
  const name = schema['x-csharp-name']
  return typeof name === 'string' ? name : null
}

function nullablePart(schema: Schema): { schema: Schema; nullable: boolean } {
  const alternatives = schema['anyOf']
  if (!Array.isArray(alternatives)) return { schema, nullable: false }
  const nonNull = alternatives
    .map((entry, index) => asSchema(entry, `anyOf[${String(index)}]`))
    .filter((entry) => entry['type'] !== 'null')
  if (nonNull.length === 1 && nonNull.length !== alternatives.length) {
    return { schema: nonNull[0]!, nullable: true }
  }
  return { schema, nullable: false }
}

function csharpType(input: Schema, optional: boolean): string {
  const nullable = nullablePart(input)
  const schema = nullable.schema
  const referenceName = definitionName(schema)
  if (typeof schema['$ref'] === 'string' && referenceName !== null) return referenceName
  if (Array.isArray(schema['anyOf'])) {
    const unionName = definitionName(schema)
    if (unionName === null) throw new Error('Anonymous non-null union cannot be emitted to C#.')
    return unionName
  }
  const type = schema['type'] ?? typeof schema['const']
  if (type === 'array') {
    return `${csharpType(asSchema(schema['items'], 'items'), false)}[]`
  }
  if (type === 'object') {
    if (referenceName === null) throw new Error('Anonymous object cannot be emitted to C#.')
    return referenceName
  }
  if (type === 'string') return 'string'
  if (type === 'boolean') return optional || nullable.nullable ? 'bool?' : 'bool'
  if (type === 'integer') return optional || nullable.nullable ? 'int?' : 'int'
  if (type === 'number') return optional || nullable.nullable ? 'double?' : 'double'
  throw new Error(`Unsupported C# schema type ${String(type)}.`)
}

function objectShape(input: Schema): { properties: Record<string, Schema>; required: Set<string> } {
  const schema = resolveSchema(input)
  if (schema['type'] === 'object') {
    const rawProperties = asSchema(schema['properties'], 'properties')
    return {
      properties: Object.fromEntries(
        Object.entries(rawProperties).map(([key, value]) => [key, asSchema(value, `properties.${key}`)]),
      ),
      required: new Set((schema['required'] as string[] | undefined) ?? []),
    }
  }
  const alternatives = schema['anyOf']
  if (!Array.isArray(alternatives)) throw new Error('DTO definition is neither an object nor an object union.')
  const shapes = alternatives.map((entry, index) => objectShape(asSchema(entry, `anyOf[${String(index)}]`)))
  const propertyNames = [...new Set(shapes.flatMap((shape) => Object.keys(shape.properties)))].sort(ordinal)
  const properties: Record<string, Schema> = {}
  for (const name of propertyNames) {
    const candidates = shapes.flatMap((shape) => shape.properties[name] === undefined ? [] : [shape.properties[name]!])
    const constants = [...new Set(candidates.flatMap((candidate) =>
      candidate['const'] === undefined ? [] : [candidate['const']],
    ))]
    if (constants.length > 1) {
      // Literal-discriminant merge across members (e.g. a per-member `kind`/`type`
      // literal): unchanged. This is not a nullability collision.
      properties[name] = { type: typeof constants[0], enum: constants }
      continue
    }
    // "First member wins" for the property's TYPE/$ref is a documented limitation
    // (no full polymorphism in the flattened C# DTO). But requiredness/nullability
    // must be the LOOSEST across every member that declares this property: if ANY
    // member allows null for it, the merged field must allow null too, or a legal
    // value from a later member throws during Unity-side deserialization.
    const merged = candidates[0]!
    const anyMemberAllowsNull = candidates.some((candidate) => nullablePart(candidate).nullable)
    properties[name] = anyMemberAllowsNull && !nullablePart(merged).nullable
      ? { anyOf: [merged, { type: 'null' }] }
      : merged
  }
  const required = new Set(propertyNames.filter((name) => shapes.every((shape) => shape.required.has(name))))
  return { properties, required }
}

function pascalCase(value: string): string {
  const normalized = value
    .replace(/[^A-Za-z0-9]+(.)/g, (_match: string, next: string) => next.toUpperCase())
    .replace(/^[a-z]/, (first) => first.toUpperCase())
  return /^[0-9]/.test(normalized) ? `Value${normalized}` : normalized
}

function csharpString(value: string): string {
  return JSON.stringify(value)
}

function emitCanonicalSchemaConstants(schemaJson: string): string[] {
  const chunkSize = 3_000
  const chunks: string[] = []
  for (let offset = 0; offset < schemaJson.length; offset += chunkSize) {
    chunks.push(schemaJson.slice(offset, offset + chunkSize))
  }
  return [
    ...chunks.map((chunk, index) =>
      `        private const string CanonicalSchemaJsonPart${String(index)} = ${csharpString(chunk)};`,
    ),
    '',
    '        public static readonly string CanonicalSchemaJson =',
    ...chunks.map((_, index) =>
      `            CanonicalSchemaJsonPart${String(index)}${index === chunks.length - 1 ? ';' : ' +'}`,
    ),
  ]
}

function enumValues(input: Schema): string[] {
  const schema = resolveSchema(nullablePart(input).schema)
  if (Array.isArray(schema['enum']) && schema['enum'].every((entry) => typeof entry === 'string')) {
    return schema['enum'] as string[]
  }
  if (typeof schema['const'] === 'string') return [schema['const']]
  return []
}

function emitVocabulary(className: string, fieldName: string, schema: Schema): string[] {
  const values = enumValues(schema)
  if (values.length === 0) return []
  const typeName = `${className}${pascalCase(fieldName)}Values`
  return [
    `    public static class ${typeName}`,
    '    {',
    ...values.map((value) => `        public const string ${pascalCase(value)} = ${csharpString(value)};`),
    '    }',
    '',
  ]
}

function emitClass(definitionKey: string, schema: Schema): { dto: string[]; vocabulary: string[] } {
  const className = definitionName(schema) ?? definitionKey
  const shape = objectShape(schema)
  const propertyNames = Object.keys(shape.properties).sort(ordinal)
  const dto = [
    '    [Serializable]',
    '    [JsonObject(MemberSerialization.OptIn)]',
    `    public sealed partial class ${className}`,
    '    {',
  ]
  const vocabulary: string[] = []
  for (const name of propertyNames) {
    const propertySchema = shape.properties[name]!
    const required = shape.required.has(name)
    const nullable = nullablePart(propertySchema).nullable
    const requiredMode = required
      ? nullable ? 'AllowNull' : 'Always'
      : nullable ? 'Default' : 'DisallowNull'
    const nullHandling = required && nullable
      ? ', NullValueHandling = NullValueHandling.Include'
      : !required ? ', NullValueHandling = NullValueHandling.Ignore' : ''
    const type = csharpType(propertySchema, !required)
    const initialization = type.endsWith('[]') ? ` = Array.Empty<${type.slice(0, -2)}>();` : ';'
    dto.push(`        [JsonProperty(${csharpString(name)}, Required = Required.${requiredMode}${nullHandling})]`)
    dto.push(`        public ${type} ${name}${initialization}`)
    dto.push('')
    vocabulary.push(...emitVocabulary(className, name, propertySchema))
  }
  if (dto[dto.length - 1] === '') dto.pop()
  dto.push('    }', '')
  return { dto, vocabulary }
}

function generateCsharp(): string {
  const identity = schemaIdentity(BRIDGE_SCHEMA)
  const canonicalSchema = canonicalJsonPretty(BRIDGE_SCHEMA).trimEnd()
  const classes: string[] = []
  const vocabularies: string[] = []
  for (const definitionKey of Object.keys(definitions).sort(ordinal)) {
    const emitted = emitClass(definitionKey, asSchema(definitions[definitionKey], definitionKey))
    classes.push(...emitted.dto)
    vocabularies.push(...emitted.vocabulary)
  }
  return [
    '// <auto-generated>',
    '// Generated by npm run generate:bridge-contract. Do not edit by hand.',
    `// Schema identity: ${identity}`,
    '// </auto-generated>',
    '',
    'using System;',
    'using System.Globalization;',
    'using Newtonsoft.Json;',
    'using Newtonsoft.Json.Converters;',
    '',
    'namespace Studio.Runtime.Data',
    '{',
    '    public static partial class StudioBridgeContract',
    '    {',
    `        public const int ProtocolVersion = ${String(PROTOCOL_VERSION)};`,
    `        public const int ProjectionVersion = ${String(PROJECTION_VERSION)};`,
    '        public const int SnapshotVersion = ProjectionVersion;',
    `        public const string SchemaId = ${csharpString(identity)};`,
    '',
    ...emitCanonicalSchemaConstants(canonicalSchema),
    '',
    '        public static JsonSerializerSettings CreateStrictJsonSettings() =>',
    '            new JsonSerializerSettings',
    '            {',
    '                MissingMemberHandling = MissingMemberHandling.Error,',
    '                NullValueHandling = NullValueHandling.Include,',
    '                DefaultValueHandling = DefaultValueHandling.Include,',
    '                ObjectCreationHandling = ObjectCreationHandling.Replace,',
    '                TypeNameHandling = TypeNameHandling.None,',
    '                MetadataPropertyHandling = MetadataPropertyHandling.Ignore,',
    '                DateParseHandling = DateParseHandling.None,',
    '                FloatParseHandling = FloatParseHandling.Double,',
    '                Culture = CultureInfo.InvariantCulture,',
    '                CheckAdditionalContent = true,',
    '                MaxDepth = 128,',
    '                Converters = { new StringEnumConverter() },',
    '            };',
    '',
    '        public static void RequireCompatible(int protocolVersion, string schemaId, int projectionVersion)',
    '        {',
    '            if (protocolVersion != ProtocolVersion)',
    '                throw new StudioSnapshotFormatException($"Bridge protocol mismatch: expected {ProtocolVersion}, received {protocolVersion}.");',
    '            if (!string.Equals(schemaId, SchemaId, StringComparison.Ordinal))',
    '                throw new StudioSnapshotFormatException($"Bridge schema mismatch: expected {SchemaId}, received {schemaId ?? \"<null>\"}.");',
    '            if (projectionVersion != ProjectionVersion)',
    '                throw new StudioSnapshotFormatException($"Bridge projection mismatch: expected {ProjectionVersion}, received {projectionVersion}.");',
    '        }',
    '    }',
    '',
    ...vocabularies,
    ...classes,
    '}',
    '',
  ].join('\n')
}

async function checkOrWrite(path: string, expected: string): Promise<boolean> {
  if (!checkOnly) {
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, expected, 'utf8')
    console.log(`generated ${path}`)
    return true
  }
  let actual: string
  try {
    actual = await readFile(path, 'utf8')
  } catch {
    console.error(`missing generated artifact: ${path}`)
    return false
  }
  if (actual !== expected) {
    console.error(`generated artifact is stale: ${path}`)
    return false
  }
  console.log(`verified ${path}`)
  return true
}

const outputs = [
  checkOrWrite(schemaPath, canonicalJsonPretty(BRIDGE_SCHEMA)),
  checkOrWrite(csharpPath, generateCsharp()),
]
if (unityCsharpPath !== null) outputs.push(checkOrWrite(unityCsharpPath, generateCsharp()))
const results = await Promise.all(outputs)

if (results.some((result) => !result)) process.exitCode = 1
