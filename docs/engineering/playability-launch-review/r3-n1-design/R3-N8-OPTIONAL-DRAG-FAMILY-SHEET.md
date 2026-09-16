# R3-N8-DESIGN-10 — 2B optional lawful drag (family sheet)

**Task** R3-N8-DESIGN-10 under the Owner directive of 2026-09-15 and `plans/R3-OVERHAUL-PLAN.md` phase **N8**, as CORRECTED by
`plans/N7-N8-LEGALITY-AND-RETRIEVABILITY-INVENTORY.md` **Part 1** (corrections 1–5). **Mode** DESIGN_PROTOTYPE — this file is the whole change. No source, test, build, capture
or native input was produced; the Unity worktree was read only (HEAD `46e0fae7`) and the Editor was never launched. TS worktree `79af664dc`, branch `wip/playability-interaction-01-ts`.
**Binding** Owner clarification §8 **2B**: "Keep a complete click/select and keyboard route; add drag-and-drop shortcuts where an existing lawful action supports them. Show valid
targets, intended action and consequences. Use the same exact identities, legality and commitment reviews as the ordinary route; no implicit hiring, bypassed casting rules or surprise
spending. Dragging is never required." Also binding: **1A** desktop-first, `R3-N2-TEXT-RULES-ADDENDUM.md` W1–W6 and §4, `R3-N3-VISUAL-STANDARD-SHEET.md` §2, the N4 §4 More-actions law
as generalised by N5 §4 / N6 §5, the N4/N5/N6 named ordinary controls, the **N7** Escape-ladder order (§1.4) and focus-line law (§1.3), and `StillDisplayed()` / `QuoteFresh()` as the
two stale-drop authorities (inventory correction 4). No P13B mechanics. No universal undo. No auto-pause. No new gameplay verb.

**Labels** `[NAT]` hand reading of committed source (paper, never a runtime observation) · `[REN]` read off an existing rendered element map · `[R3]` an already-selected law ·
`[REC]` this sheet's recommendation · `[GAP]` named dependency.

**The one sentence that governs every section below:** a drop is a **selection gesture**, never a commitment. Every drop lands the player on the same review the ordinary route lands
them on, with the same identities, the same quote and the same confirm control. Nothing in this sheet lets a drop spend money, sign a person, or start a session.
## 1. Route selection — the seven lawful routes ranked by player value ÷ implementation cost

Ordering is `[REC]`; **the PM decides**. Cost is read from the committed client: which input pipeline the source lives in, whether source and target share one panel, and how much
existing machinery is reused. "Same panel" is decisive — UI Toolkit pointer capture inside one `Root` is cheap; crossing into IMGUI or into the 3D lot is not.

