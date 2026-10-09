from pathlib import Path
import json,hashlib,ast
S=Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-c0-aging-era-settlement208-observer-after-aj-proposal-20261009-r1'
Q=S/'1370-c0-a208-minimal-exact-launch-input-map-after-aj-20261009-r1'
Q.mkdir(mode=0o700)
roles={}
def role(p,expected=None):
 p=Path(p);b=p.read_bytes();assert len(b)<=300000
 r={'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
 if expected:assert r['sha256']==expected
 roles[str(p)]=r;return r
def obj(p,expected=None):role(p,expected);return json.loads(Path(p).read_bytes())
pins=obj(P/'SOURCE-PINS.json','3452218ceabf6bb63f690db2eff3f83edda56db71c5826982a92ae0c73085aaf')
for n in ['PLAN.md','BINDING-UNFILLED.json','PHASE-INPUT-PROOF.json','CONTROL-RECIPE-HELD.json','witness.mts','supervise.py','outer-recorder.py','witness-core.mjs','bounds-guard.mjs','worktree-guard.mjs','POLICY.sb']:
 if n in pins['files']:
  r=role(P/n,pins['files'][n]['sha256']);assert r['bytes']==pins['files'][n]['bytes']
 else:
  r=role(P/n,pins['supportFiles'][n]['sha256']);assert r['bytes']==pins['supportFiles'][n]['bytes']
reviewpath=S/'1370-c0-aging-era-settlement208-observer-independent-source-review-after-aj-20261009-r1/RECEIPT.json'
review=obj(reviewpath,'d813c722afeefb1b7ce4be1bc7fade51db41d7ce1930964a7e67d6d884ebf1a8')
assert review['sourcePinsSha256']==roles[str(P/'SOURCE-PINS.json')]['sha256'] and review['decision']['witnessSource']=='ACCEPT_SOURCE_ONLY_UNRUN'
assert review['frozenHashes']=={n:r['sha256'] for n,r in pins['files'].items()}
controlpins=S/'1370-c0-a208-finite-recorded-controls-filled-source-after-aj-20261009-r1/SOURCE-PINS.json'
cp=obj(controlpins,'9548de6af338fe98a3dde78a1599850152fdab48db0c9e25576de8deb48acecc')
controlreview=obj(S/'1370-c0-a208-finite-recorded-controls-filled-independent-source-review-after-aj-20261009-r1/RECEIPT.json','e304e8707580bae518ba12e7e15eb353c2a5d67b23dbc491fba29c2cdfbda6d4')
assert controlreview['sourcePinsSha256']==roles[str(controlpins)]['sha256'] and controlreview['executionPerformed'] is False
cc=obj(controlpins.parent/'CONFIG.json',cp['configSha256']);cr=obj(controlpins.parent/'ROUTE.json',cp['files']['ROUTE.json']['sha256'])
original_launch_path=S/'1370-c0-aging-era-employment-witness-r9-adoption-output-20261008-r1/ADOPTED-LAUNCH-SPEC.json'
launch=obj(original_launch_path)
original=obj(launch['bindingPath'],launch['bindingSha256'])
for n in ['pipeAdapter','boundedSink']:
 role(launch['roles'][n]['path'],launch['roles'][n]['sha256'])
r9=obj(S/'1370-c0-aging-era-employment-witness-r9-observed-independent-review-20261009-r1/RECEIPT.json','d681f73e3613248c7ccd0be7736e46bd1fe424dd62ea099a60e031e774238f64')
assert r9['qualifiedSourceSha']==pins['sourceSha'] and r9['adoptedBindingSha256']==launch['bindingSha256']
pre=obj(S/'1370-c0-m0-additive-preflight-independent-observed-review-after-aj-20261009-r1/RECEIPT.json','3bce48d3f7bac785ca024f7609c7a46a2c832c3adfe9d4d6a7cc0501b4f83018')
assert pre['productionHead']=='f0fb818fe7534c3e3784206d16728b015c7f059a' and pre['r9PrivateRootReuseExplicitlyAccepted'] is True
premium=obj(pins['externalRoles']['parentPremiumFloorSourceAdoption']['path'],pins['externalRoles']['parentPremiumFloorSourceAdoption']['sha256'])
for k in ['independentReview','mandatoryReviewSupplement']:
 role(premium[k]['path'],premium[k]['sha256'])
for key in ['independentGapDesignReview','parentGapDesignAdoption','parentSingleDrawNumericAdoption']:
 r=pins['externalRoles'][key];role(r['path'],r['sha256'])
def constants(n):
 t=ast.parse((P/n).read_text());out={}
 for a in t.body:
  if isinstance(a,ast.Assign) and len(a.targets)==1 and isinstance(a.targets[0],ast.Name):
   try:out[a.targets[0].id]=ast.literal_eval(a.value)
   except (ValueError,TypeError):pass
 return out
c=constants('supervise.py');template=obj(P/'BINDING-UNFILLED.json')
nulls=[k for k,v in template.items() if v is None];assert len(nulls)==15
assert set(original['worktreeSha256'])<set(c['BLOB_PINS']) and len(c['BLOB_PINS'])==11 and len(c['OBSERVER_FILES'])==8 and len(c['RUNTIME_FILES'])==5
added={n:pins['externalRoles']['A_'+Path(n).name]['sha256'] for n in set(c['BLOB_PINS'])-set(original['worktreeSha256'])}
facts={'status':'SOURCE_ONLY_EXACT_LAUNCH_INPUT_MAP_CONTROLS_AND_RUNTIME_UNRUN','sourceDirectory':str(P),'observerSourcePins':roles[str(P/'SOURCE-PINS.json')],'sourceReview':roles[str(reviewpath)],'unfilledFields':nulls,'alreadyAvailableBindingValues':{'sourceSha':pins['sourceSha'],'repoRoot':original['repoRoot'],'nodeExecPath':original['nodeExecPath'],'nodeVersion':original['nodeVersion'],'runtimeSha256':original['runtimeSha256'],'worktreeSha256':{**original['worktreeSha256'],**added},'observerSha256':{n:pins['files'][n]['sha256'] for n in c['OBSERVER_FILES']},'boundsAmendment':original['boundsAmendment'],'parentBoundsAdoption':original['parentBoundsAdoption'],'productionHeadAtPreparation':pre['productionHead']},'prospectiveCommandShape':['/bin/bash','<accepted-r8-helper>','0','<fresh-A208-lane-log>','/bin/bash','<fresh-A208-pipeline>','<fresh-external-adopted-A208-binding>','<actual-adopted-binding-sha256>'],'existingRuntimeEnvironment':launch['requiredEnvironment'],'controlsSourceOnly':{'sourcePins':roles[str(controlpins)],'plannedNodePath':cc['nodePath'],'plannedNodeSha256':cc['nodeSha256'],'plannedJsGroups':13,'plannedProtocolMethods':3,'plannedPythonObserverMethods':14,'actualObservedReceipt':None},'currentGuardAuthorityByAcceptedReceiptOnly':{'preflightReceipt':roles[str(S/'1370-c0-m0-additive-preflight-independent-observed-review-after-aj-20261009-r1/RECEIPT.json')],'beforeFillSnapshotReference':pre['beforeFillSnapshot'],'afterFillSnapshotReference':pre['afterFillSnapshot'],'beforeFillAdoptionReference':pre['beforeFillParentAdoption'],'snapshotsReread':False,'futureM0PostflightAcceptedRole':None,'futureA208ScopeContinuityAdoption':None},'historicalR9ExternalNumericOwnedPgid':None,'observedDigestsRequired':c['EXPECTED'],'bounds':{'innerSeconds':720,'activeStopSeconds':742,'wholeRecorderSeconds':750,'sinkReadSeconds':760,'sinkForwardSeconds':10,'stdoutBytes':524288,'stderrBytes':65536,'settlement208Bytes':65536,'settlement208RowBytes':4096},'actualMissingRoles':['independently accepted actual JS13/protocol3/Python14 controls + raw tool/helper/meta/RESULT/registry and cleanup','current-M0 postflight full guard outcome/review and parent scope continuity adoption','fresh exact candidate review, archive/adoption and adopted preflight','separate actual once-only A208 witness grant'],'existingSourcePointersRequiringExternalCopySubstitution':['pipeline witness_source and witness_sink','sink SOURCE, SOURCE_PINS_SHA and SUPERVISOR_SHA'],'runtimeRematerializationNeeded':False,'scientificPhaseProofReopened':False,'sourceImported':False,'controlsTestsEnginePricingRngExecuted':False,'protectedPayloadOrFullInventoriesRead':False,'sourceOrRepoChanged':False,'roles':roles}
(Q/'FACTS.json').write_text(json.dumps(facts,indent=2,sort_keys=True)+'\n')
note='''A208 needs a fresh external exact binding and two small pipeline/sink copies after actual controls and the M0 postflight protection chain are accepted. The observer source and settled phase proof remain unchanged. This note is source-only preparation; no actual controls or A208 vectors are observed.

The frozen template has 15 null fields. Fill the historical source/root, Node v22.23.2 physical executable, five runtime hashes, original eight worktree hashes plus talentMarket/talentSummary/tuning, and eight observer hashes from the exact existing roles recorded in FACTS. Preserve the bounds amendment/review/adoption byte-for-byte. Use the actual d813 source receipt for independentSourceReviewReceipt (its exact schema and all18 source hashes are enforced before Popen), and pin its accepted selected16 input decision plus gap12145/root8f29 roles for selected16InputReview. Bind fd7c8 premium/floor review, mandatory9511 supplement and rootef30 adoption. These establish source premises only. The existing one-key numeric adoption is a separate prerequisite, not an A208 measurement.

controlsGrant must name genuine separately granted and independently accepted 13 JS groups, three no-child protocol methods and14 observer Python methods, including the actual driver registry/fixture cleanup and helper/tool/meta exits. Filled-controls9548/e304 are source acceptance only. Controls use pinned Node20.20.2; the retained actual R9 witness used Node22.23.2. Keep those runtime identities distinct rather than claiming a Node22 test run. No accepted observed controls receipt exists in this note.

The smallest external pipeline copy changes its hardcoded source directory to the frozen A208 proposal and its sink path to a fresh A208 sink. The sink copy changes SOURCE to A208, SOURCE_PINS_SHA to3452218c and SUPERVISOR_SHA to45eda307. Its existing authenticated validator execution then calls the A208 supervisor's full208+416 validator. All read/forward mechanisms, one-frame output, cap and PIPESTATUS assertions stay exact. Preserve sink760-second read/10-second forward as existing observation overhead, not a witness bound increase. Neither original R9 adapter nor sink can execute unchanged. No observer-source rewrite is needed. Fill external BINDING-DRAFT, never the pinned BINDING-UNFILLED file or consumed source manifests.

OperationalRuntimeAuthority must explicitly bridge the accepted r6 materialization and R9 actual observed admission to current AJ protection: accepted3bce receipt references full744095 before-fill and c337f7 after-fill, original immutable private R9 proof and current AJ source scope. The parent says a full M0 postflight is planned; that future outcome/review and explicit continuing scope adoption remain missing. Reuse those completed current proofs under maintained HEAD/protected freeze/no-detach scope, with fresh bounded tools/root/ancestry/worktree/runtime/HEAD+remote+clean/UUID/AC/disk/FD/worker/helper-lock/path-absence checks at launch. Do not invent a present postflight, reread full inventories, rematerialize R9, or use historical4812/02d snapshots to certify AJ. If a checkpoint ends continuity, refresh/rebind the actual current scope before grant. Original M0 preservation/readback is separate from the R9/protected inventory map.

Then prepare immutable exact candidate binding/semantic identity/pins/launch spec, independently review the narrow adapter/sink substitutions and full actual argv, archive/adopt with the reviewed procedure, perform adopted preflight, and obtain a separate root once-only observer grant. Retain original required environment selecting bound Node22 for the vite-node shebang; current roles must authenticate Node, Python, Git, Bash, sandbox-exec and /dev/null without source or dependency writes. Allocate fresh absent lane/meta/candidate/receipt paths. The helper is0644 and requires explicit /bin/bash. stdout must remain a pipe through outer recorder and bounded sink. Parent's concrete argv is not yet known, so FACTS deliberately carries command shape rather than a fabricated runnable grant.

Actual acceptance still requires tool/helper/meta/outer/sink zero, exact one frame plus one zero pipeline marker, no unexpected wait/STOP/survivor, source flights equal, selected16 natural-after-tick208 vectors with identity+occurrence/order,64KiB/4096-row caps/hash/phase, and unchanged final416/44-row4cff employment plus settlement706e54/receiptsaf8c4d/takes8af116 and RNG2598418427,508725886,1318803286,3129010527. A complete protected postflight and independent raw208/full416 review are mandatory. Preserve honest numeric ownership: the historical R9 external PGID was not captured; do not manufacture it. This note closes no renewal pay cause, grants no engine run and does not create H replay, types/game/P17/P18 authority.
'''
(Q/'NOTE.md').write_text(note)
rec={'decision':'SOURCE_ONLY_A208_MINIMAL_EXACT_LAUNCH_PREPARATION_MAPPED','executionAuthorization':False,'sourcePinsSha256':roles[str(P/'SOURCE-PINS.json')]['sha256'],'controlsObserved':False,'A208Observed':False,'findings':['Old pipeline/sink contain R9-specific path/hash literals and require fresh narrow copies.','Actual controls and current post-M0 guard/scope roles remain pending.'],'note':role(Q/'NOTE.md'),'facts':role(Q/'FACTS.json'),'inspector':role(Path(__file__))}
(Q/'RECEIPT.json').write_text(json.dumps(rec,indent=2,sort_keys=True)+'\n')
print(json.dumps({'receipt':role(Q/'RECEIPT.json'),'note':rec['note'],'facts':rec['facts']}))
