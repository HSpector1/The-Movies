import { FACILITY_BLUEPRINTS } from './tuning.js'
import type { TechnologyId } from './technologyTypes.js'

export type TechnologyCapability = 'synchronized-dialogue' | 'lighting-control'

export type TechnologyCatalogueEntry = {
  id: TechnologyId
  name: string
  capability: TechnologyCapability
  prerequisiteTechnologyIds: readonly TechnologyId[]
  laboratoryBlueprintId: string
  instrumentBlueprintId: string
  stageInstallationId: string
  /** Nullable: a technology may have no Post component at all (P13B-S2 lighting). */
  postInstallationId: string | null
  researchableWeek: number
  commercialWeek: number
  /**
   * P13B-S7 public milestone disclosure (data, not law): the distant window the wire may
   * publish before `announceWeek`, and the week the public announcement narrows it to the
   * exact `commercialWeek`. A degenerate window (`from === to`) is already-public: exact at
   * every week, and it never produces an announcement row.
   */
  publicWindow: { from: number; to: number; announceWeek: number }
  /** P13B-S7 authored player text: what a commercial purchase of this technology replaces. */
  replacementLabel: string
  work: number
  usableBudgetPerScientist: number
  accessCost: number
  commercialEquipmentCost: number
  laterInventorEquipmentCost: number
  deploymentWeeks: number
}

/** The exact capability each catalogue identity carries; an id outside this map is not in this catalogue. */
const CAPABILITY_BY_ID: Record<TechnologyId, TechnologyCapability> = {
  'lighting-control-01': 'lighting-control',
  'synchronized-sound': 'synchronized-dialogue',
}

/**
 * Every per-technology parameter the engine reads lives here, in stable ascending
 * id order. Physical content remains owned by P09; this names its blueprints.
 */
export const TECHNOLOGY_CATALOGUE: readonly TechnologyCatalogueEntry[] = [
  {
    id: 'lighting-control-01', name: 'Lighting control', capability: 'lighting-control', prerequisiteTechnologyIds: [],
    laboratoryBlueprintId: 'research-laboratory', instrumentBlueprintId: 'electrical-control-instruments',
    stageInstallationId: 'lighting-control-stage', postInstallationId: null,
    researchableWeek: 780, commercialWeek: 936,
    publicWindow: { from: 884, to: 988, announceWeek: 884 },
    replacementLabel: 'Controlled lighting replaces conventional setup on the fitted stage: two setup units instead of four.',
    work: 64, usableBudgetPerScientist: 10_000,
    accessCost: 100_000, commercialEquipmentCost: 200_000, laterInventorEquipmentCost: 150_000, deploymentWeeks: 4,
  },
  {
    id: 'synchronized-sound', name: 'Synchronized sound', capability: 'synchronized-dialogue', prerequisiteTechnologyIds: [],
    laboratoryBlueprintId: 'research-laboratory', instrumentBlueprintId: 'acoustic-instruments',
    stageInstallationId: 'synchronized-sound-stage', postInstallationId: 'synchronized-sound-post',
    researchableWeek: 260, commercialWeek: 416,
    publicWindow: { from: 416, to: 416, announceWeek: 416 },
    replacementLabel: 'Synchronized dialogue replaces the silent production method on the fitted stage and Post chain.',
    work: 64, usableBudgetPerScientist: 10_000,
    accessCost: 200_000, commercialEquipmentCost: 300_000, laterInventorEquipmentCost: 225_000, deploymentWeeks: 12,
  },
]

/** Whether this string is a catalogue identity. Untrusted save and action input asks here. */
export function isTechnologyId(id: unknown): id is TechnologyId {
  return typeof id === 'string' && Object.hasOwn(CAPABILITY_BY_ID, id)
}

/** The one per-technology parameter row. Every per-project engine read goes through it. */
export function technologyEntry(id: TechnologyId): TechnologyCatalogueEntry {
  const entry = TECHNOLOGY_CATALOGUE.find(entry => entry.id === id)
  if (!entry) throw new Error('That technology is not in this catalogue.')
  return entry
}

/** Authoring acceptance: stable identity/order, reachable acyclic prerequisites and real physical targets. */
export function validateTechnologyCatalogue(entries: readonly TechnologyCatalogueEntry[] = TECHNOLOGY_CATALOGUE): void {
  const byId=new Map(entries.map(entry=>[entry.id,entry]))
  if(byId.size!==entries.length)throw new Error('Technology catalogue: duplicate identity')
  for(const [index,entry] of entries.entries()) {
    if(!isTechnologyId(entry.id) || CAPABILITY_BY_ID[entry.id]!==entry.capability)throw new Error('Technology catalogue: unknown identity or capability')
    if(index>0 && entries[index-1]!.id>=entry.id)throw new Error('Technology catalogue: unstable ordering')
    if(!Number.isSafeInteger(entry.researchableWeek)||entry.researchableWeek<0||!Number.isSafeInteger(entry.commercialWeek)||entry.commercialWeek<entry.researchableWeek)throw new Error('Technology catalogue: invalid dated availability')
    for(const amount of [entry.work,entry.usableBudgetPerScientist,entry.accessCost,entry.commercialEquipmentCost,entry.laterInventorEquipmentCost,entry.deploymentWeeks])
      if(!Number.isSafeInteger(amount)||amount<0)throw new Error('Technology catalogue: invalid technology parameter')
    if(entry.work<1||entry.deploymentWeeks<1)throw new Error('Technology catalogue: invalid technology parameter')
    const requirements=[
      [entry.laboratoryBlueprintId,'laboratory',false], [entry.instrumentBlueprintId,'laboratory',true],
      [entry.stageInstallationId,'soundstage',true], [entry.postInstallationId,'post',true],
    ] as const
    for(const [id,capability,installation] of requirements) {
      if(id===null)continue // A nullable Post component: absent, never a dangling identity.
      const blueprint=FACILITY_BLUEPRINTS.find(blueprint=>blueprint.id===id)
      if(!blueprint||blueprint.capability!==capability||Boolean(blueprint.installationTargetCapability)!==installation||blueprint.buildWeeks<1)throw new Error('Technology catalogue: unreachable physical prerequisite')
    }
    const walk=(id:TechnologyId,path:Set<TechnologyId>):void=>{
      if(path.has(id))throw new Error('Technology catalogue: cyclic prerequisite')
      const node=byId.get(id)
      if(!node)throw new Error('Technology catalogue: unknown prerequisite')
      for(const dependency of node.prerequisiteTechnologyIds)walk(dependency,new Set([...path,id]))
    }
    walk(entry.id,new Set())
  }
}
