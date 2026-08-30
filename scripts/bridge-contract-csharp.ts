import { canonicalJson, canonicalJsonPretty, schemaIdentity } from '../bridge/schema/canonical.ts'

export type SchemaNode = Readonly<Record<string, unknown>>
export type SchemaPath = string

export type CSharpContractGenerationErrorCode =
  | 'CF08-ANONYMOUS-MEMBER'
  | 'CF08-ANONYMOUS-UNION'
  | 'CF08-DISCRIMINATOR'
  | 'CF08-DISCRIMINATOR-METADATA'
  | 'CF08-DUPLICATE-LITERAL'
  | 'CF08-IDENTIFIER-COLLISION'
  | 'CF08-INCOMPATIBLE-OBJECT-UNION'
  | 'CF08-MIXED-UNION'
  | 'CF08-NULLABLE'
  | 'CF08-OPEN-OBJECT'
  | 'CF08-REFERENCE'
  | 'CF08-REFERENCE-CYCLE'
  | 'CF08-UNION-INHERITANCE'

export class CSharpContractGenerationError extends Error {
  public readonly code: CSharpContractGenerationErrorCode
  public readonly schemaPath: SchemaPath
  public readonly detail: string

  public constructor(
    code: CSharpContractGenerationErrorCode,
    schemaPath: SchemaPath,
    detail: string,
  ) {
    super(`C# contract generation failed [${code}] at ${schemaPath}: ${detail}`)
    this.name = 'CSharpContractGenerationError'
    this.code = code
    this.schemaPath = schemaPath
    this.detail = detail
  }
}

export type PrimitiveStorageKind = 'string' | 'bool' | 'int' | 'double'

interface StoragePlanBase {
  readonly csharpType: string
  readonly nullable: boolean
  readonly signature: string
  readonly schemaPath: SchemaPath
}

export type CSharpStoragePlan =
  | (StoragePlanBase & {
      readonly kind: 'primitive'
      readonly primitiveKind: PrimitiveStorageKind
      readonly valueType: boolean
    })
  | (StoragePlanBase & {
      readonly kind: 'array'
      readonly item: CSharpStoragePlan
      readonly valueType: false
    })
  | (StoragePlanBase & {
      readonly kind: 'reference'
      readonly definitionName: string
      readonly valueType: false
    })
  | (StoragePlanBase & {
      readonly kind: 'union'
      readonly definitionName: string
      readonly valueType: false
    })

export interface PropertyPlan {
  readonly wireName: string
  readonly schemaPath: SchemaPath
  readonly required: boolean
  readonly storage: CSharpStoragePlan
  readonly vocabularyValues: readonly string[]
  readonly vocabularyValuePaths: readonly SchemaPath[]
}

export interface ObjectPlan {
  readonly definitionName: string
  readonly className: string
  readonly schemaPath: SchemaPath
  readonly properties: readonly PropertyPlan[]
}

export interface DiscriminatedCasePlan {
  readonly definitionName: string
  readonly className: string
  readonly schemaPath: SchemaPath
  readonly discriminatorValues: readonly string[]
  readonly discriminatorValuePaths: readonly SchemaPath[]
  readonly properties: readonly PropertyPlan[]
}

export interface NullableUnionPlan {
  readonly kind: 'nullable'
  readonly schemaPath: SchemaPath
  readonly nonNull: CSharpStoragePlan
}

export interface CompatibleObjectUnionPlan {
  readonly kind: 'compatible-object'
  readonly definitionName: string
  readonly className: string
  readonly schemaPath: SchemaPath
  readonly properties: readonly PropertyPlan[]
}

export interface DiscriminatedObjectUnionPlan {
  readonly kind: 'discriminated-object'
  readonly definitionName: string
  readonly className: string
  readonly schemaPath: SchemaPath
  readonly discriminator: string
  readonly discriminatorPath: SchemaPath
  readonly discriminatorValues: readonly string[]
  readonly discriminatorValuePaths: readonly SchemaPath[]
  readonly promotedProperties: readonly PropertyPlan[]
  readonly cases: readonly DiscriminatedCasePlan[]
}

export type UnionPlan =
  | NullableUnionPlan
  | CompatibleObjectUnionPlan
  | DiscriminatedObjectUnionPlan

export interface ContractPlan {
  readonly definitions: readonly DefinitionPlan[]
  readonly objects: readonly ObjectPlan[]
  readonly unions: readonly (CompatibleObjectUnionPlan | DiscriminatedObjectUnionPlan)[]
}

export type DefinitionPlan =
  | { readonly kind: 'object'; readonly object: ObjectPlan }
  | { readonly kind: 'compatible-object-union'; readonly union: CompatibleObjectUnionPlan }
  | { readonly kind: 'discriminated-object-union'; readonly union: DiscriminatedObjectUnionPlan }

export interface AnalyzeCSharpContractInput {
  readonly schema: SchemaNode
}

export interface GenerateCSharpContractInput extends AnalyzeCSharpContractInput {
  readonly protocolVersion: number
  readonly projectionVersion: number
  readonly namespace?: string
  readonly contractClassName?: string
  readonly generatorCommand?: string
  readonly formatExceptionType?: string
}

interface DefinitionDescriptor {
  readonly key: string
  readonly className: string
  readonly schema: SchemaNode
  readonly path: SchemaPath
}

interface ObjectMemberAnalysis {
  readonly definition: DefinitionDescriptor | null
  readonly schema: SchemaNode
  readonly path: SchemaPath
  readonly properties: readonly PropertyPlan[]
  readonly required: ReadonlySet<string>
}

interface DiscriminatorCandidate {
  readonly propertyName: string
  readonly propertyPath: SchemaPath
  readonly domains: readonly (readonly string[])[]
  readonly domainPaths: readonly (readonly SchemaPath[])[]
  readonly overlap: {
    readonly value: string
    readonly leftPath: SchemaPath
    readonly rightPath: SchemaPath
  } | null
}

interface AnalysisContext {
  readonly root: SchemaNode
  readonly definitions: ReadonlyMap<string, DefinitionDescriptor>
}

interface MemberOwnership {
  readonly union: DiscriminatedObjectUnionPlan
  readonly member: DiscriminatedCasePlan
}

const LOCAL_REFERENCE_PREFIX = '#/$defs/'
const CANONICAL_SCHEMA_CHUNK_SIZE = 3_000
const REFERENCE_ANNOTATION_SIBLINGS = new Set([
  '$comment',
  'contentEncoding',
  'contentMediaType',
  'contentSchema',
  'default',
  'deprecated',
  'description',
  'examples',
  'format',
  'readOnly',
  'title',
  'writeOnly',
])

function ordinal(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function escapePointerSegment(value: string): string {
  return value.replaceAll('~', '~0').replaceAll('/', '~1')
}

function definitionPath(name: string): SchemaPath {
  return `#/$defs/${escapePointerSegment(name)}`
}

function childPath(path: SchemaPath, child: string | number): SchemaPath {
  return `${path}/${typeof child === 'number' ? String(child) : escapePointerSegment(child)}`
}

function fail(
  code: CSharpContractGenerationErrorCode,
  path: SchemaPath,
  detail: string,
): never {
  throw new CSharpContractGenerationError(code, path, detail)
}

function malformedSchema(path: SchemaPath, detail: string): never {
  throw new TypeError(`Invalid C# contract schema at ${path}: ${detail}`)
}

function asSchema(value: unknown, path: SchemaPath): SchemaNode {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return malformedSchema(path, 'expected a JSON Schema object.')
  }
  return value as SchemaNode
}

function asSchemaRecord(value: unknown, path: SchemaPath): Readonly<Record<string, SchemaNode>> {
  const record = asSchema(value, path)
  return Object.fromEntries(
    Object.entries(record).map(([key, entry]) => [key, asSchema(entry, childPath(path, key))]),
  )
}

