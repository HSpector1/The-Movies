#!/usr/bin/env python3
"""Independent local byte readback for the EBG adoption evidence archive.

Static proposal. Run only after a separately reviewed, filled binding exists.
"""
import argparse
import hashlib
import json
import os
import pathlib
import re
import shutil
import signal
import stat
import subprocess
import tarfile
import time

S = pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO = pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
ROOT = S/'1370-ebg-adoption-archive-builder-recorded-r1/20261008-ebg-adoption-archive-r1'
ROSTER = S/'1370-ebg-adoption-github-backup-design-r1/SOURCE-ROSTER.json'
DESIGN = S/'1370-ebg-adoption-github-backup-design-r1/MANIFEST.json'
DESIGN_REVIEW = S/'1370-ebg-adoption-github-backup-independent-design-review-r1/RECEIPT.json'
BUILDER_MANIFEST = S/'1370-ebg-adoption-archive-builder-proposal-r1/MANIFEST.json'
BUILDER_STATIC = S/'1370-ebg-adoption-archive-builder-independent-static-review-r1/RECEIPT.json'
BUILDER_EXACT = S/'1370-ebg-adoption-archive-builder-filled-exact-review-r2/RECEIPT.json'
BUILD_LANE = S/'1370-ebg-adoption-archive-builder-20261008-ebg-adoption-archive-r1.lane.log.meta'
BUILD_LANE_LOG = S/'1370-ebg-adoption-archive-builder-20261008-ebg-adoption-archive-r1.lane.log'
OBSERVED = S/'1370-ebg-adoption-r3-clean-independent-observed-audit-r1/RECEIPT.json'
HEAD = 'b97129610a07d3529fc482daeddc0cd9bf798713'
TREE = '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
ROSTER_SHA = 'f957f2244bd1bebfa405bd2fcb4cf284c670dfc2ba6bc6a896b2c8d482a630d0'
DESIGN_SHA = 'c7c4bc43958101840c6193d792c610e2f1c793e38e1e90d959cc01b79f47eae9'
DESIGN_REVIEW_SHA = 'efb2fef13a8485ee6d1ffab6643bc5e64bbd5e21cc7e0cbbf7ef3d314ccdf46f'
BUILDER_MANIFEST_SHA = '693ef4a1616997a0a1f553d4470fa061569ce002d55dbe46cb831752c9e3213c'
BUILDER_STATIC_SHA = 'ce901c33ffa0033c354a1006dcb8c14dd0b4b63115369fb6d3163a24e889b36b'
BUILDER_EXACT_SHA = '68e0ec64f2159bbdd4789c3b65257b0c7708cd4f8fbe5e3bcf45b3fa52600c73'
OBSERVED_SHA = 'c98f49e901ac2e4ca8d14eb76b15f01e0030746c046747cf4024717575ce2d15'
PART_SIZES = [67108864, 67108864, 7104512]
TAR_SIZE = 141322240
RUN_ID = '20261008-ebg-adoption-archive-r1'
RUNNING_FLOOR_BYTES = 3221225472
WALL_SECONDS = 300

def runtime_guard():
    power = subprocess.check_output(['pmset','-g','batt'],text=True,timeout=5)
    assert power.splitlines()[:1] == ["Now drawing from 'AC Power'"]
    assert shutil.disk_usage(S).free >= RUNNING_FLOOR_BYTES

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

def regular(path):
    s = path.lstat()
    assert stat.S_ISREG(s.st_mode) and s.st_nlink == 1 and not path.is_symlink(), path
    return s

def read_pinned(path, pin, cap=200000):
    before = regular(path)
    assert before.st_size <= cap
    raw = path.read_bytes()
    after = regular(path)
    assert (before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns) == (after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns)
    assert sha(raw) == pin
    return raw

def git(*args):
    return subprocess.check_output(['git',*args],cwd=REPO,text=True,timeout=25).strip()

