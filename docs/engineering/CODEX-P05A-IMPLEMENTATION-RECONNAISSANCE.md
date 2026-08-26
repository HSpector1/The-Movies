# Project: Studio — P05A Implementation Reconnaissance

Production / Shooting / Wrap integration<br>
Definitive provisional builder handoff

**Document:**

`CODEX-P05A-IMPLEMENTATION-RECONNAISSANCE.md`

**Revision:**

`P05A-RECON-r1-PROVISIONAL`

**State:**

`PRE-P04A-OWNER-ACCEPTED REFRESH`

**Implementation branch:**

`codex/p05a-implementation-recon-01`

This is the single canonical P05A implementation reconnaissance. It converts the completed deep
reconnaissance into a builder-ready provisional implementation contract. It authorizes no P05A
production-code work before the final P04A Owner-accepted refresh described in section 35. When that
refresh is complete, this same file advances to `P05A-RECON-r2-FINAL`; no competing recon document is
to be created.

## POST-DEEP-RECON HARDENING / CONTROLLING DELTA

This section is the controlling correction over preliminary seed assumptions. The reconciled body
below already incorporates these rulings; no contradictory preliminary guidance remains operative.

1. **Scenery has three connected defects.** Director dispatch fails to settle an already-due current
   load-in; normal tick settlement reads the pre-advance week and therefore lands one authoritative
   week late; and manual `Clear` fails open for malformed/withheld current derivations rather than
   allowing only the exact grandfathered case. “Grandfathered” means bindings are present and
   `requiresSetBinding === false`; absent bindings or absent/invalid provenance fail closed. One
   authoritative blocked-to-ready settlement helper, next-week tick evaluation, exact-grandfather
   selector/action/adapter gating, and corrected provenance classification are required. No persisted
   field is required.
2. **The Production projection already exists.** Projection v9 carries `productionOperations`; P05A
   must reuse and correct that pipeline. `managedWorkflowLocation` and the required singular
   `locationBuildingId` are unsafe because they can fabricate Writers/Casting, Post, or Theater as a
   current workplace after authority has released all relevant reservations.
3. **A Production does not always have one location.** P05 must separately project exact owned
   worksites, an honest primary work target where defined, related targets, explicit no-owned-site,
   withheld location, and exact revalidated Locate targets. Phase names never establish location.
4. **Accepted Unity is a singleton Stage A/Stage 7 proof.** It is not an N-Stage presentation
   architecture. Multiple Stage production controllers are treated as ambiguity; the Production
   tableau, effects, Stage-A ambient roles/marks, and single delivery route are globally wired around
   Stage A. General named-person facility routing already resolves unique Stage 12/other bodies and
   is a reusable exact-ID seam; the Stage Production presentation does not.
5. **Accepted Unity has a Wrap precedence defect.** Historical `wrap-clearing` can return before a
   valid new current `stage-hot` holder. Current resource ownership must always beat historical Wrap
   presentation.
6. **`progress01` is forbidden in P05 player UI.** It may remain as legacy/compatibility data while
   other clients depend on it. P05 presents phase, current state, authoritative weeks, and next
   milestone.
7. **N-Stage is a root architecture change, not “add Stage 12.”** The future Unity owner is an exact
   facility/building-keyed registry. Each Stage receives one complete exact authority bundle plus a
   separate Unity-local presentation profile/budget, and owns Stage-local effects, validated
   named-presence application, decoration, and logistics presentation. TypeScript composes
   holder-matched presence; Unity validates and applies it.
8. **Active Production cancel exists but is deferred.** Core accepts `{ kind: 'cancel',
   productionId }`; it is not a current Production intent/read-model surface. P05A must not expose it
   without explicit later product authorization.
9. **P04A integration remains provisional.** The final UI Toolkit host, input contexts, retained
   workspace/Back coordinator, memo-owner registry, Casting-to-Production handoff, projection/schema
   version, generated DTOs, and save version require a changed-path-only refresh after Owner
   acceptance.

## 1. Executive implementation recommendation

P05A is not a new Production domain. Existing TypeScript Core already owns the managed Production
lifecycle, phase authority, stable identity, reservations, Stage-and-Set allocation, sticky retention,
queue order, Shooting task, blockers, deterministic time, persistence, named presence, plant theater,
and permanent Wrap history.

The implementation spine is:

```text
existing authoritative Production law
  + narrow scenery settlement correction
  + existing queue/presence/theater projections
        -> corrected and closed existing Production projection
        -> existing bridge schema/generated DTO pipeline
        -> exact-ID N-Stage Unity world presentation
        -> final-P04 retained Production management workspace
```

Core work is limited to the three connected scenery defects and their legality/read-model agreement.
Everything else exposes and composes authority that already exists. Unity remains presentation-only:
it never allocates a Stage, binds a Set, advances a phase, resolves scenery, invents a holder, computes
finance/score, or infers a location from phase/title/position.

The implementation should prioritize the Owner's management-distance test before deep workspace
polish: with the workspace closed, a first-time player must be able to identify an idle Stage,
Rehearsal, load-in, a blocked company, Shooting, and Wrap/clearing—and every visible claim must be
traceable to TypeScript authority.

The provisional disposition is **READY FOR FABLE AFTER THE FINAL P04A OWNER-ACCEPTED REFRESH**.

## 2. Document revision, authority, and precedence

### 2.1 Exact inspected authority

| Authority | Exact revision | Use |
|---|---|---|
| Explicit P05A finalization/hardening Owner brief | Current controlling thread instruction; no repository SHA | P05A scope, output, cancel deferral, waves, acceptance, and governance |
| Package 05 design and Builder Annex | `d5653327c17709daea5e17ba00ce164678b9ad43` | Production product law and P05A acceptance intent |
| Package 04 design | `ddc4976cd7c947ba513917e6311a697ad4ea6934` | Casting/Greenlight product boundary; final implementation still requires Owner acceptance |
| Accepted TypeScript baseline | `0d9fc65765e5c55ed221688238293babfcaea93e` | Current authoritative Production/bridge behavior |
| Accepted Unity baseline | `062a881afe9d38352b86b260afbe18ee070a3deb` | Current presentation behavior and proof architecture |
| P04A implementation recon/freeze | `44b0c8d0440fd683910d1ecd5a6365eaa49d82fc` | Sealed P03 seams and forward P04 implementation intent |
| Accepted Unity Production Architecture Audit | `8110820d96ddf2089df582bc0a0a92d3d4cf17d9` | Unity production architecture ruling |

The Package 05 source blob retains an older header saying “Owner-review candidate; documentation
only” and “Production code authorized: none.” The Owner brief for this recon explicitly designates
that commit as Package 05 design authority. The discrepancy is recorded, not silently rewritten.
Within the commit, the main Package 05 report wins over its Builder Annex. The Annex inspected older
baselines—TypeScript `c902a70` and Unity `911e87e`—so its file pointers are archaeology leads, not
accepted-current-code proof.

### 2.2 Controlling precedence

Where sources disagree, use this order:

1. explicit rulings in the current P05A Owner brief;
2. Package 05 main design and then its Builder Annex at `d565332`;
3. final Owner-accepted P04A implementation, once available, for reusable UI/input/workspace seams
   only—it cannot override Package 05 product law;
4. accepted Unity Production Architecture Audit `8110820d`;
5. Owner-accepted P03A.3 TypeScript `0d9fc65` and Unity `062a881`;
6. P04A recon/freeze `44b0c8d`, as forward implementation intent only;
7. accepted-baseline code, which proves what exists but not what product law should be; dirty or
   later unaccepted code is non-authoritative refresh evidence only;
8. preliminary seed, now superseded wherever this document refutes it.

If authorities at the same level genuinely conflict, Fable must record and escalate the conflict;
it must not select the locally convenient interpretation.

This hierarchy governs product law and future implementation choices. It does not let a design
document rewrite historical facts about an accepted baseline: `VERIFIED CURRENT CODE` claims are
proved from the accepted TS/Unity SHAs. When design and current code differ, record “current defect”
or “missing implementation” and implement the higher product law; do not misclassify the current
behavior as absent.

### 2.3 Finding vocabulary

| Label | Meaning |
|---|---|
| `VERIFIED CURRENT CODE` | Proven at an accepted baseline SHA |
| `SUPPORTED DESIGN LAW` | Required by Package 05/Owner authority |
| `P04A FORWARD ASSUMPTION` | Expected seam, not accepted implementation yet |
| `INFERENCE` | Recommended implementation derived from authority, not itself product law |
| `REFUTED` | Preliminary claim contradicted by accepted code/design |
| `OPEN IMPLEMENTATION QUESTION` | Bounded choice still requiring exact post-P04 evidence or integrator decision |

### 2.4 P04A acceptance state at this revision

There is no Owner-accepted P04A implementation seal at this revision. The active TypeScript P04
worktree was observed at `84c47d4` with an uncommitted `ui/src/engine/adapter.ts` change. The active
Unity P04 worktree remains based on `062a881` with uncommitted generated DTO, bootstrap, selection,
camera, UI Toolkit, and workspace-test changes. Neither dirty worktree is P05 authority. Section 35
owns the only permitted reconciliation path.

## 3. Canonical terminology

No worker-specific synonyms are permitted. Wire/internal terms remain exact; TypeScript authors
player copy.

| Canonical term | Meaning | WIRE | INTERNAL | PLAYER COPY |
|---|---|---|---|---|
| **Production** | Authoritative picture/company | `productionId` | `Production`, `ProductionWorkflow.productionId` | Production or exact picture title |
| **Stage / Soundstage** | Physical capacity and workplace facility | exact `facilityId` and world `buildingId` | reservation capability `soundstage` | Soundstage 7, Soundstage 12, or projected label |
| **Set** | Persistent mounted creative environment/scenery identity | exact `setId` | `StudioSet.id`; `bindings.setId` | exact Set name/label |
| **Rehearsal** | Authoritative phase at remaining tick 6 | `"rehearsal"` | `phase: 'rehearsal'` | `REHEARSAL`; supporting copy may say `PREPARING` |
| **Shooting** | Authoritative phase at remaining ticks 5–4 | `"shooting"` | `phase: 'shooting'` | `SHOOTING` |
| **Load-in** | Shooting logistics/task state while scenery travels | blocker kind `"scenery-load-in"` plus structured transit | `SceneryLoadIn` | `LOAD-IN` / `SCENERY IN TRANSIT`; never a phase |
| **Waiting** | Authoritative inability to proceed | typed blocker/task/queue state | composed wait state | `WAITING` plus exact cause/consequence |
| **Wrap** | Shooting completion/resource-release/handoff | event kind `"wrapped"` | permanent `StudioEvent` | `WRAPPED`, `WRAP CLEARING`, or `WRAPPED · WAITING FOR POST` |
| **Current worksite** | Exact owned workplace claim(s), or explicit none/withheld | new closed worksite fields | live reservation-backed projection | exact label; `No current owned worksite`; or `Location unavailable` |
| **Locate** | Explicit navigation to exact current target | exact stable target ID | `StudioLocateAction.Locate` plus final-P04 routing | `LOCATE` / `LOCATE CURRENT WORK` |
| **Focus** | Explicit framing/inspection behavior | no new P05 wire action | `StudioSelectionManager.Select(..., true)` and camera director | `FOCUS` where existing owner supports it |
| **Watch Shoot** | Future explicit cinematic mode | absent | not implemented | not present in P05A |

Additional wire-to-player rules:

| Wire/internal state | Required player interpretation |
|---|---|
| `preProduction` | `PRE-PRODUCTION` |
| `postProduction` | `POST-PRODUCTION` or concise `POST` in handoff copy |
| `releaseReady` | `RELEASE READY` |
| `facility-capacity` | `WAITING FOR <CAPABILITY>` plus exact projected holders/remedies where available |
| `set-unavailable` | `NO STANDING SET AVAILABLE`; never “your Stage” before allocation |
| bridge intent `resolveProductionBlocker` | legacy wire umbrella for the exact current Production operation; never player copy |
| `shooting@4`, Post blocker, no reservations/task | `WRAPPED · WAITING FOR POST`; raw phase alone is insufficient |
| `unassigned` Shooting task | Exact Director has not been called to exact Stage |
| `ready` Shooting task | Stage is ready; take needs scheduling |
| `completed` Shooting task | Shooting work completed; next authoritative transition owns handoff |

## 4. Owner priority and UX North Star

The living North Star is:

> At a glance, the lot says which exact picture is where, its phase, whether its company is working
> or waiting, and what deserves attention. The selected place explains the current operation in five
> seconds; opening the picture explains the whole project. Neither surface invents a second
> simulation.

P03A.3-specific remediation is historical. The durable principles remain living: world first;
hierarchy before density; management-distance readability; disciplined persistent edge UI; retained
workspaces; explicit Locate; one-layer Back/context restoration; readable text; usable targets; and
no camera hijack. P05 must not copy legacy IMGUI mechanics into the retained Production workspace.

### 4.1 Numeric governance

| Numeric statement | Classification | P05 treatment |
|---|---|---|
| Body copy at least 16 px equivalent | `BINDING MINIMUM` | Hostile acceptance failure below it |
| Supporting labels at least 14 px | `BINDING MINIMUM` | Stage inspector/workspace minimum |
| Primary targets at least 44×44 px | `BINDING MINIMUM` | Applies to retained P05 primary controls |
| Workspace controls 44 px high | `DEFAULT TARGET` for wide workspace | Revalidate final P04 tokens; primary controls still obey the 44×44 minimum |
| Readable at 200% text | `BINDING CAPABILITY` | Location, blocker cause/consequence/action must remain reachable |
| Reduced-motion Focus at most 100 ms | `BINDING MAXIMUM` inherited through Package 05 from Package 02 | Static meaning remains; no autoplay |
| Stage inspector 360–420 logical px | `DEFAULT TARGET` desktop range | Not a universal narrow-width law |
| Typical 16:9 lot 35–45%, workspace 55–65% | `DEFAULT TARGET` wide context | Preserve mounted lot; do not apply to narrow sheet |
| Title 28–32; phase/state 18–22; body 16–18; metadata 14–16 px | `DEFAULT TARGET` wide typography ranges | The 16/14 minima above remain binding |
| Narrow sheet 72–92% height | `DEFAULT TARGET` narrow range | One column, sticky current action, contained body scroll |
| Wide ≥1200, narrow ≤840 | `P04A FORWARD ASSUMPTION` | Revalidate against final accepted P04 responsive bands |
| At most one polite announcement per stable event sequence | `BINDING MAXIMUM` | Polling/reconnect must not repeat it |
| One layer per Back/Escape | `BINDING EXACT BEHAVIOR` | Retained UI consumes first, then accepted world fallback |
| Six-segment phase rail | `BINDING SEMANTIC CONSTANT` | Never replace with generic percentage |
| Two Productions/two Stages | `BINDING MINIMUM` hostile fixture | Includes same-title isolation |
| Existing ten theater beats | `HISTORICAL ONLY` for P05 playback | Projection may be consumed statically; playback is follow-up |
| Legacy 1720×1045, scale cap 2.6, 190×50 Back | `HISTORICAL ONLY` for retained P05 UI | Preserve surviving IMGUI only; never import into UI Toolkit |
| Existing 0.7-second arm | `HISTORICAL ONLY` unless final P04 applies it | Not automatically imposed on simple P05 operations |
| Fixed 3 door crew, 6 support crew, 14 onlookers | `HISTORICAL ONLY` | Replace with configurable decorative budget including zero |
| Navigation trail capacity 8 | `HISTORICAL ONLY` player-facing; accepted implementation regression | Preserve the existing camera trail; not a P05 UX capacity target |

