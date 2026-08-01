# Project Studio: Art and Presentation Integration Blueprint

Read only open source art and presentation audit, translated into a specific integration blueprint for the Project Studio (Meridian Pictures) studio lot. Prepared 2026-08-01.

**This is a research deliverable. No production code, asset, or repository was modified to produce it.** No implementation was performed, no repository art was imported, and no Project Studio production repository was changed. The one write is these research documents, on a dedicated, unmerged Asset Lab branch (`art-research-open-source-integration-blueprint`), which is within the Asset Lab charter (an isolated documentation bearing R&D sandbox, read only toward the main sim, the frozen lot spike, and the frozen 3D spike).

**Verified project state at audit time.** Production repo `/Users/bruce/The Movies`: branch `gate-d-studio-lot-d1`, HEAD `889ae0e`; `main` HEAD `e8c5696`; tag `gate-d1-studio-lot-foundation` at `c20a52f`; working tree clean. Asset Lab `/Users/bruce/Project Studio - Asset Lab`: branch `asset-lab-05h-authored-base-character-proof`, HEAD `9e3c5d7`. Studio Lot Spike `3806ef6` (frozen). 3D Visual Spike `591f3aa` (frozen, Gate C PASS).

**How this was produced.** Eleven open source simulation and construction games were inspected read only (OpenRCT2, FreeSO, CorsixTH, Unknown Horizons, OpenTTD/OpenGFX, Augustus, IsoCity, GDQuest godot-2d-builder, Industry Idle, Egregoria, Citybound). Each was shallow cloned or fetched so that license and file path claims are grounded in observed evidence, not recollection; an adversarial verification pass independently re-checked every license classification and cited file path; and a fresh eyes critic pass reconciled the documents. Every recommendation is tied to the actual D1 architecture (`StudioLotSnapshot`, `studioLotSnapshot(state)`, `iso.ts` with `depthFor` and the `LAYER` map, the nine `BuildingId`s, the `AttentionState`/`StageState` unions, `sceneSeed`, `navigation.ts`, `StudioLotView`/`StudioLotScreen`).

**The five documents.** This blueprint (sections A, B, D, E, F, G, H, I, J, K, N, plus the rulings block below); the per repository deep audit (`OPEN-SOURCE-ART-AUDIT.md`); the repository matrix (`REPOSITORY-MATRIX.md`, section C); the legal and provenance report (`LICENSE-AND-PROVENANCE-MATRIX.md`, section L); and the one bounded experiment (`BOUNDED-ART-EXPERIMENT.md`, section M).

**Final verdict: CURRENT ARCHITECTURE VIABLE, with one genuinely open question resolved by a bounded comparison** (2D authored sprites versus Asset Lab 3D baked to sprites, for buildings only; see section E). The Phaser 2.5D fixed isometric lot is retained; no renderer rewrite is recommended; the first production art slice is the procedural D1-A Studio Identity proof.

---

# Rulings

The explicit rulings this audit was required to return (spec §9 and §7). Everything after this block is the supporting analysis.

## Project-Specific Rulings (spec §9)

### (a) Is the D1 current visual architecture viable?

VIABLE. Retain it as the functional foundation; do not rewrite. The `iso.ts` direct 2:1 transform (TILE_W=128, TILE_H=64, `gridToScreen`/`screenToGrid`) is the exact math that every mature open isometric sim independently converged on: OpenRCT2's `Translate3DTo2DWithZ` (the `>>1` is the same 2:1 vertical compression), FreeSO's `WorldCamera`, Augustus at 60x30, OpenTTD's `RemapCoords`, and IsoCity at the identical 128x64 constants. That is confirmation of a correct choice, not a compromise. The `depthFor(gx,gy,layerBias)=(gx+gy)*16+layerBias` single corner painter key is correct for D1's static, grid aligned, non overlapping buildings; IsoCity's naive nested loop sort is the concrete cautionary case proving why explicit per object depth (which we already have) beats implicit iteration. The `studioLotSnapshot(state)` one way selector boundary is validated by Egregoria (`&Simulation` immutable borrow), Citybound (sim actor to UI actor render info messaging) and IndustryIdle (`T.dots` sim truth versus optional culled sprite), and it is stricter than all of them because it is a narrow immutable DTO rather than a full state handle. Nothing in the corpus refutes the architecture.

### (b) Should Phaser remain the renderer for D1-A?

YES. No repo in the corpus supplies a legally usable, technically compatible reason to change engines. The more capable renderers are copyleft and cannot be lifted at all (OpenRCT2 GPL-3.0, Augustus AGPL-3.0, IndustryIdle GPL-3.0, Egregoria GPL-3.0, Citybound AGPL-3.0). The two most advanced are also deliberate technology mismatches: Egregoria is Rust plus wgpu 3D, Citybound is Rust actor procedural mesh. Phaser is already lazy loaded through dynamic `import()`, pausable via `pause()`/`resume()`, transparent canvas, low power preference. Keep Phaser for D1-A.

### (c) What MEASURED problem would justify a Three.js proof?

Only a reproduced depth or readability failure that the 2.5D painter provably cannot resolve, and even then a 3D engine is not the first remedy. The named escalation boundary for `depthFor` is moving crew or multi tile stage silhouettes that overlap ambiguously in screen space and mis sort (OpenRCT2 quadrant bounding box sort, OpenTTD 3D AABB topological sort, Augustus footprint versus top band split, FreeSO per pixel z buffer are all the references for that exact failure). The correct first response to a demonstrated mis sort is the Augustus footprint/top split or a bounding box overlap comparator inside Phaser, not a renderer change. A Three.js proof is justified only when both hold: a failing test case shows footprint/top plus bounding box sorting still mis orders content at the management camera, AND the owner authorizes a character or interior fidelity target that a baked 2.5D sprite pipeline provably cannot meet at management readability. The frozen 3D spike (`/Users/bruce/The Movies - 3D Visual Spike` @ 591f3aa, Gate C PASS) already exists as the hybrid reference for that day; do not stand up a new proof without a measured, reproduced sort failure first.

### (d) Should the D1-A Studio Identity Package remain the first production-art slice?

YES. Confirm it. It is the highest leverage, lowest risk slice because the seams already exist: `palette.ts` already bridges brass to product `--accent`, panel to `--bg-panel`, text to `--text`; `assets.ts` already reserves overlay slots for the studio name on the gate header beam and for film titles on the easel ("Studio-name text is added by the scene as an overlay"). OpenTTD's `.obg` manifest (checksum plus provenance plus swappable base set) and its recolour by palette remap branding (`base-0775-recolor.pnml`, one artwork to many liveries) are the pattern for swapping procedural placeholders for authored identity art without touching the snapshot contract or the sim. Augustus's layered base plus ON/OFF plus status icon building grammar is how a single silhouette carries state at a glance. Ship original or CC0 art only; OpenGFX is the worked example that "open" can still be copyleft (GPL-2.0), so a famous free art set is not automatically reusable. Keep D1-A first.

### (e) Should D1-B be a modular soundstage proof?

YES, as a parametric building composer proof, not a data driven parts kit. `assets.ts` already has the right modularity level: shared wall and window primitives plus three interchangeable roof types (flat, gable, barrel) across six composers, with each silhouette hand coded per composer. The soundstage is the correct target because stage-a and stage-b share the barrel vault hangar mass, are the most likely buildings to need multi tile footprint/top depth handling (Augustus), and are the first to exercise the filming/available/underDressed layered states. D1-B should therefore prove three things through the existing composer plus the D1-A manifest: authored soundstage art, the footprint versus top depth split for a multi tile mass, and the ON/OFF/filming state layering. Keep it composer level modular. The unknown-horizons declarative component composed building model is the future facilities reference, not D1-B scope.

### (f) Asset Lab architecture: reference-only, converted, partially-adapted, or rejected?

REFERENCE ONLY for the Phaser D1 lot. The ground truth is explicit that GLB assets do not belong in D1 merely because the pipeline works, and the Lab charter is read only toward the main sim and owns no simulation truth. FreeSO's layered outfit on a shared skeleton and its DGRP directional sprite tables corroborate the Lab's 65 joint skeleton plus reusable clips approach as a sound authoring strategy, but that is validation of the Lab, not a mandate to inject live GLBs into Phaser. The single adaptation path that could ever feed D1 is FreeSO style pre rendering: bake an authored model into a direction by state sprite table and feed that to the 2D iso renderer, which keeps the Phaser pipeline intact. That is a bounded future proof, not a present adaptation.

### (g) Where should 05H eventually be used?

In the future 3D or hybrid character track, and only after separate owner authorization for role wide propagation. 05H is the first CC0 derived asset (license evidence in `licenses/asset-lab-05h/`, a `studio_base` provenance prop on each asset), it proved an authored human base reads at management distance, but it is not production integrated and propagation is prohibited pending owner sign off. If crew fidelity is ever wanted on the Phaser lot, the bridge is pre rendered directional sprites baked from an 05H class model (the FreeSO DGRP pattern), never a live GLB. Ruling: 05H belongs in the hybrid presentation layer or as the source model for baked directional crew sprites, gated on owner authorization; it does not enter D1 as a live GLB.

### (h) Management-lot workers: Phaser sprites, pre-rendered directional sprites, live GLBs, abstract silhouettes, or bounded comparison?

For D1, D1-A and D1-B: Phaser sprites, kept strictly decorative and seed driven. Adopt the Augustus technique (direction and action sprite selection plus sub tile interpolation for smooth readable motion) but reject its ownership model: Augustus figures are simulation truth whose positions matter, whereas our crew must derive every position from `sceneSeed` and carry no field the snapshot did not provide (Citybound seeded procedural by id and IndustryIdle `T.dots` versus dot both confirm presentation illustrates truth, never manufactures it). For any increase in fidelity beyond flat Phaser sprites, ruling is BOUNDED COMPARISON: pre rendered directional sprites baked from authored models (FreeSO DGRP) versus current Phaser procedural sprites versus abstract silhouettes, judged at the fixed management camera for readability and per frame cost. Live GLBs in the Phaser D1 lot are rejected (ground truth warning plus the determinism and browser performance constraints). Net: Phaser sprites now; the named bounded comparison before any fidelity step up; never live GLBs in D1.

### (i) What interaction-anchor proof first?

A pure read only `resolveAnchors(building, gridPose)` helper over `iso.ts` that resolves data declared, per building named anchors (where crew stand, where a vignette plays) to screen positions, deterministic for a fixed `sceneSeed`, carrying no engine truth. This mirrors the existing `BUILDING_LABELS`/`BUILDING_BLURBS`/`BUILDING_ACTION` data maps and feeds `onCharacter`/`onActivity` in `StudioLotView`. The references are CorsixTH's declarative object footprint plus named anchors (`use_position`, `slave_position`) and FreeSO's SLOT model (proximity and facing), but the FIRST proof is only the resolver, not routing: unit test that anchors resolve to expected screen positions for a given placement and are byte identical across two seeded runs. Defer the FreeSO routing to slot scorer; that is pure sim core work for a future character activity feature and must live in `src/core`, not the renderer.

### (j) What visual contracts to add after StudioLotSnapshot?

Add nothing to the snapshot itself yet; it is correctly narrow and immutable (Citybound and Egregoria validate keeping it a leaf type). Add two contracts that consume only existing fields, plus one deferred snapshot fact gated on future features:

1. A selector side AttentionState priority ladder: a pure `pickAttention(conditions[])` that collapses multiple simultaneously true building conditions into the single state the selector emits, with `decision-required` mechanically reserved above the D1 states so the D1 selector never emits it. Grounded in CorsixTH mood priority resolution and Augustus overlay resolution.
2. A renderer side overlay descriptor (Augustus function pointer overlay, generalized): each lot overlay (standing, cash pressure, stage occupancy) is one descriptor of show plus band or height plus tooltip, fed only by existing snapshot fields, dimming non focus buildings and pairing colour with height and text, never colour alone (IndustryIdle status icon nodes confirm the render side of this rule; unknown-horizons threshold table confirms the band mapping framing already used by `cashBand` and `standing`).
3. Only when construction/expansion or production flow is authorized: add display only snapshot facts (a candidate footprint plus per cell `valid[]` plus a `canBuild` boolean, the CorsixTH and OpenRCT2 pattern; or a production flow token descriptor, the IndustryIdle `T.dots` pattern). Until authorized, do not widen the contract.

### (k) What to build now versus what must explicitly wait?

Recommended as the immediate next work, all presentation only, original or CC0 art only, no snapshot widening, no GameState mutation. This audit itself implements none of it. Each item below is a recommendation whose execution is owner gated (Section N), lands behind the default OFF flag, and passes the experiment review gate before anything merges:
- D1-A Studio Identity Visual Proof, the recommended first slice and the single bounded experiment (`BOUNDED-ART-EXPERIMENT.md`): a fully procedural pass that treats the gate wordmark, adds a procedural crest, brands the water tower, and proves a single source brand recolour of signage and premiere dressing. It imports no art and changes no contract. The checksummed, provenance carrying art manifest keyed by BuildingId (atlas region, sha256, license, source), the OpenTTD `.obg` lesson, is the step it sets up but does not take: authored art intake is a later, separately owner authorized slice.
- The AttentionState priority ladder helper and the overlay descriptor pattern for the states the D1 selector already grounds.
- The read only `resolveAnchors` interaction anchor helper.
- `iso.ts` round trip property test (`screenToGrid` of `gridToScreen` equals identity) and a two overlapping sprite depth test that documents the `depthFor` escalation boundary.
- A clean room determinism helper (per subsystem state hash plus an a/b JSON dump on divergence, the Egregoria `hashes()`/`is_equal()` idea) supporting the M0A byte identity work.
- The D1-B footprint versus top depth split proof for the multi tile soundstage.

Must wait for explicit owner authorization (contract non goals or reserved states):
- Construction, placement, build mode and ghost preview (OpenRCT2 VirtualFloor, CorsixTH build validity, Augustus tri state ghost, GDQuest cursor ghost). Section 11 non goal.
- `decision-required` emission and any per production decision UI (D2).
- Live GLB characters, 05H role wide propagation, or any crew fidelity increase (owner authorization plus the bounded comparison first).
- Wall cutaway reveal interior on select (FreeSO Blueprint.Cutaway). D2 building inspection.
- Production flow tokens and supply chain overlays (IndustryIdle). D2 or later.
- Any Three.js proof (needs a measured, reproduced sort failure first).
- Data driven building parts kit, per tier upgrade system, or era skins (unknown-horizons). Future facilities and eras non goal.
- Authored (non procedural) art intake, and any `StudioLotSnapshot` widening such as a per studio brand colour or name field: both are owner and joint (Art plus Engine) gated per Section N. The D1-A procedural proof deliberately needs neither.
- Any renderer rewrite. No.

## Audit-Question Rulings (spec §7 A-J)