class Parts:
    def __init__(self, expected):
        self.expected = expected
        self.index = 0
        self.stream = None
        self.part_hash = None
        self.part_count = 0
        self.whole_hash = hashlib.sha256()
        self.whole_count = 0
        self.results = []
        self.before = None

    def _open(self):
        assert self.index < len(self.expected), 'archive EOF'
        item = self.expected[self.index]
        path = ROOT/item['name']
        self.before = regular(path)
        assert self.before.st_size == item['bytes']
        fd = os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
        opened = os.fstat(fd)
        assert (opened.st_dev,opened.st_ino,opened.st_size,opened.st_mtime_ns) == (self.before.st_dev,self.before.st_ino,self.before.st_size,self.before.st_mtime_ns)
        self.stream = os.fdopen(fd,'rb')
        self.part_hash = hashlib.sha256()
        self.part_count = 0

    def _finish_part(self):
        item = self.expected[self.index]
        path = ROOT/item['name']
        after_fd = os.fstat(self.stream.fileno())
        after_name = regular(path)
        for after in (after_fd,after_name):
            assert (after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns) == (self.before.st_dev,self.before.st_ino,self.before.st_size,self.before.st_mtime_ns)
        assert self.part_count == item['bytes'] and self.part_hash.hexdigest() == item['sha256']
        self.results.append({'name':item['name'],'bytes':self.part_count,'sha256':self.part_hash.hexdigest()})
        self.stream.close()
        self.stream = None
        self.index += 1

    def read(self,n):
        assert n >= 0
        chunks = []
        while n:
            if self.stream is None: self._open()
            raw = self.stream.read(min(n,1<<20))
            if raw:
                chunks.append(raw)
                n -= len(raw)
                self.part_hash.update(raw)
                self.whole_hash.update(raw)
                self.part_count += len(raw)
                self.whole_count += len(raw)
                if self.whole_count//(8<<20) != (self.whole_count-len(raw))//(8<<20): runtime_guard()
            else:
                self._finish_part()
        return b''.join(chunks)

    def finish(self):
        assert self.stream is not None and self.stream.read(1) == b''
        self._finish_part()
        assert self.index == len(self.expected)

