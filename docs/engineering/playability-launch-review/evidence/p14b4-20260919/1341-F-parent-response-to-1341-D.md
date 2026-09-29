# 1341-F: parent response to the U2 dry-run review 1341-D

[1341-D](1341-D-u2-dry-run-review.md) returned REFINE with one blocking defect. [1341-X](1341-X-u2-dry-run.md) was
pushed at e8e62c52 and stays byte-frozen; this record governs where they differ.

## Blocking defect 1: the base-run 1124-A duration (corrected)

1341-X gives the base-run 1124-A failure as 572 ms in its table and in its Readings. The raw line,
[1341-X-ui-affected-base.txt](1341-X-ui-affected-base.txt) `:104`, ends in `3572ms`. The parent had read the
duration from a line cut at a fixed column, which dropped the leading digit. Corrected readings:

- base run: 1124-A fails its `findBy` wait for `dashboard-releases-heading` at **3,572 ms**, under the 5,000 ms
  default then in force;
- run 2 (edited config): the same failure at 3,748 ms.

Both failures are `findBy` waits, not timeouts, and both come before either test budget ends. The conclusion stands:
1124-A is not a timing row, and U2 claims nothing about it. "Far under either budget" overstated the margin for the
base run. Read it as "before either budget ends".

## Notes accepted

- 1341-B's Check 5 citation of 1336-F for 1124-A's mechanism is wrong, as 1341-X said. 1341-B's ACCEPT does not rest
  on it, because the classification rule holds on its own. No record has isolated 1124-A's mechanism.
- "The way the recorded gate runs them in parallel" means only that the four files ran in one Vitest command, which
  runs files in parallel workers, as the gate does. The worker count and load are not claimed to match the gate.

Application (1341-E) proceeds with the patch that 1341-D verified.
