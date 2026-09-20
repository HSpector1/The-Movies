# 325 — Paid current-contract calculator index

2026-09-20. Native sim-core recommendation and independent contract-auditor
review: qualified KEEP, adopted by parent for the next bounded replay-only
slice. Design review only: no source edits, runtime or numerical-fit claim.

324 establishes entry35357 + actual owner reserve116132 =151489; with the
current paid calculator, the pre-owner total is214206. At least14206 units must
be removed before later refusal work. Owner work must remain fully reserved.

## Stable active index with original prefix lengths

During one freelancerBill invocation, inspect ALL original contract rows in
source order. Assign original ordinal before filtering; decorate active rows
as {id, visited: originalOrdinal + 1}. Pay discovery/date comparisons, original
prefix construction, records, arrays/appends and the bounded stable sort,
including BOTH possible lexical comparisons.

Paid lower-bound search plus final exact equality selects the earliest ACTIVE
original matching row. A hit uses that row's original visited prefix; a miss
uses the FULL original contract count, not active count or sorted position.
Original-order stability handles inactive duplicates and multiple active matches.
Keep half-open dates, source-now facts and existing busy short circuits.

## Exact folded owner-reservation prefix

For ALL original rows, including inactive/unrelated rows:

P[0] = 6
P[i] = P[i - 1] + 10 + originalRows[i - 1].talentId.length

Every actual owner query reserves P[visited] + visited * queryLength, exactly
6 + visited * (10 + queryLength) + originalPrefixIdCharacters[visited].
All terms are nonnegative; prepaid saturating additions/multiplications preserve
the same capped result. No unchecked intermediate arithmetic.

Pay prefix/index literals and writes, scalar access, every binary iteration,
all string comparisons, original-ordinal selection and bill accumulation BEFORE
execution. Repeated research-seat queries independently perform paid calculator
lookups AND add their entire owner reservation: reusing a numeric prefix is not
reusing payment.

## Scope and qualifications

This is a local calculator optimization, not an employment-owner replacement.
Actual activeContract/freelancerMarketIds, original source rows/order and actual
market invocation stay unchanged. No global or cross-source cache; no source
mutation, cap increase, metric discount, refund or eligibility-law change.
Empty/all-inactive inputs retain correct full original owner bills.

321 may combine this accepted325 direction with accepted320 C+B and its local
comparison/visit corrections after322 checkpoint publication323. No dimension
memo A yet. Existing independent Ready freelancer RED, original26, Ready15,
employment5 and ordinary66 remain fixed. Source review and actual serialized
verification must establish correctness and usefulness; this recommendation
does not certify a budget fit or Ready/B4 completion.

