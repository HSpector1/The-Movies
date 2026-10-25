import type { GameState } from './types.js'
import type { RivalBusiness } from './hollywoodTypes.js'
import type { AbsorptionRecord } from './rights.js'

function fail(why:string):never{throw new Error(`absorption script: ${why}`)}
function same(a:unknown,b:unknown):boolean{
  if(a===b)return true
  if(a===null||b===null||typeof a!=='object'||typeof b!=='object')return false
  if(Array.isArray(a)||Array.isArray(b))return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((v,i)=>same(v,b[i]))
  const x=a as Record<string,unknown>,y=b as Record<string,unknown>
  const keys=Object.keys(x).sort()
  return keys.join()===Object.keys(y).sort().join()&&keys.every(k=>same(x[k],y[k]))
}
/** Terminal observation, never a new cancelled ScriptProject status or simulated completion.
 * The original native owner validates the frozen source at actual C, including due dates,
 * writer contracts, reservation, assessment and costs; this joins the explicit write-off. */
export function validateAbsorbedScripts(state:GameState,b:RivalBusiness,a:AbsorptionRecord):void{
  if(a.targetId!==b.studioId)fail('wrong source employer')
  const expected=b.development.projects.filter(p=>p.status==='drafting'||p.status==='rewriting')
  if(a.producerVersion==='absorption-clean/v1'){
    if(Object.hasOwn(a,'stoppedScripts')||expected.length!==0)fail('legacy producer cannot carry stopped drafting history')
    return
  }
  if(a.producerVersion!=='absorption-scripts/v2'||!Array.isArray(a.stoppedScripts)||a.stoppedScripts.length===0)fail('missing versioned script write-off')
  if(a.stoppedScripts.map(r=>r.scriptProjectId).join()!==expected.map(p=>p.id).join())fail('in-flight script write-off bijection/order differs')
  for(const row of a.stoppedScripts){
    if(typeof row!=='object'||row===null||Object.keys(row).sort().join()!==['scriptProjectId','reason','sourceContractIds','originalScript','originalCosts'].sort().join()
      ||row.reason!=='writersNotRetained'||!Array.isArray(row.sourceContractIds))fail('invalid script disposition shape')
    const script=expected.find(p=>p.id===row.scriptProjectId)!
    const cost=b.projects.find(p=>p.scriptProjectId===script.id)
    if(!same(row.originalScript,script)||!cost||!same(row.originalCosts,cost)||script.productionId!==null
      ||cost.productionId!==null||cost.announcedWeek!==null||script.commissionedWeek>a.week
      ||script.dueWeek===null||script.dueWeek<=a.week||script.reservation===null)fail('original earned script/work/cost snapshot differs')
    const writers=[...new Set(script.writerIds)]
    const links=writers.map(id=>a.contracts.find(c=>c.talentId===id))
    if(writers.length===0||links.some(c=>!c||c.buyerContractId!==null)
      ||!same(row.sourceContractIds,links.map(c=>c!.sourceContractId)))fail('required writers were retained or disposition differs')
    for(const link of links){
      const e=state.hollywood!.employment.find(e=>e.contractId===link!.sourceContractId)
      const receipts=state.hollywood!.receipts.filter(r=>r.kind==='employment'&&r.contractId===link!.sourceContractId&&r.reason==='absorptionExit')
      if(!e||e.studioId!==a.targetId||e.terms.talentId!==link!.talentId||e.terms.startWeek>a.week
        ||e.terms.endWeekExclusive<=a.week||e.endedWeek!==a.week||receipts.length!==1
        ||receipts[0]!.week!==a.week||receipts[0]!.studioId!==a.targetId)fail('writer has no actual source exit')
    }
    if(state.scriptDevelopment.projects.some(p=>p.id===script.id&&p.conceptId===script.conceptId)
      ||a.continuedProductions.some(p=>p.scriptProjectId===script.id))fail('stopped draft copied to buyer or continued work')
  }
}