| # | Route | Value | Cost | Why that cost `[NAT]` | Verdict |
|---|---|---|---|---|---|
| 1 | **(c) catalogue item → lot placement** | highest — this is the gesture the genre is built on, and it is the only route with a true **per-cell** preview | low–medium | the driver already exists: `StudioBuildPlacementDriver.HandlePointer` already calls `workspace.MoveOrigin(gx,gy)` from a world raycast while `BuildPreviewCapturesPointer` is true (`StudioWorkspaceHost.cs:147-150`). Drag adds *press on the card enters Previewing*, nothing else | **SELECT** |
| 2 | **(e1) candidate → package role slot** | high — replaces "pick the role on the rail, then find the person, then CHOOSE" with one gesture; casting is the list-heaviest surface in the game | low | source `casting-candidate-{talentId}` and target `casting-role-{roleKey}` are siblings under one UI Toolkit `casting-root` (`StudioCastingWorkspace.cs:411, 493, 2143, 3010`) | **SELECT** |
| 3 | **(e2) candidate → screen-test slate** | medium–high — the slate is two-per-role and is built by repeated add/remove; a drag makes the pairing visible | ~0 marginal | identical source, identical controller, target `casting-slate-role-{roleKey}` (`:813`). Only the verdict function differs | **SELECT** |
| 4 | **(a) candidate → comparison slot** | medium — commits nothing, so it is the safest place for a player to learn the gesture | ~0 marginal | identical source and controller; target `casting-compare-bar` (`:525`). No engine call, no quote, no review | **SELECT** (as the third target of the one casting controller, not as its own work item) |
| 5 | **(b3) set blueprint → soundstage** | medium — inverts the shipped stage-first order, which is the one real complaint the Sets route earns | medium | both lists are UI Toolkit under one root (`build-set-cards` `:285`, `build-set-stages` `:277`), but the drop must drive a **second quote path** (`AskSetQuote` / `SetPreviewGeneration` / `setGestureQuote` `:128, 331, 408`) that has its own displayed-quote authority. Not free | **DEFER** |
| 6 | **(d) scientist → Research Laboratory** | low — the ordinary route is *already one button*, `laboratory-action-assign-{lab}-{person}` (`StudioLaboratoryWorkspace.cs:206`, intent id `assign-{lab}-{person}` `bridge/laboratory.ts:113`); there is no second list inside the Laboratory to drag from | high | the only sensible source is the **people rail**, which is IMGUI (`StudioPeopleRailHud` has `OnGUI`, zero `VisualElement` `[NAT]`), and the target is a UI Toolkit workspace or a lot building. That is the most expensive boundary in the client, bought for the smallest saving | **DEFER** |
| 7 | **(e3) writer → new commission** | low — the writer is already a chooser inside the same form | high | the commission form is `StudioDevelopmentCardHud`, **IMGUI** (`OnGUI`, zero `VisualElement` `[NAT]`). An IMGUI drag needs a whole second implementation of lift, ghost and capture | **DEFER** |

**Selected for this window: 4 routes, 2 mechanisms** — one *panel-to-world* controller (route 1) and one *within-panel* controller with three targets (routes 2–4).
**Deferred routes are deferred, not refused:** 5 and 6 are lawful today and stay on the list for a later window; 7 is lawful but costs a second input pipeline for no route the player
lacks. Deferring them costs the player nothing, because **every one of them is already complete by click and by keyboard** (inventory correction 5).

**Named dependencies — verbatim from the inventory, never to be worked around by inventing a command:**
* (b1) script/project → stage, *schedule a take*: "**NOT LAWFUL AS SPECIFIED.** The verb takes **only** `productionId` (`types.ts:1799`) — a stage drop target is not a command parameter."
* (b2) script/project → stage, *assign/choose a stage*: "**NOT LAWFUL** — named dependency: no command accepts `(productionId, stageFacilityId)`."
* (c′) existing building → new cell (move): "**NOT LAWFUL** — the bridge draft refuses any verb but `build` (`bridge/placement.ts:112-114`); named dependency."
* (d′) any other person → facility: "**NOT LAWFUL** — named dependency."
* (e4) writer → screenplay already in draft: "**LAWFUL WITH NAMED DEPENDENCY** — command exists; **no bridge intent** (zero matches for `assignScreenplayWriter` under `bridge/`) and no Unity control."
* (e5) person → *already-greenlit* picture (recast): "**NOT LAWFUL.** `assignShootingDirector` only re-calls the picture's own locked director (`operations.ts:636-640`) — it is not a reassignment."
## 2. Per selected route

### 2.1 Route (c) — catalogue item → lot placement

**Ordinary route it shortcuts** (unchanged, all controls stay present and enabled): `build-parcel-{parcelId}` → `build-card-{blueprintId}` / `build-card-{blueprintId}-preview` →
`build-nudge-n|s|w|e` (and the arrow-key repeat in `StudioBuildPlacementDriver.HandleKeys`) → `build-quote-*` strip → `build-commit` / `build-cancel` `[NAT]`.

**Drag source.** The catalogue card `build-card-{blueprintId}` — the whole card, not only its PREVIEW button. The card is already `focusable = true, tabIndex = 0` (`:1175`), so the
keyboard route to the same object already exists and is untouched. **Lift affordance:** on pointer-down the card takes a `2·s` `StudioUiTokens.Brass` inset outline and its status line
gains a second rendered line "Drag onto the lot, or press PREVIEW."; on lift the card stays in place at 0.45 alpha (the player must never lose their place in the list) and the ghost
appears. A press that never lifts is an ordinary click and does exactly what it does today.

