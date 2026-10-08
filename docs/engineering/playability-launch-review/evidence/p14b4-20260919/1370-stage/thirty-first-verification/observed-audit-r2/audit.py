#!/usr/bin/env python3
"""Independent read-only audit of the completed E0G p13a r12 clean leaf."""
import hashlib
import json
import re
import subprocess
import zlib
from datetime import datetime, timezone
from pathlib import Path

B = Path('/Users/zacheryspector/studio-scratch')
R = Path('/Users/zacheryspector/The-Movies-headless-program')
O = B / '1370-e0g-p13a-clean-observed-review-r12-r2'
RUN = 'r12-e0g-p13a-clean-20261007-1850'
NAME = 'e0g-p13a-clean-' + RUN
T = B / '1370-ag-e0g-full-state-clean-recorded-r12' / NAME
E = B / '1370-ag-e0g-full-state-clean-outer-recorded-r12' / NAME
L = B / f'1370-ag-e0g-full-state-r12-{NAME}.lane.log'
M = Path(str(L) + '.meta')
HEAD = 'b995a83e5363a3843f9b902e08c2df4dd95840cb'
TREE = '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
MANIFEST = 'ed8826f5cdf563c4aceee2fc6a22dbe2263f6f705f43ec622cff281a52d9f703'
REVIEW = 'a18026f9e5bff44945d956a548c5f80c19771f82bfab4d70b564eee77d9a9896'
TYPES = '2c0b373753393dae964cb21aa30b02929e53749f40ab38751e530a8e1b3f328b'
ARM = 'E0G'
SEED = 'p13a-core-causal-01'

