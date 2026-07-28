# Visual Direction — Studio Lot

The design bible for the isometric studio lot. It records the decisions behind the
pass-2 visual pass so the look stays coherent as the prototype grows. Grounded in
[VISUAL-REFERENCE-SYNTHESIS.md](./VISUAL-REFERENCE-SYNTHESIS.md); where that file
flags a claim as inference, the choice here is a deliberate authored call, not a
documented historical fact.

---

## 1. North star

> I own a living Hollywood movie studio. I can see what it is producing, feel
> whether it is thriving, and understand where to go next.

The lot is a **window onto the game**, never a second simulation. It renders a
`StudioLotSnapshot` and paints — it computes no gameplay truth. The emotional
register is a **handcrafted, warm, cinematic studio diorama**: dignified, golden-
hour, mid-century Hollywood. Not photoreal, not a city builder, not a dashboard
with buildings behind it, not a theme park.

Guiding principle borrowed from *The Movies* (Molyneux): **simulate what people
believe a studio is** — the iconic, legible beats of a film shoot — not procedural
fidelity.

## 2. Camera & projection

- **Fixed 2:1 isometric** (tile 128×64), one orientation. Chosen over Phaser's
  Tiled-oriented iso tilemap for full control of hand-composed massing and depth.
- The true isometric precedents are **RCT1/2 and Parkitect**, not *The Movies*
  (which was free-3D). Their lesson drives our art pipeline (§4).
- Player owns the camera: drag-pan, cursor-centered wheel zoom, WASD/arrows,
  `R`/Reset. No forced cinematic moves. Named framings (`overview`, `production`,
  `entrance`, `wide`) exist for presentation and screenshots, never to seize control.

## 3. Shape language & architecture

Every major building must be recognizable by **silhouette before label**:

| Building | Silhouette grammar |
|----------|--------------------|
| Administration | Tall, symmetrical, Art-Deco **stepped crown**, brass string-courses — the lot's civic anchor |
| Writers' | Low, domestic **gabled** cream bungalow with terracotta roof |
| Casting | Smaller gabled cousin of Writers' — public, approachable |
| Soundstages | Massive **vaulted (barrel) hangars**, numbered, elephant doors — the only industrial mass |
| Post-production | Cool **slate flat-roof** block with rooftop vents — technical, enclosed |
| Screening theater | Cream mass with a **marquee canopy + blade sign** — ceremonial |
| Gate | Deco **arch + twin pillars + lettering**, guard booth — the threshold |

Composition follows an intended journey: **Gate → Studio Boulevard → (plaza) →
Administration**, with the **production district** (stages, water tower, aprons) to
one side and **expansion land** left visibly graded and empty. Landscaping is
composition, not scatter: palms line the boulevard, hedges frame the courtyard,
the lot is enclosed by a perimeter wall (back) and hedge (front) so it reads as a
place with edges, not objects on a void.

## 4. Materials, color, light

- **Palette** (`palette.ts`): warm cream stucco, terracotta, taupe + brass for the
  civic/Deco notes, buff hangars, sage lawns, warm asphalt, a golden-hour sky
  (CSS radial gradient behind a transparent canvas). *This palette is an authored
  inference* grounded in Streamline Moderne / 1930s–40s marquee sources — no
  golden-age studio published an official palette.
- **Grounding:** every building sits on a **foundation plinth** and casts a soft
  contact shadow, so nothing floats. Roads have curbs; stages have paved aprons.
- **Two-face shading:** each massing shows one lit face (+gx/east) and one shadow
  face (+gy/south) plus a lighter roof — cheap, consistent, readable depth.
- **Art pipeline (the RCT lesson):** author geometry richer than it reads, let the
  clean silhouette carry at zoom. All art is code-drawn originals — no imported or
  copied assets, ever.

## 5. Character scale & ambient-life economy

- Figures are ~1 tile tall, readable as silhouettes. **Four distinct roles** by
  color/prop/silhouette: crew (blue + hard hat), office/creative (tan + clipboard),
  talent/executive (pale coat + red scarf), grip (olive, pushing a gear cart).
- **Authored, not simulated** (borrowing Planet Coaster's "variety from reuse, not
  per-agent AI"): predetermined routes with **dwell stops** and small clusters —
  people pause, loiter at stage aprons, cross the avenue — they do not all circle
  endlessly. No needs, schedules, relationships, or pathfinding.
- A few vehicles (roadster, delivery van, golf cart) run credible road routes and
  **dwell at stage aprons** to "unload." More life appears when the studio is busy.

## 6. The three-distance rule

The lot must reward every zoom (RCT/Parkitect readability + Planet Zoo layering):

- **Overview:** studio size, districts, active vs idle stages, thriving vs
  struggling, expansion potential. Production tags collapse to **compact markers**.
- **Management:** building function, stage occupancy, film title + progress +
  weeks. Production tags show the **full card**; the info panel opens on click.
- **Observation:** open-door spill light, gear clusters, crew loitering, a parked
  van, the recording light pulsing, banners and café life. Tags **hide** here —
  the scene itself carries the story.

## 7. Production-state grammar (the core system)

A stage's state must read **without the card**:

- **Active (shooting):** warm **spill light in the open doorway**, a pulsing red
  **recording light**, an **equipment cluster** (cart, crates, lamp, cones), a
  **title-board easel** with the film's name, a **parked production van**, and crew
  loitering at the apron. Full tint.
- **Idle (open, ready):** closed doors, maintained, slightly muted tint, no gear,
  recording light off.
- **Closed (unavailable):** dark, dimmed, quiet — not derelict, just not in use.

All active-stage dressing is **deterministic** from the film's stable `id` +
`sceneSeed` — no `Math.random`, and it computes nothing about the film.

## 8. Struggling vs established grammar

The same recognizable lot, told through **authored environmental storytelling**,
not a global tint or actor multiplier:

| | Struggling | Established |
|---|---|---|
| Stages | one shooting, others dark | both shooting |
| Buildings | casting/post closed & dimmed | all open |
| Boulevard | plain | premiere **banners**, studio **flag** |
| Plaza | quiet | **café umbrellas**, more people |
| Grounds | modest | lusher planting |
| Traffic | sparse, no van | roadster + van + cart |
| Expansion | bare graded dirt | bare graded dirt (still the promise) |

Driven entirely by snapshot facts (`standing`, per-building `available`/
`underDressed`, `activeProductions`, `releasedFilms`).

## 9. Interaction & chrome

- **Hover:** footprint outline (white) + floating label + a subtle lift.
- **Select:** gold footprint outline + label + info panel; panel carries a
  production card or a releases marquee; one action button emits the navigation
  intent to the host.
- **Player chrome** (top bar: identity, week, standing, cash; Reset View; info
  panel; hint) is kept visually distinct from **prototype controls** (the state
  toggle and the navigation-event log), which live in a dashed, muted "PROTOTYPE"
  dock so they never read as shipping UI.

## 10. Originality boundary

Everything is original geometry inspired by the *general fantasy* of a classic
Hollywood lot. We copy **no** artwork, layout, building, character, icon, logo,
name, texture, sound, or composition from *The Movies* or any other game or real
studio. The water tower, gate, and marquee are generic archetypes, not any
recognizable real or fictional landmark.
