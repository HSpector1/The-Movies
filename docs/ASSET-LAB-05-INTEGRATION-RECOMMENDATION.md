# Asset Lab 05 — Integration Recommendation (non-integrated)

**Proposed, not performed.** This lab is isolated R&D. Nothing here is wired into the sim (`The
Movies`), the frozen spikes, or any protected repo, and this milestone opens no Gate and starts no
OC-01. The following is a recommendation for *if/when* the owner chooses to draw on it later.

## What is genuinely reusable

- **The factory itself.** `blender/studio_pipeline/` is a self-contained, deterministic, headless
  art-authoring package. Its highest-value output is not the 23 sample assets but the *ability to
  regenerate and extend* them from committed source. It is the thing to keep.
- **The animation-compatibility spine.** Characters skinned to the exact 65-bone UAL Mannequin means
  the whole existing 43-clip CC0 library (already in the repo, already used by Scenes C–F) drives them
  with zero retargeting — in Blender and in three.js. Any future crew is a new `ROLES` row.
- **The export/validate/manifest contract.** Every asset is a self-contained GLB with a JSON manifest
  row (tris, LOD, collision, dims, provenance) and an independent Node byte-level validator. That is
  the clean seam a consuming app reads.

## How a consuming runtime would use it

The Asset Lab's own Scene G already demonstrates the pattern, and it maps directly onto the frozen 3D
spike's stack (Vite · three · R3F · TS strict):

1. Load a character GLB (mesh + 65-bone rig) and the CC0 clip GLB; `SkeletonUtils.clone` per instance;
   `AnimationMixer.clipAction(clip)` — clips bind by bone name.
2. Load architecture modules and snap them on the 2 m grid (or load a pre-assembled set GLB).
3. Parent hand props to the tagged hand bone (`studio_attach` extra) with an identity offset.
4. Pick a LOD by distance (all LODs share the bone-named groups → one animation instance drives any).
5. Use `<Name>_COL.glb` for a presentation-level collision/click proxy (no physics implied).

Because the sim core is pure `(state, actions) => state` and owns no rendering, **assets attach at the
presentation layer only** — exactly where the 2.5D lot spike and 3D visual spike already live. The sim
never imports Blender output; a view layer does.

## What must happen before any of this ships

- **Provenance:** the studio assets are 100 % original / owner-owned (CC0-equivalent). Keep them that
  way — do not fold in the LICENSE-UNCLEAR FBX props or any downloaded pack into shippable characters.
- **Fidelity pass:** this is greybox-plus. A polish milestone (better faces, cleaner silhouettes,
  hand-tuned weights on hero characters, baked hero textures) precedes anything player-facing.
- **Owner sign-off + a real integration target.** This recommendation is inert until the owner names a
  consuming surface and authorizes the work. Do not integrate on inference.

## What NOT to do

- Do not merge Blender output into the sim repo or make the sim depend on Blender.
- Do not treat these sample assets as final identity art or as a content commitment.
- Do not build the section-11 non-goals because an asset "wants" them.
