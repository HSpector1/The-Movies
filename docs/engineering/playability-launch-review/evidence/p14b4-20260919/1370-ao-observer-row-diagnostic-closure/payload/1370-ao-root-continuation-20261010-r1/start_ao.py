import datetime,hashlib,json,os,stat,subprocess
from pathlib import Path
A=Path(__file__).parent;S=A.parent;R=Path('/Users/zacheryspector/The-Movies-headless-program')
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def git(*args):return subprocess.check_output(['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R)
H='0cf8b1d0bbf7d1977413d0c3074407cc8f7b80a4';assert git('rev-parse','HEAD').decode().strip()==H and git('status','--porcelain')==b''
assert git('rev-parse','HEAD:src').decode().strip()=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
pub=role(S/'1370-an-checkpoint-root-finalization-20261009-r1/PUSH-READBACK.json');assert pub['sha256']=='0b4d8556b0aaed92da3c6ce3b77886dec89718406f643cb5768b4b1040d9c921'
v=json.loads(Path(pub['path']).read_bytes());assert v['head']==H and v['workingTreeClean'] is True and v['previousOperationalFreezeEnded'] is True
api=role(S/'1370-ao-observer-row-diagnostic-api-20261010-r1/API.md');design=role(S/'1370-an-root-continuation-20261009-r1/OBSERVER-ROW-DIAGNOSTIC-DESIGN-ADOPTION.json');assert design['sha256']=='8b45e59bfbcf67e115f28065c475fc64ba353a96ee4c07e616472bf58b1eda90'
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
out={'schema':'1370-ao-root-starting-authority/v1','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':H,'publicationReadback':pub,'sourceTree':v['sourceTree'],'main':v['trackedMain'],'rootApiPlan':api,'adoptedDiagnosticDesign':design,'productionClean':True,'laneAbsent':True,'sourcePreparationOnly':True,'executionAuthorization':False,'freshOperationalProtection':None,'priorAMPrelaunchReusableAsCurrent':False,'carryForwardWholeDirectory':str(S/'1370-an-checkpoint-root-finalization-20261009-r1'),'scope':'Fresh public diagnostic implementation and independent controls after publishedAN. FrozenAN packages immutable. Fresh current operational protection required before private fullfunction route.'}
p=A/'STARTING-AUTHORITY.json'
with p.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
