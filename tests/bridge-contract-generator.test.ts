import { createHash } from 'node:crypto'

import { describe, expect, it, vi } from 'vitest'

import { schemaIdentity } from '../bridge/schema/canonical.ts'
import {
  analyzeCsharpContract,
  CSharpContractGenerationError,
  generateCsharpContract,
  generateCsharpTypeDeclarations,
  type DiscriminatedObjectUnionPlan,
  type SchemaNode,
} from '../scripts/bridge-contract-csharp.ts'
import {
  BRIDGE_CONTRACT_UNION_FIXTURES as FIXTURES,
  fixtureSchema,
} from './fixtures/bridge-contract-union-fixtures.ts'

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function mutableClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function definitions(schema: SchemaNode): Record<string, Record<string, unknown>> {
  return (schema['$defs'] ?? {}) as Record<string, Record<string, unknown>>
}

function reverseUnion(schema: SchemaNode, unionName: string): SchemaNode {
  const clone = mutableClone(schema)
  const union = definitions(clone)[unionName]!
  union['anyOf'] = [...(union['anyOf'] as unknown[])].reverse()
  return clone
}

function reverseNullable(schema: SchemaNode, holderName: string, propertyName: string): SchemaNode {
  const clone = mutableClone(schema)
  const holder = definitions(clone)[holderName]!
  const properties = holder['properties'] as Record<string, Record<string, unknown>>
  properties[propertyName]!['anyOf'] = [...(properties[propertyName]!['anyOf'] as unknown[])].reverse()
  return clone
}

function extractClass(source: string, declaration: string): string {
  const lines = source.split('\n')
  const declarationIndex = lines.findIndex((line) => line.includes(declaration))
  if (declarationIndex < 0) throw new Error(`Missing generated declaration ${declaration}.`)
  let start = declarationIndex
  while (start > 0 && lines[start - 1]!.trimStart().startsWith('[')) start--
  let depth = 0
  let entered = false
  let end = declarationIndex
  for (; end < lines.length; end++) {
    for (const character of lines[end]!) {
      if (character === '{') {
        entered = true
        depth++
      } else if (character === '}') {
        depth--
      }
    }
    if (entered && depth === 0) break
  }
  return lines.slice(start, end + 1).join('\n')
}

function discriminatedUnion(schema: SchemaNode, name: string): DiscriminatedObjectUnionPlan {
  const union = analyzeCsharpContract(schema).unions.find((candidate) => candidate.className === name)
  expect(union, `missing ${name}`).toBeDefined()
  expect(union?.kind).toBe('discriminated-object')
  return union as DiscriminatedObjectUnionPlan
}

function expectExactGenerationError(
  schema: SchemaNode,
  code: string,
  message: string,
): void {
  let thrown: unknown
  try {
    generateCsharpContract({ schema, protocolVersion: 1, projectionVersion: 1 })
  } catch (error) {
    thrown = error
  }
  expect(thrown).toBeInstanceOf(CSharpContractGenerationError)
  expect((thrown as CSharpContractGenerationError).code).toBe(code)
  expect((thrown as Error).message).toBe(message)
}

function closedObject(
  name: string,
  properties: Readonly<Record<string, SchemaNode>>,
  required: readonly string[] = Object.keys(properties),
): SchemaNode {
  return {
    type: 'object',
    properties,
    required,
    additionalProperties: false,
    'x-csharp-name': name,
  }
}

function reference(name: string): SchemaNode {
  return { $ref: `#/$defs/${name}` }
}

function namedUnion(name: string, members: readonly SchemaNode[], discriminator?: unknown): SchemaNode {
  return {
    anyOf: members,
    'x-csharp-name': name,
    ...(discriminator === undefined ? {} : { 'x-csharp-discriminator': discriminator }),
  }
}

function literal(value: string): SchemaNode {
  return { type: 'string', const: value }
}

