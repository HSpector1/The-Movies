# Asset Lab 05D — Integration Recommendation

## Status
The crew-character system is now a professionalized, cohesive cast on the accepted 05B/05C technical
foundation. It is **not** integrated into the game; 05D does **not** open Gate D / OC-01. Below is
for a future, owner-approved step.

## Ready to reuse
- `character2.py` — role + per-instance parameterised builder: per-profile ratio anatomy, sculpted
  faces (expression), hair + facial hair, individual-finger hands, constructed clothing, role props
  (vest/coil/apron/satchel/bib/clipboard/radio), deterministic identity variation (`vary`).
- Standards (`docs/CHARACTER-*` from 05B/05C) + this lab's iteration log + performance doc.
- Pipeline (unchanged interface): `npm run blender:characters:{build,export,render,validate,pipeline}`;
  geometric gate (`charvalidate`), `test_character_gate`, `validate-characters.mjs`.
- Refined crew exported to `public/assets/studio/characters/` (same filenames, identity armature);
  Scene G loads them; runtime console-error-free.

## Recommended path to production (when approved)
1. **Owner real-GPU sign-off** on Scene G (M3) — the gating acceptance.
2. Optional polish (documented notes): warmer default face; per-role garment silhouettes; a
   persistent PA silhouette cue for rear poses; a hard value-block already added for Maintenance.
3. **Material-atlas merge** (9→~4 slots) — a runtime optimisation; do it IF the real-GPU review shows
   crowd draw-calls matter (justification in the performance doc). Preserve per-instance palette masks.
4. Wire per-instance **skin/palette/proportion/vary** from a stable crew id (builder already takes it).
5. Distance-based LOD selection (LOD0 human-scale · LOD1 campus · LOD2 management).
6. Optionally a professional character-artist finishing pass if a bar above Two-Point tier is wanted
   later — the pipeline outputs clean, riggable, retargetable bases to build on.
7. Only then integrate — a **separate, explicitly-approved step**, never bundled with this lab.

## Deliberately NOT done (scope)
Facial-animation system, cloth sim, per-strand hair, motion-capture, customization UI, full crowd
system, new roles beyond the required four (+ retained legacy), main-game wiring, final game-wide
shader architecture. No third-party add-ons / downloaded models / new animation libraries /
system-wide deps. 05B/05C technical invariants left locked and unregressed.
