"""Root-granted original scanner wrapper. Never converts an original STOP to PASS."""
import hashlib,json,os,runpy,stat,sys,types
from pathlib import Path
HERE=Path(__file__).resolve().parent
MAP_CAP=16777216;SUMMARY_CAP=32768
def role(p,cap=16777216):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1 and s.st_size<=cap
 b=p.read_bytes();after=p.lstat();assert (s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)==(after.st_dev,after.st_ino,after.st_mode,after.st_nlink,after.st_size,after.st_mtime_ns,after.st_ctime_ns)
 return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
def load(r,cap=131072):
 assert role(r['path'],cap)==r;return json.loads(Path(r['path']).read_bytes())
def emit(p,v,cap):
 # Metadata JSON must preserve exact key identities; native JSON key coercion is forbidden.
 root=object();stack=[iter([(root,v)])];nodes=0
 while stack:
  try:key,value=next(stack[-1])
  except StopIteration:stack.pop();continue
  nodes+=1;assert nodes<=cap,'DIAGNOSTIC_OUTPUT_BOUND'
  if key is not root:assert type(key) is str,'DIAGNOSTIC_METADATA_KEY'
  if type(value) is dict:stack.append(iter(value.items()))
  elif type(value) is list:stack.append(iter((root,x) for x in value))
 partial=p.with_name(p.name+'.partial');fd=os.open(partial,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600);count=0
 try:
  with os.fdopen(fd,'wb') as f:
   for chunk in json.JSONEncoder(sort_keys=True,separators=(',',':'),ensure_ascii=True,allow_nan=False).iterencode(v):
    b=chunk.encode();assert count+len(b)+1<=cap,'DIAGNOSTIC_OUTPUT_BOUND';f.write(b);count+=len(b)
   f.write(b'\n');f.flush();os.fsync(f.fileno())
  assert not os.path.lexists(p);os.rename(partial,p);p.chmod(0o444);return role(p,cap)
 except BaseException:
  if partial.exists():partial.chmod(0o444)
  raise
