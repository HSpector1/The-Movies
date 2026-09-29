# 1346-X: parent dry run of the P15A.1 Wave 1 RED, and the three API decisions it asked for

## Dry run

The parent built a scratch tree at HEAD 8b984d12 by the 1327-C method and applied
[1346-p15a1-red.patch](1346-stage/1346-p15a1-red.patch) (sha256 b26b204d…, 2 files, 746 insertions: `tests/p15a1-shared-market.test.ts`
and `tests/p15a1-shared-market-harness.test.ts`). The base moved from the author's ea65e796 to 8b984d12; in between,
only U3's three-line test-double fix touched a file under `src/`, `tests/`, `ui/` or `bridge/`.

- [Run](1346-X-red-run.txt): exit 1, **27 of 27 leaves fail**, counted from the per-leaf summary lines:
  - 26 with "Failed to load url ../src/core/sharedMarket.js", the missing module;
  - `market-tuning-bounded-terms` with "expected undefined to deeply equal [ 1, 0.55, 0.55, 0.2 ]", because the TUNING
    key is absent.
  No leaf passes vacuously.
- [Root type gate](1346-X-tsc.txt): exit 2 with exactly two errors, both `TS2307: Cannot find module
  '../src/core/sharedMarket.js'`, one per new file.

This matches the author's handback [1346-C](1346-C-p15a1-wave1-red-handback.md).

## Parent decisions on the three unpinned shapes (1346-C findings)

1. `exposureWeight` returns `weight: 0` with `lane: 'retired'` at `t >= R + 26`. A retired release counts for nothing.
2. `MarketReason = { code, sourceReleaseIds: string[], value: number }`, with `code` among the five pinned values.
3. `reduceExposures(exposures, batch)` reports a transition for an exposure whose lane at `batch.week - 1` differs
   from its lane at `batch.week`. The result follows from `releaseWeek` and those two weeks only, with no memory of
   earlier calls.

All three follow 1323-A/F and the Owner's D-1323-1 text. None changes a formula term.

Next: independent review of the RED (1346-D). Production (sim-core, `src/core/sharedMarket.ts` plus the TUNING keys)
is staged in parallel against 1323-A/F and these decisions. The writer changes no test.
