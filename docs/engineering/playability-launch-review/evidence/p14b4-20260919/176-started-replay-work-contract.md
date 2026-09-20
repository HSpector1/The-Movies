# 176 — Started replay: bounded work composition

2026-09-20. Native sim-core. DESIGN ONLY; not source authorization or an executed
budget certificate. Governing architecture/API:137; corrections148/157/169;
implemented sort168; restricted owner bill162 and independent175 KEEP. Published
source at this preparation is d9ebb81090dafc0d18d7c0f3b86e5f92d66ae123.

Frozen qualified implementation contract. Independent179 now supplies genuine
one/two-picture dimensions and owner outcomes; it does not supply a replay work
certificate. The remaining whole-call arithmetic in§10 must be implemented and
independently checked WITH the producer. It is not another prerequisite project
and is not waived by the controls passing ordinary ticks. No source, test,
runtime or Git changes were made for this document.

## 1. Meaning and administration of one shared allowance

Keep137's public types and `replayStartedProductionPlans` signature unchanged.
One counter starts at input.preparationWork and follows preparation, every plan,
refusal/prefix, owner invocation, projection and certificate through to the
unchanged kernel. Lower limits only:200000 work,220 span,1024 trace/path rows.
Passing producer preparationWork into the kernel transfers expenditure; it does
not grant another200000. No timing measurement, refund, per-plan reset or cache
across source identities is permitted.

Work units are the accepted162/175 source model: named finite straight-line
blocks; native/owner invocation; callback/loop visits; explicit reference writes;
consumed string spans; and discovered/copied shallow properties. They are NOT
instructions, engine allocation or wall-clock guarantees. A named block cannot
contain an uncharged variable walk, callback, string operation or object spread.

`reserve(units)` checks a nonnegative safe integer against `limit-used`; if it
does not fit, set used=limit and stop work BEFORE the associated operation. Cost
products/sums saturate using subtraction/division before multiplication, never
after overflowing. Reserve each cost-calculator scan/arithmetic step before doing
it too. The constant counter/check dispatcher is the accounting mechanism, not
a recursively self-charged operation.

There is one explicit administrative boundary, matching the kernel's existing
outer validation/catch convention: finite scalar limit validation and the fixed
workLimit return envelope do not consume data-proportional budget. They may not
scan source roots, interpolate user strings, create proof rows, sort or call an
owner. At zero work with zero prior preparation, return empty fixedHolds/attempts,
the saturated preparationWork and one constant work-limit omission. No apparent
empty-but-complete domain or successful trace is returned. This is not a claim
that returning the diagnostic executes zero JavaScript instructions.

After preparation has completed, an unaffordable plan operation may return its
already-known traceKey and boundary in a cut, preserving already-built provenance
references, with a constant work-limit detail. It does not build an uncharged
diagnostic transcript. All omitted plan suffixes are covered by one omission;
do not iterate unprocessed plans just to manufacture a cut for every row.

The consumed-fact premise is genuine validated engine JSON record containers,
plus ordinary own-STRING-key generic P extension fields: no accessors, proxies
or enumerable symbols. This is an internal API precondition, not a claim that
arbitrary nongenuine JavaScript objects or symbol absence were dynamically
checked for free. Extension VALUES remain opaque referenced values, not a new
deep-JSON validation requirement. Existing generic owners remain unchanged.
Replay does not discard extra fields: it discovers and bills every enumerable
own string key incrementally using for-in plus an own-property check, before
reading its value. No unbounded Object.keys/Reflect.ownKeys allocation precedes
its budget check.162's hypothetical symbol-copy arithmetic is not proof of free
symbol discovery; such caller-only objects have no certificate in this domain.
Opaque nested forecast/marker values copied only by reference are not traversed.

## 2. Scalarized real bounded sorting

Retain162 definitions `array(n)=1+n`, `text(a,b)=1+|a|+|b|`,
`write(k)=1+|k|`, and measured shallow `copy(record)`. Let `literal(keys)` be
`1+sum(write(k))`. Count actual copied key names; do not substitute clock-field
count for full P. A binary join below reserves its actual key operand spans at
each comparison, not once when building the index.

For the actual168 helper, define:

