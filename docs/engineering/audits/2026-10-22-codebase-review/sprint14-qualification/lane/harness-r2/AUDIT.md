# Independent postflight audit: harness-r2 (Sprint 14 measurement lane), 2026-10-28

Run dir: `/Users/zacheryspector/studio-scratch/sprint14-20261028/harness-r2/`. Worktree: `/Users/zacheryspector/studio-scratch/p17-slice-red-20261027-wt`. Auditor: Sonnet 5.5, read-only. I ran no tsc, vitest, npm or game script, and I wrote nothing outside this reply.

**Verdict: AUDIT CLEAN WITH NOTES.** All ten checks pass. The notes are findings that go into the record, not binding or integrity problems. The largest are a roughly 21x Save51 save-probe cost and an 89 s single tick at the Legacy boundary.

## 1. Binding: PASS
- `SELECTION.head` is `9a9e56a8aaf5ee062c91f8c085e9dd131afbd3dc`, the full 40-character sha. `git rev-parse 9a9e56a8` returns the same value. It is a snapshot commit on `p18-s14-harness-snapshot`; its parent is `0cf00e40958413489af4acfedf3699a83e36ee80`.
- `sourceManifestEntries` is 1384, equal to the manifest key count. All 1384 files still hash to the manifest on disk (0 mismatches). The manifest covers only files present in the sparse checkout; `git ls-files` lists 24,296 tracked paths.
- The four harness scripts hash identically on disk, in the manifest and in `git show 9a9e56a8:<file>`:

| Script | sha256 prefix |
|---|---|
| `measure-lib.ts` | e5edb586… |
| `campaign-measure.ts` | c9c584ad… |
| `rival-recovery-measure.ts` | 88a6d07b… |
| `operated-trial-312.ts` | 311e3355… |

- `CAMPAIGN-RECEIPT.json` and `RIVAL-RECEIPT.json` both record `sourceHead` 9a9e56a8. Their `scripts` values equal the committed files: `campaign-measure.ts` + `measure-lib.ts` in the campaign receipt, `rival-recovery-measure.ts` + `measure-lib.ts` in the rival receipt.
- The `policySha` in `out/operated/result.json` is 311e3355…, the committed `operated-trial-312.ts`, not 87e45c65 (the 1367-K original). NOTES.md says this is expected.
- The worktree HEAD now is still 9a9e56a8 on `p18-s14-harness-snapshot`, with 0 dirty paths. It has not moved since the run.

## 2. One-shot: PASS
- `USED` is present (0 bytes). `lane.log.meta` has exactly one `start` (13:07:17 CDT) and one `end, exit 1` (14:13:17). `launch-at.txt` reads 13:07:17.
- Launcher pid 10373 is gone (`ps -p` returns rc 1). No `node`, `vite-node` or `harness-r2/run.sh` process is alive.
- A different lane is running: `s14-r3/run.sh` (pid 45988, vitest children). I did not touch it. It started after this run ended.

## 3. Preflight: PASS
- `launchAllowed` is true, `laneAbsent` is true, `heavyLOCAL` is `[]`, and the preflight stamp is 13:07:17.
- Free disk was 5,182,804 KiB against a launch minimum of 3,670,016 and a runtime floor of 3,145,728. Free disk now is 5,615,376 KiB (94% used).
- AC power: "Now drawing from 'AC Power'", battery 100%, charged.
- All six pins re-hashed true now. `run.sh` is 7f82885b… and `SELECTION.json` is 546eff4a…. The other four match too: `auto_freeze.py`, `RUNTIME-INPUTS.json`, `lane-run-r8.sh`, `equipment-run-preflight-r3.py`.
- Load at launch: `vm.loadavg { 5.68 30.06 30.26 }`. The 1-minute figure was low, but the 5- and 15-minute figures were about 30, so the host had been heavily loaded just before launch. Swap was 7460 M of 8192 M used and 65% memory was free. Treat the timings below as measured on a swap-pressured host.

