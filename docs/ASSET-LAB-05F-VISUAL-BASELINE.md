# Asset Lab 05F — Visual Baseline (render index)

All renders neutral-lit (mid-grey world, AgX, exposure −0.55) — the same honest look as the 05E review,
so 05E-vs-05F comparisons are fair. Evidence shows weaknesses, not hides them. In every `cmp-*` /
side-by-side, **05E Electric is on the LEFT, 05F hero on the RIGHT** (except rear-camera views, which
mirror left/right — the in-canvas labels identify each character regardless).

## Before-state — `proof/lab05f/baseline/electric-05e/`
The UNCHANGED 05E Electric (from `character2.build_character2`): base grid + face/hand/lowerbody
close-ups + the six posed clips.

## Per-iteration evidence — `proof/lab05f/iteration-01 … 06/`
Each loop's Blender hero render set (base grid, region close-ups, six poses ×3 angles) + `cmp-*`
05E-vs-05F side-by-sides. Loop map: 1 pelvis/trousers · 2 vest · 3 shoulders/hands · 4 boots ·
5 deformation · 6 face/materials/LODs/harness.

## Final Blender set — `proof/lab05f/final/`
`cmp-front/back/3q`, `cmp-pelvis-front/back`, `cmp-lowerbody`, `cmp-kneel-3q`, `cmp-sit-3q` (05E↔05F);
`hero-front/back/left/right/3q`, region close-ups (`hero-pelvis-*`, `hero-shoulder`, `hero-hand`,
`hero-boot*`, `hero-face`), and the six posed clips ×3 angles.

## In-engine (three.js runtime) — `proof/lab05f/runtime/`
23 PNGs from the Scene-G "05F Hero" comparison group (the 22 comparison cameras + the status panel) +
`performance.json`. Captured headless via SwiftShader (software GL) — **diagnostic only**;
console-error-free. Real-hardware acceptance is the owner's Apple M3 pass.

## Baseline for the whole crew — `proof/lab05e/*`
The accepted 05E crew renders (the other seven roles are untouched by 05F).
