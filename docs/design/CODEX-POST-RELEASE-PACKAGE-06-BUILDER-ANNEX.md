# CODEX Post-Production & Release Preparation — Package 06 Builder Annex

## Fable implementation handoff

- **Design authority:** [Package 06 design report](./CODEX-POST-RELEASE-PACKAGE-06.md)
- **TypeScript/browser baseline:** `c902a704eb948cc576083d0973c8c23e59937dc1`
- **Sealed Unity baseline inspected:** `911e87e6aeed6e185ccf6a8d77aff9ec455b404f`
- **Package 02 Builder Annex authority:** `f571a1d867b608a4a841773fc78eb6ed11696bb6`
- **Package 03 authority:** `2d285e51116cbdce22c115928fe0d2b6af6cf650`
- **Package 04 authority:** `ddc4976cd7c947ba513917e6311a697ad4ea6934`
- **Package 05 authority:** `d5653327c17709daea5e17ba00ce164678b9ad43`
- **Audit date:** 24 August 2026
- **Production code authorized:** none

This is the look-here-before-building contract. Read Package 06 first for the rulings, then use this
annex for repository entry points, component anatomy, edge behavior and acceptance. Do not infer
rules from copy or Unity animation. TypeScript owns state, capacity, time, costs, forecast,
legality, release, RNG and saves. Unity owns layout, world acknowledgment, input, camera and dispatch
of current opaque intents.

---

# A. Comparator reference atlas

Each entry names the exact interaction worth inspecting. **COPY PRINCIPLE** never means copy art,
historical dollar values, platform-specific terminology, or unsupported mechanics.

## A1. The finished picture changes physical owner — *The Movies*

