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
