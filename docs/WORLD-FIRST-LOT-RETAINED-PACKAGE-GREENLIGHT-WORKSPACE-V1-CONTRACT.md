# World-First Lot-Retained Package & Greenlight Workspace V1 Contract

Status: **FROZEN — BINDING IMPLEMENTATION AUTHORITY**

Date: 2026-08-15

Branch: `operation-hollywood-autonomous-marathon`

Implementation parent and accepted Lot-Native Casting Review closure:
`5c6f7573c85498fde2ce17c39d7058e13e4fdd06`

Contract authority: the documentation checkpoint containing this record; its commit SHA is
intentionally not guessed before that checkpoint exists.

Scope state: **BOUNDED IMPLEMENTATION FREEZE**

## 1. Governing authority

This contract follows:

- the Owner's binding ruling that **THE STUDIO LOT IS THE PRIMARY GAME SURFACE** and
  **MANAGEMENT UI SUPPORTS THE WORLD. IT DOES NOT REPLACE THE WORLD**;
- the ordinary flow
  `WORLD → INSPECT / ACT → DEEP PANEL IF NEEDED → RETURN TO THE SAME LIVE WORLD`;
- accepted Lot-Native Casting Review corrected contract
  `d707f9878abdcd3a8d28ddb583a166ff3e911ff3`, implementation
  `cd0ace6213c88255439010ff284f390a538a6650`, and closure
  `5c6f7573c85498fde2ce17c39d7058e13e4fdd06`;
- accepted Greenlight Production Formation contract
  `6ec10a6`, implementation `345a89281ad1e89ac32f07082d4eb34ac664f280`, and closure
  `7966603ae8cc85702e10e10e8850f9481dd322b2`;
- canonical `Assembly`, `greenlightScriptProject`, `acceptedGreenlightFormationReceipt`, and the
  accepted production-formation/company projections;
- App ownership of the one current `GameState`, autosave, whole-state replacement, Lot
  presentation lifetime, modal state, and navigation; and
- Engine/GameState ownership of every package, greenlight, production, facility, money, ledger,
  time, RNG, save, and outcome result.

Protected authority remains:

- `main`: `33eb33ae307904aa3f00db20bc695e40bf46d1e4`;
- accepted D-17B: `35d42687a410a621becf1df35c75986657f8c44e`; and
- Operation Hollywood bridge: `623b8b2a80e9c6b85304eaa2a338b6045e8f6b21`.

No merge, push, tag, or protected-ref movement is authorized by this contract.

## 2. Measured world-first break

The accepted clear Casting-review path commits and autosaves the exact `review → complete`
successor before opening the exact screenplay Package. That authority and ordering are correct.
The host transition is not.

The current path is:

```text
LIVE LOT CASTING REVIEW
→ TAKE RESULTS TO PACKAGE
→ ACCEPT + AUTOSAVE EXACT CASTING SUCCESSOR
→ setScreen({ kind: 'assembly' })
→ STUDIO LOT / PHASER VIEW / CANVAS UNMOUNT
→ FULL-SCREEN PACKAGE ASSEMBLY
→ GREENLIGHT
→ FRESH LOT MOUNT + FORMATION RETURN
```

The canonical Package workflow is a legitimate deep management surface, but it replaces the
world instead of supporting it. This is the first adjacent violation after accepted Casting Review
of the Owner's continuous movie-production law.

The break was reproduced in the ordinary in-app browser from
`ui/e2e/lot-native-next-event-v1/casting-review.save.json`:

- Week 1 advanced to the exact Week 2 Casting review for **The Fading Constellation**;
- **Take results to Package** was the sole exact clear action;
- after activation, `studio-lot-screen` count was **0**;
- `studio-lot-canvas` count was **0**;
- `assembly-steps` count was **1**; and
- browser errors and warnings were **0**.

V1 repairs only this host-continuity break. It does not replace, simplify, or duplicate Package
Assembly and does not add simulation.

## 3. Binding player loop

