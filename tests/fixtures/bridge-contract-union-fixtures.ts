import { BRIDGE_SCHEMA } from '../../bridge/schema/bridge-schema.ts'
import type { SchemaNode } from '../../scripts/bridge-contract-csharp.ts'

type DefinitionMap = Readonly<Record<string, SchemaNode>>

function text(options: Readonly<Record<string, unknown>> = {}): SchemaNode {
  return { type: 'string', ...options }
}

function integer(options: Readonly<Record<string, unknown>> = {}): SchemaNode {
  return { type: 'integer', minimum: -2_147_483_648, maximum: 2_147_483_647, ...options }
}

function literal(value: string): SchemaNode {
  return { type: 'string', const: value }
}

function enumeration(values: readonly string[]): SchemaNode {
  return { type: 'string', enum: values }
}

function nullable(schema: SchemaNode): SchemaNode {
  return { anyOf: [schema, { type: 'null' }] }
}

function array(items: SchemaNode): SchemaNode {
  return { type: 'array', items }
}

function reference(name: string): SchemaNode {
  return { $ref: `#/$defs/${name}` }
}

function object(
  name: string,
  properties: Readonly<Record<string, SchemaNode>>,
  optional: readonly string[] = [],
): SchemaNode {
  const optionalNames = new Set(optional)
  return {
    type: 'object',
    properties,
    required: Object.keys(properties).filter((key) => !optionalNames.has(key)).sort(),
    additionalProperties: false,
    'x-csharp-name': name,
  }
}

function union(name: string, members: readonly SchemaNode[], discriminator?: string): SchemaNode {
  return {
    anyOf: members,
    'x-csharp-name': name,
    ...(discriminator === undefined ? {} : { 'x-csharp-discriminator': discriminator }),
  }
}

export function fixtureSchema(definitions: DefinitionMap): SchemaNode {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'urn:project-studio:bridge-contract-union-fixture',
    $defs: definitions,
  }
}

export interface BridgeContractUnionFixture {
  readonly id: string
  readonly schema: SchemaNode
}

const f01Definitions: DefinitionMap = {
  Holder: object('Holder', { value: nullable(text()) }),
  Sibling: object('Sibling', { id: text({ minLength: 1 }) }),
}

const f02Definitions: DefinitionMap = {
  Child: object('Child', { id: text({ minLength: 1 }) }),
  Holder: object('Holder', { child: nullable(reference('Child')) }),
  Sibling: object('Sibling', { id: text({ minLength: 1 }) }),
}

const f03Definitions: DefinitionMap = {
  CompatibleA: object('CompatibleA', { id: text(), count: integer() }),
  CompatibleB: object('CompatibleB', { id: text(), count: integer() }),
  CompatibleUnion: union('CompatibleUnion', [reference('CompatibleA'), reference('CompatibleB')]),
  Sibling: object('Sibling', { id: text({ minLength: 1 }) }),
}

const f04Definitions: DefinitionMap = {
  Alpha: object('Alpha', {
    kind: literal('alpha'),
    shared: text(),
    alphaOnly: text(),
  }),
  Beta: object('Beta', {
    kind: literal('beta'),
    shared: text(),
    betaOnly: integer(),
  }),
  ProbeUnion: union('ProbeUnion', [reference('Alpha'), reference('Beta')]),
  ProbeHolder: object('ProbeHolder', { value: reference('ProbeUnion') }),
  Sibling: object('Sibling', { id: text({ minLength: 1 }) }),
}

const f05Definitions: DefinitionMap = {
  TextValue: object('TextValue', { value: text() }),
  IntegerValue: object('IntegerValue', { value: integer() }),
  BadValueUnion: union('BadValueUnion', [reference('TextValue'), reference('IntegerValue')]),
}

const f06Definitions: DefinitionMap = {
  A: object('A', { id: text(), detail: text() }),
  B: object('B', { id: text() }),
  BadPresenceUnion: union('BadPresenceUnion', [reference('A'), reference('B')]),
}

