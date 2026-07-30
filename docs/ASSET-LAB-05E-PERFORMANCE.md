# Asset Lab 05E — Performance & Budget

Measured from the final build gate (`manifests/characters-05b.json`, `build_characters05b.py`) on the
05E branch. Character system unchanged in kind from 05D (single skinned mesh per role, 9 material
slots, 65-joint UAL skeleton, LOD0/1/2 + convex collision proxy). **The 05E rework made the meshes
LEANER, not heavier** — the lofted torso + swept-tube limbs replaced dense stacks of overlapping
ellipsoids/segment cones.

## Triangle counts (LOD0 / LOD1 / LOD2) — 05E final vs 05D

| Role         | 05D LOD0 | 05E LOD0 | 05E LOD1 | 05E LOD2 |
|--------------|---------:|---------:|---------:|---------:|
| PA           |  ~10 800 |    8 368 |    4 602 |    2 510 |
| Grip         |  ~11 000 |    8 412 |    4 626 |    2 522 |
| Electric (H) |  ~11 400 |    9 568 |    5 262 |    2 869 |
| Maintenance  |  ~11 100 |    8 592 |    4 724 |    2 576 |
| Office       |  ~10 600 |    8 024 |    4 412 |    2 406 |
| CameraDP     |  ~10 700 |    8 200 |    4 510 |    2 460 |
| Director     |  ~10 600 |    8 112 |    4 460 |    2 432 |
| Carpenter(H) |  ~11 760 |    8 752 |    4 812 |    2 624 |

LOD0 dropped roughly **20–25%** across the board (heaviest role 11.76k → 8.75k). The stated
`character_lod0` budget in `TUNING` (config.py) is 6 000; as in 05D these authored crew meshes run
above it at LOD0, but **closer to it than 05D**, and LOD1 (~4.4–5.3k) / LOD2 (~2.4–2.9k) sit at or
below budget for the mid/far bands where most crew are drawn. Budget reconciliation remains an owner
decision (see the 05D performance note); 05E did not raise it and in fact reduced pressure.

## Runtime (diagnostic only — NOT hardware acceptance)
Scene G captured headless via SwiftShader (software GL): **console-error-free = true**, load ≈ 11.9 s,
overview draw = 282 draws / 72 222 tris / 142 meshes at fps≈4 (software renderer — meaningless as an
FPS number; the real-hardware pass is the owner's Apple M3 review). GLBs load unchanged by
`studioSlice.tsx` (same filenames), so the runtime picks up the 05E crew with no code change.

## Invariants held
65 joints, rig forward −Y exported at identity, 0 unweighted verts / 0 bad weight-sums, 6 required
clips deform cleanly, LOD skeleton + height consistency, 9 material slots. No new dependencies; the
only pipeline additions are two pure-Python mesh primitives (`add_loft`, `add_tube`).
