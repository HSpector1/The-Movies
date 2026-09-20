# 207 — replay construction-accounting correction

2026-09-20. SOURCE FROZEN for parent verification. Native sim-core; implementation
of196 and the two concrete212 owner findings, under176. Not whole-cost acceptance.

Writable scope was ONLY `src/core/promiseCapacityOwnerReplay.ts` and this handback.
Production before correction is191, identical across a5eb3cf and the parent's
test-only40d0665 checkpoint. No runtime, tests, probes, typechecks, Git, network,
delegation or other source edits were performed by this writer.

| Source identity | SHA256 |
| --- | --- |
| Replay before207 | `6e681ce3a23e236e638efe1db2ee0ec340b17633133e70c3a187cf7d8c48662f` |
| Frozen replay207 | `a44871be73b70abc3df994db2deca94e21d09c224e1e299bd7c9bd8f309fdb10` |

## Construction model and full producer inventory

`L(keys)=1+sum(1+key.length)` is176's literal model. `LITERAL` lists the exact
SOURCE key schemas, computed once at module initialization, not from caller
objects and not cached by identity. Runtime uses reserve those numeric costs
BEFORE construction. This finite source-constant initialization is not a hidden
input scan or dynamically discovered object footprint. Nested literal arrays
cost `1+2n` (capacity plus writes); an append reserves3 (capacity, invocation,
reference write). Map headers/invocation reserve2 plus3 per callback/output,
before the callback's separate literal. Opaque values remain references.

The source table is the exhaustive key inventory; these are its construction
sites and additional array/write obligations, not unspecified residual coupons:

| Site / schema names | New separate reservations |
| --- | --- |
| `sorted`: decoration | `L(value,key)=11` each, append3, setup/empty array4; real sort and output map remain separate |
| `company`: four-seat local array | `1+2*4` before allocation; real company owner, strings, Set operations and result spread remain separately billed |
| `prepare`: boundary, plan | Two `L(week,step)`; empty raw/command arrays; each command append3; exact plan literal and append3 |
| `prepare`: pictureFacts, backgroundFacts, mount | Each full schema plus append3; casting's empty people array additionally1; singleton company input additionally3 |
| `prepare`: person, resource, fixedHold | Every subject literal before creation; full seven-field fixed hold plus append3; token work separate |
| `prepare`: prepared | Full eight-field returned context; all five owned collection headers reserved where created |
| `dimensions`: dimensions | Full27-field literal, in addition to the12 scalar setup steps and incremental measured property discovery |
| `boundary` | Exact two-field literal plus5 increment/control steps |
| `addHold`: hold, ledgerRow | Both nested literals plus append3 and8 scalar steps |
| `closeHold` / `closePath`: replacement | Measured hold spread/overwrite remains separate; each actual replacement literal plus append3 now explicit |
| `drainEvents`: ownerEvent, wrapped | Observation literal plus append3; wrap-fact literal plus append3; empty wrapped array and drain setup4; each generated Set resource subject separately paid |
| `reconcile`: expected, resource | Empty expected array1; each expected literal plus append3; nested Set subject additionally `L(resource)` |
| `completeTrace`: picture | `L(picture)=160`, greenlight boundary, two-reference fact array5, two empty arrays2, append3, apart from lookups/tokens |
| `completeTrace`: background | `L(background)=64`, two-reference fact array5, append3 and3 control steps; identical accounting for standing mounts |
| `completeTrace`: trace | Full trace literal, two-reference fact array5; additional-hold array header1 and each append3; three actual canonical sorts separately billed |
| `executeCommand`: sink, command | Sink fields plus drafts array1 and5 constructor/setup steps; full command observation and append3; boundary separately paid |
| `frame`: backgroundCompleted | Full five-field observation plus TWO appends3 (completed ID and observation),5 scalar steps; boundary/hold closure separately paid |
| `frame`: externalKeys / zeros | Header1 each and append3 per member; real Set and canonical sorting retain their separate bills |
| `frame`: technologyFacts, market | Full caller facts and nested tick literals; no substitution of owner return work for caller construction |
| `frame`: sink, boundary, sweepStarted, binding | Exact literals, sink's empty drafts array, observation append3 and15 scalar/call steps prepaid TOGETHER with the entire advance bill, before `sweepStarted` and the owner invocation |
| `frame`: pictureEvent | Exact first-take/release observation and append3; take boundary separately included; calendar reference overwrite/control reserved before assignment |
| Public entry: result | Full outer result prepaid once, three initial arrays and5 scalar steps, before preparation |
| Public entry: branch, ledgerRow, calendar | `L(branch)+3+2+F*(3+19)+2+P*(3+38)` before any branch/map construction;96 separately pays its fixed-arity calculator |
| Public success: complete, projection | Both full literals plus append3 and5 scalar steps; sorted completed-background array already paid |
| Context cut: cut, boundary | Full cut and boundary, empty provenance array1, append3 and5 scalar steps; final empty fixed array1/two-reference omissions5 separately reserved |
| Ordinary branch cut: cut, boundary | Both full literals, two appends3 and5 scalar steps; empty provenance array additionally1 if branch not built |
| Context/command exceptions: contextError, commandError | Before constructing a normal refusal, exact own diagnostic fields, detail/reason spans and8 finite call/control steps; same error classes/messages retained |

