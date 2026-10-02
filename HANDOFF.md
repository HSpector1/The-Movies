# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), 2026-10-02 12:34 CDT (the Mac runs on CDT; use `date`)

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ the commit after 6ac55a37 that carries this file (P15 Wave 2 RED landing: 1360-F steps 1-7 done; steps 8-10 next), pushed: yes.
- Resume this session: `cd ~/Downloads/project-studio-p13-owner-direction-inputs-01 && claude --resume 60db833c-4cf7-4685-b2ec-8aac42c6dac1` (the session started in that folder; it works in this repo). A fresh session: start `claude` in this repo root and say "resume from HANDOFF.md".
- Required reading, in order:
  1. This file.
  2. `E/1358-L-rel-sliceB-landing.md` (CLOSED, the full step table), `E/1358-M3-sliceb-recorded-broad-gates.md` and `E/1358-C9-sweep-landing-handback.md` (classification, dispositions, closure findings).
  3. P15 Wave 2 RED landing: `E/1360-F-parent-rulings-p15-wave2-red-landings.md` (rulings, the ten-step sequence), `E/1360-F2-parent-response-to-1360-D.md` (Save45 reserved; P15C's own fallback; what "matches 1360-X" means), `E/1360-X-p15-wave2-landing-replay.md` (the predicted results). Background: `E/1359-F6-parent-response-to-1359-D5.md` (ruling 5: the rebase onto Save44), `E/1355-F4-parent-response-to-1355-D.md` (landing order), then the handbacks `E/1355-C4-…`, `E/1356-C4-…` and `E/1359-C7-…`.
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
- **P15 Wave 2 REDs on Save44** (1355-X5, 1356-X4, 1359-X6; run 11:14-11:23 CDT): each RED alone on Save43 (65515b66) and Save44 (1706d844). All 247 classified leaves keep their expected status on both bases; the only message differences are computed text (K1/K2 digests the mint pins, `Save${STEP-1}` digits) and Vite's importing-file names. Root type gate at Save44: 1355 two and 1356 four TS2307 (their missing modules, as before), 1359 none. Both producers mint on Save44 with unchanged weeks (dry runs only). P15C RED **r8** recorded in 1359-X6 (`E/1359-stage/1359-p15c-wave2-red-r8.patch`).
- **P15 landing protocol and rulings:** `E/1360-R` (compiled from the records) and `E/1360-F` (twelve rulings). Ruling 1: P15A.2 slice 2a, P15A.1 and P15C share **one save step, Save45** (1355-F Amendment 4; one sweep, and the Save44 mints serve all three). Order 1356 → 1355 → 1359; 1356's recorded RED before the 1355 mint; the 1355 capture sha pinned in its fixture commit; vite-node; producers committed at the E root with their REDs; stems `1360-p15a2-red-recorded`, `1360-p15a1-mint`, `1360-p15a1-red-recorded`, `1360-p15c-mint`, `1360-p15c-red-recorded`.
- **1360-X** (the landing replayed in scratch, 11:50-11:54): every stage matches 1360-F (1356 70/2 before any mint; 1355 51/8 after its mint and pin, the four pin controls green; 1359 40/76 with C2-C4 at "the route L captures are Save44"; six missing-module type errors); bytes equal the Save44 dry runs. P15C **r8 classification** revises C2-C4 (`E/1359-stage/1359-p15c-wave2-red-r8-classification.json`).
- **Landing in progress (1360-F sequence; every step equals 1360-X under 1360-F2 ruling 4):**
  - step 1, 10b9be41: the 1356 RED; step 2, `1360-p15a2-red-recorded`: 70 failed / 2 passed;
  - step 3, e4be3e5c: the 1355 RED with merged `P15_ROOTS` and its producer at the E root;
  - step 4, `1360-p15a1-mint` at 601ea709 (source equals e4be3e5c's): exit 0; both MANIFESTs equal 1360-X's (13 and 146 fields);
  - step 5, 6ce916cb: the fixtures and `CAPTURE_MANIFEST_SHA256` = 410d48a8…; step 6, `1360-p15a1-red-recorded`: 51 failed / 8 passed;
  - step 7, 6ac55a37: the P15C RED r8 with four-key `P15_ROOTS` (blob 2f2acc5f) and producer r4 at the E root.
  - Every recorded run: fixedSource, allGuardsExact. Review 1360-D (PROCEED steps 4-7, HOLD step 8) and response 1360-F2 are committed.
- In flight: the 1360-D reviewer rechecks 1360-F2 and `S/1360-land/recorded-p15-v2.sh` (reply to `S/1360-land/review/1360-D2-recheck.md`). Step 8 waits for its PROCEED.
- Prepared for the P15 rebase, in `S/p15-save44/` (all run):
  - P15C RED **r8** `1359-p15c-wave2-red-r8.patch` (sha256 2a5df977…): `BASE_LIVE_SAVE_VERSION` 43 → 44 and three comment lines; nothing else changes. Its `legacy-root-fresh` leaf fails at RED on its first assertion, so the RED messages stand.
  - `run-p15-reds-save44.sh`: each P15 RED applied alone (all three create `tests/helpers/p15-roots.ts`) on OLD 65515b66 (Save43) and NEW HEAD (Save44), with JSON output and the root type gate; 1359 runs r7 on OLD and r8 on NEW. `check-p15-save44.py` compares OLD with NEW leaf by leaf, and each with its classification.
  - `run-p15-producers-save44.sh`: dry runs of 1359-P r4 over RED r8 and 1355-P r3 (mint mode) on the Save44 base.
- Claims limits:
  - 1353-T's market-pressure numbers are first order (open-loop factors from 1355-G1).
  - The retune rests on five rival careers on seed-b; p13a's rivals stop filming (1357-R).
  - The P15 REDs' Save44 behaviour rests on reading until the dry runs. The P15 reference patches (1356, 1355 r3 over it, 1359 r4) each mint Save44; on this base they need a Save45 retarget before any reference run.

## Next step
E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, S = `/Users/zacheryspector/studio-scratch`. Standing rules: one production writer; one heavy test process at a time; no commits (and no `git add`) during a recorded run or its postflight; free disk ≥ 5 GiB before a recorded run; recorded runs pin Node v20.20.2; recorded stems match `^[0-9]{3,4}[a-z0-9-]*$` (lowercase).

1. **After the recheck says PROCEED:** step 8 `nohup bash S/heavy-queue/lane-run.sh 0 S/1360-land/mint1359.log bash S/1360-land/recorded-p15-v2.sh mint1359 &` (once only; a failure is a finding: stop, no retry); compare its route L MANIFEST with `E/1360-stage/x/x-p15c2-route-l-captures-MANIFEST.json` by `python3 E/1360-stage/d/cmp-manifest.py <new> <x>`; step 9 commit `tests/fixtures/p15/p15c2-route-l-captures` and the mint's five outputs, push; step 10 `recorded-p15-v2.sh red1359` (expect 40/76), compare by `python3 S/1360-land/cmp-recorded.py E/1360-p15c-red-recorded.txt E/1360-stage/x/s10-1359.json`. No commit during a run. Then record 1360-L (stage the scripts into `E/1360-stage/land/`), the CURRENT blocks and this file.
3. **The Save45 productions** (1360-F ruling 1): the single writer authors P15A.2 slice 2a, then P15A.1, then P15C on the Save44 base; they land together behind one Save45 sweep. P15B joins only if 1357-Q1 resolves in time.

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
