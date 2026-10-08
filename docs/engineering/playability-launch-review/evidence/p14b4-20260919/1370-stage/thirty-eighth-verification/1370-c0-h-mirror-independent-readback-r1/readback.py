#!/usr/bin/env python3
"""Read-only, bounded independent H mirror byte and mode audit."""
import hashlib, json, os, pathlib, shutil, signal, stat, subprocess, time

S = pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO = pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
MIRROR = S / '1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1'
RESULT = MIRROR.parent / '20261008-h-types-r1.MATERIALIZE-RESULT.json'
MANIFEST = S / '1370-c0-h-m0-corrected-overlay-source-manifest-r2/H-SOURCE-MANIFEST.json'
OUT = S / '1370-c0-h-mirror-independent-readback-r1/READBACK.json'
H = '8708d6a98e6eb4ad53e3a54e431c4b40b974f79d'
PROD = 'f8c0628739227accfa446276b0613f47bc805a78'
SRC = '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
REF = 'refs/heads/wip/headless-program-20260916-ts'
WALL = 600
START = time.monotonic()
FLOOR = 3 * 1024**3
signal.signal(signal.SIGALRM, lambda *_: (_ for _ in ()).throw(TimeoutError('600-second readback')))
signal.setitimer(signal.ITIMER_REAL, WALL)

def need(ok, msg):
    if not ok: raise RuntimeError(msg)

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def guard():
    need(time.monotonic() - START < WALL, 'readback deadline')
    need(shutil.disk_usage(S).free >= FLOOR, '3 GiB floor')
    lock = S / 'HEAVY-LANE-LOCK'
    need(lock.is_file() and 'c0-h-mirror-readback-r1.lane.log' in lock.read_text(), 'sole lane')

def git(*args):
    guard()
    p = subprocess.run(['git', *args], cwd=REPO, capture_output=True,
                       timeout=max(1, WALL - (time.monotonic() - START)))
    need(p.returncode == 0, f'git failed {args!r}: {p.stderr[-500:]!r}')
    return p.stdout

def source_guard():
    need(git('rev-parse', 'HEAD').strip().decode() == PROD, 'production HEAD')
    need(git('rev-parse', 'HEAD:src').strip().decode() == SRC, 'production src')
    need(git('status', '--porcelain=v1') == b'', 'production dirty')
    need(git('ls-remote', 'origin', REF).strip().decode() == PROD+'\t'+REF, 'remote production')

def attrs(st):
    return st.st_dev, st.st_ino, st.st_mode, st.st_nlink, st.st_size, st.st_mtime_ns, st.st_ctime_ns

def read_file(path, size):
    before = path.lstat()
    need(stat.S_ISREG(before.st_mode) and before.st_nlink == 1 and before.st_size == size,
         f'unsafe file {path}')
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        need(attrs(os.fstat(fd)) == attrs(before), f'open drift {path}')
        sha1 = hashlib.sha1()
        sha1.update(f'blob {size}\0'.encode())
        sha256 = hashlib.sha256()
        count = 0
        while True:
            guard()
            chunk = os.read(fd, 1 << 20)
            if not chunk: break
            count += len(chunk)
            need(count <= size, f'oversize {path}')
            sha1.update(chunk); sha256.update(chunk)
        need(count == size and attrs(os.fstat(fd)) == attrs(before) == attrs(path.lstat()),
             f'file changed {path}')
        return sha1.hexdigest(), sha256.hexdigest(), stat.S_IMODE(before.st_mode)
    finally:
        os.close(fd)

