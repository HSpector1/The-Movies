"""UNRUN narrow adapter; accepted witness frame is required. No game or Git calls.
Arguments: filled role file, independently approved role-file SHA256, absent
scratch output directory. Reuses the pinned existing comparator's read/parser/
full-row helpers; only employment identity and descriptive leaf diffs differ.
"""
import base64, collections, hashlib, importlib.util, json, os, pathlib, signal, sys

HERE = pathlib.Path(__file__).parent
SCRATCH = pathlib.Path('/Users/zacheryspector/studio-scratch')
COMPARATOR = SCRATCH / '1370-c0-four-digest-comparator-proposal-r2/comparator.py'
COMPARATOR_SHA = 'dbd9823d80a8a63d6851b27cbfcd7f2e21e555171864ae0974c4704bee6e0786'
SOURCE_772 = '3aaf55e0c06c4b745b0b722cc56913050b1ee229'
SOURCE_771 = '2d3a00fd01a4e950f97474fe74cc5adfd4cea241'
DOCS_CARRIER = '1d2359d7d99444c0e6a438ac0d90e75f2361e083'
EMPLOYMENT = '4cffcb410893395f8ee93da2d7d6146f35db2369962fe333e02de8d2fc7c0b58'
CONTROLS = {
    'employment': EMPLOYMENT,
    'settlement': '706e54c6ec9728df1664025982ebbafeb0fc36afb245b6bd0b983305f6a10a77',
    'receipts': 'af8c4d1325ecb350dbc07fbf2f762dd8257db04075b8030bf7bd975b4cb2a766',
    'takes': '8af116b1687ed210c02953b5b506456e638a64482e8042b0e549b0d57e428694',
    'rng': '2598418427,508725886,1318803286,3129010527',
}
LIFECYCLE = {'$.endedWeek', '$.reason', '$.terms.startWeek', '$.terms.endWeekExclusive', '$.terms.termWeeks'}

def stop_timeout(signum, frame): raise RuntimeError('STOP_COMPARISON_30_SECONDS')
signal.signal(signal.SIGALRM, stop_timeout)
signal.alarm(30)
assert not sys.flags.optimize and sys.dont_write_bytecode and len(sys.argv) == 4
assert hashlib.sha256(COMPARATOR.read_bytes()).hexdigest() == COMPARATOR_SHA
spec = importlib.util.spec_from_file_location('accepted_four_digest_helpers', COMPARATOR)
c = importlib.util.module_from_spec(spec)
spec.loader.exec_module(c)  # Its main/guards/archive scan are not called.
c.key_of = lambda family, row: (row['contractId'],) if family == 'employment' else (_ for _ in ()).throw(ValueError(family))
roles = c.strict_json(c.safe_file(sys.argv[1], sys.argv[2], 65536))
assert roles['status'] == 'APPROVED_FUTURE_INPUTS_FILLED'
assert c.digest(c.safe_file(HERE / 'INPUTS-PENDING.json', limit=65536)) == roles['preparationInputsSha256']
expected_roles = c.strict_json((HERE / 'INPUTS-PENDING.json').read_bytes())
assert roles['existingInputs'] == expected_roles['existingInputs']
for role in expected_roles['designRoles'].values():
    c.safe_file(role['path'], role['sha256'], 65536)

raws = {}
for arm in ('H-original', 'M0'):
    role = roles['existingInputs'][arm]
    receipt = c.strict_json(c.safe_file(role['receiptPath'], role['receiptSha256'], 65536))
    assert receipt['decision'] == role['receiptDecision'] and receipt['resultSha256'] == role['resultSha256']
    result = c.strict_json(c.safe_file(role['resultPath'], role['resultSha256'], 2_000_000))
    assert result['accepted'] is True and result['actualChildExit'] == 0 and not result['timedOut']
    raws[arm] = c.safe_file(role['preimagePath'], role['preimageSha256'], 256 * 1024)
    assert len(raws[arm]) == role['preimageBytes']
    assert result['artifacts'][role['preimagePath']]['sha256'] == role['preimageSha256']

future = roles['acceptedWitness']
receipt = c.strict_json(c.safe_file(future['receiptPath'], future['receiptSha256'], 2_000_000))
assert receipt['decision'] == future['receiptDecision'] and receipt['decision'].startswith('ACCEPT_OBSERVED_')
assert receipt['framePath'] == future['framePath'] and receipt['frameSha256'] == future['frameSha256']
assert receipt['qualifiedSourceSha'] == SOURCE_772
frame_raw = c.safe_file(future['framePath'], future['frameSha256'], 512 * 1024)
assert frame_raw.endswith(b'\n') and frame_raw.count(b'\n') == 1
frame = c.strict_json(frame_raw)
assert frame['status'] == 'MATCHED_AGING_ERA_PREIMAGE_CANDIDATE'
assert frame['protocol'] == 'single-bounded-stdout-frame-no-files'
assert frame['sourceSha'] == SOURCE_772 and frame['seed'] == 'p13a-core-causal-01' and frame['weeks'] == 416
assert frame['employmentRows'] == 44 and frame['digests'] == CONTROLS
assert frame['preflight'] == frame['postflight'] == frame['finalflight']
assert frame['preflight']['head'] == SOURCE_772 and frame['sourceBlobs'] == frame['preflight']['blobs']
raws['post-aging'] = base64.b64decode(frame['preimageBase64'], validate=True)
assert len(raws['post-aging']) == frame['employmentBytes'] <= 256 * 1024
assert c.digest(raws['post-aging']) == EMPLOYMENT
arrays = {arm: c.rows(raw, count=44) for arm, raw in raws.items()}
for rows in arrays.values():
    assert all(isinstance(row, dict) and isinstance(row.get('contractId'), str) and isinstance(row.get('terms'), dict) and isinstance(row['terms'].get('talentId'), str) for row in rows)
