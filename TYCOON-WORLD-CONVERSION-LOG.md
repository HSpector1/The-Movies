# Tycoon World Conversion — Shift Log

Shift start: 2026-08-16. Branch: `tycoon-world-conversion-12h` from canonical `main`
`2be66562aa9593fee79c370ea7ce6787ac88557f`. Fable is PM; Opus agents build.

Controlling ruling: the Owner's playtest failed the product direction — "very zoomed in…
does not feel like a traditional The Movies / Zoo Tycoon / RCT type game… the visuals are
NOT driving the game." Mission: living studio tycoon simulation where the world drives play.

## Fable's opening diagnosis (played the build, Week 0 fresh studio)

1. **The world is a single 1586×992 hand-painted PNG** (`ui/public/lot/hollywood/district-manifest.json`,
   `HollywoodScene.ts`). Camera is fit-locked: max zoom-out 0.85×fit — the player can never
   see more than ~1.18× of one painted corner. There is no more world to see. Wheel zoom
   at default position does nothing perceptible; drag-pan leaks into DOM text selection.
2. **Five clickable places** (Stage 7, Admin/Publicity, Scenery yard, Annex parcel, Gate)
   as polygon hotspots over the painting; interactive surface is ~9 semantic buttons total.
3. **The painted crowd is decorative.** Dozens of baked people; the studio employs six.
   12 hardcoded ambient walkers lerp between literal pixel pairs; exactly one scripted
   route exists (director → Stage 7). No pathfinding, no walkability data.
4. **No placement substrate.** The one buildable (Annex) is a fixed parcel with a
   Graphics-rectangle growing on it. `ConstructionParcel` carries no coordinates.
5. **Engine has real scarcity but no geography.** Facilities/slots/reservations with
   validated overbooking invariants exist; `ShootingTask` is the person→place→work
   template; but person location is invented by the UI adapter (`managedWorkflowLocation`),
   which renders one engine facility as two different buildings.
6. **The shelved legacy `LotScene` is a real tycoon substrate**: 24×22 iso tile grid
   (`ui/src/lot/scene/layout.ts`, `iso.ts`), ~2944×1472 px world, absolute zoom 0.32–1.9,
   LOD bands, camera presets, WASD/edge pan, building footprint registry, zoned roads,
   multi-waypoint agents. Its rollback flag path currently renders a black canvas (broken).

Verdict: continuing to bolt overlays onto the painting cannot satisfy the mission. The
conversion runs through **grid restoration at Hollywood art direction**, then build mode,
then engine-owned work/location truth.

## Shift plan (order of battle)

- **M1 — Tycoon World Foundation V1** (presentation-only): grid world becomes the default
  Lot; true camera; all buildings; existing verbs preserved. IN PROGRESS.
- **M2 — Build Mode V1**: parcel/footprint placement with preview/legality/cost feeding the
  existing construction lifecycle.
- **M3 — Workplace Simulation V1**: engine `assignments` slice + arrival/travel primitive;
  people at their reserved facilities; visible occupancy/queues (engine E1–E4 extensions).
- **M4 — One visible filmmaking chain**: production phases physically consume the lot.
- Continuous: code-mining ledger, playtests after every milestone, kill what fails the
  "do I feel like I run this place" test.

## M1 — FROZEN TARGET: Tycoon World Foundation V1

**Player before:** fixed painted close-up of one corner; no camera; five hotspots;
decorative crowd; no sense of property.

**Player after:** the default Studio Lot is a navigable isometric property showing the
whole studio — Administration, Writers, Casting, Stage 7 (A), Stage 12 (B), Post, Theater,
Gate, Scenery Shop, the Annex expansion parcel, plus roads/plazas/expansion pads. Camera:
wheel zoom at cursor across a true tycoon range (institution / operations / people bands
with LOD), drag + WASD/arrow + edge pan, camera presets, sane bounds. Clicking a building
or person gives the exact existing selection panels and verbs. The six roster employees
(and gate visitors, active companies) appear as role-atlas people; ambient extras minimal
and justified. Stage lamp / construction / blocker states paint from snapshot truth on the
correct buildings. The DOM semantic companion remains complete.

**Engine boundary:** zero engine changes. Same `StudioLotSnapshot` consumption, same
React-facing event contract, same actions.

**Explicitly not built in M1:** build mode, travel/task simulation, new facilities,
minimap, save changes, removal of the Hollywood plate (kept behind its flag as rollback).

