# 1317-I: attribution of the recorded broad UI gate after the 1309 sweep

## Run identity

- Command: `node_modules/.bin/vitest run --project ui`, recorded by `run-bounded-source-c2.mjs` as
  [1317-r2r3-broad-ui](1317-r2r3-broad-ui.json) at source and HEAD cd79e85b (equal to the remote at preflight),
  18:54:07Z to 19:09:31Z, exit 1, empty tested diff. Bounded guards: `allGuardsExact: true`, `fixedSource: true`.
- Raw log: [1317-r2r3-broad-ui.txt](1317-r2r3-broad-ui.txt), 449,076 bytes, sha256
  834220b366bca074818ea096663e26e1a521592d446efb0345ea2dde842c6a9f.
- Tally: **8 failed files, 33 failed tests, 2659 passed, 5 skipped** (2697); no unhandled error. The
  `hollywoodPerformance is not a function` error seen in the 1101 baseline and in the 1309-X5 scratch run does not
  occur.

## Method

The 1302-I identity method. Both this raw and the 1303 raw are parsed by the same parser
([1317-I-attribution.py](1317-I-attribution.py)); cluster ids come from [1303-I](1303-I-failures.json). Run on the
1303 raw itself the script returns 31 RETAINED-SAME. Output: [1317-I-failures.json](1317-I-failures.json).

## Result

26 RETAINED-SAME, 1 RETAINED-CHANGED, 6 NEW; 4 of the 31 1303 identities no longer fail.

| 1303 cluster | Rows | Status |
| --- | --- | --- |
| C1 timeout 5000 ms | 7 | same |
| C2 World Inspector duplicate test id | 7 | same |
| C3 missing PIL (RGBA export) | 6 | same |
| C4 missing PIL (Stage A) | 4 | same |
| C5 P05A W2 Gate Hiring throw | 2 | same |
| C6 World Inspector TypeError | 1 | changed: now "Found multiple elements by `lot-nav-theater`", the C2 duplicate-test-id cause, in the same file |
| New against 1303 | 6 | see below |

No longer failing: the three C8 `StudioCalendar.career` rows (the test imports `tests/helpers/p14c3-fixtures.ts`,
whose live-writer literal the 1309 sweep moved to 41) and the C7 `livingTurn.parity` DOM race (passes this run).

## The six rows new against 1303

All six fail with "Unable to find an element by: [data-testid=\"studio-lot-screen\"]" or, once, the living-turn
bulletin.

- `livingTurn.scheduler` (5): `a NOTIFY-class wrap reaches the bulletin` (`:476`), then four later leaves at
  `mountLot`'s `findByTestId` (`:207`). Each follows the file's `auto-pauses on the FIRST PAUSE-class stop` leaf, which
  times out at 5000 ms here and at 1303 (C1).
- `WorldFirstLotNativeNextEventApp`, the file's first leaf (`keeps an exact non-release stop on one mounted world`,
  `:559`): the first Lot mount in the worker.

Measured, not assumed ([A/B extract](1317-I-ab-old-source-extract.txt)):

1. **Same failures on the 1303 source.** A scratch archive of 42f216e8, the source 1303 ran, run through the whole UI
   project after this gate, fails the same six identities (`livingTurn.scheduler` 6 of 13 including the C1 timeout;
   the NextEventApp first leaf), although 16 of its suites could not import (`tests/` was not archived) and the run
   carried less load.
2. **Production did not move the quantities these leaves depend on.** The pause-class runway of
   `operatingStudio('living-turn-pause-class')` is 4 weeks with stop `productionDecision` on both sources. App boot to
   `studio-lot-screen` measures 1161 ms (current) and 1275 ms (42f216e8) for the first, cold mount of a worker and
   116-262 ms warm on both.
3. **The files pass alone.** `livingTurn.scheduler` and `StudioLotScreen` pass 74 of 74 run by themselves on the
   current tree (1309-X5).

Reading (the mechanism is inferred, not isolated further): the cold first mount (about 1.2 s) races `findBy`'s
default 1000 ms timeout, and under full-suite load the `auto-pauses` leaf exceeds 5000 ms; Vitest does not cancel a
timed-out async body, so it can still be winding the clock while the next leaves mount. Point 1 shows the outcome
does not depend on the source under test. The six rows are attributed to the
C1 timeout family (test time budgets under load), a retained 1303 cause, and not to R2/R3, Save41, projection 56 or the
1309 sweep. The C1 family stays open with its owner; a fix is a test-side time budget (an explicit timeout on the
slow leaves and on `mountLot`'s first `findBy`), outside this increment.

## Disposition

No UI failure is attributable to the R2/R3 increment or to the sweep. Together with [1316-I](1316-I-broad-core-attribution.md)
this supports closing R2/R3 after an independent review of both attributions.
