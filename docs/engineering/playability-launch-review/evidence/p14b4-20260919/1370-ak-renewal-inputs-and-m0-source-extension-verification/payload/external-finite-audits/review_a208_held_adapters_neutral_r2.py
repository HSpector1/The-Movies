import pathlib,json,hashlib,stat,ast,os,datetime
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-c0-a208-external-pipeline-sink-held-proposal-after-aj-20261009-r1'
D=S/'1370-c0-a208-external-pipeline-sink-independent-source-review-after-aj-20261009-r1'
roles={}
def role(path):
    p=pathlib.Path(path);st=p.lstat()
    assert stat.S_ISREG(st.st_mode) and st.st_nlink==1 and p.resolve(strict=True)==p and st.st_size<=1048576
    b=p.read_bytes();assert p.lstat()==st
    return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def auth(name,r):
    assert role(r['path'])==r;roles[name]=r
    return json.loads(pathlib.Path(r['path']).read_bytes()) if r['path'].endswith('.json') else None
pinsrole=role(P/'SOURCE-PINS.json')
assert pinsrole['sha256']=='470026455632aeac39bf57c3db45722fdd68b96f24689fdee70c3c1da8d40748'
pins=auth('sourcePins',pinsrole)
assert pins['executionAuthorization'] is False
for name,r in pins['roles'].items():auth('package:'+name,r)
proof=json.loads((P/'INVERSE-PROOF.json').read_bytes())
assert roles['package:INVERSE-PROOF.json']['sha256']=='fa8a4459bf67d21dd7dea6cb86df8a4a70a67c3ad6b252465355b8efb35577cd'
for path,r in proof['originalRoles'].items():auth('original:'+path,r)
for path,r in proof['sourceReads'].items():auth('sourceRead:'+path,r)
pipeline=roles['package:launch-pipeline-a208-held.sh'];sink=roles['package:bounded-sink-a208-held.py']
assert pipeline['sha256']=='46640b541fb04c67fcd5f72602ab128ca056416cd37ad946f248a50da1d6886a'
assert sink['sha256']=='9138c982912f53d8241721ec231555de3d8e9dae959e651c9b36dcf96a4f9700'
for kind,r,n in [('pipeline',pipeline,2),('sink',sink,3)]:
    substitutions=proof[kind+'Substitutions'];assert len(substitutions)==n
    originalPath=next(p for p in proof['originalRoles'] if ('launch-pipeline' if kind=='pipeline' else 'bounded-sink') in pathlib.Path(p).name)
    old=pathlib.Path(originalPath).read_text();new=pathlib.Path(r['path']).read_text();forward=old
    for before,after in substitutions:assert forward.count(before)==1;forward=forward.replace(before,after)
    assert forward.encode()==pathlib.Path(r['path']).read_bytes()
    inverse=new
    for before,after in reversed(substitutions):assert inverse.count(after)==1;inverse=inverse.replace(after,before)
    assert inverse.encode()==pathlib.Path(originalPath).read_bytes()
    if kind=='sink':assert ast.dump(ast.parse(inverse),include_attributes=False)==ast.dump(ast.parse(old),include_attributes=False)
src=pathlib.Path(proof['sourceDirectory']);sr=role(src/'SOURCE-PINS.json')
assert sr['sha256']==proof['sourcePinsSha256']=='3452218ceabf6bb63f690db2eff3f83edda56db71c5826982a92ae0c73085aaf'
manifest=auth('observerPins',sr)
for name,r in manifest['files'].items():
    actual=role(src/name);assert {k:actual[k] for k in ('bytes','sha256')}==r;roles['observerFile:'+name]=actual
