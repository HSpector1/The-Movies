#!/usr/bin/env python3
"""One-shot, recorded hash binder for the completed adoption archive; no readback."""
import hashlib,json,os,pathlib,shutil,signal,stat,subprocess,time
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
R=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
ROOT=S/'1370-ebg-adoption-archive-builder-recorded-r1/20261008-ebg-adoption-archive-r1'
OUT=S/'1370-ebg-adoption-archive-local-readback-filled-r2/BINDING.json'
BUILD_META=S/'1370-ebg-adoption-archive-builder-20261008-ebg-adoption-archive-r1.lane.log.meta'
BUILD_LOG=S/'1370-ebg-adoption-archive-builder-20261008-ebg-adoption-archive-r1.lane.log'
HEAD='b97129610a07d3529fc482daeddc0cd9bf798713'
TREE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
SIZES=[67108864,67108864,7104512]
def sha(raw):return hashlib.sha256(raw).hexdigest()
def safe(path,cap):
 st=path.lstat();assert stat.S_ISREG(st.st_mode) and st.st_nlink==1 and st.st_size<=cap
 raw=path.read_bytes();assert len(raw)==st.st_size;return raw
def guard():
 assert subprocess.check_output(['pmset','-g','batt'],text=True,timeout=5).splitlines()[:1]==["Now drawing from 'AC Power'"]
 assert shutil.disk_usage(S).free>=3221225472
def main():
 signal.signal(signal.SIGALRM,lambda *_:(_ for _ in ()).throw(TimeoutError('120-second prehash deadline')))
 signal.setitimer(signal.ITIMER_REAL,120)
 assert not OUT.exists() and OUT.parent.is_dir() and not OUT.parent.is_symlink()
 assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip()==HEAD
 assert subprocess.check_output(['git','rev-parse','HEAD:src'],cwd=R,text=True).strip()==TREE
 assert subprocess.check_output(['git','status','--porcelain=v1'],cwd=R,text=True)==''
 assert subprocess.check_output(['git','ls-remote','--exit-code','origin','refs/heads/wip/headless-program-20260916-ts'],cwd=R,text=True).strip()==HEAD+'\trefs/heads/wip/headless-program-20260916-ts'
 lock=S/'HEAVY-LANE-LOCK';assert lock.is_file() and '1370-ebg-adoption-archive-readback-prehash-r1.lane.log' in lock.read_text()
 guard()
 assert sorted(p.name for p in ROOT.iterdir())==['BUILD-RESULT.json','capture.tar.part-001','capture.tar.part-002','capture.tar.part-003']
 meta=safe(BUILD_META,100000);log=safe(BUILD_LOG,100000)
 assert b'end, exit 0;' in meta and b'20261008-ebg-adoption-archive-r1' in meta
 assert b'LOCAL_BUILD_ONLY_NEEDS_INDEPENDENT_READBACK' in log
 result_raw=safe(ROOT/'BUILD-RESULT.json',100000);result=json.loads(result_raw)
 assert result['status']=='LOCAL_BUILD_ONLY_NEEDS_INDEPENDENT_READBACK'
 assert result['schema']=='1370-ebg-adoption-archive-build-result-r1' and result['runId']=='20261008-ebg-adoption-archive-r1'
 assert result['head']==HEAD and result['sourceTree']==TREE
 assert result['observedReceiptSha256']=='c98f49e901ac2e4ca8d14eb76b15f01e0030746c046747cf4024717575ce2d15'
 assert result['sourceRosterSha256']=='f957f2244bd1bebfa405bd2fcb4cf284c670dfc2ba6bc6a896b2c8d482a630d0'
 assert result['designManifestSha256']=='c7c4bc43958101840c6193d792c610e2f1c793e38e1e90d959cc01b79f47eae9'
 assert result['staticReviewSha256']=='ce901c33ffa0033c354a1006dcb8c14dd0b4b63115369fb6d3163a24e889b36b'
 assert result['sourceBytes']==141289801 and len(result['members'])==30
 assert result['tarBytes']==141322240 and [p['bytes'] for p in result['parts']]==SIZES
 whole=hashlib.sha256();parts=[]
 for i,size in enumerate(SIZES,1):
  name=f'capture.tar.part-{i:03d}';path=ROOT/name
  st=path.lstat();assert stat.S_ISREG(st.st_mode) and st.st_nlink==1 and st.st_size==size
  h=hashlib.sha256();n=0
  with path.open('rb') as f:
   for block in iter(lambda:f.read(1<<20),b''):
    h.update(block);whole.update(block);n+=len(block)
    if n%(8<<20)==0:guard()
  after=path.lstat();assert (st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns)
  assert n==size and result['parts'][i-1]=={'name':name,'bytes':n,'sha256':h.hexdigest()}
  parts.append({'name':name,'bytes':n,'sha256':h.hexdigest()});guard()
 assert whole.hexdigest()==result['tarSha256']
 binding={'schema':'1370-ebg-adoption-archive-local-readback-binding-r2','runId':result['runId'],'sourceHead':HEAD,'sourceTree':TREE,'buildResultSha256':sha(result_raw),'buildLaneMetaSha256':sha(meta),'buildLaneLogSha256':sha(log),'tarBytes':result['tarBytes'],'tarSha256':whole.hexdigest(),'parts':parts}
 raw=(json.dumps(binding,sort_keys=True,indent=2)+'\n').encode()
 with OUT.open('xb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
 signal.setitimer(signal.ITIMER_REAL,0)
 print(json.dumps({'bindingSha256':sha(raw),'tarSha256':whole.hexdigest(),'partSha256':[p['sha256'] for p in parts]}))
if __name__=='__main__':main()
