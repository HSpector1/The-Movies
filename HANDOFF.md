# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), 2026-10-02 16:00 CDT. Claude's weekly usage stood at 89% at 14:39 CDT (Owner): if Claude stops, Codex resumes from this file.

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ the commit after 50181e76 that carries this file, pushed: yes. Protected main is never touched.
- Resume this session: `cd ~/Downloads/project-studio-p13-owner-direction-inputs-01 && claude --resume 60db833c-4cf7-4685-b2ec-8aac42c6dac1`. A fresh session: start in this repo root and say "resume from HANDOFF.md".
- E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, S = `/Users/zacheryspector/studio-scratch`.
- Required reading, in order:
  1. This file.
  2. The Save45 production phase: `E/1361-F` (22 rulings, order of work), amended by `E/1361-F2` (probe rulings; ruling 3 corrects the G2-Retune path: P15A.1 takes its own later step) and `E/1361-F3` (slice 2a r2 fixes R1-R4); `E/1361-R` (the protocol); `E/1361-E`, `E/1361-X`, `E/1361-D` (slice 2a r1 handback, dry run, review).
  3. The Owner's three responses of 2026-10-02, verbatim in `E/1362-O` (1357-Q1 (a); numpy; items 5-9; late founding reachable) and summarized in `DECISIONS.md` "Owner rulings, 2026-10-02".
  4. `E/1363-A-rival-recovery-amendment-charter.md` with its adoption `E/1363-F` (12 amendments; review `E/1363-B`) and `E/1364-R-late-founding-reachability.md`.
  5. `docs/engineering/playability-launch-review/CONTINUATION-STATE.md`, top `## CURRENT` block (same as 06's).

## Active order
- Governing Owner order: the Opus take-over mandate under `docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`, with Owner rulings 1340-O, 1342-O and the 2026-10-02 responses in 1362-O. Do not stop after decision reports; do not reopen settled choices.
- In scope, in dependency order:
  1. **Save45** (1361-F): P15A.2 slice 2a, then P15A.1, then P15C, one writer, landing together behind one Save45 pin sweep; G2 gates P15A.1's (c); G-P gates P15C. No commit that changes `src/` lands before Save45.
  2. **After the Save45 landing:** the rival-recovery amendment (`1363-A`; Part A the binding-cash test, Part B scoped cost-cutting at Save46, P15B then Save47) and the late-founding correction (`1364-A`, authorized 2026-10-02: both invariant failures; a generated labelled import input; refuse clearly before mutation otherwise; no invented payments, no weakened validators, no late-start mode). The parent orders the two at that checkpoint.
  3. Also after Save45: the masked-downgrade-guard coverage repair (1344-X12 family); after the recovery amendment: replacement natural fixtures for the seven exceptions; G-L reruns on the recovery tree (1361-F2 ruling 5); P15B Wave 2 after the recovery amendment, with the Owner's P16 choices 5.1-5.9 binding its Wave 4 charter.
- Closed, do not reopen: P14 (1344-K, 1344-V); P15 Wave 1 (1346-K, 1352-K, 1353-K); relationship slices A (1348-L/M) and B (1358-L, 1358-M3); the P15 Wave 2 RED landing (1360-L); numpy (1362-V); the RED confirmations 1355-D4, 1356-D4, 1359-D4; the 1340-O and 1342-O rulings; U2 (1341-K).

## State
- Done this session (all pushed): slice B landed and closed (1358-L, 1358-M3); the P15 Wave 2 REDs landed with recorded mints and REDs equal to the 1360-X replay (1360-L); 1361-R/F (production plan); the writer's tree built (`S/1361-prod/tree`, tag `base` = archive of f3fe97d0, `src` equal to 1706d844's); slice 2a r1 measured (1361-X: `src` type-clean on root, UI and Bridge; 1356 RED 72/72; harness 81,692 ms of 300,000; generators clean) and reviewed (1361-D PROCEED; 1361-F3 adopts R1-R4 as r2); G-P r2 written and reviewed (1361-GP-D PROCEED; 1361-F2 rulings); the G2 probe written (`S/1361-g2/`); numpy installed and verified (1362-V); the Owner's three responses recorded (1362-O, DECISIONS.md); 1364-R; the 1363-A draft (fc233994).
- The writer's tree now (`main`, clean): `p15a2-r1` 1f2495a (kept); `p15a2-r2` 5eccada (R1-R4); `p15a1-a-r1` 39d0481, `p15a1-b-r1` 1074744, `p15a1-c-r1` c524911 (the frozen G2 candidate).
- **1361-X2** (15:06 CDT): the stack measured at (c), (b) and slice 2a r2: `src` type-clean everywhere; 1356 72/72; 1355 59/59 at (c) (K1/K2/M0A and capture leaves pass), 15 at (b), 9 at r2; harness 83,603 ms at (c); generators clean. `E/1361-E2` and the r2 delta in `E/1361-E` published.
- **G2 probe** reviewed (`E/1361-G2-D` HOLD) and fixed (`E/1361-G2-F`: Defect band, whole-run streaks, integer thresholds, RED_JSON tie, items 5-10); the parent checked the diff.
- **G2 read Retune** (`E/1361-G2-X`; rulings `E/1361-F5`): K1-K5 exact (K3 case (a) of `E/1361-F4` ruling 1, pre-registered at 5b911ed3); Retune rows p13a industry gross 0.875 at 520, seed-b stall (stopped rivals) and below-zero +325% at 520, seed-b root share 2.3-3.1% (storage fix). Save45 now lands slice 2a r2 + P15A.1 (a) and (b) r2 (+ P15C if G-P passes); (c) and (d) wait for a tuning amendment (record 1365, after the landing).
- **1361-D2** PROCEED (`E/1361-D2`, rulings `E/1361-F4`); **1363** adopted (`E/1363-F`); **G-P C0** passed (15:48; both exit 0, equal manifest, JSON equal apart from the allowed fields).
- In flight:
  - **`p15a1-b-r2` b0b6fb01** made by the writer (b-r1 + F3's guard, 7 lines in `tick.ts`; parent-verified; patch `E/1361-stage/prod/1361-p15a1-production-b-r2.patch`). The guard turns a 45th 1355 leaf red at (b) (`market-forecast-paths-unchanged`, T:247-261); `E/1361-F5` Amendment 1 declares it; (c)'s retune must remove the guard with (b)'s write.
  - **Lane job since 15:59 CDT:** `S/1361-prod/run-1361-X3-b-r2-then-gp.sh` (dry run of `p15a1-b-r2` into `S/1361-prod/x/r3b/`, tree back to branch `b-r2`, then G-P into `S/1361-gp-x/out/`); lane log `S/1361-prod/x3-gp.log` (+ `.meta`). About 20 min.
- Claims limits: P15A.1's r1 commits and slice 2a r2 are unmeasured; the harness time compares across Node versions and machine load (1361-F3 ruling 5); the 1363-A design rests on reading.

## Next step
Standing rules: one production writer; one heavy test process at a time (`bash S/heavy-queue/lane-run.sh 0 <log> <cmd>`); no commits or `git add` during a recorded run or its postflight; free disk ≥ 5 GiB before a recorded run; recorded runs on Node v20.20.2; stems match `^[0-9]{3,4}[a-z0-9-]*$`.

1. **When the lane job ends:** read `S/1361-prod/x/r3b/run.meta` (type gates `src` 0; 1356 72/72; 1355 14 passed and 45 failed: the 44 of `E/1361-stage/x-r2b/1355-leaves-red-at-b.tsv` plus `market-forecast-paths-unchanged`, messages as Amendment 1 expects; 1359 unchanged; generators exit 0); stage the x-r3b outputs and the 45-leaf list from x-r3b; record `E/1361-X3`. Then read G-P (`S/1361-gp-x/out/`: smoke-gp.err/json, gp.err/json, runs.meta) against `E/1361-F5` ruling 4's pre-registered expectations; record `E/1361-GP-X` with C0 (`S/1361-gp-c0/out/`).
2. **If G-P passes:** send `S/1361-prod/brief-p15c-production.md` to the writer with base `p15a1-b-r2` and without commit (d) (moot at (b); rides with (c)).
3. Then P15C's dry run, review 1361-D3, the sibling test's classification, the merged-tick harness run, the fallout (+ the d16 config at `base` and the landed tree), the `1361-N` sweep, the landing `1361-L` (four recorded runs; 1355's files fail exactly the 44), per 1361-F's order of work.
4. **When an agent slot frees and usage allows:** draft the late-founding charter `1364-A` (scope in 1362-O's third section).

## Open decisions for the Owner
- **1363-A O1, rival facility disposal** (asked 2026-10-02; `E/1363-A` §4.7, §10.2): may rivals close facilities; at what refund; may core filming plant go. v1 keeps facilities and does not wait. Parent recommends: no disposal in v1; revisit with 1363-V's numbers; if ever allowed, non-core plant only at the player's demolition refund, core plant never.
- **1363-F O6, post-loan restart** (needed before re-probe 2; blocks nothing now): may a rival that cut costs hire and film again after a P15B loan? Parent recommends yes: a loan principal ends cost-cutting and the ordinary staffing laws resume.
- O2-O5 of 1363-A are asked only with 1363-V's numbers. Everything else the Owner listed is answered (1362-O).

## Blockers and warnings
- **Node.** Recorded runs pin v20.20.2: put `/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin` first on PATH. The session's nvm default is v22.23.2.
- **Heavy lane.** `S/heavy-queue/lane-run.sh <pid|0> <log> <cmd…>` takes `S/HEAVY-LANE-LOCK`, waits out vitest or tsc (matched on the `node` command name), runs the job alone and releases the lock. Run it with `bash`; it is not executable. Passing a PID to wait for avoids its 2 h lock cap.
- **The recorder's guards** digest HEAD, the git index and stage entries: no `git add` (not only no commit) while a recorded run or its postflight runs. `git status` can rewrite the index too: during a run use plumbing only (`rev-parse`, `show`, `diff A B`) or `GIT_OPTIONAL_LOCKS=0`. Writing under `docs/` is safe; `src`, `bridge`, `tests`, `ui`, `generated`, `scripts` and the root configs are source paths.
- **Recorded-run scripts** check exactly the five output names (`<stem>.json`, `.txt`, `.patch`, `-preflight.json`, `-postflight.json`); `S/1358-land/recorded3.sh` is the model. A `<stem>-*` glob matched the producer's own files once (memory `recorder-output-exact-names`).
- **Scratch trees.** Never link `tests/fixtures` wholesale: make it a real directory of links and copy `bridge-contract-union-fixtures.ts` (memory `scratch-tree-fixture-links`; model `S/1358-sweep/run-1358-sweep-dry-v2.sh`). Patches that touch `docs/`: apply only `tests/*` in a scratch tree. Never write under a link.
- **Deleting scratch.** The harness blocks `rm` on variable paths; use literal absolute paths, links first, then `rm -rf` on the tree.
- **Agent auth.** If an agent returns `401 OAuth access token has been revoked`, the Owner runs `/login`.
- **The machine.** 4 CPUs, 8 GB RAM. Disk: 5.13 GiB free at 12:32 CDT (after gzipping closed outputs and removing the closed trees 1353-x4 and 1358-n). Swap shares the disk container (4 GB allocated after the core gate) and moves free space by about 1 GiB; a recorded preflight needs ≥ 5 GiB. Each X run adds a ~130 MB tree: delete it after reading its outputs. `S/1344-merge/x1-core.txt`, `x2-core.txt` and `x3-core.txt` are gzipped in place (gunzip restores the bytes that 1344-X8 and X9 cite). The P15 RED repos survive as mirrors (`S/1355-red/tree-mirror.git`, `S/1356-red/tree-mirror.git`, `S/1359-red/tree-mirror.git`). `S/1358-n/tree` and `S/1358-sweep/merge` hold the slice B reference trees that 1358-J3's scripts read; 1358-L is closed, so they may go once space is needed.
- **Stuck kernel processes.** The shell's `grep` wrapper (ugrep) and `pgrep -f`/`ps … command` can hang; some processes sit in state `U`/`UE` and survive `kill -9` (a `ReportCrash` for five days; a grep from 2026-10-02). Use `/usr/bin/grep`, `ps -Ao pid,etime,stat,comm`, and `perl -e 'alarm N; exec @ARGV'` for a hard timeout. A reboot clears them; not urgent.
- **Memory.** 8 GB with five agents, VS Code and Chrome left about 20 MB free and 1.8 GB swap in use at 13:58; keep heavy runs one at a time and avoid the full core fallout while many agents read.
- **The writing-context swallow** (`src/core/liveRetirementWriting.ts:21-26`, since 4dbca155) silently turns a refused live profession proof into `{ kind: 'rejected' }`; 1361-F3 ruling 3 sends it to a bounded review after Save45. R1 (slice 2a r2) closes the P15 cause at compile time.
- **Never scan `docs/` recursively.** `find docs -maxdepth 3` and `git grep … -- docs` hung for minutes at 13:45 CDT on 2026-10-02 and stalled other shells; name exact files, or grep `src`, `ui/src`, `bridge` and `tests`.
- **Hard limits.** Do not access Owner saves, scan fixture trees, force-push, or launch Codex.

## Auto snapshot
<!-- AUTO:BEGIN (handoff_guard.py rewrites this block) -->
- Stamped: 2026-10-02 15:50 CDT by **claude** on PreCompact (session 60db833c-4cf7-4685-b2ec-8aac42c6dac1)
- Branch: `wip/headless-program-20260916-ts` @ `5b911ed355b7314e7ddf0b7e78559cc9ce675c52`
- Upstream: `none`, unpushed commits: ?
- Uncommitted files: 0
- Last commits:
  - 5b911ed3 docs(p15): 1361-D2 review (PROCEED) and 1361-F4 rulings; K3 reading pre-registered before the G2 report
  - fc107749 docs(p15): 1363-B review and 1363-F adoption of the recovery charter (12 amendments, O6); G-P scripts ready, C0 queued
  - bd50b72c docs(handoff): P15A.1 stack measured (1361-X2); G2 running on p15a1-c-r1; reviews 1361-D2 and 1363-B running
  - ffe571c6 docs(p15): 1361-X2 dry run of the P15A.1 r1 stack on slice 2a r2: src type-clean at every tag; 1356 72/72; 1355 9 -> 15 -> 59 (all 59 at (c), K1/K2/M0A and both capture leaves included); harness 83.6 s at (c); generators clean. G2 running on p15a1-c-r1; review 1361-D2 running
  - c1580d39 docs(p15): 1361-G2-D review of the G2 probe (HOLD on four report/runner edits; probe sound) and 1361-G2-F parent response (all four plus items 5-10 adopted; candidate fixed at p15a1-c-r1 c524911)
<!-- AUTO:END -->
