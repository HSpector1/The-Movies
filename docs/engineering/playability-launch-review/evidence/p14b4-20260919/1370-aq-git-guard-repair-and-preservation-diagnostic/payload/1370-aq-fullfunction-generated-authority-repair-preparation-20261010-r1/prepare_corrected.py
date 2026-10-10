"""Data-only corrective source preparation. No candidate import or execution."""
from pathlib import Path
import ast,copy,difflib,hashlib,json,re,sys
S=Path('/Users/zacheryspector/studio-scratch');D=Path(__file__).resolve().parent
Q=S/'1370-aq-root-continuation-20261010-r1'
F0=S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-source-20261010-r2'
P0=S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-parent-source-20261010-r2'
W0=S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-root-wrappers-source-20261010-r2'
F=S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-source-20261010-r3'
P=S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-parent-source-20261010-r3'
W=S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-root-wrappers-source-20261010-r3'
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def load(p):return json.loads(Path(p).read_text())
def put(p,v):Path(p).write_text(json.dumps(v,indent=2)+'\n')
def change(t,a,b,count=1):assert t.count(a)==count,(a,t.count(a),count);return t.replace(a,b)
def proof(old,new,p):
 delta=list(difflib.ndiff(old.splitlines(True),new.splitlines(True)))
 assert ''.join(difflib.restore(delta,1))==old and ''.join(difflib.restore(delta,2))==new
 return {'baseline':role(p),'losslessNdiff':delta,'forward':''.join(difflib.unified_diff(old.splitlines(True),new.splitlines(True))),'inverse':''.join(difflib.unified_diff(new.splitlines(True),old.splitlines(True))),'bothApplicationsVerified':True}
mapping={}
for a,b in [(F0,F),(P0,P),(W0,W)]:mapping[str(a)]=str(b);mapping[a.name]=b.name
for kind in ['results','recorder-results','parent-recorded','lane']:
 a='1370-aq-m0-fullfunction-native-refusal-diagnostic-'+kind+'-20261010-r1';mapping[a]=a[:-1]+'2'
mapping['20261010-aq-m0-fullfunction-native-refusal-diagnostic-r1']='20261010-aq-m0-fullfunction-native-refusal-diagnostic-r2'
def text_rebase(t):
 for a,b in mapping.items():t=t.replace(a,b)
 return t
updates={}
def rebase(v):
 if isinstance(v,dict):
  if set(v)=={'path','bytes','sha256'} and v['path'] in updates:return updates[v['path']]
  return {k:rebase(x) for k,x in v.items()}
 if isinstance(v,list):return [rebase(x) for x in v]
 if isinstance(v,str):return text_rebase(v)
 return v
def register(old,new):updates[str(old)]=role(new)
def hashes(t):
 for old,r in updates.items():
  oldp=Path(old)
  if oldp.exists():t=t.replace(role(oldp)['sha256'],r['sha256'])
 return t
for d in [F,P,W]:
 if d.exists():
  assert load(d/'SOURCE-PINS.json')['sourceOnlyUnfilled'] is True,'NEVER_REWRITE_FINAL_SOURCE'
  kept=D/'DRAFT-FIRST'/d.name
  if not kept.exists():
   kept.mkdir(parents=True)
   for p in d.iterdir():
    assert p.is_file();q=kept/p.name;q.write_bytes(p.read_bytes());q.chmod(0o444)
   kept.chmod(0o555)
 else:d.mkdir()
c=load(F0/'CONFIG.json');head=c['operationalHead'];tree=c['productionSourceTree']
names=['CORE-TEST-TEMPLATE.ts','CONFIG-TEMPLATE.mts','canonical-typescript-transform.mjs','RESOLUTION-SOURCE-BINDING.json']
for n in names:
 t=text_rebase((F0/n).read_text())
 if n=='CORE-TEST-TEMPLATE.ts':t=change(t,"assert.equal(binding.operationalHead,'f2f97c622db7f5332164b790d1646355e89c00f4')",f"assert.equal(binding.operationalHead,'{head}')")
 (F/n).write_text(t);register(F0/n,F/n)
