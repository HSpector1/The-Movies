#!/usr/bin/env python3
"""P13a evidence archive builder; static proposal, never run without independent review."""
import argparse
import hashlib
import json
import os
import re
import shutil
import signal
import stat
import subprocess
import tarfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SCRATCH = ROOT.parent
REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
DESIGN = SCRATCH/'1370-ebg-p13a-adoption-github-backup-design-r1'
DESIGN_REVIEW = SCRATCH/'1370-ebg-p13a-adoption-github-backup-independent-design-review-r1/RECEIPT.json'
STATIC_REVIEW = SCRATCH/'1370-ebg-p13a-archive-builder-independent-static-review-r1/RECEIPT.json'
OUTPUT_ROOT = SCRATCH/'1370-ebg-p13a-archive-builder-recorded-r1'
PART_BYTES = 67_108_864
EXPECTED_TAR_BYTES = 107_141_120
MAX_TAR_BYTES = 134_217_728
WALL_SECONDS = 300
MIN_FREE_BYTES = 3_489_660_928
RUNNING_FLOOR_BYTES = 3_221_225_472
HEAD = 'b97129610a07d3529fc482daeddc0cd9bf798713'
SRC_TREE = '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
LANE_LOG = '1370-ebg-p13a-archive-builder-<RUN_ID>.lane.log'

def sha(raw): return hashlib.sha256(raw).hexdigest()

def read_pinned(path, pin, limit):
    path = Path(path)
    st = path.lstat()
    assert stat.S_ISREG(st.st_mode) and st.st_nlink == 1 and st.st_size <= limit, f'unsafe/large: {path}'
    raw = path.read_bytes()
    assert len(raw) == st.st_size and sha(raw) == pin, f'hash drift: {path}'
    return raw

def git(*args):
    return subprocess.check_output(['git', *args], cwd=REPO, timeout=20, text=True).strip()

def source_guard(min_free):
    assert git('rev-parse','HEAD') == HEAD
    assert git('rev-parse','HEAD:src') == SRC_TREE
    assert git('status','--porcelain=v1') == ''
    branch = 'refs/heads/wip/headless-program-20260916-ts'
    assert git('ls-remote','--exit-code','origin',branch) == HEAD+'\t'+branch
    power = subprocess.check_output(['pmset','-g','batt'], timeout=5, text=True)
    assert "Now drawing from 'AC Power'" in power
    assert shutil.disk_usage(SCRATCH).free >= min_free

def source_stat(path, size):
    path = Path(path)
    assert path.is_absolute() and str(path).startswith(str(SCRATCH)+'/')
    for parent in path.parents:
        assert not parent.is_symlink(), f'symlink parent: {parent}'
    st = path.lstat()
    assert stat.S_ISREG(st.st_mode) and st.st_nlink == 1 and st.st_size == size, f'unsafe source: {path}'
    return st

class HashingReader:
    def __init__(self, path, expected_size):
        source_stat(path, expected_size)
        fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
        self.stream = os.fdopen(fd, 'rb')
        self.before = os.fstat(fd)
        assert stat.S_ISREG(self.before.st_mode) and self.before.st_nlink == 1 and self.before.st_size == expected_size
        self.expected_size = expected_size
        self.count = 0
        self.hash = hashlib.sha256()
    def read(self, n):
        assert n >= 0 and self.count+n <= self.expected_size
        raw = self.stream.read(n)
        self.count += len(raw)
        self.hash.update(raw)
        return raw
    def verify(self, path, expected_sha):
        after = os.fstat(self.stream.fileno())
        named = source_stat(path, self.expected_size)
        assert self.count == self.expected_size and self.hash.hexdigest() == expected_sha
        assert (after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns) == (self.before.st_dev,self.before.st_ino,self.before.st_size,self.before.st_mtime_ns)
        assert (named.st_dev,named.st_ino,named.st_size,named.st_mtime_ns) == (self.before.st_dev,self.before.st_ino,self.before.st_size,self.before.st_mtime_ns)
    def close(self): self.stream.close()

