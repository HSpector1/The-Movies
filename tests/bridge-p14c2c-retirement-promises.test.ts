// C.2c private disclosure from a real automatic outcome. Kept separate because
// root tsc excludes bridge*.test.ts and bridge modules use .ts import suffixes.
import { describe, expect, it } from 'vitest'
import { industryPage } from '../bridge/industry.ts'
import { promiseHistoryFor } from '../bridge/promises.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { promiseAttentionRows, trustBlockFor } from '../bridge/trust.ts'
import type { IndustryQuery } from '../bridge/schema/industry-schema.ts'
import { c2cFixture, owner, ownOutcomeReceipt, promiseById, tick } from './helpers/p14c2c-fixtures.js'

describe('P14C.2c VOIDED disclosure', () => {
  it('C10: issuer sees VOIDED history and a retirement explanation without a breach or trust penalty', () => {
    const f = c2cFixture()
    const before = f.lastAdmission
    const after = tick(before)
    expect(promiseById(after, f.promiseId).outcome).toBe('VOIDED')
    const receipt = ownOutcomeReceipt(after, f.promiseId)
    const history = promiseHistoryFor(after, f.actorId, owner(after))
    expect(history.find((p) => p.promiseId === f.promiseId)).toMatchObject({ outcome: 'VOIDED', outcomeWeek: 148,
      progress: 0, contractId: promiseById(before, f.promiseId).contractId })
    const attention = promiseAttentionRows(after, owner(after), 148, f.actorId)
      .filter((r) => r.cause === 'promiseOutcome')
    expect(attention).toHaveLength(1)
    expect(attention[0]!.reason).toMatch(/void/i)
    expect(attention[0]!.reason).toMatch(/retir/i)
    expect(attention[0]!.reason).not.toMatch(/\b(?:kept|broken|waived)\b/i)
    expect(trustBlockFor(after, f.actorId, owner(after), 148)).toEqual(trustBlockFor(before, f.actorId, owner(before), 148))
    expect(receipt.week).toBe(148)
  })

  it('C10: another studio gets no private promise history/attention and public activity invents no breach', () => {
    const f = c2cFixture()
    const after = tick(f.lastAdmission)
    expect(promiseById(after, f.promiseId).outcome).toBe('VOIDED')
    const receipt = ownOutcomeReceipt(after, f.promiseId)
    const rival = after.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!
    expect(rival).toBeDefined()
    expect(promiseHistoryFor(after, f.actorId, rival.studioId)).toEqual([])
    expect(promiseAttentionRows(after, rival.studioId, 148, f.actorId)).toEqual([])
    const sessionId = 'p14c2c-private-outcome'
    const query = (page: number): IndustryQuery => ({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
      sessionId, requestId: `c2c-${page}`, expectedStateRevision: 0, type: 'industryQuery', view: 'pulse',
      targetId: null, page, pageSize: 50, lane: 'recent', period: 'all' })
    const first = industryPage(after, sessionId, 0, query(0))
    const rows = [...first.activities]
    expect(first.pageCount).toBeLessThan(1000)
    for (let page = 1; page < first.pageCount; page++) rows.push(...industryPage(after, sessionId, 0, query(page)).activities)
    expect(rows).toHaveLength(first.totalRows)
    expect(rows.some((row) => row.eventId === receipt.eventId)).toBe(false)
  })
})
