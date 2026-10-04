# Part C: actual occupancy and dependency map

Source refreshed at live HEAD `2eaa697effc38538c37da28b486786ce267a2284` (Save45). Paths below are relative to `src/core/`. Read adopted 1363-A2 §§1,3–5 and the reviewed `1363-part-c-red-prep` tests/handback. This is a field/seam inventory, not new code, law, a passing test claim or a claim that Save46 exists. No runtime, Node, fixture payload or repository/index edits occurred.

## Owner and body identity

Use the exact `hollywood.businesses` row for `studioId`. Its `operations.facilities` owns the rival bodies; `StudioFacility` has only `id`, `name`, `capability`, `capacity` (`types.ts:599`). It has **no blueprint ID, paid-capital field, placement ID or disposal flag**. Establish eligible blueprint/capital through the unique same-studio `laboratoryCommitted {planId,facilityId}` receipt, its actual `physicalPlans.plans` row and quote/commit receipt. `laboratoryOperational {facilityId}` is the completion authority. Do not infer a plan from a facility suffix.

`rivalStartingFacilities` (`hollywood.ts:145`) fixes these four identities/configurations, in this order:

| ID | Capability | Capacity |
|---|---|---:|
| `${studioId}:development` | development-casting | 2 |
| `${studioId}:stage` | soundstage | 1 |
| `${studioId}:scenery` | set-scenery | 2 |
| `${studioId}:post` | post | 2 |

All four remain protected. The only eligible extra blueprint is `research-laboratory`. Current producer IDs are `${studioId}:laboratory:${historicalBodyPlanCount}` (`rivalResearch.ts:155–166`), but matching actual receipts/plans is authoritative. The count includes retained historical plans; disposal does not reset a quota or ID.

## Rival production, workflow and script references

Read the selected rival's own roots, not the player's `state.operations` / `state.scriptDevelopment`. `RivalBusiness` contains no separate casting-session, construction, placement, set or production-queue root (`hollywoodTypes.ts:103–122`). Do not pretend the player's roots belong to a rival.

| Exact field on the rival | Meaning / guard consequence |
|---|---|
| `productions[].id` | `Production` has no facility or slot field (`types.ts:237`). Join its ID to `operations.workflows[].productionId`; an empty production array alone proves no absence of references elsewhere. |
| `operations.workflows[].reservations[].facilityId`, `.slot` | Persisted exact facility/slot claim; also carries `productionId`, `capability`, `phase` (`types.ts:614–620`). Guard every matching reservation. |
| `operations.workflows[].shootingTask?.soundstageFacilityId` | Denormalized facility-only alias with no slot; preserve/check independently of reservations (`types.ts:623–629`; `occupancy.ts:426`). |
| `operations.workflows[].bindings.stageFacilityId` | Nullable denormalized live stage alias (`types.ts:661–675`); operations validator reconciles it to the soundstage reservation (`operations.ts:1086`). `bindings.setId` is a set ID, not a facility ID. |
| `operations.workflows[].setup?.stageFacilityId` | Exact stage named by retained setup work; also names `adoptionId`, `equipmentAssetId`, `setId` (`types.ts:688–720`). These are distinct namespaces; do not compare them to a facility ID. |
| `operations.workflows[].setup?.priorWork[].stageFacilityId` | Earlier binding history, not current slot occupancy. Preserve/check it. The type is recursive, but current producer flattens each prior record's `priorWork` to `[]`, and validator refuses further nesting (`productionSetup.ts:183–187,330–336`; `operations.ts:491–500`). Walk these explicit fields, not arbitrary object strings. |
| `development.projects[].reservation?.facilityId`, `.slot` | Exact script claim (`types.ts:791–817`). Test the reservation itself, not status alone, and inspect the retained project array rather than assuming only the hot index could contain a reference. |
| `development.projects[].productionId` | An association to a production, not a direct body reference. `writerId` / `writerIds` are people, not facilities. |

`workflow.blocker` has capability/targetPhase, taskId, or set-unavailable/targetPhase; it contains no exact facility ID (`types.ts:631–653`). Do not invent a blocking body identity from a capability alone. `releaseAuthority` adds production commitments, not another persisted facility reference.

