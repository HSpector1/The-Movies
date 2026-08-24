# CODEX World Interaction Package 02 — Builder Annex

## Fable handoff for world selection, navigation, and context interaction

- **Status:** builder-ready documentation annex
- **Design authority:** [CODEX World Interaction Package 02](./CODEX-WORLD-INTERACTION-PACKAGE-02.md)
- **Authority commit inspected:** `a4795ff72a9a790e1cbda06deefd4b76a91df2b0`
- **Repository audit date:** 24 August 2026
- **Production code authorized by this document:** none

This annex does not reopen Package 02's design. It translates the accepted rulings into a
look-here-before-building reference library, an exact reuse map, shared component anatomy,
deterministic state law, and acceptance journeys. If this annex and Package 02 ever differ,
Package 02 wins.

Fable should read only three things before starting P02A:

1. Package 02 sections 4–11 for the accepted interaction contract;
2. this annex for repository seams and proof cases; and
3. the named source files, not a fresh genre survey.

### Repository baselines used by this audit

| Surface | Audited root / branch | Audited commit | Status for implementation |
| --- | --- | --- | --- |
| TypeScript authority and browser reference | This repository, `codex/world-interaction-research-02` | `a4795ff72a9a790e1cbda06deefd4b76a91df2b0` | Authoritative behavior/read-model source and browser oracle |
| Adopted Unity production client | sibling worktree `Project Studio - Current Game Adoption Gate`, `adoption/current-game-unity-gate-client` | `d970b81c2b17383ee71c3c66a5622ecc140473b3` | Current adopted Unity baseline |
| Active CP9 Unity convergence | sibling worktree `Project Studio - Unity Production Convergence 80H`, `campaign/living-lot-client` | `911e87e6aeed6e185ccf6a8d77aff9ec455b404f` | Contains the applicant/Admin dossier and newer camera seams P02A needs; clean and synchronized with `origin/campaign/living-lot-client` at the final audit |

**Implementation-baseline gate:** P02A should be built on the adopted result of CP9, not by
copying active-branch files into the older adopted client. Before production work begins, the
integrator/Owner must name the CP9 commit that becomes the implementation base. This is a branch
sequencing decision, not an unresolved Package 02 design decision.

---

# 1. Comparator reference atlas

These are inspection cards, not summaries. The cited behavior is already part of the accepted
Package 02 evidence set. “Copy” means copy the interaction principle, never the comparator's art,
layout skin, data ownership, or undocumented timing.

## 1.1 Hover and priority-first world disclosure — The Movies

- **Game / source:** *The Movies*, [official English manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040), printed p. 8, **Information Bubbles** and guidance paragraphs.
- **Exact interaction:** resting the pointer on people, buildings, facilities, Stars, movies, or
  cards produced anchored information bubbles after a delay. The most important information was
  shown first; red `!` and blue `i` communicated trouble/information.
- **Fable should study:** the causal link between the physical object and one immediately useful
  fact, and the way priority displaced completeness.
- **COPY PRINCIPLE:** the world should answer “what is this?” and “what matters now?” before a
  management screen is needed.
- **DO NOT COPY:** delayed bubble stacks, permanent name clutter, severity conveyed only by color,
  or a different tooltip grammar per entity.
- **Project: Studio translation:** immediate restrained accent; after 300 ms, one clamped two-line
  label containing identity/type and one current state. Only one ordinary hover label exists.

## 1.2 Person selection and layered identity — Football Manager 2024

