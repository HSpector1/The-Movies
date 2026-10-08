#!/usr/bin/env python3
"""Scratch-only synthetic refusal tests. No mirror/tsc/Vitest/game."""
import importlib.util,os,pathlib,signal,subprocess,tempfile,time
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-c0-h-typecheck-collection-runner-proposal-r3/runner.py'
spec=importlib.util.spec_from_file_location('h_type_runner_r3',P)
runner=importlib.util.module_from_spec(spec);spec.loader.exec_module(runner)
with tempfile.TemporaryDirectory(dir=S,prefix='h-type-r3-red-') as tmp:
 root=pathlib.Path(tmp);target=root/'target.bin';replacement=root/'zz-replacement.bin'
 target.write_bytes(b'A'*4096);replacement.write_bytes(b'B'*4096)
 original=runner.os.read;replaced=False
 def replace_during_read(fd,n):
  global replaced
  data=original(fd,n)
  if not replaced and data:
   os.replace(replacement,target);replaced=True
  return data
 runner.os.read=replace_during_read
 try:
  try:runner.walk_meta(root)
  except RuntimeError as error:assert 'path replacement' in str(error),repr(error)
  else:raise AssertionError('RED missed dependency pathname replacement')
 finally:runner.os.read=original
 assert replaced
 old=runner.START;runner.START=time.monotonic()-301
 try:
  try:runner.walk_meta(root)
  except RuntimeError as error:assert '300-second child deadline' in str(error),repr(error)
  else:raise AssertionError('RED missed active deadline before dependency read')
 finally:runner.START=old
proc=subprocess.Popen(['/bin/sleep','60'],start_new_session=True)
runner.CURRENT=proc
try:
 try:runner.on_signal(signal.SIGTERM,None)
 except InterruptedError:pass
 else:raise AssertionError('RED missed SIGTERM interruption')
 assert proc.poll() is not None and runner.CURRENT is None
 try:os.killpg(proc.pid,0)
 except ProcessLookupError:pass
 else:raise AssertionError('RED left active child group')
finally:
 if proc.poll() is None:
  os.killpg(proc.pid,signal.SIGKILL);proc.wait()
print('R3_REPLACEMENT_DEADLINE_SIGNAL_CHILD_CLEANUP_PASS')
