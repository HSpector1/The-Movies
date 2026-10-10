"""Finite source-only derivative. Compile checks never execute generated modules."""
from pathlib import Path
import ast,difflib,hashlib,json,os,warnings
S=Path('/Users/zacheryspector/studio-scratch');D=Path(__file__).resolve().parent
B=S/'1370-ao-m0-fullfunction-current-prelaunch-preparation-source-20261010-r1'
A=S/'1370-ap-root-continuation-20261010-r1'
def role(p):
 b=Path(p).read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(name,v):
 p=D/name
 with p.open('x') as f:f.write(json.dumps(v,indent=2)+'\n');f.flush();os.fsync(f.fileno())
 return role(p)
def helpers(t):return {n.name:ast.get_source_segment(t,n) for n in ast.parse(t).body if isinstance(n,(ast.FunctionDef,ast.ClassDef)) and n.name!='main'}
bp=json.loads((B/'SOURCE-PINS.json').read_text())
for r in bp['files'].values():assert role(r['path'])==r
ar=role(A/'CURRENT-AO-FULL-PREFLIGHT-OBSERVED-ADOPTION.json')
assert ar['sha256']=='e3804904e003a7178e98c3d6d83c52ff32194f1117cef780d24c3d1c88849552'
authority=json.loads(Path(ar['path']).read_text())
oldguard=S/'1370-ao-current-operational-fullguard-source-20261010-r1'
newguard=S/'1370-ap-current-operational-fullguard-source-20261010-r1'
oldparent=S/'1370-ao-m0-fullfunction-current-prelaunch-parent-recorded-20261010-r1'
parent=S/'1370-ap-native-fullfunction-current-prelaunch-parent-recorded-20261010-r1'
output=S/'1370-ap-native-fullfunction-current-prelaunch-output-20261010-r1'
changes=[
 ('1370-ao-root-continuation-20261010-r1','1370-ap-root-continuation-20261010-r1'),
 (oldparent.name,parent.name),
 (str(B),str(D)),(str(oldparent),str(parent)),
 ('1370-ao-m0-fullfunction-current-prelaunch-output-20261010-r1',output.name),
 (str(oldguard),str(newguard)),
 ('1370-ao-current-operational-fullguard-source-20261010-r1',newguard.name),
 ('CURRENT-AN-FULL-PREFLIGHT-OBSERVED-ADOPTION.json','CURRENT-AO-FULL-PREFLIGHT-OBSERVED-ADOPTION.json'),
 ('753a7597c20032c70b2a07c9001de15ba1f72b5a0a5ac7706e340228da5fef5a',ar['sha256']),
 ("'bytes': 4727","'bytes': 4729"),
 ('1370-ao-root-current-an-fullpreflight-adoption/v1','1370-ap-root-current-ao-fullpreflight-adoption/v1'),
 ('ROOT_ADOPTED_CURRENT_AN_FULL_PREFLIGHT','ROOT_ADOPTED_CURRENT_AO_FULL_PREFLIGHT'),
 ('ACCEPT_ACTUAL_CURRENT_AN_FULL_PREFLIGHT_ONLY','ACCEPT_ACTUAL_CURRENT_AO_FULL_PREFLIGHT_ONLY'),
 ('f9d2d7fda1b5df5c01176c142bd6b16c9be9cc78963fe73e7fc62640b82a9cdd',authority['config']['sha256']),
 ('2915fd60e26b894fd431e4483e23d9beed79b3332dc3c7173b0a37fd3130ef1d',authority['guardSource']['sha256']),
 ('63fe53279f1703e9f67d587481ee741e15502fa4a167b1f33e9c7741d13389e9',authority['snapshot']['sha256']),
 ('0cf8b1d0bbf7d1977413d0c3074407cc8f7b80a4',authority['productionHead']),
 ('current-an-root-prelaunch.py','current-ao-root-prelaunch.py'),
 ('run_current_an_prelaunch_once.py','run_current_ao_prelaunch_once.py'),
 ('read_current_an_prelaunch.py','read_current_ao_prelaunch.py'),
 ('ACCEPT_STATIC_CURRENT_AN_FULLFUNCTION_PRELAUNCH_SOURCE_ONLY','ACCEPT_STATIC_CURRENT_AO_FULLFUNCTION_PRELAUNCH_SOURCE_ONLY'),
 ('1370-root-m0-current-an-root-prelaunch-config/v2','1370-root-m0-current-ao-root-prelaunch-config/v2'),
 ('1370-root-m0-current-an-root-prelaunch-observation/v2','1370-root-m0-current-ao-root-prelaunch-observation/v2'),
 ('1370-ao-current-an-root-prelaunch-grant/v2','1370-ap-current-ao-root-prelaunch-grant/v2'),
 ('1370-ao-current-an-root-prelaunch-readback/v2','1370-ap-current-ao-root-prelaunch-readback/v2'),
 ('CURRENT_AN_ROOT_PREFLIGHT_COMPLETED','CURRENT_AO_ROOT_PREFLIGHT_COMPLETED'),
 ('GRANTED_ONCE_CURRENT_AN_ROOT_PREFLIGHT','GRANTED_ONCE_CURRENT_AO_ROOT_PREFLIGHT'),
 ('fullfunction-current-an-protection','fullfunction-current-ao-protection'),
 ('currentAN','currentAO'),
 ('M0-FULLFUNCTION-CURRENT-PREFLIGHT-READBACK.json','M0-NATIVE-FULLFUNCTION-CURRENT-PREFLIGHT-READBACK.json'),
]
control_checks="""assert controls['schema']=='1370-root-native-observer-controls-observed-adoption/v1' and controls['status']=='ROOT_ADOPTED_ACTUAL_NATIVE_OBSERVER_72_CONTROLS_ONLY' and controls['executionAuthorization'] is False
assert controls['actualExit']==0 and controls['soleLaneReleased'] is True and controls['caseCount']==72 and controls['positiveCount']==13 and controls['specificNegativeCount']==59
for flag in ('game','fullQualificationAccepted','fullBodyGameAssertionsExecuted','privateM0ReadOrWritten'):assert controls[flag] is False
for value in controls.values():
 if type(value) is dict and set(value)=={'path','bytes','sha256'}:assert role(value['path'])==value
rbrole=controls['readback'];rb=json.loads(Path(rbrole['path']).read_bytes())
assert rb['schema']=='1370-root-native-observer-controls-actual-readback/v1' and rb['status']=='ACTUAL_PURE_72_NATIVE_OBSERVER_CONTROLS_COMPLETE_PENDING_INDEPENDENT_REVIEW'
assert rb['toolExit']==0 and rb['laneReleased'] is True and rb['caseCount']==72 and rb['positiveCount']==13 and rb['specificNegativeCount']==59
assert controls['actualOwnedIds']==rb['actualOwnedIds'] and type(rb['actualOwnedIds']) is list and rb['actualOwnedIds'] and all(type(n) is int and n>1 for n in rb['actualOwnedIds']) and rb['actualOwnedIds']==sorted(set(rb['actualOwnedIds']))
assert rb['scopedOwnershipChecks']==controls['scopedOwnershipChecks']==[{'id':n,'kind':kind,'result':'ESRCH'} for n in rb['actualOwnedIds'] for kind in ('pid','pgid')]
ind=json.loads(Path(controls['independentObservedReview']['path']).read_bytes());assert ind['schema']=='1370-native-observer-controls-independent-observed-review/v1' and ind['decision']=='ACCEPT_ACTUAL_PURE_NATIVE_OBSERVER_72_CONTROLS_ONLY' and ind['concreteFindings']==[] and ind['executionAuthorization'] is False
assert ind['readback']==controls['readback']
worker=json.loads(Path(controls['workerResult']['path']).read_bytes());matrix=json.loads(Path(controls['inputRoles']['MATRIX.json']['path']).read_bytes())
assert role(controls['inputRoles']['MATRIX.json']['path'])==controls['inputRoles']['MATRIX.json']
assert worker['schema']=='1370-native-observer-independent-controls-result/v1' and worker['status']=='PURE_NATIVE_OBSERVER_CODEC_SINK_AND_AFFECTED_CONSUMERS_COMPLETED_UNADOPTED'
assert worker['caseCount']==72 and worker['positiveCount']==13 and worker['specificNegativeCount']==59 and worker['originalOrderingCases']==18 and worker['originalParserCasesReplayed']==0
assert worker['results']==[dict(c,verdict='ACCEPT_POSITIVE' if c['expected']=='GREEN' else 'ACCEPT_SPECIFIC_REFUSAL') for c in matrix['cases']]
"""
proof=[]
mapping={'current-an-root-prelaunch.py':'current-ao-root-prelaunch.py','run_current_an_prelaunch_once.py':'run_current_ao_prelaunch_once.py','read_current_an_prelaunch.py':'read_current_ao_prelaunch.py'}
for oldname,name in mapping.items():
 old=(B/oldname).read_text();new=old;applied=[]
 def change(before,after,required=False):
  global new
  count=new.count(before)
  if required:assert count==1,(name,before,count)
  if count:new=new.replace(before,after);applied.append({'before':before,'after':after,'count':count})
 for before,after in changes:change(before,after)
 if name=='run_current_ao_prelaunch_once.py':
  change('not sys.flags.optimize and len(sys.argv)==3','not sys.flags.optimize and len(sys.argv)==5',True)
  start=new.index('ar,authority=check(');end=new.index('typesrole,types=check(',start)
  originalblock=new[start:end]
  block="ar,authority=check("+repr(ar['path'])+','+repr(ar['sha256'])+");cr,controls=check(sys.argv[3],sys.argv[4])\n"
  block+="assert authority['schema']=='1370-ap-root-current-ao-fullpreflight-adoption/v1' and authority['status']=='ROOT_ADOPTED_CURRENT_AO_FULL_PREFLIGHT' and authority['protectedFreezeContinues'] is True and authority['executionAuthorization'] is False and authority['game'] is False\n"
  block+="for value in authority.values():\n if type(value) is dict and set(value)=={'path','bytes','sha256'}:assert role(value['path'])==value\n"
  block+=control_checks
  change(originalblock,block,True)
  change("config['ownedPgids']=[14070,82947,83213]","config['ownedPgids']=sorted(set([18361]+rb['actualOwnedIds']))",True)
 if name=='read_current_ao_prelaunch.py':
  start=new.index('assert g[\'currentFullPreflightAdoption\']==');end=new.index('types=json.loads(',start)
  block=new[start:end]
  replacement="assert g['currentFullPreflightAdoption']=="+repr(ar)+"\ncontrols=json.loads(Path(g['observerControlsAdoption']['path']).read_bytes())\n"+control_checks+"assert g['observerControlsReadback']==rbrole\n"
  change(block,replacement,True)
  change("==[14070,82947,83213]","==sorted(set([18361]+rb['actualOwnedIds']))",True)
 restored=new
 for c in reversed(applied):
  assert restored.count(c['after'])==c['count'],(name,c['after'])
  restored=restored.replace(c['after'],c['before'])
 assert restored==old and helpers(new)==helpers(old)
 with warnings.catch_warnings():warnings.simplefilter('error',SyntaxWarning);compile(new,str(D/name),'exec')
 for fn,body in [(name,new),('BASELINE-'+oldname,old)]:
  with (D/fn).open('x') as f:f.write(body)
 for direction,left,right in [('forward',old,new),('inverse',new,old)]:
  with (D/(name+'.'+direction+'.diff')).open('x') as f:f.writelines(difflib.unified_diff(left.splitlines(True),right.splitlines(True),fromfile='before',tofile='after'))
 proof.append({'source':role(D/name),'baseline':role(B/oldname),'applications':applied,'wholeInverseActuallyEqual':True,'unchangedOriginalHelpers':list(helpers(old)),'staticCompileWarningErrorOnly':True})
