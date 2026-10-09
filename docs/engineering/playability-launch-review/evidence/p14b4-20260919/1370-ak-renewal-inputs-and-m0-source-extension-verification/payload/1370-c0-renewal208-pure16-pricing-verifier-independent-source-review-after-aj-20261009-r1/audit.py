from pathlib import Path
import json,hashlib,os,stat,re,datetime
HERE=Path(__file__).parent
P=Path('/Users/zacheryspector/studio-scratch/1370-c0-renewal208-pure16-pricing-verifier-proposal-after-aj-20261009-r1')
roles={};raws={}
def read(p,expected=None):
 p=Path(p)
 if str(p) in raws:return raws[str(p)]
 assert p.resolve(strict=True)==p
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  st=os.fstat(fd);assert stat.S_ISREG(st.st_mode) and st.st_nlink==1 and st.st_size<=4194304
  data=b''
  while True:
   b=os.read(fd,65536)
   if not b:break
   assert len(data)+len(b)<=4194304;data+=b
  key=lambda s:(s.st_dev,s.st_ino,s.st_mode,s.st_size,s.st_mtime_ns,s.st_ctime_ns,s.st_nlink)
  assert key(st)==key(os.fstat(fd))==key(p.lstat()) and len(data)==st.st_size
 finally:os.close(fd)
 role={'path':str(p),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
 if expected:assert role==expected
 roles[str(p)]=role;raws[str(p)]=data;return data
pins=json.loads(read(P/'SOURCE-PINS.json'));assert roles[str(P/'SOURCE-PINS.json')]['sha256']=='27634566f669e1bf9d93e7b797181ce21a6e7a8f7165ab526a6bb0c98bc0b4c7'
for block in ('files','externalRoles'):
 for r in pins[block].values():read(r['path'],r)
config=json.loads(read(P/'CONFIG.json'));assert config['futureA208'] is None and config['executionAuthorization'] is False
for r in config['roles'].values():read(r['path'],r)
inputs=json.loads(read(P/'PRICING-INPUTS.json'))['rows'];gap=json.loads(raws[config['roles']['gapFacts']['path']])['remainingRenewalRows'];selected=json.loads(raws[config['roles']['premiumSelected']['path']]);numeric=json.loads(raws[config['roles']['existingNumericStdout']['path']])['rows']+json.loads(raws[config['roles']['newNumericStdout']['path']])['rows']
bytalent={x['talentId']:x for x in numeric};assert len(inputs)==len(gap)==len(selected)==16
context=raws[config['roles']['H_context']['path']].splitlines();tiers=[]
for i,(x,g,s) in enumerate(zip(inputs,gap,selected)):
 assert x['identity']==g['identity']==s['identity'] and x['HSourceOrder']==x['ASourceOrder']==g['HSourceOrder']==g['ASourceOrder']==s['HSourceOrder']==s['ASourceOrder']==24+i
 assert x['talentId']==g['talentId']==s['talentId'] and x['creativeRole']==g['creativeRole']
 person=g['H208Person'];d={'writer':'writing','actor':'acting','director':'directing','craft':'craft'}[person['role']]
 expected={k:person[k] for k in ('id','role','age','fame')};expected['skills']={d:{k:{'perceived':v['perceived']} for k,v in x['HPerson']['skills'][d].items()}}
 for k,v in expected['skills'][d].items():assert v['perceived']==person['skills'][d][k]['perceived']
 assert x['HPerson']==expected
 line=context[g['HContextLine']-1];assert hashlib.sha256(line).hexdigest()==x['HContextRawLineSha256']==g['HContextRawLineSha256']
 ctx=json.loads(line);assert ctx['week']==208 and ctx['person']==person and ctx['receipt']==g['H208WinnerReceipt']
 n=bytalent[x['talentId']]
 for k in ('firstDraw','jitter','seed','purpose','key'):assert x[k]==n[k]
 assert x['drawOriginIdentity']==n['identity'] and x['releaseFloor'] is None
 assert s['commonSourceDerivedPremiumExpression']==f"tiers[{x['premiumTierIndex']}]";tiers.append(x['premiumTierIndex'])
 assert x['AOriginalContract']==g['AOriginalContract']==s['AOriginalContract'] and x['winningStudioId']==s['winningStudioId'] and x['subjectStudioId']==s['subjectStudioId'] and x['reserveWeeks']==s['HObservedWinningReserveWeeks']
assert tiers.count(2)==6 and tiers.count(1)==10
H=json.loads(raws[config['roles']['HPreimage']['path']]);A=json.loads(raws[config['roles']['APreimage']['path']]);assert len(H)==len(A)==44
for h,a in zip(H,A):
 def strip(x):return dict(x,terms={k:v for k,v in x['terms'].items() if k not in ('annualSalary','signingBonus')})
 assert strip(h)==strip(a)
for i,x in enumerate(inputs):assert H[24+i]['contractId']==A[24+i]['contractId']==x['identity'][0]
source_map=json.loads(read(P/'SOURCE-MAP.json'));erasure=json.loads(read(P/'PRIMITIVE-ERASURE.json'))['typeOnlyReplacements'];core=read(P/'verify-pricing-core.mjs').decode();functions=[]
for x in source_map:
 raw=read(x['sourceRole']['path']);slice='\n'.join(raw.decode().splitlines()[x['startLine']-1:x['endLine']])+'\n';assert hashlib.sha256((slice.rstrip('\n') if x.get('function') else slice).encode()).hexdigest()==x['sliceSha256'],(x.get('function'),x['startLine'])
 if x.get('gitBlobOidDerived'):assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()==x['gitBlobOidDerived']
 name=x.get('function')
 if name in ('skillVector','applyGates','ovrCore','roleOVR','salaryCurve','ageFactor','clamp'):
  transformed=slice.replace(': number[]','').replace('keys[i]!','keys[i]')
  for a,b in erasure.items():transformed=transformed.replace(a,b)
  if name=='salaryCurve':transformed='\n'.join(l for l in transformed.splitlines() if "talent.role === 'scientist'" not in l)+'\n'
  assert transformed in core,(x['arm'],name);functions.append([x['arm'],name])
reuse=json.loads(read(P/'RECORDER-REUSE.json'));base=read(reuse['baseline']['path']).decode();record=read(P/'record-pure-node.py').decode();normalized=record
for old,new in reversed(reuse['changes']):assert new in normalized;normalized=normalized.replace(new,old)
assert normalized==base
initial=raws[config['roles']['initialCore']['path']].decode()
for name,nextname in [('pairRows','stripPay'),('stripPay','price')]:
 start=core.index('function '+name+'(');end=core.index('function '+nextname+'(',start)
 assert core[start:end].strip() in initial
assert record.index("'A208_UNFILLED'")<record.index('output=OUTPUTS[mode]')<record.index('start_owned(argv')
assert "config.futureA208 &&" in read(P/'authenticate-inputs.mjs').decode()
findings=[{'id':'F1','path':str(P/'record-pure-node.py'),'line':230,'issue':'Positive report gate requires status PURE_RENEWAL208_PURE16_PRICING_PAIRS_AGREE, selectedRows23 and renewalAttribution:false; actual core emits PURE_RENEWAL208_PRICING_PAIRS_AGREE, selectedRows16 and renewalCauseAdmission:false. Every valid success STOP_REPORT_ROLE.','repair':'Fresh immutable version: change these exact three report-gate predicates and their proof/diff/pins; preserve clocks/ownership/caps.'}]
facts={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'roles':roles,'sourceFunctionsExactAfterDeclaredErasure':functions,'sourceSlicesAuthenticated':len(source_map),'inputsValidated':16,'premiumTierCounts':{'1':10,'2':6},'HContextRowsProjectedExactly':16,'all44NonpayAndOrderMatch':True,'numericWitnessMapping':{'reused':15,'separateR03_2':1},'recorderInverseNormalizationByteExact':True,'futureA208':None,'findings':findings,'pricingOrRngOrNodeExecuted':False,'fullScanOrGitExecuted':False}
(HERE/'FACTS.json').write_text(json.dumps(facts,indent=2,sort_keys=True)+'\n')
print(json.dumps({'status':'STATIC_ARTIFACT_SOURCE_PASS_WITH_F1','roles':len(roles),'functions':len(functions),'slices':len(source_map),'selected':16,'numericPricesEvaluated':False}))
