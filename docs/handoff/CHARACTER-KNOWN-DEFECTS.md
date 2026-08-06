# Project: Studio — Character Known Defects (annotated)

> **Status:** the 05I model is **rejected as a production character foundation**; the work is **substantial
> specialist correction, not a polish pass**, and **no production or Studio Lot integration is authorized**. The
> governing ruling is in `CHARACTER-ARTIST-HANDOFF-BRIEF.md`.

Everything the two owner-reviewed 05I iterations could NOT resolve, with severity, owning discipline, blocking
status, acceptance criterion and exact evidence paths. Paths are relative to the repo root. In every side-by-side,
**05H is LEFT, 05I is RIGHT**. Judge at human-review distance; management-distance readability does NOT cure these.

## BLOCKER 1 — Face and cranial form (owner target A, not reached)
**Severity:** blocker · **Discipline:** Character Art (sculpt) · **Blocking:** yes

The face reads heavy / ogre-ish at close range; procedural vertex-smoothing on this realistic CC0 head cannot reach
an approachable stylized read. Pushing the reshape/smoothing harder produced a "melting-fold" face **worse** than 05H
(recorded and reverted — see the iteration log), which also leaves **close-range facial lumpiness** on the retained
gentler version. **Cranial form was never addressed at all** by the procedural passes: skull proportion, crown
height, back-of-head volume and the side/rear head silhouette (including the silhouette beneath the hard hat) are
untouched. The neck between the hat brim and the vest collar also folds into an accordion at close range.
- `proof/lab05i/iteration-02/runtime/09-face.png`
- `proof/lab05i/iteration-02/real-gpu/front.png` (real Metal GPU close-up)
- `proof/lab05i/iteration-02/runtime/neutral-face.png` (neutral light — confirms geometry, not shading)
- Compare vs 05H: `proof/lab05i/iteration-01/runtime/09-face.png`
- **Needs:** a human face **and cranial** sculpt — forehead/brow balance, cheek and jaw mass, skull proportion,
  crown height, back-of-head volume, hard-hat-compatible silhouette, neck-to-head transition, side and rear
  silhouette.
- **Accepted when:** front, three-quarter, profile **and rear/back-of-head** views read as an approachable
  stylized worker under **both neutral and contrast-heavy light**, at **close human scale** and at
  **management-camera distance**. A favourable front view alone is **not** sufficient evidence.

## BLOCKER 2 — Hands, wrists, forearms (skinning collapse)
**Severity:** blocker · **Discipline:** Rigging / weight-paint + topology · **Blocking:** yes

On the posed + decimated exported GLB, the forearms and fingers collapse into thin **dripping "wax-drip" tendrils**
in every clip (idle/walk/talk/kneel/pickup/sit) and even at rest. It appears under neutral light too → it is
geometry / skin-weights, not shading. Root cause: the base mesh's deterministic **inverse-distance hand skinning**
cannot hold finger/wrist volume under animation; decimation aggravates it. It is present (milder) on 05H and is
**independent of the muscularity settings** (reverting them did not fix it). This is a **localized skin-weighting
and topology failure** — general animation execution and garment anchoring are sound (see "What is SOUND").
- `proof/lab05i/iteration-02/real-gpu/front.png` and `.../real-gpu/walk.png`
- `proof/lab05i/iteration-02/runtime/16-walk.png` … `20-sitting.png`
- `proof/lab05i/iteration-02/runtime/neutral-side-by-side-front.png`
- **Needs:** hand/wrist/forearm retopo (topology and edge flow) and/or **manual weight-paint**; validate volume
  across all six clips with joint-by-joint reporting.
- **Accepted when:** palm, thumb, grouped fingers, wrist and forearm hold volume across all six clips at human
  scale under neutral and runtime light, with no melting/stretching/tendrils/collapse/joint-pinch.

