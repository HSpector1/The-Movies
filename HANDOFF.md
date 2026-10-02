# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), 2026-10-01 19:30 CDT (the Mac runs on CDT; use `date`)

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ 7f0d15c3 plus the commit that updates this file, pushed: yes. The working tree is clean.
- Resume this session: `cd ~/Downloads/project-studio-p13-owner-direction-inputs-01 && claude --resume 60db833c-4cf7-4685-b2ec-8aac42c6dac1` (the session started in that folder; it works in this repo). A fresh session: start `claude` in this repo root and say "resume from HANDOFF.md".
- Required reading, in order:
  1. This file.
  2. `E/1344-X9-save43-sweep-dry-run-x3.md` (x3 attributed), `E/1344-X11-row6-and-promise-probe-results.md` and `E/1344-F6-parent-ruling-declared-exceptions.md`.
  3. The staged sweep: `E/1344-C5-save43-sweep-handback.md`, `E/1344-stage/1344-save43-sweep.patch` and `-classification.json`, then `E/1344-X12-guard-order-and-s4-measurements.md`.
  4. `E/1344-N-save43-pin-sweep-plan.md` (classes S1-S10, success line :80-82), then the rulings `E/1344-F4-parent-rulings-on-sweep-s10-and-open-items.md` and `E/1344-F5-parent-rulings-row6-and-s7-definitions.md`.
  5. `docs/engineering/playability-launch-review/CONTINUATION-STATE.md`, top `## CURRENT` block (refreshed at c8c2872b; this file is newer).