**Valid-target preview source (exact wire).** `BridgePlacementQuoteSnapshot.cellLegality[] { cell{gx,gy}, ok, rejection }` and `primary` / `primaryReason` / `unmetRequirements[].reason`
(`bridge/placement.ts:189-207`) `[NAT]`. The ghost is re-asked as the origin moves, exactly as the nudge path already re-asks it; **the client derives no legality of its own.**

**Hover-over-target presentation.** Two lines, both in the pinned strip **and** at the cursor (the world `reasonLabel` already exists at the ghost, `StudioBuildPlacementDriver` `[NAT]`;
N5 §5 already requires the same sentence in the pinned strip because the world label is neither keyboard-reachable nor persistent):
*intended action* — "Build <name> here — <cost> now, <weeks>, opens Week <completesOnWeek>." (from `commitLabel`, `cost`, `buildWeeks`, `completesOnWeek`);
*consequence* — "Cash after build <cashAfter>. Weekly operating cost <weeklyOperatingCost> from the week it opens." (`cashBefore`/`cashAfter`/`affordable`).
**Invalid target:** `primaryReason` in full, plus every `unmetRequirements[].reason`, plus the per-cell marks. Never a silent no-op, never the word "invalid" standing alone — `occupied`
and `clearanceRing` stay distinct sentences (N5 §5).

**Drop → the SAME review.** The drop **moves the footprint origin and nothing else**: `MoveOrigin(gx,gy)`, state stays `BuildState.Previewing`. The commitment review is the **build
quote** — the `build-quote` strip above `build-actions` — and the commitment is `build-commit`, pressed separately. A drop on an illegal cell leaves the preview standing with the
refusal shown and `build-commit` reading "NOT A VALID SITE" (`StudioBuildWorkspaceContracts.CommitLabel` `:367`). **Nothing commits on drop.**

**Cancel.** Escape (rung 0, §3.5) returns the card to the catalogue and leaves `BuildState.Catalogue` with the parcel retained; drop outside the lot grid (`TryGroundPoint` fails, or the
pointer is still over the panel) is a **no-op cancel** with the line "Nothing has been built and nothing has been charged." (N5 §6 copy, verbatim); right-click cancels identically.
Cancel never leaves a preview the player did not ask for.

**Stale-drop recheck.** `QuoteFresh(quote, liveRevision)` (`StudioBuildWorkspaceContracts.cs:363`) — a quote answered against an older `stateRevision` repaints "Re-asking (the week
moved on)…" and is never committed — **plus** the TS commit revalidation, which re-asks `queryPlacement` against live state at commit (`bridge/session.ts:1572-1578`) `[NAT]`.
`StillDisplayed()` does **not** apply to Build (inventory correction 4).

**Trackpad.** Press-and-hold ≥ 160 ms on the card, then move — §3.1. **Keyboard equivalent** is already complete by construction: PREVIEW, then the arrow-key nudge with repeat, then `build-commit`. **The regression to protect:** `build-parcel-*`, `build-card-*`, `build-card-*-preview`, `build-nudge-*`, `build-commit`, `build-cancel` and `build-back` all stay
present, enabled and in the same tab ring with drag enabled.

**Named implementation hazard `[NAT]`.** `StudioBuildPlacementDriver.HandlePointer` returns early when `StudioCameraInput.IsPointerOverUi(input)` is true (`:79`). A drag out of the
catalogue **begins** over the panel, so those frames must be *ignored* (ghost hidden, no origin move), not treated as a cancel; the first legal drop cell exists only once the pointer
has left the panel. A drop released while still over the panel is the cancel case above.

### 2.2 Route (e1) — casting candidate → package role slot (pre-greenlight)

