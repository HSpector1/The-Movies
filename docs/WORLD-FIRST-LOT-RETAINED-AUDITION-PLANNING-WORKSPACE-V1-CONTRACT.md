# World-First Lot-Retained Audition Planning Workspace V1 Contract

Status: **FROZEN — BINDING IMPLEMENTATION AUTHORITY**

Date: 2026-08-15

Branch: `operation-hollywood-autonomous-marathon`

Implementation parent and accepted Lot-Retained Screenplay Commission closure:
`5cacd872a773910a18699b20cb5d4ab3c01a4821`.

Contract authority: the documentation checkpoint containing this record; its commit SHA is
intentionally not guessed before that checkpoint exists.

Scope state: **BOUNDED IMPLEMENTATION FREEZE**

## 1. Governing authority

This contract follows:

- the Owner's binding ruling that **THE STUDIO LOT IS THE PRIMARY GAME SURFACE** and
  **MANAGEMENT UI SUPPORTS THE WORLD. IT DOES NOT REPLACE THE WORLD**;
- the ordinary loop
  `WORLD → INSPECT / ACT → DEEP PANEL IF NEEDED → RETURN TO THE SAME LIVE WORLD`;
- accepted Casting Sessions V1, Studio Home V1, Operational Annex Work Presence, Lot-Native
  Casting Review, Lot-Retained Package & Greenlight, and Lot-Retained Screenplay Commission law;
- canonical `castingSessionsBoard`, its complete player-safe candidate/capacity/action projection,
  and `startCastingSessionAction`;
- App ownership of the one current `GameState`, autosave, whole-state replacement, mounted-Lot
  presentation lifetime, navigation, modal state, and focus return; and
- Engine/GameState ownership of every screenplay, candidate, eligibility result, Casting session,
  slate, reservation, clock, result, save byte, and outcome fact.

This contract narrowly supersedes Casting Sessions V1's presentation rule that ordinary Lot
Casting planning always replaces the Lot with the Casting Room. The Casting Room remains the deep
owner of activation, capacity overview, multiple-project choice, active sessions, history, review,
package handoff, roster handoff, and broad Casting management. Only one unambiguous first-session
camera-test planner host changes in the governed path.

Protected authority remains:

- `main`: `33eb33ae307904aa3f00db20bc695e40bf46d1e4`;
- accepted D-17B: `35d42687a410a621becf1df35c75986657f8c44e`; and
- Operation Hollywood bridge: `623b8b2a80e9c6b85304eaa2a338b6045e8f6b21`.

No merge, push, tag, or protected-ref movement is authorized by this contract.

## 2. Measured world-first break

The current ordinary managed path is:

```text
LIVE LOT → SELECT CASTING / TALENT
→ App maps browse-talent to setScreen({ kind: 'castingRoom' })
→ STUDIO LOT / PHASER VIEW / CANVAS UNMOUNT
→ SELECT THE READY PROJECT → OPEN CANONICAL SLATE PLANNER
→ START CAMERA TESTS → AUTOSAVE INSIDE FULL CASTING ROOM
→ BACK → REPLACEMENT LOT / VIEW / CANVAS MOUNT
```

The deterministic `audition-planning-current-break-audit` used only public founding, retained
commission, week, screenplay-review, Casting, and planner actions. It measured:

- before Casting entry: Lot/mount/canvas = **1/1/1**, renderer constructions/destructions =
  **1/0**;
- inside Casting Room/planner: **0/0/0**, every captured world node disconnected, and renderer
  constructions/destructions = **1/1**;
- after Back: Lot/mount/canvas = **1/1/1**, but all three nodes were replacements and renderer
  constructions/destructions = **2/1**;
- before and returned structure = **30 display objects / 13 actors / 11,096,896 decoded bytes /
  one draw**; and
- the accepted planner action changed only `castingSessions`.

The exact measured Week-1 successor appended:

```text
id: casting-0000
projectId: exact selected Ready screenplay
status: auditioning
slate: six explicit role reads across at least three unique Actors
startedWeek: 1
dueWeek: 2
reservation: facility-development-casting / development-casting / slot 0
results: null
```

