# Open Source Art and Architecture Audit

*Read only research deliverable, 2026-08-01. Part of the Project Studio open source art and presentation audit. No production repository, code, or asset was modified to produce it. Full context and rulings are in ART-PRESENTATION-INTEGRATION-BLUEPRINT.md.*


Isometric and management sim references studied for Project Studio (Meridian Pictures), read against the Gate D1 Studio Lot architecture: the pure sim core, the `studioLotSnapshot(state)` selector, the `StudioLotSnapshot` contract, the `ui/src/lot/scene/iso.ts` painter transform, the nine named buildings, and the determinism invariant that presentation may illustrate engine truth but may never manufacture it.

## How to read this

Each repository is one section, ordered by its priority for Project Studio. A section opens with verified facts (URL, branch and commit, activity, language, render tech, code and art and audio licenses, commercial asset dependency, doc quality), then names where the useful implementation actually lives, then treats each pattern in turn: how it works (input data, rendering decision, coordinate system, layering and sorting, asset assumptions, state ownership, performance, tooling), what it is good and bad at, the specific Project Studio translation, one disposition, and the smallest test that would prove or disprove adopting it. Each section closes with an overall disposition and a license risk line. Read a pattern's Project Studio translation and disposition first; read the mechanism only if you intend to act on it.

## Evidence method

Every repository was verified by a real shallow treeless clone (`git clone --depth 1 --filter=blob:none --no-tags`) with blobs fetched lazily on read, license and manifest files read verbatim, and cited files opened in full or in the relevant range. Every finding was then put through an independent adversarial verification pass that re-checked license text, file existence, and asset provenance. Where the raw finding and the verification verdict disagree, this document follows the verdict, and the corrections are called out inline. Nothing below asserts a file path, license, or engine fact that was not directly observed in the corpus.

## Disposition legend

- STUDY_ONLY: learn the technique. Do not port code. Usually the feature is already built in D1, is out of scope per the contract, or is confirmatory of an existing choice.
- CLEAN_ROOM_REIMPLEMENT: the behavior is worth rebuilding in Project Studio's own TypeScript and Phaser from the described behavior only, never by reading or copying the source.
- REJECT: neither the code, the assets, nor the pattern is adoptable for Project Studio.
- ADAPT_PERMISSIVE_CODE: defined for completeness, but not reachable for any repository here. Every code bearing repository in this corpus is either copyleft (GPL, AGPL, MPL) or built on the wrong engine, so no source may be lifted.

The recurring cross cutting lesson, proven by every retail derived repository below: an open source engine does not make the assets it loads legal to reuse, and "open" is not the same as "public domain". OpenGFX is free, famous, and still GPL copyleft. Project Studio's own convention (original or CC0 art with per asset license evidence and a provenance prop) is stricter than any art license seen here, and should stay that way.

---

## 1. OpenRCT2 (priority 2)

### Verified facts

- URL: https://github.com/OpenRCT2/OpenRCT2 (verified live, no redirect).
- Branch and commit: `develop` at `69872010ae6b0febcd1b9b6a53f49e54968ceecc`, HEAD commit dated 2026-07-31.
- Activity: very active, daily PR driven development, copyright headers read 2014 to 2026.
- Language: C++ (modern C++20 and 23), roughly 721 `.cpp` and 630 `.h` and 155 `.hpp`, plus CMake.
- Render tech: custom CPU palettized sprite isometric painter. Per frame `PaintSession` builds `PaintStruct`s, quadrant bucketed painter's algorithm depth sort by 3D bounding box overlap, then software blit via `X8DrawingEngine`, with an optional OpenGL hardware engine. Fixed 2:1 dimetric projection, four cardinal rotations, discrete power of two zoom.
- Code license: GPL-3.0-or-later. Verified verbatim in `licence.txt` (British spelling, this is the source of truth file, there is no `LICENSE` or `COPYING`) and `readme.md` line 147 ("version 3 or (at your option) any later version").
- Art license: separated from code. Retail RCT2 world graphics (`g1.dat`, `csg`) are proprietary Chris Sawyer and Atari assets, not in the repo, required at runtime per `readme.md` line 74. OpenRCT2's own UI and selection and construction overlay sprites in `resources/g2/*.png` (exposed as `SPR_G2_*` in `SpriteIds.h`, used by `VirtualFloor.cpp`) are GPL-3.0 project art and redistributable. Verdict clarifies these PNGs are compiled into `g2.dat` at build time, so the redistributable open art is the source PNGs, not a tracked blob. `Csg.cpp` is a decoder for retail data, not a bundled asset.
- Audio license: separated. Retail RCT2 audio required at runtime, open replacements live in the separate OpenMusic and OpenSFX repos (not audited).
- Commercial asset dependency: no commercial assets bundled (verified via `git ls-files | grep -i '\.dat$'`, only `test/tests/testdata/sprites/example.dat`), but the software cannot run without user supplied retail RCT2 files. This is the canonical clean separation Project Studio already practices.
- Doc quality: high. Sectioned readme explicit about the retail asset requirement, per file GPL headers, heavy comments including preserved original RCT2 assembly address annotations documenting provenance.
- Provenance risk (verdict): LOW. The repository bundles no proprietary assets, so accidental asset contamination is effectively impossible.

### Where the patterns live

Depth sort and paint pipeline in `src/openrct2/paint/Paint.h`, `Paint.cpp`, `Boundbox.h`. Projection and picking in `src/openrct2/interface/Viewport.cpp` and `Viewport.h`. Zoom and LOD in `src/openrct2/interface/ZoomLevel.h`, `paint/Paint.Entity.cpp`, `paint/tile_element/Paint.SmallScenery.cpp`, `drawing/ImageImporter.h`. Construction preview in `world/tile_element/TileElementBase.h`, `openrct2-ui/ProvisionalElements.h`, `openrct2-ui/windows/RideConstruction.cpp`, `paint/VirtualFloor.cpp` and `.h`, with overlay sprite IDs in `SpriteIds.h`.

### Patterns

#### 1.1 Quadrant bucketed painter depth sort by 3D bounding box overlap

Each drawable is a `PaintStruct` carrying a world unit bounding box and a precomputed screen position. There is no z buffer: draw back to front. `RemapPositionToQuadrant` hashes the box origin (rotation aware, four cases) into quadrant buckets, `PaintSessionArrange` walks buckets front to back, and within each bucket `PaintStructsSortQuadrantStable` compares pairs with a rotation specialized 3D AABB occlusion test and reorders the linked list so occluders draw first. Rotation is four compile time template specializations. Every image is placed with an explicit hand authored bounding box. The `PaintSession` is renderer local, rebuilt every frame, owns no simulation truth. A `gPaintBoundingBoxes` debug flag renders all eight box corners. Strengths: correct occlusion for large multi tile mutually overlapping objects that a naive single grid corner key gets wrong, fully deterministic, integer only. Weaknesses: intricate, four rotation code paths, every drawable needs a tuned box.

**Project Studio translation.** `iso.ts` uses `depthFor(gx,gy,layerBias) = (gx+gy)*16 + layerBias` over a `LAYER` enum. That is correct while drawables are discrete grid aligned buildings (the nine `BuildingId`s). This AABB overlap sort is the documented escalation path only if multi tile silhouettes (Stage A and B, Theater) or moving ambient crew begin to overlap ambiguously and the flat key z fights.

**Disposition:** STUDY_ONLY.

**Validation test.** In a Phaser harness, walk a crew sprite from behind to in front of a soundstage corner and assert `iso.ts` `depthFor` already orders them at every position. Only a demonstrated failure justifies reimplementing the box sort.

#### 1.2 2:1 dimetric transform with four way rotation and analytic inverse

`Translate3DTo2DWithZ` (Viewport.cpp:1924) rotates the world position by integer coordinate rotation, then `screen = { rotated.y - rotated.x, ((rotated.x + rotated.y) >> 1) - pos.z }`. The `>>1` is exactly the 2:1 vertical compression, z subtracts as pixel height, no matrices, no trig, no floats. `ViewportPosToMapPos` (Viewport.cpp:1106) is the analytic inverse for a known z plane. Pure functions of rotation and coordinates. Strengths: integer exact, deterministic, trivially invertible on a known height plane, immune to float drift. Weaknesses: four cardinal rotations only, the inverse needs a fixed z plane.

**Project Studio translation.** This is the same math `iso.ts` already ships (`TILE_W=128`, `TILE_H=64` is precisely 2:1, `gridToScreen` and `screenToGrid`). The most successful open isometric management sim independently uses the identical projection, which validates that the `iso.ts` choice is correct rather than a compromise, and shows that adding camera rotation later would not touch the `StudioLotSnapshot` contract (rotation is a pure renderer concern).

**Disposition:** STUDY_ONLY.

**Validation test.** Round trip property test on `iso.ts`: for every tile, `screenToGrid(gridToScreen(tile)) === tile`. If rotation is ever pursued, extend to each rotation against a fixed ground plane.

#### 1.3 Pixel perfect selection by re running the paint pipeline into a 1x1 target

`GetMapCoordinatesFromPosWindow` (Viewport.cpp:1714) allocates a one pixel render target at the cursor and runs the same paint generate and arrange used for drawing, then walks the sorted structs front to back sampling actual sprite alpha, keeping the frontmost hit that passes an interaction type filter. Selection can never diverge from what is drawn, honoring transparency and occlusion for free. Ephemeral, mutates nothing. Cheap because the 1x1 cull rect discards almost every struct. Strengths: zero drift between seen and clicked, category filterable, occlusion correct by construction. Weaknesses: couples picking to the whole paint pipeline, overkill for coarse tile hits (so OpenRCT2 also keeps the analytic inverse for terrain picks).

**Project Studio translation.** Phaser interactive display objects already hit test the drawn sprite's geometry and alpha, so D1 inherits render and pick parity without paying for a re paint. The transferable principle is that interaction anchors (`selectedBuildingId`, building clicks, `ProductionCard` taps, `firstInspectableScreen`) must attach to the exact objects `LotScene` draws in the same depth order, so a click can never resolve to an occluded building. Relevant to the D2 reserved `decision-required` affordances.

**Disposition:** STUDY_ONLY.

**Validation test.** With a crew sprite occluding a building corner, assert a click in the overlap resolves to the front object. If it does not, raise the crew's Phaser depth to match its draw order rather than adopting a re paint.

#### 1.4 Placement preview via ghost tile elements plus VirtualFloor neighbor difference overlay

Two mechanisms. First, a preview is a real world tile element inserted with `TILE_ELEMENT_FLAG_GHOST`, so it paints through the same pipeline (correct art, correct depth) but is transient and non committing, with `RideConstruction.cpp` computing a preview price and clearing on cancel. There is no separate ghost renderer. Second, `VirtualFloorPaint` highlights the build area by drawing OpenRCT2's own `SPR_G2_SELECTION_EDGE_*` sprites only on edges where a neighbor tile differs, and explicitly culls internal edges for clarity, setting interaction type to none so the overlay is never selectable. Strengths: unified render path for real and previewed, and a clarity first overlay that draws only information bearing edges. Weaknesses: ghost as real element requires the sim to tolerate and reliably strip transient elements. Construction and future facilities are explicit contract non goals now, so this is reference for when the owner authorizes it, and no GPL code may be copied.

**Project Studio translation.** Maps onto the reserved but unbuilt surfaces: the `expansion` building and `expansion-info` route, `BuildingState.underDressed`, and the `future` and `warning` and D2 reserved `decision-required` states. The neighbor difference plus dull edge culling is the discipline `StudioLotSnapshot` already espouses (emit only what can be grounded, pair color with shape and text). A future expansion preview could render the prospective building through `LotScene` tinted by a snapshot boolean, sorted by `iso.ts` `depthFor`, never mutating `GameState`, matching `navigation.ts`.

**Disposition:** CLEAN_ROOM_REIMPLEMENT (only when construction is authorized).

**Validation test.** Feed a snapshot with `expansion` flagged `future`, render it as a tinted edged ghost via the existing `LotScene` path, and assert it never appears in `getDebugState().selected`, that toggling the flag off removes it with zero residual display objects, and that the determinism invariant is unchanged.

#### 1.5 Zoom driven LOD: bit shift zoom, dense entity culling, sub pixel snap, salience opt in

`ZoomLevel` is an integer power of two applied by bit shift. LOD rules keyed on zoom: entity paint returns early past zoom level 2 so dense guests and vehicles are simply not drawn when unreadable, small scenery draws detail only when zoomed in or when a prop carries an `isVisibleWhenZoomed` flag (important props opt in to surviving zoom out), entity screen positions snap to a 2 or 4 pixel grid to stop shimmer, and off screen structs are culled pre sort with zoom scaled bounds. Strengths: graceful density reduction protecting readability, integer exact, per object salience opt in. Weaknesses: bound to a discrete zoom ladder, hand tuned thresholds.

**Project Studio translation.** D1 is fixed zoom management readability, so the mechanism is largely not applicable, but the principles map onto the `sceneSeed` derived ambient crew and prop density budget: do not render crew that cannot be read at the fixed distance, give story important elements (a building at `warning`, the stage of an active `ProductionCard`) a salience that survives ambient noise, and limit ambient motion to avoid shimmer. Also informs `setReducedMotion` and `pause`/`resume` as ways to shed detail.

**Disposition:** STUDY_ONLY.

**Validation test.** Define a maximum ambient entity count for the fixed camera, assert `LotScene` never exceeds it for any `sceneSeed`, and assert every building with attention not equal to `normal` stays visually distinct at maximum ambient density.

### Overall disposition and license risk

OpenRCT2 is the single best open reference for isometric management readability and the cleanest legal precedent for the exact code and art separation Project Studio already practices. But GPL-3.0-or-later is copyleft, so no C++ may be copied or adapted (it would force GPL onto the whole product), and `ADAPT_PERMISSIVE_CODE` is off the table for every pattern. The high value patterns are each already implemented in D1 (the 2:1 transform), already handled by Phaser (pick parity), or gated behind a contract non goal (construction). Engagement is safe only as clean room study.

License risk: MEDIUM for code reuse (copyleft consequence is severe if code is copied, but that action is disallowed and easy to avoid), LOW provenance risk (no bundled proprietary assets to contaminate anything).

---

## 2. FreeSO (priority 2)

### Verified facts

- URL: https://github.com/riperiperi/FreeSO (resolved HTTP 200, no redirect).
- Branch and commit: `master` at `4c6b3e8f5835b228723caea3c9f683c62f244f73`, HEAD dated 2025-08-22.
- Activity: actively maintained community project, original run 2017 to 2024, still receiving commits in 2025.
- Language: C# on .NET and MonoGame (XNA derived), 2378 `.cs` files.
- Render tech: custom orthographic isometric renderer over MonoGame. Fixed 30 degree X tilt camera with 45 degree rotation steps, three discrete zooms with precomputed sprite tables. Objects render from DGRP draw groups (direction by zoom by rotation sprite lookup) with per pixel z buffer sprites. Optional runtime 3D mode reconstructs meshes from those sprite z buffers.
- Code license: MPL-2.0, verified verbatim in `LICENSE.md`, README restates the Exhibit A notice. File level permissive weak copyleft (per file source disclosure).
- Art license: mixed, mostly proprietary by dependency. The engine bundles no EA base game art (objects, avatars, UI, sprites, audio), which remain EA and Maxis commercial copyright and must be user supplied. The repo does bundle FSO community authored content under `FSO.Content.TSO/Content`: 450 `.iff` custom objects, 271 `.piff` runtime patches (verdict correction, the raw finding said 278, which was the total file count of the Patch directory, not the `.piff` extension count), and 531 avatar files. Provenance is self declared ("community 2017 to 2024", some "Parsimonious" objects "used with permission"), with no per asset audit, and the `.piff` patches are functionally derivative of EA object formats.
- Audio license: proprietary by dependency. Zero bundled audio files (verdict confirmed); original TSO audio must come from EA game files.
- Commercial asset dependency: engine is non functional without user supplied EA TSO files. Two additional red flags: bundled community content of mixed self declared provenance, and an optional SM64 swim 3D mode. The verdict elevates the SM64 concern above the raw finding's hedge: the repo ships a prebuilt `Mario.dll` (361KB) plus `Mario.pdb` with no source or license in tree, and `SM64Component.cs` and `SM64DataContainer.cs` load a Super Mario 64 ROM at runtime via `RomSource` with libsm64 derived comments. The ROM is user supplied, but the opaque binary and libsm64 derived code are a confirmed Nintendo IP red flag for that component.
- Doc quality: good for a large reverse engineering project. Pervasive XML doc comments, per directory content readmes, an in engine resource editor (Volcanic), external wiki. Architecture spans about 40 projects and the SimAntics VM assumes deep TSO bytecode familiarity.
- Provenance risk (verdict): HIGH.

