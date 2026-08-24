# CODEX World Interaction Package 02

## World Selection, Navigation, and Context Interaction

**Status:** decision-ready comparative design study; no implementation authority

**Date:** 2026-08-24

**Branch:** codex/world-interaction-research-02

**Research baseline:** 82c9486a6ce3a849d72c7f7f5258d6392cc3483a

**Forward implementation owner:** Fable, only after Owner review

**Recommended next checkpoint:** **P02A — Gate and Administration Interaction Spine**

This package is the interaction-language sequel to Package 01 on
codex/world-first-interaction-research-01. Package 01 ruled that the lot is home and that
management UI supports the world. Package 02 specifies how the world behaves under the pointer,
camera, keyboard, controller focus, alerts, and deep-management round trips.

It does not authorize production code, simulation changes, a SaveFile change, a new gameplay
action, or a wholesale lot rewrite. Existing closed world-first V1 contracts remain historically
accurate. This is the forward grammar every later entity should converge on after approval.

---

## Decision headline

An elite Project: Studio lot should feel like a **readable, inhabitable operating studio**, not a
3D menu background and not a toy box in which every click grabs something.

The universal loop should be:

> **Notice in the world → preview on hover → select without consequence → understand locally →**
> **explicitly Focus, Follow, act, or open deeper management → return to the exact context.**

The foundational separation is:

| Concern | One job |
| --- | --- |
| Hover | Answer “can I inspect this, and what is its one most useful current fact?” |
| Select | Establish identity and open compact context; never perform a material action |
| Focus | Move the camera to frame a target only after an explicit request |
| Follow | Voluntarily track a moving target; never arise from ordinary selection |
| Local action | Offer the smallest useful world-native remedy or next step |
| Deep management | Earn more screen space for comparison, history, planning, or multi-entity work |
| Back | Reverse the last context transition, not teleport Home |
| Home | Explicitly recover the Gate/Administration orientation |

This package therefore rules:

1. **Single click selects and inspects. It never hires, assigns, moves, builds, spends, advances
   time, opens a deep workspace, or moves the camera.**
2. **Double-click has one universal meaning: Focus.** It selects if necessary, then frames the
   entity at the appropriate gameplay scale. It does not open detail or begin Follow.
3. **The selected entity owns a fixed contextual inspector.** A small world label identifies; a
   stable edge card explains. The card does not chase the entity across the screen.
4. **The camera moves only because the player requested Focus, Locate, Follow, Home, Alert Locate,
   or a named inspection/cinematic mode.**
5. **World and management are reversible views of the same stable entity ID.** Lists offer
   **Locate in World**; world entities offer **Open Profile/Management**.
6. **Three semantic zoom bands govern information, not three disconnected cameras.** Camera
   movement remains continuous while labels, hit targets, and diagnostic detail change with
   hysteresis.
7. **Selection, keyboard/controller focus, and alert severity are different states.** They may
   coincide, but never share one color-only glow.
8. **No pixel hunt.** Small people use screen-space hit proxies at readable zooms and semantic
   target cycling; at management scale, lists and aggregates replace tiny individual picking.
9. **Alerts explain before they transport.** Opening an alert does not hijack the camera. An
   explicit **Locate Stage 7** performs selection, focus, blocker emphasis, and smallest-remedy
   presentation.
10. **Unity presents; TypeScript remains authority.** Selection and camera state are transient
    client state. Facts, stable identities, legality, costs, outcomes, time, RNG, and SaveFiles
    remain TypeScript-owned under the approved client architecture [LOCAL-CLIENT].

---

# 1. The Movies reconstruction

## 1.1 Evidence discipline

The reconstruction uses these labels:

- **Historical fact** — directly supported by the original manual.
- **Corroborated observation** — primary evidence plus a contemporaneous guide/report.
- **Secondary observation** — detailed shipped-game reporting without equivalent primary text.
- **Inference** — a design-purpose interpretation, not a historical claim.
- **Recommendation** — Project: Studio's forward ruling.

Confidence is about the historical behavior only. It does not convert a recommendation into fact.
The principal source is Lionhead/Activision's original manual, especially printed pp. 4–12, 18–20,
and 38 [TM-MAN]. The manual pages themselves contain useful HUD, bubble, floorplan, and control
illustrations; they are stronger evidence than retrospective memory.

## 1.2 Focused historical reconstruction

| Area | What the player physically did and saw | Evidence and confidence | Underlying purpose | Project: Studio ruling |
| --- | --- | --- | --- | --- |
| Hover / information bubbles | Hovering a Star, movie, staff member, building, facility, set, or its HUD card waited briefly, then produced entity-anchored “information bubbles.” The system prioritized the most important fact first; attached bubbles and bars exposed more. Red **!** indicated serious trouble and blue **i** information. Moving away closed them. | **Historical fact, high.** [TM-MAN], printed p. 8. | Let the world disclose its own operating condition without opening a dashboard. | **ADAPT.** Keep priority-first, spatially anchored status. Replace slow bubble stacks with one compact hover label and a selected inspector. |
| Expanded inspection | Right-click displayed all information bubbles immediately. Clicking a bubble burst it; clicking the central bubble closed the group. | **Historical fact, high.** [TM-MAN], printed p. 8. | Separate “show me more” from the ambient hover preview. | **ADAPT.** Preserve progressive disclosure, but put essential inspection on safe primary selection. Right-click should be bounded pointer Cancel in the modern grammar, not the only route to useful facts. |
| Person interaction | Pointer-over plus left-click-hold picked a person up. Releasing over a building room or local target assigned/hired/moved them. Queue applicants were dragged into role rooms. | **Historical fact, high.** [TM-MAN], printed pp. 10–12; independently described in [TM-GUARDIAN]. | Make staffing and workflow tactile, visibly spatial, and easy to teach once. | **REJECT as normal selection.** Direct manipulation may return inside an explicit future Assign/Move mode, with a non-drag alternative. It must never be ordinary click behavior. |
| Building selection | Left-clicking a facility lowered walls/showed a blue functional floorplan. The player then dropped people, scripts, or movie objects into named operational rooms. | **Historical fact, high.** [TM-MAN], printed pp. 10 and 12; [TM-GS] corroborates the Script and Casting offices. | Turn buildings into production controls rather than scenery. | **ADAPT.** A selected building must answer what is happening and what can be done there. A universal cutaway is unnecessary; reserve authored interiors for stages or exceptional close inspection. |
| “Interior” versus radial | The verified interaction is a lowered-wall functional floorplan with target rooms. Primary evidence does **not** establish a universal radial menu. Prior owner captures may look wedge-like over footprints, but equivalence is unresolved. | **Historical fact for floorplan; unresolved for radial. Medium on equivalence.** [TM-MAN]. | Compress a complex workflow into spatial destinations inside a familiar building. | **REJECT the unverified generalization.** Do not cite The Movies as authority for a universal radial. Use a fixed inspector; a future radial is an optional controller quick-command surface only. |
| Object dragging | Ornaments, flora, and furniture highlighted on hover and could be grabbed; the interaction table says ornaments could be duplicated “into hand.” Pavement highlighted before left-drag extension or right-drag deletion. | **Historical fact, high.** [TM-MAN], printed pp. 10 and 38. | Make lot authorship direct and tactile. | **ADAPT inside an explicit edit/build mode.** Retain preview and highlight-before-grab. Default inspect mode must not move or duplicate assets. |
| Construction preview | Selecting a build item put a flat building preview under the pointer. Yellow meant legal; red meant obstructed. The menu showed cost and owned count, and builders visibly constructed the placed facility. | **Historical fact, high.** [TM-MAN], printed pp. 10–11. | Connect capital choice, physical placement, obstruction, and visible construction. | **ADOPT the preview principle.** Add reason text, pattern/shape, and non-color legality. Selection of a vacant parcel still commits nothing. |
| Contextual building controls | Staff Office role rooms, Script Office genre rooms, Casting Office Begin Casting/roles/Shoot It, Production Office Release/Reviews/Finance/Archive/Movie Player, and set Rehearse targets were physically local. | **Historical fact, high.** [TM-MAN], printed pp. 10–12 and 18; [TM-GS]. | Choreograph the filmmaking pipeline through memorable places. | **ADAPT.** Put current work, blocker, and small local remedy on the selected place. Let comparison, scheduling, finance, and history open deeper space. |
| Star cards | Persistent portraits on the left showed actor/director appearance, chart position, mood, and current activity. Hover exposed detail; left-click jumped to that person; click-hold could pick them up from the card. Controls cycled staff categories. | **Historical fact, high.** [TM-MAN], printed p. 6. | Keep important people available even when the lot is crowded; bridge roster and world. | **ADAPT.** Preserve card/list-to-world Locate and concise status. Reject one permanent HUD card per employee and reject card dragging as ordinary assignment. |
| Star-card follow/zoom nuance | A later expansion guide reports single-click following/showing position, double-click zooming to a Star, right-click full stats, and activity icons for filming, assigned activity, or autonomous leisure. The base manual promises a jump but not a universal persistent Follow. | **Secondary observation, medium.** [TM-SE-GUIDE]. | Reduce search cost and communicate interruptibility. | **ADAPT.** Follow must be an explicit toggle. Activity/status iconography survives, with readable text parity. Do not claim the expansion convention was a base-game universal. |
| Movie cards | Persistent cards on the right showed production phase, blocker, Star rating, and released chart position. The card icon progressed script → camera → film can; a pulsing dollar symbol signaled current earnings. Cards could be hovered, inspected, and dragged into facility rooms. | **Historical fact, high.** [TM-MAN], printed pp. 6 and 10–12. | Make an otherwise invisible workflow continuously visible and physically routable. | **ADAPT.** Keep compact project status and Locate. Stop treating a movie card as a mandatory draggable game object. |
| Camera | WASD/arrows and screen-edge movement panned; middle-mouse horizontal motion rotated; wheel zoomed; Ctrl+arrows provided alternatives; Shift accelerated movement. Space centered the Studio Gates. | **Historical fact, high.** [TM-MAN], printed p. 8. | Maintain a continuously explorable lot with a known recovery landmark. | **ADAPT.** This is still a sound tycoon base. Add drag-pan, cursor-directed zoom, rebindability, safe framing, reduced motion, and explicit Focus/Follow. |
| Map and zoom-scale travel | **M** opened bird's-eye Map mode; double-clicking the lot traveled directly there. The manual does not describe a modern semantic label/LOD hierarchy between ordinary zoom positions. | **Historical fact, high for Map; no evidence for modern zoom hierarchy.** [TM-MAN], printed p. 10. | Recover orientation and cross the lot quickly. | **ADAPT.** Preserve rapid spatial travel. Use continuous camera zoom with three semantic information bands; a minimap is later, not required next. |
| Set double-click | Double-left-clicking an idle set launched a dramatic fly-by. During filming, the same gesture entered a special director's view with scene controls. | **Historical fact, high.** [TM-MAN], printed p. 38. | Give sets privileged cinematic and creative meaning. | **REJECT as the universal rule.** In Project: Studio, double-click always Focus. A stage-only director/cinematic view must be a named button and reversible mode. |
| Labels, pips, and alerts | The world used information bubbles, task symbols, PA announcements, green/red pips, red **!**, blue **i**, and HUD cards more than permanent nameplates. | **Historical fact, high.** [TM-MAN], printed pp. 6–8. | Surface attention while retaining the spectacle of a living lot. | **ADAPT.** Use text+icon severity, new-alert pulses that settle, and zoom-aware labels. Reject color-only and permanent label saturation. |
| Guidance | Picking up a Star, movie, script, or queue applicant created a trail of stars toward a sensible destination. Build menus could also show guidance. Tab jumped to the end of the highest-priority sparkling stream. Guidance was explicitly optional. | **Historical fact, high.** [TM-MAN], printed p. 8. | Teach one spatial workflow and recover when the player is unsure. | **ADAPT.** Alerts and onboarding may reveal a target/cause connector or optional path. Never force camera travel or turn guidance into hidden legality. |
| Deep screens | Finance, charts, reviews, movie playback, advanced movie making, and post-production earned dedicated screens even in this world-led game. | **Historical fact, high.** [TM-MAN], printed pp. 6, 10–12, and later tool sections. | Give high-dimensional work enough space. | **ADOPT the principle.** The target is world-first, not world-only; deep work must preserve its world origin and exact return. |

