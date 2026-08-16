# Project: Studio — Current Best

Updated: 2026-08-16

Branch: `operation-hollywood-autonomous-marathon`

Current accepted milestone: World-First Lot-Retained Audition Planning Workspace V1, closed by
this documentation checkpoint

Current accepted behavior authority: `e6426fcff8fec0744f9ce1bc9fe88f8d09d94ff9`

Primary implementation authority: `e6426fcff8fec0744f9ce1bc9fe88f8d09d94ff9`

Current frozen successor: none. The autonomous marathon is sealed. Any successor requires fresh
Owner authorization and a separately frozen evidence/authority boundary.

## Product doctrine — World First

**THE STUDIO LOT IS THE PRIMARY GAME SURFACE.**

Project: Studio is structurally closer to *The Movies*, *Zoo Tycoon*, *RollerCoaster Tycoon*, and
*The Sims* than to a screen-first sports-management application with a separate 3D visualization.
The player should spend most ordinary play inhabiting, watching, and manipulating a living studio.

The default interaction grammar is:

```text
WORLD → INSPECT / ACT → DEEP PANEL IF NEEDED → RETURN TO THE SAME LIVE WORLD
```

“Same live world” always means the same authoritative studio and explicit Lot root. Most standalone
deep screens still unmount the Lot and remount one Phaser view on return, so they do not promise
camera or general selection continuity. The accepted retained Package, Commission, and Audition
Planning paths are deliberately stronger: their exact Lot Screen, presentation token, Phaser view,
canvas, camera, and local world memory stay mounted while canonical management works above them.

Dashboard, Assembly, Production Board, Calendar, Roster, Hiring, Finance, Film Autopsy, Chronicle,
Writers Room, Casting Room, and Studio Development remain valuable. Do not delete or trivialize
them. They are deep management surfaces for information and decisions too complex to express
spatially. They support the world; they do not replace it. Where technically appropriate, the
studio may remain alive behind or around them. Standalone deep owners return to the same
authoritative Lot root with bounded context restoration; retained Package, Commission, and
Audition Planning prove three narrow exact same-instance workspaces. Neither behavior is a general
persistent-shell claim for every screen.

### Critical experience test

A player must be able to spend several meaningful minutes without leaving the Studio Lot:

1. select a real production and inspect its stage;
2. see a real blockage and click it;
3. redirect or assign a real named person;
4. watch that person travel and the facility become occupied;
5. see authoritative work resume;
6. inspect another inhabitant and their current job/destination/workload;
7. initiate or inspect real construction;
8. observe another production or studio event; and
9. react from the world.

If the lot merely displays outcomes decided elsewhere, the product direction is wrong.

### Authority boundary

Engine/GameState still owns every result, action legality, task, clock, reservation, facility state,
economy fact, and random draw. The world renders that truth and emits player intent. Presentation
movement is evidence of work, never the authoritative work itself. Do not add a second simulation,
unrestricted Sims autonomy, per-frame authoritative positions, or a character-control game.

Named people must increasingly exist first as inhabitants. Their current job, destination,
workload, relationships/stress/fatigue where implemented, career state, and production involvement
need visible world consequences, including real queues and bottlenecks. Buildings must expose real
idle, occupied, reserved, blocked, under-construction, working, upgrading, producing, and
unavailable states as those states become authoritative; they are not decorative buttons. Clicking
a physical building should inspect or act in world first, then open its supporting deep panel when
the decision needs more room.

Movie production must increasingly form in the lot: greenlight leads to visible preparation,
people/resource movement, facility reservation and occupation, scenery arrival and loading,
rehearsal, shooting, visible problems and intervention, Post, release, and publicity. The primary
experience must not collapse into `greenlight → abstract production screen → completion → return
to lot`.

The accepted Active Production Company slice now applies that doctrine to existing picture truth.
Every legal managed picture exposes its exact Writer, Director, Lead, Antagonist, Support, and
Production/Craft Lead as selectable named inhabitants; two pictures remain present and switch by
exact production ID. A strict all-or-nothing authority gate withholds malformed or ambiguous
company claims. This is still presentation, not people simulation, personal location, a company
facility, route, queue, workload, or new art authority. Generic `director`/`talent` atlas categories
remain presentation roles and exact role-on-picture remains textual.

The accepted Lot-Native Screenplay Review slice now applies the same doctrine to the first
authoritative production decision that previously forced the player into a menu. A newly surfaced
or already-pending review exposes its exact player-safe `Est.` assessment and current legal Accept
or Rewrite actions in the living Lot, then repaints the exact Engine successor without unmounting
the world. Writers’ Room remains an optional deep owner. Development/Writers remains semantic;
this milestone does not invent a physical room, writer travel, human occupancy, or screenplay law.

The accepted Lot-Native Casting Review slice carries the next forced production decision into that
same world. A newly surfaced or already-pending review exposes all six exact persisted Lead,
Antagonist, and Support audition observations plus the sole Core acknowledgement in the living Lot.
A blocked successor stays on the same mounted Lot with exact remedy truth; a clear successor is
autosaved before one exact retained Package handoff. Casting Room remains optional supporting depth.
Hollywood Casting remains semantic; Classic retains its established physical Casting selection.

The accepted Lot-Retained Package slice then keeps that complete decision chain in one studio
place. Canonical Assembly opens as a large supporting workspace over the same mounted Lot, retains
all company/budget/marketing/Profile/Custom Talent depth, and leaves the world visible but inert.
Cancel is byte-neutral. Accepted greenlight remains covered through autosave, then the same canvas
paints the exact formed picture, Director, Lead, and complete company. This is not a general claim
that every deep screen is retained.

The accepted Lot-Retained Screenplay Commission slice closes the start of that chain. Selecting
Development while canonical start truth is idle opens the one shared concept/writer/shape/audience
form over the exact same Lot. Cancel is byte-neutral; rejection preserves the complete draft; and
acceptance commits plus autosaves one exact Drafting project before the same canvas names its
writer, due week, facility, and slot. Writers' Room remains explicit supporting depth. Hollywood
Development remains semantic; no physical Writers building, writer travel, occupancy, queue, or
new screenplay law is claimed.

The accepted Lot-Retained Audition Planning slice keeps the next upstream decision in that same
world. When the complete canonical Casting board proves exactly one legally plannable Ready
screenplay, the shared six-read slate planner opens over the exact mounted Lot. Cancel is
byte-neutral; rejection preserves the complete slate and exact error; acceptance commits plus
autosaves one exact Auditioning session before the same canvas shows **CAMERA TESTS UNDERWAY**,
due/facility/slot truth, and all six reads. Casting Room remains explicit supporting depth.
Hollywood Casting remains semantic; no winner, hire, hold, payment, actor travel, occupancy,
queue, performed audition, or physical Casting building is claimed.

