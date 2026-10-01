# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), 2026-10-01 18:47 CDT (the Mac runs on CDT; use `date`)

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ 32640b1e plus the commit that updates this file, pushed: yes. The working tree is clean.
- Resume this session: `cd ~/Downloads/project-studio-p13-owner-direction-inputs-01 && claude --resume 60db833c-4cf7-4685-b2ec-8aac42c6dac1` (the session started in that folder; it works in this repo). A fresh session: start `claude` in this repo root and say "resume from HANDOFF.md".
- Required reading, in order:
  1. This file.
  2. `/Users/zacheryspector/studio-scratch/1344-merge/x3.meta` (dry run x3), then `/Users/zacheryspector/studio-scratch/heavy-queue/run-queue.log` (the queue that runs after it).
  3. `E/1344-X8-save43-sweep-dry-run-x2.md`: how x2 was attributed. x3 follows the same method.
  4. `E/1344-N-save43-pin-sweep-plan.md` (classes S1-S10, success line :80-82), then the rulings `E/1344-F4-parent-rulings-on-sweep-s10-and-open-items.md` and `E/1344-F5-parent-rulings-row6-and-s7-definitions.md`.
  5. `docs/engineering/playability-launch-review/CONTINUATION-STATE.md`, top `## CURRENT` block (refreshed at c8c2872b; this file is newer).

