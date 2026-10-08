#!/usr/bin/env python3
"""DRAFT map builder only. Requires a separately frozen exact source spec after capture/archive acceptance."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess

S = Path('/Users/zacheryspector/studio-scratch')
R = Path('/Users/zacheryspector/The-Movies-headless-program')
P = S / '1370-r12-e0g-adoption-publication-plan-r1'
BASE = '343644e8615b730c11a4683f95ea06e3e15fde7e'
HEAD = 'b995a83e5363a3843f9b902e08c2df4dd95840cb'
TREE = '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
REF = 'refs/heads/evidence/1370-r10-clean-captures'
DEST = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-stage/thirty-second-verification/'
D = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW
F = os.O_RDONLY | os.O_NOFOLLOW

def stop(message):
    raise RuntimeError('STOP: ' + message)

def run(*args):
    return subprocess.check_output(args, cwd=R, text=True).strip()

def directory(path):
    if not path.is_absolute(): stop('relative control path')
    fd = os.open('/', D)
    try:
        for name in path.parts[1:]:
            nxt = os.open(name, D, dir_fd=fd)
            os.close(fd); fd = nxt
        return fd
    except BaseException:
        os.close(fd); raise

def regular_info(path):
    parent = directory(path.parent)
    try:
        st = os.stat(path.name, dir_fd=parent, follow_symlinks=False)
        if not stat.S_ISREG(st.st_mode): stop('nonregular source: ' + str(path))
        fd = os.open(path.name, F, dir_fd=parent)
        try:
            opened = os.fstat(fd)
            attrs = lambda x: (x.st_dev, x.st_ino, x.st_mode, x.st_size, x.st_mtime_ns, x.st_ctime_ns)
            if attrs(st) != attrs(opened): stop('source changed: ' + str(path))
            return opened.st_size
        finally: os.close(fd)
    finally: os.close(parent)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--spec-sha256', required=True)
    ap.add_argument('--expected-files', required=True, type=int)
    ap.add_argument('--expected-bytes', required=True, type=int)
    args = ap.parse_args()
    spec = P / 'SOURCES.json'
    out = P / 'MAP.json'
    if os.path.lexists(out): stop('map output exists')
    if run('git', 'rev-parse', 'HEAD') != HEAD or run('git', 'rev-parse', 'HEAD:src') != TREE:
        stop('production source moved')
    if run('git', 'status', '--porcelain'): stop('production worktree dirty')
    if run('git', 'rev-parse', REF) != BASE or run('git', 'ls-remote', 'origin', REF).split()[0] != BASE:
        stop('evidence branch moved')
    pfd = directory(P)
    try:
        named_before = os.stat(spec.name, dir_fd=pfd, follow_symlinks=False)
        fd = os.open(spec.name, F, dir_fd=pfd)
        try:
            st = os.fstat(fd)
            attrs = lambda x: (x.st_dev, x.st_ino, x.st_mode, x.st_size, x.st_mtime_ns, x.st_ctime_ns)
            if not stat.S_ISREG(st.st_mode) or st.st_size > 1024 * 1024 or attrs(st) != attrs(named_before): stop('bad source spec')
            raw = b''
            while chunk := os.read(fd, 65536):
                raw += chunk
                if len(raw) > 1024 * 1024: stop('oversize source spec')
            named_after = os.stat(spec.name, dir_fd=pfd, follow_symlinks=False)
            if attrs(st) != attrs(os.fstat(fd)) or attrs(st) != attrs(named_after): stop('source spec changed during read')
            if hashlib.sha256(raw).hexdigest() != args.spec_sha256: stop('source spec SHA mismatch')
            data = json.loads(raw)
        finally: os.close(fd)
    finally: os.close(pfd)
    if data.get('schema') != '1370-r12-e0g-adoption-stage32-source-spec-r1' or data.get('baseEvidenceCommit') != BASE:
        stop('wrong source spec')
    rows = data.get('files')
    if not isinstance(rows, list) or len(rows) != args.expected_files: stop('wrong source count')
    seen = set(); mapped = []
    for row in rows:
        source = Path(row['source']); target = row['destination']
        if not source.is_absolute() or not source.is_relative_to(S) or any(part in ('.', '..') for part in source.parts): stop('source outside scratch')
        if (not isinstance(target, str) or not target.startswith(DEST) or
            any(part in ('', '.', '..') for part in target.removeprefix(DEST).split('/'))):
            stop('bad destination')
        if target in seen: stop('duplicate destination')
        seen.add(target)
        mapped.append({'source': str(source), 'destination': target, 'bytes': regular_info(source)})
    if sum(x['bytes'] for x in mapped) != args.expected_bytes: stop('wrong byte total')
    result = {'schema': '1370-r12-e0g-adoption-publication-map-r1',
              'baseEvidenceCommit': BASE, 'sourceHead': HEAD, 'files': sorted(mapped, key=lambda x: x['destination'])}
    raw = (json.dumps(result, sort_keys=True, indent=2) + '\n').encode()
    pfd = directory(P)
    try:
        fd = os.open(out.name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=pfd)
        try:
            pos = 0
            while pos < len(raw): pos += os.write(fd, raw[pos:])
            os.fsync(fd)
        finally: os.close(fd)
        os.fsync(pfd)
    finally: os.close(pfd)
    print(json.dumps({'status': 'MAP_ONLY', 'files': len(mapped), 'bytes': args.expected_bytes,
                      'mapSha256': hashlib.sha256(raw).hexdigest()}, sort_keys=True))

if __name__ == '__main__': main()