### 4.2 Management-distance proof instrument

Existing Stage visual proofs, camera management framing, and screen-space evidence infrastructure are
the starting measurable floor; they do not yet prove the Package 05 six-state contract or N-Stage
identity. Wave 5 must add one objective proof runner using the final accepted camera/viewports. It
must capture each authoritative state with the Production workspace and memo closed and record:

- exact snapshot revision, week, Stage facility/building ID, Production ID, Set ID, and projected
  Stage state;
- accepted management camera pose and viewport metadata;
- activated semantic Stage roots/lights/placard state and exact player copy;
- screenshot/evidence artifact for Idle, Rehearsal, load-in, waiting, Shooting, and Wrap;
- proof that every pair has a different semantic state and that Shooting differs from idle without
  requiring observed character motion;
- text/target floors where UI is present and 200% text evidence for the retained inspector.

Likely new owner: `StudioProductionManagementDistanceProofRunner` plus focused EditMode assertions.
The exact path follows the final P04 proof layout. No contrast, pixel-count, distance, or animation
threshold may be invented during implementation; if final P04 supplies a measurement law, reuse it,
otherwise preserve evidence for hostile visual judgment.

| Subjective goal | Existing measurable floor | Minimum additional P05 instrument |
|---|---|---|
| Six states are distinguishable at management distance | exact semantic state/root/light/placard booleans; accepted management camera pose | six-state screenshot/evidence run with captured IDs and hostile visual verdict |
| Shooting is unmistakably discontinuous from idle | accepted Stage dark/hot roots and Stage visual proof vocabulary | paired same-camera idle/Shooting evidence; no motion-watching requirement |
| Rehearsal reads as working, not blocked | no accepted floor—current resolver is wrong | explicit state/root/copy assertion plus screenshot |
| Text remains readable | 16 px body, 14 px support, 200% text | final-P04 UI Toolkit geometry/accessibility assertions and captures |
| Primary actions remain usable | 44×44 minimum | retained workspace resolved-style bounds tests at supported viewports |
| Navigation does not hijack camera | accepted Locate/origin/one-layer Back tests | authority-refresh/phase/Wrap/stale-Locate no-motion assertions |
| Ambient life remains non-authoritative | decorative identity stripping exists | budget high/medium/low/zero equivalence and zero screenshots |
| Responsive hierarchy remains coherent | P04 forward bands only at r1 | final-P04 wide/intermediate/narrow functional and screenshot matrix |

## 5. Current authoritative lifecycle

`src/core/productionPhases.ts` is the shared current phase/capability authority.

| Remaining ticks | Wire phase | Player phase | Required live claims |
|---:|---|---|---|
| 8 | `development` | Development | `development-casting` |
| 7 | `preProduction` | Pre-production | `development-casting` |
| 6 | `rehearsal` | Rehearsal | `soundstage` plus atomic standing-Set binding for native/current-binding workflows |
| 5 | `shooting` | Shooting, first work week | retained Stage and native Set binding, plus `set-scenery` |
| 4 | `shooting` | Shooting, completed-take/second week | retained Stage/native Set/scenery until transition attempt |
| 3–2 | `postProduction` | Post-production | `post` |
| 1 | `releaseReady` | Release Ready | none |
| 0 | downstream release | Outside P05A | existing release pipeline |

Load-in, Director dispatch, take scheduling, waiting, Wrap, and clearing are operational/task/
presentation states. They are not new persisted phases.

The phase table states current native allocation law. A migrated grandfathered workflow with
present bindings and `requiresSetBinding:false` may legally hold its live Stage with `setId:null` in
Rehearsal or Shooting. That compatibility exception does not weaken the native atomic allocator and
must not be reclassified as malformed merely because it lacks a Set.

### 5.1 Transition governance

- Routine Development, Pre-production, Rehearsal, second Shooting week, Post, Release Ready, company
  travel, and due scenery settlement remain autonomous.
- `assignShootingDirector` and `scheduleShootingTake` remain current P05A player operations.
- A blocked transition holds its own countdown while other studio systems and time continue under
  current Living Time law.
- Raw phase does not prove workplace. A released prior-phase reservation may leave a workflow in its
  previous raw phase while it waits for the next resource.
- P05 interaction stops at Wrap/Post handoff. Core lifecycle continuing into Post/Release does not
  grant P05 a Post workspace or controls.

## 6. Production, Stage, and Set identity

The identity law is absolute:

```text
Production != Stage != Set
```

| Identity | Authority | Required joins |
|---|---|---|
| Production | `Production.id` | Workflow, events, queue, commands, workspace rows |
| Workflow | `ProductionWorkflow.productionId` | Exact Production only |
| Stage | Soundstage `facilityId` plus exact world `buildingId` when resolvable | Reservation, Stage registry, Locate |
| Set | `StudioSet.id` | Workflow binding, mounted Stage, scenery source, Set workspace |
| Reservation | `productionId`, `facilityId`, capability, slot, phase | Sole live resource-claim authority |
| Binding | `stageFacilityId`, `setId`, locks, `heldSinceWeek` | Mirrors live reservation; retains historical Set metadata after release |

DTOs and Unity truth bundles must carry all identities independently. Titles are display copy, never
join keys. A Stage registry may aggregate them for presentation but may not mint a synthetic identity
that replaces any one of them.

## 7. Stage and Set acquisition, retention, and release

### 7.1 Acquisition

`src/core/operations.ts::allocateForPhase` acquires Stage and standing Set as an atomic composite on
entry into Rehearsal for native/current-binding workflows:

1. walk candidate Soundstages in deterministic authority order;
2. require the Stage slot to be free;
3. require a bindable standing Set mounted on that Stage;
4. reserve the exact Stage and bind the exact Set in one returned state;
5. if no Stage is free, publish soundstage `facility-capacity`;
6. if a Stage is free but no legal Set can bind, publish `set-unavailable` without granting that
   candidate Stage.

No newly allocated native/current-binding workflow legally holds Stage A while independently waiting
to bind a Set on Stage B. Migrated grandfathered workflows are a deliberate compatibility exception:
with present bindings and `requiresSetBinding:false`, a live Rehearsal/Shooting Stage reservation may
coexist with `setId:null`; the projection preserves that exact Stage and null Set.

### 7.2 Sticky retention

- Development to Pre-production retains Development/Casting.
- Pre-production to Rehearsal releases Development/Casting and attempts the atomic Stage/Set claim.
- Rehearsal to Shooting retains the exact Stage and native Set/locks where applicable, then acquires
  scenery. A grandfathered workflow retains its Stage with null Set rather than fabricating one.
- Shooting to Post retains nothing.
- Post to Release Ready retains nothing.

### 7.3 Wrap release and historical binding qualification

At Shooting completion, `releaseCompletedPhase` removes Stage, scenery, and task before attempting
Post and re-derives `bindings.stageFacilityId` from the now-empty reservation set. `bindings.setId`,
`lockedNovelty`, and `lockedUplift` deliberately survive as film history. A non-null historical
`setId` without a live soundstage reservation is not current Set ownership, not current Stage
location, and not permission to paint a company on the Stage.

## 8. Shooting task lifecycle

| Step | Exact current symbol | Authoritative result | P05 treatment |
|---|---|---|---|
| Enter Shooting | `operations.ts::enterPhase` | mint `shooting:<productionId>`, status `unassigned` | publish Director-dispatch operation |
| Call Director | `operations.ts::assignShootingDirector`; `actions.ts::applyAssignShootingDirector` | exact locked Director only; status `blocked`; scenery blocker | operation remains player-authorized |
| Settle scenery | `operations.ts::clearSceneryLoadIn` / `arriveDueScenery` | status `ready`; clear blocker; append `sceneryArrived` | one shared settlement transition after correction |
| Schedule take | `operations.ts::scheduleShootingTake` | status `scheduled` | operation remains player-authorized |
| Perform first Shooting week | `advanceManagedProductions` | remaining 5→4; task `completed` | autonomous tick |
| Wrap / attempt Post | `enterPhase` | release, Wrap event, Post grant or wait | autonomous handoff; no P05 Post controls |

The two one-option Shooting approvals may be future automation candidates. P05A must not remove or
embellish them; Package 05 defers that product decision.

## 9. Scenery defects and required root correction

### 9.1 Verified derived authority

`src/core/sceneryLoadIn.ts::sceneryLoadInFor` purely derives:

- exact supplying scenery `facilityId`;
- exact destination Stage `facilityId`;
- Manhattan grid distance between engine-owned facility bodies;
- bounded total weeks;
- `calledWeek` from Stage binding `heldSinceWeek`;
- elapsed and remaining weeks;
- arrived state.

There is no path, road, inventory, traffic, or vehicle authority. Unity route motion is cosmetic.

### 9.2 Three connected defects

| Defect | Exact current cause | Incorrect outcome |
|---|---|---|
| Due at Director call | `applyAssignShootingDirector` commits `assignShootingDirector` but never derives/settles against the resulting blocked workflow | Current load-in may be `arrived=true` while the task remains blocked and Clear is offered |
| Natural arrival one week late | `tick` line 255 calls `sceneryLoadInFor(state, workflow, currentTick)` before returning `market.tick = currentTick + 1` | A trip at one week remaining returns visibly due but blocked; settlement waits another tick |
| Clear gating fails open | `nextProductionOperationsDecision` offers Clear for every scenery blocker; `managedProductionBoardCard` independently emits Clear for every scenery blocker and `productionDecision` selects it; `applyClearSceneryLoadIn` rejects only derived, not-yet-arrived values | Current arrived or malformed/withheld cases can be manually cleared; only explicit persisted grandfather provenance was intended |

### 9.3 Required smallest root correction

The correction is one authority transition plus one exact provenance classification shared by every
legality/read-model producer, not three independent fixes.

1. Correct `sceneryLoadInFor` provenance classification before gating any action:

   - present bindings with `requiresSetBinding === false`: return exactly `'grandfathered'`;
   - absent bindings: return a distinct fail-closed withholding result such as `'no-bindings'`;
   - absent/non-boolean binding provenance: return a distinct fail-closed result such as
     `'invalid-set-binding-provenance'`;
   - present bindings with `requiresSetBinding === true`: derive the current structured load-in or
     another existing exact withholding reason.

   Final enum spelling may follow existing TypeScript conventions, but only the explicit boolean
   `false` arm is legally grandfathered. A catch-all `requiresSetBinding !== true` test is forbidden.

2. Extract or tighten one operations helper that performs exactly:

   - validate blocked Shooting task and matching scenery blocker;
   - transition `blocked -> ready`;
   - clear that blocker;
   - append exactly one `sceneryArrived` event.

3. In `applyAssignShootingDirector`, build the authoritative intermediate state containing the newly
   assigned/blocked workflow, then call `sceneryLoadInFor` at `state.market.tick`:

   - derived and `arrived=true`: settle in the same action transaction and commit one event;
   - derived and travelling: remain blocked; publish transit; publish no Clear;
   - explicit-`false` result exactly `'grandfathered'`: remain blocked; manual Clear remains current;
   - any other withholding string: remain blocked and fail closed; publish no Clear.

4. In `tick`, derive due load-ins at `currentTick + 1`, the authoritative week the tick returns. Settle
   before Production advancement. A ready task still needs `scheduleShootingTake`, so this cannot
   accidentally advance Shooting.
5. In `nextProductionOperationsDecision`, emit `clearSceneryLoadIn` only when the corrected result is
   exactly `'grandfathered'`. Current transit returns no Production decision (`null`); the separate
   first-film journey may truthfully select `advance-week` as its next guidance step.
6. Correct the independent browser/projection producer in
   `ui/src/engine/adapter.ts::{managedProductionBoardCard,productionDecision,studioLotSnapshot}` so
   `currentCommand` and any selected browser operation obey the same explicit-grandfather gate. A
   Core selector fix alone is insufficient because this adapter currently manufactures Clear from
   the blocker directly.
7. In `applyClearSceneryLoadIn`, permit the operation only when the corrected derivation is exactly
   `'grandfathered'`. Reject every derived current load-in—including already arrived—and every other
   withholding reason.
8. Keep the settlement idempotent by requiring the active blocker/task state. A later tick or stale
   command cannot append a duplicate event.
9. Preserve the accepted event chronology. Immediate due-at-call and grandfather acknowledgment use
   the action sink at `state.market.tick`. Automatic arrival derives settlement against the next
   authoritative boundary and returns `market.tick === currentTick + 1`, but its existing tick sink
   stamps `sceneryArrived.week === currentTick`, the week being advanced. The shared helper appends
   the event; each caller's existing transaction/sink owns the timestamp. Changing tick-event rows to
   `currentTick + 1` is forbidden without a separately authorized event-model migration and consumer
   updates.

An imported/reconnected exact current workflow can already be blocked while its structured
derivation says `arrived=true`. That is neither transit nor grandfathered. The closed projection
publishes an internal `scenerySettlementPending` state with player copy such as `SCENERY ARRIVED ·
PREPARING CAMERA`, no Clear, and no guessed progress. The next authoritative tick invokes the same
helper and settles it once. Merely reading/importing the save does not mutate authority.

### 9.4 Exact likely touch points

| File | Exact symbol | Required disposition |
|---|---|---|
| `src/core/sceneryLoadIn.ts` | `sceneryLoadInFor`, `isSceneryLoadIn`, withholding union | CORRECT provenance arms; retain pure geometry/duration derivation; no persistence/path logic |
| `src/core/operations.ts` | `clearSceneryLoadIn`, `arriveDueScenery`; optional extracted settlement helper | EXTEND narrowly; one blocked-to-ready/event implementation |
| `src/core/actions.ts` | `applyAssignShootingDirector`, `applyClearSceneryLoadIn` | EXTEND due-at-call transaction; exact-grandfather fail-closed gate |
| `src/core/tick.ts` | `tick`, scenery arrival step | CORRECT evaluation to `currentTick + 1` |
| `src/core/scriptReadModel.ts` | `nextProductionOperationsDecision` | CORRECT selector; no Clear except exact grandfather |
| `src/core/firstFilmJourney.ts` | load-in/command guidance | CORRECT waiting/arrival/legacy copy; no Post misroute |
| `ui/src/engine/adapter.ts` | `managedProductionBoardCard`, `productionDecision`, `studioLotSnapshot` command copy | CORRECT independent Clear producer in Wave 1; keep browser/bridge legality aligned with Core |
| `src/core/studioWeekTheater.ts` | scenery subject composition | REVERIFY blocked/arrived agreement after root fix; do not special-case defect |

### 9.5 Required exact tests

Extend the existing tests rather than constructing a parallel scenery suite:

| Test owner | Required case |
|---|---|
| `tests/c2a-m5-scenery-load-in-layout.test.ts` | Due-at-call returns ready in the same action and emits exactly one event |
| same | A state with exactly one week remaining becomes ready in the immediately returned next week |
| same | Current travelling load-in has no Clear decision and rejects a forged Clear |
| same | Current already-arrived loaded/reconnected blocker projects settlement-pending, has no Clear, and settles exactly once on the next authoritative tick |
| same | Present bindings with explicit `requiresSetBinding:false` remain manual and never auto-settle |
| same | Missing bindings, missing/invalid `requiresSetBinding`, Stage body, scenery body, reservation, or `heldSinceWeek` withhold and reject Clear |
| same | Due-at-call event stamps current action week; automatic arrival returns next-week state but preserves tick-sink `event.week === prior currentTick` |
| same | Reload/repeated tick/action cannot duplicate `sceneryArrived` |
| `tests/studio-decision.test.ts` | Current transit returns `null`; only explicit-false grandfather selects Clear |
| `tests/first-film-journey.test.ts` | Current transit selects `next.kind === 'advance-week'`; correct Rehearsal/load-in/arrival guidance and exact Locate owner |
| adapter/browser/lot snapshot tests | No Clear/current command for transit, arrived-current, missing bindings, or malformed provenance; Clear only for explicit-false grandfather |
| `tests/contracts/phase-table-agreement.contract.test.ts` | Phase walk no longer depends on manual Clear for current managed Productions |
| `tests/v14-migration.contract.test.ts` and `tests/c2a-m2-sets-save.test.ts` | Grandfather line remains `requiresSetBinding:false` |
| `tests/contracts/determinism-floor.contract.test.ts` | Manual/automatic/reload behavior remains deterministic |