```text
LIVE LOT → EXACT CASTING REVIEW → TAKE RESULTS TO PACKAGE
→ EXACT CASTING SUCCESSOR COMMITS + AUTOSAVES
→ CANONICAL PACKAGE WORKSPACE OPENS ABOVE THE SAME MOUNTED LOT
→ CHOOSE CAST / CREW / BUDGET / MARKETING WITH EXISTING PACKAGE LAW
→ CANCEL: CLOSE WORKSPACE → SAME LIVE LOT / CANVAS / CAMERA
→ REJECTION: KEEP WORKSPACE + DRAFT + EXACT ENGINE ERROR
→ ACCEPTED GREENLIGHT: COMMIT + AUTOSAVE EXACT SUCCESSOR
→ CLOSE WORKSPACE
→ SAME MOUNTED LOT PAINTS EXACT PICTURE FORMATION + COMPANY
→ CONTINUE LIVE LOT PLAY
```

The Lot remains the player's continuous home. Assembly remains the deep owner of decisions that
need its full information density.

## 4. Hard scope narrowing

The contracted primary path is only:

```text
Operation Hollywood enabled
+ mounted Studio Lot
+ exact accepted clear Lot-native Casting review successor
+ exact same-project openPackage authority
+ managed screenplay Package Assembly
```

Assembly opened from Dashboard, Writers’ Room, Casting Room, rollback/classic routes, or another
existing non-Lot owner may remain full-screen and retain its current return behavior. V1 creates no
general promise that every deep screen, release chain, or modal keeps the Lot mounted.

Blocked Casting acknowledgement remains in the same Lot under the accepted prior contract and
opens no Package workspace. A stale, malformed, replaced, or presentation-invalid clear handoff
remains neutral and opens no workspace.

## 5. Existing action and decision authority

Implementation must reuse, not copy:

- `acceptedLotCastingReviewSuccess` for the exact clear acknowledgement successor and project ID;
- canonical `Assembly` for package draft, cast/crew choices, budget, marketing, forecasts,
  assessments, profiles, Custom Talent, rejection, and review;
- `greenlightScriptProject` as the sole managed greenlight mutation;
- `acceptedGreenlightFormationReceipt` as the strict accepted before/after identity proof;
- App's one latest state, established autosave effect, opaque mounted-Lot presentation token, and
  whole-state replacement boundary; and
- `productionFormationContext`, complete-company projection, and Role Atlas presentation for the
  accepted successor.

The workspace may emit no new package or production action. It may not auto-select audition
evidence, infer a winner, recommend or rank a cast, prefill a person, change package legality, or
perform greenlight on open.

## 6. Same-mounted world invariant

From accepted clear Casting acknowledgement through Package open, cancel, rejection, nested
profile/creator work, and accepted greenlight formation, the contracted path must retain exactly:

- one mounted `StudioLotScreen` component;
- one `StudioLotView` / Phaser presentation instance where the renderer is available;
- one canvas element;
- the same App-owned opaque Lot presentation token;
- the same current screen object and `kind: 'lot'` root;
- the current Lot camera and local world selection/presentation state; and
- one App/GameState authority tree.

Opening or closing the workspace must not call `setScreen`, create a second Lot/App tree, remount
the Lot, reconstruct the renderer, or fake continuity with a visually equivalent replacement.

Renderer animation/ambience may continue. World input, semantic controls, pan, zoom, week advance,
next-event actions, building/person actions, and renderer pointer handling must be suspended for
the entire workspace lifetime.

## 7. App-owned workspace session

One transient App-owned session must capture at least:

- the exact mounted Lot screen object;
- the exact opaque Lot presentation token;
- the exact accepted Casting successor object;
- exact screenplay project ID;
- the accepted Lot return context; and
- one opaque workspace identity used to reject retained callbacks from an older workspace.

The session is UI memory only. It is not serialized or added to GameState/SaveFile.

The workspace may remain valid across only the existing state transitions it owns:

- accepted Custom Talent creation reported by the still-current canonical Assembly; and
- accepted greenlight reported by that same current Assembly/session.

Any screen change, accepted whole-studio replacement, Lot presentation replacement/unmount,
project disappearance, rejected exact join, or explicit close clears the session. A callback from
an old close, profile, creator, or greenlight owner cannot close, mutate, or focus a newer session.

