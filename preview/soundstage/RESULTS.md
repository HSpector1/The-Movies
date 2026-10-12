# Bounded soundstage preview results

The browser preview is runnable through [START PREVIEW.command](START%20PREVIEW.command); [README](README.md) covers launch, controls and stopping. It contains a cutaway stage, director, camera operator, studio camera, director's chair, Fresnel and C-stand. The baseline is the default. All controls are labelled **ART / ANIMATION PREVIEW — NOT LIVE GAMEPLAY**. This checkpoint evaluates two material candidates without adopting either into the game.

Final verification on 2026-10-12 passed the selected asset audit, exact 13-file provenance/hash/dimension checks, TypeScript compilation, Vite build, [15 focused browser checks](evidence/browser-r5/results.json) and [four actual launcher checks](evidence/launcher-check.json). The source hashes in the browser record remained unchanged throughout measurement. Earlier unsuccessful checks remain in the evidence directory. No integration source, save, finance or bridge change is part of this branch.

## Controlled material comparison

The four modes share geometry, UVs, camera, lighting, poses, exposure and drawing-buffer dimensions. Concrete replaces the material on the 8 × 8 m interior tile; asphalt replaces it on the 4 × 8 m service tile. Each uses the publisher's actual 1024 × 1024 JPEG base-color and roughness maps. Concrete repeats every 2.1 m and asphalt every 2 m. Base color is sRGB, roughness linear, anisotropy 1, metalness 0 and roughness multiplier 1. No normal, AO, displacement or additional geometry was added. “Both” combines these two changes only.