The accepted `pictureAtLoadIn`-style fixture currently assigns the Director on the founding layout
and expects a blocker. After due-at-call correction that layout may be ready immediately. Split the
fixture at `unassigned`; for genuine transit tests, relocate/configure the Stage before Director
assignment so the resulting authoritative intermediate state derives remaining travel. Update the
accepted `tests/bridge.test.ts` expectation near line 291 that currently counts three-or-more
Production intents and `tests/studio-decision.test.ts` near lines 249–264 that currently asserts an
assign→Clear→schedule sequence; do not preserve assertions that encode the defects. Add projection
fixtures for migrated Rehearsal and Shooting workflows whose live Stage is valid while the explicit
grandfather has `setId:null`.

No P05-specific save field or migration is permitted for this correction.

## 10. Current Production projection and semantic defects

### 10.1 Existing path to reuse

Accepted projection v9 already has a Production pipeline. P05A extends this path; it must not create
a second Core-to-Unity projection or a parallel store.

```text
GameState
  -> ui/src/engine/adapter.ts
       productionBoard / managedProductionBoardCard       browser behavior oracle
       studioLotSnapshot / managedWorkflowLocation        bridge projection producer
  -> bridge/session.ts::BridgeSession.snapshotFor
  -> projectStudioProjectionBundle
  -> bridge/schema/bridge-schema.ts
       StudioProductionOperationsSnapshot
       StudioProductionsProjectionSchema
  -> bridge/schema/project-studio-bridge.schema.json
  -> generated/unity/StudioBridgeDtos.Generated.cs
  -> Unity generated StudioBridgeDtos.Generated.cs
  -> StudioBridgeProtocol / StudioProjectionStore
  -> StudioBridgePresentation and retained workspace consumers
```

Exact existing owners:

| Layer | Current file/symbol | P05 instruction |
|---|---|---|
| Browser view oracle | `ui/src/engine/adapter.ts::productionBoard`, `managedProductionBoardCard`; `ui/src/components/ProductionBoard.tsx` | Reuse current behavior/facts; do not copy React composition into Unity |
| Lot projection producer | `ui/src/engine/adapter.ts::studioLotSnapshot` | Extend existing output; compose one closed P05 semantic view |
| Unsafe location selector | `ui/src/engine/adapter.ts::managedWorkflowLocation` | Replace its P05 semantics; preserve compatibility only where still required |
| Type boundary | `ui/src/lot/snapshot/StudioLotSnapshot.ts::ProductionOperationsState`, `StudioLotOperationsProjection` | Extend existing type family; no parallel snapshot root |
| Bridge assembly | `bridge/session.ts::BridgeSession.snapshotFor` | Reuse assembly and revision/digest law |
| Bridge schema | `bridge/schema/bridge-schema.ts::StudioProductionOperationsSnapshot`, `StudioProductionsProjectionSchema` | Extend closed schema and bump projection through final P04 conventions |
| Generated artifacts | schema JSON and generated TypeScript/C# DTOs | Generator only; no handwritten C# DTO edits |
| Unity store/protocol | `StudioSnapshotStateCache.cs::StudioProjectionStore`; `StudioBridgeProtocol.cs` | Reuse exact-ID cache, duplicate validation, reset/removal laws |
| Unity application | `StudioBridgePresentation.cs` | Fable-owned collision seam; consume closed data, do not infer law |
| Browser queue/Set oracles | `StudioQueuePanel.tsx`, `SetStagePanel.tsx`, `SceneryShopPanel.tsx` and adapter selectors | Reuse routes/behavior; P05 composes rather than clones them |
| Existing guidance | `LotPictureGuidanceCard.tsx`, `firstFilmJourney.ts` | Retain fallback role only; correct stale scenery/Rehearsal copy |

`ui/src/lot/snapshot/stage7Production.ts::stageProductionDetailContext` is already parameterized by
Stage identity and supplies a useful fail-closed selector pattern. It is not the future N-Stage
contract: it still validates the unsafe singular `locationBuildingId` and exposes `progress01`.
Reuse its exact-ID/withholding pattern while replacing those semantics. Never use
`anyStageProductionDetailContext`, whose accepted purpose is to choose one Stage detail or withhold
when several exist, as the all-Stage projection owner.

### 10.2 Refuted current location semantics

`managedWorkflowLocation` returns one required `locationBuildingId`. That model is unacceptable for
P05:

- Development/Pre-production may fall back to `writers`/`casting` after the live reservation has
  already released while the transition waits.
- A wrapped Production with a Post capacity blocker is mapped to `post` despite owning no site.
- Release Ready maps to `theater` despite holding no facility.
- Shooting legitimately spans a Stage and Scenery facility, with named presence split across them.
- The field conflates current ownership, desired destination, presentation body, and navigation
  target.

The accepted bridge protocol currently requires `locationBuildingId` to resolve to a property body,
so it cannot express explicit no-site truth. This is a schema defect for P05, not permission to insert
a plausible body.

### 10.3 Other current projection gaps

Current `productionOperations` lacks:

- exact reservation-backed worksites and an explicit none/withheld arm;
- exact Production-to-Stage-facility-to-bound-Set live tuple;
- distinction between historical `bindings.setId` and live Set claim;
- complete scenery source, destination, total/called/elapsed/remaining/arrived facts;
- queue waiter/holder/also-missing/remedy and projected release facts;
- structured Wrap receipt and Post handoff state;
- typed exact Locate targets;
- closed Stage-local operation rows for every Stage;
- withholding reasons needed for safe presentation;
- complete all-active operation intents independent of the first-film guidance route.

At the accepted baseline, `bridge/session.ts::resolveAvailableIntents` publishes
`resolveProductionBlocker` only when `firstFilmJourney.next` selects one journey Production. That is
not an all-active command surface. P05 must generalize this existing intent resolver—without adding a
route or registry—to mint at most one exact current Production-operation intent per active
`productionId`, in ascending ID order, and de-duplicate the first-film projection against the same
underlying intent. At presentation/activation, the row joins exactly one current
`resolveProductionBlocker` option by `productionId` and submits its published `intentId`; Unity never
rebuilds the command from `currentCommand` fields.

### 10.4 `progress01` compatibility ruling

`progress01` is existing legacy/compatibility data. It is **DO NOT CONSUME IN P05 PLAYER UI**.
P05 uses:

```text
phase + current operational state + authoritative weeks + next milestone
```

Do not delete the legacy field merely to clean the P05 schema if accepted consumers still require
it. Mark it compatibility-only in the final DTO/API documentation, stop binding P05 Stage activity
or workspace progress to it, and remove it later only through an explicit protocol migration.

## 11. Required closed P05 Production projection

The implementation extends `ProductionOperationsState` and its generated
`StudioProductionOperationsSnapshot` counterpart. Names may be mechanically adjusted only if final
P04 generator conventions require it; the semantics and ownership below are fixed.

### 11.1 Required Production row

Each all-active row, ordered ascending by exact `productionId`, must carry:

| Field group | Required facts | Authority |
|---|---|---|
| Identity | `productionId`, title, concept ID where already exposed | Production/concept join |
| Lifecycle | raw phase, phase label, closed operational state, state label | phase table + workflow/task/blocker |
| Time | authoritative current week, weeks remaining appropriate to current state, next milestone label | Core/calendar/read model |
| Worksites | resolution status, exact live worksites, optional primary, related targets | reservations/bindings/scenery |
| Stage tuple | current Stage facility/world ID and nullable current Set ID while live | reservation + binding consistency, including explicit grandfather compatibility |
| Company | exact named member IDs/roles and references into presence | Production + `studioPresence` |
| Blocker | typed composed blocker, cause/effect/consequence/remedies/projected timing | workflow/task/scenery/queue |
| Operation | exact current semantic command or null; exact opaque intent remains in bridge `availableIntents` | current decision selector + existing bridge intent registry |
| Attention | semantic attention state and TS-authored copy | closed read model |
| Locate | exact currently valid targets; no approximation | worksite/holder/scenery/presence projection |
| Wrap | optional current-week/permanent receipt, separate from current Stage state | permanent event ledger |

### 11.2 Closed operational-state vocabulary

Use one TypeScript-authored closed state. The final wire spelling follows schema conventions, with
these required meanings:

| Semantic state | Exact condition summary | Player label |
|---|---|---|
| Development working | Development with exact live reservation, no transition blocker | `DEVELOPMENT` |
| Pre-production working | Pre-production with exact live reservation, no transition blocker | `PRE-PRODUCTION` |
| Rehearsal working | Rehearsal with live Stage and native live Set or explicit-grandfather null Set | `REHEARSAL` |
| Director required | Shooting task `unassigned` | exact `CALL <DIRECTOR>` operation copy |
| Scenery in transit | current derived load-in, remaining >0 | `LOAD-IN` / exact weeks |
| Scenery settlement pending | current exact blocked load-in already derives `arrived=true` after load/reconnect | `SCENERY ARRIVED · PREPARING CAMERA`; no Clear |
| Legacy load-in acknowledgement | present bindings with explicit `requiresSetBinding:false` | `LEGACY LOAD-IN NEEDS ACKNOWLEDGMENT` |
| Take scheduling required | Shooting task `ready` | `READY · SCHEDULE TAKE` |
| Shooting working | scheduled/completed Shooting as allowed by current week | `SHOOTING` |
| Resource wait | capacity or Set blocker before target phase | `WAITING` plus target/cause |
| Wrapped waiting for Post | raw Shooting@4, Post blocker, no reservations/task, Wrap event/history | `WRAPPED · WAITING FOR POST` |
| Post handoff | live Post reservation/phase | `POST-PRODUCTION`; P05 read-only handoff |
| Release Ready | no live workplace | `RELEASE READY` |
| Withheld | contradictory/malformed authority prevents safe composition | `STATUS UNAVAILABLE` with no invented action/location |

Do not derive this vocabulary in C# from raw phase/task strings.

### 11.3 Required Stage-local view

Extend the existing productions projection with a Stage-local collection keyed by exact Stage
facility ID. Each row carries:

- Stage `facilityId`, exact world `buildingId` or withheld body status, and facility label;
- exact current holder `productionId` or null;
- exact live bound `setId` or null;
- closed Stage presentation state;
- current Production title/phase/state copy when a holder exists;
- theater subject references used to form the state;
- exact current named-presence references already filtered to the current holder, retaining owner IDs
  for Unity validation;
- structured logistics cue when current;
- optional historical Wrap receipt that cannot replace current holder state;
- optional semantic presentation-profile hint only when authority can derive one—not a Unity asset
  name, GUID, material, or prefab path; null requires Unity's neutral fallback.

The TypeScript projection owns precedence and meaning. Unity owns asset/profile resolution and
graceful visual fallback.

### 11.4 Projection invariants

- One Production row per active `productionId`; duplicate IDs withhold/reject projection.
- One live Stage holder per Stage reservation slot.
- One `productionId` may be current holder in at most one Stage row. Duplicate cross-Stage holder
  truth withholds every implicated Stage row while preserving unrelated Stages/Production facts.
- One live `setId` may appear in at most one Stage row. A cross-Stage duplicate live Set withholds the
  implicated Stage rows; a historical Set reference outside live ownership does not enter this check.
- One named `talentId` may appear in at most one current Stage-presence placement. Duplicate
  cross-Stage placement withholds that person's conflicting placements, not otherwise valid Stage
  state. This mirrors `studioPresence`'s one-person/one-site fail-closed law.
- A native/current-binding Stage/Set tuple exists only when a live soundstage reservation agrees
  with binding and mounted Set truth.
- A migrated grandfathered workflow with present bindings and `requiresSetBinding:false` may expose
  its exact live Stage with `currentSetId:null`; absence of a Set alone is not withholding for that
  explicit compatibility arm.
- Historical `bindings.setId` alone never populates `currentSetId`.
- A title never joins two objects.
- A Production may expose multiple exact worksites but at most one policy-defined primary target.
- A world target is present only when exactly one current body resolves.
- A current holder always determines current Stage state before Wrap history is considered.
- All player-law copy is TypeScript-owned; Unity lays it out but does not interpret enums into rules.

## 12. Current-worksite and Locate model

### 12.1 Worksite model

The existing singular `locationBuildingId` must not remain P05 authority. Extend the existing DTO
with these semantic parts:

```text
currentWorksiteResolution: exact | none | withheld
ownedWorksites[]
primaryWorkTarget: exact target | null
relatedTargets[]
locateTargets[]
```

Each exact worksite/target preserves:

- relationship kind;
- authoritative resource kind and stable resource ID;
- exact facility capability where applicable;
- projected label;
- exact world target ID if uniquely resolvable;
- locatability status and safe withheld reason.

Required relationship vocabulary includes current worksite, primary work, bound Set, scenery source,
scenery destination, next destination, blocker holder, and named person.

### 12.2 Primary-target policy

| Current truth | Owned worksites | Primary target | Related targets |
|---|---|---|---|
| Development/Pre-production with live reservation | exact Development/Casting facility | that exact worksite when body resolves | exact named company sites |
| Rehearsal | exact Soundstage | exact Stage | live bound Set when native; none for explicit grandfather |
| Shooting before Wrap | exact Soundstage plus Scenery reservation | exact Stage | live Set when native, scenery source/destination, exact named-person sites |
| Post | exact Post facility | exact Post workplace | none required by P05 |
| Release Ready | none | null | next package owner only if authority publishes it |
| Any transition wait after prior release | none | null | desired capability/holder/remedy targets, never presented as owned |
| Contradictory reservation/binding identity | withheld | null | only independently safe targets |
| Exact facility but missing/ambiguous world body | exact resource claim, world location withheld | null | resource label may remain; no substitute body |

### 12.3 Locate law

- Selecting a Production row changes information only.
- `LOCATE CURRENT WORK` appears only when the fresh projection has an exact primary target.
- Source/destination/person/holder targets are separately named; none is silently substituted for
  current work.
- At activation, resolve the row again by `productionId` against the newest atomic snapshot and
  verify the same stable target is still current. If stale, omit/disable and retain camera/context.
- Capacity blockers may Locate exact holders/resources published by queue view. They may not choose
  the first, nearest, or visually obvious Stage.
- A candidate Stage mentioned by `set-unavailable` is not owned and is not current-work Locate.
- Missing/ambiguous body, unknown stable ID, or changed ownership yields no camera movement and safe
  unavailable copy.

Forbidden fallbacks include former Stage, Stage 7, first array element, nearest Transform, title
match, arbitrary holder, Post building for a Post wait, and Theater for Release Ready.

## 13. Queue, blockers, and remedies

`src/core/studioQueueView.ts::studioQueueView` remains the join owner for capacity and Set waits. It
already answers:

1. what is waiting;
2. what it needs;
3. who occupies it;
4. how to relieve it.

It publishes waiter identity, target phase, wait duration, need, also-missing requirements, exact
holders/resources, remedies, and `freesInWeeks`. P05 composes these facts into the Production row;
Unity does not rescan occupancy.

### 13.1 Source-of-truth matrix

