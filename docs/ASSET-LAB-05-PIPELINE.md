# Asset Lab 05 — The Blender Production Pipeline

A headless, deterministic, repeatable art factory. Everything is authored **procedurally in
Python** (`bpy`) — no hand-modelling — so the whole asset set regenerates from committed source
with one command. Convention throughout: **1 Blender unit = 1 metre**, 1.8 m adult reference,
**+Y up** on glTF export (mirrors the lab README and the frozen 3D spike).

## Requirements

- **Blender 5.2.0 LTS** at `/Applications/Blender.app` (override with `BLENDER=/path/to/Blender`).
- Node + the repo's `node_modules` (for GLB validation via `@gltf-transform`).
- The CC0 animation source present at `public/assets/animation/UAL1_Standard.glb` (the canonical rig + 43 clips).

## Commands (npm — the repo convention)

| Command | Does |
|---|---|
| `npm run blender:build` | Build **all** families → LOD + collision → export GLB → validate → thumbnail → write `manifests/studio-assets.json`. |
| `npm run blender:characters` / `:architecture` / `:props` | Build one family only (`build_all.py --only <family>`). |
| `npm run blender:hero` | Assemble + export the Scene-G hero SET GLB (`public/assets/studio/scenes/studio_hero_set.glb`). |
| `npm run blender:library` | Build the Asset Browser library (`blender/libraries/studio_assets.blend`). |
| `npm run blender:validate` | Independent Node re-validation of every exported GLB against the manifest (`tools/validate-studio.mjs`). |
| `npm run blender:factory` | `build` → `hero` → `library` → `validate` (the whole factory). |
| `npm run shots:lab05` | Capture Scene G evidence PNGs (needs `npm run preview` on :4320). |

`npm run blender:*` shells to Blender headless through `tools/blender-run.mjs` (the binary path has
spaces, so it spawns directly rather than via a shell string).

## Project structure

```
blender/
  build_all.py            # orchestrator: build → LOD → collision → export → validate → thumbnail → manifest
  make_hero_scene.py      # assemble + export the Scene-G hero SET GLB
  make_library.py         # mark/catalog every asset → studio_assets.blend (Asset Browser)
  libraries/              # committed: studio_assets.blend + blender_assets.cats.txt
  out/                    # (gitignored) scratch .blend
  studio_pipeline/        # the importable pipeline package
    config.py             # TUNING-equivalent: paths, scale, 65-bone list, tri budgets, LOD ratios, palette, export flags
    core.py               # scene reset, collections, transforms, triangle_count, world_bounds, island cleanup
    meshgen.py            # MeshBuilder (bmesh primitives w/ placement matrix + material index) + box-UV projector
    materials.py          # export-safe PBR (solid / vcol / textured) + numpy tileable maps + procedural face texture
    paint.py              # vertex-colour helpers: fill / by_height / noise_tint / paint_by_region / tint_slots
    rig.py                # load canonical UAL armature, bake to identity, expose rest-pose joints
    skinning.py           # SkinnedBuilder + bind (rigid/blended weighting to the rig)
    anim.py               # apply CC0 action (slotted-action aware), sample/measure deformation
    lod.py                # generate_lods (decimate collapse, weight-preserving) + collision_proxy (capsule/box/hull)
    validate.py           # Blender-side structural checks (scale/tris/bone-compat/materials)
    render.py             # warm golden-hour rig + AgX + auto-framing thumbnails/hero shots
    architecture.py       # the modular kit + soundstage assembler
    props.py              # the production props
    character.py          # the crew character system (roles as data)
```

## The build, step by step (`build_all.py`)

For every asset: **build geometry → `generate_lods` (LOD0/1/2) → `collision_proxy` → `export_glb`
(LOD0 + `_LOD1` + `_LOD2` + `_COL`) → `validate.check_asset` → render a thumbnail → append a manifest
row.** Characters run one-per-scene (each loads a fresh rig); architecture and props build in one scene
and are isolated per-thumbnail. Outputs:

- `public/assets/studio/{characters,architecture,props}/<Name>.glb` + `_LOD1.glb` + `_LOD2.glb` + `_COL.glb`
- `public/assets/studio/scenes/studio_hero_set.glb`
- `public/assets/studio/textures/*.png` (shared tileable + face maps)
- `proof/lab05/thumbnails/<Name>.png`
- `manifests/studio-assets.json` (+ served copy `public/studio-assets.json`)

## Export fidelity (glTF is narrow — everything here survives it)

glTF only carries the metallic-roughness model, so `exporter.export_glb` (one wrapper, version-tolerant
kwarg filtering) exports only export-safe things: constant PBR factors, **image maps** (base/rough/normal),
one **COLOR_0** vertex attribute (`export_vertex_color="ACTIVE"` — the empirically-correct setting that
yields exactly one attribute), and **JOINTS_0/WEIGHTS_0** skin data. Confirmed on the bytes with
`@gltf-transform` (see `tools/validate-studio.mjs`).

## Determinism

Seeded RNG only (`numpy.random.default_rng(fixed_seed)`); no `Math.random`, no argless `Date`, no time-
or machine-dependent inputs. Same inputs → same GLBs. `public/assets/studio/**` is committed (assets are
100% original / owner-owned) so the vertical slice runs on a fresh checkout without Blender; it also
regenerates exactly via `npm run blender:factory`.

## Regenerating from scratch

```bash
cd "/Users/bruce/Project Studio - Asset Lab"
npm install
npm run blender:factory     # build + hero + library + validate  (~15 s headless)
npm run build && npm run preview   # then open http://localhost:4320  (boots on Scene G)
```
