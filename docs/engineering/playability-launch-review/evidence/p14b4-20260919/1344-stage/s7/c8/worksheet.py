#!/usr/bin/env python3
"""1344-s7 C8 attribution worksheet (1344-A §7: "re-run on the candidate and attributed on their own evidence. No test
is changed to restore an old result, and no hiring outcome is forced. Rows that still fail stay open with their cause.")
NOT RUN by the author.

usage: python3 /Users/zacheryspector/studio-scratch/1344-s7/c8/worksheet.py   (RUNBOOK.md step 10, after compare.py)
Reads 1338-I-failures.json, OUT/c8/run.json (vitest JSON reporter), OUT/c8/failures.json (1321-I-attribution.py over
OUT/c8/run.txt), OUT/c-p13a-1/natural-chain.jsonl, OUT/o-p13a/natural-chain.jsonl and OUT/compare.json.
Writes OUT/c8/worksheet.json and OUT/c8/worksheet.md (exclusive create). It fills every column it can measure and
leaves `attribution` and `cause` for the parent. A row absent from the run reads NOT RUN, never PASSED."""
import json
import os

K = '/Users/zacheryspector/studio-scratch/1344-s7'
OUT = K + '/out'
TREE = K + '/tree'
E = '/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919'
RIVAL_FIXTURE = 'Error: P14B.2 fixture: no natural rival-only promise outcome by 240'
SEEDS = ['p13a-core-causal-01', 'seed-b', 'p13b-s8-bridge-probe-01', 'p13-public-commercial-adoption']
P13A = 'p13a-core-causal-01'
# (file, 1338 frame line) -> (group, default seed, the leaf's own search bound in ticks, the 1329 field that is its premise)
GROUPS = {
    ('tests/p14b1-t4-regressions.test.ts', 283): ('C8 T4 sharedTakeOutcomes (1329-A)', P13A, 230, 'firstShared'),
    ('tests/bridge-p14b2-trust.test.ts', 253): ('C8 rivalFixture (1329-A)', P13A, 240, 'firstRivalSatisfied'),
    ('tests/bridge-p14b2-trust.test.ts', 386): ('C8 rivalFixture (1329-A)', P13A, 240, 'firstRivalSatisfied'),
    ('tests/bridge-p14b2-trust.test.ts', 398): ('C8 rivalFixture (1329-A)', P13A, 240, 'firstRivalSatisfied'),
    ('tests/bridge-p14b2-trust.test.ts', 412): ('C8 rivalFixture (1329-A)', P13A, 240, 'firstRivalSatisfied'),
    ('tests/p14b2-fixture-preconditions.test.ts', 27): ('C8 rivalFixture (1329-A)', P13A, 240, 'firstRivalSatisfied'),
    ('tests/bridge-p14b2-trust.test.ts', 363): ('C1 row with the rivalFixture primary (1329-A :16-17)', P13A, 240, 'firstRivalSatisfied'),
    ('tests/p14b4-cast-class-outcomes.test.ts', 247): ('C8 cast-class rivalWorlds (P14C.1 770/771)', 'seed-b', 350, None),
    ('tests/p14b4-rival-seating-preference.test.ts', 343): ('C8 seating natural witness (P14C.1 770/771)', 'seed-b', 350, None),
    ('tests/p14b4-rival-seating-preference.test.ts', 807): ('C8 seating seam witness', P13A, 350, None),
    ('tests/p14b4-rival-seating-preference.test.ts', 483): ('UNRESOLVED seating decisions', None, 350, None),
    ('tests/p14b4-rival-seating-preference.test.ts', 498): ('UNRESOLVED seating decisions (S10 row 1)', None, 350, None),
    ('tests/p14b4-rival-seating-preference.test.ts', 622): ('UNRESOLVED current unaccepted offers', 'seed-b', 350, None),
    ('tests/bridge-p14b5-relationships.test.ts', 530): ('UNRESOLVED family 12 ledger', None, 416, None),
    ('tests/bridge-p14b5-relationships.test.ts', 547): ('UNRESOLVED family 12 ledger', None, 416, None),
    ('tests/bridge-p14b5-relationships.test.ts', 550): ('UNRESOLVED family 12 ledger', None, 416, None),
}


def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def opt(path):
    return load(path) if os.path.isfile(path) else None


def summary_line(path):
    if not os.path.isfile(path):
        return None
    with open(path, encoding='utf-8') as f:
        return json.loads([line for line in f.read().split('\n') if line][-1])


def select_rows():
    """1338-I order, so row numbers equal WORKSHEET-TEMPLATE.md's."""
    def kind(r):
        cluster = r['cluster_1302'] or ''
        if cluster.startswith('C8'):
            return 'C8'
        if cluster == 'UNRESOLVED':
            return 'UNRESOLVED'
        if cluster.startswith('C1-') and r['primary'] == RIVAL_FIXTURE:
            return 'C1'
        return None
    rows = [r for r in load(E + '/1338-I-failures.json')['rows'] if kind(r) is not None]
    n = {k: sum(1 for r in rows if kind(r) == k) for k in ('C8', 'C1', 'UNRESOLVED')}
    assert n == {'C8': 42, 'C1': 1, 'UNRESOLVED': 7}, f'1338-I selection moved: {n}'
    return rows


