# 1352-C2: P15B Wave 1 RED revision (parent rulings 1352-F2 applied)

Role: independent test engineer (test-author). Task: revise the RED suite staged at
[1352-C](1352-C-p15b1-red-handback.md) per the coordinator's mid-task message and
[1352-F2](1352-F2-parent-rulings-on-1352-C.md) (the parent's rulings on 1352-C's three disclosed
findings), same scratch tree, same BASE (`8cecfd621b907dcea017f52b43b9e2cd540c47cf`).

## Rulings applied (1352-F2 governs)

1. **First evaluation counts its own week.** `stepCondition(null, facts)` steps from an implicit
   zero condition (stage stable, every counter 0, `since=facts.week`, `week=facts.week-1`) using
   `facts` exactly as any other week. A healthy first week now has `clearRun=1` (not the old,
   forced-zero 0); a negative first week has `lowRun=1, negativeRun=1, clearRun=0`, no transition.
2. **`distressWeeks` is positive exactly in distress, closed included.** Adopts and completes the
   reading 1352-C already used for the `distress→recovery` exit; the closure week's own
   `Condition.distressWeeks` is now `0`, not `26` — the duration lives only in the transition's
   `DISTRESS_DURATION` cause.
3. **Causes are integer durations with an exact per-row list**, never `floor(cover)` (not
   JSON-safe at `O=0`): `LOW_COVER=lowRun`, `NEGATIVE_CASH=negativeRun`,
   `DISTRESS_DURATION=`counter-step `distressWeeks` before the transition resets it,
   `COVER_RESTORED=clearRun`. Per-row lists: `stable/recovery→warning` = `[LOW_COVER,
   NEGATIVE_CASH?]` (conditional on `negativeRun>0`); `warning→distress` = `[NEGATIVE_CASH,
   LOW_COVER]`; `warning→stable`, `distress→recovery`, `recovery→stable` = `[COVER_RESTORED]`;
   `distress→closed` = `[DISTRESS_DURATION, NEGATIVE_CASH]`.
4. **New leaf: zero-obligation, finite/JSON-safe causes.**

## Base and HEAD

`git rev-parse HEAD` at the start of this revision pass was `895df584514827ed3dd7b0a8163d1537da27f01c`
(the real-repo HEAD reported at the end of 1352-C); BASE for the scratch tree is unchanged
(`8cecfd62`), same tree reused, no re-archive. At the end of this revision, real-repo HEAD is
`3329b1f5223ed5f9caef722e37dc650ebc065e22`; the parent landed five untracked shelving-production
patch files under `1344-stage/` in the interim (not committed yet, visible as untracked in
`git status`), unrelated to this task. `git diff --stat` between the two HEADs on
`src/core/corporateCondition.ts`, `src/core/studioLoan.ts`, `src/core/tuning.ts`,
`tests/p15b1-corporate-condition.test.ts`, `tests/p15b1-studio-loan.test.ts` is empty; both modules
still do not exist. No drift on any of my target paths.

## Changes made in the scratch tree

### Ruling 1 — first-evaluation semantics

- `condition-transition-table`'s bootstrap assertions: `start.clearRun` changed from `0` to `1`.
  **Hand re-derivation, done independently rather than trusting the ruling's own claim:** the
  bootstrap call is `stepCondition(null, {week:0, cash:1_000_000, weeklyFixedCost:1000,
  loanInstallment:0})`. Per ruling 1, this steps from the zero condition using week 0's own facts:
  `O=1000`, `cover=1000`, `low=false` (`1000` is not `<4`), so `lowRun=0` (baseline 0, low false →
  stays 0), `negativeRun=0`, `clearRun = low?0:prev.clearRun+1 = 0+1 = 1` (a genuine increment from
  the zero baseline), `distressWeeks=0` (baseline stage was stable). No transition possible
  (`lowRun=0<4`). Matches the ruling's own claim exactly.
