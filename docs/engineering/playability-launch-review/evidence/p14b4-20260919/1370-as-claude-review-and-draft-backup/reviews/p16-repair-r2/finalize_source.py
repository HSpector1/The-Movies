from pathlib import Path
import difflib
import hashlib
import json

OUT = Path(__file__).parent
R1 = OUT.parent / '1370-as-p16-type-repair-20261010-r1'
ROOT = Path('/Users/zacheryspector/studio-specialists/p16')

def role(path):
    data = path.read_bytes()
    return {'path': str(path), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}

def write_json(name, data):
    (OUT / name).write_text(json.dumps(data, indent=2) + '\n')

before = json.loads((OUT / 'BEFORE.json').read_text())
before_save = OUT / 'before/src/core/save.ts'
if role(before_save) != before['backup']:
    raise RuntimeError('R1 save backup changed')
old_block = '''  // P16: rights transactions require an entered, operating studio. Player cash
  // rows therefore prove engagement; rival transactions use rival accounts.
  rightsConsideration: true,
  dueDiligenceFee: true,
  acquisitionOutlay: true,
'''
new_block = '''  // P16 kinds are present for current LedgerKind exhaustiveness only.
  // This historical V5→V6 reconstruction retains their former falsy lookup
  // behavior; modern rights transactions are not V5 engagement evidence.
  rightsConsideration: false,
  dueDiligenceFee: false,
  acquisitionOutlay: false,
'''
old = before_save.read_bytes().decode('utf-8')
if old.count(old_block) != 1:
    raise RuntimeError('R1 correction block not unique')
new = old.replace(old_block, new_block)
actual = ROOT / 'src/core/save.ts'
if actual.read_bytes() != new.encode('utf-8'):
    raise RuntimeError('unexpected or concurrent save source change')
(OUT / 'R1-TO-R2.patch').write_text(''.join(difflib.unified_diff(old.splitlines(keepends=True), new.splitlines(keepends=True), fromfile='r1/src/core/save.ts', tofile='r2/src/core/save.ts')))
(OUT / 'R2-TO-R1.patch').write_text(''.join(difflib.unified_diff(new.splitlines(keepends=True), old.splitlines(keepends=True), fromfile='r2/src/core/save.ts', tofile='r1/src/core/save.ts')))
original = json.loads((R1 / 'BEFORE.json').read_text())
prior_changes = json.loads((R1 / 'CHANGED-FILES.json').read_text())
rows = []
forward = []
inverse = []
for row in original['files']:
    name = row['name']
    base = Path(row['backup']['path'])
    if role(base) != row['backup']:
        raise RuntimeError('Claude original backup changed')
    src = ROOT / name
    prior = next(item for item in prior_changes['files'] if item['name'] == name)
    if name != 'src/core/save.ts' and role(src) != prior['after']:
        raise RuntimeError('other R1 target changed')
    data = src.read_bytes()
    retained_after = OUT / 'after' / name
    retained_original = OUT / 'claude-original' / name
    retained_after.parent.mkdir(parents=True, exist_ok=True)
    retained_original.parent.mkdir(parents=True, exist_ok=True)
    retained_after.write_bytes(data)
    retained_original.write_bytes(base.read_bytes())
    old_text = base.read_bytes().decode('utf-8')
    new_text = data.decode('utf-8')
    forward.extend(difflib.unified_diff(old_text.splitlines(keepends=True), new_text.splitlines(keepends=True), fromfile='claude-original/' + name, tofile='after/' + name))
    inverse.extend(difflib.unified_diff(new_text.splitlines(keepends=True), old_text.splitlines(keepends=True), fromfile='after/' + name, tofile='claude-original/' + name))
    ndiff = list(difflib.ndiff(old_text.splitlines(keepends=True), new_text.splitlines(keepends=True)))
    if ''.join(difflib.restore(ndiff, 1)) != old_text or ''.join(difflib.restore(ndiff, 2)) != new_text:
        raise RuntimeError('whole forward/inverse source projection failed')
    rows.append({'name': name, 'claudeOriginal': row['original'], 'claudeOriginalBackup': role(retained_original), 'r1': prior['after'], 'final': role(src), 'finalBackup': role(retained_after), 'r1ToR2Changed': name == 'src/core/save.ts', 'wholeForwardInverseProjectionEqual': True})
