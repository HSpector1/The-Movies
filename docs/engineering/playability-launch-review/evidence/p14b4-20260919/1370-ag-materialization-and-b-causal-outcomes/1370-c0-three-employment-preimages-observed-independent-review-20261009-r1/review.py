from pathlib import Path
import json,hashlib,os,stat,base64,collections,datetime
S=Path('/Users/zacheryspector/studio-scratch');HERE=Path(__file__).resolve().parent;O=S/'1370-c0-three-employment-preimages-comparison-20261009-r1';P=S/'1370-c0-three-employment-preimages-filled-roles-20261009-r1'
def sha(b):return hashlib.sha256(b).hexdigest()
def raw(p,h=None):
 p=Path(p);assert p.resolve(strict=True)==p;fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  a=os.fstat(fd);assert stat.S_ISREG(a.st_mode) and a.st_nlink==1
  with os.fdopen(os.dup(fd),'rb') as f:b=f.read()
  z=os.fstat(fd);assert (a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(z.st_dev,z.st_ino,z.st_size,z.st_mtime_ns,z.st_ctime_ns)
  if h:assert sha(b)==h,str(p)
  return b
 finally:os.close(fd)
def j(p,h=None):return json.loads(raw(p,h))
roles=j(P/'FILLED-ROLES.json','f476dbb531c0a41237b5be789f9c74b3b2c4998662d2bc728490be51df6ef6c9');tool=j(P/'PARENT-TOOL-OUTCOME.json','a3834d45d9c0b4ff6f70f9974484f4a045b5184536951546e4893993c4b77d03');report=j(O/'REPORT.json','b419fd0eea96ce9f646842fefeb7b1cc028a0dd07ee1146aca4892e36a47be1c')
assert tool['actualToolExit']==0 and tool['actualToolChunkId']=='a7a728'
raw(S/'1370-c0-three-employment-preimages-preparation-20261008-r2/compare_employment.py',tool['sourceSha256']);launch=j(P/'LAUNCH.json');assert launch['argv'][3:]==[str(S/'1370-c0-three-employment-preimages-preparation-20261008-r2/compare_employment.py'),str(P/'FILLED-ROLES.json'),tool['rolesSha256'],str(O)]
raw(P/'PARENT-OBSERVED-ADOPTION.json','6a33202f4770e9f7e8ad47404510746e767e2406b5ef22f414fe0f489e520e03')
for n,pin in tool['artifacts'].items():b=raw(O/n,pin['sha256']);assert len(b)==pin['bytes']
arrays={}
for name in ('H-original','M0'):
 r=roles['existingInputs'][name];receipt=j(r['receiptPath'],r['receiptSha256']);result=j(r['resultPath'],r['resultSha256']);assert receipt['decision']==r['receiptDecision'] and receipt['resultSha256']==r['resultSha256'];assert result['accepted'] and result['actualChildExit']==0 and not result['timedOut'];b=raw(r['preimagePath'],r['preimageSha256']);assert b==raw(O/(name+'-employment.json')) and len(b)==13113;arrays[name]=json.loads(b)
r=roles['acceptedWitness'];receipt=j(r['receiptPath'],r['receiptSha256']);assert receipt['decision']==r['receiptDecision']=='ACCEPT_OBSERVED_AGING_ERA_EMPLOYMENT_PREIMAGE' and receipt['qualifiedSourceSha']=='3aaf55e0c06c4b745b0b722cc56913050b1ee229';frame_raw=raw(r['framePath'],r['frameSha256']);assert frame_raw==raw(O/'accepted-witness-frame.ndjson');frame=json.loads(frame_raw);b=base64.b64decode(frame['preimageBase64'],validate=True);assert b==raw(O/'post-aging-employment.json') and sha(b)=='4cffcb410893395f8ee93da2d7d6146f35db2369962fe333e02de8d2fc7c0b58';arrays['post-aging']=json.loads(b)
def index(rows):
 seen=collections.Counter();out={}
 for order,row in enumerate(rows):
  key=(row['contractId'],seen[row['contractId']]);seen[row['contractId']]+=1;out[key]={'sourceOrder':order,'row':row}
 return out,seen
def diffs(l,r,path='$'):
 if type(l)!=type(r):return [{'path':path,'left':l,'right':r}]
 if isinstance(l,dict):
  out=[]
  for k in list(l)+[k for k in r if k not in l]:
   if k not in l or k not in r:out.append(dict(path=path+'.'+k,leftPresent=k in l,rightPresent=k in r,**({'left':l[k]} if k in l else {}),**({'right':r[k]} if k in r else {})))
   else:out.extend(diffs(l[k],r[k],path+'.'+k))
  return out
 if isinstance(l,list):
  assert len(l)==len(r);return [v for i,(a,b) in enumerate(zip(l,r)) for v in diffs(a,b,path+'['+str(i)+']')]
 return [] if l==r else [{'path':path,'left':l,'right':r}]
summary={};LIFECYCLE={'$.endedWeek','$.reason','$.terms.startWeek','$.terms.endWeekExclusive','$.terms.termWeeks'}
for arm,left,right in [('H-original_to_post-aging','H-original','post-aging'),('post-aging_to_M0','post-aging','M0')]:
 leftrows,rightrows=arrays[left],arrays[right];assert len(leftrows)==len(rightrows)==44;li,lc=index(leftrows);ri,rc=index(rightrows);a=report[arm];assert a['leftCount']==a['rightCount']==44 and a['duplicateBaseKeysLeft']==sum(v>1 for v in lc.values())==0 and a['duplicateBaseKeysRight']==sum(v>1 for v in rc.values())==0
 recs={tuple(x['identity']):x for x in a['records']};assert len(recs)==len(a['records']) and set(recs)==set(li)|set(ri)
 counts=collections.Counter();changes=[];unmatched=[];fields=collections.Counter()
 for key in sorted(set(li)|set(ri)):
  rec=recs[key];l=li.get(key);r=ri.get(key);assert rec['left']==l and rec['right']==r
  unequal=[] if l is None or r is None else diffs(l['row'],r['row']);status='MISSING_LEFT' if l is None else 'MISSING_RIGHT' if r is None else 'CHANGED' if unequal else 'MATCHED';assert rec['status']==status;counts[status]+=1
  if status=='CHANGED':assert rec['allUnequalFields']==unequal and rec['firstUnequalPath']==unequal[0]['path'];changes.append(rec);fields.update(x['path'] for x in unequal)
  else:assert rec['firstUnequalPath'] is None
  if status.startswith('MISSING'):unmatched.append({'status':status,'identity':list(key),'sourceOrder':(l or r)['sourceOrder'],'row':(l or r)['row']})
 assert a['matched']==counts['MATCHED'] and a['changes']==[r for r in a['records'] if r['status']!='MATCHED']
 for side,lookup in [('Left',li),('Right',ri)]:
  expected=[{'identity':list(key),'sourceOrder':v['sourceOrder'],'status':recs[key]['status']} for key,v in sorted(lookup.items(),key=lambda kv:kv[1]['sourceOrder'])];assert a['completeSourceOrder'+side]==expected
 ordered=sorted(changes,key=lambda x:x['left']['sourceOrder'])
 for label,predicate in [('Field',lambda p:True),('Term',lambda p:p.startswith('$.terms.')),('Lifecycle',lambda p:p in LIFECYCLE)]:
  first=next(({'identity':rec['identity'],'leftSourceOrder':rec['left']['sourceOrder'],'rightSourceOrder':rec['right']['sourceOrder'],'field':f} for rec in ordered for f in rec['allUnequalFields'] if predicate(f['path'])),None);assert a['firstMatched'+label+'ChangeInLeftSourceOrder']==first
 assert set(fields)<={'$.terms.annualSalary','$.terms.signingBonus'} and a['firstMatchedLifecycleChangeInLeftSourceOrder'] is None
 summary[arm]={'leftCount':44,'rightCount':44,'sharedIdentities':len(set(li)&set(ri)),'recordCounts':dict(counts),'unequalFieldCounts':dict(fields),'firstMatchedChange':a['firstMatchedFieldChangeInLeftSourceOrder'],'firstMatchedLifecycleChange':None,'completeSourceOrderAndAllUnequalFieldsVerified':True,'leftOrderEqualsRightOrderForShared':all(li[k]['sourceOrder']==ri[k]['sourceOrder'] for k in set(li)&set(ri)),'unmatched':sorted(unmatched,key=lambda x:(x['sourceOrder'],x['status']))}
for name,rows in arrays.items():
 expected={}
 for i,row in enumerate(rows):expected.setdefault(row['terms']['talentId'],[]).append({'sourceOrder':i,'contractId':row['contractId'],'row':row})
 assert report['nestedTalentTenureGenerationViews'][name]==expected
out={'status':'ALL_RAW_ROWS_JOINS_FIELDS_ORDER_AND_UNMATCHED_ACCOUNTING_VERIFIED','arms':summary,'actualToolExit':0,'actualToolWallSeconds':tool['actualToolWallSeconds'],'rawRowsPerArm':44,'noGameOrFullScan':True,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat()};(HERE/'FACTS.json').write_text(json.dumps(out,sort_keys=True,indent=2)+'\n');print(json.dumps({k:{x:v for x,v in a.items() if x!='unmatched'} for k,a in summary.items()},sort_keys=True))
