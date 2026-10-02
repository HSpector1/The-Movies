"""1344-M3: read the recorded gates' comparisons against the 1344-N success line (1344-N:80-82, as 1344-F6 §3 reads it).
usage (repo root): python3 1344-M3-check.py <core-vs1338.json> <ui-vs1343.json> <out.json>
Expected sets come from the x3 dry run (1344-X9). The applied tree differs from x3's in three test files (two HYGIENE
comments, and the S9 regexes in p14c3-transitions, which passes in both trees; 1344-J3 defect 1):
- core GONE: the exporter row only; SAME plus CHANGED: x3's 78 retained identities;
- core CHANGED: x3's CHANGED rows without a scratch path (four S10 rows, the C20 row), each with x3's primary;
  x3's six C17 rows carried the scratch path, so in the repo they are SAME;
- core NEW: the seven 1344-F6 declared exceptions. Any other NEW row is listed for attribution (environment on its own
  evidence, or a finding). The hygiene row and x3's scratch-only "Fake Unity" rows are expected to pass;
- UI: x3's CHANGED 3 (numpy) and GONE 7 (Pillow), NEW 0.
Exit 1 when any expectation fails; the output lists every row behind each verdict."""
import sys, json

E = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
core_path, ui_path, out_path = sys.argv[1:4]
x3, x3ui = json.load(open(f'{E}/1344-X9-core-vs1338.json')), json.load(open(f'{E}/1344-X9-ui-vs1343.json'))
core, ui = json.load(open(core_path)), json.load(open(ui_path))
F6_FILES = {'tests/p14b5-relationships.test.ts', 'tests/p14c2c-rival-promises.test.ts', 'tests/p14c3-admission-boundaries.test.ts'}

def ids(d, *status):
    return {r['identity'] for r in d['rows'] if r['status'] in status}

scratch = lambda r: '/studio-scratch/' in (r['primary'] or '')
x3_changed_real = {r['identity']: r['primary'] for r in x3['rows'] if r['status'] == 'CHANGED' and not scratch(r)}
f6 = {r['identity'] for r in x3['rows'] if r['status'] == 'NEW' and r['file'] in F6_FILES}
assert len(x3_changed_real) == 5 and len(f6) == 7, (len(x3_changed_real), len(f6))
by_id = {r['identity']: r for r in core['rows']}

checks = []
def check(name, ok, rows):
    checks.append({'check': name, 'ok': ok, 'rows': sorted(rows)})

gone, x3_gone = {g['identity'] for g in core['gone']}, {g['identity'] for g in x3['gone']}
check('core GONE is the exporter row only', gone == x3_gone, gone ^ x3_gone)
retained, x3_retained = ids(core, 'SAME', 'CHANGED'), ids(x3, 'SAME', 'CHANGED')
check('core SAME plus CHANGED equals x3 (1338 minus the exporter row)', retained == x3_retained, retained ^ x3_retained)
changed = ids(core, 'CHANGED')
check('core CHANGED is the four S10 rows and the C20 row', changed == set(x3_changed_real), changed ^ set(x3_changed_real))
moved = {i for i in changed & set(x3_changed_real) if by_id[i]['primary'] != x3_changed_real[i]}
check('each CHANGED primary equals x3', not moved, moved)
new = ids(core, 'NEW')
check('core NEW includes every 1344-F6 exception', f6 <= new, f6 - new)
check('core NEW holds nothing else (else: attribute or report a finding)', new <= f6, new - f6)

for status, label in (('CHANGED', 'numpy'), ('NEW', 'none')):
    a, b = ids(ui, status), ids(x3ui, status)
    check(f'UI {status} equals x3 ({label})', a == b, a ^ b)
ug, xg = {g['identity'] for g in ui['gone']}, {g['identity'] for g in x3ui['gone']}
check('UI GONE equals x3 (Pillow)', ug == xg, ug ^ xg)
check('UI SAME is empty, as at x3', not ids(ui, 'SAME'), ids(ui, 'SAME'))

out = {'core': core_path, 'ui': ui_path, 'coreCounts': core['counts'], 'uiCounts': ui['counts'],
       'allHold': all(c['ok'] for c in checks), 'checks': checks}
json.dump(out, open(out_path, 'x'), indent=1)
for c in checks:
    print('HOLDS' if c['ok'] else 'FAILS', '|', c['check'], '|', len(c['rows']), 'row(s)')
sys.exit(0 if out['allHold'] else 1)