(OUT / 'FINAL-FOUR-FILE-REPAIR.patch').write_text(''.join(forward))
(OUT / 'FINAL-FOUR-FILE-REVERSE.patch').write_text(''.join(inverse))
write_json('CHANGED-FILES.json', {'schema': '1370-p16-type-repair-corrected-changed-files/v1', 'preservedRejectedR1Manifest': before['preservedR1SourcePins'], 'r1ToR2ChangedFileCount': 1, 'claudeOriginalToFinalChangedFileCount': 4, 'files': rows, 'delta': role(OUT / 'R1-TO-R2.patch'), 'reverseDelta': role(OUT / 'R2-TO-R1.patch'), 'fullFinalPatch': role(OUT / 'FINAL-FOUR-FILE-REPAIR.patch'), 'fullFinalReversePatch': role(OUT / 'FINAL-FOUR-FILE-REVERSE.patch'), 'testsExecuted': False, 'compilerExecuted': False, 'gitMutation': False, 'executionAuthorization': False})
report = '''# P16 bounded type repair R2: engagement-table correction

Root explicitly authorized changing only the three newly added engagement classifications and their comment in the isolated P16 draft. `rightsConsideration`, `dueDiligenceFee` and `acquisitionOutlay` now map to `false`; all other R1 edits are byte-unchanged. There is no new V5 validator or current transaction gate, schema, amount/sign or gameplay producer change. No tests, compiler, candidate imports or Git mutation ran. Claude logs/progress and the main repository were untouched.

## Correction and exact source basis

The R1 author incorrectly inferred that entered/founded transaction premises proved `economyEngagedEver`. `rightsFinance.ts:41-56` does not directly check that flag, so those premises do not establish this classification. R1's added true values would also change the historical reconstruction's prior missing-key `undefined`/falsy behavior.

The initial follow-up hypothesis that frozen V5 validation rejects P16 ledger kinds was also incorrect. Actual `save.ts:1055-1070` calls `checkEnvelope` and selected V11–V14 authority refusals. `checkEnvelope:767-796` checks seed/state/cache shape, not ledger kinds, and the comment at 799 explicitly retains additive tolerance. Those selected refusals do not reject the three P16 kinds. Therefore unreachable-in-V5 was not established and is not claimed here. This correction records the writer's mistaken true rationale and the root/review conversation's initially mistaken unreachability premise; the independent reviewer then identified the tolerant path before any R2 edit.

Actual `convertV5ToV6` calls `validateSaveV5` first (now source line 7065), then uses `ledger.some(ledgerKindProvesEngagement)` at 7070 to reconstruct `economyEngagedEver`. With explicit false for the new keys, a tolerated old envelope containing only these new ledger kinds retains the previous falsy lookup behavior while the table remains exhaustive for the current `LedgerKind` union. These table entries are not historical engagement evidence and do not grant current transaction authority. No assertion about current P16 engagement policy is made.

## Preserved evidence and restoration

R1 remains exactly preserved under `/Users/zacheryspector/studio-scratch/1370-as-p16-type-repair-20261010-r1`; its source report/rationale is rejected historical evidence, not superseded in place. R2 preserves its exact pre-correction save under `before/src/core/save.ts`, all four exact Claude originals under `claude-original/`, and all four final files under `after/`.

`R1-TO-R2.patch` and `R2-TO-R1.patch` cover only this correction. `FINAL-FOUR-FILE-REPAIR.patch` and `FINAL-FOUR-FILE-REVERSE.patch` cover the full final four-file repair against the original Claude bytes. `CHANGED-FILES.json` pins every original/R1/final role and both patch pairs. Whole original-to-final forward/inverse source projections and unchanged other-three-file hashes were checked by Python stdlib. No target-clone process argv was observed immediately before copying the R1 save, and final source hashes were checked against retained copies.

The original Claude compiler RED remains `/Users/zacheryspector/studio-scratch/1370-ar-p16-rights-estate-implementation-20261010-r1/evidence/tsc-run1.txt`, 18,315 bytes, SHA256 `a049c1c4aa3f6aa08263eeeb11fca6a29737f0891d607432a0d324f6b5399239`. Its targeted headings and exact bytes are preserved in R1. There is no new compiler result or full-typecheck-green claim; other recorded errors remain unresolved.
'''
(OUT / 'REPORT.md').write_text(report)
for row in rows:
    if role(ROOT / row['name']) != row['final']:
        raise RuntimeError('target changed during finalization')
files = {str(p.relative_to(OUT)): role(p) for p in sorted(OUT.rglob('*')) if p.is_file() and p.name != 'SOURCE-PINS.json'}
write_json('SOURCE-PINS.json', {'schema': '1370-p16-type-repair-r2-source-pins/v1', 'executionAuthorization': False, 'files': files})
for entry in files.values():
    if role(Path(entry['path'])) != entry:
        raise RuntimeError('manifest readback mismatch')
print(json.dumps({'sourcePins': role(OUT / 'SOURCE-PINS.json'), 'changedFiles': role(OUT / 'CHANGED-FILES.json'), 'report': role(OUT / 'REPORT.md'), 'deltaPatch': role(OUT / 'R1-TO-R2.patch'), 'fullPatch': role(OUT / 'FINAL-FOUR-FILE-REPAIR.patch'), 'save': role(actual)}))