### Where the patterns live

Interaction slots and routing in `tso.simantics/Engine/VMSlotParser.cs`, `Primitives/VMGotoRelativePosition.cs`, `Primitives/VMGotoRoutingSlot.cs`, `Engine/VMRoutingFrame.cs`, `Engine/Scopes/VMSlotScope.cs`, `Engine/Routing/VMRectRouter.cs`. Containment in `Entities/VMEntity.cs`, `VMGameObject.cs`, `VMMultitileGroup.cs`. Outfits in `tso.vitaboy.model/Outfit.cs`, `Appearance.cs`, `Skeleton.cs`, `Binding.cs`, `Primitives/VMChangeSuitOrAccessory.cs`, `tso.vitaboy.engine/Avatar.cs`. Animation in `Model/VMAnimationState.cs`, `tso.vitaboy.engine/Animator.cs`. Wall cutaway in `tso.world/Model/Blueprint.cs`, `Components/WallComponent.cs`, `Components/ObjectComponent.cs`, `tso.client/UI/Panels/UILotControl.cs`. Camera and sort in `tso.world/Utils/WorldCamera.cs`, `_2DWorldBatch.cs`, `_2DSpriteSorter.cs`, `DGRPRenderer.cs`.

### Patterns

#### 2.1 SimAntics interaction slots and routing to slot

An object publishes SLOT items (proximity min, optimal, max, facing, offset, sit and stand weights, direction flags) as data on the object. `VMSlotParser.FindAvaliableLocations` enumerates candidate stand and sit positions in a ring around the object, filters by proximity band and same room, raycasts walls to reject blocked spots, checks tile and chair and door occupancy, scores each by closeness to optimal minus walking distance, de prioritizes tiles other avatars are already routing to, and returns them ranked. A router walks to the best reachable one, blending walk animations by velocity. All of this is authoritative in the deterministic VM and marshalled for network sync. The code deliberately avoids heavy vector math for determinism, warning of float desync across hardware. Strengths: cleanly separates where can I stand to use this (data on the object), how do I get there (router), and what do I look like doing it (animation). Weaknesses: coupled to TSO's IFF SLOT and facing encoding and 16 subtile grid, float determinism is fragile and flagged.

**Project Studio translation.** Reference for future character activity on the lot (D1 crew is decorative from `sceneSeed`). If persistent named talent ever performs work, each building or prop would publish interaction anchors (proximity band plus facing) like SLOT items, and a deterministic router in `src/core` would pick a reachable anchor: Stage A and B filming anchors, a Casting interaction point, a Theater premiere spot. The selection must live in the pure sim core and surface to the renderer only as display facts (occupied and target booleans) via `StudioLotSnapshot`, never computed in Phaser.

**Disposition:** CLEAN_ROOM_REIMPLEMENT.

**Validation test.** Headless: one object with a single SLOT (optimal proximity, face toward object) and one walker on a small grid. Assert a reimplemented scorer plus stub router returns exactly the reachable adjacent tile facing the object, that a wall between them yields no result, and that the ranked output is byte identical across two seeded runs and two frame rates.

#### 2.2 Object containment slots and anchors

Each entity loads a SLOT resource defining containment slots distinct from routing slots. `VMEntity` exposes `Contained[]`, `Container`, `ContainerSlot`, and `VMGameObject` implements `TotalSlots`, `PlaceInSlot` (rejects double occupancy, cycles, and dead objects), `GetSlot`, `ClearSlot`, `GetSlotHeight` (stacks contained objects vertically). A contained entity inherits the container's tile and a per slot height offset. Authoritative in the VM, marshalled by object id. Strengths: a general parent child anchoring graph with loop safety and height stacking, decoupled from rendering. Weaknesses: slot geometry comes from EA IFF chunks, z conventions are TSO specific.

**Project Studio translation.** Reference for props or buildings that hold a character or prop as an interaction anchor: a director chair anchoring talent, a camera rig anchoring an operator, a marquee holding the latest release title. In D1 terms this is the data behind an anchor a future snapshot could expose (`BuildingState` could gain a display only `occupantPresent` boolean). Keep the containment graph and stacking math in the pure core, the renderer only reads positions.

**Disposition:** CLEAN_ROOM_REIMPLEMENT.

**Validation test.** Sim core unit test: create a container with N slots, place an entity in slot 0, assert `GetSlot(0)` returns it and a second placement in slot 0 fails, assert height stacks a second object above the first, and assert a placement that would create a cycle is rejected.

#### 2.3 Layered outfit variation on a shared skeleton

An Outfit groups light, medium, and dark skin Appearances plus a hand group and a body region. An Appearance is a list of Bindings (bone name to mesh and texture). The avatar binds each Appearance's parts onto a shared skeleton: body outfit sets torso and legs, head outfit sets the head, accessories are additional bound Appearances layered on top. `VMChangeSuitOrAccessory` mutates avatar state by setting a `VMOutfitReference`, toggling `BoundAppearances`, or toggling named decoration slots. Outfit references are authoritative person data in the VM, the Vitaboy layer is pure presentation that reads them. Strengths: validates a shared skeleton plus swappable bound mesh plus accessory layer model with skin tone variants. Weaknesses: bound to EA's BCF and APR and mesh formats and a skin tone triplet assumption.

**Project Studio translation.** Independent corroboration of the Asset Lab 05x direction: keep one skeleton, retarget shared clips by bone name, vary appearance by swapping bound meshes and accessories rather than re authoring bodies. Maps to persistent named talent needing crew vs star vs director variety at management distance. Confirms outfit identity should be a small stable reference owned by sim state, the renderer resolving it to meshes, mirroring `StudioLotSnapshot` carrying display facts not asset math. Do not adopt BCF or APR or any EA derived mesh.

**Disposition:** STUDY_ONLY.

**Validation test.** In the Asset Lab, swap a character's body outfit reference while holding head and accessories fixed, render before and after, and assert only body region bound meshes changed and the 65 joint skeleton plus a bound accessory persisted.

#### 2.4 Animation states with weighted blending and event queue

`VMAnimationState` wraps a running clip with current frame, speed, weight (active clips should sum to 1), loop, backwards, and an event queue. The Animator composes bones via translation lerp and rotation slerp weighted by clip weight. The walk system drives three clips whose weights come from velocity to blend stand to walk to run. Animation name plus frame plus weights are authoritative and marshalled so the same clip resumes deterministically after save or sync, bone math is presentation. Strengths: clean weighted crossfade with deterministic frame timing and event hooks, split from sim state. Weaknesses: clip data is EA binary, 30fps assumption baked in.

**Project Studio translation.** Reference for decorative crew or talent if it ever animates beyond ambient `sceneSeed` jitter, for example crossfading idle to work loops. The weight sum to one blend and name plus frame as authoritative state keeps animation deterministic and save safe. Maps to the Asset Lab's six reusable clips. D1 deliberately keeps motion decorative and derived from `sceneSeed`.

**Disposition:** STUDY_ONLY.

**Validation test.** In the Asset Lab runtime, crossfade two existing clips at fixed weights and assert a chosen bone's world rotation equals the slerp to tolerance, and that stepping the same start state at 30fps vs 60fps lands on the same frame index.

#### 2.5 Wall cutaway room visibility and occlusion

`Blueprint.Cutaway` is a per tile bool array marking where walls drop. `UILotControl.WallsMode` has four modes: walls down, dynamic cutaway (cut the rooms the cursor hovers, a rolling set of up to three plus a 5x5 rect around the cursor), walls up, and roof or first person. `WallComponent.WallsDownAt` reads the cutaway array and selects walls down vs walls up sprite masks per segment, with neighbor aware cut edges for clean silhouettes. Upper floor objects hide themselves when their tile and the wall behind sit inside the cut region so furniture does not float over an opened room. Cutaway is a presentation concern derived from camera and cursor, it does not alter sim state. Cut regions are diffed and re cached lazily. Strengths: a clean purely presentational per tile occlusion mask with coordinated object hiding, directly the mechanic a management lot needs to reveal interiors. Weaknesses: coupled to TSO wall segment masks and floor model.

**Project Studio translation.** Highly relevant. The fixed iso lot with named buildings (admin, stages, casting, theater) is the natural home for reveal interior on select or hover. `selectedBuildingId` is the analogue of the hovered rooms set: selecting a building could drop its shell to show interior activity. The per tile mask plus hide objects over a cut region maps to revealing an interior while hiding roof and upper walls. Reimplement clean room in Phaser as presentation only reveal keyed off snapshot selection, no sim change, consistent with D1's rule that the renderer never manufactures truth.

**Disposition:** CLEAN_ROOM_REIMPLEMENT.

**Validation test.** Given a snapshot selecting one building, assert the renderer drops only that building's shell and roof and reveals interior props, leaves other buildings intact, and that clearing `selectedBuildingId` fully restores walls, with zero change to the underlying `StudioLotSnapshot`.

#### 2.6 Fixed iso ortho camera plus per pixel depth sprite sort plus DGRP metadata

`WorldCamera` is orthographic with a fixed 30 degree X tilt and Y rotation in 45 degree steps, three discrete zooms. Depth uses both an incrementing submission draw order (fallback and the key for software depth grouping of non intersecting sprites) and per pixel sprite depth textures (each sprite carries a baked z buffer so overlapping iso objects intersect per pixel on the GPU). `DGRPRenderer` maps an object to sprites via `GetImage(direction, zoom, rotation)`, a lookup table, with dynamic sprite flags to toggle sub sprites. Strengths: robust exact intersection depth via baked z buffers, rotation and zoom as precomputed tables. Weaknesses: the z buffer approach requires depth baked into every sprite (an asset pipeline dependency D1 placeholder art does not have), DGRP tables assume EA's four rotation sprite sets.

**Project Studio translation.** Validates D1 rather than displacing it. FreeSO's fixed tilt ortho plus discrete rotations correspond to `iso.ts`'s direct 2:1 transform and the deliberate choice not to use a Tiled loader. Its draw order by submission fallback corresponds to `depthFor = (gx+gy)*16 + layerBias`. The lesson: per pixel z buffer sophistication is only worth it with real depth baked assets, and for placeholder or greybox art the grid corner painter is the correct simpler choice. Do not rewrite the D1 renderer to chase this.

**Disposition:** STUDY_ONLY.

**Validation test.** Place two overlapping objects at known grid coords and assert the one on the front most (higher `gx+gy`) corner draws last per `depthFor`, matching FreeSO's front corner ordering, confirming the painter is sufficient without z buffer machinery.

### Overall disposition and license risk

FreeSO is the best available reference for character object interaction slots, routing to slots, containment anchors, layered outfits on a shared skeleton, and wall cutaway visibility, all directly on Project Studio's future character activity and interior concerns. But it is a different genre, its MPL code is inseparable in practice from EA's commercial data formats, and it requires EA retail assets to run. Read the algorithms, import no code, no content files, no EA derived structures. Adopt only clean room reimplementations grounded in `StudioLotSnapshot` and the deterministic core. Do not let its per pixel z buffer renderer trigger a rewrite of the D1 grid corner painter.

License risk: HIGH. Code is MPL weak copyleft (per file disclosure obligations), bundled community content has unaudited provenance, and the `Mario.dll` plus libsm64 derived SM64 component is a live Nintendo IP flag. Provenance risk HIGH.

---

## 3. CorsixTH (priority 2)

### Verified facts

- URL: https://github.com/CorsixTH/CorsixTH.
- Branch and commit: `master` at `88cd3b8e6258bbd9a27ce904609ae1e42fac897b`, HEAD dated 2026-07-30.
- Activity: active, copyright lines through 2026.
- Language: Lua game logic (328 `.lua`) plus C++ engine (about 49 `.cpp`, 39 `.h`) plus a little C. Lua 5.x embedded.
- Render tech: C++ and SDL2 2D sprite blitter (`Src/th_gfx_sdl.cpp`) over a fixed isometric tile map whose per cell state is a packed uint32 flag word (`Src/th_map.cpp`). Sprites decoded at runtime from Theme Hospital's proprietary TAB, DAT, ANI format. Not GPU 3D. A separate wxWidgets tool (`AnimView/`) inspects sprites and animations offline.
- Code license: MIT, verified verbatim in `LICENSE.txt` (standard MIT permission grant, large contributor roster 2012 to 2026) and per file headers. No copyleft.
- Art license: two tiers. First, a small set of homemade bitmaps in `CorsixTH/Bitmap/` are MIT and redistributable: the `flag_*.bmp` debug overlays, `map_cell_outline*.bmp`, `fullscreen_border_*.bmp`, `bootstrap_font.bmp`, `mainmenu{480,720,1080}.bmp`, tree control assets, `build_room_dialog_close.bmp`, plus (verdict addition) `lose.pl8` and `winlevel.pl8` win and lose art. These are utilitarian UI and debug art, not game content. Second, all actual game graphics are proprietary EA and Bullfrog Theme Hospital assets not in the repo, required from a retail copy or GOG or EA download. `Bitmap/readme.txt` states verbatim that almost all graphics load from the original Theme Hospital data files.
- Audio license: engine audio and MIDI playback code (`Src/th_sound.cpp`, `midi_player.cpp`, `xmi2mid.cpp`, `sdl_audio.cpp`) is MIT. No sound, music, or soundfont bundled, retail audio required at runtime.
- Commercial asset dependency: does not bundle commercial assets but hard requires them at runtime. This is the cautionary lesson: an MIT engine does not make the required commercial art or audio reusable.
- Doc quality: good. Rich README stating the asset requirement up front, `CONTRIBUTING.md`, DoxyGen and LDocGen generators, Doxygen style comments in Lua, `Bitmap/readme.txt` documenting asset provenance, cleanly foldered subsystems.
- Provenance risk (verdict): LOW.

### Where the patterns live

Mood and status icons in `Lua/entities/humanoid.lua`, `humanoids/patient.lua`, `humanoids/staff.lua`. Build validity in `Lua/dialogs/edit_room.lua`, `Src/th_lua_map.cpp`, `Lua/world.lua`, `Src/th_map.cpp`, `Lua/dialogs/build_room.lua`. Object footprint and anchors in `Lua/objects/reception_desk.lua`, `Lua/entities/object.lua`, `Lua/humanoid_actions/use_object.lua`. Queue model in `Lua/queue.lua`, `Lua/dialogs/queue_dialog.lua`. Inspector in `AnimView/frmMain.cpp` and `.h`, `frmSprites.cpp`, `Lua/sprite_viewer.lua`. Flag substrate and overlays in `Src/th_map.cpp`, `Src/th_map_overlays.h`, `Bitmap/flag_*.bmp`.

### Patterns

#### 3.1 Prioritized status icon (mood) resolution over an entity

A global registry builds a table of about 30 named moods, each with an icon sprite number, an integer priority, and an on hover flag. Each entity keeps a set of active moods, toggled by `setMood(name, activate or deactivate)`. After any toggle, exactly one displayed marker is recomputed by scanning active moods and keeping the highest priority entry that is not on hover, and on hover moods only surface when the cursor is over the entity. Exactly one icon floats above the sprite at a time, never a cluster. The mood set is authoritative game state, the icon is pure projection, recompute is O(active moods) on toggle only. Strengths: collapses many simultaneous conditions into a single deterministic legible signal via an explicit priority ladder, icon plus shape carries meaning not color alone. Weaknesses: equal priorities are ambiguous (flagged as a TODO), icon numbers are magic sprite indices.

**Project Studio translation.** This is the reference algorithm for the `AttentionState` union on `BuildingState.attention`. When a building satisfies several conditions at once, the `studioLotSnapshot` selector in `adapter.ts` must emit one attention marker, and mood style priority resolution is how to choose it deterministically. It reinforces D1's rule that every attention state pairs color with text and icon or shape, and that `decision-required` is reserved for D2: a priority ladder where D2 only states outrank D1 states makes the reservation mechanical. The on hover tier maps to detail on hover in `StudioLotScreen.tsx`.

