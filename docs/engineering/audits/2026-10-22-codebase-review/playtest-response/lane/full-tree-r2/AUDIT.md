# Postflight audit — full-tree-r2 at 6da4206a (2026-10-29, 02:11 CDT)

Auditor: one read-only Sonnet 5.5 agent, briefed after the run ended; it judged source integrity from the run's own records and `git show 6da4206a:<path>`. Baseline: sprint14 full-tree-r4 at e115be4b. Classification tool: p16-sprint10/tools/compare-full.py (core budget 5000 ms, ui 30000 ms); the auditor re-ran it and its output is byte-identical to COMPARE-core.txt and COMPARE-ui.txt in this folder. The report below is the auditor's text. Two coordinator notes: in §4 the auditor's "27 passed" counts the p15c2 legacy-root-downgrade budget row as one of the 28; by the r1 audit's own accounting the 28 unverified rows (19 + 3 + 4 + 1 + 1) all passed here and the budget row was the separate 35th row, which now fails on its 120,000 ms budget as in the baseline. The stale `purpose` wording in SELECTION.json names FIX-1; the bound head field is the FIX-2 commit and the manifest proves the binding.

Nothing was edited, created or run. Every `git` call used the read-only form and read content at the commit. I re-ran the classification tool and diffed its output against `COMPARE-core.txt` and `COMPARE-ui.txt` in the run dir. Both are byte-identical.

## Verdict

**CLEAN WITH NOTES.** NEW is 0 in core and ui, and no failure's first line differs from the baseline except the two expected INHERITED-CHANGED rows. All 28 rows that r1 left unverified now have results. 27 pass. The 28th, the p15c2 `legacy-root-downgrade` row, fails on its own 120,000 ms budget exactly as in the baseline. Only the 3 gitignored r3n1 fixtures are missing (6 rows). Every manifest hash matches its blob at 6da4206a (0 of 2261 mismatch). Budgets and config are unchanged from e115be4b.

The notes are:
- Six baseline failures did not reproduce. All are timing-class and all passed.
- Three ui tests still time out at 30 s, as in the baseline.
- One ui test passed at 30,383 ms against the 30,000 ms testTimeout. It has no per-test override, so it has zero margin.
- SELECTION.json `purpose` still says "FIX-1 91f6da7e or a later focused-rerun fix". The bound head is the FIX-2 commit. This is stale wording only; the head field is correct.

## 1. Lifecycle

- **lane.log.meta:** `start; 2026-10-29 00:09:45 CDT`, `end, exit 1; 2026-10-29 02:02:58 CDT`. That is 6793 s of wall time. The stage elapsed values sum to 6792 s.
- **launcher.pid:** 9696. `ps -p 9696` finds nothing. No vitest, lane-run or run.sh process remains. `launcher.out` is 0 bytes.
- **USED:** present, 0 bytes.
- **Opening lines of lane.log:** `known-missing inputs: 3` (r1 had 4), then `Node v20.20.2; HEAD 6da4206a3446c415cdb5e6ee5e1c50546cb2e750`.
- **Stop lines:** none. There is no `=== STOP`, abort or runtime-floor line. Every `=== END` is followed by a `=== BEGIN` or the checkpoint.
- **Stages** (exit, elapsed, r1 elapsed, baseline elapsed):

| Stage | Exit | r2 | r1 | Baseline |
|---|---|---|---|---|
| root-ui-types | 0 | 104 s | 101 | 106 |
| bridge-types | 0 | 38 s | 37 | 43 |
| bridge-contract | 0 | 2 s | 1 | 1 |
| bridge-fixture-contract | 0 | 1 s | 2 | 1 |
| build | 0 | 24 s | 24 | 24 |
| full-core-including-bridge | 1 | 5708 s | 5899 | 8466 |
| full-ui | 1 | 914 s | 960 | 903 |
| final-source-integrity | 0 | 1 s | 1 | 0 |

- **Checkpoint:** `=== CHECKPOINT exit=1`. It comes only from the two test stages.
- **preflight.LOCAL.json** (at 2026-10-29T00:09:45-05:00):
  - `launchAllowed` true, `laneAbsent` true, `heavyLOCAL` empty.
  - `freeKiB` 6,820,324 against the 3,670,016 launch minimum and the 3,145,728 runtime floor.
  - AC power, battery 100% and charged.
  - Memory free 59%. Swap used 5387 of 6144 MB, 757 MB free.
  - Load 3.23, 4.83, 6.39.