| P05 blocker/operation state | Exact source | Queue view role | Allowed operation/remedy |
|---|---|---|---|
| Facility capacity | persisted Production blocker + `studioQueueView` | holders, also-missing, build/wait remedies, projected releases | open/navigate to exact canonical owner context; direct submit only if that owner publishes an accepted intent |
| Set unavailable | persisted blocker + queue Set facts | usable/candidate Sets and repair/strike/build/wait remedies | open/navigate to exact Set/Queue owner context; direct submit only if published there |
| Scenery transit | Shooting task/blocker + `sceneryLoadInFor` | none | time/Locate; no Clear for current load-in |
| Director dispatch | task `unassigned` + locked Director/Stage | none | exact assign-Director intent |
| Take scheduling | task `ready` | none | exact schedule-take intent |
| Wrapped waiting for Post | Wrap event/current no-site pattern + Post capacity queue facts | Post holders/projected release/remedies | Open Queue/Post read-only handoff; no old Stage claim |

### 13.2 Timing and possession language

`freesInWeeks` is projected under the assumption that intervening required decisions occur on time.
Use `expected` or `projected` in player copy unless later authority proves a guarantee. Safe fallback
is to omit ETA while retaining exact holder/remedy.

For `set-unavailable`, a free Stage candidate discovered by the allocator is not granted. Copy may
say “a Stage is free; no standing Set can bind.” It must not say “your Stage,” list it among owned
worksites, or expose it as current-work Locate.

Do not invent actor illness, cash exhaustion after Greenlight, generic crew shortages, weather,
camera failure, reshoots, permits, call sheets, or other blocker families.

### 13.3 Remedy transport boundary

At accepted projection v9, queue view owns remedy facts and the browser has action helpers, but the
bridge available-intent union does not provide general facility build, Set build/repair/strike, or
queued-intent-cancel intents. P05 therefore treats those remedies primarily as exact semantic
navigation into the canonical Queue/Facility/Set owner with preserved context. It may submit a remedy
directly only if the final Owner-accepted P04 implementation or that canonical owner publishes an
exact current opaque intent through the accepted command path. If neither owner route nor intent is
accepted, retain the exact explanation and safely omit/disable the action; do not mint a P05-local
intent, quote, or command reconstruction. Wave 0 must verify the final owner routes.

## 14. Production presence

`src/core/presence.ts::studioPresence` is the named-person presentation authority. It is pure,
save-neutral, deterministic, consumes no simulation RNG, uses exact IDs, withholds malformed joins,
and gives each named person at most one projected current site. Its precedence is Production over
script over Casting over roster.

| Phase/state | Exact current named-presence canon |
|---|---|
| Development/Pre-production | Writer + Director at exact Development/Casting facility |
| Rehearsal | Director + Lead + Antagonist + Support at exact Stage |
| Shooting | Director + cast at exact Stage; named craft at exact Scenery facility |
| Post | Director + craft at exact Post facility |
| Release Ready | Production claims nobody |
| Wrapped waiting for Post | Production engagement may remain, but site is null/no owned workplace |

The closed TypeScript Stage projection must filter/join presence `ownerId` to the Stage's exact
current `productionId` before publishing the Stage row. Unity then validates the received owner,
Production, facility, and person IDs against that row and fails closed on mismatch; it does not
independently rescan or rejoin presence. It never borrows a compatible body from another Production.
Named craft remains at Scenery during Shooting unless TypeScript authority changes.

### 14.1 Decorative crew contract

Anonymous decorative activity may make an active Stage legible but is not Production headcount.
Every decorative body is:

- nonselectable and stripped of authoritative identity;
- nonpersisted;
- without Talent ID, Contract, payroll, skill, role satisfaction, blocker effect, or outcome effect;
- scoped to one exact Stage presentation;
- configurable through a presentation budget, including exactly zero;
- safe to thin by distance/performance without changing authority or copy.

The zero-budget proof is mandatory: with all decorative bodies disabled, Production progression,
Stage state, exact named presence, blockers, and player understanding must remain correct.

## 15. Studio Week Theater

`src/core/studioWeekTheater.ts::studioWeekTheater` is the current-week plant/activity presentation
authority. Preserve its existing subjects, including `scenery-in-transit`, `stage-hot`, `stage-dark`,
`set-mounting`, `set-struck`, `wrap-clearing`, `company-waiting`, `queue-waiting`, and
`construction-progressing`.

P05 must compose rather than overread it:

- `stage-hot` covers Rehearsal and Shooting; phase/task/binding distinguishes their presentation.
- `scenery-in-transit` supplies destination/distance/remaining but the complete source/total/called/
  elapsed facts come from `sceneryLoadInFor`.
- `wrap-clearing` is history/current-week punctuation, not live occupancy.
- `set-mounting` is a plant operation, not Production Rehearsal and not Shooting scenery load-in.
- `stage-dark` means no current Stage operation; it does not erase a separately valid receipt.
- ten-beat arrays may select a static/current beat or cosmetic loop; full performed-week playback is
  not a P05A dependency.

### 15.1 Stage-state precedence

The closed TypeScript Stage view applies this order:

1. validate exact current Stage facility/body identity;
2. determine live current holder from reservation authority;
3. join that holder's live Set, phase, task, scenery, blocker, and presence;
4. derive current Production Stage state;
5. if and only if there is no current holder, apply compatible set-mounting/struck or Wrap-clearing
   plant punctuation;
6. otherwise render dark;
7. any contradiction yields withheld, never a guessed state.

This order is the root enforcement of current-holder-over-Wrap law.

## 16. Accepted Unity Stage singleton archaeology

All findings in this section are `VERIFIED CURRENT CODE` at Unity `062a881`, except the Wrap ordering
which is a verified current defect against Package 05 law.

| Finding | Exact file/symbol evidence | P05 disposition |
|---|---|---|
| Stage A constant | `StudioStageProductionPresentation.StageBuildingId = "stage-a"`; `Resolve` filters only it | Replace with per-controller exact binding/registry lookup |
| Literal Stage 7 | class comment/status copy including `Soundstage 7 dark` | Use projected exact Stage label |
| Singleton controller | `StudioBridgePresentation.CacheSceneObjects`: accepts exactly one controller; multiple set `stageProductionPresentationAmbiguous` | Registry keyed by exact Stage identity; duplicate only withholds conflicting Stage |
| Fixed root | scene lookup `11_Stage_A_Production_Activity` | Serialized Stage-local roots/profile |
| Identity discarded | `StudioStageProductionPresentation.Apply(truth) => Apply(truth.State)` | Retain complete Stage/Production/Set truth |
| Rehearsal is Waiting | enum lacks Rehearsal; `Resolve` returns `Waiting` for phase `rehearsal` | Add explicit Rehearsal semantic state |
| Wrap beats holder | `wrap-clearing` return at lines 230–259 precedes current hot branch at 339–379 | Consume TS-resolved current-holder precedence, remove the client early-history override, and add hostile application test |
| Global effects | `StageActivityEffects` falls back through `FindFirstObjectByType` and has Stage A coordinate | Scope serialized effects beneath exact Stage controller |
| Global decorative groups | `StudioStageDoorCrewPresentation` and `StudioShootingDayLotPresentation` use first controller/global mark searches | Stage-local marks/budget/controller |
| Fixed density | `CrewCount=3`; support `CrewCount=6`; `OnlookerCount=14` | Configurable budget with zero mode |
| Stage A ambient department | `StudioAmbientDepartment.StageA`; bridge activates all from one Stage truth | Semantic exact Stage membership |
| One vehicle | one `StudioVehicleRoute`; duplicates park/withhold | Exact logistics cue and scoped cosmetic route/vehicle pool |
| Authored route | one “Stage A service hold” ring; `StudioVehicleRoute` follows waypoints/`"Load"` name | Cosmetic only; exact source/destination anchors where available |
| Fixed role templates | `StudioProductionRolePresentation.RoleForStableId` hard-codes `t-dir-04`, `t-act-01`, `t-act-04`, `t-act-09`, and eight `presentation-crew-*` IDs plus fixed work target names | Semantic authored-role metadata; authoritative IDs stay dynamic |
| Actor marks ignore credit | current role seating uses broad stable-ID families and does not use projected `presence.credit` | Map exact published Production role/credit to Lead/Antagonist/Support marks; swapped Talent IDs must not swap semantic marks |
| Presence owner not enforced at Stage join | `StudioBridgePresentation.ApplyPeople` uses exact facility presence but does not validate `ownerId` against current Stage holder | TypeScript publishes owner-matched entries; Unity validates the received bundle and withholds mismatch |
| Stale active operation binding | `StudioBridgePresentation.ApplyProduction` configures `ActiveProduction` only when an operation exists and does not clear it on ordinary Dark/Clearing/Withheld application | Every atomic snapshot replaces or explicitly clears the Stage operation binding |
| Same-state truth can be missed | `StudioStageProductionPresentation.StateChanged` fires only when the enum changes | Full-truth application/change contract must refresh identity, copy, blocker, operation, people, and logistics even when enum is unchanged |
| Fixed proof Production | `StudioLotArchitectureAuthoring.BuildStageA` creates the actual `AuthoritativePresentationBinding("prod-0002")`; resolver itself is dynamic | Remove/neutralize live proof residue; preserve isolated regression evidence |
| 1948 profile | `context-hollywood-1948`; fixed period camera/dolly/Fresnel/megaphone/slate/boom/vehicles | Valid profile preferred; neutral fallback; never claim 1948 is correct for 1920 |

Relevant accepted files:

- `Assets/Studio/Runtime/Presentation/StudioStageProductionPresentation.cs`
- `Assets/Studio/Runtime/Presentation/StageActivityEffects.cs`
- `Assets/Studio/Runtime/Presentation/StudioBridgePresentation.cs`
- `Assets/Studio/Runtime/Presentation/StudioProductionRolePresentation.cs`
- `Assets/Studio/Runtime/Presentation/StudioPersonPresentationSlot.cs`
- `Assets/Studio/Runtime/Presentation/StudioShootingDayLotPresentation.cs`
- `Assets/Studio/Runtime/Presentation/StudioStageDoorCrewPresentation.cs`
- `Assets/Studio/Runtime/Presentation/StudioLotDeliveryContracts.cs`
- `Assets/Studio/Runtime/Presentation/StudioVehicleRoute.cs`
- `Assets/Studio/Editor/Authoring/StudioLotContext.cs`
- `Assets/Studio/Editor/Authoring/StudioLotActivityAuthoring.cs`
- `Assets/Studio/Editor/Authoring/StudioLotLandAuthoring.cs`
- `Assets/Studio/Editor/Authoring/StudioLotArchitectureAuthoring.cs`
- `Assets/Studio/Editor/Authoring/StudioLotAuthoring.cs` (owns accepted
  `context-hollywood-1948` and `active-production-prod-0002` scene markers, not the authoritative
  `prod-0002` binding created by `StudioLotArchitectureAuthoring.BuildStageA`)

## 17. Required exact-ID N-Stage architecture

### 17.1 Registry

Add one project-owned Stage presentation registry after the final P04 refresh. Recommended symbol:
`StudioStagePresentationRegistry`. It is presentation infrastructure, not a second authority store.

Registration law:

1. Every authored Stage presentation controller carries an exact authored `buildingId` through
   `StudioLocationBinding` or a reviewed Stage-specific binding.
2. On atomic snapshot application, join that body to exactly one projected Stage `facilityId`.
3. Index controllers by both exact `facilityId` and `buildingId`; neither title nor position is used.
4. Duplicate building/facility bindings withhold only the conflicting Stage entries and emit one
   diagnostic; they do not suppress unrelated Stages.
5. A projected Stage with no authored world body emits one diagnostic and has no world presentation;
   its safe textual projection remains. An authored controller that resolves to no unique projected
   Stage enters `Withheld`. Neither case may select a first/nearest controller or body.
6. Snapshot removal/session reset clears full Stage truth, named-role bindings, logistics, and
   decorative state before any next application.

### 17.2 Per-Stage authority bundle

Each controller receives one immutable/current `StageAuthorityTruth` bundle containing:

- snapshot revision/week;
- Stage facility/building IDs and label;
- current holder `productionId` or null;
- live bound `setId` or null;
- closed Stage state and player copy;
- exact phase/task/blocker/logistics references already composed by TypeScript;
- exact presence entries already filtered by TypeScript so `ownerId` matches the holder;
- optional Wrap receipt, separate from current state;
- optional semantic presentation-profile hint.

Separately, Unity supplies a local `StagePresentationConfig` containing the resolved art profile and
Stage-local decorative budget. That configuration never crosses the bridge, never participates in
authority equality, never appears as Production headcount, and never changes simulation/state/copy.

`StudioStageProductionPresentation.Apply` must retain this whole truth, not only its enum state.
Effects, placard, roles, decorative groups, and logistics consume the same Stage-local truth.

Application law:

- every accepted atomic snapshot replaces the complete Stage truth and either replaces or explicitly
  clears its current Production-operation binding; absence of an operation is data, not “leave the
  prior binding unchanged”;
- a full-truth refresh is required when holder, Production/Set identity, copy, blocker, operation,
  presence, logistics, or profile changes even if the semantic Stage enum remains unchanged
  (`Waiting -> Waiting` is still a material update);
- Unity validates exact IDs supplied in the closed row and withholds the conflicting component. It
  does not derive current-holder precedence, join presence from global lists, or interpret raw phase;
- reset/removal/session rollover clears every bundle component before applying replacement truth.

### 17.3 Stage-local owners

- `StudioStageProductionPresentation`: exact identity, state roots, placard/status, current truth.
- `StageActivityEffects`: serialized/registered under one Stage; no global lookup or fixed coordinate.
- `StudioProductionRolePresentation`: semantic Stage-local role marks; named authority IDs supplied
  from exact presence joins. Lead/Antagonist/Support/Director marks key from published Production
  role/credit, never Talent-ID families or array order.
- the lot-wide exact-ID person-body registry/allocator remains the sole Unity owner of one physical
  body per `talentId`; Stage controllers own only that body's current destination/semantic role mark.
  No per-Stage named-body cloning, first-body fallback, or Stage membership inference is permitted.
- `StudioStageDoorCrewPresentation` and `StudioShootingDayLotPresentation`: Stage-local decoration,
  configurable budget, zero safe.
- `StudioLotDeliveryContracts`/`StudioVehicleRoute`: cosmetic response to exact logistics cue;
  source/destination-aware presentation anchors when both exist, otherwise safe omission.
- `StudioBridgePresentation`: integration-only iteration over the registry and exact projection rows;
  no Production-law inference; replace/clear bindings on every snapshot application.

### 17.4 Art/profile governance

TypeScript may publish semantic meaning such as dark, rehearsal, logistics, waiting, Shooting, or
clearing. It may not publish Unity asset names, GUIDs, prefab/material paths, or vendor identifiers.
Unity resolves an authored presentation profile. If no valid era/profile exists, it uses neutral
working lights, doors, equipment silhouettes, restrained service cues, placard, and exact named
company presence. It must not use 1948-specific vehicles/equipment in a 1920 context simply because
those assets already exist.

## 18. Management-distance visual states

These six states are the P05A world acceptance contract. `Withheld` is a safe technical fallback, not
a seventh invented Production state.

