# Pass 4 — Asset Provenance

Provenance for every asset produced in this pass. All are **100% original**,
constructed from geometric primitives in code; nothing was copied, traced, or
derived from *The Movies*, any real studio, or any other game.

| Asset | Key | Creator / source | Originality | Editable source | Exported file | Attribution |
|-------|-----|------------------|-------------|-----------------|---------------|-------------|
| Studio gate (sample) | `a-gate` | Authored in-repo by the visual pass | Original — iso geometry (pillars, lintel, plinth, deco crown, brass trim, bulb strip, striped barrier) built from SVG polygons/gradients; no reference asset traced | `tools/build-assets.mjs` (function `buildGate`) — the geometry code IS the source | `src/assets/authored/a-gate.png` | None required (original) |

## Tooling

- `rsvg-convert` (librsvg) renders the SVG → PNG. librsvg is an open-source
  renderer; it produces the image but contributes no artwork.
- Gradients/filters are standard SVG features defined inline in the generator.

## Confirmation

- **No assets were copied from *The Movies* or any other game.** There are no
  imported image/sprite/font/audio files anywhere in the pass — the gate is drawn
  entirely from primitives, consistent with the originality constraint held across
  Passes 1–3.
- Fonts remain CSS/Phaser **system font stacks** (no webfont files shipped).
- The sample PNG is a build artifact of the editable generator; re-running
  `node tools/build-assets.mjs` reproduces it deterministically.

## Status

The sample asset was **not shipped** into the runtime scene (Stage A failed
independent review; integration reverted). It is retained only as evidence and as a
starting point for a future art effort.
