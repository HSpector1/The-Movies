#!/usr/bin/env python3
"""Independent streaming readback and deterministic rebuild of failed r10 leaf."""
import hashlib
import json
import lzma
import os
import shutil
import stat
import subprocess
import sys
import tarfile
from pathlib import Path

SOURCE = Path('/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-recorded-r10/ag-adoption-clean-r10-ag-adoption-20261007-224614')
PACKAGE = Path('/Users/zacheryspector/studio-scratch/1370-r10-clean-evidence-worktree/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-stage/twenty-seventh-verification/ag-adoption-r10-failure-r2')
REBUILD_PARENT = Path('/Users/zacheryspector/studio-scratch/1370-r10-ag-adoption-observed-review-r2/rebuild-parent')
REBUILD_NAME = 'rebuild-r2'
CHUNK = 1024 * 1024


def digest_file(path):
    h = hashlib.sha256()
    n = 0
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        if not stat.S_ISREG(os.fstat(fd).st_mode):
            raise RuntimeError(f'not regular {path}')
        with os.fdopen(fd, 'rb') as f:
            for block in iter(lambda: f.read(CHUNK), b''):
                h.update(block)
                n += len(block)
    except Exception:
        try: os.close(fd)
        except OSError: pass
        raise
    return n, h.hexdigest()


def inventory(root):
    result = []
    def walk(path, rel):
        st = path.lstat()
        entry = {'path': rel, 'mode': stat.S_IMODE(st.st_mode), 'dev': st.st_dev,
                 'ino': st.st_ino, 'mtimeNs': st.st_mtime_ns, 'ctimeNs': st.st_ctime_ns}
        if stat.S_ISDIR(st.st_mode):
            entry.update(kind='directory', size=0)
        elif stat.S_ISLNK(st.st_mode):
            target = os.readlink(path)
            raw = os.fsencode(target)
            entry.update(kind='symlink', target=target, size=len(raw), sha256=hashlib.sha256(raw).hexdigest())
        elif stat.S_ISREG(st.st_mode):
            n, h = digest_file(path)
            entry.update(kind='file', size=n, sha256=h)
            if rel.endswith('/boundaries.ndjson'):
                rows = 0
                last = None
                pending = b''
                fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
                with os.fdopen(fd, 'rb') as f:
                    for block in iter(lambda: f.read(CHUNK), b''):
                        data = pending + block
                        parts = data.split(b'\n')
                        if len(parts) > 1:
                            rows += len(parts) - 1
                            last = parts[-2]
                        pending = parts[-1]
                if pending:
                    raise RuntimeError('boundary last line incomplete')
                if rows != 365 or not last.startswith(b'{"boundary":364,"week":364,'):
                    raise RuntimeError('boundary rows/weeks mismatch')
                entry.update(completeRows=rows, lastWeek=364)
        else:
            raise RuntimeError(f'unsupported source type {path}')
        result.append(entry)
        if entry['kind'] == 'directory':
            for child in sorted(path.iterdir(), key=lambda p: os.fsencode(p.name)):
                walk(child, rel + '/' + child.name)
    if root.is_symlink() or not root.is_dir():
        raise RuntimeError('source root absent/symlink')
    walk(root, root.name)
    return result


class CountingReader:
    def __init__(self, f):
        self.f = f
        self.n = 0
        self.h = hashlib.sha256()
    def read(self, size=-1):
        if size < 0 or size > CHUNK: size = CHUNK
        data = self.f.read(size)
        self.n += len(data)
        if self.n > 1075496960:
            raise RuntimeError('decompressed tar exceeded manifest size')
        self.h.update(data)
        return data


