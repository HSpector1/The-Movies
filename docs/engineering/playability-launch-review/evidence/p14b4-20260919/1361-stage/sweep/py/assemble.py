"""Fill plan-template.md from 1361-N-classification.json and write the plan into the sweep folder."""
import json, collections, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
D = '/Users/zacheryspector/studio-scratch/1361-sweep/'
d = json.load(open(D + '1361-N-classification.json'))
rows = [r for r in d['rows'] if r['m2Status'] != 'TYPE']
types = [r for r in d['rows'] if r['m2Status'] == 'TYPE']
sites = d['sites']
core = [r for r in rows if not r['file'].startswith('ui/')]
ui = [r for r in rows if r['file'].startswith('ui/')]
edit_sites = [s for s in sites if s['class'] != 'KEEP']
def helper_site(r): return bool(r.get('site')) and (r['site'].startswith('tests/helpers/') or r['site'].startswith('tests/contracts/_v14Contract.ts'))
NAMES = {'S1': 'S1 live validator', 'S2': 'S2 live literals', 'S3': 'S3 sentinels', 'S4': 'S4 chains and typed APIs',
         'S5': 'S5 comparisons and lifts', 'S6': 'S6 hand-built states', 'S7': 'S7 shape projections', 'S8': 'S8 refusal messages',
         'S9': 'S9 first-guard masking', 'S10': 'S10 values and retained rows', 'T': 'T renamed titles'}
def dec(cls):
    c = collections.Counter(r['decision'] for r in rows if r['class'] == cls)
    return ', '.join(f'{n} {k}' for k, n in sorted(c.items())) or ('certain' if cls in ('S6', 'T') else '')
lines = []
for cls in ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'T']:
    cr = [r for r in core if r['class'] == cls]; ur = [r for r in ui if r['class'] == cls]
    hs = sum(1 for r in cr if helper_site(r)); uh = sum(1 for r in ur if helper_site(r))
    es = sum(1 for s in edit_sites if s['class'] == cls); eu = sum(1 for s in edit_sites if s['class'] == 'UI') if cls == 'S2' else 0
    ts = sum(1 for t in types if t['class'] == cls)
    uitxt = f'{len(ur)} ({uh} through a helper)' if uh else str(len(ur))
    estxt = f'{es} core, {eu} UI' if eu else str(es)
    lines.append(f'| {NAMES[cls]} | {len(cr)} | {hs} | {uitxt} | {estxt} | {ts} | {dec(cls)} |')
out_cnt = collections.Counter(r['class'] for r in core if r['class'] in ('RED-1355', 'ENV', 'X'))
lines.append(f"| outside the sweep (RED-1355, ENV, X) | {out_cnt['RED-1355']}, {out_cnt['ENV']}, {out_cnt['X']} | 0 | 0 | 0 | 0 | no edit; X needs a ruling |")
sweep = [r for r in rows if r['class'] not in ('RED-1355', 'ENV', 'X')]
sdec = collections.Counter(r['decision'] for r in sweep)
UNITS = [('H', 'the shared helpers, `_v14Contract`, the four `saveApi` callers'),
         ('G1', 'hand lifts, shape projections, whole-state comparisons, the `p14b5` digest and the week-93 control'),
         ('G2', 'the Bridge test files'),
         ('G3', 'save-version, sentinel and title files, the older-era live pins, `v14-byte-parity` and the five UI files'),
         ('G4', 'chains and masking: the p14c3 chain leaves, `p14c2rm-writer-continuation`, `p12-starting-world`, `p06a`, `p14p3`, `p14p4p5-opportunities` and `-screenplay-status`, `p14r3-save-v41`, `save`, `v14-boundary-guards`, `p14c2b-save-v36`, `p13b-s8-save-v27`, `p14b1-t4-regressions`'),
         ('G5', 'the remaining core S1, S2 and S8 files: p14b1 to p14b5, the p14p4p5 pins, `c2a-m2-sets-save`, three contract files, `v14-migration.contract`, `construction-core`, `cash-ledger-checkpoint-v11`, `legacy-parcel-ground`, `p08a`, `p13a-technology-milestones`')]
def unit_files(u):
    fs = set(s['file'] for s in edit_sites if s['unit'] == u) | set(t['file'] for t in types if t['unit'] == u)
    fs |= set(r['site'].rsplit(':', 1)[0] for r in rows if r['unit'] == u and r.get('site'))
    return fs
