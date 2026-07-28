# Asset Lab 03 — Hero Soundstage Art-Direction Proof (brief)

A bounded **art-direction** milestone inside the standalone Asset Lab. Asset Lab 02 established
that the jump from "2006 prototype" to "2026 target" was mostly **presentation and composition,
not polygons**, and it closed with an explicit recommendation: take those principles and apply
them to **one** bespoke facility at production fidelity, still isolated, still pre-Gate-D. Lab 03
is exactly that pass: it upgrades **one soundstage (Stage 1) and its immediate production area**
from successful greybox to a convincing modern visual target.

Here "modern" means modern **rendering fidelity** (a 2026-quality look), **not** modern-era
architecture. The approved direction is a timeless/classic Hollywood soundstage; a stage exterior
reads the same from the 1940s through today, so the whole fidelity gain rides on surface, light,
grounding, silhouette articulation, and an inhabited apron, never on re-styling the building.

## Scope & isolation
- Work is confined to `/Users/bruce/Project Studio - Asset Lab`, branch
  **`asset-lab-03-hero-soundstage`** (cut from `asset-lab-02-studio-greybox` @ `1c86dd3`).
- **Scene D and the entire Lab 02 material family are byte-untouched.** The hero is a **new,
  self-contained Scene E** (`src/components/hero.tsx`, `src/lab/heroMaterials.ts`,
  `src/components/HeroFx.tsx`). Scene D stays the greybox baseline so the owner gets a direct
  **D ⇄ E greybox-vs-hero** toggle of the *same* Stage 1.
- Lab 01/02 evidence is preserved: Scenes A/B/C untouched, `proof/*.png` and `proof/lab02/*`
  untouched; new evidence lives in `proof/lab03/`.
- One dependency was added (`@react-three/postprocessing` + `postprocessing`, pinned to the
  versions compatible with the frozen r3f8 / three r0.161 stack) to drive an **optional,
  default-off** post-processing pass. It changes nothing unless `Post FX` is toggled on.
- No protected repo touched. No Gate D, no OC-01, no sim contracts, no game integration, no set
  interior, no full-lot art pass. This remains an **isolated visual recommendation**, not final art.

## What was built — Scene E, Hero Stage 1
- **Articulated hero soundstage** (bespoke geometry): recessed **biparting elephant doors** with
  a **man-door** wicket and steel header/track; a **parapet + bright cornice** squaring off the
  roofline with the **barrel roof rising behind**; a **ridge ventilator monitor** and a **rooftop
  HVAC** unit; **exterior conduit, downspouts, and a junction box**; a **red-eye stage warning
  light** and a stage-entrance work light (emissive); a **loading dock** with rubber bumpers and a
  switchback stair; the big painted **"1"**, **SOUND STAGE**, **MERIDIAN PICTURES**, and **STAGE 1**
  signage. The classic-stage silhouette survives as pure wireframe (`12-wireframe.png`).
- **Procedural PBR** (`heroMaterials.ts`): deterministic canvas-generated **corrugated-metal
  normal + roughness maps** (walls, doors, barrel roof), **weathered painted-steel albedo** with
  drip streaks and base grime, and **board-formed concrete** with expansion joints, mottling, and
  oil stains for the apron. All offline, all seeded (no `Math.random`).
- **The active production apron** (grip/electric): hero **film lights** firing into the open doors,
  **C-stands + flags + sandbags**, a **generator → distro → cable** run with yellow **crossover
  ramps**, **flatbed carts + road cases**, **apple boxes**, a **video village** (director's chair +
  monitor), a **dolly-track** section, **cones/bollards/fire-extinguishers**, and a ground story of
  **fire-lane paint, hazard hatching, tape marks, chalk, and stains**. Nothing sits on the fire-lane
  or blocks the door.
- **Six deterministic CC0 crew** doing plausible active-set work (gaffer tying in feeder, grip
  lifting a case, DP/director at video village, electrician standing by, PA crossing the apron).
- **Modern-fidelity render levers**, Scene-E-scoped so Scene D stays a clean baseline: **ACES
  filmic tone mapping** (the single biggest look shift), **baked contact-shadow grounding**,
  tuned **envMapIntensity** on the existing procedural IBL, an optional **PCSS soft-shadow**
  toggle, and an optional **Post FX** pass (N8AO + bloom + vignette + SMAA) for real-GPU review.

## How to run
```bash
cd "/Users/bruce/Project Studio - Asset Lab"
npm install           # if not already (adds the postprocessing dep)
npm run dev           # http://localhost:4320  (boots on Scene E — Hero Stage 1)
npm run build && npm run preview && node tools/capture-lab03.mjs   # regenerate proof/lab03/
```

## This milestone can fail
Pass is judged by the owner on: does it read as a **hero soundstage** (not a textured box); is it
**materially better than the Scene D greybox** of the same building; does the **surface/material**
work sell clad metal + weathered concrete; is the **apron** a believable active set; does it stay
**warm and inviting**; and is it **promising enough** to take a second facility (or the interior
question) to this fidelity. See `ASSET-LAB-03-OWNER-REVIEW-GUIDE.md`. A pass here authorizes
**more visual-target work only** — never Gate D, OC-01, or production/main-game integration.
