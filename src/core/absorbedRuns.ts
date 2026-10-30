import type { GameState, LedgerEntry } from './types.js'
import type { HollywoodState, RivalBusiness, LiveIndustryFilm } from './hollywoodTypes.js'
import { allocateRightsId, type AbsorptionRecord } from './rights.js'
import { openTheatricalRun } from './economy.js'

function fail(why:string):never {throw new Error(`absorption run: ${why}`)}
const exact=(x:object,keys:string[])=>Object.keys(x).sort().join()===keys.sort().join()
function canonical(film:LiveIndustryFilm) {
  return openTheatricalRun(film.result,film.result.boxOffice.opening,film.result.boxOffice.opening>0?film.result.boxOffice.total/film.result.boxOffice.opening:1,film.result.releaseTick)
}

/** Canonical foreign films whose future stream this buyer actually acquired before `week`.
 * Derive the set from original source releases and the close boundary, never from a supplied
 * handoff/receipt list. The full acquisition validator still proves every close and handoff.
 * Historical readers call this only with their current49 original title-state context. */
export function acquiredActiveRunFilms(state:GameState,buyerId:string,week:number):LiveIndustryFilm[] {
  if(!state.hollywood || !Array.isArray(state.rights?.absorptions))fail('missing acquired run ownership context')
  const result:LiveIndustryFilm[]=[]
  for(const a of state.rights.absorptions) {
    if(!a || typeof a.buyerId!=='string' || typeof a.targetId!=='string' || !Number.isSafeInteger(a.week))fail('malformed acquired run ownership context')
    if(a.buyerId!==buyerId || a.week>week)continue
    for(const film of state.hollywood.films) {
      if(film.provenance!=='simulation/v1' || film.studioId!==a.targetId)continue
      const run=canonical(film),release=film.result.releaseTick
      if(!Array.isArray(a.workReleases) || !Array.isArray(a.continuedProductions))fail('missing acquired continuation ownership context')
      const continued=a.workReleases.find(r=>r && r.productionId===film.filmId && r.week===release)
      const link=a.continuedProductions.find(r=>r && r.productionId===film.filmId && r.scriptProjectId===film.scriptProjectId)
      const assignedAtClose=release<=a.week && a.week<release+run.totalWeeks
      const assignedAtRelease=release>=a.week && continued!==undefined && link?.originalProduction?.id===film.filmId
      if((assignedAtClose || assignedAtRelease) && release<=week && week<release+run.totalWeeks)result.push(film)
    }
  }
  return result
}

type RivalRunRevenue={buyerId:string;week:number;amount:number;receiptId:string}

/** Real ordinary input-week servicing. Original creator/film/run and locked theatrical schedule stay
 * with their source; the actual absorption owns only the future cash beneficiary and new receipts. */
export function advanceAbsorbedRuns(state:GameState,h:HollywoodState,b:RivalBusiness,a:AbsorptionRecord,week:number):{rights:GameState['rights'];ledger:LedgerEntry[];rivalRevenue:RivalRunRevenue[]} {
  if(week!==state.market.tick || a.targetId!==b.studioId || week<a.week)fail('not the actual servicing boundary/beneficiary')
  if(a.buyerId!==h.playerStudioId && !h.businesses.some(buyer=>buyer.studioId===a.buyerId))fail('missing actual rival beneficiary')
  let rights=state.rights
  const ledger:LedgerEntry[]=[];const rivalRevenue:RivalRunRevenue[]=[];const runs:typeof b.runs=[];const ordinals:number[]=[]
  if(b.runs.length)h.films=[...h.films]
  for(const [i,old] of b.runs.entries()) {
    if(!a.runs.some(r=>r.productionId===old.productionId))fail('active source run lacks actual handoff')
    if(old.weekIndex!==week-old.releaseTick || old.weekIndex>=old.totalWeeks)fail('skipped or repeated theatrical installment')
    if(a.runReceipts.some(r=>r.productionId===old.productionId && r.weekIndex===old.weekIndex))fail('installment already serviced')
    const ordinal=b.activeRunFilmOrdinals[i]!,film=h.films[ordinal]
    if(!film || film.provenance!=='simulation/v1' || film.studioId!==a.targetId || film.filmId!==old.productionId)fail('original film receipt owner mismatch')
    const gross=old.weeklyGross[old.weekIndex]!,revenue=gross*old.studioShare
    const allocated=allocateRightsId(rights,'absorption-run')
    const receipt={id:allocated.id,week,productionId:old.productionId,weekIndex:old.weekIndex,gross,revenue}
    rights={...allocated.root,absorptions:allocated.root.absorptions.map(r=>r.id===a.id?{...r,runReceipts:[...r.runReceipts,receipt]}:r)}
    if(revenue>0) {
      if(a.buyerId===h.playerStudioId)ledger.push({week,kind:'absorbedRunRevenue',amount:revenue,note:receipt.id})
      else rivalRevenue.push({buyerId:a.buyerId,week,amount:revenue,receiptId:receipt.id})
    }
    const run={...old,weekIndex:old.weekIndex+1,cumulativeGrossPaid:old.cumulativeGrossPaid+gross,cumulativeStudioRevenuePaid:old.cumulativeStudioRevenuePaid+revenue}
    const settled=run.weekIndex>=run.totalWeeks
    h.films[ordinal]={...film,studioRevenueReceived:run.cumulativeStudioRevenuePaid,settledWeek:settled?week:null}
    if(settled) {h.receipts=[...h.receipts,{eventId:`industry-event-${h.nextReceipt}`,week,studioId:b.studioId,kind:'filmSettled',productionId:old.productionId}];h.nextReceipt++}
    else {runs.push(run);ordinals.push(ordinal)}
  }
  b.runs=runs;b.activeRunFilmOrdinals=ordinals
  return {rights,ledger,rivalRevenue}
}

