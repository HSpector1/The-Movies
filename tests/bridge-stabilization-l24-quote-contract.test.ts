// Stabilization 2026-10-22, audit finding L-24 (BRIDGE-07): quote snapshots are built by hand
// with `integer()` money fields, and the generated C# consumer types every schema integer as a
// 32-bit int, so a studio holding $2,147,483,648 or more produced quotes that parsed on the
// TypeScript side and failed in Unity on every quote. The runtime's integer is now the
// consumer's int32, every quote response leaves through the published contract, and a
// violation is a NAMED rejection that leaves the session (and the runtime around it) alive.
import { describe, expect, it } from 'vitest'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import type { BridgePlacementDraftPayload } from '../bridge/schema/bridge-schema.ts'
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

describe('L-24: a quote the consumer could not read is a named rejection, and the session goes on', () => {
  it('a studio holding more than int32 cash gets SCHEMA_MISMATCH, nothing is registered, and the next call answers', () => {
    const state = withCash(founded('stabilization-l24'), INT32_MAX + 1)
    const session = new BridgeSession(state)
    const revision = session.stateRevision
    const draft: BridgePlacementDraftPayload = { verb: 'build', blueprintId: 'research-laboratory', origin: firstLegalOrigin(state, 'research-laboratory') }
    const refused = session.quote(quoteEnvelope(session, 'l24-overflow', draft))
    expect(refused.accepted).toBe(false)
    if (refused.accepted) throw new Error('unreachable')
    expect(refused.reasonCode).toBe('SCHEMA_MISMATCH')
    expect(refused.message).toMatch(/quote response violates the published contract: .*32-bit integer/)
    expect(session.stateRevision).toBe(revision)
    // The session is not failed: the same question is answered again, the same way, and a
    // lawful session on the same world (cash inside the range) quotes and registers normally.
    const again = session.quote(quoteEnvelope(session, 'l24-overflow-again', draft))
    expect(again.accepted).toBe(false)
    const lawful = new BridgeSession(withCash(state, INT32_MAX))
    const accepted = lawful.quote(quoteEnvelope(lawful, 'l24-lawful', draft))
    expect(accepted.accepted).toBe(true)
  }, 60_000)
})
