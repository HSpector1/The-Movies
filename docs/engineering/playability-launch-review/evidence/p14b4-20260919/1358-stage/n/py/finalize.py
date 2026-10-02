#!/usr/bin/env python3
"""1358-N: turn rows-pass.json into census.json and census.md. Prints counts. Reads only scratch files and the
evidence folder; writes only under /Users/zacheryspector/studio-scratch/1358-n/."""
import json, re, collections, subprocess, hashlib, datetime

S = '/Users/zacheryspector/studio-scratch/1358-n'
E = '/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919'
R = json.load(open(S + '/rows-pass.json'))
CORE_LIST = set(open('/Users/zacheryspector/studio-scratch/1358-m2/core-list.txt').read().split())

# ── groups: disjoint file sets ──
H = ['tests/p14c3-save-v38.test.ts', 'tests/p14c3-transition-evidence.test.ts', 'tests/p14c3-admission-boundaries.test.ts',
     'tests/p14c3-profession-episodes.test.ts']
G1 = ['tests/p14b5-relationships.test.ts', 'tests/p14b5-t-failure-tuning.test.ts', 'tests/p14b10-conflict-evidence.test.ts',
      'tests/p14p4p5-post-capacity.test.ts', 'tests/bridge-p14b5-relationships.test.ts', 'tests/bridge-p14b6-d2-withheld-employment-claim.test.ts',
      'tests/bridge-p14b6-relationship-read-models.test.ts', 'tests/bridge-p14b6-e714-false-empty-absence-lines.test.ts',
      'tests/p14c2s-scientist-retirement.test.ts', 'tests/p14b9-save-v42.test.ts', 'tests/p14d1-rival-shelving.test.ts',
      'tests/p14d1-rival-shelving-save-v43.test.ts', 'tests/p14c1-materialized-aging.test.ts']
G5 = ['tests/p14c3-dual-extensions.test.ts', 'tests/p14c3-offmenu-extensions.test.ts', 'tests/p14c3-profession-history.test.ts',
      'tests/p14c3-transitions.test.ts', 'tests/p14c3-cohort-transition.test.ts', 'tests/p14c2rm-writer-continuation.test.ts',
      'tests/p12-starting-world.test.ts', 'tests/p06a-w1-release-authority.test.ts', 'tests/p14c3-promise-digest-continuity.test.ts',
      'tests/p14p3-directing-promises.test.ts', 'tests/p14p4p5-screenplay-status.test.ts', 'tests/p14p4p5-opportunities.test.ts',
      'tests/p08a-w0-studio-history.test.ts', 'tests/p14r3-save-v41.test.ts', 'tests/save.test.ts',
      'tests/contracts/v14-boundary-guards.contract.test.ts', 'tests/p14c3-canonical-rival-history.test.ts', 'tests/p14c3-queued-writing-proof.test.ts']
G4_KEYS = ['save-v', 'd17a-adv-migration', 'd17b-save', 'p13b-s7-announcements', 'v14-byte-parity', 'property-state-v13',
           'placement-save-v12', 'cash-ledger-checkpoint-v11', 'construction-save-v11', 'd11-employment', 'd17-engagement',
           'd17a-adv-reconciliation', 'p13b-s2-access', 'p13b-s3-validation', 'p13a-', 'film-chronicle', 'p04a2', 'p09a']
def group(f):
    if f.startswith('tests/helpers/') or f in H: return 'H'
    if f in G1: return 'G1'
    if f in G5: return 'G5'
    if f.startswith('ui/') or any(k in f for k in G4_KEYS): return 'G4'
    if f.startswith('tests/bridge-p14'): return 'G3'
    if f.startswith('tests/bridge'): return 'G2'
    if f.startswith('bridge/'): return 'OUT'
    return 'G6'
