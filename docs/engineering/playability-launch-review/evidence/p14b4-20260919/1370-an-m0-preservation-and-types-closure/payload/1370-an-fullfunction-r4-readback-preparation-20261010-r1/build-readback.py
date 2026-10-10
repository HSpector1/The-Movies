import ast,difflib,hashlib,json,os,stat
from pathlib import Path
BASE=Path(__file__).parent;OUT=Path('/Users/zacheryspector/studio-scratch/1370-an-fullfunction-r4-root-readback-source-20261010-r1')
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(r):
 p=Path(r['path']);assert p.resolve(strict=True)==p and stat.S_ISREG(p.lstat().st_mode) and p.lstat().st_nlink==1 and p.stat().st_size<=1024*1024
 b=p.read_bytes();assert role(p)==r,(role(p),r)
 return b
def write(n,b):
 if isinstance(b,str):b=b.encode('utf-8')
 p=OUT/n;fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 try:os.write(fd,b);os.fsync(fd)
 finally:os.close(fd)
 assert p.read_bytes()==b
 return role(p)
def doc(n,d):return write(n,json.dumps(d,sort_keys=True,indent=2)+'\n')
data=json.loads((BASE/'INPUT.json').read_bytes());pins=json.loads(read(data['basePins']));review=json.loads(read(data['baseReview']))
assert review['executionAuthorization'] is False and review['concreteFindings']==[] and review['sourceManifest']==data['basePins']
for r in pins['files'].values():read(r)
route=json.loads(read(data['routePins']));c=json.loads(read(data['config']))
assert route['files']['CONFIG.json']==data['config'] and c['executionAuthorization'] is False and c['actualGrant'] is None and c['actualSourceReview'] is None
assert c['runId']=='20261010-m0-fullfunction-after-an-r4' and c['outputPath']=='/Users/zacheryspector/studio-scratch/1370-an-m0-fullfunction-qualification-results-20261010-r4' and c['recorderOutputPath']=='/Users/zacheryspector/studio-scratch/1370-an-m0-fullfunction-qualification-recorder-results-20261010-r4' and c['laneLog']=='/Users/zacheryspector/studio-scratch/c0-m0-fullfunction-20261010-r4.lane.log'
aliases=['CONFIG.json','run-fullfunction.py','run-fullfunction.mjs','record-fullfunction.py','CORE-TEST-TEMPLATE.ts','CONFIG-TEMPLATE.mts','FULL-BODY-CONTROLS-TEMPLATE.ts','exact-json.mjs','run-parser-controls.mjs','canonical-typescript-transform.mjs','m0WiringProbe.ts','RESOLUTION-SOURCE-BINDING.json']
for n in aliases:read(route['files'][n])
original=read(pins['files']['read-fullfunction.py']).decode('utf-8','strict');updated=original
for old,new in data['changes']:
 assert updated.count(old)==1 and new not in updated,(old,updated.count(old))
 updated=updated.replace(old,new)
restored=updated
for old,new in reversed(data['changes']):restored=restored.replace(new,old)
assert restored==original
def helpers(s):return {n.name:ast.dump(n,include_attributes=False) for n in ast.parse(s).body if isinstance(n,ast.FunctionDef) and n.name!='main'}
assert helpers(updated)==helpers(original)
assert ast.dump(ast.parse(restored),include_attributes=False)==ast.dump(ast.parse(original),include_attributes=False)
OUT.mkdir(mode=0o700);files={}
files['BASELINE-read-fullfunction.py']=write('BASELINE-read-fullfunction.py',original)
files['read-fullfunction.py']=write('read-fullfunction.py',updated)
for name,a,b in [('read-fullfunction.forward.diff',original,updated),('read-fullfunction.inverse.diff',updated,original)]:files[name]=write(name,''.join(difflib.unified_diff(a.splitlines(keepends=True),b.splitlines(keepends=True),fromfile='original/read-fullfunction.py',tofile='fresh/read-fullfunction.py')))
proof={'schema':'1370-finite-fullfunction-r4-root-readback-narrow-source-proof/v1','predecessor':data['basePins'],'predecessorSource':pins['files']['read-fullfunction.py'],'predecessorIndependentRootReview':data['baseReview'],'routeSourceManifest':data['routePins'],'routeConfig':data['config'],'fiveLiteralSubstitutions':data['changes'],'wholeLiteralInverseByteExact':True,'allHelperFunctionsAstExact':True,'helperFunctionCount':len(helpers(original)),'allPassStopProofNullPhaseAndOwnershipClausesUnchanged':True,'twelveRuntimeReviewAliases':aliases,'runtimeExecuted':False,'executionAuthorization':False,'futureActualArguments':None,'newThresholdParsingOrCapWaiver':False,'inheritedR9ErrorLabelQualification':'Diagnostic assertion labels R9_* are unchanged documentary strings; actual enforced path/config SHA/manifest SHA and twelve aliases bind R11 exactly.','allManifestBytesAndHashesFromFinalRetainedReadback':True}
files['SOURCE-PROOF.json']=doc('SOURCE-PROOF.json',proof)
recipe=json.loads(read(pins['files']['RECIPE.json']));recipe['argv'][3]=str(OUT/'read-fullfunction.py');recipe['parent']='1370-an-m0-fullfunction-parent-recorded-20261010-r4';recipe['scope']='Finite root retained-evidence readback and root-scoped known-ID absence after actual R11 fullfunction R4; no private inventories or gameplay execution.';recipe['actualArguments']=None;recipe['runtimeSourceReviewAliases']=aliases;recipe['runtimeSourceReviewFuture']=None
files['RECIPE.json']=doc('RECIPE.json',recipe)
files['LESSONS.txt']=write('LESSONS.txt','Fresh readback paths and exact R11 config/manifest hashes preserve previous actual STOP attempts. Bind all twelve review aliases, including diagnostic probe and resolution binding. Preserve original PASS/STOP, null-prefix/missing-proof, phase/stream, specific-mutant and known-ID ownership clauses. Trace overflow remains STOP even if earlier generation passed; actual framework report retains small first-refusal diagnostics. No generic failure is expected RED, no cap waiver or automatic replay.\n')
manifest=doc('SOURCE-PINS.json',{'schema':'1370-fullfunction-root-readback-source-pins/v1','files':files,'executionAuthorization':False})
for n,r in files.items():assert role(OUT/n)==r
seal=doc('SEAL.json',{'schema':'1370-finite-readback-source-seal/v1','sourceManifest':manifest,'payloadCount':len(files),'readbackAllPayloadsVerified':True,'executionAuthorization':False})
for n in list(files)+['SOURCE-PINS.json','SEAL.json']:os.chmod(OUT/n,0o444)
os.chmod(OUT,0o555)
print(json.dumps({'sourceManifest':manifest,'source':files['read-fullfunction.py'],'sourceProof':files['SOURCE-PROOF.json'],'recipe':files['RECIPE.json'],'seal':seal,'wholeLiteralInverseByteExact':True,'allHelperFunctionsAstExact':True}))
