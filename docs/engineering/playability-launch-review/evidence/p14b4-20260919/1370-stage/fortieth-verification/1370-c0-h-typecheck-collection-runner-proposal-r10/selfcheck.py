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
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
def pinned(rel,expected):
 raw=(S/rel).read_bytes()
 assert __import__('hashlib').sha256(raw).hexdigest()==expected
 return json.loads(raw)
baseline=pinned('1370-c0-h-mirror-post-r9-baseline-recorded-r1/BASELINE.json','f132e25fabc3fa654e85c3dcbe3616d10337b66fd9307b2e34b131bf9615d605')
observed=pinned('1370-c0-h-mirror-post-r9-baseline-independent-observed-review-r1/RECEIPT.json','b0b58d06f21e81bfb6357e2295708e5fc11b5a2248f1c1cd5babf331689e8de3')
r9=pinned('1370-c0-h-typecheck-collection-independent-observed-stop-review-r9/RECEIPT.json','4cffcd747b9b538631314997134561de143f4a7f0d45aaf0c577a893b4558db4')
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
assert binding['productionHead']=='afea5fb6abba09bec6cada7e4c5a1ccfaf05caff' and binding['evidenceTip']=='6516532ac67ffcafc66fd424abb89bc1bc0acc2e'
assert binding['captureHead']=='9651546af98c44f04e8b6b2714d10d67dadb8f9c' and binding['captureEvidenceTip']=='fe9e8a7d84da164e9a413dc2c3efe49f529c2a78'
assert "baseline.get('productionHead')==CAPTURE_HEAD" in source and "binding.get('productionHead')==CURRENT_HEAD" in source
assert "source_before['mirrorRootIdentity']==tuple(baseline['mirrorRootIdentity'])" in source
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
