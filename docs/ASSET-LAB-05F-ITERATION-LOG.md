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
