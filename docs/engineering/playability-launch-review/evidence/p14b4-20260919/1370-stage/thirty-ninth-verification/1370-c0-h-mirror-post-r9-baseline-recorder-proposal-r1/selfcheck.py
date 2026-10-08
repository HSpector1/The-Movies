#!/usr/bin/env python3
"""Scratch-only synthetic deadline/FD/collision REDs. Does not run H current baseline."""
import ast,hashlib,importlib.util,json,math,os,pathlib,tempfile,time,types
ROOT=pathlib.Path(__file__).resolve().parent
SOURCE=ROOT/'supervise.py';raw=SOURCE.read_bytes();ast.parse(raw)
assert b'STOP_H_BASELINE_RECORDER_WHOLE_DEADLINE_630S_CHILD_GROUP_KILLED' in raw
assert b'210S' not in raw and b'addendum child' not in raw
for label,value in [('missing',None),('future',time.monotonic()+60),('nan',float('nan')),('inf',float('inf')),('bool',True)]:
 spec=importlib.util.spec_from_file_location('baseline_supervisor_bad_'+label,SOURCE);mod=importlib.util.module_from_spec(spec)
 if label!='missing':mod.LAUNCH_START=value
 try:spec.loader.exec_module(mod)
 except (KeyError,RuntimeError):pass
 else:raise AssertionError('invalid loader start accepted '+label)
spec=importlib.util.spec_from_file_location('baseline_supervisor_synthetic',SOURCE);mod=importlib.util.module_from_spec(spec);mod.LAUNCH_START=time.monotonic();mod.BINDING_SHA='0'*64;spec.loader.exec_module(mod)
assert mod.BOOTSTRAP_SHA=='7e5403d0f489eb15b5e128e8745e85c04405cf57c497e2ceae393d60d2e425ef'
assert mod.STATIC_SHA=='7aae4ad9836dd1f98017a21eb9a3249ba16b71dbb043c0343255912a56002799'
assert mod.HEAD=='9651546af98c44f04e8b6b2714d10d67dadb8f9c' and mod.EVIDENCE=='fe9e8a7d84da164e9a413dc2c3efe49f529c2a78'
assert hashlib.sha256(mod.BOOTSTRAP.read_bytes()).hexdigest()==mod.BOOTSTRAP_SHA
assert hashlib.sha256(mod.STATIC_REVIEW.read_bytes()).hexdigest()==mod.STATIC_SHA
try:mod.read_pin(mod.BOOTSTRAP,100000,'0'*64)
except RuntimeError as error:assert 'pin SHA' in str(error)
else:raise AssertionError('wrong bootstrap SHA accepted')
with tempfile.TemporaryDirectory(prefix='h-baseline-recorder-red-',dir=mod.S) as temp:
 t=pathlib.Path(temp);alias=mod.S/(t.name+'-alias');alias.symlink_to(t,target_is_directory=True)
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
  if path==mod.STATIC_REVIEW:return json.dumps({'decision':'ACCEPT_STATIC_CURRENT_H_MIRROR_BASELINE_SOURCE_ONLY','sourceSha256':'7c65072c7a7f6b88eb668cc70efed3a7b7b1d28e6f60806d63b8e0543f0f8d36'}).encode()
  if path==mod.BINDING:return json.dumps({'specSha256':'5ddc71dcb0dadeba2cc2658f2b1f505df03d7bf305df3ddb3430953392ce88bf','r9ObservedStopSha256':'4cffcd747b9b538631314997134561de143f4a7f0d45aaf0c577a893b4558db4'}).encode()
  if path==mod.BOOTSTRAP:return b'import time;time.sleep(30)'
  raise AssertionError('unexpected synthetic read')
 mod.read_pin=fake_read;mod.shutil=types.SimpleNamespace(disk_usage=lambda _:types.SimpleNamespace(free=4*1024**3))
 try:mod.main()
 except SystemExit as error:assert error.code==1
 else:raise AssertionError('long child unexpectedly passed')
 result=json.loads(mod.RESULT.read_text())
 assert result['status']=='STOP_RECORDER_TIMEOUT_OR_ERROR' and result['groupClear'] is True and result['childExit']!=0 and result['elapsedSeconds']<5
 assert result['sourceDeadlineSeconds']==600 and result['recorderActiveSeconds']==2 and result['recorderWholeSeconds']==5
print(json.dumps({'decision':'PASS_SYNTHETIC_RECORDER_ONLY','realBaselineUnrun':True,'timeoutGroupClear':True},sort_keys=True))