## BLOCKER 3 — Body mass and human-scale proportions (owner target B, partially met)
**Severity:** major, blocking for production approval · **Discipline:** Character Art (sculpt) · **Blocking:** yes

The body was slimmed from 05H's bodybuilder build toward an ordinary working adult, but **the result remains too
bulky for the intended human-scale result**. The 05I slimming was **partial**: the panel judges the shoulders and
upper body still read broad, and **part of the apparent improvement is a vest-coverage effect** rather than reduced
underlying mass. This requires a **meaningful human-scale reduction in upper-body and shoulder mass** — **more than
a minor proportional nudge** — though it does **not** necessarily require discarding the accepted CC0 base mesh.
Do **not** describe the current model as having sound, complete or production-ready proportions.
- `proof/lab05i/iteration-02/real-gpu/side-by-side.png`, `.../runtime/07-front-three-quarter.png`,
  `.../runtime/neutral-side-by-side-front.png`
- **Needs:** real upper-body and shoulder mass reduction during the human sculpt.
- **Accepted when:** the silhouette reads as an ordinary working adult in **front, three-quarter, profile and
  rear** views, **clothed** and — where the pipeline supports it — with **clothing removed or the silhouette
  isolated**, in a **neutral stance**, judged at **close human scale** and at **management-camera distance**.

## MINOR — Boot toe seam
**Severity:** minor · **Discipline:** Character Art / Technical Art · **Blocking:** no (must not regress)

The boot (a weight-inheriting offset shell) stays attached in motion — **target D remains passed** at the
attachment level — but shows a seam/crack at the toe on the GPU close-up.
- `proof/lab05i/iteration-02/real-gpu/boots.png`, `.../runtime/14-boots-feet.png`
- **Accepted when:** no visible seam or crack at the toe on a real-GPU close-up, with the boot still attached and
  deforming through all six clips.

## MINOR — Shirt / arm / neck read and the vest V-opening (owner target C, partial)
**Severity:** minor · **Discipline:** Character Art (garment) · **Blocking:** no

Short sleeves give bare warm-tan forearms at rest (the "blue arms read as skin" ambiguity is resolved at rest — GLB
dump confirms skin = warm tan, shirt a distinct fabric), but the motion hand-collapse and the **vest V-opening**
still undercut the clothed read at human scale.
- `proof/lab05i/iteration-02/runtime/11-shirt-vest-front.png`, `.../runtime/neutral-shirt-vest-front.png`
- **Accepted when:** the torso reads unambiguously as clothed at human scale under neutral and runtime light, with
  no exposed body geometry through the garments.

## What is SOUND (do not "fix" / do not regress)
These are **accepted** and must survive the correction. The failure above is localized; the rig and the animation
system as a whole are **not** written off.
- **65-joint skeleton** and its **animation compatibility**.
- **All six clips execute**; garments, belt, radio and hat **stay anchored** through every clip.
- **Boot attachment (target D) remains passed.**
- Complete hi-vis vest, closed hard hat (no exposed scalp), boots covering the feet, tool belt, radio.
- Correct **warm-tan skin material**; **3-step LOD chain**; **console-error-free runtime**.
- Clear Electric / safety-worker role read.
- `proof/lab05i/iteration-02/runtime/15-hard-hat.png`, `.../12-vest-side-wrap.png`, `.../21-lod.png`,
  `.../25-wireframe.png`, `.../24-management-distance.png`

## Reference: the failed procedural experiments (so they are not repeated)
See `docs/ASSET-LAB-05I-ITERATION-LOG.md` — rejected: box+sphere+cylinder boots; bone-guess garment placement;
over-smoothed "melting" face; over-sized "balloon" hat; `[foot,calf]` boot weighting that floated; hand-vert
muscularity scaling. And the 05H originals in `docs/ASSET-LAB-05H-FINAL-OWNER-REVIEW.md`. Those historical reports
are **preserved records**; where their status language conflicts with the current ruling, the ruling governs
(`EVIDENCE-INDEX.md`).
