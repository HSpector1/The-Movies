# Asset Lab 05E — Integration Recommendation

**Recommendation: DO NOT INTEGRATE YET. Owner M3 review first. This remains an isolated lab result.**

## Why not now
05E is a character-art *cleanup* loop in the isolated Asset Lab. It is independently reviewed and
technically clean, but:
- The owner's acceptance gate is a **real Apple M3** pass (software-GL runtime is diagnostic only).
- One remaining major note ("all roles share one body mesh/face") is a **design decision** the owner
  must make before this is called final — it may change the authoring approach.
- Integration = Gate D / OC-01 territory, which is explicitly HELD and requires an owner-confirmed
  clean base and go-ahead. Not this lab's job.

## What is ready if/when the owner says go
- All 8 role GLBs + LOD0/1/2 + collision proxies are exported to `public/assets/studio/characters/`
  with the **same filenames** 05B–05D used, so `studioSlice.tsx` picks them up with **no code change**.
- Runtime Scene G is console-error-free; tris are ~20–25% leaner than 05D (LOD headroom improved).
- Technical invariants (65-joint skeleton, −Y forward at identity, 0 unweighted/bad-sum, six clips,
  LOD consistency) are intact, so the animation/runtime contract is unchanged.

## Sequencing (unchanged from prior labs)
1. Owner reviews on M3 → Pass or names the next defect.
2. If Pass: owner decides the two scope items (shared-mesh differentiation; detail ceiling).
3. Only then does integration (into the game / Gate D hybrid) get planned — separately, on an
   owner-confirmed clean base. 05E does not start it.

## Isolation guarantees held this loop
No changes to Scenes A–F, Scene G architecture/props, the main sim, the 3D spike, or any other lab
branch. No new dependencies, no downloaded models, no animation-library changes, no `Math.random`.
Default branch untouched; non-force push to the `backup` remote only.
