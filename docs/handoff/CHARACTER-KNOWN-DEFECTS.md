# Project: Studio — Character Known Defects (annotated)

Everything the two autonomous iterations could NOT resolve, with exact evidence paths. Paths are relative to the
repo root. In every side-by-side, **05H is LEFT, 05I is RIGHT**. Judge at human-review distance; management-distance
readability does NOT cure these.

## BLOCKER 1 — Face and head (owner target A, not reached)
The face reads heavy / ogre-ish at close range; procedural vertex-smoothing on this realistic CC0 head cannot reach
an approachable stylized read. Pushing the reshape/smoothing harder produced a "melting-fold" face **worse** than 05H
(recorded and reverted — see the iteration log). The neck between the hat brim and the vest collar also folds into an
accordion at close range.
- `proof/lab05i/iteration-02/runtime/09-face.png`
- `proof/lab05i/iteration-02/real-gpu/front.png` (real Metal GPU close-up)
- `proof/lab05i/iteration-02/runtime/neutral-face.png` (neutral light — confirms geometry, not shading)
- Compare vs 05H: `proof/lab05i/iteration-01/runtime/09-face.png`
- **Needs:** a human face/head sculpt (soft brow/jaw/nose/cheeks/ears/neck; hard-hat-compatible silhouette).

## BLOCKER 2 — Hands, wrists, forearms (skinning collapse)
On the posed + decimated exported GLB, the forearms and fingers collapse into thin **dripping "wax-drip" tendrils**
in every clip (idle/walk/talk/kneel/pickup/sit) and even at rest. It appears under neutral light too → it is
geometry / skin-weights, not shading. Root cause: the base mesh's deterministic **inverse-distance hand skinning**
cannot hold finger/wrist volume under animation; decimation aggravates it. It is present (milder) on 05H and is
**independent of the muscularity settings** (reverting them did not fix it).
- `proof/lab05i/iteration-02/real-gpu/front.png` and `.../real-gpu/walk.png`
- `proof/lab05i/iteration-02/runtime/16-walk.png` … `20-sitting.png`
- `proof/lab05i/iteration-02/runtime/neutral-side-by-side-front.png`
- **Needs:** hand/wrist/forearm retopo and/or manual weight-paint; validate volume across all six clips.

## MAJOR — Proportions (owner target B, partial)
Slimmed from 05H's bodybuilder build toward an ordinary working adult, but the panel judges the shoulders/upper body
still read broad in places and the improvement is partly a vest-coverage effect.
- `proof/lab05i/iteration-02/real-gpu/side-by-side.png`, `.../runtime/07-front-three-quarter.png`,
  `.../runtime/neutral-side-by-side-front.png`
- **Needs:** modest proportional balance during the human sculpt (not a rebuild).

## MINOR — Boot toe seam
The boot (a weight-inheriting offset shell) stays attached in motion (target D met at the attachment level) but shows
a seam/crack at the toe on the GPU close-up.
- `proof/lab05i/iteration-02/real-gpu/boots.png`, `.../runtime/14-boots-feet.png`

## MINOR — Shirt/arm/neck read (owner target C, partial)
Short sleeves give bare warm-tan forearms at rest (the "blue arms read as skin" ambiguity is resolved at rest — GLB
dump confirms skin = warm tan, shirt a distinct fabric), but the motion hand-collapse and the vest V-opening still
undercut the clothed read at human scale.
- `proof/lab05i/iteration-02/runtime/11-shirt-vest-front.png`, `.../runtime/neutral-shirt-vest-front.png`

## What is SOUND (do not "fix" / do not regress)
Complete hi-vis vest, closed hard hat (no exposed scalp), boots covering + attached, tool belt, radio, correct
warm-tan skin material, 65-joint rig, all six clips deform (garments stay anchored), 3-step LOD, console-error-free
runtime, clear Electric/safety-worker role read.
- `proof/lab05i/iteration-02/runtime/15-hard-hat.png`, `.../12-vest-side-wrap.png`, `.../21-lod.png`,
  `.../25-wireframe.png`, `.../24-management-distance.png`

## Reference: the failed procedural experiments (so they are not repeated)
See `docs/ASSET-LAB-05I-ITERATION-LOG.md` — rejected: box+sphere+cylinder boots; bone-guess garment placement;
over-smoothed "melting" face; over-sized "balloon" hat; `[foot,calf]` boot weighting that floated; hand-vert
muscularity scaling. And the 05H originals in `docs/ASSET-LAB-05H-FINAL-OWNER-REVIEW.md`.
