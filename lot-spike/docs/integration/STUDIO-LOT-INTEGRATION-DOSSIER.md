# Studio Lot — Integration Dossier (Master)

The handoff summary for the future integration agent. **Integration is not
authorized.** This dossier documents the frozen prototype so that, once Phase 5.1
is committed and the primary PM authorizes a separate integration worktree, the
adapter/mount work can begin predictably. Detailed evidence lives in the sibling
documents in this folder; this file summarizes and links them.

## Detailed documents

1. [STUDIO-LOT-SNAPSHOT-INVENTORY.md](./STUDIO-LOT-SNAPSHOT-INVENTORY.md) — every snapshot field, typed and classified.
2. [STUDIO-LOT-EVENT-INVENTORY.md](./STUDIO-LOT-EVENT-INVENTORY.md) — events emitted, public vs internal vs test-only.
3. [STUDIO-LOT-DATA-REQUIREMENTS.md](./STUDIO-LOT-DATA-REQUIREMENTS.md) — Level A/B/C data contracts + degradation.
4. [PRESENTATION-ASSUMPTIONS.md](./PRESENTATION-ASSUMPTIONS.md) — presentation choices that are not game truth.
5. [PACKAGE-EXTRACTION-MANIFEST.md](./PACKAGE-EXTRACTION-MANIFEST.md) — proposed module boundary + form.
6. [REUSABLE-SOURCE-INVENTORY.md](./REUSABLE-SOURCE-INVENTORY.md) — per-file include/exclude.
7. [SPIKE-ONLY-INVENTORY.md](./SPIKE-ONLY-INVENTORY.md) — what must not ship.
8. [PHASER-BUNDLE-ASSESSMENT.md](./PHASER-BUNDLE-ASSESSMENT.md) — deps, bundle size, lazy-load plan.
9. [ASSET-PATH-INVENTORY.md](./ASSET-PATH-INVENTORY.md) — assets (spoiler: all generated; none on disk).
10. [REACT-LIFECYCLE-CONTRACT.md](./REACT-LIFECYCLE-CONTRACT.md) — mount/update/unmount wrapper contract.
11. [FEATURE-FLAG-AND-LOADING-PLAN.md](./FEATURE-FLAG-AND-LOADING-PLAN.md) — flag + lazy-load rollout.
12. [TEST-TRANSFER-MANIFEST.md](./TEST-TRANSFER-MANIFEST.md) — which tests travel; what to add.

Design history (prior passes): `../VISUAL-DIRECTION.md`,
`../VISUAL-REFERENCE-SYNTHESIS.md`, `../PASS-2-VISUAL-REVIEW.md`,
`../PASS-3-VIGNETTE-DESIGN.md`, `../PASS-3-REVIEW.md`.

## Current frozen state

| | |
|---|---|
| Worktree | `/Users/bruce/The Movies - Studio Lot Spike` |
| Branch | `studio-lot-spike` |
| Frozen visual commit | `8c5a18b — feat(lot-spike): add deterministic production vignettes` |
| Git status | clean (before this docs commit) |
| Completed passes | 1 (POC `0d21d24`), 2 (living lot `650480a`), 3 (vignettes `8c5a18b`) |
| Approved product role | **Complementary Studio Overview** (management UI stays primary) |
| PM ruling | **WAIT FOR NAMED PHASE 5.1 MILESTONE** — integration not yet authorized |

## Public surface (the whole contract)

- **Snapshot in:** `StudioLotSnapshot` (`src/snapshot/StudioLotSnapshot.ts`) — a
  plain fact-bag; see doc 1. Stable id vocabulary: `BuildingId` (9 values),
  `LotActionKind` (6 values), `BUILDING_ACTION`, `ALL_BUILDING_IDS`.
- **View:** `class StudioLotView` (`src/StudioLotView.ts`) —
  `new StudioLotView(opts)`, `setSnapshot`, `select`/`clearSelection`/
  `triggerAction`, `resetCamera`/`camera`, `destroy`; plus test-facing
  `forceVignette`/`pauseVignettes`/`seekVignette`/`firstInspectableScreen`/
  `getDebugState`/`recreate`.
- **Events out:** `onSelect`, `onAction`, `onReady` (core); `onCharacter`,
  `onActivity` (optional atmosphere). See doc 2.
- **Lifecycle:** one view = one Phaser game = one canvas; `destroy()` is clean.

## Host responsibilities

- Build the **real-state adapter** `GameState → StudioLotSnapshot` (rework
  `fromGameState.ts` against Phase 5.1). Owns: standing→band, cash→band,
  critic→reception, elapsed→progress, production→stage assignment, building
  availability policy.
