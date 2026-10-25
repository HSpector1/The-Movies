// F17 real bilateral age boundaries. Core default5s; no custom condition readers or retimed roots.
// Input is the exact already-qualified original publicSave48 pre162 capture, publicly migrated.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { acceptOffer, closingRefusal, makeOffer } from '../src/core/assetSale.js'
import { requestDiligence } from '../src/core/dueDiligence.js'
import { currentHolder, actualP16Money, type RightsOffer } from '../src/core/rights.js'
import { permittedBidderRefusal } from '../src/core/rightsFinance.js'
import { quoteAgeRefusal, quoteAgeVersionRefusal, QUOTE_AGE_POLICIES } from '../src/core/quoteAge.js'
import { convertV48ToV49, makeSave, stableStringify, validateSaveP15B } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'

const INPUT_SHA='cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19'
const R01='studio-aca408ec-r01', FILM=`${R01}:film:0`, PRICE=1000
const subject={right:'R2' as const,filmId:FILM}
let cached:GameState|undefined, cachedBytes:string|undefined
function source():GameState {
  if (cached===undefined) {
    const path=process.env.P16_JOIN_PREC48_PATH, supplied=process.env.P16_JOIN_PREC48_SHA256
    expect(path,'producer prerequisite: bind exact original48 pre162 input').toBeTruthy()
    expect(supplied,'input identity is literal, not any merely valid Save48').toBe(INPUT_SHA)
    const bytes=readFileSync(path!), raw=JSON.parse(bytes.toString())
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(INPUT_SHA)
    expect(raw.saveVersion).toBe(48);expect(raw.state.market.tick).toBe(162)
    const before=JSON.stringify(raw), old=validateSaveP15B(raw)
    const migrated=convertV48ToV49(old)
    expect(JSON.stringify(raw)).toBe(before)
    cached=migrated.state;pure(cached,()=>makeSave(cached!))
    expect(cached.market.tick).toBe(162)
    const h=cached.hollywood!
    const film=h.films.find(f=>f.filmId===FILM)
    expect(film,'real settled R01 subject prerequisite').toMatchObject({studioId:R01,provenance:'simulation/v1',settledWeek:16})
    expect(h.businesses.find(b=>b.studioId===R01)!.runs.some(r=>r.productionId===FILM)).toBe(false)
    expect(currentHolder(cached,subject,162)).toMatchObject({kind:'holder',holderId:R01,tradeable:true})
    expect(permittedBidderRefusal(cached,h.playerStudioId,162),'actual condition/loan/reserve owner, no STABLE adapter').toBeNull()
    cachedBytes=JSON.stringify(cached)
  }
  expect(JSON.stringify(cached)).toBe(cachedBytes)
  return cached
}
function pure<T>(state:GameState, action:()=>T):T {
  const before=JSON.stringify(state)
  try{return action()}finally{expect(JSON.stringify(state),'caller remains unchanged').toBe(before)}
}
function advance(state:GameState, count:number):GameState {
  let next=state
  for(let i=0;i<count;i++) {
    const prior=next;next=pure(prior,()=>tick(prior))
    expect(next.market.tick).toBe(prior.market.tick+1)
    expect(next.studioClosure.closures.some(c=>c.studioId===next.hollywood!.playerStudioId),'route prerequisite: player still operates').toBe(false)
  }
  pure(next,()=>makeSave(next))
  return next
}
function offered(state:GameState, disclosureId:string|null=null) {
  const player=state.hollywood!.playerStudioId
  const result=pure(state,()=>makeOffer(state,{offerorId:R01,counterpartyId:player,direction:'sell',
    instrument:{kind:'title',subject},price:PRICE,disclosureId},state.market.tick))
  expect(result.offer).toMatchObject({week:state.market.tick,quoteAgePolicyVersion:1,expiresWeek:state.market.tick+4,status:'open',disclosureId})
  pure(result.state,()=>makeSave(result.state))
  return result
}
function requireOffer(state:GameState,id:string):RightsOffer {
  const row=state.rights.offers.find(o=>o.id===id)
  expect(row,'the actual public producer row survives ordinary advancement').toBeDefined()
  return row!
}
function accepted(state:GameState,offer:RightsOffer):GameState {
  const player=state.hollywood!.playerStudioId, beforeCash=state.studio.cash
  const rivalBefore=state.hollywood!.businesses.find(b=>b.studioId===R01)!.account.cash
  pure(state,()=>expect(closingRefusal(state,offer,state.market.tick),'all real closing prerequisites').toBeNull())
  const next=pure(state,()=>acceptOffer(state,offer.id,player,state.market.tick))
  pure(next,()=>makeSave(next))
  const resolved=requireOffer(next,offer.id)
  expect(resolved).toMatchObject({status:'accepted',resolvedWeek:state.market.tick,quoteAgePolicyVersion:1})
  const tx=next.rights.transactions.find(t=>t.id===resolved.transactionId)
  expect(tx).toMatchObject({kind:'titleSale',week:state.market.tick,payerId:player,payeeId:R01,amount:PRICE,offerId:offer.id,subject})
  expect(tx!.titleEventIds).toHaveLength(1)
  expect(next.rights.titleEvents.find(e=>e.id===tx!.titleEventIds[0])).toMatchObject({cause:'sale',subject,
    priorHolder:R01,newHolder:player,date:{kind:'campaign',week:state.market.tick},source:{kind:'transaction',transactionId:tx!.id}})
  expect(currentHolder(next,subject,state.market.tick)).toMatchObject({kind:'holder',holderId:player})
  expect(next.studio.cash).toBe(beforeCash-PRICE)
  expect(next.hollywood!.businesses.find(b=>b.studioId===R01)!.account.cash).toBe(rivalBefore+PRICE)
  expect(next.ledger.filter(r=>r.kind==='rightsConsideration'&&r.note===tx!.id)).toEqual([
    {week:state.market.tick,kind:'rightsConsideration',amount:-PRICE,note:tx!.id}])
  expect(actualP16Money(next,R01).rightsConsideration-actualP16Money(state,R01).rightsConsideration).toBe(PRICE)
  expect(next.rights.transactions.filter(t=>t.offerId===offer.id)).toHaveLength(1)
  pure(next,()=>expect(()=>acceptOffer(next,offer.id,player,next.market.tick)).toThrow(/not open \(accepted\)/))
  expect(JSON.stringify(source())).toBe(cachedBytes)
  return next
}
function refusalPure(state:GameState, pattern:RegExp) {
  pure(state,()=>expect(()=>makeSave(state)).toThrow(pattern))
}
function mutate<T>(value:T):T{return JSON.parse(stableStringify(value))}