## 8. Exact open and autosave ordering

The accepted Casting path remains:

1. capture and revalidate the complete current Casting review/action/receipt;
2. dispatch `acknowledgeCastingSessionAction` exactly once;
3. accept the exact `review → complete` successor in the same mounted Lot;
4. let the established autosave effect be invoked for that exact successor;
5. in a later effect/microtask, re-prove the same state, screen, presentation token, clear
   `acceptedLotCastingReviewSuccess`, and exact project; and
6. open one canonical Package workspace without changing `screen`.

Replacement, unmount, screen drift, modal conflict, or failed strict proof in that boundary keeps
the valid Casting successor/autosave but cancels only the optional workspace open.

At the first workspace render, exact title/project and the existing Casting handoff announcement
must remain. The current canonical Cast & crew step owns focus. No intermediate blank or managed-
screenplay gate may flash.

## 9. Canonical Package workspace

The workspace must render the existing `Assembly`, including:

- the complete Casting evidence carried into Assembly;
- existing blank cast/crew draft and no audition preselection;
- existing candidate pools, sorting, filters, profiles, details, and availability truth;
- existing Production/Craft requirement;
- existing Budget & Forecast and Review steps;
- existing marketing menu, cost, forecast, solvency, and blocker truth;
- existing Custom Talent in-place flow with draft preservation;
- exact rejection behavior and retry rules; and
- the existing sole **Greenlight this film** action.

It must be a large supporting dialog/sheet, not a tiny popup. It must preserve full decision space
while leaving enough of the Lot visible at ordinary desktop sizes to communicate continuous place.
At compact sizes it may become effectively full-viewport, but the same Lot remains mounted behind
it.

At viewports at least 1200 CSS pixels wide, the governed default is a right-anchored workspace no
wider than `min(1120px, 82vw)`, inset 24–32 CSS pixels from the viewport edges, with a maximum
height near `88dvh`. Smaller viewports may reduce the inset to 16 CSS pixels and then 8 CSS pixels.
A 0.35–0.45 neutral scrim may separate decisions from the world without hiding the studio's
continued presence. The workspace belongs below the existing Talent Profile modal in the modal
stack, uses one internal scroll owner, and keeps its identity/header and explicit close/primary
action region persistently reachable. Clicking the scrim is not a cancel action.

Assembly's step focus/scroll law must target the workspace scroll owner. It must not call
`window.scrollTo` in a way that moves the background Lot.

The embedded Assembly and its in-place Talent Creator must use workspace presentation chrome;
they may not introduce a second application shell, global top bar, full-screen background, or
independent page scroll owner. This is a presentation adapter only: the canonical controls,
content, decision sequence, and state authority remain shared with standalone Assembly.

## 10. Cancel and Engine rejection

Explicit Package cancel/back:

- changes no GameState or save bytes;
- closes only the exact current workspace session;
- returns to the same Lot component, canvas, renderer, camera, and committed Casting successor;
- restores the connected exact opener when possible, otherwise the stable Lot heading; and
- does not replay the consumed Casting receipt or substitute a later review.

An Engine-rejected greenlight:

- changes no state or save bytes;
- keeps the same workspace and complete package draft mounted;
- presents the existing exact error/focus path;
- releases only the existing bounded greenlight gesture latch when current package/state may
  legally retry; and
- does not expose a formation witness or disturb the world behind the workspace.

## 11. Custom Talent and nested profile boundary

Canonical Custom Talent remains in place inside Assembly. Its accepted state update may pass only
while the exact workspace, Lot screen, presentation token, and rendered before-state remain
current. It must:

- update and autosave the one App state;
- keep `StudioLotScreen`, renderer, canvas, camera, workspace, Assembly component, step, and package
  draft mounted; and
- return to the same package step under existing Talent Creator law.

The canonical Talent Profile may open above the workspace. While it is open:

- the Lot remains inert from the workspace;
- the Package workspace itself becomes inert;
- the Profile is the sole active modal/focus owner;
- closing it restores the connected Package opener after inert state is removed; and
- no underlying held key, pointer, or compatibility-click tail may activate Package or world UI.

