# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), 2026-10-02 13:25 CDT (the Mac runs on CDT; use `date`)

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
- In flight (three agents, none runs anything):
  - the **slice 2a production writer** in `S/1361-prod/tree`: commits tagged `p15a2-r1`, patch `S/1361-prod/1361-p15a2-production-r1.patch`, handback `S/1361-prod/1361-E-p15a2-production-handback.md`;
  - the **G2 probe** author in `S/1361-g2/` (probe, `1361-G2-notes.md`, review checklist);
  - the **G-P sibling branch** author in `S/1361-gp/` (`1361-GP-probe-r2.ts`, notes, review checklist).
- Claims limits:
  - 1353-T's market-pressure numbers are first order (open-loop factors from 1355-G1).
  - The retune rests on five rival careers on seed-b; p13a's rivals stop filming (1357-R).
  - The P15 reference patches (1356, 1355 r3 over it, 1359 r4 plus the sibling patch) each target the step above Save43; on this base they need a Save45 retarget before any reference run. Unmeasured on Save44.

## Next step
E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, S = `/Users/zacheryspector/studio-scratch`. Standing rules: one production writer; one heavy test process at a time; no commits (and no `git add`) during a recorded run or its postflight; free disk ≥ 5 GiB before a recorded run; recorded runs pin Node v20.20.2; recorded stems match `^[0-9]{3,4}[a-z0-9-]*$` (lowercase).

1. **When the slice 2a writer returns:** publish its handback as `E/1361-E-…`; run the dry run `1361-X` in `S/1361-prod/tree` at tag `p15a2-r1` under the heavy lane (root tsc: zero errors in `src/` files; the 1356 archive and isolation files; the 1356 harness alone; the 1355 and 1359 RED files for observation); compare with the handback's row map; then an independent implementation review `1361-D`; rule (`1361-F2`) and send the writer a revision brief if needed (SendMessage to the writer agent keeps its context).
2. **When the probe authors return:** an independent read-only review of each (`1361-G2-D`, `1361-GP-D`) before any run.
3. **Then** P15A.1 (a), (b), (c) on slice 2a's candidate, G2, G-P, P15C, the sweep and the landing, by 1361-F's order of work. The bound is the first gate failure (1361-F ruling 13). No commit that changes `src/` lands before Save45.

Agents: the user allows as many subagents as help (2026-10-01). Agents author and review; only the parent runs broad or heavy tests.

## Open decisions for the Owner
Answered 2026-10-02 (`E/1362-O`): 1357-Q1 = (a); numpy approved (`.venv` only, between recorded runs); P15C tuning kept for the planned playtest; slice B's relationship wording stays candidate pending copy review. The seven declared exceptions are NOT approved by being listed or by the bounded searches; keep their exact coverage limits (1362-O routing item 5).

Still open, sent to the Owner as one compact decision message on 2026-10-02 (no new research for them):
- **P16's nine questions** (`E/1354-Q-proposed-owner-rulings-p16.txt`). Items 1 and 2 block the P15B Wave 4 charter (1354-P:30); the P16A charter can start once 1354-Q is answered (1354-P:53). Nothing in Save45 or the recovery amendment waits on them.
- **The seven declared exceptions** (1344-F6): three row-6 leaves in `tests/p14b5-relationships.test.ts` and four promise-148 leaves (`p14c2c-rival-promises` R1-R3, `p14c3-admission-boundaries` N10). Not approved. Repair options (1344-F6 §4): a new natural fixture whose chain holds each premise under the shelving law, or retiring the leaves; each needs its own charter. They block nothing; they stay failing, attributed identities in every broad gate.
- **The §7 flags** (1344-V §9 items 1-6): measured behaviour with no threshold. Flags 1, 2 and 4 (retries, growing shelved lists, the cash-blocked stall) fall inside the recovery amendment; flag 3 (rival cash below zero) is P15B scope; flag 5 asks whether seed `p15a1-w2-market-01` is in scope; flag 6 is the 154 promise movements with no named path. They block nothing.
- **1356-X F-2** (as 1356-F5 restates it): a public founding after week 0 reaches no valid save once the player signs the roster, or ticks with the draft open after rivals lock methods. Recommend checking whether the shipped bridge offers a late public founding first, then one charter for both rules if it does. It blocks nothing on the current path.
- **X12's V39-masking family** (1344-X12): five downgrade leaves pass without reaching the guard their titles name, because the V39 guard fires first. Recommend a small RED giving each leaf an input whose first refusal is its own guard. It blocks nothing.

