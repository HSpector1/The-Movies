from pathlib import Path
import hashlib,json,stat,datetime
S=Path('/Users/zacheryspector/studio-scratch')
P=Path(__file__).parent
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,obj):
    with p.open('x') as f:json.dump(obj,f,sort_keys=True,indent=2);f.write('\n')
base=S/'1370-ak-checkpoint-pre-review-inventory-preparation-20261009-r2/INVENTORY-FINAL-PRE-REVIEW.json'
claims=S/'1370-ak-checkpoint-claims-independent-review-20261009-r1'
review=S/'1370-ak-complete-pre-review-inventory-independent-review-20261009-r1'
assert h(base)=='b24ecd8aa02ee4f1e2102dea81b95e4e74bf6a830794fb1845458a63e2850bea'
assert h(claims/'RECEIPT.json')=='5fbbf1647f919ef23a70926ea0dde693df7fd24d39931adf34af3dd43edbbc33'
assert h(review/'RECEIPT.json')=='b04d8d99d2363ceb73732a9e547f216bd0e9f586337edf115bf8c9b2f767cf7d'
def role(p):return {'path':str(p),'sha256':h(p),'bytes':p.stat().st_size}
write(P/'CHECKPOINT-REVIEWS-ADOPTION.json',{
    'status':'ROOT_ADOPTED_CHECKPOINT_CLAIMS_AND_FINITE_INVENTORY_REVIEWS',
    'claimsReview':role(claims/'RECEIPT.json'),'inventoryReview':role(review/'RECEIPT.json'),
    'acceptedPreReviewInventory':role(base),
    'permittedChanges':'Exact stale warning correction plus finite documentary/review/adoption/finalization roles only; no scientific role changes.',
    'priorAJTransport':'65 references,60 distinct roles,five identical repeated references; no payload duplication.',
    'runtimeAuthorization':False,'pythonControlsAccepted':False,
    'rawMachineAndPaddingPayloadsRemainLocal':True,
    'stagedAndPublishedReadbacks':'Performed after archive creation and intentionally outside this noncircular inventory.'})
inv=json.loads(base.read_text()); original=list(inv['files']); seen={r['sourcePath'] for r in original}; added=[]
def add(p,package=None,relative=None):
    if str(p) in seen:return
    st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
    row={'sourcePath':str(p),'package':package or p.parent.name,'relativePath':relative or p.name,
        'bytes':st.st_size,'sha256':h(p),'mode':format(stat.S_IMODE(st.st_mode),'04o'),'nlink':st.st_nlink,
        'preservationAction':'COPY_FINITE_PAYLOAD','priorGitBlob':None,
        'reason':'Closed finite root checkpoint review/finalization input; exact original bytes retained.'}
    inv['files'].append(row);added.append(row);seen.add(str(p))
for directory,names in [(claims,['REPORT.md','FACTS.json','RECEIPT.json']),
                        (review,['CHECKS.json','REPORT.md','RECEIPT.json']),
                        (base.parent,['PREPARATION.json','INVENTORY-FINAL-PRE-REVIEW.json'])]:
    for n in names:add(directory/n)
for name,digest in [('review_ak_final_inventory_neutral.py','e6910213001e0fe93da96d29042905746a62c76513e79ca57a7045c65807e7ce'),
                    ('review_ak_final_inventory_neutral_r2.py','9cba0b51ba8e27ef1a7fcc64d5d1e242f66bddd788361a19156ba3b4d3e0579d')]:
    p=S/name;assert h(p)==digest;add(p,'external-finite-audits')
for n in ['REPORT-DRAFT.md','HANDOFF-DRAFT.md','ROOT-CLAIM.txt','verify_staged.py','verify_staged_r2.py',
          'STAGED-VERIFIER-REVIEW-AND-REPAIR.json','PREDECESSOR-READBACK.json','CHECKPOINT-REVIEWS-ADOPTION.json','finalize_inventory.py']:
    add(P/n)
corr=json.loads((review/'RECEIPT.json').read_text())['permittedDocumentaryCorrection']
assert inv['semanticRoleWarnings'].count(corr['old'])==1
inv['semanticRoleWarnings']=[corr['new'] if x==corr['old'] else x for x in inv['semanticRoleWarnings']]
assert inv['files'][:len(original)]==original
assert sum(r['preservationAction']=='LOCAL_HASH_SIZE_ONLY' for r in inv['files'])==18
inv['rootFinalization']={'preReviewInventory':role(base),'adoption':role(P/'CHECKPOINT-REVIEWS-ADOPTION.json'),
    'addedRoles':len(added),'addedSourcePaths':[r['sourcePath'] for r in added],
    'documentaryWarningCorrection':corr,'priorTransportReferences':65,'priorTransportDistinctRoles':60,
    'scope':'Final finite documentary increment only; self inventory, generated archive/staging/push readbacks excluded to avoid recursion.'}
inv['status']='ROOT_FINAL_COMPLETE_FINITE_CHECKPOINT_INVENTORY'
inv['utc']=datetime.datetime.now(datetime.timezone.utc).isoformat()
inv['scopeLimit']='Closed after-AJ evidence plus final reviewed documentary increment; no new runtime, scientific observation or raw payload roles.'
inv['noncircularFinalRootIncrement']='Completed explicitly enumerated root increment; generated inventory/archive/staged/push results remain subsequent readbacks.'
inv['pendingAdditions']=[]
inv['summary'].update(completeInventory=True,regularFiniteFiles=len(inv['files']),
    payloadFiles=sum(r['preservationAction']=='COPY_FINITE_PAYLOAD' for r in inv['files']),
    payloadBytes=sum(r['bytes'] for r in inv['files'] if r['preservationAction']=='COPY_FINITE_PAYLOAD'),
    finalRootAddedRoles=len(added),pendingAdditions=0)
write(P/'INVENTORY-FINAL.json',inv)
print(json.dumps({'inventory':role(P/'INVENTORY-FINAL.json'),'summary':inv['summary']},sort_keys=True))
