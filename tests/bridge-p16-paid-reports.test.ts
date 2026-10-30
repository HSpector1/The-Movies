// UNRUN genuine public48 pre162→current49 paid-report reads; no edited finance/history/body.
// Bridge-prefixed file is compiled by tsconfig.bridge, not core tsconfig. Default5s/allsetupinside.
import {describe,it,expect} from 'vitest'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import * as saves from '../src/core/save.js'
import {requestDiligence,diligenceRefusal} from '../src/core/dueDiligence.js'
import {conditionRecord,outstandingLoan} from '../src/core/corporateConditionLive.js'
import {tick} from '../src/core/tick.js'
import {BridgeSession} from '../bridge/session.ts'
import {PROTOCOL_VERSION,SCHEMA_ID,validateIndustry} from '../bridge/protocol.ts'
import {BRIDGE_SCHEMA} from '../bridge/schema/bridge-schema.ts'
import {parseWireValue} from '../bridge/schema/runtime.ts'
import type {IndustryQuery} from '../bridge/schema/industry-schema.ts'
const TARGET='studio-aca408ec-r03',R01='studio-aca408ec-r01'
function initial() {
 const path=process.env.P16_JOIN_PREC48_PATH;expect(path).toBeTruthy()
 const bytes=readFileSync(path!);expect(createHash('sha256').update(bytes).digest('hex')).toBe('cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19')
 const raw=JSON.parse(bytes.toString()),before=JSON.stringify(raw),old=saves.validateSaveP15B(raw)
 expect(old.saveVersion).toBe(48);const state=saves.convertV48ToV49(old).state
 expect(state.market.tick).toBe(162);expect(JSON.stringify(raw)).toBe(before)
 return {state,raw,before,player:state.hollywood!.playerStudioId}
}
function query(session:BridgeSession,targetId:string|null,extra:Partial<IndustryQuery>={}) {
 const request:IndustryQuery={protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:session.sessionId,requestId:'actual-paid-report-read',expectedStateRevision:session.stateRevision,type:'industryQuery',view:'diligence',targetId,page:0,pageSize:50,lane:'recent',period:'all',...extra}
 const parsed=validateIndustry(request);expect(parsed.ok).toBe(true)
 if(!parsed.ok)throw new Error('actual closed Industry request parser refused '+JSON.stringify(parsed))
 return session.industry(parsed.request)
}
function page(session:BridgeSession,targetId:string|null) {
 const result=query(session,targetId)
 if(!('diligence' in result))throw new Error('actual guarded paid-report Industry query refused: '+JSON.stringify(result))
 expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse,result)).toEqual(result)
 expect(result.diligence).not.toBeNull();return result
}
describe('P16 real recipient-bound paid-report Bridge readback',()=>{
 it('no unpaid body then real player report only; foreign R01 paid report and missing selection stay private with detached responses and guarded revisions',()=>{
  const p=initial(),unpaid=new BridgeSession(p.state,'paid-report-before-payment')
  const empty=page(unpaid,'rights-dd-not-paid')
  expect(empty.diligence!.receipts).toEqual([]);expect(empty.diligence!.selectedReport).toBeNull()
  const inputBefore=JSON.stringify(p.state)
  const own=requestDiligence(p.state,{recipientId:p.player,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']},162)
  expect(JSON.stringify(p.state)).toBe(inputBefore);saves.makeSave(own.state)
  expect(own.record.fee).toBeGreaterThan(0);expect(own.state.studio.cash).toBe(p.state.studio.cash-own.record.fee)
  expect(conditionRecord(own.state,R01)?.condition).toMatchObject({stage:'stable',week:162})
  expect(outstandingLoan(own.state,R01,162)).toBeUndefined()
  const request={recipientId:R01,target:{kind:'studio' as const,studioId:TARGET},scope:['rights','employment','liabilities'] as ('rights'|'employment'|'liabilities')[]}
  expect(diligenceRefusal(own.state,request,162)).toBeNull()
  const ownBefore=JSON.stringify(own.state)
  const foreign=requestDiligence(own.state,request,162);expect(JSON.stringify(own.state)).toBe(ownBefore);saves.makeSave(foreign.state)
  expect(foreign.record.recipientId).toBe(R01);expect(foreign.state.studio.cash).toBe(own.state.studio.cash)
  const stateBefore=JSON.stringify(foreign.state),session=new BridgeSession(foreign.state,'paid-report-real-recipients')
  const checkpoint=session.exportRuntimeCheckpoint(),read=page(session,own.record.id)
  expect(read.diligence!.receipts.map(r=>r.id)).toEqual([own.record.id])
  expect(read.diligence!.selectedReport!.receipt).toMatchObject({id:own.record.id,recipientId:p.player,scope:['rights','employment','liabilities'],fresh:true})
  expect(read.diligence!.selectedReport!.body).toEqual(own.record.body)
  expect(page(session,foreign.record.id).diligence!.selectedReport).toBeNull()
  expect(page(session,'missing-paid-report').diligence!.selectedReport).toBeNull()
  expect(read.diligence!.selectedReport!.body.rights.length).toBeGreaterThan(0)
  read.diligence!.selectedReport!.body.rights[0]!.encumbrances.push('consumer-only-deep-mutation')
  read.diligence!.selectedReport!.receipt.scope.push('rights')
  expect(JSON.stringify(foreign.state)).toBe(stateBefore)
  expect(page(session,own.record.id).diligence!.selectedReport!.body).toEqual(own.record.body)
  expect(page(session,own.record.id).diligence!.selectedReport!.receipt.scope).toEqual(own.record.scope)
  read.diligence!.selectedReport!.body.rights=[]
  read.diligence!.selectedReport!.receipt.scope=[]
  read.diligence!.receipts[0]!.targetLabel='consumer mutation'
  expect(page(session,own.record.id).diligence!.selectedReport!.body).toEqual(own.record.body)
  expect(page(session,own.record.id).diligence!.selectedReport!.receipt.scope).toEqual(own.record.scope)
  expect(query(session,own.record.id,{expectedStateRevision:session.stateRevision+1})).toMatchObject({accepted:false,reasonCode:'STALE_REVISION'})
  const after=session.exportRuntimeCheckpoint()
  expect(after.currentSaveJson).toBe(checkpoint.currentSaveJson);expect(after.currentStateDigest).toBe(checkpoint.currentStateDigest);expect(after.stateRevision).toBe(checkpoint.stateRevision)
  expect(JSON.stringify(foreign.state)).toBe(stateBefore);expect(JSON.stringify(p.state)).toBe(inputBefore);expect(JSON.stringify(p.raw)).toBe(p.before)
 })
 it('real rights-only paid scope remains exact dated history after13 ordinary ticks and stale readback grants no extra employment or liability fields',()=>{
  const p=initial(),before=JSON.stringify(p.state)
  const paid=requestDiligence(p.state,{recipientId:p.player,target:{kind:'studio',studioId:TARGET},scope:['rights']},162)
  expect(JSON.stringify(p.state)).toBe(before);saves.makeSave(paid.state)
  expect(paid.record.body.rights.length).toBeGreaterThan(0)
  expect(paid.record.body.employment).toBeNull();expect(paid.record.body.liabilities).toBeNull()
  let state=paid.state
  for(let week=163;week<=175;week++) {const prior=state,bytes=JSON.stringify(prior);state=tick(prior);expect(JSON.stringify(prior)).toBe(bytes);expect(state.market.tick).toBe(week)}
  saves.makeSave(state);expect(state.rights.diligence.find(r=>r.id===paid.record.id)).toEqual(paid.record)
  const stateBefore=JSON.stringify(state),session=new BridgeSession(state,'paid-report-stale-history'),read=page(session,paid.record.id)
  expect(read.diligence!.selectedReport!.receipt).toMatchObject({week:162,staleFromWeek:175,fresh:false,scope:['rights']})
  expect(read.diligence!.selectedReport!.receipt.freshnessLine).toContain('fresh paid report is required')
  expect(read.diligence!.selectedReport!.body).toEqual(paid.record.body)
  expect(read.diligence!.selectedReport!.body.employment).toBeNull();expect(read.diligence!.selectedReport!.body.liabilities).toBeNull()
  expect(JSON.stringify(state)).toBe(stateBefore);expect(JSON.stringify(p.raw)).toBe(p.before)
 })
})
