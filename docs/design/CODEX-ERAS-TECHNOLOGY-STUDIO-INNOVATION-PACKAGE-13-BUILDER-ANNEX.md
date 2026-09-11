# CODEX — ERAS, TECHNOLOGY & STUDIO INNOVATION — PACKAGE 13 — BUILDER ANNEX

**Status:** DECISION-READY RESEARCH CANDIDATE

**Work type:** DOCUMENTATION ONLY

**Authorization:** NO PRODUCTION AUTHORIZATION

**Parent:** [Package 13 Main Report](./CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13.md)

**Owner-direction amendment:** 2026-09-10 — §§2, 3.8–3.11, 4.2–4.3, 5.7, 14.4 and related rows; see
[design §2A](./CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13.md#2a-owner-selected-product-direction--2026-09-10).

**Canonical TypeScript research baseline:** `campaign/living-lot-ts` at
`7811377cea1c1b9ddca2c17c626879504b23ed4e`

This Annex is future implementation guidance, not production TypeScript, schema, DTO, Unity, save,
or tuning authority. Every proposed symbol is illustrative until the mandatory post-upstream
reconnaissance resolves exact accepted code.

---

## 1. Builder boundary and non-authorization

P13A's bounded proof is one synchronized-sound transition split into P13A.1 headless law, P13A.2
upstream consequence integration, and P13A.3 bounded read-side/world proof. It contains one shared
catalogue entry, one global milestone, research/wait, one rival adoption consequence, and one
production/world capability effect. The complete checkpoint is blocked until the Owner authorizes
a minimal P09-governed Laboratory plus stable P10-compatible Scientist identity/provider. An aggregate
provider was evaluated but cannot satisfy the prescribed named-person opportunity-cost and world-causality
proof, so it does not unblock P13A. This annex does not claim those concrete roots already exist or authorize
licensing, the full catalogue, a generic research engine, alternate-history authoring, P14, P15, or P16+.
*(Amended 2026-09-10)* The Owner's direction of that date makes multi-person staffing, R&D budgets,
cooperation, parallel projects and plan queues the intended experience; P13A remains the bounded first
checkpoint and proves none of them.

**PROJECT AUTHORITY VERIFIED —** P08 owns awards/Standing/history interpretation; P09 owns facility
identity, placement, construction and condition; P10 owns person/profile/contract/career truth; P11
owns finance; P12 owns studios/rivals/conserved projects plus current-employer, exclusivity, interval,
and transition truth, and assigns catalogue/era/adoption to P13. P13 may reference those exact
identities after they exist. It may not duplicate their state.

Entry is blocked until the Owner accepts the package boundary, upstream packages are accepted,
changed-path reconnaissance is complete, a final implementation charter exists, and the Owner
separately authorizes implementation.

---

## 2. Canonical terminology

| Term | Canonical meaning | Not this |
|---|---|---|
| Industry Timeline | authoritative sequence/windows of public cinema-industry milestones | current `StudioCalendar`; UI-only date ruler |
| Era | derived historical context active at a global week | studio level; private research tier; mutable `EraConfig` |
| Technology Catalogue | versioned global definitions, prerequisites, routes, effects and public policy | per-studio tree; array of unlocked strings |
| Technology | stable global capability/change definition | generic modifier; content display name |
| Public availability | point/window when a route may legally begin | studio has researched/adopted it |
| Public standard | catalogue-defined use becomes generally expected/compatible | every optional innovation is mandatory |
| Diffusion | transition between availability and standard/maturity | random catch-up bonus |
| Studio awareness | studio can inspect/evaluate an available technology | technology is operational |
| Research | studio work that advances toward readiness | automatic timeline unlock; license |
| Technology license | optional successor route buying bounded rights/access through a future authorized technology-rights substrate | P13A scope; verified original parity; P14 talent negotiation |
| Wait | explicit choice to rely on the fixed commercial release, then purchase compatible equipment *(Amended 2026-09-10)* | doing nothing without forecast/consequence |
| Ready to adopt | knowledge/access acquired; conversion not yet operational | capability active |
| Adoption | studio conversion/training/equipment process | catalogue unlock |
| Adoption work order | persistent, resumable, exact-ID conversion/training/equipment work with blockers, reservations, and P11 receipts | instantaneous unlock; UI progress bar without state |
| Operational | exact provider(s) can supply capability | score bonus |
| Superseded for use | an older method no longer preferred/compatible for one named use | deleted from history |
| Research project | persistent exact-ID work order | weekly click or UI selection |
| Research assignment | relation among project, person and facility | person identity or employment ownership |
| Capability | named behavior an operation/provider can perform | untyped `+quality` |
| Compatibility | explicit requirements between work and capability providers | era penalty |
| Consequence fact | typed before/after mechanical or world result | presentation prose |
| Catalogue alias | explicit legacy ID mapping | fuzzy title match |
| Legacy initialization | honest present-time compatibility state created on old-save migration | fabricated retroactive adoption history |
| Researcher | P10 person in the Scientist role employed by the studio; P13 holds assignments | P13-owned person; aggregate staffing pool |
| Laboratory seats | P09 capacity fact bounding concurrent named researchers in one laboratory | a research-speed stat |
| R&D budget ceiling | per-project weekly limit on usable research spending, charged through P11 only for usable work | second wallet; automatic weekly drain; refundable deposit |
| Concentration factor | diminishing-returns function over laboratories cooperating on one project | a bonus for owning many buildings |
| Early-research window | catalogue-defined period before commercial release in which qualified research may begin | free alternate history |
| Commercial release | fixed public milestone at which compatible upgrades become purchasable by any studio | mandatory replacement; installed equipment |
| Invention provenance | record of which studio completed which research when, with prototype facts and entitlement class | selecting a technology card; researching a public prerequisite |
| Own-development concession | the inventor's disclosed reduction of technology/access and equipment lines in a deployment quote | free installation; negative net purchase |
| Conversion requirement descriptor | authored source→target physical requirement (structure, space, equipment, access, compatibility, providers) | tier-count penalty |
| Plan | persistent queued instruction with dependencies, authority and state; planned expenditure until executed | an irrevocable purchase; a second progress owner |
| Admission policy | whether a facility awaiting a queued plan accepts new engagements | a guaranteed start date |
| Technology loadout lock | immutable production technology set fixed at first actual filming | lock at creation, greenlight or queue entry |
| Supplier commercialization agreement | later-scope contract: upfront payment, eligible-sale royalties, term, retained own use, originator purchase benefit | monopoly over a capability; P13A scope |

The original game's “research packs” remain a historical term. Project: Studio need not copy those
names or four categories. “Scientist” is a P10 staff role/profile fact; P13 owns only research-work
assignment and technology credit references.

---

## 3. State-transition tables

### 3.1 Global milestone state

| From | Trigger | Preconditions | To | Persisted material event | Refusal / invariant |
|---|---|---|---|---|---|
| catalogued | forecast window enters visibility horizon | valid catalogue/timeline version | forecast | `milestoneForecastPublished` only if publication itself is historical | no exact rolled date exposed unless policy says fixed |
| forecast | deterministic availability resolution | current week reaches resolved week | available | `technologyAvailable` | one event per milestone ID |
| available | optional diffusion observation begins | entry explicitly enables diffusion and due predicate is met under one law | diffusing | optional `diffusionBegan` | not driven by player-only state |
| available | standard-bound hard/latest rule resolves without diffusion | standard policy and compatibility dispositions valid | publicStandard | `publicStandardEstablished` plus one disposition per studio | only standard-bound entries; no hidden bypass |
| available | optional capability reaches authored maturity without diffusion | entry is nonstandard and maturity predicate is met | mature | material maturity event/summary | cannot imply mandatory adoption |
| diffusing | public-standard rule resolves | entry is standard-bound; due condition and compatibility policy valid | publicStandard | `publicStandardEstablished` plus one disposition per studio | nonstandard entries cannot use this edge |
| diffusing | optional maturity rule resolves | entry is nonstandard; due condition valid | mature | material maturity event/summary | cannot imply public standard |
| publicStandard | maturity rule | due condition | mature | summary transition if material | maturity cannot erase earlier methods/history |
| any applicable | catalogue rule marks one use obsolete | successor/provider/public rule met | same state + obsolete use | `technologyUseObsoleted` | obsolescence is per capability/use, never object deletion |

### 3.2 Per-studio adoption state

| From | Intent/event | Preconditions | To | Economy/capacity consequence | Exact result |
|---|---|---|---|---|---|
| unaware | public or scouted notice | visibility policy | aware | none | public reason/source recorded |
| aware | `beginEvaluation` | no current evaluation duplicate | evaluating | none or named analysis capacity | route comparison becomes stable for current snapshot |
| evaluating | `beginResearch` | authorized provider identity, prerequisites, funds/capacity | researching | P11-attributed expense/opex; provider reservations | one `researchProjectId`; concrete route uses exact person/Laboratory IDs |
| evaluating | `chooseWait` | wait route exists | waiting | none | forecast and retained old capability recorded |
| researching | weekly work | project active and providers operational | researching | bounded work accumulation | no weekly event row |
| researching | work reaches requirement | exact work after tick | readyToAdopt | release assignment capacity | one completion event and credits |
| researching | provider unavailable | blocker changes | researching + paused reason | no work; ongoing costs only if P11 law says so | same project ID, exact blocker |
| researching | provider restored | same project is paused; guards current | researching with active project | resume retained work; no new debit or reservation | same project ID; blocker cleared once |
| researching | `cancelResearch` | project is queued, active, or paused; intent current | evaluating | release every reservation exactly once; P11 authors committed-cost/refund/ongoing-cost disposition | terminal cancellation and durable receipt recording the retained verified work (7A, *Amended 2026-09-10*) and resulting adoption status |
| evaluating | `beginResearch` after cancellation | normal begin guards; prior cancellation receipt valid | researching | new quote/commit and reservations only where P11/P09 require; permitted retained work copied once | new `researchProjectId` links the prior receipt; cancelled ID never reopens |
| waiting | public policy grants access | standard/diffusion event | readyToAdopt | no invented research cost/credit; a technology/access component may still be quoted at deployment | route provenance remains `wait` |
| evaluating | `beginPurchase` *(Amended 2026-09-10; design §12.1a)* | technology is `available`; prerequisites and facility compatibility hold; quote current; funds pass | readyToAdopt | priced technology/access plus equipment through P11 at commit; own-development concession applied where provenance is valid | route provenance `purchase`; no research credit, no pioneer first |
| any non-operational state | public standard resolves | per-use policy evaluated | same research/adoption state plus `conversionRequired`, `inFlightGrace`, or `incompatible` disposition | no invented debit/work | one persistent standard-disposition fact; wait may separately become ready under its explicit policy |
| operational | public standard resolves | exact providers remain valid | operational plus `operational` standard disposition | none unless policy names one | same technology/adoption identity retained |
| readyToAdopt | `beginAdoption` | providers/capex/downtime legal; quote current | adopting | explicit P11 commit and reserved capacity | one `adoptionWorkOrderId` linked to the adoption episode |
| adopting | provider/capacity unavailable | work order queued or active; blocker becomes true | adopting + paused order reason | no work; continuing cost only under P11 law | same order ID, exact blocker/remedy |
| adopting | blocker clears | same order is paused; quote/commit and providers remain valid | adopting + active order | resume retained work; no duplicate debit/reservation | same order ID; blocker cleared once |
| adopting | `cancelAdoption` | order queued, active, or paused; intent current | readyToAdopt | release reservations exactly once; P11 authors committed-cost/refund disposition | terminal cancellation and durable receipt naming retained/lost work and resulting adoption status |
| readyToAdopt | `beginAdoption` after cancellation | normal begin guards; prior receipt valid | adopting | new current quote/commit and reservations; permitted retained work copied once | new `adoptionWorkOrderId` links the prior receipt; cancelled order never reopens |
| adopting | automatic work completion | required work/capacity complete; blockers absent; P11/provider guards current | operational | new opex/provider state where defined; reservations released once | capability provider materialized and one completion event; no claim intent |
| operational | successor/obsolescence event | per-use rule | operational + superseded use | explicit compatibility consequence | old record retained |

### 3.3 Research project state

| From | Event/intent | To | Work/identity law | Adoption status / durable result |
|---|---|---|---|---|
| queued | capacity slot activates | active | same project ID; accumulated work unchanged | remains `researching` |
| queued | `cancelResearch` | cancelled | terminal; verified accumulated work recorded as retained (7A, *Amended 2026-09-10*); never reopen | `evaluating`; one cancellation receipt |
| active | authoritative blocker appears | paused | same project ID and accumulated work | remains `researching` with exact blocker/remedy |
| paused | every blocker clears | active | same project ID and accumulated work; no restart charge | remains `researching` |
| active | required work reached | completed | terminal; credit/release exactly once | `readyToAdopt`; one completion receipt/event |
| active or paused | `cancelResearch` | cancelled | terminal; verified accumulated work retained (7A, *Amended 2026-09-10*); spent money remains spent; reservations release once | `evaluating`; one cancellation receipt with P11 disposition reference |
| cancelled | `beginResearch` | cancelled; create a new queued/active project | cancelled record stays immutable; new ID may seed only receipt-authorized retained work once | new project makes adoption `researching`; receipt links old and new IDs |
| completed | any cancel/restart intent | completed | refuse terminal mutation | remains `readyToAdopt`; typed terminal-state refusal |

Queued, active, paused, completed, and cancelled all survive save/load byte-stably. Cancellation and
completion consume distinct durable idempotency keys; duplicate delivery returns the existing receipt.

### 3.4 Adoption work-order state

| From | Event/intent | To | Work/identity law | Adoption status / durable result |
|---|---|---|---|---|
| queued | provider/capacity slot activates | active | same work-order ID and reservations | remains `adopting` |
| queued | `cancelAdoption` | cancelled | terminal; reservations release once; committed-cost law comes only from P11 | `readyToAdopt`; one cancellation receipt |
| active | authoritative blocker appears | paused | same order ID, reservations, and accumulated work | remains `adopting` with exact blocker/remedy |
| paused | every blocker clears | active | same order ID; no duplicate reserve/debit | remains `adopting` |
| active | required work reached | completed | terminal; capability materializes, costs/credits/release occur once | `operational`; one completion receipt/event |
| active or paused | `cancelAdoption` | cancelled | terminal; physical disposition follows option B (§3.11, *Amended 2026-09-10*): completed work paid, restoration charged, refundable unused commitments recovered | `readyToAdopt`; cancellation receipt records P09, P11 and release dispositions |
| cancelled | `beginAdoption` | cancelled; create a new queued/active order | cancelled order stays immutable; new ID may seed only receipt-authorized retained work once | new order makes adoption `adopting`; receipt links old and new IDs |
| completed | any cancel/restart intent | completed | refuse terminal mutation | remains `operational`; typed terminal-state refusal |

For both project kinds, a cancellation receipt contains its own stable ID, target ID/kind, intent
idempotency key, week, pinned catalogue/rules versions, accumulated work, retained-work
disposition (7A for research; option B for installation, *Amended 2026-09-10*), released reservation references, P11 disposition reference (or explicit `none`), resulting
`TechnologyAdoption.status`, and optional replacement ID. A restart never mutates or reopens a cancelled
record. It creates a new ID, atomically links the receipt, and copies authorized retained work at most once.

### 3.5 Compatibility decision

| Production request | Public state | Studio capability | Decision |
|---|---|---|---|
| silent method before sound standard | available/diffusing | no sound | legal old method; no hidden penalty |
| sound method | any | no operational sound provider | blocked, exact provider/adoption remedy |
| sound method | any | operational provider | legal if all other P05/P06 prerequisites pass |
| new silent work after sound standard | publicStandard | catalogue allows old exhibition | legal with named format/market consequences owned by later package |
| new silent work after sound standard | publicStandard | catalogue prohibits incompatible distribution use | blocked with explicit conversion or alternate release path |
| in-flight silent work at standard date | publicStandard | grace policy applies | existing commitment follows named grace rule; no retroactive corruption |

### 3.6 P13-local same-week subphase order

The core scheduler owns/fixes the whole-week phase order. Within its P13 phase band at week `W`,
consume the scheduler-frozen due set, then resolve: (1) global
milestones by `(effectiveWeek, milestoneId)`; (2) studio eligibility and standard dispositions by
`(studioId, technologyId)`; (3) research work/completion by `researchProjectId`; (4) adoption work,
P11 revalidation, capability materialization, and reservation release by `adoptionWorkOrderId`;
(5) rival decisions for the next legal phase; (6) stage P13 event/index/summary/attention deltas. The
core scheduler publishes cross-package projections only after all weekly phases commit. A
same-week standard therefore precedes research completion and cannot produce a false early-first.

### 3.7 Future P15B/P12 studio-transition participation

| Request | P13 candidate effect | Required receipt | Failure law |
|---|---|---|---|
| later entrant becomes active | derive entry-week availability/standard baseline; initialize no prior project, work, cost, first, or use history | one idempotent root manifest plus immutable chunks of at most 100 technology dispositions, bound to P12 request/source/catalogue/timeline/rules versions and P13 recording boundary | no P13 row or P12 activation commits |
| active studio becomes dormant/closed | resolve every active research/adoption work order as typed `paused`, `cancelled_with_receipt`, or `completed_before_transition`; release/retain P09/P10/P11 resources under owner law | one root manifest with affected-set count/digest plus immutable chunks of at most 100 typed subject/disposition/reason rows and exact upstream receipts | no partial cancellation, reservation release, debit/refund, or P12 state change |
| dormant studio reactivates | validate baseline plus explicitly preserved work; create no dormant-period progress | one idempotent request-bound manifest/chunk set | no silent resume or fabricated completion |

P13 prepares facts inside the all-owner `GameState` candidate. P12 alone commits the registry state.

### 3.8 Research staffing and budget weekly work law — 2026-09-10

**IMPLEMENTATION RECOMMENDATION** for [design §12.6](./CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13.md#126-research-staffing-rd-budgets-and-multi-laboratory-work--2026-09-10-owner-direction). Evaluated once per authoritative tick per active project, in `researchProjectId` order inside §3.6 step 3.

| Input | Source of truth | Effect this tick | Refusal / disclosure |
|---|---|---|---|
| assigned researchers | P13 assignment referencing P10 person and P12 employer | base output summed; a person not employed by the studio contributes nothing and is flagged | `PERSON_NOT_EMPLOYED`; `SCIENTIST_REQUIRED` when none |
| laboratory seats | P09 facility capacity | assignments beyond seats refused at assignment time | `LAB_AT_CAPACITY` |
| laboratory operational state | P09 condition | non-operational laboratory contributes nothing; project pauses if it has no operational participant | `LAB_UNAVAILABLE` |
| knowledge prerequisites and early-research window | catalogue and timeline | no work and no spend before eligibility | `TECH_PREREQUISITE_MISSING`; `RESEARCH_NOT_YET_RESEARCHABLE` |
| budget ceiling | player/rival authority on the project | actual spend = min(ceiling, usable spend); charged through P11 as `researchSpending` | `RESEARCH_SPEND_UNUSABLE` names the reason and the unspent remainder |
| cooperating laboratories | project participant list | pooled output × c(n) | `LAB_SEATS_AVAILABLE` when seats are empty and the ceiling exceeds usable spend |
| accumulated work | project | += weekly output; completion when ≥ required work; credit and release once | never decremented by any input change |

Payroll and laboratory Opex are not inputs of this law; they are continuing P11/P09 charges. A ceiling change, assignment change or laboratory change is an intent applied against the current snapshot and affects the next tick only.

### 3.9 Plan queue state — 2026-09-10

| From | Event/intent | To | Money | Exact result |
|---|---|---|---|---|
| — | `createPlan` (kind, target, dependencies, authority) | planned | planned expenditure shown beside cash; never subtracted from it and never injected into a P11 forecast | one `planId`; no debit, reservation, job or project |
| planned | dependency unsatisfied or resource busy | waiting(reason) | none | typed waiting reason; holders and estimates shown; no exact start date while open-ended |
| planned or waiting | `reserveResources` (optional, only if authorized) | same state + earmark | physical earmark only (P09 ground or provider capacity); a cash reservation needs new P11 authority | revocable; shown beside cash, never inside it |
| waiting | every dependency satisfied | ready | none | plan re-quotes against the current snapshot |
| ready | fresh quote inside authority | executing | owner commit (P13 research begin, P09 job, P11 commit) | plan links the executing subject; duplicate execution refused |
| ready | fresh quote outside authority or material change | pausedForReview(delta) | none | player confirms revised terms or edits the plan |
| ready | staffing dependency unmet | waiting(`PLAN_REQUIRES_EMPLOYMENT_ACTION`) | none | never hires |
| any non-terminal | `pausePlan` / `reorderPlans` / `cancelPlan` | paused / same / cancelled | cancelling an unexecuted plan has no domain effect; reservation released | typed receipt; executing subjects follow their owner's cancellation law |
| executing | owner completion receipt | done | per owner | plan records the completion receipt |
| executing | owner cancellation (research 7A; installation 10B) | cancelled | per owner disposition | plan records the disposition receipt |

Independent plans move through this table concurrently; there is no global serial queue. Admission policy (`closeAdmission` / `openAdmission`) is a plan attribute chosen before approval. This table describes waiting instructions only: it creates no construction slot, concurrency cap, Builder allocation or order over physical work, all of which remain P09's deferred and explicitly protected territory.

### 3.10 Production technology loadout — 2026-09-10

| Production state | Newly operational compatible technology | Public standard resolves | Result |
|---|---|---|---|
| created, in development, greenlit, cast, queued, not yet filming | may adopt after recheck of plan, cost, availability and dates; explicit confirm | not in-flight; new work meets standard where catalogue prohibits incompatible use | loadout mutable until first filming |
| rehearsal (holds a soundstage, not filming) | may still adopt after the same recheck | not in-flight | loadout still mutable |
| entry into the shooting phase — recommended lock, accepted witness is the phase-entered event that mints the take (**POST-P12 VERIFICATION REQUIRED**) | loadout becomes immutable | `inFlightGrace` per catalogue | one immutable `ProductionTechnologyLoadout` |
| filming | no change; no retroactive footage improvement; no reshoot system | grace rule | `LOADOUT_LOCKED_FILMING` on any adoption intent |
| wrapped and later | no change | none | history references the loadout |

New productions default to the installed suitable technology; a lawful older method remains selectable and is recorded as deliberate.

### 3.11 Installation cancellation under option B — 2026-09-10

| Row | Owner | Disposition | Shown before Confirm |
|---|---|---|---|
| completed physical work | P09 | paid; non-refundable | amount and what was built |
| necessary restoration | P09 + P11 | charged; duration; resulting usable state | amount, weeks, resulting capability |
| refundable unused commitments | P11 | recovered per P11 disposition (undelivered equipment, unperformed labor, undone work under the accepted charge-at-commit law); never derived from the accepted demolition credit | amount per component |
| non-refundable commitments | P11 | retained by counterparty (e.g. contracted technology/access) | amount |
| retained physical work | P09 | recorded physical fact; any restart credit is a separate tuning decision | description |
| technology readiness | P13 | returns to `readyToAdopt`; provenance unchanged | resulting adoption status |
| reservations | P09/P13 | released exactly once | list |

The disposition is one atomic all-owner candidate; failed preflight changes nothing. The ordinary-retrofit no-abort recommendation does not apply to technology installations. Accepted law has no free cancel for committed construction at all. Removing an unfinished site is a demolition that returns a rounded fraction of the blueprint's capital cost and writes off completed work. Option B is therefore a new authored disposition, and its components must not be computed from that credit. Aligning ordinary retrofits with it changes accepted behavior, which is a Current Ops decision.

---

## 4. Interface-level entity sketches

The following pseudo-interfaces communicate ownership and invariants. They are not authorized
production TypeScript and intentionally avoid current frozen shapes.

```text
IndustryTimelineRoot {
  timelineVersion
  policyVersion
  nextMilestoneCursor
  resolvedMilestones[]  // material resolved public events only
}

TechnologyCatalogueDefinition {
  technologyId
  definitionVersion
  categoryId
  prerequisiteTechnologyIds[]
  forecastPolicy
  availabilityPolicy
  diffusionPolicy?
  standardPolicyByUse[]
  allowedRoutes[]        // research | wait | purchase (2026-09-10); license only in a later authorized schema
  researchWorkDefinition?
  adoptionWorkDefinition?
  capabilityGrants[]
  compatibilityRules[]
  facilityContentUnlockIds[]
  effectDescriptors[]    // typed, never arbitrary modifier bag
  aliases[]
}

StudioTechnologyRoot {
  studioId
  catalogueVersionSeen
  adoptionRows[]
  researchProjects[]
  technologySummary
}

TechnologyAdoption {
  adoptionId
  studioId
  technologyId
  route
  status
  awarenessWeek?
  routeCommittedWeek?
  readyWeek?
  adoptionStartedWeek?
  operationalWeek?
  supersededUses[]
  facilityProviderIds[]
  standardDisposition?  // operational | conversionRequired | inFlightGrace | incompatible
  catalogueVersion
  timelinePolicyVersion
  adoptionRulesVersion
  capabilityRulesVersion
  provenance
}

ResearchProject {
  researchProjectId
  studioId
  technologyId
  state
  assignedPersonIds[]
  laboratoryFacilityId
  queuedAtWeek
  startedAtWeek?
  accumulatedWork
  requiredWorkVersion
  catalogueVersion
  researchRulesVersion
  p11QuoteRef?
  currentBlocker?
  completedAtWeek?
  cancelledAtWeek?
  cancellationReceiptId?
}

AdoptionWorkOrder {
  adoptionWorkOrderId
  adoptionId
  studioId
  technologyId
  state
  routeProvenance        // research | wait | purchase (2026-09-10)
  providerFacilityIds[]
  reservedCapacityRefs[]
  requiredWork
  accumulatedWork
  currentBlocker?
  p11QuoteRef
  p11CommitReceiptRef?
  catalogueVersion
  adoptionRulesVersion
  capabilityRulesVersion
  createdWeek
  completedOrCancelledWeek?
  priorCancellationReceiptId?
  cancellationReceiptId?
  idempotencyKey
}

TechnologyWorkCancellationReceipt {
  cancellationReceiptId
  targetKind              // researchProject | adoptionWorkOrder
  targetId
  intentIdempotencyKey
  week
  accumulatedWork
  retainedWork
  disposition             // research: retained (7A); installation: option-B physical disposition (Amended 2026-09-10)
  releasedReservationRefs[]
  p11DispositionRef?      // absent only with explicit `none` result
  resultingAdoptionStatus
  replacementTargetId?
  catalogueVersion
  rulesVersion
}

TechnologyHistoryEvent {
  eventId
  p13DomainSequence
  week
  phaseId                       // scheduler-owned semantic phase
  phaseOrdinal                  // immutable sparse ordinal at append time
  phaseOrderVersion
  kind
  technologyId
  studioId?
  researchProjectId?
  adoptionId?
  adoptionWorkOrderId?
  personIds[]
  facilityIds[]
  linkedProductionId?
  linkedFilmId?
  catalogueVersion
  timelinePolicyVersion
  researchRulesVersion?
  adoptionRulesVersion?
  capabilityRulesVersion?
  costQuoteOrCommitVersion?
  provenance
  typedFacts
}

P13ParticipantDispositionRow {
  subjectKind                     // technologyBaseline | researchProject | adoptionWorkOrder | reservation
  subjectId
  technologyId
  disposition                    // entryStandardBaseline | availableNotAdopted | paused | cancelledWithReceipt | completedBeforeTransition | preservedForReentry
  reason
  p09FacilityReceiptRef?
  p10AssignmentReceiptRef?
  p11FinanceReceiptRef?
  cancellationReceiptId?
}

P13ParticipantDispositionChunk {
  chunkArchiveId
  chunkOrdinal
  rowCount                        // 1..100
  rows[]                          // complete immutable chunk; hard maximum 100
  previousChunkDigest?
  chunkDigest
}

P13StudioTransitionParticipantManifest {
  receiptId
  receiptVersion
  supersedesReceiptId?
  p12TransitionRequestId
  p12TransitionRequestVersion
  requestDigest
  studioId
  priorOperatingState             // active | dormant | closed | notRegistered
  requestedOperatingState          // active | dormant | closed
  effectiveWeek
  p13SourceRevision
  catalogueVersion
  timelinePolicyVersion
  dispositionRulesVersion
  affectedSetCount
  affectedSetRootDigest
  dispositionChunkArchiveId?
  dispositionChunkCount
  firstChunkDigest?
  finalChunkDigest?
  orderedChunkChainDigest
  recordingBoundaryWeek?
  state                            // participantReady(candidateDigest) | committed(allOwnerTransactionReceiptId) | refused(reason,p13WritesApplied=false)
}

SourceDomainOrderingManifestEntry {
  domainId / sourceRevision
  orderingKind                    // native_sequence | owner_archive_adapter
  orderingVersion / sourceOrderHighWatermark
  recordedFromWeek / completeness / orderPrecision
  phaseOrderLineageRef            // oldestVersion / newestVersion / lineageDigest
}
```

`effectDescriptors` are a closed discriminated family, for example capability grant, facility
blueprint availability, production-method compatibility, named phase duration/capacity change,
reliability condition, capex/opex request, or world presentation flag. A free-form map of numeric
modifiers is prohibited.

The transition manifest and chunks are immutable structures, but `participantReady` and `refused` are
off-state preflight artifacts/diagnostics only: they append no P13 root, event, history row, chunk, or
receipt. Only the `committed` manifest/chunks persist, atomically with the complete all-owner
transaction and exact P12 registry receipt. `receiptVersion`/`supersedesReceiptId` exists only for a
later authorized correction or migration of an already committed manifest, never for a candidate-to-
commit mutation or a standalone partial receipt.
`affectedSetCount` and `affectedSetRootDigest` cover the canonical sorted union of every technology,
research project, adoption work order, and resource reservation affected by the request. Every subject
appears exactly once. `firstChunkDigest`, `finalChunkDigest`, and `orderedChunkChainDigest` bind the
exact ordered chunk chain. Each row separates disposition from reason and carries every required exact
P09/P10/P11 receipt reference. An empty set uses the canonical empty digest and zero chunks. Any
missing/duplicate row, stale request/source/catalogue/timeline/rules version, bad chain/root digest,
chunk over 100 rows, or upstream receipt mismatch refuses the whole all-owner candidate.

---

### 4.1 Physical conversion handoff — 2026-09-10 candidate

**UNSCHEDULED · CURRENT OPS REVIEW REQUIRED · NEW MECHANICS NOT APPROVED.** Read the
[design interface clarification](./CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13.md#122a-physical-facility-conversion-interface--2026-09-10-candidate)
and [facility addendum](./FACILITY-UPGRADES-AND-STUDIO-OVERVIEW-01.md) §§7–10 before activating
physical adoption. This explicit proposed refinement leaves existing requirements intact and
needs disposition during the post-upstream refresh. It authorizes no DTO/save/schema/code change.

Keep the `AdoptionWorkOrder` identity and cancellation/history contract. For physical components,
the §4 required/accumulated work and reservation/consequence fields become projections/references
to one P09 physical job. Recommend a typed work-component discriminator and participant link:
`adoptionWorkOrderId`, `adoptionId`, `studioId`, `technologyId`, exact physical subject/provider IDs,
`p09JobId`, pinned eligibility/capability-rule versions, `p11QuoteRef`, `p11CommitReceiptRef`, and
P09 commit/completion/cancellation receipt references. These are interface sketches, not newly
implemented fields. Nonphysical P13 work retains its own explicitly distinct work/cost component.

There is one P09 physical quote/commit, site/capacity reservation set, progress owner and completion.
P13 participates in its preflight and eligible capability application; §3.6 consumes the physical
receipt without another countdown, debit, reservation or grant. Refresh the accepted core phase
seams: preserve frozen due sets, milestone-first standard disposition, joint-earliest cohorts,
atomic all-owner application and publication after all phases. Do not reallocate earlier-phase
work retroactively. If a distinct training/provider prerequisite remains, do not mark technology
operational merely because the building work completed.

Preserve §§3.2–3.4 cancellation for queued/active/paused adoption: preflight P09 physical restoration/
retention, P11 payment/refund/Opex and P13 readiness/work disposition atomically. Failed preflight
changes nothing; an unsupported cancellation contract blocks that conversion's activation pending
explicit disposition. Terminal records never reopen; restart uses a new ID and only receipt-authorized
retained work. Ordinary P09 no-abort recommendations do not override this contract. Preserve §3.7
all-owner transition manifests/chunks and durable safe completion/hold/cancellation for already
committed work after eligibility/standard changes or feature disablement.

Matching proof must trace one linked physical/adoption job through both entry routes, busy/stale and
duplicate refusals, exact payment/Opex onset, mid-work Save/Load, same building/name/history, atomic
completion/cancellation and real production using the installed capability. Exercise ordinary capacity
work without a blanket technology prerequisite and refuse a technology conversion lacking its actual
eligibility. Show before/during/after world states and exact Back/filter/scroll/focus; a badge is not
proof. Retain every existing golden journey, migration/cancellation, 6,240-week endurance, Laboratory/
Scientist, rival consequence and Owner gate. No P09 Builder staffing/speed/cost is invented or waived;
no P11/P12 package change or rival 3D lot follows from this handoff.

### 4.2 Owner-direction analytical matrix — 2026-09-10 candidate

**NUMERICAL/CONTENT HYPOTHESIS.** Every value in this section belongs to paper fixture **H1**. H1 exists to compare mechanisms, expose thresholds and find dominant strategies. It is not tuning, not a runtime result and not a playtest. The mechanisms it exercises are the [design §12.6–§12.9 and §16a](./CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13.md#126-research-staffing-rd-budgets-and-multi-laboratory-work--2026-09-10-owner-direction) recommendations; the Owner-selected directions they serve are listed in the [Owner rulings amendment](./CODEX-P13-P15-OWNER-RULINGS.md#24-p13-owner-direction-amendment--2026-09-10).

**Scale note, 2026-09-11.** H1's absolute money scale was never anchored to the accepted blueprints: a fully funded medium research programme costs $105,600 here, about a quarter of the $400,000 Craft Services Annex, which is the cheapest accepted building. [Catalogue §9.1](./STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md#91-the-envelope-and-one-scale-question-current-ops-must-settle) proposes scale S1, which multiplies every money figure here by five and therefore leaves every ratio, break-even and dominance conclusion below **unchanged**. H1 is left at its validated values; adopting one scale is a Current Ops decision. **The Owner recorded on 2026-09-11 that the five-times scale is a hypothesis and not approval.**

**Fixture H1**

| Input | Value | Note |
|---|---|---|
| Laboratory seats | 4 named researchers | P09 capacity fact; the original game's four-per-section figure is a source fact, not this value's authority |
| Researcher base output | 1.0 work unit (wu) per researcher-week | skill-neutral; P10 profile effects deferred |
| Researcher salary | $400/week each; $1,600/week for a full laboratory | continuing P11 payroll whether or not a project uses the person |
| Laboratory Opex | separate P09/P11 charge, unchanged by research spending | omitted from comparisons because it is identical across rows |
| R&D budget multiplier m, by spend per assigned researcher-week | $0 ×1.00; $500 ×1.25; $1,000 ×1.40; $2,000 ×1.50 (saturation) | usable spend therefore scales with assigned people, so one full laboratory saturates at $8,000/week and two at $16,000/week; spend above the usable amount is never charged |
| Concentration factor c(n) for n cooperating laboratories | c(1)=1.00; c(2)=0.8125; c(3)=0.684 | These are the mixed-systems profile, parallel fraction 10/13, about 0.769, which reproduces both factors exactly. The **total** is 1.625× for two laboratories and 2.05× for three; the **factor** is 0.8125 and 0.684. The Owner's 1.5–1.75× is the total, and the factor that produces it is 0.75–0.875. c(3)=0.684 replaces an earlier 0.70, which did not follow from the same parallel fraction. See [catalogue §5.3](./STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md#53-parallel-profiles-and-the-corrected-concentration-law) |
| Required work for the fixture technology | 64 wu | one mid-size catalogue entry |
| Sound product (technology/access + equipment) | $40,000 + $60,000 = $100,000 | retail composition after commercial release |
| Stage A, substantially older silent stage | site adaptation $90,000 / 9 weeks; installation $30,000 / 3 weeks | descriptor: structural acoustic work, wiring, access |
| Stage B, nearly compatible stage | site adaptation $10,000 / 1 week; installation $30,000 / 3 weeks | descriptor: equipment swap and wiring only |
| Build another sound stage | $400,000 / 20 weeks; needs footprint | no downtime on existing stages |
| Portable camera replacement | $15,000; no P09 job | equipment purchase only |

Weekly research output for one project = (Σ assigned researcher output) × m(actual spend) × c(n). Duration = required work ÷ weekly output, completing in the first authoritative tick whose accumulated work reaches the requirement. Output and duration are different quantities: **1.6× output turns 16 comparable weeks into 10 weeks (64 ÷ 6.4), not into 6.4 weeks.** A 60% duration reduction would need 2.5× output.

#### M1. One laboratory versus two cooperating versus two independent projects

| Arrangement | Weekly output | Fixture technology (64 wu) | Spend + payroll at completion | Reading |
|---|---|---|---|---|
| One full laboratory, unfunded | 4.0 wu | 16 weeks | $0 + $25,600 | baseline |
| One full laboratory, $8,000/week | 6.0 wu | 11 weeks (10.67) | $88,000 + $17,600 | cash saves five weeks for $88,000 of research spending; payroll is not a saving because the researchers stay employed either way |
| Two full laboratories cooperating, both $8,000/week | 12 × 0.8125 = 9.75 wu (1.625×) | 7 weeks (6.56) | $112,000 + $22,400 | first result four weeks sooner than one funded laboratory |
| Two full laboratories on two different technologies, both funded | 6.0 wu each | both at 11 weeks | $176,000 + $35,200 | two results at week 11 |
| Cooperate on the first, then the second | 9.75 wu each in turn | 7 weeks, then 14 weeks | $224,000 + $44,800 | second result three weeks later than splitting |

**Weakness exposed:** cooperation is never the throughput-maximizing choice; it only buys earliness on one technology. That is acceptable only if being first matters (rival race, inventor pricing, an imminent production). If rival adoption consequences are weak, splitting dominates and the cooperation law is dead weight. The proof must show a race in which cooperation was the correct choice and one in which it was not.

**Scope note, 2026-09-11.** This fixture compares cooperation with splitting across two laboratories on two uncapped, identical projects. It establishes nothing general, and the Owner has ruled that it must not be read as a law. [Catalogue §9.4](./STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md#94-research-allocation-when-concentrating-helps-and-when-splitting-helps) varies workload, deadline, useful staffing limit and equipment across seven fixtures: the answer is set by whether seats sit idle and by whether the first or the last completion date carries the value.

#### M2. Added budget with and without spare qualified staff or capacity

| Situation | Usable spend | Weekly output | Duration | Bottleneck shown |
|---|---|---|---|---|
| Full laboratory, ceiling raised $0→$2,000 | $2,000 | 5.0 wu | 13 weeks | none; marginal ≈ $8,700 per week saved ($26,000 ÷ 3) |
| Ceiling raised $2,000→$4,000 | $4,000 | 5.6 wu | 12 weeks | none; marginal $22,000 per week saved |
| Ceiling raised $4,000→$8,000 | $8,000 | 6.0 wu | 11 weeks | none; marginal $40,000 per week saved |
| Ceiling raised $8,000→$20,000 | $8,000 | 6.0 wu | 11 weeks | `RESEARCH_SPEND_UNUSABLE`: four researchers saturate at $8,000; $12,000/week stays in cash |
| Two of four seats filled, ceiling $8,000 | $4,000 of $8,000 | 3.0 wu | 22 weeks (21.33) | `LAB_SEATS_AVAILABLE`: two researchers can absorb only $4,000; hire two more (an authorized employment action) or accept 22 weeks |
| Four of four seats filled, ceiling $8,000, want faster | $8,000 | 6.0 wu | 11 weeks | `LAB_AT_CAPACITY`: expand/build another laboratory or cooperate with a second one |
| Knowledge prerequisite missing | $0 | 0 wu | no estimate | `TECH_PREREQUISITE_MISSING`; assigned researchers' payroll continues and is shown as idle cost |

**Weakness exposed:** the budget lever tops out at ×1.5 while staffing scales ×4 and a second laboratory ×1.625; cash therefore flows into buildings and hiring rather than project spend, which is the intended "invest in labs" outlet but makes the budget slider feel weak at saturation. Tuning must decide whether the saturation tier or the staffing multiplier moves; the matrix does not.

#### M3. Direct leapfrog versus staged conversion versus building another facility

| Route for a sound-capable stage | Capital | Duration | Downtime on existing stage | Obsolete purchase required | When it wins |
|---|---|---|---|---|---|
| Stage A direct conversion | $220,000 | 12 weeks | 12 weeks | none | cheapest complete route; stage idle or plan queued after current work |
| Stage A staged: structural step now, system later | $230,000 | 13 weeks total | 9 + 4 weeks, separable | none | the 9-week structural step can run while research or the commercial release is still pending, leaving 4 weeks of downtime at purchase time |
| Stage B direct conversion | $140,000 | 4 weeks | 4 weeks | none | nearly compatible building; the same product costs $80,000 less to deploy |
| Build another sound stage | $400,000 | 20 weeks | none | none | footprint available, Stage A must keep shooting, cash-rich |
| Wait | $0 | — | none | none | no eligible production needs sound yet |
| Camera replacement | $15,000 | 0 weeks | none | none | portable equipment; no building work is invented |

No row purchases an older sound system first. The staged route exists because a real physical step is separable, not because a tier label was skipped. The difference between Stage A and Stage B is the source→target descriptor (structure and acoustic treatment), not the count of skipped catalogue generations. **Weakness exposed:** if site adaptation for an older building is priced too low, direct conversion of every old stage dominates building another; if too high, old stages become dead assets. The Owner's "takes longer" preference is honored through duration and work, not through a penalty.

#### M4. Inventor versus ordinary purchaser with transparent cost components

| Component (Stage A) | Ordinary purchaser after commercial release | Inventor, later installation | Inventor, first installation with a usable research prototype |
|---|---|---|---|
| Technology/access | $40,000 | $0 (own-development concession) | $0 |
| Equipment/manufacturing | $60,000 | $45,000 (25% concession) | $0 (prototype recorded as the equipment; billed once) |
| Site adaptation (P09) | $90,000 | $90,000 | $90,000 |
| Installation (P09) | $30,000 | $30,000 | $30,000 |
| Opex change (P11) | +$1,000/week | +$1,000/week | +$1,000/week |
| Final amount | $220,000 | $165,000 | $120,000 |
| Shown inventor benefit | — | −$55,000 | −$100,000 |

Before commercial release the inventor's quote shows the same in-house deployment terms with "no retail comparison until commercial release (forecast window shown)"; no retail price is invented. A studio that only researched a public prerequisite receives the ordinary column. Rival inventors receive the inventor columns under the same provenance rule. The floor of any quote is the real site and installation work, so no quote is negative.

**Weakness exposed:** funding H1's research to saturation adds $88,000 of project spending on top of payroll the studio pays regardless, and the first-installation benefit is $100,000, so early access more than pays for itself before counting the earliness advantage. That is a balance concern: either the concession rates or the research cost must move, or the earliness advantage must be the intended prize. The matrix records the concern; it does not resolve it.

#### M5. Cancelled and restarted research; cancelled installation under option B

Research: a funded single-laboratory project is cancelled at the end of week 7 with 42 wu of 64 accumulated (7 × 6.0). The cancellation receipt records `retainedWork = 42`; $56,000 spend and $11,200 payroll remain spent. A restart at week 20 creates a new project ID seeded with 42 wu once and marks the receipt consumed; 22 wu remain (4 weeks at 6.0 wu). A duplicate restart command returns the same new project; a second restart after consumption is refused (`RETAINED_WORK_ALREADY_CONSUMED`). Moving the four researchers to another laboratory mid-project changes nothing about accumulated work; output resumes from the new laboratory at the next tick. A second concurrent project on the same technology in the same studio is refused (`RESEARCH_ALREADY_ACTIVE`). Retained work cannot be moved to another technology or studio.

Installation: the Stage A direct conversion is cancelled at the end of week 5 of 12 under option B.

| Item | Amount | Disposition |
|---|---|---|
| Completed site work (5 of 9 weeks, linear) | $50,000 | paid; non-refundable |
| Technology/access contract | $40,000 | paid; non-refundable once contracted (P11 disposition hypothesis) |
| Undone site work | $40,000 | refundable unused commitment |
| Undelivered equipment | $60,000 | refundable unused commitment |
| Uninstalled installation labor | $30,000 | refundable unused commitment |
| Necessary restoration | $8,000 / 1 week | charged; returns Stage A to safe silent-capable service, which in this fixture writes off the partial acoustic work rather than banking it |
| Net cash returned | $122,000 | $130,000 refunded − $8,000 restoration |
| Paid, with nothing durable left | $98,000 | this fixture restores the stage, so no partial work survives; a conversion whose partial work legitimately remains would instead record it under §3.11 |

The quote shows all rows and the resulting state ("Stage A silent-capable again after 1 week; no sound capability") before Confirm. **Weakness exposed:** if partial physical work is credited toward a restart at full value, cancel-and-restart becomes a free pause; if it is never credited, option B punishes a legitimate change of plan. The retained-physical-work credit needs its own tuning decision.

#### M6. Queued conversion after a busy facility clears

Stage 1 is shooting film F. The player queues "convert Stage 1 to sound after F wraps" with authority `priceCeiling = $230,000`, `quoteVersion = q7`. With `closeAdmission` the stage accepts no new engagements, so the plan shows "starts after F wraps; F's current estimate 6 weeks; may change with production holds". With `openAdmission` the plan shows "no start estimate: new work may keep entering". Neither shows an exact date while F's holds are open-ended. In parallel, the independent plan "buy camera" executes immediately. When F wraps, the plan re-quotes: $220,000 commits automatically through the one P09 job and P11 commit; a $240,000 quote pauses the plan for review with the delta shown. If the plan needed two more researchers, it waits on an authorized employment action; it never hires.

**Weakness exposed:** `closeAdmission` starves the studio of a stage for the drain period, which can be longer than the conversion itself; `openAdmission` can starve the plan forever. Both consequences must be visible at approval; the recommended default (`closeAdmission`) is a hypothesis.

#### M7. Technology installed just before versus after first filming

| Production | State at conversion completion (week 29) | Result |
|---|---|---|
| Film G, filming scheduled to begin week 30 | not yet filming | default loadout may adopt sound after rechecking plan (method compatible), cost (P11 re-quote), availability (stage operational, not reserved) and dates; explicit confirm; G films with sound from week 30 |
| Film H, filming since week 28 | loadout locked at week 28 | unchanged; captured footage and remaining shoot keep silent technology; no reshoot system exists |
| Film J, in development at a later public-standard date | not filming | not in-flight; new work must satisfy the standard where the catalogue prohibits incompatible use |
| Film K, greenlit and in the production queue, no shooting yet | not filming | may adopt; queue position is not a lock |

Commercial availability without an installation changes none of these rows. **Weakness exposed:** a lock at first filming invites a player to delay the first shooting day to wait for an installation; that is a legitimate scheduling choice only if delay carries its normal production costs, which the production owner must keep visible.

#### M8. Commercialization with retained own-use benefit and no self-royalty loop (LATER COMMERCIALIZATION SCOPE)

Agreement hypothesis: upfront $150,000; royalty 10% of eligible supplier sales; term 260 weeks; `retainedOwnUseRights = true`; `originatorPurchaseBenefit` = the inventor column of M4.

| Event | Eligible sale | Royalty receipt | Note |
|---|---|---|---|
| Rival 1 purchase-route adoption commit, product $100,000 | yes | $10,000 | causal basis: a supplier sale to another studio |
| Rival 2, Rival 3 likewise | yes | $10,000 each | total royalties $30,000; total agreement value $180,000 |
| Originator installs a second stage, product at $45,000 | no | $0 | own purchases are excluded; no self-royalty loop |
| Rival 4 completes its own independent research and installs its own prototype | no | $0 | independent invention; no monopoly over the capability |
| Week 261 | — | none | term expired; own-use rights and originator purchase benefit persist as agreement terms |

**Weakness exposed:** royalty income is bounded by conserved rival count and rival adoption law, so the upfront payment carries most of the value and must be priced by expected eligible sales; that pricing law, exclusivity and whether a supplier launch may precede the fixed commercial-release milestone are unresolved product decisions listed in design §16a.4.

#### Thresholds, saturation, bottlenecks and dominant strategies

- **Saturation:** the budget multiplier reaches ×1.5 at $2,000 per assigned researcher-week, which is $8,000/week for one full laboratory and $16,000/week for two; the total from concentration reaches 1.625× for two laboratories and 2.05× for three. Above each, more cash buys nothing and is not charged.
- **Bottleneck order:** knowledge prerequisite → assigned researchers → seats → usable spend → cooperating laboratories. Each has a typed reason and one remedy.
- **Dominant-strategy risks:** splitting dominates cooperation unless earliness has value (M1); inventor benefit can exceed research cost (M4); cheap old-stage adaptation dominates building another (M3); full restart credit makes cancellation free (M5). None is resolved here.
- **2026-09-11, two of those four are reframed by Owner direction.** M4's accounting is settled: components are charged once each and equipment already produced is never re-charged, so what remains is a balance question about the department's fixed cost rather than about credits. M3 likewise: renovation need not be cheaper than new construction, and [catalogue §9.5](./STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md#95-bottlenecks-break-evens-and-dominated-choices) names and dates the stage service a conversion costs and the capacity a new build adds, both of which this fixture omits and neither of which carries a money value yet. M5 stands as written. M1's fixture stands, but its dominance reading does not: see the scope note above, and the seven allocation fixtures in catalogue §9.4.
- **Rival symmetry:** every row applies to a rival with the same seats, people, budget authority and provenance; P12 conserved resources fund rival ceilings.

#### Future proofs (documented, not run)

- **Native-input proofs:** set a budget ceiling, assign researchers and queue a plan by mouse, keyboard and controller; read marginal-benefit and bottleneck copy at large text; confirm an inventor quote's components without hover-only truth; cancel an installation and read the option-B rows before Confirm.
- **Save/replay proofs:** save mid-project with a partially consumed budget week, a paused plan, a retained-work receipt, a locked loadout and a provenance record; reload and replay to identical digests; a second campaign from a different seed shares none of it; duplicate restart/commit intents after reload create no second project, job, debit or royalty.

### 4.3 Owner-direction entity sketches — 2026-09-10 candidate

Illustrative, not production TypeScript. Later-scope objects are marked; P13's core preserves provenance and interface points only.

```text
ResearchProject (additions)
  participants[]           // { laboratoryFacilityId, personIds[] }; one or more laboratories
  weeklyBudgetCeiling      // player/rival authority; P11 currency
  lastTickUsableSpend      // charged amount; never exceeds ceiling
  lastTickBottleneck?      // typed reason for unusable spend
  concentrationFactorVersion

TechnologyWorkCancellationReceipt (additions)
  retainedWorkConsumedBy?  // replacement researchProjectId; set at most once
  physicalDisposition?     // installation only: completedWorkPaid, restorationCharged, refundedComponents[], retainedPhysicalWorkRef

InventionProvenance                       // core
  provenanceId
  technologyId
  studioId
  contributingResearchProjectIds[]
  completedWeek
  prototypeEquipmentIncluded               // declared by catalogue/research definition
  entitlementClass                         // ownDevelopment | (later) transferred | coDeveloped
  rulesVersion

TechnologyDeploymentQuote                 // built from P09 quote + P11 quote + provenance
  quoteId / quoteVersion
  technologyId, physicalSubjectId?, providerIds[]
  components[]                             // technologyAccess | equipment | siteAdaptation | installation | opexChange
                                           //   each: amount, owner, concession?, billedOnceRef?
  comparable?                              // ordinary purchaser amount after commercial release; absent before
  inventorNetBenefit?
  knownUpcomingReplacement?                // technologyId + window or announced date; public only
  routeAlternatives[]                      // direct | staged | buildAnother | wait
  conversionRequirementDescriptorRef

ConversionRequirementDescriptor           // authored; P09 consumes
  descriptorId, sourceStateKey, targetDefinitionId
  structure, space, installedEquipment, access, compatibility, affectedProviderIds[]
  workDefinition, separableSteps[]?

StudioPlan
  planId, studioId, kind                   // research | technologyConversion | construction | equipmentPurchase
  targetRef, dependencies[]                // planIds, researchCompletion, milestoneId, facilityIdle, staffingLevel
  authority                                // budgetCeiling?, priceCeiling?, quoteVersion, options
  admissionPolicy?                         // closeAdmission | openAdmission
  state, waitingReason?, reviewDelta?
  reservationRef?, executingSubjectRef?, completionReceiptRef?, dispositionReceiptRef?
  order, idempotencyKey

ProductionTechnologyLoadout
  productionId, lockedAtWeek?              // set at first actual filming
  capabilityIds[], providerIds[], rulesVersions, deliberateOlderMethod?

// LATER COMMERCIALIZATION SCOPE — interface points only
TechnologyRightsRecord { rightsId, provenanceId, holderStudioId, rightsKind /* privateUse | supplierLicense | outrightSale */ }
SupplierCommercializationAgreement { agreementId, rightsId, supplierId, upfrontPayment, royaltyRate, royaltyBasis /* eligibleSupplierSales */, termStartWeek, termEndWeek, exclusivity?, retainedOwnUseRights, originatorPurchaseBenefit }
EligibleSaleEvent { saleId, agreementId, buyerStudioId /* never the originator */, causeRef /* e.g. purchase-route adoption commit */, amount, week }
RoyaltyReceipt { receiptId, saleId, agreementId, amount, p11IncomeRef }
AgreementExpiry { agreementId, week, ownUseRightsPersist: true }
```

## 5. Proposed projection/DTO shapes

All DTOs are closed, versioned projections built from authoritative TypeScript state. Unity never
joins names, chooses a provider, evaluates prerequisites, advances work, calculates completion, or
constructs refusal text.

Every snapshot/page response carries this envelope (field names illustrative):

```text
P13ProjectionEnvelope<T> {
  schemaVersion
  projectionVersion
  snapshotRevision
  asOfWeek
  asOfP13DomainSequence
  catalogueVersion
  timelinePolicyVersion
  researchRulesVersion
  adoptionRulesVersion
  capabilityRulesVersion
  payload: T
}
```

Every mutating intent carries `intentId`, an operation-specific idempotency key, exact target IDs,
the expected `snapshotRevision`, referenced definition/rule versions, and any P11 quote ID/version.
No action is valid merely because a client still renders an enabled button.

### 5.1 Timeline projection

```text
IndustryTimelineView {
  projectionVersion
  asOfWeek
  era: { eraId, displayName, beganWeek, source }
  previousMilestones[]   // bounded
  nextMilestones[]       // bounded forecasts
  unreadCount
  historyCursor?
}

MilestoneView {
  milestoneId
  technologyId
  state
  headline
  dateText
  earliestWeek?
  latestWeek?
  exactWeek?             // only if public policy permits
  affectedCapabilityLabels[]
  reasonFacts[]
  attentionClass
}
```

### 5.2 Laboratory / innovation projection

```text
LaboratoryInnovationView {
  studioId
  facilityId
  worldBodyId?
  operationalState
  headline
  detail
  activeProject?
  queue[]                // bounded first page
  availableDecisionCount
  primaryAction
  locateTarget?
  nextCursor?
}

ResearchProjectView {
  researchProjectId
  technologyId
  technologyName
  state
  progress: { completedWork, requiredWork, displayPercent }
  estimate: { earliestWeek, latestWeek, confidenceText }
  assignedPeople[]       // exact IDs + display snapshots
  laboratoryFacilityId
  blocker?
  actionSet[]
}
```

### 5.3 Technology decision projection

```text
TechnologyDecisionView {
  technologyId
  catalogueVersion
  globalState
  studioState
  consequenceSummary[]
  prerequisites[]
  affectedProviders[]
  routes[]
  rivalPublicContext[]
  historySummary
  actions[]
}

TechnologyRouteView {
  routeId
  routeKind
  headline
  detail
  enabled
  refusalCode?
  refusalText?
  costSchedule[]          // P11-authored amount/category/charge week or recurrence/quote version
  costComponents[]        // 2026-09-10: technologyAccess | equipment | siteAdaptation | installation | opexChange,
                          //   each with amount, owner, concession? and billedOnceRef?; plus comparable? and inventorNetBenefit?
  earliestCompletionWeek?
  latestCompletionWeek?
  personOpportunityCost[]
  facilityOpportunityCost[]
  exactConsequence[]
  intentToken?           // opaque, snapshot-bound only when enabled
}
```

### 5.4 Capability/compatibility projection

```text
TechnologyCompatibilityView {
  subjectId              // exact production/project/facility ID
  requestedMethodId
  decision
  requiredCapabilities[]
  satisfiedProviders[]
  blockers[]
  remedies[]
  ruleVersion
}
```

### 5.5 History page

```text
TechnologyHistoryPage {
  asOfWeek
  asOfP13DomainSequence
  phaseOrderLineageRef    // one bounded oldest/newest/digest reference; each row carries exact version
  sourceOrderingManifest[] // hard maximum 16 domains: source revision, native|owner adapter, version, high-watermark
  snapshotRevision
  schemaOrSegmentGeneration
  filterEcho
  requestedPageSize       // default 25
  appliedPageSize         // clamp 1..100
  rows[]                  // default 25, hard maximum 100
  nextCursor?             // opaque stable (effectiveWeek,phaseOrdinal,'P13',p13DomainSequence,eventId)
  hasMore
  summary                 // precomputed, not full reduction
}
```

P13 owns only `p13DomainSequence`; the accepted scheduler owns `phaseId`, `phaseOrdinal`, and
`phaseOrderVersion`. A cross-package history freezes each participating domain's exact source
revision, ordering kind/version, and order high-watermark, then merges by `(effectiveWeek,
phaseOrdinal, domainId, sourceOrderOrdinal, eventId)`. P13 rows use `p13DomainSequence` as their source
ordinal. A P08–P12 owner whose accepted rows lack native sequence must publish an idempotent metadata-
only archive-order adapter bound to exact persisted source order and stable event IDs; P13 cannot mint
it. If no owner-approved adapter exists, exclude that domain and report incompleteness. Every new event
carries its append-time phase facts; catalogue upgrades cannot remap them.
Legacy rows lacking phase evidence use the fixed `legacy_phase_unspecified` bucket with
`phasePrecision: not_recorded`, never a phase inferred from current rules. No P13 projection allocates
or rewrites P08/P10/P12/P14/P15 sequences. Later appends above the frozen high-watermarks cannot
reshuffle a retained page.

A page contains at most 100 rows, so at most 100 exact row-level phase versions, plus one bounded
lineage reference (`oldestVersion`, `newestVersion`, `lineageDigest`). The source-order manifest has a
hard maximum of 16 domains. A lineage/digest mismatch refuses as incompatible history; it is never
truncated or expanded into a century-long version array.

### 5.6 Projection cardinality law

Every projected collection has a hard maximum. Timeline views return at most 12 previous and eight
next milestones; a milestone has at most eight capability labels and five reason facts. A Laboratory
page returns at most 16 queued projects, a research project at most eight assigned people and eight
actions. A technology decision returns at most 16 consequences, 16 prerequisites, 16 providers, 16
routes, ten public rival-context rows, and eight actions. One route returns at most 12 P11 cost rows,
eight person opportunity rows, eight facility opportunity rows, and 12 exact consequences. One
compatibility result returns at most 16 required capabilities, 16 satisfied providers, eight blockers,
and eight remedies. History retains its default 25/hard 100 rows and maximum 16 source domains.

Any omittable list reports `eligibleCount`, `appliedLimit`, `truncated`, and a capability/page route to
the remainder. Any complete legality, prerequisite, provider, action, or fixed schema/catalogue list
must fit its authored hard maximum; catalogue/content validation refuses if it does not. It is never
silently truncated. These caps apply equally to browser and Unity DTOs and prohibit an unbounded
snapshot even when the underlying authoritative store is paged.

### 5.7 Owner-direction projections — 2026-09-10

```text
ResearchProjectView (additions)
  budget: { ceiling, usableThisTick, chargedThisTick, nextTierMarginalBenefitText, bottleneck? }
  participants[]           // laboratory + people snapshots, seats used/available
  concentrationText        // e.g. "2 laboratories cooperating: 1.625× one laboratory (hypothesis)"

PlanQueueView
  plans[]                  // bounded page, at most 32
  each: planId, kind, targetLabel, state, waitingReason?, dependencies[], authoritySummary, admissionPolicy?, reviewDelta?, actionSet[]

TechnologyDeploymentQuoteView
  components[]             // label, amount, owner, concessionText?
  finalAmount
  comparable?              // "Ordinary purchaser: {amount}" or "No retail comparison until commercial release ({window})"
  inventorNetBenefitText?
  knownUpcomingReplacementText?
  routeAlternatives[]      // at most 4
  cancellationPreview?     // option-B rows when executing

ProductionLoadoutView
  productionId, locked, lockedAtWeek?, capabilities[], adoptableNow[], recheckRequired: true
```

Projection cardinality law (§5.6) extends: a plan page returns at most 32 plans, a quote at most eight components and four routes, a research project at most four participating laboratories. Unity computes none of these values.

---

## 6. No-hidden-data contract

For every visible decision, TypeScript must project:

- exact current global and studio states;
- every prerequisite that affects legality;
- every cost and when it is charged;
- assigned people/facility and opportunity cost;
- completion estimate and which inputs can change it;
- capability or compatibility consequence;
- public-standard consequence and grace rule where applicable;
- exact blocker, refusal code, and remedy;
- forecast uncertainty as a range, never a secretly exact date;
- public rival context without hidden policy weights/progress;
- formula/policy/catalogue version for audit surfaces.

Hidden potential, hidden era penalties, hidden poaching dice, secret rival catch-up, and unexplained
`+quality` are prohibited. Internal RNG state and private rival policy weights remain hidden because
they are not player decision facts; their observable reasons and outcomes are typed and auditable.

---

## 7. Exact identity requirements

| Identity | Issuer/owner | Persistence | Forbidden substitute |
|---|---|---|---|
| `technologyId` | catalogue authority | forever, including alias tombstone | display name, tree coordinate, array index |
| `timelineMilestoneId` | timeline catalogue | forever | date or technology ID alone |
| `studioId` | P12 | forever across rename/ownership | studio name or list slot |
| `personId` | P10 | forever across employer/retirement | name, role, roster index |
| `facilityId` | P09 | facility life + historical references | blueprint name, nearest world body |
| `worldBodyId` | final presentation/world registry | exact body lifetime | scene path, first component, proximity |
| `researchProjectId` | P13 intent application | forever in material history | technology/studio pair alone |
| `adoptionId` | P13 | forever | status row index |
| `adoptionWorkOrderId` | P13 | forever in material history | progress bar, facility/technology pair |
| `cancellationReceiptId` | P13 command reducer | forever with terminal work record | transient intent token, target ID alone |
| `capabilityId` | capability catalogue | forever | boolean label or localized text |
| `eventId` + `p13DomainSequence` | P13 history domain | forever | timestamp alone or another package's sequence |
| `phaseId` + `phaseOrdinal` + `phaseOrderVersion` | authoritative scheduler phase catalogue | forever on each event/index row | current scheduler order inferred during query |
| intent token | projection/intent authority | snapshot lifetime only | action label or selected array index |

An employer change in P14 and ownership transfer in P16+ must not change a person, studio,
technology, film, facility-history, or adoption identity. A renamed technology keeps its ID. A
catalogue split/merge needs explicit aliases plus an archival disposition; fuzzy matching stops load.

---

## 8. Persistence rules

### 8.1 Persist

- root, catalogue, timeline-policy, research-rule, adoption-rule, capability-rule, and cost-quote/commit versions;
- scheduler-owned phase ID, immutable ordinal, and phase-order version on every new P13 history row;
- resolved public milestone facts and next-resolution cursor;
- current studio adoption states, per-standard dispositions, and route provenance;
- queued/active/paused/completed/cancelled research state, assignments, accumulated work, blocker,
  required-work version, terminal receipt reference, and permitted retained-work disposition;
- queued/active/paused/completed/cancelled `AdoptionWorkOrder` state, accumulated/required work, blockers, reservations,
  provider references, idempotency key, and P11 quote/commit receipt references;
- every work-cancellation receipt, old/new ID link, released-reservation list, resulting adoption status,
  and P11 cost/refund disposition reference or explicit `none`;
- material completion/adoption/standard/obsolescence events;
- permanent joint-earliest cohorts and exact credits, with stable member ordering but no ID-selected winner;
- compact technology/studio/era summaries;
- any outstanding finance/facility correlation IDs required by P11/P09;
- simulation RNG state/domain cursor needed for replay.
- per-project budget ceilings, last-tick usable spend and bottleneck, participating laboratories and concentration-factor version;
- retained-work consumption marks and installation dispositions on cancellation receipts;
- invention provenance records; production technology loadout locks; conversion requirement descriptor versions referenced by quotes;
- plan queue entries with dependencies, authority, admission policy, reservations and receipts;
- later-scope rights, agreements, eligible-sale events, royalty receipts and expiries once an authorized slice models them.
- future Owner-authorized **committed** entrant-baseline and operating-state participant manifest versions,
  request/source/catalogue/timeline/disposition-rules bindings, affected-set count/root digest, and
  immutable disposition chunks of at most 100 rows with exact P09/P10/P11 receipts; never a copied P12
  operating state or an unbounded embedded affected-ID array.

### 8.2 Derive

- current era label from timeline state;
- route legality and refusal from current authoritative facts;
- capability set from operational adoption/providers;
- display percent and completion estimate;
- current rival public comparison;
- UI copy, sorting, filters, unread and attention presentation;
- current summary cards from materialized summaries/current state.

### 8.3 Never persist

- localized titles as joins;
- a duplicate copy of P09 facility, P10 person, P11 ledger, or P12 studio state;
- weekly progress events;
- UI selection, scroll, expanded rows, hover, focus or camera position in game state;
- Unity-calculated status, legality, completion, capability, reason, or rank;
- generated retrospective claims not grounded in events;
- a full rendered history page or whole-save hash per view.

Canonical export sorts catalogue-independent state by exact identity and P13 events by `(week,
phaseOrdinal, p13DomainSequence, eventId)`. A merged view uses the frozen per-domain high-watermark
and ordering-version manifest plus the cross-domain source-order tuple; insertion/click/UI order
cannot alter bytes.

---

## 9. Migration sketches

### 9.1 V15-or-final-upstream save into first P13 save

1. Validate the exact source version with its frozen validator.
2. Run all accepted upstream migrations unchanged.
3. Add new P13 roots with current catalogue/timeline version.
4. Derive only the minimum present-week global standard/capability facts needed for playability.
5. Mark every generated adoption as `legacyInitialization` with `knownSinceWeek = loadWeek` and
   unknown prior route/date/credit.
6. Grant narrow compatibility to already-committed productions if required; link exact production
   IDs and explain provenance.
7. Do not append retroactive research, rival-first, film-use, award, or Standing history.
8. Canonically validate, export, import, and compare the migrated facts.

### 9.2 Catalogue rename

No state mutation. The same `technologyId` resolves new display data; history presentation may show
the new title while audit view exposes definition version.

### 9.3 Catalogue ID alias

Load exact old ID → consult explicit versioned alias → map to exact new ID → retain original ID in
migration provenance → validate capability/route disposition. Missing, ambiguous, or cyclic aliases
stop migration with a visible error.

### 9.4 Split or removed technology

A split never clones completed progress automatically. Catalogue migration names which new ID keeps
operational capability, which becomes archived-only, and whether any explicit conversion work is
needed. Removed definitions remain tombstones sufficient to render history. “Closest match” is
forbidden.

### 9.5 Future root evolution

Use ordered version gates: structural defaults first, ID aliases second, post-load cross-root
compatibility third, invariant validation last. Migration consumes no gameplay RNG and emits a
bounded structured report.

### 9.6 Phase-order evolution

Preserve every recorded `phaseId`, `phaseOrdinal`, and `phaseOrderVersion` through save/load,
migration, compaction, and page-index rebuild. A later scheduler catalogue may not reassign an
existing ordinal. Legacy rows without phase evidence receive only the fixed
`legacy_phase_unspecified` index bucket and `phasePrecision: not_recorded`; migration never writes a
guessed current phase into the source event.

### 9.7 Upstream archive-order adapters

For a P08–P12 source lacking a native immutable sequence, only that domain's owner/shared history
contract may build a versioned archive index. The index records source revision, stable event ID,
source-order ordinal, order precision, checksum, and high-watermark without changing source facts.
Rebuild is idempotent and byte-equivalent. If stable order cannot be proven, P13 omits the domain from
merged pages and exposes its incomplete reason; it never assigns a foreign sequence itself.

---

## 10. Catalogue authoring and validation law

Before runtime, catalogue lint must reject:

- empty, duplicate, reused, or localized IDs;
- missing prerequisites or capability/provider references;
- cycles and unreachable entries;
- a public standard without a defined use and compatibility/grace law;
- a research route without work definition or required providers;
- a purchase route without a commercial-release milestone or a priced technology/access component *(Amended 2026-09-10)*;
- any future license route without an authorized rights schema, scope/expiry/transfer policy, and cost source;
- a wait route without diffusion/standard access policy;
- generic numeric modifier bags or an effect with no named consumer;
- aliases with cycles, ambiguity, or missing tombstone;
- a world effect without a final authoritative provider/world seam;
- technology whose player and rival law differ without an explicit approved reason;
- a research route without an early-research bound, or a knowledge prerequisite that names equipment
  *(Amended 2026-09-10)*;
- a purchase or conversion route that requires an obsolete intermediate equipment purchase
  *(Amended 2026-09-10)*.

P13A's catalogue fixture contains exactly one technology, `research | wait` routes only, and the
smallest prerequisite-free technology path needed to test the architecture.

---

## 11. Likely current/future files and seam classifications

Names under “future candidate” communicate responsibility, not authority. The first reconnaissance
must prefer final accepted seams and may reject every proposed filename.

| Concern | Current exact path/symbol at `7811377…` | Classification | Future candidate / rule |
|---|---|---|---|
| `GameState` head | `src/core/types.ts::GameStateV15`, `GameState` | **EXISTING** | additive `industryTimeline` and studio-technology roots; never widen frozen versions |
| absolute week | `src/core/types.ts::MarketState.tick` | **EXISTING** | timeline consumes, does not replace, the authoritative week |
| phase/history ordering contract | current tick ordering plus heterogeneous event arrays/IDs; no accepted cross-domain phase/sequence catalogue | **ADDITIVE SHARED CORE PREREQUISITE / UPSTREAM OWNER DEPENDENCY** | pre-P13 scheduler phase catalogue, per-event witnesses, adapter interface, and honest-exclusion law; each P08–P12 owner archive-order adapter is required only before the first merged view that includes it, never for native-only P13A |
| fixed era leaf | `src/core/types.ts::EraConfig` | **INERT PLACEHOLDER** for this package | **DO NOT TOUCH**; keep frozen, add roots |
| save validators/migrations | `src/core/save.ts::validateSaveV15`, `makeSaveV15` and earlier validators | **EXISTING** | next save shape/validator/migrator after final upstream version |
| world generation | `src/core/worldgen.ts` | **EXISTING** | seed timeline and P13 roots without populating fake old history |
| weekly advance | `src/core/tick.ts` | **EXISTING / COLLISION-PRONE** | call one bounded P13 weekly reducer after exact ordering reconnaissance |
| simulation RNG | `GameState.rngState` and current RNG utilities | **EXISTING** | dedicated milestone/rival-decision domains; no UI RNG |
| facility blueprint | `src/core/tuning.ts::FACILITY_BLUEPRINTS` (nine entries on baseline; none established here as the Laboratory) | **UPSTREAM PACKAGE DEPENDENCY** | complete P13A is blocked until the Owner authorizes a minimal P09-governed Laboratory identity/blueprint and stable Scientist provider; an aggregate provider does not satisfy this checkpoint, and P13 does not silently repurpose an entry |
| facility operations | `src/core/types.ts::StudioOperations`, `StudioFacility`; placement modules | **UPSTREAM PACKAGE DEPENDENCY** | reference exact final facility ID/condition/capacity |
| people | `src/core/types.ts::Talent` and employment modules | **UPSTREAM PACKAGE DEPENDENCY** | P10/P12 final stable person/employer contract |
| production compatibility | current Production/P05/P06 future seams | **FINAL CHANGED-PATH REFRESH REQUIRED** | one pure capability/compatibility query owned in TypeScript |
| ledger | `src/core/types.ts::LedgerEntry`; P11 authority | **UPSTREAM PACKAGE DEPENDENCY** | future P11-approved correlated expense intents/kinds |
| rival studio | not present on baseline | **ADDITIVE ROOT NEEDED BY P12, NOT P13** | consume final `studioId`/resources/policy/project facts |
| market pressure | `MarketState.competingSlate`; `src/core/reception.ts` factor `1.0` | **DO NOT TOUCH** | P15 only |
| Standing/awards | `Standing` | **DO NOT TOUCH** | P08 interpretation only |
| recent/permanent events | `src/core/studioEvents.ts`; `StudioEventLog` | **EXISTING DOCTRINE** | use shared history contract or additive technology log as recon determines |
| projection | current snapshot/projection builders and generated bridge | **FINAL CHANGED-PATH REFRESH REQUIRED** | closed bounded P13 view builder, separate detail/history endpoints if architecture permits |
| contract generation | `scripts/generate-bridge-contract.ts` | **EXISTING / COLLISION-PRONE** | only future generated schema wave owns edits |
| save-size proof | `scripts/measure-v14-save-size.mts` | **EXISTING but insufficient** | future P13 6,240-week measure; do not overwrite historical script |
| Unity | accepted client `29aea89…` | **DO NOT TOUCH NOW** | future P13 presentation only after contract seal |
| P05 WIP | read-only `b44007d…` | **UNSEALED FORWARD EVIDENCE** | never cite symbols as final |
| P06 provisional | charter/recon at `c74cf79…` | **FINAL CHANGED-PATH REFRESH REQUIRED** | no implementation against provisional placeholders |

### Likely additive module boundaries after reconnaissance

- catalogue load/lint and alias migration;
- global timeline reducer and deterministic milestone resolver;
- studio research/adoption reducer and resumable adoption-work-order law;
- capability/compatibility query;
- typed P13 history append/summarization;
- bounded P13 projections and decision/intents;
- save-version validation/migration;
- endurance/replay harnesses.

Whether these are separate files is an implementation choice. They must remain separate ownership
concerns even if the accepted architecture combines them physically.

---

## 12. Worker ownership and collision map

One editing owner exists per checkout and collision-prone file. Suggested future wave ownership:

| Owner | Exclusive scope | May read | Must not edit concurrently |
|---|---|---|---|
| catalogue owner | catalogue definitions, lint, alias fixtures | state/save/decision APIs | tick, save head, projection, Unity |
| state-law owner | P13 domain types, pure transitions, compatibility | catalogue and upstream roots | save/projection/Unity |
| integration owner | weekly ordering, P09/P10/P11/P12 adapters | all domain modules | catalogue and generated contract while occupied |
| future P15B transition participant | entry-week baseline and research/adoption work-disposition receipt inside the all-owner candidate | P12 request plus P09/P10/P11 facts | P12 registry state, partial standalone receipt commit, or fabricated pre-entry history |
| save owner | next save type, validator, migration, canonicalization | domain state/catalogue | tick/projection/Unity |
| projection owner | pure view builders, intent query/apply boundary | state/save contract | core law, generated C# until schema wave |
| contract owner | schema/protocol/projection bump, generated consumer, fixtures | projection | all other workers stop on generated paths |
| Unity owner | future presentation/input only | sealed generated contract | TypeScript law, generated source |
| proof owner | fixtures, replay, endurance, negative tests, artifact manifests | all accepted code | production files unless assigned a proven fix |
| plan-queue owner (later capability) | plan contract, dependencies, revalidation and admission policy | P09/P11/P13 commit APIs | any owner's commit logic; hiring |

Root integrator owns merges and changed-path reconciliation. Workers never merge campaign branches,
repoint remotes, regenerate consumer code casually, or share a dirty worktree.

---

## 13. Implementation waves

These waves are planning guidance and cannot begin without a final charter.

### W0 — post-upstream reconnaissance and contract freeze

- verify exact final P05/P06/P09/P10/P11/P12 authorities and changed paths;
- map save/projection/protocol/schema head and generated consumer;
- map person, employer, studio, facility/world body, production method and ledger seams;
- record the Owner's blocking Laboratory/Scientist/provider substrate decision; do not infer it from
  a current blueprint or role label;
- restamp this annex with exact symbols and reject invalid assumptions;
- freeze one sound fixture, research/wait routes, and Owner-decision defaults used only for proof;
- record the 2026-09-10 direction's proof-only fixture values (early-research bound, budget tiers,
  concentration factor, conversion descriptor, admission-policy default) as hypotheses, never as tuning.

**Exit:** no unresolved P13A dependency, no implementation edit.

### W1 — P13A.1 one-entry catalogue and lint

- one immutable synchronized-sound ID;
- one capability/use and two route definitions: research and wait;
- one public milestone/standard fixture;
- prerequisite/alias/effect lint and hostile invalid catalogues.

**Exit:** catalogue is data-driven, unique, acyclic, concrete, and not a modifier bag.

### W2 — P13A.1 additive state and pure law

- global timeline and one studio adoption/research state;
- pure query/apply decisions with typed reasons;
- persistent assignment/queue and compatibility query;
- one resumable `AdoptionWorkOrder`, explicit reservations/P11 refs, automatic completion/release,
  and idempotent cancellation/retry;
- player/rival law uses the same functions.

**Exit:** pure tests cover all transition/refusal pairs and consume no preview RNG.

### W3 — P13A.1 save/migration/determinism and slice seal

- new save version above final upstream head;
- honest legacy initialization and in-flight compatibility fixture;
- canonical ordering, catalogue aliases, unknown-ID refusal;
- replay digest and RNG-domain tests.
- actual 6,240-week expected and hostile-envelope runs for the headless slice.

**Exit:** byte-stable round trip, no fabricated history, bounded measurements, and separate
technical/Owner disposition. Do not begin P13A.2 automatically.

### W4 — P13A.2 upstream consequence integration

- final P09 Laboratory and provider capacity;
- P10 Scientist/person identity plus P12 employer truth;
- P11 cost/ledger correlation;
- P12 rival adoption/resource consequence;
- final P05/P06 production compatibility consequence.
- rerun the 6,240-week expected and hostile envelopes with every accepted integration active.

**Exit:** no shadow facility/person/cash/studio/production state, no rival cheat, and separate
technical/Owner disposition. Do not begin P13A.3 automatically.

### W5 — P13A.3 history, bounded projections, and contract

- material event append plus summaries and cursor pages;
- world card, decision detail, compatibility and timeline projections;
- versioned generated contract with stale-intent protection;
- size/projection budgets.

**Exit:** Unity could render every state without computing a rule.

### W6 — P13A.3 future world/client presentation and input

- exact Laboratory world anchor and local card;
- timeline/innovation/detail surfaces;
- world effect on exact provider;
- responsive mouse/keyboard/controller/accessibility implementation.

**Exit:** sealed bridge, visual oracle and real-HID floor; no law in Unity.

### W7 — P13A.3 endurance, hostile review, and Owner checkpoint

- 6,240-week deterministic matrix and migration endurance with the sealed core, integrations,
  projections, and differing page/view schedules;
- anti-facade and asymmetry attacks;
- exact artifact manifest and P13A final report;
- Owner journeys and KEEP/REVISE/REJECT ruling.

**Stop:** no second technology or broader catalogue before Owner acceptance.

### After P13A — capability sequence (IMPLEMENTATION RECOMMENDATION, 2026-09-10)

Under the outcome-first order, each later capability is its own sealed slice with its own refresh and
authorization: staffing to capacity and budget ceiling; retained progress and option-B cancellation; plan
queues; multi-laboratory cooperation and split; commercial-release purchase, inventor pricing and gap-aware
conversion; forecast precision and replacement disclosure; then the later commercialization slice under its
own placement. None is a prerequisite of P13A, and none is discarded.

---

## 14. Test fixtures

### 14.1 Canonical functional fixtures

| Fixture | Required state | Proves |
|---|---|---|
| `sound-before-forecast` | pre-window, no studio awareness | no early leak or action |
| `sound-forecast` | bounded window visible | uncertainty and no exact hidden date |
| `sound-research-ready` | eligible Scientist + operational Laboratory + funds | enabled research and exact costs |
| `sound-research-paused` | same project, Laboratory unavailable | blocker, no work, stable ID |
| `sound-paused-round-trip` | queued/active research and adoption states paused across save/load | identical IDs, work, blockers, reservations, adoption status, and deterministic resume |
| `sound-research-auto-complete` | exact work threshold reached | one completion, automatic assignment/reservation release, ready-to-adopt state, no claim intent |
| `sound-work-cancel-retry` | active research/adoption order; duplicate cancel/retry intents | disclosed retained-work/cost disposition and no duplicate release, debit, event, or capability |
| `sound-new-id-restart` | cancelled project/order plus replacement intent | cancelled record stays terminal; new stable ID receives only receipt-authorized retained work once |
| `sound-waiting` | wait selected before diffusion | retained old method + forecast |
| `sound-wait-matured` | public standard resolves | readiness without fake research credit |
| `sound-adoption-active` | facility conversion underway | capacity/cost/world state |
| `sound-operational` | capability provider exact ID | sound production legal |
| `sound-incompatible-production` | requested sound, no provider | exact production blocker/remedy |
| `sound-old-method` | pre-standard silent method | legal and unpenalized |
| `sound-rival-first` | rival has resources/capacity | symmetric operational consequence |
| `sound-rival-blocked` | rival lacks provider/resources | no impossible rival sound film |
| `sound-standard-grace` | in-flight silent work | explicit non-retroactive transition |
| `sound-midwork-save` | active project at fractional work | round-trip continuation |
| `sound-v15-migration` | old save with releases/current work | honest present-time initialization |
| `sound-catalogue-alias` | exact legacy ID mapping | stable identity/provenance |
| `sound-unknown-id` | unrecognized saved ID | visible fail, no fuzzy substitution |
| `sound-stale-intent` | snapshot changes after query | no debit/mutation; refreshed reason |
| `late-entry-after-standards` | future P15B entrant activates after several public standards, including a 512-technology hostile catalogue | entry-week baseline only; manifest count/root digest and chunks of at most 100 cover every exact technology once; no research/adoption/use first, cost, or prior history |
| `late-entry-duplicate-request` | same P12 entrant request/version/body delivered twice, then same ID with changed body | identical request returns one P13 manifest/chunk set and baseline; changed body refuses; no duplicate rows/events |
| `dormancy-during-adoption` | future P15B/P12 transition requested with active adoption, assignments, and reservations | one complete typed, request/rules/source-bound disposition manifest/chunk set joins all-owner candidate with exact P09/P10/P11 receipts, or every fact remains unchanged |
| `phase-catalogue-upgrade` | old same-week P13/P08–P15 rows are paged, then a new scheduler phase catalogue version adds a reserved phase | old event phase facts, page order, cursor continuation, and replay stay identical; legacy rows remain noncausal/unknown-phase |
| `legacy-domain-order-adapter` | a P10/P08 fixture has stable IDs/persisted source order but no native sequence | source owner builds one idempotent versioned metadata index and page order survives rebuild; absent proof excludes domain with explicit incompleteness |

### 14.2 Catalogue hostile fixtures

- duplicate technology and alias IDs;
- self-cycle, multi-node cycle, missing/unreachable prerequisite;
- standard without compatibility/grace policy;
- a license route present in the P13A fixture (scope violation), plus a future schema fixture with no authorized rights/scope/cost source;
- wait without public-access condition;
- research without provider/work definition;
- arbitrary `qualityMultiplier` effect;
- missing facility/capability/content reference;
- player-only or rival-only rule divergence;
- alias cycle, one old ID mapped to two targets, and removed target without tombstone.

### 14.3 Cross-root hostile fixtures

- Scientist changes employer mid-project;
- Laboratory demolished/unavailable while assigned;
- studio display name changes during research;
- facility world body absent while authority is valid;
- insufficient cash between query and apply;
- rival project tries sound before adoption;
- public standard and research completion resolve in same week;
- adoption completes while a duplicate completion/cancel dispatch is queued;
- two studios finish in the same authoritative phase/week and receive one joint-earliest cohort with
  stable member/event ordering; swapping IDs or insertion order cannot create a sole winner;
- save catalogue version differs from installed catalogue;
- P05/P06 production ID exists without expected provider projection;
- missing/stale entrant-baseline or operating-state participant receipt blocks P12 activation/transition;
- injected failure after one work-order disposition leaves all orders, reservations, finance facts, and P12 operating state at the pre-candidate revision;
- missing/duplicate participant subject, wrong affected-set count/root digest, stale request/source/
  catalogue/timeline/rules version, chunk over 100 rows, broken chunk chain, or mismatched P09/P10/P11
  receipt rejects the all-owner candidate; and
- refused participant receipt applies zero P13 writes; committed receipt references the exact all-owner transaction and cannot be mutated in place.

### 14.4 Owner-direction fixtures — 2026-09-10

| Fixture | Required state | Proves |
|---|---|---|
| `research-window-before-release` | technology `researchable`, not `available`; prerequisites held | early research eligible; wait route not yet purchasable; no invented retail price |
| `research-prerequisite-missing-funded` | ceiling set, prerequisite absent | zero work, zero spend charged, idle payroll shown |
| `budget-ceiling-saturation` | full laboratory, ceiling above saturation | charged amount equals saturation tier; bottleneck text; remainder in cash |
| `budget-seats-empty` | two of four seats, high ceiling | `LAB_SEATS_AVAILABLE`; no automatic hire |
| `two-labs-cooperate` | two laboratories on one project | output within 1.5–1.75× one laboratory; rival fixture identical |
| `two-labs-split` | two laboratories, two technologies | each at single-laboratory rate |
| `mid-project-change` | ceiling and staff changed mid-project | accumulated work unchanged; next tick uses new inputs |
| `retained-work-restart` | cancelled project with retained work; restart twice | seeded once; duplicate idempotent; second restart refused |
| `staff-transfer-mid-project` | researchers moved between laboratories | work retained; output from new laboratory next tick |
| `inventor-quote-prerelease` | own provenance before `available` | in-house terms; no comparable |
| `inventor-quote-postrelease` | own provenance after `available` | comparable, concession lines, net benefit; prototype billed once |
| `ordinary-quote-public-prerequisite` | studio researched only a public prerequisite | no concession |
| `leapfrog-direct-purchase` | studio without intermediate generation | direct purchase legal; no obsolete line |
| `conversion-descriptor-old-vs-compatible` | Stage A and Stage B descriptors | duration/cost follow descriptors, not tier count |
| `camera-purchase-no-job` | portable equipment | no P09 job created |
| `replacement-disclosure` | announced successor exists | shown beside quote; hidden rival research absent |
| `plan-after-film-close-admission` | busy stage, plan queued | no new engagement admitted; start after holders clear; no exact date |
| `plan-after-film-open-admission` | same with open admission | starvation consequence disclosed |
| `plan-authority-exceeded` | fresh quote above price ceiling | `pausedForReview` with delta; no commit |
| `plan-parallel-independent` | three independent plans | concurrent execution |
| `install-cancel-option-b` | executing conversion cancelled | atomic rows; resulting state; reservations released once |
| `loadout-lock-before-after` | films G, H, J, K of Annex §4.2 M7 | lock at first filming only; recheck before adoption |
| `provenance-record` | research completion | provenance written once; no royalty objects in core |
| `campaign-isolation` | two campaigns from different seeds | no shared research, budget, plan, provenance or rights |
| `owner-direction-save-replay` | all of the above mid-state | identical digests after reload; no duplicate project, job, debit or receipt |

---

## 15. Long-run/endurance harness

### 15.1 Matrix

Run at least:

- seeds: fixed minimal, fixed stress, and a bounded deterministic corpus;
- policies: player research/wait; rival research/wait mixes under the same guards;
- starts: new 1920, migrated mid-century, migrated late-century;
- durations: 52, 520, 2,080, 4,160 and 6,240 weeks;
- save cycles: none, annual round trip, and checkpoint round trips;
- catalogue cases: current, alias migration, and tombstoned optional technology.

### 15.2 Captured metrics

```text
week
totalSaveBytes
p13RootBytes
catalogueVersion / policyVersion
globalMilestoneCount
materialTechnologyEventCount
summaryRowCount
activeResearchCount
activeAdoptionWorkOrderCount
adoptionRowCountByStudio
tickDurationP50/P95/P99
currentProjectionDurationP95
historyPageDurationP95
migrationDuration
replayCheckpointDigest
rngDomainCursors
```

### 15.3 Long-run invariants

1. Exactly 6,240 ticks produce the same checkpoint digests for the same seed/intents.
2. No duplicate technology, milestone, project, adoption, event, studio, person, or provider ID.
3. Every operational capability has a valid adoption and provider cause.
4. Every rival use is possible under that rival's conserved state.
5. Public milestone state is identical for all studios at a week, and every studio has exactly one
   valid disposition for each effective standard.
6. A standard emits once; research/adoption completion and assignment/reservation release emit once;
   costs debit once even under duplicate completion/cancel dispatch.
7. No technology history refers to a reminted identity after rename/employer/ownership change.
8. Old-save unknowns remain unknown; no later view invents them.
9. Event storage grows with material transitions, not weekly time.
10. Active-work tick cost is independent of total historical event count.
11. Current projection is bounded; a history page never loads more than its hard maximum.
12. No routine view recomputes a whole-save hash or full-century aggregate.
13. Catalogue row order and locale do not affect state, RNG, or digest.
14. Save/load does not duplicate assignments, milestones, debits, or notifications.
15. Technology removal/alias leaves history renderable and auditable.
16. Every P13 studio-transition participant subject appears exactly once in a bounded immutable chunk;
    the root manifest's count/digest and P09/P10/P11 receipt refs validate before P12 state changes.
17. Equal P12 transition request/version/digest is idempotent; a reused request ID with changed body
    refuses, and candidate/committed/refused receipt versions never partially apply P13 state.
18. Accumulated research work never decreases except by terminal cancellation into a receipt, and the sum of retained work seeded from one receipt is at most the receipt's value.
19. Charged research spending in any tick is at most the ceiling and at most the usable spend; a ceiling above saturation changes no charge.
20. A studio has at most one active research project per technology, and cooperating laboratories on one project never yield more than proportional output.
21. Every deployment quote's final amount is at least its site-adaptation plus installation components; a concession never produces a negative net.
22. A production loadout never changes after its lock week.
23. No eligible-sale event names the originator as buyer; no royalty receipt exists without an eligible-sale cause; no royalty after term expiry.
24. Plan queue state changes create no debit, reservation, job or project except through the owner's normal commit at execution.

### 15.4 Budgets and failure thresholds

The **expected** envelope is 10 studios, 128 technologies, at most two active research/adoption
orders per studio, and roughly 3,000 material events. The **hostile** envelope is 32 studios, 512
technologies, eight active orders per studio, 100,000 material events, repeated pause/cancel/resume,
catalogue aliases/tombstones, and selected histories at least 20 pages deep. These cardinalities are
test inputs, not promised shipping content.

Provisional targets subject to W0 measurement:

- expected P13 persisted contribution under 1 MiB at week 6,240;
- investigate at 1 MiB; hard stop for design review at 2 MiB;
- current view bounded to materialized state and no more than 100 rows;
- default history page 25, hard maximum 100;
- tick slope must remain statistically flat against retained-history growth;
- migration and current projection must remain within future campaign-wide budgets rather than
  claiming private budget exemptions.

Any superlinear growth, repeated full-history scan, whole-save hash per refresh, duplicate, or
fabricated record is a fail regardless of average frame time.

---

## 16. World/UI anatomy

### 16.1 Laboratory world states

| State | Management-distance cue | Local card | Forbidden facade |
|---|---|---|---|
| idle / available work | restrained ready marker | “Choose an innovation” + count | busy Scientists without project |
| active | steady work light/equipment activity | exact technology, people, estimate | animation controlling progress |
| paused | clear amber/static interruption cue | blocker + remedy | scientists appearing productive |
| breakthrough | one bounded celebratory pulse | exact completion and next adoption action | unbounded particles/noise |
| unavailable | facility-owned condition cue | P09 reason + research impact | P13 inventing condition state |

### 16.2 Affected provider world states

A sound-capable stage/post provider may show a restrained equipment/nameplate change only after the
authoritative adoption/provider state is operational. Conversion uses the P09/P05/P06 facility's
real construction/work status. Decorative equipment never implies capability before the TypeScript
snapshot says it exists.

### 16.3 Workspace anatomy

```text
Header: Era / exact date / public milestone state
Context: selected Laboratory or technology / studio adoption state
Consequence: “What changes” cards, concrete and typed
Route comparison: Research | Wait | Purchase (from commercial release), with decomposed quote components
Prerequisites and blockers: always adjacent
Opportunity cost: people / facility / cash / duration
Affected work: exact facilities and productions
Public context: announced rival adoption only
History: summary + bounded page link
Primary action: one title-bearing action / exact refusal
Secondary: Locate / Compare / Back
```

The lot remains dominant. A retained workspace does not automatically move the camera, and snapshot
refresh never steals selection. Timeline, lab, and production blocker deep-link to the same
technology ID and return to their originating context.

---

## 17. Responsive rules

| Width / mode | Layout rule |
|---|---|
| wide desktop | lot remains visible; workspace uses restrained side region; route cards compare in columns |
| compact desktop / tablet landscape | two-column detail; route cards scroll as a bounded horizontal/stacked group with full labels |
| narrow / portrait | single-column sheet; “what changes” then state then routes then blockers; lot context retained behind/above |
| large text | no fixed-height cards; route comparison stacks; action/refusal remains adjacent |
| controller 10-foot | one focus region at a time, persistent context header, no tiny graph nodes |

No essential field disappears at narrow width. Graph topology may be replaced by list/breadcrumbs.
Tables become labeled cards rather than horizontal clipping. Safe areas and generated navigation
order are tested, not assumed.

---

## 18. Controller, keyboard, and mouse behavior

### Mouse

- left-select exact world Laboratory; explicit button opens detail;
- hover may preview but focus/click exposes identical information;
- route action needs one clear confirmation with title, cost and consequence;
- mouse wheel in a panel never advances time or zooms the lot accidentally;
- Locate explicitly focuses exact provider; selection/refresh does not.

### Keyboard

- logical Tab order: context → consequence → routes → blockers → action → secondary actions;
- arrows navigate route group/list; Enter activates enabled action; Space never silently differs;
- Escape/Back closes one layer and mutates nothing;
- a shortcut can open Industry Timeline and return focus to the invoking world object;
- page controls expose cursor/history navigation and announce result count.

### Controller

- directional navigation follows visual reading order and never traps in a graph;
- shoulder controls may change high-level surface only when labeled;
- confirm opens/acts; cancel backs one layer; long-press is not required for core actions;
- focus always exposes route, cost, timing, consequence and refusal text;
- selection change does not dispatch or consume RNG;
- disconnect/reconnect restores safe focus without repeating an intent.

### Input invariants

Mouse, keyboard and controller dispatch the same opaque intent against the same snapshot token.
Double-click, key repeat, stale confirmation, and reconnect cannot duplicate project, adoption, debit,
milestone acknowledgement, or notification.

---

## 19. Error/refusal language

Copy is generated from typed TypeScript reasons. Illustrative patterns:

| Code | Required player-facing form |
|---|---|
| `TECH_NOT_AVAILABLE` | “Synchronized sound is not available yet. Industry forecasts place it between {earliestDate} and {latestDate}.” |
| `TECH_PREREQUISITE_MISSING` | “Research is unavailable: {prerequisiteName} must be operational first.” |
| `LAB_REQUIRED` | “Research needs an operational Research Laboratory.” |
| `LAB_UNAVAILABLE` | “Research is paused: {laboratoryName} is {conditionReason}. {remedy}.” |
| `SCIENTIST_REQUIRED` | “Assign one eligible Scientist to begin research.” |
| `PERSON_NOT_EMPLOYED` | “{personName} is no longer employed by {studioName}. Choose another eligible Scientist.” |
| `PERSON_ALREADY_ASSIGNED` | “{personName} is assigned to {projectName} until {dateOrRange}.” |
| `INSUFFICIENT_CASH` | “This research/adoption commitment costs {cost} under quote {quoteVersion}; the studio has {cash}. Short by {shortfall}.” |
| `LICENSE_ROUTE_NOT_AUTHORIZED` | “Technology licensing is not part of this campaign rules version. Research or wait for public access.” |
| `ADOPTION_PROVIDER_REQUIRED` | “Adoption needs {providerName}: {missingCapability}.” |
| `PRODUCTION_CAPABILITY_MISSING` | “{productionTitle} requires synchronized-sound recording. Complete adoption for {facilityName}, or choose the silent method while it remains compatible.” |
| `PUBLIC_STANDARD_INCOMPATIBLE` | “New {useName} work must meet the {standardName} standard from {date}. {exactRemedies}.” |
| `STALE_DECISION` | “Studio conditions changed. Review the refreshed cost, timing and consequence before confirming.” |
| `CATALOGUE_ID_UNKNOWN` | “This save references unknown technology ID {id} from catalogue {version}. No substitution was made.” |
| `CATALOGUE_MIGRATION_AMBIGUOUS` | “Technology migration is ambiguous for {id}. Loading stopped to preserve history.” |
| `RESEARCH_NOT_YET_RESEARCHABLE` | “{technologyName} cannot be researched before {researchWindowOpens}. Prerequisites held: {list}.” |
| `RESEARCH_SPEND_UNUSABLE` | “Only {usable} of the {ceiling} weekly budget can be used: {reason}. The remainder stays in cash.” |
| `LAB_AT_CAPACITY` | “{laboratoryName} has {seats} seats, all assigned. Expand it, build another laboratory or cooperate with one.” |
| `LAB_SEATS_AVAILABLE` | “{laboratoryName} has {free} empty seats; hire researchers to use more of the budget.” |
| `RESEARCH_ALREADY_ACTIVE` | “{studioName} already has an active project on {technologyName}: {projectName}.” |
| `RETAINED_WORK_ALREADY_CONSUMED` | “Retained work from {receiptId} was already applied to {projectName}.” |
| `PURCHASE_NOT_YET_COMMERCIAL` | “{technologyName} is not commercially available until {releaseWeekOrWindow}. Research it or wait.” |
| `PLAN_PAUSED_FOR_REVIEW` | “Plan {planName} paused: {changedTerm} changed from {old} to {new}, outside the approved {authority}. Review to continue.” |
| `PLAN_WAITING` | “Plan {planName} is waiting: {reason}. Current holders: {list}. No start date can be promised yet.” |
| `PLAN_REQUIRES_EMPLOYMENT_ACTION` | “Plan {planName} needs {count} more researchers. Hire them to continue; plans never hire.” |
| `LOADOUT_LOCKED_FILMING` | “{productionTitle} began filming in {week}; its technology is fixed. New productions can use {technologyName}.” |
| `INSTALL_CANCEL_DISPOSITION` | “Cancelling pays {completed} for completed work and {restoration} for restoration, and returns {refund}. {subjectName} will be {resultingState} after {weeks}.” |

The 2026-09-10 templates name weeks or windows because the accepted product has no calendar; existing
templates keep their date placeholders, and every one of them resolves through whatever presentation owner
the post-P12 refresh confirms (§12.1a). Bad language: “Not allowed,” “Wrong era,” “Research failed,”
“Rival bonus,” “Requires more points,” or a satisfied reason beside a disabled action. Every refusal identifies cause and, when possible,
one exact remedy. Unknown/ambiguous migration errors must not pretend recovery succeeded.

---

## 20. Anti-cheat / anti-facade assertions

1. No operational capability without an exact adoption and valid provider.
2. No rival production method without the same prerequisite/cost/capability law as the player.
3. No player-only standardization penalty or rival-only catch-up grant.
4. No research progress from Unity animation, elapsed wall clock, view opening, or selection.
5. No completion/debit/event from preview/query; only accepted apply intent mutates.
6. No duplicate charge or project from repeated/stale intents.
7. No private catalogue cloned or mutated per studio.
8. No generic quality modifier or hidden era mismatch term.
9. No display name, index, list order, Transform, or proximity join.
10. No decorative Scientist/provider body treated as authority.
11. Completion automatically releases the finished project's reservations exactly once. No
    assignment switches to unrelated work unless an explicit approved queue policy names it; no
    claim click or manual ritual is required.
12. No historical first awarded from migration or inferred from a film date.
13. No catalogue reorder/locale change alters prerequisite resolution or RNG.
14. No public forecast leaks a pre-rolled exact date beyond approved policy.
15. No material notice shown without one underlying exact event ID.
16. No projected action is enabled unless apply can perform it for the snapshot; stale apply fails
    closed with no mutation.
17. No full save/history is projected to Unity “for convenience.”
18. No whole-save hash per view or O(history) weekly scan.
19. No P13 direct mutation of Standing, awards, market demand, or Power Ranking.
20. No licensing claim labeled original parity.
21. No research spending charged without usable work, and no work from cash alone.
22. No retained work seeded twice, transferred across technologies or studios, or created by a duplicate restart.
23. No inventor concession without valid provenance; no concession for a public prerequisite; no free installation; no negative net quote.
24. No obsolete intermediate equipment required by any purchase route; no building job invented for portable equipment.
25. No plan commits, reserves, hires or substitutes silently; no start date claimed while open-ended holds remain.
26. No production loadout changed after first filming; no retroactive footage improvement.
27. No royalty from the originator's own purchase, from random cash or from rival box office; no monopoly over a capability.

---

## 21. Hostile-review checklist

### Boundary

- [ ] P13 consumes rather than reimplements P08/P09/P10/P11/P12 truth.
- [ ] P13A has exactly one technology and one global transition.
- [ ] All licensing, full alternate history, P14/P15 and P16+ are absent from P13A.
- [ ] P05 WIP and P06 provisional names are not treated as final.

### Original/comparator evidence

- [ ] Research-before-auto-unlock is cited; licensing is marked successor-only and Owner-gated outside P13A/P14.
- [ ] No hidden original formula is invented.
- [ ] Comparator mechanisms have sources, questions, adopt/reject and required simulation.
- [ ] No trade dress, formula or code is copied.

### State/identity

- [ ] One global catalogue; all per-studio rows reference stable IDs.
- [ ] Availability, research, adoption, operation and standardization remain distinct.
- [ ] `EraConfig` and frozen saves are untouched.
- [ ] Person, studio, facility, production and history IDs survive employer/rename/ownership change.

### Simulation/economy

- [ ] Every technology effect is concrete and has a named consumer.
- [ ] Old methods persist until explicit compatibility law.
- [ ] P11 owns every debit/forecast and no shadow currency exists.
- [ ] Rival use is causally possible and symmetric.

### Save/history/endurance

- [ ] Migration creates honest absence and no retrospective credit.
- [ ] Catalogue aliases are explicit; unknowns fail visibly.
- [ ] Replay, RNG domains and canonical order survive load/reorder/locale.
- [ ] 6,240-week tests show bounded tick/projection/storage and no quadratic scan.

### UI/input/proof

- [ ] Laboratory and provider world cues derive from state, not animation.
- [ ] Route consequence/cost/blocker is exposed before confirmation.
- [ ] Mouse/keyboard/controller/reduced-motion/large-text journeys pass.
- [ ] Unity calculates no law; generated contract is closed and exact-ID.
- [ ] Automated PASS is not represented as Owner acceptance.

### Owner direction 2026-09-10

- [ ] Early-research window, commercial release, installation, operational capability and standard are distinct facts.
- [ ] Payroll, Opex, project spending and installation are separate ledgers with one wallet.
- [ ] Budget is a ceiling; unusable spend is never charged; bottleneck and marginal benefit are shown.
- [ ] Two cooperating laboratories land within the Owner's 1.5–1.75× direction under the fixture; rivals identical.
- [ ] Retained work survives cancel/pause and cannot multiply.
- [ ] Inventor quote decomposes, shows net benefit and a genuine comparable only after release.
- [ ] Direct purchase needs no obsolete equipment; descriptors drive conversion effort.
- [ ] Plans create planned expenditure only; execution revalidates inside authority; no auto-hire.
- [ ] Option-B cancellation rows and resulting state precede Confirm.
- [ ] Loadout locks at first actual filming only.
- [ ] Provenance recorded; no supplier simulation in core; self-sales excluded.
- [ ] All new state is campaign-specific and round-trips.

---

## 22. Stop conditions

Stop the future implementation wave immediately if:

- exact final P05/P06/P09/P10/P11/P12 seams cannot be resolved;
- the scheduler-owned immutable phase catalogue or fixed legacy unknown-phase policy is absent;
- the Owner has not explicitly selected a P09/P10-compatible Laboratory/Scientist/provider substrate;
- an upstream changed path overlaps P13 work without one editor/merge owner;
- implementing P13A requires widening `EraConfig` or changing a frozen save validator;
- a technology effect cannot be stated without generic quality/score language;
- the Laboratory/person/provider would be decorative rather than authoritative;
- player/rival law diverges or rival use lacks conserved cause;
- the sound capability cannot connect to one accepted production decision without speculative code;
- migration would require fabricated history;
- catalogue identity/alias rules are ambiguous;
- preview consumes RNG or action query/apply disagree;
- projected/UI convenience demands full history or whole state;
- endurance reveals superlinear work, unbounded rows, or budget breach;
- P13A grows beyond one technology/transition or absorbs P14/P15/P16+;
- technical proof is substituted for the Owner journey.
- a research budget can be charged without usable work, or usable work cannot be computed from accepted person/facility truth;
- the accepted production lifecycle exposes no first-filming transition on which to lock a loadout;
- a deployment quote cannot obtain a genuine comparable or in-house terms from P11 and P09 without inventing a price;
- a plan would have to hire, substitute or commit outside its authority to execute;
- provenance cannot be recorded without a supplier simulation.

A stop produces a report with exact evidence and alternatives. It does not invite an adjacent
unapproved implementation.

---

## 23. Rollback

Future implementation must be wave-sealed and reversible by ordinary commit history, never by
destructive workspace commands.

- each wave begins from a clean isolated branch/worktree and ends with exact changed paths;
- no save-version producer ships until its validator, migrator and round-trip fixtures are complete;
- no generated bridge change lands without its exact generated consumer and contract gate;
- catalogue data can be disabled only before saves containing its IDs are accepted; afterward use
  explicit migration/tombstones, never deletion;
- feature disablement cannot reinterpret P13 saves as pre-P13 saves;
- failed Unity presentation may be rolled back independently only if the sealed contract remains
  compatible and TypeScript state is not stranded;
- a failed P13A candidate is not merged; preserve artifacts, report the failed hypothesis, and
  return to the last accepted checkpoint.

Rollback reports identify what was removed, whether any test/profile save was created, and how it
can be recovered. Owner profiles are copied privately for testing and never mutated in place.

---

## 24. First-checkpoint final report format

```text
P13A SYNCHRONIZED SOUND STATUS
KEEP CANDIDATE / REVISE / REJECT / BLOCKED

AUTHORITY
- Owner authorization record
- final P05/P06/P09/P10/P11/P12 branches and SHAs
- TypeScript / Unity implementation branches and SHAs
- local = remote verification
- clean worktrees

SCOPE
- P13A.0 substrate decision and exact authority
- one technology ID
- one timeline milestone ID
- one Laboratory/facility ID
- one Scientist/person ID
- research / wait routes; licensing explicitly absent
- one research-project ID and one adoption-work-order ID
- paused-state round-trip and cancellation-receipt IDs
- cancelled old ID plus distinct replacement ID for each tested restart
- one rival studio/adoption ID
- one production/provider consequence
- explicit exclusions
- researcher seats used, budget ceiling fixture and concentration factor version
- retained-work receipt and consumption mark for each tested cancel/restart
- one deployment quote with components, comparable status and net benefit
- one plan with admission policy, authority and revalidation outcome
- one production loadout lock and one pre-filming adoption recheck
- one invention provenance record; commercialization objects explicitly absent

CONTRACT
- save version
- schema ID
- protocol version
- projection version
- generated consumer hash
- catalogue / timeline / policy versions

DESIGN DECISIONS USED
- dates fixture
- Laboratory/Scientist/provider substrate ruling
- license exclusion and future-decision status
- skip/compatibility fixture
- public-standard fixture
- distinction between fixture and Owner-approved long-range law

MACHINE PROOF
- catalogue lint
- unit/property/integration suites
- save/migration round trips
- deterministic replay digests
- anti-cheat/asymmetry results

ENDURANCE
- expected/hostile cardinalities, seeds and policies
- actual 6,240-week completion at P13A.1, P13A.2, and P13A.3 boundaries
- save/P13 bytes at checkpoints
- tick/projection/history-page percentiles
- duplicate/orphan/history invariants

VISUAL / HID PROOF
- Laboratory states
- affected provider states
- wide/narrow/large-text/reduced-motion
- mouse/keyboard/controller
- artifact manifest and hashes

GOLDEN JOURNEYS
- each journey PASS / FAIL / NOT RUN with artifact link

MIGRATION HONESTY
- legacy initialization facts
- no fabricated history assertion
- unknown/alias fixtures

HOSTILE REVIEW
- reviewers
- findings
- corrections
- final dispositions

OWNER JOURNEY
- exact save/seed/build
- routes exercised
- Owner KEEP / REVISE / REJECT ruling

CHANGED PATHS
- TypeScript
- generated contract
- Unity
- tests/fixtures/docs

OPEN RESIDUALS
- bounded P13A residuals
- explicit P13B+ / P14 / P15 / P16+ deferrals

NEXT ACTION
- STOP pending Owner acceptance; no second technology automatically follows
```

---

## 25. POST-UPSTREAM OWNER-ACCEPTED REFRESH REQUIRED

Before any implementation, replace every “likely,” “candidate,” and current-base seam with exact
post-upstream accepted symbols. Reconcile final changed paths, save/schema/protocol/projection,
generated consumer, P05 production, P06 release/post, P09 Laboratory/facility/world body, P10
Scientist/employer, P11 ledger, P12 studio/rival, history, projection, input and proof seams.

If the exact accepted architecture makes any pseudo-shape or wave invalid, change this Annex rather
than forcing code to match it. Until the refresh, final charter and explicit Owner authorization,
this document remains **DECISION-READY RESEARCH CANDIDATE**, **DOCUMENTATION ONLY**, and
**NO PRODUCTION AUTHORIZATION**.
