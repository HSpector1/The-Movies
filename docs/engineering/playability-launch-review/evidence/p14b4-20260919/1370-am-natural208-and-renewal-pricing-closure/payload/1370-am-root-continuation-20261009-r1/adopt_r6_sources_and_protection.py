import hashlib,json,os
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1'
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,d):
 with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
profiles=[('1370-c0-m0-types-collection-executor-source-after-al-20261009-r6','05ca05fbe689bcb48ab78507679373938bee867e846ea57b42e203fc9a92e3cf','1370-c0-m0-types-collection-source-independent-review-after-al-20261009-r6','0b2402bc664192c3a57b73bed3ce7e461d50171e8d01d5d0261ed4c921a101ea','ACCEPT_STATIC_M0_TYPES_COLLECTION_SOURCE_ONLY'),('1370-c0-m0-proof-types-parent-launch-preparation-after-al-20261009-r4','f27d8eae1416d94346dd43e495acad272bd203dfb1270c818e2ca949bdb35d15','1370-c0-m0-proof-types-parent-launch-preparation-independent-source-review-after-al-20261009-r4','63f3482c050b339375eb868178a614ff5d2191b2712cc454e619094c127306c5','ACCEPT_STATIC_M0_PROOF_TYPES_PARENT_LAUNCH_PREPARATION_SOURCE_ONLY')]
roles=[]
for package,sha,review,rsha,decision in profiles:
 p=S/package/'SOURCE-PINS.json';r=S/review/'RECEIPT.json';assert role(p)['sha256']==sha and role(r)['sha256']==rsha
 v=json.loads(r.read_bytes());assert v['decision']==decision and v['concreteFindings']==[] and v['executionAuthorization'] is False
 for row in json.loads(p.read_bytes())['files'].values():assert role(row['path'])==row
 roles.append({'sourcePins':role(p),'independentSourceReview':role(r)})
stop=A/'M0-TYPES-STOP-OBSERVED-ADOPTION.json';assert role(stop)['sha256']=='f3f4c5386c283a230f6905e3429d4e5dd050f986d6acda7c63e304ebd8dd6633'
t=json.loads(stop.read_bytes());assert t['status']=='ROOT_ADOPTED_OBSERVED_STOP_M0_TYPES_ROOT_TS5097_WITH_FULL_PROTECTED_POSTFLIGHT' and t['typesAccepted'] is False and t['fullProtectedPostflightAccepted'] is True and t['sourceDependencyProofsEqual'] is True
ad={'schema':'1370-root-m0-types-r6-parent-r4-source-adoption/v1','status':'ROOT_ADOPTED_R6_ROOT_EXTENSION_OPTION_AND_PARENT_R4_SOURCE_ONLY','sourceRoles':roles,'priorFailedTypesObservedAdoption':role(stop),'executionAuthorization':False,'actualR6Outcome':None,'repair':'One root noEmit command option allows the existing canonical .ts import syntax. No checked file, strict type rule, bridge source, UI command, runtime clock, output cap or preservation predicate is removed. Necessary fresh bindings are independently reviewed.','originalFailuresPreserved':True}
ar=put(A/'M0-R6-PARENT-R4-SOURCE-ADOPTION.json',ad)
old=json.loads((A/'M0-CURRENT-TYPES-PROTECTION.json').read_bytes());assert role(t['actualTypesResult']['path'])==t['actualTypesResult'];v=json.loads(Path(t['actualTypesResult']['path']).read_bytes())
assert v['sourceBefore']==v['sourceAfter']==old['freshSourceProof'] and v['nodeModulesBefore']==v['nodeModulesAfter']==old['freshDependencyProof']
assert role(t['fullPostflightSnapshot']['path'])==t['fullPostflightSnapshot'] and not os.path.lexists(S/'HEAVY-LANE-LOCK')
old.update(freshSourceProof=v['sourceAfter'],freshDependencyProof=v['nodeModulesAfter'],fullPostflightSnapshot=t['fullPostflightSnapshot'],failedTypeObservedAdoption=role(stop),independentFailedTypeObservedReview=t['independentObservedReview'],repairedSourceAdoption=ar,typesOrGameOutcomeAdmitted=False,scope='Actual unchanged M0 source/dependency proofs plus separately admitted full postflight after failed R5. Protection authority only for independently reviewed, separately granted R6 four-command route. R5 stays failed; R6 outcome remains unperformed.')
pr=put(A/'M0-CURRENT-TYPES-PROTECTION-R6.json',old)
print(json.dumps({'sourceAdoption':ar,'currentProtection':pr}))
