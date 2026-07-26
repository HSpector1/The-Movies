# Studio Lot — Visual Spike

An isolated, playable proof of concept for an **isometric movie-studio lot**: a
browser view that turns the studio from a set of numbers into a *place* you can
walk your eye across, click into, and watch come to life.

This is a **research prototype**, not the Phase 5 UI. It lives entirely in this
folder (`lot-spike/`), on the `studio-lot-spike` branch, in its own git worktree.
It does not touch the simulation core, `GameState`, `SaveFileV1`, the M0A formulas,
or any contract document. It imports **nothing** from `src/core`.

> **Pass 2 — "the lot is alive".** The functional spike has had a visual-design
> pass: the lot is enclosed and grounded, the gate is a hero entrance, soundstages
> show real production activity (open-door spill light, gear, crew, a parked van,
> a title board), four ambient roles and vehicles move with dwell stops, and the
> struggling/established states differ through authored dressing — not just tint.
> See **`docs/`** for the design bible, the reference research, and the pass-2
> review; **`shots/pass-2/`** for before/after evidence.

## Launch (exact)

```bash
cd lot-spike
npm install
npm run dev          # → http://localhost:4316/  (Vite prints the URL)
```

**Controls:** drag to pan · scroll to zoom (cursor-centered) · WASD/arrows to pan ·
`R` or **Reset View** to reframe · click a building to select it.

**Switch studio state:** use the **PROTOTYPE** dock (bottom-left) → *Studio state:
Small / Established*. In the real app the host supplies this state; here two
fixtures stand in.

## Docs

- `docs/VISUAL-DIRECTION.md` — the design bible (north star, shape/color grammar,
  three-distance rule, production-state grammar, struggling vs established).
- `docs/VISUAL-REFERENCE-SYNTHESIS.md` — cited research from studio/management sims.
- `docs/PASS-2-VISUAL-REVIEW.md` — baseline diagnosis, changes, reviews A–D,
  correction, limitations, next milestone.

## Screenshots

- `shots/pass-2/` — the pass-2 evidence set (14 required shots + entrance + baselines
  + two side-by-side comparisons). Regenerate with `npm run preview` then
  `node tools/capture.mjs after`.
- `shots/1-4*.png` — original pass-1 evidence (kept for comparison).

## Tests / verification

`node tools/capture.mjs verify` (with `npm run preview` running) drives the built
app in headless Chrome and asserts: fixtures load, state switching changes the lot,
select/deselect, navigation events reach the host, repeated snapshot updates don't
leak display objects, destroy/recreate leaves exactly one canvas, and no console
errors. `npm run typecheck` and `npm run build` must both pass.

## Current limitations (honest)

- Implemented **and visually demonstrated:** everything in the screenshots.
- **Structurally proven only:** `GameState → StudioLotSnapshot` (types-only in
  `fromGameState.ts`) — not yet wired to a live engine.
- **Not integrated:** the prototype does not touch the Phase 5 app; navigation
  actions open the action log, not real screens.
- The gate arch could be a stronger overview landmark; ambient life lacks one-off
  surprise beats; no click-to-inspect on characters yet (see the next milestone in
  the pass-2 review).

---

## For the owner — what to look at (no code required)

Open `shots/` for four screenshots that tell the whole story:

| File | What it shows |
|------|---------------|
| `1-struggling.png` | A **small, struggling studio**. One picture shooting, the second stage dark, casting and post not yet open, a quiet lot. |
| `2-successful.png` | The **same lot as an established studio**. Both stages lit and shooting, more activity, a studio car on the road, a hit on the marquee. |
| `3-selected-stageB.png` | Clicking **Soundstage B** opens an information panel: the film, its genre, weeks remaining, a progress bar, and a button that navigates into the studio-management screen. |
| `4-theater-releases.png` | The **navigation log** (bottom-left) recording that clicking buildings sends real "open this screen" events to the rest of the app. |

The two studio states are driven by nothing but a small bag of facts (a
"snapshot"). Feed the view a different snapshot and the lot repaints — dark stages
light up, closed buildings open, the car appears. That is the whole point of the
experiment: **the lot is a window onto the game, not a second game.**

