#!/usr/bin/env python3
"""Synthetic r10 REDs only: never enters historical H mirror or runs types."""
import ast,json,os,pathlib,sys,tempfile,time
P=pathlib.Path(__file__).resolve().parent
source=(P/'runner.py').read_text();ast.parse(source)
ns={'__name__':'_synthetic_r10','_BOOTSTRAP_START':time.monotonic()}
exec(compile(source,str(P/'runner.py'),'exec'),ns)
def refuse(fn,label):
 try:fn()
 except (RuntimeError,OSError,ValueError):return
 raise AssertionError('accepted '+label)
assert 'PREIMAGE_OUTPUT' in source
assert "name=='diagnostic-collection' and set(extra_env)=={'PREIMAGE_OUTPUT'}" in source
assert "need(before_child==after_child,name+' mirror root entry/metadata drift')" in source
assert "record.setdefault('rootChildBoundaries',[])" in source
with tempfile.TemporaryDirectory(prefix='h-type-r10-red-') as text:
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
 print(json.dumps({'status':'PASS_R10_DRAFT_SYNTHETIC_ENV_AND_TRANSIENT_ROOT_REDS','historicalMirrorOpened':False},sort_keys=True))
