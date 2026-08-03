# Project: Studio — Character Source & Provenance

Exact source assets, the procedural generator, and the CC0 provenance chain. All paths relative to the repo root
(`/Users/bruce/Project Studio - Asset Lab`).

## There is no single hand-authored .blend
The character is **generated procedurally** (headless Blender), not sculpted in a saved .blend. The "source" is:
1. the CC0 base body mesh, 2. the shared skeleton GLB, and 3. the Python generator. A human artist should start from
the **exported LOD0 GLB** (`public/assets/studio/characters/electric_hero_05i.glb`) as the working mesh, and refer to
the CC0 base + rig below for the foundation. Regenerating the procedural character is `node tools/blender-run.mjs
blender/build_hero_export_05i.py` (see `CHARACTER-EXPORT-AND-RUNTIME-GUIDE.md`).

## Source assets
| Asset | Path | Notes |
|---|---|---|
| CC0 authored base body | `licenses/asset-lab-05h/human_base_male_stylized_cc0.glb` | `GEO-body_male_stylized`, welded ~12,502-vert all-quad cage |
| Shared skeleton + clip library | `public/assets/animation/UAL1_Standard.glb` | Quaternius UAL Mannequin, 65-bone rig + 43 CC0 clips (6 used) |
| Generator (base + body/face corrections) | `blender/studio_pipeline/authored05i.py` | thin layer over `authored05h.py` |
| Generator (accepted 05H foundation) | `blender/studio_pipeline/authored05h.py` | base import, re-pose, skin, garment helpers |
| Export driver | `blender/build_hero_export_05i.py` | build → join → decimate → LODs → GLBs → manifest |
| Iteration render driver | `blender/build_hero_05i_render.py` | fast review renders (no export) |
| Pipeline modules | `blender/studio_pipeline/{config,core,rig,lod,exporter,meshgen,render}.py` | rig load, LOD, export, mesh toolkit |

## Current shipped character GLBs (05I Iteration 2, frozen)
- `public/assets/studio/characters/electric_hero_05i.glb` — LOD0, 22,856 tris, 65 joints (~878 KB)
- `public/assets/studio/characters/electric_hero_05i_LOD1.glb` — 10,285 tris (~444 KB)
- `public/assets/studio/characters/electric_hero_05i_LOD2.glb` — 4,570 tris (~239 KB)
- `public/assets/studio/characters/electric_hero_05i_COL.glb` — convex collision proxy (~5.7 KB)
- Manifest: `manifests/hero-05i.json`

## Materials (from the shipped GLB)
`mat_authored_skin #e8b58f` (warm tan skin — correct), `mat_i_shirt #475c75`, `mat_i_trousers #47474d`,
`mat_i_boots #38261a`, `mat_i_vest #f29e1c` (hi-viz), `mat_i_hiviz #ededdb` (reflective), `mat_i_belt #4d301f`,
`mat_i_radio #2e3036`, `mat_i_hat #e5941a`. (Per-side `.001` duplicates are cosmetic material instances.)

## Provenance chain (CC0 — commit-safe)
Authoritative record: `licenses/asset-lab-05h/PROVENANCE.json` (+ `CC0-1.0.txt`, `thumbnail_stylized_body_male.png`).
- Bundle: **Blender Studio "Human Base Meshes Bundle v1.0.0"** (Blender Foundation), object `GEO-body_male_stylized`,
  published 2023-05-19, downloaded 2026-07-31.
- License: **CC0-1.0** (public domain; commercial use, modification, redistribution, commit-to-public-GitHub all
  permitted; no attribution required). Verified three ways (embedded `asset_data.license == 'CC0'`, archive.org
  licenseurl, and the bundle page).
- Source zip sha256 `46a912c0524072ac3b78c35d5d2471df7b8df102394a050ca8cd7184e3393648` (34,603,008 bytes; the zip is
  gitignored, the extracted CC0 base + hash are committed).
- The skeleton/clip library (Quaternius UAL) is CC0 as used elsewhere in this repo (Scene C / crew).
- **Not** MakeHuman / MetaHuman / Mixamo; no real-person likeness.

**If the artist adds geometry**, its provenance must be documented and commit-safe (CC0 or owner-owned); do not
introduce attribution-required or license-unclear assets into `public/assets/studio/`.
