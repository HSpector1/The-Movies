# Asset Lab 02 — 2026 Studio Greybox Visual Target (brief)

A bounded **visual-improvement** milestone inside the standalone Asset Lab. Asset Lab 01
passed as a *technical pipeline* proof but the owner judged its presentation "closer to 2006
than 2026, too generic." Lab 02 uses the same proven pipeline and CC0 assets to build **one
attractive, readable movie-studio greybox** that establishes a stronger visual target.

## Scope & isolation
- Work is confined to `/Users/bruce/Project Studio - Asset Lab`, branch
  **`asset-lab-02-studio-greybox`** (cut from `main` @ `b0405c3`).
- Lab 01 is preserved: Scenes A/B/C untouched, its 9 `proof/*.png` untouched; new evidence
  lives in `proof/lab02/`.
- No protected repo touched. No Gate D, no OC-01, no sim contracts, no production integration,
  no new asset libraries. This remains an **isolated visual recommendation**, not final art.

## What was built
- **Scene D — Studio Greybox Target**: a small studio district — MERIDIAN entrance gate +
  guard booth + water-tower silhouette, an ADMINISTRATION office, a barrel-roof soundstage
  (STAGE 1) with loading doors, a production courtyard (carts, film lights, crates, truck,
  benches, banners, staging ring, landscaping), and a backlot suggestion (storefront façade +
  scenery flat + prop storage).
- **Visible life**: 9 deterministic CC0 crew (walk / talk / sit / carry / repair / wait).
- **Art-directed warm material family** + canvas-texture signage (studio identity, stage
  numbers, banners) — offline-safe, readable.
- **Golden-hour lighting + procedural sky + warm fog** replacing Lab 01's black void.
- **Camera presets** (Overview / Entrance / Soundstage / Courtyard / Human Scale / Reset) and
  **comparison controls** (Lab01 Scene A ⇄ Lab02 Scene D; characters / landscaping / dressing
  / shadows / atmosphere toggles) that isolate *presentation* gains from raw polygon count.
- **The Lab 01 red-pavement defect is fixed at the root** (see `MATERIAL-CORRECTION.md`).

## How to run
```bash
cd "/Users/bruce/Project Studio - Asset Lab"
npm run dev            # http://localhost:4320  (boots on Scene D)
npm run build && npm run preview && node tools/capture-lab02.mjs   # regenerate proof/lab02/
```

## This milestone can fail
Pass is judged by the owner on: reads-as-a-studio, warmth, management-view usability,
soundstage-vs-office distinction, believable crew, and "promising enough to continue." See
`OWNER-REVIEW-GUIDE.md`. Lab completion does **not** authorize Gate D or production integration.
