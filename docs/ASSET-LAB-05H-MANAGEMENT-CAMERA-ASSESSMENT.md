# Asset Lab 05H — Fixed-Isometric Management-Camera Assessment (Final Owner Review, §8 / Question B)

**The decisive product test.** Question A asks whether 05H is an acceptable human-scale character. Question B,
answered here, is separate: *at the fixed-isometric management camera, does live skinned 3D add enough visible
value to justify its cost* (GLB loading, skeletons, animation updates, disposal, fallback, renderer
complexity)? A result can pass A and fail B, or fail A and still inform B. **They are not combined.**

## ⚠️ Documented assumption — no real D1 camera exists in this repo

This repository contains **no** "approved D1 fixed-isometric management camera." The app has exactly one
`PerspectiveCamera` (fov 42); "management distance" was only a far perspective preset. The real D1/Studio-Lot
camera and its parameters are defined nowhere here (D1 is out of scope and untouched).

Rather than guess a single angle, this assessment builds a **representative orthographic isometric management
rig** (`src/lab/cameraBridge.ts` → `G_MGMT`; `src/components/reviewHarness.tsx` → `ManagementCameraRig`) and
spans the plausible range so the conclusion is **robust across it, not bet on one guess**:

- **Elevation:** 30° / 37° (≈ true iso) / 45° (`management-camera/vignettes/four-workers-iso-30|45`).
- **Framing (worker pixel scale):** wide / default / tight = orthographic zoom × {0.55, 1.0, 1.7}. On a
  1080p frame a worker is ≈ `1.78 × zoom` px tall, giving ≈ 45 / 82 / 139 px for the one-worker vignette.
- **Resolution:** 1920×1080, 1440×900, 1366×768, 1280×720, and a 125% browser-zoom equivalent.
- **Reduced motion:** normal vs frozen.
- **Vignettes:** 1 worker + stage, 2 workers + cart, 4 workers + stage, walking service area, seated,
  kneeling. Neutral procedural geometry (stage massing + apron + cart/light/crate); **not** a D1 import,
  no GameState.

**If the real D1 camera differs materially from this range, the value conclusion must be revisited.** This is
the #1 owner-verification item.

## What the evidence shows

Evidence: `proof/lab05h/final-owner-review/management-camera/{vignettes,value,framing,resolution,reduced-motion}/`.

1. **Worker role reads; fine quality does not (at default framing).** At default/wide framing a worker reads
   as "a person in a hard hat near an active stage." The distinguishing detail between **05G and 05H is not
   perceptible** — `value/four-workers-stage--05g.png` vs `--05h.png` are hard to tell apart at this scale.
2. **A pre-rendered sprite is nearly indistinguishable from live 3D here.** `value/*--sprite.png` (a flat
   camera-facing card pre-rendered at the iso angle) reads essentially the same as `--05h.png` at default
   framing. This is the core Question-B result: **at the management camera, live skinned 3D buys almost no
   visible quality over a 2.5D sprite.**
3. **The one defect that survives distance is the blue skin.** Because it is a *material* (not fine geometry),
   the cool cast persists even at small size; the torn vest, bare feet, and wrong hat largely wash out. So
   live 3D does not hide 05H's worst defect at distance — it carries it in.
4. **Differences only emerge at tight framing.** At `framing/four-tight.png` (~103–139 px workers) the vest
   break, bare feet and blue skin become legible. **If the management camera ever lets the player zoom toward
   a worker, human-scale quality (Question A) becomes visible and starts to matter.** At a genuinely fixed,
   non-zoom management distance it largely does not.
5. **No-worker still communicates activity.** `value/*--none.png` (props only: stage-door glow, cart, light,
   crates) still reads as an active service area. Occupancy/activity do not strictly require a character.
6. **Reduced motion is clean.** The frozen variant (`reduced-motion/walk-reduced.png`) is a stable static
   pose; motion is not required for the read.

## Value vs cost

Pair this with `ASSET-LAB-05H-REAL-GPU-PERFORMANCE.md`: live 3D is **cheap to render** on the M3 Max (120 FPS
at 4 workers) but carries a **lifecycle cost** (a measured texture-disposal leak; GLB loading; fallback and
accessibility paths). At the fixed management camera it buys **little to no visible quality over a sprite**.
So the value equation is unfavorable: the benefit at this camera is marginal, and it is spent on the one asset
whose worst defect (blue skin) is exactly the kind that *does* survive to management distance.

## Conclusion (Question B)

**Live skinned 3D is not shown to add enough value at the fixed-isometric management camera to justify its
cost — on this evidence and this representative camera.** A pre-rendered sprite (or even props-only) delivers
substantially the same management-scale read at lower runtime and lifecycle risk. Live 3D would only clearly
earn its cost if the design lets players **zoom to human scale**, at which point Question A (character quality)
becomes the binding constraint — and 05H currently fails that (see `ASSET-LAB-05H-FINAL-OWNER-REVIEW.md`).

This conclusion is conditioned on the representative camera above; confirm against the real D1 camera before
acting on it.
