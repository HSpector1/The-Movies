# Asset Lab 05G — Hero Electric Surgical Correction — FINAL REPORT

**Milestone:** Asset Lab 05G (additive surgical correction of the 05F Electric hero)
**Branch:** `asset-lab-05g-hero-electric-surgical-correction`
**Cut from:** 05F `80e8b36` (accepted, byte-identical baseline preserved)
**Verdict:** **PASS WITH NOTES** → owner real-GPU (Apple M3) review

---

## 1. What this milestone was

The owner reviewed the 05F Electric hero on real hardware and ruled `ASSET LAB 05F — REVISE`.
05F clearly exceeded the 05E worker, but three rejection-level defects remained:

1. **Pointed shoulder wedges** (detached deltoid fins; a sleeve that did not join the torso).
2. **A bulky chest-pod vest** (excessive rib-cage projection, wide opening, weak side wrap).
3. **Mechanical front and rear pelvis attachments** (a front crotch box, a rear belt shelf, a diaper read).

05G is a **narrow surgical correction of only those three regions**. It is a NEW additive hero
(`electric_hero_05g*.glb`); the 05F hero and all 05E assets are byte-identical. No broad rebuild, no
new skeleton, no new animation library, no new dependencies, no external assets, no propagation to the
other seven roles.

## 2. How it was built

The 05G hero (`blender/studio_pipeline/character_hero_05g.py`) starts as a byte-identical copy of the
accepted 05F hero and is corrected only where gated by the `CORRECT_05G` flags (`shoulder`, `vest`,
`pelvis`). With all three flags off the build is byte-identical to 05F — that is the "before" baseline
in `proof/lab05g/baseline/`. Each iteration flipped exactly one flag so the before/after is provable in
git and in the renders.

Every iteration ran: edit → Blender build → look → **independent read-only reviewer panel** on the
actual renders → score → accept/commit. Only the lead edited files; reviewers were read-only. Renders
are neutral-lit Blender EEVEE (honest, slightly under-exposed, no distance-hiding), with the accepted
05F hero on the LEFT and the 05G correction on the RIGHT at identical pose/scale/lighting/camera.

## 3. Result per region

| Region | Owner 05F defect | 05G correction | Panel verdict |
|---|---|---|---|
| **Shoulders** | pointed wedges / detached deltoid fins / sleeve not joined | flattened rounded **deltoid cap** (weighted upperarm+clavicle+spine_03) welds torso→sleeve; neck-side fillet closes the trapezius notch | A/C/D unanimous **PASS WITH NOTES**, 0 must-fix, exceeds05F |
| **Vest** | two padded chest pods, projection, wide opening, weak wrap | **thin fitted shell**: opening 0.38→0.22 rad, rx/ry pulled to ~0.5 cm proud (hugs ribs), graduated hem clearance, thin restrained bands | B/D **PASS WITH NOTES**; C REVISE (seated shirt-clip) → **fixed + re-verified PASS** |
| **Pelvis** | front crotch box, rear belt shelf, diaper, hip shelf | **narrowed hip loft** (hips taper into thighs), **tucked crotch gusset**, **slim hugging belt**, one small side radio | A/C/D unanimous **PASS WITH NOTES**, 0 must-fix, exceeds05F |

## 4. Iterations

Three accepted iterations, one commit each, cleanly separated:

- `4005e26` — Iteration 1: integrate hero shoulders and sleeves
- `2de8aef` — Iteration 2: rebuild thin fitted safety vest
- `f011ef0` — Iteration 3: finish hero pelvis belt and trousers

No rejected experiments were committed. No iterations were squashed. Stop reason: **all three iterations
complete** (STOP-PASS-level), no regressions, no new skeleton/animation/external-asset needed.

## 5. Geometry, LODs, performance

- **LOD0/1/2 = 10,928 / 6,010 / 3,278 tris** (monotonic; LOD0 well under the 18,000 budget).
- Height **1.819 m**, **65-joint** UAL skeleton preserved across all LODs, **9 materials** (no increase).
- All six accepted clips valid (Idle, Walk, Idle_Talking, Sitting, PickUp_Table, Fixing_Kneeling);
  deform verified clean in every clip including the seated/kneel compression that first exposed the
  vest clip.
- Runtime: 26/26 comparison views load **console-error-free** in the R3F Scene-G harness.
  Headless SwiftShader FPS (7–8) is **software-raster diagnostic only** — draw calls 39, tris/frame
  ~41.6k are the meaningful figures. Real-hardware acceptance is the owner's M3 pass.

## 6. Consistency

Blender neutral renders, the exported GLBs, and the Three.js runtime all agree: the 05G corrections
(rounded shoulders, fitted vest, continuous trousers) are visible identically in-engine and in the
authoring renders.

## 7. Remaining weaknesses (honest)

- **Shoulder:** the deltoid cap is marginally fuller than 05F; at extreme raised-arm angles it can read
  slightly padded. Note-level; watched, not a blocker.
- **Vest:** side/back wrap is the weakest axis (the back panel reads as a fairly flat band); a faint
  two-panel seam and slight front-panel convexity linger. It reads as fitted workwear, not armor.
- **Pelvis:** the front crotch still reads as a soft rounded form (not a box or diaper) and a faint
  belt seam persists — both inherent to the non-bifurcated tube-leg construction. A true fly/inseam
  would require bifurcated trouser legs, which is beyond a surgical correction.
- **Frozen areas** (face, hands, boots, hair, hat, skeleton, animation) were not touched and are not
  claimed as improved.

None of these is a box, shelf, diaper, detached seat, or rejection-level collision. All three panels
agreed 05G clearly exceeds 05F on every corrected axis.

## 8. Verdict

**PASS WITH NOTES.** The three owner-cited rejection-level defects are resolved and independently
verified; the hero is additive, byte-safe, budget-safe, animation-safe, and runtime-clean. It now
awaits Howard's real-GPU (Apple M3) owner review. Role-wide propagation to the other seven roles
remains **prohibited** until the owner separately authorizes it.
