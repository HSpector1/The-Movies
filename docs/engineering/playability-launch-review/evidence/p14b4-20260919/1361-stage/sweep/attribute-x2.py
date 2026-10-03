"""Attribute the completed x2 run using the existing repository parsers."""
import json
from pathlib import Path
import subprocess

repo = Path('/Users/zacheryspector/The-Movies-headless-program')
e = repo / 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
run = Path('/Users/zacheryspector/studio-scratch/1361-sweep/x2')
assert any(line.startswith('end;') for line in (run / 'x.meta').read_text().splitlines()), 'x2 still runs'
out = run / 'attr'
out.mkdir(exist_ok=True)
for suite, parser, baseline in [('core', '1321-I-attribution.py', '1358-I-core-failures.json'),
                                ('ui', '1317-I-attribution.py', '1358-I2-ui-failures.json')]:
    parsed = out / f'x2-{suite}-failures.json'
    comparison = out / f'x2-{suite}-vs1358I.json'
    subprocess.run(['python3', str(e / parser), str(run / f'x-{suite}.txt'), str(parsed)], cwd=repo, check=True)
    subprocess.run(['python3', str(e / '1344-I-compare.py'), str(parsed), str(e / baseline), str(comparison)], cwd=repo, check=True)

def d16_rows(path):
    data = json.loads(path.read_text())
    result = {}
    for file in data['testResults']:
        prefix, relative = file['name'].split('/src/harness/d16/', 1)
        for row in file['assertionResults']:
            if row['status'] == 'failed':
                key = 'src/harness/d16/' + relative + ' > ' + row['fullName']
                assert key not in result
                result[key] = [message.replace(prefix + '/', '<tree>/') for message in row['failureMessages']]
    return data, result

baseline, before = d16_rows(e / '1361-stage/d16/d16-base.json')
current, after = d16_rows(run / 'x-d16.json')
d16 = {'normalization': 'Only the scratch-tree absolute prefix is replaced by <tree> in full failureMessages.',
       'baselineFailed': len(before), 'currentFailed': len(after),
       'baselineTotal': baseline['numTotalTests'], 'currentTotal': current['numTotalTests'],
       'new': sorted(after.keys() - before.keys()), 'gone': sorted(before.keys() - after.keys()),
       'changedMessages': [key for key in sorted(after.keys() & before.keys()) if after[key] != before[key]],
       'equal': before == after and baseline['numTotalTests'] == current['numTotalTests']}
(out / 'x2-d16-vsbase.json').write_text(json.dumps(d16, indent=2) + '\n')
print(json.dumps(d16, indent=2))

units = {}
for unit in ['H', 'G1', 'G2', 'G3', 'G4a', 'G4b', 'G5']:
    for line in (run.parent / unit / 'patch.diff').read_text().splitlines():
        if line.startswith('+++ b/'):
            file = line[6:]
            assert file not in units, file
            units[file] = unit
rows = json.loads((out / 'x2-core-vs1358I.json').read_text())['rows']
routed = []
for row in rows:
    if row['status'] == 'SAME':
        continue
    file = row['file']
    owner = 'declared-1355' if file.startswith('tests/p15a1-market-integration') else units.get(file, 'attribution-needed')
    if file == 'tests/bridge-supervisor.test.ts' or file.startswith('tests/r3n1-'):
        owner = 'environment'
    routed.append(dict(row, unit=owner))
(out / 'x2-routed.json').write_text(json.dumps(routed, indent=2) + '\n')
print('Routed', len(routed), 'non-SAME core rows')
