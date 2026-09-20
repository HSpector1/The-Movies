# 438 — Slot/transition cardinality implementation

2026-09-20. SOURCE FROZEN; sole production write ownership yielded to parent.
Implemented only adopted437 on published base
`94a7d09e350fab3789d1a26b366baaf806b2be3a`.
Native Fable sim-core role applied; no delegated writer or runtime.

## Exact files and identities

Production changed ONLY `src/core/promiseCapacityOwnerReplay.ts`.
Before SHA256: `17a25fef81d54df073471843651666770ebb9024b2c0339b3d11f62824cb4c00`.
After SHA256: `083e96b220dc582f75385532718e36fd6494a6b7e570e810854de46fef5a197b`.
The only other written file is this handback. All tests, owners, limits,
validators, public interfaces and other source remain untouched by this task.

## A — Existing early-transition domain, empty external occupancy

Preserved every existing `singleEarlySweepBill` guard and discovery walk.
Renamed the old slot-count binding to `capacitySlots`, retaining its old pay12
and exact expression: remaining6 uses `sceneryCapacity`; remaining7 uses the
existing paid saturated `2 * stageCapacity` calculation.

Added precisely the adopted selector:

```ts
work.pay(16)
let slots = capacitySlots
if (d.external === 0) {
  work.pay(16)
  const freeSlots = shooting ? 1 : work.calc(8).add(stages, 1)
  work.pay(12)
  slots = Math.min(capacitySlots, freeSlots)
}
```

Payment inventory: first16 covers the local initialization, external property
read/comparison and branch controls; reached second16 covers branch/conditional
selection and local binding;12 covers Math receiver/member/call, two arguments
and assignment. The remaining7 `calc(8).add` still pays its argument work and
the unchanged arithmetic body separately. No input walk, object construction
or string comparison was added or hidden in these finite blocks.

The new count is `min(old, stages+1)` at7 and `min(old,1)` at6, only when external
occupancy is empty. In the already-certified sole-workflow domain, Development
release at7 leaves no occupied slots; composite search visits at most one slot
per positive stage and general search at most the selected Set's stage slot.
At6 sticky soundstage retention cannot occupy a Scenery facility, so the first
positive Scenery slot is free. Zero capacities remain zero via min. No usable
Set or successful phase transition is assumed. Nonempty external occupancy
keeps the original count.

The entire existing per-slot price is unchanged. Both attempt counts (7:two,
6:one), full Set filtering, eager raw claims, facility copying/filtering/policy/
sorting, requirement scans, retained-row copy, transitions, common work and
all other early-sweep terms are unchanged. No optional Set-existence witness.

## B1 — Exact certified-wrap reservation transitions

Kept the early general `transition` computation/payment in place. After the
unchanged full `singleWrapSlot` witness, immediately before the existing enter
caller payment, added:

```ts
work.pay(40)
const phaseTransitions = singleWrapSlot
  ? work.calc(8).add(smallTransitionBill(d, 2, 0, 2, work),
    smallTransitionBill(d, 0, 1, 1, work))
  : work.calc(32).times(retainedDevelopment ? 1 : 2, transition)
```

The new40 is additional finite selection/local/calling-control payment: flag
selection/binding plus both five-argument helper calls, conservatively twenty
source nodes. Both `smallTransitionBill` bodies retain their pay24 and every
nested paid calculator; the outer add retains calc8 and its own arithmetic
payment. It does not prepay any extra owner call, array or event construction.
The old16 caller payment remains immediately before `enter` unchanged.

Only the inline transition-multiplier term in `enter` became `phaseTransitions`.
The certified owner releases exactly two reservations to zero and emits two
release events, then grants one Post reservation from zero and emits one grant.
The reused helper bills both complete key-map/transition/sink passes with those
counts. Fallback remains the exact old one/two transition multiplier. Release,
wear, workflow updates/copies, allocation, common/attempts and event order are
unchanged. No actual owner execution was replaced.

## B2 — Certified-wrap empty retention

Added separate pay8 immediately before `allocationBill`'s retention selector.
The existing `singlePostExit ? 20` arm is still first. Only `singleWrapSlot`
selects `work.calc(16).plus(20, 20, work.calc(8).keyBill(2, 19))`; the general
retention expression is otherwise unchanged.

The additional8 covers the new flag read/branch selection controls. The plus
argument block retains16; the nested keyBill arguments retain8; both helpers'
internal charges are unchanged. First20 keeps the old outer setup; second20
keeps one old per-requirement control allowance. KB(2,19) intentionally remains
conservative even though `alreadyRetained` starts empty. No unit price changed.

Actual certified wrap releases all original reservations before the one Post
requirement. No retained reservation exists, so retained-row comparisons,
facilities.some, retained-copy/key construction and its occupied.add cannot run.
The full actual requirement-driven facility walk, one-slot body, new reservation
and result, occupancy construction and all facility/policy/filter/sort charges
remain unchanged. Failed witness, other slates and Post exit retain their prior
owner-reserve expressions (plus the explicitly prepaid selection overhead).

## Static review and limits

Read adopted437 including independent review/adoption and the actual three
source regions before and after patching. The actual patch is confined to those
three regions and explanatory comments; all new operations are preceded by
their adopted payments. No new arithmetic implementation, cache, output sort,
ledger join, attempt proof, owner, schema, test or validator was introduced.
No tests, compiler, probe, Git or network command ran under this ownership.
Source hash was obtained after the final static read; no source edits followed
the explicit freeze/yield notice.

This is a source-cardinality correction, not acceptance of every inherited
coefficient or proof of whole-route fit. Original long Ready first-take/stale
budget failures remain acceptance gates until actual parent-owned verification.
The newly added437 genuine H3/H4 control passed on unchanged424 before this
implementation; that baseline is not a438 result. Parent next owns439 bounded
review and440–447 serialized checks, actual failure attribution and publication.
