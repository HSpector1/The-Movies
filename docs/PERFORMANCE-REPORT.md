# Performance Report (contract §8, §12)

> **Diagnostic only.** These numbers were captured in **headless Chrome with ANGLE/SwiftShader
> (software rendering)** — there is no GPU in the capture path. They are **not**
> target-hardware acceptance figures (§8). For reference, the frozen 3D visual spike hit
> ~120 fps on the owner's real hardware with comparable scenes; expect the same order of
> improvement here on a GPU. Use these figures to compare *scenes to each other* and to
> confirm the instrumentation works, not to judge shippable frame rate.

Source: `proof/performance.json`, sampled live via `window.__lab.getStats()` (renderer.info).

## Samples (SwiftShader software, 1600×1000 @ dpr 2)

| Scene | FPS | Draw calls | Triangles | Geometries | Textures | Programs | Loaded |
|---|---:|---:|---:|---:|---:|---:|---:|
| **A** studio-lot (aerial) | ~4–5 | 104 | 97,470 | 95 | 137 | 17 | 184/184 |
| **B** furnished set | ~4–5 | 19 | 5,246 | 106 | 137 | 19 | 196/196 |
| **C** animation (walk) | ~6 | 8 | 15,268 | 107 | 138 | 22 | 196/196 |

## Reading the numbers

- **The instrumentation works** (§8 pass criterion). FPS, draw calls, triangles, geometries,
  textures, programs, and loaded-asset counts all update live in the HUD and are readable
  headlessly. That is the point of this scene; the absolute FPS is a software-renderer
  artifact.
- **Triangle counts are modest.** Scene A's ~97 k triangles across 31 Downtown pieces + the
  modular lineup is trivial for any GPU; even the 45 k-triangle `Building_Large_2` is small.
  The animation character is ~13.7 k triangles. Nothing here stresses geometry budgets.
- **Draw calls are the thing to watch, not triangles.** Scene A issues ~104 draw calls for
  ~40 model instances (several materials each). That is fine for a lab but is the first thing
  to optimise for a real overview: instancing repeated modular pieces and merging static
  geometry per building would cut draw calls substantially. Scene B (19) and Scene C (8) are
  already lean.
- **Texture memory:** ~137 textures resident. After the 1024 px / WebP compression pass, the
  entire runtime asset set is ~33 MB on disk (17 MB Downtown GLB + 16 MB animation GLB +
  0.3 MB props); GPU texture footprint is correspondingly small.

## Load behaviour

- All assets in every scene report **loaded === total** with **loading === false** before
  capture (the capture tool waits on `window.__lab.ready()`), and every run was
  **console-error-free**. No missing-texture or failed-fetch errors.
- Scene A is the heaviest load (31 Downtown GLBs + the animation preload); it settles within
  the capture's budget on software rendering, so it will be effectively instant on a GPU with
  a warm HTTP cache.

## Recommendations (if any of this is ever adopted, which is a separate decision)

1. **Instance + merge** repeated static Downtown pieces to collapse draw calls.
2. **Transcode textures to KTX2 (Basis)** for GPU-compressed upload instead of WebP-decoded
   RGBA, cutting VRAM and upload time.
3. Re-measure on the **owner's target hardware** before any performance claim is made; discard
   these SwiftShader figures for that purpose.
