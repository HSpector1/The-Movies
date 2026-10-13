// Proposed NEW tests/p13b-s6-cancel-reuse-save.test.ts. Public actions; no funding/history edits.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'
import { applyActions, makeSave, migrateToLive, stableStringify, exportSave, importSave } from '../src/core/index.js'
import { validateSaveV24, validateSaveV25, validateSaveV26 } from '../src/core/save.js'
import { validateTechnology } from '../src/core/technology.js'
import { adoptionQuote } from '../src/core/technologyAdoption.js'
function original() {
 const compressed=readFileSync(new URL('./fixtures/p13b/legacy-v26-lighting-restored-795.json.gz',import.meta.url))
 expect(createHash('sha256').update(compressed).digest('hex')).toBe('47d266bccb7871450e089f886d4565c970e97ad1b0af54d297733b064416312f')
 const parsed=JSON.parse(gunzipSync(compressed).toString());const before=stableStringify(parsed)
 validateSaveV26(parsed);const state=migrateToLive(parsed).state
 expect(stableStringify(parsed)).toBe(before);makeSave(state);return state
}
function restart() {
 const state=original(),before=stableStringify(state)
 const request={technologyId:'lighting-control-01',stageFacilityId:'facility-soundstage-12'} as const
 const quote=adoptionQuote(state,request)
 expect(quote.ok).toBe(true);expect(quote.reusedEquipmentAssetId).toBe('studio-aca408ec-player:equipment:1')
 expect(quote.total).toBe(100000)
 expect(stableStringify(state)).toBe(before)
 const next=applyActions(state,[{kind:'adoptTechnology',...request}])
 expect(stableStringify(state)).toBe(before)
 return {state,next}
}
describe('S6 public cancellation equipment reuse remains whole-save admitted',()=>{
 it('keeps direct frozen24/25 whole readers on admitted own-era inputs and refuses cancelled/unheld mutants',()=>{
  const cases=[['legacy-v24-sound-operational-315',24,validateSaveV24,'eeda6efb602bafc2f78b0568447910bbc6a199f3b095aae8a869f089e6e60a44'],
   ['legacy-v25-sound-mid-deployment-309',25,validateSaveV25,'7de40f1acdb2824c5a6cf68b749b8290d553ded1780c08b3d91e2e8ab4ce1ccd']] as const
  for(const [name,version,reader,hash] of cases) {
   const raw=gunzipSync(readFileSync(new URL('./fixtures/p13b/'+name+'.json.gz',import.meta.url))).toString()
   expect(createHash('sha256').update(raw).digest('hex')).toBe(hash)
   const parsed=JSON.parse(raw),before=stableStringify(parsed)
   expect(parsed.saveVersion).toBe(version);expect(()=>reader(parsed)).not.toThrow()
   expect(stableStringify(parsed)).toBe(before)
   const own=parsed.state.hollywood.playerStudioId
   const active=parsed.state.technology.adoptions.find((a:{studioId:string;equipmentAssetId:string|null})=>a.studioId===own&&a.equipmentAssetId!==null)
   expect(active).toBeDefined()
   const unheld=JSON.parse(before)
   unheld.state.technology.equipment.find((e:{id:string})=>e.id===active.equipmentAssetId).holderAdoptionId=null
   expect(()=>reader(unheld)).toThrow('equipment asset is held by another adoption')
   const cancelled=JSON.parse(before)
   const physical=cancelled.state.placement.facilities.find((p:{projectId:string})=>active.physicalProjectIds.includes(p.projectId))
   expect(physical).toBeDefined();physical.status='cancelled'
   cancelled.state.technology.equipment.find((e:{id:string})=>e.id===active.equipmentAssetId).holderAdoptionId=null
   expect(()=>reader(cancelled)).toThrow() // Own-era mutation; no retagged48/foreign-root mask.
  }
 })

 it('retains cancelled history and exactly one current holder across restart/save/reload',()=>{
  const {state,next}=restart();const asset=next.technology.equipment.find(e=>e.id==='studio-aca408ec-player:equipment:1')!
  const old=state.technology.adoptions.find(a=>a.stageFacilityId==='facility-soundstage-07')!
  expect(next.technology.adoptions.find(a=>a.id===old.id)).toEqual(old)
  expect(old.cancelledWeek).toBe(793)
  expect(asset.holderAdoptionId).not.toBe(old.id)
  expect(next.technology.adoptions.filter(a=>a.equipmentAssetId===asset.id&&a.cancelledWeek===null)).toHaveLength(1)
  expect(next.technology.equipment).toHaveLength(state.technology.equipment.length)
  expect(next.technology.nextEquipmentId).toBe(state.technology.nextEquipmentId)
  expect(state.studio.cash-next.studio.cash).toBe(100000)
  const originalAsset=state.technology.equipment.find(e=>e.id===asset.id)!
  expect([asset.acquiredWeek,asset.source,asset.cost]).toEqual([originalAsset.acquiredWeek,originalAsset.source,originalAsset.cost])
  const current=next.technology.adoptions.find(a=>a.id===asset.holderAdoptionId)!
  expect(current.equipmentCost).toBe(0)
  expect(current.installationCost).toBe(100000)
  expect(next.ledger.slice(state.ledger.length).filter(e=>e.kind==='technologyAdoption').reduce((n,e)=>n-e.amount,0)).toBe(0)
  expect(next.ledger.slice(state.ledger.length).filter(e=>e.kind==='constructionCapex').reduce((n,e)=>n-e.amount,0)).toBe(100000)
  expect(next.ledger.filter(e=>e.kind==='constructionRefund')).toEqual(state.ledger.filter(e=>e.kind==='constructionRefund'))
  const bytes=exportSave(makeSave(next));expect(exportSave(makeSave(migrateToLive(importSave(bytes)).state))).toBe(bytes)
  // Legacy/default root policy stays unchanged; current chain alone opts into S6 law.
  expect(()=>validateTechnology(next)).toThrow('equipment asset is held by another adoption')
 })
 it('refuses active unheld/dangling/cancelled/rival holders and foreign asset identity without mutating input',()=>{
  const {state,next}=restart();makeSave(next)
  const active=next.technology.adoptions.find(a=>a.stageFacilityId==='facility-soundstage-12'&&a.cancelledWeek===null)!
  const old=state.technology.adoptions.find(a=>a.stageFacilityId==='facility-soundstage-07')!
  const rivalHolder=state.technology.adoptions.find(a=>a.studioId!==state.hollywood!.playerStudioId)!
  expect(rivalHolder).toBeDefined()
  for(const holder of [null,'missing-holder',old.id,rivalHolder.id]) {
   const mutant=JSON.parse(stableStringify(next))
   mutant.technology.equipment.find((e:{id:string})=>e.id===active.equipmentAssetId).holderAdoptionId=holder
   const before=stableStringify(mutant)
   expect(()=>makeSave(mutant)).toThrow(/equipment asset (is held by another adoption|is still held by a cancelled adoption)/)
   expect(stableStringify(mutant)).toBe(before)
  }
  for(const [field,value] of [['studioId',rivalHolder.studioId],['technologyId','synchronized-sound']] as const) {
   const mutant=JSON.parse(stableStringify(next))
   mutant.technology.equipment.find((e:{id:string})=>e.id===active.equipmentAssetId)[field]=value
   expect(()=>makeSave(mutant)).toThrow('adoption names an unknown equipment asset')
  }
  const history=JSON.parse(stableStringify(next))
  history.technology.adoptions.find((a:{id:string})=>a.id===old.id).cancelledWeek=old.committedWeek-1
  expect(()=>makeSave(history)).toThrow(/cancelled|cancell|life/)
  const receipt=JSON.parse(stableStringify(next))
  receipt.placement.facilities.find((p:{projectId:string})=>p.projectId===old.physicalProjectIds[0]).cancellation=null
  expect(()=>makeSave(receipt)).toThrow(/cancell|receipt/)
  const duplicate=JSON.parse(stableStringify(next))
  duplicate.technology.adoptions.push({...active})
  expect(()=>makeSave(duplicate)).toThrow('duplicate adoption')
 })
})