**A. D1 viability.** VIABLE, retain, no rewrite. The `iso.ts` 2:1 transform, the `depthFor` painter key, and the one way `StudioLotSnapshot` boundary are each independently corroborated by every mature open iso sim in the corpus (OpenRCT2, FreeSO, Augustus, IsoCity, OpenTTD), and our snapshot boundary is stricter than Egregoria's or Citybound's full state borrow.

**B. Production art direction.** D1-A Studio Identity Package first, delivered as an OpenTTD style checksummed provenance art manifest plus palette recolour branding, using original or CC0 art only (the OpenGFX "open is still copyleft" lesson), with building readability built on the Augustus layered base plus ON/OFF plus status icon grammar.

**C. Character tiers.** Tier the crew by distance. D1 management distance equals decorative Phaser sprites driven by `sceneSeed`; any higher fidelity, if authorized, equals pre rendered directional sprites baked from authored or 05H class models (FreeSO DGRP), not live GLBs in Phaser; live GLB and 05H stay in the 3D hybrid track. Choose the fidelity step by a bounded comparison of baked directional versus procedural versus silhouette at management readability.

**D. Interaction anchors.** Declare per building named anchors as data and resolve them read only through `iso.ts` (`resolveAnchors`), deterministic from `sceneSeed`, carrying no engine truth (CorsixTH declarative anchors plus FreeSO SLOT model). Defer routing to slot to future sim core character activity.

**E. Visual-state contracts.** Keep the snapshot narrow; add a selector side AttentionState priority resolution ladder (CorsixTH mood) and a renderer side overlay descriptor pattern (Augustus function pointer overlay), both pairing colour with icon, shape and text and never colour alone (IndustryIdle status nodes). The unknown-horizons threshold table confirms the existing `cashBand` and `standing` band framing.

**F. Modular buildings and sets.** Keep the parametric building composer modularity already in `assets.ts` (shared walls and windows plus three roof primitives across six composers); do not build a data driven parts kit yet. The D1-B soundstage proof exercises the composer plus the multi tile footprint/top depth split (Augustus). The unknown-horizons data driven kit is a future facilities reference only.

**G. Era compatibility seams.** Reserve, do not build. The references exist (OpenTTD Action 5 whole category sprite override and the `.obg` swappable base set, unknown-horizons per tier `name` and `actionsets` maps), but eras are an explicit contract non goal. Design the D1-A art manifest so a future era or tier key could select an alternate atlas without touching the snapshot or the sim, and scaffold nothing further.

**H. Lot readability placement.** Placement is authored and correct as is; reinforce it with a salience discipline rather than moving buildings. At the fixed management camera, buildings and attention markers must stay salient over ambient crew and prop noise; adopt the dim the non focus and never colour alone grammar (OpenTTD and OpenRCT2 zoom LOD salience, Augustus greyscale the rest, IndustryIdle cull and pool). Camera presets already cover overview, production, wide, entrance and theater. Add a density and salience budget test; change no placement.

**I. Visual debugging.** Build a small internal, dev flag gated inspector, not a shipped HUD. Extend the existing programmatic surface (`getDebugState`, `firstInspectableScreen`, `forceVignette`/`seekVignette`) and add an optional overlay layer that tints cells or depth from snapshot fields only, gated like `studioLotOverviewEnabled` and never shipped (CorsixTH `map_overlay` and packed flag pattern, IndustryIdle `getDebugState`, CorsixTH AnimView as the separate binary model). If vignette work continues, surface `director.debug()` through `StudioLotView`, which today it does not.

**J. Asset pipeline.** Adopt the manifest driven, checksummed, provenance carrying, swappable base set (OpenTTD `.obg`) as the D1-A pipeline: every asset carries license, source and hash, mirroring `licenses/asset-lab-05h/` and the `studio_base` prop and the Lab provenance classes (CC0, ATTRIBUTION-REQUIRED, PROTOTYPE-ONLY, LICENSE-UNCLEAR, DO-NOT-USE). Keep the governing rule that a free download is not a known production license, classify GPL, AGPL and CC-BY-SA art as non adoptable for a closed product (OpenGFX, Augustus `res/assets`, unknown-horizons and Citybound are all copyleft or share alike), ship original or CC0 only, and fail loudly on a checksum mismatch at load.

---

# Blueprint sections A through N

## A. Executive conclusion

### Most useful repositories, ranked for Project Studio

Every repository in the corpus lands at `STUDY_ONLY` at the repo level. Not one is a code donor and not one is an art donor. The value is pattern study plus clean room reimplementation of authorized features only. The ranking below weighs how directly a repo serves Project Studio's actual near term work (the D1-A Studio Identity Package, the `StudioLotSnapshot` selector, the fixed isometric lot) and how clean its license posture is for a small team that must never contaminate a closed product.

| Rank | Repository | Code license (verified) | Provenance risk | Disposition | Primary value to Project Studio |
|---|---|---|---|---|---|
| 1 | CorsixTH | MIT | LOW | Study | Prioritized status icon (mood) resolution is the single best reference for how the selector should emit one `AttentionState`; per cell build validity overlay; declarative footprint plus named anchors. Cleanest license of the readability references. |
| 2 | OpenTTD + OpenGFX | GPL-2.0-only (both) | LOW | Study | Manifest driven, checksummed, provenance carrying swappable base set (directly serves D1-A); palette remap branding; the "open art is still copyleft" cautionary lesson. |
| 3 | Augustus | AGPL-3.0-only | HIGH | Study | Function pointer overlay abstraction plus service coverage overlay (strongest overlay pattern); footprint vs top depth split (the lightweight escalation for multi tile stages). |
| 4 | OpenRCT2 | GPL-3.0-or-later | LOW | Study | Validates our exact 2:1 integer transform; cleanest legal precedent for the code and art separation we already practice; the escalation designs for depth sort and pixel accurate picking. |
| 5 | FreeSO | MPL-2.0 | HIGH | Study | Interaction slots and routing to slot, containment anchors, wall cutaway interior reveal, layered outfits on a shared skeleton (all future character activity). Carries a confirmed Nintendo IP red flag (`Mario.dll` plus SM64 code) to stay clear of. |
| 6 | IndustryIdle | GPL-3.0-only | HIGH | Study | Throughput visualization decoupled from sim truth (sim owns delivery, sprite is optional and culled); selection driven supply chain overlay. For future production flow. |
| 7 | Egregoria | Predominantly GPL-3.0 (two util crates MIT/Apache) | LOW | Study | Determinism verification tooling (per subsystem state hashing plus a/b JSON diff dump, serialized seeded RNG) that parallels the M0A byte identity work. |
| 8 | unknown-horizons | GPL-2.0-or-later; art CC-BY-SA-3.0 | LOW | Study | Declarative component composed building definitions and per tier name/visual/upgrade cost as data. A schema reference for future facilities. |
| 9 | GDQuest godot-2d-builder | MIT (+ OFL font) | LOW | Study | Construction ghost pattern, with the explicit warning that its white/red validity tint is colour alone and violates our contract. |
| 10 | IsoCity | MIT (art likely CC0, unconfirmed in repo) | LOW | Study | Confirms our iso math against a second independent implementation; its implicit iteration sort and renderer owned mutable map are the anti patterns we deliberately avoid. |
| 11 | Citybound | AGPL-3.0 | MEDIUM | Study | Corroborates our sim actor to UI actor render info boundary and our single named render order table. Dormant. Bundles third party Icons8 art and OFL Inter fonts, not project original. |

This repo level 1 to 11 ranking is canonical and is mirrored by the priority order list in `REPOSITORY-MATRIX.md`. Two column notes prevent confusion with that file. The per row Priority column in the matrix is a coarse 1 to 5 relevance tier assigned per repository, a blunter metric than this ordered ranking, so several repos share a tier there while holding distinct ranks here. And the Provenance risk column above (does the project depend on or bundle retail or commercial game assets) is a different axis from the matrix License risk column (would the code or art license contaminate a closed product), which is why a repository can read one level here and another in the matrix. Citybound is the clearest case: MEDIUM provenance risk above (it bundles third party Icons8 art and OFL fonts rather than depending on a retail data set) but HIGH license risk in the matrix because the engine is AGPL, a copyleft that a closed product cannot absorb.

### Lessons that apply now

- Our isometric transform is correct and standard. OpenRCT2's `Translate3DTo2DWithZ` is the same integer 2:1 projection with an analytic inverse, and IsoCity independently ships the identical 128x64 closed form transform. Our `iso.ts` needs no change. This is validation of an existing choice, not new code.
- Our explicit depth model is the right call and IsoCity proves why. IsoCity's implicit row major iteration only sorts correctly because it has a full rectangular grid with no free moving objects. We have `sceneSeed` driven ambient crew at sub cell positions and buildings of differing height, exactly the case that breaks implicit iteration. `depthFor(gx,gy,layerBias) = (gx+gy)*16 + layerBias` over the `LAYER` bands is necessary, not optional.
- The single front corner painter key is correct for D1 now. OpenRCT2, OpenTTD, Augustus, and FreeSO all run heavier bounding box or z buffer sorts, but every one of them does so for dense mutually overlapping or per pixel intersecting content. For D1's static, grid aligned, non overlapping buildings the simple key is the appropriate choice. Do not adopt a heavier sort now.
- "Never colour alone" is corroborated everywhere it matters. CorsixTH mood icons, Augustus column plus banded tooltip, and IndustryIdle discrete glyph nodes all pair colour with shape and text. Our companion navigation already does icon plus word plus text through `ATTENTION_META`. GDQuest's colour only ghost is the counter example to avoid.
- License discipline is the load bearing constraint. Nothing may be copied. OpenRCT2, Augustus, IndustryIdle, Egregoria, Citybound, unknown horizons, and OpenTTD are copyleft (GPL or AGPL), and "free open art" is not exempt: OpenGFX is GPL, Augustus and unknown horizons art is CC BY SA share alike, Citybound bundles third party Icons8 assets. Only the MIT repos (CorsixTH, IsoCity, GDQuest) and MPL FreeSO permit reuse in principle, yet the disposition is still clean room reimplement. This is the exact rule the Asset Lab provenance policy already encodes: a free download is not a known production license.
- The core sim and render separation is validated at scale, and ours is stricter than all of them. Egregoria hands its renderer the whole `&Simulation`; Citybound and IndustryIdle pass render info messages; unknown horizons reads component state. Project Studio's narrow, immutable `StudioLotSnapshot` at the `studioLotSnapshot(state)` boundary is a tighter contract than any of them. Keep it.

### Lessons that apply later (contract section 11 deferred systems)

- Construction and placement preview: OpenRCT2 ghost plus VirtualFloor edge overlay, CorsixTH per cell green/red validity plus confirm gating, Augustus tri state ghost plus consequence preview, GDQuest cursor follow ghost. Clean room only when construction is authorized, rendered from snapshot display facts with zero `GameState` mutation, colour paired with icon and text.
- Character activity on the lot: FreeSO interaction slots and routing to slot, Augustus grid linked walkers with sub tile interpolation, CorsixTH declarative named anchors. Keep crew decorative and `sceneSeed` derived, the inverse of FreeSO and Augustus where figures are simulation truth.
- Interior reveal on select: FreeSO wall cutaway room visibility, keyed off `selectedBuildingId`, presentation only.
- Production flow visualization: IndustryIdle throughput dots and supply chain overlay, illustrate only.
- Facilities data model and tiers: unknown horizons declarative building definitions and the "highest tier at or below level" label selection discipline, for the reserved `StageState` and `AttentionState` labels.
- Overlay abstraction and determinism tooling: Augustus function pointer overlay for D2 overlays, Egregoria hashing helper for byte identity work, CorsixTH AnimView as the argument for a small internal asset inspector.

### Viability of the current architecture

Strongly viable, and the corpus is the evidence. Every mature simulation studied converged on the same authoritative state plus read only renderer discipline that D1 already enforces, and Project Studio's version is stricter than the shipping references. The direct 2:1 transform in `iso.ts` is independently used by the best isometric management reference in the set (OpenRCT2) and by the closest structural analogue (IsoCity). The `depthFor` plus `LAYER` model is correct for current content. No repository is grounds for a renderer rewrite, a conclusion the adversarial verdicts reached for all eleven. The Phaser, React, 2.5D placeholder art stack is a deliberate fit; the 3D and native engines (Egregoria, Citybound, FreeSO 3D mode) are explicitly not donors.

### Smallest useful next experiment

Run the D1-A Studio Identity Visual Proof set out in `BOUNDED-ART-EXPERIMENT.md`: a fully procedural pass that gives the Studio Gate (`gate`, whose name and logo surface is today a blank overlay slot per `assets.ts:501-503`) a treated wordmark and a procedural crest, brands the water tower landmark, and proves a single source brand recolour of signage and premiere dressing, all behind the existing `studioLotOverviewEnabled()` flag, with zero image imports, zero asset intake, and zero change to `StudioLotSnapshot`, `iso.ts`, or the sim. It is the smallest slice that advances the named first art integration (D1-A) while holding license risk at exactly zero, because it imports no art at all. The checksummed, provenance carrying art manifest (`BuildingId` to atlas region plus `sha256` plus `license` plus `source`, the OpenTTD `.obg` lesson, with a checksum mismatch failing loudly at load) is the step this sets up but does not take: it is the later, owner gated authored art slice, sequenced after the procedural proof and after the owner authorizes real asset intake. An even smaller pure logic option, if the team wants to harden the D1 to D2 boundary before touching identity art, is a `pickAttention(conditions[])` priority resolution helper in `adapter.ts` modeled on CorsixTH mood resolution, with D2 states ranked above D1 states so the "decision-required reserved for D2" rule becomes mechanical and unit tested.

### Explicit non-goals for this audit

- Read only research. No implementation, scaffolding, or integration code.
- Copy no code from any repository. All are copyleft or clean room only.
- Import no art. OpenGFX, Augustus, and unknown horizons art is copyleft; FreeSO and IndustryIdle art is proprietary; IsoCity and Citybound art is third party or unconfirmed.
- Recommend no renderer rewrite. The Phaser stack stands.
- Build no deferred system now: construction, character activity, production flow visualization, facilities, eras. These are section 11 decisions.
- Adopt no heavier depth sort now. The single corner key is correct for D1.
- Do not begin phase 5 or phase 6.

## B. Verified current Project Studio state

Production repository: `/Users/bruce/The Movies`, read only for this audit. Branch `gate-d-studio-lot-d1`, HEAD `889ae0e` ("Gate D1: record Studio Lot functional-foundation closure"). `main` HEAD `e8c5696` ("Merge Gate D1 Studio Lot functional foundation"). Tag `gate-d1-studio-lot-foundation` at `c20a52f`. Working tree clean.

### Sim core purity

The simulation core in `src/core/` is pure, `(state, actions) => state`, 44 TypeScript files, strict mode. No React, DOM, Phaser, async, or I/O below the harness boundary. Seeded RNG only; no `Math.random` anywhere. Presentation lives entirely under `ui/` (Vite 6, React 19.2, Phaser 3.90), with the D1 lot under `ui/src/lot/`.

### D1 architecture