// These are real current-source transaction witnesses; each age derives only from ordinary ticks.
describe('F17 public bilateral quote-age boundaries from genuine pre162',()=>{
  it('accepts age0 with real title/cash/transaction once and caller purity',()=>{
    const {state,offer}=offered(source())
    expect(state.market.tick-offer.week).toBe(0)
    accepted(state,offer)
  })
  it('accepts age3 after ordinary advancement while the player-addressed sell offer stays open',()=>{
    const created=offered(source()), state=advance(created.state,3), offer=requireOffer(state,created.offer.id)
    expect(state.market.tick).toBe(165);expect(offer.status).toBe('open');expect(state.market.tick-offer.week).toBe(3)
    accepted(state,offer)
  })
  it('expires at age4 after ordinary advancement and refuses without any sale/payment',()=>{
    const created=offered(source()), state=advance(created.state,4), offer=requireOffer(state,created.offer.id)
    expect(state.market.tick).toBe(166);expect(state.market.tick-offer.week).toBe(4)
    expect(offer).toMatchObject({status:'expired',resolvedWeek:166,transactionId:null})
    expect(state.rights.transactions.some(t=>t.offerId===offer.id)).toBe(false)
    expect(currentHolder(state,subject,166)).toMatchObject({kind:'holder',holderId:R01})
    pure(state,()=>expect(()=>acceptOffer(state,offer.id,state.hollywood!.playerStudioId,166)).toThrow(/not open \(expired\)/))
    expect(actualP16Money(state,state.hollywood!.playerStudioId).rightsConsideration).toBe(actualP16Money(created.state,state.hollywood!.playerStudioId).rightsConsideration)
    expect(actualP16Money(state,R01).rightsConsideration).toBe(actualP16Money(created.state,R01).rightsConsideration)
    expect(JSON.stringify(source())).toBe(cachedBytes)
  })
  it('refuses unknown stamps, future quotes and accepted-age4 mutations after a real positive control',()=>{
    const made=offered(source()), positive=accepted(made.state,made.offer)
    const unknown=mutate(positive);requireOffer(unknown,made.offer.id).quoteAgePolicyVersion=99 as never
    refusalPure(unknown,/unknownQuoteAgePolicyVersion/)
    const future=mutate(made.state), futureOffer=requireOffer(future,made.offer.id)
    futureOffer.week=future.market.tick+1;futureOffer.expiresWeek=futureOffer.week+4
    pure(future,()=>expect(closingRefusal(future,futureOffer,future.market.tick)).toBe('futureQuote'))
    refusalPure(future,/quote|offer weeks/i)
    // HOSTILE one-field record mutation, not a producer or historical claim. Actual market advances first.
    const later=advance(positive,4), late=mutate(later)
    requireOffer(late,made.offer.id).resolvedWeek=166
    refusalPure(late,/accepted offer violates its quote age/)
  })
  it('accepts real disclosure age12 but refuses fresh offer age1 when that same disclosure becomes13',()=>{
    const base=source(), player=base.hollywood!.playerStudioId
    expect(permittedBidderRefusal(base,R01,162),'actual disclosure-recipient prerequisite').toBeNull()
    const bought=pure(base,()=>requestDiligence(base,{recipientId:R01,target:{kind:'studio',studioId:player},scope:['rights']},162))
    expect(bought.record).toMatchObject({recipientId:R01,week:162,staleFromWeek:175,quoteAgePolicyVersion:1})
    pure(bought.state,()=>makeSave(bought.state))
    const at12=advance(bought.state,12), made=offered(at12,bought.record.id)
    expect(made.state.market.tick-bought.record.week).toBe(12)
    const positive=accepted(made.state,made.offer)
    const at13=advance(made.state,1), open=requireOffer(at13,made.offer.id)
    expect(open.status).toBe('open');expect(at13.market.tick-open.week).toBe(1)
    expect(at13.market.tick-bought.record.week).toBe(13)
    pure(at13,()=>expect(closingRefusal(at13,open,175)).toBe('quoteTooOld'))
    pure(at13,()=>expect(()=>acceptOffer(at13,open.id,player,175)).toThrow(/quoteTooOld/))
    expect(at13.rights.transactions.some(t=>t.offerId===open.id)).toBe(false)
    // HOSTILE accepted-disclosure chronology mutant after a fully admitted real age12 acceptance.
    const acceptedLater=advance(positive,1), bad=mutate(acceptedLater)
    requireOffer(bad,made.offer.id).resolvedWeek=175
    refusalPure(bad,/accepted offer used a stale disclosure/)
  })
  it('admits explicitly constructed unstamped/zero legacy-shape rows without claiming historical capture',()=>{
    for (const stamp of [undefined,0] as const) {
      const made=offered(source()), shape=mutate(made.state), row=requireOffer(shape,made.offer.id)
      // Shape-only counterfactual: ONLY version metadata changes on a real offer; no time/cash/title history edits.
      if(stamp===undefined)delete row.quoteAgePolicyVersion;else row.quoteAgePolicyVersion=stamp
      const before=JSON.stringify(shape);pure(shape,()=>makeSave(shape))
      expect(JSON.stringify(shape)).toBe(before)
      pure(shape,()=>expect(closingRefusal(shape,row,162)).toBeNull())
      const result=pure(shape,()=>acceptOffer(shape,row.id,shape.hollywood!.playerStudioId,162));pure(result,()=>makeSave(result))
      expect(requireOffer(result,row.id).quoteAgePolicyVersion).toBe(stamp)
      expect(requireOffer(result,row.id).status).toBe('accepted')
    }
    expect(JSON.stringify(source())).toBe(cachedBytes)
  })
})

