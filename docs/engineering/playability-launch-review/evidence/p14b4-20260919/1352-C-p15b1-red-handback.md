# 1352-C: P15B Wave 1 RED handback (the pure corporate condition law and the loan law)

Role: independent test engineer (test-author). Task: RED tests for P15B Wave 1
(`corporate-condition/v1` and `studio-loan/v1`), staged in a scratch tree per the
1327-C method. Brief: `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/
fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/brief-1352-p15b-red.md`.

## Authority read

- [1352-A](1352-A-p15b-corporate-condition-charter.md) §4 (the law) and §5 (the RED list).
- [1352-F](1352-F-parent-p15b-charter-adoption.md): Amendments 1-4 and the "RED list after
  adoption" — **governing over 1352-A wherever the two differ**, per the brief.
- [1352-B](1352-B-p15b-charter-review.md) (REFINE, four blocking defects) and
  [1352-B2](1352-B2-p15b-amendments-confirmation.md) (ACCEPT, confirmatory re-derivation of
  Amendments 1-4). I re-derived every worked example independently in this file's comments
  rather than trusting either review's arithmetic.
- Owner ruling 3, [1342-O](1342-O-owner-rulings-p14-p18-approved.txt) (failure after warnings
  and meaningful recovery opportunities, including contracted interest-bearing loans).
- [1352-W0](1352-W0-p15b-wave0-facts.md) §8: "A deterministic condition evaluation needs no RNG."
- Style/rigor models: `tests/p15a1-shared-market.test.ts` (landed) and the P15A.2 RED staging at
  `1351-stage/1351-p15a2-red-r4.patch` (per-leaf dynamic import pattern, `requireFn`/`requireValue`
  guards, hand-derived worked-example comments).

## Base verification

`git rev-parse HEAD` at start equaled the assigned base `8cecfd621b907dcea017f52b43b9e2cd540c47cf`
exactly, and `git status --short` showed only the pre-existing untracked
`1351-stage/1351-p15a2-red-r5.patch` (not mine, not touched). Confirmed `src/core/corporateCondition.ts`
and `src/core/studioLoan.ts` do not exist in that tree, and `src/core/tuning.ts` has no
`CORPORATE_*` or `LOAN_*` keys yet (`grep` came back empty).

At the end of this task, real-repo HEAD is `895df584514827ed3dd7b0a8163d1537da27f01c`. Between BASE
and this HEAD the parent landed seven commits (P15A.1 GREEN, P15A.2 Wave 1 production KEEP, a new
P15C charter):

```
895df584 docs(p15): P15C charter: 2040 freeze, campaignLegacy manifest, eight archetypes, ceremony, end-of-run dossier (1353-A)
51a66c1f docs(p15): P15A.2 Wave 1 landed: recorded GREEN 83/83 with P15A.1 at 1c1639dd; broad gates pending (1351-L)
1c1639dd docs(p15): POWER_RANKING_* TUNING comments state the tested ranges (1351-J item 1, wording per 1351-J2)
cea3c853 feat(p15): P15A.2 Wave 1 pure Power Ranking law power-ranking/v1 (1351-E/E2; reviews 1351-J, 1351-J2 KEEP)
8c6f2391 docs(p15): recorded RED run of P15A.2 Wave 1 at a9516d8d: 47 fail, 1 control passes, source fixed, guards exact
a9516d8d test(p15): P15A.2 Wave 1 RED r5, pure Power Ranking law (48 leaves; 1351-C5, reviewed 1351-D, 1351-J2)
d088d593 docs(p15): Power Ranking review items confirmed KEEP (1351-J2)
```

