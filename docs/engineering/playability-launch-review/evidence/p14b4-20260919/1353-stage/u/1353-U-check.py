#!/usr/bin/env python3
"""1353-U: independent recomputation for the review of 1353-T and 1353-F6. Read-only; prints to stdout.

  python3 1353-U-check.py

Reads E/1353-stage/t/dist.json, E/1355-stage/g1/1355-G1-output.json and E/1359-stage/gp/1359-GP-output.json.
Written independently of 1353-T-holders.py. Every count uses the law's own products on the JSON doubles
(src/core/campaignLegacy.ts at b0809602):
  artistic-voice     :586 a = releases with critic >= C;            :591 held when a >= M and 100a >= S*n
  commercial-engine  :616 settled; :618 h = 100*gross >= P*bmv;      :623 held when h >= M and 100h >= S*s
"""
import json
import math

E = '/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919'
dist = json.load(open(E + '/1353-stage/t/dist.json'))
g1 = json.load(open(E + '/1355-stage/g1/1355-G1-output.json'))
gp = json.load(open(E + '/1359-stage/gp/1359-GP-output.json'))
M = 5

cols = dist['releaseColumns']
rows = {s['seed']: [dict(zip(cols, r)) for r in dist['releaseRows'][s['seed']]] for s in dist['seeds']}
bmv = {s['seed']: s['baseMarketValue'] for s in dist['seeds']}
studios = {s['seed']: [st['studioId'] for st in s['studios']] for s in dist['seeds']}
short = lambda sid: sid[-3:]

# ── provenance ──
for s in dist['seeds']:
    lc = s['lawCheck']
    gp_hash = next((g['manifestSha256'] for g in gp['seeds'] if g['seed'] == s['seed']), None)
    print(f"provenance {s['seed']}: lawCheck studios {lc['studios']}, comparisons {lc['comparisons']}, "
          f"mismatches {len(lc['mismatches'])}; manifest {s['manifestSha256'][:8]}, 1359-GP {gp_hash[:8] if gp_hash else '-'}, "
          f"equal {s['manifestSha256'] == gp_hash if gp_hash else 'n/a'}")
print(f"provenance: top-level lawCheck {dist['lawCheck']}; law {dist['law']}; tree {dist['treeHead'][:8]}")

# ── the 1355-G1 factors, joined by id, with week and gross checked ──
gc = g1['releaseColumns']
factor = {}
for seed, grows in g1['releaseRows'].items():
    by_id = {r[gc.index('releaseId')]: r for r in grows}
    for r in rows[seed]:
        g = by_id[r['filmId']]  # KeyError = a release with no G1 row
        assert g[gc.index('week')] == r['releaseWeek'] and g[gc.index('gross')] == r['grossSettled'], r['filmId']
        factor[r['filmId']] = g[gc.index('factor')]
    assert len(by_id) == len(rows[seed]), (seed, len(by_id), len(rows[seed]))
fs = list(factor.values())
print(f"G1 join: {len(factor)} releases joined (week and gross equal); factor min {min(fs):.4f}, max {max(fs):.4f}, "
      f"all <= 1: {all(f <= 1 for f in fs)}")


def gross(r, pressured):
    return r['grossSettled'] * factor[r['filmId']] if pressured else r['grossSettled']


