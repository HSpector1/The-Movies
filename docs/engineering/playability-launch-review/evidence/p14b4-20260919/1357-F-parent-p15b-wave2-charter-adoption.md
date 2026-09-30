# 1357-F: parent adoption of the P15B Wave 2 charter

[1357-A](1357-A-p15b-wave2-charter.md) stays byte-frozen. Review [1357-B](1357-B-p15b-wave2-charter-review.md) had the P15
annex and returned REFINE with two blocking items. The parent accepts the first and refutes the second. It adopts 1357-A
with the amendments below, which govern where they differ.

## Amendment 1: the P15 domain sequence and phase triple (1357-B blocking 1)

1357-A predates [1355-F2](1355-F2-parent-p15-domain-sequence-ruling.md), which binds it.
- `ConditionEvent` and `StudioLoanRecord` each gain `p15DomainSequence` and the phase triple (`phaseId`
  `p15b.condition`, its ordinal, `phaseOrderVersion` 1).
- Allocation follows the step: condition events in ascending `studioId`, then rival loans in ascending `studioId`
  within the same boundary. A player `takeLoan` allocates at its action, before the next tick.
- `eventId` and `loanId` keep their own persisted allocators `nextEvent` and `nextLoan` (1355-F2 item 5, third
  bullet; this answers R9). The sequence orders, the ids identify.
- §4.1 item 1 gains the cross-root rules of 1355-F2 item 4. §4.2's save step creates `p15Sequence` unless a sibling
  root in the same step already does.
- RED S3 gains one refusal each for a duplicate sequence across roots, a stale `next` and a mismatched phase triple.
- §4's "the 1356-F Amendment 1 pattern" reads as "the persisted-allocator pattern of annex D.7": 1356-F's `nextRecord`
  is withdrawn.

## Blocking 2 refuted: the rival sign rule is already specified

1357-B says §6.3's positive rival `loanPrincipal` cannot pass `hollywoodValidation.ts:295`, which bounds every rival
kind except `studioRevenue` at or below 0, and that the charter never names the edit. The edit is named: §4.2
(1357-A lines 161-162) threads a `studioLoans` era flag to `validateHollywood` and states "`:295` becomes
`loanPrincipal ≥ 0`, `loanInstallment ≤ 0`". RED S5 pins the "sign rules". The parent adds only a clarification: the
flag keeps older eras exact. A pre-N save holding either loan kind refuses, as S5's "loan kinds refused below era N"
requires.

## Closed departures (1357-B notes)

- **R1:** no registry field in Wave 2, a closed departure from 1354-P item 1. Annex D.5 and K.4
  `corporate-no-parallel-registry` forbid a P15 copy on P12's registry, and no reader of an operating state exists
  before Wave 4.
- **R2:** installments paid are derived, a closed departure from 1354-P item 2. The derivation prices the remainder
  exactly from persisted fields.
- **R3-R8:** adopted as 1357-B answered them. R8, the §9 right-sizing, holds for Wave 2 and must be argued again in
  Wave 4 for closure and settlement.
- **Cover timing:** 1357-B traced a loan at week c by hand. Cover reads the next advance's obligations, one index
  ahead of the installment just charged. That is the declared design, and 1356-A's fixed cost uses the same convention.

## The probe gate

`1357-P-condition-probe.ts` has not run. §11 puts it before RED staging. The parent runs it as one heavy process, after
the Save43 measurement and the landings queued behind it, on a scratch tree with the Wave 1 modules applied. It records
the output as 1357-X with the §8 table filled in. A Retune result goes back through 1352-A §4.5 before any RED.

## Status

Charter adopted. Order: probe (1357-X), then RED, then production behind shelving's closure, Wave 1's landing and
broad gates, and P15A.2 slice 2a (or 1357-A F3). Owner questions: none.
