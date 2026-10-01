# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), 2026-10-01 18:33 CDT (the Mac now runs on CDT; use `date`)

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ da6e73f6 plus the commit that updates this file, pushed: yes (remote verified by `git ls-remote`). The working tree is clean.
- Resume this session: `cd ~/Downloads/project-studio-p13-owner-direction-inputs-01 && claude --resume 60db833c-4cf7-4685-b2ec-8aac42c6dac1` (the session started in that folder; it works in this repo). A fresh session: start `claude` in this repo root and say "resume from HANDOFF.md".
- Required reading, in order:
  1. This file.
  2. `docs/engineering/playability-launch-review/CONTINUATION-STATE.md`: the top `## CURRENT` block.
  3. `/Users/zacheryspector/studio-scratch/1344-merge/x2.meta` (dry-run progress), then `/Users/zacheryspector/studio-scratch/1344-sweep/g6/handback.md` and `/Users/zacheryspector/studio-scratch/1344-sweep/s10/declarations.md`.
  4. `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-N-save43-pin-sweep-plan.md` (classes S1-S10, process, success criteria).

## Active order
- Governing Owner order: the Opus take-over mandate (recover, finish P14, then P15 → P16 → P17 → a specified P18) under `docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`, with Owner rulings 1340-O, D-1339-1 and 1342-O.
- In scope: the Save43 pin sweep (1344-C5) and P14 closure 1344-K; relationship slices A and B; the P15 Wave 2 REDs (P15C Wave 2 is unblocked).
- Closed, do not reopen: the 1340-O and 1342-O rulings; U2 (1341-K); P15B Wave 1 (1352-L); P15A.1 and P15A.2 Wave 1; the P15C Wave 1 landing (1353-L; broad gates still pending with the sweep).