- **Game / source:** *Football Manager 2024*, [official Players manual](https://community.sports-interactive.com/sigames-manual/football-manager-2024-fr/joueurs-r5004/), section **Joueurs → Vue d'ensemble et drapeaux de statut** (portrait/information popup paragraphs).
- **Exact interaction:** a player portrait/info control exposes a compact bio and key attributes;
  hover/configuration can alter the small view, context actions remain close, and the complete
  profile remains a deeper destination.
- **Fable should study:** how identity, rapid status scanning, convenient actions, and deep career
  detail are distinct layers rather than one enormous card.
- **COPY PRINCIPLE:** identify first, summarize present state second, route to the canonical profile
  third.
- **DO NOT COPY:** football-specific attribute density, hover-only facts, right-click as the only
  action route, or spreadsheet presentation in the 3D world.
- **Project: Studio translation:** one selected person inspector with no more than six factual rows,
  common Focus/Close/eligible Follow chrome, at most two business actions, and an exact Profile or
  Review route.

## 1.3 Person Select, Focus, Follow, and cycle are separate — The Sims 4 console

- **Game / source:** *The Sims 4*, [official PlayStation 4 manual](https://eaassets-a.akamaihd.net/eahelp/manuals/the-sims-4-ps4-ukanz.pdf), PDF pp. 14–16, **Live Mode → Game Controls**, current activities/mood, and Center on Lot.
- **Exact interaction:** console commands separately select the next Sim, snap to a Sim, toggle the
  follow camera, and center on the lot. Current activity and mood are readable without conflating
  those camera commands.
- **Fable should study:** semantic command separation and controller parity for person-centric play.
- **COPY PRINCIPLE:** Select changes context; Focus frames; Follow tracks; target cycling changes
  pre-focus/selection. Each has one name and one result.
- **DO NOT COPY:** direct household control, Sim need-panel scope, or controller button labels as
  Project: Studio's permanent bindings.
- **Project: Studio translation:** single-click/Confirm selects without moving; `F`, named Focus, or
  same-ID double-select frames; Follow is a separate eligible toggle; Tab/Shift+Tab and bumpers
  cycle semantic targets.

## 1.4 Building selection as a stable contextual gateway — Two Point Hospital

- **Game / source:** *Two Point Hospital*, [official Room Templates deep dive](https://community.twopointcounty.com/two-point-studios/two-point-hospital/blogs/9-room-templates-deep-dive), section **“OK… TALK US THROUGH THE PROCESS OF CREATING A TEMPLATE.”**
- **Exact interaction:** clicking a room opens its information panel on the right; a named tab in
  that stable panel leads into the deeper room-template workflow.
- **Fable should study:** predictable placement, object-to-panel continuity, and a local-to-deep
  route that does not require rediscovering the room.
- **COPY PRINCIPLE:** every operational building opens the same shared inspector location and can
  route to its canonical workspace.
- **DO NOT COPY:** room-template content, a bespoke panel for each building, or hiding routine state
  behind tabs before the building answers what is happening.
- **Project: Studio translation:** selecting Gate/Admin/a later stage opens one building-schema
  inspector: identity, operation, progress/capacity, occupants, blocker/remedy, deep route.

## 1.5 Building state and selected inspector — Planet Zoo

- **Game / source:** *Planet Zoo*, [official Building Your Zoo guide](https://www.planetzoogame.com/help-centre/player-guides/building-your-zoo), facility/habitat information-panel passages; and [Update 1.14](https://www.planetzoogame.com/en-us/news/planet-zoo-update-114-coming-20th-june), staff individual-panel versus Staff Overview passages.
- **Exact interaction:** a selected facility/habitat exposes local condition and actions, including
  capacity/repair or selected views; an individual staff panel remains distinct from the overview.
- **Fable should study:** how a selected object answers its immediate operational question while a
  separate overview owns population-wide management.
- **COPY PRINCIPLE:** local inspector for “this entity now”; deep owner for lists, history, policy,
  and comparisons.
- **DO NOT COPY:** Planet Zoo's full tab count, animal/welfare schema, or any camera mode that opens
  merely because selection changed.
- **Project: Studio translation:** compact selected inspector stays status-first and bounded;
  applicant dossier/Administration workspace remain explicit deeper routes.

## 1.6 Explicit Focus — Planet Zoo

- **Game / source:** *Planet Zoo*, [official The Basics guide](https://www.planetzoogame.com/es-ES/centro-de-ayuda/guias-jugador/the-basics), sections **Navigating Your Zoo → Controls → PC** and **Camera Modes**.
- **Exact interaction:** Select is a primary control while standard, free-look, explore, scenic,
  cinematic, and specialist camera behaviors are separately invoked modes/commands.
- **Fable should study:** explicit camera intent and a stable default management camera.
- **COPY PRINCIPLE:** camera composition is an invoked navigation operation, not a side effect of
  discovering or selecting an entity.
- **DO NOT COPY:** transplanting every camera mode, specialist shortcuts, or an animal-view camera
  as the normal management state.
- **Project: Studio translation:** ordinary selection never moves the camera. Focus preserves
  orientation where possible, uses the safe frame, remains interruptible, and does not Follow or
  open detail.

## 1.7 Locate from management to the exact world entity — Planet Zoo

- **Game / source:** *Planet Zoo*, [official Update 1.0.2 notes](https://store.steampowered.com/news/posts/?appids=703080&enddate=1574848961&feed=steam_community_announcements), patch bullet **“When locating an animal in animal management menu it will now open animal information panel.”**
- **Exact interaction:** Locate from the management list takes the player to the animal and opens
  that animal's information panel rather than ending with camera travel alone.
- **Fable should study:** the completed round trip: list identity → physical entity → same local
  context.
- **COPY PRINCIPLE:** Locate resolves one exact stable reference, selects it, frames it, and opens
  the matching local inspector.
- **DO NOT COPY:** approximate role/name matching, losing list state, auto-follow, or moving when
  the exact entity no longer has a world anchor.
- **Project: Studio translation:** push management origin, revalidate exact kind/ID, reveal world,
  select, Focus, open inspector; Back restores route/tab/filter/sort/scroll/focus and pre-Locate
  camera. A visible Stay in world commits the new world context.

## 1.8 Back and retained context — Xbox UI navigation guidance

- **Game/platform source:** Microsoft, [Xbox Accessibility Guideline 112: UI navigation](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/112), **Implementation guidelines** on consistent controller/keyboard navigation, reflow, alternative point-of-interest lists, and persistent Back navigation.
- **Exact interaction concern:** every navigable surface needs a consistent focus route and a way
  back; spatial points of interest need a non-pointer equivalent.
- **Fable should study:** deterministic focus restoration and one-level Back behavior.
- **COPY PRINCIPLE:** one Back press unwinds one visible layer and returns focus to the invoking
  control/target.
- **DO NOT COPY:** treating accessibility guidance as a visual skin, or letting Escape both close a
  surface and open Pause.
- **Project: Studio translation:** dialog → tool/drag → Follow/close inspection → deep/Locate origin
  → selection → Pause, one step per press. Home is never Back.

## 1.9 Alert explanation before spatial resolution — Planet Coaster 2 and Planet Coaster

- **Game / source:** *Planet Coaster 2*, [official management deep dive](https://www.planetcoaster.com/en-US/news/2024-09-25/deep-dive-mastering-management), **Notifications** and severity/category discussion; *Planet Coaster* 1.0.1, [contemporary patch report](https://www.pcgamesn.com/planet-coaster/planet-coaster-patch-101), notification focus to affected facility/entrance/exit. The second source is secondary corroboration, not timing evidence.
- **Exact interaction:** management notifications categorize operational problems; the earlier
  game's notification path could focus the affected spatial facility.
- **Fable should study:** severity, subject, and spatial destination as structured alert data.
- **COPY PRINCIPLE:** an operational alert must name the problem and provide an exact spatial route.
- **DO NOT COPY:** moving the camera when an alert merely arrives or opens, focusing only a generic
  facility when the causal dependency is known, or executing the remedy on arrival.
- **Project: Studio translation:** Open alert shows subject, impact, cause, and smallest remedy with
  no camera move. Alert Locate revalidates, selects/focuses the subject, distinguishes the cause,
  and opens the inspector at its blocker.

## 1.10 Camera fundamentals — Cities: Skylines

- **Game / source:** *Cities: Skylines*, [official user manual](https://cdn.akamai.steamstatic.com/steam/apps/255710/manuals/CitiesSkylines-UserManual_EN.pdf), PDF pp. 4–5, **Mouse Controls** and **Default Key Commands**.
- **Exact interaction:** edge/keyboard pan, middle-button rotate/tilt, wheel zoom, left selection,
  and right cancellation provide the familiar management-camera base.
- **Fable should study:** predictable direct manipulation plus keyboard redundancy.
- **COPY PRINCIPLE:** stable management-camera inputs and an immediate cancel route.
- **DO NOT COPY:** any fixed speed/binding as sacred, inertia, unrestricted void, or assuming every
  player has a middle mouse button.
- **Project: Studio translation:** Package 02's configurable WASD/arrows, optional edge/secondary
  drag pan, MMB orbit, wheel/trackpad zoom, semantic Focus/Home/Back, safe bounds, and no overshoot.

## 1.11 Close and cinematic inspection are named modes — Planet Zoo 1.14

- **Game / source:** *Planet Zoo*, [official Update 1.14](https://www.planetzoogame.com/en-us/news/planet-zoo-update-114-coming-20th-june), sections **Scenic Camera Mode** and **Cinematic Route Editor**.
- **Exact interaction:** scenic and cinematic camera behavior is entered as a deliberate mode with
  its own route/editor concepts, rather than being an ambiguous meaning of ordinary selection.
- **Fable should study:** explicit entry, visible mode, and reliable exit.
- **COPY PRINCIPLE:** special presentation compositions sit on top of the management camera and
  store a return pose.
- **DO NOT COPY:** implementing a route editor, autoplay fly-bys, or cinematic camera in P02A.
- **Project: Studio translation:** reuse Unity's management/inspection separation where useful;
  keep cinematic/scenic work deferred and never bind it to single-click or ordinary double-click.

## 1.12 Semantic zoom and deliberate removal — OpenRCT2

- **Game / source:** OpenRCT2, local accepted donor analysis [Code Mining Ledger, Entry 4](../../CODE-MINING-LEDGER.md#entry-4--tycoon-camera-zoom-readability-minimap), especially the authored zoom sprites, feature cutoffs, label removal, and tiny-person targeting notes.
- **Exact interaction:** distant zooms do not merely shrink the same detail; features, labels, and
  even tiny entity representations are deliberately substituted or removed.
- **Fable should study:** information hierarchy and target eligibility, not OpenRCT2's renderer.
- **COPY PRINCIPLE:** far-scale readability requires authored semantic cutoffs and aggregation.
- **DO NOT COPY:** a discrete isometric zoom ladder, no-rotation camera, or a minimap requirement.
- **Project: Studio translation:** continuous 3D camera with Management/Medium/Close information
  bands, about 12 percent hysteresis, band-specific label budgets, and no required tiny-person
  clicking at Management scale.

## 1.13 Responsive and reduced-motion architecture — WCAG 2.2 and Xbox

- **Platform/game sources:** W3C [WCAG 2.2 — Reflow](https://www.w3.org/TR/WCAG22/#reflow), [Target Size (Minimum)](https://www.w3.org/TR/WCAG22/#target-size-minimum), and [Dragging Movements](https://www.w3.org/TR/WCAG22/#dragging-movements); Microsoft [XAG 117: Camera motion](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/117), **Implementation guidelines**; and *Two Point Campus*, [PlayStation accessibility listing](https://www.playstation.com/en-us/games/two-point-campus/), accessibility-features section on clear/large text, visual comfort, camera controls, and input relief.
- **Exact interaction concern:** content must reflow without two-axis reading, targets need viable
  size/alternatives, dragging needs an equivalent command, and automatic camera motion must be
  reducible.
- **Fable should study:** one semantic component that changes layout, plus camera commands that can
  snap without changing their result.
- **COPY PRINCIPLE:** parity of information, command, focus order, and state across desktop,
  narrow/controller, text-scaled, and reduced-motion forms.
- **DO NOT COPY:** interpreting a numeric guideline as the entire game UX, making sheet drag the
  only expansion route, or deleting Focus under reduced motion.
- **Project: Studio translation:** 44×44 logical-pixel UI targets; 32×44 minimum person proxy with
  cycle/list alternative; same inspector becomes a 36–46 percent-height bottom sheet below 960 px,
  controller-first, or 200 percent text; camera travel snaps or completes within 100 ms.

---

# 2. Existing Project: Studio reuse map

## 2.1 Ownership law before component reuse

The adopted [Unity production-client decision](../UNITY-PRODUCTION-CLIENT-DECISION.md) remains the
hard boundary:

- TypeScript owns simulation identity, facts, legality, economy, RNG, and state transitions.
- Unity owns presentation-only hover/focus/selection state, camera pose, navigation origins, and
  rendering.
- Unity sends opaque, current-state-bound intents through the bridge; it does not reconstruct rules.
- The browser/Three.js client is a regression and behavior reference even when Unity needs a native
  presentation implementation.

The useful reuse unit is therefore usually a seam or projection, not a copied visual component.

## 2.2 Unity production-client map

Paths below are relative to the active CP9 Unity worktree unless explicitly marked adopted-only.
The first four component families also exist in older form at adopted commit `d970b81`; the mapped
receipt APIs and newer behavior described here must be read from the active CP9 commit.

| Need | Existing path / component | Reuse / Extend / Replace | Why / exact instruction |
| --- | --- | --- | --- |
| One world-selection owner | `Assets/Studio/Runtime/Presentation/StudioSelectionManager.cs` — `StudioSelectionManager.Update`, `Select`, `Pick`, `IsDoubleActivation` | **EXTEND** | Keep the single owner, UI gating, inert selection, selected/hovered separation, and same-object double detection. Replace the one-ray/first-hit policy with semantic candidates; use the platform double-click interval instead of treating current `0.32 s / 24 px` as final; add named Focus and Back semantics. Do not create a second P02A selection manager. |
| Stable selectable presentation seam | `Assets/Studio/Runtime/Presentation/SelectableEntity.cs` — `SelectableEntity.Configure`, `WorldBounds`, `SetVisualState`, `ConfigureSelectionProxy` | **EXTEND** | Reuse exact stable ID, world bounds, selection layer, and focus eligibility. Add semantic kind, anchor/proxy, structured label/state, zoom eligibility, cycle metadata, and independent hover/focus/selected/alert treatments. Adapt the current full-renderer tint/ring; it is not the approved dual-contrast contour/bracket contract. |
| Existing selected receipt / HUD reservation | `Assets/Studio/Runtime/Presentation/StudioHud.cs` — `SelectionReceiptGuiRect`, `SelectionReceiptContainsScreenPoint`, `CalculateSelectionReceiptGuiRect` | **EXTEND** | This already provides one selected surface, safe UI hit capture, and viewport-aware placement. Evolve it into the shared inspector host or replace its contents inside the same ownership seam; do not stack a new inspector beside the 420×146 receipt. |
| Existing production memo and rejection explanation | `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs` — `OnGUI`, `PlayerHasFoundingWorkflow`, `PlayerIsFoundingOption`, `CurrentRejection` | **REUSE + CONTAIN** | The warm-paper memo already shows authoritative journey headline/detail/blocker, a rejection's happened/current-holder/how-to-continue structure, and UI-safe actions. CP9 deliberately removed founding action buttons from it and routes the player to Gate/Admin. Preserve that guidance/rejection authority and styling; do not turn the memo into a second selected inspector or generic alert owner. |
| Current global HUD / attention line | `Assets/Studio/Runtime/Presentation/StudioLivingTimeHud.cs` — `ChipRect`, `ContainsScreenPoint`, `AttentionLine`; `StudioLivingTime.cs` — `StudioLivingTimeController` | **REUSE + RESERVE SPACE** | Reuse its safe area, UI capture, authoritative week/treasury, and one global attention line. Opening selection/context must not invent a pause rule. Its founding guidance and paused reason are global status, not subject/cause/remedy alerts and not a second context card. |
| Management camera motion | `Assets/Studio/Runtime/Presentation/TycoonCameraController.cs` — `ConfigureHome`, `SnapHome`, `FocusOn`, pose smoothing/input | **EXTEND** | Reuse authored Home pose, camera bounds, pan/orbit/zoom core, and focus entry point. Add safe-frame calculation, accepted timings, cursor-directed zoom, interruptible transition state, semantic zoom band/hysteresis, reduced-motion route, and pose capture/restore. Do not replace the camera controller. |
| One immutable input sample and UI capture | `Assets/Studio/Runtime/Presentation/StudioCameraInput.cs` — `StudioCameraInputFrame`, `Current`, `IsPointerOverUi`, `UpdateGestureUiLatch` | **REUSE + EXTEND** | Reuse the one-frame sample and latched “gesture began over UI” law; it already checks EventSystem, workflow, HUD, time HUD, dossier, and inspection controls. Extend the sample into remappable semantic commands and distinguish stationary secondary Cancel from secondary drag pan. Current RMB orbit conflicts with Package 02's default MMB orbit / secondary pan mapping and is not final. |
| Management versus close inspection | `Assets/Studio/Runtime/Presentation/StudioCameraDirector.cs` — `TryEnterInspection`, `ExitInspection`, `ApplyInspectionPose`, Return control | **SELECTIVE REUSE** | Reuse explicit mode ownership, camera priorities, stored management context, UI input exclusion, and visible Return. General Focus is not synonymous with entering this close-inspection mode; add no special actions and do not let same-target double-select toggle modes unpredictably. |
| Authored close-inspection metadata | `Assets/Studio/Runtime/Presentation/StudioInspectionTarget.cs` | **REUSE LATER** | Existing Stage 7/Admin presentation profiles can supply authored bounds/composition for explicit close inspection. They are not entity authority and should not become the shared context read model. |
| Exact applicant world identity | `Assets/Studio/Runtime/Presentation/StudioFoundingGatePresentation.cs` — `StudioFoundingGateContracts`, `SpawnApplicant`, `RefreshIdentity`, `UpdateApplicantMarkers` | **REUSE + EXTEND** | Keep at most three authoritative staged applicants, stable `applicant-<talentId>` presentation IDs, occupancy-stable pads, exact body identity, live names, and selection seam. Replace always-on nameplates with the accepted zoom/priority budget. Extend markers to the shared selection treatment and registry. |
| Existing automatic founding reveal | same file — `RevealFoundingAnchors` | **DO NOT REUSE AS GENERAL GRAMMAR** | It automatically focuses Gate once and Administration when founding becomes ready. Package 02 now says arrival, state change, action completion, notification, and card opening do not move the camera. P02A should use explicit Focus/Locate. Any scripted onboarding reveal would require a separately approved, clearly bounded exception; none is approved here. |
| Accepted applicant dossier direction | `Assets/Studio/Runtime/Presentation/StudioFoundingCardHud.cs` — `StudioFoundingCardLayer`, `OpenReview`, `BackToCompact`, `DrawProfile`, `DrawReview`, `DrawAdminOverview`, `DrawAdminConfirm` | **REUSE + EXTEND** | Reuse the exact selected-ID binding, live projection refresh, portrait/identity hierarchy, warm dossier visual language, explicit review/founding confirmation, stale-offer receipt, and layer/back behavior. Refactor its compact state into the shared inspector schema; do not make its 640×640 review card the routine person inspector. |
| Exact live applicant portrait | `Assets/Studio/Runtime/Presentation/StudioApplicantPortraitCamera.cs` | **REUSE** | It renders the selected exact applicant body to a 256×320 texture. Reuse the same identity-safe portrait source in deep dossier; a compact crop may use it without creating a second portrait identity. |
| Snapshot-to-world projection | `Assets/Studio/Runtime/Presentation/StudioBridgePresentation.cs` | **REUSE + EXTEND** | It already reconciles snapshot buildings/stages/people and caches selectable instances by exact IDs. Register/unregister semantic targets at this reconciliation boundary. Do not query simulation from hover or rebuild identity in the renderer. |
| Current snapshot and removal handling | `Assets/Studio/Runtime/Infrastructure/StudioSnapshotStateCache.cs`; `Assets/Studio/Runtime/Data/StudioLotSnapshot.cs` | **REUSE** | These are the Unity-side current read-model/cache seam. Selection/inspector refresh must resolve through current snapshots and clear/fail closed on removal rather than retain a dead GameObject as authority. |
| Opaque intents and rejection | `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs`; `Assets/Studio/Runtime/Data/StudioBridgeProtocol.cs` | **REUSE, DO NOT WRAP WITH RULES** | Use current session/revision-bound intent submission and rejection/receipt handling for material actions. Selection, Focus, Follow, Locate, and Back remain local presentation commands and send no gameplay intent. |
| Existing Unity proof suites | `Assets/Studio/Tests/EditMode/StudioCameraPresentationTests.cs`, `StudioFoundingPresentationTests.cs`, `StudioApplicantPortraitTests.cs`, `StudioBridgePresentationIdentityTests.cs`, `StudioBridgeProtocolTests.cs`, `StudioBridgeRuntimeContinuityTests.cs`, `StudioRejectionRetentionTests.cs` | **EXTEND** | Preserve their identity, camera, portrait, stale/rejection, and continuity laws. Add P02A state/priority/journey tests beside them rather than replacing these proofs. |

## 2.3 Browser and Three.js behavior-reference map

These components are not instructions to port React or Three.js into Unity. They are executable
product precedents for how Project: Studio already treats exact identity, local context, explicit
focus, deep navigation, and stale projections.

| Need | Existing path / component | Reuse / Extend / Replace | Why / behavior to emulate |
| --- | --- | --- | --- |
| Renderer/host semantic boundary | `ui/src/lot/StudioLotView.ts` — `select`, `clearSelection`, `selectHollywoodGatePlace`, `focusHollywoodGate`, `worldSelection`, `focusHollywoodPlace`, `frameBuilding` | **REUSE AS INTERFACE PRECEDENT** | The host chooses semantic intent; renderer methods select or frame without simulation mutation. Preserve this separation in Unity's interaction state/command dispatcher. |
| Canonical building context projection | `ui/src/lot/buildingInspector.ts` — `LotBuildingInspectorContext`, `lotBuildingInspectorContext` | **REUSE READ MODEL / PORT PRESENTATION CONTRACT** | Already derives identity, role/status, attention/blocker, occupants, facts, legal actions, exact command, and deep destination from authoritative snapshot state; malformed groups fail closed. Unity should consume equivalent bridge fields, not re-derive them. |
| Browser building inspector anatomy | `ui/src/lot/StudioLotScreen.tsx` — `buildingInspectorContents` | **REUSE AS BEHAVIORAL ORACLE** | Current reading order and explicit deep actions prove that physical selection can remain inert and that detail opens only from a labeled action. Package 02's shared sizing/hierarchy supersedes the browser's current visual density. |
| Browser person inspector anatomy | same file — `personInspectorContents`, `recordHollywoodPerson` | **REUSE AS BEHAVIORAL ORACLE** | Already shows presence, current production, role/status, countdown, assignment/career, and Profile for the exact person; switching clears competing contexts atomically and refreshes from the live snapshot. |
| Gate applicant context | same file — `gateContextContents` | **REUSE AS BEHAVIORAL ORACLE** | Exact candidate selection, role/availability/terms/profile/hiring, accessible pressed state, and explicit action flow already exist. Reconcile its content with the accepted Unity dossier rather than designing a third applicant hierarchy. |
| Selection and focus are separate | `ui/src/lot/hollywood/HollywoodScene.ts`; `ui/src/lot/tycoon/TycoonScene.ts` | **REUSE THE LAW** | Current selection visual updates without automatic camera travel; explicit `focusPlace` glides and reduced motion snaps. Preserve this separation and tune it to Package 02's safe frame/timings. |
| Person-over-place hit precedent | `ui/src/lot/hollywood/HollywoodScene.ts` and `ui/src/lot/tycoon/TycoonScene.ts` | **REUSE + GENERALIZE** | People/visitor markers are deliberately ahead of broad place/building hit zones. This is the local precedent for the semantic-priority law in section 5; do not fall back to collider order. |
| Three.js exact pick/selection seam | `ui/src/lot/three/ThreeLotScene.ts` | **REFERENCE ONLY** | It picks people before buildings, paints selection, frames buildings, and suspends input. It lacks hover delay, candidate cycling, Follow, and person Focus; use it as proof of current behavior, not as the complete P02A design. |
| Deep-route mapping | `ui/src/lot/navigation.ts` | **REUSE** | Existing navigation helpers map authoritative context into destinations without mutating simulation. Extend navigation origin/return state around this seam; do not duplicate route knowledge in renderer objects. |
| Presentation-only selection memory | `ui/src/lot/snapshot/selectedBuildingSession.ts` | **REUSE THE BOUNDARY** | It proves selected-building memory can remain presentation state. Generalize the concept to exact entity kind/ID and navigation origin; do not serialize it as gameplay truth. |
| Retained-world overlay and Back | `ui/src/lot/LotRetainedWorkspace.tsx` | **REUSE AS BEHAVIORAL ORACLE** | Existing retained overlay makes the world inert, owns focus, responds to Escape, and restores context. Unity's dossier/Admin workspace should preserve the same interaction result even if its presentation technology differs. |
| Modal profile focus | `ui/src/components/TalentProfileDrawer.tsx` | **REUSE ACCESSIBILITY LAW** | Existing profile surface handles Escape, focus trapping, and focus restoration. Deep dossier/workspace routes must retain those laws; routine inspector selection must not become modal. |
| Notice/receipt behavior | `ui/src/presentation/transientNotice.ts`; `ui/src/shell/AppNotice.tsx`; notice regions in `StudioLotScreen.tsx` | **REUSE + EXTEND** | Existing bounded, polite notices are the right route for stale/disappeared-target receipts. They are not yet a generic subject/cause/remedy alert model. |
| Accepted receipt punctuation | `ui/src/presentation/eventGrammar.ts`; `ui/src/presentation/punctuate.ts` | **REUSE, DO NOT DUPLICATE** | The pure tier table maps already-authoritative receipts to restrained sound/motion descriptors, which existing callers gate for reduced motion, and relies on exact-once announcement owners rather than a second memo. Selection/Focus/Locate emit no receipt cue. Stale-target notices may use the existing notice route, not mint a new event family. |
| Current responsive inspector CSS | `ui/src/lot/lot.css` — `.hollywood-inspector` and width breakpoints | **REFERENCE, THEN ADAPT** | It proves one inspector can reflow and remain input-safe. It currently uses a roughly 282 px right surface and stacked narrow layouts, not Package 02's approved 320–400 px rail / 36–46% bottom sheet; do not copy its dimensions literally. |
| Existing browser regression proofs | `ui/src/lot/WorldFirstWorldInspectorDefault.test.tsx`, `buildingInspector.test.ts`, `NamedPersonWorkCareerInspectorV1.test.tsx`, `WorldFirstGateTalentArrival.test.tsx`, `selectionReassert.test.tsx`, `StudioLotView.hollywood.test.ts`, `LotRetainedWorkspace.test.tsx`; `ui/e2e/lot.spec.ts`, `ui/e2e/named-person-inspector-v1.spec.ts` | **REUSE AS ORACLES** | These cover world-first selection, exact inspector projections, named people, Gate arrival, selection reassertion, retained-workspace behavior, and browser E2E. P02A should not regress them even though its primary implementation is Unity. |

## 2.4 Authoritative identity and read-model map

| Need | Existing path / symbol | Reuse / Extend / Replace | Why |
| --- | --- | --- | --- |
| Person identity | `src/core/types.ts` — `Talent.id`, `Contract.talentId` | **REUSE** | These are canonical identities. `applicant-<talentId>` is a Unity presentation wrapper, never a new talent identity. |
| Founding applicants and signing authority | `src/core/employment.ts` — `beginFounding`; `src/core/actions.ts` — `applyFoundStudio`, `applySignContract` | **REUSE, NEVER PORT RULES** | Deterministic applicant identities and all founding/signing legality stay here. Unity submits the opaque intent only after explicit confirmation. |
| Applicant cards/profile | `ui/src/engine/adapter.ts` — `foundingApplicantCards`, `foundingApplicantRows`, `gateHiringEligibleCards`, `talentProfile` | **REUSE / EXTEND BRIDGE PROJECTION** | Canonical public/perceived profile content and strict candidate validation already exist. Export only the compact/deep fields P02A needs; do not calculate OVR, availability, or offer eligibility in Unity. |
| Exact Gate selectors | `ui/src/lot/snapshot/gateHiring.ts` — `gateHiringMarketContext`, exact-candidate selector | **REUSE** | Duplicate/malformed fields fail closed and exact candidate IDs never fall back. This is the expected Locate/select/stale behavior. |
| Person “doing now” | `ui/src/lot/snapshot/personWork.ts` | **REUSE** | Existing fail-closed work/presence/production projection is the source for immediate person status. It prevents Unity from inferring tasks from animation or coordinates. |
| Building/place identity | `src/core/lot.ts` — `INITIAL_PROPERTY_STRUCTURES`; `ui/src/lot/snapshot/StudioLotSnapshot.ts` — `LotBuildingState`, placed building IDs, `LotPersonState`, production operations | **REUSE** | Use snapshot-stable IDs (`placed-<placementId>` where defined), never display labels, scene object names, or list indices. |
| Alert-like next-event targeting | `ui/src/lot/snapshot/nextEvent.ts` — target/receipt projections and validators | **REUSE THE VALIDATION PRECEDENT** | It demonstrates strict subject/target validation. It is not a complete generic alert projection; subject/cause/remedy alert work remains follow-up. |
| Current bounded notices | `ui/src/lot/livingTurn.ts` | **REUSE FOR RECEIPTS ONLY** | Good source for transient result notices, not for inventing Package 02's generic alert authority. |
| Snapshot and opaque-intent protocol | `bridge/protocol.ts`; `bridge/session.ts` | **REUSE** | Snapshots and current-state-bound opaque intents already reject stale requests without mutation. Selection persistence never implies action validity. |

## 2.5 The five seams Fable should reach first

1. `StudioSelectionManager` + `SelectableEntity`: extend the existing exact-selection owner into the
   semantic target registry; do not create a parallel interaction framework.
2. `TycoonCameraController` + `StudioCameraInput`: extend the existing camera/input path with safe
   framing, accepted commands/timings, origins, and reduced motion.
3. `StudioHud` + `StudioFoundingCardHud`: converge the current receipt and accepted dossier into one
   shared inspector/deep-workspace stack.
4. `StudioFoundingGatePresentation` + `StudioBridgePresentation`: keep the exact applicant body/ID
   projection and register those live anchors; never reconstruct applicant facts in Unity.
5. `lotBuildingInspectorContext` / browser person and Gate inspectors: treat them as the executable
   read-model and behavior oracle for what the Unity inspector displays and how it fails closed.

## 2.6 Proven gaps P02A is allowed to fill

No current component provides all of the following: semantic candidate registry/ranking/cycling,
input-focus distinct from hover/selection, navigation-origin stack, safe-frame Focus contract,
semantic zoom-band service, responsive bottom sheet, or generic controller target navigation.
Those are legitimate P02A presentation additions. There is also no generic authoritative alert
subject/cause/remedy projection or robust Follow anchor contract; those remain follow-up, not an
invitation for Unity to invent them.

---

# 3. Builder component anatomy

All dimensions are logical pixels. Use Project: Studio's current warm dossier/ink/brass visual
identity, typography tokens, spacing rhythm, button treatment, and accepted live applicant portrait.
This section adds structure, not a second art direction. Every displayed fact comes from a current
projection; missing facts collapse their row rather than leaving filler or being inferred.

## 3.1 Shared inspector frame

There is exactly one selected inspector schema and one host. Person, building, alert, and later
vehicle/site variants populate named slots.

```text
┌──────────────────────────────────────┐
│ identity / type              [Close] │  fixed header
│ status badge                         │
├──────────────────────────────────────┤
│ current / doing now                  │
│ assignment, progress, or capacity    │  scrolling body only when needed
│ location, occupants, or destination  │
│ blocker: cause → consequence         │
├──────────────────────────────────────┤
│ [Focus] [Follow if eligible]         │  common navigation chrome
│ [material/remedy] [deep route]       │  0–2 business actions
└──────────────────────────────────────┘
```

- Desktop width at `≥1068`: `clamp(320px, 30vw, 400px)`.
- Width from `960–1067`: 320 px, never more than 34 percent of the viewport.
- Outer safe-viewport gap: at least 16 px from window edges and current HUD reservations.
- Header and actions do not scroll. The body is the only scrolling region.
- UI buttons are at least 44×44; the primary text label, not an icon, names every material/deep
  action. Close may pair a familiar icon with accessible text.
- In the compact selected inspector, **Close means Clear Selection**: remove the exact selection,
  its world treatment, and the inspector in one step, with no camera move. There is no separate
  hidden-but-selected state. An alert sheet's Close closes only that alert sheet; a deep workspace's
  Back/Close pops its navigation origin. Those controls must use distinct accessible names.
- Identity is never truncated before an action label. At constrained width, secondary metadata
  wraps or collapses before the entity name.
- Focus enters at the inspector heading when Open Context is invoked from keyboard/controller;
  ordinary pointer selection does not steal keyboard focus from an active text/control surface.
- One card owns one exact `entity kind + stable ID`. A projection refresh can change facts/actions,
  never the identity displayed by that card.

## 3.2 Hover label

```text
       12–16 px offset
target ───────► ┌────────────────────────┐
                │ Name · role/type       │  line 1
                │ current state/severity │  line 2, optional
                └────────────────────────┘  max width 240 px
```

| Property | Builder contract |
| --- | --- |
| Appearance | Immediate thin hover accent and Inspect cursor/focus reticle; label appears only after 300 ms on the same stable ID. Pointer jitter within that target does not restart the timer. |
| Box | Content-sized, maximum 240 px wide; approximately 10 px horizontal and 8 px vertical internal padding; one line minimum, two lines maximum. Do not reserve a blank second line. |
| Information order | Line 1: proper name + role/class or proper name + entity type. Line 2: one current task, availability, operation, progress, or highest severity. Never show an action list. |
| Placement | Start 12–16 px outside the target's projected bounds and away from the pointer hotspot. Prefer above/right; flip below/left when required. |
| Clamp | Clamp to the safe world viewport, excluding fixed inspector/HUD/sheets. If clamping would cover the target or pointer, flip first; if neither side fits, pin to the nearest safe edge and retain a short leader/bracket association. |
| Motion | Track a moving anchor with restrained smoothing, but stop chasing when the anchor leaves the safe viewport. Do not animate in/out under reduced motion. |
| Suppression | Modal/tool UI, non-eligible zoom band, pointer leaving target, target loss, or a higher-priority ordinary hover replaces/removes it. Selected and alert-linked identity labels use their separate budgets. |
| Accessibility | The same two facts are the first facts in selected context and the structured focus label. No fact/action is hover-only. |

## 3.3 Person inspector

The compact person inspector borrows the accepted applicant dossier's identity-first hierarchy and
live portrait, not its deep-card size.

```text
┌──────────────────────────────────────┐
│ [portrait]  JUNE MERCER      [Close] │
│             Applicant · Writer       │
│             AVAILABLE                │
├──────────────────────────────────────┤
│ DOING NOW   Waiting at Studio Gate   │
│ WORK        Not assigned             │
│ MOVEMENT    Gate forecourt            │
│ AVAILABILITY Can review offer        │
│ ! BLOCKER   exact top blocker [opt.] │
├──────────────────────────────────────┤
│ [Focus] [Follow only if live anchor] │
│ [material/remedy] [Review or Profile]│
└──────────────────────────────────────┘
```

The final row is conditional: when there is no legitimate material/remedy action, show only the
one exact deep route (`Review applicant` in P02A) in slot 1 and omit slot 2.

| Slot | Required content and collapse law |
| --- | --- |
| Header | Exact portrait when available (compact crop of the existing live source), full display name, one role/class line, one text-and-shape status token. Identity text remains if portrait is unavailable. |
| Doing now | One plain-language authoritative current activity. Examples: `Waiting at Studio Gate`, `Writing · Crimson Avenue`, `Directing Stage 7`, `Off lot`. Never derive this from animation. |
| Production / assignment | Exact production, department, team, or candidacy context; omit when no authoritative relationship exists. Applicant terms belong in Review, not as six compact rows. |
| Destination / location | Show destination only when authoritative and useful; otherwise show current known location/presence. Selected-only route visualization may accompany it later. |
| Availability / welfare | One highest-value availability or wellbeing line. Applicants show candidacy/offer availability; ordinary employees show current work availability; Stars may show highest-priority welfare/commitment. |
| Blocker | At most one: `cause → consequence`, plus `1 of N` when grouped. Omit the entire slot when clear. Do not silently turn lack of data into `No blockers`. |
| Common actions | Focus, Close, and labeled Follow only when a trustworthy current live anchor exists. These do not consume business slots. |
| Business slot 1 | Highest-priority currently authorized material action/remedy; otherwise the deep route. In P02A, `Review applicant` takes this slot when no immediate material action belongs on the compact card. A later material command always revalidates before mutation. |
| Business slot 2 | `Profile`, `Review applicant`, or role-specific canonical deep route when slot 1 is material. Omit if there is no second legitimate route. |

Role-specific population is data, not a new layout:

| Person class | Header/status emphasis | “Doing now” / assignment emphasis | Deep route |
| --- | --- | --- | --- |
| Applicant | Applicant + requested role; unsigned/outside-studio state | Waiting location, offer availability, top concern | Review applicant / canonical talent dossier as one exact deep flow |
| Ordinary employee | Job family and availability | Current task, department/production, destination | Employee profile/workspace |
| Star | Star discipline and current commitment/welfare exception | Current production/scene, call/availability, destination | Star profile/career |
| Director | Director role + production state | Current film/phase/stage; next blocking dependency | Director profile or exact production |
| Writer | Writer role + script assignment | Draft/project and phase; delivery/blocker | Writer profile or exact script |
| Craft/crew | Craft specialty/department | Shift/task/production; destination | Crew/department record when one exists |
| Decorative extra | No managed inspector | Never enters authoritative registry | None; decoration is ineligible |

## 3.4 Building inspector

```text
┌──────────────────────────────────────┐
│ ADMINISTRATION              [Close]  │
│ Studio office · FOUNDING READY       │
├──────────────────────────────────────┤
│ CURRENT     Founding available       │
│ PROGRESS    2 of 3 required hires    │
│ OCCUPANTS   June, Rafael, Mae +2     │
│ ! BLOCKER   Hire one Director        │
│             Studio cannot be founded │
├──────────────────────────────────────┤
│ [Focus]                              │
│ [Review requirement] [Open workspace]│
└──────────────────────────────────────┘
```

| Slot | Required content and collapse law |
| --- | --- |
| Identity | Proper name, functional type, text-and-shape status token. A stage uses its authored operational identity (`Stage 7`), not the clicked prop name. |
| Operation | One current authoritative statement: idle, filming, writing, hiring, closed, under construction, etc. |
| Progress / capacity | One primary measure and optional short secondary measure. Examples: scene/phase progress, `2/3 hires`, `4/6 occupants`, construction percent. Hide when not meaningful. |
| Occupants | Up to three exact managed people in authority order plus `+N`; selecting a person is explicit and must not change selection merely because their name appears. Empty and unknown are different states. |
| Blocker | One highest-priority cause, consequence, and responsible dependency; show `1 of N` for a group. Working/clear buildings do not receive a decorative green blocker row. |
| Remedy | Smallest useful currently authorized route/action. `Review requirement` is preferable to a generic `Manage`. A material remedy still requires explicit confirmation/revalidation. |
| Deeper route | Exact `Open Administration`, `Open production`, `Open facility`, or equivalent canonical owner. Generic `Details` is insufficient when the destination is known. |

Building states use the same card:

- **Normal/unselected:** authored activity and only band-budgeted labels; no card.
- **Hover:** footprint/roofline accent and two-line label.
- **Selected/idle:** identity + idle/available answer; omit empty progress/blocker slots.
- **Selected/working:** current operation is first; progress/capacity and up to three occupants
  follow; no looping halo.
- **Selected/blocked:** shaped alert token; blocker is expanded to cause → consequence; smallest
  remedy becomes business slot 1; deeper workspace remains slot 2.
- **Construction/vacant:** dashed/corner boundary visual and the same identity/status schema; do not
  expose scaffolding pieces or ground points as separate semantic entities.

## 3.5 Alert sheet

The alert sheet is a temporary attention variant in the same inspector rail/bottom-sheet host. It
does not replace world selection and does not let world input click through it. Closing it reveals
the previous inspector unchanged.

```text
┌──────────────────────────────────────┐
│ [severity shape] STAGE 7 BLOCKED [X]│
│ Production · Crimson Avenue          │
├──────────────────────────────────────┤
│ IMPACT   Scene 3 cannot begin        │
│ CAUSE    Scenery package missing     │
│ REMEDY   Review required scenery     │
│          Cause 1 of 2                │
├──────────────────────────────────────┤
│ [Locate] [Review scenery]             │
└──────────────────────────────────────┘
```

- Header: severity icon/shape + exact subject name + concise state. Severity never uses color alone.
- Body order: impact, exact cause, smallest available remedy, grouping position (`1 of N`).
- `Locate` is navigation, not acknowledgement or remedy. Opening the sheet never moves the camera.
- A remedy action opens the narrow authoritative workspace/confirmation and revalidates.
- Resolved-before-Locate: mark/history presentation becomes resolved, Locate disables, camera and
  world selection remain unchanged.
- Missing subject: retain the historical explanation if authority supplies history; no last-known
  camera jump, no substitute.
- Generic alert projection and Stage 7 rollout are follow-up. P02A may prove the surface with a
  current bounded notice only when the source projection supplies exact subject/cause fields; it
  may not infer them.

## 3.6 Selection treatment

| State | Visual anatomy | Persistence |
| --- | --- | --- |
| Hover | 1–2 px screen-space dual-contrast rim or ground bracket; Inspect cursor | While one eligible target is hovered/focused |
| Keyboard/controller input focus | Moving reticle with explicit corners + hover-equivalent label; geometry differs from hover | Until Confirm, Cancel, category/filter change, invalidation, or world-focus exit |
| Selected | Stable 2–3 px dual-contrast contour plus ground/footprint brackets and selected nameplate | Across camera/zoom and fresh snapshots while exact identity remains valid |
| Alerted | Shaped severity badge and optional short subject→cause connector; never only a red/amber glow | While alert is current/located; two pulses over 900 ms only when newly surfaced, then static |
| Occluded/offscreen selected | Restrained edge locator with name/type and direction; no full x-ray silhouette | While exact identity has a valid world anchor outside the safe frame |
| Lost anchor | No outline/locator; inspector retains exact identity and says authoritative location/unavailability | Until anchor returns, selection changes, or identity is removed |

Decorative submeshes resolve to their owning semantic entity or remain ineligible. Working activity
comes from authored animation/signage, never from a permanent selection ring. Hover, input focus,
selection, and alert must remain distinguishable in monochrome.

## 3.7 Focus and Locate affordances

- **Focus** lives in common inspector chrome, has a visible text label and shortcut hint (`F` when
  bound), and is enabled only with a current focus anchor. It frames the current selection in the
  safe world viewport. It never changes selection, opens deep detail, starts Follow, or sends an
  intent.
- **Double-select** is only a pointer convenience for Focus on the same stable ID within the
  platform interval. The first click selects immediately. It is never the only Focus route.
- **Locate in world** lives on relevant management rows/cards/workspaces. It carries exact entity
  kind/ID plus a navigation origin. Use the full label at first/primary exposure; an icon may be a
  redundant secondary representation.
- **Located state** keeps a visible `Back to <workspace>` action and a separate `Stay in world`.
  Back restores the full origin; Stay discards the origin and preserves the located camera/selection.
- **Unavailable anchor:** disable Locate with a concise known reason (`Off lot`, `No current world
  position`) or return the same result after revalidation. Do not move the camera.
- **Edge locator:** selecting Home or manually moving away may leave a valid selected target
  offscreen. The edge locator offers Focus; it does not auto-follow or auto-pan.

## 3.8 Responsive bottom-sheet version

At viewport width below 960 px, controller-first navigation, or 200 percent text, the same schema
reflows; no alternate business logic or abbreviated “mobile” truth is allowed.

```text
┌──────────────────── safe world above ────────────────────┐
│ selected target is framed above, never beneath sheet     │
├──────────────── bottom sheet: 36–46% h ──────────────────┤
│ identity / status                            [Close]      │
│ current + highest blocker                    [Expand]     │
│ [Focus] [Follow] [primary] [deep route]                   │
└───────────────────────────────────────────────────────────┘
```

- Default collapsed height: choose within 36–46 percent so header, current state, highest blocker,
  and actions remain visible at supported minimum height. Safe-frame Focus excludes the sheet.
- Expand opens a full-height, one-axis scrolling detail surface; Collapse returns to the prior
  height and focus. A drag handle can be a convenience, never the only route.
- Header/actions remain reachable; body scrolls vertically. No horizontal scroll at 200 percent
  text.
- The selected anchor may remain visible above the sheet through safe framing. The sheet never
  chases a moving person or repositions laterally.
- Controller focus order is header → factual rows/links → common navigation → business actions.
  Directional/focus navigation remains within the sheet; Back uses the global stack and never
  collapses the sheet merely because this responsive form is active.

## 3.9 Semantic zoom presentation inputs

The camera remains continuous; only presentation eligibility changes. The shared camera service
publishes one stable band with about 12 percent threshold hysteresis. Cards/inspectors do not close
or change identity on a band change.

| Band | World information | Target and label law |
| --- | --- | --- |
| Management | Building/production operation, traffic flow or aggregates, major alerts, parcel/site boundaries, authored landmarks | Ordinary tiny people leave pointer hit/label budgets. Buildings/places and alert subjects dominate. A selected or alert-linked person retains a deliberate locator and list/cycle route. |
| Medium | Staff movement, local building state, applicant queues, production transitions | Managed people use forgiving screen-space proxies and become ordinary candidates. Hover/selected/decision/blocker labels fit the local budget; no all-names layer. |
| Close | Individual identity, filmmaking activity, destinations/local stories supplied by authority | Person and stateful-prop inspection is available; selected/current local facts may gain detail, but only one ordinary hover label and the same fixed inspector exist. Decoration remains ineligible. |

When crossing a threshold, fade/substitute label and proxy presentation without camera travel,
selection loss, or simulation query. The band service is presentation-only and simulation logic
must never branch on it.

---

# 4. Interaction state matrix

This table is exhaustive for the shared presentation state. “No material action” means selection,
camera, navigation, and presentation commands are allowed, but simulation-changing commands occur
only through a separately labeled, authoritative, freshly validated action.

| State | Visible treatment | Allowed commands | Forbidden commands | Camera behavior | Selection behavior | Back / Escape result |
| --- | --- | --- | --- | --- | --- | --- |
| Normal | Authored world activity; only band-budgeted landmark/status labels | Pan, orbit, zoom, Home, pointer inspect, enter world target cycle, open management/alert UI | Implicit actions from hover/camera; decoration targeting | Manual input only | None; this row is the neutral lot state | Opens Pause |
| Hover | Immediate 1–2 px accent + Inspect cursor; two-line label after 300 ms | Single-select, same-neighborhood cycle, pan/zoom when gesture is classified as camera | Action, camera move, Follow, deep open, tooltip stack | None from hover | Existing selection remains; hovered target is separate | Hover consumes nothing; next applicable lower stack item executes |
| Input focus | Distinct reticle + structured two-line label; `N targets · Cycle` when ambiguous | Cycle, Confirm/select, Focus only after a target is selected, category filter, Cancel | Treating pre-focus as selection/action; pointer-only fact | None until explicit Focus | Confirm atomically selects exact pre-focused ID | Cancel clears pre-focus/snapshot and returns to neutral world focus |
| Selected | 2–3 px contour/brackets or offscreen edge locator, selected nameplate, fixed inspector | Switch, Deselect/Close, Focus, Open Context, eligible Follow, explicit deep/material actions, Home | Auto-camera, auto-Follow, implicit action, approximate identity, hiding the card while retaining a secret selection | No movement on selection; manual camera remains free | Exact kind/ID persists across camera/zoom and refresh | Clears ordinary selection, treatment, and inspector after higher layers are gone |
| Focus transition | Static selected treatment; target framed against current safe viewport | Manual camera cancel, retarget Focus, open/select without restarting, Back | Queued transitions, Follow by arrival, material action | 260 ms local / 420 ms cross / ≤650 ms large; Home 420; manual input interrupts at current pose | Unchanged unless player explicitly switches | Cancels transition/close-inspection layer as applicable; never clears selection in same press |
| Follow | Selected treatment + labeled active Follow state; live anchor in soft dead zone | Orbit/zoom composition, Stop Follow, open same context | Assignment/control inference, micro-correction outside dead zone, unavailable target | Tracks only live anchor; direct pan/edge/WASD/Home/other Focus/deep route ends Follow | Must remain the same exact trackable ID; switching ends Follow | Stops Follow and restores stored pre-Follow pose when origin is still current |
| Deep management | Retained world visibly inert; exact workspace heading/record focused | Workspace navigation/actions, Back; exact routes defined there | World click-through, camera move on open, duplicate origin per tab, identity substitution | Preserved and stationary | Preserved behind workspace; no renderer authority | Pops one workspace origin, revalidates, restores world pose/selection/inspector/focus |
| Locate | Workspace retreats; located subject selected; `Back to …` and `Stay in world` visible | Interrupt Focus, Back to management, Stay, inspect located target | Substitute target, action on arrival, automatic Follow | Revalidate then Focus current anchor using normal timings; no anchor means no move | Exact located ID replaces world selection; origin stores prior selection | Restores route/tab/filter/sort/scroll/focus and pre-Locate camera; Stay explicitly discards origin |
| Alert sheet | Severity shape, subject, impact, cause, remedy; previous inspector retained underneath | Close, Locate, exact remedy/deep route, alert-group navigation | Camera move on open/arrival; implicit acknowledge/remedy | None until explicit Locate | World selection unchanged on Open | Closes alert sheet and restores its invoking alert control/previous inspector |
| Stale target/action | Exact identity remains if valid; refreshed facts; unavailable action disabled plus concise receipt | Refresh/retry route, Focus if current anchor exists, close/switch | Using cached legality, silent fallback, moving to old anchor | None unless a fresh explicit Focus succeeds | Retain valid identity; action failure cannot silently switch it | Normal one-layer unwind; receipt itself does not trap Back |
| Lost world anchor | No outline/edge locator; inspector says exact known state (`Inside Administration`, `Off lot`) | Open canonical profile/management; Reacquire only after anchor exists; switch/close | Locate/Focus/Follow while anchor absent; last-known jump | Follow ends without jump; camera remains at current pose | Retain exact identity while authority still owns it | Clears selection only at ordinary selection step; deep Back still restores context |
| Destroyed / retired / released | Selection treatment disappears; one polite non-blocking “no longer available” receipt | Continue in world; open authority-owned historical record only if one exists | Minting tombstone/last position; same-name/role substitution | No move | Clear selection and inspector; focus neutral lot heading | Receipt consumes no layer; normal neutral-lot Back rules apply |
| Overlapping targets | Highest-ranked pre-focus; `N targets · Cycle`; each cycle updates reticle/name | Cycle forward/back, Confirm exact candidate, pointer exit/cancel | Collider-order selection, click-through decoration, double-click cycling | None until selected target receives explicit Focus | Candidate snapshot frozen; Confirm selects one exact stable ID atomically | Cancel discards candidate snapshot; existing selection remains |
| Modal surface | Only an approved blocking confirmation/policy surface (and an established deep profile only where its retained behavior is explicitly preserved); never routine selected context | Modal controls, Confirm/Cancel, accessible focus navigation | World hover/select/pan/cancel behind surface; person/building inspector or ordinary deep workspace as modal | Camera remains stationary | Preserved behind modal | Closes only top modal and restores invoking UI focus |
| Narrow viewport | Same inspector schema as 36–46% bottom sheet; selected target safe-framed above | Same semantic commands; explicit Expand/Collapse; single-axis scroll | Alternate action legality/order, hidden blocker/action, drag-only expansion, viewport-specific Back semantics | Safe viewport excludes sheet; no lateral panel compensation | Same exact selected ID | Uses the same global stack as desktop. Only explicit Collapse changes sheet height; Back does not acquire a new responsive-only meaning |
| Reduced motion | Static focus/selection confirmation; no travel flourish/pulse/chasing label animation | All identical semantic commands | Removing Focus, information, or target confirmation | Programmatic movement snaps or ≤100 ms; manual sensitivity settings still apply | Identical persistence | Identical stack and restored destination, without animated travel |
| Controller navigation | Visible reticle/focus ring; structured label; button prompts from current binding | Bumpers cycle, directional UI/spatial neighbors, Confirm, Focus, Follow, Home, Back, filters | Required hover, rapid double-confirm, hold/chord/drag, focus loss | Same commands/timings; right/left sticks and triggers map semantically | Pre-focus distinct until Confirm; exact ID thereafter | One layer only; returns focus to invoking world target/control |

---

# 5. Semantic target priority

## 5.1 Deterministic acquisition pipeline

Selection is a presentation interaction law over authoritative entity references. The renderer may
rank eligible references; it may not decide who exists, what they are allowed to do, or whether a
material action is legal.

Run these gates in order:

1. **UI capture:** if the pointer/gesture began over fixed or modal UI, the world receives no
   pointer button, hover, drag, pan, or Cancel from that gesture. Keep `StudioCameraInput`'s gesture
   latch.
2. **Mode capture:** a visible Build/Move/Assign tool narrows candidates to that tool's declared
   target classes. Inspect-mode ranking does not leak through the tool.
3. **Eligibility:** require exact stable ID, semantic kind, active current projection, a valid
   visible/proxy anchor for the current zoom band, and category-filter eligibility. Decoration is
   rejected here.
4. **Candidate assembly:** collect visible ray hits plus registered screen-space proxies whose
   projected target lies within the pointer/controller neighborhood. For ambiguity, use the
   accepted 12 logical-pixel neighborhood. A proxy may enlarge a visible entity; it cannot make a
   fully occluded object beat a visible foreground target.
5. **Rank and expose ambiguity:** apply the tuple below. Select immediately only when the top result
   is unambiguous; otherwise show/cycle a frozen candidate snapshot.

## 5.2 Inspect-mode priority tuple

Attention state is deliberate but not x-ray priority. A selected building behind a visible
applicant must not steal the applicant's body click. Selected/alerted state ranks first only when
the pointer is actually on that entity's visible contour, nameplate, badge, connector, or edge
locator.

Rank lexicographically, lowest value winning:

1. **Direct semantic token:** visible selected locator/contour/nameplate; then visible alert subject
   or cause badge/connector; then other intentionally interactive world UI token.
2. **Active-tool target:** only while the tool is visibly active and after its eligibility filter.
3. **Semantic class:**
   1. named/authoritative managed person at Medium or Close;
   2. operational building or stage/set surface (an independently managed stage beats its owning
      building when the visible stage surface itself was hit);
   3. managed vehicle;
   4. construction site;
   5. vacant parcel;
   6. independently stateful interactive prop;
   7. decoration — ineligible, never returned.
4. **Visible coverage:** direct visible rendered surface before enlarged proxy-only coverage.
5. **Attention tie-break:** exact currently selected ID, then active-alert subject/cause ID, but only
   within the same semantic class and comparable visible coverage.
6. **Geometry:** nearest visible surface depth, then smallest screen-space distance to the
   pointer/reticle.
7. **Stable determinism:** semantic kind ordinal, then stable ID using ordinal byte/string order.

At Management band, ordinary individuals are removed before ranking. A selected or alert-linked
person can remain as a deliberate locator/token, not a tiny body collider. Broad invisible Gate or
building zones therefore never outrank visible applicants, matching the browser's existing
person-over-place precedent.

## 5.3 Candidate cycling

### Ambiguous pointer neighborhood

- If two or more valid targets remain in the 12 px neighborhood, render `N targets · Cycle`.
- Freeze their ranked exact references. Tab/Shift+Tab or shoulder inputs move pre-focus; pointer
  hover may show the top candidate but does not select until click/Confirm.
- The reticle, label, and accessible announcement update to the cycled target.
- Confirm selects only the pre-focused ID. Double-click never cycles; it remains same-ID Focus.
- Invalidate the snapshot on Confirm, Cancel, pointer exit from the neighborhood, entity removal,
  modal/tool capture, or loss of the active viewport.

### Controller/keyboard world cycle

- When world focus is active and ambiguity is absent, the first Tab/bumper press snapshots all
  eligible targets in the safe viewport for the active band and category: `All`, `People`,
  `Places`, or `Alerts`.
- Sort by the same semantic class, then screen-space distance from current reticle/viewport focus,
  then visible depth, then stable ID. Preserve this frozen order while cycling.
- Invalidate on Confirm, Cancel, camera movement, zoom-band/category change, target removal, modal
  open, or world-focus exit. Do not reshuffle every snapshot tick.
- Tab inside the inspector/deep workspace remains normal UI focus navigation. World cycling is
  active only when the world target layer owns focus.
- A target that invalidates while pre-focused is removed and focus advances deterministically to
  the next frozen candidate; if none remain, return to neutral world focus and announce that no
  target is available.

## 5.4 Registry payload Fable may require

Every semantic target needs a presentation projection of: entity kind; exact stable ID; current
eligibility/presence; display label; one structured current-state line; world anchor and bounds;
screen-space proxy/minimum size policy; valid zoom bands; selected/alert associations; focus
framing hint; trackable-anchor flag; category and stable cycle metadata; and deep-route/capability
references already supplied by authority. This is metadata for discovery and navigation. It cannot
contain duplicated hiring/founding/production rules.

---

# 6. Golden UX journeys

These journeys are the acceptance contract. Automate deterministic state/projection assertions in
EditMode/unit tests and retain a manual or PlayMode proof for focus, composition, occlusion, and
responsive presentation. Instrument at least: command, source surface, exact target kind/ID,
previous/next presentation state, transition result/cancel reason, origin push/pop, and stale or
unresolved outcome. Do not log hidden applicant traits or duplicate simulation decisions.

## Journey 1 — Applicant hover → select

**Given:** three Gate applicants are staged, each with a distinct authoritative `talentId`; one
building proxy overlaps the rear of the middle applicant.

**Steps:**

1. Move the pointer onto the visible body of the middle applicant.
2. Observe immediate affordance, wait 300 ms, then single-click once.

**PASS:** within one rendered frame only that applicant gets the restrained hover accent/Inspect
cursor. Before 300 ms no label appears; after it, one two-line label shows the exact name/role and
one current state. The body beats the broad building proxy. One click selects the exact applicant,
opens the person inspector, and changes no camera pose, simulation revision, time state, RNG, save,
offer, contract, or employment state. The label/inspector facts match the current authority.

**Best existing proofs to extend:** `StudioFoundingPresentationTests.cs`,
`StudioBridgePresentationIdentityTests.cs`, `WorldFirstGateTalentArrival.test.tsx`.

## Journey 2 — Select → Focus

**Given:** the selected applicant is valid, visible, and has a current world anchor outside the
inspector's safe-frame center.

**Steps:** invoke the labeled Focus action or `F`; repeat with same-ID pointer double-select; during
a third attempt, supply manual pan input halfway through. Then separately prove a stationary
secondary click below four logical pixels, a secondary-button drag beyond the threshold, and an
MMB drag, reselecting the applicant as needed between cases.

**PASS:** named Focus and double-select produce the same framing result and no deep route/Follow.
The target is framed at readable medium/close scale in the safe viewport, never under the inspector.
Local travel uses about 260 ms; a cross-lot/cross-band setup uses about 420 ms and never exceeds
650 ms for a large correction. Orientation is preserved unless it hides the target. Manual input
cancels at the current pose with no snap-back or queued continuation. Selection and simulation
state remain unchanged.

The gesture subcase also passes only when stationary secondary click performs the bounded pointer
Cancel, secondary drag pans without also canceling on release, MMB drag orbits, and a gesture begun
over UI performs none of those world operations. Bindings remain configurable.

**Best existing proof to extend:** `StudioCameraPresentationTests.cs`.

## Journey 3 — Switch selected person

**Given:** applicant A is selected with the inspector open; applicant B is also eligible.

**Steps:** single-click B once, including a click made soon after A's previous click.

**PASS:** A's treatment disappears and B's appears atomically; the inspector changes to B's exact
ID/current projection without an empty interstitial, camera movement, or accidental same/different
target double activation. Any Follow on A ends. No prior applicant facts/actions survive. UI has
one inspector and one selection; no material intent is sent.

**Best existing proofs to extend:** `selectionReassert.test.tsx`,
`StudioBridgePresentationIdentityTests.cs`.

## Journey 4 — Deep profile → Back

**Given:** one applicant is selected and the inspector shows `Review applicant`/`Profile`.

**Steps:** record camera pose; open the exact deep applicant route; navigate/focus a safe control;
press Back once.

**PASS:** the retained-world surface opens on the exact `talentId`, the world remains visible but
cannot receive click/pan through the surface, and accessible focus starts at the deep heading. Open
does not move the camera. One Back closes only the deep layer and restores the same camera pose,
selection, inspector state, and invoking control/world-target focus. No duplicate origin was pushed
by internal tab changes.

**Best existing proofs to extend:** `StudioFoundingPresentationTests.cs`,
`LotRetainedWorkspace.test.tsx`, `TalentProfileDrawer.tsx` behavior.

## Journey 5 — Management list → Locate → Back

**Given:** a management/candidate list has filter, sort, scroll, and focused-row state; its exact
applicant currently has a live anchor.

**Steps:** invoke `Locate in world` on that row; after camera arrival, press `Back to <workspace>`.

**PASS:** Locate revalidates exact kind/ID, retreats the workspace, selects only that applicant,
Focuses its current anchor, and opens the matching inspector. A visible Back and separate Stay in
world are available. Back restores the pre-Locate camera pose and exact route/tab/filter/sort/
scroll/focused row. It does not return Home or select the first applicant with the same role/name.

**Best existing proofs to extend:** `WorldFirstGateHiringReturnApp.test.tsx`,
`StudioLotView.hollywood.test.ts`.

## Journey 6 — Administration → workspace → Back

**Given:** Administration exists in the current founding/operational projection.

**Steps:** single-select Administration; inspect its local answer; invoke the exact Administration
workspace; press Back.

**PASS:** selection alone does not move camera or found/spend. The building inspector states exact
identity, current founding/operation state, progress/capacity if supplied, highest blocker, and an
explicit workspace route. Deep open preserves camera and selection and opens the authoritative
Administration context. Back restores the same world context. Any `Found studio` action remains a
separate explicit confirmation and fresh opaque intent.

**Best existing proofs to extend:** `StudioFoundingPresentationTests.cs`,
`WorldFirstWorldInspectorDefault.test.tsx`, `buildingInspector.test.ts`.

## Journey 7 — Selected target leaves the lot

**Given:** a managed person is selected and Follow is active in a follow-up-capable build; authority
keeps the identity but changes presence to a valid off-lot/interior state with no world anchor.

**Steps:** apply the fresh snapshot while the camera is tracking.

**PASS:** Follow stops without a camera jump; outline and edge locator disappear; exact selection
and inspector remain; the inspector states the authoritative known status (`Off lot` or exact
interior). Focus/Locate/Follow are unavailable while no anchor exists. Profile remains available if
authority supplies it. The client does not preserve a fake position or substitute another body.

**Best existing proofs to extend:** `StudioBridgeRuntimeContinuityTests.cs`,
`NamedPersonWorkCareerInspectorV1.test.tsx`.

## Journey 8 — Stale target / stale action

**Given:** an applicant is selected and Review is visible; before activation, a newer snapshot
removes eligibility or the authority rejects the stale state-bound intent.

**Steps:** invoke Review or its explicit confirmed action against the fresh/rejected state.

**PASS:** the command revalidates. No contract/hire/founding mutation occurs; no cached eligibility
is executed; no other applicant is used. If identity still exists, selection and refreshed facts
remain and the obsolete action disables/disappears with one concise receipt. If identity was
removed, selection clears and neutral world focus is restored. Camera does not move.

**Best existing proofs to extend:** `StudioRejectionRetentionTests.cs`,
`StudioBridgeProtocolTests.cs`, `ui/src/lot/snapshot/gateHiring.test.ts`.

## Journey 9 — Overlapping applicant and building

**Given:** a visible named applicant, an operational Gate/building surface, and an independently
valid semantic token all intersect one 12 px neighborhood.

**Steps:** point at the visible body; point directly at the selected building's visible nameplate;
then enter the shared ambiguous neighborhood and cycle forward/back before Confirm.

**PASS:** the applicant wins its visible body over broad/invisible place zones. The selected
building wins only on its deliberately visible token/contour, not as an x-ray override. Ambiguity
shows `N targets · Cycle`; the frozen ordered IDs remain stable across snapshot refreshes that do
not invalidate them; label/reticle follow the cycle; Confirm selects exactly the pre-focused ID.
Decoration never appears. Double-click still Focuses the same selected ID and never cycles.

**Best existing proofs to extend:** browser `HollywoodScene.ts` selection tests,
`StudioSelectionManager` tests, accepted Role Atlas regression.

## Journey 10 — Alert → explanation → Locate

**Given:** authoritative alert projection: subject Stage 7, impact “Scene 3 cannot begin,” cause
missing scenery, remedy route, group `1 of 2`.

**Steps:** open the alert; verify the world; invoke Locate; inspect subject/cause; invoke no remedy.

**PASS:** Open shows severity shape, exact subject, impact, cause, remedy, and group position without
changing world selection or camera. Locate revalidates, selects/focuses Stage 7, gives the missing
scenery a visually distinct cause treatment/connector, and opens the Stage inspector at blocker.
No scenery is purchased/assigned and no alert is acknowledged by navigation. If resolved before
Locate, it moves to resolved history/updates presentation, disables Locate, and camera stays put.

**Implementation phase:** follow-up after P02A unless a current exact alert projection exists;
automate the state law now if the shared presentation state is introduced.

## Journey 11 — Narrow layout and 200 percent text

**Given:** the selected applicant has the maximum six factual rows, one blocker, two business
actions, and common Focus/Follow/Close actions.

**Steps:** resize from 1068 to 960 to 959 logical pixels; repeat at 200 percent text; Focus target;
navigate the entire surface with keyboard/controller.

**PASS:** ≥1068 uses the 320–400 px rail; 960–1067 uses 320 px capped at 34 percent; below 960,
controller-first, or 200 percent uses the same-schema 36–46 percent-height bottom sheet. Header,
blocker, and primary/deep actions remain reachable; only the body scrolls in one axis; no horizontal
scroll or clipped text; focus order matches reading order. Expand/Collapse has a click/command
alternative. Focus frames above the sheet, not beneath it.

**Best existing proofs to extend:** responsive `lot.css` tests/visual checks, XAG/WCAG checks.

## Journey 12 — Keyboard/controller target cycle

**Given:** world focus, a safe viewport containing applicants, Gate, Administration, decoration,
and one management-band setup.

**Steps:** use Tab/Shift+Tab and controller bumpers with `All`, `People`, and `Places`; Confirm one;
move camera; enter inspector and press Tab; repeat at Management band.

**PASS:** world cycle order is deterministic semantic class → screen distance → depth → stable ID;
filters are complete and decoration absent. Pre-focus is visible and announced but not selected
until Confirm. Camera movement invalidates the snapshot. Tab in the inspector navigates UI rather
than world. At Management band, tiny ordinary applicants are not required targets; selected/
alerted locators and management/list routes remain available. No command requires hover, double
click, hold, chord, drag, color perception, or rapid repetition.

---

# 7. Fable implementation map

## 7.1 BUILD NOW — P02A only

The accepted checkpoint is still **Gate and Administration Interaction Spine**. Build no wider
entity migration while establishing these shared seams:

1. A single presentation interaction-state owner for hover, input focus, exact selection, Focus
   transition, context layer, navigation origin, zoom band, and visible interaction mode. Gate
   applicants, Gate, and Administration are its only P02A target classes.
2. A semantic target registry/adaptor around existing `SelectableEntity` instances, populated from
   `StudioFoundingGatePresentation` / `StudioBridgePresentation`, with exact ID/kind, structured
   label/state, current anchor/bounds, eligible bands, proxy, and cycle metadata.
3. The deterministic priority/candidate cycling law in section 5, with distinct pointer hover,
   controller/keyboard pre-focus, and selected state.
4. One shared anchored hover label and one shared inspector host, using the person/building anatomy
   in section 3 and the current applicant dossier visual tokens.
5. Named Focus/Home/Back/Open Context/Open deep/Locate/Stay commands. Camera Focus must honor the
   safe viewport, accepted timing envelope, manual interruption, and reduced-motion path. Pointer
   classification must prove stationary secondary Cancel below four logical pixels, secondary-drag
   pan, MMB orbit, and no Cancel after a completed pan.
6. One shallow navigation origin for exact applicant Review/Profile and Administration workspace
   round trips, including camera pose, selection, inspector, route/tab/filter/sort/scroll, UI focus,
   and transition type.
7. Exact stale/lost/removed target behavior and current-authority revalidation for material actions.
8. Structured accessible labels, 44×44 UI targets, minimum person proxy plus list/cycle alternative,
   deterministic focus order, and the responsive bottom-sheet form.
9. Diagnostics and the applicable Golden UX journeys. The P02A owner playtest remains: applicant
   select → Focus → Review → Back → Locate → Stay in world → Administration → workspace → Back.

Do **not** expose Follow in P02A unless the CP9 bridge/presentation supplies and continuously
revalidates a trustworthy live trackable anchor. The state/command can exist internally without a
visible enabled action.

## 7.2 REUSE

| Existing system | Reuse intact |
| --- | --- |
| `StudioSelectionManager` / `SelectableEntity` | One selection owner, stable-ID binding, inert select, hover/selected distinction, selection layer/proxy seam, world bounds |
| `TycoonCameraController` / `StudioCameraInput` | Existing camera ownership, authored Home, pan/orbit/zoom path, immutable per-frame input, and latched UI capture |
| `StudioFoundingCardHud` / `StudioApplicantPortraitCamera` | Applicant dossier content hierarchy, exact selected-ID lookup, explicit review/confirm flow, stale receipt, accepted visual direction, and exact live body portrait |
| `StudioFoundingGatePresentation` / `StudioBridgePresentation` | Exact applicant bodies and `talentId` relationship, stable pads, authoritative snapshot reconciliation, exact scene-entity cache |
| TypeScript adapter/snapshot projections and bridge protocol | Identity, person work, building context, applicant profile/eligibility, actions, snapshots, revisions, and opaque-intent authority |
| Browser inspectors / retained workspace / navigation helpers | Behavioral oracle for inert selection, exact local context, explicit deep route, fail-closed refresh, retained-world input blocking, Escape, and focus restoration |

## 7.3 EXTEND

| Existing component | Bounded extension |
| --- | --- |
| `StudioSelectionManager.Pick` | From first physics hit to registered candidates, semantic ranking, 12 px ambiguity, input pre-focus, and frozen cycle snapshots |
| `SelectableEntity` | Add semantic metadata/adaptor and independent dual-coded visual channels; retain stable ID and bounds |
| `StudioHud` | Become/host the single responsive selected inspector; preserve its screen reservation and UI hit testing |
| `StudioFoundingCardHud` | Participate in one context/deep layer and origin/Back stack; keep Review/Admin confirmation content, not a separate selection universe |
| `TycoonCameraController.FocusOn` | Safe-frame target, accepted durations, interruption/retarget, pose capture/restore, reduced motion, and derived zoom band/hysteresis |
| `StudioCameraInputFrame` | Semantic remappable commands for Focus, Home, target cycle, Open Context, Back, and a non-user-facing Follow capability seam; separate secondary click from drag threshold; controller-ready input sources. P02A exposes no Follow command without a trustworthy anchor |
| `StudioCameraDirector` | Keep explicit close-inspection ownership/Return; distinguish it from ordinary Focus and share origin restoration |
| Bridge presentation/read models | Expose already-authoritative compact inspector fields and capability/deep-route references; register/remove current live anchors exactly |
| `LotRetainedWorkspace` behavior | Equivalent Unity retained-world inertness, focus entry/restore, and exact origin pop; implementation technology may differ |
| Existing test suites | Add exact state-machine, semantic priority, safe-frame, responsive, stale/lost, and Golden Journey coverage |

## 7.4 DO NOT REBUILD

- Applicant identity, pool order, role, OVR/potential/traits, availability, contract terms, signing
  eligibility, Administration founding legality, cost, or any opaque intent.
- Snapshot/session/revision handling, stale-intent rejection, or TypeScript simulation actions.
- A second camera controller, second selection manager, second applicant dossier, separate Gate
  management model, or one inspector per entity class.
- Browser `lotBuildingInspectorContext` facts/actions in Unity business logic. Extend the bridge
  projection or consume equivalent current fields.
- Portrait identity: reuse the exact selected applicant body/render path.
- Retained-world focus/back laws already proved in `LotRetainedWorkspace` and
  `TalentProfileDrawer`; reproduce their behavior in Unity rather than inventing another stack.
- The current `RevealFoundingAnchors` automatic camera choreography as ordinary P02A behavior.
- Renderer/collider order as selection policy, or scene object/display names as stable identity.
- Generic alerts from transient notice strings. Subject/cause/remedy require structured authority.

## 7.5 DEFER

- Full Follow behavior and person movement/destination routes until a reliable live-anchor contract
  is present.
- Stage 7 and all other building migrations; generic cause-aware alert projection/history/Locate;
  occupants and production blockers beyond the P02A data already available.
- Lot-wide semantic zoom authoring and declutter budgets beyond the Gate/Admin targets needed to
  prove the band service.
- Vehicles, construction sites, parcels, and independent props until their stable authority
  references exist.
- Complete controller skin/remapping UI and accessibility options UI. The semantic commands,
  registry, focus states, target sizes, reflow, and reduced-motion hook are required now.
- Cinematic/scenic routes, minimap, optional radial commands, multi-selection, pinned inspectors,
  saved camera bookmarks, and user label filters.

## 7.6 Acceptance ledger for the checkpoint

P02A is done only when all statements below are true:

- Gate applicant and Administration selection send no gameplay intent and move no camera.
- Exact identity survives projection refresh, camera movement, zoom, deep open/Back, and Locate; it
  never falls back by name, role, index, proximity, or renderer.
- The shared inspector contains only authoritative current facts and freshly supplied capabilities.
- Focus, Home, Locate, and Back are distinct semantic commands; a non-user-facing Follow capability
  seam may exist but no Follow control appears in P02A without a trustworthy anchor. Every
  programmatic camera move is explicit, interruptible, safe-framed, and reducible.
- Pointer classification proves the accepted split: a stationary secondary press/release below
  four logical pixels invokes bounded pointer Cancel; secondary drag pans; MMB drag orbits; a
  completed pan never also Cancels. Bindings remain configurable and UI-captured gestures never
  reach the world.
- Pointer, keyboard, and controller-ready routes can acquire the same Gate/Admin targets without
  pixel-perfect clicking or hover-only information.
- The selected rail and bottom sheet are the same schema and focus order; modal/deep UI cannot
  click through to the world.
- Every applicable Golden UX journey passes and current bridge/founding/browser regressions stay
  green.
- No production rule or identity owner has moved from TypeScript into Unity.
- No production work from Follow, generic alerts, Stage 7 migration, or cinematic inspection was
  smuggled into P02A.

## 7.7 Genuine decision still requiring Owner/integrator input

There is **no unresolved interaction-design decision** in this annex: Package 02 already fixes the
grammar, timings, hierarchy, responsive form, priority principles, and checkpoint scope.

There is one genuine repository sequencing decision before Fable writes production code:

> Which landed/adopted CP9 Unity commit is the implementation base?

The formally adopted client is `d970b81`, while the required applicant dossier, founding
presentation, newer input/camera director, and current tests are in clean commit `911e87e` on
`campaign/living-lot-client`, synchronized with `origin/campaign/living-lot-client` at the final
audit. The Owner/integrator should adopt or explicitly designate that CP9 state first. Fable should
not reconstruct CP9 inside a Package 02 implementation branch.

Once that base is named, no further comparative research or Owner design choice is needed to begin
P02A.

---

# Builder stop rule

Open Package 02 for the accepted law; open this annex for the components, repository seams, and
proofs; inspect the named files at the audited commits; then implement only P02A. If a missing field
would require Unity to infer simulation truth, stop that field, extend the authoritative projection,
and keep the presentation fail-closed. Do not broaden the design or re-study the genre.
