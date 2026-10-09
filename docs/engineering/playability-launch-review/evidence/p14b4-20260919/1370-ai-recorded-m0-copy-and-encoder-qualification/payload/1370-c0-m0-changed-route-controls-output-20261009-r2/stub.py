import json,os,sys,time
from pathlib import Path
mode,specpath=sys.argv[1:];s=json.loads(Path(specpath).read_bytes());root=Path(s['scratchRoot']);root.mkdir(mode=0o700);leaf=Path(s['mirrorPath']);leaf.mkdir(mode=0o700)
(leaf/'owned-partial.txt').write_text('owned control leaf only\n');sys.stderr.write('owned stub stage before result\n');sys.stderr.flush()
if mode=='stop':raise SystemExit(2)
if mode=='timeout':time.sleep(8);raise SystemExit(3)
if mode=='cap':sys.stdout.buffer.write(b'x'*(32*1024**2+1));sys.stdout.buffer.flush();raise SystemExit(0)
r={'status':'MIRROR_MATERIALIZED_SOURCE_ONLY','arm':'M0','runId':s['runId'],'mirrorPath':s['mirrorPath'],'sourceCommit':s['sourceSha'],'sourceTree':s['productionSourceTree'],'sourceManifestSha256':s['m0SourceManifestSha256'],'sourceReviewSha256':s['m0ObserverSourceReviewSha256'],'sourceBytes':117828630,'overlayFiles':s['expectedOverlayFiles']}
if mode.startswith('bad-'):
 key=mode[4:]
 if key=='overlayFiles':r[key]=[]
 elif key=='sourceBytes':r[key]+=1
 else:r[key]='wrong'
p=Path(s['materializeReceiptPath']);p.write_text(json.dumps(r))
import hashlib
print(json.dumps({'status':'MIRROR_MATERIALIZED_SOURCE_ONLY','runId':s['runId'] if mode!='stdout-run' else 'wrong','receiptSha256':hashlib.sha256(p.read_bytes()).hexdigest() if mode!='stdout-sha' else '0'*64}))
