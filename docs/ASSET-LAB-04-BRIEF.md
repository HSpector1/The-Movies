# Asset Lab 04 — Refined Studio Lot (brief)

## Less boxy · more believable · still stylized

A bounded **architectural-art-direction** milestone inside the standalone Asset Lab. Asset Lab 02
established a warm, readable studio greybox, but its own honest weakness was: *"buildings are simple
massing, bespoke boxes, not detailed architecture."* Lab 04 fixes exactly that — at the **lot**
scale (a whole varied studio campus, not one hero building) — producing a substantially **less
boxy, more architecturally believable, visually varied** movie-studio lot while staying **stylized**
(a modern stylized management-game environment, not photorealism).

Here the improvement is deliberately built into **geometry** (silhouette), not painted onto boxes.

## Scope & isolation
- Work is confined to `/Users/bruce/Project Studio - Asset Lab`, branch **`asset-lab-04-studio-lot`**
  (cut from `asset-lab-03-hero-soundstage` @ `a4da10c`).
- **New, self-contained Scene F** (the refined lot). **The Scene A–E components and the Lab 02/03
  material modules (`materials.ts`, `heroMaterials.ts`, `env.tsx`, `greybox.tsx`, `Workers.tsx`) are
  byte-untouched**; the only edits to shared files (`App`/`types`/`scenes`/`CameraController`/
  `DevPanel`/`HeroFx`/`cameraBridge`) are additive Scene-F wiring that changes no A–E render path.
  Scene D remains the boxy greybox lot, so **D ⇄ F is the direct greybox-vs-refined comparison.**
  New files only: `src/lab/lotMaterials.ts`, `src/components/refinedLot.tsx`, a `SceneF`,
  `tools/capture-lab04.mjs`, docs, `proof/lab04/`.
- **Zero new downloaded assets.** All new material (brick / board-and-batten wood / troweled stucco /
  terracotta tile) is procedural HTML-canvas generation in the same technique as Lab 03, seeded with
  `mulberry32` (no `Math.random`). The warm golden-hour rig, ACES tone mapping, canvas signage, and
  the **iconic water tower** are reused.
- No protected repo touched. **Not** integration, Gate D, OC-01, facility simulation, construction
  gameplay, final production art, a product redesign, or a copy of the original *The Movies* lot.

## What "less boxy" means here — four+ distinct roof languages in geometry
The heart of the milestone: the lot no longer reads as a row of equal boxes. Distinct forms:
- **Barrel vault + roof monitor** — the numbered soundstage row (Stages 1/2/3, staggered heights
  13/11/10 m, one rotated 90° so ridges cross).
- **Sawtooth north-light** — the Mill / scene shop (the unmistakable craft-shop roof).
- **Stepped Art-Deco parapet** + L-plan + entry portico — the Administration building.
- **Gable** — the Prop & Wardrobe warehouses (loading docks + buttresses).
- **Hipped pyramid** — the guard booth and a writers' bungalow.
- **Monopitch open shed** — the motor-pool / transportation shed (parked vehicles).
- **Curved streamline parapet** — the Commissary (rounded corner, awning, rooftop sign drum).
- **Marquee** + stepped lobby-to-flytower — the Screening Theater.
Plus massing moves (L/stepped/wings/annex/link) and facade articulation (pilasters, cornices,
plinths, porticos, loading docks, recessed reveals, signage bands) — all verifiable in the wireframe
capture, proving the win is in geometry, not textures.

## Composition
A readable, non-repetitive campus: a **marquee entrance gate** on the axis → an **entrance
forecourt** → the **main studio avenue** → the **numbered stage row** (north), **mill + water tower**
(NW), **backlot false-front street** (east, exposed bracing), **commissary quad** (SE), and a
**service apron** behind the stages. A **palm avenue** lines the ceremonial drive; the water tower is
the off-axis tallest point. Heights step down (water tower → stages → mill/admin → commissary/gate)
for a non-flat skyline. One cohesive warm 1940s golden-hour palette with function-coded materials
(stucco = offices, corrugated steel = stages, brick/wood = craft/backlot) ties ~15 varied buildings
into one studio.

## How to run
```bash
cd "/Users/bruce/Project Studio - Asset Lab"
npm install
npm run dev            # http://localhost:4320  (Scene F = Refined lot)
npm run build && npm run preview && node tools/capture-lab04.mjs   # regenerate proof/lab04/
```

## This milestone can fail
Pass is judged by the owner on: does it read as a **real working movie studio** (not a row of
boxes); is it **materially less boxy / more varied** than the Scene D greybox lot; is the roofscape
and massing varied; does it stay **warm, cohesive, and stylized** (not photoreal, not chaotic); and
is the direction **promising enough to continue**. See `ASSET-LAB-04-OWNER-REVIEW-GUIDE.md`. A pass
authorizes **more visual-target work only** — never Gate D, integration, or a product redesign.