| State | Required authority | Required management-distance read | Forbidden presentation |
|---|---|---|---|
| Idle / Dark | no current holder; valid dark plant truth | subdued Stage, no company, no beacon/freight | fake crew/lights/title/activity |
| Rehearsal / Preparing | exact holder, phase Rehearsal, live Stage and native live Set or explicit-grandfather null Set | occupied, exact title, `REHEARSAL`, modest working treatment, exact Director/cast | Waiting warning, load-in, Shooting beacon |
| Load-in | exact Shooting holder + current derived scenery transit or settlement-pending state | title, `LOAD-IN` while travelling or `SCENERY ARRIVED · PREPARING CAMERA` when pending; restrained freight/service cue only for transit; exact weeks/source/destination on inspection | fake Shooting, route-as-simulation, manual current Clear |
| Waiting | exact blocker/task wait | visibly held, exact title/cause; no false progress | generic red badge, invented holder, fake filming |
| Shooting | exact holder, Shooting/task state allowing current hot presentation | unmistakably hot, exact title/`SHOOTING`, named Director/cast, active equipment/lights, optional bounded decoration | Rehearsal treatment, named craft moved from Scenery, decoration as authority |
| Wrap / Clearing | no current holder and compatible current-week Wrap/clearing truth | shooting stands down; restrained clearing/receipt; Production leaves Stage | old title/lights/company over a new holder, Post controls |

When a new holder exists in the same settled state, that holder's current state replaces Wrap on the
Stage immediately. The prior Wrap remains eligible only for receipt/event/history punctuation.

## 19. Production tracking and rail

Accepted `StudioProductionRailHud` is a Development-only IMGUI summary. Do not append active
Productions to it and do not scan Unity objects to manufacture a portfolio. P05 adds an all-active
Production list inside the final accepted P04 UI Toolkit management host.

### 19.1 Row contract

Every row comes from the closed TypeScript Production projection and is ordered ascending by exact
`productionId`:

- exact title plus identity-backed selection;
- phase and current operational state;
- authoritative weeks and next milestone;
- exact primary work label, explicit no-owned-site, or withheld status;
- attention/blocker summary;
- exact current operation when one exists;
- separately visible explicit Locate when an exact current target exists.

Rows are not client-sorted by severity, title, location, or perceived importance. Queue service order
remains queue authority and is not reused as portfolio order. UI order is not persisted.

### 19.2 Same-title law

Two Productions may have identical display titles. Selection, workspace state, Stage placards,
company presence, blockers, commands, Locate, Wrap, and removal always key by `productionId`.
Title matching is prohibited in controller code and tests.

### 19.3 Workspace contract

The retained Production workspace presents:

- exact picture identity and phase/state rail;
- current worksites/related targets and explicit Locate actions;
- company roles and exact named presence;
- current Stage/Set binding and locked historical Set facts clearly separated;
- current blocker with effect, cause, consequence, holders, expected timing, and remedies;
- current operation with honest one-option consequence copy;
- Wrap/Post handoff read-only status.

It does not present generic percent, hidden quality, a studio-wide Production score, client priority,
scene/shot counts, Post editing controls, release controls, or cinematic playback.

## 20. Navigation and Back

Accepted P03A.3 navigation remains the base:

- `StudioLocateAction.Locate` is exact stable-ID dispatch;
- `StudioNavigationOrigin` and the depth-eight `StudioNavigationOriginTrail` store camera target pose
  only;
- `TycoonCameraController.PushNavigationOrigin` and `TryRestoreNavigationOrigin` remain the only
  camera-pose stack;
- `StudioSelectionManager.NextCancelStep` peels inspection, selection, then camera origin one layer
  per Escape;
- `StudioCancelStep`, `StudioCameraDirector.LastInspectionExitFrame`, and the visible Back control
  preserve the accepted world fallback order.

Final accepted P04 must contribute the retained workspace context/Back coordinator. That context may
retain Production ID, selected subview, blocker/remedy, scroll/focus identity, modal state, opener,
and memo owner. It must not store or duplicate camera pose.

P05 rules:

- opening/selecting a Production changes information only;
- explicit Locate/Focus may move the camera through the accepted path;
- phase changes, blockers, Greenlight, Wrap, alerts, polling, load, and reconnect never move it;
- stale Locate revalidates on activation and safely does nothing if the target changed;
- Home remains overview and invalidates origin history; it is not Back;
- P05 adds no `ProductionCameraStack`, Stage Back stack, direct teleport, or transform search.

## 21. Commands and quotes

### 21.1 Current P05 command surface

| Operation | Authority | Transport law |
|---|---|---|
| Assign Shooting Director | exact current `unassigned` task and locked Director | reuse current opaque command intent |
| Schedule Shooting take | exact current `ready` task | reuse current opaque command intent |
| Clear scenery load-in | present bindings with explicit `requiresSetBinding:false` only | reuse current opaque command intent after classifier/selector/adapter/action correction |
| Build facility/Set | exact queue/remedy fact | navigate/open canonical owner with exact context; direct submit only if final accepted owner publishes an opaque intent |
| Repair Set | exact Set remedy fact | navigate/open canonical Set owner; same direct-submit gate |
| Strike/mount Set | exact Scenery/Set remedy fact | navigate/open canonical owner; same direct-submit gate |
| Cancel queued intent | exact queued-intent remedy fact | navigate/open Queue owner; direct submit only if accepted there; never active Production cancel |

The workspace submits only the current revision/digest-bound opaque intent that TypeScript published.
It disables/removes stale controls on atomic snapshot replacement and never reconstructs an action
from a label.

`bridge/session.ts::{resolveAvailableIntents,availableIntents,applyAvailableIntent}` remains the one
intent path. Extend `resolveAvailableIntents` from first-journey-only Production selection to
all-active exact Production decisions; do not create a Production-local registry. The workspace
requires exactly one matching current option by `kind + productionId`, then submits that option's
published `intentId`; it never joins by label/title/array position.

That extension covers current Production operations, not every queue remedy. At accepted v9 there is
no general bridge intent kind for facility build, Set build/repair/strike, or queued cancellation.
“Existing remediation routes” means navigation to the canonical semantic owner unless Wave 0 proves
that final accepted P04 added an exact owner-published intent.

### 21.2 Quote law

P05A contains no identified material player-authored parameterized draft. Do not create
`/productionQuote`, a Production quote DSL, a second intent registry, or architectural symmetry with
Casting. P03/P04 `/quote` remains available for a future genuine material choice. If such a choice is
later authorized, it must be proved as a parameterized decision before extending the existing quote
union.

## 22. Memo ownership

The generic memo remains wire/automation/fallback presentation, not the primary P05 owner. After
P04A acceptance, reuse its semantic memo-owner registry rather than adding Production-specific
booleans.

Required law:

1. The Production world/workspace declares ownership only while it can render the exact current
   operation at the active viewport/input context.
2. While that owner is usable, memo presentation cedes the corresponding Director, schedule, or
   exact-grandfathered Clear verb.
3. If the retained owner is absent, disabled, failed, or unavailable at the viewport, the existing
   exact memo action remains as safe fallback.
4. Time/other domain ownership remains unchanged.
5. Snapshot polling never duplicates a memo/workspace operation or announcement.
6. The P05 journey must remain fully operable with the generic memo hidden; that proves the new owner
   is complete, not that wire commands were removed.

Likely collision owner after refresh: the final P04 memo registry and `StudioBridgeClient` integration
remain Fable-only files. Production workers consume the registry API; they do not modify its ownership
model independently.

## 23. Save and migration

The strong current finding is **no P05-specific save migration**:

- Production, workflow, phase, reservations, bindings, Set, task, blocker, queue, and events already
  persist;
- `sceneryLoadInFor` is derived from existing saved truth;
- permanent `wrapped` history already exists;
- the scenery correction changes transition timing/legality but adds no state;
- Production/worksite/Stage views are pure projections;
- Unity workspace/presentation state is local and non-authoritative.

Do not persist a `wrapped` flag, Stage visual state, transit vehicle position, decorative population,
Production percentage, workspace sort, current tab for simulation purposes, or cached Locate target.

Final save version is `PENDING P04A OWNER ACCEPTANCE`. At r2, inspect the final P04 save/migration
changed paths and prove current P05 states—including already-due blocked V14-compatible saves and
explicit-grandfather Stage-with-null-Set workflows—still load. Do not normalize/mutate authority
merely by opening a save unless an explicit migration law is authorized. A current exact blocker
whose derivation is already arrived projects `scenerySettlementPending`, exposes no Clear, and may
settle exactly once on the next authoritative tick; due-at-call applies when the action creates the
blocker. The hostile proof must execute real export, import, validation, projection, and next-tick
paths rather than constructing only an in-memory object.

## 24. Wrap and Post boundary

The verified Shooting-to-Post order in `src/core/operations.ts::enterPhase` is:

1. release live Stage reservation;
2. release live Set claim by removing the Stage claim;
3. release Scenery reservation;
4. release Shooting task;
5. append permanent `{ kind: 'wrapped', productionId, stageFacilityId, setId }`;
6. append reservation-release events;
7. attempt Post allocation;
8. on success, grant Post and emit `phaseEntered(postProduction)`;
9. on refusal, remain blocked with no reservations/task/current workplace.

The fixed-point sweep can grant the released Stage/Set opportunity to another waiter in the same
settled authoritative state.

P05 presents:

- `WRAPPED` and `STAGE RELEASED` receipt/history;
- exact current Stage holder, which may already be a different Production;
- `POST-PRODUCTION` when exact Post is acquired; or
- `WRAPPED · WAITING FOR POST` plus exact Post queue facts and explicit no-owned-worksite.

P05 does not retain the old Stage as insurance, paint old people/lights/placard over a new holder,
open an editing workspace, offer Post controls, call Release, or move the camera automatically.
Package 06 owns the next interaction.

## 25. Existing active Production cancel capability / deferred status

`VERIFIED EXISTING CORE CAPABILITY`:

```ts
{ kind: 'cancel', productionId }
```

`src/core/actions.ts::applyCancel` accepts an active Production, removes it and its workflow,
returns a linked screenplay to Ready, and applies no refund or standing change. It is not selected by
the current Production decision read model and is absent from current Production bridge intents.

Controlling P05 ruling: **DEFERRED / EXISTING HIDDEN CAPABILITY**.

- Do not expose active Production cancel in P05A UI.
- Do not create a blocker, quote, confirmation, or shortcut for it.
- Do not remove or rewrite the Core capability as P05 cleanup.
- Queue-intent cancellation remains a distinct existing remedy.
- Surfacing active film cancellation requires explicit later product authorization because its
  consequence is materially larger than the current Shooting operations.

Package 05's reference to explicit cancel routes applies to current queue/remedy owners—through exact
owner navigation and only owner-published intents where accepted. It does not prove that projection
v9 already transports those commands, and it does not authorize an active-film cancellation surface.

## 26. Tests and current proof archaeology

### 26.1 Existing TypeScript evidence to reuse

- `tests/operations.test.ts`
- `tests/c2a-m2-set-binding.test.ts`
- `tests/c2a-m4-release-law.test.ts`
- `tests/c2a-m4-queue-admission.test.ts`
- `tests/c2a-m4-queue-legibility.test.ts`
- `tests/c2a-m5-scenery-load-in-layout.test.ts`
- `tests/c2a-m5-studio-week-theater.test.ts`
- `tests/presence-determinism.test.ts`
- `tests/presence-projection.test.ts`
- `tests/presence-scenario.test.ts`
- `tests/studio-calendar.test.ts`
- `tests/first-film-journey.test.ts`
- `tests/studio-decision.test.ts`
- `tests/contracts/phase-table-agreement.contract.test.ts`
- `tests/v14-migration.contract.test.ts`
- `tests/c2a-m2-sets-save.test.ts`
- `tests/bridge-schema.test.ts`, `tests/bridge.test.ts`, runtime/restart/checkpoint suites
- `ui/src/engine/adapter.test.ts`
- snapshot tests for `stage7Production`, `sceneryLoadIn`, `weekTheater`, `productionCompany`, and
  `productionFormation`
- browser Production/Queue/Set UI tests and two-film/Greenlight E2E journeys.

Current same-week resource reuse is already proved in Core release-law tests. That is not a Unity
presentation proof.

### 26.2 Existing accepted Unity evidence to reuse

- `StudioStageProductionPresentationTests`
- `StudioProductionRolePresentationTests`
- `StudioShootingDayLotPresentationTests`
- `StudioLotDeliveryContractsTests`
- `StudioStageDarkInspectionGradeTests`
- `StudioDecorativeIdentityTests`
- `StudioStageVisualProofRunnerTests`
- `StudioBridgePresentationIdentityTests`
- `StudioBridgeProtocolTests`
- `StudioBridgeRuntimeContinuityTests`
- camera/selection/navigation tests inherited through final P04.

The accepted Stage tests are Stage A regressions. They do not currently prove two simultaneous Stage
controllers, same-title isolation, immediate reuse, zero decoration, missing scenery bodies, or
presence-owner agreement.

### 26.3 Test discipline

- Prefer exact IDs and complete state bundles over visible-title/string inference.
- Test TypeScript projection legality before Unity presentation.
- Test schema/generator parity before Unity code consumes new fields.
- Test malformed/duplicate/missing joins fail closed.
- Preserve deterministic manual/automatic/save/reconnect agreement.
- Do not change dependencies during this documentation recon; Wave 0 restores the canonical test
  environment first.

## 27. Required future proof matrix

| ID | Scenario/setup | Mandatory assertions | Primary future owner/tests |
|---|---|---|---|
| A | Active Production from Rehearsal through Shooting | exact row/Stage/Set/title/state; no percent; only current actions; management-distance state matches projection | TS projection tests; Unity Stage/workspace/proof runner |
| B | Resource wait | exact need/holder/remedy; projected timing wording; no guessed Stage/current worksite; time/other departments continue | `studioQueueView` composition, adapter/schema/UI tests |
| C | Company presence | exact owner/Production/facility joins; craft stays at Scenery during Shooting; missing anchor withholds only body | presence tests + Unity role/presence tests |
| D | Two Productions on two simultaneous Stages | independent current truth, state roots, placards, people, decoration, and two simultaneous load-ins with distinct exact source/destination facts; missing one route anchor suppresses only that cue; controller count is not ambiguity | new Unity registry/EditMode + visual proof |
| E | Same visible title on both Productions | rows, Stage states, Locate, blocker holders, Wrap/removal remain isolated by `productionId` | TS/bridge/Unity hostile fixture |
| F | Scenery due at Director call | assignment transaction returns ready, one `sceneryArrived`, no Clear, schedule operation current | extend `c2a-m5-scenery-load-in-layout.test.ts` |
| G | Normal arrival exact boundary | one week remaining settles in immediately returned next week; event preserves tick-sink prior-week stamp; no extra blocked week/event duplication | same + tick/determinism/theater tests |
| H | Grandfathered Clear | present bindings with exact `requiresSetBinding:false` publish manual Clear; Stage with `setId:null` remains valid; never auto-clears; action succeeds once | migration/scenery/decision/projection tests |
| I | Malformed current scenery | missing bindings, missing/invalid provenance, body/reservation/held week withhold; no Clear; forged action rejects; no guessed route | scenery/action/read-model/adapter + Unity safe fallback |
| J | Immediate Stage reuse after Wrap | A wraps; B owns same Stage in same snapshot; Stage paints only B; A receipt survives separately | Core release fixture + new Unity precedence test |
| K | Wrapped waiting for Post | no reservations/task/current worksite; no old Stage/company; exact Post queue facts; raw Shooting phase not shown as current Shooting | operations/projection/bridge/Unity test |
| L | Decorative budget high/medium/low/zero | simulation/projection/Stage state/named people/copy identical at every budget; ambient bodies are identity-stripped, nonselectable, Stage-local, authority-neutral, and do not leak across immediate Stage reuse; zero remains fully legible | Unity decoration budget/identity/reuse tests + visual evidence |
| M | Stale Locate | target changes between row render and activation; click revalidates, does not move, keeps context, announces safe unavailable once | final-P04 navigation/workspace tests |
| N | Save/reconnect mid-Shooting | real export/import/validate/projection path rebuilds exact Stage/nullable-grandfather-Set/company/task; an already-arrived blocker projects settlement-pending and next tick settles once; no replayed Greenlight/scenery/Wrap, duplicate bodies/events, or stale intents | save/bridge restart/checkpoint + Unity continuity |
| O | Generic memo hidden | every current P05 decision/remedy remains reachable; absent workspace restores memo fallback | memo owner/workspace journey tests |
| P | Wrap to P06 boundary | Stage/resources released, Post acquired or exact no-site wait, P05 remains read-only and exposes no P06 controls | end-to-end journey + workspace assertions |
| Q | Era/profile fallback | a 1920 or unknown/missing profile uses the neutral Production vocabulary and activates no `context-hollywood-1948` equipment or vehicles | Unity profile resolver/EditMode + visual evidence |
| R | Cross-Stage duplicate authority | duplicate one current `productionId`, live `setId`, and named `talentId` across Stage A/B in separate permutations; implicated Stage rows or person placements withhold at the defined granularity, unrelated Stage truth remains, and no duplicate placard/Set/body appears | TS projection + schema/protocol/Unity registry hostile tests |

