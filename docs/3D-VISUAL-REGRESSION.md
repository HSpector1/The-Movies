# Canonical 3D visual-regression captures

Run the local capture harness from the repository root:

```sh
npm run capture:3d-baseline
```

For local performance evidence from the machine's interactive browser/GPU path, use:

```bash
PROJECT_STUDIO_CAPTURE_HEADED=1 npm run capture:3d-baseline
```

The default headless run remains suitable for CI image/readiness validation, but its
software-rendered FPS is not representative of interactive play.

It starts an isolated Vite server with `VITE_THREE_LOT=1`, restores native deterministic save fixtures through the normal session-recovery path, and writes 1600×900 viewport screenshots to `out/visual-regression/`:

- `overview.png` — whole campus, using a genuinely scheduled shooting fixture.
- `production.png` — production district at management distance.
- `hero-stage-medium.png` — active Soundstage 7 plus its working apron.
- `hero-stage-close.png` — close inspection of the same authoritative stage.
- `construction.png` — the exact in-progress Annex body from the deterministic construction fixture.
- `backlot.png` — the mounted-set/scenery side of authoritative Soundstage 7.

`manifest.json` records the source Git revision, capture time, viewport, renderer flag, browser/WebGL device identity, fixture, exact framing, screenshot path, and a four-second sustained Three.js performance window for every frame. The performance record includes draw calls, GPU texture-object count, FPS, 1% low, p99/worst frame time, display objects and dynamic actors. It is capture provenance only; the timestamp is not a comparison input.

The capture is valid only when the command exits successfully and all six PNG files exist. The harness fails on page or console errors, a missing/non-3D renderer, unavailable camera command, a blank/trivial canvas, an insufficient telemetry window, or an incorrect screenshot size. It deliberately does not apply a perceptual-diff threshold.

The screenshots and manifest remain untracked because `out/` is gitignored. They are disposable visual evidence, not a source-of-truth asset set, and keeping them out of commits avoids large binary churn.

For an art or renderer change, run the command before the work and copy/archive that `out/visual-regression/` directory as **BEFORE**. Run it again after the change and archive it as **AFTER**. Compare corresponding filenames at the same viewport and fixture; inspect intended framing/content changes and unintended visual drift manually. Do not use the manifest timestamp as a diff signal.

Overview and production retain the native named presets. Hero and construction use `StudioLotView.frameBuilding`; backlot uses `StudioLotView.frameMountedSet`. Both commands address only snapshot-owned facts, derive no simulation state, and are exposed through the compact in-game camera toolbar.
