#!/usr/bin/env python3
"""Build a closed, pinned, deterministic exploratory evidence bundle."""
import argparse
import gzip
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import tarfile
import tempfile

SHA = re.compile(r'^[0-9a-f]{64}$')
LEAVES = ('C0-types-source-r1', 'ABC-types-source-r1',
          'C0-clean-adoption-r1', 'ABC-clean-adoption-r1')
REVIEWS = ('extended', 'types', 'c0-clean', 'abc-clean', 'comparator-code', 'pair')
FORMAL_SUFFIXES = ('-preflight.json', '.json', '.patch', '.txt', '-postflight.json')


def fail(message):
    raise ValueError(message)


def safe_name(name):
    if not isinstance(name, str) or not name or '\\' in name or '\x00' in name:
        fail(f'unsafe member name: {name!r}')
    p = PurePosixPath(name)
    if p.is_absolute() or any(part in ('', '.', '..') for part in name.split('/')) or str(p) != name:
        fail(f'unsafe member name: {name!r}')
    return name


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read_regular(path):
    p = Path(path)
    if not p.is_absolute():
        fail(f'source path must be absolute: {path}')
    # Reject symlinks in every component, including the final component.
    cur = Path(p.anchor)
    for part in p.parts[1:]:
        cur /= part
        if stat.S_ISLNK(os.lstat(cur).st_mode):
            fail(f'symlink source: {cur}')
    fd = os.open(p, os.O_RDONLY | getattr(os, 'O_NOFOLLOW', 0))
    try:
        before = os.fstat(fd)
        if not stat.S_ISREG(before.st_mode):
            fail(f'nonregular source: {p}')
        with os.fdopen(fd, 'rb', closefd=False) as stream:
            data = stream.read()
        after = os.fstat(fd)
        if (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) != (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns):
            fail(f'source changed while reading: {p}')
        return data
    finally:
        os.close(fd)


def verify_tar(path, expected):
    seen = set()
    with tarfile.open(path, 'r:gz') as archive:
        for member in archive:
            safe_name(member.name)
            if member.name in seen:
                fail(f'duplicate tar member: {member.name}')
            seen.add(member.name)
            if not member.isfile() or member.type != tarfile.REGTYPE or member.linkname:
                fail(f'nonregular tar member: {member.name}')
            if member.name not in expected:
                fail(f'unexpected tar member: {member.name}')
            contents = archive.extractfile(member)
            if contents is None:
                fail(f'unreadable tar member: {member.name}')
            data = contents.read()
            record = expected[member.name]
            if len(data) != record['bytes'] or digest(data) != record['sha256'] or member.size != len(data):
                fail(f'tar readback mismatch: {member.name}')
    if seen != set(expected):
        fail(f'missing tar members: {sorted(set(expected) - seen)}')


def validate_contract(pins):
    if pins.get('classification') != 'EXPLORATORY_NOT_ACCEPTANCE':
        fail('classification must be EXPLORATORY_NOT_ACCEPTANCE')
    files = pins.get('files')
    if not isinstance(files, dict) or not files:
        fail('files must be a nonempty member-to-pin mapping')
    for name, entry in files.items():
        safe_name(name)
        if not isinstance(entry, dict) or set(entry) != {'source', 'sha256', 'bytes'}:
            fail(f'file pin requires source, sha256, bytes: {name}')
        if not SHA.fullmatch(entry['sha256']) or type(entry['bytes']) is not int or entry['bytes'] < 0:
            fail(f'invalid SHA/byte pin: {name}')
    results = pins.get('results')
    if not isinstance(results, dict) or set(results) != set(LEAVES):
        fail('four exact RESULT pins are required')
    for leaf in LEAVES:
        name = f'runs/{leaf}/RESULT.json'
        if results[leaf] != files.get(name, {}).get('sha256'):
            fail(f'RESULT pin mismatch: {leaf}')
    reviews = pins.get('reviews')
    if not isinstance(reviews, dict) or set(reviews) != set(REVIEWS):
        fail('all six exact review pins are required')
    for key, pair in reviews.items():
        if not isinstance(pair, dict) or set(pair) != {'review', 'receipt'}:
            fail(f'review and receipt pins required: {key}')
        for kind, sha in pair.items():
            name = f'reviews/{key}/REVIEW.md' if kind == 'review' else f'reviews/{key}/RECEIPT.json'
            if files.get(name, {}).get('sha256') != sha:
                fail(f'review pin mismatch: {key}/{name}')
    critical = pins.get('critical')
    if not isinstance(critical, dict) or not critical:
        fail('critical path/SHA pins are required')
    for name, sha in critical.items():
        if files.get(name, {}).get('sha256') != sha:
            fail(f'critical pin mismatch: {name}')
    for name in ('package/MANIFEST.json', 'package/runner/run.py',
                 'comparator/compare.py', 'comparison/adoption-pins.json',
                 'comparison/REPORT.json', 'static-check.json'):
        if name not in critical:
            fail(f'missing critical pin: {name}')
    for leaf in LEAVES:
        for name in ('CHILD.json', 'LAUNCH.json', 'binding.json', 'stdout.txt',
                     'stderr.txt', 'power.json'):
            if f'runs/{leaf}/{name}' not in files:
                fail(f'missing leaf file: {leaf}/{name}')
        if 'clean-adoption' in leaf:
            for name in ('data.json', 'vitest.json', 'progress.jsonl'):
                if f'runs/{leaf}/{name}' not in files:
                    fail(f'missing clean leaf file: {leaf}/{name}')
        arm, mode = leaf.split('-', 1)
        lane_mode = 'types' if mode.startswith('types') else 'clean'
        lane_base = f'1369-adoption-{arm.lower()}-{lane_mode}-r1.log'
        for suffix in ('', '.meta'):
            name = f'lane/{lane_base}{suffix}'
            if name not in critical:
                fail(f'missing lane pin: {name}')
        formal_base = f'1369-adoption-clean-exploratory-720-750-r1-{arm.lower()}-{mode}'
        for suffix in FORMAL_SUFFIXES:
            name = f'formal/{formal_base}{suffix}'
            if name not in critical:
                fail(f'missing formal pin: {name}')
    if pins.get('git_reference') != 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1369-A-adoption-timeout-and-observed-cap-amendment.md':
        fail('exact 1369-A Git reference required')
    return files


