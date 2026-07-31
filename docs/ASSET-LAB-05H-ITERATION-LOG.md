# Asset Lab 05H — Iteration Log

**Starting HEAD:** `ee83d0e` (accepted 05G) · **Branch:** `asset-lab-05h-authored-base-character-proof`
**Workflow:** Path A — CC0 authored base (Blender Studio Human Base Meshes v1.0.0, CC0 1.0).
Scoring 1–5. Renders are neutral EEVEE (honest, under-lit, no distance-hiding).

---

## Iteration 0 — Workflow audit + provenance (commit: select authored character workflow)
Audited Path A vs B vs the rejected procedural workflow; verified a genuine CC0 base mesh
(3-way license check), downloaded + hashed it, extracted one neutral body mesh. **SELECT PATH A.**
Evidence: `proof/lab05h/workflow-audit/` (armature T-pose vs base arms-down rest comparison).

## Iteration 1 — Authored base body (commit: create authored Electric base body)
Built `authored05h.build_authored_base`: import → weld (50k split → 12,502 quad cage) → align
1.75 m → **re-pose arms-down→T** (smooth linear-blend, smoothstepped arm rotation; no armpit
sail) → **deterministic inverse-distance skin** to the 65-bone rig → validate → LOD/export.

- **Neutral geometry:** clean continuous torso, shoulders/deltoids, pelvis, hips, seat, thighs,
  knees, head/neck — the regions the owner rejected on 05G, now professional quad topology.
- **Six clips deform correctly** (Walk natural stride, Sit, Kneel, Pickup, Talk, Idle) — the
  central feasibility proof: an authored CC0 base binds to the accepted skeleton and clips.
- **Export:** `electric_hero_05h{,_LOD1,_LOD2,_COL}.glb`; LOD **25,000 / 10,000 / 4,500** tris;
  65 joints; height 1.750; face −Y; grounded; no stray island → **validator PASS**.

| Torso | Shoulder integ. | Pelvis | Hip→thigh | Legs | Head/neck | Arms | Hands | Deformation |
|---|---|---|---|---|---|---|---|---|
| 5 | 4 | 5 | 5 | 5 | 4 | 3–4 | 2–3 | 4 |

**Remaining base weaknesses (honest):** a residual underarm web at the shoulder→armpit
transition from the geometric re-pose (localized; will sit under the shirt sleeve — a
skinning/topology refinement item for Iteration 3); base-mesh fingers tightened toward a mitt
but still stylized-rough (Iteration 4 finish); arms rest slightly below true horizontal.
**Decision: CONTINUE** (base foundation accepted; not yet the finished clothed hero).

## Iteration 2 — Fitted workwear (commit: create fitted workwear)
Authored each garment as a **fitted offset-shell of the base body** (`authored05h.build_workwear`):
duplicate the relevant body region by skin weight → push out along normals → trim → re-material.
Because a garment is derived from the skinned body it deforms identically under the six clips and
can never be a detached pod/box/ring (the 05F/05G rejections).

- **Shirt** (blue, torso+arms, hem at hip, sleeve to wrist) · **Trousers** (grey, pelvis+legs to
  ankle) · **Boots** (brown, feet+lower calf) · **Vest** (olive fitted shell, open front, shoulders
  to below waist) · **Hi-viz bands** (two bright strips wrapping the vest) · **Belt** (slim ring) ·
  **Radio** (small box, right hip) · **Hard hat** (amber dome + brim).
- Reads clearly as a hard-hat electric/construction worker; the underarm web is now **hidden under
  the shirt sleeve** as predicted. All garments deform with the body (Walk/Sit/Kneel/Pickup clean).
- **Export (dressed):** base+garments joined, LOD0 lightly decimated → LOD **24,350 / 10,957 / 4,869**
  tris, 65 joints, height 1.77, face −Y, grounded → validator PASS. Evidence `proof/lab05h/iteration-02/`.

| Shirt | Vest fit | Vest thickness | Trousers | Boots | Belt/radio | Hat | Deformation | Reads as worker |
|---|---|---|---|---|---|---|---|---|
| 4 | 3–4 | 4 | 4 | 3–4 | 3 | 4 | 4 | 4 |

**Decision: CONTINUE.** Workwear reads and deforms; vest side/back wrap + boot shaping are Iter-3/4
refinements. No pods/boxes/shelves.

## Iteration 3 — Deformation (accepted, light)
All six clips deform cleanly on the dressed hero in Blender and in-engine; garments follow the
body; no collapse/pierce/tear/float. The inverse-distance skin + offset-shell garments already
deform well, so only light refinement was needed. **Decision: CONTINUE.**

## Runtime harness (DONE)
Wired the 27-camera 05G↔05H comparison group into the R3F Scene-G harness (`cameraBridge`
`G_HERO_05H`, `reviewHarness` `Hero05HCompare`/`Hero05HLOD`, `DevPanel` 05H group + status).
`validate-hero-05h.mjs` → **PASS** (GLBs, 65 joints, budgets, additive, CC0 provenance, 27
cameras). `capture-lab05h-review.mjs` captured **28 in-engine views console-error-free
(errorCount=0)**; `tsc` + `vite build` clean. Evidence `proof/lab05h/runtime/`.

## Iteration 4 — style/face (DONE)
Owner authorized "soften + warm + hair." Applied: (1) a gentle Laplacian on the head (z>1.54,
2× factor 0.32) softens the gaunt sculpt while keeping eyes/nose/mouth readable; (2) a warmer
stylized skin tone (0.91,0.71,0.56, roughness 0.66); (3) a short **dark hair cap** on the crown/
back/sides (offset-shell of the head, excluding the front face) that shows below the hat brim.
Re-exported → LOD **24,509 / 11,028 / 4,901** tris, validator PASS; re-captured 28 in-engine views
**console-error-free**. Evidence `proof/lab05h/iteration-04/` + `proof/lab05h/runtime/`.

| Face appeal | Skin warmth | Hair | Head silhouette | LOD integrity | Runtime |
|---|---|---|---|---|---|
| 3–4 | 3–4 | 3–4 | 4 | 4 | 4 |

**Remaining honest note:** the review-env's cool key light casts a blue tint on upward-facing skin
(the bare feet, lit warmly, confirm the skin material itself is warm); 05H wears a blue work shirt
vs 05G's tan (palette choice). Both are lighting/palette, not geometry. **Verdict: PASS WITH NOTES
→ owner real-GPU review.**
