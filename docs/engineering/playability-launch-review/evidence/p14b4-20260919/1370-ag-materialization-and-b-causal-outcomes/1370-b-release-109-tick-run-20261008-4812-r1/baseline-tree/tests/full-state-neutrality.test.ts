// Source proposal only. Exactly109 continuous ordinary public ticks per arm.
import assert from 'node:assert/strict'
import { join } from 'node:path'
import { it } from 'vitest'
import { tick } from '../src/core/tick.js'
import { exportSave, importSave, makeSave } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
import { assertRetainedIdentity } from './retention.mjs'
import { MAX, sha, boundedJson, boundedFile, openRegular, readMember, parseRow, CaptureWriter, validateIndex, fileSha, fullDifferences, joinRows, optional, emitJson, budget, closeRegular, checkRegular } from './streaming.mjs'
import { targeted } from './targeted.mjs'
const seed='p13-public-commercial-adoption',target='studio-5a47d054-r04'
const json=(value:unknown)=>boundedJson(value).toString('utf8')
type BProof = { businesses: number; periods: number; cuttingNull: number; cuttingActive: number; positiveZeroRefund: number }
function proveRepresentation(state: GameState): BProof {
  const businesses = state.hollywood?.businesses ?? []
  let periods = 0, cuttingNull = 0, cuttingActive = 0, positiveZeroRefund = 0
  for (const business of businesses) {
    const b = business as unknown as Record<string, unknown>
    assert.ok(Object.hasOwn(b, 'costCutting'))
    const c = b.costCutting as Record<string, unknown>
    assert.ok(c && typeof c === 'object' && !Array.isArray(c))
    assert.deepEqual(Object.keys(c), ['version', 'since'])
    assert.equal(c.version, 1)
    if (c.since === null) cuttingNull++
    else {
      assert.ok(Number.isInteger(c.since) && (c.since as number) >= 0 && (c.since as number) <= state.market.tick)
      assert.equal(business.productions.length, 0); assert.equal(business.runs.length, 0)
      cuttingActive++
    }
    for (const period of business.account.periods) {
      periods++
      const movements = period.movements as unknown as Record<string, unknown>
      assert.ok(Object.hasOwn(movements, 'facilityDemolitionRefund'))
      assert.equal(Object.is(movements.facilityDemolitionRefund, 0), true)
      positiveZeroRefund++
    }
  }
  assert.equal(state.hollywood?.receipts.some(r => (r.kind as string) === 'facilityDisposed'), false)
  return { businesses: businesses.length, periods, cuttingNull, cuttingActive, positiveZeroRefund }
}
function ownerView(state: GameState): unknown {
  return state.hollywood?.businesses.map(b => ({ studioId: b.studioId, cash: b.account.cash,
    account: b.account, costCutting: (b as unknown as { costCutting?: unknown }).costCutting ?? null,
    productions: b.productions, runs: b.runs, activeScriptOrdinals: b.activeScriptOrdinals,
    nextDecisionWeek: b.nextDecisionWeek })) ?? null
}


