# Operation Hollywood — Phase II engine bridge

## Result

The Studio Chronicle district now runs inside the production React + Phaser application on
`operation-hollywood-autonomous-marathon`. Its integration authority is merge
`4432a9befef578ac3549896c2796bf0a22950ec0`, which joins the accepted D-17B economy state to the
Operation Hollywood source without rewriting either history.

Enable both development gates:

```bash
VITE_STUDIO_LOT_OVERVIEW=1 VITE_OPERATION_HOLLYWOOD=1 npm run dev -- --host 127.0.0.1
```

The legacy D1 lot remains available when `VITE_OPERATION_HOLLYWOOD` is absent. The marathon worktree
is isolated; no protected source worktree was switched, reset, or cleaned.

## World-first product doctrine

The Owner has ruled that the Studio Lot is the primary game surface, not a visualization tab beside
a screen-first management application. Operation Hollywood is the player's persistent home. The
preferred loop is `WORLD → INSPECT / ACT → DEEP PANEL IF NEEDED → RETURN TO THE SAME LIVE WORLD`.

Dashboard, Assembly, Production Board, Calendar, Roster, Hiring, Finance, Film Autopsy, Chronicle,
Writers Room, Casting Room, and Studio Development remain valuable deep surfaces. They are not to be
deleted or compressed into unsuitable tiny popups. Their role is to support decisions whose detail
does not fit spatial interaction and then return the player to the same live lot context.

The product gate is continuous meaningful lot play: select a real production or person, see a real
facility state or blockage, act through the authoritative command owner, watch people and places
acknowledge the fresh state, and continue managing the living institution. Engine/GameState remains
the only authority. The bridge turns that truth into visible, selectable, accessible play; it never
turns animation, per-frame position, or the authored plate into a second simulation.

This is a forward ruling, not a retroactive compliance claim. The current host still opens founded,
restored, and loaded studios on Dashboard, mounts the lot only when explicitly opened and feature-
enabled, unmounts it for deep screens, and routes several physical affordances to standalone owners.
The next contracted work must close those gaps incrementally without rewriting the accurate history
in earlier contracts and closures.

## Architecture selected

The bridge uses a four-tier hybrid district, not a screenshot with invisible buttons and not
an object-per-prop reconstruction.

| Tier | Runtime representation | Cost in this slice |
| --- | --- | ---: |
| 0 baked world | one authored district plate | 1 display object |
| 1 state/occlusion | tight truck, camera-dolly, and gate masks; activity/selection graphics | 7–9 objects |
| 2 ambient life | pooled role sprites plus a stateful arrival car | 13 actors |
| 3 managed people | real contracted or active-production identities from the lot snapshot | snapshot-dependent |

The asset source is `art/hollywood/district-manifest.source.json`. The deterministic exporter
`tools/hollywood/export_district.py` validates the 1586×992 source, emits the Tier-0 plate,
crops every occluder to tight alpha bounds, and writes the runtime manifest. That manifest
owns places, polygons, anchors, affordances, activity requirements, visual states, routes,
depth bands, and decoded texture-memory cost.

`StudioLotSnapshot` remains the only truth boundary. Raw Talent objects and hidden ability values
still never cross into Phaser. Production Operations V1 now projects the authoritative film,
phase, countdown, facility, director, shooting-task status, blocker, progress, and currently legal
command. Managed studios expose only people attached to a real active production; the bridge no
longer fabricates Mara Voss or a picture when the studio is idle. Legacy studios remain explicitly
labelled and read-only in this surface.

## Hard depth proof

`street-to-stage-7` deliberately changes actor depth across six route anchors:

```text
street 30 -> behind truck 30 -> past truck 50 -> behind camera 56 -> past camera 78 -> stage 82
```

The environment is drawn at base `0`, truck `40`, camera dolly `70`, gate foreground `90`.
An authoritative production's routed director is therefore actually occluded and revealed by
semantic layer ordering while walking; the effect is not a CSS mask or a pre-rendered animation.

## Interaction mapping

### Soundstage 7 — authoritative shooting activity

The React host renders the exact Production Operations snapshot and dispatches only its
`currentCommand`. Core accepts or rejects that command; the application replaces and autosaves the
whole state only after success. The next snapshot then repaints both React and Phaser.

