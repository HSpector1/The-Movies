#!/usr/bin/env python3
"""Disposable Git/sandbox fixture only; never reads or writes live project Git."""
import json,os,sys,time
from pathlib import Path
import publish_stage41 as p

mode,stage_raw,output_raw,protected_raw,remote_raw,objects_raw=sys.argv[1:]
stage=Path(stage_raw);output=Path(output_raw);protected=Path(protected_raw);remote=Path(remote_raw);objects=Path(objects_raw)
p.START=time.monotonic();p.LOGS=p.RunLogs(output,[protected,stage],stage,synthetic=True)
try:
 if mode=='ordinary':
  p.STAGE=stage/'publisher.git'
  p.command('/usr/bin/git','init','--bare',str(p.STAGE))
  alternate=p.STAGE/'objects/info/alternates'
  alternate.write_text(str(objects)+'\n')
  env={'GIT_INDEX_FILE':str(stage/'index')}
  base=os.environ['FIXTURE_BASE']
  p.git('update-ref','refs/heads/evidence/test',base)
  p.git('read-tree',base,env=env)
  oid=p.git('hash-object','-w','--stdin',input_bytes=b'new fixture evidence\n')
  p.git('update-index','--add','--cacheinfo',f'100644,{oid},new.txt',env=env)
  tree=p.git('write-tree',env=env)
  commit=p.git('commit-tree',tree,'-p',base,'-m','fixture stage41',env=env)
  p.git('update-ref','refs/heads/evidence/test',commit,base)
  p.git('push','--no-force',str(remote),'refs/heads/evidence/test:refs/heads/evidence/test')
  assert p.git('ls-remote',str(remote),'refs/heads/evidence/test').split()[0]==commit
  result={'status':'SCRATCH_PUSH_PASS','base':base,'commit':commit}
 elif mode=='moved':
  result={'status':'SHOULD_NEVER_WRITE_PROTECTED'}
 else:raise ValueError(mode)
 p.LOGS.finish(result)
 print(json.dumps(result,sort_keys=True))
finally:
 p.LOGS.close();p.LOGS=None;p.STAGE=None;p.START=None
