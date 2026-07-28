# Spike-Only File & Tooling Inventory

Everything that should **not** enter the production application by default, at
commit `8c5a18b`. Disposition codes: **exclude** (drop), **dev-tool** (keep in
dev tooling only), **→test** (convert into a formal test), **doc** (keep as
documentation), **reconsider** (decide at integration).

| Item | Path | What it is | Disposition |
|------|------|-----------|-------------|
| Standalone Vite entry | `index.html`, `src/main.ts` | Boots the spike as its own page; installs `window.__lot` | **exclude** (host mounts via React wrapper) |
| Prototype host chrome | `src/ui/host.ts` | Top bar, info panel, char card, toast, action log, prototype dock | **exclude** (host builds its own; keep as **doc** reference for panel content) |
| Chrome CSS | `src/ui/host.css` | ~589 lines of chrome styling | **exclude** except the `#lot-stage` sky gradient + `canvas` rules → move to module `styles/lot.css` |
| Fixture switcher | mode toggle in `host.ts` + `__lot.setMode` | Swaps demo snapshots | **exclude** (host supplies real state) |
| Action log | `.action-log` in `host.ts`/`host.css` | Integration-proof event log | **exclude** (was evidence; superseded by tests) |
| Prototype dock + "PROTOTYPE" chrome | `.proto-dock` in `host.ts`/`host.css` | Fences spike controls | **exclude** |
| Forced-vignette / debug controls | `window.__lot.*` in `main.ts` | force/seek/pause/camera/debugState | **→test** as `StudioLotView` methods; **exclude** the `window.__lot` global |
| Debug fixtures | `RELEASE_CELEBRATION`, `RELEASE_DISAPPOINTMENT` in `fixtures.ts` | Reaction demo states | **dev-tool** / **→test** (drive vignette tests) |
| Browser screenshot scripts | `tools/screenshot.mjs`, `tools/capture.mjs`, `tools/capture-pass3.mjs` | Headless puppeteer-core capture + assertions | **dev-tool** (the *assertions* → formal browser tests; the *screenshotting* stays a dev/evidence script) |
| Generated screenshots | `shots/*.png`, `shots/pass-2/*`, `shots/pass-3/*` (46 PNGs) | Visual evidence | **doc** (design evidence; do not ship in the app bundle) |
| Frame-sequence evidence | `shots/pass-3/seq-*.png` | Motion evidence | **doc** |
| Spike reports | `docs/PASS-*.md`, `docs/VISUAL-*.md` | Design history | **doc** |
| puppeteer-core dep | `devDependencies` | Headless Chrome driver | **dev-tool** (never a runtime dep) |
| Standalone README sections | `README.md` "Launch/PROTOTYPE dock/debug hooks" | Spike run instructions | **doc** (rewrite for the module) |
| `vite.config.ts` (standalone) | `vite.config.ts` | Spike dev server config | **exclude** (host owns bundling) |

## Notes

- The single biggest "do not ship" is the **`src/ui/` chrome + `src/main.ts`
  entry + `window.__lot` global**. They are the spike's *host*, replaced by the
  real app's React wrapper and adapter.
- The **screenshot tools' assertions** are valuable and should be reborn as the
  travelling browser test suite (see TEST-TRANSFER-MANIFEST); the image-capture
  parts remain a dev/evidence convenience.
- No spike-only item is load-bearing for the module's runtime behavior — the lot
  runs entirely from `StudioLotView` + `src/lot/*` + `src/snapshot/*`.
