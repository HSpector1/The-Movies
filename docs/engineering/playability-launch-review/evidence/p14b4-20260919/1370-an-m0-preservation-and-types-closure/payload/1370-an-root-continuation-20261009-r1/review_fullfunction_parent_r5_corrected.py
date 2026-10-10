import ast,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');Q=S/'1370-an-m0-fullfunction-parent-source-20261010-r5'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
mr=role(Q/'SOURCE-PINS.json');assert mr['sha256']=='541be09dd5c5d0232ce19653c700115b440f2e3e599e9f919cb5f7624ca74a0b';m=read(mr['path'])
for r in m['files'].values():assert role(r['path'])==r
p=read(Q/'SOURCE-PROOF.json');assert p['executionAuthorization'] is False
for k in ('predecessorSourceManifest','predecessorIndependentSourceReview','implementationSourceManifest'):assert role(p[k]['path'])==p[k]
assert p['predecessorSourceManifest']['sha256']=='bbd9477ee57d96fbf4b325277542819725cff0d707418aea6acd038d10d55618'
assert p['predecessorIndependentSourceReview']['sha256']=='6ebdd529dbb7d5a1fff2483c72eff328230dbac794da9ea35928fd47213fd86d'
oldm=read(p['predecessorSourceManifest']['path']);old=Path(oldm['files']['launch-fullfunction.py']['path']).read_text();assert Path(p['baseline']['path']).read_text()==old
new=(Q/'launch-fullfunction.py').read_text();compile(new,str(Q/'launch-fullfunction.py'),'exec')
expected=old;steps=[]
def change(a,b):
 global expected
 assert expected.count(a)==1;expected=expected.replace(a,b);steps.append((a,b))
assignment=next(l for l in new.splitlines() if l.startswith(' representation_roles='))
roles=ast.literal_eval(assignment.split('=',1)[1]);im=read(p['implementationSourceManifest']['path'])
assert set(roles)=={'m0TraceCodec.mjs','traceSequences.mjs','m0WiringProbe.ts','ordering.ts','FULL-BODY-CONTROLS-TEMPLATE.ts'} and roles==p['fixedExternalRepresentationInputs']
for k,r in roles.items():assert r==im['files'][k] and role(r['path'])==r
anchor=" parser_config=load(authenticate(sp['files']['CONFIG.json']))"
change(anchor,anchor+'\n'+assignment+"\n require(exact(parser_config['representationInputs'],representation_roles),'EXACT_FIXED_REPRESENTATION_INPUTS')")
anchor="  else:require(Path(r['path'])==source/name,'ROUTE_FILE_PATH')"
change(anchor,"  elif name in representation_roles:require(exact(r,representation_roles[name]),'EXACT_REVIEWED_EXTERNAL_REPRESENTATION_ROLE')\n"+anchor)
oldline=next(l for l in old.splitlines() if l.startswith(" for name in ('CONFIG.json','run-fullfunction.py'"))
newline=next(l for l in new.splitlines() if l.startswith(" for name in ('CONFIG.json', 'run-fullfunction.py'"))
oa=ast.parse(oldline.strip()).body[0];na=ast.parse(newline.strip()).body[0]
assert ast.literal_eval(na.iter)==tuple(p['reviewAliases']) and len(p['reviewAliases'])==15 and ast.dump(oa.body[0])==ast.dump(na.body[0])
change(oldline,newline)
parserline=next(l for l in old.splitlines() if l.startswith(" parser=load(authenticate(b['parserControlsAdoption']))"))
change(parserline,parserline+"\n lossless=load(authenticate(b['losslessControlsObservedAdoption']));require(lossless['executionAuthorization'] is False,'EXTERNAL_LOSSLESS_CONTROLS_OBSERVED_ROLE')")
change('1370-an-m0-fullfunction-parent-recorded-20261010-r4','1370-an-m0-fullfunction-parent-recorded-20261010-r5')
needle="'parserControlsAdoption':b['parserControlsAdoption'],"
change(needle,needle+"'losslessControlsObservedAdoption':b['losslessControlsObservedAdoption'],")
assert expected==new
back=new
for a,b in reversed(steps):assert back.count(b)==1;back=back.replace(b,a)
assert back==old
helpers=[]
for x in ast.parse(old).body:
 if isinstance(x,ast.FunctionDef) and x.name!='main':
  y=next(t for t in ast.parse(new).body if isinstance(t,ast.FunctionDef) and t.name==x.name)
  assert ast.get_source_segment(old,x)==ast.get_source_segment(new,y);helpers.append(x.name)
assert len(helpers)==10
v={'schema':'1370-root-independent-fullfunction-parent-source-review/v1','decision':'ACCEPT_STATIC_FULLFUNCTION_ONCE_PARENT_SOURCE_ONLY','sourceManifest':mr,'sourcePins':m['files'],'routeSourcePins':m['files'],'concreteFindings':[],'executionAuthorization':False,'reviewer':'root, independent from b109 author','checks':{'allRolesAuthenticated':True,'allTenOriginalHelpersExact':helpers,'wholeExactDeclaredForwardAndInverse':True,'fixedFiveRepresentationRoles':roles,'explicitReviewAliasCount':15,'compileOnly':True,'originalTwoParserExceptionsUnchanged':True,'clocksAndOwnershipUnchanged':True},'scope':'Fresh R5 parent only. Exact five C/R3 representation roles plus two original F7 parser exceptions; other route files local. Genuine observed49 external role authenticated and transferred into grant; independently reviewed R12 controller and Node must validate its semantics before private work. No actual runtime acceptance.'}
D=S/'1370-an-m0-fullfunction-parent-independent-source-review-20261010-r5-r2';D.mkdir(mode=0o700);out=D/'RECEIPT.json'
with out.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
out.chmod(0o444);print(json.dumps(role(out)))