```text
L = ceil(log2(max(1,n)))
M = n*L
R = sum(ceil(n/(2*w))) for w=1,2,4,...<n

SORT(n,c) = 5 + array(n) + n                          if n<2
          = 8 + 2*array(n) + n + 8*L + 19*R
            + 5*n*L + (8+c)*M                      otherwise
```

Here c is the comparator BODY bill, excluding its invocation. This is a
conservative scalar source count, not a replacement comparison/write API:

| Actual helper work | Charged term |
| --- | --- |
| Length/source setup, slice invocation, guard and return; optional target/pass setup | constants5/8 |
| Initial/auxiliary capacity reservations and initial reference copy | array terms plus n |
| Width/pass guard/update, inner-loop initialization/termination, three swap assignments |8L|
| Both Math.min calls and their arithmetic/bindings, three indices, run tests/advance, terminal merge/tail tests |19R|
| Merge/tail output-loop controls, source reads, destination writes and index moves |5nL|
| Head comparison invocation/binding and <=0/NaN decision/control |8M|
| Caller comparator body at every head comparison |cM|

Some terms overlap deliberately; none depends on the actual comparison outcome.
Empty/singleton still pay a fresh shallow copy. No trailing copy is charged or
performed. Numeric doubling/run-bound arithmetic is checked during bill building.

For cached production comparison, if D bounds production-ID length:

```text
cProduction = 28 + 2*(1+2*D)
PREP_KEYS(n,D) = 2 + 2*array(n) + n*(67+2*D)
SORT_AND_KEYS(n,D) = PREP_KEYS(n,D) + SORT(n,cProduction)
```

The28 covers the two cached wait reads/subtraction/guard, ordinal reference reads,
two subtraction/short-circuit blocks, both lexical operand accesses/branches and
return. The two lexical operations EACH additionally pay both operand spans.
PREP_KEYS separately covers map/undecoration invocations and arrays; per row,
callback and output references, the three-field decoration literal, unchanged
wait-helper scalar work, unchanged ordinal regex/branch/tuple construction,
at most two Number calls and combined digit spans, and undecoration. The regex
input span and numeric digit spans each have upper D. The original regex/Number
semantics, including Infinity subtraction's original || fallthrough, remain law.

If the calculator calls `boundedStableSortCost`, reserve its query too: a
source-counted upper is `48+4L` (guards, doubling, arithmetic and two-field result),
or its finite maximum176 before discovering L. The public query is not a free
oracle. A calculator that already derives L/M/R with individually charged scalar
steps need not call that API redundantly. Sorting bill construction and any
preparation index sorting consume the same allowance as the eventual owner call.

Thus the old162 paper controls at D16 add113 for one picture and463 for two,
giving1075/2899 for this ONE restricted advance, before cost-calculator work and
all caller/kernel work. These are conditional paper substitutions into the
source bill, not measured runtime work or a complete replay total.179's real
production IDs and copied-record footprints satisfy these restricted inputs.

## 3. Endpoint and complete-frame requirement

169 controls the former157 endpoint claim. A 5→4 sweep from w emits a real take
at(w+1,0). At H=w+1 it cannot satisfy a half-open demand ending H. The minimum
in-window control runs the actual second frame through H=w+2, including 4→3
wrap/Post, stage/scenery/Set release, wear and continued company occupancy.
No stationary hold extension substitutes for that execution.

Each frame still runs137's actual sequence: planned commands; original due
background releases; actual scenery arrival; external slots; fresh factories;
ONE whole-slate sweep; ordered sink reconciliation; real release aftermath;
first takes at the arrived boundary. Credit classification remains outside the
producer. A finite plan list supplies no completeness proof. One eligible take,
or two different companies' simultaneous takes, does not establish a same-person
B=2 witness, eight-week slack or CERTIFIED_ACHIEVABLE.

## 4. Producer preparation and canonical joins

Preparation is a charged read of the consumed view, NOT scan(source), JSON
serialization, structuredClone, save validation or a whole-state material digest.
Property discovery visits each admitted own key once; immediately charge its
name span and fixed own-property/read work. Descend only along named consumed
fields. Store opaque copied-value references without visiting their contents.
Size/length checks precede collection expansion; source arrays are not reordered.

