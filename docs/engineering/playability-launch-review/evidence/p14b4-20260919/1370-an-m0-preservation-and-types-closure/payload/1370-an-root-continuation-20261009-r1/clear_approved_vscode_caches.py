import datetime,hashlib,json,os,shutil,signal,stat,subprocess,time
from pathlib import Path
A=Path(__file__).parent;S=Path('/Users/zacheryspector/studio-scratch');P=S/'1370-an-approved-vscode-cache-cleanup-20261009-r1';P.mkdir(mode=0o700)
updater=51453
expected='/Applications/Visual Studio Code.app/Contents/Frameworks/Squirrel.framework/Resources/ShipIt com.microsoft.VSCode.ShipIt /Users/zacheryspector/Library/Caches/com.microsoft.VSCode.ShipIt/ShipItState.plist'
targets=[Path('/Users/zacheryspector/Library/Caches/com.microsoft.VSCode.ShipIt/update.eWV5hFm'),Path('/Users/zacheryspector/Library/Application Support/Code/CachedExtensionVSIXs')]
def put(name,v):
 p=P/name
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def run(argv):
 r=subprocess.run(argv,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=45);return {'argv':argv,'exit':r.returncode,'stdout':r.stdout.decode(),'stderr':r.stderr.decode()}
before=shutil.disk_usage(S).free
ps=run(['/bin/ps','-p',str(updater),'-o','pid=,lstart=,command=']);assert ps['exit']==0 and expected in ps['stdout'] and 'Thu Oct  8 17:14:33 2026' in ps['stdout']
for target in targets:assert target.is_dir() and not target.is_symlink() and target.resolve(strict=True)==target
du=run(['/usr/bin/du','-sk',*[str(p) for p in targets]]);assert du['exit']==0
grant=put('GRANT.json',{'schema':'1370-root-approved-cache-cleanup/v1','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'authority':'Owner explicitly approved removal of VS Code cached extension installers; separately approved stopping only the idle updater and clearing its staged cache after exit. That exact still-idle Oct8 updater is present. Authorization persists; no new deletion categories.','updater':updater,'exactCommand':expected,'processBefore':ps,'targets':[str(p) for p in targets],'diskFreeBefore':before,'duBefore':du,'method':'SIGTERM exact observed updater only; require disappearance, verify no open files in exact caches, remove staged update and installer cache contents; retain editor and cache root.'})
os.kill(updater,signal.SIGTERM)
deadline=time.monotonic()+10
while True:
 try:os.kill(updater,0)
 except ProcessLookupError:break
 assert time.monotonic()<deadline,'Updater did not exit; no deletion'
 time.sleep(.2)
checks=[]
for target in targets:
 opened=run(['/usr/sbin/lsof','-nP','+D',str(target)]);assert opened['exit']==1 and opened['stdout']=='' and opened['stderr']=='','Open cache file or incomplete check; no deletion'
 checks.append(opened)
removed=[]
for target in targets:
 if target.name=='CachedExtensionVSIXs':
  for child in list(target.iterdir()):
   removed.append(str(child))
   if child.is_dir() and not child.is_symlink():shutil.rmtree(child)
   else:child.unlink()
 else:shutil.rmtree(target);removed.append(str(target))
after=shutil.disk_usage(S).free
print(json.dumps(put('RESULT.json',{'schema':'1370-root-approved-cache-cleanup-result/v1','status':'APPROVED_TWO_VSCODE_CACHE_SCOPES_CLEARED','grant':grant,'updaterEsrch':True,'openFileChecks':checks,'removedPaths':removed,'diskFreeBefore':before,'diskFreeAfter':after,'freeByteIncrease':after-before,'gameFilesTouched':False,'evidenceTouched':False,'activeEditorStopped':False})))
print(json.dumps({'freeBytes':after,'reclaimedBytes':after-before,'updaterExited':True}))