Additional required permutations:

- reverse Stage 7/Stage 12 allocation order;
- remove one Stage/scenery world body;
- duplicate one Stage presentation binding;
- duplicate cross-Stage holder/Set/person authority identities independently;
- swap Lead/Antagonist/Support Talent IDs while preserving projected credits/semantic marks;
- controller, keyboard, and mouse operation at every final accepted P04 viewport band;
- 200% text and reduced-motion Focus;
- stale revision/duplicate submit/refusal recovery;
- current Production presence owner disagreement with Stage holder fails closed.

## 28. Implementation waves

No wave may use dirty in-progress P04 worktrees as authority. Fable is sole integrator and advances a
wave only after its entry facts and predecessor tests are green.

### WAVE 0 — Final P04A refresh and test preflight

Entry: Owner supplies accepted P04A TypeScript and Unity SHAs.

Actions:

- inspect only changed paths from `0d9fc65` and `062a881`;
- pin final protocol/projection version, schema identity, generated DTO parity, and Save version;
- map the actual UI Toolkit host, `PanelSettings`/`UIDocument`, tokens, responsive bands, contained
  scroll, focus restoration, and test hooks;
- map actual Global/World/Camera/UI Input contexts and UI-capture arbitration;
- map retained workspace context/Back coordinator while proving camera pose remains solely in
  `StudioNavigationOriginTrail`;
- map memo-owner registry/fallback and Casting-to-Production handoff;
- verify current `/quote` versus opaque `/command` shape and available-intent lifecycle;
- verify exact canonical Queue/Facility/Set remedy-owner routes and whether any final accepted owner
  publishes direct opaque intents;
- verify semantic world owner/Locate/stale-target resolver and any art/profile resolver;
- re-establish a runnable canonical TypeScript test environment without opportunistic dependency
  upgrades; run the accepted baseline suites before Production edits;
- assign collision-file ownership before workers start.

Exit: this same document is refreshed to r2; canonical TS tests collect and execute; final P04 seams
are pinned. Stop and replan if P04 changed authority boundaries, duplicated camera pose, lacks required
input arbitration, or materially changed schema/save/intent/workspace ownership.

### WAVE 1 — Scenery root correction

Files/symbols:

- `src/core/sceneryLoadIn.ts::{sceneryLoadInFor,isSceneryLoadIn}` and its provenance/withholding
  union;
- `src/core/operations.ts::{clearSceneryLoadIn,arriveDueScenery}` and one shared settlement helper;
- `src/core/actions.ts::{applyAssignShootingDirector,applyClearSceneryLoadIn}`;
- `src/core/tick.ts::tick` scenery step;
- `src/core/scriptReadModel.ts::nextProductionOperationsDecision`;
- `src/core/firstFilmJourney.ts` guidance;
- `ui/src/engine/adapter.ts::{managedProductionBoardCard,productionDecision,studioLotSnapshot}`
  independent command producer/copy;
- existing scenery/decision/journey/phase/migration/determinism tests.

Tests first. No Unity workaround, new save field, route authority, or generalized operations refactor.
Only present bindings with explicit `requiresSetBinding:false` are grandfathered; absent bindings or
provenance fail closed. Split accepted load-in fixtures at the unassigned state and configure Stage
distance before Director assignment. Update the accepted bridge intent-count and
assign→Clear→schedule expectations that encode current defects. Wave 1 is not complete until Core,
script selector, browser card, and lot-snapshot command legality agree atomically.

Exit: due-at-call and exact normal boundary settle once; current/malformed states expose no Clear;
grandfather behavior remains exact.

### WAVE 2 — Close the existing Production projection

Reuse and extend:

- `ui/src/lot/snapshot/StudioLotSnapshot.ts::ProductionOperationsState`;
- `ui/src/engine/adapter.ts::{studioLotSnapshot,productionBoard,managedProductionBoardCard}`;
- replace P05 use of `managedWorkflowLocation`;
- compose `productionPhases`, reservations/bindings/task, `sceneryLoadInFor`, `studioQueueView`,
  `studioPresence`, `studioWeekTheater`, and permanent Wrap events;
- reuse `ui/src/lot/snapshot/stage7Production.ts::stageProductionDetailContext` as the existing
  parameterized fail-closed pattern only; replace its singular-location/progress semantics, and never
  use `anyStageProductionDetailContext` as the N-Stage owner; keep the Stage 7 wrapper only where
  compatibility consumers still require it.

Recommended focused internal module if the final P04 adapter has not already extracted it:
`ui/src/lot/snapshot/productionOperations.ts`, called only by `studioLotSnapshot`; it replaces the
unsafe current assembly and is not a parallel projection root. Companion test:
`ui/src/lot/snapshot/productionOperations.test.ts`.

Exit: all-active exact rows, worksites/none/withheld, Stage/Set tuple, scenery, blockers, operations,
Wrap precedence, TS-authored copy, and Locate targets are closed and tested. Include migrated
Rehearsal/Shooting workflows with a live Stage and explicit-grandfather `currentSetId:null`, plus
loaded `scenerySettlementPending` and cross-Stage holder/live-Set/person uniqueness. P05 consumes no
`progress01`.

### WAVE 3 — Generated bridge contract

Fable-only integration changes (not a delegated Bridge worker lane):

- `bridge/schema/bridge-schema.ts`;
- `bridge/session.ts::resolveAvailableIntents` for all-active current Production operation intents,
  de-duplicated against first-film guidance;
- canonical schema/runtime files and `project-studio-bridge.schema.json`;
- `bridge/session.ts` assembly only where required by final P04 pipeline;
- generated TypeScript/C# DTOs through the repository generator;
- bridge schema/session/runtime/restart tests;
- Unity `StudioBridgeProtocol` and cache validation tests.

No handwritten generated C# edits and no second snapshot/store. Exit requires schema identity,
generated parity, duplicate/missing-field failure, restart/session rollover, and stale-intent proofs.
Bridge tests must create two active Productions with simultaneous current decisions, prove exactly one
`resolveProductionBlocker` intent per `productionId` in ascending ID order, prove first-film guidance
does not duplicate either intent, and prove submitting A cannot operate B.
Protocol tests independently duplicate a current holder, live Set, and named-person placement across
two Stage rows and assert the section 11.4 fail-closed granularity.

### WAVE 4 — Exact-ID N-Stage world foundation

Likely files:

- new `StudioStagePresentationRegistry.cs` and tests;
- `StudioStageProductionPresentation.cs` complete truth/Rehearsal/state roots;
- `StageActivityEffects.cs` Stage-local configuration;
- `StudioBridgePresentation.cs` Fable integration-only registry application;
- `StudioProductionRolePresentation.cs` and `StudioPersonPresentationSlot.cs` semantic Stage
  role/credit scope;
- `StudioStageDoorCrewPresentation.cs` and `StudioShootingDayLotPresentation.cs` Stage-local budget;
- `StudioLotDeliveryContracts.cs` and `StudioVehicleRoute.cs` exact logistics cue/cosmetic scope;
- `Assets/Studio/Editor/Authoring/{StudioLotContext,StudioLotActivityAuthoring,StudioLotLandAuthoring,StudioLotArchitectureAuthoring,StudioLotAuthoring}.cs`
  and the scene/prefab integration needed to author/register a second controller are one
  Fable-integration-only cut after runtime owners land their components;
- focused current-holder-over-Wrap, duplicate binding/authority, missing body, and two-controller
  tests.

Every snapshot application replaces or clears `ActiveProduction`; complete truth refreshes when
identity/copy/reason/operation/presence/logistics changes even if the Stage enum does not. Tests cover
Waiting-to-Waiting reason/operation replacement and swapped Talent IDs with stable projected credits.

Exit: two simultaneous Stage controllers work independently; current holder beats history; no global
first-controller/Stage-truth/role/vehicle inference or stale same-state/binding state remains. The
lot-wide exact-ID person-body registry remains and proves one body per `talentId`.

### WAVE 5 — Management-distance life

Implement and prove Idle, Rehearsal, load-in, waiting, Shooting, and Wrap before deep workspace
polish. Add `StudioProductionManagementDistanceProofRunner` (final path follows accepted proof
conventions), state capture fixtures, and visual evidence at every final supported viewport/camera
band. Add Stage-local decorative budget with zero mode and neutral art fallback.

Exit: an unfamiliar hostile reviewer can distinguish the six states at ordinary management zoom
with the workspace/memo closed and can trace every claim to the captured projection.

### WAVE 6 — Retained Production workspace

Use only final accepted P04 host/input/navigation/memo architecture. Likely P05-owned paths under the
accepted UI hierarchy:

- `StudioProductionWorkspaceController.cs`;
- `StudioProductionWorkspace.uxml`;
- `StudioProductionWorkspace.uss`;
- focused workspace/row/detail/blocker/Locate tests.

Provide all-active rows, exact detail, current worksites/related targets, company, blocker/remedy,
current action, and Wrap/Post read-only handoff. Row selection never moves the camera; explicit Locate
does. Preserve 16/14 px and 44×44 floors, 200% text, controller navigation, contained scroll, and
responsive final-P04 modes.

### WAVE 7 — Current operations and remedies

Wire exact current opaque intents for Director dispatch, take scheduling, and explicit-grandfathered
Clear. For Queue/Build/Repair/Strike/queued-cancel remedies, open the exact canonical owner context;
submit directly only if Wave 0 proved that owner publishes an accepted current opaque intent. Use
final memo ownership and stale-intent laws. Do not surface active Production cancel, mint remedy
intents locally, or add `/productionQuote`.

Exit: every visible action is current, exact, single-submit, revision-bound, reachable with memo
hidden, and removed on stale snapshot.

### WAVE 8 — Wrap and P06 handoff

Prove release/event/Post order, explicit no-site Post wait, current-holder precedence, workspace
continuity, no camera hijack, and absence of P06 controls. P05 may link to the next owner only through
existing accepted navigation/read-only seams.

### WAVE 9 — Multi-Production, continuity, responsive proof

Run every scenario in section 27, including same-title, reversed allocation, concurrent logistics,
immediate reuse, missing bodies, decoration high/medium/low/zero, semantic role swapping,
save/load/reconnect, era-neutral fallback, stale Locate, memo hidden, controller/mouse/keyboard, 200%
text, reduced motion, and every final supported viewport.

### WAVE 10 — Hostile review

Fresh-context reject-hunting reviewer first; Fable fixes root causes; fresh verification reruns all
Core/bridge/browser/Unity/proof matrices; Owner then judges management-distance life and the complete
Greenlight-to-Post-handoff journey. Watch Shoot and performed-week playback remain excluded.

## 29. REUSE / EXTEND / NEW / DO NOT TOUCH

### 29.1 REUSE

- `Production`, stable ID generation, concept/title join;
- `productionPhases.ts`, phase requirements/successors/ranks/retention;
- operations allocator, atomic Stage/Set binding, fixed-point release/retry;
- queue admission/fairness and `studioQueueView`;
- `studioPresence`, `studioWeekTheater`, `studioCalendar`;
- `sceneryLoadInFor` geometry/duration derivation;
- Set domain, occupancy union, permanent event ledger;
- deterministic time/RNG, Greenlight atomicity, forecast lock, economy tuning;
- accepted tick-versus-command Studio event timestamp convention;
- current save/migration foundation;
- existing `productionBoard`/ProductionBoard browser behavior oracle;
- bridge session/schema/generator/protocol/store pipeline;
- accepted exact-ID Unity cache, location binding, duplicate validation, and session reset/removal
  vocabulary, while correcting ordinary-snapshot stale binding behavior;
- accepted camera, selection, `StudioLocateAction`, camera-origin trail, and final P04 workspace host.

### 29.2 EXTEND / CORRECT

- scenery provenance classification plus settlement caller timing/legality/read-model/adapter seams
  listed in Wave 1;
- existing `ProductionOperationsState` and adapter projection assembly;
- bridge Production schema/generated DTOs;
- first-film Production/Rehearsal/load-in wording;
- `StudioStageProductionPresentation` complete truth, explicit Rehearsal, exact Stage identity;
- Stage effects, role presence, decorative activity, delivery cues;
- `StudioBridgePresentation` only as central integrator;
- final P04 retained host with Production route/content/memo ownership;
- existing tests/proofs with P05 hostile scenarios.

### 29.3 NEW

- one focused internal Production-operations composition module only if not landed by final P04;
- exact Stage-local closed projection rows within the existing projection root;
- `StudioStagePresentationRegistry` and focused registry tests;
- Stage-local full truth type/binding where existing types cannot carry it cleanly;
- narrow Unity presentation-profile resolver and era-neutral fallback only if final P04 did not land
  an accepted resolver;
- configurable decorative presentation budget including zero;
- retained Production workspace UXML/USS/controller inside final P04 host;
- management-distance P05 proof runner/evidence fixture;
- focused multi-Stage, same-title, immediate-reuse, stale-target, and handoff proofs.

### 29.4 DO NOT TOUCH except the stated surgical seam

- phase table/phase count/capability law;
- acquisition ranks and atomic allocator algorithm;
- sticky retention and release-before-acquire law;
- queue service order/fairness;
- Set novelty/uplift/condition law;
- presence precedence/canon;
- week-theater subject semantics merely to work around Unity;
- Production ID generation, Greenlight transaction, forecast lock;
- economy, payroll, time-speed law, RNG streams;
- tick-versus-command Studio event sink timestamp convention; Wave 1 changes the arrival predicate,
  not the sink week;
- save migrations without genuinely new persistent authority;
- P03 camera-origin trail and accepted camera law;
- final P04 workspace/input/Back/memo ownership architecture;
- renderer/URP/Cinemachine/DOTS/Addressables/platform architecture;
- Post/Release gameplay;
- Watch Shoot/capture/timeline/cinematic systems;
- giant Stage 7 proof runner as a wholesale generic base—retain it as regression evidence and add
  focused P05 proofs.

## 30. File ownership and worker lanes

Fable is sole lead/integrator. One worker owns a file at a time; workers do not merge or coordinate
collision files among themselves.

