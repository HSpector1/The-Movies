from pathlib import Path
import os,stat,json,hashlib
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-c0-initial23-source-order-pricing-verification-proposal-20261009-r1';B=S/'1370-c0-initial23-source-order-pricing-verification-proposal-20261009-r2';D=S/'1370-c0-initial23-filled-pricing-independent-source-review-20261009-r2'
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
 b=read(p);return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def j(p):return json.loads(read(p))
pinsRole=role(B/'SOURCE-PINS.json');assert pinsRole['sha256']=='335dc84cb31e2b084f95f441737eec0529ea995925f10289615169618fe74924';pins=j(B/'SOURCE-PINS.json');roles=[pinsRole]
for v in [*pins['files'].values(),*pins['externalRoles'].values(),pins['r1SourcePins'],pins['heldSourceReview'],pins['actualWitnessReview']]:assert role(v['path'])==v;roles.append(v)
held=j(pins['heldSourceReview']['path']);assert held['status']=='ACCEPT_SOURCE_ONLY_HELD' and held['proposalPinsSha256']==pins['r1SourcePins']['sha256']=='a37a9dad245572c578f2b7b8b57087b3537d3649d50ba6697e9fe1c13c8dcd17'
prior=j(A/'SOURCE-PINS.json')
for v in prior['files'].values():assert role(v['path'])==v
same=['CONFIG-UNFILLED.json','PRICING-INPUTS.json','SOURCE-OPERATION-PROOF.json','authenticate-inputs.mjs','verify-initial-pricing.mjs','verify-pricing-core.mjs']
for name in same:assert read(A/name)==read(B/name)
c=j(B/'CONFIG.json');old=j(A/'CONFIG.json');fill=j(B/'FILL-RECEIPT.json')
for v in c['roles'].values():assert role(v['path'])==v
w=j(c['roles']['actualWitnessIndependentReceipt']['path']);assert w['decision']=='ACCEPT_OBSERVED_PURE_INITIAL23_FIRST_DRAWS' and w['numericOnly'] is True and w['rows']==23 and w['row0ControlAccepted'] is True and w['actualToolExit']==w['actualHelperExit']==0
for field,name in [('sourcePinsSha256','actualWitnessSourcePins'),('configSha256','actualWitnessConfig'),('resultSha256','actualWitnessResult'),('stdoutSha256','actualWitnessStdout')]:assert c['futureWitness'][field]==w[field]==c['roles'][name]['sha256']==fill['future4DigestFields'][field]
assert fill['actual5WitnessRoles']=={k:c['roles'][k] for k in ['actualWitnessSourcePins','actualWitnessConfig','actualWitnessResult','actualWitnessStdout','actualWitnessIndependentReceipt']}
# Normalize only declared fill/own-path/source-review changes; every prior field remains exact.
norm=json.loads(json.dumps(c));norm['futureWitness']=None;norm['status']=old['status']
newkeys={'actualWitnessSourcePins','actualWitnessConfig','actualWitnessResult','actualWitnessStdout','actualWitnessIndependentReceipt','acceptedHeldPricingSourceReview'}
assert set(c['roles'])-set(old['roles'])==newkeys
for k in newkeys:norm['roles'].pop(k)
for k,v in norm['roles'].items():v['path']=v['path'].replace(str(B),str(A))
assert norm==old and c['executionAuthorization'] is False
r=read(B/'record-pure-node.py').decode();assert r.count("CONFIG_SHA='53e53854cf619416fc111dcdd4ffdf60b58af2111c9658cdbf3aa599d3eb3105'")==1
r=r.replace("CONFIG_SHA='53e53854cf619416fc111dcdd4ffdf60b58af2111c9658cdbf3aa599d3eb3105'","CONFIG_SHA='0e78eda5ad73702635054003d49560f77545c16e2fe5abef297ad456a5498168'")
assert r.count('1370-c0-initial23-pricing-r2-')==1;r=r.replace('1370-c0-initial23-pricing-r2-','1370-c0-initial23-pricing-');assert r.encode()==read(A/'record-pure-node.py')
recipe=j(B/'RECIPE.json');assert recipe['argv']==[str(S/'1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh'),'0',str(S/'1370-c0-initial23-pricing-verification-lane-20261009-r2/pricing.lane.log'),'/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14','-I','-B',str(B/'record-pure-node.py'),'verification']
assert recipe['cwd']==str(B) and recipe['outputPath']==str(S/'1370-c0-initial23-pricing-r2-verification-output-20261009-r1') and recipe['executionAuthorization'] is False
assert not os.path.lexists(recipe['outputPath']) and not os.path.lexists(recipe['argv'][2])
f={'roles':roles,'packageFiles':len(pins['files']),'externalRoles':len(pins['externalRoles']),'configRoles':len(c['roles']),'actualFiveWitnessRoles':fill['actual5WitnessRoles'],'futureFourDigestFields':c['futureWitness'],'unchangedFiles':same,'configNormalizationExact':True,'recorderTwoLiteralNormalizationExact':True,'recipe':recipe,'outputAndLaneAbsentAtReview':True,'noNumericArithmeticRngNodeImportsTestOrGitExecution':True}
fd=os.open(D/'FACTS.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as t:json.dump(f,t,indent=2,sort_keys=True);t.write('\n')
print(json.dumps({k:v for k,v in f.items() if k not in ('roles','recipe','actualFiveWitnessRoles')}))
