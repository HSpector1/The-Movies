# Project: Studio — Character Export & Runtime Guide

How to (re)build, validate, and review the character. Run from the repo root
(`/Users/bruce/Project Studio - Asset Lab`). Blender 5.2 LTS at `/Applications/Blender.app/Contents/MacOS/Blender`
(override with `BLENDER=`); Node in the repo (`node_modules` present); Google Chrome for the runtime capture.

## Regenerate the procedural character (reference only — the human artist works from the GLB, not this)
```
node tools/blender-run.mjs blender/build_hero_export_05i.py
```
Builds base + corrections, joins, decimates LOD0 by 0.5, generates LODs (ratios [1.0, 0.45, 0.20]), builds the
collision proxy, and writes `public/assets/studio/characters/electric_hero_05i{,_LOD1,_LOD2,_COL}.glb` +
`manifests/hero-05i.json`. Fast review renders (no export): `node tools/blender-run.mjs
blender/build_hero_05i_render.py -- proof/lab05i/scratch`.

## Export conventions a hand-authored replacement must match
- glTF binary (`.glb`), **+Y-up**, self-contained (embedded materials/textures).
- One skinned mesh + the 65-bone armature per file; **no animations embedded** (`export_animations=False`).
- Three files: LOD0 (`electric_hero_05i.glb`), LOD1 (`_LOD1.glb`), LOD2 (`_LOD2.glb`), each retaining all 65 joints,
  plus a collision proxy (`_COL.glb`). Consistent material slots across LODs.
- Land them in `public/assets/studio/characters/` (this subtree is committed; `public/assets/*` is otherwise
  gitignored except `public/assets/studio/`).

## Validate
```
node tools/validate-05i.mjs          # 65 joints, budgets, additive integrity, evidence, harness wired
node tools/validate-hero-05h.mjs     # confirms 05H/05G still byte-unchanged (additive guard)
npx tsc --noEmit                     # TypeScript
npm run build                        # tsc + vite production build
```

## Runtime review (the review harness)
```
npx vite --port 4321 --strictPort    # in one shell
```
Then open `http://localhost:4321/`. It boots on Scene G. In the left DevPanel:
- **05I Hero** row = the 05H↔05I A/B comparison cameras (25 presets; 05H left, 05I right), covering the 15 static
  views, six clips, and three distances. The **Neutral eval light** toggle switches to strictly-neutral material light.
- Owner review index (no dev tools): open `proof/lab05i/iteration-02/index.html` (file:// or via the running app at
  `http://localhost:4321/proof/lab05i/iteration-02/index.html`).

## Capture matched evidence (headless)
```
# with vite running on :4321, in another shell:
OUT_DIR="$PWD/proof/<your-dir>/runtime/" node tools/capture-05i-review.mjs
```
Captures the 25 named comparison views + wireframe + neutral-light material views (deterministic SwiftShader, labeled
diagnostic-only). For real-GPU (Apple Metal) close-ups, launch Chrome without the SwiftShader flags (see
`tools/perf-05h-realgpu.mjs` for the pattern: `--use-angle=metal`, read back `WEBGL_debug_renderer_info` to confirm
real GPU). All capture scripts use the `window.__lab` bridge (`setReview`, `set`, `perfProbe`, `getErrorCount`).

## Review-camera specifications
The comparison presets are `G_HERO_05I` in `src/lab/cameraBridge.ts` (perspective camera, fov 42; each preset is a
`{pos, tgt}` pair; 05H at x=−0.55, 05I at x=+0.55). Reuse these exact framings for matched before/after evidence.