Pan, zoom, selection, management-scale legibility, human-story-scale discovery, and Operation
Hollywood visual quality are protected. Zoom should change which story the player notices, not
whether the game remains playable.

## Current playable game

- Accepted D-17B engaged publicity, awareness/reach, marketing menu, SaveFileV7 persistence, and
  BALANCED discoverability are integrated with the Hollywood presentation.
- Managed Production Operations moves real films through Development, Pre-production, Rehearsal,
  Shooting, Post-production, and Release Ready with authoritative facilities, reservations,
  director assignment, scenery/shooting blockers, SaveFileV8, and six-week theatrical truth.
- Persistent Script Projects and Casting Sessions occupy shared Development & Casting capacity and
  persist through SaveFileV9/V10.
- Studio Calendar composes exact decisions, current occupancy, committed events, conditional
  production outlook, theatrical receipts, and staffing boundaries without owning a second clock.
- The non-stackable Development & Casting Annex is a real $780,000, 13-week, SaveFileV11
  construction lifecycle that adds one supported shared slot at completion.
- Film Chronicle makes each eligible released picture a durable creative and production artifact.
- Operation Hollywood provides the premium persistent district, real selection and place hotspots,
  authoritative Stage 7 and Annex states, publicity, depth-crossing people, semantic navigation,
  deterministic role-atlas inhabitants, pan/zoom, and accessible DOM companions.
- World-First Soundstage Intervention V1 makes the physical Stage 7 polygon, lamp/status, visible
  problem, and semantic Stage A control select the exact real film and reuse its authoritative
  shooting command chain while the player remains on the live lot.
- World-First Live Week Advance V1 lets the player invoke one existing App-owned Engine week from
  the lot, keep no-release truth in the same mounted world, and return there through governed
  Newspaper, ReleaseResult, and Autopsy chains when a real release requires deeper presentation.
- World-First Annex Construction Interaction V1 makes the physical Annex parcel and its semantic
  companion select exact construction truth in the living lot, dispatch the existing App-owned
  start action, and retain that same selected world context through Building and Operational.
- World-First Scenery Load-In V1 makes the physical Scenery & Service yard, marker, production
  blocker, and native semantic control select one exact Stage 7 load-in context; accepted Clear
  produces immediate ready truth plus bounded world acknowledgement, and Schedule remains legal
  while that acknowledgement is moving.
- World-First Studio Home V1 makes the adopted Hollywood Lot the default operating-studio home after
  founding, recovery, and accepted load; Dashboard remains an explicit supporting destination and
  typed root context returns bounded deep/release/Chronicle paths to their exact Lot or Dashboard
  owner.
- World-First Named Person Work & Career Inspector V1 makes an exact visible Director or Lead a
  truthful world inhabitant: Lot selection exposes existing work, production, assignment, and
  career identity, then opens the one canonical Talent Profile over the same mounted live renderer.
- World-First Publicity Campaign V1 makes the physical Administration & Publicity building the
  primary exact three-tier campaign surface: one purchase repaints cash, Awareness, ledger, and
  cooldown truth in the same mounted Lot, with Dashboard retained as a bounded details handoff.
- World-First Operational Annex Work Presence V1 makes the completed physical Annex visibly
  Available or Working from exact Calendar 0/1 or 1/1 truth, exposes its exact owner/title/activity,
  and returns from its focused deep owner to freshly revalidated Annex context.
- World-First Selected Stage 7 Production Detail Handoff & Fresh Return V1 makes explicit physical
  or semantic Stage 7 inspection the only gateway to the exact current Production Board card;
  existing world commands remain primary and direct Back returns to fresh exact Stage 7 truth or a
  neutral Lot without substituting another film.
- World-First Studio Gate Talent Arrival & Hiring Return V1 makes the accepted physical Gate the
  primary neutral arrival slate: explicit selection embodies one exact current free-agent visitor,
  supports canonical profile/complete Hiring terms, and returns to fresh exact or neutral Gate
  truth without defaulting, substituting, or bypassing existing contract law.
- World-First Greenlight Production Formation & Fresh Lot Return V1 carries one accepted exact
  Assembly transition back into the living Lot, frames its exact Director, keeps its Lead visible,
  and follows the same picture through mounted Development, Pre-production, and Rehearsal repaint.
- World-First Lot-Native Next-Event Cadence & Reaction V1 lets the player wait for the next existing
  authoritative interruption from the living Lot, retain every non-release result on the same
  mounted world and camera, react through an exact-or-neutral rail, and use an exact supporting
  owner only when the action needs deeper space. Real releases retain their established deep chain.
- World-First Active Production Company Presence & Picture Switching V1 embodies the complete
  six-person company for each legal managed picture, keeps both companies present, selects exact
  people and picture roles, switches by production ID, and removes released company presence
  without inventing personal location, work, movement, or staffing law.
- World-First Lot-Native Screenplay Review Intervention V1 lets a player resolve a newly surfaced
  or already-pending exact screenplay review from Development in the same mounted Lot, using only
  Core-emitted Accept/Rewrite actions; Writers’ Room remains an optional exact deep handoff.
- World-First Lot-Native Casting Review Intervention V1 lets a player review all six exact persisted
  audition observations and acknowledge the sole current decision in the same mounted Lot; blocked
  successors stay in world and clear successors autosave before the exact Package handoff.
- World-First Lot-Retained Package & Greenlight Workspace V1 keeps canonical Assembly over that
  same mounted Lot, preserves exact cancel/Profile/Custom Talent/Engine-rejection behavior, and
  commits plus autosaves greenlight before one live formation receipt paints the exact picture and
  company in the same canvas.
- World-First Lot-Retained Screenplay Commission Workspace V1 keeps the canonical commission form
  over that same mounted Lot, preserves exact cancel/rejection/standalone behavior, and commits plus
  autosaves one exact Drafting project before a one-shot Development witness names its writer,
  weeks, facility, and slot.
- World-First Lot-Retained Audition Planning Workspace V1 keeps the canonical six-read planner over
  that same mounted Lot for one uniquely eligible Ready screenplay, preserves exact cancel,
  rejection, revision, and standalone behavior, and commits plus autosaves one exact Auditioning
  session before a one-shot Casting witness names its due week, facility, slot, and six reads.

## Current world-first checkpoint

World-First Lot-Retained Audition Planning Workspace V1 is accepted under frozen contract
`d94dd4714ab6ee8e0666afba3aae9a714c578db4` and implementation
`e6426fcff8fec0744f9ce1bc9fe88f8d09d94ff9`. This documentation checkpoint closes the slice:

