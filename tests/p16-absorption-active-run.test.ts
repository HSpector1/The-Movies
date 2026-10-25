// UNRUN source-grounded clean-target transaction controls. Original48 capture has an explicitly
// disclosed R04 condition/finance constructor; R03 is unchanged. This is not natural campaign proof.
// No STABLE readers, new cash/history/work, clock changes, seed/retention/price fallback or wider timeout.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import * as saves from '../src/core/save.js'
import * as acquisition from '../src/core/acquisition.js'
import { requestDiligence } from '../src/core/dueDiligence.js'
import { conditionRecord, outstandingLoan } from '../src/core/corporateConditionLive.js'
import { terminationCost } from '../src/core/employment.js'
import { libraryValuationV1 } from '../src/core/propertyValuation.js'
import { resolveTitles, subjectsHeldBy } from '../src/core/rights.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import {financeTotals,periodSummary} from '../src/core/economyView.js'
import {recordedFinancePeriod,financeHistory} from '../src/core/financeReport.js'
const TARGET='studio-aca408ec-r01',FILM=TARGET+':film:13'
const PIN='cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19'

function prepared() {
 const root=process.env.P16_ORIGINAL48_CAPTURE_ROOT;expect(root).toBeTruthy()
 const bytes=readFileSync(root+'/r04-pre162.save48.json')
 expect(createHash('sha256').update(bytes).digest('hex')).toBe(PIN)
 const raw=JSON.parse(bytes.toString()),rawBefore=saves.stableStringify(raw)
 const old=saves.validateSaveP15B(raw);expect(old.saveVersion).toBe(48)
 const oldBefore=saves.stableStringify(old)
 const current=saves.convertV48ToV49(old);let initial=current.state
 expect(initial.market.tick).toBe(162)
 const paid=initial.hollywood!.businesses.find(b=>b.studioId===TARGET)!.productions.find(p=>p.id===FILM)!
 expect(paid).toMatchObject({startTick:161,remainingTicks:8})
 const completionBoundary=162+paid.remainingTicks;expect(completionBoundary).toBe(170)
 while(initial.market.tick<completionBoundary) {const prior=initial,before=JSON.stringify(prior);initial=tick(prior);expect(JSON.stringify(prior)).toBe(before)}
 saves.makeSave(initial)
 expect(current.saveVersion).toBe(49);expect(initial.market.tick).toBe(170)
 const player=initial.hollywood!.playerStudioId,source=initial.hollywood!.businesses.find(b=>b.studioId===TARGET)!
 expect(source,'fixed retained R03 prerequisite').toBeDefined()
 expect(Number.isFinite(source.account.cash)).toBe(true);expect(source.account.cash).toBeGreaterThan(0)
 expect(source.productions).toHaveLength(0);expect(source.runs).toHaveLength(1);expect(source.runs[0]!.productionId).toBe(FILM);expect(source.runs[0]!.weekIndex).toBe(170-source.runs[0]!.releaseTick)
 expect(conditionRecord(initial,player)?.condition).toMatchObject({stage:'stable',week:170})
 expect(conditionRecord(initial,TARGET)?.condition).toMatchObject({stage:'stable',week:170})
 expect(outstandingLoan(initial,player,170)).toBeUndefined();expect(outstandingLoan(initial,TARGET,170)).toBeUndefined()
 expect(acquisition.absorptionProducerRefusal(initial,{buyerId:player,targetId:TARGET,consideration:1,retention:{kind:'default'},disclosureId:null})).toBeNull()
 const original=initial.hollywood!.activeEmploymentOrdinals.map(i=>initial.hollywood!.employment[i]!)
  .filter(e=>e.studioId===TARGET&&e.endedWeek===null&&e.terms.startWeek<=170&&170<e.terms.endWeekExclusive)
 expect(original).toHaveLength(6);expect(original.every(e=>e.terms.endWeekExclusive>170)).toBe(true)
 // ONE fixed explicit choice: the first authoritative target interval; fail if that person cannot lawfully continue.
 const retention={kind:'explicit' as const,contractIds:[]}
 const initialBefore=saves.stableStringify(initial)
 const diligence=requestDiligence(initial,{recipientId:player,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']},170)
 expect(saves.stableStringify(initial)).toBe(initialBefore);saves.makeSave(diligence.state)
 expect(diligence.record).toMatchObject({week:170,recipientId:player,target:{kind:'studio',studioId:TARGET}})
 expect(diligence.state.studio.cash).toBe(initial.studio.cash-diligence.record.fee)
 expect(diligence.record.fee).toBeGreaterThan(0)
 const expectedExits=original.reduce((sum,e)=>sum+terminationCost(e.terms,170),0)
 const postExitCash=source.account.cash-expectedExits
 const library=libraryValuationV1(diligence.state,TARGET,170);expect(library.kind).toBe('available')
 if(library.kind!=='available')throw new Error('fixed R03 library valuation premise absent')
 // The single lawful whole consideration at the public ask; not an amount sweep or edited account.
 const consideration=Math.ceil(acquisition.absorptionAsk(library.total,postExitCash))
 const previewInput={buyerId:player,targetId:TARGET,consideration,retention,disclosureId:diligence.record.id}
 const quote=acquisition.quoteAbsorption(diligence.state,previewInput,170)
 expect(quote.kind,'actual person/willingness/reserve/retention premise, no fallback').toBe('quote')
 if(quote.kind!=='quote')throw new Error(quote.refusal)
 expect(quote.affordable).toBe(true)
 expect(quote.contracts.filter(c=>c.retained)).toEqual([])
 expect(quote.contracts.filter(c=>!c.retained)).toHaveLength(6);expect(quote.productions).toEqual([]);expect(quote.runs).toHaveLength(1);expect(quote.runs[0]!.productionId).toBe(FILM)
 expect(quote.exitCharges).toBe(expectedExits);expect(expectedExits).toBeGreaterThan(0)
 expect(quote.targetCashBeforeExits).toBe(source.account.cash);expect(quote.postExitCash).toBe(postExitCash)
 expect(quote.quoteAgePolicyVersion).toBe(1);expect(quote.quotedAtWeek).toBe(170)
 const input={...previewInput,quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion}
 const state=diligence.state,before=saves.stableStringify(state)
 const subjects=subjectsHeldBy(resolveTitles(state),state.rights.estates,TARGET,170)
 expect(subjects.length,'real nonempty held-title transition required').toBeGreaterThan(0)
 return {raw,rawBefore,old,oldBefore,initial,initialBefore,state,before,player,source,original,quote,input,subjects}
}
function originalUnchanged(p:ReturnType<typeof prepared>) {
 expect(saves.stableStringify(p.state)).toBe(p.before)
 expect(saves.stableStringify(p.initial)).toBe(p.initialBefore)
 expect(saves.stableStringify(p.old)).toBe(p.oldBefore)
 expect(saves.stableStringify(p.raw)).toBe(p.rawBefore)
}
function absorbed(p:ReturnType<typeof prepared>) {
 const result=acquisition.closeAbsorption(p.state,p.input,170);originalUnchanged(p)
 const record=result.rights.absorptions.find(a=>a.targetId===TARGET)!
 expect(record.runs).toHaveLength(1);expect(record.runReceipts).toEqual([])
 const run=p.source.runs[0]!
 expect(record.runs[0]).toEqual({productionId:FILM,beneficiaryFromWeek:p.state.market.tick,startingWeekIndex:run.weekIndex,grossPaidBeforeClose:run.cumulativeGrossPaid,revenuePaidBeforeClose:run.cumulativeStudioRevenuePaid})
 return {result,record,run}
}
function serviceToSettlement(p:ReturnType<typeof prepared>) {
 const c=absorbed(p);let state=c.result
 const end=c.run.releaseTick+c.run.totalWeeks;expect(end).toBeGreaterThan(170);expect(end).toBeLessThanOrEqual(180)
 const targetCash=state.hollywood!.businesses.find(b=>b.studioId===TARGET)!.account.cash
 for(let boundary=171;boundary<=end;boundary++) {
  const previous=state,before=JSON.stringify(previous),oldLedgerLength=previous.ledger.length
  state=tick(previous);expect(JSON.stringify(previous)).toBe(before);expect(state.market.tick).toBe(boundary)
  const record=state.rights.absorptions.find(a=>a.id===c.record.id)!,receipt=record.runReceipts.at(-1)!
  const index=boundary-1-c.run.releaseTick,gross=c.run.weeklyGross[index]!,revenue=gross*c.run.studioShare
  expect(receipt).toMatchObject({week:boundary-1,productionId:FILM,weekIndex:index,gross,revenue})
  expect(record.runReceipts.filter(r=>r.weekIndex===index&&r.productionId===FILM)).toHaveLength(1)
  const rows=state.ledger.filter(e=>e.kind==='absorbedRunRevenue'&&e.note===receipt.id)
  expect(rows).toHaveLength(revenue>0?1:0);if(revenue>0)expect(rows[0]).toMatchObject({week:boundary-1,amount:revenue})
  expect(state.studio.cash).toBeCloseTo(previous.studio.cash+state.ledger.slice(oldLedgerLength).reduce((n,e)=>n+e.amount,0),6)
  expect(state.hollywood!.businesses.find(b=>b.studioId===TARGET)!.account.cash).toBe(targetCash)
 }
 return {...c,state,end}
}
describe('P16 fixed real R01 paid production completes before healthy active-run absorption',()=>{
 it('actual eight ordinary ticks produce the named run and healthy absorption pays future locked installments only to buyer with original creator and settlement history',()=>{
  const p=prepared(),c=serviceToSettlement(p),record=c.state.rights.absorptions.find(a=>a.id===c.record.id)!
  expect(record.runReceipts).toHaveLength(c.run.totalWeeks-c.run.weekIndex)
  expect(record.runReceipts.reduce((n,r)=>n+r.revenue,0)).toBe(c.run.weeklyGross.slice(c.run.weekIndex).reduce((n,g)=>n+g*c.run.studioShare,0))
  const film=c.state.hollywood!.films.find(f=>f.filmId===FILM)!
  expect(film).toMatchObject({studioId:TARGET,settledWeek:c.end-1})
  expect(c.state.hollywood!.businesses.find(b=>b.studioId===TARGET)!.runs).toEqual([])
  expect(c.state.hollywood!.receipts.filter(r=>r.kind==='filmSettled'&&r.productionId===FILM)).toHaveLength(1)
  const originalFilm=p.state.hollywood!.films.find(f=>f.filmId===FILM)!
  if(film.provenance!=='simulation/v1'||originalFilm.provenance!=='simulation/v1')throw new Error('named run must retain genuine simulation film')
  expect(film.result).toEqual(originalFilm.result)
  const reportingBefore=JSON.stringify(c.state)
  const actualRows=c.state.ledger.filter(e=>e.kind==='absorbedRunRevenue'&&record.runReceipts.some(r=>r.id===e.note))
  expect(actualRows).toHaveLength(record.runReceipts.filter(r=>r.revenue>0).length)
  const earned=actualRows.reduce((n,e)=>n+e.amount,0);expect(earned).toBeGreaterThan(0)
  const from=record.week,to=c.end-1,range=c.state.ledger.filter(e=>e.week>=from&&e.week<=to)
  const report=recordedFinancePeriod(c.state,from,to,'actual-absorbed-run','Actual acquired film installments')
  expect(report.categories.find(row=>row.kind==='absorbedRunRevenue')).toEqual({kind:'absorbedRunRevenue',label:'Scheduled film revenue acquired with a studio',amount:earned,entryCount:actualRows.length})
  expect(report.netCash).toBe(range.reduce((n,e)=>n+e.amount,0))
  expect(report.categories.reduce((n,row)=>n+row.amount,0)).toBeCloseTo(report.netCash,6)
  if(report.openingCash!==null&&report.closingCash!==null)expect(report.closingCash-report.openingCash).toBeCloseTo(report.netCash,6)
  const ordinaryRevenue=range.filter(e=>e.kind==='studioRevenue').reduce((n,e)=>n+e.amount,0)
  const period=periodSummary(c.state,from,to)
  expect(period.studioRevenue).toBeCloseTo(ordinaryRevenue+earned,6)
  expect(period.netCash).toBe(report.netCash)
  expect(financeTotals(c.state).studioRevenue).toBe(c.state.ledger.filter(e=>e.kind==='studioRevenue'||e.kind==='absorbedRunRevenue').reduce((n,e)=>n+e.amount,0))
  const history=financeHistory(c.state)
  expect(history.windows).toHaveLength(2)
  for(const window of history.windows)expect(window.costSeries.some(series=>series.kind==='absorbedRunRevenue')).toBe(false)
  expect(JSON.stringify(c.state)).toBe(reportingBefore)
  const text=saves.exportCurrentState(c.state),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reload)).toBe(text)
  const next=tick(c.state),replay=tick(reload)
  expect(saves.exportCurrentState(next)).toBe(saves.exportCurrentState(replay))
  expect(next.rights.absorptions.find(a=>a.id===record.id)!.runReceipts).toEqual(record.runReceipts)
  originalUnchanged(p)
 })
 it('real admitted active-run history refuses missing handoff omitted installment wrong beneficiary and altered gross or earned cash through full current reader',()=>{
  const p=prepared(),c=serviceToSettlement(p),text=JSON.stringify(saves.makeSave(c.state))
  const reject=(change:(state:GameState)=>void,expectedPattern=/absorption|run|cash|ledger|buyer/i)=>{
   const saved=JSON.parse(text);change(saved.state);const before=JSON.stringify(saved)
   try {expect(()=>saves.validateSaveV49(saved)).toThrow(expectedPattern)}
   finally {expect(JSON.stringify(saved)).toBe(before)}
  }
  reject(state=>{state.rights.absorptions.find(a=>a.id===c.record.id)!.runs=[]})
  reject(state=>{state.rights.absorptions.find(a=>a.id===c.record.id)!.runReceipts=state.rights.absorptions.find(a=>a.id===c.record.id)!.runReceipts.slice(1)},/studio revenue does not reconcile/)
  reject(state=>{state.rights.absorptions.find(a=>a.id===c.record.id)!.buyerId=TARGET})
  reject(state=>{state.rights.absorptions.find(a=>a.id===c.record.id)!.runReceipts[0]!.gross+=0.01})
  reject(state=>{const receipt=state.rights.absorptions.find(a=>a.id===c.record.id)!.runReceipts[0]!;state.ledger.find(e=>e.kind==='absorbedRunRevenue'&&e.note===receipt.id)!.amount+=0.01})
  originalUnchanged(p)
 })
})
