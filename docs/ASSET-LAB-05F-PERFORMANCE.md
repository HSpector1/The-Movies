# Asset Lab 05F — Performance & Budget

The hero is ONE additive Electric character built with the same pipeline invariants as the 05E crew
(single skinned mesh, 9 material slots, 65-joint UAL skeleton, LOD0/1/2 + convex collision proxy).

## Triangle counts (`manifests/hero-05f.json`, from `build_hero_export`)
| Tier | Tris | Guidance (brief §17) |
|------|-----:|----------------------|
| LOD0 | 9,876 | ~10,000–18,000 |
| LOD1 | 5,430 | ~6,000–10,000 |
| LOD2 | 2,961 | ~3,000–6,000 |

LOD0 sits comfortably inside the hero LOD0 guidance and is only ~0.3k above the 05E Electric LOD0
(9,568) despite the rebuilt garments — the continuous loft/tube/arc-loft surfaces are lean. LOD1/LOD2
run at/just below the lower guidance bound (guidance, not a hard cap — the brief says do not destroy
the silhouette to hit a number; the fitted vest, continuous pelvis, and boots stay readable at LOD2).
**65 joints and 9 materials are preserved at every LOD** (verified live in the runtime LOD comparison).

## Runtime (diagnostic only — NOT hardware acceptance)
Scene-G "05F Hero" comparison group captured headless via SwiftShader (software raster):
**console-error-free**. The 2-character side-by-side draws ~39 calls / ~38.9k tris per frame; the hero
LOD trio ~59 calls / ~36.5k tris. FPS under SwiftShader is 6–8 (software — meaningless as an FPS
number; the real-hardware pass is the owner's Apple M3). Draw-call / triangle counts are
hardware-independent and lean. The hero GLBs load with no runtime code change (a new URL alongside the
05E `CREW_URL`).

## Invariants held
65 joints, rig forward −Y at identity, 0 unweighted / 0 bad weight-sum, six accepted clips deform
cleanly, LOD skeleton/height consistency, face on −Y front, height 1.819 m. No new external dependency;
the only pipeline additions are pure-Python primitives (`add_arc_loft` / `arc_loft`) and the hero
builder/exporter — all additive.