def candidate_status():
    """identity -> vitest JSON status for every leaf the C8 run collected."""
    run = load(OUT + '/c8/run.json')
    status = {}
    for f in run['testResults']:
        rel = os.path.relpath(f['name'], TREE)
        for t in f['assertionResults']:
            status[' > '.join([rel] + t['ancestorTitles'] + [t['title']])] = t['status']
    return status


def main():
    for target in (OUT + '/c8/worksheet.json', OUT + '/c8/worksheet.md'):
        if os.path.exists(target):
            raise SystemExit(f'refusing to overwrite {target}')
    rows = select_rows()
    status = candidate_status()
    failures = {r['identity']: r for r in load(OUT + '/c8/failures.json')['rows']}
    chain = {'candidate': summary_line(OUT + '/c-p13a-1/natural-chain.jsonl'), 'old': summary_line(OUT + '/o-p13a/natural-chain.jsonl')}
    cmp = opt(OUT + '/compare.json')
    out_rows = []
    for n, r in enumerate(rows, 1):
        line = int(r['frame'].split(':')[1])
        group, seed, bound, premise = GROUPS[(r['file'], line)]
        seed = next((s for s in SEEDS if r['leaf'].startswith(s + ':')), seed)
        assert seed is not None, f'no seed for {r["identity"]}'
        st = status.get(r['identity'])
        fail = failures.get(r['identity'])
        if st is None:
            cand = 'NOT RUN'
        elif st == 'failed':
            cand = 'FAILED' if fail is not None else 'FAILED (absent from failures.json: parser mismatch)'
        else:
            cand = st.upper()
        evidence = {'seed': seed, 'searchBoundTicks': bound}
        div = (cmp or {}).get('seeds', {}).get(seed, {}).get('divergence') if cmp else None
        if div is None or div.get('status') != 'MEASURED':
            evidence['shelving'] = 'MISSING (compare.json has no measured divergence for this seed)'
        else:
            fs = div['firstShelving']
            evidence['firstShelving'] = fs
            evidence['firstDifferentTick'] = div['firstDifferentTick']
            evidence['firstDifferenceIsTheFirstShelvingTick'] = div['firstDifferenceIsTheFirstShelvingTick']
            if fs is None:
                evidence['reading'] = 'no shelving on this seed in 520 weeks'
            elif fs['week'] + 1 > bound:
                evidence['reading'] = f'the search (ticks 0..{bound}) ends before the first shelving shows (tick {fs["week"] + 1})'
            else:
                evidence['reading'] = f'the first shelving shows at tick {fs["week"] + 1}, inside the search bound {bound}'
        if premise is not None:
            # The leaf's premise is met inside its bound when the decisive field is in 0..bound (rivalFixture also needs
            # firstRivalOpen in range). -1 means never within the 520-week chain.
            fields = ('firstRivalOpen', 'firstRivalSatisfied', 'firstShared')
            evidence['premise1329Field'] = premise
            evidence['premise'] = {k: ({f: v[f] for f in fields} if v else 'MISSING') for k, v in chain.items()}
            evidence['premise']['head1329'] = {'firstRivalOpen': 196, 'firstRivalSatisfied': -1, 'firstShared': -1}
        out_rows.append({'n': n, 'group': group, 'identity': r['identity'], 'file': r['file'], 'frame1338': r['frame'],
                         'cluster1338': r['cluster_1302'], 'primary1338': r['primary'], 'candidate': cand,
                         'candidatePrimary': fail['primary'] if fail else None, 'candidateFrame': fail['frame'] if fail else None,
                         'samePrimary': (fail['primary'] == r['primary']) if fail else None,
                         'evidence': evidence, 'attribution': 'TO FILL', 'cause': 'TO FILL'})
    targets = {r['identity'] for r in rows}
    files = {r['file'] for r in rows}
    others = [{'identity': i, 'primary': f['primary']} for i, f in sorted(failures.items()) if i not in targets]
    result = {'rows': out_rows, 'otherFailuresInTheseFiles': others,
              'counts': {k: sum(1 for r in out_rows if r['candidate'] == k) for k in sorted({r['candidate'] for r in out_rows})},
              'files': sorted(files)}
    with open(OUT + '/c8/worksheet.json', 'x', encoding='utf-8') as f:
        json.dump(result, f, indent=1)
        f.write('\n')
    cell = lambda s: str(s).replace('|', '\\|').replace('\n', ' ')
    md = ['# §7 C8 worksheet (generated by 1344-s7/c8/worksheet.py)', '',
          f"Counts: {result['counts']}. Other failures in these files (not §7 rows): {len(others)}.", '',
          '| # | group | identity | 1338 primary | candidate | candidate primary | same | evidence | attribution | cause |',
          '|---:|---|---|---|---|---|---|---|---|---|']
    for r in out_rows:
        md.append('| ' + ' | '.join(cell(x) for x in (r['n'], r['group'], r['identity'], r['primary1338'], r['candidate'],
                                                       r['candidatePrimary'] or '', r['samePrimary'], json.dumps(r['evidence']),
                                                       r['attribution'], r['cause'])) + ' |')
    md += ['', '## Other failures in these files', ''] + [f"- {cell(o['identity'])}: {cell(o['primary'])}" for o in others]
    with open(OUT + '/c8/worksheet.md', 'x', encoding='utf-8') as f:
        f.write('\n'.join(md) + '\n')
    print(json.dumps(result['counts']), f'others={len(others)}', 'wrote', OUT + '/c8/worksheet.md')


if __name__ == '__main__':
    main()
