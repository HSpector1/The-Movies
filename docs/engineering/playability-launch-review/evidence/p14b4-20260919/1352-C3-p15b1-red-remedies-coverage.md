# 1352-C3: P15B Wave 1 RED revision — `remedies()` coverage (review 1352-D REFINE)

Role: independent test engineer (test-author). Task: close the two coverage gaps
[1352-D](1352-D-p15b1-red-review.md) found in the r2 suite, plus its one non-blocking note, per the
coordinator's message. Same scratch tree, same BASE (`8cecfd621b907dcea017f52b43b9e2cd540c47cf`),
same two files.

## What 1352-D found

**Verdict: REFINE.** Every hand-derived value in r2 was independently re-derived by the reviewer
and confirmed correct, including both self-caught off-by-one corrections from 1352-C2. The gap was
coverage, not correctness:

1. **Blocking defect 1**: all five `remedies-two-routes-*` leaves called `remedies()` with
   `condition.stage` hardcoded to `'distress'` (via `distressCondition()`). An implementation that
   ignores the passed-in `condition.stage` for its LOAN branch (e.g. a literal `'distress'` string)
   would pass every leaf.
2. **Blocking defect 2**: every leaf used `capability.founding: false`. An implementation that never
   reads `capability.founding` at all would pass every leaf.
3. **Non-blocking note (Q4)**: `condition-first-evaluation-negative-cash` was an isolated
   `stepCondition(null, ...)` call, never chained into a following week via `runFrom`; a bug
   specific to "the negative-first-eval Condition breaks the next call" would not be caught.

## Changes made (all three, per the coordinator's message)

### 1. `remedies-two-routes-stage-outside-warning-distress-excludes-loan`

New helper `conditionAt(stage)` (same shape as `distressCondition()`, only `stage` varies). Facts
and capability are the exact same otherwise-fully-loan-eligible fixture already used by the
`-pending-release-and-staff-and-no-loan-gives-at-least-two` leaf (`wfc=10,000` →
`loanMaxPrincipal=260,000≥1,000`; `hasOutstandingLoan:false`; `founding:false`;
`hasPendingRelease:true`; `terminableContracts:5`), so that only `condition.stage` differs from the
leaf it is meant to complement.

**Hand derivation, `stage='stable'`:** `loanEligible('stable', 10_000, {...})` — stage is not
`warning`/`distress` → `false`. `REDUCE_OBLIGATIONS` (`terminableContracts=5>0`) → eligible.
`RELEASE` (`hasPendingRelease=true`) → eligible. Neither of these two families is stage-gated by
1352-A §4.3 (only `LOAN` reads `condition.stage`). Fixed order `[LOAN, REDUCE_OBLIGATIONS,
RELEASE]` with `LOAN` skipped → `result = ['REDUCE_OBLIGATIONS', 'RELEASE']`.

**Hand derivation, `stage='recovery'`:** identical reasoning — `loanEligible('recovery', ...)` is
`false` by the same stage-table row (1352-A §4.4: "Eligible: stage warning or distress"). Same
result: `['REDUCE_OBLIGATIONS', 'RELEASE']`.

Both branches asserted in one leaf (`stableResult`, `recoveryResult`), each with an explicit
`not.toContain('LOAN')` plus the full exact-array equality, so a partial-credit implementation that
merely drops `LOAN` from the array without preserving the other two in fixed order still fails
loudly rather than passing on the weaker assertion alone.

### 2. `remedies-two-routes-founding-excludes-loan`

Reuses `distressCondition()` (stage `'distress'`, otherwise unchanged) and the same
otherwise-loan-eligible facts, with `capability.founding: true` (the only capability field varied
from the `-at-least-two` leaf).

**Hand derivation:** `loanEligible('distress', 10_000, {hasOutstandingLoan:false, founding:true})`
— 1352-A §4.4 "not founding" — `founding=true` → `false`, regardless of stage or the fixed-cost
max. `REDUCE_OBLIGATIONS` and `RELEASE` are not founding-gated (§4.3 names no founding condition for
either), so both remain eligible from `terminableContracts=5>0` and `hasPendingRelease=true`.
Result: `['REDUCE_OBLIGATIONS', 'RELEASE']` — identical shape to defect 1's leaf, but reached via
the `founding` gate instead of the `stage` gate, so the two leaves cannot be satisfied by the same
single-line "always exclude LOAN" shortcut implementation either (a `remedies()` that unconditionally
omits `LOAN` would pass both of these two NEW leaves but fail the pre-existing
`-pending-release-and-staff-and-no-loan-gives-at-least-two`/`-fixed-order-skips-ineligible-middle-family`
leaves, which require `LOAN` present).

### 3. Chain `condition-first-evaluation-negative-cash` through `runFrom` (Q4)