- Map `LotActionKind` → screens/**routes** (the lot owns no routes).
- Own the **feature flag** + **lazy import** + React lifecycle wrapper.
- Own selection→screen behavior, save interaction, and all **production/release
  truth**. The lot invents none of it.

## Lot responsibilities

- Rendering the composed lot; deterministic cosmetics from `sceneSeed` (no
  `Math.random`); ambient life; four production vignettes; interaction
  presentation (hover/select/inspect); clean teardown. Owns **no** game state.

## Files to extract (summary — see docs 6 & 7)

- **Extract (production):** `StudioLotView.ts`, `snapshot/StudioLotSnapshot.ts`,
  all `lot/*` (`LotScene`, `vignettes`, `assets`, `layout`, `palette`, `iso`,
  `rng`), + a ~15-line `lot.css` (the `#lot-stage` sky gradient).
- **Extract (test/dev only):** `fixtures.ts`, `fromGameState.ts` (reworked).
- **Exclude:** `src/ui/host.ts`, `src/ui/host.css` (bulk), `src/main.ts`,
  `index.html`, `vite.config.ts`, `window.__lot` global, screenshot images.
- **Dependencies:** runtime = `phaser` only; `puppeteer-core` is dev/test only.
- **Assets:** none on disk — all generated at runtime; no paths to fix.

## Integration prerequisites (binding gate — all must hold)

1. **Phase 5.1 committed** (talent-system rewrite landed).
2. **Main clean** at a known, committed HEAD.
3. **Talent & save contracts stable** (no in-flight churn).
4. **Public selectors/adapters available** to build the snapshot.
5. **Navigation stable** (routes/screens to map `LotActionKind` onto).
6. **Integration worktree authorized** by the primary PM (separate from this one).
7. **Feature-flag + lazy-load path available** in the host.

> Do not assume the current main HEAD (`f6ecfa7`) is the integration base — main is
> mid-rewrite with 14 uncommitted files at freeze time. The PM will supply the
> committed Phase 5.1 HEAD.

## Open decisions (genuine unknowns until 5.1)

- What, if anything, `BuildingState.available` maps to in the real game (or set all
  `true`). See PRESENTATION-ASSUMPTIONS #14.
- Where the adapter lives (inside the module vs host-side).
- Module form: internal source module vs internal workspace package (recommended).
- Whether `week` stays an integer or the game exposes a date model.
- Whether `onCharacter`/`onActivity` are surfaced to players or dropped.

## Integration-start checklist (for the future agent)

- [ ] Confirm all 7 prerequisites above; get the committed Phase 5.1 HEAD from the PM.
- [ ] Create the **authorized** integration worktree/branch (not this one).
- [ ] Extract per doc 6/7 into the chosen module form; add the import-boundary lint
      rule (no `src/core` imports).
- [ ] Rework `fromGameState.ts` against the real Phase 5.1 GameState + selectors.
- [ ] Decide `available` semantics (doc 4/PRESENTATION-ASSUMPTIONS #14).
- [ ] Add the React wrapper (doc 10) + feature flag + lazy import (doc 11).
- [ ] Port the travelling tests; add React-lifecycle + a11y + flag tests (doc 12).
- [ ] Verify: typecheck, build, unit + browser suites, one-canvas teardown,
      no-`Math.random`, bundle stays out of first paint.
- [ ] Confirm every lot action is also reachable from the primary UI.

## Verification recorded at freeze (commit `8c5a18b`)

| Check | Result |
|-------|--------|
| `npm run typecheck` | **PASS** |
| `npm run build` (prod) | **PASS** — JS 1,545.49 kB (gzip 360.61 kB), CSS 8.16 kB (gzip 2.37 kB) |
| `node tools/capture.mjs verify` (pass-2, 8 assertions) | **PASS** |
| `node tools/capture-pass3.mjs verify` (pass-3, 18 assertions) | **PASS** |
| `Math.random` in `src/` | none (comments only) |
| `src/core` imports in `src/` | none (comments only) |
| Main worktree | untouched (`f6ecfa7`); 0 lot-spike commits on main |

No implementation, dependency, asset, or screenshot changes were made in this
documentation pass.

## Readiness statement

The studio-lot prototype is **frozen, verified, and ready to enter a separate,
authorized integration spike** once the primary PM supplies the committed Phase 5.1
integration base and the seven prerequisites are met. No adapter, transfer, mount,
or application-integration work has begun, and none should until that base exists.
