#!/usr/bin/env python3
"""Read-only source-manifest checks and in-memory REDs. Never builds a mirror."""
import copy,hashlib,importlib.util,json,pathlib,subprocess,sys
sys.dont_write_bytecode=True
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
HERE=S/'1370-c0-h-m0-corrected-overlay-source-manifest-r2'
R8=S/'1370-c0-m0-feasibility-hook-overlay-r8-partial'
R10=S/'1370-c0-m0-feasibility-hook-overlay-r10-schema-correction'
INPUTS=S/'1370-c0-h-m0-observer-verification-design-r2/MIRROR-INPUTS.json'
MATERIALIZER=S/'1370-c0-h-m0-mirror-materializer-proposal-r2/materialize.py'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(INPUTS)=='84d89b19ffc40f02c9a908bf8ae3cdbf34e4ff65ce2c1cf63687c140746e1154'
assert sha(MATERIALIZER)=='28e546e77e6dfd414427b5d645a65a3c549c1f1011be812d07ee13da9a5e26ed'
assert sha(R8/'INVENTORY.json')=='2e2914354c4a6a3d5b72fc6e71d95cf04dd93750bf640dcaa8a7748deb15cc30'
review=S/'1370-c0-m0-feasibility-hook-overlay-independent-static-review-r8-partial/RECEIPT.json'
assert sha(review)=='3394545d6e80af1aa8f7eef2de9a26c02958478f9f5016340c678c82a11bb6ef'
R1=S/'1370-c0-h-m0-corrected-overlay-source-manifest-r1'
R8STOP=S/'1370-c0-m0-feasibility-hook-overlay-independent-route-stop-r8-r1/RECEIPT.json'
R9REVIEW=S/'1370-c0-m0-feasibility-hook-overlay-independent-static-review-r9-propagation-r1/RECEIPT.json'
R10REVIEW=S/'1370-c0-m0-feasibility-hook-overlay-independent-static-review-r10-schema-r1/RECEIPT.json'
assert sha(R8STOP)=='e4896f6ec384e7a59e6f7b7dee68d68a1e5d3c03c1f8b8acc7f63ec83a7d8359'
assert sha(R9REVIEW)=='df51f0780f9f39e833f8fe6a09684b21cc508f63ebea0ca297fa9f3520bcc6d8'
assert sha(R10REVIEW)=='44d0463452737d4ba3fd38e7d415cd234065ca2bd53241e2c40c3902e1958bd7'
inputs=json.loads(INPUTS.read_text())
spec=importlib.util.spec_from_file_location('c0_materializer_static',MATERIALIZER)
mat=importlib.util.module_from_spec(spec);spec.loader.exec_module(mat)
def need(ok,msg):
 if not ok:raise AssertionError(msg)
def cmd(*args):
 return subprocess.run(args,cwd=REPO,capture_output=True,check=True).stdout
