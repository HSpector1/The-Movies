# 240 — next implementation: explicit source-now Ready admission

2026-09-20. Parent synthesis of completed native sim-core read-only source
recommendation and direct owner reads. Published predecessorc64317827ef740a550322cc51f3c782ff47dad58.
Concrete bounded interface for independent review/tests, NOT implemented/
accepted or a source-writer release. No new product decision is needed.
Do not turn this into another whole-project audit/extraction campaign.

## Deliverable and non-goals

Execute ONE explicitly supplied, genuinely assessed managed Ready-script staffing
choice at source-now per plan, then replay its ENTIRE original+new slate through
the actual existing owner sequence. Existing started-only API/tests stay intact.
Do not enumerate future admissions, hiring/renewals/commissions, budgets, screenplay
acceptances, queue policy or automatic commands. No live promise activation or
choice-completeness claim. Rival/unsupported roots keep137's honest cuts.

This is an operational-capacity trace, NOT an affordable-command receipt. Actual
actions retain forecast, freelancer fees, solvency/cash/ledger and participants.
No budget/forecast/participant placeholders, caller affordability boolean, cash
material digest or fabricated GameState. A caller executing greenlight still
uses its existing REAL financial gate; this service neither authorizes that action
nor certifies affordability. Existing-path Ready status is real committed source
work, not a hypothetical commission or instant stock shortcut.

## Concrete internal API proposal

Add a sibling export in promiseCapacityOwnerReplay.ts:

    replayReadyProductionPlans(input: ReadyOwnerReplayInput): ReadyOwnerReplayResult

ReadyOwnerReplayInput preserves issuerId, claimPersonIds, horizonEndWeek,
preparationWork and limits from the started entry. Its source is the GENUINE
current GameState passed by reference, never a reconstructed GameState. Reading
that full type is not permission to clone/hash/traverse irrelevant roots. Only
actual lower-owner reads and paid identity facts below are consumed.

Each plan has:

    { traceKey,
      readyChoice: { projectId, directorId, cast, craftIds },
      commands: ReadyPlanCommand[] }

ReadyPlanCommand is the existing command fields week/ordinal/kind with EXACTLY
one target arm:

    { productionId: string } // original production only
    { readyProjectId: string } // the plan's one Ready project only

No caller guesses/mints the future production identity. Commands targeting the
Ready project resolve its actual branch clock each time, including after release.
Do not rebind a removed production or resurrect its old source record.
Admission is the plan's first operation at(now,1), before its ordinary commands.
Commands still sort canonically by week/ordinal; at source-now ordinal0 is
reserved for admission, so ordinary command ordinals must be>=1 there.
Require H>now when a Ready admission is requested; no positive hold outside H.
Zero allowance still returns the fixed administrative cut before any owner call.

The result keeps global source fixedHolds, cumulative preparationWork, attempts
and omissions. Each complete attempt has the same compulsory joint trace/
provenance principles plus a Ready projection containing:

- productions: original complete production records with all opaque fields
  retained, updated by the real generic owner;
- plannedProductions: distinct narrow clocks with id/conceptId/writerId/
  directorId/cast/craftIds/startTick/remainingTicks plus projectId;
- operations, sets, technology, releaseAuthority, week and background completion
  facts as before;
- admissionScriptDevelopment: the exact detached root returned by the actual
  Ready→inProduction linker AT successful admission, retained as a snapshot.

The admissionScriptDevelopment field is NOT a horizon-state root or a valid
complete GameState claim. Compare it to the real IMMEDIATE greenlight root, not
later tick completion/assessment/Review or release→Produced status. This tranche
does not run screenplay assessments or markScriptProjectProduced; background
occupancy completion remains explicit in completedBackgroundPathKeys. Returning
the clearly named admission snapshot avoids fabricating later screenplay facts.

Do not cast a narrow clock to Production or fake forecast/budget/participants.
The narrow clock's id is a genuine WOULD-BE current allocation, not a new durable
receipt or a claim that a real film has been committed. Return no GameState,
money/ledger/history/firstTake receipt/root. New explicit admission provenance
must be EXACT { kind: 'readyAdmitted', at, projectId, productionId }; owner events
keep raw owner weeks. Existing started-only result shape remains unchanged.

## Reuse actual owners and exact diagnostic law

Use productionAdmission unchanged:
requireGreenlightHeader's assessed Ready/exact screenplay/casting acknowledgement/
founding/concept checks; resolveGreenlightStaffing's has-discipline and all-role
uniqueness/order; real production-plus-writing busy union; engaged-only craft/
employment/freelancer law when economyEngaged. Credited writer is neither engaged
labour nor a new person hold, but cannot fill another role on this picture.

