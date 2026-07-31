# Asset Lab 05H — Authored Base Character Pipeline Proof — STATUS REPORT

**Branch:** `asset-lab-05h-authored-base-character-proof` (off 05G `ee83d0e`) · backed up to
`backup` remote. **Verdict: PATH A PROVEN; authored-base hero PASS WITH NOTES.** A complete,
in-engine-reviewable, console-error-free authored-base Electric hero that clearly exceeds 05G on
human-scale anatomy. Remaining items are refinement polish (face appeal, skin warmth, hair), not
blockers to the proof.

## The question 05H had to answer
Can Project: Studio build a convincing human-scale character on a professionally authored base
while keeping the accepted 65-bone skeleton, six clips, GLB export, LODs, and Three.js runtime?

**Answer: YES — demonstrated.** A verified CC0 human base mesh was imported (geometry only),
re-posed to the armature's T-pose, deterministically skinned to the 65-bone UAL rig, and plays
all six accepted clips with natural deformation. The owner's structural 05G rejections (shoulder
spheres, pelvis box/shelf, diaper seat) are gone at the base level because the whole body is now
continuous authored quad topology rather than assembled primitives.

## What is DONE, committed, and backed up
- **Provenance (PASS):** Blender Studio Human Base Meshes v1.0.0, CC0 1.0, 3-way verified;
  source hashed (gitignored) + one neutral mesh committed under `licenses/asset-lab-05h/`.
- **Workflow decision:** Path A selected and scored vs Path B and the rejected procedural path.
- **Iteration 1 — authored base body:** `blender/studio_pipeline/authored05h.py` +
  `build_hero_05h.py` + `build_hero_export_05h.py`. Import→weld (12,502 quads)→align 1.75 m→
  arms-down→T re-pose (smooth linear-blend; no armpit sail)→inverse-distance skin→validate→LOD.
  Exported `electric_hero_05h{,_LOD1,_LOD2,_COL}.glb`, LOD **25,000 / 10,000 / 4,500** tris,
  65 joints, face −Y, grounded, no stray island → **validator PASS**. Six clips deform
  correctly (see `proof/lab05h/iteration-01/base-*.png`).

- **Iteration 2 — fitted workwear (DONE):** shirt, olive open-front vest + hi-viz bands,
  trousers, belt, hip radio, boots, hard hat — each a fitted offset-shell of the skinned body,
  so it deforms with the six clips and can never be a detached pod/box/ring. Reads as a hard-hat
  worker; the underarm web is now hidden under the sleeve. Dressed export LOD **24,350 / 10,957 /
  4,869** tris → validator PASS. Evidence `proof/lab05h/iteration-02/`.
- **Iteration 3 — deformation (DONE, light):** all six clips deform cleanly on the dressed hero
  in Blender and in-engine (console-error-free); garments follow the body; no collapse/pierce/
  tear/float. Fine weight-refinement was minimal (the inverse-distance skin + shell garments
  already deform well).
- **Runtime harness (DONE):** 27-camera 05G↔05H comparison group wired into the R3F Scene-G
  harness (`cameraBridge` `G_HERO_05H`, `reviewHarness` `Hero05HCompare`/`Hero05HLOD`, `DevPanel`
  05H group + status). `validate-hero-05h.mjs` PASS; `capture-lab05h-review.mjs` captured 28
  in-engine views **console-error-free (errorCount=0)**; `tsc` + `vite build` clean. Evidence
  `proof/lab05h/runtime/`.

- **Iteration 4 — style/face (DONE):** softened the head sculpt (gentle Laplacian; face no longer
  gaunt), warmed the skin tone, and added a short **dark hair cap** under the hat. Re-export LOD
  **24,509 / 11,028 / 4,901** tris, validator PASS; re-captured 28 in-engine views console-error-free.

**All four iterations + the runtime harness are complete.**

## Honest remaining weaknesses
- The review-env's cool key light casts a **blue tint on upward-facing skin**; the bare feet (lit
  warmly) confirm the skin material itself is warm. This is harness lighting, not geometry/material.
- Residual underarm web from the arm re-pose — **hidden under the shirt sleeve**; a topology tidy
  remains for a nude-base pass.
- Base-mesh fingers tightened toward a mitt but still stylized-rough.
- 05H wears a blue work shirt vs 05G's tan — a palette choice, not a defect.

## Isolation confirmed
Additive only: `electric_hero_05h*` new; 05E/05F/05G GLBs byte-untouched; Scenes A–F and Scene G
production composition unchanged; no propagation to other roles; no production integration; no
external rig/clothing/hair/animation imported; no add-on or system dependency installed; no force
push; GitHub default branch untouched.

## Recommended next decision
Review the in-engine 05G↔05H comparison on your M3: `npx vite --port 4321 --strictPort`, Scene
"G · Character Art Review", the **"05H Hero — 05G hero ↔ 05H authored-base A/B"** group (or the
static shots in `proof/lab05h/runtime/` + `iteration-01/02/`). If the authored-base hero clearly
exceeds 05G at human scale, either **ACCEPT** it as the go-forward character foundation, or
authorize a focused **Iteration-4 appeal polish** (face softening, skin warmth, simple hair).
Role-wide propagation remains prohibited until you authorize it separately.
