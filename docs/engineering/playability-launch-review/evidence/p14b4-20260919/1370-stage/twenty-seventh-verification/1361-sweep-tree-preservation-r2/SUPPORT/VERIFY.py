#!/usr/bin/env python3
"""Independently reconstruct both complete 1361 scratch checkouts.

Run on staged bytes and again on bytes retrieved from the remote evidence commit.
Only an isolated temporary directory is written; original x2/x3 trees are untouched.
"""

import argparse
import hashlib
import json
import os
import pathlib
import stat
import subprocess
import sys
import tarfile
import tempfile

SEGMENT_BYTES = 48_000_000


def run(*args: str) -> bytes:
    return subprocess.run(args, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout


def digest(path: pathlib.Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def pathsafe(name: str) -> str:
    value = name.rstrip('/')
    if not value or value.startswith('/') or '\\' in value:
        raise AssertionError(f'unsafe archive path: {name!r}')
    parts = value.split('/')
    if any(p in ('', '.', '..') for p in parts):
        raise AssertionError(f'unsafe archive path: {name!r}')
    return value


def member_row(tar: tarfile.TarFile, member: tarfile.TarInfo) -> dict:
    rel = pathsafe(member.name)
    base = {'path': rel, 'mode': member.mode & 0o7777}
    if member.issym():
        return {**base, 'kind': 'symlink', 'target': member.linkname}
    if member.isdir():
        return {**base, 'kind': 'directory'}
    if member.isfile():
        stream = tar.extractfile(member)
        assert stream is not None
        h, size = hashlib.sha256(), 0
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
            size += len(block)
        return {**base, 'kind': 'file', 'bytes': size, 'sha256': h.hexdigest()}
    raise AssertionError(f'unsupported tar member: {member.name}')


def audit_extras(path: pathlib.Path, expected: list[dict]) -> None:
    rows, seen = [], set()
    with tarfile.open(path, mode='r:gz') as tar:
        for member in tar:
            row = member_row(tar, member)
            assert row['path'] not in seen, f'duplicate archive member: {row["path"]}'
            seen.add(row['path'])
            rows.append(row)
    assert sorted(rows, key=lambda row: row['path']) == sorted(expected, key=lambda row: row['path'])


def safe_parent(root: pathlib.Path, rel: str) -> pathlib.Path:
    target = root / rel
    current = root
    for part in pathlib.PurePosixPath(rel).parts[:-1]:
        current = current / part
        if current.is_symlink() or not current.is_dir():
            raise AssertionError(f'archive parent is not a real directory: {current}')
    return target


def restore_extras(path: pathlib.Path, checkout: pathlib.Path, expected: list[dict]) -> None:
    expected_rows = {row['path']: row for row in expected}
    seen, dirs = set(), []
    with tarfile.open(path, mode='r:gz') as tar:
        for member in tar:
            rel = pathsafe(member.name)
            assert rel in expected_rows and rel not in seen, f'unknown or duplicate member: {rel}'
            seen.add(rel)
            target = safe_parent(checkout, rel)
            assert not os.path.lexists(target), f'archive conflicts with checkout: {target}'
            if member.isdir():
                target.mkdir(mode=0o700)
                dirs.append((target, member.mode & 0o7777))
            elif member.issym():
                os.symlink(member.linkname, target)
            elif member.isfile():
                stream = tar.extractfile(member)
                assert stream is not None
                fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, 'O_NOFOLLOW', 0), 0o600)
                with os.fdopen(fd, 'wb') as writer:
                    for block in iter(lambda: stream.read(1024 * 1024), b''):
                        writer.write(block)
                target.chmod(member.mode & 0o7777)
            else:
                raise AssertionError(f'unsupported tar member: {member.name}')
    assert seen == set(expected_rows)
    for target, mode in reversed(dirs):
        target.chmod(mode)


def inventory(root: pathlib.Path, roots: list[str]) -> list[dict]:
    rows = []

    def visit(path: pathlib.Path) -> None:
        rel = path.relative_to(root).as_posix()
        st = path.lstat()
        base = {'path': rel, 'mode': stat.S_IMODE(st.st_mode)}
        if path.is_symlink():
            rows.append({**base, 'kind': 'symlink', 'target': os.readlink(path)})
        elif path.is_dir():
            rows.append({**base, 'kind': 'directory'})
            for child in sorted(path.iterdir(), key=lambda p: p.name):
                visit(child)
        elif path.is_file():
            rows.append({**base, 'kind': 'file', 'bytes': st.st_size, 'sha256': digest(path)})
        else:
            raise AssertionError(f'unsupported restored entry: {path}')

    for rel in roots:
        visit(root / rel)
    return rows


def links_in(tree: pathlib.Path) -> list[dict]:
    links = []
    for current, dirs, files in os.walk(tree, followlinks=False):
        if pathlib.Path(current) == tree:
            dirs[:] = [d for d in dirs if d != '.git']
        for name in sorted(dirs + files):
            path = pathlib.Path(current) / name
            if path.is_symlink():
                links.append({'path': path.relative_to(tree).as_posix(), 'target': os.readlink(path)})
        dirs[:] = [d for d in dirs if not (pathlib.Path(current) / d).is_symlink()]
    return sorted(links, key=lambda row: row['path'])


