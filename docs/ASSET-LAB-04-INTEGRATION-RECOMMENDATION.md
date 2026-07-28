# Asset Lab 04 — Integration Recommendation

**This document recommends; it integrates nothing.** No Scene-F code, material, or geometry has been
merged, copied, or referenced into the main game, either spike, or any contract. Acting on anything
below is a separate, owner-authorized decision. Gate D and OC-01 remain closed.

The headline finding: **"less boxy" is a geometry problem, and it is cheap** — the entire varied lot's
bespoke architecture is ~6,250 triangles. The improvement over the Lab 02 greybox is *architectural
silhouette + material family*, achieved with zero downloaded assets and the proven offline/
deterministic techniques.

## 1. Reusable techniques (durable, low-risk, zero new asset footprint)
- **A roof-form kit** (gable prism, hipped pyramid, barrel, sawtooth north-light, monopitch, roof
  monitor) built from primitives + one tiny custom BufferGeometry — the reusable "less-boxy" toolkit.
- **Procedural masonry / board-and-batten wood / troweled stucco / terracotta-tile** maps in the same
  canvas + height→normal technique as Lab 03 — material variety, zero downloaded assets, deterministic.
- **Function-coded palette discipline** — assign materials/colors by building function, pull every hue
  toward the warm 1940s golden-hour family; this is what makes ~15 varied buildings read as one studio.
- **The warm golden-hour rig + ACES tone mapping** remain the unifying look baseline across all labs.

## 2. Reusable architectural vocabulary (bespoke, throwaway geometry — NOT production art)
- The refined buildings (`refinedLot.tsx`) — Deco admin, streamline commissary, sawtooth mill, barrel
  stages, marquee theater, gable warehouses, hipped booth/bungalows, backlot false-fronts, marquee
  gate — are **greybox+ placeholders** whose value is the *massing + roof-form + composition
  vocabulary*, not the meshes. Real production would rebuild these as authored architecture; the
  lesson is *which forms and which composition* read as a believable studio lot.

## 3. No dependency or asset changes
Lab 04 added **no new runtime dependency and no downloaded asset** (it reuses the Lab 03
`@react-three/postprocessing` pin only for the optional, default-off Post FX). All new geometry and
textures are original/procedural.

## 4. What still requires bespoke production art (not attempted here)
Final authored architecture and materials per building, interiors, a real backlot set system, detailed
props, hero characters, and a shippable skybox. All are §12 non-goals and remain future bespoke-art work.

## 5. Must NOT enter the main game yet
Everything in this lab. Specifically: no Scene-F geometry, no lot materials, no `refinedLot`/`SceneF`
code, and no CC0 asset path may cross into `The Movies` or either spike. Any presentation adoption
remains gated on Gate D's entry conditions and an explicit owner decision. This milestone produces an
**architectural direction + a reusable roof/material toolkit**, nothing more.

## Recommended next step
If the owner passes the direction, the highest-value next probe is **one of**:
1. Take **one or two** of these buildings (e.g. the Deco admin or the sawtooth mill) to Lab 03
   *hero* fidelity, to test the varied vocabulary at production quality — still isolated, pre-Gate-D.
2. A **restraint / composition pass** — refine spacing, circulation, and landscaping density on the
   lot for the best management-camera read, capturing the specific "still boxy/generic" notes.

If the owner does not pass: capture the specific "still generic/boxy/wrong" notes against
`proof/lab04/` and iterate the refined lot only.
