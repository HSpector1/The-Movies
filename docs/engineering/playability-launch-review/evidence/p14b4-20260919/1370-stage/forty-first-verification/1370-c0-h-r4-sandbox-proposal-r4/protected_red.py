#!/usr/bin/env python3
"""Disposable r2 protected-destination RED, now required to refuse in r3."""
import json
from pathlib import Path
import tempfile
from profile import freeze

with tempfile.TemporaryDirectory(prefix='protected-profile-r3-', dir=Path(__file__).parent) as name:
    area = Path(name)
    experiment = area / 'experiment'; experiment.mkdir()
    canary = experiment / 'denied'; canary.mkdir()
    allowed = experiment / 'allowed'; allowed.mkdir()
    protected = area / 'protected'; protected.mkdir()
    spec = {'mode': 'synthetic', 'experimentParent': str(experiment),
            'deniedCanary': str(canary), 'allowedDirectories': [str(allowed)],
            'protectedDirectories': [str(protected)]}
    before = protected.stat()
    target = protected / 'must-not-appear.sb'
    try: freeze(spec, target)
    except ValueError as e:
        assert 'profile parent overlaps protected' in str(e), str(e)
    else: raise AssertionError('protected profile write accepted')
    after = protected.stat()
    assert not target.exists()
    assert (before.st_mtime_ns, before.st_ctime_ns) == (after.st_mtime_ns, after.st_ctime_ns)
    alias = area / 'alias'; alias.symlink_to(protected, target_is_directory=True)
    try: freeze(spec, alias / 'must-not-appear.sb')
    except (ValueError, OSError): pass
    else: raise AssertionError('symlink profile parent accepted')
    assert not target.exists()
    print(json.dumps({'status': 'PASS_R3_PROTECTED_AND_ALIAS_REFUSED',
                      'protectedMtimeCtimeUnchanged': True, 'profileAbsent': True}, indent=2))
