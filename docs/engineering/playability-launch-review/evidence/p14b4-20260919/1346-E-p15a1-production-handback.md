# 1346-E: P15A.1 Wave 1 production handback (the pure shared-market law)

Role: the single production writer (sim-core). Task: implement `p15a1-market-v1` in a scratch
tree against the staged RED and hand back a production-only patch. Status: **DONE, GREEN 33/33
on the final RED r3**, three type gates exit 0, no test edited.

## Authority read

- [1323-A](1323-A-p15a1-wave0-and-wave1-charter.md) §3 (the law) and §5 (order).
- [1323-F](1323-F-parent-p15a1-charter-adoption.md) Amendment 3 (the work bound and bounded
  active set) and the adopted eligibility note (a subject counts only its own genre).
- [1340-O](1340-O-owner-rulings-20260929.md) D-1323-1 (formula approved; constants provisional;
  Wave 4 KEEP/REVISE/REJECT playtest; shared-market pressure enters the live economy only after
  the rival-shelving verification).
- Parent API decisions: the brief for 1346-C ("PARENT API DECISIONS"),
  [1346-X](1346-X-p15a1-red-dry-run-and-adoption.md) (three decisions),
  [1346-F](1346-F-parent-response-to-1346-D.md) (`MARKET_REASON_SOURCE_LIMIT = 5`; value is the
  full sum; appended members report no transition; "After revision 1346-C2": ids in selection
  order), and the per-code reason model recorded in
  [1346-C2](1346-C2-p15a1-red-revision.md) and pinned by the r2/r3 tests.
- For reason semantics only: the P15 builder annex at 2a7ff0d9 (D.3 assessment record, K.1
  fixtures, L.4 complexity gates), read from history.

## Base check

- `git rev-parse HEAD` at start: `bf125cc3a6dcf5412b95616403e6cd002e795d38`, status clean.
- Real-repo HEAD at the end: `1d4275c052697329bf39c331ab30e9da4167ab6f` (the parent committed
  records meanwhile). `git diff --stat bf125cc3 HEAD -- src tests ui bridge generated scripts`
  is empty: no source drift in that window.
- The production patch and the r3 RED patch both pass `git apply --cached --check` against a
  scratch index at bf125cc3 and at 1d4275c0. The real index was never touched.
- I wrote only this record and `1346-stage/1346-p15a1-production.patch` in the real repo.

## Method

