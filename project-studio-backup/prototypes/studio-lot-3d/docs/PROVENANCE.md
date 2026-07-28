# Provenance — Meridian 3D Vertical Slice

## Code / interfaces
- `src/types/snapshot.ts` — the `StudioLotSnapshot` shape is a **trimmed copy** of a
  small, presentation-only TypeScript interface from the 2.5D lot repo
  `studio-lot-spike` @ commit **3806ef6** (`src/snapshot/StudioLotSnapshot.ts`),
  copied per the execution authorization (§3). No implementation was copied; the
  protected repo was read-only and not modified.
- All other source is original to this spike.

## Runtime dependencies (all permissive)
- `three` (MIT), `@react-three/fiber` (MIT), `@react-three/drei` (MIT),
  `react`/`react-dom` (MIT), `vite` (MIT), `typescript` (Apache-2.0),
  `@vitejs/plugin-react` (MIT). Dev-only: `puppeteer-core` (Apache-2.0).
- **No GPL/AGPL code** copied from any comparable project.

## Art assets
- **M1: none.** All geometry is code-authored primitives (see ASSET-POLICY.md).
- No assets from *The Movies*, Zoo Tycoon, RollerCoaster Tycoon, or any proprietary/
  reverse-engineered source. The approved concept renders are reference-only and are
  not shipped, traced, or used as textures.

## Imported assets (M2 — low-poly compatibility survey)

One coherent family: **Kenney low-poly kits, all Creative Commons CC0** (personal /
educational / **commercial** use, no attribution required — Kenney credited here as
good practice). Sources fetched and licences confirmed **2026-07-26** against the live
kenney.nl pages and each pack's bundled `License.txt`. Full survey in
`LOW-POLY-ASSET-SURVEY.md`. These are **evaluation** assets, not shipped identity art.

| id | creator | source URL (accessed 2026-07-26) | licence | pack ver. | local files | original format | conversion | modifications | attribution req. | OK in future commercial product? |
|---|---|---|---|---|---|---|---|---|---|---|
| building | Kenney | https://kenney.nl/assets/city-kit-commercial | CC0 | 2.1 | `public/m2-assets/city/building-a.glb` (+ `Textures/colormap.png`, `License.txt`) | GLB (glTF binary) | none | runtime restyle (HSL colormap → Meridian); scaled ~×3 in the studio probe | none (CC0) | **Yes** (CC0) — but as *supporting* dressing only; studio landmarks stay custom |
| hangar | Kenney | https://kenney.nl/assets/factory-kit | CC0 | 3.0 | `public/m2-assets/factory/structure-tall.glb` (+ shared `Textures/colormap.png`, `License.txt`) | GLB | none | runtime restyle; scaled/assembled | none (CC0) | **Yes** (CC0) |
| vehicle | Kenney | https://kenney.nl/assets/car-kit | CC0 | 3.1 | `public/m2-assets/car-kit/delivery.glb` (+ shared `Textures/colormap.png`, `License.txt`) | GLB | none | runtime restyle (deep-red cab) | none (CC0) | **Yes** (CC0) |
| car | Kenney | https://kenney.nl/assets/car-kit | CC0 | 3.1 | `public/m2-assets/car-kit/sedan.glb` (shares car-kit colormap/License) | GLB | none | runtime restyle | none (CC0) | **Yes** (CC0) |
| vegetation | Kenney | https://kenney.nl/assets/nature-kit | CC0 | 2.1 | `public/m2-assets/nature/tree_default.glb` (+ `License.txt`) | GLB | none | per-type sage tint; clustered/scaled | none (CC0) | **Yes** (CC0) |
| prop | Kenney | https://kenney.nl/assets/factory-kit | CC0 | 3.0 | `public/m2-assets/factory/box-large.glb` (shares factory colormap/License) | GLB | none | runtime restyle; used at native scale + as a scaled placeholder mass | none (CC0) | **Yes** (CC0) |
| humanoid | Kenney | https://kenney.nl/assets/blocky-characters | CC0 | 2.0 | `public/m2-assets/character/character-a.glb` (+ `Textures/texture-a.png`, `License.txt`) | GLB (rigged, 27 anim clips) | none | runtime restyle; `SkeletonUtils.clone` for instances; native clips (no Mixamo retarget) | none (CC0) | **Yes** (CC0) |

No assets were downloaded and then rejected — all seven imported assets are used and
kept as evidence. No temporary/rejected downloads remain in the tree.

## M3 (coherent Meridian art slice)

- **All hero buildings + trim + van + trailer + camera + gear + trees + fountain are
  100% original, code-authored Three.js geometry** (`src/env/kit.tsx`, `src/scene/`,
  `src/characters/`) on the shared Meridian material library — no external models, no
  provenance risk. See `M3-ASSET-INVENTORY.md`.
- **Crew characters reuse the M2 Kenney "Blocky Characters" rig** (`character-a.glb`,
  **CC0**, recorded above), normalized to 1.8 m and tinted per role. No new external
  assets were introduced in M3.
- Concept renders remain reference-only (never shipped, traced, or used as textures).
  No assets from *The Movies* or any proprietary/other-game source.
