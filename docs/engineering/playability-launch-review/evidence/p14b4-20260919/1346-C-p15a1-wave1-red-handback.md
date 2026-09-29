# 1346-C: P15A.1 Wave 1 RED handback (the pure shared-market law)

Role: independent test engineer (test-author). Task: RED tests for P15A.1 Wave 1, staged in a
scratch tree per the 1327-C method. Brief: /private/tmp/claude-501/
-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/
brief-1346-p15a1-red.md.

## Authority read

- [1323-A](1323-A-p15a1-wave0-and-wave1-charter.md) §3 (the law `p15a1-market-v1`) and §4 (the
  test list), §5 (order).
- [1323-F](1323-F-parent-p15a1-charter-adoption.md): Amendment 3 (the harness assertions in
  operational form) and the "Note adopted" eligibility restatement.
- [1340-O](1340-O-owner-rulings-20260929.md) D-1323-1: the Owner's approval of the complete
  1323-A formula as amended by 1323-F, closing the formula decision; constants remain provisional
  tuning with a planned Wave 4 KEEP/REVISE/REJECT playtest.

## Base verification

`git rev-parse HEAD` at start equaled the assigned base `ea65e796de37e11170c5123e3f4495368b9d5956`
exactly, and `git status --short` was clean. Confirmed `src/core/sharedMarket.ts` does not exist
in that tree (`ls` failed with "No such file or directory").

At the end of this task, real-repo HEAD is `8b984d12cf6d52670cdba82c3dc52c78abed8b59`, and
`git status --short` is clean (no local changes; I never edited anything in the real repo except
the three handback files named below). Between BASE and this HEAD the parent committed seven
records, as the brief anticipated ("the parent may commit records meanwhile"):

```
8b984d12 test(ui): identity-review fake view models hollywoodPerformance, ending gate 1343's unhandled error (U3, 1349-E); review 1349-D ACCEPT
6d5ae7fc docs(p14): close U2 as test-harness stabilization (1341-K); handoff CURRENT: Pillow scoped, Save42 inputs minted, three REDs in staging
c2140944 test(p14): mint genuine outgoing Save42 rival-stall inputs (weeks 100, 130) at the last Save42 writer before shelving moves it (1344-P, recorded run)
19a31f73 docs(p14): gate review 1343-J REFINE answered (1343-F); producer review ACCEPT (1344-PB) and dry run (1344-X); U3 plan and scratch dry run with reproduction (1349-A)
f5b2ab92 docs(p14): 1347-F addendum: one projection step, in slice B
ccd53bf3 docs(p14): relationship charter review REFINE (1347-B) and parent adoption (1347-F): Mentor rests on the cohort receipt; D5 keeps its shipped order
6190cd15 chore(env): scoped project-local Pillow 12.3.0 for the image tests per Owner ruling 1 (1345-E); 8 of 11 image rows pass, 3 need numpy (not authorized)
```

`git diff --stat ea65e796..8b984d12 -- src tests ui bridge` shows exactly one file under those
four roots: `ui/src/lot/StudioLotIdentityReview.test.tsx` (+3 lines), inside the `8b984d12` commit
above (U3, "ending gate 1343's unhandled error"). That is the parent's own concurrent UI work, not
mine; my scratch tree and my writes to the real repo never touched `ui/`. Reporting this plainly
rather than silently asserting zero drift, per the brief's instruction to check this window.

## Method actually used

Ran the 1327-C scratch method exactly as given in the brief, no deviation:

```
BASE=ea65e796de37e11170c5123e3f4495368b9d5956
T=/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1346-work/tree
mkdir -p $T && cd /Users/zacheryspector/The-Movies-headless-program
git archive $BASE src bridge ui generated scripts package.json package-lock.json tsconfig.json tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md | tar -x -C $T
git archive $BASE tests ':!tests/fixtures' | tar -x -C $T
for d in docs node_modules art tools; do ln -s /Users/zacheryspector/The-Movies-headless-program/$d $T/$d; done
ln -s /Users/zacheryspector/The-Movies-headless-program/tests/fixtures $T/tests/fixtures
cd $T && git init -q && git add -A . && git commit -q -m base
```

