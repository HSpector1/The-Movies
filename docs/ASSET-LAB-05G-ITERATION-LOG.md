# Asset Lab 05G — Iteration Log

**Starting HEAD:** `80e8b36` (accepted 05F hero) · **Branch:** `asset-lab-05g-hero-electric-surgical-correction`
**Pipeline:** `character_hero_05g.py` (byte-identical 05F copy, gated by `CORRECT_05G` flags) →
`build_hero_05g.py` (05F-vs-05G render proof) → `build_hero_export_05g.py` (LOD export) →
reviewer panels → commit.

Scoring is 1–5. Every iteration was evaluated by at least one technical and one visual reviewer on the
actual renders (read-only; only the lead edited files).

---

## Baseline (flags all off → 05G == 05F)

Confirmed the 05G build is byte-identical to the accepted 05F hero and captured the "before" state
(`proof/lab05g/baseline/`). Toolchain verified end-to-end (Blender 5.2.0 LTS, ~17 s full render). The
three rejected regions were mapped to exact geometry from the real renders (not from memory): pointed
shoulders in the natural idle pose, a proud slab vest with a wide V opening and two bright bands, a wide
hip block with side shelves + a hanging central crotch gusset + a rear belt shelf + a side pouch box.
tris(LOD0)=9,876, height=1.819 m.

---

## Iteration 1 — Shoulders + sleeves + armpit  → commit `4005e26`

**Change:** added a rounded **deltoid cap** (weighted upperarm 0.50 / clavicle 0.32 / spine_03 0.18)
bridging the torso shoulder into the sleeve, plus a small neck-side fillet closing the trapezius notch.
Refined after review: flattened the cap ~15 % (wider front-back than tall) and trimmed the fillet so it
reads as a firm deltoid, not a padded puck.

**Reviewers (A modeler / C rigging / D art director):** unanimous **PASS WITH NOTES**, `exceeds05F=true`,
**0 must-fix**. Confirmed: pointed wedge gone in the natural pose, sleeve joins the torso, clean deform
in pickup/kneel, no new pad/lump/shard. Shared note (cap slightly full/spherical) → addressed by the
flatten pass.

| Shoulder integ. | Sleeve integ. | Armpit | Deformation |
|---|---|---|---|
| 4 | 4 | 3–4 | 4 |

tris(LOD0) 9,876 → 10,916. **Decision: CONTINUE (accepted).**

---

## Iteration 2 — Thin fitted safety vest  → commit `2de8aef`

**Change:** rebuilt the vest as a thin fitted shell — opening `gap` 0.38→0.22 rad (a zip line, not two
pods), rx/ry pulled to ~0.5 cm proud of the torso (hugs the ribs), thinner restrained reflective bands
following the surface. **Correction within the iteration:** an early attempt increased `ry` (worsening
front projection); reversed to reduce depth.

**Reviewers (B garment / C rigging / D art director):** B + D **PASS WITH NOTES**, `exceeds05F=true`,
0 must-fix. **C REVISE** — the thinner shell had lost clearance and the hem edge **pierced the shirt in
the seated fold** (a genuine deformation defect). **Bounded fix:** raised the hem above the waist fold
and graduated clearance at the hem/lower-chest (chest stays fitted). **Independently re-verified:** clip
resolved, band continuous, sit + deep-kneel clean.

| Vest fit | Thickness | Side wrap | Opening | Bands | Deformation |
|---|---|---|---|---|---|
| 4 | 4 | 3–4 | 4 | 4 | 4 (post-fix) |

tris(LOD0) unchanged (10,916). **Decision: CONTINUE (accepted after the deform fix).**

---

## Iteration 3 — Pelvis, belt, trousers  → commit `f011ef0`

**Change:** narrowed the hip loft (widest 0.159→0.150 HI, lower seat 0.132→0.120) so the hips taper into
the thighs (no lateral shelf); shrank + tucked the crotch gusset up/back between the thighs (no diaper);
slimmed the belt to a hugging line (r 0.168→0.150 g, h 0.044→0.022, 24-seg); removed the front hip
pouch; kept ONE small radio against the side hip. Refined the radio inboard and the belt slimmer after
first render.

**Reviewers (A modeler / C rigging / D art director):** unanimous **PASS WITH NOTES**, `exceeds05F=true`,
**0 must-fix**. Confirmed gone: front box, rear belt shelf, diaper, lateral hip shelf, detached seat.
No severe interpenetration in walk/kneel/sit/pickup. No regression to shoulders/vest.

| Front pelvis | Rear pelvis | Waist | Trouser seat | Hip→thigh | Deformation |
|---|---|---|---|---|---|
| 4 | 4–5 | 4 | 4–5 | 4 | 4 |

tris(LOD0) 10,916 → 10,928. **Decision: STOP-PASS (accepted).**

---

## Final holistic pass (validation-only)

Exported LOD0/1/2 + collision + `hero-05g.json` (validation OK). Wired the 05G comparison group into the
runtime (`cameraBridge.ts` 25 cameras, `reviewHarness.tsx`, `DevPanel.tsx`), added `validate-hero-05g.mjs`
(PASS) and `capture-lab05g-review.mjs`. Captured 26 runtime views **console-error-free**. Rendered the
full final evidence set. No new design work; only regression-safe wiring/validation/evidence/docs.

**Overall verdict: PASS WITH NOTES → owner real-GPU review.** Remaining notes are honest and non-blocking
(see FINAL-REPORT §7): a marginally full deltoid at raised-arm angles, the vest's side/back wrap as the
weakest axis, and a soft front-crotch form inherent to the non-bifurcated tube-leg construction.
