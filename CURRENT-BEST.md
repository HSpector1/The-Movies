# Project: Studio — Current Best

Updated: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Current implementation HEAD: `3a667e05986579d6474878f238d1c6dbc4a7e362`

## Product doctrine — World First

**THE STUDIO LOT IS THE PRIMARY GAME SURFACE.**

Project: Studio is structurally closer to *The Movies*, *Zoo Tycoon*, *RollerCoaster Tycoon*, and
*The Sims* than to a screen-first sports-management application with a separate 3D visualization.
The player should spend most ordinary play inhabiting, watching, and manipulating a living studio.

The default interaction grammar is:

```text
WORLD → INSPECT / ACT → DEEP PANEL IF NEEDED → RETURN TO THE SAME LIVE WORLD
```

Dashboard, Assembly, Production Board, Calendar, Roster, Hiring, Finance, Film Autopsy, Chronicle,
Writers Room, Casting Room, and Studio Development remain valuable. Do not delete or trivialize
them. They are deep management surfaces for information and decisions too complex to express
spatially. They support the world; they do not replace it. Where technically appropriate, the
studio remains alive behind or around them, and closing them returns to the same camera, selection,
and current studio context.

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

## Current world-first checkpoint

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

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Open residuals remain cash runaway, top-studio economic immortality, the week-208 synchronized
roster wall, P5 dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining
menu breadth, and formal G12 timing. No financing, loans, bailouts, restructuring, failure ladder,
or arbitrary cash sink is authorized.

## Current highest-leverage gap

The player can now select the exact Stage 7 production, assign its named Director, watch travel,
resolve scenery at its physical source, schedule the take, advance the Engine week, and
inspect/build/advance the Annex without leaving the lot. The next observed world-first break is
**World-First Studio Home V1**: new, restored, and loaded operating studios still open on Dashboard
even though the Owner has ruled that the persistent lot is home.

Instrument and freeze entry/return behavior before implementation. Identify every founding,
recovery, save-load, deep-screen, release-result, and explicit Dashboard route. The bounded target
should make the lot the ordinary operating-studio destination while retaining Dashboard and all
deep surfaces as intentional supporting destinations with exact return origin, focus, selection,
camera, and save/reload truth.

Do not delete Dashboard, skip required founding/onboarding decisions, keep duplicate mounted Apps,
make Phaser own navigation, or infer return origin from the current URL. Deep screens still unmount
the lot today; whether persistence behind them is part of this bounded slice must be measured rather
than assumed. Visible queues/occupancy, parallel-production legibility, and richer human workload/
relationship/stress/fatigue/career stories remain explicit later gaps. Week-208 research remains
closed with no current repair justified; the underlying roster-wall residual remains open.