An exact engine reservation for Soundstage 7 maps to the authored Stage 7 district. When the
snapshot changes from `unassigned` to `blocked`, Phaser may animate that production's real director
along the authored route as visual acknowledgement. Route position and wall-clock time never alter
the engine task. Blocked, ready, scheduled, and completed saves load directly into their persisted
visual state, and no render-loop timer can complete a take.

An exact Soundstage 12 reservation remains Soundstage 12 in the production inspector. Because this
district plate contains only Stage 7, Soundstage 12 uses an honest inspector fallback and never
starts the Stage 7 route. With no managed production, the scene says the lot is idle.

### Administration/Publicity — second reusable activity

The same manifest vocabulary stages Publicity from data: place, publicity affordance, talent,
publicist, photographer, queue-forming/flash/press-moving visual states. Its command invokes the
real D-17B `publicity` core action through `ui/src/engine/adapter.ts`. A verified live run changed:

```text
cash       $20,000,000 -> $18,800,000
awareness  40.0 -> 40.8
ledger     + one studio-level publicity entry
cooldown   publicity.lastUsedWeek / byTier.whisper updated
```

Because GameState is replaced by the action result, cash, standing, ledger, cooldown, and V8
production operations are saved by the existing session/save system. This is the second unit
proving the scene vocabulary is not a Stage-7-only anecdote.

## Performance

Final live Chromium/Phaser acceptance at 1920×1080 on 2026-08-13:

| Metric | Measured |
| --- | ---: |
| FPS | 106 |
| Display objects | 26 |
| Dynamic actors | 13 |
| Decoded authored texture memory | 8.7 MB |
| Static authored environment draws | 4 |
| Target / hard floor | ≥50 / ≥30 |

The runtime panel also records rolling frame, worst frame, update, worst update, render estimate,
and renderer draw-count when Phaser exposes it. The overlay keeps the player-facing readout terse.
The engine bridge clears both the aspirational target and hard floor in the acceptance session.

## Evidence

- `out/operation-hollywood/HOLLYWOOD-NORTHSTAR.png`
- `out/operation-hollywood/HOLLYWOOD-PRODUCTION.png`
- `out/operation-hollywood/HOLLYWOOD-NORTHSTAR-vs-PRODUCTION.png`
- `ui/src/lot/hollywood/hollywood-bridge.test.ts`

Verification:

```text
typecheck: clean
production build: clean, 118 modules transformed (existing large-chunk advisory only)
full repository suite: 120 files / 1,557 tests passed
UI suite: 61 files / 558 tests passed
D-16 governed harness: 10 files / 176 tests passed
authoritative chain: snapshot command -> core action -> successful state replacement -> fresh snapshot
cosmetic route: exact Soundstage 7 unassigned -> blocked transition only; never advances core
live publicity: $1.2M paid, awareness +0.8, state replaced
live production: director called -> scenery cleared -> take scheduled -> SaveFileV8 reload -> release
```

## Five largest remaining parity losses — historical integration-baseline assessment

The following list records the visual assessment at integration baseline `4432a9b`. It is retained
as history, not current prioritization. Dynamic People Role Atlas V1 at `66f856c` closes historical
loss 1 while preserving the bridge boundary; the other four remain open.

1. Dynamic people are readable 54×74 period sprites, but lack the facial/cloth fidelity of the
   north-star’s baked figures at closer zoom.
2. Stage entry currently resolves at the threshold; there is no separately authored stage
   interior transition/cell.
3. One authored district camera is proven; parcel placement and alternate camera quadrants need
   additional compatible plates/cells.
4. Construction/upgrade/era evolution is supported by manifest visual states but only the
   shooting and publicity variants are authored here.
5. Lighting is rich because it is baked; time-of-day variants and animated light spill need
   alternate authored plates or overlay maps.

## Remaining visual move — historical integration-baseline recommendation

This recommendation also records the `4432a9b` baseline. Role Atlas V1 at `66f856c` completed the
later atlas-replacement step. The earlier Scenery Annex/era-overlay suggestion remains unbuilt and
is not the current world-first priority.

Author one empty/construction/completed state for the Scenery Annex and one 1950s overlay pack
(cars, signage, clothes, equipment) through this exporter. If those land without scene-specific
TypeScript, the visual-state and era promises are both proven. Then replace the generated actor
textures with an offline-rendered 4-direction role atlas while retaining the same managed-person
and activity contracts.

## Script Projects V1 bridge update

