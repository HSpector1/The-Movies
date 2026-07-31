# Authored Character Rigging Standard (Asset Lab 05H)

The authored base binds to the SAME 65-bone UAL armature as 05E–05G, so the six accepted clips
drive it for free. No new skeleton and no new animation library are ever introduced.

## Binding method — deterministic inverse-distance (not bone-heat)
Blender's bone-heat weighting is unreliable headless on this mesh (it fails to solve for arm
bones when the T-pose arm bones sit outside the arms-down geometry). Instead:
- Compute, per vertex, the point-to-segment distance to each of the ~23 deform-bone segments.
- Weight the k=5 nearest bones by inverse distance (p=3), normalized → one vertex group per bone.
- Bind the Armature modifier to the full 65-bone rig; only the deform bones carry weight.
- LODs copy vertex groups + the armature modifier, so one clip instance drives every LOD.

This is fully deterministic (no RNG, no solver), matches the pipeline's "explicit over ops"
philosophy, and reproduces identically on a fresh checkout.

## Re-pose (arms-down base → T-pose rig)
The base rests arms-down; the rig rests T-pose. Arms are re-posed by smooth linear-blend
rotation about each shoulder, with the rotation amount a smoothstep of the arm weight so the arm
rotates rigidly to horizontal while legs/torso stay put and the shoulder crease fairs smoothly.

## Refinement rules (Iteration 3)
- Weight refinement + limited corrective shape keys where a clip genuinely needs them.
- **Never** use shape keys to hide broken neutral geometry.
- Targets: no shoulder collapse, no vest pierce, no crotch collapse, no seat separation, no
  hip→thigh tear, no detached hands, no boot float, no mesh shards, across all six clips.

**Current status:** base skinned + six clips deform (Iteration 1). Weight/shape-key refinement
and the underarm-web fix are Iteration 3.
