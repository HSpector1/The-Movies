from pathlib import Path
import os,stat,hashlib,json,subprocess,datetime
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-astra-takeover-20261012'
manifest=json.loads((A/'GAME-ICLOUD-ARCHIVE-MANIFEST-r1.json').read_text());proof=json.loads((A/'GAME-ICLOUD-ARCHIVE-PACK-VERIFIED-r1.json').read_text())
assert hashlib.sha256((A/'GAME-ICLOUD-ARCHIVE-MANIFEST-r1.json').read_bytes()).hexdigest()==proof['manifestSHA256']
assert proof['allMemberBytesAndModesVerified'] and proof['verifiedMembers']==len(manifest['rows'])
# Authorized lossless move into verified local archive, before remote-upload completion.
# Keep archive resident and its descriptor open throughout; do not evict until Apple confirms upload.
archive=Path(proof['archive']);ast=archive.stat();assert archive.is_file() and not archive.is_symlink() and ast.st_blocks>0 and ast.st_size==proof['archiveBytes']
archive_handle=archive.open('rb');ah=hashlib.sha256()
for block in iter(lambda:archive_handle.read(1024*1024),b''):ah.update(block)
assert ah.hexdigest()==proof['archiveSHA256']
assert archive.stat().st_ino==ast.st_ino
assert not (S/'HEAVY-LANE-LOCK').exists()
lsof=subprocess.run(['/usr/sbin/lsof','-nP','-u',str(os.getuid()),'-Fn'],text=True,capture_output=True,timeout=30);assert lsof.returncode==0
opened={s[1:] for s in lsof.stdout.splitlines() if s.startswith('n')}
def free():s=os.statvfs(S);return s.f_bavail*s.f_frsize
def now():return datetime.datetime.now().astimezone().isoformat()
before=free();done=[];skipped=[]
log=A/'GAME-ICLOUD-LOCAL-CONSOLIDATION-r1.jsonl';assert not log.exists()
with log.open('x') as out:
 for row in sorted(manifest['rows'],key=lambda x:x['allocated'],reverse=True):
  if free()>=5*1024**3:break
  p=S/row['path']
  if str(p) in opened:skipped.append(dict(path=row['path'],reason='open handle'));continue
  for q in [p,*p.parents]:assert not q.is_symlink(),str(q)
  st=p.stat();assert stat.S_ISREG(st.st_mode) and st.st_uid==os.getuid() and st.st_nlink==1
  assert(st.st_ino,st.st_dev,st.st_size,st.st_mtime_ns,stat.S_IMODE(st.st_mode))==(row['inode'],row['device'],row['size'],row['mtimeNs'],row['mode'])
  h=hashlib.sha256()
  with p.open('rb') as f:
   for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
  assert h.hexdigest()==row['sha256']
  final=p.stat();assert(final.st_ino,final.st_dev,final.st_size,final.st_mtime_ns,final.st_ctime_ns,final.st_mode)==(st.st_ino,st.st_dev,st.st_size,st.st_mtime_ns,st.st_ctime_ns,st.st_mode)
  p.unlink()
  event=dict(at=now(),path=row['path'],sha256=row['sha256'],archivedMember='studio-scratch/'+row['path'],allocatedEstimate=row['allocated'])
  out.write(json.dumps(event)+'\n');out.flush();done.append(event)
receipt=dict(phase='Verified resident local archive consolidation; Apple upload may still be pending. No native eviction yet.',at=now(),destination=manifest['destination'],archiveSHA256=proof['archiveSHA256'],beforeOriginalOffloadBytes=before,afterBytes=free(),beforeOperationBytes=manifest['freeBeforeBytes'],actualNetRecoveredBytes=free()-manifest['freeBeforeBytes'],filesOffloaded=len(done),allocatedEstimateRemoved=sum(r['allocatedEstimate'] for r in done),skipped=skipped,stoppedAtFiveGiB=free()>=5*1024**3,remainingArchivedOriginalFiles=len(manifest['rows'])-len(done))
(A/'GAME-ICLOUD-LOCAL-CONSOLIDATION-RECEIPT-r1.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2))

archive_handle.close()