function asRequiredSet(schema: SchemaNode, path: SchemaPath): ReadonlySet<string> {
  const value = schema['required']
  if (value === undefined) return new Set<string>()
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === 'string')) {
    return malformedSchema(childPath(path, 'required'), 'expected an array of property names.')
  }
  const names = value as string[]
  if (new Set(names).size !== names.length) {
    return malformedSchema(childPath(path, 'required'), 'required property names must be unique.')
  }
  return new Set(names)
}

function exactNullSchema(value: SchemaNode): boolean {
  const entries = Object.entries(value)
  return entries.length === 1 && value['type'] === 'null'
}

export function splitNullableUnion(
  schema: SchemaNode,
  path: SchemaPath,
): { readonly nonNull: SchemaNode; readonly nullable: true } | null {
  const alternatives = schema['anyOf']
  if (!Array.isArray(alternatives)) return null
  const members = alternatives.map((entry, index) => asSchema(entry, childPath(childPath(path, 'anyOf'), index)))
  const nullMembers = members.filter(exactNullSchema)
  if (nullMembers.length === 0) return null
  const nonNullMembers = members.filter((member) => !exactNullSchema(member))
  if (nullMembers.length !== 1 || nonNullMembers.length !== 1 || members.length !== 2) {
    return fail(
      'CF08-NULLABLE',
      childPath(path, 'anyOf'),
      `nullable unions must contain exactly one non-null member and one {"type":"null"} member; found ${String(nonNullMembers.length)} non-null and ${String(nullMembers.length)} null members.`,
    )
  }
  return { nonNull: nonNullMembers[0]!, nullable: true }
}

function normalizedDefinitionName(reference: string, usePath: SchemaPath): string {
  if (!reference.startsWith(LOCAL_REFERENCE_PREFIX)) {
    return fail('CF08-REFERENCE', usePath, `unsupported non-local reference ${JSON.stringify(reference)}.`)
  }
  const encoded = reference.slice(LOCAL_REFERENCE_PREFIX.length)
  if (encoded.length === 0 || encoded.includes('/')) {
    return fail('CF08-REFERENCE', usePath, `unknown local reference ${JSON.stringify(reference)}.`)
  }
  return encoded.replaceAll('~1', '/').replaceAll('~0', '~')
}

function validateReferenceSiblings(schema: SchemaNode, usePath: SchemaPath): void {
  const unsupported = Object.keys(schema)
    .filter((key) => key !== '$ref')
    .filter((key) => !REFERENCE_ANNOTATION_SIBLINGS.has(key) && !key.startsWith('x-'))
    .sort(ordinal)[0]
  if (unsupported === undefined) return
  fail(
    'CF08-REFERENCE',
    childPath(usePath, unsupported),
    `non-annotation $ref sibling ${JSON.stringify(unsupported)} cannot be emitted without changing its Draft 2020-12 semantics.`,
  )
}

function isAnnotationKeyword(key: string): boolean {
  return REFERENCE_ANNOTATION_SIBLINGS.has(key) || key.startsWith('x-')
}

function referenceDescriptor(
  schema: SchemaNode,
  usePath: SchemaPath,
  context: AnalysisContext,
): DefinitionDescriptor | null {
  const reference = schema['$ref']
  if (reference === undefined) return null
  if (typeof reference !== 'string') {
    return fail('CF08-REFERENCE', usePath, 'local $ref must be a string.')
  }
  validateReferenceSiblings(schema, usePath)
  const name = normalizedDefinitionName(reference, usePath)
  const descriptor = context.definitions.get(name)
  if (descriptor === undefined) {
    return fail('CF08-REFERENCE', usePath, `unknown local reference ${JSON.stringify(reference)}.`)
  }
  return descriptor
}

function definitionClassName(key: string, schema: SchemaNode): string {
  const explicit = schema['x-csharp-name']
  if (explicit === undefined) return key
  if (typeof explicit !== 'string' || explicit.length === 0) {
    return malformedSchema(
      childPath(definitionPath(key), 'x-csharp-name'),
      'x-csharp-name must be a non-empty string.',
    )
  }
  return explicit
}

function buildContext(root: SchemaNode): AnalysisContext {
  const rawDefinitions = asSchemaRecord(root['$defs'], '#/$defs')
  const definitions = new Map<string, DefinitionDescriptor>()
  for (const key of Object.keys(rawDefinitions).sort(ordinal)) {
    const schema = rawDefinitions[key]!
    definitions.set(key, {
      key,
      className: definitionClassName(key, schema),
      schema,
      path: definitionPath(key),
    })
  }
  return { root, definitions }
}

function walkReferences(
  schema: SchemaNode,
  path: SchemaPath,
  context: AnalysisContext,
  referenceStack: readonly DefinitionDescriptor[],
): void {
  const referenced = referenceDescriptor(schema, path, context)
  if (referenced !== null) {
    const cycleIndex = referenceStack.findIndex((entry) => entry.key === referenced.key)
    if (cycleIndex >= 0) {
      const cycle = [...referenceStack.slice(cycleIndex).map((entry) => entry.path), referenced.path]
      fail(
        'CF08-REFERENCE-CYCLE',
        path,
        `local reference cycle [${cycle.join(', ')}] cannot be emitted to C#.`,
      )
    }
    walkReferences(referenced.schema, referenced.path, context, [...referenceStack, referenced])
    return
  }
  for (const [key, value] of Object.entries(schema).sort(([left], [right]) => ordinal(left, right))) {
    if (key === '$defs' || key === '$ref' || isAnnotationKeyword(key)) continue
    const valuePath = childPath(path, key)
    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index++) {
        const entry = value[index]
        if (typeof entry === 'object' && entry !== null && !Array.isArray(entry)) {
          walkReferences(entry as SchemaNode, childPath(valuePath, index), context, referenceStack)
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      walkReferences(value as SchemaNode, valuePath, context, referenceStack)
    }
  }
}

function validateAllReferences(context: AnalysisContext): void {
  for (const descriptor of [...context.definitions.values()].sort((left, right) => ordinal(left.path, right.path))) {
    walkReferences(descriptor.schema, descriptor.path, context, [descriptor])
  }
}

