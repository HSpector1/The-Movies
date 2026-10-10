#!/usr/bin/env node
// Complete source-only worker template; CONFIG hash is bound only after final
// reviewed implementation and control roles exist. Never imports game modules.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {createHash} from 'node:crypto'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {TextDecoder} from 'node:util'
const HERE=path.dirname(fileURLToPath(import.meta.url)),S='/Users/zacheryspector/studio-scratch'
const CONFIG_SHA='5a5c267d6a561277cfe1f738e6400f08896d4b36ddd0a67f3b88f86c5473adec'
const sha=b=>createHash('sha256').update(b).digest('hex')
const utf8=b=>new TextDecoder('utf-8',{fatal:true}).decode(b)
const attrs=s=>[s.dev,s.ino,s.mode,s.nlink,s.size,s.mtimeNs,s.ctimeNs]
function stable(p,cap){
 assert.ok(path.isAbsolute(p)&&fs.realpathSync(p)===p,'physical named file')
 const before=fs.lstatSync(p,{bigint:true});assert.ok(before.isFile()&&before.nlink===1n&&before.size<=BigInt(cap),'regular bounded input')
 const fd=fs.openSync(p,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW)
 try{
  assert.deepEqual(attrs(fs.fstatSync(fd,{bigint:true})),attrs(before))
  const b=fs.readFileSync(fd);assert.ok(b.length<=cap&&BigInt(b.length)===before.size)
  assert.deepEqual(attrs(fs.fstatSync(fd,{bigint:true})),attrs(before));assert.deepEqual(attrs(fs.lstatSync(p,{bigint:true})),attrs(before));return b
 }finally{fs.closeSync(fd)}
}
function pinned(r,cap=131072){
 assert.deepEqual(Object.keys(r).sort(),['bytes','path','sha256'])
 assert.ok(Number.isSafeInteger(r.bytes)&&r.bytes>0&&r.bytes<=cap)
 const b=stable(r.path,cap);assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256);return b
}
function json(r,cap){return JSON.parse(utf8(pinned(r,cap)))}
function write(p,b,cap){
 assert.ok(b.length<=cap,'emitted module/report cap')
 const fd=fs.openSync(p,fs.constants.O_WRONLY|fs.constants.O_CREAT|fs.constants.O_EXCL|fs.constants.O_NOFOLLOW,0o600)
 try{fs.writeFileSync(fd,b);fs.fsyncSync(fd)}finally{fs.closeSync(fd)}
 assert.deepEqual(stable(p,cap),b);return {path:p,bytes:b.length,sha256:sha(b)}
}
assert.equal(process.argv.length,4,'external grant path and SHA only')
assert.ok(path.isAbsolute(process.argv[2])&&process.argv[2].startsWith(S+'/'),'external grant scratch path')
const gb=stable(process.argv[2],131072);assert.equal(sha(gb),process.argv[3]);const grant=JSON.parse(utf8(gb))
assert.equal(grant.schema,'1370-root-native-observer-pure-controls-once-grant/v1')
assert.equal(grant.executionAuthorization,true);assert.equal(grant.oneAggregateRun,true);assert.equal(grant.automaticRetry,false)
assert.equal(grant.scope,'PURE_PUBLIC_NATIVE_OBSERVER_CONTROLS_ONLY')
const cb=stable(path.join(HERE,'CONFIG.json'),131072);assert.equal(sha(cb),CONFIG_SHA);const config=JSON.parse(utf8(cb))
assert.equal(config.schema,'1370-native-observer-pure-controls-recorded-config/v1');assert.equal(config.executionAuthorization,false)
assert.equal(grant.configSha256,CONFIG_SHA);assert.deepEqual(grant.bounds,config.bounds)
assert.equal(grant.clockEnforcedByOriginalRecordedRoute,true);assert.equal(grant.outputPath,config.outputPath)
const review=json(grant.sourceReview)
assert.equal(review.schema,'1370-native-observer-pure-controls-recorded-route-independent-source-review/v1')
assert.equal(review.decision,'ACCEPT_STATIC_NATIVE_OBSERVER_PURE_CONTROLS_RECORDED_ROUTE_SOURCE_ONLY')
assert.equal(review.executionAuthorization,false);assert.deepEqual(review.concreteFindings,[])
assert.deepEqual(review.sourceManifest,grant.sourcePins)
const manifest=json(grant.sourcePins)
assert.equal(manifest.schema,'1370-native-observer-pure-controls-recorded-route-source-pins/v1');assert.equal(manifest.executionAuthorization,false)
assert.deepEqual(manifest.files['CONFIG.json'],grant.config);assert.deepEqual(manifest.files['CONFIG.json'],review.sourcePins['CONFIG.json'])
const selfrole=manifest.files['run-native-observer-recorded-controls.mjs'];assert.equal(selfrole.path,fileURLToPath(import.meta.url))
const self=pinned(selfrole)
for(const name of config.reviewAliases){
 const wanted=manifest.files[name]??manifest.externalInputs[name]
 assert.ok(wanted);assert.deepEqual(review.sourcePins[name],wanted);assert.deepEqual(review.routeSourcePins[name],wanted)
}
for(const [name,r] of Object.entries(config.inputs))assert.deepEqual(manifest.externalInputs[name],r)
const implementationManifest=json(config.implementationSourcePins)
const implementationReview=json(config.implementationSourceReview)
assert.equal(implementationReview.schema,'1370-native-observer-implementation-independent-source-review/v1')
assert.equal(implementationReview.executionAuthorization,false);assert.deepEqual(implementationReview.concreteFindings,[]);assert.equal(implementationReview.decision,config.implementationReviewDecision)
assert.deepEqual(implementationReview.sourceManifest,config.implementationSourcePins)
const diagnosticManifest=json(config.diagnosticSourceManifest),diagnosticReview=json(config.diagnosticSourceReview)
assert.equal(diagnosticReview.schema,'1370-native-refusal-diagnostic-independent-source-review/v1')
assert.equal(diagnosticReview.decision,config.diagnosticReviewDecision);assert.equal(diagnosticReview.executionAuthorization,false);assert.deepEqual(diagnosticReview.concreteFindings,[])
assert.deepEqual(diagnosticReview.sourceManifest,config.diagnosticSourceManifest)
for(const [name,r] of Object.entries({'m0ObserverRowDiagnostic.mjs':config.inputs['m0ObserverRowDiagnostic.mjs'],'INTERFACE.json':config.diagnosticInterface})){
 assert.deepEqual(diagnosticManifest.files[name],r);assert.deepEqual(diagnosticReview.sourcePins[name],r);assert.deepEqual(diagnosticReview.routeSourcePins[name],r);pinned(r)
}
const diagnosticDesign=json(config.diagnosticDesignAdoption)
assert.equal(diagnosticDesign.executionAuthorization,false);assert.deepEqual(diagnosticReview.rootDesignAdoption,config.diagnosticDesignAdoption)
assert.equal(diagnosticDesign.schema,'1370-root-native-refusal-diagnostic-design-adoption/v1')
for(const key of ['diagnosticSourceManifest','diagnosticSourceReview','diagnosticInterface','diagnosticDesignAdoption'])assert.deepEqual(config[key],grant[key])
const controlsManifest=json(config.controlsSourcePins),controlsReview=json(config.controlsSourceReview)
assert.equal(controlsReview.schema,'1370-native-observer-independent-controls-source-review/v1')
assert.equal(controlsReview.executionAuthorization,false);assert.deepEqual(controlsReview.concreteFindings,[]);assert.equal(controlsReview.decision,config.controlsReviewDecision)
assert.deepEqual(controlsReview.sourceManifest,config.controlsSourcePins)
for(const name of config.implementationInputNames){
 assert.deepEqual(config.inputs[name],implementationManifest.files[name]);assert.deepEqual(implementationReview.sourcePins[name],config.inputs[name])
}
for(const name of config.controlsInputNames){
 const originalName=name==='CONTROLS-CONTRACT.json'?'CONTRACT.json':name
 assert.deepEqual(config.inputs[name],controlsManifest.files[originalName]);assert.deepEqual(controlsReview.sourcePins[originalName],config.inputs[name])
}
const design=json(config.rootDesignAdoption);assert.deepEqual(config.rootDesignAdoption,grant.rootDesignAdoption)
assert.equal(design.schema,'1370-root-native-canonical-observer-design-adoption/v1')
assert.equal(design.status,'ROOT_ADOPTED_EXPLICIT_NATIVE_CANONICAL_REPRESENTATION_AND_ACCOUNTING_AMENDMENT_SOURCE_ONLY')
assert.equal(design.executionAuthorization,false);assert.equal(design.publicSourcePreparationAuthorized,true)
assert.deepEqual(config.api,grant.api);pinned(config.api)
const adoption=json(config.implementationControlsSourceAdoption);assert.deepEqual(config.implementationControlsSourceAdoption,grant.implementationControlsSourceAdoption)
assert.equal(adoption.schema,'1370-root-native-refusal-diagnostic-implementation-controls-source-adoption/v1')
assert.equal(adoption.status,'ROOT_ADOPTED_NATIVE_REFUSAL_DIAGNOSTIC_AND_AFFECTED_CONTROLS_SOURCE_ONLY')
assert.equal(adoption.executionAuthorization,false)
assert.deepEqual(adoption.prospectiveProtocol,config.prospectiveObservedContract)
assert.deepEqual(adoption.runtimeToolsObservation,config.runtimeToolsObservation)
assert.deepEqual(adoption.reviewedPriorStopAdoption,config.reviewedPriorStopAdoption)
const protocol=json(config.prospectiveObservedContract);assert.deepEqual(config.prospectiveObservedContract,grant.prospectiveObservedContract)
assert.equal(protocol.caseCount,config.caseCount);assert.equal(protocol.positiveCount,config.positiveCount);assert.equal(protocol.specificNegativeCount,config.specificNegativeCount)
assert.deepEqual(protocol.workerResultContract,config.inputs['CONTROLS-CONTRACT.json'])
assert.deepEqual(adoption.implementationSourcePins,config.implementationSourcePins);assert.deepEqual(adoption.implementationSourceReview,config.implementationSourceReview)
assert.deepEqual(adoption.controlsSourcePins,config.controlsSourcePins);assert.deepEqual(adoption.controlsSourceReview,config.controlsSourceReview)
assert.deepEqual(adoption.rootDesignAdoption,config.rootDesignAdoption);assert.deepEqual(adoption.api,config.api);assert.deepEqual(adoption.apiAdoption,config.apiAdoption);assert.deepEqual(adoption.supplementAdoption,config.supplementAdoption)
for(const key of ['diagnosticSourceManifest','diagnosticSourceReview','diagnosticInterface','diagnosticDesignAdoption'])assert.deepEqual(adoption[key],config[key])
assert.equal(adoption.caseCount,config.caseCount);assert.equal(adoption.positiveCount,config.positiveCount);assert.equal(adoption.specificNegativeCount,config.specificNegativeCount)
const inputs={};for(const [name,r] of Object.entries(config.inputs))inputs[name]=pinned(r)
const matrix=JSON.parse(utf8(inputs['MATRIX.json'])),contract=JSON.parse(utf8(inputs['CONTROLS-CONTRACT.json']))
assert.equal(matrix.cases.length,config.caseCount)
assert.equal(matrix.cases.filter(x=>x.expected==='GREEN').length,config.positiveCount)
assert.equal(matrix.cases.filter(x=>x.expected==='RED').length,config.specificNegativeCount)
assert.equal(new Set(matrix.cases.map(x=>x.id)).size,matrix.cases.length)
assert.deepEqual(contract.originalNativeImplementationAuthorities.api,config.api);assert.deepEqual(contract.originalNativeImplementationAuthorities.implementationSourceManifest,config.implementationSourcePins)
assert.deepEqual(contract.authorities.nativeImplementationSourceManifest,config.implementationSourcePins);assert.deepEqual(contract.authorities.nativeImplementationIndependentReview,config.implementationSourceReview)
for(const key of ['diagnosticSourceManifest','diagnosticInterface','diagnosticDesignAdoption'])assert.deepEqual(contract.authorities[key],config[key])
assert.equal(contract.authorities.diagnosticIndependentSourceReview,null,'sealed controls require genuine review via external adoption, not a fabricated receipt')
for(const [name,r] of Object.entries(contract.requiredInputs)){
 if(config.inputs[name])assert.deepEqual(r,config.inputs[name]);pinned(r)
}
const ii=json(config.implementationInterface);assert.deepEqual(ii.physicalCaps,{count:512,rowIncludingNewline:16384,totalIncludingNewlines:2097152})
const apiAdoption=json(config.apiAdoption),supplement=json(config.supplementAdoption)
assert.deepEqual(config.apiAdoption,grant.apiAdoption);assert.deepEqual(config.supplementAdoption,grant.supplementAdoption)
assert.equal(apiAdoption.schema,'1370-root-native-observer-api-adoption/v1');assert.equal(apiAdoption.executionAuthorization,false)
assert.deepEqual(apiAdoption.api,config.api);assert.deepEqual(apiAdoption.rootDesignAdoption,config.rootDesignAdoption)
assert.equal(supplement.executionAuthorization,false);assert.equal(supplement.schema,'1370-root-diagnostic-codec-supplement-adoption/v1');assert.equal(supplement.status,'ROOT_ADOPTED_BOUNDED_DIAGNOSTIC_CODEC_SUPPLEMENT_FOR_PUBLIC_IMPLEMENTATION');assert.deepEqual(supplement.apiAdoption,config.apiAdoption)
const originalPins=json(config.originalWitnessSourcePins),originalRole=config.inputs['original-m0FeasibilityWitness.ts'];assert.deepEqual(implementationManifest.files['BASELINE-m0FeasibilityWitness.ts'],originalRole);assert.equal(originalPins.files['m0FeasibilityWitness.ts'].bytes,originalRole.bytes);assert.equal(originalPins.files['m0FeasibilityWitness.ts'].sha256,originalRole.sha256);pinned(originalPins.files['m0FeasibilityWitness.ts'])
assert.equal(contract.result.caseCount,config.caseCount);assert.equal(contract.result.positiveCount,config.positiveCount);assert.equal(contract.result.specificNegativeCount,config.specificNegativeCount)
assert.equal(process.version,'v22.23.2');assert.equal(fs.realpathSync(process.execPath),grant.runtimeTools.node.path)
assert.deepEqual(grant.runtimeTools,config.runtimeTools)
pinned(grant.runtimeTools.node,134217728)
for(const name of ['python','helper'])pinned(grant.runtimeTools[name])
assert.deepEqual(grant.runtimeTools.typescript,config.typescriptCompiler)
const compilerBytes=pinned(config.typescriptCompiler,16777216)
assert.deepEqual(grant.runtimeTools.typescriptPackage,config.typescriptPackage)
const compilerPackageBytes=pinned(config.typescriptPackage)
assert.equal(JSON.parse(utf8(compilerPackageBytes)).version,'5.9.3')
const compilerNamespace=await import(pathToFileURL(config.typescriptCompiler.path).href)
assert.deepEqual(stable(config.typescriptCompiler.path,16777216),compilerBytes)
const ts=compilerNamespace.default??compilerNamespace
assert.equal(ts.version,'5.9.3');assert.equal(typeof ts.transpileModule,'function')
assert.ok(!fs.existsSync(config.outputPath)&&path.dirname(config.outputPath)===S,'fresh direct owned output')
fs.mkdirSync(config.outputPath,{mode:0o700})
const generated={}
const graph={
 'm0NativeObserverRows.mjs':[], 'm0ObserverRowDiagnostic.mjs':['./m0NativeObserverRows.mjs'],
 'run-native-observer-controls.mjs':['node:assert/strict'],
 'm0TraceCodec.mjs':['node:zlib','node:assert/strict'], 'traceSequences.mjs':[]
}
for(const name of Object.keys(graph)){
 const code=utf8(inputs[name]),specs=[...code.matchAll(/(?:\bfrom\s*|\bimport\s*)(['"])([^'"]+)\1/g)].map(m=>m[2])
 assert.deepEqual(specs,graph[name],'exact copied pure graph');assert.ok(!/\bimport\s*\(/.test(code))
 generated[name]=write(path.join(config.outputPath,name),inputs[name],config.bounds.compiledModuleBytes)
}
const compiledGraph={
 'original-m0FeasibilityWitness.ts':[], 'm0FeasibilityWitness-native.ts':['./m0NativeObserverRows.mjs'],
 'ordering.ts':['node:assert/strict','./traceSequences.mjs'],
 'ordering-source-controls.ts':['./m0NativeObserverRows.mjs','node:assert/strict','./m0TraceCodec.mjs','./ordering.mjs']
}
for(const [name,specs]of Object.entries(compiledGraph)){
 let source=utf8(inputs[name]);if(name==='ordering-source-controls.ts'){
  assert.equal(source.split("'./ordering.js'").length-1,1);source=source.replace("'./ordering.js'","'./ordering.mjs'")
 }
 const transformed=ts.transpileModule(source,{fileName:name,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022,sourceMap:false,inlineSourceMap:false}})
 assert.deepEqual((transformed.diagnostics??[]).filter(d=>d.category===ts.DiagnosticCategory.Error),[],'compiler errors never RED')
 const code=transformed.outputText;assert.deepEqual([...code.matchAll(/(?:\bfrom\s*|\bimport\s*)(['"])([^'"]+)\1/g)].map(m=>m[2]),specs);assert.ok(!/\bimport\s*\(/.test(code))
 generated[name]=write(path.join(config.outputPath,name.replace(/\.ts$/,'.mjs')),Buffer.from(code,'utf8'),config.bounds.compiledModuleBytes)
}
const module=async n=>await import(pathToFileURL(path.join(config.outputPath,n)).href)
const codec=await module('m0NativeObserverRows.mjs'),diagnostic=await module('m0ObserverRowDiagnostic.mjs'),witness=await module('m0FeasibilityWitness-native.mjs'),original=await module('original-m0FeasibilityWitness.mjs'),ordering=await module('ordering.mjs'),orderingControls=await module('ordering-source-controls.mjs'),controls=await module('run-native-observer-controls.mjs')
const report=controls.runNativeObserverControls({createObserverFailureLatch:codec.createObserverFailureLatch,createNativeRowCodec:codec.createNativeRowCodec,NativeObserverFormatError:codec.NativeObserverFormatError,createM0FeasibilitySink:witness.createM0FeasibilitySink,originalCreateM0FeasibilitySink:original.createM0FeasibilitySink,createObserverRowDiagnostic:diagnostic.createObserverRowDiagnostic,runObserverArm:diagnostic.runObserverArm,assertNativeEvaluationBinding:ordering.assertNativeEvaluationBinding,runOrderingSourceControls:orderingControls.runOrderingSourceControls,orderingPacket:JSON.parse(utf8(inputs['ORDERING-SOURCE-CASES.json']))})
assert.equal(report.schema,contract.result.schema);assert.equal(report.status,contract.result.status)
assert.equal(report.executionAuthorization,false);assert.equal(report.game,false);assert.equal(report.originalM0ReadOrWritten,false)
assert.equal(report.caseCount,config.caseCount);assert.equal(report.originalOrderingCases,18);assert.equal(report.results.length,config.caseCount);assert.equal(report.positiveCount,config.positiveCount);assert.equal(report.specificNegativeCount,config.specificNegativeCount)
assert.deepEqual(report.results,matrix.cases.map(c=>({...c,verdict:c.expected==='GREEN'?'ACCEPT_POSITIVE':'ACCEPT_SPECIFIC_REFUSAL'})),'every exact ordered intended control row; no generic success')
for(const [name,r] of Object.entries(config.inputs))assert.deepEqual(pinned(r),inputs[name],'candidate/control/input bytes unchanged')
for(const r of Object.values(generated))pinned(r)
assert.deepEqual(pinned(selfrole),self)
assert.deepEqual(pinned(config.typescriptCompiler,16777216),compilerBytes,'compiler bytes unchanged after actual controls')
assert.deepEqual(pinned(config.typescriptPackage),compilerPackageBytes,'compiler package unchanged after actual controls')
pinned(grant.runtimeTools.node,134217728)
for(const name of ['python','helper'])pinned(grant.runtimeTools[name])
const final={...report,caseCount:report.results.length,privateM0ReadOrWritten:false,fullQualificationAccepted:false,sourceReview:grant.sourceReview,sourceManifest:grant.sourcePins,implementationSourcePins:config.implementationSourcePins,implementationSourceReview:config.implementationSourceReview,diagnosticSourceManifest:config.diagnosticSourceManifest,diagnosticSourceReview:config.diagnosticSourceReview,diagnosticInterface:config.diagnosticInterface,diagnosticDesignAdoption:config.diagnosticDesignAdoption,prospectiveObservedContract:config.prospectiveObservedContract,controlsSourcePins:config.controlsSourcePins,controlsSourceReview:config.controlsSourceReview,rootDesignAdoption:config.rootDesignAdoption,inputRoles:config.inputs,runtimeTools:grant.runtimeTools,generatedModules:generated,grantSha256:sha(gb)}
const rr=write(path.join(config.outputPath,'CONTROLS-RESULT.json'),Buffer.from(JSON.stringify(final,null,2)+'\n','utf8'),config.bounds.resultBytes)
console.log(JSON.stringify(final))
