import ast,difflib,hashlib,json,os,stat
from pathlib import Path
BASE=Path(__file__).parent
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(r):
 p=Path(r['path']);assert p.resolve(strict=True)==p and p.lstat().st_nlink==1 and stat.S_ISREG(p.lstat().st_mode)
 b=p.read_bytes();assert role(p)==r
 return b
def write(p,b):
 if isinstance(b,str):b=b.encode('utf-8')
 fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 try:os.write(fd,b);os.fsync(fd)
 finally:os.close(fd)
 assert p.read_bytes()==b
 return role(p)
def doc(p,d):return write(p,json.dumps(d,sort_keys=True,indent=2)+'\n')
def functions(text):
 return {n.name:ast.dump(n,include_attributes=False) for n in ast.parse(text).body if isinstance(n,(ast.FunctionDef,ast.AsyncFunctionDef))}
result={}
for definition in json.loads((BASE/'INPUT.json').read_bytes())['definitions']:
 kind=definition['kind'];pins=json.loads(read(definition['pins']));review=json.loads(read(definition['review']))
 assert review['executionAuthorization'] is False and review['concreteFindings']==[] and review['sourceManifest']==definition['pins']
 for r in pins['files'].values():read(r)
 out=Path(definition['newDir']);out.mkdir(mode=0o700,exist_ok=True);assert not any(out.iterdir()),'fresh package or own empty preparation directory only'
 payload={};proofs={}
 for name in definition['files']:
  original=read(pins['files'][name]).decode('utf-8','strict');updated=original
  counts=[]
  for old,new in definition['changes']:
   count=updated.count(old);assert count==1,(name,old,count)
   assert new not in updated
   updated=updated.replace(old,new);counts.append({'from':old,'to':new,'occurrences':count})
  restored=updated
  for old,new in reversed(definition['changes']):restored=restored.replace(new,old)
  assert restored==original
  original_functions=functions(original);updated_functions=functions(updated)
  helpers_original={k:v for k,v in original_functions.items() if k!='main'};helpers_updated={k:v for k,v in updated_functions.items() if k!='main'}
  assert helpers_original==helpers_updated
  assert ast.dump(ast.parse(restored),include_attributes=False)==ast.dump(ast.parse(original),include_attributes=False)
  payload['BASELINE-'+name]=write(out/('BASELINE-'+name),original)
  payload[name]=write(out/name,updated)
  for suffix,a,b in [('forward.diff',original,updated),('inverse.diff',updated,original)]:
   diff=''.join(difflib.unified_diff(a.splitlines(keepends=True),b.splitlines(keepends=True),fromfile='old/'+name,tofile='new/'+name))
   payload[name+'.'+suffix]=write(out/(name+'.'+suffix),diff)
  proofs[name]={'originalSource':pins['files'][name],'updatedSource':payload[name],'exactLiteralChanges':counts,'allHelperFunctionsAstExact':True,'helperFunctionCount':len(helpers_original),'mainContainsOnlyListedLiteralChange':True,'wholeInverseNormalizationByteExact':True,'allOtherSourceBytesUnchanged':True}
 proof={'schema':'1370-fullfunction-fresh-attempt4-path-only-source-proof/v1','executionAuthorization':False,'predecessorSourcePins':definition['pins'],'predecessorIndependentSourceReview':definition['review'],'pairs':proofs,'method':'Authenticate predecessor complete manifests/reviews; apply only listed one-occurrence literal replacements; reverse replacements reconstruct entire original UTF-8 bytes and all helper function ASTs remain exact; complete source reversal also reconstructs the original complete AST. Write finalized bytes once, derive every manifest byte count/SHA from retained readback.','candidateExecuted':False,'privateReads':False,'runtimeTests':False,'freshFutureGrant':None,'allPriorStopsPreserved':True}
 payload['SOURCE-PROOF.json']=doc(out/'SOURCE-PROOF.json',proof)
 if kind=='parent':
  recipe={'schema':'1370-fullfunction-fresh-attempt4-parent-source-recipe/v1','executionAuthorization':False,'mode':'Source-only parent path derivative; root owns independent review and actual external once binding.','argv':['<physical pinned PY>','-I','-B',str(out/'launch-fullfunction.py'),'outer','<genuine root binding path>','<binding SHA256>'],'innerArgvOwnedByOriginalOuter':True,'futureBinding':None,'futureSourceReview':None,'futureRouteSourcePins':None,'freshParentPath':'/Users/zacheryspector/studio-scratch/1370-an-m0-fullfunction-parent-recorded-20261010-r4','sourceManifestReviewDecision':'ACCEPT_STATIC_FULLFUNCTION_ONCE_PARENT_SOURCE_ONLY','originalSeparatePreparationSecondsPerStage':60,'originalPreparationCanceledBeforeDirectExec':True,'originalRuntimeSeconds':{'aggregateChild':300,'activeRecorder':320,'wholeRecorder':330},'combinedPreparationRuntimeDeadline':None,'unchangedTestedParserAllowlist':'Only the exact tested F7 helper/control roles matched to actual CONFIG.parserInputs are external; all other route roles local.','noActualExecutionAuthority':True}
 else:
  recipe={'schema':'1370-fullfunction-fresh-attempt4-original-shared-postflight-source-recipe/v1','executionAuthorization':False,'launcherArgv':['<original pinned PY>','-I','-B',str(out/'launch-fullpostflight.py'),'<genuine completed route readback path>','<readback SHA256>'],'readerArgv':['<original pinned PY>','-I','-B',str(out/'read-fullpostflight.py'),'<actual scanner session ID>','<genuine grant SHA256>'],'futureActualRouteReadback':None,'futureSourceReview':None,'freshParentPath':'/Users/zacheryspector/studio-scratch/1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r4','freshEvidenceLabel':'postflight-fullfunction-qualification-r4','sourceManifestReviewDecision':'ACCEPT_STATIC_ORIGINAL_SHARED_FULL_POSTFLIGHT_ADAPTER_AFTER_FULLFUNCTION_PASS_OR_STOP','originalPerCommandTimeoutSeconds':180,'wholeScanDeadline':None,'originalScannerConfigBaselineAndAllPreservationChecksUnchanged':True,'noOriginalHelperOrSharedLaneAcquisition':True,'successOrStopBothPreserved':True,'noGameplayAcceptance':True,'noActualExecutionAuthority':True}
 payload['RECIPE.json']=doc(out/'RECIPE.json',recipe)
 payload['LESSONS.txt']=write(out/'LESSONS.txt','Fresh once-only attempt paths preserve prior failed attempts. Path rebinding must not silently alter clocks, qualified helper ownership, source allowlists, original scanner/config/baseline, proof subjects or scientific limits. Separate preparation deadlines are canceled before direct exec; runtime and protection clocks remain distinct. UTF-8 manifest sizes and SHA derive from finalized actual readback bytes. Future grants and result authority remain null until genuine independently admitted roles.\n')
 schema='1370-fullfunction-parent-source-pins/v1' if kind=='parent' else '1370-fullfunction-shared-fullpostflight-source-pins/v1'
 manifest=doc(out/'SOURCE-PINS.json',{'schema':schema,'executionAuthorization':False,'files':payload})
 for name,r in payload.items():assert role(out/name)==r
 seal=doc(out/'SEAL.json',{'schema':'1370-path-only-adapter-source-seal/v1','sourceManifest':manifest,'payloadCount':len(payload),'readbackAllPayloadsVerified':True,'executionAuthorization':False})
 for name in list(payload)+['SOURCE-PINS.json','SEAL.json']:os.chmod(out/name,0o444)
 os.chmod(out,0o555)
 result[kind]={'sourceManifest':manifest,'seal':seal,'executables':{n:payload[n] for n in definition['files']},'sourceProof':payload['SOURCE-PROOF.json'],'recipe':payload['RECIPE.json'],'allHelperFunctionsAstExact':True,'wholeInverseNormalizationByteExact':True}
doc(BASE/'BUILD-READBACK.json',result)
print(json.dumps(result,sort_keys=True))
