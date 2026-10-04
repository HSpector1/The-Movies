# 1363-A2 — recovery charter r2 addendum: non-core disposal and loan restart

Draft for independent review and parent adoption, 2026-10-04. Source inspection only; no tests, probes, production edits or fixture reads. Read this with 1363-A and 1363-F. The Owner's 1366-O controls the two new rules; this addendum supersedes the conflicting facility-exclusion and loan-exit passages, not the remaining charter.

Source baseline: reviewed Save45 candidate `ee289de67e453ce269c98d840a48799265c62993`, `/Users/zacheryspector/studio-scratch/1361-sweep/x3/tree`. Every `file:line` below is relative to `src/core/` on that immutable candidate. Source must be rechecked at the actual recovery base; no citation claims the candidate is landed. E means the existing p14b4-20260919 evidence directory.

## 1. Adopted scope and exact source findings

Parts A and B retain 1363-F's twelve amendments. Part C permits recovery disposal of eligible non-core plant at the player's demolition refund. A P15B loan principal ends cost-cutting. Genuine failure, no replacement studios, no minimum population, no subsidy and no survival guarantee remain binding.

The **eligible blueprint list is exactly `research-laboratory`**, a Research Laboratory body. Present rival capacity beyond the four original facilities consists only of up to two laboratories (`hollywoodValidation.ts:373-390`). Do not infer eligibility from `capability !== soundstage` or from whatever blueprints the player can build.

The four original facilities remain protected by exact identity and their existing order/configuration:

| Identity suffix | Facility | Recovery disposition |
|---|---|---|
| `:development` | Development & Casting | Always retain |
| `:stage` | Production Stage | Always retain |
| `:scenery` | Scenery Shop | Always retain |
| `:post` | Post Building | Always retain |

Their canonical source is `rivalStartingFacilities` (`hollywood.ts:145-152`). The original acquisition charge remains unchanged. Sound-stage/post conversions, instrument modules, other player blueprints, unfinished laboratory construction and terminal estates are not eligible bodies under Part C.

**Important actual dependency limit:** player demolition refuses installed equipment and retained research dependencies (`placement.ts:1139-1152,1244-1255`; `occupancy.ts:389-405`). Rival research validators require even historical project and seat laboratory references to identify existing laboratories (`technology.ts:962-975`). Part C does not authorize removal of those dependencies or a new cancellation/disposition law. Consequently an instrumented or historically research-used laboratory will ordinarily remain protected. The selected list is not a claim that every laboratory is disposable, or that any measured route will realize a refund.

The existing player formula is `facilityDemolitionRefund(blueprint) = Math.round(blueprint.capex * FACILITY_DEMOLITION_REFUND_FRACTION)` (`placement.ts:1341-1344`); the fraction is 0.5 (`tuning.ts:1988`). The eligible laboratory's authored capex is 900,000 and opex is 3,000/week (`tuning.ts:759,761,1372-1377`), so **the current body-only refund is 450,000**. These are source facts, not new tuning values. Reuse the existing function and blueprint object; do not duplicate the formula or invent values for modules, work, land, future income or research.

## 2. Part A/B reconciliation carried forward

