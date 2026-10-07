#!/usr/bin/env python3
"""Read-only, independent observed audit of the four frozen r12 type leaves."""
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

BASE = Path('/Users/zacheryspector/studio-scratch')
OUT = BASE / '1370-ag-e0g-full-state-types-observed-review-r12'
PKG = BASE / '1370-ag-e0g-full-state-clean-proposal-r12'
PLAN = BASE / '1370-r12-types-launch-plan'
STATIC = BASE / '1370-r12-types-launch-independent-review-r1'
PACKAGE_REVIEW = BASE / '1370-ag-e0g-full-state-clean-independent-review-r12/RECEIPT.json'
REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
TARGET_ROOT = BASE / '1370-ag-e0g-full-state-clean-recorded-r12'
OUTER_ROOT = BASE / '1370-ag-e0g-full-state-clean-outer-recorded-r12'
HEAD = 'b995a83e5363a3843f9b902e08c2df4dd95840cb'
TREE = '13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
MANIFEST_SHA = 'ed8826f5cdf563c4aceee2fc6a22dbe2263f6f705f43ec622cff281a52d9f703'
PACKAGE_REVIEW_SHA = 'a18026f9e5bff44945d956a548c5f80c19771f82bfab4d70b564eee77d9a9896'
TEMPLATE_SHA = '667f12dd71f791b6986707c3f83ad57fbe9c39dfc53c34e68bf55b30064cd442'
STATIC_SHA = '942a0fc39c17121e3521e426dc5fa553731f7db1a0247a0e799612bf92588072'
PLAN_SHA = 'bd083f2cd07fc2be3fffbe1f75b8a31656917fa302d3cfcde704fd2d5b2c6b39'
LEAVES = [
    ('AG', 'p13a-core-causal-01', 'ag-p13a', 'r12-ag-p13a-types-20261007-1830', '13fcac9efa3c8bd0d5f49b06b5146ac1b35bfbb261c590809ab6a7b52b55476b'),
    ('AG', 'p13-public-commercial-adoption', 'ag-adoption', 'r12-ag-adoption-types-20261007-1830', 'a6baa863d4b0a1c22c9f7257a887454fa4d32bde692177631464aaac60f61101'),
    ('E0G', 'p13a-core-causal-01', 'e0g-p13a', 'r12-e0g-p13a-types-20261007-1830', '518d8d6137f43a16ed48d09bed700bbcccce25a33a0faaa4bc3f490ffea12135'),
    ('E0G', 'p13-public-commercial-adoption', 'e0g-adoption', 'r12-e0g-adoption-types-20261007-1830', '4a0114fe340c1efb6d8c8e346d7f8052f76fbbbeafd75924260c5570f9e82c54'),
]

def sha(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(1 << 20), b''):
            h.update(block)
    return h.hexdigest()

def read_json(path):
    assert path.is_file() and not path.is_symlink(), f'missing regular file: {path}'
    return json.loads(path.read_bytes())

def exact_sha(path, expected):
    observed = sha(path)
    assert observed == expected, f'SHA mismatch {path}: {observed} != {expected}'
    return observed

def git(*args):
    return subprocess.check_output(['git', '-C', str(REPO), *args], text=True).strip()