def build(pins_path, output_dir):
    pins = json.loads(read_regular(str(Path(pins_path).resolve())))
    files = validate_contract(pins)
    data = {}
    for name, entry in sorted(files.items()):
        blob = read_regular(entry['source'])
        if len(blob) != entry['bytes'] or digest(blob) != entry['sha256']:
            fail(f'source pin mismatch: {name}')
        data[name] = blob
    # Results themselves bind formal artifacts by absolute source path and SHA/length.
    for leaf in LEAVES:
        result = json.loads(data[f'runs/{leaf}/RESULT.json'])
        if result.get('classification') != pins['classification']:
            fail(f'classification mismatch: {leaf}')
        artifacts = result.get('artifacts', {})
        arm, mode = leaf.split('-', 1)
        prefix = f'1369-adoption-clean-exploratory-720-750-r1-{arm.lower()}-{mode}'
        for suffix in FORMAL_SUFFIXES:
            name = f'formal/{prefix}{suffix}'
            entry = files[name]
            if artifacts.get(entry['source']) != {'sha256': entry['sha256'], 'bytes': entry['bytes']}:
                fail(f'formal artifact does not match RESULT: {name}')
        for name, entry in files.items():
            if name.startswith(f'runs/{leaf}/') and not name.endswith('/RESULT.json'):
                if artifacts.get(entry['source']) != {'sha256': entry['sha256'], 'bytes': entry['bytes']}:
                    fail(f'leaf artifact does not match RESULT: {name}')
    for leaf in LEAVES:
        arm, mode = leaf.split('-', 1)
        lane_mode = 'types' if mode.startswith('types') else 'clean'
        lane_base = f'1369-adoption-{arm.lower()}-{lane_mode}-r1.log'
        meta = data[f'lane/{lane_base}.meta'].decode('utf-8')
        if 'end, exit 0;' not in meta.splitlines()[-1]:
            fail(f'lane wrapper did not close cleanly: {lane_base}')
        log_lines = data[f'lane/{lane_base}'].decode('utf-8').splitlines()
        if not log_lines:
            fail(f'empty lane log: {lane_base}')
        final = json.loads(log_lines[-1])
        if final.get('receiptSha256') != pins['results'][leaf] or final.get('actualChildExit') != 0 or final.get('timedOut') is not False:
            fail(f'lane final RESULT/child mismatch: {lane_base}')
    out = Path(output_dir)
    if out.exists():
        fail(f'output already exists: {out}')
    if not out.parent.is_dir():
        fail(f'output parent missing: {out.parent}')
    out.mkdir(mode=0o700)
    tar_path = out / 'evidence.tar.gz'
    try:
        with tar_path.open('wb') as raw:
            with gzip.GzipFile(filename='', mode='wb', fileobj=raw, mtime=0, compresslevel=9) as gz:
                with tarfile.open(fileobj=gz, mode='w', format=tarfile.PAX_FORMAT) as archive:
                    for name, blob in data.items():
                        info = tarfile.TarInfo(name)
                        info.size = len(blob)
                        info.mode = 0o644
                        info.uid = info.gid = info.mtime = 0
                        info.uname = info.gname = ''
                        archive.addfile(info, io.BytesIO(blob))
        members = {name: {'sha256': files[name]['sha256'], 'bytes': files[name]['bytes'],
                          'source': files[name]['source']} for name in data}
        verify_tar(tar_path, members)
        manifest = {'format': '1369-evidence-archive-v1', 'classification': pins['classification'],
                    'git_reference': pins['git_reference'], 'results': pins['results'],
                    'reviews': pins['reviews'], 'critical': pins['critical'],
                    'tar_sha256': digest(read_regular(str(tar_path.resolve()))), 'members': members}
        (out / 'MANIFEST.json').write_text(json.dumps(manifest, sort_keys=True, indent=2) + '\n')
        (out / 'SCOPE.md').write_text('# 1369 exploratory evidence archive\n\n'
            'Classification: EXPLORATORY_NOT_ACCEPTANCE. The 720/750 clean leaves and '
            'descriptive comparator are exploratory. They do not establish observed or protected acceptance, '
            'individual intervention causality, or 1363 closure. Four C0 protected digests differ.\n\n'
            'All tar members are regular files, pinned by SHA-256 and byte count in MANIFEST.json. '
            'Absolute source paths in raw records are historical provenance. The package node_modules '
            'symlinks are excluded; toolchain entrypoint hashes remain in RESULT pins. '
            'Historical R8/arm04/r4/r5/r7 archives remain linked by immutable Git references, '
            'rather than copied here. The 1369-A reference is recorded in MANIFEST.json.\n')
        return manifest
    except BaseException:
        for child in out.iterdir():
            child.unlink()
        out.rmdir()
        raise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pins', required=True, help='reviewed JSON with every exact member SHA/byte/source pin')
    parser.add_argument('--out', required=True, help='new scratch output directory')
    args = parser.parse_args()
    result = build(args.pins, args.out)
    print(json.dumps({'tar_sha256': result['tar_sha256'], 'members': len(result['members'])}, sort_keys=True))


if __name__ == '__main__':
    main()
