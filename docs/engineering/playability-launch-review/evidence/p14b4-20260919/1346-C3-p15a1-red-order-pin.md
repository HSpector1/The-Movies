# 1346-C3: pin the sourceReleaseIds output ORDER, small revision

Role: independent test engineer (test-author). Task: small revision in the same scratch tree,
requested by the coordinator after re-review [1346-D2](1346-D2-p15a1-red-r2-review.md) (verdict
ACCEPT for 1346-C2, one disclosed non-blocking gap) and the parent's ["After revision 1346-C2"](1346-F-parent-response-to-1346-D.md#after-revision-1346-c2)
addendum in 1346-F, which retroactively pinned an output order for `sourceReleaseIds` as binding on
production, while the 1346-C2 ordering leaf (`market-reason-source-ids-ordering`) only asserted set
membership. 1346-D2 flagged this precisely: "production now has a binding order requirement with no
RED/GREEN leaf that would catch a violation of it."

## The rule, quoted exactly

1346-F, "After revision 1346-C2": *"Parent decision on the one shape C2 found unpinned:
`sourceReleaseIds` lists its ids in selection order, largest contribution first, ties by ascending
`releaseId`. The C2 ordering leaf asserts set membership only. The order is binding on
production."*

This is the same selection rule from Blocking 2 (top-5 by value, ties by ascending id) restated as
also governing the OUTPUT array's order, not just which ids survive the cutoff.

## What changed