`GameState` is authoritative and the renderer owns no simulation truth. The engine boundary selector `studioLotSnapshot(state): StudioLotSnapshot` lives at `ui/src/engine/adapter.ts:3682-3827`. It is pure, deterministic, non mutating, adds no randomness, and reads only through existing read models (`financeCard`, `findConcept`, `TUNING`); it touches a narrow slice of `GameState` and never inspects all of it. The single renderer facing contract is `ui/src/lot/snapshot/StudioLotSnapshot.ts` (207 lines), a framework neutral immutable leaf type that imports nothing and carries only display facts: `studioName`, `week`, `cash`, `cashBand`, `standing`, `standingValues`, `activeProductions`, `releasedFilms`, `releasePresence`, `latestReleaseTitle`, `buildings`, `selectedBuildingId`, and `sceneSeed`.

### Renderer

`ui/src/lot/scene/iso.ts` (50 lines) is a direct 2:1 isometric transform over a logical grid, chosen deliberately over Phaser's Tiled iso tilemap loader for full placement and z order control: `TILE_W=128`, `TILE_H=64`, `gridToScreen`/`screenToGrid` inverse pair, `depthFor(gx,gy,bias) = (gx+gy)*16 + bias`, and `LAYER = {ground:0, dressing:1, shadow:2, building:4, prop:6, overlay:10000}`. `ui/src/lot/scene/LotScene.ts` (1365 lines) is the Phaser scene, supported by `layout.ts` (272), `assets.ts` (838), `palette.ts` (167), and `vignettes.ts` (628). `ui/src/lot/StudioLotView.ts` (208) is the public embeddable surface: snapshot in, `onAction`/`onSelect`/`onCharacter`/`onActivity`/`onReady` out, with camera presets, `setReducedMotion`, `pause()`/`resume()` that sleeps the Phaser RAF loop entirely when hidden, and `getDebugState()`. Phaser is lazy loaded via dynamic `import()` so it never reaches the eager bundle. `ui/src/lot/StudioLotScreen.tsx` (285) is the React host that owns navigation, accessibility, and selection session state.

### Camera

Five presets, not three: `overview | production | wide | entrance | theater` (`LotScene.ts:78`, applied at `951-988`). `overview` fits the lot, `wide` fits at 0.72, `entrance` and `theater` and `production` frame the gate, theater, and stage district respectively, all zoom clamped. Continuous mouse wheel zoom preserves the world point under the cursor, clamped `ZOOM_MIN=0.32` to `ZOOM_MAX=1.9` (`LotScene.ts:46-47`). Pointer drag pan, WASD and arrow key pan, `R` resets, and the camera re fits on resize.

### Building representation

Nine buildings are hand placed in `layout.ts:76-162`: `admin`, `writers` (Development), `casting`, `stage-a`, `stage-b`, `post`, `theater`, `gate`, `expansion`. Footprints for the seven real buildings are pulled from baked texture metadata via `fp()` so placement and art never disagree; `gate` and `expansion` are the two hardcoded exceptions, and `expansion` has an empty `texKey` so it renders as a marked pad with no massing. A parametric framework in `assets.ts` (wall and window primitives plus three interchangeable roof types) is shared across six per building composer functions, each hand coding its distinguishing silhouette. `palette.ts` bridges the on canvas chrome to product design tokens (brass equals `--accent`, `labelBg` equals `--bg-panel`, `labelText` equals `--text`).

### Character representation

Thirteen ambient agents (10 workers, 3 vehicles) are built in `buildAgents()` (`LotScene.ts:534-648`) with seeded routes, speeds, and phases from `Rng(sceneSeed + ':agents')`. Workers are decorative, `sceneSeed` derived, and carry no engine meaning. A shared `figure()` silhouette is reused across worker variants. Visibility is gated (busy only agents hidden unless standing is established or prestige; stage crews hidden unless that stage is active). A ten sprite reusable vignette actor pool supports the deterministic `VignetteDirector`.

### Navigation

`ui/src/lot/navigation.ts` (68 lines) maps `LotActionKind` to `LotRoute` over existing app screens (`dashboard | roster | hiring | hub | assembly | saves | expansion-info`). No lot action spends money, advances time, greenlights, hires, or mutates `GameState`. Every lot destination is reachable without the lot via semantic React controls, and `expansion-info` is a bounded in lot informational placeholder.

### Visual states

The `AttentionState` union has eight members. The D1 selector emits only `warning`, `active`, `empty`, `recently-completed`, `future`, and `normal`, each grounded in real engine truth per building in `buildingState()` (`adapter.ts:3743-3804`). It never manufactures `decision-required` (reserved for D2) and in practice never emits `positive` (the theater release cue is `recently-completed`). `StageState` in D1 is `filming` for an occupied stage versus `available` as the absence of a card. Every attention state pairs colour with icon or shape and text through `ATTENTION_META` in the React host (`StudioLotScreen.tsx:40-49`); the canvas is `aria-hidden` and the semantic companion navigation is the accessible truth.

### Placeholders and art directories

All lot art is 100 percent procedurally drawn Phaser Graphics, baked once per object, with no imported sprite, texture, or GLB files (`assets.ts:1-8`). Ground is a single `RenderTexture` batch drawing 528 tiles rather than 528 sprites. Studio name and film title lettering are reserved overlay slots filled by `LotScene`, not baked (`assets.ts:501-503`, `691-692`), because Phaser Graphics cannot draw text. No Asset Lab GLB pipeline output is wired into the D1 lot.

### Tests and feature flag

`ui/src/lot/studio-lot-snapshot.test.ts` (14 tests, 232 lines) asserts determinism (same state and same seed yield byte identical snapshots), non mutation, SaveFileV4 round trip stability, and that the selector invents nothing (cash equals the authoritative read model, no production is ever `decision-required` in D1, the expansion pad carries only a `future` cue, release presence invents no theatrical payment data). `StudioLotScreen.test.tsx` covers host lifecycle with a mocked view (single renderer, pause on tab hidden, destroy on unmount, navigation emits routes only). `ui/e2e/lot.spec.ts` runs 13 Playwright journeys against real Phaser across five viewports plus 125 percent zoom, asserting zero page errors, clean teardown, reduced motion, and the flag off path. The feature flag `studioLotOverviewEnabled()` in `ui/src/flags.ts` defaults off (env `VITE_STUDIO_LOT_OVERVIEW` or localStorage key `project-studio.flags.studio-lot-overview`); when off there is no lot entry point, no Phaser fetch, and no renderer.

### Technical debt and limitations

- The Phaser scene does not consume the snapshot's attention fields. `applySnapshot()` never reads `BuildingState.attention`, `attentionReason`, or `underDressed`, nor `ProductionCard.stageState` or `attentionReason`. The scene derives its own visual states (availability tint, stage active/idle/closed, recording light) and the attention badges are rendered by the React companion navigation, not painted into the canvas. This is a deliberate split, but it means the attention vocabulary lives in two places.
- Several snapshot fields are unused by the scene: `week`, `cash`, `cashBand`, `standingValues`, `releasePresence`, `latestReleaseTitle` are surfaced by the React host, not the canvas.
- `sceneSeed` is consumed only at `create()` time. `applySnapshot()` does not re seed already built ambient elements, so a snapshot delivering a new `sceneSeed` to a live scene would not re randomize worker positions or prop jitter.
- No dedicated `vignettes.test.ts` exists; `forceVignette` and `seekVignette` are not exercised by the unit or e2e suites; `director.debug()` state is not surfaced through `StudioLotView.getDebugState()` (which exposes only `selected`, `activeTags`, `displayObjects`).
- The frame rate independence and animation disabled byte equality invariant, part of the stated determinism invariant, is not asserted in the five reviewed test files. If covered, it would be in `determinism.test.tsx`, which was not read in this audit.
- `BuildingState.available` is always `true` in D1, so the dimming and closed building semantics are contract defined but unused. `underDressed` is a studio wide flag driven only by struggling standing, not a per building signal. The `decision-required`, `positive`, `ready-for-release`, `completed`, and `idle` labels are reserved and unused.
- Identity name and logo geometry is unimplemented; the gate and title easels are blank slots. The water tower landmark is a generic silhouette by its own comment (`assets.ts:438`), not a branded landmark.
- Buildings are per function composers, not a data driven modular kit; adding a building means writing a new composer, not composing parts from data.
- A doc versus behaviour mismatch: the `AttentionState` union comment (`StudioLotSnapshot.ts:56`) groups `positive` with `recently-completed`, but the selector emits only `recently-completed` for the theater.

## C. Repository matrix

The full repository matrix (one row per pattern: Repository | Subsystem | Exact files | Pattern | Disposition | License risk | Project use | Priority) and the canonical repo ranking live in the sibling file **[REPOSITORY-MATRIX.md](./REPOSITORY-MATRIX.md)**, kept separate because it is a wide scannable table. The per repository deep audit (verified facts, located implementation, each pattern explained, disposition, and validation test) is in **[OPEN-SOURCE-ART-AUDIT.md](./OPEN-SOURCE-ART-AUDIT.md)**.

## D. Rendering architecture findings

Compared explicitly to `ui/src/lot/scene/iso.ts` (`TILE_W=128`, `TILE_H=64`, `depthFor = (gx+gy)*16 + layerBias`, the `LAYER` band map) and to `ui/src/lot/scene/LotScene.ts`.

### Coordinates and isometric projection

What we do well: the direct 2:1 transform in `iso.ts` with a `gridToScreen`/`screenToGrid` inverse pair, chosen over Phaser's Tiled loader for placement and z order control, is standard and correct. OpenRCT2's `Translate3DTo2DWithZ` (`src/openrct2/interface/Viewport.cpp`) is the identical integer projection with the `>>1` vertical compression and an analytic inverse; IsoCity ships the same 128x64 closed form transform with an algebraic inverse; FreeSO and Augustus use the same 2:1 family at different tile pixel sizes. The strongest isometric management reference in the corpus and the closest structural analogue both independently arrive at our exact math.

What the repos do better: Augustus (`src/city/view.c`) and IndustryIdle (`HexagonGrid.ts`) precompute every tile's screen anchor into a lookup table keyed by a canonical string, so per frame conversion is a hash read and picking is a parity test rather than arithmetic. We compute on the fly.

Worth adopting: nothing structural. At 24 by 22 (528 tiles) on the fly conversion is not a cost. Add a round trip property test `screenToGrid(gridToScreen(g)) === g` across the tile range if one is not already present; it is the cheap correctness guarantee that OpenRCT2, IsoCity, and IndustryIdle all imply. Only cache tile anchors if hit testing ever profiles hot, which it will not at this grid size.

### Depth sorting

What we do well: the single front corner painter key `depthFor = (gx+gy)*16 + layerBias` over `LAYER` bands is correct for D1's static, grid aligned, non overlapping buildings, and `LotScene` already re depths agents every frame (`LotScene.ts:1313`) and keys buildings on their far corner. IsoCity is the cautionary proof that this is the right minimum: its implicit row major iteration works only because it has a full rectangular grid and no free objects, exactly the assumptions we break with `sceneSeed` driven crew and variable height buildings, which is why we compute explicit depth rather than rely on iteration order.

What the repos do better at scale: OpenRCT2 runs a quadrant bucketed 3D axis aligned bounding box overlap sort with rotation specialized templates (`src/openrct2/paint/Paint.cpp`), OpenTTD runs a 3D AABB topological sort with an SSE4 fast path (`src/viewport_sprite_sorter.h`), FreeSO uses per pixel z buffer sprites, and Augustus splits each sprite into a flat footprint band and a raised top band and iterates row by row (`src/widget/city/draw.c`) so tall building tops and walkers composite correctly.

Worth adopting, only when a boundary is crossed: the moment tall sprites overlap in screen space or crew pass in front of and behind buildings, a single corner key can mis sort. The unanimous escalation is graduated. First reach for the Augustus footprint versus top split, which is far lighter than a full comparator and directly solves multi tile stages (`stage-a`, `stage-b`, `theater`, `admin`). Only if that is insufficient adopt an OpenRCT2 or OpenTTD style AABB overlap comparator. Trigger it with a demonstrated failure, not preemptively: place a crew sprite that walks from behind to in front of a soundstage corner and assert `depthFor` already orders it correctly at every position. Do nothing until that test fails.

### Entity layering

What we do well: the `LAYER` map in `iso.ts` is the exact pattern Citybound validates. Citybound's `renderOrder.js` is a single central integer z order table (ground through building through interactables through cars), the sibling of our named `LAYER` bands, and confirms that one authoritative table beats depths inlined at call sites.

What the repos do better: nothing structurally. GDQuest's two tilemap plus YSort layout (ground map authorizes placement, entity map occupies, a flat layer walks under) is a clean decomposition, and IsoCity's two canvas split keeps transient hover off the committed scene.

Worth adopting: hold the principle, not new structure. Keep hover and selection feedback on `LAYER.overlay` and never repaint the committed building and prop layers to show feedback (IsoCity). Verify our hover path touches only the overlay, which is an O(1) check. For a future construction feature the GDQuest ground authorizes placement split maps to a distinct buildable plot layer beneath the building band.

### Camera

What we do well: our camera is already richer than most of the corpus. Five presets, continuous zoom with zoom to cursor, drag plus keyboard pan, and reset exceed FreeSO's three discrete zooms, OpenRCT2's fixed steps, and Augustus's four orientations.

Worth adopting: nothing now. If four way rotation is ever wanted, OpenRCT2 (`Viewport.cpp`) demonstrates it is a pure renderer concern implemented with integer coordinate rotation and a per rotation analytic inverse, so it would leave the `StudioLotSnapshot` contract untouched. That is a future nicety, not a need.

### Zoom

What we do well: `LotScene` already implements semantic zoom band LOD (three bands: compact pill, full card, hidden) recomputed only on band change (`LotScene.ts:1324-1334`), plus character inspection gated at zoom 0.55 and higher. This is exactly the OpenTTD detail threshold principle (`src/zoom_type.h` ties a zoom enum to LOD thresholds) applied to a fixed management readability camera.

What the repos do better: OpenTTD and OpenRCT2 add a per object salience opt in (`isVisibleWhenZoomed`), dense entity culling (skip entities above a zoom), and sub pixel snapping to stop shimmer.

Worth adopting as content grows: two readability hardening ideas, not new mechanisms. Define an ambient density budget so `LotScene` never exceeds a maximum ambient sprite count for any `sceneSeed`, and cull off screen ambient updates (our `busyOnly` and `stageGate` gating already does part of this). And guarantee salience: any building with `attention` other than `normal` stays visually distinct at maximum ambient density, the `isVisibleWhenZoomed` analogue. No geometric or asset LOD is needed at a fixed management distance and we correctly have none.

### Anchoring (interaction anchors)

What we do well: `layout.ts` already encodes per stage anchor points (`STAGE_APRONS`: door, gear, crew, park) used for production dressing, and vignette actors sit at authored constants.

