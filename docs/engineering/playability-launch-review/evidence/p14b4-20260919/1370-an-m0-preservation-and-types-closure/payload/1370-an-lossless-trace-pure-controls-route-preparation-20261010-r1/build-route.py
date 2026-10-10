from pathlib import Path
import json,hashlib,os,ast,difflib
S=Path('/Users/zacheryspector/studio-scratch')
PREP=Path(__file__).parent
OUT=S/'1370-an-lossless-trace-pure-controls-recorded-route-source-20261010-r1'
BASE=S/'1370-an-exact-identity-json-controls-recorded-route-source-20261010-r2'
IMPL=S/'1370-an-lossless-trace-codec-consumers-source-20261010-r3'
TEST=S/'1370-an-lossless-trace-independent-controls-source-20261010-r2'
AN=S/'1370-an-root-continuation-20261009-r1'
PARENT=S/'1370-an-lossless-trace-pure-controls-parent-recorded-20261010-r1'
RESULT=S/'1370-an-lossless-trace-pure-controls-results-20261010-r1'
REC=S/'1370-an-lossless-trace-pure-controls-recorder-results-20261010-r1'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def auth(p,n,h):
 r=role(p);assert r['bytes']==n and r['sha256']==h,r
 return json.loads(p.read_bytes()),r
def obj(p):return json.loads(p.read_bytes())
def write(name,v):
 b=v if isinstance(v,bytes) else v.encode('utf-8') if isinstance(v,str) else (json.dumps(v,sort_keys=True,indent=2)+'\n').encode('utf-8')
 with (OUT/name).open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 return role(OUT/name)
def change(s,a,b):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,b,1)
bm,bmr=auth(BASE/'SOURCE-PINS.json',4561,'640d300aadc66b4f7bc225f91841b5fd235945d446c056214d8b4cda27b4313a')
for r in bm['files'].values():assert role(Path(r['path']))==r
im,imr=auth(IMPL/'SOURCE-PINS.json',9104,'7f2ef8499136e025a90ec67c417b1788e1209c69764a448527bb0a5244d68027')
tm,tmr=auth(TEST/'SOURCE-PINS.json',1578,'45d34dbe026cc53c4cb102a77b39e3e5319240f327eb7f5bcb4f12cebf27c33f')
iv,ivr=auth(S/'1370-an-lossless-trace-codec-consumers-independent-source-review-20261010-r3/RECEIPT.json',20821,'c2e5a3929f49115e1ab8f70545d8578e0533937d0f8672e26f6957389fcefb4f')
tv,tvr=auth(S/'1370-an-lossless-trace-independent-controls-source-review-20261010-r2/RECEIPT.json',3111,'ef8bfd51dd7298f377853bf242eb7968651c6f912a6e8a971c38dae4acafec50')
assert iv['sourceManifest']==imr and tv['sourceManifest']==tmr
for m,v in ((im,iv),(tm,tv)):
 assert v['executionAuthorization'] is False and v['concreteFindings']==[]
 for n,r in m['files'].items():assert role(Path(r['path']))==r and v['sourcePins'][n]==r
