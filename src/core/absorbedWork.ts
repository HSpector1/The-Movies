import type { GameState } from './types.js'
import type { RivalBusiness } from './hollywoodTypes.js'
import type { AbsorptionRecord } from './rights.js'
import { productionPhaseForRemainingTicks } from './operations.js'

/** Current49 terminal write-off owner. Paid rows/workflows remain immutable source history, as in
 * the actual closure producer; absorbed operating state ends their participation/capacity claims.
 * Only the closing quote's cancelRequired path writes these records. Lawful continuations are
 * deliberately refused until the real buyer work producer exists, never silently cancelled. */
export function validateAbsorbedProductionStops(state: GameState, business: RivalBusiness, transaction: AbsorptionRecord): void {
  const fail=(why:string):never=>{throw new Error(`absorption work: ${why}`)}
  const rows=transaction.stoppedProductions
  if(!Array.isArray(rows) || business.studioId!==transaction.targetId)fail('missing actual terminal transaction owner')
  if(rows.map(r=>r.productionId).join()!==business.productions.filter(p=>!transaction.continuedProductions.some(row=>row.productionId===p.id)).map(p=>p.id).join())fail('paid production write-off bijection/order differs')
  const exact=(x:object,keys:string[])=>Object.keys(x).sort().join()===keys.sort().join()
  for(const row of rows) {
    if(!exact(row,['productionId','scriptProjectId','remainingTicks','phase','reason','blockedCapability','missingParticipants']) || !Array.isArray(row.missingParticipants))fail('invalid write-off shape')
    const production=business.productions.find(p=>p.id===row.productionId)!
    const script=business.development.projects.find(s=>s.id===row.scriptProjectId)
    const cost=business.projects.find(p=>p.scriptProjectId===row.scriptProjectId)
    if(!script || script.status!=='inProduction' || script.productionId!==production.id || script.conceptId!==production.conceptId
      || cost?.productionId!==production.id || cost.conceptId!==production.conceptId || cost.announcedWeek!==production.startTick
      || row.remainingTicks!==production.remainingTicks || row.phase!==productionPhaseForRemainingTicks(production.remainingTicks)
      || production.startTick>transaction.week || production.remainingTicks<1)fail('original paid screenplay/footage/phase link differs')
    const people=[production.writerId,production.directorId,...production.craftIds,...Object.values(production.cast)]
    if(new Set(row.missingParticipants).size!==row.missingParticipants.length || row.missingParticipants.some(id=>!people.includes(id)))fail('invented missing participant')
    if(row.reason==='missingParticipants') {
      if(row.blockedCapability!==null || row.missingParticipants.length===0)fail('missing-participant write-off lacks actual subjects')
      const missing=[...new Set(people.filter(id=>transaction.contracts.some(c=>c.talentId===id && c.buyerContractId===null)))]
      if(missing.join()!==row.missingParticipants.join())fail('missing-participant cancellation differs from actual coupled retention')
      for(const id of row.missingParticipants) {
        const disposition=transaction.contracts.find(c=>c.talentId===id)
        const old=state.hollywood!.employment.find(e=>e.contractId===disposition?.sourceContractId)
        if(!disposition || !old || old.studioId!==transaction.targetId || old.terms.talentId!==id || old.endedWeek!==transaction.week || disposition.buyerContractId!==null)fail('missing participant was actually retained')
      }
    } else if(row.reason==='buyerOperationsNotManaged' || row.reason==='productionIdCollision') {
      if(row.blockedCapability!==null)fail('non-capability refusal has a capability')
    } else {
      if(typeof row.reason!=='string' || (!row.reason.startsWith('noFacility:') && !row.reason.startsWith('noCapacity:'))
        || row.blockedCapability===null || row.reason.split(':')[1]!==row.blockedCapability)fail('invalid actual capacity refusal')
    }
  }
  const scripts=business.development.projects.filter(p=>p.status==='inProduction' && !transaction.continuedProductions.some(row=>row.scriptProjectId===p.id))
  if(scripts.length!==rows.length || scripts.some(s=>!rows.some(r=>r.scriptProjectId===s.id)))fail('coupled screenplay write-off omitted')
}