## Active order
- Governing Owner order: the Opus take-over mandate (recover, finish P14, then P15 → P16 → P17 → a specified P18) under `docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`, with Owner rulings 1340-O, D-1339-1 and 1342-O.
- In scope: the Save43 pin sweep (1344-C5) and P14 closure 1344-K; relationship slices A and B; the P15 Wave 2 reference runs; after P14, the P15 queue.
- Closed, do not reopen: the 1340-O and 1342-O rulings; U2 (1341-K); P15B Wave 1 (1352-L); P15A.1 and P15A.2 Wave 1; the P15C Wave 1 landing (1353-L; its broad gates ride with the sweep's); the three P15 Wave 2 RED reviews (1356-D2, 1355-D3 and 1359-D3, all CONFIRMED).

## State
- Done (all pushed; records in E):
  - P15C Wave 1 landed (1353-L): recorded RED 72 failed and 6 passed of 78; production 321a4378; recorded GREEN 78/78. Both runs fixedSource, every guard exact.
  - Save43 sweep authored (helpers, g1-g6) and merged in `S/1344-merge/tree`, its own git repo (base 6c54d5e, equal to repo 3a606df4), with parent commits f8c48ec (S1) and becafce (S2).
  - Dry run x2 (1344-X8): type gates 0 errors; core 123 failed (848 in 1344-M); UI 3, all numpy; every row classified.
  - Rulings 1344-F4 (S10 rows, row 5, oracle rows) and 1344-F5 (row 6 re-witness rule; §7 definitions 1-20). The §7 kit is staged at `E/1344-stage/s7`.
  - S10 probes (1344-X10): rows 1-4 attributed to shelving with every gate true; they stay failing as retained 1338 rows. Row 5 and the row 7 oracle hold. Row 6 is attributed with a PREMISE_CONFLICT.
  - r2 merged: r2a 5c7f499 (S9 and row 5, 12 rows), r2b 1c2f9e8 (S5 and S1-S3 leftovers, 28 rows), r2c 6935ea5 (ORACLE, 2 rows). Merge HEAD is 6935ea5.
  - Sweep reviews: 1344-D5 and D6 (S10 declarations), D7 (row 6 and promise-row declarations), D8 (NOT CONFIRMED), D9 (promise-row probe r3, CONFIRMED).
  - P15 Wave 2 REDs, all review-complete: P15A.2 slice 2a (1356-C2 r2; 1356-D2), P15A.1 (1355-C3 r3; 1355-D3), P15C (1359-C3 r3; 1359-D3). Rulings 1356-F2, 1355-F4, 1355-F5 (every validator reads `P15_PHASE_TABLES[row.phaseOrderVersion]` through the export) and 1359-F2.
- In flight (as of 18:47 CDT):
  - **x3**, the dry run of merge HEAD 6935ea5 (r1 plus r2), detached, PID in `S/1344-merge/x3.pid`, started 17:19 CDT. Type gates 0 errors; core at 409 of 433 files at 18:45; UI follows. Never edit the merge tree until `x3.meta` shows "ui exit".
  - **Heavy queue** `S/heavy-queue/run-queue.sh` (log `run-queue.log`). A waiter starts it when x3 ends. It runs one process at a time, STOPs on any failed check, and each step refuses to overwrite its out/ or tree:
    1. Row 6 re-witness probe r3, in the merge tree (out `S/1344-r3/row6/out/`). Expected NONE, so 1344-F5 A3 makes row 6 a declared exception.
    2. Promise-row probe r3 (`promises-r3.sh`, verbatim from `E/1344-stage/s10/promises-r2d/RUNBOOK-r3.md`; out `S/1344-r2/r2d/out/`). Expected: premise conflict, re-witness NONE for both files.
    3. 1356-X (`S/1356-x/run-1356-X.sh`). Expected: RED 69 failed and 2 controls pass; with the reference, 70 pass and 1 capture leaf fails. The harness time sets its budget.
    4. 1355-X (`S/1355-x/run-1355-X.sh`). Expected (1355-C3): RED 4 pass and 55 fail; with 1356's reference r2 then 1355's reference r3, 53 pass and 6 FIXTURE PENDING.
  - Ready, not queued: 1359-X (`S/1359-x/run-1359-X.sh`). Its route L controls tick to week 6760, so it is long. Run it when the heavy lane has no sweep work.
  - If the session ends mid-queue: read `run-queue.log`, then re-run only the steps not done.
- Claims limits: x3 is unattributed. The r2 edits and the four queued runs stay unverified until their outputs are read.

## Next step
E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, S = `/Users/zacheryspector/studio-scratch`. Standing rules: one production writer; one heavy test process at a time; no commits during a recorded run; free disk ≥ 5 GB before a recorded run.

1. **Attribute x3 as 1344-X9** once `x3.meta` shows "ui exit". From the repo root (the scripts refuse to overwrite): `python3 E/1321-I-attribution.py S/1344-merge/x3-core.txt S/1344-merge/x3-core-failures.json`, then `python3 E/1344-I-compare.py S/1344-merge/x3-core-failures.json E/1338-I-failures.json S/1344-merge/x3-core-vs1338.json`. UI: `python3 E/1317-I-attribution.py S/1344-merge/x3-ui.txt S/1344-merge/x3-ui-failures.json`, then `1344-I-compare.py` against `E/1343-I-failures.json` into `S/1344-merge/x3-ui-vs1343.json`. Classify every identity that is not 1338's as 1344-X8 did. Check the r2 deferrals first: `p14b4-cast-class-policy` :627 and :644, `p14b1-trust-chooser` :809 (r2c); `p14c3-transitions` :169 and :198, `p14b5-relationships` :1149, :1162 and :1180 (r2a). Anything unclassifiable is a finding: stop and report it. Write 1344-X9 with its extracts, like X8.
2. **Queue results.** Record the row 6 and promise-row probes as 1344-X11. If neither finds a lawful re-witness, write 1344-F6: row 6 and the promise rows (`p14c2c-rival-promises` R1-R3, `p14c3-admission-boundaries` N10) become declared exceptions for the Owner (1344-F5 A3). Record 1356-X and 1355-X with per-leaf times; their budgets stay PROVISIONAL (the 1353-F3 method).
3. **r3, if x3 leaves residue.** Test-author agents on disjoint files in a clone of the merge tree, never the merge tree itself while the queue's first two steps run. Then dry run x4: `cd S/1344-merge && python3 -c 'import os,sys; os.setsid(); os.execvp("bash", ["bash"]+sys.argv[1:])' S/1344-merge/run-dry-run.sh x4 </dev/null >/dev/null 2>&1 &`, then write the script's PID (`pgrep -f '^bash .*run-dry-run.sh x4'`) to `x4.pid`. Repeat until the 1344-N success line holds: type gates clean; core identities equal 1338's 79 minus the exporter row; UI equal 1343's 10, environment-adjusted; no new identity except declared exceptions.
4. **Stage and review.** `git -C S/1344-merge/tree diff 6c54d5e..HEAD > E/1344-stage/1344-save43-sweep.patch`. Regenerate the merged classification with `S/1344-merge/merge-classification.py`, adding PARENT rows for f8c48ec, becafce and the r2 commits. Write handback 1344-C5. Check under a temporary index (`GIT_INDEX_FILE=... git apply --check --cached`), commit and push. Review 1344-D4: an independent read-only agent on the 1320-D checklist (assertion strength, live versus historical saves, sentinels, chains and S9 against production law, helper and catalogue pins, a classification sample of more than 40 rows, the handbacks' open items, the S10 declarations, the declared exceptions). The heavy lane is free during D4: run slice B's dry run 1358-X or 1359-X then.
5. **Apply and recorded gates.** `git apply --index` the staged patch, commit, push, confirm disk ≥ 5 GB. Core: `python3 E/run-bounded-source-guards.py pre 1344-save43-sweep-broad-core 0`, then `PATH="$PWD/.venv/bin:$PATH" node E/run-bounded-source-c2.mjs 1344-save43-sweep-broad-core node_modules/.bin/vitest run --project core $(cat S/1344-merge/core-list.txt)`, then `python3 E/run-bounded-source-guards.py post 1344-save43-sweep-broad-core` (85-130 min). UI alone, the same way, with `1344-save43-sweep-broad-ui` and `vitest run --project ui`. A void run repeats with a `-r2` suffix. Attribute as 1344-I3 (core vs 1338) and 1344-I4 (UI vs 1343), record 1344-M3, review 1344-J3.
6. **§7, then closure 1344-K.** Run §7 with the kit (`E/1344-stage/s7/RUNBOOK.md`; definitions in 1344-F5 Part B): the 1329 probes on the landed candidate for 520 weeks, the controls, the 42 C8 rows attributed on their own evidence, industry films after week 140 against HEAD's 53, shelvings per studio per year, and every natural-route movement from week 93 attributed or flagged to the Owner. Then 1344-K on the 1319-K pattern (pinned artifacts, red, green, sweep block, application commit with appliedEqualsDryRunTree, core and UI gates, type gates at HEAD, the §7 result, declared exceptions, open items, next). Add the K entry atop 06 and refresh the CURRENT blocks and this file. 1352-L and 1353-L close their pending broad gates with the same runs.
7. **Queue after P14.** Heavy lane, in order: slice A recorded RED and GREEN (1348-F5:31-38), P15B probe 1357-P (record 1357-X), slice B producer mint 1358-P (at the last Save43 writer), probes G1 (P15A.1, after §7) and G-P (P15C, before production), then the P15 recorded REDs. Writers, one at a time: slice A steps 1-3 (r5 rebases on the landed sweep) → slice B (Save44, projection 57) → P15A.2 slice 2a (supplies `studioWeeklyFixedCost` to P15B) → the P15A.1, P15B and P15C Wave 2 productions, which may share one save step (Save45, 1355-F Amendment 4). Carried: the P15 capture mints run at the last writer below the P15 step (1355-P r3, 1359-P); 1355-P records the proven release week in its MANIFEST `facts` (1355-D3 note).

Agents: the user allows as many subagents as help (2026-10-01). Agents author and review; only the parent runs broad or heavy tests.

## Open decisions for the Owner
- numpy for the three rgba-export tool-contract rows: recommend a scoped `.venv` install beside Pillow, because the rows otherwise stay permanent environment failures (1345-E).
- P16: the nine questions in 1354-Q, open until the Owner answers.
- Coming with 1344-K, if the queued probes confirm: accept row 6 and the promise rows as declared exceptions. Recommend accepting, because no lawful re-witness exists without widening a guard (1344-F5 A3).

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
