# World-First Lot-Retained Screenplay Commission Workspace V1 Contract

Status: **FROZEN — BINDING IMPLEMENTATION AUTHORITY**

Date: 2026-08-15

Branch: `operation-hollywood-autonomous-marathon`

Implementation parent and accepted Lot-Retained Package & Greenlight closure:
`910ac51b2c89bc238274db979c75ae379b02f5b9`.

Contract authority: the documentation checkpoint containing this record; its commit SHA is
intentionally not guessed before that checkpoint exists.

Scope state: **BOUNDED IMPLEMENTATION FREEZE**

## 1. Governing authority

This contract follows:

- the Owner's binding ruling that **THE STUDIO LOT IS THE PRIMARY GAME SURFACE** and
  **MANAGEMENT UI SUPPORTS THE WORLD. IT DOES NOT REPLACE THE WORLD**;
- the ordinary loop
  `WORLD → INSPECT / ACT → DEEP PANEL IF NEEDED → RETURN TO THE SAME LIVE WORLD`;
- accepted Script Projects V1, Studio Home V1, Lot-Native Screenplay Review, Lot-Native Casting
  Review, and Lot-Retained Package & Greenlight authority;
- canonical `scriptProjectsBoard`, its complete commission read model, and
  `commissionScriptAction`;
- App ownership of the one current `GameState`, autosave, whole-state replacement, mounted-Lot
  presentation lifetime, navigation, modal state, and focus return; and
- Engine/GameState ownership of every screenplay, writer assignment, reservation, clock, money,
  RNG, save, and outcome fact.

This contract narrowly supersedes Script Projects V1's presentation statement that ordinary Lot
Development must always replace the Lot with the Writers' Room. The Writers' Room remains the deep
owner of review history, accepted projects, package and audition handoffs, and broad Development
management. Only the commission form's host changes in the governed path.

Protected authority remains:

- `main`: `33eb33ae307904aa3f00db20bc695e40bf46d1e4`;
- accepted D-17B: `35d42687a410a621becf1df35c75986657f8c44e`; and
- Operation Hollywood bridge: `623b8b2a80e9c6b85304eaa2a338b6045e8f6b21`.

No merge, push, tag, or protected-ref movement is authorized by this contract.

## 2. Measured world-first break

The current ordinary managed path is:

```text
LIVE LOT → DEVELOPMENT → App maps Lot assembly intent to WritersRoom
→ setScreen({ kind: 'writersRoom' })
→ STUDIO LOT / PHASER VIEW / CANVAS UNMOUNT
→ COMMISSION IN FULL-SCREEN WRITERS' ROOM
→ BACK → REPLACEMENT LOT / VIEW / CANVAS MOUNT
```

An in-app browser audit of `commission-seam-live-audit` measured:

- before Development: Lot/mount/canvas/Writers' Room = **1/1/1/0**;
- inside Writers' Room: **0/0/0/1**, with every captured world node disconnected;
- after Back: **1/1/1/0**, but Lot, mount, and canvas identities were all replacements;
- commission autosaved exactly one Week-0 Drafting project due Week 1 in
  `facility-development-casting`, slot 0;
- week, cash, ledger, RNG, productions, and tick did not change; and
- page and console errors were **0**.

The existing action is immediate. It charges no separate acquisition fee and advances no week.
Its only authoritative footprint is one managed screenplay project and exact shared-capacity
reservation. V1 repairs only the host-continuity break.

## 3. Binding player loop

```text
LIVE LOT → SELECT DEVELOPMENT
→ CANONICAL COMMISSION WORKSPACE OPENS ABOVE THE SAME MOUNTED LOT
→ CHOOSE CONCEPT / WRITER / SHAPE / AUDIENCE PROMISE
→ CANCEL: CLOSE → EXACT SAME LIVE LOT / CANVAS / CAMERA / STATE
→ REJECTION: KEEP WORKSPACE + COMPLETE DRAFT + EXACT ENGINE ERROR
→ ACCEPT: COMMIT EXACT ENGINE SUCCESSOR → AUTOSAVE
→ CLOSE WORKSPACE
→ SAME MOUNTED LOT KEEPS DEVELOPMENT SELECTED
→ SHOW EXACT SCREENPLAY COMMISSIONED WITNESS + WRITER / DUE WEEK / FACILITY / SLOT
→ CONTINUE LIVE LOT PLAY
```

The full Writers' Room remains one explicit supporting action from the workspace.

## 4. Hard scope narrowing

The retained path requires all of:

