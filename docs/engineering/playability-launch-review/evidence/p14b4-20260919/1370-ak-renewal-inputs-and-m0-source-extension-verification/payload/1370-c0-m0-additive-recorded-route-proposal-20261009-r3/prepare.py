from pathlib import Path
import ast, difflib, hashlib, json, os, stat, time

HERE=Path(__file__).resolve().parent
B=Path('/Users/zacheryspector/studio-scratch')
OLD=B/'1370-c0-m0-additive-recorded-route-proposal-20261009-r2'
INPUT=B/'1370-c0-m0-additive-bridge-dependency-proposal-20261009-r2/INPUTS.json'
CONTROLS=B/'1370-c0-m0-additive-recorded-controls-proposal-20261009-r2'
HEAD='f0fb818fe7534c3e3784206d16728b015c7f059a'
OLD_HEAD='282f8477e61a33bd5ec4a571b934829490adef73'
AD=B/'1370-c0-m0-current-aj-scope-parent-adoption-after-aj-20261009-r1/ADOPTION.json'
roles={}
def read(path,pin=None):
 p=Path(path);a=p.lstat();assert stat.S_ISREG(a.st_mode) and a.st_size<=8*1024*1024
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  z=os.fstat(fd);pieces=[];total=0
  while True:
   raw=os.read(fd,65536)
   if not raw:break
   total+=len(raw);assert total<=8*1024*1024;pieces.append(raw)
  zz=os.fstat(fd)
 finally:os.close(fd)
 q=p.lstat()
 for k in ('st_dev','st_ino','st_mode','st_nlink','st_size','st_mtime_ns','st_ctime_ns'):assert getattr(a,k)==getattr(z,k)==getattr(zz,k)==getattr(q,k)
 raw=b''.join(pieces);h=hashlib.sha256(raw).hexdigest()
 if pin:assert h==pin
 roles[str(p)]=dict(path=str(p),bytes=len(raw),sha256=h)
 return raw
