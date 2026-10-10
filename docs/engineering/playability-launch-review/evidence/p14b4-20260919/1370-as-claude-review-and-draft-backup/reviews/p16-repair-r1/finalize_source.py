from pathlib import Path
import difflib
import hashlib
import json

ROOT = Path('/Users/zacheryspector/studio-specialists/p16')
OUT = Path(__file__).parent
before = json.loads((OUT / 'BEFORE.json').read_text())
finance_old = "  termination: 'Termination payments', publicity: 'Publicity',\n"
finance_new = finance_old + "  rightsConsideration: 'Rights sale proceeds, purchases and licence fees',\n  dueDiligenceFee: 'Rights due diligence fees',\n  acquisitionOutlay: 'Acquisition consideration net of target cash',\n"
save_old = "  constructionRefund: true,\n} as const satisfies Record<LedgerKind, boolean>;"
save_new = "  constructionRefund: true,\n  // P16: rights transactions require an entered, operating studio. Player cash\n  // rows therefore prove engagement; rival transactions use rival accounts.\n  rightsConsideration: true,\n  dueDiligenceFee: true,\n  acquisitionOutlay: true,\n} as const satisfies Record<LedgerKind, boolean>;"
save_test_old = "source: { kind: 'test', ref: 'x' }"
transaction = "source: { kind: 'transaction', transactionId: 'rights-tx-missing' }"
estate = "source: { kind: 'estate', estateId: `estate:${f.studioId}` }"
valuation_old = "source: { kind: 'test', ref: 'p16a-valuation' }"
valuation_new = "source: { kind: 'manual', ref: 'p16a-valuation' }"

def role(path):
    data = path.read_bytes()
    return {'path': str(path), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}

def write_json(name, value):
    (OUT / name).write_text(json.dumps(value, indent=2) + '\n')

def replace_exact(text, old, new, count=1):
    if text.count(old) != count:
        raise RuntimeError('unexpected original substitution count')
    return text.replace(old, new)

changes = []
forward = []
inverse = []
for original in before['files']:
    name = original['name']
    backup = OUT / 'before' / name
    if role(backup) != original['backup']:
        raise RuntimeError('original backup changed')
    old = backup.read_text()
    if name == 'src/core/financeReport.ts':
        new = replace_exact(old, finance_old, finance_new)
    elif name == 'src/core/save.ts':
        new = replace_exact(old, save_old, save_new)
    elif name == 'tests/p16a-save-v46.test.ts':
        if old.count(save_test_old) != 3:
            raise RuntimeError('unexpected save fixture count')
        new = old.replace(save_test_old, transaction, 2).replace(save_test_old, estate, 1)
    else:
        new = replace_exact(old, valuation_old, valuation_new, 2)
    current = (ROOT / name).read_bytes()
    if current != new.encode('utf-8'):
        raise RuntimeError('unexpected/concurrent source change: ' + name)
    dest = OUT / 'after' / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(current)
    forward.extend(difflib.unified_diff(old.splitlines(keepends=True), new.splitlines(keepends=True), fromfile='before/' + name, tofile='after/' + name))
    inverse.extend(difflib.unified_diff(new.splitlines(keepends=True), old.splitlines(keepends=True), fromfile='after/' + name, tofile='before/' + name))
    ndiff = list(difflib.ndiff(old.splitlines(keepends=True), new.splitlines(keepends=True)))
    if ''.join(difflib.restore(ndiff, 1)) != old or ''.join(difflib.restore(ndiff, 2)) != new:
        raise RuntimeError('whole source restoration failed')
    changes.append({'name': name, 'before': original['original'], 'beforeBackup': original['backup'], 'after': role(ROOT / name), 'afterBackup': role(dest), 'wholeSourceExpectedLiteralProjectionEqual': True, 'forwardAndInverseWholeSourceRestorationEqual': True})
(OUT / 'REPAIR.patch').write_text(''.join(forward))
(OUT / 'REVERSE.patch').write_text(''.join(inverse))
red_path = Path(before['priorIndependentCompilerEvidence']['path'])
if role(red_path) != before['priorIndependentCompilerEvidence']:
    raise RuntimeError('retained compiler evidence changed')
diagnostics = [{'retainedLogLine': i, 'text': line} for i, line in enumerate(red_path.read_text().splitlines(), 1) if line.startswith('src/core/financeReport.ts(') or line.startswith('src/core/save.ts(7052,') or line.startswith('src/core/save.ts(7055,') or line.startswith('tests/p16a-save-v46.test.ts(') or line.startswith('tests/p16a-valuation.test.ts(')]
if len(diagnostics) != 8:
    raise RuntimeError('expected eight target diagnostic headings')