## State
- Done this session (all pushed):
  - P15C Wave 1 landed (1353-L): RED r4 c7f3cb76; recorded RED 72 failed / 6 passed of 78; production 321a4378; recorded GREEN 78/78 (d7c417a5). Both fixedSource, every guard exact. Type gates 19/2/2, identical to 1352-L.
  - Save43 sweep authored in full: helpers and g1-g6 DONE (g6 finished by a continuation agent; audit of its first 6 files clean). Handbacks: `/Users/zacheryspector/studio-scratch/1344-sweep/<group>/handback.md`.
  - Sweep merged in `/Users/zacheryspector/studio-scratch/1344-merge/tree` (its own git repo; base 3a606df4): commits helpers 048f62c, g1 eb8d902, g2 558cd49, g3 9310d5a, g4 3c0a5c5, g5 0b738b3, parent f8c48ec (24 `saveApi('validateSaveV42')` callers in 4 files follow the helper's renamed live key, S1), parent becafce (UI section of 1344-M2: 8 live-writer literals in 5 files, S2), g6 a318722. All seven patches disjoint and clean. The four helpers no group owned need no edit (they call swept helpers). Type gates at becafce (before g6): root, UI and Bridge exit 0.
  - Disk 4.5 → about 6.2 GB free (merged or expendable scratch deleted by literal path).
- In flight (as of 2026-10-01 17:21 CDT):
  - **x3**, the dry run of merge HEAD 6935ea5 (r1 plus r2a 5c7f499, r2b 1c2f9e8, r2c 6935ea5), detached, PID in `/Users/zacheryspector/studio-scratch/1344-merge/x3.pid`, started 17:19 CDT: type gates, core (433 files), UI. Outputs `x3-*.txt`, progress `x3.meta`. Never edit `/Users/zacheryspector/studio-scratch/1344-merge/tree` until `x3.meta` shows "ui exit". Then attribute it as 1344-X9 (commands as in Step 1, with x3 file names).
  - **1359-D2**: confirmation review of the P15C RED r2 (`/Users/zacheryspector/studio-scratch/1359-red/`). The only agent running.
  - **Heavy queue** (`/Users/zacheryspector/studio-scratch/heavy-queue/run-queue.sh`, log `run-queue.log`), started by a waiter that runs it as soon as x3 ends, one process at a time:
    1. the row 6 re-witness probe (out `/Users/zacheryspector/studio-scratch/1344-r3/row6/out/`; expected NONE, so 1344-F5 A3 applies);
    2. the promise-row probe r3 (`promises-r3.sh`, extracted verbatim from E/1344-stage/s10/promises-r2d/RUNBOOK-r3.md; out `/Users/zacheryspector/studio-scratch/1344-r2/r2d/out/`; expected premise conflict with re-witness NONE for both files);
    3. 1356-X, the P15A.2 reference run (`/Users/zacheryspector/studio-scratch/1356-x/`, harness alone).

    If the session ends mid-queue, check `run-queue.log`, then re-run only the steps not done; each step refuses to overwrite its out/.
- Done since the return (all pushed):
  - 1344-F4 rulings.
  - 1344-D5 review and 1344-D6 confirmation.
  - 1344-X8, dry run x2: type gates 0; core 123 failed (848 in 1344-M); UI 3 (all numpy); every row classified.
  - 1344-X10, S10 probes: rows 1-4 attributed with every gate true; row 5 holds; row 7 oracle holds; row 6 attributed with a PREMISE_CONFLICT.
  - 1344-F5: row 6 re-witness under review, and §7 definitions 1-20. The §7 kit is staged at E/1344-stage/s7.
  - r2 merged: r2a S9 and row 5 (12 rows), r2b S5 and S1-S3 leftovers (28 rows), r2c ORACLE (2 rows).
  - P15A.2: 1356-C r1 and r2 staged; 1356-D REFINE; 1356-F2 ruling; **1356-D2 CONFIRMED** (RED review-complete).
  - P15A.1: 1355-C r1, r2 and r3 staged; 1355-D REFINE; 1355-F4; 1355-D2 NOT CONFIRMED; 1355-F5 (phase tables read by row version through the export, binding every P15 root); **1355-D3 CONFIRMED** (RED review-complete).
  - P15C: 1359-C r1 and r2 staged; 1359-D REFINE; 1359-F2 (F1 relaxes the law for authored films; budgets that fire, including the landed Wave R guard; sibling leaves split); 1359-D2 running.
  - Promise rows: r2 (1344-D8 NOT CONFIRMED: one witness per file) and r3 staged; **1344-D9 CONFIRMED**.
  - Sweep: the row 6 re-witness declaration (expected NONE) and the promise-row declarations (predicted premise conflict) are staged; **1344-D7** accepts row 6, and accepts the promise rows with change A1.
- S10 pre-declarations DONE (not run): `/Users/zacheryspector/studio-scratch/1344-sweep/s10/declarations.md` (parts a-f per row) and five probes in `/Users/zacheryspector/studio-scratch/1344-sweep/s10/probes/` (`.txt`, rename to run). Attributed to shelving: row 4 (family 12, `p13a-core-causal-01`: r01 shelves at week 93, before settlement week 208), row 6 (`p14b5-relationships:372`: r01 shelves `script-0006` at week 208; its replacement repeat take may fall outside the 40-tick guard, and then the row returns under the no-widening rule), row 7 (`p14b1-trust-chooser:683`: an oracle fix, the test's candidate list still includes the screenplay r01 shelves at week 93). Uncertain until a probe finds a shelving: row 1 (seating, seed-b), rows 2-3 (family 12, seed-b and `p13-public-commercial-adoption`; row 2 fails at :530, not :529). Family 12 moves up to seven pins per seed. Not S10: row 5 (`p14b5-relationships:596`): Save43's per-studio field moved the digest; extend its strip list with a guard and keep the pinned value (the 1332-A precedent). Slice A RED r5 edits the same file as rows 5 and 6.
- Claims limits: the sweep edits are authored without test runs by design. x1 (partial, stopped at 29 files, before g6) is superseded by x2; its early files already dropped toward 1338 counts (p14b5-relationships 20→5, relationship read-models 18→6, p14p4p5-opportunities 6→1). Nothing is verified until x2 is attributed.

## Next step
Return plan, approved 2026-09-30 15:01 EDT; full text in `~/.claude/plans/immutable-zooming-flame.md`. Below, E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919` and S = `/Users/zacheryspector/studio-scratch`. Standing rules: one production writer; one heavy test process at a time; no commits during a recorded run; free disk ≥ 5 GB before a recorded run.

0. **Resume checks.** `git fetch`; HEAD equals remote; the old session (PID 95233) is closed. x2: `cat S/1344-merge/x2.meta; kill -0 $(cat S/1344-merge/x2.pid)`. Still running: do only Step 2 and the parallel list, and never edit the merge tree. Dead without an "end" line: check `ps` for orphan vitest workers, then relaunch as x3 (Step 5 command). Slept mid-run: timeout rows are environment; re-run those files alone.
1. **Attribute x2** (after it ends; from the repo root; the scripts refuse to overwrite). Core: `python3 E/1321-I-attribution.py S/1344-merge/x2-core.txt S/1344-merge/x2-core-failures.json`, then `python3 E/1344-I-compare.py S/1344-merge/x2-core-failures.json E/1338-I-failures.json S/1344-merge/x2-vs1338.json`. UI: `python3 E/1317-I-attribution.py S/1344-merge/x2-ui.txt S/1344-merge/x2-ui-failures.json`, then `1344-I-compare.py` against `E/1343-I-failures.json` into `S/1344-merge/x2-ui-vs1343.json`. Sort every identity that is not 1338's into S8, S9, S10, oracle rows (`p14b1-trust-chooser:683`, `p14b4-cast-class-policy:485`), g6's measure items (`p14c3-transitions:169,198`, `p14c3-second-episode-writing:144`), g5's Q2 anomaly (`p14c3-queued-writing-proof` 56/129/154) and 1320-X scratch artifacts (bridge-supervisor "Fake Unity", C17 ENOENT paths). Anything else is a finding: stop and report it. Record 1344-X7 in E.
2. **Parent rulings 1344-F4** (can come before x2 ends). S10 rows 1-4: attribute with probe evidence and leave them failing as retained 1338 identities, per 1344-N; a re-pin that clears a retained row belongs to that row's own repair track. Row 5 (`p14b5-relationships:596`): the strip-with-guard form (1332-A precedent), class S7. Oracle rows follow the shelved-screenplay filter (`src/core/talentMarket.ts:1442-1449`) and never move a pinned value. Row 6: the no-widening rule decides. The sweep lands before slice A r5, which collides with rows 5 and 6.
3. **Revision r2 in the merge tree** (test-author agents on disjoint files, after x2). S8: the measured `validateSaveV43` message, cited by `src/core/save.ts` line (1344-N:41-43). S9: the measured first guard, with the 1320-A masking comment (1344-N:44-48; examples in `E/1320-stage/1320-save42-sweep-classification.json` rows 4435 and 4444). Oracle rows and row 5 per 1344-F4. One classification row per edit.
4. **S10.** An independent read-only reviewer answers the seven "Reviewer checks" at the end of `S/1344-sweep/s10/declarations.md`. Then the parent runs the probes one at a time (rename `.txt`) and records each predicate. A refuted attribution returns its row unresolved.
5. **Dry run x3 and iterate.** `cd S/1344-merge && python3 -c 'import os,sys; os.setsid(); os.execvp("bash", ["bash"]+sys.argv[1:])' S/1344-merge/run-dry-run.sh x3 </dev/null >/dev/null 2>&1 &`, then write the script's PID to `x3.pid`. Attribute as in Step 1. Repeat Steps 3-5 until the 1344-N success line (1344-N:80-82) holds: type gates clean; core identities equal 1338's 79 minus the exporter row (seven masked rows restored, S10 rows attributed); UI equal 1343's 10; no new identity.
6. **Stage and review.** `git -C S/1344-merge/tree diff 6c54d5e..HEAD > E/1344-stage/1344-save43-sweep.patch`, plus a merged classification JSON and handback 1344-C5. Check under a temporary index (`GIT_INDEX_FILE=... git apply --check --cached`), commit and push. Review 1344-D4: an independent read-only agent on the 1320-D checklist (assertion strength, live versus historical saves, sentinels, chains and S9 against production law, helper and catalogue pins, a classification sample of more than 40 rows, the handbacks' open items, the S10 declarations). The heavy lane is free during D4: run slice B's dry run 1358-X then.
7. **Apply and recorded gates.** `git apply --index` the staged patch, commit, push, confirm disk ≥ 5 GB. Core: `python3 E/run-bounded-source-guards.py pre 1344-save43-sweep-broad-core 0`, then `PATH="$PWD/.venv/bin:$PATH" node E/run-bounded-source-c2.mjs 1344-save43-sweep-broad-core node_modules/.bin/vitest run --project core $(cat S/1344-merge/core-list.txt)`, then `python3 E/run-bounded-source-guards.py post 1344-save43-sweep-broad-core` (85-130 min). UI alone, the same way, with `1344-save43-sweep-broad-ui` and `vitest run --project ui`. A void run repeats with a `-r2` suffix. Attribute as 1344-I3 (core vs 1338) and 1344-I4 (UI vs 1343), record 1344-M3, review 1344-J3.
8. **§7, then closure 1344-K.** §7 is the charter's Verification section (`E/1344-A-rival-screenplay-shelving-charter.md:172-185`). Re-run the 1329 probes (`E/1329-c8/probe-natural-chain.test.ts.txt`, `probe-rival-economy.test.ts.txt`, the decide-diag instrumentation) on the landed candidate for 520 weeks. Report per studio: cash, films, `firstTakes`, shelvings, retries, and the first week each rival films again after a shelving. Controls: Test 3's HEAD-equality run, player-only saves, no refund or ledger movement at shelving, determinism across two runs. The 42 C8 rows are re-run and attributed on their own evidence; no test is changed and no hiring is forced. Also report industry films after week 140 against HEAD's 53 and shelvings per studio per year (1344-F:38-39), and attribute every natural-route movement from week 93 on (1344-F3:16-17). No thresholds exist: report, attribute, and flag the rest to the Owner. Then closure 1344-K on the 1319-K pattern (pinned artifacts, red, green, sweep block, application commit with appliedEqualsDryRunTree, core and UI gates, type gates at HEAD, the §7 result, open items, next). Add the K entry atop 06 and update the CURRENT blocks and this file. 1352-L and 1353-L close their pending broad gates with the same runs.
9. **Queue after P14.** Heavy lane, in order: slice A recorded RED and GREEN (1348-F5:31-38), P15B probe 1357-P (record 1357-X), slice B producer mint 1358-P (at the last Save43 writer), probes G1 (P15A.1, after §7) and G-P (P15C, before production), then the P15 recorded REDs. Writers, one at a time: slice A steps 1-3 → slice B (Save44, projection 57) → P15A.2 slice 2a (supplies `studioWeeklyFixedCost` to P15B) → the P15A.1, P15B and P15C Wave 2 productions, which may share one save step (Save45, 1355-F Amendment 4).

**Parallel work** (agent authoring with no test runs, up to 2 agents; allowed while x2 or a recorded gate runs): 1344-F4; the S10 declaration review; the P15A.1, P15A.2 (2a) and P15C Wave 2 REDs (P15C carries 1353-J note 2). After the sweep lands: the slice A r5 rebase.

## Open decisions for the Owner
- numpy for the three rgba-export tool-contract rows: recommend a scoped `.venv` install beside Pillow, because the rows otherwise stay permanent environment failures (1345-E).
- P16: the nine questions in 1354-Q, open until the Owner answers.

## Blockers and warnings
- The earlier session (fda2743f, PID 95233) may still be open in another terminal. Close it; two sessions writing this worktree collide.
- `~/Downloads/project-studio-p13-owner-direction-inputs-01` is a superseded P13 input kit. It holds only a pointer HANDOFF.md to this file.
- Scratch lives in `/Users/zacheryspector/studio-scratch/`: 1344-sweep (group trees and outputs, s10), 1344-merge (merge tree, dry-run outputs, `run-dry-run.sh`, `core-list.txt`), 1348-x5, 1358-work, save-review.py. Trees link real `docs`, `node_modules`, `art`, `tools` and `tests/fixtures`: use `ln -sfn`, never write under a link, delete with `rm -rf` on literal paths without a trailing slash.
- If an agent returns `401 OAuth access token has been revoked`, the Owner runs `/login`.
- No commits during a recorded run or its postflight. The x2 dry run is not a recorded run: repo commits are safe during it. Hook stamps to the HANDOFF.md AUTO block are harmless.
- The machine has 4 CPUs and 8 GB RAM. One heavy test process at a time; x2 is that process until it ends. The Workflow cap is 2 agents.
- Do not access Owner saves, scan fixture trees, force-push, or launch Codex.

## Auto snapshot
<!-- AUTO:BEGIN (handoff_guard.py rewrites this block) -->
- Stamped: 2026-10-01 18:21 CDT by **claude** on PreCompact (session 60db833c-4cf7-4685-b2ec-8aac42c6dac1)
- Branch: `wip/headless-program-20260916-ts` @ `b5ccb37fb00a83f78044140c3d09a2afad535311`
- Upstream: `none`, unpushed commits: ?
- Uncommitted files: 1
  - `M HANDOFF.md`
- Last commits:
  - b5ccb37f docs(p14): 1344-D8 confirmation — NOT CONFIRMED (D7's single re-witness rule; one witness per file)
  - a12ec486 docs(p15a1): Wave 2 RED r3 staged (1355-C3: 1355-F5 items 1-2)
  - 21e433c8 docs(p15a1): 1355-D2 (NOT CONFIRMED: R4) and ruling 1355-F5 (phase tables read by row version through the export; capture assumes one shared step)
  - cca0a8eb docs(p14): promise-row declarations r2 (1344-D7 A1: recorded re-witness search; row 11 part f fixed)
  - 5e227cdd docs(p15a1): Wave 2 RED r2 staged (1355-C2: 59 leaves; 1355-F4 applied; cross-root leaf; shared P15_ROOTS)
<!-- AUTO:END -->
