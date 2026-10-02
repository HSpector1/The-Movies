# 1361-G2: notes on the G2 probe for P15A.1 Wave 2

Drafted read-only on 2026-10-02 at repository HEAD ec5ca7af, whose `src` equals e4be3e5c's (tree 762d8e09), and
revised the same day after the review [1361-G2-D](review/1361-G2-D-review.md) and the parent's response 1361-G2-F
(section "Edits after 1361-G2-D"). Nobody has run any file here.

E means `docs/engineering/playability-launch-review/evidence/p14b4-20260919/`, S means
`/Users/zacheryspector/studio-scratch`, and T means `tests/p15a1-market-integration.test.ts` at HEAD.

| File | Role |
|---|---|
| `1361-G2-probe.test.ts` | measures one tree per run: routes, rows, digests, read-outs, K3 |
| `1361-G2-report.test.ts` | ticks nothing: compares the runs and bands every G2 row and K1-K5 |
| `1361-G2-trees.sh` | builds the control, candidate and K4 trees; runs no node |
| `1361-G2-run.sh` | runs one stage in the heavy lane |
| `1361-G2-review-checklist.md` | for the independent reviewer |

Byte counts and sha256 are at the end.

## What G2 must answer

- **The gate.** 1355-A §5 G2 (E/1355-A:181-185): the frozen step-(c) candidate against the control at the RED commit,
  on the same routes. It reports per-studio gross ratio; rival weeks below reserve and below zero; player cash and
  Standing; rival stall weeks, shelvings, retries, the longest no-greenlight streak and the last filming week; `decide`
  outcomes by kind; root and save bytes; median and p95 tick time.
