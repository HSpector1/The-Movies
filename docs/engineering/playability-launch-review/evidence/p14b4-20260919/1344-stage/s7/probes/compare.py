#!/usr/bin/env python3
"""1344-s7 compare: anchors against 1329, candidate against 1329 and the old tree, the first divergence per seed and the
natural-route movement table (1344-A §7; 1344-F :38-39; 1344-F3 :16-17). NOT RUN by the author.

usage: python3 /Users/zacheryspector/studio-scratch/1344-s7/probes/compare.py
Fixed paths. Reads OUT/<run>/ and the 1329 records; writes OUT/compare.json (exclusive create) and prints a summary.
A missing run is reported as MISSING, never skipped silently. Nothing here decides pass or fail for a measured value:
no thresholds are specified (report, attribute, flag the rest to the Owner). The anchors and the divergence checks
are method checks: a DIFFERENT anchor means the comparison basis did not reproduce 1329 and must be reported first."""
import json
import os

K = '/Users/zacheryspector/studio-scratch/1344-s7'
OUT = K + '/out'
E = '/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919'
R1329 = E + '/1329-c8'
SEEDS = [  # seed, candidate run, old run (RUNBOOK.md step 6)
    ('p13a-core-causal-01', 'c-p13a-1', 'o-p13a'),
    ('seed-b', 'c-seedb', 'o-seedb'),
    ('p13b-s8-bridge-probe-01', 'c-ledger-p13b', 'o-ledger-p13b'),
    ('p13-public-commercial-adoption', 'c-ledger-p13pub', 'o-ledger-p13pub'),
]
MISSING = 'MISSING'


def p(run, name):
    return os.path.join(OUT, run, name)


def have(*paths):
    return all(os.path.isfile(x) for x in paths)


def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def jsonl(path):
    with open(path, encoding='utf-8') as f:
        return [json.loads(line) for line in f.read().split('\n') if line]


def anchor_bytes(got_path, want_path, first_lines=None):
    """Byte equality of a probe output (optionally its first N lines) with a recorded 1329 file."""
    if not have(got_path):
        return {'status': MISSING, 'path': got_path}
    with open(got_path, 'rb') as f:
        got = f.read()
    with open(want_path, 'rb') as f:
        want = f.read()
    if first_lines is not None:
        got = b'\n'.join(got.split(b'\n')[:first_lines]) + b'\n'
    if got == want:
        return {'status': 'EQUAL', 'bytes': len(want)}
    gl, wl = got.split(b'\n'), want.split(b'\n')
    i = next(i for i in range(max(len(gl), len(wl))) if gl[i:i + 1] != wl[i:i + 1])
    show = lambda ls: ls[i][:400].decode('utf-8', 'replace') if i < len(ls) else None
    return {'status': 'DIFFERENT', 'firstDifferentLine': i + 1, 'got': show(gl), 'want': show(wl)}


def anchor_diag():
    """The spy-based diag on the old tree against 1329's decide-diag rows (r01 and r02, weeks 103-215, the window the
    recorded file holds; NOTES.md item 16). `employees` is not reproduced; cash and reserve may differ by 1 (rounding)."""
    got_path = p('o-diag', 'decide-diag.jsonl')
    if not have(got_path):
        return {'status': MISSING, 'path': got_path}
    key = lambda r: (r['week'], r['studio'], r['ready'])
    want = {key(r): r for r in jsonl(R1329 + '/decide-diag-head-133aca7a.jsonl')}
    got = {key(r): r for r in jsonl(got_path) if r['studio'] in ('r01', 'r02') and 103 <= r['week'] <= 215}
    mismatches = []
    for k, w in sorted(want.items()):
        g = got.get(k)
        if g is None:
            mismatches.append({'key': list(k), 'issue': 'absent from the old run'})
            continue
        diffs = {f: {'got': g.get(f), 'want': w.get(f)} for f in ('director', 'craft', 'actors', 'masks', 'pol', 'candidate') if g.get(f) != w.get(f)}
        diffs.update({f: {'got': g[f], 'want': w[f]} for f in ('cash', 'reserve') if abs(g[f] - w[f]) > 1})
        if diffs:
            mismatches.append({'key': list(k), 'diffs': diffs})
    extra = sorted(set(got) - set(want))
    return {'status': 'EQUAL' if not mismatches and not extra else 'DIFFERENT', 'rows1329': len(want), 'rowsOldInWindow': len(got),
            'mismatchCount': len(mismatches), 'mismatches': mismatches[:20], 'extraCount': len(extra), 'extra': [list(k) for k in extra[:20]]}


def diag_unperturbed():
    a, b = p('c-diag', 'decide-diag-summary.json'), p('c-p13a-1', 's7.json')
    if not have(a, b):
        return {'status': MISSING}
    x, y = load(a)['stateAtEndSha256'], load(b)['meta']['finalStateSha256']
    return {'status': 'EQUAL' if x == y else 'DIFFERENT', 'diag': x, 'naturalRoute': y}


