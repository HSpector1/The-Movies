#!/usr/bin/env python3
"""Disposable rename race against r4 dependency manifest held output FD."""
import json
from pathlib import Path
import sys
import tempfile
from unittest.mock import patch

SOURCE = Path('/Users/zacheryspector/studio-scratch/1370-c0-h-r4-materializer-proposal-r4')
sys.path.insert(0, str(SOURCE))
import dependency_manifest as proposal  # noqa: E402

with tempfile.TemporaryDirectory(prefix='manifest-parent-swap-', dir=Path(__file__).parent) as temp:
    area = Path(temp)
    src = area / 'deps'; src.mkdir()
    (src / 'index.js').write_text('fixture')
    baseline = proposal.inventory(src)
    expected = (len(baseline['rows']), sum(row.get('size', 0) for row in baseline['rows']), 0)
    protected = area / 'protected'; protected.mkdir()
    receipt = protected / 'receipt.json'; receipt.write_text('{}\n')
    evidence = area / 'evidence'; evidence.mkdir()
    parent = area / 'safe-parent'; parent.mkdir()
    moved = protected / 'moved-parent'
    binding = {'protectedH': str(protected), 'productionDependencies': str(src),
               'evidenceCheckout': str(evidence),
               'immutableReceiptSha256': {str(receipt): 'fixture'}}
    original_inventory = proposal.inventory
    invoked = False
    def move_then_inventory(*args, **kwargs):
        global invoked
        if not invoked:
            invoked = True
            parent.rename(moved)
        return original_inventory(*args, **kwargs)
    before = protected.stat()
    with patch.object(proposal, 'inventory', side_effect=move_then_inventory):
        try:
            proposal.build(src, parent / 'manifest.json', fixture=True,
                           expected=expected, binding=binding)
        except Exception as error:
            stopped = type(error).__name__
        else:
            stopped = 'NO_STOP'
    after = protected.stat()
    assert moved.joinpath('manifest.json').is_file(), 'expected protected write did not reproduce'
    assert (before.st_mtime_ns, before.st_ctime_ns) != (after.st_mtime_ns, after.st_ctime_ns)
    print(json.dumps({'status': 'RED_SWAPPED_PARENT_PROTECTED_WRITE',
                      'postflightException': stopped,
                      'manifestInsideProtected': True,
                      'protectedRootTimestampChanged': True}, indent=2))