Extended the existing leaf (not a new leaf — the coordinator's message groups it under "no other
leaf changes" as a modification of this one) to feed the returned `next` Condition into `runFrom`
for one more week (`week=2`, `startWeek` argument `2`), reusing the existing chaining helper rather
than hand-rolling a second call.

**Hand derivation:** `next` from week 1 has `lowRun=1, negativeRun=1, clearRun=0, distressWeeks=0,
stage='stable'`. Week 2, `cash=-500` (still `wfc=1000` default): `low=true` (`cover=-0.5<4`),
`negative=true`. `lowRun = prev.lowRun+1 = 1+1 = 2`. `negativeRun = 1+1 = 2`. `clearRun =
low?0:... = 0`. `distressWeeks` baseline `= prev.stage==='distress'?... : 0 = 0` (`prev.stage` is
`'stable'`). Transition check, `from='stable'`: `lowRun>=4`? `2>=4` false → no transition. Matches
the coordinator's own stated values (`lowRun 2, negativeRun 2, no transition`) exactly.

## Verification method (same as 1352-C2: independent reference simulator, not trust)

Extended the disposable, from-scratch reference simulator built for 1352-C2 (kept only in this
session's scratchpad, never imported by or copied into the test files or production) with the three
new/changed computations above. All three matched the hand derivations on the first run — no further
corrections were needed this round (unlike 1352-C2, which caught two off-by-one bugs). The
simulator's `remedies()`-equivalent logic was not built (1352-D's defects are about `remedies()`,
which the simulator never modeled — the two new leaves' correctness rests on direct hand
application of 1352-A §4.3/§4.4's stated eligibility rules, cross-checked against the already-tested
`loanEligible` stage table in `tests/p15b1-studio-loan.test.ts`, not against a second
reference implementation); the `stepCondition` chaining claim (item 3) was verified against the
simulator, and passed immediately.

## Files changed

- `tests/p15b1-corporate-condition.test.ts`: 39 → **41 leaves** (net +2: the two new
  `remedies-two-routes-*` leaves; the `runFrom` chaining addition extends the existing
  `condition-first-evaluation-negative-cash` leaf without adding a new one).
- `tests/p15b1-studio-loan.test.ts`: unchanged, **11 leaves**.
- **52 leaves total** (was 50).

## RED run

Command (unchanged):

```
node_modules/.bin/vitest run --project core tests/p15b1-corporate-condition.test.ts tests/p15b1-studio-loan.test.ts
```

Result: **2 test files failed, 52 tests failed, 0 passed.** Same three RED-reason categories as
r1/r2: 50 module-load failures, 1 `ENOENT` on the direct source-text read, 1 genuine `TUNING`
mismatch. Full per-leaf mapping in `1352-stage/1352-p15b1-red-r3-classification.json` (52 rows; leaf
counts cross-checked against `grep -c "  it("` on each file: 41 + 11 = 52, matching exactly, and
against the raw failing-test list, which names both new leaves and the extended
`condition-first-evaluation-negative-cash` leaf exactly once each).

## Type gate

`node_modules/.bin/tsc --noEmit -p tsconfig.json`: exit code 2, the same two errors as every prior
round, no others:

```
tests/p15b1-corporate-condition.test.ts(74,24): error TS2307: Cannot find module '../src/core/corporateCondition.js' or its corresponding type declarations.
tests/p15b1-studio-loan.test.ts(29,24): error TS2307: Cannot find module '../src/core/studioLoan.js' or its corresponding type declarations.
```

## Base and HEAD

Real-repo HEAD at the start of this pass was `3329b1f5223ed5f9caef722e37dc650ebc065e22` (as reported
at the end of 1352-C2); at the end of this pass, real-repo HEAD is
`ac631bfc68a2a01b61a909a996059977265c6c41`. `git diff --stat` on
`src/core/corporateCondition.ts`, `src/core/studioLoan.ts`, `src/core/tuning.ts`,
`tests/p15b1-corporate-condition.test.ts`, `tests/p15b1-studio-loan.test.ts` between the two HEADs is
empty; both modules still do not exist. No drift on any target path.

## Patch verification

`git add -A tests` in the scratch tree staged exactly the two files (1,451 insertions total: 1,202
in the corporate-condition file, 249 unchanged in the loan file). Temporary-index apply check
against the then-current real-repo HEAD (`ac631bfc68a2a01b61a909a996059977265c6c41`), scratch index
only:

```
NOW=ac631bfc68a2a01b61a909a996059977265c6c41
SCRATCH_INDEX=$(mktemp)
GIT_INDEX_FILE=$SCRATCH_INDEX git read-tree $NOW
GIT_INDEX_FILE=$SCRATCH_INDEX git apply --cached --check 1352-stage/1352-p15b1-red-r3.patch
# APPLY-CHECK-EXIT=0
rm -f "$SCRATCH_INDEX"
```

Exit code 0. Real repo `git status --short` unchanged before and after (only the parent's own
untracked `1344-stage/` shelving-production patch files present, none of mine).

## Summary

- Files: `tests/p15b1-corporate-condition.test.ts` (41 leaves, was 39), `tests/p15b1-studio-loan.test.ts`
  (11 leaves, unchanged). **52 leaves total** (was 50).
- RED status: 52/52 failed, each for a stated, correct reason. 0 controls pass. Type gate:
  unchanged, exactly 2 `TS2307` errors.
- Both 1352-D blocking defects closed with one leaf each, reusing the existing
  `distressCondition()`/`fact()` fixtures as instructed; the one non-blocking note applied by
  extending the existing leaf rather than adding a new one.
- No new interpretation gaps or self-caught defects found this round; the reference-simulator
  cross-check matched every new hand derivation on the first attempt.
- Handback artifacts: `1352-stage/1352-p15b1-red-r3.patch` (tests only, applies cleanly to the
  then-current real-repo HEAD via a scratch index, verified),
  `1352-stage/1352-p15b1-red-r3-classification.json` (52 rows), this file.
