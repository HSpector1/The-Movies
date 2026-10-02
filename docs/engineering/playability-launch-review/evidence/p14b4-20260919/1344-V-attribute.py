#!/usr/bin/env python3
"""1344-V: attribute every natural-route movement and promise movement of the §7 kit (1344-F3 :16-17; 1344-F5 items 13-15, 18).

usage: python3 1344-V-attribute.py [OUT]     (default: 1344-V-movements.json beside this script; never overwrites)

Reads only the published kit outputs under E/1344-stage/s7/out/:
  compare.json                       movements, promiseMovements, sameStudioLawEventsAtOrBefore (the rows to attribute)
  c-diag/decide-diag.jsonl           candidate chooser rows, p13a only (outcome, best contribution)
  o-diag/decide-diag.jsonl           old-tree chooser rows, p13a weeks 0-215 (greenlights of removed films)
  <run>/s7.json                      full law-event lists and event weeks (compare.py keeps only the last 3 law events)
  <run>/natural-chain.jsonl          promiseDetail with the contract flag (compare.json drops it)
Writes one JSON file. Deterministic: same inputs, same bytes.

Basis (F5 item 15): the two trees differ only by the shelving law, and on every seed the stripped states are equal up
to the tick after the first shelving, with every rival account equal there and no movement before it. So every
movement follows from the law; the rules below name the law path for each one, or flag it.

Rules.
  Film or commission movement: attributed to the studio's latest shelving at or before the movement week
  (sameStudioLawEventsAtOrBefore; s7.json when that 3-event window holds no shelving). The mechanism comes from the law
  at 469a9547 (LAW below): the active index, the commission hold, the retry path. A row no rule explains is flagged.
  Promise movement: attributed through the issuer's film movements inside the promise window [start, due). That
  explains a changed outcome of one promise bound in both trees. A promise present in one tree only, or bound in one
  tree only, is flagged with its evidence: the film rule cannot attribute a change of authoring or binding.
"""
import hashlib
import json
import os
import re
import sys

E = '/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919'
OUT = E + '/1344-stage/s7/out'
SEEDS = [('p13a-core-causal-01', 'c-p13a-1', 'o-p13a'), ('seed-b', 'c-seedb', 'o-seedb'),
         ('p13b-s8-bridge-probe-01', 'c-ledger-p13b', 'o-ledger-p13b'),
         ('p13-public-commercial-adoption', 'c-ledger-p13pub', 'o-ledger-p13pub')]
P13A = 'p13a-core-causal-01'
FILM_KINDS = ('announced', 'firstTakes', 'released')
# src/core/hollywoodTick.ts and tuning.ts at 469a9547, read with `git show 469a9547:<path>`.
LAW = {
    'index': 'hollywoodTick.ts:277 a shelved ordinal leaves activeScriptOrdinals (frees the slot)',
    'hold': 'hollywoodTick.ts:280 commissionHoldUntilWeek = week + 13; :302 no commission before it',
    'gate': 'hollywoodTick.ts:301 no commission while activeScriptOrdinals.length >= 2 or cash < reserve',
    'retry': 'hollywoodTick.ts:286-287 retry only with no production and a free slot; :292-295 viable retry re-enters the index and greenlights; :296-297 rejection advances retryWeek',
    'count': 'hollywoodTick.ts:267 only an economic rejection counts; :272-281 shelving at 13 (tuning.ts:33)',
    'staffing': 'hollywoodTick.ts:225 a staffing-blocked evaluation never calls the chooser',
}


