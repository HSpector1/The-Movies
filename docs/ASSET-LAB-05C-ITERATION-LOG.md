# Asset Lab 05C — Iteration Log

Art-refinement loop (max 5) on the 05B crew. Target = charming stylized management-game human
(Two Point tier). Baseline = 05B HEAD `4a3ce6e` (proof/lab05c/baseline). Each iteration gated by
independent read-only reviewers.

---

## Iteration 1 — Proportions & silhouette

- **Starting HEAD:** `4a3ce6e` (05B) → branch `asset-lab-05c-character-art-refinement-loop`.
- **Ranked defects (from owner verdict):** boxy armor torso; square/wide shoulders; unnatural
  waist/hips/pelvis. (Selected cluster = the body form.)

### Implementation (`character2.py`)
- Replaced the stacked-box torso with rounded **tapered ellipsoids** (`ell()` helper): waist →
  chest → shoulder yoke, + a trapezius blend and a low shirt-hem ellipsoid overlapping the
  waistband (no shirt↔trouser gap). Flattened front-to-back so it reads fit, not pot-bellied; the
  belly/waist **tuck back** relative to the chest → athletic side profile.
- Rounded, **narrowed, sloped shoulder caps** (was a wide square-reading cap).
- Rounded **pelvis/hips** ellipsoids (no boxy hip); belt is now a **rounded band** (flattened disc),
  not a slab.
- Reshaped the hi-vis vest into a **fitted rounded shell** ~1.5 cm proud of the chest (partial —
  full vest work is iteration 3).
- Added a 3rd proportion profile **slim** (`SIZE`): slim/average/wide via girth (skeleton height is
  shared/locked, so body-type reads through build width — cannot break animation/clothing).

### Validation
- `GATE_TEST_OK` (face-front gate PASSES correct / REJECTS face-on-back — unchanged); **0
  unweighted / 0 bad-sum verts** after the torso rebuild. ~7.5 k tris/char (within the new 6–12 k
  LOD0 budget). Feet grounded (min z ≈ 0). Deformation: torso holds volume with **no melt/shard/
  collapse across all six poses**.

### Reviewers (parallel Workflow, read-only)
- **Proportion/silhouette: PASS WITH NOTES**, improved over baseline — torso no longer armor; real
  waist; sloped shoulders; 3 profiles read as distinct body types. Notes: lower-torso paunch + boxy
  belt (→ **fixed same iteration**: belly tucked back, belt→band).
- **Deformation: PASS WITH NOTES**, improved — zero melt/shard in all 6 poses incl. deep kneel. The
  "floating feet" note is a no-ground-plane **evidence** artifact (numerically grounded); review
  presentation/ground is iteration 5's scope.
- **Appeal/honesty: CONCERNS** — the single critical is the **face** (asymmetric eyes, lump nose,
  uneven mouth), which is **explicitly iteration 2's scope**, not an iter-1 regression. Torso-ball
  note addressed by the belly-tuck pass.

### Scores (1–5, moving dims): proportion 4 · silhouette 4 · clothing-fit 3 · shoulder-deform 4 ·
hip/knee-deform 4 · appeal 3 · performance 4 · evidence-honesty 5. (face 2 / hair 2 / hands 2 /
feet 2 unchanged — owned by iters 2/4.)

### Decision: **CONTINUE (iteration 1 ACCEPTED).** Primary boxiness complaint fixed; face is the
next iteration's job. Evidence: `proof/lab05c/iteration-01/` (Grip + Electric heroes; proportions/
roles/skin/palette/headwear lineups; six poses).

### Iteration 2 agenda (from the appeal reviewer's critical + owner notes)
Face & head: symmetric focused eyes, cleaner brow/nose/mouth with intentional friendly-neutral
expression; ≥4 hairstyle silhouettes; headwear that looks worn (not balanced); fix bald/unfinished
heads.

---

## Iteration 2 — Face, head, hair, headwear

- **Starting HEAD:** `1e4526c` (iter 1).
- **Ranked defects:** faces read as unfinished/startled test figures (iter-1 appeal critical);
  bald-under-hats; heads interchangeable; hats balanced-not-worn.

### Implementation (`character2.py`)
- **Face reworked:** googly white eyeballs → clean **dark almond eyes + white catch-light** (Two
  Point idiom); softened nose (bump, not wedge); friendly closed mouth; hair-coloured brows.
  Tightened eye spacing + shrank nose (was spaced-out). Symmetric by construction.
- **Hair:** `_add_hair` with ≥4 silhouettes (short/sidepart/bun/ponytail/curly/quiff) for bare
  heads; `_add_hair_fringe` (band + temple sideburns) under hats so hatted heads are **never bald**.
  Darkened light/grey hair in `char_materials` so Office no longer reads bald on pale skin.
- **Headwear:** hard-hat dome hugs the crown with the brim **raised clear of the eyeline** (was a
  bowl balanced high, shadowing the eyes).
- **Office:** switched from a boxy long-coat cone to a lightweight dark top (long coat is Director);
  clipboard pushed clearly in front of the torso (was clipping).

### Validation: `GATE_TEST_OK`; 0 unweighted / 0 bad-sum unchanged; ~8 k tris/char.

### Reviewers (parallel Workflow): **face PASS WITH NOTES** (googly gone, bald-under-hat fixed,
hats worn, ≥4 hairstyles; notes = closeup eye mirror-symmetry, hairstyle distinctness at distance)
and **appeal PASS WITH NOTES** (PA/Grip now charming; the Office blank-head holdout → **fixed same
iteration** via darker hair + dropped boxy coat). Both improved over iter1.

### Scores (moving): face-readability 4 (was 2) · hair/headwear 4 (was 2) · appeal 4 · overall
human-readability 4. Others carry from iter 1.

### Decision: **CONTINUE (iteration 2 ACCEPTED).** The iter-1 critical (face) is resolved to
"charming." Evidence: `proof/lab05c/iteration-02/` (hero face close-ups, hairstyles/headwear
lineups, role lineup).

### Iteration 3 agenda
Clothing & role silhouettes: real collars/cuffs/hems/waistbands; fully fitted hi-vis vest;
per-role garments (PA lightweight jacket, Grip/Electric work shirt+vest, Maintenance coveralls,
Office cardigan/blouse) so roles read by OUTFIT not just colour+headwear; refine the Director long
coat; give Office's dark top real tailoring.
