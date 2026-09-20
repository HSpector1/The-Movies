# 466 — Paid canonical output fast path

2026-09-20. SOURCE FROZEN; production write ownership yielded to parent.
Implemented only adopted465, including its independent written-review KEEP,
on published base `0bbf2843e8fc4e658a22e1d140fe8bb1c609983f`.
Native sim-core role; no other writer, runtime or delegation.

## Exact scope and identities

Production changed ONLY `src/core/promiseCapacityOwnerReplay.ts`.
Before SHA256: `a1761d8e14d744f28f6a4b3dd66c26fbf9f6db30183f31edcdd8c5abb2caa7e8`.
After SHA256: `956a0245872f02e625c93a41cc2cc2033c4279129b85e100f315045d4d4f8ca4`.
The only other written file is this handback. Source remained unchanged after
the explicit freeze/yield message.

Added private `sortedOutput` with the EXACT adopted465 body and payments, plus
an explanatory comment. Replaced ONLY these four function names at call sites:

| Site | Array | Unchanged key callback |
| --- | --- | --- |
| completeTrace | paths | row => row.pathKey |
| completeTrace | branch.replacements | row => row.holdId |
| completeTrace | additionalHolds | row => row.holdId |
| replayPlans final projection | branch.completed | id => id |

The existing `sorted` body is unchanged. Unique-ID checks, plan canonicalization,
external-slot ordering, actual release ordering and active-contract ordering
still call that original helper. Existing output call-site arguments, callbacks,
literal/closure payments and evaluation order are unchanged; no wrapper or
additional callback is introduced. No input canonicalization was redirected.

## Complete new payment inventory

| Reached operation | Prepayment |
| --- | --- |
| Length read, binding and short-length dispatch |16 |
| Fresh slice for zero or one element |12, before the slice |
| First indexed key callback/binding and index initialization |24 |
| Each loop guard including terminal guard |10 |
| Each indexed read, pure key callback and binding |20 |
| Work.less invocation and branch controls |12 |
| Actual adjacent string comparison |Unchanged Work.less pays1 + both actual string lengths before comparison |
| Noninverted previous-key assignment and index increment |10 |
| Inversion fallback arguments/invocation/return |12, followed by the entire unchanged sorted implementation and all its payments |
| Final fresh ordered-array slice |Prepaid saturated10 + 2N |

The final copy prepayment is spelled exactly:

```ts
work.pay(work.calc(16).add(10, work.calc(8).times(2, count)))
return values.slice()
```

The10 + 2N reserve covers slice/call/return/fresh-array setup and capacity/reference
writes. Its actual calculator execution additionally pays calc16 + calc8 +
times10 + add8 =42 before copying. No bulk copy, max-key scan, comparison,
input-dependent allocation or hidden callback is executed before its adopted
payment. Existing Work administration, primitive prices, saturation and shared
cumulative budget remain unchanged.

## Ordering, reference and fallback proof

These four arrays are constructed internally as ordinary dense arrays. Their
callbacks are the exact pure field/identity projections above. Therefore the
zero/singleton arm can omit key evaluation and still preserve its original
observable order. It always returns a fresh slice, not the private input array.

For longer arrays, actual ordinal string comparison of each current key against
its predecessor proves nondecreasing order. This is the same order as the old
comparator. Equal keys stay in input order; no deduplication, ID parsing, locale
comparison or numeric-order assumption was introduced. On a successful scan,
slice returns a fresh outer array with the exact original element references.
No public Hold, subject or path is reconstructed or mutated by this helper.

The first inversion calls the whole old `sorted` implementation. It does not
reuse a comparator allowance, omit repeated key projections, refund the paid
precheck, return a partial result or mutate the original array. Its full stable
sort/undecoration result remains fresh. Unsorted output can therefore be MORE
expensive; this is not a claim of universally lower work. Precheck/copy/fallback
exhaustion follows the same ordinary WorkLimit cut path.

## Static review and limits

Read full465 including written review/adoption and the old helper/four output
sites before patching. Re-read the complete old and new helpers and all four
changed call sites after patching. The final call search confirms exactly four
sortedOutput callers; all other sorted callers remain unchanged, plus the new
explicit full fallback. No type ambiguity or ungoverned additional work was
identified. No tests, compiler, executable probe, Git, network or delegation
ran under this ownership. No tested file or owner source was edited.

Parent's465 baseline on unchanged452 closed15PASS before writer release. It
establishes retained-property controls, not a466 result. Completed-background
controls cover zero/one keys, not multi-key ordering; public array-isolation
assertions do not alone prove copying relative to a private temporary or helper
tariffs. Those limits remain unchanged.

No whole-route fit or inherited whole-tariff acceptance is claimed. The original
first-take output-budget failure remains an actual candidate verification gate.
The stale route's documented cut is before output, so this change cannot by
itself resolve that earlier prefix. Dimension hints, other caches, previous
Rehearsal/wrap/Post proofs, owners, calendars, ledger joins, validators, limits,
APIs and schemas remain untouched. Parent owns467 actual review and468–475
serialized verification, then any diagnostic and qualified publication.
