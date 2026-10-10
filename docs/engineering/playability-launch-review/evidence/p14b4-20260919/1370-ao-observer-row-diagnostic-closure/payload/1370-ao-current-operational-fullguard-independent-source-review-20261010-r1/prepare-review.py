from pathlib import Path
import ast,hashlib,json,os,re
S=Path('/Users/zacheryspector/studio-scratch')
SRC=S/'1370-ao-current-operational-fullguard-source-20261010-r1'
OUT=S/'1370-ao-current-operational-fullguard-independent-source-review-20261010-r1'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def save(n,obj):
 p=OUT/n;b=(json.dumps(obj,indent=2,sort_keys=True)+'\n').encode()
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 assert p.read_bytes()==b
 return role(p)
def apply_diff(data,patch):
 original=data.decode().splitlines(True);lines=patch.decode().splitlines(True);out=[];cursor=0;i=2
 assert lines[0].startswith('--- ') and lines[1].startswith('+++ ')
 while i<len(lines):
  h=re.fullmatch(r'@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@\n',lines[i]);assert h
  oldcount=int(h[2] or 1);newcount=int(h[4] or 1);start=int(h[1])-1 if oldcount else int(h[1]);assert cursor<=start
  out.extend(original[cursor:start]);cursor=start;i+=1;oldseen=newseen=0
  while i<len(lines) and not lines[i].startswith('@@ '):
   v=lines[i];assert v[0] in ' +-'
   if v[0] in ' -':assert original[cursor]==v[1:];cursor+=1;oldseen+=1
   if v[0] in ' +':out.append(v[1:]);newseen+=1
   i+=1
  assert (oldseen,newseen)==(oldcount,newcount)
 out.extend(original[cursor:]);return ''.join(out).encode()
assert sorted(p.name for p in OUT.iterdir())==['prepare-review.py']
pins=role(SRC/'SOURCE-PINS.json');assert pins['sha256']=='9df63e39d302e3b8481198999e129233ab4eb5709848d91cb1d45af0dfee0e88'
m=json.loads((SRC/'SOURCE-PINS.json').read_bytes())
for k,r in m['files'].items():assert role(Path(r['path']))==r,k
p=json.loads((SRC/'PROOF.json').read_bytes())
for k in ['originalSource','originalConfig','newSource','newConfig','currentOperationalFacts','currentOperationalScope']:
 assert role(Path(p[k]['path']))==p[k],k
oldsrc=(SRC/'BASE-snapshot.py.txt').read_bytes();newsrc=(SRC/'snapshot.py').read_bytes()
oldcfg=(SRC/'BASE-CONFIG.json').read_bytes();newcfg=(SRC/'CONFIG.json').read_bytes()
assert oldsrc==Path(p['originalSource']['path']).read_bytes()
assert oldcfg==Path(p['originalConfig']['path']).read_bytes()
oc=json.loads(oldcfg);nc=json.loads(newcfg)
changed=sorted(k for k in set(oc)|set(nc) if oc.get(k)!=nc.get(k))
assert changed==p['configChangedKeys']==['operationalRemoteRefs','parentScopeAdoption','productionHead','status']
restored_cfg=dict(nc)
for k in changed:restored_cfg[k]=oc[k]
assert (json.dumps(restored_cfg,indent=2,sort_keys=True)+'\n').encode()==oldcfg
oldsha=hashlib.sha256(oldcfg).hexdigest();newsha=hashlib.sha256(newcfg).hexdigest()
assert oldsrc.count(oldsha.encode())==1 and newsrc.count(newsha.encode())==1
assert oldsrc.replace(oldsha.encode(),newsha.encode())==newsrc
assert newsrc.replace(newsha.encode(),oldsha.encode())==oldsrc
assert apply_diff(oldsrc,(SRC/'forward.diff').read_bytes())==newsrc
assert apply_diff(newsrc,(SRC/'inverse.diff').read_bytes())==oldsrc
oldtext=oldsrc.decode();newtext=newsrc.decode();ot=ast.parse(oldtext);nt=ast.parse(newtext)
oldfunctions={n.name:n for n in ot.body if isinstance(n,(ast.FunctionDef,ast.ClassDef))}
newfunctions={n.name:n for n in nt.body if isinstance(n,(ast.FunctionDef,ast.ClassDef))}
assert oldfunctions.keys()==newfunctions.keys()
for k in oldfunctions:
 assert ast.get_source_segment(oldtext,oldfunctions[k])==ast.get_source_segment(newtext,newfunctions[k])
 assert ast.dump(oldfunctions[k],include_attributes=False)==ast.dump(newfunctions[k],include_attributes=False)
