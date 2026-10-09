from pathlib import Path
import json,hashlib,os,stat,ast
S=Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-c0-a208-finite-recorded-controls-route-proposal-after-aj-20261009-r1'
D=S/'1370-c0-a208-finite-recorded-controls-route-independent-source-review-after-aj-20261009-r1'
assert not os.path.lexists(D);D.mkdir(mode=0o700)
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p):
 st=p.lstat();assert stat.S_ISREG(st.st_mode) and st.st_nlink==1 and not p.is_symlink() and p.resolve(strict=True)==p;raw=p.read_bytes();assert p.lstat()==st;return raw
def auth(r):
 b=read(Path(r['path']));assert len(b)==r['bytes'] and sha(b)==r['sha256'];return b
def role(p):
 b=read(p);return dict(path=str(p),bytes=len(b),sha256=sha(b))
def write(n,b):
 fd=os.open(D/n,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:os.fchmod(f.fileno(),0o600);f.write(b);f.flush();os.fsync(f.fileno())
def dump(n,x):write(n,(json.dumps(x,sort_keys=True,indent=2)+'\n').encode())
pinrole=role(P/'SOURCE-PINS.json');assert pinrole['sha256']=='9d405a6cfae2fe81bf6356aeb93e0df8c75b5399c7a524978cc9db7a5b73986f'
pins=json.loads(read(P/'SOURCE-PINS.json'))
for r in pins['files'].values():auth(r)
assert role(P/'RECEIPT.json')['sha256']=='a2e8f74a6e9599327b4000f5209849f19ae25ca20d8d443bb23e5b640283e973'
c=json.loads(read(P/'CONFIG.json'));route=json.loads(read(P/'ROUTE.json'));reuse=json.loads(read(P/'REUSE.json'))
assert c['runtimeGrant'] is None and c['sourceReview'] is None and c['executionAuthorization'] is False
assert route['grant'] is None and route['sourceReview'] is None and route['executionAuthorization'] is False
external={}
for k,r in c['roles'].items():
 auth(r);external[k]=r
for n,r in c['observerFiles'].items():assert r==c['roles']['observer:'+n]
auth(pins['observerPins']);auth(reuse['trackingPrecedent']);baseline=auth(reuse['baseline']).decode()
rec=read(P/'record.py').decode();transformed=baseline
for a,b in reuse['changes']:assert a in transformed;transformed=transformed.replace(a,b)
assert transformed==rec
def funcs(text):return {n.name:ast.dump(n,include_attributes=False) for n in ast.parse(text).body if isinstance(n,(ast.FunctionDef,ast.ClassDef))}
before,after=funcs(baseline),funcs(rec)
assert [k for k in before if before[k]!=after[k]]==['main']
counts={}
for name in ('test-supervisor.py','test-outer.py','test-settlement208-frame.py'):
 tree=ast.parse(auth(c['observerFiles'][name]));counts[name]=sum(isinstance(n,ast.FunctionDef) and n.name.startswith('test_') for n in ast.walk(tree))
assert counts=={'test-supervisor.py':5,'test-outer.py':7,'test-settlement208-frame.py':2}
for name in ('test-synthetic.mjs','test-settlement208.mjs'):
 source=auth(c['observerFiles'][name]).decode();counts[name]=source.count('\ntest(')
assert counts['test-synthetic.mjs']==6 and counts['test-settlement208.mjs']==7
assert counts==c['controlCounts']
driver=read(P/'drive.py').decode();ast.parse(driver)
assert "'A208_PYTHON_CONTROLS_PASS' if ok" in driver and "last.get('selectedRows')==23" in rec and "expected='PURE_A208_CONTROLS_PAIRS_AGREE'" in rec
lines=rec.splitlines();gate=next(i+1 for i,x in enumerate(lines) if "expected='PURE_A208_CONTROLS_PAIRS_AGREE'" in x)
findings=[dict(id='F1',severity='BLOCKER',path=str(P/'record.py'),line=gate,problem='Final success validation retains pricing-specific JSON fields/status and empty-stderr requirement; neither valid producer has that contract.',producers=dict(js={'argv':route['commands']['js'],'childOutput':'Node --test TAP for original6 plus new7 groups; no pricing JSON final line.','expectedGroups':13},python={'status':'A208_PYTHON_CONTROLS_PASS','methods':14,'failures':0,'errors':0,'ownedGroups':7,'inheritedProbes':4,'stdout':'Final driver JSON plus bounded test stdout.','stderr':'unittest.TextTestRunner(verbosity=2) writes normal success progress/summary to stderr.'}),consumer={'status':'PURE_A208_CONTROLS_PAIRS_AGREE','selectedRows':23,'immutablePairs':44,'mismatches':0,'originalOfferLocalCapture':False,'renewalAttribution':False,'stderrBytes':0},effect='Valid JS can fail JSON decoding of TAP; valid Python fails status/fields and empty-stderr predicate. Both arms STOP rather than qualify controls.',requiredRepair='Preserve r1. In a fresh route version, use mode-specific bounded report validation: JS exact TAP13/pass13/fail0 and no unexpected error/cancel/skip/todo; Python exact PASS/methods14/failures0/errors0/reason null/stickyStop null/cleanupErrors empty/7 actual owned reaped clear groups/4 inherited probes completed/elapsed within45/game false. Retain normal unittest stderr as authenticated diagnostics rather than requiring it empty. Alternatively author a reviewed thin JS summary producer, preserving all test and raw TAP bytes. Do not fabricate pricing fields or relabel a STOP.',requiredControls='Focused source-defined valid/invalid JS/Python report shape controls plus actual source-authenticated13 JS and14 Python runs under separate root grant after repaired source admission; reuse the unchanged parent ownership/clocks/failure-capture qualification only by exact body proof.')]
facts=dict(schema='1370-a208-finite-controls-independent-source-facts-r1',packagePins=pinrole,packageFilesAuthenticated=len(pins['files']),authorReadyReceipt=role(P/'RECEIPT.json'),externalRolesAuthenticated=len(external),externalRoles=external,observerFilesAuthenticated=len(c['observerFiles']),testCounts=counts,parentRecorderReuseExactDeclaredSubstitutions=True,parentRecorderChangedFunctions=['main'],parentOwnershipCaptureClocksAndCleanupFunctionAstsEqual=True,driverReview=dict(directForkRegistrationBeforeUnmask=True,durabilityAfterUnmask=True,WNOHANGPolls=True,ownedGroupsExpected=7,inheritedSandboxProbesExpected=4,inheritedGrandchildrenExpected=2,knownPidBeforeSetsidFallback=True,driverActive45Whole55=True,ownedFixtureCapBytes=8388608,aliasSubstitution='Only exact /usr/local/bin/python3 argument in the fixed sandbox fd-probe command becomes pinned config.pythonPath; tests themselves remain byte-identical.',qualificationLimit='Source review only: parent driver PGID owns inherited Popen probes and Node parent PGID owns native test workers. Actual IDs, reaping, absence, byte caps and timings are unobserved. Hard124 is STOP and grants no cleanup-clear claim. Probe communicate captures are capped after collection for fixed finite synthetic commands; this is not a generic preallocation-bounded subprocess capture interface.'),futureRuntimeAuthorityUnfilled=True,importsExecutionTestsNodeGameGitFullscansProtectedWrites=False,findings=findings)
dump('FINDINGS.json',findings);dump('FACTS.json',facts)
write('REPORT.md',b'''REFINE_SOURCE_ONLY_UNRUN: F1 is a concrete producer/consumer mismatch in final recorder validation. JS Node --test emits TAP; Python emits A208_PYTHON_CONTROLS_PASS and normal unittest stderr. The recorder still demands pricing-only PURE_A208_CONTROLS_PAIRS_AGREE/23/44 fields and empty stderr. Neither advertised successful control arm can be admitted. Original proposal remains unchanged and unrun.

Use fresh source-version mode-specific bounded report gates with exact test counts and genuine failure/cleanup refusal, retaining all streams. Do not change observer tests, manufacture pricing fields, or discard normal Python diagnostics. Final independent source acceptance and separate actual13JS/14Python grants remain necessary.

All eight package pins and23 config role hashes, author READY receipt,18 observer fixture files, declared recorder inverse substitutions and tracking precedent authenticate. Original5+7+2 Python methods and6+7 JS groups are exact. Parent recorder functions other than main are AST-identical to its qualified predecessor. Driver direct-fork registration, WNOHANG waits and pre-setsid fallback were reviewed; inherited sandbox probes and Node workers remain owned by their externally recorded parent groups. No additional concrete blocker was established in that bounded source pass.

No imports, Node/tests, game, scans, Git or protected/mirror writes occurred. Runtime tools/guards/grants stay unfilled. Source-implied ownership is not an observed PID/group-clear result; hard124 is an unqualified STOP. The fixed sandbox probe collection has post-capture size checks, not a general pre-growth-bounded communicate mechanism.
''')
receipt=dict(schema='1370-a208-finite-recorded-controls-independent-source-review-r1',decision='REFINE_SOURCE_ONLY_UNRUN',sourceDirectory=str(P),sourcePinsSha256=pinrole['sha256'],configSha256=role(P/'CONFIG.json')['sha256'],recorderSha256=role(P/'record.py')['sha256'],driverSha256=role(P/'drive.py')['sha256'],observerSourceReviewSha256=c['roles']['observerReview']['sha256'],findingsSha256=role(D/'FINDINGS.json')['sha256'],factsSha256=role(D/'FACTS.json')['sha256'],blockingFindings=['F1'],executionAuthorization=False,executionPerformed=False,actualControlsQualification=False,requiredFutureSourceGate='Use this fresh review schema with ACCEPT_SOURCE_ONLY_UNRUN_A208_FINITE_CONTROLS_ROUTE only after corrected report gates are independently accepted; no current runtime grant is admitted.')
dump('RECEIPT.json',receipt)
print(json.dumps(dict(directory=str(D),receipt=role(D/'RECEIPT.json'),findings=role(D/'FINDINGS.json'),externalRoles=len(external),counts=counts)))
