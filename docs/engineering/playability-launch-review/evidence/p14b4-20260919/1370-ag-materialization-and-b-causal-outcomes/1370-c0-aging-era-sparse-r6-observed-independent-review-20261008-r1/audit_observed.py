import hashlib, importlib.util, json, os, pathlib, shutil, stat, subprocess, time

ROOT = pathlib.Path('/Users/zacheryspector/studio-scratch')
HERE = pathlib.Path(__file__).parent
D = ROOT / '1370-c0-aging-era-sparse-materializer-r6-exact-draft-20261008-r1'
P = ROOT / '1370-c0-aging-era-sparse-r6-exact-preparation-20261008-r1'
BINDING_SHA = '5f6de7413b9a28a9e30284062e99bf52a3ea83f9ba0074515b3257515c8b0c0f'

def digest(raw): return hashlib.sha256(raw).hexdigest()
def file_digest(p): return digest(pathlib.Path(p).read_bytes())
def readj(p): return json.loads(pathlib.Path(p).read_bytes())
def run(argv, allowed=(0,)):
    result = subprocess.run(argv, capture_output=True, env=dict(os.environ, GIT_OPTIONAL_LOCKS='0', PYTHONDONTWRITEBYTECODE='1'), timeout=180)
    assert result.returncode in allowed, (argv[:3], result.returncode, result.stderr[:500])
    return result

started = time.monotonic()
b = readj(D / 'BINDING-DRAFT.json')
assert file_digest(D / 'BINDING-DRAFT.json') == BINDING_SHA
output = pathlib.Path(b['outputRoot'])
target = pathlib.Path(b['scratchRoot'])
assert not os.path.lexists(output / 'SUPERVISOR-OVERRIDE-STOP.json')
result = readj(output / 'RESULT.json')
supervisor = readj(output / 'SUPERVISOR.json')
prepared = readj(output / 'SUPERVISOR-PREPARED.json')
payload = readj(output / 'child.stdout')
assert file_digest(output / 'RESULT.json') == 'c4d3a403d2630f978d3d176662f5adda19fae00f321ecc168d1ec373eb47c091' == supervisor['recorderSha256'] == prepared['recorderSha256']
assert file_digest(output / 'SUPERVISOR.json') == '2e3f9e5c548ce9a1fc5573989d40f1e5a55123803de9365e469aa16f0a35fba5'
assert file_digest(output / 'child.stdout') == result['stdoutSha256'] == 'fc494f5ed09ec9df02380490f1bc2dcac3f4cf293fb8734e0329a4a8d43e4c18'
assert file_digest(output / 'child.stderr') == result['stderrSha256'] and not (output / 'child.stderr').read_bytes()
assert result['specSha256'] == supervisor['specSha256'] == prepared['specSha256'] == BINDING_SHA
assert result['status'] == supervisor['status'] == payload['status'] == 'MATERIALIZED_UNREVIEWED_UNRUN'
assert result['childExit'] == supervisor['workerExit'] == prepared['workerExit'] == 0
assert result['groupClear'] and not result['scratchClear'] and supervisor['workerGroupClear'] and supervisor['childGroupClear']
assert not supervisor['timedOut'] and result['stopReason'] is None
assert supervisor['endMonotonic'] - supervisor['startMonotonic'] < 930
assert result['freeMinimum'] == supervisor['freeMinimum'] >= 3 * 1024**3 + 128 * 1024**2
assert payload['monotonicEnd'] <= result['endMonotonic'] <= supervisor['endMonotonic']
assert pathlib.Path(result['scratchRoot']) == target == pathlib.Path(payload['scratchRoot'])
assert pathlib.Path(result['outputRoot']) == output
assert supervisor['workerPid'] == prepared['workerPid'] and supervisor['childGroup'] == result['childPid'] == prepared['childGroup']
lane = P / 'ADOPTED-LAUNCH-SPEC.json'
launch = readj(lane)
meta_path = pathlib.Path(launch['lane']['meta'])
meta = meta_path.read_text()
assert meta.count('\nstart; ') == 1 and meta.count('\nend, exit 0; ') == 1
assert 'waiting for lock' not in meta and 'waiting for heavy' not in meta
assert '17:24:11 CDT' in meta and '17:36:01 CDT' in meta