def main():
    start = time.monotonic()
    signal.signal(signal.SIGALRM,lambda *_: (_ for _ in ()).throw(TimeoutError('300-second readback deadline')))
    signal.setitimer(signal.ITIMER_REAL,WALL_SECONDS)
    parser = argparse.ArgumentParser()
    parser.add_argument('--binding',required=True)
    parser.add_argument('--binding-sha',required=True)
    parser.add_argument('--out',required=True)
    args = parser.parse_args()
    assert re.fullmatch(r'[0-9a-f]{64}',args.binding_sha)
    binding_path = pathlib.Path(args.binding)
    out = pathlib.Path(args.out)
    assert binding_path.is_absolute() and str(binding_path).startswith(str(S)+'/1370-ebg-adoption-archive-local-readback-filled-r2/')
    assert out.is_absolute() and str(out).startswith(str(S)+'/1370-ebg-adoption-archive-local-readback-recorded-r2/')
    assert out.name == 'AUDIT.json' and not out.exists()
    assert not out.parent.is_symlink() and out.parent.is_dir()
    binding = json.loads(read_pinned(binding_path,args.binding_sha))
    assert binding['schema'] == '1370-ebg-adoption-archive-local-readback-binding-r2'
    assert binding['runId'] == RUN_ID and binding['sourceHead'] == HEAD and binding['sourceTree'] == TREE
    for key in ('buildResultSha256','buildLaneMetaSha256','buildLaneLogSha256','tarSha256'):
        assert re.fullmatch(r'[0-9a-f]{64}',binding[key])
    assert [x['name'] for x in binding['parts']] == [f'capture.tar.part-{i:03d}' for i in range(1,4)]
    assert [x['bytes'] for x in binding['parts']] == PART_SIZES
    assert all(re.fullmatch(r'[0-9a-f]{64}',x['sha256']) for x in binding['parts'])
    assert binding['tarBytes'] == TAR_SIZE
    assert git('rev-parse','HEAD') == HEAD and git('rev-parse','HEAD:src') == TREE
    assert git('status','--porcelain=v1') == ''
    branch = 'refs/heads/wip/headless-program-20260916-ts'
    assert git('ls-remote','--exit-code','origin',branch) == HEAD+'\t'+branch
    runtime_guard()
    lock = S/'HEAVY-LANE-LOCK'
    assert regular(lock) and '1370-ebg-adoption-archive-readback-r2.lane.log' in lock.read_text()
    assert read_pinned(DESIGN,DESIGN_SHA)
    assert json.loads(read_pinned(DESIGN_REVIEW,DESIGN_REVIEW_SHA))['decision'] == 'ACCEPT_DESIGN_ONLY'
    assert read_pinned(BUILDER_MANIFEST,BUILDER_MANIFEST_SHA)
    assert json.loads(read_pinned(BUILDER_STATIC,BUILDER_STATIC_SHA))['decision'] == 'ACCEPT_STATIC_BUILDER_ONLY'
    assert json.loads(read_pinned(BUILDER_EXACT,BUILDER_EXACT_SHA))['decision'] == 'ACCEPT_EXACT_ONLY'
    observed = json.loads(read_pinned(OBSERVED,OBSERVED_SHA))
    assert observed['decision'] == 'ACCEPT_OBSERVED_EBG_ADOPTION_CLEAN_EXPLORATORY_ONLY'
    lane_raw = read_pinned(BUILD_LANE,binding['buildLaneMetaSha256'])
    assert b'end, exit 0;' in lane_raw and b'20261008-ebg-adoption-archive-r1' in lane_raw
    assert b'1370-ebg-adoption-archive-builder-proposal-r1' in lane_raw
    log_raw = read_pinned(BUILD_LANE_LOG,binding['buildLaneLogSha256'])
    assert b'LOCAL_BUILD_ONLY_NEEDS_INDEPENDENT_READBACK' in log_raw
    assert regular(ROOT/'BUILD-RESULT.json')
    assert not (ROOT/'BUILD-FAILURE.json').exists()
    assert sorted(p.name for p in ROOT.iterdir()) == ['BUILD-RESULT.json']+[x['name'] for x in binding['parts']]
    result = json.loads(read_pinned(ROOT/'BUILD-RESULT.json',binding['buildResultSha256']))
    assert result['schema'] == '1370-ebg-adoption-archive-build-result-r1'
    assert result['status'] == 'LOCAL_BUILD_ONLY_NEEDS_INDEPENDENT_READBACK'
    assert result['head'] == HEAD and result['sourceTree'] == TREE and result['runId'] == RUN_ID
    assert result['designManifestSha256'] == DESIGN_SHA and result['designReviewSha256'] == DESIGN_REVIEW_SHA
    assert result['staticReviewSha256'] == BUILDER_STATIC_SHA and result['sourceRosterSha256'] == ROSTER_SHA
    assert result['observedReceiptSha256'] == OBSERVED_SHA
    assert result['observedDecision'] == 'ACCEPT_OBSERVED_EBG_ADOPTION_CLEAN_EXPLORATORY_ONLY'
    assert (result['seed'],result['naturalTicks'],result['boundaryCount'],result['childSeconds'],result['recorderSeconds']) == ('p13-public-commercial-adoption',416,417,720,750)
    assert result['archiveFormat'] == {'tar':'USTAR','compression':'none','mode':'0644','uid':0,'gid':0,'mtime':0,'uname':'','gname':''}
    assert result['tarBytes'] == binding['tarBytes'] and result['tarSha256'] == binding['tarSha256']
    assert result['parts'] == binding['parts']
    roster = json.loads(read_pinned(ROSTER,ROSTER_SHA))
    adoption = roster['adoption']
    assert adoption['classification'] == 'EXPLORATORY_NOT_ACCEPTANCE_NO_1363_ADMISSION'
    assert (adoption['runId'],adoption['seed'],adoption['naturalTicks'],adoption['boundaryCount']) == ('20261008-ebg-adoption-clean-r1','p13-public-commercial-adoption',416,417)
    assert (adoption['childSeconds'],adoption['recorderSeconds']) == (720,750)
    assert (adoption['boundaryCompressedBytes'],adoption['boundarySha256']) == (141237093,'69f7d46e8bf305cf5bb3697a674990cb5f8849446927b77f579bf2112a73346e')
    files = adoption['files']
    names = [x['member'] for x in files]
    assert len(files) == 30 and names == sorted(names) and len(set(names)) == 30
    assert result['members'] == [{k:x[k] for k in ('member','bytes','sha256')} for x in files]
    assert result['sourceBytes'] == sum(x['bytes'] for x in files) == 141289801
    assert next(x for x in files if x['member']=='adoption/observed/RECEIPT.json')['sha256'] == OBSERVED_SHA
    reader = Parts(binding['parts'])
    for item in files:
        runtime_guard()
        name = item['member']
        assert name.startswith('adoption/') and '..' not in pathlib.PurePosixPath(name).parts
        assert not name.startswith('/') and len(name.encode()) <= 100
        info = tarfile.TarInfo(name)
        info.size = item['bytes']; info.mode = 0o644
        info.uid = info.gid = 0; info.uname = info.gname = ''; info.mtime = 0
        assert reader.read(512) == info.tobuf(format=tarfile.USTAR_FORMAT,encoding='utf-8',errors='strict'), name
        source = pathlib.Path(item['sourcePath'])
        assert source.is_absolute() and str(source).startswith(str(S)+'/')
        before = regular(source)
        assert before.st_size == item['bytes']
        fd = os.open(source,os.O_RDONLY|os.O_NOFOLLOW)
        opened = os.fstat(fd)
        assert (opened.st_dev,opened.st_ino,opened.st_size,opened.st_mtime_ns) == (before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns)
        digest = hashlib.sha256()
        with os.fdopen(fd,'rb') as stream:
            remaining = item['bytes']
            while remaining:
                take = min(remaining,1<<20)
                archive = reader.read(take)
                local = stream.read(take)
                assert archive == local and len(local) == take, name
                digest.update(archive)
                remaining -= take
                if remaining//(8<<20) != (remaining+take)//(8<<20): runtime_guard()
            assert stream.read(1) == b''
            after_fd = os.fstat(stream.fileno())
        after_name = regular(source)
        for after in (after_fd,after_name):
            assert (after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns) == (before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns)
        assert digest.hexdigest() == item['sha256'], name
        pad = (-item['bytes']) % 512
        if pad: assert reader.read(pad) == b'\0'*pad
    remaining = TAR_SIZE-reader.whole_count
    assert remaining >= 1024 and reader.read(remaining) == b'\0'*remaining
    reader.finish()
    assert reader.whole_count == TAR_SIZE and reader.whole_hash.hexdigest() == binding['tarSha256']
    runtime_guard()
    assert time.monotonic()-start < WALL_SECONDS
    audit = {'schema':'1370-ebg-adoption-archive-independent-local-readback-r2',
             'decision':'LOCAL_ARCHIVE_BYTES_ACCEPTED_ONLY',
             'runId':RUN_ID,'memberCount':30,'sourceBytes':141289801,
             'tarBytes':TAR_SIZE,'tarSha256':reader.whole_hash.hexdigest(),
             'parts':reader.results,'buildResultSha256':binding['buildResultSha256'],
             'buildLaneMetaSha256':binding['buildLaneMetaSha256'],
             'buildLaneLogSha256':binding['buildLaneLogSha256'],
             'rosterSha256':ROSTER_SHA,'observedReceiptSha256':OBSERVED_SHA,
             'sourceHead':HEAD,'sourceTree':TREE,
             'freeBytesAtReadback':shutil.disk_usage(S).free,
             'checks':['30 exact normalized USTAR headers','30 source bytes equal archive member bytes',
                       '30 SHA256 and sizes','lexicographic unique regular member names',
                       'zero padding and terminator','whole tar and three ordered part hashes',
                       'builder result and child exit 0','source HEAD/tree and remote ref',
                       'AC and recorded heavy lane']}
    raw = (json.dumps(audit,sort_keys=True,indent=2)+'\n').encode()
    with out.open('xb') as stream:
        stream.write(raw);stream.flush();os.fsync(stream.fileno())
    signal.setitimer(signal.ITIMER_REAL,0)
    print(json.dumps({'decision':audit['decision'],'auditSha256':sha(raw),'tarSha256':audit['tarSha256']}))

if __name__ == '__main__': main()
