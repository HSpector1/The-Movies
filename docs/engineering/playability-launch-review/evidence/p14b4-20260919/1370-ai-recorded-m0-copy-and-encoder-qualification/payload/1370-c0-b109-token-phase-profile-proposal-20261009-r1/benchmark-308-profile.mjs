// UNRUN indexed308 phase profile. Instrumented candidate timings are distinct from the preserved unprofiled benchmark.
import assert from 'node:assert/strict'
import { readFileSync, lstatSync, realpathSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { performance } from 'node:perf_hooks'
import { pathToFileURL } from 'node:url'
const started=performance.now(),hash=b=>createHash('sha256').update(b).digest('hex')
const deadline=()=>assert.ok(performance.now()-started<60000,'STOP_BENCHMARK_CHILD_60_SECONDS')
const configRaw=readFileSync(new URL('./CONFIG.json',import.meta.url));assert.equal(hash(configRaw),process.argv[2]);const config=JSON.parse(configRaw)
assert.equal(process.version,'v20.20.2');assert.equal(process.execPath,config.nodePath)
for(const name of ['baseline','candidate','benchmark','index','acceptedCaptureReceipt','targetResult']){const r=config.roles[name];assert.equal(hash(readFileSync(r.path)),r.sha256)}
const accepted=JSON.parse(readFileSync(config.roles.acceptedCaptureReceipt.path)),result=JSON.parse(readFileSync(config.roles.targetResult.path))
assert.equal(accepted.decision,'ACCEPT_OBSERVED_EBG_ADOPTION_CLEAN_EXPLORATORY_ONLY');assert.equal(accepted.targetResultSha256,config.roles.targetResult.sha256)
assert.equal(result.status,'STAGE_PASS');assert.equal(result.child.exit,0);assert.equal(result.child.timedOut,false);assert.equal(result.cleanArtifacts.boundariesSha256,config.capture.sha256)
const index=JSON.parse(readFileSync(config.roles.index.path));assert.deepEqual(index.capture,config.capture);assert.equal(index.members.length,110)
const locator=index.members[1];assert.deepEqual(locator,config.member);assert.equal(locator.member,308)
const identity=()=>{assert.equal(realpathSync(config.capture.path),config.capture.path);const s=lstatSync(config.capture.path,{bigint:true});assert.ok(s.isFile()&&s.nlink===1n);return {dev:String(s.dev),ino:String(s.ino),size:String(s.size),mtimeNs:String(s.mtimeNs),ctimeNs:String(s.ctimeNs),mode:String(s.mode),nlink:String(s.nlink)}}
assert.deepEqual(identity(),config.currentCaptureMetadata)
const baseline=await import(pathToFileURL(config.roles.baseline.path)),candidate=await import(pathToFileURL(config.roles.candidate.path));deadline()
assert.equal(candidate.takeLastProfile(),null,'STOP_STALE_PROFILE_AT_START')
const fd=baseline.openRegular(config.capture.path)
let closed=false
try {
  const raw=baseline.readMember(fd,locator);assert.equal(hash(raw),config.member.sha256);assert.equal(raw.length,4228063)
  const row=baseline.parseRow(raw,308,'EBG','p13-public-commercial-adoption');assert.equal(row.originalState.market.tick,308);assert.equal(row.save.saveVersion,46)
  const rowBytes=raw.subarray(0,raw.length-1),stateBytes=baseline.boundedJson(row.originalState)
  assert.deepEqual(baseline.boundedJson(row),rowBytes);assert.equal(hash(stateBytes),row.originalStateSha256)
  const inputs=[['state',row.originalState,stateBytes],['wholeRow',row,rowBytes]],timings={}
  const profiles={},warmupProfiles={}
  for(const [label,value,expected] of inputs){
    timings[label]={baseline:[],candidate:[]}
    profiles[label]=[]
    for(let trial=-1;trial<3;trial++){
      const order=trial>=0&&trial%2===1?['candidate','baseline']:['baseline','candidate'];const outputs={}
      for(const arm of order){deadline();const encoder=arm==='baseline'?baseline.boundedJson:candidate.boundedJson;const begin=performance.now();outputs[arm]=encoder(value);const elapsed=performance.now()-begin;deadline();assert.deepEqual(outputs[arm],expected);if(trial>=0)timings[label][arm].push(elapsed)
        if(arm==='candidate'){
          const profile=candidate.takeLastProfile();assert.ok(profile&&profile.complete===true,'STOP_MISSING_COMPLETE_PROFILE')
          assert.deepEqual(Object.keys(profile),['complete','initEmissionMs','joinMs','bufferMs','phaseSumMs','internalElapsedMs','encodedBytes'])
          for(const name of ['initEmissionMs','joinMs','bufferMs','phaseSumMs','internalElapsedMs'])assert.ok(Number.isFinite(profile[name])&&profile[name]>=0,'STOP_INVALID_PROFILE_DURATION')
          assert.equal(profile.encodedBytes,expected.length,'STOP_PROFILE_RESULT_BYTES')
          assert.ok(Math.abs(profile.phaseSumMs-profile.internalElapsedMs)<=0.000001,'STOP_PROFILE_SUM')
          assert.ok(elapsed-profile.internalElapsedMs>=-0.000001,'STOP_PROFILE_OUTSIDE_INTERVAL')
          assert.equal(candidate.takeLastProfile(),null,'STOP_PROFILE_NOT_CONSUMED')
          const recorded={...profile,outerElapsedMs:elapsed,outsidePhasesMs:elapsed-profile.internalElapsedMs}
          if(trial>=0)profiles[label].push(recorded);else warmupProfiles[label]=recorded
        }
      }
      assert.deepEqual(outputs.baseline,outputs.candidate);assert.deepEqual(baseline.boundedJson(row),rowBytes);assert.deepEqual(baseline.boundedJson(row.originalState),stateBytes);baseline.checkRegular(fd);assert.deepEqual(identity(),config.currentCaptureMetadata)
    }
  }
  const median=xs=>[...xs].sort((a,b)=>a-b)[1];const medians={}
  for(const label of ['state','wholeRow'])medians[label]=Object.fromEntries(['baseline','candidate'].map(a=>[a,median(timings[label][a])]))
  const estimate=arm=>110*(16*medians.state[arm]+9*medians.wholeRow[arm])/1000
  const phaseMedians=Object.fromEntries(['state','wholeRow'].map(label=>[label,Object.fromEntries(['initEmissionMs','joinMs','bufferMs','phaseSumMs','internalElapsedMs','outsidePhasesMs'].map(name=>[name,median(profiles[label].map(p=>p[name]))]))]))
  baseline.closeRegular(fd);closed=true;assert.deepEqual(identity(),config.currentCaptureMetadata);deadline()
  const report={status:'PURE_INDEXED308_ENCODER_PHASE_PROFILE_COMPLETE',timingsMs:timings,mediansMs:medians,profiledWeighted110EncoderOnlySeconds:{baseline:estimate('baseline'),candidate:estimate('candidate')},formula:'110*(16*stateMedianMs+9*wholeRowMedianMs)/1000',candidatePhaseProfilesMs:profiles,candidateWarmupPhaseProfilesMs:warmupProfiles,candidatePhaseMediansMs:phaseMedians,profileContract:'initEmission includes original initialization+emit; join and Buffer are separately timed. Exactly four bound clock calls per candidate invocation; one fixed owned record consumed once after success. Phase medians need not sum to median total.',uninstrumentedTimingProvenance:{receiptSha256:config.roles.unprofiledTimingReceipt.sha256,reportSha256:config.roles.unprofiledTimingReport.sha256,sourceSha256:config.roles.unprofiledBenchmark.sha256,comparison:'Separate prior measurement only; no controlled cross-session comparison.'},fixture:{member:308,rawBytes:raw.length,rawSha256:hash(raw),stateBytes:stateBytes.length,stateSha256:hash(stateBytes)},sourceRoles:config.roles,captureWholeHashProvenance:'PRIOR_ACCEPTED_ONLY_NOT_REHASHED_HERE',currentCaptureMetadataRole:'CURRENT_PREPARATION_OBSERVATION_NOT_RETROSPECTIVE_OLD_FILE_IDENTITY',retainedReaderClosedExact:true,rawAndStateExactEachTrial:true,inputPurityEachTrial:true,elapsedSeconds:(performance.now()-started)/1000,game:false,saveImports:false,executionAuthorization:false,claimLimit:'Instrumented candidate phase timings on the same early308 fixture only. Clock calls, profile bookkeeping, scheduling and GC perturb timing; a measured phase includes costs/GC within that interval and does not prove the unprofiled runtime root cause. OutsidePhases includes wrapper/clock/profile publication overhead, not a calibrated overhead correction. Independent phase medians need not sum to median total. Prior uninstrumented timing is preserved separately; no controlled cross-session variant comparison, end-to-end109 prediction, later-size feasibility, gameplay/source admission, integration or automatic repeat. B109300/375/390/full110 complete admissions unchanged.'}
  const encoded=JSON.stringify(report)+'\n';assert.ok(Buffer.byteLength(encoded)<=1024**2,'STOP_REPORT_CAP');process.stdout.write(encoded)
} finally {if(!closed)baseline.closeRegular(fd)}