The shared occupancy reader accepts narrow `OccupancySources` (`occupancy.ts:231–239`). For rival claims, pass `operations: b.operations` and `scriptDevelopment: b.development`; if adding technology, scope its projects to this owner. `occupiedResourceSlots` walks reservations, the shooting-task alias, script reservations and research claims (`occupancy.ts:380–455`); it is useful but **not an exhaustive retained-history disposal proof**. In particular, historical research seat/lab-work references and setup history require their explicit guards above/below. The player `facilityEngagements(state, id)` uses player roots, so calling it unchanged is not a rival safety proof.

Slot keys are exact `facilitySlotKey(id, slot) = id + ':' + slot`; resource keys add a kind prefix (`occupancy.ts:242–257`). Rival IDs already contain colons. Compare structured `facilityId` + integer `slot`, or use the existing helper; do not split on the first colon or use a raw facility-ID prefix as an identity test.

Current rival greenlight uses `addManagedProductionWorkflow` with its default `requiresSetBinding = false`, and the new workflow has `setup:null` (`hollywoodTick.ts` greenlight; `operations.ts:588–615`). Thus a valid current lab-targeting stage/setup control is not established. The explicit reference guards remain adopted fail-closed protection, not permission to forge such a control.

## Research: all retained history protects its bodies

For every `technology.projects` row with the same `studioId`, inspect these explicit fields (`technologyTypes.ts:5–55`):

- `project.laboratoryFacilityId`: primary/home laboratory.
- Every `project.seats[].laboratoryFacilityId`, including `releasedWeek !== null`.
- Every non-null `project.weeks[].labs[].laboratoryFacilityId`: per-laboratory contribution history, including secondary/cooperating labs. Never collapse this to the primary lab.
- `project.weeks[].seatTalentIds` and each lab contribution's `seatTalentIds` resolve through that project's retained seat intervals; they are people, not body IDs.
- `project.legacy` contains `scientistId`, `throughWeek`, `verifiedWork`, `expenditure`, **no facility field**. Its authority remains joined to the project/home and seats; do not invent a `legacy.laboratoryFacilityId`.

A match in the first three paths refuses disposal regardless of active/paused/cancelled/completed status, current employee count or released-seat status. `technology.ts:960–978` requires primary and every retained seat lab to exist in the same studio's capacity; `technology.ts:1014–1039` binds historical per-lab rows to actual seats and intervals. Keep all work, spend, identities and intervals. The generic occupancy reader emits active unreleased slots and otherwise a primary-lab retained claim, so it alone can miss historical secondary labs.

Related industry receipts `researchSeatAssigned {projectId,talentId}` and `researchCompleted {projectId}` point indirectly through the project. They are retained evidence, not a source of a guessed body ID or permission to remove historical project rows.

## Physical plans: two target forms plus dependency edges

`physicalPlans.plans` is global; select exact same-studio rows. The source schema (`types.ts:1919–1965`) is:

- Placement work: `{kind:'placement', blueprintId, origin}` — no direct facility ID.
- Installation work: `{kind:'installation', blueprintId, target:{facilityId}}` **or** `target:{planId}` — exclusive alternatives.
- `dependsOn: readonly string[]` contains exact same-studio plan IDs.
- Status: `queued | held | blocked | started | cancelled`; there is no `completed` plan status.
- Admission authority: `commitReceipt {week,fingerprint,cost}`, approved quote, approval ceiling. Rival started plans require `startedPlacementId === null`; their body is proved by industry receipts (`physicalPlans.ts:404–416`).

For the subject body's unique plan P and facility F, direct blockers are a relevant installation targeting F or targeting P. Also examine same-studio declared `dependsOn` transitively: a surviving dependent on P, or on an installation/body plan that itself requires F/P, cannot be made safe by deleting its intermediate records. Follow exact graph edges and installation `target.planId` links with a visited set, not string similarity or generic field scanning.

The queue producer adds a `target.planId` to `dependsOn`, requires that target to be a same-studio placement body and checks blueprint capability (`physicalPlans.ts:512–542`). The validator proves `dependsOn` existence, ownership, uniqueness and acyclicity (`physicalPlans.ts:392–401,449–459`); its target-plan arm separately checks exact shape/prefix (`:379–386`). Do not silently assume every arbitrary validated target-plan edge was redundantly listed in `dependsOn`; inspect the declared target as well. Unknown/cross-owner graph authority must be refused by its owning validation, not resolved to a guessed body.

