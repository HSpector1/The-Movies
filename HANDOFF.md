# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), 2026-10-02 14:09 CDT (the Mac runs on CDT; use `date`)

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ the commit after f3fe97d0 that carries this file (P15 Wave 2 REDs landed, 1360-L; the Save45 production phase started under 1361-F), pushed: yes.
- Resume this session: `cd ~/Downloads/project-studio-p13-owner-direction-inputs-01 && claude --resume 60db833c-4cf7-4685-b2ec-8aac42c6dac1` (the session started in that folder; it works in this repo). A fresh session: start `claude` in this repo root and say "resume from HANDOFF.md".
- Required reading, in order:
  1. This file.
  2. `E/1361-F-parent-rulings-p15-save45-productions.md` (22 rulings and the order of work for the three Save45 productions) and `E/1361-R-p15-save45-production-protocol.md` (the protocol it rules on: per production, the references against HEAD, the sweep scope, 16 questions). Then `E/1360-L-p15-wave2-red-landing.md` (CLOSED: the step table, the mints, the recorded REDs, what the next broad gates inherit, open items), with its rulings `E/1360-F`, `E/1360-F2`, `E/1360-F3` (Save45 reserved for the three P15 productions; P15C's own fallback; a production commit is one that changes `src/`).
  3. The P15 Wave 2 charters and RED handbacks for the productions: `E/1356-A`, `E/1355-A`, `E/1359-A`; `E/1355-F4` (production order), `E/1355-F5`, `E/1353-F7` (P15C's G-P); handbacks `E/1355-C4-…`, `E/1356-C4-…`, `E/1359-C7-…`. Slice B for the sweep method: `E/1358-L`, `E/1358-N`, `E/1358-C9`.
  4. `E/1357-R-rival-stall-diagnosis.md` and `E/1357-F3-parent-note-on-1357-R.md`: Owner question 1357-Q1.
  5. `docs/engineering/playability-launch-review/CONTINUATION-STATE.md`, top `## CURRENT` block (same as 06's).

## Active order
- Governing Owner order: the Opus take-over mandate (recover, finish P14, then P15 → P16 → P17 → a specified P18) under `docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`, with Owner rulings 1340-O, D-1339-1 and 1342-O. The Owner response of 2026-10-02 (`E/1362-O-owner-response-20261002.md`, verbatim; `DECISIONS.md` "Owner rulings, 2026-10-02") answers 1357-Q1 with (a) and approves numpy; it says to keep the Save45 sequence, not to stop after the decision report, and not to reopen settled choices.
- In scope: the three P15 Wave 2 productions at the shared Save45 step (P15A.2 slice 2a, then P15A.1, then P15C), their gates (P15A.1 G2, P15C G-P) and one Save45 pin sweep; the **rival-recovery amendment** `1363-A` (1357-Q1 (a): the `cashBlocked` fix, then scoped rival cost-cutting, then a measurement), charter now, production after the Save45 landing and before P15B's live closure; numpy in `.venv` (`1362-V`); P15B Wave 2 after the recovery amendment, at the next free step after Save45.
- Closed, do not reopen:
  - P14 shelving, Save43 and the sweep (1344-K); §7 (1344-V);
  - P15 Wave 1 (1346-K, 1352-K, 1353-K);
  - relationship slice A (1348-L, 1348-M) and slice B (1358-L, 1358-M3);
  - the P15 Wave 2 RED landing (1360-L): the REDs, the Save44 captures and pins, and `CAPTURE_MANIFEST_SHA256`;
  - the RED confirmations 1355-D4, 1356-D4 and 1359-D4 (P15C's C11 reopens only for 1353-F6 ruling 3);
  - the 1340-O and 1342-O rulings; U2 (1341-K).

## State
- Done earlier (pushed): 1344-V, 1344-K (P14 closed); Wave 1 closures 1346-K, 1352-K, 1353-K; slice A (1348-L, 1348-M); the P15C retune (1353-T, F6, U, F7) and P15C RED r7 with reference r4 (1359-C7, 1359-X5: RED 40 failed / 76 passed); 1357-X/F2 and 1357-R/F3 (Owner question 1357-Q1).
- Done this session (pushed):
  - **Relationship slice B landed and CLOSED** (`E/1358-L`). Production r2 as four commits 9eb1e66e, 8df1858e, 615adeb2, 83d1030d (blob-equal to the reviewed step 4). Pin sweep r4 at f458680b: 154 test files (1358-N; units H, G1-G6, F1, F2; rulings 1358-F9 to F12; dry runs X6, X7t, X8, X9t; reviews 1358-D9 REFINE, 1358-D9b CONFIRMED). Source manifest eb1c2512; recorded producer `1358-p57-declaration` (282ad680; F10 = F11 = 1dadf88f…); F10/F11 pins 5ac4b738; recorded GREEN b60db650: 3 failed / 145 passed, the row 6 exceptions.
  - **1358-M3** (recorded broad gates, Node v20.20.2, fixedSource and allGuardsExact): core at b60db650 85 failed / 4,992 passed (440 files), against 1348-I SAME 84 + C20 CHANGED by the version digit, NEW 0, GONE 0; UI at c5c0a0a6 3 failed (the numpy rows), CHANGED 3 by the temporary directory only. Type gates and both generator checks pass at the landed HEAD (`E/1358-L-type-gates.txt`).
  - **1358-C9** (landing handback: 762 classification rows, 29 census dispositions, eight closure findings) and **1358-J3** (independent landing review: REFINE on records, applied).
- **P15 Wave 2 REDs on Save44** (1355-X5, 1356-X4, 1359-X6; run 11:14-11:23 CDT): each RED alone on Save43 (65515b66) and Save44 (1706d844). All 247 classified leaves keep their expected status on both bases; the only message differences are computed text (K1/K2 digests the mint pins, `Save${STEP-1}` digits) and Vite's importing-file names. Root type gate at Save44: 1355 two and 1356 four TS2307 (their missing modules, as before), 1359 none. Both producers mint on Save44 with unchanged weeks (dry runs only). P15C RED **r8** recorded in 1359-X6 (`E/1359-stage/1359-p15c-wave2-red-r8.patch`).
- **P15 landing protocol and rulings:** `E/1360-R` (compiled from the records) and `E/1360-F` (twelve rulings). Ruling 1: P15A.2 slice 2a, P15A.1 and P15C share **one save step, Save45** (1355-F Amendment 4; one sweep, and the Save44 mints serve all three). Order 1356 → 1355 → 1359; 1356's recorded RED before the 1355 mint; the 1355 capture sha pinned in its fixture commit; vite-node; producers committed at the E root with their REDs; stems `1360-p15a2-red-recorded`, `1360-p15a1-mint`, `1360-p15a1-red-recorded`, `1360-p15c-mint`, `1360-p15c-red-recorded`.
- **1360-X** (the landing replayed in scratch, 11:50-11:54): every stage matches 1360-F (1356 70/2 before any mint; 1355 51/8 after its mint and pin, the four pin controls green; 1359 40/76 with C2-C4 at "the route L captures are Save44"; six missing-module type errors); bytes equal the Save44 dry runs. P15C **r8 classification** revises C2-C4 (`E/1359-stage/1359-p15c-wave2-red-r8-classification.json`).
- **The P15 Wave 2 RED landing is CLOSED** (`E/1360-L`, 12:44 CDT). Commits 10b9be41 (1356 RED), e4be3e5c (1355 RED + producer), 6ce916cb (1355 fixtures + sha pin 410d48a8…), 6ac55a37 (1359 RED r8 + producer), 840cf1c7 (route L captures). Recorded runs, each equal to 1360-X leaf for leaf and with fixedSource and allGuardsExact: `1360-p15a2-red-recorded` 70/2, `1360-p15a1-mint` (13 and 146 MANIFEST fields equal), `1360-p15a1-red-recorded` 51/8, `1360-p15c-mint` (17 fields equal), `1360-p15c-red-recorded` 40/76. Type gates at e16b782e: root the six declared TS2307, UI, Bridge and both generator checks clean (`E/1360-L-type-gates.txt`). Reviews 1360-D, 1360-D2; responses 1360-F2, 1360-F3.
- **1361-R and 1361-F** (committed f3fe97d0): the production protocol and the parent's rulings. The writer's tree is built at `S/1361-prod/tree` (git; tag `base` 1045432 = archive of f3fe97d0, `src` equal to 1706d844's; fixtures and E as real directories of links; script `S/1361-prod/build-tree.sh`).
- **Slice 2a r1** (writer commit 1f2495a, tag `p15a2-r1`; `E/1361-E`): parent dry run `E/1361-X` at 13:56-14:02 CDT: `src` type-clean on root, UI and Bridge (test-side errors 33/4/9 are Save45 sweep S4/S5 material); 1356 RED 72/72 with the harness at 81,692 ms of 300,000; generator checks clean; 1355 50/9 (`market-validator-reconciles` passes via the shared allocator; five leaves now stop at the missing `sharedMarket` root); 1359 40/76 (C2-C4 now stop at the missing `campaignLegacy` root).
- **Late founding (Owner item 8):** `E/1364-R`: not exposed by any supported writer or action; one input-dependent import exposure of failure 2; not fixed. One question for the Owner: does the import exposure count as reachable?
- In flight (agents; none runs node, vitest or tsc):
  - the **writer**, now on **P15A.1** commits (a), (b), (c) on top of `p15a2-r1` (tags `p15a1-{a,b,c}-r1`; patches `S/1361-prod/1361-p15a1-production-{a,b,c}-r1.patch`; handback `S/1361-prod/1361-E2-p15a1-production-handback.md`);
  - the **slice 2a r1 implementation review** -> `S/1361-prod/review/1361-D-p15a2-r1-review.md` (a REVISE becomes `p15a2-r2` with P15A.1 rebased);
  - the **G2 probe** author in `S/1361-g2/`;
  - the **G-P r2 review** -> `S/1361-gp/review/1361-GP-D-review.md`;
  - the **recovery amendment charter** `S/1363-recovery/1363-A-…`.

- Claims limits:
  - 1353-T's market-pressure numbers are first order (open-loop factors from 1355-G1).
  - The retune rests on five rival careers on seed-b; p13a's rivals stop filming (1357-R).
  - The P15 reference patches (1356, 1355 r3 over it, 1359 r4 plus the sibling patch) each target the step above Save43; on this base they need a Save45 retarget before any reference run. Unmeasured on Save44.

## Next step
E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, S = `/Users/zacheryspector/studio-scratch`. Standing rules: one production writer; one heavy test process at a time; no commits (and no `git add`) during a recorded run or its postflight; free disk ≥ 5 GiB before a recorded run; recorded runs pin Node v20.20.2; recorded stems match `^[0-9]{3,4}[a-z0-9-]*$` (lowercase).

1. **When the slice 2a review returns:** rule (`1361-F2`); on REVISE send the writer the items (r2 commit, then rebase P15A.1). **When P15A.1 returns:** dry run `run-1361-X.sh p15a1-c-r1 r1-p15a1` (and `p15a1-b-r1` for the (a)+(b) state), publish `1361-E2`/`1361-X2`, review `1361-D2`. Then G2 (control: archive of e4be3e5c; candidate: `p15a1-c-r1`), after its probe review.
2. **When the probe authors return:** an independent read-only review of each (`1361-G2-D`, `1361-GP-D`) before any run.
3. **Then** P15A.1 (a), (b), (c) on slice 2a's candidate, G2, G-P, P15C, the sweep and the landing, by 1361-F's order of work. The bound is the first gate failure (1361-F ruling 13). No commit that changes `src/` lands before Save45.

Agents: the user allows as many subagents as help (2026-10-01). Agents author and review; only the parent runs broad or heavy tests.

## Open decisions for the Owner
None open. The Owner answered every listed item on 2026-10-02 (`E/1362-O`, both sections; `DECISIONS.md` "Owner rulings, 2026-10-02"). Apply each at its next safe checkpoint; Save45 continues unchanged:
- **1357-Q1 (a):** the rival-recovery amendment `1363-A` (charter drafting in `S/1363-recovery/`; production after the Save45 landing, before P15B's live closure). It also carries item 7: seed `p15a1-w2-market-01` in the recovery measurement, the 154 promise movements re-measured with their changed paths attributed, and findings stay findings.
- **numpy:** done (`E/1362-V`).
- **P15C playtest tuning** unchanged; **slice B's relationship wording** stays candidate pending copy review.
- **Item 5 (P16):** the qualified choices 5.1-5.9 bind the P15B Wave 4 and P16 charters when they are written (they are not 1354-Q verbatim; 5.3 replaces 1354-Q item 3).
- **Item 6 (seven exceptions):** bounded replacement natural fixtures after the recovery amendment lands; keep the historical fixtures and failed evidence; no retirement or waiver by default. Until then they stay failing, attributed identities.
- **Item 8 (late founding, 1356-X F-2):** a bounded read-only check of the actually supported entry paths, bridge included, first; reachable → one bounded charter for both failures; not exposed → record the precise reachability limit, never "fixed".
- **Item 9 (masked downgrade guards, 1344-X12):** targeted coverage repair (valid baseline, isolate the named guard, keep historical inputs and validator behaviour), authored and landed after the Save45 landing because the Save45 sweep's S9 class touches the same pins.
Open for the Owner (asked 2026-10-02):
- **1363-A O1, rival facility disposal** (`E/1363-A` §4.7, §10.2): may rivals close facilities; at what refund (the player's demolition refund of half the capex, a new rival inflow, or nothing); may core filming plant go (a rival that can never film again). v1 keeps facilities and does not wait. Parent recommends: no disposal in v1; revisit with 1363-V's numbers; if ever allowed, non-core plant only at the player's demolition refund, core filming plant never.
- **1364-R's import exposure:** does an imported save that already holds an open founding draft past week 0 (exposing failure 2 only) count as "reachable", which calls for the bounded charter, or does it stay a recorded limit?
O2-O5 of 1363-A are asked only with 1363-V's numbers.

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