tools,toolsrole=auth(AN/'LOSSLESS-CONTROLS-RUNTIME-TOOLS.json',1366,'19327bf21bd5379586ffa98ad853ac3b6c91b22dd18eb2637c4137f74fae306a')
design,designrole=auth(AN/'LOSSLESS-TRACE-REPRESENTATION-DESIGN-ADOPTION.json',2505,'bafc6e88970215b0ff90c476f5fb62f2019404847de9b218aee8d71db97a1d86')
assert design['status']=='ROOT_ADOPTED_EXACT_LOSSLESS_COMPRESSED_TRACE_DESIGN_FOR_IMPLEMENTATION_ONLY'
names=['m0TraceCodec.mjs','traceSequences.mjs','m0WiringProbe.ts','ordering.ts','ordering-source-controls.ts']
inputs={n:im['files'][n] for n in names}
inputs.update({n:tm['files'][n] for n in ['run-lossless-controls.mjs','MATRIX.json']})
inputs['CONTROLS-CONTRACT.json']=tm['files']['CONTRACT.json']
controls_contract=obj(TEST/'CONTRACT.json');matrix=obj(TEST/'MATRIX.json')
inputs['ORDERING-SOURCE-CASES.json']=controls_contract['originalOrderingPacket']
assert role(Path(inputs['ORDERING-SOURCE-CASES.json']['path']))==inputs['ORDERING-SOURCE-CASES.json']
assert len(matrix['cases'])==49 and sum(x['expected']=='GREEN' for x in matrix['cases'])==9 and sum(x['expected']=='RED' for x in matrix['cases'])==40
OUT.mkdir(mode=0o700)
bounds={'runner':300,'active':320,'whole':330,'childStreamBytes':8388608,'resultBytes':131072,'compiledModuleBytes':131072}
aliases=['CONFIG.json','CONTRACT.json','record-lossless-controls.py','launch-lossless-controls.py','run-lossless-recorded-controls.mjs',*inputs]
config={'schema':'1370-lossless-trace-pure-controls-recorded-config/v1','executionAuthorization':False,'syntheticOnly':True,'actualFixtureQualification':False,'candidateChanged':False,'caseCount':49,'positiveCount':9,'specificNegativeCount':40,'bounds':bounds,'inputs':inputs,'implementationInputNames':names,'controlsInputNames':['run-lossless-controls.mjs','MATRIX.json','CONTROLS-CONTRACT.json'],'implementationSourcePins':imr,'implementationSourceReview':ivr,'implementationReviewDecision':iv['decision'],'controlsSourcePins':tmr,'controlsSourceReview':tvr,'controlsReviewDecision':tv['decision'],'rootDesignAdoption':designrole,'typescriptCompiler':tools['typescript'],'typescriptPackage':tools['typescriptPackage'],'typescriptVersion':'5.9.3','outputPath':str(RESULT),'recorderOutputPath':str(REC),'workerPath':str(OUT/'run-lossless-recorded-controls.mjs'),'reviewAliases':aliases,'runtimeToolsObservation':toolsrole,'actualGrant':None,'actualResult':None,'actualObservedReview':None}
adoption,adoptionrole=auth(AN/'LOSSLESS-IMPLEMENTATION-CONTROLS-SOURCE-ADOPTION.json',12274,'d508ed71a4607104aeab0541887dd456687378467bc79915c8425b339e4e47b7')
assert adoption['implementationSourcePins']==imr and adoption['implementationReview']==ivr and adoption['controlsSourcePins']==tmr and adoption['controlsReview']==tvr
config['implementationControlsSourceAdoption']=adoptionrole
config['runtimeTools']={k:tools[k] for k in ('node','python','helper','typescript','typescriptPackage')}
cr=write('CONFIG.json',config)
worker=(PREP/'worker-template.mjs.txt').read_text().replace('UNFILLED_FINAL_CONFIG_SHA256',cr['sha256'])
worker=change(worker,"assert.equal(implementationReview.executionAuthorization,false);assert.deepEqual(implementationReview.concreteFindings,[])","assert.equal(implementationReview.executionAuthorization,false);assert.deepEqual(implementationReview.concreteFindings,[]);assert.equal(implementationReview.decision,config.implementationReviewDecision)")
worker=change(worker,"assert.equal(controlsReview.executionAuthorization,false);assert.deepEqual(controlsReview.concreteFindings,[])","assert.equal(controlsReview.executionAuthorization,false);assert.deepEqual(controlsReview.concreteFindings,[]);assert.equal(controlsReview.decision,config.controlsReviewDecision)")
wr=write('run-lossless-recorded-controls.mjs',worker)
parent=(BASE/'launch-parser-controls.py').read_text();recorder=(BASE/'record-parser-controls.py').read_text()
write('BASE-launch-parser-controls.py.txt',parent);write('BASE-record-parser-controls.py.txt',recorder)
parent=parent.replace('1370-an-exact-identity-json-controls-parent-recorded-20261010-r1',PARENT.name).replace('launch-parser-controls.py','launch-lossless-controls.py').replace('record-parser-controls.py','record-lossless-controls.py')
parent=parent.replace('1370-root-exact-identity-json-controls-once-grant/v1','1370-root-lossless-trace-pure-controls-once-grant/v1').replace('PURE_PUBLIC_EXACT_IDENTITY_JSON_32_CONTROLS_ONLY','PURE_PUBLIC_LOSSLESS_CODEC_AND_AFFECTED_ORDERING_CONTROLS_ONLY').replace('1370-exact-identity-json-controls-source-pins/v1','1370-lossless-trace-pure-controls-recorded-route-source-pins/v1').replace('ACCEPT_STATIC_EXACT_IDENTITY_JSON_CONTROLS_RECORDED_ROUTE_SOURCE_ONLY','ACCEPT_STATIC_LOSSLESS_TRACE_PURE_CONTROLS_RECORDED_ROUTE_SOURCE_ONLY').replace('1370-exact-identity-json-controls-recorded-route-independent-source-review/v1','1370-lossless-trace-pure-controls-recorded-route-independent-source-review/v1').replace('1370-root-exact-identity-json-controls-source-adoption/v1','1370-root-lossless-trace-pure-controls-source-adoption/v1').replace('ROOT_ADOPTED_PURE_EXACT_IDENTITY_JSON_CONTROLS_SOURCE_ONLY','ROOT_ADOPTED_PURE_LOSSLESS_TRACE_CONTROLS_SOURCE_ONLY').replace('1370-exact-identity-json-controls-parent-launch-claim/v1','1370-lossless-trace-pure-controls-parent-launch-claim/v1')
parent=change(parent,"for name in ('CONFIG.json','CONTRACT.json','record-lossless-controls.py','launch-lossless-controls.py','exact-json.mjs','run-parser-controls.mjs'):","for name in config['reviewAliases']:")
parent=change(parent,"require(exact(config['inputs'],contract['inputs']) and config['caseCount']==32,'PURE_PUBLIC_SOURCE_BINDINGS')","require(exact(config['inputs'],contract['inputs']) and type(config['caseCount']) is int and config['caseCount']==49 and config['positiveCount']==9 and config['specificNegativeCount']==40,'PURE_PUBLIC_SOURCE_BINDINGS')\n for key in ('implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview','rootDesignAdoption'):require(exact(g[key],config[key]),'ACTUAL_'+key.upper());authenticate(config[key])\n design=load(authenticate(config['rootDesignAdoption']));require(design['schema']=='1370-root-lossless-helper-trace-representation-amendment/v1' and design['status']=='ROOT_ADOPTED_EXACT_LOSSLESS_COMPRESSED_TRACE_DESIGN_FOR_IMPLEMENTATION_ONLY' and design['executionAuthorization'] is False and design['implementationAuthorized'] is True,'GENUINE_DESIGN_ADOPTION')")
parent=change(parent,"require(observation['schema']=='1370-root-current-m0-runtime-tools-observation/v1' and observation['privateM0MirrorRead'] is False,'GENUINE_TOOLS_OBSERVATION')","require(observation['schema']=='1370-root-pure-lossless-runtime-tools/v1' and observation['executionAuthorization'] is False and observation['game'] is False and observation['typescriptVersion']=='5.9.3','GENUINE_TOOLS_OBSERVATION')")
parent=change(parent,"row=observation['runtimeTools'][key];wanted=contract['tools'][key]\n  require(row['physicalPath']==wanted['path'] and row['bytes']==wanted['bytes'] and row['sha256']==wanted['sha256'],'OBSERVED_'+key.upper());authenticate(wanted);require(os.access(wanted['path'],os.X_OK),'EXECUTABLE_'+key.upper())","row=observation[key];wanted=contract['tools'][key]\n  require(exact(row,wanted),'OBSERVED_'+key.upper());authenticate(wanted);require(os.access(wanted['path'],os.X_OK),'EXECUTABLE_'+key.upper())\n for key in ('typescript','typescriptPackage'):require(exact(observation[key],contract['tools'][key]),'OBSERVED_'+key.upper());authenticate(contract['tools'][key])")
parent=change(parent,"require(exact(g['runtimeTools'],{'node':contract['tools']['node']}),'ACTUAL_NODE_BINDING')","require(exact(g['runtimeTools'],{key:contract['tools'][key] for key in ('node','typescript','typescriptPackage')}),'ACTUAL_NODE_COMPILER_BINDING')")
parent=parent.replace("('implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview','rootDesignAdoption')","('implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview','rootDesignAdoption','implementationControlsSourceAdoption')")
parent=parent.replace("{key:contract['tools'][key] for key in ('node','typescript','typescriptPackage')}","{key:contract['tools'][key] for key in ('node','python','helper','typescript','typescriptPackage')}")
# Main-only metadata bindings. Original ten helpers, prep60 and directexec are untouched.
pr=write('launch-lossless-controls.py',parent)
recorder=recorder.replace("CONFIG_SHA='501a9f61f9e305b7b97e5833f953974495c8cb3b5eaee7975962b744942d768e'","CONFIG_SHA="+repr(cr['sha256'])).replace("WORKER_SHA='612178f22ab0b9cd80e2b43a45b93a12582e6bdcc42fa38572ca37c2269c6ef7'","WORKER_SHA="+repr(wr['sha256']))
recorder=recorder.replace('1370-an-exact-identity-json-controls-recorded-results-20261010-r1',REC.name).replace('1370-exact-identity-json-controls-config/v1','1370-lossless-trace-pure-controls-recorded-config/v1').replace('1370-root-exact-identity-json-controls-once-grant/v1','1370-root-lossless-trace-pure-controls-once-grant/v1').replace('PURE_PUBLIC_EXACT_IDENTITY_JSON_32_CONTROLS_ONLY','PURE_PUBLIC_LOSSLESS_CODEC_AND_AFFECTED_ORDERING_CONTROLS_ONLY').replace('1370-exact-identity-json-controls-recorder/v1','1370-lossless-trace-pure-controls-recorder/v1').replace('EXACT_IDENTITY_JSON_CONTROLS_COMPLETE_UNADOPTED','LOSSLESS_TRACE_PURE_CONTROLS_COMPLETE_UNADOPTED')
recorder=change(recorder,"script=pathlib.Path(config['inputs']['run-parser-controls.mjs']['path']);authenticate(script,WORKER_SHA,128*1024)","script=HERE/'run-lossless-recorded-controls.mjs';require(str(script)==config['workerPath'],'EXACT_WORKER_PATH');authenticate(script,WORKER_SHA,128*1024)\n  for key in ('typescript','typescriptPackage'):\n   wanted=config['typescriptCompiler'] if key=='typescript' else config['typescriptPackage'];require(grant['runtimeTools'][key]==wanted,'EXACT_COMPILER_BINDING');authenticate(wanted['path'],wanted['sha256'],16*1024**2);whole_guard(end)")
recorder=change(recorder,"output=OUTPUTS[mode];require(output.parent==SCRATCH","output=OUTPUTS[mode];require(str(output)==config['recorderOutputPath'],'EXACT_RECORDER_OUTPUT');require(output.parent==SCRATCH")
recorder=change(recorder,"argv=[node['path'],str(script)]","argv=[node['path'],str(script),str(grantpath),sys.argv[3]]")
start=recorder.index("     report=json.loads(bytes(buffers['stdout']));expected=")
stop=recorder.index("     control_raw=",start)
new="""     def duplicate_keys(rows):
      out={}
      for key,value in rows:require(key not in out,'DUPLICATE_REPORT_KEY');out[key]=value
      return out
     def typed_equal(a,b):
      if type(a) is not type(b):return False
      if isinstance(a,dict):return set(a)==set(b) and all(typed_equal(a[k],b[k]) for k in a)
      if isinstance(a,list):return len(a)==len(b) and all(typed_equal(x,y) for x,y in zip(a,b))
      return a==b
     report=json.loads(bytes(buffers['stdout']),object_pairs_hook=duplicate_keys,parse_constant=lambda value:(_ for _ in ()).throw(RuntimeError('STOP_REPORT_CONSTANT')))
     require(report['schema']=='1370-lossless-trace-independent-controls-result/v1' and report['status']=='PURE_LOSSLESS_CODEC_AND_AFFECTED_ORDERING_COMPLETED_UNADOPTED' and report['originalM0ReadOrWritten'] is False and report['game'] is False and report['executionAuthorization'] is False and not buffers['stderr'],'EXACT_PUBLIC_LOSSLESS_REPORT')
     matrixrole=config['inputs']['MATRIX.json'];authenticate(matrixrole['path'],matrixrole['sha256'],128*1024);matrix=json.loads(pathlib.Path(matrixrole['path']).read_bytes())
     expected=[dict(case,verdict='ACCEPT_POSITIVE' if case['expected']=='GREEN' else 'ACCEPT_SPECIFIC_REFUSAL') for case in matrix['cases']]
     require(typed_equal(report['results'],expected) and type(report['positiveCount']) is int and report['positiveCount']==9 and type(report['specificNegativeCount']) is int and report['specificNegativeCount']==40 and type(report['originalOrderingCases']) is int and report['originalOrderingCases']==18 and type(report['originalParserCasesReplayed']) is int and report['originalParserCasesReplayed']==0,'EXACT_SOURCE_MATRIX_ROWS_COUNTS')
     require(typed_equal(report['inputRoles'],config['inputs']) and report['grantSha256']==sys.argv[3] and typed_equal(report['runtimeTools'],grant['runtimeTools']),'EXACT_SOURCE_TOOL_GRANT_BINDINGS')
"""
recorder=recorder[:start]+new+recorder[stop:]
rr=write('record-lossless-controls.py',recorder)
toolsmap={k:tools[k] for k in ('python','node','helper','typescript','typescriptPackage')}
contract={'schema':'1370-lossless-trace-pure-controls-parent-contract/v1','executionAuthorization':False,'actualRootGrant':None,'actualSourceReview':None,'actualSourcePins':None,'scope':'PURE_PUBLIC_LOSSLESS_CODEC_AND_AFFECTED_ORDERING_CONTROLS_ONLY','config':cr,'bounds':bounds,'tools':toolsmap,'inputs':inputs,'runtimeToolsObservation':toolsrole,'recipePath':str(OUT/'RECIPE.json'),'sourcePinsPath':str(OUT/'SOURCE-PINS.json'),'parentPath':str(PARENT),'outputPath':str(RESULT),'recorderOutputPath':str(REC),'laneLog':str(PARENT/'controls.lane.log'),'cwd':'/Users/zacheryspector/The-Movies-headless-program','environment':{'GIT_OPTIONAL_LOCKS':'0','PYTHONDONTWRITEBYTECODE':'1'}}
ctr=write('CONTRACT.json',contract)
argv=['/bin/bash',tools['helper']['path'],'0',contract['laneLog'],tools['python']['path'],'-I','-B',str(OUT/'record-lossless-controls.py'),'verification',str(PARENT/'GRANT.json'),'EXTERNAL_GRANT_SHA256']
recipe={'schema':'1370-lossless-trace-pure-controls-recorded-route-recipe/v1','executionAuthorization':False,'scope':contract['scope'],'config':cr,'contract':ctr,'bounds':bounds,'runtimeToolsObservation':toolsrole,'rootDesignAdoption':designrole,'implementationSourcePins':imr,'implementationSourceReview':ivr,'controlsSourcePins':tmr,'controlsSourceReview':tvr,'caseCount':49,'positiveCount':9,'specificNegativeCount':40,'reviewAliases':aliases,'cwd':contract['cwd'],'environment':contract['environment'],'parentArgv':[tools['python']['path'],'-I','-B',str(OUT/'launch-lossless-controls.py'),str(PARENT/'GRANT.json'),'EXTERNAL_GRANT_SHA256'],'helperArgvTemplate':argv,'sourceReviewContract':{'schema':'1370-lossless-trace-pure-controls-recorded-route-independent-source-review/v1','decision':'ACCEPT_STATIC_LOSSLESS_TRACE_PURE_CONTROLS_RECORDED_ROUTE_SOURCE_ONLY','executionAuthorization':False,'concreteFindings':[],'sourceManifest':'exact retained SOURCE-PINS.json role','sourcePins':'exact filename-role map for reviewAliases','routeSourcePins':'same exact aliases'},'rootSourceAdoptionContract':{'schema':'1370-root-lossless-trace-pure-controls-source-adoption/v1','status':'ROOT_ADOPTED_PURE_LOSSLESS_TRACE_CONTROLS_SOURCE_ONLY','executionAuthorization':False,'fields':['sourcePins','sourceReview','parentAdapterSourcePins','parentAdapterSourceReview'],'parentAndControlsReviewAreSameRole':True,'parentAndControlsSourcePinsAreSameRole':True},'rootOnceGrantContract':{'schema':'1370-root-lossless-trace-pure-controls-once-grant/v1','scope':contract['scope'],'executionAuthorization':True,'oneAggregateRun':True,'automaticRetry':False,'clockEnforcedByOriginalRecordedRoute':True,'configSha256':cr['sha256'],'fields':['parentAdapterSourcePins','parentAdapterSourceReview','sourcePins','sourceReview','config','recipe','bounds','outputPath','sourceAdoption','runtimeToolsObservation','runtimeTools','argvTemplate','cwd','environment','laneLog','implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview','rootDesignAdoption'],'runtimeTools':{k:tools[k] for k in ('node','typescript','typescriptPackage')}},'preparationClockSeconds':60,'preparationCancelledBeforeExec':True,'combinedPreparationRuntimeDeadline':None,'runtimeClockOwnedByOriginalRecorder':True,'maxOutputs':{'childStdout':8388608,'childStderr':8388608,'compiledModuleBytesEach':131072,'resultBytes':131072,'outerMergedHelperLog':'Original r8 log no extra live limiter; no allstreamsquiet claim.'},'outputs':{'parentClaim':str(PARENT/'LAUNCH-CLAIM.json'),'lane':contract['laneLog'],'recorder':str(REC),'recorderControlResult':str(REC/'CONTROLS-RESULT.json'),'pureEmittedModules':str(RESULT),'workerControlResult':str(RESULT/'CONTROLS-RESULT.json')},'actualGrant':None,'actualResult':None,'actualObservedReview':None,'actualRootObservedAdoption':None,'actualObservedReviewDecision':'ACCEPT_ACTUAL_PURE_LOSSLESS_CODEC_AND_AFFECTED_ORDERING_CONTROLS_ONLY','claimLimits':['Pure synthetic API controls and unchanged original18 ordering inputs only. No real natural fixture compression fit, game, meaningful catch mutant, fullfunction, performance or source promotion acceptance.','Parser32 helper unchanged; original actual outcome reused, not replayed.','Source transpilations happen inside single owned Node aggregate; no independent compiler child, game graph or private copy.']}
recipe['implementationControlsSourceAdoption']=adoptionrole
recipe['rootOnceGrantContract']['fields'].append('implementationControlsSourceAdoption')
recipe['rootOnceGrantContract']['runtimeTools']={k:tools[k] for k in ('node','python','helper','typescript','typescriptPackage')}
write('RECIPE.json',recipe)
def helper_sources(s):
 tree=ast.parse(s)
 return {n.name:ast.get_source_segment(s,n) for n in tree.body if isinstance(n,(ast.FunctionDef,ast.ClassDef)) and n.name!='main'}
