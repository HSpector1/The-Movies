# Project: Studio — Asset Lab

An **isolated** intake / conversion / visual-proof lab for modern (and one legacy) asset
packs, built to evaluate whether they can accelerate future Project: Studio (Meridian
Pictures) development.

**This is NOT the game.** It is not a branch or worktree of any protected repository, it
owns no simulation truth, and it is **read-only toward** the main sim (`The Movies`), the
frozen 2.5D lot spike, and the frozen 3D visual spike. It opens no Gate, starts no OC-01,
and treats none of these assets as final Project: Studio identity art. It is a technical
R&D sandbox, nothing more.

Stack mirrors the frozen 3D spike where practical: **Vite 6 · React 18 · three 0.161 ·
@react-three/fiber 8 · @react-three/drei 9 · TypeScript (strict)**. Convention: **1 unit =
1 metre**, 1.8 m adult reference (matches the spike's `src/env/scale.ts`).

---

## What is here

| Pack | Source archive | Provenance | Use |
|---|---|---|---|
| **Downtown City MegaKit** | `Downtown City MegaKit[Standard].zip` | **CC0** (Quaternius) | reusable |
| **Universal Animation Library** | `Universal Animation Library[Standard].zip` | **CC0** (Quaternius) | reusable |
| **FBX interior props** | `FBX-20260727T232629Z-1-001.zip` | **LICENSE-UNCLEAR** (no license file) | prototype-only |
| **wintersets** | `wintersets.zip` | **DO-NOT-USE** (legacy Lionhead *The Movies* mod) | archaeology / reference only |

Full detail: [`docs/PROVENANCE-REGISTER.md`](docs/PROVENANCE-REGISTER.md).

## Quick start

```bash
cd "/Users/bruce/Project Studio - Asset Lab"
npm install                 # local only; no global installs, no sudo
npm run pipeline            # hash -> inventory -> curate -> optimize -> manifest -> validate
npm run dev                 # http://localhost:4320  (or: npm run build && npm run preview)
```

Bootstrapping from scratch (fresh clone): the `sources/` tree and `public/assets/` are
git-ignored (see below). Drop the four archives into `sources/original-archives/`, unzip
each into `sources/extracted/<pack>/`, then run `npm run pipeline`. Everything downstream
regenerates deterministically.

### Repeatable scripts (contract §9)

| Command | Script | Output |
|---|---|---|
| `npm run hash` | `tools/hash-archives.mjs` | SHA-256 of every archive → `manifests/source-archives.json` |
| `npm run inventory` | `tools/inventory.mjs` | full asset inventory → `manifests/source-assets.json` |
| `npm run curate` | `tools/curate.mjs` | representative subset (§5) → `manifests/curation.json` |
| `npm run optimize` | `tools/optimize-gltf.mjs` | glTF → self-contained optimized GLB (`public/assets/downtown/`) |
| `npm run manifest` | `tools/build-manifest.mjs` | runtime catalog → `manifests/runtime-assets.json` |
| `npm run validate` | `tools/validate-assets.mjs` | load/parse check → `manifests/validation.json` |
| `npm run shots` | `tools/capture.mjs` | evidence PNGs → `proof/` (needs the preview server running) |

## The three demonstrations (contract §7)

- **Scene A — studio-lot scale + materials proof.** Assembled Downtown buildings, a
  road + sidewalks, street props, and a modular kit-of-parts lineup, all against the
  1.8 m human reference. Proves the CC0 kit is authored at 1 unit = 1 m.
- **Scene B — furnished set proof.** A furnished corner (couch, table, chair, bookshelf,
  fireplace, rug, lamps, plant) built from the FBX prop pack, loaded **directly** via
  FBXLoader (§9), visibly tagged **LICENSE-UNCLEAR**.
- **Scene C — animation viewer.** The Quaternius CC0 character with a clip selector over
  all **43** clips, play/pause, loop, playback speed, skeleton toggle, bounds, duration,
  and root-motion status (in-place vs baked-root-motion library).

Dev controls (§8): scene selector, overview/inspection cameras + reset, wireframe, bounds,
grid + scale reference, key/ambient light sliders, per-pack visibility, material info, and a
live renderer-stats panel (FPS, draw calls, triangles, geometries, textures, programs,
loaded assets). **Performance figures are diagnostic only, not target-hardware acceptance.**

## Reusable vs prototype-only (contract §13)

- **Reusable (CC0):** 33 runtime assets — 31 Downtown GLB + 2 animation GLB.
- **Prototype-only (LICENSE-UNCLEAR):** 12 FBX props. Usable for internal prototyping;
  **do not ship** without confirmed provenance.
- **Excluded (DO-NOT-USE):** wintersets. Never loaded at runtime; documented for archaeology
  only in [`docs/WINTERSETS-ARCHAEOLOGY.md`](docs/WINTERSETS-ARCHAEOLOGY.md).

## Known cosmetic issue

Scene A road/sidewalk tiles show a residual **red edge-glow** under the lab's lighting. It
originates in the CC0 kit's `MI_StreetDecals` / pavement materials (authored metalness = 1),
not in the pipeline; it is cosmetic and does not affect loading, scale, or any pass
criterion. See [`docs/FORMAT-FINDINGS.md`](docs/FORMAT-FINDINGS.md).

## Isolation / git

`git init` on branch `main`. Ignored (never committed): `sources/` (the archives +
extraction, per §2), `public/assets/` (regenerable runtime binaries, some LICENSE-UNCLEAR /
DO-NOT-USE), `node_modules/`, `dist/`. Committed: source, tools, `docs/`, `manifests/`,
`proof/`.

## Asset Lab 02 — Studio Greybox Target (branch `asset-lab-02-studio-greybox`)

A bounded visual-improvement milestone: **Scene D** turns the Lab 01 asset demo into an
art-directed movie-studio greybox (entrance gate, water tower, soundstage, office, courtyard,
backlot + 9 CC0 crew, warm golden-hour lighting + sky). The Lab 01 red-pavement defect is
fixed at the root (vertex-color shader mask). Boots on Scene D; compare with Scene A. Evidence
in `proof/lab02/`. See `docs/ASSET-LAB-02-BRIEF.md`, `VISUAL-TARGET-FINDINGS.md`,
`MATERIAL-CORRECTION.md`, `STUDIO-GREYBOX-INVENTORY.md`, `ASSET-LAB-02-PERFORMANCE.md`,
`OWNER-REVIEW-GUIDE.md`, `ASSET-LAB-02-INTEGRATION-RECOMMENDATION.md`.

## Asset Lab 03 — Hero Soundstage Art-Direction Proof (branch `asset-lab-03-hero-soundstage`)

A bounded art-direction milestone: **Scene E** takes **one** facility (Stage 1) and its immediate
production apron from greybox to a convincing **production-fidelity hero** — articulated silhouette
(recessed elephant doors, parapet/cornice, ridge monitor, loading dock, red-eye), procedural PBR
(corrugated-metal + weathered-concrete normal/roughness maps), ACES tone mapping, baked contact
shadows, and an active grip/electric apron with CC0 crew. **Scene D is left untouched** as the
greybox baseline — toggle **D ⇄ E** for a direct greybox-vs-hero comparison of the same building.
Boots on Scene E. Adds an optional, default-off `postprocessing` pass (bloom/AO) for real-GPU
review. A four-iteration refinement loop then improved architecture, signage, ground, crew, and
composition (`proof/lab03/iteration-01..04/`). Evidence in `proof/lab03/`. See
`docs/ASSET-LAB-03-BRIEF.md`, `HERO-SOUNDSTAGE-FINDINGS.md`, `ASSET-LAB-03-OWNER-REVIEW-GUIDE.md`,
`ASSET-LAB-03-INTEGRATION-RECOMMENDATION.md`, `ASSET-LAB-03-REFINEMENT-LOOP.md`.

## Asset Lab 04 — Refined Studio Lot (branch `asset-lab-04-studio-lot`)

A bounded architectural-art-direction milestone: **Scene F** takes the Lab 02 studio-greybox concept
and makes it substantially **less boxy, more architecturally believable, and visually varied** — a
whole studio campus with many distinct roof languages (barrel+monitor stages, sawtooth mill, Deco
admin, gable warehouses, hipped booth/bungalow, monopitch motor-pool, streamline commissary, marquee
theater), massing variety, and function-coded materials (procedural brick/wood/stucco/tile), all under
one warm golden-hour palette. The "less boxy" win lives in **geometry** (verify with Wireframe). The
whole lot's bespoke architecture is only ~6,250 tris. **Scenes A–E are left untouched** — toggle
**D ⇄ F** for the boxy-vs-refined comparison. Zero new downloaded assets; reuses the warm rig, ACES,
signage, and the iconic water tower. Evidence in `proof/lab04/`. See `docs/ASSET-LAB-04-BRIEF.md`,
`ASSET-LAB-04-FINDINGS.md`, `ASSET-LAB-04-OWNER-REVIEW-GUIDE.md`,
`ASSET-LAB-04-INTEGRATION-RECOMMENDATION.md`.

## Asset Lab 05 — Blender Production Foundation + Art Vertical Slice (branch `asset-lab-05-blender-pipeline`)

Turns the installed **Blender 5.2 LTS** into a repeatable, headless, deterministic **production-art
factory** (`blender/studio_pipeline/`, driven by `npm run blender:*`) and proves it with a representative
**vertical slice**, **Scene G**. Everything is authored procedurally in `bpy` — original stylized crew
characters (6 roles, skinned to the **65-bone UAL Mannequin** so the existing **43 CC0 clips** play
unchanged), a modular studio architecture kit (8 modules + an assembled soundstage), production props (9,
3 hand-attachable), a coherent export-safe PBR material library, **LOD0/1/2** + collision proxies,
automated GLB export, dual validation (Blender-side + independent Node byte-check), auto-rendered
thumbnails, and a reusable **Asset Browser** library. Scene G loads the whole Blender-authored set + crew
(each playing a CC0 clip) in the real runtime — console-error-free, live animation. Boots on Scene G;
Scenes A–F are untouched. Adversarially self-verified. **NOT merged** — owner review requested.

```bash
npm run blender:factory     # build all 23 assets + hero set + asset library + validate  (~15 s headless)
npm run build && npm run preview   # http://localhost:4320  → Scene G
```

Evidence in `proof/lab05/`. See [`docs/ASSET-LAB-05-BRIEF.md`](docs/ASSET-LAB-05-BRIEF.md),
[`ASSET-LAB-05-OWNER-REVIEW-GUIDE.md`](docs/ASSET-LAB-05-OWNER-REVIEW-GUIDE.md),
[`ASSET-LAB-05-PIPELINE.md`](docs/ASSET-LAB-05-PIPELINE.md),
[`ASSET-LAB-05-CHARACTER-SYSTEM.md`](docs/ASSET-LAB-05-CHARACTER-SYSTEM.md),
[`ASSET-LAB-05-STANDARDS.md`](docs/ASSET-LAB-05-STANDARDS.md),
[`ASSET-LAB-05-FINDINGS.md`](docs/ASSET-LAB-05-FINDINGS.md),
[`ASSET-LAB-05-INTEGRATION-RECOMMENDATION.md`](docs/ASSET-LAB-05-INTEGRATION-RECOMMENDATION.md).

## Documents

- [`docs/ASSET-INVENTORY.md`](docs/ASSET-INVENTORY.md)
- [`docs/PROVENANCE-REGISTER.md`](docs/PROVENANCE-REGISTER.md)
- [`docs/FORMAT-FINDINGS.md`](docs/FORMAT-FINDINGS.md)
- [`docs/CONVERSION-PIPELINE.md`](docs/CONVERSION-PIPELINE.md)
- [`docs/WINTERSETS-ARCHAEOLOGY.md`](docs/WINTERSETS-ARCHAEOLOGY.md)
- [`docs/PERFORMANCE-REPORT.md`](docs/PERFORMANCE-REPORT.md)
- [`docs/INTEGRATION-RECOMMENDATION.md`](docs/INTEGRATION-RECOMMENDATION.md)
- [`docs/SCHEMAS.md`](docs/SCHEMAS.md) — proposed, non-integrated (§10)
