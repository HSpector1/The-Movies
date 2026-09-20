# 424 — Certified late-phase reserves

2026-09-20. Native sim-core. SOURCE FROZEN; production write ownership yielded.
Implemented FULL adopted423 A+B against published/exact-remote base
`812d50d8b6e83677c752a4188d1180b23e394c3e`.

Only `src/core/promiseCapacityOwnerReplay.ts` and this handback were written.
No runtime, tests, probes, typechecks, Git, network or delegation were run.
No tests, fixtures, owners, other calculators, caps, prices, validators, public
types/API, schema, versions or historical evidence were changed.

Source SHA-256 before:
`e7cb5ce0e44b7ef22235c391cdd01498c5b22315bb0edc08adb9ef6618e30621`.
Source SHA-256 frozen:
`17a25fef81d54df073471843651666770ebb9024b2c0339b3d11f62824cb4c00`.

## A. Exact existing wrap witness, two common visits

Immediately before common, separately paid8 constructs
`commonVisits = singleWrapSlot ? 2 : visits` (1387–1388). The existing410
singleWrapSlot proof is unchanged. commonVisits replaces visits ONLY as the
multiplier of the existing per-visit term at1390:

```text
25 + 4*keyBill(n,dp) + 1 + n*(1+pid) + 2*text
```

Earlier rounds, visits, attempts, wrap selector and fallback expressions remain.
No order/map initialization, output/copy/update/commitment term or per-visit
coefficient changed. The allocation/entry/release/wear/event reserves for wrap
remain410's. Additional B proof/control overhead is paid separately below.

Owner proof is exactly423: the certified sole older4 picture successfully
transitions, is settled, returns capacity and restarts. The next scan sees the
settled original ID and exits. No third visit occurs. No broader wrap witness
or two-visit claim for Post exit was introduced.

## B. Paid sole Post2→1 proof

New private `singlePostExitProof` at1268 returns boolean only. The single call
at1298 is AFTER both existing restricted and singleEarly return paths. Its
false result selects the existing general bill, never a new refusal or input
Error. It requires all of:

- d.n, productions.length and operations.workflows.length equal1;
- older-than-current-week production at remaining2;
- null shootingTask and exactly one current reservation;
- exact workflow/production ID match, postProduction phase and post capability.

No facility-availability, silent-policy or external-empty test is added. Counts
precede indexing. Existing source/owner validators and resource joins retain
their responsibilities; this predicate is not a replacement validator.

| Proof/caller block | BEFORE-execution charge | Actual operations |
| --- | ---: | --- |
| Caller |8| Five arguments, invocation and local boolean binding. |
| Counts |16| Three count reads/comparisons, short-circuit and early return controls. |
| Record references |12| Indexed production/workflow reads and local bindings. |
| Clock/task/reservation shape |24| startTick/week, remaining2, null task and reservation-count1 guards with their short circuits/early return. |
| Reservation reference |8| Indexed reservation access and binding. |
| Exact identity/phase/capability |32| Three comparison argument/field accesses, dispatch, conjunction and return controls. |

Full internal finite total is92, plus each actually reached Work.equal charge
of1+both string spans. The predicate has no loop, callback, constructed data
object, copied array, token, cache or owner call. No later block executes after
an earlier guard returns false.

## Full added selection/control inventory

The existing192-unit source blocks remain in both allocationBill and sweepBill.
New controls are separately prepaid, never silently absorbed by those blocks:

| Site | Added payment | New controls covered |
| --- | ---: | --- |
| allocationBill entry1084 |32| Six Post selectors: other-owner count, technology-row count, slots, retention, composite and requirement-driven facility-scan term. Flag reads and short-circuit/ternary dispatch are finite; no new walk or copy. |
| sweepBill1318 |32| Five Post selectors: wear, nonshooting callback, setup, shooting binding and attempts. Helpers still pay themselves when selected. |
| allocation caller1384 |16, previously8| Both private flag argument/binding/selector groups; the extra8 is not a reduced price elsewhere. |
| commonVisits1387 |8| Existing wrap flag read, ternary choice and local binding. |

allocationBill's six added read/dispatch pairs and default/branch controls fit
its32 finite allowance; sweepBill's five read/dispatch groups fit its separate32.
These blocks do not cover dynamic string equality, arithmetic helpers, copies,
sorting or callbacks; their existing separate payments remain. The call-site16
precedes evaluation of enter and its private flags. The new allocation32 is
inside the callee before any new selector expression. The new sweep32 precedes
every Post-dependent bill selection. All additions use fixed source counts,
not elapsed time or an observed owner result.

The ONLY allocationBill caller was inspected. It passes both paid proof flags;
the new private parameter defaults false. There is no public caller/API change.

