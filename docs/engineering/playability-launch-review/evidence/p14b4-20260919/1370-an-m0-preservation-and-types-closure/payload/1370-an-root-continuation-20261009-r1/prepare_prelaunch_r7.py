import ast,difflib,hashlib,json,os
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');B=S/'1370-an-m0-fullfunction-current-prelaunch-preparation-source-20261010-r6';Q=S/'1370-an-m0-fullfunction-current-prelaunch-preparation-source-20261010-r7';A=Path(__file__).parent
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def write(n,b):
 if isinstance(b,dict):b=(json.dumps(b,sort_keys=True,indent=2)+'\n').encode()
 elif isinstance(b,str):b=b.encode()
 with (Q/n).open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 (Q/n).chmod(0o444);return role(Q/n)
assert role(B/'SOURCE-PINS.json')['sha256']=='b4a8f9eb919c35d805fd238be602cc7f05df84d9ce0cae2e19a544a2ed271a7b'
Q.mkdir(mode=0o700)
changes=[
 ('1370-an-m0-fullfunction-current-prelaunch-parent-recorded-20261010-r4','1370-an-m0-fullfunction-current-prelaunch-parent-recorded-20261010-r5'),
 ('1370-an-m0-fullfunction-current-prelaunch-output-20261010-r4','1370-an-m0-fullfunction-current-prelaunch-output-20261010-r5'),
 ('M0-FULLFUNCTION-R4-CURRENT-','M0-FULLFUNCTION-R5-CURRENT-'),
 ('ROOT_ADOPTED_FULLFUNCTION_BASELINE_TRACE_OVERFLOW_STOP_WITH_REAL_GENERATION_AND_FULL_SHARED_POSTFLIGHT','ROOT_ADOPTED_FULLFUNCTION_HELPER_PROBE_TOTAL_BYTE_CAP_STOP_WITH_REAL_GENERATION_AND_FULL_SHARED_POSTFLIGHT')]
files={};deltas={};helperCount=0
for kind,n in [('launcher','run_fullfunction_current_prelaunch_once.py'),('reader','read_fullfunction_current_prelaunch.py')]:
 before=(B/n).read_text();after=before;deltas[kind]=[]
 for old,new in changes:
  assert after.count(old)==1
  after=after.replace(old,new);deltas[kind].append({'before':old,'after':new,'occurrences':1})
 inverse=after
 for old,new in reversed(changes):assert inverse.count(new)==1;inverse=inverse.replace(new,old)
 assert inverse==before
 oldHelpers={x.name:ast.get_source_segment(before,x) for x in ast.parse(before).body if isinstance(x,ast.FunctionDef)}
 newHelpers={x.name:ast.get_source_segment(after,x) for x in ast.parse(after).body if isinstance(x,ast.FunctionDef)}
 assert oldHelpers==newHelpers;helperCount+=len(oldHelpers);compile(after,n,'exec')
 for fn,contents in [
  ('BASE-r6-'+kind+'.py.txt',before),(n,after),
  (kind+'.forward.diff',''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='BASE-r6-'+kind+'.py.txt',tofile=n))),
  (kind+'.inverse.diff',''.join(difflib.unified_diff(after.splitlines(True),before.splitlines(True),fromfile=n,tofile='BASE-r6-'+kind+'.py.txt')))]:
  files[fn]=write(fn,contents)
x=json.loads((B/'EXACT-ARGV.json').read_bytes())
x['schema']='1370-fullfunction-fifth-current-prelaunch-exact-argv/v1'
x['expectedPriorReadback']=role(S/'1370-an-m0-fullfunction-parent-recorded-20261010-r4/READBACK.json')
assert x['expectedPriorReadback']['sha256']=='568c92e332879885a53726cc359b296d4279c9f763236edeed019f7d92a06e28'
x['expectedPriorStopAdoptionPath']=str(A/'FULLFUNCTION-R4-STOP-OBSERVED-ADOPTION.json')
x['futureRootStopStatus']=changes[-1][1]
x['launcherArgv'][3]=str(Q/'run_fullfunction_current_prelaunch_once.py')
x['readerArgv'][3]=str(Q/'read_fullfunction_current_prelaunch.py')
x['originalExecutedArgv'][4]=str(A/'M0-FULLFUNCTION-R5-CURRENT-PRELAUNCH-CONFIG.json')
assert len(x['launcherArgv'])==12 and len(x['readerArgv'])==10 and len(x['originalExecutedArgv'])==6
assert x['launcherArgv'][4].endswith('/1370-an-m0-types-external-config-independent-observed-review-20261009-r3/RECEIPT.json')
assert x['launcherArgv'][-4:]==[None]*4 and x['readerArgv'][4:]==[None]*6
x['knownPriorSharedReadback']=role(S/'1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r4-disk-retry/READBACK.json')
x['knownPriorProtectedStopAdoption']=role(A/'FULLFUNCTION-R4-STOP-OBSERVED-ADOPTION.json')
x['scope']='Original source7015/review6f7e unchanged, original180s per command and continuous-freeze full-map reuse. Only protectedSnapshot/ownedPgids/outputPath null fills. Latest known R4 retry post and exact R4 protected STOP remain external authority; original7509 failure stays preserved. TYPES0700 separate. No new full inventory or game/control replay.'
files['EXACT-ARGV.json']=write('EXACT-ARGV.json',x)
proof={'baseManifest':role(B/'SOURCE-PINS.json'),'sourceChanges':deltas,'wholeInversesExact':True,'allHelpersUnchanged':True,'helperDefinitionsVerified':helperCount,'sourceOnly':True,'executionAuthorization':False,'scope':'Fresh R5 current prelaunch based on actualR4 total-byte-cap STOP and passing separate disk-recovery originalpost. Only four one-occurrence substitutions per adapter; original current scanner and three-null fills unchanged.'}
files['SOURCE-PROOF.json']=write('SOURCE-PROOF.json',proof)
pin=write('SOURCE-PINS.json',{'schema':'1370-fullfunction-current-prelaunch-preparation-source-pins/v1','executionAuthorization':False,'files':files})
print(json.dumps(pin))