Use actual isContracted/freelancerMarketIds at SOURCE-NOW. Uncontracted+idle does
not mean available freelancer. Do not pass a future optional week while leaving
the underlying current-employment source stale. Preserve ordinary economy mode.
Source-now avoids pretending future renewal/employment winners already exist.

Move ONLY the exact pure productionId allocator from actions255–261 to
productionIdentity as a shared export (suggested name allocateProductionId).
Both predictProductionId/applyGreenlight keep the same producer/body/ID union.
Replay uses actual persistedProductionIds over genuine current roots, not only
active/released arrays. This owner alone retains permission to inspect historical
production identities; replay must not independently read studio-event history
as scheduling evidence. A would-be ID can affect priority, so do not substitute
an invented sorting ID. No source ID/history remint or fixture rewrite.

Use addManagedProductionWorkflow unchanged with actual narrow clock,
TUNING.PRODUCTION_TICKS, exact script/casting/Set occupied-slot union and actual
nextSetId>0 marker. No technology/setup policy is inserted into initial admission
where real actions pass none. Capacity refusal means this explicit admission
branch is refused/incomplete, not a new production or invented queue. Do not
execute work after a refused admission.
Use existing cut.reason 'commandRefused' with the actual owner's honest detail
for lawful-but-refused explicit admission; no new admissionRefused enum.
Use linkScriptProjectToProduction unchanged in branch after real admission.
Reused Ready project cannot generate duplicate pictures or script+production paths.
This prohibits a source project already linked/non-Ready, not alternative plans:
the SAME Ready project across sibling staffing plans is explicitly LEGAL. Each
branch can independently allocate the same would-be production ID; its physical
screenplay path is shared across alternatives, never double capacity. One choice
per branch precludes two admissions in that branch; no cross-branch consumption.

## Whole-slate implementation and proof boundary

Share private preparation/branch/frame/trace code and ONE cumulative Work object
with the started entry. Do NOT restart public replay, reset its allowance, rebuild
original fixed holds or splice a new picture's solo calendar into the old trace.
At admission, append branch-local picture/calendar facts and exact new company/
facility holds. Existing/source background holds remain compulsory.

New physical path identity is JSON(['screenplay',issuerId,projectId]) across all
staffing alternatives; source Ready is existingPath:true. Would-be production
identity is an owner execution key, not a second physical opportunity. New person
holds start at actual successful admission boundary, resources at real ordered
grant boundaries; unknown person release stays null/full remaining horizon.
Original fixed rows still start(now,0); new holds belong to the branch's compulsory
additional ledger, never become global fixed rows shared by sibling plans.
Keep actual project linking and all original uncredited paths. Sibling branches
must not share the admitted clock, technology/event collector or linked root.

ClaimsAndHolds may be certified ONLY after full expanded relevant-person/
background guards; include proposed new company in foreign relevance checks.
ExistingCalendars/allOwnerTraces remain incomplete: one Ready choice is not the
complete legal command/staffing/future domain. No count/feasibility classification
or target-specific causal impossibility follows from refusal/search limits.

## Budget and independent tests

Prepay helper calls and ALL preparation, including actual identity-root walks/
strings/Set work/collision loop, employment/freelancer derivation, staffing/header
searches, eager occupancy production, initial allocator sort/filter/slot scans,
linker/root/row copies, literals, dynamic picture joins and all trace/output work.
Charge bill calculation itself using the reviewed scalar mechanism. Use current
source bounds, not a guessed lump, unmetered call, cap change or refund.
Original25 plus grandfather case and old started zero/threshold/kernel controls
stay unchanged. New helper must retain a useful real complete trace within the
SAME200000 including required kernel work; partial-cap cuts call no unpaid owner.
Global limits32claims/64units/1024headers+paths/220span remain where applicable.

Independent first cases: actual Ready greenlight→tick whole-slate parity; original
generic-field preservation; actual writer credit while writing/after release;
unavailable freelancer and unfinished audition refusal; occupied Development
refusal versus real action queue; identity collision retained by cancellation/
history; already-linked/non-Ready refusal; legal sibling choices for one project;
source/sibling purity; existing-slate priority;
admission/owner-call tiny cuts and shared budget/kernel. Keep real-action fixtures
and explicitly labelled controlled probes distinct; never relax strict saves,
validators, assertions, timeouts or source-history provenance to force a pass.

Bounded review should resolve interface/accounting hazards, not demand all future
choice enumeration now. Independent author can prepare inert fixtures/tests while
review runs, then freeze API/test bytes before ONE sim-core implementation release.
Production scope: replay module + exact identity/actions allocator move; no
unrelated owner changes, Unity/native code, live schema/version or promise policy.