**Ordinary route it shortcuts:** select the role on `casting-role-{roleKey}` → inspect `casting-candidate-{talentId}` → `casting-choose` (dossier, `:2528`) or
`casting-row-choose-{talentId}` (in-list, `:2304`); under a conflict `casting-row-move-{id}` / `casting-row-move-cancel-{id}` / `casting-row-remove-{id}` / `casting-row-return-{id}` `[NAT]`.

**Drag source.** The candidate row `casting-candidate-{talentId}` (`:2143`). **Lift affordance:** identical to §2.1 — brass inset on press, source held at 0.45 alpha on lift.
Row action buttons (`casting-row-actions-{talentId}`) are **not** drag sources: a press that starts on a button is a button press.

**Valid-target preview source (exact wire).** The role pools `leadCandidates` / `antagonistCandidates` / `supportCandidates` / `craftCandidates` with per-candidate
`available` + `availabilityLabel` (`bridge/casting.ts:105-127`; schema `StudioCastingCandidateSnapshot.available:bool`, `availabilityLabel:nonEmptyText` `bridge/schema/bridge-schema.ts:1162-1163`)
and `packageReadiness.blockers[] { code, role, talentId, message, currentHolderId, remedy }` (`bridge/casting.ts:261-264`; schema `:1130-1147`) `[NAT]`. **Pool membership is the legality:**
a role chip is a valid target for a person only if that person is in that role's live pool — the same fact `casting-row-choose-{id}` reads.

**Hover-over-target presentation.** *Intended action* — "Cast <name> as <Role>." *Consequence* — "Draft only. Nothing is spent until you confirm the greenlight."
(the `casting-draft-badge` "Package draft · not committed" already carries this fact `[NAT]`). If the slot is occupied: "Replaces <current holder> as <Role>." — the same sentence the
`casting-row-move-evicts-{id}` path already states. **Invalid target:** the pool reason inline — `availabilityLabel` verbatim when the person is unavailable, or "<name> is not a current
<Role> candidate." when the person is not in that pool. Never a silent no-op.

**Drop → the SAME review.** The drop performs a **draft edit only** (`castingDraftToEngine`, `bridge/casting.ts:532-546` — it converts at greenlight, not at edit). The commitment review
is the **greenlight quote**: `casting-review-greenlight` opens `casting-greenlight-review` with `casting-gl-negative` / `-marketing` / `-total-immediate` / `-cash-before` / `-cash-after` /
`-blockers` / `-queue-note`, and the commitment is `casting-gl-commit` (`:978`). A drop invalidates a displayed greenlight quote exactly as any other draft change does
(`IsGreenlightQuoteDisplayed` false on any changed field) — that is the correct behaviour, not a defect, and it is stated in help (N7 §1.5 Casting line 5).

**Cancel.** Escape (rung 0); drop outside any role chip; right-click. All three leave the draft byte-identical.

**Stale-drop recheck.** `StillDisplayed()` at the **review**, not at the drop: `StudioWorkspaceHost.DisplayedGreenlight.cs:43` — `Owns() && GreenlightSurfaceVisible() &&
workspace.IsGreenlightQuoteDisplayed(quote)` `[NAT]`. At the drop itself the recheck is **live pool membership**, re-read from the current snapshot at pointer-up, never from the snapshot
that was live at pointer-down: if the week advanced mid-drag and the person left the pool, the drop refuses with the pool sentence and changes nothing.

**Trackpad** §3.1. **Keyboard equivalent** complete by construction. **Regression to protect:** `casting-role-{roleKey}`, `casting-candidate-{talentId}`, `casting-choose`,
`casting-row-choose-{id}`, `casting-row-move-{id}`, `casting-row-move-cancel-{id}`, `casting-row-remove-{id}`, `casting-row-return-{id}`, `casting-review-greenlight`, `casting-gl-commit`,
`casting-gl-back` all present and enabled.

### 2.3 Route (e2) — casting candidate → screen-test slate

**Ordinary route:** `casting-plan-tests` → `casting-slate-add-{talentId}` (`:2350`) / `casting-slate-add` (`:2549`) → `casting-slate-start` / `casting-slate-cancel` `[NAT]`.

**Drag source** identical to §2.2. **Target** the per-role slate row `casting-slate-role-{roleKey}` (`:813`).

