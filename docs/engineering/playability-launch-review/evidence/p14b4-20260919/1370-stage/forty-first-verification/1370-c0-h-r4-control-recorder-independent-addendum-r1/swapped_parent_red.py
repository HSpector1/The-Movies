#!/usr/bin/env python3
"""Disposable safe_output RED; never names real H or production paths."""
import os
from pathlib import Path
import sys
import tempfile

sys.path.insert(0, '/Users/zacheryspector/studio-scratch/1370-c0-h-r4-control-recorder-proposal-r3')
import safe_output

with tempfile.TemporaryDirectory(prefix='recorder-r3-moved-parent-', dir=Path(__file__).parent) as temp:
    root = Path(temp)
    protected = root / 'protected'
    protected.mkdir()
    receipt_parent = root / 'allowed-receipt'
    receipt_parent.mkdir()
    fd, identity = safe_output.validate_parent(str(receipt_parent), [str(protected)])
    try:
        safe_output.recheck(str(receipt_parent), fd, identity)
        # Simulate a rename after run()'s final pathname recheck and before its
        # held-FD O_EXCL write. The source itself does not recheck inside write_once.
        os.rename(receipt_parent, protected / 'allowed-receipt')
        safe_output.write_once(fd, 'RESULT.json', b'{"synthetic":true}\n')
        assert (protected / 'allowed-receipt' / 'RESULT.json').read_bytes() == b'{"synthetic":true}\n'
        try:
            safe_output.recheck(str(receipt_parent), fd, identity)
        except Exception:
            pass
        else:
            raise AssertionError('moved parent unexpectedly rechecked as stable')
    finally:
        os.close(fd)

with tempfile.TemporaryDirectory(prefix='recorder-r3-omitted-receipt-', dir=Path(__file__).parent) as temp:
    root = Path(temp)
    source = root / 'source'
    source.mkdir()
    immutable_receipt_parent = root / 'immutable-receipt-parent'
    immutable_receipt_parent.mkdir()
    (immutable_receipt_parent / 'ACCEPTED.json').write_text('{}\n')
    # run() supplies source/deps/H/production/evidence/guard roots only, never
    # the Stage40 or probe receipt parent. This simulates exactly that omission.
    fd, identity = safe_output.validate_parent(str(immutable_receipt_parent), [str(source)])
    try:
        safe_output.recheck(str(immutable_receipt_parent), fd, identity)
        safe_output.write_once(fd, 'RESULT.json', b'{"synthetic":true}\n')
        assert (immutable_receipt_parent / 'RESULT.json').is_file()
    finally:
        os.close(fd)

print('RED: r3 held-FD write enters moved protected root; omitted receipt parent accepts RESULT.json')