One file edited in the scratch tree,
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1346-work/tree/tests/p15a1-shared-market.test.ts`.
No other file touched; every other leaf (including the harness file, all of `market-reasons-capped-at-five`,
`market-large-batch-linear-storage`, and everything from 1346-C/1346-C2) is byte-identical to the
r2 patch.

### 1. `market-reason-source-ids-ordering` (existing leaf, tightened)

Changed the final assertion from set-equality (`new Set(saturation.sourceReleaseIds)).toEqual(new
Set([...]))`) to exact array equality:

```ts
expect(saturation.sourceReleaseIds).toEqual(['TOP1', 'TOP2', 'TOP3', 'TOP4', 'AAA-TIE'])
```

Every other assertion in this leaf (the six-exposure construction, the full-sum `value` check, the
`length === 5` check, the `not.toContain('ZZZ-TIE')` check) is unchanged from 1346-C2.

**The exact expected array, and why**, independently derived from this leaf's own inputs (not from
production, not assumed from the coordinator's message without verification):

| releaseId | age (weeks past R+4) | `stockWeight(age) = 0.2 · 2^(−age/13)` |
|---|---|---|
| `TOP1` | 0 | 0.2 |
| `TOP2` | 2 | 0.17977019463910837 |
| `TOP3` | 4 | 0.16158661440291455 |
| `TOP4` | 6 | 0.14524228561143251 |
| `AAA-TIE` | 8 | 0.13055116977098097 |
| `ZZZ-TIE` | 8 | 0.13055116977098097 |

Computed with `node -e "console.log(0.2*Math.pow(2,-age/13))"` for each age, independently of the
test file and of production (verbatim values above are the actual node output, not hand-rounded).
`stockWeight(age)` is strictly decreasing in `age` (it is `0.2 · 2^(−age/13)`, a strictly decreasing
exponential in `age` for any `age ≥ 0`), and the six ages `[0, 2, 4, 6, 8, 8]` are non-decreasing, so
the value-descending order is exactly the input order for the first four (`TOP1 > TOP2 > TOP3 >
TOP4`, all strictly, confirmed by the four distinct decimal values above), then a genuine tie
between `AAA-TIE` and `ZZZ-TIE` (identical `stockWeight(8)` to full double precision, confirmed
above: both `0.13055116977098097`). The tie-break rule ("ties by ascending releaseId") then orders
`AAA-TIE` before `ZZZ-TIE` lexically (`'AAA-TIE' < 'ZZZ-TIE'`, confirmed: both strings share no
common prefix beyond the first character, `'A' < 'Z'` in ASCII/UTF-16 code-unit order, which is what
a plain string comparison and `Array.prototype.sort`'s default comparator both use). The cutoff at
`MARKET_REASON_SOURCE_LIMIT = 5` drops the 6th-ranked id, which by the tie-break is `ZZZ-TIE`, not
`AAA-TIE` — consistent with 1346-C2's already-verified selection-set assertion (`{TOP1, TOP2, TOP3,
TOP4, AAA-TIE}`, `ZZZ-TIE` absent), now additionally fixed to this exact order:

```
['TOP1', 'TOP2', 'TOP3', 'TOP4', 'AAA-TIE']
```

This matches the coordinator's stated expectation exactly; I verified it independently rather than
copying it forward unchecked.

### 2. `market-reason-source-ids-ordering-window-releases` (new leaf)

The coordinator asked for "one small ordering assertion for a WINDOW_RELEASES or
SAME_WEEK_RELEASES reason with at least two sources of different weights, so the rule is pinned
beyond one code." Added a second, independent leaf targeting `WINDOW_RELEASES` (not
`GENRE_SATURATION`, so the two ordering leaves do not share a code and genuinely test the rule
twice over different aggregation paths):

Three window-lane exposures, three different studios, three different offsets from the subject's
release week (1323-A §3 window weights `1.00/0.55/0.55/0.20` by offset `0/1/2/3`):

| releaseId | offset | window weight |
|---|---|---|
| `W-OFFSET1` | 1 | 0.55 |
| `W-OFFSET2` | 2 | 0.55 |
| `W-OFFSET3` | 3 | 0.20 |

`W-OFFSET1` and `W-OFFSET2` tie at weight `0.55` (1323-A §3 states offsets 1 and 2 both weigh
`0.55`, exactly, not an approximation); `W-OFFSET3` is strictly lower at `0.20`. All three sources
survive the 5-item cutoff (only 3 of them), so this leaf isolates the ORDER rule from the
SELECTION/cutoff rule already covered by the `GENRE_SATURATION` leaf above. Ascending-releaseId
tie-break: `'W-OFFSET1' < 'W-OFFSET2'` (both strings are identical up to the final character, `'1'
< '2'`). Expected exact array, independently derived the same way as above:

```
['W-OFFSET1', 'W-OFFSET2', 'W-OFFSET3']
```

The subject has no same-week batch peer and no stock-lane exposure in this leaf, so
`WINDOW_RELEASES` is the only pressure-contributing code present; `SAME_WEEK_RELEASES`,
`GENRE_SATURATION`, and `STUDIO_CLAMPED` are not asserted here (out of scope for an ordering-only
leaf; their presence/absence is already covered by other leaves — `market-window-releases-reason-code`,
`market-reasons-capped-at-five` — and re-asserting it here would duplicate coverage without adding
to the order pin this leaf exists for).

### Header comment

Added a short "REVISION 1346-C3" paragraph to the file's top banner, citing 1346-D2 and 1346-F's
"After revision 1346-C2" section, consistent with the existing 1346-C2 provenance paragraph already
in the file. No test logic in the banner; provenance only.

## RED run (revised)

Command, from the scratch tree, unchanged:

```
node_modules/.bin/vitest run --project core tests/p15a1-shared-market.test.ts tests/p15a1-shared-market-harness.test.ts
```

Result: **2 test files failed, 33 tests failed, 0 passed.** (32 from 1346-C2, unchanged in count,
plus the one new leaf; `market-reason-source-ids-ordering` itself stays one leaf, just tightened.)

- `market-reason-source-ids-ordering` and `market-reason-source-ids-ordering-window-releases` both
  fail on `Error: Failed to load url ../src/core/sharedMarket.js (resolved id:
  ../src/core/sharedMarket.js) in <importer>. Does the file exist?` — the module still does not
  exist, so both leaves fail at the dynamic import, before either leaf's new/tightened assertions
  ever execute. Confirmed both individually attributed in the raw per-leaf output (not collapsed
  into a sibling's failure).
- The remaining 31 leaves are unchanged in RED reason from 1346-C2 (30 module-load failures, 1
  genuine `market-tuning-bounded-terms` value mismatch).

Observed the same Vite importer-path caching quirk documented in 1346-C and 1346-C2 (whichever
file's failed resolution is cached first in a given process gets echoed as `<importer>` for every
leaf across both files in that run); this run's raw output names
`tests/p15a1-shared-market.test.ts` throughout. Not a defect, not leaf-attribution-relevant (each
leaf is still individually listed and individually failing); documented for reproducibility. Full
raw output:
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1346-work/vitest-red-r3-output.txt`
in this session's scratchpad.

Full per-leaf mapping (33 rows, `status` field marks `unchanged from 1346-C` / `unchanged from
1346-C2` / `REVISED in 1346-C3` / `NEW in 1346-C3`) is in
`1346-stage/1346-p15a1-red-r3-classification.json`.

## Type gate (revised)

