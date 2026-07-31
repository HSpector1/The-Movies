# Asset Lab 05H — Visual Baseline

Captured before authoring, so improvement is provable (brief §22).

- `proof/lab05h/workflow-audit/probe-rest-front.png` / `probe-rest-side.png` — the armature's
  own T-pose reference mannequin (LEFT) beside the raw CC0 base mesh (RIGHT), identical
  scale/light/camera. Shows the two starting facts: the armature is a hard T-pose; the base
  mesh is a clean, natural, arms-down human male at ~1.8 m.
- `proof/lab05h/iteration-01/base-*.png` — the authored base after re-pose + skin: rest
  front/side/back/3-quarter, plus Walk / Talk / Sit / Kneel / Pickup deformation.

**05G comparison (the bar to beat):** `public/assets/studio/characters/electric_hero_05g.glb`
and `proof/lab05g/final/`. The owner's 05G rejections — shoulder spheres, pelvis box/shelf,
diaper seat — are structural consequences of primitive assembly. The 05H base replaces the
whole body with continuous authored topology, so those specific tells are gone at the base
level. The clothed-hero side-by-side (05G vs 05H) is produced in the pending runtime harness.
