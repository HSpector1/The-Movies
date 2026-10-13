#!/usr/bin/env python3
# Parent-only supplemental guard. Unchanged production gate owns apply/source/index/test freeze.
import hashlib,json,os,pathlib,shlex,subprocess,sys,time
R=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
C=pathlib.Path('/Users/zacheryspector/studio-specialists/p15b')
A=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012')
P=A/'p15b-save48-nonleak-lawful-r2'
T=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-ar-integrator-tools-20261011/land-slice.sh')
OUT=A/'p15b-full-gate-r1-supplement'
SUB='landing-p15b-final-r1'
BASE=R/'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-astra-founding-save47-20261012/ui-continuation/core-failures.txt'
PATCH='28f12dbc2821377209629603cadee51240554a61f0b9352f7ce6c5f11bce6b4b'
MANIFEST='e60c93c95c7155eea2a3d8a7123197a7ab2158d47e85836b9c654dd121e1aae3'
REFS={A/'p15b-nonleak-lawful-r2-run/freeze.json':'d38ca6a75463d222c33df3c076c14f83dc57cac13f084c9fddb51ea9de250010',
 A/'p15b-t17-final-r1-run/freeze.json':'0cee62257308b313b92c345b1069e2adcfcd2b2498fbb206f4b1157997245c17'}
sha=lambda b:hashlib.sha256(b).hexdigest()
def regular(p):
 if p.resolve()!=p or p.is_symlink() or not p.is_file():raise ValueError('not ordinary regular file: '+str(p))
 return p.read_bytes()
def ident(p):
 if not p.exists() and not p.is_symlink():return ['missing']
 if p.is_symlink() or p.resolve()!=p:return ['symlink-or-ancestry']
 if not p.is_file():return ['not-regular']
 return ['file',sha(p.read_bytes()),p.stat().st_mode&0o777]
def footprint(p):
 if p.resolve()!=p or p.is_symlink():return ['symlink-or-ancestry']
 if p.is_dir():
  # Same relative leaf inventory convention as existing parent freezes; reject ALL symlinks.
  nodes=sorted(p.rglob('*'))
  if any(q.is_symlink() or q.resolve()!=q for q in nodes):return ['symlink-or-ancestry']
  return {str(q.relative_to(p)):ident(q) for q in nodes if q.is_file()}
 return ident(p)
def content_equal(actual,expected):
 if isinstance(expected,dict):return isinstance(actual,dict) and actual.keys()==expected.keys() and all(content_equal(actual[k],v) for k,v in expected.items())
 return isinstance(actual,list) and isinstance(expected,list) and actual[:2]==expected[:2] and actual[0]=='file'
def floor(kib):
 lines=subprocess.check_output(['df','-Pk',str(R)],text=True).splitlines()
 if int(lines[1].split()[3])<kib:raise ValueError('disk floor '+str(kib)+'KiB')
# Launcher MUST be exact parent-reviewed existing owned lane runner, supplied with immutable byte pin.
launcher=pathlib.Path(os.environ.get('P15B_LAUNCHER',''))
lpin=os.environ.get('P15B_LAUNCHER_SHA256','')
if not launcher.is_absolute() or len(lpin)!=64 or sha(regular(launcher))!=lpin:raise SystemExit('STOP: supply actual absolute owned launcher + exact SHA256')
lock=pathlib.Path('/Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK')
marker=regular(lock).decode().strip();pid=os.getpid();owned=False
while pid>1:
 parts=shlex.split(subprocess.check_output(['ps','-p',str(pid),'-o','args='],text=True).strip())
 for i,x in enumerate(parts):
  if x==str(launcher) and x.endswith('/lane-run-r8.sh') and len(parts)>i+2 and marker.startswith('lane-run '+parts[i+2]+' token='):owned=True
 pid=int(subprocess.check_output(['ps','-p',str(pid),'-o','ppid='],text=True).strip())
if not owned or lock.is_symlink() or lock.stat().st_nlink!=1:raise SystemExit('STOP: not child of existing owned lane')
if pathlib.Path(sys.executable).resolve()!=(R/'.venv/bin/python3').resolve():raise SystemExit('STOP: use production venv python')
env=dict(os.environ);env['PATH']='/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:'+str(R/'.venv/bin')+':'+env.get('PATH','');env['GIT_OPTIONAL_LOCKS']='0'
if subprocess.check_output(['node','--version'],env=env,text=True).strip()!='v20.20.2':raise SystemExit('STOP: Node20.20.2')
if OUT.exists() or OUT.is_symlink() or OUT.parent.resolve()!=OUT.parent:raise SystemExit('STOP: unsafe/existing supplemental output')
if (P/SUB).exists() or (P/SUB).is_symlink():raise SystemExit('STOP: gate output already exists')
OUT.mkdir()
def write(name,value):
 with (OUT/name).open('x') as f:json.dump(value,f,sort_keys=True,indent=2);f.write('\n')