- **The thresholds.** E/1355-A:187-197, with K1 to K5 (E/1355-A:161-169) exact.
- **The frame.** 1361-F ruling 11 (E/1361-F:76-93):
  - seeds `p13a-core-causal-01` and seed-b, built as `p13aGeneratedStudio('seed-b')` (E/1355-X4:20-21);
  - read-outs at 520, 1560, 3120, 4680 and 6240;
  - the control is an archive of e4be3e5c, and K3 migrates a Save44 save (E/1361-R:808 on the charter's "Save43");
  - the candidate is P15A.1's frozen (c) on slice 2a's production.
- **What follows.** Proceed or Flag keeps (c) in the shared step. On a Retune, P15A.1 takes its fallback to its own
  later step and its retune, and slice 2a lands at Save45 with P15C if G-P passed (1361-F2 ruling 3, which corrects
  1361-F rulings 11 and 13). A Defect in K1-K5 goes to a production fix and a new G2 (1361-F2 ruling 4.4).
- **Why G1's probe could not serve.** It computes none of these rows (E/1355-stage/g1/1355-G1-notes.md:83) and refuses
  a tree that carries `sharedMarket` (notes :12-14).

## Design

- **One source on every tree.** The probe detects the tree from its first state:
  - no `sharedMarket` root reads as the control;
  - a root with `SHARED_MARKET_FACTOR_MAX_PENALTY` at 0 reads as K4;
  - any other root reads as the candidate.

  `PROBE_EXPECT` must name the same tree, or the run stops before its first tick. The control computes every row
  that needs no root, and its root fields stay null.
- **The route** is G1's: `p13aGeneratedStudio(seed)`, then `tick` once a week, to `PROBE_WEEKS`.
- **Every processed week W** (the tick from market.tick W to W + 1) records:
  - **releases:** player `releasedFilms` and rival `simulation/v1` films, each with its `boxOffice.total`;
  - **assessments,** on a tree with the root: the rows appended that week. They must match the week's releases one
    to one, by id, studio and genre (E/1355-A:118-120), or the run stops.
  - **per rival:**
    - stall weeks, weeks below reserve and weeks below zero, kept as intervals;
    - the weeks of its greenlights, shelvings and first takes;
    - every `decide()` evaluation by outcome, ready loop and retry apart;
  - **tick milliseconds;**
  - **one digest per top-level key** of the state without its P15 roots, appended to `digests-<seed>.jsonl`.
- **Each read-out** records:
  - player cash and Standing;
  - the canonical save's bytes and sha256 (`exportCurrentState`, which runs the live validator);
  - the `sharedMarket` root's bytes;
  - a full recheck of the memoized digest.
- **K3's input.** The control also writes its Save44 save at K3's week (520).
- **K3's run.** After each seed's route, the candidate loads that save, migrates it, and ticks it to the first week
  whose batch holds a factor below 1. It then ticks that week again with the factor held at 1.
- **The report** compares the runs per seed, per read-out and per scope, then bands each row. It reads K1 and K2 from
  the RED leaves' JSON and K4's second clause from the era-guard leaf's JSON.

### decide() outcomes without a source patch

`evaluate()` (hollywoodTick.ts:213-237) makes three calls through module exports, in a fixed order:
1. `promisedCastMasks` at :220, the evaluation's first call;
2. `chooseIndustryPackage` at :233, which a staffing block (:225) never reaches;
3. `searchIndustryPackages` at :236, only after a null choice.

So three pass-through spies see every evaluation and its outcome:
- **viable:** the chooser returned a package;
- **cashBlocked or economicRejection:** the search's `unaffordable` count is above 0, or 0;
- **staffingBlocked:** no chooser call followed.

The 1344-s7 decide diagnosis spied the chooser alone and could not see staffing blocks
(E/1344-stage/s7/NOTES.md item 1). Three checks guard the reading:
- a spy call that follows no open evaluation stops the run by name;
- so does an evaluation still pending after its tick;
- viable evaluations must equal the `filmAnnounced` receipts of each studio-week.

A retry is an evaluation of a screenplay that sat outside the index when the week began (`shelvedScriptIds`,
hollywoodTypes.ts:142-145). Spies keep each call's arguments, so the probe clears them after every tick.

### State digests

- **The rule.** `token()` applies `stableStringify`'s text rules (save.ts:685-713) and replaces each nested object or
  array by the sha256 of its own text, memoized by object identity. Two states get equal digests exactly when their
  `stableStringify` texts are equal.
- **The cost.** A week rehashes only the objects its tick created, plus each array the tick copied. A full
  `stableStringify` of every state would cost minutes per route on seed-b.
- **The assumption.** The memo assumes no tick edits an object it already returned. Each read-out recomputes the whole
  state with a fresh memo and stops the run on any disagreement.
- **The output.** Each line keeps a 72-bit digest per top-level key, so a mismatch names the keys that differ.

## Runner: vitest

- **The spies need it.** The decide counts and K3's factor-1 week need spies on src module exports.
  - `vi.spyOn` on those exports is established here: the 1344-s7 decide diagnosis,
    `tests/helpers/p14c3-canonical-rival-fixtures.ts:231` and `tests/bridge-p14b4-cast-class.test.ts:479`.
  - Under vite-node the probe would have to redefine vite's export getters by hand.
- **Placement.** The probe sits in each tree's `tests/`, which `vitest.config.ts` includes.
- **Output.** stdout belongs to the reporter, so all output goes under `PROBE_OUT`.
- **Progress.** Progress lines go to `PROBE_OUT/progress.txt`. vitest relays console output asynchronously, and the
  probe's body is one synchronous call.
- **Timeout.** vitest 2.1.9 arms a test's timer only after a synchronous body returns
  (tests/p15a2-power-ranking-archive-harness.test.ts:16-19). The `it` timeout is 24 hours, so it cannot cut a run short.

## Trees and files

`1361-G2-trees.sh <tag>` builds `S/1361-g2/run/{control,candidate,k4}/tree`:
- control: `git archive` of e4be3e5c from the repository;
- candidate: `git archive` of the frozen tag from `S/1361-prod/tree`;
- k4: the same archive with one edit in `src/core/tuning.ts`, `SHARED_MARKET_FACTOR_MAX_PENALTY: 0.25,` to
  `SHARED_MARKET_FACTOR_MAX_PENALTY: 0,` (tuning.ts:1014 at HEAD).

The script stops with `STOP:` when:
- `run/` exists, or e4be3e5c or the tag does not resolve;
- an archive, link or copy fails;
- the old tuning text does not occur exactly once, or the K4 tree differs from the candidate in more than that line
  (`run/k4/edit.diff`);
- the control's or the candidate's `src/core` calls `promisedCastMasks`, `chooseIndustryPackage` or
  `searchIndustryPackages` from another module anywhere but hollywoodTick.ts's four sites
  (`run/<role>/decide-calls.txt`). The spies would count another caller as an evaluation. A call inside a function's
  own module never reaches its spy, so only that module is left out of its grep.

Each tree holds:
- `src`, `generated`, `package.json`, `package-lock.json`, `tsconfig.json`, `tsconfig.src.json`, `vitest.config.ts`;
- `tests` without `tests/fixtures`;
- `node_modules` linked to the repository's;
- both G2 files copied to `tests/`.

Without `vitest.workspace.ts`, vitest uses `vitest.config.ts` (node environment) and needs no `--project` flag. No G2
file reads a fixture. The script writes `run/<role>/HEAD` with the full sha and `run/out/g2-files-sha256.txt` with
every copy's hash.

## Run

```
G=/Users/zacheryspector/studio-scratch/1361-g2
L=/Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh
bash $G/1361-G2-trees.sh p15a1-c-r1
bash $L 0 $G/run/out/lane-smoke.log bash $G/1361-G2-run.sh smoke
bash $L 0 $G/run/out/lane-control.log bash $G/1361-G2-run.sh control
bash $L 0 $G/run/out/lane-candidate-1.log bash $G/1361-G2-run.sh candidate-1
bash $L 0 $G/run/out/lane-candidate-2.log bash $G/1361-G2-run.sh candidate-2
bash $L 0 $G/run/out/lane-k4.log bash $G/1361-G2-run.sh k4
bash $L 0 $G/run/out/lane-era-guard.log bash $G/1361-G2-run.sh era-guard
RED_JSON=/Users/zacheryspector/studio-scratch/1361-prod/x/r2c/p15a1.json bash $L 0 $G/run/out/lane-report.log bash $G/1361-G2-run.sh report
```

- **Order.** The control runs before either candidate run, because K3 reads its save. A candidate run checks that
  first and stops before its routes when the control run is missing, incomplete or ran another horizon. K4 needs only
  the trees. The report runs last.
- **Smoke.** `smoke` runs every stage at 40 weeks on `p13a-core-causal-01` into `run/out/smoke-*`, with K3 at week
  20. It should take seconds per stage. A smoke report reads "incomplete" without `RED_JSON`, and its K3 may read
  notRun when no factor falls below 1 inside 40 weeks. Neither matters there; the smoke tests the plumbing.
- **The candidate** is `p15a1-c-r1` = c5249114, on slice 2a r2 (`p15a2-r2` 5eccada2), after `p15a1-a-r1` 39d0481f and
  `p15a1-b-r1` 10747443 (1361-G2-F ruling 3).
- **RED_JSON.** The parent's dry run of the three 1355 RED files on the frozen tag writes it
  (`S/1361-prod/x/r2c/p15a1.json` from `run-1361-X.sh`). Those leaves read the K1, K2 and M0A pins from
  `tests/fixtures`, which only the writer's tree links.
  - The report finds the two leaves titled "(K1)" and the two titled "(K2)" (T:417, :430, :455, :467). All four must
    pass.
  - The same JSON holds the era-guard leaf on the unedited candidate. It must pass: it is K4's contrast.
  - The report refuses to run unless the first line of `run.meta` beside the JSON names a short sha that prefixes the
    candidate's tree head. At r2c that line reads `start at p15a1-c-r1 c524911, node v20.20.2`
    (1361-G2-F ruling 1.4).
- **Node.** `1361-G2-run.sh` pins Node v20.20.2 and refuses any output that exists. Each probe run writes `g2-run.json`,
  `digests-<seed>.jsonl` and `progress.txt` under `run/out/<label>/`, plus `error.txt` with the stack when it fails.
  The control also writes `k3-save-<seed>.json`, and each candidate run writes `k3-digests-<seed>.jsonl`. The report
  writes `run/out/report/g2-report.{json,md}`.

| Variable | Read by | Meaning |
|---|---|---|
| `PROBE_EXPECT` | both files | `control`, `candidate` or `k4` for the probe; `report` for the report |
| `PROBE_TREE_HEAD` | probe | the archived commit's full sha |
| `PROBE_WEEKS`, `PROBE_SEEDS` | probe | 6240; `p13a-core-causal-01,seed-b` |
| `PROBE_OUT` | both | a directory that must not exist |
| `PROBE_K3_FROM` | probe, candidate only | the control run's directory |
| `PROBE_CONTROL`, `PROBE_CANDIDATE` | report | the control run; one or two candidate runs, comma-separated |
| `PROBE_K4`, `PROBE_RED_JSON`, `PROBE_ERA_GUARD_JSON` | report | optional; a missing one reads notRun and the verdict "incomplete". A `PROBE_K4` directory that exists without a finished run reads Defect |

## Expected run time and memory

**Measured references:**
- **G1** (E/1355-stage/g1/1355-G1-progress.txt, at 975e72a1, Node v20.20.2, alone):
  - p13a-core-causal-01: 82 s, 13.1 ms a tick;
  - seed-b: 352 s, 56 ms a tick, rising from 13 s for its first 520 weeks to 78 s for its last 520 (150 ms a tick);
  - 1357-X measured 91.5 s and 362.5 s at b0809602 (E/1357-X:132).
- **1359-P** (`tests/fixtures/p15/p15c2-route-l-captures/MANIFEST.json` `routeMs`):
  - 6,188 headless weeks: 1,978 ms;
  - 53 industry weeks after a founding at 6188: 3,653 ms (69 ms a week);
  - 6,118 ms in all.

  That bounds a young industry's week, not a 6,000-week one.
- **1356-X3** (E/1356-X3:32-33): `p13a-core-causal-01` to 6240 with the ranking step:
  - a 6,163,996-byte save;
  - `makeSave` 528 ms;
  - validation 290 ms.

**What the probe adds per week:**
- the spies and one `rivalWeeklyOperatingCost` per rival, both small;
- the digest of the week's new objects. This is the least certain cost: an array the tick copies is re-joined in
  full, memo hits included, and a late seed-b state holds tens of thousands of receipts. Expect 10 to 30 percent over
  G1's times.

**What it adds per route:**
- five read-outs at about 1 to 5 s each;
- on the candidate, K3 from week 520 to the first pressured week:
  - seed-b releases often, so K3 should end within weeks;
  - p13a released only 18 films in weeks 520-1559 under G1 (E/1355-X4:47-54), so its K3 may run on, at most to 6240
    (about 80 s).

G1's times include `assessBatch` every week, so the control's tick runs slightly under G1's and the candidate's near
it.

| Run | p13a-core-causal-01 | seed-b | Whole run, with about 10 s of vitest start |
|---|---|---|---|
| control | 90-130 s | 380-520 s | 8-11 min |
| candidate-1, candidate-2 | 100-210 s | 400-560 s | 9-13 min each |
| k4 | 95-130 s | 390-540 s | 8-12 min |
| era-guard, report | | | under 1 min each |
| smoke, six stages | | | under 2 min |

About 40 to 55 minutes of heavy lane in all. The progress lines every 520 weeks give the live rate.

**Memory and disk:**
- **Heap.** G1 held one state at a time. G2 adds three things:
  - the digest memo: one 44-character string per live state object, likely tens of MB to a little over 100 MB at
    seed-b's late states;
  - each read-out's save text, transient;
  - about 2,000 release and assessment rows per seed-b run.
- **The fork.** vitest runs the file in a forked child under Node's default heap limit, which V8 sets from physical
  memory. Every progress line prints `heapUsed`. If a stage nears the limit or dies on a heap error, rerun it with
  `NODE_OPTIONS=--max-old-space-size=5120` before the lane command; the lane and the fork inherit it. Go no higher:
  the machine has 8 GB of memory and a nearly full disk to swap onto (1361-G2-D item 9; 1361-G2-F ruling 2).
- **Disk.** Digests take about 1.3 KB per week per seed. If p13a's K3 runs to 6240, each candidate run adds 5,721
  lines, so the four runs write about 80 to 90 MB, plus a few MB per K3 save (1361-G2-D item 11).
- **What the record keeps.** The run files stay in scratch. The report lists each one's size and sha256 under "Run
  files", and the record carries that list (1361-G2-F ruling 2).

## What to check first

1. `run/out/runs.meta`: every stage exits 0 except `era-guard`, where vitest exits 1 because the leaf fails, as it
   should. Each `<label>.vitest.txt` shows one passed test.
2. Each `progress.txt` start line names the tree, `Save44` for the control and `Save45` for the candidate and K4, and
   one probe sha256. Every seed ends with a `done` line. No K3 line carries `ERROR`.
3. `run/out/report/g2-report.md`: the overall verdict and its route, the rows below Proceed with theirs, the
   threshold table, K1-K5, the report-only rows and the run files. Every window and every rival are in
   `g2-report.json`.
4. `run/out/g2-files-sha256.txt`: the six copies equal the reviewed files.

## The §5 rows and K1-K5 in code

P is the probe and R the report.

| Charter item | Computed in |
|---|---|
| Routes and read-outs (E/1355-A:173-175; E/1361-F:80-83) | P `measureSeed`, `READOUT_WEEKS`; seeds from `PROBE_SEEDS` |
| Per-studio gross ratio (:182) | P release rows; R `side().gross`, `reportOnly.grossByStudio` |
| Rival weeks below reserve and below zero (:182) | P stall-and-cash loop; R `rivalWeeksBelowReserve` (report only), gated `rivalWeeksBelowZero` |
| Player cash and Standing (:182-183) | P `readout()`; R `reportOnly.player` |
| Rival stall weeks (:183) | P `stall` intervals; R gated `rivalStallWeeks` |
| Shelvings (:183) | P `screenplayShelved` receipts; R `shelvings` |
| Retries (:183) | P decide spies, `retry:*` counts; R "retries" |
| Longest no-greenlight streak (:183) | P greenlight weeks; R `gaps()`, `longestNoGreenlight` |
| Last filming week (:183) | P first takes; R `lastFilmingWeek`, also read by "stops for good" |
| `decide` outcomes by kind (:184; hollywoodTick.ts:225-236) | P `installSpies`, `ready:*` and `retry:*`; R `decide` |
| Root and save bytes (:184) | P `readout()`; R gated `rootShare`, `reportOnly.saveBytes` |
| Median and p95 tick time (:184-185) | P `step()`; R `tickMs`, report only |
| Median factor, p10, lowest genre mean, share f ≤ 0.95 (:189-192) | R `factors()` on the candidate root's rows |
| Industry gross, candidate over control (:193) | R `industryGross` |
| Stall row, below-zero row, root/save row (:194-196) | R `stallBand`, `zeroBand`, `shareBand` |
| **K1** (:165) | **Pinned by the RED.** MANIFEST at 601ea709: k1 week 21, committed null; leaves T:417 and T:430. R `pinControl('K1')` re-confirms both leaves on the frozen candidate |
| **K2** (:166) | **Pinned by the RED.** MANIFEST k2 week 12; leaves T:455 and T:467. R `pinControl('K2')` |
| **K3** (:167) | **G2 computes.** P writes the control's Save44 save at 520; P `runK3`, `tickAtFactorOne`; R `judgeK3` |
| **K4** (:168) | **G2 computes.** The K4 tree's run; the era-guard leaf T:688 in that tree and, as the contrast, in RED_JSON; R `judgeK4` |
| **K5** (:169) | **G2 computes.** Two candidate processes; R `judgeK5` |

- **The RED pins K1 and K2 only.** The M0A pin is a RED control, not a K row. The RED pins no K3, K4 or K5 value:
  1355-F4:41 makes "G2's rerun at the RED commit" K3's baseline, and 1360-F2 ruling 6 (E/1360-F2:67-68) places it on
  an archive of e4be3e5c.
- **K3 passes when** five things hold:
  1. the migrated root is `{version 1, recordedFromWeek: 520, assessments: []}`, and K3 migrated Save44 to Save45;
  2. every digest from week 520 through the first pressured week W equals the control's;
  3. the state after week W differs from the control's;
  4. the factor-1 twin of week W equals the control's, and the spy saw factored `resolveReception` calls;
  5. every path where the two differ lies inside K1's pressured chain (`k1AllowedPaths`,
     tests/helpers/p15a1-market-route.ts:447-475), and at least one path differs.

  A seed with no factor below 1 after week 520 passes the equality clause and leaves "first differs there"
  untested. K3 needs at least one exercised seed.
