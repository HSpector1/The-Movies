# Project: Studio — Character Technical Contract (must be preserved)

> **Status:** the 05I model is **rejected as a production character foundation**; the commission is **substantial
> specialist correction, not a polish pass**; **no production or Studio Lot integration is authorized**. Governing
> ruling: `CHARACTER-ARTIST-HANDOFF-BRIEF.md`.

The specialist corrects the **face and cranial form**, the **hand / wrist / forearm chain**, **body mass and
proportions**, the **weighting**, and the **garment fit**, but **must preserve** the following contracts so the
corrected character drops back into the Project: Studio pipeline unchanged. Any deviation must be explicitly
documented and flagged for owner review.

Where an implementation choice remains open below, the rule is:
**"Specialist proposal required; technical approval required before adoption."**

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

## Rigging and weight painting (contract)

**Influences and normalization**
- **Maximum 4 influences per vertex** on every exported LOD. The current procedural generator uses deterministic
  inverse-distance weighting over **up to 5–6 influences** (`authored05h.py` → `_weights_at(..., K=5/6, P=3.0)`
  across the 22-bone `DEFORM` list), so the specialist must **limit and re-normalize** as part of the weight-paint
  pass. Any request to exceed 4 is a *specialist proposal requiring technical approval before adoption* — it
  changes what the glTF export and the three.js runtime must carry.
- **All vertex weights must be normalized** (per-vertex influence sum = 1.0).
- **No zero-weight or unbound vertices** anywhere on body or garments.
- **Mirrored weights:** the body is symmetric about X; weights should be mirrored across the X axis for the paired
  limb chains so left and right deform identically. **Deliberate left/right asymmetry is permitted only where it
  is required by asymmetric geometry (e.g. the tool belt, the radio) and must be documented** — asymmetry that is
  an accident of hand painting is a defect.

**Joints that must survive the pass**
- **Wrist twist** — forearm twist bones must distribute rotation without candy-wrapper collapse.
- **Elbow** — volume preserved through the full bend in Pickup and Kneeling.
- **Shoulder / clavicle** — no collapse, no underarm sail, no detached sleeve.
- **Hip and knee** — volume preserved through the 90° seated hip crease and the deep one-knee kneel.
- **Finger and hand chain** — palm, thumb and grouped fingers hold volume; this is the chain that failed in 05I.

**Garments**
- Garments are offset shells of the body and inherit body weights; the boot is a weight-inheriting offset shell of
  the foot (this is the mechanism that made target D pass — **do not regress it**).
- Garments and accessories (vest, hat, belt, radio, boots) must **stay anchored** through all six clips.

**No regression**
- No change to the accepted **65-joint skeleton** (names, hierarchy, orientation, scale, rest pose, ground).
- No regression to **accepted animation compatibility** — all six clips must continue to execute and retarget by
  bone name.
- Previously passed targets (notably **boot attachment, target D**) remain passed.

**Required diagnostic captures and reporting**
- **Six-clip deformation validation** — every clip, at human scale, under neutral and runtime light.
- **Weight visualization** where useful (per-bone weight display for the hand/wrist/forearm chain, shoulder, neck).
- **Joint-by-joint failure reporting** — an explicit pass/fail per joint listed above, per clip, rather than a
  single "deforms fine" claim.
- **Export verification** — the delivered GLBs re-validated after export (65 joints retained on every LOD,
  influence cap and normalization intact post-decimation, no unbound vertices introduced by LOD generation).

**Corrective shape keys — support is NOT established**
The export path is `bpy.ops.export_scene.gltf` with `export_skins=True` and `export_animations=False`
(`blender/studio_pipeline/exporter.py`); **no morph-target/shape-key export flag is configured**, and the runtime
path (drei `useGLTF` → `SkeletonUtils.clone` → `THREE.AnimationMixer`) has never been exercised with morph targets
in this repo. **Do not assume shape keys are supported.** If the specialist wants corrective shape keys, that is a
*specialist proposal requiring explicit technical approval before use*. If approved, the proposal must define how
they are **named**, **documented**, **exported**, and **tested** across all six clips and all three LODs before
they may be adopted.

**Existing hand-chain weights — expect replacement**
The hand / wrist / forearm weights are a **known failure** (deterministic inverse-distance skinning on this hand
topology; see `CHARACTER-KNOWN-DEFECTS.md` BLOCKER 2). **Expect to replace them.** They are **not** automatically an
acceptable starting point. For the rest of the body, the specialist must **assess which portions of the existing
weighting are salvageable** and state that assessment as part of the rig-compatibility and weight-paint gates —
reuse is permitted only where the specialist has judged it sound and said so.

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
