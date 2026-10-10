"""Exact finite 1 RED+12 GREEN pre-reap producer gate; no source imports."""
import json
CAP=65536
SUMMARY_CAP=12289
REQUIRED={'baselineSha256': '73519d8146d44b7076dcd73188baaf57743e27076198f4d3cb6d31bcb04fae07', 'candidateSha256': '5d03807a6a61694c87ebaa6a13094246cba880392ee76a41f38582d62ed5b678', 'caseCount': 13, 'driverTopLevelImported': False, 'expectedGreen': 12, 'expectedRed': 1, 'failure': None, 'game': False, 'moduleSha256': '8117463b6ecd6aa57dd5b34a6ad1ee50f8d9a82197b13659bed0f489a6ad2a15', 'moduleUnchanged': True, 'observedGreen': 12, 'observedRed': 1, 'r2TailUnchanged': True, 'realSignals': False, 'schema': 'a208-independent-pre-reap-controls/v1', 'status': 'PRE_REAP_CONTROLS_PASS'}
CASES=[{'name': 'old-order-exited-unreaped-EPERM', 'status': 'EXPECTED_RED'}, {'name': 'pre-reap-completed-ESRCH-skip', 'status': 'GREEN_PASS'}, {'name': 'pre-reap-live-child-existing-kills', 'status': 'GREEN_PASS'}, {'name': 'pre-reap-leader-descendants-live', 'status': 'GREEN_PASS'}, {'name': 'pre-reap-already-reaped-no-wait', 'status': 'GREEN_PASS'}, {'name': 'pre-reap-wait-error-sticky-continue', 'status': 'GREEN_PASS'}, {'name': 'pre-reap-group-EPERM-sticky-continue', 'status': 'GREEN_PASS'}, {'name': 'pre-reap-mismatched-wait-refused', 'status': 'GREEN_PASS'}, {'name': 'pre-reap-malformed-wait-refused', 'status': 'GREEN_PASS'}, {'name': 'pre-reap-status-conversion-refused', 'status': 'GREEN_PASS'}, {'name': 'pre-reap-deadline-precedence', 'status': 'GREEN_PASS'}, {'name': 'pre-reap-owned-boundaries', 'status': 'GREEN_PASS'}, {'name': 'pre-reap-diagnostic-cap-sticky', 'status': 'GREEN_PASS'}]
class ReportStop(ValueError):pass
def need(ok,why):
 if not ok:raise ReportStop('STOP_PRE_REAP_REPORT_'+why)
def validate(mode,stdout,stderr,owned_pgid):
 need(mode=='pre-reap','MODE')
 need(len(stdout)<=CAP and len(stderr)<=CAP and not stderr,'STREAM_CAP_OR_STDERR')
 need(len(stdout)<=SUMMARY_CAP and stdout.startswith(b'{') and stdout.endswith(b'}\n') and len(stdout.splitlines())==1,'ONE_UTF8_JSON_SUMMARY_CAP')
 def unique(pairs):
  obj={}
  for key,value in pairs:need(key not in obj,'DUPLICATE_KEY');obj[key]=value
  return obj
 def nonfinite(value):raise ReportStop('STOP_PRE_REAP_REPORT_NONFINITE')
 obj=json.loads(stdout.decode('utf-8'),object_pairs_hook=unique,parse_constant=nonfinite)
 need(type(obj) is dict and set(obj)==set(REQUIRED)|{'cases'},'EXACT_FIELDS')
 for key,expected in REQUIRED.items():
  value=obj[key]
  if type(expected) is bool:need(value is expected,'BOOL_'+key)
  elif type(expected) is int:need(type(value) is int and value==expected,'COUNT_'+key)
  elif expected is None:need(value is None,'NULL_'+key)
  else:need(type(value) is str and value==expected,'EXACT_'+key)
 rows=obj['cases'];need(type(rows) is list and len(rows)==13,'EXACT13')
 for row,expected in zip(rows,CASES):
  need(type(row) is dict and set(row)=={'name','status'} and row==expected,'EXACT_ROSTER_STATUS')
 return {'protocol':REQUIRED['schema'],'expectedRed':1,'expectedGreen':12,'rows':13,'game':False,'realSignals':False,'driverTopLevelImported':False}
