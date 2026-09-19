# P2 owner-adapter preparation — READ-ONLY proposal, UNEXECUTED

Source89b5ad2cfc6947ea07fb043ef5b23eba38d7dbde, during its frozen B-F2 full
bridge run. Native sim-core read the reviewed B4 expansion and bounded actual
owners; parent records the handback here. No production/test/config/HEAD changes,
runtime, new fixture or source-writer release. This complements reviewed plan
SHA382252e23b6353acf602d87f38032ff961e9f7f9740bbfdf2b2ae368c30df4e4;
it is not an implemented solver or a claim of complete owner enumeration.

## Smallest proposed architecture

One pure lower-level promiseCapacityOwners adapter: collect immutable owner
facts/digest inputs; enumerate picture/staffing/start alternatives with explicit
domain completeness; run detached planning data through shared scheduling
primitives to derive separate person/resource intervals and actual 5→4 boundaries.
Planning emits no game receipts and allocates no real seat or employment winner.

Do not import actions, tick, queueAdmission or hollywoodTick into the adapter:
those higher-level owners lead back to promises or commit broader game effects.
Two candidate shared-owner extractions require implementation review:

- Read-only commission/greenlight staffing admission guards from actions into a
  lower-level helper consumed by both actual action and adapter.
- Narrow operations scheduling inputs to their actually read fields, preserving
  allocator/transition bodies. Never fabricate persisted Production fields,
  forecastSnapshot or participants merely to satisfy a planning type.

No second allocator and no full tick/action engine used as a forecasting shortcut.
Any extraction must preserve existing execution behavior and independent tests.

## Exact owner seams

| Concern | Current seam | Required adapter distinction |
|---|---|---|
| Picture identity | scriptDevelopment.ts564/629 linkScriptProjectToProduction/scriptProjectForProduction | inProduction project and production are one picture; queued casting/greenlight not another event |
| Managed ready gate | actions.ts321/334–366 applyGreenlight;2499 applyGreenlightScriptProjectNow | assessed Ready project; preserve writer, genre, shape and screenplay facts |
| Audition | castingSessions.ts408/432 completion/acknowledgement; actions.ts348 | existing session must finish and be acknowledged; optional audition not mandatory |
| Assignment | actions.ts307 requireRole;394–475;539–573 | has-discipline, distinct participants, engaged-mode craft lead, actual legal employer/freelancer and conflict checks; writer cannot double in own film |
| Person holds | productionPeople.ts4; employment.ts125–171; hollywood.ts73 industryBusyTalentIds | director/cast/craft through release; actual writing/industry/research occupations; permanent writer credit is not ongoing occupancy |
| Writing | scriptDevelopment.ts447/689; screenplay.ts373 scriptDraftWeeks | existing persisted due dates and all pooled writers; completion→Review releases slot, acceptance is a subsequent command |
| Phase calendar | productionPhases.ts; operations.ts1471/1560 | now-anchored skip-greenlight-week, sticky reservations, owner sweep order, setup/task gates and competing workflows |
| Allocation | operations.ts279/580; occupancy.ts337 resourceClaims | atomic stage+Set acquisition, retained slots, Set usability, installation/script/audition/set-work claims, not facility counts alone |
| Setup/technology | productionSetup.ts138/164; technologyProduction.ts54 | actual chosen progress/provenance and sound-chain restrictions; no dropped setup time or silently replaced chain |
| Release | releaseAuthority.ts64/101; operations.ts1239 | resource and person release differ; future lawful release command is a planning step, not historical completion |

## Two factual gates, not policy inventions

Current promises.stockGreenlightAvailable is an approximation: a bare stock
concept cannot pass applyGreenlight while screenplay development is managed.
Managed stock must use actions.ts2121 applyCommissionScript and real writing,
review and acceptance; original commissioning at2203 additionally needs its
contracted idle writer/shared development slot. Both use2069
requireCommissionableWriter. Uncommissioned stock is not an existing commissioned
picture. Removing the shortcut changes fresh P1 evaluations under rules4; retain
old roots/receipts/digests and record the change rather than disguise it.

Treat direct-stock legacy development separately. Fully legacy operations do not
emit first-take receipts (operations.ts1604); a countdown cannot certify evidence.

castingSessions.ts144 assertCastingSlateEligibility retains a primary-Actor
audition gate. It is NOT greenlight's has-discipline gate and cannot be reused as
a P2 assignment restriction. A lawful non-primary actor may use the direct package
route; existing unfinished auditions still require completion/acknowledgement.

## Actual weekly boundary

Player tick.ts ordering: script/audition completion250–275 at w+1; scenery
arrival282–309; production sweep335–372; queue admission375–415 using the arrived
week; construction/placement/Set completion443–489 AFTER the sweep. Later capacity
cannot serve the earlier sweep retroactively. Arriving scenery makes the player
task READY, not SCHEDULED. The player must issue scheduleShootingTake at the next
command boundary before its first completed take can occur.

Rival hollywoodTick.ts73 operateStage assigns→clears→schedules before its sweep.
Preserve that actual abstract policy; do not impose player geometry or reuse the
companion's historical three-week rival description as current execution law.

## Staffing, queue and completeness

Positive certificates need complementary legal crew, not just the promised actor.
Resolve admission-week eligibility without invented renewals, rival releases or
future market winners. A finished screenplay retains its writer credit without
requiring renewed employment solely for that credit. Rival inputs use actual
employment/development and the reviewed bounded promised-person generalization;
no silent expansion of ordinary director/craft/no-promise policy.

employment.ts383 freelancerMarketIds uses an isolated rotating hiring stream;
future availability is not guaranteed. No manufactured pool or additional matcher
RNG sampling. Casting observations/full greenlight forecasts also use derived
draws: scheduling needs admission/timing facts, not newly generated observations.
Queue ownership: productionQueue.ts219 queueInPriorityOrder and
queueAdmission.ts52 admitQueuedIntents. Share admission predicates/preserve queue
priority; never invoke committing queue actions or treat requests as reservations.

Domain incompleteness must be explicit for omitted lawful staffing/facility/start
alternatives, speculative employment, unmodeled queue admission/expiry, missing
scenery provenance, unknown release/research occupation, unmodeled future repair/
construction/installation, omitted chosen setup/technology constraints, invented
screenplay facts/market access, bypassed command boundary or computation cap.
Known alternatives can establish a lawful positive witness only when ALL required
witness conditions are proved; their absence cannot prove a maximum/exhaustive
failure. Never relabel current scalar helpers as a complete adapter.

UNCERTIFIED is a conservative result, not a way to close ordinary launch behavior
with every offer disabled. Actual ordinary/natural-chain coverage and runtime
measurement remain required before P2 closeout; missing owner modeling is real
remaining engineering work. The B4 plan's separate target-specific impossibility
rule still governs causal BROKEN outcomes.

Next: bounded independent source/architecture review, then actual implementation
only after B-F2 qualified publication and genuine outgoing T0 preservation.
