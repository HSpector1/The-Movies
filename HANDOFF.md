# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), 2026-10-02 14:40 CDT (the Mac runs on CDT; use `date`). Claude's weekly usage stood at 89% at 14:39 CDT (Owner): if Claude stops, Codex resumes from this file.

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ the commit after 50181e76 that carries this file, pushed: yes. Protected main is never touched.
- Resume this session: `cd ~/Downloads/project-studio-p13-owner-direction-inputs-01 && claude --resume 60db833c-4cf7-4685-b2ec-8aac42c6dac1`. A fresh session: start in this repo root and say "resume from HANDOFF.md".
- E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, S = `/Users/zacheryspector/studio-scratch`.
- Required reading, in order:
  1. This file.
  2. The Save45 production phase: `E/1361-F` (22 rulings, order of work), amended by `E/1361-F2` (probe rulings; ruling 3 corrects the G2-Retune path: P15A.1 takes its own later step) and `E/1361-F3` (slice 2a r2 fixes R1-R4); `E/1361-R` (the protocol); `E/1361-E`, `E/1361-X`, `E/1361-D` (slice 2a r1 handback, dry run, review).
  3. The Owner's three responses of 2026-10-02, verbatim in `E/1362-O` (1357-Q1 (a); numpy; items 5-9; late founding reachable) and summarized in `DECISIONS.md` "Owner rulings, 2026-10-02".
  4. `E/1363-A-rival-recovery-amendment-charter.md` (draft, under review 1363-B) and `E/1364-R-late-founding-reachability.md`.
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
- The writer's tree now: `p15a2-r1` 1f2495a; P15A.1 `p15a1-a-r1` 9f4ecd5, `p15a1-b-r1` 049f47c, `p15a1-c-r1` 2dd41a1 (to be rebased onto `p15a2-r2`).
- In flight (agents; none runs node, vitest or tsc):
  - the **writer**: folding R1-R4 into slice 2a as `p15a2-r2` (keeping the `p15a2-r1` tag on 1f2495a), rebasing P15A.1 onto it with the `p15a1-{a,b,c}-r1` tags moved, staging `S/1361-prod/1361-p15a2-production-r2.patch`, the three P15A.1 patches and the handback `S/1361-prod/1361-E2-p15a1-production-handback.md`, tree left at `p15a1-c-r1`;
  - the **G2 probe review** -> `S/1361-g2/review/1361-G2-D-review.md` (it checks against 1361-F2 ruling 4);
  - the **1363-A charter review** -> `S/1363-recovery/review/1363-B-charter-review.md`.
- Claims limits: P15A.1's r1 commits and slice 2a r2 are unmeasured; the harness time compares across Node versions and machine load (1361-F3 ruling 5); the 1363-A design rests on reading.

## Next step
Standing rules: one production writer; one heavy test process at a time (`bash S/heavy-queue/lane-run.sh 0 <log> <cmd>`); no commits or `git add` during a recorded run or its postflight; free disk ≥ 5 GiB before a recorded run; recorded runs on Node v20.20.2; stems match `^[0-9]{3,4}[a-z0-9-]*$`.

1. **When the writer returns:** check the tree is clean at `p15a1-c-r1`; dry-run the stack: `bash S/heavy-queue/lane-run.sh 0 S/1361-prod/x-r2c.log bash S/1361-prod/run-1361-X.sh p15a1-c-r1 r2c` (labels must be new; the script refuses an existing output dir and a tree not at the tag). For the (a)+(b) state, check out `p15a1-b-r1` in the tree, run with label `r2b`, then check out `p15a1-c-r1` again. Expect: `src` type-clean; 1356 72/72; 1355 59/59 at (c) (all leaves; K1/K2/M0A pins hold); 1359 still 40/76. Publish `E/1361-E2` (+ the r2 delta in `E/1361-E`), `E/1361-X2`; independent review `1361-D2`; rule `1361-F4`.
2. **When the G2 review returns:** rule; then run G2 from `S/1361-g2/` (`1361-G2-trees.sh` builds control = archive of e4be3e5c, candidate = `p15a1-c-r1`, K4; `1361-G2-run.sh <stage>` per heavy-lane call: smoke, control, candidate-1, candidate-2, k4, era-guard, report). Verdicts per 1361-F2 ruling 4 (a K failure is a Defect). On Retune: 1361-F2 ruling 3.
3. **G-P:** run `E/1361-stage/gp/1361-GP-probe-r2.ts` on the candidate after P15A.1 (with (c) only if G2 passed) plus the v2 edits (`E/1353-stage/x4/1353-X4-tree-edits.patch`), per 1361-F2 ruling 1 (logs outside the output dirs; C0 through the lane; smoke must name all three roots).
4. **When 1363-B returns:** adopt 1363-A as `E/1363-F` with rulings on P1-P10; O1 stays with the Owner.
5. **When an agent slot frees:** draft the late-founding charter `1364-A` (scope in 1362-O's third section).
6. Then P15C's production (writer), the sibling test's classification, the merged-tick harness run, the fallout and the `1361-N` sweep, and the landing (`1361-L`), per 1361-F's order of work.

## Open decisions for the Owner
- **1363-A O1, rival facility disposal** (asked 2026-10-02; `E/1363-A` §4.7, §10.2): may rivals close facilities; at what refund; may core filming plant go. v1 keeps facilities and does not wait. Parent recommends: no disposal in v1; revisit with 1363-V's numbers; if ever allowed, non-core plant only at the player's demolition refund, core plant never.
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
- Stamped: 2026-10-02 14:36 CDT by **claude** on PreCompact (session 60db833c-4cf7-4685-b2ec-8aac42c6dac1)
- Branch: `wip/headless-program-20260916-ts` @ `7d5823186308752ff268ec3f9bdd41f61c7f670e`
- Upstream: `none`, unpushed commits: ?
- Uncommitted files: 1
  - `M HANDOFF.md`
- Last commits:
  - 7d582318 docs(p15): 1361-GP-D review of the G-P sibling-roots branch r2 (PROCEED) and 1361-F2 parent rulings: run hygiene and a tree guard for G-P; the G2 probe's four choices (a K failure is a Defect); the G2-Retune path corrected (P15A.1 takes its later step, since (a)+(b) fail the chartered film bijection without (c)); G-L reruns after the recovery amendment
  - 95a4cf06 docs(handoff): slice 2a r1 measured clean (1361-X); P15A.1 writing; reviews of slice 2a and G-P r2 running; late-founding classification; machine warnings
  - 2b1ffd6e docs(p15): 1361-E slice 2a production handback r1 and 1361-X its dry run (src type-clean on root, UI and Bridge; 1356 RED 72/72 with the harness at 81.7 s of 300 s; generator checks clean; 1355 and 1359 move only as predicted); 1364-R late-founding reachability (not exposed by any supported writer or action; one input-dependent import exposure of failure 2; not fixed)
  - ec5ca7af docs(handoff): in-flight agents after the Owner's items 5-9 response; warning against recursive scans of docs/
  - c6ad14f1 docs(owner): record the Owner's second response of 2026-10-02 (items 5-9) verbatim in 1362-O: P16's qualified choices 5.1-5.9; replacement natural fixtures for the seven exceptions after the recovery amendment; the §7 routing with p15a1-w2-market-01 and the 154 promise movements in the recovery measurement; the late-founding reachability check first; the masked-guard coverage repair after Save45
<!-- AUTO:END -->
