# 158 — bounded shared-owner sorting: independent first case matrix

2026-09-20. INERT / UNEXECUTED. Only this paper matrix is written; no test code,
runtime/probe/typecheck, live source/fixture/config edit, Git/network or delegation.
Read FULL frozen137 and148, plus the existing three owner sort seams and bounded
fixture bodies below. No mutable157 or sorting implementation was inspected.
Parent's frozen147/153 verification owns runtime; sim157 owns the proposed exact
interface. Executable draft waits for that frozen interface AND parent adoption.

## Scope and paper oracles

148's cost REFINE is controlling: sorting must be shared by the REAL existing
owners, not a replay-only imitation. Current nonempty seams are facilities in
`operations.ts:291–295`, sweep order1482–1495 and commitments in
`releaseAuthority.ts:114–124`. Native comparator counts and repeated identifier
work cannot be replaced by137's nominal tariff. Type-only owner views remain
independent. H==now and command-after-release conventions stay adopted, but are
not assertions about this sort prerequisite.

Native reference sorting is allowed IN TESTS as the preserved prechange semantic
oracle, on detached copies with the independently pinned OLD comparator. Pair
that oracle with literal orders below; never compute expected values using the
new helper. Generic equal-key rows are lawful detached sort inputs, not invented
duplicate-production histories. Narrow clock-only math inputs are not claimed
strict-admitted campaigns or serialized historical IDs.