Script Projects V1 is delivered at `5e3aadf323c8a3d0caf43676f9bccfcc6f111db5` and preserves this
bridge's truth boundary. The Development & Casting lot destination now routes managed studios to the
Writers Room, whose core read model owns exact shared occupancy, screenplay attention, and legal
decisions. The lot snapshot receives only the narrow attention projection; raw ScriptProject state,
actual screenplay strength, hidden talent skill, and mutable GameState do not cross into Phaser.

No screenplay animation or second clock was added. Draft/rewrite completion remains a weekly core
transition, while the district may only acknowledge the resulting occupancy and attention state.
SaveFileV9 retains both screenplay and operations identity, so reload can repaint the correct
building/production state without replaying a cosmetic sequence.

## Casting Sessions V1 bridge update

Casting Sessions V1 is delivered at `49d9ae1dbead2c4f7e8a3db86993d39ad53b44d7` and keeps the
district on the same narrow truth boundary. The managed Casting / Talent destination now routes to
the real Casting Room. Its core read model owns the exact screenplay-bound session, role slate,
shared three-owner facility occupancy, due week, review decision, persisted estimated evidence,
package blockers, and legal actions.

The Studio Lot snapshot receives only a compact attention reason and authoritative facility
occupancy. Raw CastingSession objects, hidden actual execution, talent skills and persona, seed,
RNG state, and mutable GameState do not cross into Phaser. A Ready screenplay paints `auditions
optional` only when the current core projection actually exposes Plan auditions; otherwise a real
production operation at that building retains priority.

No audition animation or second clock was added. Camera tests complete only on the weekly core tick,
and the district may only acknowledge the resulting occupancy or decision state. SaveFileV10
persists the evidence and lifecycle, so reload repaints Auditioning, Review, or Complete directly
without replaying a cosmetic sequence or recomputing an observation.

The next engine-owned marathon slice will be named here only after its separate contract is frozen.
The visual recommendation above remains independent of that governance step.

## Studio Calendar & Capacity Board V1 bridge update

Studio Calendar V1 is delivered at `b51df457c5f456baa79894c197dfd7c60a5b481f` and keeps the
district's existing narrow bridge intact. The Calendar is a React operating surface over one pure
core projection; it does not send raw `GameState`, future bookings, hidden truth, or a new command
channel into Phaser.

The exact facility IDs already used by the lot remain authoritative. Development & Casting,
Soundstage 7, Soundstage 12, Scenery Shop, and Post Building appear in the Calendar from the same
managed operations state that feeds lot occupancy. Script and casting reservations join production
reservations in one core collision set, so the Calendar cannot substitute an authored place or
infer a visually convenient occupant.

Calendar navigation returns production work to the Dashboard Production Board and leaves lot
animation behavior-neutral. No calendar row moves a person, changes a building, schedules a take,
advances time, or persists presentation state. A later construction slice must freeze its own
facility lifecycle and bridge contract before any authored construction or upgrade state becomes
engine behavior.

## Development & Casting Annex V1 bridge update

Development & Casting Annex V1 was delivered at
`babfb874076055f5e8bb545eb1a96296e8accb76`; its final compatibility-hardened lineage ends at
`8b7e95eb92f6f809522a595b4b458d4f19e26852`. It is the first engine-owned construction lifecycle
to cross the district bridge, while preserving the same narrow `StudioLotSnapshot` boundary.

The snapshot receives only the parcel's canonical presentation state (`vacant`, `building`, or
`operational`), exact progress/status copy, and current Development & Casting capacity. Raw project
records, ledger rows, affordability internals, clocks, mutable `GameState`, and the construction
action do not cross into Phaser. Studio Development remains the sole React owner of the command.

Both lot implementations project the same engine state:

- the procedural lot paints the fixed parcel as vacant, under construction, or operational;
- the Hollywood manifest owns one disjoint central-asphalt expansion polygon and anchor;
- the semantic destination reports the exact live status and shared slot count; and
- clicking the physical Hollywood parcel routes to Studio Development, whose current core read
  model owns legality and whose focused heading provides the non-canvas handoff.

The Hollywood parcel does not complete construction, spend money, allocate work, or run a second
clock. It may paint workers/reveal acknowledgement, but weekly core state alone changes Building to
Operational. Completion after the thirteenth advance adds the canonical facility only after that
advance's screenplay, casting, and production allocation; neither the district nor its animation
can trigger a hidden retry.

