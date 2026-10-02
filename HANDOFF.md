# HANDOFF

Last writer: Claude (Opus 5.5, claude-opus-5-5), 2026-10-01 23:45 CDT (the Mac runs on CDT; use `date`)

## Where the work is
- Repo / branch / HEAD: `wip/headless-program-20260916-ts` @ 975e72a1 plus the commit that adds 1358-D, 1357-R, G-P and G1 and updates this file, pushed: yes.
- Resume this session: `cd ~/Downloads/project-studio-p13-owner-direction-inputs-01 && claude --resume 60db833c-4cf7-4685-b2ec-8aac42c6dac1` (the session started in that folder; it works in this repo). A fresh session: start `claude` in this repo root and say "resume from HANDOFF.md".
- Required reading, in order:
  1. This file.
  2. `E/1344-K-parent-shelving-save43-closure.json` (P14 closed) and `E/1344-V-s7-shelving-verification.md` section 10.
  3. `E/1357-X-p15b-wave2-probe-results.md` and `E/1357-F2-parent-response-to-1357-X.md`: the P15B probe reads Re-tune, and Owner question 1357-Q1.
  4. `E/1358-F3-parent-rulings-on-1358-X.md` and `E/1358-C4-rel-sliceB-red-r4-handback.md`: slice B r4.
  5. `E/1359-D4-p15c-wave2-red-r4-r5-confirmation.md` (P15C RED CONFIRMED) and its non-blocking notes.
  6. `docs/engineering/playability-launch-review/CONTINUATION-STATE.md`, top `## CURRENT` block (same as 06's).

## Active order
- Governing Owner order: the Opus take-over mandate (recover, finish P14, then P15 → P16 → P17 → a specified P18) under `docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`, with Owner rulings 1340-O, D-1339-1 and 1342-O.
- In scope: relationship slice B; the P15 Wave 2 REDs (P15A.1, P15A.2, P15C); P15A.2 slice 2a; slice A's broad gates; P15B Wave 2 only after 1357-Q1.
- Closed, do not reopen:
  - P14 shelving, Save43 and the sweep (1344-K); §7 (1344-V);
  - P15 Wave 1 (1346-K, 1352-K, 1353-K);
  - slice A production (1348-L; broad gates still ride with the next broad run);
  - the RED confirmations 1355-D4, 1356-D4 and 1359-D4;
  - the 1340-O and 1342-O rulings; U2 (1341-K).

## State
- Done this session (all in E, pushed):
  - **1344-V** (§7) verified against the outputs and published, with the parent's rulings (section 10). The §7 scratch trees are cleaned (RUNBOOK step 12).
  - **1344-K** closes P14 with the gates of 1344-M3 (core 85 failed: 1338's 78 retained plus the seven F6 exceptions; UI 3 numpy rows).
  - **1346-K, 1352-K, 1353-K** close P15 Wave 1 on the same gates: every Wave 1 file passes there.
  - **1357-X:** the P15B probe at b0809602 reads **Re-tune** (7 of 8 rivals closure due by 1960 on both p13a seeds; no rival recovers). **1357-F2:** no §4.5 value passes (Flag would need about 85 years in distress); Wave 2 holds at the gate; Owner question 1357-Q1.
  - **1359-D4:** P15C RED r4 and r5 CONFIRMED, no defects.
  - **Slice B r4** (1358-C4) staged in `E/1358-stage/` (patch d41ea111…, classification 3b008e0a…); the apply check at HEAD passes.
- Done after e7f075ce: **1358-X2** (slice B r4 dry run at HEAD) equals 1358-C4 on every count: 77 failed, 58 passed (135); root tsc exactly the 17 declared errors; producer r4 exit 0, capture at week 284 with the three slate pairs at `sharedCompetitions` 2. **1348-X7:** the four §7 natural routes at HEAD are byte-identical to §7's candidate runs, so slice A moves none of them.
- Done after 26566be8: **1359-X3 and 1355-X3** (both P15 producers dry-run clean at Save43); **1358-D** REFINE (five blocking items) and **1358-F4** (the r5 order, sent to the slice B author); **1357-R** (why rivals stall, verified in code and rows) and **1357-F3** (sharpens 1357-Q1); **G-P (1359-X4)**: `artistic-voice` and `commercial-engine` held by nobody on either seed, so **1359-F5** routes a §5.5 amendment; **G1 (1355-X4)**: Proceed, flagged (p13a: 8.8% of releases at f ≤ 0.95).
- In flight (agents; no heavy job runs): slice B **r5** (author, `S/1358-r2/`); the §5.5 **retune author** stage 1 (a distributions probe, `S/1353-t/`).
- Claims limits:
  - §7 describes 469a9547 (the sweep's landed source); 1348-X7 shows HEAD gives byte-identical outputs on the four §7 routes.
  - The 154 §7 promise movements: the shelving law causes them; the path is unnamed.
  - 1357-X measured b0809602 (with slice A); its p13a timings agree with §7's at 469a9547.

## Next step
E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, S = `/Users/zacheryspector/studio-scratch`. Standing rules: one production writer; one heavy test process at a time; no commits during a recorded run; free disk ≥ 5 GB before a recorded run (4.9 GiB at 22:45; check before each); recorded runs pin Node v20.20.2; recorded stems must match `^[0-9]{3,4}[a-z0-9-]*$`.

1. **Slice B r5.** When the author returns: stage r5 in `E/1358-stage/`, then dry run **1358-X3** (six files with X2's week-284 capture layered where the GENUINE leaf reads it, never writing under a link; type gates; producer), then confirmation **1358-D2**.
2. **Slice B RED and mint** (1358-F4 item 5): `git apply --index` r5 (tests and producer), commit, push; the recorded mint 1358-P at that commit (`P14_SAVE43_PRODUCER_HEAD` set; lowercase stem); commit the fixture; the recorded RED (stem `1358-sliceb-red-recorded`). Then brief the slice B production writer (Save44, projection 57, 1347-A/F).
3. **§5.5 retune.** Run the retune author's distributions probe (smoke at 20 weeks first), message the agent with the output for stage 2 (1353-T), then an independent review and G-P again.
4. **P15 REDs and mints** wait for the last writer below the P15 step (after slice B's Save44 production): P15A.1 (producer 1355-P r3 mints pins and the shared capture), P15A.2, P15C (1359-P r4).
5. **Slice A** needs only its broad gates, with the next broad run. **P15B** waits for 1357-Q1.

Agents: the user allows as many subagents as help (2026-10-01). Agents author and review; only the parent runs broad or heavy tests.

## Open decisions for the Owner
- **1357-Q1:** the P15B closure law closes 7 of 8 rivals by 1960 on two seeds because rivals that stop filming have no income and cannot cut costs. 1357-R/1357-F3 trace the start of the stall to the shelving law's `cashBlocked` rule (1344-A:57): a screenplay that loses money at every affordable package never shelves once its dearest package is out of reach. Recommend (a): fix that rule first, then rival cost-cutting, then re-probe. Options (b) and (c) are in 1357-F2 §4.
- **numpy** for the three rgba-export tool-contract rows. Recommend a scoped `.venv` install beside Pillow (1345-E).
- **P16:** the nine questions in 1354-Q.
- **The seven declared exceptions** that 1344-K lists (1344-F6). Recommend accepting them: both probes found no lawful re-witness.
- **The §7 flags** (1344-V §9, items 1-6): measured behaviour with no threshold, including the 154 promise movements.
- **1356-X F-2,** as 1356-F5 restates it. Recommend checking reachability through the bridge first.
- **X12's V39-masking family.** Recommend a small RED that gives each leaf an input whose first refusal is its own guard.

## Blockers and warnings
- **Node.** Recorded runs pin v20.20.2: put `/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin` first on PATH. The session's nvm default is v22.23.2.
- **Heavy lane.** `S/heavy-queue/lane-run.sh <pid|0> <log> <cmd…>` takes `S/HEAVY-LANE-LOCK`, waits out vitest or tsc (matched on the `node` command name), runs the job alone and releases the lock. Run it with `bash`; it is not executable.
- **Patches that touch `docs/`.** Scratch trees link the real `docs`; apply only `tests/*` there (`git apply --include`) and put E-path files in a separate tree with a real directory. Never write under a link.
- **Deleting scratch.** The harness blocks `rm` on variable paths; use literal absolute paths, links first, then `rm -rf` on the tree.
- **Agent auth.** If an agent returns `401 OAuth access token has been revoked`, the Owner runs `/login`.
- **Commits.** None during a recorded run or its postflight. X runs and probes are not recorded runs.
- **The machine.** 4 CPUs, 8 GB RAM. Disk: 5.6 GiB free at 23:00 CDT after removing finished scratch trees (outputs kept). `S/1358-x2/tree` and `ptree` stay until slice B's RED lands; `S/p15-probes/tree` serves the next probe.
- **Hard limits.** Do not access Owner saves, scan fixture trees, force-push, or launch Codex.

## Auto snapshot
<!-- AUTO:BEGIN (handoff_guard.py rewrites this block) -->
- Stamped: 2026-10-01 23:31 CDT by **claude** on PreCompact (session 60db833c-4cf7-4685-b2ec-8aac42c6dac1)
- Branch: `wip/headless-program-20260916-ts` @ `975e72a18746ee0e3cc2096750f7fdf7967a18be`
- Upstream: `none`, unpushed commits: ?
- Uncommitted files: 8
  - `?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/1355-X4-p15a1-g1-probe-results.md`
  - `?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/1355-stage/g1/`
  - `?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/1357-F3-parent-note-on-1357-R.md`
  - `?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/1357-R-rival-stall-diagnosis.md`
  - `?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/1358-D-rel-sliceB-red-r4-review.md`
  - `?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/1358-F4-parent-rulings-on-1358-D.md`
  - `?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/1359-X4-p15c-gp-probe-results.md`
  - `?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/1359-stage/gp/`
- Last commits:
  - 975e72a1 docs(p15): 1359-X3 and 1355-X3: both P15 producers dry-run clean at the Save43 HEAD
  - 26566be8 docs(p14b): 1358-X2 slice B r4 dry run equals 1358-C4; 1348-X7 slice A leaves the §7 natural routes byte-identical
  - e7f075ce docs(p14,p15): P14 closed (1344-K, §7 1344-V); P15 Wave 1 closed; P15B probe reads Re-tune (1357-X, 1357-F2)
  - b0809602 docs(p14b,p15): slice A landed (1348-L, recorded GREEN 89/92 with the 3 F6 exceptions); 1358-X/F3; 1356-D4 CONFIRMED; 1359 r5
  - c208d214 feat(p14b): relationship slice A production step 3 (1348-E; review 1348-J KEEP; 1348-F4, 1348-F5)
<!-- AUTO:END -->
