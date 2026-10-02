# Compare a recorded RED's default-reporter text with a vitest JSON report: per leaf, status and first message line,
# ignoring the importing-file path inside Vite load errors (1360-F2 ruling 4). Usage: cmp-recorded.py <rec.txt> <x.json>
import json, re, sys
raw = re.sub(r'\x1b\[[0-9;]*m', '', open(sys.argv[1], errors='replace').read())
norm = lambda s: re.sub(r'tests/[\w.-]+\.test\.ts', 'tests/<file>', re.sub(r' in /\S+/tests/[\w.-]+\.test\.ts', ' in <importer>', s)).strip()
rec, pending = {}, []
section = raw.split('Failed Tests', 1)[1] if 'Failed Tests' in raw else ''
for line in section.splitlines():
    m = re.match(r'^ FAIL +\|core\| +(\S+) > (.+)$', line)
    if m:
        pending.append((m.group(1), m.group(2).split(' > ')[-1].strip())); continue
    if pending and line.strip() and not line.startswith('⎯'):
        for k in pending: rec[k] = ('failed', norm(line))
        pending = []
x = json.load(open(sys.argv[2])); base = {}
for f in x['testResults']:
    fn = 'tests/' + f['name'].split('/tests/')[-1]
    for a in f['assertionResults']:
        msg = (a.get('failureMessages') or [''])[0].splitlines()
        base[(fn, a['title'])] = (a['status'], norm(msg[0]) if msg else '')
fails = {k for k, v in base.items() if v[0] == 'failed'}
print('recorded failed', len(rec), '| baseline failed', len(fails), '| same set', set(rec) == fails)
bad = [k for k in fails if k in rec and rec[k][1] != base[k][1]]
for k in sorted(set(rec) ^ fails): print('  SET DIFF', k)
for k in sorted(bad): print('  MSG DIFF', k[1][:70], '\n    rec :', rec[k][1][:160], '\n    base:', base[k][1][:160])
print('message differences', len(bad))
sys.exit(1 if bad or set(rec) != fails else 0)
