#!/usr/bin/env python3
"""Synthetic r13 REDs only: never enters historical H mirror or runs types."""
import ast,json,os,pathlib,signal,subprocess,sys,tempfile,time,types,unittest.mock
P=pathlib.Path(__file__).resolve().parent
source=(P/'runner.py').read_text();ast.parse(source)
ns={'__name__':'_synthetic_r13','_BOOTSTRAP_START':time.monotonic()}
exec(compile(source,str(P/'runner.py'),'exec'),ns)
def refuse(fn,label):
 try:fn()
 except (RuntimeError,OSError,ValueError):return
 raise AssertionError('accepted '+label)
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
def pinned(rel,expected):
 raw=(S/rel).read_bytes()
 assert __import__('hashlib').sha256(raw).hexdigest()==expected
 return json.loads(raw)
baseline=pinned('1370-c0-h-mirror-post-r9-baseline-recorded-r1/BASELINE.json','f132e25fabc3fa654e85c3dcbe3616d10337b66fd9307b2e34b131bf9615d605')
observed=pinned('1370-c0-h-mirror-post-r9-baseline-independent-observed-review-r1/RECEIPT.json','b0b58d06f21e81bfb6357e2295708e5fc11b5a2248f1c1cd5babf331689e8de3')
r9=pinned('1370-c0-h-typecheck-collection-independent-observed-stop-review-r9/RECEIPT.json','4cffcd747b9b538631314997134561de143f4a7f0d45aaf0c577a893b4558db4')
r11=pinned('1370-c0-h-typecheck-r11-independent-observed-stop-review-r1/RECEIPT.json','9b8e6587d415db0d0bbd12ecdff3d67eeb87b39928d70b84baed8ad61600cbb0')
r12=pinned('1370-c0-h-typecheck-r12-independent-static-review-r1/RECEIPT.json','271f7af9e0da7dcd57b5b77c43bc303600c302264f6960fbb0c7de67812b7eb0')
assert r11['decision']=='ACCEPT_OBSERVED_STOP_H_TYPECHECK_COLLECTION_R11' and r11['exactFailureLineProven'] is False
assert r12['decision']=='REFINE' and len(r12['findings'])==2
assert baseline['decision']=='H_MIRROR_CURRENT_BASELINE_BYTES_CHECKED_OBSERVED_REVIEW_PENDING'
assert observed['decision']=='ACCEPT_OBSERVED_H_CURRENT_MIRROR_BASELINE_BYTES_ONLY'
assert observed['baselineSha256']=='f132e25fabc3fa654e85c3dcbe3616d10337b66fd9307b2e34b131bf9615d605'
assert baseline['mirrorRootIdentity']==observed['mirrorRootIdentity']==r9['mirrorRootIdentityAfter']
assert observed['rootDriftCause']==baseline['rootDriftCause']=='UNATTRIBUTED_R9'
assert observed['regularFiles']==baseline['regularFiles']==1402 and observed['regularBytes']==baseline['regularBytes']==99516095
assert "CURRENT_HEAD='afea5fb6abba09bec6cada7e4c5a1ccfaf05caff'" in source and "CURRENT_EVIDENCE_TIP='6516532ac67ffcafc66fd424abb89bc1bc0acc2e'" in source
assert "CAPTURE_HEAD='9651546af98c44f04e8b6b2714d10d67dadb8f9c'" in source
assert "CAPTURE_EVIDENCE_TIP='fe9e8a7d84da164e9a413dc2c3efe49f529c2a78'" in source
binding=json.loads((P/'BINDING-SOURCE.json').read_text())
assert binding['status']=='FILLED_INDEPENDENT_REVIEW_REQUIRED'
assert binding['schema']=='1370-c0-h-typecheck-collection-source-binding-r13' and binding['runId']=='20261008-h-types-r11'
assert binding['r11ObservedStopReceiptSha256']=='9b8e6587d415db0d0bbd12ecdff3d67eeb87b39928d70b84baed8ad61600cbb0'
assert binding['r12StaticRefineReceiptSha256']=='271f7af9e0da7dcd57b5b77c43bc303600c302264f6960fbb0c7de67812b7eb0'
assert binding['productionHead']=='afea5fb6abba09bec6cada7e4c5a1ccfaf05caff' and binding['evidenceTip']=='6516532ac67ffcafc66fd424abb89bc1bc0acc2e'
assert binding['captureHead']=='9651546af98c44f04e8b6b2714d10d67dadb8f9c' and binding['captureEvidenceTip']=='fe9e8a7d84da164e9a413dc2c3efe49f529c2a78'
assert "baseline.get('productionHead')==CAPTURE_HEAD" in source and "binding.get('productionHead')==CURRENT_HEAD" in source
assert "source_before['mirrorRootIdentity']==tuple(baseline['mirrorRootIdentity'])" in source
assert 'PREIMAGE_OUTPUT' in source
assert "name=='diagnostic-collection' and set(extra_env)=={'PREIMAGE_OUTPUT'}" in source
assert "need(before_child==after_child,name+' mirror root entry/metadata drift')" in source
assert "record.setdefault('rootChildBoundaries',[])" in source
assert 'resource.setrlimit' not in source and 'RLIMIT_FSIZE' not in source
assert 'def guard_command_bytes(' in source and 'start_new_session=True' in source
assert "boundary['afterError']=repr(checkpoint_error)" in source
assert "boundary['childError']=repr(child_error)" in source
assert "boundary['childTraceback']=traceback.format_exc()[-6000:]" in source
fake_proc=types.SimpleNamespace(pid=123456,poll=lambda:0)
with unittest.mock.patch.object(ns['os'],'killpg',side_effect=PermissionError(1,'test')):
 with unittest.mock.patch.dict(ns,{'bounded_ps_snapshot':lambda:b'1 0 1 0\n2 1 2 501\n'}):
  assert ns['group_alive'](123456,fake_proc) is False
