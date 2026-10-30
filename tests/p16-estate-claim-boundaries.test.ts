// UNRUN three predeclared money-boundary transactions on the SAME accepted R04 route/lot.
// Source-derived whole bids, not a search, tuning, edited cash or new historical fixture. Default5s.
import {describe,it,expect} from 'vitest'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import * as saves from '../src/core/save.js'
import {tick} from '../src/core/tick.js'
import {applyActions} from '../src/core/actions.js'
import {conditionRecord,outstandingLoan} from '../src/core/corporateConditionLive.js'
import {estateBidRefusal} from '../src/core/estate.js'
import {spendableCash,postPurchaseReserve} from '../src/core/rightsFinance.js'
const TARGET='studio-aca408ec-r04',FILM=TARGET+':film:0'
function boundary(policy:'negative'|'equal'|'excess') {
 const path=process.env.P16_JOIN_PREC48_PATH;expect(path).toBeTruthy()
 const bytes=readFileSync(path!);expect(createHash('sha256').update(bytes).digest('hex')).toBe('cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19')
 const raw=JSON.parse(bytes.toString()),rawBefore=JSON.stringify(raw),old=saves.validateSaveP15B(raw)
 expect(old.saveVersion).toBe(48);let state=saves.convertV48ToV49(old).state
 while(state.market.tick<175) {const before=JSON.stringify(state),prior=state;state=tick(prior);expect(JSON.stringify(prior)).toBe(before)}
 const source=saves.makeSave(state),player=state.hollywood!.playerStudioId
 const closure=state.studioClosure.closures.find(c=>c.studioId===TARGET)!
 expect(closure).toMatchObject({closureWeek:163,estate:{closesWeek:176}})
 expect(closure.loan!.remainder).toBeGreaterThan(0);expect(closure.dispositions.filter(d=>d.subjectKind==='theatricalRun')).toEqual([])
 const estate=state.rights.estates.find(e=>e.closureId===closure.closureId)!
 const lot=estate.lots.find(l=>l.subjects.length===1&&l.subjects[0]!.right==='R2'&&l.subjects[0]!.filmId===FILM)!
 expect(lot).toBeDefined();expect(lot.status).toBe('open');expect(lot.encumbrances).toEqual([])
 expect(conditionRecord(state,player)?.condition).toMatchObject({stage:'stable',week:175})
 expect(outstandingLoan(state,player,176)).toBeUndefined()
 const business=state.hollywood!.businesses.find(b=>b.studioId===TARGET)!
 const cash=business.account.cash;expect(cash).toBeLessThan(0)
 const claims=state.studioClosure.claims.filter(c=>c.closureId===closure.closureId).sort((a,b)=>a.sourceContractId<b.sourceContractId?-1:a.sourceContractId>b.sourceContractId?1:a.claimId<b.claimId?-1:a.claimId>b.claimId?1:0)
 expect(claims.length).toBeGreaterThan(0);expect(claims.every(c=>c.paid===0&&c.unpaid===c.original)).toBe(true)
 const unpaid=claims.reduce((n,c)=>n+c.unpaid,0)
 // ONE fixed formula per declared boundary; stop if not lawful/affordable, never lower it or choose another lot.
 const amount=policy==='negative'?Math.floor(-cash)-1:Math.ceil(-cash)+unpaid+(policy==='excess'?100000:0)
 expect(Number.isSafeInteger(amount)).toBe(true);expect(amount).toBeGreaterThanOrEqual(lot.minimumBid)
 const available=Math.floor(Math.max(0,cash+amount))
 expect(policy==='negative'?cash+amount<0:policy==='equal'?available===unpaid:available>unpaid).toBe(true)
 expect(spendableCash(state,player)-amount).toBeGreaterThanOrEqual(postPurchaseReserve(state,player))
 expect(estateBidRefusal(state,{estateId:estate.estateId,lotId:lot.lotId,bidderId:player,amount},175)).toBeNull()
 const stateBefore=JSON.stringify(state),bid=applyActions(state,[{kind:'submitEstateBid',estateId:estate.estateId,lotId:lot.lotId,amount}])
 expect(JSON.stringify(state)).toBe(stateBefore);const bidBefore=JSON.stringify(bid),final=tick(bid)
 expect(JSON.stringify(bid)).toBe(bidBefore)
 const events=final.studioClosure.estateEvents.filter(e=>e.closureId===closure.closureId&&e.week===176)
 const sale=events.filter(e=>e.kind==='saleReceipt'),distribution=events.filter(e=>e.kind==='distribution'),archive=events.filter(e=>e.kind==='archival')
 expect(sale).toHaveLength(1);expect(sale[0]!.amount).toBe(amount);expect(archive).toHaveLength(1)
 expect(events.filter(e=>e.kind==='runReceipt')).toEqual([])
 const paid=Math.min(available,unpaid)
 expect(distribution).toHaveLength(paid>0?1:0)
 expect(distribution.reduce((n,e)=>n+e.amount,0)).toBe(paid)
 let remaining=available
 for(const c of claims) {
  const expected=Math.min(remaining,c.unpaid);remaining-=expected
  const actual=final.studioClosure.claims.find(a=>a.claimId===c.claimId)!
  expect(actual.paid).toBe(expected);expect(actual.unpaid).toBe(c.original-expected)
  expect(actual.payments).toEqual(expected>0?[{week:176,amount:expected,reference:distribution[0]!.eventId}]:[])
  expect(actual.status).toBe(expected===c.original?'paid':expected===0?'unpaidArchived':'partiallyPaid')
 }
 const target=final.hollywood!.businesses.find(b=>b.studioId===TARGET)!
 expect(target.account.cash).toBeCloseTo(cash+amount-paid,6)
 expect(final.studioClosure.closures.find(c=>c.closureId===closure.closureId)).toEqual(closure)
 expect(final.corporateCondition.loans.filter(l=>l.studioId===TARGET)).toEqual(state.corporateCondition.loans.filter(l=>l.studioId===TARGET))
 expect(final.rights.estates.find(e=>e.estateId===estate.estateId)!.closedWeek).toBe(176)
 const tx=final.rights.transactions.filter(t=>t.kind==='estateSale'&&t.estateId===estate.estateId)
 expect(tx).toHaveLength(1);expect(tx[0]).toMatchObject({amount,payerId:player,payeeId:null})
 expect(sale[0]!.reference).toBe(tx[0]!.id)
 const text=saves.exportCurrentState(final),reload=saves.migrateToLive(saves.importSave(text)).state
 expect(saves.exportCurrentState(reload)).toBe(text)
 expect(JSON.stringify(raw)).toBe(rawBefore);expect(JSON.stringify(source.state)).toBe(stateBefore)
}
describe('P16 real estate cash and claim-payment boundaries on fixed R04 lot',()=>{
 it('negative cash after a real sale pays zero claims and never invents a negative-cash creditor',()=>{boundary('negative')})
 it('whole distributable cash equal to retained claims pays exactly all claims and retains fractional residual',()=>{boundary('equal')})
 it('actual excess sale cash caps every claim at original and leaves the excess in the retained estate account',()=>{boundary('excess')})
})
