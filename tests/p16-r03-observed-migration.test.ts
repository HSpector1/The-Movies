// Disclosed original48 R03 transaction captures; no ticks or constructed historical edits.
import { expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { convertFromP15BSave, convertV48ToV49, convertV49ToV48, exportSave, makeSave, migrateToV45, migrateToV46, migrateToV47, stableStringify, validateSaveP15B } from '../src/core/save.js'
const studioId='studio-aca408ec-r03',filmId=studioId+':film:13'
const pins={132:'6c2d21b44b718bf33c9c8f019c0d737f59cd02a53573f4a31c29c0b21d6b0f25',134:'677b0615a7a0a7e54bd6865c6f526d0f7b773d7c28d77ff739c6deca33a9653a',144:'c4d319f62d97c9e667fbca2dee8cf87fa21f7a9169192ed7ed1bed9dac40e89b'} as const
function capture(week:keyof typeof pins) {
 const root=process.env.P16_ORIGINAL48_R03_CAPTURE_ROOT
 expect(root,'parent must qualify capture recorder98 incident and bind exact directory/manifest').toBeTruthy()
 const bytes=readFileSync(root+'/r03-week'+week+'.save48.json'),text=bytes.toString()
 expect(createHash('sha256').update(bytes).digest('hex')).toBe(pins[week])
 const raw=JSON.parse(text),before=stableStringify(raw),old=validateSaveP15B(raw)
 expect(old.saveVersion).toBe(48);expect(old.state.market.tick).toBe(week);expect(stableStringify(raw)).toBe(before)
 const next=convertV48ToV49(old);makeSave(next.state)
 expect(stableStringify(old)).toBe(before)
 const closure=old.state.studioClosure.closures.find(c=>c.studioId===studioId)!
 expect(closure).toBeDefined();expect(closure.closureWeek).toBe(131)
 const estate=next.state.rights.estates.find(e=>e.closureId===closure.closureId)!
 expect(estate).toBeDefined()
 const business=old.state.hollywood!.businesses.find(b=>b.studioId===studioId)!
 const currentBusiness=next.state.hollywood!.businesses.find(b=>b.studioId===studioId)!
 return {old,next,closure,estate,business,currentBusiness,before,text,week}
}
function preserved(v:ReturnType<typeof capture>) {
 for(const key of ['studioClosure','corporateCondition','campaignLegacy'] as const)
  expect(stableStringify(v.next.state[key])).toBe(stableStringify(v.old.state[key]))
 expect(v.currentBusiness.runs).toEqual(v.business.runs)
 expect(v.currentBusiness.account.periods.map(p=>({claimPayment:p.movements.claimPayment,loanPrincipal:p.movements.loanPrincipal,loanInstallment:p.movements.loanInstallment}))).toEqual(v.business.account.periods.map(p=>({claimPayment:p.movements.claimPayment,loanPrincipal:p.movements.loanPrincipal,loanInstallment:p.movements.loanInstallment})))
 expect(v.next.state.rights.titleEvents).toEqual([]);expect(v.next.state.rights.transactions).toEqual([])
 expect(v.estate.proceeds).toEqual([]);expect(v.estate.bids).toEqual([])
 const current=stableStringify(v.next)
 expect(exportSave(convertV49ToV48(v.next))).toBe(v.text)
 expect(stableStringify(v.next)).toBe(current);expect(stableStringify(v.old)).toBe(v.before)
}
it('observed original48 R03 week132 preserves nonzero claimPayment and the authentic active run through public49 migration and same-boundary downgrade',()=>{
 const v=capture(132)
 expect(v.business.account.periods.reduce((n,p)=>n+p.movements.claimPayment,0)).toBe(-60006)
 // This capture has no borrowing; compare zeros, do not claim nonzero loan continuity.
 expect(v.business.account.periods.reduce((n,p)=>n+p.movements.loanPrincipal,0)).toBe(0)
 expect(v.business.account.periods.reduce((n,p)=>n+p.movements.loanInstallment,0)).toBe(0)
 const run=v.business.runs.find(r=>r.productionId===filmId)!
 expect(run).toBeDefined();expect(run.releaseTick).toBe(128);expect(run.totalWeeks).toBe(6)
 const receipt=v.old.state.studioClosure.estateEvents.filter(e=>e.closureId===v.closure.closureId&&e.kind==='runReceipt'&&e.week===132)
 expect(receipt).toHaveLength(1);expect(receipt[0]!.reference).toBe(filmId+':due:131');expect(receipt[0]!.amount).toBeGreaterThan(0)
 const distribution=v.old.state.studioClosure.estateEvents.filter(e=>e.closureId===v.closure.closureId&&e.kind==='distribution'&&e.week===132)
 expect(distribution).toHaveLength(1);expect(distribution[0]!.amount).toBe(60006)
 const payments=v.old.state.studioClosure.claims.filter(c=>c.closureId===v.closure.closureId).flatMap(c=>c.payments.filter(p=>p.week===132))
 expect(payments.length).toBeGreaterThan(0);expect(payments.reduce((n,p)=>n+p.amount,0)).toBe(60006)
 expect(payments.every(p=>p.reference===distribution[0]!.eventId)).toBe(true)
 expect(v.estate.closedWeek).toBeNull();preserved(v)
})
it('observed original48 R03 settled134 and archived144 preserve earned payments and one original archival without inventing past49 history',()=>{
 for(const week of [134,144] as const) {
  const v=capture(week)
  expect(v.business.runs.some(r=>r.productionId===filmId)).toBe(false)
  const film=v.old.state.hollywood!.films.find(f=>f.filmId===filmId)!
  expect('settledWeek' in film&&film.settledWeek).toBe(133)
  expect(v.business.account.periods.reduce((n,p)=>n+p.movements.claimPayment,0)).toBe(-488226)
  const archives=v.old.state.studioClosure.estateEvents.filter(e=>e.closureId===v.closure.closureId&&e.kind==='archival')
  expect(archives).toHaveLength(week===144?1:0)
  if(week===144)expect(archives[0]!.week).toBe(144)
  expect(v.estate.closedWeek).toBe(week===144?144:null);preserved(v)
  if(week===144) {
   // Original p15b2 condition-root-downgrade + stacked-step-save48, and p15b4
   // closure-root-downgrade-refusals: unchanged historical48 reaches the real step.
   // This disclosed transaction capture is not a natural-campaign or player-ledger witness.
   const state=v.old.state
   expect([state.corporateCondition.studios.length,state.corporateCondition.events.length,state.corporateCondition.loans.length]).toEqual([5,6,1])
   expect([state.studioClosure.closures.length,state.studioClosure.claims.length,state.studioClosure.estateEvents.length]).toEqual([1,6,7])
   expect(state.hollywood!.businesses.flatMap(b=>b.account.periods.flatMap(p=>
    (['loanPrincipal','loanInstallment','claimPayment'] as const).filter(kind=>p.movements[kind]!==0)
     .map(kind=>[b.studioId,kind,p.movements[kind]])))).toEqual([
      [studioId,'claimPayment',-488226],
      ['studio-aca408ec-r04','loanPrincipal',3198000],
      ['studio-aca408ec-r04','loanInstallment',-137760],
     ])
   const expected='migrateToV47: '+[
    'cannot downgrade or discard a corporateCondition record (5 evaluated)',
    'cannot downgrade or discard a corporateCondition event (6 recorded)',
    'cannot downgrade or discard a studio loan (1 contracted)',
    'cannot downgrade or discard an actual studio closure (1 recorded)',
    'cannot downgrade or discard a closure claim (6 recorded)',
    'cannot downgrade or discard an estate event (7 recorded)',
    'cannot downgrade or discard the claimPayment movement of studio-aca408ec-r03',
    'cannot downgrade or discard the loanPrincipal movement of studio-aca408ec-r04',
    'cannot downgrade or discard the loanInstallment movement of studio-aca408ec-r04',
    'cannot downgrade or discard recovery authority: costCutting.since, facilityDemolitionRefund, facilityDisposed',
    'cannot downgrade or discard a recorded Power Ranking quarter',
   ].join('; ')
   for(const downgrade of [convertFromP15BSave,migrateToV47,migrateToV46,migrateToV45]) {
    expect(()=>downgrade(v.old)).toThrowError(new Error(expected))
    expect(stableStringify(v.old)).toBe(v.before)
   }
  }
 }
})
