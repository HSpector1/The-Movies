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
  thigh_l/r, calf_l/r, foot_l/r, ball_l/r`. Clips retarget **by bone name** — renaming or reorienting a bone breaks
  all six clips.
- **Exact 65-joint accounting** — verified against the committed rig `public/assets/animation/UAL1_Standard.glb`:

  | Group | Count | Names |
  |---|---:|---|
  | Root | 1 | `root` |
  | Primary deform | 22 | the list above |
  | Finger bones | 40 | `{index,middle,pinky,ring,thumb}_{01,02,03,04_leaf}_{l,r}` — 5 fingers × 4 joints × 2 hands |
  | Toe leaf terminators | 2 | `ball_leaf_l`, `ball_leaf_r` |
  | **Total** | **65** | |

- **The rig contains NO forearm twist bones, NO upper-arm twist bones, and NO articulated toe chain.** `ball_leaf_l/r`
  are terminal leaf joints following `ball_l/r`; they are not an articulated toe chain. **Do not evaluate, preserve,
  or report against joints that do not exist in the committed rig.**

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
- **Maximum 4 influences per vertex on every exported LOD.** This is a **runtime requirement, and the shipped GLBs
  already satisfy it** — every `electric_hero_05*` LOD carries exactly **one `JOINTS_0` / `WEIGHTS_0` set**, which
  is at most four influences per vertex. **The specialist is not being asked to newly impose this limit.**
- **Authoring-side weights differ from exported runtime weights, and that difference matters here.** Verified in the
  generator:
  - **Authored body skinning uses `K=5`** — `authored05h.py` → `_weights_at(..., K=5, P=3.0)` over the 22-bone
    `DEFORM` list.
  - The **`K=6`** call is the **arms-down → T-pose re-pose operation** (`authored05h.py:96`, over the same 22-bone
    `DEFORM` list), **not** ordinary vertex-group assignment. Earlier wording that presented `K=5/6` as one skinning
    setting was inaccurate. *(Note: the `REPOSE_BONES` list at `authored05h.py:28` is **dead code** — it is defined
    and never used; the re-pose call weights over `DEFORM`.)*
  - Newly skinned garment geometry uses **`K=4`** (`authored05i.py` → `_skin_new`).
  - **Blender's glTF exporter silently truncates excess influences and renormalizes the survivors** unless
    explicitly configured otherwise. `blender/studio_pipeline/exporter.py` **does not set `export_all_influences`**,
    so the default four-influence cap applies. Source weights above four are therefore **discarded at export without
    warning**, so **Blender-side weight data may not match the runtime GLB weights**.
  - **This truncation may be materially relevant to the hand / wrist / forearm failure** (`CHARACTER-KNOWN-DEFECTS.md`
    BLOCKER 2): a five-influence authored hand weight becomes a different four-influence runtime weight.
    **Inspect it; do not assume it is harmless.**
- **The task is to author weights that survive the four-influence export correctly** — not to rely on exporter
  truncation to produce a valid result. The specialist must:
  - **inspect both authoring-side and exported runtime weights**;
  - **normalize all retained weights** (per-vertex influence sum = 1.0);
  - **eliminate zero-weight and unbound vertices** anywhere on body or garments;
  - **explicitly test the four-influence runtime result**, not only the Blender viewport;
  - **document any meaningful difference between Blender weights and exported GLB weights**;
  - **validate all six clips after export**, on the exported asset.
- Any request to exceed four runtime influences is a *specialist proposal requiring technical approval before
  adoption* — it changes what the glTF export and the three.js runtime must carry.
- **Mirrored weights:** the body is symmetric about X; weights should be mirrored across the X axis for the paired
  limb chains so left and right deform identically. **Mirrored weights should normally remain symmetrical.**
  Deliberate left/right asymmetry is permitted only where (a) the geometry is **intentionally asymmetric** — e.g.
  the **radio**, a single hip-mounted box rigidly bound to `thigh_r`; (b) an **asymmetric accessory requires
  different attachment behaviour**; or (c) the specialist **documents another evidenced reason**. Asymmetry that is
  an accident of hand painting is a defect.

  > **Check the radio's side before refitting it.** In this rig the character's **right is −X** (`thigh_r` at
  > x = −0.089, `thigh_l` at x = +0.089), but the radio box is authored at **x = +0.17** — the character's **left**
  > hip — while being bound to **`thigh_r`**. This is recorded as an **observation from the committed source**, not
  > as a graded defect; **it is not in scope for this handoff to resolve**, and changing the radio's side or binding
  > requires owner direction. Under mechanism 3 below, confirm the intended side and parent bone before refitting.
  *(The tool belt is **not** an example of asymmetry: it is a symmetric 28-box ring about X, rigidly bound to
  `pelvis` at weight 1.0, so it cannot carry asymmetric weights at all.)*

**Joints that must survive the pass**
- **Forearm and wrist rotation** — distribute the weight gradient through the **existing `lowerarm_l/r` and
  `hand_l/r` chain** so wrist rotation does not create candy-wrapper collapse, hard pinching, tendrils, or visible
  volume loss. **No twist bones currently exist**, and **adding twist bones is not authorized by this handoff**. A
  proposed skeleton change requires a **separate technical proposal, a compatibility analysis, and explicit
  technical approval before adoption**. **The default task is to correct topology and weights on the existing
  skeleton.** Deliver **per-clip evidence for the existing lowerarm-to-hand chain** (all six clips).
- **Elbow** — volume preserved through the full bend in Pickup and Kneeling.
- **Shoulder / clavicle** — no collapse, no underarm sail, no detached sleeve.
- **Hip and knee** — volume preserved through the 90° seated hip crease and the deep one-knee kneel.
- **Finger and hand chain** — palm, thumb and grouped fingers hold volume; this is the chain that failed in 05I.

**Garments — three distinct mechanisms (do not treat them as one)**

Garments are **not** all offset shells. The current 05I model uses **three** verified attachment mechanisms, and each
carries a different contract expectation:

| # | Mechanism | Current pieces (verified in `authored05i.py`) | Weights |
|---|---|---|---|
| 1 | **Offset shell / body-derived** — a duplicate of the body region pushed along its normals | shirt, trousers, **boots** (per-side shells of `foot_*`+`ball_*`) | **Inherited** from the body |
| 2 | **Newly constructed geometry, freshly skinned over a restricted bone subset** (`_skin_new`, `K=4`) | **vest** (arc-loft shell over `spine_01/02/03`, `neck_01`, `clavicle_l/r`), **reflective bands ×2** (over `spine_01/02/03`) | **Independently authored — NOT inherited** |
| 3 | **Rigid single-bone parenting** (`_rigid_piece`, weight 1.0) | **belt** → `pelvis`, **radio** → `thigh_r`, **hard hat** → `Head` | Single bone, weight 1.0 |

- **Mechanism 1 — offset shells:** preserve alignment with the body beneath; correct clipping and deformation;
  **validate inherited weights after export.** The boot is the weight-inheriting offset shell that made **target D
  pass — do not regress it.**
- **Mechanism 2 — newly skinned geometry:** perform an **independent weight review**. **Do not assume body weights
  are inherited — they are not.** Validate across **all six clips**. **The vest is a major garment and must not be
  treated as an offset shell**; it was rebuilt in 05I precisely because the earlier offset-shell vest fragmented.
- **Mechanism 3 — rigid attachments:** preserve the intended attachment; prevent floating, penetration, or incorrect
  orientation; validate against the **appropriate parent bone**.
- **Every** garment and accessory — shirt, trousers, boots, vest, reflective bands, belt, radio and hat, across all
  three mechanisms — must **stay anchored** through all six clips.
- **Hair is authored but does not ship in 05I.** `authored05i.py` builds a hair offset shell, but its trim culls it
  to nothing and it is **absent from the shipped GLB** — `electric_hero_05i.glb` carries 11 materials with **no
  hair material** (05H did ship `mat_h_hair`). **Do not expect to receive hair geometry**, and do not treat its
  absence as something the specialist removed. Whether 05I ships without hair or hair is re-authored is an
  **owner decision**, not an assumption for this handoff.
- If the specialist changes a piece's mechanism, that change must be **explicitly documented and flagged for owner
  review**.

**No regression**
- No change to the accepted **65-joint skeleton** (names, hierarchy, orientation, scale, rest pose, ground).
  **No bone may be added, removed, renamed, or reoriented — silently or otherwise.** The joint count must remain
  exactly 65 on every exported LOD.
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
  LOD0 **22,856** tris · LOD1 **10,285** · LOD2 **4,570**. LOD0 budget ≤ 26,000 (authored base + all garment and
  accessory geometry, across all three mechanisms).
- The base body is a continuous, all-quad CC0 cage (~12,502 verts) welded from the source (see
  `CHARACTER-SOURCE-AND-PROVENANCE.md`). Preserve continuous body topology where practical.
- **Topology order matters for the offset-shell garments** (mechanism 1 above — shirt, trousers, boots — which
  are derived from the body's own vertices and inherit its weights). If the artist retopos the hands/face, they must
  (a) keep the skeleton binding valid and (b) document the change so the garment generator can be re-fitted or the
  garments re-authored by hand. The **vest and reflective bands (mechanism 2) are independent geometry** and do not
  follow body topology order — they are refitted and re-skinned on their own terms; the **belt, radio and hat
  (mechanism 3)** are rigidly bound and only need their parent bone and placement re-checked.

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
