#!/usr/bin/env python3
"""UNRUN 330-second outer recorder for the exact H typecheck lane."""
import argparse, hashlib, json, os, pathlib, signal, subprocess, sys, time
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
LANE=S/'heavy-queue/lane-run.sh'
RUNNER=S/'1370-c0-h-typecheck-collection-runner-proposal-r5/runner.py'
ROOT=S/'1370-c0-h-typecheck-collection-results-r5'
WALL=330
RUNNER_SHA="0fe66879521909362fa746044485b58b8a61b411038d40343465042aa183b50b"
RUNNER_BOOTSTRAP="""import hashlib,os,stat,sys
from pathlib import Path
p=Path(sys.argv[1]);pin="0fe66879521909362fa746044485b58b8a61b411038d40343465042aa183b50b"
for parent in p.parents: assert stat.S_ISDIR(parent.lstat().st_mode)
before=p.lstat();assert stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<1048576
fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
try:
 chunks=[]
 while part:=os.read(fd,65536): chunks.append(part)
 raw=b"".join(chunks);during=os.fstat(fd);after=p.lstat()
 fields=lambda v:(v.st_dev,v.st_ino,v.st_mode,v.st_nlink,v.st_size,v.st_mtime_ns,v.st_ctime_ns)
 assert fields(before)==fields(during)==fields(after) and len(raw)==before.st_size
finally:os.close(fd)
assert hashlib.sha256(raw).hexdigest()==pin
sys.argv=sys.argv[1:]
exec(compile(raw,str(p),"exec"),{"__name__":"__main__","__file__":str(p)})
"""

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--run-id',required=True);ap.add_argument('--binding',required=True);ap.add_argument('--binding-sha',required=True)
 a=ap.parse_args()
 import re
 if not re.fullmatch(r'20261008-h-types-r[0-9]+',a.run_id) or not re.fullmatch(r'[0-9a-f]{64}',a.binding_sha):raise RuntimeError('invalid binding/run ID')
 log=S/('c0-h-types-'+a.run_id+'.lane.log');meta=pathlib.Path(str(log)+'.meta')
 receipt=ROOT/(a.run_id+'.RECORDER.json')
 if any(p.exists() for p in [log,meta,receipt]):raise RuntimeError('one-shot recorder output collision')
 ROOT.mkdir(mode=0o700,exist_ok=True)
 argv=['/bin/bash',str(LANE),'0',str(log),'/usr/local/bin/python3','-I','-B','-c',RUNNER_BOOTSTRAP,str(RUNNER),'--binding',a.binding,'--binding-sha',a.binding_sha]
 start=time.monotonic();status='RUNNING';exit_code=None
 p=subprocess.Popen(argv,stdin=subprocess.DEVNULL,start_new_session=True)
 try:
  exit_code=p.wait(timeout=WALL)
  status='RECORDER_WRAPPER_EXIT_0' if exit_code==0 else 'STOP_RECORDER_WRAPPER_NONZERO'
  child_result=ROOT/a.run_id/'RESULT.json'
  if status=='RECORDER_WRAPPER_EXIT_0':
   lines=meta.read_text().splitlines() if meta.is_file() else []
   actual=[line for line in lines if line.startswith('end, exit ')]
   status='RECORDER_CHILD_EXIT_0' if len(actual)==1 and actual[0].startswith('end, exit 0;') and child_result.is_file() and json.loads(child_result.read_text()).get('status')=='PASS_FULL_ERA_TYPES_AND_DIAGNOSTIC_COLLECTION_ONLY' else 'STOP_RECORDER_CHILD_OR_RESULT'
 except subprocess.TimeoutExpired:
  status='STOP_330_SECOND_RECORDER_TIMEOUT'
  try:os.killpg(p.pid,signal.SIGTERM)
  except ProcessLookupError:pass
  try:p.wait(timeout=5)
  except subprocess.TimeoutExpired:
   try:os.killpg(p.pid,signal.SIGKILL)
   except ProcessLookupError:pass
   p.wait(timeout=5)
 finally:
  result={'schema':'1370-c0-h-typecheck-recorder-r5','status':status,'runId':a.run_id,'argv':argv,
          'elapsedSeconds':round(time.monotonic()-start,3),'wrapperExit':p.returncode,
          'logSha256':sha(log) if log.is_file() else None,'metaSha256':sha(meta) if meta.is_file() else None,
          'laneMetaPath':str(meta),'childResultPath':str(ROOT/a.run_id/'RESULT.json')}
  with receipt.open('x') as f:json.dump(result,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
  print(json.dumps({'status':status,'receipt':str(receipt),'sha256':sha(receipt)}),flush=True)
 if status!='RECORDER_CHILD_EXIT_0':raise RuntimeError(status)
if __name__=='__main__':
 try:main()
 except BaseException as e:print('STOP_RECORDER '+repr(e),file=sys.stderr,flush=True);sys.exit(1)