scanner=(D/'current-ao-root-prelaunch.py').read_text()
assert repr(ar['path']) in scanner
assert 'SCRATCH/'+repr(parent.name) in scanner
assert str(B) not in scanner and '1370-ao-root-continuation-20261010-r1' not in scanner
assert '1370-ao-m0-fullfunction-current-prelaunch-parent-recorded-20261010-r1' not in scanner
assert str(D/'current-ao-root-prelaunch.py') in (D/'run_current_ao_prelaunch_once.py').read_text() or "str(Q/'current-ao-root-prelaunch.py')" in (D/'run_current_ao_prelaunch_once.py').read_text()
config=json.loads((B/'PRELAUNCH-CONFIG-UNFILLED.json').read_text())
config.update(schema='1370-root-m0-current-ao-root-prelaunch-config/v2',baseline=authority['snapshot'],currentFullPreflightAdoption=ar,guardConfig=authority['config'],guardSource=authority['guardSource'])
assert all(config[k] is None for k in ('protectedSnapshot','ownedPgids','outputPath'))
put('PRELAUNCH-CONFIG-UNFILLED.json',config)
amendment=json.loads((B/'OPERATIONAL-SCOPE-AMENDMENT.json').read_text())
amendment.update(schema='1370-ap-current-ao-prelaunch-reuse-scope-amendment/v2',currentFullPreflightAdoption=ar,snapshot=authority['snapshot'],observerControlsAdoption=None,
 amendment='Reuse genuinely accepted fresh currentAO before-fill complete fullguard snapshot for immediately refreshed original current/root/ancestry/FD/process/disk checks under continuous freeze. Explicit scope extension, not a claim original after-fill wording directly covers before-fill.',
 rationale='AO published documentation transition ended the older AN Git freeze. Original fullguard3186 genuinely established currentAO full maps and nine strict roots/current-before-after; no new candidate fill/protected writes. Only scratch source preparation has followed so far; native public72 controls must finish and be independently/root-adopted before this shortprelaunch launcher can run.',
 historicalTypesPostflightDoesNotEqualCurrentAOBaselineByAssumption=True)
