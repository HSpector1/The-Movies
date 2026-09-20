# 157 — Bounded shared-owner sorting prerequisite

2026-09-20. Native sim-core; inert contract only. Read 148 completely and the
current owner bodies. This addendum supersedes 137 §6's native-sort tariff and
numerical total, not its accepted replay architecture, chronology or ledger.
147's six-module emitted-JavaScript identity milestone is a separate completed
check; nothing here changes those frozen sources or that evidence.

## 1. Disposition and immediate implementation scope

**Withdraw the 67,904 replay estimate.** Neither `Q(n)=1+n+n*n` nor charging
identifier characters once proves the repeated owner work that 137 claimed.
No corrected whole-replay total or replay-ready claim is supplied by this
sort prerequisite. The final callback/body/ledger composition remains required
before executable replay authorization; its concrete outstanding parts are §4.

The next useful implementation is exactly three production paths:

- New `src/core/boundedStableSort.ts`: the shared sort and its size-only bound.
- `src/core/operations.ts`: use it for the real allocator's facilities and the
  real `productionsInSweepOrder`; prepare production comparison keys once.
- `src/core/releaseAuthority.ts`: use it in `withReleaseCommitment`.

Do not change the detached capacity kernel, any version, validator, phase rule,
Set selection, technology callback, release law, or replay API. No replay-only
replacement of an unchanged real-owner sort satisfies this prerequisite.

## 2. Frozen narrow API and algorithm

```ts
// src/core/boundedStableSort.ts
export function boundedStableSort<T>(
  values: readonly T[],
  compare: (left: T, right: T) => number,
): T[]

export function boundedStableSortCost(length: number): Readonly<{
  maxComparisons: number
  maxElementWrites: number
}>
```

`boundedStableSortCost` accepts only integer lengths in `[0, 0xffffffff]`, the
native Array-length domain; otherwise it throws `RangeError`. No allocation
proportional to the requested length occurs in the cost query. Define `L` by
starting `width=1`, doubling arithmetically until `width >= length`, counting
doublings. Thus `L=ceil(log2(max(1,length)))`. No bitwise shift or 32-bit coercion.
Its exact returned formulas are:

```text
maxComparisons  = length * L
maxElementWrites = length * (L + 1)
```

Both products are safe integers throughout this length domain. These are upper
bounds on comparator calls and explicit element-reference copies/writes, not
claims about native allocation, JavaScript instructions, or wall-clock time.

Implement bottom-up stable merge sorting with one fresh initial shallow copy
and one auxiliary array of the same length. On each pass, merge adjacent runs
of width `width` into the other array; copy the remaining tail explicitly. Swap
source/destination references, double width, and return the final source without
another copy. Lengths 0 and 1 return the fresh initial copy without comparisons.
No recursion, native `.sort`, hidden second sort, input mutation, or cloning of
the element records. An empty result is still a distinct array.

During a merge, call `compare` once for the current two heads. Choose the left
head when the result is negative, zero (including signed zero), or `NaN`;
otherwise choose the right. Infinity retains its ordinary sign. This preserves
the comparator interpretation of native sorting, including NaN-as-equality.

Source proof: there are exactly `L` passes; every pass writes exactly `n`
element references, including unpaired tails. A comparison consumes a head from
one of its nonempty runs, so each pass performs at most `n` comparisons. The
initial copy contributes `n` writes. The number of merge-run starts is exactly
`sum(ceil(n / (2*w)))` over `w=1,2,4,...<n`; run boundaries and loop bookkeeping
are therefore bounded too, without assuming a native sorting implementation.
Count the two array-capacity reservations separately from explicit slot writes
when composing the eventual source-work bill.

The semantic domain is dense, ordinary immutable engine-data arrays and
side-effect-free lawful ordering comparators. Do not claim parity of arbitrary
host permutations for an inconsistent comparator (for example mixed malformed
NaN clock values). Do not change validators to admit such data. Generic full
record types and all record identities survive the sort, including duplicate
references and distinguishable records whose comparison keys tie. No identity
deduplication occurs.

## 3. Exact real-owner integration and parity obligations

### Facilities — operations.ts, allocateForPhase

Preserve the existing initial spread and policy `.filter` in its current input
order. Pass that filtered array to `boundedStableSort` with the unchanged
`compareId`. In particular, do not sort before invoking `allowsFacility`, change
the number/order of callbacks, combine the policy filter with the comparator,
or change the stable order of equal IDs. The new helper adds its own initial
reference copy; include both copies in later accounting. All sticky retention,
first-fit slots and stage/Set composite logic remain unchanged. `bindableSetsOn`
continues filtering Sets in their original state order, with no Set sort.

### Production order — operations.ts, productionsInSweepOrder

