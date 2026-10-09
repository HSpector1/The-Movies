from pathlib import Path
import os,stat,hashlib,json,ast,difflib
S=Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-c0-m0-additive-expanded-readback-verifier-proposal-after-aj-20261009-r1'
Q=S/'1370-c0-m0-additive-expanded-readback-verifier-filled-proposal-after-aj-20261009-r2'
def signature(st):return [st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns]
def read(p,expected=None):
 p=Path(p);fd=os.open('/',os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
 try:
  for part in p.parent.parts[1:]:
   new=os.open(part,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd);os.close(fd);fd=new
  before=os.stat(p.name,dir_fd=fd,follow_symlinks=False);assert stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=2000000
  f=os.open(p.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=fd)
  try:
   assert signature(os.fstat(f))==signature(before);blocks=[];size=0
   while True:
    block=os.read(f,65536)
    if not block:break
    size+=len(block);assert size<=2000000;blocks.append(block)
   assert size==before.st_size and signature(os.fstat(f))==signature(before)==signature(os.stat(p.name,dir_fd=fd,follow_symlinks=False))==signature(p.lstat())
  finally:os.close(f)
 finally:os.close(fd)
 b=b''.join(blocks);r={'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
 if expected:assert r['sha256']==expected
 return b,r
def obj(p,sha=None):b,r=read(p,sha);return json.loads(b),r
def role(p):return read(p)[1]
pins,oldpins=obj(P/'SOURCE-PINS.json','e248ed880d2e7ff72d790840b768d1441237b2939a424441042bcdbd125f7061')
original={}
for n,r in pins['files'].items():
 b,got=read(P/n,r['sha256']);assert got==r;original[n]=b
sourceReview,sourceReviewRole=obj(S/'1370-c0-m0-additive-expanded-readback-verifier-independent-source-review-after-aj-20261009-r1/RECEIPT.json','81b265485e77dbb7ca5ed5c6c55b4a5913045371e8c971f00e44d4416648ed54')
cfg=json.loads(original['CONFIG.json']);assert cfg['futureAuthority'] is None
outcome,outcomeRole=obj(S/'1370-c0-m0-additive-exact-parent-adoption-after-aj-20261009-r1/TOOL-OUTCOME.json','12e398382dc7a08830c01f09f1a14e8e30eed3cb8ea61729d6e82d1c763bf846')
for k in ['actualToolExit','actualHelperExit','actualSupervisorExit','actualRecorderExit','actualChildExit']:assert type(outcome[k]) is int and outcome[k]==0
assert outcome['unexpectedHelperWait'] is False and outcome['protectedFreezeContinues'] is True
binding,bindingRole=obj(outcome['adoptedBinding']['path'],outcome['adoptedBinding']['sha256']);assert bindingRole==outcome['adoptedBinding'] and bindingRole['sha256']==outcome['bindingSha256']
packet={'binding':bindingRole,'exactReview':role(binding['exactBindingReviewPath']),'preflightReview':role(binding['preflightReviewPath']),'parentToolOutcome':outcomeRole,'actualTool':outcome['actualTool'],'helperMeta':outcome['helperMeta'],'recorderResult':outcome['outputRoles']['RESULT.json'],'supervisorResult':outcome['outputRoles']['SUPERVISOR.json'],'bodyResult':outcome['outputRoles']['ADDITIVE-RESULT.json'],'firstWritePhase':outcome['outputRoles']['FIRST-WRITE-PHASE.json'],'childOwned':outcome['outputRoles']['CHILD-OWNED.json'],'childStdout':outcome['outputRoles']['child.stdout'],'childStderr':outcome['outputRoles']['child.stderr'],'originalSiblingReceipt':{k:cfg['originalSiblingReceipt'][k] for k in ['path','bytes','sha256']}}
assert packet['exactReview']['sha256']==binding['exactBindingReviewSha256'] and packet['preflightReview']['sha256']==binding['preflightReviewSha256']
raws={};loaded={}
for n,r in packet.items():
 b,got=read(r['path'],r['sha256']);assert got==r;raws[n]=b
 if n not in ['helperMeta','childStdout','childStderr']:loaded[n]=json.loads(b)
assert loaded['actualTool']['chunks'][-1]['exit_code']==0
assert loaded['exactReview']['decision']=='ACCEPT_EXACT_FILLED_UNRUN' and loaded['preflightReview']['decision']=='ACCEPT_M0_ADDITIVE_PREFLIGHT'
assert len(raws['helperMeta'].decode().splitlines())==3 and raws['helperMeta'].decode().splitlines()[-1].startswith('end, exit 0; ')
rec=loaded['recorderResult'];sup=loaded['supervisorResult'];body=loaded['bodyResult'];owner=loaded['childOwned'];phase=loaded['firstWritePhase']
assert rec['status']==sup['status']=='ADDITIVE_UNREVIEWED_UNRUN' and rec['childExit']==sup['workerExit']==0 and rec['groupClear'] is True and sup['workerGroupClear'] is True and sup['childGroupClear'] is True and sup['timedOut'] is False
assert rec['specSha256']==sup['specSha256']==bindingRole['sha256'] and sup['recorderSha256']==packet['recorderResult']['sha256']
assert outcome['actualWorkerPid']==sup['workerPid']==owner['workerPid']==45183 and outcome['actualChildPid']==owner['childPid']==rec['childPid']==sup['childGroup']==body['childPid']==phase['pid']==45200
assert body['status']=='ADDITIVE_SOURCE_INPUTS_PENDING_INDEPENDENT_EXPANDED_READBACK' and body['regularFiles']==1740 and body['regularBytes']==119393120 and body['typesReady'] is False and body['gameAccepted'] is False
assert body['inputsSha256']==cfg['fixedRoles']['inputs']['sha256'] and body['rootBefore']==rec['rootBefore']==phase['rootBefore']==binding['originalM0RootMetadata'] and body['rootAfter']==body['rootFinal']==rec['rootAfter']
assert rec['stdoutSha256']==packet['childStdout']['sha256'] and rec['stderrSha256']==packet['childStderr']['sha256'] and packet['childStderr']['bytes']==0 and rec['additiveReceiptSha256']==packet['bodyResult']['sha256']
assert not os.path.lexists(cfg['outputPath'])
cfg['futureAuthority']={'status':'AUTHENTIC_ACTUAL_COMPLETION_PACKET_READBACK_UNRUN','roles':packet}
cfg['outputPath']=str(S/'1370-c0-m0-additive-expanded-readback-facts-after-aj-20261009-r2.json');assert not os.path.lexists(cfg['outputPath'])
Q.mkdir(mode=0o700)
for n,b in original.items():(Q/n).write_bytes(b)
(Q/'CONFIG.json').write_text(json.dumps(cfg,indent=2,sort_keys=True)+'\n')
assert (Q/'verify-expanded.py').read_bytes()==original['verify-expanded.py'];ast.parse((Q/'verify-expanded.py').read_text())
for n in ['FILL-REQUIREMENTS.json','REUSE-PROOF.json','REPORT.md']:assert (Q/n).read_bytes()==original[n]
newpins={'status':'FILLED_ACTUAL_PACKET_READBACK_UNRUN_REVIEW_REQUIRED','files':{n:role(Q/n) for n in pins['files']},'executionAuthorization':False,'verifierExecutionPerformed':False,'originalSourcePins':oldpins,'originalSourceReview':sourceReviewRole}
(Q/'SOURCE-PINS.json').write_text(json.dumps(newpins,indent=2,sort_keys=True)+'\n')
recipe,oldrecipe=obj(P/'RECIPE.json');recipe['argv'][3]=str(Q/'verify-expanded.py');recipe['argv'][4]=role(Q/'SOURCE-PINS.json')['sha256'];recipe['status']='FILLED_PACKET_UNRUN_SEPARATE_ROOT_GRANT_REQUIRED'
(Q/'RECIPE.json').write_text(json.dumps(recipe,indent=2,sort_keys=True)+'\n')
diff=''.join(difflib.unified_diff(original['CONFIG.json'].decode().splitlines(keepends=True),(Q/'CONFIG.json').read_text().splitlines(keepends=True),fromfile='immutable-authority-null-r1',tofile='actual-packet-filled-r2'))
(Q/'CONFIG.json.diff').write_text(diff)
facts={'status':'ACTUAL_AUTHORITY_FILL_ONLY_NOT_PHYSICAL_READBACK','sourcePins':role(Q/'SOURCE-PINS.json'),'originalSourcePins':oldpins,'originalSourceReview':sourceReviewRole,'originalRecipe':oldrecipe,'parentToolOutcome':outcomeRole,'actualToolSession':45234,'actualFiveExitsAllZero':True,'actualHelperPid':44676,'actualWorkerPid':45183,'actualChildPid':45200,'parentReportedFreshAbsentPidsAndPgids':outcome['ownedPidsAndPgidsFreshlyAbsent'],'authorFreshGroupProbePerformed':False,'packetRoles':packet,'exact14RoleCount':len(packet),'verifierByteIdentical':True,'otherThreeSourcePinnedDocumentsByteIdentical':True,'configChanges':['futureAuthority','outputPath'],'actualBodyAndPhaseRootMetadataPreserved':True,'mirrorPayloadInventoryRead':False,'dependencyPackagesRead':False,'verifierImportedOrExecuted':False,'sourceTestsOrGameRun':False,'executionAuthorization':False,'originalReportRemainsHistoricalAuthorityNullPreparation':True,'originalReadbackSourceDecisionCarriedOnlyForByteIdenticalVerifier':True,'fullProtectedPostflightAccepted':False,'claimLimit':'Metadata fill authenticated real parent tool/meta/producer receipt bytes only; source reader remains unrun, physical expanded1740 proof and postflight not admitted. Root/m0 independent fill review and separate actual240 grant required.','configDiff':role(Q/'CONFIG.json.diff'),'recipe':role(Q/'RECIPE.json'),'fillAuthor':role(Path(__file__))}
(Q/'FILL-RECEIPT.json').write_text(json.dumps(facts,indent=2,sort_keys=True)+'\n')
(Q/'FILL-PINS.json').write_text(json.dumps({'status':'FILL_PROVENANCE_ONLY_UNRUN','files':{n:role(Q/n) for n in ['SOURCE-PINS.json','RECIPE.json','CONFIG.json.diff','FILL-RECEIPT.json']}},indent=2,sort_keys=True)+'\n')
print(json.dumps({'sourcePins':role(Q/'SOURCE-PINS.json'),'config':role(Q/'CONFIG.json'),'verifier':role(Q/'verify-expanded.py'),'recipe':role(Q/'RECIPE.json'),'fillReceipt':role(Q/'FILL-RECEIPT.json'),'fillPins':role(Q/'FILL-PINS.json')}))