| Candidate | Exact added asset bytes | Visible change and judgment |
| --- | ---: | --- |
| [Concrete Floor](https://polyhaven.com/a/concrete_floor), eye-candy.xyz | 1,431,956 | Adds grain and patchiness. At management distance the strongest change is the warm ochre floor; close up it reads sandy/cork-like and competes with the restrained crew and props. **REJECT as-is for finished interior art.** Retain as a labelled comparison candidate. |
| [Asphalt 03](https://polyhaven.com/a/asphalt_03), Charlotte Baglioni (photography), Dario Barresi (processing) | 1,378,945 | Darkens and separates the exterior service zone. Close up the brown/soil appearance does not clearly communicate asphalt under this lighting. **REVISE before finished adoption.** Retain as a labelled comparison candidate. |

Both are covered by the [Poly Haven CC0 asset licence](https://polyhaven.com/license). [PROVENANCE.json](PROVENANCE.json) records exact files, original download URLs, authors, date, resolution, publisher MD5 and local SHA256, alongside the reused asset entries. Relevant local inventory and Downloads-name checks found no equivalent set; this was a scoped search, not a whole-machine absence claim. No ambientCG fallback was needed.

Four new maps total **2,810,901 bytes**. Including **53,732 bytes** of publisher API metadata, new acquisition totals **2,864,633 bytes (2.73 MiB)**, within the **25 MiB** allowance. Only the maps used by the preview were downloaded. Website example images, larger bundles, character packs, audio, account-dependent animations and new dependencies were not acquired.

## Actual browser images

These are actual Chrome screenshots from the final run, with frozen motion phase and identical scene/view/light/buffer conditions within each comparison column. The test verifies those conditions for all twelve images. They show the raw candidate appearance; no tint or lighting adjustment was used to make a candidate appear more favorable.

| Mode | Management distance | Crew / interior close-up | Service-area close-up |
| --- | --- | --- | --- |
| Baseline | [Image](evidence/browser-r5/baseline-management.png) | [Image](evidence/browser-r5/baseline-crew.png) | [Image](evidence/browser-r5/baseline-service.png) |
| Concrete | [Image](evidence/browser-r5/concrete-management.png) | [Image](evidence/browser-r5/concrete-crew.png) | [Image](evidence/browser-r5/concrete-service.png) |
| Asphalt | [Image](evidence/browser-r5/asphalt-management.png) | [Image](evidence/browser-r5/asphalt-crew.png) | [Image](evidence/browser-r5/asphalt-service.png) |
| Both | [Image](evidence/browser-r5/both-management.png) | [Image](evidence/browser-r5/both-crew.png) | [Image](evidence/browser-r5/both-service.png) |

Procedural demonstrations: [idle](evidence/browser-r5/pose-idle.png), [walk in place](evidence/browser-r5/pose-walk.png), [directing](evidence/browser-r5/pose-direct.png), [work stance](evidence/browser-r5/pose-work.png). The director's lowered idle arms are symmetric and the operator's work hands face forward in the final evidence. Work stance does not establish prop contact or camera operation. Parent and GPT-6.1 Sol reviewer inspected final images; the [independent review](evidence/source-review-final.md) preserves earlier findings and the corrected pose inference.

## Measured cost

Installed Chrome **150.0.7871.125**, headless, WebGL2, renderer **ANGLE (Intel Inc., Intel(R) HD Graphics 6000, OpenGL 4.1)**. Browser viewport 1280 × 1000; actual canvas drawing buffer **1232 × 693**, DPR **1**. Simple hemisphere/directional lighting; shadows and postprocessing off. Each mode received a separate **60-second** fixed-management-view sample after a two-second warmup, with no pending loads or invalidation, continuous document visibility and a **30 FPS cap**. Every sample rendered 1,800 frames.

| Mode | FPS | Frame interval p50 / p95 / max, ms | Render submission CPU p50 / p95, ms | Renderer texture count | Added texture count |
| --- | ---: | --- | --- | ---: | ---: |
| Baseline | 29.9990 | 33.3 / 35.3 / 52.0 | 1.0 / 1.2 | 7 | 0 |
| Concrete | 29.9997 | 33.3 / 35.2 / 36.2 | 0.9 / 1.2 | 9 | 2 |
| Asphalt | 29.9996 | 33.3 / 35.2 / 36.1 | 0.9 / 1.2 | 9 | 2 |
| Both | 29.9997 | 33.3 / 35.3 / 52.0 | 1.0 / 1.2 | 11 | 4 |

All four measured samples used **43 draw calls, 18,068 triangles and 33 renderer geometry resources**: candidates added no draw calls or triangles. Resource counts are observations, not GPU byte measurements. The small CPU differences are noise at this precision, not evidence that textured candidates run faster. A capped 30 FPS result does not establish uncapped headroom or zero additional GPU cost. GPU timing, VRAM and JavaScript heap were not measured.

The page reported visible throughout the final samples; headless Chrome has no interactive OS foreground window. These results do not certify headed Mac interaction, other hardware, large scenes or Unity performance. The hidden-state fault check used a synthetic visibility signal; actual resize and other control invalidations were separately exercised. Initial load/compilation is excluded from steady-state timing. The final build's JavaScript is 639.50 kB (164.54 kB estimated gzip); the local static server does not automatically gzip it. Minimum recorded free disk during the final run was 3,688,044 KiB with AC connected.

## Selected assets and compatibility

The nine reused GLBs total **585,560 bytes**, 17,876 unique source triangles and 32 primitives. Repeated scene instances account for the rendered totals. Exact source hashes and licensing entries match the existing register. Owner-generated geometry stays owner-owned; the existing Quaternius CC0 rig provenance is retained. It is not a new CC0 classification of all project geometry. The original register is copied as [PROVENANCE-REGISTER.md](PROVENANCE-REGISTER.md); [asset review](evidence/asset-review.md) records bounds, transforms, materials, skin attributes and hand-bone reference positions.

| Selected asset | Decision for this preview | Reason / limitation |
| --- | --- | --- |
| Arch_M01_StageWall | KEEP | Existing module makes the cutaway readable; repeated with height scaled from authored 8 m to 3.2 m. |
| Arch_M04_StageCorner | KEEP | Completes the corner; authored height 8.4 m scaled to 3.2 m here. |
| Arch_M14_GroundTile | KEEP | Original floor baseline and shared geometry for both controlled surface comparisons. |
| Char_Director_Standard | KEEP | Distinct directing silhouette; exact 65-bone rig inspected. Procedural demonstration only. |
| Char_CameraDP_Standard | KEEP | Distinct operator silhouette; same inspected bind hierarchy. Camera grip/contact is unresolved. |
| Prop_StudioCamera | KEEP | Recognizable camera/tripod at close view; no functional camera or rig attachment claim. |
| Prop_DirectorsChair | KEEP | Clear filmmaking prop; sitting/standing animation absent. |
| Prop_Fresnel | KEEP | Readable lighting prop; the mesh is not a simulated practical light. |
| Prop_CStand | KEEP | Appropriate support prop; small at management distance, clearer close up. |
| concrete_floor | REJECT as-is for finished art | Warm grain clashes with the intended restrained interior. Keep evaluation mode only. |
| asphalt_03 | REVISE before finished art | Exterior contrast is useful but its soil-like appearance needs a later art decision. Keep evaluation mode only. |

Both characters have matching 65-joint names/hierarchy and JOINTS/WEIGHTS skin data, but **zero embedded animation clips**. The existing root bind rotation is preserved; actual exported face/toe orientation, bone positions and browser images informed the procedural offsets. A prior prototype-based arm normalization made the pose worse and was retracted, not treated as compatibility proof. No imported animation has been selected or certified. Compatible idle/walk/directing clips, deformation/root-motion assessment, camera grip/IK/viewfinder alignment and chair transitions remain specific gaps in [DEFERRED-ADOPTION.md](DEFERRED-ADOPTION.md).

## Verification, cleanup and publication boundary

The unchanged existing audit was scoped to `public/assets` and supplemented by exact-file SHA256, licence-field, GLB dependency/clip and actual JPEG dimension checks. The browser suite checks delayed/missing loads, real uncached missing-map refusal/retry, selectors, pause, stale request cleanup, measurement invalidation, server boundaries, stopped late loads, matched screenshots and server-shutdown disposal. Unexpected final browser errors: **zero**.

The actual START command entered the existing single intensive lane, verified/built the preview, started its localhost-only server and opened isolated installed Chrome. The test also confirmed refusal of an unowned direct session, refusal of an occupied port without stopping its owner, and orderly Control-C cleanup. This actual launcher check used `PREVIEW_HEADLESS=1`; the default headed launch path was not separately measured.

On disposal, rendering stopped, owned geometry/material/texture/skeleton reference counts reached zero and the native WebGL context was lost. The renderer's texture counter retained **1**; this is recorded rather than converted into a claim of zero allocated GPU bytes. Launcher completion left **no owned process survivors**, no preview listener on port 4197 and no owned lane lock. The browser and server are stopped; starting the preview again will wait for the same lane used by integration.

Historical evidence remains: the first embedded-texture CSP failure, early cadence above the 30 FPS cap, the incorrect zero-texture-counter assertion, a TypeScript guard error, the retracted arm-pose change and a cached-image fault test that did not reach the network. Each affected behavior was repaired and the final four measurements ran freshly on the final source. Prior runs are not presented as passing final verification.

This isolated `wip/browser-soundstage-preview` checkpoint is based on **98abbc550d0cbfe8751fff4132af4ebf79dcd4f9**. Main integration HEAD and `HEAD:src` stayed unchanged during the preview; its only observed working-tree change was the handoff hook's AUTO metadata. Publication is restricted to this preview and its worktree handoff. No merge or wider art campaign follows. After verifying the preview GitHub ref, resume the parked P15B Save48 Legacy v3 / atomic-finalizer work and the P15B → P18 integration program.