const f06OptionalDefinitions: DefinitionMap = {
  A: object('A', { id: text(), detail: text() }),
  BOptional: object('BOptional', { id: text(), detail: text() }, ['detail']),
  BadOptionalPresenceUnion: union('BadOptionalPresenceUnion', [reference('A'), reference('BOptional')]),
}

const f07Definitions: DefinitionMap = {
  Obj: object('Obj', { id: text() }),
  ObjectOrText: union('ObjectOrText', [reference('Obj'), text()]),
}

const f08Definitions: DefinitionMap = {
  Outer: object('Outer', { payload: reference('NestedBad') }),
  NestedBad: union('NestedBad', [reference('NestedTextValue'), reference('NestedIntegerValue')]),
  NestedTextValue: object('NestedTextValue', { value: text() }),
  NestedIntegerValue: object('NestedIntegerValue', { value: integer() }),
}

const f09Definitions: DefinitionMap = {
  ItemA: object('ItemA', { kind: literal('a'), a: text() }),
  ItemB: object('ItemB', { kind: literal('b'), b: integer() }),
  ItemUnion: union('ItemUnion', [reference('ItemA'), reference('ItemB')]),
  Holder: object('Holder', { items: array(reference('ItemUnion')) }),
}

const f09AnonymousDefinitions: DefinitionMap = {
  Obj: object('Obj', { id: text() }),
  Holder: object('Holder', { items: array({ anyOf: [reference('Obj'), text()] }) }),
}

const f09MismatchDefinitions: DefinitionMap = {
  ArrayText: object('ArrayText', { items: array(text()) }),
  ArrayInteger: object('ArrayInteger', { items: array(integer()) }),
  BadArrayUnion: union('BadArrayUnion', [reference('ArrayText'), reference('ArrayInteger')]),
}

const f12Definitions: DefinitionMap = {
  FixtureBlocker: object('FixtureBlocker', { code: text(), reason: text() }),
  FixtureWrap: object('FixtureWrap', { destination: text() }),
  FixtureRehearsalState: object('FixtureRehearsalState', {
    state: literal('rehearsalWorking'),
    stageId: text(),
    setId: nullable(text()),
    weeksRemaining: integer({ minimum: 0 }),
  }),
  FixtureLoadInState: object('FixtureLoadInState', {
    state: literal('sceneryInTransit'),
    stageId: text(),
    setId: nullable(text()),
    sourceFacilityId: text(),
    destinationStageId: text(),
    weeksRemaining: integer({ minimum: 0 }),
  }),
  FixtureWaitingState: object('FixtureWaitingState', {
    state: literal('resourceWait'),
    blocker: reference('FixtureBlocker'),
    weeksRemaining: nullable(integer({ minimum: 0 })),
  }),
  FixtureShootingState: object('FixtureShootingState', {
    state: literal('shootingWorking'),
    stageId: text(),
    setId: nullable(text()),
    taskStatus: enumeration(['scheduled', 'completed']),
    weeksRemaining: integer({ minimum: 0 }),
  }),
  FixtureWrapState: object('FixtureWrapState', {
    state: literal('wrappedWaitingForPost'),
    wrap: reference('FixtureWrap'),
    weeksRemaining: nullable(integer({ minimum: 0 })),
  }),
  FixtureWithheldState: object('FixtureWithheldState', {
    state: literal('withheld'),
    reason: text(),
  }),
  FixtureP05ProductionState: union('FixtureP05ProductionState', [
    reference('FixtureRehearsalState'),
    reference('FixtureLoadInState'),
    reference('FixtureWaitingState'),
    reference('FixtureShootingState'),
    reference('FixtureWrapState'),
    reference('FixtureWithheldState'),
  ]),
  FixtureP05Holder: object('FixtureP05Holder', { state: reference('FixtureP05ProductionState') }),
}

