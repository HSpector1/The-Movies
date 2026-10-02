# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), 2026-10-02 11:13 CDT (the Mac runs on CDT; use `date`)

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ the commit after c5c0a0a6 that carries this file (relationship slice B CLOSED: 1358-L, 1358-M3), pushed: yes.
- Resume this session: `cd ~/Downloads/project-studio-p13-owner-direction-inputs-01 && claude --resume 60db833c-4cf7-4685-b2ec-8aac42c6dac1` (the session started in that folder; it works in this repo). A fresh session: start `claude` in this repo root and say "resume from HANDOFF.md".
- Required reading, in order:
  1. This file.
  2. `E/1358-L-rel-sliceB-landing.md` (CLOSED, the full step table), `E/1358-M3-sliceb-recorded-broad-gates.md` and `E/1358-C9-sweep-landing-handback.md` (classification, dispositions, closure findings).
  3. P15 Wave 2 REDs: `E/1359-F6-parent-response-to-1359-D5.md` (ruling 5: the rebase onto Save44), `E/1355-F4-parent-response-to-1355-D.md` (landing order), then the handbacks `E/1355-C4-…`, `E/1356-C4-…` and `E/1359-C7-…`.
  4. `E/1357-R-rival-stall-diagnosis.md` and `E/1357-F3-parent-note-on-1357-R.md`: Owner question 1357-Q1.
  5. `docs/engineering/playability-launch-review/CONTINUATION-STATE.md`, top `## CURRENT` block (same as 06's).

## Active order
- Governing Owner order: the Opus take-over mandate (recover, finish P14, then P15 → P16 → P17 → a specified P18) under `docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`, with Owner rulings 1340-O, D-1339-1 and 1342-O.
- In scope: the P15 Wave 2 REDs (P15A.1, P15A.2, P15C) on the Save44 base, their mints and recorded REDs; then P15A.2 slice 2a production (Save45); P15B Wave 2 only after 1357-Q1.
- Closed, do not reopen:
  - P14 shelving, Save43 and the sweep (1344-K); §7 (1344-V);
  - P15 Wave 1 (1346-K, 1352-K, 1353-K);
  - relationship slice A (1348-L, 1348-M) and slice B (1358-L, 1358-M3);
  - the RED confirmations 1355-D4, 1356-D4 and 1359-D4 (P15C's C11 reopens only for 1353-F6 ruling 3);
  - the 1340-O and 1342-O rulings; U2 (1341-K).

## State
- Done earlier (pushed): 1344-V, 1344-K (P14 closed); Wave 1 closures 1346-K, 1352-K, 1353-K; slice A (1348-L, 1348-M); the P15C retune (1353-T, F6, U, F7) and P15C RED r7 with reference r4 (1359-C7, 1359-X5: RED 40 failed / 76 passed); 1357-X/F2 and 1357-R/F3 (Owner question 1357-Q1).
- Done this session (pushed):
  - **Relationship slice B landed and CLOSED** (`E/1358-L`). Production r2 as four commits 9eb1e66e, 8df1858e, 615adeb2, 83d1030d (blob-equal to the reviewed step 4). Pin sweep r4 at f458680b: 154 test files (1358-N; units H, G1-G6, F1, F2; rulings 1358-F9 to F12; dry runs X6, X7t, X8, X9t; reviews 1358-D9 REFINE, 1358-D9b CONFIRMED). Source manifest eb1c2512; recorded producer `1358-p57-declaration` (282ad680; F10 = F11 = 1dadf88f…); F10/F11 pins 5ac4b738; recorded GREEN b60db650: 3 failed / 145 passed, the row 6 exceptions.
  - **1358-M3** (recorded broad gates, Node v20.20.2, fixedSource and allGuardsExact): core at b60db650 85 failed / 4,992 passed (440 files), against 1348-I SAME 84 + C20 CHANGED by the version digit, NEW 0, GONE 0; UI at c5c0a0a6 3 failed (the numpy rows), CHANGED 3 by the temporary directory only. Type gates and both generator checks pass at the landed HEAD (`E/1358-L-type-gates.txt`).
  - **1358-C9** (landing handback: 762 classification rows, 29 census dispositions, eight closure findings) and **1358-J3** (independent landing review: REFINE on records, applied).
- In flight: nothing. The lane is free.
- Prepared for the P15 rebase (not run), in `S/p15-save44/`:
  - P15C RED **r8** `1359-p15c-wave2-red-r8.patch` (sha256 2a5df977…): `BASE_LIVE_SAVE_VERSION` 43 → 44 and three comment lines; nothing else changes. Its `legacy-root-fresh` leaf fails at RED on its first assertion, so the RED messages stand.
  - `run-p15-reds-save44.sh`: each P15 RED applied alone (all three create `tests/helpers/p15-roots.ts`) on OLD 65515b66 (Save43) and NEW HEAD (Save44), with JSON output and the root type gate; 1359 runs r7 on OLD and r8 on NEW. `check-p15-save44.py` compares OLD with NEW leaf by leaf, and each with its classification.
  - `run-p15-producers-save44.sh`: dry runs of 1359-P r4 over RED r8 and 1355-P r3 (mint mode) on the Save44 base.
- Claims limits:
  - 1353-T's market-pressure numbers are first order (open-loop factors from 1355-G1).
  - The retune rests on five rival careers on seed-b; p13a's rivals stop filming (1357-R).
  - The P15 REDs' Save44 behaviour rests on reading until the dry runs. The P15 reference patches (1356, 1355 r3 over it, 1359 r4) each mint Save44; on this base they need a Save45 retarget before any reference run.

## Next step
E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, S = `/Users/zacheryspector/studio-scratch`. Standing rules: one production writer; one heavy test process at a time; no commits (and no `git add`) during a recorded run or its postflight; free disk ≥ 5 GiB before a recorded run; recorded runs pin Node v20.20.2; recorded stems match `^[0-9]{3,4}[a-z0-9-]*$` (lowercase).

1. **P15 Save44 dry runs.** `nohup bash S/heavy-queue/lane-run.sh 0 S/p15-save44/reds.log bash S/p15-save44/run-p15-reds-save44.sh &`, then `python3 S/p15-save44/check-p15-save44.py`; then `lane-run.sh 0 S/p15-save44/producers.log bash S/p15-save44/run-p15-producers-save44.sh`. Read `S/p15-save44/run.meta`. Remove the trees afterwards (links first, literal paths): `S/p15-save44/tree-old`, `tree-new`, `prod/ptree-1359`, `prod/ptree-1355`. Record 1355-X5, 1356-X4, 1359-X6 and the parent revision 1359-C8 (r8).
2. **P15 RED landings** on the Save44 base, in 1355-F4's order (P15A.2 slice 2a before P15A.1 Wave 2). Each RED creates `tests/helpers/p15-roots.ts`, so the second and third merge `P15_ROOTS`. For P15A.1 and P15C: commit the producer at the E root (its imports are five levels deep), run the recorded mint, commit the fixtures, then the recorded RED.
3. **P15A.2 slice 2a production** (Save45) from the 1356 reference, retargeted. P15B waits for 1357-Q1.

Agents: the user allows as many subagents as help (2026-10-01). Agents author and review; only the parent runs broad or heavy tests.

## Open decisions for the Owner
- **1357-Q1:** the P15B closure law closes 7 of 8 rivals by 1960 on two seeds because rivals that stop filming have no income and cannot cut costs. 1357-R/1357-F3 trace the start of the stall to the shelving law's `cashBlocked` rule (1344-A:57): a screenplay that loses money at every affordable package never shelves once its dearest package is out of reach. Recommend (a): fix that rule first, then rival cost-cutting, then re-probe. Options (b) and (c) are in 1357-F2 §4.
- **The P15C playtest brief** carries 1353-T §6.3: no player distribution backs the retuned Legacy lines; the Owner judges `artistic-voice` (critic 60, one release in five) and `commercial-engine` (49% of `baseMarketValue`) in play.
- **Slice B's provisional copy** (1358-F7 ruling 7): the relationship labels' player-facing text.
- **numpy** for the three rgba-export tool-contract rows. Recommend a scoped `.venv` install beside Pillow (1345-E).
- **P16:** the nine questions in 1354-Q.
- **The seven declared exceptions** that 1344-K lists (1344-F6). Recommend accepting them: both probes found no lawful re-witness.
- **The §7 flags** (1344-V §9, items 1-6): measured behaviour with no threshold, including the 154 promise movements.
- **1356-X F-2,** as 1356-F5 restates it. Recommend checking reachability through the bridge first.
- **X12's V39-masking family.** Recommend a small RED that gives each leaf an input whose first refusal is its own guard.

## Blockers and warnings
- **Node.** Recorded runs pin v20.20.2: put `/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin` first on PATH. The session's nvm default is v22.23.2.
- **Heavy lane.** `S/heavy-queue/lane-run.sh <pid|0> <log> <cmd…>` takes `S/HEAVY-LANE-LOCK`, waits out vitest or tsc (matched on the `node` command name), runs the job alone and releases the lock. Run it with `bash`; it is not executable. Passing a PID to wait for avoids its 2 h lock cap.
- **The recorder's guards** digest HEAD, the git index and stage entries: no `git add` (not only no commit) while a recorded run or its postflight runs. `git status` can rewrite the index too: during a run use plumbing only (`rev-parse`, `show`, `diff A B`) or `GIT_OPTIONAL_LOCKS=0`. Writing under `docs/` is safe; `src`, `bridge`, `tests`, `ui`, `generated`, `scripts` and the root configs are source paths.
- **Recorded-run scripts** check exactly the five output names (`<stem>.json`, `.txt`, `.patch`, `-preflight.json`, `-postflight.json`); `S/1358-land/recorded3.sh` is the model. A `<stem>-*` glob matched the producer's own files once (memory `recorder-output-exact-names`).
- **Scratch trees.** Never link `tests/fixtures` wholesale: make it a real directory of links and copy `bridge-contract-union-fixtures.ts` (memory `scratch-tree-fixture-links`; model `S/1358-sweep/run-1358-sweep-dry-v2.sh`). Patches that touch `docs/`: apply only `tests/*` in a scratch tree. Never write under a link.
- **Deleting scratch.** The harness blocks `rm` on variable paths; use literal absolute paths, links first, then `rm -rf` on the tree.
- **Agent auth.** If an agent returns `401 OAuth access token has been revoked`, the Owner runs `/login`.
- **The machine.** 4 CPUs, 8 GB RAM. Disk: 5.05 GiB free at 11:13 CDT. Swap shares the disk container (4 GB allocated after the core gate) and moves free space by about 1 GiB; a recorded preflight needs ≥ 5 GiB. Each X run adds a ~130 MB tree: delete it after reading its outputs. `S/1344-merge/x1-core.txt`, `x2-core.txt` and `x3-core.txt` are gzipped in place (gunzip restores the bytes that 1344-X8 and X9 cite). The P15 RED repos survive as mirrors (`S/1355-red/tree-mirror.git`, `S/1356-red/tree-mirror.git`, `S/1359-red/tree-mirror.git`). `S/1358-n/tree` and `S/1358-sweep/merge` hold the slice B reference trees that 1358-J3's scripts read; 1358-L is closed, so they may go once space is needed.
- **Hard limits.** Do not access Owner saves, scan fixture trees, force-push, or launch Codex.

## Auto snapshot
<!-- AUTO:BEGIN (handoff_guard.py rewrites this block) -->
- Stamped: 2026-10-02 08:02 CDT by **claude** on PreCompact (session 60db833c-4cf7-4685-b2ec-8aac42c6dac1)
- Branch: `wip/headless-program-20260916-ts` @ `e0dfe0653880981dbbaf443cdbaf535cd5f138c0`
- Upstream: `none`, unpushed commits: ?
- Uncommitted files: 1
  - `M HANDOFF.md`
- Last commits:
  - e0dfe065 docs(handoff): sweep r2, X8 running, D9 review running, slice B landing prepared
  - 63bd78ac docs(p14b): 1358-F11 rulings after X6 and X7t; 1358-M2 snapshot measurement (no mentorEvidence throw; cost in the base's class); sweep r2 staged
  - 4e411b78 docs(p14b): 1358-X6 sweep r1 dry run: type gates 0 errors, slice B GREEN shape, UI equals 1348-I2; probe finds 15 sites Save44 now masks; core output lost to a parent script edit
  - e36f9c28 docs(handoff,p14b): 1358-N measured fallout from M2; X6 running, snapshot probe queued
  - 5f2b5999 docs(p14b): 1358-M2 slice B fallout measured (core 795 NEW, all Save44/P57 pins, helpers or environment); 1358-F10 sweep rulings; sweep r1 staged
<!-- AUTO:END -->