GROUP_TITLE = {
    'H': 'helpers and acceptedEvidence (first, serial): the 11 shared helpers and the four saveApi callers of the renamed key',
    'G1': 'relationship shapes: the p14b5 Edge type, staged and minted edges, hand-lifted states, Save42/43 tests',
    'G2': 'Bridge A: projection 57 pins, the roster list, the generator test (F10/F11 after the recorded producer run)',
    'G3': 'Bridge B: bridge-p14* projection, roster and live-save pins, and their S5 comparisons',
    'G4': 'versions and UI: the eight UI pins, sentinels, the save-vNN files and the remaining S1/S2 files of that family',
    'G5': 'chains and masking: live-to-older chains, first-guard leaves and the vacuous passes',
    'G6': 'the remaining core S1/S2/S5 files (p14b1-p14b4, p14p4p5, c2a, contracts, construction)',
}
ORDER = ['H', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6']

# ── merge rows with the same (file, line, class) ──
merged = collections.OrderedDict()
for r in R:
    k = (r['file'], r['line'], r['cls'])
    if k in merged:
        m = merged[k]
        if r['edit'] not in m['edit']: m['edit'] += '; ' + r['edit']
        if r['why'] not in m['why']: m['why'] += '; ' + r['why']
        m['status'] = 'measure' if 'measure' in (m['status'], r['status']) else m['status']
        m['source'] = sorted(set(m['source']) | set(r['source']))
    else:
        merged[k] = dict(r)
rows = [r for r in merged.values() if r['cls'] not in ('KEEP', 'OUT')]
keep = [r for r in merged.values() if r['cls'] == 'KEEP']
out = [r for r in merged.values() if r['cls'] == 'OUT']
# X5 (1358-X5, step 4) measurements that confirm a row: root/UI/Bridge tsc lines and the p14b5 runtime failures
X5 = '/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1358-stage/x5/x5-step4-tsc.txt'
gate = None; tsc = collections.defaultdict(list)
for line in open(X5):
    m = re.match(r'== (\S+)', line)
    if m: gate = {'tsconfig.json': 'root', 'ui/tsconfig.json': 'UI', 'tsconfig.bridge.json': 'Bridge'}[m.group(1)]; continue
    m = re.match(r'(\S+)\((\d+),\d+\): error (TS\d+)', line)
    if m: tsc[(m.group(1), int(m.group(2)))].append(f'{gate} {m.group(3)}')
P14B5_PICK = sorted(n for (f, n) in tsc if f == 'tests/p14b5-relationships.test.ts')
MEASURED = {
    ('tests/p14b5-relationships.test.ts', 93): f'X5 step 4: {len(P14B5_PICK)} root TS2345 strict-Pick errors at :' + ', :'.join(map(str, P14B5_PICK)),
    ('tests/p14b5-relationships.test.ts', 220): 'X5 step 4: family 1 minted oracle fails (16 keys against 14)',
    ('tests/p14b5-relationships.test.ts', 228): 'X5 step 4: families 6, 6b, 8 and both D5 sentence branches fail "validateSaveV44: state.relationships[N].competitions is missing"',
    ('tests/p14b5-relationships.test.ts', 1297): 'X5 step 4: family 10 leaves fail "validateSaveV43: expected version 43"',
    ('tests/p14b5-relationships.test.ts', 1311): 'X5 step 4: family 10 fails "validateSaveV43: expected version 43"',
    ('tests/p14b5-relationships.test.ts', 1317): 'X5 step 4: "expected ... to throw error matching /relationships/ but got validateSaveV43: expected version 43"',
    ('tests/p14b5-relationships.test.ts', 1359): 'X5 step 4: the one-edge downgrade leaf fails "validateSaveV43: expected version 43"',
    ('tests/p14b10-conflict-evidence.test.ts', 110): 'X5 step 4: root TS2322 at :108',
    ('tests/p14b4-material-evidence-core.test.ts', 40): 'X5 step 4: root TS2322 at :293',
    ('tests/helpers/p14c3-genuine-evidence-fixtures.ts', 17): 'X5 step 4: rows 59-61 fail at :17:29 "expected 44 to be 43"',
}
for r in rows:
    r['group'] = group(r['file'])
    r['inGate'] = (r['file'] in CORE_LIST or r['file'].startswith('ui/')) if re.search(r'\.test\.tsx?$', r['file']) else 'helper'
    k = (r['file'], r['line'])
    m = MEASURED.get(k) or (('X5 step 4: ' + ', '.join(tsc[k])) if k in tsc and r['cls'] in ('S4', 'S6') else None)
    r['measured'] = m
rows.sort(key=lambda r: (ORDER.index(r['group']), r['file'], r['line'], r['cls']))
for i, r in enumerate(rows, 1): r['id'] = f'N-{i:04d}'

# ── pins.txt lines that need no edit (imports, roster .get/.has reads, comments) ──
pins = collections.defaultdict(set); cat = None
for line in open(E + '/1358-stage/prod-gen/pins.txt'):
    m = re.match(r'## (\S+)', line)
    if m: cat = m.group(1); continue
    m = re.match(r'\s+(\S+): ([\d, ]+)$', line)
    if m and cat:
        for n in m.group(2).split(','): pins[(m.group(1), int(n))].add(cat)
have = {(r['file'], r['line']) for r in merged.values()}
T = S + '/tree'
def text(f, n):
    try: return open(T + '/' + f, encoding='utf-8').read().split('\n')[n - 1].strip()
    except Exception as e: return f'<unreadable: {e}>'
noedit = [dict(file=r['file'], line=r['line'], text=r['text'], reason=r['why'], source=r['source']) for r in keep]
for (f, n), cats in sorted(pins.items()):
    if (f, n) in have: continue
    t = text(f, n)
    if re.match(r'\s*(//|\*)', t): reason = 'comment; no runtime effect (update only if the author touches the block)'
    elif f.endswith(('owner-ux-projection20-migration.test.ts', 'p06-checkpoint-recovery.test.ts')): reason = 'outside the 440-file gate (1296-A Owner-input hold); reads a historical roster entry'
    elif 'import' in t or re.match(r'^[\w$, ]+,?$', t) or t.endswith('} from \'../bridge/runtime-checkpoint.ts\''): reason = 'import of an unchanged name'
    elif re.search(r'\.get\(|\.has\(SCHEMA_ID\)|\.has\(', t): reason = 'reads one historical roster entry or asserts the running id is absent; unchanged by step 4'
    elif 'filter(([id]) =>' in t: reason = 'filters one named historical entry; unchanged'
    else: reason = 'no edit by reading'
    noedit.append(dict(file=f, line=n, text=t, reason=reason, source=['pins.txt:' + '+'.join(sorted(cats))]))
noedit.sort(key=lambda r: (r['file'], r['line']))

# ── counts ──
byClass = collections.Counter(r['cls'] for r in rows)
byClassStatus = collections.defaultdict(collections.Counter)
for r in rows: byClassStatus[r['cls']][r['status']] += 1
byGroup = collections.defaultdict(lambda: collections.Counter())
for r in rows: byGroup[r['group']][r['cls']] += 1
groupFiles = collections.defaultdict(set)
for r in rows: groupFiles[r['group']].add(r['file'])
byStatus = collections.Counter(r['status'] for r in rows)
CLASS_ORDER = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'P1', 'P2', 'P3', 'P4', 'P5']

