# D1-A — Concept A Ordinary-Player Enablement

**Status:** implemented on branch `art-d1a-concept-a-player-enablement` (from published `main`
`966ae6e`). **Pending Engine technical merge review.** Not merged; `main` is untouched.

This record does **not** revise the historical D1-A closure. At D1-A closure Concept A was correctly
default OFF and ordinary-player enablement was explicitly deferred as a separate owner decision. That
decision has now been taken (Art PM ruling **B**) and this branch implements the bounded correction.

## 1. Art PM visual approval (carried in, not re-decided)

Concept A — Golden Age Deco is **visually approved for ordinary players**. No visual redesign or
correction was authorized or required. The management-camera hierarchy and the Gate / Stage A-B /
Theater / signage / selection / attention / reduced-motion / fallback presentation are accepted.
Tertiary-label and smallest-viewport marquee readability are accepted as non-blocking hierarchy
tradeoffs. (Evidence: the Concept A Ordinary-Player Enablement Review return.)

## 2. The enablement-isolation defect (what this branch fixes)

At `966ae6e`, Concept A rendered **only** behind the development flag `studio-lot-identity-proof`,
which was *also* the only thing that rendered the review chrome (mode selector, performance panel,
Hide/restore pill). A single boolean `identityProof` in `StudioLotScreen.tsx` gated both the identity
render and the review chrome, so published main could not show Concept A to a player without also
enabling development-only review behavior. The renderer already supported the split via
`setIdentityMode()`; only the player-facing wiring was missing.

## 3. The production / review flag split

Two **independent** capabilities, from two different flags:

| Capability | Flag / function | Default | Renders review chrome? |
|---|---|---|---|
| **Ordinary-player identity** (content) | `studioLotIdentityEnabled()` — key `project-studio.flags.studio-lot-identity` / env `VITE_STUDIO_LOT_IDENTITY` | **ON** | **No** |
| **Development review tooling** | `studioLotIdentityProofEnabled()` — key `project-studio.flags.studio-lot-identity-proof` / env `VITE_STUDIO_LOT_IDENTITY_PROOF` | **OFF** | Yes (selector, perf panel, Hide/restore) |

`StudioLotScreen.tsx` derives one `effectiveIdentity`:

- **dev review OFF** (ordinary player) → `concept-a` by default, or `baseline` when the explicit
  player rollback is set. **No review chrome is constructed or rendered.**
- **dev review ON** → the review selector temporarily drives `baseline / concept-a / fallback /
  reduced`; disabling the flag returns to the ordinary-player identity mode.

The review-chrome render gates already keyed off `studioLotIdentityProofEnabled()`, so they remain
dev-only and default OFF. The development-review flag is **not** the ordinary-player enablement
source.

## 4. Ordinary-player default-ON ruling & baseline rollback

- Concept A is the **default player-facing identity**: it renders automatically on the Studio Lot,
  with no dev flag, no localStorage manipulation, and no developer tools.
- **Explicit rollback:** `VITE_STUDIO_LOT_IDENTITY=0` (build/dev or `.env`) or the localStorage key
  `project-studio.flags.studio-lot-identity` set to `'0'` forces the untouched D1 baseline for a
  player, with development review chrome still absent and navigation/status intact.

**Scope note:** this task isolates the *identity* and makes Concept A the player default. Whether the
Studio Lot *overview* itself ships to ordinary players is a separate, unchanged gate
(`studioLotOverviewEnabled()`, still default OFF) — not touched by this ruling.

## 5. Unchanged contracts (verified vs `966ae6e`, empty diff)

`StudioLotSnapshot.ts`, `ui/src/engine/adapter.ts`, `ui/src/lot/navigation.ts`,
`ui/src/lot/scene/LotScene.ts`, `ui/src/App.tsx`, and the entire `src/core/*` engine are
**unchanged**. No Engine selector added; no GameState/SaveFile change; no identity mode persisted;
the six navigation intentions are unchanged; deterministic rendering (`sceneSeed`, no `Math.random`)
is unchanged; Phaser stays lazy-loaded in the `StudioLotView` chunk. **Concept A visuals are
unchanged** (identity manifest/emblem/signage/scene untouched).

## 6. Changed files (this branch)

- `ui/src/flags.ts` — add `studioLotIdentityEnabled()` (player content gate, default ON, env/LS
  rollback) + `setStudioLotIdentityRollback()` + key `STUDIO_LOT_IDENTITY_PLAYER_LS_KEY`.
- `ui/src/lot/StudioLotScreen.tsx` — compute `effectiveIdentity`/`effectiveReduced`; one effect drives
  the scene for both the player and review paths; two-capability comment.
- `ui/src/flags.test.ts`, `ui/src/lot/StudioLotScreen.test.tsx`,
  `ui/src/lot/StudioLotIdentityReview.test.tsx` — updated to the new contract + rollback / toggle-back
  coverage.
- `ui/e2e/player-enablement.spec.ts` — **new** player-clean evidence spec (14 captures).

## 7. Validation

- Root TypeScript `tsc --noEmit`: **PASS (clean)**. UI TypeScript `tsc -p ui/tsconfig.json`: **PASS**.
- Unit/component `npm test` (vitest core + ui): **1030 passed / 79 files, 0 failures** (D1 + D-14 +
  D-15 + focused identity + new player-enablement/rollback/flag tests).
- Production build `npm run build`: **PASS** — identity in the lazy `StudioLotView` chunk
  (~1,549 kB); eager `index` bundle unchanged (~594 kB).
- Full Playwright `npx playwright test`: **65 passed** (51 at D1-A closure + D-15 recap specs + 11 new
  `player-enablement.spec.ts` tests) — every player-clean capture asserts zero dev chrome.
- Default player-identity ON, development-review default-OFF, and explicit baseline-rollback checks:
  covered by the unit tests above **and** the player-clean evidence spec.
- Determinism, clean-console, and repeated mount/unmount disposal: covered by the existing
  determinism/hygiene tests and the identity Playwright specs (unchanged, still green).
- `StudioLotSnapshot`/`GameState` comparison vs `966ae6e`: **empty diff**. Branch isolation: only the
  6 files above changed; `main` untouched.

## 8. Evidence

- Player-clean captures (ordinary player, no dev chrome): `out/player-enablement-evidence/`
  (`01-04` quiet studio at 1920×1080 / 1366×768 / 1280×720 / 125% zoom; `05` one production; `06` two
  productions; `07` theater release; `08` warning; `09` selection; `10` reduced motion; `11` fallback;
  `12` rollback baseline; `13` dev-review ON showing controls available only in dev; `14` dev-review
  OFF again → clean Concept A restored). `out/` is gitignored (untracked).

## 9. Known non-blocking visual notes (unchanged, accepted)

- Tertiary department plaques are small at the management distance (companion navigation carries the
  exact text). Released-film marquee title is small at the smallest viewports. No visual correction is
  requested.

## 10. Merge-readiness

Branch is an additive, isolated, presentation-wiring change with the ordinary-player identity default
ON and the development-review tooling default OFF. **Ready for Engine technical merge review.** No
merge, no PR opened here. D1-B not started; Asset Lab 05H and character work untouched.