def write(name,raw):
 fd=os.open(HERE/name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(raw)
 return dict(path=str(HERE/name),bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest())
def dump(name,v):return write(name,(json.dumps(v,sort_keys=True,indent=2)+'\n').encode())
def diff(name,old,new):return write(name,''.join(difflib.unified_diff(old.decode().splitlines(True),new.decode().splitlines(True),fromfile=str(OLD/name.removesuffix('.diff')),tofile=str(HERE/name.removesuffix('.diff')))).encode())
def functions(text):
 return {n.name:ast.dump(n,include_attributes=False) for n in ast.parse(text).body if isinstance(n,(ast.FunctionDef,ast.AsyncFunctionDef))}

pins=json.loads(read(OLD/'SOURCE-PINS.json','aa2f171d6da60e39ffa28eb3f16cab09c50b526fa05fd0ff1e299d21945bc0ff'))
old={n:read(OLD/n,r['sha256']) for n,r in pins['files'].items()}
binding=json.loads(old['BINDING-UNFILLED.json'])
absence=[]
for p in [binding['outputRoot'],binding['recorderLockPath'],str(B/'1370-c0-m0-additive-input-output-20261009-r2'),str(B/binding['helperLogName']),str(B/(binding['helperLogName'].removesuffix('.log')+'.meta')),str(B/'HEAVY-LANE-LOCK')]:
 assert not os.path.lexists(p),'STOP already consumed output/lock/log '+p
 absence.append(dict(path=p,lexists=False))
dump('PREPARATION-PATH-ABSENCE.json',dict(checkedBeforeReboundRuntimeFilesWritten=True,utcEpochSeconds=time.time(),checks=absence,scope='Exact named scratch output/lock/log paths only; no inventory or mirror reads; absence is preparation fact and must be freshly checked at launch.'))
ad=json.loads(read(AD,'13be428dfe3bdba1bc4ce4f2348bd194d2473c4c812df2b5f0bfec936b76b8e8'))
assert ad['status']=='PARENT_ADOPTED_ISOLATED_M0_DIAGNOSTIC_DESIGN_ONLY' and ad['productionGuardHead']==HEAD and ad['executionAuthorization'] is False and ad['H8708Waived'] is False
read(AD.parent/'DOCS-TRANSITION-FACTS.json','20c4ad5aba3580d5ff05e921e4a8d1ee824162257095a9aa6a63a74e69878017')
rr=B/'1370-c0-m0-additive-recorded-independent-source-review-20261009-r2/ROUTE-RECEIPT.json'
review=json.loads(read(rr,'81492801b0284d73c65b63e0082473e6b45767a673b2248898f40f8ae29870f9'));assert review['sourcePinsSha256']==roles[str(OLD/'SOURCE-PINS.json')]['sha256']
cr=B/'1370-c0-m0-additive-controls-observed-independent-review-20261009-r2/RECEIPT.json'
control_review=json.loads(read(cr,'9da1cfa0797a7bc85c1193e6481cf84ee690f04bb309edda6fd70eccec27b075'));assert control_review['methods']==7 and control_review['routeSourcePinsSha256']==roles[str(OLD/'SOURCE-PINS.json')]['sha256']
ca=B/'1370-c0-m0-additive-controls-parent-recorded-20261009-r2/ADOPTION.json';read(ca,'924fe37d4b09f58a5d442aa5612800fea06868396ef3ee176936ae8a48b80c79')
control_pins=json.loads(read(CONTROLS/'SOURCE-PINS.json','73bbea8af39d83aad7d674a905f3879ba6144c40fc726687b1640f99b1c1f97e'))
tests=read(CONTROLS/'test_controls.py',control_pins['files']['test_controls.py']['sha256'])
inputs_raw=read(INPUT,'d72e3292aff7d640c544e752e7bd54f6b66aebebf8a82cadda110d74f8111520')
inputs=json.loads(inputs_raw);assert inputs['operationalHead']==OLD_HEAD
inputs['operationalHead']=HEAD
inputrole=dump('INPUTS.json',inputs)
before=json.loads(inputs_raw);assert {k:v for k,v in inputs.items() if k!='operationalHead'}=={k:v for k,v in before.items() if k!='operationalHead'}
assert len(inputs['bridge']['files'])==63 and sum(x['bytes'] for x in inputs['bridge']['files'])==1517743
diff('INPUTS.json.diff',inputs_raw,(HERE/'INPUTS.json').read_bytes())
body=old['add_inputs.py'].decode()
subs=[("INPUTS=S/'1370-c0-m0-additive-bridge-dependency-proposal-20261009-r2/INPUTS.json'","INPUTS=S/'1370-c0-m0-additive-recorded-route-proposal-20261009-r3/INPUTS.json'"),("INPUTS_SHA='d72e3292aff7d640c544e752e7bd54f6b66aebebf8a82cadda110d74f8111520'",f"INPUTS_SHA='{inputrole['sha256']}'"),(f"HEAD='{OLD_HEAD}'",f"HEAD='{HEAD}'")]
for a,z in subs:assert body.count(a)==1;body=body.replace(a,z)
inverse=body
for a,z in reversed(subs):assert inverse.count(z)==1;inverse=inverse.replace(z,a)
assert inverse.encode()==old['add_inputs.py'] and functions(body)==functions(old['add_inputs.py'].decode())
bodyrole=write('add_inputs.py',body.encode());diff('add_inputs.py.diff',old['add_inputs.py'],body.encode())
record=old['record.py'].decode();assert record.count(OLD_HEAD)==1;record=record.replace(OLD_HEAD,HEAD)
assert record.replace(HEAD,OLD_HEAD).encode()==old['record.py'];recordrole=write('record.py',record.encode());diff('record.py.diff',old['record.py'],record.encode())
supervisor=write('supervise.py',old['supervise.py']);assert functions(record)['validated_spec']!=functions(old['record.py'].decode())['validated_spec']
changed_functions=[name for name,value in functions(record).items() if value!=functions(old['record.py'].decode()).get(name)]
assert changed_functions==['validated_spec']
assert functions(old['supervise.py'].decode())==functions((HERE/'supervise.py').read_text())
argv=json.loads(old['ARGV-ROLE.json']);argv['materializerArgv'][3]=str(HERE/'add_inputs.py');argvrole=dump('ARGV-ROLE.json',argv);diff('ARGV-ROLE.json.diff',old['ARGV-ROLE.json'],(HERE/'ARGV-ROLE.json').read_bytes())
launch=json.loads(old['LAUNCH-UNFILLED.json']);launch['argv'][3]=str(HERE/'supervise.py');dump('LAUNCH-UNFILLED.json',launch);diff('LAUNCH-UNFILLED.json.diff',old['LAUNCH-UNFILLED.json'],(HERE/'LAUNCH-UNFILLED.json').read_bytes())
preserve=['outputRoot','recorderLockPath','additiveReceiptPath','phaseReceiptPath','helperLogName','runId','mirrorPath','scratchRoot','bounds','originalM0RootMetadata','expectedOverlayFiles','copyFactsSha256']
binding.update(productionHead=HEAD,materializerPath=bodyrole['path'],materializerSha256=bodyrole['sha256'],recorderPath=recordrole['path'],recorderSha256=recordrole['sha256'],supervisorPath=supervisor['path'],supervisorSha256=supervisor['sha256'],materializerArgv=argv['materializerArgv'],materializerArgvRolePath=argvrole['path'],materializerArgvRoleSha256=argvrole['sha256'],parentScopeAdoptionPath=str(AD),parentScopeAdoptionSha256=roles[str(AD)]['sha256'])
binding['docsOnlyTransition']['toProductionHead']=HEAD
for k in preserve:assert binding[k]==json.loads(old['BINDING-UNFILLED.json'])[k]
assert binding['executionAuthorization'] is False and all(binding[k] is None for k in ['materializerSourceReviewPath','materializerSourceReviewSha256','routeSourceReviewPath','routeSourceReviewSha256','routeSourceReviewDecision','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision','preflightReviewPath','preflightReviewSha256','retainedHLeafPath','bootSessionUuid'])
dump('BINDING-UNFILLED.json',binding);diff('BINDING-UNFILLED.json.diff',old['BINDING-UNFILLED.json'],(HERE/'BINDING-UNFILLED.json').read_bytes())
methods=next(n for n in ast.parse(tests).body if isinstance(n,ast.ClassDef)).body
mapping={'test_01_preflight_exact_and_one_below':{'add_inputs.py':['preflight_space']},'test_02_actual_owned_bounded_pipes':{'add_inputs.py':['bounded_blob'],'record.py':['fork_ready','still_alive']},'test_03_exact_fixture_link':{'add_inputs.py':['exact_roster']},'test_04_mocked_deadline_predicate_not_elapsed':{'add_inputs.py':['remaining'],'supervise.py':['check_deadline']},'test_05_root_transition_predicate':{'record.py':['check_root_transition']},'test_06_extracted_failure_reap_fake_clock':{'record.py':['reap_failed_child']},'test_07_extracted_pre_setsid_exact_pid_fallback':{'supervise.py':['hard_terminate_known','supervise']}}
mapped=[]
for n in methods:
 if not isinstance(n,ast.FunctionDef) or not n.name.startswith('test_'):continue
 scope=mapping[n.name];targets=[]
 for filename,names in scope.items():
  oldf=functions(old[filename].decode());newf=functions((HERE/filename).read_text())
  for name in names:
   assert oldf[name]==newf[name];targets.append(dict(file=filename,function=name,astSha256=hashlib.sha256(newf[name].encode()).hexdigest(),unchanged=True))
 mapped.append(dict(method=n.name,originalMethodAstSha256=hashlib.sha256(ast.dump(n,include_attributes=False).encode()).hexdigest(),targets=targets))
assert len(mapped)==7
dump('CONTROL-REUSE-MAPPING.json',dict(originalTestSource=roles[str(CONTROLS/'test_controls.py')],originalControlsPins=roles[str(CONTROLS/'SOURCE-PINS.json')],acceptedObservedControls=roles[str(cr)],methods=mapped,testsCopiedOrChanged=False,testsExecuted=False,reuseQualifiedByIndependentReview=False,claimLimit='Mapping only: original seven observed mechanisms and method ASTs unchanged. No actual r3 tests or metadata/source admission controls claimed; independent reviewer decides narrow reuse, then exact operational fill/guard/ref/source checks remain separate.'))
dump('INVERSE-AND-BODY-PROOF.json',dict(bodyExactInverseSubstitutions=subs,bodyAllTopLevelFunctionAstsEqual=True,bodyFunctionCount=len(functions(body)),recordExactInverseSubstitution=[OLD_HEAD,HEAD],recordChangedFunctions=changed_functions,recordOtherTopLevelFunctionAstsEqual=True,recordFunctionCount=len(functions(record)),supervisorByteIdentical=True,supervisorFunctionCount=len(functions(old['supervise.py'].decode())),inputsOnlyOperationalHeadChanged=True,inputAuthorityAndBridgeDependencyCopyRolesEqual=True,bindingPreservedFields=preserve,sourceParseOnly=True,sourceOrTestImportsExecution=False))
dump('PROVENANCE.json',dict(roles=roles,parentCurrentAjScopeAdopted=True,scanAndAdditiveLaunchAuthorized=False,historicalR2SourceAndInputsPreserved=True,originalSevenObservedControlsPreserved=True,guardPredecessorPath=str(B/'1370-c0-m0-additive-operational-full-guard-after-aj-proposal-20261009-r2/SOURCE-PINS.json'),guardPredecessorSha256='3293ac99fc8e43b5834cf4e4330f85501295915fd9e2c2da48b5e88d941e856e',noMirrorsReadOrWritten=True,noGitNodeHelperEngineTestsGuardOrScansRun=True,currentProductionHeadFromAuthenticatedParentScope=HEAD))
print(json.dumps(dict(body=bodyrole,record=recordrole,supervisor=supervisor,inputs=inputrole,mappedControls=len(mapped),preservedUnusedOutputs=True,executionAuthorized=False)))
