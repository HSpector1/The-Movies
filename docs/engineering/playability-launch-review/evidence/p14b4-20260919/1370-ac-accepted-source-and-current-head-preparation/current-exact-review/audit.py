#!/usr/bin/env python3
"""Read-only exact audit of the second r4 historical sparse draft."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess

D = Path('/Users/zacheryspector/studio-scratch/1370-c0-aging-era-sparse-materializer-r4-exact-draft-20261008-r2')
OLD = Path('/Users/zacheryspector/studio-scratch/1370-c0-aging-era-sparse-materializer-r4-exact-draft-20261008-r1')
REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
OUT = Path(__file__).parent
HEAD = '2bc459375006cdf97fb073f1ceace5462e4503d3'
SOURCE = '3aaf55e0c06c4b745b0b722cc56913050b1ee229'
SRC_TREE = '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
EXPECTED_PINS = '98e025d2f6863bb60f7665bc808e92ef9bf3fdf71d5c10bd4a41ee6f8123fd63'
EXPECTED_SEMANTIC = '1d6906cc48ff0005b777a1f8d3af27d33dee5f6b07834704363c47ccb0f7f46c'
EXCLUDED = {'status', 'executionAuthorization', 'exactBindingReviewPath', 'exactBindingReviewSha256', 'exactBindingReviewDecision'}
errors = []
facts = {}

def check(condition, name):
    if not condition:
        errors.append(name)

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

def hashfile(path):
    return sha(Path(path).read_bytes())

def read(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))

def git(*args):
    return subprocess.check_output(['/usr/bin/git', '-c', 'gc.auto=0', '-c', 'maintenance.auto=0', '-C', str(REPO), *args], stderr=subprocess.PIPE)

b, old = read(D/'BINDING-DRAFT.json'), read(OLD/'BINDING-DRAFT.json')
c, report = read(D/'CANDIDATE-PINS.json'), read(D/'DRAFT-REPORT.json')
manifest, links, semantic_file = read(D/'SOURCE-MANIFEST.json'), read(D/'DEPENDENCY-LINKS.json'), read(D/'BINDING-SEMANTIC.json')
check(hashfile(D/'CANDIDATE-PINS.json') == EXPECTED_PINS, 'candidate pins SHA')
check(set(c['files']) == {'ADOPTION-PLAN.md','BINDING-DRAFT.json','BINDING-SEMANTIC.json','DEPENDENCY-LINKS.json','DRAFT-REPORT.json','SOURCE-MANIFEST.json'}, 'candidate file set')
for name, digest in c['files'].items():
    check(hashfile(D/name) == digest, 'candidate file '+name)
semantic = {key: value for key,value in b.items() if key not in EXCLUDED}
semantic_sha = sha(json.dumps(semantic, sort_keys=True, separators=(',',':')).encode('utf-8'))
check(set(b)-set(semantic) == EXCLUDED and semantic == semantic_file, 'exact semantic exclusions/content')
check(semantic_sha == EXPECTED_SEMANTIC == c['bindingSemanticSha256'], 'semantic SHA')
check(b['status'] == c['status'] == report['status'] == 'DRAFT_UNREVIEWED_UNRUN' and b['executionAuthorization'] is c['executionAuthorization'] is False and all(b[k] is None for k in EXCLUDED-{'status','executionAuthorization'}), 'draft state')
check(c['sourceManifestSha256'] == hashfile(D/'SOURCE-MANIFEST.json') and c['dependencyLinksSha256'] == hashfile(D/'DEPENDENCY-LINKS.json'), 'manifest pins')
check(b['sourceSha'] == manifest['sourceSha'] == SOURCE, 'historical source')

for role in ('sourcePins','sourceReview','designReceipt','feasibilityNote','materializer','recorder','supervisor'):
    path = Path(b[role+'Path'])
    check(path.is_absolute() and path.is_file() and not path.is_symlink() and hashfile(path) == b[role+'Sha256'], 'role '+role)
pins, source_review, design = read(b['sourcePinsPath']), read(b['sourceReviewPath']), read(b['designReceiptPath'])
check(pins['status'] == 'SOURCE_ONLY_UNRUN' and pins['sourceSha'] == SOURCE and b['sourcePinsSha256'] == c['sourcePinsSha256'] == 'f5e985ffe629d87a3292506c7506bbdc153d923e2fa5cafd1db445d3c5e11105', 'source pins role')
check(source_review['decision'] == b['sourceReviewDecision'] == 'ACCEPT_SOURCE_ONLY_UNRUN' and source_review['reviewedSourcePinsSha256'] == b['sourcePinsSha256'] and source_review['qualifiedSourceSha'] == SOURCE and b['sourceReviewSha256'] == c['sourceReviewSha256'] == '398698481cda21d48a4b6cd6f069368d5dd97eb106fbd117546612056a4126e1', 'source review role')
check(design['decision'] == 'ACCEPT_DESIGN_ONLY' and design['qualifiedSourceSha'] == SOURCE and source_review['designReceiptSha256'] == b['designReceiptSha256'], 'design role')
for name, digest in pins['files'].items():
    check(hashfile(Path(b['sourcePinsPath']).parent/name) == digest, 'source package '+name)
for role in ('materializer','recorder','supervisor'):
    check(Path(b[role+'Path']).parent == Path(b['sourcePinsPath']).parent, 'source code location '+role)
for role in ('git','cp','ls','du','lsof','node'):
    path = Path(b[role+'Path'])
    check(path.is_file() and not path.is_symlink() and os.access(path, os.X_OK) and hashfile(path) == b[role+'Sha256'], 'executable '+role)
check(subprocess.check_output([b['nodePath'],'--version']).strip() == b'v22.23.2', 'node version')
for name,digest in b['runtimeFiles'].items():
    path = REPO/name
    check(path.is_file() and not path.is_symlink() and hashfile(path) == digest, 'runtime '+name)
    if name in ('package.json','package-lock.json'):
        check(manifest['files'][name]['sha256'] == digest, 'historical runtime '+name)

check(git('rev-parse','HEAD').strip().decode() == b['productionHead'] == report['productionHead'] == HEAD, 'production HEAD')
check(git('rev-parse','HEAD:src').strip().decode() == report['productionSourceTree'] == SRC_TREE, 'source tree')
check(git('status','--porcelain=v1','-z','--untracked-files=all') == b'', 'clean production')
check(git('diff','--cached','--name-only','-z') == b'', 'clean index')
common = git('rev-parse','--path-format=absolute','--git-common-dir').strip().decode()
check(common == b['commonGitRoot'] and b['commonObjects'] == common+'/objects', 'common Git identity')
remote = subprocess.check_output(['/usr/bin/git','ls-remote','origin','refs/heads/wip/headless-program-20260916-ts','refs/heads/main','refs/heads/evidence/1370-r10-clean-captures'], cwd=REPO, stderr=subprocess.PIPE).decode()
refs = {line.split('\t')[1]:line.split('\t')[0] for line in remote.splitlines()}
check(refs == report['remoteRefsAtDraft'] and refs['refs/heads/wip/headless-program-20260916-ts'] == HEAD, 'fresh remote refs')
facts['remoteRefs'] = refs

raw = git('ls-tree','-r','-z',SOURCE,'--','src','tests/bridge-p14b5-relationships.test.ts','tests/fixtures/p13a/accepted-v19.json.gz','package.json','package-lock.json')
rows = {}
for entry in raw.split(b'\0'):
    if entry:
        meta,path = entry.split(b'\t',1)
        mode,kind,oid = meta.decode().split()
        rows[path.decode()] = (mode,kind,oid)
check(set(rows) == set(manifest['files']) and len(rows) == manifest['count'] == 176, 'source path set/count')
size = 0
for path,(mode,kind,oid) in rows.items():
    expected = manifest['files'][path]
    check((mode,kind,oid) == (expected['mode'],'blob',expected['oid']) and mode == '100644', 'source tree row '+path)
    data = git('cat-file','blob',oid)
    check(sha(data) == expected['sha256'] and len(data) == expected['bytes'], 'source bytes '+path)
    check(hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest() == oid, 'source object hash '+path)
    size += len(data)
check(size == manifest['logicalBytes'] == report['sourceLogicalBytes'] == 4803106, 'source logical bytes')
facts['historicalBlobs'] = len(rows)
facts['historicalLogicalBytes'] = size

dep = Path(b['dependencyRoot'])
observed_links = []
regular,directories = 0,1
stack = [(dep,'')]
while stack:
    directory,prefix = stack.pop()
    for item in os.scandir(directory):
        rel = prefix+item.name
        info = item.stat(follow_symlinks=False)
        if stat.S_ISDIR(info.st_mode):
            directories += 1
            stack.append((Path(item.path),rel+'/'))
        elif stat.S_ISREG(info.st_mode):
            regular += 1
            check(info.st_nlink == 1, 'dependency hardlink '+rel)
        elif stat.S_ISLNK(info.st_mode):
            target = os.readlink(item.path)
            observed_links.append({'path':rel,'target':target})
            check(not os.path.isabs(target) and Path(item.path).resolve(strict=True).is_relative_to(dep.resolve(strict=True)), 'dependency link escape '+rel)
        else:
            errors.append('dependency special '+rel)
check(sorted(observed_links,key=lambda x:x['path']) == sorted(links['links'],key=lambda x:x['path']), 'dependency link rows')
check((regular,directories,len(observed_links)) == (links['regularCount'],links['directoryCount'],links['symlinkCount']) == (11060,1401,24), 'dependency shape')
facts['dependencyShape'] = {'regular':regular,'directories':directories,'symlinks':len(observed_links)}

protected = [Path(b['productionRoot']),Path(b['commonGitRoot'])]
parent = Path(b['scratchParent'])
check(protected[0] == REPO and all(p.is_dir() and not p.is_symlink() and p.resolve() == p for p in protected), 'protected roots physical')
check(Path(b['commonObjects']).is_dir() and not Path(b['commonObjects']).is_symlink(), 'protected objects')
check(dep == REPO/'node_modules' and dep.is_dir() and not dep.is_symlink(), 'dependency root physical')
check(parent == Path(b['outputParent']) and parent.is_dir() and not parent.is_symlink() and parent.resolve() == parent, 'scratch parent physical')
check(os.stat(parent).st_dev == os.stat(dep).st_dev, 'same filesystem')
reserved = [Path(b[k]) for k in ('outputRoot','scratchRoot','recorderLockPath')]
check(len(set(reserved)) == 3 and all(p.parent == parent and not p.exists() and not p.is_symlink() for p in reserved), 'reserved absent immediate children')
check(all(not p.is_relative_to(root) and not root.is_relative_to(p) for p in reserved for root in protected+[dep]), 'reserved outside protected roots')
check(b['noExternalSameUidRenamer'] is True and 'No external same-UID' in report['assumption'], 'no-renamer assumption')
check(all(report['reservedChildren'][k]['absentAtDraft'] and report['reservedChildren'][k]['path'] == b[k] for k in ('outputRoot','scratchRoot','recorderLockPath')), 'draft reserved report')
required = 3*1024**3+128*1024**2+384*1024**2
free = shutil.disk_usage(parent).free
check(report['requiredFreeBytes'] == required and report['deficitBytes'] == required-report['freeBytesAtDraft'] and report['launch'] == c['launch'] == 'LAUNCH_STOP_LOW_SPACE', 'draft space math')
check(free < required, 'current low-space STOP')
facts['freeBytesNow'] = free
facts['requiredFreeBytes'] = required
facts['deficitBytesNow'] = max(0, required-free)

changes = {key:{'r1':old.get(key),'r2':b.get(key)} for key in sorted(set(old)|set(b)) if old.get(key) != b.get(key)}
check(set(changes) == {'productionHead','outputRoot','scratchRoot','recorderLockPath'}, 'r1-r2 binding delta')
check(read(D/'SOURCE-MANIFEST.json') == read(OLD/'SOURCE-MANIFEST.json') and read(D/'DEPENDENCY-LINKS.json') == read(OLD/'DEPENDENCY-LINKS.json'), 'r1-r2 inventory identity')
facts['r1ToR2BindingChanges'] = changes
facts['bindingSemanticSha256'] = semantic_sha
facts['candidatePinsSha256'] = hashfile(D/'CANDIDATE-PINS.json')
OUT.joinpath('AUDIT.json').write_text(json.dumps({'errors':errors,'facts':facts},sort_keys=True,indent=2)+'\n')
print(json.dumps({'errorCount':len(errors),'errors':errors,'facts':facts},sort_keys=True,indent=2))
