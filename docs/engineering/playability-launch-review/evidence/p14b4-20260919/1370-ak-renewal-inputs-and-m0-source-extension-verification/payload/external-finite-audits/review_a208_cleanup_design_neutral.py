import pathlib,json,hashlib,stat,os,ast,datetime
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-c0-a208-python-controls-stop-independent-observed-review-after-aj-20261009-r1'
D=S/'1370-c0-a208-owned-cleanup-diagnostics-independent-design-review-after-aj-20261009-r1'
def stamp(st):return (st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns)
def role(path):
    p=pathlib.Path(path);st=p.lstat()
    assert stat.S_ISREG(st.st_mode) and st.st_nlink==1 and p.resolve(strict=True)==p and st.st_size<=1048576
    raw=p.read_bytes();assert stamp(p.lstat())==stamp(st)
    return {'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
plan=role(P/'NEXT-SLICE-DESIGN.md');assert plan['sha256']=='89303d79de42e09f2db6804686d2c741552fe51bfddbc1eed4eb30e09c4214ad'
stop=role(P/'RECEIPT.json');assert stop['sha256']=='61b7698513fbe12d0f2705da01e70762f41fd2544254cadc09e381f3459b0496'
sr=json.loads((P/'RECEIPT.json').read_bytes());assert sr['decision']=='ACCEPT_OBSERVED_A208_PYTHON_CONTROLS_STOP_ONLY'
parent=role(S/'1370-c0-a208-controls-observed-parent-adoption-after-aj-20261009-r1/ADOPTION.json')
assert parent['sha256']=='9155410c75344c7933d97067ca28be28028842e8e08e4ba153807dd8f40f0fc5'
pa=json.loads(pathlib.Path(parent['path']).read_bytes())
assert pa['pythonStopReview']==stop and pa['js13Accepted'] is True and pa['pythonControlsAccepted'] is False and pa['executionAuthorization'] is False
roles={'sourcePlan':plan,'observedStop':stop,'parentObservedAdoption':parent}
for name,r in sr['roles'].items():assert role(r['path'])==r;roles[name]=r
assert sr['actualToolExit']==sr['actualHelperExit']==sr['actualRecorderExit']==2 and sr['actualDriverExit']==-14 and sr['suiteMethodReports']==[3,14] and sr['driverResultAbsent'] is True
assert sr['exactEPERMTargetCaptured'] is False and sr['EPERMCauseEstablished'] is False and sr['alarmCausalRelationEstablished'] is False and sr['rerunAuthorization'] is False
source=pathlib.Path(sr['roles']['driver']['path']).read_text();tree=ast.parse(source)
funcs={n.name:n for n in tree.body if isinstance(n,ast.FunctionDef)}
handlers=[n for n in ast.walk(funcs['hard_kill']) if isinstance(n,ast.ExceptHandler)]
assert len(handlers)==3 and all(isinstance(n.type,ast.Name) and n.type.id=='ProcessLookupError' for n in handlers)
assert "PHASE='cleanup';hard_kill()" in source
assert 'START=time.monotonic();ACTIVE=45;WHOLE=55' in source and 'signal.setitimer(signal.ITIMER_REAL,.25,.25)' in source
assert not D.exists();D.mkdir(mode=0o700)
def write(name,obj):
    raw=obj.encode() if isinstance(obj,str) else (json.dumps(obj,indent=2,sort_keys=True)+'\n').encode()
    fd=os.open(D/name,os.O_CREAT|os.O_EXCL|os.O_WRONLY|os.O_NOFOLLOW,0o600)
    with os.fdopen(fd,'wb') as f:os.fchmod(f.fileno(),0o600);f.write(raw);f.flush();os.fsync(f.fileno())
    return role(D/name)
requirements=[
    'Specify finite event/field/string/truncation/aggregate byte budgets within existing1MiB streams and8MiB owned fixture; retain partial records without alarm masking or blocking deadline extension.',
    'Capture exact retained existing target, intended PGID only where existing readiness proves it, last-known slot state and syscall including refresh/getpgid, signal, wait and absence refusals. Unavailable state remains unknown.',
    'Every EPERM, ownership uncertainty, timer/refusal or incomplete terminal record stays sticky STOP; late scoped absence cannot retroactively pass cleanup.',
    'Attempt remaining already-owned slots/probes only while original45/55 deadlines permit; no discovered/substituted targets, new signals, grace period or clearance waiver.',
    'Hard deadline and reentrant timer refusal have priority over diagnostics and must not be swallowed into a subsequent PASS.',
    'Authored synthetic injected EPERM/timer/cap RED/GREEN controls prove exact target/error retention, sticky STOP and remaining-owned attempts without assuming real host cause; all original3+14 method assertions remain unchanged.',
    'Fresh derivative source/config/recorder/protocol roles need independent review before separate actual root control/diagnostic grants; no automatic rerun.'
]
checks=write('CHECKS.json',{'roles':roles,'audit':role(pathlib.Path(__file__)),'sourceCleanupHoleConfirmed':True,'sourceHardKillCatchesOnlyProcessLookupError':True,'actualTargetAndAlarmCauseUnknownPreserved':True,'requiredBounds':{'driverActive':45,'driverWhole':55,'recorderChild':60,'recorderActive':75,'recorderWhole':90,'eachStreamBytes':1048576,'ownedFixtureBytes':8388608},'requiredCounts':{'originalProtocolMethods':3,'originalObserverMethods':14,'directOwnedSlots':7,'inheritedSandboxProbes':4},'futureImplementationRequirements':requirements,'reviewerExecutedSignalsTestsNodeImportsGameScanGitOrProtectedMutation':False})
report=write('REPORT.md','''# Bounded owned-cleanup diagnostic design\n\nACCEPT_SOURCE_ONLY_HELD_A208_OWNED_CLEANUP_DIAGNOSTIC_DESIGN. Authenticated61b769 STOP/root915541 establish tool/helper/recorder2, driver-14, reported3+14 methods OK, missing driver RESULT and unknown EPERM target/cause. Late scoped absence of13 known numeric IDs does not pass Python cleanup.\n\nSource hard_kill catches ProcessLookupError only at its existing signal calls. A PermissionError escaping its finally call bypasses later cleanup and report finalization. Bounded per-target state/syscall/attempt/refusal diagnostics, sticky STOP and continuation across remaining already-owned targets address this reporting gap. Periodic timer and observed-14 are source/result facts; no SIGALRM sender or causal explanation is admitted.\n\nFuture implementation must fix finite event/field/aggregate budgets under existing1MiB streams/8MiB fixture, preserve unmasked45/55 and60/75/90 limits, seven/four ownership scope and all17 original assertions. Capture existing targets and last-known state before risky calls; unavailable fields stay unknown. Hard deadline/refusal takes precedence over best-effort logging. No new targets/signals, group substitutions, grace periods or clearance waivers. Focused synthetic EPERM/timer/cap RED/GREEN controls and fresh independent source/protocol review precede any separate actual root grant.\n\nThis accepts source preparation only. Original sources/grant/streams/fixture/registry and STOP remain immutable. No tests/signals/Node/game/proposal imports/scans/Git/protected writes ran; no blocking design findings.\n''')
receipt=write('RECEIPT.json',{'schema':'1370-a208-owned-cleanup-diagnostics-independent-design-review-v1','decision':'ACCEPT_SOURCE_ONLY_HELD_A208_OWNED_CLEANUP_DIAGNOSTIC_DESIGN','sourcePlan':plan,'observedStop':stop,'parentObservedAdoption':parent,'checks':checks,'report':report,'findings':[],'permissionScope':'SOURCE_PREPARATION_ONLY; independent implementation/control review and separate actual root grants required','executionAuthorization':False,'actualDiagnosticRerunAuthorized':False,'pythonControlsAccepted':False,'exactEPERMTargetCaptured':False,'EPERMCauseEstablished':False,'alarmCausalRelationEstablished':False,'a208GameGranted':False,'renewalCausesClosed':0,'reviewerExecutedSignalsTestsNodeImportsGameScanGitOrProtectedMutation':False,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat()})
print(json.dumps({'receipt':receipt,'authenticatedRoles':len(roles)},indent=2))