## 4. Godot scan: PASS
- `launcher.out` is 0 bytes, so `launch.sh` printed no `STOP: foreign Godot` line. I grepped `launch-host.PRIVATE.txt` for "godot": 0 hits.
- `lane.log` has 0 hits. The only "odot" in `preflight.LOCAL.json` is the preflight script's own `grep -qi godot` command text.

## 5. Stages: PASS

| Stage | BEGIN | END | exit | elapsed |
|---|---|---|---|---|
| operated312 | 13:07:18 | 13:08:09 | 1 | 51 s |
| campaign | 13:08:09 | 14:11:55 | 0 | 3826 s |
| rival | 14:11:55 | 14:13:17 | 0 | 82 s |

- `CHECKPOINT exit=1` comes only from operated312. Campaign and rival both exited 0.
- `out/operated/result.json` exists (11,555 bytes) with `trialQualified: false`. Other fields: `recentReleases: 0`, `qualifiedPolicySha: null`, `postReleaseMeasured: false`, `finalWeek: 520`, `elapsedMs: 45,629`.
- `stderr.txt` ends with `Error: postrelease: staffing/production trial did not qualify; full route is not authorized by this result`, thrown at `operated-trial-312.ts:145`. The `at` line follows the unmapped vite-node line. The stack is vite-node frames only (`ViteNodeRunner.runModule` and similar). So the stage exit is the measured non-qualification, not a crash.
- Operated read-out:
  - Films by checkpoint: 5 at week 52, 11 at 104, 16 at 156, then 16 through week 520. One film stays active throughout.
  - Hires: 14 accepted, 0 renewals. There were 14 replacement hires, in weeks 208 and 416; the roster dropped to 0 in each of those weeks and refilled.
  - Refusals: 168 `renewContract rejected, underMarketCase; submit a proposal` across 7 distinct messages. The unchanged 1367-K policy keeps calling `renewContract`.
  - Cash: 17.99M at week 52, then 22.71M at 104, 11.42M at 312 and 5.28M at 416, ending at -1,304,021.55 at 520.
  - Week-312 question: no release in weeks 312 to 519, and no release at all after week 156.
  - Final state hash: f281bccf….
- I did not find `1367-stage/postrelease-trial-r1/run.json` at the recipe's path, so I did not compare against the Save45 outcome.

## 6. Receipts: PASS
Both receipts have `status` MEASURED, `saveVersion` 51 and `node` v20.20.2.

| Receipt | Elapsed |
|---|---|
| Campaign | 3,820,359 ms |
| Rival | 77,981 ms |

For every arm of both receipts:
- `finalWeek`, `finalSave.{bytes, sha256}` and `routeTickMs` equal the last row of the per-arm `*.campaign.jsonl`.
- `saveSha256ByCheckpoint` equals the sha256 values across all rows of the per-arm `*.campaign.jsonl`.
- The `files` sha256 values (3 files per arm) match the files on disk.

Determinism:
- `determinism.identical` is true for all 5 seeds.
- `armsAgree` is identical:true at weeks 520 and 1040 for p13a, seed-b and p15a1. It is empty for the two 520-week seeds, which have no second arm.
- Rebuild digests equal the recorded saves:

| Seed | Rebuilt arm and week | sha256 prefix |
|---|---|---|
| p13a | closure-deferred, 6240 | ccf53391… |
| seed-b | default, 520 | c73dd5d2… |
| p15a1 | default, 520 | 1c8ab770… |
| p13b-s8 | default, 520 | d5b7706b… |
| p13-public | default, 520 | b11ad12c… |

- The rebuilds are same-process. The seed-b rebuild is week 520 only; the 8791 route has no rebuild.

Rows per file (campaign rows, then rivals rows):

| Arm | Campaign rows | Rivals rows |
|---|---|---|
| p13a deferred | 12 | 127 |
| p13a default | 3 | 96 |
| seed-b deferred | 17 | 98 |
| seed-b default | 3 | 83 |
| p15a1 deferred | 12 | 128 |
| p15a1 default | 3 | 97 |
| p13b-s8 default | 1 | 53 |
| p13-public default | 1 | 69 |

