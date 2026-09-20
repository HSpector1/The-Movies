# 218 — prepaid calculator and retained-Development correction

2026-09-20. SOURCE FROZEN for parent verification. Native sim-core. Authorized
base/published checkpoint16119d97426e2fdfb5b19c4d07ba421379be9bdd. Only replay
module and this handback edited. No runtime, probes, typechecks, Git, network,
delegation, tests or other source edits. No completed-verification claim.

| Identity | SHA256 |
| --- | --- |
| Replay before218 (207) | `a44871be73b70abc3df994db2deca94e21d09c224e1e299bd7c9bd8f309fdb10` |
| Frozen replay218 | `41f200bec1eb019e8dce080e5d105bb1cef6cb485faba162496110dbe365031f` |

## Observed failure and scope

Read213/217 and216 raw.213 accepted the207 construction correction, but found
calculator work missing or paid only by insufficient enclosing lumps. Parent215
had23/24PASS.216's genuine writing fixture executed BOTH sweeps (week1 skips8,
week2 moves8→7), then exhausted at final output through(3,0). This was NOT an
unexecuted8→7 sweep or an invalid fixture. No fixture/validator/assertion/cap
change is justified by that failure.

## One paid calculator mechanism, including argument evaluation

All saturating sums/products now belong to the same `Work` object. No unmetered
global `plus`/`times`/`equality`/`keyBill` remains. No rest/temporary array is made
to pass sum arguments: `Work.plus` has18 fixed positional slots, sufficient for
all source calls. It pays20 for entry, local setup,16 optional guards and return;
each actually supplied operand then invokes a saturating add that pays8 before
subtraction/check/add. Saturation still returns200001, which cannot fit an
admitted200000 limit. Products pay10 before their zero/limit/division/multiply
body. Equality/key calculators pay4 plus ALL nested calls; workflowUpdate pays8
plus ALL nested calls. No estimated helper-body cost is subtracted afterward.

Merely charging inside a function is not enough to pay JavaScript argument
expressions. Every calculator call therefore evaluates a paid receiver FIRST:
`work.calc(C).plus(...)` (likewise other helpers). Only then are arguments
evaluated. Source-local constants8/16/32/64 reserve two units per maximum4/8/16/32
scalar operand reads/operators. Nested paid calls own their own argument/body
trees. No user callback, owner, array construction or variable walk is hidden in
these scalar allowances. Source examples bounding the larger cases:

- The14-term restricted control sum has at most32 direct scalar nodes;64 covers
  them before evaluating any term. Its nested calls are separately paid.
- `(4+delta)*n+active+t+c+r+t` is below16 direct nodes; the times receiver32
  covers both arguments. Calls with simpler operands are conservatively paid.
- Ordinary equality/keyBill arguments consume at most4 direct nodes; nested
  `Math.max` and named property chains are included, not charged as free reads.
- Inner shallow-copy sum `cost,3+key.length` needs at most4 nodes (receiver8).
  Token dispatch needs at most8 (receiver16). Their actual arithmetic remains
  separately paid; this avoids retaining the full64 upper for every copy key.

This is source-level logical work under176, not a native-instruction, allocation
or wall-clock theorem. Counter dispatch itself remains the accounting mechanism.

## Full calculator correction inventory

Every row below now uses the same paid receiver/body mechanism, not a separately
guessed per-call helper allowance. Existing actual-owner execution reservations
still happen AFTER the calculation and BEFORE the owner call.

| Site | Covered calculations |
| --- | --- |
| Shallow footprint / token | Every per-key sum; escaping products and sums; tuple creation still prepaid; token initial formula payment moved before formula |
| Sort | Width/run sums, all execution-bill products/sums; comparator-bound caller arithmetic explicitly paid before sortBill; actual sorter still separately prepaid |
| Company / pooled writers | Each string-length accumulator, complete composite owner bill, all nested products; no later owner payment used retroactively |
| Preparation reservation scan | Its length/product before actual `.find`; subjects/holds unchanged |
| Dimensions | Every facility-capacity, provided-ID and cell-count accumulator |
| Geometry | All NINE products (including equality products), both body-query compositions, both sums; old comment claiming8 removed |
| Arrival / order | Full surrounding expressions AND their geometry/workflow/sort/equality subtrees |
| Restricted sweep | Every row's copy/status sums, associative-key bills, complete ASSOC/CONTROL/output expressions and nested workflow/order calls |
| Allocation | Raw claims, occupancy, callbacks, sort, slots, retention and composite subtrees; no eager-source work removed |
| General sweep | Transition/wear/update/enter/policy/setup/binding/common expressions, visit/attempt products, per-Post capacity sums |
| Commands | Main command bill; assign's outer arrival sum/product/equality; release-refusal and append/sort calculations |
| Frame wrappers | External-slot Set, committed-ID Set, sweep/observation sum, novelty owner, released-ID Set, prune and remaining-production filter calculations |
| Branch construction | Both map-length products and entire enclosing literal/array sum |

Old lumped calculator charges no longer pretend to pay these call trees. They
are replaced by the remaining finite scalar setup/control bounds below; the paid
receiver commonly also covers some of those reads, deliberately overpaying them.
None is an unspecified missing-work residual:

