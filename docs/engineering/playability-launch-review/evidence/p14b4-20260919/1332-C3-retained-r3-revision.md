# 1332-C3 — retained-defect repair R3, revision 3 (comment-only citation fix)

Role: independent test engineer. Repo `/Users/zacheryspector/The-Movies-headless-program`, branch
`wip/headless-program-20260916-ts`, assigned base commit `ba7a97522c91af4dac4966e48626f317d3a99f2f`
(unchanged from 1332-C/1332-C2). Real repo HEAD at the start of this revision:
`57938a57e166bb6707427b251dfc38c6c47b30b6` (confirmed via `git rev-parse HEAD`; `git status --short`
empty). Authority: `1332-D-retained-r3-review.md` required change 2, answered by
`1332-F3-parent-response-to-1332-D.md` ("the author issues revision 3 with that one comment line
corrected and nothing else"). Does not edit `1332-C`/`1332-C2`/`1332-stage/`; this is a new revision
only. Tests only; comment text only — no assertion, expected value, logic branch or any other line
changed.

## Method

Reused the existing scratch tree at
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1332-work/tree`
as-is (same tree revisions 1 and 2 used; not rebuilt). `git status --short` before this edit showed
exactly the three files revisions 1/2 already touched.

## The one-line change

`tests/bridge-p14b2-checkpoint.test.ts`, the comment added in revision 1 citing `convertV39ToV40`:
```diff
-      // src/core/save.ts:10490-10497: `{ version: 1, cutoverOrdinal:
+      // src/core/save.ts:10493-10497: `{ version: 1, cutoverOrdinal:
```
`convertV39ToV40` begins at `src/core/save.ts:10493` (`:10489-10491` is the end of the prior function,
`validateSaveV40`); the classification JSON's `cause` field for this same edit already cited
`:10493-10497` correctly (confirmed below) — only the in-code comment had the 3-line slip. Nothing else
in `tests/bridge-p14b2-checkpoint.test.ts` or the other two files was touched.

**Diff of revision 2's patch against revision 3's patch** (direct `diff` of the two patch files),
confirming the only textual change is this one comment line (the `index <a>..<b>` blob-hash line is an
unavoidable artifact of the content change, not a second edit):
```
2c2
< index 2d04002..a8f4c49 100644
---
> index 2d04002..2ef3ec5 100644
11c11
< +      // src/core/save.ts:10490-10497: `{ version: 1, cutoverOrdinal:
---
> +      // src/core/save.ts:10493-10497: `{ version: 1, cutoverOrdinal:
```

## Classification JSON: unchanged, no new file issued

Checked the frozen `1332-retained-r3-r2-classification.json`'s one `tests/bridge-p14b2-checkpoint.test.ts`
row (line 65): its `old`, `new` and `cause` fields never quoted the in-code comment text at all (the
`new` field's snippet begins at `const sourceFirstTakeSubjects = ...`, after the comment block; the
`cause` field independently states `"...convertV39ToV40 (save.ts:10493-10497)..."`, already correct).
No row's tracked text differs before/after this revision. Per the task's instruction ("only if a row
changes; otherwise say so"): **no row changed; `1332-retained-r3-r3-classification.json` is not issued.**

## Commands actually run, with actual outputs

```
node_modules/.bin/vitest run --project core tests/bridge-p14b2-checkpoint.test.ts --reporter=verbose
  → Test Files 1 passed (1) / Tests 2 passed (2)

node_modules/.bin/tsc --noEmit -p tsconfig.json
  → exit 0, empty output
```

## `git diff --stat` (scratch tree, against its own base commit `f1016b7f` = archive of `ba7a9752`, all
three files cumulative — unchanged in shape from revision 2, since this is a content, not a line-count,
change)

```
 tests/bridge-p14b2-checkpoint.test.ts         | 20 +++++++++-
 tests/p14b5-relationships.test.ts             | 54 +++++++++++++++++++++++++-
 tests/p14c3-promise-digest-continuity.test.ts | 55 ++++++++++++++++++++++++++-
 3 files changed, 125 insertions(+), 4 deletions(-)
```

## Temporary-index check (real repository root, against the repo HEAD)

```
git rev-parse HEAD                                                                → 57938a57e166bb6707427b251dfc38c6c47b30b6
TMPIDX=$(mktemp)
GIT_INDEX_FILE="$TMPIDX" git read-tree HEAD                                       → exit 0
GIT_INDEX_FILE="$TMPIDX" git apply --cached --check 1332-retained-r3-r3.patch     → exit 0
```
Also re-checked against the assigned base `ba7a9752` (same result as revisions 1/2):
```
TMPIDX2=$(mktemp)
GIT_INDEX_FILE="$TMPIDX2" git read-tree ba7a97522c91af4dac4966e48626f317d3a99f2f  → exit 0
GIT_INDEX_FILE="$TMPIDX2" git apply --cached --check 1332-retained-r3-r3.patch    → exit 0
git status --short (real repo)                                                    → empty
```
Both succeed because the real repository's `tests/` tree has not diverged from the assigned base (only
docs changed since `ba7a9752`, confirmed at the start of this revision) — the staged patch is not yet
applied to the real repository (1332-E application remains the parent's step).

## Deliverables (new name; revisions 1/2 stay frozen, not touched)

Written to
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1332-work/out/`:

- `1332-retained-r3-r3.patch` — cumulative `git diff` of the scratch tree against its base (`f1016b7f`,
  itself the assigned base `ba7a9752`), all three files, 125 insertions(+) / 4 deletions(-) (identical
  line counts to revision 2 — this is a content substitution, not an add/remove). 15739 bytes. sha256:
  `2514e0329d01a91a0876d08c68d5f3c62f3fea48f42a2dc06231c259c4d0e1d3`
- No classification JSON issued (see above — no row's tracked text changed).
- This file (`1332-C3-retained-r3-revision.md`).

## Cleanup

Scratch tree retained (same tree revisions 1/2 used; no rebuild). The real repository's `tests/`, `src/`,
`ui/` and config files were never modified — confirmed clean at the end (`git status --short` empty,
`git rev-parse HEAD` unchanged at `57938a57`). No commit was made in the real repository; the parent is
the only committer. Nothing was written under the repository's own evidence directory by this task.