**Camera-response evidence boundary:** the manual explicitly documents the Star-card jump, Map
travel, Gate centering, idle-set fly-by, and filming director view. It does not document an
automatic camera transition for ordinary person pickup or facility-floorplan opening. This report
does not infer one. Likewise, it verifies wheel zoom and the bird's-eye Map, but finds no primary
description of systematic label, card, or hit-target changes at intermediate zoom levels [TM-MAN].

## 1.3 What The Movies got right

**Inference from the verified behavior:** its strongest invention was not drag-and-drop by itself.
It was **workflow as visible choreography**:

> take an entity into hand → see a suggested destination → reveal the building's functional
> surface → place the entity into its next stage → watch people and production move

That did four things modern menu-heavy tycoons often lose:

- the studio layout explained the production system;
- the player saw who and what was causing a delay;
- construction and travel made the lot mechanically meaningful; and
- routine operations became small Hollywood stories rather than rows changing state.

Project: Studio should preserve those purposes through safer modern input: direct selection,
visible travel/status, local blockers, and explicit local actions.

## 1.4 What aged poorly

- Left-click meant pick up, drop, duplicate, open a facility, or operate a HUD object depending on
  target and hold duration.
- Inspection was pushed to hover delay or right-click, while the primary button was material.
- Dense bubble clusters fought the world for space and relied heavily on colored bars.
- Double-click meant Map travel, idle-set fly-by, director mode, and—according to secondary
  expansion evidence—Star zoom.
- Dragging was required for many operations, increasing motor burden and accidental-action risk.
- World UI could tell a lot, but did not offer the stable selected inspector, reversible
  navigation history, semantic target cycling, or text-scaling expectations of a modern game.

## 1.5 The historical ruling

**Keep the choreography; replace the ambiguity.** Buildings remain controls, people remain visible
actors, projects remain spatially grounded, and alerts still resolve to places. Ordinary pointer
input becomes safe, identity-first, and reversible.

---

# 2. Comparator findings

## 2.1 Why these comparators

Each comparator below is used only where it solves a specific subproblem better:

- **Planet Zoo** — individual world/list bridge, explicit camera modes, and separate individual
  versus overview management.
- **Two Point Hospital/Campus** — world-clicked rooms and people opening a stable right-side
  inspector; accessibility architecture.
- **Football Manager** — compact person popover → actions → full profile information hierarchy.
- **The Sims 4** — explicit separation of select/switch, center/snap, and Follow for people.
- **Cities: Skylines / Cities: Skylines II** — familiar PC tycoon camera and selected-only spatial
  diagnostic layers.
- **Planet Coaster / Planet Coaster 2** — notification severity, alert-to-world focus, unified
  management categories, and PC/controller parity.
- **OpenRCT2** — zoom-specific visual simplification and target removal instead of unreadable
  shrinking, as already examined in the repository's clean-room code-mining ledger.

Madden's card-first OVR/archetype hierarchy remains useful to applicant presentation already
covered by Package 01, but it does not solve spatial selection, camera, world labels, or reversible
lot navigation better than Football Manager, The Sims, Planet Zoo, and Two Point. It is therefore
not padded into this matrix.

## 2.2 Exact comparator observations

### Planet Zoo — one entity, two scales

**Comparator observation, high where official; moderate where shipped-use observation:** the
official basics guide documents left-click selection, Escape/right-click cancellation, WASD,
management shortcuts, Standard/Free Look/Explore/Scenic/Cinematic cameras, and specialist cameras
that snap to animals or enter guest/security views [PZ-BASICS]. Frontier separately distinguishes
an individual staff info panel from the Staff Overview screen [PZ-114]. The shipped Animal
Management Locate control was amended so locating an animal also opened that animal's information
panel, not merely the camera [PZ-102]. An animal's info panel exposes a deliberate camera button
rather than making world selection itself enter animal camera [PZ-ANIMAL-CAM].

**Lesson:** Locate should retain identity and context; specialist inspection should be explicit.

### Two Point — stable contextual inspector

**Comparator observation, high for room panel; moderate for full staff parity:** Two Point's own
UI/UX feature explanation says clicking a room opens its info panel on the right, where tabs expose
room-specific controls [TPH-ROOM]. Detailed interface observation shows world-clicked staff and
staff-list portraits using the same individual panel, while rooms expose their status and needs
without immediately performing an action [TPC-UI].

**Lesson:** the same entity should not acquire a different information architecture merely because
the player reached it from a list.

### Football Manager — person information in layers

**Comparator observation, high:** the official FM24 manual says a person shown in a list carries a
small portrait/silhouette information control. Click—or hover if configured—opens a compact
biography/attributes popup; right-click opens Actions without requiring the full profile; the
profile remains the deep destination [FM24].

**Lesson:** identity and today's relevant status belong before a complete career dossier.

### The Sims 4 — Focus and Follow are not Select

**Comparator observation, high:** EA's PC controls separate switching to a Sim, locking the camera
to that Sim, and centering the active Sim [SIMS-PC]. The official console manual separately exposes
Snap to Sim left/right, Toggle Follow Camera, Select Next Sim, and Center on Lot [SIMS-PS4].

**Lesson:** a person-centric camera feels controllable when selection, focus, cycling, and follow
are different commands.

### Cities: Skylines — familiar camera, selected-only explanation

**Comparator observation, high:** the official manual documents edge scroll, middle-drag
rotate/tilt, wheel zoom, WASD, keyboard camera alternatives, right-click cancel, and rebindable
inputs [CS-MAN]. Cities: Skylines II's selected-info-panel route tools keep the relevant route
overlay for the one selected road, vehicle, pedestrian, or building rather than illuminating every
route at once [CS2-DETAILERS].

**Lesson:** use a conventional base camera and attach diagnostic overlays to a deliberate
selection.

### Planet Coaster — spatial alert resolution, with a cost

**Comparator observation, moderate-high:** Planet Coaster 1's 1.0.1 notes report that clicking a
notification rotated the camera to the affected facility, exit, or entrance [PC1-101]. Planet
Coaster 2 separates top-level management, objectives, notifications, and category lists; its
notification button changes to reflect more critical issues [PC2-MGMT].

**Project inference:** repeatedly coupling message opening to camera transport would disrupt spatial
orientation. Retain spatial resolution, but split **Open alert** from **Locate target**.

### Planet Zoo cinematic modes — inspection is a named mode

**Comparator observation, high:** Scenic Camera has predefined movements with adjustable zoom and
speed; Cinematic Route Editor adds keyframes, focus, cuts, and UI hiding [PZ-114]. These are explicit
camera tools, not side effects of selecting a facility.

**Lesson:** management navigation and authored inspection/cinematic work should not share one
implicit mode.

### OpenRCT2 — remove unreadable detail

**Comparator observation from repository donor study:** OpenRCT2 uses discrete visual zoom levels,
authored simplified sprites, hard feature cutoffs, text disappearance rather than tiny scaled text,
and non-clickable/removed entities at deep zoom. Project analysis and clean-room boundaries are
recorded in [LOCAL-CAMERA].

**Lesson:** far-scale readability comes from substitution, aggregation, and removal—not from
shrinking every label and target.