function referenceUseSites(context: AnalysisContext): ReadonlyMap<string, readonly SchemaPath[]> {
  const uses = new Map<string, SchemaPath[]>()
  const walk = (schema: SchemaNode, path: SchemaPath): void => {
    const reference = schema['$ref']
    if (typeof reference === 'string' && reference.startsWith(LOCAL_REFERENCE_PREFIX)) {
      const name = normalizedDefinitionName(reference, path)
      const existing = uses.get(name) ?? []
      existing.push(path)
      uses.set(name, existing)
      return
    }
    for (const [key, value] of Object.entries(schema).sort(([left], [right]) => ordinal(left, right))) {
      if (key === '$defs' || isAnnotationKeyword(key)) continue
      const valuePath = childPath(path, key)
      if (Array.isArray(value)) {
        for (let index = 0; index < value.length; index++) {
          const entry = value[index]
          if (typeof entry === 'object' && entry !== null && !Array.isArray(entry)) {
            walk(entry as SchemaNode, childPath(valuePath, index))
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        walk(value as SchemaNode, valuePath)
      }
    }
  }
  for (const definition of context.definitions.values()) walk(definition.schema, definition.path)
  return new Map([...uses.entries()].map(([name, paths]) => [name, [...paths].sort(ordinal)]))
}

function schemaType(schema: SchemaNode): unknown {
  if (schema['type'] !== undefined) return schema['type']
  const constant = schema['const']
  if (constant === undefined) return undefined
  if (typeof constant === 'number' && Number.isInteger(constant)) return 'integer'
  return typeof constant
}

function constraintsSignature(schema: SchemaNode, omittedKeys: ReadonlySet<string>): string {
  const constraints = Object.fromEntries(
    Object.entries(schema)
      .filter(([key]) => !omittedKeys.has(key))
      .sort(([left], [right]) => ordinal(left, right)),
  )
  return canonicalJson(constraints)
}

function withNullable(storage: CSharpStoragePlan, schemaPath: SchemaPath): CSharpStoragePlan {
  return {
    ...storage,
    nullable: true,
    signature: `nullable(${storage.signature})`,
    schemaPath,
  }
}

function emittedStorageType(storage: CSharpStoragePlan): string {
  return `${storage.csharpType}${storage.valueType && storage.nullable ? '?' : ''}`
}

function nullableMemberPath(
  schema: SchemaNode,
  path: SchemaPath,
  nonNull: SchemaNode,
): SchemaPath {
  const alternatives = schema['anyOf'] as readonly unknown[]
  const index = alternatives.findIndex((entry) => entry === nonNull)
  return childPath(childPath(path, 'anyOf'), index)
}

function validateDuplicateStringEnumLiterals(schema: SchemaNode, path: SchemaPath): void {
  const values = schema['enum']
  if (!Array.isArray(values)) return
  const enumPath = childPath(path, 'enum')
  const firstPaths = new Map<string, SchemaPath>()
  for (let index = 0; index < values.length; index++) {
    const value = values[index]
    if (typeof value !== 'string') continue
    const valuePath = childPath(enumPath, index)
    const firstPath = firstPaths.get(value)
    if (firstPath !== undefined) {
      fail(
        'CF08-DUPLICATE-LITERAL',
        valuePath,
        `string enum literal ${JSON.stringify(value)} duplicates ${firstPath}.`,
      )
    }
    firstPaths.set(value, valuePath)
  }
}

function analyzeStorage(
  schema: SchemaNode,
  path: SchemaPath,
  context: AnalysisContext,
): CSharpStoragePlan {
  validateDuplicateStringEnumLiterals(schema, path)
  const nullable = splitNullableUnion(schema, path)
  if (nullable !== null) {
    return withNullable(
      analyzeStorage(nullable.nonNull, nullableMemberPath(schema, path, nullable.nonNull), context),
      path,
    )
  }

  const referenced = referenceDescriptor(schema, path, context)
  if (referenced !== null) {
    const isUnion = Array.isArray(referenced.schema['anyOf']) &&
      splitNullableUnion(referenced.schema, referenced.path) === null
    return {
      kind: isUnion ? 'union' : 'reference',
      csharpType: referenced.className,
      nullable: false,
      signature: `${isUnion ? 'union' : 'ref'}(${referenced.key})`,
      schemaPath: path,
      definitionName: referenced.key,
      valueType: false,
    }
  }

  if (Array.isArray(schema['anyOf'])) {
    const name = schema['x-csharp-name']
    if (typeof name !== 'string' || name.length === 0) {
      return fail(
        'CF08-ANONYMOUS-UNION',
        path,
        'non-null unions require x-csharp-name and emitted named members.',
      )
    }
    const descriptor = context.definitions.get(name)
    if (descriptor === undefined || descriptor.schema !== schema) {
      return fail(
        'CF08-ANONYMOUS-UNION',
        path,
        'non-null unions require x-csharp-name and emitted named members.',
      )
    }
    return {
      kind: 'union',
      csharpType: descriptor.className,
      nullable: false,
      signature: `union(${descriptor.key})`,
      schemaPath: path,
      definitionName: descriptor.key,
      valueType: false,
    }
  }

  const type = schemaType(schema)
  if (type === 'array') {
    const itemsPath = childPath(path, 'items')
    const items = asSchema(schema['items'], itemsPath)
    const item = analyzeStorage(items, itemsPath, context)
    const constraints = constraintsSignature(schema, new Set(['type', 'items', 'x-csharp-name']))
    return {
      kind: 'array',
      csharpType: `${emittedStorageType(item)}[]`,
      nullable: false,
      signature: `array(${item.signature};${constraints})`,
      schemaPath: path,
      item,
      valueType: false,
    }
  }

  const primitive = type === 'string'
    ? { primitiveKind: 'string' as const, csharpType: 'string', valueType: false }
    : type === 'boolean'
      ? { primitiveKind: 'bool' as const, csharpType: 'bool', valueType: true }
      : type === 'integer'
        ? { primitiveKind: 'int' as const, csharpType: 'int', valueType: true }
        : type === 'number'
          ? { primitiveKind: 'double' as const, csharpType: 'double', valueType: true }
          : null
  if (primitive !== null) {
    const constraints = constraintsSignature(schema, new Set(['type', 'x-csharp-name']))
    return {
      kind: 'primitive',
      csharpType: primitive.csharpType,
      nullable: false,
      signature: `${primitive.primitiveKind}(${constraints})`,
      schemaPath: path,
      primitiveKind: primitive.primitiveKind,
      valueType: primitive.valueType,
    }
  }

  if (type === 'object') {
    return malformedSchema(path, 'anonymous object storage cannot be emitted to C#; use a named local $ref.')
  }
  return malformedSchema(path, `unsupported C# schema type ${JSON.stringify(type)}.`)
}

interface StringVocabulary {
  readonly values: readonly string[]
  readonly paths: readonly SchemaPath[]
}

function vocabulary(schema: SchemaNode, path: SchemaPath): StringVocabulary {
  const nullable = splitNullableUnion(schema, path)
  const source = nullable?.nonNull ?? schema
  const sourcePath = nullable === null ? path : nullableMemberPath(schema, path, nullable.nonNull)
  validateDuplicateStringEnumLiterals(source, sourcePath)
  if (Array.isArray(source['enum']) && source['enum'].every((entry) => typeof entry === 'string')) {
    const values = source['enum'] as string[]
    const enumPath = childPath(sourcePath, 'enum')
    return {
      values,
      paths: values.map((_, index) => childPath(enumPath, index)),
    }
  }
  if (typeof source['const'] === 'string') {
    return { values: [source['const']], paths: [childPath(sourcePath, 'const')] }
  }
  return { values: [], paths: [] }
}

function analyzeObjectMember(
  input: SchemaNode,
  usePath: SchemaPath,
  context: AnalysisContext,
): ObjectMemberAnalysis {
  const definition = referenceDescriptor(input, usePath, context)
  const schema = definition?.schema ?? input
  const path = definition?.path ?? usePath
  if (schema['type'] !== 'object') {
    return malformedSchema(path, 'expected an object union member.')
  }
  if (schema['additionalProperties'] !== false) {
    const name = definition?.key ?? String(schema['x-csharp-name'] ?? '<anonymous>')
    return fail(
      'CF08-OPEN-OBJECT',
      path,
      `union object member ${JSON.stringify(name)} must declare additionalProperties:false; open object members cannot be emitted soundly to C#.`,
    )
  }
  const rawProperties = asSchemaRecord(schema['properties'], childPath(path, 'properties'))
  const required = asRequiredSet(schema, path)
  for (const name of required) {
    if (rawProperties[name] === undefined) {
      malformedSchema(childPath(path, 'required'), `required property ${JSON.stringify(name)} is not declared.`)
    }
  }
  const properties = Object.keys(rawProperties).sort(ordinal).map((wireName): PropertyPlan => {
    const propertySchema = rawProperties[wireName]!
    const schemaPath = childPath(childPath(path, 'properties'), wireName)
    const propertyVocabulary = vocabulary(propertySchema, schemaPath)
    return {
      wireName,
      schemaPath,
      required: required.has(wireName),
      storage: analyzeStorage(propertySchema, schemaPath, context),
      vocabularyValues: propertyVocabulary.values,
      vocabularyValuePaths: propertyVocabulary.paths,
    }
  })
  return { definition, schema, path, properties, required }
}

function stringDiscriminatorDomain(schema: SchemaNode, path: SchemaPath): StringVocabulary | null {
  if (splitNullableUnion(schema, path) !== null || schemaType(schema) !== 'string') return null
  const domain = vocabulary(schema, path)
  if (typeof schema['const'] === 'string') return domain
  return Array.isArray(schema['enum']) && schema['enum'].every((entry) => typeof entry === 'string')
    ? domain
    : null
}

function discriminatorCandidates(
  members: readonly ObjectMemberAnalysis[],
): readonly DiscriminatorCandidate[] {
  if (members.length === 0) return []
  const memberProperties = members.map((member) => new Map(member.properties.map((property) => [property.wireName, property])))
  const shared = [...memberProperties[0]!.keys()]
    .filter((name) => memberProperties.every((properties) => properties.has(name)))
    .sort(ordinal)
  const candidates: DiscriminatorCandidate[] = []
  for (const name of shared) {
    if (!members.every((member) => member.required.has(name))) continue
    const domains: (readonly string[])[] = []
    const domainPaths: (readonly SchemaPath[])[] = []
    let valid = true
    for (const member of members) {
      const properties = asSchemaRecord(member.schema['properties'], childPath(member.path, 'properties'))
      const propertyPath = childPath(childPath(member.path, 'properties'), name)
      const domain = stringDiscriminatorDomain(properties[name]!, propertyPath)
      if (domain === null) {
        valid = false
        break
      }
      domains.push(domain.values)
      domainPaths.push(domain.paths)
    }
    if (!valid) continue
    let overlap: DiscriminatorCandidate['overlap'] = null
    const claims = domains.flatMap((domain, memberIndex) =>
      domain.map((value, valueIndex) => ({
        value,
        memberIndex,
        path: domainPaths[memberIndex]![valueIndex]!,
      }))).sort((left, right) => ordinal(left.path, right.path))
    const firstClaims = new Map<string, { readonly memberIndex: number; readonly path: SchemaPath }>()
    for (const claim of claims) {
      const previous = firstClaims.get(claim.value)
      if (previous !== undefined && previous.memberIndex !== claim.memberIndex) {
        overlap = {
          value: claim.value,
          leftPath: previous.path,
          rightPath: claim.path,
        }
        break
      }
      firstClaims.set(claim.value, claim)
    }
    candidates.push({
      propertyName: name,
      propertyPath: members
        .map((member) => childPath(childPath(member.path, 'properties'), name))
        .sort(ordinal)[0]!,
      domains,
      domainPaths,
      overlap,
    })
  }
  return candidates
}

function propertyDescriptor(property: PropertyPlan | undefined): string {
  if (property === undefined) return 'absent'
  const presence = property.required ? 'required' : 'optional'
  const nullable = property.storage.nullable ? ' nullable' : ''
  return `${presence}${nullable} ${property.storage.csharpType}`
}

function propertiesEqual(left: PropertyPlan, right: PropertyPlan): boolean {
  return left.required === right.required && left.storage.signature === right.storage.signature
}

function compatibleUnionProperties(
  union: DefinitionDescriptor,
  members: readonly ObjectMemberAnalysis[],
): readonly PropertyPlan[] {
  const sortedMembers = [...members].sort((left, right) => ordinal(left.path, right.path))
  const names = [...new Set(sortedMembers.flatMap((member) => member.properties.map((property) => property.wireName)))]
    .sort(ordinal)
  for (const name of names) {
    const properties = sortedMembers.map((member) => member.properties.find((property) => property.wireName === name))
    const first = properties[0]
    if (first !== undefined && properties.every((property) => property !== undefined && propertiesEqual(first, property))) {
      continue
    }
    let leftIndex = 0
    let rightIndex = 1
    outer: for (let candidateLeft = 0; candidateLeft < properties.length; candidateLeft++) {
      for (let candidateRight = candidateLeft + 1; candidateRight < properties.length; candidateRight++) {
        const left = properties[candidateLeft]
        const right = properties[candidateRight]
        if (left === undefined || right === undefined || !propertiesEqual(left, right)) {
          leftIndex = candidateLeft
          rightIndex = candidateRight
          break outer
        }
      }
    }
    const leftMember = sortedMembers[leftIndex]!
    const rightMember = sortedMembers[rightIndex]!
    const leftProperty = properties[leftIndex]
    const rightProperty = properties[rightIndex]
    const leftPath = leftProperty?.schemaPath ?? childPath(childPath(leftMember.path, 'properties'), name)
    const rightPath = rightProperty?.schemaPath ?? childPath(childPath(rightMember.path, 'properties'), name)
    return fail(
      'CF08-INCOMPATIBLE-OBJECT-UNION',
      childPath(union.path, 'anyOf'),
      `property ${JSON.stringify(name)} is not merge-compatible: ${leftPath} = ${propertyDescriptor(leftProperty)}; ${rightPath} = ${propertyDescriptor(rightProperty)}. Add a required closed string discriminator with disjoint values or make every member's property type, presence, nullability, and requiredness identical.`,
    )
  }
  return sortedMembers[0]?.properties ?? []
}

function promotedProperties(
  members: readonly ObjectMemberAnalysis[],
  discriminator: string,
): readonly PropertyPlan[] {
  if (members.length === 0) return []
  const sortedMembers = [...members].sort((left, right) => ordinal(left.path, right.path))
  const names = sortedMembers[0]!.properties
    .map((property) => property.wireName)
    .filter((name) => name !== discriminator)
    .filter((name) => sortedMembers.every((member) => member.properties.some((property) => property.wireName === name)))
    .sort(ordinal)
  const promoted: PropertyPlan[] = []
  for (const name of names) {
    const properties = sortedMembers.map((member) =>
      member.properties.find((property) => property.wireName === name)!)
    if (properties.every((property) => propertiesEqual(properties[0]!, property))) promoted.push(properties[0]!)
  }
  return promoted
}

function memberKinds(
  alternatives: readonly SchemaNode[],
  paths: readonly SchemaPath[],
  context: AnalysisContext,
): readonly string[] {
  return alternatives.map((alternative, index) => {
    const nullable = splitNullableUnion(alternative, paths[index]!)
    if (nullable !== null) return 'nullable'
    const referenced = referenceDescriptor(alternative, paths[index]!, context)
    const schema = referenced?.schema ?? alternative
    if (Array.isArray(schema['anyOf'])) return 'union'
    const type = schemaType(schema)
    if (type === 'boolean') return 'boolean'
    if (type === 'integer') return 'integer'
    if (type === 'number') return 'number'
    return typeof type === 'string' ? type : 'unknown'
  })
}

function analyzeUnionDefinition(
  definition: DefinitionDescriptor,
  context: AnalysisContext,
): CompatibleObjectUnionPlan | DiscriminatedObjectUnionPlan {
  const alternativesValue = definition.schema['anyOf']
  if (!Array.isArray(alternativesValue)) {
    return malformedSchema(definition.path, 'expected anyOf for a union definition.')
  }
  const alternativesPath = childPath(definition.path, 'anyOf')
  const alternatives = alternativesValue.map((entry, index) => asSchema(entry, childPath(alternativesPath, index)))
  const paths = alternatives.map((_, index) => childPath(alternativesPath, index))
  const kinds = memberKinds(alternatives, paths, context)
  if (!kinds.every((kind) => kind === 'object')) {
    return fail(
      'CF08-MIXED-UNION',
      alternativesPath,
      `unsupported member kinds [${[...new Set(kinds)].sort(ordinal).join(', ')}]; only T|null, compatible closed-object unions, and closed discriminated-object unions can be emitted to C#.`,
    )
  }
  const members = alternatives.map((alternative, index) => analyzeObjectMember(alternative, paths[index]!, context))
  const candidates = discriminatorCandidates(members)
  const metadata = definition.schema['x-csharp-discriminator']
  let selected: DiscriminatorCandidate | null = null
  if (metadata !== undefined) {
    const metadataPath = childPath(definition.path, 'x-csharp-discriminator')
    if (typeof metadata !== 'string' || metadata.trim().length === 0) {
      return fail(
        'CF08-DISCRIMINATOR-METADATA',
        metadataPath,
        `expected a non-empty string naming one shared required non-null string const/enum property; received ${JSON.stringify(metadata)}.`,
      )
    }
    selected = candidates.find((candidate) => candidate.propertyName === metadata) ?? null
    if (selected === null) {
      return fail(
        'CF08-DISCRIMINATOR-METADATA',
        metadataPath,
        `selector ${JSON.stringify(metadata)} is not a shared required non-null string const/enum discriminator candidate; candidates [${candidates.map((candidate) => candidate.propertyName).sort(ordinal).join(', ')}].`,
      )
    }
    if (selected.overlap !== null) {
      return fail(
        'CF08-DISCRIMINATOR-METADATA',
        selected.overlap.rightPath,
        `selector ${JSON.stringify(metadata)} is unsafe because value ${JSON.stringify(selected.overlap.value)} is claimed by ${selected.overlap.leftPath} and ${selected.overlap.rightPath}; discriminator values must be non-empty and pairwise disjoint.`,
      )
    }
    if (selected.domains.some((domain) => domain.length === 0)) {
      return fail(
        'CF08-DISCRIMINATOR-METADATA',
        metadataPath,
        `selector ${JSON.stringify(metadata)} is unsafe because discriminator values must be non-empty and pairwise disjoint.`,
      )
    }
  } else {
    const safe = candidates.filter((candidate) =>
      candidate.overlap === null && candidate.domains.every((domain) => domain.length > 0))
    if (safe.length > 1) {
      return fail(
        'CF08-DISCRIMINATOR',
        alternativesPath,
        `object union ${JSON.stringify(definition.className)} has no unique shared required non-null string const/enum discriminator; found [${safe.map((candidate) => candidate.propertyName).sort(ordinal).join(', ')}]. Set x-csharp-discriminator to exactly one candidate.`,
      )
    }
    selected = safe[0] ?? null
    if (selected === null) {
      const overlapping = candidates.find((candidate) => candidate.overlap !== null)
      if (overlapping?.overlap !== null && overlapping?.overlap !== undefined) {
        return fail(
          'CF08-DISCRIMINATOR',
          overlapping.overlap.rightPath,
          `discriminator ${JSON.stringify(overlapping.propertyName)} value ${JSON.stringify(overlapping.overlap.value)} is claimed by ${overlapping.overlap.leftPath} and ${overlapping.overlap.rightPath}; discriminator values must be non-empty and pairwise disjoint.`,
        )
      }
    }
  }

  if (selected === null) {
    return {
      kind: 'compatible-object',
      definitionName: definition.key,
      className: definition.className,
      schemaPath: definition.path,
      properties: compatibleUnionProperties(definition, members),
    }
  }

  for (let index = 0; index < members.length; index++) {
    if (members[index]!.definition === null) {
      return fail(
        'CF08-ANONYMOUS-MEMBER',
        paths[index]!,
        `discriminated union ${JSON.stringify(definition.className)} members must be named local $ref objects; inline object members cannot be emitted as concrete C# union types.`,
      )
    }
  }
  const promoted = promotedProperties(members, selected.propertyName)
  const promotedNames = new Set(promoted.map((property) => property.wireName))
  const cases = members.map((member, index): DiscriminatedCasePlan => {
    const descriptor = member.definition!
    return {
      definitionName: descriptor.key,
      className: descriptor.className,
      schemaPath: descriptor.path,
      discriminatorValues: selected!.domains[index]!,
      discriminatorValuePaths: selected!.domainPaths[index]!,
      properties: member.properties.filter((property) => !promotedNames.has(property.wireName)),
    }
  })
  return {
    kind: 'discriminated-object',
    definitionName: definition.key,
    className: definition.className,
    schemaPath: definition.path,
    discriminator: selected.propertyName,
    discriminatorPath: selected.propertyPath,
    discriminatorValues: selected.domains.flatMap((domain) => domain),
    discriminatorValuePaths: selected.domainPaths.flatMap((pathsForMember) => pathsForMember),
    promotedProperties: promoted,
    cases,
  }
}

function ordinaryObjectPlan(
  definition: DefinitionDescriptor,
  context: AnalysisContext,
): ObjectPlan {
  const member = analyzeObjectMember(definition.schema, definition.path, context)
  return {
    definitionName: definition.key,
    className: definition.className,
    schemaPath: definition.path,
    properties: member.properties,
  }
}

function validateUnionOwnership(unions: readonly DiscriminatedObjectUnionPlan[]): ReadonlyMap<string, MemberOwnership> {
  const ownership = new Map<string, MemberOwnership>()
  for (const union of unions) {
    for (const member of union.cases) {
      const existing = ownership.get(member.definitionName)
      if (existing !== undefined) {
        fail(
          'CF08-UNION-INHERITANCE',
          member.schemaPath,
          `definition ${JSON.stringify(member.definitionName)} is a member of discriminated unions ${JSON.stringify(existing.union.className)} and ${JSON.stringify(union.className)}; a generated C# member may inherit exactly one union base.`,
        )
      }
      ownership.set(member.definitionName, { union, member })
    }
  }
  return ownership
}

function pascalCase(value: string): string {
  const normalized = value
    .replace(/[^A-Za-z0-9]+(.)/g, (_match: string, next: string) => next.toUpperCase())
    .replace(/^[a-z]/, (first) => first.toUpperCase())
  return /^[0-9]/.test(normalized) ? `Value${normalized}` : normalized
}

function validateIdentifier(identifier: string, schemaPath: SchemaPath, sourceName: string): void {
  const keywords = new Set([
    'abstract', 'as', 'base', 'bool', 'break', 'byte', 'case', 'catch', 'char', 'checked',
    'class', 'const', 'continue', 'decimal', 'default', 'delegate', 'do', 'double', 'else',
    'enum', 'event', 'explicit', 'extern', 'false', 'finally', 'fixed', 'float', 'for',
    'foreach', 'goto', 'if', 'implicit', 'in', 'int', 'interface', 'internal', 'is', 'lock',
    'long', 'namespace', 'new', 'null', 'object', 'operator', 'out', 'override', 'params',
    'private', 'protected', 'public', 'readonly', 'ref', 'return', 'sbyte', 'sealed', 'short',
    'sizeof', 'stackalloc', 'static', 'string', 'struct', 'switch', 'this', 'throw', 'true',
    'try', 'typeof', 'uint', 'ulong', 'unchecked', 'unsafe', 'ushort', 'using', 'virtual',
    'void', 'volatile', 'while',
  ])
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier) || keywords.has(identifier)) {
    fail(
      'CF08-IDENTIFIER-COLLISION',
      schemaPath,
      `schema name ${JSON.stringify(sourceName)} emits invalid C# identifier ${JSON.stringify(identifier)}.`,
    )
  }
}

