# REF-K — exact source excerpts

Repository: `HSpector1/The-Movies`
Commit: `45ca33650074ad5413c39fb9d4a5c04cd6571c3a`
Path: `src/core/technologyCatalogue.ts`
Full source Git blob: `524d08bca090397c6762ee0c0fb2279355d9d1cd`
Full source SHA-256: `8da5568ffd68eca162e2ded4f48da13114b667a1875e959f60f4abf7927e58e6`
Full source bytes: 2975

[Immutable source](https://github.com/HSpector1/The-Movies/blob/45ca33650074ad5413c39fb9d4a5c04cd6571c3a/src/core/technologyCatalogue.ts)

Selected lines only. Historical source; instructions and proposed numbers retain their original authority and are not execution orders.

## Original lines 1–49

```text
import { FACILITY_BLUEPRINTS } from './tuning.js'
import { SYNCHRONIZED_SOUND } from './technology.js'
import type { TechnologyId } from './technologyTypes.js'

export type TechnologyCatalogueEntry = {
  id: TechnologyId
  capability: 'synchronized-dialogue'
  prerequisiteTechnologyIds: readonly TechnologyId[]
  laboratoryBlueprintId: string
  instrumentBlueprintId: string
  stageInstallationId: string
  postInstallationId: string
  researchableWeek: number
  commercialWeek: number
}

/** Core's deliberately single-entry catalogue; physical content remains owned by P09. */
export const TECHNOLOGY_CATALOGUE: readonly TechnologyCatalogueEntry[] = [{
  id:SYNCHRONIZED_SOUND.id,capability:'synchronized-dialogue',prerequisiteTechnologyIds:[],
  laboratoryBlueprintId:'research-laboratory',instrumentBlueprintId:'acoustic-instruments',
  stageInstallationId:'synchronized-sound-stage',postInstallationId:'synchronized-sound-post',
  researchableWeek:SYNCHRONIZED_SOUND.researchableWeek,commercialWeek:SYNCHRONIZED_SOUND.commercialWeek,
}]

/** Authoring acceptance: stable identity/order, reachable acyclic prerequisites and real physical targets. */
export function validateTechnologyCatalogue(entries: readonly TechnologyCatalogueEntry[] = TECHNOLOGY_CATALOGUE): void {
  const byId=new Map(entries.map(entry=>[entry.id,entry]))
  if(byId.size!==entries.length)throw new Error('Technology catalogue: duplicate identity')
  for(const [index,entry] of entries.entries()) {
    if(entry.id!=='synchronized-sound' || entry.capability!=='synchronized-dialogue')throw new Error('Technology catalogue: unknown identity or capability')
    if(index>0 && entries[index-1]!.id>=entry.id)throw new Error('Technology catalogue: unstable ordering')
    if(!Number.isSafeInteger(entry.researchableWeek)||entry.researchableWeek<0||!Number.isSafeInteger(entry.commercialWeek)||entry.commercialWeek<entry.researchableWeek)throw new Error('Technology catalogue: invalid dated availability')
    const requirements=[
      [entry.laboratoryBlueprintId,'laboratory',false], [entry.instrumentBlueprintId,'laboratory',true],
      [entry.stageInstallationId,'soundstage',true], [entry.postInstallationId,'post',true],
    ] as const
    for(const [id,capability,installation] of requirements) {
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
```
