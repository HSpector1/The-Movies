# Asset Lab 05C — Owner Review Guide

05C is a **visual art-refinement** pass on the 05B crew (which you accepted as a technical PASS
WITH NOTES — "we are getting there"). The 05B technical corrections (orientation, rig, animation,
LOD, runtime) are **locked and unchanged**. This pass targets appeal.

## 60-second look (neutral-lit Blender proof — `proof/lab05c/`)
1. `final/roles-front.png` — the four required roles read by OUTFIT: **PA** (buttoned shirt +
   clipboard, side-part hair) · **Grip/Electric** (work shirt + flat cap / **hi-vis vest with
   reflective stripes + hard hat**) · **Maintenance** (slate **coveralls** + soft cap) · **Office**
   (dark top + clipboard + bun).
2. `final/Grip/base-face-front.png` — the face: **clean dark almond eyes + catch-light**, soft
   nose, friendly mouth, hair (charming, not the startled test-figure of 05B).
3. `final/Grip/base-left.png` — athletic torso (chest out, belly tucked; **no armor blocks**).
4. `final/Grip/base-hand.png` — **palm + grouped fingers + thumb** (not a cube mitten).
5. `final/Grip/base-lowerbody.png` — **rounded work boots + sole** (not angular blocks).
6. `final/proportions-front.png` — 3 body types (slim/average/wide).
7. `final/hairstyles-front.png` / `headwear-front.png` — hair + hat variety, hats worn (not
   balanced), no bald heads.
8. `final/skintones-front.png` / `palettes-front.png` — 5 skin tones (job-independent) + 5 palettes.

## Before → after
- **05B (before):** `proof/lab05c/baseline/` — boxy torsos, square shoulders, mitten hands, angular
  boots, startled faces, floating bulky vest, overexposed.
- **05C (after):** `proof/lab05c/final/` — rounded athletic bodies, charming faces, worn clothing,
  rounded hands/boots, fitted striped hi-vis, neutral-lit.

## Runtime (diagnostic)
`proof/lab05c/runtime/01-crew-front.png` + `04-human-scale.png` — refined crew in Scene G, faces on
the front, **console-error-free**. These are **headless SwiftShader** (software; flat, ~4 fps) —
NOT a performance or final-look test.

## What only you can decide (real Apple M3 GPU)
Run Scene G on your M3 and confirm: the crew now read as charming stylized game people at management
+ human scale; the faces/roles/clothing read; 60 fps holds. Target = Two Point tier, not AAA.

## Known remaining notes (documented, non-blocking)
Finger separation is subtle (grouped, not individual — right for the tier); Scene-G runtime lighting
is the app's own (flatter than the Blender review lighting); 9 material slots/char (atlasable later);
the independent-reviewer gate for iters 3–5 was interrupted by a sustained Anthropic API outage (see
the iteration log) — primary self-review carried those gates; a final independent pass is attempted
at close-out. Full detail: `docs/ASSET-LAB-05C-ITERATION-LOG.md`.
