# Hero Character — Pelvis & Trouser Standard (Asset Lab 05F)

The 05E Electric was rejected for a rear pelvis that read as a detached rounded "diaper" shell and a
front crotch with a mechanical central protrusion. The hero standard fixes both by building the
pelvis + trousers as ONE continuous garment.

## Rule
The trousers are **one continuous surface** worn over a stylized human form — NOT a stack of pelvis
ellipsoids + separate leg shells + a crotch ball.

## Construction (`character_hero.build_hero`)
- **Hip / seat = a single lofted tube** (`skinning.loft`, 6 rings, 18 segments): waistband → upper hip
  → widest hip → **SEAT** (the rear ring pushed back +Y for the buttock) → lower seat → a narrow,
  tucked crotch base. Weighted to the `pelvis` bone. This replaces the 05E pelvis+seat+crotch ellipsoids.
- **Leg tubes emerge from the hip loft:** each leg's top ring is WIDE + raised so it covers the hip
  loft's lower edge — the seat→thigh junction is hidden inside the overlap, not two surfaces crossing
  (crossing at mismatched segment counts is what read as a jagged seam; the hip loft and leg tubes both
  use 18 segments).
- **Crotch = a thin, RECESSED inseam gusset** (weighted `pelvis 0.5 / thigh_l 0.25 / thigh_r 0.25` so it
  stretches with a wide stance) — never a proud ball. Pushed back so it closes the crotch from behind,
  not protruding at the front.
- **Belt = a clean leather band** at the natural waist, clearly proud, matching the loft's 18 segments
  (a mismatched-segment band beats against the loft as crenellation). Hip pockets = FLAT boxes hugging
  the trouser, never proud floating cubes.

## Must-not
No separate rounded rear shell · no diaper silhouette · no jagged waistband · no mechanical central
protrusion · no gap between pelvis and thighs · no obvious left/right trouser shells.

## Verified (specialist review, Iteration 1 + certified Iteration 5)
Character Modeler + Rigging both PASS-WITH-NOTES (seat 4/5, crotch 4/5, no must_fix): "the 05E detached
diaper shell is gone… one continuous seat lofting into both thighs… front protrusion eliminated…
deformation holds cleanly through sit and kneel." Rigging final PASS: pelvis/seat continuous under sit
(front+rear) and kneel with no collapse or trouser-seat separation.
