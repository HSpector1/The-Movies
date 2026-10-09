from pathlib import Path
import os,json,hashlib,stat,math
S=Path('/Users/zacheryspector/studio-scratch');D=S/'1370-c0-initial23-first-draw-witness-independent-observed-review-20261009-r1';P=S/'1370-c0-initial22-first-draw-parent-recorded-20261009-r1';Q=S/'1370-c0-initial22-first-draw-witness-proposal-20261009-r1';O=S/'1370-c0-initial22-first-draw-witness-output-20261009-r1'
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
outcome=role(P/'WITNESS-TOOL-OUTCOME.json');assert outcome['sha256']=='4bb2b098a83c0392363be78a8fc60cead0ac33db6161159ac74f13f1f7dd8ab1';a=j(outcome['path']);roles=[outcome]
for v in [a['grant'],a['rawTool'],*a['retained']]:assert role(v['path'])==v;roles.append(v)
g=j(a['grant']['path']);assert g['sourceReview']['sha256']=='c441b19fc17d20eaf7b13a0477807e711f58a3a92f3717e7c645aa3d1974e66f' and g['controlsObservedReview']['sha256']=='abc274938a91d76bf717d94f295d88bc164bc954ef70887a7943a9ca58736646'
for v in g['sourceRoles']:assert role(v['path'])==v
controls=j(g['controlsObservedReview']['path']);assert controls['decision']=='ACCEPT_OBSERVED_PURE_INITIAL23_INPUT_AND_REFUSAL_CONTROLS' and controls['groups']==8 and controls['unknownDrawsMeasured']==0
pinsRole=role(Q/'SOURCE-PINS.json');assert pinsRole['sha256']=='6a7fc799008e8f065b68264d886b8fdf6efabbaec750a2fc0080a97bf6676f60';pins=j(Q/'SOURCE-PINS.json')
for v in [*pins['files'].values(),*pins['externalRoles'].values(),g['sourceReview'],g['controlsObservedReview']]:assert v in g['sourceRoles']
recipe=j(Q/'CONTROL-AND-WITNESS-RECIPE.json');assert g['argv']==['/bin/bash',*recipe['recordedHelperArgv']['witness']] and g['cwd']==recipe['cwd'] and g['environment']==recipe['environment']
assert g['mode']=='witness' and g['rootPidBecomesHelperPid']==17859 and g['status']=='GRANT_EXACT_PURE_WITNESS_ONLY'
raw=j(a['rawTool']['path']);assert raw['launch']['session_id']==21987 and raw['completion']['exit_code']==0 and json.loads(raw['completion']['output'])['grant']==a['grant']
r=j(O/'RESULT.json');assert r['status']=='PURE_INITIAL23_WITNESS_COMPLETE_UNADOPTED' and r['actualChildExit']==0 and r['groupClear'] is True and r['pgidConfirmed'] is True and r['timedOut'] is False
assert r['childPid']==r['ownedPgid']==18122 and r['configSha256']==controls['configSha256']=='ca1f6be9aaf236c26e3b81589b983c11fe93b9a6b321f6e224cccc4b3af7698e'
assert r['boundsSeconds']=={'active':75,'node':60,'whole':90} and r['elapsedSeconds']==a['elapsedRecorderSeconds']<60
stdout=read(O/'stdout.bin');stderr=read(O/'stderr.bin');assert len(stdout)==r['stdoutBytes']==9419 and hashlib.sha256(stdout).hexdigest()==r['stdoutSha256'] and len(stdout)<=32768 and stderr==b''
assert stdout.endswith(b'\n') and stdout.count(b'\n')==1
m=json.loads(stdout);inputs=j(Q/'INPUTS.json');assert len(m['rows'])==len(inputs['rows'])==23
assert set(m)=={'status','rngSourceSha256','rows','salaryAttribution','renewalAttribution'} and m['status']=='PURE_INITIAL23_FIRST_DRAWS_COMPLETE' and m['salaryAttribution'] is False and m['renewalAttribution'] is False and m['rngSourceSha256']=='2f21996018c6f5399e1a68a1bf765e505db4d17360a939aa00cae0740cc6c57a'
identities=[]
for actual,expected in zip(m['rows'],inputs['rows']):
 data=dict(actual);draw=data.pop('firstDraw');jit=data.pop('jitter');assert data==expected
 assert isinstance(draw,float) and math.isfinite(draw) and 0<=draw<1 and math.isfinite(jit) and jit==1+(draw*2-1)*0.08
 identities.append((actual['identity'][0],actual['identity'][1]))
assert len(set(identities))==23 and m['rows'][0]['firstDraw']==0.34857689985074103 and m['rows'][0]['jitter']==0.9757723039761186
metaText=read(a['retained'][-1]['path']).decode();assert 'waiting for pid 0;' in metaText and 'end, exit 0;' in metaText
for k in ['actualToolExit','actualHelperExit','actualRecorderExit','actualNodeExit']:assert a[k]==0
fresh=[]
for pg in [17859,18122]:
 try:os.killpg(pg,0)
 except ProcessLookupError:fresh.append(pg)
 else:raise RuntimeError('owned group present')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK') and not os.path.lexists(O/'OVERRIDE-STOP.json')
f={'retainedRoles':roles,'sourceReview':g['sourceReview'],'controlsReview':g['controlsObservedReview'],'sourcePins':pinsRole,'result':role(O/'RESULT.json'),'stdout':role(O/'stdout.bin'),'stderr':role(O/'stderr.bin'),'groupsFreshlyAbsent':fresh,'lockAbsent':True,'overrideAbsent':True,'actualToolSession':21987,'actualToolExit':0,'actualHelperExit':0,'actualRecorderExit':0,'actualNodeExit':0,'elapsedSeconds':r['elapsedSeconds'],'numericOnly':True,'rows':23,'exactInputOrderIdentityAndOccurrence':True,'row0ControlAccepted':True,'unknownInitialDrawsNowMeasured':22,'orderedRows':m['rows'],'nodeRngOrSalaryExecutionByReview':False}
fd=os.open(D/'FACTS.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as t:json.dump(f,t,indent=2,sort_keys=True);t.write('\n')
print(json.dumps({k:v for k,v in f.items() if k not in ('retainedRoles','orderedRows')}))