Reported196 replacements: ledger wrappers were4 each, now literal19 plus map
work; calendars were6, now literal38 plus map work. Picture proof rows were35,
now literal160 plus actual nested constructions. Background/mount rows were13,
now literal64 plus actual nested constructions. Outer branches/results and other
rows are not assumed to fit those old per-row allowances.

Only176's fixed administrative work-limit envelope is exempt. Zero/tiny work
does not build a positive proof; an exhausted prepared plan returns only its
already-known key/boundary/provenance references and constant diagnostic. Normal
context/refusal cuts are charged; if their construction cannot fit, they become
work-limit cuts. No remaining-plan scan is introduced.

## Concrete owner construction fixes (212 and release append)

| Actual unchanged owner | Before |207 prepayment |
| --- | --- | --- |
| `createProductionTechnologyPolicy` |60 covered caller and owner together | Caller `technologyFacts`/`market` literals PLUS owner outer19/inner35,12 call/scalar steps and4 closure allocations |
| `pruneReleasedCommitments` | `5+K*(4+keyBill)` | `5+L(commitments)+2+K*(5+keyBill)`; literal13, filter invocation/header2, callback/projection/predicate and worst-case retained capacity/write5; zero-release early return is conservatively overpaid |
| `withReleaseCommitment` | Combined110 and array/string terms | Explicit commitment row and returned authority literals, appended input array `1+2n`, mint namespace/input/output string span,12 scalar steps and the real bounded-sort bill |
| Direct `sink.append(releaseCommitted)` | Combined scalar allowance | Exact release draft, exact stamped wrapper, append3 and5 scalar/call steps |

Owner implementations are not edited. Real event order, current-state command
lookup, due-before-sweep, arrived take, stage/Set endpoint186, release/novelty,
company occupancy, original source/marker identity and projection shape remain.

## Touched calculator and variable-size accounting

`Work.token` now takes three/four fixed positional parts instead of an already
constructed caller array. It reserves its tuple allocation/capacity/writes FIRST,
then each part's dispatch6, checked product10 and two-term sum20. The JSON escaping
bound/output strings and resulting token bytes are unchanged. No uncharged rest
array at the token call sites remains.

`copyCost` still incrementally discovers every own string key and never visits
opaque values. It now separately prepays20 for each two-term saturating sum,
beside the discovery/name-span charge; returned shallow-copy footprints themselves
are unchanged. Caller copy bills therefore still count the real full record.

Sort-calculator passes now pay26: original six scalar/loop steps plus20 for the
two-term sum and its argument array. Final arithmetic reserves152: upper seven
sum operands60, seven products70, scalar reads/additions18 and result dispatch4.
The sorter execution bill/algorithm/order are unchanged. Command-bill calculator
now reserves224 BEFORE evaluating its outer sum/products/equality/workflowUpdate;
branch construction reserves96 before its sum/products. Commitment append and
prune calculators reserve96 and128 respectively; prune decomposes as36 outer sum,
10 product,68 nested keyBill/equality,14 setup. Saturation and the shared counter
are unchanged. These are bounded source-expression costs, not elapsed-time claims.

## Static checks, limits and next action

Read196/176 and full212; enumerated literal/array/map/push/new construction sites
and inspected touched owner bodies. `rg` found no trailing whitespace. No runtime
or typecheck was run. No new tested-result claim is made: parent205/206 concern
the PRIOR source. Passing headroom is not proof of cost conservatism.

SHA checks confirmed protected bytes unchanged:

| File | SHA256 |
| --- | --- |
| scriptDevelopment | `a82629e70d467c4716a280c7cac6fcaa67ce26137accc0d5d9e7835fefd63a49` |
| castingSessions | `497a8a32152e556378db96d8363be6de9a0719f2eed1fbec4a4fcfe222cf3a3b` |
| productionPeople | `2c6ea9affd6811d25cd36d85808d9470441f579153a7f0a2fb5b6a2c8a118d58` |
| promiseCapacityKernel | `1faa6fcac443dac046bd97fa3e27c61bada80c7297f8e69ea4ebcff76d899332` |
| operations | `9935b09495df1d11f39bf3b1a37b244c3d7bf7d0994cd4c8ce286571b3be3411` |
| boundedStableSort | `87861f3ceefe2b2a9163a34bd9762a991d5c8a7f1640b84fbe6d1133f33ff964` |
| releaseAuthority | `9ab259623d3b5f5f75f1d750168e68ccb5c14d27d96f06f4656985db8064b218` |
| installed182 | `d3fc0c003a1e4e58c2b9164e2e7d0cf8d6a9eccd3877037fcb1e668cbb8da790` |

Parent next: install only independently frozen209 as planned; serialize compiler,
24-case behavior/threshold/shared-budget and useful real one/two H6+kernel checks;
then independently review the frozen delta and exact literal inventory. Increased
honest charges may produce a new work-limit failure; do not increase200000 or
weaken tests.212 did not certify every older fixed owner coefficient, and this
handback does not silently turn that qualified inventory review into full proof.
No live P2/version/schema/capacity-law or complete-choice-domain activation, no
Unity/native/Owner acceptance. Source ownership is yielded pending diagnostics.
