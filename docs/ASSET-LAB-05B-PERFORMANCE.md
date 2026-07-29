# Asset Lab 05B — Performance

## Triangle budget (per character)

| Tier | Tris (typical) | Budget | Status |
|------|----------------|--------|--------|
| LOD0 | ~4.0–4.4 k | up to 8–12 k | well under |
| LOD1 | ~2.4 k | 4–7 k | under (lean base) |
| LOD2 | ~1.4 k | 1.5–3 k | at/below (cheap distant tier) |

Correctness was prioritised over minimum tri count (§24), yet the authored low-poly base is still
efficient — no malformed geometry was forced to stay cheap. Collision proxy = a ~50-tri capsule.

## Material groups

9 slots (skin, shirt, trousers, boots/belt, features-dark, eye-white, hat, hi-vis, hair); a given
role uses **7–8** (unused slots carry no faces → no glTF primitive/draw call). This exceeds the
"≤4 where practical" guidance, traded for role/face clarity. Several slots are tiny (eye-white,
hi-vis, features) and could be **texture-atlas-merged to ~4** in a future pass without changing the
silhouette — noted, not done (out of scope for a correction milestone).

## Runtime (Scene G, all 8 crew + hero set)

`proof/lab05b/runtime/performance-lab05b.json`: draws ≈ 280, scene tris ≈ 38 k, meshes ≈ 141,
**console-error-free**.

### FPS is NOT measured here
The builder-side capture uses **headless SwiftShader (software) rendering** — it reported ~3 fps,
which is **diagnostic only and meaningless for real performance**. Software raster has no bearing
on GPU throughput. On Howard's Apple **M3** the same scene is expected to run at 60 fps or better.
**The owner's real-GPU check is the only valid performance acceptance.** Builder-side numbers are
recorded solely to confirm the scene loads and is structurally sane.

## Recommendation
For a management-view crowd, ship LOD1/LOD2 for distant crew and reserve LOD0 for human-scale/hero
framing. Consider the material-atlas merge only if the real-GPU draw-call count becomes a concern.
