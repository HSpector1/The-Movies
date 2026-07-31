# Hero — Fitted Safety Vest Correction (05G Iteration 2)

**Owner 05F defect:** the vest read as "two padded chest pods" — excessive rib-cage projection, excessive
thickness, a wide centre opening, weak side wrap, reflective bands reinforcing a block. Gated by
`CORRECT_05G["vest"]`. Commit `2de8aef`.

## The fix

The vest is an open arc-loft shell over the torso. Three changes made it read as fitted workwear:

1. **Narrower opening** — `gap` 0.38 → 0.22 rad. The two front panels close into one intentional zip
   line instead of a wide V that split the vest into two pods.
2. **Hugs the rib cage** — `rx`/`ry` pulled in so the shell sits ~0.5 cm proud of the torso (was ~1.4 cm).
   `ry` (front-back depth) is the "projection from the rib cage" the owner rejected, so it follows the
   torso's naturally flat (wide, shallow) chest ellipse rather than ballooning off the chest.
3. **Restrained bands** — the two reflective strips pulled in to match the thinner shell (~0.2 cm proud,
   was ~0.4 cm) and thinned in Z, so they read as tape on the surface rather than rails around a block.

```python
gap = 0.22
vest_rings = [
    ("spine_01", 0.0, yb+0.008, s1.z+0.044, 0.152*WA, 0.112*WA),   # hem: above the waist fold + belly clearance
    (blend(s1,s2), 0.0, yb-0.004, (s1+s2)/2, 0.178*CH, 0.115*CH),  # lower chest: clearance for the seated fold
    ("spine_02", 0.0, yb-0.008, s2.z+0.010, 0.183*CH, 0.110*CH),   # chest: ~0.5 cm proud, hugging
    (w_up, 0.0, yb-0.004, (s2+s3)/2+0.005, 0.189*SH, 0.102*SH),    # upper chest
    (w_top, 0.0, yb-0.002, s3.z-0.018, 0.186*SH, 0.096*SH),        # top: armhole/neck edge, flush
]
```

## Deformation fix (the important one)

Thinning the shell removed the clearance the fatter 05F vest had. The rigging/deformation reviewer caught
the hem **edge piercing the shirt in the seated pose**, where the abdomen folds — a genuine, expected
consequence, not a modeling artifact (the same edges were clean in the neutral T-pose).

**Bounded fix, without re-fattening the chest:** raise the hem above the waist fold line and graduate the
clearance so the **hem + lower-chest get more depth** while the **chest stays fitted**. The chest — where
the pod complaint lived — is untouched by the fix; only the belly zone gained room to clear the fold.
Independently re-verified: clip resolved, reflective band continuous, sit **and** deep-kneel both clean.

## Result

- Pod look **gone**; narrow intentional opening; hugs the ribs; real side/back wrap; thin bands.
- No shirt clipping in neutral or any deform pose. tris unchanged (10,916).

## Reviewers

B (garment) + D (art director) **PASS WITH NOTES**, `exceeds05F=true`, 0 must-fix. C (rigging) initially
**REVISE** on the seated clip → fixed and re-verified **PASS**.

## Remaining notes

Side/back wrap is the weakest axis (the back panel reads as a fairly flat band); a faint two-panel seam
and slight front-panel convexity linger. It reads as fitted hi-vis, not armor — note-level, not a blocker.
Evidence: `proof/lab05g/iteration-02/` and `proof/lab05g/final/` (cmp-vest-front/back/side, cmp-sit-3q,
05g-vest-side).
