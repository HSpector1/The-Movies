# Asset Lab 05G — Owner Review Guide

This is the additive 05G surgical correction of the 05F Electric hero. It awaits your **real-GPU (Apple
M3)** review. Nothing is merged; the 05F hero and all 05E assets are byte-identical.

## Fastest read (Blender renders — no server)

Open `proof/lab05g/final/`. In every `cmp-*.png` the **LEFT figure is the accepted 05F hero** and the
**RIGHT figure is the 05G correction**, at identical pose/scale/lighting/camera. The single most useful
shots:

- **Shoulders:** `cmp-3q.png`, `cmp-shoulder-side.png`, plus `05g-pose-idle-3q.png` (natural pose).
  Look for: rounded shoulder that flows into the arm (05G) vs the flatter, more angular 05F.
- **Vest:** `cmp-vest-front.png`, `cmp-vest-side.png`. Look for: a fitted shell with a narrow zip
  opening hugging the ribs (05G) vs the proud two-pod slab (05F).
- **Pelvis:** `cmp-pelvis-front.png`, `cmp-pelvis-back.png`, `cmp-lowerbody.png`. Look for: hips tapering
  into the thighs, a slim belt line, no front box / no rear shelf / no side pouch (05G) vs 05F.
- **Deform:** `cmp-walk-3q.png`, `cmp-kneel-3q.png`, `cmp-sit-3q.png`, `cmp-pickup-3q.png`.
- **Before/after:** compare any `proof/lab05g/baseline/05g-*.png` (05F-identical "before") to the
  matching `final/05g-*.png`.

## In-engine review (the R3F harness)

```bash
cd "/Users/bruce/Project Studio - Asset Lab"
npx vite --port 4321 --strictPort
# open http://localhost:4321/ , Scene "G · Character Art Review", then the
# "05G Hero — 05F hero <-> 05G surgical correction A/B" button group.
```

25 comparison cameras (front/back, side-by-side, shoulder/vest/pelvis close-ups, walk/talk/kneel/pickup/
sit, LOD, management distance, human scale, wireframe). The 05F hero is on the left, the 05G on the right.
Pre-rendered headless captures are in `proof/lab05g/runtime/` (console-error-free).

## What to decide

1. Are the three defects resolved **at human scale on your M3**: pointed shoulders → rounded; pod vest →
   fitted; pelvis box/shelf/diaper → continuous trousers?
2. Does 05G clearly exceed 05F?

## Known remaining weaknesses (so you can judge them deliberately)

- Deltoid cap is marginally fuller than 05F; slightly padded read only at extreme raised-arm angles.
- Vest side/back wrap is the weakest axis; faint two-panel seam.
- Front crotch reads as a soft rounded form (not a box/diaper) + a faint belt seam — inherent to the
  non-bifurcated tube-leg pants; a true fly/inseam would need bifurcated legs (out of surgical scope).

## Your decision options

`PASS` · `PASS WITH NOTES` · `REVISE` · and separately, whether to authorize **role-wide propagation**
(applying this construction to the other seven roles) — which remains **prohibited until you say so**.