first = frame['firstQuote']
assert first['index'] == 0 and first['row']['terms']['talentId'] == 'person-studio-aca408ec-r01-0'
assert first['committedAge'] == 44 and first['row']['terms']['annualSalary'] == 395548 and first['row']['terms']['signingBonus'] == 71199
assert first['provenance']['kind'] == 'authored_exact_week' and first['provenance']['entryWeek'] == 0 and first['provenance']['ageAtEntry'] == 44.36540781416331

def all_fields(left, right, path='$'):
    if type(left) is not type(right): return [{'path': path, 'left': left, 'right': right}]
    if isinstance(left, dict):
        changes = []
        for key in list(left) + [key for key in right if key not in left]:
            if key not in left or key not in right:
                changes.append({'path': path + '.' + key, 'leftPresent': key in left, 'rightPresent': key in right, **({'left': left[key]} if key in left else {}), **({'right': right[key]} if key in right else {})})
            else: changes.extend(all_fields(left[key], right[key], path + '.' + key))
        return changes
    if isinstance(left, list):
        changes = []
        for index in range(max(len(left), len(right))):
            if index >= min(len(left), len(right)):
                changes.append({'path': f'{path}[{index}]', 'leftPresent': index < len(left), 'rightPresent': index < len(right), **({'left': left[index]} if index < len(left) else {}), **({'right': right[index]} if index < len(right) else {})})
            else: changes.extend(all_fields(left[index], right[index], f'{path}[{index}]'))
        return changes
    return [] if left == right else [{'path': path, 'left': left, 'right': right}]

def pair(left_name, right_name):
    report = c.compare_rows('employment', arrays[left_name], arrays[right_name])
    changed = sorted((row for row in report['records'] if row['status'] == 'CHANGED'), key=lambda row: row['left']['sourceOrder'])
    for row in changed: row['allUnequalFields'] = all_fields(row['left']['row'], row['right']['row'])
    def first_change(predicate):
        for row in changed:
            for field in row['allUnequalFields']:
                if predicate(field['path']):
                    return {'identity': row['identity'], 'leftSourceOrder': row['left']['sourceOrder'], 'rightSourceOrder': row['right']['sourceOrder'], 'field': field}
        return None
    report['firstMatchedTermChangeInLeftSourceOrder'] = first_change(lambda path: path.startswith('$.terms.'))
    report['firstMatchedLifecycleChangeInLeftSourceOrder'] = first_change(lambda path: path in LIFECYCLE)
    report['firstMatchedFieldChangeInLeftSourceOrder'] = first_change(lambda path: True)
    report['unmatchedRowsAreSeparate'] = True
    return report

def talent_generations(rows):
    by_talent = collections.defaultdict(list)
    for source_order, row in enumerate(rows):
        by_talent[row['terms']['talentId']].append({'sourceOrder': source_order, 'contractId': row['contractId'], 'row': row})
    return dict(by_talent)  # Source-order tenure rows; no invented generation field.

report = {
    'schema': '1370-three-employment-preimages-descriptive-comparison-r2',
    'classification': 'DESCRIPTIVE_RAW_COMPARISON_NOT_CAUSAL_ACCEPTANCE',
    'sourceRoles': {'772Tested': SOURCE_772, '771Measured': SOURCE_771, 'documentationCarrier': DOCS_CARRIER},
    'inputHashes': {arm: c.digest(raw) for arm, raw in raws.items()},
    'acceptedWitnessReceiptSha256': future['receiptSha256'], 'acceptedWitnessFrameSha256': future['frameSha256'],
    'rawSourceOrderRetained': True, 'identity': ['contractId', 'source-order occurrence'],
    'H-original_to_post-aging': pair('H-original', 'post-aging'),
    'post-aging_to_M0': pair('post-aging', 'M0'),
    'nestedTalentTenureGenerationViews': {arm: talent_generations(rows) for arm, rows in arrays.items()},
    'firstQuote': first, 'witnessHashControlsOnly': frame['digests'],
    'claimLimit': 'All fields compared; first changes are matched source-order field changes, not observed mutation timestamps or causes. No new settlement/receipt/take raw arrays were captured or inferred; original captures and prior diagnostics unchanged.',
}
encoded = (json.dumps(report, ensure_ascii=False, indent=2) + '\n').encode()
assert len(encoded) <= 2 * 1024**2
out = pathlib.Path(sys.argv[3])
assert out.is_absolute() and out.parent.resolve(strict=True) == SCRATCH and not os.path.lexists(out)
out.mkdir(mode=0o700)
for name, raw in [('H-original-employment.json', raws['H-original']), ('post-aging-employment.json', raws['post-aging']), ('M0-employment.json', raws['M0']), ('accepted-witness-frame.ndjson', frame_raw), ('REPORT.json', encoded)]:
    fd = os.open(out / name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, 'wb') as stream: stream.write(raw); stream.flush(); os.fsync(stream.fileno())
print(json.dumps({'status': 'DESCRIPTIVE_COMPARISON_COMPLETE', 'reportSha256': c.digest(encoded), 'outputRoot': str(out)}))
