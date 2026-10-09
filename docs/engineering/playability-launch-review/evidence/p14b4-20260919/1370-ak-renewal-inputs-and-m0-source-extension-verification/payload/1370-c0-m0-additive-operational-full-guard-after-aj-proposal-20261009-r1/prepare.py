from pathlib import Path
import ast, difflib, hashlib, json, os, stat

HERE=Path(__file__).resolve().parent
B=Path('/Users/zacheryspector/studio-scratch')
OLD=B/'1370-c0-m0-operational-full-guard-preparation-20261009-r1'
HEAD='f0fb818fe7534c3e3784206d16728b015c7f059a'
SRC='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
roles={}
def read(path, expected=None):
 p=Path(path);a=p.lstat();assert stat.S_ISREG(a.st_mode) and a.st_size<=16*1024*1024
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  z=os.fstat(fd);out=[];count=0
  while True:
   part=os.read(fd,65536)
   if not part:break
   out.append(part);count+=len(part);assert count<=16*1024*1024
  zz=os.fstat(fd)
 finally:os.close(fd)
 q=p.lstat()
 for key in ('st_dev','st_ino','st_size','st_mode','st_nlink','st_mtime_ns','st_ctime_ns'):assert getattr(a,key)==getattr(z,key)==getattr(zz,key)==getattr(q,key)
 raw=b''.join(out);h=hashlib.sha256(raw).hexdigest()
 if expected:assert h==expected
 roles[str(p)]=dict(path=str(p),bytes=len(raw),sha256=h)
 return raw
def write(name,raw):
 p=HERE/name;fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(raw)
 return dict(path=str(p),bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest())
def dump(name,v):return write(name,(json.dumps(v,sort_keys=True,indent=2)+'\n').encode())

oldpins=json.loads(read(OLD/'SOURCE-PINS.json','6941ca219fad32fe77982f71985052be5743d76820eea48caea2e0305c78bca9'))
oldraw=read(OLD/'snapshot.py','259c4bac30fd506a67779d2c59fd29f51c8a6f75e140f7c37f6cff625aa23a58')
configraw=read(OLD/'CONFIG.json','03d8bdfeba06f14d9f371484805f66d7fcc1013825e9d0875a4368f0d5a9033d')
oldconfig=json.loads(configraw)
oldreview=B/'1370-c0-m0-operational-full-guard-independent-source-review-20261009-r1/RECEIPT.json'
read(oldreview)
route_review=B/'1370-c0-m0-additive-recorded-independent-source-review-20261009-r2/ROUTE-RECEIPT.json'
rr=json.loads(read(route_review));assert roles[str(route_review)]['sha256'].startswith('81492801')
route=B/'1370-c0-m0-additive-recorded-route-proposal-20261009-r2'
routepins=json.loads(read(route/'SOURCE-PINS.json','aa2f171d6da60e39ffa28eb3f16cab09c50b526fa05fd0ff1e299d21945bc0ff'))
binding=json.loads(read(route/'BINDING-UNFILLED.json',routepins['files']['BINDING-UNFILLED.json']['sha256']))
read(route/'add_inputs.py',routepins['files']['add_inputs.py']['sha256'])
controls=B/'1370-c0-m0-additive-controls-observed-independent-review-20261009-r2/RECEIPT.json'
cr=json.loads(read(controls,'9da1cfa0797a7bc85c1193e6481cf84ee690f04bb309edda6fd70eccec27b075'))
assert cr['decision']=='ACCEPT_OBSERVED_SEVEN_ADDITIVE_TINY_CONTROLS_ONLY'
ca=B/'1370-c0-m0-additive-controls-parent-recorded-20261009-r2/ADOPTION.json'
cad=json.loads(read(ca));assert roles[str(ca)]['sha256'].startswith('924fe37d') and cad['actualAdditiveLaunchAuthorized'] is False
read(oldconfig['privateBaseline']['path'],oldconfig['privateBaseline']['sha256'])
read(oldconfig['observedCopyReceipt']['path'],oldconfig['observedCopyReceipt']['sha256'])
read(oldconfig['parentScopeAdoption']['path'],oldconfig['parentScopeAdoption']['sha256'])

