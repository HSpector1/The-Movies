"""Scratch-only P4/P5 observers; every original call runs once and rethrows unchanged."""
from pathlib import Path
import sys

tree = Path(sys.argv[1]).resolve()
assert tree == Path('/Users/zacheryspector/studio-scratch/1361-sweep/x2-guards/tree')
helper = '''
// Scratch-only 1361-N P4/P5 observer. Never part of a landing patch.
function observe1361<T>(site: string, run: () => T): T {
  try {
    const value = run()
    console.log('1361-GUARD ' + JSON.stringify({ site, test: expect.getState().currentTestName, outcome: 'returned' }))
    return value
  } catch (error) {
    console.log('1361-GUARD ' + JSON.stringify({ site, test: expect.getState().currentTestName,
      outcome: 'threw', message: error instanceof Error ? error.message : String(error) }))
    throw error
  }
}
'''
replacements = {
 'tests/p14b1-t4-regressions.test.ts': [
  ('expect(() => validateSaveV45(valid)).toThrow()',
   "expect(() => observe1361('p14b1-t4-regressions:86', () => validateSaveV45(valid))).toThrow()")],
 'tests/p14c2rm-writer-continuation.test.ts': [
  ("expect(() => validateSaveV45(envelope(invalid)), 'existing full-save refusal is a control').toThrow()",
   "expect(() => observe1361('p14c2rm-writer-continuation:385', () => validateSaveV45(envelope(invalid))), 'existing full-save refusal is a control').toThrow()")],
 'tests/p14c3-save-v38.test.ts': [
  ('expect(() => validate(mutated), row.name).toThrow()',
   "expect(() => observe1361('p14c3-save-v38:131/' + row.name, () => validate(mutated)), row.name).toThrow()")],
 'tests/contracts/studio-events.contract.test.ts': [
  ('() => validateAtOwningBoundary(kind, [forged], 1),',
   "() => observe1361('studio-events:221/' + kind + '/' + forbidden, () => validateAtOwningBoundary(kind, [forged], 1)),")],
 'tests/contracts/v14-boundary-guards.contract.test.ts': [
  ('() => migrator(save),', "() => observe1361('v14-boundary:215/' + target + '/' + version, () => migrator(save)),"),
  ('expect(() => migrate(envelopeAt(14))).toThrow(/cannot downgrade/)',
   "expect(() => observe1361('v14-boundary:254', () => migrate(envelopeAt(14)))).toThrow(/cannot downgrade/)"),
  ('() => builder(carrier),', "() => observe1361('v14-boundary:279/' + version + '/' + label, () => builder(carrier)),"),
  ('written = makeV13(inFlight)', "written = observe1361('v14-boundary:304', () => makeV13(inFlight))")],
 'tests/v14-migration.contract.test.ts': [
  ('''written = makeSaveV13(
          historical as unknown as Parameters<typeof makeSaveV13>[0],
        ) as unknown as {''',
   '''written = observe1361('v14-migration:244/' + cell.key, () => makeSaveV13(
          historical as unknown as Parameters<typeof makeSaveV13>[0],
        )) as unknown as {''')],
}
prepared = {}
for relative, changes in replacements.items():
    path = tree / relative
    for component in [path, *path.parents]:
        assert not component.is_symlink(), component
        if component == tree:
            break
    assert path.resolve().is_relative_to(tree), path
    source = path.read_text()
    assert 'function observe1361' not in source, path
    for old, new in changes:
        assert source.count(old) == 1, (relative, old, source.count(old))
        source = source.replace(old, new)
    prepared[path] = source + helper
for path, source in prepared.items():
    path.write_text(source)
print('Instrumented six scratch test files; no assertion changed.')
