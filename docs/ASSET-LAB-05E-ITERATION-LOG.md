# Asset Lab 05E — Iteration Log (final crew character art cleanup, max 8 loops)

Baseline = 05D HEAD `598c594` (owner verdict: **CONDITIONAL PASS** on a real M3 GPU — technical
foundation + animation + distant-crowd use approved; final human-scale character art NOT yet
approved). This loop targets the remaining *visible* imperfections only. Every loop:
named weakness → change → rebuild → **look at neutral-lit renders** (no distance-hiding, no
overexposure, not validators-only) → validate technical invariants → decide → commit.

Invariants preserved every loop: rig forward −Y, 65 joints, 0 unweighted / 0 bad-sum, six required
clips deform cleanly, LOD skeleton/height consistency, runtime Scene G console-error-free, and the
tri budget is not inflated above 05D.

Defect priority (from direct observation of the 05D `final/` renders):
P1 torso reads musclebound + dark sternum placket stripe · P2 hips/crotch/lowerbody (V-gap,
saddlebags, knobby knee, leg-warmer cuffs, floating pouches) · P3 hands (fused mitten) · P4 feet
(small dark blocks) · P5 neck/shoulders (no neck, pillow deltoids) · P6 face (already strongest —
light polish only).

---

## Loop 1 — Torso as ONE lofted, fitted garment (fixes P1, the #1 uncanny tell)
- **Named weakness:** the shirt was a *stack of overlapping ellipsoids* (waist/chest/yoke), which
  creased at every interpenetration boundary and read as a musclebound torso; a near-black placket
  **box** ran down the sternum like a painted-on stripe. 13 prior loops nudged the ellipsoids and
  never removed the "assembled" read — so this loop replaces the geometry rather than preserving it.
- **Change:** added a `loft` primitive (`meshgen.add_loft` + `skinning.loft`) that bridges a stack
  of elliptical rings into ONE continuous, manifold surface. Rebuilt the torso as an 8-ring loft
  (hem → pinched waist → broad proud chest → shoulder yoke → neck taper), each ring weighted along
  the spine by height (`_spine_w`) so the whole torso is one linear-blend-skinned surface. Demoted
  the placket to a THIN RAISED SEAM in the shirt colour (reads via soft shading, like real fabric)
  with only the small buttons left dark.
- **Rebuild/validate:** 8/8 build gate; 8/8 validator (face −Y, height, grounded, no stray island);
  0 unweighted / 0 bad-sum. **Tris DROPPED** (Grip 11 760 → 10 328; all roles now ≤ 11.5 k) — the
  loft is leaner than the ellipsoid pile.
- **Look (`proof/lab05e/iteration-01/`):** proportions-front — the dark sternum stripe and the
  pec/waist crease are GONE; the torso reads as a smooth continuous fitted shirt across slim/std/
  heavy. roles-front — role separation preserved. base-front/3q — clean fitted silhouette, face
  and cap unchanged. **Deformation:** kneel/sit/pickup — the lofted shirt bends as ONE surface with
  the spine (no inter-segment gap, no melt/collapse/tear); cleaner in motion than the old stack.
- **Decision: ACCEPT.** P1 materially fixed. Next-visible now = P2 hip/belt shelf + crotch, then
  hands/feet/neck.
