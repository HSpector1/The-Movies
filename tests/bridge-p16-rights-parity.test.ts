// Prospective canonical Bridge paid-report / healthy-absorption parity, UNRUN.
// Exact accepted R04-pre162 capture; R03 unchanged. All setup inside each default5s leaf.
// No natural campaign, body-splicing, guessed report, mock adapter or timeout override.
import {describe,it,expect,vi} from 'vitest'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import * as saves from '../src/core/save.js'
import * as acquisition from '../src/core/acquisition.js'
import {requestDiligence} from '../src/core/dueDiligence.js'
import {conditionRecord,outstandingLoan,releaseRefusal} from '../src/core/corporateConditionLive.js'
import {terminationCost} from '../src/core/employment.js'
import {libraryValuationV1} from '../src/core/propertyValuation.js'
import {resolveTitles,subjectsHeldBy} from '../src/core/rights.js'
import type {GameState,ScriptProject,Action} from '../src/core/types.js'
import {applyActions} from '../src/core/actions.js'
import {BridgeSession,authoritativeDigest} from '../bridge/session.js'
import {BRIDGE_SCHEMA,PROTOCOL_VERSION,SCHEMA_ID,validateQuote} from '../bridge/protocol.js'
import {parseWireValue} from '../bridge/schema/runtime.js'
import type {BridgeDiligenceDraftPayload,BridgeAbsorptionDraftPayload} from '../bridge/schema/bridge-schema.ts'
import {absorptionAsk,absorptionProducerRefusal,quoteAbsorption} from '../src/core/acquisition.js'
import {activeContract,weeklyPayroll} from '../src/core/employment.js'
import {retirementRecordFor} from '../src/core/careerLifecycle.js'
import {permittedBidderRefusal,spendableCash,weeklyFixedCost} from '../src/core/rightsFinance.js'
import {trustDrivers} from '../src/core/promises.js'
import {caseForTalent,marketEligibility,proposalDraft,submitProposal,personReservationRefusal} from '../src/core/talentMarket.js'
import {rivalWeeklyOperatingCost} from '../src/core/hollywood.js'
import {TUNING} from '../src/core/tuning.js'
import {tick} from '../src/core/tick.js'
import {exportSave,importSave,makeSave,migrateToLive,stableStringify} from '../src/core/save.js'
import {historicalWriterPair,owner} from './helpers/p14c2rm-fixtures.js'
import {c2LiveFixture} from './helpers/p14c2a-fixtures.js'
import {absorptionQuoteSnapshot} from '../bridge/rights.ts'
import {promiseHistoryFor,promiseWaiverDraftToEngine} from '../bridge/promises.ts'
import {promiseRowsForPerson} from '../bridge/trust.ts'
const TARGET='studio-aca408ec-r03'
const PIN='cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19'

function prepared() {
 const root=process.env.P16_ORIGINAL48_CAPTURE_ROOT;expect(root).toBeTruthy()
 const bytes=readFileSync(root+'/r04-pre162.save48.json')
 expect(createHash('sha256').update(bytes).digest('hex')).toBe(PIN)
 const raw=JSON.parse(bytes.toString()),rawBefore=JSON.stringify(raw)
 const old=saves.validateSaveP15B(raw);expect(old.saveVersion).toBe(48)
 const oldBefore=JSON.stringify(old)
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
 const initialBefore=JSON.stringify(initial)
 const diligence=requestDiligence(initial,{recipientId:player,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']},162)
 expect(JSON.stringify(initial)).toBe(initialBefore);saves.makeSave(diligence.state)
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
 const state=diligence.state,before=JSON.stringify(state)
 const subjects=subjectsHeldBy(resolveTitles(state),state.rights.estates,TARGET,162)
 expect(subjects.length,'real nonempty held-title transition required').toBeGreaterThan(0)
 return {raw,rawBefore,old,oldBefore,initial,initialBefore,state,before,player,source,original,keep,quote,input,subjects}
}
function originalUnchanged(p:ReturnType<typeof prepared>) {
 expect(JSON.stringify(p.state)).toBe(p.before)
 expect(JSON.stringify(p.initial)).toBe(p.initialBefore)
 expect(JSON.stringify(p.old)).toBe(p.oldBefore)
 expect(JSON.stringify(p.raw)).toBe(p.rawBefore)
}

function envelope(session:BridgeSession,commandId:string,revision=session.stateRevision){return {protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:session.sessionId,commandId,expectedStateRevision:revision}}
function truth(session:BridgeSession){return {state:JSON.stringify(session.gameState),revision:session.stateRevision}}
function submit(session:BridgeSession,intentId:string,commandId:string,revision=session.stateRevision){return session.command({...envelope(session,commandId,revision),type:'submitIntent',payload:{intentId}})}
function diligenceDraft(scope:BridgeDiligenceDraftPayload['scope']=['rights','employment','liabilities']):BridgeDiligenceDraftPayload{return {target:{kind:'studio',studioId:TARGET},scope:[...scope]}}
function absorptionDraft(p:ReturnType<typeof prepared>,disclosureId=p.input.disclosureId):BridgeAbsorptionDraftPayload{
 if(disclosureId===null)throw new Error('qualified paid report prerequisite absent')
 return {targetId:TARGET,consideration:p.input.consideration,disclosureId,retention:{kind:'explicit',contractIds:[p.keep.contractId]}}
}
function askD(session:BridgeSession,draft:BridgeDiligenceDraftPayload,id:string){
 const request={...envelope(session,id),type:'quotePaidDueDiligence' as const,draft},before=truth(session),parsed=validateQuote(request)
 expect(parsed.ok,'PREREQUISITE: canonical paid diligence request must be admitted').toBe(true)
 if(!parsed.ok)throw new Error(JSON.stringify(parsed))
 const response=session.quote(parsed.quote);expect(response.accepted).toBe(true)
 if(!response.accepted)throw new Error(response.message)
 expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse,response)).toEqual(response)
 const q=response.quote;if(q.kind!=='requestDueDiligence')throw new Error('PREREQUISITE: paid diligence dispatch returned wrong family')
 expect(truth(session)).toEqual(before);expect(response.stateDigest).toBe(authoritativeDigest(session.gameState));return {q,response,request}
}
function askA(session:BridgeSession,draft:BridgeAbsorptionDraftPayload,id:string){
 const request={...envelope(session,id),type:'quoteHealthyAbsorption' as const,draft},before=truth(session),parsed=validateQuote(request)
 expect(parsed.ok,'PREREQUISITE: canonical healthy absorption request must be admitted').toBe(true)
 if(!parsed.ok)throw new Error(JSON.stringify(parsed))
 const response=session.quote(parsed.quote);expect(response.accepted).toBe(true)
 if(!response.accepted)throw new Error(response.message)
 expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse,response)).toEqual(response)
 const q=response.quote;if(q.kind!=='absorbStudio')throw new Error('PREREQUISITE: absorption dispatch returned wrong family')
 expect(truth(session)).toEqual(before);expect(response.stateDigest).toBe(authoritativeDigest(session.gameState));return {q,response,request}
}
function legalA(session:BridgeSession,p:ReturnType<typeof prepared>,id:string){
 const result=askA(session,absorptionDraft(p),id)
 expect(result.q).toMatchObject({ok:true,refusalReason:null,startsNow:true,queues:false,quotedAtWeek:162,quoteAgePolicyVersion:1,disclosureId:p.input.disclosureId,
  terms:{consideration:p.quote.consideration,targetCashBeforeExits:p.quote.targetCashBeforeExits,exitCharges:p.quote.exitCharges,postExitCash:p.quote.postExitCash,
   outlay:p.quote.outlay,ask:p.quote.ask,guarantees:p.quote.guarantees,reserveAfter:p.quote.reserveAfter,retainedContracts:[p.keep.contractId],rightsCount:p.subjects.length}})
 return result
}

