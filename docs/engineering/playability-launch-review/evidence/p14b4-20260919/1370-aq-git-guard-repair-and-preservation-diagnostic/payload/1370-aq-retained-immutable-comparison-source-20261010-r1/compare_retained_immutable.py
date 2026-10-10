"""Read authenticated retained JSON only. No scanner, imports of candidates, or tree reads."""
import hashlib
import json
import math
import os
import stat
import sys
from pathlib import Path

BASELINE_PATH = '/Users/zacheryspector/studio-scratch/1370-aq-current-operational-fullguard-source-20261010-r1/evidence/before-fill-current-ap-r1/SNAPSHOT.json'
BASELINE_SHA = 'bc21a3dfd61812205d4499d4d0ba7cc04c868a1aa69216d3353bb4b6e278e0ec'
INPUT_CAP = 16777216
OUTPUT_CAP = 131072
DELTA_CAP = 512
MISSING = object()

def raw_role(path, cap):
    p = Path(path)
    s = p.lstat()
    if not p.is_absolute() or p.resolve(strict=True) != p or not stat.S_ISREG(s.st_mode) or s.st_nlink != 1 or s.st_size > cap:
        raise ValueError('INPUT_ROLE_INVALID')
    data = p.read_bytes()
    after = p.lstat()
    fields = ('st_dev', 'st_ino', 'st_mode', 'st_nlink', 'st_size', 'st_mtime_ns', 'st_ctime_ns')
    if any(getattr(s, k) != getattr(after, k) for k in fields) or len(data) != s.st_size:
        raise ValueError('INPUT_CHANGED_DURING_READ')
    return {'path': str(p), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}, data

def unique_pairs(pairs):
    out = {}
    for key, value in pairs:
        if key in out:
            raise ValueError('DUPLICATE_JSON_KEY')
        out[key] = value
    return out

def strict_json(data):
    def nonfinite(value):
        raise ValueError('NONFINITE_JSON_NUMBER')
    out = json.loads(data, object_pairs_hook=unique_pairs, parse_constant=nonfinite)
    stack = [out]
    while stack:
        value = stack.pop()
        if type(value) is dict:
            stack.extend(value.values())
        elif type(value) is list:
            stack.extend(value)
        elif type(value) is float and not math.isfinite(value):
            raise ValueError('NONFINITE_JSON_NUMBER')
    return out

def authenticate_role(role):
    if type(role) is not dict or set(role) != {'path', 'bytes', 'sha256'} or type(role['path']) is not str or type(role['bytes']) is not int or type(role['sha256']) is not str:
        raise ValueError('ROLE_SCHEMA_INVALID')
    actual, data = raw_role(role['path'], INPUT_CAP)
    if actual != role:
        raise ValueError('ROLE_BYTES_OR_SHA_MISMATCH')
    return strict_json(data)

def typed(value):
    if value is MISSING:
        return {'type': 'missing'}
    return {'type': type(value).__name__, 'value': value}

def changes(before, after, prefix=()):
    # One explicit typed replacement at the first type boundary. For matching
    # containers, descend to every changed leaf. String keys never become indices.
    stack = [(prefix, before, after)]
    while stack:
        path, a, b = stack.pop()
        if type(a) is dict and type(b) is dict:
            keys = sorted(set(a) | set(b))
            for key in reversed(keys):
                stack.append((path + (key,), a.get(key, MISSING), b.get(key, MISSING)))
        elif type(a) is list and type(b) is list:
            for index in range(max(len(a), len(b)) - 1, -1, -1):
                stack.append((path + (index,), a[index] if index < len(a) else MISSING, b[index] if index < len(b) else MISSING))
        elif type(a) is not type(b) or a != b:
            yield {'path': list(path), 'before': typed(a), 'after': typed(b)}

def encoded(value):
    return (json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=True, allow_nan=False) + '\n').encode('utf-8')

