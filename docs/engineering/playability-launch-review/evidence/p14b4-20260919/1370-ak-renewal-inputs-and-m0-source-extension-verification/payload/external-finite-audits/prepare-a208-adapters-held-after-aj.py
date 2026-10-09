from pathlib import Path
import os,stat,json,hashlib,difflib,ast
S=Path('/Users/zacheryspector/studio-scratch')
Q=S/'1370-c0-a208-external-pipeline-sink-held-proposal-after-aj-20261009-r1'
O=S/'1370-c0-aging-era-employment-witness-r9-devnull-preparation-20261008-r1'
A=S/'1370-c0-aging-era-settlement208-observer-after-aj-proposal-20261009-r1'
READS={}
def sig(s):return (s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)
def read(p,expected=None):
 p=Path(p)
 for a in [*reversed(p.parents),p]:
  st=a.lstat();assert not stat.S_ISLNK(st.st_mode),str(a)
 before=p.lstat();assert stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=200000
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  assert sig(os.fstat(fd))==sig(before);b=b''
  while True:
   z=os.read(fd,min(8192,200001-len(b)))
   if not z:break
   b+=z;assert len(b)<=200000
  assert sig(os.fstat(fd))==sig(before)==sig(p.lstat())
 finally:os.close(fd)
 h=hashlib.sha256(b).hexdigest();assert expected is None or h==expected,(str(p),h)
 READS[str(p)]={'path':str(p),'bytes':len(b),'sha256':h};return b
oldsource=str(S/'1370-c0-aging-era-employment-witness-source-r9-devnull-proposal-20261008-r1')
oldpipe=read(O/'launch-pipeline-r9-proposed.sh','0ebc508d9a181b1071769399c62baa86fbe2d2c20678c8590c79e969b68d5bd4')
oldsink=read(O/'bounded-sink-r9-proposed.py','9bd9fa9f1bc00712d000bd73097de8db930bfcab87c47dbefee2017725aaa8ef')
manifestsha='3452218ceabf6bb63f690db2eff3f83edda56db71c5826982a92ae0c73085aaf'
supsha='45eda307943fb829a321624d7eca4ad5004a7d8e8bdef042a74c8344b61e153e'
read(A/'SOURCE-PINS.json',manifestsha);read(A/'supervise.py',supsha)
inputs=[
(S/'1370-c0-a208-minimal-exact-launch-input-map-after-aj-20261009-r1/RECEIPT.json','424f0e50197f54ddea35dcacbbdec3df009cfbe640d5bcdc50f35ce311be43d8'),
(S/'1370-c0-a208-minimal-exact-launch-input-map-after-aj-20261009-r1/NOTE.md','46e46033ef941265a8a0b24e2ae0870186c19465dc93cd9aa223dabb07ebd1f9'),
(S/'1370-c0-a208-controls-node22-operational-amendment-parent-adoption-after-aj-20261009-r1/ADOPTION.json','7da501eb54301aaf0a22c5dc29e4dff786ee4bd9bfff490153d951c54bd7b9eb'),
(S/'1370-c0-a208-finite-recorded-controls-node22-filled-independent-source-review-after-aj-20261009-r1/RECEIPT.json','8e6a73e06cb774e61d103439bd17536ee97302802cea21cb48a5a93d808776cf'),
(S/'1370-c0-a208-finite-recorded-controls-node22-filled-independent-source-review-after-aj-20261009-r1/FD-SCOPE-CLARIFICATION.json','be28c1c1249ba945f1f5d6803a0fff4fe5dfaa8d27ae2184923744af24c284f9'),
(S/'1370-c0-a208-node22-parent-control-wrapper-independent-source-review-after-aj-20261009-r1/RECEIPT.json','1f9685c804a428c9658c12de821db42e608077bb6abe3f96e26da238e307a3be'),
(S/'1370-ak-grant-a208-controls-node22.py','25ea8ec1b2bd8f9d2a4a643dd8c98c8dc630eaa815c6ba66a3ccc85a855a7e88')]
for p,h in inputs:read(p,h)
newpipename='launch-pipeline-a208-held.sh';newsinkname='bounded-sink-a208-held.py'
pairpipe=[(oldsource,str(A)),(str(O/'bounded-sink-r9-proposed.py'),str(Q/newsinkname))]
pairsink=[(oldsource,str(A)),('584e5cc9ba3c0bd4f7a82e7bf0ddae60f74b45e757e93c50ee4c1fb5a5453759',manifestsha),('0ee1071d6a78fc944fbbe0aba5fb2a823572b6684f5d13261831233610d93c32',supsha)]
def transform(b,pairs):
 t=b.decode()
 for x,y in pairs:assert t.count(x)==1;t=t.replace(x,y)
 inverse=t
 for x,y in reversed(pairs):assert inverse.count(y)==1;inverse=inverse.replace(y,x)
 assert inverse.encode()==b
 return t.encode()
