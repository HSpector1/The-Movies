# 1337-F: parent response to the T1 implementation review 1337-D

[1337-D](1337-D-t1-review.md) returned REFINE with two required changes. Both concern the staging records, not the
patch: 1337-D accepts the test-file content on rules 1-5. 1337-C and the classification stay byte-frozen; this record
governs where they differ.

## Required change 1: the parity wait's line numbers

1337-C says the wait "stays strictly before `vi.useFakeTimers()` (`:112` in the edited file)" and that the call's line
position did not move. The hunk (`@@ -107,7 +107,12 @@`) adds five lines net. In the edited file the wait is at
**`:115`** and `vi.useFakeTimers()` at **`:117`**. The two calls keep their order; their line numbers move by +5.

## Required change 2: which leaves the parity wait governs

The classification's `leaf` field and 1337-C say the `mountLot` wait is used by all seven leaves. The parent read
the file: `mountLot` (`:107`) is called by **five** leaves: "(a) by hand at the seam" (`:225`), "(b) by the living
loop at 1×" (`:239`), "(b′) … at 4×" (`:250`), "(c) paused and resumed arbitrarily" (`:260`) and "exports FOUR
byte-identical saves" (`:314`, `:328`). Two leaves never mount `App`: "(d) batch-skipped" (`:300`) and "runs
byte-identically with the theater READ every week and with it never read" (`:347`). The edit does not affect them.

## Non-blocking notes

- 1337-X's "load roughly doubles them" understates D17: its multipliers are 2.25× (D15), 2.38× (D16) and 3.09× (D17).
  The largest measured full-suite duration, 139,426 ms, stays under half the new 300,000 ms budget.
- The type-gate exit codes in 1337-C and 1337-X have no saved transcript; both runs printed nothing and exited 0. The
  recorded gates after application do not re-run `tsc`. The parent runs the root, Bridge and UI type gates at the
  application commit and records them in the closure.

Next: application (1337-E) and the recorded core and UI gates.