- **K4 passes when** four things hold:
  1. the K4 tree's digests equal the control's every week from 0 to 6240 on both seeds;
  2. every K4 factor is exactly 1;
  3. the era-guard leaf fails in the K4 tree with a message naming `SHARED_MARKET_FACTOR_MAX_PENALTY`;
  4. the same leaf passed on the unedited candidate in RED_JSON.

  If the leaf passes in the K4 tree, the guard misses a changed constant. If it fails on the unedited candidate, its
  K4 failure shows nothing. Either reads Defect. The report also requires the K4 run's head, save step, law and
  market tuning to equal the candidate's, apart from the penalty at 0; any difference reads Defect, "defect or setup".
- **K5 passes when** the two candidate runs wrote identical digest files, identical K3 files, identical read-out save
  hashes and identical rows apart from `elapsedMs`, `tickMs`, `k3Ms` and `saveMs`.

## Choices where the charter was open

1. **Week labels.** Every fact carries its processed week W. A read-out at R covers W < R: everything the state at tick
   R records, G1's `r.week < week`. A first take's receipt carries W + 1 (tick.ts:1134-1142); the probe stores W.
2. **Gross** is each release's `boxOffice.total` at release, as in G1 (1355-G1-notes.md item 4). Industry gross sums
   every studio, the idle player included.