**Visual bar:** not the old flat-gray presentation. Palette/light direction sampled from
the Hollywood plate (warm 1948 California), authored `b-stage-a-h2.png`/`b-stage-b.png`
sprites used, role-atlas people, soft shadows, readable silhouettes at management zoom.
"Handsome diorama," not photoreal.

**Acceptance:**
1. Fresh studio → default view reads the whole property at operations zoom; zoom out to
   institution scale; zoom in to person scale; pan by drag/keys/edge.
2. Stage 7 click → existing Stage 7 operations panel; Gate → visitor slate; Annex parcel →
   construction; Admin → publicity; Development/Casting → the retained Commission and
   Audition Planning workspaces still open over the same mounted world.
3. Week advance / next event repaint world truth in place.
4. DOM companion list intact and focusable; keyboard camera control works.
5. No console errors; smooth feel at 1920×1080 (no formal cert claimed).
6. Root+UI typecheck pass, production build passes, repository tests triaged: Hollywood-
   pinned specs updated or explicitly quarantined with rationale; everything else green.

## M2 — DRAFT TARGET (freeze after M1 playtest): Build Mode V1

Design source: CODE-MINING-LEDGER Entries 2–3 (OpenRCT2 clean-room runner invariant;
CorsixTH parcels/per-cell legality/built-active gate). Engine side:

- V12 save slice: authored parcel grid over the M1 world; placed-facility records
  {id monotonic, blueprintId, origin, rotation, cells, status underConstruction→
  operational, placedWeek, completesWeek}; OccupancyIndex derived, never persisted.
- Pure `queryPlacement` / `commitPlacement` actions; commit re-queries internally,
  reference-equal state on rejection; legality order per ledger (occupied → … →
  seversLot → insufficientFunds last).
- Weekly completion pass before capacity aggregation; capacity contributed ONLY by
  operational status (generalizes the existing Annex completeDueConstruction append).
- Catalog V1 honest and small: the Development & Casting Annex becomes a parcel-placeable
  blueprint (existing $780k/13wk/+1 shared slot law preserved); multiple Annex-class
  placements become legal in V12 (the old single-Annex cap was marathon law; the Owner's
  conversion mission supersedes it where the tycoon design requires). Each operational
  placed facility carries a small honest weekly operating cost in the ledger — the
  natural size-scaling cost D-17B's charter asked to instrument, not an arbitrary sink.
- V11 saves with the fixed-parcel Annex (vacant/building/operational) migrate onto the
  grid at the legacy parcel's location.
- UI: build mode entered from the world; ghost preview in a UI-only layer (never sim
  state); per-cell green/red; cost + build-weeks quote; construction site paints on the
  lot; completion flips real capacity.

## M2-UI — FROZEN TARGET: Build Mode V1 in-world (ui/src only)

The draft above is frozen with the delivered engine API (`queryPlacement`, action
`placeFacility`, `studioPlacementView`, `LOT_PARCELS`, per-cell `cellLegality`,
`PLACEMENT_REJECTION_ORDER`; legacy `startDevelopmentCastingAnnex` is an alias). Ghost
preview is UI-only with identical-input memoization; draft carries value + revision
authority; commit paths and receipts follow the retained-workspace laws. Adds first
grid-world Playwright coverage (boot, inspector, build smoke; grid→screen helper; fresh
named-fixture tuples). Not built: demolition, mothball UI, roads, more real blueprints,
minimap.

## M3-Engine — FROZEN TARGET: Presence Projection V1 (src/core + tests, save-neutral)

A pure engine projection `studioPresence(state)` (new `src/core/presence.ts`) derives,
for the current week, one deterministic per-person timeline over BEATS_PER_WEEK = 10
integer beats, from EXISTING authoritative truth only: production company members at
their phase's reserved facilities; script writers drafting/rewriting at Development &
Casting; casting sessions auditioning; roster employees present without a workplace
claim; blocked productions' members waiting at the full facility (derived from
facility-capacity blockers — the first honest queue). Shape: {talentId, name, role,
engagement, site (facilityId | gate | none), beats[10] of home/travel/at-site/waiting,
blockedReason?}. Cosmetic stagger (departure beat) uses a derived RNG stream keyed
(seed, 'presence-v1', talentId:week) — never state.rngState. The projection changes ZERO
outcomes, persists NOTHING, and alters no tick step; it is the engine-owned canonical
decomposition of the week's known work for presentation and inspection. Tests: single
site claim per person; site equals an owner-held reservation; waiting appears iff the
blocker exists; beat arrays well-formed; byte-determinism; zero sim-RNG consumption.
Explicitly not built: persistence, arrival-across-weeks law, task queue records, hiring
travel, sub-week engine decisions, any UI.

