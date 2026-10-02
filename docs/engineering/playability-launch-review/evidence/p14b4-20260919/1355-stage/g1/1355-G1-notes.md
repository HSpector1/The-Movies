# 1355-G1: notes on the G1 probe for P15A.1 Wave 2

Drafted read-only at HEAD e7f075ce. Nobody has run it. The probe is `1355-G1-probe.ts` (sha256
`5bea7a2fb5c5c70985fe90cbacf2db59633e008e34b50cd9b28a79f13074caad`, 15,817 bytes). E means
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/`.

G1 is Wave 2's own live-economy calibration. The Wave 1 pure-law harness is a different gate (E/1355-F3:43-45); the
probe borrows only the harness's way of feeding the law.

## Run

- **Tree.** Use a `git archive` of the HEAD under test with `node_modules` linked, the 1357-X layout
  (E/1357-X:14-27). Put the probe in `probe/` beside `tree/`. The tree must not carry P15A.1 Wave 2 production: the
  probe refuses a state with a `sharedMarket` root.
- **Command**, from `tree/`, under Node v20.20.2:

  ```
  PROBE_TREE_HEAD=<full sha> PROBE_WEEKS=6240 PROBE_SEEDS=p13a-core-causal-01,seed-b \
    ./node_modules/.bin/vite-node ../probe/1355-G1-probe.ts > out/g1.json 2> out/g1.err
  ```

  All three variables are required. A missing or malformed one stops the probe before the first tick. For a smoke
  run, set `PROBE_WEEKS=20 PROBE_SEEDS=p13a-core-causal-01`; it reads out at week 20.
- **Output.** One JSON document on stdout. stderr carries a start line, a progress line every 520 weeks and a `done`
  line per seed.
- **Open loop.** The probe never passes a factor to reception and never calls an action, so each route is exactly
  1357-P's route for the same tree and seed. It draws no random number. Two runs on one tree give the same document
  apart from `elapsedMs` and `msPerTick`.

## Expected run time

- 1357-X ran 6,240 weeks in 91.5 s on p13a-core-causal-01 and 362.5 s on seed-b, 14.7 and 58.1 ms per tick
  (E/1357-X:129-132), at b0809602. Between b0809602 and e7f075ce git changes only `docs/` and `HANDOFF.md`, so a tick
  costs the same.
- Each week the probe adds two scans of `hollywood.films`, one `assessBatch` call and one `reduceExposures` call, well
  under 1 ms against 14.7 to 58.1 ms per tick.
- Expect about 455 s (7.6 minutes) for both seeds, plus a few seconds of vite-node start-up. A 20-week smoke takes a
  few seconds.
- The release rows set the output's size, about 300 bytes per release at 2-space indentation, on top of roughly
  150 KB of summaries per seed.

## What to check first

1. Exit code 0. stderr ends with one `done` line per seed and holds no `WARNING` line.
2. `treeHead` names the tree you archived, `law` reads `p15a1-market-v1`, and `tuning` matches
   src/core/tuning.ts:1010-1016.
3. For each seed, `finalWeek` is 6240 and `dueSetWitness.mismatchWeeks` is 0. A non-zero count names weeks where the
   recorded releases differ from the batch that 1355-A §3.1 item 3 freezes. Production's witness (E/1355-A:65-67)
   would throw in those weeks, so treat a non-zero count as a Wave 2 defect to settle before recorded RED, not as a
   G1 value.
4. Sample size: `readouts[k].window.releases` and `studios[].releases`. 1357-X found no p13a rival with staff after
   week 2963, while seed-b's r05-r09 kept five or six staff to 2040 (E/1357-X:99-106). Expect p13a's late windows to
   hold few or no releases. An empty scope prints `noReleases` bands and null values.
5. The four `table` rows at `readouts[4].cumulative` (week 6240) for each seed, each with its band. Then the same rows
   at the earlier read-outs and in each window.

## Output fields and the spec lines they answer

Paths sit under `seeds[i]` unless marked top-level. `S` stands for one scope: `readouts[k].cumulative` or
`readouts[k].window`.

| Field | Spec line |
|---|---|
| `seed`, `route`, `startWeek`, `finalWeek` | E/1355-A:173-174, the two routes to week 6240 |
| top-level `readouts`; `readouts[k].week` | E/1355-A:174-175, read-outs at 520, 1560, 3120, 4680 and 6240 |
| `S.releases` | E/1355-A:179, "the release count" |
| `S.factorBelow1`, `S.factorAtMost095`, `S.factorAtMost090`, `S.factorAtMost085`, each a count and a share | E/1355-A:179, "the share with f < 1, ≤ 0.95, ≤ 0.90, ≤ 0.85" |
| `S.byGenre`, `S.byStudio`: count, first and last week, mean, deciles | E/1355-A:179-180, "deciles by genre and by studio" |
| `S.pressure.windowShare`, `S.pressure.stockShare` | E/1355-A:180, "the window and stock shares of pressure" |
| `S.gross.firstOrderGrossChange` | E/1355-A:180, "Σ gross · (1 − f) / Σ gross" |
| `S.table.medianFactor` | E/1355-A:189 |
| `S.table.p10Factor` | E/1355-A:190 |
| `S.table.lowestGenreMeanFactor` | E/1355-A:191; the genre-gap rule at :201-202 |
| `S.table.releasesWithFAtMost095` | E/1355-A:192 |
| top-level `bands`, `bandRule` | E/1355-A:187-192, the column floors |
| top-level `law`, `tuning` | E/1355-A:19, law `p15a1-market-v1`; tuning.ts:1010-1016 |
| `dueSetWitness` | E/1355-A:60-62 (§3.1 item 3) and :65-67 (item 5); facts 8-9 at :37-38; E/1355-F:7-24 |
| `studios` | E/1355-A:179, the release count per studio, studios with none included |
| `S.all` | the scope's whole distribution, for context |
| top-level `releaseColumns`, `releaseRows` | E/1355-A:178-179, "each route's recorded releases": one row per assessed release, so a table script can recompute any figure without a rerun |
| top-level `treeHead`; `elapsedMs`, `msPerTick` | provenance and cost, as 1357-P reports them |

The probe computes none of the G2 rows (E/1355-A:181-185, :193-197).

## Choices where the charter was open

1. **seed-b's route.** E/1355-A:173 writes "seed-b (`rivalFixture`) (1329-A:10-14)". E/1329-A:9-16 describes
   `rivalFixture()` as a natural search over `p13aGeneratedStudio()` on seed `p13a-core-causal-01`, and the helper
   agrees: tests/helpers/p14b2-fixtures.ts:249-265 calls `p13aGeneratedStudio()` with no seed, ticks to week 240 at
   most and imports vitest's `expect` at :3. Its route is the p13a-core-causal-01 route, so it cannot be the second
   route. The probe builds seed-b as `p13aGeneratedStudio('seed-b')`, which 1357-P ran under that name (E/1357-P:106;
   E/1357-X:26-27, the 362.5 s run) and which the suite uses (tests/p14b4-rival-seating-preference.test.ts:248-251,
   :459). `PROBE_SEEDS` takes any list, and every seed runs through `p13aGeneratedStudio(seed)`.
2. **Members come from the recorded releases.** §3.1 item 3 (E/1355-A:60-62) freezes the batch inside `tick` from
   the due set. Outside `tick` the probe sees only the produced state, so it assesses the releases that state records
   for week W and maps them as §3.4 item 3 (E/1355-A:118-120) maps films to assessments:
   - player `studio.releasedFilms` (types.ts:303-307) by `releaseTick`, with the concept's genre (types.ts:166-169)
     and `hollywood.playerStudioId`;
   - rival `hollywood.films` (hollywoodTypes.ts:163) with provenance `simulation/v1` (hollywoodTypes.ts:37-45), with
     the film's own `genre` and `studioId`, which hollywoodTick.ts:392-397 writes from the lookup `inputsFor` uses
     (:68-70).

   Two checks tie this reading to §3.1. The count check throws if any recorded release escapes its week. The due-set
   witness reads the due set from the state each tick receives, as player commitments (tick.ts:206-208) plus rival
   pictures at `remainingTicks` 1, and records any week that differs without stopping the run.
3. **Exposures.** E/1355-A:98-100 derives the active exposures as the releases after week W − 26. The probe keeps them
   with the law's reducer `reduceExposures` (sharedMarket.ts:340-362), called every week as the Wave 1 harness calls
   it (tests/p15a1-shared-market-harness.test.ts:111-118). The reducer holds week W − 26 for one extra call, and
   `assessBatch` skips it as retired (sharedMarket.ts:177), so every factor matches the §3.3 reading.
4. **Gross.** E/1355-A:180 does not define gross. The probe uses each release's recorded `boxOffice.total`
   (types.ts:264), the figure the factor would scale. The seam multiplies the opening (reception.ts:678, :697-703), and
   the total equals the discovered opening times legs (:750-751), so a release loses total · (1 − f) to first order.
   The studio's revenue share plays no part.
5. **Quantiles and deciles.** The charter names no estimator. The probe calls `quantile` from
   src/harness/d16/stats.ts (:8-19, :41-53), the repo's single lab definition: type 7, linear between order
   statistics, the NumPy default. `deciles` lists p0 (the minimum) through p100 (the maximum) in steps of 10. The
   `table` median and p10 come from the same function.
6. **Lowest genre mean factor.** The probe takes the unweighted mean of f over each genre's releases, among genres
   with at least one release in the scope. A tie goes to the earlier genre in `GENRE_ORDER`. The row prints the genre
   and its release count, so a genre with one film shows as one film.
7. **Pressure shares.** Σ windowTerm / Σ pressure and Σ stockTerm / Σ pressure over the scope. Each release's
   pressure is its window term plus its stock term (sharedMarket.ts:232-234), so the two shares sum to 1. A scope
   without pressure prints null.
8. **Read-out scopes.** `cumulative` runs from the route's first week up to the read-out week, exclusive. `window`
   covers the weeks since the previous read-out. The charter does not say which scope the gate reads, so both carry
   bands. Cumulative at 6240 covers the whole route.
9. **Band edges.** A value at or above the first floor reads Proceed, at or above the second reads Flag, and below it
   reads Retune. The probe compares raw float64 values without rounding. The f ≤ 0.95 row compares a share with 10%
   and has no Retune band (E/1355-A:192).
10. **The player.** The player gives no command on a natural route (E/1357-P:10-11), so it probably releases nothing.
    The probe still assesses any player release, and `studios` lists the player with its count.
11. **Authored-start films.** Rivals at rows 1-4 enter a fresh world with authored pre-campaign films
    (hollywood.ts:200, :263-267). Those films are history: §3.4 item 3 covers only `simulation/v1` films, and a fresh
    world's root starts empty at its creation tick (E/1355-A:137). The probe keeps them out of every batch.

## Named failures

The probe throws, with a message that starts `1355-G1:`, when:
- `PROBE_TREE_HEAD`, `PROBE_WEEKS` or `PROBE_SEEDS` is missing or malformed;
- the first state carries a `sharedMarket` root, so the tree already applies the factor;
- a state has no industry (E/1355-A:56);
- a player release has no concept;
- the law returns an assessment for an id outside the batch;
- the recorded release count and the assessed count differ after a week.

The law's own refusals (sharedMarket.ts:374-393) also stop the run: an exposure not before its batch week, a
duplicate release id, a genre outside the catalogue. A due-set mismatch does not stop the run. It prints one `WARNING`
line per seed and fills `dueSetWitness`.

## Type-check by reading

| Import | Export at e7f075ce |
|---|---|
| `tick` | src/core/tick.ts:194 |
| `p13aGeneratedStudio` | src/harness/p13a/fixtures.ts:9 |
| `SHARED_MARKET_DEFINITION`, `assessBatch`, `reduceExposures` | src/core/sharedMarket.ts:32, :139, :340 |
| type `MarketExposure`, type `MarketBatchMember` | src/core/sharedMarket.ts:46, :47 |
| `TUNING`, `GENRE_ORDER` | src/core/tuning.ts:27, :2196 |
| `quantile`, `mean` | src/harness/d16/stats.ts:41, :54 |
| type `GameState`, type `Genre` | src/core/types.ts:2298, :9 |

- Value imports and `import type` lines follow 1357-P. The probe uses every import and every local.
- Against tsconfig.json (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`,
  `exactOptionalPropertyTypes`), the probe declares no optional property and narrows each `IndustryFilm` to
  `simulation/v1` before it reads `result`.
- The `.ts` import specifiers match 1357-P and resolve under vite-node. A `tsc` pass over the file would need
  `allowImportingTsExtensions`, as it would for 1357-P.

## Reading aid

f(P) = 1 − 0.25 · (1 − e^(−P/2)) (sharedMarket.ts:102-109). f ≤ 0.95 needs P ≥ 0.446, f ≤ 0.90 needs P ≥ 1.022 and
f ≤ 0.85 needs P ≥ 1.833. A lone same-genre release by one other studio in the same week gives P = 1 and f = 0.902;
the same release a week earlier gives P = 0.55 and f = 0.940.