def verify():
    manifest = json.loads((PACKAGE / 'MANIFEST.json').read_bytes())
    members = json.loads((PACKAGE / 'MEMBERS.json').read_bytes())
    assert manifest['schema'] == members['schema'] == '1370-r10-ag-adoption-failure-raw-archive-r2'
    assert manifest['classification'] == 'FAILED_RUN_BYTE_PRESERVATION_ONLY'
    assert members['disposition'] == 'FAILED_PARTIAL_CAPTURE'
    assert manifest['head'] == members['head'] == 'b995a83e5363a3843f9b902e08c2df4dd95840cb'
    assert manifest['source'] == members['source'] == str(SOURCE)
    assert not (SOURCE / 'summary.json').exists()
    assert manifest['summaryPresent'] is False and manifest['resultStatus'] == 'STAGE_OR_GUARD_FAILURE'
    assert manifest['memberCount'] == len(members['members']) == 223
    assert manifest['counts'] == {'file':208, 'directory':14, 'symlink':1}
    assert manifest['logicalBytes'] == sum(e['size'] for e in members['members'])
    assert manifest['boundaries'] == {'bytes':1069911027,'completeRows':365,'lastWeek':364,
                                    'sha256':'d8fef4ae3a56021778764c121fccd261621e50b6bcc8027819ef8ecd381ec12b'}
    for name in ('MEMBERS.json','build.py','EVIDENCE.tar.xz'):
        n, h = digest_file(PACKAGE / name)
        assert (n,h) == (manifest['files'][name]['bytes'],manifest['files'][name]['sha256']), name
    assert manifest['files']['build.py']['sha256'] == '076a2034d6a30f11f37e69db3782a1b1f24045aa481fb447c574efb12e7a2c7f'
    total = sum(p.stat().st_size for p in PACKAGE.rglob('*') if p.is_file())
    assert total <= 256 * CHUNK, total
    source_items = inventory(SOURCE)
    assert source_items == members['members'], 'source inventory differs from MEMBERS.json'
    assert set(manifest['direct']) == {'LAUNCH.json','RESULT.json','RESULT.sha256.json','vitest.json','progress.ndjson','child.stdout.log','child.stderr.log'}
    for name, meta in manifest['direct'].items():
        src = digest_file(SOURCE / name)
        copied = digest_file(PACKAGE / 'DIRECT' / name)
        assert src == copied == (meta['bytes'],meta['sha256']), name
    result = json.loads((PACKAGE / 'DIRECT' / 'RESULT.json').read_bytes())
    seal = json.loads((PACKAGE / 'DIRECT' / 'RESULT.sha256.json').read_bytes())
    vitest = json.loads((PACKAGE / 'DIRECT' / 'vitest.json').read_bytes())
    assert result['status'] == 'STAGE_OR_GUARD_FAILURE' and result['stagePassed'] is False
    assert result['child']['exit'] == 1 and result['child']['timedOut'] is False
    assert seal['sha256'] == manifest['direct']['RESULT.json']['sha256']
    assert vitest['success'] is False and vitest['numTotalTests'] == 1
    assert vitest['numPassedTests'] == 0 and vitest['numFailedTests'] == 1
    failures = [m for suite in vitest['testResults'] for a in suite['assertionResults'] for m in a['failureMessages']]
    assert len(failures) == 1 and 'complete captures exceed 1 GiB' in failures[0]
    with lzma.open(PACKAGE / 'EVIDENCE.tar.xz', 'rb') as xz:
        reader = CountingReader(xz)
        with tarfile.open(fileobj=reader, mode='r|') as tar:
            for expected in members['members']:
                info = tar.next()
                assert info is not None, f'missing tar member {expected["path"]}'
                assert info.name == expected['path'], (info.name,expected['path'])
                assert info.uid == info.gid == 0 and info.uname == info.gname == '' and info.mtime == 0
                assert info.mode == expected['mode']
                assert set(info.pax_headers).issubset({'path','linkpath'})
                if 'path' in info.pax_headers:
                    assert info.pax_headers['path'] == expected['path']
                if 'linkpath' in info.pax_headers:
                    assert info.pax_headers['linkpath'] == expected.get('target')
                if expected['kind'] == 'directory':
                    assert info.isdir() and info.size == 0
                elif expected['kind'] == 'symlink':
                    assert info.issym() and info.linkname == expected['target'] and info.size == 0
                else:
                    assert info.isfile() and info.size == expected['size']
                    h = hashlib.sha256()
                    n = 0
                    f = tar.extractfile(info)
                    for block in iter(lambda: f.read(CHUNK), b''):
                        n += len(block)
                        h.update(block)
                    assert (n,h.hexdigest()) == (expected['size'],expected['sha256']), info.name
            assert tar.next() is None, 'extra tar member'
        for block in iter(lambda: reader.read(CHUNK), b''):
            pass
        assert reader.n == manifest['files']['EVIDENCE.tar.xz']['tarBytes']
        assert reader.h.hexdigest() == manifest['files']['EVIDENCE.tar.xz']['tarSha256']
    subprocess.run(['xz','-t',str(PACKAGE / 'EVIDENCE.tar.xz')], check=True)
    # Rebuild into an isolated scratch child using only rewritten absolute destination constants.
    assert not REBUILD_PARENT.exists(), 'rebuild parent already exists'
    REBUILD_PARENT.mkdir()
    script = (PACKAGE / 'build.py').read_text()
    old_parent = "OUTPUT_PARENT = Path('/Users/zacheryspector/studio-scratch/1370-r10-clean-evidence-worktree/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-stage/twenty-seventh-verification')"
    old_name = "OUTPUT_NAME = 'ag-adoption-r10-failure-r2'"
    assert script.count(old_parent) == script.count(old_name) == 1
    script = script.replace(old_parent, f"OUTPUT_PARENT = Path('{REBUILD_PARENT}')")
    script = script.replace(old_name, f"OUTPUT_NAME = '{REBUILD_NAME}'")
    rebuilt_script = REBUILD_PARENT / 'build-replay.py'
    rebuilt_script.write_text(script)
    subprocess.run([sys.executable,'-I','-B',str(rebuilt_script),'--output-dir',str(REBUILD_PARENT / REBUILD_NAME)],check=True)
    rebuilt = REBUILD_PARENT / REBUILD_NAME / 'EVIDENCE.tar.xz'
    assert digest_file(rebuilt) == digest_file(PACKAGE / 'EVIDENCE.tar.xz'), 'rebuild archive bytes differ'
    summary = {'status':'ACCEPT_FAILED_RUN_BYTE_PRESERVATION_ONLY',
               'archive': {'bytes':manifest['files']['EVIDENCE.tar.xz']['bytes'], 'sha256':manifest['files']['EVIDENCE.tar.xz']['sha256'],
                           'tarBytes':reader.n,'tarSha256':reader.h.hexdigest()},
               'memberCount':len(source_items),'counts':manifest['counts'],
               'packageBytes':total,'deterministicRebuild':True,
               'boundaryRows':365,'lastWeek':364,'summaryPresent':False,'childExit':1}
    (Path(__file__).parent / 'OBSERVED.json').write_text(json.dumps(summary,sort_keys=True,indent=2)+'\n')
    for base, dirs, files in os.walk(REBUILD_PARENT, topdown=False, followlinks=False):
        for d in dirs:
            path = Path(base) / d
            if not path.is_symlink():
                path.chmod(path.stat().st_mode | stat.S_IWUSR)
    shutil.rmtree(REBUILD_PARENT)
    print(json.dumps(summary,sort_keys=True))

if __name__ == '__main__':
    verify()