Every other GameState field, including week/tick, cash, ledger, RNG, screenplay, production,
employment, and construction truth, remained equal. The autosaved SaveFileV11 replayed
byte-identically. Starting the session does not advance the week; one future Engine week produces
results.

The current `managedCastingLotCue` is presentation-only. It uses the first legally plannable Ready
project after review/active priority and does **not** prove uniqueness. It may name one project when
several legal projects exist. V1 must independently validate the complete canonical board and may
never use cue title, list order, or the first match as action authority.

## 3. Binding player loop

```text
LIVE LOT → SELECT CASTING / TALENT
→ EXACTLY ONE LEGAL FIRST-SESSION READY SCREENPLAY IS PROVEN
→ CANONICAL CAMERA-TEST SLATE PLANNER OPENS ABOVE THE SAME MOUNTED LOT
→ CHOOSE TWO PRIMARY ACTORS FOR EACH OF LEAD / ANTAGONIST / SUPPORT
→ CANCEL: CLOSE → EXACT SAME LIVE LOT / CANVAS / CAMERA / STATE
→ REJECTION: KEEP WORKSPACE + COMPLETE SLATE + EXACT ENGINE ERROR
→ ACCEPT: COMMIT EXACT ENGINE SUCCESSOR → AUTOSAVE
→ CLOSE WORKSPACE
→ SAME MOUNTED LOT KEEPS CASTING SELECTED
→ SHOW EXACT CAMERA TESTS UNDERWAY WITNESS + DUE WEEK / FACILITY / SLOT / SIX READS
→ CONTINUE LIVE LOT PLAY
```

The full Casting Room remains one explicit supporting action from the workspace.

## 4. Hard scope narrowing

The retained path requires all of:

```text
Operation Hollywood enabled
+ mounted Studio Lot
+ exact current rendered GameState / Lot Screen / presentation token
+ exact Casting-origin browse-talent route from that current Lot
+ managed Studio Operations / Script Development / Casting Sessions
+ raw `state.castingSessions.sessions` is exactly empty
+ exactly one readyToPlan project on the complete canonical board
+ that exact project owns exactly one canonical planAuditions action
+ board auditioning / needsReview / history sections are all empty
+ board nextDecision is null
+ at least one current Development & Casting slot is available
+ no Package / Commission / Talent Profile / other modal owner
+ no live-formation or other transition owner
```

The gate is intentionally first-session only. Zero or multiple Ready/legal projects, any active
session, pending review, Casting history, legacy mode, Operation-Hollywood-off, non-Lot origin,
capacity blocker, fewer than three currently eligible primary Actors, or any malformed/ambiguous
board keeps the established full Casting Room route. No project is chosen by array order, cue,
title, remembered selection, or default.

The accepted Lot-native Casting-review panel retains priority over planning. An active session
retains current **camera tests underway** truth and deep management. A completed/review session
retains the accepted native review path. V1 cannot widen the direct Package route.

## 5. Strict planning context

A pure fail-neutral selector must consume the complete current `castingSessionsBoard` and return
one closed planning context or `null`. It must validate exact own keys, array density, scalar
types, unique IDs, section membership, mode, capacity, facilities/slots/occupants, next decision,
project identity, writer, status, consequence, blockers, package availability, candidates, legal
actions, and every candidate's public Fit/availability fields.

The accepted context requires:

- exactly one `readyToPlan` member and no member in any other section;
- `status === 'notStarted'`, `sessionId === null`, `dueWeek === null`, and
  `weeksUntilDecision === null`;
- exactly one matching `planAuditions` action for that project;
- no project blocker and positive canonical capacity availability;
- at least three unique available primary Actors across the complete candidate surface;
- each Lead, Antagonist, and Support candidate array is dense, uniquely keyed, and internally
  consistent, contains the same canonically ordered current Actor-ID set, and exposes only
  `available: true` candidates in this deliberately narrow first-session gate;
- the one card cross-links exactly to one raw Ready Script Project, its concept title, and its
  locked writer ID/name without title or array-order substitution; and
- one deterministic first-free Development & Casting facility/capability/slot can be derived from
  the complete canonical capacity projection.

