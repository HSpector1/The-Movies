"""UNRUN owned tiny controls; qualified route/source roles required before import."""
import argparse,hashlib,importlib.util,json,os,signal,sys,tempfile,time,types,unittest
from pathlib import Path
from unittest.mock import patch
S=Path('/Users/zacheryspector/studio-scratch')
def load(name,path):
 spec=importlib.util.spec_from_file_location(name,path);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module
sha=lambda b:hashlib.sha256(b).hexdigest()
def prepare(args):
 source=Path(args.source_dir);raw=(source/'SOURCE-PINS.json').read_bytes();assert sha(raw)==args.source_pins_sha
 pins=json.loads(raw)
 for name,role in pins['files'].items():assert sha((source/name).read_bytes())==role['sha256']
 reviewraw=Path(args.route_review).read_bytes();assert sha(reviewraw)==args.route_review_sha;review=json.loads(reviewraw)
 assert review['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_ADDITIVE_RECORDED_ROUTE' and review['sourcePinsSha256']==args.source_pins_sha
 root=Path(args.output_root);assert root.parent==S and not os.path.lexists(root);root.mkdir(mode=0o700);(root/'fixtures').mkdir(mode=0o700)
 return source,root,review
class Controls(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  (ROOT/'unused-binding').write_text('{"fixture":true}\n')
  cls.rec=load('additive_owned_recorder',SOURCE/'record.py');cls.body=load('additive_body_only',SOURCE/'add_inputs.py');cls.sup=load('additive_supervisor',SOURCE/'supervise.py')
 def test_01_preflight_exact_and_one_below(self):
  m=self.body
  with patch.object(m.shutil,'disk_usage',return_value=types.SimpleNamespace(free=m.PRE)):m.preflight_space()
  with patch.object(m.shutil,'disk_usage',return_value=types.SimpleNamespace(free=m.PRE-1)):
   with self.assertRaisesRegex(RuntimeError,'3.5 GiB preflight'):m.preflight_space()
 def test_02_actual_owned_bounded_pipes(self):
  m=self.body;rec=self.rec
  for code,error in [("import os;os.write(1,b'abcd')",None),("import os;os.write(1,b'abcde')",'stdout cap'),("import os;os.write(1,b'abc')",'truncated'),("import os;os.write(2,b'x'*4097)",'stderr cap')]:
   children=[];ownedroot=ROOT/('pipe-'+str(len(list(ROOT.glob('pipe-*')))));ownedroot.mkdir(mode=0o700)
   class OwnedPipe:
    def __init__(self):
     out_r,out_w=os.pipe();err_r,err_w=os.pipe();report_r,report_w=os.pipe();previous=os.environ.get('SPARSE_1370_SUPERVISOR_FD');os.environ['SPARSE_1370_SUPERVISOR_FD']=str(report_w)
     try:self.pid=rec.fork_ready({'launchCwd':str(ROOT),'pythonPath':str(Path(sys.executable).resolve()),'materializerArgv':[str(Path(sys.executable).resolve()),'-I','-B','-c',code],'launchEnvironment':{},'outputRoot':str(ownedroot)},ROOT/'unused-binding',out_w,err_w)
     finally:
      os.close(out_w);os.close(err_w);os.close(report_w)
      if previous is None:os.environ.pop('SPARSE_1370_SUPERVISOR_FD',None)
      else:os.environ['SPARSE_1370_SUPERVISOR_FD']=previous
     report=os.read(report_r,128);os.close(report_r);assert report==str(self.pid).encode()+b'\n'
     self.stdout=os.fdopen(out_r,'rb',buffering=0);self.stderr=os.fdopen(err_r,'rb',buffering=0);self.returncode=None;children.append(self)
    def poll(self):
     if self.returncode is None:
      got,status=rec.os.waitpid(self.pid,os.WNOHANG)
      if got:self.returncode=os.waitstatus_to_exitcode(status)
     return self.returncode
    def wait(self,timeout):
     end=time.monotonic()+timeout
     while self.poll() is None:
      if time.monotonic()>=end:raise TimeoutError('owned tiny wait')
      time.sleep(.005)
     return self.returncode
    def kill(self):
     try:os.killpg(self.pid,signal.SIGKILL)
     except ProcessLookupError:pass
   with patch.object(m,'guard',return_value=None),patch.object(m,'remaining',return_value=2),patch.object(m.subprocess,'Popen',side_effect=lambda *a,**kw:OwnedPipe()):
    if error:
     with self.assertRaisesRegex(RuntimeError,error):m.bounded_blob('fixture',4)
    else:self.assertEqual(m.bounded_blob('fixture',4),b'abcd')
   self.assertEqual(len(children),1);self.assertIsNotNone(children[0].poll());self.assertFalse(rec.still_alive(children[0].pid));self.assertTrue(children[0].stdout.closed and children[0].stderr.closed)
 def test_03_exact_fixture_link(self):
  m=self.body
  with tempfile.TemporaryDirectory(dir=ROOT/'fixtures',prefix='owned-link-') as directory:
   root=Path(directory);fd=os.open(root,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
   try:
    with patch.object(m,'MIRROR_FD',fd),patch.object(m,'guard',return_value=None):
     m.exact_roster([],['.'],False)
     with self.assertRaisesRegex(RuntimeError,'dependency link missing'):m.exact_roster([],['.'],True)
     os.symlink(str(m.REPO/'node_modules'),root/'node_modules');m.exact_roster([],['.'],True)
     with self.assertRaisesRegex(RuntimeError,'extra special path'):m.exact_roster([],['.'],False)
   finally:os.close(fd)
 def test_04_mocked_deadline_predicate_not_elapsed(self):
  # Mocked2s is branch evidence, NOT an executed elapsed2s timeout.
  self.sup.check_deadline(0,2,clock=lambda:1.999)
  with self.assertRaises(self.sup.DeadlineExpired):self.sup.check_deadline(0,2,clock=lambda:2)
  with patch.object(self.body,'ORIGINAL_DEADLINE',2),patch.object(self.body.time,'monotonic',return_value=2):
   with self.assertRaisesRegex(RuntimeError,'180-second'):self.body.remaining()
 def test_05_root_transition_predicate(self):
  before=[1,2,16832,3,96,10,11];after=[1,2,16832,4,128,12,13]
  self.rec.check_root_transition(before,before,False,None)
  with self.assertRaises(Exception):self.rec.check_root_transition(before,after,False,None)
  self.rec.check_root_transition(before,after,True,after)
  for index in [0,1,2]:
   changed=list(after);changed[index]+=1
   with self.assertRaises(Exception):self.rec.check_root_transition(before,changed,True,changed)
  with self.assertRaises(Exception):self.rec.check_root_transition(before,after,True,before)
