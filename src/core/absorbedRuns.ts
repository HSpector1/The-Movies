import type { GameState, LedgerEntry } from './types.js'
import type { HollywoodState, RivalBusiness, LiveIndustryFilm } from './hollywoodTypes.js'
import { allocateRightsId, type AbsorptionRecord } from './rights.js'
import { openTheatricalRun } from './economy.js'

function fail(why:string):never {throw new Error(`absorption run: ${why}`)}
const exact=(x:object,keys:string[])=>Object.keys(x).sort().join()===keys.sort().join()
function canonical(film:LiveIndustryFilm) {
  return openTheatricalRun(film.result,film.result.boxOffice.opening,film.result.boxOffice.opening>0?film.result.boxOffice.total/film.result.boxOffice.opening:1,film.result.releaseTick)
}

/** Real ordinary input-week servicing. Original creator/film/run and locked theatrical schedule stay
 * with their source; the actual absorption owns only the future cash beneficiary and new receipts. */
export function advanceAbsorbedRuns(state:GameState,h:HollywoodState,b:RivalBusiness,a:AbsorptionRecord,week:number):{rights:GameState['rights'];ledger:LedgerEntry[]} {
  if(week!==state.market.tick || a.targetId!==b.studioId || week<a.week)fail('not the actual servicing boundary/beneficiary')
  if(a.buyerId!==h.playerStudioId){
    // A runless terminal target still visits the ordinary absorbed-business branch. Prove
    // the absent run owner against authentic films; never credit a rival receipt to the player.
    validateAbsorbedRuns({...state,hollywood:h},b,a)
    return {rights:state.rights,ledger:[]}
  }
  let rights=state.rights
  const ledger:LedgerEntry[]=[];const runs:typeof b.runs=[];const ordinals:number[]=[]
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
    if(revenue>0)ledger.push({week,kind:'absorbedRunRevenue',amount:revenue,note:receipt.id})
    const run={...old,weekIndex:old.weekIndex+1,cumulativeGrossPaid:old.cumulativeGrossPaid+gross,cumulativeStudioRevenuePaid:old.cumulativeStudioRevenuePaid+revenue}
    const settled=run.weekIndex>=run.totalWeeks
    h.films[ordinal]={...film,studioRevenueReceived:run.cumulativeStudioRevenuePaid,settledWeek:settled?week:null}
    if(settled) {h.receipts=[...h.receipts,{eventId:`industry-event-${h.nextReceipt}`,week,studioId:b.studioId,kind:'filmSettled',productionId:old.productionId}];h.nextReceipt++}
    else {runs.push(run);ordinals.push(ordinal)}
  }
  b.runs=runs;b.activeRunFilmOrdinals=ordinals
  return {rights,ledger}
}

/** Unconditional current49 cash orphan guard, including when there are no absorption records. */
export function validateAbsorbedRunMoney(state:GameState):void {
  for(const row of state.ledger.filter(r=>r.kind==='absorbedRunRevenue')) {
    const owners=state.rights.absorptions.flatMap(a=>Array.isArray(a.runReceipts)?a.runReceipts.filter(r=>r.id===row.note).map(r=>({a,r})):[])
    if(owners.length!==1 || owners[0]!.a.buyerId!==state.hollywood?.playerStudioId || owners[0]!.r.revenue!==row.amount || owners[0]!.r.week!==row.week)fail('orphan/wrong-beneficiary run revenue')
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
  if(a.buyerId!==state.hollywood.playerStudioId && (!state.hollywood.businesses.some(b=>b.studioId===a.buyerId)
    || owned.length!==0 || a.runs.length!==0 || a.runReceipts.length!==0 || b.runs.length!==0
    || a.workReleases.length!==0 || films.some(f=>f.result.releaseTick>a.week)))fail('rival buyer run producer is not admitted')

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
    if(receipt.revenue===0 ? rows.length!==0 : rows.length!==1 || rows[0]!.amount!==receipt.revenue || rows[0]!.week!==receipt.week)fail('buyer receipt lacks exact earned cash row')
  }
  if(seen.size!==expected.size)fail('ordinary due installment omitted')
  for(const row of state.ledger.filter(r=>r.kind==='absorbedRunRevenue')) {
    const owners=state.rights.absorptions.flatMap(r=>r.runReceipts.filter(x=>x.id===row.note))
    if(owners.length!==1 || owners[0]!.revenue!==row.amount || owners[0]!.week!==row.week)fail('orphan buyer run revenue')
  }
  if(b.runs.some(r=>!a.runs.some(s=>s.productionId===r.productionId)))fail('new autonomous target run')
}
