"""1301-F amendment 4: filename-only collection proof for gate 1302 (pre) and result-set proof (post).

usage from repository root:
  python3 <this> pre  <out.json>          writes the 411-path allowlist proof; prints argv tail
  python3 <this> post <raw.txt> <out.json> checks per-file result lines equal the allowlist
Reads git filename metadata and, in post, the named raw log only. Never opens a fixture or test body.
"""
import json, re, subprocess, sys

EXCLUDED = ['tests/bridge-p05a1-owner-greenlight.test.ts', 'tests/bridge-p05a3-roster-liveness.test.ts',
            'tests/bridge-contract-consumer-lock.test.ts', 'tests/bridge-owner-ux-projection20-migration.test.ts',
            'tests/bridge-p06-checkpoint-recovery.test.ts', 'tests/bridge-p12-campaign-library.test.ts']


def git(*a):
    return subprocess.check_output(['git', *a], env={'GIT_OPTIONAL_LOCKS': '0', 'PATH': '/usr/bin:/bin:/usr/local/bin'}).decode()


def allowlist():
    tracked = sorted(p for p in git('ls-files', '--', 'tests').splitlines() if p.endswith('.test.ts'))
    core = [p for p in tracked if not p.startswith('tests/fixtures/')]
    assert not [p for p in tracked if p.startswith('tests/fixtures/')], 'tracked test under fixtures'
    assert all(e in core for e in EXCLUDED), 'excluded path missing'
    allow = [p for p in core if p not in EXCLUDED]
    untracked = [p for p in git('ls-files', '--others', '--exclude-standard', '--', 'tests').splitlines() if p.endswith('.test.ts')]
    assert untracked == [], f'untracked tests: {untracked}'
    low = [a.lower() for a in allow]
    assert not [(a, e) for a in low for e in EXCLUDED if a in e.lower()], 'allowlist entry selects an excluded path'
    for a in low:
        assert sum(a in c.lower() for c in core) == 1, f'entry matches more than one tracked test: {a}'
    return core, allow


mode = sys.argv[1]
core, allow = allowlist()
if mode == 'pre':
    out = {'trackedCoreTests': len(core), 'excluded': EXCLUDED, 'allowlist': allow, 'allowlistCount': len(allow),
           'proof': 'no lowercased excluded path contains a lowercased allowlist entry; each entry matches exactly one tracked core test; no untracked tests; no tracked tests under tests/fixtures (Vitest 2.1.9 filterFiles substring semantics)'}
    with open(sys.argv[2], 'x') as f:
        json.dump(out, f, indent=2); f.write('\n')
    print(json.dumps({'allowlistCount': len(allow), 'trackedCoreTests': len(core)}))
else:
    raw = open(sys.argv[2], encoding='utf-8', errors='replace').read()
    raw = re.sub(r'\x1b\[[0-9;]*m', '', raw)
    seen = sorted(set(re.findall(r'^ [✓❯×↓] \|core\| (tests/\S+\.test\.ts)', raw, re.M)))
    total = re.findall(r'Test Files .*\((\d+)\)', raw)
    out = {'reportedFiles': len(seen), 'vitestFileTotal': int(total[-1]) if total else None,
           'equalsAllowlist': seen == sorted(allow), 'excludedSeen': [e for e in EXCLUDED if e in seen],
           'missing': sorted(set(allow) - set(seen)), 'unexpected': sorted(set(seen) - set(allow))}
    with open(sys.argv[3], 'x') as f:
        json.dump(out, f, indent=2); f.write('\n')
    print(json.dumps({k: out[k] for k in ['reportedFiles', 'vitestFileTotal', 'equalsAllowlist', 'excludedSeen']}))
    sys.exit(0 if out['equalsAllowlist'] and out['vitestFileTotal'] == len(allow) and not out['excludedSeen'] else 3)