interface IdentifierClaim {
  readonly source: string
  readonly path: SchemaPath
}

interface ContractIdentifierPlan {
  readonly className: string
  readonly canonicalSchemaPartCount: number
}

function claimIdentifier(
  symbols: Map<string, IdentifierClaim>,
  identifier: string,
  source: string,
  path: SchemaPath,
): void {
  validateIdentifier(identifier, path, source)
  const existing = symbols.get(identifier)
  if (existing !== undefined) {
    fail(
      'CF08-IDENTIFIER-COLLISION',
      path,
      `schema names ${JSON.stringify(existing.source)} and ${JSON.stringify(source)} both emit C# identifier ${JSON.stringify(identifier)}.`,
    )
  }
  symbols.set(identifier, { source, path })
}

function validateIdentifiers(plan: ContractPlan, contract?: ContractIdentifierPlan): void {
  const emittedTypes = new Map<string, IdentifierClaim>()
  const claimType = (identifier: string, source: string, path: SchemaPath): void => {
    claimIdentifier(emittedTypes, identifier, source, path)
  }
  if (contract !== undefined) {
    claimType(contract.className, `${contract.className} configured contract class`, '#')
  }
  for (const definition of plan.definitions) {
    const emitted = definition.kind === 'object' ? definition.object : definition.union
    claimType(emitted.className, emitted.definitionName, emitted.schemaPath)
  }

  const claimVocabulary = (className: string, property: PropertyPlan): void => {
    if (property.vocabularyValues.length === 0) return
    const vocabularyName = `${className}${pascalCase(property.wireName)}Values`
    claimType(vocabularyName, `${className}.${property.wireName} vocabulary`, property.schemaPath)
    const constants = new Map<string, IdentifierClaim>()
    claimIdentifier(
      constants,
      vocabularyName,
      `${vocabularyName} enclosing vocabulary class`,
      property.schemaPath,
    )
    for (let index = 0; index < property.vocabularyValues.length; index++) {
      const value = property.vocabularyValues[index]!
      claimIdentifier(
        constants,
        pascalCase(value),
        value,
        property.vocabularyValuePaths[index] ?? property.schemaPath,
      )
    }
  }
  for (const definition of plan.definitions) {
    if (definition.kind === 'object') {
      for (const property of definition.object.properties) {
        claimVocabulary(definition.object.className, property)
      }
      continue
    }
    const union = definition.union
    const properties = union.kind === 'compatible-object'
      ? union.properties
      : union.promotedProperties
    for (const property of properties) claimVocabulary(union.className, property)
    if (union.kind !== 'discriminated-object') continue
    claimType(`${union.className}JsonConverter`, `${union.definitionName} converter`, union.schemaPath)
    const vocabularyName = `${union.className}${pascalCase(union.discriminator)}Values`
    claimType(
      vocabularyName,
      `${union.definitionName}.${union.discriminator} vocabulary`,
      union.discriminatorPath,
    )
    const constants = new Map<string, IdentifierClaim>()
    claimIdentifier(
      constants,
      vocabularyName,
      `${vocabularyName} enclosing vocabulary class`,
      union.discriminatorPath,
    )
    for (let index = 0; index < union.discriminatorValues.length; index++) {
      const value = union.discriminatorValues[index]!
      claimIdentifier(
        constants,
        pascalCase(value),
        value,
        union.discriminatorValuePaths[index] ?? union.discriminatorPath,
      )
    }
  }

  const ownership = buildOwnership(plan)
  const validateClassScope = (
    className: string,
    classPath: SchemaPath,
    properties: readonly PropertyPlan[],
    inherited: readonly PropertyPlan[] = [],
    member?: { readonly union: DiscriminatedObjectUnionPlan; readonly casePlan: DiscriminatedCasePlan },
  ): void => {
    const symbols = new Map<string, IdentifierClaim>()
    claimIdentifier(symbols, className, `${className} enclosing class`, classPath)
    for (const property of inherited) {
      claimIdentifier(
        symbols,
        property.wireName,
        `${member?.union.className ?? className}.${property.wireName} inherited property`,
        property.schemaPath,
      )
    }
    for (const property of properties) {
      claimIdentifier(symbols, property.wireName, property.wireName, property.schemaPath)
    }
    if (member === undefined) return
    const discriminatorProperty = properties.find((property) =>
      property.wireName === member.union.discriminator)
    const discriminatorPath = discriminatorProperty?.schemaPath ?? member.union.discriminatorPath
    const discriminatorSuffix = pascalCase(member.union.discriminator)
    if (member.casePlan.discriminatorValues.length === 1) {
      claimIdentifier(
        symbols,
        `Expected${discriminatorSuffix}`,
        `${member.union.discriminator} discriminator constant`,
        discriminatorPath,
      )
    }
    claimIdentifier(
      symbols,
      `${member.union.discriminator}Value`,
      `${member.union.discriminator} discriminator backing field`,
      discriminatorPath,
    )
    for (const method of [
      'ValidateUnionMemberAfterDeserialization',
      'ValidateUnionMemberBeforeSerialization',
      'ValidateUnionMember',
    ]) {
      claimIdentifier(symbols, method, `${member.union.discriminator} discriminator validation method`, discriminatorPath)
    }
  }

  for (const definition of plan.definitions) {
    if (definition.kind === 'compatible-object-union') {
      validateClassScope(
        definition.union.className,
        definition.union.schemaPath,
        definition.union.properties,
      )
      continue
    }
    if (definition.kind === 'discriminated-object-union') {
      validateClassScope(
        definition.union.className,
        definition.union.schemaPath,
        definition.union.promotedProperties,
      )
      continue
    }
    const owner = ownership.get(definition.object.definitionName)
    validateClassScope(
      definition.object.className,
      definition.object.schemaPath,
      definition.object.properties,
      owner?.union.promotedProperties,
      owner === undefined ? undefined : { union: owner.union, casePlan: owner.member },
    )
  }

  if (contract !== undefined) {
    const symbols = new Map<string, IdentifierClaim>()
    claimIdentifier(symbols, contract.className, `${contract.className} enclosing class`, '#')
    const fixedMembers = [
      'ProtocolVersion',
      'ProjectionVersion',
      'SnapshotVersion',
      'SchemaId',
      'CanonicalSchemaJson',
      'CreateStrictJsonSettings',
      'RequireCompatible',
    ]
    for (const member of fixedMembers) {
      claimIdentifier(symbols, member, `${member} generated contract member`, '#')
    }
    for (let index = 0; index < contract.canonicalSchemaPartCount; index++) {
      const member = `CanonicalSchemaJsonPart${String(index)}`
      claimIdentifier(symbols, member, `${member} generated contract member`, '#')
    }
  }
}