**Disposition:** CLEAN_ROOM_REIMPLEMENT.

**Validation test.** Unit test a `pickAttention(conditions[])` helper: given simultaneously true building conditions with priorities, assert it returns exactly the single expected `AttentionState`, that a reserved `decision-required` condition is never returned by the D1 selector, and that an on hover condition only appears when a hover flag is set. No rendering needed.

#### 3.2 Per cell build validity blueprint (green and red overlay plus confirm gating)

`setBlueprintRect` forwards a candidate rectangle in one batched C call to `l_map_updateblueprint`, which writes a 50 percent alpha sprite into a dedicated UI tile layer per cell: good and good center indices for buildable cells, bad for blocked cells, and ANDs all cells into one boolean valid. Walls of an invalid blueprint are recolored blue to red by swapping in a ghost palette, doors and windows use per tile bit flags so the specific blocking tile is highlighted. Validity comes from `World:isFootprintTileBuildableOrPassable` reading packed cell flags (buildable N,E,S,W plus travel plus owner), the substrate being a uint32 flag word per tile. Confirm gating: the confirm button is enabled only when valid, so an invalid placement cannot be committed. The overlay lives in a separate UI tile layer, batching hundreds of cell updates into one call. Strengths: instant per cell color and position feedback, single source of truth shared by pathfinding and validity, commit impossible while invalid. Weaknesses: validity logic split across Lua and C, magic sprite indices.

**Project Studio translation.** Direct reference for a future construction slice (the `expansion` building, the future facilities and construction scope). It shows how to render a per tile buildable and blocked overlay on the iso grid (`iso.ts` `gridToScreen` plus a dedicated `LAYER.overlay`), driven by display facts on `StudioLotSnapshot` (a candidate footprint plus a per cell valid array plus an overall canBuild boolean) so the renderer never re derives validity. Confirm gating maps to enabling a semantic React Build control only when the snapshot says valid, keeping the lot navigation only. `BuildingState.underDressed` and `available` already anticipate this vocabulary.

**Disposition:** CLEAN_ROOM_REIMPLEMENT (when construction is authorized).

**Validation test.** In the engine headless, add a pure `canPlace(state, footprint)` selector returning per cell booleans and an overall valid. Unit test that a footprint straddling an occupied or edge cell yields the expected mask and valid false, and a clear footprint yields valid true. Assert the lot renders good and bad tints matching the mask with zero divergence between headless and rendered results, and that the confirm affordance is disabled iff invalid.

#### 3.3 Declarative object footprint plus named interaction anchors

Each object is a pure data table declaring, per facing direction, a footprint (tile offsets, each optionally flagged only passable or need north or south side) plus named use anchors (use position, use position secondary, slave position, finish use position, handyman position). `Object:initOrientation` selects the idle animation and footprint for the current facing, `getXYforUsePosition` resolves named anchors to absolute world tiles for single and multi tile anchors. Humanoids walk to the resolved anchor and the use object action plays a phase and animation sequence. Geometry and interaction points are static metadata on the object type, and the footprint flags feed the same cell flag validity system as pattern 3.2. Strengths: geometry, orientation, and every interaction point declared once as data, anchors are semantic names not raw coordinates, the same footprint drives placement validity, pathfinding blocking, and where actors stand. Weaknesses: fixed anchor enumeration, offsets hand authored per direction, tied to a square tile grid.

**Project Studio translation.** Maps to how Project Studio should describe its nine named buildings and their interaction points. The declarative data approach mirrors the existing `BUILDING_LABELS`, `BUILDING_BLURBS`, `BUILDING_ACTION` maps in `StudioLotSnapshot.ts`. Extend that vocabulary with per building interaction anchors (where a worker stands, where a vignette plays) resolved through `iso.ts` rather than hard coded pixel offsets in `LotScene`. `onCharacter` and `onActivity` in `StudioLotView` are the consumers. The named anchor concept is usable now to place deterministic ambient crew and vignettes keyed off `sceneSeed` without leaking sim truth.

**Disposition:** CLEAN_ROOM_REIMPLEMENT.

**Validation test.** Author one building's anchors as data and add a pure `resolveAnchors(building, gridPose)` helper over `iso.ts`. Unit test that anchors resolve to expected screen positions for a given placement and are deterministic for a fixed `sceneSeed`. Then confirm a worker vignette renders at the named anchor rather than a magic offset.

#### 3.4 Queue as a first class object owned model (visible vs expected load)

A `Queue` object is attached to a room's key object (the reception desk owns its queue). It tracks reported size (actors physically standing in line) separately from expected count (actors committed or en route), enforces a bench threshold and max size. The queue dialog draws the count and the queued actors and lets players drag to reorder priority or drag out to remove, and change max size. The queue is authoritative sim state, and the dialog both reads and mutates it. Strengths: the reported vs expected split shows current load without conflating it with incoming load, and attaching the queue to the object gives every bottleneck a natural inspection anchor. Weaknesses: the dialog is a live mutation control, so it is a gameplay surface not a read only readout, and the visualization is a plain list.

**Project Studio translation.** Project Studio has no live patient queues, so the mechanic does not port, but the reported vs expected idea maps to showing a stage's committed vs projected load using only display facts already on `StudioLotSnapshot` (`progress01`, `weeksRemaining`, `stageState` filming or available, `releasePresence`). A studio bottleneck is stage saturation. Crucially the drag to reorder and remove dialog is the anti pattern for D1: `navigation.ts` guarantees no lot action mutates `GameState`, so any bottleneck surface must be read only. Study the load model, reject the mutating UI.

**Disposition:** STUDY_ONLY.

**Validation test.** No adoption test for the UI. If a load indicator is wanted later, derive a pure `stageLoad` selector (busy stages over total, plus `weeksRemaining`) as a display fact and unit test its bands. Do not expose any control that reorders or cancels productions from the lot.

#### 3.5 Dedicated offline animation and sprite inspector (AnimView) plus in game fallback

`AnimView` is a standalone wxWidgets desktop app that loads an animation set and steps first, prev, next, last animation and frame, plays and pauses, toggles the alpha mask, toggles a draw mood overlay, toggles draw coordinates, searches by layer id or frame or sound index, picks a ghost palette, nudges a mood marker to author its offset, and exports PNG. `sprite_viewer.lua` is a crude in engine fallback. Purely a viewer over asset data, owning no game state. It can display nothing without the proprietary Theme Hospital files, so the inspector itself is MIT but useless without retail assets, and lives out of the shipping engine as a separate binary. Strengths: a first class inspector with frame stepping, coordinate and mask overlays, and marker authoring de risks art integration. Weaknesses: separate C++ and wx toolchain, hard coupled to the TH sprite format, embodies the asset dependency trap.

**Project Studio translation.** Validates building a small internal asset and animation inspector for the Asset Lab GLB pipeline and the Phaser lot, a place to step clips, toggle a coordinate and z order overlay, and verify LOD and marker offsets, analogous to `getDebugState()` and the deterministic vignette force and seek already in `StudioLotView`. It argues for a dedicated inspector rather than debugging in the live lot. The cautionary half: AnimView proves an MIT tool is legally inert without licensed assets, so Project Studio's inspector must run purely on its own CC0 and original assets.

**Disposition:** STUDY_ONLY.

**Validation test.** None for adoption. If an inspector is built, prove value with the smallest slice: load one Asset Lab GLB clip, step frames, and overlay `iso.ts` `depthFor` z order for a placed building so a mis sort is visible, reusing `getDebugState` output, running only on original or CC0 assets.

#### 3.6 Packed per cell flag substrate plus flag keyed debug overlays

Every map tile carries a single packed uint32 of boolean flags (passable, travel N,E,S,W, hospital, buildable, buildable N,E,S,W, room, shadow, door, tall, avoid tile). A `map_overlay` interface composites diagnostic layers, and the homemade MIT bitmaps `flag_buildable`, `flag_passable`, `flag_travel_*` visualize those flags directly on the grid. The flag word is the one spatial source of truth shared by pathfinding, build validity, shadows, and rendering, with no parallel truth. The bitfield is cache friendly and cheap to test. Strengths: a single authoritative per cell state consumed by many systems, and a reusable overlay abstraction turns any cell flag into an on grid debug visualization for free. Weaknesses: the overlay art assumes the TH tile geometry, and adding a flag touches C serialization.

**Project Studio translation.** Reinforces the D1 determinism invariant: keep spatial and display truth in one authoritative place (`GameState` to `StudioLotSnapshot`) and let the renderer only project it. The overlay pattern maps to an optional debug layer over the Phaser lot (a dedicated `LAYER` in `iso.ts`, alongside `getDebugState`) that can tint cells by a snapshot derived flag (buildable, occupied, under dressed) for verifying placement and `depthFor` z order during development, gated like the `studioLotOverviewEnabled` dev flag, never shipped. Confirms the leaf type discipline of `StudioLotSnapshot.ts` (carry booleans and bands, not formulas).

**Disposition:** STUDY_ONLY.

**Validation test.** If a debug overlay is added, gate it behind the existing dev flag and assert it renders purely from `StudioLotSnapshot` fields (no `GameState` access), then verify a deliberately mis placed building shows the expected cell tint and z order so the overlay actually catches errors.

### Overall disposition and license risk

Study and clean room reimplement the readability patterns, never depend on the assets. The MIT code is safe to learn from, and four patterns (prioritized status icon resolution, per cell build validity overlay, declarative footprint plus named anchors, and object owned queue modelling) are high value for `AttentionState`, future construction, and interaction anchors. Reimplement clean room against `StudioLotSnapshot` rather than porting Lua and C tied to the Theme Hospital tile format. Treat the queue drag reorder UI and AnimView as study only. Never pull, decode, or ship Theme Hospital graphics or sound, which is precisely why this repo is the cautionary example. Do not change the renderer on account of this repo, its SDL 2D blitter is older tech than the Phaser and React stack.

License risk: MEDIUM (MIT code is freely adaptable, but the hard runtime dependency on retail assets is the trap). Provenance risk LOW.

---

## 4. Unknown Horizons (priority 2)

### Verified facts

- URL: https://github.com/unknown-horizons/unknown-horizons (HTTP 200, no redirect).
- Branch and commit: `master` at `af9c8ef5c7f6cf9ec0b8c9e7d172c555f2793615`, HEAD dated 2026-04-14 (a 2026 dated HEAD on a long dormant project may reflect isolated maintenance).
- Language: Python 3 for all game logic, content authored in YAML and SQL. No JS or TS.
- Render tech: 2D isometric via the external FIFE engine (C++), imported as the `fife` Python module. The iso transform, depth sort, camera zoom and rotation, and selection outlines are all provided by FIFE. `horizons/view.py` only configures the FIFE camera. There is no iso math or painter sort in the repo's own code.
- Code license: GPL-2.0-or-later (verified via `doc/LICENSE` and `doc/licenses/GPL`). Copyleft.
- Art license: the project's own audiovisual content is CC-BY-SA-3.0 Unported (verified via `doc/LICENSE` and `doc/licenses/CC-BY-SA`). A few third party items are CC-BY-3.0 or Public Domain, fonts are GPL font exception plus OFL. Share alike plus attribution required.
- Audio license: mixed, all open. CC-BY-SA-3.0 for the project's own audio and Freesound and OpenGameArt samples, CC-BY-3.0 for one track, Public Domain for two items, each individually attributed.
- Commercial asset dependency: none. Every shipped asset is original team CC-BY-SA content or open sourced from OpenGameArt, Freesound, Musopen, or public domain, each attributed by name and URL. A clean room original economy builder in the spirit of Anno 1602 with fully independent openly licensed art, the opposite of the retail asset hazard. FIFE is an external dependency not vendored here.
- Doc quality: high for the data model. A first class content authoring README schema doc, plus representative YAML files.
- Provenance risk (verdict): LOW.

### Where the patterns live

Object definitions in `content/objects/buildings/{lumberjackcamp,tent}.yaml`, `content/objects/units/collectors/buildingcollector.yaml`, `units/ships/fisher.yaml`, with the loader in `horizons/entities.py`, `horizons/component/componentholder.py`, `horizons/util/yamlcache.py`. Tiers in `horizons/world/building/settler.py` and `horizons/constants.py`. Overlays in `horizons/component/inventoryoverlaycomponent.py`. Action sets in `horizons/util/loaders/actionsetloader.py` and `horizons/world/production/producer.py`. Build menu in `content/objects/gui_buildmenu/build_menu_per_{tier,type}.yaml` and `horizons/component/selectablecomponent.py`.

### Patterns

The renderer is FIFE (external C++), so there is no reusable iso, depth sort, or selection code here. Unknown Horizons' value is a mature declarative data model. All five patterns are study only for the same two reasons: the Python code is GPL-2.0-or-later copyleft (not liftable), and the content is CC-BY-SA-3.0 share alike (folding YAML or art into Project Studio would impose those terms). Facilities, eras, the studio economy, and construction are also explicit contract non goals now, so these are future reference schema shapes, not things to scaffold.

#### 4.1 Declarative component composed building and unit definitions (data, not code)

Each building or unit is one self contained YAML file with scalar props (id, name, cost, size, tier, building costs) plus a `components` list. `horizons/entities.py` walks the objects tree, reads each file, and builds a class from the data. `componentholder.py` holds a class mapping (component name string to component class: health, producer, storage, selectable, inventory overlay, and so on), and each `components` entry is deserialized by calling that class's factory. A building is a bag of components fully specified in data with no extra database. Strengths: adding or retuning a building is a data edit not a code change, and one registry decouples content from engine. Weaknesses: a base class still couples some behavior to Python, ids are hand assigned, no schema validator beyond YAML parsing.

**Project Studio translation.** Maps to how Project Studio expresses its nine buildings as code constants (`BUILDING_LABELS`, `BUILDING_BLURBS`, `BUILDING_ACTION` in `StudioLotSnapshot.ts`). Unknown Horizons shows the mature alternative: a single declarative table per building (id, label, blurb, action, footprint, tier, which controls it exposes). This is study reference for the future facilities work, and does not justify changing the intentionally narrow, immutable, framework neutral D1 snapshot contract.

**Disposition:** STUDY_ONLY.

**Validation test.** In an isolated scratch, author a single table describing the nine D1 buildings and prove the existing three maps can be regenerated from it with byte identical output, demonstrating the data table concept without touching the selector or renderer.

#### 4.2 Per tier name and visual plus explicit upgrade cost tiers on one object

A single definition carries all of its level states. `name` and `actionsets` are maps keyed by tier, and the engine uses the highest available tier less than or equal to the current level to pick the display name and sprites. A settler upgrade lines table holds the resource deltas to advance to each next tier, and producer lines can be gated by level. No per tier code branches, level selection is a lookup over sorted tier keys. Strengths: one file fully models a building's whole progression including cost, name, look, and unlocked mechanics. Weaknesses: the tier enum is global, and gaps silently fall through to a lower tier's assets.

**Project Studio translation.** Directly relevant to the deferred future facilities, era variants, and building levels. `StageState` and `AttentionState` already reserve labels the D1 selector will not yet emit, and the highest available tier less than or equal to current level is exactly the deterministic label selection discipline those reserved states will need. Eras, the studio economy, facilities construction, and career progression are explicit non goals now, so this is future reference only, do not scaffold it.

**Disposition:** STUDY_ONLY.

**Validation test.** On scratch, model a hypothetical two level Stage as a per tier data map and show a pure function could select the correct display label deterministically from a level integer, mirroring the highest available tier lookup, confirming the shape fits the selector before any such system is authorized.

#### 4.3 Threshold table visual state reflects sim truth overlays

`InventoryOverlayComponent` declares, per action set and per resource, a sorted list of threshold amount and overlay name pairs. On an inventory change it picks the entry with the largest threshold less than or equal to the current amount and adds or removes decorative overlays. The visual is a pure function of inventory state defined entirely in data, and if no overlay is defined the code shows none rather than inventing one. Strengths: a clean declarative amount to visual mapping, trivially deterministic, matches a strict presentation illustrates truth rule. Weaknesses: thresholds are hand authored per building and must stay in sync with storage sizes.