newpipe=transform(oldpipe,pairpipe);newsink=transform(oldsink,pairsink)
assert ast.dump(ast.parse(newsink.decode()),include_attributes=False)==ast.dump(ast.parse(oldsink.decode().replace(oldsource,str(A)).replace(pairsink[1][0],manifestsha).replace(pairsink[2][0],supsha)),include_attributes=False)
assert not Q.exists();Q.mkdir(mode=0o700)
def write(n,b):
 if isinstance(b,dict):b=(json.dumps(b,sort_keys=True,indent=2)+'\n').encode()
 elif isinstance(b,str):b=b.encode()
 fd=os.open(Q/n,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 return {'path':str(Q/n),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
roles={}
roles[newpipename]=write(newpipename,newpipe);roles[newsinkname]=write(newsinkname,newsink)
for name,old,new in [('PIPELINE.diff',oldpipe,newpipe),('SINK.diff',oldsink,newsink)]:roles[name]=write(name,''.join(difflib.unified_diff(old.decode().splitlines(True),new.decode().splitlines(True),fromfile='immutable-R9-original',tofile='held-A208-adapter')))
proof={'status':'SOURCE_ONLY_HELD_UNRUN_EXACT_ADAPTER_SUBSTITUTIONS','sourceDirectory':str(A),'sourcePinsSha256':manifestsha,'supervisorSha256':supsha,'originalRoles':{str(O/n):READS[str(O/n)] for n in ['launch-pipeline-r9-proposed.sh','bounded-sink-r9-proposed.py']},'pipelineSubstitutions':pairpipe,'sinkSubstitutions':pairsink,'pipelineFullInverseBytesExact':True,'sinkFullInverseBytesExact':True,'sourceReads':READS,'preserved':{'sinkReadSeconds':760,'sinkForwardSeconds':10,'innerSeconds':720,'activeSeconds':742,'wholeRecorderSeconds':750,'maxFrameBytes':524288,'oneFrameValidation':True,'PIPESTATUSAssertions':True,'pipelinePythonFlagsAndPipe':True,'sinkAuthenticatedValidatorAndSourceReview':True},'actualControlsReceipt':None,'operationalRuntimeAuthority':None,'exactFilledBinding':None,'exactReview':None,'archiveAdoption':None,'adoptedPreflight':None,'actualWitnessGrant':None,'executionAuthorization':False,'sourceImported':False,'runtimeExecuted':False,'frozenObserverChanged':False}
roles['INVERSE-PROOF.json']=write('INVERSE-PROOF.json',proof)
recipe={'status':'HELD_RECIPE_SKETCH_NOT_EXECUTION_AUTHORITY','argvShape':['/bin/bash','<accepted-r8-helper>','0','<fresh-absent-A208-lane-log>','/bin/bash',str(Q/newpipename),'<future-reviewed-external-adopted-A208-binding>','<actual-adopted-binding-sha256>'],'cwd':'<future-exact-admitted-cwd>','requiredEnvironment':{'GIT_OPTIONAL_LOCKS':'0','PYTHONDONTWRITEBYTECODE':'1','PATH':'/Users/zacheryspector/.nvm/versions/node/v22.23.2/bin:/usr/bin:/bin:/usr/sbin:/sbin'},'adapterRoles':{n:roles[n] for n in [newpipename,newsinkname]},'actualControlsReceipt':None,'operationalRuntimeAuthority':None,'launchBinding':None,'actualGrant':None,'executionAuthorization':False}
roles['RECIPE-SKETCH-HELD.json']=write('RECIPE-SKETCH-HELD.json',recipe)
roles['NODE22-MAP-ADDENDUM.md']=write('NODE22-MAP-ADDENDUM.md','The historical map424f/NOTE46e remains immutable. Its planned Node20 controls paragraph is superseded prospectively by adopted Node22 amendment7da501, filled source acceptance8e6a and FD clarificationbe28, with current parent-wrapper source review1f968. The full roles are authenticated in INVERSE-PROOF. Actual controls remain pending: this package records no test pass, Node20/22 equivalence or runtime grant. The native-node20-tap label is historical protocol text. No additional whole-machine FD scan prerequisite is introduced. The accepted inherited control mechanisms and M0 postflight qualification remain required.\n')
roles['REPORT.md']=write('REPORT.md','READY SOURCE ONLY HELD UNRUN. Two external copies change exactly two pipeline literals and three sink literals. Their inverse bytes restore authenticated original R9 files exactly. The frozen A208 observer directory, SOURCE-PINS3452218c and supervisor45eda307 are read and authenticated, never changed or imported. No algorithm, cap, pipe, PIPESTATUS, source-review or full frame-validation rule changes. Original760/10 sink and720/742/750 observer clocks remain exact. Historical validator module name/comment strings remain unchanged as part of byte preservation. These files alone do not launch or authorize a candidate; exact binding/review/archive/adoption/preflight, actual controls and continuing runtime authority are unfilled future roles. The recipe is a command shape only and requires separate exact review and root grant. No engine, Node, tests, scanner, imports, full inventories or Git operations were executed.\n')
roles['AUTHOR-SCRIPT']= {'path':str(Path(__file__)),'bytes':Path(__file__).stat().st_size,'sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
pins=write('SOURCE-PINS.json',{'schema':'1370-a208-held-external-adapters-source-pins-v1','status':'SOURCE_ONLY_HELD_UNRUN','roles':roles,'executionAuthorization':False})
ready=write('READY.json',{'status':'READY_SOURCE_ONLY_HELD_UNRUN','sourcePins':pins,'pipeline':roles[newpipename],'sink':roles[newsinkname],'actualControlsObserved':False,'executionAuthorization':False})
fd=os.open(Q,os.O_RDONLY);os.fsync(fd);os.close(fd)
print(json.dumps({'sourcePins':pins,'ready':ready,'pipeline':roles[newpipename],'sink':roles[newsinkname],'proof':roles['INVERSE-PROOF.json']}))