function admit(row:any) {
  const before=boundedJson(row),original=boundedJson(row.originalState)
  assert.equal(sha(original),row.originalStateSha256)
  assert.equal(json(row.save.state),original.toString())
  const exported=exportSave(row.save);assert.ok(Buffer.byteLength(exported)<=MAX)
  assert.equal(sha(exported),row.serializedSaveSha256)
  const admitted=importSave(exported);assert.equal(exportSave(admitted),exported)
  assert.deepEqual(admitted.state,row.originalState)
  assert.ok(boundedJson(row).equals(before),'STOP_ADMISSION_INPUT_MUTATION')
  assert.deepEqual(proveRepresentation(row.originalState),row.emptyProof)
  assert.deepEqual(ownerView(row.originalState),row.owner)
  assert.equal(row.rng,row.originalState.rngState)
  assert.equal(row.marketReceiptCount,row.originalState.talentMarket.receipts.length)
  assert.equal(row.industryReceiptCount,row.originalState.hollywood.receipts.length)
}
function capture(state:GameState,boundary:number,role:string) {
  const original=boundedJson(state),proof=proveRepresentation(state),saved=makeSave(state)
  assert.equal(saved.saveVersion,46);assert.ok(boundedJson(saved.state).equals(original))
  const exported=exportSave(saved);assert.ok(Buffer.byteLength(exported)<=MAX)
  const row={boundary,week:state.market.tick,role,seed,originalStateSha256:sha(original),originalState:state,save:saved,
    serializedSaveSha256:sha(exported),owner:ownerView(state),emptyProof:proof,rng:state.rngState,
    marketReceiptCount:state.talentMarket.receipts.length,industryReceiptCount:state.hollywood?.receipts.length??0}
  admit(row);assert.ok(boundedJson(state).equals(original));return row
}
function families(a:any,b:any) {
  const periods=(state:any)=>state.hollywood.businesses.flatMap((x:any)=>x.account.periods.map((period:any)=>({studioId:x.studioId,...period})))
  const specs:[string,(state:any)=>any[],(row:any)=>any[]][]=[
    ['employment',s=>s.hollywood.employment,r=>[r.contractId]],
    ['cases',s=>s.talentMarket.cases,r=>[r.contractId,r.variant]],
    ['market',s=>s.talentMarket.receipts,r=>[r.week,r.kind,r.talentId,optional(r,'studioId')]],
    ['industry',s=>s.hollywood.receipts,r=>[r.week,r.studioId,r.kind,optional(r,'talentId'),optional(r,'contractId')]],
    ['takes',s=>s.firstTakes,r=>[r.productionId,r.studioId]],
    ['roster',s=>s.talent,r=>[r.id]],['businesses',s=>s.hollywood.businesses,r=>[r.studioId]],
    ['financePeriods',periods,r=>[r.studioId,r.fromWeek]]]
  return Object.fromEntries(specs.map(([name,rows,key])=>[name,joinRows(rows(a),rows(b),key)]))
}
function comparison(boundary:number,left:any,right:any,previousLeft:any,previousRight:any,selected:any[],context:any) {
  const a=left.originalState,b=right.originalState
  const appended=(state:any,previous:any)=>({market:state.talentMarket.receipts.slice(previous?.talentMarket.receipts.length??state.talentMarket.receipts.length),industry:state.hollywood.receipts.slice(previous?.hollywood.receipts.length??state.hollywood.receipts.length),takes:state.firstTakes.slice(previous?.firstTakes.length??state.firstTakes.length)})
  return {boundary,week:boundary,role:'DIFF',seed,baselineStateSha256:left.originalStateSha256,interventionStateSha256:right.originalStateSha256,
    completeFieldDifferences:fullDifferences(a,b),familyJoins:families(a,b),appendedAtOutputBoundary:{baseline:appended(a,previousLeft),intervention:appended(b,previousRight)},
    targeted:boundary===404||boundary===416?{baseline:targeted(a,selected,context),intervention:targeted(b,selected,context)}:null,
    claimLimit:'Complete descriptive fields, source orders, stable identities plus occurrences. Field-array positions/eventIDs are locators/content only; no causal or whole-ledger admission.'}
}
function enforce308(row:any,arm:string,facts:any,input:any,selected:any[],base:any,delta:any) {
  const baseline=arm==='EBG';assert.equal(row.originalStateSha256,baseline?facts.baselineStateSha256:facts.interventionStateSha256)
  assert.equal(row.serializedSaveSha256,baseline?facts.baselineSerializedSaveSha256:facts.interventionSerializedSaveSha256)
  const h=row.originalState.hollywood,b=h.businesses.find((x:any)=>x.studioId===target),old=input.hollywood.businesses.find((x:any)=>x.studioId===target)
  const termination=(x:any)=>x.account.periods.reduce((n:number,p:any)=>n+p.movements.termination,0)
  assert.equal(b.account.cash-old.account.cash,baseline?facts.baselineCashDelta:facts.interventionCashDelta)
  assert.equal(termination(b)-termination(old),baseline?facts.baselineTerminationDelta:facts.interventionTerminationDelta)
  assert.equal(row.rng,facts.rng)
  for(const entry of selected){assertRetainedIdentity(entry,h.employment);assert.deepEqual(h.employment[entry.ordinal].terms,entry.row.terms);assert.equal(h.employment[entry.ordinal].endedWeek,baseline?307:null);if(!baseline)assert.ok(h.activeEmploymentOrdinals.includes(entry.ordinal))}
  const ids=new Set(selected.map(x=>x.row.contractId));const terminations=h.receipts.slice(input.hollywood.receipts.length).filter((r:any)=>r.kind==='employment'&&r.reason==='termination'&&ids.has(r.contractId))
  assert.equal(terminations.length,baseline?6:0)
  if(baseline)assert.deepEqual(terminations.map((r:any)=>r.eventId),['industry-event-419','industry-event-420','industry-event-421','industry-event-422','industry-event-423','industry-event-424'])
  else {assert.deepEqual(delta.completeFieldDifferences.map((x:any)=>x.path),facts.completeDifferentPaths)
    assert.deepEqual(row.originalState.talentMarket,base.originalState.talentMarket);assert.deepEqual(row.originalState.firstTakes,base.originalState.firstTakes)
    assert.deepEqual(h.businesses.map((x:any)=>[x.studioId,x.costCutting]),base.originalState.hollywood.businesses.map((x:any)=>[x.studioId,x.costCutting]))}
}
it('genuine307 continuous109 ticks through416 with110 bounded full readback boundaries',()=>{
  const arm=process.env.B_RELEASE_ARM!;assert.ok(arm==='EBG'||arm==='EBG_R04_RELEASE_OFF')
  const output=process.env.B_RELEASE_OUTPUT_ROOT!,capturePath=join(output,`${arm}.ndjson.gz`),indexPath=join(output,`${arm}.index.json`)
  const indexRaw=boundedFile(process.env.B_RELEASE_INDEX!),published=JSON.parse(indexRaw.toString());assert.equal(sha(indexRaw),process.env.B_RELEASE_INDEX_SHA)
  const expectedMembers=published.members;assert.equal(expectedMembers.length,110);assert.deepEqual(expectedMembers.map((x:any)=>x.member),Array.from({length:110},(_,i)=>307+i))
  const factsRaw=boundedFile(process.env.B_RELEASE_FACTS!);assert.equal(sha(factsRaw),process.env.B_RELEASE_FACTS_SHA);const facts=JSON.parse(factsRaw.toString())
  const contextRaw=boundedFile(process.env.B_RELEASE_CONTEXT!);assert.equal(sha(contextRaw),process.env.B_RELEASE_CONTEXT_SHA);const context=JSON.parse(contextRaw.toString())
  const originalFd=openRegular(published.capture.path);assert.equal(fileSha(published.capture.path),published.capture.sha256)
  let baselineFd:number|undefined,baselineIndex:any,diff:CaptureWriter|undefined;const writer=new CaptureWriter(capturePath,output,arm,seed)
  try {
    const inputRaw=readMember(originalFd,expectedMembers[0]);const inputRow=parseRow(inputRaw,307,'EBG',seed);admit(inputRow)
    assert.equal(inputRow.originalStateSha256,facts.inputStateSha256)
    // Exact captured order restored only once, after genuine307 admission.
    let state=JSON.parse(json(inputRow.originalState)) as GameState;assert.equal(sha(boundedJson(state)),inputRow.originalStateSha256)
    const input=state,selected=facts.selectedContracts;assert.equal(selected.length,6)
    for(const e of selected){assertRetainedIdentity(e,state.hollywood!.employment);assert.deepEqual(state.hollywood!.employment[e.ordinal],e.row);assert.equal(e.row.studioId,target)}
    if(arm!=='EBG') {baselineIndex=JSON.parse(boundedFile(join(output,'EBG.index.json')).toString());validateIndex(baselineIndex,join(output,'EBG.ndjson.gz'),'EBG',seed);baselineFd=openRegular(baselineIndex.capturePath);diff=new CaptureWriter(join(output,'differences.ndjson.gz'),output,'DIFF',seed)}
    let previousBase:any=null,previousState:any=null,ticks=0;const summary:any[]=[];let finalTarget:any=null
    for(let boundary=307;boundary<=416;boundary++) {
      const offset=boundary-307
      if(boundary!==307){const before=boundedJson(state),next=tick(state);ticks++;assert.ok(boundedJson(state).equals(before),'STOP_TICK_CALLER_MUTATION');assert.equal(next.market.tick,boundary);state=next}
      assert.equal(state.market.tick,boundary)
      const row=capture(state,boundary,arm),raw=writer.append(row)
      let base:any,delta:any=null
      if(arm==='EBG'){const expectedRaw=readMember(originalFd,expectedMembers[offset]);const expected=parseRow(expectedRaw,boundary,'EBG',seed);admit(expected);assert.ok(raw.equals(expectedRaw),'STOP_BASELINE_RAW_BOUNDARY');assert.deepEqual(row,expected);base=row}
      else {const baseRaw=readMember(baselineFd!,baselineIndex.members[offset]);base=parseRow(baseRaw,boundary,'EBG',seed);admit(base);delta=comparison(boundary,base,row,previousBase,previousState,selected,context);diff!.append(delta)}
      if(boundary===308)enforce308(row,arm,facts,input,selected,base,delta)
      if(boundary===416)finalTarget=targeted(state,selected,context)
      summary.push({boundary,stateSha256:row.originalStateSha256,serializedSaveSha256:row.serializedSaveSha256,rng:row.rng,differentFields:delta?.completeFieldDifferences.length??0,firstDifferentField:delta?.completeFieldDifferences[0]?.path??null})
      previousBase=base.originalState;previousState=state;budget(output)
    }
    assert.equal(ticks,109);const actualIndex=writer.close(indexPath),diffIndex=diff?.close(join(output,'differences.index.json'))
    validateIndex(actualIndex,capturePath,arm,seed);if(diffIndex)validateIndex(diffIndex,diffIndex.capturePath,'DIFF',seed)
    const actualFd=openRegular(capturePath),diffFd=diffIndex?openRegular(diffIndex.capturePath):undefined
    try {let previousA:any=null,previousB:any=null
      for(let i=0;i<110;i++){const week=307+i,actualRaw=readMember(actualFd,actualIndex.members[i]);const actual=parseRow(actualRaw,week,arm,seed);admit(actual);assert.equal(actual.originalStateSha256,summary[i].stateSha256);assert.equal(actual.serializedSaveSha256,summary[i].serializedSaveSha256);assert.equal(actual.rng,summary[i].rng)
        if(arm==='EBG'){const expectedRaw=readMember(originalFd,expectedMembers[i]);admit(parseRow(expectedRaw,week,'EBG',seed));assert.ok(actualRaw.equals(expectedRaw),'STOP_BASELINE_READBACK')}
        else {const base=parseRow(readMember(baselineFd!,baselineIndex.members[i]),week,'EBG',seed);admit(base);const delta=JSON.parse(readMember(diffFd!,diffIndex!.members[i]).toString());assert.deepEqual(delta,comparison(week,base,actual,previousA,previousB,selected,context));previousA=base.originalState;previousB=actual.originalState}
        budget(output)
      }
    }finally{try{closeRegular(actualFd)}finally{if(diffFd!==undefined)closeRegular(diffFd)}}
    checkRegular(originalFd);if(baselineFd!==undefined)checkRegular(baselineFd)
    assert.equal(fileSha(published.capture.path),published.capture.sha256)
    validateIndex(actualIndex,capturePath,arm,seed);if(baselineIndex)validateIndex(baselineIndex,baselineIndex.capturePath,'EBG',seed);if(diffIndex)validateIndex(diffIndex,diffIndex.capturePath,'DIFF',seed)
    emitJson(join(output,`${arm}.summary.json`),{status:'CONTINUATION_ARM_CANDIDATE',arm,seed,ticks,boundaries:110,fullCaptureReadback:true,allBoundarySave46Admission:true,baselineExact:arm==='EBG',indexSha256:fileSha(indexPath),diffIndexSha256:diffIndex?fileSha(join(output,'differences.index.json')):null,selectedContracts:selected.map((x:any)=>x.identity),boundariesSummary:summary,finalTarget,internalReleasePredicates:'UNOBSERVED',classification:'DIAGNOSTIC_NONE_PARTIAL_ALL_VALID'},output)
  } finally {writer.abort();diff?.abort();try{closeRegular(originalFd)}finally{if(baselineFd!==undefined)closeRegular(baselineFd)}}
},300_000)
