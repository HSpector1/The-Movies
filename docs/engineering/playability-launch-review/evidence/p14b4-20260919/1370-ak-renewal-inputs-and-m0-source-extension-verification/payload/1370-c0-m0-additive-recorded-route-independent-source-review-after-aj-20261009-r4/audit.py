from pathlib import Path
import ast,datetime,hashlib,json,os,stat
HERE=Path(__file__).parent
S=Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-c0-m0-additive-recorded-route-proposal-20261009-r4'
OLD=S/'1370-c0-m0-additive-recorded-route-proposal-20261009-r3'
roles={};raws={}
def read(p,expected=None):
 p=Path(p)
 if str(p) in raws:
  if expected:assert roles[str(p)]==expected
  return raws[str(p)]
 assert p.resolve(strict=True)==p
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  st=os.fstat(fd);assert stat.S_ISREG(st.st_mode) and st.st_nlink==1 and st.st_size<=1048576
  b=b''
  while True:
   part=os.read(fd,65536)
   if not part:break
   assert len(b)+len(part)<=1048576;b+=part
  key=lambda t:(t.st_dev,t.st_ino,t.st_mode,t.st_nlink,t.st_size,t.st_mtime_ns,t.st_ctime_ns)
  assert key(st)==key(os.fstat(fd))==key(p.lstat()) and len(b)==st.st_size
 finally:os.close(fd)
 r={'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
 if expected:assert r==expected
 roles[str(p)]=r;raws[str(p)]=b;return b
pins=json.loads(read(P/'SOURCE-PINS.json'));assert roles[str(P/'SOURCE-PINS.json')]['sha256']=='6158d78ede4cf86aa5a6a68fec56a9c7e29c085399ef0d6cbe198a1655df4f5e'
for r in pins['files'].values():read(r['path'],r)
read(pins['externalImmutableInputs']['path'],pins['externalImmutableInputs'])
prov=json.loads(read(P/'PROVENANCE.json'))
for r in prov['roles']:read(r['path'],r)
assert pins['executionAuthorization'] is False and pins['executionPerformed'] is False
r3pins=json.loads(read(OLD/'SOURCE-PINS.json'))
for n in ['add_inputs.py','record.py','supervise.py','BINDING-UNFILLED.json','ARGV-ROLE.json','LAUNCH-UNFILLED.json','CONTROL-REUSE-MAPPING.json']:read(OLD/n,r3pins['files'][n])
proof=json.loads(read(P/'INVERSE-AND-BODY-PROOF.json'));sub=proof['recorderSingleLiteralSubstitution'];record=read(P/'record.py').decode();old=read(OLD/'record.py').decode()
assert record.count(sub['new'])==1 and sub['old'] not in record and record.replace(sub['new'],sub['old'])==old
assert read(P/'add_inputs.py')==read(OLD/'add_inputs.py') and read(P/'supervise.py')==read(OLD/'supervise.py')
assert ast.dump(ast.parse(record.replace(sub['new'],sub['old'])),include_attributes=False)==ast.dump(ast.parse(old),include_attributes=False)
body=read(P/'add_inputs.py').decode();assert "INPUTS=S/'1370-c0-m0-additive-recorded-route-proposal-20261009-r3/INPUTS.json'" in body and "INPUTS_SHA='a9f50c1d0cb6ae54084becf514ed7908c41572050e0df19a50007e3a804ff881'" in body
inp=json.loads(read(pins['externalImmutableInputs']['path']));assert inp['operationalHead']==pins['productionHead']=='f0fb818fe7534c3e3784206d16728b015c7f059a'
binding=json.loads(read(P/'BINDING-UNFILLED.json'));oldbinding=json.loads(read(OLD/'BINDING-UNFILLED.json'));changed=sorted(k for k in set(binding)|set(oldbinding) if binding.get(k)!=oldbinding.get(k));assert changed==sorted(proof['bindingChangedFields']) and len(changed)==7
argv=json.loads(read(P/'ARGV-ROLE.json'));launch=json.loads(read(P/'LAUNCH-UNFILLED.json'))
for key,n in [('materializer','add_inputs.py'),('recorder','record.py'),('supervisor','supervise.py')]:assert binding[key+'Path']==str(P/n) and binding[key+'Sha256']==roles[str(P/n)]['sha256']
assert binding['materializerArgvRolePath']==str(P/'ARGV-ROLE.json') and binding['materializerArgvRoleSha256']==roles[str(P/'ARGV-ROLE.json')]['sha256']
assert binding['materializerArgv']==argv['materializerArgv'] and argv['materializerArgv'][3]==binding['materializerPath']
assert launch['argv'][3]==binding['supervisorPath'] and launch['argv'][:3]==argv['materializerArgv'][:3]
assert launch['argv'][4]==argv['materializerArgv'][4]=='<EXACT_ADOPTED_BINDING_PATH>'
assert binding['launchCwd']==argv['cwd']==launch['cwd'] and binding['launchEnvironment']==argv['requiredEnvironment']==launch['environment']
assert all(x['executionAuthorization'] is False for x in [binding,argv,launch])
assert binding['routeSourceReviewPath'] is binding['routeSourceReviewSha256'] is binding['routeSourceReviewDecision'] is None
assert binding['materializerSourceReviewPath'] is binding['materializerSourceReviewSha256'] is binding['exactBindingReviewPath'] is binding['preflightReviewPath'] is None
assert binding['productionHead']==inp['operationalHead'] and binding['parentScopeAdoptionSha256']==pins['parentScopeAdoptionSha256']=='13be428dfe3bdba1bc4ce4f2348bd194d2473c4c812df2b5f0bfec936b76b8e8'
cons=json.loads(read(P/'PATH-CONSISTENCY.json'));tree=ast.parse(record);fun=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='validated_spec')
req=sorted([n for n in ast.walk(fun) if isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id=='require'],key=lambda n:n.lineno)
assert len(req)==len(cons['validatedSpecPredicates'])==24
for n,r in zip(req,cons['validatedSpecPredicates']):assert n.lineno==r['line'] and ast.unparse(n.args[0])==r['predicate']
assert len(cons['paths'])==9
for r in cons['paths']:
 vals=[v for k,v in r.items() if k in ('required','argv','binding','launch')];assert len(set(vals))==1 and r['allEqual'] is True
