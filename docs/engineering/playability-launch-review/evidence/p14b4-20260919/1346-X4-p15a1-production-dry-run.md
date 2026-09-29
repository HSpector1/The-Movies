# 1346-X4: parent dry run of the P15A.1 Wave 1 production, and rulings on the writer's findings

## Dry run

The scratch tree was at HEAD 1d4275c0 with [RED r3](1346-stage/1346-p15a1-red-r3.patch) committed on top. The parent
then applied [1346-p15a1-production.patch](1346-stage/1346-p15a1-production.patch): sha256 ed343684…, 2 files, 411
insertions. They are the new `src/core/sharedMarket.ts` (398 lines) and 13 lines in `src/core/tuning.ts`.

- [Run](1346-X4-green-run.txt): the two P15A.1 files pass, **33 of 33**.
- Type gates, all exit 0 and empty: [root](1346-X4-tsc-root.txt), [UI](1346-X4-tsc-ui.txt),
  [Bridge](1346-X4-tsc-bridge.txt).
- No test under `tests/` or `ui/src` enumerates `TUNING`'s keys (`Object.keys` or `Object.entries` of `TUNING`), so
  the seven new keys move no roster pin.

## Rulings on the writer's findings ([1346-E](1346-E-p15a1-production-handback.md))

- **F1, the open floor.** The charter describes the factor as "bounded in (0.75, 1]". In floating point the formula
  reaches exactly 0.75 once P exceeds about 72. Production then returns the next representable number above 0.75,
  which differs from the plain formula by about 1.1e-16. The parent keeps this: the tests pin the charter's stated
  range, the deviation is below any money rounding, and the source says what it does. The implementation review may
  challenge it.
- **F2, `STUDIO_CLAMPED.value`.** Deferred to the Wave 2 charter. No reason is persisted or shown before Wave 2. The
  writer used the capped studios' raw window sum.
- **F3, the index export.** Not added. Nothing consumes the module until Wave 2, and 30 core modules already sit
  outside the index. This supersedes 1323-A §5's "one index export".
- **F4, the version rule.** Adopted. Any change to a `SHARED_MARKET_*` constant or to the law bumps
  `SHARED_MARKET_DEFINITION`.
- **F5, one reason per code.** Left to the implementation review (1346-J), which decides whether an assertion is
  needed.
