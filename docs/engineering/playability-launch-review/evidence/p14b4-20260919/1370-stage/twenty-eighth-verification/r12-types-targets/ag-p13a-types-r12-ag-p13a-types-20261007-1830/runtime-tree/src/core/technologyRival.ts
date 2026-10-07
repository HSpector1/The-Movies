import { moveRivalMoney, rivalWeeklyOperatingCost } from './hollywood.js'
import { commercialAccessRefusal, SYNCHRONIZED_SOUND, technologyAccess } from './technology.js'
import { adoptionRejections, aggregatedAdoptionComponents, equipmentPlan, installationCatalogueCost, mintEquipmentAsset } from './technologyAdoption.js'
import { TECHNOLOGY_CATALOGUE } from './technologyCatalogue.js'
import type { TechnologyCatalogueEntry } from './technologyCatalogue.js'
import type { HollywoodState, RivalBusiness } from './hollywoodTypes.js'
import type { GameState } from './types.js'
import type { StudioTechnology, TechnologyAccess } from './technologyTypes.js'

/**
 * One commercial consequence on existing abstract plant. The caller owns b's cloned account.
 *
 * P13B-S8: generalised per technology, and per ROUTE. A rival that has invented a
 * technology in its own Laboratory deploys it on the same paper commitment it has
 * always used for a purchase — the first-prototype entitlement it earned, or the
 * later inventor's price — because a rival owns no placement to build. Its access
 * is never re-bought, and nothing about the commercial route moved.
 */
export function considerRivalSoundPurchase(state: GameState, hollywood: HollywoodState, business: RivalBusiness): StudioTechnology {
  let technology = state.technology
  for (const entry of TECHNOLOGY_CATALOGUE) {
    technology = considerRivalAdoption({ ...state, technology, hollywood }, hollywood, business, entry)
  }
  return technology
}

function considerRivalAdoption(state: GameState, hollywood: HollywoodState, business: RivalBusiness, entry: TechnologyCatalogueEntry): StudioTechnology {
  const week = state.market.tick
  if (state.technology.adoptions.some(a => a.studioId === business.studioId && a.technologyId === entry.id)) return state.technology
  const invented = state.technology.access.find(a => a.studioId === business.studioId && a.technologyId === entry.id &&
    a.acquiredWeek !== null && a.route === 'research')
  // Without its own invention this is exactly the P13A commercial consequence,
  // refusals and all: entered studio, no access yet, not before the commercial week.
  if (!invented && commercialAccessRefusal(state, business.studioId, entry.id)) return state.technology
  if (invented && technologyAccess(state, business.studioId, entry.id) === false) return state.technology
  const stage = business.operations.facilities.find(f => f.capability === 'soundstage')
  const post = entry.postInstallationId === null ? null : business.operations.facilities.find(f => f.capability === 'post')
  if (!stage || (entry.postInstallationId !== null && !post)) return state.technology
  if (business.operations.workflows.some(w => w.reservations.some(r => r.facilityId === stage.id || (post !== null && post !== undefined && r.facilityId === post.id)))) return state.technology
  const installationCost = installationCatalogueCost(entry)
  const equipment = equipmentPlan(state, business.studioId, entry.id)
  // A rival never releases an equipment set (it cancels nothing), so there is
  // never one standing unheld for it to reuse. Nothing is invented for that case.
  if (equipment.source === 'existing') return state.technology
  const equipmentSet = { source: equipment.source, cost: equipment.cost }
  const accessCost = invented ? 0 : entry.accessCost
  const cost = accessCost + equipment.cost + installationCost
  if (business.account.cash < cost + rivalWeeklyOperatingCost(business, hollywood, week) * business.policy.reserveWeeks) return state.technology
  const access: TechnologyAccess = invented ?? { studioId: business.studioId, technologyId: entry.id, route: 'purchase' as const,
    chosenWeek: week, acquiredWeek: week, accessCost: entry.accessCost, researchProjectId: null }
  const technology = invented ? state.technology : { ...state.technology, access: [...state.technology.access, access] }
  if (adoptionRejections({ ...state, hollywood, technology }, business.studioId,
    { technologyId: entry.id, stageFacilityId: stage.id, ...(post ? { postFacilityId: post.id } : {}) })[0]) return state.technology
  moveRivalMoney(business.account, 'technologyAdoption', -cost, week)
  // Abstract plant: this campaign owns no placement of the rival's physical work,
  // so its chain is ONE aggregated installation row — the same rows the V23→V24
  // lift writes for a rival adoption, and one durable equipment asset it holds.
  // P13A identity is retained verbatim for synchronized sound.
  const id = entry.id === SYNCHRONIZED_SOUND.id ? `${business.studioId}:sound-adoption:0` : `${business.studioId}:${entry.id}:adoption:0`
  const asset = mintEquipmentAsset(technology.nextEquipmentId, business.studioId, entry.id, week, equipmentSet.source, equipment.cost, id)
  const equipmentAssetId = asset.id
  return {
    ...technology,
    equipment: [...technology.equipment, asset],
    nextEquipmentId: technology.nextEquipmentId + 1,
    adoptions: [...technology.adoptions, {
      id, studioId: business.studioId, technologyId: entry.id, stageFacilityId: stage.id,
      postFacilityId: post?.id ?? null, route: invented ? 'research' as const : 'purchase' as const,
      committedWeek: week, operationalWeek: null, cancelledWeek: null,
      equipmentCost: equipment.cost, installationCost, physicalProjectIds: [],
      prototypeProjectId: equipment.source === 'first-prototype' ? access.researchProjectId : null,
      components: aggregatedAdoptionComponents(entry, equipmentSet, installationCost, equipmentAssetId), equipmentAssetId,
    }],
  }
}

/** Existing rival policy chooses sound only before filming and only after its chain is operational. */
export function selectRivalSoundProduction(technology: StudioTechnology, business: RivalBusiness): StudioTechnology {
  const adoption = technology.adoptions.find(a => a.studioId === business.studioId && a.technologyId === SYNCHRONIZED_SOUND.id && a.operationalWeek !== null)
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
