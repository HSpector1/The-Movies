# 301 — Shared bounded employment lookup and cold-work bill

2026-09-20. Native sim-core. SOURCE FROZEN; production write ownership yielded
after this handback. Base published/independently verified checkpoint:
`e34af4777a12607d90435048e2703297403eecaf`.

Implemented only the authorized288 shared owner, its replay cold-work pricing
and paid calculator aggregations, the concrete290 comparison correction, and
the parent's follow-up status-comparison payments in that same freelancer bill.
This is an implementation candidate, NOT a runtime or whole-budget acceptance.
No tests, probes, typechecks, Git, network, delegation or other source edits were
performed. Parent owns the independent checks and publication.

## 1. Changed source and identity

| File | SHA-256 |
| --- | --- |
| `src/core/hollywood.ts` | `49854f77a0ab33558556e047eafc65f92e4a35ec95c93afb119c7df589748359` |
| `src/core/promiseCapacityOwnerReplay.ts` | `801c3d6a1721df21780248da7f4ca7f20ccf85cb0a8872afdd6758c2e93be407` |

The only additional written file is this handback. Bounded textual inspection
found no trailing whitespace in either source. Hash commands emitted the host's
existing harmless Perl locale warning. No executable verification was run.

## 2. Real shared owner, not a replay substitution

`rivalEmployment` retains its public signature and the employment-ARRAY-identity
WeakMap. Its cold value is now `boundedStableSort(rows, comparator)`, containing
ALL original row references. The comparator uses the original string ordering
operators `<` then `>` on `terms.talentId`; no locale ordering, normalization,
player-row exclusion, row copy or source mutation occurs.

A numeric, non-bitwise lower-bound loop finds the first possible matching ID.
The following equal-ID run retains original input order because the shared sort
is stable. It returns the first row satisfying the unchanged query-time predicate:

```text
row.studioId !== state.hollywood?.playerStudioId
&& row.terms.startWeek <= week && week < row.terms.endWeekExclusive
&& (row.endedWeek === null || week < row.endedWeek)
```

Thus player-wrapper changes and week changes re-evaluate eligibility against the
same index. Replacing the employment array creates a new cold index. Null roots,
empty arrays, absent IDs, inclusive starts/exclusive ends, ended-week handling,
exact returned identity and original equal-ID priority remain unchanged. No
eligibility result is cached; the pre-existing immutable array-identity cache
contract remains. All ordinary callers use this actual owner.

## 3. Source-accounted cold owner price

The calculator still counts only the source-now queries reached by the actual
`signableUniverse` short circuit: not busy, then not currently contracted. Its
real later `freelancerMarketIds(source)` call is unchanged. There is no assumed
warm cache and no alternative freelancer policy.

Definitions: M is ALL employment rows; W is their maximum talent-ID length; S is
the sum of their talent-ID lengths; V is the sum of their studio-ID lengths; P is
the current player studio-ID length. Q is the reachable query count and L is the
sum of those query-ID lengths. All lengths are UTF-16 spans, consistently with
the existing work model. B is zero for M=0, otherwise floor(log2(M))+1, derived
by a paid arithmetic halving loop. `E(W)=1+2W`.

For a nonnull Hollywood root with Q>0 the reservation is:

```text
20 + 32Q
+ 12 + SORT(M, 24 + 2E(W))
+ B * (Q*(33+W) + L)
+ Q*(21+W) + L
+ 66M + 2S + V + M*P
```

`SORT` is the unchanged source-scalarized `sortBill`, including empty/singleton
copies, initial/auxiliary arrays, every pass/run/merge/tail/control/callback and
element-reference write. No helper cost query or native-sort assumption replaces
it. For a null root, only20+32Q remains; this also pays each null-root lookup. For
Q=0 there is no employment scan/sort reservation, because no lookup is reached.

| Executed owner block | Prepaid term and source justification |
| --- | --- |
| Cold comparator |24 scalar/property/branch operations cover both operand chains, callback bindings, conditional returns; EACH of `<` and `>` additionally pays the full `1+2W` span. Short-circuit success never reduces the reserve. |
| Cold setup/cache write |12 outside SORT covers comparator construction/call arguments, result assignment and WeakMap insertion. |
| Every query |32 covers root/cache reads, guards, low/high and run initialization, final tests and return. It is reserved even with a null Hollywood root. |
| Binary iteration |32 scalar/index/arithmetic/Math.floor/branch steps plus one full `1+W+queryLength` comparison. Interval size at least halves, giving B iterations. |
| Nonmatching run boundary |At most one per query:20 scalar/property/short-circuit steps plus `1+W+queryLength`. An out-of-range bound may avoid the comparison; it is still prepaid. |
| Matching run row |24 run controls/index/property/load/increment steps plus40 for the unchanged studio/date/ended predicate. Two string comparisons additionally cost `(1+2*rowIdLength)` and `(1+rowStudioLength+P)`, giving66M+2S+V+MP. |