### Two Point Campus and accessibility guidance

**Comparator observation, high:** PlayStation's feature disclosure lists clear/large text, a Visual
Comfort mode that removes camera movements/effects, adjustable stick sensitivity/inversion, and
play without required holds, rapid presses, simultaneous presses, motion, touch, or vibration
[TPC-ACCESS]. Microsoft recommends multi-input/digital UI navigation, visible focus, remapping,
camera sensitivity and auto-movement controls [XAG-107] [XAG-112] [XAG-113] [XAG-117]. WCAG 2.2
provides a useful architecture floor: drag alternatives, 24×24 minimum targets, and 44×44 enhanced
targets [WCAG22].

**Lesson:** target registries, semantic commands, visible focus, text reflow, and reduced-motion
camera paths have to exist in the architecture before a final controller skin.

## 2.3 Best-comparator matrix

| Problem | The Movies | Best modern comparator and exact winning behavior | Project: Studio ruling |
| --- | --- | --- | --- |
| Hover identity/status | Priority-ranked bubble groups after pointer dwell | **Football Manager** uses a compact person popup before profile; **Two Point** reserves the stable panel for selection | **ADAPT** to immediate local affordance + delayed two-line label; no hover actions |
| Selecting a person | Left-hold picked the person up | **Planet Zoo/Two Point** world click opens the individual's information context without a material command | **ADOPT safe select; REJECT pick-up default** |
| Selecting a building | Click lowered walls and exposed operational rooms | **Two Point** room click opens a fixed right info panel with entity-specific tabs | **ADAPT** building-as-control into a fixed inspector; cutaway only when explicitly useful |
| Compact person hierarchy | Star card + expanding bubbles | **Football Manager** compact popup → actions → full profile | **ADAPT** identity/current work/availability first, profile second |
| World/list person parity | Star card jumped to the world person | **Planet Zoo** Locate focuses the animal and opens its info panel | **ADOPT** exact ID + same inspector |
| Person Follow | Card behavior is partly secondary/ambiguous | **The Sims 4** separately exposes select/switch, snap/center, and Follow | **ADOPT** explicit Follow command |
| Generic double-click | Contextual: Map travel, fly-by, director view | Modern spatial convention plus Sims/Planet camera controls support explicit centering | **ADAPT to one rule: Focus** |
| Alert → world | Tab jumped to highest-priority guidance trail | **Planet Coaster** focuses affected facility; useful but disruptive when coupled to alert opening | **ADAPT** explicit Locate after alert explanation |
| Building context placement | World floorplan and bubble groups | **Two Point** stable right-side inspector | **ADOPT fixed inspector + small anchored label** |
| Deep person detail | Full bubble tree/right-click | **Football Manager** full profile only after compact identity/action layer | **ADOPT layered depth** |
| Base PC camera | WASD, edge pan, middle rotate, wheel, Gate Home | **Cities: Skylines** retains this familiar complete baseline | **ADOPT/modernize** |
| Management versus inspection camera | Set-specific fly-by/director view | **Planet Zoo** names Standard, Explore, Scenic, Cinematic, and entity camera modes | **ADAPT** one management camera plus explicit close/cinematic modes |
| Zoom readability | Map mode plus ordinary zoom; no documented semantic LOD policy | **OpenRCT2** substitutes/removes detail at far scales | **ADAPT** three semantic information bands over continuous camera zoom |
| Selected diagnostic | Bubble stacks and red set list entries | **Cities: Skylines II** shows the selected entity's route layer only | **ADAPT** one selected/alert-related overlay, never world-wide glowing |
| World ↔ management return | Cards jumped worldward; some facilities launched full screens | **Planet Zoo + Two Point** use the same entity context across list/world; modern expectation adds retained origin state | **ADOPT** bidirectional exact-ID navigation with a context stack |
| Controller target acquisition | No architectural evidence in the PC manual | **The Sims 4 console** provides next-person/snap/follow commands | **ADOPT** semantic target registry and cycling |
| Text/motion/input accessibility | Color bars, dragging, hover, and camera motion were central | **Two Point Campus + Xbox guidelines** expose text, motion, sensitivity, and non-hold alternatives | **ADOPT architecture now** |
| Radial menu | Not verified as a universal original behavior | The Sims' pie menu is excellent for character verbs but would make Studio selection action-first | **REJECT as default; LATER optional quick-command layer** |
| Persistent card for every person | Staff categories cycled persistent cards | Large modern rosters use searchable/bulk lists plus local inspectors | **REJECT**; reserve HUD cards for active pictures, pinned Stars, or decisions |
| Overlapping world targets | No verified click-through rule | No comparator studied provides a complete transferable answer; current Project evidence already favors visible people over invisible place zones | **PROJECT-OWNED ADAPTATION:** depth + semantic eligibility + cycle candidates |

---

# 3. Adopt / Adapt / Reject rulings

| Pattern | Ruling | Binding interpretation |
| --- | --- | --- |
| Buildings are gameplay controls | **ADOPT** | Selecting a building explains its current work, people, blockers, and route to actions |
| Entity-anchored priority status | **ADAPT** | One small hover label; detail moves to the inspector |
| Left-click direct manipulation | **REJECT** | Ordinary click never picks up, hires, assigns, spends, builds, moves, or interrupts |
| Safe primary selection | **ADOPT** | One exact entity becomes persistent selection; no camera move |
| Selection outline | **ADAPT** | Dual-contrast contour/ground brackets, not emissive full-body glow |
| Color-only status | **REJECT** | Every status has text/icon/shape parity |
| Universal double-click Focus | **ADOPT** | Same rule for people, buildings, stages, vehicles, sites, parcels, and stateful props |
| Double-click open detail/follow/action | **REJECT** | Detail and Follow remain named commands |
| Explicit Follow | **ADOPT** | Voluntary, cancellable, and separate from gameplay assignment |
| Fixed contextual inspector | **ADOPT** | Stable right edge on desktop; responsive bottom/full sheet |
| Anchored full action card | **REJECT** | Moving targets must not drag a large UI card around the world |
| Small anchored identifier | **ADOPT** | Name/type plus one state, maximum two lines |
| Radial as primary context | **REJECT** | Poor for dense facts, accessibility, and consistent mouse/controller parity |
| World ↔ management exact-ID links | **ADOPT** | Locate and Open Profile/Management are universal capabilities where meaningful |
| Retained world behind deep work | **ADAPT** | Preferred default; if a route must unmount, exact camera/selection restoration remains required |
| Alert click forces camera travel | **REJECT** | Alert opens explanation; Locate performs travel |
| Alert Locate selects/focuses/explains | **ADOPT** | Focus subject, emphasize cause, show smallest legal remedy; no auto-commit |
| Three semantic zoom bands | **ADOPT** | Management, Medium, Close; continuous camera and hysteretic information transitions |
| Tiny clickable people at far zoom | **REJECT** | Aggregate or use list/target cycling |
| Label every entity | **REJECT** | Priority and collision budget; selected/hovered/alerted entities win |
| Screen-space hit proxies | **ADOPT** | Managed people remain comfortably selectable at Medium/Close |
| Semantic target cycling | **ADOPT** | Required for controller, keyboard, and overlap resolution |
| Camera inertia and overshoot | **REJECT** | Tycoon navigation stops when input stops; focus transitions are bounded and cancellable |
| Automatic camera on state change | **REJECT** | Completion, arrival, blocker, receipt, and panel opening never move the camera |
| Named inspection/cinematic mode | **ADAPT** | Explicit stage/person action with a stored return pose; not ordinary management |
| Drag-only future actions | **REJECT** | Any drag operation requires an equivalent click/confirm path |

---

# 4. Project: Studio interaction grammar

## 4.1 Shared conceptual state

This is an implementation contract, not production code. The production client needs equivalent
state boundaries:

| State | Meaning | Persistence |
| --- | --- | --- |
| Hover target | The one eligible entity under pointer/controller pre-focus | Transient; clears on exit, modal/tool capture, or loss |
| Selected target | Exact stable entity identity owning the inspector | Persists across camera/zoom and fresh projections while identity remains valid |
| Camera focus target | Explicit destination of a current Focus/Locate/Home transition | Ends when framing completes or manual input cancels |
| Follow target | Exact moving entity whose anchor the camera tracks | Persists until explicit exit, disqualifying selection, loss, or canceling input |
| Context surface | World, compact inspector, deep workspace, alert sheet, or explicit tool | Transient UI state |
| Navigation origin | Camera pose, selection, inspector, route/tab/filter/scroll, and UI focus return point | Shallow session stack; never saved as gameplay |
| Zoom band | Management, Medium, or Close semantic information band | Derived by the camera service with hysteresis |
| Interaction mode | Inspect by default; later Build, Move, Assign, or Cinematic modes are explicit | Mode is always visible and cancellable |

Selection is identified by authoritative stable ID, never title, display name, current array
position, rendered object pointer, or screen coordinate. Unity may own presentation-only hover,
selection visuals, camera pose, and navigation history. It may not invent entity facts or action
legality.

## 4.2 Exact universal command table

