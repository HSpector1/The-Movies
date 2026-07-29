# Asset Lab 05B — Root-Cause Audit

Owner verdict on Lab 05 characters: **REVISE.** Observed: faces on the back/wrong side of heads,
malformed/melted bodies, floating/disconnected feet, unnatural limbs, silhouettes that don't read
as clothed humans, fused/melted clothing, orientation inconsistent with animation direction,
worse than the earlier mannequins.

## Audit method

The §7 A–E audit roles were performed by direct source inspection + empirical Blender probing +
rendering the actual before/after (more reliable than farming to blind subagents for a task this
delicate). Every claim below is grounded in a file/line or a rendered image under
`proof/lab05b/root-cause/`. Two **independent read-only reviewers** (visual + technical) then
adversarially re-checked the iteration-1 result (see ITERATION-LOG).

## Verified root causes

### A. Mesh & anatomy — voxel remesh + island deletion destroyed the body
`blender/studio_pipeline/character.py:223-233` builds overlapping primitives then applies a
**VOXEL remesh** (`voxel_size=0.030`) and decimates to 2300 tris, then
`core.remove_small_islands(min_verts=24)` **deletes** any island under 24 verts.
- Thin features (shoe boxes, mitten hands, hat bill @ 0.015 m) fall below the 0.03 m voxel size,
  fragment, and are **deleted** → **floating/missing feet & hands** (see the rejected thumbnails
  `Char_Grip_Standard.png`, `Char_Director_Standard.png`: feet float well below the legs).
- The remesh **fuses** shirt/vest/coat/apron/belt into one undifferentiated blob → **melted
  clothing**, **balloon joints**, no silhouette.

### B. Clothing — painted, not modeled
`character.py:239-251` clears material slots after remesh and colours the blob by **nearest-bone
vertex regions** (`paint.paint_by_region`). Clothing is *paint on a fused lump*, never geometry →
reads as **painted / half-naked**, exactly as rejected.

### C. Face — authored on the WRONG side, and flat
`character.py:164-195` places a **flat face card** at `y = c.y + 0.145` with the comment *"rig
faces +Y"*. **The rig actually faces −Y** (measured: toes and nose both point −Y). The face was
authored on the **back of the head** the entire time. A flat card is also invisible/edge-on at
profile and 3/4 angles.

### D. Orientation — stacked 180° rotations across four layers
The "front" depended on: face-card-at-+Y → `build_all.py:117 arm.rotation_euler=(0,0,π)` →
glTF `export_yup` → per-worker `rotY` in `studioSlice.tsx`. Any mismatch = face pointing the
wrong way. `capture-lab05.mjs:15` even hard-codes the fragile assumption. This is precisely the
*"undocumented 180° rotations in multiple layers"* the brief forbids.

### E. Rigging — automatic bone-heat on a remeshed blob
`character.py:257` uses `ARMATURE_AUTO` (bone heat) on the fused mesh with no validation, so
deformation was never verified. (Independent of this, the 05B rebuild found and fixed a separate
**vertex-weight aliasing bug** in `SkinnedBuilder` — see below.)

## Repair vs rebuild — **REBUILD**

The construction *method* is the defect; there is nothing to repair. Confirmed by rendering the
existing GLBs' own thumbnails (melted blobs, floating feet).

## Retained / Replaced / Rejected

| Component | Decision | Why |
|-----------|----------|-----|
| `rig.py` canonical rig loader | **RETAINED** | Correct: imports UAL, bakes identity, hands back rest joints. |
| `skinning.py` `SkinnedBuilder` | **RETAINED + FIXED** | Right idea (direct per-bone weights, no remesh). Had a latent index-aliasing bug (weights mapped to wrong verts); fixed to assign on the bmesh **deform layer at add-time** with live BMVerts. |
| `meshgen.py` primitives, `materials.solid`, `exporter.py`, `lod.py`, `anim.py`, `render.py` | **RETAINED** | Sound, reused unchanged. |
| Voxel remesh construction | **REJECTED** | Root cause A/B — destroys thin features, fuses clothing. |
| `remove_small_islands` on characters | **REJECTED** | Deletes legitimate feet/hands. |
| `paint_by_region` clothing | **REJECTED** | Paint ≠ clothing (root cause B). |
| Flat face card @ +Y | **REJECTED** | Wrong side + flat (root cause C). |
| `arm.rotation_euler=(0,0,π)` build hack | **REJECTED** | Stacked-rotation source (root cause D). |

## Selected architecture (05B)

`blender/studio_pipeline/character2.py`: a deliberately authored low-poly humanoid built from
primitives that are **directly skinned** (SkinnedBuilder) to the 65 real UAL bones — NO remesh,
NO island deletion, NO paint. **Segmented-joint blend weighting** (each limb rigid to its bone; a
joint sphere blends the two adjacent bones) — the same scheme the reference mannequin uses, so it
deforms cleanly under all 43 CC0 clips. **Real modeled face geometry** on the measured −Y front.
**Real clothing shells** (garment torso + sleeves, trousers, boots) as distinct materials with
visible collar/cuff/waist/hem boundaries.
