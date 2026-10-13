// Proposed NEW src/harness/d16/terminal.test.ts; real engine/harness, no mock/validator bypass.
// All existing D16 test assertions/timeouts remain untouched and still must execute.
import { describe, expect, it } from 'vitest'
import { tick, closureRecordOf, makeSave, stableStringify } from '../../core/index.js'
import { base, drainPlayer } from '../../../tests/helpers/p15b-live.js'
import { runOne } from './driver.js'
import { doNothing, publicitySpamAdversary, type PlayerPolicy } from './policies.js'
import { DEFAULT_PUBLICITY } from './publicity.js'
import { reconciledCash } from './view.js'

describe('d16 actual terminal boundary — complete ledger result without surviving requested horizon', () => {
  it('publicity adversary reaches real closure, retains nonvacuous spend and complete reconciliation', () => {
    const rec = runOne({ seed: 'd16-0001', policy: publicitySpamAdversary, horizonWeeks: 104, publicity: DEFAULT_PUBLICITY, keepFullSeries: true })
    expect(rec.horizonWeeks).toBe(104) // Requested, not a survived104-week campaign.
    expect(rec.terminal?.reason).toBe('actualPlayerClosure')
    expect(rec.terminal!.closureId).not.toBe('')
    expect(rec.endWeek).toBe(rec.terminal!.closureWeek)
    expect(rec.terminal!.weeksElapsed).toBe(rec.endWeek-rec.startWeek)
    expect(rec.terminal!.weeksElapsed).toBeLessThan(rec.horizonWeeks)
    expect(rec.terminal!.requestedWeeks).toBe(104)
    expect(rec.publicity!.count).toBeGreaterThan(5)
    expect(rec.publicity!.spend).toBeGreaterThan(0)
    expect(rec.reconciliationOk).toBe(true)
    expect(rec.ledgerTotals.termination).toBe(-rec.publicity!.spend)
    expect(Object.values(rec.awareness!.timeInBand).reduce((sum,n)=>sum+n,0)).toBe(rec.terminal!.weeksElapsed)
    expect(rec.slices['104']).toBeUndefined() // Do not mint an unreached slice.
  })

  it('already admitted actual terminal skips policy/publicity/tick and keeps complete initial bytes', () => {
    // Labelled transaction control on genuine admitted130; no clocks/receipts/backdating/topups.
    const start = base(); expect(() => makeSave(start)).not.toThrow()
    let state = drainPlayer(start, Math.floor(start.studio.cash)+1)
    expect(() => makeSave(state)).not.toThrow()
    while (closureRecordOf(state,state.hollywood!.playerStudioId) === undefined && state.market.tick < 164) state=tick(state,{develop:true})
    const closure = closureRecordOf(state,state.hollywood!.playerStudioId)
    expect(closure).toBeDefined(); expect(() => makeSave(state)).not.toThrow()
    const before = stableStringify(state)
    let decisions=0, publicity=0
    const observed: PlayerPolicy = { ...doNothing, name: 'observed-real-doNothing-terminal',
      decide(view,ctx) { decisions++; return doNothing.decide(view,ctx) },
      publicize() { publicity++; return null } }
    const rec = runOne({seed:state.seed, policy:observed, initialState:state, horizonWeeks:4, publicity:DEFAULT_PUBLICITY})
    expect(decisions).toBe(0); expect(publicity).toBe(0)
    expect(rec.startWeek).toBe(closure!.closureWeek); expect(rec.endWeek).toBe(rec.startWeek)
    expect(rec.terminal).toMatchObject({closureId:closure!.closureId,closureWeek:closure!.closureWeek,weeksElapsed:0,requestedWeeks:4})
    expect(rec.endCash).toBe(state.studio.cash); expect(rec.reconciliationOk).toBe(true)
    expect(rec.publicity!.count).toBe(0); expect(rec.publicity!.spend).toBe(0)
    expect(Math.abs(reconciledCash(state)-state.studio.cash)).toBeLessThanOrEqual(1e-6)
    expect(stableStringify(state)).toBe(before)
  })

  it('ordinary operating route retains the requested horizon and policy/publicity cadence', () => {
    const state=base(); expect(() => makeSave(state)).not.toThrow(); const before=stableStringify(state)
    let decisions=0, publicity=0
    const observed:PlayerPolicy={...doNothing,name:'observed-real-doNothing-operating',
      decide(view,ctx) {decisions++;return doNothing.decide(view,ctx)},publicize(){publicity++;return null}}
    const rec=runOne({seed:state.seed,policy:observed,initialState:state,horizonWeeks:2,publicity:DEFAULT_PUBLICITY})
    expect(decisions).toBe(2);expect(publicity).toBe(2)
    expect(rec.endWeek-rec.startWeek).toBe(2);expect(rec.horizonWeeks).toBe(2);expect(rec.terminal).toBeUndefined()
    expect(rec.reconciliationOk).toBe(true);expect(stableStringify(state)).toBe(before)
  })
})
