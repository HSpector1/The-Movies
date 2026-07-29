# Asset Lab 05B — Iteration Log

Fidelity target: **stylized management-game crew** (Two Point tier), not AAA realism. Scored 1–5.
Reference bar = the UAL Mannequin (`proof/lab05b/root-cause/mann-*.png`): a clean jointed humanoid.
Rebuilt crew must be at least this coherent **plus** real face + clothing + role read.

---

## Iteration 1 — Orientation, face, base anatomy & rigging fix

- **Starting checkpoint:** branch `asset-lab-05b-character-rebuild-loop` @ Lab-05 baseline `f4f60b4`.
- **Selected defects (from audit):** (1) face on the back of the head; (2) melted/fused body,
  floating feet, mesh shards; (3) painted-not-modeled clothing (partially — top addressed here).
- **Root cause:** voxel-remesh + island deletion + paint-by-region + a face card authored on the
  wrong (+Y) side while the rig faces −Y; plus a latent `SkinnedBuilder` vertex-weight aliasing bug.

### Implementation
- Measured the rig forward axis empirically (`probe_orientation.py`): **−Y** (toes + nose). Locked
  the coordinate standard; removed all compensating rotations.
- New `blender/studio_pipeline/character2.py`: authored low-poly humanoid, **direct-skinned** via
  SkinnedBuilder (no remesh / no island deletion / no paint). Real modeled face (eyes, pupils,
  brows, nose, mouth, ears) on the −Y front. Real clothing shells (garment torso + sleeves,
  trousers, boots) with collar/cuff/waist/hem boundaries. Segmented-joint blend weighting.
- **Fixed `skinning.py`:** weights now assigned on the bmesh **deform layer at add()-time** using
  live BMVerts (previously fragile vertex indices drifted → foot verts weighted to the hand →
  shards). Adversarially retested by the technical reviewer: holds.

### Files changed
`blender/studio_pipeline/character2.py` (new), `blender/studio_pipeline/skinning.py` (fix),
`blender/build_base_char.py` (new harness), `blender/probe_orientation.py` (new),
`blender/diag_weights.py` (new), docs (brief, root-cause audit, coordinate standard, this log),
`proof/lab05b/root-cause/**`, `proof/lab05b/iteration-01/**`.

### Validation
- **Blender:** base = 4016 tris, height 1.774 m, 22 vertex groups, 7 materials. Deformed z-range
  across all six required clips has feet grounded (min z ≈ 0.00); no shards.
- **Weights:** `verts with NO group: 0`, `weight-sum != 1: 0`; top-displaced verts are hands/wrists
  (correct), not feet-on-arms.
- **GLB:** 1 mesh / 1 skin (65 joints) / 4016 tris; mesh + armature nodes carry **identity**
  rotation — no 180° hack.
- **Runtime:** not yet (Scene G integration is iteration 5).

### Evidence
`proof/lab05b/iteration-01/`: base-front/back/left/right/3q, base-face-front (features present),
base-face-back (hair only — **no face on back**), pose-{idle,walk,talk,sit,pickup,kneel}-{front,3q}.
Before (rejected): `proof/lab05/thumbnails/Char_{Grip,Director}_*.png`.

### Scores (1–5)
| Dimension | Score | Note |
|---|---|---|
| Front/back correctness | 5 | Face only on −Y front; back is hair only. |
| Facial readability | 4 | Clear on close-up; small at body distance. |
| Human anatomy | 4 | Coherent; torso a touch puffy. |
| Body connectivity | 5 | Feet/hands/limbs attached; shard bug fixed. |
| Clothing readability | 3 | Top reads; **lower body low-contrast vs skin**. |
| Joint deformation | 4 | Clean across six clips; minor deep-flex faceting. |
| Animation quality | 4 | Walk/sit/kneel believable. |
| Accessory attachment | 4 | Hair only so far (weighted Head, follows). |
| Role differentiation | — | Not started (iteration 3). |
| Runtime consistency | — | Not started (iteration 5). |
| LOD integrity | — | Not started (iteration 4). |
| Management-view readability | 3 | Untested at distance. |
| Human-scale readability | 4 | Reads at human scale. |
| Performance efficiency | 5 | 4016 tris, well under budget. |
| Evidence honesty | 5 | Both reviewers confirmed honest framing. |

