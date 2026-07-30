# Hero Character — Shoulder & Hand Standard (Asset Lab 05F)

05E defects: D shoulder wedges / abrupt sleeve-to-torso / weak armpit; E thin, flat, weak hands with a
harsh wrist.

## Shoulders / arms
- The arm is **one continuous swept tube** (`skinning.tube`): a wide **deltoid** ring that MEETS the
  torso yoke (the arm flows out of the shoulder, no plug) → bicep → elbow → rolled sleeve cuff → skin
  forearm tube → slim wrist. No butt-jointed segment rings.
- **Armpit fill:** a small `upperarm`/`spine`-weighted mass closes the hollow under the deltoid so the
  underside connects to the torso with no weak gap. Holds under the raised-arm pickup pose.

## Hand (intentionally modelled — grouped fingers are fine, no individual articulation required)
- **Smooth wrist blend** (softens the forearm→palm step; no bracelet ring).
- **Palm with real THICKNESS** (z ≈ 0.030, not a flat slab) + a **knuckle ridge** across the finger base.
- **Four GROUPED fingers** with DEEP valleys (they read as distinct digits, not a fused mitten slab) and
  **rounded, tapered fingertips** (no flat squared ends). Rigid to the `hand` bone → deformation-safe.
- **Full opposable thumb** with a thenar base, rounded tip.

## Must-not
No pointed shoulder wedge · no separate shoulder cap · no cylindrical plug arm · no weak armpit · no
flat paddle hand · no harsh wrist ring · no fused-mitten fingers with flat tips.

## Verified (Iteration 3)
Character Modeler (hands 8, shoulders 8.5 /10) + Rigging (7.5/8) PASS-WITH-NOTES, no must_fix:
"intentionally modelled hand… wrist the biggest win… no broken wrist, no detachment… armpit holds in
pickup." The Art Director's two must_fix items (finger valleys/tips + wrist ring) were resolved.
