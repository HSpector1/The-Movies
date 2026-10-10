from pathlib import Path
import hashlib,json,os
S=Path('/Users/zacheryspector/studio-scratch')
OUT=S/'1370-ao-observer-row-diagnostic-api-independent-review-20261010-r1'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def save(name,obj):
 b=(json.dumps(obj,indent=2,sort_keys=True)+'\n').encode();p=OUT/name
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 assert p.read_bytes()==b
 return role(p)
assert sorted(p.name for p in OUT.iterdir())==['prepare-review.py']
api=S/'1370-ao-observer-row-diagnostic-api-20261010-r1'/'API.md'
adoption=S/'1370-an-root-continuation-20261009-r1'/'OBSERVER-ROW-DIAGNOSTIC-DESIGN-ADOPTION.json'
assert role(api)['sha256']=='40154375d4e9cc86c9a64a8c6b40dd8bdf6cf87a673bb519ac39d7f5f3cc13ea'
assert role(adoption)['sha256']=='8b45e59bfbcf67e115f28065c475fc64ba353a96ee4c07e616472bf58b1eda90'
a=json.loads(adoption.read_bytes())
evidence={'api':role(api),'priorRootDesignAdoption':role(adoption)}
for key in ['design','independentDesignReview']:
 p=Path(a[key]['path']);assert role(p)==a[key];evidence[key]=role(p)
review=json.loads(Path(a['independentDesignReview']['path']).read_bytes())
for r in review['sourceAndObservedRoles']:
 if r['path'].endswith('m0FeasibilityWitness.ts'):
  assert role(Path(r['path']))==r;evidence['originalPublicWitness']=r
C=S/'1370-an-lossless-trace-codec-consumers-source-20261010-r3'
for name,sha in [('m0WiringProbe.ts','c3da292f943a37ae5c3c30005dfec71eb485bf17a211ecfddaa03efe0460c5a9'),('m0TraceCodec.mjs','5276c5dcf6502d21afd5f3bdc1669911ef4aebbbfe811c36e34689691eb64768'),('FULL-BODY-CONTROLS-TEMPLATE.ts','324c7cc754497e43cc5a9d46865f4cbf7e1a635b5e2ce5ac0857defab8661a02')]:
 p=C/name;r=role(p);assert r['sha256']==sha;evidence[name]=r
receipt={
 'schema':'1370-observer-row-diagnostic-api-independent-source-review/v1',
 'decision':'STOP_STATIC_OBSERVER_ROW_DIAGNOSTIC_API_FIRST_ERROR_PROPAGATION',
 'reviewer':'b109_focused_route_review; independent of root API author and implementation/control authors',
 'sourceOnly':True,'executionAuthorization':False,'gameOrControlsExecuted':False,'privateTreeTraversed':False,
 'api':evidence['api'],'evidence':evidence,
 'concreteFindings':[
  {'id':'F1','code':'SWALLOWED_ROW_THEN_LATER_ERROR_REPLACES_FIRST_ERROR','scope':'Fullbody arm integration wording in API R1',
   'path':'Original capture throws E; gameplay broadcatch swallows E; a later call throws unrelated F before advance returns. Post-return throwIfFailed never runs. API catch emits and rethrows caught F, losing E identity.',
   'smallestRepair':'Capture the sticky row failure in a local boolean/value via throwIfFailed in catch before emission/cleanup. Emit bounded diagnostic; rethrow that exact local E when present, otherwise rethrow the caught unrelated error.',
   'specificControl':'Generate real original witness row refusal E, swallow it, then throw distinct F; integrated arm must propagate the same E object, preserving name/message/stack. An unrelated error with no sticky row failure remains F.'},
  {'id':'F2','code':'CLEANUP_FINALLY_CAN_REPLACE_FIRST_ROW_ERROR','scope':'Existing fullbody arm finally line43',
   'path':'C3 m0WiringProbe.end calls store.snapshot; C3 codec snapshot throws TraceOperationalError on sticky failure. Nested end/reset finally can therefore replace a pending E. Reset also clears diagnostic state, so checking it only afterward loses E.',
   'smallestRepair':'Keep the first row Error and an explicit presence boolean locally before cleanup. Always attempt end then reset. Only while that row E is pending, catch cleanup exceptions so E remains the thrown failure through reset; keep original nested finally behavior and fatal cleanup errors when no row E is present. Retain bounded secondary cleanup-failure flags if the adopted schema supports them; never emit raw errors or a second fallback line.',
   'specificControls':['Row E plus later F plus failing end still propagates exact E and attempts reset.','Row E plus failing reset still propagates exact E; reset is attempted.','No row E: ordinary body/cleanup failures remain fatal under original behavior.'],
   'observedCausality':'Source-reachable combination only; no assertion that combined cleanup failure occurred in actual56544.'}
 ],
 'remainingInterfaceAssessment':{
  'originalWitnessBytesAndCapsUnchanged':True,
  'originalCaps':{'rows':512,'rowBytes':16384,'totalBytes':2097152},
  'occurrence':'First refusal precedes rows.push and occurrence increment. Reconstruct against actual bound sink rows, native row field order and original10-field identity; source indices/era/subject/issuer are not added to occurrence identity, but remain exact row context.',
  'sinkOwnership':'API correctly requires rowsProvider to close over the producing sink instance; mutable reset global is forbidden.',
  'diagnosticLimits':'Original record remains authority. Canonical string cap65536 before parse; prior rows512/2MiB; one UTF8 JSON line including newline <=4096. Explicit unavailable when metadata cannot be bounded/reconstructed. No raw tuple/payload, cache, truncation, altered capture or emitter fallback.',
  'family':'Bound failed inputTuple or actual preceding same-context inputTuple only; unavailable otherwise.',
  'purity':'No GameState/RNG/save mutation; diagnostic reset only at existing per-arm reset; immutable prior emitted evidence. Typed-catch mutant retains sole original catch-removal difference.',
  'negativeCriteria':'Real original witness and exact intended predicate/Error identity; import/setup/unknown errors never intended RED. Matrix count must be authored, not guessed.',
  'claimScope':'Diagnostic remains STOP with metadata, never baseline/mutant qualification; no observer transport/cap amendment or runtime authority.'
 },
 'repairScope':'Clarify the two existing first-error propagation paths only; no new execution gate, cap, inventory or private read. R1 API/review preserved; root authors fresh R2.',
}
r=save('RECEIPT.json',receipt)
seal={'schema':'1370-independent-source-review-seal/v1','files':{'RECEIPT.json':r,'prepare-review.py':role(OUT/'prepare-review.py')},'executionAuthorization':False}
for v in seal['files'].values():assert role(Path(v['path']))==v
se=save('SEAL.json',seal)
for p in OUT.iterdir():p.chmod(0o444)
OUT.chmod(0o555)
print(json.dumps({'receipt':r,'seal':se},indent=2))
