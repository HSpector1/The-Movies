# Asset-Path Inventory

What the lot loads at runtime, and what only exists for evidence. Commit `8c5a18b`.

## Runtime assets: none on disk

**Every visual is generated procedurally at runtime.** There are no image files,
sprite sheets, atlases, or audio in the runtime path.

| Asset class | Origin | Runtime-required? | Production location | Bundler concern | Path type |
|-------------|--------|-------------------|---------------------|-----------------|-----------|
| Building/prop/tile textures | Generated in `src/lot/assets.ts` via Phaser `Graphics.generateTexture` (`bakeAllTextures`, called in `LotScene.create`) | yes (generated in-memory) | n/a (code) | none — no files to resolve | none |
| Ambient/vignette actor textures | Same (`p-crew`, `p-office`, `p-talent`, `p-grip`, `p-director`, `p-photog`, vehicles, etc.) | yes (generated) | n/a | none | none |
| Colors | `src/lot/palette.ts` constants | yes (code) | n/a | none | none |
| Sky background | CSS radial-gradient on `#lot-stage` (in `host.css`) | yes | module `styles/lot.css` (~15 lines) | none | CSS, no url() |
| Fonts | CSS **system stacks** only (`Georgia,…serif` / `Avenir,…sans` in `LotScene` text styles + CSS) | yes | n/a | none — no webfont files | none |
| On-canvas text | Phaser `Text` objects (gate name, tags, title boards, labels) using system fonts | yes | n/a | none | none |

**There are no hard-coded or relative runtime asset paths to fix at extraction.**
The only "path" the lot needs is the URL it is served from (`vite.config.ts` sets
`base: './'` for the spike); the module itself references no asset URLs.

## Development / evidence-only assets (not runtime)

| Item | Path | Purpose | Ship? |
|------|------|---------|-------|
| Pass-1 screenshots | `shots/*.png` (4) | evidence | no (doc) |
| Pass-2 screenshots | `shots/pass-2/*.png` (17) | evidence | no (doc) |
| Pass-3 screenshots + frame sequences | `shots/pass-3/*.png` (25) | evidence | no (doc) |

These are committed as design evidence and read by no runtime code. They must not
enter the application bundle.

## Originality confirmation

**No copyrighted assets from *The Movies* or any other game are included.** All
geometry, colors, and layouts are original, drawn in code (`assets.ts`,
`palette.ts`, `layout.ts`). No imported images, no ripped sprites, no game fonts,
no logos, no sounds. The water tower, gate, and marquee are generic archetypes, not
reproductions of any real or fictional studio landmark. This was a standing
constraint across all three passes and is verifiable by inspection (there are no
binary asset files in `src/`).

## Extraction implication

Asset handling is a **non-issue** for extraction: nothing to copy, no paths to
rewrite, no preloader to wire, no CORS/hosting concerns. The module is
self-contained visual code plus a tiny CSS gradient.