export function analyzeContract(input: AnalyzeCSharpContractInput): ContractPlan {
  const context = buildContext(input.schema)
  validateAllReferences(context)
  const useSites = referenceUseSites(context)
  const unionByDefinition = new Map<string, CompatibleObjectUnionPlan | DiscriminatedObjectUnionPlan>()
  for (const definition of [...context.definitions.values()].sort((left, right) => ordinal(left.path, right.path))) {
    if (!Array.isArray(definition.schema['anyOf'])) continue
    if (splitNullableUnion(definition.schema, definition.path) !== null) {
      malformedSchema(definition.path, 'a nullable wrapper cannot be emitted as a standalone DTO definition.')
    }
    try {
      unionByDefinition.set(definition.key, analyzeUnionDefinition(definition, context))
    } catch (error) {
      const useSite = useSites.get(definition.key)?.[0]
      if (useSite !== undefined && error instanceof CSharpContractGenerationError) {
        throw new CSharpContractGenerationError(
          error.code,
          error.schemaPath,
          `${error.detail} Referenced from ${useSite}.`,
        )
      }
      throw error
    }
  }
  const discriminated = [...unionByDefinition.values()]
    .filter((union): union is DiscriminatedObjectUnionPlan => union.kind === 'discriminated-object')
  const ownership = validateUnionOwnership(discriminated)
  const objects = new Map<string, ObjectPlan>()
  for (const definition of context.definitions.values()) {
    if (unionByDefinition.has(definition.key)) continue
    if (definition.schema['type'] !== 'object') {
      malformedSchema(definition.path, 'DTO definition is neither an object nor a supported object union.')
    }
    const object = ordinaryObjectPlan(definition, context)
    const member = ownership.get(definition.key)
    objects.set(definition.key, member === undefined
      ? object
      : { ...object, properties: member.member.properties })
  }
  const definitions: DefinitionPlan[] = []
  for (const definition of [...context.definitions.values()].sort((left, right) => ordinal(left.key, right.key))) {
    const union = unionByDefinition.get(definition.key)
    if (union?.kind === 'compatible-object') {
      definitions.push({ kind: 'compatible-object-union', union })
    } else if (union?.kind === 'discriminated-object') {
      definitions.push({ kind: 'discriminated-object-union', union })
    } else {
      definitions.push({ kind: 'object', object: objects.get(definition.key)! })
    }
  }
  const plan: ContractPlan = {
    definitions,
    objects: [...objects.values()].sort((left, right) => ordinal(left.definitionName, right.definitionName)),
    unions: [...unionByDefinition.values()].sort((left, right) => ordinal(left.definitionName, right.definitionName)),
  }
  validateIdentifiers(plan)
  return plan
}