c=rebase(c);c['currentProtection']=None;c['reviewedPriorStopAdoption']=None
c['heldUnfilledActualRoles']=['currentProtection','reviewedPriorStopAdoption','actualSourceReview','actualGrant']
assert len(sys.argv) in [1,3]
filled=len(sys.argv)==3
if filled:
 pr=role(sys.argv[1]);assert pr['sha256']==sys.argv[2];pv=load(pr['path'])
 assert pv['schema']==c['currentProtectionSchema'] and pv['productionHead']==head and pv['productionSourceTree']==tree
 assert pv['currentAPFullPreflightAdoption']==c['actualCurrentAPFullPreflightAdoption'] and pv['nativeRefusalControlsObservedAdoption']==c['actualNativeRefusalControlsObservedAdoption']
 for k in ['recentProtectedPostflightReadback','recentProtectedPostflightSnapshot','reviewedPriorStopAdoption','actualPreflight','actualPreflightReadback','independentPreflightReview']:assert role(pv[k]['path'])==pv[k]
 c['currentProtection']=pr;c['reviewedPriorStopAdoption']=pv['reviewedPriorStopAdoption'];c['heldUnfilledActualRoles']=['actualSourceReview','actualGrant']
put(F/'CONFIG.json',c);register(F0/'CONFIG.json',F/'CONFIG.json')
# Exact operational assertions are checked as source, including the entire emitted copy graph.
core=(F/'CORE-TEST-TEMPLATE.ts').read_text()
for key,want in [('operationalHead',head),('productionSourceTree',tree)]:
 matches=re.findall(r"assert\.equal\(binding\."+key+r",'([^']+)'\)",core);assert matches==[want],(key,matches,want)
localgenerated={n:c['templates'][n] for n in ['CORE-TEST-TEMPLATE.ts','CONFIG-TEMPLATE.mts','FULL-BODY-CONTROLS-TEMPLATE.ts']}
localgenerated.update({n:c['inputs'][n] for n in ['fixtures.ts','ordering.ts','traceSequences.mjs','RESOLUTION-SOURCE-BINDING.json']})
oldHead='f2f97c622db7f5332164b790d1646355e89c00f4'
generatedAudit=[]
for n,r in localgenerated.items():
 assert role(r['path'])==r
 t=Path(r['path']).read_text();assert oldHead not in t,(n,'STALE_CURRENT_HEAD_IN_GENERATED_SOURCE')
 generatedAudit.append({'name':n,'role':r,'oldAOHeadAbsent':True,'headAssertions':[x for x in t.splitlines() if 'operationalHead' in x or 'productionSourceTree' in x]})
pyextra=""" recent=load(p['recentProtectedPostflightReadback']);snap=load(p['recentProtectedPostflightSnapshot']);base=load(p['currentAPFullPreflightSnapshot']);need(recent['toolExit']==0 and recent['fullImmutableEqual'] is True and recent['nineStrictRootsEqual'] is True and recent['laneReleased'] is True and recent['priorStopPreserved'] is True and recent['fullPostflightSnapshot']==p['recentProtectedPostflightSnapshot'],'RECENT_SHARED_POSTFLIGHT_READBACK');need(snap['phase']=='postflight' and snap['baseline']=={'path':p['currentAPFullPreflightSnapshot']['path'],'sha256':p['currentAPFullPreflightSnapshot']['sha256']} and snap['immutable']==base['immutable'],'RECENT_SHARED_POSTFLIGHT_BASELINE')
 pre=load(p['actualPreflightReadback']);need(pre['toolExit']==0 and pre['scannerAbsent'] is True and pre['preflight']==p['actualPreflight'] and pre['originalFullSnapshot']==p['recentProtectedPostflightSnapshot'] and pre['currentFullPreflightAdoption']==p['currentAPFullPreflightAdoption'],'FRESH_CURRENT_PREFLIGHT_RECENT_POST')
"""
jsextra=""" const recent=json(p.recentProtectedPostflightReadback),snap=json(p.recentProtectedPostflightSnapshot),base=json(p.currentAPFullPreflightSnapshot);need(recent.toolExit===0&&recent.fullImmutableEqual===true&&recent.nineStrictRootsEqual===true&&recent.laneReleased===true&&recent.priorStopPreserved===true&&equal(recent.fullPostflightSnapshot,p.recentProtectedPostflightSnapshot),'RECENT_SHARED_POSTFLIGHT_READBACK');need(snap.phase==='postflight'&&equal(snap.baseline,{path:p.currentAPFullPreflightSnapshot.path,sha256:p.currentAPFullPreflightSnapshot.sha256})&&equal(snap.immutable,base.immutable),'RECENT_SHARED_POSTFLIGHT_BASELINE');
 const pre=json(p.actualPreflightReadback);need(pre.toolExit===0&&pre.scannerAbsent===true&&equal(pre.preflight,p.actualPreflight)&&equal(pre.originalFullSnapshot,p.recentProtectedPostflightSnapshot)&&equal(pre.currentFullPreflightAdoption,p.currentAPFullPreflightAdoption),'FRESH_CURRENT_PREFLIGHT_RECENT_POST');
"""
for n in ['run-fullfunction.py','run-fullfunction.mjs','record-fullfunction.py']:
 t=hashes(text_rebase((F0/n).read_text()))
 if n=='run-fullfunction.py':
  a=t.index('def authenticate_current_protection');b=t.index('\ndef main()',a);seg=t[a:b]
  seg=change(seg,"'reviewedPriorStopAdoption']:read(p[k]","'reviewedPriorStopAdoption','recentProtectedPostflightReadback','recentProtectedPostflightSnapshot']:read(p[k]")
  seg=change(seg,' return p',pyextra+' return p');t=t[:a]+seg+t[b:]
 if n=='run-fullfunction.mjs':
  a=t.index('function authenticateCurrentProtection');b=t.index("\nneed(process.argv",a);seg=t[a:b]
  seg=change(seg,"'reviewedPriorStopAdoption'])readRole(p[k]","'reviewedPriorStopAdoption','recentProtectedPostflightReadback','recentProtectedPostflightSnapshot'])readRole(p[k]")
  seg=change(seg,' return p;',jsextra+' return p;');t=t[:a]+seg+t[b:]
 (F/n).write_text(t);register(F0/n,F/n)
