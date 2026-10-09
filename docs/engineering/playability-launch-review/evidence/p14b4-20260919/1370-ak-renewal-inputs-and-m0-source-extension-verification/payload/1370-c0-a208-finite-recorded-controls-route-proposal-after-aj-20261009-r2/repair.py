from pathlib import Path
import hashlib,json,difflib
S=Path('/Users/zacheryspector/studio-scratch');P=Path(__file__).parent;B=S/'1370-c0-a208-finite-recorded-controls-route-proposal-after-aj-20261009-r1'
def role(p):
 b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
def put(n,x):(P/n).write_text(x if isinstance(x,str) else json.dumps(x,indent=2,sort_keys=True)+'\n')
for n in ['drive.py','prepare.py']:put(n,(B/n).read_text())
guard='''"""Pure bounded producer-report validation; no child/process/source imports."""
import json,math,re
CAP=1024*1024
class ReportStop(ValueError):pass

def need(ok,why):
 if not ok:raise ReportStop('STOP_REPORT_'+why)
def integer(n):return type(n) is int

def validate_js(stdout,stderr):
 need(len(stdout)<=CAP and len(stderr)<=CAP,'STREAM_CAP')
 need(not stderr,'JS_STDERR')
 text=stdout.decode('utf8');lines=text.splitlines()
 need(lines and lines[0]=='TAP version 13','TAP_VERSION')
 need([x for x in lines if re.fullmatch(r'1\\.\\.\\d+',x)]==['1..13'],'PLAN13')
 ok=[int(m.group(1)) for x in lines if (m:=re.match(r'^ok (\\d+) - ',x))]
 need(ok==list(range(1,14)),'OK13_ORDER')
 need(not any(re.match(r'^\\s*not ok\\b',x) for x in lines),'NOT_OK')
 need(not any(re.match(r'^\\s*(?:ok|not ok)\\b.*#\\s*(?:SKIP|TODO)\\b',x,re.I) for x in lines),'DIRECTIVE')
 for field,value in [('tests',13),('suites',0),('pass',13),('fail',0),('cancelled',0),('skipped',0),('todo',0)]:
  matches=[m.group(1) for x in lines if (m:=re.fullmatch(r'# '+field+r' (\\d+)',x))]
  need(matches==[str(value)],'SUMMARY_'+field)
 need(not any(re.match(r'^\\s*(?:Bail out!|Error:|TypeError:|ReferenceError:)',x) for x in lines),'UNEXPECTED_ERROR')
 return {'protocol':'native-node20-tap','tests':13,'pass':13,'fail':0}

def validate_python(stdout,stderr,owned_pgid):
 need(len(stdout)<=CAP and len(stderr)<=CAP,'STREAM_CAP')
 lines=stdout.splitlines();need(bool(lines),'PYTHON_EMPTY');last=json.loads(lines[-1])
 need(last.get('status')=='A208_PYTHON_CONTROLS_PASS','PYTHON_STATUS')
 for key,value in [('methods',14),('failures',0),('errors',0)]:need(type(last.get(key)) is int and last[key]==value,'PYTHON_'+key)
 for key in ['reason','stickyStop']:need(key in last and last[key] is None,'PYTHON_'+key)
 need(last.get('cleanupErrors')==[] and last.get('game') is False,'PYTHON_CLEANUP')
 elapsed=last.get('elapsedSeconds');need(type(elapsed) in (int,float) and math.isfinite(elapsed) and 0<=elapsed<45,'PYTHON_CLOCK')
 groups=last.get('ownedGroups');probes=last.get('inheritedProbes');need(isinstance(groups,list) and len(groups)==7 and isinstance(probes,list) and len(probes)==4,'PYTHON_OWNED_COUNTS')
 pids=[]
 for x in groups:
  need(isinstance(x,dict) and integer(x.get('pid')) and x['pid']>1 and x.get('ready') is True and x.get('reaped') is True and x.get('groupClear') is True and integer(x.get('exit')),'PYTHON_OWNED_STATE');pids.append(x['pid'])
 for x in probes:
  need(isinstance(x,dict) and integer(x.get('pid')) and x['pid']>1 and integer(x.get('exit')) and x.get('ownedPgid')==owned_pgid,'PYTHON_INHERITED_STATE');pids.append(x['pid'])
 need(len(set(pids))==11,'PYTHON_DUPLICATE_PID')
 diagnostic=stderr.decode('utf8')
 need(len(re.findall(r'^Ran 14 tests in [0-9.]+s$',diagnostic,re.M))==1 and diagnostic.rstrip().endswith('\\nOK'),'PYTHON_UNITTEST_SUMMARY')
 need(not re.search(r'^FAILED(?:\\b| \\()',diagnostic,re.M),'PYTHON_UNITTEST_FAILED')
 return {'protocol':'python-unittest-and-owned-driver','methods':14,'ownedGroups':7,'inheritedProbes':4}

def validate(mode,stdout,stderr,owned_pgid):
 need(mode in ('js','python'),'MODE')
 return validate_js(stdout,stderr) if mode=='js' else validate_python(stdout,stderr,owned_pgid)
'''
put('report_guard.py',guard)
checks='''"""UNRUN no-child synthetic protocol checks; never import recorder/driver/tests/game."""
import importlib.util,json,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('pure_report_guard',Path(__file__).with_name('report_guard.py'));guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(guard)
class Reports(unittest.TestCase):
 def tap(self):return ('TAP version 13\\n'+''.join(f'ok {i} - synthetic-{i}\\n' for i in range(1,14))+'1..13\\n# tests 13\\n# suites 0\\n# pass 13\\n# fail 0\\n# cancelled 0\\n# skipped 0\\n# todo 0\\n').encode()
 def python(self):return {'status':'A208_PYTHON_CONTROLS_PASS','methods':14,'failures':0,'errors':0,'reason':None,'stickyStop':None,'cleanupErrors':[],'game':False,'elapsedSeconds':1,'ownedGroups':[{'pid':i,'ready':True,'reaped':True,'groupClear':True,'exit':-15} for i in range(100,107)],'inheritedProbes':[{'pid':i,'exit':0,'ownedPgid':999} for i in range(200,204)]}
 def encode(self,x):return (json.dumps(x)+'\\n').encode()
 def test_valid_producers_and_old_gate_red(self):
  t=self.tap();self.assertEqual(guard.validate('js',t,b'',999)['tests'],13)
  with self.assertRaises(json.JSONDecodeError):json.loads(t.splitlines()[-1])
  p=self.python();self.assertEqual(guard.validate('python',self.encode(p),b'Ran 14 tests in 1.000s\\n\\nOK\\n',999)['methods'],14)
  self.assertNotIn('selectedRows',p);self.assertNotEqual(p['status'],'PURE_A208_CONTROLS_PAIRS_AGREE')
 def test_tap_count_failure_skip_todo_cancel_and_stderr_refused(self):
  for a,b in [(b'# tests 13',b'# tests 12'),(b'# fail 0',b'# fail 1'),(b'ok 1 -',b'not ok 1 -'),(b'# skipped 0',b'# skipped 1'),(b'# todo 0',b'# todo 1'),(b'# cancelled 0',b'# cancelled 1'),(b'ok 1 - synthetic-1',b'ok 1 - synthetic-1 # SKIP')]:
   with self.assertRaises(guard.ReportStop):guard.validate('js',self.tap().replace(a,b),b'',999)
  with self.assertRaises(guard.ReportStop):guard.validate('js',self.tap(),b'error',999)
 def test_python_status_counts_failure_and_cleanup_refused(self):
  for key,value in [('status','STOP'),('methods',13),('failures',1),('errors',1),('reason','failure'),('stickyStop','deadline'),('cleanupErrors',['unknown']),('elapsedSeconds',45),('game',True)]:
   p=self.python();p[key]=value
   with self.assertRaises(guard.ReportStop):guard.validate('python',self.encode(p),b'Ran 14 tests in 1.000s\\n\\nOK\\n',999)
  for field in ['ready','reaped','groupClear']:
   p=self.python();p['ownedGroups'][0][field]=False
   with self.assertRaises(guard.ReportStop):guard.validate('python',self.encode(p),b'Ran 14 tests in 1.000s\\n\\nOK\\n',999)
  p=self.python();p['inheritedProbes'][0]['ownedPgid']=998
  with self.assertRaises(guard.ReportStop):guard.validate('python',self.encode(p),b'Ran 14 tests in 1.000s\\n\\nOK\\n',999)
  with self.assertRaises(guard.ReportStop):guard.validate('python',self.encode(self.python()),b'Ran 13 tests in 1.000s\\n\\nOK\\n',999)
if __name__=='__main__':unittest.main()
'''
put('test_reports.py',checks)
c=json.loads((B/'CONFIG.json').read_text());c['pythonFixture']=c['pythonFixture'].replace('20261009-r1','20261009-r2');c['roles']['driver']=role(P/'drive.py');c['roles']['reportGuard']=role(P/'report_guard.py');c['roles']['reportControls']=role(P/'test_reports.py');put('CONFIG.json',c);csha=role(P/'CONFIG.json')['sha256'];old=(B/'record.py').read_text();rec=old.replace(role(B/'CONFIG.json')['sha256'],csha).replace('20261009-r1','20261009-r2').replace('import datetime,hashlib,json,os,pathlib,selectors,select,signal,stat,sys,time','import datetime,hashlib,importlib.util,json,os,pathlib,selectors,select,signal,stat,sys,time')
needle="  authenticate(config['nodePath'],config['nodeSha256']);"
assert needle in rec
rec=rec.replace(needle,"  spec=importlib.util.spec_from_file_location('exact_a208_reports',config['roles']['reportGuard']['path']);report_guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(report_guard);whole_guard(end)\n"+needle)
a="     last=json.loads(bytes(buffers['stdout']).splitlines()[-1]);expected='PURE_A208_CONTROLS_PAIRS_AGREE'\n     require(last.get('status')==expected and not buffers['stderr'] and (last.get('selectedRows')==23 and last.get('immutablePairs')==44 and last.get('mismatches')==0 and last.get('originalOfferLocalCapture') is False and last.get('renewalAttribution') is False),'REPORT_ROLE');active_guard(started)"
assert a in rec;rec=rec.replace(a,"     report_guard.validate(mode,bytes(buffers['stdout']),bytes(buffers['stderr']),child.pid);active_guard(started)")
rec=rec.replace("[config['nodePath'],'--test',","[config['nodePath'],'--test','--test-reporter=tap',")
# Exact no-child report checks are added only to the Python driver's suite; total17, original14 untouched.
drive=(P/'drive.py').read_text();drive=drive.replace("outcome=unittest.TextTestRunner(verbosity=2).run(suite);need(outcome.testsRun==14,'exact14 methods')","report_spec=importlib.util.spec_from_file_location('a208_report_checks',HERE/'test_reports.py');report_module=importlib.util.module_from_spec(report_spec);report_spec.loader.exec_module(report_module)\n  report_outcome=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromModule(report_module));need(report_outcome.testsRun==3 and report_outcome.wasSuccessful(),'report validator controls')\n  outcome=unittest.TextTestRunner(verbosity=2).run(suite);need(outcome.testsRun==14,'exact14 methods')")
# Python stdout remains14 genuine observer tests; three no-child report checks are independently required first and retained on stderr.
put('drive.py',drive);c['roles']['driver']=role(P/'drive.py');put('CONFIG.json',c);rec=rec.replace(csha,role(P/'CONFIG.json')['sha256']);put('record.py',rec)
put('R1-R2.diff',''.join(difflib.unified_diff(old.splitlines(True),rec.splitlines(True),fromfile=str(B/'record.py'),tofile=str(P/'record.py'))))
route=json.loads((B/'ROUTE.json').read_text());route['commands']={k:[x.replace(str(B),str(P)).replace('20261009-r1','20261009-r2') for x in v] for k,v in route['commands'].items()};route['cwd']=str(P);route['expected']['noChildReportValidationMethods']=3;put('ROUTE.json',route)
put('REPORT.md','''SOURCE ONLY fresh r2 preserves r1. Addresses soleF1 from independentb7e868ad; original13 JS and14 Python suites remain untouched. No source imports/tests/runtime executed.

Recorder success gate now delegates to authenticated pure report_guard: explicit Node20 --test-reporter=tap requires native TAP version13/plan1..13/exact ordered13 ok lines and tests13/pass13/fail0/cancelled0/skipped0/todo0/suites0, no not-ok/skip/todo directive/errors, empty JS stderr. Python requires genuine A208_PYTHON_CONTROLS_PASS14, failures/errors0, null reason/stickyStop, empty cleanupErrors, seven unique ready/reaped/clear owned groups, four unique completed probes inheriting the exact recorded driver PGID, elapsed<45/gamefalse and genuine unittest Ran14/OK summary. Python stderr is retained normally; no pricing fields fabricated.

Three no-child synthetic report-validation controls run first inside the Python driver (separate Ran3 summary), followed by unchanged14 observer methods. They cover prior gate RED/new valid producer GREEN, TAP count/failure/cancellation/skip/todo/stderr refusals, Python status/count/failure/cleanup/ownership/clock/summary refusals. Authenticated modules only; no engine/game or additional child launches. These are authored UNRUN; successful runtime remains unproven.

Exact r1 parent ownership/60/75/90 clocks/capture/cleanup/failure finalization are unchanged apart from config pin/output identities/authenticated report-module import and producer gate. Driver retains45/55, seven tracked groups/four inherited probes, original18 exact fixtures,8MiB cap, preserved probe/outer failure evidence. Runtime grant and sourceReview remain null. Future exact filled config/recorder/current operational authority require independent review and root grant. Any actual report/count/cleanup discrepancy STOPs without retries.
''')
review=S/'1370-c0-a208-finite-recorded-controls-route-independent-source-review-after-aj-20261009-r1/RECEIPT.json';put('REPAIR-PROOF.json',{'priorPins':role(B/'SOURCE-PINS.json'),'independentRefine':role(review),'failure':'F1 producer gate mismatched pricing protocol','driverOriginalObserverSuitesUnchanged':True,'originalOwnershipBoundsReused':role(B/'REUSE.json'),'threeNoChildControlsAuthoredUnrun':True,'newRecorderDiff':role(P/'R1-R2.diff')})
files={x.name:role(x) for x in P.iterdir() if x.is_file() and x.name not in ['SOURCE-PINS.json','RECEIPT.json']};put('SOURCE-PINS.json',{'schema':'1370-a208-finite-recorded-controls-pins-r2','files':files,'observerPins':json.loads((B/'SOURCE-PINS.json').read_text())['observerPins'],'executionAuthorization':False,'runtimeGrant':None});put('RECEIPT.json',{'decision':'READY_SOURCE_ONLY_HELD_A208_FINITE_CONTROLS_ROUTE_R2_PENDING_INDEPENDENT_REVIEW','sourcePins':role(P/'SOURCE-PINS.json'),'config':role(P/'CONFIG.json'),'recorder':role(P/'record.py'),'driver':role(P/'drive.py'),'validator':role(P/'report_guard.py'),'executed':False,'executionAuthorization':False});print(json.dumps({'pins':role(P/'SOURCE-PINS.json'),'receipt':role(P/'RECEIPT.json')}))