def main():
    need(not OUT.exists(), 'one-shot result exists')
    guard()
    power = subprocess.check_output(['pmset', '-g', 'batt'], text=True, timeout=10)
    need(power.splitlines()[:1] == ["Now drawing from 'AC Power'"], 'AC power')
    source_guard()
    result = json.loads(RESULT.read_bytes())
    need(sha(RESULT) == 'b8c70f731fc730cea3ba7238674fb964fb973e6ffcf58fcb03e0dbbd139196b6', 'result SHA')
    need(result['status'] == 'MIRROR_MATERIALIZED_SOURCE_ONLY' and result['arm'] == 'H'
         and result['runId'] == '20261008-h-types-r1' and result['sourceCommit'] == H
         and result['sourceTree'] == '0ee21d8179977aaa0726ffb5d1b2bb2568c9df97', 'result authority')
    manifest = json.loads(MANIFEST.read_bytes())
    need(sha(MANIFEST) == 'e2f92aa60063b754f110ec31f08080bfd461f6a150f74394464739c2d4cab7ff', 'manifest SHA')
    need(result['sourceManifestSha256'] == sha(MANIFEST)
         and result['sourceReviewSha256'] == '5e6f23884af9527f991665020414404455f182cc3a62abe5a5602bb019804dbf', 'source review')
    need(stat.S_ISDIR(MIRROR.lstat().st_mode), 'mirror root type')
    raw = git('ls-tree', '-rl', '-z', H, 'src', 'tests', 'ui', 'package.json', 'package-lock.json',
              'tsconfig.json', 'tsconfig.src.json', 'vitest.config.ts', 'vitest.workspace.ts')
    base = {}
    for rec in raw.split(b'\0'):
        if not rec: continue
        header, name = rec.split(b'\t', 1)
        mode, kind, oid, size = header.decode().split()
        rel = name.decode()
        need(kind == 'blob' and mode in ('100644', '100755') and rel not in base, 'Git roster')
        base[rel] = (mode, oid, int(size))
    need(len(base) == 1342 and sum(v[2] for v in base.values()) == 98114949, 'base count/bytes')
    overlays = {x['destination']: x for x in manifest['files']}
    need(len(overlays) == 4 and result['overlayFiles'] == [
        {'bytes': x['bytes'], 'destination': x['destination'], 'sha256': x['sha256']}
        for x in manifest['files']], 'overlay result')
    expected = set(base) | set(overlays)
    actual = set()
    digest = hashlib.sha256()
    total = 0
    for root, dirs, files in os.walk(MIRROR, topdown=True, followlinks=False):
        dirs.sort(); files.sort()
        for d in dirs:
            p = pathlib.Path(root) / d
            rel_dir = p.relative_to(MIRROR).as_posix()
            need(stat.S_ISDIR(p.lstat().st_mode) and
                 any(e.startswith(rel_dir + '/') for e in expected),
                 f'extra/non-directory/symlink {p}')
        for name in files:
            p = pathlib.Path(root) / name
            rel = p.relative_to(MIRROR).as_posix()
            need(rel in expected and rel not in actual, f'extra/duplicate {rel}')
            mode, oid, size = base.get(rel, ('100644', None, overlays[rel]['bytes'])) if rel in overlays else base[rel]
            if rel in overlays: size = overlays[rel]['bytes']
            got_oid, got_sha, got_mode = read_file(p, size)
            need(got_mode == (0o644 if rel in overlays else (0o755 if mode == '100755' else 0o644)), f'mode {rel}')
            if rel in overlays: need(got_sha == overlays[rel]['sha256'], f'overlay SHA {rel}')
            else: need(got_oid == oid, f'Git blob OID {rel}')
            digest.update(json.dumps([rel, size, got_oid, got_sha, got_mode], separators=(',', ':')).encode()+b'\n')
            actual.add(rel); total += size
    need(actual == expected, 'missing mirror files')
    source_guard(); guard()
    power = subprocess.check_output(['pmset', '-g', 'batt'], text=True, timeout=10)
    need(power.splitlines()[:1] == ["Now drawing from 'AC Power'"], 'AC power postflight')
    out = {'decision': 'ACCEPT_OBSERVED_H_MIRROR_SOURCE_ONLY', 'runId': result['runId'],
           'sourceCommit': H, 'sourceTree': result['sourceTree'], 'materializerResultSha256': sha(RESULT),
           'baseFiles': len(base), 'baseBytes': sum(v[2] for v in base.values()),
           'overlayFiles': len(overlays), 'mirrorFiles': len(actual), 'mirrorBytes': total,
           'fileProofDigestSha256': digest.hexdigest(), 'elapsedSeconds': round(time.monotonic()-START, 3),
           'claimLimit': 'H source mirror only; no types, game, neutrality, 1363 or native acceptance'}
    with OUT.open('x') as f:
        json.dump(out, f, indent=2, sort_keys=True); f.write('\n'); f.flush(); os.fsync(f.fileno())
    signal.setitimer(signal.ITIMER_REAL, 0)
    print(json.dumps({'decision': out['decision'], 'receiptSha256': sha(OUT),
                      'mirrorFiles': len(actual), 'mirrorBytes': total}, sort_keys=True), flush=True)

if __name__ == '__main__': main()