All files are week-sorted and end at the arm's final week.

## 7. Numbers for the record

**Route and closure.** Both default arms stop at week 1366, the player's actual closure (`closedWeek` 1366, cash -490,000). The player cash/stage/closedWeek and the four-way route totals in the third table below are from the last row of each arm. Both deferred arms keep the player at `conditionStage` closed with `closedWeek` null.

| Seed.arm | finalWeek | routeTickMs | Player cash | Player stage |
|---|---|---|---|---|
| p13a.default | 1366 | 10,424 | -490,000 | closed (closedWeek 1366) |
| p13a.closure-deferred | 6240 | 20,491 | -73,600,000 | closed (closedWeek null) |
| seed-b.default | 1366 | 53,924 | -490,000 | closed (closedWeek 1366) |
| seed-b.closure-deferred | 8791 | 951,883 | -111,865,000 | closed (closedWeek null) |
| p15a1.default | 1366 | 6,995 | -490,000 | closed (closedWeek 1366) |
| p15a1.closure-deferred | 6240 | 17,106 | -73,600,000 | closed (closedWeek null) |
| p13b-s8.default | 520 | 9,227 | 12,200,000 | stable |
| p13-public.default | 520 | 8,811 | 12,200,000 | stable |

- Player cash on seed-b at 8791 is exactly the 1367-K Save45 figure.
- Player `releases` is 0 in every row, and `contracts` and `activeProductions` are 0.

**Rivals at the end of each arm (total / closed / alive):**

| Arm | Rivals total / closed / alive |
|---|---|
| p13a.default | 6 / 6 / 0 |
| p13a.closure-deferred | 9 / 9 / 0 |
| seed-b.default | 6 / 4 / 2 |
| seed-b.closure-deferred | 9 / 4 / 5 |
| p15a1.default | 6 / 6 / 0 |
| p15a1.closure-deferred | 9 / 9 / 0 |
| p13b-s8 | 5 / 0 / 5 |
| p13-public | 5 / 3 / 2 |

`closureDueNotClosed` is 0 and `inCostCutting` is 0 in every final row.

**Save bytes and sha256 at 6240** (the 8791 row is seed-b only):

| Seed | Bytes | sha256 prefix |
|---|---|---|
| p13a | 5,738,858 | ccf53391083238e3… |
| seed-b | 45,892,677 | b09dec658869cd03… |
| p15a1 | 4,134,204 | fa98508fd19bab87… |
| seed-b at 8791 | 60,449,139 | 99dc5118ee8cea1a… |

- Both seed-b saves are far above the 8 MiB UI import ceiling (SAVE-11).

**Save timings.** Three samples as (makeSave ms, validateSaveV51 ms); median makeSave and median validate are shown alongside.

| Seed and week | Samples | Median makeSave | Median validate |
|---|---|---|---|
| seed-b 6240 | (85,235; 34,251), (68,521; 33,747), (86,199; 41,870) | 85,235 | 34,251 |
| seed-b 8791 | (146,581; 70,251), (139,347; 74,870), (168,220; 74,350) | 146,581 | 74,350 |
| p13a 6240 | (509; 422), (579; 452), (712; 520) | 579 | 452 |
| p15a1 6240 | (284; 214), (348; 361), (489; 380) | 348 | 361 |

**Interval tick time (ms).** For seed-b closure-deferred the interval sum is 164,193 for 5720 to 6240, then 75,055, 85,639, 83,531, 84,362 and 92,110 for the 520-week intervals through 8791.

| Interval | Max single tick (ms) |
|---|---|
| seed-b deferred, 5720 to 6240 | 89,252 (largest in the run) |
| seed-b deferred, 6240 to 6760 | 3,324 |
| seed-b deferred, 6760 to 7280 | 5,921 |
| seed-b deferred, 7280 to 7800 | 3,235 |
| seed-b deferred, 7800 to 8320 | 4,122 |
| seed-b deferred, 8320 to 8791 | 5,391 |
| p13a deferred, 5720 to 6240 | 509 |
| p15a1 deferred, 5720 to 6240 | 325 |
| seed-b default, 0 to 520 | 4,476 |

