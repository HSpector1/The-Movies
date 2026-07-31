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

## Iterations 2–4 — NOT YET DONE
Workwear (2), skinning/deformation refinement + underarm-web fix (3), and style/face/LODs (4)
are the authorized next steps; the 05H runtime comparison harness and its evidence are pending.
Status is reported honestly in FINAL-REPORT; no PASS is claimed for the finished hero yet.