Build local sorted indexes for exact ID joins, using the REAL shared sorter.
Each index row retains the original record reference. Duplicate keys are checked
by a charged adjacent walk. A lookup in n rows takes at most
`ceil(log2(n+1))` comparison steps, plus initialization/termination; each step
pays its exact key operand spans and numeric/index block. Do not stringify whole
records into comparison keys, repeatedly rebuild indexes, or adopt a global
ID-keyed cache. Numeric tuple components do not require a string comparison.

The new producer owns these explicit charged walks:

| Walk | Consumed values / work, once per actual visit |
| --- | --- |
| Scalar/header gate | week/H/span/limits/preparation safe integers, issuer and player ID comparison, founded/managed predicates, collection lengths. Administrative workLimit output does not make these source reads free. |
| Plans/commands | each traceKey span, command scalar fields/production ID; sort traceKeys and (week,ordinal); adjacent duplicate check; current-production index lookup; now<=week<H. No commands are executed during preparation. |
| Production/workflow join | original IDs/start/countdown and authoritative phase/task/bindings/reservations, every full shallow-copy key footprint, actual company field arrays, concept index and required genre/title. Charge joins separately from first discovery. |
| Real company helper | before calling productionCompanyTalentIds, read and bill array lengths/ID spans sufficient to bound its director/Object.values(cast)/craft loops, temporary array and all Set.add operations. Invoke the shared owner, then charge iteration of its returned set. Credited writer is not a company seat. |
| Writing/audition facts | original ID/status/due/reservation fields; prepay scriptProjectWriterIds including its attributed-writer includes and possible fallback copy. Retain all actual pooled IDs. Audition candidates are not company-person holds. No assessment/history body is called. |
| Queue/physical/installation/Set-work cuts | actual row owner/status fields and named references, not caller harmlessness booleans. A nonempty queue/legacy construction length can already establish its cut; no need to inspect opaque rejected work. Standing mounts and completed installation facts remain represented. |
| Technology cuts and callback footprints | project/seat status and releasedWeek, adoption owner/cancelled/operational fields, and per-row fields actually consumed by selection/access/equipment/installation scans. Record maximum current production-row footprint/count plus at most original N newly locked rows. |
| Foreign relevance | actual business slates, activeScriptOrdinals joined to real development rows, helper-derived company/pooled writers, active foreign research seats. Compare each actual person against the sorted relevant-person union. Disjoint work remains input, not deleted. Missing indexed work is input Error. |
| Historical take identity | index consumed production/studio IDs and relevant receipt facts; do not traverse unrelated receipt prose or invent an absent old first take. A current already-filmed path has no newly emitted event. |
| Physical indexes | actual facility IDs/capacities, exact current reservation slot facts, Sets/mounts and source key-to-subject joins. Do not enumerate every capacity slot just to build an index. Later allocator slot loops still pay their full capacity bounds. |

Every sorting/copy/index lookup cost above is charged when performed. Discovery
does not pay for future owner comparisons or copy sites. Root-cut diagnostics use
constant categories plus already-read fact references; no new uncharged scan to
beautify an error. The checked scalar/identity contradictions remain Error;
supported-but-unmodelled root activity gives the named context cut. Trusted
plain-record preconditions are not conflated with either dynamic check.

## 5. Frame calls and their separate bills

At each week use only original record references plus actual owner-return roots.
No fake Review screenplay, fake Production/GameState, solo replay or copied tick
pipeline. All pre-call calculators are pure reads. They cannot call an owner to
discover which cheaper branch it took. A branch-specific bill may be selected
only by facts available BEFORE that owner invocation.