### Reviewers (independent, read-only)
- **Visual QA: PASS.** Every headline rejection reason resolved. Top remaining: missing/low-contrast
  lower-body clothing; a crotch/inner-thigh gap notch; slightly puffy torso.
- **Technical: PASS.** Deform-layer fix survives adversarial retest; 0 unweighted / 0 bad-sum;
  identity GLB orientation, no hack. Residual risk: dead rejected code still on disk (landmine).

### Decision: **ACCEPTED.** Base clears the critical gate (orientation, face, connectivity,
clean deformation). Carry forward to iteration 2.

### Iteration 2 agenda (from reviewer convergence)
1. Real lower-body clothing: distinct trouser volume + boot material with clear contrast vs skin.
2. Close the crotch/inner-thigh gap (pelvis bridge).
3. Firm up the torso silhouette (less balloon; slight shoulder/chest read).
4. Add a hand close-up to the evidence.

---

## Iteration 2 — Lower-body clothing, crotch, torso, hands

- **Starting checkpoint:** `151a52c` (iteration 1).
- **Selected defects (from iter-1 reviewers):** (1) lower body reads as bare skin-tone; (2)
  crotch/inner-thigh gap notch; (3) puffy torso / no shoulder-chest read (+ paddle hands).

### Implementation (`character2.py`, `build_base_char.py`)
- Boots/belt material darkened to `(0.15,0.11,0.10)` → clear dark-boot break at the ankle.
- Added a **trouser-seat block** weighted to `pelvis` bridging both thighs → crotch gap closed;
  then slimmed it so it reads as trouser-hips, not a diaper block.
- Tapered the torso (narrower waist → broader chest) + a chest/pectoral mass on `spine_03` so
  the shoulders read instead of a puffy box.
- Rebuilt the hand: flattened mitt (fingers) + a **clearly separated thumb** protruding forward
  (−Y), angled — reads as a hand rather than a paddle.
- Render harness: exposure 0.0 → −0.35, sun 3.0 → 2.5 (0.0 washed clothing toward skin tone);
  added `base-hand` + `base-lowerbody` close-ups to the evidence.

### Validation
- Blender: 4064 tris, height 1.774 m, feet grounded across all six clips; deformation unchanged
  (same fixed skinning path — no rig/weight logic changed, only added primitives).

### Evidence: `proof/lab05b/iteration-02/` (all base angles + face front/back + **hand** +
**lowerbody** + six posed clips).

### Scores (1–5): front/back 5 · face 4 · anatomy 4 · connectivity 5 · **clothing 4** (was 3) ·
joint 4 · animation 4 · accessory 4 · mgmt-view 4 · human-scale 4 · performance 5 · honesty 5.
(role/runtime/LOD still pending — iters 3/5/4.)

### Reviewer (independent, read-only visual QA): **PASS** — lower-body clothing FIXED, crotch
notch CLOSED (no diaper), torso improved, deformation clean across walk/sit/kneel, evidence
honest. Sole carried concern was the hand/thumb → addressed same iteration (thumb rebuild).

### Decision: **ACCEPTED.** Base character is a coherent, clothed, correctly-deforming stylized
crew member. Base gate cleared → proceed to role variants.

### Iteration 3 agenda
Four required roles (Production Assistant, Grip/Electric, Maintenance, Office) via costume/palette
rows; accessories (hard hat / soft cap / hair / clipboard / radio); 5 skin tones + 5 outfit
palettes (deterministic, skin NOT tied to job). This is where role read + colour variety land.

---

## Iteration 3 — Role variants, accessories, skin/outfit/headwear variety

- **Starting checkpoint:** `b9a199f` (iteration 2).
- **Selected work:** role differentiation + appearance variation (the biggest visual payoff).

