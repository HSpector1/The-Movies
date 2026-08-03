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

### Studio Gate
The gate carries the studio wordmark (`PROJECT STUDIO`, serif, letter-spaced, framed by twin
brass rules with burgundy end-caps) and the emblem above it. The provisional name is **review
content, not final branding** — it is one manifest string away from any name the owner picks.

### Emblem
A stepped Deco octagon frame with an inner ring, a horizontal accent bar, restrained spotlight
rays, and the `PS` monogram in the shared serif with a soft drop for legibility on light
building faces. Designed to read at the default camera, hold up in grayscale (shape and value,
not only color — there is a grayscale render path used in the unit tests), and carry no motion.

### Department & stage signage
Every building wears a compact brass double-rule enamel plaque:
`ADMINISTRATION · DEVELOPMENT · CASTING · STAGE A · STAGE B · PRODUCTION / POST`. Stage plaques
are emphasized with burgundy corners. Plaques sit **above** each building so they never cover
the occupied-stage production cards or door dressing. Labels come from the manifest, so a
rename never touches scene code.

### Theater marquee
A burgundy Deco marquee with perimeter bulbs. When a film is present, the marquee shows the
release title (`latestReleaseTitle` from the snapshot); otherwise it reads `THEATER`. A gentle,
deterministic bulb chase runs only when motion is allowed; under reduced motion every bulb sits
fully lit — that static state is the marquee's reduced-motion equivalent.

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

- Plaques are necessarily small at the fixed fit-to-lot camera; they read clearly at 1920×1080
  and are legible but tight at 1280×720. This is a management-distance trade, not a bug.
- The lot's red plaza pavement is a pre-existing cosmetic from the base scene, unchanged here.
