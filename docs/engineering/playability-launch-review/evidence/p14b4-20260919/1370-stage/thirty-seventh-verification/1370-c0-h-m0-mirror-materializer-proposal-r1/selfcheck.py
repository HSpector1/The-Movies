#!/usr/bin/env python3
"""Synthetic refusals only; never calls materialize.main or builds a mirror."""
import copy,hashlib,pathlib,os,tempfile
import materialize as m

def fail(fn):
 try:fn()
 except (RuntimeError,ValueError,TypeError,KeyError):return
 raise AssertionError('expected refusal')

inputs=__import__('json').loads(m.INPUTS.read_text())
def manifest(arm):
 src=inputs['arms'][arm]
 rows=[{'destination':dest,'source':str(m.S/'synthetic-accepted-overlay'/dest.replace('/','-')),
        'bytes':1,'sha256':'1'*64} for dest in sorted(m.expected_overlays(arm))]
 return {'schema':'1370-c0-h-m0-corrected-overlay-source-manifest-r1',
         'classification':'INDEPENDENT_SOURCE_REVIEW_REQUIRED','arm':arm,
         'sourceCommit':src['sourceCommit'],'sourceTree':src['sourceTree'],
         'fixtureSha256':src['rootAndFixtureInputs']['src/harness/p13a/fixtures.ts']['sha256'],
         'files':rows,'entrypoint':{'path':'tests/diagnostic.test.ts','sha256':'1'*64}}

for arm in ('H','M0'):
 good=manifest(arm);assert len(m.validate_manifest(good,arm,inputs))==len(m.expected_overlays(arm))
 wrong=copy.deepcopy(good);wrong['sourceCommit']='0'*40;fail(lambda:m.validate_manifest(wrong,arm,inputs))
 wrong=copy.deepcopy(good);wrong['files'][1]['destination']=wrong['files'][0]['destination'];fail(lambda:m.validate_manifest(wrong,arm,inputs))
 wrong=copy.deepcopy(good);wrong['files'][0]['bytes']=0;fail(lambda:m.validate_manifest(wrong,arm,inputs))
 wrong=copy.deepcopy(good);wrong['files'][0]['sha256']='__PENDING__';fail(lambda:m.validate_manifest(wrong,arm,inputs))
 wrong=copy.deepcopy(good);wrong['entrypoint']['sha256']='0'*64;fail(lambda:m.validate_manifest(wrong,arm,inputs))
fail(lambda:m.safe_rel('../outside'))
fail(lambda:m.safe_rel('src//core'))
with tempfile.TemporaryDirectory(dir=m.S) as d:
 root=pathlib.Path(d);target=root/'target';target.write_bytes(b'fixture')
 link=root/'symlink';os.symlink(target,link)
 fail(lambda:m.pinned(link,hashlib.sha256(b'fixture').hexdigest(),100))
 fail(lambda:m.pinned(target,'0'*64,100))
 fail(lambda:m.pinned(target,hashlib.sha256(b'fixture').hexdigest(),6))
 assert m.pinned(target,hashlib.sha256(b'fixture').hexdigest(),7)==b'fixture'
print('SYNTHETIC_PASS: wrong source, collision, traversal, missing hash, entrypoint, symlink, size')