Invalid, sparse, duplicate, extra/symbol-key, throwing, stale, contradictory, multi-project, or
partially valid input returns `null` as a whole. The selector does not repair or sort hostile data.

## 6. Shared canonical planner and action

Implementation must extract and reuse the current canonical slate planner. One shared component
must own:

- the exact project title and screenplay/writer context supplied by the board;
- all current player-safe candidate names, Fit values, and availability labels;
- two explicit selections for each Lead, Antagonist, and Support read;
- the existing minimum of three unique people across all six reads;
- the exact one-week / one shared slot / no audition-fee consequence;
- the truth that camera tests do not sign, pay, reserve or hold an Actor, or mark an Actor busy;
- the disabled/stale-selection behavior when capacity or Actor availability changes; and
- the sole **Start one-week auditions** intent.

No candidate is preselected. Candidate order is presentation only. The retained host may dispatch
only `startCastingSessionAction(renderedState, { projectId: exactProjectId, slate: explicitSlate })`.

The standalone Casting Room keeps the same planner content, choices, legality, result, and errors.
Its accepted callback ordering must report the Engine successor before closing or changing planner
ownership.

## 7. Same-mounted world invariant

Open, cancel, rejection, accepted commit, autosave, close, and witness must retain exactly:

- one mounted `StudioLotScreen` component;
- one `StudioLotView` / Phaser presentation instance where available;
- one canvas DOM element;
- the same App-owned opaque Lot presentation token;
- the same `Screen` object with `kind: 'lot'`;
- the current camera and Lot-local selection/presentation memory; and
- one App/GameState authority tree.

No step may call `setScreen`, create a second Lot, remount the renderer, or fake continuity with an
equivalent replacement. World ambience may continue. Every background semantic and renderer input,
including recovery/migration siblings, is suspended while the dialog owns interaction.

## 8. App-owned audition-planning session

One separate transient, non-serialized App session must capture at least:

- an opaque session identity and monotonic React key;
- the exact rendered `GameState` object;
- the exact current Lot `Screen` object;
- the exact Lot presentation token;
- the exact strict planning context/project; and
- the exact connected Casting opener when available.

The session has an editing owner and a synchronously claimed/committed owner. One gesture claim
makes double-click, repeat, cross-key, virtual-AT, retained, and compatibility callbacks stale
before a second dispatch can occur.

The editing session also owns a monotonic slate revision and an optional rejected-attempt record
keyed by exact workspace, rendered state, slate revision, closed payload signature, and Engine
error. After rejection, same-revision physical tails return that cached error without redispatch.
Only a genuine candidate toggle increments the revision and clears the rejected-attempt guard;
cancel, details, replacement, teardown, and accepted commit clear it completely. Visibility loss
or blur clears held gesture/activation claims, but preserves the rejected-attempt record. An
unchanged rejected slate cannot treat a later compatibility click as fresh consent.

Package, Commission, Audition Planning, Talent Profile, and other modal owners are mutually
exclusive except for separately authorized nested workflows. V1 adds no nested Profile or Roster
control to the planner. It must not reuse Package or Commission session identities, claims,
receipts, or close effects.

## 9. Exact open authority

App may open the planner only after independently proving:

1. the route came from the currently mounted Lot;
2. current state, Lot Screen, and presentation token are the exact objects rendered by that Lot;
3. Operation Hollywood and all three managed modes are current;
4. the strict complete-board context proves the one frozen first-session project;
5. current world attention is not a pending Casting review or active session; and
6. no modal, retained workspace, live-formation transition, or other owner conflicts.

Opening stores the active element as the potential exact return target, changes no selection into
authority, mutates no state, and invokes no autosave.

## 10. Retained workspace presentation

The planner is a substantial accessible dialog/sheet above the visible Lot, not a page route or
tiny popup. It must reuse `LotRetainedWorkspace` and the accepted retained-workspace law:

- one labelled modal owner and focus trap;
- one internal scroll owner;
- body/background scroll containment;
- no scrim-click cancellation;
- explicit **Return to live Lot**;
- explicit **Open full Casting Room details**;
- inert world, recovery/migration siblings, and renderer input; and
- Escape owned only by the current dialog subtree.