amendment.pop('historicalTypesPostflightDoesNotEqualCurrentANBaselineByAssumption',None)
put('OPERATIONAL-SCOPE-AMENDMENT.json',amendment)
PY='/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14'
argv=put('EXACT-ARGV.json',{'schema':'1370-ap-current-ao-prelaunch-argv/v2','cwd':'/Users/zacheryspector/The-Movies-headless-program',
 'launcherArgv':[PY,'-I','-B',str(D/'run_current_ao_prelaunch_once.py'),None,None,None,None],
 'launcherFutureOperands':['independentSourceReviewPath','independentSourceReviewSha256','actualNativeControlsAdoptionPath','actualNativeControlsAdoptionSha256'],
 'directScannerArgv':[PY,'-I','-B',str(D/'current-ao-root-prelaunch.py'),str(parent/'CONFIG.json'),None],
 'readerArgv':[PY,'-I','-B',str(D/'read_current_ao_prelaunch.py'),None,None],'readerFutureOperands':['actualToolSessionId','actualScannerPidPgidSid'],
 'parent':str(parent),'output':str(output),'actualOwnedGroups':None,'knownPriorFullguardOwnedGroup':18361,'actualNativeControlsAdoption':None,
 'actualGrant':None,'actualTool':None,'actualReadback':None,'executionAuthorization':False})