- one shared canonical slate planner serves the retained workspace and standalone Casting Room;
- one strict selector requires the complete current board, raw empty session history, exactly one
  Ready/legal project, all candidates/capacity, and the first free shared slot;
- App owns the exact workspace, rendered state, Lot Screen, presentation token, opener, draft, and
  slate revision, and stale or unchanged callbacks cannot acquire newer authority;
- open, cancel, rejection, acceptance, autosave, close, and witness retain one Lot component,
  Phaser view, canvas node, camera, Screen object, presentation token, and App authority tree;
- cancel is byte-neutral, while Engine rejection keeps the same planner, all six selected reads,
  exact error, unchanged state/save bytes, and legal revised retry;
- accepted planning is synchronously exact-once, validates the exact App-owned draft, commits and
  autosaves before close, and cannot be rolled back by optional witness failure;
- one strict receipt proves the exact appended Auditioning session and current Casting reservation
  before the same Lot shows **CAMERA TESTS UNDERWAY**, due/facility/slot truth, and all six reads;
  and
- zero/multiple projects, blockers, active/review/history state, legacy, non-Lot, and
  Operation-Hollywood-off paths retain the full Casting Room owner.

The visual/product ruling is **KEEP**. Desktop, 960×540, actual page-scale 200%, forced colors,
reduced motion, and 480×270/DSF2 retain one bounded scroll owner, visible focus, complete six-read
controls, reachable submit/cancel/deep details, no page overflow, and the same underlying
Lot/canvas. The minimal founded fixture remains exactly 30 display objects / 13 actors /
11,096,896 decoded bytes / one draw.

Final proof passed focused authority/workspace/Lot/selector 39/39; UI 117/117 files and
1,458/1,458 tests; repository 204/204 files and 2,688/2,688 tests; governed D-16/D-17 10/10 files
and 176/176 tests; Audition Chromium 4/4; adjacent retained-Commission/formation Chromium 14 passed
/ one explicit pre-existing GPU-only skip; both TypeScript projects; and a 155-module production
build. Direct Engine/SaveFileV11 byte parity, protected paths/refs, seven screenshot reviews,
`git diff --check`, and independent authority/accessibility audits passed. No GPU certification is
claimed.

No Core, GameState, SaveFileV11, Casting result, screenplay, capacity, reservation, facility,
production, construction, publicity, economy, RNG, ledger, manifest, exporter, authored art,
renderer structure/draw, travel, occupancy, queue, workload, autonomy, or pathfinding behavior
changed.

## Prior world-first checkpoint — Lot-Retained Screenplay Commission V1

World-First Lot-Retained Screenplay Commission Workspace V1 is accepted under frozen contract
`57ce4058a122dfdb1443d9607087f30ff472ce48` and implementation
`2ec3b8a3c6451112a423fe3e30f1c9331b831caa`. This documentation checkpoint closes the slice:

- one shared canonical commission form serves the retained workspace and standalone Writers' Room;
- App owns one `editing → committed` session bound to the exact rendered state, Lot Screen,
  presentation token, workspace identity, and Development opener;
- open, cancel, rejection, acceptance, autosave, close, and witness retain one Lot component,
  Phaser view, canvas node, camera, Screen object, presentation token, and App authority tree;
- world semantic, recovery/migration, and renderer input remain inert while the large workspace is
  open, but the same visibly living studio stays mounted behind it;
- cancel is byte-neutral, while Engine rejection keeps the same form instance, complete edited
  draft, exact error, unchanged state/save, and legal retry;
- accepted commissioning is synchronously exact-once, keeps a noninteractive recording state
  through autosave, then closes without letting optional receipt failure roll back Engine truth;
- one strict receipt proves the exact appended Drafting project and deterministic current
  Development & Casting reservation before the Lot shows **SCREENPLAY COMMISSIONED** once; and
- Operation-Hollywood-off managed and legacy modes preserve their established standalone routes.

The visual/product ruling is **KEEP**. Desktop, 960×540, actual page-scale 200%, forced colors,
reduced motion, and 480×270/DSF2 retain one bounded scroll owner, reachable controls, visible focus,
no page overflow, and the same underlying Lot/canvas. The minimal founded fixture stays exactly
30 objects / 13 actors / 11,096,896 decoded bytes / one draw across open, cancel, and accept.

Final proof passed focused Commission 33/33; UI 113/113 files and 1,421/1,421 tests; repository
200/200 files and 2,651/2,651 tests; governed D-16/D-17 10/10 files and 176/176 tests; Commission
Chromium 4/4; combined Commission/Studio-Home/formation Chromium 20 passed / one explicit GPU-only
skip; both TypeScript projects; and a 151-module production build. Direct Engine/SaveFileV11 byte
parity, protected paths/refs, six screenshot reviews, `git diff --check`, and independent final
audit passed. No GPU certification is claimed.

No Core, GameState, SaveFileV11, screenplay, writer, capacity, reservation, facility, production,
construction, publicity, economy, RNG, ledger, manifest, exporter, art, renderer structure/draw,
travel, occupancy, queue, workload, autonomy, or pathfinding behavior changed.

## Prior world-first checkpoint — Lot-Retained Package & Greenlight V1

World-First Lot-Retained Package & Greenlight Workspace V1 is accepted under frozen contract
`cc2c4af067f681d1a26f10959eb1c0dbd7512d0d` and implementation
`729afb72d345e3430655d33f6b73ed8c7a33f1df`; exact closure authority is
`910ac51b2c89bc238274db979c75ae379b02f5b9`:

- App owns one independent `editing → committed` workspace session over the exact retained Lot
  Screen and opaque presentation token; no new `Screen`, App tree, Lot tree, view, or canvas exists;
- the exact clear Casting successor commits and reaches autosave before canonical Assembly opens;
  blocked or drifted handoffs preserve accepted prior same-Lot/neutral behavior;
- canonical Assembly, Talent Creator, and Talent Profile retain complete company, evidence, budget,
  marketing, forecast, blocker, rejection, retry, and focus behavior through bounded presentation
  adapters;
- world semantic and renderer input remain inert while the large workspace is open, but the same
  visibly living studio remains mounted behind it;
- explicit cancel is byte-neutral and restores the exact same Lot, Phaser view, canvas, camera,
  Screen object, and connected opener when still current;
- accepted greenlight keeps one noninteractive committed workspace through autosave, then atomically
  closes and publishes one strict live receipt to that already-mounted Lot;
- exact **PICTURE FORMED**, title, Director, Lead, complete company, phase, reservation, status, and
  countdown appear without first/last/array-order substitution or witness replay; and
- Classic / Operation-Hollywood-off preserves standalone Assembly and the prior remount path.

