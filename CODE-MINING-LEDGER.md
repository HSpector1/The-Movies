# Code-Mining Ledger

Donor archaeology for the tycoon world conversion. Every entry records provenance and a
license ruling BEFORE any donor-derived implementation lands. Standing law: GPL/unclear →
CLEAN-ROOM REIMPLEMENT (learn behavior, never paste); permissive (MIT/BSD) → ADAPT allowed
with attribution recorded here; no proprietary/decompiled/leaked source; no donor art.

Entries are appended by research agents and accepted by Fable.

---

(entries pending — camera/zoom [OpenRCT2], placement/footprint [OpenRCT2 + CorsixTH],
task/occupancy/queue [CorsixTH] squads dispatched at shift start)

---

## Entry 1 — Workplace task/occupancy/queue spine

**PROBLEM** Authoritative workplace spine: TASK → DESTINATION → TRAVEL → ARRIVAL →
OCCUPANCY/QUEUE → WORK → COMPLETION for named people, pure deterministic TS engine,
weekly outer tick, renderer interpolates. No Sims autonomy.

**DONOR** CorsixTH (Theme Hospital reimplementation), clone at
`3aa4adae516aaa186b3605d223130765e9366f1e` (2026-08-12), inspected in scratch only.

**LICENSE / NOTICE** `CorsixTH/LICENSE.txt`: ~120 copyright lines (2009–2026) followed by
the verbatim MIT permission/disclaimer body (L130–146). MIT confirmed on disk; 297/298
Lua files carry the block. LGPL items in the notice attach to the C++/binary layer only,
not the mined Lua. Original Theme Hospital assets are not in the repo.

**FILES / MODULES** Action queue: `Lua/entities/humanoid.lua` (L584–704 start/queue/
finish/setNextAction; teardown L626–656), `Lua/humanoid_action.lua`. Single-timer:
`Lua/entity.lua` L183–260. Clock: `Lua/world.lua` L722–996, `Lua/date.lua` L49 (50 h/day).
Dispatcher: `Lua/calls_dispatcher.lua` (whole file). Travel: `Lua/humanoid_actions/walk.lua`.
Rooms: `Lua/room.lua` (occupancy L316–658, advance L549–565). Queue: `Lua/queue.lua`,
`Lua/humanoid_actions/queue.lua`. Door mutex: `Lua/objects/door.lua`. Work phases:
`Lua/humanoid_actions/use_object.lua`. Availability: `Lua/entities/humanoids/staff.lua`
L514–575. Examples: `Lua/rooms/gp.lua`, `Lua/rooms/ward.lua`, `Lua/objects/reception_desk.lua`.
Pathfinder: `Src/th_pathfind.{h,cpp}` (A*, Manhattan, unit cost).

**MECHANISM (essence to reimplement)**
1. Per-person `action_queue`; `[1]` executes. Four ops only: start / queueAction /
   finishAction (shift+start) / setNextAction (tear down non-must_happen tail). Teardown
   MUST release: queue membership, object reservation, room expectation. Interruption is
   two-phase cooperative (`todo_interrupt`), never forced mid-flight.
2. Dispatcher: `Call = {target, key, verification(p), priority(p), execute(p)}`, identity
   `(target,key)` idempotent; push (new call → best worker) and pull (idle worker → best
   call) both min-score folds; preemption when a better-scored worker appears. Scores in
   units of walking distance (tiles): `path − 5·queueLen − 40·fatigue − 50·inRoomBonus …`.
3. Availability is ONE bit (`isIdle`); workers have no desires. The dispatcher decides.
4. Completion = a CHECKPOINT no-op action reaching queue front; if torn down instead, its
   on_remove re-dispatches the call. Completion-as-queue-position survives interruption.
5. Room: `occupants` + `enroute` (committed, not arrived) + two capacity axes (crew
   criteria min/max; subjects ≤ maxSubjects). Admission predicate single function;
   membership announced by the traveller on tile-set, never polled.
6. Queue lives on the DOOR (mixed traffic incl. leavers), priority tiers 1–6 with stable
   insert; `reported_size` counts only player-relevant tiers and is exactly the array
   tail; three-state membership EXPECTED→QUEUED→ADMITTED so demand counts at commit time;
   advancement is event-driven pull (`tryAdvanceQueue` on state changes), no polling;
   `door.reserved_for` is the mutex; queue world-position derived, never stored.
7. Time: one tick = one hour, 50 h/day fixed inner loop; presentation speed is a separate
   dial. One timer per entity, owned by the current action ("the whole scheduler").
   Travel = 8 ticks/tile constant; sprite slaved to the timer.
