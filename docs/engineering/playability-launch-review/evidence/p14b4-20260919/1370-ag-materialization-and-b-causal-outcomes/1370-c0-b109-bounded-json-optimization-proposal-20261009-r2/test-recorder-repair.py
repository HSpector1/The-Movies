"""UNRUN tiny recorder controls only; no capture decode, game or Save imports.
Use --recorder original-r1-path for RED, repaired-r2-path for GREEN.
"""
import argparse,hashlib,importlib.util,json,os,pathlib,signal,sys,tempfile,time,unittest
from unittest.mock import patch
parser=argparse.ArgumentParser();parser.add_argument('--recorder',required=True);args,rest=parser.parse_known_args()
path=pathlib.Path(args.recorder);spec=importlib.util.spec_from_file_location('pure_recorder_under_test',path);recorder=importlib.util.module_from_spec(spec);spec.loader.exec_module(recorder)
class TinyRecorderControls(unittest.TestCase):
 def scratch(self):return tempfile.TemporaryDirectory(prefix='b109-encoder-recorder-tiny-',dir='/Users/zacheryspector/studio-scratch')
 def need(self,*names):
  for name in names:self.assertTrue(hasattr(recorder,name),'missing repaired recorder mechanism '+name)
 def test_fixed_caps(self):self.assertEqual((recorder.CHILD,recorder.ACTIVE,recorder.WHOLE,recorder.CAP),(60,75,90,1048576))
 def test_late_exit_exact_child_and_active_deadlines(self):
  self.need('observed_exit_guard');recorder.observed_exit_guard(0,0,0,0,clock=lambda:59.999)
  for now,start in [(60,0),(75,25),(75.001,25)]:
   with self.assertRaisesRegex(RuntimeError,'OBSERVED_CHILD_OR_ACTIVE_DEADLINE'):recorder.observed_exit_guard(0,start,0,0,clock=lambda:now)
 def test_positive_active_guard(self):
  self.need('active_guard');recorder.active_guard(0,clock=lambda:74.999)
  for now in [75,89]:
   with self.assertRaisesRegex(RuntimeError,'ACTIVE_75'):recorder.active_guard(0,clock=lambda:now)
 def test_hard_alarm_names_actual_bound(self):
  self.need('alarm')
  with self.assertRaisesRegex(TimeoutError,'WHOLE_90'):recorder.alarm()
 def test_sanitized_environment_copy(self):
  self.need('child_environment');source={'NODE_OPTIONS':'--require /does/not/exist','NODE_PATH':'/unexpected','KEEP':'value'};env=recorder.child_environment(source)
  self.assertNotIn('NODE_OPTIONS',env);self.assertNotIn('NODE_PATH',env);self.assertEqual(env['KEEP'],'value');self.assertEqual(env['PYTHONDONTWRITEBYTECODE'],'1');self.assertIn('NODE_OPTIONS',source)
 def test_real_preflight_alarm_interrupts_authentication(self):
  original_handler=signal.getsignal(signal.SIGALRM)
  with self.scratch() as work:
   output=pathlib.Path(work)/'forbidden';begin=time.monotonic()
   try:
    with patch.object(recorder,'WHOLE',.025),patch.object(recorder,'ACTIVE',.02),patch.object(recorder,'authenticate',side_effect=lambda *a:time.sleep(.05)),patch.object(recorder,'OUTPUTS',{'controls':output}),patch.object(recorder.sys,'argv',[str(path),'controls']):
     try:code=recorder.main()
     except Exception:code=2
    self.assertEqual(code,2);self.assertLess(time.monotonic()-begin,.15);self.assertFalse(output.exists())
   finally:signal.setitimer(signal.ITIMER_REAL,0);signal.signal(signal.SIGALRM,original_handler)
 def test_blocked_startup_is_owned_before_exec_and_cleared(self):
  self.need('start_owned','ready_go','close_startup_fds','clear','process_alive')
  with self.scratch() as work:
   root=pathlib.Path(work);owned={'info':{}};marker=root/'unexpected-exec'
   with (root/'stdout').open('wb') as out,(root/'stderr').open('wb') as err:
    try:
     recorder.start_owned([sys.executable,'-I','-B','-c','raise SystemExit(0)'],str(root),dict(os.environ),out.fileno(),err.fileno(),owned,before_ready=lambda:time.sleep(.2))
     with self.assertRaisesRegex(AssertionError,'STOP_STARTUP_DEADLINE'):recorder.ready_go(owned,time.monotonic()+.02)
     self.assertTrue(owned['info']['startupOwnedBeforeExec']);self.assertEqual(owned['child'].pid,owned['info']['pid'])
    finally:
     recorder.close_startup_fds(owned)
     if owned.get('child') is not None:self.assertTrue(recorder.clear(owned['child'],time.monotonic()+1))
   self.assertFalse(recorder.process_alive(owned['child'].pid));self.assertFalse(marker.exists())
 def test_pending_alarm_at_fork_return_keeps_owned_pid(self):
  self.need('start_owned','close_startup_fds','clear');owned={'info':{}};original_fork=os.fork;handler=signal.getsignal(signal.SIGALRM)
  def throwing(*_):raise TimeoutError('tiny pending alarm')
  def injected():
   pid=original_fork()
   if pid!=0:os.kill(os.getpid(),signal.SIGALRM)
   return pid
  with self.scratch() as work:
   root=pathlib.Path(work);signal.signal(signal.SIGALRM,throwing)
   try:
    with (root/'stdout').open('wb') as out,(root/'stderr').open('wb') as err,patch.object(recorder.os,'fork',injected):
     with self.assertRaisesRegex(TimeoutError,'tiny pending alarm'):recorder.start_owned([sys.executable,'-I','-B','-c','pass'],str(root),dict(os.environ),out.fileno(),err.fileno(),owned)
    self.assertIn('child',owned);self.assertEqual(owned['info']['pid'],owned['child'].pid)
   finally:
    signal.signal(signal.SIGALRM,handler);recorder.close_startup_fds(owned)
    if owned.get('child') is not None:self.assertTrue(recorder.clear(owned['child'],time.monotonic()+1))
 def test_owned_survivor_cannot_be_clear(self):
  self.need('clear','process_alive')
  class Child:
   pid=123456789;returncode=0
   def poll(self):return 0
  now=[0]
  with patch.object(recorder,'process_alive',return_value=True),patch.object(recorder.os,'killpg'),patch.object(recorder.time,'monotonic',side_effect=lambda:now[0]),patch.object(recorder.time,'sleep',side_effect=lambda _:now.__setitem__(0,now[0]+.02)):
   self.assertFalse(recorder.clear(Child(),.1))
 def test_timely_finalization(self):
  self.need('finalize_result')
  with self.scratch() as work:
   root=pathlib.Path(work);result={'status':'PURE_ENCODER_CONTROLS_COMPLETE_UNADOPTED'}
   self.assertEqual(recorder.finalize_result(root,result,1,clock=lambda:0)['status'],result['status']);self.assertTrue((root/'RESULT.json').exists());self.assertFalse((root/'OVERRIDE-STOP.json').exists())
 def test_late_postwrite_is_stop_without_blocking_after_deadline(self):
  self.need('finalize_result');now=[0]
  with self.scratch() as work:
   root=pathlib.Path(work)
   def late(p,b):recorder.write(p,b);now[0]=2
   result=recorder.finalize_result(root,{'status':'PURE_ENCODER_CONTROLS_COMPLETE_UNADOPTED'},1,clock=lambda:now[0],writer=late)
   self.assertEqual(result['status'],'STOP_FINALIZATION');self.assertTrue(result['overrideNotWrittenAfterWholeDeadline']);self.assertTrue((root/'RESULT.json').exists());self.assertFalse((root/'OVERRIDE-STOP.json').exists())
 def test_alarm_before_candidate_write_has_override(self):
  self.need('finalize_result')
  with self.scratch() as work:
   root=pathlib.Path(work)
   def fail(p,b):
    if p.name=='RESULT.json':raise TimeoutError('tiny before write')
    recorder.write(p,b)
   result=recorder.finalize_result(root,{'status':'PURE_ENCODER_CONTROLS_COMPLETE_UNADOPTED'},1,clock=lambda:0,writer=fail)
   self.assertEqual(result['status'],'STOP_FINALIZATION');self.assertTrue((root/'OVERRIDE-STOP.json').exists());self.assertFalse((root/'RESULT.json').exists())
 def test_alarm_after_candidate_write_has_override(self):
  self.need('finalize_result')
  with self.scratch() as work:
   root=pathlib.Path(work)
   def fail(p,b):
    recorder.write(p,b)
    if p.name=='RESULT.json':raise TimeoutError('tiny after write')
   result=recorder.finalize_result(root,{'status':'PURE_ENCODER_CONTROLS_COMPLETE_UNADOPTED'},1,clock=lambda:0,writer=fail)
   self.assertEqual(result['status'],'STOP_FINALIZATION');self.assertTrue((root/'OVERRIDE-STOP.json').exists());self.assertTrue((root/'RESULT.json').exists())
 def test_actual_tiny_node_preload_settings_are_absent_and_group_clear(self):
  self.need('child_environment','start_owned','ready_go','clear','process_alive');config=json.loads((path.parent/'CONFIG.json').read_bytes());owned={}
  code='process.stdout.write(JSON.stringify({version:process.version,options:process.env.NODE_OPTIONS??null,path:process.env.NODE_PATH??null,argv:process.execArgv}))'
  with self.scratch() as work:
   root=pathlib.Path(work);env=recorder.child_environment({**os.environ,'NODE_OPTIONS':'--require /does/not/exist','NODE_PATH':'/unexpected'})
   with (root/'stdout').open('wb') as out,(root/'stderr').open('wb') as err:
    try:
     recorder.start_owned([config['nodePath'],'-e',code],str(root),env,out.fileno(),err.fileno(),owned);recorder.ready_go(owned,time.monotonic()+2);end=time.monotonic()+2
     while owned['child'].poll() is None and time.monotonic()<end:time.sleep(.01)
     self.assertEqual(owned['child'].poll(),0)
    finally:
     recorder.close_startup_fds(owned)
     if owned.get('child') is not None:self.assertTrue(recorder.clear(owned['child'],time.monotonic()+1))
   actual=json.loads((root/'stdout').read_bytes());self.assertEqual(actual,{'version':'v20.20.2','options':None,'path':None,'argv':['-e',code]});self.assertEqual((root/'stderr').read_bytes(),b'');self.assertFalse(recorder.process_alive(owned['child'].pid))
if __name__=='__main__':unittest.main(argv=[sys.argv[0],*rest])
