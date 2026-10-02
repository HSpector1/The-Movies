# 1358-F9: parent rulings on the 1358-N draft (Save44 and projection-57 sweep)

The planner's draft of [1358-N](1358-N-save44-pin-sweep-plan.md) and its census read HEAD 5245072a on 2026-10-02. The
census holds 685 rows in 156 files: 625 certain, 60 to measure. These rulings answer the draft's nine questions and set
how the authoring runs while 1358-M2 holds the heavy lane.

## Rulings

1. **Which run decides each measure row.** Adopted as drafted.
   - M2 decides the 17 S5 rows, the 6 S10 rows, and the S9 leaves that reach a production `migrateToVnn` chain.
   - The parent's sweep dry run decides the 5 S8 rows and the S9 rows behind test-side chains. M2's tree stops those
     chains at "expected version 43".
2. **A projection chain that refuses.** No unit strips `competitions` or `romance` to make a chain pass. If the dry run
   shows `convertV44ToV43` refusing one of the nine projection chains, the unit returns that leaf to the parent with the
   measured refusal. The precedent at `tests/helpers/p14c4-fixtures.ts:64-69` (records 840 and 975) governs: refuse
   rather than strip a current root.
3. **`p14b9-save-v42:207`: keep the coverage.** The leaf takes the S9 form: its live-chain assertion names the measured
   first guard, `convertV44ToV43`'s log refusal. It also keeps one assertion that calls `convertV42ToV41` on the V42
   state the test builds before the lift, so the casting-competition guard stays covered on its own era's input. If the
   file cannot build that state without a greenlight on a V43-shaped state (1358-J finding 16), the unit returns the leaf.
4. **1358-J's 3i labels: confirmed.** The four bare `.toThrow()` leaves at `p14c2rm-writer-continuation` :218, :232,
   :241 and :242 are S8. `p14c2rm-writer-continuation:254` and `p12-starting-world:52` are S9.
5. **Titles: confirmed.** The sweep renames the 17 titles whose bodies move and leaves older stale titles alone. Each
   rename is a new identity, recorded old and new.
6. **S5 helper: one per file.** Each file gets `withEmptyCompetitionsAndRomance` beside its `withSharedCompetitions`,
   as 1344-D4 accepted for Save43.
7. **Retained rows with moved primaries: confirmed.** The five S10 retained rows, C20 among them, get no edit. The gate
   compare attributes each changed primary.
8. **The six 1296-A Owner-input files stay outside the sweep,** with their stale pins.
9. **P15C's `BASE_LIVE_SAVE_VERSION = 43`** (integration test :151) moves at the P15C rebase, not in this sweep.

## How the authoring runs

- **All seven groups author now, in parallel.** The file sets are disjoint. 1358-F8 ruling 7's order governs which
  moves come first inside a group and which rows the parent measures first. Each author takes only its group's
  `certain` rows. `measure` rows go to the author's deferred list for follow-up units after M2 and the sweep dry run.
- **Authoring base.** Each group works in its own git worktree of the planner's scratch repository at tag `step4`
  (5245072a without `tests/fixtures`, plus step 4 r2, 8e02a44). Each produces a tests-only diff against `step4`, which
  applies to HEAD because step 4 touches no test file.
- **No test, type gate or node process** while M2 holds the lane. Concurrent load would add timeouts to M2's
  attribution. The parent runs every measurement.
- **The sweep dry run** merges the seven branches and runs, in order:
  1. the three type gates and both generator checks;
  2. the six slice B files and `p14b10-mentor-label`, the x1 content;
  3. core over the 440 files;
  4. UI.
- **P4.** F10 and F11 wait for the recorded producer run on the production commit. G2 leaves both rows deferred.
