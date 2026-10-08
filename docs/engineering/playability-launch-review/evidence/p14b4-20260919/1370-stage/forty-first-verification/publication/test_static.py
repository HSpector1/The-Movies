#!/usr/bin/env python3
"""Stage41 r4 scratch-only sandbox/Git fixture; no live Git mutation or lane."""
import copy,hashlib,json,os,select,signal,subprocess,sys,tempfile,time,unittest
from pathlib import Path
import bootstrap as b
import publish_stage41 as p

GIT='/usr/bin/git'
def git(*argv,input_bytes=None,env=None):
 e={k:v for k,v in os.environ.items() if not k.startswith('GIT_')}
 e.update(GIT_AUTHOR_NAME='Fixture',GIT_AUTHOR_EMAIL='fixture@example.invalid',GIT_COMMITTER_NAME='Fixture',GIT_COMMITTER_EMAIL='fixture@example.invalid',GIT_OPTIONAL_LOCKS='0')
 if env:e.update(env)
 x=subprocess.run([GIT,*argv],input=input_bytes,stdout=subprocess.PIPE,stderr=subprocess.PIPE,env=e,check=True)
 return x.stdout.decode().strip()
def snapshot(root):
 entries=[]
 for x in sorted(root.rglob('*')):
  s=x.lstat();entries.append((str(x.relative_to(root)),s.st_mode,s.st_size,s.st_mtime_ns,s.st_ctime_ns,hashlib.sha256(x.read_bytes()).hexdigest() if x.is_file() else None))
 return entries

def fixture(area):
 live=area/'protected-live.git';stage=area/'stage';output=area/'output'
 stage.mkdir();output.mkdir()
 remote=stage/'remote.git'
 git('init','--bare',str(live));git('init','--bare',str(remote))
 blob=git('--git-dir',str(live),'hash-object','-w','--stdin',input_bytes=b'base fixture\n')
 tree=git('--git-dir',str(live),'mktree',input_bytes=f'100644 blob {blob}\tbase.txt\n'.encode())
 base=git('--git-dir',str(live),'commit-tree',tree,'-m','base fixture')
 git('--git-dir',str(live),'update-ref','refs/heads/evidence/test',base)
 git('--git-dir',str(live),'push',str(remote),'refs/heads/evidence/test:refs/heads/evidence/test')
 return live,stage,output,remote,base

def child_argv(mode,stage,output,live,remote):
 policy=b.policy([live],stage,output)
 return [str(b.SANDBOX),'-p',policy,sys.executable,'-B',str(p.HERE/'fixture_worker.py'),mode,str(stage),str(output),str(live),str(remote),str(live/'objects')]

def child_env(base,moved=False):
 e={k:v for k,v in os.environ.items() if not k.startswith('GIT_')}
 e.update(PYTHONDONTWRITEBYTECODE='1',FIXTURE_BASE=base,GIT_OPTIONAL_LOCKS='0',GIT_AUTHOR_NAME='Fixture',GIT_AUTHOR_EMAIL='fixture@example.invalid',GIT_COMMITTER_NAME='Fixture',GIT_COMMITTER_EMAIL='fixture@example.invalid')
 if moved:e['STAGE41_TEST_STOP']='1'
 return e

