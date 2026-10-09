from pathlib import Path
import os,json,hashlib,stat
S=Path('/Users/zacheryspector/studio-scratch');D=S/'1370-c0-initial23-first-draw-controls-independent-observed-review-20261009-r1';P=S/'1370-c0-initial22-first-draw-parent-recorded-20261009-r1';Q=S/'1370-c0-initial22-first-draw-witness-proposal-20261009-r1';O=S/'1370-c0-initial22-first-draw-controls-output-20261009-r1'
def meta(s):return(s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)
def read(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1 and s.st_size<2*1024*1024
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  assert meta(s)==meta(os.fstat(fd));b=b''
  while True:
   x=os.read(fd,65536)
   if not x:break
   assert len(b)+len(x)<2*1024*1024;b+=x
  assert meta(s)==meta(os.fstat(fd))==meta(p.lstat()) and len(b)==s.st_size;return b
 finally:os.close(fd)
def role(p):
 b=read(p);return{'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def j(p):return json.loads(read(p))
outcome=role(P/'CONTROLS-TOOL-OUTCOME.json');assert outcome['sha256']=='a59cb767e89dabe8788158c0c5629d4dba677fbdedfd56118051292e3a4f8058';a=j(outcome['path'])
roles=[outcome]
for v in [a['grant'],a['rawTool'],*a['retained']]:assert role(v['path'])==v;roles.append(v)
g=j(a['grant']['path']);assert g['sourceReview']['sha256']=='c441b19fc17d20eaf7b13a0477807e711f58a3a92f3717e7c645aa3d1974e66f';assert role(g['sourceReview']['path'])==g['sourceReview']
pins=j(Q/'SOURCE-PINS.json');expected=[*pins['files'].values(),*pins['externalRoles'].values()]
for v in expected:assert v in g['sourceRoles']
# Small retained source identities only; no engine imports, runtime inventory or Node execution.
for v in g['sourceRoles']:assert role(v['path'])==v
recipe=j(Q/'CONTROL-AND-WITNESS-RECIPE.json');assert g['argv']==['/bin/bash',*recipe['recordedHelperArgv']['controls']] and g['cwd']==recipe['cwd'] and g['environment']==recipe['environment']
assert g['mode']=='controls' and g['rootPidBecomesHelperPid']==14146 and g['controlsObservedReview'] is None
raw=j(a['rawTool']['path']);assert raw['launch']['session_id']==32559 and raw['completion']['exit_code']==0
assert json.loads(raw['completion']['output'])['grant']==a['grant']
r=j(O/'RESULT.json');assert r['status']=='PURE_INITIAL23_CONTROLS_COMPLETE_UNADOPTED' and r['actualChildExit']==0 and r['groupClear'] is True and r['pgidConfirmed'] is True and r['timedOut'] is False
assert r['childPid']==r['ownedPgid']==14652 and r['configSha256']=='ca1f6be9aaf236c26e3b81589b983c11fe93b9a6b321f6e224cccc4b3af7698e'
assert r['boundsSeconds']=={'active':75,'node':60,'whole':90} and r['elapsedSeconds']<60
stdout=read(O/'stdout.bin');stderr=read(O/'stderr.bin');assert len(stdout)==r['stdoutBytes']==389 and hashlib.sha256(stdout).hexdigest()==r['stdoutSha256'] and stderr==b''
lines=stdout.decode().splitlines();assert lines[:-1]==['PASS '+x for x in ['exact23-admission-and-known-row0','wrong-authenticated-source-refused','wrong-key-refused','wrong-seed-refused','duplicate-row-refused','missing-row-refused','nonfinite-draw-or-jitter-refused','report-cap-refused-before-admission']]
summary=json.loads(lines[-1]);assert summary=={'status':'PURE_INITIAL23_INPUT_AND_REFUSAL_CONTROLS_PASSED','groups':8,'unknownDrawsMeasured':0,'knownControlDraws':1,'game':False}
metaText=read(a['retained'][-1]['path']).decode();assert 'waiting for pid 0;' in metaText and 'end, exit 0;' in metaText
for k in ['actualToolExit','actualHelperExit','actualRecorderExit','actualNodeExit']:assert a[k]==0
fresh=[]
for pg in [14146,14652]:
 try:os.killpg(pg,0)
 except ProcessLookupError:fresh.append(pg)
 else:raise RuntimeError('owned group present')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK') and not os.path.lexists(O/'OVERRIDE-STOP.json')
f={'retainedRoles':roles,'sourceReview':g['sourceReview'],'sourcePinsSha256':'6a7fc799008e8f065b68264d886b8fdf6efabbaec750a2fc0080a97bf6676f60','result':role(O/'RESULT.json'),'stdout':role(O/'stdout.bin'),'stderr':role(O/'stderr.bin'),'groupsFreshlyAbsent':fresh,'lockAbsent':True,'overrideAbsent':True,'actualToolSession':32559,'actualToolExit':0,'actualHelperExit':0,'actualRecorderExit':0,'actualNodeExit':0,'controls':summary,'elapsedSeconds':r['elapsedSeconds'],'laneLogContainsExistingSyntaxWarning':True,'nodeExecutionByReview':False}
with open(D/'FACTS.json','x') as t:json.dump(f,t,indent=2,sort_keys=True);t.write('\n')
print(json.dumps({k:v for k,v in f.items() if k not in ('retainedRoles',)}))
