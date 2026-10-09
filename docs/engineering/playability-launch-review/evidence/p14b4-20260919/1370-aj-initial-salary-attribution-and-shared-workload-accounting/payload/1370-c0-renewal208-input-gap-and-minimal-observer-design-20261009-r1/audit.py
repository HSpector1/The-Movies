from pathlib import Path
import os,stat,json,hashlib
S=Path('/Users/zacheryspector/studio-scratch');D=S/'1370-c0-renewal208-input-gap-and-minimal-observer-design-20261009-r1';P=S/'1370-c0-remaining-employment-salary-age-phase-source-proof-20261009-r1';H=S/'1369-c0-preimage-replay-proposal-r7/arms/historical/tree';A=S/'1370-c0-aging-era-sparse-materialized-r6-20261008-r1'
def meta(s):return(s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)
def read(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1 and s.st_size<8*1024*1024
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  assert meta(s)==meta(os.fstat(fd));b=b''
  while True:
   x=os.read(fd,65536)
   if not x:break
   assert len(b)+len(x)<8*1024*1024;b+=x
  assert meta(s)==meta(os.fstat(fd))==meta(p.lstat()) and len(b)==s.st_size;return b
 finally:os.close(fd)
def role(p):
 b=read(p);return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def j(p):return json.loads(read(p))
base=j(P/'INPUT-PINS.json');selected=['H_context','H_result','H_manifest','H_diagnostic','H_talentMarket.ts','A_talentMarket.ts','H_employment.ts','A_employment.ts','H_worldgen.ts','H_talentSummary.ts','H_rng.ts','H_hollywoodStartingData.ts','H_hollywoodTick.ts','H_tick.ts','A_tick.ts','A_aging.ts','A_hollywood.ts','A_copy_acceptance','A_copy_payload']
roles={k:base[k] for k in selected}
for v in roles.values():assert role(v['path'])==v
extra={'phaseProof':(P/'PROOF.json','d84320193744d89918acf35748c917589f623f3f13f31c2f5e5745203571cfc2'),'phaseInputPins':(P/'INPUT-PINS.json','317bb5012ce56498c31801637fc2f098c640c034effa4885da55190d2081246a'),'phaseReview':(S/'1370-c0-remaining-employment-salary-age-phase-independent-source-review-20261009-r1/RECEIPT.json','a71cc521f8c8ade5879191ac5e275034ca246bf58c6713534bf048ce703227a8'),'phaseRootAdoption':(S/'1370-c0-remaining-employment-salary-age-phase-parent-adoption-20261009-r1/ADOPTION.json','6caa7949f60f672144555791727974de94d0a722d602bdeee7a092c8506977ae'),'pricingRootAdoption':(S/'1370-c0-initial23-pricing-verification-parent-recorded-20261009-r1/ADOPTION.json','395e3341c6ed34281df795868d03026c8b87159e12dc3effe2a3b5e760c3dc03'),'pricingObservedReview':(S/'1370-c0-initial23-pricing-independent-observed-review-20261009-r2/RECEIPT.json','e27c8d8e230a453eee078a5e21abd5716b9192404bb172a1de0ff46d4571fce2'),'numericObservedReview':(S/'1370-c0-initial23-first-draw-witness-independent-observed-review-20261009-r1/RECEIPT.json','54b305c8b48c96cd664c037d592f955b8ca8e59e53337d5c287ffb7331f303c7'),'numericStdout':(S/'1370-c0-initial22-first-draw-witness-output-20261009-r1/stdout.bin','653213f9f107ffc576dad0c2d7df18c9e04c04d7bc5020ae90e19f257543a549'),'HEmployment':(S/'1370-c0-three-employment-preimages-comparison-20261009-r1/H-original-employment.json','09bcc35ba327579ac63dd1ed63535b23cbc8ff55b25fd9597a2872a819f08750'),'AEmployment':(S/'1370-c0-three-employment-preimages-comparison-20261009-r1/post-aging-employment.json','4cffcb410893395f8ee93da2d7d6146f35db2369962fe333e02de8d2fc7c0b58'),'AFrame':(S/'1370-c0-three-employment-preimages-comparison-20261009-r1/accepted-witness-frame.ndjson','8b0b70f110c37199dc320045b2fec0ac384c323fddfba88bbae620bf34766c50'),'AFrameObservedReview':(S/'1370-c0-aging-era-employment-witness-r9-observed-independent-review-20261009-r1/RECEIPT.json','d681f73e3613248c7ccd0be7736e46bd1fe424dd62ea099a60e031e774238f64'),'B109ManifestDifferentSeed':(S/'1370-c0-b-release-109-tick-source-proposal-20261008-r2/MANIFEST.json','67945d92e6a330f98482a893cb9a39005e7eed9fcc428b5c1d3a339cca116578')}
for k,(p,expected) in extra.items():v=role(p);assert v['sha256']==expected,(k,v);roles[k]=v
payload=j(base['A_copy_payload']['path'])
for name in ['src/core/hollywoodTick.ts','src/core/hollywoodStartingData.ts','src/core/tuning.ts','src/core/worldgen.ts','src/core/talentSummary.ts','src/core/rng.ts']:
 v=role(A/name);expected=payload['sourceManifest'][name];assert v['bytes']==expected['bytes'] and v['sha256']==expected['sha256'];roles['A_'+name]=v
roles['H_tuning.ts']=role(H/'src/core/tuning.ts');assert roles['H_tuning.ts']['sha256']==roles['A_src/core/tuning.ts']['sha256']=='573b33edda81f680f99840bf14e253f5ed4b1a840ea76e8fb19d32caa1aff0f4'
proof=j(P/'PROOF.json');remaining=sorted([r for r in proof['records'] if r['startWeek']==208],key=lambda r:r['H_sourceOrder']);assert len(remaining)==16
hraw=read(base['H_context']['path']);contexts=[(i+1,json.loads(line),hashlib.sha256(line).hexdigest()) for i,line in enumerate(hraw.splitlines())];context={r['person']['id']:(line,r,sha) for line,r,sha in contexts if r['week']==208};assert len(context)==24
w=j(roles['numericStdout']['path']);draws={r['talentId']:r for r in w['rows']};HRows=j(roles['HEmployment']['path']);ARows=j(roles['AEmployment']['path']);frame=j(roles['AFrame']['path']);assert frame['weeks']==416 and frame['seed']=='p13a-core-causal-01' and frame['sourceSha']=='3aaf55e0c06c4b745b0b722cc56913050b1ee229'
assert not any(k in frame for k in ('person','talent','pricingInputs','terminalContext','week208People'))
rows=[]
for old in remaining:
 idx=old['H_sourceOrder'];assert old['A_sourceOrder']==idx and HRows[idx]['terms']==old['H_terms'] and ARows[idx]['terms']==old['A_terms'];line,cx,lsha=context[old['talentId']]
 assert cx['receipt']['kind']=='settled' and cx['receipt']['studioId']==HRows[idx]['studioId']==ARows[idx]['studioId'] and cx['person']['id']==old['talentId'] and cx['person']['age']==old['H_age208']
 assert len(cx['cases'])==1 and cx['cases'][0]['closedWeek']==208 and cx['proposals']==[]
 historic=[r for r in HRows if r['terms']['talentId']==old['talentId'] and r['terms']['startWeek']<208];ahistoric=[r for r in ARows if r['terms']['talentId']==old['talentId'] and r['terms']['startWeek']<208]
 assert len(historic)==len(ahistoric)==1 and historic[0]['terms']['endWeekExclusive']==ahistoric[0]['terms']['endWeekExclusive']==208
 assert old['talentId'] not in draws or draws[old['talentId']]['key']=='offer-'+old['talentId']
 rows.append({'identity':old['identity'],'HSourceOrder':idx,'ASourceOrder':idx,'talentId':old['talentId'],'creativeRole':old['role'],'HCommittedTerms':old['H_terms'],'ACommittedTerms':old['A_terms'],'HContextLine':line,'HContextRawLineSha256':lsha,'H208FullPersonAvailable':True,'H208Person':cx['person'],'H208Case':cx['cases'][0],'H208WinnerReceipt':cx['receipt'],'H208WinningBusinessPolicy':next(b['policy'] for b in cx['businesses'] if b['studioId']==cx['receipt']['studioId']),'HOriginalContract':historic[0],'AOriginalContract':ahistoric[0],'jitterRole':{'status':'REUSE_ACCEPTED_ISOLATED_KEYED_FIRST_DRAW' if old['talentId'] in draws else 'MISSING_SINGLE_KEY_FIRST_DRAW','acceptedWitnessRow':draws.get(old['talentId']),'key':'offer-'+old['talentId'],'seed':'p13a-core-causal-01','purpose':'hiring'},'A208AgeSourceDerived':old['inputRoles']['A_renewalAge'],'A208EvolvedPricingVectorStatus':'MISSING_IN_AUTHENTICATED_LISTED_ARTIFACTS','premiumRole':'source-derived rivalPremiumTier; terminal proposal is deleted; prove fixed policy/subject studio/winner caller closure before arithmetic','releaseFloorRole':'prior same-subject contracts end208; nullat208 follows expiry and precommit call proof, not a captured floor local'})
assert len([r for r in rows if r['jitterRole']['acceptedWitnessRow'] is None])==1
assert next(r for r in rows if r['jitterRole']['acceptedWitnessRow'] is None)['talentId']=='person-studio-aca408ec-r03-2'
assert j(roles['B109ManifestDifferentSeed']['path'])['seed']=='p13-public-commercial-adoption'
f={'schema':'renewal208-finite-input-gap-map/v1','sourceOnly':True,'roles':roles,'remainingRenewalRows':rows,'remainingCount':16,'acceptedJittersReusable':15,'singleMissingDrawTalentId':'person-studio-aca408ec-r03-2','H208ContextSubjects':24,'H208AllTerminalProposalsDeleted':all(r['proposals']==[] for _,r,_ in contexts if r['week']==208),'AFrameDoesNotContain208PricingVectors':True,'B109CaptureWrongSeedAndSourceArm':True,'numericDrawOrPriceExecution':False,'F1EvolvedPersonSubstitution':False,'initialAttributionsRetained':22,'noGlobalArtifactAbsenceClaim':True}
fd=os.open(D/'FACTS.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as t:json.dump(f,t,indent=2,sort_keys=True);t.write('\n')
fd=os.open(D/'INPUT-PINS.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as t:json.dump(roles,t,indent=2,sort_keys=True);t.write('\n')
print(json.dumps({k:v for k,v in f.items() if k not in ('roles','remainingRenewalRows')}))
