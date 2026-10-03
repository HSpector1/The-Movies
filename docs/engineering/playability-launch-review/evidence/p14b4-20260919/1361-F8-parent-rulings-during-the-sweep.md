# 1361-F8: parent rulings during the Save45 sweep's authoring

The test authors of [1361-N](1361-N-save45-pin-sweep-plan.md)'s units asked these questions while they wrote. The
rulings sit under [1361-F7](1361-F7-parent-rulings-on-1361-N.md) and apply to every unit.

## Rulings

1. **A reader-only control strips the P15 roots unconditionally** (G1, `tests/p14c2s-scientist-retirement.test.ts:325`).
   - **What the block does.** It compares what one reader sees, and it already deletes later-era fields
     (`firstTakeSubjects`, `romance`) unconditionally.
   - **Why the guard is wrong here.** The state lawfully ticks past quarters 533, 546 and 559, so its archive holds
     three records, and 1361-F7 ruling 4's guard would turn the leaf red without a defect.
   - **The form.** `stripP15` from `tests/helpers/p15-roots.ts`, with no `p15Rows` or `next` guard, and a comment
     citing this ruling.
   - **The boundary.** The guard of ruling 4 stays everywhere a comparison could hide a P15 regression.
2. **The week-93 control keeps its four named keys** (G1, `tests/p14d1-rival-shelving.test.ts:618`).
   - **Why.** 1361-F7 ruling 5 gives each root its own check before the strip.
   - **What follows.** A later P15 root therefore fails this control by name until its own check joins, which is the
     wanted, loud result.
