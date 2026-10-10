import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'
import {canonicalM0Resolver} from './canonical-resolver.mjs'
const root=fileURLToPath(new URL('.',import.meta.url))
const binding=JSON.parse(readFileSync(new URL('./RESOLUTION-SOURCE-BINDING.json',import.meta.url),'utf8'))
// The held mutant uses the same canonical logical talentMarket ID in its own
// separate recorded child; all import cycles and M0ObserverError stay singular.
if(process.env.M0_WIRING_ARM==='typed-catch-mutant'){
  binding.derivatives['src/core/talentMarket.ts']=binding.typedCatchMutant
}
export default {
  root,plugins:[canonicalM0Resolver(binding)],
  resolve:{alias:{vitest:resolve(binding.dependencyRoot,'vitest/dist/index.js')}},
  cacheDir:process.env.M0_WIRING_CACHE,
  server:{fs:{allow:[root,binding.mirrorRoot,binding.dependencyRoot]}},
  test:{include:['core.test.ts'],environment:'node',pool:'forks',
    poolOptions:{forks:{singleFork:true}},fileParallelism:false},
}
