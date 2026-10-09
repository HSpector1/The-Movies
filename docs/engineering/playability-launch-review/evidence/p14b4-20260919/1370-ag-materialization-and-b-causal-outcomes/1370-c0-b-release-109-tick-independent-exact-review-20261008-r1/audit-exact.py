"""Exact small-artifact/semantic audit; no adoption, source imports or full inventory."""
from pathlib import Path
import ast
import hashlib
import json
import os
import shutil
import stat

SCRATCH=Path('/Users/zacheryspector/studio-scratch')
DRAFT=SCRATCH/'1370-c0-b-release-109-tick-exact-draft-20261008-r1'
SOURCE=SCRATCH/'1370-c0-b-release-109-tick-source-proposal-20261008-r2'
OUT=Path(__file__).parent
pins={}
def identity(s):return (s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)
def read(p,pin=None):
    p=Path(p);a=p.lstat();assert stat.S_ISREG(a.st_mode) and a.st_nlink==1 and a.st_size<=16777216
    fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
    try:
        assert identity(os.fstat(fd))==identity(a);b=b''
        while True:
            block=os.read(fd,min(65536,16777217-len(b)))
            if not block:break
            b+=block;assert len(b)<=16777216
        assert identity(os.fstat(fd))==identity(a)==identity(p.lstat())
    finally:os.close(fd)
    got={'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
    if pin:
        assert got['sha256']==pin['sha256']
        if 'bytes' in pin:assert got['bytes']==pin['bytes']
    pins[str(p)]=got;return b
c=json.loads(read(DRAFT/'CANDIDATE-PINS.json',{'sha256':'371cf07d885e383ac80003f7e03fd3de6238484a59fe98b4c153cf555ad946d1'}))
assert not c['adopted'] and not c['executionAuthorization'] and not c['gameRun'] and not c['testsRun']
artifacts={k:read(v['path'],v) for k,v in c.items() if isinstance(v,dict) and 'path' in v and 'sha256' in v}
binding=json.loads(artifacts['binding']);semantic={k:v for k,v in binding.items() if k not in ('status','executionAuthorization','exactReview')}
assert semantic==json.loads(artifacts['semantic'])
semanticSha=hashlib.sha256(json.dumps(semantic,sort_keys=True,separators=(',',':')).encode()).hexdigest()
assert semanticSha==c['bindingSemanticSha256']=='88826e1b557ebe04840ff63bc0dffa74691f10986adcb982c467a63ddf2d5068'
assert binding['status']=='DRAFT_UNREVIEWED_UNRUN' and binding['executionAuthorization'] is False and binding['exactReview'] is None
manifest=json.loads(artifacts['sourceManifest']);source={n:read(SOURCE/n,pin) for n,pin in manifest['files'].items()}
for pin in manifest['externalPins'].values():read(pin['path'],pin)
assert binding['manifestSha256']==c['sourceManifest']['sha256']=='67945d92e6a330f98482a893cb9a39005e7eed9fcc428b5c1d3a339cca116578'
assert binding['productionHead']=='4812bb123781632dd39e44f918eb85a6a2c12623'
assert binding['productionSourceTree']==manifest['productionSourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
assert (binding['firstBoundary'],binding['lastBoundary'],binding['continuousTicksPerArm'],binding['boundariesPerArm'])==(307,416,109,110)
assert binding['qualifiedControls']=={'Node22InterimRole':'historical interim preserved, excluded from actual-runtime qualification','Python':24,'actualNode20':29,'totalDistinct':53}
qualified=json.loads(read(binding['independentObservedSourceControlsReview']['path'],binding['independentObservedSourceControlsReview']))
assert qualified['sourceReadyForParentAuthorizedExactPreparation'] and qualified['observedControlsConditionSatisfied'] and qualified['qualifiedDistinctControls']==53
assert qualified['sourceManifestSha256']==binding['manifestSha256']
route=json.loads(read(binding['ordinaryRuntimeRole']['routeManifest']['path'],binding['ordinaryRuntimeRole']['routeManifest']))
assert binding['ordinaryRuntimeRole']['runtime']==route['runtime']
assert binding['ordinaryRuntimeRole']['witnessNode22Role']=='not used'
read(binding['recorderPython']['path'],binding['recorderPython'])
read(binding['recorderSource']['path'],binding['recorderSource'])
assert binding['recorderSource']['sha256']==manifest['files']['run.py']['sha256']
for name,pin in binding['inputRoles'].items():
    if name!='originalCapture':read(pin['path'],pin)
assert binding['inputRoles']['originalCapture']==manifest['capture']
assert binding['inputRoles']['index']['sha256']==manifest['files']['DESIGN-MEMBER-INDEX-307-416.json']['sha256']
assert binding['inputRoles']['recordedE0GContext']['sha256']==manifest['files']['E0G-TARGET-CONTEXT.json']['sha256']
assert binding['inputRoles']['releaseOffWholeFile']['sha256']==manifest['candidateWholeFileSha256']
index=json.loads(source['DESIGN-MEMBER-INDEX-307-416.json']);assert len(index['members'])==110
assert manifest['members']=={str(row['member']):row for row in index['members']}
caps=binding['adoptedCaps'];plan=json.loads(artifacts['launchPlan']);assert caps==manifest['adoptedCaps']==plan['clockCaps']
parent=json.loads(read(binding['parentBoundsAdoption']['path'],binding['parentBoundsAdoption']));assert parent['adoptedCaps']==caps
constants={}
for node in ast.parse(source['run.py']).body:
    if isinstance(node,ast.Assign) and len(node.targets)==1 and isinstance(node.targets[0],ast.Name):
        try:constants[node.targets[0].id]=ast.literal_eval(node.value)
        except (ValueError,TypeError):pass
assert (constants['WHOLE'],constants['ACTIVE'],constants['COMBINED'])==(390,375,300)
text=source['run.py'].decode()
assert "review['decision'] == 'ACCEPT_EXACT_B_RELEASE_109_TICK_UNRUN'" in text
assert "review['manifestSha256'] == sha(manifest_bytes)" in text and "review['bindingSemanticSha256'] == semantic_sha" in text
assert "if k not in ('status', 'executionAuthorization', 'exactReview')" in text
assert "binding['status'] == 'REVIEWED_FILLED_UNRUN' and binding['executionAuthorization'] is True" in text
assert plan['requiredExactDecision']=='ACCEPT_EXACT_B_RELEASE_109_TICK_UNRUN'
assert plan['requiredSemanticSha256']==semanticSha
argv=plan['argv'];expected=['/bin/bash',binding['acceptedLaneHelper']['path'],'0',str(DRAFT/'continuation.lane.log'),binding['recorderPython']['path'],'-I','-B',binding['recorderSource']['path'],str(DRAFT/'BINDING-DRAFT.json'),'REPLACE_WITH_ADOPTED_BINDING_BYTES_SHA_AFTER_EXACT_REVIEW']
assert argv==expected and plan['cwd']=='/Users/zacheryspector/The-Movies-headless-program'
assert plan['environment']=={'PYTHONDONTWRITEBYTECODE':'1'} and plan['laneAvailabilityObserved'] is False
helper=read(binding['acceptedLaneHelper']['path'],binding['acceptedLaneHelper']).decode()
assert '(set -C; "$@" > "$LOG" 2>&1)' in helper and 'sandbox-exec' not in helper
assert all('sandbox' not in token for token in argv)
pre=json.loads(artifacts['readOnlyPreflight']);assert pre['head']==binding['productionHead'] and pre['sourceTree']==binding['productionSourceTree']
assert pre['porcelain']=='' and pre['liveRemote']==binding['productionHead']+'\trefs/heads/wip/headless-program-20260916-ts'
assert pre['memberCount']==110 and pre['capture']['sha256']==manifest['capture']['sha256']
assert pre['dependencyManifestSha256']==route['runtime']['dependencyManifestSha256']
assert "Now drawing from 'AC Power'" in pre['power'] and pre['diskFreeBytes']>=caps['preflightFreeBytes']
for name,pin in manifest['files'].items():
    saved=pre['localSourceIdentity'][name];assert saved['sha256']==pin['sha256'] and saved['bytes']==pin['bytes']
    a=(SOURCE/name).lstat();assert saved['mode']==f'{stat.S_IMODE(a.st_mode):04o}'
for name,pin in manifest['externalPins'].items():assert pre['externalSourceArtifacts'][name]['sha256']==pin['sha256']
capture=Path(manifest['capture']['path']);a=capture.lstat();assert stat.S_ISREG(a.st_mode) and a.st_nlink==1 and capture.resolve()==capture
fd=os.open(capture,os.O_RDONLY|os.O_NOFOLLOW)
try:
    assert identity(os.fstat(fd))==identity(a)==identity(capture.lstat())
    saved=pre['capture'];assert (a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(saved['device'],saved['inode'],saved['bytes'],saved['mtimeNs'],saved['ctimeNs'])
finally:os.close(fd)
absent=[binding['outputRoot'],argv[3],argv[3]+'.meta']
assert all(not os.path.lexists(path) and pre['absentPaths'][path] for path in absent)
assert Path(binding['outputRoot']).parent==SCRATCH and Path(binding['outputRoot']).name=='1370-b-release-109-tick-run-20261008-4812-r1'
mode=json.loads(artifacts['modeProof']);read(mode['priorAuthenticatedModeEvidence']['path'],mode['priorAuthenticatedModeEvidence'])
assert mode['wholeMirrorRuntimeModeMapCheckClaimed'] is False and mode['historicalOrCopiedSourceRootRead'] is False
assert not pre['scope']['fullDependencyInventoryRun'] and not pre['scope']['fullInheritedSourceInventoryRun']
assert pre['scope']['scratchWideArtifactPathDiscovery'] and pre['scope']['historicalScratchDirectoryEnumerationDuringDiscovery']
free=shutil.disk_usage(SCRATCH).free;assert free>=caps['preflightFreeBytes']
result={'schema':'1370-b109-independent-exact-audit-r1','candidatePinsSha256':'371cf07d885e383ac80003f7e03fd3de6238484a59fe98b4c153cf555ad946d1',
        'draftBindingSha256':c['binding']['sha256'],'bindingSemanticSha256':semanticSha,'manifestSha256':binding['manifestSha256'],
        'allLocalExternalBindingRolePinsMatch':True,'geometry':[307,416,109,110],'caps':caps,'currentAbsentPaths':absent,
        'currentFreeDiskBytes':free,'launchArgv':argv,'launchUnsandboxedOrdinaryHelper':True,'adoptionFieldsExactly':['status','executionAuthorization','exactReview'],
        'captureFullHashBasis':'Authenticated recorded preflight full hash plus fresh unchanged dev/inode/size/mtime/ctime; reviewer did not repeat full capture hash/decode.',
        'fullInventoryOrFreeLaneObserved':False,'pendingLaunchGuards':pre['pending'],'pins':list(pins.values()),
        'adoptionPerformed':False,'sourceModulesExecuted':False,'testsRun':False,'gameRun':False,'gzipDecoded':False,'productionWrites':False}
b=(json.dumps(result,sort_keys=True,indent=2)+'\n').encode();fd=os.open(OUT/'AUDIT.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'wb') as f:f.write(b);f.flush();os.fsync(f.fileno())
print(json.dumps({'auditSha256':hashlib.sha256(b).hexdigest(),'auditBytes':len(b),'uniqueInputs':len(pins),'semanticSha256':semanticSha}))
