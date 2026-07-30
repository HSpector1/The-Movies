# Asset Lab 05E — Visual Baseline (render index)

All renders are neutral-lit (mid-grey studio world, AgX Medium-High-Contrast, exposure −0.55) — the
same honest look as 05C/05D, so before/after comparisons are fair. No overexposure, no distance-hiding.

## Final proof set — `proof/lab05e/final/`
- Lineups: `roles-front/-3q`, `allroles-front`, `proportions-front/-3q`, `skintones-front`,
  `palettes-front`, `headwear-front`, `hairstyles-front`, `population-front`.
- Per-role folders (`Grip/`, `Electric/`, `PA/`, `Maintenance/`, `Office/`, `Director/`): `base-front/
  back/left/right/3q/3q-rear`, `base-face-front/-back`, `base-hand`, `base-lowerbody`, the six poses
  `pose-{idle,walk,talk,sit,pickup,kneel}-front/-3q`, and a `Char_<role>_probe.glb`.

## Runtime (in-engine, Scene G) — `proof/lab05e/runtime/`
`01-crew-front`, `02-crew-3q`, `03-crew-back`, `04-human-scale`, `05-overview`, `06/07-anim-t0/t1`,
`08-panel`. Captured headless via SwiftShader (software GL) — **diagnostic only**; console-error-free.
Real-hardware acceptance is the owner's M3 pass.

## Per-iteration evidence — `proof/lab05e/iteration-01 … 07/`
Each loop's render set (lineups + Grip/other-role closeups), matching the iteration log. Loop 1 torso
loft · 2 hips/legs · 3 hands · 4 feet+neck · 5 loft all limbs · 6 build profiles · 7 refinement batch.

## Baseline for comparison — `proof/lab05d/final/` and `proof/lab05d/runtime/`
The accepted 05D CONDITIONAL-PASS renders. Same filenames, so any 05E file has a direct 05D twin for
side-by-side review (see the Owner Review Guide table).