put('CONTRACT.json',{'schema':'1370-ap-current-ao-prelaunch-source-contract/v2','requiredSourceReviewDecision':'ACCEPT_STATIC_CURRENT_AO_FULLFUNCTION_PRELAUNCH_SOURCE_ONLY',
 'requiredSourceReviewFields':['sourceManifest','sourcePins','routeSourcePins','concreteFindings','executionAuthorization'],
 'reviewAliasNames':['current-ao-root-prelaunch.py','PRELAUNCH-CONFIG-UNFILLED.json','run_current_ao_prelaunch_once.py','read_current_ao_prelaunch.py'],
 'nativeControlsProspectiveContract':{'rootSchema':'1370-root-native-observer-controls-observed-adoption/v1','rootStatus':'ROOT_ADOPTED_ACTUAL_NATIVE_OBSERVER_72_CONTROLS_ONLY','readbackSchema':'1370-root-native-observer-controls-actual-readback/v1','readbackStatus':'ACTUAL_PURE_72_NATIVE_OBSERVER_CONTROLS_COMPLETE_PENDING_INDEPENDENT_REVIEW','independentDecision':'ACCEPT_ACTUAL_PURE_NATIVE_OBSERVER_72_CONTROLS_ONLY','actualRole':None,'caseCount':72,'positiveCount':13,'specificNegativeCount':59},
 'protectionContract':{'schema':'1370-root-fullfunction-current-protection/v3','status':'ROOT_ADOPTED_CURRENT_FULLFUNCTION_PREFLIGHT_UNDER_CONTINUOUS_FREEZE','currentAOFullPreflightAdoption':ar,'currentAOFullPreflightSnapshot':authority['snapshot'],'actualShortPreflight':None,'actualShortReadback':None,'actualShortIndependentReview':None,'historicalTypesHead':'7087f116cf998fd86e33fb8e004df628e0686dbd'},
 'originalScannerHelpersUnchanged':True,'originalConfigFillsOnly':['protectedSnapshot','ownedPgids','outputPath'],'freshFullInventory':False,'perCommandTimeoutSeconds':180,'overallTimeoutAdded':False,'rawPsFdLocalHashSizeOnly':True,'historicalTypesRemainHistorical':True,'scopeAmendmentNeedsExternalParentReview':True,'game':False,'executionAuthorization':False})
put('SOURCE-PROOF.json',{'schema':'1370-ap-current-ao-prelaunch-source-proof/v2','predecessorSourcePins':role(B/'SOURCE-PINS.json'),'applications':proof,'wholeInverseApplications':3,
 'unchangedOriginalHelperCounts':[len(helpers((B/n).read_text())) for n in mapping],'currentAOAuthority':ar,
 'noRuntimeExecuted':True,'runtimeDependentNativeControlsRoleAndIdsUnfilled':True,'noFutureOutcomeClaim':True,'executionAuthorization':False})
files={p.name:role(p) for p in D.iterdir() if p.is_file()}
manifest=put('SOURCE-PINS.json',{'schema':'1370-ap-current-ao-prelaunch-source-pins/v2','files':files,'status':'SOURCE_ONLY_UNRUN_PENDING_INDEPENDENT_REVIEW','executionAuthorization':False})
seal=put('SEAL.json',{'schema':'1370-ap-source-seal/v1','sourceManifest':manifest,'payloadFiles':len(files),'actualExecution':False,'executionAuthorization':False})
for p in D.iterdir():p.chmod(0o444)
D.chmod(0o555)
print(json.dumps({'sourceManifest':manifest,'argv':argv,'seal':seal}))
