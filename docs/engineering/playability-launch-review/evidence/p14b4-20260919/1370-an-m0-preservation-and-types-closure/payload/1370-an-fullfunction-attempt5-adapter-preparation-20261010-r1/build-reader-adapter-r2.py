from pathlib import Path
import json,os,hashlib,ast,difflib,re
S=Path('/Users/zacheryspector/studio-scratch')
P=Path(__file__).parent
BASE=S/'1370-an-fullfunction-r5-root-readback-source-20261010-r1'
OUT=S/'1370-an-fullfunction-r5-root-readback-source-20261010-r2'
F=S/'1370-an-m0-fullfunction-qualification-source-20261010-r13'
# Reuse only the trusted author's finite data-audit helper definitions; no
# candidate/reader source is imported or executed.
own=(P/'build-reader-adapter.py').read_text()
tree=ast.parse(own)
defs=[ast.get_source_segment(own,n) for n in tree.body if isinstance(n,ast.FunctionDef)]
exec('\n\n'.join(defs))
m,mr=auth(BASE/'SOURCE-PINS.json',2046,'3bd9ab18f403aebeb5bacd11f9103c938acf80bb08fe77b4a9f7540afed047e6')
for r in m['files'].values():assert role(Path(r['path']))==r
fm,fmr=auth(F/'SOURCE-PINS.json',20567,'5eb4371205271d8ae2b88d6c4dd2f7f20057b8ae30430fd8905e1ed3816d98d3')
c,cr=auth(F/'CONFIG.json',13790,'3a9e349f746c57a2aadb33d344eb5102abfca2e6cf4d5d017871b466c5ed3604')
before=(BASE/'read-fullfunction.py').read_text();after=before
changes=[('1370-an-m0-fullfunction-qualification-source-20261010-r12','1370-an-m0-fullfunction-qualification-source-20261010-r13'),('efb9f7b597a6781a69488437faea4755f4a4d186848bfe30baa1c801fa4cf669',cr['sha256']),('79d9400a49dc02abc836d9e3b9e9f4a814966da47cae67293f299b1993deb283',fmr['sha256'])]
for old,new in changes:assert after.count(old)==1;after=after.replace(old,new)
check=after
for old,new in reversed(changes):assert check.count(new)==1;check=check.replace(new,old)
assert check==before and helpers(before)==helpers(after)
OUT.mkdir(mode=0o700)
br=write('BASELINE-read-fullfunction.py',before);nr=write('read-fullfunction.py',after)
f=''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='BASE/read-fullfunction.py',tofile='NEW/read-fullfunction.py'))
inv=''.join(difflib.unified_diff(after.splitlines(True),before.splitlines(True),fromfile='NEW/read-fullfunction.py',tofile='BASE/read-fullfunction.py'))
assert apply_diff(f,before)==after and apply_diff(inv,after)==before
fr=write('read-fullfunction.forward.diff',f);ir=write('read-fullfunction.inverse.diff',inv)
priorproof=json.loads((BASE/'SOURCE-PROOF.json').read_bytes());aliases=priorproof['reviewAliases']
assert len(aliases)==15
for name in aliases:assert role(Path(fm['files'][name]['path']))==fm['files'][name]
write('SOURCE-PROOF.json',{'schema':'1370-fresh-attempt5-fullfunction-root-readback-source-proof/v1','executionAuthorization':False,'predecessorUnrunSourceManifest':mr,'predecessorR1PreservedUnrun':True,'upstreamR12RecipeStopPreserved':True,'prospectiveRouteSourceManifest':fmr,'prospectiveRouteConfig':cr,'exactThreeSingleSubstitutions':changes,'baseline':br,'derivative':nr,'forward':fr,'inverse':ir,'wholeNormalizationInverseExact':True,'wholeRetainedForwardInverseApplicationsExact':True,'allNonMainHelpersByteEqual':True,'runtimeProtocolAndFifteenAliasesOtherwiseByteUnchanged':True,'originalPassStopNullabilityProofPhaseMutantOwnershipPredicatesUnchanged':True,'reviewAliases':aliases,'expectedRuntimeAliasRoles':{name:fm['files'][name] for name in aliases},'noSourceAuthorRuntime':True,'futureActualSessionId':None,'futureActualGrant':None,'futureActualTool':None,'futureReadback':None})
recipe=json.loads((BASE/'RECIPE.json').read_bytes())
recipe['argv']=[str(x).replace(BASE.name,OUT.name) for x in recipe['argv']]
recipe['routeSourceManifest']=fmr;recipe['routeConfig']=cr
recipe['sourceScope']='Exact three binding substitutions from preserved unrun R1 reader after upstream R12 recipe source STOP; genuine R13 pins only. All runtime predicates,15aliases and readback protocol unchanged; root owns independent source review and actual readback.'
write('RECIPE.json',recipe)
write('LESSONS.txt','A sealed upstream recipe may carry stale source-role hashes or missing aliases; preserve that source STOP and every dependent unrun proposal. Fresh source/config pins require a fresh minimally rebound reader rather than silently editing sealed source. This R2 changes exactly3 literals, preserves15 runtime aliases/all original actual PASS/STOP/nullability/preservation/ownership predicates, and makes no future source acceptance or execution claim.\n')
files={p.name:role(p) for p in OUT.iterdir()}
pins=write('SOURCE-PINS.json',{'schema':'1370-fullfunction-root-readback-source-pins/v1','executionAuthorization':False,'files':files})
for r in files.values():assert role(Path(r['path']))==r
seal=write('SEAL.json',{'schema':'1370-fresh-root-readback-source-seal/v1','sourceManifest':pins,'allManifestRolesReadbackEqual':True,'executionAuthorization':False})
for p in OUT.iterdir():p.chmod(0o444)
OUT.chmod(0o555)
print(json.dumps({'sourceManifest':pins,'reader':nr,'seal':seal}))

