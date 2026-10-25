// UNRUN one fixed genuine45 baseline280→actual current evaluation281 transaction.
// Source prerequisites include real pending-adoption/work disposition (r6); never delete it to pass.
// No target/cash/history construction, timing/seed/asset fallback, STABLE or timeout override.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'
import * as saves from '../src/core/save.js'
import * as acquisition from '../src/core/acquisition.js'
import { requestDiligence } from '../src/core/dueDiligence.js'
import { conditionRecord, outstandingLoan } from '../src/core/corporateConditionLive.js'
import { terminationCost } from '../src/core/employment.js'
import { libraryValuationV1 } from '../src/core/propertyValuation.js'
import { adoptionQuote, equipmentPlan } from '../src/core/technologyAdoption.js'
import { technologyEntry } from '../src/core/technologyCatalogue.js'
import { applyActions } from '../src/core/actions.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
const TARGET='studio-aca408ec-r01',TECH='synchronized-sound' as const,PROJECT=TARGET+':research:'+TECH
const STAGE='facility-soundstage-12',POST='facility-post-building'
function acquiredControl() {
 const root=new URL('./fixtures/p14/genuine-v45-recovery-witnesses-1368/',import.meta.url)
 const digest=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex')
 expect(digest(readFileSync(new URL('MANIFEST.json',root)))).toBe('11ad61be481a8bec170f40425cfcfe7fcb24596418d30b6c8bf27895e93c3ba5')
 const gz=readFileSync(new URL('baseline280.json.gz',root)),raw=gunzipSync(gz)
 expect(digest(gz)).toBe('2f52fe05d0a0668e4ecade3399696d491e726a7e9ca923b51087c32ec91e2b2e')
 expect(digest(raw)).toBe('8330e8a9ed5244c9898554408b49747a9e753347605933407f9af841167f8a1f')
 const old=saves.importSave(raw.toString()),oldBefore=JSON.stringify(old)
 expect(old.saveVersion).toBe(45)
 const start=saves.migrateToLive(old).state,startBefore=JSON.stringify(start)
 expect(start.market.tick).toBe(280)
 expect(start.technology.projects.find(p=>p.id===PROJECT)).toMatchObject({status:'completed',verifiedWork:64,completedWeek:276})
 expect(start.technology.adoptions.find(a=>a.id===TARGET+':sound-adoption:0')).toMatchObject({operationalWeek:null,cancelledWeek:null})
 const state=tick(start,{develop:true});expect(state.market.tick).toBe(281)
 expect(JSON.stringify(start)).toBe(startBefore);saves.makeSave(state)
 const player=state.hollywood!.playerStudioId
 expect(conditionRecord(state,player)?.condition).toMatchObject({stage:'stable',week:281})
 expect(conditionRecord(state,TARGET)?.condition).toMatchObject({stage:'stable',week:281})
 expect(outstandingLoan(state,player,281)).toBeUndefined();expect(outstandingLoan(state,TARGET,281)).toBeUndefined()
 const sourceProject=state.technology.projects.find(p=>p.id===PROJECT)!
 expect(sourceProject).toMatchObject({status:'completed',verifiedWork:64,completedWeek:276})
 const sourceAccess=state.technology.access.find(a=>a.studioId===TARGET&&a.technologyId===TECH)!
 expect(sourceAccess).toMatchObject({route:'research',acquiredWeek:276,researchProjectId:PROJECT})
 expect(state.technology.access.some(a=>a.studioId===player&&a.technologyId===TECH&&a.acquiredWeek!==null)).toBe(false)
 const choice={buyerId:player,targetId:TARGET,consideration:1,retention:{kind:'explicit' as const,contractIds:[]},disclosureId:null}
 expect(acquisition.absorptionProducerRefusal(state,choice),'actual pending adoption or ordinary work must have a real producer; no retiming/deletion/fallback').toBeNull()
 const stateBefore=JSON.stringify(state)
 const diligence=requestDiligence(state,{recipientId:player,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']},281)
 expect(JSON.stringify(state)).toBe(stateBefore);saves.makeSave(diligence.state)
 const target=state.hollywood!.businesses.find(b=>b.studioId===TARGET)!
 const contracts=state.hollywood!.activeEmploymentOrdinals.map(i=>state.hollywood!.employment[i]!)
  .filter(e=>e.studioId===TARGET&&e.endedWeek===null&&e.terms.startWeek<=281&&281<e.terms.endWeekExclusive)
 expect(contracts.length).toBeGreaterThan(0)
 const exits=contracts.reduce((sum,e)=>sum+terminationCost(e.terms,281),0)
 const library=libraryValuationV1(diligence.state,TARGET,281);expect(library.kind).toBe('available')
 if(library.kind!=='available')throw new Error('fixed281 library valuation premise absent')
 const input={...choice,consideration:Math.ceil(acquisition.absorptionAsk(library.total,target.account.cash-exits)),disclosureId:diligence.record.id}
 const quote=acquisition.quoteAbsorption(diligence.state,input,281)
 expect(quote.kind,'single chosen fully priced public transaction, no replacement route').toBe('quote')
 if(quote.kind!=='quote')throw new Error(quote.refusal)
 expect(quote.affordable).toBe(true)
 expect(quote.knowledge.filter(k=>k.sourceProjectId===PROJECT)).toEqual([{technologyId:TECH,sourceProjectId:PROJECT,completedWeek:276,disposition:'granted'}])
 expect(quote.quotedAtWeek).toBe(281);expect(quote.quoteAgePolicyVersion).toBe(1)
 const before=JSON.stringify(diligence.state)
 const final=acquisition.closeAbsorption(diligence.state,{...input,quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion},281)
 expect(JSON.stringify(diligence.state)).toBe(before);saves.makeSave(final)
 const record=final.rights.absorptions.find(a=>a.targetId===TARGET)!
 const grant=final.technology.access.find(a=>a.studioId===player&&a.technologyId===TECH)!
 expect(record).toBeDefined();expect(grant).toBeDefined()
 expect(grant).toMatchObject({route:'acquired',chosenWeek:281,acquiredWeek:281,accessCost:0,researchProjectId:null,
  acquiredKnowledge:{absorptionId:record.id,sourceStudioId:TARGET,sourceProjectId:PROJECT}})
 expect(JSON.stringify(old)).toBe(oldBefore)
 return {old,oldBefore,start,startBefore,state,stateBefore,diligence,before,sourceProject,sourceAccess,player,final,record,grant}
}
function originalUnchanged(p:ReturnType<typeof acquiredControl>) {
 expect(JSON.stringify(p.old)).toBe(p.oldBefore);expect(JSON.stringify(p.start)).toBe(p.startBefore)
 expect(JSON.stringify(p.state)).toBe(p.stateBefore);expect(JSON.stringify(p.diligence.state)).toBe(p.before)
}
function ordinaryAdoption(p:ReturnType<typeof acquiredControl>) {
 expect(p.final.operations.facilities.some(f=>f.id===STAGE&&f.capability==='soundstage')).toBe(true)
 expect(p.final.operations.facilities.some(f=>f.id===POST&&f.capability==='post')).toBe(true)
 // Fixed R5 producer retains the target plant/equipment; no fresh buyer asset or invention entitlement is fabricated.
 expect(p.final.technology.equipment.filter(e=>e.studioId===p.player&&e.technologyId===TECH)).toHaveLength(0)
 const price=equipmentPlan(p.final,p.player,TECH),entry=technologyEntry(TECH)
 expect(price.source,'one paid-commercial-equipment premise; no replacement stage/asset').toBe('commercial')
 expect(price.cost).toBe(entry.commercialEquipmentCost);expect(price.cost).toBeGreaterThan(entry.laterInventorEquipmentCost)
 const quote=adoptionQuote(p.final,{technologyId:TECH,stageFacilityId:STAGE,postFacilityId:POST})
 expect(quote.ok,'real fixed legacy stage12/post/cash/P09 prerequisite').toBe(true)
 expect(quote.components.filter(c=>c.kind==='equipment')).toHaveLength(1)
 expect(quote.components.find(c=>c.kind==='equipment')).toMatchObject({source:'commercial',cost:entry.commercialEquipmentCost})
 const before=JSON.stringify(p.final),adopted=applyActions(p.final,[{kind:'adoptTechnology',technologyId:TECH,stageFacilityId:STAGE,postFacilityId:POST}])
 expect(JSON.stringify(p.final)).toBe(before)
 const save=saves.makeSave(adopted),row=adopted.technology.adoptions.find(a=>a.studioId===p.player&&a.technologyId===TECH)!
 expect(row).toMatchObject({route:'acquired',committedWeek:281,prototypeProjectId:null,equipmentCost:entry.commercialEquipmentCost,operationalWeek:null})
 expect(row.physicalProjectIds.length).toBeGreaterThan(0)
 expect(adopted.studio.cash).toBe(p.final.studio.cash-quote.total)
 const asset=adopted.technology.equipment.find(e=>e.id===row.equipmentAssetId)!
 expect(asset).toMatchObject({studioId:p.player,source:'commercial',cost:entry.commercialEquipmentCost,holderAdoptionId:row.id})
 return {adopted,save,row,asset,entry}
}
describe('P16 actual completed-source knowledge from retained original45 baseline280',()=>{
 it('public absorption grants linked knowledge, preserves source invention and performs one ordinary paid noninventor adoption with roundtrip',()=>{
  const p=acquiredControl(),a=ordinaryAdoption(p)
  expect(p.final.technology.projects.find(project=>project.id===PROJECT)).toEqual({...p.sourceProject,
   seats:p.sourceProject.seats.map(s=>s.releasedWeek===null?{...s,releasedWeek:281}:s)})
  expect(p.final.technology.access.find(access=>access.studioId===TARGET&&access.technologyId===TECH)).toEqual(p.sourceAccess)
  expect(p.final.technology.projects.some(project=>project.studioId===p.player&&project.technologyId===TECH)).toBe(false)
  expect(p.final.technology.access.filter(access=>access.studioId===p.player&&access.technologyId===TECH)).toHaveLength(1)
  expect(p.record.knowledge.filter(k=>k.sourceProjectId===PROJECT)).toHaveLength(1)
  expect(p.final.ledger.filter(e=>e.kind==='technologyAdoption')).toEqual(p.diligence.state.ledger.filter(e=>e.kind==='technologyAdoption'))
  const text=saves.exportCurrentState(a.adopted),reloaded=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reloaded)).toBe(text)
  expect(reloaded.technology.access.find(access=>access.studioId===p.player&&access.technologyId===TECH)).toEqual(p.grant)
  expect(reloaded.technology.adoptions.find(row=>row.id===a.row.id)).toEqual(a.row)
  const stoppedId=TARGET+':sound-adoption:0'
  const stopped=a.adopted.technology.adoptions.find(row=>row.id===stoppedId)!
  expect(stopped).toMatchObject({committedWeek:276,operationalWeek:null,cancelledWeek:null,
   absorptionDisposition:{absorptionId:p.record.id,week:281,kind:'stoppedPending'}})
  expect(stopped.committedWeek+technologyEntry(stopped.technologyId).deploymentWeeks).toBe(288)
  const targetCash=a.adopted.hollywood!.businesses.find(b=>b.studioId===TARGET)!.account.cash
  const targetReceipts=a.adopted.hollywood!.receipts.filter(row=>row.studioId===TARGET)
  const refunds=a.adopted.ledger.filter(e=>e.kind==='constructionRefund'||e.kind==='facilityDemolitionRefund')
  const originalBefore=JSON.stringify(a.adopted);let deadline=a.adopted
  for(let week=282;week<=288;week++) {
   const prior=deadline,before=JSON.stringify(prior);deadline=tick(prior,{develop:true})
   expect(JSON.stringify(prior)).toBe(before);expect(deadline.market.tick).toBe(week)
  }
  expect(deadline.technology.adoptions.find(row=>row.id===stoppedId)).toEqual(stopped)
  expect(deadline.hollywood!.receipts.filter(row=>row.studioId===TARGET)).toEqual(targetReceipts)
  expect(deadline.hollywood!.receipts.some(row=>row.kind==='technologyAdopted'&&row.adoptionId===stoppedId)).toBe(false)
  expect(deadline.hollywood!.businesses.find(b=>b.studioId===TARGET)!.account.cash).toBe(targetCash)
  expect(deadline.ledger.filter(e=>e.kind==='constructionRefund'||e.kind==='facilityDemolitionRefund')).toEqual(refunds)
  const buyer=deadline.technology.adoptions.find(row=>row.id===a.row.id)!
  expect(buyer).toMatchObject({route:'acquired',committedWeek:281,equipmentCost:a.entry.commercialEquipmentCost,prototypeProjectId:null,cancelledWeek:null})
  expect(buyer.physicalProjectIds).toEqual(a.row.physicalProjectIds)
  expect(deadline.technology.access.find(access=>access.studioId===p.player&&access.technologyId===TECH)).toEqual(p.grant)
  const deadlineText=saves.exportCurrentState(deadline),deadlineReload=saves.migrateToLive(saves.importSave(deadlineText)).state
  expect(saves.exportCurrentState(deadlineReload)).toBe(deadlineText)
  expect(deadlineReload.technology.adoptions.find(row=>row.id===stoppedId)).toEqual(stopped)
  expect(deadlineReload.technology.adoptions.find(row=>row.id===a.row.id)).toEqual(buyer)
  expect(JSON.stringify(a.adopted)).toBe(originalBefore)

  originalUnchanged(p)
 })
 it('full current reader refuses either omitted knowledge authority, foreign source and false completed history while frozen45 rejects the new access field',()=>{
  const p=acquiredControl(),text=JSON.stringify(saves.makeSave(p.final))
  const adoptionId=TARGET+':sound-adoption:0'
  const sourceAdoption=p.diligence.state.technology.adoptions.find(a=>a.id===adoptionId)!
  expect(sourceAdoption).toMatchObject({committedWeek:276,operationalWeek:null,cancelledWeek:null,equipmentCost:0,installationCost:975000})
  const stopped=p.final.technology.adoptions.find(a=>a.id===adoptionId)!
  expect(stopped).toEqual({...sourceAdoption,absorptionDisposition:{absorptionId:p.record.id,week:281,kind:'stoppedPending'}})
  expect(p.record.adoptions.filter(a=>a.adoptionId===adoptionId)).toEqual([{adoptionId,technologyId:sourceAdoption.technologyId,committedWeek:sourceAdoption.committedWeek,equipmentAssetId:sourceAdoption.equipmentAssetId,equipmentCost:sourceAdoption.equipmentCost,installationCost:sourceAdoption.installationCost}])
  const deadline=sourceAdoption.committedWeek+technologyEntry(sourceAdoption.technologyId).deploymentWeeks
  expect(deadline).toBe(288);expect(deadline).toBeGreaterThan(p.final.market.tick)

  const mutate=(fn:(state:GameState)=>void,expectedRegex=/knowledge|Technology save|absorption/i)=>{
   const envelope=JSON.parse(text);fn(envelope.state);const before=JSON.stringify(envelope)
   try {expect(()=>saves.validateSaveV49(envelope)).toThrow(expectedRegex)}
   finally {expect(JSON.stringify(envelope)).toBe(before)}
  }
  mutate(state=>{state.rights.absorptions.find(a=>a.id===p.record.id)!.knowledge=[]})
  mutate(state=>{delete state.technology.access.find(a=>a.studioId===p.player&&a.technologyId===TECH)!.acquiredKnowledge})
  mutate(state=>{state.technology.access.find(a=>a.studioId===p.player&&a.technologyId===TECH)!.acquiredKnowledge!.sourceStudioId='studio-aca408ec-r03'})
  mutate(state=>{state.technology.access.find(a=>a.studioId===p.player&&a.technologyId===TECH)!.acquiredKnowledge!.sourceProjectId=TARGET+':research:lighting-control-01'})
  mutate(state=>{state.technology.projects.find(project=>project.id===PROJECT)!.verifiedWork--})
  mutate(state=>{state.rights.absorptions.find(a=>a.id===p.record.id)!.adoptions=state.rights.absorptions.find(a=>a.id===p.record.id)!.adoptions.filter(a=>a.adoptionId!==adoptionId)})
  mutate(state=>{delete state.technology.adoptions.find(a=>a.id===adoptionId)!.absorptionDisposition})
  mutate(state=>{state.technology.adoptions.find(a=>a.id===adoptionId)!.absorptionDisposition!.absorptionId='foreign-absorption'})
  mutate(state=>{state.rights.absorptions.find(a=>a.id===p.record.id)!.adoptions.find(a=>a.adoptionId===adoptionId)!.installationCost+=0.01})
  mutate(state=>{state.rights.absorptions.find(a=>a.id===p.record.id)!.adoptions.find(a=>a.adoptionId===adoptionId)!.committedWeek--})
  mutate(state=>{state.technology.adoptions.find(a=>a.id===adoptionId)!.operationalWeek=deadline})
  mutate(state=>{Reflect.deleteProperty(state.technology.adoptions.find(a=>a.id===adoptionId)!,'cancelledWeek')},/validateSaveV26: .*cancelledWeek is missing/)
  mutate(state=>{state.technology.adoptions.find(a=>a.id===adoptionId)!.cancelledWeek=281},/validateSaveV26: adoption .* is cancelled with no cancelled physical work/)
  expect(saves.validateSaveV45(p.old)).toBe(p.old)
  // Genuine own45 envelope; only replace/add a buyer grant with the actual produced current access, no retag/current root.
  const old=JSON.parse(p.oldBefore)
  old.state.technology.access=old.state.technology.access.filter((access:{studioId:string;technologyId:string})=>!(access.studioId===p.player&&access.technologyId===TECH))
  old.state.technology.access.push({...p.grant,acquiredKnowledge:{...p.grant.acquiredKnowledge}})
  const oldBefore=JSON.stringify(old)
  try {expect(()=>saves.validateSaveV45(old)).toThrow(/Technology save: exact keys required|unknown access route/)}
  finally {expect(JSON.stringify(old)).toBe(oldBefore)}
  originalUnchanged(p)
 })
 it('full reader rejects a source-project prototype and a money-conserved later-inventor discount on actual acquired adoption',()=>{
  const p=acquiredControl(),a=ordinaryAdoption(p),text=JSON.stringify(a.save)
  const prototype=JSON.parse(text),row=prototype.state.technology.adoptions.find((r:{id:string})=>r.id===a.row.id)
  row.prototypeProjectId=PROJECT;const prototypeBefore=JSON.stringify(prototype)
  try {expect(()=>saves.validateSaveV49(prototype)).toThrow(/acquired knowledge cannot carry an inventor price or prototype entitlement/)}
  finally {expect(JSON.stringify(prototype)).toBe(prototypeBefore)}
  const discount=JSON.parse(text),discountRow=discount.state.technology.adoptions.find((r:{id:string})=>r.id===a.row.id)
  const component=discountRow.components.find((c:{kind:string})=>c.kind==='equipment')
  const asset=discount.state.technology.equipment.find((e:{id:string})=>e.id===a.asset.id)
  const ledger=discount.state.ledger.find((e:{kind:string;note:string})=>e.kind==='technologyAdoption'&&e.note==='technology-equipment:'+a.row.id)
  expect(ledger).toBeDefined()
  const savedCash=discount.state.studio.cash,difference=a.entry.commercialEquipmentCost-a.entry.laterInventorEquipmentCost
  discountRow.equipmentCost=a.entry.laterInventorEquipmentCost
  component.source='later-inventor';component.cost=a.entry.laterInventorEquipmentCost
  asset.source='later-inventor';asset.cost=a.entry.laterInventorEquipmentCost
  ledger.amount=-a.entry.laterInventorEquipmentCost;discount.state.studio.cash=savedCash+difference
  expect(discount.state.studio.cash-ledger.amount).toBeCloseTo(savedCash+a.entry.commercialEquipmentCost,6)
  const discountBefore=JSON.stringify(discount)
  try {expect(()=>saves.validateSaveV49(discount)).toThrow(/acquired knowledge cannot carry an inventor price or prototype entitlement/)}
  finally {expect(JSON.stringify(discount)).toBe(discountBefore)}
  originalUnchanged(p)
 })
})
