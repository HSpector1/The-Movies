// One fixed eight-tick diagnostic; not healthy drafting feature acceptance. Sprint 7 (P16 retained drafting) supplied the
// buyer-side continuation producer, so the current absorption owner no longer refuses this premise (Sprint 9 full gate, 2026-10-27).
import {describe,it,expect} from 'vitest'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import * as saves from '../src/core/save.js'
import {tick} from '../src/core/tick.js'
import {conditionRecord,outstandingLoan} from '../src/core/corporateConditionLive.js'
import {productionPhaseForRemainingTicks} from '../src/core/productionPhases.js'
import {absorptionProducerRefusal} from '../src/core/acquisition.js'
const TARGET='studio-aca408ec-r01'
describe('P16 fixed genuine actual163 new healthy drafting premise',()=>{
 it('observes exactly eight ordinary ticks then finds no absorption producer refusal for the genuinely new active drafting project (continuation producer present since Sprint 7)',()=>{
  const root=process.env.P16_ORIGINAL48_CAPTURE_ROOT;expect(root).toBeTruthy()
  const bytes=readFileSync(root+'/r04-actual163.save48.json')
  expect(createHash('sha256').update(bytes).digest('hex')).toBe('c17b7aa82bd09e6988867e149ed0266803d8e432cfcd8842d9c2aca1f7ace8ad')
  const raw=JSON.parse(bytes.toString()),rawBefore=JSON.stringify(raw),old=saves.validateSaveP15B(raw),oldBefore=JSON.stringify(old)
  const initial=saves.convertV48ToV49(old).state
  expect(JSON.stringify(raw)).toBe(rawBefore);expect(JSON.stringify(old)).toBe(oldBefore)
  expect(initial.market.tick).toBe(163)
  const original=initial.hollywood!.businesses.find(b=>b.studioId===TARGET)!
  expect(original.productions).toMatchObject([{id:TARGET+':film:13',remainingTicks:7}])
  const oldIds=new Set(original.development.projects.map(p=>p.id)),initialBefore=JSON.stringify(initial)
  let state=initial
  for(let input=163;input<=170;input++){
   expect(state.market.tick).toBe(input);const prior=state,before=JSON.stringify(prior)
   state=tick(prior);expect(JSON.stringify(prior)).toBe(before);expect(state.market.tick).toBe(input+1)
  }
  const beforeAdmission=JSON.stringify(state);saves.makeSave(state);expect(JSON.stringify(state)).toBe(beforeAdmission)
  const source=state.hollywood!.businesses.find(b=>b.studioId===TARGET)!
  const active=source.activeScriptOrdinals.map(i=>source.development.projects[i]!)
  const snapshot={week:state.market.tick,studioId:TARGET,condition:conditionRecord(state,TARGET)?.condition,
   cash:source.account.cash,decisionWeek:source.nextDecisionWeek,
   activeProductions:source.productions.map(p=>({id:p.id,remainingTicks:p.remainingTicks,phase:productionPhaseForRemainingTicks(p.remainingTicks)})),
   activeScripts:active.map(p=>({id:p.id,status:p.status,commissionedWeek:p.commissionedWeek,dueWeek:p.dueWeek,productionId:p.productionId,reservation:p.reservation})),
   newScriptIds:active.filter(p=>!oldIds.has(p.id)).map(p=>p.id)}
  console.info('P16_FIXED_DRAFT171_OBSERVATION '+JSON.stringify(snapshot))
  // Stop on the first absent premise. Existing script0015 or a greenlit older project is not a substitute.
  expect(state.market.tick).toBe(171)
  const fresh=active.filter(p=>!oldIds.has(p.id)&&p.status==='drafting')
  expect(fresh,'fixed route must actually produce new active drafting, no existing-project fallback').toHaveLength(1)
  expect(fresh[0]!.commissionedWeek).toBe(170)
  expect(source.productions).toHaveLength(1)
  const concurrent=source.productions[0]!
  expect(concurrent).toMatchObject({id:TARGET+':film:12',startTick:170,remainingTicks:8})
  const screenplay=active.find(p=>p.id==='script-0012')!
  expect(screenplay).toMatchObject({status:'inProduction',commissionedWeek:155,productionId:concurrent.id,dueWeek:null})
  expect(oldIds.has(screenplay.id)).toBe(true)
  const paid=source.projects.find(p=>p.scriptProjectId===screenplay.id)!
  expect(paid).toMatchObject({productionId:concurrent.id,conceptId:concurrent.conceptId,announcedWeek:170,production:concurrent.budget.negative,marketing:concurrent.budget.marketing})
  expect(paid.production).toBeGreaterThan(0)
  expect(state.hollywood!.receipts.filter(r=>r.studioId===TARGET&&r.kind==='filmAnnounced'&&r.productionId===concurrent.id)).toMatchObject([{week:170,conceptId:concurrent.conceptId}])
  expect(conditionRecord(state,TARGET)?.condition).toMatchObject({stage:'stable',week:171})
  expect(outstandingLoan(state,TARGET,171)).toBeUndefined()
  const refusal=absorptionProducerRefusal(state,{buyerId:state.hollywood!.playerStudioId,targetId:TARGET,consideration:1,retention:{kind:'default'},disclosureId:null})
  expect(refusal).toBeNull()
  console.info('P16_FIXED_DRAFT171_REFUSAL '+JSON.stringify({week:171,refusal,featureAcceptance:false,producerPresentSince:'Sprint 7'}))
  expect(JSON.stringify(state)).toBe(beforeAdmission)
  expect(JSON.stringify(initial)).toBe(initialBefore)
  expect(JSON.stringify(raw)).toBe(rawBefore);expect(JSON.stringify(old)).toBe(oldBefore)
 })
})
