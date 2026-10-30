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
import { financeTotals,periodSummary } from '../src/core/economyView.js'
import { recordedFinancePeriod,recordedFinanceEntries,financeOverview } from '../src/core/financeReport.js'
import { BridgeSession } from '../bridge/session.js'
import { BRIDGE_SCHEMA } from '../bridge/protocol.js'
import { parseWireValue } from '../bridge/schema/runtime.js'
const TARGET='studio-aca408ec-r03'
const PIN='cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19'

function prepared() {
 const root=process.env.P16_ORIGINAL48_CAPTURE_ROOT;expect(root).toBeTruthy()
 const bytes=readFileSync(root+'/r04-pre162.save48.json')
 expect(createHash('sha256').update(bytes).digest('hex')).toBe(PIN)
 const raw=JSON.parse(bytes.toString()),rawBefore=saves.stableStringify(raw)
 const old=saves.validateSaveP15B(raw);expect(old.saveVersion).toBe(48)
 const oldBefore=saves.stableStringify(old)
 const current=saves.convertV48ToV49(old),initial=current.state
 expect(current.saveVersion).toBe(49);expect(initial.market.tick).toBe(162)
 const player=initial.hollywood!.playerStudioId,source=initial.hollywood!.businesses.find(b=>b.studioId===TARGET)!
 expect(source,'fixed retained R03 prerequisite').toBeDefined()
 expect(source.account.cash).toBe(6690650.718992807)
 expect(source.productions).toHaveLength(0);expect(source.runs).toHaveLength(0)
 expect(conditionRecord(initial,player)?.condition).toMatchObject({stage:'stable',week:162})
 expect(conditionRecord(initial,TARGET)?.condition).toMatchObject({stage:'stable',week:162})
 expect(outstandingLoan(initial,player,162)).toBeUndefined();expect(outstandingLoan(initial,TARGET,162)).toBeUndefined()
 expect(acquisition.absorptionProducerRefusal(initial,{buyerId:player,targetId:TARGET,consideration:1,retention:{kind:'default'},disclosureId:null})).toBeNull()
 const original=initial.hollywood!.activeEmploymentOrdinals.map(i=>initial.hollywood!.employment[i]!)
  .filter(e=>e.studioId===TARGET&&e.endedWeek===null&&e.terms.startWeek<=162&&162<e.terms.endWeekExclusive)
 expect(original).toHaveLength(6);expect(original.every(e=>e.terms.endWeekExclusive===208)).toBe(true)
 // ONE fixed explicit choice: the first authoritative target interval; fail if that person cannot lawfully continue.
 const keep=original[0]!,retention={kind:'explicit' as const,contractIds:[keep.contractId]}
 const initialBefore=saves.stableStringify(initial)
 const diligence=requestDiligence(initial,{recipientId:player,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']},162)
 expect(saves.stableStringify(initial)).toBe(initialBefore);saves.makeSave(diligence.state)
 expect(diligence.record).toMatchObject({week:162,recipientId:player,target:{kind:'studio',studioId:TARGET}})
 expect(diligence.state.studio.cash).toBe(initial.studio.cash-diligence.record.fee)
 expect(diligence.record.fee).toBeGreaterThan(0)
 const expectedExits=original.filter(e=>e!==keep).reduce((sum,e)=>sum+terminationCost(e.terms,162),0)
 const postExitCash=source.account.cash-expectedExits
 const library=libraryValuationV1(diligence.state,TARGET,162);expect(library.kind).toBe('available')
 if(library.kind!=='available')throw new Error('fixed R03 library valuation premise absent')
 // The single lawful whole consideration at the public ask; not an amount sweep or edited account.
 const consideration=Math.ceil(acquisition.absorptionAsk(library.total,postExitCash))
 const previewInput={buyerId:player,targetId:TARGET,consideration,retention,disclosureId:diligence.record.id}
 const quote=acquisition.quoteAbsorption(diligence.state,previewInput,162)
 expect(quote.kind,'actual person/willingness/reserve/retention premise, no fallback').toBe('quote')
 if(quote.kind!=='quote')throw new Error(quote.refusal)
 expect(quote.affordable).toBe(true)
 expect(quote.contracts.filter(c=>c.retained).map(c=>c.contractId)).toEqual([keep.contractId])
 expect(quote.contracts.filter(c=>!c.retained)).toHaveLength(5)
 expect(quote.exitCharges).toBe(expectedExits);expect(expectedExits).toBeGreaterThan(0)
 expect(quote.targetCashBeforeExits).toBe(source.account.cash);expect(quote.postExitCash).toBe(postExitCash)
 expect(quote.quoteAgePolicyVersion).toBe(1);expect(quote.quotedAtWeek).toBe(162)
 const input={...previewInput,quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion}
 const state=diligence.state,before=saves.stableStringify(state)
 const subjects=subjectsHeldBy(resolveTitles(state),state.rights.estates,TARGET,162)
 expect(subjects.length,'real nonempty held-title transition required').toBeGreaterThan(0)
 return {raw,rawBefore,old,oldBefore,initial,initialBefore,state,before,player,source,original,keep,quote,input,subjects}
}
function originalUnchanged(p:ReturnType<typeof prepared>) {
 expect(saves.stableStringify(p.state)).toBe(p.before)
 expect(saves.stableStringify(p.initial)).toBe(p.initialBefore)
 expect(saves.stableStringify(p.old)).toBe(p.oldBefore)
 expect(saves.stableStringify(p.raw)).toBe(p.rawBefore)
}
function complete(p:ReturnType<typeof prepared>) {
 const result=acquisition.closeAbsorption(p.state,p.input,162)
 originalUnchanged(p)
 const record=result.rights.absorptions.find(a=>a.targetId===TARGET)!
 expect(record).toBeDefined();expect(record.week).toBe(162)
 expect(record.quotedAtWeek).toBe(p.input.quotedAtWeek);expect(record.quotedAtWeek).toBe(162)
 expect(record.quoteAgePolicyVersion).toBe(p.input.quoteAgePolicyVersion);expect(record.quoteAgePolicyVersion).toBe(1)
 return {result,record}
}

function expected(p:ReturnType<typeof prepared>,result:ReturnType<typeof complete>['result']) {
 const acquisition=result.ledger.filter(e=>e.kind==='acquisitionOutlay').reduce((n,e)=>n+e.amount,0)
 const diligence=result.ledger.filter(e=>e.kind==='dueDiligenceFee').reduce((n,e)=>n+e.amount,0)
 const periodRows=result.ledger.filter(e=>e.week===162)
 const periodAcquisition=periodRows.filter(e=>e.kind==='acquisitionOutlay').reduce((n,e)=>n+e.amount,0)
 const periodDiligence=periodRows.filter(e=>e.kind==='dueDiligenceFee').reduce((n,e)=>n+e.amount,0)
 expect(Number.isInteger(periodAcquisition)).toBe(false)
 expect(periodAcquisition).toBe(-result.rights.absorptions.find(a=>a.targetId===TARGET)!.outlay)
 expect(result.studio.cash).toBe(p.state.studio.cash+periodAcquisition)
 return {acquisition,diligence,periodRows,periodAcquisition,periodDiligence}
}
describe('P16 actual fractional R03 acquisition financial presentation',()=>{
 it('real paid diligence and signed fractional net acquisition remain separate recorded categories and reconcile exact period and cash totals',()=>{
  const p=prepared(),{result}=complete(p),before=JSON.stringify(result),e=expected(p,result)
  const totals=financeTotals(result),period=periodSummary(result,162,162)
  expect(totals.acquisition).toBe(e.acquisition);expect(totals.diligence).toBe(e.diligence)
  expect(period.acquisition).toBe(e.periodAcquisition);expect(period.diligence).toBe(e.periodDiligence)
  expect(period.netCash).toBe(e.periodRows.reduce((n,row)=>n+row.amount,0))
  const report=recordedFinancePeriod(result,162,162,'actual-acquisition','Actual current acquisition')
  expect(report.categories.find(c=>c.kind==='acquisitionOutlay')).toMatchObject({amount:e.periodAcquisition,label:'Acquisition consideration net of target cash',entryCount:1})
  expect(report.categories.find(c=>c.kind==='dueDiligenceFee')).toMatchObject({amount:e.periodDiligence,label:'Rights due diligence fees',entryCount:1})
  expect(report.categories.reduce((n,c)=>n+c.amount,0)).toBeCloseTo(report.netCash,6)
  expect(report.netCash).toBe(period.netCash)
  // Historical recording can be partial; no reconstruction masquerades as a complete cash period.
  if(report.closingCash!==null)expect(report.closingCash).toBe(result.studio.cash)
  const entries=recordedFinanceEntries(result,162,162)
  expect(entries.rows.find(row=>row.kind==='acquisitionOutlay')).toMatchObject({amount:e.periodAcquisition,categoryLabel:'Acquisition consideration net of target cash'})
  expect(entries.rows.find(row=>row.kind==='dueDiligenceFee')).toMatchObject({amount:e.periodDiligence,categoryLabel:'Rights due diligence fees'})
  expect(result.ledger.filter(row=>row.kind==='constructionCapex'||row.kind==='overhead')).toEqual(p.state.ledger.filter(row=>row.kind==='constructionCapex'||row.kind==='overhead'))
  saves.makeSave(result);expect(JSON.stringify(result)).toBe(before);originalUnchanged(p)
 })
 it('real Bridge snapshot finance publishes the same fractional acquisition categories and cash without target private disclosure or changing save authority',()=>{
  const p=prepared(),{result}=complete(p),before=JSON.stringify(result),e=expected(p,result)
  const session=new BridgeSession(result,'p16-actual-fractional-acquisition-finance')
  const checkpointBefore=session.exportRuntimeCheckpoint(),snapshot=session.snapshot()
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse,snapshot)).toEqual(snapshot)
  const finance=snapshot.snapshot.finance.finance
  expect(finance.cash).toBe(result.studio.cash)
  expect(finance.currentPeriod).toEqual(financeOverview(result).currentPeriod)
  expect(finance.currentPeriod.categories.find(c=>c.kind==='acquisitionOutlay')).toMatchObject({amount:e.periodAcquisition})
  expect(finance.currentPeriod.categories.find(c=>c.kind==='dueDiligenceFee')).toMatchObject({amount:e.periodDiligence})
  expect(finance.currentPeriod.categories.reduce((n,c)=>n+c.amount,0)).toBeCloseTo(finance.currentPeriod.netCash,6)
  expect(finance.estateAccounting).toBeNull()
  // The Finance view is player cash authority, not a hidden rival-account or paid-report body export.
  expect(Object.hasOwn(finance,'targetAccount')).toBe(false)
  const checkpointAfter=session.exportRuntimeCheckpoint()
  expect(checkpointAfter.currentSaveJson).toBe(checkpointBefore.currentSaveJson)
  expect(checkpointAfter.currentStateDigest).toBe(checkpointBefore.currentStateDigest)
  expect(checkpointAfter.stateRevision).toBe(checkpointBefore.stateRevision)
  const text=saves.exportCurrentState(result),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reload)).toBe(text)
  expect(financeOverview(reload).currentPeriod).toEqual(finance.currentPeriod)
  expect(JSON.stringify(result)).toBe(before);originalUnchanged(p)
 })
})
