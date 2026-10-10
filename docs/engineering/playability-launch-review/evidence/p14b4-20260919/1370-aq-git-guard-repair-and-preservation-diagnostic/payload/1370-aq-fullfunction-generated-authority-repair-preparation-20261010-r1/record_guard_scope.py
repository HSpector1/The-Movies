"""Retained/public source semantics only; no live protected-tree reads."""
from pathlib import Path
import ast,hashlib,json
S=Path('/Users/zacheryspector/studio-scratch');D=Path(__file__).resolve().parent
Q=S/'1370-aq-root-continuation-20261010-r1';G=S/'1370-aq-current-operational-fullguard-source-20261010-r1'
def role(p):
 b=Path(p).read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def load(p):return json.loads(Path(p).read_text())
ad=load(Q/'CURRENT-AP-FULL-PREFLIGHT-OBSERVED-ADOPTION.json');base=load(ad['snapshot']['path']);cfg=load(G/'CONFIG.json');text=(G/'snapshot.py').read_text();tree=ast.parse(text)
immutable=None
for n in ast.walk(tree):
 if isinstance(n,ast.Assign) and any(isinstance(x,ast.Name) and x.id=='immutable' for x in n.targets):immutable=n.value
assert isinstance(immutable,ast.Dict)
expressions={ast.literal_eval(k):ast.get_source_segment(text,v) for k,v in zip(immutable.keys,immutable.values)}
assert set(expressions)==set(base['immutable'])
assert base['phase']=='before-fill' and base['status']=='GUARDS_ACCEPTED_READONLY'
assert base['configSha256']==role(G/'CONFIG.json')['sha256'] and base['snapshotProcedureSha256']==role(G/'snapshot.py')['sha256']
for k,w in [('operationalProductionHead',cfg['productionHead']),('operationalSourceTree',cfg['productionSourceTree']),('originalCopyProductionHead',cfg['originalCopyProductionHead']),('parentScopeAdoption',cfg['parentScopeAdoption'])]:assert base['immutable'][k]==w
excluded=['phase','owned','facts_before','facts_after','scratch_children_before','inventory_seconds','started']
for k,v in expressions.items():
 names={x.id for x in ast.walk(ast.parse(v,mode='eval')) if isinstance(x,ast.Name)}
 assert not set(excluded)&names,(k,names)
report={'schema':'1370-aq-shared-postflight-static-scope-diagnosis/v1','executionAuthorization':False,'candidateOrGuardExecuted':False,'privateTreesRead':False,'config':role(G/'CONFIG.json'),'guardSource':role(G/'snapshot.py'),'originalAdoption':role(Q/'CURRENT-AP-FULL-PREFLIGHT-OBSERVED-ADOPTION.json'),'originalSnapshot':ad['snapshot'],'immutableFieldExpressions':expressions,'baselineKeySetMatchesProducer':True,'originalConfigAndProcedurePinsMatch':True,'fixedOperationalMetadataMatchesConfig':True,'phaseAndOwnedIdsNotImmutable':True,'scratchParentMtimeCtimeNotImmutable':True,'baselineComparisonBeforeOutputWrite':True,'failureScope':'Original full immutable equality STOP, with exact differing key/value not retained. No current private state measured by this source-only review.','factsImpliedByControlFlow':['Copied protected digest matched original accepted private proof.','Fresh copied/production dependency inventories and allocation matched original accepted proof.','Copied root/Git/dependency strict roots and ancestry matched original accepted proof.','Nine strict roots stayed stable during this scan.','Scratch parent device/inode/mode stayed stable during this scan.'],'possibleUnattributedComparisonFields':['protectedDigests.production/commonGit/retainedHParent/retainedHLeaf','non-copy strictRoots','ancestry','scratchParentIdentity','other fixed documentary fields'],'claimLimits':['No exact drift attribution, no repin and no postflight acceptance.','No deterministic phase/owned/rawPSFD/disk/scratch-child timestamp mismatch is supported by these unchanged source expressions.','A retained bounded mismatch report is required to distinguish real protected drift from any producer logic defect.']}
(D/'POSTFLIGHT-STATIC-SCOPE-DIAGNOSIS.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(role(D/'POSTFLIGHT-STATIC-SCOPE-DIAGNOSIS.json')))
