"""Future one-aggregate real full-function qualifier. Source work never executes this route."""
import hashlib,json,math,os,pathlib,selectors,signal,stat,subprocess,sys,time,traceback
HERE=pathlib.Path(__file__).resolve().parent
CONFIG_SHA='d8463cf297a97987738acd8e31a58bd26bb5e027aa2d546c4dca4b3eebe60232'
START=time.monotonic();END=START+300;CAP=128*1024**2
def need(v,m):
 if not v:raise RuntimeError('STOP_'+m)
def timeout(signum,frame):raise TimeoutError('STOP_ONE_AGGREGATE_300')
signal.signal(signal.SIGALRM,timeout);signal.setitimer(signal.ITIMER_REAL,300)
def remaining():
 n=END-time.monotonic();need(n>0,'ONE_AGGREGATE_300');return n
def meta(s):return s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns
def read(r,cap=CAP):
 remaining();need(type(r) is dict and set(r)=={'path','bytes','sha256'} and type(r['path']) is str and type(r['bytes']) is int and 0<=r['bytes']<=cap and type(r['sha256']) is str and len(r['sha256'])==64 and all(x in '0123456789abcdef' for x in r['sha256']),'ROLE_SCHEMA')
 p=pathlib.Path(r['path']);need(p.is_absolute() and p.resolve(strict=True)==p,'PHYSICAL_ROLE');before=p.lstat();need(stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size==r['bytes'],'REGULAR_ROLE')
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  need(meta(os.fstat(fd))==meta(before),'ROLE_OPEN_RACE');raw=bytearray()
  while True:
   remaining();b=os.read(fd,1024**2)
   if not b:break
   raw.extend(b);need(len(raw)<=cap,'ROLE_CAP')
  need(len(raw)==r['bytes'] and hashlib.sha256(raw).hexdigest()==r['sha256'] and meta(os.fstat(fd))==meta(before)==meta(p.lstat()),'ROLE_HASH_RACE');return bytes(raw)
 finally:os.close(fd)
def role(p,cap=CAP):
 p=pathlib.Path(p);need(p.is_absolute() and p.resolve(strict=True)==p,'PHYSICAL_ARTIFACT');before=p.lstat();need(stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=cap,'ARTIFACT_CAP');fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW);h=hashlib.sha256();size=0
 try:
  need(meta(os.fstat(fd))==meta(before),'ARTIFACT_OPEN_RACE')
  while True:
   remaining();chunk=os.read(fd,65536)
   if not chunk:break
   size+=len(chunk);need(size<=cap and size<=before.st_size,'ARTIFACT_READ_CAP');h.update(chunk)
  need(size==before.st_size and meta(os.fstat(fd))==meta(before)==meta(p.lstat()),'ARTIFACT_READ_RACE')
 finally:os.close(fd)
 return {'path':str(p),'bytes':size,'sha256':h.hexdigest()}
def pairs(rows):
 d={}
 for k,v in rows:need(k not in d,'DUPLICATE_JSON_KEY');d[k]=v
 return d
def load(r,cap=1024*1024):return json.loads(read(r,cap),object_pairs_hook=pairs,parse_constant=lambda x:(_ for _ in ()).throw(RuntimeError('STOP_JSON_CONSTANT')))
def write(p,value):
 raw=(json.dumps(value,sort_keys=True,separators=(',',':'))+'\n').encode();need(len(raw)<=131072,'RESULT_CAP');fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
 return role(p,131072)
def authenticate_types(g,c,proof_config):
 t=load(g['typesAdoption']);contract=c['typesAdoptionContract'];need(t['schema']==contract['schema'] and t['status']==contract['status'],'ACTUAL_SUCCESSFUL_TYPES_ADOPTION')
 for k in ['typesAccepted','collectionAccepted','fullProtectedPostflightAccepted','soleLaneReleased','originalR6StopPreserved']:need(t[k] is True,'TYPES_'+k)
 for k in ['historicalRootUnchanged','game','executionAuthorization']:need(t[k] is False,'TYPES_SCOPE_'+k)
 need(g['typesAdoption']==c['historicalTypesAdoption'] and t['productionHead']==c['historicalTypesHead'] and t['productionSourceTree']==c['productionSourceTree'],'CURRENT_AM_TYPES')
 for k in ['independentObservedReview','result','readback','fullPostflightSnapshot','currentProtection','postR6RootAdoption']:read(t[k],16*1024**2)
 review=load(t['independentObservedReview']);need(review['schema']==contract['reviewSchema'] and review['decision']==contract['reviewDecision'] and review['concreteFindings']==[] and review['executionAuthorization'] is False,'OBSERVED_TYPES_REVIEW')
 result=load(t['result']);need(result['status']=='PASS_M0_TYPES_AND_DIAGNOSTIC_COLLECTION_ONLY' and result['sourceBefore']==result['sourceAfter']==t['freshSourceProof'] and result['nodeModulesBefore']==result['nodeModulesAfter']==t['freshDependencyProof'],'GENUINE_TYPES_COMPLETE_PROOFS')
 keys={'fileProofDigestSha256','physicalMetadataSha256','historicalRootSubstitutedMetadataSha256','nonrootMetadataSha256','mirrorFiles','mirrorBytes','dependencyLink','traversedEntries','mirrorRootIdentity'};need(set(t['freshSourceProof'])==keys,'NINE_FIELD_PLAIN_SOURCE_PROOF')
 root=load(t['postR6RootAdoption']);need(root['schema']=='1370-root-post-r6-m0-current-root-diagnostic-adoption/v1' and root['status']=='ROOT_ADOPTED_POST_R6_M0_PRESERVATION_DIAGNOSTIC_KNOWN_ROOT_DRIFT' and root['currentRootBaselineQualified'] is True and root['historicalRootUnchanged'] is False and root['originalR6StopPreserved'] is True and root['typesAccepted'] is False and root['collectionAccepted'] is False,'EXACT_DIAGNOSTIC_ROOT_ADOPTION')
 need(root['knownRootDrift']==proof_config['knownRootDrift'] and root['freshSourceProof']==t['freshSourceProof'] and root['freshDependencyProof']==t['freshDependencyProof'],'DIAGNOSTIC_CURRENT_ROOT_PROOFS')
 for k in ['diagnosticObservedReview','actualResult','fullPostflightSnapshot']:read(root[k],16*1024**2)
 return t