| Call / stage | Required bill components |
| --- | --- |
| Current-branch command resolution | charged production/workflow index lookup, then actual named command owner; an originally valid picture already released returns commandRefused, never stale execution. |
| assign / schedule / grandfather clear | actual requireManagedWorkflow find; each phase/status/locked-ID/task-ID comparison; possible refusal string spans; task/workflow/operations copies and replacement map. Clear also pays real sink append. Director assignment additionally pays its actual picture-restricted arrival call. |
| commitRelease | releaseCommitmentRefusal's production/commitment/workflow and possible title/concept scans plus refusal string; only on actual null refusal invoke withReleaseCommitment, separately prepaid for row/ID construction, appended-array copy and real SORT(length+1). |
| Background completion | each still-live original path lookup and shared due predicate; charged closure/provenance writes and pooled-person endpoints when due. Completed path membership is a real repeated lookup, not a free Set. No derived result/assessment. |
| arriveDueScenery | every actual workflow guard/status/ID comparison; for each potentially blocked trip, BOTH facility-body queries, structures/provided-ID includes, placement/cell scans, decision object, then possible event/task/workflow/operations copy and replacement map. No pending trips means guards still run, callbacks do not. |
| External slot union | remaining real background reservations plus genuinely narrow installation/Set source facts. Charge resourceClaims' supplied roots and emitted/indexed records. Its absent research root has empty sorting only; under-work-Set sorting stays excluded by actual root cuts. |
| Fresh policy/setup factories | branch fact literals and closure/returned-object construction each sweep, even if callbacks will not run. Use actual week, retained installation/technology/Set state. Factory creation is not a traversal of those roots; callback traversal is prepaid inside the sweep bill. |
| Restricted advance | exact162 body plus actual SORT_AND_KEYS from§2; no hidden advanceSetupWeek/enterPhase coupon. |
| Other advance | source-accounted phase bill below, including every possible repeated allocation/callback/copy. No unsupported-phase flag substitutes for a cost bill. |
| Sink drain and reconciliation | actual drain invocation; every returned row and raw ownerWeek, observation construction, indexed resource join, closure/grant, final reservation/binding reconciliation. Empty sink is not a free call. |
| Admitted release aftermath | exact zero/admitted-ID equality, release-ID bounded sort, pre-sweep retained-Set join, actual novelty helper some/map/copies per release, production filter and actual commitment prune. |
| Trace/projection closure | all company/physical/background tails to H, unknown release retained as null, complete path/hold/proof/projection construction and canonicalization. Prefixes/cut branches never become complete traces. |

The tiny shared due predicates are part of the producer's separate RED/source
gate, not another prerequisite campaign. Preserve the EXACT negation of the
existing refusal expressions; replacing `!(dueWeek > currentWeek)` with
`dueWeek <= currentWeek` is not mechanically equivalent for NaN caller values.
Keep original mode/week guards in the callers. The existing company helper is
narrowed by type only to its actual director/cast/craft fields; body unchanged.

## 6. The second frame is a wrap/Post owner bill

For a source whose entire non-new slate has just completed its first take, all
countdowns are4 and the pre-sweep task is completed. This is NOT162. The actual
4→3 path performs releaseCompletedPhase, wraps/wears once, then attempts Post.
An unavailable Post slot leaves remaining4 with no stage/scenery/occupied Set;
that is still a lawful complete frame, not a fabricated failure or retained hold.

Prepay the following separate components for every possible attempt:

```text
WRAP_ATTEMPT = RELEASE_PHASE + WRAP_EVENT_AND_WEAR
             + RESERVATION_TRANSITION(before, kept)
             + RELEASE_WORKFLOW_REPLACEMENT
             + POST_ALLOCATION
             + max(FAILED_REPLACEMENT,
                   RESERVATION_TRANSITION(kept, allocated)
                   + POST_POLICY_CALLBACK + PHASE_EVENT
                   + DERIVE_BINDINGS + SUCCESS_REPLACEMENT + PRODUCTION_COPY)
```

Only components structurally absent on a retry may use a cheaper retry bill;
the first-call reservation must cover every possible original wrap. `max` is
over complete success/failure bills, not a probability or favorable outcome.
Release and resulting capacity changes happen before attempted allocation.

The Post-specific exclusions are source facts: the required capabilities list
contains Post, not soundstage; requiresSetForPhase is false; no heldSetIds or
bindableSetsOn candidate loop executes; the target is not shooting, so no
shooting-task literal or technology lock is made; there is no setup resolver or
genre lookup. However `allowsFacility` still runs for EVERY supplied facility
BEFORE sorting. The selected silent/sound policy and actual occupancy union are
never replaced by a guessed free-slot count.