At desktop it is a right-anchored surface no wider than `min(760px, 72vw)`, inset from the viewport,
with a bounded height near `88dvh`. Compact viewports may cover almost all pixels, but the exact Lot
remains mounted behind it. Header/identity, close/deep actions, error, candidate groups, consequence,
unique-person count, and submit remain reachable through one bounded scroll law.

Opening full details deliberately closes the retained session and navigates to the canonical
Casting Room with the exact project selected for planning and a selected-Casting Lot return
context. That explicit deep-management choice may use the existing remount law and cannot start a
session by itself.

## 11. Exact-once start and rejection

For submit, App must independently revalidate the current workspace identity, rendered state,
Lot Screen, presentation token, strict latest planning context, no conflicting owner, and every
explicit slate member. It then:

1. claims the exact session synchronously;
2. calls `startCastingSessionAction` once;
3. on rejection, releases only that current claim, keeps the same planner component and every
   explicit selection, records the exact workspace/state/revision/payload/error guard, shows the
   exact Engine error, and changes no state/save byte; or
4. on acceptance, validates one strict before/after session receipt before publishing a world
   witness.

A valid Engine successor is never rolled back because optional receipt presentation fails. In that
case App commits and autosaves the successor, closes later, and returns to neutral current Lot truth
without guessing a project, session, Actor, reservation, or result.

## 12. Strict accepted Casting-session receipt

The pure receipt selector must accept only an immediate transition where:

- before and after are distinct valid same-studio states at the same week/tick and RNG;
- operations, screenplay, Casting, and construction modes remain unchanged and managed;
- exactly one canonical Casting session was appended and every prior session is unchanged;
- every field outside `castingSessions` is unchanged;
- the new session owns the deterministic next canonical session ID;
- project ID and complete six-read slate equal the explicit submitted payload;
- the exact before-state project is the sole strict planning context;
- every selected ID was an available candidate for that exact role in the before context;
- each role has exactly two distinct IDs and the complete slate has at least three unique IDs;
- status is `auditioning`, `startedWeek` is current week, `dueWeek` is current week +1, and
  `results` is null; and
- reservation session ID, facility ID/name, capability, and zero-based slot equal the deterministic
  first free capacity slot from the strict before context.

The receipt contains at least session/project ID, title, started/due week, facility ID/name, slot,
and six exact `{ role, talentId, name }` read entries in canonical role/pair order. Cross-role
Talent-ID repetition that exactly matches the submitted slate is legal and must be preserved.
Malformed arrays, the same ID twice within one role, duplicate session/project identity,
duplicated/decorated receipt entries beyond the exact role/pair order, extra mutation, substituted
candidate, ambiguous name, same-state input, or throwing reads return `null`.

## 13. Autosave-ordered close

Accepted ordering is binding:

1. synchronously mark the exact workspace committed so the planner cannot redispatch;
2. advance App's latest-state ref and schedule the exact Engine successor;
3. keep a bounded noninteractive **recording camera tests** state;
4. let the established `[state]` autosave effect run for that exact successor;
5. in a later revalidated microtask/effect, close only that exact workspace; and
6. atomically publish at most one transient live receipt to the already-mounted Lot.

Close may not precede autosave invocation. Presentation failure cannot redispatch, roll back,
suppress the accepted save, or choose another session.

## 14. Exact world witness

The already-mounted Lot consumes a live receipt once only while its accepted-state object remains
current. The bounded semantic Casting witness must:

- keep or restore Casting as the current semantic owner without claiming a new physical Hollywood
  building, room, stage, route, Actor location, or camera target;
- show **CAMERA TESTS UNDERWAY**;
- name the exact screenplay;
- expose started and due weeks, exact facility, and one-based player-facing slot;
- list all six exact Lead/Antagonist/Support Actor reads without calling any one a winner;
- state that no Actor was hired, signed, held, paid, reserved, made busy, assigned, moved, or chosen
  by starting the session; and
- announce the same bounded facts once through the stable Lot activity channel.

Current GameState remains the durable source. If the exact accepted reservation owns the existing
physical Annex, the already-authorized Annex work projection may independently repaint it Working.
The base Development & Casting facility remains semantic. The transient receipt cannot create
physical occupancy or an Actor visit.

