from pathlib import Path
import os, stat, json, hashlib

HERE=Path(__file__).resolve().parent
B=Path('/Users/zacheryspector/studio-scratch')
P=B/'1370-c0-renewal208-premium-floor-source-obligations-after-aj-20261009-r2'
roles={}
def read(label,path,pin=None):
 p=Path(path);a=p.lstat();assert stat.S_ISREG(a.st_mode) and a.st_size<=8*1024*1024
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  z=os.fstat(fd);pieces=[];count=0
  while True:
   raw=os.read(fd,65536)
   if not raw:break
   count+=len(raw);assert count<=8*1024*1024;pieces.append(raw)
  zz=os.fstat(fd)
 finally:os.close(fd)
 q=p.lstat()
 for k in ('st_dev','st_ino','st_mode','st_nlink','st_size','st_mtime_ns','st_ctime_ns'):assert getattr(a,k)==getattr(z,k)==getattr(zz,k)==getattr(q,k)
 raw=b''.join(pieces);h=hashlib.sha256(raw).hexdigest()
 if pin:assert len(raw)==pin['bytes'] and h==pin['sha256']
 roles[label]=dict(path=str(p),bytes=len(raw),sha256=h)
 return raw
def put(name,raw):
 fd=os.open(HERE/name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(raw)
 return dict(path=str(HERE/name),bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest())
def dump(name,v):return put(name,(json.dumps(v,sort_keys=True,indent=2)+'\n').encode())

raw=read('proposalReceipt',P/'RECEIPT.json');assert hashlib.sha256(raw).hexdigest()=='ba92e7b9ea8901b3160c76b57b156ba4bd50ab0791484574451f7947c0a08258'
r=json.loads(raw);pkg={k:read(k,v['path'],v) for k,v in r['roles'].items()}
inputs={}
for k,v in r['inputRoles'].items():
 if 'path' in v:
  raw=read(k,v['path'],v)
  inputs[k]=raw if k=='HObserver' else json.loads(raw)
 else:
  inputs[k]={name:read(k+':'+name,x['path'],x) for name,x in v.items()}
hm=inputs['HManifest'];am=inputs['ACopyPayload'];gap=inputs['gapFacts'];pins=inputs['gapPins']
source_map=json.loads(pkg['SOURCE-MAP.json']);source={};blocks=[];supp=[];supp_roles=[]
for e in source_map:
 raw=read(e['arm']+':'+e['repositoryPath'],e['sourceRole']['path'],e['sourceRole']);blob=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
 assert blob==e['gitBlobOidDerivedFromAuthenticatedRawBytes'] and e['authenticatedTreeObjectOid'] is None
 if e['arm']=='H':assert hm['arms']['historical']['files'][e['repositoryPath']]==e['sourceRole']['sha256'] and e['authenticatedGitMode'] is None
 else:
  v=am['sourceManifest'][e['repositoryPath']];assert (v['sha256'],v['bytes'],v['oid'],v['mode'])==(e['sourceRole']['sha256'],len(raw),blob,e['authenticatedGitMode'])
 lines=raw.decode().splitlines(True);assert len(lines)==e['sourceLines'];source[e['arm']+':'+e['repositoryPath']]=raw.decode()
 for s in e['slices']:
  lo,hi=s['firstLine'],s['lastLine'];assert 1<=lo<=hi<=len(lines)
  segment=''.join(lines[lo-1:hi]);assert hashlib.sha256(segment.encode()).hexdigest()==s['sliceSha256']
  blocks.append(f"===== {e['arm']} {e['repositoryPath']} {s['function']} actual lines{lo}-{hi}/{len(lines)} blob{blob} =====\n"+''.join(f'{k+1}: {lines[k]}' for k in range(lo-1,hi))+'\n')
 if e['repositoryPath'] in ['src/core/hollywoodPolicy.ts','src/core/technologyProduction.ts']:
  function,lo,hi=('chooseIndustryPackage',33,74) if e['repositoryPath'].endswith('hollywoodPolicy.ts') else ('createProductionTechnologyPolicy',60,98)
  segment=''.join(lines[lo-1:hi]);assert segment.startswith('export function '+function) and segment.endswith('}\n')
  role=dict(arm=e['arm'],function=function,repositoryPath=e['repositoryPath'],sourceCommit=e['sourceCommit'],sourceRole=e['sourceRole'],gitBlobOid=blob,firstLine=lo,lastLine=hi,sliceSha256=hashlib.sha256(segment.encode()).hexdigest())
  supp_roles.append(role);supp.append(json.dumps(role,sort_keys=True)+'\n'+''.join(f'{k+1}: {lines[k]}' for k in range(lo-1,hi))+'\n')
assert ''.join(blocks).encode()==pkg['SOURCE-SLICES.txt']
supprole=put('COMPLETE-TYPED-FUNCTION-SUPPLEMENT.txt',''.join(supp).encode())
hm_expected=hm['diagnosticSha256'];assert roles['HObserver']['sha256']==hm_expected
frame=json.loads(read('AFrame',pins['AFrame']['path'],pins['AFrame']))
for n in ['witness-core.mjs','witness.mts']:
 assert frame['preflight']['observer'][n]==hashlib.sha256(inputs['AR9ObserverRoles'][n]).hexdigest()
h_context_raw=read('H_context',pins['H_context']['path'],pins['H_context']);contexts=[json.loads(x) for x in h_context_raw.splitlines()]
histories={arm:json.loads(read(arm+'Employment',pins[arm+'Employment']['path'],pins[arm+'Employment'])) for arm in ['H','A']}
rows=json.loads(pkg['SELECTED16.json']);oldrows={tuple(x['identity']):x for x in gap['remainingRenewalRows']};assert len(rows)==len(oldrows)==16
assert [x['identity'] for x in rows]==[x['identity'] for x in gap['remainingRenewalRows']]
branch_counts={};facts=[]
for row in rows:
 old=oldrows[tuple(row['identity'])];tid=row['talentId']
 for k in ['HOriginalContract','AOriginalContract','HSourceOrder','ASourceOrder','talentId']:assert row[k]==old[k]
 assert row['subjectStudioId']==old['H208Case']['subjectStudioId'] and row['winningStudioId']==old['H208WinnerReceipt']['studioId']
 assert row['HCaseContractId']==old['H208Case']['contractId']==old['HOriginalContract']['contractId']
 assert row['HObservedWinningReserveWeeks']==old['H208WinningBusinessPolicy']['reserveWeeks']
 expr='tiers[2]' if row['subjectStudioId'].endswith('-r01') and row['winningStudioId'].endswith('-r02') else 'tiers[1]'
 assert row['commonSourceDerivedPremiumExpression']==expr
 branch_counts[expr]=branch_counts.get(expr,0)+1
 for arm in ['H','A']:
  found=[x for x in histories[arm] if x['terms']['talentId']==tid];assert len(found)==2
  assert found[0]==old[arm+'OriginalContract'] and found[1]['contractId']==row[arm+'SingleSuccessor']==old['identity'][0]
  assert found[1]['terms']==old[arm+'CommittedTerms'] and found[0]['terms']['endWeekExclusive']==found[1]['terms']['startWeek']==208
 matching=[x for x in contexts if x['week']==208 and x['receipt']['talentId']==tid and x['receipt']['kind']=='settled'];assert len(matching)==1
 cx=matching[0];assert len(cx['employment'])==2 and cx['cases']==[old['H208Case']]
 assert cx['employment'][0]==old['HOriginalContract'] and cx['employment'][1]['terms']==old['HCommittedTerms']
 assert cx['receipt']==old['H208WinnerReceipt']
 facts.append(dict(identity=row['identity'],talentId=tid,H208EmploymentRows=2,A416EmploymentRows=2,HCaseContractId=row['HCaseContractId'],commonSymbolicPremium=expr,nullFloor='SOURCE_DERIVED_AT_SELECTED_208_PRECOMMIT'))
assert branch_counts=={'tiers[2]':6,'tiers[1]':10}
dump('FACTS.json',dict(roles=roles,supplementRole=supprole,supplementBodies=supp_roles,rawDeclaredSlicesReproduceExactly=True,HModeQualificationRepaired=True,selected16=facts,symbolicBranchCounts=branch_counts,appendHistoryEndpointPremise='H selected posttick208 context retains reached history through208; A accepted terminal416 history can exclude extra208 records only because the same natural-tick writer preservation continues for every reached tick209..416, without reset/load/action, pruning, deletion or term rewrite.',documentaryCorrections=['Original REPORT complete-named-functions claim excludes truncated typed signatures; this independently authenticated four-body supplement supplies missing complete bodies without changing proposal bytes.', 'Read floor argument with explicit A208-to416 append-history induction, not terminal row count alone.'],numericTierOrPriceExecution=False,numericPayCausesClosed=0,executionAuthorized=False))
print(json.dumps(dict(roles=len(roles),sourceFiles=len(source_map),selectedRows=16,supplementBodies=4,branchCounts=branch_counts,artifactAuditExit=0)))
