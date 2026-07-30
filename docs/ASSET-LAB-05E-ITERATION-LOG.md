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

---

## Loop 4 — Feet (P4) + a light neck touch (P5)
- **Named weakness:** boots were small near-black rounded lumps with no readable form (leather
  upper and dark sole were the same value); the neck read as a short stump under a high collar.
  (Shoulders already read acceptably after the Loop-1 lofted yoke, so this was a light touch.)
- **Change:** rebuilt the boot bigger — a defined **ankle cuff** (boot opening the trouser tucks
  into), a fuller instep/heel, a **work-boot toe box**, and a larger dark sole; **lightened the
  leather** material (0.15→0.21 mid-brown) so the boot upper reads against the dark sole (belt/
  pouch also read better). Neck: slimmed 0.055→0.051 + taller, dropped the collar 12 mm to reveal
  a bit more neck.
- **Rebuild/validate:** 8/8 build gate; 8/8 validator (feet still grounded, min-z in range); 0
  unweighted / 0 bad-sum.
- **Look (`proof/lab05e/iteration-04/`):** base-lowerbody — boots read as work boots (toe/instep/
  sole). base-face-front — head seats more naturally with a visible neck. roles-front — separation
  preserved, crew reads more polished. **Deformation:** kneel plants the boot ball, walk lifts it —
  clean, no clip/float.
- **Decision: ACCEPT.** P1–P5 addressed. → mid-point adversarial review gate before final polish.

---