## Active order
- Governing Owner order: the Opus take-over mandate (recover, finish P14, then P15 → P16 → P17 → a specified P18) under `docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`, with Owner rulings 1340-O, D-1339-1 and 1342-O.
- In scope: the Save43 pin sweep (1344-C5) and P14 closure 1344-K; relationship slices A and B; the P15 Wave 2 reference runs; after P14, the P15 queue.
- Closed, do not reopen: the 1340-O and 1342-O rulings; U2 (1341-K); P15B Wave 1 (1352-L); P15A.1 and P15A.2 Wave 1; the P15C Wave 1 landing (1353-L; its broad gates ride with the sweep's); the three P15 Wave 2 RED reviews (1356-D2, 1355-D3 and 1359-D3, all CONFIRMED).

## State
- Done (all pushed; records in E):
  - P15C Wave 1 landed (1353-L). Save43 sweep authored (helpers, g1-g6), merged in `S/1344-merge/tree` (own git repo, base 6c54d5e = repo 3a606df4), r2 merged (r2a 5c7f499, r2b 1c2f9e8, r2c 6935ea5), plus parent commits f8c48ec (S1), becafce (S2), **62f14e7 (HYGIENE)** and **27b56c2 (S9, X12)**. Merge HEAD 27b56c2.
  - **1344-X9, dry run x3** (merge 6935ea5): type gates 0 errors; core 93 failed (x2 123); vs 1338 SAME 67, CHANGED 11, NEW 15, GONE 1 (exporter). No new identity over x2; 30 rows cleared; every r2 deferral measured and passing. UI 3 failed (numpy), vs 1343 CHANGED 3, GONE 7, NEW 0. X8 carries an erratum: `hygiene:45` is real (two base comments), fixed by 62f14e7.
  - **1344-X11**: row 6 probe r3 NONE (reason P3, all 8 gates true); promise-row probe r3 PREMISE_CONFLICT with re-witness NONE per file (all 7 gates, 10 predictions true). **1344-F6**: the seven leaves (row 6 ×3, R1-R3, N10) are declared exceptions for the Owner; 1344-N's "no new identity" reads with them listed. X10's outputs (`E/1344-stage/s10/out/`) are now tracked (the `out/` and `*.log` ignore rules had kept them local).
  - **Staged and committed (7f0d15c3)**: `E/1344-stage/1344-save43-sweep.patch` (6c54d5e..27b56c2 of the merge tree; 327,929 bytes, sha256 4b461eda…; 137 files: 132 tests and 5 ui; +822/-512; `git apply --check` OK at HEAD), `E/1344-stage/1344-save43-sweep-classification.json` (529 rows, sha256 6f55fca6…, every changed file covered) and the handback **`E/1344-C5-save43-sweep-handback.md`**.
  - **1344-X12**: F4 ruling 7's S4 condition measured (without the step D14 fails `validateSaveV42: expected version 42`); six alternation-regex sites measured. `p14c3-transitions:169` was masked by Save43's shelving guard, so parent commit **27b56c2** pins it (S9) and pins :198 to the V37 guard (file alone: 35 passed). `p14c2b-save-v36` :74/:82 are masked by the V39 guard since before Save43: a finding for 1344-K, outside the sweep. Merge HEAD is now 27b56c2.
  - P15 reference runs: **1356-X** (RED 69/2 as declared; reference 69 pass, 2 fail: the capture leaf and `rank-validate-cadence-boundary` case (a), whose world keeps a founding draft open while rival method locks enter the technology corpus, which the repo's own validator refuses, at base too); harness 61.0 s alone. **1355-X** (RED 55/4 as declared; reference 42 pass, 17 fail: 4 FIXTURE PENDING and 13 route-premise failures; the route's industry produces nothing through week 160). Rulings **1356-F3** (r3: found the studio in case (a); harness ceiling 300 s) and **1355-F6** (r4: a measured route).
- In flight (as of 19:30 CDT, 2026-10-01):
  - Agent reviewing the staged sweep as **1344-D4** (read-only) into `S/1344-merge/1344-D4-review.md`.
  - Agent writing **1356 r3** in `S/1356-red/tree` (may run two single-leaf vitest runs).
  - Agent writing **1355 r4** in `S/1355-red/tree` (may run single-file route probes, at most 40 min).
  - The heavy lane is lent to the two author agents for single-file runs. Start no recorded gate until both report done.
- Claims limits: the staged patch is unreviewed (1344-D4 running). 27b56c2 is verified by a single-file run, not a dry run. The Fake Unity rows are scratch-only by 1320-X's evidence; the recorded gate in the repo decides. 1356-X F-2 (open-draft conflict) is unverified through the shipped bridge.

## Next step
E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, S = `/Users/zacheryspector/studio-scratch`. Standing rules: one production writer; one heavy test process at a time; no commits during a recorded run; free disk ≥ 5 GB before a recorded run.

1. **1344-C5** is done (7f0d15c3).
2. **1344-D4** (running). When it returns: publish it to `E/1344-D4-save43-sweep-review.md`; apply any required change in the merge tree as a parent commit, regenerate the patch and classification, and re-stage. The review covers the 1320-D checklist: assertion strength, live versus historical saves, sentinels, chains and S9 against production law, helper and catalogue pins, a classification sample of more than 40 rows (the `atHead` field marks moved and notVerbatim rows), the handbacks' open items, the S10 declarations, the declared exceptions (1344-F6) and the HYGIENE commit.
3. **Apply and recorded gates**, after D4 accepts and both author agents are done: `git apply --index E/1344-stage/1344-save43-sweep.patch`, commit (tests only), push, confirm disk ≥ 5 GB. Core: `python3 E/run-bounded-source-guards.py pre 1344-save43-sweep-broad-core 0`, then `PATH="$PWD/.venv/bin:$PATH" node E/run-bounded-source-c2.mjs 1344-save43-sweep-broad-core node_modules/.bin/vitest run --project core $(cat S/1344-merge/core-list.txt)`, then `python3 E/run-bounded-source-guards.py post 1344-save43-sweep-broad-core` (85-130 min). UI alone, the same way, with `1344-save43-sweep-broad-ui` and `vitest run --project ui`. A void run repeats with a `-r2` suffix. Attribute as 1344-I3 (core vs 1338) and 1344-I4 (UI vs 1343), record 1344-M3 (expected NEW set: exactly the seven declared exceptions, plus any environment row attributed on its own evidence), review 1344-J3. Check appliedEqualsDryRunTree against merge HEAD 27b56c2 (or the re-staged HEAD).
4. **§7, then closure 1344-K.** Run §7 with the kit (`E/1344-stage/s7/RUNBOOK.md`; definitions in 1344-F5 Part B). Then 1344-K on the 1319-K pattern, listing the declared exceptions (1344-F6) for the Owner. Add the K entry atop 06, refresh the CURRENT blocks and this file. 1352-L and 1353-L close their pending broad gates with the same runs.
5. **P15 revisions.** 1356-C3 (r3) and 1355-C4 (r4) from the agents: the parent re-runs each reference (1356-X2, 1355-X2; for 1355 also its route probe), then a confirmation review each. 1359-X (`S/1359-x/run-1359-X.sh`, ready, long: route L to week 6760) runs when the heavy lane has no P14 work.
6. **Queue after P14.** Heavy lane, in order: slice A recorded RED and GREEN (1348-F5:31-38), P15B probe 1357-P (record 1357-X), slice B producer mint 1358-P (at the last Save43 writer), probes G1 (P15A.1, after §7) and G-P (P15C, before production), then the P15 recorded REDs. Writers, one at a time: slice A steps 1-3 (r5 rebases on the landed sweep) → slice B (Save44, projection 57) → P15A.2 slice 2a → the P15A.1, P15B and P15C Wave 2 productions (may share one save step, Save45). Carried: P15 capture mints at the last writer below the P15 step (1355-P, 1359-P); 1355-P records the proven release week in its MANIFEST `facts`.

Agents: the user allows as many subagents as help (2026-10-01). Agents author and review; only the parent runs broad or heavy tests.

## Open decisions for the Owner
- numpy for the three rgba-export tool-contract rows: recommend a scoped `.venv` install beside Pillow, because the rows otherwise stay permanent environment failures (1345-E).
- P16: the nine questions in 1354-Q, open until the Owner answers.
- 1344-K will list seven declared exceptions (1344-F6: row 6 ×3, promise rows ×4). Recommend accepting them as they stand: both probes found no lawful re-witness in the fixtures, so only a new fixture or retiring the leaves would change them.
- 1356-X F-2: an open founding draft plus rival method locks gives a state the repo's validator refuses. Recommend narrowing the rule at `src/core/technology.ts:897` to the player's own rows, under its own charter, after a reachability check through the bridge.

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
- Stamped: 2026-10-01 18:40 CDT by **claude** on PreCompact (session 60db833c-4cf7-4685-b2ec-8aac42c6dac1)
- Branch: `wip/headless-program-20260916-ts` @ `32640b1ec519bd3d54c0828e3f1bf2c68b2ab8f6`
- Upstream: `none`, unpushed commits: ?
- Uncommitted files: 1
  - `M HANDOFF.md`
- Last commits:
  - 32640b1e docs(p15c): 1359-D3 confirmation of RED r3 — CONFIRMED (all three P15 Wave 2 REDs review-complete)
  - 8ed00148 docs(p15c): Wave 2 RED r3 staged (1359-C3: routeL fix at B6; F1 matches the :351 message)
  - 872b4b08 docs(p15c): 1359-D2 confirmation of RED r2 — NOT CONFIRMED (route().ms leftover at :770; F1 refusal pattern too loose)
  - 5474b879 docs(handoff): two P15 REDs review-complete; promise probe confirmed; heavy queue armed behind x3
  - da6e73f6 docs(p14): 1344-D9 confirmation of promise-row probe r3 — CONFIRMED
<!-- AUTO:END -->