3. **Stall week** (E/1355-A:183). Three things hold in week W:
   - the week starts with a ready screenplay in the rival's active index;
   - the week starts with no production;
   - no `filmAnnounced` receipt names the rival in week W.

   Shelved screenplays keep status `ready` outside the index (hollywoodTypes.ts:140-145) and do not count. A rival
   frozen on two screenplays (E/1357-R:12, §2) stalls every week to 6240. The stall and below-zero rows compare sums
   over rivals; `g2-report.json` keeps each rival's values.
4. **New streak** (E/1355-A:194): a candidate stall streak of at least 52 weeks within the read-out's scope that
   overlaps no stall streak of at least 52 weeks the same rival has in control over the whole run (1361-G2-F ruling
   1.2). A read-out that cuts the control's streak short therefore cannot create a new streak. The longest
   no-greenlight streak is reported per rival and gates nothing.
5. **"A rival that films in control stops for good"** (:194). The band reads it by a year: the control rival films at a
   week at least 52 weeks after the candidate rival's last filming week over the whole run, or the candidate rival never
   films. The literal reading, any earlier last filming week, prints beside it as `stopsLiteral`. On p13a the control's
   rivals all stop filming: no release follows week 3120 (E/1355-X4:47-58). The literal reading would read Retune on
   a one-week shift in that collapse. The parent ruled for the year reading (1361-F2 ruling 4.1); the report prints
   both lists.
