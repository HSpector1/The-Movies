# Asset Lab 05G — Integration Recommendation

## Status

The 05G Electric hero is an **additive, isolated proof** on branch
`asset-lab-05g-hero-electric-surgical-correction`, backed up to the `backup` remote
(`HSpector1/The-Movies`). It is **not merged** and **not integrated** into the production game. That is
by design and by instruction.

## Recommendation

**Do not integrate yet. Hold for owner real-GPU review.** After a `PASS` / `PASS WITH NOTES` on the M3:

1. **Keep it additive.** `electric_hero_05g*.glb` sits alongside `electric_hero_05f*` and the 05E crew;
   nothing was overwritten. If adopted, 05G becomes the reference Electric hero standard; 05F stays as
   the documented predecessor.
2. **Role-wide propagation is a separate decision.** The three corrections (deltoid cap; thin fitted
   arc-loft vest; narrowed hip loft + tucked gusset + slim belt) are parameterized in
   `character_hero_05g.py` and would transfer to the other seven roles, but propagation is **prohibited
   until the owner separately authorizes it**. It is also a larger effort (per-role fit, headwear,
   proportions) that deserves its own milestone, not a silent rollout.
3. **Optional future polish (only if the owner asks).** Bifurcated trouser legs for a true fly/inseam
   (removes the residual soft-crotch form); a rounder vest side/back wrap; a slightly firmer deltoid at
   raised-arm extremes. None are blockers; all are beyond a surgical correction.

## What integration would touch (when authorized)

- The production character loader would point the Electric role at `electric_hero_05g*.glb`.
- The runtime already loads 05G in the **review harness only** (Scene-G comparison group); the production
  Scene-G composition is unchanged. No production wiring was added this milestone.

## Do not

Begin Gate D / OC-01, modify the production repos, add facilities/pathfinding/needs/schedules, or
propagate to other roles. None of those were touched by 05G and none should be started on the strength of
this proof.