- `unaffordableViable` is opt-in only for the refusal re-search. Ordinary chooser results, existing `affordable`, `unaffordable`, `viable` counts, order and forecast cost stay unchanged. The extra forecast uses the same keyed forecast input; it consumes no simulation RNG.
- Entry retains 1363-A §4.1's three conditions. A renewal refused for cash is not a vacant-slot signal: only the actual unfilled-slot reserve refusal qualifies. Busy writers, holds and economic rejection alone do not qualify. Instrumentation must record refused package cost beside available cash.
- The existing R3 checks and the payback inequality remain required for each staff release, in employment order with recomputed cash and operating cost. The inequality protects the zero-cash boundary **under that week's operating cost**; research expenditure and later loan installments are outside that algebra.
- Cutting rivals make no new commitments. Skip the rival at the top of **every** talent-market case pass, including retirement extension; withdraw its proposals before settlement. Active research continues. No new plans, adoptions, seats or projects; no new pause/cancellation policy.
- `since` constraints mean strictly later weeks. Validate adoption **commitment** weeks rather than operational weeks, because a previously committed adoption can complete after entry. Keep the entry-week staffing order allowance. A disposal receipt is allowed after `since`.
- Strip the new era fields from `validatedLiveProfessionContext` before its frozen proof; verify the proof directly on a live state with `since` set, so a swallowed `tick()` refusal cannot conceal failure.
- The mixed-sequence shelving leaf keeps its counting-under-staffing-block subject via a non-cash block; a separate leaf retains the original reserve-plus-one setup to assert cost-cutting entry. Declare this input edit. Include the drained-rival decline-reasons case B in fallout.
- Part B alone adds no positive movement. In A+B+C, the only newly allowed positive movement is the precisely reconciled Part C refund. Replace the old blanket B5 assertion accordingly; all original receipts/history remain.

## 3. Part C policy and refusal authority

Expose one pure recovery-disposal eligibility predicate over a rival business and its authoritative Hollywood, physical-plan, technology and capacity roots. Both policy and mutation use it; do not call the player placement verb with invented placements. Refusal is byte-neutral.

A facility is eligible only when all of these hold:

1. The studio is a present rival business with `costCutting.since !== null`; the exact facility belongs to it and is not one of its four core identities. Player, unknown/foreign IDs and already disposed IDs refuse.
2. It is an operational laboratory body from the explicit eligible blueprint. Exactly one same-studio `laboratoryCommitted` receipt names its body plan; that admitted placement plan is paid, and exactly one `laboratoryOperational` receipt establishes completion. A body still under construction is committed work and refuses.
3. No production, workflow, script or other occupied/reserved capacity names the facility. Guard the actual rival roots, not only player occupancy. Check exact facility/slot identities; an empty current production array alone is not a sufficient safety proof.
4. No same-studio research project names it as the primary laboratory or in any seat/history reference, irrespective of active/paused/cancelled/completed status or released-seat status. This preserves the existing historical referential invariant; do not delete projects, move seats, erase verified work or rewrite identities to make disposal pass.
5. No admitted installation targets it, and no operational instrument receipt names it. Installed modules remain operational dependencies even with no current scientist. No new refund or retirement rule for instruments is invented.
6. No surviving queued/held/started installation or dependent plan requires the facility or its body plan, directly or transitively. Walk exact same-studio dependencies with existing plan invariants; a cancelled, uncommitted intent is not a live obligation. The body's own **completed** admitted plan is provenance, not a blocking unfinished job.
7. No technology adoption or other required operational dependency names the facility. The known adoptions concern protected stage/post plant; the explicit guard still fails closed on a future dependency.

Policy execution: after this week's `decide()` has entered or retained cost-cutting and before this rival's weekly `facilityOpex` booking, consider the eligible bodies in their original `laboratoryCommitted` receipt order. Dispose each lawful body once, recomputing eligibility after each mutation. Do not repeat `staff()` or `decide()` in that week to spend the refund. Existing staff releases occur in their existing phase; a refund is not retroactively available to that phase.

This fixed order has no quota, auction, price search or new economic threshold. It removes only currently unused, lawfully disposable bodies while the studio is already downsizing. Retained/blocked bodies continue paying their existing costs. A body becoming operational at the end of a tick is considered at the next recovery pass, never before completion.

## 4. Atomic persistence, money and operation boundary

Add exactly one rival money kind, **`facilityDemolitionRefund`**, and one IndustryReceipt variant:

`{ kind: 'facilityDisposed'; facilityId: string; planId: string; blueprintId: 'research-laboratory'; refund: number }`

It carries the existing receipt envelope `{eventId, week, studioId}`. The receipt, not a new duplicate facility archive, is the disposal tombstone. Keep original body plans, quotes, commitment/operational receipts and all history. No new money kind is substituted for the original research-capacity expense.

