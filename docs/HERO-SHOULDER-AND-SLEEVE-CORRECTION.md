# Hero — Shoulder & Sleeve Correction (05G Iteration 1)

**Owner 05F defect:** "pointed shoulder wedges / detached deltoid fins / sleeve geometry that does not
join the torso." Gated by `CORRECT_05G["shoulder"]` in `character_hero_05g.py`. Commit `4005e26`.

## Root cause

In the natural arms-down pose the torso top ring stepped down to the neck and the sleeve started as a
separate swept tube at the deltoid. The junction of the two surfaces read as an angular, slightly
pointed corner (a "wedge"), and the sleeve appeared bolted-on rather than growing out of the shoulder.

## The fix

A single rounded **deltoid cap** placed over the torso→sleeve junction, plus a small inboard fillet:

```python
if CORRECT_05G["shoulder"]:
    dc = Vector((ua_h.x - sgn*0.032, ua_h.y - 0.006, ua_h.z + 0.004))
    sb.uvsphere({f"upperarm_{s}": 0.52, f"clavicle_{s}": 0.30, "spine_03": 0.18}, 1.0, u=16, v=12,
                matrix=T(dc.x, dc.y, dc.z) @ Matrix.Diagonal((0.082*SH, 0.092*SH, 0.072*SH, 1)), mat=upper)
    # neck-side fillet closes the trapezius notch (one continuous neck→arm curve)
    fc = Vector((ua_h.x - sgn*0.090, ua_h.y - 0.004, ua_h.z + 0.018))
    sb.uvsphere({f"clavicle_{s}": 0.42, "spine_03": 0.58}, 1.0, u=12, v=8,
                matrix=T(fc.x, fc.y, fc.z) @ Matrix.Diagonal((0.056*SH, 0.062*SH, 0.048*SH, 1)), mat=upper)
```

Design choices:

- **Flattened dome, not a ball.** The cap is wider front-back than tall (z-radius 0.072 vs x/y 0.082/0.092)
  so it reads as a firm deltoid rather than a padded shoulder puck. (The first attempt was more spherical;
  reviewers flagged it as slightly full, so it was flattened ~15 %.)
- **Weighting.** Mostly `upperarm` (0.52) so the cap swings with the limb, plus `clavicle` (0.30) and
  `spine_03` (0.18) so it stays welded to the torso and does not delaminate when the arm raises.
- **Material `upper`** (shirt), so it reads as the shirt shoulder emerging under the vest armhole.

## Result

- Pointed wedge **gone** in the natural idle pose; sleeve reads as flowing out of the torso; no gap.
- Clean deform in pickup and deep kneel — the cap moves with the arm, no collapse, no shard, no
  vest-arm intersection.
- tris(LOD0) 9,876 → 10,916.

## Reviewers

A (modeler), C (rigging), D (art director): unanimous **PASS WITH NOTES**, `exceeds05F=true`, 0 must-fix.

## Remaining note

The cap is marginally fuller than 05F; at extreme raised-arm angles it can read slightly padded.
Note-level, watched in later iterations against the thinner vest for proportion — not a blocker.
Evidence: `proof/lab05g/iteration-01/` and `proof/lab05g/final/` (cmp-shoulder-front/back/side, cmp-3q,
05g-pose-idle-3q).
