#!/usr/bin/env python3
"""Synthetic timeout cleanup; never executes the real bridge bootstrap."""
import ast,importlib.util,json,pathlib,tempfile,time
ROOT=pathlib.Path(__file__).resolve().parent
source=ROOT/'supervise.py';ast.parse(source.read_text())
spec=importlib.util.spec_from_file_location('bridge_recorder_synthetic',source);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
assert '72a9bf9f6567afac320373532486c6bfd40663cf019eadb93d32db73a651678d' in module.BOOTSTRAP_SOURCE
assert '2d68b3686fea754398a76265b632a1c37bf58444169b9201f56982cfdc187eb6' in module.BOOTSTRAP_SOURCE
ast.parse(module.BOOTSTRAP_SOURCE)
with tempfile.TemporaryDirectory(prefix='bridge-recorder-red-',dir=module.S) as temp:
 module.BOOTSTRAP_SOURCE='import time;time.sleep(30)'
 module.RESULT=pathlib.Path(temp)/'synthetic.RECORDER-RESULT.json'
 module.LIMIT=2;module.START=time.monotonic();module.CHILD=None
 try:module.main()
 except SystemExit as error:assert error.code==1
 else:raise AssertionError('synthetic long child unexpectedly passed')
 result=json.loads(module.RESULT.read_text())
 assert result['status']=='STOP_RECORDER_TIMEOUT_OR_ERROR' and result['groupClear'] is True and result['elapsedSeconds']<10
 assert result['childExit'] != 0
print(json.dumps({'decision':'PASS_SYNTHETIC_TIMEOUT_GROUP_CLEANUP_ONLY','realBootstrapUnrun':True},sort_keys=True))