No duplicate profile or creator implementation is authorized.

As bounded accessibility maintenance required to expose the existing canonical workflow, every
Talent-picker select in this path must have an explicit accessible name and the active Package
progress step must expose `aria-current="step"`. These annotations may be shared with standalone
Assembly and change no behavior.

## 12. Accepted greenlight and autosave-ordered close

On canonical Assembly success, App must independently require:

- the exact current workspace identity;
- the exact current Lot screen and presentation token;
- the exact `GameState` object rendered into that Assembly;
- no conflicting profile modal;
- one exact App recomputation of `acceptedGreenlightFormationReceipt`; and
- exact field equality with Assembly's nullable receipt when the special formation path is used.

If the before-state is stale, App accepts no successor. If the Engine successor is valid but
receipt comparison fails, App may retain the existing accepted-generic-success behavior: commit
and autosave the successor, close the workspace, and return to neutral current Lot truth without
guessing a picture.

For an exact formation:

1. synchronously advance App's latest-state ref and schedule the exact Engine successor;
2. keep a bounded noninteractive **committing** workspace state so the now-In-Production
   screenplay cannot flash the managed Assembly gate before close;
3. let the established autosave effect be invoked for that exact successor;
4. in a later revalidated effect, close the exact workspace; and
5. deliver the exact formation receipt to the already-mounted `StudioLotScreen` through one
   transient live input that changes no `Screen` identity or Lot presentation token.

Presentation failure after Engine acceptance cannot roll back state, suppress autosave, redispatch,
or select another production.

## 13. Live formation in the existing Lot

The accepted production-formation selector and presentation remain authoritative. V1 adds only a
bounded live receipt input to the already-mounted Lot.

The Lot must consume each live receipt once and run the same strict formation entry logic already
used by the accepted mount-oriented return. It must:

- select the exact new production and exact Director;
- keep the exact Lead and complete company visible/selectable;
- expose exact title, Development phase, reservation, status, and countdown;
- show the existing one-shot **PICTURE FORMED** witness and announcement;
- retain the same canvas/view/camera; and
- fail neutral without selecting a different operation/person when strict context is absent.

The live receipt is transient App/UI memory, not persisted truth. Renderer delay/failure cannot
remove the complete semantic formation. Renderer recovery may paint only fresh exact current
formation truth and may not replay the announcement.

## 14. Replacement, stale callback, and teardown law

Confirmed New Studio, accepted Saves/import, accepted Start load, or any equivalent whole-state
replacement must synchronously clear:

- pending Casting-to-Package handoff;
- current Package workspace identity;
- pending workspace state transition or greenlight close;
- pending live formation receipt/focus; and
- every held workspace/input activation.

Rejected import or declined restart changes none of the current session.

Screen navigation or Lot teardown clears the same transients before a retained callback can run.
Unmount/error-boundary cleanup must invalidate the opaque presentation/session. No seed, title,
project ID, same-week production ID, array position, or first/last match may substitute for object
and closed-field authority.

## 15. Input, focus, modal, and visibility law

The workspace is an accessible modal dialog/sheet with one labelled owner, one bounded focus trap,
and explicit cancel. Pointer, mouse, touch, Enter, Space, double-click, held/repeat, cross-key,
virtual-AT, neighboring-button transition, blur, cancel, hidden-tab, nested-modal, and compatibility
tails must produce at most one action against one current owner.

Requirements:

- native Package controls remain the action owners;
- background Lot and renderer input are inert, not merely visually covered;
- the workspace traps focus without stealing it from a nested Talent Profile;
- Escape is handled only inside the active dialog subtree and closes only the topmost current
  modal owner; it is not a document-global shortcut while focus is elsewhere;
- close restores the exact connected Casting-complete opener when it still belongs to the retained
  presentation, otherwise the stable Lot heading; accepted greenlight restores the exact connected
  Lot/formation focus target selected by the existing formation law, otherwise that same heading;
- hidden/visibility change cannot preserve a held activation into a new owner; and
- one polite Casting handoff and one accepted formation announcement occur without duplication.

