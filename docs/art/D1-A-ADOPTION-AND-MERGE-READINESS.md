# D1-A — Adoption & Merge Readiness

This prepares `art-d1a-studio-identity-visual-proof` as a **bounded merge candidate** for a joint
Engine/Art/Owner review. It does not merge, open a PR, or modify `main`.

## What a reviewer is approving

An additive, presentation-only studio-identity layer over the shipped Gate-D1 Studio Lot:
Concept A ("Golden Age Deco"), the **single** provisional identity, behind a **default-OFF** dev
flag. With the flag off, the app is byte-for-byte the current product.

## The seven D1-A documents

1. `D1-A-STUDIO-IDENTITY-BRIEF.md` — what D1-A is, constraints, scope.
2. `D1-A-IDENTITY-MANIFEST.md` — the presentation-only manifest architecture.
3. `D1-A-VISUAL-DIRECTION.md` — Concept A visual direction (revised hierarchy).
4. `D1-A-OWNER-REVIEW-GUIDE.md` — how to review (evidence + live).
5. `D1-A-CORE-SLICE-REPORT.md` — the outcome report + final ruling.
6. `D1-A-VALIDATION-REPORT.md` — the full validation matrix results.
7. `D1-A-ADOPTION-AND-MERGE-READINESS.md` — this document.

## Isolation guarantees (verified)

- **Simulation untouched.** No `src/core` change; `StudioLotSnapshot.ts` unchanged vs `main`;
  no engine adapter change; no new selector. The renderer reads only the approved snapshot.
- **No new renderer / assets.** No Three.js, no GLB, no characters. Phaser only, procedural.
- **Default OFF.** `VITE_STUDIO_LOT_IDENTITY_PROOF` / the localStorage override are both off by
  default. With the flag off, no identity object is built and no review control renders.
- **Review controls are dev-only.** The mode selector, performance panel, and Hide control render
  **only** behind the dev flag and are unit-tested to be absent in ordinary player use.
- **Additive branch.** 18 files under `docs/art`, `scripts`, `ui/src/lot`, `ui/e2e`, `flags.ts`.

## Provisional branding (replaceable)

`PROJECT STUDIO` (wordmark) and `PS` (monogram) are **data** in `CONCEPT_A_GOLDEN_AGE` in
`ui/src/lot/identity/manifest.ts` (`displayName`, `monogram`). Changing them repaints the identity
and touches no scene code. They are review content, not a branding decision.

## Feature-flag posture

The identity feature remains **default OFF**. Turning it on for players (production adoption
without the dev review controls) is a **separate future ruling** — the scene already supports it
via `setIdentityMode()`, but no player-facing on-path is built here.

## What is explicitly NOT in this candidate

Concepts B/C (cancelled), D1-B, characters, GLBs, Three.js, simulation-mechanic changes, a wider
`StudioLotSnapshot`, a new Engine selector, external Art intake, and any change to Asset Lab work.

## Joint merge-review checklist

- [ ] Engine: confirm the snapshot boundary and no simulation impact.
- [ ] Art: confirm Concept A as the provisional identity and the evidence set.
- [ ] Owner: confirm the default-OFF posture and the provisional branding.
- [ ] All: confirm the isolation guarantees above against `main`.

On approval, a separate merge step (owned by the merge review) integrates the branch. This package
stops here.
