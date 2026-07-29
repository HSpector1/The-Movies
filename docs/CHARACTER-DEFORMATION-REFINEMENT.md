# Character Deformation Refinement (Asset Lab 05C)

## Principle (locked from 05B)
Segmented-joint blend weighting on the 65-bone UAL rig: each limb segment rigid to its bone; a
joint sphere blends the two adjacent bones at shoulder/elbow/wrist/hip/knee/ankle/neck. Weights are
assigned on the bmesh deform layer at add-time (0 unweighted / 0 bad-sum). This scheme deforms all
43 CC0 clips with **no melt/shard/collapse** (verified 05B + re-verified every 05C iteration).

## 05C refinements
- **Torso** rebuilt as rounded ellipsoids (iter 1) — reviewers confirmed the trunk holds a
  consistent volume with no melt/shard across all six poses, including the deep-kneel stress test.
- **Knee** joint sphere enlarged so the knee keeps volume in deep kneel/crouch (addressed the
  iter-1 "mild elbow/knee volume loss at full flexion" note).
- **Rolled-sleeve cuff + elbow joint** keep the elbow region from thinning at full arm flex.
- **Garment details** (collar/placket/pocket/cuff/vest) are all weighted to the torso/arm bones
  they sit on, so they deform with the body and never detach.

## Six required clips (all validated)
Idle_Loop · Walk_Loop · Idle_Talking_Loop · Sitting_Idle_Loop · PickUp_Table · Fixing_Kneeling.
Feet grounded (min z ≈ 0) in standing/locomotion; sit/kneel lower the body as expected. Priority
per the brief: Walk, Fixing_Kneeling, PickUp_Table are the hardest and are rendered front + 3q each
iteration (`proof/lab05c/iteration-0N/<role>/pose-*.png`).

## What is deliberately NOT done
No facial animation, no cloth simulation, no corrective shape keys requiring runtime drivers, no
per-vertex hand fingers. Corrective volume is done with geometry (joint spheres) + weights only —
deterministic and export-safe.