Before writing the real tests I ran three disposable probes in the scratch tree (`tests/_probe*.test.ts`,
deleted immediately after each, never staged) to establish the exact RED mechanics for a wholly
missing module (not merely a missing named export from an existing module, which is what the
brief's cited pitfall literally describes):

1. A static top-level `import * as market from '../src/core/sharedMarket.js'` makes the WHOLE FILE
   fail at Vite collection time (`Failed to load url ... Does the file exist?`), reported as one
   "Failed Suite" with 0 tests collected, not a per-leaf failure.
2. A dynamic `await import('../src/core/sharedMarket.js')` inside a test body rejects with the same
   error text, but scoped to that one test; sibling tests in the same file that do not touch the
   import still run and are independently attributable.
3. Confirmed the exact rejection text via a `try/catch` probe logging `String(err)`.

Given (1) versus (2), I used dynamic per-test import (`loadMarket()` inside each test body) rather
than the brief's literally-quoted `import * as market from ...` static form, so every leaf gets its
own attributed failure (27 individually attributed FAILs) instead of one collection-level cascade
that would make the classification JSON's 27 rows redundant. This is a deliberate improvement on
the pitfall's stated mechanism, not a departure from its intent (loud, correctly-attributed,
per-leaf failure; `requireFn` still guards against a missing NAMED export binding to `undefined`
once the module partially exists). The one exception is `market-tuning-bounded-terms`, which
imports only the real, already-existing `TUNING` from `src/core/tuning.ts` and never touches the
missing module at all, so it gets its own genuine value-mismatch RED reason rather than a load
failure.