Live Chromium acceptance built at Week 0, recovered the exact Week-13 SaveFileV11 result, showed
`Annex operational · 3 shared slots`, and opened Studio Development from the physical parcel. The
district and owner screen had no horizontal document overflow across 1280×720, 1366×768,
1440×900, 1920×1080, or the 125%-equivalent compact viewport; console warnings/errors were empty.

A post-closure compatibility repair added only the conditional, migration-only
`cashLedgerCheckpoint` needed by authentic pre-ledger saves. Checkpoint-free existing V11 files,
including this accepted Week-13 browser state, retain byte-compatible save behavior. The field does
not cross `StudioLotSnapshot`, and the repair changes no Annex, economy, player, React, or Hollywood
district behavior.

No authored facility building was invented for this slice. The fixed asphalt parcel and lifecycle
overlay are an honest V1 representation until a separately contracted district-art state earns its
own evidence. Future construction catalogues, placement, upgrades, era variants, and facility
economics remain outside this bridge update.

## Film Chronicle V1 bridge update

Film Chronicle V1 is delivered at `f59b4675a745734f721b7ec73d5bee04eb7c7813`. It makes the
player's completed movie visible without widening the Phaser or simulation boundary.

The release route pairs a deterministic HTML/CSS studio one-sheet with the truthful Silver Screen
Gazette. The one-sheet reads only the pure Chronicle projection: exact title/genre, locked Shape
and Promise, frozen credits and greenlight Fits, persisted chronology, and the existing reception.
It uses no generated image, remote request, canvas, random draw, current talent state, hidden
ability, or delivered-expression surrogate.

The authored lot remains unchanged. No Chronicle fact crosses `StudioLotSnapshot`; no poster or
newspaper interaction moves a person, advances a clock, spends money, schedules production, or
changes the district. `Chronicle`, `Clipping`, and session-only `Autopsy` are distinct React routes
over their exact evidence bases.

Live Chromium acceptance completed the real managed path through screenplay, casting, package,
Soundstage commands, release, reload, clipping, and durable Chronicle. The poster/Gazette pair
passed the governed desktop viewports at 100% and 125%, plus 200% text/compact cases, with no page-
level horizontal overflow, unreachable action, console warning, or console error. SaveFileV1-V11,
engine actions, tick, economy, reception, RNG, and the Hollywood district remain behaviorally
unchanged.

## Hollywood Dynamic People Role Atlas V1 bridge update

Dynamic People Role Atlas V1 is delivered at `66f856c72f2be033768cc435e556563681679d7e`
from frozen contract `b01edc2`, Camera normalization amendment `0ee129c`, and asset checkpoint
`471c8ef`.

One validated `384×1152` atlas now supplies 36 frames: Director, Talent, Grip, Stagehand,
Electrician, Camera, Security, Publicity, and Extra in South, East, North, and exact mirrored-West
directions. The scene's existing managed-person IDs, actor pool, home slots, route geometry, depth
bands, labels, DOM semantics, and snapshot bridge remain stable. Pointer selection was repaired so
visible named people take precedence over invisible place zones. Direction derives only from
cosmetic movement; stationary people use the canonical fallback. Ambient actors share the same
mapping without becoming roster people.

The scene activates the atlas only after complete geometry/manifest validation. Missing or invalid
assets retain the nine procedural fallbacks, selection, input, route, and reduced-motion behavior.
The Camera fallback texture no longer collides with the camera-dolly occluder, and invisible place
hotspots no longer sit above selectable named people.

The exact director route still begins only on the authoritative Soundstage 7
`unassigned → blocked` transition. Arrival settles South but cannot clear scenery, schedule a take,
tick time, or otherwise change GameState. Reduced motion resolves or freezes cosmetic movement while
preserving the same tasks and controls.

The committed sources, prompts, result IDs, rights basis, crop boxes, hashes, and normalization are
recorded under `art/hollywood/people/`. The deterministic exporter produces the exact runtime PNG
and JSON without a network or model call. Three independent replays were byte-identical. The atlas
hash is `2790bf72909f0a8b76d2f6d2ca387f68499776ef7db44d847ed03ff28979712b`; the total decoded district,
atlas, fallback, and vehicle budget is 11,096,896 bytes.

Raw unsmoothed 1920×1080 acceptance measured 120 average FPS, 108 FPS 1%-low, 9.3 ms p99 and worst
frame, one renderer draw, 33 display objects, and 15 dynamic actors after the governed warm-up.
Visual-only lot operations preserved the complete SaveFileV11 and RNG bytes. Full repository,
D-16/D-17, TypeScript, build, live fallback, reduced-motion, reload, viewport, grayscale, and
labels-hidden gates passed, and independent reviews ended with no unresolved P1–P3.

