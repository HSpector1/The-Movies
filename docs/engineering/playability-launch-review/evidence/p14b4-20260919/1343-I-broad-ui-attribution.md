# 1343-I: attribution of the recorded broad UI gate after UI repair U2

## Run identity

`vitest run --project ui`, recorded as [1343-u2-broad-ui](1343-u2-broad-ui.json) at source and HEAD 6b73e424 (equal
to the remote at preflight). It ran 21:07:06Z to 21:25:39Z, exit 1, empty tested diff, `allGuardsExact: true`,
`fixedSource: true`. Raw [1343-u2-broad-ui.txt](1343-u2-broad-ui.txt), 241,311 bytes, sha256
1583fe8f7f357dd802bce6c7544fcf65ad5180f36aff3f99c4c3ba3fa8ed2b3e. Tally: **2 failed files, 10 failed tests, 2682
passed, 5 skipped** (2697), and **1 unhandled error**.

## What changed under the UI project since 1339

Only U2: `vitest.workspace.ts` gives the `ui` project `testTimeout: 30_000`
([1341-u2.patch](1341-stage/1341-u2.patch), applied at 6b73e424, equal to the [1341-X](1341-X-u2-dry-run.md) dry-run
tree). No test, production, fixture or setup file changed. The Pillow environment of [1345-A](1345-A-pillow-scoped-environment-plan.md)
was not installed, so the environment matches 1339.

## Result ([1343-I-failures.json](1343-I-failures.json), script [1317-I-attribution.py](1317-I-attribution.py) unchanged)

- Against 1303 (the script's reference): 10 RETAINED-SAME, all `python3` without Pillow:
  - `authored-rgba-export.test.ts`, 6;
  - `authored-stage-a.test.ts`, 4.
- Against 1339 (14): **4 gone, 0 new.**
  - The three time-budget rows pass under the 30 s default:
    - CastingReview "reviews all six event-owned observations …", 7,035 ms (9,178 ms and a timeout in 1339);
    - World Inspector "never navigates from any of the nine places …", 5,450 ms (6,114 ms and a timeout in 1339);
    - World Inspector "lands the generic inspector …", 3,936 ms. In 1339 it was the duplicate-element cascade of the
      row before it.
  - 1124-A, NextEvent "preserves the exact live-world reaction …", passes in 7,152 ms. U2 claims nothing for it. It
    failed its `findBy` wait before either budget ended in 1336 and in the dry run
    ([1341-F](1341-F-parent-response-to-1341-D.md)). It remains an open intermittent that passed this time.

## Durations (the Owner asked for actual durations)

Leaves at or above 5 s, with each leaf's own budget read from its source:
[1343-I-slow-leaves.tsv](1343-I-slow-leaves.tsv), 51 leaves.
- **21 async leaves on the default budget took 5.0-8.7 s, and all passed.** The slowest is SceneryLoadIn
  "re-announces identical stale-clear rejections …" at 8,709 ms, 29% of the 30 s default. Under the old 5 s default,
  Vitest could have cut off any of these at a yield point.
- Leaves with their own budgets:
  - NextEvent "orients a cash stop …", 24,865 ms of its U1 30 s (83%). It took 22.3 s in 1339 and 24.8 s in 1336.
  - `livingTurn.parity` "exports FOUR byte-identical saves …", 27,714 ms of its 120 s.
  - The parity arms, 11.1-15.9 s of 60 s.
- Synchronous bodies run to completion whatever the budget:
  - `m5-determinism` "and the batch verb never mints a wrap there either", 300,268 ms (258,743 ms in 1339);
  - three others at 16.7-19.3 s.
  No timeout can interrupt a synchronous body, so the budget change does not govern them.
- One row's budget did not parse (`WorldFirstStudioHome` "preserves topbar focus …", 5,541 ms, passed).

## The new unhandled error

```text
TypeError: viewRef.current?.hollywoodPerformance is not a function
 ❯ Timeout._onTimeout ui/src/lot/StudioLotScreen.tsx:4854:37
This error originated in "ui/src/lot/StudioLotIdentityReview.test.tsx" test file.
```

- **First appearance.** No earlier recorded UI gate shows it: 1303, 1317, 1322, 1326, 1331, 1334, 1336 and 1339
  each record zero unhandled errors.
- **Measured in source.**
  - `StudioLotScreen.tsx:4851-4855` polls `viewRef.current?.hollywoodPerformance()` every 500 ms while `hollywood`,
    `identityProof` and `canvasReady` hold.
  - The test's fake view (`StudioLotIdentityReview.test.tsx:22-47`) has no `hollywoodPerformance` method.
  - Eight other fake views in `ui/src` define `hollywoodPerformance() { return null }`, among them
    `WorldFirstLotNativeCastingReviewApp.test.tsx:88` and `livingTurn.scheduler.test.tsx:70`.
  - The throw can happen only when a mounted Lot in that file lives past one 500 ms tick.
- **Inferred, not isolated.** The file took 5,438 ms here, against 3,834 ms in 1336 and 4,164 ms in 1339. A slower
  run gives the interval time to fire. U2 changes no timer. No leaf in this file came near 5 s, so the new default
  did not lengthen any leaf here. The parent has not reproduced the throw.
- **Disposition.** This is a demonstrated defect in a test double, and it gets its own test-only repair (U3). The
  gate's 2682 passes stand; Vitest's warning that an unhandled error "might cause false positive tests" applies to
  the leaf named in the message, which U3 re-runs.

## Disposition

U2 removes the three time-budget rows of 1339 and adds no failing test. The UI gate fails only the ten Pillow rows,
which the scoped environment of 1345-A addresses next. One unhandled error is new and goes to U3. This is test-harness
stabilization only. It is not evidence of in-game performance or of Unity or UI acceptance.
