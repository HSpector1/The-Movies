# Refined Studio Lot — Findings (Asset Lab 04)

**Product question:** can the Lab 02 studio-greybox concept be made **architecturally believable,
visually varied, and substantially less boxy** — a whole lot that reads as a real working movie
studio — using only procedural geometry + the proven offline/deterministic techniques, while staying
**stylized** (not photoreal) and isolated?

**Finding: yes.** Scene F reads as a varied, believable studio lot and is clearly a different class
from the Scene D greybox of the *same* concept. The single most useful result: **"less boxy" is a
geometry problem, and it is cheap** — the entire lot's bespoke architecture is only ~6,250 triangles.

## What actually moved the needle (boxy → believable), ranked

1. **Roof-form variety in geometry.** A row of equal boxes with the same roof is the boxiest possible
   read; the fix is *distinct roof languages*: barrel-vault + monitor (stages), sawtooth north-light
   (mill), stepped-Deco parapet (admin), gable (warehouses), hipped pyramid (booth/bungalow),
   monopitch shed (motor pool), curved streamline parapet (commissary), marquee (theater). The
   wireframe capture (`10-wireframe.png`) proves the varied silhouette survives with all materials
   stripped — the win is in the massing, not the paint.
2. **Massing moves + height variety.** L-plans, stepped setbacks, wings, lean-to annexes, and a
   *staggered numbered stage row* (heights 13/11/10 m, one rotated 90° so ridges cross) turn a
   "spreadsheet of boxes" into an organically-grown campus with a non-flat skyline.
3. **Function-coded material variety under one warm palette.** Stucco (offices), corrugated steel
   (stages), brick + board-and-batten wood (craft/backlot), terracotta accents — four surface
   identities tied to function, all pulled toward the same 1940s golden-hour warmth so variety reads
   as *authored*, not chaotic. New brick/wood/stucco/tile maps are procedural (canvas + height→normal),
   zero downloaded assets.
4. **Studio-lot vocabulary + composition.** A marquee entrance gate, numbered stages, a sawtooth
   mill, a backlot false-front street with *exposed bracing*, the iconic water tower, a commissary,
   and a palm avenue — arranged into readable zones (entrance / stage row / mill / backlot /
   commissary quad / service) — is what says "movie studio" rather than "office park."
5. **The reused warm rig + ACES** doing the cinematic work, exactly as in Lab 02/03.

## Evidence it is technique, not vertex count

Measured (`performance-lab04.json`, software-diagnostic):
- **Whole-lot bespoke architecture: ~6,250 triangles / ~600 draw calls** (all ~15 varied buildings +
  landscaping structures).
- Adding production dressing + landscaping: still ~10k triangles.
- Adding the CC0 crew: ~120,000 triangles — the crew remain the only heavy element (same finding as
  Lab 02/03). Draw calls are the real budget on the software renderer; shared materials keep them flat.

The `Wireframe`, `Production dressing`, `Landscaping`, and `Crew` toggles let a reviewer strip the
scene back to the bare architected silhouette, and **D ⇄ F** switches between the boxy greybox lot
and the refined one.

## Confirmed reusable levers for the real product

- **Roof-form kit** (gable prism, hipped pyramid, barrel, sawtooth, monopitch, monitor) built from
  primitives + a tiny custom BufferGeometry — a cheap, reusable "less-boxy" toolkit.
- **Procedural masonry/wood/stucco/tile** in the same canvas + height→normal technique as Lab 03 —
  material variety with zero downloaded assets.
- **Function-coded palette discipline** — assign materials/colors by building function and pull every
  hue toward the warm family; this is what lets 15 varied buildings read as one studio.
- **The warm golden-hour rig + ACES** remains the unifying look baseline across all labs.

## Honest weaknesses (still a target, not shippable art)

- Still **stylized greybox+**, not final art: buildings are legible massing with procedural surfaces,
  not detailed bespoke architecture; foliage is flat-shaded icosahedra; signage is oversized/readable.
- The backlot false-fronts face the interior street (west), which is the shadow side at golden hour;
  the `Backlot` view frames the sunlit **braced** side, which also tells the "movies are faked here"
  story, but the painted fronts themselves read best in the overview.
- The **Post FX (bloom/AO)** and **PCSS soft-shadow** layers are real-GPU-only and default **off**;
  the deterministic headless proof runs the zero-dependency core look.
- This is **one isolated scene proving architectural direction** — not a lot editor, not sim, not
  final art. Adoption is a separate art-direction decision (see
  `ASSET-LAB-04-INTEGRATION-RECOMMENDATION.md`).

## Note on rendering honesty

All `proof/lab04/` images are headless **SwiftShader software** renders (see
`performance-lab04.json`) — darker/slower than a real GPU, diagnostic only, **not** a target-hardware
claim. The whole lot is drawn deterministically (seeded `mulberry32`; two captures are byte-identical).