The visual/product ruling is **KEEP**. Desktop, 960×540, effective 200%, forced colors, reduced
motion, and 480×270/DSF2 keep one scroll owner, reachable header/close/primary action, visible focus,
and no page overflow. The Lot remains visually legible where space permits and semantically mounted
at every compact gate.

Final proof passed UI 108/108 files and 1,388/1,388 tests; repository 195/195 files and
2,618/2,618 tests; governed D-16/D-17 10/10 files and 176/176 tests; next-event Chromium 19/19;
retained-Package Chromium 4/4; formation Chromium 10 passed / one explicit GPU-only skip; D-14
career Chromium 7/7; both TypeScript projects; and a 148-module production build. Direct Engine/
SaveFileV11 byte parity, exact 42 objects / 19 actors / 11,096,896 decoded bytes / one draw,
protected paths/refs, manual browser play, and independent final P0/P1 audit passed. No GPU
certification is claimed.

No Core, GameState, SaveFileV11, schema, migration, Casting, screenplay, package, greenlight,
assignment, facility, capacity, production, release, construction, publicity, employment, economy,
RNG, ledger, manifest, exporter, authored art, texture, renderer structure/draw, travel, occupancy,
queue, workload, autonomy, or pathfinding behavior changed.

## Prior world-first checkpoint — Lot-Native Casting Review V1

World-First Lot-Native Casting Review Intervention V1 is accepted under corrected frozen contract
`d707f9878abdcd3a8d28ddb583a166ff3e911ff3` and implementation
`cd0ace6213c88255439010ff284f390a538a6650`; exact closure authority is
`5c6f7573c85498fde2ce17c39d7058e13e4fdd06`:

- one strict closed selector joins the exact Core Casting decision, complete session/project/card,
  six canonical Lead/Antagonist/Support observations, current package consequences, and sole
  acknowledgement action;
- newly surfaced and already-pending reviews retain distinct provenance; malformed, duplicate,
  sparse, extra-key, stale, replaced, or contradictory truth fails neutral;
- App revalidates exact state/context/action, current screen, modal absence, and one opaque live-Lot
  token before dispatching once and autosaving the exact successor;
- blocked successors remain on the same mounted Lot; clear successors become the exact accepted
  input to the retained Package path above; and
- Hollywood Casting remains semantic while Classic preserves its accepted physical selection.

Final Casting proof passed focused 92/92, UI 1,377/1,377, repository 2,607/2,607, governed 176/176,
Chromium 18/18, both TypeScript projects, a 147-module build, exact structure, protected gates, and
independent audit. No Core/save/simulation/economy/art/renderer behavior changed.

## Prior world-first checkpoint — Lot-Native Screenplay Review V1

World-First Lot-Native Screenplay Review Intervention V1 is accepted under frozen contract
`22ee17c01b688a114b9803f7754af1be6477c655` and implementation
`67a0bf333fc4863548fb13fbc2696fd002bd627d`; exact closure authority is
`e37035c1caff095d4456c85d74a97304fc654cba`:

- one strict closed selector joins the exact current Core screenplay decision, one exact
  player-safe review card, and the exact Core-emitted Accept plus optional Rewrite actions;
- newly surfaced cadence review and already-pending review retain distinct provenance, so a stale
  receipt cannot downgrade into a pending action while current Core truth needs no invented receipt;
- the live Lot presents exact title/ID, named writer, first/final state, qualified `Est.` score and
  band, strengths, concerns, consequence, blockers, and every current legal action in Core order;
- App captures and revalidates the complete rendered state/context/action, dispatches the existing
  Script Projects chain exactly once, autosaves, and repaints the exact Engine successor in the
  same mounted world;
- Accept and base/Annex Rewrite successors are exact; valid Engine progress survives presentation
  failure, and stale/malformed/replaced/deep-return paths never substitute another review;
- renderer failure, delayed readiness, pointer/touch/keyboard/virtual-AT, neighboring-button blur,
  compact/zoom/effective-200%, forced colors, grayscale, reduced motion, focus, and announcement
  paths are exact or deliberately neutral; and
- Writers’ Room remains an optional exact deep owner after the world actions, returning to fresh
  current Lot truth without replaying cached facts or a consumed event receipt.

The visual/product ruling is **KEEP**. The bounded action rail remains readable and operable at
960×540, effective 200%, maximum world zoom, and 480×270/DSF2 without page-level horizontal
overflow or covering the people/production rails. No renderer structure changed and no GPU
certification is claimed.

Final proof passed focused 6/6 files and 104/104 tests; UI 103/103 files and 1,334/1,334 tests;
repository 190/190 files and 2,564/2,564 tests; governed D-16/D-17 10/10 files and 176/176 tests;
Chromium 14/14; both TypeScript projects; and a 145-module production build with the existing
large-chunk warning. Direct Core-action/SaveFile parity, protected paths/refs, manual browser play,
and independent final P0/P1 re-audit passed.

No Core, GameState, SaveFileV11, schema, migration, screenplay, assignment, facility, capacity,
production, casting, release, construction, publicity, employment, economy, RNG, ledger, manifest,
exporter, authored art, texture, Place, route, actor, draw, travel, occupancy, queue, workload,
autonomy, or pathfinding behavior changed.

## Prior world-first checkpoint — Active Production Company Presence V1

World-First Active Production Company Presence & Picture Switching V1 is accepted under frozen
contract `08e86abf0d166d2f79555f79a8afc10c80bc18f8` and implementation
`2ef7f0aa7cb13c52fde9b3d64a8d384a6f79b56a`; closure authority is
`9294fb65a59a1c438f7a7e9eb4dd820fe8c56231`:

- the adapter atomically proves zero through two complete companies from raw active-production
  slots, exact operation identity, unique current Talent, and the existing ambiguity-aware
  whole-studio assignment gate;
- every valid company is exactly Writer, Director, Lead, Antagonist, Support, and
  Production/Craft Lead in canonical order; hostile accepted state withholds expanded company
  truth instead of truncating, repairing, Map-overwriting, crashing, or mutating state;
- React and the Hollywood scene share one strict selector, keep every active company present, and
  switch exact person/picture context by stable IDs rather than title, array order, stage, or tab;
- all six roles expose exact picture, phase, facility, status, countdown, assignment, and career
  context; only the assigned Director receives Director-task/call authority;
- canonical profile continuity, renderer failure, reduced motion, forced colors, compact/zoom,
  pointer/keyboard/virtual-AT, delayed/replaced truth, and same-title/two-picture cases are exact or
  fail neutral; and
- release proof observes one exact six-person `prod-0004` company before the authoritative event
  and zero company members after the receipt-free Lot return.

