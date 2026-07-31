# Asset Lab 05H — Owner Review Guide

This checkpoint delivers the **authored base body** (Iteration 1) and the proof that a CC0
authored base can drive the accepted skeleton + six clips. The clothed hero + runtime harness
are the pending next steps.

## Fastest read (Blender renders — no server)
Open `proof/lab05h/iteration-01/`:
- `base-front.png`, `base-side.png`, `base-back.png`, `base-3q.png` — the re-posed, skinned
  authored base at rest. Look for: continuous torso/shoulders/pelvis/hips/seat/legs (vs 05G's
  spheres/box/shelf in `proof/lab05g/final/`).
- `base-walk.png`, `base-sit.png`, `base-kneel.png`, `base-pickup.png`, `base-talk.png` — the
  six accepted clips deforming the authored base (the feasibility proof).
- `proof/lab05h/workflow-audit/probe-rest-*.png` — the starting point: armature T-pose dummy
  vs the raw CC0 base mesh.

## What to decide
1. Does the **authored base body** clearly exceed the 05G body at human scale (torso, shoulders,
   pelvis, seat, hips, legs)?
2. Accept the CC0-authored-base **foundation** and authorize continuation into workwear (Iter 2),
   deformation refinement + underarm-web fix (Iter 3), and face/style/LODs (Iter 4) + the runtime
   05G↔05H harness?

## Known base weaknesses to judge deliberately
Residual underarm web (will be under the shirt sleeve; Iter 3 fix); stylized-rough fingers
(Iter 4 finish); arms rest slightly below horizontal; LOD0 at 25k tris (Iter 4 tuning).

## Decision options
`ACCEPT FOUNDATION + CONTINUE` · `REVISE BASE` · `REQUIRES HUMAN ARTIST` · and, separately,
role-wide propagation remains **prohibited** until you say so.