adoption=dict(schema='m0-additive-after-aj-operational-scope-adoption-draft/v1',status='UNADOPTED_PARENT_DOCS_ONLY_SCOPE_DRAFT',executionAuthorization=False,productionGuardHead=HEAD,productionSourceTree=SRC,canonicalM0Source=binding['sourceSha'],combinedHFirstRouteUnchanged=True,H8708Waived=False,sourceBodiesScopeAndNoHWaiverUnchanged=True,productionSourceChangesAuthorized=False,historicalAcceptedR9ReplayRequired=False,actualAdditiveLaunchAuthorized=False,guardExecutionAuthorized=False,remoteRefsVerified=None,expectedRemoteRefs={'refs/heads/main':'c902a704eb948cc576083d0973c8c23e59937dc1','refs/heads/wip/headless-program-20260916-ts':HEAD},operationalTransition=dict(predecessor=oldconfig['productionHead'],actualHead=HEAD,priorAdoption=oldconfig['parentScopeAdoption'],docsOnlyVerified=False,wholeProductionCommonGuardMustRefresh=True,privateHistoricalReuseRequiresFreshCompleteSourceAndDependencyReadback=True,sourceBodiesScopeAndNoHWaiverUnchanged=True),requiredParentActions=['Independently authenticate clean local/published AJ HEAD, unchanged src and docs-only history (no Git actions performed by preparation).','Adopt this non-executing operational scope in a new exclusive file; exact existing guard requires status PARENT_ADOPTED_ISOLATED_M0_DIAGNOSTIC_DESIGN_ONLY and docsOnlyVerified true while executionAuthorization remains false.','Prepare fresh filled package changing only CONFIG parent role/path/hash and matching CONFIG_SHA/source aggregate; independently review exact filled source and argv before a separate parent recorded scan grant.','Hold production/common/R9/H/dependencies and original M0 writes/renames frozen during baseline/fill stage; extension changes only the explicitly reviewed M0 root/files.','Require separately admitted expanded readback and full protected postflight before source-extension acceptance.'],originalGuardAndPrivateProofRemainHistorical=True,sourceAndControlsReviews=dict(route=roles[str(route_review)],controls=roles[str(controls)],controlsAdoption=roles[str(ca)]),claimLimit='Scope draft only; no fresh scan, operational adoption, types/game/wiring or runtime execution admitted.')
adrole=dump('PARENT-SCOPE-ADOPTION-DRAFT.json',adoption)
config=dict(oldconfig)
config.update(schema='1370-m0-additive-after-aj-full-guard-config-r1',productionHead=HEAD,parentScopeAdoption={'path':adrole['path'],'sha256':adrole['sha256']},m0RecorderLockPath=binding['recorderLockPath'],m0FdProtectedRoot=binding['scratchRoot'],declaredWitnessScratchChildren=[Path(binding['scratchRoot']).name,Path(binding['outputRoot']).name,'1370-c0-m0-additive-input-lane-20261009-r2'],status='SOURCE_PROPOSAL_UNRUN_PARENT_SCOPE_UNADOPTED_ROOT_REVIEW_AND_GRANT_REQUIRED')
cfg=dump('CONFIG.json',config)
text=oldraw.decode()
substitutions=[("CONFIG_SHA='03d8bdfeba06f14d9f371484805f66d7fcc1013825e9d0875a4368f0d5a9033d'",f"CONFIG_SHA='{cfg['sha256']}'"),("'/1370-c0-m0-recorded-materialization-route-proposal-')","'/1370-c0-m0-recorded-materialization-route-proposal-','/1370-c0-m0-additive-recorded-route-proposal-')"),(" module.assert_no_protected_writable_fds(dict(binding,productionRoot=config['retainedHParent'],commonGitRoot=config['retainedHParent']))"," module.assert_no_protected_writable_fds(dict(binding,productionRoot=config['retainedHParent'],commonGitRoot=config['retainedHParent']))\n module.assert_no_protected_writable_fds(dict(binding,productionRoot=config['m0FdProtectedRoot'],commonGitRoot=config['m0FdProtectedRoot']))"),("'fdOriginalAndEphemeralAndRetainedHPassed':True","'fdOriginalAndEphemeralAndRetainedHPassed':True,'fdOriginalM0ParentPassed':True"),("'schema':'1370-m0-operational-full-guard-snapshot-r1'","'schema':'1370-m0-additive-after-aj-full-guard-snapshot-r1'"),("operational production/common baseline is02d507.","operational production/common baseline isAJf0fb818. M0 original1677 preservation is separately checked by accepted additive route/readback; it is not in this guard immutable inventory.")]
for a,z in substitutions:
 assert text.count(a)==1,(a,text.count(a));text=text.replace(a,z)