The visual/performance ruling is **KEEP**. One complete picture measures 42 display objects / 19
dynamic actors; two complete pictures measure 54 / 25; the selected Gate visitor remains the exact
43 / 20 one-picture +1/+1 marginal. Every case retains 11,096,896 decoded bytes and one draw.
Twelve semantic buttons remain horizontally reachable, company/member emphasis is readable without
color alone, and the evidence HUD neither covers nor intercepts people or production controls.

Final proof passed 99/99 UI files and 1,289/1,289 tests; 186/186 repository files and 2,519/2,519
tests; governed D-16/D-17 10/10 files and 176/176 tests; affected-world Chromium 55 passed with two
explicit pre-existing GPU-only skips; dedicated company Chromium 13 ordinary passes with two
explicit GPU-only evidence skips; targeted release proof 1/1; both TypeScript projects; and a
143-module production build with the existing large-chunk warning. Fresh quiescent 50/30 evidence
was measured, but it is not relabelled GPU certification; absolute thresholds remain behind
`PROJECT_STUDIO_PERFORMANCE_EVIDENCE`.

No Core, GameState, SaveFileV11, schema, migration, production, assignment, employment, release,
facility, construction, economy, RNG, ledger, manifest, exporter, authored art, texture, route,
queue, task, workload, autonomy, pathfinding, or renderer-draw behavior changed.

## Prior world-first checkpoint — Lot-Native Next-Event Cadence V1

World-First Lot-Native Next-Event Cadence & Reaction V1 is accepted under frozen contract
`15e65c494b28518e3ba8df2e74823adff3178897`, primary implementation
`eb6cef1bb2cadc09438daacefb5868e7e6269b44`, and final replacement-input hardening / accepted
behavior authority `aabb68477fe73ea21af3195985ee7ffaf6a182f7`. This documentation checkpoint
closes the slice:

- one native Lot action claims the exact rendered state and calls existing App-owned
  `advanceToNextEvent` once; the Engine retains loop, priority, stop, period-accounting, and final
  successor authority;
- every non-release stop updates authoritative state/autosave and one final renderer snapshot
  without changing screens, preserving the same Lot host, renderer, canvas, and camera;
- complete closed receipts disclose exact stop, target, range, completed runs, orthogonal Annex
  completion, and every period category; malformed presentation keeps only independently safe
  neutral week/cash/message truth and never rejects valid Engine progress;
- physical Stage 7 and exact Administration orientation are used only when independently proven;
  Writers, Casting, Theater, and Stage 12 remain honest semantic destinations with no invented
  place;
- world command, exact deep route, unchanged receipt-bearing return, state-changing neutral return,
  rejected/declined Saves preservation, and accepted whole-studio replacement are separately
  provenance-governed and cannot substitute identity;
- releases retain Newspaper/ReleaseResult/Autopsy and return receipt-free; construction completion
  remains one orthogonal non-repeating co-event; and
- pointer/touch/mouse/keyboard/virtual-AT, cancel/blur/visibility/modal/renderer, delayed readiness,
  and pre-ready whole-studio replacement tails are exact-once or fail closed.

Final proof passed 185/185 repository files and 2,476/2,476 tests, focused next-event authority
214/214, governed D-16/D-17 176/176, Chromium 12/12, both TypeScript projects, and a 142-module
production build. The 12-fixture native SaveFileV11 corpus replayed byte-identically at manifest
SHA-256 `0736b837fb6bd1954a72e1db0da64469b8d833f29166ee454c32a163b489ade1`.
Exact and byte-identical neutral renderer windows both measured 34 objects, 15 actors, 11,096,896
decoded bytes, and one draw. Independent strict audit is clean after every finding was repaired.

Behavior change is bounded to primary-world invocation and presentation of existing authority. No
Core, GameState, SaveFileV11, schema, migration, adapter stop/simulation/period law, production,
construction, employment, release, facility, economy, RNG, ledger, manifest, exporter, authored
art, world movement route, task, queue, autonomy, pathfinding, or renderer-draw behavior changed. Skipped weeks are
one synchronous batch and one final snapshot; they are not claimed as watched intermediate work.
No GPU/FPS certification is claimed and no threshold was relaxed.

## Prior world-first checkpoint — Greenlight Production Formation V1

World-First Greenlight Production Formation & Fresh Lot Return V1 is accepted at implementation
authority `345a89281ad1e89ac32f07082d4eb34ac664f280` under frozen contract `6ec10a6`; exact
closure authority `7966603ae8cc85702e10e10e8850f9481dd322b2` closes the slice:

- one pure strict before/after selector proves exactly one new production and field-exact
  production, Director, Lead, greenlight-week, and screenplay identity without predicting or
  choosing the first/last production;
- Assembly emits only an accepted transition receipt, App independently checks exact latest
  GameState and current session gates, and stale, duplicate, malformed, rejected, or mismatched
  callbacks fail closed;
- fresh Lot return selects the exact new picture's Director as an inhabitant, keeps its exact Lead
  visible and selectable, and exposes exact title, phase, production-level facility reservation,
  status, countdown, Director, and Lead with a bounded one-shot `PICTURE FORMED` witness;
- the same mounted Lot retains exact picture context across the accepted
  Development/Development/Pre-production/Rehearsal sequence, then uses physical Stage 7 only when
  exact allocation owns it and the semantic Stage 12 fallback otherwise;
- related Director, Lead, and formed-picture inspection preserves valid context, while unrelated
  selection, identity drift, studio replacement, disappearance, release, duplicates, and hostile
  snapshot shapes land neutrally without substituting another picture; and
- renderer rejection/readiness, delayed import, profile-over-Lot continuity, pointer/touch/
  keyboard/virtual-AT exact-once activation, compact viewports, maximum world zoom, forced colors,
  CSS magnification, and effective 200% layout are proven or fail closed.

Final proof passed 181/181 repository files and 2,422/2,422 tests, focused Formation authority
37/37, governed D-16/D-17 176/176, Chromium 9/9, and a 140-module production build. Native evidence
replay was byte-identical, governed asset/provenance hashes and protected refs stayed exact, and
independent strict audit closed with no remaining findings.

Behavior change is bounded to supporting UI/world continuity. No Core Engine, GameState,
SaveFileV11, schema, migration, greenlight/workflow/reservation/phase/person/facility/economy/RNG
law, manifest, exporter, authored art, pathfinding, task, queue, autonomy, or renderer-draw behavior
changed. Structural parity is recorded; no GPU wall-clock certification is claimed and no
performance threshold was relaxed.

## Prior world-first checkpoint — Studio Gate Talent Arrival V1

World-First Studio Gate Talent Arrival & Hiring Return V1 is closed at implementation authority
`ca8279c` under frozen contract `712c311`:

- one adapter-owned Gate eligibility boundary, narrow snapshot projection, and strict selectors
  keep Lot, App, and Hiring aligned on exact current unemployed/no-contract/complete-offer truth;