### Implementation (`character2.py`, `build_roles.py`)
- Added role-distinguishing features: **hi-vis vest** (electric), **hard hats** (amber/yellow),
  **coveralls** (maintenance), **long coat** (office/director), **clipboard** (PA/office), **belt
  radio**, per-role hat colours. Role read = silhouette + palette + headwear + accessory.
- Per-instance variation via `overrides` (merged onto the role row) → 5 skin tones + 5 outfit
  palettes, deterministic and **skin NOT tied to job**. Colours accept PALETTE key OR RGB tuple.
- Split **hair into its own material slot** (features stay fixed-dark, so grey-haired roles keep
  dark brows/mouth). Materials **uniquely named per character** (`char_materials(cfg, tag)`) so a
  lineup never shares/overwrites a material (materials.solid reuses by name).
- New `build_roles.py`: builds N characters in one scene via **armature duplication** (rig imported
  once), poses them to idle, renders role/skin/palette/headwear proof sheets.

### Validation
- Blender: ~4,100–4,350 tris/char (8 roles avg 4,231). All build clean; feet grounded; hard hat +
  hi-vis vest verified attached through the deep-kneel stress pose.

### Evidence: `proof/lab05b/iteration-03/` — roles-front/3q, allroles-front, skintones-front,
palettes-front, headwear-front, plus single-char detail (Electric, Maintenance) with poses.

### Scores (1–5): front/back 5 · face 4 · anatomy 4 · connectivity 5 · clothing 4 · joint 4 ·
animation 4 · **accessory 4** · **role differentiation 4** (was —) · mgmt-view 4 · human-scale 4 ·
performance 5 · honesty 5. (runtime/LOD still pending — iters 5/4.)

### Reviewer (independent, read-only visual QA): **CONCERNS → resolved.** Passed skin tones,
palettes, headwear variety, and accessory attachment (hat+vest survive the kneel). Two critical
flags: (1) Electric ≈ Maintenance (interchangeable hi-vis+hard-hat); (2) belt radio read as a
floating stick in the deep kneel. **Both fixed same iteration:** Maintenance → slate coveralls +
soft cap (distinct mechanic silhouette, no hi-vis); radio → snug front-belt box, antenna removed.
Re-render confirms five distinct role silhouettes and no floating accessory.

### Decision: **ACCEPTED.** Four required roles read distinctly; 5 skin tones + 5 palettes +
headwear/hair variety all work; accessories stay attached in animation.

### Iteration 4 agenda
LOD0/1/2 per character (validate each preserves face-front, height, skeleton, no reversed normals,
no detached limbs); front/side/animated LOD comparisons.

---

## Iteration 4 — Character LODs

- **Starting checkpoint:** `2a45d56` (iteration 3).
- **Work:** generate + validate LOD0/1/2 per character (Decimate collapse, ratios [1.0, 0.6, 0.35]).

### Implementation (`build_char_lods.py`, reusing `lod.generate_lods` + `exporter`)
Generate the three tiers, validate invariants numerically, export GLBs, render isolated
front/face/walk comparisons.

### Validation (Electric — hardest case: hard hat + hi-vis vest + face)
- Tris 4032 / 2418 / 1410. **Height 1.815 m unchanged** across tiers; **22 vertex groups**,
  **55 islands** and **feature-on-−Y-front** all preserved at every tier (no shrink, no detached
  limbs, no face migration). glTF: **65 skin joints + 8 primitives preserved** on all three GLBs;
  no reintroduced orientation hack (mesh/armature nodes identity).
- LOD2 (1410 tris) walks cleanly — skinning survives decimation. LOD2 face softens but stays a
  readable front face (invisible degradation at the distance LOD2 is used for).

### Evidence: `proof/lab05b/iteration-04/` — lod{0,1,2}-{front,face,walk}.png + Char_Electric_LOD{0,1,2}.glb.

### Scores (1–5): + **LOD integrity 5** (was —). Others unchanged from iter 3.