Command: `node_modules/.bin/tsc --noEmit -p tsconfig.json`. Exit code 2 (confirmed via the
process's own exit status, not inferred from output alone — a background run under heavy concurrent
CPU load from other sessions' simultaneous `tsc` invocations on the same host took several minutes
instead of the usual ~2 seconds; the completed run's exit code was captured directly). Exactly two
errors, both and only from the missing module (line 59 in the main file now, shifted from 50 in r2
because of the new leaf; cause unchanged):

```
tests/p15a1-shared-market-harness.test.ts(28,24): error TS2307: Cannot find module '../src/core/sharedMarket.js' or its corresponding type declarations.
tests/p15a1-shared-market.test.ts(59,24): error TS2307: Cannot find module '../src/core/sharedMarket.js' or its corresponding type declarations.
```

No other errors. The tightened assertion and the new leaf introduce no other type errors under this
repo's `strict`/`noUnusedLocals`/`noUnusedParameters`/`exactOptionalPropertyTypes` tsconfig.

## Patch and apply-check

Full tests-only diff vs the ORIGINAL base `ea65e796de37e11170c5123e3f4495368b9d5956` (not
incremental against r1 or r2): 998 lines, 2 files, 986 insertions, 0 deletions (`tests/p15a1-shared-market.test.ts`
792 lines, `tests/p15a1-shared-market-harness.test.ts` 194 lines, unchanged from r2).

Verified the patch applies cleanly via a scratch index (never the real repo's index) against both
the original BASE and the real-repo HEAD observed at hand-back time:

```
BASE=ea65e796de37e11170c5123e3f4495368b9d5956
HEAD_NOW=62f9e7e02cec9d4616caee843cba6425d5c5395a
PATCH=1346-stage/1346-p15a1-red-r3.patch

IDX1=$(mktemp); GIT_INDEX_FILE=$IDX1 git read-tree $BASE
GIT_INDEX_FILE=$IDX1 git apply --cached --check "$PATCH"   # exit 0
rm -f "$IDX1"

IDX2=$(mktemp); GIT_INDEX_FILE=$IDX2 git read-tree $HEAD_NOW
GIT_INDEX_FILE=$IDX2 git apply --cached --check "$PATCH"   # exit 0
rm -f "$IDX2"
```

Both exit 0. `git status --short` in the real repo was unchanged by these checks (showed only an
unrelated concurrent session's untracked `1351-stage/` directory, not touched by this task, and this
revision's own three handback files after they were written).

## Real repo state at hand-back

Observed HEAD: `62f9e7e02cec9d4616caee843cba6425d5c5395a`. `git diff --stat ea65e796..62f9e7e0 --
src tests ui bridge` shows the same single file as every prior 1346 handback in this chain,
`ui/src/lot/StudioLotIdentityReview.test.tsx` (+3 lines, the parent's own prior U3 commit) — no
further drift under those four roots. While this revision was in progress, another concurrent
session's `tsc` invocation (on an unrelated scratch tree, record 1351) was running on the same
machine at the same time, visible via `ps aux`; this is why the type-gate run needed the
background-task path and took longer than its usual ~2 seconds. It did not touch this task's files
or the real repo's `git status`.

## Summary

- Revised file (scratch tree only): `tests/p15a1-shared-market.test.ts`. 33 total leaves (32 from
  1346-C2 unchanged in count; `market-reason-source-ids-ordering` tightened in place; one new leaf,
  `market-reason-source-ids-ordering-window-releases`). The harness file and every other leaf in the
  main file are byte-identical to the r2 patch.
- RED status: 33/33 failed, each for a stated reason (31 missing-module load failures including
  both ordering leaves, 1 genuine TUNING value mismatch, unchanged). Type gate: exactly 2 errors,
  both `TS2307 Cannot find module '../src/core/sharedMarket.js'`, one per file, no other errors.
- The gap 1346-D2 flagged (order pinned by 1346-F but untested) is now closed: exact array order is
  asserted for `GENRE_SATURATION` (the leaf that already covered selection/cutoff/tie-break) and
  independently for `WINDOW_RELEASES` (a second, simpler three-source case with no cutoff
  complexity), so the ordering rule is pinned on two different aggregation codes, not one.
- Handback artifacts: `1346-stage/1346-p15a1-red-r3.patch` (full BASE-relative diff, verified against
  both BASE and current HEAD via scratch indices, exit 0 both), `1346-stage/1346-p15a1-red-r3-classification.json`
  (33 rows), this file.
