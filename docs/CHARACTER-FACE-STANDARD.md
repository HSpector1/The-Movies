# Character Face Standard (Asset Lab 05B)

## Durable, front-facing, MODELED geometry (not a projected card)

The Lab-05 face was a flat card authored at **+Y** while the rig faces **−Y** — so it sat on the
back of the head and was edge-on/invisible at profile. Replaced with **real modeled facial
geometry** placed on the measured **−Y front hemisphere**, weighted 100% to `Head`:

| Feature | Geometry | Material |
|---------|----------|----------|
| Eyes | white sphere + dark pupil (pupil pokes further −Y) | white / dark |
| Eyebrows | small dark boxes above eyes | dark (fixed) |
| Nose | skin wedge protruding −Y | skin |
| Mouth | dark box below nose | dark (fixed) |
| Ears | flattened spheres at ±X | skin |

All feature Y-coordinates are `head_center.y − 0.092` or further −Y, so features are **physically
on the front** and cannot migrate to the back through export/runtime/animation. Facial features
use a FIXED dark material (independent of hair colour) so grey-haired roles keep dark brows/mouth.

## Enforcement (automated)

`charvalidate.validate` computes the mean Y of head-region dark-feature verts and **fails the
pipeline** if it is not on −Y (mean y must be < −0.02). `test_character_gate.py` proves this:
a correct build passes; a 180°-flipped build is `correctly REJECTED (FACE-NOT-ON-FRONT mean y=0.106)`.
The face-front invariant is also verified to survive LOD decimation (feature mean y −0.106/−0.106/
−0.107 at LOD0/1/2) and confirmed in the Three.js runtime (crew face the +Z camera; backs show
hair only).

## Evidence
`proof/lab05b/final/base-face-front.png` (features present) vs `base-face-back.png` (hair only).
Head rendered front / back / side / three-quarter in the iteration + final proof sets.
