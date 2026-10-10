import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'
import {canonicalM0Resolver} from '/Users/zacheryspector/studio-scratch/1370-c0-m0-full-body-fixture-resolver-source-after-al-20261009-r3/canonical-resolver.mjs'
import {canonicalTypeScriptTransform} from '/Users/zacheryspector/studio-scratch/1370-aq-m0-fullfunction-native-refusal-diagnostic-source-20261010-r3/canonical-typescript-transform.mjs'
const root=fileURLToPath(new URL('.',import.meta.url))
const binding=JSON.parse(readFileSync(new URL('./RESOLUTION-SOURCE-BINDING.json',import.meta.url),'utf8'))
if(process.env.M0_WIRING_ARM==='typed-catch-mutant')binding.derivatives['src/core/talentMarket.ts']=binding.typedCatchMutant
export default {root,plugins:[canonicalM0Resolver(binding),canonicalTypeScriptTransform(binding)],resolve:{alias:{vitest:resolve(binding.dependencyRoot,'vitest/dist/index.js')}},cacheDir:process.env.M0_WIRING_CACHE,server:{fs:{allow:[root,binding.mirrorRoot,binding.dependencyRoot]}},test:{include:['core.test.ts'],environment:'node',pool:'forks',poolOptions:{forks:{singleFork:true}},fileParallelism:false}}
