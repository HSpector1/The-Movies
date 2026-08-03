# D1-A — Concept A Core Slice Report

**Starting `main` SHA:** `ceb271b51a8bad5433584a8cbce0666f1a4fdf6a`
**Branch:** `art-d1a-studio-identity-visual-proof` (additive, off `main`, unmerged)
**Flag:** `VITE_STUDIO_LOT_IDENTITY_PROOF` — default OFF

## What was built

A presentation-only studio-identity layer over the existing fixed-isometric Studio Lot,
Concept A ("Golden Age Deco") only, behind a default-OFF flag.

New modules (`ui/src/lot/identity/`):
- `manifest.ts` — the presentation-only `StudioIdentityManifest`, Concept A data, review registry.
- `emblem.ts` — original procedural Deco crest + `PS` monogram (no external art, no imitation).
- `signage.ts` — plaques, gate wordmark, theater marquee, attention badges.

Additive wiring (all guarded, all snapshot-only, no `GameState`, no `Math.random`):
- `LotScene.ts` — lazy `buildIdentity()`, per-building plaques, gate wordmark + emblem,
  release-driven marquee, in-canvas attention badges, reduced-motion-gated bulb chase,
  `setIdentityMode()`, `identityDebug()`.
- `StudioLotView.ts` — `setIdentityMode` / `identityDebug` passthroughs.
- `StudioLotScreen.tsx` — dev-only review selector `{ baseline, concept-a, fallback, reduced }`
  + a performance panel (both only when the identity flag is on).
- `flags.ts` — `studioLotIdentityProofEnabled()` (default OFF) + override helper.
- `lot.css` — review-bar styling with a focus-visible ring.
- `scripts/gen-lot-fixtures.mts` — added a `warn` fixture (financial-pressure state).

## Validation (actual results)

- **`StudioLotSnapshot.ts` unchanged** — verified; the renderer reads only the snapshot,
  never `GameState`.
- **TypeScript:** `tsc --noEmit` (root + `ui/tsconfig.json`) — **clean.**
- **Unit/component tests:** full suite **981 passed / 76 files** (was 961/73; +20 new, 0
  regressions). Includes the shipped D1 lot tests, D-14 tests, the flag test, and the UI
  no-`Math.random` hygiene scan (which covers the new `identity/` files).
- **New focused tests (20):** `identity/manifest.test.ts` (9 — presentation-only invariant,
  palette bounds, single-concept, default-OFF flag), `identity/draw.test.ts` (5 — emblem +
  signage render without throwing, marquee exposes `2 × bulbDensity` bulbs, all attention
  kinds, deterministic), `StudioLotIdentityReview.test.tsx` (6 — selector present only with the
  flag, exactly the four modes, correct `setIdentityMode`/`setReducedMotion` wiring, GameState
  never mutated, nav still routes).
- **Production build:** `vite build` — **passes.** Identity code lands in the lazy
  `StudioLotView` chunk; the eager bundle is unchanged (flag-off path adds nothing).
- **Evidence spec (real Phaser, seeded states):** `ui/e2e/lot-identity.spec.ts` — **15
  passed**, including a clean-console pass across every review mode and a
  repeated-open/close no-orphaned-canvas leak check.
- **Console-error capture:** clean while cycling all four modes over a live release state.
- **Disposal / leak:** three open→close cycles leave 0 canvases and no page errors; identity
  objects are scene children and are destroyed with the scene.

## Evidence

16 required shots in `out/d1a-identity-evidence/` (see `D1-A-OWNER-REVIEW-GUIDE.md` for the
index). Verified by eye: Concept A reads cohesively at 1920×1080, remains legible at 1280×720,
the baseline mode is byte-for-byte the shipped D1 lot, and the fallback keeps all nine
destinations reachable.

## Known issues / honest limits

1. **Isolated "Stage B active" is not an authentic D1 state.** The selector assigns the first
   active production to Stage A by array position, so a lone production is always Stage A. The
   "Stage B active" evidence is therefore captured within the authentic two-stage state (Stage B
   plaque + ACTIVE badge, with Stage B selected). This is a truthful limitation of D1, not a
   rendering gap; nothing was fabricated to force a Stage-B-only snapshot.
2. **Plaque legibility is management-distance-bound.** Signage is clear at 1920×1080 and tight
   but readable at 1280×720. A future pass could add a zoom-aware plaque scale.
3. **Provisional name.** `PROJECT STUDIO` / `PS` is review content, one manifest string from any
   final name; it is not a branding decision.
4. **Pre-existing red plaza pavement** is inherited from the base scene, unchanged here.

## Recommendation

**EXPAND TO CONCEPTS B/C.** Concept A demonstrates that the lot can carry a cohesive, original
identity with zero simulation impact, a clean baseline, a working fallback, and no measured
performance or leak cost. The architecture (presentation-only manifest + guarded scene layer +
review selector) is already shaped to drop in two more concepts at a single branch point
(`manifestFor` / `IDENTITY_CONCEPTS`), which is what a fair head-to-head needs.

This is a recommendation only. The slice does not expand automatically and this branch is
unmerged.