6. **Reserve and zero:** end-of-week cash after week W against `rivalWeeklyOperatingCost` at W + 1 times
   `reserveWeeks`, 1357-P's reading (E/1357-P-condition-probe.ts:65-71, :161). Only below zero gates (:195).
7. **Filming week:** the first shooting week completing (`FirstTakeReceipt`, types.ts:2129-2142), 1329-A's "stop
   filming" reading (E/1344-stage/s7/NOTES.md item 2). Greenlight weeks print too.
8. **Retries:** retry evaluations by outcome, all four kinds. Both readings of 1344-s7's NOTES item 1 follow:
   attempts are the sum, and state-changing retries are viable plus economicRejection.
9. **Longest no-greenlight streak:** weeks without a `filmAnnounced` receipt, from the rival's first week as a business.
10. **The increase rows compare integers** (1361-G2-F ruling 1.3). Stall reads Retune at `10*c > 11*k`, Flag at
    `c > k` short of that, and Proceed at `c <= k`. Below-zero weeks read Retune at `4*c > 5*k`, Flag at
    `10*c > 11*k` short of that, and Proceed otherwise. Exactly +10% and +25% therefore land as the table says. A zero
    control against a positive candidate reads Retune (1361-F2 ruling 4.3), which the same comparisons give.
11. **Gating scope.** The cumulative scope at every read-out gates (1361-F2 ruling 4.2). Windows print bands and gate
    nothing. The overall verdict is the worst gated band, in the order Defect, Retune, incomplete, Flag, Proceed. "No
    releases" gates nothing. Each verdict prints its route: a production fix and a new G2 for Defect, a storage fix
    before Wave 3 for a root share over 2%, a tuning amendment for any other Retune, a rerun for incomplete.
