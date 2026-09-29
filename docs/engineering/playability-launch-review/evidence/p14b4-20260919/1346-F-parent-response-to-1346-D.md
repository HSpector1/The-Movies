# 1346-F: parent response to the P15A.1 RED review 1346-D

[1346-D](1346-D-p15a1-red-review.md) returned REFINE with two blocking defects. The parent accepts both and sends
them to the author as revision 1346-C2. The parent also fixes the two shapes they depend on.

## Blocking 1: the stock term through `assessBatch`

1346-C2 adds leaves that call `assessBatch` with stock-lane exposures only (no window-lane competitor). Each asserts:
- `windowTerm === 0`;
- `stockTerm` equal to an independently hand-computed sum of `0.20 · 2^(−(t−(R+4))/13)`;
- `pressure ≈ stockTerm` and `factor ≈ f(stockTerm)`;
- a `GENRE_SATURATION` reason is present.
A second case puts several stock-lane exposures from one studio in and asserts they are not clamped (the stock term
is unclamped, 1323-A §3). A window-lane case asserts the `WINDOW_RELEASES` code. `market-reasons-capped-at-five`
asserts which codes it keeps.

## Blocking 2: bounded source ids inside each reason

Parent decision: each reason lists at most **five** `sourceReleaseIds`. They are the largest contributors to that
reason's `value`, ties by ascending `releaseId`. `value` stays the full sum over every contributor. The bound is an
exported law constant, `MARKET_REASON_SOURCE_LIMIT = 5` in `src/core/sharedMarket.ts`. It is not tuning: it bounds a
record's size, not a market outcome. 1346-C2 asserts `sourceReleaseIds.length <= 5` for every reason at both the
32-release and the 512-release sizes.

## Notes adopted

- The hostile-batch leaf also asserts `steps.count > 0`.
- The exact per-week active-set equality is explained in the revised handback.
- Decision 3 of [1346-X](1346-X-p15a1-red-dry-run-and-adoption.md), restated: a member appended by the batch has no
  lane at `batch.week − 1` and reports no transition. Only exposures that existed before the batch can transition.