def chain_summary(path):
    """The 1329 natural-chain fields 1329-A :24-30 reports, from a natural-chain.jsonl (recorded or new)."""
    if not have(path):
        return {'status': MISSING, 'path': path}
    rows = jsonl(path)
    summary, samples = rows[-1], {r['week']: r for r in rows[:-1]}
    at = lambda field: {str(w): samples[w][field] for w in (100, 140, 200, 300, 416, 520) if w in samples}
    return {'firstRivalOpen': summary['firstRivalOpen'], 'firstRivalSatisfied': summary['firstRivalSatisfied'], 'firstShared': summary['firstShared'],
            'promises': at('promises'), 'byOutcome': at('byOutcome'), 'byFamily': at('byFamily'), 'firstTakes': at('firstTakes'), 'films': at('films')}


def economy_at(path, week):
    """Per-studio cash and films from a rival-economy.jsonl line (1329 format) at one week."""
    if not have(path):
        return MISSING
    for row in jsonl(path):
        if row['week'] == week:
            return {b['id']: {'cash': b['cash'], 'films': b['films'], 'prod': b['prod'], 'dev': b['dev']} for b in row['biz']}
    return None


def studio_table(run):
    if not have(p(run, 's7.json')):
        return MISSING
    s7 = load(p(run, 's7.json'))
    rows = {}
    for st in s7['studios']:
        again = st['filmsAgain'][0] if st['filmsAgain'] else None
        rows[st['short']] = {
            'cashEnd': round(st['cashEnd']) if st['cashEnd'] is not None else None, 'films': st['films'], 'firstTakes': st['firstTakes'],
            'shelvings': [[s['week'], s['id']] for s in st['shelvings']],
            'retriesViable': [[r['week'], r['id']] for r in st['retries']['viable']],
            'retriesEconomicRejection': [[r['week'], r['id']] for r in st['retries']['economicRejection']],
            'shelvingsPerYear': st['shelvingsPerYear'], 'maxShelvingsInAny52Weeks': st['maxShelvingsInAny52Weeks'],
            'shelvedAtEnd': len(st['shelvedAtEnd']),
            'afterFirstShelving': None if again is None else {
                'shelvingWeek': again['shelvingWeek'],
                'announced': again['announced'], 'firstTake': again['firstTake'], 'released': again['released']},
        }
    return {'industryFilms': s7['industryFilms'], 'studios': rows, 'player': s7['player'], 'controlCEntries': len(s7['controlC']), 'integrity': s7['integrity']}


def event_set(s7):
    out = set()
    for st in s7['studios'] + s7.get('otherStudios', []):
        for kind, events in st['events'].items():
            for e in events:
                out.add((e['week'], st['studioId'], kind, e['id']))
    return out


def law_events(s7):
    by = {}
    for st in s7['studios']:
        ev = [(s['week'], 'shelved', s['id']) for s in st['shelvings']]
        ev += [(r['week'], 'retry viable', r['id']) for r in st['retries']['viable']]
        ev += [(r['week'], 'retry rejected', r['id']) for r in st['retries']['economicRejection']]
        by[st['studioId']] = sorted(ev)
    return by


def promise_rows(path):
    """Promise outcomes from the 1329 summary line, keyed without promise ids (ids are sequential across issuers, so
    one authoring difference renumbers every later promise)."""
    by = {}
    for r in jsonl(path)[-1]['promiseDetail']:
        by.setdefault((r['issuer'], r['ben'], r['fam'], r['win'][0], r['win'][1]), []).append([r['out'], r['ow'], r['cause']])
    return {k: sorted(v, key=str) for k, v in by.items()}