- The largest max tick is seed-b closure-deferred, interval 5720 to 6240: 89,252 ms. p13a and p15a1 also show a spike in that interval (509 ms and 325 ms against 3 to 14 ms in neighbouring quiet intervals). I infer it is the week-6240 Legacy boundary tick (`LEGACY_BOUNDARY_WEEK` 6240), but the files do not record which week.

**eraRoots at the end:**

| Arm | rights properties / filmTitles / titleEvents / estates | franchises, cameos, television |
|---|---|---|
| seed-b deferred (8791) | 3312 / 3309 / 6861 / 4 | null, null, null |
| p13a deferred (6240) | 102 / 102 / 408 / 9 | null, null, null |
| p15a1 deferred (6240) | 9 / 9 / 36 / 9 | null, null, null |

- Rights licences, offers, transactions, diligence and absorptions stay 0 on seed-b.
- Franchises, cameos and television are null in every row of every file.

**Legacy.** Not frozen before week 6240 in any row. At 6240 and after:
- seed-b: `officialFrozen` true, `officialSha256` 5202c9eb5a1f6c7ceb176b292efdb6584c6274702aaa6e3305f05022b351b507. It is unchanged across the 6240, 6760, 7280, 7800, 8320 and 8791 rows (1 distinct hash).
- p13a: frozen, 96eec66fb411282b6071c570c709979ea8452d68ecf076ae8c0dd2a6193d1d86.
- p15a1: frozen, d7fd5e9242ee1b7c569078c62f80959f84cc6d3f06af013dd2fbed2a80f37698.
- `endOfRunPresent` is true only in the three default-arm rows at week 1366.

**Rival summaries.**

Per route, how many rivals entered cost-cutting, ever greenlit again after the first entry (computed from `greenlightWeeks` against the first `cuttingEpisodes.since`, not from the harness field), and closed:

| Route and arm | Entered cost-cutting | Greenlit after entry | Closed (of those) | Zero releases |
|---|---|---|---|---|
| p13a deferred | 9 of 9 | 0 | 9 | none |
| p13a default | 6 of 6 | 0 | 6 | none |
| seed-b deferred | 4 of 9 | 0 | 4 | none |
| seed-b default | 4 of 6 | 0 | 4 | none |
| p15a1 deferred | 9 of 9 | 0 | 9 | 8 of 9 |
| p15a1 default | 6 of 6 | 0 | 6 | 6 of 6 |
| p13-public (520) | 3 of 5 | 0 | 3 | 1 |
| p13b-s8 (520) | 0 of 5 | n/a | 0 | 1 |

- Every rival that entered cost-cutting had exactly 2 cutting episodes, took 1 loan, and ended with `conditionStage` closed. `dormantSurvivor` is false for all rivals on every route, because every entrant closed.
- Per-rival first cutting entry (`first`) and last greenlight, from the `cuttingEpisodes` and `lastGreenlightWeek` fields. The `belowReserve` column below is the `sampledFirstBelowReserveWeek` field, which can lag the entry by up to the sample spacing. Each pair is first entry / last greenlight; `belowReserve` is the sampled first-below-reserve week, and "closes" is the closure week:

