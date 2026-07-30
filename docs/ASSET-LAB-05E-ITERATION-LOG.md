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

---

## Loop 2 — Hips / crotch / lower body (fixes P2)
- **Named weakness:** a dark crotch V-gap (inner thighs never met under the pelvis), saddlebag hip
  caps, a knobby knee seam-band, bulbous "leg-warmer" trouser cuffs at the boot tops, and a boxy
  tool pouch jutting off the hip.
- **Change:** added a narrow **crotch bridge** fill (weighted pelvis) between the thigh tops and
  tucked the hip mass back → V closed, no paunch. Pulled the **hip caps** inward + down (0.078→0.070·
  HI, −X) → no saddlebag. Rebuilt the **knee** as a rounded thigh→calf bridge instead of a pinched
  band. **Slimmed the trouser hem** (0.058→0.047) + shrank the ankle collar → a fold, not a warmer.
  Re-seated the **tool pouch** as a small flat belt bag (tried a sphere first — read as a jutting
  orb; a flat box reads as a bag).
- **Rebuild/validate:** 8/8 build gate; 8/8 validator; 0 unweighted / 0 bad-sum; tris flat (~10.3k).
- **Look (`proof/lab05e/iteration-02/`):** base-lowerbody — crotch closed, cuffs slim, hips tucked,
  pouch reads as a bag. roles-front — separation preserved. **Deformation:** kneel-3q clean (leg
  bends, pouch rides the pelvis, no collapse).
- **Residual (noted, not blocking):** a faint horizontal crease remains at the knee (thigh/calf
  segment boundary) — candidate for a lofted leg if the review gate flags it.
- **Decision: ACCEPT.** Next = P3 hands.

---

## Loop 3 — Hands (fixes P3)
- **Named weakness:** a lumpy **wrist knot** (an oversized wrist sphere + the sleeve cuff read as
  two bulges), and stubby fingers thrown into a wide claw-splay.
- **Change:** shrank the wrist blend (0.040→0.032, biased toward the hand) so the forearm flows
  into the palm; flattened + slightly enlarged the palm (0.050×0.052×0.021); **lengthened the
  fingers** (span 0.040→0.054) with a per-finger tip taper; **relaxed the splay** (±0.026→±0.021,
  tip fan 1.55→1.22) so the fingers sit close as a relaxed hand; thickened the thumb base and
  lifted it slightly.
- **Rebuild/validate:** 8/8 build gate; 8/8 validator; 0 unweighted / 0 bad-sum.
- **Look (`proof/lab05e/iteration-03/`):** base-hand — a competent stylized hand: smooth wrist,
  four distinct fingers, a readable thumb. pickup-3q — hands read in a working pose; deformation
  clean (hand geometry is rigid to hand_{s}, so it rides the wrist without shear).
- **Decision: ACCEPT.** Next = P4 feet + P5 neck/shoulders.
