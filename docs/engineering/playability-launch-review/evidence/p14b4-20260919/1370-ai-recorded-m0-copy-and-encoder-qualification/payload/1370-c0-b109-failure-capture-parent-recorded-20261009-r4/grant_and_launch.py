from pathlib import Path
import hashlib,json,os,shutil,stat,subprocess,sys
from datetime import datetime,timezone
repo=Path('/Users/zacheryspector/The-Movies-headless-program')
s=Path('/Users/zacheryspector/studio-scratch')
parent=Path(__file__).resolve().parent
source=s/'1370-c0-b109-recorder-failure-capture-proposal-20261009-r4'
review=s/'1370-c0-b109-recorder-failure-capture-independent-source-review-20261009-r4/RECEIPT.json'
role=sys.argv[1];assert role in ('red','green','original14')
roles=[]
def auth(path,expected,size=None):
    path=Path(path);st=path.lstat();assert stat.S_ISREG(st.st_mode) and st.st_nlink==1 and path.resolve()==path,path
    raw=path.read_bytes();assert hashlib.sha256(raw).hexdigest()==expected and (size is None or len(raw)==size),path
    roles.append({'path':str(path),'sha256':expected,'bytes':len(raw)})
    return raw
auth(source/'SOURCE-PINS.json','b616d3ccdd1af247ed2116388ce258aed63de543df5127395135cb455cc501ae')
for name,row in json.loads((source/'SOURCE-PINS.json').read_text()).items():auth(source/name,row['sha256'],row['bytes'])
rv=json.loads(auth(review,'16bdbc9a6c65cd0b5116975dc999fa135c8fbba40652396dc4f4536b59e494c6'))
assert rv['decision']=='ACCEPT_SOURCE_ONLY_UNRUN'
config=json.loads((source/'CONFIG.json').read_text())
for row in config['roles'].values():auth(row['path'],row['sha256'],row['bytes'])
auth(config['nodePath'],config['nodeSha256'])
auth('/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14','7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835')
recipe=next(row for row in json.loads((source/'CONTROL-RECIPE.json').read_text())['recipes'] if row['role']==role)
auth(recipe['argv'][1],'aff8e9749cd3e33de874931dbf258fc13ceb79d2f7ea44fcc56816db85af3f2e')
auth(s/'1370-c0-b109-sanitized-native-encoder-proposal-20261009-r2/record-pure-node.py','76a6076ad2f77b8645124675ae37ee231ad6f89efa5c6f659de1db2614372d45')
git=['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks']
def git_read(*args):return subprocess.check_output(git+list(args),cwd=repo).decode().strip()
head=git_read('rev-parse','HEAD');assert head=='02d50716fe787eaed425b40f822ce91f4463deba'
assert git_read('rev-parse','HEAD:src')=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
assert git_read('status','--porcelain')==''
assert not os.path.lexists(s/'HEAVY-LANE-LOCK')
raw=subprocess.check_output(['/bin/ps','-axo','pid=,comm=,args='])
for line in raw.decode().splitlines():
    fields=line.strip().split(None,2)
    if len(fields)==3 and Path(fields[1]).name=='node':
        assert not any(mark in fields[2] for mark in ['b109-failure-main-','1370-c0-b109-sanitized-native-encoder-proposal-20261009-r2/test-encoder.mjs']), 'relevant Node worker active'
free=shutil.disk_usage(repo).free;assert free>=3.5*1024**3
assert 'AC Power' in subprocess.check_output(['/usr/bin/pmset','-g','batt']).decode()
lane=Path(recipe['parentCreatesPrivateFreshLaneDirectory']);assert not os.path.lexists(lane)
if role!='red':
    previous='red' if role=='green' else 'green'
    outcome=json.loads((parent/(previous.upper()+'-TOOL-OUTCOME.json')).read_text())
    assert outcome['actualToolExit']==(1 if previous=='red' else 0)
    assert outcome['caseCount']==9 and outcome['allOwnedGroupsFreshlyAbsent']
grant={'status':'PARENT_ADOPTED_SOURCE_AND_GRANTED_EXACT_'+role.upper(),'utc':datetime.now(timezone.utc).isoformat(),'role':role,'head':head,'sourceTree':git_read('rev-parse','HEAD:src'),'sourcePinsSha256':'b616d3ccdd1af247ed2116388ce258aed63de543df5127395135cb455cc501ae','reviewPath':str(review),'reviewSha256':'16bdbc9a6c65cd0b5116975dc999fa135c8fbba40652396dc4f4536b59e494c6','roles':roles,'recipe':recipe,'freeBytes':free,'acPower':True,'heavyLockAbsent':True,'targetedNodeWorkersAbsent':True,'wholeHistoricalOrProductionGuardReuseClaim':False,'gameBenchmarkOrNative22DiagnosticAuthorized':False,'tinyNineCaseAggregateBound':285,'perRecorderBoundsUnchanged':[60,75,90],'original14Scope':'Unchanged original controls retain existing per-case clocks; no invented suite-wide bound.'}
destination=parent/(role.upper()+'-GRANT.json')
with destination.open('x') as f:json.dump(grant,f,indent=2,sort_keys=True);f.write('\n')
lane.mkdir(mode=0o700)
print(json.dumps({'grant':str(destination),'sha256':hashlib.sha256(destination.read_bytes()).hexdigest(),'role':role,'expectedActualExit':recipe['expectedActualExit']}),flush=True)
os.chdir(repo)
os.execvpe(recipe['argv'][0],recipe['argv'],dict(os.environ,PYTHONDONTWRITEBYTECODE='1',GIT_OPTIONAL_LOCKS='0'))
