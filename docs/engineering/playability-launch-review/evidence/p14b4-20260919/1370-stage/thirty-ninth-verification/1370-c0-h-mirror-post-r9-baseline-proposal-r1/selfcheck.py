#!/usr/bin/env python3
"""Scratch-only synthetic controls; never scans or modifies the H mirror."""
import ast, contextlib, hashlib, json, pathlib, tempfile, time, types
P=pathlib.Path(__file__).resolve().parent
source=(P/'baseline.py').read_text();spec=json.loads((P/'SPEC.json').read_text())
ns={'__name__':'_synthetic_baseline','_BOOTSTRAP_START':time.monotonic()}
exec(compile(source,str(P/'baseline.py'),'exec'),ns)
def refuse(fn,label):
 try:fn()
 except (RuntimeError,OSError,ValueError):return
 raise AssertionError('accepted '+label)
assert ns['SPEC_SHA']==hashlib.sha256((P/'SPEC.json').read_bytes()).hexdigest()
assert ns['OUT']==pathlib.Path(spec['output']['path'])
assert ns['BINDING']==P/'BINDING-UNFILLED.json'
assert ns['WALL']==600 and ns['FLOOR']==3*1024**3 and ns['PREFLIGHT']==int(3.5*1024**3)
assert spec['r9ObservedStop']['rootDriftCause']=='UNATTRIBUTED_R9'
assert spec['r9ObservedStop']['rootIdentityBefore']!=spec['r9ObservedStop']['rootIdentityAfter']
for key in ('path','rawResultPath'):
 path=pathlib.Path(spec['r9ObservedStop'][key]);pin=spec['r9ObservedStop']['sha256' if key=='path' else 'rawResultSha256']
 assert hashlib.sha256(path.read_bytes()).hexdigest()==pin
assert 'list(root_id) == r9[\'rootIdentityAfter\']' in source
assert "proof == r9['fileProofDigestSha256']" in source
assert "'rootDriftCause': 'UNATTRIBUTED_R9'" in source
assert 'r9_result[\'sourceAfter\'][\'dependencyLink\'] == r9_result[\'sourceBefore\'][\'dependencyLink\']' in source
assert "r9_result['nodeModulesAfter'] == r9_result['nodeModulesBefore']" in source
assert 'os.O_NOFOLLOW' in source and 'directory/global entry cap' in source
assert 'source_guard(spec)' in source and 'guard(force=True)' in source
for bad in (None,True,float('nan'),float('inf'),time.monotonic()+10):
 refuse(lambda bad=bad:exec(compile(source,str(P/'baseline.py'),'exec'),{'__name__':'_bad','_BOOTSTRAP_START':bad}),'bad bootstrap start')
with tempfile.TemporaryDirectory(prefix='h-post-r9-baseline-red-') as tmp:
 root=pathlib.Path(tmp).resolve();d=root/'dir';d.mkdir();(root/'link').symlink_to(d,target_is_directory=True)
 held=ns['open_chain'](d);ns['verify_chain'](held,d);ns['close_chain'](held)
 refuse(lambda:ns['open_chain'](root/'link'),'symlink parent')
 counter=[0];ns['guard']=lambda:counter.__setitem__(0,counter[0]+1)
 fake=lambda _:contextlib.nullcontext((types.SimpleNamespace(name=f'x{i:04d}') for i in range(1501)))
 refuse(lambda:ns['bounded_names'](0,{'totalEntries':0},fake),'over-cap streamed directory')
 assert counter[0]>=90
 f=d/'grow';f.write_bytes(b'x');held=ns['open_chain'](d)
 try:
  def mutate():
   with f.open('ab') as stream:stream.write(b'y')
  called=[False]
  def guard():
   if not called[0]:called[0]=True;mutate()
  ns['guard']=guard
  refuse(lambda:ns['check_regular'](held[-1],'grow','grow',('100644','x'*40,1)),'concurrent growth')
 finally:ns['close_chain'](held)
print(json.dumps({'status':'PASS_SYNTHETIC_BASELINE_ONLY','r9ObservedStopSha256':spec['r9ObservedStop']['sha256'],'mirrorOpened':False},sort_keys=True))
