# Asset Lab 05H — Authored Base Character Pipeline Proof — STATUS REPORT

**Branch:** `asset-lab-05h-authored-base-character-proof` (off 05G `ee83d0e`) · backed up to
`backup` remote. **Verdict: PATH A PROVEN; base body PASS WITH NOTES; full clothed hero IN
PROGRESS (iterations 2–4 not yet done).** This is an honest checkpoint, not a finished hero.

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

## What is NOT done (authorized next steps)
- **Iteration 2 — fitted workwear** (shirt, safety vest, trousers, belt, one radio, boots, hat,
  hands finishing).
- **Iteration 3 — skinning & deformation refinement**, including the residual underarm-web fix.
- **Iteration 4 — style/face/head/hair/hat/materials + final LOD tuning.**
- **Runtime harness** (05G↔05H comparison group, 30 controls) + `validate-hero-05h.mjs` +
  `capture-lab05h-review.mjs` + the runtime/final evidence tree.
- Remaining docs mirror the report; no clothed-hero PASS is claimed.

## Honest remaining weaknesses (base body)
- Residual underarm web at the shoulder→armpit re-pose transition (localized; will sit under
  the shirt sleeve; a topology/skinning refinement for Iteration 3).
- Base-mesh fingers tightened toward a mitt but still stylized-rough (Iteration 4 finish).
- Arms rest slightly below true horizontal (does not affect clip deformation).
- LOD0 is 25,000 tris (top of the guidance band) — decimate/retopo tuning is an Iteration 4 item.

## Isolation confirmed
Additive only: `electric_hero_05h*` new; 05E/05F/05G GLBs byte-untouched; Scenes A–F and Scene G
production composition unchanged; no propagation to other roles; no production integration; no
external rig/clothing/hair/animation imported; no add-on or system dependency installed; no force
push; GitHub default branch untouched.

## Recommended next decision
Review the base body (`proof/lab05h/iteration-01/`) on real hardware. If the authored-base
foundation is accepted, authorize continuation into Iteration 2 (workwear) → 4 + runtime. A
legitimate alternative remains REQUIRES HUMAN ARTIST for the final human-scale finish, but the
foundational feasibility question is now answered YES.
