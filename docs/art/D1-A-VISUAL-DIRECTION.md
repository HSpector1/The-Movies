# D1-A — Visual Direction: Concept A "Golden Age Deco"

The direction is a restrained, prestige, classic-studio read: brass and enamel signage, a
geometric Art-Deco emblem, cream lettering on charcoal, a burgundy theater marquee. It is
meant to make the existing lot say *"this is a film studio, and these are its named stages and
departments"* at the fixed management camera, without pulling attention off production
information and without any change to the buildings themselves.

**Originality.** Every mark is procedurally drawn from primitives. There is no downloaded
logo, and the emblem deliberately avoids the lion / mountain / globe / torch / castle-crest
vocabulary of real commercial studios. The `PS` monogram and Deco frame are generic period
design language, not an imitation of any studio's marks.

## The identity elements

### Visual hierarchy (revision)
Three tiers of world sign make the lot read at the management camera without zooming:
- **Primary landmarks** (large, building-mounted): Studio Gate banner, Stage A / Stage B facade
  identifiers, Theater marquee canopy.
- **Secondary departments** (medium plaques above the building): Administration, Production / Post.
- **Tertiary orientation** (small plaques above the building): Development, Casting / Talent,
  Expansion.
At smaller viewports the primary landmarks hold; tertiary labels become less prominent and the
semantic companion navigation carries the exact text.

### Studio Gate (primary)
A large charcoal marquee-board bears the studio wordmark (`PROJECT STUDIO`, serif, letter-spaced)
in a stepped brass Deco frame with burgundy inlay and corner blocks, with the enlarged `PS`
emblem crowning it — the biggest wordmark on the lot, integrated into the gate structure. The
provisional name is **review content, not final branding** — one manifest string from any name.

### Emblem
A stepped Deco octagon frame with an inner ring, a horizontal accent bar, restrained spotlight
rays, and the `PS` monogram in the shared serif with a soft drop for legibility. Enlarged for the
gate crest; a small-radius render also serves as a medallion. Reads at the default camera, holds
up in grayscale (shape and value, not only color — a grayscale render path is exercised in the
unit tests), and carries no motion.

### Stage A / B facade identifiers (primary)
Each soundstage wears a large facade-mounted panel: a big serif `A` / `B` under a burgundy `STAGE`
caption in a brass-framed charcoal plate, attached to the building face (not a floating label).
Stages are identifiable without the companion navigation. The identifier is **identity only** —
it never signals availability; occupancy remains driven by snapshot state (sprite tint + the
`ACTIVE` badge), and the panel sits clear of the production cards.

### Theater marquee canopy (primary)
A blade canopy silhouette over a burgundy marquee face carrying `THEATER`. When a film is present
the marquee adds the release title (`latestReleaseTitle`); with no release it reads `THEATER` only
(its static no-release state). A gentle, deterministic bulb chase runs only when motion is allowed;
under reduced motion every bulb sits fully lit — that static state is the reduced-motion equivalent.

### Department plaques (secondary / tertiary)
Brass double-rule enamel plaques sized by tier, sitting **above** each building so they never
cover production cards or door dressing. Labels come from the manifest, so a rename never touches
scene code.

### Shared Deco accents
Restrained brass-with-burgundy entrance bands sit at the base of the primary buildings, and the
selection treatment reads gold — spreading the palette (muted gold / burgundy / charcoal / cream)
onto the architecture without repainting any building or altering functional state colors.

## State treatments (shape + word + color, never color alone)

The lot already exposed attention states in the accessible companion navigation; D1-A also
paints them in-canvas as small badges above the affected building:

| State | Shape | Word | Color | Source |
|---|---|---|---|---|
| financial pressure | triangle | ATTENTION | amber | `buildings[].attention === 'warning'` (Administration; runway ≤ 8 wks or cash ≤ 0) |
| lit stage | ring | ACTIVE | gold | `activeProductions[].active` |
| release present | check | RELEASE | green | `releasePresence !== 'none'` (Theater) |

One badge per building, priority `warning > active > positive`. These are truthful reflections
of snapshot state, not invented; D1 exposes no `decision-required`, so none is manufactured.

## Interaction, focus, selection

- **Hover / selection** use the lot's existing outline + lift + label; the identity plaque is
  always-on so a building is named even before hover.
- **Keyboard focus** is the accessible companion navigation's `:focus-visible` brass ring; the
  review selector controls carry the same focus ring. The canvas remains `aria-hidden` — the
  companion list is the accessible truth in every mode, including fallback.
- **Selection memory** across mount/unmount is preserved (unchanged from D1).

## Reduced motion

The scene already multiplies every time-based delta by a `motion` factor (0 under reduced
motion). The marquee chase respects it; under reduced motion the identity is fully static and
fully readable. Nothing about identity depends on animation to be legible.

## Fallback

If any identity draw throws, the layer sets an internal failed flag, hides all identity
objects, and restores the base gate label — the base lot, its navigation, and selection all
keep working. The "Fallback mode" review option exercises this exact path on purpose.

## Known cosmetic notes

- Primary landmarks (Gate, Stage A/B, Theater) read clearly at 1920×1080 through 1280×720 and at
  125% zoom. Tertiary department labels are intentionally small at the fixed fit-to-lot camera;
  the companion navigation is the exact-text fallback. This is the intended hierarchy, not a bug.
- Entrance accent bands are deliberately restrained; they read as a thin base trim at the fixed
  camera.
- The lot's red plaza pavement is a pre-existing cosmetic from the base scene, unchanged here.
