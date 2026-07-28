# Performance Baseline (M1)

## Hardware result (owner-measured, 2026-07-26) — the baseline
- **~120 fps** on the owner's real Chrome (hardware WebGL) at Gate A. This is the
  **gray-box baseline** and the number of record. Final art (M2/M3) must **not**
  consume this margin — it is headroom for real assets, not spare budget to spend.
- This supersedes the headless figure below for any performance verdict. The headless
  number is retained only as a CI floor / smoke signal.
- **M2 asset survey (owner-measured, 2026-07-26): ~120 fps** on real Chrome across
  idle / animated crew / orbit / studio-overview probe / lowest-sustained — no
  stutter, hitching, instability, or asset pop-in. **Gate-B hardware condition: PASS.**
  The imported low-poly sample did not consume the gray-box margin (tiny payload). This
  is the M2 number of record; the headless ~7–13 fps remains a software floor only.

## Measured in CI (honest, with a big caveat)
- **Headless capture (Chrome `--headless` + `--use-angle=swiftshader`): ~11 fps.**
  This is **software WebGL** (no GPU). It is a *worst-case floor*, not the real
  figure — swiftshader rasterises on the CPU. It confirms the app runs and is
  deterministic in CI, but is **not** a valid performance verdict.
- Production JS bundle: **974 kB (270 kB gzip)** — essentially Three.js + R3F +
  React. Would be lazy-loaded in any real integration.

## Scene cost profile (M1)
- Geometry: primitives only; low draw-call count; no textures.
- Lights: 1 shadow-casting directional (2048²) + hemisphere + ambient + 3 small
  point lights (recording/spill/flash) — the shadow map is the main GPU cost.
- Animation: ~11 characters + vignette actors moved per-frame (cheap); the vignette
  is a pure sampler.

## Recommendation
Hardware baseline is now recorded (~120 fps, above). For M2/M3, treat that figure as
a **budget to protect**: re-measure on the owner's machine after any asset import and
flag any regression. (Headless ~11 fps alone must never be read as "slow.")