| Route | r01 | r02 | r03 | r04 | r05 | r06 | r07 | r08 | r09 |
|---|---|---|---|---|---|---|---|---|---|
| p13a (first / lastGL) | 269 / 202 | 266 / 230 | 193 / 127 | 86 / 70 | 653 / 640 | 1124 / 1111 | 1730 / 1690 | 2049 / 2009 | 2811 / 2744 |
| p13a belowReserve | 294 | 311 | 250 | 140 | 742 | 1270 | 1838 | 2080 | 2880 |
| p13a closes | 354 | 381 | 319 | 203 | 795 | 1323 | 1888 | 2146 | 2930 |
| seed-b (first / lastGL) | 583 / 570 | 503 / 372 | 447 / 351 | 387 / 258 | none / 8310 | none / 8788 | none / 8791 | none / 8570 | none / 8789 |
| seed-b belowReserve | 625 | 541 | 448 | 400 | none | none | none | none | none |
| seed-b closes | 676 | 594 | 519 | 442 | alive | alive | alive | alive | alive |
| p15a1 (first / lastGL) | 218 / none | 187 / none | 119 / none | 94 / none | 674 / none | 1139 / none | 1745 / none | 2005 / 1907 | 2797 / none |
| p15a1 belowReserve | 288 | 280 | 188 | 120 | 713 | 1164 | 1772 | 2045 | 2854 |
| p15a1 closes | 348 | 341 | 258 | 184 | 764 | 1217 | 1823 | 2098 | 2905 |

  - The p13a and p15a1 default arms repeat the same first entries for r01 to r06 (p13a) and the first six rivals (p15a1).
  - seed-b r05 to r09 stay stable and alive. Each releases between 485 and 829 films, and the longest gap without a greenlight is 993 to 2,553 weeks.
  - p13-public: r02 enters at 398 (last greenlight 332, closes 489), r03 enters at 242 (206, closes 373), r04 enters at 279 (212, closes 381).
  - Every `lastGreenlightWeek` is earlier than its first entry week, so no rival resumed production after entering cost-cutting. The harness's `firstAfterFirstCuttingEntry` shows only a `hire` for 14 of these rivals (p13a r01, r07, r09; seed-b r01; p15a1 r01, r05, r07, r09, and the matching default-arm entries) and never a commission or greenlight.
- **Zero-release rivals over the whole route:**
  - p15a1-w2-market-01 default: `studio-ff9bdb2b-r01` to `r06`, all six.
  - p15a1-w2-market-01 deferred: `studio-ff9bdb2b-r01`, `r02`, `r03`, `r04`, `r05`, `r06`, `r07`, `r09`. Only r08 released (1 film, last greenlight week 1907). All nine closed.
  - `studio-5a47d054-r05` (p13-public): 0 releases and 0 greenlights in 520 weeks, alive and stable. `studio-efb645e3-r05` (p13b-s8): same.
  - None on p13a or seed-b.

