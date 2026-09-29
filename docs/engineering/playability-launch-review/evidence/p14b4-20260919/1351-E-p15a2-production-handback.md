# 1351-E: P15A.2 Wave 1 production handback (the pure Power Ranking law)

Role: the single production writer (sim-core). Task: implement `power-ranking/v1` in a scratch tree
against the staged RED and hand back a production-only patch.

**Status: PARTIAL.** Production is complete. On the final RED r3, 32 of 34 leaves pass, including the
control. The two failing leaves are test defects that no implementation can pass (F1, F2 below). I did
not edit any test. All three type gates exit 0.

## Authority read

- [1342-O item 2](1342-O-owner-rulings-p14-p18-approved.txt), recorded approved in
  [1342-O](1342-O-owner-rulings-p14-p18.md). Power Ranking is quarterly. The formula, weights and ties
  are reviewed provisional tuning. The 1122-A presentation stays. No invented Honors, no private rival
  balances and no covert second financial ranking.
- [1122-A](1122-A-p15-owner-presentation-decisions.md): D2, D3 and D4a.
- [1350-A](1350-A-p15a2-power-ranking-charter.md) §3, reviewed in
  [1350-B](1350-B-power-ranking-charter-review.md) and adopted in
  [1350-F](1350-F-parent-power-ranking-adoption.md).
- The RED brief's PARENT API DECISIONS
  (`scratchpad/brief-1351-p15a2-red.md`), and the parent's decisions on the RED findings as given in
  my brief:
  - the function filters `[W−52, W)` itself;
  - band precedence;
  - raw `releases`;
  - FILM_CAP ties by ascending filmId;
  - round each film once, then round the mean once, true half-up;
  - rank counts ranked studios only;
  - `available` is false when `originWeek > W−52`;
  - presentation order.
- The RED records [1351-C](1351-C-p15a2-red-handback.md), [1351-C2](1351-C2-p15a2-red-rounding-pin.md),
  [1351-D](1351-D-p15a2-red-review.md) and [1351-C3](1351-C3-p15a2-red-notes-closed.md).

## Base check

- Real-repo `git rev-parse HEAD` at start: `3abed41c5cb87dc36543074f85c183d02484b799`, with a clean
  status.
- Real-repo HEAD at the end: `95cdd695a91fc8f7b04e12dada7dd472cea1d7c6`. The parent committed five
  docs-only records meanwhile. `git diff --stat 3abed41c HEAD -- src tests ui bridge generated scripts`
  is empty. In a scratch index at 95cdd695, r3 and then this patch still apply.
- In the real repo I wrote only this record and `1351-stage/1351-p15a2-production.patch`. The other
  untracked files present at the end (the 1346-C4 record, the 1346 r4 files and the 1348 r3 files)
  belong to other workers. I did not touch them.

## Method

