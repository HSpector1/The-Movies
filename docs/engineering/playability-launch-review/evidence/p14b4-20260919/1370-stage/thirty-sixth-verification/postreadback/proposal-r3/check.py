#!/usr/bin/env python3
"""Unrun postflight readback of the adoption comparator's independent audit."""
import hashlib,json,os,pathlib,re,shutil,stat,subprocess

S=pathlib.Path('/Users/zacheryspector/studio-scratch')
R=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
AUDIT=S/'1370-e0g-ebg-b-only-adoption-r2-independent-observed-audit-r6/AUDIT.json'
AUDIT_LOG=S/'heavy-queue/audit.lane.log'
AUDIT_META=S/'heavy-queue/audit.lane.log.meta'
COMPARATOR=S/'1370-e0g-ebg-b-only-adoption-comparator-runs-r2/20261008-bonly-adoption-r1'
COMPARATOR_META=S/'heavy-queue/1370-e0g-ebg-b-only-adoption-20261008-bonly-adoption-r1.lane.log.meta'
COMPARATOR_LOG=S/'heavy-queue/1370-e0g-ebg-b-only-adoption-20261008-bonly-adoption-r1.lane.log'
EXACT=S/'1370-e0g-ebg-b-only-adoption-r2-audit-filled-exact-review-r2/RECEIPT.json'
LAUNCH=S/'1370-e0g-ebg-b-only-adoption-r2-audit-filled-exact-r2/LAUNCH.command'
BINDING=S/'1370-e0g-ebg-b-only-adoption-r2-audit-filled-exact-r2/BINDING.json'
STATIC=S/'1370-e0g-ebg-b-only-adoption-r2-observed-audit-independent-static-review-r6/RECEIPT.json'
OUT=S/'1370-e0g-ebg-b-only-adoption-r2-postreadback-observed-recorded-r3/CHECK.json'
HEAD='b97129610a07d3529fc482daeddc0cd9bf798713'
TREE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
TIP='d8cb45ee094bd8647e19ebed7b63ce2d773dacd4'
RESULT_SHA='2e909fd66897f142e11830b92d51ec10d2a7b26cec3aa23f626b42a781ead8fa'
EXACT_SHA='3ea311259c74eedf1d38ce6db0ec81c5bb713ab598877828801a01d1d3e54d23'
LAUNCH_SHA='d3a546fb08ed09be401b6937ea2354b11159ea5965659df66eb49ffa455a00ce'
BINDING_SHA='f538c30d36e8c9e9f56603d7e6b5b2a20929311008f662c2f6d5d7fd16e2c9e0'
STATIC_SHA='16ee0fa94315cfc371db3d2499a6ba9e74621b8efe3526b61a2ac5e7431f4155'
AUDIT_SHA='3598f789f8d928b0dc26a7582fa5578196ac86e07e3a55fa0bb0142765c64654'
AUDIT_META_SHA='02e3aceecfcf8d6f6df11a08e26e24c768311870870e87971d3c600244c4a2be'
COMPARATOR_META_SHA='5df871cc5303476c7e28252c28c6752d6ff02e285cea04852bb4af7324354407'
EMPTY_LOG_SHA='e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
COMPARATOR_RECEIPT_SHA='26fbdc5a91f1d454f0ea838ee143ebde76020471b96504874765eddfed42eb14'

def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def sha(b):return hashlib.sha256(b).hexdigest()
def safe_read(p,pin=None,cap=32<<20):
 for parent in p.parents:need(stat.S_ISDIR(parent.lstat().st_mode),'symlink parent')
 st=p.lstat();need(stat.S_ISREG(st.st_mode) and st.st_nlink==1 and st.st_size<=cap,'unsafe file '+str(p))
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  before=os.fstat(fd);need((st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns)==(before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns),'open drift')
  h=hashlib.sha256();parts=[];n=0
  while b:=os.read(fd,1<<20):
   n+=len(b);need(n<=cap,'size cap');h.update(b);parts.append(b)
  after=os.fstat(fd);need(n==st.st_size and (before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns),'file changed')
  if pin is not None:need(h.hexdigest()==pin,'SHA drift '+str(p))
  return b''.join(parts)
 finally:os.close(fd)
def git(*args):return subprocess.check_output(['git',*args],cwd=R,text=True,timeout=30).strip()
def child_exit(p,pin):
 lines=safe_read(p,pin,cap=100000).decode().splitlines()
 starts=[i for i,s in enumerate(lines) if re.fullmatch(r'start; .+',s)]
 ends=[(i,int(m.group(1))) for i,s in enumerate(lines) if (m:=re.fullmatch(r'end, exit ([0-9]+); .+',s))]
 need(len(starts)==len(ends)==1 and starts[0]<ends[0][0] and ends[0][0]==len(lines)-1,'lane chronology')
 return ends[0][1]
def guard():
 need(not os.path.lexists(S/'HEAVY-LANE-LOCK'),'audit lane still owned')
 power=subprocess.check_output(['pmset','-g','batt'],text=True,timeout=5)
 need(power.splitlines()[:1]==["Now drawing from 'AC Power'"],'AC power')
 need(shutil.disk_usage(S).free>=3<<30,'3 GiB floor')
 need(git('rev-parse','HEAD')==HEAD and git('rev-parse','HEAD:src')==TREE and git('status','--porcelain=v1')=='','production drift')
 need(git('ls-remote','origin','refs/heads/wip/headless-program-20260916-ts').startswith(HEAD+'\t'),'remote production drift')
 need(git('ls-remote','origin','refs/heads/evidence/1370-r10-clean-captures').startswith(TIP+'\t'),'remote evidence drift')

