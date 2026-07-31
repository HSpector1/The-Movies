# Authored Character Topology Standard (Asset Lab 05H)

The base geometry comes from a professionally authored CC0 quad mesh, so topology quality is
inherited rather than hand-built from primitives. Rules for keeping it clean through the pipeline:

- **Weld on import.** glTF splits verts at normal/UV seams; always `remove_doubles` back to the
  authored quad cage before any per-vertex work (12,502 verts / 12,500 quads for the 05H body).
- **Preserve loops.** The base carries deformation-friendly edge loops at neck, clavicle,
  shoulder, elbow, wrist, hip, knee, ankle. Do not triangulate or decimate LOD0 below the point
  where those loops read; LOD1/LOD2 may decimate freely (they are runtime-only).
- **Re-pose without shredding.** Arm re-posing uses smooth linear-blend rotation (continuous
  weight, smoothstepped amount) so no faces stretch into sails. Any residual transition web is
  relaxed locally, never by global smoothing that would soften the whole body.
- **No intersecting final primitives.** Clothing is authored as fitted shells over the body, not
  as separate solids punched through it (see the Workwear standard).
- **One continuous body mesh**; eyes/teeth (if added) are the only separate sub-objects.

**Current status:** body topology inherited + welded + re-posed + skinned (Iteration 1).
Underarm-transition topology cleanup is an Iteration 3 item.