12. **Root share:** `stableStringify(sharedMarket)` bytes over the canonical save's bytes at each read-out. Slice 2a's
    `powerRanking` root counts in the save, not in the root.
13. **Estimators and edges.** Quantiles use d16's type 7, and the ratio bands compare raw floats (G1 items 5 and 9).
    The f ≤ 0.95 row has no Retune band. The table prints the lowest genre's release count beside its mean.
14. **K3's week** is 520, the first read-out, where the control writes its save. A run under 1,040 weeks uses weeks / 2.
15. **K3's "in that film"** uses K1's allowed paths after a factor-1 twin of the pressured week. The twin holds the
    factor at 1 at the reception seam, so the batch and the root run unchanged and stay law-exact for any validator.
16. **K5** runs in two separate processes, as 1344-s7's determinism control did (NOTES item 11).
17. **A failed K row** reads Defect, never Retune, with "defect:" or "defect or setup:" in its evidence (E/1355-A:197;
    1361-F2 ruling 4.4).

## Named failures

The trees script's stops are listed under "Trees and files". The probe throws with a message that starts `1361-G2:`
in these cases:
- **Setup:**
  - an environment variable is missing or malformed;
  - `PROBE_OUT` exists;
  - `PROBE_EXPECT` disagrees with the first state;
  - a candidate's `PROBE_K3_FROM` holds no complete control run with the same weeks, K3 week and a save per seed;
  - a state has no industry.
- **Lists:**
  - an append-only list shrinks;
  - a `filmAnnounced` or `screenplayShelved` receipt names no rival or another week;
  - a business leaves the industry;
  - a first take names an unknown studio.
- **The decide spies:**
  - a spy call follows no open evaluation;
  - an evaluation is still pending after its tick;
  - a studio-week's viable evaluations differ from its `filmAnnounced` receipts.
- **Releases and the root:**
  - a release's `releaseTick` differs from its week;
  - a player release has no concept;
  - the control gains a root;
  - the candidate's root goes missing or shrinks;
  - a week's assessments do not match its releases one to one.
- **Read-outs:**
  - the memoized digest disagrees with a fresh one;
  - `makeSave`'s validator refuses the state.

A failed run writes its stack to `error.txt`, and the report quotes the first line. K3 records its errors in the run
instead of throwing, so the routes' data survives, and the report reads the error as a K3 failure.

The report throws when:
- the control run or a candidate run is missing or incomplete;
- a candidate run differs from the control in probe sha256, weeks, read-outs, K3 week or seeds;
- the control does not run Save44, or a candidate run does not run Save45;
- the candidate runs name different trees;
- `PROBE_RED_JSON` is set and the `run.meta` beside it does not start with a short sha of the candidate's head;
- a digest file repeats a week.

An absent `PROBE_K4` directory reads K4 notRun. A K4 directory without a finished run, or with a run that differs
from the candidate in frame, head, save step, law or market tuning apart from the penalty, reads K4 Defect, "defect
or setup", and the other rows still report. A missing RED or era-guard JSON reads notRun.

## Limits

1. **Gross at release.** The rows read box office at release. The gross a run actually pays inside a scope differs for
   releases near a read-out.
2. **The decide call order.** The spies rely on hollywoodTick.ts:213-236's call order. A candidate that reorders
   `evaluate()` stops the run by name, and the counts then need a new reading.
3. **The memo.** It is rechecked only at read-outs. A stale digest that cleared before the next read-out would go
   unseen.
4. **One K3 save per seed.** K3 starts from one save per seed at week 520. RED 16 covers the genuine capture below the
   step and a Save42 capture (T:737-803).
5. **K3's round trip.** K3 compares a save round trip with the control's unsaved route. `makeSave` copies the state
   through JSON (save.ts:6571-6576), so the canonical text survives, but a -0 becomes 0. If a later week's arithmetic
   read the sign of a zero, K3 would fail at that week. The RED's in-flight replay leaf (T:524-540) asserts equal
   terminal saves after 30 weeks.
6. **K4's two productions.** K4 compares slice 2a plus P15A.1 with e4be3e5c. A slice 2a change outside its roots fails
   K4 as well, and the per-key digests name the key.
7. **K1 and K2 come from outside G2.** Their leaves need `tests/fixtures`, which the G2 trees omit.
8. **Tick time.** The spies' calls fall inside the timed tick on every tree, so the comparison holds and the absolute
   times run slightly high.
