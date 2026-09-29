# 1336-F: parent response to the U1 gate attribution review 1336-J

[1336-J](1336-J-u1-gate-attribution-review.md) returned REFINE with one blocking defect. 1336-I stays byte-frozen;
this record governs where they differ.

## Blocking defect 1: the `livingTurn.parity` mechanism (corrected, and the missing rerun performed)

1336-I row 1 says "This is the M1 cold-mount race of 1335-A cause 3". That overstates the evidence. 1303-I recorded this
identity with cause class unknown, pending an isolated rerun on unchanged source. No record ran that rerun, and
1335-A's measured M1 set is three other files. The Disposition's "M1-like" also disagrees with the bullet.

The parent ran the rerun 1303-I asked for, after the gate on HEAD ba86bba3 (UI-project source equal to the 1336 gate
source; `livingTurn.parity.test.tsx` untouched by U1). The file ran by itself three times
([1](1336-F-parity-solo-run1.txt), [2](1336-F-parity-solo-run2.txt), [3](1336-F-parity-solo-run3.txt)). All three
runs pass 7 of 7. "(a) by hand at the seam" takes 3,566 ms, 3,720 ms and 3,597 ms.

Corrected reading of row 1:

- **measured:** the leaf fails under full-suite load at its first `studio-lot-screen` wait (`:110`, `findBy`'s 1000 ms
  default). It passes alone, 3 of 3 on unchanged source. Its failing primary equals 1303's C7 row. Its mount helper has
  the M1 code shape: an unguarded first wait, and no import of `StudioLotScreen`, which `App.tsx:239` loads lazily;
- **inferred, not isolated:** that the failing wait is the cold lazy-chunk race 1335-A measured in the three M1 files.
  The measured facts show the failure depends on load, not on the source; they do not isolate which step outruns the
  wait.

The Disposition's "two of those three are 1000 ms `findBy` waits (M1-like)" is read the same way: M1 code shape,
mechanism inferred.

## Non-blocking notes

- The tree-equality and no-config-change claims are not checkable read-only. The parent verified the applied files
  against the dry-run tree with `cmp` at application (1335-E commit message), and `git diff --stat` at 88eb90d9 lists
  only the six UI test files and two docs records.
- Rows 2 and 3 stand as written.
