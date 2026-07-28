# Package Extraction Manifest

A recommended shape for the future self-contained studio-lot presentation module.
**Documentation only — no files are moved at commit `8c5a18b`.**

## Proposed module boundary

```text
studio-lot/
  index.ts                 # the ONLY public entry — re-exports the surface below
  StudioLotView.ts         # public class (mount/update/teardown)
  snapshot/
    StudioLotSnapshot.ts   # the contract types + BuildingId + BUILDING_ACTION + ALL_BUILDING_IDS
    fromGameState.ts       # OPTIONAL reference adapter (types-only) — may live host-side instead
  events/                  # (types currently inline in LotScene/StudioLotView)
    types.ts               # LotActionKind, SelectionInfo, LotActionEvent, CharacterInfo, CameraPreset, MomentKind
  lot/                     # private scene internals
    LotScene.ts iso.ts palette.ts rng.ts assets.ts layout.ts vignettes.ts
  styles/
    lot.css                # extracted from src/ui/host.css: ONLY the #lot-stage sky gradient + canvas rules
  tests/                   # travelling tests (see TEST-TRANSFER-MANIFEST)
```

Notes:
- `events/types.ts` is a *recommended* consolidation; today these types live inline
  in `LotScene.ts` and `StudioLotView.ts` and are re-exported from `StudioLotView`.
- `src/ui/host.ts` + most of `src/ui/host.css` are **prototype chrome** and do NOT
  enter the module (see SPIKE-ONLY-INVENTORY). Only the `#lot-stage` background
  gradient + canvas display rules are needed by the mounted canvas.

## Public exports (from `index.ts`)

- `class StudioLotView` (+ `StudioLotViewOptions`)
- `type StudioLotSnapshot` and its members: `BuildingId`, `LotActionKind`,
  `StandingBand`, `CashBand`, `ProductionCard`, `ReceptionBand`, `ReleasedCard`,
  `BuildingState`
- `const ALL_BUILDING_IDS`, `const BUILDING_ACTION`
- event/payload types: `SelectionInfo`, `LotActionEvent`, `CharacterInfo`,
  `CameraPreset`, `MomentKind`
- (optional) `snapshotFromGameState` + `GameStateFacts` — or leave these host-side.

## Private implementation (not exported)

`LotScene`, `iso`, `palette`, `rng`, `assets` (texture generation), `layout`,
`vignettes` (`VignetteDirector`, `VignetteHost`). Consumers touch none of these.

## Required runtime dependencies

- `phaser` `^3.90` (only runtime dep). See PHASER-BUNDLE-ASSESSMENT.

## Required CSS

- One small stylesheet: the `#lot-stage` (mount element) **golden-hour radial
  gradient** background + `canvas { display:block }`. ~15 lines, extracted from
  `host.css`. Everything else in `host.css` is prototype chrome.

## Required assets

- **None on disk.** All textures are generated at runtime in `assets.ts`
  (`bakeAllTextures`). No images, no fonts shipped (fonts are CSS system stacks).
  See ASSET-PATH-INVENTORY.

## Host responsibilities

- Provide a mount element with non-zero size.
- Translate `GameState` → `StudioLotSnapshot` (the adapter).
- Map `LotActionKind` → real screens/routes.
- Own the feature flag + lazy import + lifecycle (see REACT-LIFECYCLE-CONTRACT,
  FEATURE-FLAG-AND-LOADING-PLAN).

## Prohibited imports (enforce with a lint boundary)

- The module must import **nothing** from the game's `src/core/*` (or any
  simulation/save module). Today this holds (grep-clean). Add an eslint
  `no-restricted-imports` / import-boundary rule at extraction.
- The module must not import React, the router, or host UI. It is framework-neutral;
  the React wrapper lives host-side.

## Lifecycle contract (summary; full in REACT-LIFECYCLE-CONTRACT)

`new StudioLotView(opts)` → `setSnapshot()` over time → `destroy()`. Exactly one
Phaser game/canvas per instance; `destroy(true)` tears it down cleanly (verified by
the destroy/recreate test).

## Build expectations

- ESM, TypeScript strict (matches current `tsconfig`).
- Ships as source or a pre-bundled chunk that the host **dynamically imports**
  behind the flag (so Phaser stays out of the initial bundle).

## Recommendation: module form

**Internal workspace package** (e.g. `@studio/lot`) is the best fit:
- clean import boundary (enforces "no core imports");
- its own `package.json` pins `phaser` and can be lazy-chunked;
- lighter than a separately published package (no external release process), but
  stronger isolation than a bare source folder.

Start as an **internal source module** if the repo has no workspaces yet, then
promote to a workspace package when the boundary needs enforcing. A separately
*published* package is unwarranted (single internal consumer).
