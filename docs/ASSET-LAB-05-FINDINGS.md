# Asset Lab 05 — Findings

The real engineering learnings from building the Blender factory headless — the non-obvious things a
successor should not have to rediscover. (Blender **5.2.0 LTS**, macOS, headless.)

## What was proven

- **Blender 5.2 runs a full art pipeline headless** — `bpy` mesh generation, materials, skinning,
  glTF export, structural validation, and rendering (EEVEE ~1.8 s / Cycles CPU ~0.2 s for test scenes)
  all work under `blender --background --factory-startup --python`, driven by npm.
- **The 65-bone UAL Mannequin is the right rig to reuse.** Skinning original bodies to it makes all 43
  CC0 clips play unchanged, verified by measured per-vertex deformation in Blender and by live playback
  in three.js — no retargeting code.
- **A fused-primitive → auto-weight body deforms cleanly** across the clip set, including the stress
  clips (Fixing_Kneeling, PickUp_Table, Sitting). This was the milestone's central risk; it holds.
- **Everything survives glTF export** — constant PBR factors, image maps, one COLOR_0 vertex channel,
  and skin weights — confirmed on the bytes with `@gltf-transform`, not just asserted.
- **The whole factory is fast + deterministic (equivalent-output):** 23 assets (+ LOD1/2 + collision +
  thumbnails + manifest) in ~10 s, seeded-only. Caveat: Blender's voxel-remesh / bone-heat auto-weight
  produce equivalent geometry with the same vertex attributes run-to-run, but the *triangle-index order*
  of the remeshed character meshes can differ, so those GLBs are not always bit-identical across rebuilds
  (the committed copies are the canonical artifacts).

## Gotchas discovered (and fixed)

- **Blender 5.2 API drift:** `Action.fcurves` is gone (slotted actions); the EEVEE render engine enum
  is `BLENDER_EEVEE` (not `BLENDER_EEVEE_NEXT`); the Sky texture's `NISHITA` type is gone (used a
  version-independent gradient world instead). The exporter's flag set drifts between releases — the
  export wrapper filters kwargs to the operator's actual properties.
- **Slotted actions (4.4+):** applying a clip needs `animation_data.action_slot = action.slots[0]`, not
  just `.action =`.
- **Deformed-mesh evaluation needs `view_layer.update()`** before `evaluated_get(...).to_mesh()`, or the
  armature modifier reads stale and the mesh looks static even though the pose bones moved. (This cost a
  real debugging cycle — the pipeline "worked" but showed 0 deformation until the depsgraph was forced.)
- **Vertex-colour export:** `export_vertex_color="ACTIVE"` yields exactly one COLOR_0; combining it with
  `export_all_vertex_colors` duplicates it as COLOR_1, and `"MATERIAL"` mode misses generic Attribute
  nodes. `Col` defaults to white so untinted regions are a no-op multiply.
- **Voxel remesh collapses material slots** to one — so per-region colour must be **vertex colours**
  (which survive), not material slots. This also happens to satisfy the one-material draw-call rule.
- **Blender image rows are bottom-up** — numpy arrays authored top-row-first must be flipped, or the
  painted face texture renders upside down.
- **A face card must sit *outside* the head sphere** or it z-fights / is occluded; and it must be on the
  rig's actual forward axis (**+Y** here, discovered by rendering both sides).
- **`bmesh` vert references go stale** by build-time — capture vertex *indices* at add-time (create-ops
  only append, so indices stay valid) instead of holding `BMVert` refs.
- **Auto-weight + join can leave invalid geometry** — `mesh.validate()` after the join clears the
  "Mesh is not valid" export warning.
- **git can't re-include under a fully-ignored parent** — to commit `public/assets/studio/` we ignore
  `public/assets/*` (contents) and re-include `!public/assets/studio/`.

## Limitations (honest)

- Fidelity is **stylized greybox-plus**, not final art. Bodies are soft/action-figure; the flat-card
  face reads at management distance but is weak at extreme close-up; a few remesh specks survive on some
  characters.
- Only a **representative subset** was built (8 of the 14 designed architecture modules, 9 props, 6
  roles) — enough to prove the factory, not the full catalog.
- **Collision proxies** are convex/box/capsule + low-poly but not universally below the render mesh — a
  thin boom's hull runs ~200 tris and a few already-trivial assets' proxies match/slightly exceed their
  tiny LOD0. Character proxies are **capsules** (not convex hulls) by design. No physics is built (spec
  convention only).
- Performance figures in `proof/lab05/` are from **headless SwiftShader software rendering** — diagnostic
  only, **not** target-hardware acceptance (consistent with Labs 02–04).

## Adversarial verification

Before this was presented, a 7-agent adversarial workflow independently re-checked every headline claim
against the built bytes (not the manifest). It **caught a real honesty defect**: the manifest advertised
`lod1_tris`/`lod2_tris` while the LOD meshes were generated in memory and **discarded** — describing
files that did not exist. Fixed by actually **exporting LOD1/LOD2 GLBs** (46 files) and adding a
validator check that fails on any phantom LOD row. It also produced the wording corrections folded into
this doc (equivalent-output determinism; capsule vs convex collision). The rig/skeleton, live-animation,
scale/budget, isolation, and deterministic-factory claims were confirmed on the bytes.

## Design provenance

The art direction + asset decomposition were locked by a judge-panel workflow (three divergent
crew-character concepts + architecture + props specs → one synthesized spec), preserved verbatim in
[`ASSET-LAB-05-DESIGN-SPEC.json`](ASSET-LAB-05-DESIGN-SPEC.json). The build follows Concept A's identity
with Concept C's deformation architecture (the "hybrid" the judge chose).
