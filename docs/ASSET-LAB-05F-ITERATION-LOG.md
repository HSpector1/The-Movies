# Asset Lab 05F — Iteration Log (hero Electric character proof, max 6 iterations)

Baseline = 05E HEAD `6169574`. One hero Electric (`character_hero.build_hero`, source
`blender/studio_pipeline/character_hero.py`) built additively on the accepted 05E pipeline; the 05E
Electric (`character2.build_character2("Electric")`) is the UNCHANGED before-state. Each loop:
rank defects → rebuild one region as intentional continuous geometry → neutral render + all-six-clip
deformation → specialist review (≥1 technical + ≥1 visual) → score → accept/revise/revert → commit.
Neutral honest lighting (mid-grey, AgX, exposure −0.55); evidence shows weaknesses, not hides them.

05E Electric confirmed defects (baseline `proof/lab05f/baseline/electric-05e`): A inflated vest rings ·
**B rear pelvis = detached diaper shell (top priority)** · C front crotch protrusion · D shoulder wedges ·
E thin hands · F block boots · G flat face · H bent poses expose modeling.

---

## Iteration 1 — Pelvis & trouser reconstruction (defects B + C)
- **Ranked top defects:** B rear diaper shell · C front crotch protrusion · pelvis→thigh separation ·
  floating hip pockets · jagged waistband.
- **Correction cluster (pelvis/trousers only):** replaced the 05E pelvis (3 ellipsoids + a crotch-ball)
  with ONE continuous lofted hip/seat (6 rings, 18 segments to match the leg tubes): waistband → hip →
  shaped SEAT (rear rings pushed back for the buttock) → lower seat → narrow tucked crotch base. The
  leg tubes' top rings were widened + raised so they cover the hip loft's lower edge (the seat→thigh
  junction is hidden, not two surfaces crossing). Crotch = a thin RECESSED inseam gusset (not a proud
  ball). Removed the redundant waistband cylinder + reseated the belt as a clean 18-seg proud band, and
  flattened the floating hip pouch/radio into hip-hugging pockets (all were crenellation / floating-cube
  sources).
- **Files:** NEW `blender/studio_pipeline/character_hero.py`, NEW `blender/build_hero.py`. (character2.py
  and all 05E assets untouched.)
- **Blender result:** builds clean; **9,092 tris** (05E Electric 9,568), height 1.827 m.
- **Deformation (all six clips):** feet grounded every clip (z-min ≈ −0.01, kneel −0.04); sit/kneel/
  pickup hold the seat as one continuous cushion — no collapse, seat separation, crotch pinch, or shard.
- **Specialist review (Workflow — Character Modeler + Rigging + Art Director):** all three **PASS WITH
  NOTES**, rear-seat 4/5 + crotch 4/5. Modeler & Rigging (the two required) had **no must_fix**: "the
  05E detached diaper shell is gone… one continuous seat lofting into both thighs… front protrusion
  eliminated… deformation holds cleanly through sit and kneel." One convergent must_fix (Art Director):
  a jagged mid-rear seam. → **addressed this loop** (removed the waistband-cylinder + 22-vs-18-seg belt
  beat that caused it); the small residual band in the side-by-side is the OLD 05E vest hem (orange),
  which Iteration 2 rebuilds — not a trouser defect.
- **Scores (1–5):** rear-seat 4 · crotch 4 · torso 4 · pelvis 4 · lower-body silhouette 4 · sit-deform 4 ·
  kneel-deform 4 · pickup-deform 4.
- **Evidence:** `proof/lab05f/iteration-01/` (hero base grid + region close-ups + six poses ×3 angles +
  `cmp-*` 05E-vs-05F side-by-sides).
- **Decision: ACCEPT — CONTINUE.** The top rejection issue (B) and defect C are materially fixed and
  independently confirmed. Next = Iteration 2 fitted safety vest (retires the vest-ring construction +
  the residual vest-hem crenellation).

---

## Iteration 2 — Fitted safety vest (defect A)
- **Ranked top defect:** A — the 05E hi-vis vest = three inflated ellipsoid rings + two rigid white
  rail cylinders sitting well proud of the torso (flotation/armor read, no opening, no armhole fit).
- **Correction cluster (vest only):** new open-arc-loft garment primitive (`meshgen.add_arc_loft` +
  `skinning.arc_loft`) — an OPEN, uncapped lofted shell. Rebuilt the vest as a FITTED arc-loft shell
  following the torso rings ~1.5 cm proud, spine-weighted: an OPEN FRONT (a ~40° zip gap so the shirt
  shows between two front panels), ending below the shoulder yoke (natural armholes) and below the neck
  (natural neck opening). The reflective bands are now two THIN white arc-strips wrapping the sides/back
  (restrained), not rigid full-ring rails.
