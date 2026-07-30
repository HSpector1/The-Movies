# Asset Lab 05D — Performance

## Triangle counts (exported, per role)
| Tier | 05D | Budget |
|------|-----|--------|
| LOD0 | ~10.7–11.4 k (Carpenter heaviest ~11.4 k) | 8–12 k |
| LOD1 | ~5.9–6.3 k (ratio 0.55) | 4–7 k |
| LOD2 | ~3.2–3.4 k (ratio 0.30) | 2–4 k |

05D added real geometry (sculpted facial planes, individual-finger hands, facial hair, garment
construction, role props, population variation) but stayed within the LOD0 budget: a Loop-12
restraint pass lowered the torso-ellipsoid + head sphere subdivisions, trimming LOD0 from ~12 k
(ceiling) to ~10.7–11.4 k. LODs validated (skeleton/height/islands/face-front preserved; 8/8).

## Material slots — 9/char (JUSTIFICATION required by the brief, >5)
Slots: skin · shirt · trousers · leather(boots/belt/apron/satchel/coil) · dark(features+accessory) ·
white(eye/reflective) · hat · hi-vis · hair. A role uses 7–9. **Written justification for keeping 9
rather than merging to ≤5:** the slots are exactly the axes that carry the product's variation —
per-instance **skin** tone, per-role **shirt/trouser** palette, **hair** colour, and the **hi-vis**
+ **reflective(white)** safety read — each of which the reviewers confirmed is doing real work
(role read, population diversity, hi-vis legibility). Merging them into a 2–4 texture-atlas requires
UV-unwrapping + baking per-instance palette masks, which is a **downstream runtime-optimisation task**
that (a) risks the clean per-instance colour variation that is the whole point of the art, and (b)
belongs to production integration, explicitly out of scope for a visual-refinement lab. The
atlas-merge path is documented in `CHARACTER-MATERIAL-AND-PALETTE-STANDARD` (05C) as the recommended
optimisation **if and when** the owner's real-GPU review shows draw-calls are a crowd-scale problem.
Unused slots carry no faces → no extra glTF primitive/draw call for that role.

## Runtime (Scene G, all 8 refined crew + hero set)
`proof/lab05d/runtime/`: draws ≈ 282, scene tris ≈ 93 k, meshes ≈ 142, **console-error-free**.

### FPS is NOT measured
Headless **SwiftShader (software)** reports ~2 fps — **diagnostic only, meaningless for GPU perf**.
Howard's Apple **M3** is the only valid performance acceptance; expected 60 fps+.

## Recommendation
Distance-LOD selection (LOD0 human-scale, LOD1 campus, LOD2 management). Revisit the material-atlas
merge only after the real-GPU review flags draw calls.