- the exact accepted runtime Gate, its status, and native semantic companion enter a neutral
  chooser; no first/default candidate becomes consent;
- explicit selection adds one distinct stationary existing-atlas visitor at the accepted arrival
  anchor, outside the staff/production people model, with exact name, profession, `Free agent`, and
  current term lengths in the world inspector;
- the canonical Talent Profile opens over the same mounted live Lot, while the secondary exact-name
  Hiring handoff independently focuses one unique complete current contract card;
- signing remains solely the existing Hiring → `signContractAction` → Core path, and direct Back
  restores only fresh exact identity/terms or a neutral Gate without choosing a successor;
- runtime geometry, renderer failure/readiness, delayed import, modal/visibility transitions,
  whole-studio replacement, pointer/touch/keyboard/virtual-AT activation, compact layout, maximum
  world zoom, and effective 200% paths are exact-once or fail closed; and
- final proof passed 177/177 repository files and 2,383/2,383 tests, governed D-16/D-17 176/176,
  focused Gate authority 149/149, Chromium 6 passed/1 explicit GPU-only skip, a 139-module build,
  byte-identical native replay, the exact 34/15 → 35/16 structural delta at 11,096,896 bytes/one
  draw, and independent strict review with no remaining findings.

No Core, GameState, SaveFileV11, schema, migration, adapter business law, market/offer/signing law,
production/facility/economy/RNG behavior, manifest, exporter, art, authored atlas, pathfinding,
queue, autonomy, route, animation, or renderer-draw behavior changed. No GPU-only absolute
wall-clock pass is claimed; the opt-in test was intentionally skipped and no threshold was
relaxed.

## Post-Gate proportional person-flow maintenance

Maintenance authority `ff0e0fc` closes two reachable presentation defects found by the fresh
critical-experience audit:

- a selected Lead no longer inherits the exact Director-only `assignShootingDirector` call;
  production-level Studio Desk and exact selected Director retain it, while the Lead may still use
  truthful picture-level Clear/Schedule interventions; and
- the selected Director's existing nameplate now remains attached throughout the already-governed
  cosmetic Stage 7 dispatch route and at arrival; unselected people remain unlabelled.

The repair adds zero objects, actors, textures, routes, animations, or draws and changes no task,
command, destination, pathfinding, or Engine authority. Proof passed 207 focused regressions,
90/90 UI files and 1,155/1,155 UI tests, both TypeScript projects, named-person Chromium 3/3, and
soundstage Chromium 7/7.

## Prior world-first checkpoint — Selected Stage 7 Production Detail Handoff V1

World-First Selected Stage 7 Production Detail Handoff & Fresh Return V1 is closed at
implementation authority `6a3f85f` under frozen contract `05d2d44`:

- one shared strict selector owns unique managed/Engine Stage 7 identity for both Phaser and React;
  the former first-match seams are removed and every hostile/malformed shape fails closed;
- explicit physical Stage 7, status/problem, exact blocker, native Stage A, same-film scenery
  continuation, or typed return provenance is required; Studio Desk auto-orientation, the generic
  rail, people, Stage 12, and global Dashboard cannot expose the deep action;
- the existing in-world command remains first, followed only when exact by **Open Production Board
  details · <title>**;
- the Lot validates every rendered operation field against latest snapshot truth and App
  independently reselects latest Engine truth before focusing one exact unique Board card;
- direct Back carries the old exact ID, rebuilds fresh Stage 7 truth, restores semantic/physical
  context when still valid, and falls back to the neutral Lot without selecting a replacement;
- renderer/import failure, delayed readiness, modal/visibility transitions, pointer/touch/keyboard/
  virtual-AT activation, stale identity, studio replacement, compact layout, maximum world zoom,
  and effective 200% layout are exact-once or fail closed; and
- final proof passed 173/173 repository files and 2,310/2,310 tests, governed D-16/D-17 176/176,
  focused authority 141/141, final combined Chromium 35/35, a 138-module build, byte-identical
  native SaveFileV11 replay, the exact 34/15/11,096,896/one-draw structural reference, and three
  independent reviews with no P1–P3 findings.

No Core Engine, GameState, SaveFileV11, schema, migration, adapter business law, production action/
task/clock, facility/allocation, economy/publicity tuning, RNG, ledger, manifest, exporter, art,
route, actor, object, animation, or renderer-draw behavior changed. Default headless wall-clock
remains honestly uncertified; the frozen opt-in thresholds were not relaxed.

## Prior world-first checkpoint — Operational Annex Work Presence V1

World-First Operational Annex Work Presence V1 is closed at implementation authority `e14633b`
under frozen contract `e2fd6df`:

- one Calendar call projects the exact unique canonical Annex row/slot; one pure selector rejects
  malformed lifecycle, identity, count, owner/activity, and production-outlook truth;
- the physical Annex, its label, semantic companion, and inspector share exact Available, Working,
  or separately labelled configured Held vocabulary without inventing a worker or queue;
- exact script, casting, or production owner IDs open focused existing deep surfaces only after
  latest-state revalidation, and direct Back rebuilds fresh Annex truth and focuses Current work;
- exact Annex production reservations now point to physical `expansion`, while every non-Annex
  location mapping and Engine allocation rule remains unchanged;
- stale gesture identity, changed occupants, unrelated deep navigation, studio replacement,
  renderer failure, delayed readiness, modal suspension, compact layout, maximum camera zoom, and
  200% page zoom fail closed; and
- final proof passed 170/170 repository files and 2,242/2,242 tests, governed D-16/D-17 176/176,
  final combined Chromium 30/30 (Lot 20, named person 3, Annex 7), a 137-module build, byte-identical
  native SaveFileV11 replay, and independent review with no P1–P3 findings.

The Annex paint adds zero objects, actors, textures, routes, or draws. Default headless wall-clock
samples remained compositor-contended and are explicitly not an absolute-gate pass; the frozen
one-production structural tuple and opt-in thresholds were not relaxed.

No Core Engine, GameState, SaveFileV11, schema, migration, action/allocation law, economy/facility/
construction tuning, RNG, manifest, exporter, art, or pathfinding authority changed. One adjacent
Talent Profile focus-lifecycle defect was repaired without changing profile or career data.

## Prior world-first checkpoint — Publicity Campaign V1

World-First Publicity Campaign V1 is closed at implementation authority `f2f2e22` under frozen
contract `f83f27f`:

- exact `publicityDecision` offers project through a pure hostile-state validator with no UI-owned
  price, lift, cooldown, affordability, recommendation, or action law;
- the canonical physical Administration & Publicity place and native semantic companion enter one
  exact Whisper/Push/Blitz context while unrelated world selections clear it;
