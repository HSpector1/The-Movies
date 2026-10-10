import hashlib,json,os,re,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent
def role(p):
 p=Path(p);st=p.lstat();assert p.is_absolute() and p.resolve()==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def checked(r):
 assert role(r['path'])==r;return Path(r['path']).read_bytes()
def put(p,v):
 with p.open('x') as f:json.dump(v,f,indent=2,sort_keys=True);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
manifest=role(sys.argv[1]);assert manifest['sha256']==sys.argv[2]
pins=json.loads(checked(manifest));assert pins['executionAuthorization'] is False
for r in pins['files'].values():checked(r)
contract=json.loads(checked(pins['files']['CONTRACT.json']));matrix=json.loads(checked(pins['files']['MATRIX.json']))
implementation=json.loads(checked(contract['implementationSourcePins']))
for name,r in contract['dependencyRoles'].items():assert implementation['files'][name]==r;checked(r)
checked(contract['api']);assert contract['api']==pins['api']
assert contract['implementationSourcePins']==pins['externalImplementationSourcePins']
lib=checked(pins['files']['run-observer-row-controls.mjs']).decode()
roster=lib.split('export const CASES = [',1)[1].split('].map(',1)[0]
literal=[{'id':a,'expected':b,'predicate':c} for a,b,c in re.findall(r"\['([^']+)','(GREEN|RED)','([^']+)'\]",roster)]
calls=re.findall(r"\btest\('([^']+)'",lib)
assert literal==matrix['cases'] and calls==[c['id'] for c in literal]
assert len(set(calls))==len(calls)==48
assert sum(c['expected']=='GREEN' for c in literal)==6 and sum(c['expected']=='RED' for c in literal)==42
assert contract['caseCount']==pins['caseCount']==48 and contract['positiveCount']==pins['positiveCount']==6 and contract['specificNegativeCount']==pins['specificNegativeCount']==42
assert re.findall(r"import .*? from '([^']+)'",lib)==['node:assert/strict']
assert not re.search(r'\bimport\s*\(',lib)
assert contract['entry']['sharedActualArmHelperRequired'] is True
out=S/'1370-ao-observer-row-diagnostic-independent-controls-root-source-review-20261010-r2';assert not out.exists();out.mkdir(mode=0o700)
receipt={'schema':'1370-observer-row-diagnostic-independent-controls-source-review/v1','decision':'ACCEPT_STATIC_PURE_OBSERVER_ROW_DIAGNOSTIC_CONTROLS_SOURCE_ONLY','reviewer':'root, independent of cleanup_independent_red control author and m0 implementation author','scope':'Static independent review of complete pure control library and exact source/dependency contracts. No source imports, JavaScript parsing, runtime controls, private reads or game acceptance.','sourceManifest':manifest,'sourcePins':pins['files'],'implementationSourcePins':contract['implementationSourcePins'],'dependencyRoles':contract['dependencyRoles'],'api':contract['api'],'caseCount':48,'positiveCount':6,'specificNegativeCount':42,'concreteFindings':[],'executionAuthorization':False,'actualControls':None,'checks':{'allNamedPayloadsFullByteHashSizeAuthenticated':True,'exactUniqueOrderedRosterMatchesEveryAuthoredTestCall':True,'actualUnchangedPublicWitnessUsed':True,'actualSharedArmHelperUsed':True,'noGameOrPrivateImports':True,'specificOriginalErrorObjectAndMessageRequired':True,'arbitraryAssertionOrSetupErrorsCannotCountAsRed':True,'successfulRowsAndFrozenContextParity':True,'originalInclusive16384AndRefused16385AndCount512AndTotal2MiBBoundaries':True,'nativeUtf8EscapesSequenceAndTenFieldOccurrenceIdentity':True,'familyAssessmentSameContextAndMissingMalformedMismatchUnavailable':True,'boundedCanonicalContextReconstructionAndOutputSpecificOutcomes':True,'unsupportedGettersToJsonContextExtrasAndHugeKindDoNotReenterOrLeak':True,'sameStickyErrorSurvivesSwallowLaterErrorEndResetWriterFailures':True,'ordinaryNonObserverCleanupPrecedencePreserved':True,'firstOnlyEmissionAndResetPriorEvidenceImmutability':True,'priorRowsExactOriginalStreamAccounting':True},'limits':'This review accepts test source only. Implementation review and parent adoption must independently pass, then a genuine recorded route must run every exact control. Original observer bounds and failed prior sources remain unchanged.'}
rr=put(out/'RECEIPT.json',receipt);sr=put(out/'SEAL.json',{'receipt':rr,'reviewScript':role(__file__),'executionAuthorization':False});print(json.dumps({'review':rr,'seal':sr}))