One successful local mutation atomically removes the live body from `operations.facilities`, appends the canonical receipt and books exactly its refund through `moveRivalMoney(account, 'facilityDemolitionRefund', refund, week)`. No cash write outside that owner. Receipt uniqueness is keyed by `(studioId, facilityId)`, and also requires the unique body plan; generic unique event IDs alone are insufficient. Repeated calls, tick continuation and save/reload cannot recreate or repay it.

The receipt refund must equal the shared player's function on the exact eligible blueprint. Prove the paid body plan/quote and commitment; do not refund aggregate `researchCapacity` or include instrument installation costs. Retain the existing strictly-lossy capital check (refund below the actual paid eligible body cost). Historical capex remains spent; receipts and finance period openings/closings reconcile without rewriting prior periods.

For a body operational at week O and disposed in week D before booking that week's costs, charge its 3,000/week for `[O,D)`; a held body is charged for `[O,T)` at saved tick T. Calculate `max(0, min(T,D)-O)` from the recorded boundary. The four core facilities still pay from studio entry. This replaces only the laboratory term of `hollywoodValidation.ts:319-323`; instrument costs continue unchanged because an instrumented laboratory cannot be disposed. A disposal at O earns zero operating weeks, consistent with end-of-prior-tick completion and disposal before the next cost booking. Cover the year/finance-period boundary explicitly.

Update the two-way validator: every operational laboratory must either stand or have exactly one valid disposal receipt, never both/neither. A disposal must have its matching commitment, operational receipt, paid plan, legal chronology and exact refund. Historical operational receipts may identify a removed body only through that proof. Core configuration remains strict. Sum refund receipts within each finance period and require exact reconciliation with that period's new movement; reject negative refunds, extra cash, wrong-period cash and missing/duplicate receipts. The current positive-money whitelist (`hollywoodValidation.ts:295`) allows only `studioRevenue`: the new disposal era adds only `facilityDemolitionRefund`, with the exact receipt reconciliation above. Every older era keeps its existing sign law; all other movement signs remain unchanged.

**Mandatory rematerialization fix:** `completeRivalPlans` (`rivalResearch.ts:285-292`) currently reconstructs any missing laboratory from its retained `started` body plan. It must treat a matching lawful disposal as terminal for that body: append neither another facility nor another operational receipt. The historical body plan stays `started`; this amendment introduces no general physical-plan lifecycle rewrite.

Leave the existing two-plan admission limit and deterministic IDs unchanged (`rivalResearch.ts:155-166`). Disposal does not free an historical plan ordinal or authorize replacement laboratory construction. Resume filming requires the retained core facilities, not a newly invented replacement-lab policy.

## 5. Save era and loan exit

Part A still needs no shape/version step. Parts B+C share **the next free step N after actual Save45 landing**, allocated by the parent against 1364/1365 and later P15B. Do not hard-code an assumed Save46/47 in tests or the charter before allocation.

- Add `costCutting: {version: 1; since: number | null}` to each live rival and the zero `facilityDemolitionRefund` key to every historical finance period. New period construction includes the key.
- Thread explicit `rivalCostCutting` and `rivalFacilityDisposal` era flags through frozen readers. Old eras reject the new shape/movement/receipt and retain their previous facility/opex reconciliation, rather than sniffing fields from input.
- Up-migration supplies `{version:1,since:null}` and zeros only. It adds no receipt, disposes nothing, pays no refund and reconstructs no cost-cutting episode. All historical bytes that do not require the additive shape remain unchanged.
- Down-migration strips the fields only when every `since` is null, all refund movements are zero **and no disposal receipt exists**. Otherwise refuse by the named state being discarded. Never recreate a laboratory or drop a paid receipt to make downgrade pass.
- The live profession proof (`save.ts:10528-10555`) descends through the full Hollywood validator (`save.ts:8084`): stripping the refund cannot make a disposed state valid. Retain 1363-F ruling 4's `costCutting` strip in this internal view, but preserve the real refund movement, disposal receipt and absent body; pass `rivalFacilityDisposal=true` explicitly through `proveProfessionSave` and the internal validation chain. Pass the cost-cutting era as false for this stripped proof view, while the actual era-N validator uses both flags. This is the existing shelving-era pattern, not an older save envelope accepted by a public reader. Old public entrypoints default both flags false. Test direct proof with disposed and non-disposed states; never fabricate a refund-free historical economy.
- Save/reload preserves the tombstone and refund; deterministic continuation must match the unsaved route, including completion of pending unrelated plans.

