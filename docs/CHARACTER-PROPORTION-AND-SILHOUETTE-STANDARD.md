# Character Proportion & Silhouette Standard (Asset Lab 05C)

## The de-blocking principle

The body is built from **rounded, tapered ellipsoids** (`ell()` helper in `character2.py`), never
stacked boxes. Boxes read as armor; overlapping shade-smooth ellipsoids read as a body under
clothing. The torso is a continuous taper: **waist (narrow) → chest (broad) → shoulder yoke**, with
a trapezius blend softening the neck→shoulder corner and a low **shirt hem** ellipsoid overlapping
the waistband so there is no shirt↔trouser gap.

Ellipsoids are **flattened front-to-back** (depth ≈ 0.10 m half-extent vs width ≈ 0.17–0.19) so the
torso reads fit, not pot-bellied.

## Proportions

- Skeleton height is **shared and locked** (the 65-bone UAL rig is a locked 05B correction), so
  body-type variation reads through **build width (girth)**, not skeleton scale — the safe choice
  that never breaks the shared animation library.
- Head + hands slightly enlarged for management-camera readability.
- Shoulders broad enough to read but **not square/armor** (rounded deltoid caps, yoke half-width
  ≈ 0.19·girth, narrowed from the 05B 0.205 box).
- Visible but restrained waist; rounded hips flowing from a pelvis ellipsoid (no boxy hip).

## Proportion profiles (`SIZE`, three safe profiles)

| Profile | `size` | girth | Reads as |
|---------|--------|-------|----------|
| average | standard | 1.00 | baseline crew |
| shorter/wider | heavy | 1.15 | stocky (Electric, Maintenance, Carpenter) |
| taller/leaner | slim | 0.90 | lean |

Variation is girth-only → it **cannot** break animation or clothing (same skeleton, same weights).
Scene-G roles keep `standard`/`heavy` (stable GLB filenames); `slim` is available per-instance via
`overrides={"size":"slim"}` and shown in the proportion-profile lineup.

## Enforcement
`charvalidate` height range [1.70, 1.95]; feet grounded; no stray fragments; 0 unweighted / 0
bad-sum verts (re-verified after the torso rebuild). Evidence: `proof/lab05c/iteration-01/`
(`proportions-front.png`, hero front/side/3q/back, six poses) vs `proof/lab05c/baseline/`.
