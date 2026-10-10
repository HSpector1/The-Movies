import ast,difflib,hashlib,json
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');B=S/'1370-aq-native-refusal-fullfunction-current-prelaunch-preparation-source-20261010-r1';N=S/'1370-aq-native-refusal-fullfunction-current-prelaunch-preparation-source-20261010-r2'
N.mkdir(exist_ok=True)
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
proof={}
for name in ('current-ap-root-prelaunch.py','run_current_ap_prelaunch_once.py','read_current_ap_prelaunch.py'):
 old=(B/name).read_text();t=old
 for stem in ('preparation-source','parent-recorded','output'):
  t=t.replace('1370-aq-native-refusal-fullfunction-current-prelaunch-'+stem+'-20261010-r1','1370-aq-native-refusal-fullfunction-current-prelaunch-'+stem+'-20261010-r2')
 if name=='current-ap-root-prelaunch.py':
  t=t.replace("authority['snapshot']==c['baseline']==c['protectedSnapshot']","authority['snapshot']==c['baseline']")
  t=t.replace("require(snap==base and snap['schema']=='1370-a208-current-operational-full-guard-snapshot-r2' and snap['status']=='GUARDS_ACCEPTED_READONLY' and snap['phase']=='before-fill' and snap['baseline'] is None,'truthful fresh before-fill baseline reuse under continuous freeze')", "recent=json.loads(pinned(c['recentProtectedPostflightReadback'],100000));require(recent['schema']=='1370-ap-native-fullfunction-shared-fullpostflight-readback/v1' and recent['status']=='ACTUAL_FULLFUNCTION_SHARED_FULL_POSTFLIGHT_COMPLETE_PENDING_INDEPENDENT_REVIEW' and recent['fullImmutableEqual'] is True and recent['nineStrictRootsEqual'] is True and recent['laneReleased'] is True and recent['baseline']==c['baseline'] and recent['fullPostflightSnapshot']==c['protectedSnapshot'],'genuine recent complete postflight');require(snap['schema']=='1370-a208-current-operational-full-guard-snapshot-r2' and snap['status']=='GUARDS_ACCEPTED_READONLY' and snap['phase']=='postflight' and snap['baseline']=={k:c['baseline'][k] for k in ('path','sha256')} and snap['immutable']==base['immutable'] and base['phase']=='before-fill' and base['baseline'] is None,'truthful separate recent postflight and original baseline')")
  t=t.replace("'baselinePhase':'before-fill'","'baselinePhase':'postflight-against-before-fill','recentProtectedPostflightReadback':c['recentProtectedPostflightReadback']")
 elif name=='run_current_ap_prelaunch_once.py':
  t=t.replace('len(sys.argv)==5','len(sys.argv)==7')
  t=t.replace("config['protectedSnapshot']=authority['snapshot'];guardGrant=", "recentRole,recent=check(sys.argv[5],sys.argv[6]);assert recent['schema']=='1370-ap-native-fullfunction-shared-fullpostflight-readback/v1' and recent['status']=='ACTUAL_FULLFUNCTION_SHARED_FULL_POSTFLIGHT_COMPLETE_PENDING_INDEPENDENT_REVIEW' and recent['fullImmutableEqual'] is True and recent['nineStrictRootsEqual'] is True and recent['laneReleased'] is True and recent['baseline']==authority['snapshot'];assert role(recent['fullPostflightSnapshot']['path'])==recent['fullPostflightSnapshot'];config['protectedSnapshot']=recent['fullPostflightSnapshot'];config['recentProtectedPostflightReadback']=recentRole;guardGrant=")
  t=t.replace("sorted(set([guardGrant['ownedPgid']]+rb['actualOwnedIds']))","sorted(set(recent['actualOwnedGroupIds']))")
  t=t.replace("'currentFullPreflightSnapshot':authority['snapshot'],","'currentFullPreflightSnapshot':authority['snapshot'],'recentProtectedPostflightReadback':recentRole,'recentProtectedPostflightSnapshot':recent['fullPostflightSnapshot'],")
 else:
  t=t.replace("config['protectedSnapshot']==config['baseline']==authority['snapshot']","config['baseline']==authority['snapshot'] and config['protectedSnapshot']==g['recentProtectedPostflightSnapshot']")
  t=t.replace("sorted(set([guardGrant['ownedPgid']]+rb['actualOwnedIds']))","sorted(set(json.loads(Path(g['recentProtectedPostflightReadback']['path']).read_bytes())['actualOwnedGroupIds']))")
  t=t.replace("v['protectedSnapshot']==v['baseline']==authority['snapshot']","v['baseline']==authority['snapshot'] and v['protectedSnapshot']==g['recentProtectedPostflightSnapshot']")
  t=t.replace("v['baselinePhase']=='before-fill'","v['baselinePhase']=='postflight-against-before-fill'")
  t=t.replace("snap['phase']=='before-fill' and snap['baseline'] is None","snap['phase']=='postflight' and snap['baseline']=={k:authority['snapshot'][k] for k in ('path','sha256')}")
  t=t.replace("'baselinePhase':'before-fill'","'baselinePhase':'postflight-against-before-fill','recentProtectedPostflightReadback':g['recentProtectedPostflightReadback'],'recentProtectedPostflightSnapshot':g['recentProtectedPostflightSnapshot']")
 if name=='run_current_ap_prelaunch_once.py':
  t=t.replace('len(sys.argv)==7','len(sys.argv)==9')
  t=t.replace("config['protectedSnapshot']=recent['fullPostflightSnapshot'];", "stopRole,stop=check(sys.argv[7],sys.argv[8]);assert stop['schema']=='1370-root-native-fullfunction-generation-stop-observed-adoption/v1' and stop['status']=='ROOT_ADOPTED_FULLFUNCTION_GENERATION_HEAD_GUARD_STOP_WITH_FULL_SHARED_POSTFLIGHT' and stop['executionAuthorization'] is False and stop['fullPostflightReadback']==recentRole and stop['fullPostflightSnapshot']==recent['fullPostflightSnapshot'];si=json.loads(Path(stop['independentObservedReview']['path']).read_bytes());assert role(stop['independentObservedReview']['path'])==stop['independentObservedReview'] and si['schema']=='1370-aq-native-fullfunction-generation-stop-independent-observed-review/v1' and si['decision']=='ACCEPT_ACTUAL_GENERATION_HEAD_GUARD_STOP_WITH_ORIGINAL_SHARED_FULL_POSTFLIGHT_ONLY' and si['concreteFindings']==[] and si['executionAuthorization'] is False;config['recentProtectedStopAdoption']=stopRole;config['protectedSnapshot']=recent['fullPostflightSnapshot'];")
  t=t.replace("'recentProtectedPostflightReadback':recentRole,", "'recentProtectedStopAdoption':stopRole,'recentProtectedPostflightReadback':recentRole,")
 elif name=='current-ap-root-prelaunch.py':
  t=t.replace("recent=json.loads(pinned(c['recentProtectedPostflightReadback'],100000));", "stop=json.loads(pinned(c['recentProtectedStopAdoption'],100000));require(stop['schema']=='1370-root-native-fullfunction-generation-stop-observed-adoption/v1' and stop['status']=='ROOT_ADOPTED_FULLFUNCTION_GENERATION_HEAD_GUARD_STOP_WITH_FULL_SHARED_POSTFLIGHT' and stop['executionAuthorization'] is False and stop['fullPostflightReadback']==c['recentProtectedPostflightReadback'] and stop['fullPostflightSnapshot']==c['protectedSnapshot'],'genuine independently adopted latest protected STOP');recent=json.loads(pinned(c['recentProtectedPostflightReadback'],100000));")
 elif name=='read_current_ap_prelaunch.py':
  t=t.replace("'recentProtectedPostflightReadback':g['recentProtectedPostflightReadback'],", "'recentProtectedStopAdoption':g['recentProtectedStopAdoption'],'recentProtectedPostflightReadback':g['recentProtectedPostflightReadback'],")
 t=t.replace("'baselinePhase':'postflight-against-before-fill'", "'baselinePhase':'before-fill','protectedSnapshotPhase':'postflight'")
 t=t.replace("v['baselinePhase']=='postflight-against-before-fill'", "v['baselinePhase']=='before-fill' and v['protectedSnapshotPhase']=='postflight'")
 ast.parse(t);(N/name).write_text(t)
 nd=list(difflib.ndiff(old.splitlines(True),t.splitlines(True)));assert ''.join(difflib.restore(nd,1))==old and ''.join(difflib.restore(nd,2))==t
 proof[name]={'baseline':role(B/name),'candidate':role(N/name),'losslessNdiff':nd}
