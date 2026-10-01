# 1355-F5: parent ruling on the r2 confirmation (1355-D2, NOT CONFIRMED)

[1355-D2](1355-D2-p15a1-wave2-red-r2-confirmation.md) confirms R1, R2, R3 and the "Also adopted" list of
[1355-F4](1355-F4-parent-response-to-1355-D.md). It finds R4 unsound and one handback claim overstated.

## 1. Phase tables are read by row version, through the export (binds every P15 root)

**The defect.** The r2 phase leaf mocks `p15Phases.js` and also replaces `p15PhaseMatches`. A production helper that
pins every row to the live version therefore still passes the leaf. A helper that closes over the module's internal
table cannot see a version the test adds, so the leaf proves nothing about reinterpretation.

**Ruling.**
- Every P15 validator resolves a row's phase entry as `P15_PHASE_TABLES[row.phaseOrderVersion]`, read through the
  module's exported binding. No helper closes over the module's internal table.
- The phase leaf mocks `p15Phases.js` with `importOriginal` plus one added version-2 table, and replaces nothing else.
  A row declared under v2, with v2's ordinal, must validate.
- A validator that pins rows to the live version, or reads a private table, fails.

This is 1355-F2 item 3's law made testable: rows keep the version they were written under, and versions are added,
never rewritten. 1356-C's module may still freeze each table object. Only the lookup path is fixed. 1356-C's and
1359-C's references follow the same rule when their productions land.

## 2. The capture assumes one shared step

The handback's claim that the RED "holds whether the roots share one save step or land at separate steps" is true of
the pins, not of the capture. The shared capture directory `tests/fixtures/p15/genuine-below-p15-save-step/` serves
one shared step only.
- The handback states that.
- If the roots land at separate steps, each step's production mints its own capture below its own step, at its own
  path, and the reading leaves are re-pinned then.

## Next

r3 from the test author (items 1-2 only), then a confirmation review.