def authenticate_observer_diagnostic(g,c,manifest):
 authorities=c['nativeObserverAuthorities']
 implementation=load(authorities['implementationSourcePins']);implementation_review=load(authorities['implementationSourceReview'])
 need(implementation_review['decision']=='ACCEPT_STATIC_NATIVE_CANONICAL_OBSERVER_IMPLEMENTATION_SOURCE_ONLY' and implementation_review['sourceManifest']==authorities['implementationSourcePins'] and implementation_review['concreteFindings']==[] and implementation_review['executionAuthorization'] is False,'DIAGNOSTIC_IMPLEMENTATION_REVIEW')
 for name,r in c['historicalNativeObserverInputs'].items():
  need(r==implementation['files'][name]==implementation_review['sourcePins'][name]==implementation_review['routeSourcePins'][name] and (name=='m0ObserverRowDiagnostic.mjs' or r==manifest['files'][name]),'DIAGNOSTIC_SOURCE_BINDINGS');read(r)
 controls=load(authorities['controlsSourcePins']);controls_review=load(authorities['controlsSourceReview'])
 need(controls_review['decision']=='ACCEPT_STATIC_PURE_NATIVE_OBSERVER_CONTROLS_SOURCE_ONLY' and controls_review['sourceManifest']==authorities['controlsSourcePins'] and controls_review['concreteFindings']==[] and controls_review['executionAuthorization'] is False,'DIAGNOSTIC_CONTROLS_REVIEW')
 for k in ['implementationControlsSourceAdoption','rootDesignAdoption','api','apiAdoption','supplementAdoption']:read(authorities[k])
 source_adoption=load(authorities['implementationControlsSourceAdoption'])
 need(source_adoption['status']=='ROOT_ADOPTED_NATIVE_OBSERVER_IMPLEMENTATION_AND_CONTROLS_SOURCE_ONLY' and source_adoption['executionAuthorization'] is False,'DIAGNOSTIC_SOURCE_ADOPTION')
 for a,b in [('implementationSourcePins','implementationSourcePins'),('implementationReview','implementationSourceReview'),('controlsSourcePins','controlsSourcePins'),('controlsReview','controlsSourceReview'),('rootDesignAdoption','rootDesignAdoption'),('api','api'),('apiAdoption','apiAdoption'),('supplementAdoption','supplementAdoption')]:need(source_adoption[a]==authorities[b],'DIAGNOSTIC_SOURCE_ADOPTION_ROLES')
 need(g['nativeObserverControlsObservedAdoption']==c['actualNativeObserverControlsObservedAdoption'],'EXACT_DIAGNOSTIC_OBSERVED_ROLE')
 observed=load(g['nativeObserverControlsObservedAdoption']);contract=c['nativeObserverObservedAdoptionContract']
 need(observed['schema']==contract['schema'] and observed['status']==contract['status'],'DIAGNOSTIC_OBSERVED_CONTRACT')
 for k in ['caseCount','positiveCount','specificNegativeCount']:need(type(observed[k]) is int and observed[k]==contract[k],'DIAGNOSTIC_CONTROL_COUNT')
 need(type(observed['actualExit']) is int and observed['actualExit']==0 and observed['soleLaneReleased'] is True,'DIAGNOSTIC_ACTUAL_EXIT_RELEASE')
 for k in ['executionAuthorization','game','privateM0ReadOrWritten','fullQualificationAccepted','fullBodyGameAssertionsExecuted']:need(observed[k] is False,'DIAGNOSTIC_PURE_SCOPE')
 for k,r in authorities.items():need(observed[k]==r,'DIAGNOSTIC_OBSERVED_AUTHORITIES')
 need(observed['sourceReviewedFullBodyTemplate']==c['historicalNativeObserverInputs']['FULL-BODY-CONTROLS-TEMPLATE.ts'] and observed['inputRoles']['m0ObserverRowDiagnostic.mjs']==c['historicalNativeObserverInputs']['m0ObserverRowDiagnostic.mjs'] and observed['inputRoles']['m0FeasibilityWitness-native.ts']==implementation['files']['m0FeasibilityWitness-native.ts'],'DIAGNOSTIC_ACTUAL_TESTED_INPUTS')
 review=load(observed['independentObservedReview']);need(review['schema']==contract['reviewSchema'] and review['decision']==contract['reviewDecision'] and review['concreteFindings']==[] and review['executionAuthorization'] is False,'DIAGNOSTIC_OBSERVED_REVIEW')
 result=load(observed['result']);matrix=load(controls['files']['MATRIX.json'])
 need(result['schema']=='1370-native-observer-independent-controls-result/v1' and result['status']=='PURE_NATIVE_OBSERVER_CODEC_SINK_AND_AFFECTED_CONSUMERS_COMPLETED_UNADOPTED' and result['caseCount']==72 and result['positiveCount']==13 and result['specificNegativeCount']==59 and result['originalOrderingCases']==18 and result['results']==[{**row,'verdict':'ACCEPT_POSITIVE' if row['expected']=='GREEN' else 'ACCEPT_SPECIFIC_REFUSAL'} for row in matrix['cases']],'DIAGNOSTIC_EXACT_ACTUAL_ROSTER')
 need(result['inputRoles']==observed['inputRoles'] and result['executionAuthorization'] is False and result['game'] is False and result['privateM0ReadOrWritten'] is False and result['fullQualificationAccepted'] is False,'DIAGNOSTIC_RESULT_SCOPE')
 for k in ['implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview','rootDesignAdoption']:need(result[k]==authorities[k],'DIAGNOSTIC_RESULT_AUTHORITIES')
 for k in ['readback','actualTool','sourceAdoption','sourcePins','sourceReview','workerResult']:read(observed[k],16*1024**2)
 return observed

