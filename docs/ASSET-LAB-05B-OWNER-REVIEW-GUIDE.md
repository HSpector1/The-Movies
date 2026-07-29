# Asset Lab 05B — Owner Review Guide

This is a **correction milestone** on the Lab-05 crew characters you rejected. Everything is
isolated in the Asset Lab; nothing in the game, the spikes, or Scenes A–F changed.

## The 60-second look (Blender proof — high fidelity)

Open, in order, from `proof/lab05b/`:
1. `final/roles-front.png` — the four required roles read at a glance: **PA** (clipboard) ·
   **Grip** (blue shirt + flat cap) / **Electric** (amber hard hat + hi-vis vest) · **Maintenance**
   (slate coveralls + soft cap) · **Office** (charcoal coat).
2. `final/base-face-front.png` vs `final/base-face-back.png` — **face is on the FRONT**; the back
   is hair only. (This was the headline defect.)
3. `final/base-front.png` + `final/base-lowerbody.png` — clothed body, connected limbs, **boots on
   the ground** (no floating feet).
4. `final/pose-walk-3q.png`, `pose-sit-3q.png`, `pose-kneel-front.png` — clean deformation under
   the real CC0 clips (no shards).
5. `final/skintones-front.png`, `palettes-front.png`, `headwear-front.png` — 5 skin tones, 5 outfit
   palettes, headwear/hair variety.

## Before vs after
- **Old (rejected):** `proof/lab05/thumbnails/Char_Grip_Standard.png`, `Char_Director_Standard.png`
  (melted blob, floating feet, no face).
- **New:** `proof/lab05b/final/base-front.png` (Grip) and the role lineup above.

## The runtime (diagnostic)
`proof/lab05b/runtime/01-crew-front.png` + `04-human-scale.png` show the corrected crew loaded in
Scene G facing the camera with faces on the front, **console-error-free**. These are **headless
SwiftShader** shots (software; flat lighting, ~3 fps) — **NOT a performance or final-look test.**

## What only you can decide (real Apple M3 GPU)
Please run Scene G on your M3 and confirm: (a) faces read on the front from your review angles,
(b) the crew read as clothed stylized workers at management and human scale, (c) 60 fps holds.
Fidelity target was **stylized management-game (Two Point tier)**, not AAA realism.

## Known minor notes (documented, not blocking)
Hands are simple mitten+thumb; hi-vis vest is a bulky stylized shell; LOD2 face softens at
distance; 7–8 material groups/char (could atlas-merge later). None are the category of defect that
was rejected. Full detail: `docs/ASSET-LAB-05B-ITERATION-LOG.md`.
