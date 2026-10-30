// Prepared for the actual Save48→49 restack; no synthetic readers or campaign edits.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'
import { applyActions, makeSave, migrateToLive, stableStringify, tick } from '../src/core/index.js'
import { validateSaveV26 } from '../src/core/save.js'
import { conditionRecord, outstandingLoan } from '../src/core/corporateConditionLive.js'
import { loanMaxPrincipal } from '../src/core/studioLoan.js'
import { studioWeeklyFixedCost } from '../src/core/powerRankingArchive.js'
import { conditionFactsFor, corporateConditionReaders, permittedBidderRefusal } from '../src/core/rightsFinance.js'
function initial() {
  const bytes = readFileSync(new URL('./fixtures/p13b/legacy-v26-lighting-restored-795.json.gz', import.meta.url))
  expect(createHash('sha256').update(bytes).digest('hex')).toBe('47d266bccb7871450e089f886d4565c970e97ad1b0af54d297733b064416312f')
  const raw = JSON.parse(gunzipSync(bytes).toString()), before = stableStringify(raw)
  validateSaveV26(raw)
  const state = migrateToLive(raw).state
  expect(stableStringify(raw)).toBe(before)
  makeSave(state)
  return state
}
function advance(state: ReturnType<typeof initial>) {
  const before = stableStringify(state)
  const next = tick(state)
  expect(stableStringify(state)).toBe(before)
  makeSave(next)
  return next
}
describe('P16 default readers consume real P15B evaluated condition and loan authority', () => {
  it('fails closed before evaluation and permits the genuinely evaluated stable borrower without a loan', () => {
    let state = initial()
    const id = state.hollywood!.playerStudioId, before = stableStringify(state)
    expect(corporateConditionReaders.conditionRecord).toBe(conditionRecord)
    expect(corporateConditionReaders.outstandingLoan).toBe(outstandingLoan)
    expect(conditionRecord(state, id)).toBeUndefined()
    expect(conditionFactsFor(state, id, state.market.tick)).toBeNull()
    expect(permittedBidderRefusal(state, id, state.market.tick)).toBe('conditionUnavailable')
    expect(stableStringify(state)).toBe(before)
    state = advance(state)
    const evaluated = stableStringify(state)
    expect(conditionRecord(state, id)?.condition.stage).toBe('stable')
    expect(outstandingLoan(state, id)).toBeUndefined()
    expect(conditionFactsFor(state, id, state.market.tick)).toEqual({ stage: 'stable', hasOutstandingLoan: false })
    expect(permittedBidderRefusal(state, id, state.market.tick)).toBeNull()
    expect(stableStringify(state)).toBe(evaluated)
  })
  it('refuses a real public loan even after ordinary evaluated recovery returns the bidder to stable', () => {
    let state = initial()
    const id = state.hollywood!.playerStudioId
    // One fixed retained route, bounded observation only. A failed premise fails this test.
    while (state.market.tick < 830 && conditionRecord(state, id)?.condition.stage !== 'warning') state = advance(state)
    expect(conditionRecord(state, id)?.condition.stage).toBe('warning')
    expect(outstandingLoan(state, id)).toBeUndefined()
    const input = state, before = stableStringify(state)
    const principal = loanMaxPrincipal(studioWeeklyFixedCost(state, id))
    expect(principal).toBeGreaterThan(0)
    state = applyActions(state, [{ kind: 'takeLoan', principal }])
    expect(stableStringify(input)).toBe(before)
    makeSave(state)
    const loan = outstandingLoan(state, id)
    expect(loan).toBeDefined()
    expect(loan!.principal).toBe(principal)
    const contracted = state.market.tick
    while (state.market.tick < contracted + 13 && conditionRecord(state, id)?.condition.stage !== 'stable') state = advance(state)
    expect(conditionRecord(state, id)?.condition.stage).toBe('stable')
    expect(outstandingLoan(state, id)?.loanId).toBe(loan!.loanId)
    const evaluated = stableStringify(state)
    expect(conditionFactsFor(state, id, state.market.tick)).toEqual({ stage: 'stable', hasOutstandingLoan: true })
    expect(permittedBidderRefusal(state, id, state.market.tick)).toBe('outstandingDistressLoan')
    expect(stableStringify(state)).toBe(evaluated)
  })
})