## 8. Log scan: PASS
- `lane.log` (77 lines) and `launcher.out` (0 bytes) contain no `Unhandled`, `ENOSPC`, `EMFILE`, heap, out-of-memory or `STOP`, and no stack trace or `DETERMINISM-MISMATCH` text.
- The only stack trace anywhere is in `out/operated/stderr.txt`, the expected non-qualification throw.
- `lane.log` has 12 `FINDING` lines, all expected:
  - Each of the three default arms (p13a, seed-b, p15a1): "route ends at week 1366" (the player's actual closure), plus "no player release in weeks 312..519".
  - Each other arm: "no player release in weeks 312..519".
  - One extra on the seed-b deferred arm: "no player release after 6240".

## 9. Host and Save45 expectations
- The only in-run host data recorded is the launch preflight (load and swap, check 3). The campaign never sampled host state.
- Swap just after the run: 7646 M used of 9216 M. Load now: `{ 4.45 8.13 7.72 }`, with the next lane running.
- Progress lines are `[sprint14]` cumulative route ms. The Save45 figures are from RUN-RECIPE.md.

| Step | Save45 / recipe expectation | Save51 actual | Ratio |
|---|---|---|---|
| operated312, 520 weeks | 47.2 s wall (43.8 s internal) | 51 s wall (45.6 s internal) | 1.08 wall |
| p13a deferred, to 6240 | 70.6 s | 20.5 s | 0.29 |
| p13a, to the closure | 12.1 s to week 1560 (no closure at Save45) | deferred 8.1 s at 1560; default 10.4 s at 1366 | n/a |
| seed-b deferred, to 1560 | 21.3 s (1560) | 20.7 s | 0.97 |
| seed-b deferred, to 6240 | 318.3 s | 531.2 s | 1.67 |
| seed-b deferred, 6240 to 8791 | 422.2 s | 420.7 s | 1.00 |
| seed-b save pair at 6240 | 5.7 s per pair (3.9 s + 1.6 s medians); recipe estimate about 20 s | 119.5 s | 21x vs Save45 |
| seed-b save pair at 8791 | 10.9 s per pair (7.86 s + 2.74 s medians); recipe estimate about 40 s | 220.9 s | 21x vs Save45 |
| Rebuilds | 1.5 to 2 min | within the campaign total | n/a |
| Campaign total | recipe 20 to 35 min | 63.8 min | 1.8x to 3.2x |
| Rival total | recipe 4 to 12 min | 1.4 min | below estimate |
| Whole run | recipe cap 90 min | 66.0 min | within cap |

Notes on the table:
- Save-probe cost drives the campaign overrun: 2,027 s of probes (53% of the campaign) against 1,036 s of route ticks. The seed-b deferred arm alone is 2,009 s of probes.
- Seed-b makeSave steps up from 25,680 ms at week 4680 to 64,346 ms at 5200 while the save grows 15% (32.8 to 37.6 MB), then stays near 65,057 ms at 5720. Interval tick time shows a similar step. A heap, GC or swap effect on this 8 GB host is plausible, but the run recorded no memory data, so it is not shown.
- The same saves timed differently in the two arms: the 520-week saves are byte-identical (same sha256), yet seed-b took 32,884 ms in the default arm against 9,039 ms in the deferred arm, and p13a took 6,374 ms against 5,095 ms. The default arm ran first (13:09 to 13:10), and the host state is unknown. Use the deferred-arm timings for comparison, and do not read the default-arm tick times as pure engine cost.
- Single-sample save probes show similar noise (p13a at week 520: 174 ms default against 123 ms deferred, same state).

## 10. What the record must carry
- **Closure-deferred arm.** The receipts' `routeActions` and NOTES.md both say it uses `tick(state, {deferPlayerClosure: true})`. It is an engine option, not player survival evidence. The player's closure stays due on every row (`conditionStage` closed, `closedWeek` null) and no money moves. The player cash falls about 7.8M per 520 weeks (-3.4M at 1560 to -111.865M at 8791). Everything beyond week 1366 on these routes is the deferred arm.
- **Natural routes issue no player production action.** They issue no hire, film, rights, continuation, cameo or TV command. Player release counts are structurally 0 (receipt limits), and `eraRoots` shows only what rivals and the engine do. Franchises, cameos and television are null in every row. Only `operated-trial-312.ts` answers the week-312 question, and it did not qualify: 0 releases from week 156 onward, 168 `underMarketCase` renewal refusals, and cash at -1.30M by week 520.
- **Receipt limits (campaign).**
  - Save timings are isolated `makeSave` and `validateSaveV51` calls, not a Bridge-step budget.
  - The operated 312 trial is a separate route.
  - Rival receipt: single landed tree only, so the charter arms and controls (a), (e), (f), (g) are not measured.
  - No source observers, so package, evaluation, refusal-gate and 154-promise attribution are not read.
  - Reserve-based weeks come from sampled weeks only.
  - Closure is read from the live `studioClosure` root, and `closureDueNotClosed` marks a due-only stage.
- **NOTES.md limits.** The determinism rebuild is same-process, so it catches route nondeterminism but not module-state carry-over. The seed-b rebuild covers week 520 only. No final save was kept; only its size and sha256. The post-2040 player release on Save51 stays unmeasured (ACCEPTANCE OPEN).
- **Measured findings to route (not acceptance):**
  - Seed-b save cost at week 6240 is about 21x Save45 (makeSave 85.2 s, validate 34.3 s).
  - The 8791 save is 60.4 MB against 41.3 MB at Save45.
  - A single 89.3 s tick falls in seed-b's 5720 to 6240 interval.
  - Of the rivals that entered cost-cutting, none was greenlit again, and all closed.
  - Eight of nine p15a1-w2-market-01 rivals never released a film.
  - p13-public r05 and p13b-s8 r05 never released a film or greenlit one in 520 weeks.
- **Provenance caveats.** The determinism checks are digest equality inside one process. The 1367-K operated-trial comparison file was not found at the recipe's path, so I could not compare it.