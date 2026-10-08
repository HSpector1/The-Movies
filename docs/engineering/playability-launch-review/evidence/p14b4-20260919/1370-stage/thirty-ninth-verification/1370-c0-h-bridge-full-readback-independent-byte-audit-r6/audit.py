import hashlib,json,os,pathlib,signal,stat,subprocess,time
START=time.monotonic()
def alarm(*_): raise TimeoutError('180-second independent mirror audit deadline')
signal.signal(signal.SIGALRM,alarm);signal.setitimer(signal.ITIMER_REAL,180)
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
MIRROR=S/'1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1'
SPEC=S/'1370-c0-h-bridge-full-readback-runner-proposal-r6/SPEC.json'
RAW=S/'1370-c0-h-bridge-full-readback-recorded-r6/READBACK.json'
OUT=S/'1370-c0-h-bridge-full-readback-independent-byte-audit-r6/BYTE-AUDIT.json'
PIN='3da9e86417520a6e75591e107e85f4bacf3ba8b7e9fef4b33bca30f854723724'
def need(x,msg):
 if not x:raise RuntimeError(msg)
def run(*argv):
 p=subprocess.run(argv,cwd=REPO,capture_output=True,timeout=30)
 need(p.returncode==0,'command '+str(argv));return p.stdout
def same(st):return (st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns)
need(not OUT.exists(),'one shot')
need(not (S/'HEAVY-LANE-LOCK').is_symlink(),'lock symlink')
need(b'c0-h-bridge-full-readback-independent-byte-audit-r6.lane.log' in (S/'HEAVY-LANE-LOCK').read_bytes(),'sole lane')
need(os.statvfs(S).f_bavail*os.statvfs(S).f_frsize>=3*1024**3,'disk')
need(run('git','status','--porcelain=v1')==b'','dirty production')
need(run('git','rev-parse','HEAD').strip()==b'9651546af98c44f04e8b6b2714d10d67dadb8f9c','HEAD')
need(run('git','rev-parse','HEAD:src').strip()==b'13880d9b0ba72aff5d4c5bcf5d12fe682c5de554','src tree')
spec=json.loads(SPEC.read_bytes());raw=RAW.read_bytes();need(hashlib.sha256(raw).hexdigest()==PIN,'raw pin');result=json.loads(raw)
h=spec['historicalHCommit'];need(run('git','rev-parse',h+'^{tree}').strip().decode()==spec['historicalHRootTree'],'H root')
need(run('git','rev-parse',h+':src').strip().decode()==spec['historicalHTree'],'H src')
need(run('git','rev-parse',h+':bridge').strip().decode()==spec['historicalBridgeTree'],'H bridge')
def roster(*parts):
 out={}
 for entry in run('git','ls-tree','-rl','-z',h,*parts).split(b'\0'):
  if not entry:continue
  header,path=entry.split(b'\t',1);mode,kind,oid,size=header.decode().split()
  need(kind=='blob' and mode in ('100644','100755'),'Git kind/mode')
  name=path.decode();need(name not in out,'duplicate Git path');out[name]=(mode,oid,int(size))
 return out
expected=roster('src','tests','ui','package.json','package-lock.json','tsconfig.json','tsconfig.src.json','vitest.config.ts','vitest.workspace.ts')
need(len(expected)==1342 and sum(x[2] for x in expected.values())==98114949,'H base')
bridge=roster('bridge');need(len(bridge)==58 and sum(x[2] for x in bridge.values())==1357248,'bridge')
need(set(expected).isdisjoint(bridge),'Git overlap');expected.update(bridge)
for item in spec['overlays']:
 name=item['destination'];baseline=item['baseline']
 if baseline['status']=='PRESENT':need(expected.get(name)==(baseline['gitMode'],baseline['gitBlob'],baseline['bytes']),'overlay baseline')
 else:need(baseline['status']=='ABSENT_AT_SOURCE_COMMIT' and name not in expected,'overlay absence')
 expected[name]=('OVERLAY',item['sha256'],item['bytes'])