What the repos do better: CorsixTH (`Lua/objects/reception_desk.lua`, `Lua/entities/object.lua`) declares every object's footprint and named interaction anchors (`use_position`, `slave_position`, `handyman_position`) as data resolved to world tiles, rather than as magic pixel offsets in rendering code. FreeSO's `VMSlotParser` scores stand and sit positions by proximity band and facing then routes to the best, and Augustus interpolates walkers at 15 sub tile resolution.

Worth adopting now, in a bounded way: extend the existing `BUILDING_LABELS`, `BUILDING_BLURBS`, and `BUILDING_ACTION` maps with per building interaction anchors expressed as data and resolved through `iso.ts`, so deterministic vignette and crew placement stops using hard coded offsets inside `LotScene`. Keep the resolution in the renderer as display only, seeded from `sceneSeed`, leaking no simulation truth. FreeSO's scored slot routing and containment anchors are a later reference for character activity, where the invariant is inverted from FreeSO: our crew stays decorative, and any anchor that ever affects the sim must live in `src/core` and surface through the snapshot, never be re derived in Phaser from `GameState`.

### Selection

What we do well: selection is ID only session state. `StudioLotScreen.tsx` holds `sessionSelectedBuilding` outside `GameState` and `SaveFileV4`, `onReady` reconciles it, and the highlight is a footprint diamond outline (`refreshHighlights`, `LotScene.ts:1023-1033`) paired with a hover lift and a label. This is precisely the Egregoria and Citybound pattern where the UI stores only an entity ID and revalidates it against sim truth each frame (`native_app/src/gui/tools/selectable.rs` clears the selection when `!world().contains(e)`).

What the repos do better: OpenRCT2 achieves pixel perfect, occlusion correct picking by re running the paint pipeline into a 1 by 1 target (`GetMapCoordinatesFromPosWindow`). We get render and pick parity for free from Phaser interactive display objects, provided the interactive objects are the exact objects we draw in the same depth order.

Worth adopting: two verification tests, no new mechanism. First, confirm a click in an overlap region resolves to the front object (crew over building), that is, Phaser input depth equals draw depth; if it ever does not, raise the crew's input priority rather than adopting a re paint. Second, apply the Egregoria reconciliation explicitly: when a selected entity leaves the snapshot (a production completes and its card leaves `activeProductions`), assert `StudioLotScreen` clears the stale selection rather than rendering dangling state.

### Construction previews

What we have: none, correctly. The `expansion` pad renders as a static dashed footprint plus a "FOR EXPANSION" stake with a bounded `expansion-info` panel, and there is no ghost, placement mode, or build validation. Construction is a section 11 non goal and `decision-required` is reserved for D2.

What the repos do, all clean room only when authorized: OpenRCT2 renders a ghost as a real tile element through the same paint pipeline (so art and depth are automatically correct) plus a VirtualFloor neighbour difference edge overlay that draws only information bearing edges and culls dull internal ones (`src/openrct2/paint/VirtualFloor.cpp`). CorsixTH draws a per cell green and red validity overlay in a dedicated UI tile layer and gates the confirm button so an invalid placement cannot commit (`Lua/dialogs/edit_room.lua`, `Src/th_lua_map.cpp`). Augustus renders a tri state ghost (allowed, discouraged, forbidden) plus a consequence preview (`src/widget/city/building_ghost.c`). GDQuest's cursor follow ghost tints white or red, which is colour alone and violates our contract.

The recipe for later: compute validity in a pure `canPlace(state, footprint)` selector in `src/core` returning `{perCell, valid}`, surface it as display facts on the snapshot, render the prospective building through the existing `LotScene` tinted by that boolean and sorted by `depthFor`, and gate confirmation in a semantic React control so the lot stays navigation only per `navigation.ts`. Replace GDQuest's colour only signal with colour plus icon plus text. The `expansion` `BuildingId`, `underDressed`, and the `future` and `warning` attention states already reserve this vocabulary.

### Overlays

What we have: no snapshot driven overlay layer in the Phaser scene. Attention is conveyed by the React companion navigation, and the only in scene marker is the director driven vignette activity marker, not a snapshot attention badge.

What the repos do better, the strongest actionable rendering pattern in the corpus: Augustus uses a function pointer overlay abstraction (`src/widget/city/overlay/overlay.h`) where each overlay is a uniform descriptor (`show_building`, `get_column_height`, `get_tooltip`, `draw_layer`, `column_color`) that dims non relevant buildings, draws a banded column, and maps a 0 to 100 value into qualitative banded tooltip text. CorsixTH's prioritized mood resolution collapses many simultaneous conditions into one deterministic icon via an explicit priority ladder (`Lua/entities/humanoid.lua`). IndustryIdle draws per building status as discrete glyph nodes and a selection driven supply chain overlay (`DrawLines.ts`) in a single `Graphics` with dedup and zoom normalized stroke width.

Worth adopting: two items, one now and one later. Now, a pure `pickAttention(conditions[])` priority resolution helper in `adapter.ts` modeled on CorsixTH mood resolution, ranking D2 states above D1 states so "decision-required reserved for D2" is enforced mechanically and unit tested; this is pure logic with no rendering and hardens the exact D1 to D2 boundary the selector already respects. Later, for D2 overlays (standing, cash pressure, stage load), adopt the Augustus function pointer descriptor shape fed only by `StudioLotSnapshot` fields, dim the rest plus a banded indicator plus a qualitative tooltip, colour paired with height and text; and the IndustryIdle `DrawLines` model for a select a stage relationship highlight rendered in one Phaser `Graphics` on `LAYER.overlay`, read only. Both illustrate only, neither mutates `GameState`, both align with the never colour alone rule.

### Debug mode

What we have: programmatic introspection only. `StudioLotView.getDebugState()` returns `{selected, activeTags, displayObjects}`, `firstInspectableScreen()` projects the first inspectable for Playwright, and `forceVignette`/`seekVignette` plus `director.debug()` exist internally. There is no rendered HUD, no grid, depth, or hitbox overlay, no FPS counter, and `director.debug()` is not surfaced through the view boundary.

What the repos do better: OpenRCT2 has a `gPaintBoundingBoxes` flag that renders all eight bounding box corners for visual depth debugging. CorsixTH ships homemade MIT `flag_*.bmp` overlays that visualize any packed cell flag on grid, plus AnimView, a separate binary asset and animation inspector with frame stepping, mask toggle, coordinate overlay, and marker authoring, and an in game `sprite_viewer.lua` fallback. Egregoria's `hashes()` and `is_equal()` (`simulation/src/lib.rs`) write `{name}_a.json` and `{name}_b.json` on divergence so a human can diff exactly which subsystem drifted, with a serialized seeded RNG persisted in state.

Worth adopting, both gated behind the existing dev flag mechanism and both running only on original or CC0 assets: first, a rendered debug overlay layer (CorsixTH `map_overlay` plus OpenRCT2 bounding box) that tints cells, draws `depthFor` z order, and shows hitboxes over the lot purely from `StudioLotSnapshot` fields, surfacing `getDebugState` and `director.debug()` visually to catch mis placement and mis sort during development, never shipped to users. Second, a clean room determinism helper written from the described behaviour only (the Egregoria source is GPL) that snapshots two `GameState`s, hashes each subsystem, and on mismatch writes `a_` and `b_` JSON for diffing; this directly serves the M0A byte identity work, SaveFileV4 round trip, and the currently unasserted frame rate and animation disabled determinism invariant. CorsixTH's AnimView is the standing argument for a small internal asset and animation inspector for the Asset Lab GLB pipeline, kept out of the shipping build and run only on license clean art.

## E. Art direction evaluation

### The decision this section answers

D1 already ships a working renderer: a fixed 2:1 isometric Phaser scene (`ui/src/lot/scene/iso.ts`, `TILE_W=128`, `TILE_H=64`, painter depth `depthFor(gx,gy,bias)=(gx+gy)*16+bias`) drawing 100 percent procedural placeholder art baked from Phaser Graphics (`ui/src/lot/scene/assets.ts`, "no image files, no copied assets"). The art direction question is therefore not "what renderer" but "what art fills that renderer, and does the fixed iso surface remain the studio lot," reconciled against two standing facts: the frozen 3D spike (`/Users/bruce/The Movies - 3D Visual Spike`, Gate C PASS) whose memory carries a HYBRID presentation recommendation with Gate D authorized but HELD, and the Asset Lab pipeline that proved Blender to GLB to LOD to Three.js works but came with the explicit warning "Do NOT assume GLB assets belong in the Phaser D1 lot merely because the technical pipeline works."

### The four options

- Option A, authored 2D isometric sprites. Replace the procedural placeholders in `assets.ts` with hand drawn sprite atlases placed on the existing iso grid. This is the OpenTTD, FreeSO DGRP, Augustus, and IsoCity family: prebaked sprites in a 2:1 grid.
- Option B, 2.5D hybrid. Keep the fixed iso Phaser lot unchanged at runtime, but source its sprites by rendering the Asset Lab 3D models (buildings from the Lab 04 architectural reference, crew from the 05H base) to sprite atlases offline. Authored in 3D, presented in 2D. This is the FreeSO DGRP model (`tso.world/Utils/DGRPRenderer.cs`, a direction by zoom by rotation sprite lookup baked from meshes) and it is the concrete meaning of the spike's HYBRID recommendation.
- Option C, live low poly 3D lot. Replace the Phaser lot with the Three.js and R3F real time scene from the frozen spike. Live meshes, live lighting, live camera.
- Option D, mixed presentation. Deliberately different technology per surface: 2.5D lot for management, live 3D reserved for closeup and film playback, portraits for management UI.

### Scored against the criteria

Ratings read High or Strong as favorable; for Animation burden and Style cohesion risk, Low is favorable and is marked as such.

