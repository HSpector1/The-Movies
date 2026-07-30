# Asset Lab 05D — Brief

## Purpose
A **professionalization** loop (min 10 / target 12 / max 15 iterations) on the 05C crew, which was
accepted as a strong intermediate baseline, not the final standard. Goal: take the crew from "good
AI-generated stylized prototype characters" to "a cohesive, professional, production-credible
premium management-game cast (Two Point tier) whose silhouettes, faces, clothing, deformation,
materials, and role identities hold up in Blender, in motion, and at the gameplay camera."

## Baseline & isolation
- From 05C HEAD `d912ca1`, branch `asset-lab-05d-character-professionalization-loop` (05C preserved).
- Frozen/untouched: Scenes A–F, Scene G architecture + props, main sim, spikes, Gate D, OC-01.
- No new external models / animation libraries / third-party add-ons / system-wide deps / default
  branch changes. Edits limited to the crew-character art + its immediate pipeline (+ Scene G
  character presentation + review lighting).

## Locked technical invariants (never regressed)
Rig forward −Y · one documented orientation conversion · no stacked 180s · identity armature export
· shared 65-joint skeleton · locked skeleton height · face-on-front · 0 unweighted / 0 bad-sum verts
· no detached/melted/collapsed geometry · six required clips · LOD skeleton compatibility · Scene G
runtime console-error-free. Re-validated after every accepted loop (`GATE_TEST_OK`).

## Loop sequence (executed)
1 anatomy/silhouette · 2 head/facial planes · 3 eye/brow/mouth expression (+full gate) · 4 hair +
facial hair + face fixes · 5 anatomy REDO (per-profile ratios) · 6 hands (individual fingers, +full
gate) · 7 clothing construction + eye relax · 8 role palettes + apron/coil · 9 population diversity
(+full gate) · 10 deformation professionalization · 11 greyscale role differentiation + population
decoupling · 12 holistic (tri trim + Scene G re-export + runtime) (+full gate).

Each loop: hypothesis → named weakness → change → rebuild → validators → Blender renders → runtime →
review (≥1 specialist + lead; full multi-reviewer gate at 3/6/9/12) → score → accept/revert → commit.
No faked pass; the milestone can fail. Independent review outages retried ≤4× and recorded honestly.
