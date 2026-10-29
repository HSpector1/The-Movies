// Playtest-response slice (decision 6b, review FIX-1 item 4): `firstRefusal` must be exact. For every shape the DSL
// produces and the malformed shapes the review named, the message it returns is the message `project` throws first,
// and it never refuses a value `project` accepts. Each row compares the two on the same schema and value under both
// additional-property modes; `undefined` from firstRefusal is always allowed (the walk stopped), a message is not.
import { describe, expect, it } from 'vitest'
import { BridgeSchemaError, firstRefusal, projectForTest, schemaDefinition } from '../bridge/schema/runtime.ts'
import { enumeration, integer, literal, nullable, number, object, text, union } from '../bridge/schema/dsl.ts'

type Options = { stripAdditionalProperties: boolean }
function projectMessage(schema: Record<string, unknown>, value: unknown, options: Options): string | undefined {
  try { projectForTest(schema as never, value, options); return undefined } catch (error) {
    if (error instanceof BridgeSchemaError) return error.message
    return `plain: ${(error as Error).message}`
  }
}

const Cancel = object('Cancel', { week: integer({ minimum: 0 }), cause: enumeration(['producer', 'deadline']) })
const Row = object('Row', { kind: literal('row'), title: text({ minLength: 1 }), count: integer({ minimum: 0 }), ratio: number({ minimum: 0, maximum: 1 }), cancel: nullable(Cancel), tags: { type: 'array', items: text() } })
const Other = object('Other', { kind: literal('other'), code: text({ pattern: '^[a-z]+$' }) })
const Union = union('RowOrOther', [Row, Other])
const shapes: [string, Record<string, unknown>, unknown[]][] = [
  ['literal string', literal('x') as never, ['x', 'y', 1, null]],
  ['literal out-of-range integer (malformed)', { const: 3000000000, type: 'integer' }, [3000000000, 1]],
  ['untyped const (malformed)', { const: 'x' }, ['x', 'y']],
  ['enumeration', enumeration(['a', 'b']) as never, ['a', 'c', 2]],
  ['bounded integer', integer({ minimum: 0, maximum: 10 }) as never, [5, -1, 11, 1.5, 'x', 2147483648]],
  ['number', number({ minimum: 0, maximum: 1 }) as never, [0.5, 2, Number.NaN, 'x']],
  ['text with minLength', text({ minLength: 1 }) as never, ['a', '', 1]],
  ['nullable object', nullable(Cancel) as never, [null, { week: 1, cause: 'producer' }, { week: -1, cause: 'producer' }, 'x', { cause: 'producer' }]],
  ['object with array and nested nullable', Row as never, [
    { kind: 'row', title: 't', count: 1, ratio: 0.5, cancel: null, tags: [] },
    { kind: 'other', title: 't', count: 1, ratio: 0.5, cancel: null, tags: [] },
    { kind: 'row', title: '', count: 1, ratio: 0.5, cancel: null, tags: [] },
    { kind: 'row', title: 't', count: 1, ratio: 0.5, cancel: { week: 1, cause: 'bogus' }, tags: [] },
    { kind: 'row', title: 't', count: undefined, ratio: 0.5, cancel: null, tags: [] },
    { kind: 'row', title: 't', count: 1, ratio: 0.5, cancel: null, tags: [], extra: 1 },
    { kind: 'row', title: 't', count: 1, ratio: 0.5, cancel: null, tags: [1] },
  ]],
  ['union of discriminated objects', Union as never, [
    { kind: 'row', title: 't', count: 1, ratio: 0.5, cancel: null, tags: [] }, { kind: 'other', code: 'abc' }, { kind: 'other', code: 'ABC' }, { kind: 'none' }, 'x', null,
  ]],
  ['required list with a non-string entry (malformed)', { type: 'object', properties: { a: { type: 'string' } }, required: ['a', 7] }, [{ a: 'x' }, { b: 1 }]],
  ['nested $ref from the bridge schema', { $ref: '#/$defs/StudioTelevisionCancellation' }, [{ week: 3, cause: 'rights' }, { week: 3, cause: 'bogus' }, { week: -1, cause: 'rights' }, 'x']],
]

describe('bridge schema runtime — firstRefusal is exact against project', () => {
  for (const [name, schema, values] of shapes) {
    for (const strip of [false, true]) {
      it(`${name}, stripAdditionalProperties=${String(strip)}`, () => {
        for (const value of values) {
          const options = { stripAdditionalProperties: strip }
          const expected = projectMessage(schema, value, options)
          const actual = firstRefusal(schema as never, value, '$', options)
          if (actual !== undefined) expect(actual, JSON.stringify(value)).toBe(expected)
          if (expected === undefined) expect(actual, `accepted by project: ${JSON.stringify(value)}`).toBeUndefined()
        }
      })
    }
  }

  it('reads the real television cancellation definition through the schema registry', () => {
    expect(schemaDefinition('StudioTelevisionCancellation')).toMatchObject({ type: 'object' })
  })
})
