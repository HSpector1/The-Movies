# 1346-X6: parent dry run of P15A.1 production r2 (1346-E2)

The run uses the same scratch tree as [1346-X5](1346-X5-red-r4-dry-run.md) at HEAD 8e8a4e56 + RED r4. The v1 commit
was reset away, and [1346-p15a1-production-r2.patch](1346-stage/1346-p15a1-production-r2.patch) (sha256 3924b0b1…)
applies cleanly in its place.

- RED r4 over r2: 35 of 35 pass in 5.71 s ([output](1346-runs/1346-X6-red-r4-over-production-r2.txt)).
- The v1-to-r2 source delta ([diff](1346-stage/1346-p15a1-production-v1-to-r2.diff), 169 lines) touches
  `src/core/sharedMarket.ts` only. The writer reports the `tuning.ts` part byte-identical to v1.
- The delta makes three changes:
  - it exports `releaseContribution`, returning 1;
  - it multiplies each weight through the contribution once, and self-exclusion subtracts the subject's own
    contribution;
  - it removes `nextDoubleAbove`, so `pressureFactor` is the plain formula.

The writer's handback ([1346-E2](1346-E2-p15a1-production-revision.md)) leaves one doc note: the TUNING comment still
reads "bounded in (0.75, 1]". In float64 the factor reaches 0.75, so the implementation review 1346-J2 decides whether
the comment changes before landing.
