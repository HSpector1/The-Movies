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
import { weeklySalary, guaranteedComp } from '../src/core/employment.js'
import { releaseRefusal } from '../src/core/corporateConditionLive.js'
import { rivalWeeklyOperatingCost } from '../src/core/hollywood.js'
import { libraryValuationV1 } from '../src/core/propertyValuation.js'
import { resolveTitles, subjectsHeldBy, currentHolder, actualP16Money } from '../src/core/rights.js'
import { permittedBidderRefusal, spendableCash, weeklyFixedCost } from '../src/core/rightsFinance.js'
import { TUNING } from '../src/core/tuning.js'
import { openTheatricalRun } from '../src/core/economy.js'
import { continuedWorkRefusal } from '../src/core/continuedWork.js'
import { busyTalentIds } from '../src/core/employment.js'
import { updateStanding } from '../src/core/standing.js'
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
  reject(state=>{state.rights.absorptions.find(a=>a.id===c.record.id)!.buyerId=TARGET},/Hollywood save: studio revenue does not reconcile$/)
  reject(state=>{state.rights.absorptions.find(a=>a.id===c.record.id)!.runReceipts[0]!.gross+=0.01})
  reject(state=>{const receipt=state.rights.absorptions.find(a=>a.id===c.record.id)!.runReceipts[0]!;state.ledger.find(e=>e.kind==='absorbedRunRevenue'&&e.note===receipt.id)!.amount+=0.01})
  originalUnchanged(p)
 })
})