Scratch tree by the 1327-C method at bf125cc3:
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1346-prod/tree`
(archive of src bridge ui generated scripts, configs, AUDIO-PROVENANCE.md and tests without
fixtures; docs, node_modules, art, tools and tests/fixtures symlinked; `git init`).

Scratch history, one concern per commit:

| Commit | Content | Patch sha256 |
|---|---|---|
| `2faa209` | base (bf125cc3 archive) | |
| `9a0b923` | RED r1 (1346-C, 27 leaves) | b26b204d… |
| `904bf9d` | RED r2 (1346-C2, 32 leaves; r1 test files replaced) | 54704911… |
| `78f6db4` | RED r3 (1346-C3, 33 leaves; r2 test files replaced) | 244b276c… |
| `2b10dee` | production 1346-E | |

Each RED revision was applied to the base test tree after removing the previous revision's two
files, because each patch is a full diff against ea65e796. The handback patch is
`git diff 78f6db4 2b10dee`: production only, relative to the r3 test commit.

## Files

`1346-stage/1346-p15a1-production.patch`: sha256
`ed3436846b40a0a00b49c43ee1207455ac4149859118b98e12af6d0d0f294c92`, 20,552 bytes, 2 files,
411 insertions, 0 deletions.

- `src/core/sharedMarket.ts` (new, 398 lines). Exports `SHARED_MARKET_DEFINITION`,
  `MARKET_REASON_SOURCE_LIMIT`, `exposureWeight`, `pressureFactor`, `assessBatch`,
  `reduceExposures` and the types `MarketLane`, `MarketReasonCode`, `MarketRelease`,
  `MarketExposure`, `MarketBatchMember`, `MarketBatch`, `MarketReason`, `MarketAssessment`,
  `MarketLaneTransition`.
- `src/core/tuning.ts` (+13 lines): the seven `SHARED_MARKET_*` keys at the end of `TUNING`,
  under a comment naming them provisional tuning under Owner decision D-1323-1 (record 1340-O)
  with the Wave 4 KEEP/REVISE/REJECT playtest. `SHARED_MARKET_WINDOW_WEIGHTS` uses the
  `as readonly number[]` form of the `MARKET_PREMIUM_TIERS` precedent.
- No `src/core/index.ts` change. The brief made it conditional on the repo pattern, and the
  pattern does not require it: 30 core modules are absent from the index (for example
  `hollywoodTick`, `professionHistory`, `technologyRival`, `firstTakeSubjects`), and Wave 1 has
  no consumer. 1323-A §5 names "one index export"; it is a one-line follow-up if the parent
  wants it.
- No GameState, save, Bridge, UI, tick or reception change. No RNG, `Math.random`, `Date` or
  I/O. Imports: `fnv1a64` (math.ts), `GENRE_ORDER` and `TUNING` (tuning.ts), type `Genre`.
- No test in the repo pins a TUNING key roster or key count (searched src, tests, ui, bridge and
  scripts for `Object.keys(TUNING)`, `Object.entries(TUNING)` and similar; the only hit is the d16
  lab's dynamic snapshot), so no extra roster test applied.

## Design notes

1. **Lanes and factor.** `exposureWeight(R, t)` throws on non-integer weeks and on `t < R`;
   window `[R, R+4)` by offset from `SHARED_MARKET_WINDOW_WEIGHTS`, stock
   `0.20·2^(−(t−(R+4))/13)` on `[R+4, R+26)`, `{lane:'retired', weight:0}` from `R+26`
   (1346-X decision 1). The window length comes from the weights array, so R+4 is not a second
   constant. `pressureFactor` throws on negative or non-finite P; `f(0) === 1` exactly.
2. **Exact arithmetic.** Every term is evaluated from integer release counts per week offset
   in a fixed offset order: per-(studio, genre) window counts, per-genre stock counts, and
   per-genre totals of clamped windows. Studio classification (over the cap or not) uses the
   same count-evaluated sum. So the numbers do not depend on input order, studio order or id
   labels at the bit level, which is what 1323-A §3's "swaps the normalized outputs exactly"
   asks for. Members are still canonicalized by `(week, releaseId)` before any fold
   (code-unit comparison, never `localeCompare`), and assessments come back in that order.
3. **Work bound (1323-F Amendment 3).** One pass folds each exposure, one pass folds each
   member, and each subject is derived in constant time. The subject's own release is taken
   out of its studio's window (`counts[0] − 1`), that studio is re-clamped, and the genre's
   clamped and unclamped totals are adjusted by the difference. The step counter increments once
   per exposure visited, once per member folded and once per subject derived, so it equals
   `active + 2 × members` exactly (5,024 on the hostile batch). The following work is outside
   the counter:
   - the canonical member sort (m·log m comparisons);
   - the per-genre finish, at most six genres of 22 stock offsets each;
   - bounded list maintenance, a sort of at most seven entries per fold.

   There is no pass over aggregates and no pairwise scan.
4. **Bounded top lists stay exact.** Each studio window keeps its six heaviest contributors
   (five plus one spare for self-exclusion), and each genre keeps the six clamped windows whose
   lead contributor is heaviest. A fold only makes a lead heavier (or ties it earlier by id), and
   a clamped window stays clamped, so an incrementally maintained bounded list equals the true
   top list. The heaviest five clamped releases always come from the five clamped windows with
   the heaviest leads, plus the subject's own window if it is still clamped without the subject.
5. **Reasons, one per applicable code** (1346-C2 model, 1346-F rules). Each reason's
   contributors are releases weighing their lane weight at the batch week. `value` is the full
   sum over all contributors. `sourceReleaseIds` lists the heaviest five in selection order,
   ties by ascending releaseId.
   - `SAME_WEEK_RELEASES`: the other same-genre batch members.
   - `WINDOW_RELEASES`: same-genre pre-batch exposures in the window lane.
   - `GENRE_SATURATION`: same-genre stock-lane exposures; `value = stockTerm`.
   - `STUDIO_CLAMPED`: the window-lane releases of every studio whose window, without the
     subject, exceeds the cap (strictly: exactly 1.00 is not clamped, as
     `market-studio-window-clamp` requires). `value` is those windows' full sum (see F2).
   - `NO_PRESSURE`: alone, exactly when pressure is 0.

   The array order is fixed: the four codes in 1323-A order, at most four entries, or
   `NO_PRESSURE` alone. So the cap of five is structural and no ranking across reasons exists.
6. **inputDigest.** `fnv1a64` (the repo helper in math.ts, no dependency) over
   `[definition, week, releaseId, studioId, genre, genreDigest]`. `genreDigest` is an order-free
   sum mod 2^64 of `fnv1a64([releaseWeek, releaseId, studioId])` over the genre's non-retired
   exposures and members. The subject's digest therefore covers exactly its own inputs (its
   genre's pre-batch snapshot and batch members) without sorting the active set. Retired
   exposures a caller still passes are not inputs and are excluded. TUNING values are not in the
   digest; the definition version names the law (see F4).
7. **Fail loud on malformed input.** Both entry points throw on:
   - a non-integer batch week;
   - an exposure released at or after the batch week (same-week releases are members, and
     reducing twice for one week would double count);
   - a genre outside `GENRE_ORDER`;
   - a releaseId that appears twice across exposures and members.

   A retired exposure passed to `assessBatch` is accepted and weighs nothing, because the
   harness passes the previous week's reducer output, which holds releases at offset 26.
8. **Reducer.** `from` is the lane at `week − 1` and `to` the lane at `week`, from `releaseWeek`
   and those two weeks alone, with no memory of earlier calls (1346-X decision 3). Appended
   members report no transition (1346-F). Kept exposures stay in input order and appended
   members follow in canonical order, so canonical input stays canonical without a sort.
   Exposures are returned by reference; nothing is mutated.

## GREEN (final, r3)

Command, from the scratch tree:
`node_modules/.bin/vitest run --project core tests/p15a1-shared-market.test.ts tests/p15a1-shared-market-harness.test.ts --reporter=verbose --reporter=json --outputFile.json=../green-r3.json`

```
VITEST-EXIT=0
 Test Files  2 passed (2)
      Tests  33 passed (33)
   Duration  4.85s (transform 499ms, setup 0ms, collect 444ms, tests 3.94s, environment 1ms, prepare 682ms)
