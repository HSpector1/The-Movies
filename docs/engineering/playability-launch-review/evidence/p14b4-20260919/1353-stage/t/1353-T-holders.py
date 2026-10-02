#!/usr/bin/env python3
"""1353-T: artistic-voice and commercial-engine holders from the 1353-T probe output, by the law's exact rules.

Read-only: it reads the probe JSON (and, for the pressure check, the 1355-G1 output) and prints to stdout.
  python3 1353-T-holders.py [dist.json] [1355-G1-output.json]

The rules, as src/core/campaignLegacy.ts applies them at b0809602:
  artistic-voice     :586 a = releases with critic >= C; :591 held when a >= M and 100a >= S*n
  commercial-engine  :616 s = settled releases; :618 h = those with 100*gross >= P*bmv; :623 held when h >= M and 100h >= S*s
Every comparison below is the law's own product, on the JSON's doubles; no quotient decides a count.
"""
import json
import math
import sys

E = '/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919'
DIST = sys.argv[1] if len(sys.argv) > 1 else '/Users/zacheryspector/studio-scratch/p15-probes/out/dist.json'
G1 = sys.argv[2] if len(sys.argv) > 2 else E + '/1355-stage/g1/1355-G1-output.json'
V1 = {'C': 70, 'P': 90, 'M': 5, 'S': 25}  # tuning.ts:1042, :1047, :1045, :1046
NEW = {'C': 60, 'P': 50, 'M': 5, 'S': 20}  # 1353-T

d = json.load(open(DIST))
cols = d['releaseColumns']
rows = {s['seed']: [dict(zip(cols, r)) for r in d['releaseRows'][s['seed']]] for s in d['seeds']}
short = {s['seed']: s['seed'].replace('p13a-', '').replace('-01', '') for s in d['seeds']}