Keep `productionWaitWeeks` and `productionOrdinalKey` unchanged. Decorate each
input once with `{ production, wait, ordinal }`, using those two helpers exactly
once per row. Sort the decorated rows with the same comparison sequence:

```text
wait = right.wait - left.wait
if (wait !== 0) return wait
return left.ordinal[0] - right.ordinal[0]
    || left.ordinal[1] - right.ordinal[1]
    || (left.ordinal[2] < right.ordinal[2] ? -1
        : left.ordinal[2] > right.ordinal[2] ? 1 : 0)
```

Finally map to the original `production` references, retaining the public full
generic `P` return type. This is once-per-call preparation, never an ID-keyed
cache. The real weekly owner already computes this order once per sweep.

Do not replace the regex, `Number` conversions, `MAX_SAFE_INTEGER` fallback or
`||` chain. Leading zeros, huge digit strings, rounding, `Infinity - Infinity`
falling through the suffix/lexical tie-break, malformed-ID fallback and the
regex's own end-anchor behavior remain exactly the existing helper's semantics.
There is no ID reformatting, finite-number clamp or locale ordering. Precomputed
pure keys may be evaluated for rows whose ordinal comparison was previously
unneeded; that has no data effect in the stated ordinary engine-data domain.

### Commitments — releaseAuthority.ts, withReleaseCommitment

Create the same row and the same `[...authority.commitments, row]` input, then
call the shared sort with the unchanged ascending-productionId comparator.
Preserve existing row identities, ties, duplicates, namespace and output shape.
This helper is not a substitute for the existing release-refusal checks.

### Independent checks for this prerequisite

158 should independently cover empty/singleton fresh copies; generic marker and
reference preservation; ascending/descending/equal/duplicate keys; stable NaN
ties on a lawful tie comparator; odd/non-power-of-two lengths; counted comparator
calls within the bound; exact small bound values and rejected length inputs.
Compare lawful real-owner orders against independently expressed legacy ordering
for wait precedence, numeric suffixes, long/overflowing IDs, fallback IDs and
stable ties. Include allocator policy callback order and release insertion-order
canonicalization. Preserve useful nonempty owner regression tests. No blanket
snapshot/hash update and no claim that comparator counting observes slot writes:
the latter is a source proof, supported by direct algorithm review.

## 4. Required composition after this prerequisite

Use a work vector until each repeated owner block has a source-accounted scalar
bill. A comparator-call bound is not a callback-cost coupon. For a string
operation on operands `a,b`, charge its invocation plus at most
`a.length + b.length` consumed UTF-16 units. Charge each executed equality or
relational operation separately: the existing lexical comparator can execute
both `<` and `>`. Thus an ID comparator with operand lengths at most `D` has
string charge at most `2*(1+2*D)` per comparison, not once per ID per sweep.
Fixed scalar/control expressions and record writes are additional named work.

Precomputed production keys remove repeated regex/number parsing from sorting.
Preparation still owes one actual regex call per ID, the input character span,
and up to two unchanged `Number` calls with their digit spans. Their longest
possible span is the original ID length. Count each of the three ordinal-tuple
slots, three decorated-record fields and the final undecoration reference write
per row; no arbitrary constant hides variable-size parsing or string fallback.
This character-span/native-primitive accounting is a source-level work model,
not a theorem about a particular regex engine or decimal-conversion machine code.

The outstanding body inventory is finite and concrete:

| Actual repeated owner seam | Footprint that must be charged on every invocation |
| --- | --- |
| `occupiedSlots` / narrow `resourceClaims` | Both workflow passes; every reservation and bound-Set check; emitted claim/filter/index work; external-key copy; every owner/facility/key comparison and construction. Charge supplied roots, not only selected output rows. |
| `allocateForPhase` | Filter callbacks, the actual shared sort, held-Set scan, each facility/slot visit and created slot key, every candidate-stage Set filter, retained-reservation scans and copied rows. The two requirements bound does not bound facility capacities. |
| `recordReservationTransition` | Both key maps, both includes searches and each key comparison, not just emitted events. Slot string conversion and concatenated key lengths recur. |
| `replaceWorkflow` and production updates | Every map visit/ID equality, array write, and each object's own enumerable property copied by spread. Full generic `P` may contain marker fields: four clock fields are not a copy bound. |
| Technology policy callbacks | Each current selection/adoption/installation scan and every ID comparison, repeated per allowed-facility query; shooting-lock selection, reservations, production-row map/append and root/row spreads. |
| Setup route / setup credit | Access/adoption/equipment/installation scans with each identity comparison; actual record/root fields copied on admission/credit; prior-work reference copied as a reference unless a called owner really scans its array. |
| Scenery geometry / arrival | Each structure row and provided-facility includes operand; placements, cells and both facility bodies; repeated arrival replacement maps and copied shooting tasks/workflows. |
| Release refusal, append, aftermath | Each production/concept/commitment/workflow comparison, refusal-string construction if taken, commitment sort/copies, pre-sweep retained-Set lookup, Set wear/novelty map and copies, active/commitment pruning. |
| Replay preparation and ledger | Actual consumed root/subject/command/path scans, collision checks, output property/string construction, full canonicalization and all emitted observations/holds; no once-only input charge pays a repeated loop. |