| Player command | Exact result | Explicit non-result |
| --- | --- | --- |
| **Hover** | Within one rendered frame, cursor/focus affordance and restrained local accent appear. After **300 ms** stable dwell, show a maximum two-line anchored label: identity/type + one current state/severity. | No selection, action, tooltip stack, audio bark, camera move, or simulation query that mutates state |
| **Single select** | Select exact eligible entity, replace prior world selection, paint selected treatment, and open/update the fixed compact inspector. If already selected, retain it and restore inspector focus/visibility. | No material action, camera move, Follow, deep route, pause, tick, RNG, save, or intent |
| **Pointer double-select** | First click selects immediately; a second click within the platform double-click interval invokes **Focus** only if it resolves to that same stable ID. If it resolves to a different target, it is only Switch selection. This is a pointer convenience; keyboard/controller users invoke the named Focus command. | Never open profile/management, Follow, director view, pick up, or act; never require rapid double-confirm on controller |
| **Deselect** | Click empty eligible ground while in Inspect mode, use Clear Selection, or reach the selection step of Escape/Back. Remove selection visual and inspector. | Do not reset camera or clear unrelated pinned alerts |
| **Pointer cancel** | A stationary secondary click below the 4 logical-pixel pan threshold cancels the active pointer tool/drag first; otherwise exits Follow/close inspection; otherwise clears ordinary selection. | Never opens a context menu, pops a deep management origin, moves Home, or opens Pause; completing a secondary-button pan never also cancels |
| **Switch selection** | One click selects the new exact target; previous selection treatment and context disappear atomically. | No intermediate empty camera reset |
| **Focus selected** | Explicit Focus button, rebindable **F**, or double-select frames the entity in the current safe viewport at its default gameplay scale. | Does not change material state or begin Follow |
| **Follow** | Explicit toggle on a trackable person/managed vehicle stores the prior pose, moves to a readable person framing, and tracks the current world anchor with a soft dead zone. | Not available for entities without a live world anchor; never means assign/control |
| **Open context** | Desktop selection already shows compact context. Keyboard/controller Open Context transfers UI focus into that inspector at its heading and first safe action. | Does not open the deep profile or fire the highlighted action |
| **Open Profile / Management** | Push exact world origin; open the entity's canonical deep owner over retained world when practical; focus its exact record. | Never create a second data owner or substitute same-name/first-match content |
| **Locate in World** | From a list/card/deep owner, push management origin; revalidate exact entity and anchor; close/minimize workspace, select entity, Focus current anchor, and open the same compact inspector. | If no current world anchor exists, remain in management and explain why; never jump to a substitute |
| **Open alert** | Show alert subject, impact, cause, and smallest available remedy in a compact attention sheet without camera movement. | Does not alter world selection or acknowledge by mutation |
| **Alert Locate** | Revalidate alert; select subject, Focus it, emphasize subject and cause/connector, and open inspector at blocker/remedy. | Does not automatically execute the remedy |
| **Home / Gate** | Explicit Home command exits Follow/focus tween and frames the one authored **Studio Home** pose, anchored to the Gate. Administration may be composed as a landmark when present but is never a second Home target. Selection remains valid and receives an offscreen locator if necessary. | Not Back; not automatic on deselection or workspace close |
| **Escape / Back** | Pop exactly one layer in the priority stack in section 4.6. Restore the invoking UI focus and stored origin when crossing world/deep boundaries. | Never both cancel a mode and open Pause; never teleport Home |

## 4.3 Hover contract by target class

Only one ordinary hover label may be visible. Selected and alert-linked labels may coexist under the
priority budget in section 8.

The default arrow remains over decorative/empty ground. An eligible inspect target uses one
consistent Inspect cursor in addition to its visual accent. Explicit Build/Move/Assign modes own
their visibly distinct tool cursor; a forbidden cursor appears only while such a tool is over an
illegal target. Cursor shape never carries the only indication of state.

| Target | Immediate visual/cursor | Label after 300 ms | Suppression rule |
| --- | --- | --- | --- |
| Managed person | Soft ground bracket plus thin silhouette edge; Inspect cursor | **Name · role/class** / current task or availability | Individual hover disabled at Management band except selected/alerted targets |
| Building | Thin roofline/footprint accent; Inspect cursor | **Proper name · type** / one state such as “Filming scene 3” | Decorative submeshes resolve to the owning building, not separate glows |
| Stage/set | Footprint accent plus current status fixture emphasis | **Stage 7** / film + phase, or one blocker | Stage props do not steal the hit unless independently stateful |
| Managed vehicle | Small chassis/bracket accent | **Vehicle/department** / task or destination | Decorative traffic is not interactive |
| Construction site | Dashed footprint/corner brackets | **Annex construction** / percentage + due state | Scaffolding pieces resolve to the site identity |
| Vacant parcel | Boundary corner brackets, no fill | **Vacant parcel** / buildability or locked reason | At Management band use parcel boundary; no tiny ground-point target |
| Interactive prop | Local rim plus explicit inspect glyph | Name / one available state or affordance | Pure decoration produces no cursor, outline, or tooltip |

**Noise law:** hover uses a neutral high-contrast accent, not severity red/amber and not an emissive
glow. A new alert may pulse its icon exactly **twice over 900 ms**, then becomes static. Working
buildings use authored activity/signage, not a looping selection halo.

## 4.4 Selection visual contract

- Hover: one thin dual-contrast rim or ground bracket, approximately **1–2 logical px** at the
  screen, plus cursor/focus change.
- Selected: a stable **2–3 logical px dual-contrast contour** and ground/footprint brackets. The
  outer light stroke and inner dark stroke remain legible against both bright and dark art.
- Alerted: a separate shaped severity badge with icon and text; it may coexist with selection.
- Controller/keyboard pre-focus: a distinct moving focus reticle and label. It is not selection
  until Confirm.
- Occluded/offscreen selected targets: a restrained edge locator with name/type; do not x-ray the
  full object through every wall.
- No state relies on hue alone. Selection, alert, hover, and input focus have different geometry.

## 4.5 Overlap and click-through

The renderer publishes eligible hit candidates with visible coverage and semantic class. Invisible
place polygons must not steal clicks from visible people—this preserves the lesson of the accepted
Role Atlas repair [LOCAL-ROLE-ATLAS].

Fixed screen UI captures every pointer button before world hit testing and never clicks through
into the lot; a secondary click on a dialog cannot cancel world state behind it. The ranking below
applies only after the pointer is inside the safe world viewport.

Default Inspect ranking is:

1. visible world UI token intentionally under the pointer, such as an alert/status/nameplate;
2. target required by the explicit active tool, if a tool is visibly active;
3. visible managed person at Medium/Close;
4. visible functional building or stage surface;
5. managed vehicle or construction site;
6. vacant parcel;
7. independently stateful interactive prop;
8. decoration, which is ineligible.

Within one class, nearest visible rendered surface wins. Large invisible hit zones can enlarge a
visible target but cannot rank ahead of an actually visible foreground candidate.

If two eligible candidates remain within the same **12 logical px** pointer neighborhood or the
controller ray cannot distinguish them:

- show **N targets · Cycle** beside the hover label;
- freeze the current candidate snapshot and its depth-then-stable-ID order until Confirm, Cancel,
  or pointer exit from the neighborhood;
- Tab/Shift+Tab or the bound controller shoulder inputs cycle that snapshot;
- the pre-focus reticle/name updates before Confirm; and
- pointer double-click remains Focus and is never overloaded as target cycling.

When world focus is active and no pointer ambiguity exists, the first Tab/bumper press snapshots
all eligible targets inside the safe viewport for the current zoom band and active category filter
(All by default; People, Places, and Alerts are supported registry filters). Order is semantic rank,
then screen-space distance from the current reticle/pointer, then depth and stable ID. The snapshot
stays frozen until Confirm, Cancel, camera movement, zoom-band/filter change, or world-focus exit.
Tab inside the inspector or any deep UI retains ordinary UI focus navigation instead of cycling
world entities.

At Management band, unselected individuals leave the hit registry, so tiny people cannot steal
building clicks. A person already selected or alert-linked retains a deliberate locator target.

## 4.6 Escape / Back priority stack

One press performs one step:

1. close the top confirmation/dialog/popover and restore focus to its invoking control;
2. cancel the explicit Build/Move/Assign/Cinematic tool or pending drag, byte-neutrally;
3. exit Follow/close-inspection mode and restore its stored pre-mode camera pose;
4. pop a deep workspace or Locate origin, revalidate, and restore its stored camera/selection/UI
   focus as specified in section 9;
5. clear ordinary world selection and close the compact inspector;
6. only from a neutral default lot, open Pause.

A hover label does not consume Escape. No press can both cancel a tool and open Pause. Home is a
separate command and never appears in this stack.

Right-click uses only the pointer-cancel subset in section 4.2. It never traverses a deep navigation
origin and never reaches Pause; those remain explicit Escape/Back behavior.

## 4.7 Target loss and stale context

- A moving target remains selected by stable ID and the inspector refreshes from current authority.
- If it is valid but temporarily has no world anchor, remove the outline, stop Follow, retain the
  inspector, and say **Inside Administration**, **Off lot**, or the exact available status. Offer
  **Reacquire** only when a current anchor exists.
- If identity is removed, released, or structurally invalid, clear selection without substituting
  another entity; show one concise non-blocking receipt and return focus to the neutral lot heading.
- A deep profile may preserve a canonical historical record if the simulation owns one. The world
  client must not mint a tombstone or last-known position.
- Every material action revalidates its current authoritative intent independently. Persistent
  selection is never proof that an old action remains legal.

# 5. Person interaction specification

The person grammar must work for a Gate applicant, a famous Star, a director crossing the lot, and a crew member who is only briefly relevant. The card structure stays constant; role-specific facts occupy named slots instead of causing a different UI to be invented for every profession.

## 5.1 State contract

| State | World treatment | Context surface | Camera | Available behavior |
| --- | --- | --- | --- | --- |
| Normal | Natural rendering. No permanent nameplate unless the person is selected, followed, or carries a major alert. | None. | None. | Eligible for pointer hit testing only at medium/close scale; always eligible through a management list. |
| Hover | Category cursor, restrained silhouette/ground-ring emphasis, one-line name plus role; a second line is reserved for a meaningful current state. | Anchored label after the hover delay. | None. | Select. If candidates overlap, cycle alternatives. |
| Selected | Persistent dual-coded selection mark, selected nameplate, and selected-only route/destination cue when useful. | Fixed inspector populated in the hierarchy below. | None. | Follow when the projection supplies a trackable anchor; Profile or role-specific deep route; explicit capability actions. |
| Deep detail | Selected mark remains in the retained world. | Retained-world profile/workspace overlay, or an equivalent route carrying a complete navigation origin. | None on open. | Review and perform authoritative management operations; Back restores the originating world state. |

