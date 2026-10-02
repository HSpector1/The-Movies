"""Compare the P15 Wave 2 REDs on the Save43 base (OLD) and the Save44 base (NEW), leaf by leaf, and each run with its
RED classification's expected status (and, for 1359, the classified first message at RED).
usage: python3 check-p15-save44.py   (reads old-<red>.json and new-<red>.json beside this script)"""
import json, os, sys
X = os.path.dirname(os.path.abspath(__file__))
E = '/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919'
CLS = {'1355': f'{E}/1355-stage/1355-p15a1-wave2-red-r4-classification.json',
       '1356': f'{E}/1356-stage/1356-p15a2-wave2-red-r4-classification.json',
       '1359': f'{E}/1359-stage/1359-p15c-wave2-red-r7-classification.json'}

def results(path):
    run = json.load(open(path)); out = {}
    for f in run['testResults']:
        file = 'tests/' + f['name'].split('/tests/')[-1]
        if f.get('status') == 'failed' and not f['assertionResults']:
            out[(file, '<file>')] = ('failed', (f.get('message') or '').strip().splitlines()[0][:300] if f.get('message') else '')
        for a in f['assertionResults']:
            msgs = a.get('failureMessages') or []
            out[(file, a['title'])] = (a['status'], (msgs[0].strip().splitlines()[0][:300] if msgs else '').replace('/tree-old/', '/tree/').replace('/tree-new/', '/tree/'))
    return out

def expected(red):
    d = json.load(open(CLS[red])); rows = d['leaves'] if isinstance(d, dict) else d; exp = {}
    for r in rows:
        if 'atRed' in r: want = 'passed' if r['atRed'].startswith('pass') else 'failed'
        else: want = 'passed' if r['expectedFailureToday'].strip().lower().startswith(('none', 'passes')) else 'failed'
        exp[(r['file'], r['leaf'])] = (want, (r.get('firstMessageAtRed') or '').strip() if r.get('firstMessageAtRed') not in (None, 'None') else '')
    return exp

bad = 0
for red in ('1355', '1356', '1359'):
    old, new, exp = results(f'{X}/old-{red}.json'), results(f'{X}/new-{red}.json'), expected(red)
    count = lambda res: (sum(s == 'passed' for s, _ in res.values()), sum(s == 'failed' for s, _ in res.values()), len(res))
    print(f'== {red}: OLD passed/failed/total {count(old)}; NEW {count(new)}; classified {len(exp)}')
    for label, res in (('OLD', old), ('NEW', new)):
        for key, (want, msg) in sorted(exp.items()):
            got = res.get(key)
            if got is None: print(f'  {label} MISSING {key[0].split("/")[-1]} :: {key[1][:90]}'); bad += 1; continue
            if got[0] != want: print(f'  {label} STATUS want {want} got {got[0]} :: {key[1][:80]} :: {got[1][:160]}'); bad += 1; continue
            if red == '1359' and want == 'failed' and msg and not (got[1] == msg or got[1].startswith(msg) or msg.startswith(got[1])):
                print(f'  {label} MESSAGE :: {key[1][:70]}\n      want {msg[:170]}\n      got  {got[1][:170]}'); bad += 1
        for key in sorted(set(res) - set(exp)): print(f'  {label} UNCLASSIFIED {key[0].split("/")[-1]} :: {key[1][:90]} :: {res[key][0]}')
    for key in sorted(set(old) | set(new)):
        a, b = old.get(key), new.get(key)
        if a != b: print(f'  OLD->NEW {key[0].split("/")[-1]} :: {key[1][:80]}\n      old {a}\n      new {b}'); bad += 1
sys.exit(1 if bad else 0)