def scalar(v):
 if v is MISSING:return {'type':'missing'}
 if isinstance(v,str):
  b=v.encode();return {'type':'str','value':v} if len(b)<=256 else {'type':'str','utf8Bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
 if v is None or type(v) in (bool,int,float):return {'type':type(v).__name__,'value':v}
 return {'type':type(v).__name__}
MISSING=object()
def differences(old,new):
 rows=[];visited=0;complete=True;stack=[([],old,new)]
 while stack:
  if visited>=65536:complete=False;break
  path,a,b=stack.pop();visited+=1
  if type(a) is dict and type(b) is dict:
   # Existing metadata maps only. No protected filesystem or raw PS/FD reads.
   for k in reversed(list(a)):
    stack.append((path+[k],a[k],b.get(k,MISSING)))
   for k in reversed(list(b)):
    if k not in a:stack.append((path+[k],MISSING,b[k]))
  elif type(a) is list and type(b) is list:
   for i in range(max(len(a),len(b))-1,-1,-1):stack.append((path+[i],a[i] if i<len(a) else MISSING,b[i] if i<len(b) else MISSING))
  elif type(a) is not type(b) or a!=b:
   if len(rows)<32:rows.append({'path':path,'before':scalar(a),'after':scalar(b)})
   else:complete=False;break
 return {'differences':rows,'visitedNodes':visited,'differenceCoverageComplete':complete,'aggregateDigestCannotIdentifyIndividualLeaf':True}
def run_original(scanner,original_args,out,base,runner=runpy.run_path,writer=emit,authenticate=role,expected_main_code=None):
 """Actual orchestration also used by finite synthetic controls; defaults are pinned runtime operations."""
 if expected_main_code is None:
  raw=Path(scanner['path']).read_bytes();assert authenticate(scanner['path'])==scanner and len(raw)==scanner['bytes'] and hashlib.sha256(raw).hexdigest()==scanner['sha256']
  compiled=compile(raw,scanner['path'],'exec',dont_inherit=True);mains=[x for x in compiled.co_consts if isinstance(x,types.CodeType) and x.co_name=='main'];assert len(mains)==1;expected_main_code=mains[0]
 assert isinstance(expected_main_code,types.CodeType)
 sys.argv=original_args
 try:
  runner(scanner['path'],run_name='__main__')
 except BaseException as original:
  try:
   assert authenticate(scanner['path'])==scanner
   frames=[];tb=original.__traceback__
   while tb:
    f=tb.tb_frame
    if f.f_code==expected_main_code and f.f_code.co_filename==scanner['path'] and f.f_code.co_name=='main' and tb.tb_lineno==154 and f.f_globals.get('__file__')==scanner['path'] and f.f_globals.get('__name__')=='__main__':frames.append(f)
    tb=tb.tb_next
   exact=type(original) is RuntimeError and str(original)=='STOP: full baseline byte/metadata/inode/root equality failed' and len(frames)==1
   info={**base,'status':'ORIGINAL_SCANNER_STOP_DIAGNOSTIC_ONLY','error':{'name':type(original).__name__,'message':str(original)[:1024]},'availability':'unavailable','exactFinalPredicate':exact,'actualImmutable':None}
   if exact:
    local=frames[0].f_locals;assert type(local['immutable']) is dict and type(local['baseline']) is dict and type(local['baseline']['immutable']) is dict
    assert local['baseline']['immutable']!=local['immutable']
    info['actualImmutable']=writer(out/'ACTUAL-IMMUTABLE-LOCAL.json',local['immutable'],MAP_CAP)
    info.update(differences(local['baseline']['immutable'],local['immutable']));info['availability']='available';info['metadataArchiveDisposition']='LOCAL_HASH_SIZE_ONLY'
   writer(out/'DIAGNOSTIC-SUMMARY-LOCAL.json',info,SUMMARY_CAP)
  except BaseException:
   pass
  raise
 assert authenticate(scanner['path'])==scanner
 writer(out/'DIAGNOSTIC-SUMMARY-LOCAL.json',{**base,'status':'ORIGINAL_SCANNER_RETURNED_ON_LATER_DIAGNOSTIC_RUN','availability':'comparison-passed-on-later-run','actualImmutable':None,'retrospective54871Acceptance':False},SUMMARY_CAP)
def main():
 assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
 gr=role(sys.argv[1],131072);assert gr['sha256']==sys.argv[2];g=load(gr)
 assert g['schema']=='1370-root-original-shared-postflight-diagnostic-grant/v1' and g['executionAuthorization'] is True and g['automaticRetry'] is False
 pins=load(g['sourcePins']);review=load(g['sourceReview']);assert review['decision']=='ACCEPT_STATIC_ORIGINAL_SHARED_POSTFLIGHT_EXCEPTION_DIAGNOSTIC_SOURCE_ONLY' and review['sourceManifest']==g['sourcePins'] and review['concreteFindings']==[] and review['executionAuthorization'] is False
 for r in pins['files'].values():assert role(r['path'])==r
 for name in ('diagnose_shared_post.py','launch_shared_post_diagnostic.py','read_shared_post_diagnostic.py'):assert review['sourcePins'][name]==review['routeSourcePins'][name]==pins['files'][name]
 assert pins['files']['diagnose_shared_post.py']==role(__file__)
 scanner=g['guardSource'];assert role(scanner['path'])==scanner and scanner['sha256']=='51f11d5f9bc55d77ed9e1b7d0bce4d36d1c9af865835617d585629fa8f694f85'
 assert role(g['guardConfig']['path'])==g['guardConfig'] and role(g['baseline']['path'])==g['baseline']
 adoption=load(g['priorFailureAdoption']);assert g['priorFailureAdoption']['sha256']=='1de73d51dd02efad1f9d09202de35a90a7c8aaa76b683275a8179d4333052f88' and adoption['status']=='ROOT_ADOPTED_ACTUAL_SHARED_POSTFLIGHT_IMMUTABLE_STOP_EVIDENCE_ONLY' and adoption['executionAuthorization'] is False
 assert g['guardSource']==adoption['guardSource'] and g['guardConfig']==adoption['guardConfig'] and g['baseline']==adoption['baseline'] and g['priorFailureReadback']==adoption['failureReadback']
 prior=load(g['priorFailureReadback']);assert prior['laneReleased'] is True and prior['fullProtectedPostflightAccepted'] is False and prior['actualOwnedGroupIds']==g['actualPriorOwnedGroupIds'] and prior['actualOwnedPids']==g['actualPriorOwnedPids']
 argv=g['originalScannerArgv'];assert argv[0:3]==[g['requiredPythonPath'],'-I','-B'] and argv[3]==scanner['path']
 cfg=load(g['guardConfig']);assert g['requiredPythonPath']==cfg['requiredPythonPath'] and role(g['requiredPythonPath'])==g['requiredPythonRole'] and g['requiredPythonRole']['sha256']==cfg['requiredPythonSha256'] and Path(sys.executable).resolve(strict=True)==Path(g['requiredPythonPath'])
 before=load(adoption['grant'])['argv'];expected=list(before);expected[9]='diagnostic-shared-postflight-final-equality-r1';expected[12]=','.join(map(str,g['actualPriorOwnedGroupIds']));assert argv==expected
 original_args=argv[3:];assert original_args[5]=='postflight' and original_args[7:9]==[g['baseline']['path'],g['baseline']['sha256']]
 out=Path(g['parentPath']);assert out==Path(gr['path']).parent and out.resolve(strict=True)==out
 base={'schema':'1370-original-shared-postflight-exception-diagnostic/v1','grant':gr,'guardSource':scanner,'guardConfig':g['guardConfig'],'baseline':g['baseline'],'priorFailureReadback':g['priorFailureReadback'],'executionAuthorization':False,'protectionAccepted':False,'priorFailurePreserved':True,'rawPsFdIncluded':False}
 run_original(scanner,original_args,out,base)
if __name__=='__main__':main()
