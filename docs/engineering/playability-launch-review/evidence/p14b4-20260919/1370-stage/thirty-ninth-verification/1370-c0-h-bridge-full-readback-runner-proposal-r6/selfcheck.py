#!/usr/bin/env python3
"""Synthetic-only RED checks; never opens or mutates the H mirror."""
import json
import hashlib
import ast
import contextlib
import math
import pathlib
import tempfile
import time
import types

HERE = pathlib.Path('/Users/zacheryspector/studio-scratch/1370-c0-h-bridge-full-readback-runner-proposal-r6')
ns = {'__name__': '_synthetic_readback', '_BOOTSTRAP_START': time.monotonic()}
exec(compile((HERE/'readback.py').read_bytes(), str(HERE/'readback.py'), 'exec'), ns)


def refused(fn, why):
    try:
        fn()
    except (RuntimeError, OSError, ValueError):
        return
    raise AssertionError('accepted ' + why)


def main():
    spec = json.loads((HERE/'SPEC.json').read_bytes())
    binding = json.loads((HERE/'BINDING-SOURCE.json').read_bytes())
    assert binding['specSha256'] == hashlib.sha256((HERE/'SPEC.json').read_bytes()).hexdigest()
    bootstrap_tree = ast.parse((HERE/'BOOTSTRAP.py').read_text())
    fn = next(n for n in bootstrap_tree.body if isinstance(n, ast.FunctionDef) and n.name=='remaining_from')
    timing = {'math':math}
    exec(compile(ast.Module(body=[fn],type_ignores=[]),str(HERE/'BOOTSTRAP.py'),'exec'),timing)
    assert timing['remaining_from'](10,10)==600 and timing['remaining_from'](10,11)==599
    for start,now in ((10,9),(10,610),(float('nan'),11),(float('inf'),11),(True,11)):
        try:timing['remaining_from'](start,now)
        except AssertionError:pass
        else:raise AssertionError('bootstrap timer accepted invalid start')
    source_bytes = (HERE/'readback.py').read_bytes()
    for bad in (None, True, float('nan'), float('inf'), time.monotonic()+60):
        refused(lambda bad=bad: exec(compile(source_bytes, str(HERE/'readback.py'), 'exec'),
                                    {'__name__':'_synthetic_bad_start','_BOOTSTRAP_START':bad}),
                'invalid/future bootstrap start')
    refused(lambda: exec(compile(source_bytes, str(HERE/'readback.py'), 'exec'),
                         {'__name__':'_synthetic_missing_start'}), 'missing bootstrap start')
    identity = (1,2,3,1,62,4,5)
    assert ns['matches_original_link'](identity, '/target', [1,2,3,1,62,4,5,'/target'])
    assert not ns['matches_original_link'](identity, '/target', [1,99,3,1,62,4,5,'/target'])
    source_pins = {
        binding['bridgeAddendumResultPath']: binding['bridgeAddendumResultSha256'],
        binding['bridgeRecorderResultPath']: binding['bridgeRecorderResultSha256'],
        binding['bridgeObservedReviewPath']: binding['bridgeObservedReviewSha256'],
        binding['independentBridgeExactLaunchReviewPath']: binding['independentBridgeExactLaunchReviewSha256'],
    }
    for path, sha in source_pins.items():
        assert hashlib.sha256(pathlib.Path(path).read_bytes()).hexdigest() == sha
    # Actual accepted static and exact review paths must both pass, with no generic substring route.
    actual_r4 = json.loads(pathlib.Path('/Users/zacheryspector/studio-scratch/1370-c0-h-bridge-full-readback-filled-exact-r4/BINDING.json').read_bytes())
    assert 'recorder' not in actual_r4['recorderExactReviewPath']
    ns['check_recorder_review_routes'](actual_r4)
    ns['check_recorder_review_routes'](binding)
    wrong = dict(binding)
    wrong['recorderExactReviewPath'] = binding['recorderStaticReviewPath']
    refused(lambda:ns['check_recorder_review_routes'](wrong), 'exact review replaced by static path')
    wrong = dict(binding)
    wrong['recorderStaticReviewPath'] = binding['recorderExactReviewPath']
    refused(lambda:ns['check_recorder_review_routes'](wrong), 'static review replaced by exact path')
    wrong = dict(binding)
    wrong['recorderExactReviewSha256'] = '0'*64
    refused(lambda:ns['check_recorder_review_routes'](wrong), 'wrong exact review SHA')
    assert ns['BINDING'] == HERE/'BINDING-UNFILLED.json'
    filled_path = pathlib.Path('/Users/zacheryspector/studio-scratch/1370-c0-h-bridge-full-readback-filled-exact-r5/BINDING.json')
    filled_ns = {'__name__':'_synthetic_binding','_BINDING_PATH':str(filled_path),
                 '_BOOTSTRAP_START':time.monotonic()}
    exec(compile((HERE/'readback.py').read_bytes(), str(HERE/'readback.py'), 'exec'), filled_ns)
    assert filled_ns['BINDING'] == filled_path
    rows = spec['baseRoster']['bridge']['rows']
    assert len(rows) == 58 and sum(x['bytes'] for x in rows) == 1357248
    assert [x['path'] for x in rows] == sorted((x['path'] for x in rows), key=lambda x:x.encode('utf-8'))
    assert len(set(x['path'] for x in rows)) == 58
    assert spec['expected']['regularFiles'] == 1402 and spec['expected']['regularBytes'] == 99516095
    fake_recorder = {'status':'CHILD_EXIT_ZERO_PENDING_OBSERVED_REVIEW'}
    meta = b'start; t\nend, exit 0; t\n'
    lane = b'{\"status\":\"BRIDGE_ADDED_SOURCE_ONLY_PENDING_INDEPENDENT_FULL_READBACK\",\"resultSha256\":\"abc\"}\n{\"recorderStatus\":\"CHILD_EXIT_ZERO_PENDING_OBSERVED_REVIEW\",\"childExit\":0,\"groupClear\":true}\n'
    ns['verify_lane_lines'](meta,lane,'abc','BRIDGE_ADDED_SOURCE_ONLY_PENDING_INDEPENDENT_FULL_READBACK',fake_recorder)
    refused(lambda:ns['verify_lane_lines'](meta+b'junk\n',lane,'abc','BRIDGE_ADDED_SOURCE_ONLY_PENDING_INDEPENDENT_FULL_READBACK',fake_recorder),'trailing lane meta')
    refused(lambda:ns['verify_lane_lines'](meta+b'end, exit 1; t\n',lane,'abc','BRIDGE_ADDED_SOURCE_ONLY_PENDING_INDEPENDENT_FULL_READBACK',fake_recorder),'contradictory terminal meta')
    refused(lambda:ns['verify_lane_lines'](meta,lane,'wrong','BRIDGE_ADDED_SOURCE_ONLY_PENDING_INDEPENDENT_FULL_READBACK',fake_recorder),'source result mismatch')
    with tempfile.TemporaryDirectory(prefix='h-bridge-full-readback-red-') as tmp:
        root = pathlib.Path(tmp).resolve()
        good = root/'good'
        good.mkdir()
        held = ns['open_chain'](good)
        ns['verify_chain'](held, good)
        ns['close_chain'](held)
        (root/'link').symlink_to(good, target_is_directory=True)
        refused(lambda: ns['open_chain'](root/'link'), 'symlink parent')
        f = good/'grow'
        f.write_bytes(b'x')
        parent = ns['open_chain'](good)
        try:
            count = [0]
            def grow_guard():
                count[0] += 1
                if count[0] == 1:
                    with f.open('ab') as stream:
                        stream.write(b'y')
            ns['guard'] = grow_guard
            refused(lambda: ns['check_regular'](parent[-1], 'grow', 'grow', ('100644', 'x'*40, 1)), 'concurrent growth')
        finally:
            ns['close_chain'](parent)
        lock = root/'lock'
        lock.write_text('c0-h-bridge-full-readback-20261008-r6.lane.log')
        stream_calls = [0]
        ns['guard'] = lambda: stream_calls.__setitem__(0, stream_calls[0]+1)
        fake_scan = lambda _:contextlib.nullcontext((types.SimpleNamespace(name=f'x{i:04d}') for i in range(1501)))
        refused(lambda:ns['bounded_names'](0, {'totalEntries':0}, fake_scan), 'over-cap streamed directory')
        assert stream_calls[0] >= 90, 'missing periodic scan guard'
        assert ns['bounded_names'](0, {'totalEntries':0},
            lambda _:contextlib.nullcontext(iter([types.SimpleNamespace(name='b'),types.SimpleNamespace(name='a')]))) == ['a','b']
        ns['LOCK'] = lock
        ns['START'] = 0
        ticks = [1.0]
        calls = [0]
        ns['time'] = types.SimpleNamespace(monotonic=lambda:ticks[0])
        ns['shutil'] = types.SimpleNamespace(disk_usage=lambda _:types.SimpleNamespace(free=4*1024**3))
        ns['ac'] = lambda: calls.__setitem__(0, calls[0]+1)
        ns['LAST_ENV_CHECK'] = float('-inf')
        # Restore the original guard function from source in a second isolated namespace.
        clean = {'__name__':'_synthetic_timer','_BOOTSTRAP_START':time.monotonic()}
        exec(compile((HERE/'readback.py').read_bytes(), str(HERE/'readback.py'), 'exec'), clean)
        clean.update({k:ns[k] for k in ('LOCK','START','time','shutil','ac')})
        clean['guard']()
        ticks[0] = 4.9
        clean['guard']()
        assert calls[0] == 1, 'AC checked too often'
        ticks[0] = 6.0
        clean['guard']()
        assert calls[0] == 2, 'AC cadence exceeded 5 seconds'
        ticks[0] = 7.0
        clean['guard'](force=True)
        assert calls[0] == 3, 'forced postflight missing'
        ticks[0] = 601.0
        refused(lambda:clean['guard'](), 'expired whole-child timer')
    # The r5 failed binding and the r5 observed STOP are read-only source controls.
    # The real r6 filled binding is intentionally absent at static source review.
    r5_filled=json.loads(filled_path.read_bytes())
    r5_observed_path=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-c0-h-bridge-full-readback-independent-observed-stop-review-r5/RECEIPT.json')
    r5_raw_path=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-c0-h-bridge-full-readback-recorded-r5/READBACK.json')
    r5_observed=r5_observed_path.read_bytes();r5_raw=r5_raw_path.read_bytes()
    assert hashlib.sha256(r5_observed).hexdigest()==spec['predecessorR5ObservedStopSha256']
    assert hashlib.sha256(r5_raw).hexdigest()==spec['predecessorR5ReadbackStopSha256']
    observed=json.loads(r5_observed)
    assert observed['decision']=='ACCEPT_OBSERVED_STOP_H_BRIDGE_FULL_READBACK_R5'
    assert observed['error']=="RuntimeError('H tree')" and observed['readbackStopSha256']==spec['predecessorR5ReadbackStopSha256']
    assert observed['exactLaunchReviewSha256']==spec['predecessorR5ExactReviewSha256']
    assert r5_filled['specSha256']==observed['specSha256']
    assert r5_filled['readbackSourceSha256']==observed['readbackSourceSha256']
    assert json.loads(r5_raw)['decision']=='STOP_H_BRIDGE_FULL_READBACK'
    # Preflight every tree/ref role using Git object identities, without entering H mirror.
    import subprocess
    repo=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
    def git(*args):
        return subprocess.check_output(['git',*args],cwd=repo,text=True,timeout=30).strip()
    h=spec['historicalHCommit']
    root=git('rev-parse',h+'^{tree}')
    src=git('rev-parse',h+':src')
    bridge=git('rev-parse',h+':bridge')
    assert root==spec['historicalHRootTree'] and src==spec['historicalHTree'] and bridge==spec['historicalBridgeTree']
    assert root!=src,'r5 false comparison no longer RED'
    m0='292d6fd3b5293fe2a520b681ae4c1dde997dc113'
    assert git('rev-parse',m0+':src')==spec['productionSrcTree']
    assert git('rev-parse','HEAD')==spec['productionHead']
    assert git('rev-parse','HEAD:src')==spec['productionSrcTree']
    assert git('status','--porcelain=v1')==''
    assert git('remote','get-url','origin')=='https://github.com/HSpector1/The-Movies.git'
    for ref,oid in ((spec['productionRef'],spec['productionHead']),(spec['evidenceRef'],spec['evidenceTip'])):
        assert git('rev-parse',ref)==oid
        assert git('ls-remote','origin',ref)==oid+'\t'+ref
    runner=(HERE/'readback.py').read_text()
    assert "spec['historicalHCommit']+':src'" in runner
    assert "spec['historicalHCommit']+'^{tree}'" in runner
    assert "spec['historicalHRootTree']" in runner
    assert "spec['predecessorR5ObservedStopSha256']" in runner
    assert ns['OUT']==pathlib.Path(spec['output']['path'])
    assert ns['LOG_NAME']=='c0-h-bridge-full-readback-20261008-r6.lane.log'
    # Execute the actual corrected Git/source guards without the lane/mirror guard.
    # Only Git refs/rosters and review bytes are read; the real lane remains untouched.
    ns['guard']=lambda *args,**kwargs:None
    ns['remaining']=lambda:600
    ns['source_guard'](spec)
    expected=ns['build_expected'](spec)
    assert len(expected)==1402 and sum(row[2] for row in expected.values())==99516095
    print('PASS r6 synthetic, actual r5 STOP/binding, H root/src/bridge and M0 src roles, current local/remote refs and 1,402-row Git roster; no mirror read')

if __name__ == '__main__':
    main()
