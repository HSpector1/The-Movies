# Asset Lab 05C — Integration Recommendation

## Status
The crew-character system is **visually refined** on top of the accepted 05B technical foundation.
It is **not** integrated into the game; this milestone does **not** open Gate D / OC-01. The
recommendation below is for a future, owner-approved step.

## What is ready
- `character2.py` — role-parameterised builder with rounded anatomy, charming faces, hairstyles,
  worn clothing, fitted hi-vis, rounded hands/boots, 3 proportion profiles.
- Standards: proportion/silhouette, face/hair, clothing-art, hands/feet, deformation,
  material/palette (`docs/CHARACTER-*`).
- Pipeline (unchanged interface): `npm run blender:characters:{build,export,render,validate,
  pipeline}`; the geometric gate (`charvalidate`) + `test_character_gate` + `validate-characters.mjs`.
- Refined crew exported into `public/assets/studio/characters/` (same filenames; identity armature);
  Scene G loads them; runtime console-error-free.

## Recommended path to production (when approved)
1. **Owner real-GPU sign-off** on Scene G (M3) — the gating acceptance.
2. Optional **material-atlas merge** (9→~4 slots) if crowd draw-calls matter on the real GPU.
3. Wire **per-instance skin/palette/proportion** from a stable crew id (the builder already takes
   `overrides`; skin tone stays independent of role).
4. Distance-based **LOD** selection (LOD0 human-scale, LOD1 campus, LOD2 management).
5. Optionally run a **professional character-artist** polish pass if a higher bar than Two-Point-tier
   is later desired (the pipeline produces clean, riggable, retargetable bases to build on).
6. Only then integrate — as a **separate, explicitly-approved step**, never bundled with this pass.

## Deliberately NOT done (scope discipline)
Facial animation, cloth sim, per-strand hair, individual fingers, additional roles beyond the four
required (+ retained legacy), main-game wiring, LLM anything. No third-party add-ons, downloaded
models, or new animation libraries. All geometry original / owner-owned. 05B corrections (rig
forward −Y, one conversion, identity export, fixed weighting, six clips, LOD skeleton compat) left
locked and unregressed.