def need(m, share, n):  # the smallest count with count >= m and 100*count >= share*n
    return max(m, (share * n + 99) // 100)


def rule(seed, studio_id, v, factor=None):
    bmv = next(s for s in d['seeds'] if s['seed'] == seed)['baseMarketValue']
    rel = [r for r in rows[seed] if r['studioId'] == studio_id]
    settled = [r for r in rel if r['settled']]
    gross = lambda r: r['grossSettled'] * (factor[r['filmId']] if factor else 1)
    n, s = len(rel), len(settled)
    a = sum(r['criticScore'] >= v['C'] for r in rel)
    h = sum(100 * gross(r) >= v['P'] * bmv for r in settled)
    return {'n': n, 'a': a, 'av': a - need(v['M'], v['S'], n), 's': s, 'h': h, 'ce': h - need(v['M'], v['S'], s),
            'panned': sum(r['criticScore'] < 35 for r in rel), 'flops': sum(100 * gross(r) < 30 * bmv for r in settled)}


def q7(xs, q):  # src/harness/d16/stats.ts:41-52, type 7
    xs = sorted(xs)
    if not xs:
        return None
    if len(xs) == 1:
        return xs[0]
    h = (len(xs) - 1) * q
    lo = math.floor(h)
    return xs[-1] if lo >= len(xs) - 1 else xs[lo] + (h - lo) * (xs[lo + 1] - xs[lo])


POINTS = [('min', 0), ('p50', .5), ('p75', .75), ('p90', .9), ('p95', .95), ('p99', .99), ('max', 1)]

# 1. The reimplementation reproduces the probe's counts at the v1 values, and its quantiles the probe's, exactly.
for seed_doc in d['seeds']:
    seed = seed_doc['seed']
    for st in seed_doc['studios']:
        mine = rule(seed, st['studioId'], V1)
        av, ce = st['artisticVoice'], st['commercialEngine']
        assert (mine['n'], mine['a'], mine['panned'], mine['av'] >= 0) == (av['n'], av['a'], av['panned'], av['held']), st['studioId']
        assert (mine['s'], mine['h'], mine['flops'], mine['ce'] >= 0) == (ce['s'], ce['h'], ce['flops'], ce['held']), st['studioId']
    rivals = [r for r in rows[seed] if r['role'] == 'rival']
    for key, xs in (('critic', [r['criticScore'] for r in rivals]), ('reach', [r['reach'] for r in rivals if r['settled']])):
        assert {k: q7(xs, q) for k, q in POINTS} == {k: seed_doc['allRivals'][key][k] for k, _ in POINTS}, (seed, key)
print('check: v1 counts equal the probe for', sum(len(s['studios']) for s in d['seeds']), 'studios; quantiles equal the JSON')

# 2. Distributions over rival releases: per seed (the JSON's allRivals) and pooled over the three seeds (computed).
print('\nrival distributions (critic score; reach = gross / baseMarketValue over settled releases)')
pooled = [r for seed in rows for r in rows[seed] if r['role'] == 'rival']
for label, rel in [(short[s], [r for r in rows[s] if r['role'] == 'rival']) for s in rows] + [('pooled', pooled)]:
    c = [r['criticScore'] for r in rel]
    g = [r['reach'] for r in rel if r['settled']]
    print(f'  {label:>13} n {len(c):>4}  critic ' + ' '.join(f'{k} {q7(c, q):.2f}' for k, q in POINTS)
          + '  | reach ' + ' '.join(f'{k} {q7(g, q):.3f}' for k, q in POINTS))

# 3. The share of rival releases at or above each line: the rate a holder's own share must beat.
print('\nrival releases at or above each line')
for seed in rows:
    bmv = next(s for s in d['seeds'] if s['seed'] == seed)['baseMarketValue']
    rel = [r for r in rows[seed] if r['role'] == 'rival']
    for v in (V1, NEW):
        a = sum(r['criticScore'] >= v['C'] for r in rel)
        h = sum(100 * r['grossSettled'] >= v['P'] * bmv for r in rel if r['settled'])
        print(f"  {short[seed]:>13} critic >= {v['C']}: {a:>3}/{len(rel)} {100 * a / len(rel):5.1f}%   "
              f"100 x gross >= {v['P']} x bmv: {h:>3}/{len(rel)} {100 * h / len(rel):5.1f}%")


# 4. Holders per archetype per seed, with each studio's margin in releases (negative: short of the floors).
def table(v, label, factor_of=None):
    print(f"\nholders at {label}: C {v['C']}, P {v['P']}, M {v['M']}, S {v['S']}")
    for seed_doc in d['seeds']:
        seed = seed_doc['seed']
        factor = factor_of(seed) if factor_of else None
        if factor_of and factor is None:
            continue
        xs = [(st['studioId'][-3:], rule(seed, st['studioId'], v, factor)) for st in seed_doc['studios']]
        for name, k, total, margin in (('artistic-voice', 'a', 'n', 'av'), ('commercial-engine', 'h', 's', 'ce')):
            held = sum(x[margin] >= 0 for _, x in xs)
            listed = ', '.join(f'{sid} {x[k]}/{x[total]} ({x[margin]:+d})' for sid, x in xs if x[total] >= v['M'])
            print(f'  {short[seed] if name == "artistic-voice" else "":>13} {name} held {held}/{len(xs)}: {listed}')


table(V1, 'v1 (today)')
table(NEW, '1353-T')

# audience-institution reads no changed key; the rows carry what it reads (law :595-611), so it is listed for all seeds.
print('\naudience-institution holders (no changed key; law :599-611 on the rows)')
for seed in rows:
    held = []
    for st in next(s for s in d['seeds'] if s['seed'] == seed)['studios']:
        decades = {}
        for r in rows[seed]:
            if r['studioId'] == st['studioId'] and r['audienceScore'] is not None:
                decades.setdefault((1920 + r['releaseWeek'] // 52) // 10, []).append(r['audienceScore'])
        good = sum(len(v) >= 2 and 2 * sum(x >= 57 for x in v) >= len(v) for v in decades.values())
        if good >= 4:
            held.append(f"{st['studioId'][-3:]} ({good} decades)")
    print(f'  {short[seed]:>13} {len(held)}/10: ' + (', '.join(held) or 'none'))

# 5. Neighbourhood on seed-b, the only seed with full careers: holders by line and share floor (M 5).
print('\nseed-b neighbourhood: holders (margin)')
for C in (58, 59, 60, 61, 62):
    cells = []
    for S in (20, 25):
        hs = [(st['studioId'][-3:], rule('seed-b', st['studioId'], {'C': C, 'P': 90, 'M': 5, 'S': S})['av'])
              for st in d['seeds'][1]['studios']]
        cells.append(f'S {S}: ' + (', '.join(f'{k} {m:+d}' for k, m in hs if m >= 0) or 'none'))
    print(f'  artistic-voice C {C}: ' + ' | '.join(cells))
for P in (47, 48, 49, 50, 51, 52):
    cells = []
    for S in (20, 25):
        hs = [(st['studioId'][-3:], rule('seed-b', st['studioId'], {'C': 70, 'P': P, 'M': 5, 'S': S})['ce'])
              for st in d['seeds'][1]['studios']]
        cells.append(f'S {S}: ' + (', '.join(f'{k} {m:+d}' for k, m in hs if m >= 0) or 'none'))
    print(f'  commercial-engine P {P}: ' + ' | '.join(cells))

# 6. Shared-market pressure, open loop: each gross times its release's 1355-G1 factor (1355-G1 ran two seeds).
g1 = json.load(open(G1))
gc = g1['releaseColumns']
factors = {seed: {r[gc.index('releaseId')]: r[gc.index('factor')] for r in g1['releaseRows'][seed]} for seed in g1['releaseRows']}
for seed in factors:
    g1_rows = {r[gc.index('releaseId')]: r for r in g1['releaseRows'][seed]}
    assert all(r['filmId'] in g1_rows and g1_rows[r['filmId']][gc.index('gross')] == r['grossSettled']
               and g1_rows[r['filmId']][gc.index('week')] == r['releaseWeek'] for r in rows[seed]), seed
print('\ncheck: every release joins its 1355-G1 row with the same week and gross')
for P in (48, 49, 50):
    table({**NEW, 'P': P}, f'1353-T with P {P}, grosses times the 1355-G1 factors', lambda seed: factors.get(seed))
