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

HERE = pathlib.Path('/Users/zacheryspector/studio-scratch/1370-c0-h-bridge-full-readback-runner-proposal-r4')
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
    assert ns['BINDING'] == HERE/'BINDING-UNFILLED.json'
    filled_path = pathlib.Path('/Users/zacheryspector/studio-scratch/1370-c0-h-bridge-full-readback-filled-exact-r4/BINDING.json')
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
        lock.write_text('c0-h-bridge-full-readback-20261008-r4.lane.log')
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
    print('PASS source pins and synthetic: bootstrap/runner invalid-future start and exact link continuity, 58 sorted bridge OIDs, streamed-entry cap/cadence, symlink-parent refusal, growth refusal, lane status/terminal refusals, filled/unfilled binding path, 5-second AC cadence, whole-child timer')

if __name__ == '__main__':
    main()
