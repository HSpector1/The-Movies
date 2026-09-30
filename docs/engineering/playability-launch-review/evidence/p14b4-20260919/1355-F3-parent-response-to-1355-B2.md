# 1355-F3: parent response to 1355-B2 (the P15A.1 Wave 2 charter against the annex)

Review [1355-B2](1355-B2-p15a1-wave2-annex-review.md) had the annex. It returned REFINE with two blocking items, both
RED gaps rather than design defects. It also ruled the batch-manifest adaptation a lawful implementation choice and
found no Owner question. The parent takes every item. With [1355-F](1355-F-parent-p15a1-wave2-charter-adoption.md)
and [1355-F2](1355-F2-parent-p15-domain-sequence-ruling.md), this record completes the adoption of
[1355-A](1355-A-p15a1-wave2-charter.md).

## Blocking 1: the two-subject all-or-none leaf (annex K.1 `market-second-p07-failure`)

RED gains `market-second-subject-failure-commits-nothing`. A week has two releases that both receive a factor. The
first subject's reception succeeds, and the second throws inside the seam or its P07 application; the leaf forces this
through a validator-legal input that makes that call refuse. `tick()` throws. The input state is byte-identical before
and after (serialized comparison, never `toEqual`), so neither subject has a result, an assessment, a ledger row or a
Standing change. The leaf runs once with the player as the failing subject and once with a rival. It turns the design
argument of §3.1 (one returned state or a throw) into a tested claim at the point where a partial write would come from
in-place mutation.

## Blocking 2: the domain sequence and phase fields reach 1355-A's shape and RED

- The persisted assessment gains `p15DomainSequence`, `phaseId`, `phaseOrdinal` and `phaseOrderVersion` (1355-F2
  items 2-3; phase `p15a1.marketBatch`). §3.3's "no per-row phase fields" is superseded.
- RED 12 asserts allocation from `p15Sequence.next` in `(week, releaseId)` order.
- RED 14 adds refusals for a duplicate or out-of-range sequence, a stale `next`, and a phase triple that does not
  match its version's table entry.
- RED 16 asserts that the save step creates `p15Sequence` at 1, or finds it created by a sibling root in the same
  step.
- New leaf `market-phase-version-immutable` (annex K.1 `market-phase-catalogue-upgrade`). Assessments are written under
  table v1. A v2 table then adds a phase. Old rows keep their triple and still validate, and a row whose triple does
  not match its declared version refuses by name.

## Non-blocking: stated dispositions for four K.1 rows

| K.1 fixture | Disposition |
|---|---|
| `market-batch-manifest-corrupt` | No stored manifest exists to corrupt. Its purpose is covered by RED 5 (forged due set) and RED 14 (forged or missing assessment, broken bijection) |
| `market-batch-duplicate-retry`, `market-duplicate-command` | The engine has no delivery or command-replay surface below `tick()`. A week runs once per advance; replay from a save reruns the whole tick, which RED 13 and K5 cover. There is no receipt to duplicate |
| `market-cancel-before-release` | No path cancels a committed or Release Ready rival picture (1355-F Amendment 1). RED 4 asserts that a held, uncommitted or cancelled player picture is absent from the due set. If a later package adds rival cancellation, it adds this fixture |
| `market-legacy-order-adapter` | Deferred to the first merged cross-domain query (P15C Wave 2 or a Wave 3 view). P15A.1 Wave 2 builds none |

## Clarifications

- **The Wave 1 harness is not G1.** The annex's "6,240-week expected/hostile fixtures before Wave 2" is the pure-law
  harness `tests/p15a1-shared-market-harness.test.ts`, which landed with Wave 1. G1 and G2 in §5 are Wave 2's own
  live-economy calibration.
- **1355-F2 item 2.** The ranking record is allocated only in a tick that produces one (a multiple of 13).

## Status

Charter adopted with 1355-F, 1355-F2 and this record. RED staging for P15A.1 Wave 2 may proceed after the running
Save43 measurement. Production still waits for shelving's closure and Wave 1's broad gates. Owner questions: none.