class PartWriter:
    def __init__(self, out, part_bytes=PART_BYTES, max_bytes=MAX_TAR_BYTES):
        self.out = Path(out)
        self.part_bytes = part_bytes
        self.max_bytes = max_bytes
        self.total = 0
        self.whole = hashlib.sha256()
        self.parts = []
        self.current = None
        self.current_hash = None
        self.current_size = 0
    def _open(self):
        number = len(self.parts)+1
        name = f'capture.tar.part-{number:03d}'
        self.current_name = name
        self.current = (self.out/(name+'.partial')).open('xb')
        self.current_hash = hashlib.sha256()
        self.current_size = 0
    def _finish(self):
        if self.current is None: return
        self.current.flush();os.fsync(self.current.fileno());self.current.close()
        part = self.out/self.current_name
        os.replace(self.out/(self.current_name+'.partial'),part)
        self.parts.append({'name':self.current_name,'bytes':self.current_size,'sha256':self.current_hash.hexdigest()})
        self.current = None
    def write(self, raw):
        if not raw: return 0
        assert self.total + len(raw) <= self.max_bytes, 'archive output bound'
        self.whole.update(raw)
        offset = 0
        while offset < len(raw):
            if self.current is None: self._open()
            amount = min(len(raw)-offset,self.part_bytes-self.current_size)
            chunk = raw[offset:offset+amount]
            self.current.write(chunk)
            self.current_hash.update(chunk)
            self.current_size += amount
            self.total += amount
            offset += amount
            if self.current_size == self.part_bytes: self._finish()
        return len(raw)
    def finish(self):
        self._finish()
        assert self.parts and all(0 < p['bytes'] <= self.part_bytes for p in self.parts)
        return {'tarBytes':self.total,'tarSha256':self.whole.hexdigest(),'parts':self.parts}

def build_tar(files, out, part_bytes=PART_BYTES, expected_tar=None):
    assert len(files) == 30
    names = [x['member'] for x in files]
    assert names == sorted(names) and len(set(names)) == len(names)
    assert all(re.fullmatch(r'p13a/[A-Za-z0-9._/-]+', name) and '..' not in Path(name).parts
               and not name.startswith('/') and len(name.encode()) <= 100 for name in names)
    writer = PartWriter(out,part_bytes)
    with tarfile.open(mode='w|',fileobj=writer,format=tarfile.USTAR_FORMAT) as tar:
        for item in files:
            source = Path(item['sourcePath'])
            info = tarfile.TarInfo(item['member'])
            info.size = item['bytes'];info.mode = 0o644
            info.uid = info.gid = 0;info.uname = info.gname = '';info.mtime = 0
            reader = HashingReader(source,item['bytes'])
            try:
                tar.addfile(info,reader)
                reader.verify(source,item['sha256'])
            finally: reader.close()
    result = writer.finish()
    if expected_tar is not None: assert result['tarBytes'] == expected_tar
    return result

def atomic_json(path, value):
    raw = (json.dumps(value,sort_keys=True,indent=2)+'\n').encode()
    temporary = path.with_name(path.name+'.partial')
    assert not temporary.exists() and not path.exists()
    with temporary.open('xb') as stream:
        stream.write(raw);stream.flush();os.fsync(stream.fileno())
    os.replace(temporary,path)
    assert sha(path.read_bytes()) == sha(raw)