- **Files:** `character_hero.py` (vest stage flipped on + new vest), `meshgen.py`, `skinning.py` (new
  primitive). character2.py + 05E assets untouched.
- **Blender result:** **8,116 tris** (leaner than the ellipsoid-ring vest); height 1.827 m.
- **Deformation:** vest is spine-weighted and bends with the torso — pickup/kneel/walk/talk/sit show no
  torso piercing, no detachment, no armhole/arm intersection. The iteration-1 residual vest-hem
  crenellation is gone (the fitted hem is clean).
- **Specialist review (Garment Artist + Rigging + Art Director):** all three **PASS WITH NOTES**, vest
  fit 4/5. Garment Artist (no must_fix): "resolves every reason the owner rejected 05E… a constructed
  shoulder-anchored safety vest." Two convergent must_fix items, both in the SHOULDER region: Rigging —
  the armhole edge delaminates off the deltoid on shoulder abduction (under-weighted to clavicle);
  Art Director — add an over-shoulder yoke so it reads shoulder-hung, "the one change from believable to
  unmistakable." → **addressed this loop with one change:** added hi-vis **over-shoulder yoke straps**
  (clavicle-weighted) connecting the front panels to the back across each trapezius, + blended a little
  clavicle into the two upper vest rings, + a proud hem for lumbar clearance + a wider front gap.
  Re-render: sit/kneel-rear now show the armhole tracking the shoulder with no floating flap; the vest
  reads as a shoulder-hung safety vest.
- **Scores (1–5):** vest-fit 4 · open-front 4 · shoulder-fit 4 · reflective-restraint 4 · vest-deform 4.
- **Evidence:** `proof/lab05f/iteration-02/`. **Tris 8,172** (leaner than the 05E ring vest).
- **Decision: ACCEPT — CONTINUE.** Defect A materially fixed + independently confirmed; both must_fix
  items resolved. Next = Iteration 3 shoulders + arms + hands.

---

## Iteration 3 — Shoulders, arms & hands (defects D + E)
- **Ranked top defects:** E thin/flat hands (harsh wrist, weak palm) · D weak armpit / sleeve-to-torso.
  (The 05E tube arms already gave a mostly continuous shoulder — the deltoid ring meets the yoke — so
  the shoulder needed a light touch, not a rebuild.)
- **Correction cluster:** (arms) added an **armpit fill** (upperarm/spine-weighted) closing the hollow
  under the deltoid so the arm flows out of the body. (hands) rebuilt the hand FULLER + intentional: a
  thicker palm with real volume (z 0.018→0.030), four GROUPED fuller fingers packed close (little splay,
  gentle curl) with a knuckle ridge across the base, and a full opposable thumb with a thenar base.
- **Files:** `character_hero.py` (arms+hands stages on). character2.py + 05E untouched.
- **Blender result:** 8,340 tris; height 1.827 m.
- **Deformation:** hand is rigid to hand_{s} (deform-safe); armpit fill weighted upperarm/spine.
- **Specialist review (Character Modeler + Rigging + Art Director):** all three **PASS WITH NOTES**
  (Modeler hands 8/shoulders 8.5, Rigging 7.5/8, AD 6/7.5 — on a 1-10 read). Both technical reviewers:
  **no must_fix** — "both targeted defects materially resolved… hand reads as intentionally modelled…
  wrist is the biggest win (soft cuff fillet), no broken wrist / no detachment… armpit holds in pickup."
  Art Director's 2 must_fix (convergent with the Modeler's minor notes): deepen the finger valleys +
  round the fingertips (was reading fused/mitten-slab); soften the wrist crease ring. → **both addressed
  this loop:** added a smooth wrist blend sphere, widened the finger fan (deeper valleys) + thinned +
  rounded/tapered the fingertips, rounded the thumb tip. Re-render: grouped digits read distinctly, tips
  rounded, wrist organic.
- **Scores (1–5):** hands 4 · shoulders 4 · armpit 4 · hand-deform 4 · wrist 4.
- **Evidence:** `proof/lab05f/iteration-03/`. **Tris 9,100.**
- **Carried note (out of scope, for Iteration 5):** Rigging flagged a dark faceted notch at the crotch/
  inner-thigh in the wide-stance PICKUP pose — a pelvis-weight/inseam deform artifact to check in the
  full deformation pass.
- **Decision: ACCEPT — CONTINUE.** Defects D + E materially fixed + independently confirmed; the two
  hand must_fix items resolved. Next = Iteration 4 work boots + lower-leg integration.
