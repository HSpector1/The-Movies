# 439 — Independent actual-source review

2026-09-20. Native Fable contract-auditor: qualified KEEP.
The reviewer read the complete three-hunk438 delta and unchanged437 additive test.
No concrete defect found. No runtime was run by the reviewer.

Replay SHA256: `083e96b220dc582f75385532718e36fd6494a6b7e570e810854de46fef5a197b`.
438 handback: `8f442ce9e2edcde43453318c2aa10fe206178df950a90e9732f74e5cc606f2a6`.
437 Ready test: `5e2f28239e675f62d4f057eef609162ef6292cc86fc87d449d406840fd54e057`.
Protected source/test patch: `405760fce635d79631abfd12dfbf1053c4968398575edd290f727c64db6e8d02`.
Base HEAD: `94a7d09e350fab3789d1a26b366baaf806b2be3a`.

## Scoped findings

- Early-slot bound, replay1212–1219: original capacity bound remains evaluated
  and paid. Only external===0 selects its minimum with stages+1 or one Scenery
  slot. Original guards, attempts, full facility/Set discovery and per-slot price
  remain. New16/16/12 precede finite work; helper arithmetic is separately paid.
- Certified-wrap transitions, replay1398–1405: exact singleWrapSlot permits
  release2→0 with two events, then grant0→1 with one event, corresponding to the
  actual operations1354/1380 calls. New40 caller block, helper payments/addition
  and old16-before-enter remain. General fallback and other terms unchanged.
- Retention, replay1114–1122: Post exit stays first. Certified wrap has empty
  retained reservations and one Post requirement. 20+20+keyBill(2,19) retains
  setup, requirement and conservative empty lookup work. New8 precedes selection.
  General retention fallback unchanged.
- Additive437 test is byte-identical to its independent review. Its8PASS
  unchanged424 baseline is separate evidence, not a438 budget result.

Parent independently read the complete source diff and handback, checked all
17 immutable pins, exact protected scope and diff whitespace before this review.

## Qualification and next actions

This accepts scoped source correspondence and payments, not universal inherited
tariff correctness, numerical Ready completion, owner-adapter completeness or
full B4 acceptance. No speculative output-sort/Set-success/cache change included.
440–447 fresh serialized actual gates are next; no source/test/HEAD changes while
they run. Read every raw result and metadata, check exact hashes/nonoverlap, then
investigate real failures without weakening tests or the200000 cap.