- **Godot scan:** `launch-host.PRIVATE.txt` has 436 process lines and 0 godot matches. lane.log has 0.
- **Pins:** all six preflight pins recompute equal. They cover run.sh, SELECTION.json, auto_freeze.py, RUNTIME-INPUTS.json, lane-run-r8.sh and equipment-run-preflight-r3.py.

## 2. Binding

- **Head:** SELECTION `head` is 6da4206a3446c415cdb5e6ee5e1c50546cb2e750, as expected. The branch is p18-season-20261028. The live worktree HEAD is the same and `status --porcelain` is empty.
- **Manifest size:** `sourceManifestEntries` is 2261 and the manifest has 2261 keys (r1: 2236). The extra 25 entries are 24 docs files and the new test file.
- **Hashes:** the manifest holds sha256 of file content. I recomputed all 2261 against the blobs from `git ls-tree -r 6da4206a` and `git cat-file --batch`. There were 0 mismatches. 0 manifest entries are untracked at the commit, and 0 are non-blobs.
- **Sparse checkout:** 24,296 files are tracked at the commit.
  - **Complete:** `src` 221 of 221, `tests` 918 of 918 (r1: 917), `bridge` 69, `scripts` 89, `ui` 735, `generated` 3, `art` 16, `tools` 4, `.agents` 20, `.github` 3, and every root file.
  - **Partial:** `docs` 127 of 21,921 (r1: 103), `evidence` 0 of 233, `.claude` 10 of 18.
- **final-source-integrity:** exit 0. run.sh also asserted HEAD and a clean tree at start.
- **Template residue:** none in SELECTION.json. A grep for r9, r8 and TODO finds nothing, and `limits` now reads "against full-tree-r4". The one stale phrase is the `purpose` wording noted in the Verdict. run.sh keeps its "PREPARED ONLY" header comment.
- **Diff r1 to r2:** `git diff --stat 6a846c99 6da4206a` shows 9 files, 148 insertions and 21 deletions, exactly the set you listed.
  - **Edited:** runtime.ts, bridge-contract-consumer-lock.ts, tvSave.ts, tvSeason.ts, tvTypes.ts, tvView.ts, bridge-contract-consumer-lock.test.ts and s14-season-route-witnesses.test.ts.
  - **New:** bridge-schema-first-refusal.test.ts (64 lines).
  - **Commits:** the log between the two heads lists 91f6da7e (FIX-1) and 6da4206a (FIX-2). FIX-2 touches only s14-season-route-witnesses.test.ts (19 insertions, 1 deletion).
  - **Since e115be4b:** 64 files changed, 701 insertions and 214 deletions. r1 had 63, and the extra one is the new test.

## 3. Results

| | Core | UI |
|---|---|---|
| Tests | 6223 total; 101 failed; 6108 passed; 3 skipped; 11 todo | 2757 total; 3 failed; 2749 passed; 5 skipped |
| Files | 566; 25 failed | 211; 2 failed |
| Classes | NEW 0; INHERITED-SAME 93; INHERITED-CHANGED 2; MISSING-INPUT 6; BASELINE-NOT-REPRODUCED 6; OVER-BUDGET-PASS 660; LOAD-FAILURE 0 | NEW 0; INHERITED-SAME 3; OVER-BUDGET-PASS 1; all others 0 |

- **Lane.log match:** the summaries match the lane.log lines exactly.
  - **Core:** `Test Files 25 failed | 541 passed (566)` and `Tests 101 failed | 6108 passed | 3 skipped | 11 todo (6223)`.
  - **UI:** `2 failed | 209 passed (211)` and `3 failed | 2749 passed | 5 skipped (2757)`.
- **Core test count:** 6223 is r1's 6196 plus 27 (25 schema-first-refusal, 1 consumer-lock, 1 s14 witnesses). The baseline had 6192.
- **Failures against baseline:** 101 failures equals 93 + 2 + 6.
  - I keyed failures on file and full name. Of the baseline's 107 failures, 101 recur and 6 now pass.
  - No failure is absent from the baseline.
  - Of the 101, 99 have an identical first line. The other two are the INHERITED-CHANGED rows in section 5.
  - The failing files are 25, down from the baseline's 28. The three that cleared are bridge-p13b-s7-disclosure, bridge-runtime-checkpoint-prepared-reuse and bridge-runtime-worker.