def divergence(seed, c, o):
    """First tick where the stripped states differ (1344-F3 ruling 4 extended to every tick), the first shelving, the
    accounts at that tick (control c, exact at the first shelving), and every event that differs from then on."""
    need = [p(c, 'weekly.jsonl'), p(o, 'weekly.jsonl'), p(c, 's7.json'), p(o, 's7.json'), p(c, 'natural-chain.jsonl'), p(o, 'natural-chain.jsonl')]
    if not have(*need):
        return {'status': MISSING, 'missing': [x for x in need if not os.path.isfile(x)]}
    cw, ow = jsonl(need[0]), jsonl(need[1])
    n = min(len(cw), len(ow))
    for i in range(n):
        assert cw[i]['w'] == i and ow[i]['w'] == i, f'{seed}: weekly.jsonl rows are not ticks 0..{n - 1}'
    first = next((i for i in range(n) if cw[i]['d'] != ow[i]['d']), None)
    s7c, s7o = load(need[2]), load(need[3])
    shelvings = sorted((s['week'], st['studioId'], s['id']) for st in s7c['studios'] for s in st['shelvings'])
    first_shelving = shelvings[0] if shelvings else None
    res = {'status': 'MEASURED', 'ticksCompared': n, 'firstDifferentTick': first,
           'firstShelving': None if first_shelving is None else {'week': first_shelving[0], 'studioId': first_shelving[1], 'screenplay': first_shelving[2]},
           # A shelving in the tick that processes week W first shows in the state at tick W + 1.
           'firstDifferenceIsTheFirstShelvingTick': None if first is None or first_shelving is None else first == first_shelving[0] + 1}
    if first is not None:
        ca, oa = cw[first]['a'], ow[first]['a']
        res['accountsAtFirstDifference'] = {s: ('EQUAL' if ca.get(s) == oa.get(s) else 'DIFFERENT') for s in sorted(set(ca) | set(oa))}
        law = law_events(s7c)
        ce, oe = event_set(s7c), event_set(s7o)
        rows = [(e, 'added') for e in ce - oe] + [(e, 'removed') for e in oe - ce]
        res['movements'] = [{'week': e[0], 'studioId': e[1], 'kind': e[2], 'id': e[3], 'change': ch,
                             'sameStudioLawEventsAtOrBefore': [list(x) for x in law.get(e[1], []) if x[0] <= e[0]][-3:]}
                            for e, ch in sorted(rows)]
        res['movementsBeforeFirstShelving'] = [m for m in res['movements'] if first_shelving is None or m['week'] < first_shelving[0]]
        cp, op = promise_rows(need[4]), promise_rows(need[5])
        res['promiseMovements'] = [{'issuer': k[0], 'beneficiary': k[1], 'family': k[2], 'window': [k[3], k[4]],
                                    'candidate': cp.get(k), 'old': op.get(k)} for k in sorted(set(cp) | set(op), key=str) if cp.get(k) != op.get(k)]
        cs, os_ = {st['short']: st for st in s7c['studios']}, {st['short']: st for st in s7o['studios']}
        res['endCash'] = {s: {'candidate': round(cs[s]['cashEnd']) if s in cs else None, 'old': round(os_[s]['cashEnd']) if s in os_ else None}
                          for s in sorted(set(cs) | set(os_))}
    return res


def main():
    target = os.path.join(OUT, 'compare.json')
    if os.path.exists(target):
        raise SystemExit(f'refusing to overwrite {target}')
    result = {
        'anchors': {
            'naturalChain_old_vs_1329': anchor_bytes(p('o-p13a', 'natural-chain.jsonl'), R1329 + '/natural-chain-head-133aca7a.jsonl'),
            'rivalEconomy_old_first31_vs_1329': anchor_bytes(p('o-p13a', 'rival-economy.jsonl'), R1329 + '/rival-economy-head-133aca7a.jsonl', 31),
            'decideDiag_old_vs_1329': anchor_diag(),
            'decideDiag_candidate_unperturbed': diag_unperturbed(),
        },
        'p13a': {
            'chain': {'head1329': chain_summary(R1329 + '/natural-chain-head-133aca7a.jsonl'), 'old': chain_summary(p('o-p13a', 'natural-chain.jsonl')),
                      'candidate': chain_summary(p('c-p13a-1', 'natural-chain.jsonl'))},
            'economyWeek300': {'head1329': economy_at(R1329 + '/rival-economy-head-133aca7a.jsonl', 300), 'old': economy_at(p('o-p13a', 'rival-economy.jsonl'), 300),
                               'candidate': economy_at(p('c-p13a-1', 'rival-economy.jsonl'), 300)},
            'studios': {'old': studio_table('o-p13a'), 'candidate': studio_table('c-p13a-1')},
        },
        'seeds': {seed: {'candidateStudios': studio_table(c), 'divergence': divergence(seed, c, o)} for seed, c, o in SEEDS},
    }
    with open(target, 'x', encoding='utf-8') as f:
        json.dump(result, f, indent=1)
        f.write('\n')
    for name, a in result['anchors'].items():
        print(f"anchor {name}: {a['status']}")
    for seed, s in result['seeds'].items():
        d = s['divergence']
        if d['status'] != 'MEASURED':
            print(f'{seed}: {d["status"]}')
            continue
        print(f"{seed}: first different tick {d['firstDifferentTick']}, first shelving {d['firstShelving']}, "
              f"is that tick {d['firstDifferenceIsTheFirstShelvingTick']}, accounts {d.get('accountsAtFirstDifference')}, "
              f"movements {len(d.get('movements', []))} (before the first shelving: {len(d.get('movementsBeforeFirstShelving', []))})")
    print(f'wrote {target}')


if __name__ == '__main__':
    main()
