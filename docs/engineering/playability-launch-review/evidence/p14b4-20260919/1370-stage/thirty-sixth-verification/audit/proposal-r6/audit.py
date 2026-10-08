#!/usr/bin/env python3
"""PROPOSED independent observed audit; requires separately pinned exact-review receipt."""
import collections,hashlib,io,json,math,os,pathlib,re,shutil,signal,stat,subprocess,tarfile,time,zlib
S=pathlib.Path('/Users/zacheryspector/studio-scratch');R=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
P=S/'1370-e0g-ebg-b-only-adoption-comparator-proposal-r2'
INPUT=P/'INPUTS.json';DESIGN=S/'1370-e0g-ebg-b-only-residual-design-r1/INPUTS.json'
LEAF=S/'1370-e0g-ebg-b-only-adoption-comparator-runs-r2/20261008-bonly-adoption-r1'
RESULT=LEAF/'RESULT.json';RECEIPT=LEAF/'RECEIPT.json'
STATIC=S/'1370-e0g-ebg-b-only-adoption-comparator-independent-static-review-r2/RECEIPT.json'
EXACT=S/'1370-e0g-ebg-b-only-adoption-comparator-r2-filled-exact-review-r1/RECEIPT.json'
FILLED=S/'1370-e0g-ebg-b-only-adoption-comparator-r2-filled-exact-r1'
LANE=S/'heavy-queue/1370-e0g-ebg-b-only-adoption-20261008-bonly-adoption-r1.lane.log.meta'
OUT=S/'1370-e0g-ebg-b-only-adoption-r2-independent-observed-audit-r6/AUDIT.json'
HEAD='b97129610a07d3529fc482daeddc0cd9bf798713';TREE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554';TIP='d8cb45ee094bd8647e19ebed7b63ce2d773dacd4'
INPUT_SHA='f767f13f3212776f0b857b2ad146ca571b6a5c4813a8bcb2585f4536df01a93c'
DESIGN_SHA='bc29a5e796656fbc8fa5640ebadb1995b1c3a9fcd7ed8f01af98d9bca8264f90'
STATIC_SHA='ca19118cd97eb60640be419f9173a0aec867d456728ccc5bbbbe2286b34d89ec'
FILLED_COMMAND_SHA='e665e0a9827be910c9006922bf93761f492184c0410eb32cf15acbc00bdb283e'
FILLED_BINDING_SHA='520919e21b58a3e5e660c8e77f30816ee6f7207be801b7db91df2cca2bf5ce6c'
EXACT_SHA='8b87236ce2d6b58e8d25a560bdb41ebb37c7dc28df97c92e7b9e86c28530cdf3'
RESULT_SHA='2e909fd66897f142e11830b92d51ec10d2a7b26cec3aa23f626b42a781ead8fa'
P13A_STOP=S/'1370-e0g-ebg-b-only-p13a-comparator-runs-r3/20261008-bonly-p13a-r1/RECEIPT.json'
P13A_OBSERVED=S/'1370-e0g-ebg-b-only-p13a-r4-independent-observed-audit-r1/RECEIPT.json'
sha=lambda x:hashlib.sha256(x).hexdigest()
def environment_guard():
 assert subprocess.check_output(['pmset','-g','batt'],text=True,timeout=5).splitlines()[:1]==["Now drawing from 'AC Power'"]
 assert shutil.disk_usage(S).free>=3<<30
def safe_parent(p):
 for parent in p.parents:
  assert stat.S_ISDIR(parent.lstat().st_mode),'symlink/non-directory ancestor'
