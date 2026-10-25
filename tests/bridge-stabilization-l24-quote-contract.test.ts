// Stabilization 2026-10-22, audit finding L-24 (BRIDGE-07): quote snapshots are built by hand
// with `integer()` money fields, and the generated C# consumer types every schema integer as a
// 32-bit int, so a studio holding $2,147,483,648 or more produced quotes that parsed on the
// TypeScript side only because the parse THREW (the runtime coordinator then failed every later
// call). Every quote response leaves through the published contract, the declared int32 bounds
// name the refusal, a schema without bounds still meets the int32 floor, and a violation is a
// NAMED rejection that leaves the session (and the runtime around it) alive.
// Owner decision 18A (projection 62) widened the quote snapshots' cashBefore/cashAfter to `number()`, so the
// overflow case is now an ACCEPTED quote carrying the wide value; the int32 unit cases still guard every `integer()`,
// and the session's guard keeps its witness: a quote with an out-of-range `integer()` field (forced, since no
// lawful world reaches one any more) is still a named rejection that leaves the session alive.
import { describe, expect, it, vi } from 'vitest'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import type { BridgePlacementDraftPayload } from '../bridge/schema/bridge-schema.ts'
import { BRIDGE_SCHEMA } from '../bridge/schema/bridge-schema.ts'
import * as placementModule from '../bridge/placement.ts'
import { BridgeSchemaError, parseWireValue } from '../bridge/schema/runtime.ts'
import { BridgeSession } from '../bridge/session.ts'
import { applyActions, beginFounding, contractOffer, FOUNDING_MINIMUMS, generateWorld, queryPlacement } from '../src/core/index.js'
import type { CreativeRole, GameState, LotCell } from '../src/core/index.js'
import { withCash } from './contracts/_contractFixtures.js'

const INT32_MAX = 2_147_483_647

/** The placement quote test's founding path (tests/bridge-p09a-w1-placement-quote.test.ts). */
function founded(seed: string): GameState {
  let next = beginFounding(generateWorld(seed, { regime: 'endowed' }))
  const applicants = next.founding!.applicantIds.map((id) => next.talent.find((t) => t.id === id)!)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const satisfies readonly CreativeRole[]) {
    const pool = applicants.filter((t) => t.role === role)
      .map((t) => ({ t, offer: contractOffer(next, t.id, 104) }))
      .sort((a, b) => a.offer.annualSalary - b.offer.annualSalary)
    for (const { t } of pool.slice(0, FOUNDING_MINIMUMS[role])) {
      next = applyActions(next, [{ kind: 'signContract', talentId: t.id, termWeeks: 104 }])
    }
  }
  return applyActions(next, [{ kind: 'foundStudio' }, { kind: 'activateStudioOperations' }])
}
function firstLegalOrigin(state: GameState, blueprintId: string): LotCell {
  for (let gy = 0; gy < 26; gy++) for (let gx = 0; gx < 28; gx++) {
    if (queryPlacement(state, { blueprintId, origin: { gx, gy } }).ok) return { gx, gy }
  }
  throw new Error(`no legal origin for ${blueprintId}`)
}
function quoteEnvelope(session: BridgeSession, commandId: string, draft: BridgePlacementDraftPayload) {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId,
    expectedStateRevision: session.stateRevision, type: 'quotePlacement' as const, draft }
}

describe('L-24: the wire integer is the consumer\'s int32', () => {
  it.each([INT32_MAX, -INT32_MAX - 1, 0])('admits %s', (value) => {
    expect(parseWireValue({ type: 'integer' } as const, value)).toBe(value)
  })
  it.each([INT32_MAX + 1, -INT32_MAX - 2, 2 ** 40])('refuses %s by name', (value) => {
    expect(() => parseWireValue({ type: 'integer' } as const, value)).toThrow(BridgeSchemaError)
    expect(() => parseWireValue({ type: 'integer' } as const, value)).toThrow(/32-bit integer/)
  })
})