// One fixed conjunction of the original163 rival-buyer and real170 run controls.
// Source-b5 RED must reach rivalBuyerRunProducerRequired after all public premises.
describe('P16 genuine rival buyer of the original R01 theatrical run', () => {
 it('pays the next acquired installment to R02 alongside its own final installment with native account conservation and save replay', () => {
  const root=process.env.P16_ORIGINAL48_CAPTURE_ROOT;expect(root).toBeTruthy()
  const bytes=readFileSync(root+'/r04-actual163.save48.json')
  expect(createHash('sha256').update(bytes).digest('hex')).toBe('c17b7aa82bd09e6988867e149ed0266803d8e432cfcd8842d9c2aca1f7ace8ad')
  // Original admitted drained-R04 transaction fixture; no new cash/history edits.
  const raw=JSON.parse(bytes.toString()),rawBefore=JSON.stringify(raw)
  const old=saves.validateSaveP15B(raw),oldBefore=JSON.stringify(old)
  expect(old.saveVersion).toBe(48)
  const initial=saves.convertV48ToV49(old).state,initialBefore=JSON.stringify(initial)
  const buyerId='studio-aca408ec-r02',ownFilmId=buyerId+':film:14'
  expect(initial.market.tick).toBe(163);expect(initial.hollywood!.playerStudioId).not.toBe(buyerId)
  expect(initial.hollywood!.businesses.find(b=>b.studioId===TARGET)!.productions)
   .toMatchObject([{id:FILM,startTick:161,remainingTicks:7}])
  expect(initial.hollywood!.businesses.find(b=>b.studioId===buyerId)!.productions)
   .toMatchObject([{id:ownFilmId,remainingTicks:3}])
  let state=initial
  for(let boundary=164;boundary<=170;boundary++) {
   const prior=state,before=JSON.stringify(prior);state=tick(prior)
   expect(state.market.tick).toBe(boundary);expect(JSON.stringify(prior)).toBe(before)
  }
  saves.makeSave(state)
  expect(JSON.stringify(initial)).toBe(initialBefore)
  const stateBefore=JSON.stringify(state),source=state.hollywood!.businesses.find(b=>b.studioId===TARGET)!
  const buyer=state.hollywood!.businesses.find(b=>b.studioId===buyerId)!
  expect(source.productions).toEqual([]);expect(source.runs).toHaveLength(1)
  const run=source.runs[0]!
  expect(run).toMatchObject({productionId:FILM,releaseTick:169,weekIndex:1})
  expect(run.weekIndex).toBe(170-run.releaseTick);expect(run.weekIndex).toBeLessThan(run.totalWeeks)
  const film=state.hollywood!.films.find(f=>f.filmId===FILM)!
  if(film.provenance!=='simulation/v1')throw new Error('fixed R01 run must have its actual simulation film')
  expect(film.studioId).toBe(TARGET);expect(film.studioRevenueReceived).toBe(run.cumulativeStudioRevenuePaid)
  // This fixed boundary also owes R02 its own last film14 installment.
  expect(buyer.runs).toHaveLength(1)
  const ownRun=buyer.runs[0]!
  expect(ownRun).toMatchObject({productionId:ownFilmId,releaseTick:165,weekIndex:5})
  expect(ownRun.weekIndex+1).toBe(ownRun.totalWeeks)
  expect(buyer.productions.every(p=>p.remainingTicks>1),'no other R02 release is due at this input').toBe(true)
  for(const studioId of [buyerId,TARGET]) {
   expect(conditionRecord(state,studioId)?.condition).toMatchObject({stage:'stable',week:170})
   expect(outstandingLoan(state,studioId,170)).toBeUndefined()
  }
  expect(permittedBidderRefusal(state,buyerId,170)).toBeNull()
  const employees=state.hollywood!.activeEmploymentOrdinals.map(i=>state.hollywood!.employment[i]!)
   .filter(e=>e.studioId===TARGET&&e.endedWeek===null&&e.terms.startWeek<=170&&170<e.terms.endWeekExclusive)
  expect(employees).toHaveLength(6);expect(employees.every(e=>e.terms.endWeekExclusive===208)).toBe(true)
  const paid=requestDiligence(state,{recipientId:buyerId,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']},170)
  expect(JSON.stringify(state)).toBe(stateBefore)
  expect(paid.record).toMatchObject({week:170,recipientId:buyerId,target:{kind:'studio',studioId:TARGET},fee:TUNING.RIGHTS_DUE_DILIGENCE_FEE})
  expect(paid.record.fee).toBeGreaterThan(0)
  expect(paid.state.hollywood!.businesses.find(b=>b.studioId===buyerId)!.account.cash).toBe(buyer.account.cash-paid.record.fee)
  expect(actualP16Money(paid.state,buyerId).dueDiligenceFee-actualP16Money(state,buyerId).dueDiligenceFee).toBe(-paid.record.fee)
  expect(paid.state.studio).toEqual(state.studio);expect(paid.state.ledger).toEqual(state.ledger)
  const paidBefore=JSON.stringify(paid.state)
  const exits=employees.reduce((sum,e)=>sum+terminationCost(e.terms,170),0),postExitCash=source.account.cash-exits
  expect(exits).toBeGreaterThan(0)
  const library=libraryValuationV1(paid.state,TARGET,170);expect(library.kind).toBe('available')
  if(library.kind!=='available')throw new Error('fixed rival-run library valuation premise absent')
  const consideration=Math.max(0,Math.ceil(library.total*(100+TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)/100+postExitCash))
  expect(acquisition.absorptionAsk(library.total,postExitCash)).toBe(consideration)
  const preview={buyerId,targetId:TARGET,consideration,retention:{kind:'explicit' as const,contractIds:[] as string[]},disclosureId:paid.record.id}
  const quote=acquisition.quoteAbsorption(paid.state,preview,170)
  expect(quote.kind,'actual single-price consent/reserve quote; no replacement target or funding').toBe('quote')
  if(quote.kind!=='quote')throw new Error(quote.refusal)
  expect(quote.ask).toBe(consideration);expect(quote.consideration).toBe(consideration)
  expect(quote.affordable).toBe(true);expect(quote.contracts.filter(c=>c.retained)).toEqual([])
  expect(quote.contracts.filter(c=>!c.retained)).toHaveLength(6);expect(quote.guarantees).toBe(0)
  expect(quote.exitCharges).toBe(exits);expect(quote.targetCashBeforeExits).toBe(source.account.cash)
  expect(quote.postExitCash).toBe(postExitCash);expect(quote.outlay).toBe(consideration-postExitCash)
  expect(quote.resultingWeeklyFixedCost).toBe(Math.ceil(weeklyFixedCost(paid.state,buyerId)))
  expect(quote.reserveAfter).toBe(TUNING.RIGHTS_RESERVE_WEEKS*quote.resultingWeeklyFixedCost)
  expect(spendableCash(paid.state,buyerId)-quote.outlay).toBeGreaterThanOrEqual(quote.reserveAfter)
  expect(quote.productions).toEqual([]);expect(quote.scripts.some(s=>s.disposition==='continues')).toBe(false)
  expect(quote.runs).toEqual([{productionId:FILM,beneficiaryFromWeek:170,startingWeekIndex:run.weekIndex,
   grossPaidBeforeClose:run.cumulativeGrossPaid,revenuePaidBeforeClose:run.cumulativeStudioRevenuePaid}])
  const subjects=subjectsHeldBy(resolveTitles(paid.state),paid.state.rights.estates,TARGET,170)
  expect(subjects.length).toBeGreaterThan(0)
  const input={...preview,quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion}
  expect(input.quotedAtWeek).toBe(170);expect(input.quoteAgePolicyVersion).toBe(1)
  console.info('S8_RIVAL_RUN_REAL170_PREMISES '+JSON.stringify({week:170,buyerId,targetId:TARGET,
   film:FILM,weekIndex:run.weekIndex,ownFilmId,ownWeekIndex:ownRun.weekIndex,consideration,exits,
   postExitCash,outlay:quote.outlay,reserve:quote.reserveAfter,producerRefusal:acquisition.absorptionProducerRefusal(paid.state,input)}))
  let closed:GameState
  try {
   // Source-b5 named RED; downstream positive laws remain unreached until the producer exists.
   closed=acquisition.closeAbsorption(paid.state,input,170)
  } finally {
   expect(JSON.stringify(paid.state)).toBe(paidBefore);expect(JSON.stringify(state)).toBe(stateBefore)
   expect(JSON.stringify(initial)).toBe(initialBefore);expect(JSON.stringify(old)).toBe(oldBefore);expect(JSON.stringify(raw)).toBe(rawBefore)
  }
  const record=closed.rights.absorptions.find(a=>a.targetId===TARGET)!
  expect(record).toMatchObject({buyerId,targetId:TARGET,week:170,exitCharges:exits,postExitCash,outlay:quote.outlay})
  expect(record.runs).toEqual(quote.runs);expect(record.runReceipts).toEqual([])
  expect(record.contracts.every(c=>c.buyerContractId===null)).toBe(true)
  expect(record.continuedProductions).toEqual([]);expect(record.buyerWorkflows).toEqual([])
  const buyerAtClose=closed.hollywood!.businesses.find(b=>b.studioId===buyerId)!,targetAtClose=closed.hollywood!.businesses.find(b=>b.studioId===TARGET)!
  expect(buyerAtClose.account.cash).toBe(buyer.account.cash-paid.record.fee-record.outlay)
  expect(actualP16Money(closed,buyerId).acquisitionOutlay-actualP16Money(paid.state,buyerId).acquisitionOutlay).toBe(-record.outlay)
  expect(targetAtClose.account.cash).toBe(0);expect(targetAtClose.runs).toEqual(source.runs)
  expect(buyerAtClose.productions).toEqual(buyer.productions);expect(buyerAtClose.runs).toEqual(buyer.runs)
  expect(closed.studio).toEqual(paid.state.studio);expect(closed.ledger).toEqual(paid.state.ledger)
  expect(closed.contracts).toEqual(paid.state.contracts);expect(closed.operations).toEqual(paid.state.operations)
  for(const subject of subjects)expect(currentHolder(closed,subject,170)).toMatchObject({kind:'holder',holderId:buyerId})
  const text=saves.exportCurrentState(closed),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reload)).toBe(text)
  const closedBefore=JSON.stringify(closed),reloadBefore=JSON.stringify(reload)
  const next=tick(closed),replay=tick(reload)
  expect(JSON.stringify(closed)).toBe(closedBefore);expect(JSON.stringify(reload)).toBe(reloadBefore)
  expect(next.market.tick).toBe(171);expect(saves.exportCurrentState(replay)).toBe(saves.exportCurrentState(next))
  const advanced=next.rights.absorptions.find(a=>a.id===record.id)!,receipt=advanced.runReceipts[0]!
  const gross=run.weeklyGross[run.weekIndex]!,revenue=gross*run.studioShare
  expect(advanced.runs).toEqual(record.runs);expect(advanced.runReceipts).toHaveLength(1)
  expect(receipt).toMatchObject({week:170,productionId:FILM,weekIndex:run.weekIndex,gross,revenue})
  expect(revenue).toBeGreaterThan(0)
  expect(next.ledger.filter(e=>e.kind==='absorbedRunRevenue')).toEqual(closed.ledger.filter(e=>e.kind==='absorbedRunRevenue'))
  const buyerAfter=next.hollywood!.businesses.find(b=>b.studioId===buyerId)!,targetAfter=next.hollywood!.businesses.find(b=>b.studioId===TARGET)!
  const ownRevenue=ownRun.weeklyGross[ownRun.weekIndex]!*ownRun.studioShare
  expect(ownRevenue).toBeGreaterThan(0)
  const earnedBefore=buyerAtClose.account.periods.reduce((sum,p)=>sum+p.movements.studioRevenue,0)
  const earnedAfter=buyerAfter.account.periods.reduce((sum,p)=>sum+p.movements.studioRevenue,0)
  expect(earnedAfter-earnedBefore).toBeCloseTo(ownRevenue+revenue,6)
  const moneyBefore=buyerAtClose.account.periods.reduce((sum,p)=>sum+Object.values(p.movements).reduce((n,m)=>n+m,0),0)
  const moneyAfter=buyerAfter.account.periods.reduce((sum,p)=>sum+Object.values(p.movements).reduce((n,m)=>n+m,0),0)
  expect(buyerAfter.account.cash-buyerAtClose.account.cash).toBeCloseTo(moneyAfter-moneyBefore,6)
  expect(buyerAfter.account.cash).toBeCloseTo(buyerAfter.account.openingBalance+moneyAfter,6)
  expect(targetAfter.account).toEqual(targetAtClose.account)
  expect(targetAfter.runs).toEqual([{...run,weekIndex:run.weekIndex+1,
   cumulativeGrossPaid:run.cumulativeGrossPaid+gross,cumulativeStudioRevenuePaid:run.cumulativeStudioRevenuePaid+revenue}])
  const filmAfter=next.hollywood!.films.find(f=>f.filmId===FILM)!
  if(filmAfter.provenance!=='simulation/v1')throw new Error('acquired installment must preserve original simulation film')
  expect(filmAfter.studioId).toBe(TARGET);expect(filmAfter.result).toEqual(film.result)
  expect(filmAfter.studioRevenueReceived).toBe(run.cumulativeStudioRevenuePaid+revenue)
  expect(next.hollywood!.receipts.filter(r=>r.kind==='filmSettled'&&r.productionId===ownFilmId))
   .toMatchObject([{week:170,studioId:buyerId,productionId:ownFilmId}])
  expect(next.hollywood!.receipts.filter(r=>r.kind==='filmSettled'&&r.productionId===ownFilmId)).toHaveLength(1)
  expect(buyerAfter.runs.some(r=>r.productionId===ownFilmId)).toBe(false)
  const nextText=saves.exportCurrentState(next),restored=saves.migrateToLive(saves.importSave(nextText)).state
  expect(saves.exportCurrentState(restored)).toBe(nextText)
  expect(restored.rights.absorptions.find(a=>a.id===record.id)!.runReceipts).toEqual([receipt])
  expect(JSON.stringify(paid.state)).toBe(paidBefore);expect(JSON.stringify(initial)).toBe(initialBefore)
  expect(JSON.stringify(old)).toBe(oldBefore);expect(JSON.stringify(raw)).toBe(rawBefore)

  // Continue this same paid rival acquisition; no new fixture or altered clock/history.
  const end=run.releaseTick+run.totalWeeks;expect(end).toBe(175)
  const nextBefore=JSON.stringify(next)
  let settled=next
  for(let boundary=172;boundary<=end;boundary++) {
   const prior=settled,priorBefore=JSON.stringify(prior),week=boundary-1
   const priorRecord=prior.rights.absorptions.find(a=>a.id===record.id)!
   const finalText=boundary===end?saves.exportCurrentState(prior):null
   const finalReload=finalText===null?null:saves.migrateToLive(saves.importSave(finalText)).state
   const finalReloadBefore=finalReload===null?null:JSON.stringify(finalReload)
   if(finalReload!==null) {
    expect(finalReload.market.tick).toBe(174)
    expect(saves.exportCurrentState(finalReload)).toBe(finalText)
   }
   settled=tick(prior)
   expect(JSON.stringify(prior)).toBe(priorBefore);expect(settled.market.tick).toBe(boundary)
   const current=settled.rights.absorptions.find(a=>a.id===record.id)!,installment=current.runReceipts.at(-1)!
   const index=week-run.releaseTick,gross=run.weeklyGross[index]!,revenue=gross*run.studioShare
   expect(current).toMatchObject({buyerId,targetId:TARGET,week:170})
   expect(current.runs).toEqual(record.runs)
   expect(current.runReceipts.slice(0,-1)).toEqual(priorRecord.runReceipts)
   expect(current.runReceipts).toHaveLength(boundary-record.week)
   expect(installment).toMatchObject({week,productionId:FILM,weekIndex:index,gross,revenue})
   expect(current.runReceipts.filter(r=>r.productionId===FILM&&r.weekIndex===index)).toHaveLength(1)
   expect(settled.ledger.filter(e=>e.kind==='absorbedRunRevenue')).toEqual(closed.ledger.filter(e=>e.kind==='absorbedRunRevenue'))
   const beforeBuyer=prior.hollywood!.businesses.find(b=>b.studioId===buyerId)!
   const afterBuyer=settled.hollywood!.businesses.find(b=>b.studioId===buyerId)!
   // Include any ordinary native release actually produced this week; do not assume idle R02.
   const nativeRevenue=settled.hollywood!.films.reduce((sum,ownFilm)=>{
    if(ownFilm.provenance!=='simulation/v1'||ownFilm.studioId!==buyerId)return sum
    const result=ownFilm.result,opening=result.boxOffice.opening
    const schedule=openTheatricalRun(result,opening,opening>0?result.boxOffice.total/opening:1,result.releaseTick)
    const ownIndex=week-result.releaseTick
    return sum+(ownIndex>=0&&ownIndex<schedule.totalWeeks?schedule.weeklyGross[ownIndex]!*schedule.studioShare:0)
   },0)
   const earnedBefore=beforeBuyer.account.periods.reduce((sum,p)=>sum+p.movements.studioRevenue,0)
   const earnedAfter=afterBuyer.account.periods.reduce((sum,p)=>sum+p.movements.studioRevenue,0)
   expect(earnedAfter-earnedBefore).toBeCloseTo(nativeRevenue+revenue,6)
   const moneyBefore=beforeBuyer.account.periods.reduce((sum,p)=>sum+Object.values(p.movements).reduce((n,m)=>n+m,0),0)
   const moneyAfter=afterBuyer.account.periods.reduce((sum,p)=>sum+Object.values(p.movements).reduce((n,m)=>n+m,0),0)
   expect(afterBuyer.account.cash-beforeBuyer.account.cash).toBeCloseTo(moneyAfter-moneyBefore,6)
   expect(afterBuyer.account.cash).toBeCloseTo(afterBuyer.account.openingBalance+moneyAfter,6)
   expect(settled.hollywood!.businesses.find(b=>b.studioId===TARGET)!.account).toEqual(targetAtClose.account)
   expect(settled.studio.cash).toBeCloseTo(prior.studio.cash+settled.ledger.slice(prior.ledger.length).reduce((sum,e)=>sum+e.amount,0),6)
   if(finalReload!==null) {
    const finalReplay=tick(finalReload)
    expect(JSON.stringify(finalReload)).toBe(finalReloadBefore)
    expect(saves.exportCurrentState(finalReplay)).toBe(saves.exportCurrentState(settled))
   }
  }
  const finalRecord=settled.rights.absorptions.find(a=>a.id===record.id)!
  expect(finalRecord.runReceipts).toHaveLength(run.totalWeeks-run.weekIndex)
  expect(finalRecord.runReceipts.reduce((sum,r)=>sum+r.revenue,0))
   .toBe(run.weeklyGross.slice(run.weekIndex).reduce((sum,g)=>sum+g*run.studioShare,0))
  const settledFilm=settled.hollywood!.films.find(f=>f.filmId===FILM)!
  if(settledFilm.provenance!=='simulation/v1')throw new Error('settled acquired run must retain its actual source film')
  expect(settledFilm).toMatchObject({studioId:TARGET,settledWeek:174})
  expect(settledFilm.result).toEqual(film.result)
  expect(settledFilm.studioRevenueReceived).toBeCloseTo(run.cumulativeStudioRevenuePaid+finalRecord.runReceipts.reduce((sum,r)=>sum+r.revenue,0),6)
  expect(settled.hollywood!.businesses.find(b=>b.studioId===TARGET)!.runs).toEqual([])
  expect(settled.hollywood!.receipts.filter(r=>r.kind==='filmSettled'&&r.productionId===FILM))
   .toMatchObject([{week:174,studioId:TARGET,productionId:FILM}])
  expect(settled.hollywood!.receipts.filter(r=>r.kind==='filmSettled'&&r.productionId===FILM)).toHaveLength(1)
  expect(settled.hollywood!.receipts.filter(r=>r.kind==='filmSettled'&&r.productionId===ownFilmId))
   .toEqual(next.hollywood!.receipts.filter(r=>r.kind==='filmSettled'&&r.productionId===ownFilmId))
  expect(JSON.stringify(next)).toBe(nextBefore)
  expect(JSON.stringify(closed)).toBe(closedBefore);expect(JSON.stringify(paid.state)).toBe(paidBefore)
  expect(JSON.stringify(initial)).toBe(initialBefore);expect(JSON.stringify(old)).toBe(oldBefore);expect(JSON.stringify(raw)).toBe(rawBefore)
 })
})

