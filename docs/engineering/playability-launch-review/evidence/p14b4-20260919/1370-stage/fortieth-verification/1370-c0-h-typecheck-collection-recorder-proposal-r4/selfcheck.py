#!/usr/bin/env python3
"""Scratch-only synthetic deadline/FD/collision REDs. Does not run H typecheck."""
import ast,hashlib,importlib.util,json,math,os,pathlib,signal,subprocess,sys,tempfile,time,types,unittest.mock
ROOT=pathlib.Path(__file__).resolve().parent
SOURCE=ROOT/'supervise.py';raw=SOURCE.read_bytes();ast.parse(raw)
assert b'STOP_H_TYPES_RECORDER_WHOLE_DEADLINE_330S_CHILD_GROUP_KILLED' in raw
assert b'210S' not in raw and b'addendum child' not in raw
for label,value in [('missing',None),('future',time.monotonic()+60),('nan',float('nan')),('inf',float('inf')),('bool',True)]:
 spec=importlib.util.spec_from_file_location('type_supervisor_bad_'+label,SOURCE);mod=importlib.util.module_from_spec(spec)
 if label!='missing':mod.LAUNCH_START=value
 try:spec.loader.exec_module(mod)
 except (KeyError,RuntimeError):pass
 else:raise AssertionError('invalid loader start accepted '+label)
spec=importlib.util.spec_from_file_location('type_supervisor_synthetic',SOURCE);mod=importlib.util.module_from_spec(spec);mod.LAUNCH_START=time.monotonic();mod.BINDING_SHA='0'*64;spec.loader.exec_module(mod)
assert mod.BOOTSTRAP_SHA=='7a63a2d8028ae5c2abb5b2b1b5bdf79a83887b8c809de7d7866f2a9a7dd5f223'
assert mod.STATIC_SHA=='17514022b90852f03fa215d6748875d45eef0ae17270517cc2f55e1c8ba1cf08'
assert mod.HEAD=='afea5fb6abba09bec6cada7e4c5a1ccfaf05caff' and mod.EVIDENCE=='6516532ac67ffcafc66fd424abb89bc1bc0acc2e'
assert hashlib.sha256(mod.BOOTSTRAP.read_bytes()).hexdigest()==mod.BOOTSTRAP_SHA
assert hashlib.sha256(mod.STATIC_REVIEW.read_bytes()).hexdigest()==mod.STATIC_SHA
with unittest.mock.patch.object(mod.os,'killpg',side_effect=[None,PermissionError(1,'gone'),ProcessLookupError()]):
 mod.signal_group(123456,signal.SIGKILL)
with unittest.mock.patch.object(mod.os,'killpg',side_effect=[None,PermissionError(1,'still alive'),None]):
 try:mod.signal_group(123456,signal.SIGKILL)
 except RuntimeError as error:assert 'clearance unproven' in str(error)
 else:raise AssertionError('ambiguous EPERM accepted')
try:mod.read_pin(mod.BOOTSTRAP,100000,'0'*64)
except RuntimeError as error:assert 'pin SHA' in str(error)
else:raise AssertionError('wrong bootstrap SHA accepted')
with tempfile.TemporaryDirectory(prefix='h-types-recorder-red-',dir=mod.S) as temp:
 t=pathlib.Path(temp);alias=mod.S/(t.name+'-alias');alias.symlink_to(t,target_is_directory=True)
 for attempt in range(5):
  marker=t/f'guard-group-{attempt}.json'
  code=('import json,os,subprocess,time; child=subprocess.Popen(["sleep","30"]); '
        f'open({str(marker)!r},"w").write(json.dumps([os.getpgrp(),child.pid])); '
        'os.write(1,b"x"*(3*1024*1024)); time.sleep(30)')
  try:mod.command(sys.executable,'-c',code)
  except RuntimeError:pass
  else:raise AssertionError('noisy guard accepted')
  group,_=json.loads(marker.read_text())
  inventory=subprocess.run(['/bin/ps','-axo','pid=,pgid=,stat='],capture_output=True,text=True,timeout=5,check=True).stdout
  members=[line for line in inventory.splitlines() if len(line.split())>=3 and line.split()[1]==str(group)]
  assert not members,('guard grandchild survived',members)
 try:mod.read_pin(alias/'fake',100000)
 except (OSError,RuntimeError):pass
 else:raise AssertionError('symlink parent accepted')
 alias.unlink()
 mod.RESULT=t/'collision.json';mod.safe_result({'schema':'synthetic'})
 try:mod.safe_result({'schema':'synthetic'})
 except FileExistsError:pass
 else:raise AssertionError('result collision accepted')
 mod.RESULT=t/'timeout.json';mod.START=time.monotonic();mod.ACTIVE=2;mod.LIMIT=5;mod.CHILD=None
 mod.preflight=lambda:None
 original_read=mod.read_pin
 def fake_read(path,cap,pin=None):
  if path==mod.PRIOR_RECORDER_REVIEW:return json.dumps({'decision':'ACCEPT_STATIC_RECORDER_ONLY','sourcePins':{'supervise.py':'6a138a6fd3b85f63da7618a589fa2e9f46b0dcd45bb5ba84346af0ce402b68d5'}}).encode()
  if path==mod.R11_STOP_REVIEW:return json.dumps({'decision':'ACCEPT_OBSERVED_STOP_H_TYPECHECK_COLLECTION_R11','exactFailureLineProven':False}).encode()
  if path==mod.STATIC_REVIEW:return json.dumps({'decision':'ACCEPT_STATIC_H_TYPECHECK_COLLECTION_SOURCE_ONLY','sourcePins':{'runner.py':{'sha256':'946b3c88208db5128e30e668d0e322f11224235a71ff6994362acb124e0831b7'}}}).encode()
  if path==mod.BINDING:return json.dumps({'runId':'20261008-h-types-r11','fullReadbackObservedReceiptSha256':'35ca2012f0a6122cd88f509cc6f484c1ec489a08d8752d500877095293ca328a','childWallSeconds':300,'recorderWallSeconds':330}).encode()
  if path==mod.BOOTSTRAP:return b'import time;time.sleep(30)'
  raise AssertionError('unexpected synthetic read')
 mod.read_pin=fake_read;mod.shutil=types.SimpleNamespace(disk_usage=lambda _:types.SimpleNamespace(free=4*1024**3))
 try:mod.main()
 except SystemExit as error:assert error.code==1
 else:raise AssertionError('long child unexpectedly passed')
 result=json.loads(mod.RESULT.read_text())
 assert result['status']=='STOP_RECORDER_TIMEOUT_OR_ERROR' and result['groupClear'] is True and result['childExit']!=0 and result['elapsedSeconds']<5
 assert result['sourceDeadlineSeconds']==300 and result['recorderActiveSeconds']==2 and result['recorderWholeSeconds']==5
print(json.dumps({'decision':'PASS_SYNTHETIC_RECORDER_ONLY','realTypesUnrun':True,'timeoutGroupClear':True},sort_keys=True))