def authenticate_refusal_diagnostic(g,c,manifest):
 a=c['nativeRefusalDiagnosticAuthorities'];dm=load(a['diagnosticSourceManifest']);dr=load(a['diagnosticSourceReview']);cm=load(a['controlsSourcePins']);cr=load(a['controlsSourceReview'])
 need(dr['schema']=='1370-native-refusal-diagnostic-independent-source-review/v1' and dr['decision']=='ACCEPT_STATIC_NATIVE_REFUSAL_DIAGNOSTIC_IMPLEMENTATION_SOURCE_ONLY' and dr['sourceManifest']==a['diagnosticSourceManifest'] and dr['concreteFindings']==[] and dr['executionAuthorization'] is False,'REFUSAL_DIAGNOSTIC_SOURCE_REVIEW')
 for name in ['m0ObserverRowDiagnostic.mjs','INTERFACE.json']:need(dm['files'][name]==dr['sourcePins'][name]==dr['routeSourcePins'][name],'REFUSAL_DIAGNOSTIC_SOURCE_ALIASES');read(dm['files'][name])
 need(manifest['files']['m0ObserverRowDiagnostic.mjs']==c['nativeObserverInputs']['m0ObserverRowDiagnostic.mjs']==dm['files']['m0ObserverRowDiagnostic.mjs'] and a['diagnosticInterface']==dm['files']['INTERFACE.json'] and dm['dependencies']['m0NativeObserverRows.mjs']==c['nativeObserverInputs']['m0NativeObserverRows.mjs'],'REFUSAL_DIAGNOSTIC_OVERRIDE')
 need(cr['schema']=='1370-native-observer-independent-controls-source-review/v1' and cr['decision']=='ACCEPT_STATIC_PURE_NATIVE_OBSERVER_CONTROLS_SOURCE_ONLY' and cr['sourceManifest']==a['controlsSourcePins'] and cr['concreteFindings']==[] and cr['executionAuthorization'] is False,'REFUSAL_CONTROLS_SOURCE_REVIEW')
 for name in ['run-native-observer-controls.mjs','MATRIX.json','CONTRACT.json']:need(cm['files'][name]==cr['sourcePins'][name]==cr['routeSourcePins'][name],'REFUSAL_CONTROLS_SOURCE_ALIASES');read(cm['files'][name])
 sa=load(a['implementationControlsSourceAdoption']);need(sa['schema']=='1370-root-native-refusal-diagnostic-implementation-controls-source-adoption/v1' and sa['status']=='ROOT_ADOPTED_NATIVE_REFUSAL_DIAGNOSTIC_AND_AFFECTED_CONTROLS_SOURCE_ONLY' and sa['executionAuthorization'] is False,'REFUSAL_SOURCE_ADOPTION')
 for k,r in a.items():need(k=='implementationControlsSourceAdoption' or sa['prospectiveProtocol' if k=='prospectiveObservedContract' else k]==r,'REFUSAL_SOURCE_ADOPTION_BINDINGS');read(r)
 need(g['nativeRefusalControlsObservedAdoption']==c['actualNativeRefusalControlsObservedAdoption'],'REFUSAL_OBSERVED_ROLE');o=load(g['nativeRefusalControlsObservedAdoption']);ct=c['nativeRefusalObservedAdoptionContract']
 need(o['schema']==ct['schema'] and o['status']==ct['status'] and type(o['actualExit']) is int and o['actualExit']==0 and o['soleLaneReleased'] is True,'REFUSAL_ACTUAL_ADOPTION')
 for k in ['caseCount','positiveCount','specificNegativeCount','originalOrderingCases','originalParserCasesReplayed']:need(type(o[k]) is int and o[k]==ct[k],'REFUSAL_ACTUAL_COUNTS')
 for k in ['executionAuthorization','game','privateM0ReadOrWritten','fullQualificationAccepted','fullBodyGameAssertionsExecuted']:need(o[k] is False,'REFUSAL_SCOPE')
 for k,r in a.items():need(o[k]==r,'REFUSAL_OBSERVED_AUTHORITIES')
 for name in ['m0ObserverRowDiagnostic.mjs','m0NativeObserverRows.mjs','m0FeasibilityWitness-native.ts','ordering.ts']:need(o['inputRoles'][name]==manifest['files'][name],'REFUSAL_ACTUAL_INPUT_BINDINGS')
 need(o['implementationSourcePins']==c['nativeObserverAuthorities']['implementationSourcePins'] and o['implementationSourceReview']==c['nativeObserverAuthorities']['implementationSourceReview'],'REFUSAL_BASE_IMPLEMENTATION')
 rv=load(o['independentObservedReview']);need(rv['schema']==ct['reviewSchema'] and rv['decision']==ct['reviewDecision'] and rv['concreteFindings']==[] and rv['executionAuthorization'] is False,'REFUSAL_OBSERVED_REVIEW')
 r=load(o['result']);m=load(cm['files']['MATRIX.json']);need(r['schema']=='1370-native-observer-independent-controls-result/v1' and r['status']=='PURE_NATIVE_OBSERVER_CODEC_SINK_AND_AFFECTED_CONSUMERS_COMPLETED_UNADOPTED' and r['caseCount']==86 and r['positiveCount']==13 and r['specificNegativeCount']==73 and r['originalOrderingCases']==18 and r['originalParserCasesReplayed']==0 and r['results']==[{**row,'verdict':'ACCEPT_POSITIVE' if row['expected']=='GREEN' else 'ACCEPT_SPECIFIC_REFUSAL'} for row in m['cases']],'REFUSAL_EXACT_ACTUAL_ROSTER')
 need(r['inputRoles']==o['inputRoles'] and r['executionAuthorization'] is False and r['game'] is False and r['privateM0ReadOrWritten'] is False and r['fullQualificationAccepted'] is False,'REFUSAL_RESULT_SCOPE')
 for k in ['diagnosticSourceManifest','diagnosticSourceReview','diagnosticInterface','diagnosticDesignAdoption','controlsSourcePins','controlsSourceReview','prospectiveObservedContract']:need(r[k]==a[k],'REFUSAL_RESULT_AUTHORITIES')
 for k in ['readback','actualTool','rootReaderActualTool','sourceAdoption','sourcePins','sourceReview','workerResult','recorderResult']:read(o[k],16*1024**2)
 return o

