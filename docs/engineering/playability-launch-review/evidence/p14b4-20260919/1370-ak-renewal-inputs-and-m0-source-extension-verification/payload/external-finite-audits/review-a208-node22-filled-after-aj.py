from pathlib import Path
import os,stat,json,hashlib,ast,difflib
S=Path('/Users/zacheryspector/studio-scratch');P=S/'1370-c0-a208-finite-recorded-controls-node22-filled-source-after-aj-20261009-r1';O=S/'1370-c0-a208-finite-recorded-controls-filled-source-after-aj-20261009-r1'
roles={};raws={}
def read(p,sha=None):
 p=Path(p);parent=os.open('/',os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
 def sig(st):return [st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns]
 try:
  for name in p.parent.parts[1:]:
   fd=os.open(name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=parent);os.close(parent);parent=fd
  before=os.stat(p.name,dir_fd=parent,follow_symlinks=False);assert stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<300000
  fd=os.open(p.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
  try:
   assert sig(os.fstat(fd))==sig(before);blocks=[];size=0
   while True:
    b=os.read(fd,65536)
    if not b:break
    size+=len(b);assert size<300000;blocks.append(b)
   assert size==before.st_size and sig(os.fstat(fd))==sig(before)==sig(os.stat(p.name,dir_fd=parent,follow_symlinks=False))==sig(p.lstat())
  finally:os.close(fd)
 finally:os.close(parent)
 raw=b''.join(blocks);r={'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
 if sha:assert r['sha256']==sha
 roles[str(p)]=r;raws[str(p)]=raw;return raw
def obj(p,sha=None):return json.loads(read(p,sha))
pins=obj(P/'SOURCE-PINS.json','8e3d9c290e07e9f4be06fac3c0b31aa1d371e4dc6fd9976455135c348582d1c5')
for n,r in pins['files'].items():
 p=Path(r.get('path',P/n));b=read(p,r['sha256']);assert len(b)==r['bytes'] and p==P/n
cfg=obj(P/'CONFIG.json','09a59741bdb24e8641ca82e2ac4ee1aa95bde7c82bf779603aface088c0f6afb');route=obj(P/'ROUTE.json');proof=obj(P/'INVERSE-AND-ROLE-PROOF.json')
oldpins=obj(O/'SOURCE-PINS.json','9548de6af338fe98a3dde78a1599850152fdab48db0c9e25576de8deb48acecc');oldcfg=obj(O/'CONFIG.json','53b996cf65721bab186ed2043031fb470ad8868d838fac7ab0cd17bad81b0565');oldroute=obj(O/'ROUTE.json')
loaded={}
for n,r in cfg['roles'].items():
 b=read(r['path'],r['sha256']);assert len(b)==r['bytes']
 try:loaded[n]=json.loads(b)
 except (json.JSONDecodeError,UnicodeError):pass
for n,r in cfg['observerFiles'].items():
 b=read(r['path'],r['sha256']);assert len(b)==r['bytes'] and r==oldcfg['observerFiles'][n]
assert len(cfg['observerFiles'])==18 and len(cfg['roles'])==30 and len(pins['files'])==15
assert set(p.name for p in P.iterdir())==set(pins['files'])|{'SOURCE-PINS.json','READY-RECEIPT.json'}
ready=obj(P/'READY-RECEIPT.json');assert ready['sourcePins']['sha256']==roles[str(P/'SOURCE-PINS.json')]['sha256'] and ready['actualRuntimeGrant'] is None
for n in ['drive.py','report_guard.py','test_reports.py']:
 assert read(P/n)==read(O/n,oldpins['files'][n]['sha256'])
oldrec=read(O/'record.py',oldpins['files']['record.py']['sha256']).decode();newrec=raws[str(P/'record.py')].decode()
assert roles[str(P/'record.py')]['sha256']=='3767643eff8348e7bf132e6eee3be132747e96b581d7f916d48964bf8f9d8ddb'
normalized=newrec
for before,after in proof['recorderLiteralSubstitutions']:
 assert oldrec.count(before)==1 and newrec.count(after)==1;normalized=normalized.replace(after,before)
assert normalized==oldrec and ast.dump(ast.parse(normalized),include_attributes=False)==ast.dump(ast.parse(oldrec),include_attributes=False)
assert set(k for k in cfg if cfg[k]!=oldcfg[k])==set(proof['configChangedFields'])=={'nodePath','nodeBytes','nodeSha256','pythonFixture','roles','runtimeGrant'}
assert set(k for k in route if route[k]!=oldroute[k])==set(proof['routeChangedFields'])=={'commands','cwd','grant'}
expectedCfg={**oldcfg,'nodePath':cfg['nodePath'],'nodeBytes':cfg['nodeBytes'],'nodeSha256':cfg['nodeSha256'],'pythonFixture':cfg['pythonFixture'],'roles':cfg['roles'],'runtimeGrant':cfg['runtimeGrant']};assert cfg==expectedCfg
added={'operationalToolAmendment','operationalToolAmendmentReview','operationalToolAmendmentAdoption'};assert set(cfg['roles'])==set(oldcfg['roles'])|added
for n,r in oldcfg['roles'].items():
 want=dict(r)
 if n in ['driver','reportGuard','reportControls']:want['path']=str(P/Path(r['path']).name)
 assert cfg['roles'][n]==want
amend=loaded['operationalToolAmendment'];review=loaded['operationalToolAmendmentReview'];adoption=loaded['operationalToolAmendmentAdoption']
assert cfg['roles']['operationalToolAmendment']['sha256']=='df2388f17e90bcce7db0397fc9f7d706a4c2db9c823567c272fede7572c06310'
assert cfg['roles']['operationalToolAmendmentReview']['sha256']=='747ee2283e8de0584323c5107670614cf95b75229e2a1e1a3cbf492f17eb64db'
assert cfg['roles']['operationalToolAmendmentAdoption']['sha256']=='7da501eb54301aaf0a22c5dc29e4dff786ee4bd9bfff490153d951c54bd7b9eb'
assert {k:cfg[k] for k in ['nodePath','nodeBytes','nodeSha256']}==amend['requestedConfigReplacement']
assert cfg['runtimeGrant']==cfg['roles']['operationalToolAmendmentAdoption']==route['grant'] and cfg['roles']['prospectiveControlScope']==oldcfg['roles']['prospectiveControlScope']
assert cfg['executionAuthorization'] is False and route['executionAuthorization'] is False and review['executionAuthorization'] is False and adoption['executionAuthorization'] is False
assert review['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_A208_NODE22_OPERATIONAL_AMENDMENT'
assert route['cwd']==str(P) and cfg['pythonFixture']==str(S/'1370-c0-a208-python-controls-fixture-after-aj-node22-20261009-r1')
for mode,command in route['commands'].items():
 assert command[0]=='/bin/bash' and command[1]==cfg['roles']['helper']['path'] and command[2]=='0' and command[4]==cfg['pythonPath'] and command[5:7]==['-I','-B'] and command[-2:]==[str(P/'record.py'),mode]
 assert command[3]==str(S/('1370-c0-a208-controls-'+mode+'-lane-after-aj-node22-20261009-r1')/'controls.log')
 outputs=S/('1370-c0-a208-controls-'+mode+'-output-after-aj-node22-20261009-r1')
 assert not os.path.lexists(outputs) and not os.path.lexists(command[3]) and not os.path.lexists(command[3]+'.meta')
assert not os.path.lexists(cfg['pythonFixture'])
assert adoption['status']=='ROOT_ADOPTED_PROSPECTIVE_NODE22_TOOL_MATCH_SOURCE_ONLY' and adoption['actualRuntimeGrant'] is None and adoption['controlsObserved'] is False
assert adoption['proposal']['sha256']==cfg['roles']['operationalToolAmendment']['sha256'] and adoption['independentReview']['sha256']==cfg['roles']['operationalToolAmendmentReview']['sha256']
for name in ['CONFIG.json','ROUTE.json','record.py']:
 diff=''.join(difflib.unified_diff(raws[str(O/name)].decode().splitlines(keepends=True),raws[str(P/name)].decode().splitlines(keepends=True),fromfile=str(O/name),tofile=str(P/name)))
 assert diff==raws[str(P/(name+'.diff'))].decode()
Q=S/'1370-c0-a208-finite-recorded-controls-node22-filled-independent-source-review-after-aj-20261009-r1';Q.mkdir(mode=0o700)
facts={'status':'NODE22_DERIVATIVE_SOURCE_ONLY_UNRUN','roles':roles,'configRoleCount':30,'packagePhysicalFileCount':17,'manifestEntryCount':15,'manifestAndReadySeparatelyAuthenticated':True,'observerFileCount':18,'localModulesByteIdentical':True,'recorderFullInverseTextAndNormalizedAstExact':True,'recorderSubstitutions':proof['recorderLiteralSubstitutions'],'configChangedFields':proof['configChangedFields'],'routeChangedFields':proof['routeChangedFields'],'threeDiffsIndependentlyReproduced':True,'actualOperationalAmendmentReviewAndAdoptionPinned':True,'sourceOnlyRuntimeGrant7daIsNotExecutionPermission':True,'original39ffScopeRetained':True,'freshFixtureOutputLanePathsAbsentAtReview':True,'actualNodeExecutableIdentity':{k:cfg[k] for k in ['nodePath','nodeBytes','nodeSha256']},'nodeBinaryReadOrExecuted':False,'historicalNativeNode20TapLabelInformationalOnly':True,'node20Node22EquivalenceClaimed':False,'actualSourceReviewOrRuntimeGrantInsertedByReviewer':False,'sourceImportTestsNodeGameFullscanGitOrProtectedWritePerformed':False,'reviewerCountingCorrection':'Two reviewer-only author assertions incorrectly treated17 physical files as17/16 manifest entries. Manifest has15 entries plus SOURCE-PINS and separately linked READY-RECEIPT; corrected without producer changes. No controls or producer source failed.'}
(Q/'FACTS.json').write_text(json.dumps(facts,indent=2,sort_keys=True)+'\n')
report='''ACCEPT_SOURCE_ONLY_UNRUN_A208_NODE22_FILLED_CONTROLS_ROUTE. All17 physical package files (15 manifest entries plus manifest and separately source-linked READY) and all30 CONFIG roles are authenticated by bounded stable nofollow FD/path reads. Original Node20 package9548/reviewe304 remains preserved. Exactly18 observer roles are unchanged, and fresh drive.py/report_guard.py/test_reports.py bytes equal the accepted originals. Reversing recorder CONFIG_SHA/output substitutions restores full old text and normalized AST; the three supplied diffs independently reproduce exactly. CONFIG changes only nodePath/nodeBytes/nodeSha256, fresh fixture/local role pointers, three actual operational amendment roles, and runtimeGrant metadata. ROUTE changes only commands/cwd/grant wiring. All bounds/counts/assertions/cleanup controls remain unchanged.

Node22 fields exactly match adopted amendment7da501, independent747ee and proposedd f2388 role (full SHA fields in receipt). The CONFIG runtimeGrant names ROOT_ADOPTED_PROSPECTIVE_NODE22_TOOL_MATCH_SOURCE_ONLY, executionAuthorizationfalse, actualRuntimeGrantnull; original39ff scope remains separately authenticated. That dictionary is not an actual launch grant. Parent outer wrapper must validate new filled receipt/sourcepins/config/recorder/ROUTE and explicit source-only scope semantics plus fresh tool/HEAD/src/remote/clean/FD/process/owned-group/lock/AC/disk/path guards. Root must separately grant each arm only after current M0 postflight admission. No future review/grant was inserted or fabricated.

The existing native-node20-tap return string is historical informational protocol text; actual future tool is Node22.23.2/SHA0b4f0599 and must satisfy unchanged13 ordered TAP groups and zero fail/cancel/skip/todo summary. Python3 pure report methods precede14 observer methods; original7 direct owned groups/4 sandbox probes and inherited descendant containment remain required. All60/75/90 and45/55 clocks, stream/fixture caps, actual exit/override/sticky deadline/cleanup refusals remain. No Node22 testpass, Node20/22 equivalence, A208 measurement or renewal pay closure is claimed. Prepared fresh paths were absent at this review; source/adoptedpreflight checks at actual launch remain separate. Reviewer executed only stdlib artifact/audit author code, never imported producer modules or ran tests/Node/game/fullscan/Git mutation.
'''
(Q/'REPORT.md').write_text(report)
def ownrole(p):b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
receipt={'schema':'1370-a208-node22-filled-controls-independent-source-review-v1','decision':'ACCEPT_SOURCE_ONLY_UNRUN_A208_NODE22_FILLED_CONTROLS_ROUTE','sourcePinsSha256':roles[str(P/'SOURCE-PINS.json')]['sha256'],'configSha256':roles[str(P/'CONFIG.json')]['sha256'],'recorderSha256':roles[str(P/'record.py')]['sha256'],'routeSha256':roles[str(P/'ROUTE.json')]['sha256'],'sourceDirectory':str(P),'roles':{'SOURCE-PINS.json':roles[str(P/'SOURCE-PINS.json')],'CONFIG.json':roles[str(P/'CONFIG.json')],'record.py':roles[str(P/'record.py')],'ROUTE.json':roles[str(P/'ROUTE.json')],'FACTS.json':ownrole(Q/'FACTS.json'),'REPORT.md':ownrole(Q/'REPORT.md'),'AUDIT':ownrole(Path(__file__))},'adoptedAmendment':cfg['roles']['operationalToolAmendmentAdoption'],'amendmentReview':cfg['roles']['operationalToolAmendmentReview'],'predecessorNode20SourcePins':pins['originalNode20SourcePins'],'predecessorNode20FilledReview':pins['originalNode20FilledReview'],'findings':[],'recorderExactInverseTwoSubstitutions':True,'localDriverReportGuardProtocolTestsByteIdentical':True,'observer18RolesAndBoundsUnchanged':True,'actual30ConfigRolesAuthenticated':True,'nativeNode20TapHistoricalLabel':True,'node20Node22EquivalenceClaimed':False,'actualControlsObserved':False,'executionPerformed':False,'executionAuthorization':False,'actualRuntimeGrant':None,'renewalCausesClosed':0,'remainingGates':['Current M0 readback/full protected postflight admission.','Root independently reviewed exact outer wrapper/fresh guards and separate actual JS/Python arm grants.','Actual controls and independent observed outcome/raw helper/meta/registry/cleanup review.']}
(Q/'RECEIPT.json').write_text(json.dumps(receipt,indent=2,sort_keys=True)+'\n');print(json.dumps({'receipt':ownrole(Q/'RECEIPT.json'),'facts':receipt['roles']['FACTS.json'],'report':receipt['roles']['REPORT.md']}))