def main():
 need(not os.path.lexists(OUT.parent) and not os.path.lexists(OUT),'one-shot output')
 guard()
 need(child_exit(AUDIT_META,AUDIT_META_SHA)==0 and child_exit(COMPARATOR_META,COMPARATOR_META_SHA)==0,'recorded child failure')
 audit_log=safe_read(AUDIT_LOG,EMPTY_LOG_SHA,cap=100000)
 comparator_log=safe_read(COMPARATOR_LOG,EMPTY_LOG_SHA,cap=100000)
 exact=json.loads(safe_read(EXACT,EXACT_SHA,100000));need(exact['decision']=='ACCEPT_EXACT_ONLY','exact review')
 need(sha(safe_read(LAUNCH,LAUNCH_SHA,100000))==LAUNCH_SHA and sha(safe_read(BINDING,BINDING_SHA,100000))==BINDING_SHA,'launch binding')
 static=json.loads(safe_read(STATIC,STATIC_SHA,100000));need(static['decision']=='ACCEPT_STATIC_ONLY','static review')
 need(sorted(p.name for p in COMPARATOR.iterdir())==['RECEIPT.json','RESULT.json'],'comparator leaf inventory')
 result_raw=safe_read(COMPARATOR/'RESULT.json',RESULT_SHA)
 comp_rec=json.loads(safe_read(COMPARATOR/'RECEIPT.json',COMPARATOR_RECEIPT_SHA,cap=100000))
 need(comp_rec['status']=='COMPLETED_DIAGNOSTIC_UNREVIEWED' and comp_rec['resultSha256']==RESULT_SHA,'comparator result receipt')
 result=json.loads(result_raw);need(result['boundaries']==len(result['boundaryIndex'])==417 and result['classification']=='DIAGNOSTIC_ONLY_NOT_1363_ACCEPTANCE','comparator 417 rows')
 need(sorted(p.name for p in AUDIT.parent.iterdir())==['AUDIT.json'],'audit leaf inventory')
 audit_raw=safe_read(AUDIT,AUDIT_SHA,100000);a=json.loads(audit_raw)
 need(a['schema']=='1370-e0g-ebg-b-only-adoption-r2-independent-observed-audit-r6' and a['decision']=='ACCEPT_OBSERVED_DIAGNOSTIC_ONLY','audit decision')
 need(a['resultSha256']==RESULT_SHA and a['boundaryRows']==417 and a['equalPayloadBoundaries']==result['equalPayloadBoundaries'],'audit result linkage')
 need(a['sourceHead']==HEAD and a['sourceTree']==TREE and a['evidenceTip']==TIP and a['runId']=='20261008-bonly-adoption-r1','audit source roles')
 need(a['leftActiveEpisodes']==0 and a['rightActiveEpisodes']==sum(len(x['ebgB']['active']) for x in result['boundaryIndex']),'audit B episodes')
 need(a['firstObserved']==result['firstObserved'] and '1363' in a['claimLimit'],'audit firsts/claim')
 ps=subprocess.check_output(['ps','-axo','command='],text=True,timeout=10)
 survivors=[s for s in ps.splitlines() if ('lane-run.sh' in s or '20261008-bonly-adoption-r1' in s or 'observed-audit-proposal-r6/audit.py' in s) and 'postreadback-observed-proposal-r3/check.py' not in s]
 need(not survivors,'audit/comparator process survivor')
 # Recheck all authority bytes and environment immediately before the one-shot write.
 guard()
 for path,pin,cap in ((AUDIT,AUDIT_SHA,100000),(AUDIT_META,AUDIT_META_SHA,100000),(AUDIT_LOG,EMPTY_LOG_SHA,100000),(COMPARATOR_META,COMPARATOR_META_SHA,100000),(COMPARATOR_LOG,EMPTY_LOG_SHA,100000),(COMPARATOR/'RESULT.json',RESULT_SHA,32<<20),(COMPARATOR/'RECEIPT.json',COMPARATOR_RECEIPT_SHA,100000),(EXACT,EXACT_SHA,100000),(STATIC,STATIC_SHA,100000),(LAUNCH,LAUNCH_SHA,100000),(BINDING,BINDING_SHA,100000)):
  safe_read(path,pin,cap)
 guard()
 need(not os.path.lexists(OUT.parent) and not os.path.lexists(OUT),'one-shot output drift')
 out={'schema':'1370-e0g-ebg-b-only-adoption-postreadback-observed-check-r3','decision':'ACCEPT_POSTREADBACK_DIAGNOSTIC_BYTES_ONLY','auditSha256':AUDIT_SHA,'auditLaneLogSha256':sha(audit_log),'auditLaneMetaSha256':AUDIT_META_SHA,'comparatorLaneLogSha256':sha(comparator_log),'comparatorLaneMetaSha256':COMPARATOR_META_SHA,'comparatorResultSha256':RESULT_SHA,'boundaryRows':417,'equalPayloadBoundaries':a['equalPayloadBoundaries'],'rightActiveEpisodes':a['rightActiveEpisodes'],'sourceHead':HEAD,'sourceTree':TREE,'evidenceTip':TIP,'claimLimit':'Original full Save46 adoption B-bundle diagnostic only; no 1363 admission or native acceptance.'}
 OUT.parent.mkdir(mode=0o700)
 with OUT.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 print(json.dumps({'decision':out['decision'],'checkSha256':sha(OUT.read_bytes())}))
if __name__=='__main__':main()
