"""Dependency-injected public controls. No guard, protected-tree or game imports."""
from pathlib import Path
import hashlib,json,sys

TARGET='STOP: full baseline byte/metadata/inode/root equality failed'

def runGuardDiagnosticControls(api, outputRoot):
 """Caller authenticates the actual module before injecting these exact exports."""
 differences=api['differences'];run_original=api['run_original'];emit=api['emit']
 assert api['MAP_CAP']==16777216 and api['SUMMARY_CAP']==32768
 out=Path(outputRoot);assert out.is_absolute() and out.resolve(strict=True)==out and out.is_dir()
 results=[]
 def case(identifier,expected,predicate,body):
  body();results.append({'id':identifier,'expected':expected,'predicate':predicate,'verdict':'ACCEPT_POSITIVE' if expected=='GREEN' else 'ACCEPT_SPECIFIC_REFUSAL'})
 def thrown(fn):
  try:fn()
  except BaseException as e:return e
  raise AssertionError('EXPECTED_EXACT_FAILURE_NOT_OBSERVED')
 def complete_typed():
  r=differences({'b':True,'n':None,'x':[1,2],'gone':7},{'b':1,'n':False,'x':[1,3,4],'new':8})
  assert r['differenceCoverageComplete'] is True
  assert r['differences']==[
   {'path':['new'],'before':{'type':'missing'},'after':{'type':'int','value':8}},
   {'path':['b'],'before':{'type':'bool','value':True},'after':{'type':'int','value':1}},
   {'path':['n'],'before':{'type':'NoneType','value':None},'after':{'type':'bool','value':False}},
   {'path':['x',1],'before':{'type':'int','value':2},'after':{'type':'int','value':3}},
   {'path':['x',2],'before':{'type':'missing'},'after':{'type':'int','value':4}},
   {'path':['gone'],'before':{'type':'int','value':7},'after':{'type':'missing'}}]
 def string_identity():
  old={'':0,'/':0,'~':0,'0':0,'a/b':0,'a~b':0};new={k:1 for k in old}
  r=differences(old,new);assert [x['path'] for x in r['differences']]==[[k] for k in old]
  assert all(type(x['path'][0]) is str for x in r['differences']) and r['differenceCoverageComplete'] is True
 def unchanged():
  r=differences({'map':{'k':[None,True,1,'é']}},{'map':{'k':[None,True,1,'é']}})
  assert r['differences']==[] and r['differenceCoverageComplete'] is True
 def long_scalar():
  text='é'*129;r=differences({'hash':text},{'hash':'b'})
  before=r['differences'][0]['before'];assert before=={'type':'str','utf8Bytes':258,'sha256':hashlib.sha256(text.encode()).hexdigest()}
  assert text not in json.dumps(r) and r['differenceCoverageComplete'] is True
 def changes(count,complete):
  r=differences({str(i):0 for i in range(count)},{str(i):1 for i in range(count)})
  assert len(r['differences'])==min(count,32) and r['differenceCoverageComplete'] is complete
  assert [x['path'] for x in r['differences']]==[[str(i)] for i in range(min(count,32))]
 def visits(count,complete):
  r=differences([0]*count,[0]*count);assert r['differences']==[] and r['visitedNodes']==65536 and r['differenceCoverageComplete'] is complete
 case('complete_typed_changed_paths','GREEN','Exact changed-path order, missing distinction and bool/int type identity.',complete_typed)
 case('literal_string_key_identity','GREEN','Keys including slash, tilde, empty and numeric strings remain exact path components.',string_identity)
 case('unchanged_map_empty_summary','GREEN','Identical complete maps produce no differences.',unchanged)
 case('long_scalar_bounded_summary','GREEN','Large scalar uses exact UTF8 length/hash, never raw oversized text.',long_scalar)
 case('exact_32_difference_boundary','GREEN','All32 changed paths retained with complete=true.',lambda:changes(32,True))
 case('difference_33_explicitly_partial','RED','33rd difference cannot be labelled a complete comparison.',lambda:changes(33,False))
 case('exact_65536_visit_boundary','GREEN','65536-node traversal remains complete.',lambda:visits(65535,True))
 case('visit_65537_explicitly_partial','RED','Traversal beyond65536 cannot be labelled complete.',lambda:visits(65536,False))

 scanner={'path':'/synthetic/original-scanner.py','bytes':17,'sha256':'a'*64}
 argv=[scanner['path'],'receipt','hash','decision','leaf','postflight','label','baseline','baselinehash','2']
 base={'schema':'1370-original-shared-postflight-exception-diagnostic/v1','retrospective54871Acceptance':False,'protectionAccepted':False,'rawPsFdIncluded':False}
 def exercise(variant='target',writerFailure=None):
  E=RuntimeError(TARGET) if variant!='wrong_type' else ValueError(TARGET)
  if variant=='wrong_message':E=RuntimeError('STOP: unrelated predicate')
  filename='/synthetic/wrong.py' if variant=='wrong_filename' else scanner['path']
  function='other' if variant=='wrong_function' else 'main'
  fileValue='/synthetic/wrong.py' if variant=='wrong_file_global' else scanner['path']
  line=153 if variant=='wrong_line' else 154
  actual={} if variant=='equal_maps' else {'immutableKey':2}
  old={} if variant=='equal_maps' else {'immutableKey':1}
  if variant=='bad_locals':actual=[]
  if variant=='bad_baseline_immutable':old=[]
  ns={'__file__':fileValue,'__name__':'wrong' if variant=='wrong_name_global' else '__main__','_actual':actual,'_old':old,'_E':E}
  body=[f'def {function}():',' immutable=_actual',' baseline={"immutable":_old}']
  while len(body)<line-1:body.append(' pass')
  body.append(' return main(0) if depth else (_ for _ in ()).throw(_E)' if variant=='duplicate_target_frames' else ' raise _E')
  if variant=='duplicate_target_frames':body[0]='def main(depth=1):'
  exec(compile('\n'.join(body)+'\n',filename,'exec'),ns)
  expectedCode=ns[function].__code__
  if variant=='impostor_main_code':
   other=dict(ns);modified=list(body);modified[1]=' immutable=dict(_actual)'
   exec(compile('\n'.join(modified)+'\n',filename,'exec'),other);ns=other
   assert ns[function].__code__!=expectedCode
  writes=[];calls=[]
  def writer(path,value,cap):
   # Assertions occur outside this callback: wrapper intentionally contains writer errors.
   writes.append((path.name,value,cap))
   if writerFailure==path.name:raise writerE
   return {'path':str(path),'bytes':1,'sha256':'b'*64}
  writerE=OSError('specific synthetic writer failure')
  def runner(path,run_name):
   calls.append((path,run_name,list(sys.argv)));ns[function]()
  def authenticate(path):
   return {**scanner,'sha256':'c'*64} if variant=='wrong_source_role' else scanner
  saved=sys.argv
  try:caught=thrown(lambda:run_original(scanner,argv,out,base,runner=runner,writer=writer,authenticate=authenticate,expected_main_code=expectedCode))
  finally:sys.argv=saved
  assert caught is E
  assert calls==[(scanner['path'],'__main__',argv)]
  if variant in ('bad_locals','bad_baseline_immutable','equal_maps','wrong_source_role'):assert writes==[]
  elif variant=='target':
   assert writes[0][0]=='ACTUAL-IMMUTABLE-LOCAL.json' and writes[0][1]==actual and writes[0][2]==16777216
   if writerFailure!='ACTUAL-IMMUTABLE-LOCAL.json':
    assert writes[1][0]=='DIAGNOSTIC-SUMMARY-LOCAL.json' and writes[1][2]==32768
    info=writes[1][1];assert info['availability']=='available' and info['exactFinalPredicate'] is True and info['differenceCoverageComplete'] is True
    assert info['differences']==[{'path':['immutableKey'],'before':{'type':'int','value':1},'after':{'type':'int','value':2}}]
  else:
   assert len(writes)==1 and writes[0][0]=='DIAGNOSTIC-SUMMARY-LOCAL.json'
   assert writes[0][1]['availability']=='unavailable' and writes[0][1]['exactFinalPredicate'] is False and writes[0][1]['actualImmutable'] is None
 case('target_stop_exact_exception_and_argv','RED','Actual exact target frame emits full map/summary and rethrows the identical original exception; runpy argv unchanged.',exercise)
 for variant in ['wrong_message','wrong_type','wrong_filename','wrong_function','wrong_line','wrong_file_global','wrong_name_global','duplicate_target_frames','impostor_main_code']:
  case(variant+'_no_false_attribution','RED','Unrelated exception/frame gets unavailable metadata and no actual-map attribution; exact original exception survives.',lambda v=variant:exercise(v))
 for variant in ['bad_locals','bad_baseline_immutable','equal_maps','wrong_source_role']:
  case(variant+'_original_exception_preserved','RED','Invalid frame premise/source role cannot create mismatch evidence or replace original exception.',lambda v=variant:exercise(v))
 for name in ['ACTUAL-IMMUTABLE-LOCAL.json','DIAGNOSTIC-SUMMARY-LOCAL.json']:
  case(('map' if name.startswith('ACTUAL') else 'summary')+'_write_failure_original_wins','RED','Explicit diagnostic writer failure cannot replace exact original target exception.',lambda n=name:exercise(writerFailure=n))
 def later_return():
  writes=[];saved=sys.argv
  try:result=run_original(scanner,argv,out,base,runner=lambda path,run_name:None,writer=lambda p,v,c:writes.append((p.name,v,c)),authenticate=lambda p:scanner,expected_main_code=later_return.__code__)
  finally:sys.argv=saved
  assert result is None and len(writes)==1
  info=writes[0][1];assert info['status']=='ORIGINAL_SCANNER_RETURNED_ON_LATER_DIAGNOSTIC_RUN' and info['availability']=='comparison-passed-on-later-run' and info['retrospective54871Acceptance'] is False and info['actualImmutable'] is None
 case('later_return_not_retrospective_acceptance','GREEN','Later original return is distinct and cannot repair54871.',later_return)
 def boundary(cap,over,label):
  path=out/(label+'.json');value='x'*(cap-3+int(over))
  if over:
   e=thrown(lambda:emit(path,value,cap));assert type(e) is AssertionError and str(e)=='DIAGNOSTIC_OUTPUT_BOUND'
   assert not path.exists() and path.with_name(path.name+'.partial').exists()
   assert path.with_name(path.name+'.partial').stat().st_size<=cap
  else:
   r=emit(path,value,cap);assert r['bytes']==cap and path.stat().st_size==cap and path.read_bytes()==('"'+value+'"\n').encode()
 for cap,label in [(16777216,'immutable'),(32768,'summary')]:
  case(label+'_exact_byte_boundary','GREEN','Actual streaming emitter includes newline in exact budget.',lambda c=cap,l=label:boundary(c,False,l+'_exact'))
  case(label+'_one_byte_over_refuses','RED','Actual emitter refuses cap+1 and never publishes complete output.',lambda c=cap,l=label:boundary(c,True,l+'_over'))
 def encoding_failure():
  # The real emitter is used, with unsupported metadata; target exception still wins.
  E=RuntimeError(TARGET);ns={'__file__':scanner['path'],'__name__':'__main__','_E':E}
  lines=['def main():',' immutable={"bad":object()}',' baseline={"immutable":{"bad":None}}']
  while len(lines)<153:lines.append(' pass')
  lines.append(' raise _E');exec(compile('\n'.join(lines)+'\n',scanner['path'],'exec'),ns)
  saved=sys.argv
  try:caught=thrown(lambda:run_original(scanner,argv,out,base,runner=lambda p,run_name:ns['main'](),writer=emit,authenticate=lambda p:scanner,expected_main_code=ns['main'].__code__))
  finally:sys.argv=saved
  assert caught is E and not (out/'ACTUAL-IMMUTABLE-LOCAL.json').exists()
 case('actual_encoding_failure_original_wins','RED','Real JSON encoding failure leaves no complete map and cannot replace original target exception.',encoding_failure)
 def exclusive():
  p=out/'exclusive.json';first=emit(p,{'x':1},32768)
  e=thrown(lambda:emit(p,{'x':2},32768));assert type(e) is AssertionError and p.read_bytes()==b'{"x":1}\n'
  assert p.with_name(p.name+'.partial').read_bytes()==b'{"x":2}\n'
  assert first['sha256']==hashlib.sha256(p.read_bytes()).hexdigest()
 case('actual_emit_never_overwrites_complete_output','RED','Existing complete output stays byteexact; exclusive partial publication refuses replacement.',exclusive)
 def nonstring_keys():
  for index,key in enumerate([True,1,None,('tuple',)]):
   path=out/('invalid-key-'+str(index)+'.json')
   e=thrown(lambda:emit(path,{'nested':{key:'value'}},32768))
   assert type(e) is AssertionError and str(e)=='DIAGNOSTIC_METADATA_KEY'
   assert not path.exists() and not path.with_name(path.name+'.partial').exists()
 case('nonstring_metadata_keys_refuse_before_write','RED','Actual emitter rejects bool/int/None/tuple keys before JSON coercion and before creating output.',nonstring_keys)
 return {'schema':'1370-original-shared-postflight-diagnostic-independent-controls-result/v1','status':'PURE_SHARED_POSTFLIGHT_EXCEPTION_DIAGNOSTIC_CONTROLS_COMPLETE_UNADOPTED','caseCount':len(results),'positiveCount':sum(r['expected']=='GREEN' for r in results),'specificNegativeCount':sum(r['expected']=='RED' for r in results),'results':results,'originalGuardExecuted':False,'protectedTreesReadOrWritten':False,'game':False,'executionAuthorization':False}