scope=json.loads(Path(p['currentOperationalScope']['path']).read_bytes())
facts=json.loads(Path(p['currentOperationalFacts']['path']).read_bytes())
assert nc['productionHead']==facts['actualHead']==scope['productionGuardHead']=='0cf8b1d0bbf7d1977413d0c3074407cc8f7b80a4'
assert facts['predecessor']=='7087f116cf998fd86e33fb8e004df628e0686dbd'
assert nc['productionSourceTree']==facts['sourceTree']==scope['productionSourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
assert nc['operationalRemoteRefs']==facts['remoteRefsVerified']==scope['remoteRefsVerified']
assert facts['docsOnlyVerified'] is True and facts['workingTreeClean'] is True and facts['docsOnlyPathCount']==2654
assert nc['parentScopeAdoption']=={k:p['currentOperationalScope'][k] for k in ['path','sha256']}
assert nc['privateBaseline']==oc['privateBaseline'] and nc['privateBaseline']['sha256']=='555867b2be0abf76728fc8b905c52a73512b5da31d24162d804e7e1b9d8c9347'
pub=facts['publishedReadback'];assert role(Path(pub['path']))==pub
receipt={
 'schema':'1370-current-an-fullguard-independent-source-review/v1',
 'decision':'ACCEPT_CURRENT_AN_FULLGUARD_BINDINGS_SOURCE_ONLY',
 'sourcePins':pins,'sourceManifest':pins,
 'concreteFindings':[],'findings':[],'executionAuthorization':False,
 'sourceProof':m['files']['PROOF.json'],'config':m['files']['CONFIG.json'],'source':m['files']['snapshot.py'],
 'predecessorSource':p['originalSource'],'predecessorConfig':p['originalConfig'],
 'currentOperationalFacts':p['currentOperationalFacts'],'currentOperationalScope':p['currentOperationalScope'],'publishedReadback':pub,
 'checks':{'allSevenManifestRolesAuthenticated':True,'changedConfigKeys':changed,'completeConfigInverseByteExact':True,'onlySourceChange':'Exact CONFIG_SHA literal','completeSourceForwardInverseApplications':2,'fullSourceNormalizationInverseByteExact':True,'allFunctionSourceAndAstExact':list(oldfunctions),'privateBaselineRoleUnchanged':nc['privateBaseline'],'originalGuardsAndProcedureUnchanged':True,'originalPerCommandSeconds':180,'overallScanDeadline':None,'freshCompleteInventoryStillRequired':True,'noPrivateRootExceptionAdded':True,'docsOnlyTransitionPathCount':2654,'futureGrantStillNull':m['actualGrant'] is None},
 'scope':'Static operational binding review from proven AN fullguard to actual published AN HEAD only. No scanner execution, imports, repo/Git reads or mutations, new current probes, private baseline/inventory traversal or runtime acceptance. Published/remote/current facts are authenticated retained root observations; no independent live query claimed.',
 'limits':'Full production/common/private inventory and nine-root guard must be performed by root under separately genuine scan authority. Historical private555867 and M0 metadata qualification remain distinct. This receipt grants no game, rematerialization or scientific waiver.',
 'reviewer':'b109_focused_route_review, independent of root rebinding author',
 'actualGuard':None,'actualGuardObservedReview':None,
}
r=save('RECEIPT.json',receipt)
seal={'schema':'1370-independent-source-review-seal/v1','files':{'RECEIPT.json':r,'prepare-review.py':role(OUT/'prepare-review.py')},'executionAuthorization':False}
for v in seal['files'].values():assert role(Path(v['path']))==v
se=save('SEAL.json',seal)
for f in OUT.iterdir():f.chmod(0o444)
OUT.chmod(0o555)
print(json.dumps({'receipt':r,'seal':se},indent=2))