8. Work = integer phase machine (−6…0…6, only phase 0 loops); progress is a countdown in
   the loop callback; durations from skill (GP: 3–18 ticks, p(done)=0.7+0.3·skill;
   reception desk: 4–54 ticks/customer).

**WHY USEFUL** A shipped, battle-tested implementation of exactly our spine with our
authority model (pushed tasks, one availability bit, no autonomy).

**RULING** CLEAN-ROOM REIMPLEMENT (recommended; donor entangled with mutable graphs,
serialized closures, anim-derived durations, scattered math.random — all forbidden here).
MIT permits ADAPT with attribution: ship LICENSE.txt L3–128 (all names) + L130–146
verbatim in a THIRD-PARTY-NOTICES file. If any literal constant tables survive (priority
tiers, weight sets), add the notice regardless as cheap insurance. No donor code/assets
enter the build.

**PROJECT: STUDIO APPLICATION**
- Keep week as the only authoritative outer tick; add fixed integer BEATS_PER_WEEK = 10
  inner loop inside `tick()` (mirrors World:onTick). Beats are engine-internal; the week
  remains the save/reporting boundary. The tick emits a deterministic beat timeline the
  renderer plays back over wall time — travel/work become watchable without a second clock.
- One timer per person: single `beatsRemaining` field owned by the current step.
- Data model: Task {targetId, key, kind, requiredRole, label, assignedTo} (verification/
  priority/execute as pure functions switched on `kind`, never closures in state); Step
  union SEEK/TRAVEL/QUEUE/WORK/IDLE/CHECKPOINT/LEAVE with envelope flags; Person {at,
  steps[], beatsRemaining, onTask, inFacility}; Facility {requiredCrew, maxCrew,
  maxSubjects, occupants, enroute, admitting, queue}; Queue {entries priority-ordered,
  expected, reportedCount = tail}.
- Travel: authored lot node graph + Floyd–Warshall all-pairs matrix; TRAVEL.beats =
  matrix lookup; NO A*, no tile pathfinding — largest simplification available.
- Ten invariants to unit-test verbatim (steps never empty; occupants⟺inFacility;
  task⟺person one-to-one; admitting ≤1; crew/subject caps; one queue, expected XOR
  entries; beatsRemaining positive-int decrement-by-1; completion only via CHECKPOINT;
  TRAVEL.beats = matrix; teardown releases queue+reservation+enroute — test interruption
  at every pipeline stage).

---

## Entry 2 — Build-footprint legality, placement preview, construction lifecycle (OpenRCT2)

**PROBLEM** Build mode → pick facility → grid-snapped ghost preview → legality (occupancy,
terrain, road/clearance) → authoritative cost at commit → N-week construction site →
operational capacity. Deterministic, save-persistable, pure engine.

**DONOR** OpenRCT2, shallow clone inspected in scratch only.

**LICENSE / NOTICE** `licence.txt` is verbatim GPLv3 (no linking exception). readme §6
confirms. Source headers: "OpenRCT2 is licensed under the GNU General Public License
version 3." GPLv3 is incompatible with our proprietary distribution.

**RULING** **CLEAN-ROOM REIMPLEMENT ONLY.** No code, comments, constants, enum orderings,
or transliterated identifiers may be copied. Implementers work from this prose entry with
the donor source closed. Do not reuse donor identifier names or magic constants.

**FILES / MODULES** actions/GameAction.hpp (Query/Execute virtuals), actions/CommandFlag.h,
actions/GameActionResult.h, actions/GameActionRunner.cpp (QueryInternal L167,
ExecuteInternal L264), world/ConstructionClearance.{h,cpp} (MapCanConstructWithClearAt
L181), world/QuarterTile.h, actions/scenery/LargeSceneryPlaceAction.cpp (multi-tile
reference), actions/footpath/FootpathPlaceAction.cpp, world/Scenery.{h,cpp} (ghost
lifecycle), openrct2-ui/windows/Scenery.cpp (onToolUpdate/TryPlaceGhost*),
openrct2-ui/windows/Footpath.cpp (ProvisionalFootpath), management/Finance.cpp.

**MECHANISM (clean-room spec, in our own words)**
- Every mutation is an action object of serialisable params + flag word, exposing Query
  ("would this succeed, what cost?") and Execute. Both return {errorEnum, message+args,
  worldPosition, cost, expenditureCategory}.
- THE RUNNER INVARIANT: Execute always calls Query first and aborts on error — one
  legality implementation, no drift. The charged cost is computed inside Execute at commit
  time; the UI's cached number is display-only.