**2D Hollywood role-atlas presentation accepted; 05H/05I character production and integration
remain rejected/unauthorized.**

The next bridge move is not another passive overview. It is a bounded world-first Production
Operations slice: expose the real Stage 7 blockage as a visible semantic affordance, select its
exact production, reuse the existing `runProductionCommand` dispatcher from that selected Stage 7
or blocker context, acknowledge person travel, and repaint the fresh authoritative state until work
resumes. The Production Board remains the deeper command surface.

## World-First Soundstage Intervention V1 bridge update

World-First Soundstage Intervention V1 is delivered at
`c48f8acd95eb7de5ba4114d92c8d8ef1ef1a949d` from frozen contract `001c692`. It closes the next move
named above without widening `StudioLotSnapshot` into a second simulation boundary.

The physical Stage 7 polygon, its existing lamp/status, the visible blocker control, and semantic
Stage A companion now resolve one exact production identity. The scene may emit that identity only
from managed mode, Engine stage authority, and exact `stage-a`; the React host rechecks the latest
snapshot before entering Studio Desk context. Stage 12, legacy mode, presentation authority, stale
identity, and absent Stage 7 retain truthful fallback behavior and cannot borrow the route or world
outline.

The existing App owner remains the only dispatcher. It runs the exact projected
`assignShootingDirector`, `clearSceneryLoadIn`, or `scheduleShootingTake` command once and returns the
Engine `ActionOutcome` so rejection can clear pending focus and announce the exact error. Success
replaces GameState through the existing owner and supplies a fresh snapshot. Route arrival cannot
gate the successor command, complete a task, tick time, or consume RNG.

Live acceptance played *Nights of Watchtower* through Stage 7 selection, Estelle Delgado dispatch,
blocked, ready, scheduled, SaveFileV11 reload, and next-week completed truth. The district retained
one renderer draw, 33 display objects, 15 actors, and the unchanged decoded texture budget. A live
Phaser/React hit-through defect was repaired by containing native overlay down events and accepting
scene stage/place/person hits, wheel handling, and drag start only from the actual canvas.

That next bridge move is closed by World-First Live Week Advance V1 at `621e7e1`. Phaser remains
neither a clock nor a GameState owner.

## World-First Live Week Advance V1 bridge update

World-First Live Week Advance V1 is delivered at
`621e7e139456ae21dd0dd420bf8fcaf16af1f454` from frozen contract `3391528`. The live lot now exposes
one native semantic `Advance one week` intent. App invokes the existing adapter once, replaces
GameState once, and supplies the same mounted Hollywood view with one fresh
`studioLotSnapshot(state)` when no film releases.

No new Phaser hook, clock, snapshot field, save field, task transition, construction rule, or random
draw exists. A delayed dynamic import constructs from the latest App-owned snapshot, and a complete
renderer rejection leaves the semantic companion able to advance exact Engine truth. The existing
camera, valid production/person selection, reduced-motion state, and renderer instance survive an
ordinary no-release week.

ReleaseResult, Newspaper, and Autopsy now carry explicit Dashboard/lot origin context. A real
Gazette or non-Gazette release keeps its existing evidence surface, while a lot-origin chain returns
to the lot and focuses its advance action. Exact Annex completion owns its ceremony once and
suppresses the generic already-Operational announcement only for the immediate chain/mount.

Live acceptance advanced the committed Week-30 *Nights of Watchtower* Stage 7 fixture to Week 31
completed truth on the same lot; replayed exact Annex progress/completion and *House of Cipher*
release co-events; retained reduced-motion and renderer-failure operation; and passed the governed
viewport/zoom matrix. The scene retained one draw, 33 display objects, 15 actors, and the exact
11,096,896-byte decoded texture budget.

The next bridge move is **World-First Annex Construction Interaction V1**. The already-visible
parcel should select an exact same-lot construction context and reuse the existing Engine-owned
Annex start action. An accepted start should repaint Vacant → Building without unmounting the lot;
the shipped week action should then carry exact progress to Operational. This may supersede only the
old presentation ownership that made the lot navigation-only. It must not invent a catalogue,
placement system, second Annex, operating cost, worker autonomy, or economic tuning.