expected={}
fixed={P/'PATCH.diff':PATCH,P/'MANIFEST.json':MANIFEST,BASE:'e9f82fd229099d2d4ece955996f4a997f5ec6f231f8f81caad42bf459cc17812',
 T:'e198be165bb8d08ff72e88d42df031f750fe28e039c200addefc7463af001819',launcher:lpin,**REFS,
 R/'tests/fixtures/p14/genuine-v45-recovery-witnesses-1368/MANIFEST.json':'11ad61be481a8bec170f40425cfcfe7fcb24596418d30b6c8bf27895e93c3ba5',
 R/'tests/fixtures/p13b/genuine-v26-period52-1368/MANIFEST.json':'8e40e51bb360ba6ff6c0d641a03e90aa8ed6f73f8c0b232a9a4b5861af358db4',
 R/'tests/fixtures/p14/genuine-v46-rival-writing-pre414-1368/MANIFEST.json':'d097bbf131c1dc495b881d73e96994953b2f6a0ef50f88bd3b043f263024f205',
 R/'tests/fixtures/p14/genuine-v45-trust-authoring-week195-1368/MANIFEST.json':'0b98763001eb96949d8e312df5dfe600f1adf599f5466dd59eec214e1f229991'}
try:
 for path,pin in REFS.items():
  raw=regular(path)
  if sha(raw)!=pin:raise ValueError('immutable freeze reference changed '+str(path))
  for old,value in json.loads(raw)['inputs'].items():
   q=pathlib.Path(old)
   if not q.is_relative_to(C):continue # Ignore A/private foreign inputs, as explicitly scoped.
   mapped=R/q.relative_to(C)
   if mapped in expected and expected[mapped]!=value:raise ValueError('conflicting immutable C input identity '+str(mapped))
   expected[mapped]=value
except Exception as e:
 write('precondition-failure.json',{'gateLaunched':False,'error':str(e)});raise SystemExit(98)
wrapper=pathlib.Path(__file__).resolve();fixed[wrapper]=sha(regular(wrapper))
bootstrap=A/'p15b-full-gate-r1.sh';fixed[bootstrap]='0736e9a7dd26334d562ed910197afe67a00091d88265f849db06b6d3cce308cf'
UNION=R/'generated/unity/tests/StudioBridgeUnionFixtures.Generated.cs'
def snapshot():
 data={'inputs':{},'CExpected':{str(p):v for p,v in expected.items()},'pinnedFiles':{},'unionCS':ident(UNION),'unionCS_CExpected':['file','be4b1dd1da2e7dc28906b9bad1ab0fa73e32d4dbe69eef344d9aeaf0a697bdb6',0o600]};errors=[]
 for path,value in expected.items():
  actual=footprint(path);data['inputs'][str(path)]=actual
  if not content_equal(actual,value):errors.append('required path/content differs from immutable C freeze '+str(path))
 for path,pin in fixed.items():
  actual=ident(path);data['pinnedFiles'][str(path)]=actual
  if actual[:2]!=['file',pin]:errors.append('pinned input changed '+str(path))
 if data['unionCS']!=['file','be4b1dd1da2e7dc28906b9bad1ab0fa73e32d4dbe69eef344d9aeaf0a697bdb6',0o644]:errors.append('actual production unionCS bytes/mode changed')
 data['modeProvenanceDifferences']=[]
 for path,value in expected.items():
  actual=data['inputs'][str(path)]
  pairs=[(str(path/q),actual.get(q,['missing']),v) for q,v in value.items()] if isinstance(value,dict) and isinstance(actual,dict) else [(str(path),actual,value)]
  for name,got,want in pairs:
   if content_equal(got,want) and got[2]!=want[2]:data['modeProvenanceDifferences'].append({'path':name,'CMode':want[2],'RMode':got[2]})
 return data,errors
launched=False;child=None;child_error=None;post=None;post_errors=[];started=time.time()
try:
 floor(3670016)
 before,pre_errors=snapshot();write('supplement-before.json',{'snapshot':before,'errors':pre_errors})
 if pre_errors:raise ValueError('; '.join(pre_errors))
 floor(3145728)
 cmd=['bash',str(T),str(P),PATCH,'2bcac39e1c88ba48f24df44e015d3b7b7f5a06af',str(BASE),SUB]
 with (OUT/'full-gate.console.log').open('x') as log:
  launched=True
  child=subprocess.run(cmd,cwd=R,env=env,stdout=log,stderr=subprocess.STDOUT).returncode
except Exception as e:child_error=str(e)
finally:
 # Always attempt supplemental post observation, including inherited child1 or original freeze98.
 try:
  post,post_errors=snapshot()
  if 'before' in locals() and post!=before:post_errors.append('supplemental before/post identity changed (includes actual R modes)')
  floor(3145728)
 except Exception as e:post_errors.append(str(e))
 write('supplement-after.json',{'snapshot':post,'errors':post_errors})
 supplemental_exit=98 if child_error or post_errors else 0
 final=supplemental_exit if supplemental_exit else (child if child is not None else 98)
 write('receipt.json',{'gateLaunched':launched,'originalGateExit':child,'supplementalExit':supplemental_exit,'finalExit':final,
  'preconditionOrChildLaunchError':child_error,'postErrors':post_errors,'seconds':time.time()-started,
  'scope':'existing production fullgate; no fullacceptance/mainmerge; original gate freeze untouched',
  'crossWorkspaceModes':'C modes preserved in CExpected; only relative paths+regular file hashes must match C; actual R modes strictly bound before/post',
  'gateOutput':str(P/SUB),'consoleLog':str(OUT/'full-gate.console.log')})
print(json.dumps({'originalGateExit':child,'supplementalExit':supplemental_exit,'finalExit':final}))
raise SystemExit(final)