need(len(expected)==1402 and sum(x[2] for x in expected.values())==99516095,'expected totals')
root_before=os.lstat(MIRROR);need(stat.S_ISDIR(root_before.st_mode),'mirror root type');seen={};dirs=0;link=None;entries=0

def walk(d,prefix=''):
 global dirs,link,entries
 before=os.lstat(d);need(stat.S_ISDIR(before.st_mode),'directory type')
 with os.scandir(d) as it:names=sorted(list(it),key=lambda x:os.fsencode(x.name))
 for item in names:
  entries+=1;need(entries<=1500,'entry cap')
  name=prefix+item.name;st=item.stat(follow_symlinks=False)
  if stat.S_ISDIR(st.st_mode):
   dirs+=1;need(any(p.startswith(name+'/') for p in expected),'extra dir');walk(pathlib.Path(item.path),name+'/')
  elif stat.S_ISLNK(st.st_mode):
   need(name=='node_modules' and link is None,'extra symlink');link=same(st)
   need(os.readlink(item.path)==spec['expected']['symlinkText'],'link text')
  else:
   need(stat.S_ISREG(st.st_mode) and name in expected and name not in seen,'unexpected file')
   mode,pin,size=expected[name];need(st.st_size==size and st.st_nlink==1,'size/link count')
   need(stat.S_IMODE(st.st_mode)==(0o755 if mode=='100755' else 0o644),'file mode')
   fd=os.open(item.path,os.O_RDONLY|os.O_NOFOLLOW)
   try:
    need(same(os.fstat(fd))==same(st),'open drift')
    oid=hashlib.sha1(('blob '+str(size)+'\0').encode());sha=hashlib.sha256();got=0
    while True:
     block=os.read(fd,65536)
     if not block:break
     got+=len(block);need(got<=size,'growth');oid.update(block);sha.update(block)
     need(time.monotonic()-START<180,'deadline')
    need(got==size and same(os.fstat(fd))==same(st)==same(os.lstat(item.path)),'file drift')
   finally:os.close(fd)
   need((sha.hexdigest() if mode=='OVERLAY' else oid.hexdigest())==pin,'content '+name)
   seen[name]=[name,size,oid.hexdigest(),sha.hexdigest(),stat.S_IMODE(st.st_mode)]
 need(same(os.lstat(d))==same(before),'dir drift')
walk(MIRROR)
need(len(seen)==1402 and dirs==76 and entries==1479 and link is not None,'tree shape')
need(same(os.lstat(MIRROR))==same(root_before),'root drift')
need(link==same(os.lstat(MIRROR/'node_modules')),'link drift')
proof=hashlib.sha256()
for name in sorted(seen,key=lambda x:x.encode('utf-8')):proof.update(json.dumps(seen[name],separators=(',',':')).encode()+b'\n')
need(proof.hexdigest()==result['fileProofDigestSha256'],'proof digest')
need(list(same(root_before))==result['mirrorRootIdentity'] and list(link)==result['nodeModulesLinkIdentity'],'identity')
need(run('git','status','--porcelain=v1')==b'','dirty post')
payload={'decision':'PASS_INDEPENDENT_H_MIRROR_BYTES_ONLY','regularFiles':len(seen),'regularBytes':sum(x[1] for x in seen.values()),'directories':dirs,'symlinks':1,'entries':entries,'proofDigestSha256':proof.hexdigest(),'readbackSha256':PIN,'rootIdentity':list(same(root_before)),'linkIdentity':list(link),'elapsedSeconds':round(time.monotonic()-START,3),'claimLimit':'Independent source byte readback only; no typecheck/game acceptance'}
with OUT.open('x') as f:json.dump(payload,f,indent=2,sort_keys=True);f.write('\n');f.flush();os.fsync(f.fileno())
print(json.dumps(payload,sort_keys=True));signal.setitimer(signal.ITIMER_REAL,0)
