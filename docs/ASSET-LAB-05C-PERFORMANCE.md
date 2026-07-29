# Asset Lab 05C — Performance

## Triangle budget (per character) — 05C raised fidelity within budget

| Tier | 05C typical | Budget (05C) | 05B was |
|------|-------------|--------------|---------|
| LOD0 | ~9.6–9.9 k (Electric heaviest ~11.6 k in the diagnostic build) | 6–12 k | ~4.0–4.4 k |
| LOD1 | ~5.3–5.5 k (ratio 0.55) | 3.5–7 k | ~2.4 k |
| LOD2 | ~2.9–3.5 k (ratio 0.30) | 1.5–3.5 k | ~1.4 k |

The tri increase is deliberate and within the 05C budget: the extra geometry buys the rounded
torso, real face, hair, garment details (collar/placket/pocket/cuffs/vest stripes), rounded hands,
and rounded boots — the exact things the owner asked for. LOD ratios trimmed to `[1.0, 0.55, 0.30]`
so LOD2 stays ≤3.5 k even for the heaviest role. Collision proxy unchanged (~50-tri capsule).

## Runtime (Scene G, all 8 refined crew + hero set)
`proof/lab05c/runtime/`: draws ≈ 282, scene tris ≈ 84 k, meshes ≈ 142, **console-error-free**.

### FPS is NOT measured here
The builder capture is headless **SwiftShader (software)** — it reports ~4 fps, which is
**diagnostic only and meaningless for GPU performance**. On Howard's Apple **M3** the scene is
expected at 60 fps+. The owner's real-GPU check is the only valid performance acceptance.

## Material groups
9 slots/char (7–9 used). Above the "3–5 where practical" guidance; correctness was prioritised.
A **texture-atlas merge** to ~4 material groups (bake skin/features/eye/hair into one atlas, garment
+ trousers + accent into another) is the recommended optimisation IF real-GPU draw-call counts
become a concern at crowd scale — deferred, not done (out of scope for a visual-refinement pass).

## Recommendation
Ship LOD1/LOD2 for distant/management-view crew, LOD0 for human-scale/hero. Revisit the atlas merge
only after the owner's real-GPU review confirms it is needed.
