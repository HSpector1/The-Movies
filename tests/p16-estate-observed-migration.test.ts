// Original48 capture migration controls; no ticks, retagging, injected finance or historical edits.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { convertV48ToV49, convertV49ToV48, convertV50ToV49, convertV51ToV50, exportSave, makeSave, stableStringify, validateSaveP15B } from '../src/core/save.js'
import { estateBidRefusal, submitEstateBid } from '../src/core/estate.js'
import { currentHolder } from '../src/core/rights.js'
import { permittedBidderRefusal } from '../src/core/rightsFinance.js'
const R04='studio-aca408ec-r04'
const pins={
  closed:{week:163,file:'r04-actual163.save48.json',sha:'c17b7aa82bd09e6988867e149ed0266803d8e432cfcd8842d9c2aca1f7ace8ad'},
  archived:{week:176,file:'r04-archived176.save48.json',sha:'94fa74dfda8ee4df049e81d6ec0a1b3d61e3eddf8030c8fd623a0d44f6e493de'},
} as const
function capture(kind:keyof typeof pins) {
  const directory=process.env.P16_ORIGINAL48_CAPTURE_ROOT
  expect(directory,'bind exact original48 capture directory and freeze both files/manifest').toBeTruthy()
  const pin=pins[kind],bytes=readFileSync(directory+'/'+pin.file),text=bytes.toString()
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(pin.sha)
  const raw=JSON.parse(text),before=stableStringify(raw),old=validateSaveP15B(raw)
  expect(old.saveVersion).toBe(48);expect(old.state.market.tick).toBe(pin.week)
  expect(stableStringify(raw)).toBe(before)
  const next=convertV48ToV49(old)
  expect(stableStringify(old)).toBe(before);makeSave(next.state)
  const closure=old.state.studioClosure.closures.find(c=>c.studioId===R04)!
  expect(closure).toBeDefined();expect(closure.closureWeek).toBe(163)
  const estate=next.state.rights.estates.find(e=>e.closureId===closure.closureId)!
  expect(estate,'observed48 producer prerequisite').toBeDefined()
  return {old,next,closure,estate,before,text}
}
function preserved(value:ReturnType<typeof capture>) {
  const {old,next,before}=value
  expect(stableStringify(next.state.studioClosure)).toBe(stableStringify(old.state.studioClosure))
  expect(stableStringify(next.state.corporateCondition)).toBe(stableStringify(old.state.corporateCondition))
  expect(stableStringify(next.state.campaignLegacy)).toBe(stableStringify(old.state.campaignLegacy))
  expect(next.state.rights.titleEvents).toEqual([]);expect(next.state.rights.transactions).toEqual([])
  expect(value.estate.proceeds).toEqual([]);expect(value.estate.bids).toEqual([])
  expect(stableStringify(old)).toBe(before)
}
describe('P16 observed original48 migration retains terminal authority without new history',()=>{
 it('C163 and archivedD176 retain complete closure claim loan run archive roots and same-boundary lossless roundtrip',()=>{
  for(const kind of ['closed','archived'] as const) {
   const value=capture(kind);preserved(value)
   const {old,next,closure,estate}=value
   expect(old.state.studioClosure.claims.filter(c=>c.closureId===closure.closureId)).toHaveLength(6)
   expect(closure.loan!.remainder).toBeGreaterThan(0)
   expect(estate).toMatchObject({closureWeek:163,opensWeek:163,closesWeek:176,closedWeek:kind==='archived'?176:null})
   const current=stableStringify(next)
   expect(exportSave(convertV49ToV48(next))).toBe(value.text)
   expect(stableStringify(next)).toBe(current);expect(stableStringify(old)).toBe(value.before)
  }
 })
 it('archived176 observes one original archival, never reopens bidding, and retains nontradeable film ownership',()=>{
  const value=capture('archived');preserved(value)
  const {old,next,closure,estate}=value
  const archives=old.state.studioClosure.estateEvents.filter(e=>e.closureId===closure.closureId&&e.kind==='archival')
  expect(archives).toHaveLength(1);expect(archives[0]!.week).toBe(176)
  expect(estate).toMatchObject({origin:{kind:'observed48',observedAtWeek:176,closureId:closure.closureId,closureSequence:closure.p15DomainSequence,archivalEventId:archives[0]!.eventId,classification:'observedCurrent'}})
  expect(estate.lots.every(l=>l.status==='archived')).toBe(true);expect(estate.pending.every(p=>p.status==='archived')).toBe(true)
  const lot=estate.lots[0]!;expect(lot).toBeDefined();expect(lot.subjects.length).toBeGreaterThan(0)
  const input={estateId:estate.estateId,lotId:lot.lotId,bidderId:next.state.hollywood!.playerStudioId,amount:lot.minimumBid}
  const before=stableStringify(next.state)
  expect(estateBidRefusal(next.state,input,176)).toBe('estateClosed')
  expect(()=>submitEstateBid(next.state,input,176)).toThrow(/estateClosed/)
  for(const film of closure.estate.lots) expect(currentHolder(next.state,{right:'R2',filmId:film.subjectId},176)).toMatchObject({kind:'holder',tradeable:false,archived:true})
  expect(stableStringify(next.state)).toBe(before)
 })
 it('a real new public bid is admitted current authority and blocks discard of an otherwise reconstructable live observation',()=>{
  const {next,estate}=capture('closed'),state=next.state,bidderId=state.hollywood!.playerStudioId,lot=estate.lots[0]!
  expect(lot,'fixed first lot prerequisite; no search or fabricated bidder').toBeDefined()
  expect(permittedBidderRefusal(state,bidderId,163)).toBeNull()
  const input={estateId:estate.estateId,lotId:lot.lotId,bidderId,amount:Math.max(1,lot.minimumBid)}
  const before=stableStringify(state)
  expect(estateBidRefusal(state,input,163)).toBeNull()
  const result=submitEstateBid(state,input,163);expect(result.bid.status).toBe('sealed')
  expect(stableStringify(state)).toBe(before)
  const saved=makeSave(result.state),savedBefore=stableStringify(saved)
  // P17 (Save50): `saved` is live; the P16 step's downgrade is entered through the P17 step (no franchise: version only)
  expect(()=>convertV49ToV48(convertV50ToV49(convertV51ToV50(saved)))).toThrow(/cannot discard changed estate observation or bid authority/)
  expect(stableStringify(saved)).toBe(savedBefore)
 })
 it('frozen48 reader refuses the added current rights root without retagging a49 envelope',()=>{
  const {old,next,before}=capture('closed')
  const mutant={...old,state:{...old.state,rights:next.state.rights}},mutantBefore=stableStringify(mutant)
  expect(mutant.saveVersion).toBe(48)
  expect(()=>validateSaveP15B(mutant)).toThrow(/rights|unknown field|exact keys/i)
  expect(stableStringify(mutant)).toBe(mutantBefore);expect(stableStringify(old)).toBe(before)
 })
})
