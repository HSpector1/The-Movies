# Campaign 1 — Lot Content Expansion ("A Studio You Actually Build") — Log

Branch: `lot-content-expansion-v1` off `main` @ `24fb87b` (accepted Master Plan v1.1).
Authorized by Owner 2026-08-17. Fable = Game Director/PM (play, diagnose, dispatch,
review, KEEP/KILL, integrate, final playtest). Opus agents implement. One production
writer per overlapping mutable surface. Small commits. Push accepted milestones.

Governing docs: `THE-MOVIES-PARITY-MASTER-PLAN.md` §9 (scope, non-goals),
Owner authorization order (M1–M8), `docs/SHIFT-OPERATIONAL-LAWS.md`,
`FIRST-MOVIE-JOURNEY-HANDOFF.md` (regression law).

## Binding campaign laws (from the authorization)

- FMJ is load-bearing: existing FMJ tests pass **without weakening**.
- Attack the twice-found defect family: overly strict closed-world predicates,
  duplicate-name assumptions, one-shot-per-studio workflows, re-entry after
  cancellation, stale identity assumptions, orphaned guidance references after
  building mutation. **Unit-green but browser-broken is not DONE.**
- Identity must not depend on coordinates; fixed coordinates are not business logic.
- 28×26 is the starting property; architecture must not cap lifetime buildings at
  eight or assume one immutable boundary.
- Two-production concurrency is transitional: don't raise it, don't hard-code
  around it being permanent.
- No decorative blueprints; every C1 facility changes a real existing number.
- Founding placements excluded from move/demolish until the Flip (C2).
- Out of scope: Sets, Founding Flip, concurrency overhaul, Awards, Rank,
  landscaping *scoring*, research, era, genre rewrite, Star needs, relationships,
  addiction, sandbox, machinima, macroeconomy closure.

## PM recon (pre-dispatch, personally read)

- `src/core/lot.ts` (296): authored constants LOT_WIDTH/DEPTH=28/26, LOT_ROADS (5
  rects), LOT_PARCELS (10; 8 buildable, 2 blocked; `expansion` id preserved from
  V11), pure helpers close over the constants; alignment with renderer world is BY
  HAND + tests. Severance walk, road frontage per parcel.
- `src/core/placement.ts` (1013): StudioPlacement {mode, nextPlacementId,
  facilities: PlacedFacility[]}; queryPlacement evaluates every cell, 9 rejection
  codes, money last; commitPlacement re-queries, byte-neutral on refuse; identity
  via `deriveIdentity(base, id, taken)` — **the annex grandfathering pattern**;
  completion pass appends `placedStudioFacility` to operations.facilities;
  invariants assert operations.facilities == INITIAL_STUDIO_FACILITIES ⧺
  operational placements (ascending completesWeek, id).
- `src/core/operations.ts`: INITIAL_STUDIO_FACILITIES = 5 capacity facilities
  (development-casting, post-building, scenery-shop, soundstage-07, soundstage-12).
  Gate/Admin/Theater are NOT engine capacity facilities — renderer places +
  semantic sites only.
- `ui/src/lot/snapshot/StudioLotSnapshot.ts` (597): BuildingId = closed 9-union;
  BUILDING_ACTION/BUILDING_LABELS as Record<BuildingId,…>;
  LotPlacementProjection already carries lotWidth/lotDepth/parcels/placements/
  catalog as data. Placed facilities are painted from the projection but are NOT
  first-class buildings (known accepted gap).
- `ui/src/lot/tycoon/world.ts` (926): WORLD_PLACES = authored 9 places
  (texKey/gx/gy/fw/fd/anchors) keyed by BuildingId; ROADS/PLAZA/APRONS/PATHS/
  EXPANSION_PADS/landscaping authored here. Geometry duplicated with lot.ts.

## Frozen M1 design (PM architectural decision)

Split: **M1a engine** then **M1b UI/renderer** (different mutable surfaces,
sequential on the seam).

M1a (engine):
1. `PropertyState` on GameState: bounds {width,depth}, roads, parcels, landmarks —
   initialized from today's exact authored data. `INITIAL_PROPERTY` constant;
   lot.ts logic parameterized by property (constants remain only as the initial
   authored data). Landmarks = gate/admin/theater with engine-owned footprint
   geometry (numbers lifted from today's world.ts; engine owns geometry as pure
   data, renderer keeps only presentation metadata).
2. Founding placements: the 5 capacity facilities become PlacedFacility entries
   (kind 'founding', verbatim facilityIds, geometry = today's world.ts footprints,
   status operational, week 0, **no capex ledger, zero opex** — representation
   change must be economy-byte-neutral). INITIAL_STUDIO_FACILITIES becomes derived
   from founding placements (same order); invariants updated, not weakened.
3. SaveFileV13: property + founding entries persisted; V12→V13 migration
   synthesizes them; historical-boundary guards; round-trip determinism.
4. Proofs: (a) representation-neutrality — a migrated V12 world simulated N weeks
   equals the V13 world on all cash/ledger/production outputs; (b) scalability —
   12+ placements fixture passes every invariant; (c) full vitest green.

M1b (UI/renderer):
1. Snapshot building list becomes dynamic: landmarks + founding + placed
   facilities, each id/label/position/footprint; BuildingId widens to string with
   founding ids preserved verbatim; label/action lookups become functions with
   per-blueprint defaults (Record types retired without breaking founding paths).
