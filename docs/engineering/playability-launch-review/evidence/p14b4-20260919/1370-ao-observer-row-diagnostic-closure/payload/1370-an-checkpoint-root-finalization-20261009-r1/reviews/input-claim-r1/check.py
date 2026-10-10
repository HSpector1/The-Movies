from pathlib import Path
import json,hashlib,os,re
D=Path('/Users/zacheryspector/studio-scratch/1370-an-checkpoint-root-finalization-20261009-r1');O=D/'reviews/input-claim-r1'
def role(p):
 b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
inp=role(D/'INPUT-PACKAGES-FINAL.json');inv=role(D/'INVENTORY-FINAL.json');claim=role(D/'ROOT-FINAL-CLAIM.txt')
assert inp['bytes']==60686 and inp['sha256']=='364fcdb2acb3e42ee909e1c58292f682cebbfc100fd13ca9d77596a1bb104d68'
assert inv['bytes']==1478168 and inv['sha256']=='5f081c10a8fdd6cd2b888c6324e2cfbe080dceaf040b7e30da4a6143871bdd9b'
a=json.loads((D/'INPUT-PACKAGES-FINAL.json').read_text());b=json.loads((D/'INVENTORY-FINAL.json').read_text());text=(D/'ROOT-FINAL-CLAIM.txt').read_text();rows=b['files'];paths=[Path(x) for x in a['paths']]
assert len(paths)==len(set(paths))==285
assert not [(str(p),str(q)) for i,p in enumerate(paths) for q in paths[i+1:] if p.is_relative_to(q) or q.is_relative_to(p)]
assert len(rows)==2877 and sum(x['bytes'] for x in rows)==164679949 and b['pendingAdditions']==[] and b['summary']=={'bytes':164679949,'completeInventory':True,'localOnlyRoles':65,'roles':2877}
assert len({x['sourcePath'] for x in rows})==len(rows)
assert all(type(x['bytes']) is int and x['bytes']>=0 and re.fullmatch('[a-f0-9]{64}',x['sha256']) and x['nlink']==1 for x in rows)
assert all(any(Path(r['sourcePath'])==p or Path(r['sourcePath']).is_relative_to(p) for p in paths) for r in rows)
assert all('/node_modules/' not in r['sourcePath'] and 'observer-mirrors' not in r['sourcePath'] for r in rows)
local={r['sourcePath'] for r in rows if r['preservationAction']=='LOCAL_HASH_SIZE_ONLY'}
raw=set(a['wholeMachineRawLocalOnlyPaths']);semantic=set(a['semanticProducerRawLocalOnlyPaths']);cache=set(a['rebuildableNodeCacheLocalOnlyPaths'])
assert len(raw)==64 and raw==semantic and len(cache)==1 and raw.isdisjoint(cache)
assert local==set(a['localRawPaths'])==raw|cache
assert all(r['priorGitBlob'] is None for r in rows if r['sourcePath'] in local)
assert all(Path(r['sourcePath']).name not in ['BEFORE-PS.txt','AFTER-PS.txt','BEFORE-LSOF.bin','AFTER-LSOF.bin'] or r['sourcePath'] in raw for r in rows)
assert not any(Path(r['sourcePath']).is_relative_to(O) for r in rows)
index={r['sourcePath']:r for r in rows}
root=Path('/Users/zacheryspector/studio-scratch/1370-an-root-continuation-20261009-r1')
late=['FULLFUNCTION-R5-STOP-OBSERVED-ADOPTION.json','LOSSLESS-CONTROLS-OBSERVED-ADOPTION.json','OBSERVER-ROW-DIAGNOSTIC-DESIGN-ADOPTION.json','LESSONS-r18.md','M0-EXTERNAL-CONFIG-TYPES-OBSERVED-ADOPTION.json']
late_roles={}
for n in late:
 p=root/n;r=role(p);z=index[str(p)];assert r['bytes']==z['bytes'] and r['sha256']==z['sha256'];late_roles[n]=r
ad=json.loads((root/late[0]).read_text());co=json.loads((root/late[1]).read_text());di=json.loads((root/late[2]).read_text());ty=json.loads((root/late[4]).read_text())
assert co['caseCount']==49 and co['positiveCount']==9 and co['specificNegativeCount']==40 and co['fullBodyGameAssertionsExecuted'] is False and co['fullQualificationAccepted'] is False
assert ty['typesAccepted'] is True and ty['collectionAccepted'] is True and ty['historicalRootUnchanged'] is False
assert 'be632d53' in text and 'fa668' in text and 'exactfailed rowbytes/kind/family/iteration remain unknown' in text.lower() and 'mutant unrun' in text and 'AFTER proofs and terminal prefix remain null' in text
assert 'source-preparation-only; no implementation or runtime admitted' in text and 'does not complete1363, P16, P17 or P18' in text and 'No silent truncation' not in text
receipt={'schema':'1370-an-final-input-inventory-claim-independent-review/v1','decision':'ACCEPT_FINITE_AN_INPUT_INVENTORY_AND_TRUTHFUL_FINAL_CLAIM_ONLY','concreteFindings':[],'executionAuthorization':False,'inputs':{'inputPackages':inp,'inventory':inv,'claim':claim},'lateActualRolePins':late_roles,'verification':{'explicitPaths':285,'duplicatePaths':0,'ancestorOverlaps':0,'roles':2877,'bytes':164679949,'localOnlyRoles':65,'semanticWholeMachineLocalRoles':64,'rebuildableCacheLocalRoles':1,'localExportOrGitReuseRoles':0,'privateMirrorOrDependencyPayloadPaths':0,'pendingAdditions':0,'lateAMFinalizationSelected':True,'currentReviewExcludedFromInventory':True},'claimReview':'Accepted types/collection and49public controls remain separate from fullbody STOP. Unknown failed row/iteration, unrun mutant/null AFTER proofs, separate successful shared postflight, design-only diagnostic, neutral416 and downstream1363/P17/P18 pending are stated truthfully.','limits':['Reviewed finite explicit metadata/classification and named authority payloads only; no raw PS/FD/cache contents or private inventories read.','No archive payload copy hash verification or priorGitBlob verification in this receipt; those remain finalizer/archive review scope.','This is not observed fullfunction, neutral416, game release or downstream acceptance.'],'majorLessons':['Semantic raw classifications must cover every producer raw role independently of suffix.','Published role maps must match actual recipes and manifests; source-only acceptance never supplies runtime authority.','A protected STOP may coexist with successful shared postflight without AFTER M0 proofs.']}
p=O/'RECEIPT.json';p.write_text(json.dumps(receipt,indent=2,sort_keys=True)+'\n');os.chmod(p,0o444);os.chmod(O/'check.py',0o444);print(json.dumps(role(p)));print('ADOPTION_KEYS',list(ad));print('DESIGN_KEYS',list(di))