describe('P16 real Bridge paid due diligence and healthy absorption opaque families',()=>{
 it('paid preview reveals no body or held report and real commit charges exactly once with public-action equality and same-command replay',()=>{
  const p=prepared(),session=new BridgeSession(p.initial,'rights-paid'),draft=diligenceDraft(),before=truth(session)
  const {q}=askD(session,draft,'preview');expect(q).toMatchObject({ok:true,startsNow:true,queues:false,refusalReason:null,fee:p.initial.studio.cash-p.state.studio.cash})
  expect(q.fee).toBeGreaterThan(0);expect(q.disclosureId).not.toBeNull();expect(Object.hasOwn(q,'body')).toBe(false)
  expect(session.gameState.rights.diligence).toEqual(p.initial.rights.diligence);expect(truth(session)).toEqual(before)
  const expected=applyActions(p.initial,[{kind:'requestDueDiligence',...draft}]);saves.makeSave(expected)
  const result=submit(session,q.intentId,'pay',0);expect(result.accepted).toBe(true)
  if(!result.accepted)throw new Error(result.message)
  expect(saves.stableStringify(session.gameState)).toBe(saves.stableStringify(expected));expect(session.stateRevision).toBe(1)
  const report=session.gameState.rights.diligence.find(d=>d.id===q.disclosureId)!
  expect(report).toMatchObject({recipientId:p.player,week:q.disclosureWeek,staleFromWeek:q.staleFromWeek,fee:q.fee,target:draft.target,scope:draft.scope})
  expect(session.gameState.ledger.filter(e=>e.kind==='dueDiligenceFee'&&e.note===report.transactionId)).toHaveLength(1)
  const committed=truth(session);expect(submit(session,q.intentId,'pay',0)).toEqual(result);expect(truth(session)).toEqual(committed)
  expect(submit(session,q.intentId,'cannot-pay-twice').accepted).toBe(false);expect(truth(session)).toEqual(committed);originalUnchanged(p)
 })
 it('held real report prices and commits exact fractional acquisition once with original quote pair linked titles and public direct action parity',()=>{
  const p=prepared(),session=new BridgeSession(p.state,'rights-absorb'),{q}=legalA(session,p,'preview')
  const direct=acquisition.closeAbsorption(p.state,p.input,162)
  const action=applyActions(p.state,[{kind:'absorbStudio',absorption:{targetId:TARGET,consideration:p.input.consideration,retention:p.input.retention,
   disclosureId:p.input.disclosureId,quotedAtWeek:q.quotedAtWeek,quoteAgePolicyVersion:q.quoteAgePolicyVersion}}])
  expect(saves.stableStringify(action)).toBe(saves.stableStringify(direct))
  const accepted=submit(session,q.intentId,'close',0);expect(accepted.accepted).toBe(true)
  if(!accepted.accepted)throw new Error(accepted.message)
  expect(saves.stableStringify(session.gameState)).toBe(saves.stableStringify(direct))
  const record=session.gameState.rights.absorptions.find(a=>a.targetId===TARGET)!
  expect(record).toMatchObject({buyerId:p.player,quotedAtWeek:162,quoteAgePolicyVersion:1,outlay:p.quote.outlay})
  expect(record.titleEventIds).toHaveLength(p.subjects.length)
  expect(session.gameState.ledger.filter(e=>e.kind==='acquisitionOutlay'&&e.note===record.id)).toHaveLength(1)
  expect(session.gameState.ledger.filter(e=>e.kind==='dueDiligenceFee')).toEqual(p.state.ledger.filter(e=>e.kind==='dueDiligenceFee'))
  expect(session.gameState.ledger.filter(e=>e.kind==='signingBonus')).toEqual(p.state.ledger.filter(e=>e.kind==='signingBonus'))
  const text=saves.exportCurrentState(session.gameState);expect(saves.exportCurrentState(saves.migrateToLive(saves.importSave(text)).state)).toBe(text)
  const after=truth(session);expect(submit(session,q.intentId,'close',0)).toEqual(accepted);expect(truth(session)).toEqual(after)
  expect(submit(session,q.intentId,'cannot-close-twice').accepted).toBe(false);expect(truth(session)).toEqual(after);originalUnchanged(p)
 })
 it('unheld and genuinely paid partial-scope reports refuse before private absorption terms and never register an executable intent',()=>{
  const p=prepared(),session=new BridgeSession(p.initial,'rights-no-report'),before=truth(session)
  const unheld=askA(session,absorptionDraft(p),'unheld').q
  expect(unheld.ok).toBe(false);expect(unheld.refusalReason).toMatch(/disclosure/i);expect(unheld.terms).toBeNull()
  expect(submit(session,unheld.intentId,'unheld-close').accepted).toBe(false);expect(truth(session)).toEqual(before)
  const partial=requestDiligence(p.initial,{recipientId:p.player,target:{kind:'studio',studioId:TARGET},scope:['rights']},162);saves.makeSave(partial.state)
  const partialSession=new BridgeSession(partial.state,'rights-partial'),partialBefore=truth(partialSession)
  const refused=askA(partialSession,absorptionDraft(p,partial.record.id),'partial').q
  expect(refused.ok).toBe(false);expect(refused.refusalReason).toMatch(/disclosure/i);expect(refused.terms).toBeNull()
  expect(submit(partialSession,refused.intentId,'partial-close').accepted).toBe(false);expect(truth(partialSession)).toEqual(partialBefore);originalUnchanged(p)
 })
 it('closed canonical drafts refuse supplied buyer and quote dates while private nested retention remains detached from later caller mutation',()=>{
  const p=prepared(),session=new BridgeSession(p.state,'rights-wire'),draft=absorptionDraft(p),before=truth(session)
  for(const extra of [{buyerId:TARGET},{quotedAtWeek:149},{quoteAgePolicyVersion:99}]){
   expect(validateQuote({...envelope(session,'spoof'),type:'quoteHealthyAbsorption',draft:{...draft,...extra}}).ok).toBe(false)
   expect(truth(session)).toEqual(before)
  }
  const q=askA(session,draft,'detached').q;expect(q.ok).toBe(true)
  if(draft.retention.kind!=='explicit')throw new Error('fixed explicit retention required')
  draft.retention.contractIds[0]='not-the-priced-contract'
  const accepted=submit(session,q.intentId,'detached-close');expect(accepted.accepted).toBe(true)
  if(!accepted.accepted)throw new Error(accepted.message)
  expect(saves.stableStringify(session.gameState)).toBe(saves.stableStringify(acquisition.closeAbsorption(p.state,p.input,162)));originalUnchanged(p)
 })
 it('captured actual paid and absorption apply closures refuse a different fully admitted real state and public revision guards retain authority',()=>{
  const p=prepared(),session=new BridgeSession(p.state,'rights-captured'),a=legalA(session,p,'absorption').q,d=askD(session,diligenceDraft(),'diligence').q
  expect(d.ok).toBe(true)
  const resolve=session as unknown as {quotedIntentFor(id:string):{apply(current:GameState):{ok:true;next:GameState}|{ok:false;error:string}}|undefined}
  const ai=resolve.quotedIntentFor(a.intentId),di=resolve.quotedIntentFor(d.intentId)
  expect(ai).toBeDefined();expect(di).toBeDefined();if(!ai||!di)throw new Error('real pending owners required')
  const changed=requestDiligence(p.state,{recipientId:p.player,target:{kind:'studio',studioId:TARGET},scope:['rights']},162).state
  saves.makeSave(changed);const bytes=JSON.stringify(changed),original=truth(session)
  for(const actual of [ai,di]){const rejected=actual.apply(changed);expect(rejected.ok).toBe(false);if(!rejected.ok)expect(rejected.error).toBe('Quoted rights intent no longer matches the authoritative state.');expect(JSON.stringify(changed)).toBe(bytes)}
  expect(truth(session)).toEqual(original)
  const paid=submit(session,d.intentId,'advance-authority');expect(paid.accepted).toBe(true)
  if(!paid.accepted)throw new Error(paid.message)
  const after=truth(session),stale=submit(session,a.intentId,'stale-close',0);expect(stale.accepted).toBe(false)
  if(!stale.accepted)expect(stale.reasonCode).toBe('STALE_REVISION')
  expect(truth(session)).toEqual(after);originalUnchanged(p)
 })
 it('seventeen fixed legal quotes share cap16 across families and evict the first absorption without preview fees or authority changes',()=>{
  const p=prepared(),session=new BridgeSession(p.state,'rights-cap'),first=legalA(session,p,'first').q,before=truth(session)
  const scopes:BridgeDiligenceDraftPayload['scope'][]=[['rights'],['employment'],['liabilities'],['rights','employment'],['rights','liabilities'],['employment','liabilities'],['rights','employment','liabilities']]
  const drafts:BridgeDiligenceDraftPayload[]=['studio-aca408ec-r01','studio-aca408ec-r02',TARGET].flatMap(studioId=>scopes.map(scope=>({target:{kind:'studio' as const,studioId},scope:[...scope]})))
  for(let i=0;i<16;i++){const q=askD(session,drafts[i]!,`fixed-${i}`).q;expect(q.ok,'each fixed cap control quote must itself be legal').toBe(true)}
  expect(truth(session)).toEqual(before)
  const evicted=submit(session,first.intentId,'evicted');expect(evicted.accepted).toBe(false)
  if(!evicted.accepted)expect(evicted.reasonCode).toBe('INTENT_NOT_AVAILABLE')
  expect(truth(session)).toEqual(before);originalUnchanged(p)
 })
 it('actual full-writer publication failure after legal preview rolls back paid fee and acquisition with no successful validator stub',()=>{
  const p=prepared(),session=new BridgeSession(p.state,'rights-publication'),a=legalA(session,p,'absorption').q,d=askD(session,diligenceDraft(),'diligence').q
  expect(d.ok).toBe(true);const before=truth(session),real=saves.makeSave
  const spy=vi.spyOn(saves,'makeSave').mockImplementation(state=>{real(state);throw new Error('rights-publication-real-owner-fault')})
  try {for(const q of [a,d]){const result=submit(session,q.intentId,'fault-'+q.kind);expect(result.accepted).toBe(false);if(!result.accepted)expect(result.message).toContain('rights-publication-real-owner-fault');expect(truth(session)).toEqual(before)}}
  finally {spy.mockRestore()}
  originalUnchanged(p)
 })
})