Invalid, stale, duplicate, replaced, or already-consumed receipts fail neutral and focus the stable
Lot heading without substitution.

## 15. Cancel, details, replacement, and teardown

Cancel changes no GameState or save bytes, closes only the exact editing session, and restores the
connected exact Casting opener after inert is removed, otherwise the stable Lot heading.

Open-details revalidates the same authority, clears the session, and uses the canonical Casting
Room route with the exact project. It cannot start camera tests.

Confirmed New Studio, accepted load/import, start load, whole-state replacement, screen change,
Lot unmount, renderer error-boundary replacement, and App teardown synchronously invalidate:

- the audition-planning workspace;
- its submit claim;
- pending autosave-ordered close;
- pending live receipt/focus; and
- held keyboard, pointer, touch, or virtual activation.

Rejected import or declined restart changes none of the current session. An old session cannot
mutate, close, announce, or focus a newer one.

## 16. Input, focus, visibility, and accessibility law

Pointer, mouse, touch, Enter, Space, held/repeat, cross-key, double-click, virtual-AT, neighboring
button, blur, cancel, hidden-tab, visibility, and compatibility tails produce at most one action
against one current owner.

The workspace must:

- trap Tab/Shift+Tab within the active dialog;
- keep background DOM and Phaser input inert;
- clear held activations when hidden, blurred, cancelled, replaced, or closed;
- use explicit labels for each role group, candidate, selection count, error, and consequence;
- expose `aria-pressed`/disabled state without color-only meaning;
- keep visible focus and minimum practical touch targets;
- restore focus only after inert is removed; and
- emit one success announcement, never an announcement on cancel or rejection.

## 17. Responsive, renderer, and performance boundary

Prove desktop, 960×540, actual page-scale 200%, and 480×270 CSS pixels at DSF2. The workspace must
have no page-level horizontal overflow or background scroll drift and remain operable with keyboard,
forced colors, grayscale meaning, and reduced motion.

Against the same fixture, before/open/cancel/accept must show unchanged:

```text
StudioLotScreen mounts
StudioLotView instances
canvas element identity
display objects
dynamic actors
decoded texture bytes
persistent renderer draws
camera
```

V1 adds no renderer object, actor, texture, route, tween, animation, particle, draw owner, or
per-frame simulation. Structural parity is not GPU/FPS certification. Do not run the exporter.

## 18. Save, simulation, content, and economy boundary

V1 is an App/planner-host/focus/presentation change. It changes no:

- Core action, GameState field, SaveFileV1–V11 schema, migration, import, or export law;
- screenplay, Casting eligibility, candidate, availability, Fit, slate, reservation, timing,
  result, review, package, greenlight, production, release, or outcome law;
- tick, RNG, cash, ledger, payroll, overhead, publicity, awareness/reach, or economy law;
- Hollywood scene, place, building, room, facility, route, actor, path, camera, authored/generated
  art, atlas, manifest, texture, or exporter; or
- Studio Calendar, construction, employment, contract, or market law.

It authorizes no audition fee, time advance, physical Hollywood Casting building/room/stage, Actor
travel/arrival/occupancy, queue, workload, hold, hiring/signing, assignment, winner, performed camera
test, autonomous work, relationship, fatigue, stress, or watched preparation.

## 19. Required automated proof

Keep eligibility requires at least:

1. exact current-break replay proves the existing 1/1/1 → 0/0/0 → replacement 1/1/1 path and
   action/save footprint before implementation;
2. strict complete-board selector acceptance plus malformed/sparse/extra/symbol/duplicate-record/
   throwing rejection;
3. exactly-one project gate, with zero/two projects and active/review/history cases routed deep;
4. canonical planner content, availability, stale selection, explicit slate, blockers, consequence,
   and standalone parity;
5. exact Lot/screen/token/view/canvas/camera identity across open/cancel/rejection/accept;
6. cancel exact save-byte neutrality and focus return;
7. one direct adapter call under duplicate/repeat/stale/input-tail attempts;
8. Engine rejection preserves exact state, bytes, component, error, and every selected Actor while
   identical same-revision tails do not redispatch and a genuine slate edit enables a fresh attempt;
