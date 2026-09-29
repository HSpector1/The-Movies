# 1351-C2: P15A.2 Wave 1 RED revision -- multi-film mean rounding order pin

Role: independent test engineer (test-author). Task: small revision to 1351-C's RED tests, same
scratch tree, per the coordinator's message adopting the six 1351-C findings as decisions and
pinning the rounding order for finding 5.

## Decisions adopted (no test changes required)

The coordinator's message adopts (1), (2), (3), (4), (6) from 1351-C's Findings section exactly as
written there; no test in `tests/p15a2-power-ranking.test.ts` or
`tests/p15a2-power-ranking-harness.test.ts` needed to change for these, since every existing leaf
touching them already asserted the now-adopted reading:

1. `computePowerRanking` filters the window itself -- already asserted throughout (most directly in
   `compute-power-ranking-window-edge-release-tick-w52-counts-w53-excluded`, which passes films both
   inside and outside the window in one call).
2. `cash<=0` reads `inTheRed` even when `weeklyFixedCost===0` -- already asserted in
   `financial-strength-band-in-the-red-boundary` (`financialStrengthBand(0,0)` and `(-1,0)` both
   `'inTheRed'`).
3. `releases` is the raw count, `releasesTenths` the capped lane -- already asserted in
   `compute-power-ranking-release-cap-fifth-release-changes-nothing` (`releases` 4 vs 5, `releasesTenths`
   100 both times) and in the film-cap fixture (`rowFifth.releases === 5`).
4. FILM_CAP ties keep the lower filmId (ascending) -- already asserted in
   `compute-power-ranking-film-cap-tie-break-by-film-id` (`'D'` kept over `'E'`).