describe('CF-08 sound union-to-C# generation', () => {
  describe('A — exact nullable unions', () => {
    it('F01 emits required string|null without a union class and is arm-order independent', () => {
      const schema = FIXTURES.F01_STRING_OR_NULL.schema
      const generated = generateCsharpTypeDeclarations(schema)
      expect(extractClass(generated, 'public sealed partial class Holder')).toBe([
        '    [Serializable]',
        '    [JsonObject(MemberSerialization.OptIn)]',
        '    public sealed partial class Holder',
        '    {',
        '        [JsonProperty("value", Required = Required.AllowNull, NullValueHandling = NullValueHandling.Include)]',
        '        public string value;',
        '    }',
      ].join('\n'))
      expect(generated).not.toContain('HolderJsonConverter')
      expect(generateCsharpTypeDeclarations(reverseNullable(schema, 'Holder', 'value'))).toBe(generated)
      expect(generateCsharpTypeDeclarations(schema)).toBe(generated)
    })

    it('F02 preserves a named object behind required object|null', () => {
      const generated = generateCsharpTypeDeclarations(FIXTURES.F02_OBJECT_OR_NULL.schema)
      expect(extractClass(generated, 'public sealed partial class Child')).toBe([
        '    [Serializable]',
        '    [JsonObject(MemberSerialization.OptIn)]',
        '    public sealed partial class Child',
        '    {',
        '        [JsonProperty("id", Required = Required.Always)]',
        '        public string id;',
        '    }',
      ].join('\n'))
      expect(extractClass(generated, 'public sealed partial class Holder')).toContain(
        '[JsonProperty("child", Required = Required.AllowNull, NullValueHandling = NullValueHandling.Include)]\n' +
        '        public Child child;',
      )
      expect(generated).not.toContain('ChildJsonConverter')
    })

    it('rejects malformed nullable wrappers exactly', () => {
      const schema = fixtureSchema({
        Holder: closedObject('Holder', {
          value: { anyOf: [{ type: 'string' }, { type: 'null' }, { type: 'null' }] },
        }),
      })
      expectExactGenerationError(
        schema,
        'CF08-NULLABLE',
        'C# contract generation failed [CF08-NULLABLE] at #/$defs/Holder/properties/value/anyOf: nullable unions must contain exactly one non-null member and one {"type":"null"} member; found 1 non-null and 2 null members.',
      )
    })
  })

  describe('B — structurally compatible object unions', () => {
    it('F03 emits one sealed aggregate only after exact recursive compatibility', () => {
      const schema = FIXTURES.F03_COMPATIBLE_OBJECTS.schema
      const generated = generateCsharpTypeDeclarations(schema)
      expect(extractClass(generated, 'public sealed partial class CompatibleUnion')).toBe([
        '    [Serializable]',
        '    [JsonObject(MemberSerialization.OptIn)]',
        '    public sealed partial class CompatibleUnion',
        '    {',
        '        [JsonProperty("count", Required = Required.Always)]',
        '        public int count;',
        '',
        '        [JsonProperty("id", Required = Required.Always)]',
        '        public string id;',
        '    }',
      ].join('\n'))
      expect(generated).not.toContain('CompatibleUnionJsonConverter')
      expect(generateCsharpTypeDeclarations(reverseUnion(schema, 'CompatibleUnion'))).toBe(generated)
    })

    it('F05 fails closed for conflicting same-name types in stable definition-path order', () => {
      expectExactGenerationError(
        FIXTURES.F05_CONFLICTING_PROPERTY_TYPES.schema,
        'CF08-INCOMPATIBLE-OBJECT-UNION',
        'C# contract generation failed [CF08-INCOMPATIBLE-OBJECT-UNION] at #/$defs/BadValueUnion/anyOf: property "value" is not merge-compatible: #/$defs/IntegerValue/properties/value = required int; #/$defs/TextValue/properties/value = required string. Add a required closed string discriminator with disjoint values or make every member\'s property type, presence, nullability, and requiredness identical.',
      )
      expectExactGenerationError(
        reverseUnion(FIXTURES.F05_CONFLICTING_PROPERTY_TYPES.schema, 'BadValueUnion'),
        'CF08-INCOMPATIBLE-OBJECT-UNION',
        'C# contract generation failed [CF08-INCOMPATIBLE-OBJECT-UNION] at #/$defs/BadValueUnion/anyOf: property "value" is not merge-compatible: #/$defs/IntegerValue/properties/value = required int; #/$defs/TextValue/properties/value = required string. Add a required closed string discriminator with disjoint values or make every member\'s property type, presence, nullability, and requiredness identical.',
      )
    })

    it('F06 keeps absent, optional, and required as three different laws', () => {
      expectExactGenerationError(
        FIXTURES.F06_REQUIRED_ABSENT.schema,
        'CF08-INCOMPATIBLE-OBJECT-UNION',
        'C# contract generation failed [CF08-INCOMPATIBLE-OBJECT-UNION] at #/$defs/BadPresenceUnion/anyOf: property "detail" is not merge-compatible: #/$defs/A/properties/detail = required string; #/$defs/B/properties/detail = absent. Add a required closed string discriminator with disjoint values or make every member\'s property type, presence, nullability, and requiredness identical.',
      )
      expectExactGenerationError(
        FIXTURES.F06_REQUIRED_OPTIONAL.schema,
        'CF08-INCOMPATIBLE-OBJECT-UNION',
        'C# contract generation failed [CF08-INCOMPATIBLE-OBJECT-UNION] at #/$defs/BadOptionalPresenceUnion/anyOf: property "detail" is not merge-compatible: #/$defs/A/properties/detail = required string; #/$defs/BOptional/properties/detail = optional string. Add a required closed string discriminator with disjoint values or make every member\'s property type, presence, nullability, and requiredness identical.',
      )
    })

    it('F08 reports the nested defect and exact referencing use site', () => {
      expectExactGenerationError(
        FIXTURES.F08_NESTED_INCOMPATIBLE.schema,
        'CF08-INCOMPATIBLE-OBJECT-UNION',
        'C# contract generation failed [CF08-INCOMPATIBLE-OBJECT-UNION] at #/$defs/NestedBad/anyOf: property "value" is not merge-compatible: #/$defs/NestedIntegerValue/properties/value = required int; #/$defs/NestedTextValue/properties/value = required string. Add a required closed string discriminator with disjoint values or make every member\'s property type, presence, nullability, and requiredness identical. Referenced from #/$defs/Outer/properties/payload.',
      )
    })
  })

  describe('C — closed discriminated object unions', () => {
    it('F04 emits an abstract base, exact concrete members, a closed vocabulary, and converter', () => {
      const schema = FIXTURES.F04_DISCRIMINATED_OBJECTS.schema
      const plan = discriminatedUnion(schema, 'ProbeUnion')
      expect(plan.discriminator).toBe('kind')
      expect(plan.promotedProperties.map((property) => property.wireName)).toEqual(['shared'])
      expect(plan.cases.map((member) => [
        member.className,
        member.discriminatorValues,
        member.properties.map((property) => property.wireName),
      ])).toEqual([
        ['Alpha', ['alpha'], ['alphaOnly', 'kind']],
        ['Beta', ['beta'], ['betaOnly', 'kind']],
      ])

      const generated = generateCsharpTypeDeclarations(schema)
      expect(extractClass(generated, 'public abstract partial class ProbeUnion')).toBe([
        '    [Serializable]',
        '    [JsonObject(MemberSerialization.OptIn)]',
        '    public abstract partial class ProbeUnion',
        '    {',
        '        [JsonProperty("shared", Required = Required.Always)]',
        '        public string shared;',
        '    }',
      ].join('\n'))
      const alpha = extractClass(generated, 'public sealed partial class Alpha : ProbeUnion')
      expect(alpha).toContain('private const string ExpectedKind = "alpha";')
      expect(alpha).toContain('private string kindValue = ExpectedKind;')
      expect(alpha).toContain('public string kind\n        {\n            get => kindValue;\n            private set')
      expect(alpha).toContain('C# union ProbeUnion member Alpha requires discriminator kind=alpha.')
      expect(alpha).toContain('[OnDeserialized]')
      expect(alpha).toContain('[OnSerializing]')
      expect(alpha).not.toContain('betaOnly')
      expect(generated).toContain('public static class ProbeUnionKindValues')
      expect(generated).toContain('public const string Alpha = "alpha";')
      expect(generated).toContain('public const string Beta = "beta";')
      const converter = extractClass(generated, 'public sealed class ProbeUnionJsonConverter')
      expect(converter).toContain('objectType == typeof(ProbeUnion)')
      expect(converter).toContain('DuplicatePropertyNameHandling = DuplicatePropertyNameHandling.Error')
      expect(converter).toContain('return value.ToObject<Alpha>(serializer);')
      expect(converter).toContain('return value.ToObject<Beta>(serializer);')
      expect(converter).toContain('expected [alpha, beta]')
      expect(generateCsharpTypeDeclarations(schema)).toBe(generated)
    })

    it('keeps member storage attached to its definition when anyOf order reverses', () => {
      const reversed = discriminatedUnion(
        reverseUnion(FIXTURES.F04_DISCRIMINATED_OBJECTS.schema, 'ProbeUnion'),
        'ProbeUnion',
      )
      const byName = new Map(reversed.cases.map((member) => [member.className, member]))
      expect(byName.get('Alpha')?.discriminatorValues).toEqual(['alpha'])
      expect(byName.get('Alpha')?.properties.map((property) => property.wireName)).toEqual(['alphaOnly', 'kind'])
      expect(byName.get('Beta')?.discriminatorValues).toEqual(['beta'])
      expect(byName.get('Beta')?.properties.map((property) => property.wireName)).toEqual(['betaOnly', 'kind'])
      expect(reversed.promotedProperties.map((property) => property.wireName)).toEqual(['shared'])
    })

    it('rejects ambiguous, overlapping, malformed, and unsafe discriminator selection exactly', () => {
      const ambiguous = fixtureSchema({
        A: closedObject('A', { kind: literal('a'), type: literal('one'), value: { type: 'string' } }),
        B: closedObject('B', { kind: literal('b'), type: literal('two'), value: { type: 'string' } }),
        U: namedUnion('U', [reference('A'), reference('B')]),
      })
      expectExactGenerationError(
        ambiguous,
        'CF08-DISCRIMINATOR',
        'C# contract generation failed [CF08-DISCRIMINATOR] at #/$defs/U/anyOf: object union "U" has no unique shared required non-null string const/enum discriminator; found [kind, type]. Set x-csharp-discriminator to exactly one candidate.',
      )

      const selected = mutableClone(ambiguous)
      definitions(selected)['U']!['x-csharp-discriminator'] = 'kind'
      expect(discriminatedUnion(selected, 'U').discriminator).toBe('kind')

      const malformed = mutableClone(ambiguous)
      definitions(malformed)['U']!['x-csharp-discriminator'] = 7
      expectExactGenerationError(
        malformed,
        'CF08-DISCRIMINATOR-METADATA',
        'C# contract generation failed [CF08-DISCRIMINATOR-METADATA] at #/$defs/U/x-csharp-discriminator: expected a non-empty string naming one shared required non-null string const/enum property; received 7.',
      )

      const missing = mutableClone(ambiguous)
      definitions(missing)['U']!['x-csharp-discriminator'] = 'phase'
      expectExactGenerationError(
        missing,
        'CF08-DISCRIMINATOR-METADATA',
        'C# contract generation failed [CF08-DISCRIMINATOR-METADATA] at #/$defs/U/x-csharp-discriminator: selector "phase" is not a shared required non-null string const/enum discriminator candidate; candidates [kind, type].',
      )

      const overlap = fixtureSchema({
        A: closedObject('A', { kind: literal('same'), a: { type: 'string' } }),
        B: closedObject('B', { kind: literal('same'), b: { type: 'string' } }),
        U: namedUnion('U', [reference('A'), reference('B')]),
      })
      expectExactGenerationError(
        overlap,
        'CF08-DISCRIMINATOR',
        'C# contract generation failed [CF08-DISCRIMINATOR] at #/$defs/U/anyOf: discriminator "kind" value "same" is claimed by #/$defs/A and #/$defs/B; discriminator values must be non-empty and pairwise disjoint.',
      )

      const explicitlyUnsafe = mutableClone(overlap)
      definitions(explicitlyUnsafe)['U']!['x-csharp-discriminator'] = 'kind'
      expectExactGenerationError(
        explicitlyUnsafe,
        'CF08-DISCRIMINATOR-METADATA',
        'C# contract generation failed [CF08-DISCRIMINATOR-METADATA] at #/$defs/U/x-csharp-discriminator: selector "kind" is unsafe because value "same" is claimed by #/$defs/A and #/$defs/B; discriminator values must be non-empty and pairwise disjoint.',
      )
    })

    it('rejects anonymous/open members and multiple generated base ownership', () => {
      const anonymous = fixtureSchema({
        U: namedUnion('U', [
          closedObject('InlineA', { kind: literal('a'), a: { type: 'string' } }),
          closedObject('InlineB', { kind: literal('b'), b: { type: 'string' } }),
        ]),
      })
      expectExactGenerationError(
        anonymous,
        'CF08-ANONYMOUS-MEMBER',
        'C# contract generation failed [CF08-ANONYMOUS-MEMBER] at #/$defs/U/anyOf/0: discriminated union "U" members must be named local $ref objects; inline object members cannot be emitted as concrete C# union types.',
      )

      const open = fixtureSchema({
        A: { ...closedObject('A', { kind: literal('a') }), additionalProperties: true },
        B: closedObject('B', { kind: literal('b') }),
        U: namedUnion('U', [reference('A'), reference('B')]),
      })
      expectExactGenerationError(
        open,
        'CF08-OPEN-OBJECT',
        'C# contract generation failed [CF08-OPEN-OBJECT] at #/$defs/A: union object member "A" must declare additionalProperties:false; open object members cannot be emitted soundly to C#.',
      )

      const inheritance = fixtureSchema({
        A: closedObject('A', { kind: literal('a'), a: { type: 'string' } }),
        B: closedObject('B', { kind: literal('b'), b: { type: 'string' } }),
        C: closedObject('C', { kind: literal('c'), c: { type: 'string' } }),
        FirstUnion: namedUnion('FirstUnion', [reference('A'), reference('B')]),
        SecondUnion: namedUnion('SecondUnion', [reference('A'), reference('C')]),
      })
      expectExactGenerationError(
        inheritance,
        'CF08-UNION-INHERITANCE',
        'C# contract generation failed [CF08-UNION-INHERITANCE] at #/$defs/A: definition "A" is a member of discriminated unions "FirstUnion" and "SecondUnion"; a generated C# member may inherit exactly one union base.',
      )
    })
  })

  describe('D/E — unsupported unions fail closed', () => {
    it('F07 rejects an object/primitive mix independent of arm order', () => {
      const exact = 'C# contract generation failed [CF08-MIXED-UNION] at #/$defs/ObjectOrText/anyOf: unsupported member kinds [object, string]; only T|null, compatible closed-object unions, and closed discriminated-object unions can be emitted to C#.'
      expectExactGenerationError(FIXTURES.F07_OBJECT_OR_PRIMITIVE.schema, 'CF08-MIXED-UNION', exact)
      expectExactGenerationError(
        reverseUnion(FIXTURES.F07_OBJECT_OR_PRIMITIVE.schema, 'ObjectOrText'),
        'CF08-MIXED-UNION',
        exact,
      )
    })

    it('F09 supports a named discriminated array item and rejects anonymous/conflicting items', () => {
      const generated = generateCsharpTypeDeclarations(FIXTURES.F09_ARRAY_ITEM_UNION.schema)
      expect(extractClass(generated, 'public sealed partial class Holder')).toContain(
        'public ItemUnion[] items = Array.Empty<ItemUnion>();',
      )
      expect(generated).toContain('public abstract partial class ItemUnion')
      expect(generated).toContain('return value.ToObject<ItemA>(serializer);')
      expect(generated).toContain('return value.ToObject<ItemB>(serializer);')

      expectExactGenerationError(
        FIXTURES.F09_ANONYMOUS_ARRAY_ITEM_UNION.schema,
        'CF08-ANONYMOUS-UNION',
        'C# contract generation failed [CF08-ANONYMOUS-UNION] at #/$defs/Holder/properties/items/items: non-null unions require x-csharp-name and emitted named members.',
      )
      expectExactGenerationError(
        FIXTURES.F09_ARRAY_PROPERTY_CONFLICT.schema,
        'CF08-INCOMPATIBLE-OBJECT-UNION',
        'C# contract generation failed [CF08-INCOMPATIBLE-OBJECT-UNION] at #/$defs/BadArrayUnion/anyOf: property "items" is not merge-compatible: #/$defs/ArrayInteger/properties/items = required int[]; #/$defs/ArrayText/properties/items = required string[]. Add a required closed string discriminator with disjoint values or make every member\'s property type, presence, nullability, and requiredness identical.',
      )
    })
  })

  describe('current accepted contract and future sentinel', () => {
    it('F10 emits sound request and response union shapes without changing schema identity', () => {
      const schema = FIXTURES.F10_CURRENT_QUOTE_UNIONS.schema
      const request = discriminatedUnion(schema, 'StudioBridgeQuoteRequest')
      expect(request.discriminator).toBe('type')
      expect(request.promotedProperties.map((property) => property.wireName)).toEqual([
        'commandId',
        'expectedStateRevision',
        'protocolVersion',
        'schemaId',
        'sessionId',
      ])
      expect(request.cases.map((member) => [
        member.className,
        member.discriminatorValues,
        member.properties.map((property) => property.wireName),
      ])).toEqual([
        ['StudioQuoteCommissionRequest', ['quoteCommission'], ['draft', 'type']],
        ['StudioQuoteCastingRequest', ['quoteCasting'], ['draft', 'type']],
      ])

      const response = discriminatedUnion(schema, 'StudioQuoteSnapshot')
      expect(response.discriminator).toBe('kind')
      expect(response.promotedProperties.map((property) => property.wireName)).toEqual([
        'commitLabel', 'intentId', 'queueNote', 'queues', 'startsNow',
      ])
      const commission = response.cases.find((member) => member.className === 'StudioCommissionQuoteSnapshot')!
      const casting = response.cases.find((member) => member.className === 'StudioCastingQuoteSnapshot')!
      expect(commission.properties.map((property) => property.wireName)).toContain('consequence')
      expect(commission.properties.map((property) => property.wireName)).toContain('writerName')
      expect(casting.properties.map((property) => property.wireName)).toContain('projectId')
      expect(casting.properties.map((property) => property.wireName)).toContain('totalImmediate')
      expect(response.promotedProperties.map((property) => property.wireName)).not.toContain('title')
      expect(response.promotedProperties.map((property) => property.wireName)).not.toContain('noFeeLine')

      const generated = generateCsharpContract({ schema, protocolVersion: 4, projectionVersion: 11 })
      expect(generated).toContain(
        '// Schema identity: sha256:01f15efc8fc33fd810b051242857385ca23b5e1c775b357db1bfe5a70e907e1e',
      )
      expect(schemaIdentity(schema)).toBe(
        'sha256:01f15efc8fc33fd810b051242857385ca23b5e1c775b357db1bfe5a70e907e1e',
      )
      expect(generated).toContain('public sealed partial class StudioQuoteCastingRequest : StudioBridgeQuoteRequest')
      expect(generated).toContain('public StudioCastingDraftPayload draft;')
      expect(generated).toContain('public sealed partial class StudioQuoteCommissionRequest : StudioBridgeQuoteRequest')
      expect(generated).toContain('public StudioCommissionDraftPayload draft;')
      expect(extractClass(generated, 'public abstract partial class StudioBridgeQuoteRequest')).not.toContain(' draft;')
      expect(extractClass(generated, 'public abstract partial class StudioQuoteSnapshot')).not.toContain(' kind')
      expect(generated).toContain('case "greenlightPicture":')
      expect(generated).toContain('return value.ToObject<StudioCastingQuoteSnapshot>(serializer);')
    })

    it('F11 preserves command member-only directorId and nullable base use', () => {
      const schema = FIXTURES.F11_CURRENT_COMMAND_UNION.schema
      const command = discriminatedUnion(schema, 'StudioProductionCommandSnapshot')
      expect(command.discriminator).toBe('kind')
      expect(command.promotedProperties.map((property) => property.wireName)).toEqual(['label', 'productionId'])
      expect(command.cases.map((member) => [member.className, member.discriminatorValues])).toEqual([
        ['StudioAssignShootingDirectorCommand', ['assignShootingDirector']],
        ['StudioClearSceneryLoadInCommand', ['clearSceneryLoadIn']],
        ['StudioScheduleShootingTakeCommand', ['scheduleShootingTake']],
      ])
      expect(command.cases[0]!.properties.map((property) => property.wireName)).toContain('directorId')
      expect(command.cases[1]!.properties.map((property) => property.wireName)).not.toContain('directorId')
      const generated = generateCsharpTypeDeclarations(schema)
      expect(extractClass(generated, 'public abstract partial class StudioProductionCommandSnapshot')).not.toContain('directorId')
      expect(extractClass(generated, 'public sealed partial class StudioAssignShootingDirectorCommand')).toContain(
        'public string directorId;',
      )
      expect(generated).toContain(
        '[JsonProperty("currentCommand", Required = Required.AllowNull, NullValueHandling = NullValueHandling.Include)]',
      )
    })

    it('F12 emits six concrete Production-state fixture members without promoting conflicts', () => {
      const union = discriminatedUnion(
        FIXTURES.F12_P05_PRODUCTION_SENTINEL.schema,
        'FixtureP05ProductionState',
      )
      expect(union.discriminator).toBe('state')
      expect(union.cases).toHaveLength(6)
      expect(union.discriminatorValues).toEqual([
        'rehearsalWorking',
        'sceneryInTransit',
        'resourceWait',
        'shootingWorking',
        'wrappedWaitingForPost',
        'withheld',
      ])
      expect(union.promotedProperties).toEqual([])
      const generated = generateCsharpTypeDeclarations(FIXTURES.F12_P05_PRODUCTION_SENTINEL.schema)
      for (const member of union.cases) {
        expect(generated).toContain(`public sealed partial class ${member.className} : FixtureP05ProductionState`)
      }
      expect(generated).toContain('case "shootingWorking":')
      expect(generated).toContain('case "wrappedWaitingForPost":')
    })

    it('pins exact positive output identities and deterministic rerendering', () => {
      const expected = {
        F01_STRING_OR_NULL: '797f92b1f532d61f21dad93ba8fea8da02dd5104c4f744213c9832cb2c1f6bdd',
        F02_OBJECT_OR_NULL: '0fef8c834b895f9cf185af8f421357c642dc71984f1b4618a79eba9c4dd60e1f',
        F03_COMPATIBLE_OBJECTS: '99f44add260a66d0eab17a86d3f743110277292606dff073a90a354bad335c68',
        F04_DISCRIMINATED_OBJECTS: 'f7061130f0944956c96351ad03a5dcef51731d971c19a03793b12d30e00451e8',
        F09_ARRAY_ITEM_UNION: '9438c3b42bf7d61c0a873301b350d2f47118ae9c3301165d65df5785fa2019d3',
        F10_CURRENT_QUOTE_UNIONS: 'f8e6b5d8e5ad8c8850b2e225319aaaba259ad0eab5f1d165848f5b3d3dd1eafc',
        F11_CURRENT_COMMAND_UNION: 'f8e6b5d8e5ad8c8850b2e225319aaaba259ad0eab5f1d165848f5b3d3dd1eafc',
        F12_P05_PRODUCTION_SENTINEL: '1ed29c2234adaff32a358d20aa4771302982484e85152cbc23c144e0c1b9699c',
      } as const
      for (const [name, expectedHash] of Object.entries(expected)) {
        const schema = FIXTURES[name as keyof typeof FIXTURES].schema
        const first = generateCsharpTypeDeclarations(schema)
        const second = generateCsharpTypeDeclarations(schema)
        expect(second, name).toBe(first)
        expect(sha256(first), name).toBe(expectedHash)
      }
    })

    it('is a red mutation guard against first-member-wins flattening', () => {
      const request = discriminatedUnion(
        FIXTURES.F10_CURRENT_QUOTE_UNIONS.schema,
        'StudioBridgeQuoteRequest',
      )
      const command = discriminatedUnion(
        FIXTURES.F11_CURRENT_COMMAND_UNION.schema,
        'StudioProductionCommandSnapshot',
      )
      expect(request.promotedProperties.map((property) => property.wireName)).not.toContain('draft')
      expect(request.cases.map((member) => member.properties.find((property) => property.wireName === 'draft')?.storage.csharpType))
        .toEqual(['StudioCommissionDraftPayload', 'StudioCastingDraftPayload'])
      expect(command.promotedProperties.map((property) => property.wireName)).not.toContain('directorId')
      expect(command.cases[0]!.properties.map((property) => property.wireName)).toContain('directorId')
      expect(command.cases.slice(1).every((member) =>
        !member.properties.some((property) => property.wireName === 'directorId'))).toBe(true)
    })
  })

  describe('reference, identifier, and publication guards', () => {
    it('fails unknown references and cycles at exact use paths', () => {
      expectExactGenerationError(
        fixtureSchema({ Holder: closedObject('Holder', { value: reference('Missing') }) }),
        'CF08-REFERENCE',
        'C# contract generation failed [CF08-REFERENCE] at #/$defs/Holder/properties/value: unknown local reference "#/$defs/Missing".',
      )
      expectExactGenerationError(
        fixtureSchema({
          A: closedObject('A', { next: reference('B') }),
          B: closedObject('B', { next: reference('A') }),
        }),
        'CF08-REFERENCE-CYCLE',
        'C# contract generation failed [CF08-REFERENCE-CYCLE] at #/$defs/B/properties/next: local reference cycle [#/$defs/A, #/$defs/B, #/$defs/A] cannot be emitted to C#.',
      )
    })

    it('rejects normalized vocabulary identifiers that collide', () => {
      const schema = fixtureSchema({
        Holder: closedObject('Holder', {
          state: { type: 'string', enum: ['foo-bar', 'foo_bar'] },
        }),
      })
      expectExactGenerationError(
        schema,
        'CF08-IDENTIFIER-COLLISION',
        'C# contract generation failed [CF08-IDENTIFIER-COLLISION] at #/$defs/Holder/properties/state: schema names "foo-bar" and "foo_bar" both emit C# identifier "FooBar".',
      )
    })

    it('renders the whole contract before a caller can invoke any output sink', () => {
      const sink = vi.fn<(value: string) => void>()
      const renderThenPublish = (schema: SchemaNode): void => {
        const rendered = generateCsharpContract({ schema, protocolVersion: 1, projectionVersion: 1 })
        sink(rendered)
      }
      expect(() => renderThenPublish(FIXTURES.F05_CONFLICTING_PROPERTY_TYPES.schema)).toThrow(
        CSharpContractGenerationError,
      )
      expect(sink).not.toHaveBeenCalled()
    })
  })
})
