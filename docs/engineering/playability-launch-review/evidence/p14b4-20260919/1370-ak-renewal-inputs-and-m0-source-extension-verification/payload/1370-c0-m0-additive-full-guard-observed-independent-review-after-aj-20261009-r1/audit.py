from pathlib import Path
import json,hashlib,os,collections
S=Path('/Users/zacheryspector/studio-scratch');P=Path(__file__).parent;Q=S/'1370-c0-m0-additive-operational-full-guard-after-aj-proposal-20261009-r2';E=Q/'evidence/before-fill-after-aj-r3';R=S/'1370-c0-m0-additive-full-guard-parent-recorded-after-aj-20261009-r2'
def h(b):return hashlib.sha256(b).hexdigest()
def readrole(r):
 b=Path(r['path']).read_bytes();assert h(b)==r['sha256'];assert 'bytes' not in r or len(b)==r['bytes'];return b
out=R/'BEFORE-FILL-TOOL-OUTCOME.json';raw=out.read_bytes();assert h(raw)=='07646a7a1620318c3ded960d1b2a99a82af385d84d6a70d29e29c1aa4e830607';o=json.loads(raw)
for n,r in o.items():
 if isinstance(r,dict) and 'path' in r and 'sha256' in r:readrole(r)
pins=json.loads((E/'PINS.json').read_text())
for n,sha in pins['files'].items():assert h((E/n).read_bytes())==sha
snap=json.loads((E/'SNAPSHOT.json').read_text());c=json.loads((Q/'CONFIG.json').read_text());grant=json.loads((R/'BEFORE-FILL-GRANT.json').read_text())
for n in ['config','exactArgvProposal','exactRepairReview','guardSource','sourceReview','sourceScript']:readrole(grant[n])
assert grant['argv']==json.loads((R/'EXACT-ARGV-PROPOSAL.json').read_text())['argv'];assert grant['argv'][-2:]==['before-fill','before-fill-after-aj-r3']
assert snap['configSha256']==h((Q/'CONFIG.json').read_bytes()) and snap['snapshotProcedureSha256']==h((Q/'snapshot.py').read_bytes())
private=json.loads(readrole(c['privateBaseline']));i=snap['immutable'];old=private['immutable'];assert i['privateAcceptedFullProof']==c['privateBaseline'];assert snap['baseline'] is None
for k in ['bindingSha256','actualCopySupervisorSha256','actualCopyResultSha256','actualCopyPayloadSha256','physicalCheckout','copiedDependencies','productionDependencies','allocatedBytes']:assert i[k]==old[k],k
assert i['protectedDigests']['copied']==old['protectedDigests']['copied']
for n in ['copiedRoot','copiedGit','copiedDependencies']:assert i['strictRoots'][n]==old['strictRoots'][n] and i['ancestry'][n]==old['ancestry'][n]
for n in snap['rootsBefore']:
 if n!='scratchParent':assert snap['rootsBefore'][n]==snap['rootsAfter'][n]==i['strictRoots'][n]
 else:assert {k:snap['rootsBefore'][n][k] for k in ['path','device','inode','mode']}=={k:snap['rootsAfter'][n][k] for k in ['path','device','inode','mode']}==i['scratchParentIdentity']
assert all(x=='HANDOFF.md' or x.startswith('docs/') for x in i['docsOnlyChangedPaths']);assert i['operationalProductionHead']==c['productionHead'] and i['operationalSourceTree']==c['productionSourceTree']
bindingraw=Path(c['bindingPath']).read_bytes();assert h(bindingraw)==i['bindingSha256'];binding=json.loads(bindingraw)
payloadraw=(Path(binding['outputRoot'])/'child.stdout').read_bytes();assert h(payloadraw)==i['actualCopyPayloadSha256'];payload=json.loads(payloadraw);assert i['physicalCheckout']==payload['physicalCheckout'] and i['copiedDependencies']==payload['dependencyManifest']
a=i['productionDependencies'];b=i['copiedDependencies'];assert {k:{x:y for x,y in v.items() if x!='inode'} for k,v in a.items()}=={k:{x:y for x,y in v.items() if x!='inode'} for k,v in b.items()}
aa={x['inode'] for x in a.values() if x['type']=='regular'};bb={x['inode'] for x in b.values() if x['type']=='regular'};assert len(aa)==len(bb)==11060 and not aa&bb
tool=json.loads(readrole(o['actualTool']));assert tool['chunks'][-1]['exit_code']==o['actualToolExit']==0;assert tool['actualToolSession']==43355
assert json.loads(readrole(o['stdout']))==o['result'] and readrole(o['stderr'])==b''
counts=dict(collections.Counter(x['type'] for x in i['copiedDependencies'].values()));assert counts==dict(regular=11060,directory=1401,symlink=24)
# Independence evidence is in regular records; print field schema to qualify exact comparison.
regular=next(x for x in i['copiedDependencies'].values() if x['type']=='regular')
for when in ['Before','After']:
 f=snap['current'+when];assert not f['ownedGroupClearanceClaim'] and f['ownedGroupIdsChecked']==[]
 for tag,key in [('PS.txt','ps'),('LSOF.bin','lsof')]:
  b=(E/(when.upper()+'-'+tag)).read_bytes();assert len(b)==f[key+'RawBytes'] and h(b)==f[key+'RawSha256']
for n in [93713]:
 for fn in [os.kill,os.killpg]:
  try:fn(n,0)
  except ProcessLookupError:pass
  else:raise AssertionError('fresh scanner survives')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
prior=json.loads((R/'EXACT-ARGV-PROPOSAL.json').read_text())['priorStop'];readrole(prior)
facts={'schema':'1370-m0-current-aj-observed-full-guard-independent-audit/v1','snapshotSha256':h((E/'SNAPSHOT.json').read_bytes()),'evidencePinsSha256':h((E/'PINS.json').read_bytes()),'previousPrivateProofSha256':c['privateBaseline']['sha256'],'privateFieldsExact':['full physicalCheckout','full copiedDependencies','full productionDependencies','copied protected digest','original binding/supervisor/result/payload hashes','allocation','three strict private roots and ancestry'],'dependencyCounts':counts,'dependencyRegularRecordFields':list(regular),'docsOnlyChangedPathCount':len(i['docsOnlyChangedPaths']),'physicalCheckoutCount':len(i['physicalCheckout']),'strictRootCount':len(i['strictRoots']),'scratchSiblingAdded':sorted(set(snap['scratchParentChildrenAfter'])-set(snap['scratchParentChildrenBefore'])),'scratchSiblingRemoved':sorted(set(snap['scratchParentChildrenBefore'])-set(snap['scratchParentChildrenAfter'])),'freshScannerPidPgidAbsent':93713,'heavyLockAbsent':True,'fullScanRerun':False,'sourceImportsOrExecution':False}
(P/'FACTS.json').write_text(json.dumps(facts,indent=2,sort_keys=True)+'\n');print(json.dumps(facts))