**Project Studio translation.** The strongest conceptual match to the D1 determinism invariant and to how `StudioLotSnapshot` maps continuous facts to discrete bands: `cashBand`, `standing`, `progress01`, `underDressed`. The sorted threshold and label table is a band mapping expressed as data. Project Studio already embodies this in the `studioLotSnapshot` selector, and Unknown Horizons confirms the pattern scales and suggests band thresholds could be formalized as a small data table if that helps auditability.

**Disposition:** STUDY_ONLY.

**Validation test.** Re express one existing band mapping (for example `cashBand` cutoffs) as a sorted threshold and band table, then prove a pure selector over that table yields the identical band for a sweep of cash values versus the current inline logic.

#### 4.4 Action set animation metadata by convention plus production state to action name

Sprites are addressed by directory convention (action set, action, rotation, frame number), not per frame metadata. A building's `actionsets` maps each tier to one or more set directories, each with an optional weight for weighted random visual variety. `producer.py` maps production state to a semantic action string (idle, work, idle full) and calls the instance to play the matching frames. When atlases are enabled the dir scan is replaced by a generated JSON. Strengths: assets and semantics are cleanly separated (data names an action, assets supply frames), so placeholder vs final art is swappable, and weighted random gives deterministic variety. Weaknesses: convention over metadata means the folder tree is the schema, and rotation is baked into the FIFE pipeline.

**Project Studio translation.** Maps to `sceneSeed`, which deterministically derives all ambient variation. The weighted random action set choice is the same idea Project Studio already implements deterministically. Production state to action name (work, idle) parallels `StageState` (occupied stage filming vs absence available). The separation of semantic action from concrete frames is exactly the placeholder vs final asset determinism requirement (`assets.ts` holds procedurally drawn placeholders today).

**Disposition:** STUDY_ONLY.

**Validation test.** Express `sceneSeed` driven ambient variation as a weighted table and prove a seeded selection is byte identical across two runs and independent of which asset set (placeholder or final) is mounted.

#### 4.5 Build catalog and menu organization as pure data

The whole build menu is a YAML catalog: tabs, each with an icon, rows grouped under translatable category headings, referencing building ids. Two alternative organizations of the same building set ship as separate files so the palette can be reorganized with zero code change. Separately, `SelectableComponent` in each building's YAML lists the tabs shown on selection, so object to UI wiring is also data. Strengths: catalog and per object inspector UI both declarative, reorganizing categories is a content task. Weaknesses: referenced ids and tab names must resolve, and the catalog can drift ahead of implementation.

**Project Studio translation.** Maps to `navigation.ts` (`LotActionKind` to `LotRoute` over existing screens) and the future construction palette (`expansion-info` is a bounded in lot placeholder). `SelectableComponent.tabs` is the analog of pairing a building with the semantic React controls it routes to, and every building reachable from a data catalog echoes Project Studio's rule that every lot destination is reachable without the lot via semantic controls.

**Disposition:** STUDY_ONLY.

**Validation test.** Represent D1's nine building selection set as a catalog file and confirm the navigation targets currently in `navigation.ts` can be derived from that catalog by a pure function, before any construction system is authorized.

### Overall disposition and license risk

Study only. The value is a battle tested data model and schema, not code or art. The highest value takeaway is the declarative component composed building definition format with per tier names and visuals, explicit upgrade cost tables, and threshold driven visual state overlays, a mature reference for how Project Studio could eventually describe facilities and their display metadata as data. The renderer is FIFE (external), so there is nothing reusable there, and Project Studio already owns a deliberate Phaser `iso.ts`.

License risk: MEDIUM. Code is GPL-2.0-or-later copyleft and content is CC-BY-SA-3.0 share alike, so neither code nor YAML nor art may be lifted without forcing those terms onto the whole project. Provenance risk LOW.

---

## 5. OpenTTD engine plus OpenGFX base graphics set (priority 2)

### Verified facts

- URLs: https://github.com/OpenTTD/OpenTTD and https://github.com/OpenTTD/OpenGFX (both resolved, no redirect).
- Branch and commit: OpenTTD `master` at `0de95fb529df90e046d06f4a161e4d2e2a01fa15`, HEAD dated 2026-08-01 (a routine automated translation sync). OpenGFX `master` at `c51c904`, HEAD dated 2026-06-17, latest tagged art release OpenGFX 8.0 dated 2026-01-03.
- Language: C++ (modern, CMake). NewGRF art authored separately in NML.
- Render tech: 2D sprite compositing in classic 2:1 isometric, indexed palette 8bpp first class with 32bpp support. Pluggable software blitter abstraction plus SDL2, OpenGL, Cocoa, Win32 backends. World depth via 3D axis aligned bounding box topological sprite sort, not a naive painter.
- Code license: GPL-2.0-only. Verified via OpenTTD `COPYING.md` (GPL v2 text) and README, and OpenGFX `LICENSE` and README. Verdict corrects one citation detail: OpenTTD has no `LICENSE` file, its GPL text lives in `COPYING.md`, and only OpenGFX has a `LICENSE` file. Enumerated third party exceptions confirmed, and the llvm CheckAtomic Apache-2.0 file is at `cmake/3rdparty/llvm/CheckAtomic.cmake` (not under `src/3rdparty/`).
- Art license: separate from code and not permissive. The engine ships no retail art. Original TTD graphics are user supplied: `media/baseset/orig_win.obg` and `orig_dos.obg` are INI manifests referencing retail files by MD5 with an origin note pointing at the user's CD-ROM. The free clean room replacement is OpenGFX, licensed GPL-2.0-only (copyleft, not CC0). OpenTTD's own bundled art (`openttd.grf` extra sprites, fonts `OpenTTD-Sans/Serif/Mono.ttf`) is GPL-2.0.
- Audio license: not present in either cloned repo. Free replacement sets OpenSFX and OpenMSX are separate downloads, retail sound and music user supplied. Their exact licenses were asserted from README only, not observed.
- Commercial asset dependency: none bundled. This is the canonical example of engine and asset separation done cleanly: retail assets are declared by a manifest (`.obg`, `.obs`, `.obm` listing files, MD5, and a CD-ROM origin) and must be user supplied, or replaced entirely by the free OpenGFX, OpenSFX, OpenMSX sets. The GPL engine plus retail asset manifests do not make retail art redistributable, enforced structurally here.
- Doc quality: high. Per file GPL headers, thorough README licensing sections in both repos, palette docs, NewGRF handlers split one file per action.
- Provenance risk (verdict): LOW.

### Where the patterns live

Base set loading in `src/base_media_base.h`, `src/gfxinit.cpp`, the `.obg` and `.obs` and `.obm` manifests, NewGRF Action 5 in `src/newgrf/newgrf_act5.cpp`, sprite cache in `src/spritecache.cpp`. Recolour in `src/gfx_type.h`, `src/palette_func.h`, `src/blitter/base.hpp`, `src/blitter/8bpp_optimized.cpp`, and OpenGFX `sprites/base/base-0775-recolor.pnml`. Zoom and LOD in `src/zoom_type.h`, `src/zoom_func.h`, `src/spritecache_type.h`. Depth sort in `src/viewport_sprite_sorter.h`, `src/viewport.cpp`, `src/viewport_sprite_sorter_sse4.cpp`. Clean room art set in the OpenGFX repo (`LICENSE`, `README.md`, `ogfx1_base.pnml`, `sprites/base/base-0775-recolor.pnml`, `changelog.txt`).

### Patterns

#### 5.1 Manifest driven swappable base set plus NewGRF sprite override

The engine never hard codes art, it references sprites only by numeric sprite ID and loads pixels from a selectable base set described by an INI style manifest (`.obg` graphics, `.obs` sounds, `.obm` music). `orig_win.obg` shows the shape: metadata name and palette, a files section mapping to GRF filenames, an md5s section with a checksum per file, and an origin note. `gfxinit.cpp` loads the used set's GRFs into contiguous sprite ID ranges with a palette remap flag when the palette differs. Assets are external, versioned, checksum verified, and either user supplied retail or the free OpenGFX set, so the engine runs identically against either. NewGRF Action 5 lets add on packs replace or extend whole categories of base sprites by declaring a block type plus base sprite ID plus max count, and Action A replaces individual sprites by number. `BaseGraphics::GetUsedSet` is the single source of truth for which art is active, the simulation is unaware. Sprites are lazily decoded and LRU cached. Strengths: total engine and art decoupling, provenance and integrity baked into the format, hot swappable and community extensible, and the manifest legally quarantines retail assets it cannot ship. Weaknesses: the full NewGRF pipeline is enormously complex and 8bpp palette centric, far heavier than Project Studio needs.

**Project Studio translation.** `StudioLotSnapshot` already references buildings by nine stable `BuildingId` values, the exact analogue of sprite IDs. The D1-A Studio Identity Package should adopt the `.obg` lesson at small scale: a tiny art manifest mapping each `BuildingId` (and each attention and stage state) to a sprite or atlas region, carrying a per asset checksum plus a provenance and license field, a direct echo of the Asset Lab's `licenses/asset-lab-05h/` directory and the `studio_base` provenance prop. This lets `assets.ts` swap procedural placeholders for authored art with no change to the snapshot contract or the sim, preserving the determinism invariant. Action 5 style whole category override maps to future era or facility skins but is over scope now.

**Disposition:** STUDY_ONLY.

**Validation test.** Author a minimal JSON art manifest (`buildingId` to atlas region, sha256, license, source) for the nine D1 buildings, load it in `assets.ts` behind the `studioLotOverviewEnabled` flag, and assert the snapshot contract and all snapshot tests are byte unchanged, and that a checksum mismatch fails loudly at load rather than silently rendering wrong art.

#### 5.2 Recolour sprites by palette index remap for branding

`gfx_type.h` defines 16 base company colours and a recolour sprite type that is not pixels but a 256 entry palette index to index lookup table. Drawing pairs a normal sprite ID with a palette ID. Artwork is authored once using a reserved band of placeholder palette indices for the company colour region, and at draw time the blitter runs a colour remap mode doing a per pixel table lookup that substitutes the active company's colour ramp. The OpenGFX authoring side maps the company colour band to 16 different target ramps. Palette animation (cycling water and lights) is a separate path that rewrites the live palette. The LUT is data, the sim owns which company owns what, the renderer owns pixels. One table lookup per pixel, so N brandings cost zero extra art memory. Strengths: one artwork to unlimited liveries, deterministic, tiny memory, designer authorable. Weaknesses: requires an indexed palette pipeline, and a straight WebGL or Phaser multiply tint reproduces a single hue but not an 8 shade ramp remap without a shader or pre baked variants.

**Project Studio translation.** This is the branding pattern for studio identity. `StudioLotSnapshot` carries `studioName` and `standingValues`, and a studio's brand colours could recolour signage, the gate marquee, banners, awnings, and crew and vehicle liveries from a single placeholder set with no per studio art duplication, fully deterministic from the snapshot. Because the D1 Phaser layer uses procedurally drawn placeholders (`assets.ts`, `palette.ts`), the cleanest reimplementation is a deterministic recolour or tint helper over the snapshot: for placeholders, apply Phaser tint or palette swap keyed to a brand colour, and for future authored art either a small fragment shader doing indexed remap or pre baked ramp variants. Do not copy OpenTTD C++ or OpenGFX GPL ramp values, derive Project Studio's own ramps.

**Disposition:** CLEAN_ROOM_REIMPLEMENT.

**Validation test.** Add one brand colour to a throwaway snapshot field and a deterministic recolour helper in the lot layer, render the gate and signage placeholder under two brand colours, and assert the two frames differ only in the branded pixels, are identical given identical snapshot and `sceneSeed`, and that disabling animation or changing frame rate does not change output.

#### 5.3 First class zoom level enum tied to LOD thresholds

`zoom_type.h` makes zoom a first class discrete enum (In4x through Out8x) with iteration markers and a base derived from Normal. It also encodes semantic zoom bindings (viewport and town at Normal, industry at Out2x) plus LOD thresholds (details show at or below Out2x, no text effects above it). The blitter's draw takes zoom as a parameter, large sprites carry multiple zoom variants, and the cache decides which resolutions to keep resident. Current zoom is view state, never sim state. Per zoom caching bounds memory and LOD thresholds cut per frame work when zoomed out. Strengths: a clean testable LOD policy driven by a single enum, memory aware, ties what detail to show to how far out you are. Weaknesses: fixed discrete steps, and extra zoom art multiplies asset cost.

**Project Studio translation.** Maps onto the fixed isometric management readability goal and the camera presets (overview, production, wide in `StudioLotView`). A small discrete zoom or preset enum with explicit LOD thresholds is the right model: at overview hide named crew sprites and per prop jitter (all derived from `sceneSeed`) and show only building labels plus attention states, at production reveal `ProductionCard` progress and worker activity. It also gives a home to the Asset Lab LOD0/1/2 work if 3D is ever hybridised. The per zoom cache control idea informs the `pause`/`resume` CPU budget already in `StudioLotView`.

**Disposition:** STUDY_ONLY.

**Validation test.** Define a three value zoom band enum mapped from the existing camera presets and one LOD threshold (crew visible only below overview), and assert that at the overview preset the lot emits no per character display objects while building labels and attention icons remain, and that switching bands never alters the underlying `StudioLotSnapshot`.

#### 5.4 Isometric depth via 3D AABB topological sort

Each drawable is a parent sprite carrying a full 3D axis aligned bounding box plus screen coords and sprite and palette IDs. `ViewportSortParentSprites` presorts by box origin, then for each sprite scans nearby candidates and, when two boxes overlap in X and Y and Z, forces the behind one earlier, a topological dependency sort resolving genuine occlusion, with an SSE4 fast path. Every object declares a real 3D extent so tall, overlapping, moving objects sort correctly. Near O(n) in practice via windowing plus SSE. Strengths: correct for dynamic variable height overlapping content. Weaknesses: much more complex than a static grid painter sort, overkill when objects are grid aligned and non overlapping.

**Project Studio translation.** Validates D1's simpler choice. `iso.ts` uses `depthFor = (gx+gy)*16 + layerBias`, a single front corner painter's algorithm with a LAYER table. For D1's static grid aligned non overlapping buildings that is correct and appropriately simple, and OpenTTD's machinery would be over engineering. The lesson is a boundary condition: the moment the lot introduces tall sprites that overlap in screen space or moving crew that pass in front of and behind buildings, the single corner key can mis sort and a box overlap test becomes necessary. Reach for this design only when that boundary is crossed.

**Disposition:** STUDY_ONLY.

**Validation test.** Build a scene with a tall placeholder (water tower or gate marquee) and a crew sprite whose grid cell sorts in front by `depthFor` but which visually stands behind the tower, and confirm whether `iso.ts` renders it correctly. If it mis sorts, that is the trigger to adopt an AABB comparator, if not, document that the painter key suffices for current content.

#### 5.5 OpenGFX clean room free art set (the open is not CC0 lesson)

A separate repository, separate authorship, separate license grant reproduces the function of the retail TTD art (same sprite ID layout, same reserved company colour band, same climates) without copying a single retail pixel. It is data consumed by the engine's base set loader, authored as PNG plus NML. It proves art is a replaceable contract: the same GPL engine runs on retail or OpenGFX. The critical lesson is that free and open here means GPL-2.0 copyleft, not public domain and not CC0, so copying OpenGFX pixels into a product imposes GPL on that product. An open art set is emphatically not automatically safe to reuse, exactly the trap the Asset Lab provenance discipline exists to catch.

**Project Studio translation.** OpenGFX validates the Asset Lab's whole strategy: build a replaceable art contract and back it with an independently authored license clean art set (the 05H authored base, Quaternius CC0). It sharpens the Lab's governing rule that a free download is not a known production license: OpenGFX is a concrete case where the download is free, popular, and still copyleft. Project Studio's convention (original or CC0 art with per asset license evidence in `licenses/` and a `studio_base` prop) is stricter and safer than GPL and should stay that way. Keep treating any third party art as LICENSE-UNCLEAR until embedded evidence proves CC0 or permissive, never fold OpenGFX or any GPL sprites into `public/assets/studio`, and ship original or CC0 art only in the D1-A package.

**Disposition:** STUDY_ONLY.

**Validation test.** Governance check, not code: confirm the Asset Lab provenance policy explicitly classifies GPL and copyleft art as non adoptable (distinct from CC0), using OpenGFX as the worked example, so a future contributor cannot mistake a famous free art set for reusable in a non GPL product.