mf={n:rebase(r) for n,r in load(F0/'SOURCE-PINS.json')['files'].items() if n not in ['RECIPE.json','WHOLE-FORWARD-INVERSE.json']}
aliases={n:mf[n] for n in c['reviewAliases']};assert len(aliases)==20
r=rebase(load(F0/'RECIPE.json'));r['config']=role(F/'CONFIG.json');r['currentProtection']=c['currentProtection'];r['currentProtectionContract']=load(c['currentProtection']['path']) if filled else None;r['reviewedPriorStopAdoption']=c['reviewedPriorStopAdoption'];r['sourcePins']=aliases;r['routeSourcePins']=aliases;r['futureInputs']['currentProtection']=c['currentProtection'];r['rootOnceGrantRequired']['currentProtection']=c['currentProtection'];r['heldUnfilledActualRoles']=c['heldUnfilledActualRoles'];r['sourceOnlyUnfilled']=not filled
r['generatedAuthorityValidation']={'operationalHead':head,'productionSourceTree':tree,'sourceAudit':str(D/'GENERATED-AUTHORITY-AUDIT.json'),'failedAttemptPreserved':True,'fixtureOrGameplayChanged':False}
put(F/'RECIPE.json',r);mf['RECIPE.json']=role(F/'RECIPE.json')
put(F/'WHOLE-FORWARD-INVERSE.json',{n:proof((F0/n).read_text(),(F/n).read_text(),F0/n) for n in mf if Path(mf[n]['path']).parent==F});mf['WHOLE-FORWARD-INVERSE.json']=role(F/'WHOLE-FORWARD-INVERSE.json')
put(F/'SOURCE-PINS.json',{**load(F0/'SOURCE-PINS.json'),'files':mf,'sourceOnlyUnfilled':not filled});register(F0/'SOURCE-PINS.json',F/'SOURCE-PINS.json')
for n in ['launch-fullfunction.py','read-fullfunction.py']:
 t=hashes(text_rebase((P0/n).read_text()))
 t=t.replace("'nativeRefusalControlsObservedAdoption'):authenticate(protection[name])","'nativeRefusalControlsObservedAdoption','recentProtectedPostflightReadback','recentProtectedPostflightSnapshot'):authenticate(protection[name])")
 t=t.replace("'nativeRefusalControlsObservedAdoption'):need(role","'nativeRefusalControlsObservedAdoption','recentProtectedPostflightReadback','recentProtectedPostflightSnapshot'):need(role")
 if n=='launch-fullfunction.py':t=change(t,"exact(preflight['originalFullSnapshot'],protection['currentAPFullPreflightSnapshot'])","exact(preflight['originalFullSnapshot'],protection['recentProtectedPostflightSnapshot'])")
 if n=='launch-fullfunction.py':
  marker=" protection=load(authenticate(b['currentProtection']));"
  guard=" core_role=c['templates']['CORE-TEST-TEMPLATE.ts'];core=authenticate(core_role).read_text();require(role(core_role['path'])==core_role,'CORE_TEMPLATE_READ_RACE');require(core.count(\"assert.equal(binding.operationalHead,'\"+c['operationalHead']+\"')\")==1 and core.count(\"assert.equal(binding.productionSourceTree,'\"+c['productionSourceTree']+\"')\")==1,'GENERATED_CORE_CURRENT_AUTHORITY')\n"
  t=change(t,marker,guard+marker)
 (P/n).write_text(t);register(P0/n,P/n)
