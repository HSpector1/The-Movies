// Fresh recorded route entrypoint; accepted fixture/control implementations stay pinned separately.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {it} from 'vitest'
import {generateNaturalBoundaries,buildVariants} from './fixtures.js'
import {runFullBodyWiringControls} from './controls/full-body-controls.js'
const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex')
it('recorded M0 whole-body fixture generation or controls',()=>{
 const binding=JSON.parse(readFileSync(process.env.M0_WIRING_ROUTE!,'utf8'))
 assert.equal(binding.operationalHead,'f2f97c622db7f5332164b790d1646355e89c00f4')
 assert.equal(binding.productionSourceTree,'13880d9b0ba72aff5d4c5bcf5d12fe682c5de554')
 assert.equal(binding.genuineTypesAdoptionAuthenticated,true)
 const write=(value:unknown)=>{const raw=Buffer.from(JSON.stringify(value));assert.ok(raw.length<=131072);writeFileSync(binding.controlResult,raw,{flag:'wx'})}
 if(process.env.M0_WIRING_PHASE==='fixture-generation'){
  assert.equal(process.env.M0_WIRING_ARM,'baseline')
  const natural=generateNaturalBoundaries(),fixtures=buildVariants(natural)
  const raw=Buffer.from(JSON.stringify({schema:'1370-m0-boundary-fixtures/v1',natural,fixtures,
   synthetic:['opportunity196:same-week-real-market-replay-and-real-reservation',
    'opportunity208:real-proposal-revision-and-real-project-attachment',
    'offSubject:real-non-target-open-case-trigger-parameter',
    'offIssuer196:player-ID-business-parameter-if-no-fourth-rival']}))
  assert.equal(binding.fixtureArtifactBytes,67108864)
  assert.ok(raw.length<=binding.fixtureArtifactBytes,'root-adopted aggregate fixture packet output bound')
  writeFileSync(binding.fixtureOutput,raw,{flag:'wx'})
  const receipt={schema:'1370-fullfunction-real-boundary-generation/v1',sourcePhase:'tick.before.advanceTalentMarketWeek',naturalWeeks:[196,197,208],artifact:{path:binding.fixtureOutput,bytes:raw.length,sha256:sha(raw)},generatedSourceRoles:binding.sourceRoles,actualNaturalReturnedWeeksUsedAsBoundaries:false,syntheticOutcomeClaims:false,outcome:'GENERATED_UNADMITTED'}
  writeFileSync(binding.fixtureReceipt,JSON.stringify(receipt),{flag:'wx'});write({status:'REAL_BOUNDARY_AND_EXPLICIT_VARIANTS_GENERATED_UNADMITTED',fixture:receipt.artifact})
 }else{
  assert.equal(process.env.M0_WIRING_PHASE,'controls')
  const raw=readFileSync(binding.fixtureRole.path)
  assert.equal(raw.length,binding.fixtureRole.bytes);assert.equal(sha(raw),binding.fixtureRole.sha256)
  const packet=JSON.parse(raw.toString('utf8'));assert.equal(packet.schema,'1370-m0-boundary-fixtures/v1')
  try{
   runFullBodyWiringControls(packet.fixtures)
   assert.equal(process.env.M0_WIRING_ARM,'baseline','typed catch mutant unexpectedly passed')
   write({status:'BASELINE_FULL_FUNCTION_CONTROLS_PASSED',fixture:binding.fixtureRole})
  }catch(error){
   if(process.env.M0_WIRING_ARM!=='typed-catch-mutant')throw error
   assert.ok(error instanceof assert.AssertionError,'mutant loader or gameplay failures never RED')
   assert.equal(error.code,'ERR_ASSERTION');assert.equal(error.operator,'throws')
   assert.equal(error.message,'Missing expected exception: actual recorder failure must cross actual submitProposal catch')
   assert.equal((error as any).m0FullBodyFaultKind,'row-cap','first exact typed observer fault')
   assert.equal(error.actual,undefined)
   assert.ok(error.stack?.includes('/controls/full-body-controls.ts'),'actual complete consumer assertion source')
   write({status:'EXPECTED_REAL_TYPED_CATCH_PROPAGATION_ASSERTION_RED',fixture:binding.fixtureRole,faultKind:'row-cap',error:{name:error.name,code:error.code,operator:error.operator,message:error.message,actualUndefined:true,stack:error.stack!.slice(0,8192)},earlierNonfaultFullFunctionChecksPassedByExactSequentialSource:true,loaderOrOtherErrorAccepted:false})
  }
 }
},Number(process.env.M0_WIRING_TEST_TIMEOUT_MS))
