# Asset Lab 05I — Iteration 1 Owner Review Guide

How to judge the corrective pass. **Judge at close range** (human scale), not at management distance — the
management view may show role readability but must not excuse human-scale defects.

## Fastest path
Open the review index: `proof/lab05i/iteration-01/index.html` (double-click, or via the running app at
`http://localhost:4321/proof/lab05i/iteration-01/index.html`). Or drive the live harness: `npx vite --port 4321
--strictPort`, then the **05I Hero** button row in the left panel (05H↔05I A/B), with a **Neutral eval light** toggle.

## What changed (05H → 05I), and where to look
In every comparison **05H is LEFT, 05I is RIGHT**. Evidence under `proof/lab05i/iteration-01/`.

| Defect (05H) | Check in 05I | Evidence |
|---|---|---|
| Torn / fragmented hi-vis vest | complete vest, readable opening + side/rear wrap | `runtime/03-side-by-side-front.png`, `runtime/12-vest-side-wrap.png`, `real-gpu/vest.png` |
| Bare feet (no boots) | boots fully cover the feet | `runtime/14-boots-feet.png`, `real-gpu/boots.png` |
| Open / minimal hard hat, exposed scalp | closed hard hat over the crown | `runtime/15-hard-hat.png`, `runtime/04-side-by-side-rear.png` |
| Nude / blue-painted torso | reads as clothed (shirt under vest) | `runtime/11-shirt-vest-front.png`, `real-gpu/front.png` |
| Over-muscled / ogre proportions | slimmer, more approachable | `runtime/07-front-three-quarter.png` |
| Heavy / gaunt face | softer, rounder | `runtime/09-face.png`, `runtime/neutral-face.png` |

## Also review
- **Six clips deform** (no new clipping/detachment on the new garments): `runtime/16-walk` … `20-sitting.png`,
  `real-gpu/walk.png`.
- **Three distances**: `runtime/22-human-distance`, `23-moderate-distance`, `24-management-distance.png`.
- **Neutral-light material honesty** (§7): `runtime/neutral-*.png` — actual skin/shirt/vest colour vs lighting tint.
  The GLB material dump (`root-cause/materials.json`) confirms the skin material is correct warm tan (#e8b58f).
- **Topology honesty**: `runtime/25-wireframe.png`.
- **LOD**: `runtime/21-lod.png` (LOD0/1/2 with live counts).

## Honest notes to weigh
- The face is the weakest area: clearly less ogre-like than 05H and fine at normal distance, but a simple rounded
  form in extreme close-up rather than an appealing sculpt.
- The boots read a little blocky; the vest a little puffy.
- 05I is slightly taller (1.82 vs 1.78 m) due to the boots/hat, and leaner (LOD0 22,456 vs 24,509 tris).

## Your decision (Iteration 1)
Pick one: **ACCEPT ITERATION 1** · **ITERATION 2 REQUIRED** · **STOP — HUMAN ARTIST REQUIRED**. *(You chose
ITERATION 2 REQUIRED.)*

---

## Iteration 2 (final) — where to look
Evidence: `proof/lab05i/iteration-02/`. Same view names as Iteration 1, so `iteration-01/` vs `iteration-02/` at the
same framing is the matched Iter-1↔Iter-2 comparison (05H is the shared left-hand reference). Index:
`proof/lab05i/iteration-02/index.html`. Full return: `ASSET-LAB-05I-ITERATION-2-REPORT.md`; conclusion:
`ASSET-LAB-05I-FINAL-REPORT.md`.

Iteration 2 corrected four targets — (A) face, (B) proportions, (C) shirt/arm/neck read, (D) boot split:
- **B, C, D landed:** proportions are clearly slimmer (`real-gpu/side-by-side.png`); short-sleeve shirt gives bare
  warm-tan forearms so the arms/neck no longer read as blue skin (`runtime/11-shirt-vest-front.png`); the boots are
  a weight-inheriting offset shell that stays glued to the feet in motion (`real-gpu/walk.png`).
- **A (face) did not land:** the face is softer/simpler than 05H but remains the weak point — the procedural
  approach cannot produce an appealing face on this CC0 base (a harder push made it visibly *worse*). See
  `runtime/09-face.png`, `real-gpu/face.png`.

## Your decision (Iteration 2, final — no further iteration authorized)
Pick one: **ACCEPT 05I FOR OWNER HUMAN-SCALE APPROVAL** · **REJECT CURRENT 05I — HUMAN ARTIST REQUIRED**. Nothing is
integrated, propagated, or merged; D1/D1-A/Engine are untouched.