## Exact changed terms and unchanged fallback

Only when singlePostExit is true:

| Component | Selected result |
| --- | --- |
| other/raw owner count |0 via existing max(0,n-1); retainedDevelopment is false for the proved older2 clock. |
| raw producer/occupancy |Existing complete expressions retained, including both empty workflow passes, setup constants and actual external slots. |
| policy selection |d.t rows, with no added possible shooting lock. Full adoption/installation/callback terms remain. |
| capacity slots |0 bodies. |
| retention |Existing20 setup constant; loop-body term0. |
| stage/Set composite |0. |
| requirement-driven facility walks |0. Full eager facility copy/filter/policy/sort is separate and retained. |
| wear |0: this is Post exit, not wrap. |
| phase-entry policy |Existing6+text nonshooting early-return price. |
| setup advance / shooting binding |0. |
| attempts |1; empty ReleaseReady requirements guarantee success. |
| common visits |Original3, because singleWrapSlot is false for remaining2. |

ReleasePhase,65, TWO complete transition bounds, THREE workflow-update bounds,
allocation result/construction constants, full workflow/binding/generic-P copies,
150 and every other common term remain. No coefficient or primitive price was
retuned. New selectors short-circuit only the calculator trees for the newly
proved zero terms; all executed calculator calls retain their own prepayments.

When the Post proof is false, every affected expression takes its previous
branch. Wrap has only A's exact common multiplier change, with its previous410
owner terms. Unqualified single pictures and multi-picture domains keep the
general owner reserve, subject to the honestly paid new predicate/control work.
Existing restricted and singleEarly returns precede all this new proof/control
work. In particular3→2 retains the original restricted bill.

## Symbolic correspondence and owner proof

All products/sums use the existing saturating helpers. Let E=d.external,
F=d.f, T=equality(d.d), K=d.d+26 and KB be unchanged keyBill. For the proved
Post case, the actual expressions reduce to the adopted423 formula:

```text
raw0       = 40 + 1 + 2
occupancy0 = raw0 + 4 + E + E*(5 + 3*KB(E,K))
selection0 = 17 + d.t*(1 + 2*T)
adoption0  = 30 + d.adoptions*(8 + 3*T)
                + 2*d.placements*(8 + 4*T)
allocation0 = occupancy0 + 3 + 3*F + F*(selection0 + adoption0)
              + sortBill(F,6 + 2*T) + 20 + 140
enter0 = releasePhase + 65 + 2*transition + 3*update + allocation0
         + workflowCopy + bindingsCopy + pCopy + 150
total = common(visits3) + enter0 + (6 + T)
```

The actual owner releases the sole Post reservation before allocation. There
are no other workflows. No stage means historical Set identity emits no bound
claim; the raw producer and external Set still execute. Release Ready's empty
requirements prevent capacity loops, retention bodies, composite binding and
capacity refusal. The existing policy still runs on EVERY facility, including
all sound-selection/adoption work, before the full sort. Successful entry calls
the actual nonshooting phase callback, releases/records the old reservation,
emits phaseEntered and makes the original full generic copies/updates.

No wrap/Set wear, setup advance, take, new technology lock or binding uplift
occurs. The actual successful production is settled in one attempt. It remains
on the slate at ReleaseReady1; later1→0 still requires real commitment and the
unchanged release/aftermath laws. Drain, ledger, provenance, output and kernel
work remain separately paid and unmodified.

These are retained qualified component prices with source-proven cardinalities
removed, not an independent proof of every inherited numerical coefficient.

## Static review, measured baseline and limits

Read FULL423 before editing. Inspected complete changed allocation/sweep bodies,
the new predicate, all private callers/flag occurrences and both early returns.
Confirmed exact prescribed payments, count-before-index order, actual string
payments, mutual exclusion of Post/wrap/retainedDevelopment witnesses, unchanged
fallback arithmetic and the sole commonVisits use. No known typing or dependency
blocker remains. Source hashing completed with the existing locale warning.

No verification runtime was executed by this writer. Parent425 must reconcile
actual source/payment inventory and426+ must run the immutable gate matrix.
420 remains the measured baseline: real Post3→2 completed; Post2→1 cut before
owner at42630/request161747; Ready firsttake completed actual wrap but cut during
drain. No new numerical fit, full-route completion or green claim is made here.

Coverage limits from423 remain: no genuine sound/external or multiple-Post-exit
replay control has been established here. Existing tests and original failure
evidence are unchanged, not replaced with synthesized fixtures.

SOURCE FROZEN; all production write ownership yielded. This is not whole-owner
accounting acceptance, Ready/B4 completion, live activation, Unity or Owner
acceptance. Parent owns serialized review/verification/publication and next work.