**Do not use `resolvedTargetFacilityId` as the rival body resolver.** It resolves a plan target via `startedPlacementId` and `state.placement.facilities` (`physicalPlans.ts:75–81`). Rival plans intentionally have no such placement. Resolve the rival body's plan/ID relation from the same-studio `laboratoryCommitted` receipt. Declared target identity is also part of the quote fingerprint (`physicalPlans.ts:64–94`); rewriting plan targets during disposal would rewrite approved scope/history.

Adopted refusal scope: preserve queued/held/started live dependencies and the reviewed C inventory's blocked dependent cases. The only stated intent exception is a **cancelled, uncommitted** intent. A body's own paid, operational, completed-in-time `started` plan is retained provenance, not a blocker against itself. A completed installation remains attached authority and still protects its target. No general cancellation, terminal-plan rewrite or dependency deletion is authorized. The public cancel verb refuses started plans and cascades queued/held dependants to `blocked` (`physicalPlans.ts:608–635`); there is no basis to treat `blocked` as an erased reference. Retain intermediate rows/edges when tracing a surviving dependent.

Current rival producer directly admits paid `started` plans with `dependsOn:[]`; current instrument work targets an actual lab via `{facilityId}` (`rivalResearch.ts:133–176`). Queued/held/blocked/transitive rival cases therefore remain explicit unproven valid-control gaps in the reviewed C handback; this map does not claim a new producer for them.

## Instruments and adoption aliases

Any admitted same-studio installation targeting the body protects it before completion. The same-studio `instrumentOperational {facilityId,technologyId}` receipt protects it afterward, even with no research project/Scientist. Current instrument blueprints come from `TECHNOLOGY_CATALOGUE[].instrumentBlueprintId`; their operating evidence is emitted by `completeRivalPlans` (`rivalResearch.ts:296–301`). Do not require an active research seat before recognizing installed equipment. Player placement installation rows are not the rival authority.

For each same-studio `technology.adoptions[]`, the direct body refs are `stageFacilityId` and nullable `postFacilityId` (`technologyTypes.ts:93–116`). Retain/refuse a matching dependency; do not waive a reference because the adoption is pending or cancelled. Current validators require a real compatible soundstage/post, so a valid laboratory-targeting adoption is not established (`technology.ts:702–711`).

Other adoption links are indirect and must retain their distinct namespaces: `prototypeProjectId` joins research; `physicalProjectIds[]` are P09 construction project IDs, not PhysicalPlan IDs; `components[].placementId` is a numeric player placement ID; `components[].equipmentAssetId` / `equipmentAssetId` join durable equipment. Actual rival adoptions have empty `physicalProjectIds`, aggregate components and no fabricated player physical authority (`technologyRival.ts:60–77`; `technology.ts:727–741`). `technology.productions[].adoptionId`, workflow setup adoption/equipment refs and `equipment[].holderAdoptionId` join these same records, not facility IDs. A research-route prototype already protects its laboratories through retained project history.

## Retained body provenance and rematerialization

Successful disposal may remove only the selected live body. Keep the paid body plan/quote/commit receipt, original `laboratoryCommitted` and `laboratoryOperational` receipts, plan ordinals, capital expense and all unrelated authority. Those historical references to the removed body become legal only through the new exact disposal tombstone/accounting proof; they are not deleted to make old validation pass.

`completeRivalPlans` (`rivalResearch.ts:273–292`) currently sees a retained `started` lab plan, waits until `commit.week + approvedQuote.buildWeeks`, then recreates any missing body from its commitment receipt. The adopted matching lawful `facilityDisposed` tombstone must suppress both recreation and a duplicate operational receipt. Do not change the plan to an invented `completed` status. The lab's opex boundary changes to `[operationalWeek, disposalWeek)`; installed-module costs stay because a lawful disposal cannot discard their dependent lab.

The reviewed C tests pin primary retained-project and admitted-instrument refusals, exact core identities, paid-body provenance, completion/no-recreation and refund/history preservation. They explicitly leave separate released-seat/secondary-history, reservation/setup, queued/held/blocked/transitive and adoption valid baselines unproven. This field map supplies the source paths those guards need; it neither substitutes invalid mutants for valid baselines nor broadens the eligible blueprint list.
