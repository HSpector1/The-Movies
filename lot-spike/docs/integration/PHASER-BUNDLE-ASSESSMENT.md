# Phaser Dependency & Bundle Assessment

Measured at commit `8c5a18b` via `npx vite build` (production). Recommendations
only — no implementation changes this pass.

## Dependencies

| Dependency | Version | Role |
|------------|---------|------|
| `phaser` (runtime) | declared `^3.88.2`, **installed `3.90.0`** | the only production runtime dependency |
| `typescript` (dev) | `^5.6.0` | build/typecheck |
| `vite` (dev) | `^6.0.0` | dev server + bundler (spike-only; host owns its own bundler) |
| `puppeteer-core` (dev) | `^23.11.1` | headless screenshots/tests (never runtime) |

Phaser has **no material transitive runtime dependencies** it pulls into the
bundle (it ships as a self-contained lib). The lot adds no other runtime deps.

## Measured production bundle (this spike's build)

| Artifact | Raw | Gzip |
|----------|-----|------|
| `dist/assets/index-*.js` | **1,545.49 kB** | **360.61 kB** |
| `dist/assets/index-*.css` | 8.16 kB | 2.37 kB |
| `dist/index.html` | 0.62 kB | 0.40 kB |

Vite emits its standard ">500 kB chunk" warning. **Essentially all of the JS is
Phaser** — the lot's own code is small (~4.7k LOC of TS → a small fraction of the
bundle). The CSS here is the *spike chrome*; the module's real CSS is ~15 lines.

## Cost profile

- **Initial load cost:** ~360 kB gzip of JS if bundled into the main entry —
  significant. This is the primary reason the PM requires **lazy loading**.
- **Idle runtime cost:** a Phaser game runs a RAF loop. When the lot is visible it
  animates ambient agents + vignettes (modest: ~10 ambient sprites + ≤10 pooled
  vignette actors + a handful of tweens). When hidden it should be **paused**.
- **Frame rate:** the scene is 2D WebGL with generated textures and few draw calls;
  comfortable at 60 fps on normal hardware at 1440×900 / 1920×1080. Verified
  visually across passes; headless swiftshader shows only GPU-perf *warnings*.
- **Source maps:** default Vite behavior; the host bundler decides. Recommend
  hidden/external source maps for the lazy chunk.
- **Asset contribution:** **zero** on-disk assets — all textures generated at
  runtime (see ASSET-PATH-INVENTORY). Nothing to preload, nothing to path-fix.

## Browser & fallback

- Phaser 3 uses **WebGL** with an automatic **Canvas** fallback (`type: AUTO` in
  `StudioLotView.boot`). Runs in all evergreen browsers.
- The game is created with `transparent: true` and `Scale.RESIZE`; a CSS gradient
  on the mount element provides the sky. `powerPreference: 'low-power'` is set.
- **Small screens:** the camera fits the lot to the viewport (verified at
  1024×640). This is a *complementary overview*, not the primary UI, so a minimum
  practical size gate is acceptable.

## Recommendations (for integration, not now)

1. **Lazy-load Phaser + the lot module** behind a dynamic `import()` triggered only
   when the player opens the lot view (keeps ~360 kB gzip out of first paint).
2. **Feature-gate** the dynamic import behind the flag (see
   FEATURE-FLAG-AND-LOADING-PLAN).
3. **Defer initialization** until the mount element is on screen and sized.
4. **Teardown on leave:** call `view.destroy()` when navigating away (frees the
   canvas + RAF). The destroy/recreate test proves this is clean.
5. **Pause when hidden:** if the lot stays mounted in a hidden tab/panel, pause the
   scene (Phaser `scene.pause()` / stop the loop) and resume on show, so vignette
   animation and the RAF don't burn cycles. *(Not yet implemented — a small hook to
   add during integration; the director already supports `setPaused`.)*
6. **Do not** replace or fork Phaser. The bundle cost is understood and addressed
   by lazy loading; a rewrite is unjustified.
