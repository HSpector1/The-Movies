# Project: Studio — Current Best

Updated: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Current implementation HEAD: `c48f8acd95eb7de5ba4114d92c8d8ef1ef1a949d`

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

## Current world-first checkpoint

World-First Soundstage Intervention V1 is closed at implementation authority `c48f8ac` under frozen
contract `001c692`:

- physical Stage 7, visible problem, and semantic companion resolve one exact latest-snapshot
  production identity;
- the world and Production Board dispatch the same Engine-projected commands and produce
  byte-identical results;
- Stage 12, stale identity, legacy/presentation authority, renderer failure, and over-canvas input
  fail closed;
- named-director travel remains acknowledgement while fresh Engine snapshots alone change task
  truth;
- the complete 1,897-test suite and 176-test D-16/D-17 harness pass; and
- raw 1920×1080 measurement retains 180 average FPS, 143 FPS 1%-low, 7 ms p99/worst, one renderer
  draw, 33 display objects, 15 actors, and the unchanged 10.6 MB decoded texture budget.

The accepted 2D Role Atlas remains the people presentation authority. Rejected 05H/05I character
production and integration remain unauthorized.

## Protected authority

- `main`: `33eb33ae307904aa3f00db20bc695e40bf46d1e4`
- accepted D-17B: `35d42687a410a621becf1df35c75986657f8c44e`
- Operation Hollywood bridge: `623b8b2a80e9c6b85304eaa2a338b6045e8f6b21`
- marathon integration baseline: `4432a9befef578ac3549896c2796bf0a22950ec0`
- final Annex compatibility authority: `8b7e95eb92f6f809522a595b4b458d4f19e26852`
- reviewed Week-208 observatory authority: `f16e2e0b184f6818d373d77556c5c7a1b3df7b94`

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Open residuals remain cash runaway, top-studio economic immortality, the week-208 synchronized
roster wall, P5 dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining
menu breadth, and formal G12 timing. No financing, loans, bailouts, restructuring, failure ladder,
or arbitrary cash sink is authorized.

## Current highest-leverage gap

The first physical blockage-to-resumption beat is now playable. The earliest observed break in
continuous world play occurs immediately afterward: a scheduled take completes only on the next
authoritative week, but the lot has no week-advance intent. The player must return to Dashboard,
which unmounts the lot, advance there, then reopen the world to see the result.

The next bounded target is **World-First Live Week Advance V1**: one semantic lot control emits
intent to App, App invokes the existing Engine advance exactly once, and a non-release result
repaints the same mounted lot. A real release may still open the existing Chronicle/Gazette deep
surface, but Continue should return to the initiating lot context. This adds no second clock and
preserves Dashboard behavior.

The doctrine is still not fully delivered. New, restored, and loaded studios open on Dashboard;
deep screens unmount the lot; several buildings still route directly to standalone owners; and the
world does not yet show every queue, workload, construction decision, or production phase. Those
remain explicit forward gaps. Week-208 research remains closed with no current repair justified;
the underlying roster-wall residual remains open.
