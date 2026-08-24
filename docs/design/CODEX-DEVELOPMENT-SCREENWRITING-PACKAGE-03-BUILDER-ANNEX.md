# PACKAGE 03 BUILDER ANNEX — DEVELOPMENT / SCREENWRITING

Status: **BUILDER-READY COMPANION TO THE PACKAGE 03 RULING**

Design authority:
`docs/design/CODEX-DEVELOPMENT-SCREENWRITING-PACKAGE-03.md`

Binding world grammar: Package 02 at
`a4795ff72a9a790e1cbda06deefd4b76a91df2b0` and its builder annex at
`f571a1d867b608a4a841773fc78eb6ed11696bb6`

Research branch: `codex/development-screenwriting-research-03`

TypeScript/browser archaeology baseline:
`c902a704eb948cc576083d0973c8c23e59937dc1`

Sealed Unity inspected read-only:
`911e87e6aeed6e185ccf6a8d77aff9ec455b404f` on `campaign/living-lot-client`

Production-code changes in this branch: **NONE**

If the Owner accepts Package 03, it prospectively replaces only incompatible screenplay
presentation guidance in older frozen contracts. Their TypeScript authority, strict current-state
selectors, exact action dispatch, one-call input boundary, successor validation, and autosave laws
remain mandatory.

## How Fable should use this annex

1. Read the Package 03 design ruling first.
2. Read the nomenclature warning and authority boundary below.
3. Inspect the exact existing files in section B before creating a component or DTO.
4. Use section A only for the specific behavior being built; do not restart a genre survey.
5. Build the component anatomy in sections C–F against the edge matrix and journeys in G–H.
6. Stop the checkpoint at `Ready to package`; Casting implementation is not part of this package.

## Non-negotiable authority boundary

TypeScript remains the sole owner of screenplay quality, genre, creative brief, writer facts,
assignments, project state, due dates, rewrite outcomes, legality, costs, time, RNG, capacity, queue,
and saves. Unity may own layout, selection, Focus/Locate presentation, activity animation, camera,
responsive composition, and submission of a **current TypeScript-authorized intent**.

No recommendation below authorizes C# to reconstruct `CommissionScriptPayload`, calculate a rewrite
estimate, choose a slot, infer a writer's availability, or decide whether Accept/Rewrite is legal.

## Nomenclature warning — avoid the existing trap

| Name | Exact existing owner | Meaning |
|---|---|---|
| `Development` | world building ID `writers` | Screenplay department and world interaction owner |
| `Writers Room` | `ui/src/screens/WritersRoom.tsx` | Deep screenplay project/portfolio owner |
| `Development & Casting` | shared capacity/facility read models | Slots used by scripts, auditions, and early production |
| `Development Office II/III` | facility/construction effects | Current legacy/Core tier names for first-draft office uplift and original-screenplay richness/time; UI uses the published facility label |
| `Studio Development` | `ui/src/screens/StudioDevelopment.tsx` | Building construction/catalog; **not screenplay management** |

Do not route the `writers` building to `StudioDevelopment.tsx`. Do not create a second screenplay
building identity. The Core and the sealed Unity fixture already use `writers`.

---

# A. Comparator Reference Atlas

Each entry answers one implementation question. `COPY PRINCIPLE` means copy the interaction law,
not the comparator's art, terminology, values, or simulation.

## A1. Begin screenplay work from a physical department

- **Game:** *The Movies*.
- **Exact source:** [official English manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040), PDF p. 6 / printed p. 12, “Write a Script.”
- **Exact interaction:** build the Script Office; drag a queued writer into one of five genre rooms;
  the writer joins the Script Pool and begins work.
- **What to inspect:** the sequence is place → person → genre → visible work. The command is not
  born in a detached list.
- **COPY PRINCIPLE:** Development is the discoverable world owner and the named writer visibly
  responds after commitment.
- **DO NOT COPY:** drag/drop as assignment authority, tiny genre-room hit targets, or literal
  interior-room controls.
- **Project: Studio translation:** single-select authoritative building `writers`; local inspector
  explains the department; `Commission a screenplay` opens the retained authoritative form.

## A2. Show screenplay lifecycle and handoff

- **Game:** *The Movies*.
- **Exact source:** [official manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040), PDF p. 3 / printed pp. 6–7, movie-card states; PDF p. 6 / printed p. 12, Casting Office.
- **Exact interaction:** the card changes from writing to ready for casting; the completed card is
  taken into the Casting Office's `Begin Casting` room.
- **What to inspect:** one persistent artifact communicates current phase and next physical owner.
- **COPY PRINCIPLE:** a screenplay must always answer “where is it now?” and “where does it go
  next?”
- **DO NOT COPY:** permanent draggable inventory cards or building-floorplan hot spots.
- **Project: Studio translation:** Development state and project card progress
  `Drafting → Review → Rewriting/Review → Ready`; Ready exposes the exact current Casting route and
  never moves the camera automatically.

## A3. Make the writer a visible person without making them the quality formula

- **Game:** *The Movies*.
- **Exact source:** local developer-reviewed Prima guide,
  `/Users/bruce/Desktop/big swing art/The_Movies_Prima_Official_eGuide.pdf`, PDF p. 13 / printed
  p. 12, “There's No People Like Show People”; also the official manual printed p. 16.
- **Exact interaction:** writers visibly work at Script Pool desks; more writers accelerate one
  script; experience improves speed, not quality; one office writes one project at a time.
- **What to inspect:** the page screenshot and adjacent scriptwriter text. Separate visible labor
  from the office-owned quality ceiling.
- **COPY PRINCIPLE:** show the named writer, assignment, work phase, due time, and capacity use.
- **DO NOT COPY:** continuous script farming, five-body crowding as mandatory UI, or a claim that
  writer OVR improves first-draft strength.
- **Project: Studio translation:** presence comes from authoritative `engagement: script` and
  reservation facts; writer/pool affect clock; first-draft strength remains concept + office law.

## A4. Preserve later-edition strengths; remove exposed weaknesses

