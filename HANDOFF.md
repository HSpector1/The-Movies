# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), 2026-10-02 04:45 CDT (the Mac runs on CDT; use `date`)

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ the commit after 5f2b5999 that carries this file (slice B RED landed 650e963a, capture 4ad8e0f7; 1358-X5, 1358-M2, 1358-N, 1358-F9, 1358-F10 committed), pushed: yes.
- Resume this session: `cd ~/Downloads/project-studio-p13-owner-direction-inputs-01 && claude --resume 60db833c-4cf7-4685-b2ec-8aac42c6dac1` (the session started in that folder; it works in this repo). A fresh session: start `claude` in this repo root and say "resume from HANDOFF.md".
- Required reading, in order:
  1. This file.
  2. `E/1348-M-rel-sliceA-recorded-broad-gates.md` (slice A closed), `E/1353-F7-parent-response-to-1353-U.md`, then `E/1353-F6-parent-rulings-on-1353-T.md`, `E/1353-U-p15c-legacy-tuning-review.md` and `E/1353-T-p15c-legacy-tuning-amendment.md`: the P15C Legacy retune (critic 60, hit 49, share 20, definition v2 with a frozen v1 entry) and the RED r6 items.
  3. Slice B: `E/1358-F8-parent-response-to-1358-J.md` (validator rules, X5 and sweep inputs), `E/1358-J-rel-sliceB-production-review.md` (KEEP, with the dry-run expectations and the sweep list), `E/1358-F7-parent-rulings-on-1358-E.md`, `E/1358-F6-parent-response-to-1358-D2.md`.
  4. `E/1357-R-rival-stall-diagnosis.md` and `E/1357-F3-parent-note-on-1357-R.md`: Owner question 1357-Q1.
  5. `docs/engineering/playability-launch-review/CONTINUATION-STATE.md`, top `## CURRENT` block (same as 06's; refresh it after the gates).

## Active order
- Governing Owner order: the Opus take-over mandate (recover, finish P14, then P15 → P16 → P17 → a specified P18) under `docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`, with Owner rulings 1340-O, D-1339-1 and 1342-O.
- In scope: relationship slice B; the P15 Wave 2 REDs (P15A.1, P15A.2, P15C); the P15C §5.5 retune; P15A.2 slice 2a; slice A's broad gates; P15B Wave 2 only after 1357-Q1.
- Closed, do not reopen:
  - P14 shelving, Save43 and the sweep (1344-K); §7 (1344-V);
  - P15 Wave 1 (1346-K, 1352-K, 1353-K);
  - slice A production (1348-L; its broad gates are the 1348 run now in flight);
  - the RED confirmations 1355-D4, 1356-D4 and 1359-D4 (P15C's C11 reopens only for 1353-F6 ruling 3);
  - the 1340-O and 1342-O rulings; U2 (1341-K).

## State
- Done earlier (pushed): 1344-V, 1344-K (P14 closed), Wave 1 closures 1346-K/1352-K/1353-K, 1357-X/F2 (P15B Re-tune, Owner Q 1357-Q1), 1357-R/F3 (rival stall root cause), 1358-X2, 1348-X7, 1359-X3, 1355-X3, 1358-D/F4, G-P 1359-X4/F5 (retune), G1 1355-X4 (Proceed, flagged), 1358-X3 (r5 equals 1358-C5).
- Done this session, committed in the checkpoint after bc2f6007 (pushed):
  - **1348 recorded broad gates** at bc2f6007, Node v20.20.2: core 85 failed / 4,894 passed of 4,993 (435 files), UI 3 failed / 2,689 passed of 2,697; fixedSource and allGuardsExact true. **1348-M**: core SAME 85 against 1344-I3; UI the three numpy rows (CHANGED only by the temp directory in the primary). Slice A's two files pass. **1348-L CLOSED.**
  - **P15C retune:** 1353-T (record, scripts, probe outputs in `E/1353-stage/t/`); **1353-F6** (hit line 49; critic 60; share 20; `campaign-legacy/v2` with a frozen v1 entry); **1353-U** REFINE (verbatim; scripts in `E/1353-stage/u/`); **1353-F7** adopts it.
  - **P15C RED:** r6 and reference r4 (1359-C6), **1359-D5** REFINE (verbatim), **1359-F6**, **r7** (1359-C7; `E/1359-stage/1359-p15c-wave2-red-r7.patch` e3ccde79…, classification 9ec7b936…; reference r4 66dc946d…). The parent checked the r6-to-r7 diff. P15C's RED pins the base's live save as 43 (I:151) and rebases onto Save44 before its mint (1359-F6 ruling 5).
  - **Slice B RED:** 1358-F5 (rulings sent for r6), r6 (1358-C6), **1358-D2** CONFIRMED (verbatim), **1358-F6** (withdraws F5's `endedWeek` bound), r7 (1358-C7), **r8** (1358-C8: two forged-save leaves, a control, one anchor assertion; `E/1358-stage/1358-rel-sliceB-red-r8.patch` ef7c456a…, classification 90491c5c…, 100 rows). The parent checked each diff.
  - **Slice B production:** 1358-E (four cumulative steps), **1358-F7** (D1-D4 accepted; Q1-Q6 readings stand; copy provisional), **1358-J** KEEP (verbatim; scripts in `E/1358-stage/j/`), **1358-F8** (two validator rules; anchor reading; X5 and sweep inputs), production **r2** (1358-E2; `E/1358-stage/1358-rel-sliceB-production-step1..4-r2.patch` 95d5a5d9…, eaa026e2…, 510c361b…, 2004b500…), **1358-J2** CONFIRMED (verbatim).
- Done after e1a793fd (the lane runs, all as declared):
  - **1353-X4** (G-P on 60/49/20, `campaign-legacy/v2`): `artistic-voice` 0 and 2 (r06, r07), `commercial-engine` 0 and 2 (r06, r07), every other row as 1359-X4, `retune` false everywhere. Outputs in `E/1353-stage/x4/`.
  - **1359-X5** (P15C RED r7 and reference r4): RED 40 failed / 76 passed, root tsc 0; reference 113 passed, C2-C4 FIXTURE PENDING, tsc 35 errors at 1359-X2's positions; 0 mismatches. Outputs in `E/1359-stage/x5/`.
  - **1358-X4** (slice B RED r8): 89 failed / 59 passed (148); 100 rows ok; 17 root type errors at r8's positions; UI and Bridge 0; 1358-D2's five leaves as tabled (first Mentor build 39.9 s). Outputs in `E/1358-stage/x4/`.
- **Slice B RED landed:** RED r8 committed at 650e963a; recorded mint `1358-sliceb-mint` (exit 0, fixedSource, allGuardsExact) wrote `tests/fixtures/p14/genuine-v43-pre-romance/` (save gzip a731677f…, equal to X2's), committed at 4ad8e0f7; recorded RED `1358-sliceb-red-recorded` at 4ad8e0f7: 89 failed / 59 passed (148), identities equal 1358-X4's. **1358-L** opened (IN PROGRESS).
- **1358-X5** (production r2 steps on the landed RED, committed at 324b8701): classified reds 62, 44, 10 and 3 with 0 mismatches; after step 4 only rows 59-61 stay red (at `acceptedEvidence`, "expected 44 to be 43"); both generator checks pass. All other failures sit in test files (27 in p14b5-relationships; type errors 20 at step 1 and 46 from step 3 in the root gate, 2 each in UI and Bridge from the shared helpers `p14c2b-fixtures:69` and `p14c4-fixtures:71`): sweep fallout.
- **1358-M2** (committed 5f2b5999): core 879 failed vs 1348-I SAME 71 / CHANGED 14 / NEW 795 / GONE 0, every NEW row a Save44/P57 pin, a helper pin or an environment row; UI 16 (13 NEW); the four §7 routes keep every §7 measure. Owed: the snapshot measurement (F8 ruling 5), queued.
- **Sweep r1** (1358-F10): seven groups merged, `S/1358-sweep/merge` branch `sweep-x6` 8144c0c; staged as `E/1358-stage/sweep-r1/1358-sweep-r1.patch` (cbc8ee00…) with every group's outputs and the message probe.
- In flight (heavy lane, scratch only, no recorded run):
  - **1358-X6** (sweep r1 dry run): started 04:35:16, `S/1358-sweep/x6/run.meta`; type gates 0 errors, generators pass, slice B files 154 passed / 3 failed (only the three 1344-F6 row 6 exceptions; first Mentor leaf 52,798 ms); then the message probe (`x6/probe.txt`, grep `PROBE1358`), core 440 (`x6/core.txt`), UI (`x6/ui.txt`).
  - Queued behind X6: the **snapshot probe** (`S/1358-m2/snap/run-snap.sh`, lane-run PID in `S/1358-m2/snap/snap.pid`, progress `snap/snap.meta`): `peopleProjection` every week on the four routes, step 4 then base.
- **P15 rebase after slice B:** the three P15 REDs read the save step from `LIVE_SAVE_VERSION`; the only base pin is P15C's `BASE_LIVE_SAVE_VERSION = 43` (integration test :151), which moves to 44. The producers carry no hardcoded version.
- Claims limits:
  - 1353-T's market-pressure numbers are first order (open-loop factors from 1355-G1).
  - The retune rests on five rival careers on seed-b; p13a's rivals stop filming (1357-R).
  - The slice B production and both REDs' expected results rest on reading until their dry runs.

## Next step
E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, S = `/Users/zacheryspector/studio-scratch`. Standing rules: one production writer; one heavy test process at a time; no commits (and no `git add`) during a recorded run or its postflight; free disk ≥ 5 GiB before a recorded run (5.14 GiB at 01:57; delete each X run's tree after reading it); recorded runs pin Node v20.20.2; recorded stems match `^[0-9]{3,4}[a-z0-9-]*$` (lowercase).

1. **After X6:** attribute `x6/core.txt` and `x6/ui.txt` (`1321-I-attribution.py`, `1317-I-attribution.py`, then `1344-I-compare.py` against `E/1348-I-core-failures.json` and `E/1348-I2-ui-failures.json`); read `x6/probe.txt`; record **1358-X6**. Then dispatch follow-up units per 1358-F10 (S5 helpers, S8 pins, S9 forms, the p14d1 week-93 control after its probe), merge, confirm with X7, review (1358-D for the sweep), then land per 1358-L (production steps, p57 manifest and recorded producer for F10/F11, sweep commit, recorded GREEN, recorded broad core and UI).
2. **P15 REDs and mints** wait for slice B's Save44 production: P15A.1 (producer 1355-P r3), P15A.2, P15C (1359-P r4; rebase I:151 first). **P15B** waits for 1357-Q1.

Agents: the user allows as many subagents as help (2026-10-01). Agents author and review; only the parent runs broad or heavy tests.

## Open decisions for the Owner
- **1357-Q1:** the P15B closure law closes 7 of 8 rivals by 1960 on two seeds because rivals that stop filming have no income and cannot cut costs. 1357-R/1357-F3 trace the start of the stall to the shelving law's `cashBlocked` rule (1344-A:57): a screenplay that loses money at every affordable package never shelves once its dearest package is out of reach. Recommend (a): fix that rule first, then rival cost-cutting, then re-probe. Options (b) and (c) are in 1357-F2 §4.
- **The P15C playtest brief** carries 1353-T §6.3: no player distribution backs the retuned Legacy lines; the Owner judges `artistic-voice` (critic 60, one release in five) and `commercial-engine` (49% of `baseMarketValue`) in play.
- **numpy** for the three rgba-export tool-contract rows. Recommend a scoped `.venv` install beside Pillow (1345-E).
- **P16:** the nine questions in 1354-Q.
- **The seven declared exceptions** that 1344-K lists (1344-F6). Recommend accepting them: both probes found no lawful re-witness.
- **The §7 flags** (1344-V §9, items 1-6): measured behaviour with no threshold, including the 154 promise movements.
- **1356-X F-2,** as 1356-F5 restates it. Recommend checking reachability through the bridge first.
- **X12's V39-masking family.** Recommend a small RED that gives each leaf an input whose first refusal is its own guard.

## Blockers and warnings
- **Node.** Recorded runs pin v20.20.2: put `/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin` first on PATH. The session's nvm default is v22.23.2.
- **Heavy lane.** `S/heavy-queue/lane-run.sh <pid|0> <log> <cmd…>` takes `S/HEAVY-LANE-LOCK`, waits out vitest or tsc (matched on the `node` command name), runs the job alone and releases the lock. Run it with `bash`; it is not executable. Passing a PID to wait for avoids its 2 h lock cap.
- **The recorder's guards** digest the git index and stage entries: no `git add` (not only no commit) while a recorded run or its postflight runs. Writing untracked files under `docs/` is safe; `src`, `bridge`, `tests`, `ui`, `generated`, `scripts` and the root configs are source paths.
- **Patches that touch `docs/`.** Scratch trees link the real `docs`; apply only `tests/*` there (`git apply --include`) and put E-path files in a separate tree with a real directory. Never write under a link.
- **Deleting scratch.** The harness blocks `rm` on variable paths; use literal absolute paths, links first, then `rm -rf` on the tree.
- **Agent auth.** If an agent returns `401 OAuth access token has been revoked`, the Owner runs `/login`.
- **The machine.** 4 CPUs, 8 GB RAM. Disk: 4.64 GiB free at 01:56 CDT during the gates (swap 1.9 GB used); 5.14 GiB after removing finished trees (1358-x3, 1344-merge/tree, 1358-d2, 1359-d5, 1358-work). Each X run adds a ~130 MB tree: delete it (links first, literal paths) after reading its outputs, before any recorded run. `S/1358-x2/tree` and `ptree` stay until slice B's RED lands (X3b copies X2's capture); `S/p15-probes/tree` serves the next 975e72a1-based probe.
- **Hard limits.** Do not access Owner saves, scan fixture trees, force-push, or launch Codex.

## Auto snapshot
<!-- AUTO:BEGIN (handoff_guard.py rewrites this block) -->
- Stamped: 2026-10-02 04:05 CDT by **claude** on PreCompact (session 60db833c-4cf7-4685-b2ec-8aac42c6dac1)
- Branch: `wip/headless-program-20260916-ts` @ `b17e8ac2a635b4e1b19455d843f3c6f9dffdddc4`
- Upstream: `none`, unpushed commits: ?
- Uncommitted files: 1
  - `M HANDOFF.md`
- Last commits:
  - b17e8ac2 docs(p14b): 1358-p57 declaration producer for F10/F11 (projection 57), derived from 1328's
  - faf0812d docs(p14b): 1358-N Save44 and projection-57 sweep plan adopted with 1358-F9; census of 685 rows in 156 files
  - 2ff1bf89 docs(handoff): slice B RED landed, 1358-X5 as declared, 1358-M2 running
  - 324b8701 docs(p14b): 1358-X5 slice B production r2 on the landed RED: every classified row as declared at every step
  - 5245072a docs(p14b): slice B recorded RED at 4ad8e0f7 (89 failed / 59 passed of 148, identities equal 1358-X4's); 1358-L opened
<!-- AUTO:END -->