| Lane | Owned work | Forbidden overlap |
|---|---|---|
| TS scenery Core owner | Wave 1 operations/actions/tick/read-model/first-journey surgery and exact tests | no allocator/phase/save/general refactor; no bridge/Unity |
| TS Production projection owner | `ProductionOperationsState`, focused composition, adapter facts/copy, browser oracle tests, holder-over-history precedence, holder-matched presence rows | no Core mutation; no schema/generated DTO; no React redesign |
| Fable bridge integration-only | schema/canonical JSON/generator/session bundle/tests and generated TS/C# output | not delegated; no handwritten Unity-generated DTO edits; no Unity presentation law |
| Unity World/Stage owner | Stage registry, Stage controller/full truth, effects, application of already-resolved precedence, presentation-profile resolver and neutral fallback | no shared bridge bootstrap/host/input/Back; no UI workspace; no Production-law derivation |
| Unity Activity/Presence owner | semantic role marks/destinations on the lot-wide exact-ID person-body registry, validated named-presence application, decorative budget, logistics/vehicle activation | consumes published Stage truth and resolved profile; no state resolution, authority joins, body cloning, or profile selection |
| Unity Production workspace owner | P05 UI Toolkit content inside final P04 host, row/detail/blocker/Locate/controller/responsive tests | no parallel host/input/Back/memo system; no legacy Rail mutation |
| Proof owner | focused hostile fixtures/runners/evidence and test orchestration | no production-law fixes; reports failures to owning lane |
| Fable cross-system integration-only | collision files, cross-lane DTO application, final routes/ownership, scene/prefab cut, rebase, hostile fixes | never delegated concurrently |

Fable-controlled collision files include:

- `bridge/schema/bridge-schema.ts` during final cut;
- `bridge/session.ts`;
- generated DTO outputs and schema identity;
- Unity `StudioBridgePresentation.cs` and `StudioBridgeBootstrap.cs`;
- `Assets/Studio/Editor/Authoring/{StudioLotContext,StudioLotActivityAuthoring,StudioLotLandAuthoring,StudioLotArchitectureAuthoring,StudioLotAuthoring}.cs`
  plus the final Stage scene/prefab cut;
- final P04 UI Toolkit host/root router;
- final input-context service;
- final workspace/Back coordinator;
- final memo-owner registry/`StudioBridgeClient` integration;
- central proof orchestration and final scene/prefab registration.

No lane modifies either active production worktree before Wave 0 establishes accepted bases and clean
implementation branches.

## 31. Safe degraded-path matrix

| Seam | PREFERRED | SAFE DEGRADED | FORBIDDEN FAKE FALLBACK |
|---|---|---|---|
| Current location | exact reservation-backed worksite(s), primary and related targets | explicit no current owned worksite; exact facility with world location unavailable; withheld | previous Stage, Stage 7, nearest/first Stage, phase-derived Writers/Post/Theater |
| Locate | exact stable current target revalidated on activation | omit/disable with one safe unavailable state; camera/context unchanged | approximate Transform, stale cached target, title match, arbitrary holder |
| Stage/Set join | native live reservation + binding + mounted Set agreement; explicit-grandfather live Stage with nullable Set | withhold only conflicting/malformed components while preserving an independently valid Stage claim | treating missing provenance as grandfathered; historical `bindings.setId` as live ownership; first Set/Stage |
| Stage state | closed TS Stage row from current ownership/task/theater | Stage withheld or neutral dark only when authority says no holder | Unity enum inference from phase; old Wrap over new holder |
| Era art | valid authored presentation profile | era-neutral lights/equipment/crew/logistics vocabulary | hard-coded 1948 assets in 1920 because they exist |
| Named people | exact TS presence ID/site/owner join plus one lot-wide Unity body per `talentId` | conflicting/missing person body omitted; Production/valid Stage state continues | per-Stage clone, first-body substitute, guessed name/role, named craft moved to Stage |
| Decorative crew | Unity-local bounded Stage presentation budget | zero decorative crew | budget in bridge/authority equality; decoration as staffing/headcount/outcome authority |
| Cross-Stage identity | unique current holder/live Set/named-person placement across Stage rows | withhold implicated Stage rows or duplicate person placements at defined granularity | duplicate placards, live Sets, or named bodies; first Stage wins |
| Scenery command legality | present bindings plus explicit `requiresSetBinding:false` publish manual Clear; current due/travelling settles through authority | current arrived may show settlement-pending; malformed/withheld stays blocked; both expose no Clear and reject forged Clear | missing bindings treated as legacy, manual current Clear, malformed-state acknowledgment, client settlement |
| Scenery logistics | exact source/destination/distance/weeks; cosmetic route only with valid anchors | omit vehicle/route; retain exact text/status | authored ring claimed as simulation path; vehicle decides arrival |
| Queue timing | exact projected `freesInWeeks` with `expected/projected` wording | omit ETA, retain holder/remedy | guaranteed timing unsupported by authority |
| Blocker target | exact published resource/holder/remedy target | omit Locate/open general owner workspace | random full Stage, candidate Stage presented as owned |
| Remedy transport | navigate/open exact canonical Queue/Facility/Set owner; direct submit only from its accepted opaque intent | retain exact explanation and omit/disable unavailable route | mint P05-local build/repair/strike/cancel intent or reconstruct command from remedy copy |
| Production progress | phase + state + authoritative weeks + next milestone | omit uncertain milestone detail | generic percent/scene/shot progress |
| Finance/score | safe exact TS projection if Package 05 requires it | omit | Unity calculation, hidden quality, unsupported precision |
| Wrap | current holder state plus separate exact historical receipt | receipt only; no Stage cue when incompatible | old company/placard/lights/clearing over new holder |
| Transport outage / no fresh snapshot | fresh atomic snapshot | retain last safe snapshot clearly stale/disabled with reconnect status; no actions | client catch-up simulation, local progress, blind retry |
| Fresh malformed/ambiguous semantic join | exact current closed projection | clear/withhold affected Production/Stage facts while preserving independently valid rows | retain old holder/location/activity as if current; substitute guessed facts |
| P04 UI infrastructure | final accepted P04 host/input/Back/memo architecture | during recon: `PENDING P04A FINAL REFRESH` | parallel P05 workspace host, device polling, pose stack, owner booleans |
| Memo owner | retained P05 owner while usable | existing exact memo fallback | remove only verb, duplicate commits, parse copy as command |
| Post handoff | exact Post workplace or explicit no-site queue wait | read-only `POST IS NEXT` | editing/release controls or former Stage retained |

## 32. Risk register

| Priority | Risk | Trigger/effect | Root control and proof |
|---|---|---|---|
| P1 | Scenery still exposes false decision | Clear remains for current/malformed trip or due boundary stays blocked | Wave 1 one-helper law; F–I proofs |
| P1 | Scenery fix changes event chronology | tick arrival is stamped N+1 and existing theater/history windows shift | preserve tick sink at week N while deriving/returning N+1; event assertions |
| P1 | Unsafe singular location survives | wrapped/no-site Production painted at Post/former Stage | replace P05 semantics; worksite/none/withheld tests |
| P1 | Stage singleton disguised as generalization | second controller withholds all or uses Stage A truth | exact registry; D/E proofs |
| P1 | Historical Wrap beats current holder | A clearing hides B same-state acquisition | TS precedence + Unity J proof |
| P1 | Grandfather provenance remains fail-open | missing bindings are classified as legacy and can Clear | explicit-false-only classifier + action/selector/adapter F–I proofs |
| P1 | Stage/Set/Production identity collapses | title/synthetic location joins leak objects | separate DTO IDs/invariants; same-title hostile fixture |
| P1 | Cross-Stage duplicate authority leaks | one Production/live Set/person appears on two Stages | projection/protocol uniqueness invariants; R proof |
| P1 | P04 architecture duplicated | P05 adds host/input/Back/memo/pose stack | Wave 0 gate; Fable collision ownership |
| P1 | Unity reimplements law | raw enum/array/position drives state/action/location | closed TS projection and protocol tests |
| P2 | Presence leaks between Productions | compatible body/role shown for wrong holder | require presence `ownerId`; C/D/E proofs |
| P2 | Named bodies clone per Stage | each controller instantiates/resolves the same `talentId` independently | retain lot-wide exact-ID body registry; C/R proofs |
| P2 | Same-state Stage truth or operation remains stale | enum does not change or absent operation leaves old binding active | full-bundle replace/clear application tests |
| P2 | Actor credits map to wrong marks | broad Talent-ID family overrides Lead/Antagonist/Support semantics | published role/credit mapping + swapped-ID proof |
| P2 | Craft Lead falsely moves to Stage | visual preference overrides presence canon | exact presence composition; C proof |
| P2 | Decoration implies staffing | ambient count affects/read as authority | explicit decorative contract and zero proof |
| P2 | Decorative budget enters authority | profile density changes bridge equality/state | Unity-local presentation config; L proof |
| P2 | Candidate Stage copy overclaims ownership | set wait says “your Stage” or Locate targets it | queue copy/target rules; B proof |
| P2 | `progress01` reaches UI | false precision/bar appears | compatibility annotation + workspace snapshot tests |
| P2 | 1948 profile presented as universal | era-inappropriate props/vehicles | semantic profile + neutral fallback/evidence |
| P2 | Rehearsal remains generic Waiting | occupied progressing phase looks blocked | explicit state/visual/test |
| P2 | Stale intent/Locate commits or moves | snapshot changes between render and click | revision/identity revalidation; M/N proofs |
| P2 | Reconnect replays transient events | duplicate company/Wrap/scenery cue | atomic store/reset/event dedupe; N proof |
| P2 | Active cancel leaks into P05 | destructive hidden capability becomes casual button | deferred ruling and schema/workspace absence tests |
| P3 | Ten-beat/Watch Shoot steals scope | animation scheduler/camera mode becomes acceptance dependency | explicit follow-up/no-go boundary |
| P3 | Visual density harms performance | fixed proof populations multiplied per Stage | budget/distance thinning/zero floor; measure Wave 5 |

## 33. Recording conventions and reconciliation ledger

Each ledger entry records the issue, blocking status, authority, and destination.

### 33.1 KNOWN NON-BLOCKERS

| Issue | Blocking status / why | Authority | Destination/follow-up |
|---|---|---|---|
| Watch Shoot/performed-week playback absent | `NOT A P05A BLOCKER` — explicitly outside acceptance | Package 05 | future named presentation package only |
| No new Production domain | `NOT A BLOCKER` — existing Core owns required lifecycle | accepted TS + Package 05 | compose existing authority |
| No P05-specific save migration | `NOT A BLOCKER`, provisional until P04 refresh — required truth is persisted/derived | accepted TS | Wave 0 reverify final save version |
| No `/productionQuote` | `NOT A BLOCKER` — no material parameterized P05 draft exists | Package 05/current command shape | add only after later authorized choice |
| Active Production cancel hidden | `NOT A BLOCKER` — explicitly deferred from P05 surface | current Core + current Owner hardening brief | future product decision |
| Ten theater beats not animated | `NOT A BLOCKER` — static/state-driven presentation satisfies scope | Package 05 | possible follow-up playback |
| Missing exact era profile | `NOT A BLOCKER` — neutral presentation is honest | architecture + degraded-path law | future art/profile expansion |
| Decorative crew budget zero | `NOT A BLOCKER` — correctness cannot depend on ambience | Package 05 | required fallback/proof |
| Generic memo may be hidden | `NOT A BLOCKER` — retained owner must be complete; wire fallback remains | Package 05/P04 ownership law | O proof |
| Post gameplay absent | `NOT A BLOCKER` — P05 ends at handoff | Package 05 | Package 06 |

### 33.2 KNOWN IMPLEMENTATION BLOCKERS

| Issue | Blocking status / why | Authority | Destination/follow-up |
|---|---|---|---|
| Final P04A implementation is not Owner accepted | `BLOCKS P05 PRODUCTION EDITS` — reusable seams and versions are not authoritative | current Owner brief/governance | Wave 0 changed-path refresh and r2 |
| Canonical TS tests do not currently start in this worktree | `BLOCKS P05 PRODUCTION EDITS`, not this recon — no green executable baseline | current Owner brief + validation evidence | Wave 0 restore declared dependency environment and run baseline |
| Clean post-P04 implementation branches and collision ownership do not yet exist | `BLOCKS PARALLEL IMPLEMENTATION` — dirty worktrees cannot be authority and shared files need one owner | repository hygiene/governance | Fable creates clean branches and lane map after r2 |

### 33.3 DELIBERATE DEVIATIONS

| Deviation from preliminary seed | Blocking status / reason | Authority | Destination |
|---|---|---|---|
| Correct existing projection instead of create parallel one | `CONTROLLING CORRECTION`, not blocker — v9 already carries all-active Production rows, though available Production intents remain first-film-selected | accepted TS/bridge | Waves 2–3 |
| Replace singular location with worksites/primary/related/none/withheld | `CONTROLLING CORRECTION` — singular field fabricates locations and cannot model split work | Package 05 + accepted code | Wave 2 |
| Treat scenery as three defects | `CONTROLLING CORRECTION` — exact tick/action/selector code disproves one-defect hypothesis | accepted TS | Wave 1 |
| Material N-Stage refactor rather than “parameterize Stage 7” | `CONTROLLING CORRECTION` — singleton/global architecture is structural | accepted Unity | Waves 4–5 |
| Keep Stage 7 proof runner as regression instead of generic base | `NOT A BLOCKER` — it hard-codes one scene/company/milestone flow | accepted Unity | add focused P05 proofs |
| Retain `progress01` only for compatibility | `NOT A BLOCKER` — deletion may affect accepted consumers; P05 UI law forbids use | Package 05/current schema | annotate and stop consuming |
| Defer active Production cancel | `NOT A BLOCKER` — surfacing is a material product decision without P05 authorization | current Owner hardening brief/current Core | future explicit authority |
| Do not repair dependency graph during recon | `RECON LIMITATION`, not product blocker — failure occurred before collection | current Owner instruction | Wave 0 preflight |

### 33.4 P04A-DEPENDENT ITEMS

| Item | Blocking status / why pending | Authority | Wave 0 destination |
|---|---|---|---|
| Final TS/Unity SHAs | `BLOCKS P05 EDITS` — implementation not Owner accepted | governance | pin exact seals |
| Protocol/projection/schema/generated DTO identity | `BLOCKS WAVES 2–3 CUTOVER` — P04 bridge is in progress | P04 forward | changed-path verification/generation |
| Save version/migration | `BLOCKS SAVE PROOF` — P04 has in-progress V15 work | P04 forward | pin and rerun migration matrix |
| UI Toolkit host and responsive tokens | `BLOCKS WAVE 6` — dirty/in-progress Unity code is not authority | P04 forward/audit | consume final API only |
| Input contexts/UI capture/controller navigation | `BLOCKS WAVE 6 INPUT` — concrete seam unaccepted | audit/P04 forward | map exact service/actions |
| Workspace context/Back coordinator | `BLOCKS WAVE 6 NAVIGATION` — retained coordinator pending | P03/P04 forward | reuse without pose duplication |
| Memo-owner registry | `BLOCKS WAVE 7 OWNERSHIP` — final implementation pending | P04 forward | map exact registration/fallback |
| Canonical Queue/Facility/Set remedy-owner routes and intents | `BLOCKS DIRECT REMEDY WIRING`, not explanation — accepted v9 has remedy facts/browser helpers but no general bridge intents | accepted bridge + P04 forward | verify exact semantic navigation owners; direct submit only if owner publishes intent |
| Casting-to-Production handoff | `BLOCKS END-TO-END JOURNEY` — P04 landing pending | Package 04/P04 forward | map exact Production open/select route |
| Final viewport bands/proof hooks | `BLOCKS FINAL RESPONSIVE PROOF` — current bands are forward | P04 forward | pin accepted bands/tests |
| Visual asset/profile resolver | `DOES NOT BLOCK` — implementation unknown; neutral fallback is legal | architecture/P04 forward | reuse if landed; neutral fallback otherwise |

### 33.5 OPEN IMPLEMENTATION QUESTIONS