/** Unconditional current49 cash orphan guard, including when there are no absorption records. */
export function validateAbsorbedRunMoney(state:GameState):void {
  for(const row of state.ledger.filter(r=>r.kind==='absorbedRunRevenue')) {
    const owners=state.rights.absorptions.flatMap(a=>Array.isArray(a.runReceipts)?a.runReceipts.filter(r=>r.id===row.note).map(r=>({a,r})):[])
    if(owners.length!==1 || owners[0]!.a.buyerId!==state.hollywood?.playerStudioId || owners[0]!.r.revenue!==row.amount || owners[0]!.r.week!==row.week)fail('orphan/wrong-beneficiary run revenue')
  }
}

/** Called only after all absorption records and installments have their complete joined proof. */
export function validateRivalAbsorbedRunMoney(state:GameState):void {
  const h=state.hollywood
  if(!h)return
  // Real rival books aggregate theatrical income by their existing account periods. Prove
  // both overlapping native income and assigned installments; no fictional cash rows.
  for(const buyer of h.businesses) {
    const incoming=state.rights.absorptions.filter(a=>a.buyerId===buyer.studioId).flatMap(a=>a.runReceipts)
    if(incoming.length===0)continue
    const outgoing=new Map(state.rights.absorptions.filter(a=>a.targetId===buyer.studioId).flatMap(a=>a.runReceipts)
      .map(r=>[`${r.productionId}|${r.weekIndex}`,r]))
    const films=h.films.filter((f):f is LiveIndustryFilm=>f.provenance==='simulation/v1' && f.studioId===buyer.studioId)
    const byWeek=new Map<number,number>()
    const book=(week:number,amount:number)=>byWeek.set(week,(byWeek.get(week)??0)+amount)
    for(const film of films) {
      const run=canonical(film),end=Math.min(run.totalWeeks,state.market.tick-run.releaseTick)
      for(let i=0;i<end;i++) {
        // Full installment proof has joined each outgoing amount to this exact
        // canonical component. Cancel it before summing so fractional sold income
        // does not leave a rounding residue in its original creator's books.
        const sold=outgoing.get(`${film.filmId}|${i}`)
        book(run.releaseTick+i,run.weeklyGross[i]!*run.studioShare-(sold?.revenue??0))
      }
    }
    for(const receipt of incoming)book(receipt.week,receipt.revenue)
    // Allocate signed net booked money, not its gross components. Native periods
    // can overlap at an endpoint: the LAST matching window owns each week's net.
    const expected=buyer.account.periods.map(()=>0)
    for(const [week,amount] of byWeek) {
      let index=-1
      for(const [i,period] of buyer.account.periods.entries())if(period.fromWeek<=week && week<=period.throughWeek)index=i
      if(index<0) {if(amount!==0)fail('rival earned installment has no actual account period')}
      else expected[index]=expected[index]!+amount
    }
    for(const [index,period] of buyer.account.periods.entries()) {
      const want=expected[index]!
      if(!Number.isFinite(want) || !Number.isFinite(period.movements.studioRevenue) || Math.abs(period.movements.studioRevenue-want)>1e-7*Math.max(1,Math.abs(want),Math.abs(period.movements.studioRevenue)))fail('rival earned revenue period differs from actual installments')
    }
  }
}

