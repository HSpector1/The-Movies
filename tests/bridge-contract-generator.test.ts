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

    it('preserves nullable value-type array items recursively and initializes the exact element type', () => {
      const nullable = (type: 'boolean' | 'integer' | 'number'): SchemaNode => ({
        anyOf: [{ type }, { type: 'null' }],
      })
      const schema = fixtureSchema({
        Holder: closedObject('Holder', {
          booleans: { type: 'array', items: nullable('boolean') },
          doubles: { type: 'array', items: nullable('number') },
          integers: { type: 'array', items: nullable('integer') },
          matrix: { type: 'array', items: { type: 'array', items: nullable('integer') } },
        }),
      })
      const generated = extractClass(generateCsharpTypeDeclarations(schema), 'public sealed partial class Holder')
      expect(generated).toContain('public bool?[] booleans = Array.Empty<bool?>();')
      expect(generated).toContain('public double?[] doubles = Array.Empty<double?>();')
      expect(generated).toContain('public int?[] integers = Array.Empty<int?>();')
      expect(generated).toContain('public int?[][] matrix = Array.Empty<int?[]>();')

      const reversed = mutableClone(schema)
      const holder = definitions(reversed)['Holder']!
      const properties = holder['properties'] as Record<string, Record<string, unknown>>
      for (const name of ['booleans', 'doubles', 'integers']) {
        const item = properties[name]!['items'] as Record<string, unknown>
        item['anyOf'] = [...(item['anyOf'] as unknown[])].reverse()
      }
      expect(generateCsharpTypeDeclarations(reversed)).toBe(generateCsharpTypeDeclarations(schema))
    })

    it('leaves optional arrays absent while required arrays retain empty initialization', () => {
      const schema = fixtureSchema({
        Holder: closedObject('Holder', {
          optionalItems: { type: 'array', items: { type: 'string' } },
          optionalNullableItems: {
            anyOf: [
              { type: 'array', items: { type: 'integer' } },
              { type: 'null' },
            ],
          },
          requiredItems: { type: 'array', items: { type: 'string' } },
        }, ['requiredItems']),
      })
      const generated = extractClass(generateCsharpTypeDeclarations(schema), 'public sealed partial class Holder')
      expect(generated).toContain('public string[] optionalItems;')
      expect(generated).toContain('public int[] optionalNullableItems;')
      expect(generated).toContain('public string[] requiredItems = Array.Empty<string>();')
      expect(generated).not.toContain('optionalItems = Array.Empty')
      expect(generated).not.toContain('optionalNullableItems = Array.Empty')
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

    it('keeps member storage attached and generated bytes identical when anyOf order reverses', () => {
      const schema = FIXTURES.F04_DISCRIMINATED_OBJECTS.schema
      const reversedSchema = reverseUnion(schema, 'ProbeUnion')
      const reversed = discriminatedUnion(reversedSchema, 'ProbeUnion')
      const byName = new Map(reversed.cases.map((member) => [member.className, member]))
      expect(byName.get('Alpha')?.discriminatorValues).toEqual(['alpha'])
      expect(byName.get('Alpha')?.properties.map((property) => property.wireName)).toEqual(['alphaOnly', 'kind'])
      expect(byName.get('Beta')?.discriminatorValues).toEqual(['beta'])
      expect(byName.get('Beta')?.properties.map((property) => property.wireName)).toEqual(['betaOnly', 'kind'])
      expect(reversed.promotedProperties.map((property) => property.wireName)).toEqual(['shared'])
      const reversals: ReadonlyArray<readonly [SchemaNode, string]> = [
        [schema, 'ProbeUnion'],
        [FIXTURES.F09_ARRAY_ITEM_UNION.schema, 'ItemUnion'],
        [FIXTURES.F10_CURRENT_QUOTE_UNIONS.schema, 'StudioBridgeQuoteRequest'],
        [FIXTURES.F10_CURRENT_QUOTE_UNIONS.schema, 'StudioQuoteSnapshot'],
        [FIXTURES.F11_CURRENT_COMMAND_UNION.schema, 'StudioProductionCommandSnapshot'],
        [FIXTURES.F12_P05_PRODUCTION_SENTINEL.schema, 'FixtureP05ProductionState'],
      ]
      for (const [fixture, unionName] of reversals) {
        expect(generateCsharpTypeDeclarations(reverseUnion(fixture, unionName)), unionName)
          .toBe(generateCsharpTypeDeclarations(fixture))
      }
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
        'C# contract generation failed [CF08-DISCRIMINATOR] at #/$defs/B/properties/kind/const: discriminator "kind" value "same" is claimed by #/$defs/A/properties/kind/const and #/$defs/B/properties/kind/const; discriminator values must be non-empty and pairwise disjoint.',
      )
      expectExactGenerationError(
        reverseUnion(overlap, 'U'),
        'CF08-DISCRIMINATOR',
        'C# contract generation failed [CF08-DISCRIMINATOR] at #/$defs/B/properties/kind/const: discriminator "kind" value "same" is claimed by #/$defs/A/properties/kind/const and #/$defs/B/properties/kind/const; discriminator values must be non-empty and pairwise disjoint.',
      )

      const explicitlyUnsafe = mutableClone(overlap)
      definitions(explicitlyUnsafe)['U']!['x-csharp-discriminator'] = 'kind'
      expectExactGenerationError(
        explicitlyUnsafe,
        'CF08-DISCRIMINATOR-METADATA',
        'C# contract generation failed [CF08-DISCRIMINATOR-METADATA] at #/$defs/B/properties/kind/const: selector "kind" is unsafe because value "same" is claimed by #/$defs/A/properties/kind/const and #/$defs/B/properties/kind/const; discriminator values must be non-empty and pairwise disjoint.',
      )
    })

    it('rejects repeated discriminator literals at the duplicate enum entry', () => {
      const schema = fixtureSchema({
        A: closedObject('A', { kind: { type: 'string', enum: ['a', 'a'] } }),
        B: closedObject('B', { kind: literal('b') }),
        U: namedUnion('U', [reference('A'), reference('B')]),
      })
      expectExactGenerationError(
        schema,
        'CF08-DUPLICATE-LITERAL',
        'C# contract generation failed [CF08-DUPLICATE-LITERAL] at #/$defs/A/properties/kind/enum/1: string enum literal "a" duplicates #/$defs/A/properties/kind/enum/0.',
      )
    })

    it('quotes hostile discriminator values in every generated diagnostic context', () => {
      const schema = fixtureSchema({
        A: closedObject('A', {
          kind: {
            type: 'string',
            enum: ['brace{open', 'quote"value', 'line\nbreak', 'nel\u0085separator', 'unicode\u2028separator'],
          },
        }),
        B: closedObject('B', { kind: literal('plain') }),
        U: namedUnion('U', [reference('A'), reference('B')]),
      })
      const generated = generateCsharpTypeDeclarations(schema)
      expect(generated).not.toContain('$"C# union')
      expect(generated).toContain('case "brace{open":')
      expect(generated).toContain('case "quote\\"value":')
      expect(generated).toContain('case "line\\nbreak":')
      expect(generated).toContain('case "nel\\u0085separator":')
      expect(generated).toContain('case "unicode\\u2028separator":')
      expect(generated).toContain('+ (value ?? "<null>") + "\\".");')
      expect(generated).toContain(
        '+ (discriminator.Value<string>() ?? "<null>") + "\\"; expected [brace{open, quote\\"value, line\\nbreak, nel\\u0085separator, unicode\\u2028separator, plain].");',
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
        ['StudioQuoteCastingRequest', ['quoteCasting'], ['draft', 'type']],
        ['StudioQuoteCommissionRequest', ['quoteCommission'], ['draft', 'type']],
        // P10-R1: the contract quote family (renewal / early release) joins the same envelope.
        ['StudioQuoteContractRequest', ['quoteContract'], ['draft', 'type']],
        // P14A.1: the market-proposal quote family (propose/revise/withdraw) joins it too.
        ['StudioQuoteMarketProposalRequest', ['quoteMarketProposal'], ['draft', 'type']],
        // P09 W1: the placement quote family joins the SAME union envelope.
        ['StudioQuotePlacementRequest', ['quotePlacement'], ['draft', 'type']],
        ['StudioQuoteSetCommissionRequest', ['quoteSetCommission'], ['draft', 'type']],
        // P14B.8: the waiver quote family joins the same envelope.
        ['StudioQuoteWaivePromiseRequest', ['quoteWaivePromise'], ['draft', 'type']],
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

      // P14B.4 (record 600, projection 47): the family-discriminated P2 draft
      // (required seatClass), nullable seatClass on own snapshot/history rows and
      // preferredOpportunity on preferences moved the whole-schema identity.
      // P14B.5 (record 662, projection 48): the `priorityOrder` wire enum gains
      // `relationships` (thin), moving the whole-schema identity again. The
      // literal below is the schemaId of the checked-in
      // generated/unity/project-studio-bridge.contract-manifest.json at 697a6039 (840),
      // read independently of this test (never schemaIdentity(schema) itself).
      const generated = generateCsharpContract({ schema, protocolVersion: 4, projectionVersion: 51 })
      expect(generated).toContain(
        '// Schema identity: sha256:a690e6f9e6f93f3a78f8eed8eaa20a1532a9ebd82812b0bc9414a04fdcb5968f',
      )
      expect(schemaIdentity(schema)).toBe(
        'sha256:a690e6f9e6f93f3a78f8eed8eaa20a1532a9ebd82812b0bc9414a04fdcb5968f',
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
        'sceneryInTransit',
        'rehearsalWorking',
        'shootingWorking',
        'resourceWait',
        'withheld',
        'wrappedWaitingForPost',
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
        F04_DISCRIMINATED_OBJECTS: 'd878443418291974137b9affddf066d3b65d8d09286febebcafec35561a2fc5b',
        F09_ARRAY_ITEM_UNION: '7c1f83b70b0e82152821b0c4a5e59bdedcf901f639445b45ec7ef49010e2af1b',
        // P13B-S7-T3 (projection 40): the public milestone disclosure read model joins
        // the schema — StudioTechnologyForecast and `forecast[]` on the Laboratory page,
        // the optional `replacementLabel` on StudioLaboratoryAction and the required one
        // on StudioAdoptionRow, and the now NULLABLE `StudioIndustryActivity.studioId`
        // (the derived technology-announcement row is minted by the campaign clock, which
        // owns no studio). No quote union and no industry view moved. Both fixtures
        // render the WHOLE current BRIDGE_SCHEMA, so both identities move together.
        // P14A.1-T3 (projection 42): the Profile market case block (StudioMarketCaseSnapshot,
        // the discriminated own/undisclosed proposal rows, attention rows, preferences) and the
        // market-proposal quote family join the schema, so both whole-schema identities move.
        // P14A.2-T2 (projection 43): the Talent Market workspace page (StudioMarketPage and its
        // bucket/detail/history rows), `view:'market'` with the optional `historyPage` on the
        // request, `StudioIndustryResponse.market` and the optional
        // `StudioIndustryActivity.settlementKind` the folded Pulse row carries. No union moved;
        // both whole-schema identities move together again.
        // P14A.3-T2 (projection 44): the world route — StudioWorldRouteSnapshot and
        // StudioWorldCaseRef join the schema, `StudioPersonProfileSnapshot.worldRoute`
        // (required), `StudioRosterRowSnapshot.worldStatusLine` and the public Industry person
        // row's `caseStatusLine`/`caseRef` (all nullable). No union moved; both whole-schema
        // identities move together again.
        // P14B.1-T3 (projection 45): the thin Core promise surface — StudioMarketPromise
        // Snapshot, StudioMarketPromiseHistoryRow, StudioMarketPromiseQuoteSnapshot and
        // StudioMarketProposalPromiseDraftPayload join the schema; `promise` joins BOTH
        // proposal-row members (the own row nullable, the undisclosed row the same
        // `"UNKNOWN"` marker), `trustLabel`/`promiseHistory` join the case block, the
        // market-proposal draft gains an OPTIONAL `promise` and its quote a nullable
        // `promise` verdict, and `priorityOrder` widens to the six landed descriptors. The
        // quote-request union gained no member; both whole-schema identities move together.
        // P14B.2 (projection 46): trust blocks/drivers, bound promise-history
        // identity/outcome fields and promise attention/Pulse facts widen the
        // current schema. F10 and F11 render that WHOLE schema, not frozen union
        // subsets; both exact declaration-body identities therefore move together.
        // P14B.4 (projection 47, record 600): StudioMarketProposalPromiseDraftPayload
        // becomes a family-discriminated union (APPEARANCE_COUNT count-only /
        // LEAD_OR_SIGNIFICANT_ROLE_COUNT with required seatClass), `seatClass`
        // (nullable) joins the own promise snapshot and history rows and
        // `preferredOpportunity` joins the preferences block. Both fixtures render
        // the WHOLE schema, so both declaration-body identities move together.
        // Value computed once by the generator on 027155e7 (600-T2 record), not by
        // this test against itself.
        // P14B.5 (projection 48, record 662): the enum-only widening of
        // `priorityOrder` leaves the C# declarations byte-identical (the generated
        // member stays `string[]`), so both declaration-body identities are
        // UNCHANGED — recomputed once on 040651b4 (662-T2-gen-hash.log), not by
        // this test against itself.
        // P14B.6 (projection 49, record 700): S1 added the `StudioRelationshipBlock`,
        // `StudioRelationshipRow` and `StudioCastingChemistryRow` $defs and S3 added the
        // `chemistry` / `chemistryWarning` members to the casting quote snapshot. F10 and
        // F11 render the WHOLE schema, so the declaration body legitimately GREW and both
        // identities move together, 53058c23… -> d54e9472… (373576 bytes each). Recomputed
        // once by the generator in 700-gen-hash.txt (probe 700-gen-hash-probe.ts, sha256
        // 77983f7e…, run through record-check, EXIT 0, fixedSource true), NOT by this test
        // against itself and never read off a failure message. F12 is the frozen P05 subset
        // and is INDEPENDENT of those $defs: it MUST NOT move, and the probe throws if it
        // does — that unchanged value is the evidence B.6 stayed inside its scope.
        // P14B.8 (projection 50, record 753-W): the waiver quote family added five $defs
        // (`StudioQuoteWaivePromiseRequest`, `StudioPromiseWaiverDraftPayload`, its two
        // substitute members and their union) plus `StudioPromiseWaiverQuoteSnapshot`, and
        // `StudioMarketPromiseHistoryRow` gained `supersededByPromiseId` and `progress`.
        // F10 and F11 render the WHOLE schema, so the declaration body legitimately GREW
        // again and both identities move together, d54e9472… -> 2f2fefaa… (386222 bytes
        // each, up from 373576). Computed once BY THE GENERATOR on the B.8 source through a
        // disposable probe that renders twice and refuses a non-deterministic render, NOT
        // by this test against itself and never read off a failure message. F12 is the
        // frozen P05 subset and is INDEPENDENT of those $defs: the same probe measured it
        // UNCHANGED at 78d68a2d… / 15018 bytes, which is the evidence B.8 stayed in scope.
        F10_CURRENT_QUOTE_UNIONS: '2f2fefaac16b113695e169f8c9cd4aba3ad453f3e78f20e3fdbaa602bbb2eb0e',
        F11_CURRENT_COMMAND_UNION: '2f2fefaac16b113695e169f8c9cd4aba3ad453f3e78f20e3fdbaa602bbb2eb0e',
        F12_P05_PRODUCTION_SENTINEL: '78d68a2d7670585946f79ebbfc449c85c8ad98ac381b422a8a9abea66702bde6',
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
      const requestCases = new Map(request.cases.map((member) => [member.className, member]))
      expect(requestCases.get('StudioQuoteCastingRequest')?.properties
        .find((property) => property.wireName === 'draft')?.storage.csharpType)
        .toBe('StudioCastingDraftPayload')
      expect(requestCases.get('StudioQuoteCommissionRequest')?.properties
        .find((property) => property.wireName === 'draft')?.storage.csharpType)
        .toBe('StudioCommissionDraftPayload')
      expect(requestCases.get('StudioQuotePlacementRequest')?.properties
        .find((property) => property.wireName === 'draft')?.storage.csharpType)
        .toBe('StudioPlacementDraftPayload')
      expect(requestCases.get('StudioQuoteSetCommissionRequest')?.properties
        .find((property) => property.wireName === 'draft')?.storage.csharpType)
        .toBe('StudioSetCommissionDraftPayload')
      expect(command.promotedProperties.map((property) => property.wireName)).not.toContain('directorId')
      const commandCases = new Map(command.cases.map((member) => [member.className, member]))
      expect(commandCases.get('StudioAssignShootingDirectorCommand')?.properties
        .map((property) => property.wireName)).toContain('directorId')
      for (const name of ['StudioClearSceneryLoadInCommand', 'StudioScheduleShootingTakeCommand']) {
        expect(commandCases.get(name)?.properties.some((property) => property.wireName === 'directorId'), name)
          .toBe(false)
      }
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
        'C# contract generation failed [CF08-IDENTIFIER-COLLISION] at #/$defs/Holder/properties/state/enum/1: schema names "foo-bar" and "foo_bar" both emit C# identifier "FooBar".',
      )
    })

    it('rejects duplicate vocabulary literals at the exact enum entry', () => {
      const schema = fixtureSchema({
        Holder: closedObject('Holder', {
          state: { type: 'string', enum: ['ready', 'working', 'ready'] },
        }),
      })
      expectExactGenerationError(
        schema,
        'CF08-DUPLICATE-LITERAL',
        'C# contract generation failed [CF08-DUPLICATE-LITERAL] at #/$defs/Holder/properties/state/enum/2: string enum literal "ready" duplicates #/$defs/Holder/properties/state/enum/0.',
      )
    })

    it('validates compatible and promoted properties in their emitted class scopes', () => {
      const compatible = fixtureSchema({
        U: namedUnion('U', [
          closedObject('InlineA', { 'bad-name': { type: 'string' } }),
          closedObject('InlineB', { 'bad-name': { type: 'string' } }),
        ]),
      })
      expectExactGenerationError(
        compatible,
        'CF08-IDENTIFIER-COLLISION',
        'C# contract generation failed [CF08-IDENTIFIER-COLLISION] at #/$defs/U/anyOf/0/properties/bad-name: schema name "bad-name" emits invalid C# identifier "bad-name".',
      )

      const promoted = fixtureSchema({
        A: closedObject('A', { kind: literal('a'), 'bad-name': { type: 'string' } }),
        B: closedObject('B', { kind: literal('b'), 'bad-name': { type: 'string' } }),
        U: namedUnion('U', [reference('A'), reference('B')]),
      })
      const exact = 'C# contract generation failed [CF08-IDENTIFIER-COLLISION] at #/$defs/A/properties/bad-name: schema name "U.bad-name inherited property" emits invalid C# identifier "bad-name".'
      expectExactGenerationError(promoted, 'CF08-IDENTIFIER-COLLISION', exact)
      expectExactGenerationError(reverseUnion(promoted, 'U'), 'CF08-IDENTIFIER-COLLISION', exact)
    })

    it('rejects enclosing class and synthesized discriminator member collisions', () => {
      const enclosing = fixtureSchema({
        A: closedObject('A', { A: { type: 'string' } }),
      })
      expectExactGenerationError(
        enclosing,
        'CF08-IDENTIFIER-COLLISION',
        'C# contract generation failed [CF08-IDENTIFIER-COLLISION] at #/$defs/A/properties/A: schema names "A enclosing class" and "A" both emit C# identifier "A".',
      )

      const collision = (property: string): SchemaNode => fixtureSchema({
        A: closedObject('A', { kind: literal('a'), [property]: { type: 'string' } }),
        B: closedObject('B', { kind: literal('b') }),
        U: namedUnion('U', [reference('A'), reference('B')]),
      })
      expectExactGenerationError(
        collision('kindValue'),
        'CF08-IDENTIFIER-COLLISION',
        'C# contract generation failed [CF08-IDENTIFIER-COLLISION] at #/$defs/A/properties/kind: schema names "kindValue" and "kind discriminator backing field" both emit C# identifier "kindValue".',
      )
      expectExactGenerationError(
        collision('ExpectedKind'),
        'CF08-IDENTIFIER-COLLISION',
        'C# contract generation failed [CF08-IDENTIFIER-COLLISION] at #/$defs/A/properties/kind: schema names "ExpectedKind" and "kind discriminator constant" both emit C# identifier "ExpectedKind".',
      )
      expectExactGenerationError(
        collision('ValidateUnionMember'),
        'CF08-IDENTIFIER-COLLISION',
        'C# contract generation failed [CF08-IDENTIFIER-COLLISION] at #/$defs/A/properties/kind: schema names "ValidateUnionMember" and "kind discriminator validation method" both emit C# identifier "ValidateUnionMember".',
      )
    })

    it('rejects inherited promoted and vocabulary-enclosing symbol collisions', () => {
      const inherited = fixtureSchema({
        A: closedObject('A', { kind: literal('a'), kindValue: { type: 'string' } }),
        B: closedObject('B', { kind: literal('b'), kindValue: { type: 'string' } }),
        U: namedUnion('U', [reference('A'), reference('B')]),
      })
      expectExactGenerationError(
        inherited,
        'CF08-IDENTIFIER-COLLISION',
        'C# contract generation failed [CF08-IDENTIFIER-COLLISION] at #/$defs/A/properties/kind: schema names "U.kindValue inherited property" and "kind discriminator backing field" both emit C# identifier "kindValue".',
      )

      const vocabulary = fixtureSchema({
        Holder: closedObject('Holder', {
          state: { type: 'string', enum: ['holder-state-values'] },
        }),
      })
      expectExactGenerationError(
        vocabulary,
        'CF08-IDENTIFIER-COLLISION',
        'C# contract generation failed [CF08-IDENTIFIER-COLLISION] at #/$defs/Holder/properties/state/enum/0: schema names "HolderStateValues enclosing vocabulary class" and "holder-state-values" both emit C# identifier "HolderStateValues".',
      )
    })

    it('reserves configured contract class and generated contract member names', () => {
      const schema = fixtureSchema({
        CustomContract: closedObject('CustomContract', { value: { type: 'string' } }),
      })
      let collision: unknown
      try {
        generateCsharpContract({
          schema,
          protocolVersion: 1,
          projectionVersion: 1,
          contractClassName: 'CustomContract',
        })
      } catch (error) {
        collision = error
      }
      expect(collision).toBeInstanceOf(CSharpContractGenerationError)
      expect((collision as Error).message).toBe(
        'C# contract generation failed [CF08-IDENTIFIER-COLLISION] at #/$defs/CustomContract: schema names "CustomContract configured contract class" and "CustomContract" both emit C# identifier "CustomContract".',
      )

      expect(() => generateCsharpContract({
        schema: fixtureSchema({ Holder: closedObject('Holder', { value: { type: 'string' } }) }),
        protocolVersion: 1,
        projectionVersion: 1,
        contractClassName: 'SchemaId',
      })).toThrow(
        'C# contract generation failed [CF08-IDENTIFIER-COLLISION] at #: schema names "SchemaId enclosing class" and "SchemaId generated contract member" both emit C# identifier "SchemaId".',
      )
    })

    it('allows annotation-only $ref siblings and rejects assertions/applicators at the sibling path', () => {
      const annotated = fixtureSchema({
        Holder: closedObject('Holder', {
          target: {
            ...reference('Target'),
            description: 'annotation only',
            default: null,
            'x-note': { ignored: true },
          },
        }),
        Target: closedObject('Target', { id: { type: 'string' } }),
      })
      expect(extractClass(generateCsharpTypeDeclarations(annotated), 'public sealed partial class Holder'))
        .toContain('public Target target;')

      const sibling = (extra: Readonly<Record<string, unknown>>): SchemaNode => fixtureSchema({
        Holder: closedObject('Holder', { target: { ...reference('Target'), ...extra } }),
        Target: closedObject('Target', { id: { type: 'string' } }),
      })
      expectExactGenerationError(
        sibling({ minLength: 1 }),
        'CF08-REFERENCE',
        'C# contract generation failed [CF08-REFERENCE] at #/$defs/Holder/properties/target/minLength: non-annotation $ref sibling "minLength" cannot be emitted without changing its Draft 2020-12 semantics.',
      )
      expectExactGenerationError(
        sibling({ allOf: [{ type: 'object' }] }),
        'CF08-REFERENCE',
        'C# contract generation failed [CF08-REFERENCE] at #/$defs/Holder/properties/target/allOf: non-annotation $ref sibling "allOf" cannot be emitted without changing its Draft 2020-12 semantics.',
      )

      const unionArm = fixtureSchema({
        A: closedObject('A', { kind: literal('a') }),
        B: closedObject('B', { kind: literal('b') }),
        U: namedUnion('U', [{ ...reference('A'), type: 'object' }, reference('B')]),
      })
      expectExactGenerationError(
        unionArm,
        'CF08-REFERENCE',
        'C# contract generation failed [CF08-REFERENCE] at #/$defs/U/anyOf/0/type: non-annotation $ref sibling "type" cannot be emitted without changing its Draft 2020-12 semantics.',
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