def authenticate_current_protection(g,c):
 p=load(g['currentProtection']);need(p['nativeRefusalControlsObservedAdoption']==c['actualNativeRefusalControlsObservedAdoption']==g['nativeRefusalControlsObservedAdoption'],'CURRENT_REFUSAL_86_ROLE');need(p['nativeControlsObservedAdoption']==c['actualNativeObserverControlsObservedAdoption']==g['nativeObserverControlsObservedAdoption'],'CURRENT_NATIVE_72_ROLE');need(g['currentProtection']==c['currentProtection'],'EXACT_CURRENT_PROTECTION_ROLE')
 need(p['schema']=='1370-root-fullfunction-current-protection/v4' and p['status']=='ROOT_ADOPTED_CURRENT_FULLFUNCTION_PREFLIGHT_UNDER_CONTINUOUS_FREEZE' and p['productionHead']==c['operationalHead'] and p['productionSourceTree']==c['productionSourceTree'] and p['historicalTypesAdoption']==g['typesAdoption']==c['historicalTypesAdoption'] and p['historicalTypesHead']==c['historicalTypesHead'] and p['protectedFreezeContinues'] is True and p['executionAuthorization'] is False and p['game'] is False,'CURRENT_FULLFUNCTION_PROTECTION_V2')
 need(p['currentAPFullPreflightAdoption']==c['actualCurrentAPFullPreflightAdoption'] and p['currentOperationalTransition']==c['actualCurrentOperationalTransition'] and p['reviewedPriorStopAdoption']==c['reviewedPriorStopAdoption'],'CURRENT_AN_AUTHORITY_ROLES')
 a=load(p['currentAPFullPreflightAdoption']);need(a['schema']=='1370-aq-root-current-ap-fullpreflight-adoption/v1' and a['status']=='ROOT_ADOPTED_CURRENT_AP_FULL_PREFLIGHT' and a['productionHead']==c['operationalHead'] and a['productionSourceTree']==c['productionSourceTree'] and a['protectedFreezeContinues'] is True and a['executionAuthorization'] is False and p['currentAPFullPreflightSnapshot']==a['snapshot'],'CURRENT_AN_FULL_PREFLIGHT')
 for k in ['actualReadback','independentObservedReview','snapshot','snapshotPins','guardSource','config','sourcePins','actualTool','postOwnership','rawLocalOnlyClassification']:read(a[k],16*1024**2)
 historical=load(c['historicalAMToANTransition']);need(historical['schema']=='1370-ao-current-an-operational-transition/v1' and historical['actualHead']==c['historicalANHead'] and historical['predecessor']==c['historicalTypesHead'] and historical['sourceTree']==c['productionSourceTree'] and historical['docsOnlyVerified'] is True and historical['workingTreeClean'] is True and historical['executionAuthorization'] is False,'HISTORICAL_AM_TO_AN_CONTINUITY');read(historical['publishedReadback'])
 ao=load(c['historicalANToAOTransition']);need(ao['schema']=='1370-ap-current-ao-operational-transition/v1' and ao['actualHead']==c['historicalAOHead'] and ao['predecessor']==c['historicalANHead'] and ao['sourceTree']==c['productionSourceTree'] and ao['docsOnlyVerified'] is True and ao['workingTreeClean'] is True and ao['executionAuthorization'] is False,'HISTORICAL_AN_TO_AO_CONTINUITY');read(ao['publishedReadback'])
 transition=load(p['currentOperationalTransition']);need(transition['schema']=='1370-aq-current-ap-operational-transition/v1' and transition['actualHead']==c['operationalHead'] and transition['predecessor']==c['historicalAOHead'] and transition['sourceTree']==c['productionSourceTree'] and transition['docsOnlyVerified'] is True and transition['workingTreeClean'] is True and transition['executionAuthorization'] is False,'HISTORICAL_TYPES_CURRENT_AN_CONTINUITY');read(transition['publishedReadback'])
 for k in ['actualPreflight','actualPreflightReadback','independentPreflightReview','reviewedPriorStopAdoption']:read(p[k],16*1024**2)
 return p

