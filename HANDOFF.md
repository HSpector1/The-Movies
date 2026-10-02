# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), 2026-10-01 20:07 CDT (the Mac runs on CDT; use `date`)

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ cec3902c plus the commit that updates this file, pushed: yes. The working tree is clean.
- Resume this session: `cd ~/Downloads/project-studio-p13-owner-direction-inputs-01 && claude --resume 60db833c-4cf7-4685-b2ec-8aac42c6dac1` (the session started in that folder; it works in this repo). A fresh session: start `claude` in this repo root and say "resume from HANDOFF.md".
- Required reading, in order:
  1. This file.
  2. `/Users/zacheryspector/studio-scratch/1344-gates/gates.meta` (the recorded gates' progress), then `E/1344-C5-save43-sweep-handback.md` and `E/1344-D4-save43-sweep-review.md`.
  3. `E/1344-X9-save43-sweep-dry-run-x3.md`, `E/1344-X12-guard-order-and-s4-measurements.md` and `E/1344-F6-parent-ruling-declared-exceptions.md`.
  4. `E/1344-N-save43-pin-sweep-plan.md` (classes S1-S10, success line :80-82), then the rulings `E/1344-F4-parent-rulings-on-sweep-s10-and-open-items.md` and `E/1344-F5-parent-rulings-row6-and-s7-definitions.md`.
  5. `docs/engineering/playability-launch-review/CONTINUATION-STATE.md`, top `## CURRENT` block (refreshed at c8c2872b; this file is newer).

## Active order
- Governing Owner order: the Opus take-over mandate (recover, finish P14, then P15 → P16 → P17 → a specified P18) under `docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`, with Owner rulings 1340-O, D-1339-1 and 1342-O.
- In scope: the Save43 pin sweep (1344-C5) and P14 closure 1344-K; relationship slices A and B; the P15 Wave 2 reference runs; after P14, the P15 queue.
- Closed, do not reopen: the 1340-O and 1342-O rulings; U2 (1341-K); P15B Wave 1 (1352-L); P15A.1 and P15A.2 Wave 1; the P15C Wave 1 landing (1353-L; its broad gates ride with the sweep's); the three P15 Wave 2 RED reviews (1356-D2, 1355-D3 and 1359-D3, all CONFIRMED).

## State
- Done (all pushed; records in E):
  - **The Save43 sweep is applied: cec3902c** (`test(p14): Save43 pin sweep, 137 files`). It is `E/1344-stage/1344-save43-sweep.patch` (sha256 4b461eda…), and the applied `tests/` and `ui/` trees equal the scratch dry-run tree at 27b56c2 file for file (1,192 files), with `src` db80ca31 and `generated` 8b0ab810 identical. Handback **1344-C5**; review **1344-D4** ACCEPT WITH CHANGES, all changes applied (classification now 532 rows, sha256 424b2dbc…).
  - Dry runs x2 (1344-X8, with erratum) and x3 (1344-X9): core 93 failed, no new identity over x2; UI 3 (numpy). Probes 1344-X10, X11; measurements **1344-X12** (S4 counterfactual; nine guard-order sites; the S9 parent commit 27b56c2; a pre-Save43 V39-masking finding on five downgrade leaves for 1344-K). Declared exceptions **1344-F6** (row 6 ×3, promise rows ×4).
  - P15: **P15A.1 RED r4 CONFIRMED (1355-D4)**: review-complete, reference re-run 1355-X2 53 pass + 6 FIXTURE PENDING. P15A.2 RED r3 NOT CONFIRMED (1356-D3: the harness ceiling cannot fire); **1356-F5** orders r4 and corrects 1356-F4's founding facts. P15C: **1359-X** found route L unlawful (a late public founding with the draft open) and a reference ranking-key bug; **1359-F3** orders RED r4 and reference r3.
- In flight (as of 20:07 CDT, 2026-10-01):
  - **The recorded broad gates**, about to launch detached: `/Users/zacheryspector/studio-scratch/1344-gates/run-gates.sh` (core 433 files, then UI; guards pre and post; `.venv` on PATH). Progress `/Users/zacheryspector/studio-scratch/1344-gates/gates.meta`, output `gates.log`. It holds `/Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK` while running. **NO COMMITS until gates.meta says "end"** (the recorder compares HEAD). Expected 85-130 min core, 20 min UI.
  - Agent writing **1356 RED r4** in `/Users/zacheryspector/studio-scratch/1356-red/tree` (harness ceiling self-timed).
  - Agent writing **1359 RED r4 + reference r3** in `/Users/zacheryspector/studio-scratch/1359-red/tree`.
  - Both agents start no vitest while the lock file exists.
- Claims limits: the recorded gates decide the sweep. The Fake Unity rows are scratch-only by 1320-X's evidence; the repo run decides them. 1356-X F-2 (late public founding) is unverified through the shipped bridge.

## Next step
E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, S = `/Users/zacheryspector/studio-scratch`. Standing rules: one production writer; one heavy test process at a time; no commits during a recorded run; free disk ≥ 5 GB before a recorded run.

1. **When gates.meta says "end"** (or a STOP line): check each run's `fixedSource` and guards (`E/1344-save43-sweep-broad-core.json`, `-postflight.json`; the same for `-broad-ui`). A void run repeats with a `-r2` suffix. Then attribute from the repo root: core `python3 E/1321-I-attribution.py E/1344-save43-sweep-broad-core.txt E/1344-I3-core-failures.json` and `python3 E/1344-I-compare.py E/1344-I3-core-failures.json E/1338-I-failures.json E/1344-I3-core-vs1338.json`; UI `python3 E/1317-I-attribution.py E/1344-save43-sweep-broad-ui.txt E/1344-I4-ui-failures.json`, then compare against `E/1343-I-failures.json` into `E/1344-I4-ui-vs1343.json`. Expected: core SAME + CHANGED = 78 (1338's 79 minus the exporter), NEW = exactly the seven F6 exceptions plus any environment row attributed on its own evidence (the C17 and Fake Unity scratch artifacts should vanish in the repo); UI CHANGED 3 (numpy), GONE 7, NEW 0. Record 1344-M3; review 1344-J3 (independent, read-only).
2. **§7, then closure 1344-K.** Run §7 with the kit (`E/1344-stage/s7/RUNBOOK.md`; definitions 1344-F5 Part B; add 1355-X2's seed `-01` stall as a flagged observation). Then 1344-K on the 1319-K pattern: pinned artifacts, red, green, the sweep block, the application commit cec3902c with appliedEqualsDryRunTree true, core and UI gates, type gates at HEAD, the §7 result, the seven declared exceptions (F6), open items (X12's V39-masking family; 1356-X F-2), next. Add the K entry atop 06, refresh the CURRENT blocks and this file. 1352-L and 1353-L close their pending broad gates with the same runs.
3. **P15 revisions.** 1356 r4 (C4) and 1359 r4 (C4 + reference r3) from the agents: the parent re-runs each (1356-X3: harness alone; 1359-X2: RED and reference with route L lawful, setting the route and extension budgets), then a confirmation review each.
4. **Queue after P14.** Heavy lane, in order: slice A recorded RED and GREEN (1348-F5:31-38), P15B probe 1357-P (record 1357-X), slice B producer mint 1358-P and its dry run 1358-X, probes G1 (P15A.1, after §7) and G-P (P15C, before production), then the P15 recorded REDs. Writers, one at a time: slice A steps 1-3 (r5 rebases on cec3902c) → slice B (Save44, projection 57) → P15A.2 slice 2a → the P15A.1, P15B and P15C Wave 2 productions (may share Save45). P15 capture mints at the last writer below the P15 step (1355-P r3, 1359-P).

Agents: the user allows as many subagents as help (2026-10-01). Agents author and review; only the parent runs broad or heavy tests.

## Open decisions for the Owner
- numpy for the three rgba-export tool-contract rows: recommend a scoped `.venv` install beside Pillow, because the rows otherwise stay permanent environment failures (1345-E).
- P16: the nine questions in 1354-Q, open until the Owner answers.
- 1344-K will list seven declared exceptions (1344-F6: row 6 ×3, promise rows ×4). Recommend accepting them as they stand: both probes found no lawful re-witness in the fixtures, so only a new fixture or retiring the leaves would change them.
- 1356-X F-2 as restated in 1356-F5: a public founding after week 0 reaches no valid save once the player signs the roster (ledger-payment rule) or ticks with the draft open after rivals lock methods (technology rule). Recommend a reachability check through the bridge first, then one charter for both rules if the path is reachable.
- X12's V39-masking family: five downgrade leaves (`p14c2b-save-v36` :74/:82, `p14c2s-scientist-retirement` :279/:280, `p14c2rm-writer-continuation:254`, `p13b-s8-save-v27:188`) pass without reaching the guard they name, since before Save43. Recommend a small RED that gives each an input whose first refusal is its own guard.

## Blockers and warnings
- `~/Downloads/project-studio-p13-owner-direction-inputs-01` is a superseded P13 input kit. It holds only a pointer HANDOFF.md to this file.
- Scratch lives in `S`: 1344-merge (merge tree, dry-run outputs, `run-dry-run.sh`, `core-list.txt`, `merge-classification.py`), 1344-r2 (shared r2 clone and outputs), 1344-r3, 1344-sweep (group outputs), heavy-queue, 1355-red, 1356-red, 1359-red, 1355-x, 1356-x, 1359-x. Trees link the real `docs`, `node_modules`, `art`, `tools` and `tests/fixtures`: use `ln -sfn`, never write under a link, and delete with `rm -rf` on literal paths without a trailing slash.
- The queue's first two steps check the merge tree's `HEAD:src`, `HEAD:generated`, the probed test file and a clean status. Leave the merge tree alone until they finish.
- If an agent returns `401 OAuth access token has been revoked`, the Owner runs `/login`.
- No commits during a recorded run or its postflight. x3 and the queue are not recorded runs, so repo commits are safe during them. Hook stamps to the AUTO block are harmless.
- The machine has 4 CPUs and 8 GB RAM. One heavy test process at a time. Disk: 6 GB free at 18:45 CDT.
- Do not access Owner saves, scan fixture trees, force-push, or launch Codex.

## Auto snapshot
<!-- AUTO:BEGIN (handoff_guard.py rewrites this block) -->
- Stamped: 2026-10-01 19:54 CDT by **claude** on PreCompact (session 60db833c-4cf7-4685-b2ec-8aac42c6dac1)
- Branch: `wip/headless-program-20260916-ts` @ `6427a49119b12351eaeacdbf71916166c954c512`
- Upstream: `none`, unpushed commits: ?
- Uncommitted files: 0
- Last commits:
  - 6427a491 docs(p15c): 1359-X reference run (route L unlawful under the founding-draft conflict; reference ranking key wrong); 1359-F3
  - 2eaacb29 docs(p15): 1356 RED r3 and 1355 RED r4 staged; both reference re-runs match their declarations (1356-X2, 1355-X2); 1356-F4
  - af315499 docs(handoff): sweep staged with C5 (7f0d15c3); X12 and the S9 parent commit; D4 review running
  - 7f0d15c3 docs(p14): stage the Save43 sweep (1344-C5): patch, classification, handback; 1344-X12 guard-order and S4 measurements
  - 6e61d01f docs(handoff): x3 attributed (X9), probes done (X11, F6), sweep patch staged; P15 reference-run findings; three agents in flight
<!-- AUTO:END -->
