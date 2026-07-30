# Asset Lab 05F — Owner Review Guide

One additive hero-quality Electric character (`Char_ElectricHero`) built on the accepted 05E pipeline,
to answer: **can the current Blender pipeline produce one genuinely convincing stylized character at
human-review distance, without replacing the skeleton/animation/export/runtime?** Nothing is integrated;
the 05E Electric and the other seven roles are untouched.

## The fastest way to judge it — in the engine
Run the lab (`npx vite --port 4321 --strictPort`, open `http://localhost:4321/`) → scene
**G · Character Art Review (Lab05E)** → in the left panel, the **05F Hero** control group. It renders the
accepted **05E Electric (left)** next to the **05F hero (right)** at identical pose/animation/scale/
lighting/angle. Orbit/zoom to inspect; the two figures are labelled in-scene.

### 60-second A/B path (05F Hero group)
1. **Side-by-Side Front** — overall read; the hero should clearly exceed 05E.
2. **Vest Comparison** — 05E three inflated rings → 05F fitted open-front shoulder-hung safety vest.
3. **Pelvis Back Comparison** — 05E detached "diaper" shell → 05F continuous seat (top-priority fix).
4. **Pelvis Front Comparison** — 05E crotch protrusion → 05F clean trouser front.
5. **Shoulder / Hand / Boot Comparison** — integrated shoulders, fuller intentional hands, work boots.
6. **Kneeling / Pickup / Sitting Comparison** — deformation holds in the hard poses.
7. **05F LOD Comparison** — LOD0/1/2 with live tri/material/joint counts (65 joints at every LOD).
8. **Wireframe Comparison** (toggle the Wireframe display) — topology cleanliness.
9. **Review status panel** — sustained FPS / draws / triangles / console-error status on your GPU.

Or compare the Blender stills in `proof/lab05f/final/cmp-*` (05E left / 05F right).

## What was rebuilt (independently specialist-reviewed each loop)
Pelvis/trousers (continuous seat) · fitted open-front safety vest (shoulder yoke) · integrated
shoulders + fuller hands · defined work boots · six-clip deformation (Rigging **PASS**) · warmer face.
Final holistic gate (Art Director + Runtime QA): **PASS WITH NOTES, EXCEEDS** — "clearly exceeds the
05E Electric at human scale; six of seven rejected regions genuinely resolved."

## Honest remaining weaknesses (shown, not hidden)
- A faint **scalloped seam at the rear waist** where the leg tubes meet the hip-loft seat — inherent to
  the hip-loft + separate-leg-tube approach (hidden at the bottom junction, faintly visible at the
  rear-top). Fully removing it would need a single bifurcating-pants manifold. Reads at close rear
  inspection; fine at management distance.
- **Face** is improved but the least-changed region (stylized-minimal by design).
- **Hands** are fuller and intentional but grouped-finger low-poly (acceptable per the brief).
- The `Fixing_Kneeling` down-foot toe contact is clip-inherited (identical to 05E; a fix needs animation/
  IK, outside the locked foundation).

## Gate
- **Pass** → the hero construction approach is validated; you may THEN separately authorize role-wide
  propagation (do NOT propagate without that separate authorization).
- **Continue** → name the specific still-visible defect for a follow-up loop.

Branch `asset-lab-05f-hero-electric-character-proof` on the `backup` remote only. Not merged, not
integrated, Gate D not started.