### Overall disposition and license risk

Study only overall. Adopt the architecture lessons via clean room reimplementation, do not lift GPL-2.0 C++ and do not copy OpenGFX pixels. The four durable lessons: a manifest driven checksummed swappable base set that decouples engine from art and carries provenance (reinforces the Asset Lab discipline and D1-A), recolour by palette remap for branding (one artwork, many liveries), zoom as a first class enum tied to LOD (reinforces fixed isometric management readability and the Asset Lab LOD work), and an independent clean room free art set proving art is a replaceable contract, with the sharp caveat that open can still be copyleft. The C++ renderer is 2D indexed palette and not adoptable into the Phaser and React stack, and is not grounds for a renderer rewrite.

License risk: MEDIUM. Copyleft consequence is severe if code or OpenGFX pixels are copied, but both actions are disallowed and avoidable. Provenance risk LOW.

---

## 6. Augustus (priority 2)

### Verified facts

- URL: https://github.com/Keriew/augustus.
- Branch and commit: `master` at `01f774b39a0fc0eaa5a33f259ed23bc1d2738d5d`, HEAD dated 2026-08-01 (audit day).
- Activity: extremely active, multi contributor, builds for Windows, Linux, Mac, Vita, Switch, Android, emscripten.
- Language: C (C99), 478 `.c` and 465 `.h`, on SDL2 and SDL3.
- Render tech: custom immediate mode 2D sprite blitter over SDL. Direct 2:1 isometric projection on a logical grid (tile 60 by 30 pixels) via a precomputed view to grid lookup table, painter's algorithm depth via ordered multi pass tile iteration. Same conceptual family as `iso.ts` (2:1, 128 by 64), differing in tile pixel size and immediate mode vs Phaser display list.
- Code license: AGPL-3.0-only. Verified verbatim in `LICENSE.txt` (GNU Affero GPL v3). Aggressive network copyleft, not permissive.
- Art license: mixed and must be split. Augustus authored supplementary graphics in `res/assets/` (4217 files exactly, verdict confirmed: new building sprites, cursors, UI) are CC BY-SA 3.0 Unported per `res/assets/LICENSE`, copyleft and share alike, attribution required. The core tileset, terrain, walker, and building sprites are not in the repo and are proprietary retail Caesar III assets the user must supply.
- Audio license: core sound and music not shipped, they come from the user's retail Caesar III install, with optional Sierra MP3 support. No audio license file observed.
- Commercial asset dependency: functionally dependent though not bundled. README is explicit that Augustus requires the original Caesar III assets to run. Precisely the cautionary lesson: an open source engine does not make the retail assets it loads reusable.
- Doc quality: good for players, moderate for engine internals. Multilingual PDF manuals, a `doc/BUILDING.md`, cleanly foldered subsystems. Lightly commented source, no formal renderer architecture doc.
- Provenance risk (verdict): HIGH.

### Where the patterns live

Multi pass renderer in `src/widget/city/draw.c`, `src/city/view.c` and `.h`, `src/map/grid.c` and `.h`. Overlays in `src/widget/city/overlay/overlay.h` and `.c`, `education.c`, `other.c`. Construction ghost in `src/widget/city/building_ghost.c` and `.h`, `src/map/desirability.c`. Walkers in `src/widget/city/figure.c`, `src/figure/figure.h`, `src/map/figure.c`, `src/figuretype/`, `src/figure/image.h`. Building state art in `src/building/animation.c`, `src/building/image.c`, `res/assets/Graphics/Admin_Logistics/`.

### Patterns

#### 6.1 Multi pass isometric tile renderer with precomputed view to grid lookup and painter depth

`city_draw` runs strictly ordered passes over the visible viewport: paint every ground and footprint tile, then walk row by row so tall building tops, walkers, and animations composite in correct back to front order, then an overlay pass, then an elevated figure pass. Screen to grid is not recomputed per frame, a view to grid offset lookup table is built once and screen picking uses an odd or even parity plus modulo test to resolve which diamond a pixel is in. Separating footprint (flat ground) from top (the raised part of a sprite) is the core trick that makes overlapping multi tile buildings sort correctly. The renderer reads global map and building state directly (no snapshot boundary). Immediate mode blit of only in viewport tiles, the lookup table avoids per tile math. Strengths: rock solid depth sort for dense overlapping structures, cheap picking. Weaknesses: reads all global state (no isolation), C immediate mode does not port to a retained Phaser list, tile size and sprite band assumptions baked in.

**Project Studio translation.** Direct parallel to `iso.ts` (`depthFor = (gx+gy)*16 + layerBias`) and `LotScene`'s LAYER constants. The footprint vs top split is a more rigorous version of the D1 layer bias for multi tile stages and admin and theater. The row by row figure and top interleave is exactly what a future studio lot with walking crew across building fronts will need. The precomputed screen to grid lookup plus parity pick maps to `screenToGrid` selection. The critical divergence: the Augustus renderer owns simulation truth, and the D1 contract forbids that, the lot only ever sees `StudioLotSnapshot`. Adopt the depth discipline, not the state coupling.

**Disposition:** CLEAN_ROOM_REIMPLEMENT.

**Validation test.** In a throwaway Phaser harness, place two overlapping multi tile buildings plus a walker crossing in front of and behind them, using only footprint and top band separation and row ordered figure interleave, and assert the z order is correct and a click resolves to the correct grid tile via the parity pick. Prove it needs no access to `GameState` beyond a snapshot.

#### 6.2 Function pointer overlay abstraction with column height plus greyscale service coverage

Each overlay is a tiny uniform struct of callbacks (`show_building`, `show_figure`, `get_column_height`, `get_tooltip`, `draw_layer`). When an overlay is active, buildings and figures not relevant to it are drawn desaturated so the eye isolates the subsystem, and relevant buildings get a colored column whose height encodes magnitude. Tooltip functions map a raw 0 to 100 value into a small set of qualitative text ids (none, poor, some, good): quantitative truth rendered as human readable bands. Overlays read global building state. Trivial per tile callbacks. Strengths: an extremely clean extension point (a new overlay is about five small functions), and a consistent visual grammar (dim the rest plus column plus banded tooltip) across roughly 20 overlays. Weaknesses: column art and greyscale rely on the sprite pipeline, callbacks assume direct global state access.

**Project Studio translation.** The single most transferable pattern here. It is the disciplined generalization of the `AttentionState` union and `BuildingState`. Each Project Studio overlay (standing and awareness, cash pressure, stage occupancy, future service coverage) could be one snapshot fed descriptor exposing show, height, band, tooltip. The 0 to 100 to qualitative band mapping is exactly `cashBand` and the standing bands, and reinforces the contract rule that the renderer illustrates bands and never recomputes formulas. The dim everything not in focus technique is a ready answer for how D2 could present `decision-required` focus without color only encoding: Augustus pairs column color with height with tooltip text, matching the never color alone rule.

**Disposition:** CLEAN_ROOM_REIMPLEMENT.

**Validation test.** Define one Project Studio overlay descriptor (production heat over Stage A and B) fed only by `StudioLotSnapshot` fields, that dims non stage buildings, draws a banded indicator on active stages, and yields a qualitative tooltip. Verify identical snapshot input always yields identical overlay output, and that removing color still leaves height plus text legible.

#### 6.3 Construction placement ghost with per tile blocked and discouraged states and live range preview

`city_building_ghost_draw` computes, per footprint tile, a status of allowed, discouraged, or forbidden via a blocked test. Forbidden and discouraged tiles tint red, valid tiles a semi transparent footprint ghost, and the whole building ghost is red if any tile is blocked. While dragging it can also render the future desirability range the building would project, so the player previews consequences before committing. Reads global terrain, figure, and building state, the ghost is transient and non committing (no mutation until confirm). Only the footprint neighborhood is evaluated. Strengths: instant legible consequence aware placement feedback with a clear tri state and no premature mutation. Weaknesses: tied to Caesar III's terrain and occupancy model and sprite masks.

**Project Studio translation.** Section 11 defers construction and the lot as non goals for phases 1 to 4, and `StageState` reserves labels for D2, so this is a future facilities reference not a now build. When facilities land, this is the canonical model for a non committing build preview: tri state footprint legality plus a consequence preview (Augustus previews desirability, Project Studio could preview adjacency or standing effect), rendered from a snapshot with zero `GameState` mutation until an explicit action, aligning with `navigation.ts`. It also models how the `expansion` building could show an in lot informational placeholder becoming a real placement flow later.

**Disposition:** STUDY_ONLY.

**Validation test.** Prototype (outside the sim) a placement overlay that, given a candidate footprint and a mocked occupancy snapshot, renders allowed, discouraged, forbidden per tile plus a one facet consequence preview, and confirm it mutates nothing and produces identical visuals for identical input, before any real construction feature is scoped.

#### 6.4 Grid linked walkers with direction and action sprite selection and sub tile interpolation

Figures are linked to the tile grid (a per tile figure list) so a draw pass finds figures on a tile. Each figure carries type, action, direction, animation frame, and smooth motion fields (a 15 sub unit cross country coordinate plus progress on tile). Figure draw runs inside the row ordered pass so figures sort against building tops, the image id is chosen from type plus direction plus action plus frame, and multi part figures (walker plus cart) are layered with a y offset test so the cart draws behind or in front depending on facing. Figures are sim entities drawn directly. Per tile figure lists bound the work to visible tiles. Strengths: convincing ambient life and readable directional sprites from a compact record, deterministic given sim state. Weaknesses: sprite sheet per direction art is expensive, and figures are full sim entities not decorative, the opposite of management distance decorative crew.

**Project Studio translation.** Maps to future character activity on the lot (crew walking between Stage A and B, Development, Casting) and to the Asset Lab decorative crew work. The key lesson for the `sceneSeed` contract: Augustus figures are simulation truth (their position matters to gameplay), and Project Studio deliberately inverts this, ambient worker positions and jitter derive deterministically from `StudioLotSnapshot.sceneSeed` and carry no engine meaning. Adopt the direction and action sprite selection and sub tile interpolation technique for smooth readable motion, but keep crew decorative (seed driven, not state bearing), preserving the determinism invariant. The cart layering facing test is a concrete recipe for props a worker carries.

**Disposition:** STUDY_ONLY.

**Validation test.** In the lot harness, drive one seed derived worker along a fixed path using direction plus frame sprite selection and sub tile interpolation, and assert the same `sceneSeed` yields byte identical positions across runs and frame rates, and that the worker carries no field the snapshot did not provide.

#### 6.5 Building state readability via layered ON and OFF plus status icon sprites and selection color mask

A building's readable status is composited from multiple layered sprites rather than one static image: a base image plus an ON layer and animation frames when active (the asset naming shows the grammar, `Architects_Guild_OFF.png` vs `Architects_Guild_ON_Layer.png` vs `On_01..06.png`), plus small status icons overlaid on top (mothball sprite when mothballed, stockpile sprite when goods stockpiled). Selection and hover is a non destructive color mask over the existing sprite. The newest HEAD commit even adds building health bars to an overlay. Reads global building state. Strengths: one building silhouette communicates many discrete states through additive layers plus a small consistent icon vocabulary plus reversible tint, legible at management zoom without text. Weaknesses: needs an authored OFF, ON, animation, icon set per building, tint masks assume blitter color mask support.

**Project Studio translation.** The art and compositing answer to `BuildingState`, `StageState`, `AttentionState`, and `ProductionCard` readability. Project Studio already models filming vs available (absence of a card) and `underDressed` and attention flags, and Augustus shows the visual grammar: base plus active layer plus status icon plus reversible selection tint, each state paired with a distinct icon or shape not color alone, exactly the contract's attention rule. Directly informs the D1-A Studio Identity Package and the recommended first production art slice: define an ON, OFF, active animation, and status icon set per building so occupancy, warning, and under dressed read at a glance. The selection color mask maps to `selectedBuildingId` highlighting.

**Disposition:** STUDY_ONLY.

**Validation test.** For a single building (Stage A), mock the snapshot through its states (available, filming, warning, under dressed) and confirm each is distinguishable by icon plus layer plus shape with color removed, and that selection tint is fully reversible.

### Overall disposition and license risk

Study the codebase (AGPL-3.0 network copyleft forbids copying any code into a closed project), with the strongest readability patterns worth a clean room reimplementation in the TS and Phaser stack from the described behavior, never from the source. Reject all assets: core art and audio is proprietary retail Caesar III (illegal to reuse), and `res/assets` is CC BY-SA share alike (copyleft, incompatible with a closed art bundle). Net: an excellent design reference for building state readability, service coverage overlays, construction preview, and multi pass isometric depth sorting, and a legal no go for any code or asset lift.

License risk: HIGH. AGPL is the most aggressive copyleft here, and the retail Caesar III dependency plus share alike `res/assets` mean nothing is safely liftable. Provenance risk HIGH.

---

## 7. GDQuest godot-2d-builder (priority 2)

### Verified facts

- URL: https://github.com/gdquest-demos/godot-2d-builder (the older `GDQuest/godot-2d-builder` URL 301 redirects here after the org rename).
- Branch and commit: `master` at `e78b92f9315c8786573700c6fa8a006e32fad69b`, HEAD dated 2021-09-13.
- Activity: stable, no longer actively developed, a course demo.
- Language: GDScript (Godot 3.x).
- Render tech: Godot 3.x 2D renderer, isometric TileMap and TileSet (100px diamond), a YSort node for painter order depth, region rect atlas swapping for autotiling, SVG sourced textures.
- Code license: MIT, verified verbatim ("Copyright (c) 2020 GDQuest").
- Art license: original GDQuest vector art (SVG) plus a small PNG indicator, no separate art license file, so covered by the repo MIT license. Not commercial third party art. Verdict corrects two art paths: `pawn.svg` is at `godot/Entities/Player/pawn.svg` (not `godot/Shared/`), and `pipes.svg` exists only as the renamed `godot/Shared/_deprecated_pipes.svg`. Confirmed present art: `godot/Shared/tileset.svg`, `blueprints.svg`, `symbols.svg`, `leaf.svg`, `progress_circle.png`. Font `BagnardSans.otf` under SIL OFL 1.1.
- Audio license: no audio in repository.
- Commercial asset dependency: none. Thematically inspired by Factorio, but ships GDQuest's own original SVG art and machine designs, no retail sprites, tilesets, or audio.
- Doc quality: modest. Good in code comments, but a one paragraph course pointer README with no architecture docs, no build instructions, no asset provenance section, no tests.
- Provenance risk (verdict): LOW.

### Where the patterns live

`godot/Systems/EntityPlacer.gd`, `godot/Entities/Blueprints/BlueprintEntity.gd`, `godot/Systems/EntityTracker.gd`, `godot/Systems/Simulation.gd`, `godot/SimulationDemo.tscn`, `godot/Autoload/Events.gd`, `godot/GUI/InfoGUI/InfoGUI.gd`, `godot/Entities/Blueprints/Wire/WireBlueprint.gd`, `godot/Shared/Types.gd`.

### Patterns

The whole project is GDScript for Godot 3.x, so nothing is code portable into the TS and Phaser stack (`ADAPT_PERMISSIVE_CODE` is technically MIT permitted but not applicable, wrong engine and language). Crucially the whole placement path here mutates game state on click (spends inventory, drops items), which directly conflicts with the D1 contract (the lot performs navigation only, never mutates `GameState`), so only the read only visualization half of any pattern translates, and even that is D2 plus, not D1.

#### 7.1 Cursor follow ghost with white and red validity tint

The same `BlueprintEntity` node that renders in the inventory is reused as the world ghost. Every frame and on mouse motion the ghost is snapped to the grid cell under the cursor and tinted white when valid, red when invalid. Validity is recomputed live from the occupancy tracker and ground each move, the ghost holds no truth. Trivial cost (one node, per frame transform). Strengths: dead simple, single node reuse (inventory item equals world ghost), instant visual validity. Weaknesses: validity is communicated by color alone (white vs red) with no icon or shape or text, which violates Project Studio's never color alone rule, and it commits placement on the same click, entangling preview and mutation.

