from pathlib import Path
import os,stat,json,hashlib
S=Path('/Users/zacheryspector/studio-scratch');D=S/'1370-c0-initial23-pricing-independent-observed-review-20261009-r2';P=S/'1370-c0-initial23-pricing-verification-parent-recorded-20261009-r1';Q=S/'1370-c0-initial23-source-order-pricing-verification-proposal-20261009-r2';O=S/'1370-c0-initial23-pricing-r2-verification-output-20261009-r1'
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
parentRole=role(P/'TOOL-OUTCOME.json');assert parentRole['sha256']=='ab2167dfd48a0bc496728338194ef0efc31b994dd6076af1a590784e4e2f2f42';a=j(parentRole['path']);roles=[parentRole]
for v in [a['grant'],a['rawTool'],*a['retained']]:assert role(v['path'])==v;roles.append(v)
g=j(a['grant']['path']);assert g['sourceReview']['sha256']=='18179789fab0beaca6d58ddcdddfebc06501b1f9d57a0f1352a1c5bec8a6dda2';c=j(Q/'CONFIG.json')
small=0;node=[]
for v in g['sourceRoles']:
 if v['path']==c['nodePath']:
  assert v=={'path':c['nodePath'],'bytes':c['nodeBytes'],'sha256':c['nodeSha256']};node.append(v)
 else:assert role(v['path'])==v;small+=1
assert len(node)==1
pinsRole=role(Q/'SOURCE-PINS.json');assert pinsRole['sha256']=='335dc84cb31e2b084f95f441737eec0529ea995925f10289615169618fe74924';pins=j(Q/'SOURCE-PINS.json')
for v in [*pins['files'].values(),*pins['externalRoles'].values(),g['sourceReview']]:assert v in g['sourceRoles']
assert j(g['sourceReview']['path'])['decision']=='ACCEPT_SOURCE_ONLY_FILLED_INITIAL23_PRICING_VERIFICATION'
recipe=j(Q/'RECIPE.json');assert g['argv']==['/bin/bash',*recipe['argv']] and g['cwd']==recipe['cwd'] and g['environment']==recipe['environment'] and g['rootPidBecomesHelperPid']==28579
raw=j(a['rawTool']['path']);assert raw['launch']['session_id']==55173 and raw['completion']['exit_code']==0 and json.loads(raw['completion']['output'])['grant']==a['grant']
r=j(O/'RESULT.json');assert r['status']=='PURE_INITIAL23_PRICING_VERIFICATION_COMPLETE_UNADOPTED' and r['actualChildExit']==0 and r['groupClear'] is True and r['pgidConfirmed'] is True and r['timedOut'] is False
assert r['mode']=='verification' and r['ownedPgid']==r['childPid']==28843 and r['configSha256']=='53e53854cf619416fc111dcdd4ffdf60b58af2111c9658cdbf3aa599d3eb3105'
assert r['boundsSeconds']=={'active':75,'node':60,'whole':90} and r['elapsedSeconds']==a['elapsedRecorderSeconds']<60
stdout=read(O/'stdout.bin');stderr=read(O/'stderr.bin');assert len(stdout)==r['stdoutBytes']==25308 and len(stdout)<=65536 and hashlib.sha256(stdout).hexdigest()==r['stdoutSha256'] and stderr==b''
lines=stdout.decode().splitlines();assert len(lines)==26
report=json.loads(lines[-1]);assert report['status']=='PURE_INITIAL23_PRICING_PAIRS_AGREE' and report['selectedRows']==23 and report['immutablePairs']==44 and report['mismatches']==0 and report['originalOfferLocalCapture'] is False and report['renewalAttribution'] is False and report['game'] is False and len(report['ledger'])==23
pricing=j(Q/'PRICING-INPUTS.json');w=j(c['roles']['actualWitnessStdout']['path']);receipt=j(c['roles']['actualWitnessIndependentReceipt']['path']);assert receipt['decision']=='ACCEPT_OBSERVED_PURE_INITIAL23_FIRST_DRAWS' and receipt['rows']==23 and receipt['numericOnly'] is True
assert pricing['drawRequest']==j(Path(c['roles']['actualWitnessConfig']['path']).parent/'INPUTS.json')
def pairs(rows):
 assert len(rows)==44;seen={};out={}
 for order,row in enumerate(rows):
  occurrence=seen.get(row['contractId'],0);seen[row['contractId']]=occurrence+1;key=(row['contractId'],occurrence);assert key not in out;out[key]=(order,row)
 return out
def strip(row):
 a=dict(row);a['terms']={k:v for k,v in row['terms'].items() if k not in ('annualSalary','signingBonus')};return a
