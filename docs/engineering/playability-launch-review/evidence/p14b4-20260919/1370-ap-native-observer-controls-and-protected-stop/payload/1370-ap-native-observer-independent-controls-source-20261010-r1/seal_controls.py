"""Data-only source authoring/seal; never imports or executes candidate modules."""
from pathlib import Path
import ast, hashlib, json, os, re

D=Path(__file__).resolve().parent
S=D.parent
C=S/'1370-ap-native-observer-source-20261010-r5'
def role(path):
    p=Path(path); b=p.read_bytes()
    return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def write(name,value):
    p=D/name
    with p.open('x') as f:
        f.write(json.dumps(value,indent=2,ensure_ascii=True)+'\n');f.flush();os.fsync(f.fileno())
    return role(p)
pins=json.loads((C/'SOURCE-PINS.json').read_text())
for name,value in pins['files'].items():
    assert role(value['path'])==value,name
library=D/'run-native-observer-controls.mjs'
text=library.read_text()
assert 'return17' not in text
cases=[]
for line in text.split('export const NATIVE_CASES=[\n',1)[1].split('].map',1)[0].splitlines():
    if line.strip():
        case=ast.literal_eval(line.strip().rstrip(','))
        cases.append(dict(zip(['id','expected','predicate'],case)))
packet_path=S/'1370-c0-m0-full-body-fixture-resolver-source-after-al-20261009-r3/ORDERING-SOURCE-CASES.json'
packet=json.loads(packet_path.read_text())
assert role(packet_path)['sha256']=='95744791fed18f258df0a31dfaa84aa20b429ed1e6d89032993500c6049f39d7'
assert len(packet['cases'])==18
for case in packet['cases']:
    cases.append({'id':case['id'],'expected':case['expected'],'predicate':case.get('assertion','original synthetic source schema GREEN')})
assert len({c['id'] for c in cases})==len(cases)
counts={'caseCount':len(cases),'positiveCount':sum(c['expected']=='GREEN' for c in cases),'specificNegativeCount':sum(c['expected']=='RED' for c in cases)}
matrix=write('MATRIX.json',{'schema':'1370-native-observer-independent-controls-matrix/v1',**counts,'nativeCases':len(cases)-18,'originalOrderingCases':18,'cases':cases,'executionAuthorization':False})
required={name:pins['files'][name] for name in ['m0NativeObserverRows.mjs','m0FeasibilityWitness-native.ts','m0ObserverRowDiagnostic.mjs','ordering.ts','ordering-source-controls.ts']}
required['original-m0FeasibilityWitness.ts']=pins['files']['BASELINE-m0FeasibilityWitness.ts']
for name in ['m0TraceCodec.mjs','traceSequences.mjs']:
    required[name]=role(S/'1370-an-lossless-trace-codec-consumers-source-20261010-r3'/name)