spec = importlib.util.spec_from_file_location('r6_observed_readonly', b['materializerPath'])
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
assert file_digest(b['materializerPath']) == b['materializerSha256']
assert target.is_dir() and not target.is_symlink() and stat.S_IMODE(target.stat().st_mode) == 0o700
assert (target / '.git').is_dir() and not (target / '.git').is_symlink()
assert (target / '.git/objects/info/alternates').read_text() == b['commonObjects'] + '\n'
assert (target / '.git/HEAD').read_text() == b['sourceSha'] + '\n'
manifest = readj(D / 'SOURCE-MANIFEST.json')['files']
assert payload['sourceManifest'] == manifest and payload['sourceSha'] == payload['detachedHead'] == b['sourceSha']
actual_source = m.physical_source_paths(target)
expected_source = {name: {'type': 'regular', 'mode': 0o644, 'bytes': item['bytes'], 'links': 1, 'sha256': item['sha256']} for name, item in manifest.items()}
assert actual_source == payload['physicalCheckout'] == expected_source
assert len(actual_source) == 176 and sum(row['bytes'] for row in actual_source.values()) == 4803106

original_deps = readj(P / 'DEPENDENCY-INVENTORY.json')
copied_deps = payload['dependencyManifest']
assert file_digest(P / 'DEPENDENCY-INVENTORY.json') == 'b80a018c3f2b3dbca31a71a6b3866b447c194dd5e46a164586c96086d89f3a17'
assert m.comparable(original_deps) == m.comparable(copied_deps)
dep = target / 'node_modules'
source_dep = pathlib.Path(b['dependencyRoot'])
assert dep.is_dir() and not dep.is_symlink()
seen = {'.'}
for directory, dirs, files in os.walk(dep, followlinks=False):
    for name in dirs + files:
        seen.add(str((pathlib.Path(directory) / name).relative_to(dep)))
assert seen == set(copied_deps)
counts = {kind: sum(row['type'] == kind for row in copied_deps.values()) for kind in ('regular', 'directory', 'symlink')}
assert counts == {'regular': 11060, 'directory': 1401, 'symlink': 24}
logical_dep_bytes = 0
copy_paths = []
for name, row in copied_deps.items():
    p = dep / name
    original = source_dep / name
    st = p.lstat()
    original_st = original.lstat()
    assert stat.S_IMODE(st.st_mode) == row['mode'] == original_deps[name]['mode'], name
    assert row['acl'] == ['no-acl'] and row['xattrs'] == {}, name
    assert '\n' not in str(p) and '\r' not in str(p), name
    copy_paths.append(str(p))
    if row['type'] == 'regular':
        assert stat.S_ISREG(st.st_mode) and st.st_nlink == 1 and st.st_size == row['bytes'] and st.st_ino == row['inode'], name
        assert file_digest(p) == row['sha256'], name
        assert (st.st_dev, st.st_ino) != (original_st.st_dev, original_st.st_ino), name
        assert stat.S_ISREG(original_st.st_mode) and original_st.st_nlink == 1 and original_st.st_size == original_deps[name]['bytes'] and original_st.st_ino == original_deps[name]['inode'], name
        logical_dep_bytes += st.st_size
    elif row['type'] == 'directory':
        assert stat.S_ISDIR(st.st_mode) and not p.is_symlink(), name
    else:
        assert stat.S_ISLNK(st.st_mode) and os.readlink(p) == row['target'] and not pathlib.Path(row['target']).is_absolute(), name
        assert p.resolve(strict=True).is_relative_to(dep), name

