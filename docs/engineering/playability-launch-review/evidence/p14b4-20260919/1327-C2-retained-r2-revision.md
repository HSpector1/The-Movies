# 1327-C2 — retained-defect repair R2, revision 2 (K4 amendment)

Role: independent test engineer. Repo `/Users/zacheryspector/The-Movies-headless-program`, branch
`wip/headless-program-20260916-ts`, assigned base commit `b96a973a03f1e62fb63197c07e7752355ef4a5bb`
(unchanged from 1327-C). Authority: `E/1327-F-parent-r2-handback-adoption.md`'s amendment. Does not
edit `E/1327-C-retained-r2-handback.md`; this is an addendum only. Tests only; no production code,
fixture payload, `tsconfig` or `vitest.config` change.

**HEAD drift noted, not acted on.** At the start of this revision the real repository's branch tip
had advanced to `217d0ae6` (parent commit staging 1327-C's deliverables and 1327-F). The scratch tree
was rebuilt at the assigned **pinned** base `b96a973a`, per the parent's explicit instruction, not the
moving tip.

## Method

Scratch tree rebuilt exactly as in 1327-C, fresh (the prior tree had been removed at the end of that
task): `git archive b96a973a ...` for source/tests, read-only symlinks for `tests/fixtures`, `docs`,
`node_modules`, `art`, `tools`, `git init` + one base commit (`6adc888`, "1327-C2 scratch base at
b96a973a..."). `E/1327-stage/1327-retained-r2.patch` applied on top with `git apply` (not `--check`)
to reproduce revision 1's six-file state before making the amendment:
```
git apply --check docs/.../1327-stage/1327-retained-r2.patch   → exit 0
git apply docs/.../1327-stage/1327-retained-r2.patch           → exit 0
git diff --stat   → 6 files changed, 65 insertions(+), 11 deletions(-)   (byte-identical to 1327-C)
```

## K4 amendment (1320-A class S1)

`tests/p14c3-canonical-rival-history.test.ts` K4 validates `makeSave(canonicalChosen().loaded)` (a
live envelope, `saveVersion` always 42) and three of its detached mutants with the version-frozen
`validateSaveV38` at four sites: line 233 (`control`, positive), line 245 (`mutant`, inside the
title/credit/entry loop), line 255 (`missing`), line 256 (`control` re-check). `validateSaveV37`
at line 235 reads a genuine V37 capture (`historical37()`) and was left untouched, per the amendment.

**Edit**: import swapped `validateSaveV38` → `validateSaveV42`
(`tests/p14c3-canonical-rival-history.test.ts:10`); the same four call sites swapped
`validateSaveV38(...)` → `validateSaveV42(...)`, with no other text changed at any of the four sites.

**Measurement of what each mutant is now refused with** (disposable probe, built outside `tests/`,
never staged, deleted before this handback — it directly replicates K4's own mutant construction and
calls `validateSaveV42` on each, logging the caught message):
```
title  threw: ...validateSaveV37: state is invalid — ... — validateSaveV25: frozen V24 state is invalid
       — Hollywood save: authored film differs from canonical starting manifest
credit threw: ...(same chain)... — Hollywood save: authored credit differs from canonical starting manifest
entry  threw: ...(same chain)... — Hollywood save: authored credit differs from canonical starting manifest
missing threw: validateSaveV38: current profession changed without its anchored change history
control: did not throw (expected)
```
All four measured causes are **unchanged** from the leaf's original expectations:
- `title` → `/authored film differs from canonical starting manifest/` (unchanged)
- `credit` → `/authored credit differs from canonical starting manifest/` (unchanged)
- `entry` → `/authored credit differs from canonical starting manifest/` (unchanged, same cause as credit)
- `missing` → `/current profession changed without its anchored change history/` (unchanged)

No mutant went unrefused; no message differed from what the leaf already expected, so **no expected
`cause` regex or literal was edited** — only the validator selection (S8: the expectation text names
what the live validator says; here it already did, so nothing to rewrite).

**One observation, not acted on (out of scope, production code).** The `missing` mutant's message
carries a literal `validateSaveV38:` prefix even under `validateSaveV42`. Source:
`src/core/professionHistory.ts:42`, `` function fail(message: string): never { throw new Error(
`validateSaveV38: ${message}`) } `` — this internal helper's error-prefix text is hardcoded at the
version where it was introduced and is reused by every later validator that calls it; it is
production source, not touched (Rule 1). The leaf's own regex does not depend on that prefix and
still matches. Reported for the parent's awareness, not treated as a defect requiring a test change.

## Commands actually run, with actual outputs

```
npx vitest run tests/p14c3-canonical-rival-history.test.ts -t "K4" --reporter=verbose
  → Test Files 1 passed (1) / Tests 1 passed | 5 skipped (6)

npx vitest run tests/p14c3-canonical-rival-history.test.ts --reporter=verbose
  → Test Files 1 failed (1) / Tests 2 failed | 4 passed (6)
  → K1, K2, K3, K4 pass. L1, L2 still fail (unchanged, untouched, Rule 3 — same cause as 1327-C:
    tests/helpers/p14c3-canonical-rival-fixtures.ts:290 `refuseTerminalWithoutWork`,
    "L passive work premise ended without an obligation", cause "noCatalogue")

npx vitest run tests/p13b-r07-save-v25.test.ts tests/facility-move-demolish.test.ts \
  tests/p14c2s-scientist-retirement.test.ts tests/bridge-runtime-checkpoint.test.ts \
  tests/helpers/p14c3-canonical-rival-fixtures.ts tests/p14c3-canonical-rival-history.test.ts \
  tests/bridge-contract-generator.test.ts --reporter=verbose
  → Test Files 1 failed | 5 passed (6)
  → Tests 2 failed | 159 passed (161)
  → (revision 1's consolidated run was 3 failed | 158 passed (161); K4 moved from failing to
    passing, no other row moved — 158 + 1 = 159, 3 - 1 = 2, matching exactly)
```

Type gates (from the scratch tree root, after the amendment):
```
npx tsc -p tsconfig.json --noEmit        → exit 0, empty output
npx tsc -p tsconfig.bridge.json --noEmit → exit 0, empty output
cd ui && npx tsc -p tsconfig.json --noEmit → exit 0, empty output
```

Patch verification (from the real repository root, against the assigned base commit
`b96a973a03f1e62fb63197c07e7752355ef4a5bb`, via a temporary index — the real index/worktree were
never touched):
```
TMPIDX=$(mktemp)
git read-tree b96a973a03f1e62fb63197c07e7752355ef4a5bb   → exit 0
git apply --check --cached docs/.../1327-stage/1327-retained-r2.patch (revision 2) → exit 0
```

## Deliverables (overwritten)

- `E/1327-stage/1327-retained-r2.patch` — cumulative diff against `b96a973a`, now 7 files
  (revision 1's 6 plus `tests/p14c3-canonical-rival-history.test.ts`), 70 insertions / 16 deletions.
  New sha256: `fbc3ac33b2ac9cc7258edb4cd15e46b15b1d757a15892258426da17defda0084`
  (revision 1 was `c9a6d4213cead893e72af2d5c9cc4fb670f73efce1f3243faeb99d669c9aec30`).
- `E/1327-stage/1327-retained-r2-classification.json` — now 14 rows (revision 1's 11, minus the one
  K4 no-edit row it replaces, plus 4 new K4 edit rows: import, line 233, line 245, line 255-256).
  New sha256: `aad21b3d6f09bb8d36e439de74276da7634c08c7acfcd5e20c58e967ef8e33c9`
  (revision 1 was `03f8042c110cf94884b518589c06f32d8d8f63aed4ed5c4265a591c56a283255`).
- This file. `E/1327-C-retained-r2-handback.md` was not edited.

## Leaves left unchanged (per the parent's explicit instruction)

L1/L2 (`tests/p14c3-canonical-rival-history.test.ts`) and the `bridge-p14c2rm-retirement` pair stay
untouched, exactly as reported in 1327-C — no new measurement was needed since the amendment's scope
was K4 only, and both re-runs above confirm their failures are unchanged (same message, same source
line, same cause) after the K4 edit landed.

## Cleanup

Scratch tree at `/private/tmp/claude-501/.../scratchpad/1327-work/tree` (and the disposable K4 probe)
removed at the end of this task, after the patch and classification JSON were copied into the
repository's evidence directory and independently re-verified against the assigned base commit from
the real repository root. `git status --short` on the real repository at the end of this task shows
only the two modified files under `E/1327-stage/` and this new addendum file — no tracked
`tests/`/`src/`/`ui/`/config file was touched, and no commit was made.
