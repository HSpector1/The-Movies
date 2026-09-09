#!/usr/bin/env python3
"""Actual packaged engines: genuine accepted outer checkpoint migration and future-schema refusal."""
import argparse, json, hashlib, tempfile, pathlib, subprocess, urllib.request, time, os, secrets
parser=argparse.ArgumentParser()
parser.add_argument('--accepted-engine',required=True,type=pathlib.Path)
parser.add_argument('--engine',required=True,type=pathlib.Path)
parser.add_argument('--accepted-checkpoint',required=True,type=pathlib.Path)
parser.add_argument('--checkpoint',required=True,type=pathlib.Path)
parser.add_argument('--evidence',required=True,type=pathlib.Path)
parser.add_argument('--port',default=43422,type=int)
args=parser.parse_args()
old,new,prior,current,out=args.accepted_engine,args.engine,args.accepted_checkpoint,args.checkpoint,args.evidence
out.mkdir(parents=True,exist_ok=False)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def probe(label,engine,source,healthy,migrate=False):
 with tempfile.TemporaryDirectory(prefix='p11-compat-') as root:
  root=pathlib.Path(root);cp=root/'bridge-runtime-v1.json'; cp.write_bytes(source.read_bytes());os.chmod(cp,0o600)
  before=cp.read_bytes(); beforemt=cp.stat().st_mtime_ns;src=json.loads(before)
  cap=secrets.token_urlsafe(32); env=dict(os.environ,PROJECT_STUDIO_BRIDGE_CAPABILITY=cap,PROJECT_STUDIO_BRIDGE_PORT=str(args.port),PROJECT_STUDIO_BRIDGE_RUNTIME_DIR=str(root))
  with (root/'engine.log').open('w') as log:
   p=subprocess.Popen(['node',str(engine)],env=env,stdout=log,stderr=log)
   response=None
   try:
    for _ in range(80):
     if p.poll() is not None:break
     try:
      req=urllib.request.Request(f'http://127.0.0.1:{args.port}/snapshot',headers={'x-project-studio-capability':cap})
      with urllib.request.urlopen(req,timeout=.5) as r: response=json.load(r)
      break
     except Exception:time.sleep(.1)
    assert bool(response)==healthy,(label,'health',p.poll())
    after=json.loads(cp.read_bytes())
    if healthy:
     if migrate:
      # Governed schema migration starts a fresh logical session and clears old response replay.
      assert after['sessionId']!=src['sessionId'] and after['stateRevision']==0
     else: assert after['sessionId']==src['sessionId'] and after['stateRevision']==src['stateRevision']
     for slot in ['currentSaveJson','savedSaveJson']:assert after[slot]==src[slot],(label,slot)
     if migrate:assert after['schemaId']!=src['schemaId'] and after['journal']==[]
    else:
     assert cp.read_bytes()==before and cp.stat().st_mtime_ns==beforemt
    report={'label':label,'passed':True,'engineSha256':sha(engine),'sourceSha256':sha(source),'sourceSchema':src['schemaId'],'afterSchema':after['schemaId'],'sourceSessionId':src['sessionId'],'afterSessionId':after['sessionId'],'sourceRevision':src['stateRevision'],'afterRevision':after['stateRevision'],'sourceJournalEntries':len(src['journal']),'afterJournalEntries':len(after['journal']),'healthy':bool(response),'currentAndSavedPreserved':all(src[s]==after[s] for s in ['currentSaveJson','savedSaveJson']),'refusalLeftBytesAndMtime':None if healthy else True}
   finally:
    if p.poll() is None:p.terminate()
    p.wait(timeout=10)
  (out/(label+'.engine.log')).write_text((root/'engine.log').read_text().replace(cap,'<redacted>'))
  (out/(label+'.json')).write_text(json.dumps(report,indent=2));print(json.dumps(report))
stamps={str(p):(sha(p),p.stat().st_mtime_ns) for p in [old,new,prior,current]}
probe('accepted-engine-genuine-checkpoint',old,prior,True)
probe('p11-engine-genuine-checkpoint',new,prior,True,True)
probe('accepted-engine-refuses-p11',old,current,False)
probe('p11-engine-current-checkpoint',new,current,True)
assert stamps=={str(pathlib.Path(p)):(sha(pathlib.Path(p)),pathlib.Path(p).stat().st_mtime_ns) for p in stamps}
print('all four compatibility cases and immutable sources PASS')