**Project Studio translation.** Maps to a future D2 plus construction and expansion preview for the `expansion` building or new facilities. A reimplementation would derive the ghost's grid position from `screenToGrid` in `iso.ts`, depth sort via `depthFor` and `LAYER.building`, and compute validity from the `StudioLotSnapshot` (a build site's `BuildingState.available` or `underDressed`), never from live `GameState`. It must replace the white and red only tint with a color plus icon plus label validity chip to satisfy the accessibility rule, and must not commit anything (navigation only, greenlighting a build stays a semantic React control per `navigation.ts`).

**Disposition:** CLEAN_ROOM_REIMPLEMENT.

**Validation test.** In an isolated Phaser harness over a mock snapshot, drag a build ghost across the iso grid at 30 and 60fps and assert the ghost's grid cell equals `screenToGrid(pointer)` deterministically, that a valid or invalid classification derived only from snapshot fields flips a color plus icon plus text chip (not color alone), and that no snapshot or `GameState` field is written.

#### 7.2 Grid cell occupancy dictionary as placement source of truth

`EntityTracker` is a plain object holding entities keyed by integer grid cell, with place, remove, is occupied, and get at operations and signals. It is deliberately separated from the TileMap that draws. Validity in the placer is a three predicate AND: not occupied, within a max work distance of the player, and on a ground tile. The simulation owns occupancy, the renderer queries it. O(1) dict lookups. Strengths: clean separation of where things are from how they are drawn, composable validity predicates, single sourced authoritative occupancy. Weaknesses: mutable engine side state (the opposite of the immutable snapshot model), and the is close to player predicate is avatar centric, which a management view lot has no analogue for.

**Project Studio translation.** Reinforces the D1 invariant rather than adding to it: occupancy and validity is sim truth, and `StudioLotSnapshot` exposes only display facts (`BuildingState.available` is the correct analogue of is occupied). If construction is ever built, the buildable cell set belongs in the pure sim core and surfaces through `studioLotSnapshot`, the Phaser lot must never maintain its own occupancy map. The three predicate idea (occupied, in range, on buildable ground) is a good checklist, but in range of player drops out (no avatar) and is replaced by studio level gates (cash band, expansion unlocked).

**Disposition:** STUDY_ONLY.

**Validation test.** Confirmatory for D1. If construction is scoped: a pure headless unit test asserting `studioLotSnapshot` reports the same buildable and occupied cell set for a given seeded `GameState` across headless, lot visible, and animations off runs.

#### 7.3 Two tilemap plus YSort scene organization

Three cooperating layers: a ground TileMap whose cell id gates placement (only the floor id is buildable), an entity placer TileMap under a YSort so placed machines depth sort against the player by screen Y, and a flat entities layer below the player for things you walk over (wires). Godot's built in YSort gives automatic painter order by Y. The ground map is static authorization data, the placer is dynamic. Strengths: separating where you may build (ground map) from what is built (entity map) from walk under dressing (flat layer) is a clean reusable decomposition. Weaknesses: relies on Godot's built in YSort and TileMap iso, not portable code, and a single flat ground notion is thinner than a studio lot's roads and plazas and backlot.

**Project Studio translation.** Direct conceptual parallel to the lot's existing layering: `iso.ts` LAYER (ground, dressing, shadow, building, prop, overlay) and `depthFor`. Project Studio already hand rolls what Godot gets from YSort. The reusable idea is the ground map authorizes placement split: a future buildable plot layer distinct from the building and prop layers, and a distinct walk under dressing layer for the studio apron and avenues (the Asset Lab 04 gate plus avenue reference). Confirms the deliberate choice of a direct iso transform over Phaser's Tiled loader, for the same reasons GDQuest keeps explicit layer control.

**Disposition:** STUDY_ONLY.

**Validation test.** Confirmatory. If revisited: a Phaser depth order snapshot test asserting a building at a cell always paints behind a prop one cell nearer the camera and in front of ground dressing, matching `depthFor`.

#### 7.4 Decoupled hover and selection via a global signal bus

On motion with no held blueprint, hover does not reach into the info panel directly, it fires a global signal on the `Events` autoload and the info panel subscribes. Left click on an occupied interactive cell opens its GUI. Transient hover state lives in the placer, the info panel derives from the signal. Strengths: clean publish and subscribe decoupling (the placer knows nothing about the panel). Weaknesses: the actual outline on hover feedback is commented out (dead code), so shipped hover feedback is info panel only, a reminder that a hover affordance needs an explicit visual not just a signal, and a global singleton signal bus gets hard to trace at scale.

**Project Studio translation.** Mirrors `StudioLotView`'s outbound contract (`onSelect`, `onCharacter`, `onActivity` callbacks) and `StudioLotScreen` owning selection session state. Project Studio already uses the healthy version, typed callbacks instead of a stringly global bus. Selecting a building to surface `BUILDING_LABELS` and `BUILDING_BLURBS` is the analogue of open entity GUI. Takeaway to heed: give hover and selected buildings an explicit visual affordance (the D1 attention color plus icon or shape), do not repeat GDQuest's commented out outline gap.

**Disposition:** STUDY_ONLY.

**Validation test.** Confirmatory. The existing `studio-lot-snapshot.test.ts` and `StudioLotScreen.test.tsx` already assert selection and `onSelect` wiring, ensure a selected or hovered building renders a non color only affordance.

#### 7.5 Neighbor aware autotile preview for connected structures (bitmask directions)

For the cell under the ghost, the four orthogonal neighbors are inspected and a 4 bit mask of power connected neighbors is OR'd. A directions data map from each 0 to 15 bitmask to a region rect picks the correct connector sprite as the ghost moves, and on placement re dresses already placed neighbors. Wires go in the walk under layer. Strengths: the ghost previews not just position and validity but how it will connect, and re dresses neighbors on placement, strong what you will get feedback via compact integer bitmask autotiling. Weaknesses: sprite atlas coupled (needs all 15 connector variants), orthogonal only, specific to networked structures.

**Project Studio translation.** Only relevant if a future lot feature has adjacency or connection semantics, for example avenues or roads linking buildings, or a facilities adjacency bonus visualization. A clean room version would compute a neighbor mask from the snapshot's building or plot grid and choose a connector variant deterministically from connection facts (connection is truth, not ambient variation). For plain independent studio buildings there is no adjacency network, so this is likely out of scope, flagged so it is not over applied. Do not assume authored connector sprites exist, D1 uses procedurally drawn placeholders (`assets.ts`).

**Disposition:** STUDY_ONLY.

**Validation test.** Only if adjacency is ever scoped: a headless test that, for a mock lot grid, computes the same 4 bit neighbor mask and selected connector variant across frame rates and with animations off, proving connection visuals derive from snapshot truth and never from RNG.

### Overall disposition and license risk

Study only overall. The value is entirely the read only pattern set for a future construction and facilities preview feature, where the ghost preview, placement validity, and occupancy tracker patterns are worth a clean room reimplementation. Because the whole placement path mutates game state on click (conflicting with the D1 navigation only contract), only the read only visualization half translates, and even that is D2 plus, not D1. This is not a reason to touch the renderer.

License risk: LOW. MIT code plus OFL font plus no commercial assets, but the code is the wrong engine and language so nothing is code portable regardless. Provenance risk LOW.

---

## 8. Industry Idle (priority 2)

### Verified facts

- URL: https://github.com/fishpondstudio/IndustryIdle.
- Branch and commit: `main` at `2f0cc5092ae1a4a6efd9d99aa07521e2d660666e`, HEAD dated 2026-05-22.
- Activity: actively maintained commercial game (paid on Steam, iOS, Android, free web build).
- Language: TypeScript.
- Render tech: Cocos Creator 2.4.11 rendering a WebGL and Canvas world layer, world grid and selection drawn with cc.Graphics, DOM UI panels rendered separately via Mithril. Not Pixi and not Phaser.
- Code license: GPL-3.0-only. Verified verbatim (674 line GNU GPL v3) plus README license section. Note: `package.json` says `ISC`, which is unpopulated npm boilerplate contradicted by the actual LICENSE and README, the authoritative license is GPLv3 viral copyleft.
- Art license: proprietary and non redistributable. README states verbatim that artworks and assets are included in the repo but, due to complications of the original licenses, must not be redistributed. 263 building and resource PNGs live under `assets/resources/`.
- Audio license: proprietary and non redistributable, same README clause, 10 `.mp3` files bundled.
- Commercial asset dependency: yes. This is a commercial product whose retail art (263 PNGs) and audio (10 mp3) are committed to the repo but explicitly flagged do not redistribute. The GPLv3 game code does not legalize reuse of these bundled commercial assets, they are DO-NOT-USE. Two private git submodules (native, config) are referenced but not public.
- Doc quality: adequate. README is explicit about licenses, code is readable.
- Provenance risk (verdict): HIGH.

### Where the patterns live

Throughput viz in `assets/Script/CoreGame/EntityVisual.ts`, `World.ts`, `assets/Script/General/GameData.ts`. Supply chain overlay in `assets/Script/CoreGame/DrawLines.ts`, `ColorThemes.ts`. Grid in `GridHelper.ts`, `HexagonGrid.ts`, `SquareGrid.ts`, `GridInput.ts`. Runtime perf in `NodePools/NodePoolManager.ts`, `NodePools/DotsPool.ts`, `World.ts`, `assets/Script/General/Helper.ts`.

### Patterns

Two independent blockers to any code or asset reuse: the code is GPL-3.0 viral copyleft (pulling any non trivial snippet forces the derivative under GPLv3), and the bundled art and audio is retail commercial content explicitly marked non redistributable. The value is architectural.

#### 8.1 Decoupled throughput visualization: sim truth dots vs optional culled sprite

`EntityVisual.transport` computes a deterministic in transit record and writes it to a `T.dots` map keyed by id, with an alive until timestamp and lerp endpoints. A visible sprite is spawned only if a show resource movement check passes, gated by a user setting (hide, show, highlight, viewport). In viewport mode it spawns only when an endpoint is in view, in highlight mode only for the selected building's edges. Crucially the simulation owns delivery, not the renderer: `World.tickDots` delivers resources when the timestamp elapses, independent of whether any sprite ever existed, and the sprite, if present, is only lerped and only updated when in view. At hundreds of belts you keep every flow in the sim but pay GPU cost for at most the on screen or selected subset. Strengths: textbook presentation illustrates truth never manufactures it, the visual layer is fully optional and the headless result is byte identical. Weaknesses: sprite pool churn under rapid pan, dot count still O(active edges) in memory even when not drawn.

**Project Studio translation.** Reference design for anything that later animates production flow on the D1 lot (a script leaving Development, then Casting, then Stage A, then Post, then Theater). The dots vs sprite split is exactly the `StudioLotSnapshot` contract: the engine and selector own the fact (a production advanced, a film released), and `ui/src/lot` may render an ambient token illustrating it, seeded from `sceneSeed`, but must never let the token decide the outcome. The movement toggle maps to a snapshot level display toggle honoring `setReducedMotion` and the `pause`/`resume` viewport story already in `StudioLotView`. Delivery on timer regardless of sprite is the determinism invariant restated.

**Disposition:** CLEAN_ROOM_REIMPLEMENT.

**Validation test.** Headless: run the sim to a fixed seed and week with flow tokens off and again with tokens on (and at 30 vs 60fps), and assert identical `GameState` (cash, standings, released films), proving the token layer is purely illustrative. Then assert that in viewport mode, off screen productions still complete on schedule.

#### 8.2 Selection driven upstream and downstream supply chain overlay (red in, green out)

On selection change, `DrawLines` seeds upstream and downstream sets to the selected building, then on a timer scans the dots map: an edge whose destination is upstream is inbound supply (drawn red), an edge whose source is downstream is an outbound consumer (green). Lines are drawn into a single cc.Graphics with per edge dedup and line width normalized by camera zoom so strokes stay constant on screen, and the matching in transit dot is recolored with enhanced opacity for direct edges. When a show supply chain setting is on, the set grows transitively so the whole chain lights up. Color is always paired with direction plus opacity, never color alone. The overlay reads only dots plus selection and mutates nothing. Capped redraw frequency plus a single Graphics plus dedup keeps it cheap. Strengths: selection scoped, mutation free, legible via color plus direction plus opacity. Weaknesses: full dots scan every redraw (O(edges)), transitive expansion unbounded on dense graphs.

**Project Studio translation.** Maps directly to a D2 inspect a building interaction: select Stage A and light the pipeline that feeds and consumes it using color plus shape plus opacity, honoring the never color alone rule. The one Graphics with dedup plus zoom normalized stroke translates to Phaser: draw relationship lines in one Graphics object in `ui/src/lot/scene` with width scaled by camera zoom. The selection scoped mutation free reader mirrors `navigation.ts` (the lot never mutates `GameState`).

**Disposition:** CLEAN_ROOM_REIMPLEMENT.

**Validation test.** In the lot, select a stage and assert the overlay highlights exactly the buildings `StudioLotSnapshot` says are related (`ProductionCard.stageId`, the building set), with zero `GameState` mutation (only `getDebugState` selection changes), and that toggling the overlay changes no simulation output.

#### 8.3 Abstract Grid with precomputed centers and corners (hex or square swappable)

An abstract Grid base declares grid to position, position to grid, draw grid, draw selected, get adjacent, distance. Hexagon and Square implementations are interchangeable, chosen once. The hex grid precomputes every tile's world center and corner polyline into frozen maps at construction, so per frame conversion is a hash lookup not math. A canonical `"x,y"` string key is the join key used everywhere (buildings, dots, selection). Grid and selection draw into two separate Graphics layers, both debounced so pan and zoom do not thrash the vector redraw. Pure geometry, owns no game state. Strengths: precompute plus string keyed lookup plus debounce, and the abstraction makes the whole game grid topology agnostic. Weaknesses: precomputing all centers and corners is O(maxTile squared) memory up front (fine at small scale, needs chunking at large scale).

**Project Studio translation.** Analogous to `iso.ts`, which already does a direct 2:1 transform with `depthFor`. The lesson to study (not copy, `iso.ts` is deliberately its own hand rolled transform): keep a single canonical key per tile as the join between snapshot facts and rendered objects (D1 already keys `BuildingId`), precompute or cache tile screen anchors so hit testing and z order are lookups, and put the transform behind one small module so a future topology or era variant lot never touches call sites. The debounced two layer Graphics draw is a good pattern if a grid or selection outline is ever added.

**Disposition:** STUDY_ONLY.

**Validation test.** Property test `iso.ts` round trip `screenToGrid(gridToScreen(g)) === g` across the lot's tile range, and assert `depthFor` ordering matches painter order for two overlapping buildings.

#### 8.4 Browser scale runtime: node pooling plus viewport culling plus amortized ticks plus rate limited overlay text

Four cooperating levers. First, object pooling: a pool manager pre allocates nodes, recycles them, and a scheduled cleanup destroys nodes idle beyond a timer so the pool self trims after a burst. Second, viewport culling: cheap AABB in view checks skip dot position updates and off screen ring animations. Third, amortized work: only a fraction of buildings are processed per frame from a rolling tick queue instead of all buildings every frame. Fourth, rate limited overlays: at most 100 queued floating text closures drain per frame, with in view items prioritized to the front. Globally a 30fps cap on the whole game. Strengths: steady frame time under thousands of entities on a laptop browser. Weaknesses: pooling and patching is Cocos specific and intrusive, and amortized ticks add a frame or two of visual latency.

**Project Studio translation.** Even though D1 is small, these are the exact levers the browser performance constraint will want as the lot grows (more buildings, crew, active productions, era variants). `StudioLotView` already has the right bones: Phaser is lazy dynamic imported, and `pause`/`resume` sleeps the RAF loop when hidden (their 30fps cap analog). Additions to study for later: pool ambient crew and prop sprites instead of create and destroy, AABB cull worker and prop updates to the camera view (they already have camera presets), and if per building animation gets expensive, amortize it across frames via a rolling queue. Keep all of it presentation side so the determinism invariant holds.

**Disposition:** STUDY_ONLY.

**Validation test.** Micro benchmark in the lot harness: render the lot with nine buildings plus N ambient tokens with pooling and culling on vs off at fixed seed, and assert identical rendered layout (`getDebugState` display objects) and measurably lower per frame time with culling on, proving the perf layer changes cost not output.

#### 8.5 Per building status and attention overlays as discrete icon nodes (never color alone)

