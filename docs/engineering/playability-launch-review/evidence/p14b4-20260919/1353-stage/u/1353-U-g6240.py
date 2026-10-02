#!/usr/bin/env python3
"""1353-U: does G6240 (the genuine Save38 the P15C RED freezes as G6240F) separate v1 from 60/49/20? Read-only.
Counts follow 1359-A §3.1 (the adapter) and the law's products; prints per-studio counts under both eras."""
import json
E = '/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919'
save = json.load(open(E + '/1052-c3-endurance-A-observer-fixed/authority-6240.json'))
st = save['state']
B = 6240
bmv = st['market']['baseMarketValue']
h = st['hollywood']
runs = {r['productionId']: r for r in st['theatricalRuns']}
rel = {}  # studioId -> list of (critic, settled, gross)
for f in st['studio']['releasedFilms']:
    if f['releaseTick'] >= B:
        continue
    run = runs.get(f['productionId'])
    sw = f['releaseTick'] if run is None or run['status'] == 'legacyCompleted' else (
        f['releaseTick'] + run['totalWeeks'] - 1 if f['releaseTick'] + run['totalWeeks'] <= B else None)
    settled = sw is not None and sw < B
    rel.setdefault(h['playerStudioId'], []).append((f['criticScore'], settled, f['boxOffice']['total'] if settled else None))
for f in h['films']:
    if f['provenance'] != 'simulation/v1' or f['result']['releaseTick'] >= B:
        continue
    settled = f['settledWeek'] is not None and f['settledWeek'] < B
    rel.setdefault(f['studioId'], []).append((f['result']['criticScore'], settled, f['result']['boxOffice']['total'] if settled else None))
need = lambda s, n: max(5, (s * n + 99) // 100)
print(f"save {save['saveVersion']}, tick {st['market']['tick']}, bmv {bmv}, player {h['playerStudioId']}")
for era, C, P, S in (('v1', 70, 90, 25), ('v2', 60, 49, 20)):
    for sid, xs in sorted(rel.items()):
        n = len(xs); a = sum(c >= C for c, _, _ in xs)
        s = [g for _, ok, g in xs if ok]; hh = sum(100 * g >= P * bmv for g in s)
        print(f"  {era} {sid[-12:]:>12}: n {n:>3} a {a:>3} ({'held' if a - need(S, n) >= 0 else 'notHeld'}) | "
              f"s {len(s):>3} h {hh:>3} ({'held' if hh - need(S, len(s)) >= 0 else 'notHeld'})")

# The player's distributions on G6240 (an engaged driver's 120-year career), type 7 quantiles.
import math
def q7(xs, q):
    xs = sorted(xs); hh = (len(xs) - 1) * q; lo = math.floor(hh)
    return xs[-1] if lo >= len(xs) - 1 else xs[lo] + (hh - lo) * (xs[lo + 1] - xs[lo])
xs = rel[h['playerStudioId']]
crit = [c for c, _, _ in xs]; reach = [g / bmv for _, ok, g in xs if ok]
pts = (('p50', .5), ('p75', .75), ('p90', .9), ('max', 1))
print('player critic ' + ', '.join(f'{k} {q7(crit, q):.1f}' for k, q in pts) + f'; >= 60: {sum(c >= 60 for c in crit)}/{len(crit)}')
print('player reach  ' + ', '.join(f'{k} {q7(reach, q):.3f}' for k, q in pts) + f'; settled {len(reach)}')
top = max((P for P in range(1, 101) if sum(100 * g >= P * bmv for _, ok, g in xs if ok) - need(20, len(reach)) >= 0), default=None)
print(f'player holds commercial-engine at share 20 up to a hit line of {top}' if top else 'player holds commercial-engine at share 20 at no hit line from 1 to 100')
print(f'player films with gross 0: {sum(1 for _, ok, g in xs if ok and g == 0)} of {len(xs)}')