def compare(baseline_role, actual_role):
    if baseline_role.get('path') != BASELINE_PATH or baseline_role.get('sha256') != BASELINE_SHA:
        raise ValueError('WRONG_BASELINE_AUTHORITY')
    baseline = authenticate_role(baseline_role)
    actual = authenticate_role(actual_role)
    before = baseline['immutable']
    if type(before) is not dict or type(actual) is not dict:
        raise ValueError('IMMUTABLE_MAP_TYPE_INVALID')
    top_keys = sorted(set(before) | set(actual))
    if len(top_keys) > 256:
        raise ValueError('TOP_LEVEL_KEY_BOUND')
    differing = []
    for key in top_keys:
        if next(changes(before.get(key, MISSING), actual.get(key, MISSING)), None) is not None:
            differing.append(key)
    report = {
        'schema': '1370-retained-immutable-comparison/v1',
        'status': 'COMPLETE_TYPED_RETAINED_MAP_COMPARISON_ONLY',
        'source': raw_role(__file__, OUTPUT_CAP)[0],
        'baseline': baseline_role, 'actualImmutable': actual_role,
        'differingTopLevelKeys': differing, 'differences': [],
        'differenceCoverageComplete': True,
        'bounds': {'inputBytesEach': INPUT_CAP, 'outputBytesIncludingNewline': OUTPUT_CAP, 'changedPaths': DELTA_CAP},
        'aggregateProtectedDigestCannotIdentifyIndividualLeaf': True,
        'archiveDisposition': 'LOCAL_HASH_SIZE_ONLY',
        'original54871Accepted': False, 'protectionAccepted': False,
        'filesystemTreesRead': False, 'originalGuardExecuted': False,
        'executionAuthorization': False,
    }
    reason = None
    for row in changes(before, actual):
        if len(report['differences']) >= DELTA_CAP:
            reason = 'COMPLETE_CHANGED_PATH_LIST_OVER_BOUND'
            break
        report['differences'].append(row)
        if len(encoded(report)) > OUTPUT_CAP:
            reason = 'COMPLETE_OUTPUT_BYTES_OVER_BOUND'
            break
    if reason is not None:
        # Refuse the entire delta list, retaining the complete differing top keys.
        report.update(status='STOP_COMPLETE_COMPARISON_OUTPUT_OVER_BOUND',
                      refusalReason=reason, differenceCoverageComplete=False,
                      differences=[])
    data = encoded(report)
    if len(data) > OUTPUT_CAP:
        raise ValueError('REFUSAL_OUTPUT_OVER_BOUND')
    return report, data

def main():
    if len(sys.argv) != 4:
        raise ValueError('CLI: baseline-role-json actual-map-role-json fresh-output-json')
    _, baseline_bytes = raw_role(sys.argv[1], 8192)
    _, actual_bytes = raw_role(sys.argv[2], 8192)
    report, data = compare(strict_json(baseline_bytes), strict_json(actual_bytes))
    target = Path(sys.argv[3])
    if not target.is_absolute() or target.parent.resolve(strict=True) != target.parent or Path('/Users/zacheryspector/studio-scratch') not in target.parents:
        raise ValueError('OUTPUT_PARENT_INVALID')
    if target in (Path(report['baseline']['path']), Path(report['actualImmutable']['path']), Path(sys.argv[1]), Path(sys.argv[2]), Path(__file__)):
        raise ValueError('OUTPUT_INPUT_COLLISION')
    fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, 'wb') as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())
    target.chmod(0o444)
    # Print the role only; complete local comparison values are never stdout.
    print(json.dumps({'output': raw_role(target, OUTPUT_CAP)[0], 'status': report['status'],
                      'archiveDisposition': 'LOCAL_HASH_SIZE_ONLY'}, sort_keys=True))
    return 0 if report['differenceCoverageComplete'] else 2

if __name__ == '__main__':
    raise SystemExit(main())