describe('F17 finite policy pure-unit boundaries (not campaign or absorption execution)',()=>{
  it('pins versioned minima/maxima and refuses invalid/future ages without subject-age substitution',()=>{
    expect(QUOTE_AGE_POLICIES[1]).toEqual({bilateralOffer:{min:0,max:3},disclosure:{min:0,max:12},absorptionPreview:{min:0,max:12},estateBid:{min:0,max:13}})
    expect(quoteAgeVersionRefusal(undefined)).toBeNull();expect(quoteAgeVersionRefusal(0)).toBeNull()
    expect(quoteAgeVersionRefusal(1)).toBeNull();expect(quoteAgeVersionRefusal(2)).toBe('unknownQuoteAgePolicyVersion')
    for(const version of [undefined,0,1]) {
      expect(quoteAgeRefusal('bilateralOffer',162,162,version)).toBeNull()
      expect(quoteAgeRefusal('bilateralOffer',162,165,version)).toBeNull()
      expect(quoteAgeRefusal('bilateralOffer',162,166,version)).toBe('quoteTooOld')
    }
    expect(quoteAgeRefusal('bilateralOffer',163,162,1)).toBe('futureQuote')
    expect(quoteAgeRefusal('bilateralOffer',NaN,162,1)).toBe('invalidQuoteWeeks')
    expect(quoteAgeRefusal('bilateralOffer',162,Infinity,1)).toBe('invalidQuoteWeeks')
    expect(quoteAgeRefusal('bilateralOffer',162.5,163,1)).toBe('invalidQuoteWeeks')
    expect(quoteAgeRefusal('disclosure',162,174,1)).toBeNull();expect(quoteAgeRefusal('disclosure',162,175,1)).toBe('quoteTooOld')
    expect(quoteAgeRefusal('absorptionPreview',162,174,1)).toBeNull();expect(quoteAgeRefusal('absorptionPreview',162,175,1)).toBe('quoteTooOld')
    expect(quoteAgeRefusal('estateBid',163,176,1)).toBeNull();expect(quoteAgeRefusal('estateBid',162,176,1)).toBe('quoteTooOld')
  })
})
