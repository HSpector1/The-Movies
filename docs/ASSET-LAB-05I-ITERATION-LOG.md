# Asset Lab 05I — Iteration Log

One owner-reviewable iteration (Iteration 1), built via several small internal render-check adjustments (permitted
within one coherent iteration; reported here honestly). All renders under `proof/lab05i/iteration-01/`.

## Iteration 1 — the complete correction cluster

**Structure.** Thin additive layer `blender/studio_pipeline/authored05i.py`: calls the accepted
`authored05h.build_authored_base` (unchanged foundation), applies 05I body/face corrections to the returned base,
then builds corrected garments reusing 05H's `_garment/_rigid_piece/_solid_mat` helpers. Export via
`blender/build_hero_export_05i.py` → `electric_hero_05i*`. Iteration renders via `blender/build_hero_05i_render.py`.

### Internal adjustment passes (Blender render checks)
1. **First build.** Muscularity reduction + face softening + new arc-loft hi-viz vest + procedural boots + hat.
   Result: vest complete (good), but boots were a pile of disconnected primitives (box+sphere+cylinder) with a bare
   toe still poking through; hat sat over the face (wrong head-top reference); face lumpy. **Rejected the
   box+sphere+cylinder boot and the bone-guess placement.**
2. **Bounds-fit pass.** Refit garments/boots/hat to the body's ACTUAL vertex bounds (robust to the slimmed body):
   boots became one clean enclosing beveled box per foot; hat placed from real head-vertex top; muscularity dialed
   up. Result: hat now a proper hard hat, vest fitted, boots cover the feet. Face still lumpy; a hat/forehead gap.
3. **Face-order pass.** Reordered face softening (structural brow/nose/ear eases FIRST, then even smoothing) to
   stop the nudges re-introducing lumps; lowered the hat. Result: face cleaner; still a jagged band at the hairline.
4. **Hair/socket pass.** Filled the deep sculpted eye sockets; restricted hair to the back of the head; lowered the
   hat brim. Result: eye area improved; a thin dome-rim/scalp sliver remained.
5. **Decisive hat pass.** Enlarged + lowered the hard-hat shell. Result: no scalp gap, but I OVER-sized it — at
   the exported-GLB runtime framing it read as a floating yellow ball covering the forehead.
6. **Review-driven corrective pass.** The specialist + adversarial panel (run on pass-5 evidence) unanimously said
   ITERATION 2 REQUIRED and flagged: the hat balloon (blocker + a regression I introduced in pass 5), oversized
   boots detaching at the ankle in motion (major/regression), the blue shirt still reading as a nude torso through
   the open vest (major), and only marginal muscularity reduction (major). Within this iteration I corrected all
   four: hat → a snug hemisphere cap sitting on the head with the brim at the brow (blocker fixed); boots → fitted
   close + an ankle shaft weighted to the calf so they stay connected in motion; vest front opening narrowed
   (0.30→0.16 rad) so the vest covers the chest (nude read resolved); muscularity dialed down further. Re-exported,
   re-captured runtime + real-GPU, and re-reviewed on the corrected evidence.

**Rejected experiments (honest):** the box+sphere+cylinder boot (pass 1); bone-position garment placement (replaced
by actual-vertex-bounds fitting); over-aggressive post-smoothing nudges (reordered); the over-sized "balloon" hat
of pass 5 (a self-introduced regression, reverted to a snug cap in pass 6).

### Final Iteration-1 state
- LOD0 **22,772** / LOD1 **10,247** / LOD2 **4,553** tris; **65 joints**; height 1.81 m (leaner than 05H's 24,509).
- Corrections landed: complete hi-viz vest (arc-loft shell, ~152-vert continuous garment + reflective bands, no
  fragments); boots fully enclose the feet; closed hard hat (299-vert dome, no scalp); thicker shirt + complete vest
  → clothed torso (no nude-blue read); reduced muscularity; softened, rounder face; corrected `mat_i_*` materials;
  neutral evaluation-light mode added (§7). Skin material unchanged (correct warm tan #e8b58f).
- Deformation preserved: all six clips play; the new vest/boots/hat stay anchored and deform with the body in
  kneel/sit/pickup/walk/talk (verified in-Blender and at runtime on real Metal).
- **Weakest remaining area (honest):** the face. It is visibly less gaunt/ogre-like than 05H and reads acceptably at
  normal distance, but in extreme close-up it is a simple, slightly heavy rounded form rather than an appealing
  sculpt — a candidate for Iteration 2 or a human artist per the owner's options. The boots read a little blocky and
  the vest a little puffy.

Validation: `tsc` clean, `vite build` clean, `validate-05i.mjs` pass, runtime console-error-free, 05G/05H
byte-unchanged. No integration, no propagation, no D1/D1-A/Engine changes.
