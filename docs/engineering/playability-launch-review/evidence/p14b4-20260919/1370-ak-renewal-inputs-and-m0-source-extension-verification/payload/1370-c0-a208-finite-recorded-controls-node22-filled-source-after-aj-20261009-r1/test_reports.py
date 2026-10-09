"""UNRUN no-child synthetic protocol checks; never import recorder/driver/tests/game."""
import importlib.util,json,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('pure_report_guard',Path(__file__).with_name('report_guard.py'));guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(guard)
class Reports(unittest.TestCase):
 def tap(self):return ('TAP version 13\n'+''.join(f'ok {i} - synthetic-{i}\n' for i in range(1,14))+'1..13\n# tests 13\n# suites 0\n# pass 13\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n').encode()
 def python(self):return {'status':'A208_PYTHON_CONTROLS_PASS','methods':14,'failures':0,'errors':0,'reason':None,'stickyStop':None,'cleanupErrors':[],'game':False,'elapsedSeconds':1,'ownedGroups':[{'pid':i,'ready':True,'reaped':True,'groupClear':True,'exit':-15} for i in range(100,107)],'inheritedProbes':[{'pid':i,'exit':0,'ownedPgid':999} for i in range(200,204)]}
 def encode(self,x):return (json.dumps(x)+'\n').encode()
 def test_valid_producers_and_old_gate_red(self):
  t=self.tap();self.assertEqual(guard.validate('js',t,b'',999)['tests'],13)
  with self.assertRaises(json.JSONDecodeError):json.loads(t.splitlines()[-1])
  p=self.python();self.assertEqual(guard.validate('python',self.encode(p),b'Ran 14 tests in 1.000s\n\nOK\n',999)['methods'],14)
  self.assertNotIn('selectedRows',p);self.assertNotEqual(p['status'],'PURE_A208_CONTROLS_PAIRS_AGREE')
 def test_tap_count_failure_skip_todo_cancel_and_stderr_refused(self):
  for a,b in [(b'# tests 13',b'# tests 12'),(b'# fail 0',b'# fail 1'),(b'ok 1 -',b'not ok 1 -'),(b'# skipped 0',b'# skipped 1'),(b'# todo 0',b'# todo 1'),(b'# cancelled 0',b'# cancelled 1'),(b'ok 1 - synthetic-1',b'ok 1 - synthetic-1 # SKIP')]:
   with self.assertRaises(guard.ReportStop):guard.validate('js',self.tap().replace(a,b),b'',999)
  with self.assertRaises(guard.ReportStop):guard.validate('js',self.tap(),b'error',999)
 def test_python_status_counts_failure_and_cleanup_refused(self):
  for key,value in [('status','STOP'),('methods',13),('failures',1),('errors',1),('reason','failure'),('stickyStop','deadline'),('cleanupErrors',['unknown']),('elapsedSeconds',45),('game',True)]:
   p=self.python();p[key]=value
   with self.assertRaises(guard.ReportStop):guard.validate('python',self.encode(p),b'Ran 14 tests in 1.000s\n\nOK\n',999)
  for field in ['ready','reaped','groupClear']:
   p=self.python();p['ownedGroups'][0][field]=False
   with self.assertRaises(guard.ReportStop):guard.validate('python',self.encode(p),b'Ran 14 tests in 1.000s\n\nOK\n',999)
  p=self.python();p['inheritedProbes'][0]['ownedPgid']=998
  with self.assertRaises(guard.ReportStop):guard.validate('python',self.encode(p),b'Ran 14 tests in 1.000s\n\nOK\n',999)
  with self.assertRaises(guard.ReportStop):guard.validate('python',self.encode(self.python()),b'Ran 13 tests in 1.000s\n\nOK\n',999)
if __name__=='__main__':unittest.main()