Selection is not a promise that a person can be acted on. It is a promise that the game can identify the person, explain the current state, and expose only the capabilities currently authorized by the simulation.

## 5.2 Immediate selected-card hierarchy

The selected person inspector renders these slots in this order:

1. **Identity:** portrait or role icon, name, role/class, and compact status chip.
2. **Doing now:** a plain-language activity, such as Waiting at Gate, Rehearsing on Stage 7, Writing, Travelling, or Off duty.
3. **Work context:** current production, assignment, department, or application context. Omit the row rather than showing filler when none exists.
4. **Movement context:** destination and an optional estimated arrival only when the simulation knows both reliably.
5. **Availability and welfare:** the single state most likely to affect the player's next decision, with a route to the fuller profile rather than a dashboard of every meter.
6. **Exception:** at most one highest-priority blocker or alert, phrased as cause plus consequence.
7. **Actions:** common chrome contains Focus, Close, and the labeled Follow toggle when eligible; these do not consume the two business-action slots. The highest-priority authorized material action/remedy occupies business slot 1 and Profile/Review applicant occupies slot 2. Without a material action, the deep route moves to slot 1 and slot 2 is omitted. No disabled filler is added.

The collapsed inspector is a status answer, not a miniature personnel screen. It should normally show no more than six factual rows and two business actions without scrolling; Focus, Close, and eligible Follow live in common navigation chrome. Football Manager's compact player information and right-click action route demonstrate the value of separating rapid identity/action access from the complete profile [FM24]. Planet Zoo similarly separates an individual staff panel from its Staff Overview [PZ-114]. Project: Studio **ADAPTS** that hierarchy to a spatial, retained-world inspector.

## 5.3 Role variants

| Person class | Identity subtitle | Doing/work emphasis | First deep route | Special rule |
| --- | --- | --- | --- | --- |
| Applicant | Applicant for role or department | Queue position or arrival state; application readiness; Administration dependency | Review applicant | Never expose Hire as an accidental selection gesture. Hiring is an explicit, freshly validated intent. |
| Ordinary employee | Job and department | Current task, work site, destination, availability | Employee profile | Show a production only when assigned; do not imply that walking near a stage means membership. |
| Star | Star and principal profession | Current production, scene/task, immediate welfare risk | Star profile | May add one salient performance/welfare signal, but not the full historical Star-card meter bank. |
| Director | Director | Current production and present phase; next required decision | Director profile or production workspace | A blocked production outranks a generic mood or travel row. |
| Writer | Writer | Script/project, current writing phase, availability | Writer profile or script workspace | Script status is authoritative; proximity to the Writers' Building is not. |
| Craft or crew | Craft/crew specialty | Assigned production, task, destination, blocked dependency | Employee profile or production workspace | Prefer department/assignment information over celebrity-style metrics. |
| Authoritative extra | Extra or temporary performer | Current production/scene and task | Assignment detail, if one exists | Selectable only when it has a stable simulation identity and meaningful context. Otherwise it is decorative. |
| Decorative extra | None | None | None | Not selectable, target-cycleable, alertable, or addressable by management. It must never intercept a named person's hit target [LOCAL-ROLE-ATLAS]. |

The Sims is useful for quick switching, centering, and an explicit follow camera rather than for its action pie menu [SIMS-PC] [SIMS-PS4]. Project: Studio **ADOPTS** explicit person switching and follow, **ADAPTS** the compact identity hierarchy, and **REJECTS** a universal radial command menu: most Studio actions need status, blockers, and authoritative confirmation that a radial surface cannot explain well.

## 5.4 Motion, departure, and loss

- A selected person can continue moving without losing selection. The inspector updates from the same stable identity, not from whatever render actor happens to occupy the old point.
- An anchored hover label tracks the person only while hovered. It must not chase the pointer across the lot after hover ends.
- Follow uses the live trackable anchor but never changes the selected identity. Losing the anchor ends Follow and leaves the selection in a clearly unavailable state.
- If a person legitimately leaves the loaded lot, keep the inspector only when the authoritative projection can still explain where they went. Replace world actions with Locate unavailable and the known location/status. If the identity has been retired, close the stale inspector with a brief Entity no longer available notice.
- Selecting a new person switches atomically. Do not flash an empty card or reset the camera.

# 6. Building and place interaction specification

A building selection must answer five questions in reading order: **What is this? What is happening? Who is here? What is blocked? What can I do?** The building is a spatial entry point into management, not a menu-shaped button disguised as architecture.

## 6.1 State contract

| State | World treatment | Inspector content | Camera | Required behavior |
| --- | --- | --- | --- | --- |
| Normal | Natural building signage and authored status props; no generic glow. | None. | None. | Major landmarks may retain a short management-scale label within the label budget. |
| Hover | Edge/footprint emphasis limited to the hovered structure; category cursor; name plus one meaningful status. | Anchored label only. | None. | Select. |
| Selected | Persistent perimeter/footprint treatment and selected world label. | Identity, operation, occupancy, blocker, and actions. | None. | Open workspace; Focus; cycle contained people when exposed. |
| Working | Diegetic activity plus one restrained progress/status cue when selected or locally relevant. | Current operation, progress or throughput, occupancy. | None. | Route to the responsible production or facility workspace. |
| Blocked | Color-independent alert badge and shaped perimeter treatment; a new severe blocker may pulse twice, then settle. | Cause, consequence, responsible dependency, smallest useful remedy. | None until Locate/Focus. | Highlight the causal entity separately when it is visible. |
| Construction site | Site boundary and phase-appropriate construction rendering. | Future facility, phase/progress, builders or dependency, blocker. | None. | Open construction detail or cancel only through an explicit, confirmed action. |
| Vacant parcel | Quiet boundary only on hover/selection or while a placement tool is active. | Parcel identity, buildability summary, relevant constraints. | None. | Open Build for this parcel; selecting it does not begin placement. |

## 6.2 Selected building-card hierarchy

1. **Identity:** building/stage name, type, and operational-state chip.
2. **Happening now:** current activity in plain language. A stage names its production and phase; an office names its service state; an idle facility says Available rather than presenting an empty progress bar.
3. **Progress or capacity:** use the measure that governs this facility: scene progress, construction phase, occupancy, queue, or capacity. Never show every measure merely because data exists.
4. **Who is here:** up to three named, relevant occupants followed by +N more. The row opens or focuses an occupant list; physical proximity alone is not occupancy.
5. **Blocker:** highest-priority cause, consequence, and responsible dependency. If several exist, show 1 of N and route to the full list.
6. **Actions:** the smallest useful local remedy when authorized, then Open production/facility. Focus belongs in the common navigation affordances rather than displacing the remedy.

Two Point's fixed room panel is strong because a click creates a predictable local inspector and a deeper room workflow in the same side region [TPH-ROOM] [TPC-UI]. Planet Zoo's facility and habitat guidance reinforces state-specific information panels that expose capacity, condition, and local calls/actions [PZ-BUILD]. Project: Studio **ADOPTS** the stable inspector location and **ADAPTS** it around stages, productions, occupancy, and exact blockers.

## 6.3 Specialized world entities

| Entity | Selected answer | Primary context route | Additional constraint |
| --- | --- | --- | --- |
| Stage | Production, phase, scene/progress, key cast/crew, readiness/blocker | Open production | A set and a stage are not interchangeable IDs; the UI names the selected entity and links the related one. |
| General building | Service/activity, capacity/queue, relevant occupants, blocker | Open facility | Do not recreate The Movies' full lowered-wall floorplan as the universal control surface. |
| Vehicle | Identity/type, current assignment, destination, status | Open assignment or logistics detail | It may be selectable at medium/close scale; route rendering is selected-only. |
| Construction site | Intended building, construction phase, assigned builders, blocker | Open construction | No build, cancel, or spend on selection/double-click. |
| Vacant parcel | Parcel, availability, constraints, current reservation | Build here | Parcel is deprioritized underneath meaningful foreground entities unless the build tool is active. |
| Interactive prop | Name and current operational relevance | Inspect or context-specific explicit action | Only authoritative/stateful props are selectable. Decorative props never join hit testing. |

The Movies made building floorplans effective workflow surfaces: dropping a person, script, or movie into a local hotspot caused the next leg of production [TM-MAN]. That spatial legibility should survive. Its material drop semantics and building-specific control grammars should not. Project: Studio **ADAPTS** the building as a contextual gateway and **REJECTS** invisible interior hotspots as the general interaction language.

# 7. Camera contract

The management camera is a dependable instrument. It should feel immediate, bounded, and spatially continuous; close inspection is an explicit composition layered on top, not a different set of unpredictable rules.

## 7.1 Input map

