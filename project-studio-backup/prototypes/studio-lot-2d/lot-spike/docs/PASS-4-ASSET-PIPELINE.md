# Pass 4 — Authored Asset Pipeline

The Stage-A pipeline that was built and tested. It is **technically sound** but its
single-asset output **failed the visual cohesion bar** in-scene (see
`PASS-4-STAGE-A-INDEPENDENT-REVIEW.md`). Documented here so a future, larger art
effort can reuse or discard it deliberately.

## Tool & method

- **Tool:** `rsvg-convert` (librsvg; found at `/opt/homebrew/bin/rsvg-convert`).
  No Blender, node-canvas, or ImageMagick were available in the environment.
- **Method:** original isometric sprites are authored as **SVG** in
  `tools/build-assets.mjs` (the editable source is the geometry code there), then
  rendered to **transparent PNG** and loaded into the existing Phaser scene. SVG
  buys gradients, soft blurred contact shadows, and crisp anti-aliased edges the
  runtime `Phaser.Graphics` fills cannot.
- **Run:** `node tools/build-assets.mjs` → writes `src/assets/authored/*.png` and
  prints placement metadata (origin + footprint).

## Camera / projection

- Matches `src/lot/iso.ts`: 2:1 isometric, `HW=64`, `HH=32`,
  `iso(gx,gy,z) = ((gx-gy)·HW, (gx+gy)·HH − z)`.
- Geometry is authored in grid units and projected with that exact transform, so
  the render angle matches the scene by construction.

## Render settings

- `rsvg-convert -w W·2 -h H·2 in.svg -o out.png` — rendered at **2× the SVG's
  natural size** for a crisp downscale in-engine.
- viewBox auto-fit to the geometry bounds + 6px padding; transparent background.
- Standard warm-palette gradients (`linearGradient`/`radialGradient`) + two
  `feGaussianBlur` filters (`#soft`, `#softbig`) for contact shadows.

## Sprite output & placement

- Output: `src/assets/authored/<key>.png` (RGBA, transparent).
- The generator prints, per asset: pixel `w`/`h`, normalized `originX`/`originY`
  (the footprint ground-center within the image), and footprint `fw`/`fd`.
- Sample produced: `a-gate.png` — 716×714 (×2 render), origin (0.571, 0.705),
  footprint 1×3.

## Phaser loading & integration (as tested, then reverted)

- A `preload()` on `LotScene` queued the PNGs via `this.load.image(key, url)`,
  where `url` is a Vite import of the PNG (`src/lot/authored-assets.ts`) so it
  resolves in dev and hashed production builds.
- `buildBuildings()` resolved each building's texture to the authored key **iff it
  loaded** (`this.textures.exists(key)`), else the procedural texture — a safe
  fallback so the lot always renders.
- Depth sorting, pixel-perfect hit-testing, selection, labels, and vignettes all
  worked unchanged (both regression suites passed with the gate integrated; the
  gate was selectable via pixel-perfect hit on the authored texture).

## Performance / payload

- The gate PNG bundled to ~55 kB (hashed) in the production build; negligible.
- No frame-rate, teardown, or console-error regressions were observed with the
  asset integrated (Pass 2 + Pass 3 suites green).

## Why it was reverted

Technically fine; **visually it failed** as a lone gradient asset among flat-shaded
neighbors (oversized, projection/grounding mismatch, style clash). The integration
was reverted so the frozen scene (`LotScene.ts` == `34cebff`) is preserved. The
pipeline + sample remain for a future whole-scene restyle, which is the only way to
prove this approach fairly (see the review + technical report).
