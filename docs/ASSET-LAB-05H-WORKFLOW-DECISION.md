# Asset Lab 05H — Workflow Decision

**Question (brief §5):** can Project: Studio use a professionally authored / topology-first
base character while preserving the accepted 65-bone skeleton, six clips, GLB export, LOD
pipeline, Three.js runtime, and management-game art direction?

**Decision: SELECT PATH A — verified CC0 professionally authored base mesh.**
(Owner-confirmed 2026-07-31; the owner explicitly directed Path A after the audit.)

## Options scored (1–5; 5 best)

| Criterion | 05G procedural (rejected) | Path A — CC0 authored base | Path B — original topology-first |
|---|---|---|---|
| Expected human-scale quality | 2 | **5** | 3 |
| Topology quality | 2 | **5** | 3 |
| Shoulder quality | 1 | **4** | 3 |
| Pelvis quality | 2 | **5** | 3 |
| Garment compatibility | 3 | **4** | 3 |
| Deformation potential | 3 | **4** | 3 |
| 65-joint skeleton compat | 5 | **5** (re-pose + bind) | 5 |
| LOD suitability | 5 | **5** | 4 |
| Runtime suitability | 5 | **5** | 5 |
| Reproducibility | 5 | **5** (deterministic) | 4 |
| Provenance safety | 5 | **5** (CC0, audited) | 5 |
| Maintenance burden | 3 | **4** | 2 |
| Role-wide scalability | 3 | **4** | 3 |
| Studio visual-direction fit | 2 | **4** | 3 |

**Why not the 05G procedural workflow:** owner-ruled dead; every correction swaps one visible
primitive tell for another (wedges→spheres→pods→blocks). Prohibited by the brief.

**Why Path A over Path B:** a genuine CC0 human base mesh is available and legally clean
(see PROVENANCE-AUDIT), giving professional anatomical quad topology — the exact lever for the
human-scale ceiling — immediately. Path B (original topology via headless bmesh) keeps 100%
ownership but, without interactive sculpting, risks reproducing the same ceiling; the owner
chose to spend the iteration budget on the authored base, not another headless build.

**Result: SELECT PATH A.** One CC0 base mesh (Blender Studio Human Base Meshes v1.0.0, CC0 1.0)
imports as neutral geometry only; the 65-bone skeleton, six clips, exporter, LOD, and runtime
are all preserved. All workwear, hands finishing, boots, hat, materials, and skinning are
authored by Studio.
