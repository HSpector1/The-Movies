# 452 — Paid single-Rehearsal success witness

2026-09-20. SOURCE FROZEN; production write ownership yielded to parent.
Implemented only adopted451 on published base
`ba1a0ba1f0164dfd8a1c86312c6daf6ae5856e06`, following the native sim-core role.

## Files and exact identities

Production changed ONLY `src/core/promiseCapacityOwnerReplay.ts`.
Before SHA256: `083e96b220dc582f75385532718e36fd6494a6b7e570e810854de46fef5a197b`.
After SHA256: `a1761d8e14d744f28f6a4b3dd66c26fbf9f6db30183f31edcdd8c5abb2caa7e8`.
The only other written file is this handback. No owner/test/validator/cap/API/
schema file was changed. Source stayed unchanged after the freeze notice.

## Complete delta

1. Existing Sets import also imports the actual exported `setIsUsable`.
2. Private `hasUsableRehearsalSet(operations, sets, work)` returns only boolean.
   It walks actual current facilities and Sets, skipping non-soundstages,
   nonpositive capacity, null mounts and different mounts. A mounted match
   calls the actual fully prepaid predicate; no threshold is duplicated.
3. Frame passes current `branch.sets` by reference into private `sweepBill`,
   which forwards it into private `singleEarlySweepBill`. No root copy/cache.
4. After every existing early guard and the unchanged capacity-count walk,
   initialize `rehearsalSuccess=false`; invoke the witness only when remaining7
   (`!shooting`) and external occupancy is empty.
5. The existing attempts expression becomes
   `shooting || rehearsalSuccess ? 1 : 2`, with its additional paid controls.

No output sorting, other calculator change, owner rewrite, identity selection,
admission gate or public interface was added.

## Actual prepayment inventory

| Source site | Additional payment and covered execution |
| --- | --- |
| Frame immediately before sweepBill | Separate6: branch Sets read, argument, callee binding; also paid for restricted sweeps. |
| Sweep immediately before singleEarly | Separate4: Sets reference forwarding/binding; original20 retained. |
| Post-capacity-walk witness dispatch |20: boolean initialization and remaining7/empty-external short-circuit controls. |
| Reached witness invocation |12 before three arguments, call and result assignment. |
| Helper outer-loop setup |8 before reading/walking facilities. |
| Every facility visit |32 before capability-call/branch and capacity guard; Work.equal additionally pays complete actual capability string spans. |
| Every positive soundstage |4 before inner Set-loop setup. |
| Every Set visit |32 before null-mounted guard and equality-call controls; nonnull mounts additionally pay Work.equal's full mounted/stage spans. |
| Every mounted match |16 before predicate-call, conditional and true-return controls. |
| Predicate body |Prepaid saturated `20 + (9 + set.status.length)` using the exact adopted two calc/add trees. |
| Exhausted helper |2 before returning false. |
| Attempt selector |New separate8 before original8; neither absorbed into an old block. |

The predicate reserve is spelled exactly:

```ts
work.pay(work.calc(16).add(20, work.calc(8).add(9, set.status.length)))
if (setIsUsable(set)) return true
```

Nine plus actual status length covers comparison with eight-character standing.
Twenty conservatively covers scalar reads, actual shared threshold lookup,
short-circuit and return. Nested calculator execution remains paid: calc16,
calc8, and the two unchanged add8 bodies, total40 calculator units per mounted
match, separately from predicate reserve and16 caller controls. The proof
constructs no array, object, Set, index, string key or selected-identity result.
All new payments precede their corresponding operation; Work/saturation and the
single cumulative counter are unchanged.

## Owner law and unchanged fallbacks

The witness is unreachable unless all original singleEarly guards hold: one
production/current matching workflow, older clock7/6, silent policy, matching
phase and single expected reservation, null task, requiresSetBinding, and
original binding/setup restrictions. Clock7 additionally requires external0.

The sole matching workflow excludes itself from heldSetIds. Development releases
before allocation, leaving no other or external occupancy. Every positive stage
has a free slot; silent policy admits all facilities. A witnessed mounted usable
Set therefore guarantees the real composite eventually finds some candidate,
and the sole Rehearsal soundstage requirement succeeds. It is not necessarily
the witness walk's first candidate: no identity is returned or used to steer the
real sorted allocator. No wear, setup or filming mutation can change these
facts before the actual7-to6 entry. Successful entry settles the picture before
restart, proving one entry attempt, while TWO outer visits remain reserved.

Failed witness keeps attempts2, including nonnull historical mounts on retired
Sets; actual setIsUsable rejects those records. Remaining6 keeps attempts1 and
does not run this witness. Nonempty external occupancy does not run the witness.
All other slates still fail the original early-domain guards and use existing
fallbacks. A proof-budget exhaustion is the existing work-limit cut, never a
false success or an affordability assertion.

The actual advance still receives the same current branch Sets reference.
Full allocation, Set filtering/composite, facility/policy/filter/sort, raw claims,
slot/requirement work, release, copies, transitions, updates, binding/lock/task,
success, common/two-visit reserves and every unit price remain unchanged. Only
the source-proven remaining7 entry multiplier changes2-to1. Actual owners and
their observable event/hold/calendar results are not changed.

## Checks and remaining limits

Read full adopted451 including independent written-review KEEP. Re-read the
complete new helper, full changed early-bill function, private call sites and
current owner-call context after patching. Static call search confirms one
boolean-witness call and the complete private forwarding chain; before/after
source hashes above were read directly. No new generic-type or call-site
ambiguity was found. No tests, compiler, executable probe, Git, network or
delegation ran under this ownership.

Parent's unchanged438 baseline for the frozen additive no-Set control closed
9PASS before this patch; that is retained-property evidence, NOT a452 result.
Current Ready test SHA supplied at release:
`0e1a25ed6e9b5c1c88d8e4459845636ca7caef6e131f78ff823c5d3cc542f864`.
This task did not modify tests. Whole-route fit, actual candidate test results
and inherited whole-tariff acceptance remain unclaimed. Parent owns453 actual
review and454–461 serialized verification, then any diagnostic/publication.
