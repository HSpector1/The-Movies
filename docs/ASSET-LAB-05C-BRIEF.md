# Asset Lab 05C — Brief

## Purpose
A **visual art-refinement** loop (max 5 iterations) on the Asset Lab 05B crew characters. 05B fixed
the rejection-level *technical* defects (orientation, connectivity, no floating feet/shards, six
clips, modeled clothing, LODs, runtime, backed up) — verdict PASS WITH NOTES. Howard's real-GPU
review: the characters are technically functional but still **too crude, blocky, stiff, and
prototype-like**. This milestone improves *visual quality* without re-solving already-fixed bugs.

Target: a **charming, readable, stylized human** for a modern management game (Two Point tier) —
NOT photorealism, NOT a technical mannequin.

## Locked (05B corrections — do not reopen without new evidence)
Rig forward = −Y · one documented orientation conversion · no stacked 180s · identity armature
export · face geometry on the front · voxel-remesh bodies rejected · painted-region clothing
rejected · fixed SkinnedBuilder deform-layer weighting · 0 unweighted / 0 bad-sum verts · all six
required clips · LOD skeleton compatibility · GLB↔runtime orientation agreement.

## Isolation (unchanged)
Work only in `/Users/bruce/Project Studio - Asset Lab`, branch
`asset-lab-05c-character-art-refinement-loop` (from 05B HEAD `4a3ce6e`, preserved as the technical
before-state). Scenes A–F, Scene G architecture/props, and non-character infra untouched. No main
game / spikes / Gate D / OC-01. No third-party add-ons, downloaded models, new animation library,
or system-wide deps. Edits limited to character sources, materials, clothing/hair/headwear,
accessories, weights (where refinement needs), LODs, character runtime presentation, Scene G review
cameras/lighting, validation, evidence, docs.

## Iteration plan
1. Proportions & silhouette (de-block torso, shoulders, waist, hips, profiles).
2. Face, head, hair, headwear.
3. Clothing & role silhouettes (fitted vest).
4. Hands, feet, joints, deformation.
5. Materials, LODs, runtime presentation & lighting, restraint.

Each iteration: inspect → rank defects → correct ≤3 related → validate mesh + 6 clips → export →
validate GLB → Scene G → evidence → technical+visual review → score → accept/revert → commit.
This milestone **can fail**; no faked pass.