`git diff --stat 8cecfd62..895df584 -- src/core/corporateCondition.ts src/core/studioLoan.ts
tests/p15b1-corporate-condition.test.ts tests/p15b1-studio-loan.test.ts` is **empty**: none of my
four target paths changed, and both modules still do not exist at HEAD (`git show
895df584:src/core/corporateCondition.ts` and `...studioLoan.ts` both fail with "does not exist").
`tuning.ts` gained no `CORPORATE_*`/`LOAN_*` keys either (only `POWER_RANKING_*` comment wording
changed, per `1c1639dd`, unrelated to this task). This matches 1352-A §8's stated order: "Wave 1
production queues behind them [P15A.2 revision, shelving, slice A]." No drift on my target paths.
I never wrote anything into the real repo's `tests/` directory; only the three handback files
named at the end of this record.

## Method actually used

Ran the 1327-C scratch method exactly as given in the brief, no deviation:

```
BASE=8cecfd621b907dcea017f52b43b9e2cd540c47cf
T=/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1352-work/tree
mkdir -p $T && cd /Users/zacheryspector/The-Movies-headless-program
git archive $BASE src bridge ui generated scripts package.json package-lock.json tsconfig.json tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md | tar -x -C $T
git archive $BASE tests ':!tests/fixtures' | tar -x -C $T
for d in docs node_modules art tools; do ln -s /Users/zacheryspector/The-Movies-headless-program/$d $T/$d; done
ln -s /Users/zacheryspector/The-Movies-headless-program/tests/fixtures $T/tests/fixtures
cd $T && git init -q && git add -A . && git commit -q -m base
```

Used dynamic per-test import (`loadCondition()` / `loadLoan()`), not a static top-level import,
per the 1346-C precedent cited in the brief's PITFALLS section: a static
`import * as mod from '../src/core/corporateCondition.js'` fails the whole file at Vite collection
time with one undifferentiated error; a dynamic import inside each test body gives each leaf its
own attributed failure. `requireFn`/`requireValue` guard against a missing named export binding to
`undefined` once the module partially exists (not yet exercised here, since the module is wholly
absent).

## Files written (scratch tree only, plus the patch below)

- `tests/p15b1-corporate-condition.test.ts` (33 leaves): module surface and `stepCondition`
  preconditions (3, additional to the numbered list — see below); `condition-transition-table` (1);
  `condition-distress-weeks-exact` (1a); `condition-no-single-week-skip` (2, 2 leaves);
  `condition-one-bad-film` (3); `condition-distress-after-warning` (4, 2 leaves);
  `condition-recovery-declines-as-stable` (5 replaced, 2 leaves); `condition-no-single-week-distress`
  (5b, 2 leaves); `condition-closure` (6, 4 leaves); `condition-owner-swap-and-determinism` (7,
  2 leaves); `condition-causes-bounded` (8, 3 leaves); `remedies-two-routes` (9, 5 leaves including
  the rival-shaped-capability addition and the loan-zero-fixed-cost addition); `loan-obligation-in-cover`
  (13, 2 leaves — `coverWeeks` is exported from `corporateCondition.ts` per the pinned API, despite
  the loan theme); `condition-distress-week-is-eighth-negative` (15, 3 leaves).
- `tests/p15b1-studio-loan.test.ts` (11 leaves): module surface (1); `loan-eligibility` (10,
  4 leaves); `loan-principal` (11, 3 leaves including the zero-fixed-cost addition);
  `loan-schedule-exact` (12, 2 leaves); `tuning-bounded-terms` (14, 1 leaf covering the full §4.5
  table plus the installment-exactness bound).

**44 leaves total.** Item-to-leaf mapping, exact leaf names, and cited requirement per leaf are in
`1352-stage/1352-p15b1-red-classification.json` (44 rows).

### Coverage against the assigned RED list

Items 1, 1a, 2, 3, 4, 5 (replaced), 5b, 6, 7, 8, 9 (+ rival-shaped capability), 10, 11 (+
loan-zero-fixed-cost), 12, 13, 14 (+ installment-exactness bound), 15 — all present, each with at
least one leaf, several with more than one to isolate distinct sub-claims (e.g. item 6's "at
exactly 26", "never non-negative", "absorbing", and "earliest route" are four separate leaves
rather than one, so a partial implementation failure attributes to the specific sub-claim it
breaks).

