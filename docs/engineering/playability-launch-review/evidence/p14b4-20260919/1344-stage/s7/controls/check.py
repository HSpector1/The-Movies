#!/usr/bin/env python3
"""1344-s7 controls: verdicts for the four §7 controls (1344-A §7 "Controls"). NOT RUN by the author.

usage: python3 /Users/zacheryspector/studio-scratch/1344-s7/controls/check.py   (RUNBOOK.md step 10, after compare.py)
Reads OUT; writes OUT/controls.json (exclusive create); prints one verdict line per control.
  (a) test 3's HEAD-equality run          out/control-a.log (controls/a-test3.sh)
  (b) player-only saves untouched          out/{c,o}-player-only/ (controls/b-player-only.test.ts), plus each candidate
                                           s7.json `player` (the player's development inside a rival world)
  (c) no refund or ledger movement at a    every candidate s7.json controlC entry, plus compare.json's accounts at the
      shelving; the rival ledger reconciles first different tick (exact for the first shelving of each seed)
  (d) determinism across two runs          out/c-p13a-1 and out/c-p13a-2, every output byte for byte, including the
                                           key-sorted final state
A control reads MISSING when an input is absent; it never passes on missing evidence."""
import json
import os
import re

K = '/Users/zacheryspector/studio-scratch/1344-s7'
OUT = K + '/out'
CANDIDATE_RUNS = ['c-p13a-1', 'c-seedb', 'c-ledger-p13b', 'c-ledger-p13pub']


def p(*parts):
    return os.path.join(OUT, *parts)


def read_bytes(path):
    with open(path, 'rb') as f:
        return f.read()


def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def control_a():
    log = p('control-a.log')
    if not os.path.isfile(log):
        return {'status': 'MISSING', 'path': log}
    text = re.sub(r'\x1b\[[0-9;]*m', '', read_bytes(log).decode('utf-8', 'replace'))
    exits = re.findall(r'^exit=(\d+)$', text, re.M)
    tests = re.search(r'^\s*Tests\s+(.*)$', text, re.M)
    summary = tests.group(1).strip() if tests else None
    passed = re.search(r'(\d+) passed', summary or '')
    ok = exits == ['0'] and passed is not None and int(passed.group(1)) == 2 and 'failed' not in (summary or '')
    return {'status': 'PASS' if ok else 'FAIL', 'exit': exits, 'vitestTests': summary,
            'expect': 'exit=0 and exactly 2 passed (the two shelving-viable-control leaves)'}


def control_b():
    c, o, det = p('c-player-only', 'player-only.cmp.json'), p('o-player-only', 'player-only.cmp.json'), p('c-player-only', 'player-only.json')
    missing = [x for x in (c, o, det) if not os.path.isfile(x)]
    in_world = {}
    for run in CANDIDATE_RUNS:
        s7 = p(run, 's7.json')
        if not os.path.isfile(s7):
            missing.append(s7)
            continue
        pl = load(s7)['player']
        in_world[run] = {'shelvingReceipts': pl['shelvingReceipts'], 'developmentHasShelvingKey': pl['developmentHasShelvingKey']}
    if missing:
        return {'status': 'MISSING', 'missing': missing}
    same = read_bytes(c) == read_bytes(o)
    routes = load(det)['routes']
    route_ok = all(r['hollywoodNullEveryWeek'] and r['liveDiffersFromV42OnlyInVersionStamp'] is True for r in routes)
    world_ok = all(v['shelvingReceipts'] == 0 and v['developmentHasShelvingKey'] is False for v in in_world.values())
    return {'status': 'PASS' if same and route_ok and world_ok else 'FAIL',
            'playerOnlyWorldsByteIdenticalAcrossTrees': same, 'candidateRoutes': routes, 'playerInRivalWorlds': in_world}


def control_c():
    missing, entries = [], []
    for run in CANDIDATE_RUNS:
        s7 = p(run, 's7.json')
        if not os.path.isfile(s7):
            missing.append(s7)
            continue
        for e in load(s7)['controlC']:
            entries.append(dict(e, run=run))
    cmp_path = p('compare.json')
    if not os.path.isfile(cmp_path):
        missing.append(cmp_path)
    if missing:
        return {'status': 'MISSING', 'missing': missing}
    failing = [{'run': e['run'], 'week': e['week'], 'studioId': e['studioId'], 'scriptProjectId': e['scriptProjectId'],
                'failedChecks': [k for k, v in e['checks'].items() if not v], 'deltas': e['deltas'], 'validator': e['validator']}
               for e in entries if not all(e['checks'].values())]
    exact = {}
    for seed, s in load(cmp_path)['seeds'].items():
        d = s['divergence']
        if d.get('status') != 'MEASURED':
            exact[seed] = 'MISSING'
        elif d['firstDifferentTick'] is None:
            exact[seed] = 'no difference (no shelving changed the state)'
        else:
            exact[seed] = {'firstDifferentTick': d['firstDifferentTick'], 'isFirstShelvingTick': d['firstDifferenceIsTheFirstShelvingTick'],
                           'accounts': d['accountsAtFirstDifference']}
    exact_ok = all(v == 'no difference (no shelving changed the state)'
                   or (isinstance(v, dict) and v['isFirstShelvingTick'] is True and all(a == 'EQUAL' for a in v['accounts'].values()))
                   for v in exact.values())
    status = 'MISSING' if any(v == 'MISSING' for v in exact.values()) else ('PASS' if not failing and exact_ok else 'FAIL')
    return {'status': status, 'shelvingsChecked': len(entries), 'failing': failing, 'firstShelvingExact': exact}


def control_d():
    names = ['natural-chain.jsonl', 'rival-economy.jsonl', 'weekly.jsonl', 's7.json', 'final-state.json']
    missing = [p(r, n) for r in ('c-p13a-1', 'c-p13a-2') for n in names if not os.path.isfile(p(r, n))]
    if missing:
        return {'status': 'MISSING', 'missing': missing}
    differ = [n for n in names if read_bytes(p('c-p13a-1', n)) != read_bytes(p('c-p13a-2', n))]
    return {'status': 'PASS' if not differ else 'FAIL', 'filesCompared': names, 'differ': differ}


def main():
    target = p('controls.json')
    if os.path.exists(target):
        raise SystemExit(f'refusing to overwrite {target}')
    result = {'a_test3_head_equality': control_a(), 'b_player_only_saves': control_b(),
              'c_no_refund_or_ledger_movement_at_shelving': control_c(), 'd_determinism_two_runs': control_d()}
    with open(target, 'x', encoding='utf-8') as f:
        json.dump(result, f, indent=1)
        f.write('\n')
    for name, r in sorted(result.items(), key=lambda kv: kv[1]['status'] == 'PASS'):
        print(f"control {name}: {r['status']}")
    print(f'wrote {target}')


if __name__ == '__main__':
    main()