9. **A failure ends the run.** The probe stops at the first inconsistency. A failure in seed-b loses seed-b's route;
   `g2-run.json` keeps p13a with `complete` false, and the report refuses the run.
10. **p13a's thin economy.** p13a releases nothing after week 3120 under G1, so its later windows read "no releases".
    K3 on p13a may find no pressured week after 520.

## The frozen candidate, read before the run

The candidate exists now, so the first nine questions this section used to leave open were answered by reading
`p15a1-c-r1` (c5249114) with `git show` and `git grep` in `S/1361-prod/tree`. Nothing ran.

1. **The root at week 0.** `initialP15Roots` adds `sharedMarket: initialSharedMarket(week)` (save.ts:10880-10883), an
   empty v1 root from the creation week (marketIntegration.ts:23), and slice 2a spreads it into `generateWorld`.
2. **The migration.** `LIVE_SAVE_VERSION` is 45 (save.ts:6585). `convertV44ToV45` adds `initialP15Roots` at the
   save's own tick (save.ts:10974-10978), so K3's migrated root starts empty at 520.
3. **The seam.** The player site passes `competitionFactor: frozenFactor(...)` in the reception inputs (tick.ts:622-623),
   and the rival site passes `{...inp, competitionFactor: factor}` (hollywoodTick.ts:414-416). Both call the exported
   `resolveReception`, so K3's twin reaches them. A factor outside `[1 - penalty, 1]` throws (reception.ts:688-691).
4. **decide().** `git diff p15a2-r2 p15a1-c-r1 -- src/core/hollywoodTick.ts` changes nothing in `decide()`. The
   call-site guard finds the same four calls at hollywoodTick.ts:220, :233, :236 and :324 at e4be3e5c and at the
   candidate.
5. **The row names.** The persisted row keys include `week`, `releaseId`, `studioId`, `genre`, `factor` and
   `pressure` (marketIntegration.ts:104-105).
6. **K4's validator.** The era map gives v1 the live `TUNING` (marketIntegration.ts:107), so the K4 tree's batch and
   validator agree at penalty 0.
7. **The tuning line.** `SHARED_MARKET_FACTOR_MAX_PENALTY: 0.25,` occurs once in tuning.ts.
8. **The root list.** The candidate's `P15_ROOTS` holds four keys, `sharedMarket` among them.
9. **The definition** is still `p15a1-market-v1` (sharedMarket.ts:32), so the era-guard leaf compares v1's values.