rp=rebase(load(P0/'RECIPE.json'));rp['sourceOnlyUnfilled']=not filled;rp['currentProtection']=c['currentProtection'];rp['heldUnfilledActualRoles']=c['heldUnfilledActualRoles'];put(P/'RECIPE.json',rp)
put(P/'WHOLE-FORWARD-INVERSE.json',{n:proof((P0/n).read_text(),(P/n).read_text(),P0/n) for n in ['launch-fullfunction.py','read-fullfunction.py']})
put(P/'SOURCE-PINS.json',{**load(P0/'SOURCE-PINS.json'),'files':{n:role(P/n) for n in load(P0/'SOURCE-PINS.json')['files']},'sourceOnlyUnfilled':not filled});register(P0/'SOURCE-PINS.json',P/'SOURCE-PINS.json')
for n in ['run_observer_fullfunction_once.py','run_observer_reader_once.py']:
 t=hashes(text_rebase((W0/n).read_text()))
 t=t.replace("'nativeRefusalControlsObservedAdoption'):assert role","'nativeRefusalControlsObservedAdoption','recentProtectedPostflightReadback','recentProtectedPostflightSnapshot'):assert role")
 # Preserve prior root-owned records; this fresh attempt writes separate source/binding roles.
 t=t.replace('NATIVE-REFUSAL-FULLFUNCTION-SOURCE-ADOPTION.json','NATIVE-REFUSAL-FULLFUNCTION-R3-SOURCE-ADOPTION.json').replace('NATIVE-REFUSAL-FULLFUNCTION-ROOT-BINDING.json','NATIVE-REFUSAL-FULLFUNCTION-R3-ROOT-BINDING.json')
 (W/n).write_text(t)
rw=rebase(load(W0/'RECIPE.json'));rw['currentProtection']=c['currentProtection'];rw['sourceOnlyUnfilled']=not filled;put(W/'RECIPE.json',rw)
put(W/'WHOLE-FORWARD-INVERSE.json',{n:proof((W0/n).read_text(),(W/n).read_text(),W0/n) for n in ['run_observer_fullfunction_once.py','run_observer_reader_once.py']})
put(W/'SOURCE-PINS.json',{**load(W0/'SOURCE-PINS.json'),'files':{n:role(W/n) for n in load(W0/'SOURCE-PINS.json')['files']},'sourceOnlyUnfilled':not filled})
put(D/'GENERATED-AUTHORITY-AUDIT.json',{'schema':'1370-aq-generated-authority-static-audit/v1','executionAuthorization':False,'candidateExecuted':False,'failedSourceManifest':role(F0/'SOURCE-PINS.json'),'correctedSourceManifest':role(F/'SOURCE-PINS.json'),'coreTemplateSingleHeadLiteralCorrection':True,'operationalHead':head,'productionSourceTree':tree,'generatedSourceChecks':generatedAudit,'actualFailureBeforeGeneration':True,'lesson':'Whole generated runtime source must be checked against current authority. Hash and inverse consistency alone did not establish semantic binding correctness.'})
for package in [F,P,W]:
 for p in package.glob('*.py'):compile(p.read_text(),str(p),'exec')
print(json.dumps({'route':role(F/'SOURCE-PINS.json'),'parent':role(P/'SOURCE-PINS.json'),'wrappers':role(W/'SOURCE-PINS.json'),'pending':c['heldUnfilledActualRoles'],'audit':role(D/'GENERATED-AUTHORITY-AUDIT.json')}))
