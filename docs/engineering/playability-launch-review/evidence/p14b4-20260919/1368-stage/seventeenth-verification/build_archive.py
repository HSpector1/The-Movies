from __future__ import annotations
import hashlib, json, os, stat, tarfile
from pathlib import Path
S = Path('/Users/zacheryspector/studio-scratch')
R = Path('/Users/zacheryspector/The-Movies-headless-program')
E = R / 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
OUT = S / '1368-seventeenth-publication-prep-r1'
PACKAGE = S / '1368-ledger-r5-profile-proposal-20261005-r1'
RUNS = S / '1368-ledger-recorded-runs-r5-profile-r1'
STEMS = [
    ('types', 'ABC-types-source-r1', '1368-ledger-r5-profile-r1-abc-types-source-r1', '1368-ledger-r5-profile-types-r1'),
    ('clean', 'ABC-clean-p13a-r1', '1368-ledger-r5-profile-r1-abc-clean-p13a-r1', '1368-ledger-r5-profile-clean-p13a-r1'),
    ('observed', 'ABC-observed-p13a-r1', '1368-ledger-r5-profile-r1-abc-observed-p13a-r1', '1368-ledger-r5-profile-observed-p13a-r1'),
]
DIRS = [
    '1368-ledger-r5-profile-proposal-20261005-r1',
    '1368-ledger-r5-profile-independent-review-20261005',
    '1368-ledger-r5-profile-clean-gate-independent-20261005',
    '1368-ledger-r5-observed-profile-design-20261005-r1',
    '1368-ledger-r5-snap-optimization-proposal-20261005-r1',
    '1368-ledger-r5-snap-optimization-proposal-20261005-r2',
    '1368-ledger-r5-snap-optimization-proposal-20261005-r3',
    '1368-ledger-r5-snap-optimization-review-20261005-r1',
    '1368-ledger-r5-profile-observed-independent-audit-20261005',
]
DIRS.extend('1368-ledger-recorded-runs-r5-profile-r1/' + leaf for _, leaf, _, _ in STEMS)

def sha(data: bytes) -> str: return hashlib.sha256(data).hexdigest()
def member(path: Path) -> str:
    if path.is_relative_to(S): return 'studio-scratch/' + path.relative_to(S).as_posix()
    assert path.is_relative_to(E), path
    return 'formal-evidence/' + path.relative_to(E).as_posix()

def main():
    assert not (S / 'heavy-queue/HEAVY-LANE-LOCK').exists(), 'heavy lane still active'
    assert not (OUT / 'evidence.tar.gz').exists() and not (OUT / 'MANIFEST.json').exists(), 'archive output already exists'
    sources: list[Path] = []
    skipped_symlinks: list[str] = []
    skipped_caches: list[str] = []
    for name in DIRS:
        root = S / name
        assert root.is_dir() and not root.is_symlink(), root
        for base, dirs, files in os.walk(root, followlinks=False):
            b = Path(base)
            for d in list(dirs):
                path = b / d
                if path.is_symlink(): skipped_symlinks.append(str(path)); dirs.remove(d)
                elif d == '__pycache__': skipped_caches.append(str(path)); dirs.remove(d)
            dirs.sort()
            for f in sorted(files):
                path = b / f
                if path.is_symlink(): skipped_symlinks.append(str(path)); continue
                assert path.is_file() and stat.S_ISREG(path.stat().st_mode), path
                sources.append(path)
    # Each run needs its exact wrapper log/meta and five formal records.
    for _, leaf, formal, log in STEMS:
        run = RUNS / leaf
        assert (run / 'RESULT.json').is_file() or (run / 'WRAPPER-FAILURE.json').is_file(), run
        sources.extend([S / 'heavy-queue' / (log + suffix) for suffix in ['.log', '.log.meta']])
        sources.extend(E / (formal + suffix) for suffix in ['.json', '.patch', '.txt', '-preflight.json', '-postflight.json'])
    # Chain the previous checkpoint without copying its archive into this delta.
    sources.extend([S / '1368-sixteenth-publication-prep-r1/MANIFEST.json',
                    S / '1368-sixteenth-independent-archive-review-20261005/REVIEW.md'])
    package_manifest = json.loads((PACKAGE / 'MANIFEST.json').read_text())
    for rel, pin in package_manifest['files'].items():
        path = PACKAGE / rel
        assert path in sources and path.stat().st_size == pin['bytes'] and sha(path.read_bytes()) == pin['sha256'], path
    arm_members = [path for path in sources if path.is_relative_to(PACKAGE / 'arm/tree')]
    assert len(arm_members) == 197, 'r5 arm source coverage'
    assert len([path for path in sources if path.is_relative_to(PACKAGE / 'arm/tree/src')]) == 188, 'production source coverage'
    rows = []
    for path in sources:
        assert path.is_file() and not path.is_symlink(), path
        data = path.read_bytes()
        rows.append({'member': member(path), 'source': str(path), 'bytes': len(data), 'sha256': sha(data)})
    rows.sort(key=lambda row: row['member'])
    assert len({row['member'] for row in rows}) == len(rows), 'duplicate archive member'
    assert not any('/node_modules/' in row['member'] or '/__pycache__/' in row['member'] for row in rows)
    assert all('/tree/' not in row['member'] or '/1368-ledger-r5-profile-proposal-20261005-r1/arm/tree/' in row['member'] for row in rows)
    archive = OUT / 'evidence.tar.gz'
    with tarfile.open(archive, 'w:gz', format=tarfile.PAX_FORMAT) as tar:
        for row in rows: tar.add(row['source'], arcname=row['member'], recursive=False)
    with tarfile.open(archive, 'r:gz') as tar:
        entries = tar.getmembers()
        assert len(entries) == len(rows)
        for entry, row in zip(entries, rows):
            assert entry.isfile() and entry.name == row['member'] and entry.size == row['bytes']
            assert sha(tar.extractfile(entry).read()) == row['sha256'], row['member']
            assert sha(Path(row['source']).read_bytes()) == row['sha256'], row['source']
    report = {'archive': str(archive), 'archiveBytes': archive.stat().st_size,
              'archiveSha256': sha(archive.read_bytes()), 'memberCount': len(rows),
              'logicalBytes': sum(row['bytes'] for row in rows), 'readbackVerified': True,
              'includedDirectories': DIRS, 'skippedSymlinks': skipped_symlinks,
              'skippedCaches': skipped_caches, 'members': rows}
    (OUT / 'MANIFEST.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({k:v for k,v in report.items() if k != 'members'}, indent=2))
    print('manifestSha256', sha((OUT / 'MANIFEST.json').read_bytes()))
if __name__ == '__main__': main()