def same_file(a,b):
 return (a.st_dev,a.st_ino,a.st_mode,a.st_nlink,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(b.st_dev,b.st_ino,b.st_mode,b.st_nlink,b.st_size,b.st_mtime_ns,b.st_ctime_ns)
def read_regular(p,cap,pin=None):
 safe_parent(p);before=p.lstat()
 assert stat.S_ISREG(before.st_mode) and before.st_nlink==1 and 0<=before.st_size<=cap
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK)
 try:
  initial=os.fstat(fd);assert same_file(before,initial)
  h=hashlib.sha256();chunks=[];n=0;guard_at=0
  while True:
   b=os.read(fd,min(1<<20,cap+1-n));assert n+len(b)<=cap
   if not b:break
   n+=len(b);h.update(b);chunks.append(b)
   if n-guard_at>=8<<20:environment_guard();guard_at=n
  assert n==initial.st_size and same_file(initial,os.fstat(fd)) and same_file(initial,p.lstat())
  if pin is not None:assert h.hexdigest()==pin
  return b''.join(chunks)
 finally:os.close(fd)
def pinned(p,pin,cap):return read_regular(p,cap,pin)
def strict_equal(a,b):
 if type(a) is not type(b):return False
 if isinstance(a,dict):return list(a)==list(b) and all(strict_equal(a[k],b[k]) for k in a)
 if isinstance(a,list):return len(a)==len(b) and all(strict_equal(x,y) for x,y in zip(a,b))
 if isinstance(a,float) and a==b==0:return math.copysign(1,a)==math.copysign(1,b)
 return a==b
def material_equal(a,b):
 """Compare source values with key-sorted RESULT materialization."""
 if type(a) is not type(b):return False
 if isinstance(a,dict):return a.keys()==b.keys() and all(material_equal(a[k],b[k]) for k in a)
 if isinstance(a,list):return len(a)==len(b) and all(material_equal(x,y) for x,y in zip(a,b))
 if isinstance(a,float) and a==b==0:return math.copysign(1,a)==math.copysign(1,b)
 return a==b
def positive_zero(v):return type(v) in (int,float) and v==0 and math.copysign(1,v)>0
def parse_json(raw):
 return json.loads(raw,parse_int=lambda s:-0.0 if s=='-0' else int(s),parse_constant=lambda x:(_ for _ in ()).throw(AssertionError('nonfinite')))
def parse_lane_meta(raw):
 lines=raw.decode('utf-8').splitlines()
 starts=[i for i,s in enumerate(lines) if re.fullmatch(r'start; .+',s)]
 ends=[(i,int(m.group(1))) for i,s in enumerate(lines) if (m:=re.fullmatch(r'end, exit ([0-9]+); .+',s))]
 assert len(starts)==len(ends)==1 and starts[0]<ends[0][0],'ambiguous lane chronology'
 return ends[0][1]
def prepare_output(path):
 safe_parent(path.parent)
 assert not os.path.lexists(path.parent) and not os.path.lexists(path)
 path.parent.mkdir(mode=0o700)
 assert stat.S_ISDIR(path.parent.lstat().st_mode)
def remaining_budget(start,now):
 assert type(start) is float and math.isfinite(start) and type(now) is float and math.isfinite(now)
 elapsed=now-start
 assert 0<=elapsed<600,'audit bootstrap exhausted whole child deadline'
 return 600-elapsed
def read_tar_member(tf,name,pin,cap):
 member=tf.getmember(name);assert member.isfile() and member.size<=cap and member.size>=0
 f=tf.extractfile(member);assert f is not None
 h=hashlib.sha256();chunks=[];n=0;guard_at=0
 with f:
  while True:
   b=f.read(1<<20)
   if not b:break
   n+=len(b);assert n<=cap;h.update(b);chunks.append(b)
   if n-guard_at>=8<<20:environment_guard();guard_at=n
 assert n==member.size and h.hexdigest()==pin
 return b''.join(chunks)
def git(*a):return subprocess.check_output(['git',*a],cwd=R,text=True,timeout=30).strip()
def guard():
 environment_guard()
 assert git('rev-parse','HEAD')==HEAD and git('rev-parse','HEAD:src')==TREE and git('status','--porcelain=v1')==''
 assert git('ls-remote','--exit-code','origin','refs/heads/wip/headless-program-20260916-ts').startswith(HEAD+'\t')
 assert git('ls-remote','--exit-code','origin','refs/heads/evidence/1370-r10-clean-captures').startswith(TIP+'\t')