Each building has a visual component exposing dedicated child nodes: ring, warning, turn off, no power, under construction, plus a recipe sprite and a level label. On enable it resets them all inactive, then per tick logic toggles the relevant node active and sets the building color. A problem state is signalled by a distinct icon or shape node in addition to color, and the recipe sprite shows what the building makes. The spinning selection ring animates only when active and in view. Reads sim and entity state and reflects it. Strengths: composable status stack, each state independently toggleable, color never load bearing on its own. Weaknesses: many always present child nodes per building (memory), status logic entangled with the Cocos component lifecycle.

**Project Studio translation.** Concrete render side counterpart to the `AttentionState` union and `BuildingState` (attention, attention reason, under dressed). Industry Idle validates the D1 rule that every attention state pairs color with text or icon or shape: warning, no power, under construction are separate glyph nodes, exactly how D1's lot should render warning, empty, future. The recipe sprite is like showing a stage's current `ProductionCard` genre or title, the level label like a building tier or standing badge, under construction like the `underDressed` and future states and the expansion tile. Reinforces that the selector emits the state and the renderer only picks the matching glyph (D1 already reserves `decision-required` for D2, the same emit only what you can ground discipline).

**Disposition:** STUDY_ONLY.

**Validation test.** Snapshot driven test: feed `StudioLotView` a `StudioLotSnapshot` with each `AttentionState` and assert the rendered building shows a distinct non color marker per state, and that a color blind simulated render still distinguishes them.

### Overall disposition and license risk

Study only at the repository level. Several patterns (culled throughput and flow visualization, selection driven supply chain overlays, sim and render decoupling, viewport culling plus pooling plus amortized ticks, icon based status overlays) are directly on Project Studio's priority axes and worth clean room reimplementation from the described behavior. Do not import a single line or asset.

License risk: HIGH. GPL-3.0 viral copyleft plus bundled retail commercial art and audio marked do not redistribute. Provenance risk HIGH.

---

## 9. Egregoria (priority 2)

### Verified facts

- URL: https://github.com/Uriopass/Egregoria (cloned, no redirect).
- Branch and commit: `master` at `ae65c857948a905120474cf93b96dd51cec6d5f6`, HEAD dated 2025-06-02, VERSION file 0.6.1.
- Language: Rust (edition 2021, a Cargo workspace of 14 crates).
- Render tech: native 3D. Custom forward renderer over wgpu (Vulkan, DX12, Metal), glTF and GLB meshes, instanced rendering, SSAO, cascaded shadow maps, PBR. UI via egui and yakui. Not a browser or 2.5D isometric renderer.
- Code license: predominantly GPL-3.0. Verdict correction: the root LICENSE is verbatim GNU GPL v3 with no exception, but the license is not uniform. The `egui-inspect` and `egui-inspect-derive` workspace crates declare `MIT OR Apache-2.0`. Main crates (simulation, native_app, networking, headless) carry no license field, so their GPL status is inferred from the root LICENSE and only vs or-later is unstated. No README license statement.
- Art license: no separate art, audio, or font license file. About 142 binary assets (verdict count: 25 glb, 86 png, 22 jpg, 7 ogg, 1 ttf, 1 otf) fall under repo GPL-3.0 by default. Third party fonts (SpaceMono, Font Awesome solid) carry upstream licenses not restated in repo. Assets are Git LFS tracked.
- Audio license: no separate license, `.ogg` files fall under repo GPL-3.0 by default, none fetched (blob:none), provenance not confirmed.
- Commercial asset dependency: none. An original open source city builder inspired by Cities:Skylines, not a mod of and not bundling any retail game's assets. GLB models and shaders appear original. Individual asset provenance not byte inspected.
- Doc quality: high. `ARCHITECTURE.md` documents the sim and render decoupling philosophy explicitly (render state is specifically not contained along the simulated entities, the renderer holds a `HashMap<RoadID, RoadMesh>`), the fixed deterministic tick, deterministic lockstep networking, and a per crate codemap. One stale link (WorldCommand path renamed to `world_command.rs`).
- Provenance risk (verdict): LOW.

### Where the patterns live

`simulation/src/lib.rs`, `simulation/src/world_command.rs`, `simulation/src/utils/scheduler.rs`, `ARCHITECTURE.md`, `native_app/src/rendering/entity_render.rs`, `native_app/src/uiworld.rs`, `headless/src/main.rs`, `networking/src/lib.rs`, `simulation/src/tests/mod.rs`, `simulation/src/utils/rand_provider.rs`, `simulation/src/utils/replay.rs`, `native_app/src/gui/tools/selectable.rs`, `native_app/src/gui/mod.rs`.

### Patterns

GPL-3.0 copyleft makes the code legally unusable inside Project Studio (which is not GPL): no copying, no adaptation, no cherry picking. Its value is as an architecture reference that independently validates Project Studio's own `GameState` to snapshot boundary. Architectural patterns are not copyrightable, so a clean room reimplementation of a specific helper is defensible, verbatim or derived GPL code is not. Project Studio already implements the core split, so most patterns here are corroboration. This is not a renderer donor (Rust, wgpu, 3D vs TS, Phaser, 2.5D).

#### 9.1 Command driven deterministic tick as the only mutation path

`Simulation::tick(&mut self, schedule, commands)` applies all commands first (a code comment stresses this is what keeps instant commands deterministic), advances game time by one tick, then runs a fixed schedule of systems. `WorldCommand` is a serde serializable enum (make connection, build special building, terraform, spawn train, init) that is the closed set of legal mutations. The Simulation owns all truth, nothing outside can mutate except through a command. Strengths: identical to `(state, actions) => state`, and a single serializable command channel makes save, replay, network, and test trivially uniform. Weaknesses: uses an ECS resources bag plus an unsafe global system registry, idiomatic Rust plumbing not portable to TS and not to imitate.

**Project Studio translation.** Direct analogue of the sim core contract: Simulation is `GameState`, `WorldCommand` is the engine's action union, `tick(schedule, commands)` is `(state, actions) => state`. Validates routing all greenlight, hire, and advance week mutations through typed actions and keeping the studio lot renderer strictly on the read side (`navigation.ts` performs no mutation).

**Disposition:** STUDY_ONLY.

**Validation test.** No adoption needed, Project Studio already implements this. As corroboration: confirm every `GameState` mutation in `src/core/` is reachable only through a typed action, mirroring the single command entry point.

#### 9.2 Renderer holds an immutable borrow of the sim and owns no simulation truth, render state cached by entity ID

`InstancedRender::render(&mut self, sim: &Simulation, fctx)` takes an immutable borrow. Each frame it clears its instance buffers and rebuilds them by reading world entity transforms into mesh instance lists. Meshes live entirely renderer side, keyed to sim entity kinds, the sim never names a mesh. `ARCHITECTURE.md` states the rule explicitly: render state is not stored on simulated entities, the renderer keeps a `HashMap<RoadID, RoadMesh>` instead of a mesh field on Road. A separate `UiWorld` resource store holds all presentation only state (camera, tools, selection) separate from Simulation. Strengths: clean enforced separation, the same sim renders or runs headless unchanged. Weaknesses vs Project Studio: the renderer receives the whole `&Simulation` and may read any field, there is no narrow DTO. `StudioLotSnapshot` is a stricter contract, do not downgrade to passing full state.

**Project Studio translation.** Maps to the `studioLotSnapshot(state)` selector plus `StudioLotView` and `LotScene` reading only display facts, and to `UiWorld` being the React and Phaser session state (`selectedBuildingId`, camera presets, reduced motion) that must never hold sim truth. Confirms the invariant that presentation may illustrate but never manufacture engine truth. Takeaway: keep the narrow snapshot, it is stronger than Egregoria's full borrow approach.

**Disposition:** STUDY_ONLY.

**Validation test.** Assert the snapshot boundary is at least as strict as Egregoria's: verify `ui/src/lot/` imports the `StudioLotSnapshot` type only and never `GameState` or `src/core` types (an import boundary check), proving the renderer cannot read arbitrary sim state.

#### 9.3 Same engine runs headless (server) and in the GUI, driven by identical schedule plus commands

`headless/main` builds a Simulation and schedule and drives `tick` in a loop with no rendering, audio, or window. Networking exposes a generic deterministic lockstep server transmitting only commands so every client re simulates identically. The test harness constructs the same Simulation and schedule and applies commands, with a golden replay JSON. The sim is fully self contained and serde serializable, which is what makes headless, server, test, and replay reuse one code path. Strengths: proves the sim has zero hidden render or IO dependencies, the strongest possible evidence of a clean boundary, and multiplayer lockstep is a forcing function that makes determinism non optional. Weaknesses: none relevant, Rust specific plumbing not portable.

**Project Studio translation.** Direct analogue of the requirement that the same simulation produces the same result headlessly and with the lot visible. The headless crate is like the Project Studio headless harness, and its lockstep server validates the same invariant. Reinforces keeping Phaser lazy loaded and pausable so the sim never depends on the renderer being mounted.

**Disposition:** STUDY_ONLY.

**Validation test.** Run the sim headless and with the lot visible from one seed and action log and assert byte identical `GameState` (essentially the M0A byte identity test), the minimal proof the engine has no render side truth leakage.

#### 9.4 Built in determinism verification tooling: per resource state hashing, equality diff dump, seeded serialized RNG, command replay

`Simulation::hashes()` bincode encodes the world and each registered save resource and hashes them into a sorted map, a compact per subsystem fingerprint for detecting desync. `is_equal()` serializes two sims and, on mismatch, writes `{name}_a.json` and `{name}_b.json` to disk so a human can diff exactly which resource diverged. The RNG provider is a custom xorshift seeded from a constant and serde serialized as part of state, so RNG position survives save and load, with no wallclock and no thread_rng (grep confirmed `Instant::now` appears only in profiling, never feeding sim logic). Replay records the command stream for deterministic re execution with a golden file. Strengths: turns is it deterministic into a cheap automated assertion and a debuggable artifact, and the a and b JSON dump is an excellent triage affordance. Weaknesses: hashing over bincode is order and layout sensitive (sorted keys used deliberately), a portability caveat for any reimplementation.

**Project Studio translation.** Maps to the M0A instrumentation report plus byte identity tests. `hashes()` and `is_equal()` are exactly the helper Project Studio wants for proving `SaveFileV4` round trip and headless vs visible parity, the serialized seeded RNG mirrors the seeded RNG only, no `Math.random` rule (the provider is like the seeded generator persisted in state), and the dump on divergence is a concrete idea worth having as a TS test helper.

**Disposition:** CLEAN_ROOM_REIMPLEMENT.

**Validation test.** Reimplement clean room (from the described behavior only, do not read or copy the GPL source) a tiny test helper that snapshots two `GameState`s, hashes each top level subsystem, and on mismatch writes a and b JSON for diffing, and prove it flags a deliberately injected nondeterminism and stays green on a known good replay.

#### 9.5 ID based selection and inspection: UI holds only an entity ID, reconciled against the sim each frame

Selection stores no entity data, the inspected structs live in `UiWorld` and hold only an ID. Selection queries the sim's spatial index for the nearest hit within a per kind select radius and records the ID. Crucially, every frame it revalidates: if the sim no longer contains the entity, the selection is cleared, a weak reference reconciled against live sim truth so a despawned entity can never leave a dangling selection. The sim owns entities, the UI owns only the pointer to entity. Strengths: robust against sim mutation, no duplicated or stale entity copies on the render side, trivially serializable UI state. Weaknesses: per kind magic radii inline (Project Studio would route such constants through `TUNING`).

**Project Studio translation.** Maps to `selectedBuildingId` plus `StudioLotScreen`'s session state selection plus `onSelect`: the lot should hold only a building or entity ID and let the next snapshot reconcile it, never cache building data. Reinforces that `BuildingState` and `ProductionCard` identity flows from the engine and the renderer stores just the selected id. Useful precedent for future persistent named talent selection (click a worker, hold a talent id, reconcile).

**Disposition:** STUDY_ONLY.

**Validation test.** Verify that when a selected entity disappears from the snapshot (a production completes and its card leaves `activeProductions`), `StudioLotScreen` clears the selection rather than rendering stale data, the same contains else clear reconciliation Egregoria performs.

### Overall disposition and license risk

Study only. GPL-3.0 copyleft makes the code legally unusable inside a non GPL Project Studio, but the architecture independently validates the existing `GameState` and snapshot boundary, including determinism tooling (hashing, headless parity, replay) that the M0A byte identity work parallels. The one clean room candidate is the per resource state hash plus equality diff dump test helper. Not a renderer donor.

License risk: HIGH for code reuse (root GPL-3.0, though two utility crates are MIT OR Apache-2.0, and asset licenses are unstated defaulting to GPL). Provenance risk LOW.

---

## 10. IsoCity (priority 4)

### Verified facts

- URL: https://github.com/victorqribeiro/isocity (resolves directly, no redirect).
- Branch and commit: `master` at `c5772412d3e423318f2cf479ebdd50a2b9029d84`, HEAD dated 2024-10-14 (housekeeping only, the rendering code is unchanged from 2019 authorship).
- Activity: effectively dormant, a finished toy.
- Language: vanilla JavaScript ES6, no TypeScript.
- Render tech: HTML5 Canvas 2D. Two stacked canvas elements (a static background scene, a foreground hover overlay). No framework, no build step, no dependencies.
- Code license: MIT, verified verbatim ("Copyright (c) 2019 Victor Ribeiro").
- Art license: one third party spritesheet, `textures/01_130x66_130x230.png` (1560 by 1380, a 12 by 6 grid of 130 by 230 iso sprites), attributed to Kenney via OpenGameArt. Kenney art is standardly CC0, so likely CC0, but no license file or metadata for the texture exists in the repo, so the exact art license is not verifiable from the clone. Treat as likely CC0 but unconfirmed, separate from the MIT code.
- Audio license: not applicable, no audio assets or code.
- Commercial asset dependency: none, the only art is a free open spritesheet, no ripped commercial art.
- Doc quality: minimal. README covers concept, live link, and texture credit only, two one line provenance comments, no architecture docs, no tests. The code is short (185 lines) and legible in one sitting.
- Provenance risk (verdict): LOW.

### Where the patterns live

`js/main.js` (whole file), `index.html`. Verdict correction: the stacked `#bg` and `#fg` canvases in `#area` are at `index.html:26-29` (not 19-22, which are `<title>`, stylesheet link, `</head>`, `<body>`).

### Patterns

IsoCity is the closest structural analogue to `iso.ts`: the same 2:1 iso canvas math (128 by 64 tiles), a closed form grid to screen transform, and a painter order draw. Its MIT license would legally permit adaptation, but nothing in it beats what D1 already has, so it is a confirming reference and a crisp illustration of two things Project Studio deliberately does not do.

#### 10.1 Closed form isometric grid to screen transform (2:1, no per tile hit testing)

Forward transform: a single `translate((j-i)*tileWidth/2, (i+j)*tileHeight/2)`, the canonical diamond 2:1 projection (tileWidth 128, tileHeight 64, identical constants to `iso.ts`). Inverse (`getPosition`): the exact algebraic inverse for the ground plane, giving O(1) tile picking with zero per tile hit tests. Origin translated so the diamond centers with a top margin. Every sprite is 130 by 230 anchored so the top diamond aligns. Strengths: minimal, correct, allocation free, easy to verify by round trip, a textbook reference for exactly the transform D1 implements. Weaknesses: leaks globals, no z or elevation term, single uniform tile size, and picking ignores sprite height (you pick the ground cell under the cursor, not the tall building visually there).

**Project Studio translation.** Direct analogue of `iso.ts` `gridToScreen` and `screenToGrid`. Same 128 by 64 tiles, same projection, which confirms the D1 forward and inverse math is standard and correct. The D1 version is superior: `iso.ts` adds `depthFor` and a LAYER enum that IsoCity has no equivalent of, and keeps functions pure instead of mutating module globals. Nothing to adopt, use to sanity check the transform against a second independent implementation.

**Disposition:** STUDY_ONLY.

**Validation test.** Port the inverse into a throwaway test and assert `screenToGrid(gridToScreen(i,j)) === (i,j)` for a 7 by 7 and a larger grid, and confirm it agrees cell for cell with the `iso.ts` round trip. If they diverge, the D1 transform is the reference since it drives real selection.