## Mid-point adversarial review gate (Workflow, 5 independent critical lenses on iteration-04)
Verdicts CONCERNS across the board (Art Director 2.5, Anatomy 2, Fitted-clothing 2, Hands/Feet 2,
Face/Silhouette 2). Triaged against the actual renders (fable-judge: some claims were **image-scale
artifacts** — reviewers given full-body renders called the face a "featureless blob" and the hands a
"mitten", but the close-render reviewers confirmed the features exist and need *refinement*, not a
rebuild; "director coat missing" = that reviewer wasn't shown the coat). **Real, convergent findings:**
(1) limbs are still butt-jointed segment tubes → visible seams/creases at knee/elbow/shoulder/wrist/
hip (flagged by 4/5 lenses) — the dominant remaining "assembled" tell; (2) heavy build reads as a
featureless balloon + slim/std/heavy too similar; (3) belt/pouches still read proud; (4) thin per-role
garment construction; (5) refinements: face warmth/eye-read/nose-bridge/mouth-curve/cap-hair split,
hand finger-length variation + thumb + palm-back, boot slightly oversized vs thin ankle.
Plan for the remaining loops: 5 loft the limbs · 6 build profiles + torso taper · 7 belt/garment/face/
hands/boot refinements · 8 holistic (Scene G re-export + runtime + full 6-clip validation + final gate).

---

## Loop 5 — Loft ALL limbs (fixes the #1 review finding: joint seams)
- **Named weakness:** arms and legs were chains of `segment` cones + joint spheres that butt-joined
  at each joint, ringing/creasing at knee, elbow, shoulder, wrist and hip — the dominant "assembled
  from primitives" tell, same class of defect the torso had before Loop 1.
- **Change:** added an oriented-sweep `tube` primitive (`meshgen.add_tube` + `skinning.tube`) that
  sweeps elliptical rings along a limb axis into ONE continuous surface, each ring weighted along the
  bone chain. Rebuilt: **legs** as one trouser tube (hip→thigh→knee→calf→ankle, front taper via rx
  fall-off, fuller calf via ry); **arms** as a sleeve tube (deltoid→bicep→elbow→rolled cuff, the
  deltoid ring wide enough to MEET the torso yoke) + a skin forearm tube (cuff→slim wrist). Hand
  unchanged. The sleeve/skin boundary sits at the rolled cuff, away from the elbow, so the bend stays
  clean.
- **Rebuild/validate:** 8/8 build gate; 8/8 validator; 0 unweighted / 0 bad-sum. **Tris dropped again**
  (Grip 10 328 → 8 240; all roles ≤ 9.4k) — tubes are far leaner than segment+sphere stacks.
- **Look (`proof/lab05e/iteration-05/`):** base-front / base-3q — legs and arms are continuous; knee
  seam-band GONE, elbow crease GONE, shoulder flows out of the yoke (no plug). roles-3q — the whole
  crew reads cohesive. **Deformation (all six clips, z-ranges healthy, feet grounded):** kneel & pickup
  bend the knee/elbow as ONE surface — cleaner than the segmented version, no melt/gap/collapse.
- **Decision: ACCEPT.** The dominant finding is resolved. Next = build profiles (fix heavy=balloon).

---

## Loop 6 — Build profiles + fitted torso taper (fixes the balloon + weak differentiation)
- **Named weakness:** the `heavy` profile had waist (1.24) WIDER than chest (1.14), so the loft made
  a featureless barrel; and slim/standard/heavy read nearly identical because girth varied only in the
  torso, not the limbs. The standard torso was also a touch over-inflated front-back.
- **Change:** reworked SIZE — heavy is now BROAD-STOCKY (chest 1.20 > waist 1.12, thick limbs 1.20,
  shoulders 1.17, thicker neck 1.14) so it still tapers; slim is leaner (0.91/0.80, limbs 0.79, neck
  0.90). Added a per-build `neck` factor (limb girth already flows through the tube radii via LI, so
  the whole silhouette now changes, not just torso width). Trimmed the torso rings' front-back depth
  ~7% and deepened the waist pinch → a fitted V-taper, not a barrel.
- **Rebuild/validate:** 8/8 build gate; 8/8 validator; 0 unweighted / 0 bad-sum; tris flat (~8.2k).
- **Look (`proof/lab05e/iteration-06/`):** proportions-front — slim/standard/heavy now read as THREE
  distinct bodies (limb thickness + shoulder width + waist differ at a glance). allroles-front — the
  heavy roles read as stocky, not balloons. Electric (heavy+vest+hardhat) base-front reads solid; the
  hi-vis vest (the review's one praised garment) left intact. **Deformation:** Electric kneel clean
  (thick limbs bend as continuous surfaces, vest+hat stay attached, feet grounded).
- **Decision: ACCEPT.** Next = refinement batch (belt seating, face warmth, hands, boot/ankle).

---

## Loop 7 — Refinement batch (belt seating · face warmth · hands · boot/ankle)
- **Named weaknesses (from the mid-point gate's remaining notes):** belt/pouch read proud/floating;
  mouth slightly glum + cap crowds the brow; fingers too uniform + thumb read as an underside spur;
  boots slightly oversized vs a thin ankle.
- **Change:** (belt) narrowed the band to the hip width + lowered it so the shirt hem overlaps, and
  hung the pouch off a short strap connector → reads worn, not stuck on. (face) lifted the flat cap
  off the brow + a thin peak; lifted the mouth corners higher and made them skin-toned → a warmer,
  friendlier neutral-smile (not a dark dot). (hands) pushed finger-length variation (middle longest,
  pinky shortest+thinnest) with tapered tips; re-rooted the thumb on the RADIAL side angled toward
  the fingers with a thenar-web wedge; flattened the back-of-hand. (boot) trimmed instep/toe ~8% +
  a taller ankle cuff stepping down from the calf so the boot relates to the leg.
- **Rebuild/validate:** 8/8 build gate; 8/8 validator; 0 unweighted / 0 bad-sum; tris ~8.3k.
- **Look (`proof/lab05e/iteration-07/`):** base-face — cap off the brow, warmer mouth; base-hand —
  clear finger-length variation + an opposable thumb; base-lowerbody — pouch hangs on a strap, boot
  balanced; roles-front — cohesive premium crew. **Deformation:** pickup clean (bent sleeves + stride).
- **Decision: ACCEPT.** → holistic loop 8 (Scene G re-export + runtime + full validation + final gate).
