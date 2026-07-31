# Asset Lab 05G — Performance

## Geometry budget

| Asset | Tris | Note |
|---|---|---|
| `electric_hero_05g.glb` (LOD0) | **10,928** | vs 18,000 budget — well under |
| `electric_hero_05g_LOD1.glb` | **6,010** | |
| `electric_hero_05g_LOD2.glb` | **3,278** | |
| `electric_hero_05g_COL.glb` | collision proxy | convex-ish low-poly |

LODs are monotonically decreasing. Height 1.819 m, **65-joint** UAL skeleton preserved across all three
LODs, **9 materials** (no increase over 05F — no material atlasing was done this milestone). The three
surgical additions cost ~1,052 tris over the 05F/05E-derived baseline (9,876 → 10,928): the deltoid caps
+ fillets (Iteration 1) and the belt smoothing (Iteration 3); the vest and pelvis rebuilds were
radius/position changes at constant primitive count.

## Runtime (diagnostic capture)

Captured with `tools/capture-lab05g-review.mjs` (headless Chrome + SwiftShader) against the Vite build of
the R3F Scene-G harness, 26 comparison views:

- **Console-error-free: true (errorCount = 0).** The 05G comparison group loads and animates cleanly.
- Draw calls / frame: **39** (two heroes + neutral env; 59 on the three-LOD view).
- Triangles / frame: **~41,600** (two full heroes + floor).
- FPS: **7–8** — this is **SwiftShader software raster and is DIAGNOSTIC ONLY**, not target-hardware.
  The same software-FPS caveat applied to the accepted 05F capture. Real-hardware acceptance is the
  owner's Apple M3 review; on GPU hardware this scene is trivial.

`proof/lab05g/runtime/performance.json` records the probe (renderer string, per-view min/median/steady FPS,
draw calls, tris/frame) with the software-raster caveat inline.

## Interpretation

The 05G hero is not a performance risk: it is a low-poly stylized character within budget, with a
65-joint rig and 9 materials, and it renders error-free in the runtime. The corrections did not
meaningfully change the geometry cost. Final hardware performance is confirmed by the owner's M3 pass.
