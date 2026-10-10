import hashlib,json,os
from pathlib import Path
A=Path(__file__).parent;S=A.parent;B=S/'1370-an-m0-fullfunction-current-prelaunch-preparation-source-20261010-r5';Q=S/'1370-an-m0-fullfunction-current-prelaunch-preparation-source-20261010-r6';O=S/'1370-an-m0-fullfunction-current-prelaunch-preparation-source-20261010-r3'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
assert role(B/'SOURCE-PINS.json')['sha256']=='00c4f12d92255a0d8eda2949cb77bd59a6e5e8b5dda04892ccd0bbf6091ca9d5'
pins=json.loads((B/'SOURCE-PINS.json').read_bytes());Q.mkdir(mode=0o700);files={}
def put(n,b):
 p=Q/n
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
for n,r in pins['files'].items():
 assert role(Path(r['path']))==r
 if n!='EXACT-ARGV.json':files[n]=put(n,Path(r['path']).read_bytes())
v=json.loads((O/'EXACT-ARGV.json').read_bytes())
v['expectedPriorReadback']=role(S/'1370-an-m0-fullfunction-parent-recorded-20261010-r3/READBACK.json')
v['expectedPriorStopAdoptionPath']=str(A/'FULLFUNCTION-R3-STOP-OBSERVED-ADOPTION.json')
v['futureRootStopStatus']='ROOT_ADOPTED_FULLFUNCTION_BASELINE_TRACE_OVERFLOW_STOP_WITH_REAL_GENERATION_AND_FULL_SHARED_POSTFLIGHT'
v['schema']='1370-fullfunction-fourth-current-prelaunch-exact-argv/v1'
v['originalExecutedArgv'][4]=str(A/'M0-FULLFUNCTION-R4-CURRENT-PRELAUNCH-CONFIG.json')
v['launcherArgv'][3]=str(Q/'run_fullfunction_current_prelaunch_once.py')
v['readerArgv'][3]=str(Q/'read_fullfunction_current_prelaunch.py')
assert len(v['launcherArgv'])==12 and v['launcherArgv'][4].endswith('external-config-independent-observed-review-20261009-r3/RECEIPT.json') and v['launcherArgv'][8:]==[None]*4
assert len(v['readerArgv'])==10 and v['readerArgv'][4:]==[None]*6
assert len(v['originalExecutedArgv'])==6 and v['originalExecutedArgv'][3].endswith('original-current-root-prelaunch.py') and v['originalExecutedArgv'][5] is None
for name in ('launcherArgv','readerArgv'):assert v[name][3].startswith(str(Q)+'/') and v[name][3].endswith('.py')
files['EXACT-ARGV.json']=put('EXACT-ARGV.json',(json.dumps(v,sort_keys=True,indent=2)+'\n').encode())
finding={'status':'UNRUN_ROOT_PREPARATION_STOP','sourceManifest':role(B/'SOURCE-PINS.json'),'executionAuthorization':False,'finding':'The R5 documentation builder assigned new script paths at index4; script is index3 after executable,-I,-B. Runtime source was correct and unrun. R6 reconstructs argv from authenticated original, changes index3, preserves original review operand/index4 and null future reader operands, and validates complete argv lengths/suffix roles.'}
files['PREPARATION-CORRECTION.json']=put('PREPARATION-CORRECTION.json',(json.dumps(finding,sort_keys=True,indent=2)+'\n').encode())
print(json.dumps(put('SOURCE-PINS.json',(json.dumps({'schema':'1370-fullfunction-current-prelaunch-preparation-source-pins/v1','files':files,'executionAuthorization':False},sort_keys=True,indent=2)+'\n').encode())))