# Independent fresh metadata readback. Empty xattrs and no ACLs are exact
# manifest predicates, so batched nofollow CLI checks are conclusive here.
# Any output/extra ACL row/marker or command failure refuses acceptance.
metadata_batches = []
for start in range(0, len(copy_paths), 128):
    paths = copy_paths[start:start + 128]
    xattr = run([b['xattrPath'], '-s', *paths])
    assert not xattr.stdout and not xattr.stderr, ('unexpected fresh copied xattrs', start)
    acl = run([b['lsPath'], '-Pled', *paths])
    lines = acl.stdout.decode('utf-8', 'strict').splitlines()
    assert not acl.stderr and len(lines) == len(paths), ('unexpected ACL rows', start)
    for line in lines:
        mode = line.split(None, 1)[0]
        assert len(mode) == 10 and mode[0] in '-dl' and '+' not in mode and '@' not in mode, ('ACL/attribute marker', start)
    metadata_batches.append({'count': len(paths), 'pathsSha256': digest('\0'.join(paths).encode()), 'xattrStdoutSha256': digest(xattr.stdout), 'aclStdoutSha256': digest(acl.stdout)})

def git(root, *args):
    return run([b['gitPath'], '-c', 'gc.auto=0', '-c', 'maintenance.auto=0', '-C', str(root), *args]).stdout

assert git(target, 'rev-parse', 'HEAD').strip().decode() == b['sourceSha']
assert not git(target, 'status', '--porcelain=v1', '-z', '--untracked-files=all')
flags_raw = git(target, 'ls-files', '-v', '-z')
assert digest(flags_raw) == payload['indexFlagsSha256']
flags = {item[2:].decode('utf-8', 'surrogateescape'): item[:1].decode('ascii') for item in flags_raw.split(b'\0') if item}
assert flags == payload['indexFlags']
assert {name for name, flag in flags.items() if flag != 'S'} == set(manifest)
assert digest(git(target, 'config', '--local', '--list', '-z')) == payload['gitConfigSha256']
for name, expected in b['runtimeFiles'].items(): assert file_digest(target / name) == expected, name
runner = dep / '.bin/vite-node'
assert runner.is_symlink() and os.readlink(runner) == '../vite-node/vite-node.mjs' and runner.resolve(strict=True).is_relative_to(dep)
assert m.allocated_bytes(dep, b) == payload['dependencyCopiedAllocated'] == 250314752
assert m.allocated_bytes(source_dep, b) == payload['dependencySourceAllocated'] == 250314752
assert payload['dependencyCopiedAllocated'] <= payload['dependencySourceAllocated'] + 64 * 1024**2
assert payload['sourceAllocated'] <= 64 * 1024**2
assert payload['physicalFreeDelta'] == payload['freeBefore'] - payload['freeAfter']
for pid in (supervisor['workerPid'], result['childPid']):
    for operation in (os.kill, os.killpg):
        try: operation(pid, 0)
        except ProcessLookupError: pass
        else: raise AssertionError(('run PID/group remains', pid, operation.__name__))
for p in (b['recorderLockPath'], launch['lane']['globalLock'], str(output / 'SUPERVISOR-OVERRIDE-STOP.json')): assert not os.path.lexists(p), p
ps = run(['/bin/ps', '-axo', 'comm=,args=']).stdout.decode()
(HERE / 'PS.txt').write_text(ps)
for line in ps.splitlines():
    parts = line.split(None, 1)
    if not parts: continue
    comm = pathlib.Path(parts[0]).name
    args = parts[1] if len(parts) > 1 else ''
    assert not (comm.startswith('python') and ('fixture_worker.py' in args or b['supervisorPath'] in args or b['recorderPath'] in args or b['materializerPath'] in args)), line
    assert not (comm == 'node' and ('vitest' in args or '/bin/tsc' in args or '/lib/tsc.js' in args)), line
m.assert_no_protected_writable_fds(b)
assert run(['/usr/sbin/sysctl', '-n', 'kern.bootsessionuuid']).stdout.decode().strip() == '452DE205-E1D6-462E-8673-553462BB0166'
assert 'AC Power' in run(['/usr/bin/pmset', '-g', 'batt']).stdout.decode()
assert git(b['productionRoot'], 'rev-parse', 'HEAD').strip().decode() == b['productionHead']
assert git(b['productionRoot'], 'rev-parse', 'HEAD:src').strip().decode() == '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
assert not git(b['productionRoot'], 'status', '--porcelain=v1', '-z', '--untracked-files=all')
remote = git(b['productionRoot'], 'ls-remote', 'origin', 'refs/heads/wip/headless-program-20260916-ts', 'refs/heads/main', 'refs/heads/evidence/1370-r10-clean-captures')
remote_refs = {name: value for value, name in (line.split('\t') for line in remote.decode().splitlines())}
assert remote_refs == readj(P / 'OBSERVATIONS.json')['remoteRefs']
local = git(b['productionRoot'], 'show-ref', '--heads')
(HERE / 'REMOTE-REFS.txt').write_bytes(remote)
(HERE / 'LOCAL-REFS.txt').write_bytes(local)

