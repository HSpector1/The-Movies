import os,stat,json,hashlib,sys
from pathlib import Path
BASE=Path(__file__).parent
def need(ok,message):
 if not ok: raise RuntimeError(message)
def pairs(rows):
 out={}
 for k,v in rows:
  need(k not in out,'duplicate JSON key');out[k]=v
 return out
def parse(raw):return json.loads(raw.decode('utf-8','strict'),object_pairs_hook=pairs,parse_constant=lambda x: (_ for _ in ()).throw(ValueError(x)))
def read(role):
 p=Path(role['path']);need(str(p).startswith('/Users/zacheryspector/studio-scratch/'),'scratch artifact only')
 need(p.is_absolute() and p.resolve(strict=True)==p,'physical named artifact')
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  a=os.fstat(fd);need(stat.S_ISREG(a.st_mode) and a.st_nlink==1 and a.st_size<=32*1024*1024,'bounded retained artifact')
  blocks=[];h=hashlib.sha256();total=0
  while True:
   b=os.read(fd,65536)
   if not b:break
   total+=len(b);need(total<=32*1024*1024,'cap');h.update(b);blocks.append(b)
  z=os.fstat(fd);need((a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(z.st_dev,z.st_ino,z.st_size,z.st_mtime_ns,z.st_ctime_ns),'artifact changed')
  need(total==role['bytes'] and h.hexdigest()==role['sha256'],'role mismatch '+p.name)
  return b''.join(blocks)
 finally:os.close(fd)
def exact(a,b):
 if type(a)!=type(b):return False
 if isinstance(a,dict):return set(a)==set(b) and all(exact(a[k],b[k]) for k in a)
 if isinstance(a,list):return len(a)==len(b) and all(exact(x,y) for x,y in zip(a,b))
 return a==b
input_data=parse((BASE/'POST-EVIDENCE-INPUT.json').read_bytes())
raw={k:read(v) for k,v in input_data['roles'].items()}
base=parse(raw['baseline']);post=parse(raw['fullPostflightSnapshot']);rb=parse(raw['fullPostflightReadback']);tool=parse(raw['actualTool'])
need(exact(base['immutable'],post['immutable']),'complete immutable mismatch')
need(base['status']==post['status']=='GUARDS_ACCEPTED_READONLY' and base['phase']=='before-fill' and post['phase']=='postflight','snapshot statuses')
need(len(post['immutable']['strictRoots'])==9 and exact(base['immutable']['strictRoots'],post['immutable']['strictRoots']),'nine strict roots')
need(exact(base['immutable']['scratchParentIdentity'],post['immutable']['scratchParentIdentity']),'scratch identity')
need(tool['sessionId']==89456 and tool['finalExit']==0 and tool['allToolChunks'][-1]['exit_code']==0,'actual terminal tool')
pins=parse(raw['snapshotPins'])
need(pins['status']=='GUARDS_ACCEPTED_READONLY' and pins['files']['SNAPSHOT.json']==input_data['roles']['fullPostflightSnapshot']['sha256'],'snapshot pins')
need(rb['fullImmutableEqual'] is True and rb['nineStrictRootsEqual'] is True and rb['scratchIdentityOnlyEqual'] is True and rb['laneReleased'] is True,'readback preserve')
ids=[49057,49312,49313,61080]
need(rb['actualOwnedPids']==rb['actualOwnedGroupIds']==ids,'owned roster')
checks=rb['scopedOwnershipChecks'];need(len(checks)==8 and {(x['kind'],x['id'],x['result']) for x in checks}=={(kind,i,'ESRCH') for i in ids for kind in ('pid','pgid')},'fresh scoped absences')
need(not raw['stderr'],'post stderr')
report={'schema':'1370-finite-fullfunction-stop-post-evidence-audit/v1','roles':input_data['roles'],'allExactRolesMatched':True,'losslessIntegerParsing':True,'duplicateKeysRejected':True,'completeImmutableTypedEqual':True,'nineStrictRootsTypedEqual':True,'scratchIdentityTypedEqual':True,'snapshotKeys':sorted(post),'immutableKeys':sorted(post['immutable']),'strictRootNames':sorted(post['immutable']['strictRoots']),'postFactsBefore':post.get('factsBefore'),'postFactsAfter':post.get('factsAfter'),'snapshotGuardElapsedSeconds':post.get('elapsedSeconds'),'snapshotInventoryElapsedSeconds':post.get('inventoryElapsedSeconds'),'actualTerminalExit':0,'scopedRecordedAbsences':checks,'classification':parse(raw['rawLocalOnlyClassification']),'retainedStdout':raw['stdout'].decode('utf-8','strict'),'candidateImported':False,'privateInventory':False,'processProbesExecuted':False}
output=BASE/'POST-EVIDENCE-AUDIT.json';encoded=(json.dumps(report,sort_keys=True,indent=2)+'\n').encode()
fd=os.open(output,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'wb') as f:f.write(encoded);f.flush();os.fsync(f.fileno())
print(json.dumps({'path':str(output),'bytes':len(encoded),'sha256':hashlib.sha256(encoded).hexdigest(),'completeImmutableTypedEqual':True}))