9. accepted direct-action and SaveFileV11 byte parity;
10. strict receipt acceptance, legal cross-role Actor reuse, and extra-change/substitution/
    same-role-duplicate/duplicate-session/ambiguous-name rejection;
11. accepted successor → autosave invocation → close → one exact live Casting witness;
12. receipt mismatch keeps accepted state/save but exposes no guessed witness;
13. Package/Commission/Profile conflict, whole-state replacement, screen drift, Lot teardown,
    close/reopen, old callback, hidden-tab, and App-unmount containment;
14. pending Lot-native Casting review and active-session priority;
15. Operation-Hollywood-off managed, legacy, non-Lot, ambiguous-project, and blocked fallback;
16. keyboard/Escape/focus-trap/input-tail/accessibility behavior;
17. desktop/compact/actual-200%/forced-colors/reduced-motion behavior;
18. exact zero renderer-structure and protected art/manifest/exporter feature delta; and
19. focused, complete UI, complete repository, governed D-16/D-17, both TypeScript projects,
    production build, and `git diff --check` gates.

## 20. Required real-browser acceptance

Ordinary Chromium must prove:

1. Casting opens the one-project planner while Lot/mount/canvas remain **1/1/1** and captured nodes
   and renderer view are unchanged;
2. the Lot remains visible and actually inert behind the planner;
3. all candidate choices, counts, blockers, consequences, details, cancel, and submit are reachable;
4. cancel returns to exact bytes, canvas, camera, and opener;
5. rejection retains a deliberately edited six-read slate and exact error;
6. acceptance appends exactly one Auditioning session with direct saved parity and closes after save;
7. the same Lot shows the exact **CAMERA TESTS UNDERWAY** witness and six role reads;
8. the next existing Engine event reaches the accepted same-Lot Casting review → retained Package
   chain without duplicating planning authority;
9. full Casting Room details remains reachable and deliberately uses its deep-route return;
10. renderer delay/failure retains the complete semantic journey;
11. compact, actual-200%, forced-colors, and reduced-motion paths are operable; and
12. runtime errors, product warnings, and failed requests remain clean.

Capture and inspect the minimum screenshots needed to prove planner-over-world framing, compact
layout, cancel, exact accepted witness, and continuity into existing review.

## 21. Keep / Kill gate

**KEEP** only if an ordinary player can begin one unambiguous first Casting session, make the full
canonical six-read decision, and continue in the exact same visibly living Studio Lot without
authority drift, duplicate action, slate loss, implied winner, or reduced professional usability.

**KILL or narrow** if implementation remounts or duplicates the Lot; forks planner law; chooses a
first project; changes Core/save/economy law; leaks world input; closes before autosave; loses a
rejected slate; guesses a session/candidate/reservation; weakens accepted review/Package/Commission
routes; invents physical behavior; or conceals a failed responsive, accessibility, structural, or
browser gate.

## 22. Explicit non-goals and residuals

V1 does not authorize retaining the full Casting Room, activation, capacity overview, multiple
project selection, active/history/review management, Roster, Package, or every deep surface. It does
not add audition results, alter result generation, choose a winner, preselect cast, sign/hire/pay/
hold Actors, advance time, charge a fee, add film concepts, Actors, facilities, construction,
travel, occupancy, queue, workload, autoplay, speed controls, or a second clock.

It does not authorize an acquisition or option mechanic, financing, loans, bailouts,
restructuring, hard bankruptcy, the failure ladder, or an arbitrary cash sink.

The governing status remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5
dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth,
and formal G12 timing remain open.

## 23. Closure record requirement

If V1 passes Keep, create dedicated evidence and closure records; update `CURRENT-BEST.md`,
`NEXT-HIGHEST-LEVERAGE.md`, `PROGRESS.md`, `MARATHON-LOG.md`, `docs/HANDOFF.md`, and canonical
Lessons Learned; record exact implementation/browser/test/structural/protected-ref boundaries; and
promote the next world-first priority only after a fresh several-minutes-on-Lot audit.

If V1 fails Keep, record the Kill result and restore only the prior accepted behavior. Do not
weaken world continuity, authority, deterministic simulation, accessibility, or evidence gates to
force closure.