H=pairs(j(c['roles']['HPreimage']['path']));A=pairs(j(c['roles']['APreimage']['path']));assert set(H)==set(A)
for key in H:assert H[key][0]==A[key][0] and strip(H[key][1])==strip(A[key][1])
selected=[]
for i,(item,inp,draw) in enumerate(zip(report['ledger'],pricing['rows'],w['rows'])):
 key=tuple(inp['identity']);selected.append(key);assert item['identity']==inp['identity']==draw['identity'] and item['sourceOrder']==inp['HSourceOrder']==inp['ASourceOrder']==H[key][0]==A[key][0]
 assert item['talentId']==inp['talentId']==draw['talentId'] and item['role']==inp['creativeRole']
 assert item['generationSalaryCurve']==inp['generationSalaryCurve']['value'] and item['HInitialAge']==inp['HAuthoredInitialAge']['value'] and item['AInitialAge']==inp['ADerivedInitialAge']['value']
 assert item['firstDraw']==draw['firstDraw'] and item['jitter']==draw['jitter']
 for arm,index in [('H',H),('A',A)]:
  actual=index[key][1];assert item[arm+'Actual']==actual['terms']
  pred=item[arm+'Predicted'];assert set(pred)=={'annualSalary','signingBonus','termWeeks','startWeek','endWeekExclusive'}
  assert pred=={k:actual['terms'][k] for k in pred}
  patched=dict(actual);patched['terms']=dict(actual['terms'],**pred);assert patched==actual
 assert item['completeH'] is True and item['completeA'] is True and item['differences']==[] and item['conclusion']=='PAIR_AGREES_VIA_ACCEPTED_SOURCE_TRANSPORT'
 expected=' | '.join(str(x) for x in [item['sourceOrder'],item['talentId'],str(item['HActual']['annualSalary'])+'/'+str(item['HPredicted']['annualSalary']),str(item['HActual']['signingBonus'])+'/'+str(item['HPredicted']['signingBonus']),str(item['AActual']['annualSalary'])+'/'+str(item['APredicted']['annualSalary']),str(item['AActual']['signingBonus'])+'/'+str(item['APredicted']['signingBonus']),item['conclusion']]);assert lines[i+2]==expected
assert len(set(selected))==23 and report['ledger'][0]['firstDraw']==0.34857689985074103 and report['ledger'][0]['jitter']==0.9757723039761186
paychanged=lambda key:any(H[key][1]['terms'][f]!=A[key][1]['terms'][f] for f in ('annualSalary','signingBonus'))
assert all(paychanged(k) for k in selected)
remaining=[key for key in H if key not in set(selected) and paychanged(key)];assert len(remaining)==16
assert all(H[k][1]['terms']['startWeek']==A[k][1]['terms']['startWeek']==208 for k in remaining)
assert 'waiting for pid 0;' in read(a['retained'][-1]['path']).decode() and 'end, exit 0;' in read(a['retained'][-1]['path']).decode()
for k in ['actualToolExit','actualHelperExit','actualRecorderExit','actualNodeExit']:assert a[k]==0
fresh=[]
for pg in [28579,28843]:
 try:os.killpg(pg,0)
 except ProcessLookupError:fresh.append(pg)
 else:raise RuntimeError('owned group present')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK') and not os.path.lexists(O/'OVERRIDE-STOP.json')
f={'retainedRoles':roles,'sourcePins':pinsRole,'sourceReview':g['sourceReview'],'witnessReview':c['roles']['actualWitnessIndependentReceipt'],'result':role(O/'RESULT.json'),'stdout':role(O/'stdout.bin'),'stderr':role(O/'stderr.bin'),'smallGrantRolesFreshlyAuthenticated':small,'nodeRoleAuthenticatedByActualPinnedLaunchAndChild':node[0],'nodeFileRehashedByReview':False,'actualToolSession':55173,'actualToolExit':0,'actualHelperExit':0,'actualRecorderExit':0,'actualNodeExit':0,'elapsedSeconds':r['elapsedSeconds'],'selectedPairsAgree':23,'newInitialPairsAgree':22,'fullImmutablePairsAgree':44,'mismatches':0,'orderedLedger':report['ledger'],'remainingChangedRenewalIdentities':[list(k) for k in remaining],'groupsFreshlyAbsent':fresh,'lockAbsent':True,'overrideAbsent':True,'reviewNumericSalaryRngNodeTestOrGitExecution':False}
fd=os.open(D/'FACTS.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as t:json.dump(f,t,indent=2,sort_keys=True);t.write('\n')
print(json.dumps({k:v for k,v in f.items() if k not in ('retainedRoles','orderedLedger','remainingChangedRenewalIdentities')}))
