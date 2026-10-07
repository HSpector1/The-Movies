#!/usr/bin/env python3
"""Preserve the two clean 1361 sweep Git repositories as complete, segmented bundles.

Proposal only: parent must independently review before executing. The script writes
only beneath a new --output directory and never follows source symlinks.
"""

import argparse
import gzip
import hashlib
import json
import os
import pathlib
import stat
import subprocess
import tarfile

ROOT = pathlib.Path('/Users/zacheryspector/studio-scratch/1361-sweep')
LIVE_REPO = pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
EXPECTED = {
    'x2': ('838dce0218d5c940cdcfd57e01232fbcd1082bf0', '0165274ffeedc3783ef215e68b773b7e8a6b5410'),
    'x3': ('ee289de67e453ce269c98d840a48799265c62993', 'd8b993bb0c078613baa07313f7845367d5e90829'),
}
SEGMENT_BYTES = 48_000_000  # Safely below a 48 MiB or 50 MB Git blob ceiling.


def run(*args: str, cwd: pathlib.Path | None = None) -> bytes:
    return subprocess.run(args, cwd=cwd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout


def digest(path: pathlib.Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def links_in(tree: pathlib.Path) -> list[dict]:
    links = []
    for current, dirs, files in os.walk(tree, followlinks=False):
        if pathlib.Path(current) == tree:
            dirs[:] = [d for d in dirs if d != '.git']
        for name in sorted(dirs + files):
            p = pathlib.Path(current) / name
            if p.is_symlink():
                links.append({'path': p.relative_to(tree).as_posix(), 'target': os.readlink(p)})
        dirs[:] = [d for d in dirs if not (pathlib.Path(current) / d).is_symlink()]
    return sorted(links, key=lambda row: row['path'])


def ignored_roots(tree: pathlib.Path) -> list[str]:
    raw = run('git', '-C', str(tree), 'status', '--ignored', '--porcelain=v1', '-z')
    rows = raw.split(b'\0')
    if rows[-1] != b'':
        raise RuntimeError('invalid ignored status encoding')
    roots = []
    for row in rows[:-1]:
        if not row.startswith(b'!! '):
            raise RuntimeError(f'unexpected status row: {row!r}')
        rel = os.fsdecode(row[3:]).rstrip('/')
        if not rel or pathlib.PurePosixPath(rel).is_absolute() or '..' in pathlib.PurePosixPath(rel).parts:
            raise RuntimeError(f'unsafe ignored path: {rel}')
        roots.append(rel)
    return sorted(roots)


def ignored_inventory(tree: pathlib.Path, roots: list[str]) -> list[dict]:
    found = []

    def visit(p: pathlib.Path) -> None:
        rel = p.relative_to(tree).as_posix()
        st = p.lstat()
        if p.is_symlink():
            found.append({'path': rel, 'kind': 'symlink', 'target': os.readlink(p), 'mode': stat.S_IMODE(st.st_mode)})
        elif p.is_dir():
            found.append({'path': rel, 'kind': 'directory', 'mode': stat.S_IMODE(st.st_mode)})
            for child in sorted(p.iterdir(), key=lambda item: item.name):
                visit(child)
        elif p.is_file():
            found.append({'path': rel, 'kind': 'file', 'mode': stat.S_IMODE(st.st_mode), 'bytes': st.st_size, 'sha256': digest(p)})
        else:
            raise RuntimeError(f'unsupported ignored entry: {p}')

    for root in roots:
        visit(tree / root)
    return found


def external_dependencies(links: list[dict]) -> list[dict]:
    dependencies = []
    for link in links:
        target = pathlib.Path(link['target'])
        if not target.is_absolute() or target != LIVE_REPO and LIVE_REPO not in target.parents:
            raise RuntimeError(f'unexpected symlink target: {link}')
        if not target.exists():
            raise RuntimeError(f'dangling external dependency: {target}')
        dependencies.append({'path': link['path'], 'target': str(target),
                             'kind': 'directory' if target.is_dir() else 'file'})
    return dependencies


def write_extras(tree: pathlib.Path, roots: list[str], target: pathlib.Path) -> None:
    with target.open('xb') as raw, gzip.GzipFile(filename='', mode='wb', fileobj=raw, mtime=0) as zipped:
        with tarfile.open(mode='w', fileobj=zipped, dereference=False, format=tarfile.PAX_FORMAT) as tar:
            def normalize(info: tarfile.TarInfo) -> tarfile.TarInfo:
                info.mtime = 0
                info.uid = info.gid = 0
                info.uname = info.gname = ''
                return info
            for root in roots:
                tar.add(tree / root, arcname=root, recursive=True, filter=normalize)


def source_state(unit: str) -> dict:
    tree = ROOT / unit / 'tree'
    if not tree.is_dir() or tree.is_symlink():
        raise RuntimeError(f'{unit}: source tree missing or symlink')
    head = run('git', '-C', str(tree), 'rev-parse', 'HEAD').decode().strip()
    tree_oid = run('git', '-C', str(tree), 'rev-parse', 'HEAD^{tree}').decode().strip()
    if (head, tree_oid) != EXPECTED[unit]:
        raise RuntimeError(f'{unit}: HEAD/tree changed: {head} {tree_oid}')
    status = run('git', '-C', str(tree), 'status', '--porcelain=v1', '-z', '--untracked-files=all')
    if status:
        raise RuntimeError(f'{unit}: dirty or untracked source tree')
    refs = run('git', '-C', str(tree), 'for-each-ref', '--format=%(refname) %(objectname)').decode().splitlines()
    expected_refs = {
        'x2': {'refs/heads/main': EXPECTED['x2'][0], 'refs/tags/base': '91b1938f910ad1d039fcee0d4050b2fcdc7452c0', 'refs/tags/production': 'ded10cdb154b3517b2126fb83ccb66f7d515a69d'},
        'x3': {'refs/heads/main': EXPECTED['x3'][0], 'refs/tags/base': '39d5dc5dc9c53bc28738c5785b60f4b816e63655', 'refs/tags/production': 'f830ddf7cfbe70acaaa72ad64285b968a3d6c71e'},
    }[unit]
    actual_refs = dict(line.split(' ', 1) for line in refs)
    if actual_refs != expected_refs:
        raise RuntimeError(f'{unit}: refs changed: {actual_refs}')
    ignored = ignored_roots(tree)
    links = links_in(tree)
    exclude = tree / '.git' / 'info' / 'exclude'
    if not exclude.is_file() or exclude.is_symlink():
        raise RuntimeError(f'{unit}: missing Git info/exclude')
    return {'unit': unit, 'source': str(tree), 'head': head, 'tree': tree_oid,
            'refs': actual_refs, 'status': 'clean', 'symlinks': links,
            'external_dependency_root': str(LIVE_REPO),
            'external_dependencies': external_dependencies(links),
            'info_exclude': {'bytes': exclude.stat().st_size, 'sha256': digest(exclude)},
            'ignored_roots': ignored, 'ignored_inventory': ignored_inventory(tree, ignored)}


def build_unit(unit: str, out: pathlib.Path) -> dict:
    before = source_state(unit)
    unit_out = out / unit
    unit_out.mkdir()
    temporary = unit_out / 'COMPLETE.bundle.tmp'
    source = pathlib.Path(before['source'])
    # --all with no excluded revision makes a self-contained bundle; all three
    # declared refs are checked both before and after construction.
    run('git', '-C', str(source), '-c', 'pack.threads=1', 'bundle', 'create', str(temporary), '--all')
    total = temporary.stat().st_size
    full_sha = digest(temporary)
    segments = []
    with temporary.open('rb') as stream:
        index = 1
        while True:
            block = stream.read(SEGMENT_BYTES)
            if not block:
                break
            p = unit_out / f'COMPLETE.bundle.part-{index:04d}'
            with p.open('xb') as writer:
                writer.write(block)
            segments.append({'name': p.name, 'bytes': len(block), 'sha256': digest(p)})
            index += 1
    if not segments or sum(row['bytes'] for row in segments) != total:
        raise RuntimeError(f'{unit}: incomplete split')
    temporary.unlink()  # Only the temporary bundle created inside this new output.
    extras = unit_out / 'IGNORED-EXTRAS.tar.gz'
    write_extras(source, before['ignored_roots'], extras)
    if extras.stat().st_size > SEGMENT_BYTES:
        raise RuntimeError(f'{unit}: extras archive exceeds 48 MB; add segmentation before publication')
    exclude = unit_out / 'INFO-EXCLUDE'
    exclude.write_bytes((source / '.git' / 'info' / 'exclude').read_bytes())
    after = source_state(unit)
    if after != before:
        raise RuntimeError(f'{unit}: source changed during bundling')
    return {**before, 'bundle': {'bytes': total, 'sha256': full_sha,
                                  'segment_bytes_max': SEGMENT_BYTES, 'segments': segments},
            'extras': {'name': extras.name, 'bytes': extras.stat().st_size, 'sha256': digest(extras)}}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True, type=pathlib.Path)
    args = parser.parse_args()
    out = args.output.resolve()
    if out.exists() or ROOT in out.parents or out == ROOT:
        raise RuntimeError('output must be new and outside 1361-sweep')
    out.mkdir(parents=False)
    rows = [build_unit(unit, out) for unit in ('x2', 'x3')]
    manifest = {'format': '1361-sweep-complete-bundles-v2', 'rows': rows,
                'scope': 'Git history and local tree extras are archived; absolute symlink targets remain live-repository dependencies.'}
    path = out / 'MANIFEST.json'
    path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + '\n')
    print(path)
    print(digest(path))


if __name__ == '__main__':
    main()