def stream_rows(raw,index,role,summary):
 assert len(index)==417 and len(raw)==summary['boundaryCompressedBytes'] and sha(raw)==summary['boundaryCompressedSha256']
 pos=0;logical=hashlib.sha256();size=0;active_total=0;terminal=None;last_guard=0
 for week in range(417):
  environment_guard()
  assert pos<len(raw);start=pos;d=zlib.decompressobj(31);parts=[];n=0
  while not d.eof:
   data=raw[pos:pos+65536];assert data
   chunk=d.decompress(data,16*1024*1024+1-n);n+=len(chunk);assert n<=16*1024*1024
   parts.append(chunk);used=len(data)-len(d.unused_data)-len(d.unconsumed_tail);assert used>0 or chunk;pos+=used
   if size+n-last_guard>=8<<20:environment_guard();last_guard=size+n
  line=b''.join(parts);assert line.endswith(b'\n') and line.count(b'\n')==1
  logical.update(line);size+=len(line);assert size<=1536<<20
  slot=index[week][role.lower()]
  assert slot=={'member':week,'gzipOffsetStart':start,'gzipOffsetEnd':pos,'bytes':len(line),'sha256':sha(line)}
  row=parse_json(line)
  assert row['week']==row['boundary']==week and row['seed']=='p13-public-commercial-adoption' and row['role']==role
  assert row['save']['saveVersion']==46 and strict_equal(row['save']['state'],row['originalState']) and strict_equal(row['rng'],row['originalState']['rngState'])
  business=row['originalState']['hollywood']['businesses'];periods=sum(len(b['account']['periods']) for b in business)
  active=[b for b in business if b['costCutting']['since'] is not None]
  proof=row['emptyProof'];expected={'businesses','periods','cuttingNull','positiveZeroRefund'}
  if role=='EBG':expected.add('cuttingActive')
  assert set(proof)==expected and proof['businesses']==len(business) and proof['periods']==proof['positiveZeroRefund']==periods
  assert proof['cuttingNull']==len(business)-len(active)
  if role=='E0G':assert not active
  else:assert proof['cuttingActive']==len(active)
  for b in business:
   assert b['costCutting']['version']==1
   if b['costCutting']['since'] is not None:assert 0<=b['costCutting']['since']<=week and not b['productions'] and not b['runs']
   for period in b['account']['periods']:assert positive_zero(period['movements']['facilityDemolitionRefund'])
  assert all(r.get('kind')!='facilityDisposed' for r in row['originalState']['hollywood']['receipts'])
  result_proof=index[week][role.lower()+'B'];assert result_proof['businesses']==len(business) and result_proof['periods']==periods and len(result_proof['active'])==len(active)
  active_total+=len(active)
  if week==416:terminal=row
 assert pos==len(raw) and size==summary['boundaryBytes'] and logical.hexdigest()==summary['boundarySha256']
 return terminal,active_total,size
def digests(pre):
 script="const fs=require('fs'),c=require('crypto'),x=JSON.parse(fs.readFileSync(0,'utf8'));let o={};for(let [k,v] of Object.entries(x))o[k]=c.createHash('sha256').update(JSON.stringify(v)).digest('hex');process.stdout.write(JSON.stringify(o))"
 p=subprocess.run(['node','-e',script],input=json.dumps(pre,ensure_ascii=False,separators=(',',':')),text=True,capture_output=True,check=True,timeout=30)
 return json.loads(p.stdout)
def identity(rows,kind):
 seen=collections.Counter();out=[]
 for i,r in enumerate(rows):
  if kind=='market':key=(r.get('week'),r.get('talentId'))
  elif kind=='industry':key=(r.get('week'),r.get('studioId'),r.get('kind'),r.get('subjectId',r.get('subject',r.get('productionId',r.get('talentId')))))
  elif kind=='employment':key=(r.get('talentId'),)
  elif kind=='takes':key=(r.get('productionId'),r.get('studioId'))
  elif kind=='datedTakes':key=(r.get('week'),r.get('productionId'),r.get('studioId'))
  elif kind=='cases':key=(r.get('talentId'),r.get('subjectStudioId'))
  else:key=(r.get('talentId'),r.get('issuerStudioId'))
  occurrence=seen[key];seen[key]+=1;out.append((key+(occurrence,),i,r))
 return out
