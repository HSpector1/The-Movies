import { expect, it } from 'vitest'
import { actualEstateOpening } from './helpers/p16-actual-estate.js'
import * as estateApi from '../src/core/estate.js'
import { stableStringify, makeSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { permittedBidderRefusal, spendableCash, postPurchaseReserve } from '../src/core/rightsFinance.js'
it('captures authentic closure authority and observes fixed bidder premises without altering history', () => {
 const actual=actualEstateOpening(),[input,handoff,week]=actual.boundary,before=stableStringify(input)
 expect(estateApi.estateHandoffRefusal(input,handoff,week)).toBeNull()
 const opened=estateApi.openEstate(...actual.boundary)
 expect(opened.estate).toEqual(actual.estate)
 expect(stableStringify(input)).toBe(before)
 makeSave(actual.state)
 console.info('C03_HANDOFF',JSON.stringify({week,claims:handoff.claimsContext,lots:handoff.lots,pending:handoff.pending}))
 let state=actual.state
 while(state.market.tick<actual.estate.closesWeek-1)state=tick(state)
 makeSave(state)
 console.info('C03_BIDDERS',JSON.stringify({week:state.market.tick,studios:state.hollywood!.identities.filter(i=>i.studioId===state.hollywood!.playerStudioId||state.hollywood!.businesses.some(b=>b.studioId===i.studioId)).map(i=>({id:i.studioId,row:i.row,refusal:permittedBidderRefusal(state,i.studioId,state.market.tick),cash:spendableCash(state,i.studioId),reserve:postPurchaseReserve(state,i.studioId)})),lots:state.rights.estates.find(e=>e.estateId===actual.estate.estateId)!.lots}))
})