- **Game/source:** *The Movies* Prima Official eGuide.
- **Exact reference:** printed p. 43; [Internet Archive record](https://archive.org/details/The_Movies_Prima_Official_eGuide);
  local `/Users/bruce/Desktop/big swing art/The_Movies_Prima_Official_eGuide.pdf`.
- **Exact interaction:** after the final scene, the film icon automatically moves to the Production
  Office yard. It is now available for publicity or release.
- **Fable should inspect:** the strong state punctuation—people stop using sets, the artifact's icon
  changes, and its spatial owner changes without another instruction.
- **COPY PRINCIPLE:** one stable movie identity physically transfers to its next department.
- **DO NOT COPY:** draggable film can, tiny card as the only explanation, or automatic camera travel.
- **Project: Studio translation:** wrap receipt + Stage release + exact title at Production / Post +
  explicit Locate; no player `Send to Post` action.

## A2. Production Office as a terminal department — *The Movies*

- **Game/source:** Prima printed p. 17; [official English manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040),
  printed pp. 12 and 16.
- **Exact interaction:** Finance, Reviews, Archive, Movie Player and Release/Release Budget are
  distinct rooms inside one named building.
- **Fable should inspect:** the building clearly owns the picture's terminal lifecycle, while each
  function remains conceptually separate.
- **COPY PRINCIPLE:** give the terminal film state one obvious world owner and separate preview,
  decision, result and history.
- **DO NOT COPY:** six interior click targets, memorized room geography, or a second building that
  duplicates current `Production / Post`.
- **Project: Studio translation:** selected Production / Post inspector → exact picture → retained
  review; Theater owns only the post-release public presence.

## A3. Preview is not commitment — *The Movies*

- **Game/source:** [official manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040),
  printed p. 12, **Making a Movie** completion/release paragraph.
- **Exact interaction:** Movie Player can show the completed picture before the player uses Release;
  release screens then show costs/Star consequences and Reviews follow.
- **Fable should inspect:** preview, Release and result are three distinct acts.
- **COPY PRINCIPLE:** inspection/review is inert; commitment is explicit; outcome follows.
- **DO NOT COPY:** claim that preview supplies a reliable quality forecast, or require preview.
- **Project: Studio translation:** opening Release Readiness Review mutates nothing; only `Commit
  <title> to Release` submits an intent. A future movie preview remains optional.

## A4. Ordinary Post and creator editing are different — *The Movies*

- **Game/source:** [official manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040),
  printed pp. 23–28, **Advanced Movie-Making & Post Production**; Prima printed pp. 17 and 116–117.
- **Exact interaction:** the authoring path can reorder/delete/split scenes and add dialogue, music,
  sound effects, subtitles, fades and titles, then export. Prima states these changes do not improve
  campaign Movie Quality, Success or Final Movie Rating.
- **Fable should inspect:** rich creative timeline and explicit Export as a different fantasy from
  ordinary studio progression.
- **COPY PRINCIPLE:** an optional creator mode may offer deep expressive control without becoming a
  mandatory quality tax.
- **DO NOT COPY:** timeline, edit points, audio tracks, export settings or “Post adds quality” in
  P06A.
- **Project: Studio translation:** ordinary Post is autonomous capacity. Creator mode is a separate
  future product lane with its own authority contract.

## A5. Publicity and release spend are distinct — *The Movies*

- **Game/source:** official manual printed p. 12; Prima printed pp. 18 and 43–45.
- **Exact interaction:** the separate Publicity Office builds awareness. Its existence changes the
  Production Office's Release room into Release Budget, where historical spend tiers are chosen.
- **Fable should inspect:** promotion before release and explicit spend at commitment are separate
  causal ideas.
- **COPY PRINCIPLE:** clearly state whether money improves awareness, reach or the film itself, and
  show when it is committed.
- **DO NOT COPY:** historical dollar tiers, hidden thresholds, or a second marketing choice after
  Project: Studio already charged marketing at Greenlight.
- **Project: Studio translation:** read-only `Marketing committed at Greenlight`; optional current
  studio-awareness/Publicity route to Administration; no Post slider.

## A6. Later-package usability warning — Superstar Edition

- **Game/source:** [Macinplay Superstar Edition review](https://macinplay.de/spiele-tests/macintosh-games/the-movies-superstar-edition/),
  sections **Alles dreht sich um den Film**, **Mikromanagement, das auch mal nervt**, and **Fazit**.
- **Exact observation:** the visible process and authored movie tools remain attractive, while
  repeated Star care, manual archive cleanup and opaque scoring are criticized.
- **Fable should inspect:** the contrast between valuable visible work and low-value maintenance.
- **COPY PRINCIPLE:** show the craft and explain consequences.
- **DO NOT COPY:** manual archive, weekly finishing acknowledgments, or unexplained rating alchemy.
- **Project: Studio translation:** autonomous Post + exact state + automatic `FilmResult` history +
  Film Chronicle when a frozen record exists + honest forecast provenance.

## A7. Bounded project autonomy — *Software Inc.*

- **Game/source:** [first-party “Thirteenth update – Demo update”](https://softwareinc.coredumping.com/thirteenth-update-demo-update/),
  paragraph beginning **“One of the abilities is for leaders…”**. Historical developer post;
  direct automated retrieval may be restricted and current-release UI is not asserted.
- **Exact interaction:** leaders can autonomously progress and release development work under set
  parameters.
- **Fable should inspect:** autonomy is bounded by policy/state, so the player manages the system
  rather than clicking every phase.
- **COPY PRINCIPLE:** routine technical work proceeds without weekly ceremony.
- **DO NOT COPY:** autonomous release of the player's hero picture or software-team semantics.
- **Project: Studio translation:** Post advances autonomously; Release Ready remains player-owned.

## A8. Readiness and public release are different states — Steamworks

- **Source type:** adjacent release-governance reference, not a game comparator.
- **Exact URL/sections:** [Steamworks Release Options](https://partner.steamgames.com/doc/store/types),
  **Review**, **Coming Soon**, **Full Release**, **Pre-Purchase**.
- **Exact interaction:** product readiness/review, public presence and full release are separately
  named lifecycle states.
- **Fable should inspect:** labels never make “ready” synonymous with “already public.”
- **COPY PRINCIPLE:** keep Post complete, Release Ready, Released, In Theaters and History distinct.
- **DO NOT COPY:** storefront submission, wishlist, pre-purchase or Valve review law.
- **Project: Studio translation:** Release Ready/Committed use no Post reservation but stay owned by
  Production / Post; Theater changes only when the next authoritative week appends `FilmResult` or
  opens a run.

## A9. Explicit manual release — App Store Connect

- **Source type:** adjacent release-governance reference.
- **Exact URL/section:** [Select an app version release option](https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/select-an-app-store-version-release-option/),
  **Manually release a version**.
- **Exact interaction:** a reviewed/ready version can be held, then the authorized user chooses
  `Release This Version` and confirms.
- **Fable should inspect:** readiness persists safely; the final action is named; confirmation is
  separate from browsing.
- **COPY PRINCIPLE:** explicit title, state and commitment before publish.
- **DO NOT COPY:** platform propagation delays, role permissions or app-store vocabulary.
- **Project: Studio translation:** Release Review → `Commit <title> to Release` → title-bearing
  confirmation → stale-safe authoritative receipt. Project: Studio's irreversible commitment is its
  own simulation law; Apple also documents cancellation during its platform workflow.

## A10. Publish overview and controlled commitment — Google Play Console

- **Source type:** adjacent release-governance reference.
- **Exact URL/sections:** [Control when app changes are published](https://support.google.com/googleplay/android-developer/answer/9859654?hl=en),
  **See an overview of your changes**, **Send changes for review**, **Use managed publishing**, and
  **Publish your app update**.
- **Exact interaction:** one overview groups pending changes and states; managed publishing holds
  approved changes until an explicit Publish action.
- **Fable should inspect:** overview → exact item/state → explicit commit; canceling inspection does
  not mutate.
- **COPY PRINCIPLE:** aggregate readiness scales to several objects while preserving exact identity.
- **DO NOT COPY:** batch unrelated movies into one release or copy platform review steps.
- **Project: Studio translation:** Post workspace has a stable picture rail; each Release action is
  exact and independent.

## A11. Durable submission history — Google Play Console

- **Source type:** adjacent history reference.
- **Exact URL/sections:** [About your submission activity](https://support.google.com/googleplay/android-developer/answer/17118609?hl=en),
  **Track your submission status** and **Review submission details**.
- **Exact interaction:** published items retain stable state, timestamps and detail after leaving the
  active queue.
- **Fable should inspect:** active work and immutable history are different surfaces over stable
  identity.
- **COPY PRINCIPLE:** release automatically creates a durable inspectable record.
- **DO NOT COPY:** administrative audit-log density as the film library UI.
- **Project: Studio translation:** `FilmResult` is automatic history; Film Chronicle renders the
  frozen record when available; no Archive chore or new core phase.

## A12. Release learning follows release — *Game Dev Tycoon*

- **Game/source:** [Greenheart Games, Steam release announcement](https://www.greenheartgames.com/2013/08/22/game-dev-tycoon-is-coming-to-steam-on-august-29th/),
  feature bullets for rebalanced Reviews and post-release reports/expertise.
- **Exact evidence:** the official post separately lists a rebalanced review system,
  post-release reports/company expertise intended to provide feedback, and renaming before release.
  Treating those as a before/after learning split is the Project: Studio inference; this source does
  not document the exact UI.
- **Fable should inspect:** final readiness evidence and post-release learning are separated.
- **COPY PRINCIPLE:** Package 06 prepares/commits; Package 07 teaches from actual response.
- **DO NOT COPY:** instant review-number theatrics, topic/genre hidden tables or game-development
  scoring.
- **Project: Studio translation:** Release Review exposes only safe outlook; accepted commitment is
  the P06 boundary; the next-week release hands off to existing result authority without Package 06
  interpreting it.

## A13. Local department operation — *Planet Zoo*

- **Game/source:** [official Building Your Zoo guide](https://www.planetzoogame.com/help-centre/player-guides/building-your-zoo),
  **Maintaining Facilities**; [official Staff & Guests guide](https://www.planetzoogame.com/help-centre/player-guides/staff-and-guests),
  **Types of Staff** and **Staff Work Zones**.
- **Exact interaction:** selected facilities expose status/remedy; staff duties name required
  facilities; work proceeds autonomously.
- **Fable should inspect:** the local place explains what is operating and which staff/facility fact
  is relevant without becoming the whole management screen.
- **COPY PRINCIPLE:** local status + exact owner + narrow route.
- **DO NOT COPY:** work-zone configuration, mechanic summons or zoo facility taxonomy.
- **Project: Studio translation:** Production / Post inspector shows capacity, exact pictures,
  Director/craft presence, ETA/blocker and `Open picture`.

## A14. Stunt result versus authoring control — *Stunts & Effects*

- **Game/source:** [official *Stunts & Effects* manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf?t=1447351041),
  PDF pp. 4–6 / printed pp. 6–11, especially **Stunt Difficulty**, **Likeness Rating**, **Success vs.
  Failure**, **Movie Rating**, and **FreeCam Mode**.
- **Exact interaction:** stunt difficulty/success/condition/skill/likeness can affect overall film
  rating; FreeCam/effects are separate AMM authoring tools.
- **Fable should inspect:** the manual explicitly distinguishes production performance inputs from
  creative camera controls.
- **COPY PRINCIPLE:** a future final assessment may explain real authoritative production drivers.
- **DO NOT COPY:** stunt law, FreeCam, effects editing or an implied FreeCam quality bonus in P06A.
- **Project: Studio translation:** P06A shows no stunt/effects driver because current authority has
  none; creator controls remain a separate future lane.

---

# B. Existing-system reuse map

## B1. Authority and known gap

At baseline, `releaseReady` is one countdown week: the next normal tick decrements it to zero,
resolves reception, appends `FilmResult`, removes the production and optionally opens a theatrical
run. There is no explicit Release intent. P06A must **extend authority**, not fake a UI gate over
continued auto-release. The bounded design is a persisted commitment gate: uncommitted ready
pictures remain at tick 1; committing advances no time; the next studio week admits only committed
ready pictures to the current ID-sorted batch. This requires a state/save migration plus coordinated
changes in `operations.ts`, `tick.ts`, actions and decision selectors—not a dispatch wrapper.

Current browser presentation also maps `releaseReady` to the Theater/release desk. Package 06 rules
that unreleased identity remains with Production / Post. This mapping is presentation/read-model
behavior to replace; the Theater remains the released/now-showing owner.

## B2. TypeScript authority

| Need | Exact current Project: Studio path/component | Reuse / Extend / Replace / Leave Alone | Why / builder instruction |
| --- | --- | --- | --- |
| Picture identity, participants, budget, forecast, countdown | `src/core/types.ts` — `Production`, `FilmParticipants`, `Budget`, `Forecast` | **REUSE / LEAVE ALONE** | Sole active-picture identity and committed facts. Never reconstruct from labels. |
| Released picture/history/run data | `src/core/types.ts` — `FilmResult`, `TheatricalRun`, `Studio.releasedFilms` | **REUSE / LEAVE ALONE** | Durable released identity and downstream truth. P06 presents only handoff/history boundary. |
| Phase/capability law | `src/core/productionPhases.ts` | **REUSE; EXTEND release-boundary contract** | `postProduction` = remainingTicks 3/2 + exact `post`; `releaseReady` = tick 1 + no facility. Commitment is a persisted state on ready, not an invented Post subphase. |
| Wrap/resource release/Post allocation | `src/core/operations.ts` — `releaseCompletedPhase`, `enterPhase`, allocator/invariants, releaseReady decrement/removal path | **REUSE wrap/allocation; EXTEND ready gate** | Keep wrap/resource law. Prevent uncommitted ready workflow from decrementing 1→0/removing; allow committed ready only. |
| Post capacity/facility instances | `src/core/operations.ts` and `src/core/types.ts` — facilities/reservations/capability `post` | **REUSE; EXTEND projection** | Exact facility ID/slot/capacity, including later buildable capacity. No fixed first-match body. |
| Current weekly release batch | `src/core/tick.ts` release/reception loop; `src/core/reception.ts` | **REUSE mathematical/order law; GATE membership** | Preserve ID order, shared start-of-tick market/standing, RNG, standing/broadcast/development, run/payment, payroll/overhead, events and serialization. Collect only committed ready pictures; click order has no effect. |
| Explicit Release commitment | `src/core/types.ts` action/state leaves; `src/core/actions.ts` application boundary | **EXTEND** | Persist one current-state-bound commitment for exact production. It advances no time and is irreversible in P06A. No generic `advanceWeek` alias. |
| Release legality/current-state selector | current action validation/strict selectors; `src/core/scriptReadModel.ts` and next-event decision conventions | **EXTEND** | Publish exact legal commit and stale refusal; treat uncommitted ready as a decision stop so event advance cannot skip it. |
| Named Post attendance | `src/core/presence.ts` — `studioPresence` | **REUSE / LEAVE ALONE** | Director + craft attend active Post; `releaseReady` has no workstation reservation and projects no one at Post. Busy-for-availability is not attendance. |
| First Film handoff/attention | `src/core/firstFilmJourney.ts` — ready branch/automatic `releaseWeek`/`advance-week`; `ui/src/lot/snapshot/firstFilmJourney.ts` | **EXTEND, not portfolio authority** | Replace automatic-release guidance with Review/Commit/committed copy and correct owner. Its semantic Post currently maps to fixed `post`; do not use it as facility mapping or multi-picture owner. |
| Frozen forecast/provenance | `Production.forecastSnapshot`; `src/core/filmPackage.ts`; `src/core/broadcast.ts` | **REUSE / LEAVE ALONE** | Safe committed outlook. Label `locked at Greenlight`; do not call final-cut quality or recompute in Unity. |
| Actual result calculation | `src/core/reception.ts`, `src/core/tick.ts` | **LEAVE ALONE** | Hidden/reception truth belongs downstream. P06 never previews actual values. |
| Marketing choice/law | `src/core/marketingMenu.ts`; Greenlight application in `src/core/actions.ts` | **REUSE read-only / LEAVE ALONE** | Marketing already chosen/debited and stored in `Production.budget.marketing`. |
| Studio publicity | `src/core/publicity.ts`; `applyPublicity` in `src/core/actions.ts` | **REUSE as separate route / LEAVE ALONE** | Studio awareness, price/cooldown and legality. Never relabel as a picture campaign. |
| Talent busy consequence | `src/core/employment.ts` — `busyTalentIds`; `src/core/presence.ts` | **REUSE; EXTEND consequence read model** | Active-production participants remain busy for assignment/availability through release, while ready has no Post presence/reservation. Never turn “busy” into visible attendance. |
| Queue/capacity explanation | `src/core/studioQueueView.ts`; `src/core/studioCalendar.ts`; `src/core/occupancy.ts` | **REUSE** | Existing need/holder/estimate/slot facts should feed Post queue and blocker anatomy. |
| Permanent events/lot beats | `src/core/studioWeekTheater.ts`; operation event sink | **REUSE; EXTEND P06 subjects if needed** | Use exact wrap/phase facts and event identity for no-replay presentation. Do not mint truth in Unity. |
| Production identity isolation | `src/core/productionIdentity.ts` | **REUSE / LEAVE ALONE** | Stable ID across active/released records; essential for multi-picture/stale behavior. |
| Save/migration/replay | `src/core/save.ts`; save versions/migrations; replay proofs | **REUSE; EXTEND for persisted commitment** | Ready/committed must round-trip; existing saves at `releaseReady` migrate to uncommitted; reconnect cannot commit or release by rendering. |
| Economy/run/standing after release | `src/core/economy.ts`, `src/core/economyView.ts`, `src/core/standing.ts`, `src/core/starPower.ts` | **LEAVE ALONE** | Package 07/result surfaces own interpretation. Same-week standing is studio-wide, not per-film. |

## B3. Browser/read-model behavioral references

| Need | Exact current path/component | Reuse / Extend / Replace / Leave Alone | Why / builder instruction |
| --- | --- | --- | --- |
| Active production summary | `ui/src/engine/adapter.ts` — `productionBoard`, `managedProductionBoardCard`; `ui/src/components/ProductionBoard.tsx` | **REUSE behavior; EXTEND data; REPLACE final presentation** | Already joins title, phase, weeks, facility, Director, blocker and stored forecast. It is an oracle, not the new retained Post UI. |
| Post/wait/ready location and label | `ui/src/engine/adapter.ts` — `managedProductionBoardCard.currentFacility`, `managedWorkflowLocation`, lot building attention | **EXTEND / COORDINATED REPLACE** | Wrapped waiter/Post map to `post`; ready currently says `Theater / release desk`, maps to `theater`, and drives attention there. Change all three together to Production / Post for ready/committed; Theater only after `FilmResult`/run. |
| Lot operation DTO | `ui/src/lot/snapshot/StudioLotSnapshot.ts` — production operations, released cards, `BuildingId`/labels | **EXTEND** | Reuse strict typed shapes and stable IDs. Four recent release cards are not a portfolio/history authority. |
| Production / Post inspector | `ui/src/lot/buildingInspector.ts` — `case 'post'`, `facilityFacts`, `presenceFacts`, `operationFacts`, `sceneryWorkFacts` | **REUSE behavioral joins; EXTEND anatomy** | Already combines Post occupancy, Post presence, operations and co-located Scenery Shop. Split into legible subsections; do not drop Scenery truth. |
| Theater inspector | `ui/src/lot/buildingInspector.ts` — `case 'theater'`, `theaterFacts` | **REUSE after release / LEAVE ALONE** | Correct for recent/now-showing history, not pre-release ownership. |
| Building attention | `ui/src/engine/adapter.ts` lot building presentation `case 'post'/'theater'` | **EXTEND with location change** | Derive waiting/active/ready/committed attention with text+shape. This currently consumes the location mapping above; Theater changes only after actual next-week release. |
| Current navigation | `ui/src/lot/navigation.ts` | **EXTEND / REPLACE generic route** | `review-productions` and `view-released-films` currently resolve to Dashboard. Add exact retained Post/Release routes and origin frames. |
| Release result | `ui/src/screens/ReleaseResult.tsx` | **REUSE downstream / LEAVE ALONE for P06** | Correct post-release result owner; shared-week standing disclaimer. Do not repurpose as pre-release review. |
| Newspaper reveal | `ui/src/screens/NewspaperReveal.tsx`; `releaseNewspaper` in adapter | **LEAVE ALONE** | Package 07-facing reveal. P06 stops before interpretation. |
| Durable history | `ui/src/screens/FilmRecord.tsx`; adapter `filmRecordView` | **REUSE / LEAVE ALONE** | `FilmResult` is durable; Chronicle can be unavailable without frozen participants/newspaper. Preserve safe fallback and automatic history; no Archive click. |
| Current release chain/origin | `ui/src/App.tsx`; next-event/release navigation; World First Next Event docs | **REUSE context law; EXTEND explicit entry** | Preserve Lot origin. P06 commitment receipt stays on Lot/Post; the next-week existing release chain may reveal outcomes and must retain origin without fabricated non-release rail. |
| Current forecast explanation | `ui/src/engine/adapter.ts` forecast/marketing/scorecard read models; `ui/src/components/FilmPackageSummary.tsx` | **REUSE safe fields; ADAPT hierarchy** | Use stored forecast factors/ranges. Do not reuse post-release scorecard as prediction. |
| Production calendar/queue | `ui/src/screens/StudioCalendar.tsx`, `ui/src/components/StudioQueuePanel.tsx` | **REUSE behavior** | Useful capacity/queue reference; not the new world-local owner. |

### Browser implementation already embodying Package 06 behavior

- `productionBoard` already demonstrates authoritative title → phase → weeks → exact facility →
  Director → blocker → frozen forecast.
- `buildingInspector.ts` already joins the exact Post building to occupancy, presence and production
  operation facts, including the co-located Scenery Shop.
- `ReleaseResult.tsx` already keeps critic, audience, gross, studio revenue, contribution and ROI as
  separate post-release truths and labels same-week standing correctly.
- `FilmRecord.tsx` already embodies automatic durable history instead of a manual Archive action.
- `App.tsx` and World First next-event work already preserve Lot origin through the exceptional
  release chain.

Unity needs its own presentation, but Fable should inspect these as behavioral law before writing
new joins.

## B4. Bridge/protocol

| Need | Exact current path/component | Reuse / Extend / Replace / Leave Alone | Why / builder instruction |
| --- | --- | --- | --- |
| Projection bundle | `bridge/schema/bridge-schema.ts` — `StudioProductionOperationsSnapshot`, `StudioProductionsProjectionSchema`, `StudioPeopleProjectionSchema`, `StudioReleaseResultsProjectionSchema` | **EXTEND** | Operations currently lacks reservation slot/capacity/forecast/commitment/hold law; release projection is only a four-field summary. Add exact safe Post/Release Review/commit facts; do not prose-parse other sections. |
| JSON schema | `bridge/schema/project-studio-bridge.schema.json` | **REGENERATE from source schema** | Never hand-author divergent transport law. |
| Generated TypeScript/Unity DTO | `generated/unity/StudioBridgeDtos.Generated.cs`; sealed Unity `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` | **REGENERATE** | One schema path; no handwritten shadow DTO. |
| Available intent kinds | `bridge/schema/bridge-schema.ts` — `AVAILABLE_INTENT_KINDS` | **EXTEND** | Add opaque `commitPictureToRelease` (exact final naming core-owned) only after persisted TypeScript authority exists. |
| Dispatch/receipts/rejections | `bridge/session.ts` | **REUSE / EXTEND** | Current session is the authority boundary. Return exact accepted/rejected/stale receipt; never retry automatically. |
| Runtime continuity | `bridge/runtime-checkpoint.ts`; supervisor/replay/opaque-intent machinery | **REUSE / LEAVE ALONE** | Preserve state across reconnect/crash and deduplicate accepted actions/events. |
| Movie #2 proof | `bridge/proof.ts` | **EXTEND** | Already captures Post and release. Add uncommitted/committed ready, ordered two-release batch, identity isolation and reconnect proof. |

## B5. Sealed Unity `911e87e`

Paths below were verified in `/Users/bruce/Project Studio - Unity Production Convergence 80H` at
the requested sealed commit `911e87e`; do not substitute that repository's later current tip or
current dirty worktree.

| Need | Exact sealed component | Reuse / Extend / Replace / Leave Alone | Why / builder instruction |
| --- | --- | --- | --- |
| World body/ID `post` | `Assets/Studio/Editor/Authoring/StudioLotArchitectureAuthoring.cs` — `BuildProductionSupport`, `AddSelectable(... "post", "Production & Post" ...)` | **REUSE founding identity; EXTEND state visuals/mapping** | Existing selectable founding owner. Core Post facilities are buildable, so exact facility ID must map to a placed body or P06A must explicitly scope the founding body while labeling facility separately. Never first-match. |
| World body/ID `theater` | same file — `BuildTheater`, selectable `theater` | **REUSE after release** | Theater is public/released presence. Change no unreleased ownership into it. |
| Selection | `Assets/Studio/Runtime/Presentation/SelectableEntity.cs`, `StudioSelectionManager.cs`, `StudioInspectionTarget.cs` | **REUSE / EXTEND under CP10A/Package 02** | Stable single-selection/inspection spine; no material action on click. |
| Camera | `StudioCameraDirector.cs`, `StudioCameraInput.cs`, `TycoonCameraController.cs` | **REUSE / EXTEND Package 02 Focus/Locate/Back** | No Post-specific automatic movement or double-click special mode. |
| HUD shell | `StudioHud.cs`, `StudioFoundingCardHud.cs` | **REUSE visual identity; EXTEND with shared inspector/workspace host** | Do not put Post back into a small generic memo. Applicant dossier direction supplies hierarchy, not art reinvention. |
| Bridge transport/continuity | `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs`, `StudioBridgeTransport.cs`, `StudioBridgeRuntimeContinuity.cs` | **REUSE / LEAVE ALONE** | Exact authoritative snapshot/intent/receipt boundary. `StudioBridgePendingPost.cs` means HTTP POST, not Post Production. |
| Snapshot presenter | `StudioBridgePresentation.cs`, `AuthoritativePresentationBinding.cs`, `StudioLocationBinding.cs` | **EXTEND with dedicated P06 adapter** | Current generic presenter does not own Post work/readiness/release. Avoid first-match production/facility. |
| Living lot | `StudioLotLifePresentation.cs` | **REUSE ambient system; EXTEND narrowly** | Current theater-goer behavior derives from release count only. It is not Post activity or a release result owner. |
| Stage/Shooting visuals | `StudioStageProductionPresentation.cs`, `StudioShootingDayLotPresentation.cs`, `StageActivityEffects.cs` | **LEAVE ALONE** | Package 05 owner. On wrap they clear from exact authority; do not reuse REC/shooting effects at Post. |
| Post presentation owner | none at sealed commit | **BUILD** | One DTO-driven presenter for idle/waiting/active/ready/released acknowledgment; no simulation. |
| Release Review workspace | none at sealed commit | **BUILD using shared retained-workspace host** | Large, readable, context-preserving surface; no tiny memo. |

## B6. Nomenclature contract

Use these exact meanings:

| Term | Meaning |
| --- | --- |
| **Production / Post** | Existing founding world building/body (`post`); local owner for Post and Release Ready; also houses current Scenery Shop presentation. |
| **Post Building** | Core facility name/capability instance. Use exact facility name when capacity matters. |
| **Post-production** | Current authoritative workflow phase. |
| **Release Ready** | Post finished; no Post reservation; explicit release decision pending. |
| **Committed to Release** | Proposed persisted authorization on a ready picture; no Post reservation/presence; resolves in the next studio week's existing ID-sorted batch. |
| **Released** | `FilmResult` exists and active Production is gone. |
| **In theaters** | Active `TheatricalRun`; not synonymous with Released/history. |
| **FilmResult / history** | Durable core released-film record; Film Chronicle is the richer browser rendering when frozen data exists; “Archive” is presentation language only. |

Do not call Production / Post the Scenery Shop, call a wrapped Post waiter “shooting,” call Release
Ready “at Theater,” or introduce an `archive` workflow phase.

---

# C. Post inspector anatomy

## C1. Shared geometry and hierarchy

Wide layout uses the accepted Package 02 shared inspector: fixed right side, approximately
`392–440 px`, within the safe viewport. At narrow width it becomes a bottom sheet, initially
`45–60dvh`, expandable to `88dvh`. It does not cover the selected building's safe-frame anchor.

Minimum presentation targets:

- building/title: 22–26 px equivalent;
- active picture title: 19–22 px;
- body/status rows: at least 16 px at 100% scale;
- secondary metadata: at least 14 px, never the only carrier of action/state;
- controls: minimum 44 × 44 CSS-pixel-equivalent target;
- no more than two primary actions before `More`/workspace route;
- color-independent icon/shape + text for active, waiting, ready and stale.

Accessibility is structural, not a later skin:

- every picture row, status badge, Locate and decision control has a programmatic role, accessible
  name and visible label;
- keyboard/controller order is deterministic: header → selected picture rail → evidence → current
  actions; row changes do not reorder focus;
- authoritative state change, rejection and reconnect move focus only to the exact changed status or
  preserved invoking control, never to document start;
- new wrap/ready/commit/rejection announcements use one polite live region, deduplicated by exact
  event/receipt ID so save/load and reconnect do not repeat them; and
- readiness/blocker/selection never rely on color, animation or sound alone.

Use current Project: Studio materials, typography and accepted applicant-dossier hierarchy. Do not
invent a new white-paper/sepia art direction.

## C2. Component skeleton

```text
┌ PRODUCTION / POST                         [×] ┐
│ Department state · exact capacity            │
├──────────────────────────────────────────────┤
│ ATTENTION (only if waiting/ready)             │
│ Title-bearing cause / next milestone          │
├──────────────────────────────────────────────┤
│ PICTURES                                      │
│ [state] Title                facility / ETA   │
│         owner people · blocker/next           │
│ [state] Title                facility / ETA   │
├──────────────────────────────────────────────┤
│ PEOPLE HERE · exact named presence            │
│ Director · Craft Lead                         │
├──────────────────────────────────────────────┤
│ SCENERY SHOP (when current facts exist)       │
│ separate subsection; never mixed into Post   │
├──────────────────────────────────────────────┤
│ [Open Post] [Focus] [More]                    │
└──────────────────────────────────────────────┘
```

If several pictures exist, retain deterministic ID/current queue order and pin the currently
selected row. New attention may badge a row but must not move it under the pointer.

## C3. Idle

- **Header:** `Production / Post` + `AVAILABLE`.
- **Capacity:** exact free/total slots if projected; otherwise omit, never guess `1`.
- **Body:** `No picture is in Post.`
- **People:** no invented editor headcount.
- **Scenery:** retain a separately labeled Scenery Shop subsection if it has current work.
- **Actions:** `Open Post` only if history/portfolio value exists; `Focus` in shared chrome.
- **Absent:** alert, empty progress bar, Commission/Release action.

## C4. Wrapped / waiting for Post capacity

- **Header attention:** shaped amber/attention mark + `WAITING FOR POST`.
- **Title:** exact picture.
- **Cause:** `No Post slot is available.`
- **Consequence:** `The shoot has wrapped and its Stage is free. Finishing cannot begin.`
- **Holder:** exact occupying picture/Post facility when authoritative.
- **Retry:** exact authoritative queue/estimate if available; otherwise `Retries on a future studio
  week`, not a fabricated ETA.
- **Actions:** `Inspect holder`, `Open Post capacity`, `Locate Post`; show `Build Post` only if an
  existing legal construction intent is published.
- **Absent:** `Acknowledge`, `Continue`, Stage occupancy, finishing vignette for waiter.

## C5. Active

- **State:** `POST-PRODUCTION`.
- **Title/genre:** one prominent line.
- **Activity:** `Finishing` (generic and honest).
- **Progress:** `2 weeks remaining` / `1 week remaining`; next milestone `Release Ready`.
- **Capacity:** exact Post facility and slot, e.g. `Post Building · 1 of 1`.
- **People:** exact Director and craft lead with presence/destination; withheld identity remains
  omitted with honest aggregate fallback only if authority publishes it.
- **Actions:** `Open picture`, `Locate Director`/`Locate craft` under More, shared Focus.
- **Absent:** quality change, scene/edit milestones, cast attendance, release button.

## C6. Blocked

Current authority has no blocker once an exact Post reservation is active. “Blocked Post” in P06A
therefore means **waiting for Post capacity**, not an internal edit problem. If a future blocker is
added, it must supply subject, cause, consequence, remedy, time-stop law and exact Locate target from
TypeScript before presentation exists.

## C7. Release Ready

- **State:** shaped positive badge + `RELEASE READY`.
- **Title/genre:** prominent.
- **Operation:** `Finishing complete · Post slot released`.
- **Decision summary:** `Review the studio outlook and commit this picture to Release.`
- **People:** no one shown attending Post; any busy participant consequence is assignment/
  availability only.
- **Actions:** primary `Review release`; secondary `Open picture`/Focus in shared chrome.
- **Absent:** inline one-click Release, Post progress, “now showing,” actual review/box-office score.

## C8. Committed to Release

- **State:** `COMMITTED TO RELEASE · NEXT STUDIO WEEK`.
- **Operation:** no Post activity, reservation or presence; the authorization is irreversible in
  P06A and advances no time by itself.
- **World:** one deduplicated dispatch cue, then a settled non-alert state at Production / Post.
- **Action:** normal one-clock Advance when the player chooses; no second Release button.
- **Batch law:** all committed ready pictures release next week in existing production-ID order;
  uncommitted ready pictures remain.
- **Absent:** Theater/now-showing, critic/audience result, cancel commitment, second dispatch.

## C9. Released/history state

Released films do not remain as active Post occupants. After accepted receipt:

- remove the exact row by production ID;
- keep Production / Post selected if it remains a valid building;
- show a short `Released <title>` receipt once;
- expose `Open Film Chronicle` only when a frozen record is available, otherwise the safe legacy
  history/Package 07 route;
- never substitute the next Post picture as selected;
- Theater may show `Released` or `Now showing` only from exact authoritative release/run state.

---

# D. Release Readiness Review anatomy

This fulfills the Package 06 **Final-Cut Review Anatomy** requirement without making a false player-
facing claim. Current authority has readiness plus the locked Greenlight outlook, not a new final-
cut assessment. Reserve `Final-Cut Assessment` for the deferred simulation campaign.

## D1. Wide retained workspace

Use a retained lot workspace approximately `min(1180 px, 78vw)` and at most `88dvh`, leaving a
recognizable 22–30% lot edge/background where viewport permits. This is a readable management
workspace, not a center modal over a dark void.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ POST / RELEASE REVIEW                  Week N     [Locate Post] [×]       │
├───────────────┬──────────────────────────────────┬───────────────────────┤
│ PICTURES      │ <TITLE> · Genre                  │ RELEASE READINESS     │
│ waiting       │ RELEASE READY                    │ Ready / blocker       │
│ active        │                                  │                       │
│ ready ●       │ STUDIO OUTLOOK                   │ ALREADY COMMITTED     │
│               │ Locked at Greenlight             │ production / marketing│
│ stable rows   │ estimates · segment evidence     │ cash/context          │
│ no re-sort    │                                  │                       │
│               │ KNOWN STRENGTHS                  │ HOLD CONSEQUENCES     │
│               │ KNOWN CONCERNS / UNCERTAINTY     │ exact projected law   │
│               │                                  │                       │
│               │ PICTURE / COMPANY / PRODUCTION   │ [Review Release]      │
└───────────────┴──────────────────────────────────┴───────────────────────┘
```

Recommended allocation: picture rail 18–22%; evidence body 46–50%; readiness/commitment 28–34%.
At most three strengths and three concerns are above the fold. `More details` expands segment-level
ranges and full participant/production record without shrinking base type.

## D2. Header

Order:

1. breadcrumb `Production / Post › <Title>`;
2. exact title, genre and stable human-readable picture label;
3. authoritative state badge;
4. current week;
5. `Locate Post` and Close/Back; opening does not move camera.

A poster placeholder may use existing deterministic concept/poster presentation. It is decorative
identity, never quality or release state.

## D3. Studio outlook

Label exactly:

> **Studio outlook — locked at Greenlight**

Show, when the stored forecast publishes them:

- expected critic estimate;
- expected opening and total estimates, clearly forecasts rather than cash;
- segment estimates, low/high ranges and per-segment confidence under `More details`;
- top causal factors;
- top uncertainty factors;
- the remaining segment detail under `More details`.

Never label this `Final Cut Quality`, `Current Quality`, `Actual`, `Guaranteed`, or silently refresh
it from current hidden truth.

## D4. Known picture record

- writer, Director, cast slots and craft lead from exact production/frozen participants;
- production/set identity and known operational holds where the read model safely preserves them;
- Post facility and completion;
- negative/production budget and marketing commitment as separate rows;
- direct commitment total only from existing economy/read model;
- no same-week standing delta or projected run contribution here.

## D5. Strengths and concerns

Use driver chips/rows, not prose paragraphs:

```text
+ Strong audience fit          Source: Greenlight outlook
+ Recognizable lead package    Source: committed package
? Critic response uncertain    Source: forecast confidence
? Market result unknown        Resolves after Release
```

Every driver carries source/provenance in accessible details. Do not infer a strength from Unity
animation or translate hidden actual skill into copy.

## D6. Narrow responsive form

At narrow viewport or 200% text:

- use a bottom sheet up to `88dvh`, full safe width;
- tabs/steps: `Picture`, `Outlook`, `Commitment`; state/title remain sticky;
- fixed footer contains only `Review release` or, inside commitment, `Hold for now` + `Commit
  <title> to Release`;
- preserve vertical reading order and focus; no horizontal comparison table;
- lot remains inert behind sheet; Back closes one layer and restores invoking focus.

---

# E. Release Review anatomy

Release Review is the final sublayer of the Post workspace. It can share the retained frame but
must feel like an explicit commitment, not another accordion.

## E1. Information order

1. **Title-bearing boundary:** `Commit <Title> to Release` + `This cannot be undone.`
2. **Ready proof:** Post complete; no blocker; current state/version.
3. **What is already committed:** production budget, marketing, named package.
4. **What happens now:** TypeScript persists `Committed to Release`; no time advances; the next
   authoritative week releases the committed ready set through existing ID-sorted batch law.
5. **What holding means:** no mutation now; if time advances under the P06 hold law, exact economy-
   gated studio exposure continues and participants remain busy for assignment/availability. Post
   capacity stays free and no one is shown attending Post.
6. **What remains unknown:** critic/audience/box office until the next-week Release resolves.
7. **Current studio context:** cash and awareness if exact; separate publicity route if legal.
8. **Actions:** `Hold for now` and `Commit <title> to Release`.

## E2. Consequence card

```text
RELEASE COMMITMENT

Now
• Persist an irreversible Release commitment for <Title>
• Advance no time
• Show Committed to Release at Production / Post

Next studio week
• Existing ID-sorted release batch resolves every committed ready picture
• Append FilmResult history and begin downstream release/reception authority
• Uncommitted ready pictures remain held

Already paid
• Production: <authoritative amount>
• Marketing: <authoritative amount> (set at Greenlight)
• Release-time debit: None in current V1

Still unknown
• Critic response
• Audience response
• Theatrical performance

[Hold for now]              [Commit <Title> to Release]
```

Do not say full-run contribution has been received when a theatrical run is only projected. Do not
attribute a same-week studio standing change to this one picture.

## E3. Confirmation and receipt

- First activation opens/focuses the commitment summary; it does not dispatch.
- Final title-bearing action dispatches one current opaque intent.
- Disable while pending and preserve exact focus.
- Accepted: exact commitment receipt, fresh `Committed to Release` snapshot and one world dispatch
  acknowledgment; result authority waits for the next studio week and remains Package 07.
- Rejected/stale: keep workspace open, show concise reason, refresh exact state, focus the changed
  field/action; no retry.
- Duplicate network delivery is idempotent or refused; never double-commit or double-release.

## E4. Cancel/back

- `Hold for now` returns to picture review without mutation.
- Escape/Back from confirmation returns to Release Review.
- Escape/Back from Release Review returns to selected picture workspace.
- Escape/Back from root Post workspace restores exact Production / Post world selection, camera and
  invoking focus.
- No Back action resumes time automatically.

---

# F. Marketing / Publicity surface

Current authority supports context, not another release-time choice.

## F1. Read-only rows

| Row | Exact meaning | Action |
| --- | --- | --- |
| `Marketing committed at Greenlight` | `Production.budget.marketing`; already debited | `View package basis` only |
| `Studio audience awareness` | Current exact studio-wide awareness, if projected | None by default |
| `Publicity` | Current studio action status/cooldown/price, if exact | `Open Administration / Publicity` |

## F2. Route behavior

`Open Administration / Publicity` pushes the exact Release Review origin, opens the authoritative
Administration/Publicity owner, and performs no action. Back restores picture, Release Review
scroll and focused row. If publicity is unavailable/stale, stay in current context and explain; do
not silently substitute a tier.

## F3. Do not build

- film-specific publicity state;
- Post marketing slider;
- marketing re-budget;
- recalculated release forecast in Unity;
- “more publicity guarantees hit” copy;
- duplicate immediate debit from Release.

If Fable cannot project exact publicity context within P06A, omit this section and keep the route in
FOLLOW-UP. Release remains valid.

---

# G. State / edge-case matrix

`Back` below means the Package 02 ordered stack. No state change moves the camera automatically.

| State / edge | Visible treatment | Allowed commands | Forbidden commands/claims | Camera and selection | Back/Escape / persistence result |
| --- | --- | --- | --- | --- | --- |
| No active/waiting picture | Production / Post `Available`; exact capacity; separate Scenery subsection if needed | Select, Focus, open portfolio/history | Release, progress, invented editors | No auto motion; building can remain selected | Close inspector, then normal world stack |
| Production wraps | Stage winds down; wrap receipt names picture/Stage; Post gains attention | Open receipt, explicit Locate Post | `Send to Post`, camera jump, replay | Existing Stage selection/camera retained | Dismiss receipt; state persists |
| Post handoff succeeds | Exact Post row becomes `Active`; Director/craft may travel/attend | Select Post/picture/person; advance time | Quality increase, cast-in-Post claim | No auto focus; exact prior selection persists | Return to origin exactly |
| Post capacity full | `Waiting for Post`; Stage-free consequence; holder/capacity/estimate | Inspect holder/capacity; build only if legal; advance | `Continue`, acknowledge, claim still shooting | Alert does not move camera; Locate explicit | Close alert leaves state; save preserves wait |
| Post active | `Finishing`; exact facility, people, weeks, next milestone | Inspect, Locate, advance time, work elsewhere | Release, edit/mix buttons, percentage | Building/picture selection refreshes in place | Workspace closes to exact lot state |
| One week remains | Non-alarm local milestone; honest `1 week remaining` | Advance or leave | Auto-open review, pause without rule | No motion | Normal return |
| Release Ready reached | Positive shaped attention, Post work stops/slot free, no Post presence | Open Release Review, hold, inspect, separate publicity route, Commit | Uncommitted auto-release, now-showing, actual score | Selected Post refreshes; no camera move | Review not auto-open; uncommitted state persists |
| Release Review open | Large retained workspace, state/title/provenance | Navigate evidence; open commitment; Locate/Profile | Mutation on open; Advance hidden as Release | Lot/camera retained and inert | One layer back; focus restored |
| Cancel/hold | Review remains/returns; `Held for now` neutral acknowledgment | Close, publicity route, later review, advance knowingly | Quality gain/date advantage claim | No motion; same exact picture selected | No mutation; if time advances, exact economy-gated exposure applies and picture stays uncommitted |
| Advance with uncommitted ready | Picture remains `Release Ready` at tick 1; other systems use the one clock | Manual Advance after leaving decision; return to Review | Decrement/remove/release this picture; Next Event skip past decision | No auto motion | Save stays uncommitted; exact exposure/receipts only |
| Advance to Next Event at uncommitted ready | Current release decision is the stop | Open Review/Commit, leave | Spin weeks, auto-commit, open result | No camera move | Decision origin remains exact |
| Stale Release commitment | Inline semantic refusal + fresh state | Re-open if still legal; return to committed/new owner/history | Retry automatically, create commitment or RNG/debit/result | No camera move; invalid picture selection clears only if gone | Back returns origin; refusal does not replay |
| Duplicate commitment delivery | One accepted commitment at most; duplicate idempotent/refused | Inspect committed state | Second commitment/cue; any FilmResult/run/RNG at commit time | No second cue | Reconnect shows current truth |
| Insufficient funds | **Not reachable in current V1:** release-time debit is zero | Release if otherwise legal | Disable for fictional release fee | Unchanged | If future spend exists, exact TypeScript refusal required |
| Publicity unavailable/cooldown | Exact Administration status; commitment remains legal | Commit, hold, inspect Publicity | Treat publicity as prerequisite or film-bound | Route does not move camera unless explicit Locate | Back restores Release Review exactly |
| Selected building changes while open | Exact affected row/status updates in place; focused row pinned | Current legal commands only | Act on stale row, reorder under pointer | Camera/selection stay | Back uses original valid building context |
| Committed picture before next week | Settled `Committed to Release`; no Post reservation/presence | Inspect, advance one clock, manage elsewhere | Cancel, second commit, Theater/result claim | Building selection persists; no auto motion | Commitment/save exact |
| Picture releases while another context is open | On next studio week exact active row disappears; one `FilmResult` identity | Open safe history/downstream result route | Substitute another picture as selected | Building selection persists; picture selection clears | Back restores nearest valid origin |
| Multiple pictures in Post | Stable rail; separate IDs/states/capacity slots | Select exact row, compare capacity, commit exact ready picture | “Current picture” singleton assumption | No camera move on row switch | Rail/filter/scroll retained |
| Two committed releases next week | Each commitment exact; next tick forms one ID-sorted batch from shared start-of-tick basis | Commit titles in either click order, then Advance Week | Click-order math, per-film attribution of shared standing, release uncommitted title | No substitution/focus jump | Existing downstream origin law applies |
| Save/load during Post | Same picture, facility, phase, weeks, blocker and presence truth | Continue normally | Restart vignette as a new event; reset ETA | Restore valid selection/camera where presentation supports | No false wrap cue |
| Save/load at Release Ready | Same uncommitted held state; current saves migrate uncommitted | Review/Commit | Fall through legacy auto-release | Restore exact picture/building if valid | Authority exact; no render mutation |
| Save/load at Committed | Same committed state and accepted receipt identity | Advance normally | Lose commitment, replay dispatch, re-enable Commit | Camera/selection valid | Next studio week releases once |
| Reconnect during pending commitment | Reconcile by intent/receipt/current state | Show committed or current ready state | Re-submit blindly, produce RNG/result | Camera unchanged | One deduplicated live-region cue/receipt |
| Released picture no longer active | Removed next week; Theater/`FilmResult` history from authority | Open Chronicle if available / safe downstream result | Archive click, keep Post capacity occupied | No camera hijack | Return to Production / Post or stored origin |
| Legacy/imported record lacks detail | `Unavailable for this older film`; show safe frozen subset | Open Chronicle | Reconstruct hidden participant/autopsy facts | Unchanged | Normal return |
| Target building destroyed/unavailable later | Workspace stays with picture if authority has owner; Locate unavailable with reason | Close/open portfolio | First-match substitute, null camera jump | Selection clears only invalid exact anchor | Back restores next valid context |
| Narrow viewport / 200% text | Bottom sheet, sticky title/state, vertical tabs, fixed actions | Full keyboard/controller navigation | Horizontal overflow, hover-only facts, clipped title | Safe viewport recomputed | Focus returns to invoking control |
| Reduced motion | Static state swap/short opacity; no travel flourish | All commands | forced fly-by, flashing ready cue | Focus snaps or ≤100 ms per Package 02 | Same stack semantics |
| Controller/keyboard | Semantic target cycle; visible focus; title-bearing confirmation | Cycle rows, inspect, Back, Commit confirmation | cursor-only tiny target, color-only state | Focus and world selection distinct | Controller Back mirrors Escape |

---

# H. Golden UX journeys

Each journey is suitable for automated acceptance where fixtures exist and for manual Unity proof.
Use exact stable IDs and snapshot versions; never assert by title alone.

## H1. Production wraps

**Given** a shooting picture completes on Stage 7, **when** the authoritative week resolves, **then**
the Stage reservation/task/scenery clear, one wrap receipt names the picture and Stage, and the
camera/selection do not move.

**PASS:** no Stage-active presentation remains for the wrapped picture; exactly one wrap cue appears.

## H2. Post gains attention

**Given** the wrapped picture can enter Post, **when** the fresh snapshot arrives, **then** Production
/ Post shows title-bearing active attention and the Stage remains free.

**PASS:** Post and Stage join the same production ID correctly; no `Send to Post` action exists.

## H3. Select Post

**Given** Post is active, **when** the player hovers then single-selects Production / Post, **then**
the hover label shows building + top state and the inspector shows exact picture, capacity, state,
weeks and people without moving camera.

**PASS:** no simulation mutation; no generic memo; body text meets minimum sizing.

## H4. Inspect current picture

**Given** the building inspector is open, **when** `Open picture` is chosen, **then** a retained Post
workspace opens on the exact production with state, company, facility and forecast provenance.

**PASS:** lot/camera/selection remain retained; no actual result or invented subphase appears.

## H5. Observe finishing

**Given** exact `postProduction` state, **when** the lot is visible, **then** the Production / Post
building differs legibly from idle through bounded era-neutral activity and exact Director/craft
presence.

**PASS:** cast are not shown as Post workers; animation creates no state/quality claim.

## H6. Advance time through Post

**Given** two Post weeks remain, **when** one authoritative week advances, **then** the same picture
shows one week remaining and all other departments advance exactly once.

**PASS:** no second Post clock, weekly acknowledgment or duplicate tick.

## H7. Post capacity blocker

**Given** Picture A occupies the only Post slot and wrapped Picture B waits, **when** B is selected,
**then** the UI says B wrapped, its Stage is free, Post capacity is full, who holds it and the
narrowest legal remedy/estimate.

**PASS:** B is never shown shooting or editing; no acknowledgment command; exact holder is A.

## H8. Blocker resolves

**Given** A frees Post, **when** the authoritative allocator admits B, **then** B enters the exact
Post facility automatically and its waiting treatment clears.

**PASS:** no player `Continue` click, no double occupancy, stable queue identity.

## H9. Release Ready attention

**Given** finishing completes, **when** the fresh state becomes `releaseReady`, **then** Post slot is
free, Production / Post shows positive Ready attention, and the picture does not auto-release or
move to Theater.

**PASS:** no camera movement or auto-open; `Review release` is the only primary decision route.

## H10. Open Release Readiness Review

**Given** a ready picture, **when** Review is opened, **then** the workspace shows title, state,
`Studio outlook — locked at Greenlight`, strengths/uncertainty, participants, commitments, hold
consequences and unknown outcomes.

**PASS:** no field is labeled actual/final quality; opening causes byte-identical authority state.

## H11. Cancel without mutation

**Given** Release Review, **when** the player uses Hold/Back, **then** the picture remains Release
Ready and the exact Post workspace/lot origin is restored.

**PASS:** no tick, debit, RNG, result, run or camera movement; focus returns to `Review release`.

## H11B. Hold survives the one clock

**Given** an uncommitted ready picture, **when** the player knowingly advances one studio week,
**then** other authoritative systems advance once, exact economy-gated exposure applies, and this
picture remains ready at tick 1. `Advance to Next Event` must stop at this unresolved decision rather
than skipping it.

**PASS:** no Release/RNG/`FilmResult` for the held picture; busy-for-availability identities remain
exact, with no Post reservation or visible Post attendance.

## H12. Explicit Release commitment

**Given** current uncommitted Release Ready truth, **when** the player confirms `Commit <title> to
Release`, **then** one opaque intent is accepted, time does not advance, the exact production stays
at ready tick 1 with persisted `Committed to Release`, and one dispatch acknowledgment occurs.

**PASS:** no project/time, RNG, ledger, `FilmResult` or theatrical run changes at commit; no second
commit can occur; P06 stops before next-week result interpretation.

## H13. Stale action fails closed

**Given** Release Review was opened from version N and another current transition removes/changes
the picture, **when** the old commitment intent arrives, **then** TypeScript rejects it and returns
fresh state.

**PASS:** no RNG, ledger, FilmResult or theatrical run duplication; workspace explains the exact
change and never retries.

## H14. Save/load during Post

**Given** one week remains in Post, **when** the process saves, restarts and reloads, **then** exact
picture/facility/phase/weeks/blocker truth returns.

**PASS:** no wrap or Post-entry animation replays as new; next week advances once.

## H15. Save/load while Release Ready

**Given** the player holds an uncommitted ready picture, **when** save/load or reconnect occurs,
**then** it stays ready and uncommitted.

**PASS:** first render/tick does not bypass the gate; exact Commit action remains stable/current;
an imported baseline ready save defaults to uncommitted.

## H15B. Save/load after commitment

**Given** the commit receipt was accepted but the next week has not advanced, **when** save/load or
reconnect occurs, **then** the exact picture returns as `Committed to Release` with no repeated cue.

**PASS:** Commit remains disabled/absent; the next authoritative week resolves it exactly once.

## H16. Multiple-picture isolation

**Given** A is active in Post, B waits and C is Release Ready, **when** the player switches rows and
commits C, **then** A/B facility/queue state remains unchanged and C alone becomes committed.

**PASS:** no first-title/first-match substitution; selected rows and intents bind exact IDs.

## H16B. Same-week release batch remains canonical

**Given** ready pictures C and D are committed in reverse ID/click order while E remains
uncommitted, **when** the next authoritative week advances, **then** C/D resolve through one existing
ID-ascending batch from the shared start-of-tick basis and E remains ready.

**PASS:** critic RNG, standing, broadcast/development, run/payment, payroll/overhead, event and save
ordering match canonical batch law; click order changes nothing.

## H17. Back / Locate restoration

**Given** Release Review is scrolled to uncertainty and the player chooses `Locate Post`, **when**
the exact building is focused and Back is used, **then** the same picture, tab, scroll, focus and
review layer return.

**PASS:** Locate is the only camera movement; no data or action is lost.

## H18. Publicity route remains separate

**Given** exact studio publicity context is exposed, **when** the player opens Administration from
Release Review, **then** no publicity action executes and Back restores the exact picture review.

**PASS:** publicity remains studio-wide, its current cost/cooldown is authoritative, and commitment
is not blocked by declining it.

## H19. Narrow/controller proof

**Given** narrow viewport or 200% text and controller/keyboard input, **when** the player navigates
Post rail → Outlook → Commitment → cancel, **then** all content is readable, focus visible, controls
reachable and Back ordered.

**PASS:** no horizontal clipping, hover dependency, focus trap or color-only state; minimum targets
hold; rejection/state-change live announcements occur once by receipt/event ID.

## H20. Released history isolation

**Given** a release succeeds, **when** the player returns to Post and opens history, **then** the
picture is absent from active capacity, present once in `FilmResult` history, and Theater/recent-
release state derives from authority. Film Chronicle opens only when its frozen record exists.

**PASS:** there is no Archive button, no active Post slot, no replayed release cue and no full-run
cash claim while a run is still projected.

---

# I. Fable implementation map

## REUSE

- `src/core/productionPhases.ts` for Post/Release Ready phase and exact capability truth.
- `src/core/operations.ts` for wrap, resource release, Post allocation, blocker and reservations.
- `src/core/types.ts` for Production/FilmResult/TheatricalRun identity and frozen facts.
- `src/core/presence.ts` for exact Director/craft Post attendance.
- `src/core/tick.ts` + `src/core/reception.ts` as the only existing release/outcome resolver.
- `src/core/marketingMenu.ts` and `src/core/publicity.ts` for distinct marketing/publicity truth.
- `src/core/studioQueueView.ts`, `studioCalendar.ts`, `occupancy.ts` for capacity explanation.
- `src/core/save.ts`, bridge runtime checkpoint/replay/receipt machinery.
- Browser `productionBoard`/Post inspector joins as behavioral oracles.
- Browser `ReleaseResult.tsx` and `FilmRecord.tsx` as downstream result/history owners.
- Sealed Unity `post` and `theater` selectable world bodies, shared selection/camera/transport.

## BUILD NEXT — P06A Post-from-the-Lot V1

1. **Authority gate:** Release Ready persists uncommitted at tick 1; one explicit current-state
   commitment advances no time; the next studio week admits only committed ready pictures to the
   unchanged ID-sorted release batch.
2. **Projection:** exact Post waiting/active/ready/committed records, facility/slot/capacity, people,
   weeks, safe frozen outlook, commitments, hold consequences and current Commit intent.
3. **Local presentation:** Production / Post hover/selection inspector for idle, waiting, active and
   ready, retaining separate Scenery Shop facts.
4. **World acknowledgment:** minimum idle/active/waiting/ready/committed contract, exact people and
   event deduplication.
5. **Retained workspace:** list-capable Post workspace + Release Readiness/Commitment Review +
   responsive form.
6. **Round trip:** exact Focus/Locate/Profile/Publicity/Back restoration under Package 02.
7. **Proof:** stale/duplicate, ready/committed save migration, reconnect, two-picture capacity,
   same-week committed batch order, multiple identity, accessibility and no-camera-hijack journeys.
8. **Boundary:** accepted commitment receipt/world dispatch only. The next-week existing release
   batch and Newspaper/ReleaseResult/Film Chronicle remain downstream/Package 07.

## EXTEND

- `src/core/types.ts`, `src/core/save.ts`, `src/core/operations.ts` and `src/core/tick.ts` with
  persisted ready commitment, migration, uncommitted hold and committed-only batch admission.
- `src/core/actions.ts` and strict decision/next-event read models with explicit Commit intent and
  exact economy-gated hold consequence.
- `src/core/firstFilmJourney.ts`, `managedProductionBoardCard.currentFacility`,
  `managedWorkflowLocation` and lot attention from automatic Theater/advance copy to coordinated
  Production / Post Review/Commit guidance.
- bridge source schema, available opaque intents, session dispatch and generated DTOs.
- browser/Unity Post projection and exact facility→placed-body mapping; if P06A is formally founding-
  body-only, label the exact facility separately and never first-match.
- shared CP10A/Package 02 inspector/workspace/context stack rather than a P06-only shell.
- Unity `StudioBridgePresentation` through a dedicated P06 presentation adapter.
- persistence/replay proof for uncommitted/committed Release Ready and idempotent commitment.

## DO NOT REBUILD

- production countdown, Post capacity/allocation or queue law;
- wrap or Stage/Set/scenery release;
- presence/assignment truth;
- Greenlight forecast, marketing/reception/box-office math;
- studio publicity;
- release batch/result math, theatrical-run economy, standing, Star Power, `FilmResult` or Film
  Chronicle rendering/fallback;
- save, RNG, ledger, bridge continuity or opaque-intent machinery;
- selectable Production / Post or Theater world bodies;
- Package 02 camera, selection, Focus, Locate and Back grammar;
- Package 05 Stage/shooting visuals.

## DEFER

- perceived final-cut assessment/test screening/fix law;
- editorial/sound/VFX subphases and specialist staffing;
- release calendar, distribution negotiation and film-bound campaigns;
- movie preview/screening cinematic;
- catalog/IP/library economics;
- creator mode/Advanced Movie Maker successor;
- era technology progression beyond neutral hooks;
- full Post portfolio across many facilities;
- Package 07 reception, reviews, audience, box office, awards and franchises.

## OWNER DECISIONS REQUIRED

**None before P06A.** The Owner's mission already binds deliberate Release, the existing building
identity and current simulation define the bounded implementation, and unsupported depth is
explicitly deferred. Separate Owner decisions are required before any final-cut assessment,
release-calendar/distribution, film-bound publicity or creator-mode campaign.

---

# J. P06A acceptance boundary

P06A is complete only if all of the following are simultaneously true:

- one exact picture wraps, frees its Stage and becomes visible at Production / Post;
- full Post capacity produces an honest, relievable wait without retaining the Stage;
- active Post visibly differs from idle and uses exact Director/craft presence;
- progress is phase + honest weeks + next milestone, with no invented subphase/percentage;
- Release Ready frees Post capacity and persists uncommitted at tick 1; current saves migrate to
  uncommitted;
- Release Readiness Review names its forecast as locked at Greenlight and distinguishes known,
  committed and unknown facts;
- marketing is read-only and publicity remains separate;
- `Commit <title> to Release` is explicit, stale-safe, idempotent, persisted and TypeScript-owned;
- accepted commitment advances no time, yields one dispatch acknowledgment and creates no result;
- the next studio week releases only committed ready pictures through the existing ID-sorted shared-
  basis batch, leaving uncommitted pictures ready;
- Package 07 result interpretation is untouched;
- Back/Locate/camera/selection state obey Package 02;
- save/load/reconnect do not replay events, lose commitment or bypass the gate;
- two pictures cannot cross-wire identity/capacity/action;
- exact Post facility identity maps to an exact placed body, or P06A is formally scoped to the
  founding body with a separately labeled facility; no first-match lookup;
- narrow, text-scaled, reduced-motion and keyboard/controller journeys pass;
- no production code other than the separately approved future P06A implementation is implied by
  this documentation branch.