**Valid-target preview source.** The same live pools plus `activeSlate` (`bridge/casting.ts:172-199, 258`) and the client's own `SlateFor(roleKey)` list `[NAT]`. The engine law is
**exactly two per role**, enforced at `startCastingSession` conversion (`bridge/casting.ts:387-420`).

**Hover-over-target presentation.** *Intended action* — "Screen-test <name> for <Role> (<n> of 2)." *Consequence* — the shipped strings, verbatim: "No talent hold — every candidate
tested remains available elsewhere." (`casting.ts:85`) and the slate's own `casting-slate-consequence-week` / `-slot` / `-nofee` / `-nohold` / `-unique` lines. **Invalid target:**
role full → "This role already has two candidates. Remove one first."; not in pool → "\"<id>\" is not a current <Role> candidate." (the engine's own sentence, `:405-407`);
already on the slate → "<name> is already testing for <Role>."

**Drop → the SAME review.** A slate draft edit only. The commitment review is the slate consequence block + `casting-slate-start`, whose displayed-intent authority is
`StudioWorkspaceHost.DisplayedScreenTests.cs:43` `StillDisplayed()` `[NAT]`. **Nothing starts on drop.**

**Cancel / stale-drop / trackpad / keyboard**: as §2.2, with `DisplayedScreenTests.StillDisplayed()` in place of the greenlight one.
### 2.4 Route (a) — casting candidate → comparison slot

**Ordinary route:** `casting-pin-compare` (`:2537`) to pin, `casting-compare-unpin-{talentId}` (`:4361`) to unpin, `casting-compare-open` / `casting-compare-back` to view `[NAT]`.

**Drag source** identical to §2.2. **Target** `casting-compare-bar` (`:525`).

**Valid-target preview source.** **Client view state only** — `StudioCastingWorkspaceContext.ComparePins`, guarded by `PoolContains(context.Role, talentId)` and the cap of **4**
(`StudioCastingWorkspace.cs:4389-4391`) `[NAT]`. There is no engine command and no bridge intent.

**Hover.** *Intended action* — "Pin <name> to compare (<n> of 4)." *Consequence* — "Comparing changes nothing. It is a view." (N7 §1.5 Casting line 2, verbatim).
**Invalid target:** "Compare holds four at a time. Remove one first." or the pool sentence.

**Drop → no review, because there is nothing to review.** This is the one selected route that commits nothing at any point, and it is therefore the correct place for a player to
discover the gesture. Because `TogglePinForCompare` returns `false` on refusal and never throws, the drop's failure path is a rendered sentence, never an exception.

**Cancel** as §2.2. **Stale-drop recheck: pool membership + the cap, re-read at pointer-up** — `StillDisplayed()` and `QuoteFresh()` **do not apply here** (inventory row (a), explicit).
**No TS refusal test is owed for this route** (§4). **Regression to protect:** `casting-pin-compare`, `casting-compare-unpin-{id}`, `casting-compare-open`, `casting-compare-back`.
## 3. The shared drag law

### 3.1 Lift
`lift = 6·s` px of pointer travel from the press point, **or** a press held ≥ **160 ms** without leaving that radius (the trackpad path: press-and-hold, then move).
`s` follows the viewport, **not** the text preference (N2 **W2**): the distance a hand moves must not change when a player enlarges text. 6 is below every control's hit floor (`34·m` = 34 / 51 / 68, **W3**), so a lift is never confusable with a press meant as a click. A press released before either condition is an ordinary click and runs the shipped handler unchanged. **Right-click never lifts.**

### 3.2 Ghost
Width = the source's width clamped to `320·s`; height = two rendered lines (`2 × 18·m + 4·s` = 40 / 58 / 76, the N7 §1.3 focus-line measure re-used); opacity **0.80**;
`pickingMode = Ignore` so it never becomes its own drop target; drawn last in the panel (and, over the lot, as the existing footprint ghost — route (c) has a *better* ghost already and
keeps it, with the card ghost hidden the moment the pointer leaves the panel). **Label:** line 1 the identity (`name` for a person, `build-card-{id}-title` text for a blueprint), line 2
the live intended-action sentence. The grab offset is preserved, so the point the player grabbed stays under the pointer. The ghost never carries a portrait alone and never carries a
glyph alone.

### 3.3 Target styling — word + colour + glyph, never colour alone (N2 §4, P09-REQ-015)
| Verdict | Word | Colour | Glyph | Border |
|---|---|---|---|---|
| valid | the intended-action sentence, in full | `StudioUiTokens.Committed` (deep green) | `confirmed.svg` (✓) at `16·m` | `3·s` solid |
| invalid | the exact refusal sentence, in full | `StudioUiTokens.Action` (oxblood) | `close.svg` (✕) at `16·m` | `3·s` solid |
| not a target | "Release here to cancel. Nothing changes." | none | none | none |
Deliberately **not** blue and **not** brass: blue is focus and brass is selection (N2 **W6**), and a drag verdict is a third thing. **No new SVG is authored** — `confirmed.svg` and
`close.svg` already exist under `assets/icons/` (N3 §2.3) and no existing SVG must change.

### 3.4 Scroll while dragging
Within a UI Toolkit scrolling body: an edge band of `24·s` px at top and bottom; rate ramps linearly 0 → `8·s` px per frame across the band; wheel and two-finger scroll keep working
during a drag. The body that scrolls is the **one** body the surface already owns (**W4**) — no new scroller is created, and `horizontalScrollerVisibility` stays `Hidden`.
**No IMGUI autoscroll is specified, because no selected route sources from an IMGUI surface** — the two rails and the development card are untouched in this window. Employees stay left,
hybrid picture cards stay right, the lot stays operable: **no rail becomes a drag source or a drop target.**

### 3.5 Input-focus gate and Escape
**Camera.** While a drag is live, every keyboard camera movement is withheld — W/A/S/D **and** the arrows. The mechanism already exists and is reused verbatim:
`StudioInputFocusGate.CameraMovementAllowed(suppressKeyboardMovement, modalOwnsInput, textEntryOwnsKeyboard)` (`StudioInputFocusGate.cs:161-163`) gates the whole movement vector
(`StudioCameraInput.cs:295`), and `StudioBuildPlacementDriver.cs:55` is the shipped precedent that sets it during a preview. **Named hazard `[NAT]`:** that line assigns
`StudioCameraInput.SuppressKeyboardMovement = previewing` **unconditionally every Update**, so a second writer would be silently overwritten. `[REC]` follow the gate's own established
"one slot per owner" doctrine (`PublishRailArrowOwnership`, `:174-178`): add `PublishDragOwnership(bool)` + `DragInProgress`, and let the *camera* read the OR — never a second writer to
one bool.
**Escape cancels the drag BEFORE the ladder.** The N7 §1.4 ladder is unchanged and gains one rung above it: **(0) a live drag cancels** → (1) a rail text field clears its own focus →
(2a) an open More-actions list closes → (2b) an expanded group / open compare closes → (2c) the help block closes → (3) one overlay level pops → (4) rail focus releases to the lot →
(5) the Studio Menu opens. While a drag is live the drag controller publishes through the existing `GuiOwnsCancel` slot so polled consumers defer (`PolledCancelAllowed`, `:92/139/225`), and the
press is spent under the existing one-frame spend law (`CancelNeverSpent`, `:95`) — so one physical Escape cancels the drag and **does not** also pop an overlay or open the menu.

### 3.6 IMGUI vs UI Toolkit
UI Toolkit routes use `PointerDownEvent` → `PointerMoveEvent` → `PointerUpEvent` with `element.CapturePointer(evt.pointerId)` and `TrickleDown.TrickleDown` registration on the surface
`Root`, matching the shipped pattern (`StudioCastingWorkspace.cs:413`, `StudioBuildWorkspace.cs:149`, `StudioReleaseResultWorkspace.cs:59`). **`PointerMoveEvent` is registered nowhere in
the project today** — grep over `Assets/Studio` returns zero hits `[NAT]`; it is the one new event type this phase introduces. IMGUI surfaces (`StudioPeopleRailHud`,
`StudioProductionRailHud`, `StudioDevelopmentCardHud`) read `Event.current` and are **not** drag participants. The lot is neither pipeline: it is a world raycast through
`StudioBuildPlacementDriver`, entered only while `BuildPreviewCapturesPointer` is true.

### 3.7 The More-actions law
A dragged item **never** opens More-actions. Three rules: (1) the lift consumes the press, so no `<surface>-more-actions` / `casting-row-actions-{id}` control ever receives a click from
a lifted pointer; (2) a More-actions list that is open when a lift begins closes silently as part of the lift — it would otherwise occlude drop targets — and that close does **not**
consume the later Escape (rung 2a is left untouched for the ladder); (3) an entry inside a More-actions list is never a drag source and never a drop target, because the list is a
shedding overflow of the footer (N4 §4), not a second form of the record. The N7 focus line and its yield order are unaffected: a drag adds no term to any clamp.
## 4. Acceptance checks for the test owner (none run here)

**EditMode — legality, preview, stale-drop, per route.** Pure functions only; no snapshot invented.
* `Lifted(downPos, movePos, heldMs, s)` true at exactly `6·s` travel or `160 ms`, false below both; a right-button press never lifts.
* **Verdict parity, the core check:** for every (candidate, role) pair in a fixture, the drop verdict for `casting-candidate-{id}` → `casting-role-{roleKey}` equals
  `casting-row-choose-{id}`'s enabled state, and the refusal string is **byte-identical** to the ordinary control's. Same for slate (`casting-slate-role-*` vs `casting-slate-add-{id}`,
  cap 2/role) and compare (`casting-compare-bar` vs `casting-pin-compare`, cap 4).
* **Build:** the verdict for a dropped origin equals the `cellLegality[]` verdict for those cells and `CommitLabel(quote)` reads "NOT A VALID SITE" on any illegal cell; `occupied` and
  `clearanceRing` render as their own distinct sentences; every `unmetRequirements[].reason` appears.
* **Stale drop:** a drop whose `liveRevision` moved fails `QuoteFresh(quote, liveRevision)` and re-asks — asserting that no commit is submitted; a greenlight/screen-test review reached
  by a drop refuses under `StillDisplayed()` when the surface changed; a compare drop refuses on pool membership + cap **only** (no `StillDisplayed`, no `QuoteFresh`).
* **Nothing commits on drop:** for each of the four routes, a completed drop submits **zero** intents.

**Rendered synthetic drag (PlayMode, pointer-only).** The harness path already exists and is extended by one event type. Name the events:
`PointerDownEvent.GetPooled(new Event { type = EventType.MouseDown, button = 0, mousePosition = source.worldBound.center })` →
**`PointerMoveEvent.GetPooled(...)`** × N along a path that crosses `6·s` → `PointerUpEvent.GetPooled(new Event { … mousePosition = target.worldBound.center })`, each with
`evt.target = root` and `root.SendEvent(evt)` — the exact shape already used at `Assets/Studio/Tests/PlayMode/StudioDisplayedProductionOperationTests.cs:194` and
`StudioProductionAndCampaignLayoutTests.cs:468` `[NAT]`. `[REC]` `StudioActionTrace.ObserveRoot` gains a `pointer-move` phase beside its shipped `pointer-down` / `pointer-up` /
`click-event` (`StudioActionTrace.cs:21-24`) so the whole gesture appears in the trace. Cells: 1280x720 and 1440x900 × 100 / 150 / 200 %, each with one valid and one invalid drop, the
refusal readable **with** its control in view (N2 §4(3)).

**TS refusal tests — only where an engine refusal exists.** `placeFacility`: an intent minted for an illegal preview is refused as not available, and the commit revalidation refuses a
site that became illegal (`bridge/session.ts:1572-1578`). `greenlightScriptProject`: `castingDraftToEngine` refuses a `talentId` not in the live role pool. `startCastingSession`: refuses
≠ 2 ids per role and an id outside the pool. **No TS test is owed for route (a)** — it has no engine command (inventory row (a), verbatim).

**Ordinary-route regressions.** Every control named in §2 present, enabled, in the same tab ring, at all six cells, with drag **enabled**; a press-without-lift on any drag source still
performs its shipped click; `build-card-{id}` keeps `focusable/tabIndex`; disabled controls keep their tab stops and read their refusals; the N7 Escape ladder's rungs 1–5 answer exactly
as before when no drag is live; `StudioInputFocusGate` arrow ownership unchanged when no drag is live.
## 5. Disposition

**Per route.** (c) catalogue → lot **SELECT / redesign the gesture, retain the whole ordinary route** — highest value, lowest true cost, best preview. (e1) candidate → role slot
**SELECT / redesign** — the one gesture that collapses three ordinary steps. (e2) candidate → slate **SELECT / refine** — near-zero marginal cost on the same controller. (a) candidate →
compare **SELECT / refine** — commits nothing; the safe place to learn the gesture. (b3) set → stage **DEFER with reason** — lawful, but it needs its own quote/displayed-authority path.
(d) scientist → lab **DEFER with reason** — the ordinary route is already one button and the drag would cross IMGUI→Toolkit. (e3) writer → commission **DEFER with reason** — an IMGUI
drag is a second implementation of everything in §3. (b1)(b2)(c′)(d′)(e4)(e5) **NOT AVAILABLE** — named dependencies, quoted verbatim in §1.

**Per surface.** `StudioBuildWorkspace` (facility mode) **refine** — one new source behaviour on an existing card; the N5 §5 pinned-quote redesign is the prerequisite, not this sheet's
work. `StudioBuildPlacementDriver` **retain with evidence** — its raycast/origin path is reused unchanged; only the over-UI early-return needs the §2.1 hazard handled.
`StudioCastingWorkspace` **refine** — one controller, three targets, no layout change. `StudioBuildWorkspace` (Sets mode), `StudioLaboratoryWorkspace`, `StudioDevelopmentCardHud`
**retain with evidence** — deferred routes; every ordinary control stays exactly as shipped. Both rails and the compact inspector **retain with evidence** — not drag participants;
employees left, hybrid picture cards right, operable lot, all untouched. `StudioInputFocusGate` **refine** — one new published slot, no changed law. `StudioActionTrace` **refine** —
one observation phase. **Art: no new SVG** — `confirmed.svg` and `close.svg` already carry the two verdicts, and no existing SVG must change.
## 6. Tradeoffs recorded, and what this sheet cannot claim

* **Four routes, not seven.** Chosen so two controllers cover them. The cost is that the two most-requested *deferred* gestures (set → stage, scientist → lab) wait; the defence is that
  both are complete today by click and by keyboard, so nothing is unreachable — only slower by one or two clicks. Review parity is the same consequential safeguards, not the same click count.
* **Drop never commits.** The cost is that a drag saves fewer clicks than a drag in a game that commits on drop. That is the whole point of §8 2B: same identities, same legality, same
  commitment review, no surprise spending. Accepted deliberately.
* **The catalogue card now does two things on press.** Mitigated by the lift threshold and by keeping `build-card-{id}-preview` as a separate, unchanged control.
* **`PointerMoveEvent` is new to this codebase.** It is the single named new dependency in the client, and it is a stock UI Toolkit event, not a package.
* **No auto-pause, no universal undo, no new verb.** Cancel is Escape / drop-outside / right-click, and it restores the pre-drag draft exactly — that is cancel, not undo.
* **This sheet cannot claim any of it renders.** No build, no PlayMode, no capture, no native input; the Editor was never launched. Every `[NAT]` finding is a static read of committed
  source, and the C# reads are element names and guards, not observed behaviour. The threshold numbers in §3 are design choices measured against published geometry, **not** measured
  against a human hand on this hardware — a native pointer pass is owed (`R3-OVERHAUL-PLAN.md:28`, "native pointer pass owed") and is the only thing that can confirm 6 px / 160 ms are
  right. Until that pass, treat §3.1 as the first candidate value, not a verified one.