| # | Bounded discriminant | Independent expected result / useful fixture |
|---|---|---|
| 1 | Empty, singleton, ordered/reversed pairs; stable equivalent records and NaN-as-tie comparator results. | Empty/singleton require zero comparator calls. Inputs remain unchanged; every output object is the ORIGINAL caller object, including nested marker identity. For equal-key generic records, retain their input order. Always-NaN yields exact input order; a comparator using NaN ONLY within equal rank groups is equivalent to zero within those groups. Do not demand parity for inconsistent/nontransitive comparators. No owner comparator or row is changed merely to produce a tie. |
| 2 | Generic readonly typing and stable permutation semantics. | Frozen `readonly` full/narrow records preserve exact inferred extra fields and reference identity. Unique-key input permutations produce identical sorted identity order. Equal-key permutations preserve THEIR own input tie order, not a newly invented global ID tie-break. Deep input/marker snapshots unchanged on all paths. Whether returned array itself may alias an already-sorted input is left to157, not guessed. |
| 3 | Actual sweep: waiting time dominates ordinal; numeric suffix dominates lexical suffix. | Detached clocks at now20, remaining7: start14 means wait4, start16 means wait2. Literal result for shuffled rows: `legacy-z`(wait4), then wait2 `prod-0002`, `prod-2`, `prod-0012-2`, `prod-0012-10`, `legacy-a`. Finite scalar clocks, unchanged IDs and extra markers; no fake full Production. Compare to native OLD comparator separately. Reversing only input order must preserve this unique-key result. |
| 4 | Production-key edge semantics: fallback, leading zero, huge finite/infinite parsed numeric components. | Leading-zero forms with equal numeric major/minor use full original string, never normalize/remint. `prod-0002` precedes `prod-0002-0`, then `prod-02-000`, then `prod-2` at equal wait. Nonnumeric fallback keys use MAX_SAFE_INTEGER for BOTH numeric parts; a numeric major above that can follow a fallback ID.310-digit major keys parse as Infinity: equal Infinity subtraction is falsy NaN, so suffix2 still precedes suffix10; with equal suffix,310 leading8 digits sort lexically before310 leading9 digits. Native NaN-as-tie must not accidentally short-circuit the OLD comparator's subsequent `||` fallback. Tests must not assume every subtraction is finite. |
| 5 | Canonical commitment order remains lexical, not the sweep's numeric order. | Same detached lower-owner append set in different insertion orders yields EXACT identical commitment rows/IDs/weeks: e.g `prod-0012-10` precedes `prod-0012-2`. Preserve references to preexisting rows where the old append does. A separate actual two-Ready-world action control is available in `p06a-w1-release-authority.test.ts::twoReady` / canonical click-order case; do not label standalone `withReleaseCommitment` records as proof that an unready film could legally commit. |
| 6 | Real allocator first-fit with facility-input permutations. | Existing real `operationsStudio`/`productionPayload` greenlight route, or actual Ready package, supplies genuine produced clocks and real facilities. Reverse the detached facility array without changing facility facts; first fresh allocation still chooses lowest lawful facility ID then lowest free slot. Selection policy is an actual owner policy, never a stub declaring an illegal facility available. Full returned operations/reservations and input purity must agree, not only one expected ID. Existing add-workflow/sweep entry must actually reach the shared sort. |
| 7 | Sticky retention wins over newly available lower-ID facility; genuine Set search order remains untouched. | `tests/contracts/sticky-retention.contract.test.ts` provides actual placed/completed Annex, Ready screenplay, two real drafting occupancies filling base, real Annex greenlight, due work release, then8→7. Assert EXACT same Annex facility/slot retained while base0 is free. Historical-control founding/80m balanced bootstrap disclosed; no fabricated workflow. Existing stage-retention case is a smaller companion. Do not sort Sets as collateral change: `bindableSetsOn` intentionally filters in state order.132's impossibility remains—this is retention, not a new started-picture dev acquisition. |
| 8 | Measured comparator use at tiny, odd and power-of-two boundaries. | After157 specifies algorithm/bound, independently derive its arithmetic and pin small literal bounds. Count transparent real comparator calls for lengths0,1,2,3,5,7,8,9,15,16,17,31,32,33; include sorted, reverse, alternating low/high, all-equal and fixed seeded permutations. Counts must not exceed the adopted bound. No engine RNG or wall-clock threshold. Assert useful correct outputs AND bounds; zero comparisons cannot pass on a nontrivial incorrectly unsorted result. |
| 9 | Repeated identifier/comparator work and owner integration. | Long/fallback ID cases force real numeric parsing and lexical fallback. Exact157 design must state whether keys are precomputed once or repeated parsing is charged PER comparison; tests observe exposed counters/call-through only if provided. A generic sorter comparator bound alone does not prove owner repeated-string cost or new producer's prepaid call. Static shared-owner call-site review plus owner parity and any truthful cost seam are separate obligations. Do not replace the real owners with test copies just to obtain a count. |
| 10 | Safe scalar bound/saturation and pre-call refusal, IF157 provides such an API. | Query the scalar bound with very large safe integers and a small ceiling without allocating a giant array. Pin overflow/saturation/refusal using independent arithmetic, and verify no comparator/owner invocation where an actual bounded entry exposes that guarantee. Do not fake an Array length, rely on sparse huge allocation or claim a pure bound function alone prevented a separate owner call. Invalid scalar behavior and exact return shape must wait for the adopted API. Global replay shared-budget/prepaid observations remain later work. |

## Exact fixture cautions and first executable tranche

Production wait is `max(0, currentTick - startTick - (8 - remainingTicks) - 1)`.
The mixed-case literal above uses only nonnegative integer clocks and deliberately
different waits; ordinary production ID parsing must not be confused with the
lexical commitment/facility comparators. Long identifiers are detached permanent
ID compatibility probes, not forged save provenance. Stable generic tie tests
must not sneak duplicate IDs into a claimed lawful active slate.

Begin with rows1–5 and8, then one actually reached allocator/retention route from
rows6/7. Preserve original sticky/clock/release regression files; reuse their
public actions and existing helpers without weakening assertions or increasing
timeouts. Small local deterministic permutation generation is permitted once
test authoring is released; no randomness needs to touch campaign state.

The broader source-accounted charge (property copying, callback scans, repeated
string construction, bounds propagation, useful real replay within200000) is
NOT discharged by sampled comparator tests.148 requires source proof plus useful
executed controls;157 must explicitly supply the missing contract before code.
No measured bound, parity pass, timing or test reach is claimed here. Matrix is
ready for exact API alignment, not installation or production authorization.
