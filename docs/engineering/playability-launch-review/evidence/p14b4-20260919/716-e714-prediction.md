# 716 — the E714 full core, predicted BEFORE it is started

Registered at source `5ba2b8d6`, clean tree, pushed and verified, before the run begins.

## Basis

Run 712 observed, on `fc37bd27` with `fixedSource: true`: 9 files failed / 343 passed (352);
24 failed / 3971 passed / 8 todo (4003). Its failure identities were the 695 set exactly.

E714 adds ONE file, `tests/bridge-p14b6-e714-false-empty-absence-lines.test.ts`, carrying
SEVEN cases, all passing when run targeted. It changes one production file,
`bridge/relationships.ts`, +64/−3, all of it inside the copy constants, one new private
helper, and the two `line` selections.

## Predicted

| quantity | predicted |
| --- | --- |
| test files | 9 failed / 344 passed (353) |
| cases | 24 failed / 3978 passed / 8 todo (4010) |
| exit code | 1 |
| `fixedSource` | true, `testedDiffSha256` the empty-tree hash at both ends |

Failure IDENTITIES predicted to be the 695/712 set exactly: nothing new, nothing vanished.

## What each falsification would mean

IF A B.6 SIBLING SUITE FAILS, the copy change reached an assertion the targeted run did not
exercise, and the writer's static clearance of `:525`, `:613` and `:603-605` was wrong.
IF ANY OTHER FAILURE APPEARS, the change is not as bounded as +64/−3 in one projector suggests.
IF THE PREPARED-REUSE TIMEOUT RETURNS, it is INVESTIGATED per the corrected rule in record 706
and the measurement in 711. Neither an engine defect nor environmental noise is a default.
IF THE COUNTS MATCH BUT AN IDENTITY MOVED, the counts were a coincidence and the identities
govern.

## A limit on this prediction, stated in advance

Record 713 established that this repo's UI suite is not deterministic run to run. Nothing
measured there implicates the core suite, whose failure set has now reproduced identically
across 695, 703 and 712. But a matching count is weaker evidence than it appears, and the
identity-and-cause comparison is what this run will be judged on.
