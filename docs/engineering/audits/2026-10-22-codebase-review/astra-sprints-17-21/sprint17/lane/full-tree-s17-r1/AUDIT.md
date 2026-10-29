# Postflight audit — full-tree-s17-r1 at ac697d84 (2026-10-29, 10:36 CDT)

Auditor: one read-only Sonnet 5.5 agent, briefed after the run ended; it judged source integrity from the run's own records and `git show ac697d84:<path>`. Baselines: sprint14 full-tree-r4 at e115be4b and playtest-response full-tree-r2 at 6da4206a. Classification tool: p16-sprint10/tools/compare-full.py (core budget 5000 ms, ui 30000 ms); the auditor re-ran it for the four pairs and its output is byte-identical to the four COMPARE-*.txt files in this folder. The report below is the auditor's text, unedited except for this header. Coordinator note: the auditor did not review the logic of the two hollywood diffs (the Sprint 17 review, REVIEW.md, did).

**Verdict: CLEAN WITH NOTES.** Nothing is new in any of the four comparisons, source integrity holds, and budgets are unchanged. The notes are below.

## 1. Lifecycle
- **`lane.log.meta`:** "waiting for pid 0; then: bash …/run.sh; 2026-10-29 08:33:47 CDT", "start; 2026-10-29 08:33:47 CDT", "end, exit 1; 2026-10-29 10:28:01 CDT". Exit 1 is the expected vitest-failures-present code, since `run.sh` sets fail=1 on any non-zero stage. It also ends with `=== CHECKPOINT exit=1` at lane.log line 27912.
- **Launcher:** `launcher.pid` holds 24383, and `ps -p 24383` shows nothing (exit 1), so it is dead. `launcher.out` is 0 bytes. `USED` is present at 0 bytes. `launch-at.txt` is 2026-10-29T08:33:47-05:00.
- **Opening lines of `lane.log`:** line 1 `known-missing inputs:        3`; line 2 `Node v20.20.2; HEAD ac697d84a10e5f558e3ee67633b209be31ca7eca`, which equals the bound commit. `MISSING-INPUTS.txt` lists the three r3n1 `*.checkpoint.json` fixtures (dense-02, dense-02p31, dense-02p32).
- **No stop lines:** counts in `lane.log` are 0 for `=== STOP`, 0 for `STOP:`, 0 for "abort" (case-insensitive) and 0 for "runtime floor".

| Stage | Exit | s17-r1 elapsed | playtest-response r2 elapsed |
|---|---|---|---|
| root-ui-types | 0 | 120s | 104s |
| bridge-types | 0 | 50s | 38s |
| bridge-contract | 0 | 2s | 2s |
| bridge-fixture-contract | 0 | 2s | 1s |
| build | 0 | 32s | 24s |
| full-core-including-bridge | 1 | 5735s | 5708s |
| full-ui | 1 | 911s | 914s |
| final-source-integrity | 0 | 0s | 1s |

Core: vitest reports 5728.78s here and 5706.15s in r2. ui: 908.20s here and 912.76s in r2. Wall clock about 1h54m.

## 2. Source integrity
- `SOURCE-MANIFEST.json` has 2262 entries, matching `SELECTION.json` `sourceManifestEntries`. `SELECTION.json` head is ac697d84a10e5f558e3ee67633b209be31ca7eca.
- Every manifest path's blob at ac697d84 was streamed through `git cat-file --batch` and its SHA-256 compared to the manifest: 0 mismatches; all 2262 paths exist in the ac697d84 tree.
- ac697d84 has 24297 tracked entries. The 22035 not in the manifest are sparse-excluded paths under `docs/` (21794), `evidence/` (233) and `.claude/` (8 symlinks). None are under `src/`, `tests/`, `ui/` or `bridge/`.
- Expected files present in the manifest: `src/core/hollywoodPolicy.ts` (20ca814e…), `src/core/hollywoodTick.ts` (4e6c3486…), `tests/astra17-rival-restart.test.ts` (33f8e1b5…).
- `final-source-integrity exit=0` at lane.log line 27910 (the `git diff --exit-code HEAD` stage).
- `git diff --stat 6da4206a ac697d84`: exactly 3 files, 224 insertions, 1 deletion (hollywoodPolicy.ts +10; hollywoodTick.ts +33/−1; tests/astra17-rival-restart.test.ts +182). `git log 6da4206a..ac697d84` shows 60531b94 and ac697d84, on branch p18-season-20261028.

## 3. Budgets and config
- `git diff --stat` is empty for both e115be4b..ac697d84 and 6da4206a..ac697d84 across `vitest.workspace.ts`, `vitest.config.ts`, `ui/vite.config.ts`, `ui/src/test/setup.ts`, `package.json`, `package-lock.json` and all tsconfigs.
- The workspace sets `testTimeout: 30_000` for the ui project only (line 35). The core project has no `testTimeout`, so it uses the 5000 ms default.
- `tests/astra17-rival-restart.test.ts` declares `TIMEOUT = 60_000` (line 68, used at line 111) and `TIMEOUT = 120_000` (lines 118 and 157, used at lines 150 and 181). The pure-policy cadence test takes no explicit timeout.
- The two commits change only the 3 files above, so no existing test's budget or expectation changed. e115be4b to 6da4206a differs by 64 files, the already-audited predecessor drift.

## 4. Classification
All four re-run outputs are byte-identical to the `COMPARE-*.txt` files (`cmp` clean).