## 16. Responsive and visual gate

Prove ordinary desktop, 960×540, effective 200%, and 480×270 CSS pixels at DSF2.

The Package workspace must:

- remain recognizably a substantial management workspace rather than a cramped popup;
- use one bounded internal vertical scroll owner;
- keep its header and action region sticky or equivalently persistently reachable, including the
  active step, current primary action, and explicit close path;
- contain long Casting evidence, candidate cards, filters, forecasts, errors, and package summaries;
- create no page-level horizontal overflow or background-page scroll drift;
- preserve minimum touch targets, visible focus, forced-colors readability, grayscale meaning, and
  reduced-motion neutrality; and
- leave the Lot visibly present around/behind the workspace where viewport space permits.

At desktop, screenshots must make it immediately clear that Package work is happening inside the
same studio place. At compact sizes, semantic proof of the still-mounted Lot/canvas remains required
even when the workspace necessarily covers most pixels.

## 17. Renderer, structure, and performance boundary

The workspace is DOM presentation. It adds no renderer object, actor, texture, route, tween,
animation, particle, draw owner, or per-frame simulation.

Against the same clear-Casting fixture, prove before/open/cancel/greenlight:

```text
StudioLotScreen mounts: unchanged
StudioLotView instances: unchanged
canvas element identity: unchanged
display objects: unchanged
dynamic actors: unchanged
decoded texture bytes: unchanged
persistent renderer draws: unchanged
camera: unchanged across open/cancel and retained through accepted formation
```

The governed one-production formation structural tuple remains the accepted reference; record the
exact measured fixture rather than inventing a universal maximum. Structural parity is not GPU/FPS
certification. Existing opt-in wall-clock thresholds remain unchanged and may be claimed only when
the governed evidence mode actually executes.

No source/runtime manifest, exporter, authored art, atlas, texture, or accepted place may change.
Do not run the exporter.

## 18. Save, simulation, content, and economy boundary

V1 is an intended App/Lot interaction, modal-host, navigation, focus, and presentation change. It
adds no Core action and changes no:

- GameState or SaveFileV1–V11 field, schema, migration, import, export, or persistence law;
- Casting observation, acknowledgement, package availability, action label, screenplay, package,
  greenlight, assignment, staffing, facility, capacity, production, release, or outcome law;
- tick, clock, RNG, money, ledger, payroll, overhead, publicity, awareness/reach, or economy law;
- authored/generated art, manifest, exporter, texture, Place, building, route, actor, animation,
  draw owner, renderer clock, or district geometry; or
- Studio Calendar, facility reservation, construction, employment, contract, or market law.

It authorizes no performed audition, inferred winner, automatic cast, background simulation while
the workspace is open, personal travel/location, arrival, occupancy, queue, workload, stress,
fatigue, relationships, needs, autonomy, pathfinding, character control, or watched preparation.

## 19. Required automated proof

Implementation is not Keep-eligible without at least:

1. exact clear Casting successor → autosave invocation → one workspace open with the same Lot,
   view, canvas, camera, screen, and presentation token;
2. blocked Casting successor remains unchanged under the prior same-Lot law;
3. canonical project/evidence focus and no audition preselection;
4. cancel byte neutrality, same element/view/camera identity, exact focus return, and no receipt
   replay;
5. Engine rejection keeps exact state/save/workspace/draft and permits only a legal fresh retry;
6. accepted greenlight direct-action and SaveFileV11 byte parity;
7. accepted successor → autosave invocation → workspace close → exact live formation without a Lot
   screen/token/view/canvas replacement;
8. receipt mismatch preserves valid Engine success but produces only neutral Lot truth;
9. same-title, same-week, multiple-production, duplicate/malformed identity, stale callback,
   close/reopen, and no-substitution cases;
10. whole-studio replacement, screen drift, Lot teardown, renderer recreation/failure, and App
    unmount containment;
11. Custom Talent accepted update keeps workspace, Assembly draft, Lot, view, canvas, and camera;
12. nested Talent Profile inert/focus behavior and no input leakage;
13. step focus and workspace-local scrolling with no `window`/background drift;
14. pointer/mouse/touch/keyboard/repeat/cross-key/virtual-AT/visibility input containment;
15. desktop/960×540/effective-200%/480×270-DSF2, forced-colors, grayscale, and reduced-motion
    behavior;