| Calculator block |207 lump →218 remaining scalar block, PLUS paid calls |
| --- | --- |
| sort pass/final formula |26→6;152→22 (loop/width/scalar reads and result dispatch) |
| geometry / arrival / order |192→32;128→16;80→16 (locals/field/scalar setup) |
| restricted row/final |96→32;768→192 |
| allocation / general sweep |1280→192;1536→192 |
| command formula |224→30 |
| append / prune formula |96→16;128→14 |
| branch construction formula |96→12 |

Each192 block bounds at most96 source scalar reads/operators at two units each;
the old nested helper bodies, argument arrays, products and sums are NOT assigned
to it. Remaining variable loops retain their own per-visit payments. Every
helper expansion now charges dynamically along its actual source call tree,
including branches that compute a zero-multiplied upper; no dead formula receives
an unearned refund.

## Source-justified retained-Development bound

This is an execution-cost subdomain only; it neither simulates an alternative
advance nor changes support/admission. After the already-existing restricted
new/5/3/1 check, inspect original branch records. Every non-new production must
have remaining8, phase development, exactly ONE Development-casting reservation,
and no shooting task, blocker or setup. New productions retain the actual skip.
Each inspected row/join/string comparison is paid. If any check fails, keep the
general bound; do not return unsupportedContext or guess a successful allocation.

Actual authority/proof:

1. `productionPhases.ts` maps8→development and7→preProduction; BOTH phases require
   only Development-casting. `retainedCapabilitiesFor` therefore retains the
   single original reservation.
2. `operations.ts:releaseCompletedPhase` returns no released rows. `enterPhase`
   skips its release-event/wrap/wear branch, but still calls the REAL allocator.
3. `allocateForPhase` STILL eagerly produces all raw claims, builds occupancy,
   filters ALL facilities through the real policy and sorts. Its sticky branch
   finds the existing reservation, verifies that facility remains allowed,
   copies it with the new phase, adds its key, and continues. It never reaches
   capacity-slot search or the stage+Set composite.
4. `technologyProduction.ts:allowsFacility` permits Development-casting for
   silent, missing or sound selections, including missing operational sound
   chains. All other facility policy calls and their possible adoption/install
   walks remain charged. `beforePhaseEntered` is still called but returns at its
   non-shooting guard; that invocation/comparison is explicitly retained.
5. No setup-at6, shooting-task creation, genre/Set binding, filming lock or Set
   wear can occur on this edge. Bindings/workflow/production copies, one
   reservation transition pass and one actual workflow update are still paid.
6. Genuine validated initial facts prohibit another owner's claim on this held
   slot. The whole narrowed slate only retains its own slots or is skipped.
   Every active8 therefore advances exactly once with no released-resource
   restart. The sweep still has a final all-settled pass: visits<=2N; actual
   acquisition attempts equal the inspected active8 count, not N(2N+1).

Important eager-producer distinction: retained Development STILL HAS its own
reservation when `resourceClaims` runs. `rawOwners=N`, raw claims<=4N and ALL
workflow/bound-Set visits remain paid. Only post-filter occupancy excludes that
owner (`other=max(0,N-1)`). This is not the wrapped-Post shortcut, whose current
row's old reservation is already removed before raw production.

The specialized bill removes ONLY unreachable terms: generic slot search,
composite candidates, setup/filming lock/genre/wear and release retries; it lowers
transition passes2→1 and workflow updates3→1. The original release-phase upper,
retention upper, full policy/filter/sort and common copies remain conservative.
All original owner invocations, commands, release ordering, complete ledgers,
proof rows and output canonicalization remain unchanged. The public entry still
has no finite-choice completeness claim.

## Static handback and next verification

Source scan found only Work method DECLARATIONS for unqualified arithmetic helper
names; all uses are paid receiver calls. No trailing whitespace found. Reviewed
full touched bill blocks and real phase/retention/occupancy/technology owners.
No engine/test/probe execution was performed, so usefulness of this candidate is
NOT claimed from a paper bound. Parent next compiles and runs25 immutable cases,
including independently reviewed220 two-new-picture control, plus unchanged real
one/two H6+kernel/shared-budget/threshold/command/background cases. No cap,
validator, timeout, test, paid-work refund or per-plan reset changed.

SHA checks confirm every protected production companion/owner remains exact:

| File | SHA256 |
| --- | --- |
| scriptDevelopment | `a82629e70d467c4716a280c7cac6fcaa67ce26137accc0d5d9e7835fefd63a49` |
| castingSessions | `497a8a32152e556378db96d8363be6de9a0719f2eed1fbec4a4fcfe222cf3a3b` |
| productionPeople | `2c6ea9affd6811d25cd36d85808d9470441f579153a7f0a2fb5b6a2c8a118d58` |
| kernel | `1faa6fcac443dac046bd97fa3e27c61bada80c7297f8e69ea4ebcff76d899332` |
| operations | `9935b09495df1d11f39bf3b1a37b244c3d7bf7d0994cd4c8ce286571b3be3411` |
| boundedStableSort | `87861f3ceefe2b2a9163a34bd9762a991d5c8a7f1640b84fbe6d1133f33ff964` |
| releaseAuthority | `9ab259623d3b5f5f75f1d750168e68ccb5c14d27d96f06f4656985db8064b218` |

Prior212/213 fixed-coefficient qualifications are not converted into blanket
acceptance by this handback. No independent source-cost review or25-case PASS
yet; no wholeB4/liveP2/native/Owner acceptance. Sole-writer ownership yielded.