head = subprocess.run(['git', '-C', '/Users/zacheryspector/The-Movies-headless-program', 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
step4 = E + '/1358-stage/1358-rel-sliceB-production-step4-r2.patch'
measuredCount = sum(1 for r in rows if r.get('measured'))
census = {
    'record': '1358-N census (draft for the parent)',
    'readAt': {'date': '2026-10-02', 'readHead': '5245072a67b07ea5107a8201c4a86ce60b8c82c8', 'repoHeadAtWrite': head, 'headDelta': 'docs only (git diff --quiet over src, bridge, generated, scripts, ui, tests and the configs)', 'branch': 'wip/headless-program-20260916-ts',
               'srcEquals': 'b0809602 (Save43, projection 56)',
               'postImage': 'scratch tree /Users/zacheryspector/studio-scratch/1358-n/tree, tag step4 = 5245072a (no tests/fixtures) + 1358-rel-sliceB-production-step4-r2.patch; all 13 post-image blobs equal the 1358-E2 table',
               'step4Sha256': hashlib.sha256(open(step4, 'rb').read()).hexdigest()},
    'method': ['detectors: py/detect.py over tests/**/*.ts (no tests/fixtures), ui/src test files and ui/src/test, bridge/testing, scripts',
               'classification: py/build_census.py (rules plus tables read in context); py/finalize.py (merge, groups, counts)',
               'roster digests: py/roster.py recomputes both older-roster pins from runtime-checkpoint.ts; it reproduces the base pins exactly',
               'one row per (file, line, class): a line that needs two kinds of edit has two rows',
               'status certain = a literal or a shape that must move by reading; measure = 1358-M2 or a sweep dry run must confirm'],
    'counts': {'rows': len(rows), 'files': len({r['file'] for r in rows}),
               'byClass': {c: byClass[c] for c in CLASS_ORDER if byClass[c]},
               'byClassStatus': {c: dict(byClassStatus[c]) for c in CLASS_ORDER if byClass[c]},
               'byStatus': dict(byStatus),
               'byGroup': {g: {'files': len(groupFiles[g]), 'rows': sum(byGroup[g].values()), 'byClass': {c: byGroup[g][c] for c in CLASS_ORDER if byGroup[g][c]}} for g in ORDER},
               'noEdit': len(noedit), 'outOfScope': len(out), 'rowsConfirmedByX5': measuredCount},
    'groups': {g: {'title': GROUP_TITLE[g], 'files': sorted(groupFiles[g])} for g in ORDER},
    'rows': [{k: r[k] for k in ('id', 'group', 'file', 'line', 'cls', 'status', 'text', 'edit', 'why', 'measured', 'source', 'inGate', 'retainedIdentitiesInFile')} for r in rows],
    'noEdit': noedit,
    'outOfScope': [dict(file=r['file'], line=r['line'], text=r['text'], reason=r['why']) for r in out],
}
json.dump(census, open(S + '/census.json', 'w'), indent=1)

# ── census.md ──
def cut(s, n): s = s.replace('|', '\\|'); return s if len(s) <= n else s[:n - 1] + '…'
L = []
L.append('# 1358-N census: Save44 and projection-57 pin sites')
L.append('')
L.append('Read on 2026-10-02 at HEAD `5245072a` (branch wip/headless-program-20260916-ts). `src` equals b0809602: Save43, projection 56.')
L.append(f'Repo HEAD is now `{head[:8]}`; it differs from 5245072a only under `docs` (`git diff --quiet` over src, bridge, generated, scripts, ui, tests and the configs).')
L.append('The post-image is the scratch tree `/Users/zacheryspector/studio-scratch/1358-n/tree`, tag `step4`: 5245072a without `tests/fixtures` plus')
L.append(f'`1358-rel-sliceB-production-step4-r2.patch` (sha256 `{census["readAt"]["step4Sha256"][:16]}…`). All 13 post-image blobs equal 1358-E2\'s table.')
L.append('')
L.append('No test, type gate or node process ran. Every row comes from reading. `certain` marks a literal or shape that must move; `measure` marks a site that')
L.append('1358-M2 or a sweep dry run must confirm. A line that needs two kinds of edit has two rows. `census.json` holds the same rows with the')
L.append('full current text, the reason and the source (pins.txt category, 1358-J item, or `scan`), plus the examined sites that need no edit.')
L.append('')
L.append('## Counts by class')
L.append('')
L.append('| Class | Rows | certain | measure |')
L.append('|---|---:|---:|---:|')
for c in CLASS_ORDER:
    if byClass[c]: L.append(f'| {c} | {byClass[c]} | {byClassStatus[c]["certain"]} | {byClassStatus[c]["measure"]} |')
L.append(f'| **all** | **{len(rows)}** | **{byStatus["certain"]}** | **{byStatus["measure"]}** |')
L.append('')
nz = sum(1 for r in rows if r['edit'].lower().startswith(('no edit', 'none')))
L.append(f'Files with at least one row: {len({r["file"] for r in rows})}. {nz} rows plan no edit and name what the sweep must confirm there. Rows with an X5 measurement: {measuredCount}.')
L.append(f'Examined sites that need no edit: {len(noedit)} (in `census.json`, `noEdit`). Out of scope: {len(out)}.')
L.append('')
L.append('## Counts by group')
L.append('')
L.append('| Group | Files | Rows | Classes | Scope |')
L.append('|---|---:|---:|---|---|')
for g in ORDER:
    cls = ', '.join(f'{c} {byGroup[g][c]}' for c in CLASS_ORDER if byGroup[g][c])
    L.append(f'| {g} | {len(groupFiles[g])} | {sum(byGroup[g].values())} | {cls} | {GROUP_TITLE[g]} |')
L.append('')
for g in ORDER:
    L.append(f'## {g}: {GROUP_TITLE[g]}')
    L.append('')
    for f in sorted(groupFiles[g]):
        fr = [r for r in rows if r['file'] == f]
        gate = ' (helper)' if fr[0]['inGate'] == 'helper' else ('' if fr[0]['inGate'] else ' (outside the 440-file core list)')
        ret = f'; {fr[0]["retainedIdentitiesInFile"]} retained 1348-I identities in this file' if fr[0]['retainedIdentitiesInFile'] else ''
        L.append(f'### `{f}`{gate}{ret}')
        L.append('')
        L.append('| Id | Line | Class | Status | Current text | Planned edit |')
        L.append('|---|---:|---|---|---|---|')
        for r in fr:
            x = f'; measured: {r["measured"]}' if r.get('measured') else ''
            L.append(f'| {r["id"]} | {r["line"]} | {r["cls"]} | {r["status"]} | `{cut(r["text"], 90)}` | {cut(r["edit"], 160)}{cut(x, 200)} |')
        L.append('')
L.append('## Out of scope')
L.append('')
for r in out: L.append(f'- `{r["file"]}:{r["line"]}`: {r["why"]}')
L.append('')
L.append('## Examined, no edit')
L.append('')
L.append('| File | Line | Reason |')
L.append('|---|---:|---|')
for r in noedit: L.append(f'| `{r["file"]}` | {r["line"]} | {cut(r["reason"], 140)} |')
open(S + '/census.md', 'w').write('\n'.join(L) + '\n')
print(json.dumps(census['counts'], indent=1))
