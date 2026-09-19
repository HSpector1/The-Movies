# Next owner extraction — narrow source facts, not implementation acceptance

Parent read the following actual owner seams while the independent kernel writer
and policy-test author worked on disjoint files after published1724784. This note
does not release another production writer, certify adapter completeness or alter
the already reviewed B4 plan/owner13–14. No runtime was started by this inspection.

## Calendar sharing can use a real narrow type

operations.ts advanceManagedProductions and private enterPhase read only these
Production fields: id, startTick, remainingTicks and directorId. They return
spread copies with countdown updates; actual callers need the complete original
Production preserved. productionsInSweepOrder reads id/startTick/remainingTicks;
productionWaitWeeks reads only startTick/remainingTicks. addManagedProductionWorkflow
reads id/startTick/remainingTicks; assignShootingDirector reads locked directorId/id.

A behavior-preserving generic clock view can let the actual allocator/sweep be
shared by detached planning without fabricating forecastSnapshot, financial data,
participants or a persisted Production. For example a named Pick of those four
fields, generic returned records retaining the caller's original type, and a
corresponding generic ManagedProductionAdvance. Do not cast a fake Production or
duplicate the allocator body. These are implementation mechanics, not a finalized
patch: the sole writer must verify all actual callers and strict typing.

ProductionAllocationPolicy.beforePhaseEntered currently accepts full Production;
the inspected createProductionTechnologyPolicy callback uses only production.id.
Keep the technology method/adoption/operational-chain checks and actual shooting
lock callback intact. Narrow/generic callback typing must preserve existing full
Production callers and not silently drop technology restrictions for planning.
allowsFacility already takes id/facility/targetPhase rather than a full record.
Validation of persisted operations/Production remains its existing strict owner;
it does not need weakened save admission merely to admit detached planning views.

The actual sweep skips greenlight-week advances, uses longest-waiting/ordinal
priority, and restarts after release until fixed point. It preserves output input
order. At5→4 a scheduled task and no blocker are required. Setup admission uses
currentTick+1 and credits no work on its admission visit. Release1→0 needs actual
commit authority; legacy operations emit no firstTake. Retain all these bodies.
Wrap releases stage/Set before a blocked Post acquisition; person holds still
last through release. Source facts agree with existing owner13/14, not a new clock.

Important adapter timestamp seam: both player and rival operations advance using
the PRE-increment currentTick/week. tick.ts1099 then appends BOTH returned first
takes using finalized.market.tick, the ARRIVED week, before outcomes/market.
Do not equate the sweep argument with the durable qualifying-event week.
Rival release results separately use their owner's pre-increment week, so a
release timestamp alone is not a substitute for the first-take append convention.
Ordered boundary steps must express actual command/sweep/arrival order consistently.

## Admission extraction must preserve caller-specific law

actions.ts greenlight validates screenplay Ready/assessment/facts and any pending
audition, has-discipline for writer/director/cast/craft, distinct cast and all-role
uniqueness. Its busy union is production-company PLUS active writing only.
The credited writer is excluded from engaged occupancy and contracted/freelancer
checks but still cannot double in the same picture. Engaged greenlight requires
one craft lead; director/cast/craft need actual current contract or current legal
freelancer market. Do not speculate future freelance availability/renewals.
Commissioning's broader industry/research busy predicate remains distinct per14.
requireCommissionableWriter also checks actual non-founding state, has-writing
profile and current studio contract, not future freelancer availability. Existing
drafting/rewriting holds include EVERY pooled writer; review/ready writer credit
does not continue that hold. scriptDraftWeeks is the shared duration owner: pool
uses its tuning constant, original uses office richness/perceived experience/
writer count and existing1..6 bounds; use persisted due dates for current projects.

Actual greenlight also has money/forecast/effects outside the read-only staffing
seam. Do not invoke it to produce hypothetical history, import actions/tick into
the lower adapter, or copy its entire committing pipeline. Preserve the existing
feasibility contract's relevant-input/cash distinction when selecting extracted
read inputs; no new financial policy is authorized by this note.

hollywoodTick operateStage assigns its locked director, clears its abstract
scenery blocker, then schedules READY before the rival sweep. Player scenery
arrivals only become READY; a subsequent command schedules. Do not transplant
either caller's sequence into the other or restore a historical duration comment.

## Read-only genuine current fixture check

The unchanged final-V29 current-P1 artifact at week45 has two target actors on
[0,52), but also actual writer/director/craft and complementary actors t-act-12
and t-act-13 contracted[13,221). Withdrawing the two player drafts does NOT erase
those people or old roots. Future adapter tests must inspect actual remaining
staffing rather than assume either no complementary cast or unlimited renewals.
The old bytes/mixed legacy-development + managed-operations modes remain intact.

Next after detached kernel verification: one writer performs any necessary narrow
owner extraction with existing regression checks, then real adapter alternatives/
digest integration and independent actual-calendar tests. A narrow type alone is
not a complete forward enumerator. Every selected alternative needs lawful owner
staffing, resource/time and cross-path facts; omitted domains remain explicit and
cannot prove negative maxima. Natural offer/performance validation is still owed.

## Existing regression anchors for that narrow extraction

No tests below were run during this read-only preparation. The actual technology
owner is src/core/technologyProduction.ts (not a technology/productionTechnology
subdirectory). tests/p13a-production-technology.test.ts directly passes the real
technology policy to the managed sweep and checks first-filming locks, sound
allocation and unchanged silent-route operations, ledger and RNG. Keep that
callback compatibility in any generic-clock extraction.

tests/operations.test.ts covers external slot occupancy, exact phase countdown,
same-week fixed-point release/longest-waiting priority, simultaneous pipelines,
illegal commands and cancellation. tests/c2a-m4-release-law.test.ts specifically
checks wrap with Post full, stage/Set release, Rehearsal-to-Shooting retention
and mid-sweep allocation. tests/p14b2-setup-wrap-regressions.test.ts preserves
strict completed setup authority across real wrap, blocked Post and save reload.
tests/p14b1-first-take.test.ts is the arrived-week durable-event anchor.

For a later admission-helper extraction, tests/p04a3-greenlight-law.test.ts checks
capacity-only queueing, credited out-of-contract writer eligibility/no freelancer
fee, unchanged director/cast/craft law and refusal of real out-of-contract writing.
tests/script-projects-actions.test.ts exercises Draft/Rewrite/Ready/Produced,
cancelled production identity and writer release/expiry through actual actions.
These are bounded regression selections, not new proofs of adapter completeness.