class Checks(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  raw=p.MAP.read_bytes();assert hashlib.sha256(raw).hexdigest()==p.MAP_SHA;cls.good=json.loads(raw)
 def refuse(self,mutate):
  d=copy.deepcopy(self.good);mutate(d)
  with self.assertRaises(RuntimeError):p.validate_map(d)
 def test_map_and_sources(self):
  rows=p.validate_map(self.good);self.assertEqual((len(rows),sum(r['bytes'] for r in rows)),(75,377751))
  for row in rows:self.assertEqual(len(p.source_bytes(row)),row['bytes'])
 def test_claim_target_mode_drift(self):
  self.refuse(lambda d:d['rows'][0].__setitem__('target',p.PREFIX+'../escape'))
  self.refuse(lambda d:d['rows'][1].__setitem__('target',d['rows'][0]['target']))
  self.refuse(lambda d:next(r for r in d['rows'] if 'control-recorder-independent-addendum-r1/RECEIPT.json' in r['target']).__setitem__('classification','SANDBOX_SOURCE_ACCEPTED_UNRUN'))
  row=copy.deepcopy(p.validate_map(self.good)[0]);row['mode']='0o755' if row['mode']!='0o755' else '0o644'
  with self.assertRaises(RuntimeError):p.source_bytes(row)
 def test_clean_git_environment(self):
  with self.subTest('GIT_DIR removed'):
   old=os.environ.get('GIT_DIR');os.environ['GIT_DIR']='/tmp/evil'
   try:
    e=p.clean_env();self.assertNotIn('GIT_DIR',e);self.assertEqual(e['GIT_OPTIONAL_LOCKS'],'0')
   finally:
    if old is None:del os.environ['GIT_DIR']
    else:os.environ['GIT_DIR']=old
 def test_scratch_bare_alternates_commit_and_push(self):
  with tempfile.TemporaryDirectory(prefix='stage41-r2-',dir=p.HERE) as raw:
   area=Path(raw);live,stage,output,remote,base=fixture(area);before=snapshot(live)
   out,err=b.bounded(child_argv('ordinary',stage,output,live,remote),child_env(base),str(area),timeout=20)
   self.assertEqual(err,b'');result=json.loads(out);self.assertEqual(result['status'],'SCRATCH_PUSH_PASS')
   self.assertNotEqual(result['commit'],base)
   self.assertEqual(git('--git-dir',str(remote),'rev-parse','refs/heads/evidence/test'),result['commit'])
   self.assertEqual(snapshot(live),before)
   self.assertEqual(json.loads((output/'PUBLISH-RESULT.json').read_text())['commit'],result['commit'])
   self.assertGreater(len((output/'CHILD-STDOUT.bin').read_bytes()),0)
   self.assertGreater(len((output/'COMMANDS.jsonl').read_bytes()),0)
   for name in ('CHILD-STDOUT.bin','CHILD-STDERR.bin','COMMANDS.jsonl','PUBLISH-RESULT.json'):
    self.assertEqual((output/name).stat().st_nlink,1)
   self.assertEqual(list((stage/'late-results').iterdir()),[])
 def race_case(self,variant):
  with tempfile.TemporaryDirectory(prefix='stage41-r4-',dir=p.HERE) as raw:
   area=Path(raw);live,stage,output,remote,base=fixture(area)
   policy=b.policy([live],stage,output)
   argv=[str(b.SANDBOX),'-p',policy,sys.executable,'-B',str(p.HERE/'race_worker.py'),variant,str(output),str(stage),str(live)]
   env=child_env(base);env['STAGE41_TEST_STOP']='before_install' if variant in ('r3','r4') else 'after_open'
   child=subprocess.Popen(argv,env=env,cwd=area,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,close_fds=True,pass_fds=(),start_new_session=True)
   child.stdin.close()
   marker=(b'READY_BEFORE_ATOMIC_INSTALL\n' if variant in ('r3','r4') else
           b'READY_AFTER_STAGE_OPEN_BEFORE_WRITE\n' if variant in ('r3_stage','r4_stage') else
           b'READY_AFTER_R2_OPEN_BEFORE_WRITE\n')
   try:
    ready=bytearray();deadline=time.monotonic()+10
    while marker not in ready and time.monotonic()<deadline:
     readable,_,_=select.select([child.stdout],[],[],.1)
     if readable:
      part=os.read(child.stdout.fileno(),128);ready.extend(part)
      if len(ready)>512:raise AssertionError('ready cap')
    self.assertIn(marker,ready)
    stopped=False;stop_deadline=time.monotonic()+3
    while time.monotonic()<stop_deadline:
     state=subprocess.run(['/bin/ps','-o','state=','-p',str(child.pid)],stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout.decode().strip()
     if state.startswith('T'):stopped=True;break
     time.sleep(.02)
    self.assertTrue(stopped,'synthetic child did not reach SIGSTOP after marker')
    if variant in ('r3_stage','r4_stage'):stage.rename(live/'moved-stage')
    else:output.rename(live/'moved-output')
    os.kill(child.pid,signal.SIGCONT)
    out,err=child.communicate(timeout=10)
    protected_file=(live/'moved-stage'/'late-results'/'CHILD-STDOUT.bin') if variant in ('r3_stage','r4_stage') else live/'moved-output'/'CHILD-STDOUT.bin'
    if variant in ('r2','r3_stage','r4_stage'):
     self.assertEqual(protected_file.read_bytes(),b'bounded raw bytes after open\n')
    else:
     self.assertNotEqual(child.returncode,0)
     self.assertTrue(b'PermissionError' in err or b'Operation not permitted' in err,err[:500])
     self.assertFalse(protected_file.exists())
     self.assertFalse((live/'moved-output'/'PUBLISH-RESULT.json').exists())
   finally:
    if child.poll() is None:
     try:os.killpg(child.pid,signal.SIGCONT)
     except ProcessLookupError:pass
    b.clear_group(child)
    child.stdout.close();child.stderr.close()
 def test_r2_after_open_before_write_red(self):self.race_case('r2')
 def test_r3_after_stage_close_before_atomic_install_denied(self):self.race_case('r3')
 def test_r3_staging_open_before_write_residual_red(self):self.race_case('r3_stage')
 def test_r4_after_stage_close_before_atomic_install_denied(self):self.race_case('r4')
 def test_r4_staging_open_before_write_residual_red(self):self.race_case('r4_stage')
 def test_parent_watch_detects_move(self):
  with tempfile.TemporaryDirectory(prefix='stage41-watch-',dir=p.HERE) as raw:
   area=Path(raw);watched=area/'watched';watched.mkdir()
   watch=p.ParentWatch([watched])
   try:
    watch.check();watched.rename(area/'moved')
    with self.assertRaises((RuntimeError,FileNotFoundError)):watch.check()
   finally:watch.close()
 def test_nonzero_timeout_cleanup(self):
  with tempfile.TemporaryDirectory(prefix='stage41-r2-',dir=p.HERE) as raw:
   area=Path(raw);e=child_env('synthetic')
   with self.assertRaises(RuntimeError):b.bounded([sys.executable,'-B','-c','import sys;sys.exit(7)'],e,str(area),timeout=3)
   with self.assertRaises(RuntimeError):b.bounded([sys.executable,'-B','-c','import time;time.sleep(20)'],e,str(area),timeout=.3)

if __name__=='__main__':unittest.main()
