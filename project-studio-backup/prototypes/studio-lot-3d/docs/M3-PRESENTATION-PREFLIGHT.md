# M3 Presentation-Azimuth Preflight

A short compass check before the M3 art pass — not a re-audit. Grounded in what the
prior milestones actually proved (evidence in `shots/`, `shots-m2/`, and the Gate
reports).

## 1. What did M0 prove?
The isolated stack runs: React + TS + Vite + Three + R3F, renderer-neutral
(`StudioLotRenderer` interface over a fixture `StudioLotSnapshot`), builds + boots,
owns no simulation truth. Isolation from both protected repos holds.

## 2. What did M1 prove?
A deterministic gray-box slice with three camera states, clamped orbit, building +
character selection, a pure-function filming vignette (no `Math.random`), and clean
one-canvas teardown. Routing is authored + validated (vehicles/characters never cross
footprints; doorway entry only when open).

## 3. What did Gate A prove?
On real hardware: **~120 fps**; the **camera is a product success** (owner-designated,
preserve unchanged); routing corrections hold. Deficiency recorded: at overview the
gray-box can read as a fire station / institution — recognition must come from world
design. Camera + routing + determinism are the load-bearing wins to protect.

## 4. What did M2 prove?
One coherent CC0 family (Kenney) imports cleanly (GLB, no conversion), restyles toward
Meridian in a single-texture pass, carries readable rigged/animated characters, stays
tiny (756 KB) and — confirmed on real hardware — **~120 fps**. Central finding: generic
assets give a coherent **supporting** layer, but **studio identity needs bespoke
landmarks**. Known defect: the Kenney adult renders **oversized (~2.7 m vs 1.8 m)**.

## 5. What must M3 prove?
> A coherent, visually attractive Meridian production district that reads as a **working
> movie studio from overview distance** (no UI/audio), rewards close inspection, is
> built from **reusable** environment + character + material pipelines, and **preserves
> the proven camera, routing, determinism, and renderer-neutral architecture**.

Not required: a complete studio, every building type/era, final commercial animation,
a character creator, management UI, or integration.

## 6. What player need does the 3D scene serve?
The felt fantasy of **owning a working studio** — moving from a management overview to
human scale, recognizing people at work, watching a picture being shot, arriving
through a gate worth arriving through. (Decisions/numbers stay in UI; the 3D sells
place, activity, and ownership.)

## 7. What should the environment communicate (diegetically)?
Place + studio identity (Meridian gate/lettering, water-tower crest, numbered
soundstage, Deco admin); activity + production state (open stage door + warm spill,
recording light, trucks/trailer, crew cluster, camera rig); character role (silhouette
/ wardrobe / prop / stance); active-vs-calm zones; selection focus; emotional tone
(golden-hour warmth).

## 8. What stays in conventional screen-space UI?
Exact money, talent ratings, FilmShape, forecasts, contracts, choices, comparisons,
uncertainty, production calculations, detailed explanations. The 3D never becomes a
walking sim or a diegetic spreadsheet. (This slice keeps only a cosmetic
role/activity card — no sim data.)

## 9. Asset tiers (detail in `M3-ASSET-INVENTORY.md`)
- **Tier 1 hero (original/custom):** Meridian gate + "MERIDIAN PICTURES" lettering,
  Deco administration, water tower + crest, flagship soundstage façade, hero backlot
  façade, primary signage, recurring Deco trim → the `MeridianEnvironmentKit`.
- **Tier 2 gameplay:** characters, production truck, trailer, camera/boom, slate,
  equipment cases, stage doors, barriers, route markers (Kenney family, customized).
- **Tier 3 supporting:** vegetation, benches, crates, secondary vehicles, small props,
  background offices (permissive packs, style-normalized).
- **Tier 4 temporary:** any placeholder kept out of hero framing.

## 10. Systems that must remain reusable after the slice
The `StudioLotRenderer` interface + fixture snapshot; the camera rig + presets; the
deterministic vignette director; the authored routing/portal validation; the
`MeridianEnvironmentKit` modules; the shared material library; the character
rig/clip/role config; the preload/cache path. All documented for a next contributor.

## 11. Provisional performance + payload budgets
- **Perf (owner's Mac):** ≥60 fps avg, no sustained <50, smooth transitions, no
  enter-view hitch, stable vignette timing. Headroom exists (gray-box + M2 both ~120).
- **Payload:** added runtime art < ~20 MB compressed where practical; report if quality
  needs more. (Kit geometry is code-authored — near-zero payload; Kenney assets tiny.)
- **Report:** triangles, draw calls, skinned chars, texture memory, shadow cost,
  overview-vs-close cost, teardown.

## 12. Assumptions still untested (going in)
- That code-authored Three.js geometry can reach the concept's **beauty** bar (not just
  recognition) in real time.
- That normalized Kenney crew read acceptably at **human-scale hero** distance (owner:
  treat as supporting unless the review proves otherwise).
- That LOD/preload are actually needed at this scene size (measure before building).

## 13. Explicitly deferred
Integration; the full lot; a second vignette; a real audio system (hooks only); final
animation; character creator; full accessibility certification; period-accurate
vehicles/wardrobe beyond restyle; any paid asset; any DCC install.

## 14. What evidence closes M3?
The 30-item Gate-C set (before/after overview, UI-hidden overview, production,
human-scale, gate/admin/soundstage/backlot close-ups, character-role lineup, active
production from overview, open-door entry, vehicle route, vignette recording, camera
recording, reduced-motion demo, perf/preload/teardown reports) + passing tests + an
independent visual review, an owner review, a technical-art review, and one bounded
correction pass. Recognition test: an unfamiliar reviewer calls it a working movie
studio within 5 s, UI + audio off.

---

### First implementation task (owner-mandated)
**Scale normalization + a documented scene-scale standard** (`M3-SCENE-SCALE.md`):
normalize the adult root (~0.67 → ~1.8 m), validate against a reference lineup (adult /
doorway / van / car / trailer / equipment case / soundstage door), preserve animation +
ground contact, and revalidate footsteps / routes / selection bounds / shadows /
carried props / doorway entry. Do **not** enlarge buildings to compensate.
