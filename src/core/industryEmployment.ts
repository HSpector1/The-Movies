import type { Contract, GameState } from './types.js'
import type { IndustryReceipt } from './hollywoodTypes.js'

export function sameContractTerms(a:Contract,b:Contract):boolean {
  return a.talentId===b.talentId&&a.startWeek===b.startWeek&&a.endWeekExclusive===b.endWeekExclusive&&a.termWeeks===b.termWeeks&&a.annualSalary===b.annualSalary&&a.signingBonus===b.signingBonus
}

/** Mirror actual player contract transitions into the new forward industry ledger.
 * Existing migration contracts keep their original terms; observing is not signing. */
export function recordPlayerEmployment(state:GameState, observed=false):GameState {
  const source=state.hollywood
  if(!source)return state
  const week=state.market.tick,owner=source.playerStudioId
  const current=state.contracts.filter(c=>c.startWeek<=week&&week<c.endWeekExclusive)
  const same=sameContractTerms
  const active=source.activeEmploymentOrdinals.filter(i=>source.employment[i]!.studioId===owner)
  const ending=active.filter(i=>!current.some(c=>same(c,source.employment[i]!.terms)))
  const starting=current.filter(c=>!active.some(i=>same(c,source.employment[i]!.terms)))
  if(ending.length===0&&starting.length===0)return state
  const h={...source,employment:[...source.employment],activeEmploymentOrdinals:source.activeEmploymentOrdinals.filter(i=>!ending.includes(i)),receipts:[...source.receipts]}
  const append=(r:Omit<IndustryReceipt,'eventId'>)=>h.receipts.push({...r,eventId:`industry-event-${h.nextReceipt++}`} as IndustryReceipt)
  for(const i of ending) {
    const e=h.employment[i]!,renewing=starting.some(c=>c.talentId===e.terms.talentId)
    h.employment[i]={...e,endedWeek:week}
    if(!renewing)append({kind:'employment',week,studioId:owner,talentId:e.terms.talentId,contractId:e.contractId,fromStudioId:owner,toStudioId:null,reason:week===e.terms.endWeekExclusive?'expiry':'termination'} as IndustryReceipt)
  }
  for(const terms of starting) {
    const renewal=ending.some(i=>h.employment[i]!.terms.talentId===terms.talentId)
    const reason=observed?'existing-player-contract':renewal?'renewal':'player-contract'
    const ordinal=h.employment.length,contractId=`${owner}:contract:${terms.talentId}:${terms.startWeek}:player-${ordinal}`
    h.activeEmploymentOrdinals.push(ordinal);h.employment.push({contractId,studioId:owner,terms:{...terms},endedWeek:null,reason})
    append({kind:'employment',week,studioId:owner,talentId:terms.talentId,contractId,fromStudioId:renewal?owner:null,toStudioId:owner,reason} as IndustryReceipt)
  }
  return {...state,hollywood:h}
}