- **Duplicate keys:** the same two d11-cycle3 "D-17A fix-pass: no headline branch asserts a SETTLED financial result" names as the baseline.
- **UI:** the same 3 failures as the baseline, all `Test timed out in 30000ms`. Durations are in section 8.

## 4. MISSING-INPUT

- `MISSING-INPUTS.txt` lists only the three gitignored r3n1 fixtures: `r3n1-dense-02`, `r3n1-dense-02p31` and `r3n1-dense-02p32`.
- They produce 6 rows (2 per file), all ENOENT, and the tool labels them UNTRACKED. They failed the same way in the baseline and in r1 with a different row count of 0, but with the same ENOENT first lines.
- The four docs inputs from r1 are now present. No other ENOENT row exists.
- **The 28 previously unverified rows:**
  - 27 passed.
  - **p15c2-campaign-legacy-integration** (19 rows): all passed.
  - **p14c3-force-order** (3): passed at 17,496, 17,079 and 2 ms.
  - **p14p4p5-finishing-material, -post-capacity, -screenplay-status, -soundstage-capacity** (1 each): passed at 20,854, 41,241, 34,568 and 16,159 ms. The first three tests declare `TIMEOUT = 60_000`, so post-capacity sits at 69% of its budget.
  - **p15b-legacy-v3** (1): passed at 51,885 ms (baseline 76,780). I did not locate its budget.
  - **p15c2-campaign-legacy-sibling** (1): passed at 22,850 ms.
- **The 35th r1 row:** p15c2 `legacy-root-downgrade` now reaches its budget assertion, failing with `elapsed 188452 ms against the 120000 ms budget`. The baseline failed with `elapsed 215827 ms` on the same assertion. The file's total test time is 340.7 s, against 42.4 s in r1 and 378.6 s in the baseline.

## 5. INHERITED-CHANGED (2)

- **projection20 pin:** `tests/bridge-owner-ux-projection20-migration.test.ts` line 65 `expect(PROJECTION_VERSION).toBe(53)` now reads `expected 69 to be 53`. The baseline read `expected 68 to be 53`.
  - `git show 6da4206a:bridge/schema/bridge-schema.ts` gives `PROJECTION_VERSION = 69 as const` at line 313. e115be4b has 68, and 6a846c99 has 69.
  - The test file has no diff since e115be4b. This is the intended 68 to 69 move.
  - The file's other 3 failures are `expected 51 to be 38` and are unchanged.
- **p15c2 budget row:** `legacy-root-downgrade`, described in section 4. It is classed INHERITED-CHANGED only because the elapsed number differs (188,452 against 215,827 ms). The failure kind is identical.

## 6. BASELINE-NOT-REPRODUCED (6): all timing-class, all passed

| Test | Baseline | This run | Share of budget |
|---|---|---|---|
| bridge-p12-campaign-library R05 catalogue-only rename | 31,992 ms, timed out at 20,000 | passed 8,126 ms | 41% |
| bridge-p12-campaign-library R05 catalogue-only delete | 43,005 ms, timed out at 20,000 | passed 6,261 ms | 31% |
| bridge-p13b-s7-disclosure T3 item 5 | 33,892 ms, timed out at 30,000 | passed 18,818 ms | 63% |
| bridge-runtime-checkpoint-prepared-reuse, live authority on failed Save | 27,173 ms, timed out at 20,000 | passed 15,265 ms | 76% |
| bridge-runtime-worker, delivers an accepted campaign Save | 30,086 ms, timed out at 30,000 | passed 7,285 ms | 24% |
| bridge-runtime-worker, durably saves exact response bytes | 33,702 ms, timed out at 30,000 | passed 13,086 ms | 44% |

The thinnest margins are prepared-reuse at 76% and p13b-s7 at 63%. In r1 they were 16,698 ms and 19,170 ms.

## 7. Timing

- **OVER-BUDGET-PASS, core:** 660 with a max of 312,394 ms. r1 had 682 (max 356,613), and the baseline had 813 (max 716,931). My own count matches the tool.
- **OVER-BUDGET-PASS, ui:** 1 at 30,383 ms.
  - **Name:** ui/src/screens/StudioCalendar.career.test.tsx, "C.3 recent career facts use existing Calendar identity routes U1 renders genuine change/finality names and dates, retains age12, and removes age13 news".
  - **Budget:** it runs under the 30,000 ms ui testTimeout with no per-test override, and passed.
  - **Contrast:** r1 and the baseline had 0 here.