| Intent | Pointer and keyboard | Controller-ready semantic input | Contract |
| --- | --- | --- | --- |
| Pan | WASD or arrows; optional edge scroll; configurable single-button drag (secondary-button drag by default); Space + left drag is an optional convenience | Left stick | A 4 logical-pixel drag threshold separates stationary secondary-click Cancel from pan. Screen-plane movement; no elevation drift. UI capture prevents world pan. |
| Orbit | Middle-button drag | Right stick | Orbit around the safe-frame point of interest. No roll. |
| Zoom | Wheel/trackpad; plus/minus around screen center | Triggers | Pointer zoom tends toward the ground/target under the pointer when a valid anchor exists; never tunnels through terrain. |
| Focus selected | F or the Focus affordance | Focus command | Animated framing of the selected target. Does not open detail or Follow. |
| Follow person | Inspector Follow toggle | Follow command | Explicit tracked composition. No automatic Follow on selection/focus. |
| Home/Gate | Home or the persistent Home affordance | Home command | Return to the one Studio Home pose anchored to Gate. Administration may be a composed landmark, never an alternate target. It is not synonymous with Back. |
| Target cycle | Tab / Shift+Tab | Bumpers | Cycle ranked semantic targets in the current candidate neighborhood or view. |
| Cancel/Back | Right-click uses pointer cancel; Escape uses full Back | Back/Cancel | Right-click uses the bounded subset in section 4.2; Escape/controller Back uses the ordered unwind in section 4.6. |

This combines The Movies' still-valid WASD/edge/MMB/wheel fundamentals [TM-MAN] with the modern separation of ordinary, free-look, eye-level, scenic, and cinematic inspection cameras in Planet Zoo [PZ-BASICS] [PZ-114]. Cities: Skylines corroborates left-select, right-cancel, edge/keyboard pan, middle orbit, and wheel zoom as a durable management convention [CS-MAN].

Mouse bindings must be configurable because MMB-only operation is inaccessible to some players and trackpads. The single-button pan plus keyboard/edge alternatives are therefore architectural, not optional polish. A secondary click becomes Cancel only when its press/release remains below the drag threshold.

## 7.2 Feel and tuning envelope

These values are Project: Studio starting parameters, not claims about comparator internals. They must be exposed as presentation tuning, tested at supported resolutions, and kept independent of simulation time.

| Parameter | Starting contract |
| --- | --- |
| Keyboard/stick pan | Approximately 0.65 of the shorter safe-viewport dimension per second at default; fast-pan modifier 1.75 times. Scale with camera altitude enough to preserve apparent screen speed. |
| Pointer orbit | Approximately 0.18 degrees per logical pixel; pitch clamped to 28–78 degrees; yaw continuous; roll fixed at zero. |
| Wheel zoom | 12–15 percent distance change per detent, retargeting a 140 ms ease; trackpads remain continuous and interruptible. |
| Edge scroll | 12 logical-pixel activation zone, speed ramp over 180 ms. Desktop default on; controller default off; user-toggleable. Disabled over UI, during drag, and while the app lacks focus. |
| Bounds | Keep the camera target within an authored lot boundary plus roughly 10–15 percent visual breathing room. Never reveal indefinite void. |
| Inertia | No post-input overshoot. Releasing pan/orbit stops motion; tiny input filtering is allowed, momentum is not. |

## 7.3 Safe-frame focus

The camera centers within the **safe world viewport**, which excludes the fixed inspector, top-level HUD reservations, and any responsive bottom sheet. It does not center under UI and then ask the player to compensate.

| Focus distance | Duration | Framing |
| --- | --- | --- |
| Same local area and zoom band | 260 ms | Preserve yaw and pitch; translate and make only the minimum zoom correction. |
| Cross-lot or cross-band | 420 ms | Preserve orientation unless it would hide the target; use one direct eased path. |
| Very large correction | No more than 650 ms | Prioritize readable arrival over cinematic travel. |
| Studio Home | 420 ms | The one Gate-anchored authored home pose, interruptible. |
| Enter close inspection | 320 ms | Store the management pose before composing the target. |
| Reduced camera motion | Snap, or at most 100 ms without travel flourish | Use a static focus confirmation on the target. |

Manual camera input cancels a transition immediately at its current pose. A new Focus retargets from the current pose; transitions are never queued. Selecting or opening a card during a transition does not restart it. Focus a person at a medium/close readable scale; frame a building to occupy roughly 30–55 percent of the safe frame depending on footprint. Preserve spatial orientation by default.

## 7.4 Follow contract

- Follow is available only for a selected person or vehicle with a live trackable anchor.
- Starting Follow stores the current camera pose and uses a soft safe-frame dead zone, so locomotion does not create constant micro-correction.
- Orbit and zoom adjust the followed composition without ending Follow. Direct pan, edge scroll, WASD, Home, Focus another entity, or entering a management route ends Follow.
- Changing the selected stable entity always ends Follow. Re-selecting or opening context for the same selected entity does not.
- If the anchor becomes unavailable, Follow ends without a camera jump. Selection remains when its identity still exists.
- Escape/Back from Follow returns to the stored pre-follow pose when that pose belongs to the current navigation context; canceling Follow through direct pan keeps the resulting current pose.

## 7.5 What never moves the camera automatically

The camera does **not** move because the pointer hovered, an entity was single-selected, an inspector/profile opened, a material action completed, a background notification arrived, a list row was merely selected, a zoom band changed, or an entity moved out of frame. Alert opening explains; Alert Locate moves. List selection establishes management context; Locate in world moves. These separations prevent motion sickness and protect the player's spatial plan [XAG-117].

## 7.6 Management, inspection, and cinematic modes

- **Management camera** is the default and supports every core action.
- **Close inspection** is an explicit Focus/Inspect composition with a visible Return control. It never unlocks otherwise unavailable simulation actions.
- **Cinematic inspection** is presentation-only, entered explicitly, and always cancellable. Its playback, keyframes, and dramatic fly-bys are **LATER** work, informed by Planet Zoo's scenic/cinematic cameras rather than The Movies' contextual double-click fly-by [PZ-114] [TM-MAN].
- Entering a non-management composition stores one return pose per navigation context. Do not overwrite that pose through incidental orbit/zoom inside the composition.

# 8. Zoom-information hierarchy

The camera moves continuously, but information changes in three semantic bands. This keeps zoom feeling physical while giving UI and hit testing discrete, testable rules. Band changes use about 12 percent hysteresis so labels do not flicker at a threshold. The presentation exposes a stable ZoomBand value; simulation logic must not depend on it.

As an art-independent starting rule, use the projected height of a representative adult: below roughly 14 logical pixels is management scale, 14–32 is medium scale, and above 32 is close scale. Calibrate those thresholds against final art and screen density while preserving the behavioral contract.

| Concern | Management scale | Medium scale | Close scale |
| --- | --- | --- | --- |
| Primary story | Lot structure, productions, traffic/flow, facility state, major alerts | Staff movement, local queues, stage activity, building status | Identity, task, filmmaking activity, local human story |
| Buildings/stages | Simplified but distinct silhouettes; landmark labels; production/blocked badges | Names on hover/selection; compact local status and progress | Detailed authored activity; selected operational cues remain readable |
| People | Aggregates/flow and major person alerts only; tiny individuals are not direct targets | Named/important people are eligible through forgiving proxies; applicant queues readable | Individual people, task cues, selected path/destination, local interactions |
| Vehicles/sites/parcels | Status and major flow; sites/parcels readable as areas | Selectable with identity/status | Detailed activity without extra permanent labels |
| Labels | Selected, major alerts, blockers, landmark status within a strict budget | Hover, selected, significant local status | Hover/selected identity; contextual local story, aggressively avoiding head clutter |
| Context UI | Fixed inspector, constant readable size | Same inspector; richer movement/occupancy rows when relevant | Same hierarchy; never replace it with tiny world-space prose |

OpenRCT2's authored zoom sprites and feature cutoffs are the relevant lesson: distant views must be deliberately simplified, not just scaled down [LOCAL-CAMERA]. Project: Studio **ADAPTS** the semantic cutoff principle to a continuous 3D camera.

## 8.1 Decluttering and targetability

- Label priority is: selected entity; active located alert and cause; pointer/focus target; decision or blocker; working landmark. Lower priorities yield instead of overlapping.
- Start with a world-label budget of eight on a desktop safe viewport and five on a compact viewport, excluding the one anchored hover label. Tune by occlusion tests, not by increasing the budget whenever a new system ships.
- Persistent labels are constant-size screen UI with collision avoidance and leader treatment when displaced. Never scale prose until it becomes unreadable.
- A selected entity retains its selected indicator and inspector across zoom bands, but a tiny management-scale person does not retain direct pointer eligibility. Its selected marker becomes an aggregate pin; Focus or the list remains available.
- At medium/close scale, a person's world hit proxy starts at approximately 32 by 44 logical pixels and must not depend on the exact silhouette. World proxy expansion never changes overlap ranking.
- UI controls use at least 44 by 44 logical-pixel activation areas. Equivalent list/cycle navigation exists whenever a world target cannot meet a usable target size [WCAG22].

# 9. Context UI, world-management navigation, and alerts

## 9.1 Surface ruling

| Surface | Strength | Failure mode | Project: Studio ruling |
| --- | --- | --- | --- |
| Anchored entity label | Fast spatial confirmation and low mouse travel | Occlusion, movement, edge clipping, poor space for blockers/actions | **ADOPT** for hover and selected identity/status only. |
| Fixed side inspector | Stable reading position, accessible focus order, room for state and remedies | Reduces world viewport; can become a mini-dashboard | **ADOPT** for selection context with strict hierarchy. |
| Radial/pie menu | Short pointer travel and strong direction memory | Weak for changing text, blockers, keyboard flow, and authoritative confirmation | **REJECT** as the universal grammar; reserve only for a proven small, stable quick-command set later. |
| Bottom panel/sheet | Works on narrow/controller layouts and preserves horizontal world context | Can obscure close targets and encourages excessive height | **ADAPT** as responsive form of the same inspector. |
| Full modal | Strong attention and confirmation | Destroys spatial continuity and back context | **REJECT** for routine context; use only for truly blocking confirmation or policy. |

The chosen system is a two-surface composition: one short anchored world label plus one predictable fixed inspector. There is only one selected inspector. Alerts, building types, and person classes populate shared slots rather than spawning competing panels.

