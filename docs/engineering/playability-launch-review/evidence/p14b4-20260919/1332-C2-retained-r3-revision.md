# 1332-C2 — retained-defect repair R3, revision 2 (unbound-receipt amendment)

Role: independent test engineer. Repo `/Users/zacheryspector/The-Movies-headless-program`, branch
`wip/headless-program-20260916-ts`, assigned base commit `ba7a97522c91af4dac4966e48626f317d3a99f2f`
(unchanged from 1332-C). Real repo HEAD at the start of this revision: `59fee88cfc166c7a005742eb607fb159ab6653c0`
(confirmed via `git rev-parse HEAD`); `git diff --stat ba7a9752 HEAD` shows only 4 docs files changed since
the base (my own revision-1 `1332-C`/`1332-stage/` deliverables, committed byte-for-byte, plus the new
`1332-F2`) — no source/test/config file moved. Authority: `1332-F2-parent-r3-handback-adoption.md`'s one
amendment. Does not edit `1332-C-retained-r3-handback.md` or `1332-stage/`; this is a new revision only.
Tests only; no production code, fixture payload, `tsconfig` or `vitest.config` change.

## Method

The existing scratch tree at
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1332-work/tree`
was reused as-is (confirmed clean apart from the three revision-1 edits: `git status --short` showed
exactly the three files 1332-C already touched, `git log --oneline` showed only its one base commit
`f1016b7f`, matching the archived `ba7a9752` base — not rebuilt, per the task's instruction to work in
the existing tree).

## What changed

Only `tests/p14c3-promise-digest-continuity.test.ts`, inside the `:194` leaf's `selected()` closure.
`tests/bridge-p14b2-checkpoint.test.ts` and `tests/p14b5-relationships.test.ts` are byte-identical to
revision 1 (confirmed: `git diff` of each file, extracted from this tree and from the committed
`1332-stage/1332-retained-r3.patch`, hashes identical —
`86bfcf19b8b6357c44ab4efa14fb6f1acc7fd1f8a0281f8e1e4e3659128dc383` for the checkpoint file's diff,
`72f091f6d2f38da9fc10827d86511ac29a69643f9076a14df368522e5b3f83c7` for the relationships file's diff, both
matching between this revision's patch and the frozen revision-1 patch).

Replaced:
```ts
      expect(root.feasibilityReceipt).toMatchObject({ week: 208, rulesVersion: 4 })
```
with:
```ts
      expect(root.feasibilityReceipt.rulesVersion).toBe(4)
      if (root.contractId !== null) {
        expect(root.feasibilityReceipt).toMatchObject({ week: 208, rulesVersion: 4 })
      } else {
        expect(root.feasibilityReceipt).toEqual(preReceipts.get(id)!)
      }
```
per 1332-F2's amendment: the bound path keeps its `toMatchObject({week: 208, rulesVersion: 4})` shape
check (its other fields — `classification`, `bottleneck`, `inputsDigest` — are freshly re-derived at 208
and not independently predictable in the test); the unbound path now `toEqual`s the WHOLE pre-tick
receipt object (`classification`, `bottleneck`, `inputsDigest`, `rulesVersion`, `week` all checked, not
just the two fields `toMatchObject` covered), satisfying 1332-F amendment 1's literal text — "unchanged
(every field equal)" — which the revision-1 `toMatchObject({week, rulesVersion})` did not fully cover.
`rulesVersion` 4 is now asserted explicitly on both paths (a standalone `expect` before the branch),
per 1332-A rule 4's own separate requirement, rather than left to be merely inherited through equality
with a snapshot value that itself was unverified as being 4 within this assertion.

Everything else in the leaf (the `preReceipts` map, the `unboundIds` pre-declared-attribution guard, the
per-subject case-decision fact checks, the whole-world `bytes()` equality checks) is untouched, per the
task's explicit "keep everything else in the patch as is."

## Commands actually run, with actual outputs

```
node_modules/.bin/vitest run --project core tests/p14c3-promise-digest-continuity.test.ts --reporter=verbose
  → Test Files 1 passed (1) / Tests 8 passed (8)

node_modules/.bin/vitest run --project core tests/bridge-p14b2-checkpoint.test.ts \
  tests/p14b5-relationships.test.ts tests/p14c3-promise-digest-continuity.test.ts --reporter=verbose
  → Test Files 3 passed (3) / Tests 56 passed (56)   [2 + 46 + 8, unchanged from revision 1]

node_modules/.bin/tsc --noEmit -p tsconfig.json
  → exit 0, empty output
```

## `git diff --stat` (scratch tree, against its own base commit `f1016b7f`, all three files cumulative)

```
 tests/bridge-p14b2-checkpoint.test.ts         | 20 +++++++++-
 tests/p14b5-relationships.test.ts             | 54 +++++++++++++++++++++++++-
 tests/p14c3-promise-digest-continuity.test.ts | 55 ++++++++++++++++++++++++++-
 3 files changed, 125 insertions(+), 4 deletions(-)
```
(revision 1 was 115 insertions(+) / 4 deletions(-); the ten new lines are entirely inside the
`tests/p14c3-promise-digest-continuity.test.ts` amendment above — its own file line count moved from
45 to 55 insertions, the other two files unchanged.)

## Temporary-index check (real repository root, against the assigned base `ba7a9752`)

```
TMPIDX=$(mktemp)
GIT_INDEX_FILE="$TMPIDX" git read-tree ba7a97522c91af4dac4966e48626f317d3a99f2f   → exit 0
GIT_INDEX_FILE="$TMPIDX" git apply --cached --check 1332-retained-r3-r2.patch     → exit 0
git status --short (real repo)                                                    → empty
git rev-parse HEAD (real repo)                                                    → 59fee88cfc166c7a005742eb607fb159ab6653c0 (unchanged)
```

## Deliverables (new names; revision 1's files under `1332-stage/`/`1332-C` stay frozen, not touched)

Written to
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1332-work/out/`:

- `1332-retained-r3-r2.patch` — cumulative `git diff` of the scratch tree against its base (`f1016b7f`,
  itself the assigned base `ba7a9752`), all three files, 125 insertions(+) / 4 deletions(-). 15739 bytes.
  sha256: `1895496ee8dbfb7bd98d9c48dfd1ea22758bc6e0b58cc80014a32d5c861d64ec`
- `1332-retained-r3-r2-classification.json` — 8 rows, same shape as revision 1's 8 rows; 7 rows
  byte-identical to revision 1 (checkpoint ×1, relationships ×4, the `preReceipts`/`unboundIds` p14c3 rows
  ×2); the one row at `tests/p14c3-promise-digest-continuity.test.ts:194` revised to describe the new
  `toEqual`/explicit-`rulesVersion` shape. 11092 bytes. sha256:
  `0d95965ec939e75f84eacdbaed2776a49b7a075695e0dea9f22b67acfb70c06b`
- This file (`1332-C2-retained-r3-revision.md`).

## Cleanup

Scratch tree retained (writable-role evidence preservation, same tree as revision 1, no rebuild). The
real repository's `tests/`, `src/`, `ui/` and config files were never modified — confirmed clean at the
end (`git status --short` empty, `git rev-parse HEAD` unchanged at `59fee88c`). No commit was made in the
real repository; the parent is the only committer. Nothing was written under the repository's own
evidence directory by this task.
