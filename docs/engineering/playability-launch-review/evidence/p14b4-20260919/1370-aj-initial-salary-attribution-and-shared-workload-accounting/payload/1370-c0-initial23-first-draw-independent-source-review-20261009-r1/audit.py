from pathlib import Path
import os,stat,json,hashlib,re
S=Path('/Users/zacheryspector/studio-scratch');Q=S/'1370-c0-initial22-first-draw-witness-proposal-20261009-r1';D=S/'1370-c0-initial23-first-draw-independent-source-review-20261009-r1'
def h(b):return hashlib.sha256(b).hexdigest()
def meta(s):return(s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)
def read(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1 and s.st_size<16*1024*1024
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  assert meta(s)==meta(os.fstat(fd));b=b''
  while True:
   x=os.read(fd,65536)
   if not x:break
   assert len(b)+len(x)<=16*1024*1024;b+=x
  assert meta(s)==meta(os.fstat(fd))==meta(p.lstat()) and len(b)==s.st_size
  return b
 finally:os.close(fd)
def role(p):
 b=read(p);return {'path':str(p),'bytes':len(b),'sha256':h(b)}
raw=read(Q/'SOURCE-PINS.json');assert h(raw)=='6a7fc799008e8f065b68264d886b8fdf6efabbaec750a2fc0080a97bf6676f60';pins=json.loads(raw)
roles=[role(Q/'SOURCE-PINS.json')]
for expected in [*pins['files'].values(),*pins['externalRoles'].values()]:
 assert role(expected['path'])==expected;roles.append(expected)
c=json.loads(read(Q/'CONFIG.json'));assert c['executionAuthorization'] is False
for v in c['roles'].values():assert role(v['path'])==v
p=json.loads(read(Q/'RNG-TYPE-ERASURE.json'));text=read(Q/'rng.original.ts').decode()
for step in p['steps']:
 assert text.count(step['before'])==step['occurrences'];text=text.replace(step['before'],step['after'])
assert text.encode()==read(Q/'rng.type-erased.mjs')
r=json.loads(read(Q/'RECORDER-REUSE.json'));assert role(r['original']['path'])==r['original'];text=read(r['original']['path']).decode()
for step in r['changes']:
 assert text.count(step['before'])==step['occurrences'];text=text.replace(step['before'],step['after'])
assert text.encode()==read(Q/'record-pure-node.py')
inputs=json.loads(read(Q/'INPUTS.json'));a=json.loads(read(Q/'SOURCE-INPUT-ROLES.json'));assert len(inputs['rows'])==23
core=read(Q/'first-draw-core.mjs').decode();expected=json.loads(re.search(r'^const EXPECTED = (.*);$',core,re.M).group(1));assert inputs==expected
for actual,original in zip(inputs['rows'][1:],a['initialRows']):
 expected={'ordinal':original['HSourceOrder'],'identity':original['identity'],'talentId':original['talentId'],'seed':original['seed']['value'],'purpose':original['hiringPurpose'],'key':original['hiringKey'],'streamSeed':original['streamSeed'],'role':'remaining-initial-first-draw'}
 assert original['HSourceOrder']==original['ASourceOrder'] and actual==expected
assert inputs['rows'][0]=={'ordinal':0,'identity':['studio-aca408ec-r01:contract:person-studio-aca408ec-r01-0:0',0],'talentId':'person-studio-aca408ec-r01-0','seed':'p13a-core-causal-01','purpose':'hiring','key':'offer-person-studio-aca408ec-r01-0','streamSeed':'p13a-core-causal-01::hiring::offer-person-studio-aca408ec-r01-0','role':'known-row0-transported-F1-control'}
wrapper=S/'1370-c0-initial22-first-draw-parent-recorded-20261009-r1/grant_and_launch.py';w=role(wrapper);assert w['sha256']=='faf8c8f68d1a8eadfefc10826ed5a88da18e00fbca0a3f9d4488ce0a90eecde0'
facts={'sourcePinsRole':roles[0],'packageFiles':len(pins['files']),'externalRoles':len(pins['externalRoles']),'configRoles':len(c['roles']),'roles':roles,'rngExactCountedErasureSteps':len(p['steps']),'recorderExactCountedSubstitutions':len(r['changes']),'inputRows':23,'projectedUnknownRows':22,'exactCoreExpectedEqualsInputs':True,'ordinals':[x['ordinal'] for x in inputs['rows']],'wrapper':w,'sourceOnlyAudit':True,'rngNodeCompilerGameOrTestExecution':False}
fd=os.open(D/'FACTS.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as f:json.dump(facts,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps({k:v for k,v in facts.items() if k!='roles'}))