- **Game/package:** *The Movies: Superstar Edition*.
- **Exact source:** [Macinplay review](https://macinplay.de/spiele-tests/macintosh-games/the-movies-superstar-edition/), sections “Alles dreht sich um den Film” and “Mikromanagement, das auch mal nervt.”
- **Exact interaction/reference:** writer in genre office → finished script → casting; custom
  authoring as a separate lane; drag/drop/icons/right-click information praised; repeated manual
  care and unexplained result causality criticized.
- **What to inspect:** the contrast between building-led flow and the review's later criticisms.
- **COPY PRINCIPLE:** keep the lot and icon/state chain central.
- **DO NOT COPY:** repetitive manual maintenance, unlock/resource churn, or opaque ratings.
- **Project: Studio translation:** visible department plus large retained decision surfaces; no
  screenplay busywork; `Est.` result includes actual player-safe explanation and consequence.

## A5. Preview downstream demand without importing the stunt system

- **Game:** *The Movies: Stunts & Effects*.
- **Exact source:** [official expansion manual](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf?t=1447351041), pp. 3–5, Script Office, casting doubles, and release rating.
- **Exact interaction:** a stunt affordance appears per genre; the completed script identifies stunt
  scenes/difficulty; Casting identifies roles needing doubles.
- **What to inspect:** demand is declared on the artifact before staffing/shooting.
- **COPY PRINCIPLE:** a screenplay should make existing authoritative downstream demands legible
  before handoff.
- **DO NOT COPY:** stunt injuries, condition management, difficulty meters, or any new Package 03
  mechanic.
- **Project: Studio translation:** keep current required-set/production implications in the deeper
  package boundary when published; do not invent script attributes in review.

## A6. Group project initiation into a readable decision

- **Game:** *Game Dev Tycoon*.
- **Exact source:** [official Steam product page](https://store.steampowered.com/app/239820/Game_Dev_Tycoon/) and [Development Stage 1 publisher screenshot](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/239820/ss_2ede7e75780d8b6b48a42a13008fc6602c8ab5b8.1920x1080.jpg?t=1762193894).
- **Exact interaction:** one blocking stage surface presents project identity and the current set of
  work choices before confirming.
- **What to inspect:** large title, bounded choice groups, visible preview, one unmistakable commit.
- **COPY PRINCIPLE:** a player should see the complete brief and commitment before project time
  begins.
- **DO NOT COPY:** its three vertical allocation sliders, color vocabulary, small nested copy, or
  hidden genre/topic compatibility.
- **Project: Studio translation:** source/concept/writer → existing creative brief → authoritative
  time/capacity/queue summary → explicit Commission.

## A7. Keep assigned people beside phase/progress

- **Game:** *Software Inc*.
- **Exact source:** [developer post](https://softwareinc.coredumping.com/fifth-update-gui-and-game-mechanic-details/), “Development cycle,” paragraphs beginning “When you design software…” through the beta/support description.
- **Exact interaction:** a project work box shows the current phase's progress and assigned team;
  the player deliberately promotes through stages.
- **What to inspect:** phase, team, and the next gate remain in one project context.
- **COPY PRINCIPLE:** always join project identity, phase, assignee, progress, and next decision.
- **DO NOT COPY:** floating-window density, software terminology, bugs, design/alpha/beta phases, or
  arbitrary promotion controls.
- **Project: Studio translation:** Development inspector and project rows show screenplay, named
  writer(s), Drafting/Final rewrite, discrete due week, and review/ready gate.

## A8. Explain opportunity cost before iteration

- **Game:** *Software Inc*.
- **Exact source:** [same developer post](https://softwareinc.coredumping.com/fifth-update-gui-and-game-mechanic-details/), “Contract work.”
- **Exact interaction:** time/quality requirements, up-front money, reward, and failure consequence
  are stated before accepting the project.
- **What to inspect:** the commitment consequence is adjacent to the commitment action.
- **COPY PRINCIPLE:** the decision surface names time, resources, and what happens next before the
  click.
- **DO NOT COPY:** contract payments, penalties, quality targets, or deadlines absent from Project:
  Studio.
- **Project: Studio translation:** Rewrite explicitly shows one week, named writer, one shared slot,
  due week, payroll/overhead, and projected player-perceived result; Accept says Ready now.

## A9. Treat assessment as evidence, not revealed truth

- **Game:** *Football Manager*.
- **Exact source:** [official Recruitment Revamp article](https://www.footballmanager.com/features/recruitment-revamp), “Scouting Enhancement,” including knowledge levels and report states.
- **Exact interaction:** the UI distinguishes how much is known and whether a report is ongoing,
  completed, stopped, or needs updating.
- **What to inspect:** a status/provenance label changes how a number should be read.
- **COPY PRINCIPLE:** keep `Est.` inseparable from assessment; state what evidence/basis supports the
  current view.
- **DO NOT COPY:** scouting assignments, knowledge chores, fake confidence bars, or football radar
  charts.
- **Project: Studio translation:** current and projected **perceived** screenplay assessment, concise
  basis, strengths, concerns; `actualStrength` never reaches Unity.

## A10. Use explicit Focus/Locate; do not couple selection to the camera

- **Game:** *Planet Zoo*.
- **Exact source:** [official Update 1.14](https://www.planetzoogame.com/en-us/news/planet-zoo-update-114-coming-20th-june) for individual staff information panels and camera modes;
  [official Update 1.0.2 notes](https://store.steampowered.com/news/posts/?appids=703080&enddate=1574848961&feed=steam_community_announcements) for Locate opening the animal's information context.
- **Exact interaction:** Animal Management's `Locate` opens that animal's information panel;
  specialist Camera Modes are entered explicitly.
- **What to inspect:** selection/context and camera mode are separate.
- **COPY PRINCIPLE:** exact writer/Development identity survives world ↔ management navigation.
- **DO NOT COPY:** automatic camera entry, animal-specific tabs, or comparator camera values.
- **Project: Studio translation:** Package 02 law: single select opens inspector; Focus/Locate moves;
  deep workspace preserves origin; Back restores it.

## A11. Use one stable building inspector, then open deeper work

- **Game:** *Two Point Hospital*.
- **Exact source:** [official room templates deep dive](https://community.twopointcounty.com/two-point-studios/two-point-hospital/blogs/9-room-templates-deep-dive), inspect the room selection and right-side information/workflow examples.
- **Exact interaction:** selecting a room establishes a predictable right-side information owner
  with a contextual template tab.
- **What to inspect:** stable screen position and state-specific information, not an anchored menu
  chasing the building.
- **COPY PRINCIPLE:** Development selection uses the shared fixed inspector; complex commission and
  review use retained workspace.
- **DO NOT COPY:** hospital tabs, panel art, or treating a room panel as a full project portfolio.
- **Project: Studio translation:** compact six-row department answer + one primary route/action +
  deeper retained Writers' Room when needed.

## A12. Responsive workspace and Back behavior — existing Project: Studio is the oracle

- **Product:** Project: Studio browser implementation and Package 02.
- **Exact source:** `ui/src/lot/LotRetainedWorkspace.tsx`; `ui/src/styles.css`,
  `.lot-commission-workspace*`; [Package 02 builder annex](https://github.com/HSpector1/The-Movies/blob/f571a1d867b608a4a841773fc78eb6ed11696bb6/docs/design/CODEX-WORLD-INTERACTION-PACKAGE-02-BUILDER-ANNEX.md), sections 3 and 4.
- **Exact interaction:** live lot stays mounted/inert; focus is trapped; Escape cancels one editing
  layer; desktop workspace is `min(760px,72vw)` by up to `88dvh`; at 760 px it becomes a full
  viewport sheet; reduced/forced-color paths already exist.
- **What to inspect:** focus entry/restoration, one scroll owner, nested modal isolation, Escape
  containment, mobile reflow.
- **COPY PRINCIPLE:** preserve the behavior and geometry envelope in Unity.
- **DO NOT COPY:** React implementation details or the current tiny review panel.
- **Project: Studio translation:** commission and review share one Unity retained-workspace host;
  Back restores exact Development selection/camera/focus.

## A13. Anti-pattern — “polish because why not”

- **Game:** *Game Dev Tycoon*.
- **Exact source:** [community mechanics reference](https://gamedevtycoon.fandom.com/wiki/Bugs),
  “Finishing stage”; the [official Steam page](https://store.steampowered.com/app/239820/Game_Dev_Tycoon/)
  supplies only product and screenshot context.
- **Exact interaction:** remaining bugs can be removed by continuing the finishing stage; absent
  pressure, waiting toward zero is an obvious improvement.
- **What to inspect:** visible monotonic improvement plus low opportunity cost collapses choice.
- **COPY PRINCIPLE:** none; this is a negative reference.
- **DO NOT COPY:** a Rewrite button framed as deterministic improvement that a rational player
  always presses.
- **Project: Studio translation:** show possible decline/hold/gain and the writer/slot/week trade;
  call it Final rewrite, not Improve.

---

# B. Existing-System Reuse Map

## B1. Repository truth at a glance

The browser/TypeScript repository already contains the complete authoritative screenplay lifecycle,
the deepest current commission form, strict review selectors, retained lot workspaces, exact
receipts, stale-action protection, save/load, time stopping, and multi-project capacity. The sealed
Unity client contains the world shell, bridge continuity, opaque-intent submission, selection,
camera, living time, save/load, and generic memo—but not the Development-specific UI/read model.

The builder's task is primarily **projection + presentation integration**, with one small
TypeScript-owned decision-preview extension. It is not a new screenplay simulation.

## B2. Core TypeScript and bridge

| Need | Existing Project: Studio file/component | Reuse / Extend / Replace / Leave Alone | Reason |
|---|---|---|---|
| Authoritative project shape | `src/core/types.ts` — `ScriptProject`, `ScriptAssessment`, `ScriptDevelopment` | **REUSE / LEAVE ALONE** | Stable ID, source concept, writer(s), shape, promise, status, rewrite count, weeks, assessment, reservation, production link already persist |
| Lifecycle and legality | `src/core/scriptDevelopment.ts` — `commissionScriptProject`, `completeDueScriptWork`, `requestScriptRewrite`, `acceptScriptProject` | **REUSE / LEAVE ALONE** | Owns state transitions, reservations, one rewrite, due week, and invariant checks |
| First-draft and rewrite outcome | `src/core/scriptDevelopment.ts` — `assessFirstDraft`, `scriptRewriteDelta`, `rewriteAssessment` | **REUSE; NEVER PORT** | Sole quality/outcome authority; Unity must not calculate or mirror it |
| Original screenplay identity/time | `src/core/screenplay.ts` — blueprints/provenance, `scriptDraftWeeks`, `screenplayDraftConsequence`, office uplift/richness views | **REUSE** | Existing original title/provenance, era-neutral brief, and authoritative clock |
| Public screenplay actions | `src/core/actions.ts` — commission original/market, writer-pool assignment, rewrite, accept, queue admission | **REUSE** | Current legal front doors and whole-state transition authority |
| Weekly completion order | `src/core/tick.ts` — `completeDueScriptWork` integration and stop reasoning | **LEAVE ALONE** | Draft/rewrite completion and resource release happen in authoritative weekly order |
| Player-safe screenplay board | `src/core/scriptReadModel.ts` — `ScriptProjectsReadModel`, `projectCard`, `scriptCapacityView`, `lotAttention`, `nextScriptDecision` | **REUSE + EXTEND** | Already owns project sections, legal actions, blockers, capacity, `Est.` assessment, and lot attention; add TypeScript-authored qualitative assessment factors and rewrite preview here or equivalent Core read boundary—never raw/formula inputs |
| Accept/Rewrite preview | No current published projection; deterministic perceived inputs exist in `rewriteAssessment` | **EXTEND** | Required to solve “hopefully better”; TypeScript derives it, never Unity |
| First-film guidance | `src/core/firstFilmJourney.ts` — `firstFilmJourney`, `draftingView`, `scriptReviewView` | **REUSE** | Pure save-neutral “what happened / why / next” owner; note it intentionally collapses Drafting and Rewriting to journey stage `drafting` while headline/beat distinguishes them |
| Cross-system decision priority | `src/core/scriptReadModel.ts` — `nextStudioDecision` | **REUSE / LEAVE ALONE** | Screenplay review already outranks later current studio decisions deterministically |
| Shared capacity | `src/core/scriptDevelopment.ts`, `src/core/castingSessions.ts`, `src/core/operations.ts`, `src/core/productionQueue.ts` | **REUSE / LEAVE ALONE** | Scripts, auditions, and early production already share deterministic facilities/slots and queues |
| Writer presence/assignment | `src/core/presence.ts`; `activeScriptWriterAssignments` / `scriptWriterAssignment` in `scriptDevelopment.ts` | **REUSE + PROJECT** | Exact assignment and semantic presence already exist; animation must consume them |
| Physical Development identity | `src/core/lot.ts` — `INITIAL_PROPERTY_STRUCTURES` entry `id: 'writers'`, label `Development`, provider `facility-development-casting` | **REUSE / LEAVE ALONE** | Canonical world identity and footprint already exist |
| Save/load | `src/core/save.ts` — current V14 screenplay schema/migrations and invariant validation | **LEAVE ALONE** | Do not add presentation state to saves; current projects/rewrite/assignments already persist |
| Bridge schema | `bridge/schema/bridge-schema.ts`, generated JSON schema, `bridge/schema/runtime.ts` | **EXTEND** | Current bundle lacks commission board/review context/preview; keep closed validation and projection ownership |
| Bridge intent execution | `bridge/session.ts` — `availableIntents`, `applyAvailableIntent`, exact `intentId` | **REUSE + EXTEND** | Keep opaque current intents and revalidation; current commission intent preselects one concept/writer/default brief and is not the future form |
| Commission selection → commit | No current interactive Unity bridge path; browser calls authoritative actions with a selected payload | **BUILD A TYPESCRIPT-OWNED QUOTE/INTENT SEAM** | Unity may present choices but must receive a fresh opaque commit intent from TypeScript; mechanism may be an authoritative quote/draft-intent exchange, not C# payload construction |
| Bridge continuity/security | `bridge/session.ts`, `bridge/protocol.ts`, `bridge/runtime-checkpoint.ts`, `bridge/runtime/*`, `bridge/supervisor/*` | **REUSE / LEAVE ALONE** | Session, revision, digest, command replay, save/load, and restart continuity are already hardened |

### Required bridge boundary, without prescribing an unsupported implementation

The existing protocol accepts only an opaque `intentId`. The current `commissionScreenplay` option
already chooses a premise, writer, shape, and promise inside `bridge/session.ts`. It is suitable for
bootstrap/autoplay and the generic memo, not for an interactive commission workspace.

Package 03 requires a TypeScript-owned sequence with this semantic result:

```text
Unity displays TypeScript-published legal choices
→ player changes a presentation draft
→ TypeScript validates that exact draft against current revision and publishes its consequence
→ TypeScript returns/mints one opaque current commit intent
→ Unity submits only that intent ID
→ TypeScript revalidates and mutates once
```

Whether Fable implements that through a quote operation, a draft session, or another protocol-safe
shape is an implementation decision. The acceptance law is not: C# must not build Core payloads or
cache legality, and stale selection/intent must fail without mutation.

## B3. Browser implementation — behavioral oracle

| Need | Existing path/component | Reuse / Extend / Replace / Leave Alone | Reason |
|---|---|---|---|
| Canonical deep project owner | `ui/src/screens/WritersRoom.tsx` — `WritersRoom` | **REUSE AS BEHAVIORAL/CONTENT ORACLE** | Owns capacity, Needs Review/In Development/Ready/History, exact project focus, legal actions, blockers, and writer pool |
| Existing commission form | `ui/src/screens/WritersRoom.tsx` — `ScreenplayCommissionForm` | **REUSE BEHAVIOR; ADAPT PRESENTATION** | Already exposes market/original source, concept/direction, writer, shape, promise, office uplift, original draft weeks, queue and consequence |
| Retained commission shell | `ui/src/lot/LotCommissionWorkspace.tsx` | **REUSE BEHAVIORAL ORACLE** | Live lot retained, clear heading/actions, exact committed/queued/neutral receipts |
| Shared retained host | `ui/src/lot/LotRetainedWorkspace.tsx` | **REUSE ACCESSIBILITY/INPUT LAW** | Focus trap, scroll containment, one-layer Escape, nested modal inertness, initial focus, world input blocking |
| Retained host sizing/reflow | `ui/src/styles.css` — `.lot-commission-workspace*` | **REUSE ENVELOPE** | `min(760px,72vw)`, up to `88dvh`; full viewport at 760px; 44px controls; forced colors/reduced motion |
| Strict commission receipt | `ui/src/lot/snapshot/scriptCommission.ts` | **REUSE STRICTNESS** | Validates exact board/state/payload/successor and returns project, writer, week, facility, slot; refuses decoration/fallback |
| Strict queue receipt | `ui/src/lot/snapshot/queueAdmission.ts` | **REUSE STRICTNESS** | Distinguishes queued request from started work: selected writer/brief and market premise remain identified, but no assignment/project/slot/cash effect occurs until admission |
| Strict review context | `ui/src/lot/snapshot/scriptReview.ts` | **REUSE + EXTEND INPUT SHAPE** | Exact current project, writer, first/final state, assessment, consequence, blockers/actions, provenance; fail-closed exact-key law |
| Current lot review component | `ui/src/lot/LotScriptReviewPanel.tsx` | **REUSE DISPATCH SAFETY; REPLACE VISUAL OWNER** | Proven input-tail deduplication, stale boundary, exact action order; current compact content is too small for the new primary decision |
| Current review CSS | `ui/src/lot/lot.css` — `.lot-script-review-panel*` and `.hollywood-inspector.is-script-review` | **DO NOT COPY DIMENSIONS** | It renders important evidence at 11px in ~350px inspector; this is the exact presentation defect Package 03 replaces |
| Development inspector facts/actions | `ui/src/lot/buildingInspector.ts` — `lotBuildingInspectorContext`, `primaryActions`, `commissionWithheldNote` | **REUSE + EXTEND** | Already maps `writers` to role, shared occupancy, authoritative presence, commitments, commission verb, blocker note, deep label |
| World host and selection retention | `ui/src/lot/StudioLotScreen.tsx` | **REUSE AS ORACLE** | Keeps selected Development in live lot, shows review, routes commission, repaints receipts, and protects exact state/gesture ownership |
| Retained workspace state/navigation | `ui/src/App.tsx` — lot commission session and writers-room return context | **REUSE BEHAVIORAL LAW** | App owns one state, session, autosave, exact current-state revalidation, origin, deep project focus, and return |
| Route vocabulary | `ui/src/lot/navigation.ts` | **REUSE** | Dedicated `commissionScreenplay` route and canonical `writers` deep destination already exist |
| First Film Journey lot adapter | `ui/src/lot/snapshot/firstFilmJourney.ts`; `LotPictureGuidanceCard.tsx` | **REUSE** | Strictly consumes Core journey; no renderer-invented guidance |
| Living time and auto-pause | `ui/src/lot/livingTurn.ts` | **REUSE LAW** | `scriptReview` is pause-class; ordinary drafting/rewrite is background time; notifications are separate |
| Person assignment display | `ui/src/engine/adapter.ts` person/presence projections; named-person inspector paths | **REUSE** | Existing projection can state “Assigned to screenplay” and semantic location without proximity inference |
| Screenplay construction-name collision | `ui/src/screens/StudioDevelopment.tsx` | **LEAVE ALONE / DO NOT ROUTE HERE** | This screen owns construction, not writers or screenplays |

## B4. Sealed Unity implementation

All paths below are relative to
`/Users/bruce/Project Studio - Unity Production Convergence 80H`.

| Need | Existing Unity path/component | Reuse / Extend / Replace / Leave Alone | Reason |
|---|---|---|---|
| Authoritative bridge client | `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs` — `SubmitIntent`, snapshot events | **REUSE + EXTEND PRESENTATION HOST** | Already sends opaque intent ID and retains accepted/rejected/save/load events; do not bypass it |
| Generic workflow memo | same file — `OnGUI`, `EnsureWorkflowStyles` | **REPLACE AS PRIMARY SCREENPLAY OWNER; RETAIN AS FALLBACK/ANNOUNCEMENT** | Current `NEXT STEPS` list is the white/warm memo Owner used; it has labels/details only, not a commission/review model |
| Generated bridge DTOs | `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` | **REGENERATE FROM EXTENDED TS SCHEMA** | Current intent option has only opaque ID, label/detail, and project/session/production IDs; screenplay board/review/preview is absent |
| Bridge validation | `Assets/Studio/Runtime/Data/StudioBridgeProtocol.cs` | **REUSE / EXTEND CLOSED CONTRACT** | Requires complete matching session/revision/digest/projections; keep fail-closed law |
| Projection cache | `Assets/Studio/Runtime/Infrastructure/StudioSnapshotStateCache.cs` — `StudioProjectionStore` | **REUSE + EXTEND** | Existing index owner for buildings/people/presence/productions; add screenplay projection indexing here or equivalent single store |
| Runtime continuity | `Assets/Studio/Runtime/Infrastructure/StudioBridgeRuntimeContinuity.cs` | **LEAVE ALONE** | Prevents revision/week/digest regression |
| Exact POST/reconcile | `Assets/Studio/Runtime/Infrastructure/StudioBridgePendingPost.cs` | **LEAVE ALONE / REUSE** | One immutable command envelope, retry/reconcile; required for commission/review commits |
| Rejection retention | `Assets/Studio/Runtime/Infrastructure/StudioRejectionRetention.cs` | **REUSE** | Exact session/revision/digest-scoped error, cleared on authoritative change |
| Scene state binding | `Assets/Studio/Runtime/Presentation/StudioBridgePresentation.cs` | **REUSE + EXTEND FOR DEVELOPMENT ACTIVITY** | Already applies authoritative buildings, construction, people, stages, and productions |
| Selection manager | `Assets/Studio/Runtime/Presentation/StudioSelectionManager.cs` | **REUSE AFTER CP10A/P02 EXTENSION** | Stable-ID raycast selection, hover, double-click inspection, Escape clear; do not build a screenplay-only selection universe |
| Selectable identity/treatment | `Assets/Studio/Runtime/Presentation/SelectableEntity.cs` | **REUSE** | Stable ID, label/status/focus and selected visual treatment already exist |
| Selected HUD/inspector host | `Assets/Studio/Runtime/Presentation/StudioHud.cs` | **EXTEND THROUGH CP10A SHARED INSPECTOR** | Current bottom-right receipt is not Development inspector but owns existing HUD reservation/hit safety |
| Camera Focus/inspection | `Assets/Studio/Runtime/Presentation/StudioCameraDirector.cs`; `StudioInspectionTarget.cs` | **REUSE / EXTEND SEMANTIC TARGET** | Current authored profiles are Stage 7/Admin only; Development needs normal Package 02 Focus, not a new camera system |
| Living time | `Assets/Studio/Runtime/Presentation/StudioLivingTime.cs`; `StudioLivingTimeHud.cs` | **REUSE / LEAVE LAW ALONE** | 1×/2×/4×, one in-flight advance; non-advance decisions fail closed to paused; screenplay workspace must use this authority |
| Save/load controls | `StudioBridgeClient.cs` plus bridge continuity | **REUSE** | Save/load already authority-owned; workspace state is transient and rehydrates from fresh projection |
| Existing 1948 lot fixture | `Assets/StreamingAssets/studio-lot-1948.json` | **REUSE ID / DO NOT TREAT ERA AS UNIVERSAL** | Contains `id: writers`, label `Development`, state/attention and authoritative footprint |
| Missing Development body | `Assets/Studio/Editor/Authoring/StudioLotArchitectureAuthoring.cs` | **BUILD NEXT** | `Build()` authors Gate/Admin/Casting/Theater/Stages/etc. but no `BuildDevelopment`; no `AddSelectable(..., "writers", ...)` exists |
| Existing people/presence | bridge people/presence DTOs + `StudioBridgePresentation.ApplyPeople` | **REUSE + EXTEND ANCHORING** | Already carries writer creative role, `engagement: script`, owner/facility/activity; do not infer from distance |
| CP10A Gate/Admin lane | current in-flight implementation | **LEAVE ALONE / REUSE ONCE ACCEPTED** | Package 03 follows the shared interaction spine and must not overlap its implementation |

## B5. Current bridge gap in one picture

```text
CURRENT UNITY
journey beat + generic intent label/detail
→ white/warm memo button
→ opaque intent

REQUIRED P03A
authoritative Development + commission/review projection
→ shared inspector
→ retained workspace with legal choices/consequence
→ fresh opaque intent
→ exact successor projection/receipt
```

Do not delete the bridge's generic intents; they remain valuable for automation, fallback, and
diagnostics. Stop presenting them as the ordinary screenplay experience.

## B6. Existing proof files Fable should run, not rewrite

Core:

- `tests/script-development.test.ts`
- `tests/script-read-model.test.ts`
- `tests/script-projects-actions.test.ts`
- `tests/script-projects-save-v9.test.ts` and current save/migration suites
- `tests/first-film-journey.test.ts`
- `tests/bridge.test.ts`
- `tests/bridge-schema.test.ts`
- `tests/bridge-process-restart.test.ts`
- `tests/bridge-runtime-checkpoint.test.ts`

Browser behavior:

- `ui/src/screens/ScreenplayCommissionForm.test.tsx`
- `ui/src/screens/script-projects-ui.test.tsx`
- `ui/src/lot/WorldFirstLotRetainedCommissioningWorkspaceAppAuthority.test.tsx`
- `ui/src/lot/LotScriptReviewPanel.test.tsx`
- `ui/src/lot/WorldFirstLotNativeScriptReviewAppAuthority.test.tsx`
- `ui/src/lot/snapshot/scriptCommission.test.ts`
- `ui/src/lot/snapshot/scriptReview.test.ts`
- `ui/src/lot/FirstPictureGuidanceApp.test.tsx`
- `ui/src/lot/LotRetainedWorkspace.test.tsx`

These are behavior oracles. Unity does not need React-equivalent implementation details, but it may
not regress exact identity, state freshness, legal action order, receipts, input deduplication,
save/load, or Back behavior.

---

# C. Development Inspector Anatomy

## C1. Shared frame

Reuse the accepted Package 02 selected-inspector host after CP10A proves it.

- Desktop: shared 320–400 logical-pixel right inspector, typically ~360 px; safe-frame camera
  excludes it.
- Narrow/controller/200% text: same schema becomes 36–46% height bottom sheet, expandable to
  full-height one-axis scroll.
- Header/body/action/footer have one predictable order; only body scrolls.
- Minimum body text 16 px in the new Development surface, metadata 14 px, title 21–24 px, controls
  44 px high.
- Current dark green/gold/dossier visual identity; no white-paper memo.
- Common chrome: `Focus`, `Close selection`, optional exact alert badge. These do not consume
  business-action slots.
- At most six factual rows and two business actions before deeper detail.
- Route names are singular: `Open Development` opens the Writers' Room focused on the exact
  project when one exists; `Review screenplay` alone opens the retained review decision. Do not
  create a third `Open screenplay` surface.

## C2. Base wireframe

```text
┌──────────────────────────────────────┐
│ DEVELOPMENT                 [Close]  │
│ Screenplays commissioned, written,  │
│ and reviewed here                    │
│                                      │
│ [STATUS / ATTENTION]                 │
│ Project        <title or none>       │
│ Phase          <state>               │
│ Writer(s)      <names / availability>│
│ Decision due   Week N / N weeks      │
│ Capacity       occupied / total      │
│                                      │
│ [blocker + smallest remedy, if any]  │
│                                      │
│ [Focus]                              │
│ [primary current route/action]       │
│ [Open Development]                   │
└──────────────────────────────────────┘
```

When there are several projects, show the highest-priority exact project and `N more in
Development`; `Open Development` focuses the same priority card. Capacity rows include scripts,
auditions, and early productions truthfully. Never call the building idle solely because no script
is active.

## C3. Idle / commission-ready

```text
DEVELOPMENT
AVAILABLE
No screenplay is in development.
Capacity       0 / 2 occupied
Writers        2 available
Supply         3 market · Original open

[Commission a screenplay]
[Open Development]
```

- If commission will queue, replace status with `CAPACITY CONSTRAINED`, show `2 / 2`, one named
  occupant summary, and label primary action `Queue screenplay commission`.
- If commission is hard-blocked, omit the guessed action and render Core's headline/detail/remedy.
- Every compact count/availability row is conditional. If the bridge does not publish capacity,
  writer availability, supply, or `Original open`, omit that row; never fake `0 / 2`, a count, or an
  availability promise in Unity.

## C4. Drafting

```text
DEVELOPMENT
ACTIVE · DRAFTING
The Quiet Governess
Writer(s)      Ava Hartwell + 1
Decision due   Week 12 · 2 weeks
Room           Development & Casting · Slot 1
Capacity       1 / 2 occupied

[Open Development]
```

- Use discrete week segments if a visual progress affordance is helpful. No smooth percentage.
- Selecting a writer name selects/opens that exact person; it never changes assignment.
- `Add writer` is not a local inspector action. It remains deeper project management.

## C5. Rewriting

```text
DEVELOPMENT
ACTIVE · FINAL REWRITE
The Quiet Governess
Writer         Ava Hartwell
Decision due   Week 13 · 1 week
Room           Development & Casting · Slot 1
Capacity       1 / 2 occupied

Current assessment remains on file.
[Open Development]
```

Never use `Improving`, an up arrow, or green score motion while the rewrite is underway.

## C6. Review-ready

```text
DEVELOPMENT
DECISION REQUIRED · FIRST DRAFT
The Quiet Governess
Writer         Ava Hartwell
Assessment     Promising · Est. 64
Resources      Writer and room released

[Review screenplay]
[Open Development]
```

- The decision-required cue uses shape/icon/text, not color alone.
- `Review screenplay` opens the retained review workspace. Accept/Rewrite are not squeezed into
  this compact card.
- The game is already paused by the current decision law; the inspector does not create a second
  pause state.

## C7. Accepted / ready

```text
DEVELOPMENT
READY TO PACKAGE
The Quiet Governess
Genre          Drama
Assessment     Promising · Est. 64
Writer         Available / current exact state
Next           Casting

[Plan auditions / Open Casting, if emitted]
[Open Development]
```

Selection and camera remain on Development. The next route is current authority, not hard-coded
based on status alone.

## C8. Blocked / unavailable

```text
DEVELOPMENT
BLOCKED
No contracted writer is available.
Every current writer has another assignment.
Remedy: Review assignments or contract a writer.

[Open Development]
[Open Talent, only if an exact route exists]
```

- Preserve unaffected facts (capacity, current projects).
- One blocker headline, concise detail, one remedy. Deeper screen owns a longer list.
- A malformed/missing projection produces `Development details unavailable` and no material action;
  it never falls back to the generic memo as if it were current truth.

## C9. Building state changes while selected

The selected stable ID remains `writers`. New projections repaint content atomically:

- drafting → review: status and primary route change, time pauses, selection/camera unchanged;
- review → rewriting: exact success receipt then Rewriting state, same selection;
- review → ready: exact success receipt then Ready state, same selection;
- facility relocation/era art swap: anchor may change only through authoritative presentation
  registration; identity remains;
- missing anchor: selection identity may remain in inspector, but Focus/Locate disables and camera
  stays put;
- destroyed/retired identity: clear selection with one non-blocking notice; never select a same-name
  replacement.

---

# D. Commission Workspace Anatomy

## D1. Frame and allocation

Reuse the `LotRetainedWorkspace` behavior and existing Project: Studio styling.

- Desktop: right retained workspace `min(760px,72vw)`, height up to `88dvh`; lot visible under
  scrim, camera stationary, world input inert.
- Narrow ≤760 px / 200% text: full-width/full-height sheet with one vertical scroll owner.
- Header 12–15%; content 70–76%; sticky commitment/action footer 12–15%.
- Desktop content uses two columns: choices ~58–62%, live commitment summary ~38–42%. Collapse to
  one column on narrow layouts; summary follows current choice group and repeats above commit.
- Header: `LIVE LOT · DEVELOPMENT`, `Commission screenplay`, source/project working identity,
  `Open full Writers' Room details`, `Return to live Lot`.

## D2. Desktop wireframe

```text
┌──────────────────────────────────────────────────────────────────────┐
│ LIVE LOT · DEVELOPMENT    COMMISSION SCREENPLAY       [Details] [×] │
├──────────────────────────────────────┬───────────────────────────────┤
│ 1 · PICTURE                          │ COMMITMENT                    │
│ (•) Adapt market premise             │ Starts now / Joins queue     │
│ ( ) Commission original              │ Writer: Ava Hartwell         │
│ Premise / Creative direction         │ Draft: about 3 weeks         │
│ Contracted writer                    │ Review: Week 12              │
│                                      │ Capacity: 1 / 2              │
│ 2 · CREATIVE BRIEF                   │ Published office effect      │
│ Opening · Midpoint · Ending          │ Cost: no separate fee        │
│ Intended audiences                   │ Payroll/overhead continue    │
│ Intimacy · Tone · Kinetic energy     │                               │
│                                      │ WHAT HAPPENS NEXT             │
│ [Why these fields? / More details]   │ Drafting with named writer   │
├──────────────────────────────────────┴───────────────────────────────┤
│ [Return without commissioning]                 [Commission screenplay]│
└──────────────────────────────────────────────────────────────────────┘
```

## D3. Primary information

First visible without scrolling at a 1080p desktop target:

1. source: market or original;
2. selected premise/title + genre or original direction;
3. named writer + public role + `Est.` writing score + availability;
4. starts-now/queues state;
5. draft duration/due consequence;
6. primary commit.

The form may default choices exactly as the existing browser does, but defaults are not consent.
Every selected default is visible in the commitment summary.

## D4. Existing choices — include, do not embellish

| Group | Current fields | Presentation rule |
|---|---|---|
| Source | market premise / original screenplay | Two explicit cards/radios; unavailable arm remains explained or is omitted per authority |
| Concept/direction | market concept with title+genre; original genre | Show title/provenance; do not invent quality forecast for concept choice |
| Writer | contracted writer, public role, `Est.` writing score, availability, assignment | Sort using TypeScript order; unavailable entries readable; never silently replace selection |
| Creative shape | opening, midpoint, ending | Three concise selectors with one-line definitions; no false score arrows |
| Audience promise | intended segments; intimacy, tonal weight, kinetic energy | Plain-language low/medium/high descriptors backed by current ranges; exact values may live under More Details |

## D5. Advanced/details allocation

`Advanced` must not hide existing creative depth. Use **More details** only for:

- exact range values behind plain-language promise labels;
- full capacity facility/slot list;
- explanation of Development Office uplift/richness and writer-speed estimate;
- provenance or generated-title details;
- queue revalidation detail.

Do not add empty controls for budget, deadline, scale, tone, ambition, originality/risk, franchise,
IP, or rewrite plan.

## D6. Consequences

The commitment summary is TypeScript-published and updates whenever a choice changes. It must state:

- **starts now:** project identity will be created, named writer and exact slot reserved, due week;
- **queues:** the persisted request keeps the selected writer/brief—and market premise when
  adapting—but creates no writer assignment, `ScriptProject`, room/slot reservation, cash effect,
  or original concept mint until authoritative admission;
- draft duration for original; current pool concept law when adapting;
- current office effect;
- no separate acquisition fee;
- payroll and overhead continue while weeks pass;
- next player decision is screenplay review.

Do not show a budget total or “quality after draft” unless TypeScript adds a player-safe projection.

## D7. Confirmation and result

- Primary button label mirrors starts/queue state and source.
- One activation submits one freshly minted opaque intent; disable input while its exact POST is in
  flight.
- Escape/Back while editing cancels the presentation draft with no state/save/RNG mutation and
  restores Development inspector focus.
- On accepted start, show a short verified receipt: title, writer, commissioned week, due week,
  facility/slot. Then return to selected Development showing Drafting.
- On accepted queue, show queued week, selected writer as `Queued—not assigned`, and market premise
  title when adapting; state that no assignment/project/slot/cash effect occurs until admission.
- On rejection/stale state, stay in workspace, show exact retained rejection, refresh authoritative
  choices, and do not silently resubmit or change the selected writer.
- A neutral/unverifiable successor may say only “Studio updated”; never claim a screenplay was
  created.

---

# E. Screenplay Review Workspace Anatomy

## E1. Frame

Use the same retained host as Commission. Review is a substantive decision, not the current tiny
in-lot panel.

- Desktop maximum envelope: same 760 px / 72vw / 88dvh.
- Header 15%; assessment/evidence 40–45%; decision comparison 30–35%; sticky action footer 10–15%.
- At least 16 px body and consequence copy; `Est.` band 30–40 px; no 11 px evidence.
- One vertical scroll owner; decision buttons never disappear behind a nested scroll.
- Lot stays visible/inert and camera stays exactly fixed.

## E2. First-draft wireframe

```text
┌──────────────────────────────────────────────────────────────────────┐
│ FIRST-DRAFT REVIEW                             [Writers' Room] [×]  │
│ The Quiet Governess · Drama · Original screenplay by Ava Hartwell   │
├──────────────────────────────────────────────────────────────────────┤
│ PROMISING                                             Est. 64       │
│ The studio's current assessment                                     │
│                                                                      │
│ STRENGTHS                    CONCERNS                                 │
│ • concise current evidence    • concise current evidence             │
│                                                                      │
│ WHY THIS ESTIMATE                                                     │
│ Premise: <qualitative finding> · Current office effect included      │
│                                                                      │
│ CREATIVE BRIEF  Drama · Slow setup / Revelation / Bittersweet       │
│ Adult + Prestige · Intimate · Weighty · Restrained kinetics          │
├───────────────────────────────┬──────────────────────────────────────┤
│ ACCEPT NOW                    │ REQUEST FINAL REWRITE                │
│ Ready to package immediately │ Ava Hartwell · 1 week · Week 13     │
│ No time/cash/capacity/RNG     │ 1 shared slot · payroll/overhead     │
│ Keeps current Est. 64         │ Projected Est. 67 · Promising       │
│ [Accept first draft]          │ [Request final rewrite]             │
└───────────────────────────────┴──────────────────────────────────────┘
```

The projected number is illustrative only; the component renders fields from TypeScript.

## E3. Header and identity

Order:

1. first/final draft kicker;
2. screenplay title;
3. genre;
4. source/provenance;
5. writer credit/delivery line;
6. current status and week.

Internal project IDs remain available to diagnostics/tests but are not visible player labels.

## E4. Assessment

Order:

1. band word dominates;
2. `Est. score` remains visible and subordinate;
3. 2–4 strengths/concerns, each one line where possible;
4. `Why this estimate` from the extended TypeScript read model;
5. `More details` for provenance/full brief, not essential action consequences.

Current generic band text (“promising foundation,” “room for improvement”) is not enough. Do not
create bespoke Unity prose from score thresholds. TypeScript publishes all assessment copy as
qualitative factor labels/findings. It never publishes raw `baselineStrength`, `actualStrength`, a
hidden skill, a score formula, or a numeric factor decomposition for this block.

## E5. Creative identity

Show the existing locked brief separately from score drivers:

- genre;
- source/working title;
- opening/midpoint/ending;
- intended segments;
- plain-language promise axes.

This makes screenplays distinct without pretending those fields drive the scalar assessment.

## E6. First-review decisions

Use two comparison cards, Accept first and Rewrite second. They are side by side only when both
remain readable; narrow layouts or text scaling stack them vertically in that order, with each full
consequence beside its button. Equal visual weight does not mean equal legality: if Rewrite is
blocked, its card remains readable with blocker/remedy and no active commit button. Accept remains
primary and legal whenever Core emits it.

Each card must answer:

- result state;
- time;
- named people/facility capacity;
- operating cost consequence;
- assessment consequence/forecast;
- reversibility/finality;
- exact current blocker;
- commit label.

## E7. Final-review state

```text
FINAL-DRAFT REVIEW
<identity and current Est. assessment>

FINAL REWRITE COMPLETE
No further rewrite is available under the current screenplay contract.

ACCEPT FINAL DRAFT
Ready to package immediately. No time, cash, capacity, or RNG.
[Accept final draft]
```

Do not show a disabled Rewrite button as teasing future functionality. State the terminal rule once.
If the prior first-draft score is not authoritatively retained, do not display an invented
before/after delta.

## E8. Success and return

- Accept: verified receipt says Ready to package; workspace closes/records result; same Development
  selection/camera; First Film Journey updates to current Casting boundary.
- Rewrite: verified receipt says Rewriting, named writer, due week, facility/slot; workspace closes;
  same Development selection/camera; living time remains paused until player resumes.
- Failed/rejected: workspace stays, exact current read model replaces stale content, no optimistic
  score/state.

---

# F. Rewrite Consequence Preview

## F1. Required player answer

Before committing a rewrite, the player must be able to say:

> “I am giving Ava and one Development & Casting room one more week. The studio currently expects
> the assessment to move from Est. 64 to projected Est. 67. Accepting would move to Casting now.”

If the surface cannot support that sentence with current TypeScript fields, the action is not
builder-ready.

## F2. Authoritative preview anatomy

| Field | Source | Display | Constraint |
|---|---|---|---|
| Current assessment | persisted perceived `ScriptAssessment` through read model | `Est. N · Band` | Never actual strength |
| Projected assessment | TypeScript applies player-perceived rewrite projection | `Projected Est. N · Band` and `+/-/unchanged` | No Unity formula; label as projection |
| Writer | exact `project.writerId` + public person view | name, Writer/role | Never select substitute |
| Duration/due | current week + authoritative rewrite law | `1 week · review Week N` | Do not use wall-clock time |
| Capacity | current authoritative facility/slot quote | `1 Development & Casting slot`; named facility if current quote safely supplies it | Revalidate on commit |
| Operating consequence | existing consequence projection | `Payroll and studio overhead continue` | No invented rewrite fee |
| Availability | exact legal action + blockers | active button or headline/detail/remedy | UI does not infer from counts |
| Accept alternative | exact current accept action | `Ready to package now; no time/cash/capacity/RNG` | Always compare in same view |

Assessment-driver evidence is a separate TypeScript-authored qualitative collection: public label,
concise finding, and strength/concern/neutral semantics only. It has no raw premise/actual value,
hidden writer skill, numeric per-factor contribution, or formula. Unity renders it verbatim and may
not derive factor prose from score bands.

## F3. Direction treatment

- **Projected gain:** neutral/gold forecast arrow plus text `Projected +N`; never celebratory green
  certainty.
- **Projected unchanged:** horizontal/equals icon plus `Projected unchanged`.
- **Projected decline:** caution shape plus `Projected -N`; Rewrite remains available if Core says
  so. Do not secretly remove an unattractive legal choice.
- Color is redundant; text and icon carry the meaning.
- No percentage chance. No internal rewriting skill value or formula.

## F4. Staleness

The preview belongs to exact session/state revision/project/action. Any week advance, load, writer
contract/assignment change, facility/capacity change, accepted command, or new authoritative
projection invalidates it. The retained workspace refreshes and requires a fresh activation; it
never submits a cached rewrite intent.

## F5. What is not supported

- “Improve dialogue/structure/characters/comedy/commerciality”;
- projected box office, critic score, genre demand, or casting fit;
- probability range;
- writer fatigue/morale;
- deadline or release-window impact;
- explicit cash fee;
- repeat rewrite.

These are not hidden UI opportunities. They are absent simulation laws.

---

# G. State / Edge-Case Matrix

Package 02's global hover/selection/Focus/Back matrix remains binding. This table adds only
Development-specific content and commit behavior.

| State / edge case | Visible treatment | Allowed commands | Forbidden behavior | Camera / selection | Back / Escape |
|---|---|---|---|---|---|
| No writer exists | Development Blocked; Core blocker headline/detail/remedy; capacity still visible | Open Development/Talent route if exact; Close/Focus | Commission button, fabricated writer, memo fallback action | No camera move; `writers` remains selected | Clear one layer/selection under Package 02 |
| Writer busy | Writer remains in selector with exact assignment; selected busy writer blocks submit or refreshes to authority choice | Choose another published writer; open exact profile/assignment | Silent substitution, stale submit, inference from proximity | Stationary; selection unchanged | Cancel workspace restores invoking control |
| Development unavailable / legacy mode | Honest unavailable/legacy explanation, no current managed actions | Existing legacy route only when authority publishes it | Activating managed development, inventing capacity | No move; retain/clear exact target according to registry | One layer only |
| Capacity available | `Starts now`; exact current occupied/total | Edit brief, obtain fresh intent, Commission | C# slot selection | Stationary/inert lot behind workspace | Cancel with no mutation |
| Capacity full, queue legal | `Joins queue`; named/aggregate occupants; selected writer/brief identified as queued, not assigned | Queue exact commission; cancel; open details | Label “blocked”; assign writer or create project/reserve room early | No move; selection retained | Cancel one layer |
| Project drafting | Active treatment; project, writers, due week, slot/capacity; discrete weeks | Inspect person/project, Open Development, resume/advance time outside workspace | Smooth fake progress; Rewrite/Accept; work-clicks | Selection persists; normal manual camera | Clear inspector only after higher layers |
| Due now before tick/commit | `Due Week N`; still Drafting until authoritative week completes it | Advance/resume according to current time authority | Optimistic Review state | No automatic focus | Ordinary world Back |
| Review ready | Decision-required text/icon; time pause; compact summary and Review route | Review, open deep details, Focus/Close | Automatic workspace/camera; hidden pause; direct tiny-memo choice | Same selected Development/camera | Close review workspace to inspector; does not resume time |
| First review, rewrite legal | Two comparison cards; current/projected `Est.`; exact costs | Accept or Rewrite once; details | Guaranteed improvement copy; cached action | Camera fixed; world inert; selection retained | Close workspace; no mutation |
| First review, rewrite blocked | Accept card active; Rewrite card states writer/slot blocker and remedy | Accept; close; exact remedy/deep route | Disabled unexplained button; hiding Accept | Fixed | Close one layer |
| Rewrite requested | Verified receipt, then Rewriting state; named writer/due/facility/slot | Resume time, inspect project/person | Optimistic completed score; second rewrite | Same camera/selection | Workspace closes to selected Development |
| Final review | Current `Est.`; final rewrite complete; Accept only | Accept final draft; details | Second rewrite; disabled teaser types | Fixed | Close to inspector; time remains paused |
| Accepted / Ready | Positive state and exact Casting boundary | Exact current Casting route, project detail, stay in world | Auto-greenlight, auto-Locate, camera move | Development stays selected | Normal Package 02 stack |
| Stale action / revision changed | Controls inert during refresh; retained exact rejection; fresh current context if valid | Refresh/retry through new intent; cancel | Retry old intent; same-title substitution; partial optimistic state | No move; keep valid exact identity | Close one layer |
| Save during drafting | Save receipt; projection still Drafting with same IDs/writers/due/reservation after load | Continue, inspect, advance | Save UI workspace draft as gameplay; reset due week | Rehydrate camera per existing client law; target revalidated | Normal |
| Save during rewrite | Same project/rewriteCount/due/writer/reservation after load | Continue to final review | Re-offer first rewrite; recompute commitment in Unity | Revalidate selection/anchor | Normal |
| Load into review | Time paused/fail-closed; Development decision-required; no stale event receipt needed | Select Development; Review current exact project | Auto-accept/rewrite; use pre-load intent | No automatic camera | Review Back returns to current loaded lot context |
| Target/body unavailable | Inspector says anchor unavailable if identity remains; Focus disabled | Deep Development route, Close | Last-known camera jump; substitute Casting/Annex/building | Camera stays; identity may remain selected | Clears selection only at ordinary step |
| `writers` destroyed/retired | Remove world treatment; one non-blocking notice; historical route only if authority owns one | Continue, open canonical record if present | Tombstone position or same-name target | No move; clear selection | Notice is not a Back layer |
| Selected building changes state | Atomic content/action repaint; heading/stable ID unchanged | Newly current commands only | Closing inspector, changing camera, using prior legality | Preserve `writers` selection and pose | Same stack |
| Multiple projects | Highest-priority project + count; portfolio route; all decisions preserved | Open exact priority card; switch in deep workspace | First/last-match substitution; one-project schema | Selection remains building; no target churn | Restore exact focused project/list origin |
| Multiple reviews | Core decision order identifies exact first review; count/other cards in deep owner | Resolve current exact decision; deep inspect others if legal | Let Unity sort or choose; hide other reviews forever | Fixed | Return to same exact priority state |
| Time running while drafting | Active local state updates each authoritative week; no interruption | Pause/speed/inspect; advance loop | UI timer determining outcome; progress mutation per frame | Manual camera; no follow unless explicit | Normal |
| Auto-pause on review | Living-time HUD shows Paused and decision reason | Review, inspect, explicit later resume after decision | Two pause owners; automatic resume after Accept/Rewrite | No camera move; current selection preserved | Closing UI does not resume |
| Workspace open | Lot visible, inert, no click-through; accessible focus inside | Workspace controls, Back, exact deep route | World select/pan/material action behind it; time advance | Camera stationary; selection retained | Pops workspace and restores invoking focus |
| Narrow viewport / 200% text | Full-width sheet; one-axis scroll; one-column choices/comparison; sticky current action | Same semantic commands and order | Hidden consequence/action, horizontal scroll, different legality | Safe world region excludes sheet | Same global stack |
| Reduced motion | Static state change/receipt; workspace no travel; Focus snaps/≤100ms via Package 02 | All same commands | Removing information or Focus capability | No flourish | Identical result |
| Controller/keyboard | Visible focus ring; deterministic field order; selected options summarized; no hover dependency | Directional navigation, Confirm, Back, Focus, open details | Required pointer drag/double-click/hold; focus loss on refresh | Same explicit Focus law | One layer; restore invoking focus |
| Renderer failure / delayed body | Semantic Development fallback may expose read-only/current routes if exact; no invented geometry | Deep management/current safe action if authority supports it | Claim physical presence/slot location from missing render | Camera stays | Normal |

---

# H. Golden UX Journeys

These are implementation acceptance contracts. Automation may inspect state/revision/digest and UI
focus; Owner playtest proves readability and intent.

P03A's primary end-to-end path owns one started project and one review. Journeys 1–12 prove that
vertical slice. Journeys 13–15 prove existing queue/edge/accessibility laws through the narrowest
available integration or fixture seam; they do not authorize a new portfolio optimizer, history
browser, queue simulation, or controller framework.

## Journey 1 — Locate Development

**Given:** a founded studio with no screenplay in progress and current First Film Journey pointing
to Development.

**Steps:** open the journey/attention explanation; choose `Locate Development` or the explicit world
route.

**PASS:** exact building ID `writers` is selected and Focused using Package 02; compact inspector
says what Development does and whether commission starts/queues/is blocked. No material intent,
week, RNG, save, or commission occurred. No Casting/Admin substitute is selected.

## Journey 2 — Select Development directly

**Given:** `writers` is visible and no workspace is open.

**Steps:** hover, single click, then invoke Focus separately.

**PASS:** hover is at most two lines; single click opens exact Development inspector and does not
move the camera or act; Focus alone moves camera to safe frame. Double-click is only same-ID Focus.

## Journey 3 — Commission a screenplay

**Given:** market/original supply and at least one available writer; capacity allows start.

**Steps:** select Development → Commission → choose source/concept or direction, writer, shape, and
promise → review commitment → confirm once.

**PASS:** lot remains mounted/inert; every field comes from current TypeScript projection; one fresh
opaque intent commits once; successor contains one exact ScriptProject with chosen authoritative
brief, writer, due week, and reservation; receipt agrees; same selected Development shows Drafting.
Unity constructed no Core payload or legality.

## Journey 4 — Writer begins work

**Given:** Journey 3's started project and a current writer presence anchor.

**Steps:** return to lot; inspect Development; select the named writer.

**PASS:** Development and person inspector agree on project, phase, due week, facility, and identity;
writer visibly works only because presence says `engagement: script`; selection/proximity changes no
assignment or quality.

## Journey 5 — Inspect progress without waiting at a timer

**Given:** a multiweek original screenplay is Drafting.

**Steps:** run the lot, manage another entity, return to Development after one authoritative week.

**PASS:** project advances only through week authority; Development now shows the current discrete
weeks-to-review and unchanged exact IDs; no progress click or fake continuous percentage was
required; ordinary progress caused no alert/pause.

## Journey 6 — Advance time to the due week

**Given:** one week remains.

**Steps:** resume 1×/2×/4× or invoke the current advance intent; allow the due week to complete.

**PASS:** exactly one authoritative week commits at a time; TypeScript completes work, releases
writer/slot, sets project to Review, and publishes `scriptReview`; living time auto-pauses; camera
does not move; no C# timer/outcome is involved.

## Journey 7 — Review ready

**Given:** first draft at Review and time auto-paused.

**Steps:** read the attention explanation; select Development if needed; open `Review screenplay`.

**PASS:** compact inspector identifies exact title/writer/first review and a legible `Est.` summary;
retained workspace opens with at least 16 px body copy, TypeScript-authored qualitative assessment
basis, creative brief, readable Accept/Rewrite consequences, and current legal actions. The basis
originates in the extended Core projection/DTO; Unity performs no score arithmetic, thresholds, or
driver prose. No automatic camera movement or action.

## Journey 8 — Accept deliberately

**Given:** Journey 7, current `Est.` assessment and a legal rewrite preview.

**Steps:** compare both cards; choose `Accept first draft` once.

**PASS:** Accept card clearly said Ready now/no time-cash-capacity-RNG; exactly one opaque action is
accepted; project becomes Ready without week change; receipt is exact; workspace returns to same
Development context; current Casting boundary appears but does not open or move camera.

## Journey 9 — Rewrite deliberately

**Given:** first review, rewrite legal, projected perceived score may gain, hold, or decline.

**Steps:** compare Accept with Rewrite; choose `Request final rewrite` once.

**PASS:** the surface named current/projected `Est.`, writer, one week, due week, one slot, and
payroll/overhead before commit; exactly one current opaque intent is accepted; successor is
Rewriting with `rewriteCount: 1`, exact writer/reservation/due; no “improved” success claim; final
review offers Accept only. The preview is scoped to exact session/revision/project/action and becomes
invalid on any authoritative change; Unity performs no rewrite arithmetic.

## Journey 10 — Back / Locate / context restoration

**Given:** exact screenplay review opened from selected Development; deep Writers' Room is available.

**Steps:** open full Writers' Room details focused on the project → use Locate Development or Locate
writer → choose Back to Writers' Room → Back to lot.

**PASS:** every transition carries exact IDs; Locate revalidates and Focuses only the current anchor;
Back restores route/project/tab/scroll/UI focus and pre-Locate camera; final Back restores exact
Development selection/inspector/camera. No duplicate origin or state rollback.

## Journey 11 — Stale-intent failure

**Given:** review workspace rendered at revision R; another accepted action/load changes revision or
writer/capacity before commit.

**Steps:** activate the old Rewrite control.

**PASS:** old intent is rejected/inert; no screenplay/week/RNG/save mutation; no automatic retry;
camera and exact project identity remain; workspace refreshes to current assessment/actions or
closes with a concise unavailable explanation. The old comparison preview is invalidated and a new
one must accompany any replacement action. It never acts on same-title/first project.

## Journey 12 — Save/load during Drafting and Rewrite

**Given:** one Drafting save and one Rewriting save.

**Steps:** save; alter only transient UI/camera; load; inspect Development; advance to review.

**PASS:** each load restores the same authoritative project ID, writer IDs, brief, status,
rewriteCount, due week, assessment/reservation as saved; transient workspace draft is not in the
save; current world selection is revalidated; rewrite does not become available twice; completion
matches an uninterrupted run.

## Journey 13 — Capacity full but commission queues

**Given:** every shared Development & Casting slot has a named occupant and Core publishes a
queueable commission.

**Steps:** open commission; inspect consequence; queue it; inspect Development/queue; free a slot
through normal authoritative progression.

**PASS:** surface says Queue, not Blocked; receipt retains the chosen writer/brief and adapted market
premise but labels the writer queued, not assigned; no `ScriptProject`, assignment, room/slot
reservation, cash effect, or original concept mint exists while waiting; TypeScript revalidates at
admission; Unity never pre-reserves or predicts which slot; rejection leaves queue/current state
honest.

## Journey 14 — No writer / busy writer remedy

**Given:** no legal writer, then a state where one named writer is busy and another is available.

**Steps:** select Development; open commission when allowed; inspect writer entries; select busy then
available writer.

**PASS:** no-writer state has no guessed Commission commit; busy writer says exact assignment and
cannot submit; available writer can receive a fresh authoritative quote; no silent default switch;
opening person/profile changes no assignment.

## Journey 15 — Narrow, scaled-text, keyboard/controller

**Given:** 760 px and narrower viewport, then 200% text, pointer absent.

**Steps:** locate/select Development, open commission, complete fields, cancel; reopen review,
navigate comparison, open details, Back.

**PASS:** same fields/order/legality; one-axis sheet scroll, no clipped consequence/action or
horizontal scroll; visible focus never falls behind refresh; controls at least 44 px; no hover,
drag, double-click, hold, or chord is required; Back restores exact invoking focus.

---

# I. Fable Implementation Map

## REUSE

- Core `ScriptProject` schema/lifecycle, assessment and rewrite laws, actions, tick, queues,
  capacity, assignments, saves, and stable IDs.
- `scriptProjectsReadModel`, `firstFilmJourney`, `nextStudioDecision`, presence and lot projections.
- Browser `ScreenplayCommissionForm`, strict commission/review/queue receipt selectors, current
  Writers' Room content, retained-workspace behavior, exact return/focus laws, and living-time
  `scriptReview` auto-pause as behavioral oracles.
- Bridge session/revision/digest validation, opaque intents, exact POST/reconcile, runtime
  continuity, restart/checkpoint, rejection retention, save/load.
- Unity projection store, world presentation, people/presence binding, current selection/camera/time
  systems, and CP10A's accepted shared inspector/origin stack.
- Stable `writers` identity from `src/core/lot.ts` and the sealed fixture.

## BUILD NEXT — one checkpoint only

**P03A Development-from-the-Lot V1**:

1. author/selectable Unity Development body for existing `writers` identity;
2. Development-specific content in the CP10A shared inspector;
3. one shared retained-workspace host in Unity;
4. retained commission workspace using the existing authoritative choices/consequences;
5. selected writer/project work state and due-week world response;
6. review-ready attention + existing auto-pause;
7. retained review workspace with assessment basis and Accept/Rewrite comparison;
8. exact commit receipts and stale failure;
9. Ready-to-package boundary plus exact existing Casting route;
10. golden journeys 1–12 end to end, with journeys 13–15 proven at the narrowest existing
    integration/fixture seam; hostile review covers authority duplication and 1080p/200%-text
    readability.

Stop there. Do not include audition, package, greenlight, production, or release implementation.

## EXTEND

- `src/core/scriptReadModel.ts` (or the same player-safe Core boundary) with assessment explanation
  and deterministic projected **perceived** rewrite result/consequence.
- Bridge schema/projection and generated Unity DTOs with Development building/project/commission/
  review/capacity context.
- TypeScript bridge path that converts the player's exact current commission selections into a
  fresh opaque commit intent after authoritative validation.
- `StudioProjectionStore` and Unity presentation adapters for those new read-only views.
- CP10A shared inspector with the state anatomy in section C.
- Existing writer presence anchoring where the authoritative `writers` body/Annex reservation
  supplies a current anchor.
- Test/proof coverage for the new projection, protocol closure, staleness, accessibility, and
  golden journeys.

## DO NOT REBUILD

- `ScriptProject`, first-draft/rewrite math, `Est.` bands, project status transitions, writer pool,
  capacity/slot/queue law, due weeks, costs, time, RNG, save/migration, assignment, or legal-action
  ordering.
- Browser strict selector/receipt semantics or retained origin behavior in a second incompatible
  form.
- Bridge session/digest/revision/opaque-intent machinery.
- Unity selection, camera, living time, people presentation, save/load, or rejection systems.
- One inspector per Development state or one workspace per source type.
- The generic memo's preselected commission defaults as the new form.
- `StudioDevelopment.tsx` as screenplay owner.

## LEAVE ALONE

- CP10A Gate applicant and Administration implementation lane.
- Founding actions and `PlayerIsFoundingOption` filtering.
- Casting/Audition/Package/Greenlight/Production/Release simulation and presentation beyond the
  existing Ready boundary.
- Stage 7/12 production truth and camera/art systems.
- Current fail-closed bridge and save compatibility guarantees.

## DEFER

- targeted rewrite types;
- multiple rewrite rounds;
- deadlines/release windows/development fees;
- commercial appeal/originality/dialogue/structure scores;
- evaluator confidence progression;
- screenplay abandonment/sale/turnaround/franchises/IP;
- Advanced Movie Maker;
- era-progression design and period-specific Development interiors;
- full multi-project Unity portfolio optimization beyond component/schema support;
- cinematics and decorative screenplay-delivery ceremonies.

## OWNER DECISIONS REQUIRED

**No unresolved design decision is required before implementation if the Owner accepts Package 03.**
This package rules that the first-review comparison shows an exact TypeScript-derived **projected
perceived** score, retains hidden actual truth, and adds no new outcome mechanic. It rules targeted
rewrite types and richer strategic pressure Later.

The ordinary Owner-review gate remains: accept or amend the Package 03 ruling before P03A begins.
Fable is not left to choose the information contract: the Accept/Rewrite comparison uses an exact
numeric projected perceived score under current rules, while assessment-driver explanation is
qualitative and TypeScript-authored. Nor may Fable choose local memo versus retained review or add
new rewrite mechanics.

---

# Completion gate for Fable

P03A is accepted only when an Owner can begin from the visible lot, find/select Development,
commission with an understood brief, see the named writer and project work, let time pass, recognize
review attention, understand why Accept and Rewrite differ, make either choice deliberately, and
return to the same world context—while hostile review proves that Unity owns no screenplay truth.
