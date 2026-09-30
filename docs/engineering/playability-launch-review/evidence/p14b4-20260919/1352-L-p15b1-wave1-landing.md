# 1352-L: P15B Wave 1 landed (pure laws `corporate-condition/v1` and `studio-loan/v1`)

Status: **IN PROGRESS**. The broad gates that follow the Save43 sweep serve as this wave's broad gates.

## Commits

| Commit | Content |
|---|---|
| 5bb8d559 | RED r3 tests: `tests/p15b1-corporate-condition.test.ts`, `tests/p15b1-studio-loan.test.ts` (52 leaves) |
| (run artifacts) | recorded RED `1352-p15b1-red-recorded` |
| 3b2dc509 | production: `src/core/corporateCondition.ts`, `src/core/studioLoan.ts`, ten TUNING keys |

Both patches were applied with `git apply --index` from the reviewed staging files. The two modules and both test
files equal the writer's scratch tree byte for byte. `tuning.ts` differs only by the shelving keys that landed after
the writer's base (abfcd580), and its production hunks are identical.

## Recorded runs (HEAD equal to remote at each)

- **RED** `1352-p15b1-red-recorded` at 5bb8d559: **52 failed of 52**. `fixedSource: true`, every guard exact.
- **GREEN** `1352-p15b1-green-recorded` at 3b2dc509: **52 passed of 52** in 1.62 s. `fixedSource: true`, every guard
  exact.

## Type gates ([1352-L-type-gates.txt](1352-L-type-gates.txt))

Root, UI and Bridge each exit 2, with 19, 2 and 2 errors. Every error is a `SaveFileV42`/`SaveFileV43` mismatch in a
test file: the known Save43 fallout (1344-M, 1358-C F1), and the same count the 1353-C4 author measured at c614b7e9.
The landing adds no type error. The Save43 sweep clears them.

## Carried

- Into the P15B Wave 2 RED (1357-F): the four items of 1352-F3 and the 1355-F2 sequence fields.
- Nothing imports either module yet. Wave 2 wires them in.
