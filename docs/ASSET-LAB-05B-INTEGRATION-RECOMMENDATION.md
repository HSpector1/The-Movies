# Asset Lab 05B — Integration Recommendation

## Status
The crew-character system is **rebuilt and validated** in the Asset Lab. It is **not** integrated
into the game, and this milestone does **not** open Gate D / OC-01. Recommendation below is for a
future, owner-approved step — not an action taken here.

## What is ready to reuse
- `blender/studio_pipeline/character2.py` — the role-parameterised builder (one skinned mesh, 65
  UAL bones, real face/clothing, segmented weights).
- `blender/studio_pipeline/charvalidate.py` — the geometric gate (face-front / connectivity /
  height / grounding).
- `blender/build_characters05b.py` — builds + validates + exports all roles to
  `public/assets/studio/characters/` (identity armature, LOD0/1/2 + collision).
- `tools/validate-characters.mjs` + `blender/test_character_gate.py` — automated validation/tests.
- `npm run blender:characters:{build,export,render,validate,pipeline}`.
- Scene G (`studioSlice.tsx` CREW_URL + `scenes.tsx` STUDIO_CREW) now loads the corrected crew.

## Recommended path to production (when approved)
1. **Owner real-GPU sign-off** on Scene G (M3) — the gating acceptance.
2. Decide the **material-atlas merge** (9→~4 slots) if draw calls matter at crowd scale.
3. Define the **per-instance skin/palette assignment** from a stable crew id (hash) in the game's
   crew system — the builder already accepts `overrides` for this; skin tone stays independent of
   role.
4. Wire the LOD selection to camera distance (LOD0 human-scale, LOD1 campus, LOD2 management view).
5. Only then consider integration into the main game — as a **separate, explicitly-approved step**,
   never bundled with this correction.

## Deliberately NOT done (scope discipline)
Facial animation, cloth sim, per-strand hair, additional roles beyond the required four (+legacy),
LLM anything, and any main-game wiring. No third-party add-ons, downloaded models, or new animation
libraries were used. All geometry is original / owner-owned.