assert manifest['executionAuthorization'] is False and manifest['controlsGrant'] is None and manifest['operationalRuntimeAuthority'] is None and manifest['witnessGrant'] is None
reviewPath=S/'1370-c0-aging-era-settlement208-observer-independent-source-review-after-aj-20261009-r1/RECEIPT.json'
rr=role(reviewPath);assert rr['sha256']=='d813c722afeefb1b7ce4be1bc7fade51db41d7ce1930964a7e67d6d884ebf1a8'
review=auth('observerSourceReview',rr)
assert review['sourceDirectory']==str(src) and review['sourcePinsSha256']==sr['sha256']
assert review['schema']=='1370-c0-aging-era-settlement208-witness-independent-static-review-r1' and review['status']=='FROZEN_SOURCE_ONLY_UNRUN'
assert review['decision'].get('witnessSource')=='ACCEPT_SOURCE_ONLY_UNRUN' and review['decision'].get('launch')=='STOP_UNFILLED_UNRUN'
assert review['frozenHashes']=={name:r['sha256'] for name,r in manifest['files'].items()}
assert role(src/'supervise.py')['sha256']==proof['supervisorSha256']=='45eda307943fb829a321624d7eca4ad5004a7d8e8bdef042a74c8344b61e153e'
ready=auth('authorReady',role(P/'READY.json'));recipe=json.loads((P/'RECIPE-SKETCH-HELD.json').read_bytes())
assert ready['sourcePins']==pinsrole and ready['pipeline']==pipeline and ready['sink']==sink
assert recipe['adapterRoles']['bounded-sink-a208-held.py']==sink and recipe['adapterRoles']['launch-pipeline-a208-held.sh']==pipeline
assert recipe['executionAuthorization'] is False and recipe['actualControlsReceipt'] is None and recipe['actualGrant'] is None and recipe['launchBinding'] is None and recipe['operationalRuntimeAuthority'] is None
for key in ('actualControlsReceipt','actualWitnessGrant','adoptedPreflight','archiveAdoption','exactFilledBinding','exactReview','operationalRuntimeAuthority'):assert proof[key] is None
assert proof['runtimeExecuted'] is False and proof['sourceImported'] is False and proof['executionAuthorization'] is False
assert recipe['requiredEnvironment']['PATH']=='/Users/zacheryspector/.nvm/versions/node/v22.23.2/bin:/usr/bin:/bin:/usr/sbin:/sbin'
assert not D.exists();D.mkdir(mode=0o700)
def write(name,obj):
    raw=obj.encode() if isinstance(obj,str) else (json.dumps(obj,indent=2,sort_keys=True)+'\n').encode()
    fd=os.open(D/name,os.O_CREAT|os.O_EXCL|os.O_WRONLY|os.O_NOFOLLOW,0o600)
    with os.fdopen(fd,'wb') as f:os.fchmod(f.fileno(),0o600);f.write(raw);f.flush();os.fsync(f.fileno())
    return role(D/name)
facts=write('CHECKS.json',{'roles':roles,'pipelineSubstitutions':proof['pipelineSubstitutions'],'sinkSubstitutions':proof['sinkSubstitutions'],'wholeForwardAndInverseBytesExact':True,'sinkInverseFullAstIdentical':True,'authenticatedObserverFiles':len(manifest['files']),'sourceReviewGateSchemaFieldsAndFrozenHashesCompatible':True,'clockAndCapsPreserved':proof['preserved'],'frozenSourceUnchanged':True,'unfilledAuthorityFieldsRemainNull':True,'reviewerExecutedImportsShellNodeTestsGameScanGit':False,'audit':role(pathlib.Path(__file__))})
report=write('REPORT.md','''# Held A208 external pipeline and sink\n\nACCEPT_SOURCE_ONLY_UNRUN_A208_EXTERNAL_PIPELINE_SINK. Whole forward/inverse byte replay proves exactly two pipeline and three sink literal substitutions from authenticated original R9 adapter bytes. Sink inverse full AST matches. Pipe, PIPESTATUS assertions, Python flags, one bounded frame, source-review validation,512KiB frame cap and760/10 sink deadlines remain identical. Observer720/742/750 bounds remain admitted unchanged source.\n\nNew source manifest3452218/supervisor45eda and all frozen manifest file hashes authenticate; receipt d813 schema/status/directory/sourcepins/frozenHashes/decision matches the sink's source-review consumer. Frame validation still calls the accepted A208 payload validator before its original44-row/digest/firstQuote/source/runtime/RNG/416 checks. Node22 prospective amendment, filled review, FD-scope clarification and wrapper review are pinned source-only roles, with historical Node20 TAP wording explicitly qualified.\n\nActual controls, runtime authority, exact binding/review/archive/adoption/preflight and actual game grant remain null; command shape is held. This source acceptance does not grant a run, qualify actual controls or capture A208 values. No shell/Node/proposal imports/tests/game/scans/Git/protected writes executed. No findings.\n''')
receipt=write('RECEIPT.json',{'schema':'1370-a208-external-pipeline-sink-independent-source-review-after-aj-v1','decision':'ACCEPT_SOURCE_ONLY_UNRUN_A208_EXTERNAL_PIPELINE_SINK','sourcePins':pinsrole,'sourcePinsSha256':pinsrole['sha256'],'pipeline':pipeline,'sink':sink,'observerSourcePins':sr,'observerSourceReview':rr,'checks':facts,'report':report,'findings':[],'executionAuthorization':False,'actualControlsObserved':False,'a208ValuesMeasured':False,'actualRuntimeGrant':None,'sourceImportedOrExecuted':False,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat()})
print(json.dumps({'receipt':receipt,'authenticatedRoles':len(roles)},indent=2))
