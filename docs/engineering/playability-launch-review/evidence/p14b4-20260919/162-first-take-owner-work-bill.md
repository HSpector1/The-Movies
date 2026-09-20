# 162 — Restricted first-take sweep: source-work bill

2026-09-20. Native sim-core, design only, source base 8ed2646. Read the relevant
`advanceManagedProductions`, ordering, workflow replacement/removal and empty
reservation-transition bodies, plus 137/148/157. No runtime observations below.
This is ONE owner-call bill, not a replay total or a permanent supported-context
cut. The sorting component is conditional on the separately authorized 157
prerequisite; the current native sort does not yet establish that component.

## 1. Exact applicability and branch counts

Before selecting this bill, the caller must already have established genuine
managed, internally consistent, dense ordinary data:

- Every supplied current production has exactly its authoritative workflow;
  IDs are unique, phases/countdowns agree, and no unrelated workflow is omitted.
- Every production either has `startTick == currentTick` (the real first-week
  skip), or has `remainingTicks` exactly 5, 3 or 1. Saved start ticks cannot be
  in the future. A new picture may have another lawful countdown: it is skipped
  before phase/task processing. Do not advance its clock to make this bill fit.
- No pending scenery arrival is being hidden. No scheduled setup or transition
  branch can execute in this call. Countdown 5 may be scheduled or held; its
  actual task and blocker decide whether a take occurs. Countdown 1 has phase
  `releaseReady` and the authoritative empty reservation array.
- Committed-release IDs are the genuine owner-derived set, not caller-invented
  release permission. The real sink and external-slot set are supplied explicitly;
  default argument construction belongs to a separate caller bill if used.
- Inputs are plain immutable data, not getters/proxies. Full generic production
  records remain full records; additional enumerable fields are measured, never
  removed to meet a four-field bound. Validation/footprint preparation is itself
  separately charged before this call and is not free repeated work.

Let `N` be current pictures/workflows; `A` the non-new pictures; `Q` the non-new
countdown-5 pictures; `T <= Q` the ones whose real task is scheduled and blocker
null; `C` the non-new countdown-3 pictures; `O` the non-new countdown-1 pictures;
and `R <= O` those actually committed. Thus `A=Q+C+O` and advanced pictures are
the disjoint union `D=T ∪ C ∪ R`. These classifications are read-only facts.

Every picture is added to `settled` during its first visit, even an unscheduled
take or uncommitted Release Ready hold. A committed release sets `progressed`,
but its empty reservations cannot take the restart/break arm. Therefore:

```text
rounds = 1 + indicator(R > 0)       (also valid for N=0)
visits = N * rounds <= 2N
workflow finds = A                 (not visits)
replaceWorkflow maps = T
removeManagedProductionWorkflow filters = R
byId changed-value writes = T+C+R
```

The second round, when present, only checks `settled.has` and continues. No
third round, allocation, setup resolver, technology policy callback, geometry
callback, Set scan/wear, or `genreOf` invocation occurs. The binding's Set array
is returned unchanged. All first-take clocks are real 5→4 results. Their events
are the returned `firstTakes`, not StudioEventSink drafts.

`recordReservationTransition` is still CALLED for each admitted release; with
empty before/after reservations it creates no keys, comparisons or events. It
must not be omitted from the bill merely because its result is empty.

## 2. Work units and reusable finite footprints

Use the source-level model from 137, corrected by 148/157: a named constant-size
straight-line block, collection callback/loop entry, native primitive invocation,
or explicit reference write is one unit; consumed string spans and shallow
property copies are additional work. A block below never hides an unbounded
loop, callback, string operation or object spread. This is not a JavaScript
instruction, native backing-store allocation or wall-clock theorem.

Define these conservative footprints, all with checked/saturating arithmetic:

```text
text(a,b) = 1 + a.length + b.length
write(key) = 1 + key.length
array(n) = 1 + n                  // allocation plus capacity allowance
copy(record) = 1 + sum(3 + key.length for each own enumerable string key)
```

The three property units in `copy` cover enumeration, value read and reference
write. Include an enumerable symbol key as three units if one is present; its
description is not read. Copied values are not recursively visited. Actual
accesses to a child's fields/array are charged separately when they happen.
Literal record construction uses `1 + sum(write(key))`. Do not charge a saved
forecast's internals merely because `...production` retains its reference.

For native Map/Set calls use a conservative logical key footprint, rather than
assuming zero-cost string hashing:

```text
key(U,k) = 1 + k.length + sum(text(u,k) for u in U)
```

Here `U` is the known complete key universe: the N production IDs for the two
new local collections, or the real committed-ID set for membership queries.
This charges invocation, the argument span, and every possible live-key equality
operand. It is an abstract finite-collection/string bill, not a bound on a host's
hash implementation. No production entries are deleted from `byId`; `settled`
only grows. Using all N keys for every operation safely covers every intermediate
size and recharges repeated long IDs. Building/checking the universes costs work
outside this call. Do not build an uncharged full-ID list inside each query.