# Verify mapped mechanisms against exact original source and all7 method AST identities.
reuse=json.loads(read(P/'CONTROL-REUSE-MAPPING.json'));assert read(P/'CONTROL-REUSE-MAPPING.json')==read(OLD/'CONTROL-REUSE-MAPPING.json')
for k in ['originalControlsPins','originalTestSource','acceptedObservedControls']:read(reuse[k]['path'],reuse[k])
test=ast.parse(read(reuse['originalTestSource']['path']));nodes={n.name:n for n in ast.walk(test) if isinstance(n,ast.FunctionDef)}
def ah(n):return hashlib.sha256(ast.dump(n,include_attributes=False).encode()).hexdigest()
count=0
for m in reuse['methods']:
 assert ah(nodes[m['method']])==m['originalMethodAstSha256']
 for t in m['targets']:
  fn=next(n for n in ast.parse(read(P/t['file'])).body if isinstance(n,ast.FunctionDef) and n.name==t['function']);assert ah(fn)==t['astSha256'];count+=1
observed=json.loads(read(reuse['acceptedObservedControls']['path']));assert observed['decision']=='ACCEPT_OBSERVED_SEVEN_ADDITIVE_TINY_CONTROLS_ONLY' and observed['methods']==7
hold=json.loads(read(S/'1370-c0-m0-additive-exact-fill-mapping-after-aj-20261009-r1/SOURCE-ACCEPTANCE-ADDENDUM.json'));assert hold['decision']=='HOLD_EXACT_M0_ADDITIVE_FILL_PENDING_VERSIONED_PATH_CORRECTION' and hold['originalAcceptancePreserved'] is True
facts={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'roles':roles,'singleRecorderLiteralInverseExact':True,'unchangedBodyAndSupervisorByteExact':True,'externalR3InputsExact':True,'bindingChangedFields':changed,'validatedSpecPredicatesAuthenticated':24,'pathRelationshipsAuthenticated':9,'methodAstCount':7,'mappedMechanismAstCount':count,'controlReuse':'UNCHANGED_SEVEN_MECHANISM_QUALIFICATION_ONLY','r4TestsExecuted':False,'r4TestsPassedClaimed':False,'runtimeMetadataOrMirrorReadbackPerformed':False,'fullScanGitImportsOrProposalExecuted':False,'findings':[]}
(HERE/'FACTS.json').write_text(json.dumps(facts,indent=2,sort_keys=True)+'\n');print(json.dumps({'status':'SOURCE_ARTIFACT_PATH_REPAIR_REVIEW_PASS','roles':len(roles),'methods':7,'mechanisms':count,'predicates':24,'pathRelationships':9}))
