# 1315-X3: parent scratch dry run of the casting-driver RED r3 (1315-C3)

Same scratch trees as [1315-X2](1315-X2-red-r2-dry-run.md) with the five 1315-stage3 files.

| Tree | Result | Log |
| --- | --- | --- |
| A, unchanged engine | 21 failed, 12 passed, 1 skipped | [head](1315-X3-red-r3-dry-run-head.txt) |
| B, Save42 draft | 3 failed, 30 passed, 1 skipped | [draft](1315-X3-red-r3-dry-run-draft.txt) |

Both r2 defects are fixed: the expiry signing order holds, and the frozen-reader leaf passes on both trees in the house
form. The three failures on tree B are one route defect: the expiry route calls `assignShootingDirector` on the first
loop pass, before the picture reaches Shooting ("productionId "prod-0008" is not in Shooting"). With the measured 1314-P
condition in place of `if (n === 0)` (assign and schedule when `remainingTicks <= 5`, the workflow exists and its
shooting task is not already scheduled), the parent's trial copy measured: tree B, all 3 expiry leaves pass; tree A,
the naming leaf fails for its stated reason ("expected 'If not renewed, current weekly salary…' to contain
'Inseparable'") and the synthetic-acceptance and committed-term leaves pass, as 1315-C2 disclosed. The trial edit is
not a staged file; 1315-C4 carries it.
