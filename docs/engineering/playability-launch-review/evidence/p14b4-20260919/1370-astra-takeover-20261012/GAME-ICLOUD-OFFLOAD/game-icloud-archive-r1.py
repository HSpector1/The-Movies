from pathlib import Path
import os, stat, json, hashlib, subprocess, datetime, tarfile, io, sys
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-astra-takeover-20261012'
D=Path('/Users/zacheryspector/Library/Mobile Documents/com~apple~CloudDocs/The Movies Archive/2026-10-13-inactive-verification')
M=A/'GAME-ICLOUD-ARCHIVE-MANIFEST-r1.json'
def now():return datetime.datetime.now().astimezone().isoformat()
def free():s=os.statvfs(S);return s.f_bavail*s.f_frsize
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def safe(p):
 for q in [p,*p.parents]:
  if q==Path('/'):break
  assert not q.is_symlink(),str(q)
 st=p.stat();assert stat.S_ISREG(st.st_mode) and st.st_uid==os.getuid() and st.st_nlink==1,str(p)
 return st
def quiet():
 assert not (S/'HEAVY-LANE-LOCK').exists()
 r=subprocess.run(['/usr/sbin/lsof','-nP','-u',str(os.getuid()),'-Fn'],text=True,capture_output=True,timeout=30)
 assert r.returncode==0,r.stderr
 return {l[1:] for l in r.stdout.splitlines() if l.startswith('n')}
mode=sys.argv[1]
if mode=='pack':
 assert not M.exists() and not D.exists()
 chosen=set();roots=[];skipped=[]
 for row in json.loads((A/'game-icloud-inactive-candidates-r1.LOCAL.json').read_text()):
  p=Path(row['path'])
  if p.name.startswith('1370-ar-') or p.name=='1361-prod':continue
  roots.append(str(p))
  for root,dirs,files in os.walk(p,followlinks=False):
   dirs[:]=[n for n in dirs if n not in ('.git','node_modules','.venv') and not (Path(root)/n).is_symlink()]
   for n in files:
    q=Path(root)/n
    if n=='.git' or q.is_symlink():continue
    chosen.add(q)
 for row in json.loads((A/'game-icloud-large-inactive-files-r1.LOCAL.json').read_text()):chosen.add(Path(row['path']))
 opened=quiet();rows=[]
 for p in sorted(chosen):
  if str(p) in opened:skipped.append(dict(path=str(p),reason='open handle'));continue
  st=safe(p)
  rows.append(dict(path=str(p.relative_to(S)),size=st.st_size,allocated=st.st_blocks*512,uid=st.st_uid,mode=stat.S_IMODE(st.st_mode),mtimeNs=st.st_mtime_ns,inode=st.st_ino,device=st.st_dev,sha256=sha(p)))
 d=dict(createdAt=now(),authorization='Owner: Any files from this game can be taken from this laptop to the icloud and offloaded',sourceRoot=str(S),destination=str(D),purpose='Inactive pre-current integration verification records and old source copies; current R/K/A, preview, 1370-ar integration packages, Git, dependency trees, symlinks retained locally.',rows=rows,selectedRoots=roots,skipped=skipped,freeBeforeBytes=free(),allocatedEstimate=sum(r['allocated'] for r in rows),logicalBytes=sum(r['size'] for r in rows))
 M.write_text(json.dumps(d,indent=2)+'\n');D.mkdir(parents=True)
 (D/'MANIFEST.json').write_bytes(M.read_bytes())
 out=D/'inactive-verification.tar.gz';tmp=D/'inactive-verification.tar.gz.partial'
 with tarfile.open(tmp,'w:gz',compresslevel=1,dereference=False) as t:
  b=M.read_bytes();i=tarfile.TarInfo('ARCHIVE-MANIFEST.json');i.size=len(b);i.mode=0o644;t.addfile(i,io.BytesIO(b))
  for row in rows:
   p=S/row['path'];st=safe(p);assert(st.st_size,st.st_mtime_ns,st.st_ino)==(row['size'],row['mtimeNs'],row['inode'])
   t.add(p,arcname='studio-scratch/'+row['path'],recursive=False)
 print(json.dumps(dict(stage='packed-verifying',files=len(rows),allocatedGiB=d['allocatedEstimate']/1024**3,archiveBytes=tmp.stat().st_size)),flush=True)
 with tarfile.open(tmp,'r:gz') as t:
  for index,m in enumerate(t):
   if index==0:assert m.name=='ARCHIVE-MANIFEST.json' and t.extractfile(m).read()==M.read_bytes();continue
   row=rows[index-1];assert m.isfile() and m.name=='studio-scratch/'+row['path'] and m.size==row['size'] and m.mode==row['mode']
   h=hashlib.sha256();f=t.extractfile(m)
   for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
   assert h.hexdigest()==row['sha256'],m.name
  assert index==len(rows)
 tmp.rename(out)
 receipt=dict(at=now(),archive=str(out),archiveSHA256=sha(out),archiveBytes=out.stat().st_size,manifestSHA256=sha(M),verifiedMembers=len(rows),allMemberBytesAndModesVerified=True,freeAfterPackBytes=free(),originalsRetained=True)
 (A/'GAME-ICLOUD-ARCHIVE-PACK-VERIFIED-r1.json').write_text(json.dumps(receipt,indent=2)+'\n')
 print(json.dumps(receipt),flush=True)