```

Harness leaves (per-leaf durations from the JSON report; load average 12.3 at the start):

| Leaf | Duration | Budget |
|---|---|---|
| `market-harness-normal-stream-bounded-active-set-and-determinism` | 3,452 ms | 20,000 ms (explicit, in-file) |
| `market-harness-hostile-batch-work-bound-and-active-set` | 307 ms | 5,000 ms (core default) |

The other 31 leaves took 1 to 96 ms each (largest: `market-large-batch-linear-storage` 96 ms).
The raw verbose output, JSON and per-leaf list stay in the scratchpad (`green-r3-verbose.txt`,
`green-r3.json`, `green-r3-leaves.txt` under `…/scratchpad/1346-prod/`).

Earlier runs of the same production against the superseded REDs: r1 27/27 green (normal-stream
leaf 1,891 ms) with an earlier reason model (see F5), and r2 32/32 green. Under load average 38
the r2 normal-stream leaf took 9,596 ms. A timing probe on the final source split two full
6,240-week runs into 1,243 ms of production calls and 849 ms of the test's own per-week
release-log recount. I infer, without measuring it, that the rest of that leaf is `expect` and
canonical-JSON overhead plus machine load. These are wall-clock observations on a loaded shared
machine, not a performance claim.

## Type gates (r3 tree with production)

```
node_modules/.bin/tsc --noEmit -p tsconfig.json     ROOT-TSC-EXIT=0   (no output)
node_modules/.bin/tsc -p ui/tsconfig.json --noEmit  UI-TSC-EXIT=0     (no output)
npm run typecheck:bridge  (tsc -p tsconfig.bridge.json)  BRIDGE-TSC-EXIT=0  (no output)
```

## Writer cross-checks (throwaway probes, never in the patch)

- **Independent naive reference.** An O(n²) implementation written straight from the 1323-A §3
  prose, with its own per-code reasons, ran over 40 deterministic LCG batches: 20 sparse and
  20 dense, up to 2,300 exposures, 180 members and 60 studios. It covered 3,260 subjects. For
  every subject:
  - pressure, windowTerm and stockTerm matched within 4.3e-14 (max abs error);
  - codes and ids matched exactly, in selection order;
  - values matched to 1e-10;
  - the step count equalled `exposures + 2 × members`;
  - `pressure === windowTerm + stockTerm`.
- **Bit-identical invariance.** Twenty batches were each re-run after all three of: a studio-id
  bijection, a release-id bijection and a shuffle of both input arrays. Every subject's pressure,
  factor, windowTerm and stockTerm were `Object.is`-identical.
- **Malformed input.** Each of these throws with a specific message:
  - a duplicate member id;
  - an exposure dated in the batch week, which is what reducing twice for one week produces;
  - a non-catalogue genre;
  - a release passed both as an exposure and as a member;
  - a fractional batch week.
- **Defect injection** (each reverted by copy, sha256 re-checked):

| Injected defect | vs r1 (27) | vs r2 (32) | vs r3 (33) |
|---|---|---|---|
| M1 self-exclusion removed | 4 fail | 7 fail | not re-run |
| M2 stock lane dropped | **0 fail** (1346-D Blocking 1) | 4 fail | not re-run |
| M3 clamp removed | 1 fail | 1 fail | not re-run |
| M4 source ids kept in insertion order | not run | **0 fail** | 1 fail (`market-reason-source-ids-ordering-window-releases`) |

  The r1 column ran on the r1-era implementation (per-studio reasons, see F5); the r2 and r3
  columns ran on the final source. M2 against r1 reproduced 1346-D's Blocking 1 gap; r2 closes it. M4 against r2 showed that the
  set-only ordering leaf inserted its exposures already in selection order, so it could not
  distinguish "heaviest five" from "first five inserted"; r3's new window-releases leaf, with
  unsorted input, closes it.

## Findings

**F1: the factor's open lower bound needs a one-ulp floor.** `tests/p15a1-shared-market.test.ts:233`
and `:238` (r3 line numbers; leaf `market-factor-bounds-and-monotonicity`) assert
`pressureFactor(1000) > 0.75`, the literal "(0.75, 1]" of 1323-A §3. In IEEE-754 doubles the
correctly rounded value of `1 − 0.25·(1 − e^(−P/2))` is exactly 0.75 for every P above
roughly 72. So the plain formula fails the test, and no faithful rounding can pass it.
Production evaluates the formula and, when the result is not above `1 − maxPenalty`, returns
the next double above it. That value is 0.7500000000000001, which differs from the correctly
rounded formula by 1.1e-16 and only when P is above about 72. Probe rows:

| P | Plain formula | Law |
|---|---|---|
| 70 | 0.7500000000000002 | 0.7500000000000002 |
| 72 | 0.75 | 0.7500000000000001 |
| 1000 | 0.75 | 0.7500000000000001 |

This is not a contradiction of the authority, which states the open bound, so I did not stop.
It is a representational choice the parent should see. Alternative: drop the floor and amend
the leaf to test at P = 50, or to `toBeGreaterThanOrEqual(0.75)`. Recommendation: keep the
floor, because it realizes the approved range exactly and is immaterial to any money amount.

**F2: `STUDIO_CLAMPED.value` composition is unpinned.** 1346-C2 declined to pin it. I
implemented the literal 1346-F reading: the full lane-weight sum of the clamped windows'
releases. The record then states which releases were capped and their full weight. It cannot
reconstruct windowTerm, because each clamped window adds the cap and the number of clamped
windows is not in the record. Alternative: `value` = the pressure the cap removed,
Σ(Wk − cap). That gives `windowTerm = SAME_WEEK + WINDOW − STUDIO_CLAMPED` exactly, which helps
Wave 2 disclosure, but it makes "largest contributors" a proportional share rather than a lane
weight. Recommendation: decide at the Wave 2 disclosure charter. Nothing persists before Wave 2,
so either choice costs no migration.

**F3: the index export is not added** (see Files). This is a one-line follow-up if the parent
wants 1323-A §5 literally.

**F4: constants versus definition version.** The digest and `definitionVersion` do not include
the TUNING values. A Wave 4 REVISE of any `SHARED_MARKET_*` constant changes the law and should
bump `SHARED_MARKET_DEFINITION` in the same change. The TUNING comment says so. Wave 2
persistence should treat the version as the law's identity.

**F5: per-code granularity is pinned by prose, not by an assertion.** My first implementation
(r1 era) used one reason per contributing studio, ranked by value and capped at five. It
passed r1 27/27, because r1's cap leaf used seven same-week peers from seven studios. After
1346-C2 recorded "one entry per applicable code" and 1346-F bound the selection-order ids, I
rewrote the reasons per code (current patch). r3's `market-reasons-capped-at-five`
(`tests/p15a1-shared-market.test.ts:599`, `:635`) engineers one studio per code, so it would
also pass a per-studio model. A leaf with two same-week peers from two different studios,
asserting a single `SAME_WEEK_RELEASES` entry with both ids, would pin the model. This does not
block Wave 1.

## Evidence limits

This is the pure law only: no integration, P07 seam, persistence, save, Bridge, UI or Unity
work. I ran only the two P15A.1 test files, two throwaway probe files (removed from the tree
before the production commit), and the three type gates. I ran no broad suite. Durations come from a shared machine under heavy
load (load average 12 to 38). A green suite here shows the formula matches the charter and the
tests; it does not show the market plays well, which the Wave 4 playtest answers.

## Next action

Parent implementation review of `1346-stage/1346-p15a1-production.patch` against r3. Decide
F1 and F2 (routine) and F3 (optional). Then land the r3 RED and this patch as separate commits
via the index, and write the harness record. Per 1340-O, integrating shared-market pressure into
the live economy waits for the rival-shelving verification.
