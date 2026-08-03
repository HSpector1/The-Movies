# Project: Studio — Character Technical Contract (must be preserved)

The specialist may correct the face, hands, and minor finishing, but **must preserve** the following contracts so the
corrected character drops back into the Project: Studio pipeline unchanged. Any deviation must be explicitly
documented and flagged for owner review.

## Skeleton (hard contract)
- **65 joints exactly.** `blender/studio_pipeline/config.py` → `RIG_BONE_COUNT = 65`; validators assert it.
- Source skeleton = the Quaternius **UAL Mannequin** rig imported from `public/assets/animation/UAL1_Standard.glb`
  (`config.RIG_SOURCE_GLB`). The character is skinned to THIS skeleton by bone name.
- **Bone names, hierarchy, orientation, scale, and rest pose must not change.** The 22 primary deform bones are:
  `pelvis, spine_01, spine_02, spine_03, neck_01, Head, clavicle_l/r, upperarm_l/r, lowerarm_l/r, hand_l/r,
  thigh_l/r, calf_l/r, foot_l/r, ball_l/r` (the remaining joints of the 65 are finger/toe/twist bones from the UAL
  rig). Clips retarget **by bone name** — renaming or reorienting a bone breaks all six clips.

## Orientation, scale, ground (hard contract)
- **1 unit = 1 metre.** Character height ≈ 1.75–1.85 m (validator range [1.70, 1.95]).
- **Faces −Y** in Blender (front of the head/body on −Y); exports **+Y-up glTF**. Validators check the head verts
  average to −Y and the feet are grounded (min z ∈ [−0.06, 0.15]).
- Centered on X; grounded at z ≈ 0.

## Animation (hard contract)
- Six accepted clips, retargeted from the shared library `public/assets/animation/UAL1_Standard.glb`:
  `Idle_Loop, Walk_Loop, Idle_Talking_Loop, Fixing_Kneeling, PickUp_Table, Sitting_Idle_Loop`.
- Clips are **not** embedded in the character GLB (the hero exports rest-pose only, `export_animations=False`); the
  runtime binds the character mesh + the clip library by bone name via a `THREE.AnimationMixer`.
- **Do not introduce new clips or a new animation library.** The corrected mesh must deform correctly under these six.

## Mesh / topology / LOD
- **LOD0 / LOD1 / LOD2** GLBs required, each retaining the full 65-joint skeleton. Current counts (05I Iter 2):
  LOD0 **22,856** tris · LOD1 **10,285** · LOD2 **4,570**. LOD0 budget ≤ 26,000 (authored base + garment shells).
- The base body is a continuous, all-quad CC0 cage (~12,502 verts) welded from the source (see
  `CHARACTER-SOURCE-AND-PROVENANCE.md`). Preserve continuous body topology where practical.
- **Topology order matters for the procedural garments** (they are offset shells of the body). If the artist retopos
  the hands/face, they must (a) keep the skeleton binding valid and (b) document the change so the garment generator
  can be re-fitted or the garments re-authored by hand.

## Materials (contract)
- Separate garment identity via distinct material slots. Current slots (from the shipped GLB):
  `mat_authored_skin #e8b58f (warm tan skin — CORRECT, do not tint to hide a garment problem)`,
  `mat_i_shirt #475c75`, `mat_i_trousers #47474d`, `mat_i_boots #38261a`, `mat_i_vest #f29e1c (hi-viz)`,
  `mat_i_hiviz #ededdb (reflective bands)`, `mat_i_belt #4d301f`, `mat_i_radio #2e3036`, `mat_i_hat #e5941a`.
- All three LODs must carry consistent material assignments (a validator/reviewer checks for LOD material swaps).

## Runtime compatibility
- The character loads via drei `useGLTF` from `public/assets/studio/characters/electric_hero_*.glb`, is cloned with
  `SkeletonUtils.clone`, and animated by binding the shared clip GLB. Keep the GLB self-contained (embedded
  textures/materials), +Y-up, single skinned mesh + armature per LOD.
- Stylization target: **management-game stylized**, not photoreal.

## Provenance (contract)
- The CC0 provenance chain (Blender Studio Human Base Meshes, CC0-1.0) must be preserved; see
  `CHARACTER-SOURCE-AND-PROVENANCE.md`. If the artist introduces new geometry, its license/provenance must be
  documented and must be commit-safe (CC0 or owner-owned).
