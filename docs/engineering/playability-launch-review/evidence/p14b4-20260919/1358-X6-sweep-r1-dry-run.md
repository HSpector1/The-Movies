# 1358-X6: parent dry run of sweep r1 (Save44 and projection 57), with the message probe

This run measures sweep revision r1 ([1358-F10](1358-F10-parent-rulings-on-sweep-handbacks.md)) on HEAD plus production
step 4 r2.
- **Type gates:** all three now exit 0.
- **Slice B files:** they read as the GREEN must: every slice B leaf passes, and only the three 1344-F6 row 6 exceptions
  fail.
- **UI:** the gate equals 1348-I2's three numpy rows.
- **The message probe** measured the first guard at 34 S8 and S9 sites. It found 15 sites where Save44's romance
  refusal now fires first.
- **The core run's output was lost.** A parent edit to the running script destroyed it (see "The core run"). The next
  full dry run (1358-X8) measures core.

## How it ran

- **Script.** [run-1358-sweep-dry.sh](1358-stage/sweep-r1/run-1358-sweep-dry.sh) `x6 sweep-x6.patch probe.patch
  probe-files.txt`, alone in the heavy lane under `HEAVY-LANE-LOCK`, on 2026-10-02 from 04:35:16 to 06:23:29 CDT, Node
  v20.20.2.
- **Tree.** An archive of HEAD 768fc628, whose source equals 5245072a's. Step 4 r2 (2004b500…) and then the sweep patch
  (cbc8ee00…, 154 test files, +674/-599) were applied and committed. `docs`, `node_modules`, `art`, `tools` and
  `tests/fixtures` were linked, and nothing was written under a link.
- **The probe** ([probe.patch](1358-stage/sweep-r1/probe/probe.patch), 35 logging lines in 19 files, the 1344-X12
  form). It was applied after the slice B run, run once over its 19 files, and reversed. The tree then read clean.

## Results

| Stage | Result |
|---|---|
| Type gates (root, UI, Bridge) | exit 0, 0, 0; **0 errors** (step 4 alone: 46, 2, 2) |
| `check:bridge-contract`, `check:bridge-contract:fixtures` | exit 0, exit 0 |
| Six slice B files plus `p14b10-mentor-label` | **154 passed, 3 failed** (157) |
| Message probe, 19 files | 378 passed, 36 failed (414); 249 probe lines |
| Core, 440 files | **lost** (below) |
| UI | 2,689 passed, 3 failed, 5 skipped (2,697) |

- **Slice B files.**
  - Each of competitions-log, labels, save-v44, romance, `p14b10-mentor-label` and the Bridge labels file passes every
    leaf. That includes rows 59-61, the three Mentor leaves.
  - The three failures are the 1344-F6 row 6 exceptions in `p14b5-relationships` (`expected [] to deeply equal [
    'studio-aca408ec-r01:film:6' ]`).
  - The first Mentor leaf took 52,798 ms, against 1358-X3's 49,182 ms and the 240,000 ms budget.
- **UI against 1348-I2:** CHANGED 3 and NEW 0. The three changed rows are the numpy rows, whose primaries differ only in
  the scratch path. M2's two extra UI rows passed here: `StudioLotScreen` focus is 1344-M2's intermittent, and
  `WorldFirstAnnexConstruction` :584 is a second intermittent.

## The message probe

[probe-parsed.json](1358-stage/sweep-r1/x6-probe-parsed.json) holds every logged line.

- **Save44 now fires first at 15 sites,** each with `migrateToV43: cannot downgrade or discard the romance of
  relationship-edge-N` (`src/core/save.ts:10790`):
  - `p14p4p5-opportunities:814`;
  - `p14p4p5-screenplay-status:324`, the test 1344's comments named as covering the V39 guard;
  - `p14r3-save-v41:374`;
  - `p14p3-directing-promises` :361 and :689;
  - `p14c2s-scientist-retirement:279-280`;
  - `p14c2rm-writer-continuation:254`;
  - `p14c3-cohort-transition:287`, `p14c3-dual-extensions:178` and `p14c3-offmenu-extensions:235`;
  - `p13b-s8-save-v27` :188 and :195;
  - `p14c2b-save-v36` :74 and :82.

  Under Save43 the shelving guard or the V39 guard fired first at most of these.
- **Guard order unchanged:**
  - the family-10 downgrades in `p14b5-relationships` (:1399-1452), `p14c3-profession-history:119` and
    `p14c3-transitions:175` still meet the Save43 shelving guard first;
  - `p14c3-transitions:207` still meets the V37 guard;
  - the production chains at `p06a-w1-release-authority:447` and `p13b-s3-save-v23:115-117` still meet the V39 guard.
- **Bare `.toThrow()` sites (S8):** every case reaches its own field's guard, never a version check.
  - H-new-1 logged 102 cases, each a `validateSaveV38` guard naming the mutation.
  - G5-new-7 logged 32 and the finding-17 leaves 20. G6-new-4 logged 15 and G6-new-5 24.
  - N-0096 logged 20, each a `validateSaveV44` relationship guard.
- **Projection chains:**
  - `p14p3-directing-promises:387` (D13) refuses on edge 0's romance. It is a chain that must succeed, so the leaf
    returns to the parent (1358-F9 ruling 2).
  - D14 fails earlier at :407 on a whole-state comparison (S5), so the probe never reached :438.
- **Swept-tree failures in the 19 probed files:** 21 are retained 1348-I identities (the three row 6 exceptions, D07,
  D18, C20 and 15 `p14b1-t4-regressions` premise rows). The other 15 are the S9 and S5 leaves above.

## The core run

- **What happened.** At 05:27, while core ran, the parent edited `run-1358-sweep-dry.sh` to add a targeted mode for
  1358-X7t. Bash reads a script as it executes. When the core command finished at 06:10:32, bash resumed at a stale
  byte offset. It read the core line again, one character short (`ode_modules/.bin/vitest`, exit 127), and that line's
  redirect truncated `core.txt` to the error.
- **What it means.** The 82-minute core run's results are gone. The UI stage ran normally after it.
- **Rule since then.** A running or queued job's script is never edited; changes go to a versioned copy (parent memory
  `never-edit-running-script`).

## Follow-up

- **Units F1 and F2** turned the probe into edits. They added S9 pins, S8 pins, own-era cover for the V27, V36, V39 and
  V41 guards and the Scientist guard, and the S5 helpers at D14, Q04 and `p14c3-save-v38:87`.
- **The parent applied G3's and G6's S5 drafts** and lifted the `p14d1-rival-shelving` week-93 control through
  `convertV43ToV44`, with a probe deciding F10 ruling 9.
- **1358-X7t** answers F1's and F2's open questions on a targeted set. 1358-X8 then runs everything.
