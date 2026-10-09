import pathlib,json,hashlib,os,subprocess,datetime,importlib.util
S=pathlib.Path('/Users/zacheryspector/studio-scratch');O=pathlib.Path(__file__).parent
def sha(b):return hashlib.sha256(b).hexdigest()
def save(n,b):
 fd=os.open(O/n,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 return sha(b)
def dump(n,v):return save(n,(json.dumps(v,sort_keys=True,indent=2)+'\n').encode())
lane=S/'1370-c0-aging-era-employment-witness-r7-lane-20261008-r2';log=(lane/'witness-r7.lane.log').read_bytes();meta=(lane/'witness-r7.lane.log.meta').read_bytes()
assert log==b'{"status": "STOP_SUPERVISOR_EXIT_2"}\n{"status": "STOP_FRAME_SHAPE"}\n{"status":"PIPELINE_EXITS_CANDIDATE","outerExit":2,"sinkExit":2}\n'
lines=meta.decode().splitlines();assert len(lines)==3 and lines[0].startswith('waiting for pid 0; then: ') and lines[1]=='start; 2026-10-08 18:19:20 CDT' and lines[2]=='end, exit 2; 2026-10-08 18:19:25 CDT'
recordpath=S/'1370-c0-aging-era-employment-witness-r7-adoption-output-20261008-r2/PARENT-LAUNCH-RECORD.json';recordraw=recordpath.read_bytes();record=json.loads(recordraw)
binding=pathlib.Path(record['argv'][-2]);assert sha(binding.read_bytes())==record['bindingSha256']==record['argv'][-1]=='31eed0401487d0be2849c11dcb8e73c8ca6a3a636ec3a755085981ddd9bb4817'
source=S/'1370-c0-aging-era-employment-witness-source-r7';pinsraw=(source/'SOURCE-PINS.json').read_bytes();assert sha(pinsraw)=='69ca5043bb533908f722126fbc93fd59ce84f0d7388180f3b60c5074076aebc2'
for name,p in json.loads(pinsraw)['files'].items():assert sha((source/name).read_bytes())==p['sha256']
ps=subprocess.run(['/bin/ps','-axo','pid=,ppid=,pgid=,lstart=,state=,comm=,args='],capture_output=True,check=True).stdout
view=subprocess.run(['/bin/ps','-axo','comm=,args='],capture_output=True,check=True).stdout
markers=('fixture_worker.py','witness.mts','outer-recorder.py','/1370-c0-aging-era-employment-witness-source-r7/supervise.py')
assert not any(any(x in row for x in markers) for row in view.decode().splitlines())
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
save('LANE.log',log);save('LANE.meta',meta);save('CURRENT-PS.txt',ps);save('CURRENT-COMM-ARGS.txt',view);save('PARENT-LAUNCH-RECORD.json',recordraw)
receipt={'schema':'1370-witness-r7-observed-stop-independent-review-r1','decision':'STOP_OBSERVED_NO_FRAME_FULL_POSTFLIGHT_PENDING','actualParentToolSession':45600,'actualParentToolExitReported':2,'helperMetaExit':2,'helperMetaSingleStartEnd':True,'unexpectedHelperWait':False,'outerExit':2,'sinkExit':2,'frameProduced':False,'laneLogSha256':sha(log),'laneMetaSha256':sha(meta),'parentLaunchRecordSha256':sha(recordraw),'adoptedBindingSha256':record['bindingSha256'],'sourcePinsSha256':sha(pinsraw),'productionHead':'4812bb123781632dd39e44f918eb85a6a2c12623','materializedRoot':json.loads(binding.read_bytes())['repoRoot'],'currentRelevantWorkersAbsent':True,'globalHeavyLockAbsent':True,'currentPsSha256':sha(ps),'currentCommArgsSha256':sha(view),'ownedPgidObserved':None,'groupClearanceEvidence':'Visible STOP_SUPERVISOR_EXIT_2 is emitted only after the accepted outer recorder finishes its clearance check without STOP_SURVIVOR or STOP_OUTER_DEADLINE; exact numeric owned PGID was not emitted and is unknown. Fresh process views show no relevant worker.','failureLocalization':'Outer recorder started its supervisor group and observed supervisor exit2. Sink frame-shape refusal is downstream of no forwarded frame. Supervisor and sandbox/Node branch/internal error cannot be distinguished from retained artifacts.','diagnosticDefect':'Outer run_recorded captures supervisor stdout/stderr but discards them when raising status-only exit failure. Supervisor likewise discards child stdout/stderr when raising child exit failure. Five-second duration does not establish Node start or a particular cause.','protectedFullPostflight':'Parent actual full postflight tool15444 running; independent binding of its completed immutable baseline comparison remains pending.','executionAuthorization':False,'gameRerun':False,'testsRun':False,'gitOrSourceMutation':False,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
print(json.dumps({'receiptPath':str(O/'RECEIPT.json'),'receiptSha256':dump('RECEIPT.json',receipt),'decision':receipt['decision']},sort_keys=True))
