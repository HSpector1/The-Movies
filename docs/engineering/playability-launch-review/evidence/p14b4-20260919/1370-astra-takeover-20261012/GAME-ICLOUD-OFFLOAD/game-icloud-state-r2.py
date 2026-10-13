from pathlib import Path
import subprocess,json,datetime,sys,os
A=Path('/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012')
D=Path('/Users/zacheryspector/Library/Mobile Documents/com~apple~CloudDocs/The Movies Archive/2026-10-13-inactive-verification-2')
paths=[str(D/'inactive-verification.tar.gz'),str(D/'MANIFEST.json')]
js="""ObjC.import('Foundation');var paths=PATHS;var keys=$([$.NSURLIsUbiquitousItemKey,$.NSURLUbiquitousItemIsUploadedKey,$.NSURLUbiquitousItemIsUploadingKey,$.NSURLUbiquitousItemIsDownloadingKey,$.NSURLUbiquitousItemDownloadingStatusKey,$.NSURLUbiquitousItemUploadingErrorKey,$.NSURLUbiquitousItemDownloadingErrorKey]);JSON.stringify(paths.map(function(p){var e=Ref();var u=$.NSURL.fileURLWithPath(p);var v=u.resourceValuesForKeysError(keys,e);return {path:p,values:v?ObjC.deepUnwrap(v):null,error:e[0]?ObjC.unwrap(e[0].localizedDescription):null};}));""".replace('PATHS',json.dumps(paths))
r=subprocess.run(['/usr/bin/osascript','-l','JavaScript'],input=js,text=True,capture_output=True,timeout=25);assert r.returncode==0,r.stderr
rows=json.loads(r.stdout)
for row in rows:
 p=Path(row['path']);row['allocatedBytes']=p.stat().st_blocks*512 if p.exists() else None
s=os.statvfs(A);d=dict(at=datetime.datetime.now().astimezone().isoformat(),rows=rows,freeBytes=s.f_bavail*s.f_frsize)
with (A/'GAME-ICLOUD-PROGRESS-r2.jsonl').open('a') as f:f.write(json.dumps(d)+'\n')
print(json.dumps(d,indent=2))
if len(sys.argv)>1:
 assert sys.argv[1]=='evict'
 assert all((x['values']or{}).get('NSURLIsUbiquitousItemKey') and (x['values']or{}).get('NSURLUbiquitousItemIsUploadedKey') and not (x['values']or{}).get('NSURLUbiquitousItemIsUploadingKey') and not x.get('error') and not any(k.endswith('ErrorKey') for k in (x['values']or{})) for x in rows),'NOT FULLY UPLOADED'
 js="""ObjC.import('Foundation');JSON.stringify(PATHS.map(function(p){var e=Ref();var ok=$.NSFileManager.defaultManager.evictUbiquitousItemAtURLError($.NSURL.fileURLWithPath(p),e);return {path:p,ok:!!ok,error:e[0]?ObjC.unwrap(e[0].localizedDescription):null};}));""".replace('PATHS',json.dumps(paths))
 r=subprocess.run(['/usr/bin/osascript','-l','JavaScript'],input=js,text=True,capture_output=True,timeout=30);assert r.returncode==0,r.stderr
 result=json.loads(r.stdout);(A/'GAME-ICLOUD-EVICTION-r2.json').write_text(json.dumps(dict(at=datetime.datetime.now().astimezone().isoformat(),before=d,result=result),indent=2)+'\n');print(r.stdout);assert all(x['ok'] and not x.get('error') for x in result)