- one App-owned action accepts a selected tier exactly once and returns only a validated tier/week
  receipt; fresh GameState repaints cash, Awareness, the ledger row, and all-tier cooldown truth in
  the same mounted Lot;
- one bounded photocall cue acknowledges accepted truth without borrowing or erasing Stage 7
  graphics, and reduced motion/reload/rejection never fabricate ceremony;
- an explicit Dashboard-details handoff returns to fresh Administration context without replaying
  the Lot result, while ordinary Dashboard and cross-studio navigation remain unchanged;
- stale offers, rapid pointer/keyboard input, receipt mismatch, renderer/manifest failure, context
  loss during loading/create, recreation, hidden tabs, modal input, and semantic fallback all fail
  closed; and
- final proof passed 168/168 repository files and 2,171/2,171 tests, governed D-16/D-17 176/176,
  focused publicity Chromium 5 passed/1 explicit GPU skip, full Lot Chromium 20/20, a 136-module
  build, exact provenance gates, and independent review with no P1–P3 findings.

No core Engine, GameState, SaveFileV11, schema, migration, economy/publicity tuning, production,
career, facility, construction, RNG, manifest, art, or pathfinding authority changed.

## Prior world-first checkpoint — Named Person Inspector V1

World-First Named Person Work & Career Inspector V1 is closed at implementation authority
`04f7d9d` under corrected contract `c5c1679` (initial freeze `9bd075b`):

- one snapshot-only selector accepts only unique, internally consistent managed/Engine or
  legacy/presentation person-to-operation joins and fails contradictory identity/provenance closed;
- exact operation membership owns Director/Lead work while a whole-studio ambiguity gate protects
  assignment, career, and profile copy;
- the world inspector exposes existing role, picture, phase, facility/workplace boundary, status,
  countdown, assignment, and career identity facts; and
- the canonical Talent Profile opens modally over the same mounted live renderer with world input
  suspended and complete identity-loss/focus/failure handling.

Its closure passed 167/167 repository files and 2,095/2,095 tests, D-16/D-17 176/176, full Chromium
117/117, a 135-module build, and clean independent review without changing production, career,
people, save, economy, asset, or pathfinding authority.

## Prior world-first checkpoint — Studio Home V1

World-First Studio Home V1 is closed by this documentation checkpoint at implementation authority
`0c4bd9d` under frozen contract `8d5f8dd`:

- Studio Lot overview and Operation Hollywood are adopted default-on ordinary-player gates with
  independent explicit rollback precedence;
- one App-owned home decision governs founded recovery, Start/Saves import, founding completion,
  and ordinary Studio Home entry without making Phaser a router;
- Dashboard remains complete and explicit, while typed Lot/Dashboard origin survives the bounded
  deep, release, Clipping, Chronicle, Autopsy, and return matrix;
- accepted studio replacement resets selected-building and stable stage-assignment memory rather
  than leaking presentation identity between studios;
- navigation is neutral to Engine/GameState, SaveFileV11, RNG, week, cash, ledger, economy,
  productions, people, reservations, construction, publicity, facilities, and tasks;
- deep screens still destroy and remount the Lot: selected-building/focus and authoritative state
  persist where contracted, but same-Phaser, camera, person, production/place, and animation
  persistence are explicitly outside V1; and
- final proof passed 165/165 files and 2,069/2,069 tests, governed D-16/D-17 10/10 files and
  176/176 tests, 114/114 Chromium before the final harness-neutrality correction followed by the
  affected Studio Home paths at 5/5 under hostile inherited rollback env, a 134-module production
  build, clean TypeScript/diff gates, and clean independent review.

The accepted 2D Role Atlas remains the people presentation authority. Rejected 05H/05I character
production and integration remain unauthorized.

## Prior world-first checkpoint — Scenery Load-In V1

World-First Scenery Load-In V1 is closed at implementation authority `3a667e0` under frozen
contract `b03bb10`:

- one pure selector accepts only exact managed + Engine + unique Stage 7 Shooting
  `scenery-load-in` blocked/ready truth and fails every hostile state closed;
- the canonical physical Scenery & Service polygon/marker, production problem, and native semantic
  control enter the same exact film → source → Soundstage 7 context without navigation;
- one existing App/adapter command owner produces blocked → ready, retains context, and exposes
  Schedule immediately; normal-motion acknowledgement cannot gate it;
- accepted Schedule exits service context into truthful Stage 7 scheduled state on the same canvas,
  camera, URL, week, cash, production, people, reservations, RNG, ledger, and save authority;
- direct Stage 7, Production Board, same-lot service, and adapter surfaces produce byte-identical
  ready successors from the frozen blocked prestate;
- renderer rejection, delayed import, reduced motion, absent/malformed canonical manifest, direct
  ready reload, Stage 12, duplicate Stage 7, stale identity, and generic service-place behavior are
  all explicit fail-closed/compatibility proofs;
- the retained renderer cost is one draw-only Graphics object, zero texture bytes, zero actors,
  zero routes, and no second draw; and
- focused proof passed 7/7 files and 143/143 tests, complete repository proof passed 163/163 files
  and 2,028/2,028 tests, D-16/D-17 passed 176/176, and the full Lot Playwright suite passed 20/20.

Live acceptance proved the exact Week-30 physical blocked → ready → scheduled loop, Schedule during
the 1,200 ms sweep, direct ready reload, native semantic keyboard operation in real Chromium,
reduced motion, renderer rejection, generic service inspection, all governed viewports, 960×540
stress, actual maximum camera zoom, and zero product diagnostics. Final 1920×1080 measurement
retained 180 average FPS, 143 FPS 1%-low, 7 ms p99/worst, one draw, 34 display objects, 15 actors,
and the exact 11,096,896-byte decoded texture budget.

The in-app browser controller itself focused but did not synthesize physical Enter activation; that
limitation is recorded honestly and is not relabelled. Playwright's real Chromium keyboard journey
and focused native-control tests independently pass Enter/Space exact-once behavior.

The accepted 2D Role Atlas remains the people presentation authority. Rejected 05H/05I character
production and integration remain unauthorized.

## Protected authority

