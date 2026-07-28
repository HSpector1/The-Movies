# Decision Log — Meridian 3D Vertical Slice

- **Isolated standalone repo** at `/Users/bruce/The Movies - 3D Visual Spike`
  (own git, branch `studio-3d-visual-spike`). No submodule/dependency/worktree link
  to either protected repo. Fixture-only; no GameState adapter.
- **Stack: React 18 + TS + Vite + Three 0.161 + R3F 8 + drei 9** (all MIT). No
  GPL/AGPL code imported. R3F chosen per plan (declarative Three for a web view).
- **Custom spherical camera rig** instead of drei `OrbitControls` — avoids the
  fight between preset-lerp (writing camera.position) and OrbitControls' own
  update(); gives deterministic snap-to-preset for headless capture + clamped orbit
  (no under-ground/top-down/off-section exposure).
- **Greybox-first (M1)**: primitives + muted materials; beauty deferred to the
  post-Gate-A art pass. De-risks camera/interaction/vignette/perf cheaply.
- **Imperative store**: per-frame code (camera, vignette, highlight) reads mutable
  state directly (no React re-render); only DOM overlays subscribe. Keeps the RAF
  loop clean.
- **Deterministic vignette**: `sampleVignette(t)` is pure; no `Math.random`.
- **Fixes during M1 (found via capture):**
  - DOM overlay (dev panel, character card, building badge) was painting *under* the
    WebGL canvas → added `zIndex:10` to the overlay layer.
  - `production` camera preset sat on the soundstage's blank back wall (doors face
    −X) → repositioned to the −X/front side so the apron/take is not occluded.
- **Evidence via headless Chrome** (puppeteer-core): canvas-element screenshots
  (UI-hidden) + full-page (with dev UI) + ordered PNG "recordings" (vignette,
  camera move). Software WebGL fps is a floor, not a verdict (see PERFORMANCE-BASELINE).

## M2 — low-poly asset compatibility survey (2026-07-26)
- **One coherent CC0 family: Kenney kits.** The only option satisfying all four hard
  constraints at once (permissive licence, single coherent family, ready GLB, no
  spend). Rejected: mixed Sketchfab CC0 (collage risk), Synty POLYGON (paid, §11),
  Mixamo (not needed — the Kenney rig ships clips). Quaternius (CC0) deferred as a
  viable secondary. See LOW-POLY-ASSET-SURVEY.md §1.
- **Isolated survey page (`m2.html` / `src/m2/`).** Separate Vite entry (rollup
  multi-page); imports nothing from the M1 app; does NOT touch the proven camera, M1
  slice, vignette, or renderer — the Gate-A success stays intact.
- **Restyle = single-texture recolour.** Kenney meshes share one small `colormap.png`
  per kit, so a per-hue HSL remap of that texture recolours a whole kit at once — the
  cheap "does the family take our art direction?" test. Deterministic; no network.
- **Studio-recognition probe (studio mode).** The same family scaled/arranged as a
  rough production-street corner seen from overview — a bounded probe for the owner's
  binding Gate-A concern, explicitly NOT the M3 art pass and NOT final art.
- **Gate B = PASS WITH CORRECTIONS** (independent adversarial panel, no blockers).
  Central finding: generic assets give a coherent supporting layer, but *studio
  identity* needs bespoke custom landmarks. M3 recommended (AUTHORIZE WITH CONDITIONS)
  but NOT authorized — owner sign-off required. See GATE-B-REPORT.md.

## M3 — coherent Meridian art vertical slice (2026-07-26)
- **Gate B closed on hardware:** owner measured ~120 fps on real Chrome (PASS) →
  M3 authorized with conditions (`docs/close Gate B` commit `0423aec`).
- **Scale-first (owner's mandated first task):** documented scene-scale standard
  (`src/env/scale.ts`, one unit = 1 m, 1.8 m adult); normalized the oversized Kenney
  crew (2.72 m → root 0.66 → 1.79 m), validated against a reference lineup
  (`m3-scale.html`). Buildings NOT enlarged to compensate. See M3-SCENE-SCALE.md.
- **Upgrade the M1 section, don't replace it:** kept `layout.ts` data (footprints,
  `STAGE_A` anchors, `CAMERA_PRESETS`) unchanged so routing + the proven camera are
  preserved; swapped only the meshes/characters. All routing/determinism/one-canvas
  assertions still pass.
