# Hero — Pelvis, Belt & Trouser Correction (05G Iteration 3)

**Owner 05F defects:** (C) a large rectangular front crotch box, (D) a rear horizontal belt shelf, plus a
"diaper" hanging gusset, a lateral hip shelf (the hip block was wider than the legs), and a separate seat
block. Gated by `CORRECT_05G["pelvis"]`. Commit `f011ef0`.

## The fix

Four coordinated changes turn the pelvis into one continuous trouser silhouette:

1. **Narrowed hip loft** — widest hip 0.159→0.150 HI, lower seat 0.132→0.120 HI, so the hips **taper into
   the thighs** instead of overhanging them. Kills the lateral shelf while keeping the seat's `+Y` push so
   the buttock still reads.
2. **Tucked crotch gusset** — the inseam gusset shrunk (0.060→0.046 HI) and pushed further back/up so it
   is fully tucked between the thigh tops. It closes the inner-thigh V from behind and no longer hangs at
   the front as a diaper flap. Kept its `pelvis + both-thighs` weighting so a wide stance still stretches
   it (no inseam notch on the pickup pose).
3. **Slim belt** — radius 0.168→0.150 g, height 0.044→0.022, 24-seg smooth edge. It now reads as a hugging
   belt line, not a projecting horizontal shelf across the rear waist / a box across the front.
4. **One accessory** — removed the front hip pouch; kept a single small radio against the **side** hip
   (accessory policy: ≤1, against the hip, not spanning the crotch, not a shelf).

```python
hip_rings = [  # CORRECT_05G branch
    (pelvis.z+0.086, 0.004, 0.146*HI, 0.110*HI),  # waistband
    (pelvis.z+0.040, 0.004, 0.148*HI, 0.115*HI),  # upper hip
    (pelvis.z-0.010, 0.008, 0.150*HI, 0.120*HI),  # widest hip (narrowed 0.159->0.150)
    (pelvis.z-0.055, 0.022, 0.145*HI, 0.128*HI),  # seat (still pushed back for the buttock)
    (pelvis.z-0.100, 0.016, 0.120*HI, 0.112*HI),  # lower seat (tapers toward the legs)
    (crotch_z,       0.008, 0.096*HI, 0.094*HI),  # crotch base (narrow, tucked)
]
```

## Result

- Front rectangular crotch box **gone**; rear belt shelf **gone**; diaper flap **gone**; lateral hip
  shelf **gone**; rear reads as one continuous trouser seat.
- No severe hip/leg interpenetration in walk, kneel, sit, or pickup (the narrowing did not introduce a
  collision; the tucked gusset still stretches on a wide stance). tris(LOD0) 10,916 → 10,928.

## Reviewers

A (modeler), C (rigging), D (art director): unanimous **PASS WITH NOTES**, `exceeds05F=true`, 0 must-fix.
All confirmed the box/shelf/diaper/hip-shelf/detached-seat are gone and shoulders + vest did not regress.

## Remaining note (honest)

The front crotch still reads as a **soft rounded form** (not a box or diaper) and a **faint belt seam**
persists. Both are inherent to the non-bifurcated tube-leg construction — a true fly/inseam would need
bifurcated trouser legs, which is beyond a surgical correction. It clearly reads as trousers; note-level,
not a blocker. Evidence: `proof/lab05g/iteration-03/` and `proof/lab05g/final/` (cmp-pelvis-front/back/
side, cmp-lowerbody, cmp-walk/kneel/sit/pickup).