- **Stage wall and test time:**
  - **Core stage wall:** 5708 s, against 5899 s in r1 and 8466 s in the baseline.
  - **Core summed test durations:** 15,106 s, against 15,572 s and 22,821 s.
  - **UI stage wall:** 914 s, against 960 s and 903 s.
  - **UI summed durations:** 1807 s, against 1928 s and 1813 s.
- **Slowest ten core files** (seconds, with r1 and the baseline in brackets):
  1. bridge-contract-consumer-lock 516.4 (516.9; 503.0)
  2. p14c3-cohort-transition 434.7 (470.8; 462.0)
  3. p15c2-campaign-legacy-integration 340.7 (42.4; 378.6)
  4. acceptance-corpus 319.0 (351.4; 586.2)
  5. roster-wall-summary 312.4 (356.6; 416.0)
  6. roster-wall-continuation 308.5 (313.3; 355.3)
  7. p14p3-directing-promises 292.6 (341.4; 315.8)
  8. roster-wall-player-policy 280.7 (290.4; 415.9)
  9. bridge.test.ts 268.9 (276.7; 1195.9)
  10. bridge-runtime-checkpoint 262.3 (328.4; 378.2)
- **Timeout failures by budget** (this run, r1, baseline):

| Budget | r2 | r1 | Baseline |
|---|---|---|---|
| 5000 ms | 10 | 10 | 10 |
| 20000 ms | 2 | 2 | 5 |
| 30000 ms | 0 | 0 | 3 |
| 60000 ms | 1 | 1 | 1 |

  - Plus one 120,000 ms elapsed-budget assertion failure (the p15c2 row) in both this run and the baseline.
  - The 60,000 ms failure is bridge-p13-campaign-isolation ("frozen, and a new campaign receives none of their authority") at 72,411 ms.
  - The other 5000 ms timeout outside p12 is bridge-p14c3-runtime at 11,089 ms.
- **Budgets unchanged:** `git diff e115be4b 6da4206a` over vitest.workspace.ts, vitest.config.ts, ui/vite.config.ts, package.json, package-lock.json, tsconfig.json, tsconfig.src.json, tsconfig.bridge.json, ui/tsconfig.json and .nvmrc is empty (0 bytes). vitest.workspace.ts still has the ui `testTimeout: 30_000` and the core default.
- **bridge-p12-campaign-library:** 13 rows, 2 passed and 11 timed out, as you expected.
  - **Passed:** the two R05 catalogue-only rows, at 8,126 and 6,261 ms.
  - **Timed out at 5,000 ms:** 9 rows, at 5,045 to 7,494 ms.
  - **Timed out at 20,000 ms:** 2 rows, at 21,619 and 21,982 ms.
  - **Baseline:** 13 of 13 failed, including 31,992 and 43,005 ms on the two R05 rows.
- **New and changed files:**
  - **bridge-schema-first-refusal.test.ts:** 25 passed (new). The slowest of its tests took 4.7 ms.
  - **bridge-contract-consumer-lock.test.ts:** 78 passed (r1: 77). Its test time is 516.4 s.
  - **s14-season-route-witnesses.test.ts:** 11 passed (r1: 10). Its test time is 5.1 s.

## 8. Anomalies

None that bear on the verdict. In lane.log:
- **Zero counts:** Unhandled, "did not exit", close/teardown timeout, hook timeout, EMFILE, ENOSPC, ERR_, Serialized Error, and "Failed to load/resolve" all returned 0.
- **"Worker" hits:** the 7 matches are bridge-runtime-worker test names and their durations.
- **Stderr blocks:** 7, the same count as r1. The 7 block headers are identical to r1's; I diffed them.
  - 6 are React act() warnings on StudioLotScreen.
  - 1 is the jsdom `HTMLCanvasElement.prototype.getContext` not-implemented error, in rt-audio-edges.redteam.test.tsx.
  - r1's audit text says "five" act warnings plus one canvas error while also saying seven. The headers show six act warnings, so that text was a miscount.
- **The three ui failures** (duration here, r1, baseline), all `Test timed out in 30000ms`:
  - WorldFirstLotNativeNextEventApp, "orients a cash stop to Administra…": 37,160 ms (43,390; 42,810).
  - WorldFirstStudioHome, "preserves topbar focus through a supporting-Dashboard…": 30,583 ms (36,751; 32,104).
  - WorldFirstStudioHome, "preserves building focus through a supporting-Dashboard…": 33,173 ms (38,678; 36,608).
