#!/usr/bin/env node
// Pure synthetic consumer qualification; never loads gameplay, fixtures or M0.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {createHash} from 'node:crypto'
import {fileURLToPath,pathToFileURL} from 'node:url'
const HERE=path.dirname(fileURLToPath(import.meta.url)), S='/Users/zacheryspector/studio-scratch'
const CONFIG_SHA='c0f90ed7902ab5ecb3f8b2f48f2b8772adbc7cb2ad24ebaa303d440cd8077384'
const sha=b=>createHash('sha256').update(b).digest('hex')
const attrs=s=>[s.dev,s.ino,s.mode,s.nlink,s.size,s.mtimeNs.toString(),s.ctimeNs.toString()]
function stable(p,cap){
 assert.ok(path.isAbsolute(p)&&fs.realpathSync(p)===p,'physical named file')
 const before=fs.lstatSync(p,{bigint:true});assert.ok(before.isFile()&&before.nlink===1n&&before.size<=BigInt(cap),'regular bounded input')
 const fd=fs.openSync(p,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW)
 try{assert.deepEqual(attrs(fs.fstatSync(fd,{bigint:true})),attrs(before));const b=fs.readFileSync(fd);assert.ok(b.length<=cap&&BigInt(b.length)===before.size);assert.deepEqual(attrs(fs.fstatSync(fd,{bigint:true})),attrs(before));assert.deepEqual(attrs(fs.lstatSync(p,{bigint:true})),attrs(before));return b}finally{fs.closeSync(fd)}
}
function pinned(r,cap=131072){assert.deepEqual(Object.keys(r).sort(),['bytes','path','sha256']);assert.ok(Number.isSafeInteger(r.bytes)&&r.bytes>0&&r.bytes<=cap);const b=stable(r.path,cap);assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256);return b}
function json(r,cap){return JSON.parse(pinned(r,cap))}
function write(p,b,cap){assert.ok(b.length<=cap);const fd=fs.openSync(p,fs.constants.O_WRONLY|fs.constants.O_CREAT|fs.constants.O_EXCL|fs.constants.O_NOFOLLOW,0o600);try{fs.writeFileSync(fd,b);fs.fsyncSync(fd)}finally{fs.closeSync(fd)}assert.deepEqual(stable(p,cap),b);return {path:p,bytes:b.length,sha256:sha(b)}}
assert.equal(process.argv.length,4,'external grant path and SHA only')
assert.ok(path.isAbsolute(process.argv[2])&&process.argv[2].startsWith(S+'/'),'external grant scratch path')
const gr=stable(process.argv[2],131072);assert.equal(sha(gr),process.argv[3]);const grant=JSON.parse(gr)
assert.equal(grant.schema,'1370-root-r3-ordering-controls-once-grant/v1');assert.equal(grant.executionAuthorization,true)
assert.equal(grant.scope,'PURE_SYNTHETIC_ORDERING_CONSUMER_18_CASES_ONLY');assert.equal(grant.oneAggregateRun,true);assert.equal(grant.automaticRetry,false)
const cb=stable(path.join(HERE,'CONFIG.json'),131072);assert.equal(sha(cb),CONFIG_SHA);const config=JSON.parse(cb)
assert.deepEqual(grant.bounds,config.bounds);assert.equal(grant.clockEnforcedByOriginalRecordedRoute,true)
assert.equal(grant.configSha256,CONFIG_SHA);assert.equal(grant.outputPath,config.outputPath)
const review=json(grant.sourceReview);assert.equal(review.decision,'ACCEPT_STATIC_R3_ORDERING_CONSUMER_CONTROLS_SOURCE_ONLY');assert.equal(review.executionAuthorization,false);assert.deepEqual(review.concreteFindings,[])
assert.equal(review.sourcePins['CONFIG.json'].sha256,CONFIG_SHA);assert.equal(review.sourcePins['CONFIG.json'].path,path.join(HERE,'CONFIG.json'))
const self=pinned(review.sourcePins['run-ordering-controls.mjs']);assert.equal(review.sourcePins['run-ordering-controls.mjs'].path,fileURLToPath(import.meta.url))
assert.deepEqual(grant.acceptedSourcePins,config.acceptedSourcePins);assert.deepEqual(grant.heldRootAdoption,config.heldRootAdoption)
const originalPins=json(config.acceptedSourcePins), adoption=json(config.heldRootAdoption), priorReview=json(config.heldIndependentSourceReview)
assert.equal(adoption.status,'ROOT_ADOPTED_HELD_SOURCE_R3_FIXTURE_RESOLVER_AND_TWO_ORDERING_REPAIRS');assert.equal(adoption.executionAuthorization,false);assert.deepEqual(adoption.sourcePins,config.acceptedSourcePins);assert.deepEqual(adoption.independentReview,config.heldIndependentSourceReview)
assert.equal(priorReview.executionAuthorization,false)
const inputs={};for(const [n,r] of Object.entries(config.inputs)){assert.deepEqual(originalPins.files[n],r);inputs[n]=pinned(r)}
const packet=JSON.parse(inputs['ORDERING-SOURCE-CASES.json']);assert.equal(packet.schema,'1370-m0-ordering-synthetic-source-inputs/v1');assert.equal(packet.claim,'SYNTHETIC_WITNESS_CONSUMER_INPUTS_NOT_GAME_STATES_OR_OBSERVED_RESULTS')
assert.deepEqual(packet.cases.map(c=>({id:c.id,expected:c.expected,assertion:c.assertion??null})),config.cases);assert.equal(packet.cases.length,18)
assert.equal(process.version,'v22.23.2');assert.equal(fs.realpathSync(process.execPath),grant.runtimeTools.node.path);pinned(grant.runtimeTools.node,134217728)
const compilerRole=grant.runtimeTools.typescript;const compilerBytes=pinned(compilerRole,16777216)
const compilerNamespace=await import(pathToFileURL(compilerRole.path).href);assert.deepEqual(stable(compilerRole.path,16777216),compilerBytes)
const ts=compilerNamespace.default??compilerNamespace;assert.equal(ts.version,'5.8.3');assert.equal(typeof ts.transpileModule,'function')
assert.ok(!fs.existsSync(config.outputPath)&&path.dirname(config.outputPath)===S,'fresh exact direct scratch output');fs.mkdirSync(config.outputPath,{mode:0o700})
const out=config.outputPath, generated={}
for(const [n,target] of [['ordering.ts','ordering.mjs'],['ordering-source-controls.ts','controls.mjs']]){
 const transformed=ts.transpileModule(inputs[n].toString('utf8'),{fileName:n,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022,sourceMap:false,inlineSourceMap:false}})
 assert.deepEqual((transformed.diagnostics??[]).filter(d=>d.category===ts.DiagnosticCategory.Error),[],'compiler transform errors never RED')
 let code=transformed.outputText
 if(n==='ordering-source-controls.ts'){assert.equal(code.split("'./ordering.js'").length-1,1,'one unchanged logical ordering dependency');code=code.replace("'./ordering.js'","'./ordering.mjs'")}
 generated[n]=write(path.join(out,target),Buffer.from(code),config.bounds.compiledModuleBytes)
}
const controls=await import(pathToFileURL(path.join(out,'controls.mjs')).href)
const results=[]
for(const test of packet.cases){
 // Accepted helper itself requires AssertionError plus this precise assertion;
 // any loader/tool/premise/timeout/unknown error escapes and fails the aggregate.
 const actual=controls.runOrderingSourceControls({...packet,cases:[test]})
 assert.deepEqual(actual,[{id:test.id,expected:test.expected}])
 results.push({id:test.id,expected:test.expected,verdict:test.expected==='GREEN'?'ACCEPT_POSITIVE_CONSUMER_INPUT':'ACCEPT_EXPECTED_CONSUMER_ASSERTION',intendedAssertion:test.assertion??null,negativePredicate:test.expected==='RED'?'AssertionError && message.includes(intendedAssertion)':null})
}
assert.equal(results.filter(r=>r.expected==='GREEN').length,2);assert.equal(results.filter(r=>r.expected==='RED').length,16)
for(const [n,r] of Object.entries(config.inputs))assert.deepEqual(pinned(r),inputs[n],'accepted candidate/input unchanged')
for(const r of Object.values(generated))pinned(r)
assert.deepEqual(pinned(review.sourcePins['run-ordering-controls.mjs']),self)
const report={schema:'1370-r3-ordering-consumer-controls-result/v1',status:'PURE_ORDERING_CONSUMER_18_CASES_COMPLETED_PENDING_OBSERVED_REVIEW',sourceReview:grant.sourceReview,acceptedSourcePins:config.acceptedSourcePins,heldRootAdoption:config.heldRootAdoption,grantSha256:sha(gr),runtimeTools:grant.runtimeTools,generatedModules:generated,results,positiveCount:2,specificNegativeCount:16,candidateChanged:false,syntheticOnly:true,fixtureQualification:false,meaningfulCatchMutantRed:false,game:false,originalM0ReadOrWritten:false,executionAuthorization:false}
const rr=write(path.join(out,'RESULT.json'),Buffer.from(JSON.stringify(report,null,2)+'\n'),config.bounds.resultBytes);console.log(JSON.stringify({status:report.status,result:rr}))
