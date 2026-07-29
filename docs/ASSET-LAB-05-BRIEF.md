# Asset Lab 05 — Blender Production Foundation + Art Vertical Slice

**Branch:** `asset-lab-05-blender-pipeline` · **Boots on:** Scene **G** · **Status:** built, self-verified, **NOT merged** — owner review requested.

## What this milestone is

Turn the installed **Blender 5.2.0 LTS** application into a *repeatable, headless, production-art
factory* for Project: Studio, and prove it with a representative **vertical slice** that runs in
the existing Asset Lab runtime. This is **not** authorization to build every final game asset — it
is the factory plus one honest slice of output. Future milestones may scale content only after this
foundation passes review.

Blender authors the **visual assets**. It contains **no** simulation, economy, schedule,
relationship, facility, or movie-production logic (§ isolation, below).

## What was built

A Python pipeline package (`blender/studio_pipeline/`) driven headlessly by `blender --background`,
plus npm entry points, that authors and exports:

| Family | Count | Notes |
|---|---|---|
| **Crew characters** | 6 roles | Grip, Electric/Gaffer, Camera/DP, Director, PA, Carpenter. Original stylized humans, ~2.0–2.5 k tris, skinned to the **65-bone UAL Mannequin** so all **43 CC0 clips** play unchanged. |
| **Architecture kit** | 8 modules | Corrugated stage wall, elephant-door bay, barrel-vault roof + monitor, stage corner, ground tile, boundary wall, marquee gate, water tower. 2 m grid. + one assembled soundstage. |
| **Production props** | 9 | Studio camera+tripod+dolly, fresnel light+stand, C-stand, apple box, director's chair, cable reel, clapperboard, boom mic, megaphone. 3 are hand-bone-attachable. |
| **Materials** | shared PBR library | Export-safe: constant metallic-roughness factors + vertex-colour (COLOR_0) region variation + numpy-generated tileable maps (corrugated/concrete/brick/stucco/face). |

Every asset ships **LOD0/LOD1/LOD2** as real GLBs + a separate **collision proxy** GLB (93 GLBs total:
23 primary + 46 LOD + 23 collision + 1 hero set), is **validated** (Blender-side + independently in Node
against the bytes, including a check that no manifest LOD row is a phantom), gets an **auto-rendered
thumbnail**, and is listed in `manifests/studio-assets.json`. All 23 assets are also marked and
cataloged in a reusable **Asset Browser library** (`blender/libraries/studio_assets.blend`).

The **vertical slice** is **Scene G** in the viewer: the whole set (soundstage assembled from the
kit + apron + dressed props) with a crew of the Blender characters, each playing a CC0 clip
retargeted onto its rig — proving the factory's output runs in the real runtime.

## Headline results (self-measured)

- Full factory build: **23 assets in ~10 s** headless; validation **23/23 pass** (Blender-side) and **23/23 pass** independently in Node against the GLB bytes.
- Every character GLB carries the full **65-joint** skeleton (names identical to `UAL1_Standard.glb`), skinned (JOINTS_0/WEIGHTS_0).
- Scene G renders **console-error-free**; animation is **live** (proof frames `11-anim-t0` ≠ `12-anim-t1`).
- Assembled soundstage ≈ **912 tris**; whole hero set ≈ **4,180 tris**; a crew character ≈ **2.0–2.5 k tris** — squarely in the Lab 02–04 low-poly house style.
- Deterministic: seeded RNG only; no `Math.random`, no argless `Date`.

## Scope boundary (what this is *not*)

- Not the game. Not a branch/worktree of any protected repo. Read-only toward `The Movies` / spikes.
- Not final identity art — a representative slice proving the factory, at greybox-plus fidelity.
- No section-11 non-goals were built (no chemistry, economy, LLM, scene composition, screenplay, etc.).

## Where to look

- **Owner review:** [`ASSET-LAB-05-OWNER-REVIEW-GUIDE.md`](ASSET-LAB-05-OWNER-REVIEW-GUIDE.md)
- **How the factory works:** [`ASSET-LAB-05-PIPELINE.md`](ASSET-LAB-05-PIPELINE.md)
- **Characters + animation compatibility:** [`ASSET-LAB-05-CHARACTER-SYSTEM.md`](ASSET-LAB-05-CHARACTER-SYSTEM.md)
- **Naming / LOD / collision / material standards:** [`ASSET-LAB-05-STANDARDS.md`](ASSET-LAB-05-STANDARDS.md)
- **Findings + limitations:** [`ASSET-LAB-05-FINDINGS.md`](ASSET-LAB-05-FINDINGS.md)
- **How this could feed the game (non-integrated):** [`ASSET-LAB-05-INTEGRATION-RECOMMENDATION.md`](ASSET-LAB-05-INTEGRATION-RECOMMENDATION.md)
- **Locked design spec (judge-panel output):** [`ASSET-LAB-05-DESIGN-SPEC.json`](ASSET-LAB-05-DESIGN-SPEC.json)
- **Evidence:** `proof/lab05/` (Scene G shots + `thumbnails/`).