For production i, with ID `p_i`, let W be the ORIGINAL workflow array, before
release removals. The following bounds safely include all later smaller arrays:

```text
find(i) = 1 + sum(1 + text(w.productionId,p_i) for w in W)
mapOrFilter(i) = 1 + array(N)
              + sum(2 + text(w.productionId,p_i) for w in W)
replaceOrRemove(i) = copy(operations) + write('workflows') + mapOrFilter(i)
```

The callback-entry unit covers its fixed member accesses and selection; the
second per-row unit in map/filter covers the output reference write (conservative
for a filtered-out row). The equality itself and BOTH identity operands are
charged by `text` on every visit. `copy(operations)` must use the actual full
record, not assume exactly three fields if additional enumerable data exists.
The owner preserves its other properties and its facilities reference.

## 3. Scalar owner bill, factored by actual call sites

Use `U={p_i}` and `K_i=key(U,p_i)`. Let `a_i,d_i,t_i` be membership indicators
for A, D and T; let `delta=indicator(R>0)`. The complete associative-operation
bill is:

```text
ASSOC = sum((4 + delta + a_i + d_i + t_i) * K_i for every production i)
      + sum(key(committedIds,p_i) for i in O)
```

The coefficient is a call-site count, not a multiplier guessed from elapsed
time: initial byId.set(1), settled.has(1+delta), settled.add(1), final production
map byId.get(1), active lookup get(a_i), advanced write set(d_i), and final
firstTakes map get(t_i). Charge every repeated invocation independently.

The variable scan/copy/output part is:

```text
FINDS = sum(find(i) for i in A)
FLOW_UPDATES = sum(replaceOrRemove(i) for i in T ∪ R)
PRODUCTION_COPIES = sum(copy(production_i) + write('remainingTicks') for i in D)
TAKE_COPIES = sum(copy(workflow_i) + write('shootingTask')
               + copy(task_i) + write('status') for i in T)

PHASE_TEXT = sum(text(workflow_i.phase, expectedPhase_i) for i in A)
           + sum(text('postProduction', workflow_i.phase) for i in C)
TASK_TEXT = sum(text(task_i.status,'scheduled') for non-null tasks in Q)
MODE_TEXT = (1 + R) * text('managed','managed')

OUTPUT = 2 + 2*array(N) + array(N) + array(T)
       + 2*(N+T) + 2*(T+R)
       + literal(['productions','operations','sets','admittedReleaseIds','firstTakes'])
```

`OUTPUT` includes the two final map invocations and reserves the two initially empty append arrays to their maximum N
capacity, then the final production and first-take map arrays; each map callback
entry/output write and each append invocation/reference write is counted.
ASSOC separately includes the map callbacks' byId queries. Released pictures
remain as countdown-0 records in the owner's returned productions array; caller
pruning, Set aftermath and receipt construction are NOT included here.

The remaining fixed-size source blocks can be charged explicitly by this table.
One table entry means the named straight-line block, not a hidden loop tariff:

| Source block | Maximum executions |
| --- | ---: |
| Set-array selection; next-operations initialization; local Map construction; local Set construction; initial progress assignment | 5 |
| Initial byId fill loop entry (its key operation is ASSOC) | N |
| Outer while check, per-round flag reset and ordered-loop setup | `3*rounds+1` |
| Ordered picture loop entry | `visits` |
| First-visit startTick guard | N |
| Active lookup dispatch; workflow-missing guard; expected-phase helper's lookup/guard; countdown-5 dispatch | `4*A` |
| New-picture settle/continue dispatch | `N-A` |
| Task fetch; task-null/blocker dispatch; take-or-hold exit | `3*Q` |
| First-take replacement-call/updated-clock exit | T |
| Non-five active/setup-record preparation; false countdown-6 dispatch; next-countdown calculation/zero dispatch | `3*(C+O)` |
| Countdown-3 target-phase helper and same-phase exit | `2*C` |
| Countdown-1 admission dispatch and hold/release exit | `2*O` |
| Admitted-release transition/remove calls, progress assignment and empty-reservation restart guard | `3*R` |
| Whole-call return dispatch | 1 |

Call the sum `CONTROL`. It explicitly counts constant work in the present source;
the named phase-helper block includes its finite numeric table lookup and guard,
not a second phase engine. The repeated phase STRING comparisons are PHASE_TEXT,
not hidden in CONTROL. Source drift adding a loop/callback invalidates the block
classification and requires review, even if a numerical ceiling still fits.

For each release reserve `EMPTY_TRANSITION=11`: the empty argument array (1), enabled getter/guard (2), local
key-function creation (1), two empty map invocations plus empty-array allocation
(4), two empty iteration setups (2), and return (1). A disabled sink exits sooner;
do not refund. Its map callbacks, includes calls, slot-key conversions and append
calls occur ZERO times. Sink construction/drain is caller work.