## 9.2 Dimensions and responsive behavior

- Anchored label: maximum width about 240 logical pixels; 12–16 pixels away from the target bounds; at most two lines; flip/clamp inside the safe viewport; never cover the pointer hotspot.
- At viewport widths of at least 1068 logical pixels, inspector width is clamp(320 pixels, 30 viewport-width units, 400 pixels). Header/actions remain fixed; only its body scrolls.
- From 960 through 1067 logical pixels, use a 320-pixel inspector, capped at 34 percent of viewport width.
- Below 960 logical pixels, in controller-first navigation, or at 200 percent text, the same schema becomes a bottom sheet occupying roughly 36–46 percent of height, expandable to a full-height single-axis scrolling detail surface.
- Reflow, order, labels, and action semantics remain identical across forms. Responsive behavior must not create separate product logic.

Inspector order is: identity/status; now/current context; progress/occupancy; highest blocker; no more than two business actions; overflow. Focus, Close, and eligible Follow are common navigation chrome outside that budget. An authorized material action/remedy takes business slot 1 and the deep route takes slot 2; without a material action, the deep route takes slot 1 and slot 2 is omitted. Material actions use explicit labels and authoritative capability states.

## 9.3 Bidirectional navigation contract

Every relevant management row exposes **Locate in world**. Every selected authoritative world entity exposes **Open profile**, **Open production**, or **Open facility** as appropriate. Both directions carry an exact stable reference and an explicit navigation origin.

The navigation origin records, at minimum:

- studio/session identity and exact entity kind/ID;
- camera pose, safe viewport, and semantic zoom band;
- selected/followed state and open inspector;
- route, tab, filter/query, sort, scroll position, and focused row;
- whether the transition was Open deep management or Locate in world.

Routine deep management opens as a retained-world overlay: the world remains visible but does not accept pointer/gameplay input through the surface. Simulation pause follows the game's existing time-control law; opening context does not invent a new pause rule. If an implementation route must unmount the world, the same origin is serialized before navigation and restored exactly on Back.

**Open deep management:** preserve camera and selection, open the exact entity route, place accessible focus at the route heading, and push one shallow origin. Back closes it and restores the same world pose/selection. Do not append duplicate origins as the player switches tabs inside the same entity workspace.

**Locate in world:** preserve the management origin, resolve the exact current entity, close/retreat the management surface enough to reveal the world, select it, and run Focus. A visible Back to management restores the route, tab/filter/scroll/focus, and the pre-locate camera pose. A separate Stay/Continue in world action commits the located camera and discards that management origin.

If the exact target has no current world anchor, Locate is disabled with the known reason or returns a no longer on lot result without moving the camera. It must never focus the first matching role, title, stage, or render actor. This is a forward contract over older routes that reload or reconstruct partial state; it does not authorize identity substitution.

## 9.4 Alert to world contract

Planet Coaster's severity-oriented notifications and camera-routing behavior show the value of taking a management alert back to its facility [PC2-MGMT] [PC1-101]. Cities: Skylines II's selected-person/vehicle/building routes show why spatial overlays should appear only for the current object, not the entire map [CS2-DETAILERS]. Project: Studio **ADAPTS** both into a two-step, cause-aware alert grammar.

An alert projection carries:

- alert ID and severity;
- exact subject reference;
- exact causal/blocking reference when it differs from the subject;
- concise impact text;
- remedy intent/capability reference when one exists;
- grouping key and 1 of N position for repeated causes.

Opening an alert selects it in the alert surface and explains subject, cause, impact, and remedy without moving the camera. **Locate** then revalidates both references, selects and focuses the subject, emphasizes the causal entity with a distinct shaped treatment or short connector, and opens the subject inspector at its blocker section. The smallest useful authorized remedy is visible there; deeper investigation remains one step away.

For Stage 7 blocked: scenery missing, Stage 7 is the selected/focused subject, the missing-scenery requirement is the named cause, the production impact is stated, and the first remedy routes to the narrow scenery/workspace decision—not a generic building screen. When several dependencies are missing, show the highest-priority cause plus 1 of N rather than illuminating the entire lot.

If the alert resolves before Locate, remove it from the active queue, retain it as resolved in alert history, and do not move. If its subject remains but its cause changed, use the fresh cause. If the subject disappeared, preserve the explanation in the alert history and disable Locate. Remedy actions always revalidate against authoritative current state.

# 10. Accessibility and controller constraints

These are architecture requirements now, even though a complete controller/accessibility pass is not part of the next checkpoint.

1. **Semantic target registry.** Every selectable entity supplies stable identity, kind, bounds/anchor, label, state, action capabilities, and neighbor/cycle metadata independently of renderer hit meshes. Pointer hover, keyboard/controller focus, and persistent selection are distinct states.
2. **No hover-only fact or action.** Anchored hover information is also available after selection and through focus navigation. A non-pointer player can discover the same entities in a spatial list/cycle [XAG-112].
3. **Visible, color-independent focus.** Hover, input focus, selection, and alert cause use different shapes/weights/badges as well as color. Input focus remains obvious on every surface [XAG-113].
4. **Forgiving targets with alternatives.** UI targets are at least 44 by 44 logical pixels; medium/close person proxies start near 32 by 44; semantic cycling or an entity list provides an equivalent route when a world proxy cannot be large enough [WCAG22].
5. **Reflow and text scale.** At 200 percent text, the inspector becomes a single-axis scrolling sheet/full surface with no clipped status, blocker, or primary action. Focus order follows the visual information hierarchy [XAG-112].
6. **Reduced camera motion.** All programmatic camera travel can snap or use the reduced transition; cinematic inspection and alert pulses can be disabled; static focus/selection cues remain [XAG-117].
7. **Remappable, separable input.** Pan, orbit, zoom, Focus, Home, target cycle, Follow, and Back are semantic commands with remapping, sensitivity, and inversion support. No core action requires a hold, rapid repetition, simultaneous chord, drag, motion control, or vibration [XAG-107]. Drag may remain as a convenience only when a click/command alternative exists [WCAG22].
8. **Controller target navigation.** Bumpers cycle ranked targets; directional navigation uses stable spatial neighbors; category filters prevent cycling hundreds of irrelevant objects. The fixed inspector owns a deterministic focus order, and Back always returns focus to the originating world target.
9. **Accessible companion projection.** Name, role/type, selected state, doing now, blocker, and action availability are supplied as structured text in the same order as the visual inspector. Decorative extras are absent from this projection.

Two Point Campus demonstrates that clear/large text, a visual-comfort option that removes camera movement/effects, adjustable camera settings, and relief from holds/rapid/simultaneous presses can coexist with a controller-friendly tycoon interface [TPC-ACCESS]. Project: Studio must leave room for those capabilities now rather than retrofit semantic identity and focus later.

# 11. Fable implementation recommendation

## REQUIRED NEXT — P02A: Gate and Administration interaction spine

Build one bounded player-facing vertical slice across the Gate applicants and Administration founding already in CP9. It establishes the reusable grammar without expanding gameplay scope or migrating every lot entity.

Scope:

1. Add a presentation-side interaction state and semantic command dispatcher for Gate applicants, the Gate, and Administration only: hover, input focus, selection, Focus, context, deep route, Locate, and Back. It stores stable simulation references, never business rules.
2. Join those targets to the existing authoritative TypeScript CP9 projections and opaque intents. Unity/Three.js may render state and send intents; neither may infer eligibility, prices, role matches, founding legality, RNG, or identity.
3. Implement the shared anchored label and responsive inspector schema, including applicant and building variants, blocker slot, explicit Review/Open route, exact switching, and stale-target behavior.
4. Implement the management camera's safe frame, interruptible Focus/Home transitions, reduced-motion path, and no-camera-on-selection rule for this slice.
5. Implement retained-world Review applicant / Administration workspace navigation and exact Locate in world return, carrying camera, selection, route/tab/filter/scroll, and focus origin.
6. Implement the Escape/Back unwind order, semantic target cycling, minimum proxy sizes, visible focus state, and structured accessible labels.
7. Instrument selection, Focus, route, return, unresolved target, and stale-intent outcomes for playtest diagnosis. Do not expose Follow in P02A unless a CP9 applicant already has a trustworthy live trackable anchor.

Acceptance proof:

- Hovering a Gate applicant identifies that exact applicant without permanent label noise; keyboard/controller focus reaches the same target and information.
- Single-click selection changes no gameplay state and does not move the camera; it opens the applicant inspector with identity, candidacy/current state, availability/blocker, Review applicant, and navigation affordances.
- Double-click or Focus frames the applicant within the safe viewport; manual input interrupts; reduced motion snaps/shortens it.
- Review applicant opens the exact candidate in the retained management workspace. Back restores the exact selection, camera, filter/scroll, and focus.
- Locate from the candidate workspace returns to and focuses only the exact authoritative applicant. Missing/stale targets fail closed with no substitution and no camera move.
- Selecting Administration answers its current founding/operational state and opens the exact workspace. Any found/spend/hire action remains explicit and freshly validated.
- Escape closes the topmost layer in the specified order; it never causes a material action.
- At management scale, tiny applicants cannot require pixel-perfect clicks; target cycling and the applicant list remain complete routes.
- Presentation clients contain no copied simulation legality or economy logic, and the existing CP9 authoritative tests continue to pass.

P02A should finish with one instrumented owner playtest: select Gate applicant → Focus → Review → Back → Locate → Stay in world → select Administration → open workspace → Back. Approval of that loop freezes the shared state model and inspector/camera contract before wider migration.

## FOLLOW-UP

