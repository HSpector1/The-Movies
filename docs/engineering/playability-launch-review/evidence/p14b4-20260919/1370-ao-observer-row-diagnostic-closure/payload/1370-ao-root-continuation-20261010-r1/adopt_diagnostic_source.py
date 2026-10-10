import datetime,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent
def role(p):
 p=Path(p);st=p.lstat();assert p.is_absolute() and p.resolve()==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def check(p,h):
 r=role(p);assert r['sha256']==h;return r,json.loads(Path(p).read_bytes())
def put(name,v):
 p=A/name
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
im,ip=check(S/'1370-ao-observer-row-diagnostic-source-20261010-r3/SOURCE-PINS.json','ecfa500f2a60f1280c6fcf06d60817bbb017bbf2524b74ab42bfd9c5aa5ce3b3')
ir,iv=check(S/'1370-ao-observer-row-diagnostic-independent-source-review-20261010-r3/RECEIPT.json','ba5fe631915582f42d0b3071e545a519e69ac00f5ab51027783af79452613064')
cm,cp=check(S/'1370-ao-observer-row-diagnostic-independent-controls-source-20261010-r2/SOURCE-PINS.json','a427acb4c7e1c0b5d31695141600c828c9e8f64543d5b828b9c40ac678b34411')
cr,cv=check(S/'1370-ao-observer-row-diagnostic-independent-controls-root-source-review-20261010-r2/RECEIPT.json','541f976ca5e1e550dd86b0fc56ac416b0a881c6d421ae14bb2809e2eeab5cfa8')
design,dv=check(S/'1370-an-root-continuation-20261009-r1/OBSERVER-ROW-DIAGNOSTIC-DESIGN-ADOPTION.json','8b45e59bfbcf67e115f28065c475fc64ba353a96ee4c07e616472bf58b1eda90')
apiad,av=check(A/'API-R2-ADOPTION.json','d6f892fb9829b54af43091c494ef1c2362573273f6ae2e8afea093015ddf569d')
assert iv['decision']=='ACCEPT_STATIC_BOUNDED_OBSERVER_ROW_DIAGNOSTIC_IMPLEMENTATION_SOURCE_ONLY'
assert cv['decision']=='ACCEPT_STATIC_PURE_OBSERVER_ROW_DIAGNOSTIC_CONTROLS_SOURCE_ONLY'
for review,manifest in [(iv,im),(cv,cm)]:
 assert review['sourceManifest']==manifest and review['concreteFindings']==[] and review['executionAuthorization'] is False
for pins in [ip,cp]:
 assert pins['executionAuthorization'] is False
 for r in pins['files'].values():assert role(r['path'])==r
for name,r in iv['sourcePins'].items():assert r==ip['files'][name]
assert cv['sourcePins']==cp['files'] and cp['externalImplementationSourcePins']==im
assert cp['api']==av['api'] and role(av['api']['path'])==av['api']
assert cv['caseCount']==cp['caseCount']==48 and cv['positiveCount']==cp['positiveCount']==6 and cv['specificNegativeCount']==cp['specificNegativeCount']==42
controlsContract=json.loads(Path(cp['files']['CONTRACT.json']['path']).read_bytes())
for name,r in controlsContract['dependencyRoles'].items():assert ip['files'][name]==r
ad=put('OBSERVER-DIAGNOSTIC-IMPLEMENTATION-CONTROLS-SOURCE-ADOPTION.json',{'schema':'1370-root-observer-row-diagnostic-implementation-controls-source-adoption/v1','status':'ROOT_ADOPTED_OBSERVER_ROW_DIAGNOSTIC_IMPLEMENTATION_AND_CONTROLS_SOURCE_ONLY','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'implementationSourcePins':im,'implementationReview':ir,'controlsSourcePins':cm,'controlsReview':cr,'rootDesignAdoption':design,'api':av['api'],'apiAdoption':apiad,'caseCount':48,'positiveCount':6,'specificNegativeCount':42,'diagnosticOnlyBounds':controlsContract['diagnosticOnlyBounds'],'originalObserverCaps':controlsContract['originalObserverCaps'],'implementationSourceAccepted':True,'controlsSourceAccepted':True,'unchangedOriginalWitness':ip['files']['m0FeasibilityWitness.ts'],'priorSourceStopsPreserved':True,'unsupportedFailedKindUnavailableBeforeIdentity':True,'ordinarySuccessfulRecordsUnchanged':True,'sameOriginalErrorStickyThroughBodyAndCleanup':True,'actualControls':None,'actualFullfunctionDiagnostic':None,'actualOffendingRowMetrics':None,'executionAuthorization':False,'gameAcceptance':False,'productionSourceChangesAuthorized':False,'scope':'Reviewed public scratch diagnostic and independent controls source only. The diagnostic-only ceilings return unavailable and never change original observer admission. A separately reviewed recorded route and one-time root grant are still required. No private source, fixture, observer cap or gameplay policy changes.'})
old,ov=check(S/'1370-an-root-continuation-20261009-r1/LOSSLESS-CONTROLS-RUNTIME-TOOLS.json','19327bf21bd5379586ffa98ad853ac3b6c91b22dd18eb2637c4137f74fae306a')
config=json.loads((S/'1370-an-lossless-trace-pure-controls-recorded-route-source-20261010-r2/CONFIG.json').read_bytes());runtime=config['runtimeTools']
for r in runtime.values():assert role(r['path'])==r
tr=put('OBSERVER-DIAGNOSTIC-CONTROLS-RUNTIME-TOOLS.json',{'schema':'1370-ao-observer-diagnostic-controls-runtime-tools/v1','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'runtimeTools':runtime,'previousObservation':old,'allFivePhysicalFilesRehashedNow':True,'sourceImportsOrExecution':False,'executionAuthorization':False})
print(json.dumps({'sourceAdoption':ad,'runtimeTools':tr}))
