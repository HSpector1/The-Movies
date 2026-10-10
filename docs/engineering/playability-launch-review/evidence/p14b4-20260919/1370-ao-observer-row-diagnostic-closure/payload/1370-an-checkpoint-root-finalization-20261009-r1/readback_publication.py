import datetime,hashlib,json,os,subprocess,sys
from pathlib import Path
D=Path(__file__).parent;R=Path('/Users/zacheryspector/The-Movies-headless-program')
assert len(sys.argv)==2
H=sys.argv[1];OLD='7087f116cf998fd86e33fb8e004df628e0686dbd';MAIN='c902a704eb948cc576083d0973c8c23e59937dc1';SRC='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554';BR='wip/headless-program-20260916-ts'
assert len(H)==40 and all(x in '0123456789abcdef' for x in H)
def git(*args):return subprocess.check_output(['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,timeout=120)
assert git('rev-parse','HEAD').decode().strip()==H and git('branch','--show-current').decode().strip()==BR
assert git('rev-parse','HEAD^').decode().strip()==OLD and git('rev-parse','HEAD:src').decode().strip()==SRC
assert git('rev-parse','refs/remotes/origin/'+BR).decode().strip()==H and git('rev-parse','refs/remotes/origin/main').decode().strip()==MAIN
advertised={ref:oid for oid,ref in (line.split('\t') for line in git('ls-remote','origin','refs/heads/'+BR,'refs/heads/main').decode().splitlines())};assert advertised=={'refs/heads/'+BR:H,'refs/heads/main':MAIN}
git('merge-base','--is-ancestor',OLD,H);assert git('status','--porcelain')==b''
prefix='docs/engineering/playability-launch-review/evidence/p14b4-20260919/'
files={}
for name,h in [('HANDOFF.md','4f3f6435ba8fecd3645512f2e4a225740d91ceb9733f6668ef5507953ad0b102'),(prefix+'1370-AN-m0-preservation-and-types-closure.md','9a042c95acac18c1860152f6a5eec8a386229726dc42e7971ebddb65fb3b9980'),(prefix+'1370-an-m0-preservation-and-types-closure/ARCHIVE-MANIFEST.json','2b2247acd980dda8109fdad09a6a83bc3219cd053433e80684301b8a44dd665a'),(prefix+'1370-an-m0-preservation-and-types-closure/payload/1370-an-root-continuation-20261009-r1/LESSONS-r18.md','0a691f790e2d9eb32e192ea9b101ee7357a379bb6433056be995484e3063c387')]:
 b=git('show',H+':'+name);assert b==(R/name).read_bytes() and hashlib.sha256(b).hexdigest()==h;files[name]={'bytes':len(b),'sha256':h}
assert not os.path.lexists('/Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK')
v={'schema':'1370-an-published-checkpoint-readback/v1','status':'PUBLISHED_REMOTE_AND_ANCESTRY_AND_SOURCE_AND_DOCUMENTS_VERIFIED','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':H,'parent':OLD,'branch':BR,'remoteAdvertised':advertised,'sourceTree':SRC,'trackedMain':MAIN,'workingTreeClean':True,'mainMerged':False,'heavyLaneLockAbsent':True,'files':files,'previousOperationalFreezeEnded':True,'futureOperationalAuthorityMustUseActualAN':True,'fullfunctionQualificationAccepted':False,'p17p18RuntimeImplemented':False}
p=D/'PUSH-READBACK.json'
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);b=p.read_bytes();print(json.dumps({'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'head':H,'workingTreeClean':True}))