```text
Operation Hollywood enabled
+ mounted Studio Lot
+ exact active Lot presentation token
+ managed screenplay development
+ exact Development-origin assembly route
+ canonical `lotAttention.kind === 'idle'`
+ canonical `commission.canStart === true`
+ no Package workspace
+ no Talent Profile or other modal owner
+ no existing commission workspace
```

Operation Hollywood off keeps the existing full-screen Writers' Room path. Legacy screenplay mode
keeps the existing standalone Assembly path. Dashboard, Calendar, summaries, screenplay-review
details, Casting, package, audition, and other non-Lot origins remain unchanged.

A current pending screenplay review keeps the accepted Lot-native review priority and never opens
this form instead. Active work, a ready screenplay, constrained capacity, no writer, no concept, or
any other non-idle/non-startable Development state keeps the existing full Writers' Room route.
The shared form must still render canonical blockers correctly when independently used or when a
hostile/stale test boundary supplies them; it never invents a route around them.

## 5. Existing form and action authority

Implementation must extract and reuse the current canonical commission form. One shared component
must own:

- explicit concept ID and writer ID;
- opening, midpoint, and ending choices;
- intended audience segments;
- all three promise ranges built with canonical centers, widths, and `rangeFrom`;
- canonical blockers and consequence copy; and
- the sole **Commission screenplay** intent.

First concept and first available writer remain UI defaults only. They are never result authority.
The retained host may dispatch only `commissionScriptAction(renderedState, explicitPayload)`.

The standalone Writers' Room must keep the same form, legality, content, result, and errors. Its
submit order must no longer close before its accepted state has been reported.

## 6. Same-mounted world invariant

Open, cancel, rejection, accepted commit, autosave, close, and witness must retain exactly:

- one mounted `StudioLotScreen` component;
- one `StudioLotView` / Phaser presentation instance where available;
- one canvas DOM element;
- the same App-owned opaque Lot presentation token;
- the same `Screen` object with `kind: 'lot'`;
- the current camera and Lot-local selection/presentation memory; and
- one App/GameState authority tree.

No step may call `setScreen`, create a second Lot, remount the renderer, or fake continuity with an
equivalent replacement. World ambience may continue. Every background semantic and renderer input
is suspended while the dialog owns interaction.

## 7. App-owned commission session

One transient, non-serialized App session must capture at least:

- an opaque session identity and monotonic React key;
- the exact rendered `GameState` object;
- the exact current Lot `Screen` object;
- the exact Lot presentation token; and
- the exact connected Development opener when available.

The session has an editing owner and a synchronously claimed/committed owner. One gesture claim
must make double-click, repeat, cross-key, virtual-AT, and retained callbacks stale before a second
dispatch can occur.

Package, commission, and Talent Profile owners are mutually exclusive except that a canonical
Profile opened by an authorized future nested workflow may sit above its parent. V1 does not add
Profile controls to commission.

## 8. Exact open authority

App may open the workspace only after independently proving:

1. the route came from the currently mounted Lot;
2. the current state and screen are the objects rendered by that Lot;
3. the presentation token is still active;
4. Operation Hollywood and managed screenplay mode are current session gates;
5. `scriptProjectsBoard` returns `lotAttention.kind === 'idle'` and a canonically startable
   commission projection; and
6. no modal, retained Package, live-formation transition, or commission owner conflicts.

Opening stores the active element as the potential exact return target, selects no concept or
writer as authority, changes no state, and invokes no autosave.

## 9. Retained workspace presentation

The workspace is a substantial accessible dialog/sheet above the visible Lot, not a page route or
tiny popup. It must reuse the accepted retained-workspace containment law used by Package:

- one labelled modal owner and focus trap;
- one internal scroll owner;
- body/background scroll containment;
- no scrim-click cancellation;
- explicit **Return to live Lot**;
- explicit **Open full Writers' Room details**;
- inert world and renderer input; and
- Escape owned only by the current dialog subtree.

At desktop it is a right-anchored surface no wider than `min(760px, 72vw)`, inset from the viewport,
with a bounded height near `88dvh`. Compact viewports may cover almost all pixels, but the exact
Lot remains mounted behind it. Header/identity, close/deep actions, error, and submit remain
reachable through one bounded scroll law.

Opening full details deliberately closes the retained session and navigates to the canonical
Writers' Room with a selected-building Lot return context. That explicit deep-management choice
may use the existing remount law.

## 10. Exact-once commission and rejection

For submit, App must independently revalidate the current workspace identity, rendered state,
Lot screen, presentation token, no conflicting modal, and explicit payload. It then:

1. claims the exact session synchronously;
2. calls `commissionScriptAction` once;
3. on rejection, releases only that current claim, keeps the same form component and every draft
   field, shows the exact Engine error, and changes no state/save byte; or