| | core vs s14-r4 | core vs pr-r2 | ui vs s14-r4 | ui vs pr-r2 |
|---|---|---|---|---|
| NEW | 0 | 0 | 0 | 0 |
| INHERITED-SAME | 93 | 94 | 2 | 2 |
| INHERITED-CHANGED | 2 | 1 | 0 | 0 |
| MISSING-INPUT | 6 | 6 | 0 | 0 |
| LOAD-FAILURE | 0 | 0 | 0 | 0 |
| BASELINE-NOT-REPRODUCED | 6 | 0 | 1 | 1 |
| OVER-BUDGET-PASS | 645 (max 287103.1) | 645 (max 287103.1) | 0 | 0 |

- Core totals: 6227 tests, 101 failed, 6112 passed, 3 skipped, 11 todo. ui: 2757 tests, 2 failed, 2750 passed, 5 skipped.
- INHERITED-CHANGED: `tests/bridge-owner-ux-projection20-migration.test.ts` (vs r4 only): now "expected 69 to be 53", r4 said "expected 68 to be 53"; r2 already had 69. `tests/p15c2-campaign-legacy-integration.test.ts` legacy-root-downgrade (vs both): "elapsed 226227 ms against the 120000 ms budget"; r4 215827 ms, r2 188452 ms; same failure kind, load-sensitive elapsed.
- MISSING-INPUT: 6 rows for the 3 r3n1 fixtures (2 tests each). The tool's "UNTRACKED (not recoverable here)" label is the known mislabel.
- BASELINE-NOT-REPRODUCED vs r4 (6 core, all passed here, r4 timed out each): bridge-p12-campaign-library R05 rename 7169 ms (r4 31992 ms vs 20000); R05 delete 5774 ms (r4 43005); bridge-p13b-s7-disclosure item 5 25530 ms (r4 33892 vs 30000); bridge-runtime-checkpoint-prepared-reuse live authority 15260 ms (r4 27173 vs 20000); bridge-runtime-worker accepted campaign Save 7084 ms (r4 30086 vs 30000); durably saves exact response bytes 12015 ms (r4 33702).
- BASELINE-NOT-REPRODUCED in ui (1, both baselines): `WorldFirstStudioHome.test.tsx` "App world-root navigation preserves topbar focus through a supporting-Dashboard Sim result" passed at 27044.5 ms against the 30000 ms budget; r4 32103.7 ms, r2 30583.3 ms.
- First failure lines: against r4 only the two INHERITED-CHANGED rows differ; against r2 only the p15c2 row differs. No failing test is absent from either baseline's failing set. The 101 core failures here are the same 101 keys as r2; the only test keys that differ versus r2 are the 4 new ones.
- ui failures (both "Test timed out in 30000ms"): `WorldFirstLotNativeNextEventApp.test.tsx` "orients a cash stop to Administration…" 42101 ms here (r4 42810, r2 37160); `WorldFirstStudioHome.test.tsx` "preserves building focus…" 30472 ms here (r4 36608, r2 33173). r4 and r2 each had 3 ui failures; the third, the topbar-focus test, passed here.

## 5. New test file
All 4 tests in `tests/astra17-rival-restart.test.ts` passed: cadence (pure policy) 3.5 ms (default 5000); released team restarts (p13a row one) 3285.1 ms (60_000); no restart without an opportunity (week-130 r01) 4022.9 ms (120_000); an opportunity without the money stays in cutting (week-100 r04) 2288.1 ms (120_000). None appear in OVER-BUDGET-PASS.

Related files, 116 tests, all passed: p14d2-rival-cost-cutting 52; p14d2-rival-cost-cutting-adapter 2; p14d1-rival-shelving 29; p14d1-rival-shelving-save-v43 18; p14d1-rival-shelving-natural 5; p16-rival-buyer-absorption163-baseline 3; p16-rival-buyer-rights 3; astra17-rival-restart 4. Versus r2 the only status differences are the 4 new tests.

## 6. Verdict and notes
**CLEAN WITH NOTES.**
1. The p15c2 legacy-root-downgrade elapsed-time message differs from both baselines (226227 vs 215827 and 188452): a load-sensitive budget failure of the same kind, not a regression signal.
2. The projection20 pin reads 69 where r4 read 68: the known predecessor change, matching r2.
3. Versus r4, 45 test keys are in this run only and 10 in r4 only (e115be4b to 6da4206a drift, not this slice): 25 in bridge-schema-first-refusal, 6 in bridge-p14b4-runtime47-compatibility, 4 in astra17-rival-restart, 4 in s14-season-route-witnesses, plus 6 smaller; absent are the old "projection68" P14B4 names, one L-22 name and 3 S14 W3 names. Versus r2 the key set differs only by the 4 new tests.
4. The 6 core and 1 ui "not reproduced" passes are timeout-flaky tests that passed under lighter load. The ui topbar-focus pass sits at 27.0 s against 30 s, not a durable fix.
5. The three r3n1 fixtures are the known missing inputs (6 rows).
6. The manifest covers the sparse-materialized 2262 of 24297 tracked paths; all executed source is included.
7. The tool keys tests by file and full name, so duplicate names collapse: 2 in tests/d11-cycle3.test.ts (both passing) and 4 ui duplicates, none failing.

Not verified: the logic of the hollywoodPolicy.ts and hollywoodTick.ts diffs (out of the audit's scope); process cleanliness beyond the launcher pid.
