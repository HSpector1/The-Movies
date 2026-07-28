# Reusable Source-File Inventory

Every source file at commit `8c5a18b`, whether it should travel into a future
integration, and what it needs first. LOC are approximate.

| File | Purpose | Public/private | Dependencies | Required changes before production | Include? |
|------|---------|----------------|--------------|-------------------------------------|----------|
| `src/StudioLotView.ts` (179) | Public embeddable view: mount/update/teardown, event fan-out, debug methods | **public** | phaser, LotScene, vignettes (type), snapshot | Split debug methods (`forceVignette`/`seek`/`pauseVignettes`/`firstInspectableScreen`/`recreate`/`getDebugState`) so they're test-facing, not player API; drop nothing else | **include** |
| `src/snapshot/StudioLotSnapshot.ts` (135) | The contract: types + `BuildingId` + `ALL_BUILDING_IDS` + `BUILDING_ACTION` | **public** | none | none | **include** |
| `src/snapshot/fromGameState.ts` (177) | Types-only reference adapter (`GameStateFacts` → snapshot) | public (reference) | snapshot types only | Rework against the **real Phase 5.1 GameState** (its local `GameStateFacts` mirror was written vs baseline `279e58e` and WILL be stale) | **include as reference** (may relocate host-side) |
| `src/snapshot/fixtures.ts` (138) | 4 demo snapshots | dev/test | snapshot types | Keep for tests/storybook; not shipped to players | **include (test/dev only)** |
| `src/lot/LotScene.ts` (1340) | The Phaser scene: render, camera, input, production grammar, ambient, inspection, vignette host | private | phaser, iso, palette, rng, assets, layout, vignettes, snapshot | Trim `window`-facing debug only if any leaked (none currently); otherwise ship as-is | **include** |
| `src/lot/vignettes.ts` (628) | `VignetteDirector` + `VignetteHost` + 4 vignette plans | private | rng, layout, snapshot types | none | **include** |
| `src/lot/assets.ts` (838) | Runtime texture generation (buildings, props, tiles, roles) | private | phaser, iso, palette | none | **include** |
| `src/lot/layout.ts` (272) | Composed lot layout, aprons, dressing, stage anchors | private | snapshot types, assets (footprints) | none | **include** |
| `src/lot/palette.ts` (161) | Color constants | private | none | none | **include** |
| `src/lot/iso.ts` (50) | Iso projection + depth + tile constants | private | none | none | **include** |
| `src/lot/rng.ts` (64) | Deterministic seeded RNG (`Rng`, cyrb53+mulberry32) | private | none | none | **include** |
| `src/ui/host.ts` (280) | Prototype chrome: top bar, mode toggle, info panel, char card, toast, action log, prototype dock | **spike host** | snapshot/view types | Do **not** ship. The host app builds its own React chrome; reuse this only as a reference for what panels to build | **exclude** (reference only) |
| `src/ui/host.css` (589) | Chrome styling + `#lot-stage` sky gradient | **spike host** | — | Extract only the `#lot-stage` gradient + `canvas` rules (~15 lines) into the module's `styles/lot.css`; leave the rest | **partial** |
| `src/main.ts` (109) | Standalone entry: wires view↔host, installs `window.__lot` | **spike entry** | view, host, fixtures | Do **not** ship (installs a global; standalone bootstrap) | **exclude** |

## Summary

- **Include (production module):** `StudioLotView`, `StudioLotSnapshot`, all of
  `src/lot/*` (LotScene, vignettes, assets, layout, palette, iso, rng), plus a
  small extracted `lot.css`.
- **Include (test/dev only):** `fixtures.ts`, `fromGameState.ts` (as a reworked
  reference adapter).
- **Exclude:** `src/ui/host.ts`, `src/main.ts`, most of `host.css` (see
  SPIKE-ONLY-INVENTORY).

Not every file in `lot-spike/src` belongs in production: the `ui/` chrome and the
standalone `main.ts` are the spike's *host*, which the real app replaces.