assert len(ns['GROUP_ALTERNATE_PROOFS'])==1 and len(ns['GROUP_ALTERNATE_PROOFS'][0]['samples'])==2
with unittest.mock.patch.object(ns['os'],'killpg',side_effect=PermissionError(1,'test')):
 with unittest.mock.patch.dict(ns,{'bounded_ps_snapshot':lambda:b'1 0 1 0\n9 1 123456 501\n'}):
  refuse(lambda:ns['group_alive'](123456,fake_proc),'EPERM with exact PGID member')
with unittest.mock.patch.object(ns['os'],'killpg',side_effect=PermissionError(1,'test')):
 with unittest.mock.patch.dict(ns,{'bounded_ps_snapshot':lambda:b'bad partial row\n'}):
  refuse(lambda:ns['group_alive'](123456,fake_proc),'EPERM malformed process inventory')
with unittest.mock.patch.object(ns['os'],'killpg',side_effect=PermissionError(1,'test')):
  refuse(lambda:ns['group_alive'](123456,types.SimpleNamespace(pid=123456,poll=lambda:None)),'EPERM unreaped child')
with unittest.mock.patch.dict(ns,{'group_alive':lambda *_:True}):
 with unittest.mock.patch.object(ns['os'],'killpg',side_effect=PermissionError(1,'denied')):
  refuse(lambda:ns['signal_group'](123456,signal.SIGTERM,fake_proc),'denied group signal despite later clearance')
no_group_proc=types.SimpleNamespace(pid=123456,wait=lambda timeout:(_ for _ in ()).throw(subprocess.TimeoutExpired('synthetic',timeout)),poll=lambda:None)
with unittest.mock.patch.dict(ns,{'group_alive':lambda *_:False}):
 refuse(lambda:ns['stop_group'](no_group_proc),'unreaped child with absent group')
