# 828 — C.2c independent frozen-source review

Reviewer: Codex-native contract-auditor, separate from production and test authors.
Reviewed HEAD `8f893e0e9fd8623e79bfc30d673f0e0aaf502fab` plus the frozen production
candidate in `src/core/promises.ts`, `src/core/tick.ts`, and `bridge/trust.ts`.
No tests, writes, network operations, or nested workers were launched by reviewer.

## Verdict: REFINE

One concrete source defect, awaiting an independently validated runtime RED:

The player path in `retirementVoidsPromise` calls `targetSpecificImpossibility`,
whose older `expectedFirstTakeWeek` helper treats an unrecorded matching production
already below five remaining ticks as a future first take. The new
`committedPromiseSeats` correctly excludes that same production. Capped and
uncapped calculations therefore use inconsistent evidence.

Source-calculated separator: at cutoff week 148, an open bound count-one promise
due 150 has a matching grandfathered production at four remaining ticks and no
first-take receipt. Committed future capacity is zero, but the older helper
predicts a take at 149. The candidate then writes VOIDED. The actual production
owner only emits a first take at five-to-four; this picture cannot produce
another. Cancelling and starting afresh cannot take before 153. Ordinary physical
timing already excludes fulfillment, so corrected record 823 requires normal
OPEN until BROKEN, not retirement disposition.

This shape is consistent with the historical migration rule: Save V28-to-V29
opens `firstTakes: []` without historical backfill. Receipt validation validates
existing receipts but does not require a receipt for every progressed picture.
This is SOURCE EVIDENCE, not a claim that a particular preserved world reproduces
the example. Test ownership must validate the whole state and honestly label any
synthetic import-shape construction. Do not delete genuine receipts or invent a
historical first take.

Requested repair, only after observed RED: correct the C.2c uncapped calculation,
without silently revising the existing cancellation evaluator's separate law.

## Other findings

- Owner selected VOIDED, not the trigger week: record 823 states the delegated
  operational decision and rejects the earlier optimistic-capacity trigger.
- Actual admission cutoff, SATISFIED precedence, terminal/unbound immutability,
  distinct/windowed/issuer/class-qualified takes: met with source evidence.
- Existing committed seats are protected; future-window flooring exists at
  source. A genuinely held unscheduled take through cutoff still needs a test.
- Rival release timing has its own branch, rather than inheriting player
  cancellation. Subsequent parent-owned run 829 passes the three rival cases.
- Current accepted extension E is read without resurrecting settled outcomes.
- VOIDED uses one existing settlement receipt, preserves partial contributions,
  has no trust penalty, and is visible only through the issuer's private history
  and attention. Public industry outcomes remain SATISFIED/BROKEN only.
- Save36, projection50, protocol4 and promise rules4 are unchanged. Retirement
  digest facts append only for beneficiaries with an existing lifecycle record.

## Measured verification and limits

825: fixed source, 19 cases: 9 expected missing-behavior failures, 10 passes.
827: isolated pre-implementation source, 3 cases: 2 expected missing-behavior
failures, 1 ordinary impossibility control pass. Neither is GREEN.

829: fixed source, 22 cases: 21 passes, 1 failure. The failure compares the
post-save world with `toEqual`; the diff consists of two perceived values changing
from signed zero to canonical JSON zero. Replay's canonical-byte comparison
already passes. This is a suspected existing serialization distinction, NOT yet
attributed and NOT permission to change the expectation. Independent old-source
proof is next, before any test repair. The raw record is retained unchanged.

Full-boundary comparison, type checks, final edge-case review, and native behavior
remain unverified. The carried full baseline is 55 failures, not all green.

Exact restart: test author owns signed-zero baseline proof, grandfathered-seat
regression, and held-future-window test. Parent owns every recorded run. Production
writer remains idle until the new defect RED is observed and attributed.
