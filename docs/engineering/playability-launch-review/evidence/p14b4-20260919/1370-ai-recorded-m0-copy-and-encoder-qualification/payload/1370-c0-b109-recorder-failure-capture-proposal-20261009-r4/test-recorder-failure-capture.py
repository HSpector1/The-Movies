"""UNRUN source-only proposal: nine real owned Node20 main() regressions.
Run separately from the byte-identical original fourteen controls. No game/capture.
The sole suite alarm is 285 seconds (aggregate cap; individual recorder60/75/90 unchanged).
"""
import argparse,base64,contextlib,hashlib,importlib.util,io,json,os,pathlib,signal,sys,tempfile,time,unittest
from unittest.mock import patch
parser=argparse.ArgumentParser();parser.add_argument('--recorder',required=True);args,rest=parser.parse_known_args()
path=pathlib.Path(args.recorder).resolve();spec=importlib.util.spec_from_file_location('failure_recorder_under_test',path);recorder=importlib.util.module_from_spec(spec);spec.loader.exec_module(recorder)
SUITE_END=time.monotonic()+285
real_setitimer=signal.setitimer
class SuiteTimeout(TimeoutError):pass
def suite_alarm(*_):raise SuiteTimeout('STOP_TINY_FAILURE_SUITE_285_SECONDS')
def bounded_timer(which,seconds,interval=0):
 # Recorder owns its normal SIGALRM handler; never extend its whole90 alarm.
 # Its final cancellation restores the suite alarm instead of disabling it.
 remaining=SUITE_END-time.monotonic()
 if remaining<=0:raise SuiteTimeout('STOP_TINY_FAILURE_SUITE_285_SECONDS')
 return real_setitimer(which,min(seconds,remaining) if seconds else remaining,interval)
