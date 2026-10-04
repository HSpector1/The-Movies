"""Attribute completed Save45 recorder runs without changing source or baseline evidence."""
import argparse
from collections import Counter
from datetime import datetime
import hashlib
import json
from pathlib import Path
import re
import subprocess

REPO = Path('/Users/zacheryspector/The-Movies-headless-program')
E = REPO / 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
LAND = Path('/Users/zacheryspector/studio-scratch/1361-land')
HEAD = '2eaa697effc38538c37da28b486786ce267a2284'
X3 = E / '1361-stage/sweep/x3/attr'


def read(path):
    return json.loads(path.read_text())


def write(path, value):
    with path.open('x') as out:
        json.dump(value, out, indent=2)
        out.write('\n')


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def guards(suite):
    stem = f'1361-save45-broad-{suite}'
    record_path = E / f'{stem}.json'
    post_path = E / f'{stem}-postflight.json'
    pre_path = E / f'{stem}-preflight.json'
    record, post, pre = read(record_path), read(post_path), read(pre_path)
    assert record['end'] and record['fixedSource'] is True, 'unfinished or moving source'
    assert record['sourceSha'] == record['sourceShaAtEnd'] == HEAD
    assert record['signal'] is None and record['error'] is None
    assert pre['head'] == post['head'] == HEAD
    assert post['allGuardsExact'] is True and post['fixedSource'] is True
    assert post['exitCode'] == record['exitCode']
    raw = E / f'{stem}.txt'
    assert post['raw']['sha256'] == digest(raw), 'raw changed after postflight'
    assert post['record']['sha256'] == digest(record_path), 'record changed after postflight'
    assert post['patch']['sha256'] == digest(E / f'{stem}.patch'), 'patch changed after postflight'
    return raw, {'head': HEAD, 'exitCode': record['exitCode'], 'fixedSource': True,
                 'command': record['command'], 'start': record['start'], 'end': record['end'],
                 'allGuardsExact': True, 'recordSha256': digest(record_path),
                 'rawSha256': digest(raw), 'postflightSha256': digest(post_path)}


def normalize_message(message, prefix):
    # Dependencies physically reside in the same live directory for both runs.
    return re.sub(re.escape(prefix + '/') + r'(?!node_modules/)', '<tree>/', message)


def normalize_primary_rows(data, prefix):
    """Only the known absolute checkout prefix, not other message content."""
    return {row['identity']: normalize_message(row['primary'], prefix)
            for row in data['rows']}


def compare_maps(before, after):
    common = before.keys() & after.keys()
    return {'beforeCount': len(before), 'afterCount': len(after),
            'sameCount': sum(before[key] == after[key] for key in common),
            'new': sorted(after.keys() - before.keys()),
            'gone': sorted(before.keys() - after.keys()),
            'changed': [{'identity': key, 'before': before[key], 'after': after[key]}
                        for key in sorted(common) if before[key] != after[key]],
            'equal': before == after}


def declared45(data):
    expected = {}
    for line in (E / '1361-stage/x-r3b/1355-leaves-red-at-b-r2.tsv').read_text().splitlines():
        file, name, message = line.split('\t', 2)
        key = file + ' > ' + name
        assert key not in expected
        expected[key] = message
    actual = {}
    for row in data['rows']:
        if row['file'].startswith('tests/p15a1-market-integration'):
            key = Path(row['file']).name + ' > ' + ' '.join(row['identity'].split(' > ')[1:])
            assert key not in actual
            actual[key] = row['primary']
    result = compare_maps(expected, actual)
    result['normalization'] = 'None: exact declared identity and primary message.'
    return result


def d16_rows(path, prefix):
    data = read(path)
    failed = {}
    all_cases = []
    statuses = Counter()
    assert data['numTotalTests'] == 176, 'incomplete or changed d16 corpus'
    assert data['numFailedTests'] == 12, 'changed d16 failures'
    assert data['numPassedTests'] == 164, 'changed d16 passing cases'
    assert data.get('numPendingTests', 0) == 0
    for file in data['testResults']:
        assert file['name'].startswith(prefix + '/src/harness/d16/'), file['name']
        relative = file['name'][len(prefix) + 1:]
        for case in file['assertionResults']:
            statuses[case['status']] += 1
            identity = relative + ' > ' + case['fullName']
            all_cases.append(identity)
            if case['status'] == 'failed':
                assert identity not in failed
                assert case['failureMessages'], 'failure missing message'
                # Scratch and live runs share the live node_modules directory. Keep those
                # dependency stack paths exact even when the live checkout prefix overlaps.
                failed[identity] = [normalize_message(msg, prefix)
                                    for msg in case['failureMessages']]
    assert len(all_cases) == len(set(all_cases)) == 176
    assert len(failed) == 12
    assert statuses == Counter({'passed': 164, 'failed': 12}), statuses
    return failed, sorted(all_cases)