- Ordering: domain legality errors outrank insufficient-funds (money checked only after
  the action's own query passes). Money required unless no-money mode/editor/noSpend/ghost
  flags; affordability = cost<=0 || cost<=cash.
- Nested query/execute variants skip pause gate/network/money/logging so compound actions
  aggregate cost from sub-actions.
- Ghost preview: donor inserts REAL elements flagged ghost into world state (placed via
  the same action with ghost|noSpend), then must defend everywhere (clearance skips
  ghosts; network strips ghosts; tool-cancel/save strips ghosts). Cursor loop: hit-test →
  update highlight → early-out if (kind,tile,quadrant,height,object) unchanged since last
  frame → remove old ghost → try place new; failure shows no preview/cost. CAUTIONARY:
  we reject ghost-in-sim-state; preview must live in a UI-only layer.
- Multi-tile footprint: blueprint = list of tiles {offset xyz, zClearance, quarter-mask,
  index}; placement = origin + direction 0-3; rotate offsets AND masks by direction; base
  height = max ground under footprint (object never follows terrain); per-tile clearance
  query accumulates auto-clear costs; footprint must be uniformly above OR below ground;
  Query fails fast on first bad tile (donor weakness — we evaluate all cells instead).
- Clearance query inputs: tile, Z-range, quarter mask, flags, slope, optional ignored-ride,
  and a clearing callback that prices/permits obstruction removal. Overlap test = Z ranges
  intersect AND quarter masks intersect; escape hatches (clearing fn, slope tuck,
  level-crossing rules) else typed obstruction error.
- Footpath rule order: off-map → land not owned → irregular slope → below min height →
  above max height → invalid direction.
- No construction-time concept exists (instant placement). Ride status machine
  (closed/testing/open) uses the same query(false)/execute(true) split.

**WHY USEFUL** The runner invariant (Execute = Query-then-mutate, single implementation),
independent suppressible side-effect flags, rotation applied to offsets+masks, ordered
legality lists with typed errors, and the cautionary ghost tale.

---

## Entry 3 — Room/parcel placement, per-cell legality, built/active lifecycle (CorsixTH)

**PROBLEM** As Entry 2, on a coarse parcel grid over authored art.

**DONOR** CorsixTH, same clone as Entry 1.

**LICENSE / NOTICE** MIT confirmed on disk (LICENSE.txt: ~125 copyright lines + verbatim
Expat grant; every Lua file repeats it). Theme Hospital's own assets/data are NOT licensed.

**RULING** ADAPT permitted with attribution (ship full copyright block + permission notice
in THIRD-PARTY-NOTICES if any recognisable code is lifted). RECOMMENDED: clean-room from
this spec (Lua/C++ would be rewritten anyway; rules are game-design facts). Any verbatim
lift must be flagged so the notice ships.

**FILES / MODULES** Lua/dialogs/edit_room.lua (placement state machine; checkReachability
L841; setBlueprintRect L1136; validDoorTile L1225), Lua/dialogs/place_objects.lua
(footprint legality L696-871), Src/th_lua_map.cpp is_valid() L244 + updateRoomBlueprint,
Src/th_map.h tile flags L120-164, Src/th_map.cpp is_parcel_purchasable L816, Lua/room.lua
(initRoom L52, roomFinished L716, deactivate L1015), Lua/world.lua newRoom L625 /
markRoomAsBuilt L640, Lua/hospital.lua purchasePlot L583.

**MECHANISM (essence)**
- PARCELS over tiles: numbered parcels (0 = outside) each owning tiles; per-parcel owner;
  purchasable iff non-zero, unowned, and adjacent to owned-or-outside; matrix rebuilt on
  ownership change; buying = check→price→afford→set owner→spend (also bumps valuation).
- Tile flags: passable, 4 directional travel edges, buildable, room, and
  passable_if_not_for_blueprint (a RESTORE SLOT while a blueprint overlays passability).
- Room-tile legality = 4 conjuncts: blueprint valid ∧ tile not in a room ∧ buildable ∧
  owned. Size/doors/reachability layered separately.
- Blueprint rect update: clamp into bounds (shrink, don't slide); byte-identical early-out;
  EVALUATE EVERY TILE (green/red per cell, aggregate valid) — never fail-fast; preview
  writes a separate UI layer; only shadowed passability touches sim, restored from slot.
- Phase machine: walls → door → windows → clear_area → objects → closed. Confirm button
  enabled-ness IS the current phase's legality verdict. Door legality checks wall content
  + both flanking tiles (owned, unoccupied, exclusively passable); swing doors return a
  per-segment failure bitmask. clear_area = wait-for-people gate (re-check timer), not a
  duration. Objects phase: requirements map decremented by present objects.
- Payment at FINAL confirm (minus already-paid required objects), guarded by a paid flag;
  plus a pre-gate: the picker refuses to open when cash < cost. Affordability checked
  twice.
- REACHABILITY (best single rule): with footprint marked impassable, walk the ring of
  perimeter tiles in order; for each consecutive passable pair require a path; failure =
  placement would sever the lot. O(perimeter) queries, no flood fill.
- Object footprints: offsets with {optional, only_passable, only_side, shareable} flags;
  4 ordered checks per tile; optional cells fail only collectively; moving an object
  de-occupies self first (avoids self-collision).
- LIFECYCLE: room ids monotonically increasing (never promptly reused — stale refs fail
  loudly); initRoom sets built=false; markRoomAsBuilt → roomFinished sets built=true,
  is_active=true, seeds happiness, pulls waiting patients, broadcasts. CAPACITY GATED ON
  is_active, NOT existence — the site exists/occupies land contributing zero capacity
  until the flag flips. Editing deactivates. No construction-time concept anywhere.

**PROJECT: STUDIO APPLICATION (both donors, agreed spec for M2)**
- Coarse parcel LotGrid (~12×8) over authored art; Parcel {id, terrain:
  buildable|blocked|road|gate, zone, ownedFromStart}; OccupancyIndex DERIVED from
  facilities[].cells, never persisted.
- FacilityBlueprint constants in TUNING: {footprint offsets (+optional), rotations,
  requiresRoadAdjacency, clearanceRing, buildWeeks, cost, capacity}. Flat grid — no Z,
  no slopes, no quarter masks.
- Preview: UI-only layer; pure queryPlacement called per cursor move with identical-input
  memo early-out; per-cell green/red; Build button enabled = quote.ok; cost box from
  quote; legality errors outrank money in `primary`.
- Engine shape: queryPlacement(state, req) → PlacementQuote {ok, cells, cellLegality[],
  cost, buildWeeks, completesOnWeek, capacityDelta, rejections[], primary};
  commitPlacement(state, req) MUST call queryPlacement first, return state unchanged
  (reference-equal) when !ok, and charge the internally computed cost — never a UI value.
  Unit test: !ok ⟹ same state ref; property test: commit quote deep-equals query quote.
- Rule order: unknownBlueprint → offLot → notOwned → terrainUnbuildable → occupied →
  clearanceRingBlocked → noRoadAccess → seversLot (perimeter walk) → insufficientFunds.
- Lifecycle: Facility {id monotonic, blueprintId, origin, rotation, cells, status:
  underConstruction|operational|mothballed, placedWeek, completesWeek}. Commit: occupy
  cells + debit immediately, status=underConstruction. Weekly tick pure pass: week >=
  completesWeek → operational. Capacity aggregation reads ONLY operational.
- Explicitly rejected: ghost-as-real-element; fail-fast query.

---

## Entry 4 — Tycoon camera, zoom readability, minimap (OpenRCT2)

**PROBLEM** True tycoon camera for a fixed-scene-less world: drag/edge/key pan, zoom over
discrete levels, bounds clamping, and readability at every zoom.

**DONOR** OpenRCT2, shallow clone `8ebe3965a2f1e2540f8882a1d67e7b66f5470195`, scratch only.

**LICENSE / NOTICE** GPL-3.0-or-later confirmed on disk (licence.txt full GPLv3; readme
§6; per-file headers). **RULING: CLEAN-ROOM REIMPLEMENT** — this entry is the interface;
implementers never open the donor tree. Numeric constants are feel-facts; re-derive our
own against our art scale.

**FILES / MODULES** interface/Viewport.{h,cpp}, interface/ZoomLevel.{h,cpp},
interface/Window.cpp (WindowZoomSet L432, WindowScrollToLocation L336, anchor table
L51-69), openrct2-ui/input/MouseInput.cpp (drag L533-633, edge L1597, scroll L1632),
drawing/Drawing.Sprite.cpp (zoom-sprite substitution), paint/* (per-feature cutoffs),
windows/Map.cpp (minimap), windows/Viewport.cpp (secondary camera).

**MECHANISM (essence)**
- Zoom = one signed int, log2(world-units/screen-px), range −2..+3 (4x..1/8), NO
  continuous zoom anywhere; pinch resolves to integer steps (accumulate, step at
  threshold, reset).
- Zoom-at-cursor: step one level at a time; keep screen centre fixed via ±ViewWidth/2
  (in) and −ViewWidth/4 (out) at the new zoom; then correct by the cursor's offset from
  centre scaled at the appropriate zoom.
- Drag pan: 1:1 (actually 2× naive rate), sign-preserving shift to avoid a truncation
  deadzone, cursor warped back each frame (unbounded drag), <500 ms release = context
  click. NO inertia, NO smoothing — and RCT feels good; evidence neither is needed.
- Keyboard/edge scroll: held-state polled per frame; speed multiplied by zoom so
  apparent speed is constant; horizontal speed doubled near edges (iso halves Y).
- Bounds: clamp the camera's WORLD-SPACE CENTRE (not screen rect), generously past the
  playable edge so the border can be framed; re-centre if clamped.
- Scroll-to-location: 17 anchor fractions ({.5,.5}, {.75,.5} … eighths), pick the first
  whose screen point is not covered by an open window (+10px inflation); glide at
  ceil(remaining/8)/frame — exact-terminating exponential ease-out.
- Hit-testing renders a 1×1-px paint pass and respects the zoom-sprite substitution —
  you can only click what you can see.
- READABILITY DOCTRINE (the crown jewel): (a) pre-authored half-res LOD sprite chains —
  zoomed-out is different, hand-tuned, higher-contrast ART, not filtered shrink; (b)
  hard per-feature visibility cutoffs (½: litter/particles/money text/height labels/
  grass variation/sign text→blank sign; ¼: path additions/banners/most riders, peeps
  unclickable; ⅛: ALL entities gone) — anything <~2 dest px or text-borne is REMOVED,
  never shrunk; (c) text is never scaled down, it disappears (one world-text site,
  disabled above zoom 0); (d) sub-pixel snapping: dest origins quantised to 2^zoom
  lattice; entity positions floored to 2/4-unit grids at deep zoom; entity tween
  interpolation OFF at any zoom > 0; (e) zoom-aware invalidation: every dirty-mark
  carries maxZoom visibility so deep-zoom repaints skip invisible detail.
- Minimap: fixed-scale 2px/tile palette raster diamond, incrementally rebuilt 16
  lines/tick (self-healing, never cleared); entities as 1px overlay after blit; camera
  indicator = 8 corner ticks (not an outline), size derived from ViewWidth; click/drag →
  the same eased scroll-to-location. Secondary camera window: independent viewport,
  mirrors flags, own zoom, locate drives main camera.

**PROJECT: STUDIO APPLICATION (Phaser 3)**
- Discrete ladder LEVELS=[0.25,0.5,1.0,2.0] (logical int index; tween rendered
  camera.zoom ~120-150ms Cubic.easeOut; remove detail on tween start, add on end;
  retarget never queue). Zoom-at-cursor via getWorldPoint before/after + preRender,
  applied per tween step. Wheel/pinch at cursor; keys/buttons at centre. Trackpad
  debounce: accumulate deltaY, step at |accum|>40.
- Clamp: setBounds inflated ~15% of lot short edge; when world*zoom < viewport, centre
  instead of clamp; floor zoom so world ≥ ~40% of viewport.
- Bindings: middle-drag + Space+left-drag pan (left stays selection; right is browser
  menu); arrows+WASD held-state, velocity BASE/zoom × delta; edge scroll DEFAULT OFF in
  browser (setting); wheel/+−/PageUp-Down one step; pinch ~15% distance per step; Home
  reset; double-click/minimap → focusOn.
- focusOn(worldPoint,{avoidPanels}): scroll += (target−scroll)×0.18/frame, terminate
  <0.5px; anchor table {.5,.5}→{.75,.5}→{.25,.5}→{.5,.75}→{.5,.25}→corners→eighths, first
  framing not under an open panel (+12px).
- Readability: (1) two authored sprite tiers per building (simplified, higher-contrast
  half-scale), swap at index ≤1 — shipping one tier = unsolved; (2) labels counter-scaled
  (setScale(1/zoom)) to constant screen size, hidden wholesale below threshold: idx 3-2
  full labels+badges; idx 1 names only; idx 0 NO text, flat category-colour icons; (3)
  cull <~6 screen px things (people/vehicles/props/particles) at idx ≤1 via
  visible=false; (4) cam.roundPixels=true + entity grid rounding at deep zoom; integer
  zoom factors; (5) disable entity position lerping at idx ≤1; (6) ground simplifies to
  flat colour regions at idx ≤1 (drop texture variation/shadows/dither).
- Minimap: 4px/tile RenderTexture, incremental row slices, flat category colours, camera
  as 4 corner ticks, click/drag → focusOn, entities as post-blit dots.
- SKIP: pan inertia, continuous zoom, camera rotation.