def audit_leaf(arm, seed, tag, run_id, command_sha):
    exact_sha(PLAN / f'{tag}.command', command_sha)
    name = f'{tag}-types-{run_id}'
    target = TARGET_ROOT / name
    outer = OUTER_ROOT / name
    lane_log = BASE / f'1370-ag-e0g-full-state-r12-{name}.lane.log'
    lane_meta = Path(str(lane_log) + '.meta')
    meta = lane_meta.read_text()
    assert re.search(r'(?m)^end, exit 0; .+$', meta), f'lane child did not exit 0: {name}'
    assert len(re.findall(r'(?m)^end, exit ', meta)) == 1, f'ambiguous lane end: {name}'
    assert lane_log.is_file() and not lane_log.is_symlink(), f'missing lane log: {name}'
    tfile = target / 'RESULT.json'; ofile = outer / 'RESULT.json'
    t = read_json(tfile); o = read_json(ofile)
    tsha = sha(tfile); osha = sha(ofile)
    assert read_json(target / 'RESULT.sha256.json') == {'sha256': tsha}, f'target sidecar: {name}'
    assert read_json(outer / 'RESULT.sha256.json') == {'sha256': osha}, f'outer sidecar: {name}'
    assert t['schema'] == '1370-ag-e0g-full-state-clean-leaf-route-r12'
    assert o['schema'] == '1370-ag-e0g-full-state-clean-outer-result-r12'
    assert t['status'] == o['status'] == 'STAGE_PASS'
    assert t['stagePassed'] is True and o['stagePassed'] is True
    assert t['classification'] == 'TYPES_ONLY'
    assert t['stage'] == o['stage'] == 'types'
    assert t['head'] == o['head'] == HEAD
    assert t['manifestSha256'] == o['manifestSha256'] == MANIFEST_SHA
    assert o['reviewSha256'] == PACKAGE_REVIEW_SHA
    assert t['arm'] == o['arm'] == arm and t['seed'] == o['seed'] == seed
    assert o['runId'] == run_id
    assert t['child'] == {'elapsedCapSeconds': 300, 'exit': 0, 'timedOut': False}
    assert t['preflight'] == t['postflight']
    assert t['mirrorPreflightSha256'] == t['mirrorPostflightSha256']
    assert t['preflight']['head'] == HEAD and t['preflight']['sourceTree'] == TREE
    assert t['preflight']['power'] == 'AC Power'
    assert o['targetResultSha256'] == tsha
    assert o['childExit'] == 0 and o['deadlineSeconds'] == 330
    assert 0 < o['elapsedSeconds'] < 330
    assert o['ownershipErrors'] == [] and o['survivedBeforeCleanup'] == [] and o['survivors'] == []
    assert o['knownGroups'] and set(map(str, o['knownGroups'])) == set(o['cleanup'])
    assert all(value is True for value in o['cleanup'].values())
    for stage in ('environmentPreflight', 'environmentDuringLast', 'environmentPostflight'):
        env = o[stage]
        assert env['power'] == 'AC Power' and env['freeBytes'] >= env['minimumBytes'], f'{stage} failed: {name}'
    assert o['environmentPreflight']['minimumBytes'] == 4563402752
    assert o['environmentDuringLast']['minimumBytes'] == o['environmentPostflight']['minimumBytes'] == 3221225472
    assert read_json(outer / 'WATCHDOG.json')['status'] == 'FINALIZED_AFTER_RESULT'
    assert read_json(outer / 'WATCHDOG.json')['resultSha256'] == osha
    assert read_json(target / 'LAUNCH.json') and read_json(outer / 'LAUNCH.json')
    assert sha(target / 'child.stdout.log') == t['childStdoutSha256']
    assert sha(target / 'child.stderr.log') == t['childStderrSha256']
    assert sha(outer / 'child.stdout.log') == o['childStdoutSha256']
    assert sha(outer / 'child.stderr.log') == o['childStderrSha256']
    return {
        'runId': run_id, 'targetResultSha256': tsha, 'outerResultSha256': osha,
        'laneMetaSha256': sha(lane_meta), 'laneLogSha256': sha(lane_log),
        'elapsedSeconds': o['elapsedSeconds'],
        'preflightFreeBytes': o['environmentPreflight']['freeBytes'],
        'postflightFreeBytes': o['environmentPostflight']['freeBytes'],
    }

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    assertions = []
    details = {}
    try:
        exact_sha(PKG / 'MANIFEST.json', MANIFEST_SHA)
        exact_sha(PACKAGE_REVIEW, PACKAGE_REVIEW_SHA)
        exact_sha(BASE / '1370-ag-e0g-full-state-clean-proposal-r12.EXACT-LANE-COMMANDS.txt', TEMPLATE_SHA)
        exact_sha(PLAN / 'PLAN.md', PLAN_SHA)
        exact_sha(STATIC / 'REPORT.md', STATIC_SHA)
        sr = read_json(STATIC / 'RECEIPT.json')
        assert sr['decision'] == 'ACCEPT_STATIC_TYPES_LAUNCH_ONLY'
        assert sr['manifestSha256'] == MANIFEST_SHA and sr['packageStaticReviewReceiptSha256'] == PACKAGE_REVIEW_SHA
        assert sr['planSha256'] == PLAN_SHA and sr['templateSha256'] == TEMPLATE_SHA
        manifest = read_json(PKG / 'MANIFEST.json')
        assert manifest['head'] == HEAD and manifest['headSourceTree'] == TREE
        assert git('rev-parse', '--abbrev-ref', 'HEAD') == 'wip/headless-program-20260916-ts'
        assert git('status', '--porcelain=v1') == ''
        assert git('rev-parse', 'HEAD') == HEAD and git('rev-parse', 'HEAD:src') == TREE
        remote = subprocess.check_output(['git', '-C', str(REPO), 'ls-remote', 'origin', 'refs/heads/wip/headless-program-20260916-ts'], text=True).split()[0]
        assert remote == HEAD
        assertions.append('Frozen package, launch plan, static receipts, source HEAD/tree, clean branch, and remote source pin verified.')
        for arm, seed, tag, run_id, command_sha in LEAVES:
            key = f'{arm}:{seed}'
            details[key] = audit_leaf(arm, seed, tag, run_id, command_sha)
            assertions.append(f'{key}: actual lane child exit 0; target and recorder STAGE_PASS; sidecars, source, environment, and cleanup verified.')
        receipt = {
            'decision': 'ACCEPT_OBSERVED_R12_TYPES_ONLY',
            'manifestSha256': MANIFEST_SHA,
            'staticReviewSha256': PACKAGE_REVIEW_SHA,
            'leaves': {key: {field: row[field] for field in ('runId', 'targetResultSha256', 'outerResultSha256')} for key, row in details.items()},
        }
        decision = receipt['decision']
    except Exception as error:
        decision = 'STOP_OBSERVED_R12_TYPES_INCOMPLETE_OR_FAILED'
        assertions.append(f'FAIL: {type(error).__name__}: {error}')
        receipt = {'decision': decision, 'manifestSha256': MANIFEST_SHA, 'staticReviewSha256': PACKAGE_REVIEW_SHA, 'leaves': {}}
    report = '# Independent observed r12 types audit\n\n'
    report += f'Decision: **{decision}**. Scope is the four frozen TYPES_ONLY leaves; no clean simulation or ledger acceptance is claimed.\n\n'
    report += f'Observed UTC: {datetime.now(timezone.utc).isoformat()}\n\n'
    report += '\n'.join(f'- {line}' for line in assertions) + '\n\n'
    for key, row in details.items():
        report += f'- `{key}`: run `{row["runId"]}`, target `{row["targetResultSha256"]}`, outer `{row["outerResultSha256"]}`, elapsed {row["elapsedSeconds"]:.3f}s, free pre/post {row["preflightFreeBytes"]}/{row["postflightFreeBytes"]} bytes.\n'
    report += '\nThe receipt pins only observed type-stage results. Clean route commands must independently verify it and retain all other admission guards.\n'
    (OUT / 'REPORT.md').write_text(report)
    receipt['reportSha256'] = sha(OUT / 'REPORT.md')
    (OUT / 'RECEIPT.json').write_text(json.dumps(receipt, sort_keys=True, separators=(',', ':')) + '\n')
    print(decision)
    print('report', sha(OUT / 'REPORT.md'))
    print('receipt', sha(OUT / 'RECEIPT.json'))
    if decision != 'ACCEPT_OBSERVED_R12_TYPES_ONLY':
        raise SystemExit(1)

if __name__ == '__main__':
    main()