6. Unranked studios never enter the rank comparison -- already asserted in
   `compute-power-ranking-eligibility-entrant-unranked-lanes-shown-excluded-from-comparison` (LATE's
   125 points, highest of the cohort, does not affect EARLY/MID's ranks).

## Decision (5): the rounding order, and the two new leaves

The coordinator pinned: each counted film's score is rounded half up to integer tenths once;
`filmsTenths` is then the mean of those integer tenths, rounded half up once ("round-then-average-
then-round", Method A) -- not "average raw scores, then round once" (Method B). Two leaves added,
both inserted into the existing `describe` structure of `tests/p15a2-power-ranking.test.ts`
(new `describe('p15a2 power ranking: multi-film mean rounding order (1351-C2 pin)', ...)` block,
placed after the "computePowerRanking worked examples" block and before "window edges and the
running-film rule" -- i.e. immediately after the leaf that was previously last in that section).
**Every other leaf in both files is byte-for-byte unchanged** except for this one insertion (the
FILM_CAP-fixed version from 1351-C's own r1); confirmed below by diffing the two patches.

### Leaf 1: `compute-power-ranking-filmstenths-mean-rounding-order-genuinely-fractional`

Three films, all reach=1 (gross=baseMarketValue), critic scores 10.98 / 12.98 / 16.98 chosen so
each film's raw (pre-rounding) tenths sits near the top of its own rounding bucket:

```
critic=10.98 -> raw tenths = 0.5*10.98+50 = 55.49 -> rounds to 55
critic=12.98 -> raw tenths = 0.5*12.98+50 = 56.49 -> rounds to 56
critic=16.98 -> raw tenths = 0.5*16.98+50 = 58.49 -> rounds to 58

Method A (adopted):  mean(55, 56, 58) = 169/3 = 56.333... -> round half up = 56
                      (exactly the coordinator's own worked example: "55, 56, 58 -> 56.333... -> 56")
Method B (rejected):  mean(55.49, 56.49, 58.49) = 170.47/3 = 56.8233... -> round half up = 57
```

56 != 57: a genuine divergence between the two orders for this exact input, not merely a restatement
of the charter prose. The test computes both `methodA` and `methodB` from its own local helpers
(never from production) as a sanity check on its own arithmetic before asserting
`row.filmsTenths === 56` and `row.filmsTenths !== 57` against `computePowerRanking`'s output.

### Leaf 2: `compute-power-ranking-filmstenths-mean-rounds-half-up-at-exact-half`

Two studios, each with two counted films whose individual tenths are already exact integers (no
per-film rounding ambiguity), isolating the lane-mean rounding step:

```
HALFEVEN: critic=10 -> tenths=55; critic=12 -> tenths=56.
          mean = (55+56)/2 = 55.5 -> round half up = 56.
          This is the coordinator's own literal example ("55, 56 -> 55.5 -> 56").

HALFODD:  critic=20 -> tenths=60; critic=22 -> tenths=61.
          mean = (60+61)/2 = 60.5 -> round half up = 61 (ODD).
```

The HALFEVEN case alone does not discriminate half-up from banker's rounding (round-half-to-even),
since 56 is also the nearest even integer to 55.5 -- both rules agree there. The HALFODD case does
discriminate: banker's rounding of 60.5 would give 60 (the nearest even integer), and simple
truncation would also give 60; only true half-up gives 61. Added HALFODD alongside the coordinator's
literal HALFEVEN example so this leaf actually pins half-up specifically, not a rule that happens to
coincide with half-up on the one given example.

## RED run

Command (same as 1351-C, from the scratch tree):

```
node_modules/.bin/vitest run --project core tests/p15a2-power-ranking.test.ts tests/p15a2-power-ranking-harness.test.ts
```

Result: **2 test files failed, 31 tests failed, 1 passed (32 total).** The two new leaves both fail
for the expected module reason:

```
p15a2 power ranking: multi-film mean rounding order (1351-C2 pin) > compute-power-ranking-filmstenths-mean-rounding-order-genuinely-fractional
  -> Error: Failed to load url ../src/core/powerRanking.js (resolved id: ../src/core/powerRanking.js) in <importer>. Does the file exist?
p15a2 power ranking: multi-film mean rounding order (1351-C2 pin) > compute-power-ranking-filmstenths-mean-rounds-half-up-at-exact-half
  -> Error: Failed to load url ../src/core/powerRanking.js (resolved id: ../src/core/powerRanking.js) in <importer>. Does the file exist?
```

This is guaranteed by construction, not merely observed: both leaves call `await loadPowerRanking()`
as their first statement (same pattern as every other leaf in this file), which rejects before this
leaf's own local sanity-check arithmetic or the `computePowerRanking` call ever executes -- so the
RED reason cannot be anything but the module-load failure, and the local arithmetic (verified correct
above) only exercises once Wave 1 lands.

Every previously-existing leaf's status is unchanged from 1351-C's r1 run: 29 of the original 30
leaves still fail for their original stated reasons (28 module-load, 1 genuine `TUNING` value
mismatch), and `compute-power-ranking-standing-independence-no-standing-field-in-type` still passes
as the same documented `control-passes` case (unaffected by this revision; it lives in a different
`describe` block, untouched).

Full per-leaf mapping for all 32 leaves is in `1351-stage/1351-p15a2-red-r2-classification.json`
(the original 30 rows from `1351-p15a2-red-classification.json`, unmodified, plus the 2 new rows
inserted at their actual file position -- confirmed by diff that no existing row's text changed).

## Type gate

Command: `node_modules/.bin/tsc --noEmit -p tsconfig.json`. Exit code 2, exactly the same two errors
as 1351-C's r1, no new errors from the two added leaves:

```
tests/p15a2-power-ranking-harness.test.ts(19,24): error TS2307: Cannot find module '../src/core/powerRanking.js' or its corresponding type declarations.
tests/p15a2-power-ranking.test.ts(31,24): error TS2307: Cannot find module '../src/core/powerRanking.js' or its corresponding type declarations.
```

## Patch verification

`git diff <base>..HEAD -- tests/p15a2-power-ranking.test.ts tests/p15a2-power-ranking-harness.test.ts`
in the scratch tree (base = the scratch tree's own root commit, content-identical to the real repo's
`c01b3d7919692946323cc6d487ed5d0eb24ec01f`) is the full diff for both files, written to
`1351-stage/1351-p15a2-red-r2.patch` (supersedes r1's patch as the complete artifact; `tests/p15a2-power-ranking-harness.test.ts`
is byte-identical to r1 inside this diff -- only the main file changed). Verified it applies cleanly
to the real repo's actual BASE via a scratch index (never the real repo's index):

```
BASE=c01b3d7919692946323cc6d487ed5d0eb24ec01f
SCRATCH_INDEX=$(mktemp)
GIT_INDEX_FILE=$SCRATCH_INDEX git read-tree $BASE
GIT_INDEX_FILE=$SCRATCH_INDEX git apply --cached --check 1351-stage/1351-p15a2-red-r2.patch
# APPLY-CHECK-EXIT=0
rm -f "$SCRATCH_INDEX"
```

Exit code 0.

## Base/HEAD

Real-repo HEAD at the end of this revision: `02677d935fd54d58d5c173a08dbfdd337e382e7c` (unchanged
from 1351-C's own end-of-task HEAD; no further parent commits landed between 1351-C and this
revision). `git status --short` shows only my own untracked handback files
(`1351-stage/`, `1351-C-p15a2-red-handback.md`, this file) plus, observed but untouched, another
concurrent worker's untracked `1344-C-shelving-red-handback.md` / `1344-stage/` -- not authored,
staged, or modified by me, consistent with the shared-repo concurrency already noted in 1351-C.
`git diff --stat c01b3d79..02677d93 -- src bridge ui tests` remains empty (verified again, unchanged
from 1351-C).

## Correction to 1351-C's original handback

1351-C's Findings item 5 described the multi-film mean rounding order as genuinely open and noted
"a future test extending this suite... would need to pin one reading explicitly." That reading is
now closed by explicit coordinator decision and pinned by the two leaves above. `1351-p15a2-red-classification.json`
(the r1 artifact) is left unmodified as the historical record of what 1351-C actually ran; this
file and `1351-p15a2-red-r2-classification.json` / `1351-p15a2-red-r2.patch` are the current,
superseding artifacts for the revised 32-leaf suite.

## Summary

- Added 2 leaves to `tests/p15a2-power-ranking.test.ts` (now 30 leaves; harness file unchanged at 2
  leaves; 32 total). Every other leaf byte-for-byte unchanged from 1351-C's r1.
- RED status: both new leaves fail for the module-load reason, guaranteed by construction. Suite
  totals: 31/32 failed, 1 passed (the same pre-existing, documented `control-passes` leaf).
- Type gate: exactly the same 2 `TS2307` errors as r1, no new errors.
- Handback artifacts: `1351-stage/1351-p15a2-red-r2.patch` (full diff vs BASE, both files, applies
  cleanly via a scratch index, verified), `1351-stage/1351-p15a2-red-r2-classification.json` (32
  rows), this file. r1's own `1351-p15a2-red.patch` and `1351-p15a2-red-classification.json` are
  left in place, unmodified, as the historical r1 record.
