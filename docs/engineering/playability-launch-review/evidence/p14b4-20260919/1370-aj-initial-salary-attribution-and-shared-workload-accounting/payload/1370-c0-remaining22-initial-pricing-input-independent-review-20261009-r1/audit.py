import os,stat,json,hashlib,math,datetime
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');H=Path(__file__).parent;P=S/'1370-c0-remaining22-initial-pricing-pure-witness-plan-20261009-r1'
facts={'schema':'initial22-independent-input-role-audit/v1','roles':{},'newDrawOrSalaryArithmeticExecuted':False,'sourceImported':False,'gitOrFullScan':False}
def read(p,h=None):
 p=Path(p);st=p.lstat();assert stat.S_ISREG(st.st_mode) and st.st_nlink==1 and st.st_size<=4*1024*1024
 sig=lambda s:(s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 with os.fdopen(fd,'rb') as f:
  assert sig(os.fstat(f.fileno()))==sig(st);b=f.read(4*1024*1024+1);assert sig(os.fstat(f.fileno()))==sig(st)==sig(p.lstat())
 assert len(b)==st.st_size;d=hashlib.sha256(b).hexdigest()
 if h:assert d==h,(str(p),d)
 facts['roles'][str(p)]={'path':str(p),'bytes':len(b),'sha256':d};return b
def obj(p,h=None):return json.loads(read(p,h))
pins=obj(P/'PINS.json','eb0d94a6386f93960b18ed8b978d3fa98af45b6787ef18152ad33fb16269c6f5')
for role in pins.values():assert len(read(role['path'],role['sha256']))==role['bytes']
inputs=obj(P/'INPUT-ROLES.json','0e7c3ebf9c6e15d1db717ba12b942776ff01d3a2a5970d46436f216e472d322e');refs=inputs['references']
for role in refs.values():assert len(read(role['path'],role['sha256']))==role['bytes']
proof=obj(refs['ageSalarySourceProof']['path']);prior=obj(refs['ageSalaryIndependentReview']['path']);assert prior['decision']=='ACCEPT_SOURCE_PROOF_ONLY_NO_ANNUAL_ATTRIBUTION' and prior['proofSha256']==refs['ageSalarySourceProof']['sha256']
ad=obj(S/'1370-c0-remaining-employment-salary-age-phase-parent-adoption-20261009-r1/ADOPTION.json','6caa7949f60f672144555791727974de94d0a722d602bdeee7a092c8506977ae');assert ad['reviewSha256']==refs['ageSalaryIndependentReview']['sha256'] and ad['annualCausalClosures']==0
upstream=obj(refs['ageSalaryAuthenticatedInputs']['path']);priorPins=obj(upstream['prior_input_pins']['path'],upstream['prior_input_pins']['sha256'])
selected={}
for k in ('H_employment','A_employment','comparison_acceptance'):
 role=priorPins[k];selected[k]=obj(role['path'],role['sha256'])
def join(rows):
 occurrences={};result={}
 for index,row in enumerate(rows):
  cid=row['contractId'];occ=occurrences.get(cid,0);occurrences[cid]=occ+1;result[(cid,occ)]=(index,row)
 return result
hrows=join(selected['H_employment']);arows=join(selected['A_employment'])
hcontextRole=upstream['H_context'];hcontext=[json.loads(x) for x in read(hcontextRole['path'],hcontextRole['sha256']).splitlines()]
hresultRole=upstream['H_result'];hresult=obj(hresultRole['path'],hresultRole['sha256']);assert hresult['seed']=='p13a-core-causal-01'
sourceProofRows={tuple(r['identity']):r for r in proof['records'] if r['startWeek']==0}
rows=inputs['initialRows'];assert len(rows)==inputs['initialScope']==len(sourceProofRows)==22
expectedIds=[f'person-studio-aca408ec-r{r:02d}-{i}' for r in range(1,5) for i in range(6) if (r,i) not in ((1,0),(3,2))]
assert [r['talentId'] for r in rows]==expectedIds and len(set(expectedIds))==22
verified=[]
for row in rows:
 identity=tuple(row['identity']);p=sourceProofRows[identity];hi,hr=hrows[identity];ai,ar=arows[identity]
 assert hi==row['HSourceOrder']==p['H_sourceOrder'] and ai==row['ASourceOrder']==p['A_sourceOrder']
 assert hr['terms']==row['HActualTerms']==p['H_terms'] and ar['terms']==row['AActualTerms']==p['A_terms']
 assert row['week']==hr['terms']['startWeek']==ar['terms']['startWeek']==0 and row['termWeeks']==208
 person=hcontext[p['H_person208_line']-1]['person'];assert person['id']==row['talentId']==p['talentId'] and person['role']==row['creativeRole']==p['role']
 assert person['salary']==row['generationSalaryCurve']['value']==p['inputRoles']['initialSalaryCurve']['value']
 assert person['age']==row['HAuthoredInitialAge']['value']==p['inputRoles']['H_initialAge']['value'] and math.floor(person['age'])==row['ADerivedInitialAge']['value']==p['inputRoles']['A_initialAge']['value']
 assert row['seed']['value']=='p13a-core-causal-01' and row['hiringPurpose']=='hiring' and row['hiringKey']=='offer-'+person['id'] and row['streamSeed']=='p13a-core-causal-01::hiring::offer-'+person['id']
 assert row['acceptedFirstDraw'] is None and row['acceptedJitter'] is None
 verified.append({'identity':row['identity'],'talentId':row['talentId'],'HSourceOrder':hi,'ASourceOrder':ai,'sourceProofPersonContextLine':p['H_person208_line'],'generationSalaryCurve':person['salary'],'HInitialAge':person['age'],'AInitialAge':row['ADerivedInitialAge']['value'],'hiringKey':row['hiringKey']})
bridge=obj(refs['row0IndependentBridge']['path']);assert bridge['decision']=='ACCEPT_ROW0_SOURCE_BRIDGE_WITH_SCOPE_CORRECTIONS' and bridge['measurementRolePreserved']=='F1 observer transported by deterministic source proof'
for role in bridge['selectedSourcePins']:
 if role['sourcePath'] in ('src/core/rng.ts','src/core/employment.ts','src/core/hollywood.ts','src/core/worldgen.ts','src/core/tuning.ts'):
  read(role['path'],role['sha256'])
  if role['sourcePath']=='src/core/rng.ts':assert role['sha256']=='2f21996018c6f5399e1a68a1bf765e505db4d17360a939aa00cae0740cc6c57a'
traceRole=upstream['F1_trace'];trace=[json.loads(x) for x in read(traceRole['path'],traceRole['sha256']).splitlines()];control=trace[0];known=inputs['knownControl']
assert control['kind']=='salary' and control['week']==0 and control['talentId']==known['talentId']=='person-studio-aca408ec-r01-0' and control['scarcityKey']==known['key']
assert control['scarcityDraw']==known['acceptedF1Draw']==0.34857689985074103 and control['jitter']==known['acceptedF1Jitter']==0.9757723039761186
assert all('F1' not in row['generationSalaryCurve']['origin'] and 'F1' not in row['HAuthoredInitialAge']['origin'] and 'F1' not in row['ADerivedInitialAge']['origin'] for row in rows)
facts.update(status='ACCEPT_INITIAL_ONLY_INPUT_ROLES_PENDING_PURE23_DRAW_WITNESS',verifiedInitialRows=verified,remainingInitialUnknownDraws=22,totalProspectiveFreshStreamsIncludingKnownControl=23,renewalRowsExcluded=16,renewalOnlyR03_2Excluded=True,newAnnualAttributions=0,knownRow0Control={'firstDraw':known['acceptedF1Draw'],'jitter':known['acceptedF1Jitter'],'measurement':'F1 observer transported by accepted source proof, not historical offer-local capture'},sourceOrderOnlyLocator=True,stableIdentityOccurrenceJoin=True,sourceRangesReviewed=inputs['sourceRanges'],claimLimit='Accepted prior finite source transport plus exact input/paired-term authentication. No RNG or salary recomputation, no new causes; future exact draws, source-order quote reconstruction and all paired annual/bonus matches required.')
raw=(json.dumps(facts,indent=2,sort_keys=True)+'\n').encode();fd=os.open(H/'FACTS.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
print(json.dumps({'status':facts['status'],'factsSha256':hashlib.sha256(raw).hexdigest(),'verifiedRows':len(verified),'bytes':len(raw)}))