def family(state,kind):
 if kind=='market':return state['talentMarket']['receipts']
 if kind=='cases':return state['talentMarket']['cases']
 if kind=='proposals':return state['talentMarket']['proposals']
 if kind=='industry':return state['hollywood']['receipts']
 if kind=='employment':return state['hollywood']['employment']
 return state['firstTakes']
def terminal_check(result,left,right,sa,sb):
 for role,row,summ in [('E0G',left,sa),('EBG',right,sb)]:
  state=row['originalState'];market=state['talentMarket']['receipts'];industry=state['hollywood']['receipts'];employment=state['hollywood']['employment'];takes=state['firstTakes']
  settled=[[r.get('eventId'),r.get('kind'),r.get('week'),r.get('talentId'),r.get('studioId'),r.get('reasons'),r.get('dropped')] for r in market if r.get('kind') in ('settled','declined','expired')]
  pre={'settlement':settled,'receipts':market,'employment':employment,'takes':takes};d=digests(pre)
  assert material_equal(pre,result['terminal']['protected'][role]['preimages']) and material_equal(d,result['terminal']['protected'][role]['digests'])
  assert all(d[k]==summ['terminal'][k] for k in d)
  assert (len(market),len(industry),len(employment),len(takes))==(summ['terminal']['marketReceiptRows'],summ['terminal']['industryReceiptRows'],summ['terminal']['employmentRows'],summ['terminal']['firstTakeRows'])
 for kind,tab in result['terminal'].items():
  if kind=='protected':continue
  l=identity(family(left['originalState'],kind),kind);r=identity(family(right['originalState'],kind),kind)
  assert material_equal(tab['leftOrder'],[list(x[0]) for x in l]) and material_equal(tab['rightOrder'],[list(x[0]) for x in r])
  lm={x[0]:x for x in l};rm={x[0]:x for x in r};assert len(lm)==len(l) and len(rm)==len(r)
  assert [tuple(x['identity']) for x in tab['rows']]==list(lm)+[x for x in rm if x not in lm]
  for x in tab['rows']:
   key=tuple(x['identity']);a=lm.get(key);b=rm.get(key)
   status='MISSING_LEFT' if a is None else 'MISSING_RIGHT' if b is None else 'MATCHED' if strict_equal(a[2],b[2]) else 'CHANGED'
   assert x['status']==status and x['leftOrder']==(a[1] if a else None) and x['rightOrder']==(b[1] if b else None)
   assert material_equal(x['left'],(a[2] if a else None)) and material_equal(x['right'],(b[2] if b else None))