Still unknown until the run:
- **Cost:** run time and heap with a growing root (about 2,000 rows on seed-b by G1's count) and its validator at each
  read-out.
- **Other movement:** whether slice 2a or commits (a) to (c) move any key outside the P15 roots. K4 answers it.
- **Save45 types:** vitest strips types, so a type error cannot stop a run. The files were checked by reading only.

## Type-check by reading

| Import | Export at HEAD (src equals e4be3e5c's) |
|---|---|
| `tick` | src/core/tick.ts:194 |
| `rivalWeeklyOperatingCost` | src/core/hollywood.ts:106 |
| `chooseIndustryPackage`, `searchIndustryPackages` (namespace) | src/core/hollywoodPolicy.ts:83, :40 |
| `shelvedScriptIds` | src/core/hollywoodTypes.ts:142 |
| `promisedCastMasks` (namespace) | src/core/promises.ts:842 |
| `resolveReception` (namespace) | src/core/reception.ts:776 |
| `stableStringify`, `LIVE_SAVE_VERSION`, `exportCurrentState`, `importSave`, `migrateToLive` | src/core/save.ts:685, :6567, :6594, :6600, :10176 |
| `SHARED_MARKET_DEFINITION` | src/core/sharedMarket.ts:32 |
| `TUNING`, `GENRE_ORDER` | src/core/tuning.ts:27, :2196 |
| types `GameState`, `Genre`, `Standing` | src/core/types.ts:2324, :9, :279 |
| `p13aGeneratedStudio` | src/harness/p13a/fixtures.ts:9 |
| `quantile`, `mean` | src/harness/d16/stats.ts:41, :54 |
| `P15_ROOTS`, `stripP15` | tests/helpers/p15-roots.ts:10, :13 (also at e4be3e5c, with three keys) |
| `diffPaths`, `k1AllowedPaths` | tests/helpers/p15a1-market-route.ts:428, :447 (present at e4be3e5c) |

- **Literal types.** `TUNING` ends `as const` (tuning.ts:1057), so the probe widens the penalty to `number` before
  comparing it with 0.
- **Tuple returns.** Labelled tuple types carry the rows. Each tuple a function returns is annotated.
- **Type imports.** The report imports only types from the probe file, and esbuild erases them, so the report never
  runs the probe.
- **The `strict` flags.** Neither file declares an optional property. Each spy's mock takes the original's
  parameters as one rest tuple and forwards them all. Both files were checked by reading against tsconfig.json (`strict`, `noUnusedLocals`,
  `noUnusedParameters`, `noImplicitReturns`, `exactOptionalPropertyTypes`).

## Edits after 1361-G2-D

1361-G2-D held the probe on four required edits, and 1361-G2-F adopted them with the recommended items 5 to 10. Line
numbers refer to the files in the table below. P is the probe, R the report, TS the trees script and RS the runner.
The review's own numbering is used: its item 10 (the trees script) and the record-keeping half of its item 11 are both
done, since the parent's list and the review's numbering differ there.

**Required**
1. **K rows read Defect** (1361-F2 ruling 4.4; 1361-G2-F ruling 1.1).
   - `Band` gains `'Defect'` (R:23), and `LETTER` gains `Defect: 'D'` (R:356).
   - Defect replaces Retune for K1 and K2 (R:244), K3 per seed (R:264, :284), K3 overall (R:290), K4 (R:304, :325)
     and K5 (R:348).
   - The verdict tests Defect first, then Retune, incomplete, Flag and Proceed, and keeps Defect rows in `reasons`
     (R:435-441).
   - Text: R:5-8; choice 17 and "Named failures" here; checklist C3 and I.6.
2. **New streaks against the control's whole run** (1361-G2-F ruling 1.2). `controlStreaks` reads the control rival's
   unclipped `stall` intervals of 52 weeks or more (R:166-174). The candidate's streaks stay clipped to the scope
   (R:108, :114). Choice 4 here.
3. **Integer thresholds** (1361-G2-F ruling 1.3). Stall reads Retune at `10*c > 11*k` and Flag at `c > k`; below-zero
   weeks read Retune at `4*c > 5*k` and Flag at `10*c > 11*k` (R:183-189). `increaseOf` now only prints (R:152). The
   zero-baseline rule falls out of the same comparisons. Choice 10 here.
4. **RED_JSON tied to the frozen (c)** (1361-G2-F ruling 1.4). `redProvenance` reads the first line of the `run.meta`
   beside the JSON and throws unless its short sha prefixes the candidate's tree head (R:247-258, called at R:387-388).
   The report records the tag and sha (R:457, :473). RS:6-8 says so.

**Recommended, adopted**
5. **The spies forward every argument** as one rest tuple (P:205-225).
6. **An absent K4 directory reads notRun** (R:390-394, :305-308). A directory without a finished run still reads
   Defect.
7. **Cross-checks.**
   - The control runs Save44 and each candidate run Save45, or the report throws (R:383-384).
   - K3 must migrate Save44 to Save45 exactly (R:275-276).
   - The K4 run must match the candidate's head, save step, law and market tuning apart from the penalty at 0, or K4
     reads Defect (R:398-403).
   - The era-guard leaf must pass in RED_JSON, the unedited contrast to its failure in the K4 tree
     (R:299-302, :315-325).
8. **Routes.** `ROUTE`, `STORAGE_ROUTE` and `routeOf` (R:357-367) give each band its route; a root share over 2% routes
   to the storage fix (1355-A:196). The overall verdict, each row below Proceed and each K row print theirs
   (R:430-441, :467-469, :498-500).
9. **Heap.** The fallback is `NODE_OPTIONS=--max-old-space-size=5120` (RS:10; "Expected run time and memory" here).
10. **Run files stay in scratch.** The report lists every run file, RED_JSON, its `run.meta` and the era-guard JSON
    with size and sha256 (R:442-449, :459, :536-540). The disk estimate is now 80 to 90 MB.
11. **The trees script** (review item 10). The call-site guard leaves out only each function's own module
    (TS:39-48), so a cross-module call from hollywoodPolicy.ts or promises.ts now counts. The K4 edit reads and writes
    UTF-8 without newline translation (TS:32, :35).
12. **The lowest genre's release count** prints beside its mean (R:478-479, :486; review item 11).

**Checked, not changed.** The candidate now exists, so "The frozen candidate, read before the run" replaces the old
list of unknowns. Every assumption the probe makes held at `p15a1-c-r1`.

## Files

| File | Bytes | sha256 |
|---|---:|---|
| `1361-G2-probe.test.ts` | 31,770 | `30dd9edd567b1f2adc6aadf8fdf5712a876549d39516c6dd71bb68ce0ade32f9` |
| `1361-G2-report.test.ts` | 41,593 | `2729fa18dc45b55bace8c1d4ce9773d64efb5159d19025705f6d356e5ba496b0` |
| `1361-G2-trees.sh` | 3,642 | `d53a93f0497a48e1ca84cd441352c21692f812faf04121c37cb97ff31d2c6757` |
| `1361-G2-run.sh` | 3,964 | `c65dde7df1732f0c31bbab9b03dc413df1aff9c49e438aaad640e4c6b577c0c8` |
| `1361-G2-review-checklist.md` | 12,610 | `c01734136d6845dcf5c7e9e474c2e03a253468cce2810ee4c164cb7ad5c91f92` |

This file is not in the table, since it cannot hold its own hash. `1361-G2-trees.sh` records the hashes of
the copies it places in each tree (`run/out/g2-files-sha256.txt`).