assert helper_sources(parent)==helper_sources((BASE/'launch-parser-controls.py').read_text())
assert helper_sources(recorder)==helper_sources((BASE/'record-parser-controls.py').read_text())
pairs=[]
for name,before,after in [('launch-lossless-controls.py',(BASE/'launch-parser-controls.py').read_bytes(),(OUT/'launch-lossless-controls.py').read_bytes()),('record-lossless-controls.py',(BASE/'record-parser-controls.py').read_bytes(),(OUT/'record-lossless-controls.py').read_bytes())]:
 f=''.join(difflib.unified_diff(before.decode().splitlines(True),after.decode().splitlines(True),fromfile='BASE/'+name,tofile='NEW/'+name))
 inv=''.join(difflib.unified_diff(after.decode().splitlines(True),before.decode().splitlines(True),fromfile='NEW/'+name,tofile='BASE/'+name))
 write(name+'.forward.diff',f);write(name+'.inverse.diff',inv)
 pairs.append({'file':name,'baseline':role(OUT/('BASE-launch-parser-controls.py.txt' if name.startswith('launch') else 'BASE-record-parser-controls.py.txt')),'derivative':role(OUT/name),'forward':role(OUT/(name+'.forward.diff')),'inverse':role(OUT/(name+'.inverse.diff'))})
