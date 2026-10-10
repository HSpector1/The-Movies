import datetime,hashlib,json,os,shutil,stat,subprocess
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');D=S/'1370-an-approved-browser-npm-cache-cleanup-20261010-r1';D.mkdir(mode=0o700)
roots=[Path('/Users/zacheryspector/Library/Caches/Google'),Path('/Users/zacheryspector/Library/Application Support/Google/Chrome/Default/Service Worker/CacheStorage'),Path('/Users/zacheryspector/.npm/_cacache')]
def run(argv):
 p=subprocess.run(argv,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=60);return {'argv':argv,'returncode':p.returncode,'stdout':p.stdout.decode(errors='replace'),'stderr':p.stderr.decode(errors='replace')}
def allocated(p):
 r=run(['/usr/bin/du','-sk',str(p)]);assert r['returncode']==0 and not r['stderr'];return int(r['stdout'].split()[0])*1024
v={'schema':'1370-previously-authorized-cache-cleanup/v1','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'authorization':'Prior explicit user approvals for Google app cache, Chrome Service Worker CacheStorage, npm download cache, including briefly close/reopen Chrome. No new scope. Chrome normal quit separately completed0 after observed PID96707.','beforeFreeBytes':shutil.disk_usage(S).free,'roots':[],'reopenChrome':None,'projectEvidenceTouched':False}
try:
 assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
 p=run(['/usr/bin/pgrep','-x','Google Chrome']);assert p['returncode']==1 and not p['stdout'] and not p['stderr'];v['chromeMainAbsent']=True
 for root in roots:
  st=root.lstat();assert root.resolve(strict=True)==root and stat.S_ISDIR(st.st_mode) and not root.is_symlink()
  opened=run(['/usr/sbin/lsof','-nP','-Fp','+D',str(root)]);assert opened['returncode']==1 and not opened['stdout'] and not opened['stderr'],opened
  before=allocated(root);children=list(root.iterdir());v['roots'].append({'path':str(root),'allocatedBytesBefore':before,'childEntries':len(children),'noOpenFiles':True,'rootRetained':True,'completed':False})
  for child in children:
   mode=child.lstat().st_mode
   if stat.S_ISDIR(mode) and not stat.S_ISLNK(mode):shutil.rmtree(child)
   else:child.unlink()
  v['roots'][-1].update({'allocatedBytesAfter':allocated(root),'completed':True})
 v['status']='COMPLETED_PREVIOUSLY_AUTHORIZED_CACHE_CONTENTS_ONLY'
except BaseException as e:
 v['status']='STOP_CACHE_CLEANUP';v['errorType']=type(e).__name__;v['error']=str(e);raise
finally:
 v['afterFreeBytesBeforeReopen']=shutil.disk_usage(S).free
 v['reopenChrome']=run(['/usr/bin/open','-a','Google Chrome'])
 v['afterFreeBytes']=shutil.disk_usage(S).free
 p=D/'RESULT.json'
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);b=p.read_bytes();print(json.dumps({'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'status':v['status'],'beforeFreeBytes':v['beforeFreeBytes'],'afterFreeBytes':v['afterFreeBytes'],'completedRoots':sum(x['completed'] for x in v['roots'])}),flush=True)
