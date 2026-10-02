"""1357-X: fill the 1357-A §8 table from the 1357-P probe output. Usage: python3 1357-X-table.py <probe.json>
Prints one JSON document: per seed and arm, the checkpoint shares, each read-out's band, and the worst-seed verdict.
The bands are 1357-A §8's, verbatim; the worst seed decides (§8 table header: "arm B, worst seed")."""
import json, sys

d = json.load(open(sys.argv[1]))
RANK = {'Proceed': 0, 'Flag': 1, 'Re-tune': 2}


def band(share, proceed, flag):
    # §8: Proceed at or below `proceed`; Flag up to and including `flag`; Re-tune above it.
    return 'Proceed' if share <= proceed else 'Flag' if share <= flag else 'Re-tune'


seeds, verdict = [], 'Proceed'
for s in d['seeds']:
    cp = s['checkpoints']
    rows = []
    c60, c00, c40 = cp['1960'], cp['2000'], cp['2040']
    r1 = c60['b']['closureDue'] / c60['rivalsEntered']
    rows.append({'readOut': 'closure due by 1960 / rivals entered by 1960', 'value': f"{c60['b']['closureDue']}/{c60['rivalsEntered']}",
                 'share': r1, 'band': band(r1, 0.25, 0.50)})
    r2 = c00['b']['closureDue'] / c00['rivalsEntered']
    rows.append({'readOut': 'closure due by 2000 / rivals entered by 2000', 'value': f"{c00['b']['closureDue']}/{c00['rivalsEntered']}",
                 'share': r2, 'band': band(r2, 1 / 3, 0.60)})
    r3 = c40['b']['closureDue'] / 9
    left = 9 - c40['b']['closureDue']
    b3 = 'Re-tune' if r3 > 0.75 or left < 3 else band(r3, 0.50, 0.75)
    rows.append({'readOut': 'closure due by 2040 / 9 rivals', 'value': f"{c40['b']['closureDue']}/9, {left} left",
                 'share': r3, 'band': b3})
    diffs = {y: c['b']['closureDue'] - c['a']['closureDue'] for y, c in cp.items()}
    worst = max(diffs.values())
    rows.append({'readOut': 'closure due, arm B minus arm A, at any checkpoint', 'value': diffs,
                 'band': 'Proceed' if worst <= 0 else 'Flag' if worst == 1 else 'Re-tune'})
    early = s['earlyClosures']
    rows.append({'readOut': 'a rival closure due within 104 weeks of entry', 'value': early, 'band': 'Proceed' if not early else 'Flag'})
    seedVerdict = max((r['band'] for r in rows), key=RANK.get)
    verdict = max(verdict, seedVerdict, key=RANK.get)
    rivals = [r for r in s['studios'] if r['role'] == 'rival']
    seeds.append({
        'seed': s['seed'], 'rows': rows, 'seedVerdict': seedVerdict,
        'recoveries': sum(1 for r in s['studios'] for t in r['a']['transitions'] if t['to'] == 'recovery'),
        'neverWarned': [r['studioId'] for r in rivals if r['everWarnedA'] is None],
        'reserveBeforeWarning': {r['studioId'][-3:]: [r['firstBelowReserveWeek'], r['everWarnedA']] for r in rivals},
        'strainedAboveWarnWeeks': {r['studioId'][-3:]: r['strainedAboveWarnWeeks'] for r in s['studios']},
        'distressEntriesUnderTwoRoutes': len(s['distressEntriesUnderTwoRoutes']),
        'player': {k: v for k, v in next(r for r in s['studios'] if r['role'] == 'player')['a']['firstWeek'].items()},
        'events': s['events'], 'rootBytesArmB': s['rootBytesArmB'], 'elapsedMs': s['elapsedMs'], 'msPerTick': round(s['msPerTick'], 2),
    })
print(json.dumps({'probe': d['probe'], 'treeHead': d['treeHead'], 'weeks': d['weeks'], 'verdict': verdict, 'seeds': seeds}, indent=1))
