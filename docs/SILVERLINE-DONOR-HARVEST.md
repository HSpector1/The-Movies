# Silverline donor harvest

Silverline is a visual R&D donor. It is not a candidate renderer architecture and
must not become a simulation authority.

## Preserved source

- Branch: `silverline-campus-experiment`
- Parent line: `phase-5.1-talent` at `3ac66bbbe1f29ecac44c1632ba23952fad8fe61d`
- Preservation commit: `2e194a8` (`feat: preserve Silverline campus experiment`)
- Target line: `visual-tycoon-conversion-spike` at validated HEAD
  `8e84398cdd81734f8da773f3491e8d5b0018a055`
- Target renderer: `ui/src/lot/three/ThreeLotScene.ts`

## Donor classification and transplant map

| Priority | Silverline donor and source | Class | Visual benefit | Target module(s) | Existing authority | New snapshot data | Complexity | Principal risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Institution-scale campus footprint and management-distance composition: `StudioLot3D.tsx` ground, campus layout, overview frames | B | Reads as a studio institution with room to grow rather than a small diorama | `StudioLotSnapshot.property`, `tycoon/buildings.ts`, `tycoon/world.ts`, `environment3d.ts`, `ThreeLotScene.ts` camera fit | Property bounds, parcels, buildings and placements already exist | None for truthful current bounds; only required if the simulation introduces new acreage tiers | High | Enlarging presentation without corresponding property truth, or making active ground appear buildable |
| 2 | Departmental districts: `addCampusFacility` and its casting/production/post/wardrobe/props/scenery/commissary/research grouping | B | Strong operational zoning and readable studio departments | `tycoon/buildings.ts`, blueprint presentation in `tycoon/world.ts`, `buildings3d.ts` | Placed facilities and capability classes already exist | None when districts are composed from real facilities; a renderer-facing district label would require a projection only if the engine owns that grouping | High | Inventing departments or buildings absent from authoritative state |
| 3 | Four-stage production district and varied stage massing: `BUILDINGS`, `addStageDetails`, Stage 03/04 donor silhouettes | B | Repetition with variation creates a convincing production plant | `buildings3d.ts`, `composeWorldBuildings`, `ThreeLotScene.ts` | Open-ended stage identities, placed soundstages and production stage assignment already exist | None | Medium | Copying Silverline's fake stage count or active-production markers |
| 4 | Continuous internal roads, sidewalks, crossings and service alleys: `roadSpecs` and crossing/curb dressing | B | Makes the campus navigable and supplies human/vehicle scale cues | `tycoon/world.ts` zoning tables and tests; `environment3d.ts` ground bake/physical kerbs | Current roads, paths, aprons, service spur and parking are already authored | None while circulation remains presentation over authoritative parcel geometry | Medium | Painting circulation across buildable or occupied cells and implying false access |
| 5 | Parking and star-trailer/service compounds: `addParkingLot`, `addTrailerCompound` | B | Working-studio logistics, VIP hierarchy and believable empty-space use | `tycoon/world.ts` dressing inventory; `props3d.ts`; `environment3d.ts` | Parking exists; trailer, sedan, truck, generator and cable-reel bodies exist | None for non-semantic dressing; existing week-theater data should ground production-specific activity | Low-Medium | Props visually claiming buildable ground or implying a production that is not active |
| 6 | Metro, Western and Garden backlot-set vocabulary: `addCityDetails`, `addWesternDetails`, `addGardenDetails` | B | Gives productions visibly different worlds and strengthens the movie-making fantasy | `buildings3d.ts`/`props3d.ts` set-kit builders; `ThreeLotScene.ts` set dressing; existing `snapshot/setDressing.ts` | `StudioLotSnapshot.sets`, set kind, stage mounting, condition and work state already exist | None for the existing set vocabulary | High | Copying them as permanent fake facilities instead of rendering the authoritative mounted set |
| 7 | Perimeter, gate arrival and city-edge framing: `addStudioEntrance`, perimeter walls, `addExpandedCityBlock` | B | Clear owned-campus boundary and a stronger Hollywood location | `environment3d.ts` `buildPerimeterWall`/`buildSurround`; `buildings3d.ts` gate; `props3d.ts` | Gate building and property bounds already exist; surrounding city is presentation-only | None | Medium | Visual noise competing with the playable lot or making public context look interactive |
| 8 | Building silhouettes and façades: Art Deco administration, gabled stages, storefront row, porches, service façades and physical signs | B | Buildings read by role before labels become legible | `buildings3d.ts`; `materials3d.ts` | Authoritative labels, capabilities and footprints already exist | None | Medium | Literal dimensions conflicting with authoritative footprints or duplicating existing factory bodies |
| 9 | Dense studio clutter, landscaping and period vehicles: trees, palms, lamps, benches, crates, production lights, water tower and billboard | A/B | Removes empty-prototype space and improves era/scale readability | Assets directly; placements through `tycoon/world.ts`; bodies through `props3d.ts`; materials through `materials3d.ts`; public context through `environment3d.ts` | Static dressing inventory plus snapshot-grounded week-theater activity already exist | None | Low-Medium | Excess draw cost, overlap with buildable cells, or decorative activity reading as simulation truth |
| 10 | HUD/world composition and camera framing: whole-campus hero framing, compact top telemetry, selected-place inspector and bottom action dock | A/B | Keeps management decisions readable without surrendering the world view | `StudioLotScreen.tsx`, `lot.css`, `StudioLotView.ts`, `tycoon/world.ts` camera framings | Current snapshot already supplies cash, week, standing, selection and production truth | None | Medium | Copying fake telemetry, hiding the lot, or duplicating current navigation and guidance surfaces |