def need(share, n):
    return max(M, (share * n + 99) // 100)


def hits(seed, rel, P, pressured=False):
    return sum(1 for r in rel if r['settled'] and 100 * gross(r, pressured) >= P * bmv[seed])


def acclaimed(rel, C):
    return sum(1 for r in rel if r['criticScore'] >= C)


def of(seed, sid):
    return [r for r in rows[seed] if r['studioId'] == sid]


rivals = {seed: [r for r in rows[seed] if r['role'] == 'rival'] for seed in rows}
assert all(r['settled'] for seed in rows for r in rows[seed])  # every release settled at 6240: s = n

# ── 1. F6 ruling 1's table and the neighbourhood on seed-b (share floor 20) ──
SB = 'seed-b'
print('\n1. seed-b, commercial-engine, share floor 20: pool at the line, floor / pool rate, holders (margin)')
print('   P  grosses    pool hits   rate   floor/rate  holders (margin)                      near misses')
for P in range(45, 56):
    for pressured in (False, True):
        pool = hits(SB, rivals[SB], P, pressured)
        rate = pool / len(rivals[SB])
        ms = []
        for sid in studios[SB]:
            rel = of(SB, sid)
            if not rel:
                continue
            ms.append((short(sid), hits(SB, rel, P, pressured) - need(20, len(rel))))
        held = ', '.join(f'{k} {m:+d}' for k, m in ms if m >= 0) or 'none'
        near = ', '.join(f'{k} {m:+d}' for k, m in ms if -6 <= m < 0)
        print(f"  {P:>2}  {'G1 factors' if pressured else 'as run    '}  {pool:>4}/{len(rivals[SB])}  {100 * rate:5.1f}%  "
              f"{20 / (100 * rate):6.3f}     {held:<36}  {near}")

# ── 2. leave-one-out: each holder against the rest of the pool ──
print('\n2. holders against the rest of the pool (the pool without the studio itself), share floor 20')
for P, pressured in ((49, False), (49, True), (50, False), (50, True)):
    for sid in studios[SB]:
        rel = of(SB, sid)
        if not rel:
            continue
        h = hits(SB, rel, P, pressured)
        if h - need(20, len(rel)) < 0 and short(sid) not in ('r07',):
            continue
        rest = [r for r in rivals[SB] if r['studioId'] != sid]
        rr = hits(SB, rest, P, pressured) / len(rest)
        print(f"  P {P} {'G1' if pressured else 'run'}: {short(sid)} h {h}/{len(rel)} = {100 * h / len(rel):.1f}%, "
              f"rest of pool {100 * rr:.1f}%, own / rest {h / len(rel) / rr:.2f}, floor / rest {0.2 / rr:.2f}, "
              f"margin {h - need(20, len(rel)):+d}")
for C in (60,):
    for sid in studios[SB]:
        rel = of(SB, sid)
        if not rel:
            continue
        a = acclaimed(rel, C)
        if a - need(20, len(rel)) < 0:
            continue
        rest = [r for r in rivals[SB] if r['studioId'] != sid]
        rr = acclaimed(rest, C) / len(rest)
        print(f"  critic {C}: {short(sid)} a {a}/{len(rel)} = {100 * a / len(rel):.1f}%, rest of pool {100 * rr:.1f}%, "
              f"own / rest {a / len(rel) / rr:.2f}, floor / rest {0.2 / rr:.2f}, margin {a - need(20, len(rel)):+d}")


# ── 3. the volume test: chance that a studio at the pool's rate holds, by its release count ──
def p_hold(n, p, share=20):
    k = need(share, n)
    return sum(math.comb(n, j) * p ** j * (1 - p) ** (n - j) for j in range(k, n + 1))


print('\n3. null model: P(hold) for a studio whose every release hits at the pool rate (binomial), share floor 20')
lines = [('critic 60', acclaimed(rivals[SB], 60) / len(rivals[SB]))]
for P in (48, 49, 50):
    for pressured in (False, True):
        lines.append((f"hit {P} {'G1' if pressured else 'run'}", hits(SB, rivals[SB], P, pressured) / len(rivals[SB])))
ns = (25, 50, 100, 273, 419, 464)
print('   line          rate   ' + '  '.join(f'n={n:<4}' for n in ns))
for label, p in lines:
    print(f'   {label:<12} {100 * p:5.1f}%  ' + '  '.join(f'{p_hold(n, p):6.3f}' for n in ns))

# ── 4. how much more pressure each line absorbs: r06's break-even extra multiplier on every gross ──
print('\n4. r06 at share 20: the largest extra uniform gross multiplier k at which it still holds (k* = P*bmv / (100 * g_need))')
r06 = next(s for s in studios[SB] if s.endswith('r06'))
rel = of(SB, r06)
k_need = need(20, len(rel))
for P in (48, 49, 50, 51):
    for pressured in (False, True):
        gs = sorted((gross(r, pressured) for r in rel if r['settled']), reverse=True)
        kstar = P * bmv[SB] / (100 * gs[k_need - 1])
        print(f"   P {P} {'G1 factors' if pressured else 'as run    '}: need {k_need}, k* {kstar:.4f} "
              f"(holds while grosses fall by at most {100 * (1 - kstar):.1f}% more)" if kstar <= 1 else
              f"   P {P} {'G1 factors' if pressured else 'as run    '}: need {k_need}, k* {kstar:.4f} (already short)")
tot = sum(r['grossSettled'] for r in rows[SB])
print(f"   G1 first-order gross change on seed-b: {100 * sum(r['grossSettled'] * (1 - factor[r['filmId']]) for r in rows[SB]) / tot:.2f}%; "
      f"r06's own: {100 * sum(r['grossSettled'] * (1 - factor[r['filmId']]) for r in rel) / sum(r['grossSettled'] for r in rel):.2f}%")

# ── 5. 1353-T §3.1-§3.4 heights and kept values on seed-b ──
def q7(xs, q):
    xs = sorted(xs)
    h = (len(xs) - 1) * q
    lo = math.floor(h)
    return xs[-1] if lo >= len(xs) - 1 else xs[lo] + (h - lo) * (xs[lo + 1] - xs[lo])


cr = [r['criticScore'] for r in rivals[SB]]
re = [r['reach'] for r in rivals[SB]]
print('\n5. 1353-T heights on seed-b')
print(f"   critic p83 {q7(cr, .83):.2f}, p84 {q7(cr, .84):.2f}; >= 60: {acclaimed(rivals[SB], 60)}")
print(f"   reach p81 {q7(re, .81):.4f}, p82 {q7(re, .82):.4f}, p83 {q7(re, .83):.4f}, p84 {q7(re, .84):.4f}; reach p25 {q7(re, .25):.3f}")
print(f"   critic < 35: {sum(1 for x in cr if x < 35)}; 100*gross < 30*bmv: {sum(1 for r in rivals[SB] if 100 * r['grossSettled'] < 30 * bmv[SB])}; "
      f"critic >= 55: {100 * acclaimed(rivals[SB], 55) / len(cr):.1f}%; hit 48 as run: {100 * hits(SB, rivals[SB], 48) / len(cr):.1f}%")

# ── 6. 1353-T §3.5: own share over pool rate, lines 45-60 (hits) and 55-70 (critic), where own share >= 20 ──
print('\n6. 1353-T §3.5: best own-share / pool-rate ratio where the own share clears 20%')
best_c = max(((acclaimed(of(SB, s), C) / len(of(SB, s))) / (acclaimed(rivals[SB], C) / len(cr)), C, short(s))
             for C in range(55, 71) for s in studios[SB] if of(SB, s) and acclaimed(of(SB, s), C) / len(of(SB, s)) >= 0.2)
best_h = max(((hits(SB, of(SB, s), P) / len(of(SB, s))) / (hits(SB, rivals[SB], P) / len(cr)), P, short(s))
             for P in range(45, 61) for s in studios[SB] if of(SB, s) and hits(SB, of(SB, s), P) / len(of(SB, s)) >= 0.2)
print(f"   critic: {best_c[2]} at {best_c[1]}, ratio {best_c[0]:.2f}; hits: {best_h[2]} at {best_h[1]}, ratio {best_h[0]:.2f}")
r06_ratios = [(P, hits(SB, rel, P) / len(rel), (hits(SB, rel, P) / len(rel)) / (hits(SB, rivals[SB], P) / len(cr))) for P in range(45, 61)]
print(f"   r06 hits, lines 45-60: own share {100 * r06_ratios[0][1]:.1f}% to {100 * r06_ratios[-1][1]:.1f}%; "
      f"max ratio {max(x[2] for x in r06_ratios):.2f} at {max(r06_ratios, key=lambda x: x[2])[0]}")

# ── 7. 1353-T §3.6 alternatives ──
def holders(seed, C=None, P=None, S=20, pressured=False):
    out = []
    for sid in studios[seed]:
        rel = of(seed, sid)
        if not rel:
            continue
        x = acclaimed(rel, C) if C is not None else hits(seed, rel, P, pressured)
        m = x - need(S, len(rel))
        if m >= 0:
            out.append(f'{short(sid)} {m:+d}')
    return ', '.join(out) or 'none'


print('\n7. 1353-T §3.6 rows on seed-b (artistic-voice | commercial-engine)')
for C, P, S in ((70, 90, 25), (70, 90, 8), (70, 50, 8), (55, None, 20), (64, 55, 20), (59, 48, 25), (60, 49, 20), (60, 50, 20)):
    av = holders(SB, C=C, S=S)
    ce = holders(SB, P=P, S=S) if P is not None else '-'
    ceg = holders(SB, P=P, S=S, pressured=True) if P is not None else '-'
    print(f'   {C}/{P}/{S}: {av} | {ce} | under G1: {ceg}')

# ── 8. thin seeds: the highest line at which any studio holds (share 20 and 25) ──
print('\n8. thin seeds: highest critic line and hit line with any holder')
for seed in ('p13a-core-causal-01', 'p13a-wait-control-01'):
    for S in (20, 25):
        c_top = max((C for C in range(1, 101) if holders(seed, C=C, S=S) != 'none'), default=None)
        p_top = max((P for P in range(1, 101) if holders(seed, P=P, S=S) != 'none'), default=None)
        print(f'   {seed} share {S}: critic up to {c_top} ({holders(seed, C=c_top, S=S)}), hit line up to {p_top} '
              f'({holders(seed, P=p_top, S=S)})')
    mx = max(r['reach'] for r in rivals[seed])
    print(f'   {seed}: max reach {mx:.3f}; max critic {max(r["criticScore"] for r in rivals[seed]):.2f}')

# ── 9. F6 ruling 5: the expected G-P rows at 60 / 49 / 20 on 1359-X4's two seeds ──
print('\n9. expected G-P holders at 60 / 49 / 20')
for seed in ('p13a-core-causal-01', 'seed-b'):
    print(f'   {seed}: artistic-voice {holders(seed, C=60)} | commercial-engine {holders(seed, P=49)}')

# ── 10. 1353-T §2.3: careers by seed (first and last release year, count) ──
print('\n10. careers: first-last release year (count)')
for seed in rows:
    out = []
    for sid in studios[seed]:
        rel = of(seed, sid)
        if rel:
            ys = [1920 + r['releaseWeek'] // 52 for r in rel]
            out.append(f'{short(sid)} {min(ys)}-{max(ys)} ({len(rel)})')
    print(f'   {seed}: ' + ', '.join(out))
wc = [r for r in rows['p13a-wait-control-01'] if r['studioId'].endswith('r01')]
print(f"   wait-control r01 critic median {sorted(r['criticScore'] for r in wc)[len(wc) // 2]:.1f}")

# ── 11. share-floor variants around the ruling (seed-b; artistic-voice at 60 | commercial-engine as run | under G1) ──
print('\n11. share-floor variants on seed-b')
for P, S in ((49, 20), (49, 21), (50, 19), (50, 20), (48, 20)):
    pool = hits(SB, rivals[SB], P) / len(rivals[SB]); poolg = hits(SB, rivals[SB], P, True) / len(rivals[SB])
    print(f'   {P}/{S}: AV {holders(SB, C=60, S=S)} | CE {holders(SB, P=P, S=S)} | G1 {holders(SB, P=P, S=S, pressured=True)} '
          f'| floor/pool {S / (100 * pool):.2f} run, {S / (100 * poolg):.2f} G1')