// S8 compiler-owner relocation only: original complete genuine leaves, same names/budgets.
// Their preimages and original RED/typing evidence remain recorded in contract64/compiler-owner-draft.
describe('880-B natural retired-writer continuation', () => {
  it('continues genuine acquired obligations beside an own expired-contract retirement draft through Accept and save/replay', () => {
    function writeProject(state: GameState, writerId: string): ScriptProject {
      const rows = state.scriptDevelopment.projects.filter(row => row.writerIds.includes(writerId)
        && (row.status === 'drafting' || row.status === 'rewriting'))
      expect(rows, 'premise: exactly one real retained screenplay obligation').toHaveLength(1)
      return rows[0]!
    }
    function readBack(state: GameState): GameState {
      const before = stableStringify(state), saved = makeSave(state)
      const reopened = migrateToLive(importSave(exportSave(saved))).state
      expect(stableStringify(reopened), 'save/load changes no authoritative fact').toBe(before)
      expect(stableStringify(state), 'validation/write/read never mutates its input').toBe(before)
      return reopened
    }

    // Original c000479d historical producer; helper pins both untouched Save37
    // strings and the original disclosed +10m P14B.2 fixture funding. No new
    // cash, employment, promise, condition, retirement or work is authored here.
    const historical = historicalWriterPair(), historyBefore = stableStringify(historical)
    const initial = migrateToLive(historical.commissioned).state, initialBefore = stableStringify(initial)
    expect(initial.market.tick).toBe(311)
    const state = tick(initial), stateBefore = stableStringify(state)
    expect(stableStringify(initial)).toBe(initialBefore)
    expect(stableStringify(historical)).toBe(historyBefore)
    expect(state.market.tick).toBe(312)
    const buyer = owner(state), target = 'studio-56472515-r02', writer = 'person-studio-56472515-r02-0'
    const own = writeProject(state, historical.writerId)
    expect(own).toMatchObject({ id: 'script-0000', status: 'drafting', commissionedWeek: 311, dueWeek: 314 })
    expect(activeContract(state, historical.writerId)).toBeUndefined()
    expect(retirementRecordFor(state, historical.writerId)).toMatchObject({ status: 'finishing_commitments', effectiveWeek: 312 })
    for (const studioId of [buyer, target]) {
      expect(conditionRecord(state, studioId)?.condition, 'actual first post-migration condition evaluation').toMatchObject({ stage: 'stable', week: 312 })
      expect(outstandingLoan(state, studioId, 312)).toBeUndefined()
    }
    expect(permittedBidderRefusal(state, buyer, 312)).toBeNull()
    const source = state.hollywood!.businesses.find(row => row.studioId === target)!
    const script = source.development.projects.find(row => row.id === 'script-0035')!
    expect(script).toMatchObject({ status: 'drafting', commissionedWeek: 310, dueWeek: 313, writerId: writer, writerIds: [writer] })
    expect(source.productions).toMatchObject([{ id: target + ':film:34', remainingTicks: 7 }])
    expect(source.productions).toHaveLength(1)
    const employment = state.hollywood!.activeEmploymentOrdinals.map(i => state.hollywood!.employment[i]!)
      .filter(row => row.studioId === target && row.endedWeek === null && row.terms.startWeek <= 312 && 312 < row.terms.endWeekExclusive)
    expect(employment).toHaveLength(6)
    const keep = employment.find(row => row.terms.talentId === writer)!
    expect(keep).toMatchObject({ contractId: target + ':contract:' + writer + ':208', terms: { startWeek: 208, endWeekExclusive: 416 } })
    expect(personReservationRefusal(state, writer, buyer, 312), 'fixed writer must actually consent; no substitute').toBeNull()
    const openPromises = state.promises.filter(row => row.issuerStudioId === target && row.outcome === null)
    const unbound = openPromises.filter(row => row.contractId === null)
    const bound = openPromises.filter(row => row.contractId !== null)
    expect(openPromises).toHaveLength(22); expect(unbound).toHaveLength(19)
    expect(bound.map(row => row.promiseId)).toEqual(['promise-13', 'promise-15', 'promise-23'])
    expect(unbound.filter(row => bound.some(other => other.beneficiaryPersonId === row.beneficiaryPersonId)),
      'this genuine unbound cohort is disjoint from the bound obligations being continued or settled').toEqual([])
    const retainedPromise = bound.find(row => row.promiseId === 'promise-13')!
    expect(retainedPromise).toMatchObject({ contractId: keep.contractId, beneficiaryPersonId: writer,
      windowStartWeek: 208, dueWeekExclusive: 416, predicate: { count: 1 }, progress: 0, evidenceRefs: [] })
    // This genuine world has no affected open market rows: it cannot qualify
    // proposal withdrawal or nonempty case invalidation by assertion alone.
    expect(state.talentMarket.proposals.filter(row => row.issuerStudioId === target)).toEqual([])
    expect(state.talentMarket.cases.filter(row => row.subjectStudioId === target && row.closedWeek === null)).toEqual([])
    const paid = applyActions(state, [{ kind: 'requestDueDiligence', target: { kind: 'studio', studioId: target },
      scope: ['rights', 'employment', 'liabilities'] }]), paidBefore = stableStringify(paid)
    expect(stableStringify(state)).toBe(stateBefore)
    const disclosure = paid.rights.diligence.at(-1)!
    expect(disclosure).toMatchObject({ recipientId: buyer, week: 312, target: { kind: 'studio', studioId: target },
      scope: ['rights', 'employment', 'liabilities'], fee: TUNING.RIGHTS_DUE_DILIGENCE_FEE })
    expect(paid.studio.cash).toBe(state.studio.cash - disclosure.fee)
    expect(paid.ledger.slice(state.ledger.length)).toMatchObject([{ kind: 'dueDiligenceFee', week: 312, amount: -disclosure.fee, note: disclosure.transactionId }])
    const exits = employment.filter(row => row.contractId !== keep.contractId).reduce((sum, row) => sum + terminationCost(row.terms, 312), 0)
    expect(exits).toBeGreaterThan(0)
    const postExitCash = source.account.cash - exits, library = libraryValuationV1(paid, target, 312)
    expect(library.kind, 'real complete held-title valuation, no guessed price').toBe('available')
    if (library.kind !== 'available') throw new Error('actual R02 library valuation unavailable')
    const consideration = absorptionAsk(library.total, postExitCash)
    const preview = { buyerId: buyer, targetId: target, consideration, disclosureId: disclosure.id,
      retention: { kind: 'explicit' as const, contractIds: [keep.contractId] } }
    const quote = quoteAbsorption(paid, preview, 312)
    expect(stableStringify(paid)).toBe(paidBefore)
    expect(quote.kind, 'actual public consent, retention, reserve and capacity quote').toBe('quote')
    if (quote.kind !== 'quote') throw new Error(quote.refusal)
    expect(quote.affordable).toBe(true)
    expect(quote.ask).toBe(consideration); expect(quote.rightsValue).toBe(library.total)
    expect(quote.contracts.filter(row => row.retained).map(row => row.contractId)).toEqual([keep.contractId])
    expect(quote.contracts.filter(row => !row.retained)).toHaveLength(5)
    expect(quote.exitCharges).toBe(exits); expect(quote.targetCashBeforeExits).toBe(source.account.cash)
    expect(quote.postExitCash).toBe(postExitCash); expect(quote.outlay).toBe(consideration - postExitCash)
    const fixedCost = Math.ceil(weeklyFixedCost(paid, buyer) + keep.terms.annualSalary / TUNING.TICKS_PER_YEAR + TUNING.OVERHEAD_PER_EMPLOYEE)
    expect(quote.resultingWeeklyFixedCost).toBe(fixedCost)
    expect(quote.reserveAfter).toBe(TUNING.RIGHTS_RESERVE_WEEKS * fixedCost)
    expect(spendableCash(paid, buyer) - quote.outlay).toBeGreaterThanOrEqual(quote.reserveAfter)
    expect(quote.productions).toMatchObject([{ productionId: target + ':film:34', remainingTicks: 7, disposition: 'cancelRequired', reason: 'missingParticipants' }])
    expect(quote.scripts).toEqual([{ scriptProjectId: script.id, status: 'drafting', writerIds: [writer], sourceContractIds: [keep.contractId],
      disposition: 'continues', reason: 'writerTeamRetained' }])
    const { buyerId: _buyerId, ...absorption } = { ...preview, quotedAtWeek: quote.quotedAtWeek, quoteAgePolicyVersion: quote.quoteAgePolicyVersion }
    console.info('P16_OBLIGATIONS_REAL312_PREMISES ' + JSON.stringify({ week: 312, target, ownDue: own.dueWeek, acquiredDue: script.dueWeek,
      unbound: unbound.length, bound: bound.map(row => row.promiseId), fee: disclosure.fee, consideration, exitCharges: exits,
      postExitCash, outlay: quote.outlay, reserve: quote.reserveAfter, producerRefusal: absorptionProducerRefusal(paid, preview) }))
    let closed: GameState
    try {
      // Original-source RED is exactly absorption: absorbedPromiseDispositionProducerRequired.
      // Do not turn that refusal into a passing acceptance or skip the laws below.
      closed = applyActions(paid, [{ kind: 'absorbStudio', absorption }])
    } finally {
      expect(stableStringify(paid)).toBe(paidBefore)
      expect(stableStringify(state)).toBe(stateBefore)
      expect(stableStringify(initial)).toBe(initialBefore)
      expect(stableStringify(historical)).toBe(historyBefore)
    }
    const record = closed.rights.absorptions.find(row => row.targetId === target)!
    expect(record).toBeDefined(); expect(record.week).toBe(312)
    expect(record.exitCharges).toBe(exits); expect(record.postExitCash).toBe(postExitCash)
    expect(record.outlay).toBe(consideration - postExitCash)
    expect(closed.studio.cash).toBe(paid.studio.cash - record.outlay)
    expect(closed.ledger.slice(paid.ledger.length)).toMatchObject([{ kind: 'acquisitionOutlay', week: 312, amount: -record.outlay, note: record.id }])
    const targetClosed = closed.hollywood!.businesses.find(row => row.studioId === target)!
    expect(targetClosed.account.cash).toBe(0)
    expect(targetClosed.account.periods.reduce((sum, row) => sum + row.movements.termination, 0))
      .toBe(source.account.periods.reduce((sum, row) => sum + row.movements.termination, 0) - exits)
    expect(targetClosed.account.periods.reduce((sum, row) => sum + row.movements.acquisitionOutlay, 0)).toBe(-postExitCash)
    const link = record.contracts.find(row => row.sourceContractId === keep.contractId)!
    expect(link.buyerContractId).not.toBeNull()
    const retainedEmployment = closed.hollywood!.employment.find(row => row.contractId === link.buyerContractId)!
    expect(retainedEmployment).toMatchObject({ studioId: buyer, endedWeek: null, reason: 'absorptionContinuation' })
    expect(retainedEmployment.terms).toEqual({ ...keep.terms, startWeek: 312, termWeeks: 104 })
    expect(closed.contracts.filter(row => row.startWeek <= 312 && 312 < row.endWeekExclusive)).toEqual([retainedEmployment.terms])
    expect(activeContract(closed, historical.writerId)).toBeUndefined()
    expect(closed.ledger.filter(row => row.kind === 'signingBonus')).toEqual(paid.ledger.filter(row => row.kind === 'signingBonus'))
    expect(closed.promises.find(row => row.promiseId === retainedPromise.promiseId)).toEqual(retainedPromise)
    const exitPromises = bound.filter(row => row.promiseId !== retainedPromise.promiseId)
    for (const original of exitPromises) {
      const settled = closed.promises.find(row => row.promiseId === original.promiseId)!
      expect(settled).toEqual({ ...original, outcome: 'BROKEN', outcomeWeek: 312,
        outcomeCause: 'the studio terminated this contract early, ending the window', outcomeEventId: settled.outcomeEventId })
      expect(settled.outcomeEventId).not.toBeNull()
      expect(closed.talentMarket.receipts.filter(row => row.eventId === settled.outcomeEventId)).toMatchObject([
        { kind: 'promiseOutcome', week: 312, studioId: target, talentId: original.beneficiaryPersonId }])
      expect(trustDrivers(closed, original.beneficiaryPersonId, target, 312).filter(row => row.kind === 'promiseBroken' && row.week === 312)).toHaveLength(1)
    }
    expect(closed.talentMarket.receipts.slice(paid.talentMarket.receipts.length).filter(row => row.kind === 'promiseOutcome')).toHaveLength(2)
    for (const original of unbound) {
      expect(closed.promises.find(row => row.promiseId === original.promiseId)).toEqual(original)
      // Other native causes may legitimately change professional memory. Only
      // promise drivers belong to this no-outcome control; the genuine bound
      // exit cohort above has its own positive BROKEN/receipt assertions.
      expect(trustDrivers(closed, original.beneficiaryPersonId, target, 312)
        .filter(row => row.kind === 'promiseKept' || row.kind === 'promiseBroken'))
        .toEqual(trustDrivers(paid, original.beneficiaryPersonId, target, 312)
          .filter(row => row.kind === 'promiseKept' || row.kind === 'promiseBroken'))
    }
    if (!('continuedScripts' in record)) throw new Error('actual acquired screenplay continuation required')
    expect(record.continuedScripts).toHaveLength(1)
    const carried = record.continuedScripts[0]!
    expect(carried.originalScript).toEqual(script)
    expect(carried.originalCosts).toEqual(source.projects.find(row => row.scriptProjectId === script.id))
    expect(carried.sourceContractIds).toEqual([keep.contractId]); expect(carried.buyerContractIds).toEqual([link.buyerContractId])
    expect(carried.project).toMatchObject({ status: 'drafting', dueWeek: 313, writerId: writer, writerIds: [writer], conceptId: script.conceptId })
    expect(carried.project.reservation).not.toBeNull()
    expect(carried.project.reservation!.facilityId + ':' + carried.project.reservation!.slot)
      .not.toBe(own.reservation!.facilityId + ':' + own.reservation!.slot)
    expect(closed.scriptDevelopment).toEqual(paid.scriptDevelopment)
    expect(targetClosed.development).toEqual(source.development); expect(targetClosed.projects).toEqual(source.projects)
    const loaded = readBack(closed), closedBefore = stableStringify(closed), loadedBefore = stableStringify(loaded)
    const review = tick(closed), replayReview = tick(loaded)
    expect(stableStringify(closed)).toBe(closedBefore); expect(stableStringify(loaded)).toBe(loadedBefore)
    expect(stableStringify(replayReview)).toBe(stableStringify(review)); expect(review.market.tick).toBe(313)
    expect(writeProject(review, historical.writerId)).toEqual(own)
    expect(activeContract(review, historical.writerId)).toBeUndefined()
    expect(retirementRecordFor(review, historical.writerId)).toMatchObject({ status: 'finishing_commitments', effectiveWeek: 312 })
    expect(review.ledger.filter(row => row.kind === 'payroll' && row.week === 312)).toMatchObject([{ amount: -weeklyPayroll(closed, 312) }])
    const reviewRecord = review.rights.absorptions.find(row => row.id === record.id)!
    if (!('continuedScripts' in reviewRecord)) throw new Error('actual acquired screenplay review required')
    expect(reviewRecord.continuedScripts[0]!.project).toMatchObject({ id: carried.project.id, status: 'review', dueWeek: null, reservation: null, writerId: writer })
    const reviewBefore = stableStringify(review), replayBefore = stableStringify(replayReview)
    const accepted = applyActions(review, [{ kind: 'acceptScript', projectId: carried.project.id }])
    const replayAccepted = applyActions(replayReview, [{ kind: 'acceptScript', projectId: carried.project.id }])
    expect(stableStringify(review)).toBe(reviewBefore); expect(stableStringify(replayReview)).toBe(replayBefore)
    const final = readBack(accepted)
    expect(stableStringify(replayAccepted)).toBe(stableStringify(final))
    const acceptedRecord = final.rights.absorptions.find(row => row.id === record.id)!
    if (!('continuedScripts' in acceptedRecord) || !('scriptDecisions' in acceptedRecord)) throw new Error('actual carried Accept history required')
    expect(acceptedRecord.continuedScripts[0]!.project).toEqual({ ...reviewRecord.continuedScripts[0]!.project, status: 'ready' })
    expect(acceptedRecord.scriptDecisions).toMatchObject([{ kind: 'accept', projectId: carried.project.id, week: 313 }])
    expect(writeProject(final, historical.writerId)).toEqual(own)
    expect(final.promises.find(row => row.promiseId === retainedPromise.promiseId)).toEqual(retainedPromise)
    expect(final.promises.filter(row => exitPromises.some(original => original.promiseId === row.promiseId)))
      .toEqual(closed.promises.filter(row => exitPromises.some(original => original.promiseId === row.promiseId)))
    for (const original of unbound) expect(final.promises.find(row => row.promiseId === original.promiseId)).toEqual(original)
    expect(final.hollywood!.businesses.find(row => row.studioId === target)!.development).toEqual(source.development)
    expect(stableStringify(paid)).toBe(paidBefore); expect(stableStringify(historical)).toBe(historyBefore)
    // A completed/accepted screenplay leaves its credited writer free to end
    // their actual buyer employment. The original promise must still bind that
    // real action, without changing issuer/contract provenance or minting work.
    expect(final.market.tick).toBe(313)
    const liveContract = activeContract(final, writer)!
    expect(liveContract).toEqual(retainedEmployment.terms)
    expect(releaseRefusal(final, buyer, writer), 'actual Ready/unseated writer may be released').toBeNull()
    const releaseCost = terminationCost(liveContract, 313)
    expect(releaseCost).toBeGreaterThan(0); expect(final.studio.cash).toBeGreaterThanOrEqual(releaseCost)
    const finalBefore = stableStringify(final), replayAcceptedBefore = stableStringify(replayAccepted)
    const terminated = applyActions(final, [{ kind: 'releaseTalent', talentId: writer }])
    const replayTerminated = applyActions(replayAccepted, [{ kind: 'releaseTalent', talentId: writer }])
    expect(stableStringify(final)).toBe(finalBefore); expect(stableStringify(replayAccepted)).toBe(replayAcceptedBefore)
    expect(stableStringify(replayTerminated)).toBe(stableStringify(terminated))
    expect(activeContract(terminated, writer)).toBeUndefined()
    expect(terminated.freeAgents).toContain(writer)
    expect(terminated.studio.cash).toBe(final.studio.cash - releaseCost)
    expect(terminated.ledger.slice(final.ledger.length)).toEqual([
      { week: 313, kind: 'termination', amount: -releaseCost, talentId: writer, note: 'early-release termination cost' }])
    expect(terminated.hollywood!.employment.find(row => row.contractId === link.buyerContractId))
      .toEqual({ ...retainedEmployment, endedWeek: 313 })
    expect(terminated.hollywood!.employment.find(row => row.contractId === keep.contractId))
      .toEqual(final.hollywood!.employment.find(row => row.contractId === keep.contractId))
    expect(terminated.hollywood!.receipts.slice(final.hollywood!.receipts.length)).toMatchObject([
      { kind: 'employment', week: 313, studioId: buyer, talentId: writer, contractId: link.buyerContractId,
        fromStudioId: buyer, toStudioId: null, reason: 'termination' }])
    const broken = terminated.promises.find(row => row.promiseId === retainedPromise.promiseId)!
    expect(broken).toEqual({ ...retainedPromise, outcome: 'BROKEN', outcomeWeek: 313,
      outcomeCause: 'the studio terminated this contract early, ending the window', outcomeEventId: broken.outcomeEventId })
    expect(broken.outcomeEventId).not.toBeNull()
    expect(terminated.talentMarket.receipts.slice(final.talentMarket.receipts.length)).toEqual([
      { eventId: broken.outcomeEventId, kind: 'promiseOutcome', week: 313, studioId: target, talentId: writer,
        reasons: ['a promise to this person was broken by an early termination'], dropped: [] }])
    expect(terminated.promises.filter(row => row.promiseId !== retainedPromise.promiseId))
      .toEqual(final.promises.filter(row => row.promiseId !== retainedPromise.promiseId))
    expect(trustDrivers(terminated, writer, target, 313).filter(row => row.kind === 'promiseBroken' && row.week === 313))
      .toEqual([{ kind: 'promiseBroken', week: 313, positive: false, reason: 'broke a promise' }])
    expect(trustDrivers(terminated, writer, buyer, 313).filter(row => row.kind === 'promiseKept' || row.kind === 'promiseBroken'))
      .toEqual(trustDrivers(final, writer, buyer, 313).filter(row => row.kind === 'promiseKept' || row.kind === 'promiseBroken'))
    expect(trustDrivers(terminated, writer, buyer, 313).filter(row => row.kind === 'terminatedEarly' && row.week === 313))
      .toEqual([{ kind: 'terminatedEarly', week: 313, positive: false, reason: 'ended a contract early' }])
    expect(terminated.firstTakes).toEqual(final.firstTakes)
    expect(writeProject(terminated, historical.writerId)).toEqual(own)
    expect(terminated.rights.absorptions.find(row => row.id === record.id)).toEqual(acceptedRecord)
    const restored = readBack(terminated), restoredBefore = stableStringify(restored)
    // Releasing the same actual interval twice cannot create another charge or
    // outcome; use the public refusal, not a second call to a settlement seam.
    expect(() => applyActions(restored, [{ kind: 'releaseTalent', talentId: writer }]))
      .toThrow(/releaseTalent rejected .*has no active contract \(D-11\.9\)/)
    expect(stableStringify(restored)).toBe(restoredBefore)
    expect(stableStringify(final)).toBe(finalBefore); expect(stableStringify(paid)).toBe(paidBefore)
    expect(stableStringify(historical)).toBe(historyBefore)

    // S8 consumer law on the same genuine states, after the original journey.
    // Preview executes a real discarded public close; all cost stays in this leaf.
    const expectedObligations = openPromises.map(row => ({ promiseId: row.promiseId,
      disposition: row.contractId === null ? 'unboundHistory' : row.contractId === keep.contractId ? 'continued' : 'exit',
      sourceContractId: row.contractId }))
    expect(quote.promiseObligations).toEqual(expectedObligations)
    expect(quote.marketObligations).toEqual({ proposalCount: 0, caseCount: 0 })
    const bridgeQuote = absorptionQuoteSnapshot(paid, { targetId: target, consideration,
      disclosureId: disclosure.id, retention: preview.retention }, 's8-real-r02-obligations')
    expect(bridgeQuote).toMatchObject({ kind: 'absorbStudio', ok: true, refusalReason: null,
      terms: { promiseObligations: expectedObligations, marketObligations: { proposalCount: 0, caseCount: 0 } } })
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioAbsorptionQuoteSnapshot, bridgeQuote)).toEqual(bridgeQuote)
    expect(stableStringify(paid)).toBe(paidBefore)

    expect(retainedPromise.family).toBe('APPEARANCE_COUNT')
    const originalHistory = promiseHistoryFor(paid, writer, target).find(row => row.promiseId === retainedPromise.promiseId)!
    expect(originalHistory).toEqual({ promiseId: retainedPromise.promiseId, family: 'APPEARANCE_COUNT',
      count: 1, qualifyingRole: 'cast', seatClass: null, windowStartWeek: 208, dueWeekExclusive: 416,
      contractId: keep.contractId, outcome: null, outcomeWeek: null, outcomeCause: null,
      supersededByPromiseId: null, progress: 0 })
    expect(promiseRowsForPerson(paid, writer, buyer)).toEqual([])
    expect(promiseRowsForPerson(final, writer, buyer)).toEqual([originalHistory])
    expect(promiseHistoryFor(final, writer, target).find(row => row.promiseId === retainedPromise.promiseId)).toEqual(originalHistory)
    const unrelated = final.hollywood!.businesses.find(row => row.studioId !== target && row.studioId !== buyer)!.studioId
    expect(promiseHistoryFor(final, writer, unrelated)).toEqual([])
    const settledHistory = promiseRowsForPerson(restored, writer, buyer)
    expect(settledHistory).toEqual([{ ...originalHistory, outcome: 'BROKEN', outcomeWeek: 313, outcomeCause: broken.outcomeCause }])
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioMarketPromiseHistoryRow, settledHistory[0])).toEqual(settledHistory[0])

    // Identical original terms are a real request, never an admitted substitute.
    // The buyer must pass ownership and receive the native no-change refusal.
    const waiverDraft = { promiseId: retainedPromise.promiseId, substitute: { family: 'APPEARANCE_COUNT' as const,
      count: retainedPromise.predicate.count, windowStartWeek: retainedPromise.windowStartWeek,
      dueWeekExclusive: retainedPromise.dueWeekExclusive } }, waiverBefore = stableStringify(waiverDraft)
    expect(promiseWaiverDraftToEngine(paid, waiverDraft)).toEqual({ ok: false,
      error: `This studio has no promise ${JSON.stringify(retainedPromise.promiseId)} on its record.` })
    const conversion = promiseWaiverDraftToEngine(final, waiverDraft)
    expect(conversion).toMatchObject({ ok: true, kind: 'waivePromise', promiseId: retainedPromise.promiseId,
      talentId: writer, refusal: 'an identical substitute changes nothing this studio owes',
      substitute: { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 208, dueWeekExclusive: 416 } })
    expect(stableStringify(waiverDraft)).toBe(waiverBefore)
    expect(stableStringify(final)).toBe(finalBefore); expect(stableStringify(restored)).toBe(restoredBefore)
    expect(stableStringify(paid)).toBe(paidBefore); expect(stableStringify(historical)).toBe(historyBefore)
  })
})