/** Independent canonical paid-prefix and installment bijection; removing a handoff or receipt cannot
 * shrink its own expected set. Original source revenue stops at C, buyer money equals only real due receipts. */
export function validateAbsorbedRuns(state:GameState,b:RivalBusiness,a:AbsorptionRecord):void {
  if(!Array.isArray(a.runs) || !Array.isArray(a.runReceipts) || !state.hollywood)fail('invalid real run owner')
  const films=state.hollywood!.films.filter((f):f is LiveIndustryFilm=>f.provenance==='simulation/v1' && f.studioId===a.targetId)
  const atClose=films.filter(f=>{const r=canonical(f);return f.result.releaseTick<=a.week && a.week<f.result.releaseTick+r.totalWeeks})
  const afterClose=a.workReleases.map(release=>{const film=films.find(f=>f.filmId===release.productionId && f.result.releaseTick===release.week);if(!film)fail('continued release lacks actual original film');return film})
  const owned=[...atClose,...afterClose.filter(f=>!atClose.some(old=>old.filmId===f.filmId))]
  if(a.buyerId!==state.hollywood.playerStudioId && !state.hollywood.businesses.some(b=>b.studioId===a.buyerId))fail('missing actual rival run beneficiary')
  if(films.some(f=>f.result.releaseTick>a.week && !afterClose.includes(f)))fail('post-close creator film lacks actual continued release')

  if(new Set(a.runs.map(r=>r.productionId)).size!==a.runs.length || a.runs.map(r=>r.productionId).sort().join()!==owned.map(f=>f.filmId).sort().join())fail('original active-run handoff incomplete')
  const expected=new Map<string,{week:number;productionId:string;weekIndex:number;gross:number;revenue:number}>()
  for(const row of a.runs) {
    if(!exact(row,['productionId','beneficiaryFromWeek','startingWeekIndex','grossPaidBeforeClose','revenuePaidBeforeClose']))fail('unknown original run handoff fields')
    const film=owned.find(f=>f.filmId===row.productionId)!,run=canonical(film)
    const sourceRelease=a.workReleases.find(r=>r.productionId===row.productionId)
    const from=sourceRelease?.week??a.week
    if(row.beneficiaryFromWeek!==from)fail('future revenue owner boundary differs from actual transaction/release')
    const first=from-run.releaseTick
    if(row.startingWeekIndex!==first || row.grossPaidBeforeClose!==run.weeklyGross.slice(0,first).reduce((sum,g)=>sum+g,0)
      || row.revenuePaidBeforeClose!==run.weeklyGross.slice(0,first).reduce((sum,g)=>sum+g*run.studioShare,0))fail('original earned paid prefix differs')
    const end=Math.min(run.totalWeeks,state.market.tick-run.releaseTick)
    for(let i=first;i<end;i++)expected.set(`${row.productionId}|${i}`,{week:run.releaseTick+i,productionId:row.productionId,weekIndex:i,gross:run.weeklyGross[i]!,revenue:run.weeklyGross[i]!*run.studioShare})
  }
  const seen=new Set<string>(),ids=new Set<string>()
  for(const receipt of a.runReceipts) {
    if(!exact(receipt,['id','week','productionId','weekIndex','gross','revenue']))fail('unknown installment fields')
    const key=`${receipt.productionId}|${receipt.weekIndex}`,want=expected.get(key)
    if(!want || seen.has(key) || ids.has(receipt.id) || receipt.week!==want.week || receipt.gross!==want.gross || receipt.revenue!==want.revenue)fail('invented/replayed/altered theatrical installment')
    seen.add(key);ids.add(receipt.id)
    const rows=state.ledger.filter(r=>r.kind==='absorbedRunRevenue' && r.note===receipt.id)
    if(a.buyerId!==state.hollywood.playerStudioId || receipt.revenue===0) {
      if(rows.length!==0)fail('rival/zero receipt credited to player')
    } else if(rows.length!==1 || rows[0]!.amount!==receipt.revenue || rows[0]!.week!==receipt.week)fail('buyer receipt lacks exact earned cash row')
  }
  if(seen.size!==expected.size)fail('ordinary due installment omitted')
  for(const row of state.ledger.filter(r=>r.kind==='absorbedRunRevenue')) {
    const owners=state.rights.absorptions.flatMap(r=>r.runReceipts.filter(x=>x.id===row.note))
    if(owners.length!==1 || owners[0]!.revenue!==row.amount || owners[0]!.week!==row.week)fail('orphan buyer run revenue')
  }
  if(b.runs.some(r=>!a.runs.some(s=>s.productionId===r.productionId)))fail('new autonomous target run')
}