For an object spread, measure the number of own enumerable keys and their string
lengths, plus value-reference writes; do not deep-charge opaque values merely
because their references are copied. Conversely an actually scanned child array
needs its own bill. Ordinary data records have no getter/proxy work. Property
footprints used repeatedly must be multiplied by the number of actual allowed
spread sites/visits, not paid once during preparation. String keys for Maps/Sets
also carry their operand footprint; no blanket constant-time string-hash claim.

The future producer must use this SAME bounded sorter for plan, command,
released-ID and ledger canonicalization, with comparator operand bounds for its
actual tuple/key representation. No locale sort, native sort or private replay
merge implementation. The only other owner sorts in this tranche receive empty
research inputs; scenery-shop sorting remains unreachable under the actual
under-work-Set cut. Operation validator sorts are not called. Reopen the bill
if that supplied-root/call-graph restriction changes.

Continue to reserve a whole owner call's conservative composed bill BEFORE
calling it, using one shared saturating budget across all plans. No execution to
discover an unaffordable call's bill, refund after early return, or fresh budget.
Safe-integer collection/slot/string/copy sums must be checked before multiplication
or expansion. A budget cut remains uncertified, never an impossibility proof.

## 5. Corrected numerical boundary and useful next controls

Exact sort-bound examples are `(comparisons,writes)`: `n=0:(0,0)`,
`n=1:(0,1)`, `n=2:(2,4)`, `n=5:(15,20)`. They do not contain callback work.

For the OLD paper footprint `N=2,F=5`, retaining its conservative at-most
`N*(2N+1)=10` allocation attempts per sweep gives at most 152 comparator calls
and 204 sorter-reference writes per sweep (production ordering plus allocation
ordering). Twelve such sweeps give 1,824 comparisons and 2,448 writes. Adding
at most one two-ID release sort per sweep and two commitment additions gives
at most 1,850 comparisons and 2,501 sorter writes. With all compared IDs at most
16 code units, the repeated string-operation upper bound alone is
`1850 * 2 * (1 + 32) = 122100` units. Parsing, scalar/control work, decoration,
policy filters, owner bodies, commands and ledgers are NOT included. This proves
why 67,904 cannot be retained; it does not assert the completed replacement fits.

Use phase-specific PRE-call bills instead of charging an allocation branch to
every visit. Real countdown 5 settles in the take branch without allocation;
3 settles in the same-phase branch; 1 settles in release admission/hold; a
newly-started clock skips. Only the remaining actual transition branches can
call `enterPhase`; a completed setup may join that branch, so reserve both when
applicable. The unchanged fixed-point bound supplies the maximum retries, not
permission to omit a possible retry or an actual callback.

The first useful replay budget controls should be lawful one- and two-picture
states already at scheduled first take, one sweep to horizon, with full current
background/physical context. They have a real qualifying future event and may
honestly retain company occupancy through the horizon with null release. Their
actual take branches require no allocation, facility sort, setup resolver or
geometry callback when no scenery task is pending. The two-picture production
sort then needs at most two comparisons and four reference writes; preparing
and undecorating keys adds fourteen explicit field/reference writes. This is a
small real path, not a no-op success substituted for owner execution.

After the prerequisite, finish source-block bills and before-call guard tests
for those two controls and the real 132 background/sticky case. Require their
TOTAL preparation + owners + certificate + kernel use to be within 200000.
Then extend the phase-specific bill to the longer transition/release control.
Those whole totals are presently UNPROVED, not silently granted a residual
allowance or permanently excluded as unsupported ordinary states. Parent owns
the final composition review and source authorization.

## 6. Two accepted execution precisions

At `H==now`, after ordinary context/input/budget checks, retain canonical
zero-length `[now,now)` current holds and all current paths; return the unchanged
projection with no owner call, event, take, completion or release. Do not invent
an actual release at the horizon.

A command may name an original current picture that an earlier command/sweep
already released. Validate its original identity initially, but resolve it
again against the CURRENT branch slate before executing: return `commandRefused`
with consumed work and prefix provenance, never run a stale record or resurrect
the picture. Neither precision changes gameplay law.

## Handback boundary

Only this inert file changed. No source, test, fixture, kernel, generated contract,
Git or runtime work was performed. Immediate next actions: independent 158 sort
tests/review; actual RED/publication; explicitly release the three-file shared
sort prerequisite; verify parity/cost and existing owners; then close the named
remaining source-work bill before authorizing the replay producer.