inverse=text
for a,z in reversed(substitutions):
 assert inverse.count(z)==1;inverse=inverse.replace(z,a)
assert inverse.encode()==oldraw
ast.parse(text)
script=write('snapshot.py',text.encode())
write('DIFF.patch',''.join(difflib.unified_diff(oldraw.decode().splitlines(True),text.splitlines(True),fromfile=str(OLD/'snapshot.py'),tofile=str(HERE/'snapshot.py'))).encode())
write('CONFIG-DIFF.patch',''.join(difflib.unified_diff(configraw.decode().splitlines(True),(HERE/'CONFIG.json').read_text().splitlines(True),fromfile=str(OLD/'CONFIG.json'),tofile=str(HERE/'CONFIG.json'))).encode())
base=[config['requiredPythonPath'],'-I','-B',script['path'],config['observedCopyReceipt']['path'],config['observedCopyReceipt']['sha256'],config['observedDecision'],'/Users/zacheryspector/studio-scratch/1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1']
argv=dict(schema='m0-additive-after-aj-full-guard-argv-proposal/v1',status='UNRUN_UNADOPTED_PARENT_SCOPE_REFUSES_BEFORE_HELPER_IMPORT',executionAuthorization=False,cwd='/Users/zacheryspector/The-Movies-headless-program',environment={'GIT_OPTIONAL_LOCKS':'0','PYTHONDONTWRITEBYTECODE':'1'},guardScriptSha256=script['sha256'],sourceConfigSha256=cfg['sha256'],beforeFill=base+['before-fill','before-fill-after-aj-r1'],afterFill=base+['after-fill','after-fill-after-aj-r1','<ACTUAL_INDEPENDENTLY_ACCEPTED_AJ_BASELINE_PATH>','<ACTUAL_INDEPENDENTLY_ACCEPTED_AJ_BASELINE_SHA>'],postflight=base+['postflight','postflight-after-aj-r1','<ACTUAL_INDEPENDENTLY_ACCEPTED_AJ_BASELINE_PATH>','<ACTUAL_INDEPENDENTLY_ACCEPTED_AJ_BASELINE_SHA>','<ACTUAL_HELPER_SUPERVISOR_WORKER_CHILD_PGIDS_CSV>'],recording='Parent direct recorded scan with pinned source/config/argv/stdout/stderr/tool outcome; no HEAVY-LANE-LOCK helper because unchanged guard checks lock absent.',rawPsFdPolicy='Local-only raw PS/FD, publish hashes/sizes only.',claimLimit='Concrete retained H path inherited from prior accepted protection; fresh exact current identity/argv review still required. No scan authority until source scope is separately adopted and filled source/config reviewed.')
dump('ARGV-PROPOSAL.json',argv)
dump('STATIC-PROOF.json',dict(sourceSubstitutions=substitutions,exactOldBytesAfterInverseSubstitutions=True,syntaxParsedOnly=True,unchangedUtilityFunctions=9,mainExecutionGuardsUnchangedExceptSnapshotSchemaAndClaimLabel=True,allDependencyInventoryProtectedDigestAndPrivateProofEqualityPredicatesUnchanged=True,sourceConfigChanges={k:{'old':oldconfig.get(k),'new':config.get(k)} for k in config if oldconfig.get(k)!=config[k]},parentScopeDraftFailsExistingStatusAndDocsVerifiedGateBeforeHelperImport=True,newRootInProtectedInventory=False,newM0FdScopeOnly=True,preparationExecution='stdlib source/data authoring only; no guard/helper import, fullscan, source execution, Node, Git, tests or game'))
dump('PROVENANCE.json',dict(roles=roles,productionHeadFromParent=HEAD,productionHeadIndependentlyGitVerified=False,productionSourceTreeFromParent=SRC,privateBaselineUnchanged=oldconfig['privateBaseline'],historicalGuardSnapshotsNotAJAuthority=True,acceptedAdditiveRouteRemainsUnfilledHeld=True,acceptedSevenControlsDoNotGrantActualExtension=True))
print(json.dumps(dict(snapshot=script,config=cfg,parentScopeDraft=adrole,inputRoles=len(roles))))
