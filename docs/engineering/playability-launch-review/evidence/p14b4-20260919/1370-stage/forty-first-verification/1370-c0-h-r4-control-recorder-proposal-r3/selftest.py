#!/usr/bin/env python3
"""Only tiny self-created scratch fixtures; no H, Vitest, sandbox or heavy lane."""
import json
import io
import os
from pathlib import Path
import select
import subprocess
import sys
import tempfile
import time
from unittest.mock import patch
import recorder
import mac_xattr
import safe_output

here = Path(__file__).resolve().parent
with tempfile.TemporaryDirectory(prefix='control-selftest-', dir=here) as name:
    area = Path(name)
    root = area / 'source'; root.mkdir()
    (root / 'diagnostic.test.ts').write_text('fixture')
    first = recorder.tree_snapshot(root)
    assert first['regularFiles'] == 1 and first['regularBytes'] == 7
    child_path = root / 'transient'
    child_path.write_text('x'); child_path.unlink()
    second = recorder.tree_snapshot(root)
    assert first['digest'] == second['digest'] and first['rosterDigest'] == second['rosterDigest']
    assert (first['rootTuple']['mtimeNs'], first['rootTuple']['ctimeNs']) != \
           (second['rootTuple']['mtimeNs'], second['rootTuple']['ctimeNs'])
    before_xattr = recorder.tree_snapshot(root)
    mac_xattr.set_fixture(root / 'diagnostic.test.ts', 'com.openai.h-control-selftest', b'changed')
    after_xattr = recorder.tree_snapshot(root)
    assert before_xattr['digest'] != after_xattr['digest']
    assert before_xattr['rootTuple'] == after_xattr['rootTuple']
    before_root_xattr = recorder.tree_snapshot(root)
    mac_xattr.set_fixture(root, 'com.openai.h-control-root-selftest', b'changed')
    after_root_xattr = recorder.tree_snapshot(root)
    assert before_root_xattr['digest'] != after_root_xattr['digest']
    before_acl = recorder.tree_snapshot(root)
    subprocess.run(['/bin/chmod', '+a', 'everyone allow read', str(root / 'diagnostic.test.ts')], check=True)
    try:
        after_acl = recorder.tree_snapshot(root)
        assert before_acl['digest'] != after_acl['digest'], 'ACL mutation was not detected'
    finally:
        subprocess.run(['/bin/chmod', '-N', str(root / 'diagnostic.test.ts')], check=True)
    receipts = area / 'receipts'; receipts.mkdir()
    held, identity = safe_output.validate_parent(receipts, [root])
    try:
        safe_output.recheck(receipts, held, identity)
        safe_output.write_once(held, 'receipt.json', b'{}\n')
    finally: os.close(held)
    assert (receipts / 'receipt.json').read_bytes() == b'{}\n'
    alias = area / 'alias'; alias.symlink_to(root, target_is_directory=True)
    root_before_red = root.stat()
    try: safe_output.validate_parent(alias, [root])
    except (OSError, RuntimeError): pass
    else: raise AssertionError('symlink output parent accepted')
    root_after_red = root.stat()
    assert (root_before_red.st_mtime_ns, root_before_red.st_ctime_ns) == \
           (root_after_red.st_mtime_ns, root_after_red.st_ctime_ns)
    try: safe_output.validate_parent(area, [root])
    except (OSError, RuntimeError): pass
    else: raise AssertionError('ancestor output parent accepted')
    assert recorder.available(area) > 0 and recorder.FLOOR == 3 * 2**30
    pipe = io.BytesIO(); counts = {'pipe': 0}
    recorder.write_bounded(pipe, b'abc', counts, 'pipe', 3)
    try: recorder.write_bounded(pipe, b'd', counts, 'pipe', 3)
    except recorder.Stop as e: assert e.status == 'STOP_OUTPUT_CAP'
    else: raise AssertionError('pipe cap not enforced')
    assert pipe.getvalue() == b'abc'
    collection = area / 'collection.json'
    collection.write_text(json.dumps([{'name': 'fixture test', 'file': str(root / 'tests/diagnostic.test.ts'),
                                       'projectName': 'core'}]))
    assert recorder.collection_ok(collection, root, 'fixture test')
    watcher = subprocess.Popen(['node', str(here / 'watcher.cjs'), str(root)],
                               stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                               text=True, start_new_session=True)
    try:
        ready = json.loads(watcher.stdout.readline())
        assert ready['kind'] == 'ready' and int(ready['ino']) == root.stat().st_ino
        (root / 'watch-transient').write_text('x')
        assert select.select([watcher.stdout], [], [], 3)[0], 'no watcher event'
        event = json.loads(watcher.stdout.readline())
        assert event['kind'] == 'event' and event['filename'] == 'watch-transient', event
    finally:
        watcher_cleanup = recorder.kill_group(watcher)
    assert watcher_cleanup['reaped'] and watcher_cleanup['groupClear']
    sleeper = subprocess.Popen([sys.executable, '-c', 'import time; time.sleep(30)'],
                               start_new_session=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    sleeper_cleanup = recorder.kill_group(sleeper)
    assert sleeper_cleanup['reaped'] and sleeper_cleanup['groupClear']
    denied_sleeper = subprocess.Popen([sys.executable, '-c', 'import time; time.sleep(30)'],
                                      start_new_session=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    with patch.object(recorder.os, 'killpg', side_effect=PermissionError(1, 'denied')):
        denied_cleanup = recorder.kill_group(denied_sleeper)
    assert denied_cleanup['reaped'] and not denied_cleanup['groupClear'] and denied_cleanup['errors']
    assert denied_sleeper.poll() is not None
    print(json.dumps({'status': 'PASS', 'snapshotEqualAfterTransient': True,
                      'rootTimestampTransition': True, 'watcherReadyAndEvent': True,
                      'xattrMutationRedDetected': True, 'rootXattrMutationRedDetected': True,
                      'heldReceiptWrite': True, 'symlinkOutputParentRedRefused': True,
                      'ancestorOutputParentRedRefused': True, 'aclMutationRedDetected': True,
                      'deniedGroupSignalReturnsStopEvidence': True,
                      'watcherGroupClear': True, 'childGroupClear': True,
                      'pipeCapStop': True,
                      'diskMeasurementBytes': recorder.available(area),
                      'stdoutCapBytes': recorder.OUT_CAP, 'watchCapBytes': recorder.WATCH_CAP}, indent=2))