- Migrate Stage 7 and other operational buildings to the shared inspector, including working/blocked states, occupants, cause-aware alerts, and production deep links.
- Add full person Follow with live-anchor loss behavior, selected-only path/destination rendering, and person class variants.
- Apply semantic zoom bands, authored declutter budgets, and target proxies across the complete lot.
- Add vehicles, construction sites, parcels, and authoritative props to the same registry after their simulation references are stable.
- Convert major management lists and alerts to the exact bidirectional origin/Locate contract.

## LATER

- Cinematic/scenic inspection paths, authored keyframes, and screenshot controls.
- Minimap or overview map once lot scale and navigation evidence require it.
- A small optional radial quick-command surface only if repeated controller/pointer testing proves a stable command set.
- Multi-selection, pinned inspectors, saved camera bookmarks, and configurable label-category filters.

## DO NOT DO

- Do not glow every interactive object, keep all names visible, or render every route/alert at once.
- Do not make single-click, double-click, drag, dropping, or camera arrival perform a material action.
- Do not create a bespoke panel or input grammar per profession/building.
- Do not force camera motion when an alert arrives/opens, a list row is selected, or a deep surface opens.
- Do not let renderer overlap order determine semantic selection or let decoration intercept authoritative entities.
- Do not approximate missing identities by title, array position, proximity, or first match.
- Do not move simulation formulas, eligibility, legality, economy, RNG, or identity authority into a presentation client.
- Do not make management-scale tiny people a required pointer target.
- Do not use a modal or full-screen workspace when a retained-world inspector can answer the local question.
- Do not revive The Movies' universal pickup/drop or building-hotspot choreography as the default modern control model.

# 12. Evidence register

Evidence labels throughout the report distinguish direct documentation/observation from the recommendations derived from them. Primary manuals and official product material carry the most weight; contemporary walkthroughs and community observations are used only where primary material is incomplete. No comparator's undocumented timing or pixel values are represented as fact.

## The Movies

- **[TM-MAN] — verified primary:** [The Movies official English manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040), especially printed pages 6, 8, 10–12, 18–20, and 38. Covers HUD Star/Movie cards, card hover/jump/drag, information bubbles, guidance, pan/orbit/zoom, Map mode, person/object pickup, building floorplans, casting, construction, and set fly-by/director view.
- **[TM-GUARDIAN] — contemporary preview, moderate confidence:** [The Guardian, The Movies preview](https://www.theguardian.com/technology/2005/jun/23/shopping.games). Used as period corroboration of the game's studio-management and filmmaking premise, not as an input specification.
- **[TM-GS] — contemporary hands-on/walkthrough, moderate confidence:** [GameSpot hands-on](https://www.gamespot.com/articles/the-movies-hands-on-moviemaking-star-wrangling-studio-building-and-more/1100-6135284/) and [GameSpot walkthrough](https://www.gamespot.com/articles/the-movies-walkthrough/1100-6140049/). Used to corroborate labor-intensive Star/staff management and building-led workflow.
- **[TM-SE-GUIDE] — secondary expansion evidence:** [The Movies: Stunts & Effects guide](https://gamefaqs.gamespot.com/pc/932332-the-movies-stunts-and-effects/faqs/43496). Supports expansion-era right-click statistics, left-click following/showing, double-click zoom, dragging, and activity icons. It is not treated as proof of universal base-game behavior.

## Comparators

- **[PZ-BASICS] — verified official:** [Planet Zoo: The Basics](https://www.planetzoogame.com/es-ES/centro-de-ayuda/guias-jugador/the-basics). Selection/cancel inputs, movement shortcuts, and standard/free-look/explore/scenic/cinematic camera families.
- **[PZ-114] — verified official:** [Planet Zoo Update 1.14](https://www.planetzoogame.com/en-us/news/planet-zoo-update-114-coming-20th-june). Individual staff information panels, Staff Overview, and scenic/cinematic camera behavior.
- **[PZ-102] — official patch evidence plus moderate corroboration:** [Planet Zoo Update 1.0.2 notes](https://store.steampowered.com/news/posts/?appids=703080&enddate=1574848961&feed=steam_community_announcements) and [contemporary patch transcription/discussion](https://www.reddit.com/r/PlanetZoo/comments/dwablz). Used for Locate/open-animal-information-panel behavior and panel fixes.
- **[PZ-ANIMAL-CAM] — community observation, moderate confidence:** [Planet Zoo animal camera discussion](https://steamcommunity.com/app/703080/discussions/0/2961643431523755324/). Click animal, then invoke the camera affordance in its information panel; used only to corroborate explicit rather than automatic focus.
- **[PZ-BUILD] — verified official:** [Planet Zoo: Building Your Zoo](https://www.planetzoogame.com/help-centre/player-guides/building-your-zoo). Facility/habitat information-panel state and local actions, including capacity, repair calls, and selected camera views.
- **[TPH-ROOM] — verified official:** [Two Point Hospital room templates deep dive](https://community.twopointcounty.com/two-point-studios/two-point-hospital/blogs/9-room-templates-deep-dive). Clicking a room opens a predictable right-side information surface with a deeper room workflow.
- **[TPC-UI] — detailed secondary observation:** [Two Point Campus interface grand tour](https://gamefaqs.gamespot.com/pc/323032-two-point-campus/faqs/82357/game-interface-grand-tour). Staff/room world and list routes into shared information panels.
- **[TPC-ACCESS] — verified platform listing:** [Two Point Campus accessibility](https://www.playstation.com/en-us/games/two-point-campus/). Clear/large text, visual comfort, adjustable camera controls, and reduced complex input requirements.
- **[FM24] — verified official:** [Football Manager 2024 manual: Players](https://community.sports-interactive.com/sigames-manual/football-manager-2024-fr/joueurs-r5004/). Compact portrait/info bio and attribute access, context actions without opening the complete profile, and deeper profile hierarchy.
- **[SIMS-PC] — verified official:** [The Sims 4 tips and tricks](https://www.ea.com/games/the-sims/tips-and-tricks?cid=54941&ts=1545877872377&ts=1545877872377%3Fcid%3D54941). Switching Sims, camera lock, and centering.
- **[SIMS-PS4] — verified primary:** [The Sims 4 PS4 manual](https://eaassets-a.akamaihd.net/eahelp/manuals/the-sims-4-ps4-ukanz.pdf), especially its camera controls and lot centering. Supports explicit select, snap, follow, and next-Sim controls.
- **[CS-MAN] — verified primary:** [Cities: Skylines official manual](https://cdn.akamai.steamstatic.com/steam/apps/255710/manuals/CitiesSkylines-UserManual_EN.pdf). Edge/keyboard pan, middle-button orbit/tilt, wheel zoom, left selection, and right cancellation.
- **[CS2-DETAILERS] — verified official:** [Cities: Skylines II Detailer's Patch 2](https://www.paradoxinteractive.com/games/cities-skylines-ii/news/detailers-patch-2). Persistent selected-person, vehicle, and building route visualization.
- **[PC1-101] — contemporary secondary observation:** [Planet Coaster patch 1.0.1 report](https://www.pcgamesn.com/planet-coaster/planet-coaster-patch-101). Notification camera focus behavior; used only as corroboration for alert-to-facility routing.
- **[PC2-MGMT] — verified official:** [Planet Coaster 2 management deep dive](https://www.planetcoaster.com/en-US/news/2024-09-25/deep-dive-mastering-management). Management categories and severity-aware notifications.

## Accessibility standards and local Project: Studio evidence

- **[XAG-107] — current platform guidance:** [Xbox Accessibility Guideline 107: Input](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/107). Remapping, sensitivity, digital alternatives, and avoiding required complex/rapid/held inputs.
- **[XAG-112] — current platform guidance:** [Xbox Accessibility Guideline 112: UI navigation](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/112). Consistent focus order, controller/keyboard navigation, reflow, points-of-interest alternatives, and Back behavior.
- **[XAG-113] — current platform guidance:** [Xbox Accessibility Guideline 113: UI focus](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/113). Clear, visible, persistent focus indication.
- **[XAG-117] — current platform guidance:** [Xbox Accessibility Guideline 117: Camera motion](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/117). Camera control, motion reduction, sensitivity, and automatic-motion concerns.
- **[WCAG22] — current W3C recommendation:** [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/wcag/). Dragging alternatives, target size minimum/enhanced guidance, focus, reflow, and interaction-triggered motion.
- **[LOCAL-CAMERA] — local donor study:** [Code Mining Ledger, Entry 4](../../CODE-MINING-LEDGER.md#entry-4--tycoon-camera-zoom-readability-minimap). OpenRCT2 zoom-specific authored sprites, feature cutoffs, labels, tiny-entity removal, minimap, and focus lessons.
- **[LOCAL-ROLE-ATLAS] — local accepted contract:** [Hollywood Dynamic People Role Atlas closure](../HOLLYWOOD-DYNAMIC-PEOPLE-ROLE-ATLAS-V1-CLOSURE.md). Named authoritative person precedence over invisible place zones and decorative/non-authoritative actors.
- **[LOCAL-CLIENT] — local product decision:** [Unity production client decision](../UNITY-PRODUCTION-CLIENT-DECISION.md). TypeScript remains the sole authoritative simulation; Unity is a presentation/interaction client sending opaque intents and must not duplicate game rules or identity authority.

# Closing ruling

The Movies' lasting achievement was making production feel spatial: people, cards, buildings, and guidance formed a visible chain of work. Its pickup/drop control language, contextual double-click meanings, and dense building-specific hotspots are no longer the best way to express that idea. Project: Studio should preserve the choreography while modernizing the grammar: calm semantic hover, inert exact selection, explicit Focus and Follow, a stable local inspector, continuous camera with semantic zoom bands, and lossless bidirectional navigation between authoritative world entities and management workspaces.

That grammar makes the lot the place where the player understands the studio—not merely the animated background behind its menus.