- `main`: `33eb33ae307904aa3f00db20bc695e40bf46d1e4`
- accepted D-17B: `35d42687a410a621becf1df35c75986657f8c44e`
- Operation Hollywood bridge: `623b8b2a80e9c6b85304eaa2a338b6045e8f6b21`
- marathon integration baseline: `4432a9befef578ac3549896c2796bf0a22950ec0`
- final Annex compatibility authority: `8b7e95eb92f6f809522a595b4b458d4f19e26852`
- reviewed Week-208 observatory authority: `f16e2e0b184f6818d373d77556c5c7a1b3df7b94`
- World-First Scenery Load-In V1 implementation: `3a667e05986579d6474878f238d1c6dbc4a7e362`
- World-First Studio Home V1 contract: `8d5f8dd95a64a6a863b5612cc44cf1a45cf0f599`
- World-First Studio Home V1 implementation: `0c4bd9dade7ef866900dfd7d4557cb18fb69653f`
- Named Person Inspector V1 corrected contract: `c5c1679a1eee3ff82655ac59c80af54c8c6f52e0`
- Named Person Inspector V1 implementation: `04f7d9da01a1f609b54430c4a0265d7cdd637b4a`
- World-First Publicity Campaign V1 contract: `f83f27f0d42b16ea177b35f1a39e23236faf6831`
- World-First Publicity Campaign V1 implementation: `f2f2e22fe292772ef8aba4f97f42ea38855cbf96`
- World-First Operational Annex Work Presence V1 contract: `e2fd6dfdedc0ac398cae24c2ccea9bcc524d38d1`
- World-First Operational Annex Work Presence V1 implementation: `e14633b578834f5a2f625049762c45506e6b1ee2`
- World-First Selected Stage 7 Detail Handoff V1 contract: `05d2d44b387cdfb9d4daeaffd37902f5ba0c9065`
- World-First Selected Stage 7 Detail Handoff V1 implementation: `6a3f85f2c991b850f065b4fd81ef60a5974a256a`
- World-First Studio Gate Talent Arrival V1 contract: `712c31180629396e33107e22826e73fbffffd9c2`
- World-First Studio Gate Talent Arrival V1 implementation: `ca8279cfb91990ef1904e36fa1d92d762811d180`
- World-First Studio Gate Talent Arrival V1 closure: `79be27e`
- exact Director call/nameplate maintenance: `ff0e0fc36628d248cedbec25fdbbfef01ebe8655`
- World-First Greenlight Production Formation V1 contract: `6ec10a6e4801dc7d1cd60932fb53a76160c57bb4`
- World-First Greenlight Production Formation V1 implementation: `345a89281ad1e89ac32f07082d4eb34ac664f280`
- World-First Greenlight Production Formation V1 closure: `7966603ae8cc85702e10e10e8850f9481dd322b2`
- World-First Lot-Native Next-Event Cadence V1 contract: `15e65c494b28518e3ba8df2e74823adff3178897`
- World-First Lot-Native Next-Event Cadence V1 implementation: `eb6cef1bb2cadc09438daacefb5868e7e6269b44`
- World-First Lot-Native Next-Event Cadence V1 final hardening / accepted behavior:
  `aabb68477fe73ea21af3195985ee7ffaf6a182f7`
- World-First Lot-Native Next-Event Cadence V1 closure:
  `2e32b0520ca2dc1c5a3a091000c6cbb998637f28`
- World-First Active Production Company Presence V1 contract:
  `08e86abf0d166d2f79555f79a8afc10c80bc18f8`
- World-First Active Production Company Presence V1 implementation:
  `2ef7f0aa7cb13c52fde9b3d64a8d384a6f79b56a`
- World-First Active Production Company Presence V1 closure:
  `9294fb65a59a1c438f7a7e9eb4dd820fe8c56231`
- World-First Lot-Native Screenplay Review V1 contract:
  `22ee17c01b688a114b9803f7754af1be6477c655`
- World-First Lot-Native Screenplay Review V1 implementation:
  `67a0bf333fc4863548fb13fbc2696fd002bd627d`
- World-First Lot-Native Screenplay Review V1 closure:
  `e37035c1caff095d4456c85d74a97304fc654cba`
- World-First Lot-Native Casting Review V1 corrected contract:
  `d707f9878abdcd3a8d28ddb583a166ff3e911ff3`
- World-First Lot-Native Casting Review V1 implementation:
  `cd0ace6213c88255439010ff284f390a538a6650`
- World-First Lot-Native Casting Review V1 closure:
  `5c6f7573c85498fde2ce17c39d7058e13e4fdd06`
- World-First Lot-Retained Package & Greenlight Workspace V1 contract:
  `cc2c4af067f681d1a26f10959eb1c0dbd7512d0d`
- World-First Lot-Retained Package & Greenlight Workspace V1 implementation:
  `729afb72d345e3430655d33f6b73ed8c7a33f1df`
- World-First Lot-Retained Package & Greenlight Workspace V1 closure:
  `910ac51b2c89bc238274db979c75ae379b02f5b9`
- World-First Lot-Retained Screenplay Commission Workspace V1 contract:
  `57ce4058a122dfdb1443d9607087f30ff472ce48`
- World-First Lot-Retained Screenplay Commission Workspace V1 implementation:
  `2ec3b8a3c6451112a423fe3e30f1c9331b831caa`
- World-First Lot-Retained Screenplay Commission Workspace V1 closure:
  `5cacd872a773910a18699b20cb5d4ab3c01a4821`
- World-First Lot-Retained Audition Planning Workspace V1 contract:
  `d94dd4714ab6ee8e0666afba3aae9a714c578db4`
- World-First Lot-Retained Audition Planning Workspace V1 implementation:
  `e6426fcff8fec0744f9ce1bc9fe88f8d09d94ff9`
- World-First Lot-Retained Audition Planning Workspace V1 closure: this documentation checkpoint

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Open residuals remain cash runaway, top-studio economic immortality, the week-208 synchronized
roster wall, P5 dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining
menu breadth, and formal G12 timing. No financing, loans, bailouts, restructuring, failure ladder,
hard bankruptcy, or arbitrary cash sink is authorized.

## Marathon seal and future boundary

The autonomous marathon is complete. No successor feature is authorized by this record. Preserve
the accepted Commission → screenplay review → Audition Planning → Casting review → Package →
formation chain, and begin any future work only after a fresh Owner ruling and a separately frozen
evidence contract.

The five highest-value future product investigations are recorded in
`NEXT-HIGHEST-LEVERAGE.md` and `AUTONOMOUS-MARATHON-HANDOFF.md`. They prioritize a measured
several-minutes-on-Lot audit, authoritative physical Casting/Development work, watched production
beats, selective retention of high-value deep surfaces, and facility/economy instrumentation.

Do not invent a physical Hollywood Writers/Casting building, performed audition travel, room
occupancy, cast assignment, construction catalogue, physical Stage 12, new facility, second Annex,
fourth slot, personal autonomy, intermediate-week spectacle, arbitrary cash sink, or screen-first
operations surface. The accepted truthful batch boundary remains one Engine call and one final
state; it does not claim that skipped travel, queues, occupancy, construction labor, rehearsal,
shooting, Post, publicity, or theatrical work was watched.
