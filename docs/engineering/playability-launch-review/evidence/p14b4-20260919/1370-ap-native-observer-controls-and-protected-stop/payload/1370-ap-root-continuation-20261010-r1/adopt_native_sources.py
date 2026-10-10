import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent
I=S/'1370-ap-native-observer-source-20261010-r5'
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
def verify(r):assert role(r['path'])==r;return read(r['path'])
def put(p,v):
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
ir=role(S/'1370-ap-native-observer-implementation-independent-source-review-20261010-r5/RECEIPT.json');assert ir['sha256']=='e1d537f355b4f6e53a132638999b9b70e3dc7c4ab55d584c8dd73a9afc044fd2'
iv=read(ir['path']);ip=role(I/'SOURCE-PINS.json');assert ip['sha256']=='cb3aa4e0e9f93b06683b0a9b07047b485ed2c7eef9bc0e82694cfdc0964ffa5e' and iv['sourceManifest']==ip
assert iv['schema']=='1370-native-observer-implementation-independent-source-review/v1' and iv['decision']=='ACCEPT_STATIC_NATIVE_CANONICAL_OBSERVER_IMPLEMENTATION_SOURCE_ONLY' and iv['concreteFindings']==[] and iv['executionAuthorization'] is False
for r in iv['sourcePins'].values():assert role(r['path'])==r
assert iv['sourcePins']==iv['routeSourcePins']
cr=role(sys.argv[1]);assert cr['sha256']==sys.argv[2];cv=read(cr['path']);cp=cv['sourceManifest'];cps=verify(cp)
assert cv['schema']=='1370-native-observer-independent-controls-source-review/v1' and cv['decision']=='ACCEPT_STATIC_PURE_NATIVE_OBSERVER_CONTROLS_SOURCE_ONLY' and cv['concreteFindings']==[] and cv['executionAuthorization'] is False
for r in cps['files'].values():assert role(r['path'])==r
for n in ('run-native-observer-controls.mjs','MATRIX.json','CONTRACT.json'):assert cv['sourcePins'][n]==cv['routeSourcePins'][n]==cps['files'][n]
c=read(cps['files']['CONTRACT.json']['path']);m=read(cps['files']['MATRIX.json']['path'])
for r in c['requiredInputs'].values():assert role(r['path'])==r
for r in c['authorities'].values():assert role(r['path'])==r
assert c['authorities']['implementationSourceManifest']==ip and c['authorities']['implementationIndependentReview']==ir
rows=m['cases'];assert len({x['id'] for x in rows})==len(rows)
g=sum(x['expected']=='GREEN' for x in rows);red=sum(x['expected']=='RED' for x in rows)
assert len(rows)==g+red==c['result']['caseCount'] and g==c['result']['positiveCount'] and red==c['result']['specificNegativeCount'] and c['result']['originalOrderingCases']==18
assert c['result']['executionAuthorization'] is False and c['executionAuthorization'] is False
out={'schema':'1370-root-native-observer-implementation-controls-source-adoption/v1','status':'ROOT_ADOPTED_NATIVE_OBSERVER_IMPLEMENTATION_AND_CONTROLS_SOURCE_ONLY','implementationSourcePins':ip,'implementationReview':ir,'controlsSourcePins':cp,'controlsReview':cr,'rootDesignAdoption':c['authorities']['nativeDesignAdoption'],'api':c['authorities']['api'],'apiAdoption':c['authorities']['apiAdoption'],'supplementAdoption':c['authorities']['diagnosticSupplementAdoption'],'caseCount':len(rows),'positiveCount':g,'specificNegativeCount':red,'originalOrderingCases':18,'physicalCaps':{'count':512,'rowIncludingNewline':16384,'totalIncludingNewlines':2097152},'canonicalDepth':64,'canonicalNodesAndProperties':16384,'rootChecks':['Authenticated actual implementation source and independent acceptance','Authenticated actual independent controls source and independent acceptance','All control required-input and authority roles authenticated','Unique exact roster counts derived from sealed matrix','Root reviewed physical envelope consumer, count-first preflight, chronological latch and cleanup semantics'],'reviewIndependence':'Implementation, independent controls author and source reviewer remain distinct. Root adopts; no source acceptance is a runtime result.','executionAuthorization':False,'productionMutation':False,'actualControlsExecuted':False,'actualFullfunctionExecuted':False,'fullQualificationAccepted':False,'nativeFitMeasured':False,'game':False,'rootAdopterSource':role(__file__)}
print(json.dumps({'adoption':put(A/'NATIVE-OBSERVER-IMPLEMENTATION-CONTROLS-SOURCE-ADOPTION.json',out),'caseCount':len(rows),'positiveCount':g,'specificNegativeCount':red}))
