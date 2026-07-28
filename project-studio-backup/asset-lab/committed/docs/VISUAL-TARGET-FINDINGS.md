# Visual Target Findings (contract §2, §6)

**Product question:** can the existing CC0 assets + animation library + lighting + pipeline
produce a small studio that immediately reads as a movie studio, feels warm and inviting, is
readable from a management camera, looks materially better than Lab 01, stays performant and
modular, and establishes a useful target without pretending to be final art?

**Finding: yes.** Scene D achieves it. The gap between Lab 01 ("2006 prototype") and Lab 02
("2026 target") turned out to be **almost entirely presentation and composition, not asset
quality or polygon count** — the single most useful result of this milestone.

## What actually moved the needle (2006 → 2026)

Ranked by impact, none of these is "more geometry":

1. **Composition / studio vocabulary.** Lab 01 was a row of generic city buildings on black.
   Lab 02 arranges recognizable studio facilities — gate, water tower, office, soundstage,
   courtyard, backlot — with clear separation, paths, and a strong entrance. This alone is
   most of the improvement. Proven by the wireframe + "characters off" toggles: with the same
   ~4.5k-triangle greybox, the scene still reads as a studio.
2. **Sky + warm daylight + fog** replacing the black model-viewer void. Warmth and a horizon
   make it feel inhabited and inviting rather than clinical.
3. **A coherent, art-directed material family** (warm concrete/asphalt/brick/painted walls/
   industrial soundstage/metal/signage) instead of raw pack materials. Deliberate beats
   random.
4. **Readable signage via canvas textures** — the MERIDIAN gate, STAGE numbers, ADMINISTRATION,
   and banners give instant identity and legibility with zero external assets.
5. **Visible life** — 9 CC0 crew doing plausible activities answer "is the lot alive?" at
   management distance.
6. **Directional shadows + soft ambient** for grounding and depth.

## Evidence the improvement is presentation, not polygons

- Greybox-only (no crew): **~4,528 triangles / ~163 draw calls** and it still reads as a studio.
- Adding 9 CC0 characters: **~128,000 triangles** — the crew are the only heavy element, and
  they are life/readability, not architecture.
- The `wireframe`, `characters`, `landscaping`, `dressing`, `shadows`, and `atmosphere` toggles
  let a reviewer watch the studio identity survive with geometry stripped away — the point of
  the comparison controls (§8).

## Confirmed reusable levers for the real product

- **1 m scale holds**: bespoke greybox, CC0 assets, and the 1.83 m CC0 crew coexist at one
  metre = one unit with no rescale (same as the frozen 3D spike).
- **Canvas-texture signage** is a cheap, offline, high-readability identity technique.
- **The warm golden-hour lighting rig** (sky + warm key aligned to the visible sun + warm
  hemisphere fill + fog) is reusable as a look baseline.
- **The pipeline is unchanged** — Lab 02 added no pipeline steps; it consumed Lab 01's output.

## Honest weaknesses (still greybox, not final art)

- Buildings are simple massing; the soundstage/office are bespoke boxes, not detailed
  architecture (intentional — §12 non-goal).
- The sky is a warm procedural haze; readable and warm but not a hero skybox.
- Crew are the CC0 mannequin (tinted for variety); fine as background representatives, not
  hero characters (hero pipeline remains correctly not-started).
- This is a **visual target**, not a shippable look. Adopting it as final art is a separate
  art-direction decision (see `ASSET-LAB-02-INTEGRATION-RECOMMENDATION.md`).
