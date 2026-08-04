# D1-A — Validation Report (Production-Adoption Package)

The full validation matrix re-run for the merge candidate. Branch
`art-d1a-studio-identity-visual-proof`, approved visual checkpoint `45c6c58`.

## Static + build

| Check | Result |
|---|---|
| Root TypeScript (`tsc --noEmit`) | PASS (clean) |
| UI TypeScript (`tsc -p ui/tsconfig.json --noEmit`) | PASS (clean) |
| Production build (`vite build`) | PASS — identity code in the lazy `StudioLotView` chunk; eager bundle unchanged |

## Unit + component suite

| Check | Result |
|---|---|
| Full suite (`npm test`, core + ui) | **984 passed / 76 files**, 0 failures |
| D1 lot tests (`StudioLotScreen.test.tsx`, lot suite) | included, PASS |
| D-14 tests (talent-profile / career-impact) | included, PASS |
| Focused identity — manifest presentation-only + palette + flag | `identity/manifest.test.ts` (9) PASS |
| Focused identity — emblem/signage draw smoke + determinism | `identity/draw.test.ts` (6) PASS |
| Focused identity — review selector + isolation + Hide toggle | `StudioLotIdentityReview.test.tsx` (8) PASS |
| UI no-`Math.random` hygiene scan (covers `identity/`) | PASS |

## Playwright evidence (real Phaser)

| Check | Result |
|---|---|
| `ui/e2e/lot-identity.spec.ts` (working evidence + matched pairs) | 12 passed |
| `ui/e2e/lot-identity-final.spec.ts` (final clean, overlay hidden) | 9 passed → 16 shots |
| Console-error scan across all review modes | clean (0 errors) |
| Repeated mount/unmount disposal (0 orphaned canvases) | PASS |
| Responsive (1920/1366/1280) + 125% zoom | captured, primary landmarks legible |

## Isolation / boundary

| Check | Result |
|---|---|
| Default-OFF feature flag | PASS (`studioLotIdentityProofEnabled()` false without env/localStorage) |
| Review controls behind the dev flag only (no leak into player use) | PASS (unit-tested: no control renders + identity stays baseline with the flag off) |
| `StudioLotSnapshot` unchanged vs `main` | PASS (empty diff) |
| No `src/core` changes | PASS |
| No engine adapter / new selector | PASS (`ui/src/engine/adapter.ts` untouched) |
| No Three.js, no GLB, no characters | PASS |
| Branch scope (additive only) | PASS — 18 files under `docs/art`, `scripts`, `ui/src/lot`, `ui/e2e`, `flags.ts` |
| `main` untouched | PASS (`main` = `ceb271b`) |

## Determinism

Rendering is seeded (`sceneSeed`) and free of `Math.random`; the emblem/signage draw test
asserts identical draw-call counts across two renders; Playwright captures are deterministic
against the seeded SaveFileV4 fixtures.

## Conclusion

Every gate passes. The branch is a clean, isolated, additive merge candidate with the identity
feature default OFF and the review controls confined to the development flag.