**O6 integration contract:** committing a P15B rival loan principal and clearing `costCutting.since` are one atomic state transition. Refused borrowing, previews, loan requests, installment payments and a duplicate principal attempt do not clear it. The next ordinary staffing/decision opportunity uses the normal rules; if principal commits before that week's staffing, that staffing may proceed. No special hire or greenlight bypass. P15B owns the actual loan call site when it lands and must test it before re-probe 2.

A disposal refund does **not** itself clear `since`; the Owner selected loan principal and the existing greenlight exit. A rival retaining a full team may greenlight after a refund under the ordinary later decision and then exit. If it has already lost necessary staff, the refund alone does not authorize rehiring. Therefore 1363-F's pre-loan terminality disclosure becomes conditional: A+B remains terminal without inflow as previously found; C can supply limited cash and permit a retained-team restart, but need not do so. Measure the actual outcome. Later loan-driven hiring can be followed by a new cost-cutting episode and lawful termination charges; no permanent exemption is created.

## 6. Independent RED requirements

Retain A1-A9, B1-B4/B7/B8 and S1-S4 with the 1363-F corrections. B6's per-release inequality folds into B3; route control (g) owns the route-level no-hastening claim. B5 separately proves Part B has no inflow and Part C has only backed refunds.

Add `tests/p14d2-rival-facility-disposal.test.ts` and era-N save tests with these independently derived cases:

| Case | Required assertion |
|---|---|
| C1 lawful bare body | A paid operational empty lab on a cutting rival is removed; shared blueprint calculation yields current 450,000; cash, one receipt and one period movement agree. Other roots/history are unchanged. |
| C2 exact eligibility | Each of four core identities, player/foreign/unknown IDs, non-lab and non-cutting cases refuse without mutation. |
| C3 commitment/dependency | Under-construction lab, committed or operational instrument, queued/held dependency, transitive dependency and adoption reference each refuse at the named guard. Do not use an already-invalid premise to claim isolation. |
| C4 occupied/history | Live reserved slot, active research, paused/cancelled/completed retained project, and a released historical seat reference each remain protected. Completed work/verified units/IDs are preserved. |
| C5 boundary/accounting | O-to-D interval, disposal at O, ordinary week and finance-year boundary; remaining core and retained instrument costs stay exact. Old capex is not refunded twice or rewritten. |
| C6 replay | An explicit repeated disposal request returns the named already-disposed refusal without mutation; a repeated policy/completion pass is a no-op for that body. A 60-tick saved/reloaded continuation equals uninterrupted continuation and never rematerializes plant. |
| C7 tampering | One independent tamper each: duplicate disposition/plan, wrong studio/body, wrong refund/blueprint, future/pre-operational date, standing-and-disposed, missing predecessor, extra/wrong-period cash, negative movement, missing tombstone. |
| C8 deterministic order | Two lawful bare laboratories dispose in commitment order; a protected earlier one does not prevent a later lawful one. No input reorder changes a canonical saved route. |
| C9 exit semantics | Refund retains cutting until a real greenlight; retained-team later greenlight clears it; an unstaffed refunded studio does not silently hire. |
| S5 era | Genuine N-1 capture lifts with null/zero; idempotence; empty lossless down; set-since/nonzero-movement/disposal each refuse downgrade; old-era readers refuse new keys/receipt. |
| S6 proof | Direct live profession proof passes with since set, and with a lawful disposal, rather than relying on tick's catch. |
| L1 principal (P15B) | Accepted principal clears cutting atomically and permits ordinary next staffing; refusal/duplicate/installment do not; later re-entry and second charged release remain lawful. |

