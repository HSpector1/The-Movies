# CODEX Production, Soundstages & Shooting — Package 05 Builder Annex

## Fable implementation handoff

- **Design authority:** [Package 05 design report](./CODEX-PRODUCTION-SHOOTING-PACKAGE-05.md)
- **TypeScript/browser baseline:** `c902a704eb948cc576083d0973c8c23e59937dc1`
- **Sealed Unity baseline inspected:** `911e87e6aeed6e185ccf6a8d77aff9ec455b404f`
- **Package 02 Builder Annex authority:** `f571a1d867b608a4a841773fc78eb6ed11696bb6`
- **Audit date:** 24 August 2026
- **Production code authorized:** none

This annex is a look-here-before-building contract. Package 05 wins if the two documents differ.
TypeScript remains sole authority for production, phase, progress, assignment, reservations, Sets,
scenery, blockers, time, money, RNG, outcome and saves. Unity owns presentation, input and dispatch
of current opaque intents.

---

# A. Comparator reference atlas

Each card names the precise interaction worth inspecting. `COPY PRINCIPLE` never means copy art,
layout skin or undocumented rules.

## A1. The living film company — *The Movies*

- **Source:** [official English manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040),
  printed pp. 6–8, 12 and 39; Prima guide printed pp. 42–43,
  [archive record](https://archive.org/details/The_Movies_Prima_Official_eGuide); local
  `/Users/bruce/Desktop/big swing art/movies manual_english.pdf`.
- **Exact interaction:** movie cards change from script → ready → camera/filming → film can; clicking
  a movie card during shooting jumps to its current set. Cast and crew travel to physical sets and
  visibly film.
- **Fable should inspect:** the camera-state movie icon, active-set jump, people gathering around the
  actual set, and the unmistakable contrast between idle and filming.
- **COPY PRINCIPLE:** a project must become visible occupation and activity at a real place; its
  persistent identity must route to that place.
- **DO NOT COPY:** token dragging, generic information-bubble stacks, scene-by-scene person hauling,
  or direct camera travel on ordinary selection.
- **Project: Studio translation:** exact Production row → explicit Locate; exact Stage state driven
  from reservations/theater; named company driven from presence.

## A2. Rehearsal, set schedule and contention — *The Movies* Prima guide

- **Source:** local `The_Movies_Prima_Official_eGuide.pdf`, printed pp. 41–43;
  [archive record](https://archive.org/details/The_Movies_Prima_Official_eGuide).
- **Exact interaction:** after roles fill, rehearsal runs automatically. Right-clicking the
  rehearsing script exposes the shooting schedule and at least its first two scheduled scenes/sets.
  During shooting the company moves to each set; a second picture needing the same set waits under a
  first-claim rule.
- **Fable should inspect:** the schedule as preparation information, the company physically changing
  location, and the way a set conflict stops one picture.
- **COPY PRINCIPLE:** show upcoming/current physical requirement early enough to plan; contention
  must be visible at both the waiting picture and held resource.
- **DO NOT COPY:** first-come opacity, manual set repair during every break, or a scene list Project:
  Studio does not model.
- **Project: Studio translation:** phase rail + current/next location; `studioQueueView` supplies
  wait/need/holder/remedy and exact return estimates.

## A3. Active-set inspection versus creative editor — *The Movies*

- **Source:** [official manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040),
  printed p. 39; Advanced Movie Maker pp. 24–28.
- **Exact interaction:** double-click idle set = fly-by; double-click filming set = director's view
  with scene slider/backdrop changes. AMM is the separate full authoring path.
- **Fable should inspect:** why close inspection is desirable and why overload of double-click is
  risky.
- **COPY PRINCIPLE:** an active shoot deserves an explicit close observation affordance.
- **DO NOT COPY:** changing production content from ordinary inspection, or binding cinematic mode
  to Package 02 double-select.
- **Project: Studio translation:** P05A uses Focus. A later named `Watch Shoot` mode is escapable,
  presentation-only and has no scene controls.

## A4. Visible backstage logistics — *Parkitect*

- **Source:** [Parkitect Steam page](https://store.steampowered.com/app/453090/Parkitect/?l=english),
  **About This Game → Management matters**.
- **Exact interaction:** the official page states that resources are routed to shops and staff
  areas should be kept out of guests' view. Visible service-edge motion as causal explanation is a
  Project: Studio inference from that shipped logistics premise, not a claim made by this page.
- **Fable should inspect:** public frontage versus service edge and how the resource-routing premise
  can be acknowledged in-world without constant modal UI.
- **COPY PRINCIPLE:** show the origin, route and destination of a spatial supply dependency.
- **DO NOT COPY:** shop inventory, concealed staff-area gameplay, or manual hauling.
- **Project: Studio translation:** Scenery Shop → service route → exact bound Stage, with the current
  TypeScript-derived duration and a non-authoritative service vehicle.

## A5. Autonomous worker prerequisites — *Planet Zoo*

- **Source:** [official Staff & Guests guide](https://www.planetzoogame.com/help-centre/player-guides/staff-and-guests),
  **Types of Staff** and **Staff Work Zones**.
- **Exact interaction:** worker role descriptions name duties and required rooms; work zones bound
  autonomous service to selected facilities and can be managed centrally or from an individual.
- **Fable should inspect:** role → duty → required place chain and the two-way local/overview route.
- **COPY PRINCIPLE:** say what a person is doing, where, and which prerequisite is missing.
- **DO NOT COPY:** a production-zone editor, dozens of staff professions, or manual individual task
  queues in P05A.
- **Project: Studio translation:** exact production credit + `studioPresence` site/beat/block reason;
  ordinary crew remains autonomous/decorative.

## A6. Local operation and explicit remedy/camera — *Planet Zoo*

- **Source:** [official Building Your Zoo guide](https://www.planetzoogame.com/help-centre/player-guides/building-your-zoo),
  **Maintaining Facilities** and **Habitat Webcams**.
- **Exact interaction:** facility info panel can `Call Mechanic`; webcam info panel can explicitly
  `Enter Camera View`.
- **Fable should inspect:** one selected-object panel holding current status, a focused remedy and a
  separately named camera action.
- **COPY PRINCIPLE:** local diagnosis/action lives with the selected object; special viewing is
  explicit.
- **DO NOT COPY:** summon mechanics for every production hold, surveillance framing, or camera mode
  as selection side effect.
- **Project: Studio translation:** Stage inspector owns current operation; `Focus Stage` now and
  later `Watch Shoot` only when exact state permits.

## A7. Phase object and assigned team — *Software Inc.*

- **Source:** [developer post, Fifth update](https://softwareinc.coredumping.com/fifth-update-gui-and-game-mechanic-details/),
  **Development cycle**, paragraphs 1–4. This is a first-party historical developer post and a
  pattern reference; it is not verification of the current-release UI. Manually confirm current
  visuals before copying presentation details.
- **Exact interaction:** each project phase is a small right-side work item showing progress while
  its assigned team works; phase promotion and skipping delay carry consequences.
- **Fable should inspect:** persistent project identity, phase label, assigned team, progress and a
  distinct decision gate.
- **COPY PRINCIPLE:** keep a long-running project addressable and show who owns the current work.
- **DO NOT COPY:** progress-bar minigames, unsupported precision, or generic software workflow.
- **Project: Studio translation:** phase rail + current state + company/location + honest weeks;
  decisions appear only when TypeScript publishes them.

## A8. Portfolio → operation → exact issue — *Planet Coaster 2*

- **Source:** [official management deep dive](https://www.planetcoaster.com/en-US/news/2024-09-25/deep-dive-mastering-management),
  **Masterful Management Menus**, **Data Driven Decisions**, **Operational Efficiency**.
- **Exact interaction:** top-level lists expose attraction/shop status and staff scheduling;
  notification button changes with criticality; heatmaps spatialize operating conditions. The page
  does not document exact-object drilldown with retained Back.
- **Fable should inspect:** severity hierarchy, compact portfolio rows and spatial condition views.
- **COPY PRINCIPLE:** use the overview hierarchy; Project: Studio independently requires exact
  picture/place drilldown with retained Back.
- **DO NOT COPY:** many heatmaps, broad park dashboards, or color-only severity.
- **Project: Studio translation:** future portfolio composes Board/Calendar/Queue; P05A provides a
  list-capable production rail and exact Locate.

## A9. Cause → remedy language — *Two Point Campus*

- **Source:** [official community/developer article](https://community.twopointcounty.com/two-point-studios/two-point-campus/blogs/28-how-to-be-nice-to-your-students),
  **Student Health**, especially the condition/cause/room/staff/prevention paragraphs.
- **Exact interaction:** a named condition has a readable cause, immediate room/staff remedy and
  preventive preparation.
- **Fable should inspect:** information order and plain language, not the comic skin.
- **COPY PRINCIPLE:** effect first, then cause, consequence and smallest remedy.
- **DO NOT COPY:** jokey wording that hides an action or a new facility for every issue.
- **Project: Studio translation:** `Waiting on a standing set` → shooting cannot begin → Open
  Scenery Shop → build/repair/strike/wait choices exactly from `studioQueueView`.

## A10. Explicit cinematic mode — *Planet Zoo* Update 1.14

- **Source:** [official Update 1.14](https://www.planetzoogame.com/en-us/news/planet-zoo-update-114-coming-20th-june),
  **Scenic Camera Mode**, **Cinematic Route Editor**.
- **Exact interaction:** scenic/cinematic views are named camera modes with explicit paths/settings.
- **Fable should inspect:** visible mode entry and the fact that cinematic behavior is not ordinary
  object selection.
- **COPY PRINCIPLE:** special presentation camera stores a return context and has an explicit exit.
- **DO NOT COPY:** route editor, auto-flyby, or multiple cinematic modes in P05A.
- **Project: Studio translation:** defer `Watch Shoot`; keep Package 02 Focus/Back now.

## A11. Stunt risk as a production decision — *Stunts & Effects*

- **Source:** [official expansion manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf?t=1447351041),
  PDF pp. 3–5, **Stunt Difficulty**, **Likeness Rating**, **Success vs Failure**.
- **Exact interaction:** use the Star or a skilled double; trade spectacle/boost against skill,
  likeness, condition, injury and production stall.
- **Fable should inspect:** one voluntary decision with visible upside, downside and resource person.
- **COPY PRINCIPLE:** future production exceptions should be choices with evidence and consequence.
- **DO NOT COPY:** stunt subsystem, per-scene casting or injury in P05A.
- **Project: Studio translation:** reference only for a later authoritative stunt campaign.

## A12. Later-package validation — Superstar Edition review

- **Source:** [Macinplay review](https://macinplay.de/spiele-tests/macintosh-games/the-movies-superstar-edition/),
  **Alles dreht sich um den Film** and **Mikromanagement, das auch mal nervt**.
- **Exact observation:** watching the group travel through sets and shoot remains enjoyable; feeding
  actors/throwing them back on set and other repeated manual chores become tiring; scoring can feel
  opaque.
- **Fable should inspect:** the contrast between valuable visible work and low-value intervention.
- **COPY PRINCIPLE:** preserve the observed company and filmmaking spectacle.
- **DO NOT COPY:** repetitive actor care, archiving clicks or unexplained quality outcomes.
- **Project: Studio translation:** autonomous routine work plus exceptions and driver explanations.

---

# B. Existing-system reuse map

## B1. Authority warning

Current `main` is newer than the old Production Operations V1 contract. V14 adds real Sets,
distance-derived scenery transit, queue admission/fairness, the Week Theater and resource release at
wrap. Fable must inspect current source, not reimplement the older eight-week document literally.

The sealed Unity repository is currently at a later dirty worktree; all Unity references here were
inspected at exact commit `911e87e`. Do not copy current dirty CP work or mutate that repository from
this research branch.

## B2. TypeScript authority and read models

| Need | Exact current path / component | Reuse / Extend / Replace / Leave Alone | Why / builder instruction |
| --- | --- | --- | --- |
| Production identity/company/countdown/forecast | `src/core/types.ts` — `Production`, `FilmParticipants`, `Studio.activeProductions` | **REUSE / LEAVE ALONE** | Sole project/company truth. Preserve stable IDs and raw role slots. |
| Phase/countdown/capability law | `src/core/productionPhases.ts` | **REUSE / LEAVE ALONE** | One source for 8→1 phase mapping, required capabilities, successors, acquisition rank and retention. Do not table it again in Unity/UI. |
| Workflow, reservations, task, blockers/bindings | `src/core/types.ts` — Production Operations V8/V14 leaves; `src/core/operations.ts` | **REUSE / LEAVE ALONE** | Sole allocation, task transition, blocker, fairness and release law. |
| Greenlight formation | `src/core/actions.ts` — `applyGreenlightScriptProject`/formation path into `addManagedProductionWorkflow` | **REUSE / LEAVE ALONE** | Package 04 already stops here; creates exact production/workflow and current reservation atomically. |
| Shooting commands | `src/core/actions.ts` (`applyAssignShootingDirector`, `applyClearSceneryLoadIn`, `applyScheduleShootingTake`); `src/core/operations.ts` | **REUSE** | All legality remains here. Browser dispatches the authoritative typed command published by its adapter; a bridge client submits only the current emitted opaque intent ID. |
| Scenery duration / ETA truth | `src/core/sceneryLoadIn.ts` — `sceneryLoadInFor`, `SceneryLoadIn` | **REUSE; EXTEND read projection** | Already gives exact from/to/distance/weeks/elapsed/remaining/arrived. Project it; do not recompute in C#/UI. |
| Scenery automatic arrival | `src/core/tick.ts` step 0.7; `src/core/operations.ts` — `arriveDueScenery`; `src/core/sceneryLoadIn.ts` — `calledWeek` | **REUSE; SMALL EXTENSION** | Tick already clears a due blocker. Because `calledWeek` is Stage acquisition and the blocker is created later by Director call, a load-in can already be due after that tick step. Settle that edge automatically at blocker creation/same transaction; do not make arrival a click. |
| Current production decision selector | `src/core/scriptReadModel.ts` — `nextProductionOperationsDecision` | **EXTEND** | It currently emits `clearSceneryLoadIn` for every blocked load-in: illegal while current V14 transit is early and merely an acknowledgment when it is already due. Make all derivable V14 transit non-command; retain grandfathered clear. |
| Cross-system journey/attention | `src/core/firstFilmJourney.ts` — in-production branch, `commandGuidance`, stage labels | **EXTEND** | Reuse identity/phase/handoff. Correct current Rehearsal=`LOAD-IN` copy: derived transit starts only after Director call in Shooting. Then add honest structured transit waiting/weeks and Post handoff; never make it portfolio authority. |
| Presence/attendance canon | `src/core/presence.ts` — `studioPresence`, beat types and withholding | **REUSE / LEAVE ALONE** | Exact current-week named-person presentation canon; zero outcome authority/RNG consumption. |
| Plant activity canon | `src/core/studioWeekTheater.ts` — `studioWeekTheater` | **REUSE / LEAVE ALONE** | Exact hot/dark/transit/mount/strike/wrap/wait/construction subjects and 10 beats. |
| Set truth | `src/core/types.ts` — `StudioSet`; `src/core/sets.ts` | **REUSE / LEAVE ALONE** | Set identity/name/mount/status/quality/novelty/condition/genre weights, construction/repair/strike/wear. |
| Queue causes/holders/remedies | `src/core/studioQueueView.ts` — `studioQueueView` | **REUSE** | Already owns what waits/needs/occupies/relieves plus wait and free estimates. Never reproduce joins in Unity. |
| Queue admission | `src/core/productionQueue.ts`, `src/core/queueAdmission.ts` | **LEAVE ALONE** | Intent has no production/reservations until admitted; FIFO/head-of-line revalidation. |
| Current occupancy/calendar | `src/core/occupancy.ts`, `src/core/studioCalendar.ts` | **REUSE** | Exact slot owners and portfolio schedule inputs. |
| Save/migration | `src/core/save.ts` — V14 validation/migration/export/import | **LEAVE ALONE** | Sole persistence. Grandfathered in-flight workflows intentionally have `requiresSetBinding=false`. |
| Event-driven wrap/arrival | `src/core/types.ts` — `StudioEventLog`; `src/core/studioEvents.ts` producers/readers | **REUSE** | Stable seq prevents repeated cues; wrap rows are permanent. Presentation owns its cursor, never `seen` in GameState. |

## B3. Browser behavioral/reference systems

| Need | Exact path / component | Reuse / Extend / Replace / Leave Alone | Why |
| --- | --- | --- | --- |
| Production card/read boundary | `ui/src/engine/adapter.ts` — `productionBoard`, `managedProductionBoardCard`, `studioDecision` | **EXTEND** | Strong current facts/copy; add structured transit and make command legality agree with core. Do not use its current early `Clear` as final UX. |
| Deep current management surface | `ui/src/components/ProductionBoard.tsx` | **REUSE behavior / REPLACE presentation composition** | Existing card shows phase, weeks, facility, Director, bound Set, blocker, command and locked forecast. Use as behavioral oracle/data source, not final tiny white/grid surface. |
| Current white guidance memo | `ui/src/lot/LotPictureGuidanceCard.tsx`; host wiring in `ui/src/lot/StudioLotScreen.tsx` | **REPLACE AS PRIMARY / RETAIN NARROW GUIDANCE** | This is the small prose/button surface the Owner encountered. Keep its exact journey projection and legal action routing, but move Production understanding/action to Stage/Production surfaces; never clone the memo into Unity. |
| Alert/receipt/announcement grammar | `ui/src/lot/LotNextEventRail.tsx`, `ui/src/lot/snapshot/nextEvent.ts`, `ui/src/presentation/eventGrammar.ts`, `punctuate.ts`, `transientNotice.ts`; host in `StudioLotScreen.tsx` | **REUSE BEHAVIOR** | Exact receipt orientation, transient-news shelf life, stale refusal and single live-region/dedup rules already exist. Compose them with Package 02 alert→explain→Locate; do not make a second announcement owner. |
| Living Time stop/presentation | `ui/src/lot/livingTurn.ts`; time/decision wiring in `StudioLotScreen.tsx` | **REUSE; EXTEND AT SOURCE SEAM** | Existing authoritative advance and decision stop law is the browser reference. Correct the false transit decision upstream; do not special-case it in a local timer. |
| Queue management | `ui/src/components/StudioQueuePanel.tsx` plus `studioQueueBoard`/`studioQueueHolderPlaces` in adapter | **REUSE / COMPOSE** | Already renders all four queue facts and routes build/repair/strike/cancel without owning rules. |
| Set/Stage/Scenery management | `ui/src/components/SetStagePanel.tsx`, `SceneryShopPanel.tsx` | **REUSE routes / COMPOSE** | Canonical deeper owners for Set construction/condition/repair/strike. Stage inspector links; does not duplicate. |
| Lot projection DTO | `ui/src/lot/snapshot/StudioLotSnapshot.ts` — `ProductionOperationsState`, `LotWeekTheater`, `LotPresenceProjection`, stage/set rows | **EXTEND** | Existing stable IDs and fields are the browser/bridge projection seam. Add only safe structured fields. |
| Multi-stage exact selector | `ui/src/lot/snapshot/stage7Production.ts` — `stageProductionDetailContext`, Stage 7 wrapper | **REUSE** | Already parameterized to N stages and fail-closed. Keep Stage 7 wrapper for compatibility; do not fork rules. |
| Multi-stage load-in selector | `ui/src/lot/snapshot/sceneryLoadIn.ts` — `stageSceneryLoadInContext`, wrappers | **EXTEND** | Exact identity gate exists, but current blocked context assumes a `Clear` command. Add transit state/ETA and no-command branch. |
| Theater → world mapping | `ui/src/lot/snapshot/weekTheater.ts` | **REUSE with caution** | Maps exact subjects to bodies/call board/freight. `lotSceneryHauls` reconstructs display total as `remaining+1`; never treat that as authoritative total/ETA. Project exact total instead. |
| Local building operation | `ui/src/lot/buildingInspector.ts` | **EXTEND / behavioral reference** | Existing place-first stage occupancy/operation/blocker logic and fail-closed multi-command law. Compose accepted Package 02 anatomy. |
| Lot host/rendering | `ui/src/lot/StudioLotScreen.tsx` and snapshot scene consumers | **REFERENCE** | Existing mounted-world and identity behavior; Unity needs its own presentation. |

## B4. Bridge / resilience

| Need | Exact path/component | Ruling | Why |
| --- | --- | --- | --- |
| Closed projection contract | `bridge/schema/bridge-schema.ts`, generated JSON/C# DTOs | **EXTEND generated schema** | TypeScript schema is the source; regenerate rather than hand-edit C#. |
| Opaque intents/current-state validation | `bridge/session.ts` — `availableIntents`, `applyAvailableIntent`, snapshot/command | **REUSE** | Intent ID is digest/revision-bound; Unity echoes, never constructs rules. Correct transit selection upstream before intent publication. |
| Durable runtime/save/replay | `bridge/runtime-checkpoint.ts`, server/session supervisor and journal | **LEAVE ALONE** | Exact-once/restart/outage authority exists. P05 UI must reconcile, not replace it. |
| Movie #2 proof | `bridge/proof.ts`; `BRIDGE-README.md` **Movie #2 interaction** | **EXTEND proof journey** | Existing path proves exact two-picture identity/blockers, save/load, fresh-session-from-save digest equivalence and headless parity. Add P05A presentation assertions; do not call this full process-outage proof. |

P05A consumes the existing Phase M resilience machinery; it does not claim to close Phase M's
client/professional-journey gate.

## B5. Sealed Unity presentation/reference systems

Paths are under `Assets/Studio/Runtime/` at sealed commit `911e87e`.

| Need | Exact component | Reuse / Extend / Replace / Leave Alone | Why |
| --- | --- | --- | --- |
| Atomic bridge data/validation | `Data/StudioBridgeProtocol.cs`, `StudioSnapshotValidation.cs`, `StudioBridgeWireValidator.cs`, `StudioLotSnapshot.cs`, `Data/Generated/StudioBridgeDtos.Generated.cs` | **REUSE / REGENERATE DTO** | Keep closed validation and atomic snapshot bundle. Never hand-edit generated DTO. |
| Transport/reconcile/stale/exact-once | `Infrastructure/StudioBridgeClient.cs`, `StudioBridgeRuntimeContinuity.cs`, `StudioSnapshotStateCache.cs`, `StudioBridgePendingPost.cs`, `StudioRejectionRetention.cs` | **REUSE / LEAVE ALONE** | Production UI uses current opaque intent seam and current snapshot only. |
| Current Stage truth resolver | `Presentation/StudioStageProductionPresentation.cs` | **GENERALIZE, DO NOT REBUILD** | Valuable fail-closed join and states (`Withheld/Dark/LoadIn/Shooting/Waiting/Clearing`), but hard-coded `StageBuildingId="stage-a"`, one operation and no distinct Rehearsal state (Rehearsal currently falls back to Waiting). Parameterize/register exact stage body+facility and add exact Rehearsal presentation; retain Stage 7 proof. |
| Stage lighting/activity | `Presentation/StageActivityEffects.cs` | **REUSE / INSTANCE PER EXACT STAGE** | Existing beacon, interior spill, shooting lights/indicators/practicals and dark grade establish state contrast. |
| Named/decorative production roles | `Presentation/StudioProductionRolePresentation.cs` | **REUSE choreography slots; REPLACE fixture identity mapping** | `RoleForStableId` hard-codes proof Talent IDs and must not assign arbitrary productions. Existing named camera/grip/electric/PA/boom/carpenter/wardrobe assets are current-era proof content, not universal vocabulary; gate them behind a confirmed presentation profile or use neutral support silhouettes. |
| Shooting-day population | `Presentation/StudioShootingDayLotPresentation.cs` | **REUSE bounded decorative pattern** | Six crew/fourteen onlookers only while exact Shooting; stripped identity. Treat counts as budget, not staffing. |
| Stage-door crew | `Presentation/StudioStageDoorCrewPresentation.cs` | **REUSE bounded pattern** | Three decorative/nonselectable bodies only while Shooting. |
| Service vehicle | `Presentation/StudioLotDeliveryContracts.cs`, `StudioVehicleRoute.cs` | **EXTEND per-stage presentation registry / leave non-authoritative** | Current single Stage 7 vehicle drives an authored ring and derives Driving/Holding/Parked; it does not prove a source→destination path. P05A may acknowledge projected endpoints with a cosmetic route, but never claim path, inventory or outcome authority. |
| Living Time | `Presentation/StudioLivingTime.cs` | **REUSE; EXTEND only in follow-up** | 1×/2×/4× uses authoritative advance intent. `WeekFraction` can later play theater beats; no second clock. |
| Camera | `Presentation/StudioCameraDirector.cs`, `StudioInspectionTarget.cs` | **REUSE Package 02 successor** | Focus/return seams; do not create Production camera owner. `Watch Shoot` later. |
| World application | `Presentation/StudioBridgePresentation.cs` | **EXTEND registry** | Currently applies one Stage 7 controller/vehicle. Resolve exact Stage IDs and withhold on ambiguity. |
| Proof runner | Unity `StudioBridgeProofRunner` and current EditMode suites | **EXTEND** | Use for full P05A golden journey, stale/save/reconnect and N-stage isolation. |

## B6. Do-not-rebuild summary

Do not rebuild production phases, countdown, Stage/Set allocation, queue order, scenery travel,
presence, Week Theater, blockers, Set values, forecast, Living Time, save, stale rejection or exact
intents in Unity. Do not rebuild the strict N-stage selectors just because their legacy filenames
say Stage 7. Do not use `firstFilmJourney` as a multi-picture portfolio.

---

# C. Stage inspector anatomy

Use the accepted Package 02 shared building inspector and Project: Studio dossier tokens. Desktop
target width **360–420 logical px**; body copy at least **16 px equivalent**, supporting labels at
least **14 px**, primary targets at least **44×44 px**. No new white-paper style.

## C1. Fixed anatomy

```text
SOUNDSTAGE 7                                      [STATE BADGE]
Production location · [occupancy/capacity only when projected]

[Picture title, or Available]
PHASE · NOW
[six-phase rail / authoritative week notches]

STANDING SET
[Set name] · [condition / status summary]        [Open Set]

COMPANY HERE
[Director] [Lead] [+2 cast]  Present / en route / withheld

[BLOCKER CARD only when current]
Effect
Cause
Consequence
[smallest remedy / route]

[Primary current action, max one]
[Open Production] [Focus Stage]
```

Header and picture identity remain visible while the body scrolls. Never display a dash as if an
absence were a fact; omit unavailable rows or say why (`No production assigned`, `Location
withheld`).

## C2. State variants

| State | Header/state | Main “Now” | Required facts | Primary action | Deliberately absent |
| --- | --- | --- | --- | --- | --- |
| **Idle** | `AVAILABLE` / `DARK` | `No production assigned` | current standard Stage has one authoritative slot; show occupancy/capacity only when projected; standing Set if exact; next queue demand only if projected | Open Set; Open Production Queue; Focus | hard-coded universal `0/1`, company, fake progress, shooting controls |
| **Assigned** | brief event-bounded `ASSIGNED` cue, then current Rehearsal truth | `<title> assigned to <Stage>` | exact new reservation, Production and bound Set | Open Production; Focus | a persistent synthetic phase; scenery ETA; shooting effects |
| **Preparing / Rehearsal** | `REHEARSING` / `PREPARING` | `<title> · company rehearsing` | exact current Stage holder with phase `rehearsal`, matching `stage-hot` subject when available, bound Set, Director/cast presence, weeks/next `Shooting` | Open Production/Set; Focus | a `set-mounting` subject as picture work—the current subject carries no `productionId`; scenery transit before Shooting call |
| **Load-in** | `LOAD-IN` | `Scenery en route` or brief `Arrived` settlement | P05A structured projection: exact origin, destination, total/remaining weeks, bound Set, company/craft sites | navigation: Locate Scenery Shop/Stage; Open Production | any current V14 operation called `Clear`; `SHOOTING` label; a claimed simulated road path |
| **Shooting / Director not called** | `DECISION REQUIRED` | `<Director> not called` | exact task Stage, consequence/hold | current opaque `Call <Director>` | alternate Director, manual drag |
| **Shooting / ready** | `READY FOR CAMERA` | `Take not scheduled` | exact Stage/Set/company and task `ready` | current opaque `Schedule shooting take` | invented scene/time |
| **Shooting / scheduled** | `SHOOTING` | `Take scheduled` | exact company presence, Stage/Set, weeks, next milestone | Open Production; Focus | commands; quality meter |
| **Shooting / completed beat** | `SHOOTING` | `Shooting beat completed` | second-week/next wrap truth | Open Production | repeated schedule action |
| **Blocked — capacity** | `WAITING` | queue headline | what/need/holder/free estimate/remedy route | Open Queue / Locate holder | a guessed stage or direct reassignment |
| **Blocked — Set** | `WAITING FOR SET` only if this Stage is exact current subject; otherwise Stage stays idle | exact queue sentence | Set need/remedies | Open Scenery Shop | claim the production reserved this Stage when composite allocation failed |
| **Completed / clearing** | one event-bounded `CLEARING AFTER WRAP` cue only when Stage has no new holder | prior exact title from current-sequence event | wrap week, Stage released, current Set state | Open Production if still exact; Open Set | persistent historical state; former company/beacon/title when a new exact holder already owns Stage; stale commands |
| **Post handoff** | Stage returns `AVAILABLE/DARK` | no former picture | exact current occupancy only | none / queue | Post picture retained on Stage |

When a blocker has no exact Stage subject, it belongs to the Production/Queue inspector—not every
Stage of the capability.

---

# D. Production inspector anatomy

The compact Production inspector is project-first and can open from a Stage, person, event or
portfolio row. Desktop width matches the shared inspector; responsive version becomes Package 02's
bottom sheet.

```text
NIGHT HARBOR                                   [SHOOTING · HELD]
Production #… (ID never primary copy)

NOW
Scenery en route to Soundstage 7 · 1 week remaining
[six-phase rail]                         4 production weeks remain
Next: Stage ready → schedule take

COMPANY
Director  Estelle Delgado                at Soundstage 7
Lead      …                              en route
+ 4 company members                      [View all]

LOCATIONS
Stage     Soundstage 7                    [Locate]
Set       Western Street                  [Open]
Scenery   Scenery Shop                    [Locate]

EXPOSURE (only when projected)
Committed production budget  …
A hold extends payroll and overhead

[BLOCKER / CONSEQUENCE when present]

[Current legal action, max one]
[Open Production Workspace] [Locate current work]
```

Required ordering is identity → phase/now → time/next → company → locations → optional exposure →
blocker/action.
Add one compact `EXPOSURE` row after locations when current authority safely projects it: committed
budget/cost summary plus a plain schedule consequence such as `A hold extends payroll and overhead`.
Never calculate totals in presentation and never expose the locked outcome forecast here. If the
projection is absent, omit the row rather than writing `Unknown` or inventing a number.

If no one exact current location exists (for example wrapped waiting for Post), `Locate current
work` disables and the card says `No current lot location`; named related locations remain separate.

---

# E. Production workspace anatomy

## E1. Wide layout

Retain **35–45% of the lot** visibly on a typical 16:9 desktop; workspace occupies **55–65%** from
the right. Use maximum readable content width rather than stretching rows. Title 28–32 px equivalent;
phase/current status 18–22 px; body 16–18 px; supporting metadata 14–16 px. All controls 44 px high.

```text
┌ LOT (retained) ───────────────┬ PRODUCTION WORKSPACE ───────────────────────┐
│ exact camera/selection        │ NIGHT HARBOR         SHOOTING · ON HOLD     │
│ remains mounted               │ [phase rail with week notches]              │
│                               ├─────────────────────┬───────────────────────┤
│                               │ CURRENT OPERATION   │ ATTENTION / NEXT      │
│                               │ Now / place / Set   │ cause / consequence   │
│                               │ progress / schedule │ one current action    │
│                               ├─────────────────────┴───────────────────────┤
│                               │ COMPANY                                      │
│                               │ role · person · current site/state · Locate  │
│                               ├─────────────────────┬───────────────────────┤
│                               │ LOCATIONS & SET     │ FORECAST / EXPOSURE   │
│                               │ exact cross-links   │ locked Est / hold law │
└───────────────────────────────┴─────────────────────┴───────────────────────┘
```

The action/consequence block is sticky only while a current decision exists. A small production
rail above or left lists multiple exact pictures by title/phase/location/status; selection changes
workspace context, not camera.

P05A's adapter publishes that rail in ascending `productionId` order, matching the existing
production-decision tie-break. Attention is a visible per-row tag, not a client-side urgency sort;
queue service order is not reused here. A row whose location join is withheld says `Location
unavailable` and disables Locate. Same-title rows remain distinct through stable IDs and accessible
position labels.

## E2. Sections and source law

| Section | Above the fold | Expanded / More Details | Never |
| --- | --- | --- | --- |
| Header | title, phase/status, weeks, close/back | concept/genre if already safe | raw IDs as title |
| Phase rail | six phases, current notch, hold | entered events/history | scene counts |
| Current operation | Now, exact owner/location/Set, next | reservations/slot names in player language | technical capability tokens |
| Company | Director, three cast, writer/craft with current exact sites/status | full Profile links, employment/contract facts already safe | decorative crew as members |
| Blocker | effect/cause/consequence/one remedy | holders, also-missing, all current remedies | generic Fix |
| Forecast/exposure | `Est` locked expected total/critic and hold cost sentence | current committed budget facts only if safely projected | actual outcome/quality |
| Known drivers | named Set and safe locked contribution wording | public Set quality/novelty/condition/genre context | Unity formula/recomputed uplift |

## E3. Narrow / controller / 200% text

- Workspace becomes a **72–92% height bottom sheet** or near-full retained layer; no squeezed columns.
- Order: header → Now/decision → phase rail → company → locations → forecast.
- Production rail becomes a horizontal accessible selector or `Picture 1 of N` stepper.
- Blocker action remains sticky above device safe area; body scrolls independently.
- Compare/portfolio views use one column. Hover facts have visible equivalents.
- Back closes one nested Profile/Set/Queue layer before the workspace, then returns exact world.

## E4. Architecture-relevant accessibility contract

- Every Stage, Production and named person reachable through a world mesh also has a semantic
  list/roving-focus target; no tiny body, vehicle or hover is the sole route.
- Inspector/workspace focus lands on a heading whose accessible name contains identity, state and
  location (`Night Harbor — Shooting — Soundstage 7`). Close/Back restores the invoking control;
  snapshot replacement reconciles by stable ID and falls to the nearest safe heading if retired.
- Routine state changes use at most one polite, deduplicated announcement per stable event sequence.
  A current decision or rejection is concise and immediately focusable/announced; polling never
  repeats it.
- Icon, light, animation and audio cues all have text/state equivalents. Location, blocker cause,
  consequence and current action remain readable at 200% text and without color or motion.
- Tab/roving order is header → Now/decision → phase → company → locations/exposure → rail. Dynamic
  updates do not steal focus; controller target cycling uses the same semantic order.

---

# F. Blocker anatomy

## F1. Shared blocker component

```text
[severity icon + text]  PRODUCTION HOLD
Waiting on a standing set

Effect       Rehearsal cannot begin.
Cause        A stage is free, but no usable standing set is mounted there.
Consequence  This picture's countdown holds; payroll and overhead continue.
Relief       [Commission a set] [Repair …] [Strike …]
Wait         Holder expected to clear in 1 week
Location     [Open Scenery Shop] [Open Queue]
```

- Severity is icon/shape/text plus color; never color alone.
- The top two lines fit without expansion. Cause/consequence are full sentences, not tooltips.
- Show at most one recommended **current** route first; `Other remedies (N)` expands exact engine
  rows. A wait row is information, not a button.
- A remedy activation opens its canonical owner and preserves blocker origin; it does not commit
  build/repair/strike until that owner confirms using a current intent.
- If a current reason cannot be proven, show `Production details unavailable` and withhold actions.
- Label rows by semantics: **Current operation** submits authority; **Remedy route** opens the owner
  where a commitment may later be confirmed; **Navigation** only Locates/opens; **Wait** is
  noninteractive process information. Never render navigation or `Wait for …` as an opaque intent.

## F2. Exact family contracts

### Facility capacity

- **Subject:** exact `productionId`.
- **Cause:** blocker capability/target phase, supplemented by `studioQueueView.occupiedBy`.
- **Consequence:** countdown holds; other studio work continues; schedule exposure sentence.
- **Remedies:** exact wait rows and published facility-blueprint routes.
- **Locate:** holder rows may Locate their exact facility/project. The blocker itself does not name
  one unique full facility; never focus an arbitrary Stage/Post room.
- **Auto-pause:** no.

### Set unavailable

- **Subject:** exact Production; target phase.
- **Cause:** exact current queue sentence: free Stage capacity exists, but no bindable standing Set.
- **Consequence:** phase entry holds.
- **Remedies:** `repair-set`, `strike-and-mount`, Set `build-blueprint`, `wait-for-holder` exactly as
  projected.
- **Locate:** exact Set for a selected repair/strike; otherwise Scenery Shop/Queue. No Stage highlight
  without a projected stable Stage target.
- **Auto-pause:** no.

### Scenery in transit (V14 current)

- **Subject:** exact Production plus destination Stage; related source Scenery facility.
- **Cause:** `sceneryLoadInFor` exact derived trip, after P05A projects its structured result through
  adapter/schema; this full fact set is not in the current bridge DTO.
- **Consequence:** camera cannot start until arrival; countdown holds.
- **Visible facts:** source, destination, total weeks, remaining weeks, optionally distance in More
  Details. Do not use `Expected this phase` unless the projected DTO names the exact predicate. If already due when
  Director call creates the blocker, show a brief `Scenery has arrived` settlement—not `0 weeks`
  plus a button.
- **Remedy:** none. Time is the process when not due; authority settles an already-due call in the
  same transaction. `Locate Stage` and `Locate Scenery Shop` are navigation.
- **Forbidden:** `Clear scenery load-in`, manual truck target, or claim that a cosmetic vehicle path
  is the engine's route.
- **Auto-pause:** no.

### Grandfathered scenery load-in

- **Subject/cause:** exact production/task; duration explicitly unavailable under migration law.
- **Consequence:** current task waits.
- **Remedy:** exact existing `Clear scenery load-in` intent.
- **Copy:** `Legacy load-in · travel duration was not recorded` rather than a fake ETA.
- **Auto-pause:** yes while the current intent exists.

### Director dispatch

- **Subject:** exact Production/Stage/Director.
- **Cause:** task `unassigned` and exact locked Director.
- **Consequence:** production cannot call scenery/start camera.
- **Remedy:** one exact opaque `Call <Director> to <Stage>`.
- **Locate:** Director and Stage are separate named links; action itself must not move camera.
- **Auto-pause:** yes.

### Take scheduling

- **Subject:** exact Production/Stage/task `ready`.
- **Cause:** Stage/scenery ready but current take unscheduled.
- **Consequence:** Shooting week cannot advance.
- **Remedy:** one exact opaque `Schedule shooting take`.
- **Auto-pause:** yes.

### Wrapped waiting for Post

- **Subject:** exact Production; Post capacity blocker.
- **Cause/holders/remedies:** current Queue view.
- **Consequence:** Stage, Set and Scenery already released; picture waits without plant claims.
- **Locate:** Post/holder, not former Stage.
- **World treatment:** one event-bounded wrap/clearing cue at former Stage, then dark/current truth.

---

# G. Shooting presentation contract

## G1. Required P05A layers

P05A passes only if all five layers respond to the same exact Stage truth:

1. **Silhouette/state:** stage roof/beacon/doors/interior spill distinguish Dark, occupied,
   Load-in, Shooting and Clearing at management/medium scales.
2. **Company:** exact named Director and cast appear at the Stage according to `studioPresence`;
   craft appears at Scenery during Shooting.
3. **Spectacle slots:** state-specific lighting, doors, silhouettes and support choreography are
   active only under exact state. Sealed camera/slate/boom/practical assets are current-era proof
   content and enter a slot only through a confirmed presentation profile; neutral fallback omits
   named equipment rather than making 1948 universal.
4. **Support life:** bounded decorative stage-door/support crew and optional onlookers appear only
   under the relevant state and remain nonselectable/non-authoritative.
5. **UI confirmation:** hover/inspector says exact title + phase/current state and never conflicts
   with the visual layer.

If any identity join is ambiguous, affected production activity is withheld. Do not leave a hot
Stage with the wrong title or borrow Stage 7's company/vehicle to make another Stage look alive.

Apply one resolver precedence everywhere:

1. current exact Stage reservation/operation;
2. matching current exact `studioWeekTheater` and `studioPresence` subjects;
3. newest event cue only when it names the same Stage and is compatible with current occupancy;
4. neutral building.

On a missing/ambiguous join, immediately clear production-specific light, equipment, company and
vehicle state. Keep the neutral selectable Stage and say `Production details unavailable`. Never
retain a prior cue merely because new truth was withheld.

## G2. State truth table

| Authoritative/presentation truth | Beacon | Interior/occupied light | Equipment performance | Named company | Decorative support | Vehicle/freight |
| --- | ---: | ---: | ---: | --- | ---: | --- |
| Withheld | off | off/neutral | off | withhold affected join | off | parked/off |
| Stage dark | off | dark grade on inspection | off | none claimed | off | parked |
| Rehearsal | off | occupied low | rehearsal-only marks | Director + cast at projected beats | restrained optional | parked |
| V14 scenery travel | off | occupied low | load-in dressing only | Director/cast/craft at projected sites | load crew decorative | Driving/Holding from exact beat |
| Waiting | off | occupied low only if stage still held | off | waiting/none per presence | restrained | parked unless exact transit |
| Shooting scheduled/completed | on | high | on | Director + cast | on within budget | parked |
| Wrap clearing, no new holder | off | occupied low only during bounded event cue | off | no false stage attendance after release | bounded clearing cue | cosmetic clearing only |
| Same-tick Stage reallocation after wrap | new holder's current state | new holder's current state | new holder's current state | new holder only | new holder only | new holder/current route only |

## G3. Animation and sound constraints

- Animation interpolates a published beat; it never gates an intent or phase.
- The same snapshot at the same beat produces the same semantic pose/state after load.
- A missing Animator/asset degrades to static truthful bodies/state, not simulation failure.
- Stage ambience is state-driven and spatially attenuated: low preparation bustle, load-in vehicle/
  equipment, shooting crew/camera activity, quiet/dark, brief wrap punctuation.
- Decision alert and wrap cues fire once per new authoritative event/sequence, not on poll/reconcile.
- Reduced motion removes pulsing/spins and snaps Focus; every state remains legible through static
  light/shape/text.

## G4. Performed week is not P05A

Do not map `StudioLivingTimeController.WeekFraction` to beat arrays inside P05A unless Owner widens
the checkpoint. Retain truthful fixed beat/state cuts. The follow-up may use the existing
`beatsPerWeek=10` tracks; it must not create scene chronology or replay events after reconnect.

---

# H. People presence contract

## H1. Exact named roles

| Click target during production | Above-fold person inspector | Links/actions | Forbidden inference |
| --- | --- | --- | --- |
| Director | portrait/name; `Director on <title>`; phase; current site/beat; task state when exact; destination/block reason | Focus, eligible Follow, Profile, Open Production, current exact task action only from project/Stage context | competence/quality from pose; “late” from Transform |
| Lead / Antagonist / Support | portrait/name; exact role on title; phase; site/beat; availability | Focus, Follow, Profile, Open Production | one nearby stage as assignment; audition/fit changes |
| Production/Craft Lead | portrait/name; `Production/Craft on <title>`; Scenery or Post site/beat | Focus, Follow, Profile, Open Production/Open Scenery | place craft on Stage because picture shoots there |
| Writer | picture/credit; Development/Pre-production site or later company association | Profile, Open Production | Stage attendance after Development unless future authority says so |
| ordinary crew / decorative extra | no person inspector; optional generic `Production crew` noninteractive hover only if Package 02 permits decorative content | none | stable identity, headcount, assignment, availability |

## H2. Movement law

- `studioPresence` supplies `home/travel/at-site/waiting` for ten beats and exact `site/slot` when
  available.
- Production > script > casting > roster precedence is already authoritative presentation canon.
- Renderer may animate between an exact home/work anchor but may not choose a different facility.
- `blockedReason` is shown when projected; visual position is never parsed into a blocker.
- If projection withholds a person, omit the location/attendance claim and state `Work location
  unavailable`; keep independently safe identity/profile.
- If a named target's world anchor disappears while selected, preserve selection/card, disable
  Focus/Follow and do not substitute another body.

---

# I. State / edge-case matrix

| State / edge | Visible treatment | Allowed commands | Forbidden commands/effects | Camera / selection | Back/Escape |
| --- | --- | --- | --- | --- | --- |
| **Production formed** | formation receipt; Development active; Production row, 8 weeks | Open Production; explicit Locate Development; time controls | Stage lighting/assignment, shooting action | camera stays; prior Casting selection may remain until close/route | returns to exact Casting/world origin |
| **Pre-production** | Development/Production say phase, company, weeks, next Rehearsal | inspect, time, open Production | choose Stage/Set unless authority adds action | no auto-move | one layer |
| **Stage preparing/Rehearsal** | exact Stage occupied, Set named, modest activity, company presence | Focus, Open Production/Set, person select | shooting beacon/take command | selection retained through repaint | world/deep origin restored |
| **Scenery transit** | `LOAD-IN`; P05A-projected exact source/destination/total/remaining; cosmetic vehicle acknowledgment | navigation: Locate Stage/Scenery; inspect; time | any V14 Clear; schedule take; manual vehicle; path claim | camera stays unless Locate | returns one layer; transit continues |
| **Load-in arrives** | arrival beat; task becomes ready; `Schedule take` appears; decision cue once | exact schedule intent | replay arrival; auto-schedule | no camera move; Stage/Production selection persists | normal |
| **Director not called** | exact Stage/Director blocker | Call exact Director; Locate; Profile | choose substitute, drag person, advance via local fake button | no camera action on Call | normal; Living Time remains paused until resolved/player action |
| **Shooting scheduled** | hot Stage/equipment/company; task status | inspect, Focus, time | repeat schedule; manual scene control | selection persists | exits inspection/workspace only |
| **Shooting completed beat** | shoot remains active for current phase; next wrap indicated | inspect, time | second schedule button | no move | normal |
| **Capacity blocker appears** | production/queue warning; exact holder/remedy rows; stage treatment only if exact current holder | Open Queue; Locate holder; build route; wait/time | arbitrary facility focus; client reassignment | alert open no move; Locate explicit | returns to alert/production origin |
| **Set unavailable** | Production says stage capacity free/no Set; Scenery attention | Open Scenery; exact remedy routes; time | claim a reserved Stage; generic Fix | selection stays; remedy route pushes origin | returns exact blocker context |
| **Blocker resolves automatically** | current state replaces warning; one positive receipt only when useful | newly published current intent/time | keep old control; replay animation | same exact selection if entity survives | normal |
| **Person unavailable/anchor lost** | person card says not on lot/location unavailable; production unchanged unless authority says otherwise | Profile/Open Production | Focus/Follow; invent production blocker | camera stays; person selection retained | returns origin |
| **Stage conflict / queued transition** | Queue four-fact row; current exact holders remain lit | wait/build/Locate holder | manual slot drag; first array item | no camera move | returns queue origin |
| **Queued greenlight (no Production)** | queue intent, no Production/Stage/company | cancel exact queued intent; time | Production inspector, Stage allocation, committed cost | no production selection | normal |
| **Multiple productions** | every exact Stage/title isolated; rail uses projected ascending `productionId`; queue keeps its own authority order | switch picture; exact Locate | borrow Stage 7 art/truth; title matching; client severity/service re-sort | switching workspace does not move camera | restores per-picture/workspace state then lot |
| **Selected Stage during phase change** | atomically repaint same Stage; occupancy may clear or change exact holder | commands from new snapshot only | retained old command/company | Stage selection stays; Production selection invalidates if retired | closes current valid layer |
| **Selected Production during wrap** | title remains; phase/location updates; former Stage gets only compatible event cue; a same-tick new holder paints immediately | Open current Production/Post/Queue | pretend former Stage still reserved; let old clearing/title mask a new holder | production selection stays; camera stays | exact origin, no substitute |
| **Save/load mid-production** | rebuild from V14; current phase/blocker/Set/Stage exact; Living Time paused | current loaded intents only | replay Greenlight/load-in/wrap; restore local animation phase as truth | restore presentation context only when exact IDs still valid; otherwise neutral | normal loaded stack |
| **Reconnect/outage** | last safe state may display disabled with reconnect status; then atomic fresh snapshot | none until live/current | local progress/catch-up; blind retry of action | camera/selection may remain visually but controls disable | local UI may close; no authority change |
| **Stale action** | rejection names current blocker/holder/remedy; fresh snapshot replaces control | current successor intent | partial mutation; old intent replay; camera jump | selection/context retained if valid | normal |
| **Malformed/ambiguous projection** | immediately clear affected production light/equipment/company/vehicle; neutral exact place + `details unavailable` remains | safe generic place inspection | guessed or retained prior title/stage/person/action/cue | camera stays; clear invalid deep selection | closes to safe place/lot |
| **Production finished/released** | removed from active list; no active Stage/company; downstream result owner | future Release/Post routes only | stale production commands | selection invalidates to origin/neutral; no same-title substitute | returns safe prior world context |
| **Post handoff** | wrap receipt names Post as next owner; Stage released/dark | explicit Locate Post; Open Production | Post implementation inside P05A | no camera movement until Locate | returns exact Stage/Production context |
| **Narrow viewport** | bottom sheet, one column, sticky current action | same semantic actions | hidden cause/cost/time; hover-only facts | no change | same stack |
| **Reduced motion** | static state, no pulse/automatic pan, short crossfade | all actions | motion as sole meaning | Focus snaps/≤100 ms per P02; no Watch autoplay | same |
| **Controller/keyboard** | visible focus, semantic Stage/person/production cycle, deduplicated announced state | Select, Focus, Back, current actions, Locate | pointer-only vehicle/crew target; focus trap; unannounced decision | camera only explicit | pops one layer and restores invoking control |

---

# J. Golden UX journeys

Each journey is independently automatable where the harness supports it and manually provable in an
Owner build. PASS requires both authoritative and presentation checks.

## J1. Greenlight forms production

**Start:** Package 04 Greenlight Review, current legal package.

**Do:** commit once, then observe lot.

**PASS:** TypeScript creates exactly one Production/workflow/company and Development reservation;
formation receipt names title/phase/weeks; Development becomes active; no Stage/Set is claimed or lit;
camera does not move; duplicate activation does not create another picture.

## J2. Stage calls for attention at Rehearsal

**Start:** production advances from Pre-production and atomically acquires exact Stage+Set.

**Do:** leave camera elsewhere and observe management-scale lot.

**PASS:** only allocated Stage gains occupied treatment/title/Rehearsal; exact Set is named; no camera
hijack; a positive cue appears once; other stages remain truthful.

## J3. Select Stage

**Start:** active Rehearsal Stage.

**Do:** hover then single-click.

**PASS:** hover gives Stage/title/state; click opens place-first inspector without movement/mutation;
identity, Set, company, phase, weeks and next milestone are readable; no Shooting action appears.

## J4. Inspect Production

**Start:** Stage inspector open.

**Do:** `Open Production`.

**PASS:** retained lot remains mounted; project workspace shows exact phase rail/company/location/Set/
next state; Stage/camera origin is pushed; opening changes no time or state.

## J5. Focus Stage

**Start:** Stage selected off-center.

**Do:** activate Focus (or double-select same Stage).

**PASS:** safe-frame transition is interruptible, selection stays Stage, no deep screen/follow/Watch
mode opens, reduced-motion form snaps/shortens, Back restores exact prior pose.

## J6. Observe preparation and company attendance

**Start:** Rehearsal with exact presence projection.

**Do:** run 1× within current settled presentation.

**PASS:** Director and three cast use exact stable IDs/site/credit and appropriate travel/at-site
state; craft is not falsely at Stage; occupied lighting differs from Shooting; proximity never changes
assignment.

## J7. Director call

**Start:** first Shooting week, task `unassigned`.

**Do:** inspect Stage/Production, Locate Director without committing, return, then activate exact Call.

**PASS:** blocker names exact Director/Stage/consequence; Locate/Back preserves context; Call uses
the current adapter-published typed browser command or current opaque bridge intent once; task
changes to `blocked` and scenery transit begins/settles if already due; action itself does not move
camera or drag the person.

## J8. Scenery in transit

**Start:** current V14 bound production with derived trip not arrived.

**Do:** inspect Stage and let Living Time run.

**PASS:** after the structured projection extension, exact source/destination/total/remaining and
`LOAD-IN` show; vehicle/freight acknowledges those endpoints on a cosmetic presentation route that
does not claim path truth; no `Clear` intent/button is available; corrected
`firstFilmJourney.next` permits authoritative advance; camera stays; a manual vehicle click cannot
alter state.

## J9. Arrival → ready

**Start:** scenery reaches its derived due week.

**Do:** accept authoritative week transition.

**PASS:** tick step clears a blocker that was already travelling, or the Director-call transaction
settles a trip already due; exactly one arrival event is recorded; Stage changes from Load-in to
ready; Living Time pauses because current `Schedule shooting take` now exists; arrival visual/audio
is not repeated on poll; selection remains exact Stage/Production.

## J10. Blocker explanation → Locate → remedy

**Start:** controlled `set-unavailable` or `facility-capacity` state.

**Do:** open alert, inspect explanation, route to one exact remedy/holder, then Back.

**PASS:** card states subject/effect/cause/consequence and queue's wait/need/holder/remedies; no camera
move before Locate; set-unavailable does not invent a Stage; Back restores exact blocker workspace/
scroll/selection/camera; no remedy commits merely from navigation.

## J11. Shooting visibly begins

**Start:** task `ready`.

**Do:** submit exact schedule intent.

**PASS:** task becomes scheduled once; exact Stage enters Shooting visuals—beacon/spill/equipment,
named company and bounded decorative activity; idle stages stay dark; inspector says `Take
scheduled`; no scene count/quality outcome is invented.

## J12. Inspect Director and Actor

**Start:** active Shooting state.

**Do:** select exact Director, then Lead; open/close Profile; Open Production.

**PASS:** each identity/role/picture/site/phase is exact; only Director sees exact task status; no
selection commits; Profile/Production Back restores exact person and camera; decorative crew is not
selectable as named staff.

## J13. Time advances while shooting

**Start:** scheduled first Shooting week, Living Time 1× then switch 2×/4×.

**Do:** allow authoritative advances.

**PASS:** wall speed changes only cadence; first tick marks task completed and countdown advances;
second Shooting week needs no repeated schedule; visuals remain shooting/current; no Unity-side
progress changes outcome.

## J14. Another production queues/competes

**Start:** two current pictures—including a same-title fixture—one holds needed capacity/Set; one
location fixture is withheld.

**Do:** inspect waiting picture, holder and both exact Stage contexts; reverse array order fixture.

**PASS:** Queue order/holder/free estimate/remedies remain authority-correct; production rail remains
ascending by projected `productionId` and does not borrow queue/attention sorting; each Stage keeps
its exact company/Set; same-title rows remain distinct; withheld row says `Location unavailable`
and disables Locate; reversing input arrays changes no identity; waiting picture does not steal
Stage 7; other studio time continues.

## J15. Save/load and reconnect during production

**Start:** one save during transit and one during scheduled Shooting; keep an inspector selected.

**Do:** save, process restart/load, then controlled reconnect/outage.

**PASS:** V14 production/workflow/reservations/bindings/task/blocker/Set/event state restores exactly;
current projection and intents rebuild; load starts paused; no Greenlight/arrival/wrap cue replays; no
local catch-up; exact selected context restores only when IDs/anchor are still valid.

## J16. Stale production action

**Start:** ready Stage with Schedule control; mutate authority/revision first.

**Do:** submit stale intent.

**PASS:** bridge rejects without GameState/save mutation; current successor snapshot/action appears;
Stage/Production selection, camera and workspace state remain; old intent cannot replay; no visual
shooting response fires from the rejection.

## J17. Production completes and Stage releases

**Start:** second Shooting week completes.

**Do:** advance one authoritative week; run both a free-Stage branch and a branch where service law
reallocates the released Stage in that same tick.

**PASS:** wrapped event exists once; Stage, Set and Scenery reservations release before Post attempt;
when still free, beacon/equipment/company turn off and a bounded clearing cue names the exact former
title; when reacquired, the new holder's current title/state/company wins immediately and the old
wrap remains receipt-only; Production moves to Post or honest Post wait.

## J18. Post becomes next destination

**Start:** wrapped picture with Post available or blocked.

**Do:** inspect wrap receipt and invoke explicit Locate Post; then Back.

**PASS:** Stage no longer owns picture; Production says Post/current wait truth; Locate focuses exact
Post only on command; Back restores exact Stage/Production camera and selection; no Post editing UI or
actions exist in P05A.

## J19. Multiple Stage isolation

**Start:** Stage 7 plus Stage 12/placed Stage with different pictures/states.

**Do:** alternate select/focus/inspect; remove one reservation; inject one malformed duplicate join.

**PASS:** exact state/effects/vehicle/company never cross stages; removing one affects only it;
malformed affected Stage immediately clears prior production-specific visuals and withholds instead
of borrowing; the independent Stage remains usable.

## J20. Narrow/controller/reduced-motion path

**Start:** active blocker/Shooting state at narrow viewport with controller and reduced motion.

**Do:** cycle semantic Stage/person/production targets; inspect, Focus, current action, Back.

**PASS:** all facts/actions remain reachable in one-column sheet and through a semantic
mesh-independent target list; inspector focus lands on its identity/state/location heading and Back
restores the invoking control; targets meet 44×44; no hover-only cause; state is color-independent;
routine events announce politely once, decisions/rejections are immediately focusable/announced,
and polling does not repeat them; camera snaps/shortens; no motion, sound or tiny world body is
required to complete the journey.

---

# K. Fable implementation map

## REUSE

- TypeScript `Production`, workflow/reservation/task/blocker/binding, phase and countdown law.
- `sceneryLoadInFor`, automatic arrival, Set system, queue/occupancy/calendar and event ledger.
- `studioPresence` and `studioWeekTheater` as presentation canon—not outcome law.
- browser `ProductionBoard`, Queue/Set/Scenery routes and parameterized N-stage strict selectors as
  behavior/data oracles.
- bridge closed schema/generated DTO pipeline, current opaque intents, stale/exact-once/runtime/save
  machinery and Movie #2 proof.
- sealed Unity state resolver idiom, stage effects, equipment/role presentation, decorative identity,
  Living Time, camera/selection successor and proof harness.

## BUILD NEXT

**P05A — Production-from-the-Lot V1** only:

1. Small TypeScript settlement/read-model correction for current V14 scenery transit versus legacy
   clear, including automatic due-at-call settlement, structured exact transit facts and correct
   Living Time decision state.
2. Shared Package 02 Stage inspector with the state variants in §C, keyed to exact world/facility ID.
3. Compact Production inspector plus one retained Production workspace from §D–E, list-capable but
   shipping one-picture interaction depth; its rail lists all active projections deterministically.
4. Exact cross-links among Production, Stage, Set, Scenery and people; Focus/Locate/Back restoration.
5. Exact stage registry/application of the sealed visual state/equipment/company contract; preserve
   Stage 7 proof and prevent cross-stage borrowing.
6. Alerts/blocker cards that compose `studioQueueView` and current intent consequences.
7. Era-profile-ready spectacle slots with neutral light/doors/silhouettes/freight fallback; no
   universal 1948 prop vocabulary.
8. Automated/manual proof J1–J20 in the bounded Greenlight-to-Post-handoff path, including mandatory
   two-Production/two-Stage projection and visual-isolation regression coverage.

Stop at Post ownership. No Post workspace/editing.

## EXTEND

- `src/core/scriptReadModel.ts`, `firstFilmJourney.ts` and `ui/src/engine/adapter.ts` for legal transit
  waiting, ETA and next-action truth.
- Lot/bridge schema projection with structured load-in, Set/Stage links and required inspector facts;
  regenerate artifacts.
- browser strict scenery selector with no-command V14 transit branch.
- accepted Package 02 Unity inspector/origin-stack components with Stage/Production content.
- `StudioStageProductionPresentation`/`StudioBridgePresentation` from one hard-coded Stage 7 owner to
  a strict exact-stage registry, an exact Rehearsal state and current-truth-first cue resolver.
- proof fixtures for two stages, wait/release, stale, save/load/reconnect and malformed withholding.

## DO NOT REBUILD

- production state machine, phase/countdown, allocator, queue, Set/scenery mechanics, company,
  presence, progress, blockers, costs, forecast, quality, time, RNG or saves in Unity;
- C# formulas for distance/ETA/progress/holder/remedy;
- a second selection/camera/Back/Living Time system;
- Stage 7 selector logic under a new name;
- a permanent camera/slate/boom/vehicle vocabulary without a confirmed era presentation profile;
- a generic memo as Production UI;
- decorative crew as staffing truth; or
- a special one-picture architecture.

## DEFER

- performed-week beat playback;
- `Watch Shoot`/cinematic inspection and audio asset campaign;
- automation policy change for unconditional Director/take gates;
- full studio portfolio/production priority scheduling;
- general travel/path outcome, storage, equipment inventories;
- multi-location/units, scenes/call sheets/dailies/reshoots;
- stunts/doubles/injury/effects;
- Post Production and release; and
- era-specific production equipment/workflow content.

## OWNER DECISIONS REQUIRED

**None before P05A, once Package 05 is accepted.**

Two later choices are deliberately visible rather than buried in implementation: whether the
current one-option Director-call/take-schedule approvals should remain player stops, and whether a
performed-week/Watch Shoot presentation campaign earns its own checkpoint. P05A should collect
playtest evidence; it should not decide either by adding local automation or cinematic scope.

## Hostile acceptance stop list

P05A fails if any of the following is true:

- Greenlight implies a Stage/Set before exact Rehearsal allocation;
- current V14 scenery transit shows a `Clear` acknowledgment, freezes Living Time behind an action
  guaranteed to reject, or waits an extra week when already due at Director call;
- a Stage/Set/Production stable ID is collapsed or matched by title/array position;
- Stage 12/placed Stage borrows Stage 7 truth/art/vehicle/company;
- production rows reorder by client severity/queue law, collapse same-title IDs, or offer Locate for
  a withheld location;
- a capacity or Set blocker lacks subject, cause, consequence and a current route/remedy;
- a Set-unavailable blocker focuses an unowned Stage;
- Shooting is not visibly distinct from idle at management, medium and close scale;
- visual positions determine attendance, assignments or blockers;
- an old wrap/clearing cue masks a same-tick new Stage holder or survives an ambiguous current join;
- decorative bodies imply exact staff counts or become selectable staff;
- current-era camera/slate/boom/vehicle content is treated as universal without a confirmed profile
  or neutral fallback;
- UI invents scenes, shots, percentages, quality or predicted outcomes;
- selection, formation, alert or phase changes move camera automatically;
- Back loses the invoking Stage/person/project, workspace state or camera pose;
- save/reconnect replays false arrival/wrap/shooting events or advances locally;
- a stale intent produces partial visual/authoritative success;
- desktop body text falls below 16 px equivalent, primary targets below 44×44, or narrow layout
  hides the current cause/consequence/action; or
- a world target/action lacks a semantic keyboard/controller equivalent, a decision changes without
  accessible focus/announcement, or polling repeats announcements; or
- implementation crosses the Post handoff boundary.

It passes when the Owner can Greenlight, remain on the lot, watch the exact company and plant carry
the picture through current phases, understand every hold from its physical context, take only
current legal actions, see unmistakable Shooting, survive two-picture/save/reconnect/stale cases,
observe wrap release the Stage, and explicitly Locate Post—without once depending on the generic
white memo.
