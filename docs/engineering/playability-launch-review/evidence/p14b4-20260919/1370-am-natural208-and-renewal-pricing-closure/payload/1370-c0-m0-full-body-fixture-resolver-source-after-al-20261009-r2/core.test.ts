// Registered source entrypoint. Never invoked by the source builder.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {it} from 'vitest'
import {generateNaturalBoundaries,buildVariants} from './fixtures.js'
import {runFullBodyWiringControls} from './controls/full-body-controls.js'
const sha=(raw:Buffer)=>createHash('sha256').update(raw).digest('hex')
it('recorded M0 whole-body fixture generation or controls',()=>{
  const binding=JSON.parse(readFileSync(process.env.M0_WIRING_ROUTE!,'utf8'))
  // This binding is supplied only by the parent's exact recorded route. No
  // independent method in this source supplies operational or scientific authority.
  assert.equal(binding.operationalHead,'8cb704e2f18e6a635943893422c9cfdc206e106d')
  assert.equal(binding.productionSourceTree,'13880d9b0ba72aff5d4c5bcf5d12fe682c5de554')
  if(process.env.M0_WIRING_PHASE==='fixture-generation'){
    const natural=generateNaturalBoundaries(),fixtures=buildVariants(natural)
    const raw=Buffer.from(JSON.stringify({schema:'1370-m0-boundary-fixtures/v1',natural,fixtures,
      synthetic:['opportunity196:same-week-real-market-replay-and-real-reservation',
        'opportunity208:real-proposal-revision-and-real-project-attachment',
        'offSubject:real-non-target-open-case-trigger-parameter',
        'offIssuer196:player-ID-business-parameter-if-no-fourth-rival']}))
    assert.ok(Number.isSafeInteger(binding.fixtureArtifactBytes)&&binding.fixtureArtifactBytes>0)
    assert.ok(raw.length<=binding.fixtureArtifactBytes,'existing admitted artifact bound')
    writeFileSync(binding.fixtureOutput,raw,{flag:'wx'})
    writeFileSync(binding.fixtureReceipt,JSON.stringify({sourcePhase:'tick.before.advanceTalentMarketWeek',
      naturalWeeks:[196,197,208],artifact:{path:binding.fixtureOutput,bytes:raw.length,sha256:sha(raw)},
      generatedSourceRoles:binding.sourceRoles,actualNaturalReturnedWeeksUsedAsBoundaries:false,
      outcome:'GENERATED_UNADMITTED',syntheticOutcomeClaims:false}),{flag:'wx'})
  }else{
    assert.equal(process.env.M0_WIRING_PHASE,'controls')
    const raw=readFileSync(binding.fixtureRole.path)
    assert.equal(raw.length,binding.fixtureRole.bytes);assert.equal(sha(raw),binding.fixtureRole.sha256)
    const packet=JSON.parse(raw.toString('utf8'))
    assert.equal(packet.schema,'1370-m0-boundary-fixtures/v1')
    runFullBodyWiringControls(packet.fixtures)
  }
},Number(process.env.M0_WIRING_TEST_TIMEOUT_MS))
