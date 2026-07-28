# Asset Lab 02 — Performance (contract §9)

> **Diagnostic only.** All figures below were captured in **headless Chrome with
> ANGLE/SwiftShader software rendering** — there is **no GPU** in the capture path
> (renderer string: `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (LLVM 10.0.0)), SwiftShader
> driver)`). These are **not** target-hardware acceptance numbers. Do **not** claim shippable
> frame rate from them. The frozen 3D spike ran comparable scenes at ~120 fps on the owner's
> real GPU; a real-GPU, owner-observed run is required before any performance claim.

Source: `proof/lab02/performance-lab02.json` (live `renderer.info` via `window.__lab.getStats()`).

## Rendering path detected
- **renderer**: `ANGLE … SwiftShader driver` → `isSoftware: true`.
- The capture tool queries `WEBGL_debug_renderer_info.UNMASKED_RENDERER_WEBGL`; on the owner's
  machine this will report the real GPU and figures will change by roughly two orders of
  magnitude.

## Measurements (SwiftShader software, 1600×1000 @ dpr 2)

| Config | Draw calls | Triangles | Geometries | Textures | FPS (software) |
|---|---:|---:|---:|---:|---:|
| Greybox only (no crew) | ~163 | **~4,528** | 174 | 39 | 3–4 |
| Overview, all features (9 crew) | ~181 | **~128,224** | 174 | 39 | ~3 |
| Human-scale inspection | ~181 | ~128,224 | 174 | 57 | 1–2 (software) |

- **Initial load**: ~7.8 s to first ready state under software rendering (dominated by shader
  compile + the character GLB); effectively instant on a GPU with warm cache.
- **Scene switch** (D → A): ~1.4 s (software).
- **Active animations**: 9 crew mixers when characters are on (0 when off).

## The headline number

**The studio greybox is ~4,500 triangles.** The entire visual improvement over Lab 01 rides on
composition, materials, signage, lighting, and atmosphere — not geometry. The only heavy
element is the **9 CC0 crew (~123,700 triangles combined, ~13.7k each)**, which buy "the lot is
alive," and can be reduced (fewer crew, lower-LOD character, or instanced impostors) with no
loss of studio readability.

## Optimization headroom (if ever adopted)

1. **Crew**: fewer/cheaper characters, or a low-poly LOD; they are ~96% of scene triangles.
2. **Draw calls** (~180): merge static bespoke geometry and share materials further (already
   largely shared); trivial on a GPU but easy wins exist.
3. **Textures** are tiny (~39 canvas signs + a few CC0 maps).

## Measurement caveat (honesty)

The per-config toggle samples (`no-characters`, `no-shadows`) in `performance-lab02.json` are
imperfect: toggling `characters` remounts skinned clones (a brief Suspense reload), so a sample
taken too soon can mis-attribute the triangle count. The **reliable** figures are the two
steady states above: **greybox-only ≈ 4.5k tris** and **overview-with-crew ≈ 128k tris**. This
is disclosed rather than smoothed over. None of it changes the conclusion or is offered as a
hardware acceptance figure.
