# 1351-C: P15A.2 Wave 1 RED handback (the pure Power Ranking law)

Role: independent test engineer (test-author). Task: RED tests for P15A.2 Wave 1, the pure Power
Ranking law `power-ranking/v1`, staged in a scratch tree per the 1327-C method. Brief:
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/
fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/brief-1351-p15a2-red.md`.

## Authority read

- [1342-O item 2](1342-O-owner-rulings-p14-p18-approved.txt) (approved text): quarterly ranking,
  delegated formula/weights/tie-handling as reviewed provisional tuning; preserve the Standing /
  Honors / finance distinctions; no invented Honors, no private rival balances, no covert second
  financial formula.
- [1122-A](1122-A-p15-owner-presentation-decisions.md) D2 (band beside the creative rank), D3
  (public distress stage plus a band), D4a (Honors NOT RECORDED until Awards exists).
- [1350-A](1350-A-p15a2-power-ranking-charter.md) §3 (the formula) and §5 (test intents 2-13, 16).
- [1350-B](1350-B-power-ranking-charter-review.md): independent review, verdict ACCEPT, no
  blocking defects; non-blocking notes on band-boundary and pre-1920-exclusion test coverage.
- [1350-F](1350-F-parent-power-ranking-adoption.md): parent adoption with the RED additions (band
  boundaries incl. zero fixed cost, the authored-pre-1920 Releases exclusion, the founding
  zero-fixed-cost pin) and the citation corrections.

## Base verification

`git rev-parse HEAD` at the start equaled the assigned base `c01b3d7919692946323cc6d487ed5d0eb24ec01f`
exactly, and `git status --short` was clean. Confirmed `src/core/powerRanking.ts` does not exist in
that tree (`ls` failed with "No such file or directory"), and grepped `src/core/tuning.ts` and
`src/core` broadly for any existing `POWER_RANKING_*`/`powerRanking` symbol: none found.

At the end of this task, real-repo HEAD is `02677d935fd54d58d5c173a08dbfdd337e382e7c`, and
`git status --short` shows only the untracked handback files I wrote
(`docs/.../evidence/p14b4-20260919/1351-stage/` and this file) -- I never edited or staged
anything else in the real repo. Between BASE and this HEAD the parent committed four records:

```
02677d93 docs(p15): P15A.1 RED r3 pins the source-id order (1346-C3, 33 leaves RED at HEAD)
62f9e7e0 docs(p15): P15A.1 RED r2 re-review ACCEPT (1346-D2)
67f3c838 docs(p14): slice A RED review REFINE (1348-D) and parent response (1348-F)
aa02d351 docs(p15): P15A.1 RED revision 1346-C2 (32 leaves, all RED) and parent dry run; source-id output order decided
```

`git diff --stat c01b3d79..02677d93 -- src bridge ui tests` is **empty** -- zero files changed
under those four roots between BASE and the end-of-task HEAD. All four parent commits are
docs-only (P15A.1's own sibling RED-staging work, recorded the same way this task's work is:
patches in evidence, not commits into the real `tests/` directory). No drift into my task's
surface. One transient observation, reported for reproducibility and honesty rather than silently
smoothed over: partway through this task, `git status --short` briefly showed four **staged**
("A") entries under `1346-stage/` and two root evidence files that I had not added (visible before
`02677d93` was committed) -- a concurrent parent write landing the 1346-C3 commit above while my
own session was running. I did not touch, stage, or unstage any of those paths; `git diff --cached`
on them was already empty by the time I re-checked (the parent had committed), and the four commits
above are exactly what appeared. This is the brief's own anticipated case ("the parent may commit
records meanwhile"), reported here explicitly rather than asserted silently as "zero drift" without
having actually observed a moment of overlap.

## Method actually used

Ran the 1327-C scratch method exactly as given in the brief, no deviation:

```
BASE=c01b3d7919692946323cc6d487ed5d0eb24ec01f
T=/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1351-work/tree
mkdir -p $T && cd /Users/zacheryspector/The-Movies-headless-program
git archive $BASE src bridge ui generated scripts package.json package-lock.json tsconfig.json tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md | tar -x -C $T
git archive $BASE tests ':!tests/fixtures' | tar -x -C $T
for d in docs node_modules art tools; do ln -s /Users/zacheryspector/The-Movies-headless-program/$d $T/$d; done
ln -s /Users/zacheryspector/The-Movies-headless-program/tests/fixtures $T/tests/fixtures
cd $T && git init -q && git add -A . && git commit -q -m base
```

Confirmed `src/core/powerRanking.ts` also absent in the scratch tree before writing any test.

Reused the 1346-C precedent directly (same brief method, same project, six days earlier in
project time): dynamic per-test import (`loadPowerRanking()` inside each test body), not a static
top-level import, so every leaf gets its own attributed failure instead of one whole-file
collection-level cascade. Verified this by direct observation of the actual RED run below (27 of
28 leaves in the main file failed independently and distinctly; one leaf that never touches the
missing module correctly ran to completion -- see "Control that passes at RED" below), not merely
asserted from precedent.

## Files written (scratch tree only)

- `tests/p15a2-power-ranking.test.ts` (28 leaves): module surface (`POWER_RANKING_DEFINITION`,
  `isPowerRankingWeek` boundaries), the TUNING bounded-term test, `financialStrengthBand`
  boundaries (in-the-red, strained/stable, thriving, the zero-fixed-cost founding edge), the
  worked example and the half-up rounding boundary, window edges (W-52 counts / W-53 excluded),
  the running-film Releases-then-Films sequence, the authored-pre-1920 Releases exclusion,
  FILM_CAP/RELEASE_CAP (fifth-changes-nothing and the filmId tie-break), competition ranking
  1-1-3 and presentation order, id/owner-swap symmetry, determinism, Standing independence (two
  leaves: a structural no-field check and a production-dependent injected-field-ignored check),
  finance independence, no-private-balance, Honors/distress notRecorded with an exact row key-set
  check, explainability, and three eligibility leaves (available-false, available-true boundary,
  and the entrant-unranked-but-lanes-shown-and-excluded-from-comparison case).
- `tests/p15a2-power-ranking-harness.test.ts` (2 leaves): the pure 6,240-week, 480-quarter-boundary
  harness over a deterministic four-studio synthetic release stream (row-count/value bounds, and
  determinism across two independent runs).

Both files exist only in the scratch tree
(`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1351-work/tree/tests/`)
and as the patch below; nothing was written into the real repo's `tests/` directory.

## RED run

Command (exactly the brief's, run from the scratch tree):

```
node_modules/.bin/vitest run --project core tests/p15a2-power-ranking.test.ts tests/p15a2-power-ranking-harness.test.ts
```

Result: **2 test files failed, 29 tests failed, 1 passed (30 total).**

- 28 leaves: `Error: Failed to load url ../src/core/powerRanking.js (resolved id:
  ../src/core/powerRanking.js) in <importer>. Does the file exist?` (the module genuinely does not
  exist).
- 1 leaf (`tuning-power-ranking-bounded-terms`): `AssertionError: expected undefined to be 52` --
  a genuine value-mismatch RED reason, since this leaf imports only the real, already-existing
  `TUNING` object statically (no dependency on the missing module), and that object does not yet
  carry the seven `POWER_RANKING_*` keys.
- 1 leaf **passes** at RED (see below).

Full per-leaf mapping (file, leaf name, cited requirement, `redStatus`, exact `redReason`) is in
`1351-stage/1351-p15a2-red-classification.json` (30 rows, validated as parseable JSON via
`python3 -m json.tool`).

### Control that passes at RED (per the brief's pitfall instruction)

`compute-power-ranking-standing-independence-no-standing-field-in-type` passes unconditionally at
RED. It never calls `loadPowerRanking()`; it only builds this test file's own locally-declared
`StudioFixture`/`FilmFixture`/`InputFixture` object literals (mirroring the brief's pinned
`RankingStudio`/`RankingFilm`/`RankingInput` shapes field-for-field) and asserts their `Object.keys`
sets contain no `standing` key. That is a legitimate, brief-requested check ("assert the input
type has no standing field by constructing inputs") but it is honestly weaker than it may look: it
proves this test file's own fixtures match the pinned API shape, not that production's real
exported types will omit `standing` -- Wave 1 tests never statically import a type from the
not-yet-existing module (doing so would collapse per-leaf attribution back into one whole-file
collection failure, the exact failure mode 1346-C's dry run identified and this file's header
documents). The load-bearing, production-dependent purity proof for Standing independence is the
sibling leaf `compute-power-ranking-standing-independence-injected-field-ignored`, which builds a
baseline input and a second input with a bogus `standing` object spliced onto each studio via an
untyped object literal, and asserts `computePowerRanking` produces byte-identical output for both
-- that leaf does fail at RED for the expected missing-module reason, and once implemented is the
one that actually falsifies a production Standing dependency. Classified `PASS` /
`control-passes` in the JSON with this full reasoning, not silently treated as a normal RED leaf.

## Type gate

Command: `node_modules/.bin/tsc --noEmit -p tsconfig.json` (root gate; neither new file matches the
`tsconfig.json` excludes, which only skip `tests/bridge*.test.ts`, `tests/r3n1-*.test.ts`, and one
named fixture).

First run surfaced one self-inflicted defect: an unused top-level `const FILM_CAP = 4` (declared
for documentation but never read in code), which `noUnusedLocals` correctly rejected
(`TS6133 'FILM_CAP' is declared but its value is never read`) alongside the two expected
`TS2307` errors. Fixed by using `FILM_CAP` in a genuine assertion
(`expect(rowFifth.countedFilmIds.length).toBeLessThanOrEqual(FILM_CAP)` in the
film-cap-fifth-film-changes-nothing leaf) rather than deleting the constant or suppressing the
lint, since the assertion itself is meaningful (it pins the cap bound explicitly, not only via the
Set-equality check against a hardcoded four-member set). Re-ran the RED suite after the fix:
identical result (29 failed, 1 passed, 30 total; same leaf names, same reasons) -- the fix only
touched an assertion inside an already-failing (module-missing) leaf, so RED status could not and
did not change.

Second run, exit code 2, exactly two errors, both and only from the missing module, one per new
file:

```
tests/p15a2-power-ranking-harness.test.ts(19,24): error TS2307: Cannot find module '../src/core/powerRanking.js' or its corresponding type declarations.
tests/p15a2-power-ranking.test.ts(31,24): error TS2307: Cannot find module '../src/core/powerRanking.js' or its corresponding type declarations.
```

No other errors. Matches the brief's expectation ("expect only errors from the missing module;
list them exactly").

## Patch verification

`git diff <base-commit>..HEAD -- tests/p15a2-power-ranking.test.ts tests/p15a2-power-ranking-harness.test.ts`
in the scratch tree touches only the two new test files (965 insertions, 0 deletions, 2 files
changed); `git status --short` in the scratch tree showed nothing else staged or untracked outside
those two paths at commit time. Confirmed the patch applies cleanly to the real repo's BASE via a
scratch index (never the real repo's index):

```
BASE=c01b3d7919692946323cc6d487ed5d0eb24ec01f
SCRATCH_INDEX=$(mktemp)
GIT_INDEX_FILE=$SCRATCH_INDEX git read-tree $BASE
GIT_INDEX_FILE=$SCRATCH_INDEX git apply --cached --check 1351-stage/1351-p15a2-red.patch
# APPLY-CHECK-EXIT=0
rm -f "$SCRATCH_INDEX"
```

Exit code 0. The real repo's `git status --short` showed only my own untracked handback files
immediately afterward (nothing else).

## Tolerances chosen, and why

- **Exact integer equality** (`.toBe`) for every `*Tenths` field. The charter states these are
  "stored as integer tenths, rounded half up once," so equality comparisons are meant to be exact
  (1350-A §3 Precision: "so equality comparisons are exact"). Every fixture in this suite was
  deliberately chosen so its individual film score already lands on an exact tenths value (e.g.
  reach=1 via `totalGross === baseMarketValue`, and critic scores chosen so `0.05*critic` is a
  clean multiple of 0.05), except the one leaf whose entire purpose is to test the half-up
  rounding rule itself (`compute-power-ranking-film-score-rounds-half-up-at-exact-half-tenth`,
  critic=61 at reach=1, raw tenths = 80.5 -> 81). This avoids the suite depending on an unstated
  choice between rounding each film score before averaging vs. averaging first and rounding once
  (1350-A/F do not pin the order for a multi-film mean); every multi-film fixture in this suite
  produces the same mean either way, so the tests do not silently take a side on that open
  question. Flagged as a finding below.
- **`toBeLessThanOrEqual`/`toBeGreaterThanOrEqual`** only for the harness's bounded-value
  assertions (`filmsTenths`/`releasesTenths` in [0,100], `pointsTenths` in [0,200],
  `countedFilmIds.length <= FILM_CAP`), since the harness's synthetic stream produces many distinct
  numeric outcomes across 480 snapshots and the assertion's job is to falsify an unbounded/negative
  value, not to pin one exact number per snapshot (the per-snapshot exact numbers are already
  covered precisely by the narrower fixture-based leaves elsewhere in the suite).
- **30,000 ms explicit test timeout** on both harness leaves (the core project's default is
  5,000 ms; no config file was touched). Each leaf drives 480 `computePowerRanking` calls (one
  leaf runs the sequence once, the determinism leaf runs it twice). I do not know the eventual
  production implementation's constant factor, so 30 s is explicit headroom chosen without a
  measurement, not a performance requirement; documented at the call site. No other leaf received
  an override.

## Findings against the API decisions (not silently adapted)

The brief's PARENT API DECISIONS section, and 1350-A/F, left several shapes and rule-orderings
unpinned. Each is a choice this test suite had to commit to, and each is reported here rather than
silently assumed:

1. **Window filtering is the function's own responsibility.** The brief does not state whether
   `computePowerRanking` expects `input.films` to already be pre-filtered to `[W-52, W)`, or
   whether it receives the full known film history and filters internally. I assumed the latter
   (the function performs its own window filtering), because 1350-A §3 describes the window as
   part of the law itself ("Each film released in the window whose run has ended by W scores...")
   and because every window-edge test needs to pass films both inside and outside the window in the
   same call to prove the boundary is enforced by the function, not by the caller. This is the only
   reading under which `rank-window-edges` is testable at all. Asserted throughout (most directly
   in `compute-power-ranking-window-edge-release-tick-w52-counts-w53-excluded`).
2. **`financialStrengthBand`'s precedence when both `cash<=0` and `weeklyFixedCost===0`.** 1350-A
   §3 lists "In the red: cash<=0" first, with the other three labels each implicitly requiring
   `cash>0` by elimination (only "In the red" lacks its own `cash>0` qualifier). I assert
   `cash<=0` wins even when `weeklyFixedCost===0` (`financialStrengthBand(0,0)` and
   `financialStrengthBand(-1,0)` both `'inTheRed'`, in `financial-strength-band-in-the-red-boundary`).
   This is not literally spelled out as an ordering rule anywhere in 1350-A/1350-B/1350-F.
3. **`RankingRow.releases` is the raw, uncapped release count; `releasesTenths` is the capped lane
   value.** The brief pins both fields to exist (`releases: number; releasesTenths: number`) but
   not which one is raw vs. capped. I assert `releases` is the raw count (e.g. 5 when 5 releases
   exist in-window) and `releasesTenths` is the capped tenths value (100 for both 4 and 5
   releases), in `compute-power-ranking-release-cap-fifth-release-changes-nothing` and the
   film-cap fixture's `rowFifth.releases` assertion. A `releases` field that were itself capped
   (e.g. `min(n,4)`) would make these assertions fail even with an otherwise-correct
   implementation.
4. **`FILM_CAP` tie-break direction.** 1350-A/F state "ties by filmId" without stating which
   direction wins. I assert the lexicographically lower filmId is kept
   (`compute-power-ranking-film-cap-tie-break-by-film-id`, `'D'` kept over `'E'`). The tested
   `filmsTenths` mean (65) is identical regardless of which of the two tied films is kept, so only
   the `countedFilmIds` assertion depends on this direction choice; a different direction would
   fail only that one assertion in that one leaf.
5. **Multi-film mean rounding order** (see "Tolerances chosen" above): not pinned by 1350-A/F for
   more than one counted film. All multi-film fixtures in this suite were deliberately chosen to
   be order-independent, so this suite does not take a side on it, but a future test extending this
   suite with a genuinely fractional multi-film mean would need to pin one reading explicitly.
6. **`rank` excludes unranked studios from the comparison denominator.** 1350-A §3 states rank is
   "1 + the number of *ranked* studios with strictly more points" (emphasis on "ranked"), which I
   read as: an unranked (ineligible, e.g. too-recent-entrant) studio's points never affect any
   other studio's rank, even if its raw points are higher. Directly pinned and load-bearing in
   `compute-power-ranking-eligibility-entrant-unranked-lanes-shown-excluded-from-comparison` (a
   studio with pointsTenths=125, the highest of the cohort, is excluded from the comparison so
   that two lower-scoring eligible studios rank 1 and 2 as if it did not exist).

No contradiction of 1342-O/1122-A/1350-A/1350-B/1350-F was found. Every numeric worked example in
1350-A §3 (the critic-60/gross-0.45 example) reproduces exactly in this suite's independent
arithmetic; the band-boundary table in 1350-F's RED additions is covered at every named boundary
(cash<=0, 12/13/25/26 weeks, zero fixed cost).

## Not executed / out of scope

No broad suite was run (only the two new files under `--project core`, plus the root `tsc --noEmit`
type gate, per the brief). No production code was written or modified. No save/Bridge/UI code is
touched by these tests (Wave 1 is pure by charter; Wave 2's archive root, tick step, Bridge view,
and persistence tests are explicitly out of scope per the brief). Test 1's tick-cadence and test
14's entrant-tick behaviour are exercised only as pure functions of the week numbers passed into
`computePowerRanking`/`isPowerRankingWeek`, never against a real tick, per the brief's scope carve-out.

## Summary

- Files: `tests/p15a2-power-ranking.test.ts` (28 leaves), `tests/p15a2-power-ranking-harness.test.ts`
  (2 leaves). 30 leaves total.
- RED status: 29/30 failed, each for a stated reason (28 missing-module load failures, 1 genuine
  TUNING value mismatch); 1 leaf passes at RED as a documented control (a fixture-shape structural
  check that never touches the missing module -- see "Control that passes at RED" above; its
  production-dependent sibling leaf does fail at RED as expected).
- Type gate: exactly 2 errors, both `TS2307 Cannot find module '../src/core/powerRanking.js'`, one
  per file, no other errors (after fixing one self-inflicted `TS6133` unused-constant defect,
  documented above, with no change to RED status).
- Findings: six interpretation/API-shape decisions not literally pinned by the brief/1350-A/F,
  documented above in the test file comments and this handback; no contradiction of 1342-O, 1122-A,
  1350-A, 1350-B, or 1350-F found.
- Handback artifacts: `1351-stage/1351-p15a2-red.patch` (tests only, applies cleanly to BASE via a
  scratch index, verified), `1351-stage/1351-p15a2-red-classification.json` (30 rows), this file.
- Base/HEAD: base `c01b3d7919692946323cc6d487ed5d0eb24ec01f`, end-of-task real-repo HEAD
  `02677d935fd54d58d5c173a08dbfdd337e382e7c`; zero drift under `src/`, `bridge/`, `ui/`, `tests/`
  between them (parent's four intervening commits are docs-only, all P15A.1's own sibling
  RED-staging work; one transient concurrent-staging observation noted above).