#### 10.2 Implicit depth sort via fixed rectangular row major iteration (no comparator, no sort)

`drawMap` repaints all 49 tiles every input event in a fixed row major order. There is no explicit depth value, no z sort, no comparator anywhere. Correctness comes for free from a topological property of a complete rectangular iso grid: the only cells whose tall sprite can occlude a cell are its two back neighbors, and row major iteration always visits both first. But this holds only because the grid is full and rectangular, every occupant is anchored to exactly one cell, and there are no free moving or multi cell objects. Full 49 tile redraw per input event is fine at this scale. Strengths: zero cost, zero code depth ordering, elegant for a static tile grid. Weaknesses and hard limits: it breaks the moment you add anything Project Studio actually needs, a character standing between two buildings, a multi tile footprint, elevation, or any sprite not tile anchored, because iteration order no longer matches visual depth. No stable tie break, no dynamic re sort.

**Project Studio translation.** This is the pattern `LotScene` deliberately does not use, and inspecting it validates that choice. Project Studio has free objects (ambient workers, prop jitter, productions) at arbitrary sub cell positions plus buildings of differing heights, exactly the cases where implicit iteration order fails. That is why `iso.ts` computes an explicit `depthFor = (gx+gy)*16 + layerBias` and layers via LAYER. IsoCity is the concrete cautionary example proving explicit per object depth is necessary rather than optional.

**Disposition:** STUDY_ONLY.

**Validation test.** On a 3 by 3 grid, place two tall building sprites at back neighbor cells and a free worker sprite between them at a non cell centroid. Render once with row major iteration and once with `depthFor` explicit sort, and confirm the row major version mis occludes the worker while `depthFor` orders it correctly.

#### 10.3 Two canvas static scene and transient overlay separation

Two absolutely positioned canvases share the same size and origin. The background holds the committed city and is redrawn only on a map change (a click). The foreground is transparent and, on every mouse move, clears itself and draws a single translucent diamond over the hovered cell. So the expensive full scene repaint never happens on hover, only the cheap one tile overlay does. The foreground owns nothing, purely derived from the pointer. Strengths: clean separation of durable rendered state from transient feedback, minimal per frame work on hover, no flicker. Weaknesses: DOM level (two real canvas elements) rather than intra renderer layers, only one overlay concern, no selection persistence.

**Project Studio translation.** Conceptually mirrors D1 overlay handling: `iso.ts` reserves `LAYER.overlay = 10000` and `StudioLotView` exposes selection and highlight above the scene, achieving the same static and transient split inside a single Phaser scene via layers rather than two DOM canvases. The transferable principle is the discipline: never repaint the committed scene to show hover or selection feedback, keep that on a dedicated top layer cleared per pointer event. Worth confirming the D1 hover and selection path does not trigger a full scene redraw.

**Disposition:** STUDY_ONLY.

**Validation test.** Instrument the `LotScene` hover and selection to count display objects touched per mouse move, and assert it is O(1) (just the overlay and highlight) and does not redraw or re sort the building and prop layers. If a hover dirties the whole scene, adopt the dedicated overlay layer principle.

#### 10.4 Renderer owned mutable map plus URL hash state persistence (contrast and anti pattern)

The renderer is the model: the map array is the entire application state, and click writes into it directly. Serialization packs each cell as a byte, base64 encodes it, and pushes it into the URL hash, giving shareable URL save and load and browser back as undo. Rendering is derived by re reading the map. Strengths: dead simple, zero backend, shareable state, undo for free, genuinely clever for a toy editor. Weaknesses (for Project Studio): the renderer both owns and persists truth and mutates it in place, with no separation between simulation state and display.

**Project Studio translation.** This is precisely the architecture the D1 contract prohibits, so it is valuable as a sharp negative example. Project Studio's authoritative state is `GameState` and `SaveFileV4`, the lot receives a one way immutable `StudioLotSnapshot` via `studioLotSnapshot(state)` and mutates nothing, and no lot action spends money or advances time (navigation only). IsoCity's click writes the map and hash is the save file model would violate the determinism invariant and the renderer owns no simulation truth rule. Do not import any of this, cite it as the boundary Project Studio intentionally draws.

**Disposition:** REJECT.

**Validation test.** No adoption test, the pattern is rejected. The only useful check is a guard: assert the lot code path never writes to `GameState` and that `StudioLotSnapshot` is consumed read only. If such a write appears in `ui/src/lot`, that is the regression IsoCity warns against.

### Overall disposition and license risk

Study only. Inspecting IsoCity confirms the `iso.ts` math is correct and, in the areas that matter for a management sim, that the D1 design already exceeds it: the `depthFor` and LAYER explicit depth model, the one way `StudioLotSnapshot` selector, and the Phaser lifecycle are all strictly more capable than IsoCity's implicit iteration sort and renderer owned mutable map. Its highest value is as a confirming reference and a clean illustration of two things Project Studio deliberately does not do (implicit depth sort, renderer owning and persisting state). Copy no code.

License risk: LOW. MIT code, one plausibly CC0 spritesheet with unconfirmed embedded license. Provenance risk LOW.

---

## 11. Citybound (priority 4)

### Verified facts

- URL: https://github.com/citybound/citybound (resolves, no redirect).
- Branch and commit: `master` at `817de551d2bc96c90d0b7c74af4872454f42b44c`, single visible commit dated 2020-11-20 (dormant about 5.5 years).
- Language: Rust (sim and wasm) with a JS and TSX browser UI layer (stdweb, wasm32 target).
- Render tech: custom Rust actor driven mesh generation fed to a browser WebGL frontend, buildings are procedurally generated meshes via an architecture grammar, not sprite or tile assets. No isometric tilemap.
- Code license: AGPL-3.0. Verified verbatim in `LICENSE.txt` (GNU Affero GPL v3), README confirms.
- Art license: no dedicated in repo art license file. Verdict corrections to the raw finding: the icons in `cb_browser_ui/assets/icons/` are all `icons8-*.png`, third party Icons8 assets (their own terms, likely attribution required), not repo original and not the project's to relicense under AGPL. The `Inter-UI-*.woff` fonts are the Inter typeface under SIL OFL, a separate permissive grant. Neither ships an accompanying license file. `cb.png` and similar are presumably project original under repo AGPL.
- Audio license: none observed.
- Commercial asset dependency: none. An original open source city builder, not a mod of any retail game. Nearly all geometry is procedurally generated at runtime, no `.fbx`, `.obj`, `.gltf`, `.glb`, `.blend`, or audio in tree.
- Doc quality: moderate. README plus CONTRIBUTING plus an off repo design doc, sparsely commented code, an assumed familiarity with the bespoke `kay` actor framework.
- Provenance risk (verdict): MEDIUM (the Icons8 icons are misclassifiable as AGPL by an unwary contributor).

### Where the patterns live

`cb_simulation/src/transport/ui/mod.rs`, `cb_simulation/src/land_use/ui/mod.rs`, `cb_browser_ui/src/land_use_browser/mod.rs`, `cb_browser_ui/src/transport_browser/mod.rs`, `cb_simulation/src/land_use/buildings/architecture/language.rs` and `mod.rs` and `materials_and_props.rs`, `cb_browser_ui/src/renderOrder.js`, `cb_browser_ui/src/planning_browser/transport_planning/RoadInteractables.tsx`, `cb_planning/src/plan_manager/mod.rs`, `cb_browser_ui/src/stage/Stage.js`.

### Patterns

AGPL-3.0 network copyleft makes any code adoption legally incompatible with a closed Project Studio, so its value is purely as an architecture reference for strict simulation and presentation separation. The renderer (procedural 3D mesh, Rust actors) is a deliberate mismatch for the Phaser 2:1 iso D1 lot, so no renderer rewrite is warranted. All three patterns are study only.

#### 11.1 Sim actor to UI actor render info messaging boundary

Simulation actors (Lane, Building) own all truth, compute compact render structs (a car render info of position, direction, trip, or a building constructed event of id, lot, households, style), and push them across the actor message boundary to a UI side actor that lives in the separate `cb_browser_ui` crate. The frontend never reads full simulation state, it subscribes and receives only display ready facts. The sim emits world 2D coords and direction, the frontend maps to screen. Ownership is unambiguous: sim owns truth, UI owns only a local render cache. Message batching, compact serialization. Strengths: textbook enforcement of presentation illustrates never manufactures engine truth, the same sim runs headless or with the browser UI unchanged. Weaknesses: tied to the bespoke actor runtime, message per event is heavier than a pull selector.

**Project Studio translation.** This is the D1 contract already in place: the sim actors' render info structs are `StudioLotSnapshot`, and the UI actor owns only a cache rule is the `studioLotSnapshot(state)` selector at `adapter.ts` feeding `ui/src/lot`. Car render info maps to `ProductionCard` and character render facts, building constructed maps to `BuildingState` emission. Confirms the choice to keep the renderer ignorant of `GameState` is the same discipline a mature sim converged on.

**Disposition:** STUDY_ONLY.

**Validation test.** Confirm (already true in D1) that toggling the lot renderer on or off and swapping placeholder to final assets never changes any headless simulation result, that is, the render info boundary carries zero back influence. The existing `determinism.test.tsx` is the analog to prove before adopting any richer render info struct.

#### 11.2 Deterministic seeded procedural detail keyed by stable entity id

An architecture grammar resolves all visual variation via a seed of the building lot's stable id plus a named string channel, so the same lot always yields the same facade, props, and materials with no stored randomness. Random variables and choices are drawn from a hash of (stable id, ident channel), a pure function of the id. Strengths: reproducible ambient variety with zero per instance persistence, identical to a pure function seed. Weaknesses: grammar complexity, Rust and mesh library specific.

**Project Studio translation.** Direct analog to `StudioLotSnapshot.sceneSeed`, from which all ambient variation (worker start positions, prop jitter, light phases) derives deterministically with no `Math.random`. Citybound proves the same discipline scales from one seed field to a full building facade grammar while staying deterministic, a reference for how D1's `sceneSeed` could later drive richer per building dressing (stage signage, admin and commissary variants, era skins) without introducing stored state or `Math.random`.

**Disposition:** STUDY_ONLY.

**Validation test.** Smallest proof: derive two independent visual attributes in the D1 lot from `sceneSeed` plus a named channel string (mirroring the id and ident seeding), render twice at different frame rates and headless, and assert byte identical placement, extending the determinism invariant to a keyed channel scheme before committing to a grammar.

#### 11.3 Per subsystem UI trait split (interactables vs render meshes) with a fixed render order table

Each sim subsystem exposes its own UI trait and browser counterpart, and interaction is modeled as explicit interactable objects separate from passive render meshes. A single central `renderOrder.js` enumerates a fixed integer z order (deleted gestures below building ground below zones below asphalt below building outlines below building 3D below vegetation below gesture interactables below cars). Selection is routed through the plan manager interaction module, not by hit testing raw sim state. Strengths: one authoritative readable layer table (no scattered magic z values), interaction anchors are first class decoupled objects. Weaknesses: the 3D and gesture model does not map one to one to a painter's algorithm iso grid.

**Project Studio translation.** `renderOrder.js` is the conceptual sibling of `iso.ts` LAYER (ground, dressing, shadow, building, prop, overlay) plus `depthFor` painter ordering, which validates keeping one named layer table rather than inlining depths. The interactable as separate object pattern maps to D1 interaction anchors and `selectedBuildingId` and the navigation only `LotActionKind` to `LotRoute` design in `navigation.ts`: interaction objects that emit intent, never mutate sim state.

**Disposition:** STUDY_ONLY.

**Validation test.** Audit D1's LAYER table against a single source ordering: assert every drawn object's depth comes from the named LAYER enum plus `depthFor`, and that no interaction or selection path in `StudioLotView` reads or mutates `GameState`, a static check that selection is purely an anchor to `onAction` emission.

### Overall disposition and license risk

Study only. The whole value is confirmation that a mature sim converged on the same strict simulation and presentation separation D1 already enforces (render info messages as the analogue of `StudioLotSnapshot`, seeded procedural detail as the analogue of `sceneSeed`, one render order table as the analogue of `iso.ts` LAYER). Extract the patterns, never the AGPL code, and do not treat the procedural 3D renderer as grounds for a rewrite.

License risk: HIGH for code (AGPL network copyleft). Provenance risk MEDIUM (bundled Icons8 icons are third party attribution ware misfiled as AGPL, and Inter fonts are OFL, so the raw all assets are AGPL claim is refuted).

---

## Cross cutting conclusions

### License posture, in one place

- Copyleft code, never liftable: OpenRCT2 (GPL-3.0-or-later), Unknown Horizons (GPL-2.0-or-later), OpenTTD and OpenGFX (GPL-2.0-only), Augustus (AGPL-3.0-only), Industry Idle (GPL-3.0-only), Egregoria (GPL-3.0, with two MIT OR Apache-2.0 utility crates), Citybound (AGPL-3.0). Weak copyleft: FreeSO (MPL-2.0, per file disclosure).
- Permissive code, but wrong engine or nothing to gain: CorsixTH (MIT, Lua and C on SDL), GDQuest godot-2d-builder (MIT, GDScript on Godot 3.x), IsoCity (MIT, vanilla JS Canvas). `ADAPT_PERMISSIVE_CODE` was never a live option: the permissive repos are the wrong stack, and the on stack repos (Industry Idle, Egregoria, TS and Rust) are copyleft.
- Retail asset dependency (open engine does not legalize the assets): OpenRCT2, FreeSO, CorsixTH, OpenTTD, Augustus all require or reference proprietary retail data they do not and cannot ship. Industry Idle is the inverse trap: it bundles retail commercial art and audio in the repo and flags it do not redistribute.
- Open is not CC0: OpenGFX, Unknown Horizons art, and Augustus `res/assets` are all genuinely open and still share alike or copyleft. This is the exact hazard Project Studio's provenance discipline exists to catch, and Project Studio's original or CC0 plus per asset evidence convention is stricter and safer than every art license in this corpus.

### What is actually worth building (the clean room shortlist)

Ranked by nearness to D1 and to the D1-A Studio Identity Package:

1. Prioritized attention resolution (CorsixTH 3.1): one deterministic `pickAttention(conditions[])` for the `AttentionState` union, with D2 states outranking D1 states so `decision-required` reservation is mechanical.
2. Layered building state art plus status icons plus reversible selection tint (Augustus 6.5, corroborated by Industry Idle 8.5): the compositing grammar for the D1-A Identity Package, each state readable by icon and shape with color removed.
3. Function pointer overlay abstraction with dim the rest plus banded tooltip (Augustus 6.2): the general form of snapshot fed building overlays, color plus height plus text, never color alone.
4. Deterministic brand recolour by palette or tint (OpenTTD 5.2): one placeholder art set, unlimited studio liveries, deterministic from the snapshot.
5. Manifest driven checksummed swappable art set (OpenTTD 5.1): the `.obg` lesson at small scale for `assets.ts` and D1-A, carrying per asset provenance and license, reinforcing the Asset Lab discipline.
6. Determinism verification helper (Egregoria 9.4): per subsystem state hash plus a and b JSON dump on divergence, backing the M0A byte identity work.
7. Reserved for when construction is authorized: build validity overlay plus confirm gating (CorsixTH 3.2, GDQuest 7.1, Augustus 6.3, OpenRCT2 1.4), footprint plus named anchors (CorsixTH 3.3), and interaction slots and routing (FreeSO 2.1, 2.2). Wall cutaway reveal on select (FreeSO 2.5) is reusable sooner since it is presentation only.

### What NOT to do

- Do not rewrite the D1 renderer. FreeSO's per pixel z buffer, OpenTTD's AABB topological sort, and Augustus's multi pass painter are all more machinery than D1's static grid corner `depthFor` needs, and IsoCity confirms the D1 math is already standard and correct. The escalation trigger is documented per repo (tall or moving overlapping sprites), not present today.
- Do not let the lot own or mutate state. IsoCity 10.4 (map is the model, hash is the save) and the GDQuest and Industry Idle placement paths (mutate on click) are the anti patterns the D1 navigation only contract exists to forbid.
- Do not import any repository art, and do not fold any GPL, AGPL, CC-BY-SA, or attribution ware asset (OpenGFX, Unknown Horizons, Augustus `res/assets`, Citybound Icons8) into `public/assets/studio`. Keep the stricter original or CC0 convention.

