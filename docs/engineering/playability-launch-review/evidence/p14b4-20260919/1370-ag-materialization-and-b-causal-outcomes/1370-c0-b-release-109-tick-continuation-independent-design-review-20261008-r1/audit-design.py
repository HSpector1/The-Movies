"""Read-only metadata/pin audit. No gzip decode, game import, source test or Git command."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import stat

DESIGN = Path('/Users/zacheryspector/studio-scratch/1370-c0-b-release-109-tick-continuation-design-20261008-r1')
REVIEW = Path(__file__).parent
MAX = 16 * 1024 * 1024
pins = {}

def metadata(s):
    return [s.st_dev, s.st_ino, s.st_mode, s.st_nlink, s.st_size, s.st_mtime_ns, s.st_ctime_ns]

def read(p, expected=None):
    p = Path(p)
    before = p.lstat()
    assert stat.S_ISREG(before.st_mode) and before.st_nlink == 1 and before.st_size <= MAX, str(p)
    fd = os.open(p, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        assert metadata(os.fstat(fd)) == metadata(before), str(p)
        chunks = []
        size = 0
        while True:
            b = os.read(fd, min(65536, MAX + 1 - size))
            if not b:
                break
            size += len(b)
            assert size <= MAX, str(p)
            chunks.append(b)
        assert metadata(os.fstat(fd)) == metadata(before), str(p)
    finally:
        os.close(fd)
    assert metadata(p.lstat()) == metadata(before), str(p)
    b = b''.join(chunks)
    pin = dict(path=str(p), bytes=len(b), sha256=hashlib.sha256(b).hexdigest())
    if expected:
        assert pin == expected, [pin, expected]
    pins[str(p)] = pin
    return b

manifest_pin = dict(path=str(DESIGN/'MANIFEST.json'), bytes=2100,
                    sha256='964cc771f30ec1c6f587b4d1d514c21037ca7086c0d02d25d0920f013c075972')
m = json.loads(read(manifest_pin['path'], manifest_pin))
files = {n: read(v['path'], v) for n,v in m['files'].items()}
roles = json.loads(files['ROLES.json'])
index = json.loads(files['MEMBER-INDEX-307-416.json'])
role_bytes = {n: read(v['path'], v) for n,v in roles['roles'].items()}
assert read(roles['memberIndex']['path'], roles['memberIndex']) == files['MEMBER-INDEX-307-416.json']
comparator = json.loads(role_bytes['publishedBoundaryComparator'])
assert index['publishedComparator'] == roles['roles']['publishedBoundaryComparator']
assert index['publishedObservedReview'] == roles['roles']['publishedBoundaryComparatorObserved']
assert index['capture'] == roles['capture']
assert comparator['seed'] == m['seed'] == 'p13-public-commercial-adoption'
assert index['members'] == [v['ebg'] for v in comparator['boundaryIndex'][307:417]]
assert [v['member'] for v in index['members']] == list(range(307,417))
assert len(index['members']) == index['count'] == m['boundariesPerArm'] == 110
assert m['publicTicksPerArm'] == m['endBoundary'] - m['startBoundary'] == 109
for a,b in zip(index['members'],index['members'][1:]):
    assert a['gzipOffsetEnd'] == b['gzipOffsetStart']
for v in index['members']:
    assert 0 < v['bytes'] <= MAX and 0 < v['gzipOffsetEnd']-v['gzipOffsetStart'] <= MAX
assert index['members'][-1]['gzipOffsetEnd'] == roles['capture']['bytes'] == 141237093
raw = sum(v['bytes'] for v in index['members'])
compressed = sum(v['gzipOffsetEnd']-v['gzipOffsetStart'] for v in index['members'])
assert raw == index['totalDecodedBytes'] == 497784931
assert compressed == index['selectedCompressedBytes'] == 51663321
facts = json.loads(role_bytes['oneTickFacts'])
diff = roles['oneTickMeasuredDifferences']
assert diff['paths'] == facts['completeDifferentPaths'] and diff['count'] == facts['fullFieldDiffCount'] == 32
assert diff['selectedContracts'] == facts['selectedContracts'] and len(diff['selectedContracts']) == 6
for key in ['additionalOverhead','additionalPayroll','baselineTerminationDelta','interventionTerminationDelta','netCashDifference','internalReleasePredicates']:
    assert diff[key] == facts[key]
assert m['candidateWholeFileSha256'] == roles['roles']['interventionWholeFile']['sha256']
assert m['productionHead'] == roles['productionHead'] == '4812bb123781632dd39e44f918eb85a6a2c12623'
assert m['productionSourceTree'] == roles['productionSourceTree'] == '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
adoption = json.loads(role_bytes['parentOneTickAdoption'])
observed = json.loads(role_bytes['observedOneTick'])
assert observed['decision'] == 'ACCEPT_OBSERVED_ONE_TICK_DIAGNOSTIC_ONLY'
assert roles['roles']['observedOneTick']['sha256'] == '98adcb7132bf1a3eb877f2acac02c056ce4eb65142e708cc2365d929059d8918'
assert not m['executionAuthorization'] and not m['sourceAuthoringAuthorized']
assert not m['sourceCodeAuthored'] and not m['simulationRun'] and not m['testsRun'] and not m['gzipDecoded']
assert m['proposedCaps'] == dict(activeSeconds=375,childCombinedLogBytes=1048576,combinedNodeSeconds=300,
 finalReserveInsideTotalBytes=131072,preflightFreeBytes=3657433088,runningFloorWithReserveBytes=3355443200,
 singleJsonReportDecodedMemberBytes=16777216,totalCountedOutputBytes=268435456,wholeRecorderSeconds=390)
result = dict(schema='1370-b-109-tick-independent-design-metadata-audit-r1',
 utc=datetime.datetime.now(datetime.timezone.utc).isoformat(), designManifest=manifest_pin,
 authenticatedUniqueSmallInputs=len(pins), authenticatedRoleEntries=len(roles['roles']),
 all110LocatorsEqualPublishedComparator=True, contiguousMembers307Through416=True,
 all32OneTickPathsAndSixSelectedIdentitiesEqualObservedFacts=True,
 rawSelectedBytes=raw, compressedSelectedBytes=compressed,
 maximumDecodedMemberBytes=max(v['bytes'] for v in index['members']),
 maximumCompressedMemberBytes=max(v['gzipOffsetEnd']-v['gzipOffsetStart'] for v in index['members']),
 fullCaptureHashReadThisReview=False, capturePinBasis='Previously accepted observed capture/comparator chain; no full capture rehash or gzip decode during design review.',
 gzipDecoded=False, gameRun=False, sourceTestsRun=False, gitCommands=False, productionWrites=False,
 pins=list(pins.values()))
out = (json.dumps(result,sort_keys=True,indent=2)+'\n').encode()
fd=os.open(REVIEW/'AUDIT.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
try:
    with os.fdopen(fd,'wb') as f:
        f.write(out); f.flush(); os.fsync(f.fileno())
except BaseException:
    raise
print(json.dumps(dict(auditBytes=len(out),auditSha256=hashlib.sha256(out).hexdigest(),uniqueInputs=len(pins),roleEntries=len(roles['roles']),all110LocatorsEqual=True)))
