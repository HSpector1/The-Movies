"""Pure bounded producer-report validation; no child/process/source imports."""
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
 need([x for x in lines if re.fullmatch(r'1\.\.\d+',x)]==['1..13'],'PLAN13')
 ok=[int(m.group(1)) for x in lines if (m:=re.match(r'^ok (\d+) - ',x))]
 need(ok==list(range(1,14)),'OK13_ORDER')
 need(not any(re.match(r'^\s*not ok\b',x) for x in lines),'NOT_OK')
 need(not any(re.match(r'^\s*(?:ok|not ok)\b.*#\s*(?:SKIP|TODO)\b',x,re.I) for x in lines),'DIRECTIVE')
 for field,value in [('tests',13),('suites',0),('pass',13),('fail',0),('cancelled',0),('skipped',0),('todo',0)]:
  matches=[m.group(1) for x in lines if (m:=re.fullmatch(r'# '+field+r' (\d+)',x))]
  need(matches==[str(value)],'SUMMARY_'+field)
 need(not any(re.match(r'^\s*(?:Bail out!|Error:|TypeError:|ReferenceError:)',x) for x in lines),'UNEXPECTED_ERROR')
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
 need(len(re.findall(r'^Ran 14 tests in [0-9.]+s$',diagnostic,re.M))==1 and diagnostic.rstrip().endswith('\nOK'),'PYTHON_UNITTEST_SUMMARY')
 need(not re.search(r'^FAILED(?:\b| \()',diagnostic,re.M),'PYTHON_UNITTEST_FAILED')
 return {'protocol':'python-unittest-and-owned-driver','methods':14,'ownedGroups':7,'inheritedProbes':4}

def validate(mode,stdout,stderr,owned_pgid):
 need(mode in ('js','python'),'MODE')
 return validate_js(stdout,stderr) if mode=='js' else validate_python(stdout,stderr,owned_pgid)