export function analyzeCsharpContract(schema: SchemaNode): ContractPlan {
  return analyzeContract({ schema })
}

export const analyzeCSharpContract = analyzeCsharpContract

function csharpString(value: string): string {
  return JSON.stringify(value)
    .replaceAll('\u0085', '\\u0085')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029')
}

function emittedPropertyType(property: PropertyPlan): string {
  const storageType = emittedStorageType(property.storage)
  return `${storageType}${property.storage.valueType && !property.storage.nullable && !property.required ? '?' : ''}`
}

function propertyAttribute(property: PropertyPlan): string {
  const requiredMode = property.required
    ? property.storage.nullable ? 'AllowNull' : 'Always'
    : property.storage.nullable ? 'Default' : 'DisallowNull'
  const nullHandling = property.required && property.storage.nullable
    ? ', NullValueHandling = NullValueHandling.Include'
    : !property.required ? ', NullValueHandling = NullValueHandling.Ignore' : ''
  return `[JsonProperty(${csharpString(property.wireName)}, Required = Required.${requiredMode}${nullHandling})]`
}

function propertyInitialization(property: PropertyPlan): string {
  return property.required && property.storage.kind === 'array'
    ? ` = Array.Empty<${emittedStorageType(property.storage.item)}>();`
    : ';'
}