| Component | Source-proven variable work that must be included |
| --- | --- |
| RELEASE_PHASE | finite phase-capability table reads; original reservation visits/retained includes; kept/released arrays and writes; workflow/bindings spreads; kept stage scan and deriveBindings lookup. Retained historical setId is only a reference, not an occupancy claim. |
| WRAP_EVENT_AND_WEAR | original stage reservation find, event literal + stamped sink wrapper/push, actual Set some then map and exact target shallow copy/condition overwrite. Source order retained; no Set sort. |
| RESERVATION_TRANSITION | both key maps, every key construction/slot conversion, both includes walks and repeated key operands, exact event literals and append wrappers. Zero retained keys do not remove the invocation/empty array/control cost. |
| POST_ALLOCATION | actual occupiedSlots clone/union; full production-only resourceClaims passes and filter/index; policy selection/adoption/install scan for every facility; facility spread/filter and shared sort; empty retention scan; Post facility comparisons and every possibly examined slot/key/occupied membership; literal reservation and result/blocker. |
| Derived/update arms | actual workflow maps and ID comparisons, all measured workflow/bindings/operations/P shallow copies and changed fields; callback's non-shooting guard; phase event; result literal. |

All freshly wrapped pictures release their original stage/scenery at most once.
Within an all-countdown4 sweep Post capacity can only be acquired, never released;
its selected policy does not change on Post entry. Thus a failed Post attempt
cannot become successful later in this same sweep. Each initial release causes
one restart; a previously failed earlier-priority picture can be retried before
each subsequent release and once in the final pass. A conservative exact-domain
attempt bound is `N*(N+3)/2` (2 for N1,5 for N2), with at most N+1 rounds.
Do NOT use that tighter bound for a mixed slate containing a Post release or a
phase/policy change. For such slates the general source bound remains at most
N*(2N+1) visits, with separately charged branch bodies.

Fresh-original wrap events/wear/release maps are bounded by N, not by all retry
attempts. Success grants/phase events/P copies are likewise at most N. Retry
allocation, failed workflow replacement and selection scans are multiplied by
the retry bound. This separation makes a real two-picture Post wait affordable
without assuming both pictures get Post or weakening the actual allocator.

## 7. Actual useful controls, not invented measurements

Independent178/179 ran on unchanged published d9ebb810, with an EMPTY production
patch.179 exited0 with fixedSource:true. Both controls were produced by real
greenlight, director, arrival and scheduling owners; no clock, cash, forecast,
history, company or operations root was fabricated. Genuine makeSave validation
passed for each source and both subsequent states, and the original sources
were unchanged. Those checks establish constructibility and owner parity only.

| Actual source fact | One picture | Two pictures |
| --- | ---: | ---: |
| Source week; planned horizon |4;6|4;6|
| Current production/workflow rows |1|2|
| Scheduled countdown; actual take week |5;5|5;5|
| Current reservations |2|4|
| Disjoint company people, excluding credited writer |5|10|
| Facilities; total capacity; Post capacity |5;8;2|5;8;2|
| Standing Sets; concepts |2;30|2;30|
| Current technology production rows, silent |1|2|
| Property structures; provided-facility IDs |8;5|8;5|
| Placement cells / active own writing / audition sessions |0 / 0 / 0|0 / 0 / 0|
| Maximum production-ID length |9|11|
| Maximum enumerated ID length, all consumed groups |28|28|
| Enumerated ID occurrences; their character sum |75;790|96;1004|
| Actual wraps / reservation releases / Post grants at week6 |1 / 2 / 1|2 / 4 / 2|

The earlier paper capacity6 is NOT the genuine control:179 has capacity8.
Four foreign businesses with no current pictures, five indexed script rows/five
writer IDs, one disjoint draft due6, and four foreign STARTED physical plans are
retained. They must be inspected as required by the root-derived cuts, not erased
to make an apparently cheap source. Own queue, construction, active research,
pending adoption and Set-work cuts are empty. These facts are recorded in179;
the producer must establish them from its input, not accept test-only flags.

The measured enumerable-key copy footprints in162's units are:

