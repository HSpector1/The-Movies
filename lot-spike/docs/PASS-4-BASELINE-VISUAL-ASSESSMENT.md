# Pass 4 — Baseline Visual Assessment

An honest read of the studio lot as it stands at commit `34cebff` (visual code
frozen at `8c5a18b`), before the owner first-open polish pass. Based on relaunching
the lot and reviewing every screenshot in `shots/`, `shots/pass-2/`, `shots/pass-3/`
and the curated `~/Desktop/Movies Visual Review` set.

## Verdict

The lot is a **technically successful prototype** that reads clearly as a composed
place, but its world art is **procedurally drawn flat-shaded geometry** — it looks
like a well-made *diagram of* a studio, not the opening of a commercial game.

## Why it currently looks prototype-grade

- **Flat two-tone massing.** Every building is a roof rhombus + two solid-color
  faces (one lit, one shadowed) drawn with `Phaser.Graphics` fills. No gradients,
  no material texture, no soft occlusion — so surfaces read as paper, not stucco or
  corrugated steel.
- **Hard, uniform edges and a single light model.** All faces use the same two-step
  shading with no ambient occlusion at seams, so forms feel cut-out rather than
  built.
- **Thin, uniform shadows.** A single soft ellipse under each object; nothing
  grounds vehicles/props convincingly.
- **Low geometric detail on the big shapes.** The soundstage is a smooth barrel and
  a plain door band; close zoom reveals no rivets, vents, trim, or structure.
- **Uniform scale of detail.** Props and buildings share the same "drawn in code"
  fidelity, so nothing rewards leaning in.

## The five assets creating most of that impression

1. **The gate** — small, thin pillars + a flat beam; the text overlay carries it.
   It is not a landmark (see below).
2. **The soundstage** — a smooth buff barrel with a flat door rectangle; the single
   biggest shape in the scene and the least detailed.
3. **The administration building** — a taupe box + stepped crown; reads as a shape,
   not a prestige HQ.
4. **The ground plane** — flat diamond tiles with light noise; roads/lawn repeat
   obviously and don't ground the buildings.
5. **The ambient/prop sprites** — tiny flat figures and simple prop rectangles; fine
   at overview, thin at close zoom.

## Where close zoom exposes weak geometry

The `production` and `entrance` framings show it most: the soundstage barrel has no
surface detail, door depth, or rooftop equipment; the gate arch is a flat slab; prop
clusters are simple filled shapes. Close zoom currently *enlarges pixels* more than
it *reveals detail* — the opposite of the three-distance goal stated in
`VISUAL-DIRECTION.md`.

## Is the UI ahead of the environment? Yes.

The host chrome (top bar, info panel, character card, marquee list, activity toast)
is polished, typographic, and layered with gradients and shadows. It is visibly a
**higher fidelity tier than the world it sits over** — which makes the environment
read as placeholder by comparison. Closing that gap is the core of this pass.

## Why the gate is not a hero landmark

It occupies a small footprint, has thin geometry, and relies on a floating text
label for identity. At the owner-facing framings it barely registers as an
entrance. A first-open experience should arrive *through* a memorable gate; today
the gate is one of the weakest assets, not the strongest.

## Why active production relies too heavily on labels

An active stage is distinguished by: a tint, a door-glow quad, a pulsing bulb, a few
prop sprites, and — dominantly — a **floating production card**. With the card
hidden, the read is much weaker (dressing is small and flat). Production should be
legible from physical cues (open doors + spill, trucks, trailers, crew, loading)
before any label.

## Why transparent struggling-state buildings are unacceptable

In the struggling state, unavailable buildings are dimmed via **alpha (semi-
transparent) + grey tint**. A see-through building reads as "not finished / UI
placeholder," not "a real but quiet building." Struggle must be told with opaque,
physically-present buildings (closed doors, unlit windows, faded signs, empty
aprons), never transparency.

## What must be preserved

- The `StudioLotSnapshot` contract, `BuildingId` vocabulary, and navigation events.
- Deterministic seeded cosmetics (no `Math.random`).
- The vignette director + four vignette categories + scheduling.
- Selection / hit-areas / depth-sorting / one-canvas lifecycle / clean teardown.
- The warm classic-Hollywood palette *direction* and composition/journey.
- All passing verification (Pass 2/3 suites, typecheck, build).

## Implication for this pass

The highest-leverage move is to **raise world-art fidelity to meet the UI**, led by
the gate and the flagship soundstage, plus opaque physical struggling-state
storytelling and a clean owner-facing first-open. Stage A first proves that an
authored-sprite pipeline (hand-authored SVG → transparent PNG via `rsvg-convert`,
loaded into the existing Phaser scene) can materially beat the procedural art at the
current isometric camera — before any wider rollout.