def check_external(row: dict) -> None:
    root = pathlib.Path(row['external_dependency_root'])
    assert root == pathlib.Path('/Users/zacheryspector/The-Movies-headless-program') and root.is_dir()
    links = row['symlinks']
    assert len(links) == len(row['external_dependencies']) == 15
    link_targets = {link['path']: link['target'] for link in links}
    assert set(link_targets) == {dep['path'] for dep in row['external_dependencies']}
    for dep in row['external_dependencies']:
        assert link_targets[dep['path']] == dep['target']
        target = pathlib.Path(dep['target'])
        assert target.is_absolute() and (target == root or root in target.parents)
        assert target.exists(), f'external live-repo dependency missing: {target}'
        assert ('directory' if target.is_dir() else 'file') == dep['kind']


def verify_row(root: pathlib.Path, row: dict) -> dict:
    unit = row['unit']
    assert unit in ('x2', 'x3') and row['status'] == 'clean'
    check_external(row)
    extras = root / unit / 'IGNORED-EXTRAS.tar.gz'
    assert row['extras']['name'] == extras.name and extras.is_file() and not extras.is_symlink()
    assert extras.stat().st_size == row['extras']['bytes'] <= SEGMENT_BYTES
    assert digest(extras) == row['extras']['sha256']
    audit_extras(extras, row['ignored_inventory'])
    exclude = root / unit / 'INFO-EXCLUDE'
    assert exclude.is_file() and not exclude.is_symlink()
    assert exclude.stat().st_size == row['info_exclude']['bytes'] <= SEGMENT_BYTES
    assert digest(exclude) == row['info_exclude']['sha256']
    parts = row['bundle']['segments']
    assert parts and all(0 < p['bytes'] <= SEGMENT_BYTES for p in parts)

    with tempfile.TemporaryDirectory(prefix=f'1361-{unit}-restore-') as temp:
        tmp = pathlib.Path(temp)
        bundle = tmp / 'COMPLETE.bundle'
        with bundle.open('wb') as sink:
            for index, part in enumerate(parts, 1):
                assert part['name'] == f'COMPLETE.bundle.part-{index:04d}'
                p = root / unit / part['name']
                assert p.is_file() and not p.is_symlink() and p.stat().st_size == part['bytes']
                assert digest(p) == part['sha256']
                with p.open('rb') as stream:
                    for block in iter(lambda: stream.read(1024 * 1024), b''):
                        sink.write(block)
        assert bundle.stat().st_size == row['bundle']['bytes']
        assert digest(bundle) == row['bundle']['sha256']
        with bundle.open('rb') as stream:
            header = stream.readline()
            assert header.startswith(b'# v') and b'git bundle' in header
            while True:
                line = stream.readline()
                assert line
                if line == b'\n':
                    break
                assert not line.startswith(b'-'), 'bundle has external prerequisites'
        bare = tmp / 'empty.git'
        run('git', 'init', '--bare', '-q', str(bare))
        run('git', '-C', str(bare), 'bundle', 'verify', str(bundle))
        checkout = tmp / 'checkout'
        run('git', 'clone', '-q', str(bundle), str(checkout))
        run('git', '-C', str(checkout), 'fsck', '--full', '--no-reflogs')
        actual_refs = dict(line.split(' ', 1) for line in run('git', '-C', str(checkout), 'for-each-ref', '--format=%(refname) %(objectname)', 'refs/heads', 'refs/tags').decode().splitlines())
        assert actual_refs == row['refs'], (unit, actual_refs)
        head = run('git', '-C', str(checkout), 'rev-parse', 'HEAD').decode().strip()
        tree = run('git', '-C', str(checkout), 'rev-parse', 'HEAD^{tree}').decode().strip()
        assert (head, tree) == (row['head'], row['tree'])
        (checkout / '.git' / 'info' / 'exclude').write_bytes(exclude.read_bytes())
        restore_extras(extras, checkout, row['ignored_inventory'])
        assert run('git', '-C', str(checkout), 'status', '--porcelain=v1', '-z', '--untracked-files=all') == b''
        ignored_status = run('git', '-C', str(checkout), 'status', '--ignored', '--porcelain=v1', '-z').split(b'\0')
        assert ignored_status[-1] == b''
        roots = sorted(os.fsdecode(item[3:]).rstrip('/') for item in ignored_status[:-1] if item.startswith(b'!! '))
        assert len(roots) == len(ignored_status) - 1 and roots == row['ignored_roots']
        assert inventory(checkout, roots) == row['ignored_inventory']
        assert links_in(checkout) == row['symlinks']
        check_external(row)
        return {'unit': unit, 'head': head, 'tree': tree,
                'bundle_sha256': row['bundle']['sha256'], 'extras_sha256': row['extras']['sha256'],
                'restored_clean_checkout': True, 'ignored_entries': len(row['ignored_inventory']),
                'absolute_live_repo_links': len(row['symlinks']), 'result': 'PASS'}


def main() -> None:
    if sys.flags.optimize:
        raise RuntimeError('run verifier with assertions enabled (without -O or PYTHONOPTIMIZE)')
    parser = argparse.ArgumentParser()
    parser.add_argument('--archive', required=True, type=pathlib.Path)
    args = parser.parse_args()
    root = args.archive.resolve()
    manifest_path = root / 'MANIFEST.json'
    manifest = json.loads(manifest_path.read_text())
    assert manifest['format'] == '1361-sweep-complete-bundles-v2'
    assert [r['unit'] for r in manifest['rows']] == ['x2', 'x3']
    print(json.dumps({'manifest_sha256': digest(manifest_path), 'rows': [verify_row(root, r) for r in manifest['rows']]}, indent=2, sort_keys=True))


if __name__ == '__main__':
    main()