summ = []; tables = []; tot = collections.Counter()
for u, scope in UNITS:
    fs = unit_files(u)
    cr = [r for r in core if r['unit'] == u]; ur = [r for r in ui if r['unit'] == u]
    es = [s for s in edit_sites if s['unit'] == u]; ts = [t for t in types if t['unit'] == u]
    summ.append(f'| {u} | {scope} | {len(fs)} | {len(cr)} | {len(ur)} | {len(es)} | {len(ts)} |')
    tot.update(files=len(fs), core=len(cr), ui=len(ur), es=len(es), ts=len(ts))
    st = collections.Counter(s['status'] for s in es)
    tables.append(f"#### {u}: {len(fs)} files, {len(cr)} core rows, {len(ur)} UI rows, {len(es)} edit lines "
                  f"({', '.join(f'{n} {k}' for k, n in sorted(st.items()))}), {len(ts)} type sites\n")
    tables.append('| File | Rows | Row classes | Edit lines (? = measure or ruling) | Type sites |')
    tables.append('|---|---:|---|---|---:|')
    for f in sorted(fs):
        rr = [r for r in rows if r['unit'] == u and r.get('site') and r['site'].rsplit(':', 1)[0] == f]
        rc = collections.Counter(r['class'] + (' UI' if r['file'].startswith('ui/') else '') for r in rr)
        sc = collections.Counter(s['class'] + ('?' if s['status'] != 'certain' else '') for s in es if s['file'] == f)
        tc = sum(1 for t in ts if t['file'] == f)
        name = f.replace('tests/', '', 1)
        tables.append(f"| `{name}` | {len(rr)} | {', '.join(f'{k} {n}' for k, n in sorted(rc.items()))} | "
                      f"{', '.join(f'{k} {n}' for k, n in sorted(sc.items()))} | {tc} |")
    tables.append('')
summ.append(f"| total | | {tot['files']} | {tot['core']} | {tot['ui']} | {tot['es']} | {tot['ts']} |")
# type table
tt = []
for i, t in enumerate(types, 1):
    code = t['identity'].split()[-1]; loc = t['identity'].split()[2].replace('tests/', '', 1)
    tt.append(f"| {i} | `{loc}` | {code} | {', '.join(t['gates'])} | {t['class']} | {t['unit']} | {t['edit']} |")
# S9 table
s9 = []
for s in edit_sites:
    if s['class'] == 'S9' or (s['class'] == 'S4' and 'S9 risk' in s['edit']):
        e = s['edit']; i = e.find('prediction: '); j = e.find('S9 risk: ')
        pred = e[i + 12:] if i >= 0 else e[j + 9:]
        pre = 'insert `convertV45ToV44` innermost, then ' if (s['class'] == 'S9' and e.startswith('insert')) else ''
        s9.append(f"| `{s['site'].replace('tests/', '', 1)}` | {s['class']} | {s['status']} | {pre}{pred} |")
# retained table
rt = []
for r in rows:
    if r['class'] == 'S10' and r.get('kind') == 'retained':
        ident = r['identity']; f = ident.split(' > ')[0].replace('tests/', '', 1); leaf = ident.split(' > ')[-1]
        leaf = leaf if len(leaf) <= 70 else leaf[:67] + '...'
        base = r['expected'].replace('fails again with its 1358-I primary: ', '')
        base = base if len(base) <= 120 else base[:117] + '...'
        rt.append(f"| `{f}` > {leaf} | `{r['site'].replace('tests/', '', 1)}` | {base} |")
g4 = [s for s in edit_sites if s['unit'] == 'G4']
H_core = sum(1 for r in core if r['unit'] == 'H'); H_ui = sum(1 for r in ui if r['unit'] == 'H')
H_pass = sum(1 for r in rows if r['unit'] == 'H' and r['class'] != 'S10')
edit_files = set(s['file'] for s in edit_sites) | set(t['file'] for t in types)
V = {
 'CORE_ROWS': len(core), 'UI_ROWS': len(ui), 'TYPE_SITES': len(types), 'SITES_ALL': len(sites), 'SITES_EDIT': len(edit_sites),
 'SITES_KEEP': len(sites) - len(edit_sites), 'SITES_CERTAIN': sum(1 for s in edit_sites if s['status'] == 'certain'),
 'SITES_MEASURE': sum(1 for s in edit_sites if s['status'] == 'measure'), 'SITES_RULING': sum(1 for s in edit_sites if s['status'] == 'ruling'),
 'EDIT_FILES': len(edit_files), 'SWEEP_ROWS': len(sweep), 'SWEEP_CORE': sum(1 for r in sweep if not r['file'].startswith('ui/')),
 'DEC_CERTAIN': sdec['certain'], 'DEC_MEASURE': sdec['measure'], 'DEC_RULING': sdec['ruling'],
 'H_CORE': H_core, 'H_UI': H_ui, 'H_PASS': H_pass, 'G4_SITES': len(g4), 'G4_MEASURE': sum(1 for s in g4 if s['status'] != 'certain'),
 'CLASS_TABLE': '\n'.join(lines), 'UNIT_SUMMARY': '\n'.join(summ), 'UNIT_TABLES': '\n'.join(tables).rstrip(),
 'TYPE_TABLE': '\n'.join(tt), 'S9_TABLE': '\n'.join(s9), 'RETAINED_TABLE': '\n'.join(rt),
}
t = open(os.path.join(HERE, 'plan-template.md'), encoding='utf8').read()
for k, v in V.items(): t = t.replace('{{' + k + '}}', str(v))
left = re.findall(r'\{\{[A-Z0-9_]+\}\}', t)
assert not left, left
assert '—' not in t, [l for l in t.split('\n') if '—' in l][:5]
open(D + '1361-N-save45-pin-sweep-plan.md', 'w', encoding='utf8').write(t)
print({k: v for k, v in V.items() if not isinstance(v, str) or len(v) < 40})
print('edit files', len(edit_files), 'unit files total', tot['files'])