**Addition beyond the numbered list**, disclosed plainly rather than folded into a numbered leaf's
name: three leaves exercising `stepCondition`'s precondition/throw contract from the brief's own
PARENT API DECISIONS text (non-sequential week, non-finite/negative facts) — no item in 1352-A §5
or 1352-F names this contract directly, but it is the money/state-machine trust boundary and is
pinned in as much literal detail as any numbered item, so it is exercised as a money/security-path
validation the ponytail brief's own "never simplify away" rule covers. Classified honestly in the
JSON as "additional to the numbered RED list," not attributed to a specific item number.

## Bootstrap convention — a documented interpretation, not a silent assumption

The PARENT API DECISIONS text says `prev === null` gives "stage stable, all counters 0, since =
facts.week" but does not say whether that call's own `facts.cash`/`weeklyFixedCost` are themselves
counted that week. Read literally as "this call never runs the counter/transition logic, only
initializes," the only way to reproduce 1352-F's own worked example ("cash negative from week 1:
warning at week 4 ... distress at week 8 ... closes [at week 33]") is for the null-prev call to be
a **bootstrap at week 0** (a registration tick, forced to `stable`/all-zero regardless of its own
facts) with the real counted sequence starting at week 1's call. Every sequence in both test files
uses `bootstrap()` at week 0 with a neutral, healthy fact (`cash=1,000,000, weeklyFixedCost=1000,
loanInstallment=0`) before feeding the sequence under test starting at week 1. This is treated as
load-bearing (it is the only reading that reproduces the charter's own numeric worked example), and
is disclosed here as an interpretation of an API decision that is not itself 100% explicit, per the
task's instruction to flag rather than silently resolve such gaps.

## `distressWeeks` outside the distress stage — a second interpretation, disclosed

1352-F Amendment 1 states the baseline formula as `distressWeeks = prev.stage===distress ?
prev.distressWeeks+1 : 0`, read relative to **`prev.stage`**, and states that a transition *into*
distress overrides the result to 1. It does not explicitly state the stored value when a
transition **out of** distress fires in the same week (e.g. `distress -> recovery`): a literal
reading of the baseline formula alone would carry over a stale, now-meaningless count (e.g. `2` in
my worked example below) into a Condition whose current stage is `recovery`. Since `distressWeeks`
is defined as "evaluated weeks since entering **distress**" (1352-A §4.2, un-amended by 1352-F) and
every sibling counter (`lowRun`, `negativeRun`, `clearRun`) resets to 0 on its own non-matching
predicate, this suite asserts `next.distressWeeks === 0` whenever `next.stage !== 'distress'` (see
`condition-distress-weeks-exact`, the value at week 9 after the `distress -> recovery` transition).
This is the test author's determination, not literally spelled out by 1352-A/1352-F/1352-B2; it is
the only reading consistent with the field's own definition and with how every other counter in the
same table behaves, so it is asserted rather than left as a bound-only check, but it is flagged
here as an interpretation, not copied from an explicit authority sentence.

## `ConditionTransition.causes` — which codes attach to which row, partially derived

1352-A §4.2 lists four cause codes and their `weeks` formula but does not give an explicit
per-transition-row mapping beyond what is unambiguously implied by each row's own predicate.
`condition-causes-bounded-unambiguous-entry-causes` pins only the two rows where the mapping is
unambiguous from the row's own condition text: `LOW_COVER {weeks: floor(c)}` on the
stable/recovery→warning rows (the predicate is literally "low cover sustained"), and
`NEGATIVE_CASH {weeks: negativeRun}` on the warning→distress row (the predicate is literally
"negativeRun ≥ 8"). For the remaining rows (the two clear/cover-restored exits, and the
distress→closed row, which plausibly carries both `DISTRESS_DURATION` and `NEGATIVE_CASH`), this
suite asserts only the general bound and code-membership (`condition-causes-bounded-at-most-five-and-typed`),
not an exact code list, precisely to avoid inventing an unproven mapping. **Finding, not silently
resolved:** the charter should either state the full per-row cause mapping or explicitly delegate it
as an implementation detail; right now a correct implementation choosing, say, `[COVER_RESTORED]`
vs. `[COVER_RESTORED, DISTRESS_DURATION]` on the `distress→recovery` row cannot be distinguished
from an incorrect one by this suite alone.

## Hand derivations (week-by-week tables, independent of any implementation)

All sequences use `weeklyFixedCost = 1000` unless noted (so `O = 1000` with no loan, `cover c =
cash/1000`, `low` iff `cash < 4000`, `negative` iff `cash < 0`).

**Fully negative from week 1 (`cash = -500` every week), the charter's own worked example,
reproduced independently:**

| Week | lowRun | negativeRun | clearRun | distressWeeks | Stage after this week |
|---|---|---|---|---|---|
| 1 | 1 | 1 | 0 | 0 | stable |
| 2 | 2 | 2 | 0 | 0 | stable |
| 3 | 3 | 3 | 0 | 0 | stable |
| 4 | 4 | 4 | 0 | 0 | **warning** (stable→warning, lowRun≥4) |
| 5 | 5 | 5 | 0 | 0 | warning |
| 6 | 6 | 6 | 0 | 0 | warning |
| 7 | 7 | 7 | 0 | 0 | warning |
| 8 | 8 | 8 | 0 | **1** | **distress** (warning→distress, negativeRun≥8; override) |
| 9 | 9 | 9 | 0 | 2 | distress |
| ... | ... | ... | ... | week−7 | distress |
| 25 | 25 | 25 | 0 | 18 | distress |
| 32 | 32 | 32 | 0 | 25 | distress |
| 33 | 33 | 33 | 0 | 26 | **closed** (distress→closed, distressWeeks≥26 and negative) |

Matches 1352-F's own claim exactly: warning at week 4, distress at week 8 (`distressWeeks=1`),
closure at week 33 (`distressWeeks=26`, 33 consecutive negative weeks).

**Relapse (`condition-distress-weeks-exact`, `condition-recovery-declines-as-stable`): weeks 1-8
negative (distress at week 8) → week 9 `cash=10,000` (cover=10, not low) → `distress→recovery` at
week 9, `distressWeeks→0` (see the interpretation note above) → weeks 10-13 `cash=2,000` (cover=2,
low, not negative): `lowRun` 1,2,3,4 → `recovery→warning` at week 13 (Amendment 2's replaced row) →
weeks 14-21 `cash=-500`: `negativeRun` 1..8 → `warning→distress` at week 21, `distressWeeks`
**restarts at 1** (not 9).**

**Short relapse that stays in warning (`condition-recovery-declines-as-stable`,
`condition-no-single-week-distress`): weeks 1-8 negative → week 9 breather (`cash=10,000`) →
recovery → weeks 10-13 negative (`cash=-500`, 4 weeks): `lowRun` 1,2,3,4 → `recovery→warning` at
week 13, `negativeRun=4<8` there, so stage is `warning`, never `distress`.** Continuing the same
streak to 8 weeks (weeks 10-17) reaches `distress` again only at week 17 (`negativeRun=8`), not at
week 13 — the relapse never "jumps" straight from `recovery` to `distress` in one step (Amendment 2
explicitly removes that old row).

**13 clear weeks to stable: weeks 1-8 negative (distress at week 8) → week 9 `cash=10,000` →
`distress→recovery` at week 9, `clearRun=1` → weeks 10-21, `clearRun` 2..12 → week 22, `clearRun=13`
→ `recovery→stable`.**

**Loan schedule, smallest total (`principal=1000, weeklyFixedCost=1000`):** `total = 1000 +
1000×0.12 = 1,120`. `term=52`. `floor(1120/52)=21` (`52×21=1,092`); `remainder = 1120−1092 = 28`.
Installments `i=0..27` (28 of them) get `21+1=22`; `i=28..51` (24 of them) get `21`.
`28×22 + 24×21 = 616 + 504 = 1,120` ✓.

**Loan schedule, boundary `total mod term = 0` (`principal=13,000, weeklyFixedCost=1000`, still
≤ max=26,000):** `total = 13,000×1.12 = 14,560`. `14,560 / 52 = 280` exactly (`52×280=14,560`,
remainder 0). All 52 installments are `280`.

**`loanMaxPrincipal` boundary:** `wfc=38 → floor(26×38/1000)×1000 = floor(0.988)×1000 = 0`
(ineligible); `wfc=39 → floor(26×39/1000)×1000 = floor(1.014)×1000 = 1,000` (exactly at the
`LOAN_AMOUNT_STEP` floor, eligible per Amendment 4's `max ≥ LOAN_AMOUNT_STEP`).

**Installment-exactness bound (1352-F note):** `LOAN_AMOUNT_STEP × (100 + LOAN_INTEREST_PERCENT) /
100 = 1000 × 112 / 100 = 1,120 ≥ LOAN_TERM_WEEKS (52)` — matches the smallest-total derivation
above exactly (`1,120` is both numbers independently).

## RED run

Command (from the scratch tree):

```
node_modules/.bin/vitest run --project core tests/p15b1-corporate-condition.test.ts tests/p15b1-studio-loan.test.ts
```

Result: **2 test files failed, 44 tests failed, 0 passed.** Every leaf failed for a stated reason:

- 42 leaves: `Error: Failed to load url ../src/core/corporateCondition.js` or
  `../src/core/studioLoan.js` `(resolved id: ...) in <the leaf's own test file>. Does the file
  exist?` — the module genuinely does not resolve (verified: no cross-file importer-attribution
  artifact this time, unlike 1346-C's identical-specifier case, because the two files import two
  distinct, both-nonexistent specifiers; each leaf's reported importer path is its own file).
- 1 leaf (`condition-owner-swap-and-determinism-module-imports-no-rng`): `Error: ENOENT: no such
  file or directory, open '.../src/core/corporateCondition.ts'` — this leaf reads the module's
  source text directly (not via import) to check for RNG usage once the module exists; at RED it
  correctly fails because the file does not exist yet, a distinct genuine reason from the
  load-failure leaves.
- 1 leaf (`tuning-bounded-terms`): `AssertionError: expected undefined to be 4` — never imports
  either missing module; only reads the real, already-existing `TUNING` object, which does not yet
  carry `CORPORATE_WARN_COVER_WEEKS` or any other `CORPORATE_*`/`LOAN_*` key.

Full per-leaf mapping (file, leaf name, cited requirement section, `redStatus`, exact `redReason`)
is in `1352-stage/1352-p15b1-red-classification.json` (44 rows, validated as parseable JSON with a
`python3 -m json.tool`-equivalent load; leaf counts per file cross-checked against `grep -c "  it("`
on each source file: 33 + 11 = 44, matching exactly).

## Type gate

Command: `node_modules/.bin/tsc --noEmit -p tsconfig.json` (root gate; neither new file matches the
`tsconfig.json` excludes, which only skip `tests/bridge*.test.ts`, `tests/r3n1-*.test.ts`, and one
named fixture). Exit code 2 (non-zero, errors present). Exactly two errors, both and only from the
two missing modules, one per new file:

```
tests/p15b1-corporate-condition.test.ts(43,24): error TS2307: Cannot find module '../src/core/corporateCondition.js' or its corresponding type declarations.
tests/p15b1-studio-loan.test.ts(29,24): error TS2307: Cannot find module '../src/core/studioLoan.js' or its corresponding type declarations.
```

No other errors. Matches the brief's expectation exactly.

## Patch verification

`git add -A tests` in the scratch tree staged exactly the two new files (1,150 insertions, 0
deletions, 2 files changed); `git status --short` showed nothing else staged or untracked outside
those two paths. `git diff --cached` was written to
`1352-stage/1352-p15b1-red.patch` (1,162 lines).

Temporary-index apply check against the **then-current real-repo HEAD**
(`895df584514827ed3dd7b0a8163d1537da27f01c`, checked at the end of this task per the brief's
instruction, not the stale BASE), scratch index only, never the real repo's index:

```
NOW=895df584514827ed3dd7b0a8163d1537da27f01c
SCRATCH_INDEX=$(mktemp)
GIT_INDEX_FILE=$SCRATCH_INDEX git read-tree $NOW
GIT_INDEX_FILE=$SCRATCH_INDEX git apply --cached --check 1352-stage/1352-p15b1-red.patch
# APPLY-CHECK-EXIT=0
rm -f "$SCRATCH_INDEX"
```

Exit code 0. `git status --short` in the real repo was empty immediately afterward (confirmed both
before and after the check).

## Tolerances and helper conventions

- No floating-point `toBeCloseTo` tolerances anywhere in either file: every quantity in this law is
  integer arithmetic over integer inputs (cash/weeklyFixedCost/loanInstallment chosen as whole
  numbers in every fixture except the two deliberately-fractional `coverWeeks` leaves, which assert
  exact rational results — `4.5`, `5`, `4` — all exactly representable in float64 for the chosen
  inputs). `Object.is`/`toBe` equality is used throughout.
- `canonicalJSON`/`canonicalize` helpers (copied verbatim from the p15a1/p15a2 precedent) back the
  one determinism leaf (`condition-owner-swap-and-determinism-identical-facts-give-identical-output`);
  not otherwise used, since no other leaf needs structural/order-independent comparison.
- No explicit timeout overrides: every leaf here is a short, bounded sequence (at most 60 simulated
  weeks of pure function calls), well inside the core project's 5 s default.

## Not executed / out of scope

No broad suite was run (only the two new files under `--project core`, plus the root `tsc --noEmit`
type gate, per the brief). No production code was written or modified anywhere. No save/Bridge/UI
code is touched (Wave 1 is pure by charter §3; Wave 2 integration is explicitly out of scope). No
native input or runtime slot was used or needed for this task.

## Summary

- Files: `tests/p15b1-corporate-condition.test.ts` (33 leaves), `tests/p15b1-studio-loan.test.ts`
  (11 leaves). **44 leaves total.**
- RED status: 44/44 failed, each for a stated, correct reason (42 missing-module load failures, 1
  missing-module ENOENT on a direct source-text read, 1 genuine TUNING value mismatch). 0 controls
  pass. Type gate: exactly 2 errors, both `TS2307 Cannot find module`, one per file, no other
  errors.
- Findings (none contradict 1352-A/F; all are documented interpretation gaps, not defects):
  1. the null-prev bootstrap week is interpreted as week 0 with forced-neutral facts, the only
     reading that reproduces 1352-F's own worked example;
  2. `distressWeeks` is asserted to reset to 0 whenever the current stage is not `distress`,
     consistent with the field's own definition and every sibling counter's behavior, but not
     stated verbatim by 1352-A/F;
  3. `ConditionTransition.causes` is pinned exactly only for the two unambiguous rows (warning
     entry: `LOW_COVER`; distress entry: `NEGATIVE_CASH`); the remaining rows are bound-only
     (≤5, typed codes), because the charter does not give a full per-row cause mapping — this is
     reported as an open charter gap, not silently resolved.
- Handback artifacts: `1352-stage/1352-p15b1-red.patch` (tests only, applies cleanly to the
  then-current real-repo HEAD via a scratch index, verified), `1352-stage/1352-p15b1-red-classification.json`
  (44 rows), this file.