These are bounded and do not require a new Owner product ruling before the r1 handoff:

| Question | Blocking status / current ruling | Authority | Resolution owner |
|---|---|---|---|
| What are the final P04 class/path names for host, input, Back, memo, responsive tokens? | `BLOCKS WAVE 6`, not r1 — do not guess or prebuild | P04 forward/current Owner brief | Fable, Wave 0 |
| Did final P04 change projection/save/intent versions or generated DTO conventions? | `BLOCKS WAVES 2–3 CUTOVER` — accepted P04 wins implementation detail, never Package 05 law | P04 forward | Bridge/Fable, Wave 0 |
| Did P04 land a semantic art/profile resolver? | `DOES NOT BLOCK` — reuse if accepted; otherwise neutral narrow resolver | architecture/P04 forward | Fable/Unity World, Waves 0/4 |
| What exact supported viewport bands replace the forward ≥1200/≤840 bands? | `BLOCKS FINAL RESPONSIVE PROOF`, not Core/world work | P04 forward + Package 05 floors | Workspace/Proof, Waves 0/6 |
| Does final P04 expose an atomic stale-Locate resolver API? | `BLOCKS LOCATE WIRING` — reuse it or add smallest central semantic seam | P04 forward/accepted navigation law | Fable, Waves 0/6 |
| Which exact accepted owners/routes expose Queue, Facility, and Set remedies, and did any add opaque intents? | `BLOCKS WAVE 7 DIRECT WIRING`, not blocker explanation — navigate to accepted owner or safely omit; never mint locally | accepted bridge/P04 forward | Fable, Waves 0/7 |
| Is `ui/src/lot/snapshot/productionOperations.ts` already landed under another accepted name? | `BLOCKS FILE ASSIGNMENT`, not semantics — extend accepted equivalent, never duplicate | repository/P04 forward | TS Projection, Wave 2 |

No Owner decision is required now for active cancel, Watch Shoot, performed-week playback, automation
of Director/take gates, or Post gameplay: each is explicitly deferred/out of P05A.

### 33.6 REFUTED PRELIMINARY-SEED CLAIMS

| Refuted issue | Blocking status / controlling correction | Authority | Destination |
|---|---|---|---|
| Scenery has only a due-at-call mismatch | `BLOCKS WAVE 1` — natural arrival is also one week late and Clear gating fails open | accepted TS | Wave 1 and F–I proofs |
| New-style scenery settles exactly when due | `BLOCKS WAVE 1` — eventual settlement exists, exact returned-week boundary is wrong | accepted TS | tick boundary test/fix |
| Only grandfathered load-ins can Clear | `BLOCKS WAVE 1` — current code misclassifies missing bindings as grandfathered, and other withholding/current-arrived values fall through independent selector/adapter/action seams | accepted TS | explicit-false classifier plus selector/adapter/action gates |
| P05 needs a new Production projection from zero | `CONTROLLING CORRECTION` — v9 already has `productionOperations` | accepted bridge | Waves 2–3 reuse/extend |
| Singular `locationBuildingId` answers where the Production is | `BLOCKS WAVE 2` — it fabricates locations and cannot model multiple/no/withheld sites | accepted TS/bridge + Package 05 | replace P05 semantics |
| Current Production location is always singular | `CONTROLLING CORRECTION` — Shooting owns Stage/Scenery relations and split presence | accepted TS + Package 05 | plural worksite model |
| Accepted Unity is mostly generalized | `BLOCKS WAVE 4` — it is singleton Stage A/Stage 7 proof architecture | accepted Unity | exact registry |
| Current Stage truth beats Wrap history | `BLOCKS WAVE 4` — resolver can return clearing before new hot holder | accepted Unity + Package 05 | precedence fix/J proof |
| Rehearsal has distinct truthful presentation | `BLOCKS WAVE 4/5` — accepted resolver maps it to Waiting | accepted Unity + Package 05 | explicit Rehearsal state |
| Director/take/legacy Clear are entire Core command surface | `NOT A P05 BLOCKER` — active Production cancel exists but is deferred | accepted TS + current Owner brief | section 25/future product decision |
| No current Production percentage problem | `BLOCKS WAVE 6 ACCEPTANCE` — bridge exposes `progress01` | accepted bridge + Package 05 | compatibility-only/no UI use |
| Existing proof art is era-safe | `DOES NOT BLOCK` — Stage activity is 1948-specific; neutral fallback is legal | accepted Unity + architecture | Wave 4/5 profile fallback |

### 33.7 RECON VALIDATION LIMITATIONS

One targeted TypeScript validation command was attempted:

```sh
npx vitest run tests/c2a-m2-set-binding.test.ts tests/c2a-m4-release-law.test.ts tests/c2a-m5-scenery-load-in-layout.test.ts tests/contracts/phase-table-agreement.contract.test.ts
```

It failed before test collection with:

```text
⎯⎯⎯⎯⎯⎯⎯ Startup Error ⎯⎯⎯⎯⎯⎯⎯
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './internal' is not defined by "exports" in /Users/bruce/The Movies - Github Push Test/node_modules/vite/package.json imported from /Users/bruce/The Movies - Github Push Test/node_modules/@vitejs/plugin-react/dist/index.js
```

Environment evidence: Node `v24.16.0`; installed `vite@6.4.3`, `vitest@2.1.9`, and invalid
`@vitejs/plugin-react@6.1.0` against root-declared `^4.3.4`. This is a local dependency/toolchain
startup failure: zero tests were collected or executed, and it is not a committed assertion failure
or P05 product blocker.

The accepted source and committed tests named in sections 9 and 26 were inspected directly at exact
SHAs. Dependencies were not changed. Wave 0 must restore the canonical runnable TS test environment
and run baseline tests before P05 production edits.

### 33.8 MATERIAL PRELIMINARY-SEED A–X DISPOSITION INDEX

This index closes the original classification requirement. Detailed implementation law lives in the
referenced body sections; the seed itself is not retained as authority.

| Seed | Classification | Blocking status / controlling ruling | Authority | Destination |
|---|---|---|---|---|
| A — mostly projection/presentation | `SUPPORTED DESIGN LAW` + `VERIFIED CURRENT CODE` | `NOT A DOMAIN BLOCKER`; scenery is the only narrow Core area, with three defects | Package 05 + accepted TS | Waves 1–6 |
| B — lifecycle map | `VERIFIED CURRENT CODE` | `NOT A DESIGN BLOCKER`; exact release/event/Post-wait qualifications control | accepted TS | sections 5, 7, 8, 24 |
| C — identity | `VERIFIED CURRENT CODE` | `BINDING IMPLEMENTATION LAW`; Production, Stage, Set remain separate | accepted TS + Package 05 | sections 6, 11, 17 |
| D — “where is this movie?” | `VERIFIED CURRENT CODE` + `REFUTED` singular DTO | `BLOCKS WAVE 2`; exact claims/none are derivable, current field is unsafe | accepted TS/bridge | sections 10–12 |
| E — blocker system sufficient | `VERIFIED CURRENT CODE` + `OPEN IMPLEMENTATION QUESTION` | `PARTIAL`; queue covers capacity/Set only and must be bridged/composed | accepted TS + Package 05 | section 13/Wave 2 |
| F — blocker families | `VERIFIED CURRENT CODE` | `NOT A BLOCKER`; exact families/task states only, with cancel qualification | accepted TS | sections 13, 25 |
| G — scenery core delta | `REFUTED` current behavior + `SUPPORTED DESIGN LAW` target | `BLOCKS WAVE 1`; three connected corrections | accepted TS + Package 05 | section 9 |
| H — autonomy trap | `SUPPORTED DESIGN LAW` + `VERIFIED CURRENT CODE` | `NOT A BLOCKER`; preserve Director/take gates | Package 05 + accepted TS | sections 8, 21 |
| I — presence | `VERIFIED CURRENT CODE` | `NOT A BLOCKER`; exact canon reused, craft remains at Scenery | accepted TS | section 14 |
| J — Week Theater | `VERIFIED CURRENT CODE` | `NOT A NEW-SIM BLOCKER`; compose with workflow/task/current occupancy | accepted TS | section 15/Wave 2 |
| K — ten-beat critical path | `SUPPORTED DESIGN LAW` | `NOT A P05A BLOCKER`; playback deferred | Package 05 | sections 15, 33.1 |
| L — Unity proof reuse | `VERIFIED CURRENT CODE` + `REFUTED` generalization assumption | `BLOCKS WAVE 4`; reuse vocabulary/helpers, replace singleton architecture | accepted Unity + Package 05 | sections 16–17 |
| M — minimum visual package | `SUPPORTED DESIGN LAW` | `BINDING ACCEPTANCE`; six states before workspace polish | Package 05 | sections 4, 18/Wave 5 |
| N — TS-authored tracking | `SUPPORTED DESIGN LAW` + `REFUTED` new-pipeline premise | `BLOCKS WAVES 2/6`; extend existing all-active projection | Package 05 + accepted bridge | sections 10, 11, 19 |
| O — typed location | `SUPPORTED DESIGN LAW` + `INFERENCE` shape | `BLOCKS WAVE 2`; semantics fixed, exact type spelling rechecked at r2 | Package 05/current code | sections 11–12 |
| P — P04 reuse | `P04A FORWARD ASSUMPTION` | `BLOCKS P05 EDITS/INTEGRATION` until Owner acceptance/r2 | current Owner governance + P04 recon | sections 2.4, 33.4, 35 |
| Q — navigation | `VERIFIED CURRENT CODE` P03 + `P04A FORWARD ASSUMPTION` retained UI | `BLOCKS WAVE 6 ONLY`; reuse Locate/camera trail, await coordinator | accepted Unity/P04 recon | section 20 |
| R — Wrap/Post boundary | `SUPPORTED DESIGN LAW` + `VERIFIED CURRENT CODE` | `BINDING ACCEPTANCE`; no former Stage/P06 controls | Package 05 + accepted TS | sections 24, 27 J/K/P |
| S — save hypothesis | `INFERENCE`, strongly supported | `NOT A P05 MIGRATION BLOCKER`; final version awaits P04 | accepted TS/P04 forward | section 23/Wave 0 |
| T — test targets | `VERIFIED CURRENT CODE` existing families + `OPEN IMPLEMENTATION QUESTION` new files | `BLOCKS ACCEPTANCE`, not recon; hostile gaps are enumerated | accepted tests + Package 05 | sections 26–27 |
| U — implementation waves | `INFERENCE` | `CONTROLLING BUILDER PLAN`; corrected for three scenery defects/existing projection | this recon under Owner brief | section 28 |
| V — file ownership | `INFERENCE` | `BLOCKS PARALLEL WORK` until Fable assigns collision owners | architecture + repository evidence | section 30 |
| W — do-not-touch | `VERIFIED CURRENT CODE` + `SUPPORTED DESIGN LAW`, qualified | `BINDING SCOPE`; preserve Core laws, materially refactor Stage proof owners only where listed | accepted baselines + Package 05 | section 29 |
| X — refutation questions | `VERIFIED CURRENT CODE` for answered baseline facts + `OPEN IMPLEMENTATION QUESTION` for bounded post-P04 seams | `NOT A RECON BLOCKER`; answers are encoded in controlling sections/open table | all inspected authority | sections 33.5–35 |

## 34. Builder handoff

### 34.1 Provisional go/no-go

**PROVISIONAL READY**, contingent on Wave 0 and the r2 refresh. Fable may use this document to assign
post-refresh lanes and implementation order. Fable may not treat dirty P04 code, preliminary seed
copy, Stage 7 proof behavior, or current singular location DTOs as final architecture.

### 34.2 Builder gates

Before implementation:

1. final P04 Owner-accepted SHAs and changed paths are available;
2. this same document is refreshed to r2;
3. canonical TypeScript tests collect and execute;
4. clean implementation branches/worktrees exist;
5. collision files have one named owner;
6. exact protocol/save/UI/input/Back/memo seams are pinned.

Before Unity world work:

1. all three scenery defects are fixed/tested;
2. the closed existing Production projection is green;
3. generated DTO/schema parity is green;
4. current-holder precedence is represented in TypeScript Stage rows.

Before retained workspace polish:

1. two exact Stage controllers work independently;
2. Rehearsal is distinct;
3. immediate reuse paints the new holder;
4. six management-distance states have objective evidence;
5. decoration-zero and neutral-profile fallbacks work.

### 34.3 Absolute no-go boundaries

Do not implement a second Production simulation/store/projection root, Unity phase/location/blocker
rules, generic progress percent, title/position joins, fake Stage/route/holder, current manual scenery
Clear, active Production cancel UI, `/productionQuote`, Post controls, Watch Shoot, performed-week
scheduler, camera pose stack, parallel UI host/input/Back/memo system, new save fields for UI
convenience, renderer/DOTS/Addressables migration, or dependency upgrades disguised as P05 work.

### 34.4 Expected acceptance statement

P05A is ready for Owner playtest when a first-time player can remain at ordinary management zoom and
truthfully say:

> “Night Harbor is rehearsing on this exact Stage. Now its scenery is travelling from that exact
> shop. They are Shooting now. The other picture is waiting because of this exact resource. Night
> Harbor wrapped; the Stage is released, and Post is next.”

That statement must remain true with two same-title Productions, reversed Stage allocation,
decorative density zero, a missing world body, stale Locate, save/reconnect, immediate Stage reuse,
and hostile duplicate cross-Stage identity inputs failing closed.

## 35. POST-P04A OWNER-ACCEPTED REFRESH REQUIRED

This refresh updates **this same file only** and is **CHANGED-PATH-ONLY**. Do not restart broad
archaeology, redo comparator research, bless dirty worktrees, or create another recon.

Recheck and record:

- final accepted TypeScript SHA;
- final accepted Unity SHA;
- protocol/projection version and schema identity;
- generated DTO parity and exact changed fields;
- final Save version/migrations;
- quote/intent/command shape and current Production intent exposure;
- canonical Queue/Facility/Set remedy-owner routes and any owner-published opaque intents;
- UI Toolkit host, route lifetime, tokens, responsive bands, contained scroll, focus/test hooks;
- Global/World/Camera/UI Input contexts and UI-capture/controller behavior;
- retained workspace context and Back coordinator, proving camera pose remains in the accepted trail;
- semantic memo ownership/fallback;
- Casting-to-Production handoff and all-active tracking impact;
- semantic world-owner/Locate resolver and stale-target behavior;
- art/profile resolver availability;
- accepted scene/authoring/profile paths that affect N-Stage registry and era-neutral fallback;
- camera/input/selection/bridge/schema/session/generated/workspace changed paths;
- canonical TS, bridge, browser, Unity EditMode/PlayMode, continuity, and proof results.

Before declaring r2 final, perform a whole-document closure sweep. Every occurrence of
`P04A FORWARD ASSUMPTION`, `PENDING`, dirty-worktree status, provisional class/path name, open P04
question, provisional viewport band, save/projection/schema placeholder, and recon validation
limitation must be replaced by accepted evidence, explicitly retained as a resolved historical note,
or escalated as a named final blocker. Remove/rewrite stale r1 instructions rather than appending a
contradictory final section.

Stop and replan if final P04 materially changes the authority boundary, duplicates camera pose,
omits required UI/input/Back/memo ownership, changes the generated contract incompatibly, or creates
a same-level conflict with Package 05 product law. Record any genuine conflict rather than choosing
silently.

After the refresh, change the revision in this same document from:

```text
P05A-RECON-r1-PROVISIONAL
```

to:

```text
P05A-RECON-r2-FINAL
```

and replace the state with the exact final accepted P04 authority record. Do not create a second
reconnaissance document.