Use valid no-op controls and independent ledger/history expectations. Synthetic guard mutants do not substitute for a naturally achieved full integration route. If a lawful bare laboratory never occurs in measured routes, report zero eligible bodies/refunds and the blocking reasons; do not broaden the law to make a green result.

## 7. Slices, measurements and acceptance

1. Before Part A lands, preserve the Save45 baseline, G-L comparison, A8's genuine v1-frozen-count capture and the old-source pre-shelving capture where required. Name new paths before minting; original fixtures remain. Obtain independent RED review.
2. Implement Part A (opt-in search diagnostic/refusal classification), without a save step. It may land independently only with its own GREEN/fallout/broad gates per 1363-F.
3. Implement the allocated N-era state, movements, receipt validation/migrations and frozen-proof plumbing; then Part B's entry/restrictions/releases; then Part C's refusal/atomic disposal/completion guard/opex reconciliation. One production writer; coherent commits with the handoff updated at checkpoints. No partial playable landing claiming disposal before accounting and persistence agree.
4. Run focused GREEN and direct proof checks; independent implementation review; measured fallout/capture census; classified live sweep; landed broad/type/generator gates. Do not repin unrelated failures or overwrite historical fixtures.
5. Run 1363-V on one integrated A+B+C candidate with control/A/A+B comparison arms where attribution requires them. G-P and G-L use that exact candidate/manifest, with Save45 G-L as prerequisite. Pressure-off keeps only the control and final-candidate comparison; later enabled shared-market pressure and actual P15B loans are separately re-probed before live closure acceptance.
6. Preserve the equal-basis promise attribution: 469a9547 vs ff803032, Part A on 469a9547 vs ff803032, then current candidate vs its control; candidate vs ff803032 is labelled confounded totals only. All 154 movements receive an explanation, including vanished proposals.

Extend each rival's measurements with: entry cash and refused package cost; disposal candidates and named refusal causes; disposal week/body/paid capital/refund; cumulative one-time refund separately from film revenue and loan principal; lab opex avoided, retained core/body/module costs, payroll/overhead/research spend and later installments; cash before/after; headcount/remedy counts; first subsequent hiring/commission/greenlight/first take/release/revenue; and outcome at each prescribed checkpoint. Report no-production dormant survivors separately from recovery, closure-due separately from actual closure, and temporary positive cash separately from sustainable operations.

False-positive entry remains a stop-and-parent-review condition. Apply that test to actual lawful ability to restart at entry, not an imaginary future loan/refund treated as present cash. A Proceed/Flag depending on dormant survivors routes to the Owner before the P15B RED. Retain the existing tuning boundaries: no new revenue source, greenlight economics, awareness, rival arrivals/templates or shelving-pruning rule is invented. O2-O5 require measured findings, not another speculative question round.

## 8. Readiness and bounded implementation risk

This is a draft contract, not implementation approval or passing evidence. Independent reviewer `/root/sweep_review` checked the exact source and found no substantive law/order conflict; its two requested clarifications (the positive-money whitelist and explicit repeated-request refusal versus policy no-op) are incorporated. The parent still owns adoption. The source settles eligibility, current refund, historical dependency limits, ordering and accounting boundary; no additional Owner product choice is needed to implement this bounded rule. Independent review must confirm that the completed-plan and exact-history restrictions faithfully preserve the existing player law.

The internal profession context is a known integration hazard, not an open design choice: its full Hollywood descent is verified at `save.ts:8084,10528-10555`. Section 5 requires explicit disposal-era threading while retaining real accounting. Independent review must inspect every intervening internal call and old public default; a simple field strip would be insufficient.

The key measurable limitation is explicit: existing instrument/retained-project dependencies may prevent nearly all natural disposals. Do not present the 450,000 theoretical body credit or protected filming capacity as evidence that any rival recovers. P15B loan restart must be exercised against the actual principal mutation once that owner exists.