| Record | Own keys | Sum of key lengths | copy(record) |
| --- | ---: | ---: | ---: |
| Full production |13|110|150|
| Operations |3|23|33|
| Workflow |8|73|98|
| Shooting task |5|50|66|
| Bindings |6|76|95|
| Set |12|100|137|
| Technology root |9|104|132|
| Technology production row |5|46|62|
| Property structure |6|45|64|

These numbers cannot replace discovery when caller P has additional ordinary
own-string-key fields. Full records and marker references must survive replay.

In both controls the first frame emits the take at(5,0); the second actually
wraps into Post at countdown3. Each used Set wears100→91 exactly once. Each
picture releases stage and scenery, grants a distinct real Post slot, retains
historical setId but no Set occupancy, and retains all five company people
through(6,0). Actual release is unknown, so its trace calendar release is null.
The independent control must compare these roots and ordered events against
the genuine two-tick result, not only count first takes.

For these EXACT silent controls a tighter successful-allocation branch is
available before the second owner call: there are two operational Post slots,
no other Post/external occupancy, and at most two pictures. Actual silent policy
admits the facilities. Thus each picture's first Post attempt succeeds; charge
N allocator invocations and the actual restart/settled-visit bound, not the
general failed-retry bound. All inspection needed to prove that selection is
itself charged. This is a bill optimization, never a substitute allocator or a
claim that arbitrary two-picture states have two usable Post slots.

## 8. Observer, budget and kernel verification seams

No new public observer/cost coupon is added to137's API. Tests use transparent
pass-through spies on the actual imported owner functions; their implementation
executes at the original call time and receives the real whole current slate.
The spy may count/record calls and returned events, not replace allocation,
invent a phase, return a fake technology collector or calculate expected tariff
by calling the implementation's own private cost function. Existing owner sink
events plus the public closed ReplayObservation union expose chronology.

For every complete frame, `sweepStarted` is appended only AFTER the full sweep
bill has been reserved and immediately before calling the actual sweep. Raw
sink reservation releases/grants retain their original order and ownerWeek;
first takes use the arrived boundary. The fixed sink/callback overhead and all
possible captured rows are part of the reserved sweep bill. A later ledger
reconciliation may itself hit workLimit: that attempt remains a cut and must
not expose a complete trace, even though its already-paid sweep ran lawfully.

Independent acceptance cases for the implementation gate:

1. The genuine one/two sources with one empty-command plan and H6 each yield a
   COMPLETE real trace within the shared200000 limit, including preparation,
   both frames, certificate and the unchanged strict trace-kernel invocation.
   Projection, real take, wrap/Post/wear, full company/resource ledger, immutable
   source and generic marker identity are checked separately. This is a required
   useful control, not yet a passing result in this document.
2. Feed fixedHolds/complete traces to `searchPromiseCapacityTraces` with
   returned preparationWork, the SAME200000 limit, and honest incomplete owner
   choice coverage. Demand windows include week5 strictly before H6. Assert
   actual take/count progress and no internalError/work-limit caused by a broken
   ledger. Do not demand CERTIFIED_ACHIEVABLE: distinct companies do not provide
   B2 for one person, and this finite replay has no complete future-choice proof.
3. Zero work and genuinely tiny work stop without external owner calls. A
   zero-span H==now input still validates/charges consumed facts and returns the
   unchanged projection and valid zero-length current paths/holds if affordable;
   it calls no scenery, policy, setup or sweep owner. Exhaustion during even
   that preparation gives a real cut, not a counterfeit successful empty trace.
4. For an unchanged input, deterministic lower-limit cases straddle a real
   first/second sweep admission boundary. Transparent spies verify no sweep is
   invoked on the unaffordable side and that the called side executes the real
   whole-slate owner. It is acceptable for tests to discover this boundary by a
   bounded binary search over integer limits0..200000; expected owner semantics
   and total cap remain independent assertions, not private-tariff self-equality.
   Static source review additionally proves the reserved bill is conservative;
   invocation counts alone cannot prove it.
5. Two canonically ordered plans share one allowance, including rejected or cut
   prefixes. A cap sufficient for only a prefix never buys a fresh second-plan
   allowance. Compare cumulative work/calls and omissions under plan permutation;
   do not assert work equals two standalone calls because shared preparation is
   deliberately not repeated. Preexisting input.preparationWork is never lost.