def main():
 need(sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3,'PYTHON_I_B_ARGS');gp=pathlib.Path(sys.argv[1]);gr=role(gp,131072);need(gr['sha256']==sys.argv[2],'GRANT_HASH');g=load(gr,131072)
 cr=role(HERE/'CONFIG.json',131072);need(cr['sha256']==CONFIG_SHA,'CONFIG_HASH');c=load(cr,131072);need(c['actualCurrentAPFullPreflightAdoption'] is not None and c['currentProtection'] is not None,'UNFILLED_CURRENT_AP_AUTHORITY')
 need(g['schema']=='1370-root-fullfunction-qualification-once-grant/v1' and g['scope']=='REAL_FULL_FUNCTION_BOUNDARIES_BASELINE_AND_TYPED_CATCH_MUTANT_ONLY' and g['executionAuthorization'] is True and g['oneAggregateRun'] is True and g['automaticRetry'] is False and g['clockEnforcedByOriginalRecordedRoute'] is True,'ROOT_ONCE_GRANT')
 need(g['config']==cr and g['bounds']==c['bounds'],'EXACT_CONFIG_BOUNDS')
 manifest=load(g['sourcePins'],131072);need(manifest['schema']=='1370-fullfunction-qualification-source-pins/v1' and manifest['executionAuthorization'] is False,'SOURCE_MANIFEST')
 for name,r in manifest['files'].items():
  if name in c['parserInputs']:need(r==c['parserInputs'][name],'EXACT_EXTERNAL_TESTED_PARSER_ROLE')
  elif name in c['nativeObserverInputs']:need(r==c['nativeObserverInputs'][name],'EXACT_FIXED_NATIVE_OBSERVER_ROLE')
  elif name in c['representationInputs']:need(r==c['representationInputs'][name],'EXACT_FIXED_REPRESENTATION_ROLE')
  else:need(pathlib.Path(r['path'])==HERE/name,'SOURCE_PATH')
  read(r)
 review=load(g['sourceReview'],131072);need(review['decision']=='ACCEPT_STATIC_REAL_FULL_FUNCTION_QUALIFICATION_ROUTE_SOURCE_ONLY' and review['executionAuthorization'] is False and review['concreteFindings']==[] and review['sourceManifest']==g['sourcePins'],'INDEPENDENT_SOURCE_REVIEW')
 for name in c['reviewAliases']:need(review['sourcePins'][name]==review['routeSourcePins'][name]==manifest['files'][name],'SOURCE_ROLE_ALIASES')
 need(manifest['files']['run-fullfunction.py']==role(pathlib.Path(__file__).resolve()),'CONTROLLER_SELF')
 for r in [c['acceptedR3SourcePins'],c['acceptedR3RootAdoption'],c['acceptedR3IndependentReview'],*c['inputs'].values(),*c['templates'].values()]:read(r)
 held=load(c['acceptedR3RootAdoption']);need(held['status']=='ROOT_ADOPTED_HELD_SOURCE_R3_FIXTURE_RESOLVER_AND_TWO_ORDERING_REPAIRS' and held['executionAuthorization'] is False,'HELD_R3_AUTHORITY')
 parser_adoption=load(g['parserControlsAdoption']);need(parser_adoption['schema']=='1370-root-exact-identity-json-controls-observed-adoption/v1' and parser_adoption['status']=='ROOT_ADOPTED_ACTUAL_EXACT_IDENTITY_JSON_CONTROLS_ONLY' and parser_adoption['executionAuthorization'] is False and type(parser_adoption['actualExit']) is int and parser_adoption['actualExit']==0 and parser_adoption['parserSource']==manifest['files']['exact-json.mjs'] and parser_adoption['controlsSource']==manifest['files']['run-parser-controls.mjs'],'ACTUAL_PARSER_CONTROLS_ADOPTION')
 parser_review=load(parser_adoption['independentObservedReview']);need(parser_review['decision']=='ACCEPT_ACTUAL_EXACT_IDENTITY_JSON_PURE_CONTROLS_ONLY' and parser_review['executionAuthorization'] is False and parser_review['concreteFindings']==[],'OBSERVED_PARSER_CONTROLS_REVIEW')
 parser_result=load(parser_adoption['result']);need(parser_result['status']=='PASS_EXACT_IDENTITY_JSON_PURE_CONTROLS_ALL_CASES_ONLY' and parser_result['caseCount']==32 and parser_result['privateM0ReadOrWritten'] is False and parser_result['game'] is False and parser_result['parserSource']==manifest['files']['exact-json.mjs'] and parser_result['controlsSource']==manifest['files']['run-parser-controls.mjs'],'ACTUAL_PARSER_CONTROLS_RESULT');read(parser_adoption['actualTool'],16*1024**2)
 for r in c['transformTools'].values():read(r,2*1024**2)
 da=c['probeDiagnosticAuthorities'];ad=load(da['rootAdoption']);di=load(da['independentSourceReview']);dm=load(da['sourceManifest'])
 need(ad['schema']=='1370-root-held-probe-overflow-diagnostic-source-adoption/v1' and ad['status']=='ROOT_ADOPTED_HELD_FIRST_OVERFLOW_DIAGNOSTIC_SOURCE_ONLY' and ad['executionAuthorization'] is False and ad['runtimeReady'] is False and ad['limitsChanged'] is False and ad['completeTraceStillRequired'] is True and ad['sourceManifest']==da['sourceManifest'] and ad['independentSourceReview']==da['independentSourceReview'],'ADOPTED_DIAGNOSTIC_ONLY')
 need(di['decision']=='ACCEPT_STATIC_BOUNDED_PROBE_OVERFLOW_DIAGNOSTIC_PROPOSAL_ONLY' and di['executionAuthorization'] is False and di['concreteFindings']==[] and di['sourceManifest']==da['sourceManifest'],'DIAGNOSTIC_SOURCE_REVIEW')
 # Historical first-overflow adoption remains provenance; current representation requires its distinct adopted authority.
 la=c['losslessRepresentationAuthorities'];lm=load(la['implementationSourcePins']);lr=load(la['implementationSourceReview']);cm=load(la['controlsSourcePins']);cv=load(la['controlsSourceReview']);design=load(la['rootDesignAdoption']);source_ad=load(la['implementationControlsSourceAdoption'])
 need(lr['decision']=='ACCEPT_STATIC_LOSSLESS_TRACE_CODEC_AND_STREAMING_CONSUMERS_WITH_ORDERING_ADAPTER_SOURCE_ONLY' and lr['sourceManifest']==la['implementationSourcePins'] and lr['executionAuthorization'] is False and lr['concreteFindings']==[],'REPRESENTATION_SOURCE_REVIEW')
 need(cv['decision']=='ACCEPT_STATIC_PURE_LOSSLESS_TRACE_CONTROLS_SOURCE_ONLY' and cv['sourceManifest']==la['controlsSourcePins'] and cv['executionAuthorization'] is False and cv['concreteFindings']==[],'CONTROLS_SOURCE_REVIEW')
 need(design['status']=='ROOT_ADOPTED_EXACT_LOSSLESS_COMPRESSED_TRACE_DESIGN_FOR_IMPLEMENTATION_ONLY' and design['executionAuthorization'] is False and design['stickyOperationalFailureRequired'] is True,'EXACT_ADOPTED_REPRESENTATION_DESIGN')
 need(source_ad['status']=='ROOT_ADOPTED_LOSSLESS_IMPLEMENTATION_R3_AND_INDEPENDENT_CONTROLS_R2_SOURCE_ONLY' and source_ad['executionAuthorization'] is False,'IMPLEMENTATION_CONTROLS_SOURCE_ADOPTION')
 for actual,expected in [('implementationSourcePins','implementationSourcePins'),('implementationReview','implementationSourceReview'),('controlsSourcePins','controlsSourcePins'),('controlsReview','controlsSourceReview'),('rootDesignAdoption','rootDesignAdoption')]:need(source_ad[actual]==la[expected],'IMPLEMENTATION_CONTROLS_ROLE_BINDINGS')
 for name,r in c['representationInputs'].items():need(r==lm['files'][name]==lr['sourcePins'][name]==lr['routeSourcePins'][name]==manifest['files'][name],'FIXED_REPRESENTATION_SOURCE_BINDINGS');read(r)
 need(g['losslessControlsObservedAdoption']==c['actualLosslessControlsObservedAdoption'],'EXACT_ROOT_OBSERVED_CONTROLS_ROLE');observed=load(g['losslessControlsObservedAdoption']);oc=c['losslessControlsObservedAdoptionContract']
 need(observed['schema']==oc['schema'] and observed['status']==oc['status'],'ACTUAL_LOSSLESS_CONTROLS_ADOPTION')
 for k in ['caseCount','positiveCount','specificNegativeCount','originalOrderingCases','originalParserCasesReplayed']:need(type(observed[k]) is int and observed[k]==oc[k],'EXACT_CONTROL_COUNTS')
 need(type(observed['actualExit']) is int and observed['actualExit']==0 and observed['soleLaneReleased'] is True,'ACTUAL_CONTROLS_EXIT_OWNERSHIP')
 for k in ['executionAuthorization','game','privateM0ReadOrWritten','fullQualificationAccepted','fullBodyGameAssertionsExecuted']:need(observed[k] is False,'CONTROLS_ONLY_SCOPE')
 for k in ['implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview','rootDesignAdoption','implementationControlsSourceAdoption']:need(observed[k]==la[k],'OBSERVED_CONTROLS_SOURCE_BINDINGS')
 need(observed['sourceReviewedFullBodyTemplate']==c['historicalPure49Template'],'SOURCE_REVIEWED_UNRUN_FULLBODY_TEMPLATE')
 ov=load(observed['independentObservedReview']);need(ov['decision']=='ACCEPT_ACTUAL_PURE_LOSSLESS_CODEC_AND_AFFECTED_ORDERING_CONTROLS_ONLY' and ov['executionAuthorization'] is False and ov['concreteFindings']==[],'ACTUAL_CONTROLS_INDEPENDENT_REVIEW')
 rr=load(observed['result']);matrix=load(cm['files']['MATRIX.json'])
 need(rr['schema']=='1370-lossless-trace-independent-controls-result/v1' and rr['status']=='PURE_LOSSLESS_CODEC_AND_AFFECTED_ORDERING_COMPLETED_UNADOPTED' and rr['positiveCount']==9 and rr['specificNegativeCount']==40 and rr['originalOrderingCases']==18 and rr['originalParserCasesReplayed']==0,'ACTUAL_CONTROLS_RESULT')
 need(rr['executionAuthorization'] is False and rr['game'] is False and rr['originalM0ReadOrWritten'] is False,'PURE_RESULT_SCOPE')
 need(rr['results']==[{**row,'verdict':'ACCEPT_POSITIVE' if row['expected']=='GREEN' else 'ACCEPT_SPECIFIC_REFUSAL'} for row in matrix['cases']] and len(rr['results'])==49,'EXACT_OBSERVED_CONTROL_ROSTER')
 need(rr['inputRoles']==observed['inputRoles'],'OBSERVED_CONTROL_INPUT_ROLES')
 for name in ['m0TraceCodec.mjs','traceSequences.mjs','m0WiringProbe.ts','ordering.ts']:need(observed['inputRoles'][name]==c['historicalRepresentationInputs'][name],'ACTUAL_TESTED_FIXED_INPUT_ROLE')
 for k in ['implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview','rootDesignAdoption']:need(rr[k]==la[k],'CONTROL_RESULT_AUTHORITY_BINDINGS')
 for k in ['readback','actualTool','sourceAdoption']:read(observed[k],16*1024**2)
 historical_ordering=c['historicalRepresentationInputs']['ordering.ts'];need(historical_ordering==lm['files']['ordering.ts']==lr['sourcePins']['ordering.ts']==lr['routeSourcePins']['ordering.ts'],'HISTORICAL_49_ORDERING_PROVENANCE');read(historical_ordering)
 historical_template=c['historicalPure49Template'];need(historical_template==lm['files']['FULL-BODY-CONTROLS-TEMPLATE.ts']==lr['sourcePins']['FULL-BODY-CONTROLS-TEMPLATE.ts']==lr['routeSourcePins']['FULL-BODY-CONTROLS-TEMPLATE.ts'],'HISTORICAL_49_TEMPLATE_PROVENANCE');read(historical_template)
 authenticate_observer_diagnostic(g,c,manifest)
 authenticate_refusal_diagnostic(g,c,manifest)
 proof_config=load(c['proofConfig']);t=authenticate_types(g,c,proof_config)
 artifact=load(g['artifactBoundAdoption']);need(artifact['schema']=='1370-root-full-state-fixture-artifact-bound/v1' and artifact['status']=='ROOT_AUTHORIZED_FULL_STATE_FIXTURE_ARTIFACT_BYTE_BOUND' and type(artifact['bytes']) is int and artifact['bytes']==c['bounds']['fixturePacketBytes']==67108864 and artifact['serializedPacketFiles']==1 and artifact['fullStateSerializationsInPacket']==10 and artifact['operationalStopBoundNotFitPrediction'] is True,'GENUINE_ARTIFACT_BOUND')
 protection=authenticate_current_protection(g,c)
 tools=g['runtimeTools'];need(set(tools)=={'python','node','vitestEntry','vitestPackage'},'PHYSICAL_TOOLS')
 for r in tools.values():read(r)
 need(pathlib.Path(sys.executable).resolve(strict=True)==pathlib.Path(tools['python']['path']),'ACTUAL_PYTHON');need(load(tools['vitestPackage'])['version']=='2.1.9','VITEST_VERSION');need(os.access(tools['node']['path'],os.X_OK),'EXECUTABLE_NODE')
 source=read(c['proofMethods']);ns={'__name__':'qualified_fullfunction_proof_library','__file__':c['proofMethods']['path'],'_BOOTSTRAP_START':START,'_AUTHORITY':{'laneLock':g['laneLock'],'additionalRefs':g.get('additionalRefs',{})}};exec(compile(source,c['proofMethods']['path'],'exec'),ns)
 proof_config=dict(proof_config,runId=c['runId'],laneLog=c['laneLog']);ns['CONFIG']=proof_config;ns['CURRENT_HEAD']=c['operationalHead'];run=c['runId'];manifest5=ns['load_m0_authorities']();ns['guard'](run)
 copied=load(proof_config['sourceAuthorities']['m0CopyParentAdoption']);mirror=pathlib.Path(proof_config['mirrorPath']);need(mirror==pathlib.Path(copied['mirrorPath']) and mirror.is_absolute() and mirror.parent==ns['MIRROR_ROOT'],'AUTHENTIC_ADMITTED_MIRROR_LEAF')
 need(ns['shutil'].disk_usage(ns['S']).free>=ns['PREFLIGHT'],'ORIGINAL_3_5_GIB_PREFLIGHT')
 def proofs():
  ns['guard'](run);sp=ns['full_source_check'](mirror,manifest5,run,True);ns['exact_package_roles'](run);dp=ns['full_dependency_check'](ns['REPO']/'node_modules',run);need(sp==t['freshSourceProof'] and dp==t['freshDependencyProof'],'ACTUAL_CURRENT_FULL_PROOFS');return sp,dp
 before_source,before_deps=proofs();out=pathlib.Path(c['outputPath']);need(out.parent==ns['S'] and not os.path.lexists(out),'FRESH_OUTPUT');out.mkdir(mode=0o700)
 first=write(out/'FIRST-PROOF.json',{'schema':'1370-fullfunction-first-proof/v1','controllerPid':os.getpid(),'grant':gr,'typesAdoption':g['typesAdoption'],'proofMethods':c['proofMethods'],'proofConfig':c['proofConfig'],'sourceProof':before_source,'dependencyProof':before_deps})
 binding={'controllerPid':os.getpid(),'grant':gr,'firstProof':first,'currentProtection':g['currentProtection'],'schema':'1370-fullfunction-controller-binding/v1','genuineTypesAdoptionAuthenticated':True,'artifactBoundAuthenticated':True,'sourceReviewAuthenticated':True,'typesAdoption':g['typesAdoption'],'artifactBoundAdoption':g['artifactBoundAdoption'],'sourceReview':g['sourceReview'],'operationalHead':c['operationalHead'],'productionSourceTree':c['productionSourceTree'],'outputPath':str(out),'runtimeTools':tools,'remainingSeconds':remaining(),'sourceBefore':before_source,'dependencyBefore':before_deps};br=write(out/'CONTROLLER-BINDING.json',binding)
 argv=[tools['node']['path'],str(HERE/'run-fullfunction.mjs'),br['path'],br['sha256']];env=dict(os.environ);env.pop('NODE_OPTIONS',None);env.pop('NODE_PATH',None);env['PYTHONDONTWRITEBYTECODE']='1'
 child=None;node_spawn_attempted=False;sel=None;fds={};failure=None;after_source=None;after_deps=None;node_result=None;streams={'stdout':bytearray(),'stderr':bytearray()}
 try:
  node_spawn_attempted=True
  child=subprocess.Popen(argv,cwd=HERE,env=env,stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=False);sel=selectors.DefaultSelector()
  for name,f in [('stdout',child.stdout),('stderr',child.stderr)]:os.set_blocking(f.fileno(),False);sel.register(f,selectors.EVENT_READ,name)
  while sel.get_map() or child.poll() is None:
   ns['source_step'](run)
   for key,_ in sel.select(timeout=min(.05,remaining())):
    b=os.read(key.fileobj.fileno(),8192)
    if not b:sel.unregister(key.fileobj);key.fileobj.close();continue
    streams[key.data].extend(b);need(len(streams[key.data])<=c['bounds']['streamBytes'],'NODE_STREAM_CAP')
  ns['source_step'](run);need(child.wait(timeout=remaining())==0,'NODE_EXIT');nr=role(out/'NODE-RESULT.json',131072);candidate=load(nr,131072);need(candidate['status']=='PASS_REAL_FULL_FUNCTION_FIXTURES_BASELINE_SPECIFIC_TYPED_CATCH_RED' and candidate['actualGameplayPrefixExecuted'] is True and candidate['naturalBoundaryWeeks']==[196,197,208] and candidate['syntheticVariantsExplicit'] is True and candidate['neutralityAccepted'] is False and len(candidate['phases'])==3 and [r['name'] for r in candidate['phases']]==['generate','baseline','typed-catch-mutant'] and all(r['childExit']==0 for r in candidate['phases']),'NODE_SPECIFIC_RESULT');node_result=candidate
  after_source,after_deps=proofs();need(after_source==before_source and after_deps==before_deps,'COMPLETE_POST_PROOF_EQUALITY')
 except BaseException as exc:failure=str(exc) or repr(exc)
 finally:
  if child is not None and child.poll() is None:
   try:child.kill()
   except ProcessLookupError:pass
   try:child.wait(timeout=max(.001,min(1,END-time.monotonic())))
   except BaseException:failure='STOP_DIRECT_NODE_REAP_UNVERIFIED'
  if sel is not None:sel.close()
  for f in (() if child is None else (child.stdout,child.stderr)):
   if not f.closed:f.close()
  # The enclosing qualified recorder always clears the entire owned group,
  # including framework children, before it can report success.
  remaining()
  for name,b in streams.items():
   fd=os.open(out/(name+'.bin'),os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
   with os.fdopen(fd,'wb') as f:f.write(b);f.flush();os.fsync(f.fileno())
  result={'schema':'1370-real-fullfunction-qualification-result/v1','status':failure or 'PASS_REAL_FULL_FUNCTION_QUALIFICATION_PENDING_FULL_POSTFLIGHT','sourceBefore':before_source,'dependencyBefore':before_deps,'sourceAfter':after_source,'dependencyAfter':after_deps,'actualNodeExit':None if child is None else child.returncode,'nodePid':None if child is None else child.pid,'nodeResult':None if node_result is None else nr,'typesAdoption':g['typesAdoption'],'artifactBoundAdoption':g['artifactBoundAdoption'],'currentProtection':g['currentProtection'],'fixture':None if node_result is None else node_result['fixture'],'actualGameplayPrefixExecuted':True if node_result is not None else (None if node_spawn_attempted else False),'requestedNaturalBoundaryWeeks':[196,197,208],'naturalBoundaryWeeks':None if node_result is None else node_result['naturalBoundaryWeeks'],'syntheticVariantsExplicit':True,'neutralityAccepted':False,'fullProtectedPostflightAccepted':False,'executionAuthorization':False,'elapsedSeconds':time.monotonic()-START,'aggregateChildSeconds':300}
  rr=write(out/'RESULT.json',result);remaining();print(json.dumps({'status':result['status'],'result':rr}),flush=True)
 return 1 if failure else 0
if __name__=='__main__':
 try:code=main()
 except BaseException as exc:print('STOP_FULLFUNCTION '+repr(exc),file=sys.stderr,flush=True);code=1
 sys.exit(code)
