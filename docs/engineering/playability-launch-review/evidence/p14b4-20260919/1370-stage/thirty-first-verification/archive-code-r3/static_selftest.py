#!/usr/bin/env python3
"""Static-only r2→r3 diff and leaf spelling check; never imports archive code."""
import ast
import hashlib
import json
from pathlib import Path

BASE = Path('/Users/zacheryspector/studio-scratch')
OLD = BASE / '1370-r12-followon-clean-archive-proposal-r2'
NEW = BASE / '1370-r12-followon-clean-archive-proposal-r3'
EXPECTED_OLD = {
    'package.py': '243bfe9a72b2d5fd965c43513bddd621a221fe0d831487cff2445606112ec806',
    'verify.py': '59c02008ef79cb25e84c8c795639f2efbc3b0abf66302ef8dc1b28eff1e97a0d',
}
REPLACEMENTS = {
    'package.py': ("    leaf = f'{role}-clean-r12-{run}'\n", "    leaf = f'{role}-clean-{run}'\n"),
    'verify.py': ('    leaf = f\'{role}-clean-r12-{pin["runId"]}\'\n', '    leaf = f\'{role}-clean-{pin["runId"]}\'\n'),
}


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    output = {'decision': 'PASS_STATIC_ONLY', 'files': {}, 'exampleLeaves': {}}
    for name, (before, after) in REPLACEMENTS.items():
        old_raw = (OLD / name).read_bytes()
        new_raw = (NEW / name).read_bytes()
        assert sha(old_raw) == EXPECTED_OLD[name], name
        old = old_raw.decode()
        new = new_raw.decode()
        assert old.count(before) == 1 and new == old.replace(before, after, 1), name
        ast.parse(new, filename=str(NEW / name))
        output['files'][name] = {'oldSha256': sha(old_raw), 'newSha256': sha(new_raw), 'onlyIntendedLineChanged': True, 'astParsed': True}
    for role in ('ag-adoption', 'e0g-p13a', 'e0g-adoption'):
        run = f'r12-{role}-clean-20261007-1850'
        leaf = f'{role}-clean-{run}'
        assert leaf == f'{role}-clean-r12-{role}-clean-20261007-1850'
        assert '-clean-r12-r12-' not in leaf
        output['exampleLeaves'][role] = leaf
    assert output['exampleLeaves']['ag-adoption'] == 'ag-adoption-clean-r12-ag-adoption-clean-20261007-1850'
    print(json.dumps(output, indent=2, sort_keys=True))


if __name__ == '__main__':
    main()