export const BRIDGE_CONTRACT_UNION_FIXTURES = {
  F01_STRING_OR_NULL: { id: 'F01_STRING_OR_NULL', schema: fixtureSchema(f01Definitions) },
  F02_OBJECT_OR_NULL: { id: 'F02_OBJECT_OR_NULL', schema: fixtureSchema(f02Definitions) },
  F03_COMPATIBLE_OBJECTS: { id: 'F03_COMPATIBLE_OBJECTS', schema: fixtureSchema(f03Definitions) },
  F04_DISCRIMINATED_OBJECTS: { id: 'F04_DISCRIMINATED_OBJECTS', schema: fixtureSchema(f04Definitions) },
  F05_CONFLICTING_PROPERTY_TYPES: {
    id: 'F05_CONFLICTING_PROPERTY_TYPES',
    schema: fixtureSchema(f05Definitions),
  },
  F06_REQUIRED_ABSENT: { id: 'F06_REQUIRED_ABSENT', schema: fixtureSchema(f06Definitions) },
  F06_REQUIRED_OPTIONAL: {
    id: 'F06_REQUIRED_OPTIONAL',
    schema: fixtureSchema(f06OptionalDefinitions),
  },
  F07_OBJECT_OR_PRIMITIVE: { id: 'F07_OBJECT_OR_PRIMITIVE', schema: fixtureSchema(f07Definitions) },
  F08_NESTED_INCOMPATIBLE: { id: 'F08_NESTED_INCOMPATIBLE', schema: fixtureSchema(f08Definitions) },
  F09_ARRAY_ITEM_UNION: { id: 'F09_ARRAY_ITEM_UNION', schema: fixtureSchema(f09Definitions) },
  F09_ANONYMOUS_ARRAY_ITEM_UNION: {
    id: 'F09_ANONYMOUS_ARRAY_ITEM_UNION',
    schema: fixtureSchema(f09AnonymousDefinitions),
  },
  F09_ARRAY_PROPERTY_CONFLICT: {
    id: 'F09_ARRAY_PROPERTY_CONFLICT',
    schema: fixtureSchema(f09MismatchDefinitions),
  },
  F10_CURRENT_QUOTE_UNIONS: {
    id: 'F10_CURRENT_QUOTE_UNIONS',
    schema: BRIDGE_SCHEMA as SchemaNode,
  },
  F11_CURRENT_COMMAND_UNION: {
    id: 'F11_CURRENT_COMMAND_UNION',
    schema: BRIDGE_SCHEMA as SchemaNode,
  },
  F12_P05_PRODUCTION_SENTINEL: {
    id: 'F12_P05_PRODUCTION_SENTINEL',
    schema: fixtureSchema(f12Definitions),
  },
} as const satisfies Readonly<Record<string, BridgeContractUnionFixture>>

function renamedDefinitions(prefix: string, source: DefinitionMap): DefinitionMap {
  const names = Object.keys(source)
  const rename = new Map(names.map((name) => [name, `${prefix}${name}`]))
  const rewrite = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(rewrite)
    if (typeof value !== 'object' || value === null) return value
    const schema = value as Record<string, unknown>
    return Object.fromEntries(Object.entries(schema).map(([key, entry]) => {
      if (key === '$ref' && typeof entry === 'string' && entry.startsWith('#/$defs/')) {
        const name = entry.slice('#/$defs/'.length)
        return [key, `#/$defs/${rename.get(name) ?? name}`]
      }
      if (key === 'x-csharp-name' && typeof entry === 'string') return [key, `${prefix}${entry}`]
      return [key, rewrite(entry)]
    }))
  }
  return Object.fromEntries(names.map((name) => [rename.get(name)!, rewrite(source[name]!) as SchemaNode]))
}

/** Positive F01-F04/F09/F12 aggregate compiled and round-tripped by Unity EditMode. */
export const BRIDGE_CONTRACT_POSITIVE_FIXTURE_SCHEMA = fixtureSchema({
  ...renamedDefinitions('F01', f01Definitions),
  ...renamedDefinitions('F02', f02Definitions),
  ...renamedDefinitions('F03', f03Definitions),
  ...renamedDefinitions('F04', f04Definitions),
  ...renamedDefinitions('F09', f09Definitions),
  ...renamedDefinitions('F12', f12Definitions),
})

export const BRIDGE_CONTRACT_FIXTURE_PROTOCOL_VERSION = 1
export const BRIDGE_CONTRACT_FIXTURE_PROJECTION_VERSION = 1