- **M2-UI Build Mode V1 — KEEP** (commits `b580bef..4086729`; playtest 3, live browser,
  Week 1→40). The full tycoon loop verified by hand: open ground is a place ("Stage
  South Pad · 3×5 cells · trucks can reach this site") → Build here → catalog → ghost
  with live quote → commit debits $780k with an exact receipt → the site caption counts
  down weekly with panel truth in lockstep → at Week 14 a real annex building stands,
  Operational, +1 shared slot, $3,500/wk opex charging. Defects logged: (1) REGRESSION —
  construction completion no longer stops `advanceToNextEvent` (V12 retired the slice
  the stop-detector reads; sim ran Week 4→40 through the completion silently) — routed
  to the stabilization writer with repro; (2) polish — the site caption occludes the
  annex sprite at mid zoom; ghost cells read faintly at institution zoom. E2e state
  accepted provisionally pending the stabilization milestone (13 failures + 33 not-run
  at branch point are its charter). Dual-webServer e2e strategy (5178 plate quarantine /
  5179 shipped grid) — PM ruling: ACCEPTED.

## M3-Engine delivery note (accepted)

Presence Projection V1 delivered green: full suite 215 files / 2,872 tests, both tsc,
save-neutrality and zero-sim-RNG proven by byte-parity tests (eight ticks with and
without interleaved projections identical). API: `studioPresence(state)` with
`BEATS_PER_WEEK = 10`, per-person `{engagement, credit, ownerId, site, slot, beats[10],
blockedReason}` plus an auditable `withheld[]`. Attendance canon per phase documented
in-file as presentation canon, not outcome law.

Findings of record:
- **Facility-capacity queues are unreachable in the shipped configuration** (2
  productions max, 2 slots of every capability): the first honest visible queue requires
  either higher concurrency or scarcer capacity — an Owner-level product/economy
  decision (it intersects the open P5-dominance and cash-runaway residuals). The
  presence system supports waiting/queue truth and is proven against a configured
  one-soundstage state; the shipped bottleneck today is action-time rejection, which the
  inspectors already surface as slot occupancy.
- No gate/arrival site is emitted (no arrival truth exists); casting tier projects the
  slate itself (no casting personnel exist); `releaseReady` claims nobody.
- Cross-agent incident: the M2-UI writer's commit `b580bef` swept the presence writer's
  in-progress files via `git add -A`. Repaired forward in `758d4f2..0eefb3b`; history
  not rewritten; the UI writer instructed to stage owned paths only.

## Stabilization milestone — ACCEPTED (commits `1442601..81cdbe9`)

Browser suite fully deliberate: 181 passed / 0 failed / 4 env-gated GPU skips / 0 not
run (185 total); repository vitest 218 files / 2,918; both tsc; build. Completion-stop
regression fixed at the adapter (detector re-pointed from the retired V11 slice to the
placement root; 3/5 new specs fail against the old detector — spot-verified 5/5 at
HEAD). The two shift-base "pre-existing" failures were a stale hiring-card selector,
proven at `2be6656` and fixed at greater strength. All re-pins are fresh measured
values; the M1.5 plate-tuple shift (+1 actor/+2 objects per fixture at identical bytes
and draws) is roster presence on both worlds, proven invariant.

PM rulings on its three findings:
1. Non-legacy completion receipt fails closed to neutral in-world feedback — ACCEPTED
   for now (truthful, law-5/13 conforming). Real fix is first-class world identity for
   placed facilities (BuildingId union widening) — recorded as next-leverage, candidate
   for M3-UI or a follow-on slice, not to be invented casually (law 12).
2. `studioCalendar` never lists non-legacy construction (core staleness at
   `studioCalendar.ts:426`) — REPAIR NOW, dispatched as a bounded core seam-repair
   writer parallel to M3-UI. DELIVERED at `156e273`: events project from the placement
   root (legacy Annex event byte-identical, additive placementId/parcelId/facilityName
   fields, numeric placement-id ordering), utilization proven already correct, 6 new
   falsification-checked specs, suite 218 files / 2,924 green.
3. Multiple completions in one advance share one receipt (lowest id owns it, message
   counts the rest) — ACCEPTED.

## M3-UI — FROZEN TARGET: Presence on the Lot V1 (dispatch after stabilization lands)

**Before:** people stand at parked spots; a week advance teleports state; nothing
travels; occupancy is text in panels only.

**After:** the lot renders `studioPresence(state)`. Static truth: every person appears
at their site (or home zone) for the current week's beat mid-point; facility label
chrome gains an occupant count at operations zoom; the person inspector quotes
engagement/site/credit/blockedReason ("Drafting A Season of Archipelago at Development
& Casting, slot 1"); the facility inspector lists current occupants by name and credit;
waiting people cluster visibly outside their site (renderable from configured states
even though unreachable in shipped config — spec-proven). Living playback: on a single
Advance-one-week, the renderer plays the new current week's beat timeline over ~8–12s
wall time — commute along road-based presentation waypoints, work presence at sites,
return — skippable (click/Esc), reduced-motion = instant final positions. Multi-week
sims land on the final state and may play ONLY the new current week's timeline; skipped
weeks are never animated (law 3). Playback is pure presentation over the engine
timeline: no tick, no truth, no RNG, positions interpolated between beat boundaries
(laws 1–2). Secondary fixes folded in: construction-site caption must not occlude its
building sprite at mid zoom; ghost per-cell verdicts legible at institution zoom.

**Not built:** authoritative movement/location, new engine truth, queue interaction
verbs, ambient wandering, visual-polish palette work (separate milestone).

**Acceptance:** advance a week with a drafting script → watch the writer commute to
Development and the building read occupied; person/facility inspectors quote presence;
company presence follows phases across facilities week over week; reduced-motion
instant; suite/tsc/build green; at least one grid e2e spec covering presence paint +
occupant count.

## Authority reconciliation note

The sealed marathon's "not authorized next" list (NEXT-HIGHEST-LEVERAGE.md) prohibited a
placement system, worker pathfinding, construction catalogue, second Annex, and new save
fields pending fresh Owner authorization. The Owner's Tycoon World Conversion mission IS
that authorization and explicitly commands those systems. Still in force: Engine owns all
truth; no renderer-owned simulation; no unrestricted Sims autonomy/needs; no financing/
loans/bailouts/failure-ladder/arbitrary cash sinks; rejected 05H/05I character production
stays rejected.

## Playtests

- Playtest 0 (pre-work, Week 0): documented in the diagnosis above.
- Playtest 1 (post-M1, Fable, Week 0→1): camera proves three real scales (whole-property
  default, operations mid, person close), zoom-at-cursor, 1:1 drag pan, R reset. Gate →
  in-world visitor slate; Development → retained Commission over the live world; accept →
  in-world receipt (writer/due/facility/slot); next-event stops in-world with the review
  actions; after acceptance the buildings themselves read "Screenplay ready to package" /
  "auditions optional". Breaks found: (1) idle Stage A click ejects to Dashboard and
  Casting-without-eligible-session ejects to full Casting Room — pre-existing
  `activate()` fallthrough to `dispatchRoute(BUILDING_ACTION[id])`, now the loudest
  world-first violation; (2) LOD label band mis-hides all labels at property scale when a
  side panel resizes the canvas; (3) zero named employees on the Week-0 lot (adapter
  projects roster people only in legacy mode); (4) back-lot sparse, palette leans olive
  vs the plate's warm ochre; (5) no browser e2e coverage of the grid world yet.

## Keep/Kill record

- **M1 Tycoon World Foundation V1 — KEEP** (commits `38db60a..825b403`). The property/
  camera transformation is real and every accepted world verb survived the world swap.
  Playtest-1 breaks become M1.5. Note: wheel-zoom non-response under CDP-synthesized
  scroll is an automation artifact (JS-dispatched wheel works); not a product defect.
- **M1.5 World Inspector Default V1 — KEEP** (commits `b2f39d9..9f83af9`; playtest 2,
  Week 1 save, live V12-migrated browser session). Idle Stage A click → in-world
  "stage is dark" inspector with slot truth (was: Dashboard ejection). Theater →
  marquee/releases inspector. Casting → status + shared-slot truth + optional-auditions
  note. All with explicit deep-details secondaries; the world never unmounts; roster
  staff visible on the Week-1 lot; the browser save upgraded V11→V12 in place with the
  standard upgrade notice.
- **M2-Engine Placement Core V12 — ACCEPTED into the line** (verified: both tsc clean,
  placement suites 55/55 spot-run, tree clean at `9a5ae98`). Ten-parcel map, one Annex
  law via blueprint alias, $3,500/wk opex, byte-disciplined migration. Full-tree claim
  (212 files / 2,854 tests) accepted from the writer's report pending the M2-UI run,
  which re-executes the whole suite.

## M1.5 — FROZEN TARGET: World Inspector Default V1 (UI surfaces only)

**Before:** clicking an idle stage ejects to the Dashboard; clicking Casting/Development
without an eligible decision ejects to full-screen rooms; the Week-0 lot shows none of
the studio's own employees.

**After:** no physical building click ever auto-navigates. Every BuildingId lands an
in-world context panel in the established right-rail pattern: name, live status from
existing projections (operations/calendar occupancy, theatrical runs, construction,
script/casting state), current legal in-world quick actions where they already exist,
and an explicit "Open <deep> details" secondary button. The DOM companion behaves
identically. Roster employees appear on the lot as selectable inhabitants at
deterministic presentation-only parked positions (sceneSeed-derived; the accepted
personHome precedent — no location truth claimed), opening the existing person
inspector. LOD label bands recompute against current fit on every canvas resize.

**Not built:** engine changes, travel, new deep screens, redesign of retained
workspaces, build mode.

**Acceptance:** click every building in ordinary idle/active states and never leave the
world; employees visible and selectable at Week 0; labels stable across panel
open/close; suite/typecheck/build green with updated specs.

## M2-UI — DRAFT TARGET (freeze after M2-engine API report): Build Mode V1 in-world

**Before:** vacant parcels show inspector facts; construction starts only via the legacy
fixed-parcel action; no preview, no parcel choice, no multiple placements.

**After:** the whole build flow lives in the world: vacant parcel click → inspector
offers "Build here" → blueprint choice (V1 catalog = the Annex) → ghost footprint paints
on the parcel from live `queryPlacement` (UI-only preview layer, identical-input memo,
per-cell green/red) → cost + build-weeks quote, primary rejection shown in-world when
illegal (funds last) → Commit → immediate debit + construction site paints (scaffold +
weekly progress from truth) → completion swaps in the operational building and the new
capacity shows in calendar/inspectors. Multiple annex-class placements on distinct
parcels. Cancel byte-neutral. Draft carries value + monotonic revision authority (law
16). ALSO: first grid-world Playwright coverage — boot, building→inspector, build-flow
smoke — with a grid→screen click helper and fresh named-fixture structural tuples.

**Not built:** demolition, mothballing UI, roads, extra real blueprints, minimap.

## M1.5 delivery note (accepted pending PM playtest)

Delivered in commits `b2f39d9..9f83af9`; verified green in isolation at `02db48e` base
(ui 1541/1541, core 1230/1230, both tsc, build). Shared tree temporarily red under the
parallel V12 core work; the three adapter save-boundary call sites (~adapter.ts
2842/2854/2868) were granted to the M2-engine writer as a narrow remit extension, whose
done-definition now includes a fully green tree. PM playtest asks recorded: two-crowds
readability at Week 0, inspector panel size at 1920×1080, LOD stability across retained
workspace open/close.

## M2-Engine — FROZEN TARGET: Placement Core V12 (src/core + tests only)

Implement CODE-MINING-LEDGER Entries 2–3's agreed spec exactly: authored coarse parcel
grid constant (aligned to the M1 world's buildable zones incl. the legacy expansion
parcel), TUNING blueprint catalog (Development & Casting Annex as the first real
blueprint, preserving its $780k/13wk/+1-slot law), pure `queryPlacement` /
`commitPlacement` (commit re-queries, reference-equal state on rejection, internally
computed cost), weekly completion pass before capacity aggregation, operational-only
capacity, small honest weekly operating cost per operational placed facility (ledger-
visible), SaveFileV12 with V11→V12 migration mapping fixed-parcel Annex state onto the
grid, historical-boundary guards per operational laws 18–19, and the ledger's full test
list. Multiple Annex-class placements become legal. No UI, no renderer, no beats, no
demolition. M0A replay/determinism preserved.

## M2-Engine delivery note — Placement Core V12 (shipped)

Delivered in commits `5d35d26..HEAD`. Full repository suite green at the final commit
(212 files / 2854 tests), both tsc projects clean, `npm run build` passing.

**Parcel map (engine-owned, `src/core/lot.ts`).** Ten coarse parcels over the 28×26 M1
world, aligned by hand and asserted against the renderer's own numbers in
`tests/placement-lot.test.ts`. Eight buildable — `expansion` (7,15)–(10,18, the legacy
graded pad plus its boulevard frontage row, id preserved), `west-lawn` (0,9)–(2,14),
`north-lawn` (0,2)–(2,6), `north-court` (6,2)–(8,6), `north-back-lot` (21,0)–(27,5),
`stage-south` (15,16)–(17,20), `south-lawn` (3,19)–(8,22), `backlot-apron`
(23,20)–(26,24) — and two owned-but-blocked: `courtyard` (7,10)–(11,14) and
`service-yard` (21,16)–(26,18). Rectangles are INCLUSIVE, matching the renderer's ground
rasterizer. `north-back-lot` deliberately has no road frontage, which is what makes
`noRoadAccess` a live rule. Roads are circulation, never parcels.

**API surface for the M2-UI writer** (all from `src/core/index.ts`):
`queryPlacement(state, {blueprintId, origin}) → PlacementQuote` (pure, never throws on
illegality; `cells`, `cellLegality[]` per-cell green/red, `cost`, `buildWeeks`,
`completesOnWeek`, `capacityDelta`, `weeklyOperatingCost`, ordered `rejections[]`,
`primary`); action `{kind:'placeFacility', placement:{blueprintId, origin}}` (throws on
illegal commit); `studioPlacementView(state)` for the parcel map, catalog, live
occupancy, and `buildEnabled`; `LOT_PARCELS` / `LOT_WIDTH` / `LOT_DEPTH` /
`parcelAt` / `parcelHasRoadFrontage` for geometry; `PLACEMENT_REJECTION_ORDER` for
message ordering. Preview stays a UI-only layer: nothing here writes a ghost to state.

**Retained surfaces.** `studioConstructionView` is unchanged in shape and now projects
from the placement root, so every accepted construction surface keeps working;
`startDevelopmentCastingAnnex` is an alias that commits the Annex blueprint on the legacy
parcel. `projectId`/`facilityId` on that view widened to `string` (a second Annex-class
placement takes a suffixed identity; the legacy-parcel one keeps the exact V11 ids).

**New numbers.** `PLACEMENT_ANNEX_WEEKLY_OPERATING_COST = 3,500/wk` — the only new
economic quantity. Sized against `OVERHEAD_BASE` 15,000 and `OVERHEAD_PER_EMPLOYEE`
1,500: an annex block carries about two support staff of standing cost, $182k/yr against
its $780k capex. One aggregated `facilityOpex` ledger row per week, first charged the
week AFTER a facility becomes operational, reported inside the existing overhead bucket
so no finance read model changed shape.

**Known gaps (deliberate).** The D-17A fixed-cost allocator still counts only
payroll+overhead — folding `facilityOpex` into that audited cost basis needs its own
authorization. No rotation, no demolition, no mothballing, no second real blueprint.

## M3-UI acceptance and Playtest 4 (Fable, live browser, Weeks 41→44)

**M3-UI Presence on the Lot V1 — KEEP** (commits `53f6a3e..3d416f3`). Verified by hand:
packaged and greenlit A Season of Archipelago from the world; PICTURE FORMED receipt;
the Development sign immediately read "• 2 here"; the person panel quoted "Developing A
Season of Archipelago at Development & Casting, slot 1 · credited this week as
Director"; the building inspector listed "Who's here this week: Jean Ashcombe (Writer),
Buster Underwood (Director)". On Advance-one-week the playback is real — Buster
Underwood was caught mid-commute on the avenue with his nameplate, settling at the
building. Two weeks later the phase moved to Rehearsal · Soundstage 7 and the company
physically relocated: "Stage A • 4 here · STAGE 7 · ON SCHEDULE" with the cast visible
at the stage door, Development empty again. The writer's beat-0–8 resolution of the
frozen-target contradiction (settled frame = static truth; walk-home implemented but not
the played window) is ACCEPTED. Occupant-count chrome riding both text LOD bands is
ACCEPTED. Gates at `3d416f3`: repository vitest 222 files / 3,003; browser 186/0/4/0 of
190; both tsc; build.

The Owner's critical experience test now maps: select production and inspect its stage —
yes, in-world; see people travel and facilities become occupied — yes, witnessed; work
resumes/proceeds authoritatively — yes; inspect any inhabitant's job/place/credit — yes;
initiate and inspect real construction — yes; observe events and react from the world —
yes. Facility-capacity queues remain latent in shipped config (recorded Owner decision).
