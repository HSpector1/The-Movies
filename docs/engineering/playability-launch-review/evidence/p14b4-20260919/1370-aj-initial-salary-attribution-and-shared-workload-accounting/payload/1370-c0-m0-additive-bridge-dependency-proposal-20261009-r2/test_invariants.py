"""Prospective UNRUN tiny controls. Root grant required; no actual mirror/Node/Git.
Tests import held source only WHEN separately authorized; not run in authoring.
"""
import importlib.util, os, pathlib, signal, subprocess, sys, tempfile, types, unittest
from unittest.mock import patch
HERE=pathlib.Path(__file__).resolve().parent
class Controls(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  spec=importlib.util.spec_from_file_location('held_additive_fixture',HERE/'add_inputs.py')
  cls.module=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.module)
 def test_preflight_exact_and_one_below(self):
  m=self.module
  with patch.object(m.shutil,'disk_usage',return_value=types.SimpleNamespace(free=m.PRE)):m.preflight_space()
  with patch.object(m.shutil,'disk_usage',return_value=types.SimpleNamespace(free=m.PRE-1)):
   with self.assertRaisesRegex(RuntimeError,'3.5 GiB preflight'):m.preflight_space()
 def test_bounded_pipe_exact_excess_truncated_and_stderr(self):
  m=self.module;real_popen=subprocess.Popen
  for code,expected_error in [("import os;os.write(1,b'abcd')",None),("import os;os.write(1,b'abcde')",'stdout cap'),("import os;os.write(1,b'abc')",'truncated'),("import os;os.write(2,b'x'*4097)",'stderr cap')]:
   children=[]
   def launch(*args,**kwargs):
    child=real_popen([sys.executable,'-I','-B','-c',code],stdout=subprocess.PIPE,stderr=subprocess.PIPE);children.append(child);return child
   with patch.object(m,'guard',return_value=None),patch.object(m,'remaining',return_value=2),patch.object(m.subprocess,'Popen',side_effect=launch):
    if expected_error:
     with self.assertRaisesRegex(RuntimeError,expected_error):m.bounded_blob('fixture',4)
    else:self.assertEqual(m.bounded_blob('fixture',4),b'abcd')
   self.assertEqual(len(children),1);self.assertIsNotNone(children[0].poll());self.assertTrue(children[0].stdout.closed and children[0].stderr.closed)
 def test_expanded_link_required_and_original_absent(self):
  m=self.module
  with tempfile.TemporaryDirectory(prefix='additive-link-control-') as directory:
   root=pathlib.Path(directory);fd=os.open(root,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
   try:
    with patch.object(m,'MIRROR_FD',fd),patch.object(m,'guard',return_value=None):
     m.exact_roster([],['.'],False)
     with self.assertRaisesRegex(RuntimeError,'dependency link missing'):m.exact_roster([],['.'],True)
     # Only symlink bytes are tested; target is never followed/read/written.
     os.symlink(str(m.REPO/'node_modules'),root/'node_modules');m.exact_roster([],['.'],True)
     with self.assertRaisesRegex(RuntimeError,'extra special path'):m.exact_roster([],['.'],False)
   finally:os.close(fd)
def timeout(*args):raise TimeoutError('tiny invariants whole20 seconds')
if __name__=='__main__':
 signal.signal(signal.SIGALRM,timeout);signal.setitimer(signal.ITIMER_REAL,20)
 try:unittest.main()
 finally:signal.setitimer(signal.ITIMER_REAL,0)
