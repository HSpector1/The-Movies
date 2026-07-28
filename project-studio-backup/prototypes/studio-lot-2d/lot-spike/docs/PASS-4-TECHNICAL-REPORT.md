# Pass 4 — Technical Report

Technical results for the Stage-A asset-pipeline spike. The pipeline is technically
sound; it was **reverted** for visual reasons (see the visual review), so the
frozen scene is unchanged.

## Architecture-freeze confirmation

- `StudioLotSnapshot`, `BuildingId`, navigation events, vignette categories,
  scheduling, scene lifecycle, save formats, core types: **all unchanged.**
- `src/lot/LotScene.ts` is **byte-identical to `34cebff`** after the revert
  (the integration was removed; only tooling/docs/sample/evidence were added).
- No `src/core` imports, no snapshot mutation, no `Math.random` introduced.

## What was tested with the asset integrated (before revert)

| Check | Result |
|-------|--------|
| `tsc --noEmit` | PASS |
| `vite build` (prod) | PASS — authored PNG bundled hashed (~55 kB) |
| Pass 2 verify (8 assertions) | PASS |
| Pass 3 verify (18 assertions) | PASS |
| Gate selectable (pixel-perfect on authored texture) | PASS |
| Console errors | none (favicon 404 only) |
| Depth sorting / lifecycle / teardown | unchanged, clean |

Conclusion: loading authored PNGs via Phaser `preload` + a per-building override
with procedural fallback integrates cleanly and preserves all prior guarantees.
The pipeline did **not** introduce lifecycle, hit-test, depth, loading, or
performance defects.

## What was verified after revert (frozen state restored)

| Check | Result |
|-------|--------|
| `tsc --noEmit` | PASS |
| `vite build` (prod) | PASS |
| `LotScene.ts` vs `34cebff` | identical (no diff) |
| Authored PNG bundled? | no (import removed; sample retained only as evidence) |

## Bundle / payload

| Artifact | Frozen (`34cebff`) | With gate integrated (reverted) |
|----------|--------------------|--------------------------------|
| JS (gzip) | ~360.6 kB | ~360.6 kB (Phaser dominates; gate code negligible) |
| Authored asset | — | +~55 kB PNG (hashed), lazy-loadable |
| CSS | ~8.2 kB | unchanged |

The asset payload is negligible; had the visual result passed, lazy-loading the
Phaser chunk (per the integration dossier) would keep first paint unaffected.

## Startup / frame behavior

- Adding a `preload()` step added one image fetch before `create()`; first paint was
  not materially delayed in headless runs.
- Ambient/vignette frame behavior unchanged (same scene systems).

## Determinism & cleanup

- The generator is deterministic (`node tools/build-assets.mjs` reproduces the same
  PNG); no `Math.random`. Runtime determinism unchanged.
- Actor-pool cleanup, one-canvas destroy/recreate: unaffected (Pass-3 suite green).

## Net technical assessment

The authored-sprite pipeline is **technically viable and low-risk** to integrate.
The blocker is purely **visual cohesion** (a single upgraded asset among flat
neighbors), which is a scope decision, not a technical one.
