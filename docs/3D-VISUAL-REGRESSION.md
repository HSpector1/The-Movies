# Canonical 3D visual-regression captures

Run the local capture harness from the repository root:

```sh
npm run capture:3d-baseline
```

It starts an isolated Vite server with `VITE_THREE_LOT=1`, restores native deterministic save fixtures through the normal session-recovery path, and writes viewport screenshots to `out/visual-regression/`:

- `overview.png` — native `overview` framing, using the active-production fixture.
- `production.png` — native `production` framing, using the active-production fixture.
- `production-close.png` — mapped to the existing native `production` framing.
- `construction.png` — mapped to native `theater`, the existing framing nearest the annex construction parcel, using the deterministic in-progress-annex fixture.

`manifest.json` records the source Git revision, capture time, 1600×900 viewport, renderer flag, fixture, native camera mapping, and screenshot path. It is capture provenance only; the timestamp is not a comparison input.

The capture is valid only when the command exits successfully and all four PNG files exist. The harness fails on page or console errors, a missing/non-3D renderer, unavailable native camera command, a blank/trivial canvas, or an incorrect screenshot size. It deliberately does not apply a perceptual-diff threshold.

The screenshots and manifest remain untracked because `out/` is gitignored. They are disposable visual evidence, not a source-of-truth asset set, and keeping them out of commits avoids large binary churn.

For an art or renderer change, run the command before the work and copy/archive that `out/visual-regression/` directory as **BEFORE**. Run it again after the change and archive it as **AFTER**. Compare corresponding filenames at the same viewport and fixture; inspect intended framing/content changes and unintended visual drift manually. Do not use the manifest timestamp as a diff signal.

## Current renderer limitation

The renderer currently publishes only `overview`, `wide`, `production`, `entrance`, and `theater` presets. It has no distinct `production-close` or `construction` preset. This harness therefore uses documented existing-preset aliases rather than altering renderer implementation: `production-close → production` and `construction → theater`. A future renderer owner can add a native preset independently, then this mapping can be updated in the harness.
