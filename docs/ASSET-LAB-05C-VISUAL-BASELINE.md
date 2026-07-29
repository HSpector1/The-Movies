# Asset Lab 05C — Visual Baseline (the 05B "before")

Captured from the accepted 05B HEAD `4a3ce6e` into `proof/lab05c/baseline/`. This is the honest
starting point the refinement loop must improve on.

## Owner (Howard) real-GPU verdict on 05B: TECHNICAL PASS WITH NOTES — "we are getting there."

Enumerated visual weaknesses (the 05C defect backlog):

| # | Defect | Iteration that owns it |
|---|--------|------------------------|
| 1 | Body proportions awkward | 1 |
| 2 | Torsos/clothing = stacked armor blocks | 1 (+3) |
| 3 | Shoulders excessively square/wide | 1 |
| 4 | Waist/hips/pelvis transitions unnatural | 1 |
| 5 | Hands resemble mittens/cubes | 4 |
| 6 | Feet/shoes overly angular | 4 |
| 7 | Faces readable but simplistic/weakly expressive | 2 |
| 8 | Eyes/brows/mouth/nose/hair/headwear placement + shape | 2 |
| 9 | Some characters almost bald / unfinished | 2 |
| 10 | Hi-vis vest bulky and floats off the body | 1 (partial) + 3 |
| 11 | Clothing boundaries exist but not naturally worn | 3 |
| 12 | Roles differ mostly by colour/headwear, not outfit | 3 |
| 13 | Kneeling/crouching expose stiff shoulders/hips/knees | 4 |
| 14 | Still read as technical test figures, not charming game people | all |
| 15 | Review scene overexposed; no character-focused cameras | 5 |

## Baseline technical facts (locked, must not regress)
- ~4.0–4.4 k tris/char (LOD0); 65-bone UAL rig; 8 roles; six required clips; face on −Y front;
  0 unweighted / 0 bad-sum; console-error-free Scene G runtime.

Baseline evidence: `proof/lab05c/baseline/` (role/skin/palette/headwear lineups + hero Grip
angles/poses). Old rejected Lab-05: `proof/lab05/thumbnails/`.