2. world.ts geometry authority retired: scene consumes positions/footprints from
   snapshot; renderer keeps presentation tables (texKey/anchors) keyed by founding
   id + per-blueprint anchor templates for placed facilities.
3. Placed facilities become first-class: selectable, standard inspector hierarchy,
   presence anchors, receipts — closing the accepted "no first-class BuildingId"
   gap.
4. Render-parity gate: Week-0 world identical to pre-M1 (structural tuple: objects/
   actors/decoded bytes/draws unchanged; law 25 re-pin only with named reasons).
5. FMJ specs pass unmodified.

## Dispatch record

(appended per milestone)

## M1a — RULING: KEEP (2026-08-17)

Engine agent delivered property-as-state on 6 commits (`c057fc0..d616180`).
PM verification: 227 files / 3,135 tests green (rerun personally), both tsc clean,
diff reviewed. UI touches limited to the exact V11→V12 precedent (makeSaveV13 in two
canonical-state guards, adapter migration chain, engine-migrated fixtures — nothing
hand-edited). Judgment calls accepted and documented in code: clearance ring does
NOT see authored structures (including them would newly reject 311 origins =
behavior change; grandfathered like founding move/demolish exclusion); structure-
overlap invariant runs last (can only add, never reorder, a verdict).

**Design reconciliation:** M1a implements `PropertyStructure` entries in
`state.property.structures` (8 bodies, roles landmark/founding,
`providesFacilityIds` links) with INITIAL_STUDIO_FACILITIES untouched — this
supersedes the log's earlier "founding facilities become PlacedFacility entries"
phrasing. Simpler, byte-neutral, invariant-safe.

Notes for later milestones: `propertyOf(state)` fallback seam (property-less state
silently gets INITIAL_PROPERTY — correct only for V12 semantics; watch);
`casting` body provides no engine facility (bodies stand at Development, accepted
M1.5 behavior — inspector copy must stay truthful); initial property's real
placement capacity ≈ 12 (3×2+ring) — the parcel map, not code, is now the binding
constraint, as intended. Neutrality proof includes 34-week byte-identity
(incl. rngState) of migrated-V12 vs native-V13 worlds.

## M1b + evidence-chain repair — RULING: KEEP (M1 complete, 2026-08-17)

M1b (11 commits, `2ef2b5b..8abfc69`): BuildingId opened (string alias; FoundingBuildingId
preserved verbatim); snapshot carries LotPropertyProjection (bounds + composed building
list); new `ui/src/lot/tycoon/buildings.ts` — one join of engine geometry ×
presentation, fail-neutral, duplicate-ids-drop-both; world.ts retired to presentation;
placed facilities first-class (`placed-<id>`: selectable, standard inspector hierarchy,
presence via blueprint anchor templates, completion receipts name the facility); legacy
`expansion` contract preserved exactly (parcel body owns its ground; a placement ON the
legacy parcel IS the Annex — one owner per ground). Structural pins UNTOUCHED.

Evidence-chain repair (`f196887`, PM-authored): M1a advanced the committed fixture
corpus to V13 but three generators (scenery-load-in, live-week-advance,
lot-native-next-event) + four Playwright twins still pinned V12 → beforeAll gates threw,
35 tests "did not run" in the first full run. Same class/repair as 628d8ad. All three
generators advanced to the V13 boundary; every committed fixture reproduces
byte-identically EXCEPT two that were legitimately generator-stale since the FMJ seal
(casting-review, script-review carried the killed actor-as-writer trap `t-act-02`;
regenerated bytes carry `t-wri-04` per sealed FMJ law). Spec pins re-measured at
identical strength with provenance comments; recap version pin follows the boundary.

**M1 gates (PM-rerun, final tree):** vitest 228 files / 3,145 tests, 0 failed ·
root+ui tsc clean · Playwright FULL 195 passed / 4 env-gated GPU skips / 0 failed /
0 did-not-run (14.8m, exit 0; +1 = new first-class-facility spec) · structural tuple
pins unchanged · FMJ specs unmodified and green.

## M2 — RULING: KEEP (2026-08-17)

Engine agent (continued from M1a) delivered the declarative blueprint/unlock schema
on 4 commits (`5951b81..d9c5be3`). 8-kind typed `requires` union (date/facility/
structure live; rank/certificate/award/research/landZone declared, honestly
evaluatable as not-yet-attainable — C3/C4 activate each with one case + one
LIVE_REQUIREMENT_KINDS entry); pure evaluator with player-safe locked-reason
vocabulary (pinned by shape tests: full sentences, no code names); two new rejection
codes `requirementsUnmet` → `instanceLimit` ranked after geometry, before money;
maxInstances binds the NEXT build only (history never invalidated by catalog
corrections — standing law); `quoteForBlueprint` split keeps the runner invariant
(only catalog blueprints are ever charged; verified at queryPlacement personally).
Accepted addition: `UnmetRequirement.notYetAttainable` so M5 can style "work toward
this" vs "not in the game yet" without string-sniffing. Annex behavior unchanged.

PM gates: root+ui tsc clean; vitest full: one flake in StudioLotScreen.test.tsx on
first pass (1/3,170), isolated rerun 60/60 and full rerun 229 files / 3,170 tests
all green — same unreproduced-under-contention class as the FMJ-era flake; WATCH
ITEM, not cleared silently. No Playwright surfaces touched beyond compile-forced
rejection sentences (two new player sentences in buildMode).