describe('L-24 / 18A: a studio holding more than int32 cash quotes normally (projection 62)', () => {
  it('cashBefore/cashAfter carry the wide value, the intent registers, and the revision is unchanged', () => {
    const state = withCash(founded('stabilization-l24'), INT32_MAX + 1)
    const session = new BridgeSession(state)
    const revision = session.stateRevision
    const draft: BridgePlacementDraftPayload = { verb: 'build', blueprintId: 'research-laboratory', origin: firstLegalOrigin(state, 'research-laboratory') }
    const answered = session.quote(quoteEnvelope(session, 'l24-wide', draft))
    if (!answered.accepted) throw new Error(`premise: the wide-cash quote is accepted, got ${answered.reasonCode}: ${answered.message}`)
    expect(answered.quote.ok).toBe(true)
    // 18A widened the quote snapshots' cash to `number()`, the double every other wire cash field already is.
    expect(answered.quote.cashBefore).toBe(INT32_MAX + 1)
    expect(answered.quote.cashAfter).toBe(INT32_MAX + 1 - answered.quote.cost)
    // All four quote snapshots carry the widened cash: casting's nullable, placement, set commission and contract.
    for (const [name, shape] of [
      ['StudioCastingQuoteSnapshot', { anyOf: [{ type: 'number' }, { type: 'null' }] }],
      ['StudioPlacementQuoteSnapshot', { type: 'number' }],
      ['StudioSetCommissionQuoteSnapshot', { type: 'number' }],
      ['StudioContractQuoteSnapshot', { type: 'number' }],
    ] as const) {
      const properties = BRIDGE_SCHEMA.$defs[name].properties as Record<string, unknown>
      for (const field of ['cashBefore', 'cashAfter']) expect(properties[field], `${name}.${field}`).toEqual(shape)
    }
    expect(session.stateRevision).toBe(revision)
    // The lawful answer registers its intent (the session's own map), exactly as a quote inside the int32 range does.
    expect((session as unknown as { pendingQuotes: Map<string, unknown> }).pendingQuotes.has(answered.quote.intentId)).toBe(true)
    const lawful = new BridgeSession(withCash(state, INT32_MAX))
    const inRange = lawful.quote(quoteEnvelope(lawful, 'l24-lawful', draft))
    expect(inRange.accepted).toBe(true)
  }, 60_000)
})

describe('L-24: a quote the consumer could not read is a named rejection, and the session goes on', () => {
  it('an out-of-contract quote field gets SCHEMA_MISMATCH, nothing is registered, and the next call answers', () => {
    const state = founded('stabilization-l24')
    const draft: BridgePlacementDraftPayload = { verb: 'build', blueprintId: 'research-laboratory', origin: firstLegalOrigin(state, 'research-laboratory') }
    // The placement quote's `cost` is a `nonNegativeInteger()` (int32 maximum); the builder is forced past it, the only
    // way left to reach the guard after 18A widened the one field a real world overflowed.
    const real = placementModule.placementQuoteSnapshot
    const forced = vi.spyOn(placementModule, 'placementQuoteSnapshot').mockImplementation((...args) => ({ ...real(...args), cost: 2 ** 31 }))
    try {
      const session = new BridgeSession(state)
      const revision = session.stateRevision
      const refused = session.quote(quoteEnvelope(session, 'l24-overflow', draft))
      expect(forced).toHaveBeenCalled()
      expect(refused.accepted).toBe(false)
      if (refused.accepted) throw new Error('unreachable')
      expect(refused.reasonCode).toBe('SCHEMA_MISMATCH')
      // The field's declared int32 bound names the refusal.
      expect(refused.message).toMatch(/quote response violates the published contract: .*expected a value <= 2147483647/)
      expect(session.stateRevision).toBe(revision)
      // Nothing was registered: the intent registers only after a lawful mint (the session's own map).
      expect((session as unknown as { pendingQuotes: Map<string, unknown> }).pendingQuotes.size).toBe(0)
      // The session is not failed: the same question is answered again, the same way.
      const again = session.quote(quoteEnvelope(session, 'l24-overflow-again', draft))
      expect(again.accepted).toBe(false)
      if (again.accepted) throw new Error('unreachable')
      expect(again.reasonCode).toBe('SCHEMA_MISMATCH')
      expect((session as unknown as { pendingQuotes: Map<string, unknown> }).pendingQuotes.size).toBe(0)
    } finally {
      forced.mockRestore()
    }
    // A lawful session on the same world quotes and registers normally.
    const lawful = new BridgeSession(state)
    const accepted = lawful.quote(quoteEnvelope(lawful, 'l24-lawful', draft))
    if (!accepted.accepted) throw new Error(`premise: the lawful quote is accepted, got ${accepted.reasonCode}: ${accepted.message}`)
    expect((lawful as unknown as { pendingQuotes: Map<string, unknown> }).pendingQuotes.has(accepted.quote.intentId)).toBe(true)
  }, 60_000)
})
