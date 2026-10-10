import datetime,hashlib,json,os,subprocess
from pathlib import Path
D=Path(__file__).parent;R=Path('/Users/zacheryspector/The-Movies-headless-program')
H='7087f116cf998fd86e33fb8e004df628e0686dbd';OLD='8cb704e2f18e6a635943893422c9cfdc206e106d';MAIN='c902a704eb948cc576083d0973c8c23e59937dc1';SRC='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554';BR='wip/headless-program-20260916-ts'
def git(*args):return subprocess.check_output(['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,timeout=120)
assert git('rev-parse','HEAD').decode().strip()==H and git('branch','--show-current').decode().strip()==BR
assert git('rev-parse','HEAD^').decode().strip()==OLD and git('rev-parse','HEAD:src').decode().strip()==SRC
assert git('rev-parse','refs/remotes/origin/'+BR).decode().strip()==H and git('rev-parse','refs/remotes/origin/main').decode().strip()==MAIN
advertised={ref:oid for oid,ref in (line.split('\t') for line in git('ls-remote','origin','refs/heads/'+BR,'refs/heads/main').decode().splitlines())};assert advertised=={'refs/heads/'+BR:H,'refs/heads/main':MAIN}
git('merge-base','--is-ancestor',OLD,H);assert git('status','--porcelain')==b''
prefix='docs/engineering/playability-launch-review/evidence/p14b4-20260919/'
files={}
for name,h in [('HANDOFF.md','b2784da6a3a1378a919734fe892fc00841861f47b79687446b41f6273ba8d292'),(prefix+'1370-AM-natural208-and-renewal-pricing-closure.md','c3b12f6c2552b5afc96b39eef2159a23b85548178052940628f089d5c5246c9e'),(prefix+'1370-am-natural208-and-renewal-pricing-closure/ARCHIVE-MANIFEST.json','f9c9926ce5b94f446c89284c48295e0631bd888a5b582521c947a4eb892dc6c6'),(prefix+'1370-am-natural208-and-renewal-pricing-closure/payload/1370-am-root-continuation-20261009-r1/LESSONS-r22.md','072881362b441459a7e7a4983bf85afdf9380d64b2767851bee68bc85071fda0')]:
 b=git('show',H+':'+name);assert b==(R/name).read_bytes() and hashlib.sha256(b).hexdigest()==h;files[name]={'bytes':len(b),'sha256':h}
assert not os.path.lexists('/Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK')
v={'schema':'1370-am-published-checkpoint-readback/v1','status':'PUBLISHED_REMOTE_AND_ANCESTRY_AND_SOURCE_AND_DOCUMENTS_VERIFIED','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':H,'parent':OLD,'branch':BR,'remoteAdvertised':advertised,'sourceTree':SRC,'trackedMain':MAIN,'workingTreeClean':True,'mainMerged':False,'heavyLaneLockAbsent':True,'files':files,'previousOperationalFreezeEnded':True,'futureOperationalAuthorityMustUseActualAM':True}
p=D/'PUSH-READBACK.json'
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n')
p.chmod(0o444);b=p.read_bytes();print(json.dumps({'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'head':H,'workingTreeClean':True}))
