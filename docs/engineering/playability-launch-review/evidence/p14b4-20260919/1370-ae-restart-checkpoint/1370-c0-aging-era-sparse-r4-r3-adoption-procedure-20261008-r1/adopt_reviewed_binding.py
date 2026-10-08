#!/usr/bin/env python3
"""One-shot r3 binding adoption. Prepared only; do not run before independent review."""

import hashlib
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess


SCRATCH = Path('/Users/zacheryspector/studio-scratch')
REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
DRAFT = SCRATCH / '1370-c0-aging-era-sparse-materializer-r4-exact-draft-20261008-r3'
ARCHIVE = SCRATCH / '1370-c0-aging-era-sparse-r4-r3-pre-adoption-archive-20261008-r1'
HERE = Path(__file__).resolve().parent
BINDING = DRAFT / 'BINDING-DRAFT.json'
ARCHIVE_MANIFEST = HERE / 'ARCHIVE-MANIFEST.json'
RESULT = HERE / 'ADOPTION-RESULT.json'
REVIEW = SCRATCH / '1370-c0-aging-era-sparse-materializer-r4-exact-independent-review-20261008-r3/RECEIPT.json'
HEAD = '5020e56e018c3acdeff6c93980ce05d31ac78847'
DRAFT_SHA = '81204ed08795e3541633109db8a1009b362aaaaaf5efb43da1585b41b3f2abc0'
CANDIDATE_SHA = '9889cdb261dc526abc8fb79826867dc1f54f0b97b6f7fe80bfe9d3f76b74953b'
SEMANTIC_SHA = 'f044d047fa62866ac7b8d8b0b6029b5653a4ebf08adbb9ad341a4eca08123fa4'
REVIEW_SHA = '96c77826d7e8504c42ec1385bc408567c7b273df8e633fe9376eb6b599f71b10'
EXCLUDED = {'status', 'executionAuthorization', 'exactBindingReviewPath',
            'exactBindingReviewSha256', 'exactBindingReviewDecision'}


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def read_regular_nofollow(path):
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        before = os.fstat(fd)
        assert stat.S_ISREG(before.st_mode) and before.st_nlink == 1, path
        with os.fdopen(os.dup(fd), 'rb') as stream:
            raw = stream.read()
        after = os.fstat(fd)
        assert (before.st_dev, before.st_ino, before.st_size,
                before.st_mtime_ns, before.st_ctime_ns) == (
                after.st_dev, after.st_ino, after.st_size,
                after.st_mtime_ns, after.st_ctime_ns), path
        return raw, before
    finally:
        os.close(fd)


def git(*args):
    return subprocess.check_output(['/usr/bin/git', '-c', 'gc.auto=0',
                                    '-c', 'maintenance.auto=0', '-C', str(REPO),
                                    *args], stderr=subprocess.PIPE)


