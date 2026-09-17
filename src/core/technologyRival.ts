import { moveRivalMoney, rivalWeeklyOperatingCost } from './hollywood.js'
import { adoptionRefusal, commercialAccessRefusal, SYNCHRONIZED_SOUND } from './technology.js'
import { aggregatedAdoptionComponents, installationCatalogueCost, mintEquipmentAsset } from './technologyAdoption.js'
import { technologyEntry } from './technologyCatalogue.js'
import type { HollywoodState, RivalBusiness } from './hollywoodTypes.js'
import type { GameState } from './types.js'
import type { StudioTechnology } from './technologyTypes.js'

/** One commercial consequence on existing abstract plant. The caller owns b's cloned account. */
export function considerRivalSoundPurchase(state: GameState, hollywood: HollywoodState, business: RivalBusiness): StudioTechnology {
  if (state.technology.adoptions.some(a=>a.studioId!==hollywood.playerStudioId) || commercialAccessRefusal(state,business.studioId)) return state.technology
  const stage = business.operations.facilities.find(f=>f.capability==='soundstage')
  const post = business.operations.facilities.find(f=>f.capability==='post')
  if (!stage || !post || business.operations.workflows.some(w=>w.reservations.some(r=>r.facilityId===stage.id || r.facilityId===post.id))) return state.technology
  const entry = technologyEntry(SYNCHRONIZED_SOUND.id)
  const installationCost = installationCatalogueCost(entry)
  const cost = SYNCHRONIZED_SOUND.accessCost + SYNCHRONIZED_SOUND.commercialEquipmentCost + installationCost
  if (business.account.cash < cost + rivalWeeklyOperatingCost(business,hollywood,state.market.tick)*business.policy.reserveWeeks) return state.technology
  const access = {studioId:business.studioId,technologyId:SYNCHRONIZED_SOUND.id,route:'purchase' as const,
    chosenWeek:state.market.tick,acquiredWeek:state.market.tick,accessCost:SYNCHRONIZED_SOUND.accessCost,researchProjectId:null}
  const technology = {...state.technology,access:[...state.technology.access,access]}
  if (adoptionRefusal({...state,hollywood,technology},business.studioId,stage.id,post.id)) return state.technology
  moveRivalMoney(business.account,'technologyAdoption',-cost,state.market.tick)
  // Abstract plant: this campaign owns no placement of the rival's physical work,
  // so its chain is ONE aggregated installation row — the same rows the V23→V24
  // lift writes for a rival adoption, and one durable equipment asset it holds.
  const id = `${business.studioId}:sound-adoption:0`
  const equipment = {source:'commercial' as const, cost:entry.commercialEquipmentCost}
  const asset = mintEquipmentAsset(technology.nextEquipmentId,business.studioId,entry.id,state.market.tick,equipment.source,equipment.cost,id)
  return {...technology,equipment:[...technology.equipment,asset],nextEquipmentId:technology.nextEquipmentId+1,
    adoptions:[...technology.adoptions,{id,studioId:business.studioId,
    technologyId:SYNCHRONIZED_SOUND.id,stageFacilityId:stage.id,postFacilityId:post.id,route:'purchase',committedWeek:state.market.tick,
    operationalWeek:null,cancelledWeek:null,equipmentCost:equipment.cost,installationCost,physicalProjectIds:[],prototypeProjectId:null,
    components:aggregatedAdoptionComponents(entry,equipment,installationCost,asset.id),equipmentAssetId:asset.id}]}
}

/** Existing rival policy chooses sound only before filming and only after its chain is operational. */
export function selectRivalSoundProduction(technology: StudioTechnology, business: RivalBusiness): StudioTechnology {
  const adoption = technology.adoptions.find(a=>a.studioId===business.studioId && a.operationalWeek!==null)
  if (!adoption) return technology
  const choices = business.productions.filter(p=>p.remainingTicks>5 && !technology.productions.some(row=>row.studioId===business.studioId && row.productionId===p.id))
    .map(p=>({studioId:business.studioId,productionId:p.id,method:'synchronized-dialogue' as const,adoptionId:adoption.id,lockedWeek:null}))
  return choices.length===0 ? technology : {...technology,productions:[...technology.productions,...choices]}
}

export function rivalInstallationSlots(technology: StudioTechnology, business: RivalBusiness): string[] {
  return technology.adoptions.filter(a=>a.studioId===business.studioId && a.operationalWeek===null).flatMap(a=>
    business.operations.facilities.filter(f=>f.id===a.stageFacilityId || f.id===a.postFacilityId).flatMap(f=>
      Array.from({length:f.capacity},(_,slot)=>`${f.id}:${slot}`)))
}