def bind_d16_report(path, guarded):
    command = guarded['command']
    config_at = command.index('--config')
    assert command[config_at + 1] == 'src/harness/d16/vitest.d16.config.ts'
    assert '--reporter=json' in command and '--reporter=verbose' in command
    assert '--outputFile.json=' + str(path) in command
    assert not path.is_symlink() and path.is_file()
    report = read(path)
    start = datetime.fromisoformat(guarded['start'].replace('Z', '+00:00')).timestamp() * 1000
    end = datetime.fromisoformat(guarded['end'].replace('Z', '+00:00')).timestamp() * 1000
    assert start <= report['startTime'] <= end, 'JSON is not from this recorder interval'
    for file in report['testResults']:
        assert report['startTime'] <= file['startTime'] <= file['endTime'] <= end
    return report


def corpus_summary(data, suite):
    summary = data['summary']
    assert not data.get('unhandled', []), 'unhandled errors require disposition'
    files, tests = (448, 5265) if suite == 'core' else (204, 2697)
    for key, expected in [('Test Files', files), ('Tests', tests)]:
        match = re.search(r'\((\d+)\)', summary[key])
        assert match and int(match.group(1)) == expected, (key, summary[key])
    tests_text = summary['Tests']
    counts = {kind: int(n) for n, kind in re.findall(r'(\d+) (passed|failed|skipped|todo)', tests_text)}
    assert sum(counts.values()) == tests, counts
    assert counts.get('skipped', 0) == (3 if suite == 'core' else 5)
    assert counts.get('todo', 0) == (11 if suite == 'core' else 0)
    assert counts.get('failed', 0) == data['failedCases'], 'failed suites or incomplete failure parser'
    assert 'Errors' not in summary or re.match(r'^0\b', summary['Errors']), summary
    return counts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('suite', choices=['core', 'ui', 'd16'])
    parser.add_argument('--output', required=True, type=Path, help='new external output directory')
    args = parser.parse_args()
    raw, guarded = guards(args.suite)
    out = args.output
    assert out.is_absolute(), 'output must be absolute'
    assert not out.exists() and not out.is_symlink(), 'output must be new'
    assert all(not parent.is_symlink() for parent in out.parents), 'symlinked output ancestor'
    assert REPO not in out.resolve().parents and out.resolve() != REPO
    out.mkdir(parents=True)
    write(out / 'guards.json', guarded)
    if args.suite == 'd16':
        assert guarded['exitCode'] == 1
        before_path = E / '1361-stage/d16/d16-base.json'
        after_path = LAND / 'd16-vitest.json'
        bind_d16_report(after_path, guarded)
        before, before_inventory = d16_rows(before_path, '/Users/zacheryspector/studio-scratch/1361-d16/base/tree')
        after, after_inventory = d16_rows(after_path, str(REPO))
        result = compare_maps(before, after)
        result.update({'normalization': 'Only each exact absolute checkout prefix becomes <tree>/; shared node_modules stack paths remain unchanged. Full failureMessages arrays compared.',
                       'caseInventoryEqual': before_inventory == after_inventory,
                       'baselineSha256': digest(before_path), 'currentSha256': digest(after_path)})
        write(out / 'd16-vsbase.json', result)
        print(json.dumps(result, indent=2))
        assert result['equal'] and result['caseInventoryEqual'], 'd16 case identity/full-message change requires attribution'
        return
    suite = args.suite
    parsed = out / f'{suite}-failures.json'
    parser_name = '1321-I-attribution.py' if suite == 'core' else '1317-I-attribution.py'
    subprocess.run(['python3', str(E / parser_name), str(raw), str(parsed)], cwd=REPO, check=True)
    baseline = '1358-I-core-failures.json' if suite == 'core' else '1358-I2-ui-failures.json'
    subprocess.run(['python3', str(E / '1344-I-compare.py'), str(parsed), str(E / baseline),
                    str(out / f'{suite}-vs1358I.json')], cwd=REPO, check=True)
    data = read(parsed)
    corpus_summary(data, suite)
    assert len(data['rows']) == len({row['identity'] for row in data['rows']})
    expected_exit = 1 if data['failedCases'] else 0
    assert guarded['exitCode'] == expected_exit, 'child exit not explained by parsed failures'
    before = normalize_primary_rows(read(X3 / f'x3-{suite}-failures.json'),
                                    '/Users/zacheryspector/studio-scratch/1361-sweep/x3/tree')
    after = normalize_primary_rows(data, str(REPO))
    comparison = compare_maps(before, after)
    comparison['normalization'] = 'Only known absolute x3/live checkout prefixes become <tree>/ in primary messages; shared node_modules paths remain exact.'
    comparison['disposition'] = 'Attribution only; every difference still requires parent review before gate acceptance.'
    write(out / f'{suite}-vsx3.json', comparison)
    print(json.dumps({k: v for k, v in comparison.items() if k != 'changed'}, indent=2))
    print('Changed primary messages:', len(comparison['changed']))
    if suite == 'core':
        declared = declared45(data)
        write(out / 'declared45.json', declared)
        assert declared['equal'], 'declared 45 changed'


if __name__ == '__main__':
    main()
