# Asset Lab 05H — Performance

Measured on the exported authored base hero (Iteration 1). Runtime FPS on the owner's Apple M3
is the acceptance metric; headless software-raster figures are diagnostic only.

## Geometry / LOD (from `manifests/hero-05h.json`)
| LOD | Triangles | Notes |
|---|---|---|
| LOD0 | 25,000 | full welded quad cage (12,500 quads); top of the §14 guidance band |
| LOD1 | 10,000 | Decimate 0.40 |
| LOD2 | 4,500 | Decimate 0.18 |
| COL | capsule | character collision proxy |

- 65-joint UAL skeleton on every LOD; height 1.750 m; face −Y; grounded.
- 1 material (neutral skin) at this stage; workwear will add a small, bounded material count in
  Iteration 2 (kept ≤ the 05G count per §15).

## Notes
- LOD0 25k is heavier than 05G's 10,928 because it is a genuine authored body cage, not primitive
  assembly. Iteration 4 will tune LOD0 toward the middle of the 12–22k band via light retopo/
  decimation without damaging the silhouette.
- The runtime comparison scene + real-hardware draw-call/FPS panel are produced with the pending
  05H harness; not yet measured in-engine.