print('Physical source/dependency bytes, metadata, allocation, Git/runtime, groups/locks/FD/ref guards PASS; recomputing protected bytes.', flush=True)
common_digest = m.protected_snapshot(pathlib.Path(b['commonGitRoot']))
production_digest = m.protected_snapshot(pathlib.Path(b['productionRoot']))
assert common_digest == payload['protectedCommonSha256'], ('protected common changed', common_digest)
assert production_digest == payload['protectedProductionSha256'], ('protected production changed', production_digest)
m.assert_no_protected_writable_fds(b)
assert file_digest(D / 'BINDING-DRAFT.json') == BINDING_SHA and not os.path.lexists(output / 'SUPERVISOR-OVERRIDE-STOP.json')
facts = {
    'schema': '1370-r6-observed-independent-facts-r1', 'decision': 'PASS_OBSERVED_COPY_READONLY',
    'materializedRoot': str(target), 'scratchRoot': str(target), 'outputRoot': str(output),
    'bindingSha256': BINDING_SHA, 'productionHead': b['productionHead'], 'sourceSha': b['sourceSha'],
    'sourcePhysicalFiles': 176, 'sourcePhysicalBytes': 4803106,
    'dependencyCounts': counts, 'dependencyPhysicalBytes': logical_dep_bytes,
    'dependencyCopiedAllocated': payload['dependencyCopiedAllocated'], 'dependencySourceAllocated': payload['dependencySourceAllocated'],
    'sourceAllocatedAtRun': payload['sourceAllocated'], 'physicalFreeDeltaAtRun': payload['physicalFreeDelta'],
    'allCopiedRegularBytesModesInodesSinglelinksVerified': True, 'allRegularSourceCopyIndependentInodesVerified': True,
    'allRelativeLinksContainedVerified': True, 'freshCopiedMetadataMethod': '128path nofollow xattr/ls batches; all xattr stdout exactly empty, exactly one noACL/noattribute-marked line per path; all row types/modes independently lstat checked.',
    'freshMetadataPathCount': len(copy_paths), 'freshMetadataBatches': metadata_batches,
    'protectedCommonSha256': common_digest, 'protectedProductionSha256': production_digest,
    'freshProtectedByteSnapshotsMatchAuthenticatedActualWorkerPrePostProof': True,
    'actualParentHelperExit': 0, 'actualParentToolSession': 13463, 'actualHelperExitAttribution': 'Parent actual result; independently one meta start/end0 and recorder/supervisor child0 chain.',
    'recorderResultSha256': file_digest(output / 'RESULT.json'), 'supervisorSha256': file_digest(output / 'SUPERVISOR.json'),
    'payloadSha256': file_digest(output / 'child.stdout'), 'metaSha256': file_digest(meta_path),
    'recorderResult': result, 'supervisorResult': supervisor,
    'supervisorElapsedSeconds': supervisor['endMonotonic'] - supervisor['startMonotonic'],
    'noOverride': True, 'groupsClearFresh': True, 'locksClearFresh': True, 'protectedWritableFdGuardFresh': True,
    'bootSessionUuid': '452DE205-E1D6-462E-8673-553462BB0166', 'remoteRefs': remote_refs, 'localRefs': local.decode(),
    'freeBytesFresh': shutil.disk_usage(ROOT).free, 'reviewElapsedSeconds': time.monotonic() - started,
    'claimLimit': 'Copy materialization only. No historical witness/game/digest/source-freeze admission; parent separately adopts this outcome before r7 fill.'
}
(HERE / 'FACTS.json').write_text(json.dumps(facts, indent=2) + '\n')
print(json.dumps({k: v for k, v in facts.items() if k not in ('freshMetadataBatches', 'recorderResult', 'supervisorResult')}, indent=2), flush=True)