function emitOrdinaryProperty(property: PropertyPlan): string[] {
  return [
    `        ${propertyAttribute(property)}`,
    `        public ${emittedPropertyType(property)} ${property.wireName}${propertyInitialization(property)}`,
    '',
  ]
}

function discriminatorError(union: DiscriminatedObjectUnionPlan, member: DiscriminatedCasePlan): string {
  if (member.discriminatorValues.length === 1) {
    return `C# union ${union.className} member ${member.className} requires discriminator ${union.discriminator}=${member.discriminatorValues[0]}.`
  }
  return `C# union ${union.className} member ${member.className} requires discriminator ${JSON.stringify(union.discriminator)} in [${member.discriminatorValues.join(', ')}]; received {value}.`
}

function emitDiscriminatorProperty(
  union: DiscriminatedObjectUnionPlan,
  member: DiscriminatedCasePlan,
  property: PropertyPlan,
): string[] {
  const values = member.discriminatorValues
  if (values.length === 1) {
    const message = discriminatorError(union, member)
    return [
      `        private const string Expected${pascalCase(union.discriminator)} = ${csharpString(values[0]!)};`,
      `        private string ${union.discriminator}Value = Expected${pascalCase(union.discriminator)};`,
      '',
      `        ${propertyAttribute(property)}`,
      `        public string ${union.discriminator}`,
      '        {',
      `            get => ${union.discriminator}Value;`,
      '            private set',
      '            {',
      `                if (!String.Equals(value, Expected${pascalCase(union.discriminator)}, StringComparison.Ordinal))`,
      `                    throw new JsonSerializationException(${csharpString(message)});`,
      `                ${union.discriminator}Value = value;`,
      '            }',
      '        }',
      '',
    ]
  }
  const allowedExpression = values
    .map((value) => `String.Equals(value, ${csharpString(value)}, StringComparison.Ordinal)`)
    .join(' ||\n                    ')
  const expected = `[${values.join(', ')}]`
  const messagePrefix = `C# union ${union.className} member ${member.className} requires discriminator ${JSON.stringify(union.discriminator)} in ${expected}; received "`
  return [
    `        private string ${union.discriminator}Value;`,
    '',
    `        ${propertyAttribute(property)}`,
    `        public string ${union.discriminator}`,
    '        {',
    `            get => ${union.discriminator}Value;`,
    '            set',
    '            {',
    `                if (!(${allowedExpression}))`,
    '                    throw new JsonSerializationException(',
    `                        ${csharpString(messagePrefix)} + (value ?? "<null>") + ${csharpString('".')});`,
    `                ${union.discriminator}Value = value;`,
    '            }',
    '        }',
    '',
  ]
}

function emitDiscriminatorValidation(
  union: DiscriminatedObjectUnionPlan,
  member: DiscriminatedCasePlan,
): string[] {
  const values = member.discriminatorValues
  const valid = values.length === 1
    ? `String.Equals(${union.discriminator}Value, ${csharpString(values[0]!)}, StringComparison.Ordinal)`
    : values.map((value) =>
      `String.Equals(${union.discriminator}Value, ${csharpString(value)}, StringComparison.Ordinal)`).join(' ||\n                ')
  const fixedMessage = values.length === 1
    ? discriminatorError(union, member)
    : `C# union ${union.className} member ${member.className} requires discriminator ${JSON.stringify(union.discriminator)} in [${values.join(', ')}].`
  return [
    '        [OnDeserialized]',
    '        private void ValidateUnionMemberAfterDeserialization(StreamingContext context) =>',
    '            ValidateUnionMember();',
    '',
    '        [OnSerializing]',
    '        private void ValidateUnionMemberBeforeSerialization(StreamingContext context) =>',
    '            ValidateUnionMember();',
    '',
    '        private void ValidateUnionMember()',
    '        {',
    `            if (!(${valid}))`,
    `                throw new JsonSerializationException(${csharpString(fixedMessage)});`,
    '        }',
    '',
  ]
}

function emitClass(
  object: ObjectPlan,
  ownership: MemberOwnership | undefined,
): string[] {
  const union = ownership?.union
  const member = ownership?.member
  const declaration = `    public sealed partial class ${object.className}${union === undefined ? '' : ` : ${union.className}`}`
  const lines = [
    '    [Serializable]',
    '    [JsonObject(MemberSerialization.OptIn)]',
    declaration,
    '    {',
  ]
  for (const property of object.properties) {
    if (union !== undefined && member !== undefined && property.wireName === union.discriminator) {
      lines.push(...emitDiscriminatorProperty(union, member, property))
    } else {
      lines.push(...emitOrdinaryProperty(property))
    }
  }
  if (union !== undefined && member !== undefined) lines.push(...emitDiscriminatorValidation(union, member))
  if (lines[lines.length - 1] === '') lines.pop()
  lines.push('    }', '')
  return lines
}

function emitCompatibleClassLines(union: CompatibleObjectUnionPlan): string[] {
  const lines = [
    '    [Serializable]',
    '    [JsonObject(MemberSerialization.OptIn)]',
    `    public sealed partial class ${union.className}`,
    '    {',
  ]
  for (const property of union.properties) lines.push(...emitOrdinaryProperty(property))
  if (lines[lines.length - 1] === '') lines.pop()
  lines.push('    }', '')
  return lines
}

export function emitCompatibleClass(plan: CompatibleObjectUnionPlan): string {
  return emitCompatibleClassLines(plan).join('\n')
}

function emitDiscriminatedBaseLines(union: DiscriminatedObjectUnionPlan): string[] {
  const lines = [
    '    [Serializable]',
    '    [JsonObject(MemberSerialization.OptIn)]',
    `    public abstract partial class ${union.className}`,
    '    {',
  ]
  for (const property of union.promotedProperties) lines.push(...emitOrdinaryProperty(property))
  if (lines[lines.length - 1] === '') lines.pop()
  lines.push('    }', '')
  return lines
}

export function emitDiscriminatedBase(plan: DiscriminatedObjectUnionPlan): string {
  return emitDiscriminatedBaseLines(plan).join('\n')
}

