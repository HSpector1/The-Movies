// Prospective canonical Bridge paid-report / healthy-absorption parity, UNRUN.
// Exact accepted R04-pre162 capture; R03 unchanged. All setup inside each default5s leaf.
// No natural campaign, body-splicing, guessed report, mock adapter or timeout override.
import {describe,it,expect,vi} from 'vitest'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import * as saves from '../src/core/save.js'
import * as acquisition from '../src/core/acquisition.js'
import {requestDiligence} from '../src/core/dueDiligence.js'
import {conditionRecord,outstandingLoan} from '../src/core/corporateConditionLive.js'
import {terminationCost} from '../src/core/employment.js'
import {libraryValuationV1} from '../src/core/propertyValuation.js'
import {resolveTitles,subjectsHeldBy} from '../src/core/rights.js'
import type {GameState} from '../src/core/types.js'
import {applyActions} from '../src/core/actions.js'
import {BridgeSession,authoritativeDigest} from '../bridge/session.js'
import {BRIDGE_SCHEMA,PROTOCOL_VERSION,SCHEMA_ID,validateQuote} from '../bridge/protocol.js'
import {parseWireValue} from '../bridge/schema/runtime.js'
import type {BridgeDiligenceDraftPayload,BridgeAbsorptionDraftPayload} from '../bridge/schema/bridge-schema.ts'
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