The scalar blocks are finite source-operation upper bounds under176, not VM
instruction, allocation-time or CPU claims. In particular the matching loop's
24 includes the loop condition, short circuit, index/terms/ID chain, row load,
branch and increment; its40 predicate block covers both nested term accesses,
both endedWeek alternatives and all boolean/date controls. String spans are
separate at EVERY comparison.

The M bound on total matching-run visits is global to this one market call:
validated `state.talent` IDs are unique (the genuine save reader rejects
duplicates), and `signableUniverse` visits each talent once. Distinct queried IDs
have disjoint sorted runs, even if employment contains multiple historical rows
for one person. The bound conservatively visits every employment row and does not
rely on active-employment ordinals, eligible winners, returned samples or early
success. It is NOT a bound for arbitrarily repeated external calls with the same
ID; normal `rivalEmployment` callers themselves are unchanged and unmetered.

## 4. Calculator work and exact algebraic aggregation

Before reading employment facts, the existing shared counter pays local/guard/
loop setup; each row pays18 scalar steps, both discovered ID/studio spans via
`Work.text`, then paid saturating additions and a charged maximum-width update.
The halving calculator pays setup and8 per visit BEFORE count/update/Math.floor.
Every new sum/product/equality/sort-bill argument expression is reached through
`Work.calc` before evaluation; nested helpers reserve their own operation trees.
The actual owner reserve is still paid before the actual market owner is called.

The query-ID temporary array and repeated busy/filter reservation calculator
trees are removed; their OWNER reservations are not discounted. Paid query count
and length sums suffice for the actual sorted owner's bound. Talent length sums
are collected during the already necessary paid reachability scan. Contracts,
research, company/writer discovery, concept/title maps and writer labels remain
on their existing source-sensitive paths.

For the unchanged key metric `K(n,S,l)=1+l+n*(1+l)+S`, its sum across q queries
with length sum L is exactly `q*(1+n+S)+(1+n)*L`. Therefore, with busy occurrence
count b, busy character sum C, talent count t and talent character sum T:

```text
busyKeys    = b*(1+b+C) + (1+b)*C
busySetBill = 14b + 3*busyKeys
filterBill  = t*(25+b+C) + (1+b)*T
```

These are the previous full per-occurrence reservations, including duplicate
busy IDs and the conservative three Set layers. They do not assume Set hashing,
deduplicate rows, alter availability, shorten the actual owner's work, refund
work or reset counters. Only the now-unexecuted calculator loop/expression trees
stop being charged. Nonnegative saturating sums/products preserve these
equalities up to the same ceiling; no subtraction or unsafe product is added.

The old cold price's growing-prefix Map get/set walks and per-query Map key
walks are gone ONLY because the real shared owner no longer executes them.
The full stable-sort, binary-search and history-run call tree replaces them.
Employment studio strings remain predicate operands, never sort/index keys.

Before handback, parent explicitly requested the analogous repeated enum
comparisons in this touched calculator. `countWriters` now short-circuits through
`Work.equal(status,'drafting')` and `Work.equal(status,'rewriting')`; the research
project guard uses `Work.equal(status,'active')`. The existing scalar6/4 reserves
remain. Their spans are paid at EACH calculator comparison, not by an earlier
discovery or a later owner reserve.

The actual busy owner is separately and conservatively charged through a new
paid `statusBill` accumulator:19+2*statusLength per visited own/foreign screenplay
row covers BOTH drafting/rewriting comparisons;9+statusLength per active OWN
project additionally covers `activeScriptWriterAssignments`' label-verb status
selection;7+statusLength per research project covers its active comparison. All
previous row/control/label charges remain. These expressions use prepaid
`Work.calc` receivers and saturating additions; they are not a deduction from
another cost. The initial scalar setup reserve increases54→56 for this local.

## 5. Concrete290 correction and unchanged boundaries

The existing14 scalar reserve in `singleEarlySweepBill`'s facility-capacity loop
is retained. Both capability comparisons now call `Work.equal` BEFORE comparing,
paying `1+actualLength+literalLength` independently. No owner specialization,
capacity count, bound, result or fallback changes.

All tests, actual production/identity/actions/allocator/kernel/sorter/release
owners, limit200000, source model, assertions/timeouts, validators, versions,
wire shapes and current policy are untouched. No dimension memo, identity-bill
special case or later320 proposal was implemented.

## 6. Unrun checks and remaining qualifications

Parent must run the five independent bounded-employment tests, ordinary
employment controls, immutable Ready/original-started/adjacent controls and type
checks, with independent delta review. No numerical sufficiency is claimed for
the freelancer refusal until those checks reach the real owner and expected
refusal within the original cap.

The separate307 long Ready route cut before `assignLockedDirector` remains a
known task for a later authorized slice;301 does not claim to fix it. This
handback proves only this bounded code/bill delta, not every inherited replay
coefficient or whole-domain completeness. Source is frozen for parent review
and serialized verification; production ownership is yielded.
