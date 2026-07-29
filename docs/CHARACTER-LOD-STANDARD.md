# Character LOD Standard (Asset Lab 05B)

Three tiers via `lod.generate_lods` (Decimate **collapse**, which preserves vertex groups so ONE
animation instance drives any tier). Character LOD ratios: **[1.0, 0.6, 0.35]** (gentler than the
generic [1.0, 0.5, 0.25] because the LOD0 base is already lean at ~4 k tris — see below).

| Tier | Use | Ratio | Electric example |
|------|-----|-------|------------------|
| LOD0 | close inspection / human scale | 1.00 | 4032 tris |
| LOD1 | medium campus view | 0.60 | 2418 tris |
| LOD2 | management overview (distant) | 0.35 | 1410 tris |

LOD0 is far under the 8–12 k budget, so LOD1/LOD2 land below the generic 4–7 k / 1.5–3 k ranges.
Per §24 (correctness > tri count) this is fine — the base is efficient by construction, not by
forcing a malformed low-poly result. LOD2 ≈ 1.4 k is a deliberately cheap distant tier.

## LOD does NOT break (validated, `build_char_lods.py`)

Measured across all three tiers for Electric (the hardest case: hard hat + hi-vis vest + face):

| Invariant | LOD0 | LOD1 | LOD2 | Result |
|-----------|------|------|------|--------|
| Height (m) | 1.815 | 1.815 | 1.815 | **unchanged** |
| Vertex groups | 22 | 22 | 22 | **skeleton intact** |
| Connected islands | 55 | 55 | 55 | **no fragmentation / no detached limbs** |
| Feature verts on −Y front | yes (ȳ −0.106) | yes (−0.106) | yes (−0.107) | **face stays on front** |
| glTF skin joints | 65 | 65 | 65 | **no deleted skeleton nodes** |
| Material primitives | 8 | 8 | 8 | **clothing groups preserved** |

- **Skinning survives decimation:** LOD2 (1410 tris) walks cleanly — no shards, limbs connected,
  hat + vest attached (proof: `lod2-walk.png`).
- **Face:** crisp at LOD0, softened but still a readable front face at LOD2 (proof: `lod{0,1,2}-face.png`).
  LOD2 face degradation is invisible at the management/distance range it is used for.
- **Normals:** features render correctly lit at every tier (no reversed normals).

## Evidence
`proof/lab05b/iteration-04/`: `lod{0,1,2}-front.png`, `lod{0,1,2}-face.png`, `lod{0,1,2}-walk.png`,
and `Char_Electric_LOD{0,1,2}.glb`. Do not create LODs until LOD0 passes (it did — iterations 1–3).
LOD1/LOD2 GLBs carry the same 65 bone-named groups, so one animation instance drives any tier.