6. Long trace keys, long IDs and added own P fields consume repeated actual
   operand/copy work; they cannot obtain certificates through a fixed character
   allowance. A work cut preserves only already-built provenance. A command
   addressing a picture released earlier in its branch refuses against current
   state and cannot resurrect its original record.

Trace-kernel validation uses91/94's existing separate entry and mandatory full
ledger. All background and uncredited paths remain present; no trace fragments
are spliced. The kernel's normal workUsed includes producer preparationWork.
Producer and kernel do NOT run with separate fresh limits. No kernel source or
new blanket completeness flag is needed for this tranche.

## 9. Concrete next code gate — no more prerequisite extraction

Subject to parent release after independent behavioral RED, the narrow source
scope is:

- NEW `src/core/promiseCapacityOwnerReplay.ts`:137 public types/function,
  charged preparation and immutable branch state, root-derived cuts, current
  command dispatch, actual whole-slate frame calls, ordered certificate ledger,
  shared pre-call bills and complete/cut results. Its private accounting helpers
  and indexes stay local; do not create another framework or change the kernel.
- `src/core/scriptDevelopment.ts`: export `scriptWorkDueAt` and reuse that exact
  predicate in completeDueScriptWork, leaving mode/assessment/results unchanged.
- `src/core/castingSessions.ts`: export `castingWorkDueAt` and reuse it in
  completeDueCastingSessions, leaving mode/week guards and results unchanged.
- `src/core/productionPeople.ts`: only narrow productionCompanyTalentIds's
  argument type to the actual readonly directorId/cast/craftIds view; body stays
  unchanged. Existing complete-P callers retain their behavior.

The published type-fact seams, generic clock, real bounded sorter, strict kernel
and actual owner bodies already exist. No new owner-policy extraction is needed.
No actions/tick import, duplicated assignment/allocation/completion pipeline,
fake GameState/Production, symbol-discovery pretense, forecast, save/projection/
rules bump, natural feasibility/policy activation or index export belongs here.
No claim is made for rival replay or unenumerated future admissions. The actual
player contexts supported by137 stay supported; branch breadth may exhaust work
honestly but must not become a permanent unsupported-phase shortcut.

Implementation may proceed incrementally inside that release: save the counter,
preparation and actual-owner orchestration first, then complete certificate and
bills, then freeze for independent tests/typechecks/review. Partial source must
not be described as certified or wired live. If an actual required owner read
falls outside the agreed fact view, report that exact dependency before widening
scope; do not invent a placeholder fact or another planning campaign.

## 10. Remaining proof obligations, explicitly not accepted totals

The full production-only resourceClaims/filter/index scalar bill, general
policy/adoption/installation callbacks, all setup/arrival/longer-transition
branches, and complete producer preparation/joins/output canonicalization still
need source-level scalar composition in the implementation. The§6 formula names
those branches but is not itself a closed numeric tariff. General phases use
safe before-call upper bounds selected from already-read facts; tight genuine
controls may use proven restricted branches. Cost-calculator arithmetic, key
discovery and the calculators' own lookups are charged as well.

The final certificate/input construction and unchanged kernel scan/search must
be included in the useful-control bound. Kernel expenditure is established by
its real result under transferred preparationWork, not an invented residual or
an assumed constant. A claimed200000 whole-control paper proof would currently
be false: this document does NOT assert one, nor replace it with the withdrawn
67,904 estimate. No fabricated wrap or preparation scalar is approved here.

The implementation handback must identify each owner bill's source blocks,
variable factors, branch preconditions and exact call reservation site; review
must check repeated comparisons/callbacks/copies against those blocks. Parent
then runs the independent real-control and lower-budget cases, strict kernel,
adjacent owners and typechecks. The gate requires BOTH conservative prepayment
and useful complete one/two-picture controls within the shared cap. If either
fails, fix the real source/bill and retest—do not weaken the limit, validator,
test, endpoint or supported ordinary-picture semantics.

This is the honest remaining implementation/verification work, not an Owner
product decision or authorization to stop after another readiness report.