I built the scratch tree by the 1327-C method at 3abed41c:
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1351-prod/tree`.
It holds an archive of src, bridge, ui, generated, scripts, the configs, AUDIO-PROVENANCE.md and tests
without fixtures. docs, node_modules, art, tools and tests/fixtures are symlinks. The tree has its own
`git init`.

Scratch history, one concern per commit:

| Commit | Content | Diff sha256 (first 16) |
|---|---|---|
| `be5ef28` | base (3abed41c archive) | |
| `f2ed58a` | RED r2 (1351-C2, 32 leaves); input patch sha256 `2c44fadc…f141672` | `2c44fadcbf334767` |
| `d4f238a` | RED r3 (1351-C3, 34 leaves); r2 test files removed, then r3 applied, because r3 is a full diff against c01b3d79; input patch sha256 `0083412f…920d150b` | `a525be9f635a2da8` |
| `b8fb511` | production 1351-E | `964c50724793dc74` |

The first production draft was written on r2 and parked in a WIP commit when r3 arrived. It was then
replayed onto the r3 commit. The handback patch is `git diff d4f238a b8fb511`: production only,
relative to the r3 test commit.

## Files

`1351-stage/1351-p15a2-production.patch`: sha256
`964c50724793dc7423c1be076e2c109ac77e9b4d15e00ab55e43b87c4ddc7b0e`, 10,420 bytes, 2 files,
188 insertions, 0 deletions.

- `src/core/powerRanking.ts` (new, 177 lines). It exports:
  - `POWER_RANKING_DEFINITION = 'power-ranking/v1'`;
  - `isPowerRankingWeek`, `financialStrengthBand` and `computePowerRanking`;
  - the types `FinancialStrengthBand`, `RankingFilm`, `RankingStudio`, `RankingInput`,
    `PowerRankingRow` and `PowerRankingSnapshot`, exactly as the brief pins them.

  Its only import is `TUNING`. It has no RNG, `Math.random`, `Date`, I/O, GameState, save, Bridge, UI
  or tick hook.
- `src/core/tuning.ts` (+11 lines). The seven `POWER_RANKING_*` keys sit at the values the brief pins.
  A comment names them provisional tuning under Owner ruling 1342-O item 2, says the formula was written
  in 1350-A §3, reviewed in 1350-B and adopted in 1350-F, and says any change to them must bump
  `POWER_RANKING_DEFINITION`.
  - Placement: after the `HOLLYWOOD_*` block at the head of `TUNING`, not at its end. The staged P15A.1
    patch (1346-E) appends its keys just before `} as const`. Appending there as well would make the
    two staged patches conflict.
  - Checked in scratch indexes: at 3abed41c and at 8e8a4e56, r3, then this patch, then
    `1346-p15a1-production.patch` all apply. The two production patches also apply in the reverse
    order.
- No `src/core/index.ts` change. Wave 1 has no consumer, and the sibling handback recorded that many
  core modules are absent from the index.
- No test pins a TUNING key roster. I re-checked at this base: the only enumeration is the d16 lab's
  dynamic `Object.keys(TUNING)` snapshot.

## Design notes

1. **Window.** `windowStartWeek = W − POWER_RANKING_WINDOW_WEEKS`. A film is in the window when
   `windowStartWeek ≤ releaseTick < W`. Films outside it are skipped, not rejected, because the RED
   passes films at W−53 and at W.
2. **Releases.** n counts in-window films with `authoredPreCampaign === false`, running or finished.
   `releases` is n, uncapped. `releasesTenths = Math.round(100 · min(n, RELEASE_CAP) / RELEASE_CAP)`.
3. **Film score in tenths.** `Math.round(CS · critic + (1 − CS) · min(100, 100 · gross / (max(base, 1) · REACH_SCALE)))`.
   This is 1350-A's `10 · (CS · critic/100 + (1 − CS) · reach)`, evaluated directly in tenths, with
   the charter's `max(base, 1)` guard.
   - The evaluation order matters at exact halves. The literal `gross / base / scale` divides twice
     and rounds twice, and it misrounds real ties. Example: critic 0 with gross 243,000 against base
     1,000,000 (reach 0.27) is exactly 13.5 tenths, so 14. The two-division form gives
     13.499999999999998, so 13.
   - One division of exact products keeps every such tie exact. On a sweep of 1,006,005
     (critic, gross, base) triples (critic in halves, gross in 0.1% steps, five bases), the
     two-division form misrounds 514 and the shipped form misrounds 0. The comparison is an exact
     BigInt oracle (see Cross-check).
4. **Films lane.** In-window films with `runEndedByWeek` are scored per studio. They are sorted by score
   descending, ties by ascending filmId (code-unit comparison, never `localeCompare`), and the first
   `FILM_CAP` are kept. `filmsTenths = Math.round(sum / count)` over those integers, or 0 with none.
   `countedFilmIds` is in that selection order.
5. **Half-up.** Every rounded quantity is non-negative, and `Math.round` rounds exact halves toward
   +∞, so it is true half-up (61 from 60.5, never banker's 60). A mean of at most four integers is
   either an exact half or at least 1/(2·count) away from one, so float division cannot move it
   across a boundary.
6. **Eligibility and rank.** `available = originWeek ≤ windowStartWeek`. A row is ranked when
   `available && enteredWeek ≤ windowStartWeek`. `rank = 1 +` the number of ranked rows with strictly
   more `pointsTenths`. Unranked rows keep `rank: null` and never enter the comparison. Order: ranked
   rows by (rank, studioId), then unranked rows by studioId.
7. **Band.** `financialStrengthBand` applies the rules in this order:
   - `cash ≤ 0` gives `inTheRed`, even at a zero fixed cost;
   - otherwise a zero fixed cost gives `thriving`;
   - otherwise `weeks = floor(cash / cost)` gives strained below 13, stable at 13 to 25, and
     thriving from 26.

   The band is computed per row and feeds nothing else. No row field carries cash or a fixed cost.
8. **Fail loud on malformed input.** `computePowerRanking` throws on:
   - non-integer `week`, `originWeek`, `enteredWeek` or `releaseTick`;
   - non-finite `baseMarketValue`;
   - a duplicate studioId or filmId;
   - `criticScore` outside 0..100 or NaN;
   - `totalGross` that is negative or not finite.

   `financialStrengthBand` throws on non-finite cash, or on a fixed cost that is negative or not
   finite. The band's error text never contains a finance value (probe-checked with 987654321 and
   123456789), so a rival balance cannot leak through an error message. A snapshot is frozen and
   never recomputed (1350-A §4), so a NaN admitted silently would be permanent.
9. **Purity.** Inputs are only read. Sorting uses arrays the function built itself. The probe compared
   `JSON.stringify(input)` before and after on 20,000 random calls, and nothing changed.

## GREEN (final, r3)

Command, from the scratch tree:
`node_modules/.bin/vitest run --project core tests/p15a2-power-ranking.test.ts tests/p15a2-power-ranking-harness.test.ts --reporter=verbose`

Result: **Tests 2 failed | 32 passed (34)**, Test Files 1 failed | 1 passed (2). Duration 4.77s
(transform 479ms, collect 552ms, tests 3.39s).
- The harness leaves pass: 480 snapshots in 2771ms and determinism in 351ms, against a 30 s budget.
  The same leaf took 1287ms and 2402ms in earlier runs, so the load varies.
- The documented control `compute-power-ranking-standing-independence-no-standing-field-in-type` passes.
- All three new r3 leaves pass:
  - `window-edge-w52-unfinished-counts-releases-not-films`;
  - `tied-pair-id-swap-flips-presentation-order`;
  - the widened `id-and-owner-swap-symmetry`.

The two failures, raw:

```
FAIL |core| tests/p15a2-power-ranking.test.ts > p15a2 power ranking: computePowerRanking worked examples > compute-power-ranking-film-score-rounds-half-up-at-exact-half-tenth
AssertionError: expected 80 to be 81 // Object.is equality
 ❯ tests/p15a2-power-ranking.test.ts:287:43