// Fixed original director retention; ordinary rival staffing remains authoritative afterwards.
describe('P16 genuine rival employment retention at the original170 acquisition',()=>{
 it('retains the actual remaining bargain without another bonus then pays its native surplus termination before payroll with save replay',()=>{
  const root=process.env.P16_ORIGINAL48_CAPTURE_ROOT;expect(root).toBeTruthy()
  const bytes=readFileSync(root+'/r04-actual163.save48.json')
  expect(createHash('sha256').update(bytes).digest('hex')).toBe('c17b7aa82bd09e6988867e149ed0266803d8e432cfcd8842d9c2aca1f7ace8ad')
  // Same admitted drained-R04 fixture as above; no new finance or historical constructor.
  const raw=JSON.parse(bytes.toString()),rawBefore=JSON.stringify(raw),old=saves.validateSaveP15B(raw),oldBefore=JSON.stringify(old)
  const initial=saves.convertV48ToV49(old).state,initialBefore=JSON.stringify(initial)
  expect(initial.market.tick).toBe(163)
  let state=initial
  for(let boundary=164;boundary<=170;boundary++) {
   const prior=state,before=JSON.stringify(prior);state=tick(prior)
   expect(state.market.tick).toBe(boundary);expect(JSON.stringify(prior)).toBe(before)
  }
  saves.makeSave(state)
  const buyerId='studio-aca408ec-r02',personId='person-studio-aca408ec-r01-1'
  const sourceId=TARGET+':contract:'+personId+':0',buyerContractId=buyerId+':contract:'+personId+':170'
  const source=state.hollywood!.businesses.find(b=>b.studioId===TARGET)!,buyer=state.hollywood!.businesses.find(b=>b.studioId===buyerId)!
  const employees=state.hollywood!.activeEmploymentOrdinals.map(i=>state.hollywood!.employment[i]!).filter(e=>e.studioId===TARGET)
  const original=employees.find(e=>e.contractId===sourceId)!
  expect(employees).toHaveLength(6);expect(original).toBeDefined()
  expect(original).toMatchObject({studioId:TARGET,endedWeek:null,reason:'entry',terms:{talentId:personId,startWeek:0,termWeeks:208,endWeekExclusive:208,annualSalary:141075,signingBonus:25394}})
  expect(state.talent.find(t=>t.id===personId)?.role).toBe('director')
  expect(source.productions).toEqual([])
  expect(source.development.projects.filter(p=>p.status==='drafting'||p.status==='rewriting')).toEqual([])
  expect(source.runs).toMatchObject([{productionId:FILM,releaseTick:169,weekIndex:1}])
  expect(buyer.costCutting.since).toBeNull()
  for(const id of [buyerId,TARGET]) {
   expect(conditionRecord(state,id)?.condition).toMatchObject({stage:'stable',week:170})
   expect(outstandingLoan(state,id,170)).toBeUndefined()
  }
  expect(state.promises.filter(p=>p.issuerStudioId===TARGET&&p.outcome===null)).toEqual([])
  expect(state.talentMarket.proposals.filter(p=>p.issuerStudioId===TARGET)).toEqual([])
  expect(state.talentMarket.cases.filter(c=>c.subjectStudioId===TARGET&&c.closedWeek===null)).toEqual([])
  const before=JSON.stringify(state)
  const paid=requestDiligence(state,{recipientId:buyerId,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']},170)
  expect(JSON.stringify(state)).toBe(before)
  const paidBefore=JSON.stringify(paid.state)
  expect(paid.state.studio).toEqual(state.studio);expect(paid.state.ledger).toEqual(state.ledger)
  expect(paid.state.hollywood!.businesses.find(b=>b.studioId===buyerId)!.account.cash).toBe(buyer.account.cash-paid.record.fee)
  const exits=employees.filter(e=>e.contractId!==sourceId).reduce((sum,e)=>sum+terminationCost(e.terms,170),0)
  expect(exits).toBe(1234792)
  const postExitCash=source.account.cash-exits,value=libraryValuationV1(paid.state,TARGET,170)
  expect(value.kind).toBe('available');if(value.kind!=='available')throw new Error('fixed director retention needs actual library value')
  const consideration=acquisition.absorptionAsk(value.total,postExitCash)
  const preview={buyerId,targetId:TARGET,consideration,retention:{kind:'explicit' as const,contractIds:[sourceId]},disclosureId:paid.record.id}
  const quote=acquisition.quoteAbsorption(paid.state,preview,170)
  expect(quote.kind,'fixed original director must actually consent and fit the complete transaction').toBe('quote')
  if(quote.kind!=='quote')throw new Error(quote.refusal)
  expect(quote.contracts.filter(c=>c.retained)).toMatchObject([{contractId:sourceId,talentId:personId,busyOn:null,reason:null}])
  expect(quote.contracts.filter(c=>c.retained)).toHaveLength(1)
  expect(quote.contracts.filter(c=>!c.retained)).toHaveLength(5)
  expect(quote.productions).toEqual([]);expect(quote.scripts).toEqual([])
  expect(quote.affordable).toBe(true);expect(quote.ask).toBe(consideration)
  expect(quote.exitCharges).toBe(exits);expect(quote.postExitCash).toBe(postExitCash)
  expect(quote.guarantees).toBe(guaranteedComp(original.terms,170));expect(quote.guarantees).toBe(103094)
  expect(quote.outlay).toBe(consideration-postExitCash)
  expect(quote.resultingWeeklyFixedCost).toBe(Math.ceil(weeklyFixedCost(paid.state,buyerId)+original.terms.annualSalary/TUNING.TICKS_PER_YEAR+TUNING.OVERHEAD_PER_EMPLOYEE))
  expect(quote.reserveAfter).toBe(TUNING.RIGHTS_RESERVE_WEEKS*quote.resultingWeeklyFixedCost)
  expect(spendableCash(paid.state,buyerId)-quote.outlay).toBeGreaterThanOrEqual(quote.reserveAfter)
  const input={...preview,quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion}
  expect(input.quotedAtWeek).toBe(170)
  console.info('S8_RIVAL_RETENTION_REAL170_PREMISES '+JSON.stringify({buyerId,targetId:TARGET,sourceId,personId,exits,consideration,outlay:quote.outlay,reserve:quote.reserveAfter,guarantees:quote.guarantees,producerRefusal:acquisition.absorptionProducerRefusal(paid.state,input)}))
  let closed:GameState
  try {closed=acquisition.closeAbsorption(paid.state,input,170)}
  finally {
   expect(JSON.stringify(paid.state)).toBe(paidBefore);expect(JSON.stringify(state)).toBe(before)
   expect(JSON.stringify(initial)).toBe(initialBefore);expect(JSON.stringify(old)).toBe(oldBefore);expect(JSON.stringify(raw)).toBe(rawBefore)
  }
  const record=closed.rights.absorptions.find(a=>a.targetId===TARGET)!
  expect(record.contracts.filter(c=>c.buyerContractId!==null)).toEqual([{sourceContractId:sourceId,buyerContractId,talentId:personId,exitCost:0}])
  expect(record.contracts.filter(c=>c.buyerContractId===null).map(c=>({id:c.sourceContractId,cost:c.exitCost})))
   .toEqual(employees.filter(e=>e.contractId!==sourceId).map(e=>({id:e.contractId,cost:terminationCost(e.terms,170)})))
  expect(record).toMatchObject({buyerId,targetId:TARGET,week:170,exitCharges:exits,postExitCash,outlay:quote.outlay})
  expect(record.continuedProductions).toEqual([]);expect(record.buyerWorkflows).toEqual([])
  const ended=closed.hollywood!.employment.find(e=>e.contractId===sourceId)!,kept=closed.hollywood!.employment.find(e=>e.contractId===buyerContractId)!
  expect(ended).toEqual({...original,endedWeek:170})
  expect(kept).toEqual({contractId:buyerContractId,studioId:buyerId,endedWeek:null,reason:'absorptionContinuation',terms:{...original.terms,startWeek:170,termWeeks:38}})
  expect(closed.hollywood!.activeEmploymentOrdinals.map(i=>closed.hollywood!.employment[i]!.contractId)).toContain(buyerContractId)
  expect(closed.freeAgents).not.toContain(personId)
  for(const e of employees.filter(e=>e.contractId!==sourceId))expect(closed.freeAgents).toContain(e.terms.talentId)
  expect(closed.contracts).toEqual(paid.state.contracts);expect(closed.studio).toEqual(paid.state.studio)
  expect(closed.operations).toEqual(paid.state.operations);expect(closed.ledger).toEqual(paid.state.ledger)
  expect(closed.hollywood!.receipts.slice(0,paid.state.hollywood!.receipts.length)).toEqual(paid.state.hollywood!.receipts)
  const closeReceipts=closed.hollywood!.receipts.slice(paid.state.hollywood!.receipts.length).filter(r=>r.kind==='employment')
  expect(closeReceipts).toHaveLength(7)
  expect(closeReceipts.filter(r=>r.talentId===personId)).toMatchObject([
   {week:170,studioId:TARGET,contractId:sourceId,talentId:personId,fromStudioId:TARGET,toStudioId:null,reason:'absorptionContinuation'},
   {week:170,studioId:buyerId,contractId:buyerContractId,talentId:personId,fromStudioId:TARGET,toStudioId:buyerId,reason:'absorptionContinuation'},
  ])
  const booked=(s:GameState,id:string,kind:'signing'|'termination'|'payroll')=>s.hollywood!.businesses.find(b=>b.studioId===id)!.account.periods.reduce((sum,p)=>sum+p.movements[kind],0)
  for(const id of [TARGET,buyerId])expect(booked(closed,id,'signing')).toBe(booked(paid.state,id,'signing'))
  expect(booked(closed,TARGET,'termination')-booked(paid.state,TARGET,'termination')).toBe(-exits)
  expect(booked(closed,buyerId,'termination')).toBe(booked(paid.state,buyerId,'termination'))
  const closedBuyer=closed.hollywood!.businesses.find(b=>b.studioId===buyerId)!
  expect(closedBuyer.account.cash).toBe(buyer.account.cash-paid.record.fee-record.outlay)
  expect(closed.hollywood!.businesses.find(b=>b.studioId===TARGET)!.account.cash).toBe(0)
  // Existing R02 staffing keeps its original director, then releases the newly surplus interval before payroll.
  expect(buyer.nextDecisionWeek).toBe(170)
  expect(releaseRefusal(closed,buyerId,personId)).toBeNull()
  expect(kept.terms.endWeekExclusive-170).toBeGreaterThan(TUNING.HIRING_TERMINATION_CAP_WEEKS)
  expect(closed.promises.filter(p=>p.issuerStudioId===buyerId&&p.beneficiaryPersonId===personId&&p.outcome===null)).toEqual([])
  const charge=terminationCost(kept.terms,170);expect(charge).toBe(70538)
  // Sufficient affordability even before removing this person's salary/overhead from the native reserve.
  expect(closedBuyer.account.cash-charge).toBeGreaterThanOrEqual(rivalWeeklyOperatingCost(closedBuyer,closed.hollywood!,170)*closedBuyer.policy.reserveWeeks)
  const closedBefore=JSON.stringify(closed),text=saves.exportCurrentState(closed),reload=saves.migrateToLive(saves.importSave(text)).state,reloadBefore=JSON.stringify(reload)
  expect(saves.exportCurrentState(reload)).toBe(text)
  const next=tick(closed),replay=tick(reload)
  expect(JSON.stringify(closed)).toBe(closedBefore);expect(JSON.stringify(reload)).toBe(reloadBefore)
  expect(next.market.tick).toBe(171);expect(saves.exportCurrentState(replay)).toBe(saves.exportCurrentState(next))
  expect(next.hollywood!.employment.find(e=>e.contractId===buyerContractId)).toEqual({...kept,endedWeek:170})
  const termination=next.hollywood!.receipts.filter(r=>r.kind==='employment'&&r.contractId===buyerContractId&&r.reason==='termination')
  expect(termination).toHaveLength(1)
  expect(termination[0]).toMatchObject({week:170,studioId:buyerId,talentId:personId,fromStudioId:buyerId,toStudioId:null})
  expect(booked(next,buyerId,'termination')-booked(closed,buyerId,'termination')).toBe(-charge)
  const paidPeople=next.hollywood!.employment.filter(e=>e.studioId===buyerId&&e.terms.startWeek<=170&&170<e.terms.endWeekExclusive&&(e.endedWeek===null||e.endedWeek>170))
  expect(paidPeople.some(e=>e.contractId===buyerContractId)).toBe(false)
  expect(booked(next,buyerId,'payroll')-booked(closed,buyerId,'payroll')).toBe(-paidPeople.reduce((sum,e)=>sum+weeklySalary(e.terms.annualSalary),0))
  const nextBuyer=next.hollywood!.businesses.find(b=>b.studioId===buyerId)!
  const totalBefore=closedBuyer.account.periods.reduce((sum,p)=>sum+Object.values(p.movements).reduce((n,m)=>n+m,0),0)
  const totalAfter=nextBuyer.account.periods.reduce((sum,p)=>sum+Object.values(p.movements).reduce((n,m)=>n+m,0),0)
  expect(nextBuyer.account.cash-closedBuyer.account.cash).toBeCloseTo(totalAfter-totalBefore,6)
  expect(nextBuyer.account.cash).toBeCloseTo(nextBuyer.account.openingBalance+totalAfter,6)
  const finalText=saves.exportCurrentState(next),finalReload=saves.migrateToLive(saves.importSave(finalText)).state
  expect(saves.exportCurrentState(finalReload)).toBe(finalText)
  try {expect(()=>acquisition.closeAbsorption(closed,input,170)).toThrow(/^absorption: targetTerminal$/)}
  finally {expect(JSON.stringify(closed)).toBe(closedBefore)}
  expect(JSON.stringify(paid.state)).toBe(paidBefore);expect(JSON.stringify(state)).toBe(before)
  expect(JSON.stringify(initial)).toBe(initialBefore);expect(JSON.stringify(old)).toBe(oldBefore);expect(JSON.stringify(raw)).toBe(rawBefore)
 })
})

// Same genuine C166 admission, extended through native rival release and its next installment.
describe('P16 genuine rival completed-take continuation admission',()=>{
 it('quotes the actual166 completed silent take with all required staff into idle R02 before reaching the continued-work producer',()=>{
  const root=process.env.P16_ORIGINAL48_CAPTURE_ROOT;expect(root).toBeTruthy()
  const bytes=readFileSync(root+'/r04-actual163.save48.json')
  expect(createHash('sha256').update(bytes).digest('hex')).toBe('c17b7aa82bd09e6988867e149ed0266803d8e432cfcd8842d9c2aca1f7ace8ad')
  // Original admitted drained-R04 transaction fixture; unchanged R01/R02, no new constructor.
  const raw=JSON.parse(bytes.toString()),rawBefore=JSON.stringify(raw),old=saves.validateSaveP15B(raw),oldBefore=JSON.stringify(old)
  const initial=saves.convertV48ToV49(old).state,initialBefore=JSON.stringify(initial)
  expect(old.saveVersion).toBe(48);expect(initial.market.tick).toBe(163)
  let state=initial
  for(let boundary=164;boundary<=166;boundary++) {
   const prior=state,before=JSON.stringify(prior);state=tick(prior)
   expect(state.market.tick).toBe(boundary);expect(JSON.stringify(prior)).toBe(before)
  }
  saves.makeSave(state)
  const buyerId='studio-aca408ec-r02',ownFilmId=buyerId+':film:14'
  const source=state.hollywood!.businesses.find(b=>b.studioId===TARGET)!,buyer=state.hollywood!.businesses.find(b=>b.studioId===buyerId)!
  expect(source.productions).toHaveLength(1);expect(source.runs).toEqual([])
  const production=source.productions[0]!
  expect(production).toMatchObject({id:FILM,startTick:161,remainingTicks:4})
  expect(source.development.projects.filter(p=>p.status==='drafting'||p.status==='rewriting')).toEqual([])
  const script=source.development.projects.find(p=>p.productionId===FILM)!
  expect(script).toMatchObject({id:'script-0013',status:'inProduction',conceptId:production.conceptId})
  const takes=state.firstTakes.filter(t=>t.productionId===FILM)
  expect(takes).toHaveLength(1)
  expect(takes[0]).toEqual({eventId:'first-take-event-46',week:166,productionId:FILM,studioId:TARGET,directorId:production.directorId,cast:production.cast})
  expect(state.firstTakeSubjects.facts.find(f=>f.eventId===takes[0]!.eventId)).toMatchObject({conceptId:production.conceptId,scriptProjectId:script.id})
  expect(state.technology.productions.filter(p=>p.productionId===FILM))
   .toEqual([{studioId:TARGET,productionId:FILM,method:'silent',adoptionId:null,lockedWeek:164}])
  expect(source.operations.workflows.find(w=>w.productionId===FILM))
   .toMatchObject({phase:'shooting',setup:null,blocker:null,shootingTask:{status:'completed',directorId:production.directorId},bindings:{requiresSetBinding:false,setId:null}})
  expect(continuedWorkRefusal(state,TARGET,production)).toBeNull()
  expect(buyer.productions).toEqual([]);expect(buyer.costCutting.since).toBeNull()
  expect(buyer.runs).toMatchObject([{productionId:ownFilmId,releaseTick:165,weekIndex:1}])
  expect(state.hollywood!.receipts.filter(r=>r.kind==='filmReleased'&&r.productionId===ownFilmId))
   .toMatchObject([{week:165,studioId:buyerId,productionId:ownFilmId}])
  for(const id of [buyerId,TARGET]) {
   expect(conditionRecord(state,id)?.condition).toMatchObject({stage:'stable',week:166})
   expect(outstandingLoan(state,id,166)).toBeUndefined()
  }
  const employees=state.hollywood!.activeEmploymentOrdinals.map(i=>state.hollywood!.employment[i]!)
   .filter(e=>e.studioId===TARGET&&e.endedWeek===null&&e.terms.startWeek<=166&&166<e.terms.endWeekExclusive)
  expect(employees).toHaveLength(6);expect(employees.every(e=>e.terms.endWeekExclusive===208)).toBe(true)
  const required=[production.writerId,production.directorId,...production.craftIds,...Object.values(production.cast)]
  expect(employees.map(e=>e.terms.talentId).sort()).toEqual([...new Set(required)].sort())
  expect(state.promises.filter(p=>p.issuerStudioId===TARGET&&p.outcome===null)).toEqual([])
  expect(state.talentMarket.proposals.filter(p=>p.issuerStudioId===TARGET)).toEqual([])
  expect(state.talentMarket.cases.filter(c=>c.subjectStudioId===TARGET&&c.closedWeek===null)).toEqual([])
  const before=JSON.stringify(state)
  const paid=requestDiligence(state,{recipientId:buyerId,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']},166)
  expect(JSON.stringify(state)).toBe(before)
  expect(paid.record).toMatchObject({week:166,recipientId:buyerId,target:{kind:'studio',studioId:TARGET},fee:TUNING.RIGHTS_DUE_DILIGENCE_FEE})
  expect(paid.state.hollywood!.businesses.find(b=>b.studioId===buyerId)!.account.cash).toBe(buyer.account.cash-paid.record.fee)
  expect(paid.state.studio).toEqual(state.studio);expect(paid.state.ledger).toEqual(state.ledger)
  const paidBefore=JSON.stringify(paid.state),value=libraryValuationV1(paid.state,TARGET,166)
  expect(value.kind).toBe('available');if(value.kind!=='available')throw new Error('fixed166 continuation needs actual library valuation')
  const consideration=acquisition.absorptionAsk(value.total,source.account.cash)
  const preview={buyerId,targetId:TARGET,consideration,retention:{kind:'explicit' as const,contractIds:employees.map(e=>e.contractId)},disclosureId:paid.record.id}
  const quote=acquisition.quoteAbsorption(paid.state,preview,166)
  expect(quote.kind,'all actual required people, capacity and the complete reserve must admit this fixed route').toBe('quote')
  if(quote.kind!=='quote')throw new Error(quote.refusal)
  expect(quote.contracts.filter(c=>c.retained).map(c=>c.contractId)).toEqual(preview.retention.contractIds)
  expect(quote.contracts.every(c=>c.reason===null)).toBe(true)
  expect(quote.productions).toEqual([{productionId:FILM,remainingTicks:4,phase:'shooting',missingParticipants:[],disposition:'continues',reason:null,blockedCapability:null}])
  expect(quote.scripts).toEqual([]);expect(quote.runs).toEqual([])
  expect(quote.exitCharges).toBe(0);expect(quote.postExitCash).toBe(source.account.cash)
  expect(quote.guarantees).toBe(employees.reduce((sum,e)=>sum+guaranteedComp(e.terms,166),0))
  expect(quote.affordable).toBe(true);expect(quote.ask).toBe(consideration)
  expect(quote.outlay).toBe(consideration-source.account.cash)
  expect(quote.resultingWeeklyFixedCost).toBe(Math.ceil(weeklyFixedCost(paid.state,buyerId)+employees.reduce((sum,e)=>sum+e.terms.annualSalary/TUNING.TICKS_PER_YEAR,0)+TUNING.OVERHEAD_PER_EMPLOYEE*employees.length))
  expect(quote.reserveAfter).toBe(TUNING.RIGHTS_RESERVE_WEEKS*quote.resultingWeeklyFixedCost)
  expect(spendableCash(paid.state,buyerId)-quote.outlay).toBeGreaterThanOrEqual(quote.reserveAfter)
  const input={...preview,quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion}
  expect(input).toMatchObject({quotedAtWeek:166,quoteAgePolicyVersion:1})
  expect(acquisition.absorptionProducerRefusal(paid.state,input)).toBeNull()
  console.info('S8_RIVAL_CONTINUATION_REAL166_PREMISES '+JSON.stringify({week:166,buyerId,targetId:TARGET,productionId:FILM,remainingTicks:production.remainingTicks,takeEventId:takes[0]!.eventId,retained:preview.retention.contractIds,consideration,outlay:quote.outlay,reserve:quote.reserveAfter,guarantees:quote.guarantees}))
  // The published predecessor reaches rivalBuyerContinuedWorkProducerRequired here.
  let closed:GameState
  try {closed=acquisition.closeAbsorption(paid.state,input,166)}
  finally {
   expect(JSON.stringify(paid.state)).toBe(paidBefore);expect(JSON.stringify(state)).toBe(before)
   expect(JSON.stringify(initial)).toBe(initialBefore);expect(JSON.stringify(old)).toBe(oldBefore);expect(JSON.stringify(raw)).toBe(rawBefore)
  }
  const record=closed.rights.absorptions.find(a=>a.targetId===TARGET)!
  expect(record).toMatchObject({buyerId,targetId:TARGET,week:166,exitCharges:0,outlay:quote.outlay})
  expect(record.continuedProductions).toHaveLength(1)
  expect(record.continuedProductions[0]).toMatchObject({productionId:FILM,scriptProjectId:script.id,
   originalProduction:production,originalWorkflow:source.operations.workflows.find(w=>w.productionId===FILM)})
  expect(record.workSteps).toEqual([]);expect(record.workReleases).toEqual([]);expect(record.runReceipts).toEqual([])
  const closedSource=closed.hollywood!.businesses.find(b=>b.studioId===TARGET)!,closedBuyer=closed.hollywood!.businesses.find(b=>b.studioId===buyerId)!
  expect(closedSource.productions).toEqual(source.productions);expect(closedSource.projects).toEqual(source.projects)
  expect(closedSource.development).toEqual(source.development)
  expect(closedSource.operations.workflows.some(w=>w.productionId===FILM)).toBe(false)
  expect(closedBuyer.productions).toEqual([]);expect(closedBuyer.runs).toEqual(buyer.runs)
  expect(closedSource.account.cash).toBe(0)
  expect(closedBuyer.account.cash).toBe(buyer.account.cash-paid.record.fee-quote.outlay)
  expect(actualP16Money(closed,buyerId).acquisitionOutlay-actualP16Money(paid.state,buyerId).acquisitionOutlay).toBe(-quote.outlay)
  expect(closed.contracts).toEqual(paid.state.contracts);expect(closed.studio).toEqual(paid.state.studio)
  expect(closed.operations).toEqual(paid.state.operations);expect(closed.ledger).toEqual(paid.state.ledger)
  for(const original of employees) {
   const buyerContractId=buyerId+':contract:'+original.terms.talentId+':166'
   expect(record.contracts.find(c=>c.sourceContractId===original.contractId)).toEqual({sourceContractId:original.contractId,buyerContractId,talentId:original.terms.talentId,exitCost:0})
   expect(closed.hollywood!.employment.find(e=>e.contractId===original.contractId)).toEqual({...original,endedWeek:166})
   expect(closed.hollywood!.employment.find(e=>e.contractId===buyerContractId))
    .toEqual({contractId:buyerContractId,studioId:buyerId,endedWeek:null,reason:'absorptionContinuation',terms:{...original.terms,startWeek:166,termWeeks:42}})
  }
  const booked=(s:GameState,id:string,kind:'signing'|'payroll'|'studioRevenue')=>s.hollywood!.businesses.find(b=>b.studioId===id)!.account.periods.reduce((sum,p)=>sum+p.movements[kind],0)
  for(const id of [TARGET,buyerId])expect(booked(closed,id,'signing')).toBe(booked(paid.state,id,'signing'))
  // The writer remains a permanent credit, not a production seat or an artificial staffing hold.
  const company=[production.directorId,...Object.values(production.cast),...production.craftIds]
  expect(new Set(company).size).toBe(5);expect(company).not.toContain(production.writerId)
  let journey=closed
  for(let week=166;week<=170;week++) {
   const prior=journey,priorBefore=JSON.stringify(prior),priorRecord=prior.rights.absorptions.find(a=>a.id===record.id)!
   const priorBuyer=prior.hollywood!.businesses.find(b=>b.studioId===buyerId)!
   if(week<170) {
    expect(prior.hollywood!.businesses.find(b=>b.studioId===TARGET)!.productions).toMatchObject([{id:FILM,remainingTicks:170-week}])
    expect(priorBuyer.productions).toEqual([])
    const workflow=priorRecord.buyerWorkflows.find(w=>w.productionId===FILM)!
    expect(priorRecord.buyerWorkflows).toHaveLength(1);expect(workflow.blocker).toBeNull()
    for(const reservation of workflow.reservations)expect(priorBuyer.operations.facilities.some(f=>f.id===reservation.facilityId&&f.capability===reservation.capability)).toBe(true)
    const busy=busyTalentIds(prior)
    for(const id of company) {
     expect(busy.has(id)).toBe(true)
     expect(releaseRefusal(prior,buyerId,id)).toBe(`talent "${id}" is seated on active production "${FILM}" until it is released (R2)`)
    }
   }
   // Persist the actual uncommitted ready boundary; replay the native automatic release.
   const text=week===169?saves.exportCurrentState(prior):null
   const reload=text===null?null:saves.migrateToLive(saves.importSave(text)).state
   const reloadBefore=reload===null?null:JSON.stringify(reload)
   if(reload!==null) {
    expect(reload.market.tick).toBe(169)
    expect(reload.hollywood!.businesses.find(b=>b.studioId===TARGET)!.releaseAuthority.commitments.some(c=>c.productionId===FILM)).toBe(false)
    expect(saves.exportCurrentState(reload)).toBe(text)
   }
   journey=tick(prior)
   expect(JSON.stringify(prior)).toBe(priorBefore);expect(journey.market.tick).toBe(week+1)
   const current=journey.rights.absorptions.find(a=>a.id===record.id)!
   const currentBuyer=journey.hollywood!.businesses.find(b=>b.studioId===buyerId)!,currentSource=journey.hollywood!.businesses.find(b=>b.studioId===TARGET)!
   if(week<170) {
    expect(current.workSteps.slice(0,-1)).toEqual(priorRecord.workSteps)
    expect(current.workSteps.at(-1)).toMatchObject({productionId:FILM,week,beforeRemaining:170-week,afterRemaining:169-week})
    expect(current.workSteps).toHaveLength(week-165)
    expect(currentBuyer.productions).toEqual([])
    expect(journey.hollywood!.receipts.slice(closed.hollywood!.receipts.length).filter(r=>r.kind==='filmAnnounced'&&r.studioId===buyerId)).toEqual([])
    for(const id of company)expect(journey.hollywood!.employment.find(e=>e.contractId===buyerId+':contract:'+id+':166'))
     .toEqual(closed.hollywood!.employment.find(e=>e.contractId===buyerId+':contract:'+id+':166'))
   } else expect(current.workSteps).toEqual(priorRecord.workSteps)
   const paidPeople=journey.hollywood!.employment.filter(e=>e.studioId===buyerId&&e.terms.startWeek<=week&&week<e.terms.endWeekExclusive&&(e.endedWeek===null||e.endedWeek>week))
   if(week<170)for(const id of company)expect(paidPeople.some(e=>e.terms.talentId===id)).toBe(true)
   expect(booked(journey,buyerId,'payroll')-booked(prior,buyerId,'payroll')).toBe(-paidPeople.reduce((sum,e)=>sum+weeklySalary(e.terms.annualSalary),0))
   const moneyBefore=priorBuyer.account.periods.reduce((sum,p)=>sum+Object.values(p.movements).reduce((n,m)=>n+m,0),0)
   const moneyAfter=currentBuyer.account.periods.reduce((sum,p)=>sum+Object.values(p.movements).reduce((n,m)=>n+m,0),0)
   expect(currentBuyer.account.cash-priorBuyer.account.cash).toBeCloseTo(moneyAfter-moneyBefore,6)
   expect(currentBuyer.account.cash).toBeCloseTo(currentBuyer.account.openingBalance+moneyAfter,6)
   expect(currentSource.account).toEqual(closedSource.account);expect(currentSource.projects).toEqual(source.projects)
   expect(currentSource.standing).toEqual(source.standing)
   expect(journey.firstTakes.filter(t=>t.productionId===FILM)).toEqual(takes)
   expect(journey.firstTakeSubjects.facts.filter(f=>f.eventId===takes[0]!.eventId)).toEqual(state.firstTakeSubjects.facts.filter(f=>f.eventId===takes[0]!.eventId))
   expect(journey.technology.productions.filter(p=>p.productionId===FILM)).toEqual(state.technology.productions.filter(p=>p.productionId===FILM))
   expect(journey.ledger.filter(e=>e.kind==='absorbedRunRevenue')).toEqual(closed.ledger.filter(e=>e.kind==='absorbedRunRevenue'))
   expect(journey.studio.cash).toBeCloseTo(prior.studio.cash+journey.ledger.slice(prior.ledger.length).reduce((sum,e)=>sum+e.amount,0),6)
   expect(journey.studioEvents.rows.filter(e=>(e.kind==='wrapped'||e.kind==='releaseCommitted')&&e.productionId===FILM)).toEqual([])
   const ownRun=buyer.runs[0]!,ownRevenue=ownRun.weeklyGross[week-ownRun.releaseTick]!*ownRun.studioShare
   let acquiredRevenue=0
   if(week<169) {
    expect(current.runReceipts).toEqual([]);expect(current.workReleases).toEqual([])
    expect(currentSource.productions).toMatchObject([{id:FILM,remainingTicks:169-week}])
   } else {
    const film=journey.hollywood!.films.find(f=>f.filmId===FILM)!
    if(film.provenance!=='simulation/v1')throw new Error('continued release must retain actual source film')
    const opening=film.result.boxOffice.opening
    const schedule=openTheatricalRun(film.result,opening,opening>0?film.result.boxOffice.total/opening:1,film.result.releaseTick)
    const index=week-169,gross=schedule.weeklyGross[index]!
    acquiredRevenue=gross*schedule.studioShare
    expect(current.runReceipts.slice(0,-1)).toEqual(priorRecord.runReceipts)
    expect(current.runReceipts).toHaveLength(index+1)
    expect(current.runReceipts.at(-1)).toMatchObject({week,productionId:FILM,weekIndex:index,gross,revenue:acquiredRevenue})
    expect(current.runReceipts.filter(r=>r.productionId===FILM&&r.weekIndex===index)).toHaveLength(1)
    expect(current.runs).toEqual([{productionId:FILM,beneficiaryFromWeek:169,startingWeekIndex:0,grossPaidBeforeClose:0,revenuePaidBeforeClose:0}])
    expect(currentSource.runs).toEqual([{...schedule,weekIndex:index+1,cumulativeGrossPaid:current.runReceipts.reduce((sum,r)=>sum+r.gross,0),cumulativeStudioRevenuePaid:current.runReceipts.reduce((sum,r)=>sum+r.revenue,0)}])
    expect(film.studioRevenueReceived).toBe(current.runReceipts.reduce((sum,r)=>sum+r.revenue,0))
    expect(film).toMatchObject({filmId:FILM,studioId:TARGET,conceptId:production.conceptId,scriptProjectId:script.id,result:{releaseTick:169,participants:production.participants}})
    expect(film.credits.some(c=>c.talentId===production.writerId&&c.role==='writer')).toBe(true)
    const cost=source.projects[Number(script.id.slice(7))]!
    expect(film.directCommitment).toBe(cost.development+cost.production+cost.marketing)
    expect(currentSource.productions).toEqual([])
    expect(currentSource.development.projects.find(p=>p.id===script.id)).toEqual({...script,status:'produced'})
    expect(current.buyerWorkflows).toEqual([]);expect(current.workReleases).toHaveLength(1)
    const release=current.workReleases[0]!
    expect(release).toMatchObject({productionId:FILM,week:169})
    expect(release.benchmarks).toEqual({expectedOpening:production.forecastSnapshot.expectedOpening,expectedTotal:production.forecastSnapshot.expectedTotal,expectedCriticScore:production.forecastSnapshot.expectedCriticScore})
    expect(release.standingAfter).toEqual(updateStanding(release.standingBefore,film.result,release.benchmarks,release.standingContext))
    if(week===169) {
     expect(release.standingBefore).toEqual(priorBuyer.standing)
     const excess=Math.max(0,release.standingAfter.audienceAwareness-TUNING.AWARENESS_DRIFT_ANCHOR)
     expect(currentBuyer.standing).toEqual({...release.standingAfter,audienceAwareness:Math.max(0,Math.min(100,release.standingAfter.audienceAwareness-TUNING.AWARENESS_DRIFT_RATE*excess))})
    } else expect(current.workReleases).toEqual(priorRecord.workReleases)
    const titles=journey.rights.titleEvents.filter(e=>e.subject.right==='R2'&&e.subject.filmId===FILM)
    expect(titles).toHaveLength(2)
    expect(titles.find(e=>e.cause==='genesis')).toMatchObject({newHolder:TARGET,date:{kind:'campaign',week:169}})
    expect(titles.find(e=>e.id===release.titleEventId)).toMatchObject({cause:'absorbedWorkRelease',priorHolder:TARGET,newHolder:buyerId,date:{kind:'campaign',week:169}})
    expect(currentHolder(journey,{right:'R2',filmId:FILM},week)).toMatchObject({kind:'holder',holderId:buyerId})
    const creatorRelease=journey.hollywood!.receipts.filter(r=>r.kind==='filmReleased'&&r.productionId===FILM)
    expect(creatorRelease).toHaveLength(1)
    expect(creatorRelease[0]).toMatchObject({week:169,studioId:TARGET,productionId:FILM,before:source.standing,after:source.standing})
   }
   // R01 is visited before R02: the newly created release must still pay installment0 at input169.
   expect(booked(journey,buyerId,'studioRevenue')-booked(prior,buyerId,'studioRevenue')).toBeCloseTo(ownRevenue+acquiredRevenue,6)
   if(reload!==null) {
    const replay=tick(reload)
    expect(JSON.stringify(reload)).toBe(reloadBefore)
    expect(saves.exportCurrentState(replay)).toBe(saves.exportCurrentState(journey))
   }
  }
  const finalText=saves.exportCurrentState(journey),finalReload=saves.migrateToLive(saves.importSave(finalText)).state
  expect(saves.exportCurrentState(finalReload)).toBe(finalText)
  expect(finalReload.rights.absorptions.find(a=>a.id===record.id)!.runReceipts).toHaveLength(2)
  expect(JSON.stringify(paid.state)).toBe(paidBefore);expect(JSON.stringify(state)).toBe(before)
  expect(JSON.stringify(initial)).toBe(initialBefore);expect(JSON.stringify(old)).toBe(oldBefore);expect(JSON.stringify(raw)).toBe(rawBefore)
 })
})