- **Confirmed by re-derivation (not merely asserted)** that this does not disturb any downstream
  sequence: every sequence in the file feeds week 1 as its first row, and every one of those rows
  is either negative or low-positive at week 1 (`low=true`), which unconditionally resets
  `clearRun` to `0` regardless of the bootstrap's own `clearRun` value (`clearRun =
  low?0:prev+1`). I grepped every sequence's first row across both files and confirmed none begins
  with a genuinely clear (`low=false`) week directly off the bootstrap; the worked example (warning
  at week 4, distress at week 8, closure at week 33) is therefore reproduced byte-for-byte as
  before.
- **New leaf** `condition-first-evaluation-negative-cash` (in a new describe block
  `first-evaluation semantics (1352-F2 ruling 1)`, placed after the preconditions block and before
  item 1): `stepCondition(null, {week:1, cash:-500, weeklyFixedCost:1000, loanInstallment:0})`.
  `O=1000`, `cover=-0.5`, `low=true`, `negative=true`. Baseline zero prev: all counters 0.
  `lowRun=0+1=1`, `negativeRun=0+1=1`, `clearRun=low?0:...=0`, `distressWeeks=0` (baseline stage
  stable, not distress). Transition check (`from=stable`): `lowRun>=4`? `1>=4` false → no
  transition. Matches 1352-F2's own stated values exactly (`lowRun 1, negativeRun 1, clearRun 0,
  no transition`).

### Ruling 2 — `distressWeeks` closed-included

- `condition-transition-table`'s closure assertion: `conditions[32].distressWeeks` changed from
  `26` to `0`, with a comment citing that the duration now lives only in the `DISTRESS_DURATION`
  cause (pinned in the new `condition-causes-bounded-closure-exact` leaf).
- The existing `condition-distress-weeks-exact` leaf already asserted `0` for the
  `distress→recovery` exit case (1352-C's own reading, now confirmed controlling by the ruling) —
  no change needed there beyond a citation comment.

### Ruling 3 — exact causes per row

Replaced the old bound-only `condition-causes-bounded-unambiguous-entry-causes` leaf (which pinned
only 2 of 7 rows, and used the now-superseded `floor(cover)` formula) with **six** new/expanded
leaves, each hand-derived below, reusing sequences already built and verified elsewhere in the file
rather than inventing new fixtures:

**`condition-causes-bounded-warning-entry-exact-both-branches`** (`stable→warning`, both branches
of the conditional `NEGATIVE_CASH`):
- Branch A (fully negative from week 1, `cash=-500`, `wfc=1000`): at week 4, `lowRun=4`,
  `negativeRun=4` (identical, since every low week here is also negative).
  `causes = [{LOW_COVER, 4}, {NEGATIVE_CASH, 4}]` (the conditional cause fires, `negativeRun=4>0`).
  **`LOW_COVER`'s value is `4`** (matches 1352-F2's own worked figure exactly, replacing the old,
  now-superseded `floor(cover)=-1`).
- Branch B (low-but-positive from week 1, `cash=2000`, `cover=2<4`, never negative): at week 4,
  `lowRun=4`, `negativeRun=0`. `causes = [{LOW_COVER, 4}]` only (conditional cause does not fire).

**`condition-causes-bounded-recovery-to-warning-exact-both-branches`** (`recovery→warning`, both
branches, the case 1352-F2's revision instruction names explicitly as "incl. the conditional
NEGATIVE_CASH"):
- Sequence: weeks 1-8 negative (distress at week 8) → week 9 breather (`cash=10,000`) →
  `distress→recovery` at week 9.
- Branch A: weeks 10-13 negative (`cash=-500`): `lowRun` and `negativeRun` both reset at the
  breather, then climb together `1,2,3,4`. At week 13: `lowRun=4, negativeRun=4`.
  `causes=[{LOW_COVER,4},{NEGATIVE_CASH,4}]`.
- Branch B: weeks 10-13 low-but-positive (`cash=2000`): `lowRun` climbs `1,2,3,4`; `negativeRun`
  stays `0` throughout. At week 13: `causes=[{LOW_COVER,4}]` only.

**`condition-causes-bounded-warning-to-distress-exact`**: fully negative from week 1, at week 8:
`negativeRun=8, lowRun=8`. `causes=[{NEGATIVE_CASH,8},{LOW_COVER,8}]` — **note the order is
reversed** from the warning-entry rows (`NEGATIVE_CASH` first here), exactly as 1352-F2's table
states.

**`condition-causes-bounded-clear-exits-exact`** (three rows, one leaf):
- `warning→stable`: 4 negative weeks (`cash=-100`, warning at week 4), then 4 clear weeks
  (`cash=10,000`). At week 8, `clearRun=4`. `causes=[{COVER_RESTORED,4}]`.
- `distress→recovery`: 8 negative weeks (distress at week 8), then clear weeks starting week 9.
  Week 9 is the first clear week, `clearRun=1`. `causes=[{COVER_RESTORED,1}]`.
- `recovery→stable`: continuing the same sequence, clear weeks 9 through 21 (13 clear weeks:
  `clearWeeks(13, ...)` generates exactly 13 rows, weeks 9-21 inclusive). `clearRun` reaches `13`
  on **week 21** (the 13th clear week, `9+12=21`), not week 22. `causes=[{COVER_RESTORED,13}]`.
  **This derivation caught and fixed a genuine off-by-one bug carried over from 1352-C's own r1
  draft of the sibling leaf `condition-recovery-declines-as-stable-13-clear-weeks-to-stable`** (see
  "Self-caught defects" below) — I built this leaf's causes assertions independently from the
  charter text, derived `week21`, and only then discovered the r1 sibling leaf asserted `week22`
  for the identical sequence. Cross-checked both against a disposable reference simulator (below)
  before fixing either.

**`condition-causes-bounded-closure-exact`**: fully negative from week 1 through week 33.
`negativeRun=33` (33 consecutive negative weeks, uninterrupted). The counter-step `distressWeeks`
baseline at week 33 is `26` (`prev.distressWeeks=25` at week 32, `+1`), read **before** the
transition resets `Condition.distressWeeks` to `0` per ruling 2.
`causes=[{DISTRESS_DURATION,26},{NEGATIVE_CASH,33}]`.

**`condition-causes-bounded-zero-obligation-finite-and-json-safe`** (ruling 4's new leaf; folded
into this describe block since it is a causes-shape leaf): `weeklyFixedCost=0, loanInstallment=0`
on every row (`O=0`), `cash=-500` for 4 weeks. `cover = O>0 ? ... : (cash>=0?+Inf:-Inf)`; since
`O=0` and `cash<0`, `cover=-Infinity` — the exact case 1352-F2 names as the motivation for
abandoning `floor(cover)`. `low` and `negative` are still both `true` (the boolean flags do not
change), so the run behaves identically to the wfc=1000 case in terms of transitions: warning at
week 4, `causes=[{LOW_COVER,4},{NEGATIVE_CASH,4}]`. Every `cause.weeks` is asserted
`Number.isFinite` and `Number.isInteger`, and `JSON.parse(JSON.stringify(transition))` is asserted
to deep-equal `transition` — a real round-trip, not a finiteness check alone, per the revision
instruction's exact wording.

The two other causes leaves (`condition-causes-bounded-at-most-five-and-typed`,
`condition-causes-bounded-public-projection-has-no-finance-number`) needed no change: the first is
a generic bound/type check that holds equally under the new duration-based formula; the second
checks `publicCondition`'s shape, unrelated to the causes formula.

## Self-caught defects (found during this revision, not requested by 1352-F2, disclosed per the
role's "expose the gap" mandate rather than silently carried forward)

Building the exact-causes leaves required computing precise week numbers for multi-week sequences
already present in the r1 file. Cross-checking those numbers against a disposable, from-scratch
reference simulator of the amended state machine (written fresh from the charter/ruling text, never
copied from — and never fed into — production or the test files; kept only in this session's
scratchpad, not committed) surfaced **two independent off-by-one bugs already present in 1352-C's
r1 draft**, in leaves the revision instruction did not ask me to touch ("no other leaf changes"):

1. **`condition-recovery-declines-as-stable-13-clear-weeks-to-stable`** (and this file's own new
   `condition-causes-bounded-clear-exits-exact`, which reused the identical sequence before I
   caught the bug) asserted the `recovery→stable` transition fires at **week 22** with
   `conditions[20].clearRun` = `12`. The correct values, given `clearWeeks(13, ...)` produces
   exactly 13 rows (weeks 9-21 inclusive, week 9 being the *first* clear week after
   `distress→recovery`), are: `clearRun=13` and the transition fires at **week 21**
   (`transitions[20]`, not `transitions[21]`, which is out of the 21-row array and was silently
   `undefined` — a `toEqual(expect.objectContaining(...))` against `undefined` would itself throw a
   distinct error, not silently pass, so this would have surfaced at GREEN time as a spurious
   failure against a correct implementation, not a false pass).
2. **`condition-distress-week-is-eighth-negative-distress-does-not-clear-on-low-positive-return`**
   asserted `conditions[17].distressWeeks` (week 18) = `10`. The correct value: `distressWeeks=1`
   at week 8 (entry), and weeks 9 through 18 are 10 further weeks (not 9), each incrementing by 1:
   `1+10=11`, not `10`.

Both are the same class of error (miscounting an inclusive week span by one) and both are now fixed
in the r2 patch, with an inline comment at each site explaining the correction and its discovery
method. **This is not requested by 1352-F2** and is reported here explicitly as a correction beyond
the four ruling-driven changes, per the task's standing instruction not to leave an unsupported
expectation in place once found, and not to silently patch it without disclosure.

### Reference-simulator verification (disposable, scratchpad-only)

I wrote a from-scratch JS reference implementation of `stepCondition` (rulings 1-3 as literally
stated, no production code read or copied) and ran every hand-derived transition/cause value in
this file's new and changed leaves against it, including the two extra defects above and nine
further sequences already present in the r1 file (the relapse pair, the closure-earliest-route
32-week case, the long-low-positive-then-negative 33-week case, and others). All checks passed
after the two corrections above. The simulator is not part of the handback (it is a verification
tool, not a deliverable, and was never imported by or copied into the test files); its existence
and method are disclosed here for reproducibility. Kept at this session's scratchpad path, not
committed to any repo.

## Files changed (scratch tree, same two files as 1352-C)

- `tests/p15b1-corporate-condition.test.ts`: 33 → **39 leaves** (net +6: +1 first-evaluation leaf,
  +6 new/expanded causes leaves, −1 removed bound-only causes leaf; the two off-by-one corrections
  changed values within existing leaves, not leaf count).
- `tests/p15b1-studio-loan.test.ts`: unchanged, **11 leaves** (no ruling touches the loan module).
- **50 leaves total** (was 44).

## RED run

Command (from the scratch tree, unchanged from 1352-C):

```
node_modules/.bin/vitest run --project core tests/p15b1-corporate-condition.test.ts tests/p15b1-studio-loan.test.ts
```

Result: **2 test files failed, 50 tests failed, 0 passed.** Same three RED-reason categories as
1352-C: 48 module-load failures (`Failed to load url ../src/core/corporateCondition.js` or
`../src/core/studioLoan.js`), 1 `ENOENT` on the direct source-text read
(`condition-owner-swap-and-determinism-module-imports-no-rng`), 1 genuine `TUNING` value mismatch
(`tuning-bounded-terms`). Full per-leaf mapping in
`1352-stage/1352-p15b1-red-r2-classification.json` (50 rows; leaf counts cross-checked against
`grep -c "  it("` on each file: 39 + 11 = 50, matching exactly).

## Type gate

`node_modules/.bin/tsc --noEmit -p tsconfig.json`: exit code 2, exactly the same two errors as
1352-C, no others:

```
tests/p15b1-corporate-condition.test.ts(74,24): error TS2307: Cannot find module '../src/core/corporateCondition.js' or its corresponding type declarations.
tests/p15b1-studio-loan.test.ts(29,24): error TS2307: Cannot find module '../src/core/studioLoan.js' or its corresponding type declarations.
```

## Patch verification

`git add -A tests` in the scratch tree staged exactly the two files (1,384 insertions total: 1,135
in the corporate-condition file, 249 unchanged in the loan file — confirmed the loan file's diff
against BASE is byte-identical to 1352-C's, since ruling changes only touch the condition module).
Temporary-index apply check against the **then-current real-repo HEAD**
(`3329b1f5223ed5f9caef722e37dc650ebc065e22`), scratch index only:

```
NOW=3329b1f5223ed5f9caef722e37dc650ebc065e22
SCRATCH_INDEX=$(mktemp)
GIT_INDEX_FILE=$SCRATCH_INDEX git read-tree $NOW
GIT_INDEX_FILE=$SCRATCH_INDEX git apply --cached --check 1352-stage/1352-p15b1-red-r2.patch
# APPLY-CHECK-EXIT=0
rm -f "$SCRATCH_INDEX"
```

Exit code 0. Real repo `git status --short` unchanged before and after (only the parent's own
untracked `1344-stage/` shelving-production patch files present, none of mine).

## Summary

- Files: `tests/p15b1-corporate-condition.test.ts` (39 leaves, was 33), `tests/p15b1-studio-loan.test.ts`
  (11 leaves, unchanged). **50 leaves total** (was 44).
- RED status: 50/50 failed, each for a stated, correct reason (48 module-load, 1 ENOENT, 1 genuine
  TUNING mismatch). 0 controls pass. Type gate: exactly 2 `TS2307` errors, unchanged from 1352-C.
- All four 1352-F2 rulings applied exactly as specified, with independent hand re-derivation (not
  trust) of every changed value, cross-checked against a disposable reference simulator.
- **Two self-caught off-by-one defects** in leaves the revision did not ask me to touch (both in
  1352-C's r1 draft: the 13-clear-weeks-to-stable week number, and the eighth-negative
  does-not-clear distressWeeks value) — found via the same simulator cross-check used to validate
  the new ruling-driven leaves, fixed, and disclosed above rather than left in place.
- Handback artifacts: `1352-stage/1352-p15b1-red-r2.patch` (tests only, applies cleanly to the
  then-current real-repo HEAD via a scratch index, verified),
  `1352-stage/1352-p15b1-red-r2-classification.json` (50 rows), this file.