def main():
    started = globals().get('_BOOTSTRAP_START')
    authenticated = globals().get('_AUTHENTICATED_SOURCE_BYTES')
    assert type(started) is float and type(authenticated) is bytes, 'authenticated bootstrap required'
    signal.signal(signal.SIGALRM, lambda *_: (_ for _ in ()).throw(TimeoutError('archive build deadline')))
    signal.setitimer(signal.ITIMER_REAL,max(.001,started+WALL_SECONDS-time.monotonic()))
    parser = argparse.ArgumentParser()
    parser.add_argument('--run-id',required=True)
    parser.add_argument('--review-sha',required=True)
    args = parser.parse_args()
    assert re.fullmatch(r'20261008-ebg-p13a-archive-[a-z0-9-]{1,24}',args.run_id)
    assert re.fullmatch(r'[0-9a-f]{64}',args.review_sha)
    manifest_raw = globals().get('_AUTHENTICATED_MANIFEST_BYTES')
    assert type(manifest_raw) is bytes
    manifest = json.loads(manifest_raw)
    assert manifest['schema'] == '1370-ebg-p13a-archive-builder-proposal-r1'
    assert sha(authenticated) == manifest['files']['builder.py']
    assert not ROOT.is_symlink()
    assert read_pinned(ROOT/'MANIFEST.json',sha(manifest_raw),100_000)==manifest_raw
    assert read_pinned(ROOT/'builder.py',manifest['files']['builder.py'],100_000)==authenticated
    for name,pin in manifest['files'].items():
        assert read_pinned(ROOT/name,pin,100_000 if name!='builder.py' else 100_000)
    assert {p.name for p in ROOT.iterdir()}==set(manifest['files'])|{'MANIFEST.json','EXACT-LANE-COMMANDS.txt'}
    assert sha(read_pinned(DESIGN/'MANIFEST.json',manifest['designManifestSha256'],100_000)) == manifest['designManifestSha256']
    review = json.loads(read_pinned(DESIGN_REVIEW,manifest['designReviewSha256'],100_000))
    assert review['decision'] == 'ACCEPT_DESIGN_ONLY'
    static_review = json.loads(read_pinned(STATIC_REVIEW,args.review_sha,100_000))
    assert static_review == {'decision':'ACCEPT_STATIC_BUILDER_ONLY','manifestSha256':sha(manifest_raw),
                              'builderSha256':manifest['files']['builder.py'],'rosterSha256':manifest['rosterSha256']}
    roster = json.loads(read_pinned(DESIGN/'SOURCE-ROSTER.json',manifest['rosterSha256'],100_000))
    assert roster['adoption']['status']=='PENDING_CLEAN_AND_INDEPENDENT_OBSERVED_RECEIPT'
    assert roster['productionHead']==HEAD and roster['sourceTree']==SRC_TREE
    files = roster['p13a']['files']
    assert len(files)==30 and roster['p13a']['observedDecision']=='ACCEPT_OBSERVED_EBG_P13A_CLEAN_ORIGINAL_CAP_DIAGNOSTIC_ONLY'
    assert next(x for x in files if x['member']=='p13a/observed/RECEIPT.json')['sha256']==roster['p13a']['observedReceiptSha256']
    assert next(x for x in files if x['member']=='p13a/target/boundaries.ndjson.gz')['sha256']==roster['p13a']['boundarySha256']
    source_guard(MIN_FREE_BYTES)
    lock = SCRATCH/'HEAVY-LANE-LOCK'
    assert lock.is_file() and not lock.is_symlink()
    assert f'lane-run {LANE_LOG.replace("<RUN_ID>",args.run_id)},' in lock.read_text()
    assert not OUTPUT_ROOT.is_symlink()
    OUTPUT_ROOT.mkdir(exist_ok=True)
    out = OUTPUT_ROOT/args.run_id
    assert not os.path.lexists(out)
    out.mkdir()
    try:
        built = build_tar(files,out,expected_tar=EXPECTED_TAR_BYTES)
        assert [p['bytes'] for p in built['parts']] == [PART_BYTES,40_032_256]
        source_guard(RUNNING_FLOOR_BYTES)
        result = {'schema':'1370-ebg-p13a-archive-build-result-r1','status':'LOCAL_BUILD_ONLY_NEEDS_INDEPENDENT_READBACK',
                  'runId':args.run_id,'designManifestSha256':manifest['designManifestSha256'],
                  'designReviewSha256':manifest['designReviewSha256'],'sourceRosterSha256':manifest['rosterSha256'],
                  'staticReviewSha256':args.review_sha,'head':HEAD,'sourceTree':SRC_TREE,
                  'members':[{k:x[k] for k in ('member','bytes','sha256')} for x in files],**built}
        atomic_json(out/'BUILD-RESULT.json',result)
    except Exception as exc:
        signal.setitimer(signal.ITIMER_REAL,0)
        failure={'schema':'1370-ebg-p13a-archive-build-failure-r1','status':'BUILD_FAILED_PRESERVE_PARTIAL',
                 'runId':args.run_id,'error':repr(exc),'partialFiles':sorted(p.name for p in out.iterdir())}
        atomic_json(out/'BUILD-FAILURE.json',failure)
        raise
    signal.setitimer(signal.ITIMER_REAL,0)
    print(json.dumps({'status':result['status'],'tarSha256':built['tarSha256'],'parts':len(built['parts'])},sort_keys=True))

if __name__ == '__main__': main()
