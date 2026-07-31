# Authored Base Character Standard (Asset Lab 05H)

How a professionally authored CC0 base mesh becomes a Project: Studio character. Implemented in
`blender/studio_pipeline/authored05h.py`; orchestrated by `build_hero_05h.py` (review render)
and `build_hero_export_05h.py` (LOD export). Deterministic (seeded/geometry math only).

## Pipeline
1. **Provenance gate** — only a verified CC0/public-domain base mesh (PROVENANCE.json). Geometry
   only; never an external rig, clip, texture, hair, or garment.
2. **Import + weld** — glTF splits verts at normal/UV seams; weld (`remove_doubles`, 1e-4) back
   to the authored quad cage (12,502 verts / 12,500 quads here).
3. **Align** — uniform-scale to ~1.75 m, ground (min z = 0), centre X.
4. **Re-pose arms-down → T** — the base rests arms-down; the armature rests T-pose. Use SMOOTH
   linear-blend re-posing: a continuous, inverse-distance arm weight drives a *smoothstepped*
   rotation about each shoulder, so the arm rotates rigidly to horizontal while legs/torso stay
   put and the shoulder crease fairs smoothly (no armpit sail). Bone-heat weighting is NOT used
   (it fails headless when T-pose arm bones sit outside the arms-down geometry).
5. **Skin** — deterministic inverse-distance weights (k=5, p=3) to the ~23 deform-bone segments;
   one vertex group per deform bone; Armature modifier bound to the full 65-bone rig.
6. **Validate** — 65 joints, face −Y, height ∈ [1.70,1.95], grounded, no stray island.
7. **LOD + export** — Decimate LOD0/1/2, capsule collision, +Y GLB, manifest.

## Rules
- The final character binds to the approved 65-bone skeleton; no second skeleton is exported.
- All non-body content (workwear, hands finishing, boots, hat, materials) is authored by Studio.
- Every constant that has a name lives in `config`/the module head, never inlined.