4. on acceptance, validates one strict before/after commission receipt before publishing a world
   witness.

A valid Engine successor is never rolled back because optional receipt presentation fails. In that
case App commits and autosaves the successor, closes later, and returns to neutral current Lot
truth without guessing a project.

## 11. Strict accepted commission receipt

The pure receipt selector must accept only an immediate transition where:

- before and after are distinct valid same-studio states at the same tick and RNG;
- screenplay and operations modes remain managed;
- exactly one canonical project was appended and every prior project is unchanged;
- every field outside `scriptDevelopment.projects` is unchanged;
- the new project is `drafting`, rewrite count 0, commissioned at the current week, due week +1,
  with null assessment and production;
- its concept and writer match the explicit submitted IDs, and that writer was contracted and
  available in the before-state commission projection;
- its shape and promise match the explicit payload;
- it owns the exact deterministic first free Development & Casting facility/capability/slot from
  the canonical before-state capacity projection; and
- title, writer name, facility name, and IDs are unique and closed.

The receipt contains at least project ID, concept ID, title, writer ID/name, commissioned week, due
week, facility ID/name, and zero-based slot. Malformed arrays, duplicate IDs, same-title ambiguity,
extra mutation, substitution, or throwing reads return `null`.

## 12. Autosave-ordered close

Accepted ordering is binding:

1. synchronously mark the exact workspace committed so the form cannot redispatch;
2. advance App's latest-state ref and schedule the exact Engine successor;
3. keep a bounded noninteractive **recording commission** state;
4. let the established `[state]` autosave effect run for that exact successor;
5. in a later revalidated microtask/effect, close only that exact workspace; and
6. atomically publish at most one transient live receipt to the already-mounted Lot.

Close may not precede autosave invocation. Presentation failure cannot redispatch, roll back,
suppress the accepted save, or choose another screenplay.

## 13. Exact world witness

The already-mounted Lot consumes a live receipt once only when its accepted-state object remains
current. The bounded semantic Development witness must:

- keep or restore Development as the current semantic owner without claiming a new physical
  Hollywood building, route, occupancy, travel, or camera target;
- show **SCREENPLAY COMMISSIONED**;
- name the exact title and writer;
- expose commissioned and due weeks, facility, and one-based player-facing slot;
- announce the same facts once through the existing polite activity channel or one equivalent
  bounded live region; and
- retain current authoritative Lot attention, including a capacity warning that may now outrank
  an active-work label.

The transient receipt is UI memory only. Current GameState remains the durable source of the
project and reservation. Invalid, stale, duplicate, replaced, or already-consumed receipts fail
neutral and focus the stable Lot heading without substitution.

## 14. Cancel, details, replacement, and teardown

Cancel changes no GameState or save bytes, closes only the exact editing session, and restores the
connected exact Development opener after inert is removed, otherwise the stable Lot heading.

Open-details revalidates the same authority, clears the session, and uses the canonical Writers'
Room route. It cannot submit a commission.

Confirmed New Studio, accepted load/import, start load, whole-state replacement, screen change,
Lot unmount, renderer error-boundary replacement, and App teardown synchronously invalidate:

- the commission workspace;
- its submit claim;
- pending autosave-ordered close;
- pending live receipt/focus; and
- held keyboard, pointer, touch, or virtual activation.

Rejected import or declined restart changes none of the current session. An old session cannot
mutate, close, announce, or focus a newer one.

## 15. Input, focus, visibility, and accessibility law

Pointer, mouse, touch, Enter, Space, held/repeat, cross-key, double-click, virtual-AT, neighboring
button, blur, cancel, hidden-tab, visibility, and compatibility tails produce at most one action
against one current owner.

The workspace must:

- trap Tab/Shift+Tab within the active dialog;
- keep background DOM and Phaser input inert;
- clear held activations when hidden, blurred, cancelled, replaced, or closed;
- use explicit labels for every select, checkbox group, error, and consequence;
- keep visible focus and minimum practical touch targets;
- restore focus only after inert is removed; and
- emit one success announcement, never an announcement on cancel or rejection.

## 16. Responsive, renderer, and performance boundary

Prove desktop, 960×540, effective 200%, and 480×270 CSS pixels at DSF2. The workspace must have no
page-level horizontal overflow or background scroll drift and must remain operable with keyboard,
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

## 17. Save, simulation, content, and economy boundary

V1 is an App/form-host/focus/presentation change. It changes no:

- Core action, GameState field, SaveFileV1–V11 schema, migration, import, or export law;
- screenplay legality, capacity, writer availability, reservation, timing, assessment, package,
  casting, greenlight, production, release, or outcome law;