function emitUnionConverterLines(union: DiscriminatedObjectUnionPlan): string[] {
  const expected = union.discriminatorValues.join(', ')
  const unknownPrefix = `C# union ${union.className} has unknown discriminator "`
  const unknownSuffix = `"; expected [${expected}].`
  const dispatchLines: string[] = []
  for (const member of union.cases) {
    for (const value of member.discriminatorValues) {
      dispatchLines.push(`                case ${csharpString(value)}:`)
      dispatchLines.push(`                    return value.ToObject<${member.className}>(serializer);`)
    }
  }
  return [
    `    public sealed class ${union.className}JsonConverter : JsonConverter`,
    '    {',
    `        public override bool CanConvert(Type objectType) => objectType == typeof(${union.className});`,
    '',
    '        public override bool CanWrite => false;',
    '',
    '        public override object ReadJson(',
    '            JsonReader reader,',
    '            Type objectType,',
    '            object existingValue,',
    '            JsonSerializer serializer)',
    '        {',
    '            if (reader.TokenType == JsonToken.Null) return null;',
    '            JObject value;',
    '            try',
    '            {',
    '                value = JObject.Load(reader, new JsonLoadSettings',
    '                {',
    '                    DuplicatePropertyNameHandling = DuplicatePropertyNameHandling.Error,',
    '                });',
    '            }',
    '            catch (JsonReaderException exception)',
    '            {',
    `                throw new JsonSerializationException(${csharpString(`C# union ${union.className} contains duplicate discriminator ${JSON.stringify(union.discriminator)}.`)}, exception);`,
    '            }',
    `            var discriminator = value[${csharpString(union.discriminator)}];`,
    '            if (discriminator == null || discriminator.Type != JTokenType.String)',
    `                throw new JsonSerializationException(${csharpString(`C# union ${union.className} requires string discriminator ${JSON.stringify(union.discriminator)}.`)});`,
    '            switch (discriminator.Value<string>())',
    '            {',
    ...dispatchLines,
    '                default:',
    '                    throw new JsonSerializationException(',
    `                        ${csharpString(unknownPrefix)} + (discriminator.Value<string>() ?? "<null>") + ${csharpString(unknownSuffix)});`,
    '            }',
    '        }',
    '',
    '        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer) =>',
    '            throw new NotSupportedException();',
    '    }',
    '',
  ]
}

export function emitUnionConverter(plan: DiscriminatedObjectUnionPlan): string {
  return emitUnionConverterLines(plan).join('\n')
}

function emitVocabulary(className: string, property: PropertyPlan): string[] {
  if (property.vocabularyValues.length === 0) return []
  const typeName = `${className}${pascalCase(property.wireName)}Values`
  return [
    `    public static class ${typeName}`,
    '    {',
    ...property.vocabularyValues.map((value) =>
      `        public const string ${pascalCase(value)} = ${csharpString(value)};`),
    '    }',
    '',
  ]
}

function emitUnionVocabulary(union: DiscriminatedObjectUnionPlan): string[] {
  const typeName = `${union.className}${pascalCase(union.discriminator)}Values`
  return [
    `    public static class ${typeName}`,
    '    {',
    ...union.discriminatorValues.map((value) =>
      `        public const string ${pascalCase(value)} = ${csharpString(value)};`),
    '    }',
    '',
  ]
}

function emitCanonicalSchemaConstants(schemaJson: string): string[] {
  const chunks: string[] = []
  for (let offset = 0; offset < schemaJson.length; offset += CANONICAL_SCHEMA_CHUNK_SIZE) {
    chunks.push(schemaJson.slice(offset, offset + CANONICAL_SCHEMA_CHUNK_SIZE))
  }
  return [
    ...chunks.map((chunk, index) =>
      `        private const string CanonicalSchemaJsonPart${String(index)} = ${csharpString(chunk)};`),
    '',
    '        public static readonly string CanonicalSchemaJson =',
    ...chunks.map((_, index) =>
      `            CanonicalSchemaJsonPart${String(index)}${index === chunks.length - 1 ? ';' : ' +'}`),
  ]
}

function buildOwnership(plan: ContractPlan): ReadonlyMap<string, MemberOwnership> {
  const ownership = new Map<string, MemberOwnership>()
  for (const union of plan.unions) {
    if (union.kind !== 'discriminated-object') continue
    for (const member of union.cases) ownership.set(member.definitionName, { union, member })
  }
  return ownership
}

interface RenderedContractParts {
  readonly vocabularies: readonly string[]
  readonly classes: readonly string[]
  readonly converters: readonly string[]
}

function renderContractParts(plan: ContractPlan): RenderedContractParts {
  const ownership = buildOwnership(plan)
  const vocabularies: string[] = []
  const classes: string[] = []
  const converters: string[] = []
  for (const definition of plan.definitions) {
    if (definition.kind === 'object') {
      const owner = ownership.get(definition.object.definitionName)
      for (const property of definition.object.properties) {
        vocabularies.push(...emitVocabulary(definition.object.className, property))
      }
      classes.push(...emitClass(definition.object, owner))
      continue
    }
    if (definition.kind === 'compatible-object-union') {
      for (const property of definition.union.properties) {
        vocabularies.push(...emitVocabulary(definition.union.className, property))
      }
      classes.push(...emitCompatibleClassLines(definition.union))
      continue
    }
    vocabularies.push(...emitUnionVocabulary(definition.union))
    for (const property of definition.union.promotedProperties) {
      vocabularies.push(...emitVocabulary(definition.union.className, property))
    }
    classes.push(...emitDiscriminatedBaseLines(definition.union))
    converters.push(...emitUnionConverterLines(definition.union))
  }
  return { vocabularies, classes, converters }
}

/** Stable generated type/vocabulary/converter body, excluding schema identity/constants. */
export function emitCsharpContractTypes(plan: ContractPlan): string {
  const rendered = renderContractParts(plan)
  return [...rendered.vocabularies, ...rendered.classes, ...rendered.converters].join('\n')
}

export function generateCsharpTypeDeclarations(schema: SchemaNode): string {
  return emitCsharpContractTypes(analyzeCsharpContract(schema))
}

export function generateCsharpContract(input: GenerateCSharpContractInput): string {
  const plan = analyzeContract(input)
  const namespace = input.namespace ?? 'Studio.Runtime.Data'
  const contractClassName = input.contractClassName ?? 'StudioBridgeContract'
  const generatorCommand = input.generatorCommand ?? 'npm run generate:bridge-contract'
  const formatExceptionType = input.formatExceptionType ?? 'StudioSnapshotFormatException'
  const identity = schemaIdentity(input.schema)
  const canonicalSchema = canonicalJsonPretty(input.schema).trimEnd()
  validateIdentifiers(plan, {
    className: contractClassName,
    canonicalSchemaPartCount: Math.max(1, Math.ceil(canonicalSchema.length / CANONICAL_SCHEMA_CHUNK_SIZE)),
  })
  const rendered = renderContractParts(plan)
  const converterInitializers = plan.unions
    .filter((union): union is DiscriminatedObjectUnionPlan => union.kind === 'discriminated-object')
    .map((union) => `new ${union.className}JsonConverter()`)
  return [
    '// <auto-generated>',
    `// Generated by ${generatorCommand}. Do not edit by hand.`,
    `// Schema identity: ${identity}`,
    '// </auto-generated>',
    '',
    'using System;',
    'using System.Globalization;',
    'using System.Runtime.Serialization;',
    'using Newtonsoft.Json;',
    'using Newtonsoft.Json.Converters;',
    'using Newtonsoft.Json.Linq;',
    '',
    `namespace ${namespace}`,
    '{',
    `    public static partial class ${contractClassName}`,
    '    {',
    `        public const int ProtocolVersion = ${String(input.protocolVersion)};`,
    `        public const int ProjectionVersion = ${String(input.projectionVersion)};`,
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
    `                Converters = { ${['new StringEnumConverter()', ...converterInitializers].join(', ')} },`,
    '            };',
    '',
    '        public static void RequireCompatible(int protocolVersion, string schemaId, int projectionVersion)',
    '        {',
    '            if (protocolVersion != ProtocolVersion)',
    `                throw new ${formatExceptionType}($"Bridge protocol mismatch: expected {ProtocolVersion}, received {protocolVersion}.");`,
    '            if (!string.Equals(schemaId, SchemaId, StringComparison.Ordinal))',
    `                throw new ${formatExceptionType}($"Bridge schema mismatch: expected {SchemaId}, received {schemaId ?? "<null>"}.");`,
    '            if (projectionVersion != ProjectionVersion)',
    `                throw new ${formatExceptionType}($"Bridge projection mismatch: expected {ProjectionVersion}, received {projectionVersion}.");`,
    '        }',
    '    }',
    '',
    ...rendered.vocabularies,
    ...rendered.classes,
    ...rendered.converters,
    '}',
    '',
  ].join('\n')
}

export const generateCSharpContract = generateCsharpContract