def sha(p):
    h = hashlib.sha256()
    with p.open('rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()

def obj(p):
    assert p.is_file() and not p.is_symlink(), f'missing regular file {p}'
    return json.loads(p.read_bytes())

def git(*args):
    return subprocess.check_output(['git', '-C', str(R), *args], text=True).strip()

def scan_gzip_members(path):
    raw_hash = hashlib.sha256()
    compressed_hash = hashlib.sha256()
    raw_bytes = compressed_bytes = members = max_row = 0
    last = None
    pending = b''
    stream = None
    parts = []
    with path.open('rb') as f:
        while True:
            if not pending:
                chunk = f.read(1 << 16)
                if not chunk:
                    assert stream is None and members == 417, 'truncated or wrong member count'
                    break
                compressed_hash.update(chunk)
                compressed_bytes += len(chunk)
                pending = chunk
            if stream is None:
                stream = zlib.decompressobj(16 + zlib.MAX_WBITS)
                parts = []
            out = stream.decompress(pending)
            assert not stream.unconsumed_tail, 'unexpected unconsumed tail'
            pending = stream.unused_data if stream.eof else b''
            parts.append(out)
            if stream.eof:
                row_bytes = b''.join(parts)
                assert row_bytes.endswith(b'\n') and row_bytes.count(b'\n') == 1, f'bad row framing {members}'
                assert len(row_bytes) <= (16 << 20), f'row cap exceeded {members}'
                row = json.loads(row_bytes)
                assert row['boundary'] == row['week'] == members, f'wrong identity {members}'
                assert row['role'] == ARM and row['seed'] == SEED
                assert row['originalState']['market']['tick'] == members
                assert row['save']['saveVersion'] == 46
                assert row['save']['state'] == row['originalState']
                assert row['rng'] == row['originalState']['rngState']
                assert row['marketReceiptCount'] == len(row['originalState']['talentMarket']['receipts'])
                assert row['industryReceiptCount'] == len(row['originalState']['hollywood']['receipts'])
                assert isinstance(row['owner'], list) and len(row['owner']) == 4
                assert isinstance(row['emptyProof'], dict)
                raw_hash.update(row_bytes)
                raw_bytes += len(row_bytes)
                max_row = max(max_row, len(row_bytes))
                last = row
                members += 1
                assert members <= 417
                stream = None
    return {'members': members, 'rawBytes': raw_bytes, 'rawSha256': raw_hash.hexdigest(),
            'compressedBytes': compressed_bytes, 'compressedSha256': compressed_hash.hexdigest(),
            'maxRowBytes': max_row, 'last': last}

def audit():
    assert sha(B / '1370-ag-e0g-full-state-clean-proposal-r12/MANIFEST.json') == MANIFEST
    assert sha(B / '1370-ag-e0g-full-state-clean-independent-review-r12/RECEIPT.json') == REVIEW
    assert sha(B / '1370-ag-e0g-full-state-types-observed-review-r12/RECEIPT.json') == TYPES
    assert git('status', '--porcelain=v1') == ''
    assert git('rev-parse', 'HEAD') == HEAD and git('rev-parse', 'HEAD:src') == TREE
    assert subprocess.check_output(['git','-C',str(R),'ls-remote','origin','refs/heads/wip/headless-program-20260916-ts'],text=True).split()[0] == HEAD
    assert re.search(r'(?m)^end, exit 0; ', M.read_text()) and len(re.findall(r'(?m)^end, exit ', M.read_text())) == 1
    assert L.is_file() and not L.is_symlink()
    t = obj(T / 'RESULT.json'); e = obj(E / 'RESULT.json')
    tsha = sha(T / 'RESULT.json'); esha = sha(E / 'RESULT.json')
    assert obj(T / 'RESULT.sha256.json') == {'sha256': tsha}
    assert obj(E / 'RESULT.sha256.json') == {'sha256': esha}
    assert t['status'] == e['status'] == 'STAGE_PASS' and t['stagePassed'] is True and e['stagePassed'] is True
    assert t['arm'] == e['arm'] == ARM and t['seed'] == e['seed'] == SEED
    assert t['stage'] == e['stage'] == 'clean'
    assert t['classification'] == 'ORIGINAL_CAP_DIAGNOSTIC'
    assert t['head'] == e['head'] == HEAD and t['manifestSha256'] == e['manifestSha256'] == MANIFEST
    assert e['reviewSha256'] == REVIEW and e['runId'] == RUN and e['targetResultSha256'] == tsha
    assert t['child'] == {'elapsedCapSeconds': 300, 'exit': 0, 'timedOut': False}
    assert e['childExit'] == 0 and e['deadlineSeconds'] == 330 and 0 < e['elapsedSeconds'] < 330
    assert t['preflight'] == t['postflight'] and t['mirrorPreflightSha256'] == t['mirrorPostflightSha256']
    assert t['preflight']['head'] == HEAD and t['preflight']['sourceTree'] == TREE and t['preflight']['power'] == 'AC Power'
    type_admission = obj(B / '1370-ag-e0g-full-state-types-observed-review-r12/RECEIPT.json')['leaves']['E0G:p13a-core-causal-01']
    assert t['typesAdmission'] == {'observedAuditReceiptSha256': TYPES, 'typesRunId': type_admission['runId'],
                                  'targetResultSha256': type_admission['targetResultSha256'], 'outerResultSha256': type_admission['outerResultSha256']}
    assert e['ownershipErrors'] == e['survivedBeforeCleanup'] == e['survivors'] == []
    assert e['knownGroups'] and set(map(str, e['knownGroups'])) == set(e['cleanup'])
    assert all(e['cleanup'].values())
    for stage, floor in [('environmentPreflight',4563402752),('environmentDuringLast',3221225472),('environmentPostflight',3221225472)]:
        env = e[stage]
        assert env['power'] == 'AC Power' and env['minimumBytes'] == floor and env['freeBytes'] >= floor
    assert obj(E / 'WATCHDOG.json')['status'] == 'FINALIZED_AFTER_RESULT'
    assert obj(E / 'WATCHDOG.json')['resultSha256'] == esha
    assert obj(T / 'LAUNCH.json') and obj(E / 'LAUNCH.json')
    for directory, result in [(T,t),(E,e)]:
        assert sha(directory / 'child.stdout.log') == result['childStdoutSha256']
        assert sha(directory / 'child.stderr.log') == result['childStderrSha256']
    art = t['cleanArtifacts']
    for path, field in [('summary.json','summarySha256'),('progress.ndjson','progressSha256'),('vitest.json','vitestSha256'),('readback-audit.json','readbackAuditSha256')]:
        assert sha(T / path) == art[field], f'artifact mismatch {path}'
    scanned = scan_gzip_members(T / 'boundaries.ndjson.gz')
    assert scanned['members'] == art['boundaryCount'] == 417
    assert scanned['rawBytes'] == art['boundaryUncompressedBytes']
    assert scanned['compressedBytes'] == art['boundaryCompressedBytes']
    assert scanned['compressedSha256'] == art['boundariesSha256']
    summary = obj(T / 'summary.json')
    assert summary['schema'] == '1370-ag-e0g-full-state-leaf-r12-gzip-verified'
    assert summary['role'] == ARM and summary['seed'] == SEED and summary['version'] == 46
    assert summary['ticks'] == 416 and summary['boundaries'] == scanned['members']
    assert summary['boundaryBytes'] == scanned['rawBytes'] and summary['boundarySha256'] == scanned['rawSha256']
    assert summary['boundaryCompressedBytes'] == scanned['compressedBytes']
    assert summary['boundaryCompressedSha256'] == scanned['compressedSha256']
    assert summary['boundaryEncoding'] == 'gzip-concatenated-members-one-per-boundary'
    assert summary['progressRows'] == summary['observerProbeWeeks'] == 8 and summary['observerProbePassed'] is True
    assert summary['terminal'] == art['terminal']
    last = scanned['last']['originalState']
    assert last['market']['tick'] == 416
    assert summary['terminal']['marketReceiptRows'] == len(last['talentMarket']['receipts'])
    assert summary['terminal']['industryReceiptRows'] == len(last['hollywood']['receipts'])
    assert summary['terminal']['employmentRows'] == len(last['hollywood']['employment'])
    assert summary['terminal']['firstTakeRows'] == len(last['firstTakes'])
    assert summary['terminal']['rng'] == last['rngState']
    readback = obj(T / 'readback-audit.json')
    assert readback == {'schema':'1370-ag-e0g-full-state-readback-r12','role':ARM,'seed':SEED,
                        'rows':417,'rawBytes':scanned['rawBytes'],'rawSha256':scanned['rawSha256'],
                        'sourceRuntime':'pinned Vitest Node plus source exportSave and representation proof'}
    vitest = obj(T / 'vitest.json')
    assert vitest['success'] is True and vitest['numTotalTestSuites'] == vitest['numPassedTestSuites'] == 1
    assert vitest['numTotalTests'] == vitest['numPassedTests'] == 2
    assert vitest['numFailedTests'] == 0 and vitest['numFailedTestSuites'] == 0
    assertions = vitest['testResults'][0]['assertionResults']
    assert len(assertions) == 2 and all(a['status'] == 'passed' for a in assertions)
    assert any('stored full-state readback' in a['fullName'] for a in assertions)
    progress = [json.loads(line) for line in (T / 'progress.ndjson').read_text().splitlines()]
    assert len(progress) == 8 and [r['week'] for r in progress] == [52,104,156,208,260,312,364,416]
    assert all(r['elapsedSeconds'] >= 0 for r in progress)
    return {'targetResultSha256':tsha,'outerResultSha256':esha,'summarySha256':art['summarySha256'],
            'boundariesSha256':scanned['compressedSha256'],'logicalSha256':scanned['rawSha256'],
            'logicalBytes':scanned['rawBytes'],'compressedBytes':scanned['compressedBytes'],
            'members':scanned['members'],'maxRowBytes':scanned['maxRowBytes'],
            'elapsedSeconds':e['elapsedSeconds'],'preflightFreeBytes':e['environmentPreflight']['freeBytes'],
            'postflightFreeBytes':e['environmentPostflight']['freeBytes'],
            'vitestSha256':art['vitestSha256'],'readbackAuditSha256':art['readbackAuditSha256'],
            'laneMetaSha256':sha(M),'laneLogSha256':sha(L)}

def main():
    O.mkdir(parents=True, exist_ok=True)
    try:
        detail = audit()
        decision = 'ACCEPT_OBSERVED_R12_E0G_P13A_CLEAN_ONLY'
        failure = None
    except Exception as exc:
        detail = None
        decision = 'STOP_OBSERVED_R12_E0G_P13A_CLEAN'
        failure = f'{type(exc).__name__}: {exc}'
    report = f'# Independent E0G p13a r12 clean observed audit\n\nDecision: **{decision}**. This admits only the one E0G p13a clean leaf under the original 300/330-second caps. It does not admit AG, E0G adoption, comparator, or the 1363 ledger.\n\nObserved UTC: {datetime.now(timezone.utc).isoformat()}\n\n'
    if detail:
        report += ('The lane recorded actual child exit 0. Target and recorder both passed, with matching SHA sidecars, unchanged source guards, admitted fresh types receipt, AC power, free-space floors, and no surviving children.\n\n'
                   f'Independent gzip member readback found **{detail["members"]}** complete CRC-checked members, {detail["logicalBytes"]} logical bytes, {detail["compressedBytes"]} compressed bytes, and a largest row of {detail["maxRowBytes"]} bytes. Uncompressed and compressed SHA-256 values match summary and target result. Source-bound Vitest captured and reread all 417 rows; both tests passed.\n\n'
                   f'Run `{RUN}` elapsed {detail["elapsedSeconds"]:.3f}s; target `{detail["targetResultSha256"]}`; recorder `{detail["outerResultSha256"]}`; compressed boundaries `{detail["boundariesSha256"]}`; logical rows `{detail["logicalSha256"]}`.\n')
    else:
        report += f'Failure: {failure}\n'
    (O / 'REPORT.md').write_text(report)
    receipt = {'decision':decision,'runId':RUN,'arm':ARM,'seed':SEED,'stage':'clean',
               'manifestSha256':MANIFEST,'staticReviewSha256':REVIEW,'typesAuditReceiptSha256':TYPES,
               'reportSha256':sha(O / 'REPORT.md')}
    if detail: receipt.update(detail)
    if failure: receipt['failure'] = failure
    (O / 'RECEIPT.json').write_text(json.dumps(receipt,sort_keys=True,separators=(',',':'))+'\n')
    print(decision, sha(O/'REPORT.md'), sha(O/'RECEIPT.json'))
    if failure: raise SystemExit(1)

if __name__ == '__main__': main()
