# Project: Studio — Current Best

Updated: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Current implementation HEAD: `ca8279cfb91990ef1904e36fa1d92d762811d180`

## Product doctrine — World First

**THE STUDIO LOT IS THE PRIMARY GAME SURFACE.**

Project: Studio is structurally closer to *The Movies*, *Zoo Tycoon*, *RollerCoaster Tycoon*, and
*The Sims* than to a screen-first sports-management application with a separate 3D visualization.
The player should spend most ordinary play inhabiting, watching, and manipulating a living studio.

The default interaction grammar is:

```text
WORLD → INSPECT / ACT → DEEP PANEL IF NEEDED → RETURN TO THE SAME LIVE WORLD
```

“Same live world” means the same authoritative studio and explicit Lot root, not permanent renderer
object identity. Studio Home V1 still unmounts the Lot for non-modal deep screens and remounts one
Phaser view on return. Bounded selected-building/focus context, the explicit Publicity Campaign
handoff, and current authoritative state persist; camera, selected person, general production/place
context, and presentation animation do not.

Dashboard, Assembly, Production Board, Calendar, Roster, Hiring, Finance, Film Autopsy, Chronicle,
Writers Room, Casting Room, and Studio Development remain valuable. Do not delete or trivialize
them. They are deep management surfaces for information and decisions too complex to express
spatially. They support the world; they do not replace it. Where technically appropriate, the
studio may remain alive behind or around them. In the current architecture, closing a deep screen
returns to the same authoritative Lot root with bounded context restoration, not the same Phaser
instance, camera, or selected person. Publicity Campaign V1 and Operational Annex Work Presence V1
prove narrow exact contextual handoffs; neither is a general persistent-shell claim.

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

## Current world-first checkpoint

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

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Open residuals remain cash runaway, top-studio economic immortality, the week-208 synchronized
roster wall, P5 dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining
menu breadth, and formal G12 timing. No financing, loans, bailouts, restructuring, failure ladder,
or arbitrary cash sink is authorized.

## Current highest-leverage evidence step

The post-Gate parallel several-minutes-on-Lot audit promotes **World-First Greenlight Production
Formation & Fresh Lot Return V1** after two proportional person-flow maintenance repairs.

Accepted greenlight already creates one exact Production, commitment debit, managed workflow,
phase, deterministic Development & Casting reservation, Director and Lead. The current App throws
away that accepted production identity and performs a generic Lot return. With multiple non-Stage
7 operations the desk can even say `No active production` because no exact operation is selected.
The named people exist on the Lot, but nothing frames them as the picture that just formed.

The bounded target is supporting Assembly → accepted exact before/after production receipt → fresh
Lot → exact Director selected as the new picture's inhabitant → exact title/phase/facility/status/
countdown/Director/Lead inspection → mounted week advances retain that production identity → fresh
Pre-production repaint → existing physical soundstage presence at Rehearsal. It must use a strict
accepted-transition selector and exact-or-neutral return; no `.at(-1)`, predicted ID, first
operation, or substitute production may own continuity.

The accepted Hollywood manifest has no canonical physical base Development or Casting place, so
V1 may expose the production reservation and people but may not claim personal room occupancy or
invent Development/Pre-production travel. Full facility embodiment needs separate spatial/art
authority. Stage 12 remains blocked by its art no-go; service-yard identity cannot be relabelled as
Post; queues, workload, alternate staffing, pathfinding, ceremony replay, save fields, or new
simulation law are not authorized.

Before contract freeze, repair two proven presentation defects without broadening the milestone:
a selected Lead must not issue the Director-only call, and a selected Director's existing
nameplate must follow and survive the already-governed cosmetic dispatch route. The existing
Shooting command, route, and Engine law remain unchanged.
