# Integration Recommendation (contract §11)

**Question the lab exists to answer:** can these asset packs and formats accelerate future
Project: Studio development, and how should they be handled? **This document recommends; it
integrates nothing.** Per its own instructions and the Master Roadmap, the Asset Lab does not
touch the main game, opens no Gate D, starts no OC-01, and treats none of these assets as
final Meridian identity art.

## Bottom line

- **Formats: yes, adopt GLB as the runtime standard.** glTF/GLB round-trips cleanly through a
  pure-local pipeline (inventory, optimize, validate) with no Blender and no native archive
  binaries. FBX is a fine *intake* format but should be converted, not shipped. Legacy `.msh`
  is a dead end. This answers the format half of the question decisively.
- **Assets: yes for the CC0 packs, as scaffolding — not as identity art.** The Quaternius
  Downtown kit and animation library are genuinely useful to *accelerate* development:
  greybox/blockout environments, scale calibration, a crew/background-animation source, and a
  test bed for the presentation pipeline. They are **CC0**, so there is no legal blocker. But
  the approved art direction is a stylised 1940s–50s Hollywood studio; these generic
  city/interior assets are **evaluation and scaffolding**, explicitly not the final look
  (Master Roadmap: "do not turn the game into a generic asset-pack scene").
- **FBX props: conditional — provenance must be cleared first.** Useful for prototyping set
  dressing, but **LICENSE-UNCLEAR**; do not ship or treat as cleared until the original source
  and license are found. Kept prototype-only, visibly tagged.
- **wintersets: no.** DO-NOT-USE. Valuable only as a *design reference* for how a "set"
  bundles presentation + simulation + era gating (see WINTERSETS-ARCHAEOLOGY / SCHEMAS).

## What actually accelerates development here

1. **A proven, reusable asset pipeline** (the real deliverable). `sources → hash → inventory →
   curate → optimize → manifest → validate`, all local and repeatable, is reusable for *any*
   future pack regardless of these specific assets. This is the durable win.
2. **Scale calibration confirmed.** Quaternius assets are authored at 1 unit = 1 m and the CC0
   character is 1.83 m — matching the frozen 3D spike's convention with zero rework. Future
   3D work can trust that baseline.
3. **A ready CC0 animation vocabulary.** 43 clips including the six roles Studio cares about
   (idle, walk, talking idle, seated, pickup, repair) — enough to animate crew/background
   without a hero-character pipeline (which remains correctly not-started).
4. **A design reference for content packaging** (the legacy `.ini` set schema → the proposed
   `SetPackage`).

## Boundaries any future integration must respect (Master Roadmap)

- **Additive, flag-gated, lazy-loaded.** Any presentation that ever consumes these assets
  imports nothing from `src/core`, changes no save format, and ships behind a flag.
- **Gate D stays closed until its entry conditions are met** (owner-named clean Phase-5.2 base,
  sim track paused, lot promoted with its own contract). This lab is *upstream* of Gate D and
  does not advance it.
- **Not identity art.** Adoption for blockout/scaffolding is not adoption as the shipped look;
  that remains an art-direction decision, not an asset-availability one.
- **Provenance gates use.** CC0 → reusable; LICENSE-UNCLEAR → prototype-only; DO-NOT-USE →
  never.

## Recommended next milestone

**A CC0 greybox environment kit for the (still-held) 2.5D/3D presentation track** — i.e. use
the pipeline + the CC0 Downtown/animation assets as *blockout* material to exercise the
read-only `StudioLotSnapshot → renderer` path in isolation, **when and only when** Gate D's
entry conditions are actually met and the owner authorises it. Until then, the Asset Lab's
output is: a validated pipeline, a provenance-cleared CC0 asset set, and this recommendation.
No further build is authorised by this document.

## Explicit non-integration statement

Nothing in this lab has been merged, copied, or referenced into the main game, either spike,
or any contract. The recommendation above requires a separate, owner-authorised decision to
act on. See the final report's confirmations.