def check(m,arm,materializer=True):
 info=inputs['arms'][arm]
 need(m['arm']==arm and m['sourceCommit']==info['sourceCommit'] and m['sourceTree']==info['sourceTree'],'source role')
 need(m['testsTree']==info['testsTree'] and m['uiTree']==info['uiTree'],'test/UI tree')
 need(m['acceptedR8OverlayInventorySha256']==sha(R8/'INVENTORY.json') and
      m['acceptedR8PartialStaticReviewSha256']==sha(review),'r8 authority')
 need(m['fixtureSha256']==info['rootAndFixtureInputs']['src/harness/p13a/fixtures.ts']['sha256'],'fixture')
 for label,path in [('fixture','src/harness/p13a/fixtures.ts'),('tick','src/core/tick.ts')]:
  need(m[label]['destination']==path and m[label]['sha256']==info['rootAndFixtureInputs'][path]['sha256'] and
       m[label]['gitBlob']==info['rootAndFixtureInputs'][path]['gitBlob'] and
       m[label]['bytes']==info['rootAndFixtureInputs'][path]['bytes'],label+' input')
 need(m['contextContract']['seed']=='p13a-core-causal-01' and
      [m['contextContract'][k] for k in ('naturalTicks','weeklyBoundaries','terminalContexts','externalRows')]==[416,417,40,43],'route shape')
 need(m['contextContract']['observerCaps']=={'marketRows':512,'marketRowBytes':16384,'marketTotalBytes':2097152},'caps')
 need(m['contextContract']['marketRowSchema']=='c0-m0-market-decision/v2-step12' and
      m['contextContract']['externalTraceSchema']=='c0-external-observer/v1','row and trace schema')
 need(len(m['files'])==(4 if arm=='H' else 5),'file count')
 for row in m['files']:
  source=pathlib.Path(row['source'])
  need(source.is_absolute() and source.parent==R10 and source.is_file() and not source.is_symlink(),'overlay source')
  need(source.stat().st_size==row['bytes'] and sha(source)==row['sha256'],'overlay byte pin')
  raw=cmd('git','ls-tree',m['sourceCommit'],'--',row['destination']).decode().strip()
  baseline=row['baseline']
  if raw:
   header,path=raw.split('\t',1);mode,kind,oid=header.split()
   need(path==row['destination'] and mode=='100644' and kind=='blob','baseline mode/path')
   blob=cmd('git','cat-file','blob',oid)
   need(baseline=={'status':'PRESENT','gitMode':mode,'gitBlob':oid,
                  'bytes':len(blob),'sha256':hashlib.sha256(blob).hexdigest()},'baseline blob')
  else:
   need(baseline=={'status':'ABSENT_AT_SOURCE_COMMIT','gitMode':None,'gitBlob':None,
                  'bytes':None,'sha256':None},'baseline absence')
 need(m['entrypointBaseline']==next(r for r in m['files'] if r['destination']=='tests/diagnostic.test.ts')['baseline'],'test baseline')
 need(m['predecessorR1ManifestSha256']==sha(R1/(arm+'-SOURCE-MANIFEST.json')) and
      m['acceptedR10OverlayInventorySha256']==sha(R10/'INVENTORY.json') and
      m['acceptedR10SchemaOnlyReviewSha256']==sha(R10REVIEW) and
      m['acceptedR9PropagationOnlyReviewSha256']==sha(R9REVIEW) and
      m['r8RouteStopReceiptSha256']==sha(R8STOP) and
      m['classification']=='INDEPENDENT_SOURCE_REVIEW_REQUIRED' and len(m['unproven'])>=4,'claim limit')
 if materializer:mat.validate_manifest(m,arm,inputs)
 return True
for arm in ('H','M0'):
 m=json.loads((HERE/(arm+'-SOURCE-MANIFEST.json')).read_text())
 need(check(m,arm),'positive '+arm)
 for label,mutate in [
  ('wrong arm',lambda d:d.__setitem__('arm','M0' if arm=='H' else 'H')),
  ('wrong fixture',lambda d:d.__setitem__('fixtureSha256','0'*64)),
  ('wrong test entrypoint',lambda d:d.__setitem__('entrypoint',{'path':'tests/other.test.ts','sha256':'0'*64})),
  ('missing overlay',lambda d:d['files'].pop()),
  ('duplicate destination',lambda d:d['files'].__setitem__(1,{**d['files'][1],'destination':d['files'][0]['destination']})),
  ('false baseline',lambda d:d['files'][0]['baseline'].__setitem__('gitBlob','0'*40))]:
  bad=copy.deepcopy(m);mutate(bad)
  try:check(bad,arm)
  except (AssertionError,RuntimeError,KeyError):pass
  else:raise AssertionError(arm+' RED missed '+label)
 print(arm,'POSITIVE_AND_6_REDS_PASS',len(m['files']))
print('SOURCE_MANIFEST_STATIC_SELFCHECK_PASS_NO_MIRRORS')
