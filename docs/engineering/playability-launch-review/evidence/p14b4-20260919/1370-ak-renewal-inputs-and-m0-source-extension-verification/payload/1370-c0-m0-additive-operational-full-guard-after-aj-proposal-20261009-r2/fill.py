from pathlib import Path
import ast, difflib, hashlib, json, os

HERE=Path(__file__).resolve().parent
B=Path('/Users/zacheryspector/studio-scratch')
OLD=B/'1370-c0-m0-operational-full-guard-preparation-20261009-r1'
PRE=B/'1370-c0-m0-additive-operational-full-guard-after-aj-proposal-20261009-r1'
AD=B/'1370-c0-m0-current-aj-scope-parent-adoption-after-aj-20261009-r1'
HEAD='f0fb818fe7534c3e3784206d16728b015c7f059a'
roles={}
def read(p,expected=None):
 p=Path(p);a=p.lstat();assert p.is_file() and not p.is_symlink() and a.st_size<=16*1024*1024
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  z=os.fstat(fd);parts=[];total=0
  while True:
   raw=os.read(fd,65536)
   if not raw:break
   total+=len(raw);assert total<=16*1024*1024;parts.append(raw)
  zz=os.fstat(fd)
 finally:os.close(fd)
 q=p.lstat()
 for k in ('st_dev','st_ino','st_mode','st_nlink','st_size','st_mtime_ns','st_ctime_ns'):assert getattr(a,k)==getattr(z,k)==getattr(zz,k)==getattr(q,k)
 raw=b''.join(parts);h=hashlib.sha256(raw).hexdigest()
 if expected:assert h==expected
 roles[str(p)]=dict(path=str(p),bytes=len(raw),sha256=h)
 return raw
