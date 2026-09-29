# 1351-X5: parent dry run of P15A.2 production r2 (1351-E2)

The run uses the same scratch tree as [1351-X4](1351-X4-red-r4-dry-run.md) (HEAD 5dddfebe + RED r4). The v1 commit was
reset away, and [1351-p15a2-production-r2.patch](1351-stage/1351-p15a2-production-r2.patch) (sha256 59e59377…) applies
cleanly in its place.

- RED r4 over r2: 35 of 35 pass in 2.48 s ([output](1351-runs/1351-X5-red-r4-over-production-r2.txt)).
- The v1-to-r2 source delta ([diff](1351-stage/1351-p15a2-production-v1-to-r2.diff), 38 lines) touches
  `src/core/powerRanking.ts` only. It moves the authored check into the window skip, so authored films count in no
  lane, and rewrites the header comment to match (1351-F).

P15A.2 production has had no implementation review yet: [1351-D](1351-D-p15a2-red-review.md) reviewed the tests. The
next step is independent implementation review 1351-J of the full r2 patch against the charter, RED r4 and the
writer's findings.