- **Code-authored hero art (no DCC):** `MeridianEnvironmentKit` (`src/env/kit.tsx`) —
  Shape/Extrude + primitives on a shared cached material library. Crew = the CC0
  Kenney rig, normalized + per-role tint/hat/prop/clip (shared skeleton via
  SkeletonUtils.clone). Studio identity from world design (gate lettering, water
  tower + crest, Deco admin, barrel-vault STAGE 2, backlot), not UI.
- **Shared-material selection:** ground selection RING, not emissive mutation (the
  cache shares materials, so per-building emissive would bleed).
- **Bugs found + fixed via capture:** Kenney tint made single-material meshes a
  1-element array (invisible bodies) → fixed; skinned bind-pose bounds frustum-culled
  crew in close views → `frustumCulled=false`; the M1 talent-trailer anchor sat inside
  the human camera and occluded the shot → relocated.
- **Gate C = PASS WITH CORRECTIONS** (independent visual + tech-art panel). One bounded
  correction pass applied: overview production legibility (ProductionRig: crane +
  lights + door glow), teardown leaks (wired `disposeMaterials()`; Crew disposes tint
  clones), crest legibility, kit→SCALE single-source, shared Prop materials. Deferred:
  voxel faces / role-from-silhouette (needs new character assets), eslint. Experiment
  recommendation: **USE HYBRID PRESENTATION.** See GATE-C-REPORT.md.

## Gate-C owner-review defect closure (2026-07-26)
- **Owner ran M3 on real hardware:** GATE C = PASS WITH CORRECTIONS; ~120 FPS
  throughout; studio recognition / camera / scale = PASS; routing + road = correction
  required. Bounded defect patch (no new art pass, no camera/layout/renderer change):
  - **Road glitch = coplanar z-fighting** (all ground overlays at y=0.02) → distinct
    **y-stack** + `polygonOffset` on paint. One authoritative surface per region.
  - **Prop/vegetation collision** → static obstacles are now authored footprints in
    `layout.ts` (TREES/HEDGES/APRON_PROPS, single source for scene + validation);
    `validateRoutes()` extended (vegetationClear/propsClear/crewSpacingOk). Caught +
    fixed the trailer sitting on the char-crew1 loop.
  - **Crew congestion** → apron crew spaced ≥1.6 m (`APRON_CREW`) + take staging spread
    to distinct role marks; door portal + determinism preserved.
  - **Crane readability** → taller mast/longer boom/clearer head+counterweight, rakes
    over the apron; not a landmark; routes/sightlines preserved.
  - **Character quality** → recorded: Kenney provisional for background/supporting;
    NOT approved for hero/close roles (future work). Not replaced this pass.
- Camera source/presets unchanged (git diff empty); vignette deterministic; teardown
  one-canvas; typecheck+build pass; protected repos untouched. See GATE-C-REPORT.md.
- **GATE C: PASS (final owner confirmation, 2026-07-26).** Owner reviewed the patched
  build on real hardware: road glitch resolved, crew spacing/routing improved, reads
  clearly as a movie studio, camera excellent, ~120 FPS, crane/production readable,
  remaining gate contact minor/non-blocking. M3 complete + PASSED. Recommendation
  stands: **USE HYBRID PRESENTATION.**
- **Non-blocking follow-ups (NOT started):** **OC-01 camera occlusion management**
  (tag occludable roofs/upper-walls, camera→focus raycast, smooth fade/hide + restore,
  Roofs Auto/Visible/Hidden, keep Overview silhouettes; NOT a full Sims cutaway
  system); occasional minor gate-geometry character contact = backlog; Kenney chars =
  background roles only; hero-character replacement deferred. No M4 / integration /
  full-studio / occlusion prototype under this task.
