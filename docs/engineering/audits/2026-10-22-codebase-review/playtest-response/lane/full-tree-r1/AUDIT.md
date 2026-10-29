# Postflight audit — full-tree-r1 at 6a846c99 (2026-10-28, 23:50 CDT)

Auditor: one read-only Sonnet 5.5 agent, briefed after the run ended; it judged source integrity from the run's own records and `git show 6a846c99:<path>`, never from the live worktree (the coordinator had begun FIX-1 edits there). Baseline: sprint14 full-tree-r4 at e115be4b. Classification tool: p16-sprint10/tools/compare-full.py (core budget 5000 ms, ui 30000 ms); the auditor re-ran it and its output is byte-identical to COMPARE-core.txt and COMPARE-ui.txt in this folder.

## Verdict

CLEAN WITH NOTES. NEW is zero by the tool and by the auditor's own reclassification keyed on file and full name. 28 rows that passed in the baseline have no result in this run because four tracked evidence files were absent from the sparse checkout; those rows are unverified at 6a846c99, not failing. The tool's "UNTRACKED" label is wrong for those four files and right for the three generated r3n1 checkpoints.

## 1. Lifecycle

- lane.log.meta: `start; 2026-10-28 21:41:33 CDT`, `end, exit 1; 2026-10-28 23:38:39 CDT`. launcher.pid 99480 is gone; no vitest, lane-run or run.sh process remains. USED exists (run.sh's own touch).
- lane.log opens with `known-missing inputs: 4`, then `Node v20.20.2; HEAD 6a846c997a6caac18bf32973518d24e5baab2850`.
- Stages (exit, elapsed, baseline elapsed): root-ui-types 0, 101 s (106); bridge-types 0, 37 s (43); bridge-contract 0, 1 s (1); bridge-fixture-contract 0, 2 s (1); build 0, 24 s (24); full-core-including-bridge 1, 5899 s (8466); full-ui 1, 960 s (903); final-source-integrity 0, 1 s (0). `=== CHECKPOINT exit=1` comes from the two test stages only. No STOP, abort or runtime-floor line.
- preflight.LOCAL.json: launchAllowed true, laneAbsent true, heavyLOCAL empty, freeKiB 6,992,892 against the 3,670,016 minimum, AC power 100% charged, memory free 50%, load 3.52/5.18/7.05. Godot scan: 419 process lines, 0 godot. The run.sh and SELECTION.json pins and the four tool pins recompute equal to the preflight record.

## 2. Binding

- SELECTION head 6a846c997a6caac18bf32973518d24e5baab2850; `sourceManifestEntries` 2236 equals the manifest key count.
- All 2236 manifest hashes equal the blobs at 6a846c99 (0 mismatches). Every tracked file under src (221), tests (917), bridge (69), scripts (89), ui (735) and generated is in the manifest; docs (103 of 21,921) and evidence (0 of 233) are partial because the checkout is sparse.
- final-source-integrity exit 0; run.sh asserted a clean tree at start.
- Note: SELECTION.json `purpose` names full-tree-r4 as the baseline while its `limits` text still says "against full-tree-r9" (template residue). The compare used r4.

## 3. Results

| | Core | UI |
|---|---|---|
| Tests | 6196 total; 129 failed; 6053 passed; 3 skipped; 11 todo | 2757 total; 3 failed; 2749 passed; 5 skipped |
| Files | 565; 32 failed | 211; 2 failed |
| Classes | NEW 0; INHERITED-SAME 93; INHERITED-CHANGED 1; MISSING-INPUT 35; BASELINE-NOT-REPRODUCED 6; OVER-BUDGET-PASS 682 | NEW 0; INHERITED-SAME 3; others 0 |

The JSON summaries match the lane.log lines. All 94 non-ENOENT failures also failed in the baseline with identical first lines except the projection20 pin. Duplicate keys: the same two d11-cycle3 names as the baseline.

## 4. MISSING-INPUT (35 rows, 7 files)

| File | Rows | Tracked at 6a846c99 and e115be4b | In the baseline manifest |
|---|---|---|---|
| docs/…/p14b4-20260919/1052-c3-endurance-A-observer-fixed/authority-6240.json | 22 | yes | yes |
| docs/…/p14b4-20260919/978-c3-historical-controls.json | 3 | yes | yes |
| docs/…/p14b4-20260919/1052-c3-endurance-C-recording-v1/authority-failure.json | 3 | yes | yes |
| docs/…/p14b4-20260919/1230-legacy46-baseline.txt | 1 | yes | yes |
| evidence/Playability-Interaction-01/fixtures/r3n1-dense-02{,p31,p32}/…checkpoint.json | 2 each | no (gitignored, generated) | no |

The baseline never hit the four docs ENOENTs; its MISSING-INPUTS list held only the three r3n1 files, which failed identically there. The 24 manifest entries the baseline had and this run lacked are all docs files. No test, source or docs file in this set changed between e115be4b and 6a846c99. The 28 unverified rows: p15c2-campaign-legacy-integration 19, p14c3-force-order 3, p14p4p5 finishing-material, post-capacity, screenplay-status and soundstage-capacity 1 each, p15b-legacy-v3 1, p15c2-campaign-legacy-sibling 1. The 35th row is p15c2 `legacy-root-downgrade`, which failed in the baseline on its 120,000 ms budget (215,827 ms) and here hit ENOENT first, so that budget behaviour was not observed. Disposition: the coordinator materialized all 24 missing manifest files (plus the four named) in the worktree before the next gate; the final gate verifies these rows.

## 5. INHERITED-CHANGED (1)

tests/bridge-owner-ux-projection20-migration.test.ts line 65 `expect(PROJECTION_VERSION).toBe(53)`: `expected 69 to be 53` here, `expected 68 to be 53` in the baseline. bridge/schema/bridge-schema.ts has `PROJECTION_VERSION = 68` at e115be4b and `= 69` at 6a846c99; the test file is unchanged. The pin already failed at 68; the message change is the intended 68 → 69 move. The three `expected 51 to be 38` rows in that file are identical in both runs.

## 6. BASELINE-NOT-REPRODUCED (6): all timing-class

| Test | Baseline | This run |
|---|---|---|
| bridge-p12-campaign-library R05 catalogue-only rename | 31,992 ms, timed out at 20,000 | passed 8,186 ms |
| bridge-p12-campaign-library R05 catalogue-only delete | 43,006 ms, timed out at 20,000 | passed 7,546 ms |
| bridge-p13b-s7-disclosure T3 item 5 | 33,892 ms, timed out at 30,000 | passed 19,170 ms |
| bridge-runtime-checkpoint-prepared-reuse, live authority on failed Save | 27,173 ms, timed out at 20,000 | passed 16,698 ms |
| bridge-runtime-worker, delivers an accepted campaign Save | 30,086 ms, timed out at 30,000 | passed 7,656 ms |
| bridge-runtime-worker, durably saves exact response bytes | 33,702 ms, timed out at 30,000 | passed 12,727 ms |

Thin margins this run: p13b-s7 at 64% of its budget, prepared-reuse at 83.5%.

## 7. Timing

- OVER-BUDGET-PASS core 682, max 356,613 ms; baseline against itself 813, max 716,931 ms. UI 0 in both; max ui duration 43.4 s (a failure) against 42.8 s.
- Core stage wall 5899 s against 8466 s; summed test durations 15,572 s against 22,821 s.
- Slowest core files (s, baseline in brackets): bridge-contract-consumer-lock 517.0 (503.0); p14c3-cohort-transition 470.8 (462.0); roster-wall-summary 356.6 (416.0); acceptance-corpus 351.4 (586.1); p14p3-directing-promises 341.4 (315.8); bridge-runtime-checkpoint 328.4 (378.2); roster-wall-continuation 313.3 (355.3); roster-wall-player-policy 290.4 (416.0); bridge.test.ts 276.8 (1195.9); p14b4-save-v30-compatibility 276.5 (279.8).
- Timeout failures by budget, this run against baseline: 5000 ms 10 (10); 20000 ms 2 (5); 30000 ms 0 (3); 60000 ms 1 (1).
- Budgets unchanged: vitest.workspace.ts (core default 5000, ui testTimeout 30,000), vitest.config.ts, ui/vite.config.ts, package.json, package-lock.json, the three root tsconfigs, ui/tsconfig.json and .nvmrc show no diff between e115be4b and 6a846c99. The 63 changed files are tests, e2e specs, bridge, src, scripts, generated and ui/src/styles.css.

## 8. Anomalies

None. No Unhandled, "did not exit", close-timeout, hook-timeout, worker-crash, load or transform failure, EMFILE, ENOSPC, ERR_ or Serialized Error text. Seven stderr blocks, the same as the baseline (five React act() warnings, one jsdom canvas getContext). The three ui failures are the baseline's three 30 s rows: LotNative cash-stop 43,390 ms (42,810), StudioHome topbar focus 36,751 ms (32,104), StudioHome building focus 38,678 ms (36,608).
