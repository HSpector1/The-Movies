from pathlib import Path
import os,stat,json,hashlib
S=Path('/Users/zacheryspector/studio-scratch');P=S/'1370-c0-a208-controls-node22-operational-amendment-proposal-after-aj-20261009-r1'
reads={}
def sig(s):return [s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns]
def read(p,expected=None,expectedBytes=None):
 p=Path(p);parent=os.open('/',os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
 try:
  for part in p.parent.parts[1:]:
   new=os.open(part,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=parent);os.close(parent);parent=new
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
 raw=b''.join(blocks);r={'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'mode':format(stat.S_IMODE(before.st_mode),'04o'),'nlink':before.st_nlink}
 if expected:assert r['sha256']==expected
 if expectedBytes is not None:assert r['bytes']==expectedBytes
 reads[str(p)]=r;return raw,r
def obj(p,sha=None,count=None):raw,r=read(p,sha,count);return json.loads(raw)
pins=obj(P/'SOURCE-PINS.json','eb9f27964717907a1dae602eb94608994ef1323ebda1e0bffc11cd6628f11f76')
for n,r in pins['files'].items():
 _,got=read(P/n,r['sha256'],r['bytes']);assert got['mode']==r['mode'] and got['nlink']==r['nlink']
a=obj(P/'PROPOSED-AMENDMENT.json','df2388f17e90bcce7db0397fc9f7d706a4c2db9c823567c272fede7572c06310');proof=obj(P/'ROLE-PROOF.json')
loaded={}
for name,r in proof['roles'].items():
 raw,got=read(r['path'],r['sha256'],r['bytes']);assert got==r;loaded[name]=json.loads(raw)
for name,r in proof['byteIdenticalLocalModulesRequired'].items():read(r['path'],r['sha256'],r['bytes'])
for name,r in proof['observerFiles18'].items():read(r['path'],r['sha256'],r['bytes'])
node=a['matchingOriginalR9Node22Tool'];oldnode=loaded['originalR9DraftReport']['actualNode']
assert all(node[k]==oldnode[k] for k in ['path','device','inode','mode','sha256'])
assert proof['authenticatedNode22Tool']==node and a['requestedConfigReplacement']=={'nodePath':node['path'],'nodeBytes':node['bytes'],'nodeSha256':node['sha256']}
binding=loaded['originalR9AdoptedBinding'];launch=loaded['originalR9AdoptedLaunch'];pre=loaded['originalR9AdoptedPreflight'];candidate=loaded['originalR9CandidatePins'];observed=loaded['originalR9ObservedReview']
assert binding['nodeExecPath']==node['path'] and binding['nodeVersion']==node['versionFromAuthenticatedOriginalR9Binding']=='v22.23.2'
assert candidate['files']['DRAFT-REPORT.json']==proof['roles']['originalR9DraftReport']['sha256']
assert launch['bindingSha256']==pre['adoptedBindingSha256']==observed['adoptedBindingSha256']==proof['roles']['originalR9AdoptedBinding']['sha256']
assert launch['candidatePinsSha256']==pre['candidatePinsSha256']==proof['roles']['originalR9CandidatePins']['sha256']
assert observed['decision']=='ACCEPT_OBSERVED_AGING_ERA_EMPLOYMENT_PREIMAGE' and observed['allThreeExactSourceFlightsEqual'] is True
oldcfg=loaded['preservedNode20Config'];oldpins=loaded['preservedNode20SourcePins'];oldreview=loaded['preservedNode20FilledReview'];scope=loaded['originalProspectiveScope']
assert oldreview['sourcePinsSha256']==proof['roles']['preservedNode20SourcePins']['sha256'] and oldreview['executionPerformed'] is False
assert {k:oldcfg[k] for k in ['nodePath','nodeBytes','nodeSha256']}==proof['preservedNode20Role']
assert proof['observerFiles18']==oldcfg['observerFiles'] and len(proof['observerFiles18'])==18
for n,r in proof['byteIdenticalLocalModulesRequired'].items():assert oldpins['files'][n]==r
assert a['unchanged']['bounds']==scope['bounds'] and a['unchanged']['expected']==scope['expected'] and a['unchanged']['intendedSequence']==scope['intendedSequence']
assert all(a['unchanged'][k] is True for k in ['allAssertionsAndStopConditions','driverReportGuardProtocolBytes','noEngineSourceOrGameRuleChange','observerFiles18'])
assert a['executionAuthorization'] is False and a['controlsOnNode22Observed'] is False and a['a208ValuesMeasured'] is False and a['historicalNode20ControlsOrR9ControlVersionEquivalenceClaimed'] is False
assert all(a[k] is None for k in ['actualRuntimeGrant','futureFillAllowedChanges' if False else 'futureFilledSource','futureFilledReview','independentAmendmentReview','parentAmendmentAdoption'])
guard=Path(proof['byteIdenticalLocalModulesRequired']['report_guard.py']['path']).read_text()
assert "return {'protocol':'native-node20-tap'" in guard and 'process.version' not in guard and "('tests',13)" in guard and "['1..13']" in guard
fd=os.open(node['path'],os.O_RDONLY|os.O_NOFOLLOW)
try:
 current=os.fstat(fd);named=Path(node['path']).lstat();assert sig(current)==sig(named)
 assert stat.S_ISREG(current.st_mode) and current.st_nlink==node['nlink']==1
 assert [current.st_dev,current.st_ino,format(stat.S_IMODE(current.st_mode),'04o'),current.st_size,current.st_mtime_ns,current.st_ctime_ns]==[node[k] for k in ['device','inode','mode','bytes','mtimeNs','ctimeNs']]
finally:os.close(fd)
Q=S/'1370-c0-a208-controls-node22-operational-amendment-independent-source-review-after-aj-20261009-r1';Q.mkdir(mode=0o700)
facts={'schema':'1370-a208-node22-amendment-independent-facts-v1','authenticatedRoles':reads,'historicalNodeRole':oldnode,'proposedNode22Role':node,'historicalNodeChain':{'draftReportPinnedByCandidate':True,'candidateLinkedByAdoptedLaunchAndPreflight':True,'bindingNodePathVersionLinkedByAcceptedObservedFlights':True},'currentNodeMetadataMatchesProof':True,'reviewerRepeatedNodeBinaryHash':False,'currentNodeStreamHashClaimSource':'Authenticated root-authored ROLE-PROOF; exact hash independently matches historical pinned DRAFT-REPORT. Current physical FD/path metadata independently checked. Actual launch must authenticate its own fresh tools.','observer18RoleBytesAuthenticated':True,'localDriverReportProtocolBytesAuthenticated':True,'preservedNode20VersionUnrun':True,'nativeNode20TapLabelInformationalOnly':True,'futureDerivativeNotAuthoredOrFilledByReviewer':True,'nodeTestsGameImportScanOrGitMutationExecuted':False}
(Q/'FACTS.json').write_text(json.dumps(facts,indent=2,sort_keys=True)+'\n')
report='''ACCEPT_SOURCE_ONLY_UNRUN_A208_NODE22_OPERATIONAL_AMENDMENT. The proposed tool role matches authenticated original R9 DRAFT-REPORT actualNode path/device/inode/mode/SHA0b4f0599. Candidate1e7b pins report7792; adopted launchb9dc/adopted preflighte04a and accepted observed d681 bind genuine R9 binding5e1c and its Node22.23.2 physical path/version/source flights. All37 finite artifact roles are authenticated through stable nofollow FD/path reads. Reviewer checked current Node physical FD/path identity/size/mode/mtime/ctime but did not repeat the115MB binary hash or execute Node; the current stream-hash observation is the authenticated root-author proof, matching the independently pinned historical hash. Fresh actual launch tool authentication remains mandatory.

Prospective adoption may allow only three CONFIG Node fields, fresh unused local/fixture/output/lane paths and required immutable source/amendment role pointers/hashes, recorder CONFIG_SHA/output literal substitutions with inverse byte proof, and corresponding ROUTE/recipe wiring. The original18 observer files, driver/report_guard/test_reports bytes, all assertions,60/75/90 and45/55 clocks/stream/fixture bounds/counts/cleanup remain exact. Full derivative review remains required before separate actual arm grants; this receipt neither fills a derivative nor certifies one that does not yet exist. Preserve Node20 package9548/reviewe304 and old actual/control labels. No cross-version equivalence or historical synthetic Node version is inferred.

The unchanged strict TAP validator returns native-node20-tap as an informational historical label. It does not check a Node version; actual executable identity comes from the future Node22 CONFIG/tool role and observed grant/meta/process evidence. Node22 still must produce exactly13 ordered passing tests and the existing zero-fail/cancel/skip/todo summary under unchanged refusals. Format incompatibility or any failed control remains STOP; do not widen the parser or relabel this proposal as a Node22 pass. Actual controls, current M0 postflight/current protection scope, filled source review and separate root grants remain pending. No A208 values or renewal causes are admitted.
'''
(Q/'REPORT.md').write_text(report)
def ownrole(p):raw=p.read_bytes();return {'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
receipt={'schema':'1370-a208-node22-operational-amendment-independent-source-review-v1','decision':'ACCEPT_SOURCE_ONLY_UNRUN_A208_NODE22_OPERATIONAL_AMENDMENT','sourcePinsSha256':reads[str(P/'SOURCE-PINS.json')]['sha256'],'amendmentSha256':reads[str(P/'PROPOSED-AMENDMENT.json')]['sha256'],'roles':{'SOURCE_PINS':reads[str(P/'SOURCE-PINS.json')],'PROPOSED_AMENDMENT':reads[str(P/'PROPOSED-AMENDMENT.json')],'ROLE_PROOF':reads[str(P/'ROLE-PROOF.json')],'FACTS':ownrole(Q/'FACTS.json'),'REPORT':ownrole(Q/'REPORT.md'),'AUDIT':ownrole(Path(__file__))},'findings':[],'originalR9Node22RoleProven':True,'permittedDerivativeOnly':True,'observer18AndLocalModulesMustRemainByteIdentical':True,'nativeNode20TapHistoricalLabelExplicit':True,'historicalSyntheticControlNodeIdentityUnresolved':True,'node20Node22EquivalenceClaimed':False,'actualNode22ControlsObserved':False,'actualRuntimeGrant':None,'futureFilledSource':None,'executionAuthorization':False,'reviewerNodeCommandOrTestsImportsGameScanGitMutation':False,'renewalCausesClosed':0,'claimLimit':'Prospective amendment source acceptance only. Future filled derivative independent review, current M0 postflight/current guards and root separate arm grants remain required.'}
(Q/'RECEIPT.json').write_text(json.dumps(receipt,indent=2,sort_keys=True)+'\n');print(json.dumps({'receipt':ownrole(Q/'RECEIPT.json'),'facts':receipt['roles']['FACTS'],'report':receipt['roles']['REPORT']}))
