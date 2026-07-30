# Asset Lab 05E — Final Report

**Verdict: PASS WITH NOTES.  Action: OWNER REVIEW (real Apple M3).**

- **Start:** `asset-lab-05d-character-professionalization-loop` @ `598c594` (owner verdict:
  **CONDITIONAL PASS** on a real M3 — technical foundation + animation + distant-crowd use approved;
  final human-scale character art NOT yet approved).
- **Branch:** `asset-lab-05e-character-art-cleanup-loop`, pushed to `backup` (HSpector1/The-Movies).
- **Loops:** 8 (the stated maximum). Every loop = named weakness → change → rebuild → **look at
  neutral-lit renders** → validate invariants → decide → commit.

## What this loop fixed (the remaining visible imperfections)
The 05E theme was **kill the "assembled-from-primitives" read** by replacing weak geometry rather than
nudging it (two new pure-Python mesh primitives, `add_loft` and `add_tube`, drive the change):

1. **Torso** — was a stack of overlapping ellipsoids (creasing musclebound shape) + a near-black
   sternum placket stripe. → ONE lofted, spine-weighted fitted shirt shell; placket demoted to a
   subtle fabric seam. *(the #1 uncanny tell — gone)*
2. **Limbs** — were butt-jointed segment cones ringing/creasing at knee/elbow/shoulder/wrist/hip
   (the mid-point gate's dominant finding, 4 of 5 lenses). → arms and legs are now single swept
   **tubes** weighted along their bone chains: continuous limbs, deltoid flows out of the yoke,
   no knee seam. Deforms cleaner than the segmented version.
3. **Hips / crotch / lower body** — crotch V-gap, saddlebags, knobby knee, leg-warmer cuffs, floating
   pouch. → crotch bridge, tucked hips, continuous knee, slim hem, strapped belt pouch.
4. **Hands** — mitten/claw with a mis-placed thumb. → clean palm, four length-varied fingers, a
   radial opposable thumb with a thenar web.
5. **Feet** — small dark lumps, then briefly oversized. → balanced work boot (cuff/instep/toe/dark-sole
   value break), leather lightened so form reads.
6. **Build profiles** — heavy read as a featureless balloon (waist > chest). → broad-stocky (chest >
   waist, thick limbs + neck); slim/std/heavy pushed to read as three distinct bodies.
7. **Face** — slightly glum + cap crowding the brow. → cap lifted off the brow; warmer neutral-smile.

## Independent verification (not validators, not distance, not exposure)
Two adversarial multi-lens review gates (Workflow, 5 independent critical lenses reading the actual
neutral-lit renders). Mid-point gate (iter-04) returned CONCERNS across the board and set the agenda;
image-scale artifacts in it were triaged out (reviewers given full-body renders mis-called the face a
"blob" and hands a "mitten" — the close-render reviewers confirmed the features exist). The **final
before/after gate (05D vs 05E)** returned, on every lens, READY_WITH_NOTES with **2 MAJOR_IMPROVEMENT +
3 IMPROVED and zero substantive regressions** (scores: anatomy 4, clothing 4, hands/feet 4, face 4,
overall/AD 3). Confirmed to carry into the actual three.js runtime (Scene G, **console-error-free**).

## Technical integrity (all held)
8/8 build gate; 8/8 GLB validator (face −Y, 65 joints, height, grounded, no stray island); 0
unweighted / 0 bad weight-sum; six required clips deform cleanly; LOD skeleton + height consistency.
**Tris DROPPED ~20–25%** (heaviest role 11.76k → 8.75k LOD0) — the loft/tube surfaces are leaner than
the ellipsoid/segment stacks. No new dependencies, no downloaded assets, no animation-library changes.

## Remaining (for the owner, deliberately NOT built)
- **MAJOR / design-scope:** all roles share one body mesh + one face sculpt; differentiation is palette
  + headwear + props, not unique per-role bodies/faces/pose-variety. This is the system's architecture
  (roles = costume rows on the shared 65-bone skeleton; the SIZE profiles + population system provide
  the variation). Per-role unique bodies/faces/idle-pose variety is a larger authoring change that
  brushes the contract's section-11 non-goals — **an owner design decision, reported not silently built.**
- **Minor / diminishing-returns polish:** finger knuckle articulation, boot toe-vamp / heel break,
  belt-loop threading, garment fold/seam definition, a hair-warmer default expression. All acceptable
  at the management-camera target.

## Isolation
Scenes A–F, Scene G architecture + props, main sim, spikes, other lab branches: untouched. Gate D
closed; OC-01 not started; no integration into the game. Default branch untouched; non-force backup
push only. **Not approved for production integration — this is a lab result pending the owner's M3 pass.**
