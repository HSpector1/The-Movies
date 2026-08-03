# Asset Lab 05I — Corrective Character Pass · Brief (owner-approved, amended 2026-08-03)

**A finishing and correction pass — not** a new foundation experiment, workflow replacement, production-integration
milestone, renderer milestone, or role-propagation milestone.

## Baseline & branch
- Approved source: `ddfd69fbc22be313f9dbb548c2b16032c9802daa` (contains the accepted 05H foundation + the final-review
  tooling + matched-comparison + real-GPU infrastructure, no production integration).
- Branch: `asset-lab-05i-corrective-character-pass` (cut off `ddfd69f`).
- Pre-branch verify: HEAD==ddfd69f, clean tree, local==backup, 05G/05H assets unchanged. (All confirmed.)

## Implementation structure (thin additive layer — not a full fork)
- The accepted 05H generator (`authored05h.py`) is **unchanged**.
- New additive layer `blender/studio_pipeline/authored05i.py` imports the 05H base + garment helpers, applies only
  the approved corrections, and exports separately-named assets.
- Required identity: `electric_hero_05i.glb`, `electric_hero_05i_LOD1.glb`, `electric_hero_05i_LOD2.glb` (+ `_COL`).
  (LOD suffix uses the pipeline-native `_LOD1/_LOD2` casing so the runtime/validators resolve it; the ruling's
  lowercase `_lod1` denotes the same assets.)
- 05H GLBs, Blender sources, and generator outputs remain **byte-unchanged** (verified by sha256).

## Approved correction scope (only this)
**A · Garments** — reconstruct the work shirt as visible garment geometry; a COMPLETE safety vest with readable
front opening + continuous side/rear wrap; no broken/missing/isolated geometry; no nude/body-painted torso read;
stable in all six clips.
**B · Body & face** — reduce exaggerated muscularity; soften shoulders/chest/arms/neck + facial structure
(brow/nose/jaw/cheeks/ears/head-neck balance); target *approachable stylised studio worker* (not superhero /
bodybuilder / ogre / fashion model / photoreal). Preserve topology order, rig compatibility, deformation quality.
**C · Production details** — boots that fully conceal the feet (no toe penetration); a correctly-fitted hard hat
with no exposed scalp; restrained, intentional hair; stable belt/radio; clear Electric-worker identity; corrected
review lighting for honest material judgement. Minor trouser corrections allowed for clothed/pelvis/seat/deformation
continuity — **no** separate trouser-topology redesign.

## Iteration authorization
**05I ITERATION 1 ONLY.** Iteration 1 addresses the whole cluster (garments, proportions, face, boots, hat, hair,
neutral materials), then: export LODs, validate rig + six clips, capture matched 05H↔05I evidence, real-GPU review,
specialist + adversarial review, commit, push the isolated branch, and **stop for owner review**. Iteration 2
requires a new owner instruction based on the actual Iteration-1 evidence. Total limit: two owner-reviewable
iterations. Small local adjustments within one iteration are permitted and logged honestly.

## Review lighting (§7)
Provide both the existing review environment and a strictly-neutral evaluation setup, so actual skin/shirt/vest
colour, lighting tint, and surface/geometry problems can be told apart. Do not classify a defect as "lighting"
without matched neutral-light + material inspection. Do not redesign production lighting.

## Deliverables
`proof/lab05i/`, `docs/ASSET-LAB-05I-{BRIEF,ITERATION-LOG,OWNER-REVIEW-GUIDE,ITERATION-1-REPORT}.md`, and an updated
local review index (05H↔05I comparisons, static/animation/LOD/neutral-light review, known defects, reviewer
findings). **No pull request. No merge.** Push only the isolated branch to `backup` (normal, non-force).

## Explicit exclusions
No base replacement / other base body / new skeleton / new animations / clip edits / role propagation / named
talent / production integration / D1 / D1-A / Engine changes / live-3D or sprite renderer proof / Phaser+Three
coexistence / production-repo changes / texture-leak fix / PR / merge / force push. D1-A remains an independent
future decision, not authorized here.

## Definition of done (Iteration 1)
Vest complete & reads as a garment; torso clothed (not nude/blue); boots fully cover the feet; hat closes (no
scalp); hair restrained; proportions softer/approachable; face visibly less gaunt/ogre-like; clear Electric role;
all six clips functional with no significant new clipping/deformation regression; skeleton exactly 65 joints;
05G/05H byte-unchanged; LODs preserve the silhouette; TypeScript + Vite build pass; validators pass; runtime
console-error-free. Do not self-declare final human-scale production approval — return the evidence for owner
judgement (ACCEPT ITERATION 1 / ITERATION 2 REQUIRED / STOP — HUMAN ARTIST REQUIRED).