required['ORDERING-SOURCE-CASES.json']=role(packet_path)
authority={
 'implementationSourceManifest':role(C/'SOURCE-PINS.json'),
 'implementationInterface':role(C/'INTERFACE.json'),
 'implementationIndependentReview':role(S/'1370-ap-native-observer-implementation-independent-source-review-20261010-r5/RECEIPT.json'),
 'api':role(S/'1370-ap-native-observer-api-source-20261010-r6/API.md'),
 'apiAdoption':role(S/'1370-ap-root-continuation-20261010-r1/NATIVE-OBSERVER-API-ADOPTION.json'),
 'diagnosticSupplementAdoption':role(S/'1370-ap-root-continuation-20261010-r1/DIAGNOSTIC-CODEC-SUPPLEMENT-ADOPTION.json'),
 'nativeDesignAdoption':role(S/'1370-ao-root-continuation-20261010-r1/NATIVE-CANONICAL-OBSERVER-DESIGN-ADOPTION.json'),
 'digestOracleSource':role(Path('/Users/zacheryspector/The-Movies-headless-program/src/core/math.ts')),
}
contract=write('CONTRACT.json',{
 'schema':'1370-native-observer-independent-controls-contract/v1',
 'status':'SOURCE_ONLY_UNRUN_PENDING_INDEPENDENT_REVIEW_AND_RECORDED_ROOT_GRANT',
 'library':role(library),'matrix':matrix,'requiredInputs':required,'authorities':authority,
 'entry':{'export':'runNativeObserverControls','sourceExport':'NATIVE_CASES','dependencies':['createObserverFailureLatch','createNativeRowCodec','NativeObserverFormatError','createM0FeasibilitySink','originalCreateM0FeasibilitySink','createObserverRowDiagnostic','runObserverArm','assertNativeEvaluationBinding','runOrderingSourceControls','orderingPacket'],
 'dependencyBindings':'Actual authenticated modules, not test-side replicas. Both sink factory exports share the original name; the worker renames only the original oracle dependency.'},
 'workerGraph':{'typescriptSources':['m0FeasibilityWitness-native.ts','original-m0FeasibilityWitness.ts','ordering.ts','ordering-source-controls.ts'],
 'copiedJavascriptSources':['m0NativeObserverRows.mjs','m0ObserverRowDiagnostic.mjs','m0TraceCodec.mjs','traceSequences.mjs','run-native-observer-controls.mjs'],
 'allowedImportRebase':"ordering-source-controls.ts: ./ordering.js -> ./ordering.mjs after authenticated public TypeScript erasure",'gameImports':False},
 'result':{'schema':'1370-native-observer-independent-controls-result/v1','status':'PURE_NATIVE_OBSERVER_CODEC_SINK_AND_AFFECTED_CONSUMERS_COMPLETED_UNADOPTED',**counts,
 'exactRows':'MATRIX.cases in order plus verdict ACCEPT_POSITIVE for GREEN or ACCEPT_SPECIFIC_REFUSAL for RED; any failed premise, unexpected error type/code/assertion, compiler/import failure is fatal, never expected RED',
 'originalOrderingCases':18,'originalParserCasesReplayed':0,'historicalObserverControlsReplayed':0,'game':False,'originalM0ReadOrWritten':False,'executionAuthorization':False},
 'semantics':{'physicalCount':512,'physicalRowBytesIncludingNewline':16384,'physicalAggregateBytesIncludingNewlines':2097152,'canonicalDepth':64,'canonicalNodesAndProperties':16384,
 'legacyViewBound':'L <= 2P+2; one complete projected row at a time. Expanded v1 accounting explicitly amended.',
 'digestOracle':'Fixture-only FNV64 fold over original UTF16 charCodeAt; byte equality checked separately; does not claim real gameplay invocation.',
 'firstError':'Shared actual arm-local latch retains presence and exact thrown value, including falsy values; ordinary no-latch reset>end>body precedence distinct.',
 'snapshot':'Actual healthy prior physical reference snapshot before failed record; public rows refuse sticky failure; no expanded trace cache.',
 'original18':'Original packet unchanged, migrated actual helper edits before codec wrapping and specific AssertionError checks; no arbitrary error is counted RED.'},
 'actualExecution':None,'runtimeGrant':None,'executionAuthorization':False,
})
lessons=D/'LESSONS.md'
with lessons.open('x') as f:
    f.write('Source-only controls; no runtime result is claimed.\n\n'
      'A syntactically valid return17 typo tested another thrown ReferenceError instead of the intended swallowed-error normal return. Both actual return paths now say return 17; static syntax alone cannot verify that distinction.\n\n'
      'Cleanup precedence needs separate reset, end, and body cases, including falsy thrown values. Reset-only failures could conceal an incorrect end/body implementation.\n\n'
      'Decoder structural refusals use a direct large native tuple, not an encoder text that fails its earlier byte limit. Exact own-key controls include symbols and nonenumerable keys; known-no-fit sink controls prove getters and codec are not touched.\n\n'
      'Physical native row accounting and the complete transient legacy projection are distinct, explicitly adopted contracts. Controls prove exact full tuples, Unicode byte counts, original digest preimages, context/order/multiplicity, and the actual shared matcher; they do not prove fixture fit or gameplay.\n')
    f.flush();os.fsync(f.fileno())
manifest=write('SOURCE-PINS.json',{'schema':'1370-native-observer-independent-controls-source-pins/v1','files':{name:role(D/name) for name in ['run-native-observer-controls.mjs','MATRIX.json','CONTRACT.json','LESSONS.md','seal_controls.py']},'executionAuthorization':False})
seal=write('SEAL.json',{'schema':'1370-native-observer-independent-controls-seal/v1','sourceManifest':manifest,'payloadFiles':5,'sourceOnly':True,'actualExecution':False,'executionAuthorization':False})
for p in D.iterdir():
    if p.is_file():p.chmod(0o444)
D.chmod(0o555)
print(json.dumps({'sourceManifest':manifest,'contract':contract,'matrix':matrix,'seal':seal,**counts}))
