# Pass 4 — Stage A Independent Review

An independent reviewer (who did not author the asset) compared the new authored
gate against the previous procedural gate, in-scene at an identical camera. The
asset pipeline is: hand-authored SVG (`tools/build-assets.mjs`) → transparent PNG
via `rsvg-convert` → loaded into the existing Phaser scene.

Evidence reviewed:
- BEFORE (procedural gate, "entrance" camera): `shots/pass-2/entrance-hero.png`
- AFTER (authored gate, same camera): `shots/pass-4/after-gate-entrance.png`
- New gate sprite in isolation: `src/assets/authored/a-gate.png`

## Verdict

> **VERDICT: FAIL — more detailed but not visually better**

### Strengths (per reviewer)
- The isolated sprite shows real material work: soft top-down gradient, gold trim,
  striped boom barrier, and a genuine soft contact shadow — all absent from the
  flat procedural gate.
- On-brief warm/gold classic-Hollywood palette.
- Stronger implied 3D volume than the old block, in isolation.

### Weaknesses / defects (per reviewer)
- **Silhouette fails as a landmark in-scene** — reads as two disconnected pale
  slabs, not an iconic archway; the old compact gate + pin was a *clearer* focal
  point.
- **Scale is oversized** — sprawls across the lower-left quarter, dwarfs the
  buildings behind it, breaks the isometric grid; looks pasted on.
- **Grounding broken** — shadow doesn't match scene lighting; base reads as a flat
  apron with no ground contact; overlaps the studio-name label awkwardly.
- **Projection mismatch** — the gate's iso angle/thickness doesn't align with the
  scene's tiles/road; edges don't converge — a giveaway of a foreign asset.
- **Detail is noise at scene scale** — barrier + pinstripes are lost when zoomed to
  the lot; they add clutter, not "entrance."
- **No cohesion** — a gradient-shaded gate next to crisp flat-shaded neighbors
  "looks like it's from a different game."

### Prioritized corrections (per reviewer)
1. Fix scale (~40–50% smaller) to fit the iso grid.
2. Redesign into one readable arch/portal with a sign banner; kill the split-slab look.
3. Re-project to the scene's exact iso angle; add a grounded footprint + matching
   shadow direction.
4. Decide style globally — either re-shade the whole scene to gradients or flatten
   the gate to match; **do not ship a mixed style.**

## What this means (root cause)

The most important finding is the reviewer's last point: **a single high-fidelity
asset cannot prove "materially better" in isolation, because it clashes with the
flat-shaded neighbors and reads as foreign.** Scale and projection are fixable, but
the style-cohesion problem is structural: proving the authored-sprite pipeline
requires upgrading a *coherent cluster or the whole scene* to the new style at
once — a much larger commitment than a three-asset Stage A dropped into an
otherwise-flat lot.

## Decision

Per the directive ("A negative Stage A result is acceptable. Do not force success";
stop conditions include *"sprites create unacceptable visual inconsistency"* and
*"Stage A fails independent review"*):

- **Stage A did not pass. Stage B was not begun.**
- The mixed-style gate was **reverted** — it was not shipped into the frozen scene
  (`LotScene.ts` is byte-identical to `34cebff`). The scene renders exactly as the
  approved Pass 3 build.
- The pipeline tooling (`tools/build-assets.mjs`), the sample asset
  (`src/assets/authored/a-gate.png`), and this findings set are retained as the
  research record for a future, larger art effort.