Class A means directly reusable. Class B means reimplement in the current 3D
architecture. Mixed A/B rows contain reusable art/style references but require new
target-native placement and behavior.

## Directly reusable material

- `ui/public/assets/cosmic-tomorrow-billboard.png`: original ImageGen art; reusable as
  non-semantic in-world dressing.
- `ui/public/assets/studio-lot-splash.png`: original ImageGen art; reusable for splash,
  loading or mood-reference use.
- `ui/public/assets/studio-backlot-ground-v2.png`: original ImageGen tile; reusable as a
  material input or reference, but not as a replacement for target zoning/occupancy.
- `artifacts/screenshots/*.png`: visual reference and acceptance evidence.
- Silverline palette, typographic hierarchy, panel treatment and camera compositions:
  reusable design references; the old DOM/CSS should not be copied wholesale.
- Facility names, silhouette sketches and campus coordinates: concept/reference data
  only; current state must decide which physical bodies exist and where they stand.

All preserved PNG files are Git LFS objects. ImageGen source prompts, generation ids,
timestamps and SHA-256 hashes are recorded in the originating Codex session and in the
preservation provenance report.

## Reject from the transplant

- `StudioLot3D.tsx` as a renderer, lifecycle, camera or selection implementation.
- The fixed claims of 50 acres, four stages, ten facilities, 22 crew and 82 prestige.
- Silverline's invented facility availability, capacity, appeal, condition, queue and
  spatial-relationship text.
- Stage 03/04 or any department body unless the current snapshot contains the facility.
- Active-production-count markers and hard-coded stage occupancy.
- The 22-person parallel route simulation and `takeNumber`-driven speed changes.
- The Autonomous Unit's three fixed tasks and claim that agents synchronized goals.
- `sceneFromPrompt`, `answerSceneQuestion` and hard-coded `ZONE_INFO` as authoritative
  LLM, navigation or simulation systems.
- Scene-preset changes that imply a production/set/state the snapshot does not publish.
- The old Dashboard integration and any replacement of `ThreeLotScene` or
  `StudioLotSnapshot`.

## Recommended transplant order

1. Establish truthful target-scale composition from current property bounds and camera
   framings; define matched overview/production acceptance frames.
2. Improve circulation and negative space using the target zoning tables: roads,
   crossings, sidewalks, aprons, service alleys and parking.
3. Increase district readability by composing existing authoritative facilities and
   capabilities; add no fictional buildings.
4. Add set-kind visual kits for authoritative Metro/City, Western and Garden sets.
5. Enrich stage and department silhouettes inside `BuildingFactory` while preserving
   each authoritative footprint and label.
6. Strengthen trailer, parking, service-yard and construction dressing through the
   existing prop and week-theater paths.
7. Tune perimeter, entrance and surrounding-city framing in `environment3d.ts`.
8. Increase landscaping and period-vehicle density under the current occupancy/yield
   tests and performance budgets.
9. Integrate only the useful HUD hierarchy into the current Studio Lot shell using
   snapshot facts.
10. Apply generated art assets where they remain non-semantic, then run matched visual,
    truthfulness, performance and full-suite validation.

## Comparison frames

Silverline:

- Whole campus: `artifacts/screenshots/silverline-campus-final-daylight.png`
- Production district: `artifacts/screenshots/silverline-expanded-campus-overview.png`

Validated ThreeLotScene (`visual-tycoon-conversion-spike` at `8e84398`):

- Whole lot: `shots-iter/real3d-final/overview.png`
- Production district: `shots-iter/real3d-final/production.png`

## Comparative judgment

Silverline is stronger at immediate campus breadth, departmental repetition, open
expansion acreage, a restrained management HUD and the visual idea of distinct backlot
genres. ThreeLotScene is stronger at professional asset detail, active production
readability, surrounding-Hollywood context, period traffic, construction, rendering
performance and authoritative state integration. The target should absorb Silverline's
institution-scale composition and set/district variety without importing its renderer,
invented facts or parallel worker behavior.