def main():
 START=globals().get('_BOOTSTRAP_START')
 remaining_budget(START,time.monotonic())
 assert not os.path.lexists(OUT.parent) and not os.path.lexists(OUT)
 assert len(EXACT_SHA)==64 and all(c in '0123456789abcdef' for c in EXACT_SHA),'exact review not frozen'
 # The authenticated bootstrap's SIGALRM and ITIMER_REAL stay armed: replacing
 # either timer here would extend its deadline at the measurement boundary.
 assert remaining_budget(START,time.monotonic())>0
 guard();assert 'lane-run audit.lane.log,' in read_regular(S/'HEAVY-LANE-LOCK',10000).decode()
 assert sha(pinned(FILLED/'LAUNCH.command',FILLED_COMMAND_SHA,100000))==FILLED_COMMAND_SHA
 assert sha(pinned(FILLED/'BINDING.json',FILLED_BINDING_SHA,100000))==FILLED_BINDING_SHA
 assert json.loads(pinned(STATIC,STATIC_SHA,10000))['decision']=='ACCEPT_STATIC_ONLY'
 assert pinned(P13A_STOP,'03ba66a7e680b217bf3f900dd4234a9832f0657fbc3970bce4d01067be97902d',10000)
 assert json.loads(pinned(P13A_OBSERVED,'3b35042d40b14a6da67589667ff57df75f5af3b953cb496e4331de703ee41ec5',10000))['decision']=='ACCEPT_OBSERVED_DIAGNOSTIC_ONLY'
 exact=json.loads(pinned(EXACT,EXACT_SHA,10000))
 assert exact['decision']=='ACCEPT_EXACT_ONLY' and exact['commandSha256']==FILLED_COMMAND_SHA and exact['bindingSha256']==FILLED_BINDING_SHA
 assert exact['sourceHead']==HEAD and exact['sourceTree']==TREE and exact['evidenceTip']==TIP and exact['runId']=='20261008-bonly-adoption-r1'
 lane_meta=read_regular(LANE,100000);lane_exit=parse_lane_meta(lane_meta)
 inp=json.loads(pinned(INPUT,INPUT_SHA,100000));design=json.loads(pinned(DESIGN,DESIGN_SHA,100000))
 assert inp['sourceHead']==HEAD and inp['sourceTree']==TREE and inp['currentEvidenceTip']==TIP
 stage_auth=design['stages']['32']['authority']
 for item in stage_auth.values():
  authority=json.loads(pinned(pathlib.Path(item['path']),item['sha256'],10000));assert authority['decision']==item['decision']
 eob=inp['ebg']['observedReceipt'];er=json.loads(pinned(pathlib.Path(eob['path']),eob['sha256'],10000))
 assert er['decision']=='ACCEPT_OBSERVED_EBG_ADOPTION_CLEAN_EXPLORATORY_ONLY'
 remote=inp['stage35RemoteObserved'];sr=json.loads(pinned(pathlib.Path(remote['path']),remote['sha256'],10000))
 assert sr['decision']=='ACCEPT_OBSERVED_REMOTE_EVIDENCE_BYTES_ONLY' and sr['remoteCommit']==TIP
 assert RECEIPT.exists(),'missing comparator receipt; inspect lane/failure separately'
 receipt_raw=read_regular(RECEIPT,100000);rec=parse_json(receipt_raw)
 if rec.get('status')=='STOP':
  assert lane_exit!=0,'STOP/lane contradiction'
  audit={'decision':'REJECT_OBSERVED_STOP','runId':rec.get('runId'),'reason':rec.get('reason'),'receiptSha256':sha(receipt_raw),'laneMetaSha256':sha(lane_meta),'laneExit':lane_exit,'partialResultExists':RESULT.exists(),'claimLimit':'Failed comparator leaf; no diagnostic result admission.'}
  prepare_output(OUT)
  with OUT.open('x') as f:json.dump(audit,f,indent=2,sort_keys=True);f.write('\n')
  return
 assert lane_exit==0,'comparator lane child failed'
 assert sorted(p.name for p in LEAF.iterdir())==['RECEIPT.json','RESULT.json'],'unexpected output/partial cleanup'
 assert rec['status']=='COMPLETED_DIAGNOSTIC_UNREVIEWED' and rec['runId']=='20261008-bonly-adoption-r1'
 assert rec['resultSha256']==RESULT_SHA,'receipt/result frozen-hash mismatch'
 raw=pinned(RESULT,RESULT_SHA,268435456);result=parse_json(raw)
 assert result['schema']=='1370-e0g-ebg-b-bundle-adoption-full-save46-r2' and result['classification']=='DIAGNOSTIC_ONLY_NOT_1363_ACCEPTANCE'
 assert result['seed']=='p13-public-commercial-adoption' and result['boundaries']==len(result['boundaryIndex'])==417
 assert result['inputsSha256']==INPUT_SHA and result['designInputsSha256']==DESIGN_SHA and result['stage32ArchiveSha256']==inp['e0gArchiveSha256']
 assert result['ebgObservedReceiptSha256']==inp['ebg']['observedReceipt']['sha256'] and result['stage35RemoteObservedSha256']==inp['stage35RemoteObserved']['sha256']
 assert result['source']['mapSha256']==design['roleSourceMap']['sha256'] and len(result['source']['changed'])==8 and result['source']['inherited']==180
 assert [x['week'] for x in result['boundaryIndex']]==list(range(417)) and result['unobservedInternalPredicates']=='UNOBSERVED'
 stage=design['stages']['32'];parts=stage['parts'];tar=bytearray()
 for part in parts:
  b=pinned(pathlib.Path(part['path']),part['sha256'],67108864);assert len(b)==part['bytes'];tar.extend(b);guard()
 assert len(tar)==stage['archive']['bytes'] and sha(tar)==stage['archive']['sha256']
 with tarfile.open(fileobj=io.BytesIO(tar),mode='r:') as tf:
  member=stage['members']['target/boundaries.ndjson.gz'];e0=read_tar_member(tf,'target/boundaries.ndjson.gz',member['sha256'],member['bytes'])
  member=stage['members']['target/summary.json'];sa=parse_json(read_tar_member(tf,'target/summary.json',member['sha256'],member['bytes']))
 assert len(e0)==stage['members']['target/boundaries.ndjson.gz']['bytes'] and sha(e0)==stage['members']['target/boundaries.ndjson.gz']['sha256']
 ebgpin=inp['ebg']['boundaries'];ebg=pinned(pathlib.Path(ebgpin['path']),ebgpin['sha256'],167772160)
 sb=parse_json(pinned(pathlib.Path(inp['ebg']['summary']['path']),inp['ebg']['summary']['sha256'],10000))
 index=result['boundaryIndex'];left,left_active,left_bytes=stream_rows(e0,index,'E0G',sa);right,right_active,right_bytes=stream_rows(ebg,index,'EBG',sb)
 assert left_active==0 and result['equalPayloadBoundaries']==sum(not x['payloadDifferentPaths'] for x in index)
 assert result['equalCompleteRows']==sum(not x['payloadDifferentPaths'] and not x['observerMetadataDifferentPaths'] for x in index)
 assert dict(collections.Counter(p.split('[')[0] for x in index for p in x['payloadDifferentPaths']))==result['pathFamilies']
 firsts={}
 for week,x in enumerate(index):
  paths=x['payloadDifferentPaths']
  for label,pred in [('state',lambda p:p.startswith('$.originalState')),('B',lambda p:'costCutting' in p),('cash',lambda p:'cash' in p.lower()),('market',lambda p:'talentMarket.receipts' in p),('industry',lambda p:'hollywood.receipts' in p),('employment',lambda p:'hollywood.employment' in p),('takes',lambda p:'firstTakes' in p),('rng',lambda p:'rng' in p.lower())]:
   if label not in firsts:
    found=next((p for p in paths if pred(p)),None)
    if found:firsts[label]={'week':week,'path':found}
 assert material_equal(result['firstObserved'],{k:firsts.get(k,'NO_OBSERVED_DIFFERENCE') for k in ('state','B','cash','market','industry','employment','takes','rng')})
 for x in index:
  paths=x['payloadDifferentPaths'];first=x['firstPayloadDifference'];assert (first is None)==(not paths)
  if first is not None:assert first['path'] in paths
 terminal_check(result,left,right,sa,sb)
 guard();assert parse_lane_meta(read_regular(LANE,100000))==0
 audit={'schema':'1370-e0g-ebg-b-only-adoption-r2-independent-observed-audit-r6','decision':'ACCEPT_OBSERVED_DIAGNOSTIC_ONLY','runId':'20261008-bonly-adoption-r1','resultSha256':sha(raw),'resultBytes':len(raw),'boundaryRows':417,'equalPayloadBoundaries':result['equalPayloadBoundaries'],'leftLogicalBytes':left_bytes,'rightLogicalBytes':right_bytes,'leftActiveEpisodes':left_active,'rightActiveEpisodes':right_active,'firstObserved':result['firstObserved'],'sourceHead':HEAD,'sourceTree':TREE,'evidenceTip':TIP,'claimLimit':'Adoption B-bundle diagnostic only; internal predicates and 1363 acceptance remain unresolved.'}
 prepare_output(OUT)
 with OUT.open('x') as f:json.dump(audit,f,indent=2,sort_keys=True);f.write('\n')
if __name__=='__main__':main()
