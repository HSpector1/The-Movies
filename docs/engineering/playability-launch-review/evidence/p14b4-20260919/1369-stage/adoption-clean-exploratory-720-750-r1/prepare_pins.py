#!/usr/bin/env python3
"""Snapshot the closed source inventory into an explicit reviewable pin file."""
import hashlib
import json
import os
from pathlib import Path
from archive_builder import LEAVES, FORMAL_SUFFIXES

S = Path('/Users/zacheryspector/studio-scratch')
E = Path('/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919')
KNOWN = {
 'runs/C0-types-source-r1/RESULT.json':'cb8006305e94a564ba3aa919b6890dfde197687284e2880d8467bce62828ce58',
 'runs/ABC-types-source-r1/RESULT.json':'fbb7d295316121bef193b5980f6cddc0cd34a411a3200443d3d77e4e5391ac0e',
 'runs/C0-clean-adoption-r1/RESULT.json':'64453c5636882e7e609021d00c3ad346796e5a402b30e83ff96548cc3433ea5f',
 'runs/ABC-clean-adoption-r1/RESULT.json':'69d981eb77f6a912687fa8e3385a421cab73ffa6562413ae17cb305517d4b854',
 'package/MANIFEST.json':'92c0b904e68906d77e9155bc9bd41b526c6a431af2c67fa34ff297274c5f1372',
 'package/runner/run.py':'776394a3289387042810de5bfbcaa2c4f21b5b97c65edbe259505b90b3485232',
 'comparator/compare.py':'ee8d8c1165693597c3d585c5b5535339f79612bb4858ba18cb69b0aea381aedf',
 'comparison/adoption-pins.json':'f49eca5c6d2ab9d615ede7ee384b628576e83f02bbd31dd3eb21a31b9be1d5cd',
 'comparison/REPORT.json':'b24fe702b325bdea7c6461b8724bc14b4fdb1813b82fe4fde4f8a6990efc5f09',
 'reviews/pair/REVIEW.md':'3f481644f541e9c790c3ccefe37320f400f0cb71dca59ec3902be11df18e9152',
 'reviews/pair/RECEIPT.json':'d2e1a41f0e20297ce2ebb80363d6d61f839343b10f61278ce054c78c28bbe3ab',
}
files = {}
def add(name, source):
    if name in files: raise ValueError(f'duplicate {name}')
    if source.is_symlink() or not source.is_file(): raise ValueError(f'nonregular {source}')
    blob = source.read_bytes()
    sha = hashlib.sha256(blob).hexdigest()
    if name in KNOWN and sha != KNOWN[name]: raise ValueError(f'known pin changed: {name}: {sha}')
    files[name] = {'source':str(source), 'sha256':sha, 'bytes':len(blob)}
def tree(name, root):
    for directory, dirs, names in os.walk(root, followlinks=False):
        for d in list(dirs):
            path = Path(directory)/d
            if path.is_symlink():
                if name == 'package' and d == 'node_modules':
                    dirs.remove(d)
                else: raise ValueError(f'unexpected symlink dir: {path}')
        for fn in names:
            path = Path(directory)/fn
            if fn.endswith('.pyc') or fn == '__pycache__': continue
            add(f'{name}/{path.relative_to(root).as_posix()}', path)

tree('package', S/'1369-adoption-extended-proposal-r1')
if sum(k.startswith('package/') for k in files) != 420: raise ValueError('package count != 420')
for leaf in LEAVES:
    tree(f'runs/{leaf}', S/'1369-adoption-clean-exploratory-recorded-r1'/leaf)
reviews = {
 'extended':'1369-adoption-extended-independent-review-r1',
 'types':'1369-adoption-types-independent-gate-r1',
 'c0-clean':'1369-adoption-c0-clean-gate-r1',
 'abc-clean':'1369-adoption-abc-clean-gate-r1',
 'comparator-code':'1369-adoption-descriptive-comparator-r2-independent-review-r1',
 'pair':'1369-adoption-pair-independent-review-r1'
}
for key, dirname in reviews.items(): tree(f'reviews/{key}', S/dirname)
add('static-check.json',S/'1369-adoption-extended-static-check-r2.json')
tree('comparator',S/'1369-adoption-descriptive-comparator-r2')
tree('comparison',S/'1369-adoption-descriptive-comparison-r1')
critical = {key: files[key]['sha256'] for key in ('package/MANIFEST.json','package/runner/run.py','comparator/compare.py','comparison/adoption-pins.json','comparison/REPORT.json','static-check.json')}
for leaf in LEAVES:
    arm, mode = leaf.split('-',1)
    lane_mode = 'types' if mode.startswith('types') else 'clean'
    lane_base = f'1369-adoption-{arm.lower()}-{lane_mode}-r1.log'
    for suffix in ('','.meta'):
        name = f'lane/{lane_base}{suffix}'
        add(name,S/'heavy-queue'/f'{lane_base}{suffix}')
        critical[name] = files[name]['sha256']
    result = json.loads((S/'1369-adoption-clean-exploratory-recorded-r1'/leaf/'RESULT.json').read_text())
    formal_base = f'1369-adoption-clean-exploratory-720-750-r1-{arm.lower()}-{mode}'
    for suffix in FORMAL_SUFFIXES:
        name = f'formal/{formal_base}{suffix}'
        source = E/f'{formal_base}{suffix}'
        expected = result['artifacts'].get(str(source))
        if not expected: raise ValueError(f'formal missing in RESULT: {source}')
        add(name,source)
        if {'sha256': files[name]['sha256'], 'bytes': files[name]['bytes']} != expected: raise ValueError(f'formal artifact differs: {source}')
        critical[name] = files[name]['sha256']
pins = {'classification':'EXPLORATORY_NOT_ACCEPTANCE',
 'git_reference':'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1369-A-adoption-timeout-and-observed-cap-amendment.md',
 'results':{leaf: files[f'runs/{leaf}/RESULT.json']['sha256'] for leaf in LEAVES},
 'reviews':{key:{'review':files[f'reviews/{key}/REVIEW.md']['sha256'],'receipt':files[f'reviews/{key}/RECEIPT.json']['sha256']} for key in reviews},
 'critical':critical, 'files':dict(sorted(files.items()))}
Path('PINS.json').write_text(json.dumps(pins,indent=2,sort_keys=True)+'\n')
print(f'{len(files)} pinned files; PINS.json SHA {hashlib.sha256(Path("PINS.json").read_bytes()).hexdigest()}')
