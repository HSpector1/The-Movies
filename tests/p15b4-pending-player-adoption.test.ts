// Proposed NEW tests/p15b4-pending-player-adoption.test.ts; original core5s default unchanged.
// Supplemental real public-policy witness; original joint-family RED remains untouched.
import { it, expect } from 'vitest'
import { assertPendingPlayerAdoptionFamily } from './helpers/p15b-pending-family-assertions.js'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'
import { applyActions, tick, makeSave, migrateToLive, stableStringify, TUNING } from '../src/core/index.js'
import { validateSaveV26 } from '../src/core/save.js'
import { conditionRecord, conditionFacts, outstandingLoan } from '../src/core/corporateConditionLive.js'
import { loanMaxPrincipal } from '../src/core/studioLoan.js'
import { adoptionQuote } from '../src/core/technologyAdoption.js'
import { queryPlacement, facilityDemolitionRefusal, facilityDemolitionRefund, blueprintById } from '../src/core/placement.js'
import { nextLaboratoryOrigin } from '../src/harness/p13b/fixtures.js'
it('real paid capital/refund/loan edge retains earned pending player adoption at actual closure',()=>{
 const gzip=readFileSync(new URL('./fixtures/p13b/legacy-v26-lighting-restored-795.json.gz',import.meta.url))
 expect(createHash('sha256').update(gzip).digest('hex')).toBe('47d266bccb7871450e089f886d4565c970e97ad1b0af54d297733b064416312f')
 const parsed=JSON.parse(gunzipSync(gzip).toString()),rawBefore=stableStringify(parsed)
 validateSaveV26(parsed);let s=migrateToLive(parsed).state;makeSave(s)
 expect(stableStringify(parsed)).toBe(rawBefore)
 const initial=s,initialBefore=stableStringify(initial),own=s.hollywood!.playerStudioId
 const request={technologyId:'lighting-control-01',stageFacilityId:'facility-soundstage-12'} as const
 const quote=adoptionQuote(s,request)
 expect(quote.ok).toBe(true);expect(quote.total).toBe(100000)
 const physical=quote.components.filter(c=>c.source==='physical').reduce((n,c)=>n+(c.weeks??0),0)
 expect(physical).toBe(4);expect(TUNING.CORPORATE_CLOSURE_DISTRESS_WEEKS).toBe(26)
 const duration=TUNING.CORPORATE_CLOSURE_DISTRESS_WEEKS-physical+1
 const action=(a:Parameters<typeof applyActions>[1][number])=>{
  const before=stableStringify(s),input=s,next=applyActions(s,[a]);makeSave(next)
  expect(stableStringify(input)).toBe(before);s=next
 }
 const placement={blueprintId:'research-laboratory',origin:nextLaboratoryOrigin(s)}
 const building=queryPlacement(s,placement)
 expect(building.ok).toBe(true);expect(building.cost).toBe(900000)
 const ids=new Set(s.placement.facilities.map(p=>p.id))
 action({kind:'placeFacility',placement})
 const lab=s.placement.facilities.find(p=>!ids.has(p.id))!
 expect(lab).toBeDefined()
 for(let i=0;i<105;i++) {
  const condition=conditionRecord(s,own)?.condition
  if(condition?.stage==='recovery'||s.studioClosure.closures.some(c=>c.studioId===own))throw new Error('fixed policy premise lost before commitment')
  if(condition?.stage==='distress'&&condition.distressWeeks>=duration)break
  s=tick(s)
 }
 expect(conditionRecord(s,own)?.condition.distressWeeks).toBe(duration);makeSave(s)
 expect(s.placement.facilities.find(p=>p.id===lab.id)!.status).toBe('operational')
 expect(facilityDemolitionRefusal(s,{placementId:lab.id})).toBeNull()
 const refund=facilityDemolitionRefund(blueprintById('research-laboratory')!)
 const preRefund=s.studio.cash;action({kind:'demolishFacility',demolition:{placementId:lab.id}})
 expect(s.studio.cash-preRefund).toBe(refund)
 const principal=Math.max(1000,Math.ceil((quote.total-s.studio.cash)/1000)*1000)
 expect(principal).toBeLessThanOrEqual(loanMaxPrincipal(conditionFacts(s,own).weeklyFixedCost))
 action({kind:'takeLoan',principal})
 const fresh=adoptionQuote(s,request);expect(fresh.ok).toBe(true);expect(fresh.components).toEqual(quote.components)
 const oldIds=new Set(s.technology.adoptions.map(a=>a.id)),oldRefunds=s.ledger.filter(e=>e.kind==='constructionRefund')
 const oldCancel=s.technology.adoptions.find(a=>a.stageFacilityId==='facility-soundstage-07')!
 action({kind:'adoptTechnology',...request})
 const adoption=s.technology.adoptions.find(a=>!oldIds.has(a.id))!,commit=s.market.tick
 expect(adoption).toBeDefined();expect(s.studio.cash).toBeGreaterThanOrEqual(0)
 const facts=conditionFacts(s,own);expect(facts.cash/(facts.weeklyFixedCost+facts.loanInstallment)).toBeLessThan(4)
 for(let i=0;i<physical;i++) {
  if(s.studioClosure.closures.some(c=>c.studioId===own))break
  expect(conditionRecord(s,own)?.condition.stage).not.toBe('recovery');s=tick(s)
 }
 const closed=s.studioClosure.closures.find(c=>c.studioId===own)!
 expect(closed).toBeDefined();expect(closed.closureWeek-commit).toBeLessThan(physical);makeSave(s)
 expect(s.technology.adoptions.find(a=>a.id===adoption.id)).toMatchObject({operationalWeek:null,cancelledWeek:null})
 expect(closed.dispositions.filter(d=>d.subjectKind==='adoption'&&d.subjectId===adoption.id)).toMatchObject([{status:'pending'}])
 expect(s.technology.adoptions.find(a=>a.id===oldCancel.id)).toEqual(oldCancel)
 expect(s.ledger.filter(e=>e.kind==='constructionRefund')).toEqual(oldRefunds)
 expect(s.technology.equipment.find(e=>e.id===adoption.equipmentAssetId)!.holderAdoptionId).toBe(adoption.id)
 expect(s.campaignLegacy.endOfRun).toMatchObject({closureId:closed.closureId,boundaryWeek:closed.closureWeek+1})
 expect(stableStringify(initial)).toBe(initialBefore);expect(stableStringify(parsed)).toBe(rawBefore)
 console.info('pending adoption public-policy financing only',{principal,refund,loan:outstandingLoan(s,own),installments:s.ledger.filter(e=>e.kind==='loanInstallment').reduce((n,e)=>n-e.amount,0)})
 assertPendingPlayerAdoptionFamily(s,adoption.id)
 // NO timeout argument: original core default5s is a qualification requirement.
})