def main():
    assert not RESULT.exists() and not RESULT.is_symlink(), 'one-shot result used'
    assert git('rev-parse', 'HEAD').decode().strip() == HEAD
    assert git('rev-parse', 'HEAD:src').decode().strip() == '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
    assert git('status', '--porcelain=v1', '-z', '--untracked-files=all') == b''
    assert git('diff', '--cached', '--name-only', '-z') == b''
    remote = subprocess.check_output(['/usr/bin/git', 'ls-remote', 'origin',
                                      'refs/heads/wip/headless-program-20260916-ts'],
                                     cwd=REPO, stderr=subprocess.PIPE).decode()
    assert remote == HEAD + '\trefs/heads/wip/headless-program-20260916-ts\n'
    assert shutil.disk_usage(SCRATCH).free >= 3 * 1024**3 + 128 * 1024**2 + 384 * 1024**2
    assert sha(read_regular_nofollow(REVIEW)[0]) == REVIEW_SHA
    review = json.loads(read_regular_nofollow(REVIEW)[0])
    assert review['decision'] == 'ACCEPT_EXACT_FILLED_UNRUN'
    assert review['reviewedDraftBindingSha256'] == DRAFT_SHA
    assert review['bindingSemanticSha256'] == SEMANTIC_SHA
    assert review['candidatePinsSha256'] == CANDIDATE_SHA
    assert review['sourcePinsSha256'] == 'f5e985ffe629d87a3292506c7506bbdc153d923e2fa5cafd1db445d3c5e11105'
    assert review['productionHead'] == HEAD

    manifest = json.loads(read_regular_nofollow(ARCHIVE_MANIFEST)[0])
    assert manifest['count'] == 7 and manifest['draftBindingSha256'] == DRAFT_SHA
    assert manifest['candidatePinsSha256'] == CANDIDATE_SHA
    assert manifest['bindingSemanticSha256'] == SEMANTIC_SHA
    assert ARCHIVE.is_dir() and not ARCHIVE.is_symlink() and (ARCHIVE.stat().st_mode & 0o777) == 0o700
    assert set(manifest['files']) == {p.name for p in ARCHIVE.iterdir()} == {p.name for p in DRAFT.iterdir()}
    for name, record in manifest['files'].items():
        archived, _ = read_regular_nofollow(ARCHIVE / name)
        original, _ = read_regular_nofollow(DRAFT / name)
        assert archived == original and sha(original) == record['sha256'] and len(original) == record['bytes'], name
    assert sha(read_regular_nofollow(DRAFT / 'CANDIDATE-PINS.json')[0]) == CANDIDATE_SHA

    old, identity = read_regular_nofollow(BINDING)
    assert sha(old) == DRAFT_SHA
    bound = json.loads(old)
    assert bound['status'] == 'DRAFT_UNREVIEWED_UNRUN' and bound['executionAuthorization'] is False
    assert all(bound[key] is None for key in EXCLUDED - {'status', 'executionAuthorization'})
    for key in ('outputRoot', 'scratchRoot', 'recorderLockPath'):
        p = Path(bound[key])
        assert not p.exists() and not p.is_symlink(), key
    lane = SCRATCH / '1370-c0-aging-era-sparse-r4-20261008-r3-lane'
    log = lane / 'materialize-r4-r3.lane.log'
    assert lane.is_dir() and not lane.is_symlink() and (lane.stat().st_mode & 0o777) == 0o700
    assert not log.exists() and not log.is_symlink()
    assert not Path(str(log) + '.meta').exists() and not Path(str(log) + '.meta').is_symlink()
    lock = SCRATCH / 'HEAVY-LANE-LOCK'
    assert not lock.exists() and not lock.is_symlink()

    semantic = {key: value for key, value in bound.items() if key not in EXCLUDED}
    assert sha(json.dumps(semantic, sort_keys=True, separators=(',', ':')).encode()) == SEMANTIC_SHA
    assert semantic == json.loads(read_regular_nofollow(DRAFT / 'BINDING-SEMANTIC.json')[0])
    adopted = dict(bound)
    adopted.update(status='REVIEWED_FILLED_UNRUN', executionAuthorization=True,
                   exactBindingReviewPath=str(REVIEW), exactBindingReviewSha256=REVIEW_SHA,
                   exactBindingReviewDecision='ACCEPT_EXACT_FILLED_UNRUN')
    assert {key for key in bound if bound[key] != adopted[key]} == EXCLUDED
    new = (json.dumps(adopted, sort_keys=True, indent=2) + '\n').encode()
    new_sha = sha(new)

    # Exclusive same-directory staging makes the original path change atomically.
    # The one-lane no-external-renamer assumption is still a required operational gate.
    temp = DRAFT / '.BINDING-DRAFT.json.adopting'
    fd = os.open(temp, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    try:
        with os.fdopen(fd, 'wb') as stream:
            stream.write(new)
            stream.flush()
            os.fsync(stream.fileno())
        current, current_stat = read_regular_nofollow(BINDING)
        assert current == old and (current_stat.st_dev, current_stat.st_ino,
                                   current_stat.st_mtime_ns, current_stat.st_ctime_ns) == (
                                   identity.st_dev, identity.st_ino,
                                   identity.st_mtime_ns, identity.st_ctime_ns)
        assert sha(read_regular_nofollow(temp)[0]) == new_sha
        os.replace(temp, BINDING)
        directory_fd = os.open(DRAFT, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
        try:
            os.fsync(directory_fd)
        finally:
            os.close(directory_fd)
    finally:
        if temp.exists():
            temp.unlink()
    assert sha(read_regular_nofollow(BINDING)[0]) == new_sha
    assert {key: value for key, value in json.loads(read_regular_nofollow(BINDING)[0]).items()
            if key not in EXCLUDED} == semantic
    for name, record in manifest['files'].items():
        if name != 'BINDING-DRAFT.json':
            assert sha(read_regular_nofollow(DRAFT / name)[0]) == record['sha256'], name

    result = {'schema': '1370-c0-aging-era-sparse-r4-r3-binding-adoption-result-r1',
              'status': 'ADOPTED_UNRUN_PREFLIGHT_REQUIRED', 'bindingPath': str(BINDING),
              'oldBindingSha256': DRAFT_SHA, 'newBindingSha256': new_sha,
              'bindingSemanticSha256': SEMANTIC_SHA, 'changedFields': sorted(EXCLUDED),
              'fieldDiff': {key: {'before': bound[key], 'after': adopted[key]}
                            for key in sorted(EXCLUDED)},
              'reviewPath': str(REVIEW), 'reviewSha256': REVIEW_SHA,
              'archiveManifestPath': str(ARCHIVE_MANIFEST),
              'archiveManifestSha256': sha(read_regular_nofollow(ARCHIVE_MANIFEST)[0]),
              'claimLimit': 'Adoption only; no materialization or launch approval.'}
    output = (json.dumps(result, sort_keys=True, indent=2) + '\n').encode()
    fd = os.open(RESULT, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, 'wb') as stream:
        stream.write(output)
        stream.flush()
        os.fsync(stream.fileno())
    directory_fd = os.open(HERE, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        os.fsync(directory_fd)
    finally:
        os.close(directory_fd)
    print(json.dumps({'status': result['status'], 'newBindingSha256': new_sha,
                      'adoptionResultSha256': sha(output)}, sort_keys=True))


if __name__ == '__main__':
    main()