16. exact zero renderer-structure feature delta and unchanged protected art/manifest/exporter
    paths; and
17. focused, complete UI, complete repository, governed D-16/D-17, both TypeScript projects,
    production build, and `git diff --check` gates.

## 20. Required real-browser acceptance

At minimum, ordinary Chromium must prove:

1. the exact Week 1→2 Casting fixture opens Package while Lot/canvas counts remain **1/1** and
   Assembly count becomes **1**;
2. DOM element identity and renderer construction/destruction telemetry prove no remount;
3. the Lot remains visible behind the large workspace and is actually inert;
4. Package heading, all steps, Casting evidence, candidate choices, Custom Talent, profile, close,
   and primary action remain reachable;
5. cancel returns to the same canvas/camera and exact committed Casting state;
6. a rejected greenlight keeps the same draft/workspace and exact bytes;
7. an accepted greenlight saves exact parity, closes later than autosave, and paints the exact
   picture/Director/Lead/company in that same canvas;
8. renderer failure retains the semantic Package and formation journey;
9. compact, effective-200%, forced-colors, and reduced-motion paths remain operable; and
10. runtime errors, warnings, and failed requests remain clean.

Capture and visually inspect the minimum screenshots needed to prove Package-over-world framing,
nested Profile, compact layout, cancellation, and exact same-canvas formation.

## 21. Keep / Kill gate

**KEEP** only if an ordinary player can carry exact Casting evidence into canonical Package work,
cancel or greenlight, and continue in the same visibly living Studio Lot without losing package
depth, authority, deterministic behavior, or professional usability.

**KILL or narrow** if the implementation:

- remounts or duplicates the Lot, renderer, canvas, App tree, or presentation token;
- compresses Package Assembly into an inadequate small popup or hides required evidence/actions;
- lets background world input leak through the workspace;
- loses Assembly draft, Custom Talent, Profile, rejection, or retry behavior;
- closes before the accepted successor's established autosave invocation;
- flashes invalid managed-package state after accepted greenlight;
- guesses or substitutes a screenplay, cast member, production, Director, Lead, or company;
- invents a winner, recommendation, background work, travel, occupancy, facility, art, or Engine
  behavior;
- changes Core/save/economy/package/greenlight/production law; or
- conceals a failed responsive, accessibility, structural, or browser gate.

## 22. Explicit non-goals and open residuals

V1 does not authorize:

- making Dashboard/Writers/Casting Room/release/Autopsy or every deep surface same-mounted;
- new package, cancellation, cast, crew, budget, marketing, greenlight, or production choices;
- a physical Hollywood Casting or Writers building, physical Soundstage 12, or new facility;
- preparation, rehearsal, shooting, Post, release, publicity, travel, queue, occupancy, or worker
  spectacle beyond current truth;
- autoplay, speed controls, a second clock, background simulation, or renderer-owned results;
- facility catalogue, placement, upgrade, demolition, maintenance, second Annex, or fourth slot;
- any SaveFileV12 or migration; or
- financing, loans, bailouts, restructuring, hard bankruptcy, failure ladder, or arbitrary cash
  sink.

The governing status remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5
dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth,
and formal G12 timing remain open.

## 23. Closure record requirement

If V1 passes Keep:

- create dedicated evidence and closure records;
- update `CURRENT-BEST.md`, `NEXT-HIGHEST-LEVERAGE.md`, `PROGRESS.md`, `MARATHON-LOG.md`,
  `docs/HANDOFF.md`, and canonical Lessons Learned;
- record exact contract, implementation, browser, test, structural, protected-ref, and publication
  boundaries;
- preserve every D-17B residual exactly; and
- promote the next world-first priority only after a fresh several-minutes-on-Lot audit.

If V1 fails Keep, record the Kill result and restore only the prior accepted behavior. Do not
weaken world continuity, identity, authority, Package depth, accessibility, or evidence gates to
force closure.