proof={'schema':'1370-lossless-trace-pure-controls-recorded-route-source-proof/v1','executionAuthorization':False,'predecessorSourceManifest':bmr,'wholeSourceDiffPairs':pairs,'parentTenHelperSourcesByteEqual':True,'recorderSixteenHelpersAndOwnedChildSourcesByteEqual':True,'parserControlsSourceReviewHistorical':{'path':str(S/'1370-an-exact-identity-json-controls-recorded-route-independent-source-review-20261010-r2/RECEIPT.json'),'bytes':11984,'sha256':'fa786064f3951863c6642760b288d3d2fe0c0c5e2263dc12bfc0d5a314c16836'},'compilerAddition':'Genuine TypeScript5.9.3 physical library/package roles from root19327; worker rehashes before import and after controls. No author compiler import or execution. ES2022 admitted transpile options and explicit pure local dependency whitelist.','matrix':'Final exact49 rows,9GREEN40specificRED, source-pinned after closed sticky repair; whole producer rows compared exactly, never generic exit success.','outputSelectors':{'OUTPUTSVerification':str(REC),'configRecorderOutput':str(REC),'workerOutput':str(RESULT),'parentOutputsFreshAndDistinct':True},'clock':'Separate parent preparation60 canceled before directexec; original Node300/active320/whole330 recorder aggregate retained; no combined parent deadline.', 'candidateOrCompilerExecutedByAuthor':False,'privateM0ReadOrWritten':False}
write('SOURCE-PROOF.json',proof)
write('LESSONS.txt','Bind final UTF-8 on-disk bytes and role hashes after all writes. Compiler errors and unknown operational failures never become expected RED. A JS parser route does not imply compiler authority. Original ordering18 inputs remain unchanged; actual migrated callback receives codec envelopes only after original edits. No tested parser32 rerun. Keep parent preparation separate from recorder runtime clocks. Keep Node emitted modules separate from recorder-owned output.\n')
files={p.name:role(p) for p in OUT.iterdir()}
manifest={'schema':'1370-lossless-trace-pure-controls-recorded-route-source-pins/v1','executionAuthorization':False,'files':files,'externalInputs':inputs,'actualSourceReview':None,'actualRootSourceAdoption':None,'actualRootGrant':None,'actualTool':None,'actualResult':None,'actualObservedReview':None}
mr=write('SOURCE-PINS.json',manifest)
for r in files.values():assert role(Path(r['path']))==r
for r in inputs.values():assert role(Path(r['path']))==r
seal=write('SEAL.json',{'schema':'1370-source-only-route-seal/v1','sourceManifest':mr,'allManifestRolesReadbackEqual':True,'executionAuthorization':False})
for p in OUT.iterdir():p.chmod(0o444)
OUT.chmod(0o555)
print(json.dumps({'sourceManifest':mr,'worker':wr,'parent':pr,'recorder':rr,'config':cr,'seal':seal}))
