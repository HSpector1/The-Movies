# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), 2026-10-02 09:08 CDT (the Mac runs on CDT; use `date`)

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ the commit after 97690eeb that carries this file (slice B RED landed 650e963a, capture 4ad8e0f7; records through 1358-X9t and 1358-D9b committed), pushed: yes.
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
- **1358-M2** (with the snapshot measurement): core vs 1348-I NEW 795 all pins, helpers or environment; UI 13 NEW; routes keep every §7 measure; snapshot probe 2: ~46,000 mentorEvidence calls per route, 0 throws; relationship blocks at most 40% over base; cohort projection 235 vs 246 ms.
- **1358-X6** (sweep r1): type gates 0 errors, slice B GREEN shape, UI = 1348-I2; message probe: Save44 romance refusal first at 15 sites. **Its core output was lost** to a parent edit of the running script (memory `never-edit-running-script`).
- **1358-X7t** (targeted) and **1358-F11**: follow-up units F1 and F2 settled S9 pins, S8 pins, own-era covers (V41, V39, V36, V27, Scientist, screenplayShelved receipt), S5 helpers; D13 and D12 frozen builders take genuine Save39 1221 captures.
- **1358-X8** (full dry run of sweep r2, 06:58-08:47): type gates 0 errors; slice B row-6 exceptions only; core vs 1348-I 78 SAME, 7 CHANGED, 9 NEW (7 scratch Fake Unity rows, the week-93 control, the F10 leaf as a linked-fixtures artifact), 0 GONE; UI equals 1348-I2; probe 4: D13 and D12 captures pass, week 93 holds 15 tracks and 0 log rows.
- **1358-D9** (independent review of r2): REFINE, R1-R4. **1358-F12** rules on it: R2 pin, R4 engine shelving values, R3 measured-no-pin, the week-93 control takes slice B's edge roots out of the candidate, dry-run script v2 copies the one fixtures module. Sweep **r3**.
- **1358-X9t** (r3, 11 files plus the generator test, script v2): 241 of 244 pass; only the P4 leaf (F10 renders `1dadf88f…71fa4`), D07 and D18 fail; F10 identity passes. **1358-D9b** CONFIRMED r3, with one comment fix: sweep **r4** = scratch branch `sweep-r4` 4e36a25 in `S/1358-sweep/merge`; patch `E/1358-stage/sweep-r4/1358-sweep-r4.patch` (94f0b476…, 154 test files, +1,058/-679). Parent classification rows (R1): `E/1358-stage/sweep-r4/1358-classification-parent.json` (44 rows).
- In flight: nothing. The lane is free.
- Prepared landing (1358-L): `S/1358-land/land-sliceB-steps.sh` (production steps 1-4 r2 as four commits, push, blob check against `S/1358-n/tree` tag step4); then `git apply --index` the r4 patch and commit; `python3 S/1358-land/p57-manifest.py` and commit the manifest; `lane-run.sh 0 … bash S/1358-land/recorded2.sh producer`; write F10/F11 from its output (1328 provenance pattern; F10 must equal X9t's `1dadf88f…`) and commit; then `recorded2.sh green`, `core`, `ui` (each under lane-run; no commits during a run); attribute against 1348-I and 1348-I2; record 1358-M3; review; close 1358-L. Success line: core equals 1348-I's 85 identities (C20 CHANGED by the version digit), UI equals 1348-I2, no NEW, no GONE.
- **P15 rebase after slice B:** the three P15 REDs read the save step from `LIVE_SAVE_VERSION`; the only base pin is P15C's `BASE_LIVE_SAVE_VERSION = 43` (integration test :151), which moves to 44. The producers carry no hardcoded version.
- Claims limits:
  - 1353-T's market-pressure numbers are first order (open-loop factors from 1355-G1).
  - The retune rests on five rival careers on seed-b; p13a's rivals stop filming (1357-R).
  - The slice B production and both REDs' expected results rest on reading until their dry runs.

## Next step
E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, S = `/Users/zacheryspector/studio-scratch`. Standing rules: one production writer; one heavy test process at a time; no commits (and no `git add`) during a recorded run or its postflight; free disk ≥ 5 GiB before a recorded run (5.14 GiB at 01:57; delete each X run's tree after reading it); recorded runs pin Node v20.20.2; recorded stems match `^[0-9]{3,4}[a-z0-9-]*$` (lowercase).

1. **Land slice B** per "Prepared landing" above, in order, checking each step's log (`S/1358-land/land-steps.meta`, `S/1358-land/recorded2.meta`). After the sweep commit, check each of the 154 files' blobs equal `sweep-r4:<file>` in `S/1358-sweep/merge` and `src`/`bridge` equal tag `step4` in `S/1358-n/tree`.
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
- **The machine.** 4 CPUs, 8 GB RAM. Disk: 5.28 GiB free at 09:05 CDT after removing the sweep worktrees and the P15 RED working trees. Free space drops about 0.9 GiB during a heavy run (swap) and returns after. Each X run adds a ~130 MB tree: delete it (links first, literal paths) after reading its outputs, before any recorded run. The P15 RED repos survive as mirrors (`S/1355-red/tree-mirror.git`, `S/1356-red/tree-mirror.git`, `S/1359-red/tree-mirror.git`, every branch); their re-dry-runs on Save44 build new trees. Keep `S/1358-n/tree` (tag step4) and `S/1358-sweep/merge` until 1358-L closes.
- **Dry runs** use `S/1358-sweep/run-1358-sweep-dry-v2.sh` (v1 linked `tests/fixtures`, which made the union fixtures module import the repo's schema).
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