## Blockers and warnings
- **Node.** Recorded runs pin v20.20.2: put `/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin` first on PATH. The session's nvm default is v22.23.2.
- **Heavy lane.** `S/heavy-queue/lane-run.sh <pid|0> <log> <cmd…>` takes `S/HEAVY-LANE-LOCK`, waits out vitest or tsc (matched on the `node` command name), runs the job alone and releases the lock. Run it with `bash`; it is not executable. Passing a PID to wait for avoids its 2 h lock cap.
- **The recorder's guards** digest HEAD, the git index and stage entries: no `git add` (not only no commit) while a recorded run or its postflight runs. `git status` can rewrite the index too: during a run use plumbing only (`rev-parse`, `show`, `diff A B`) or `GIT_OPTIONAL_LOCKS=0`. Writing under `docs/` is safe; `src`, `bridge`, `tests`, `ui`, `generated`, `scripts` and the root configs are source paths.
- **Recorded-run scripts** check exactly the five output names (`<stem>.json`, `.txt`, `.patch`, `-preflight.json`, `-postflight.json`); `S/1358-land/recorded3.sh` is the model. A `<stem>-*` glob matched the producer's own files once (memory `recorder-output-exact-names`).
- **Scratch trees.** Never link `tests/fixtures` wholesale: make it a real directory of links and copy `bridge-contract-union-fixtures.ts` (memory `scratch-tree-fixture-links`; model `S/1358-sweep/run-1358-sweep-dry-v2.sh`). Patches that touch `docs/`: apply only `tests/*` in a scratch tree. Never write under a link.
- **Deleting scratch.** The harness blocks `rm` on variable paths; use literal absolute paths, links first, then `rm -rf` on the tree.
- **Agent auth.** If an agent returns `401 OAuth access token has been revoked`, the Owner runs `/login`.
- **The machine.** 4 CPUs, 8 GB RAM. Disk: 5.13 GiB free at 12:32 CDT (after gzipping closed outputs and removing the closed trees 1353-x4 and 1358-n). Swap shares the disk container (4 GB allocated after the core gate) and moves free space by about 1 GiB; a recorded preflight needs ≥ 5 GiB. Each X run adds a ~130 MB tree: delete it after reading its outputs. `S/1344-merge/x1-core.txt`, `x2-core.txt` and `x3-core.txt` are gzipped in place (gunzip restores the bytes that 1344-X8 and X9 cite). The P15 RED repos survive as mirrors (`S/1355-red/tree-mirror.git`, `S/1356-red/tree-mirror.git`, `S/1359-red/tree-mirror.git`). `S/1358-n/tree` and `S/1358-sweep/merge` hold the slice B reference trees that 1358-J3's scripts read; 1358-L is closed, so they may go once space is needed.
- **Hard limits.** Do not access Owner saves, scan fixture trees, force-push, or launch Codex.

## Auto snapshot
<!-- AUTO:BEGIN (handoff_guard.py rewrites this block) -->
- Stamped: 2026-10-02 11:47 CDT by **claude** on PreCompact (session 60db833c-4cf7-4685-b2ec-8aac42c6dac1)
- Branch: `wip/headless-program-20260916-ts` @ `cb49fd0282ea1edec166a899b4d6852dba138032`
- Upstream: `none`, unpushed commits: ?
- Uncommitted files: 0
- Last commits:
  - cb49fd02 docs(p15): the three P15 Wave 2 REDs on the Save44 base (1355-X5, 1356-X4, 1359-X6): every classified leaf keeps its expected status on Save43 and Save44; P15C RED r8 moves BASE_LIVE_SAVE_VERSION to 44; both producers mint on Save44 (dry runs)
  - 1706d844 docs(p14b): relationship slice B CLOSED (1358-L): 1358-M3 recorded broad gates reproduce 1348-M (core SAME 84 + C20 CHANGED by the version digit; UI the numpy rows); type gates and generators pass at the landed HEAD; 1358-C9 landing handback; 1358-J3 landing review
  - c5c0a0a6 docs(p14b): recorded core gate 1358-sliceb-broad-core at b60db650: 85 failed / 4,992 passed (5,091), 440 files; against 1348-I SAME 84, CHANGED 1 (C20, live version 44 in its primary), NEW 0, GONE 0; fixedSource, allGuardsExact
  - b60db650 docs(p14b): recorded run 1358-sliceb-green-recorded at 5ac4b738: slice B GREEN, 3 failed / 145 passed (148), fixedSource, allGuardsExact
  - 5ac4b738 test(p14b): F10/F11 take the recorded projection-57 producer values (1358-p57-declaration; 1358-F9 P4)
<!-- AUTO:END -->
