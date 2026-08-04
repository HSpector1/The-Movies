# D1-A — Studio Identity Visual Proof (Brief)

**Status:** Concept A (Golden Age Deco) **APPROVED** as the provisional identity; Concepts B/C
**cancelled**. Branch prepared as a bounded **merge candidate** for joint Engine/Art/Owner review
(unmerged). See `D1-A-CORE-SLICE-REPORT.md`, `D1-A-VALIDATION-REPORT.md`, and
`D1-A-ADOPTION-AND-MERGE-READINESS.md`.
**Branch:** `art-d1a-studio-identity-visual-proof` (off `main`, additive, unmerged).
**Feature flag:** `VITE_STUDIO_LOT_IDENTITY_PROOF` / `project-studio.flags.studio-lot-identity-proof` — **default OFF.**

## What this is

A presentation-only proof that the existing fixed-isometric Studio Lot can carry a
recognizable, cohesive, **original** studio identity — a name treatment, an emblem, and
world signage — **without changing one fact the simulation reports.** It answers a single
question for the owner: *does an authored identity layer make the lot read as a real studio,
and is Concept A ("Golden Age Deco") the right direction to expand?*

## What it is NOT

This slice adds **no** simulation behavior, **no** characters/GLBs, **no** Three.js, **no**
new renderer, **no** change to building architecture, and **no** change to the six existing
navigation intentions. It does not begin D1-B, does not merge to main, and does not touch the
Asset Lab character branches. See the contract's Section 34 non-goals.

## The hard boundaries honored

- **Simulation truth is untouched.** The renderer consumes only `StudioLotSnapshot` — the
  same narrow, presentation-ready contract it already consumed. It never reads `GameState`.
  `StudioLotSnapshot.ts` is byte-for-byte unchanged.
- **The identity manifest is presentation-only.** It describes how the lot *looks* (colors,
  labels, emblem, marquee). It has no field for money, week, productions, standing, talent,
  seed, or actions, and a unit test asserts that invariant structurally.
- **Fixed isometric camera preserved.** No free pan/zoom/rotate was added; the identity is
  painted into the existing scene.
- **No `Math.random`.** All drawing is deterministic; the UI hygiene suite scans every file
  under `ui/src` for `Math.random` and stays green.
- **Default OFF.** With the flag off, the scene builds **no** identity object and renders the
  shipped D1 lot byte-for-byte. Identity is built lazily on the first non-baseline review mode.

## Scope of this slice (owner-selected: Concept A only, with a gate)

Built: the presentation-only identity manifest; **Concept A (Golden Age Deco)**; an original
procedural emblem; the Studio Gate identity (wordmark + emblem); Stage A and Stage B plaques;
Production/Post signage; a theater marquee driven by release presence; department signage for
all nine buildings; hover/focus/selection/attention treatments; a procedural fallback; a
reduced-motion treatment; the feature flag; and a dev-only review selector containing exactly
`{ Current D1 baseline, Concept A, Fallback mode, Reduced-motion mode }`.

**Deliberately deferred to a future authorization:** Concepts B and C, the full
18-state × 7-viewport matrix, and the complete Playwright matrix / full 7-doc package.

## The decision in front of the owner

After reviewing the evidence and the live proof (see `D1-A-OWNER-REVIEW-GUIDE.md`), choose:

1. **EXPAND TO CONCEPTS B/C** — Concept A direction is right; author the two alternates for a
   head-to-head.
2. **REVISE CONCEPT A CORE** — the direction is close but a specific element needs work first.
3. **STOP — CONTRACT DECISION REQUIRED** — identity in the lot is a larger question than this
   slice can settle; a contract-level ruling is needed before more art.

This slice does **not** expand automatically.
