from pathlib import Path
import json,hashlib,os,stat
S=Path('/Users/zacheryspector/studio-scratch')
OUT=S/'1370-an-pure-codec-stream-controls-recorded-route-reuse-plan-20261010-r1'
BASE=S/'1370-an-exact-identity-json-controls-recorded-route-source-20261010-r2'
PARENT=S/'1370-an-exact-identity-json-controls-parent-recorded-20261010-r1'
AN=S/'1370-an-root-continuation-20261009-r1'
def raw(p):
 p=Path(p); before=p.lstat()
 assert stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=32*1024*1024,str(p)
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  opened=os.fstat(fd);assert (before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns,before.st_ctime_ns)==(opened.st_dev,opened.st_ino,opened.st_size,opened.st_mtime_ns,opened.st_ctime_ns)
  with os.fdopen(fd,'rb',closefd=False) as f:b=f.read()
  after=os.fstat(fd)
 finally:os.close(fd)
 assert len(b)==before.st_size and (before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns,before.st_ctime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns,after.st_ctime_ns)
 return b
def role(p):
 b=raw(p);return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def auth(r):
 assert role(r['path'])==r,r
 return json.loads(raw(r['path']))
def write(name,value):
 b=(json.dumps(value,sort_keys=True,indent=2)+'\n').encode('utf-8')
 p=OUT/name
 fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 with os.fdopen(fd,'wb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 return role(p)
mp={'path':str(BASE/'SOURCE-PINS.json'),'bytes':4561,'sha256':'640d300aadc66b4f7bc225f91841b5fd235945d446c056214d8b4cda27b4313a'}
manifest=auth(mp)
verified={}
for name,r in manifest['files'].items():
 assert Path(r['path'])==BASE/name
 assert role(r['path'])==r
 verified[name]=r
for name,r in manifest['externalInputs'].items():
 assert role(r['path'])==r
 verified[name]=r
# Preserve actual retained role; authentic hash is derived from the named file,
# then paired with source and observed root authority below. No future grant.
grant=json.loads(raw(PARENT/'GRANT.json'));actual_grant=role(PARENT/'GRANT.json')
assert grant['sourcePins']==mp and grant['parentAdapterSourcePins']==mp
review=auth(grant['sourceReview']);assert grant['sourceReview']==grant['parentAdapterSourceReview']
assert review['decision']=='ACCEPT_STATIC_EXACT_IDENTITY_JSON_CONTROLS_RECORDED_ROUTE_SOURCE_ONLY' and review['executionAuthorization'] is False and review['concreteFindings']==[]
source_adoption=auth(grant['sourceAdoption'])
assert source_adoption['sourcePins']==mp and source_adoption['sourceReview']==grant['sourceReview']
adoption_role={'path':str(AN/'PARSER-CONTROLS-OBSERVED-ADOPTION.json'),'bytes':1983,'sha256':'2684b2b4a2c0e90b1d9fec5ee079ede8eb945eb3378ff88619f3cd04b943735d'}
adoption=auth(adoption_role)
observed=auth(adoption['independentObservedReview'])
assert observed['decision']=='ACCEPT_ACTUAL_EXACT_IDENTITY_JSON_PURE_CONTROLS_ONLY'
readback=auth(adoption['readback'])
assert type(readback['toolExit']) is int and readback['toolExit']==0 and readback['caseCount']==32 and readback['allSpecificControlsPassed'] is True
config=auth(verified['CONFIG.json']);contract=auth(verified['CONTRACT.json']);recipe=auth(verified['RECIPE.json'])
assert config['bounds']==contract['bounds']==recipe['bounds']
plan={
 'schema':'1370-pure-codec-stream-controls-recorded-route-reuse-plan/v1',
 'status':'SOURCE_ONLY_REUSE_PLAN_AWAITING_COMPRESSION_DESIGN_ADOPTION_AND_AUTHORED_CONTROLS',
 'executionAuthorization':False,'candidateExecuted':False,'privateM0ReadOrWritten':False,'game':False,
 'scope':'Finite public pure codec and stream-consumer controls only; no fixture generation, gameplay, performance promotion, full-function qualification, or acceptance of a pending compression design.',
 'preferredReusableSourceManifest':mp,
 'authenticatedReusableSourceRoles':verified,
 'historicalAdmission':{'sourceReview':grant['sourceReview'],'sourceAdoption':grant['sourceAdoption'],'observedReview':adoption['independentObservedReview'],'observedRootAdoption':adoption_role,'readback':adoption['readback'],'actualGrant':actual_grant,'onlyHistoricalParser32RunAccepted':True,'futureCodecQualification':False},
 'routeChoice':{'preferred':'Complete combined parser32 parent plus owned recorder, adapted as a fresh finite standalone Node route.','basis':'This route already has a complete direct-exec parent and recorder; no TypeScript transpilation is needed for standalone .mjs controls.','ordering18Role':'The parser32 source retains exact complete ordering parent/recorder baselines and inverse proofs; reuse those qualified helper mechanisms rather than constructing partial wrappers.','futureLanguage':None,'ifNotStandalone':'Resolve the actual adopted source language/tool interface before implementation; no compiler or transpilation role is guessed here.'},
 'preservedMechanisms':{
 'parentPreparationSeconds':60,'parentPreparationCancelledBeforeDirectExec':True,'combinedPreparationRuntimeDeadline':None,
 'runtimeBounds':contract['bounds'],'clockOwner':'Original owned recorder; runtime deadlines do not cover parent preflight/preparation.',
 'childStdoutCapBytes':8388608,'childStderrCapBytes':8388608,'recorderResultCapBytes':131072,'pureReportCapBytes':131072,
 'mergedHelperLogExtraLiveLimiter':None,
 'parentHelpers':'Complete original ten source/hash/typed-equality/durable-write/preparation helpers retained; preserve full forward/inverse proof.',
 'recorderHelpers':'Complete original sixteen helpers and OwnedChild retained, including readiness/GO, registration before wait, actual PGID confirmation, EOF/exit deadlines, bounded reads, exact-owned TERM/KILL/reap, startup-FD cleanup, durable result/override finalization and alarms.',
 'childProcessModel':'One owned standalone Node aggregate; controls should introduce no children, detached descendants, private reads or game imports.',
 'environment':'Inherit HOME and CODEX_HOME; do not repurpose either. Parent supplied environment preserves original PYTHONDONTWRITEBYTECODE/GIT_OPTIONAL_LOCKS; Node strips NODE_OPTIONS/NODE_PATH.',
 'ownership':'Parent establishes own group if needed, asserts actual PGID equals PID and records actual PID/PGID/SID; child actual owned group recorded independently. Root final readback supplies separate fresh PID and PGID absences and lane absence.',
 'diagnostics':'Retain authentic stdout, stderr and merged helper log separately. Preserve any unchanged-recorder Python warning if emitted; producer stderr empty never means all streams quiet.'},
 'entryContract':{
 'outer':'Pinned physical Python -I -B <fresh complete parent source> <genuine external GRANT.json path> <actual SHA256>',
 'directExec':['/bin/bash','<qualified r8 helper>','0','<fresh lane log>','<pinned physical Python>','-I','-B','<fresh complete recorder source>','verification','<genuine external GRANT.json path>','<actual SHA256>'],
 'node':'<fresh genuine pinned Node> <fresh pure-control script path>, one aggregate, source-pinned modules only',
 'grant':'External root once grant after genuine independent source review and source adoption; oneAggregateRun true, automaticRetry false, exact source/config/recipe/runtime-tool roles, argv/cwd/env/bounds/output/lane bindings. Preserve sourcePins==parentAdapterSourcePins and sourceReview==parentAdapterSourceReview for a combined package.',
 'review':'Genuine sourceManifest role plus exact sourcePins/routeSourcePins filename aliases; explicit codec-specific schema/decision and concreteFindings empty only if source review actually accepts.',
 'tools':'Reuse documented qualified physical PY/Node/r8 roles prospectively; root supplies current tool observation and freshly rehashes physical executables/helper before actual launch. This plan did not read tool binaries.',
 'paths':'All parent/output/lane/result/run identifiers fresh and mutually equal across source selector, CONFIG, CONTRACT, RECIPE, grant and actual readback; source-only AST path reconstruction must validate the actual OUTPUTS selector.',
 'retainedResult':'Exactly framed bounded pure report authenticated against script/module roles and the exact planned case-ID roster; recorder authenticates strict types/count/order/duplicates/trailing data/verdicts as the adopted protocol requires. Unknown cases/errors or loader/tool/resource failures remain STOP.'},
 'minimalRequiredWiring':[
 'After compression-design adoption, author finite pure codec and stream-consumer modules plus a source-pinned script and fixed intended case roster. No private fixtures or synthetic game premises.',
 'Derive a fresh complete combined parent and recorder from the admitted pair. Change only package/run/path/hash bindings, codec-specific schema/scope/result predicates and exact runtime source aliases required by real controls; preserve all original ownership, deadlines, caps and cleanup helpers.',
 'Replace parser-only report checks with exact codec/consumer source identities and exact case IDs/expected predicates. Negative cases must match their intended corruption/framing/order/limit assertion or diagnostic; an arbitrary thrown error must never count as expected RED.',
 'Select byte identity, framing, corruption, chunk-boundary, decoder-limit, exact integer and storage-accounting controls only from the adopted design contract. No guessed format, case count, fit result, compression ratio, cap waiver or broad replay claim.',
 'Pin fresh CONFIG/CONTRACT/RECIPE/source/control roles from retained UTF-8 read_bytes; verify every manifest role after final write. Retain whole forward/inverse source proofs and unchanged-helper proofs.',
 'Root fills genuine future source adoption/tool observation/once grant and owns one lane. Actual report, streams, result, tool envelope, measured identities, post-absence evidence and independent observed review are separate future evidence, never substituted from parser32.'
 ],
 'futureAuthority':{k:None for k in ('compressionDesign','compressionDesignReview','compressionDesignAdoption','codecSource','streamConsumerSource','controlsSource','controlsRoster','sourceManifest','config','contract','recipe','independentSourceReview','rootSourceAdoption','runtimeToolsObservation','actualRootOnceGrant','actualTool','actualResult','actualReadback','independentObservedReview','rootObservedAdoption')},
 'noNewGate':True,'automaticRetry':False,
 'remainingWork':'Root assigns implementation after design adoption. This plan qualifies a reuse choice and required wiring only, not a new source acceptance or execution grant.'
}
pr=write('PLAN.json',plan)
audit=write('BASE-AUTHENTICATION.json',{'schema':'1370-pure-route-reuse-named-source-authentication/v1','executionAuthorization':False,'sourceManifest':mp,'verifiedLocalRoles':len(manifest['files']),'verifiedExternalRoles':len(manifest['externalInputs']),'verifiedRoles':verified,'sourceReview':grant['sourceReview'],'sourceAdoption':grant['sourceAdoption'],'observedReview':adoption['independentObservedReview'],'observedRootAdoption':adoption_role,'readback':adoption['readback'],'actualGrant':actual_grant,'toolBinariesRead':False,'sourceImportedOrExecuted':False})
pins=write('SOURCE-PINS.json',{'schema':'1370-source-only-pure-controls-route-reuse-plan-pins/v1','executionAuthorization':False,'files':{'PLAN.json':pr,'BASE-AUTHENTICATION.json':audit,'prepare-plan.py':role(OUT/'prepare-plan.py')}})
for r in (pr,audit,pins):assert role(r['path'])==r
seal=write('SEAL.json',{'schema':'1370-source-only-plan-seal/v1','sourcePins':pins,'allManifestRolesReadbackEqual':True,'executionAuthorization':False})
for p in OUT.iterdir():p.chmod(0o444)
OUT.chmod(0o555)
print(json.dumps({'plan':pr,'sourcePins':pins,'seal':seal}))
