// One fixed public title sale before actual C; no seed/price fallback or authored historical state.
import { expect,it } from 'vitest'
import { performance } from 'node:perf_hooks'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { convertV48ToV49,validateSaveP15B,makeSave } from '../src/core/save.js'
import { applyActions } from '../src/core/actions.js'
import { tick } from '../src/core/tick.js'
import { offerRefusal,rivalWillingness } from '../src/core/assetSale.js'
import { subjectValueV1 } from '../src/core/propertyValuation.js'
import { TUNING } from '../src/core/tuning.js'
import { currentHolder,resolveTitles } from '../src/core/rights.js'
import { publicityOffer } from '../src/core/publicity.js'
const R04='studio-aca408ec-r04',filmId=R04+':film:0'
it('real purchased R04film0 survives four fixed public campaigns and joins actual buyer closure without changing creator history',()=>{
 const started=performance.now(),observations:{phase:string;week:number|null;milliseconds:number}[]=[]
 let last=started,actualClosureWeek:number|null=null,completed=false
 const mark=(phase:string,week:number|null)=>{const now=performance.now();observations.push({phase,week,milliseconds:now-last});last=now}
 try {
 const root=process.env.P16_ORIGINAL48_CAPTURE_ROOT;expect(root).toBeTruthy()
 function load(name:string,pin:string) {
  const bytes=readFileSync(root+'/'+name);expect(createHash('sha256').update(bytes).digest('hex')).toBe(pin)
  const raw=JSON.parse(bytes.toString()),before=JSON.stringify(raw),save=validateSaveP15B(raw)
  expect(save.saveVersion).toBe(48);expect(JSON.stringify(raw)).toBe(before);return save
 }
 const old=load('r04-pre162.save48.json','cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19'),oldBefore=JSON.stringify(old)
 const state=convertV48ToV49(old).state
 expect(state.market.tick).toBe(162)
 const player=state.hollywood!.playerStudioId,subject={right:'R2' as const,filmId}
 expect(currentHolder(state,subject,162)).toMatchObject({kind:'holder',holderId:R04,tradeable:true})
 const value=subjectValueV1(state,subject,162)
 expect(value.kind,'fixed subject valuation prerequisite').toBe('available')
 if(value.kind!=='available')throw new Error('fixed film0 valuation unavailable')
 const price=Math.max(1,Math.ceil(value.value*(100+TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)/100))
 const request={offerorId:player,counterpartyId:R04,direction:'buy' as const,instrument:{kind:'title' as const,subject},price}
 expect(rivalWillingness(state,request,162).willing).toBe(true)
 expect(offerRefusal(state,request,162),'actual bidder/reserve/clean title prerequisites; no fallback').toBeNull()
 const before=JSON.stringify(state),offered=applyActions(state,[{kind:'makeRightsOffer',offer:{counterpartyId:R04,direction:'buy',instrument:request.instrument,price}}])
 expect(JSON.stringify(state)).toBe(before);makeSave(offered)
 const input=JSON.stringify(offered),closed=tick(offered)
 expect(JSON.stringify(offered)).toBe(input)
 const txs=closed.rights.transactions.filter(t=>t.kind==='titleSale'&&t.subject?.right==='R2'&&t.subject.filmId===filmId)
 expect(txs).toHaveLength(1);expect(txs[0]).toMatchObject({week:163,payerId:player,payeeId:R04,amount:price})
 expect(currentHolder(closed,subject,163)).toMatchObject({kind:'holder',holderId:player})
 makeSave(closed)
 mark('actual-public-purchase-and-seller-C',closed.market.tick)
 let working=closed
 const schedule=[{week:163,tier:'blitz'},{week:169,tier:'push'},{week:175,tier:'whisper'},{week:181,tier:'push'}] as const
 for(const item of schedule) {
  while(working.market.tick<item.week) {
   expect(working.studioClosure.closures.some(c=>c.studioId===player),'no premature player terminal before fixed spend').toBe(false)
   const prior=working,priorBytes=JSON.stringify(prior);working=tick(prior);expect(JSON.stringify(prior)).toBe(priorBytes)
  }
  expect(working.market.tick).toBe(item.week)
  const quote=publicityOffer(working,item.tier)
  expect(quote.available,'fixed public campaign premise; no replacement tier or cash edits').toBe(true)
  const prior=working,priorBytes=JSON.stringify(prior)
  working=applyActions(prior,[{kind:'publicity',tier:item.tier}])
  expect(JSON.stringify(prior)).toBe(priorBytes);makeSave(working)
  expect(working.studio.cash).toBeCloseTo(prior.studio.cash-quote.cost,6)
  mark('ordinary-advance-and-public-'+item.tier,working.market.tick)
 }
 // Fixed no-extra-inflow budget: actual remaining cash/base overhead plus full distress window.
 // Any real earnings which prevent closure within it are an unmet premise, never edited away.
 const maxWeek=working.market.tick+Math.ceil(Math.max(0,working.studio.cash)/TUNING.OVERHEAD_BASE)+TUNING.CORPORATE_DISTRESS_SUSTAIN_WEEKS+TUNING.CORPORATE_CLOSURE_DISTRESS_WEEKS+2
 while(working.market.tick<maxWeek&&!working.studioClosure.closures.some(c=>c.studioId===player)) {
  const prior=working,priorBytes=JSON.stringify(prior);working=tick(prior);expect(JSON.stringify(prior)).toBe(priorBytes)
 }
 const buyerC=working.studioClosure.closures.find(c=>c.studioId===player)!
 expect(buyerC,'public fixed route must actually close within fixed overhead/distress bound; no expense/clock fallback').toBeDefined()
 actualClosureWeek=buyerC.closureWeek;mark('ordinary-advance-to-actual-buyer-C',working.market.tick)
 makeSave(working)
 expect(buyerC.estate.lots.filter(l=>l.subjectId===filmId)).toHaveLength(1)
 expect(buyerC.dispositions.filter(x=>x.subjectKind==='title'&&x.subjectId===filmId)).toHaveLength(1)
 const handoff=working.rights.estates.find(e=>e.closureId===buyerC.closureId)!
 expect(handoff).toBeDefined()
 expect(handoff.lots.flatMap(l=>l.subjects).concat(handoff.pending.map(p=>p.subject)).filter(s=>s.right==='R2'&&s.filmId===filmId)).toHaveLength(1)
 expect(resolveTitles(working).filmTitles.find(f=>f.filmId===filmId)!.creatorStudioId).toBe(R04)
 expect(working.studio.releasedFilms.some(f=>f.productionId===filmId)).toBe(false)
 expect(working.campaignLegacy.endOfRun).not.toBeNull()
 expect(working.campaignLegacy.endOfRun!.closureId).toBe(buyerC.closureId)
 expect(buyerC.endOfRun).toBe(working.campaignLegacy.endOfRun!.legacySnapshotId)
 const terminal=JSON.stringify(working)
 expect(()=>tick(working)).toThrow(/closed|ended|terminal/i)
 expect(JSON.stringify(working)).toBe(terminal);expect(JSON.stringify(offered)).toBe(input)
 expect(JSON.stringify(state)).toBe(before);expect(JSON.stringify(old)).toBe(oldBefore)
 completed=true;mark('full-terminal-owner-assertions-and-purity',buyerC.closureWeek)
 } finally {
  console.info(JSON.stringify({proof:'P16_BUYER_PUBLIC_PHASE_COST_DIAGNOSTIC',completed,actualClosureWeek,elapsedMs:performance.now()-started,observations,unfinishedPhaseMs:performance.now()-last,scope:'timings only; originaldefault5s remains binding; no segmentation qualification'}))
 }
})