def write(name,raw):
 fd=os.open(HERE/name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(raw)
 return dict(path=str(HERE/name),bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest())
def dump(name,v):return write(name,(json.dumps(v,sort_keys=True,indent=2)+'\n').encode())

oldraw=read(OLD/'snapshot.py','259c4bac30fd506a67779d2c59fd29f51c8a6f75e140f7c37f6cff625aa23a58')
oldcfgraw=read(OLD/'CONFIG.json','03d8bdfeba06f14d9f371484805f66d7fcc1013825e9d0875a4368f0d5a9033d')
oldcfg=json.loads(oldcfgraw)
read(OLD/'SOURCE-PINS.json','6941ca219fad32fe77982f71985052be5743d76820eea48caea2e0305c78bca9')
priorprov=json.loads(read(PRE/'PROVENANCE.json'))
for path,pin in priorprov['roles'].items():read(path,pin['sha256'])
ad=json.loads(read(AD/'ADOPTION.json','13be428dfe3bdba1bc4ce4f2348bd194d2473c4c812df2b5f0bfec936b76b8e8'))
facts=json.loads(read(AD/'DOCS-TRANSITION-FACTS.json','20c4ad5aba3580d5ff05e921e4a8d1ee824162257095a9aa6a63a74e69878017'))
assert ad['status']=='PARENT_ADOPTED_ISOLATED_M0_DIAGNOSTIC_DESIGN_ONLY' and ad['productionGuardHead']==HEAD and ad['productionSourceTree']==oldcfg['productionSourceTree']
assert ad['executionAuthorization'] is False and ad['currentFullGuardsYetRun'] is False and ad['H8708Waived'] is False and ad['combinedHFirstRouteUnchanged'] is True
assert ad['operationalTransition']['docsOnlyVerified'] is True and facts['ancestorVerified'] is True and facts['clean'] is True
assert facts['fromHead']==oldcfg['productionHead'] and facts['toHead']==HEAD and facts['sameSourceTree']==oldcfg['productionSourceTree']
assert len(facts['docsOnlyPaths'])==912 and all(p=='HANDOFF.md' or p.startswith('docs/') for p in facts['docsOnlyPaths'])
assert facts['remoteRefs']==ad['remoteRefsVerified']
config=dict(oldcfg)
config.update(schema='1370-m0-additive-after-aj-full-guard-config-r2',productionHead=HEAD,parentScopeAdoption={'path':str(AD/'ADOPTION.json'),'sha256':roles[str(AD/'ADOPTION.json')]['sha256']},additiveRecorderLockPath='/Users/zacheryspector/studio-scratch/1370-c0-m0-additive-recorded-20261009-r2.lock',m0FdProtectedRoot='/Users/zacheryspector/studio-scratch/1370-c0-m0-observer-mirrors-20261009-r2',declaredWitnessScratchChildren=[*oldcfg['declaredWitnessScratchChildren'],'1370-c0-m0-additive-recorded-output-20261009-r2'],status='SOURCE_PROPOSAL_UNRUN_CURRENT_SCOPE_ADOPTED_SCAN_GRANT_REQUIRED')
cfg=dump('CONFIG.json',config)
text=oldraw.decode()
subs=[("CONFIG_SHA='03d8bdfeba06f14d9f371484805f66d7fcc1013825e9d0875a4368f0d5a9033d'",f"CONFIG_SHA='{cfg['sha256']}'"),("'/1370-c0-m0-recorded-materialization-route-proposal-')","'/1370-c0-m0-recorded-materialization-route-proposal-','/1370-c0-m0-additive-recorded-route-proposal-')"),("and not os.path.lexists(config['m0RecorderLockPath']),'active heavy/copy/M0 lock')","and not os.path.lexists(config['m0RecorderLockPath']) and not os.path.lexists(config['additiveRecorderLockPath']),'active heavy/copy/M0/additive lock')"),(" module.assert_no_protected_writable_fds(dict(binding,productionRoot=config['retainedHParent'],commonGitRoot=config['retainedHParent']))"," module.assert_no_protected_writable_fds(dict(binding,productionRoot=config['retainedHParent'],commonGitRoot=config['retainedHParent']))\n module.assert_no_protected_writable_fds(dict(binding,productionRoot=config['m0FdProtectedRoot'],commonGitRoot=config['m0FdProtectedRoot']))"),("'fdOriginalAndEphemeralAndRetainedHPassed':True","'fdOriginalAndEphemeralAndRetainedHPassed':True,'fdOriginalM0ParentPassed':True"),("'schema':'1370-m0-operational-full-guard-snapshot-r1'","'schema':'1370-m0-additive-after-aj-full-guard-snapshot-r2'"),("operational production/common baseline is02d507.","operational production/common baseline isAJf0fb818. M0 original1677 preservation is separately checked by accepted additive route/readback; it is not in this guard immutable inventory.")]
for a,z in subs:assert text.count(a)==1;text=text.replace(a,z)
inverse=text
for a,z in reversed(subs):assert inverse.count(z)==1;inverse=inverse.replace(z,a)
assert inverse.encode()==oldraw
ast.parse(text)
script=write('snapshot.py',text.encode())
for name,original,new in [('DIFF.patch',oldraw.decode(),text),('CONFIG-DIFF.patch',oldcfgraw.decode(),(HERE/'CONFIG.json').read_text())]:write(name,''.join(difflib.unified_diff(original.splitlines(True),new.splitlines(True),fromfile=str(OLD/name),tofile=str(HERE/name))).encode())
base=[config['requiredPythonPath'],'-I','-B',script['path'],config['observedCopyReceipt']['path'],config['observedCopyReceipt']['sha256'],config['observedDecision'],'/Users/zacheryspector/studio-scratch/1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1']
argv=dict(schema='m0-additive-after-aj-full-guard-argv-proposal/v2',executionAuthorization=False,cwd='/Users/zacheryspector/The-Movies-headless-program',environment={'GIT_OPTIONAL_LOCKS':'0','PYTHONDONTWRITEBYTECODE':'1'},guardScriptSha256=script['sha256'],sourceConfigSha256=cfg['sha256'],beforeFill=base+['before-fill','before-fill-after-aj-r2'],afterFill=base+['after-fill','after-fill-after-aj-r2','<ACTUAL_INDEPENDENTLY_ACCEPTED_AJ_BASELINE_PATH>','<ACTUAL_INDEPENDENTLY_ACCEPTED_AJ_BASELINE_SHA>'],postflight=base+['postflight','postflight-after-aj-r2','<ACTUAL_INDEPENDENTLY_ACCEPTED_AJ_BASELINE_PATH>','<ACTUAL_INDEPENDENTLY_ACCEPTED_AJ_BASELINE_SHA>','<ACTUAL_HELPER_SUPERVISOR_WORKER_CHILD_PGIDS_CSV>'],recording='Parent direct recorded scan; exact source/config/current H argv and private output parents require review plus separate grant. No HEAVY-LANE-LOCK helper because accepted current guard requires lock absent.',rawPsFdPolicy='Local-only raw PS/FD, publish hashes/sizes only.',claimLimit='Parent current scope adopted; no guard scan authorized by preparation. H path inherited from accepted prior protection; fresh exact current identity review remains needed. Later baseline and actual groups are explicit placeholders, not guessed facts.')
dump('ARGV-PROPOSAL.json',argv)
dump('STATIC-PROOF.json',dict(exactOldSourceAfterInverseSubstitutions=True,sourceSubstitutions=subs,syntaxParsedOnly=True,allExistingLocksAndWorkerMarkersPreserved=True,newAdditiveLockAndWorkerMarker=True,newM0FdScopeOnly=True,M0InImmutableInventory=False,allFullInventoryProtectedDigestRootAncestrySourceAndPrivateEqualityPredicatesUnchanged=True,existingParentAdoptionPredicateUnchanged=True,sourceConfigChanges={k:{'old':oldcfg.get(k),'new':config[k]} for k in config if oldcfg.get(k)!=config[k]},docsTransitionParentFactsAuthenticated=True,docsTransitionPaths=912,noFreshGitOrGuardChecksRun=True))
dump('PROVENANCE.json',dict(roles=roles,preparationOnlyUnadoptedPredecessor=str(PRE),originalQualifiedSourceSha256=hashlib.sha256(oldraw).hexdigest(),currentScopeParentAdopted=True,currentFullGuardObserved=False,currentHeadClaimFromAuthenticatedParentFacts=True,privateBaselineUnchanged=oldcfg['privateBaseline'],historicalAHGuardNotAJProof=True,sourceExecutionImportsTestsScansGitGame=False,routeBodyAndSevenControlSourcesUnchanged=True))
print(json.dumps(dict(snapshot=script,config=cfg,inputRoles=len(roles),parentScopeAdoption=roles[str(AD/'ADOPTION.json')],docsTransitionFacts=roles[str(AD/'DOCS-TRANSITION-FACTS.json')],executionAuthorized=False)))