with tempfile.TemporaryDirectory(prefix='h-type-r13-red-') as text:
 root=pathlib.Path(text).resolve();mirror=root/'mirror';mirror.mkdir();out=root/'out';out.mkdir()
 ns['S']=root;ns['MIRROR_ROOT']=mirror;ns['guard']=lambda _:None;ns['source_step']=lambda _:None;ns['remaining']=lambda:300
 assert ns['scratch_preimage_output'](out)==str(out/'preimage-output')
 (out/'preimage-output').symlink_to(root)
 refuse(lambda:ns['scratch_preimage_output'](out),'symlink PREIMAGE_OUTPUT')
 (out/'preimage-output').unlink()
 refuse(lambda:ns['scratch_preimage_output'](mirror),'output inside mirror')
 before=ns['root_checkpoint'](mirror,'synthetic')
 transient=mirror/'transient';transient.write_bytes(b'x');transient.unlink()
 after=ns['root_checkpoint'](mirror,'synthetic')
 assert before['entries']==after['entries'] and before['rosterSha256']==after['rosterSha256']
 assert before['identity']!=after['identity'],'transient root write not detected'
 child=ns['run_child']('diagnostic-collection',
   [sys.executable,'-c','import os,pathlib; p=os.environ.get("PREIMAGE_OUTPUT"); assert p and pathlib.Path(p).is_absolute(); pathlib.Path(p).mkdir(); print("ok")'],
   mirror,out,'synthetic',{'PREIMAGE_OUTPUT':str(out/'preimage-output')})
 assert child['exit']==0 and (out/'preimage-output').is_dir()
 big=out/'legitimate-large-file'
 child=ns['run_child']('large-scratch-write',
   [sys.executable,'-c',f'open({str(big)!r},"wb").write(b"x"*(9*1024*1024)); print("ok")'],
   mirror,out,'synthetic')
 assert child['exit']==0 and big.stat().st_size==9*1024*1024 and child['stdoutBytes']<1024
 refuse(lambda:ns['run_child']('noisy-child',
   [sys.executable,'-c','import os; [os.write(1,b"x"*65536) for _ in range(140)]'],
   mirror,out,'synthetic'),'noisy child stdout')
 marker=out/'guard-group.json'
 code=('import json,os,subprocess,time; '
       'child=subprocess.Popen(["sleep","30"]); '
       f'open({str(marker)!r},"w").write(json.dumps([os.getpgrp(),child.pid])); '
       'os.write(1,b"z"*(3*1024*1024)); time.sleep(30)')
 refuse(lambda:ns['guard_command_bytes']([sys.executable,'-c',code],cwd=root),
        'noisy guard with grandchild')
 group,grandchild=json.loads(marker.read_text())
 probe=subprocess.run(['/bin/ps','-axo','pid=,ppid=,pgid=,uid='],capture_output=True,text=True,check=True,timeout=5)
 assert not [line for line in probe.stdout.splitlines() if len(line.split())==4 and line.split()[2]==str(group)],'guard grandchild group survived'
 ps_marker=out/'ps-group.json'
 ps_code=('import json,os,subprocess,time; '
          'child=subprocess.Popen(["sleep","30"]); '
          f'open({str(ps_marker)!r},"w").write(json.dumps([os.getpgrp(),child.pid])); '
          'os.write(1,b"z"*(3*1024*1024)); time.sleep(30)')
 refuse(lambda:ns['bounded_ps_snapshot']([sys.executable,'-c',ps_code]),
        'noisy process inventory with grandchild')
 ps_group,_=json.loads(ps_marker.read_text())
 probe=subprocess.run(['/bin/ps','-axo','pid=,ppid=,pgid=,uid='],capture_output=True,text=True,check=True,timeout=5)
 assert not [line for line in probe.stdout.splitlines() if len(line.split())==4 and line.split()[2]==str(ps_group)],'process inventory grandchild survived'
 print(json.dumps({'status':'PASS_R13_SYNTHETIC_GROUP_PHASE_AND_ROOT_REDS','historicalMirrorOpened':False},sort_keys=True))