The before-call charge is the scalar sum:

```text
ADVANCE = SORT_AND_KEYS(N) + ASSOC + FINDS + FLOW_UPDATES
        + PRODUCTION_COPIES + TAKE_COPIES
        + PHASE_TEXT + TASK_TEXT + MODE_TEXT + OUTPUT
        + CONTROL + 11*R
```

Reserve it once BEFORE invoking the real owner. No refunds for shorter find
scans or order-dependent release removals. This covers a mixture of the named
branches; it does not assume all pictures take, or that a release comes last.

## 4. Sorting dependency — explicit, not an imaginary completed helper

157 replaces the real ordering with bounded merge sort and once-per-row keys.
Let `L=ceil(log2(max(1,N)))`, `M=N*L`, `Wsort=N*(L+1)` and
`runs=sum(ceil(N/(2*w)))` for `w=1,2,4,...<N`.

`SORT_AND_KEYS` must include the helper's two array-capacity allowances, Wsort
reference writes, the `N*L` merge-output loop entries, `runs` run setups and L
pass setups; at most M head comparisons/selection blocks; each comparator's
fixed numeric blocks plus BOTH possible repeated lexical comparisons. The
largest ID operand can be used for a conservative maximum, but the charge is
multiplied by M, not paid just once.

Also include the decoration and undecoration arrays/callbacks; one unchanged
wait calculation and one unchanged ordinal regex per input; its original-ID
character span and at most two Number invocations with their digit spans;
three ordinal-tuple writes, three decorated-record fields and each output
reference. Preserve Infinity subtraction/fallback semantics. There is no global
cache and no charge waiver for repeated IDs in a later sweep.

The actual helper's fixed blocks still need checking against its implementation
after RED. Until then, SORT_AND_KEYS is this exact finite component inventory,
NOT a substituted constant from 137 and NOT evidence that an executable whole
bill has already passed. All other components above map to existing unchanged
owner bodies. No additional real-owner extraction is needed for these branches.

## 5. Useful one/two-picture paper controls

For genuine standard records with all optional Production participants present,
the shallow-copy footprints from current type keys are:

```text
Production: 13 keys, total key length 110 -> copy=150
StudioOperations: 3 keys, total key length 23 -> copy=33
ProductionWorkflow: 8 keys, total key length 73 -> copy=98
ShootingTask: 5 keys, total key length 50 -> copy=66
```

These are PAPER footprints for those exact records, not caps imposed on generics.
Extra enumerable keys increase them; absence of participants reduces Production
copy cost. Nested forecasts, cast, craft arrays and participants are shared by
reference and are not read inside this call.

Choose the useful control with every picture non-new, countdown5, genuinely
scheduled, no blocker, no pending scenery, N=1 or N=2, and IDs at most16 units.
Then `T=Q=A=N`, `C=O=R=0`, one round, N visits, and seven local associative calls
per picture. No release string, policy, setup, reservation-key or Set work is
available to execute. With `text(id,id)<=33`:

| Existing-body component | N=1 upper | N=2 upper |
| --- | ---: | ---: |
| ASSOC (`7*N*(17+33*N)`) | 350 | 1162 |
| FINDS (`N*(1+34*N)`) | 35 | 138 |
| FLOW_UPDATES (`N*(45+36*N)`) | 81 | 234 |
| PRODUCTION_COPIES (`165*N`) | 165 | 330 |
| TAKE_COPIES (`184*N`) | 184 | 368 |
| PHASE_TEXT + TASK_TEXT + MODE_TEXT (`36*N+15`) | 51 | 87 |
| OUTPUT (`65+10*N`) | 75 | 85 |
| CONTROL (`10+11*N`) | 21 | 32 |
| **Existing-body subtotal, excluding SORT_AND_KEYS** | **962** | **2436** |

The table's OUTPUT includes literal return keys (total key length53, five
fields:58 plus one literal allocation=59), two map invocations, four array
headers/capacities and the stated map/append work. Arithmetic is inspectable rather
than a measured runtime or a reserved arbitrary residual. SORT_AND_KEYS remains
additional, as do all caller/context/plan/ledger/kernel operations. No assertion
that a full replay is now below200000 follows from this table.

Before implementing a budget caller, independent review must verify each literal
key sum and arithmetic substitution directly; any mismatch corrects this paper
bill, not tests or engine facts. Then actual fixed-input guards can demand this
one owner call be prepaid, reached, and produce the real take(s) while leaving
room within the unchanged shared200000 allowance. Larger or different phase
contexts select another valid bill or return a truthful work cut; this narrow
bill must not become a permanent exclusion of ordinary transitions.

## Handback

Only this inert document changed. No source/test edits, runtime, probes, Git,
network or descendants. Main next action is still independent160 RED followed
by the explicitly released three-file shared-sort implementation. Review the
conditional sorting inventory against that source, and independently check this
one-block bill before implementing any replay budget caller.