| Criterion | A: 2D sprites | B: 2.5D hybrid | C: Live 3D lot | D: Mixed |
|---|---|---|---|---|
| D1 fit (fixed iso Phaser) | Strong, drops into `iso.ts` placement unchanged | Strong, runtime identical to A, only authoring source differs | Poor, requires replacing the Phaser renderer, contradicts D1 reality | Partial, lot stays 2.5D but a second renderer appears |
| Visual clarity at management distance | Strong, full silhouette and lighting control | Strong, uniform baked lighting reads cleanly; Lab 04 stage and water tower silhouettes proven | Mixed, live lighting and camera can fight fixed readability without zoom LOD discipline | Strong per surface, weakest across surfaces |
| Character customization | Weak, every outfit and role is a separate sprite set (DGRP is combinatorial) | Medium to High, vary wardrobe on the shared 3D body then bake | High, live swap of bound meshes and accessories on the 65 joint rig | High, customization lives in the 3D tiers |
| Era support (out of scope now) | Weak, each era is a full redraw | Medium to High, reskin materials and re-bake (OpenTTD manifest base set, OpenGFX Action 5 category override) | High at runtime, still needs authored era assets | High |
| Animation burden (Low is good) | High burden, hand frames per action per direction | Medium, animate once on the shared rig, bake a minimal direction set | Medium to Low authoring reuse, but real time rig cost | Split, lot minimal and closeup rich |
| Building scalability | Medium, per building authored art (matches today's per building composers in `assets.ts`) | Medium to High, model once and bake; Lab 04 set already exists | Medium to High at runtime, same 3D source needed | Same as B for the lot |
| Browser performance | Best, static sprites, single render texture ground already | Best, runtime is sprites, baking is offline cost | Worst, live WebGL meshes plus LOD, shadows, culling, pooling on low end browsers | Mixed, lot cheap and closeup bounded |
| Two person feasibility | Medium, large manual sprite libraries | High, reuses the already built Blender to GLB to bake pipeline; runtime stays the simple lot | Low, maintaining or replacing a live 3D renderer alongside the sim is heavy (the spike is frozen and standalone for exactly this reason) | Medium, two stacks to keep |
| Maintenance | Medium, redraw on any change | Best, one 3D source of truth, re-bake propagates | Low, two renderers and a harder determinism story in live 3D | Medium to Low |
| Style cohesion risk (Low is good) | Medium, hand 2D against the current procedural look during transition | Low, baked art is internally consistent; only task is matching the dark product palette (`palette.ts` already bridges `--accent`, `--bg-panel`, `--text`) | Medium, a live 3D lot risks feeling like a different app than the dark executive UI | Highest, genuinely different media must be art directed into one product |

### Why the corpus points away from a live 3D lot now

Three independent lines of evidence say do not rebuild the renderer around live 3D at this stage. FreeSO's own architecture teaches that the per pixel z buffer 3D sophistication is only worth it with depth baked assets, and for placeholder and greybox art the grid corner painter is the correct simpler choice (`tso.world/Utils/WorldCamera.cs`, `_2DSpriteSorter.cs`). Egregoria (Rust and wgpu) and Citybound (procedural 3D mesh) are both flagged "not a renderer donor" and both are desktop or AGPL native stacks, not a browser management lot. And the ground truth itself forbids recommending a renderer rewrite because another repo looks more advanced. The frozen spike passed Gate C, but its own memory recommends HYBRID rather than a full 3D replacement, and Gate D is HELD.

### Provisional direction

Adopt Option B, the 2.5D hybrid, as the studio lot art direction. Keep the fixed iso Phaser scene as the authoritative management surface. Source its production art from the Asset Lab 3D pipeline, baked to sprite atlases offline, so `assets.ts` swaps procedural placeholders for authored art with zero change to `StudioLotSnapshot`, `iso.ts`, or the determinism invariant (which explicitly must hold across placeholder and final assets). This is the direction that reconciles every fixed point: it is literally the spike's HYBRID recommendation (2.5D lot as a branch of main, 3D reserved as a standalone copy), it honors the D1 fixed iso reality, it reuses the pipeline the two person team already built, and it keeps browser performance and byte identical determinism intact. Live 3D (Option C techniques) is not rejected as a technology, it is relocated to a bounded closeup and film playback surface (Tier 3 in Section I), which is currently out of scope, so no live 3D integration begins now and Gate D stays HELD.

Full mixed presentation (Option D) is where the product legitimately ends up long term: a 2.5D lot, a 3D closeup, and 2D portraits in the UI. The recommendation is to arrive there one bounded surface at a time rather than committing to three simultaneous media now, because adopting all of Option D at once maximizes the one risk the small team cannot easily buy back, style cohesion, before any surface but the lot is even authorized.

### The one bounded comparison test (the genuine remaining uncertainty)

The provisional direction fixes the renderer and the source pipeline. It does not settle whether the first production art slice should be authored as flat 2D iso sprites (Option A) or as Asset Lab 3D baked to sprites (Option B) for buildings specifically, because both feed the same Phaser runtime and the corpus does not decide it. Resolve that with a single bounded test on the recommended first slice, the D1-A Studio Identity Package:

Take one building, the Studio Gate (`gate`, which already reserves a scene drawn studio name overlay per `assets.ts` lines 501 to 503) or Stage A (`stage-a`), and produce it twice: once as a hand authored flat iso sprite, once as an Asset Lab GLB baked to an iso sprite atlas. Drop both behind `studioLotOverviewEnabled()` in `flags.ts` into `assets.ts`, render each beside the untouched procedural neighbors, and judge only three things: management distance readability, style cohesion with the dark product palette and the remaining procedural buildings, and two person production cost for one building. Whichever wins becomes the D1-A convention. This keeps the studio branding lesson from OpenTTD in reach either way: brand color as a palette index remap (`src/gfx_type.h` `SpriteType::Recolour`, OpenGFX `sprites/base/base-0775-recolor.pnml`) is the clean room technique that lets one baked building carry many liveries without art duplication regardless of A or B. Note the grounding limit, because it sets the scope of the recolour proof: D1 today has no per studio identity to key a livery on. `studioName` is the fixed product constant `STUDIO_LOT_BRAND = 'PROJECT: STUDIO'` (`adapter.ts:3625,3809`) and the snapshot carries no brand color at all, so a genuine multi studio recolour is a forward looking pattern that would require an owner and joint gated snapshot addition (Section N), not a capability current snapshot data supports. The bounded experiment therefore drives its recolour livery from a presentation side identity input rather than from the constant `studioName`, and treats real per studio identity as a deferred, separately authorized decision.

### Building state readability is orthogonal and already decided

Independent of A versus B, the readable studio identity must render building state as shape and icon, never color alone, which is already the `AttentionState` contract rule. The corpus gives the exact grammar to bake in: Augustus composites base plus an ON or active layer plus a status icon plus a reversible selection color mask (`src/widget/city/draw.c`), CorsixTH resolves many simultaneous conditions to a single highest priority icon (`Lua/entities/humanoid.lua`), and Industry Idle uses discrete icon nodes per state (`assets/Script/CoreGame/EntityVisual.ts`). The D1-A art set for each of the 9 buildings should therefore ship an available or filming or warning or underDressed layer vocabulary plus distinct status glyphs, so occupancy and attention read at a glance in either A or B.

---

## F. Visual-state contracts

Every shape below is a leaf type in the spirit of `ui/src/lot/snapshot/StudioLotSnapshot.ts`: narrow, immutable, framework neutral, imports nothing, and carries display facts only (bands, labels, fractions, booleans). None of them are owned by the renderer. Each is produced by a pure selector at the engine boundary alongside `studioLotSnapshot(state)` in `ui/src/engine/adapter.ts` (defined today at adapter.ts:3682), reuses the existing read models (`financeCard`, `findConcept`, `TUNING`), re-derives no formula, adds no RNG, mutates nothing, and never reads all of `GameState`. This is the same discipline Citybound reaches independently (sim actors emit compact `CarRenderInfo` to a UI actor that owns only a cache) and Egregoria enforces (the renderer takes an immutable borrow and caches render state by entity id), except our snapshot boundary is deliberately stricter than either: a narrow DTO, not a full-state borrow.

Four kinds of state run through these contracts, and the value of the contracts is that they keep the four from bleeding into each other:

| Tag | Kind | Home | Rule |
|---|---|---|---|
| `[A]` | Authoritative | `GameState` / `src/core` | Mutated only through typed actions (Egregoria `WorldCommand`, our `(state, actions) => state`). The renderer never reads it. |
| `[P]` | Presentation projection | selector output at `adapter.ts` | A display fact computed from `[A]`. This is what crosses the boundary. |
| `[C]` | Cosmetic | derived from `sceneSeed` (`= state.seed`) | Deterministic ambient variation with no engine meaning (Citybound `seed((lot_id, ident))`). No `Math.random`. |
| `[I]` | Intention | React host `StudioLotScreen.tsx` | UI session state (what the player is looking at or attempting). Never in `GameState`/`SaveFileV4`. Navigation only. |

The determinism invariant is what the tags protect: the same simulation must produce the same result headless, with the lot visible, with animations off, at any frame rate, on placeholder or final assets. `[P]` illustrates `[A]`; `[C]` is reproducible from the seed; `[I]` never influences `[A]`. IndustryIdle is the proof case worth copying in behaviour only (GPL-3.0, no code lifted): its in-transit resource is delivered by the sim on a timer whether or not any sprite ever exists, so the visual layer is fully optional and the headless result is byte identical.

Shared types below are either existing (`BuildingId`, `AttentionState`, `StageState` from `StudioLotSnapshot.ts`; `LotRoute` from `navigation.ts`) or proposed helpers (`GridCell = { readonly gx: number; readonly gy: number }` over the `iso.ts` grid; `BrandingRef`, `OutfitRef`, `AnchorId`, `DisplayBand`, `DeliveryToken`), noted where they first appear.

### F.1 FacilityVisualState

Extends today's `BuildingState`. The one hard rule it encodes is single-marker attention resolution: when a facility satisfies several conditions at once the selector must emit exactly one marker, chosen by a priority ladder. This is CorsixTH's mood system reimplemented clean room (MIT, safe to study): a registry of `(state, priority)` where the highest priority non-hover state wins, so you never render a cluster. Making D2-only states outrank D1 states makes the current `decision-required` reservation mechanical rather than a matter of discipline.

```ts
// proposed: ui/src/lot/snapshot/FacilityVisualState.ts (leaf, imports nothing)
export type FacilityTier = 'basic' | 'improved' | 'flagship';   // reserved; D1 selector emits 'basic'
export type EraTreatment = 'silent' | 'classical' | 'modern';    // reserved; D1 emits one fixed era

export interface FacilityVisualState {
  readonly id: BuildingId;              // [A] identity, from ALL_BUILDING_IDS
  readonly available: boolean;          // [P] projected; D1 always true
  readonly occupancy: StageState;       // [P] 'filming' when a card occupies, 'available' = absence of a card
  readonly attention: AttentionState;   // [P] ONE resolved marker, priority ladder, never a cluster
  readonly attentionReason?: string;    // [P] human sentence paired with the marker (never colour alone)
  readonly underDressed: boolean;       // [P] studio-wide 'plainer dressing' when standing === 'struggling'
  readonly tier: FacilityTier;          // [A]->[P] band of an authoritative facility level (reserved)
  readonly era: EraTreatment;           // [A]->[P] projected era treatment (reserved)
  readonly branding: BrandingRef;       // [P] recolour ramp id + wordmark slot to paint (see F shared types)
  readonly selected: boolean;           // [I] injected at the boundary by the host, not by the pure selector
  readonly sceneChannel: string;        // [C] seed channel for this facility's ambient dressing
}
```

Derivation: `available`, `occupancy`, `attention`, `underDressed` come straight from the existing `buildingState(id)` logic in `adapter.ts:3743` (warning from finance runway, active/empty from stage occupancy, `underDressed` from `standing === 'struggling'`). `tier`/`era` are `[A]->[P]` bands reserved for later and emitted as constants today, exactly as `StageState` reserves `ready-for-release`. `selected` follows D1's existing pattern where the selector writes `selectedBuildingId: null` and the host overrides it from `sessionSelectedBuilding`. The render-side counterpart is Augustus's layered ON/OFF plus status-icon compositing and IndustryIdle's discrete icon nodes (`ring`, `warning`, `noPower`, `underConstruction`): the selector picks the state, the renderer picks the matching glyph, and colour is never load bearing on its own.

### F.2 CharacterVisualState

Two populations share one shape: persistent named talent (projection of authoritative talent) and management-distance decorative crew (cosmetic, seeded). Keeping them in one contract with a `kind` discriminator prevents the renderer from ever caching a character record. Appearance is a small stable reference the sim owns and the renderer resolves to meshes or sprites, which is FreeSO's `VMOutfitReference` model and independently corroborates the Asset Lab 05x direction (one 65-joint skeleton, clips retargeted by bone name, variation by swapping bound parts).

```ts
export type CharacterKind = 'talent' | 'crew' | 'staff';
export type CharacterActivity = 'idle' | 'walking' | 'working' | 'reacting';

export interface CharacterVisualState {
  readonly id: string;                  // [A] talent: stable TalentId  |  [C] crew: seed-derived synthetic id
  readonly kind: CharacterKind;
  readonly displayName?: string;        // [P] named talent only; crew carry none
  readonly outfit: OutfitRef;           // [P] talent  |  [C] crew: seeded outfit; renderer resolves to parts
  readonly activity: CharacterActivity; // [P] talent tied to a task  |  [C] ambient crew from sceneSeed
  readonly atAnchor?: AnchorId;         // [P] named building/prop anchor the character occupies
  readonly attention?: AttentionState;  // [P] talent cue (e.g. 'decision-required' in D2); crew: none
  readonly sceneChannel: string;        // [C] seed channel for gait/phase/start position, no engine meaning
}
```

`OutfitRef` (proposed) is a small identity record (`{ role, skinToneId, accessoryIds }`) mirroring FreeSO `Outfit` plus `BoundAppearances`. The crucial contract point, and the one that keeps D1's determinism intact, is that ambient crew position and gait are `[C]`: derived from `sceneChannel` off `sceneSeed`, carrying no engine truth. Augustus's grid-linked walkers are the technique reference for smooth direction and sub-tile motion (AGPL-3.0, study only), but Augustus figures are simulation truth and ours deliberately are not.

### F.3 TaskVisualState

`ProductionCard` today already carries `title`, `genre`, `stageId`, `progress01`, `weeksRemaining`. `TaskVisualState` adds a coarse `phase` band so the vignette director and set dressing have a grounded cue instead of inventing one. This is unknown-horizons' production-state to action-name mapping (`idle`/`work`/`idle_full`) generalized, and it drives the existing four `MomentKind`s in `vignettes.ts`.

```ts
export type TaskStageId = 'stage-a' | 'stage-b';
export interface TaskVisualState {
  readonly id: string;              // [A] production id (ProductionCard.id)
  readonly title: string;           // [P] findConcept title fallback conceptId
  readonly genre: string;           // [P] title-cased display genre
  readonly stageId: TaskStageId;    // [P] presentation-only Stage A/B by activeProductions array order
  readonly progress01: number;      // [P] clamp((PRODUCTION_TICKS - remainingTicks) / PRODUCTION_TICKS)
  readonly weeksRemaining: number;  // [P] authoritative remainingTicks, echoed
  readonly phase: 'arrival' | 'preparation' | 'filming' | 'wrap';  // [P] coarse band -> vignette + dressing
  readonly attentionReason?: string;// [P]
}
```

`stageId` stays the documented presentation-only mapping from `adapter.ts:3614` (the D-12 engine has no `stage` field, `MAX_CONCURRENT_PRODUCTIONS = 2`, so array index selects the stage). `phase` is a band over `progress01`, not a new formula.

### F.4 InteractionVisualState

Pure player intention. It holds only ids and reconciles them against the current snapshot every frame, which is Egregoria's `InspectedEntity` reconciliation (`if !world.contains(e) { clear }`, study only, GPL-3.0). This is what guarantees a completed production cannot leave a dangling selection.

```ts
export type InteractionTarget =
  | { readonly kind: 'building'; readonly id: BuildingId }
  | { readonly kind: 'character'; readonly id: string }
  | { readonly kind: 'anchor'; readonly id: AnchorId }
  | { readonly kind: 'none' };

export interface InteractionVisualState {
  readonly hovered: InteractionTarget;   // [I] transient pointer target (renderer/host session)
  readonly selected: InteractionTarget;  // [I] persisted selection (module session-state)
  readonly route?: LotRoute;             // [I] the navigation-only destination this target would open
  readonly reconciled: boolean;          // [P] true when 'selected' still exists in the current snapshot
}
```

`route` resolves through the existing `navigation.ts` `BUILDING_ACTION` map to an existing app screen (`dashboard|roster|hiring|hub|assembly|saves|expansion-info`). No field here spends money, advances time, greenlights, hires, or mutates state. IsoCity is the negative example (MIT, rejected): its click writes the map and its URL hash is the save file, exactly the renderer-owns-truth pattern D1 forbids.

### F.5 ConstructionVisualState

Reserved for D2 or later. Facilities and construction are section 11 non-goals now, so this ships as a type and an empty projection, never scaffolded logic. When authorized it follows CorsixTH's per-cell build validity plus confirm gating (MIT), Augustus's blocked/discouraged/forbidden tri-state ghost (AGPL, study), OpenRCT2's VirtualFloor drawing only information-bearing edges (GPL, study), and GDQuest's cursor ghost (MIT), corrected on the one point all four get wrong for us: never colour alone, and never commit from the lot.

```ts
export type PlacementCell = 'buildable' | 'occupied' | 'discouraged' | 'forbidden';
export interface ConstructionVisualState {
  readonly candidate?: BuildingId;             // [I] what the player is attempting to place
  readonly footprint: readonly GridCell[];     // [P] cells the candidate would occupy, from a pure sim selector
  readonly perCell: readonly PlacementCell[];  // [P] validity per cell, computed in src/core, not the renderer
  readonly valid: boolean;                     // [P] AND of perCell; gates a semantic React 'Build' control
  readonly costPreview?: DisplayBand;          // [P] coarse band only; no money math crosses the boundary
  readonly ghostBranding: BrandingRef;         // [P] paint the ghost in studio livery, tinted by validity
}
```

Validity is sim truth surfaced through the selector (GDQuest's occupancy dictionary is the source-of-truth lesson): the Phaser lot must never maintain its own occupancy map. `valid` enables a React `Build` control; the lot itself stays navigation only.

### F.6 VehicleVisualState

D1 already renders `p-vehicle`/`p-van`/`p-golfcart` as ambient agents. Vehicles are cosmetic by default and only carry a `DeliveryToken` when they illustrate an authoritative event.

```ts
export type VehicleRole = 'service' | 'delivery' | 'talent-arrival';
export interface VehicleVisualState {
  readonly id: string;                 // [C] seed-derived (ambient)  |  [A] production-linked when a token exists
  readonly role: VehicleRole;
  readonly route: readonly GridCell[]; // [C] fixed waypoint route (STAGE_APRONS park anchors, the boulevard)
  readonly carries?: DeliveryToken;    // [P] optional illustration of a sim event; delivered on the sim's timer
  readonly sceneChannel: string;       // [C] seed channel for speed and phase
}
```

`DeliveryToken` (proposed) follows IndustryIdle's dots exactly: the token is optional, the outcome is `[A]`, and if the token is culled off-screen or suppressed by `setReducedMotion` the event still completes on schedule. This is the pattern to reach for if production flow (a script leaving Development, moving through Casting, Stage A, Post, Theater) is ever animated on the lot.

### F.7 SetVisualState

The active-production dressing D1 already builds in `dressStage()` (door-light spill, gear cluster, title-board easel, parked van), promoted to a grounded contract so the scene stops inferring it.

```ts
export interface SetVisualState {
  readonly stageId: TaskStageId;   // [P] which stage this dressing belongs to
  readonly active: boolean;        // [P] stageState === 'filming'
  readonly genre: string;          // [P] selects which department-prop layer to show
  readonly titleBoard?: string;    // [P] truncated film title on the easel (ProductionCard.title)
  readonly dressingChannel: string;// [C] per-film seed (':' + prod.id) for gear/prop jitter, no engine meaning
  readonly hush: boolean;          // [C] filming-beat cue from the VignetteDirector, cosmetic
}
```

`genre` selecting a department-prop layer is unknown-horizons' semantic-action-to-asset separation; `dressingChannel` and `hush` are `[C]`, matching the existing per-film `Rng(sceneSeed + ':' + prod.id)` draw and the vignette `filmingHush`.

### F.8 NotificationVisualState

The transient attention surface. Grounded in the existing `ATTENTION_META` (icon + word) plus Augustus's overlay tooltips and IndustryIdle's rate-limited floating text.

```ts
export type NotificationTone = 'info' | 'positive' | 'warning' | 'decision-required';
export interface NotificationVisualState {
  readonly id: string;                        // [A] stable id of the sim event that raised it
  readonly tone: NotificationTone;            // [P] band, paired with icon + word + text
  readonly icon: string;                      // [P] shape/glyph token (ATTENTION_META style)
  readonly word: string;                      // [P] visually-hidden prefix, e.g. 'Warning: '
  readonly text: string;                      // [P] human sentence (attentionReason style)
  readonly anchorTarget?: InteractionTarget;  // [P] what to focus on action; routes via navigation.ts
  readonly transient: boolean;                // [C] whether the surface may queue/rate-limit it
}
```

`tone` always ships with `icon`, `word`, and `text` so no notification is ever colour alone, matching the D1 companion-nav rule (`att-word` prefix plus glyph plus sentence). Acting on one routes through `navigation.ts`, so notifications remain navigation only.

### F.9 Projection boundary

All eight are sibling projections at the same engine boundary as `studioLotSnapshot`, produced by pure functions in `adapter.ts` (or one `lotVisualSnapshot(state)` that composes them). `[P]` fields reuse read models and re-derive nothing; `[C]` fields derive only from `sceneSeed = state.seed`; `[I]` fields are injected by `StudioLotScreen.tsx`, never by the pure selector, exactly as D1 already handles `selectedBuildingId`. The renderer receives these and only these. That is the single guarantee that lets the same engine run headless and behind the lot, and lets placeholder art and final art produce byte-identical layout.

---

## G. Asset-pipeline proposal

The proposal adapts the Asset Lab's existing local pipeline (`hash -> inventory -> curate -> optimize -> manifest -> validate`, `1u = 1m`, `1.8m` adult reference, `93` GLBs dual-validated `23/23`, artifacts under `public/assets/studio`, provenance under `licenses/`) and slots its outputs into The Movies `ui/` layout without imposing a new structure. It does not touch the D1 renderer, and it does not assume a GLB belongs in the Phaser lot merely because the pipeline can produce one.

### G.1 Two export tracks, one source, one register

The load-bearing decision: the Asset Lab Blender factory (`blender/studio_pipeline/`) is the single authored source, and it emits two tracks from that one source.

- Track 2D: pre-baked 2:1 dimetric iso sprite atlases at the camera angle that matches `iso.ts` (`TILE_W = 128`, `TILE_H = 64`). This is exactly how FreeSO bakes DGRP sprites from 3D and how OpenTTD/OpenGFX ship a pre-rendered iso base set. It gives the D1 lot authored art with no renderer rewrite, and it is the concrete form of the D1-A Studio Identity Package.
- Track 3D: the optimized `GLB` LOD0/1/2 the Asset Lab already produces, reserved for the Meridian hybrid decision (Gate D), not forced into Phaser.

Both tracks reference one manifest and one Provenance Register. This is OpenTTD's `.obg` lesson (GPL-2.0, study only, copy no code): art is a swappable, checksummed, provenance-carrying base set the engine references by stable id, and the engine runs identically on placeholder or authored art.

### G.2 Source organization

Authored source (`.blend`, layered `.psd`/`.svg`, Substance graphs) stays in the standalone Asset Lab repo, which is already read-only toward the main sim and owns no simulation truth. The Movies `ui/` never holds authored source, only optimized exports plus the typed manifest. This keeps the sim repo clean and preserves the Lab charter.

### G.3 Export organization

Compiled binaries land under `ui/public/assets/lot/` (Vite serves `public/` verbatim), and the typed, checksummed manifest lives at `ui/src/lot/assets/manifest.ts`, keeping everything the lot consumes under `ui/src/lot/` as D1 already does. The manifest is loaded inside `ui/src/lot/scene/assets.ts` behind the existing `studioLotOverviewEnabled()` flag, so with the flag off nothing is fetched, exactly as Phaser is not fetched today.

### G.4 Metadata and naming

Assets are keyed by stable id, never by filename convention alone (unknown-horizons' folder-is-the-schema fragility is the anti-lesson). The key is `<BuildingId>.<layer>.<state>.<tier>.<era>.<zoomBand>`, for example `stage-a.shell.filming.basic.modern.overview`. States enumerate the `AttentionState` and `StageState` values the selector can actually emit. The nine `BuildingId`s (`admin`, `writers`, `casting`, `stage-a`, `stage-b`, `post`, `theater`, `gate`, `expansion`) are the `SpriteID` analogues; the manifest row is the unknown-horizons building definition.

### G.5 Origins, pivots, scale

The 3D track keeps `1u = 1m` and the `1.8m` adult reference. The 2D track's logical unit is the `iso.ts` tile, and the manifest records the metres-per-tile chosen at pre-render time so the two tracks stay reconcilable (do not assume a fixed number; record it). Every sprite and mesh is anchored to the building's addressed grid origin so that `depthFor((gx+gy)*16 + layerBias)` sorts it correctly and the existing `fp()` invariant ("placement and art never disagree") continues to hold. Pivot data lives in the manifest, not in the scene code.

### G.6 Footprints

D1 already pulls footprints from baked texture metadata via `fp()` in `layout.ts` for the seven real buildings, with `gate` (`1x3`) and `expansion` (`4x3`, empty texKey) as the two hardcoded exceptions. The manifest carries `footprint` as first-class data so the 2D atlas, the 3D mesh, and `layout.ts` all agree, and build-time validation (G.16) fails if a supplied asset's footprint disagrees with the manifest.

### G.7 Selection bounds

Selection in D1 is a footprint diamond outline (`drawFootprint`, margin `0.05`), not a ring. Selection bounds therefore equal the footprint plus that margin and need no separate authored geometry; the manifest's `footprint` is the selection bound. This is why OpenRCT2's 1x1 re-paint pick and FreeSO's per-pixel pick are study-only for us: Phaser interactive objects already give render-pick parity against the drawn footprint.

### G.8 Interaction anchors

Named anchors per building are authored as data, resolved through `iso.ts`, never as magic pixel offsets in `LotScene`. D1's `STAGE_APRONS` already publish `door/gear/crew[]/park` per stage; the manifest generalizes this into a named anchor vocabulary (CorsixTH `use_position`/`use_position_secondary`/`handyman_position`, FreeSO `SLOTItem` proximity plus facing). `AnchorId` in section F is the runtime handle. Anchors are where crew stand, where vignettes play, and where D2 talent would route.

### G.9 Prop sockets

Buildings and characters expose named attach points (FreeSO containment slots with loop-safety and height stacking). On buildings these carry marquee blades, title-board easels, department gear; on characters they carry the hero-character props proven in Labs 05F/05G (radio, vest accessories). Sockets are named `glTF` nodes on the 3D track and named atlas offsets on the 2D track, both recorded once in the manifest so the two agree.

### G.10 Animation naming

The Asset Lab standard holds: one 65-joint skeleton, `6` reusable clips retargeted by bone name, `43` CC0 Universal Animation Library clips available. Clips are named by semantic action, not by role (unknown-horizons `idle`/`work`/`idle_full`, FreeSO retarget-by-bone-name), so a clip is authored once and reused across every character. `CharacterActivity` in section F selects the clip; the renderer resolves it. No clip carries engine meaning; ambient crew phase is `[C]` from `sceneSeed`.

### G.11 LODs

The Asset Lab already emits LOD0/1/2 (`GLB`) plus collision, and its validator already caught a phantom-LOD manifest defect in Lab05, which is exactly the kind of check to keep. The manifest lists all LODs per asset and validation fails on a missing level. For the 2D track, LOD is a pre-baked resolution per zoom band rather than a mesh decimation.

### G.12 Zoom variants

D1 has five camera presets (`overview|production|wide|entrance|theater`) and semantic zoom bands already (production tags switch across three bands). OpenTTD's first-class zoom-to-LOD binding is the model (GPL, study): a small enum with explicit thresholds, plus per-object salience opt-in (its `isVisibleWhenZoomed`) so a warning building or an active stage survives when ambient crew is culled at `overview`. The 2D track may bake a variant per band or rely on Phaser scaling; the manifest records which. This is display LOD, not asset LOD, and it changes cost, not output.

### G.13 Era variants

Reserved. Eras are a section 11 non-goal, so this ships as manifest fields (`era`) that resolve to material and decal swaps, never as new pipelines or new bespoke buildings. The model is OpenTTD Action 5 whole-category skinning plus unknown-horizons per-tier `actionsets` keyed by tier (highest available tier at or below the level). Do not scaffold it.

### G.14 Branding variants

One artwork, many liveries, via recolour rather than duplicated art. This is the OpenTTD recolour lesson (GPL, study, copy no ramp values): author a reserved brand band and remap it per studio. `palette.ts` already bridges to the product tokens (`brass = --accent`, `labelBg = --bg-panel`, `labelText = --text`), so the bridge exists. For the procedural placeholders, branding is a deterministic Phaser tint keyed to a brand colour; for authored atlases, either a small indexed-remap shader or a few pre-baked ramp variants. `BrandingRef` in section F is the handle. The studio wordmark stays a decal plus a reserved scene overlay slot, because `assets.ts` notes Phaser Graphics cannot draw text and the gate header beam and title easels are already reserved for scene-drawn lettering.

### G.15 License and provenance records

Every asset carries a Provenance Register row aligned to the Asset Lab classes: `CC0`, `ATTRIBUTION-REQUIRED`, `PROTOTYPE-ONLY`, `LICENSE-UNCLEAR`, `DO-NOT-USE`, with the governing rule that a free download is not a known production license, so absent embedded evidence the default is `LICENSE-UNCLEAR`. The 05H precedent applies: the first CC0-derived asset carries a `studio_base` custom prop naming its source and its evidence lives in `licenses/asset-lab-05h/`, and the "100% original" convention no longer holds for it. The manifest row mirrors OpenTTD's `.obg` entry: per-asset checksum plus origin plus an explicit license field. The corpus supplies the sharp edge to encode: copyleft is not CC0. OpenGFX is a famous, free, popular art set and still GPL-2.0, so the register must classify GPL and CC-BY-SA (Augustus `res/assets`, unknown-horizons, Citybound icons/fonts) as NON-adoptable, distinct from CC0, and treat any bundled retail-derived asset (FreeSO EA data, Citybound Icons8, IndustryIdle proprietary art) as `DO-NOT-USE`.

### G.16 Build-time validation

Extend the Asset Lab `validate` stage (already `45/45`, `23/23`) and run it in CI next to the existing lot snapshot and Playwright suites. It must assert, and fail loudly on any miss (OpenTTD `CheckMD5` lesson): manifest checksum matches the binary; footprint matches the baked `fp()` metadata; every LOD/skeleton/clip named in the manifest exists (the Lab05 phantom-LOD class of defect); every asset has a provenance class and that class is not `LICENSE-UNCLEAR` or `DO-NOT-USE` before it may enter the shipped set; and a placeholder-versus-authored determinism check that the two produce identical layout, which is the invariant made testable.

### G.17 Runtime fallback

The procedural placeholders in `assets.ts` remain the fallback and are never deleted. If an authored atlas is absent or fails checksum at load, the lot renders the procedural placeholder for that asset (CorsixTH keeps `sprite_viewer` as an in-engine fallback for the same reason). Because the determinism invariant requires placeholder and final assets to produce the same layout, this fallback is safe by construction: the scene reads the same manifest footprints and anchors either way. A checksum mismatch fails loudly in dev and CI, and degrades gracefully to placeholder in the shipped build.

### G.18 Binary-file policy

Optimized binaries only in `ui/public/assets/lot/`; authored source only in the Asset Lab. Binaries are Git-tracked (the Asset Lab already commits `public/assets/studio`), with Git LFS the option to weigh as the set grows (Egregoria and Citybound both LFS-track their `GLB`/`png`), and with the documented large-push mitigation (`http.postBuffer`, incremental commit-by-commit push) from the Lab05E experience. No `LICENSE-UNCLEAR` or `DO-NOT-USE` binary ever enters the tree; validation (G.16) is the gate.

---

## H. Modular-content strategy

The maturation target is to move building art from D1's current shape (six hand-coded composers in `assets.ts`: `bakeAdmin`, `bakeWriters`, `bakeCasting`, `bakeStage`, `bakePost`, `bakeTheater`, each hand-coding its silhouette from shared primitives, "not monolithic but not data-driven either") toward a data-driven kit where a building is a manifest row that selects reusable modules, painted by a recolour ramp, plus a few authored hero assets where identity demands it. Three corpus lessons combine into one recipe: unknown-horizons (a building is data plus components, no code change to retune), OpenRCT2 (assemble from a catalog of construction pieces), and OpenTTD NewGRF recolour (one artwork, many liveries, zero duplication). All three are study-only on licensing (GPL/GPL/AGPL and GPL); we take the shapes, not the code.

This is a maturation target, not a now-build. Facilities, construction, and eras are section 11 non-goals. The D1-A Studio Identity Package is the first and only authorized slice: authored art for the nine existing buildings, one hero landmark, branding recolour, and wordmark decals, with no tiers, eras, or construction introduced. Keep the kit small; two people maintain it.

### H.1 The ten layers, classified

Each building is composed from up to ten layers. The strategy is that most layers are reusable modules, material variants, decals, props, or metadata-selected, and only a handful are authored hero assets that carry studio identity.

| Layer | Classification | Grounding and D1 tie-in |
|---|---|---|
| Base identity | Metadata-selected | The manifest row (unknown-horizons definition, the `.obg` entry). Not art. Extends the existing `BUILDING_LABELS`/`BUILDING_BLURBS`/`BUILDING_ACTION` maps into a data table that selects the modules below. |
| Shell (walls, massing) | Reusable module + material variant | D1's shared `drawWalls` primitive plus `palette.ts` material families (cream stucco, taupe deco, buff hangar, slate technical). Most buildings reuse one shell module recoloured. |
| Roof | Reusable module (catalog) | D1 already has three interchangeable roof primitives (`flatRoof`, `gableRoof`, `barrelRoof`); the Asset Lab 04 reference proved a roof-language catalog (sawtooth mill, deco admin, streamline commissary, marquee gate). OpenRCT2 construction pieces are the assembly model. Metadata selects the roof. |
| Entrance | Reusable module + prop | Stage elephant doors, admin forecourt, gate guard booth. Mostly modules; the booth and doors are props. |
| Signage | Decal + reserved overlay slot (+ authored hero for Theater) | `assets.ts` already reserves the gate header beam and title easels for scene-drawn text because Phaser Graphics cannot draw text. Studio wordmark is a branding decal; the Theater marquee blade is authored hero geometry. |
| Department props | Props, metadata-selected by genre | `dressStage` gear clusters, cameras, easels. A reusable prop catalog selected by `SetVisualState.genre`, with unknown-horizons weighted variety seeded deterministically. |
| Era treatment | Material variant + decal, metadata-selected | Reserved. Swap materials and decals, not geometry (OpenTTD Action 5, unknown-horizons per-tier actionsets). Non-goal now. |
| Upgrade layer | Additive module + prop, metadata-selected | Standing and tier expressed by adding dressing, not recolouring. D1's `establishedDressing` already does this (premiere banners, studio flag, cafe umbrellas when doing well): "authored environmental storytelling, not a global tint." `FacilityTier` selects. |
| Studio branding | Material variant (recolour ramp) + wordmark decal | OpenTTD recolour: reserved brand band remapped per studio; `palette.ts` brass already bridges to `--accent`. Never per-studio geometry. `BrandingRef` selects. |
| Active-production dressing | Props + cosmetic, metadata-selected by `SetVisualState` | D1 `dressStage` door glow, gear, title board, parked van; per-film `Rng(sceneSeed + ':' + prod.id)` jitter. Transient, never permanent geometry. |

### H.2 Authored hero assets versus kit

Only three or four assets should stay bespoke, because they carry the studio's identity and cannot be assembled from a generic kit:

- The Studio Gate (`gate`): deco pillars plus the deep header beam already reserved for the wordmark. Hero.
- The Theater marquee (`theater`): the marquee canopy plus vertical blade sign is the building's identity. Hero.
- The landmark water tower: today a "generic silhouette" placeholder by its own comment. This is the natural single bespoke landmark to promote to hero as part of D1-A.
- Optionally the Administration deco crown, which is a hero-ish roof piece rather than a whole hero building.

Everything else is kit. The two soundstages are the clearest kit candidates: they already share the stage texture in D1, and a barrel-vault shell module plus an elephant-door entrance plus AC-vent roof props covers both. Offices (`admin`, `writers` = Development, `casting`, `post`) reuse one shell plus a roof-catalog choice plus a material variant plus a signage decal. Social buildings (a future commissary or cafe, referenced in Asset Lab 04) reuse the office shell plus umbrella and awning props, which `establishedDressing` already gestures at. Production-support (`post`, the gate booth) reuses the office kit and prop catalog. Film-sets are the active-production dressing layer only: props and cosmetic jitter selected by genre, never permanent massing.

### H.3 Data-driven assembly, grounded in the existing invariants

The building kit manifest (an extension of the G manifest) lists, per `BuildingId`, the module id for each layer, following unknown-horizons' declarative definition. Assembly must preserve two D1 invariants. First, each composed piece carries its own footprint and pivot so the `fp()` rule ("placement and art never disagree") and `depthFor` front-corner sorting still hold when modules stack; if stacked pieces ever overlap ambiguously, Augustus's footprint-versus-top band separation is the documented escalation. Second, the six hand-authored composers in `assets.ts` remain as the placeholder and runtime fallback (G.17) until the kit exists, so the migration is incremental and the determinism invariant is never at risk. Branding and standing and era are expressed as recolour, decals, additive modules, and metadata selection, never as new bespoke buildings, which is the only way a two-person team sustains studio variety without an art-production explosion.

## I. Character presentation strategy

### The rule in one line

There is exactly one character source of truth in authoring, the 65 joint skeleton plus the 05H CC0 authored base body plus the shared animation library, and there are three separate derived representations at runtime, one per tier. Do not ship the source GLB into the Phaser lot, and do not hand author unrelated meshes per tier. Derive, do not duplicate.

### Where 05H sits

Place 05H at the source, upstream of all three tiers, not inside any of them. The Labs 05 through 05G primitive and hero work proved the pipeline mechanics (Blender to GLB export, LOD0/1/2, 65 joint skeleton compatibility, 6 reusable clips, deterministic generation, Three.js runtime loading, management distance decorative crew feasibility) but the primitive driven character workflow did not clear the human scale visual bar. 05H is the fix: a verified CC0 authored human base that replaces primitive anatomy while keeping the 65 joint skeleton and the 6 clips, with continuous body topology and fitted workwear. 05H is therefore the proving of the shared base body, not a shipped character. Two hard constraints travel with it and must be stated on every downstream slice: 05H is the first non original (CC0 derived) asset, so the "100 percent original `public/assets/studio`" convention no longer holds for anything derived from it, license evidence lives in `licenses/asset-lab-05h/`, and each asset carries a `studio_base` custom prop naming the CC0 source; and role wide propagation and any tier integration are both prohibited pending separate owner authorization. The immediate next step for 05H is not "put it on the lot," it is "authorize one hero, then bake the tiers from it."

### The three tiers and their rulings

| Tier | Surface and engine | Representation ruling | Derived from |
|---|---|---|---|
| Tier 1, management lot workers | The D1 lot, Phaser (`ui/src/lot/scene/LotScene.ts`) | Prerendered sprites (billboards), never live GLBs | Bake a minimal direction and pose set from the shared source |
| Tier 2, talent profile | Roster and hiring UI, React and DOM | Portraits, baked 2D; at most a single bounded R3F island on a detail view, never a live canvas per list row | Bake portraits from the same shared source |
| Tier 3, film playback and closeup | Standalone 3D surface, Three.js and R3F (the frozen spike, hybrid standalone copy) | Live GLBs on the 65 joint rig, deferred and out of scope now | The source GLB itself, plus the full clip library |

Tier 1 ruling detail. The lot is a fixed 2:1 iso Phaser scene that consumes sprites; the ground truth is explicit that a working GLB pipeline is not a license to put GLBs in it. Author crew in 3D from the 05H base, bake a small number of directions and the minimal motion frames to a sprite atlas, and place them as the existing ambient agents (`LotScene.ts` `buildAgents`, 10 workers plus 3 vehicles). The technique for direction and action sprite selection with subtile interpolation is Augustus (`src/widget/city/figure.c`, `cross_country_x/y`, `progress_on_tile`), and the baking model is FreeSO DGRP (direction by zoom by rotation tables, `DGRPRenderer.cs`), but Project Studio inverts the ownership Augustus assumes: its figures are simulation truth, while D1 crew are decorative, seeded entirely from `StudioLotSnapshot.sceneSeed`, carry no engine meaning, and use no `Math.random`. Keep the direction count small; combinatorial sprite sets are the one thing a two person team cannot afford, which is the exact weakness that made pure 2D (Option A) score Weak on character customization in Section E.

Tier 2 ruling detail. The talent profile is management UI, and management UI must stay fast, accessible, and cohesive with the dark executive product. Render talent as baked portraits, produced from the same shared source so a talent looks like one person across the profile and the lot. Do not mount a live Three canvas per roster row. If a talent detail view ever wants motion, it is a single bounded R3F island, dynamically imported and pausable, mirroring the discipline already proven in `StudioLotView` (Phaser is lazy loaded via dynamic import and the RAF loop sleeps on `pause()`), not a standing second renderer.

Tier 3 ruling detail. Closeup and film playback are where full customization and rich animation belong, on live GLBs with the 65 joint skeleton, and this is the natural home for the frozen 3D spike under the HYBRID recommendation. It is out of scope right now: film visual output, scene composition, and screenplay generation are on the do not build list, so Tier 3 is proven ready (05H, LOD, skeleton, clips) but is not integrated and Gate D stays HELD.

### Animation families mapped to tiers

The two clip families are not interchangeable across tiers, and mapping them correctly is what keeps the burden feasible.

- The 6 reusable clips are the minimal management distance motion set (idle, walk, work, and the like) proven to retarget onto the 65 joint skeleton. These are the entire animation budget Tier 1 needs. Bake them to sprite frames; the lot crew is ambient and low motion, and reduced motion plus `sceneSeed` already govern their behavior.
- The 43 CC0 UAL clips (Quaternius CC0) retarget by bone name onto the same skeleton and are the richer library. They feed Tier 3, where live full body animation and weighted blending matter, and they can feed a Tier 2 detail view if one is built. Most of the 43 are overkill for the lot; do not bake them into Tier 1.
- Weighted crossfade blending is a Tier 3 technique, not a Tier 1 one. The reference is FreeSO's `Animator.cs` (per bone `Vector3.Lerp` and `Quaternion.Slerp` weighted so active clips sum to one, walk clips blended by velocity). Baked Tier 1 sprites need none of it.

Because every tier derives from the same 65 joint rig and the same clips, an animation authored once retargets everywhere by bone name, and the same motion reads consistently from the baked lot sprite to the live closeup. That single rig contract is what makes the shared source approach affordable for two people, and it is independently corroborated by FreeSO's shared skeleton plus swappable bound mesh plus accessory layer model (`tso.vitaboy.model/Outfit.cs`, `Appearance.cs`, `Binding.cs`, and the sim side `VMOutfitReference.cs`), which reached the same conclusion the Asset Lab 05x work did.

### Interaction anchors per tier

- Tier 1. The anchor is the ambient sprite's screen position. `LotScene` already wires this: `makeInspectable` attaches hover and click, the scene emits an `onCharacter` event, and `firstInspectableScreen()` projects the first inspectable to CSS pixels for tests. Selection should hold only an id and reconcile against the next snapshot rather than caching character data, which is exactly Egregoria's id based selection reconcile (`native_app/src/gui/tools/selectable.rs`, clear the selection when the entity is no longer present). Note the boundary: D1 crew are anonymous and decorative, so a persistent named talent standing on the lot is a future concern that `StudioLotSnapshot` does not carry today, and named interaction anchors where a character performs work at a building (the FreeSO SLOT and CorsixTH `use_position` model) are future character activity, currently out of scope. Do not manufacture either.
- Tier 2. The anchor is a semantic React control reached through navigation, not a lot dependency. `navigation.ts` already routes `casting` to `browse-talent` and maps lot actions to the existing roster and hiring screens, and every destination is reachable without the lot. Selecting a talent is an id into the roster read model.
- Tier 3. The anchor is a chosen production or scene context, deferred and undefined until Tier 3 is authorized.

### The Phaser versus Three boundary, stated exactly

Phaser owns Tier 1 and consumes sprites and atlases only. No Three code and no GLB enters the Phaser bundle, which preserves the eager bundle discipline (`StudioLotView` lazy loads Phaser today) and the browser performance budget. Three and R3F own Tier 3, a separate standalone surface, the frozen spike or its hybrid copy. Tier 2 is React and DOM, with 3D only as a single bounded R3F island if ever needed. The two engines never coexist in one runtime scene. They meet only at the offline bake step: the Asset Lab (three 0.161, R3F) renders the shared source character to the sprite atlases Phaser consumes and the portraits the UI consumes. This is the FreeSO lesson applied to characters, per pixel 3D sophistication earns its keep only with depth baked assets, so for the management lot the correct move is a grid corner painter consuming baked sprites, and it is the same offline versus runtime split OpenTTD uses for a swappable base set (`src/base_media_base.h`) and that unknown horizons uses to keep a semantic action name in data separate from the frames that satisfy it (`horizons/util/loaders/actionsetloader.py`, `horizons/world/production/producer.py`), which is precisely how a baked Tier 1 crew stays swappable from placeholder to final without touching the sim.

### Determinism and provenance carry through the bake

Two invariants must survive the derivation. Determinism: Tier 1 crew placement and motion derive from `sceneSeed` with no `Math.random`, and the baked final sprites must produce the same lot layout as the procedural placeholders, since the determinism invariant explicitly spans placeholder and final assets; Citybound's `seed((lot.original_lot_id, ident))` keyed procedural detail (`cb_simulation/src/land_use/buildings/architecture/language.rs`) is the corroborating precedent that a stable id plus a named channel can drive rich variation deterministically. Provenance: because Tier 1 sprites and Tier 2 portraits are derived from the 05H CC0 base, they inherit its non original status, so the `licenses/asset-lab-05h/` evidence and the `studio_base` prop must travel with the baked outputs. The surrounding license lessons set the guardrail hard: only CC0 or original art enters the character bake, UAL and Quaternius are CC0, the Asset Lab FBX interior props are LICENSE UNCLEAR and the wintersets are DO NOT USE, and the repo audit is unambiguous that free and open does not mean reusable (OpenGFX is GPL copyleft, Augustus and unknown horizons art is CC BY SA share alike, both rejected). The character pipeline stays clean only if that discipline is applied at the bake, not just at the source.

## J. UI and lot readability

The governing rule: the lot is not a dashboard. `studioLotSnapshot` already collapses continuous engine truth into coarse display bands before it ever reaches the renderer (`cashBand`, `standing`, `reception`, and exactly one `AttentionState` per building, computed once in `buildingState()` at `adapter.ts:3743`). Readability work must honour that collapse and never re-expand a single banded fact into a cloud of icons. Every fact has one correct home. Deciding the home is a function of three questions: how persistent is the fact, how many entities does it concern, and does the user need it at rest or only on demand.

| Surface | Carries | Persistence | Scope | Grounding |
| --- | --- | --- | --- | --- |
| **World** (ambient, `sceneSeed` driven) | The studio's physical state and standing as environmental storytelling: stage occupancy (a `ProductionCard` present = `filming`, absent = `available`), studio prosperity expressed by ADDED dressing not tint, the studio name on the gate | Always on, at rest | The lot as a whole | `layout.ts` `establishedDressing` adds banners/flag/café life when `standing` is high (authored dressing, not a global recolour); occupancy read via `productionFor()`/`stageState()` in `LotScene.ts` |
| **Persistent label** | Building identity only (`BUILDING_LABELS`), gate lettering (`studioName.toUpperCase()`) | Shown while selected or hovered | One building | `LotScene.refreshHighlights()` shows the label with the footprint outline on select/hover; not a data readout |
| **Overlay** (a mode you enter) | One dimension across many buildings, dimming the rest | Transient, mode scoped | Many buildings | Augustus function pointer overlays (`overlay.h`, AGPL, study only): dim everything out of focus, then column height + banded tooltip. D1 ships none; reserved for D2 |
| **Tooltip / hover** | `attentionReason` strings and the hover only tier of detail | On demand, on hover | One building | CorsixTH `on_hover` moods (`humanoid.lua`, MIT) surface only under the cursor; our companion nav already renders `stateText = attentionReason ?? meta.word` |
| **Selected context panel** (`role="dialog"`) | Building blurb (`BUILDING_BLURBS`), the single routed action (`BUILDING_ACTION`), the attention reason | On demand, while selected | One building | `StudioLotScreen.tsx` selection dialog; bounded, not the full management record |
| **Management screen** | Every exact number: `cash` to the dollar, `standingValues` 0..100, finances, the full in production list, all recent releases | Persistent, the real work surface | Whole studio | `navigation.ts` routes the lot to `dashboard/roster/hiring/hub/assembly/saves`; the snapshot deliberately truncates (two stages, four releases) because the exhaustive lists live here |
| **Notification** | A state transition that needs attention at the moment it happens | Event driven, transient | One event | Not a lot concern; the passive equivalent is the resting attention badge. Keep event alerts in the app shell |
| **Broadcast** | Presentation celebration of outcomes | Deferred | n/a | Phase 6, hard stopped in `CLAUDE.md`. Do not build |
| **Autopsy** | The deep post hoc record of a released film (critic detail, the full theatrical run) | Deferred, management class | One film | Explicitly NOT the lot and NOT the snapshot: `StudioLotSnapshot` carries `reception` band + `weeksAgo` only and invents no theatrical payment data (`StudioLotSnapshot.ts:3-9`). This depth belongs on a full screen, never on a building |

Three rules fall out of this and each is already half enforced in D1:

1. One attention per building, resolved by a priority ladder. The selector emits a single `AttentionState` per building today (`warning`, `active`, `empty`, `recently-completed`, `future`, `normal`), never a stack. This is the CorsixTH discipline: many simultaneous conditions collapse to the one highest priority icon. It is also where `decision-required` mechanically outranks the D1 states when D2 lands, which is why it can stay reserved without renderer changes. Do NOT copy IndustryIdle's `EntityVisual` approach of many always present child status nodes per building (`ring/warning/turnOff/noPower/underConstruction`): its icon vocabulary is good, its per building node stack is the memory heavy, entangled version we are avoiding.

2. Never colour alone. `ATTENTION_META` pairs every state with an icon glyph, a visually hidden word prefix, and the human `stateText`. The world badge must match the companion nav exactly, so a colour blind or canvas failed reader loses nothing.

3. An overlay is a mode you enter, not an always on layer. A future "cash pressure across the lot" or "production heat" view is the Augustus dim the rest plus column plus banded tooltip pattern (D2+). Until then, the resting per building badge is the only standing signal, and the exact numbers stay one navigation hop away on the management screen. The selector is the gatekeeper: if a fact is not on `StudioLotSnapshot`, the world physically cannot show it (leaf type, no `GameState` access), so "should this be in the world" is partly "should this become a snapshot field," which escalates to the joint boundary decision in Section N.

## K. Performance and scale risks

D1's load is genuinely small and the internal audit did no runtime profiling, so the rankings below are code reasoned, not measured. `getDebugState()` already exposes `{selected, activeTags, displayObjects}` at the view boundary (the scene internal `debugState()` additionally tracks `poolInUse`), and `displayObjects` is the natural hook for the one profiling action worth taking (see the end of this section).

### Current real risks

- **Payload.** Phaser 3.90 is a heavy dependency, and this is the one cost that is real today. It is already well contained: Phaser is `import()`ed lazily inside an effect so it never enters the eager bundle, and `flags.ts` `studioLotOverviewEnabled()` defaults OFF, meaning when the flag is off no Phaser is fetched, no renderer mounts, and the app is byte for byte unchanged. The residual is a one time download plus parse on first lot open. Keep the lazy import and the default off flag; do not eagerly warm Phaser.
- **Synchronous texture bake at mount.** `assets.ts` bakes every building, prop, and tile texture procedurally via `generateTexture()` once at scene create (`bakeAllTextures`). For 9 buildings plus props plus 528 ground tiles this is cheap, but it is main thread work at the moment the lot appears. The audit flagged this cost as inferred, not measured. Watch it, do not pre optimise it.
- **Hover and selection redraw discipline.** IsoCity's lesson (two canvases, O(1) hover) and OpenRCT2's separate overlay pass both say the committed scene must never repaint to show hover feedback. D1 is already aligned: `refreshHighlights()` touches only the hovered building's footprint graphic and lifts its sprite 3px. The risk is regression, so any new hover or selection affordance must stay on the reserved `LAYER.overlay=10000` band and not dirty the building or prop layers.

Per frame cost today is low and self limiting: `dt` is clamped to 0.05, production tag layout recomputes only on a zoom band change, the 528 tile ground is a single `renderTexture` rather than 528 sprites, and `pause()` sleeps the Phaser RAF loop entirely when the tab is hidden so a backgrounded lot costs no CPU. These are the correct instincts and need no further work.

### Future risks (as the lot grows)

- **Visible workers and animated props.** Today there are 13 agents plus a 10 sprite reusable vignette actor pool. If character activity lands (persistent named talent walking between `writers`, `casting`, the stages, `post`, `theater`), agent count and per frame lerp plus re depth grows. The IndustryIdle levers become the reference at that point: node pooling (reuse sprites, never create/destroy in the loop), viewport culling (`isPointInView` to skip off screen updates), and an amortised tick queue (process `ceil(N*dt)` agents per frame, not all). The existing vignette actor pool already prefigures pooling.
- **Depth sort at overlap.** `depthFor(gx,gy,bias) = (gx+gy)*16 + bias` is a single front corner painter key, and agents re depth every frame. This is correct while objects are grid aligned and non overlapping, which D1 content is. The boundary risk, flagged independently by OpenRCT2, FreeSO, and OpenTTD, is the moment tall sprites overlap in screen space or moving crew pass in front of and behind the multi tile stages, theater, or water tower: a single corner key can mis sort. OpenRCT2's quadrant bucketed 3D AABB sort (`Paint.cpp`) and OpenTTD's AABB topological sort (`viewport_sprite_sorter.h`) are the clean room escalation references, both GPL and study only. The trigger is a demonstrated mis sort, not a calendar date.
- **Zoom and LOD.** D1 has continuous zoom (`ZOOM_MIN=0.32`, `ZOOM_MAX=1.9`) with three semantic zoom bands driving production tag display and a character inspection gate at `>=0.55`. This is display and interaction LOD, not geometric or asset LOD: the same sprite draws at all zooms. When authored art replaces placeholders, shedding ambient detail when zoomed out becomes worthwhile, and OpenTTD's zoom enum tied to LOD thresholds (`zoom_type.h`) plus OpenRCT2's entity cull at far zoom and `isVisibleWhenZoomed` salience opt in are the references.
- **Multiple productions.** The engine caps concurrent productions and the snapshot slices `activeProductions` to the two stages and `releasedFilms` to four. Production rendering is therefore bounded by design. Future tiers or expansion that add stages scale the tag and dressing cost linearly, which stays small.
- **Memory, effects, lighting.** Textures bake once into the Phaser texture manager with no external loads, so memory is bounded and small for the fixed placeholder set. Door glow, the recording light pulse, and light phases are cheap `Graphics`. Real growth comes only from authored atlases per building plus LOD variants plus era skins, which is the OpenTTD manifest with checksums lesson (a D1-A and later concern, not now). A real lighting cost only appears if the separate frozen 3D or hybrid track is ever integrated, which is Gate D held.

### Premature concerns

- A 3D AABB topological depth sort (OpenRCT2 or OpenTTD) is over engineering for static grid aligned non overlapping buildings. IsoCity proves the simple painter key suffices for exactly this content.
- Per pixel z buffer sprites (FreeSO) require depth baked into every sprite, an asset pipeline dependency the placeholder art does not have and does not need. Reject for greybox.
- A global fps30 cap (IndustryIdle) is a lever for thousands of entities; we have 13. `pause()`/`resume()` already covers the only real waste, the backgrounded tab.
- Hardware blitter, SSE fast paths, and extra zoom art sets are native engine concerns irrelevant to a browser Phaser lot at this scale.
- Draw call batching beyond the single ground `renderTexture` is unwarranted for 9 buildings, roughly 42 hedges, and 13 agents.

Do now: nothing structural. When agent count first grows, add one perf smoke test in the IndustryIdle style, asserting identical rendered layout via `getDebugState().displayObjects` with pooling and culling on versus off and a measurably lower per frame time, so the perf layer is proven to change cost and not output.

## L. Legal and provenance report

The full legal and provenance report, with code license, art license, and audio license separated per repository, the retail asset dependency column, the clean room versus adapt shortlist, and the explicit do not copy list, is in the sibling file **[LICENSE-AND-PROVENANCE-MATRIX.md](./LICENSE-AND-PROVENANCE-MATRIX.md)**. Headline: every repository is STUDY_ONLY at the repo level; not one is a code donor or an art donor; an open source engine never legalizes bundled or required commercial assets, and open art is frequently copyleft (OpenGFX is GPL, Augustus and unknown horizons content is CC-BY-SA), so only original or verified CC0 art enters the pipeline.

## M. Bounded experiment proposal

Exactly one next experiment is proposed: the **D1-A Studio Identity Visual Proof**, a fully procedural, zero asset intake, zero contract change slice, set out in full in the sibling file **[BOUNDED-ART-EXPERIMENT.md](./BOUNDED-ART-EXPERIMENT.md)** (product question, starting state, exact scope, exclusions, likely files, tests, screenshots, performance evidence, stop conditions, human review gate). It is a proposal only; nothing in it is to be implemented until the owner authorizes it.

## N. Art and Engine coordination decisions

On a two person team these are review lenses, not separate people, so the value here is knowing which lens applies and which changes escalate to the owner's PR merge gate. The team constraint is fixed: the owner reviews everything, nothing merges without owner review, and big builds ship via a PR the owner merges rather than a direct push to main. Layered on top is the `CLAUDE.md` phase hard stop: any move into production art integration (D1-A), UI phase 5, or Broadcast phase 6 is owner gated and must not begin until the owner says so.

| Change type | Approver | Why, grounded |
| --- | --- | --- |
| Any change to `StudioLotSnapshot` (add/rename/remove a field, change what a band means, widen the `AttentionState`/`StageState` the selector actually emits) | **Joint boundary** (Art + Engine), then owner PR merge | `StudioLotSnapshot.ts` is the one narrow, framework neutral, immutable, leaf type contract between the pure selector and the renderer. A field change moves both sides at once: Engine must confirm the new fact can be grounded in real `GameState` truth with no manufactured truth and no RNG (the determinism invariant); Art must confirm the renderer needs it and can render it without colour alone. Examples that are all joint: emitting `decision-required` in D1 (reserved for D2), adding an `occupantPresent` boolean (the FreeSO containment idea), adding a `brandColour` (the OpenTTD recolour idea). The snapshot unit tests that assert "invents nothing," the exactly four display keys on the expansion pad, and the fixed `ReleasedCard` key set are the enforcement artifact any such change must update |
| A new selector or selector logic change that stays behind the existing contract shape (a new pure `GameState -> display facts` projection, a new band helper, a new attention grounding) | **Engine PM**, then owner PR merge | Selectors live at the engine boundary (`adapter.ts` `studioLotSnapshot` plus `lotCashBand`/`lotStandingBand`/`lotReceptionBand`/`buildingState`), read `GameState` only through existing read models (`financeCard`, `findConcept`, `TUNING`), re derive no formula, and mutate nothing. This is engine owned correctness. Art does not need to approve how `cash` becomes `cashBand`, only that the band exists. Egregoria and Citybound corroborate: the sim owns the projection, the renderer consumes it. If the new selector also adds a field to the contract, it is additionally a snapshot change and escalates to joint |
| A renderer decision that changes the contract, the technology, or the phase (rewrite the Phaser scene, change the `iso.ts` transform or `depthFor`, adopt a different depth sort, hybridise the frozen 3D spike, begin D1-A or D2 renderer scope) | **Owner** | The corpus rule is explicit and repeated: do not recommend a renderer rewrite because another repo looks more advanced. IsoCity, FreeSO, OpenRCT2, and OpenTTD independently concluded our `iso.ts` 2:1 transform plus `depthFor` painter key is the correct simple choice for placeholder art. Changing it, or crossing into UI phase 5, is a big decision under the phase hard stop, not a routine one |
| Routine renderer work inside D1's contract and existing look (draw an attention badge the snapshot already grounds, tune agent waypoints, add a vignette that reads eligibility from the snapshot, adjust perf mechanisms) | **Engine PM** for correctness, **Art PM** for the visual result | These touch neither the snapshot nor the sim. Engine confirms determinism (`sceneSeed`, no `Math.random`) and perf budget; Art owns the aesthetic call. Pooling, culling, amortised ticks, the feature flag, lazy load, `pause()`/`resume()`, and the debug hooks (`getDebugState`, `forceVignette`, `seekVignette`) are engineering internal and are Engine PM only |
| On canvas aesthetic within existing palette tokens (`palette.ts` brass = product `--accent`), procedural placeholder shapes in `assets.ts`, dressing composition (`establishedDressing`), vignette choreography look | **Art PM**, Engine confirms it stays deterministic and in budget | Visual craft that changes no contract, no selector, and admits no external asset |
| Accepting ANY new art, audio, font, or model into the pipeline, or accepting a license classification | **Owner**, non delegable | "A free download is not a known production license," and the default is `LICENSE-UNCLEAR`. The studied corpus proves "open" usually means copyleft or retail encumbered: OpenGFX, Egregoria, Augustus, Citybound, and IndustryIdle are GPL or AGPL; FreeSO is MPL with a confirmed SM64/`Mario.dll` Nintendo red flag; OpenRCT2, CorsixTH, Augustus, and OpenTTD all depend on retail assets that stay proprietary. Only IsoCity (MIT, texture likely CC0 but unverifiable from the repo) and GDQuest (MIT plus OFL font) are clean, and even IsoCity's texture license is not embedded. 05H, the first CC0 derived asset, required license evidence in `licenses/asset-lab-05h/`, carries a `studio_base` provenance prop, and its role wide propagation is prohibited pending separate owner authorization. Art PM may prepare the provenance record (source, class, evidence file, prop) but cannot accept it |

Escalation rule, in one pass: does the change touch `StudioLotSnapshot`? Joint. Does it read `GameState` in a new way behind the existing contract? Engine. Does it change what technology draws or move a phase boundary? Owner. Does it admit a single byte of third party content? Owner provenance gate. More than one can apply at once, and the most restrictive wins.

Two consequences worth stating plainly. First, because every studied repo is either copyleft or retail encumbered (per the verification verdicts), no code and no asset from any of them may be lifted into Project Studio. Clean room reimplementation of a pattern is defensible (patterns are not copyrightable) and is an Engine PM engineering choice, but any asset that results still needs the owner provenance sign off. This is precisely why the audit itself is read only research. Second, a construction or placement ghost (the OpenRCT2, Augustus, CorsixTH, and GDQuest reference) is the worked example of a change that hits all four gates at once: it needs a new snapshot field (a per cell `valid[]` plus a `canBuild` boolean) which is joint, a new selector which is engine, a renderer decision, and it is a phase 5 plus feature under the hard stop. It is therefore D2 or later and stays unbuilt until the owner opens that phase.

---

*End of Art and Presentation Integration Blueprint. Companion documents: OPEN-SOURCE-ART-AUDIT.md, REPOSITORY-MATRIX.md, LICENSE-AND-PROVENANCE-MATRIX.md, BOUNDED-ART-EXPERIMENT.md.*
