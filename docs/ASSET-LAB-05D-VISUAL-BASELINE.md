# Asset Lab 05D — Visual Baseline (the 05C "before")

Captured from accepted 05C HEAD `d912ca1` into `proof/lab05d/baseline/`. 05C was a technical +
early-visual PASS WITH NOTES; 05D targets professional finish.

## Inherited 05C weaknesses (the 05D backlog)
| # | Weakness | Loop that owns it |
|---|----------|-------------------|
| 1 | Grouped-paddle hands (not convincing) | 6 |
| 2 | Faces improved but simple / limited expression | 2, 3, (4) |
| 3 | Hair/headwear can take another polish; no facial hair | 4 |
| 4 | Clothing reads but lacks construction detail | 7 |
| 5 | Limited age / face / silhouette variety | 9 |
| 6 | Body profiles = uniform scaling, not ratio signatures | 1, 5 |
| 7 | Limbs read as straight tubes | 1, 5 |
| 8 | 9 material slots / character | 12 (documented justification) |
| 9 | Variants risk reading as palette swaps | 8, 9, 11 |
| 10 | Runtime lighting flatter than Blender | (app lighting; diagnostic) |

## Locked baseline facts (must not regress)
Shared 65-bone rig; 6 required clips; face-on-front; 0 unweighted / 0 bad-sum; ~9.8k tris LOD0;
console-error-free Scene G runtime.

Evidence: `proof/lab05d/baseline/` (role/skin/palette/headwear/hairstyle/proportion lineups + hero
Grip/Office angles+poses). Prior labs: `proof/lab05c/`, `proof/lab05b/`.