write_json('PRIOR-TARGET-DIAGNOSTICS.json', {'evidence': before['priorIndependentCompilerEvidence'], 'diagnostics': diagnostics, 'scope': 'Existing Claude-produced tsc-run1 retained independently of this repair. No compiler executed by repair author.'})
write_json('CHANGED-FILES.json', {'schema': '1370-p16-bounded-type-repair-changed-files/v1', 'clone': str(ROOT), 'changedFileCount': 4, 'files': changes, 'patch': role(OUT / 'REPAIR.patch'), 'inversePatch': role(OUT / 'REVERSE.patch'), 'priorIndependentCompilerEvidence': before['priorIndependentCompilerEvidence'], 'testsExecuted': False, 'compilerExecuted': False, 'gitMutation': False, 'mainRepositoryTouched': False, 'fullTypecheckAccepted': False})
report = '''# Bounded P16 type repair

Changed only the isolated P16 draft at `/Users/zacheryspector/studio-specialists/p16`. Four target originals were copied byte-for-byte and SHA-pinned in `BEFORE.json` before editing. `CHANGED-FILES.json` pins retained originals, current results, copied results and both patches. Complete literal projections and forward/inverse whole-source restoration were checked using Python stdlib only. No tests, compiler, candidate imports, Git mutations, main-repository changes or Claude log/progress edits occurred.

## Exact change and source rationale

- `src/core/financeReport.ts`: add the three missing exhaustive ledger labels. `rightsConsideration` remains signed sale proceeds/purchases/licence fees; `dueDiligenceFee` remains its own fee; `acquisitionOutlay` remains acquisition consideration net of the target cash. This reflects existing `types.ts:407-412`, `hollywoodTypes.ts:59-66` and `rights.ts:601-609`; it does not recategorize transactions or change signs/amounts.
- `src/core/save.ts`: add explicit `true` engagement entries for those three kinds. Existing P16 transaction rules require an entered, operating studio, including completed player founding (`rightsFinance.ts:41-56`). Actual player cash is ledger-backed; rival cash is account-backed (`rightsFinance.ts:96-111`). These are managed-operation transactions rather than the deliberately unengaged `production`/`boxOffice` kinds. The exhaustive `satisfies Record<LedgerKind, boolean>` constraint remains. Frozen validation policies, version numbers, migrations and transaction producers are unchanged; historical versions still cannot contain P16 kinds.
- `tests/p16a-save-v46.test.ts`: replace the two sale-fixture sources with the admitted `transaction` form and an explicitly missing transaction placeholder, and the archive-fixture source with its matching `estate` form. These remain deliberately invalid saves targeting prior-holder, future-date and absent closed-estate checks. Existing `rights.ts:714-755` performs those checks before transaction/estate source reconciliation. No real transaction or closed estate is fabricated, and assertions remain byte-unchanged.
- `tests/p16a-valuation.test.ts`: replace two invented `test` sources with `manual`, the existing pure fold-fixture source admitted by `recordTitleEventForTest` (`rights.ts:545-547`) and explicitly refused for persisted saves by the existing title-source validator. The valuation fixtures do not become purported executable transactions. No production type union or validator was broadened.

## Prior RED and current verification limit

The original independently authored compiler result is `/Users/zacheryspector/studio-scratch/1370-ar-p16-rights-estate-implementation-20261010-r1/evidence/tsc-run1.txt` (18,315 bytes, SHA256 `a049c1c4aa3f6aa08263eeeb11fca6a29737f0891d607432a0d324f6b5399239`). The exact log is also copied under `prior-evidence/`; `PRIOR-TARGET-DIAGNOSTICS.json` records its eight target headings with retained log line numbers:

- log line 12: `financeReport.ts(6,14)` TS2739, missing three `Record<LedgerKind,string>` entries.
- log line 27: `save.ts(7052,12)` TS1360, missing three exhaustive boolean entries; log line 29: `save.ts(7055,10)` TS7053, indexing that incomplete map.
- log lines 128-132: five TS2322 discriminants at save-test lines 154/159/187 and valuation-test lines 201/273.

This is a source repair, not a successful compiler result. Other recorded diagnostics (rights narrowing, current-rights-root/historical-save assumptions and bridge extension imports) remain outside scope. Root owns bounded checks and a separate reviewer owns independent patch review. No full P16 or integrated save-era acceptance is claimed.

## Writer/concurrency boundary

The process check found no argv referencing the clone. Earlier observed Claude PIDs 80155 and 81602 had cwd `/Users/zacheryspector`, and no P16 compiler/test worker was observed. This does not establish that an idle editor cannot later write. Each original was stable while copied; final actual bytes equal only the authorized literal projections of those retained originals, so an unexpected concurrent change to any target would have stopped package completion. The final package is a point-in-time source record. All other Claude drafts and progress/log files were preserved.
'''
(OUT / 'REPORT.md').write_text(report)
for row in changes:
    if role(ROOT / row['name']) != row['after']:
        raise RuntimeError('target changed during finalization')
files = {}
for path in sorted(OUT.rglob('*')):
    if path.is_file() and path.name != 'SOURCE-PINS.json':
        files[str(path.relative_to(OUT))] = role(path)
write_json('SOURCE-PINS.json', {'schema': '1370-p16-bounded-type-repair-source-pins/v1', 'executionAuthorization': False, 'files': files})
manifest = json.loads((OUT / 'SOURCE-PINS.json').read_text())
for entry in manifest['files'].values():
    if role(Path(entry['path'])) != entry:
        raise RuntimeError('retained manifest readback mismatch')
print(json.dumps({'sourcePins': role(OUT / 'SOURCE-PINS.json'), 'changedFiles': role(OUT / 'CHANGED-FILES.json'), 'report': role(OUT / 'REPORT.md'), 'patch': role(OUT / 'REPAIR.patch'), 'fileCount': len(manifest['files'])}))