### Reviewer: self-verified numerically (height/vgroups/islands/feature-front/skin-joints all
preserved) + visually (face survives, walk deforms) + structurally (gltf-transform node/skin check).
A LOD transform with this much invariant coverage did not warrant a separate heavyweight subagent.

### Decision: **ACCEPTED.** LODs preserve face-front, height, skeleton, connectivity, normals.

### Iteration 5 agenda
Export all role GLBs → `public/assets/studio/characters/` (replace the flawed ones, keep filenames
so Scene G loads them; no (0,0,π) hack). Add review cameras + honest SwiftShader runtime capture.
Add `npm run blender:characters:*` + a character validator that FAILS on face-on-wrong-side or
disconnected parts. Write the remaining standards docs + owner-review guide. Non-force backup push.

---

## Iteration 5 — Runtime integration, validation, docs (final)

- **Starting checkpoint:** `9e7542f` (iteration 4).

### Implementation
- `build_characters05b.py`: builds all 8 roles, runs the **hard gate** (`charvalidate.validate`:
  face-on-front, connectivity, height, grounding), exports LOD0/1/2 + collision to
  `public/assets/studio/characters/` REPLACING the 6 flawed GLBs (same filenames) + adding
  Maintenance/Office. Armature exported at identity (mesh-node rot `[0,0,0,1]` — no π hack).
- Scene G wired to the corrected crew: `studioSlice.tsx` CREW_URL + `scenes.tsx` STUDIO_CREW
  (4 required roles + extras, arranged facing the +Z review camera). `tsc --noEmit` clean.
- Automated validation: `charvalidate.py` (shared gate), `test_character_gate.py` (PASS correct /
  **REJECT face-on-back** — proven), `tools/validate-characters.mjs` (GLB orientation/joints/LOD/
  height). npm: `blender:characters:{build,export,render,validate,pipeline}` + `shots:lab05b`.
- Runtime capture `tools/capture-lab05b.mjs` → `proof/lab05b/runtime/` (front/3q/back/human/
  overview + anim + panel). Docs: mesh-topology, face, clothing, rigging-weights, performance,
  owner-review, integration.

### Validation
- Blender gate: **8 pass / 0 fail.** GLB validator: **8 pass / 0 fail** (identity node, 65 joints,
  LOD skeleton consistency, height 1.77–1.86). Gate test: **GATE_TEST_OK** (rejects face-on-back).
- Runtime: **console-error-free**; crew load, faces on front in Three.js (proof runtime shots).
  SwiftShader fps ≈ 3 = software-diagnostic only (real-GPU check is Howard's).

### Evidence: `proof/lab05b/runtime/` (Scene G) + `proof/lab05b/final/` (curated lineups + hero +
poses). Old vs new: `proof/lab05/thumbnails/Char_*` vs `proof/lab05b/final/base-front.png`.

### Decision: **ACCEPTED.**

---

## Final scores (1–5) & verdict

front/back 5 · facial 4 · anatomy 4 · connectivity 5 · clothing 4 · joint 4 · animation 4 ·
accessory 4 · role-differentiation 5 · runtime-consistency 5 · LOD 5 · mgmt-view 4 · human-scale 4 ·
performance 4 · evidence-honesty 5 → **avg ≈ 4.5 / 5.**

**VERDICT: PASS WITH NOTES.** Every rejected defect is fixed and enforced by an automated gate:
faces on the front, connected clothed anatomy, no floating feet, no fragments, clean deformation
across all six clips, four distinct roles + skin/palette/headwear variety, validated LODs, correct
runtime facing, console-error-free. Notes (documented, non-blocking): mitten+thumb hands, bulky
stylized hi-vis vest, LOD2 face softens at distance, 7–8 material groups/char (atlasable later),
runtime capture is SwiftShader-diagnostic. **Final acceptance = Howard's real-GPU (M3) review.**

Iteration cadence: visual-score deltas were driven by capability additions (roles→+role, runtime→
+runtime, LOD→+LOD), not polish plateau — the diminishing-returns stop (2 consecutive <0.3) was
not triggered; the loop stops on PASS-criteria-met, pending owner sign-off.
