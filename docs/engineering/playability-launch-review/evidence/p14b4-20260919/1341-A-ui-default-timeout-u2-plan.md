# 1341-A: UI repair U2, the UI project's default test time budget (D-1339-1)

The Owner approved this change on 2026-09-29 ([1340-O](1340-O-owner-rulings-20260929.md), ruling 2): the UI
project's default `testTimeout` becomes 30,000 ms in the repository's existing Vitest config. The Owner cited the
recorded UI durations of 5.6-24.8 s ([1336-I](1336-I-broad-ui-attribution.md)). The ruling calls this test-harness
stabilization. It is no evidence of in-game performance and no Unity or UI acceptance.

## Measured cause

- 34 UI test files mount the full `App` (`render(<App`). Under full-suite load their leaves run close to Vitest's
  5,000 ms default, and a different leaf crosses it in each gate ([1339-I](1339-I-broad-ui-attribution.md)):
  - 1331: 34 failures;
  - 1334: 26 failures;
  - 1336: 13 failures after U1's per-leaf budgets;
  - 1339: 14 failures after T1.
- The three time-budget rows of 1339 are first leaves with no budget of their own:
  - CastingReview "reviews all six …", 9,178 ms (6,914 ms in 1334, 6,904 ms in 1336);
  - World Inspector "never navigates …", 6,114 ms (4,373 ms in 1334, 4,523 ms in 1336);
  - the World Inspector duplicate-element cascade that follows the second one.
- The UI project block of `vitest.workspace.ts` sets no `testTimeout` (`:24-32`), so every UI leaf without a
  budget of its own gets 5,000 ms.

## Rules

1. One edit: `vitest.workspace.ts`, the `ui` project's `test` block gains `testTimeout: 30_000`, with a comment
   citing D-1339-1, 1340-O and the recorded durations.
2. Unchanged: the `core` project block (core and Bridge budgets), `hookTimeout`, and Testing Library's `findBy`
   wait (`asyncUtilTimeout`, 1000 ms, a separate mechanism). Every explicit per-leaf budget and M1 first-mount wait
   from U1 and T1 stays as written. No retries, no disabled timeouts, no assertion edits, no test file edits.
3. Classification after the gate:
   - a row whose earlier primary was "Test timed out in 5000ms" and that passes after U2 is reported as passing
     under the 30 s default, with its duration;
   - any other row keeps its own cause. The 1124-A NextEvent row had a `findBy` failure as its primary in 1336 and a
     5 s timeout in 1339. It stays its own open intermittent, and U2 claims nothing about it;
   - a new failure is attributed on its own evidence.

## Verification

1. Scratch dry run (1327-C scratch method), parent:
   - **config reaches the UI project:** a scratch-only probe under `ui/` that awaits 6 s fails without the edit and
     passes with it;
   - **core default unchanged:** the same probe under `tests/` fails with the edit (core default 5,000 ms);
   - **affected UI checks:** with the edit, each whole file run once, durations reported:
     `WorldFirstLotNativeCastingReviewApp`, `WorldFirstWorldInspectorDefault`, `WorldFirstLotNativeNextEventApp`
     and `livingTurn.parity`;
   - the probes are deleted from the scratch tree afterwards and never enter the repository.
2. Independent review of the plan (1341-B) and of the dry run (1341-D).
3. Application: the one-line edit, `cmp` against the dry-run tree.
4. Recorded broad UI gate (the 1339 command, bounded guards, empty tested diff). Attribution with the unchanged
   [1317-I-attribution.py](1317-I-attribution.py), compared with 1339 by identity and primary. Every count names its
   baseline.
5. The core project is not re-gated: the edit changes only the `ui` block, and the dry run's core probe shows the
   core default unchanged.
6. Review of the attribution, closure record, handoff update and push. The 1331-1339 failure records stay as
   evidence.