- tick, RNG, cash, ledger, payroll, overhead, publicity, awareness/reach, or economy law;
- Hollywood scene, place, building, facility, route, actor, path, camera, authored/generated art,
  atlas, manifest, texture, or exporter; or
- Studio Calendar, construction, employment, contract, or market law.

It authorizes no acquisition fee, week advance, physical Writers building claim, writer travel,
arrival, occupancy, queue, autonomous work, prose editor, relationship, fatigue, stress, or watched
preparation.

## 18. Required automated proof

Keep eligibility requires at least:

1. Development origin opens one workspace with exact Lot/screen/token/view/canvas/camera identity;
2. canonical commission projection, blockers, defaults, explicit payload, and standalone parity;
3. cancel exact save-byte neutrality and focus return;
4. one direct adapter call under duplicate/repeat/stale attempts;
5. Engine rejection preserves exact state, bytes, component, and every edited field;
6. accepted direct-action and SaveFileV11 byte parity;
7. strict receipt acceptance plus malformed/extra-change/same-title/duplicate-ID rejection;
8. accepted successor → autosave invocation → close → one live Development witness;
9. receipt mismatch keeps accepted state/save but exposes no guessed witness;
10. Package/Profile conflict, whole-state replacement, screen drift, Lot teardown, close/reopen,
    old callback, hidden-tab, and App-unmount containment;
11. pending Lot-native screenplay review priority;
12. Operation Hollywood-off managed and legacy rollback behavior;
13. keyboard/Escape/focus-trap/input-tail/accessibility behavior;
14. desktop/compact/effective-200%/forced-colors/reduced-motion behavior;
15. exact zero renderer-structure and protected art/manifest/exporter feature delta; and
16. focused, complete UI, complete repository, governed D-16/D-17, both TypeScript projects,
    production build, and `git diff --check` gates.

## 19. Required real-browser acceptance

Ordinary Chromium must prove:

1. Development opens commission while Lot/mount/canvas remain **1/1/1** and the captured canvas is
   the same node;
2. the Lot remains visible and actually inert behind the form;
3. all canonical choices, blockers, details escape hatch, cancel, and submit remain reachable;
4. cancel returns to exact bytes, canvas, camera, and opener;
5. acceptance creates exactly one Drafting project with direct saved parity and closes after save;
6. the same Lot shows the exact **SCREENPLAY COMMISSIONED** witness;
7. full Writers' Room details remains reachable and deliberately uses its deep-route return;
8. renderer delay/failure retains the complete semantic journey;
9. compact, effective-200%, forced-colors, and reduced-motion paths are operable; and
10. runtime errors, warnings, and failed requests remain clean.

Capture and inspect the minimum screenshots needed to prove form-over-world framing, compact layout,
cancel, and exact accepted witness.

## 20. Keep / Kill gate

**KEEP** only if an ordinary player can begin a managed screenplay from Development, make the full
canonical commission decision, and continue in the exact same visibly living Studio Lot without
authority drift, duplicate action, form loss, or reduced professional usability.

**KILL or narrow** if the implementation remounts or duplicates the Lot; forks the form; changes
Core/save/economy law; leaks world input; closes before autosave; loses rejection draft; guesses a
project/writer/reservation; weakens accepted review/Package routes; invents physical behavior; or
conceals a failed responsive, accessibility, structural, or browser gate.

## 21. Explicit non-goals and residuals

V1 does not authorize retaining the entire Writers' Room, Package from non-accepted origins,
auditions, screenplay review, Dashboard, Calendar, Hiring, or every deep surface. It does not add
film concepts, writers, facilities, screenplay prose, scoring, recommendations, construction,
travel, occupancy, background work, autoplay, speed controls, or a second clock.

It does not authorize an acquisition or option mechanic, financing, loans, bailouts,
restructuring, hard bankruptcy, the failure ladder, or an arbitrary cash sink. Acquisitions and
options remain open adjacent Script Projects research, not V1 implementation authority.

The governing status remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5
dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth,
and formal G12 timing remain open.

## 22. Closure record requirement

If V1 passes Keep, create dedicated evidence and closure records; update `CURRENT-BEST.md`,
`NEXT-HIGHEST-LEVERAGE.md`, `PROGRESS.md`, `MARATHON-LOG.md`, `docs/HANDOFF.md`, and canonical
Lessons Learned; record exact implementation/browser/test/structural/protected-ref boundaries; and
promote the next world-first priority only after a fresh several-minutes-on-Lot audit.

If V1 fails Keep, record the Kill result and restore only the prior accepted behavior. Do not
weaken world continuity, authority, deterministic simulation, accessibility, or evidence gates to
force closure.
