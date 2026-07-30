# Asset Lab 05F — Integration Recommendation

**Recommendation: DO NOT INTEGRATE. DO NOT PROPAGATE to the other roles. Owner M3 review first.**

## Why not now
05F answers a narrow proof question: *can the pipeline make one convincing hero at human scale?* The
answer is yes (both final reviewers: PASS WITH NOTES, EXCEEDS). But:
- Acceptance is the owner's **Apple M3** pass (software-GL runtime is diagnostic only).
- This is ONE character. Role-wide propagation is a **separate, explicit owner authorization** (brief
  §5, §27) — it is not implied by a hero pass.
- Integration = Gate D / OC-01 territory, which is HELD and outside this lab's scope.

## What is ready if/when the owner authorizes propagation
- The hero construction is captured as reusable **standards** (`HERO-CHARACTER-*-STANDARD.md`) and lives
  in `character_hero.py` on the proven 05E pipeline (65-bone rig, loft/tube/arc-loft primitives, export
  conventions). New primitives (`add_arc_loft`/`arc_loft`) are general and additive.
- Propagation would mean generalizing `character_hero` from the Electric row to the role table (as
  `character2` does) — a deliberate follow-up, reviewed per role, NOT a copy-paste.

## Isolation guarantees held this lab
- `character2.py` and ALL 05E GLBs (incl. `Char_Electric_Heavy*.glb`) are **byte-identical**; the hero
  is exported under DISTINCT filenames (`electric_hero_05f*.glb`).
- Scenes A–F untouched; Scene G production composition untouched (the 05F harness is additive to the
  review-only presentation).
- No production repository modified; no external character/clothing/rig/animation downloaded; no
  add-on / system-wide dependency installed; no `Math.random`.
- Default branch + the 05E branch + all other branches untouched; non-force push to `backup` only.

## Sequencing
1. Owner reviews the hero on M3 (via the in-engine 05F comparison group).
2. If Pass: owner decides whether to authorize role-wide propagation (a separate lab) and how to handle
   the documented rear-seam limitation (accept at distance, or invest in a bifurcating-pants manifold).
3. Only after that does any integration get planned — separately, on an owner-confirmed clean base.