class FailureCaptureControls(unittest.TestCase):
 def run_case(self,name,code,exitcode,status,fault=None,stage=None):
  original=json.loads((path.parent/'CONFIG.json').read_bytes());node=pathlib.Path(original['nodePath'])
  self.assertEqual(str(node),'/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin/node')
  with tempfile.TemporaryDirectory(prefix='b109-failure-main-',dir='/Users/zacheryspector/studio-scratch') as work:
   root=pathlib.Path(work);script=root/'tiny.mjs';script.write_text(code);raw=script.read_bytes();output=root/'owned-output'
   cfg={'nodePath':str(node),'nodeSha256':original['nodeSha256'],'roles':{'controls':{'path':str(script),'sha256':hashlib.sha256(raw).hexdigest()}}}
   configraw=(json.dumps(cfg,sort_keys=True)+'\n').encode();(root/'CONFIG.json').write_bytes(configraw);confighash=hashlib.sha256(configraw).hexdigest();summary=io.StringIO();caught=None;actual=None
   original_active=recorder.active_guard;original_observed=recorder.observed_exit_guard;original_start=recorder.start_owned;active_calls=[0];injected=[False];recorder_owned=[None]
   def start(*a,**kw):
    original_start(*a,**kw);recorder_owned[0]=a[5]['child']
   def active(*a,**kw):
    original_active(*a,**kw);active_calls[0]+=1
    if stage=='finally' and active_calls[0]==2:injected[0]=True;raise fault
   def observed(*a,**kw):
    original_observed(*a,**kw)
    if stage=='main' and a[2]==len(b'{"status":"ENCODER_EQUIVALENCE_AND_REFUSALS_PASSED","groups":22}\n') and a[3]==0 and not injected[0]:
     deadline=time.monotonic()+2
     while time.monotonic()<deadline and recorder_owned[0] is not None and recorder_owned[0].poll() is None:time.sleep(.01)
     if recorder_owned[0] is None or recorder_owned[0].poll()!=0:raise RuntimeError('STOP_FAULT_FIXTURE_NOT_EXITED_ZERO')
     injected[0]=True;raise fault
   with patch.object(recorder,'start_owned',start),patch.object(recorder,'active_guard',active),patch.object(recorder,'observed_exit_guard',observed),patch.object(recorder,'HERE',root),patch.object(recorder,'SCRATCH',root),patch.object(recorder,'CONFIG_SHA',confighash),patch.object(recorder,'OUTPUTS',{'controls':output}),patch.object(recorder.sys,'argv',[str(path),'controls']),patch.dict(os.environ,{'NODE_OPTIONS':'--require /does/not/exist','NODE_PATH':'/unexpected'}),patch.object(recorder.signal,'setitimer',bounded_timer),contextlib.redirect_stdout(summary):
    try:actual=recorder.main()
    except BaseException as exc:
     if isinstance(exc,SuiteTimeout) or (not isinstance(exc,Exception) and exc is not fault):raise
     caught=repr(exc)
   print(json.dumps({'schema':'1370-b109-tiny-main-case-return-r4','case':name,'actualRecorderReturn':actual,'caughtException':caught,'faultInjected':injected[0],'ownedPid':None if recorder_owned[0] is None else recorder_owned[0].pid,'outputFiles':sorted(p.name for p in output.iterdir()) if output.exists() else []},sort_keys=True),flush=True)
   self.assertIsNone(caught,'main must return STOP after preserving artifacts: '+str(caught));self.assertEqual(actual,2)
   if fault is not None:self.assertTrue(injected[0],'required catch-path fault was not injected')
   self.assertEqual(set(p.name for p in output.iterdir()),{'stdout.bin','stderr.bin','RESULT.json'})
   result=json.loads((output/'RESULT.json').read_bytes());stdout=(output/'stdout.bin').read_bytes();stderr=(output/'stderr.bin').read_bytes()
   self.assertEqual(result['actualChildExit'],exitcode);self.assertTrue(result['status']);self.assertFalse(result['status'].endswith('_COMPLETE_UNADOPTED'))
   if name=='invalid-json':self.assertIn('Expecting value',result['status'])
   else:self.assertEqual(result['status'],status)
   self.assertEqual(result['timedOut'],isinstance(fault,TimeoutError));self.assertTrue(result['groupClear']);self.assertTrue(result['startupOwnedBeforeExec']);self.assertTrue(result['pgidConfirmed']);self.assertIsInstance(result['childPid'],int);self.assertGreater(result['childPid'],0);self.assertEqual(result['childPid'],result['ownedPgid']);self.assertFalse(recorder.process_alive(result['ownedPgid']))
   self.assertEqual(result['boundsSeconds'],{'node':60,'active':75,'whole':90});self.assertEqual(result['configSha256'],confighash);self.assertEqual(result['sanitizedEnvironment'],['NODE_OPTIONS','NODE_PATH'])
   expected_stdout={'nonzero':b'tiny-nonzero-stdout\n','invalid-json':b'not-json\n','wrong-role':b'{"status":"WRONG_ROLE","groups":22}\n'}.get(name,b'{"status":"ENCODER_EQUIVALENCE_AND_REFUSALS_PASSED","groups":22}\n');expected_stderr=b'tiny-nonzero-stderr\n' if name=='nonzero' else b''
   self.assertEqual(stdout,expected_stdout);self.assertEqual(stderr,expected_stderr)
   for label,data in [('stdout',stdout),('stderr',stderr)]:self.assertEqual(result[label+'Bytes'],len(data));self.assertEqual(result[label+'Sha256'],hashlib.sha256(data).hexdigest())
   emitted=json.loads(summary.getvalue());self.assertEqual(emitted['status'],result['status']);self.assertEqual(emitted['actualChildExit'],exitcode);self.assertTrue(emitted['groupClear'])
   print(json.dumps({'schema':'1370-b109-tiny-main-failure-control-r4','case':name,'actualRecorderReturn':actual,'result':result,'stdoutBase64':base64.b64encode(stdout).decode(),'stderrBase64':base64.b64encode(stderr).decode(),'freshExactOwnedGroupAbsent':True},sort_keys=True),flush=True)
 def test_nonzero_preserves_distinct_streams_and_pid(self):
  self.run_case('nonzero',"if(process.version!=='v20.20.2'||process.env.NODE_OPTIONS!==undefined||process.env.NODE_PATH!==undefined)process.exit(91);process.stdout.write('tiny-nonzero-stdout\\n');process.stderr.write('tiny-nonzero-stderr\\n');process.exitCode=7;",7,'STOP_CHILD_EXIT_7')
 def test_invalid_json_preserves_streams_and_pid(self):
  self.run_case('invalid-json',"if(process.version!=='v20.20.2'||process.env.NODE_OPTIONS!==undefined||process.env.NODE_PATH!==undefined)process.exit(91);process.stdout.write('not-json\\n');",0,None)
 def test_wrong_report_role_preserves_streams_and_pid(self):
  self.run_case('wrong-role',"if(process.version!=='v20.20.2'||process.env.NODE_OPTIONS!==undefined||process.env.NODE_PATH!==undefined)process.exit(91);process.stdout.write(JSON.stringify({status:'WRONG_ROLE',groups:22})+'\\n');",0,'STOP_REPORT_ROLE')
 def test_empty_exception_never_becomes_complete(self):
  code="if(process.version!=='v20.20.2'||process.env.NODE_OPTIONS!==undefined||process.env.NODE_PATH!==undefined)process.exit(91);process.stdout.write(JSON.stringify({status:'ENCODER_EQUIVALENCE_AND_REFUSALS_PASSED',groups:22})+'\\n');"
  for stage in ('main','finally'):
   for kind in (KeyboardInterrupt,TimeoutError,BaseException):
    with self.subTest(stage=stage,kind=kind.__name__):
     fault=kind();self.run_case(stage+'-empty-'+kind.__name__,code,0,repr(fault),fault=fault,stage=stage)
if __name__=='__main__':
 previous=signal.getsignal(signal.SIGALRM);signal.signal(signal.SIGALRM,suite_alarm);real_setitimer(signal.ITIMER_REAL,max(.001,SUITE_END-time.monotonic()))
 try:unittest.main(argv=[sys.argv[0],*rest])
 finally:real_setitimer(signal.ITIMER_REAL,0);signal.signal(signal.SIGALRM,previous)
