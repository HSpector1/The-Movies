from __future__ import annotations

import difflib
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path('/Users/zacheryspector/studio-scratch/1369-guarded-c0-f6-proposal-r1')
REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
C0 = Path('/Users/zacheryspector/studio-scratch/1368-ledger-arms-04/C0/tree')
REPORT = Path('/Users/zacheryspector/studio-scratch/1369-causal-arms-preflight-r1/REPORT.md')
GPATCH = Path('/Users/zacheryspector/studio-scratch/1368-rival-writing-guard-prep/production.patch')
HEAD = '2253bcb128f6c4d3593982703289b746d3fcf171'
GUARD = (
    "  const writerTerms=currentEmployees(h,b.studioId).find(e=>e.terms.talentId===writer.id)!.terms\n"
    "  // Work due at the term end completes before ordinary expiry. Later work needs a paid term\n"
    "  // already in force; an open market case does not guarantee a future renewal.\n"
    "  if(week+draftWeeks>writerTerms.endWeekExclusive)return\n"
)
ANCHOR = "  const weeklyCost=rivalWeeklyOperatingCost(b,h,week)\n"

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def regular(root: Path) -> dict[str, bytes]:
    return {str(p.relative_to(root)): p.read_bytes() for p in sorted(root.rglob('*'))
            if p.is_file() and not p.is_symlink()}

def inventory(files: dict[str, bytes]) -> dict[str, str]:
    return {k: sha(v) for k, v in files.items()}

def write_diff(before: dict[str, bytes], after: dict[str, bytes], name: str) -> list[str]:
    assert set(before) == set(after)
    changed = [p for p in sorted(before) if before[p] != after[p]]
    hunks: list[str] = []
    for p in changed:
        hunks.extend(difflib.unified_diff(
            before[p].decode().splitlines(keepends=True),
            after[p].decode().splitlines(keepends=True),
            fromfile=f'a/{p}', tofile=f'b/{p}', n=3))
    (ROOT / f'{name}.patch').write_text(''.join(hunks))
    return changed

assert sha(REPORT.read_bytes()) == 'de2e60f15fe7471f0afda235093539377e581fca1fcb5d6c2587e5629dc4d07f'
assert sha(GPATCH.read_bytes()) == '2a4ea2dc9b0fd87c211c9cf600d9691081f158fa45982ce42dcada4b703de058'
assert subprocess.check_output(['git', 'rev-parse', HEAD], cwd=REPO).decode().strip() == HEAD
assert subprocess.check_output(['git', 'rev-parse', f'{HEAD}:src'], cwd=REPO).decode().strip() == '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
assert ROOT.exists() and not (ROOT / 'C0+G').exists() and not (ROOT / 'F6+G').exists()

c0 = regular(C0)
assert len(c0) == 197
src_paths = sorted(p for p in c0 if p.startswith('src/'))
assert len(src_paths) == 188
c0_pins = json.loads((C0.parent / 'SOURCE-PINS.json').read_text())
assert inventory(c0) == c0_pins
git_paths = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', HEAD, '--', 'src'], cwd=REPO).decode().splitlines()
assert git_paths == src_paths
f6 = dict(c0)
for p in src_paths:
    f6[p] = subprocess.check_output(['git', 'show', f'{HEAD}:{p}'], cwd=REPO)
assert [p for p in src_paths if c0[p] != f6[p]] == ['src/core/campaignLegacy.ts', 'src/core/save.ts']

def apply_guard(files: dict[str, bytes]) -> dict[str, bytes]:
    result = dict(files)
    path = 'src/core/hollywoodTick.ts'
    source = files[path].decode()
    assert source.count(ANCHOR) == 1
    assert source.count('const draftWeeks=scriptDraftWeeks(') == 1
    assert 'writerTerms=currentEmployees(h,b.studioId)' not in source
    assert source.index('const draftWeeks=scriptDraftWeeks(') < source.index(ANCHOR)
    source = source.replace(ANCHOR, GUARD + ANCHOR)
    assert source.count(GUARD) == 1
    result[path] = source.encode()
    return result

c0g = apply_guard(c0)
f6g = apply_guard(f6)
assert [p for p in c0 if c0[p] != c0g[p]] == ['src/core/hollywoodTick.ts']
assert [p for p in f6 if f6[p] != f6g[p]] == ['src/core/hollywoodTick.ts']
assert f6g['src/core/hollywoodTick.ts'] == c0g['src/core/hollywoodTick.ts']

for name, files in [('C0+G', c0g), ('F6+G', f6g)]:
    target = ROOT / name
    shutil.copytree(C0, target, symlinks=True)
    for path, data in files.items():
        dst = target / path
        if dst.read_bytes() != data:
            dst.write_bytes(data)
    assert regular(target) == files
    (ROOT / f'{name}-SHA256.json').write_text(json.dumps(inventory(files), indent=2) + '\n')
    (ROOT / f'{name}-SRC-SHA256.json').write_text(json.dumps(inventory({p: files[p] for p in src_paths}), indent=2) + '\n')

edges = {
    'C0-to-C0+G': write_diff(c0, c0g, 'C0-to-C0+G'),
    'F6-to-F6+G': write_diff(f6, f6g, 'F6-to-F6+G'),
    'C0+G-to-F6+G': write_diff(c0g, f6g, 'C0+G-to-F6+G'),
}
assert edges == {
    'C0-to-C0+G': ['src/core/hollywoodTick.ts'],
    'F6-to-F6+G': ['src/core/hollywoodTick.ts'],
    'C0+G-to-F6+G': ['src/core/campaignLegacy.ts', 'src/core/save.ts'],
}
summary = {
    'reportSha256': sha(REPORT.read_bytes()),
    'gPatchSha256': sha(GPATCH.read_bytes()),
    'f6Commit': HEAD,
    'f6SrcGitTree': '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554',
    'c0SourcePinsSha256': sha((C0.parent / 'SOURCE-PINS.json').read_bytes()),
    'sourceFileCount': len(src_paths),
    'regularFileCountPerCandidate': len(c0),
    'copiedKitRoot': str(C0),
    'nodeModulesSymlink': str((C0 / 'node_modules').readlink()),
    'edges': edges,
}
(ROOT / 'INVENTORY.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps(summary, indent=2))