def sha_file(path):
    with open(path, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()


def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def jsonl(path):
    with open(path, encoding='utf-8') as f:
        return [json.loads(line) for line in f if line.strip()]


def short(studio_id):
    return studio_id.rsplit('-', 1)[-1]


def screenplay_of(film_id):
    m = re.fullmatch(r'.*:film:(\d+)', film_id)  # hollywoodTick.ts:241 `${studioId}:film:${ordinal}`
    return None if m is None else f'script-{int(m.group(1)):04d}'


def events(s7, studio_id):
    for st in s7['studios'] + s7.get('otherStudios', []):
        if st['studioId'] == studio_id:
            return st
    return None


def weeks_of(st, kind, ident):
    return [] if st is None else [e['week'] for e in st['events'][kind] if e['id'] == ident]


def law_list(st):
    ev = [(s['week'], 'shelved', s['id']) for s in st['shelvings']]
    ev += [(r['week'], 'retry viable', r['id']) for r in st['retries']['viable']]
    ev += [(r['week'], 'retry rejected', r['id']) for r in st['retries']['economicRejection']]
    return sorted(ev)


def diag_row(r):
    best = r['pol']['best'] or {}
    return {'week': r['week'], 'ready': r['ready'], 'retry': r['retry'], 'outcome': r['outcome'],
            'bestContribution': best.get('contribution'), 'bestScore': r['pol']['bestScore'], 'hold': r['pol']['hold'],
            'unaffordable': r['pol']['cash'], 'affordable': r['pol']['evaluated'], 'cash': r['cash'], 'reserve': r['reserve']}


class Diag:
    def __init__(self, path):
        self.rows = jsonl(path)
        self.by = {}
        for r in self.rows:
            self.by.setdefault((r['studio'], r['week']), []).append(r)

    def around(self, studio, week):
        """Rows at the week; with none, the studio's latest evaluation week before it."""
        at = self.by.get((studio, week), [])
        if at:
            return {'atWeek': [diag_row(r) for r in at]}
        prior = [w for (s, w) in self.by if s == studio and w < week]
        return {'atWeek': [], 'latestBefore': [diag_row(r) for r in self.by[(studio, max(prior))]] if prior else []}

    def greenlight(self, studio, week, screenplay):
        return [diag_row(r) for r in self.by.get((studio, week), []) if r['ready'] == screenplay and r['outcome'] == 'viable']

    def summary(self, studio):
        rs = [r for r in self.rows if r['studio'] == studio]
        out = {'rows': len(rs)}
        if not rs:
            return out
        counts = {}
        for r in rs:
            k = ('retry:' if r['retry'] else 'ready:') + r['outcome']
            counts[k] = counts.get(k, 0) + 1
        weeks = sorted({r['week'] for r in rs})
        blocked = [r['week'] for r in rs if r['outcome'] == 'cashBlocked']
        not_blocked = [r['week'] for r in rs if r['outcome'] != 'cashBlocked']
        last_open = max(not_blocked) if not_blocked else None
        tail = [w for w in weeks if last_open is None or w > last_open]
        out.update({'counts': counts, 'firstWeek': weeks[0], 'lastWeek': weeks[-1],
                    'lastViable': max([r['week'] for r in rs if r['outcome'] == 'viable'], default=None),
                    'firstCashBlocked': min(blocked, default=None),
                    'everyEvaluationCashBlockedFrom': tail[0] if tail else None,
                    'cashAtLastRow': rs[-1]['cash'], 'reserveAtLastRow': rs[-1]['reserve']})
        return out


def latest_shelving(m, full):
    win = [x for x in m['sameStudioLawEventsAtOrBefore'] if x[1] == 'shelved']
    if win:
        return {'week': win[-1][0], 'screenplay': win[-1][2], 'source': 'compare.json sameStudioLawEventsAtOrBefore'}
    old = [x for x in full if x[1] == 'shelved' and x[0] <= m['week']]
    if old:
        return {'week': old[-1][0], 'screenplay': old[-1][2],
                'source': 's7.json shelvings (outside compare.py\'s last-3 law-event window)'}
    return None


def attribute_movement(seed, m, cs7, os7, hold_weeks, cdiag, odiag, added_commissions):
    sid, w, kind, ident, change = m['studioId'], m['week'], m['kind'], m['id'], m['change']
    cst, ost = events(cs7, sid), events(os7, sid)
    full = law_list(cst) if cst and 'shelvings' in cst else []
    L = latest_shelving(m, full)
    row = {'seed': seed, 'week': w, 'studio': short(sid), 'kind': kind, 'id': ident, 'change': change,
           'lawWindow': m['sameStudioLawEventsAtOrBefore'], 'latestShelving': L}
    ev = []
    if L is None:
        row.update(status='flagged', mechanism='NO_LAW_EVENT',
                   flagReason='the studio has no shelving at or before this week; no rule attributes the row')
        return row
    hold_end = L['week'] + hold_weeks
    if kind == 'commissions':
        cw, ow = weeks_of(cst, 'commissions', ident), weeks_of(ost, 'commissions', ident)
        ev.append(f'{ident} commissioned at {cw or "never"} in the candidate and {ow or "never"} in the old tree (s7.json)')
        if change == 'added':
            if w < hold_end:
                row.update(status='flagged', mechanism='LAW_INCONSISTENT',
                           flagReason=f'commission at {w} inside the hold that ends at {hold_end}; {LAW["hold"]}')
            else:
                row.update(status='attributed', mechanism='SLOT_FREED_COMMISSION',
                           attribution=(f'shelving of {L["screenplay"]} at week {L["week"]}: the slot it freed ({LAW["index"]}) leaves '
                                        f'the active index below 2 ({LAW["gate"]}); the hold ended at week {hold_end} ({LAW["hold"]})'
                                        + ('; this is the first week the hold allows' if w == hold_end else '')))
        else:
            if w < hold_end:
                row.update(status='attributed', mechanism='HOLD_BLOCKED_COMMISSION',
                           attribution=(f'the hold set by shelving {L["screenplay"]} at week {L["week"]} blocks commissions in weeks '
                                        f'{L["week"]}-{hold_end - 1} ({LAW["hold"]}); the old tree commissioned {ident} at {w}'))
            elif [x for x in cw if x < w] and any(a['id'] == ident and a['studio'] == short(sid) for a in added_commissions):
                row.update(status='attributed', mechanism='COMMISSION_EARLIER_IN_CANDIDATE',
                           attribution=(f'the candidate commissioned {ident} earlier, at {min(cw)} (an added row), after shelving freed '
                                        f'its slot; the old tree waited until {w} for a free slot ({LAW["gate"]})'))
            else:
                row.update(status='flagged', mechanism='UNEXPLAINED_COMMISSION_REMOVAL',
                           flagReason='the old tree commissioned here, outside the hold, and the candidate never commissioned it earlier')
        if cw and ow and not row.get('flagReason'):
            ev.append(f'the commission moved by {cw[0] - ow[0]:+d} weeks')
    else:
        sp = screenplay_of(ident)
        if sp is None:
            row.update(status='flagged', mechanism='UNPARSED_FILM_ID', flagReason=f'film id {ident} names no screenplay ordinal')
            return row
        row['screenplay'] = sp
        ca, oa = weeks_of(cst, 'announced', ident), weeks_of(ost, 'announced', ident)
        cc, oc = weeks_of(cst, 'commissions', sp), weeks_of(ost, 'commissions', sp)
        shelved = [s['week'] for s in (cst or {}).get('shelvings', []) if s['id'] == sp]
        viable = [r['week'] for r in (cst or {}).get('retries', {}).get('viable', []) if r['id'] == sp]
        ev.append(f'{ident} greenlit at {ca or "never"} in the candidate and {oa or "never"} in the old tree; '
                  f'{sp} commissioned at {cc or "never"} and {oc or "never"} (s7.json)')
        if shelved:
            ev.append(f'{sp} shelved in the candidate at {shelved}; viable retries {viable or "none"}')
        if change == 'added' and viable and ca and ca[0] in viable:
            row.update(status='attributed', mechanism='VIABLE_RETRY_FILM',
                       attribution=(f'{sp}, shelved at {shelved}, was retried viable at {ca[0]} and greenlit ({LAW["retry"]})'))
        elif change == 'removed' and shelved and min(shelved) <= w:
            row.update(status='attributed', mechanism='OWN_SCREENPLAY_SHELVED',
                       attribution=(f'the candidate shelved this film\'s own screenplay {sp} at {min(shelved)} ({LAW["index"]}); '
                                    f'the old tree kept it in the index and greenlit it at {oa}'
                                    + (f'; the candidate greenlit it later through a viable retry at {viable}' if viable else '')))
        elif cc != oc:
            row.update(status='attributed', mechanism='FILM_OF_MOVED_COMMISSION',
                       attribution=(f'the film follows its screenplay {sp}, commissioned at {cc or "never"} in the candidate and '
                                    f'{oc or "never"} in the old tree: a commission movement attributed by the commission rules '
                                    f'(latest shelving {L["screenplay"]} at {L["week"]})'))
        else:
            row.update(status='flagged', mechanism='UNEXPLAINED_FILM',
                       flagReason=f'{sp} was commissioned in the same week in both trees, never shelved before {w} and not retried')
    row['ruleAttribution'] = f'latest same-studio shelving at or before week {w}: {L["screenplay"]} at {L["week"]} ({L["source"]})'
    row['evidence'] = ev
    if seed == P13A:
        d = {'around': cdiag.around(short(sid), w)}
        if kind != 'commissions':
            sp = row['screenplay']
            ca, oa = weeks_of(cst, 'announced', ident), weeks_of(ost, 'announced', ident)
            if ca:
                d['candidateGreenlight'] = cdiag.greenlight(short(sid), ca[0], sp)
            if oa and oa[0] <= 215:
                d['oldGreenlight'] = odiag.greenlight(short(sid), oa[0], sp)
        row['diag'] = d
    return row


def promise_details(path):
    by = {}
    for p in jsonl(path)[-1]['promiseDetail']:
        by.setdefault((p['issuer'], p['ben'], p['fam'], p['win'][0], p['win'][1]), []).append(
            {'outcome': p['out'], 'outcomeWeek': p['ow'], 'contract': p['contract'], 'evidenceRefs': p['ev']})
    return by


def attribute_promise(seed, pm, cdet, odet, movements):
    key = (pm['issuer'], pm['beneficiary'], pm['family'], pm['window'][0], pm['window'][1])
    c, o = cdet.get(key), odet.get(key)
    w0, w1 = pm['window']
    row = {'seed': seed, 'issuer': short(pm['issuer']), 'beneficiary': pm['beneficiary'], 'family': pm['family'],
           'window': pm['window'], 'candidate': c, 'old': o}
    films = [{'week': m['week'], 'kind': m['kind'], 'id': m['id'], 'change': m['change']} for m in movements
             if m['studioId'] == pm['issuer'] and m['kind'] in FILM_KINDS and w0 <= m['week'] < w1]
    row['issuerFilmMovementsInWindow'] = films
    coincide = []
    for tree, det, change in (('candidate', c, 'added'), ('old', o, 'removed')):
        for d in det or []:
            if d['outcomeWeek'] is not None:
                coincide += [f'{tree} outcome {d["outcome"]} at {d["outcomeWeek"]} falls in the week of the {change} take {f["id"]}'
                             for f in films if f['kind'] == 'firstTakes' and f['week'] == d['outcomeWeek'] and f['change'] == change]
    row['takeAtOutcomeWeek'] = coincide
    if c is None or o is None:
        other, tree = (cdet, 'candidate') if c is None else (odet, 'old')
        row['changeType'] = 'presence'
        row['counterpartInOtherTree'] = [{'issuer': short(k[0]), 'family': k[2], 'detail': v} for k, v in sorted(other.items())
                                         if k[1] == pm['beneficiary'] and k[3] == w0 and k[4] == w1]
        row['status'] = 'flagged'
        row['flagReason'] = (f'this promise is absent from the {tree} tree: its authoring or its case moved, which no film '
                             f'movement can cause; the film rule attributes outcome changes of one promise only')
    elif sorted(x['contract'] for x in c) != sorted(x['contract'] for x in o):
        row['changeType'] = 'binding'
        row['status'] = 'flagged'
        row['flagReason'] = ('bound in one tree and unbound in the other: the beneficiary\'s case at the window start went to a '
                             'different studio; the outcome follows the binding, and no film movement explains it')
    else:
        row['changeType'] = 'outcome'
        if films and all(x['contract'] for x in c):
            row['status'] = 'attributed'
            row['attribution'] = 'the issuer\'s film movements inside the window change the count: ' + '; '.join(
                f'{f["kind"]} {f["id"]} {f["change"]} at {f["week"]}' for f in films)
        else:
            row['status'] = 'flagged'
            row['flagReason'] = 'outcome changed with no issuer film movement inside the window (or the promise is unbound)'
    return row


def check(result, cmp):
    """Runnable self-check: every row is attributed or flagged with a reason, and the counts match compare.json."""
    for seed, _, _ in SEEDS:
        d = cmp['seeds'][seed]['divergence']
        assert len([r for r in result['movements'] if r['seed'] == seed]) == len(d['movements']), seed
        assert len([r for r in result['promiseMovements'] if r['seed'] == seed]) == len(d['promiseMovements']), seed
    for r in result['movements'] + result['promiseMovements']:
        assert r['status'] in ('attributed', 'flagged'), r
        assert (r['status'] == 'flagged') == ('flagReason' in r), r


def main():
    target = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '1344-V-movements.json')
    if os.path.exists(target):
        raise SystemExit(f'refusing to overwrite {target}')
    cmp = load(OUT + '/compare.json')
    cdiag, odiag = Diag(OUT + '/c-diag/decide-diag.jsonl'), Diag(OUT + '/o-diag/decide-diag.jsonl')
    inputs = ['compare.json', 'c-diag/decide-diag.jsonl', 'o-diag/decide-diag.jsonl']
    result = {'meta': {}, 'seeds': {}, 'movements': [], 'promiseMovements': []}
    for seed, crun, orun in SEEDS:
        inputs += [f'{r}/{n}' for r in (crun, orun) for n in ('s7.json', 'natural-chain.jsonl')]
        cs7, os7 = load(f'{OUT}/{crun}/s7.json'), load(f'{OUT}/{orun}/s7.json')
        hold = cs7['meta']['tuning']['HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS']
        d = cmp['seeds'][seed]['divergence']
        fs = d['firstShelving']
        basis = {'firstDifferentTick': d['firstDifferentTick'], 'firstShelving': fs,
                 'firstDifferenceIsFirstShelvingPlusOne': d['firstDifferentTick'] == fs['week'] + 1,
                 'accountsAtFirstDifference': d['accountsAtFirstDifference'],
                 'allAccountsEqual': all(v == 'EQUAL' for v in d['accountsAtFirstDifference'].values()),
                 'movementsBeforeFirstShelving': len(d['movementsBeforeFirstShelving']),
                 'movements': len(d['movements']), 'promiseMovements': len(d['promiseMovements'])}
        basis['holds'] = basis['firstDifferenceIsFirstShelvingPlusOne'] and basis['allAccountsEqual'] and basis['movementsBeforeFirstShelving'] == 0
        result['seeds'][seed] = basis
        added = [{'id': m['id'], 'studio': short(m['studioId'])} for m in d['movements'] if m['kind'] == 'commissions' and m['change'] == 'added']
        for m in d['movements']:
            result['movements'].append(attribute_movement(seed, m, cs7, os7, hold, cdiag, odiag, added))
        cdet, odet = promise_details(f'{OUT}/{crun}/natural-chain.jsonl'), promise_details(f'{OUT}/{orun}/natural-chain.jsonl')
        for pm in d['promiseMovements']:
            result['promiseMovements'].append(attribute_promise(seed, pm, cdet, odet, d['movements']))
    result['p13aDiagByStudio'] = {s: cdiag.summary(s) for s in ('r01', 'r02', 'r03', 'r04')}
    tally = {}
    for part in ('movements', 'promiseMovements'):
        for r in result[part]:
            k = f"{part}|{r['seed']}|{r['status']}|{r.get('mechanism') or r.get('changeType')}"
            tally[k] = tally.get(k, 0) + 1
    result['meta'] = {'record': '1344-V', 'law': LAW, 'holdWeeks': hold,
                      'inputs': {n: sha_file(f'{OUT}/{n}') for n in sorted(set(inputs))}, 'tally': dict(sorted(tally.items()))}
    check(result, cmp)
    with open(target, 'x', encoding='utf-8') as f:
        json.dump(result, f, indent=1, sort_keys=True)
        f.write('\n')
    for k, v in result['meta']['tally'].items():
        print(f'{v:4d}  {k}')
    print('wrote', target)


if __name__ == '__main__':
    main()