FAIL |core| tests/p15a2-power-ranking.test.ts > p15a2 power ranking: eligibility > compute-power-ranking-eligibility-entrant-unranked-lanes-shown-excluded-from-comparison
AssertionError: expected 1 to be 2 // Object.is equality
 ❯ tests/p15a2-power-ranking.test.ts:970:22
```

The same two leaves also failed against r2: 30 passed and 2 failed (32), at r2 lines 287 and 882. That
run used the first draft's two-division reach. I made no production change aimed at either leaf.

Logs are in the scratch area: `1351-prod/r3-final.log`, `1351-prod/r3-run1.log`, and
`1351-prod/probe/probe-run2.log`.

## Type gates (on b8fb511)

| Gate | Exit | Time | Output |
|---|---|---|---|
| `node_modules/.bin/tsc --noEmit -p tsconfig.json` | 0 | 168 s | none |
| `node_modules/.bin/tsc -p ui/tsconfig.json --noEmit` | 0 | 115 s | none |
| `node_modules/.bin/tsc -p tsconfig.bridge.json` | 0 | 77 s | none (the config sets `noEmit: true`; the tree stayed clean) |

No broad suite was run.

## Cross-check (throwaway, not in the patch)

`scratchpad/1351-prod/probe/probe.ts` runs under `node_modules/.bin/vite-node`, and every check
passes:

1. **An independent exact oracle.** I wrote it from 1350-A §3 and the parent decisions. It uses BigInt
   rationals for every score (critic in halves, integer money) and `floor((2·num + den) / (2·den))`
   for every rounding. The band uses `cash < 13·cost` comparisons instead of floor division.
   - It agreed with production on all 20,000 LCG-generated inputs. The inputs covered: up to 10
     studios; up to 40 films in `[W−80, W+15)`; bases 0, 1, 7, 10 and random; cash at zero, negative,
     1,300 and 2,599; fixed cost 0; authored films; and 52,904 tied ranked rows.
   - Mismatches: 0.
2. **Guard proof by injection.** The two-division reach form, run through the same oracle, misrounds
   514 exact halves out of 1,006,005 triples. The shipped form misrounds 0. The comment witness
   (critic 0 at reach 0.27) gives 14 from production and 13 from the two-division form.
3. **The two failing leaves at their stated intent.**
   - Critic 61 at reach 1 gives `filmsTenths` 81 from production. This is the leaf's own production
     assertion at :296.
   - With the entrant leaf's EARLY and MID releases moved inside the window (tick 60), production gives
     every value the leaf states: EARLY 50 points, rank 1; MID 25, rank 2; LATE unranked with 125; order
     EARLY, MID, ABLE, LATE, ZOOM.
   - As written (tick 10), production gives EARLY 0, MID 0, both rank 1.
4. **The fail-loud guards in design note 8.** Each one throws, and the band error echoes no finance
   value.

## Findings

**F1 (test defect, blocks GREEN): `tests/p15a2-power-ranking.test.ts:287`.** The leaf
`compute-power-ranking-film-score-rounds-half-up-at-exact-half-tenth` first checks the test's own
helper: `expect(filmScoreTenths(61, BMV, BMV)).toBe(81)`. That helper (`:84-88`, with `roundHalfUp` at
`:72-76`) computes `10 * (0.5 * (61/100) + 0.5 * 1) * 10`, which in float is `80.49999999999999`, and
`floor(x + 0.5)` then gives 80.
- The assertion fails before the leaf calls production, so no implementation can pass it.
- The authority's value is 81, and production returns 81.
- The r2 and r3 runs never reached this line at RED, because the missing-module import failed first.
  1351-D recomputed by hand, which is why the defect was not seen.
- Suggested test-side fix, for the test owner (I did not apply it): evaluate the helper in tenths,
  `roundHalfUp(CRITIC_SHARE * criticScore + (1 - CRITIC_SHARE) * 100 * reach)`. I checked it: it gives
  81 here, and it reproduces all 15 other helper values the file asserts or relies on (55/56/58 for
  10.98/12.98/16.98; 55/56/60/61; 80/70/60; 55; 90; 40; 50; 100).
- This is the same float hazard that design note 3 guards against in production.

**F2 (test defect, blocks GREEN): `tests/p15a2-power-ranking.test.ts:970`.** The leaf
`compute-power-ranking-eligibility-entrant-unranked-lanes-shown-excluded-from-comparison` places EARLY's
and MID's releases at `releaseTick: 10` (`:943`). The leaf runs at `week: 104` (`:945`), whose window
is `[52, 104)`, so tick 10 lies outside it.
- The comments at `:937-938` assume those releases count, giving EARLY 50 and MID 25. Under the adopted
  rule that the function filters the window, both studios score 0 and tie at rank 1.
- This leaf contradicts the RED's own window-edge leaf, which excludes tick 51 at W=104
  (`:419-442`). No interval window can satisfy both.
- The assertions before `:970` pass (`early.rank` 1 at `:968`), and so do the key and order checks
  after it: EARLY < MID by studioId, so the tie leaves the order unchanged.
- Suggested test-side fix (not applied): any tick in `[52, 104)` at `:943`, for example 60. The probe
  shows every assertion in the leaf then holds.

**F3 (unpinned, implemented literally): authored films in the Films lane.** 1350-A and 1350-F exclude
authored pre-1920 films from Releases only. The Films lane in 1350-A §3 names no exclusion, so an
authored film that is in the window and finished would be scored.
- In the real data, `AuthoredFilm` carries only `released: HistoricalDate` (a year) and no tick. The
  Wave 2 adapter will therefore choose its `releaseTick`.
- If it maps authored films before `originWeek`, they never reach an available window. They could only
  appear on the display-only lanes of snapshots at W < 52.
- Alternative: exclude them from both lanes, which is one condition. I recommend the parent pin this
  either way before Wave 2. No RED leaf pins it.

**F4 (scope note): cadence is not enforced inside `computePowerRanking`.** Any integer week is
accepted, and `isPowerRankingWeek` is the gate that Wave 2's tick step calls. Wave 2 persistence
validation (1350-A §5 item 15) rejects off-cadence snapshots.

**F5 (scope note): studios with `enteredWeek > week` are accepted and shown unranked.** The RED
honors leaf passes such a studio (B, entered 60, at W=52). Films whose studioId is absent from
`studios` are ignored. Cohort membership is the caller's responsibility.

**F6 (Wave 2 note): the validation throws are loud by design.** A Wave 2 tick step that calls
`computePowerRanking` with state that fails them, such as a NaN gross, will throw instead of freezing a
bad snapshot. Wave 2 should supply validated state.

## Not done / limits

- F1 and F2 prevent a full GREEN. Fixing them needs a RED revision from the test owner; I did not edit
  any test.
- No save, projection, Bridge, UI or tick work. That is Wave 2's scope.
- Paper arithmetic and the probe are evidence about the pure law only. They do not play-test the
  formula; its KEEP/REVISE judgement belongs to the Wave 4 playtest.

## Next action

The parent decides F1 and F2 (a RED r4 from the test owner, or a parent ruling). Then:
1. Re-run the two files against `1351-p15a2-production.patch` unchanged. Expected result: 34/34, per the
   probe.
2. Decide F3 before Wave 2.