Observed Vite quirk, reported for reproducibility: when BOTH test files run in the same process
(the brief's specified command), every "Failed to load url ... in <importer>" message in the
combined run's output names `tests/p15a1-shared-market-harness.test.ts` as the importer, even for
leaves that are actually in `tests/p15a1-shared-market.test.ts` (both files import the identical
unresolved specifier `../src/core/sharedMarket.js`, and Vite appears to cache/reuse the failed
resolution's error object across importers within one run). Running `tests/p15a1-shared-market.test.ts`
alone reproduces the correct self-referencing path. Verified directly:

```
$ vitest run --project core tests/p15a1-shared-market.test.ts
  → Failed to load url ../src/core/sharedMarket.js (resolved id: ../src/core/sharedMarket.js) in
    .../tests/p15a1-shared-market.test.ts. Does the file exist?
```

The underlying cause and error text are identical either way (module genuinely does not resolve);
only the echoed importer path differs. The classification JSON's `redReason` field uses the literal
error text with the importer path elided as `<importer>`, since it is a run-order artifact of the
combined command, not part of the substantive failure. The full raw captured output (with real
paths) is preserved at `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/
fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1346-work/vitest-red-output.txt` in this session's
scratchpad (not copied into the repo; ephemeral session evidence, reproducible by rerunning the
command below against the scratch tree).

## Files written

- `tests/p15a1-shared-market.test.ts` (25 leaves): definition export, `exposureWeight` lanes and
  boundaries, `pressureFactor` bounds/zero/preconditions/worked examples, `assessBatch` symmetry
  (one-player-one-rival, owner-swap, id-swap, order-reversal, same-week-batch, different-genre),
  the per-studio clamp, the five-reason cap, the large-batch structural-size invariant, a small-scale
  step-counter sanity check, `reduceExposures` (append, retire boundary, lane transition), and two
  assessment-shape invariants (input digest, pressure decomposition), plus the TUNING bounded-term
  test.
- `tests/p15a1-shared-market-harness.test.ts` (2 leaves): the pure 6,240-week normal-stream harness
  (bounded active set by recount from an independent release log, plus determinism across two full
  runs) and the hostile-batch harness (64 studios, 512-member batch, 4,000 active exposures: the
  step-counter work bound, bounded active set, and determinism).

Both files exist only in the scratch tree
(`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1346-work/tree/tests/`)
and as the patch below; nothing was written into the real repo's `tests/` directory.

## RED run

Command (exactly the brief's, run from the scratch tree):

```
node_modules/.bin/vitest run --project core tests/p15a1-shared-market.test.ts tests/p15a1-shared-market-harness.test.ts
```

Result: **2 test files failed, 27 tests failed, 0 passed.** Every leaf failed for a stated reason:

- 26 leaves: `Error: Failed to load url ../src/core/sharedMarket.js (resolved id:
  ../src/core/sharedMarket.js) in <importer>. Does the file exist?` (the module genuinely does not
  exist; not a vacuous pass from a missing-named-export binding to `undefined`, since the whole
  specifier fails to resolve).
- 1 leaf (`market-tuning-bounded-terms`): `AssertionError: expected undefined to deeply equal [ 1,
  0.55, 0.55, 0.2 ]` — a distinct, genuine value-mismatch RED reason, since this leaf never imports
  the missing module (it only reads the real, already-existing `TUNING` object, which does not yet
  carry the seven `SHARED_MARKET_*` keys).

Full per-leaf mapping (file, leaf name, cited requirement, exact redReason) is in
`1346-stage/1346-p15a1-red-classification.json` (27 rows, one per leaf, validated as parseable
JSON with `python3 -m json.tool`-equivalent load).

## Type gate

Command: `node_modules/.bin/tsc --noEmit -p tsconfig.json` (root gate; neither new file matches the
`tsconfig.json` excludes, which only skip `tests/bridge*.test.ts`, `tests/r3n1-*.test.ts`, and one
named fixture). Exit code 2. Exactly two errors, both and only from the missing module, one per new
file:

```
tests/p15a1-shared-market-harness.test.ts(23,24): error TS2307: Cannot find module '../src/core/sharedMarket.js' or its corresponding type declarations.
tests/p15a1-shared-market.test.ts(40,24): error TS2307: Cannot find module '../src/core/sharedMarket.js' or its corresponding type declarations.
```

No other errors. This matches the brief's expectation ("expect only errors from the missing
module; list them exactly").

## Patch verification

`git diff --cached` in the scratch tree (after `git add -A tests`) touches only the two new test
files (746 insertions, 0 deletions, 2 files changed); `git status --short` in the scratch tree
showed nothing else staged or untracked outside those two paths. Confirmed the patch applies
cleanly to BASE via a scratch index (never the real repo's index):

```
BASE=ea65e796de37e11170c5123e3f4495368b9d5956
SCRATCH_INDEX=$(mktemp)
GIT_INDEX_FILE=$SCRATCH_INDEX git read-tree $BASE
GIT_INDEX_FILE=$SCRATCH_INDEX git apply --cached --check 1346-stage/1346-p15a1-red.patch
# APPLY-CHECK-EXIT=0
rm -f "$SCRATCH_INDEX"
```

Exit code 0. The real repo's `git status --short` was empty immediately afterward.

## Findings against the API decisions (not silently adapted)

The brief's PARENT API DECISIONS section left two shapes unpinned. Both are choices this test suite
had to commit to (since "tests import exactly these; production will implement them"), and both are
reported here rather than silently assumed:

1. **`exposureWeight` at the retired lane.** The brief pins `lane: 'window' | 'stock' | 'retired'`
   and the three lane boundaries, but never states the `weight` value once `lane === 'retired'`.
   I assert `weight === 0` (a retired release contributes nothing to any weighted sum built from
   it), in `market-decay-boundaries-r25-r26`. This is the only reading consistent with "retired"
   meaning "no longer counted," but it is not literally written in 1323-A/F.
2. **`MarketReason` field shape.** The brief states the five codes and "each with source release ids
   and values" but not the exact field names. I committed to `{ code, sourceReleaseIds: string[],
   value: number }` throughout. A different field-name choice by the parent (e.g. `releaseIds` or
   `sourceIds`) would make every reason-content assertion fail even with a semantically correct
   implementation; the tests only assert `.code` strictly against the pinned five-value enum and do
   not otherwise depend on the exact field names beyond existence, except where a reason count is
   asserted.
3. **`reduceExposures` transition reference point.** 1323-F says the reducer "reports lane
   transitions" without stating what `from` is relative to. I assume `from` = the lane at
   `(batch.week - 1)` and `to` = the lane at `batch.week`, computed purely from `releaseWeek` and
   the two week numbers (no dependency on prior calls). This is the only definition that stays pure
   and well-defined for a single `reduceExposures` call regardless of how many weeks were skipped
   since the previous call. Asserted in `market-reduce-exposures-lane-transition`.

No contradiction of 1323-A/F or the Owner text was found; D-1323-1 in 1340-O matches 1323-A §3 as
amended by 1323-F verbatim (four-week weights, stock start/half-life/retirement, per-studio cap,
factor formula), and every numeric worked example in the tests reproduces the Owner-approved text.

## Tolerances chosen, and why

- **`toBeCloseTo(x, 9)`** for any comparison where both sides come from the identical closed-form
  expression (e.g. `pressureFactor(P)` vs. the test's own `expectedFactor(P)`, or `windowTerm +
  stockTerm` vs. `pressure`). Nine decimal digits is far tighter than IEEE-754 double rounding noise
  for the value ranges involved (0 to a few dozen), so this is effectively an exactness check, not
  an approximation.
- **`toBeCloseTo(prose, 2)`** for the three worked examples 1323-A §3 states in prose to two decimals
  ("about 0.90 ... 0.84 ... 0.78"). `toBeCloseTo(x, 2)` allows +/-0.005, which is exactly the
  precision the prose itself claims; a tighter tolerance here would be asserting more precision than
  the cited authority text actually states.
- **`toBeLessThan(3000)`** (characters) as the JSON-size ceiling in `market-large-batch-linear-storage`.
  Chosen generously above any plausible real record: 5 reasons (the stated cap) at roughly 100-150
  characters each for `{code, sourceReleaseIds, value}` plus 10 scalar/short-string fields
  (`releaseId, studioId, genre, week, definitionVersion, pressure, factor, windowTerm, stockTerm,
  inputDigest`) is on the order of 900-1000 characters; 3000 leaves comfortable headroom while still
  falsifying any O(n) per-assessment growth (a 512-member co-batch list embedded per record would
  blow past it by orders of magnitude). I did not attempt byte-for-byte equality between the 32- and
  512-member records, because the formula legitimately produces different pressure/digest values at
  different batch densities (more same-genre peers at 512 members) — equal byte length is not a
  guarantee the API makes; the structural invariants (identical key set, every array-valued field
  capped at 5) are the ones I could justify from the cited text, plus the ceiling as the operational
  form of "independent of batch size."
- **20,000 ms explicit test timeout** on `market-harness-normal-stream-bounded-active-set-and-determinism`
  only (the core project's default is 5,000 ms; no config file was touched). This leaf drives the
  pure law over two full 6,240-week runs (12,480+ `reduceExposures` calls plus one `assessBatch`
  call per release week across both runs). I do not know the eventual production implementation's
  constant factor, so 20 s is explicit headroom chosen without a measurement, not a performance
  requirement; it is documented in the test file itself at the call site. No other leaf received an
  override; the hostile-batch leaf is a single `assessBatch` call over 4,000 exposures and 512
  members and is expected to fit the 5 s default once implemented.

## Not executed / out of scope

No broad suite was run (only the two new files under `--project core`, plus the root `tsc --noEmit`
type gate, per the brief). No production code was written or modified. No save/Bridge/UI code is
touched by these tests (Wave 1 is pure by charter; Wave 2 integration is explicitly out of scope
per the brief).

## Summary

- Files: `tests/p15a1-shared-market.test.ts` (25 leaves), `tests/p15a1-shared-market-harness.test.ts`
  (2 leaves). 27 leaves total.
- RED status: 27/27 failed, each for a stated reason (26 missing-module load failures, 1 genuine
  TUNING value mismatch). Type gate: exactly 2 errors, both `TS2307 Cannot find module
  '../src/core/sharedMarket.js'`, one per file, no other errors.
- Findings: two API-shape assumptions not pinned by the brief (`exposureWeight` retired-lane weight;
  `MarketReason` field names) and one reducer semantics assumption (`reduceExposures` transition
  reference point), all documented above and in the test file comments; no contradiction of
  1323-A/F/1340-O found.
- Handback artifacts: `1346-stage/1346-p15a1-red.patch` (tests only, applies cleanly to BASE via a
  scratch index, verified), `1346-stage/1346-p15a1-red-classification.json` (27 rows), this file.
