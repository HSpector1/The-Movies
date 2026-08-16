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

## Keep/Kill record

- (pending)