c=json.loads((B/'PRELAUNCH-CONFIG-UNFILLED.json').read_bytes());c['recentProtectedPostflightReadback']=None;c['recentProtectedStopAdoption']=None
(N/'PRELAUNCH-CONFIG-UNFILLED.json').write_text(json.dumps(c,sort_keys=True,indent=2)+'\n')
(N/'WHOLE-FORWARD-INVERSE-DRAFT.json').write_text(json.dumps(proof,indent=2)+'\n')
(N/'OPERATIONAL-AMENDMENT-DRAFT.json').write_text(json.dumps({'sourceOnlyUnsealed':True,'originalBeforeFillAuthority':c['currentFullPreflightAdoption'],'originalImmutableBaseline':c['baseline'],'recentProtectedPostflightReadback':None,'recentProtectedPostflightSnapshot':None,'independentPostflightReview':None,'reviewedPriorStopAdoption':None,'sameImmutableRequired':True,'noRelabelingRecentPostAsOriginalFullPreflight':True,'originalCurrentHelpersAnd180PerCommandPreserved':True,'wholeScanDeadline':None,'runtimeExecuted':False},indent=2)+'\n')
print(json.dumps({'draftPackage':str(N),'sourceOnly':True,'runtimeExecuted':False,'missing':'genuine completed postflight and independent/root protected STOP authority'}))