describe('P16 absorption of a genuine current proposal', () => {
 it('withdraws the absorbed rival proposal while preserving the actual player case and competing offer', () => {
  // Record775's unchanged, strictly validated Save33 capture already contains
  // the real player director expiry case and paid proposal. Its original fund()
  // bootstrap remains disclosed in the capture provenance; no new cash/history.
  const initial=c2LiveFixture('genuine-v33-c2-contract-and-case'),initialBefore=saves.stableStringify(initial)
  const target='studio-cf7914ad-r01',talentId='authored-0001',buyer=initial.hollywood!.playerStudioId
  expect(initial.market.tick).toBe(48);expect(initial.studio.cash).toBe(28_981_127)
  expect(caseForTalent(initial,talentId)).toMatchObject({subjectStudioId:buyer,openedWeek:40,decisionWeek:52,status:'proposals_open'})
  const initialCase=initial.talentMarket.cases.find(c=>c.talentId===talentId&&c.closedWeek===null)!
  const competing=initial.talentMarket.proposals.find(p=>p.talentId===talentId&&p.issuerStudioId===buyer)!
  expect(competing).toMatchObject({submittedWeek:44,startWeek:52,termWeeks:52,premiumTier:1.25,promises:['promise-0']})
  expect(initial.promises.filter(p=>p.issuerStudioId===target)).toEqual([])
  const initialTarget=initial.hollywood!.businesses.find(b=>b.studioId===target)!
  expect(initialTarget.account.cash).toBe(19_158_967)
  expect(marketEligibility(initial,talentId).proposers).toContain(target)
  const draft=proposalDraft(initial,target,talentId,52,1,48)
  expect(initialTarget.account.cash-draft.signingBonus)
   .toBeGreaterThanOrEqual(rivalWeeklyOperatingCost(initialTarget,initial.hollywood!,48)*initialTarget.policy.reserveWeeks)
  // Public market producer already used by p14a1-proposals; fixed floor tier,
  // never a copied proposal or early call to the weekly discovery seam.
  const proposed=submitProposal(initial,{talentId,issuerStudioId:target,termWeeks:52,premiumTier:1})
  expect(saves.stableStringify(initial)).toBe(initialBefore)
  const proposal=proposed.talentMarket.proposals.find(p=>p.issuerStudioId===target&&p.talentId===talentId)!
  expect(proposal).toEqual({talentId,issuerStudioId:target,termWeeks:draft.termWeeks,premiumTier:draft.premiumTier,
   startWeek:draft.startWeek,annualSalary:draft.annualSalary,signingBonus:draft.signingBonus,digest:draft.digest,
   submittedWeek:48,promises:[],representation:null})
  expect(proposed.hollywood!.businesses.find(b=>b.studioId===target)!.account).toEqual(initialTarget.account)
  expect(proposed.talentMarket.receipts.slice(initial.talentMarket.receipts.length))
   .toMatchObject([{kind:'proposalSubmitted',week:48,talentId,studioId:target,reasons:[],dropped:[]}])
  saves.makeSave(proposed)
  const proposedBefore=saves.stableStringify(proposed),state=tick(proposed),stateBefore=saves.stableStringify(state)
  expect(state.market.tick).toBe(49);expect(saves.stableStringify(proposed)).toBe(proposedBefore)
  expect(state.talentMarket.proposals.find(p=>p.issuerStudioId===target&&p.talentId===talentId)).toEqual(proposal)
  expect(state.talentMarket.proposals.find(p=>p.issuerStudioId===buyer&&p.talentId===talentId)).toEqual(competing)
  expect(state.talentMarket.cases.find(c=>c.contractId===initialCase.contractId)).toEqual(initialCase)
  // This route proves proposal withdrawal only. It has no target-subject case
  // and does not substitute for the separate case-invalidation acceptance.
  expect(state.talentMarket.cases.filter(c=>c.subjectStudioId===target&&c.closedWeek===null)).toEqual([])
  expect(state.talentMarket.proposals.filter(p=>p.issuerStudioId===target)).toEqual([proposal])
  expect(state.promises.filter(p=>p.issuerStudioId===target)).toEqual([])
  for(const studioId of [buyer,target]) {
   expect(conditionRecord(state,studioId)?.condition).toMatchObject({stage:'stable',week:49})
   expect(outstandingLoan(state,studioId,49)).toBeUndefined()
  }
  saves.makeSave(state)
  const paid=applyActions(state,[{kind:'requestDueDiligence',target:{kind:'studio',studioId:target},scope:['rights','employment','liabilities']}])
  expect(saves.stableStringify(state)).toBe(stateBefore)
  const report=paid.rights.diligence.at(-1)!
  expect(report).toMatchObject({recipientId:buyer,target:{kind:'studio',studioId:target},week:49})
  expect(report.fee).toBeGreaterThan(0);expect(paid.studio.cash).toBe(state.studio.cash-report.fee)
  const source=paid.hollywood!.businesses.find(b=>b.studioId===target)!
  const employees=paid.hollywood!.activeEmploymentOrdinals.map(i=>paid.hollywood!.employment[i]!)
   .filter(e=>e.studioId===target&&e.endedWeek===null&&e.terms.startWeek<=49&&49<e.terms.endWeekExclusive)
  expect(employees).toHaveLength(6)
  const retention={kind:'explicit' as const,contractIds:[]},exits=employees.reduce((sum,e)=>sum+terminationCost(e.terms,49),0)
  const library=libraryValuationV1(paid,target,49);expect(library.kind).toBe('available')
  if(library.kind!=='available')throw new Error('fixed market R01 library premise unavailable')
  const consideration=acquisition.absorptionAsk(library.total,source.account.cash-exits)
  const preview={buyerId:buyer,targetId:target,consideration,retention,disclosureId:report.id}
  const paidBefore=saves.stableStringify(paid),quote=acquisition.quoteAbsorption(paid,preview,49)
  expect(saves.stableStringify(paid)).toBe(paidBefore)
  expect(quote.kind,'actual condition, disclosure and consent; no replacement price or target').toBe('quote')
  if(quote.kind!=='quote')throw new Error(quote.refusal)
  expect(quote.affordable).toBe(true);expect(quote.contracts.filter(c=>c.retained)).toEqual([])
  expect(quote.exitCharges).toBe(exits);expect(quote.postExitCash).toBe(source.account.cash-exits)
  expect(quote.outlay).toBe(consideration-quote.postExitCash)
  expect(quote.reserveAfter).toBeGreaterThan(0)
  expect(spendableCash(paid,buyer)-quote.outlay).toBeGreaterThanOrEqual(quote.reserveAfter)
  expect(quote.productions.every(p=>p.disposition==='cancelRequired')).toBe(true)
  expect(quote.scripts.every(p=>p.disposition==='writeOff')).toBe(true)
  console.info('S8 actual proposal-only premises',JSON.stringify({week:49,target,talentId,digest:proposal.digest,
   consideration,exits,outlay:quote.outlay,reserve:quote.reserveAfter,producerRefusal:acquisition.absorptionProducerRefusal(paid,preview)}))
  const action:Action={kind:'absorbStudio',absorption:{targetId:target,consideration,retention,disclosureId:report.id,
   quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion}}
  let closed:ReturnType<typeof applyActions>
  try {closed=applyActions(paid,[action])}
  finally {
   expect(saves.stableStringify(paid)).toBe(paidBefore);expect(saves.stableStringify(state)).toBe(stateBefore)
   expect(saves.stableStringify(proposed)).toBe(proposedBefore);expect(saves.stableStringify(initial)).toBe(initialBefore)
  }
  const record=closed.rights.absorptions.find(a=>a.targetId===target)!
  expect(record).toMatchObject({producerVersion:'absorption-obligations/v7',buyerId:buyer,targetId:target,week:49})
  expect(closed.talentMarket.proposals).toEqual(paid.talentMarket.proposals.filter(p=>p.issuerStudioId!==target))
  expect(closed.talentMarket.cases).toEqual(paid.talentMarket.cases)
  expect(closed.talentMarket.receipts.slice(paid.talentMarket.receipts.length)).toEqual([{
   eventId:`talent-market-event-${paid.talentMarket.receipts.length}`,kind:'proposalWithdrawn',week:49,talentId,
   studioId:target,reasons:['the issuing studio was absorbed'],dropped:[],
  }])
  expect(closed.promises).toEqual(paid.promises)
  expect(closed.studio.cash).toBe(paid.studio.cash-quote.outlay)
  expect(closed.ledger.slice(paid.ledger.length)).toEqual([{kind:'acquisitionOutlay',week:49,amount:-quote.outlay,note:record.id}])
  expect(closed.ledger.filter(e=>e.kind==='signingBonus')).toEqual(paid.ledger.filter(e=>e.kind==='signingBonus'))
  const text=saves.exportCurrentState(closed),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reload)).toBe(text)
  expect(reload.talentMarket).toEqual(closed.talentMarket)
  expect(saves.stableStringify(paid)).toBe(paidBefore)
  // Review item3: the genuine positive v7 activates pre-descent authority.
  // These are explicitly invalid JSON clones, never admitted campaign history.
  for(const defect of ['null absorption sibling','null close event'] as const) {
   const hostile=JSON.parse(text)
   if(defect==='null absorption sibling')hostile.state.rights.absorptions.push(null)
   else {
    const owner=hostile.state.rights.absorptions.find((a:{id:string})=>a.id===record.id)
    expect(owner.obligations.closeEvents.length,'actual nonempty native withdrawal event prerequisite').toBeGreaterThan(0)
    owner.obligations.closeEvents[0]=null
   }
   const before=saves.stableStringify(hostile)
   expect(()=>saves.validateSaveV49(hostile),defect).toThrow(/^absorption obligations:/)
   expect(saves.stableStringify(hostile),defect+' caller purity').toBe(before)
  }
  // Nonempty real target proposal: keep the absent target-case limit explicit.
  expect(quote.promiseObligations).toEqual([])
  expect(quote.marketObligations).toEqual({proposalCount:1,caseCount:0})
  const bridgeQuote=absorptionQuoteSnapshot(paid,{targetId:target,consideration,retention,disclosureId:report.id},'s8-real-proposal-obligations')
  expect(bridgeQuote).toMatchObject({kind:'absorbStudio',ok:true,refusalReason:null,
   terms:{promiseObligations:[],marketObligations:{proposalCount:1,caseCount:0}}})
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioAbsorptionQuoteSnapshot,bridgeQuote)).toEqual(bridgeQuote)
  expect(saves.stableStringify(paid)).toBe(paidBefore)
 })
})