### Does it answer the questions we set out to ask?

1. **Can a browser isometric lot feel like a place, not a dashboard?** Yes. Warm
   golden-hour light, a composed courtyard, roads, palms, a water tower, and a
   little ambient motion read as a studio backlot, not a form.
2. **Can buildings act as navigation into management screens?** Yes. Hover
   highlights and labels a building; clicking selects it and opens an info panel;
   the panel's button emits a navigation event the host app turns into a screen.
3. **Can active films and studio activity be shown visually?** Yes. A film on a
   stage shows its title, progress, and weeks remaining on a floating tag, the
   stage's recording light pulses, and workers/vehicles move around a busier lot.
4. **Can it consume the real game state later without owning the rules?** Yes —
   by design. See *Integration* below. The lot only ever reads a
   `StudioLotSnapshot`; the host translates `GameState` into that at the boundary.
5. **Is it promising enough to integrate after Phase 5?** The prototype makes the
   case: the fantasy survives the translation to a small browser view, and the
   architecture keeps the simulation untouched. Recommended as a Phase-5-plus layer.

---

## Architecture — one boundary, held strictly

```
   StudioLotSnapshot            (a plain bag of presentation facts)
          │
          ▼
     StudioLotView              (embeddable; owns the Phaser game)
          │
          ▼
   building selected  /  navigation event   →   host application
```

- **`src/snapshot/StudioLotSnapshot.ts`** — the *only* shape the visuals consume.
  Bands, labels, fractions, booleans. No formulas, no talent, no forecasts, no RNG
  state, no actions. This is the narrow, framework-neutral adapter the brief asked
  for.
- **`src/snapshot/fixtures.ts`** — the two hand-authored snapshots (struggling /
  successful) that stand in for what the host will one day compute.
- **`src/snapshot/fromGameState.ts`** — the **integration proof**. A pure,
  types-only translation from a structural view of the real `GameState` into a
  `StudioLotSnapshot`. It imports nothing from `src/core` and re-derives no rule;
  it reads already-computed fields and classifies them into display bands. At wire
  time you swap the local structural types for the real imports and the function
  body is unchanged.
- **`src/StudioLotView.ts`** — the public surface. `new StudioLotView({ parent,
  snapshot, onAction, onSelect })`, then `setSnapshot(...)` over time. The host
  never touches Phaser.
- **`src/lot/`** — the presentation internals: isometric projection (`iso.ts`),
  deterministic seeded RNG (`rng.ts`), programmatically-drawn placeholder art
  (`assets.ts`, `palette.ts`), the composed layout (`layout.ts`), and the scene
  that renders/animates it and handles camera + input (`LotScene.ts`).
- **`src/ui/`** — the surrounding HTML/CSS chrome (top bar, mode toggle, info
  panel, navigation log).

### Rules the spike keeps

- **No `Math.random`.** All cosmetic variation (worker paths, prop jitter, light
  phases) derives from the snapshot's `sceneSeed` via a seeded RNG. Same seed →
  same lot.
- **No simulation.** The lot computes no reception, box office, standing,
  forecast, or timing. It paints facts.
- **No copied assets.** Every building, prop, and tile is original geometry drawn
  at runtime from a restrained classic-Hollywood palette — inspired by the genre,
  copied from nothing.
- **No backend, database, account, remote API, or runtime LLM.**

### Why not Phaser's isometric tilemap?

A brief inspection: Phaser 3's isometric support is oriented around *loading Tiled
maps*, which suits scattered tile terrain, not a hand-composed lot with bespoke
building massing and precise front-to-back depth control. A direct 2:1 isometric
transform over a logical grid (`iso.ts`) is a few lines of math and gives full
control of placement, depth sorting, and custom sprites. That is what the spike
uses; the ground is still a tiled diamond field, baked once into a render texture.

---

## What this spike deliberately does **not** do

No progression mechanics decide when a studio is struggling vs. established — the
host supplies that. No character needs, schedules, relationships, pathfinding
beyond fixed ambient routes, workforce or traffic simulation. The motion is there
for *life*, not to become another engine. Integration, real screens, and any
gameplay decisions are out of scope until after Phase 5.
