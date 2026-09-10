import {describe,it,expect} from 'vitest'
import {mkdtemp,writeFile,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
// @ts-expect-error Native standalone warning adapter deliberately has no build dependency.
import {evaluate,run} from '../scripts/p12a-milestone-checker.mjs'
const partial={version:1,order:'OPS-P12A-LIVING-HOLLYWOOD-20260910-05',status:'PARTIAL',milestone:'gate-b'}
// Synthetic metadata only: this exercises warnings and never claims a real review.
function completeFixture(){
  const binding=Object.fromEntries(['ts','unity','schema','dto','executable','engine','manifest'].map(k=>[k,`synthetic-binding-${k}`]))
  const kinds=['entry-bindings','calendar','authored-history','live-production','employment','conservation','migration','generated-contract',
    'native-industry','native-campaign-naming','product-review-early','product-review-core','product-review-full','correctness-review',
    'all-nine','endurance','named-campaigns','save-as','rng-isolation','quit-relaunch','back-restoration','large-text-final-row',
    'ready-extensions','cumulative-regression','performance','launch-binding']
  const attestations=Object.fromEntries(kinds.map(kind=>[kind,{id:kind,kind,outcome:'PASS',binding,
    provenance:kind.includes('review')?'independent-review':kind==='live-production'||kind==='endurance'?'ordinary-progression':
      ['native-industry','native-campaign-naming','quit-relaunch','back-restoration','large-text-final-row'].includes(kind)?'real-native-input':'synthetic',
    reviewer:'synthetic-independent-reviewer',obstacles:[],rechecks:['synthetic recheck'],captureIds:['synthetic capture'],inputWitness:'clean',
    actualReleasedFilms:1,authoredFilmsExcluded:true,allNineAtStart:true,additionalAdvances:6240,independentStorageIds:3,inactiveBytesUnchanged:true,
    canonicalIncumbents:4,newcomersHaveNoRetrospectiveFilms:true,noHistoricalRepayment:true}]))
  const index={...partial,status:'COMPLETE',candidate:binding,attestationsPath:'attestations.json',scope:{rivals:9,incumbents:4,
    arrivals:[520,988,1560,1872,2548],calendar:'1920-52-week-v1',authoredHistory:true,liveProduction:true,namedIndependentCampaigns:3,saveAs:true,rngIsolation:true,migration:'B'},
    evidence:kinds.map(kind=>({kind,outcome:'PASS',attestationId:kind}))}
  return {index,attestations}
}
describe('R05 explicit checker transport and scope (not real-client hook proof)',()=>{
  it('leaves safe partial, blocked, reentry and Owner stop alone',()=>{
    for(const status of ['PARTIAL','BLOCKED','INTERRUPTED'])expect(evaluate({...partial,status})).toEqual({})
    expect(evaluate(null,{}, {stop_hook_active:true})).toEqual({})
    expect(evaluate(null,{}, {owner_stop:true})).toEqual({})
  })
  it('warns on explicit unproved completion using only nonblocking JSON',()=>{
    const output=evaluate({...partial,status:'COMPLETE'})
    expect(Object.keys(output)).toEqual(['systemMessage'])
    expect(output.systemMessage).toContain('R05 MILESTONE WARNING')
    expect(JSON.stringify(output)).not.toMatch(/"decision"|"continue"/)
  })
  it('does not accept all-green metadata as independent evidence',()=>{
    const output=evaluate({...partial,status:'COMPLETE',evidence:[{kind:'product-review-full',outcome:'PASS'}]})
    expect(output.systemMessage).toBeTruthy()
    expect(()=>evaluate({...partial,order:'R04'})).toThrow()
  })
  it('distinguishes applicable scope from seeded-only films, insufficient campaigns and changed build bytes',()=>{
    const {index,attestations}=completeFixture()
    expect(evaluate(index,attestations)).toEqual({})
    const mutations=[
      (a:typeof attestations)=>{a['live-production']!.actualReleasedFilms=0},
      (a:typeof attestations)=>{a['authored-history']!.noHistoricalRepayment=false},
      (a:typeof attestations)=>{a['named-campaigns']!.independentStorageIds=2},
      (a:typeof attestations)=>{a['quit-relaunch']!.inputWitness='foreign'},
      (a:typeof attestations)=>{a['product-review-full']!.reviewer='lead'},
      (a:typeof attestations)=>{a['generated-contract']!.binding.engine='changed-engine-bytes'},
    ]
    for(const mutate of mutations){const changed=structuredClone(attestations);mutate(changed);expect(evaluate(index,changed).systemMessage).toContain('missing applicable')}
  })
  it('deduplicates warnings, rechecks changed evidence and surfaces malformed files without blocking safe stops',async()=>{
    const directory=await mkdtemp(join(tmpdir(),'p12a-checker-unit-'))
    try{
      const {index,attestations}=completeFixture(),path=join(directory,'index.json'),attPath=join(directory,'attestations.json')
      attestations['named-campaigns']!.independentStorageIds=2
      await writeFile(path,JSON.stringify(index));await writeFile(attPath,JSON.stringify(attestations))
      expect((await run(path)).systemMessage).toContain('named-campaigns')
      expect(await run(path)).toEqual({})
      attestations['live-production']!.actualReleasedFilms=0
      await writeFile(attPath,JSON.stringify(attestations))
      expect((await run(path)).systemMessage).toContain('live-production')
      await writeFile(attPath,'malformed evidence')
      await expect(run(path)).rejects.toThrow()
      await writeFile(path,JSON.stringify({...index,status:'PARTIAL'}))
      expect(await run(path)).toEqual({})
      expect(await run(join(directory,'missing.json'),{owner_stop:true})).toEqual({})
    }finally{await rm(directory,{recursive:true,force:true})}
  })
})
