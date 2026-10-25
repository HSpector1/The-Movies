// UNRUN accepted original48 R03 capture continuation; original condition/finance fixture is disclosed.
// This is not natural survival or an invented active run. All setup belongs to each default5s leaf.
import {describe,it,expect} from 'vitest'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import * as saves from '../src/core/save.js'
import {tick} from '../src/core/tick.js'
import type {GameState} from '../src/core/types.js'
const TARGET='studio-aca408ec-r03',FILM=TARGET+':film:13'
const PINS={132:'6c2d21b44b718bf33c9c8f019c0d737f59cd02a53573f4a31c29c0b21d6b0f25',134:'677b0615a7a0a7e54bd6865c6f526d0f7b773d7c28d77ff739c6deca33a9653a',144:'c4d319f62d97c9e667fbca2dee8cf87fa21f7a9169192ed7ed1bed9dac40e89b'} as const
function original(week:keyof typeof PINS) {
 const root=process.env.P16_ORIGINAL48_R03_CAPTURE_ROOT;expect(root).toBeTruthy()
 const manifest=readFileSync(root+'/CAPTURE-MANIFEST.json')
 expect(createHash('sha256').update(manifest).digest('hex')).toBe('feb38e3397da84f3e3353207fdc58e339ed98708476968083089cba73e270a2e')
 const bytes=readFileSync(root+'/r03-week'+week+'.save48.json')
 expect(createHash('sha256').update(bytes).digest('hex')).toBe(PINS[week])
 const raw=JSON.parse(bytes.toString()),before=JSON.stringify(raw),old=saves.validateSaveP15B(raw)
 expect(old.saveVersion).toBe(48);expect(old.state.market.tick).toBe(week)
 return {old,before,raw}
}
function prepared(week:132|134) {
 const source=original(week),current=saves.convertV48ToV49(source.old).state
 expect(JSON.stringify(source.raw)).toBe(source.before)
 const closure=current.studioClosure.closures.find(c=>c.studioId===TARGET)!
 expect(closure).toMatchObject({closureWeek:131,estate:{opensWeek:131,closesWeek:144}})
 expect(current.studioClosure.claims.filter(c=>c.closureId===closure.closureId)).toHaveLength(6)
 expect(current.studioClosure.claims.filter(c=>c.closureId===closure.closureId).reduce((n,c)=>n+c.paid,0)).toBeGreaterThan(0)
 return {...source,current,closure}
}
function business(state:Pick<GameState,'hollywood'>) {return state.hollywood!.businesses.find(b=>b.studioId===TARGET)!}
function advance(state:GameState) {
 const before=JSON.stringify(state),next=tick(state) // exact original forgedEstateRoute/ticksTo default options
 expect(JSON.stringify(state)).toBe(before);expect(next.market.tick).toBe(state.market.tick+1)
 return next
}
function claimsAndCash(before:GameState,after:GameState,closureId:string) {
 const old=before.studioClosure.claims.filter(c=>c.closureId===closureId)
 const claims=after.studioClosure.claims.filter(c=>c.closureId===closureId)
 const added=after.studioClosure.estateEvents.filter(e=>e.closureId===closureId&&e.week===after.market.tick)
 const receipts=added.filter(e=>e.kind==='runReceipt'),distributions=added.filter(e=>e.kind==='distribution')
 const income=receipts.reduce((n,e)=>n+e.amount,0),paid=distributions.reduce((n,e)=>n+e.amount,0)
 expect(business(after).account.cash).toBeCloseTo(business(before).account.cash+income-paid,6)
 expect(business(after).account.periods.reduce((n,p)=>n+p.movements.claimPayment,0))
  .toBe(business(before).account.periods.reduce((n,p)=>n+p.movements.claimPayment,0)-paid)
 let available=Math.floor(Math.max(0,business(before).account.cash+income))
 for(const c of [...old].sort((a,b)=>a.sourceContractId.localeCompare(b.sourceContractId)||a.claimId.localeCompare(b.claimId))) {
  const actual=claims.find(n=>n.claimId===c.claimId)!,amount=Math.min(available,c.unpaid);available-=amount
  expect(actual.paid).toBe(c.paid+amount);expect(actual.unpaid).toBe(c.unpaid-amount)
  expect(actual.original).toBe(actual.paid+actual.unpaid)
  const payments=actual.payments.filter(p=>p.week===after.market.tick)
  expect(payments.reduce((n,p)=>n+p.amount,0)).toBe(amount)
  for(const payment of payments)expect(distributions.some(e=>e.eventId===payment.reference)).toBe(true)
 }
 expect(new Set(after.studioClosure.estateEvents.map(e=>e.eventId)).size).toBe(after.studioClosure.estateEvents.length)
 expect(new Set(after.studioClosure.estateEvents.filter(e=>e.closureId===closureId&&e.kind==='runReceipt').map(e=>e.reference)).size)
  .toBe(after.studioClosure.estateEvents.filter(e=>e.closureId===closureId&&e.kind==='runReceipt').length)
 return {receipts,paid}
}
describe('P16 retained original48 active estate run continues under current49',()=>{
 it('actual132 active run settles133 with estate beneficiary, contract-priority payments and fractional cash conservation through134 replay',()=>{
  const p=prepared(132),sourceBefore=JSON.stringify(p.current)
  const run=business(p.current).runs.find(r=>r.productionId===FILM)!
  expect(run).toBeDefined();expect(run).toMatchObject({releaseTick:128,totalWeeks:6,weekIndex:4})
  const inherited=p.current.studioClosure.estateEvents.filter(e=>e.closureId===p.closure.closureId&&e.kind==='runReceipt')
  expect(inherited).toHaveLength(1);expect(inherited[0]).toMatchObject({week:132,amount:360007.48047857336,reference:FILM+':due:131',studioId:TARGET})
  const next=advance(p.current),accounting=claimsAndCash(p.current,next,p.closure.closureId)
  expect(accounting.receipts).toHaveLength(1)
  expect(accounting.receipts[0]).toMatchObject({week:133,reference:FILM+':due:132',studioId:TARGET,phaseOrderVersion:3})
  expect(accounting.receipts[0]!.amount).toBeCloseTo(run.weeklyGross[4]!*run.studioShare,6)
  expect(accounting.paid).toBeGreaterThan(0)
  const film=next.hollywood!.films.find(f=>f.filmId===FILM)!
  expect(film.provenance).toBe('simulation/v1');expect('settledWeek' in film&&film.settledWeek).toBeNull()
  expect(business(next).runs.find(r=>r.productionId===FILM)).toMatchObject({weekIndex:5,totalWeeks:6})
  expect(next.studioClosure.closures.find(c=>c.closureId===p.closure.closureId)).toEqual(p.closure)
  const text=saves.exportCurrentState(next),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reload)).toBe(text)
  const observed=advance(next),replay=advance(reload);claimsAndCash(next,observed,p.closure.closureId)
  expect(saves.exportCurrentState(replay)).toBe(saves.exportCurrentState(observed))
  expect(observed.market.tick).toBe(134)
  const settled=observed.hollywood!.films.find(f=>f.filmId===FILM)!
  expect(settled.provenance).toBe('simulation/v1');expect('settledWeek' in settled&&settled.settledWeek).toBe(133)
  expect(business(observed).runs.some(r=>r.productionId===FILM)).toBe(false)
  expect(observed.hollywood!.receipts.filter(r=>r.kind==='filmSettled'&&r.productionId===FILM)).toMatchObject([{week:133,studioId:TARGET}])
  expect(observed.studioClosure.estateEvents.filter(e=>e.closureId===p.closure.closureId&&e.kind==='runReceipt'&&e.week===134)).toMatchObject([{reference:FILM+':due:133',amount:run.weeklyGross[5]!*run.studioShare}])

  const old134=original(134)
  expect(business(observed).account.cash).toBeCloseTo(business(old134.old.state).account.cash,6)
  expect(observed.studioClosure.claims.filter(c=>c.closureId===p.closure.closureId).map(c=>({id:c.claimId,paid:c.paid,unpaid:c.unpaid})))
   .toEqual(old134.old.state.studioClosure.claims.filter(c=>c.closureId===p.closure.closureId).map(c=>({id:c.claimId,paid:c.paid,unpaid:c.unpaid})))
  expect(JSON.stringify(p.current)).toBe(sourceBefore);expect(JSON.stringify(p.raw)).toBe(p.before)
 })
 it('actual134 continuation reaches one144 archival without duplicate run money and full reader rejects changed beneficiary receipt and claim payment',()=>{
  const p=prepared(134),before=JSON.stringify(p.current);let state=p.current
  for(let week=135;week<=144;week++) {const next=advance(state);claimsAndCash(state,next,p.closure.closureId);state=next}
  const archives=state.studioClosure.estateEvents.filter(e=>e.closureId===p.closure.closureId&&e.kind==='archival')
  expect(archives).toHaveLength(1);expect(archives[0]).toMatchObject({week:144,amount:0,reference:p.closure.closureId,studioId:TARGET,phaseOrderVersion:3})
  expect(state.studioClosure.estateEvents.filter(e=>e.closureId===p.closure.closureId&&e.kind==='runReceipt')).toEqual(p.current.studioClosure.estateEvents.filter(e=>e.closureId===p.closure.closureId&&e.kind==='runReceipt'))
  const reference=original(144)
  expect(business(state).account.cash).toBeCloseTo(business(reference.old.state).account.cash,6)
  const text=saves.exportCurrentState(state),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reload)).toBe(text)
  const refuse=(change:(s:GameState)=>void)=>{
   const saved=JSON.parse(text);change(saved.state);const bytes=JSON.stringify(saved)
   try {expect(()=>saves.validateSaveV49(saved)).toThrow(/closure|estate|claim|studio/i)}
   finally {expect(JSON.stringify(saved)).toBe(bytes)}
  }
  refuse(s=>{s.studioClosure.estateEvents.find(e=>e.closureId===p.closure.closureId&&e.kind==='runReceipt')!.studioId=s.hollywood!.playerStudioId})
  refuse(s=>{s.studioClosure.estateEvents.find(e=>e.closureId===p.closure.closureId&&e.kind==='runReceipt')!.amount+=0.01})
  refuse(s=>{s.studioClosure.claims.find(c=>c.closureId===p.closure.closureId&&c.payments.length>0)!.payments[0]!.amount++})
  expect(JSON.stringify(p.current)).toBe(before);expect(JSON.stringify(p.raw)).toBe(p.before)
 })
})
