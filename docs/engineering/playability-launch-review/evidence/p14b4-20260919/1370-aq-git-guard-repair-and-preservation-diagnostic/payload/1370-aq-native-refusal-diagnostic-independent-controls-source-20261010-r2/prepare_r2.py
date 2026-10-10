from pathlib import Path
import json,hashlib,difflib
S=Path('/Users/zacheryspector/studio-scratch');B=S/'1370-aq-native-refusal-diagnostic-independent-controls-source-20261010-r1';D=S/'1370-aq-native-refusal-diagnostic-independent-controls-source-20261010-r2'
assert not D.exists();D.mkdir(mode=0o700)
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(n,v):
 b=v if isinstance(v,bytes) else v.encode();p=D/n
 with p.open('xb') as f:f.write(b)
 p.chmod(0o444);assert p.read_bytes()==b;return role(p)
def out(n,v):return put(n,json.dumps(v,sort_keys=True,indent=2)+'\n')
m=json.loads((B/'SOURCE-PINS.json').read_bytes())
for r in m['files'].values():assert role(Path(r['path']))==r
before=(B/'run-native-observer-controls.mjs').read_text()
old="const p=setup(),calls=[];let E;const actual=thrown(()=>runObserverArm(p.diagnostic,()=>{E=originalError(()=>wrap(p).record('inputTuple',canonicalAt(16385)),ROW);if(laterFailure)throw new Error('later body');return 17},()=>{calls.push('end');throw undefined},()=>{calls.push('reset');throw false},line=>{calls.push('write');assert.ok(bytes(line)<=4096);assert.equal(JSON.parse(line).reason,'NATIVE_CANONICAL_NO_FIT');throw new Error('writer')}));assert.equal(actual,E);assert.equal(p.latch.first().error,E);assert.deepEqual(calls,['write','end','reset']);let repeat=0;p.diagnostic.emitFirst(()=>repeat++);assert.equal(repeat,0)"
new="const p=setup(),calls=[],lines=[],writerF=new Error('writer');let E,writerThrown=false;const actual=thrown(()=>runObserverArm(p.diagnostic,()=>{E=originalError(()=>wrap(p).record('inputTuple',canonicalAt(16385)),ROW);if(laterFailure)throw new Error('later body');return 17},()=>{calls.push('end');throw undefined},()=>{calls.push('reset');throw false},line=>{calls.push('write');lines.push(line);writerThrown=true;throw writerF}));assert.equal(actual,E);assert.equal(p.latch.first().error,E);assert.deepEqual(calls,['write','end','reset']);assert.equal(writerThrown,true);assert.equal(lines.length,1);assert.ok(bytes(lines[0])<=4096);assert.ok(lines[0].endsWith('\\n'));const metadata=JSON.parse(lines[0]);assert.equal(metadata.schema,'1370-m0-native-observer-row-diagnostic/v2');assert.equal(metadata.availability,'unavailable');assert.equal(metadata.reason,'NATIVE_CANONICAL_NO_FIT');assert.equal(metadata.canonicalInputBytesLowerBound,16385);assert.equal(metadata.canonicalInputBytes,null);let repeat=0;p.diagnostic.emitFirst(()=>repeat++);assert.equal(repeat,0)"
assert before.count(old)==1;after=before.replace(old,new);assert after.count(new)==1 and after.replace(new,old)==before
roles={}
roles['run-native-observer-controls.mjs']=put('run-native-observer-controls.mjs',after)
roles['MATRIX.json']=put('MATRIX.json',(B/'MATRIX.json').read_bytes())
c=json.loads((B/'CONTRACT.json').read_bytes());c['library']=roles['run-native-observer-controls.mjs'];c['matrix']=roles['MATRIX.json'];roles['CONTRACT.json']=out('CONTRACT.json',c)
for n in ('run-native-observer-controls.mjs','CONTRACT.json'):
 roles['BASELINE-R1-'+n]=put('BASELINE-R1-'+n,(B/n).read_bytes())
 oldtext=(B/n).read_text();newtext=(D/n).read_text();nd=list(difflib.ndiff(oldtext.splitlines(True),newtext.splitlines(True)))
 assert ''.join(difflib.restore(nd,1))==oldtext and ''.join(difflib.restore(nd,2))==newtext
 for label,a,b in [('forward',oldtext,newtext),('inverse',newtext,oldtext)]:roles[n+'.'+label+'.diff']=put(n+'.'+label+'.diff',''.join(difflib.unified_diff(a.splitlines(True),b.splitlines(True),fromfile='R1-'+n,tofile='R2-'+n)))
 roles[n+'.lossless.ndiff']=put(n+'.lossless.ndiff',''.join(nd))
roles['R1-SOURCE-STOP.json']=out('R1-SOURCE-STOP.json',{'schema':'1370-native-refusal-controls-source-stop/v1','sourceManifest':role(B/'SOURCE-PINS.json'),'executionAuthorization':False,'runtimeExecuted':False,'finding':'Metadata assertions inside writer callback are swallowed by actual emitFirst; they cannot enforce bytes/reason.','repair':'Retain emitted line/marker and throw explicit writerF in callback; assert metadata only after runObserverArm throws originalE.','caseId':'v2_lower_bound_E_survives_body_cleanup_writer','matrixUnchanged':True})
roles['SOURCE-CORRECTION.json']=out('SOURCE-CORRECTION.json',{'schema':'1370-native-refusal-controls-source-correction/v1','executionAuthorization':False,'predecessorSourceManifest':role(B/'SOURCE-PINS.json'),'onlyExecutableDelta':'The single swallowed-writer assertion relocation and explicit retained diagnostic evidence; all other source bytes preserved.','inverseSubstitutionRestoredWholeLibrary':True,'completeLosslessApplications':4,'matrixRole':roles['MATRIX.json'],'caseCount':86,'positiveCount':13,'specificNegativeCount':73,'candidateImported':False,'syntaxCheckExecuted':False,'controlsExecuted':False})
roles['LESSONS.md']=put('LESSONS.md','Assertions inside deliberately swallowed callback failures cannot prove the output contract. Retain evidence and assert after original E is observed, while the callback throws only the explicit injected F. Preserve frozen R1 unrun; roster86 and all other affected predicates remain exact.\n')
roles['prepare_r2.py']=put('prepare_r2.py',Path(__file__).read_bytes())
manifest={'schema':'1370-native-observer-independent-controls-source-pins/v1','files':roles,'executionAuthorization':False};mr=out('SOURCE-PINS.json',manifest)
for r in roles.values():assert role(Path(r['path']))==r
out('SEAL.json',{'schema':'1370-native-refusal-controls-source-seal/v1','sourceManifest':mr,'payloadRolesReadbackVerified':len(roles),'executionAuthorization':False,'controlsExecuted':False});D.chmod(0o555)
print(json.dumps({'sourceManifest':mr,'library':roles['run-native-observer-controls.mjs'],'matrix':roles['MATRIX.json'],'contract':roles['CONTRACT.json']}))
