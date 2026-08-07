# Project: Studio — Character Export & Runtime Guide

> **Governing packet identity**
>
> - Packet: **Project: Studio Human-Artist Character Handoff**
> - Version: **CHH-2026-08-07-R2**
> - Revision date: **2026-08-07**
> - Governing branch: `asset-lab-character-human-artist-handoff`
> - Supersedes Git tip: `7603b2f234dfdb11ad6a0691315942c4b16cffac`
> - Packet content SHA-256: `dbe7c8c31d80ae1218c8a01fe6326a37eb20511274d2e42eb32bd70d2fd9869e`
>
> A copied page is current only when its packet name, version, revision date, governing branch, and
> packet-content SHA-256 match the other seven packet documents at the governing branch tip. The Git commit
> cannot safely embed its own future SHA, so the packet-content SHA-256 is the in-document immutable identity;
> the **live governing Git tip is a separate check** and must be verified against the remote, not against this page.
>
> **Verify mechanically — do not trust a pasted digest.** The digest method is governed repository content, and a
> committed validator reproduces it: `npm run handoff:verify` (`node tools/validate-handoff-packet.mjs`) re-derives
> the digest from all eight pages and exits non-zero on any mismatch, mixed version or missing page. After any packet
> edit, regenerate with `npm run handoff:update`. **Hand-editing a digest without regenerating is prohibited**, and a
> packet with mixed versions or mixed digests is **invalid**. Method: `CHARACTER-TECHNICAL-CONTRACT.md` →
> *Packet identity and the packet-content digest*. Validator: `tools/validate-handoff-packet.mjs`.
>
> This packet is a commissioning specification only. It is not permission to begin work, produce a character,
> integrate a character, or begin D1-B.

> **Status:** the 05I model is **rejected as a production character foundation**; the commission is **substantial
> specialist correction, not a polish pass**; **no production or Studio Lot integration is authorized**. A clean
> export and a passing validator are **technical reproducibility, not visual approval** — acceptance runs through
> the staged gates in `CHARACTER-ACCEPTANCE-TESTS.md`. Governing ruling:
> [`CHARACTER-ARTIST-HANDOFF-BRIEF.md`](./CHARACTER-ARTIST-HANDOFF-BRIEF.md).

How to (re)build, validate, and review the character. Run from the repo root
(`/Users/bruce/Project Studio - Asset Lab`). Blender 5.2 LTS at `/Applications/Blender.app/Contents/MacOS/Blender`
(override with `BLENDER=`); Node in the repo (`node_modules` present); Google Chrome for the runtime capture.

## ⚠ Required local dependency before any runtime step

**`public/assets/animation/UAL1_Standard.glb` is NOT delivered by this repository.** It is **intentionally
gitignored** (`.gitignore` ignores `public/assets/*` and re-includes only `public/assets/studio/`), so
**`public/assets/animation/` does not exist in a clean checkout**. It carries the approved 65-joint rig and the
43-clip library holding the **six clips** every review and capture step below uses.

- **Expected local path:** `public/assets/animation/UAL1_Standard.glb` (`config.RIG_SOURCE_GLB`).
- **Who provides it:** the **Owner or an authorized Asset Lab operator**, from the previously approved,
  provenance-verified Quaternius UAL package. The repository documents **no download or redistribution procedure**.
- **Do not substitute** another rig or animation library, and do not swap in the `_RM` root-motion variant.
- **Do not commit or redistribute** the provisioned file. It is a local dependency, never a committed asset.

**What still works without it:** `npx tsc --noEmit`, `npm run build`, `node tools/validate-05i.mjs` and
`node tools/validate-hero-05h.mjs` — these read the **committed** character GLBs, not the clip library. They are the
static, Blender-side checks `CHARACTER-ACCEPTANCE-TESTS.md` lists as independent of this dependency.

**What it blocks:**

- **The procedural rebuild and the fast review renders below.** Both load the canonical rig out of this same file —
  `blender/studio_pipeline/rig.py` → `load_canonical_rig()` raises `FileNotFoundError: rig source missing` when
  `config.RIG_SOURCE_GLB` is absent — so **neither command below runs without it.** Do not read the rebuild section
  as dependency-free.
- **The review harness, and therefore the capture step.** The 05I hero component loads the clip library
  unconditionally, so **the static runtime views are unavailable too**, not only the animated ones — no six-clip
  deformation evidence, no joint-by-joint per-clip reporting, and no console-error-free runtime capture.

**If it is absent, record the affected gate as
`BLOCKED — OWNER-PROVISIONED UAL DEPENDENCY NOT AVAILABLE`.** A harness that will not boot for want of this file is
a **missing client input** — it is **not** a runtime failure and **not** a character defect, and it must not be
reported as one. Full terms: [`CHARACTER-TECHNICAL-CONTRACT.md`](./CHARACTER-TECHNICAL-CONTRACT.md) → *Rig and
clip-library delivery status*. Gate partition and the governing BLOCKED / FAILED / PASSED definitions:
[`CHARACTER-ACCEPTANCE-TESTS.md`](./CHARACTER-ACCEPTANCE-TESTS.md).

## Regenerate the procedural character (reference only — the human artist works from the GLB, not this)
```
node tools/blender-run.mjs blender/build_hero_export_05i.py
```
Builds base + corrections, joins, decimates LOD0 by 0.5, generates LODs (ratios [1.0, 0.45, 0.20]), builds the
collision proxy, and writes `public/assets/studio/characters/electric_hero_05i{,_LOD1,_LOD2,_COL}.glb` +
`manifests/hero-05i.json`. Fast review renders (no export): `node tools/blender-run.mjs
blender/build_hero_05i_render.py -- proof/lab05i/scratch`.

## Export conventions a hand-authored replacement must match
- glTF binary (`.glb`), **+Y-up**, self-contained (embedded materials/textures).
- One skinned mesh + the 65-bone armature per file; **no animations embedded** (`export_animations=False`).
- Three files: LOD0 (`electric_hero_05i.glb`), LOD1 (`_LOD1.glb`), LOD2 (`_LOD2.glb`), each retaining all 65 joints,
  plus a collision proxy (`_COL.glb`). Consistent material slots across LODs.
- Land them in `public/assets/studio/characters/` (this subtree is committed; `public/assets/*` is otherwise
  gitignored except `public/assets/studio/`).

## Validate
```
node tools/validate-05i.mjs          # 65 joints, budgets, additive integrity, evidence, harness wired
node tools/validate-hero-05h.mjs     # confirms 05H/05G still byte-unchanged (additive guard)
npx tsc --noEmit                     # TypeScript
npm run build                        # tsc + vite production build
```

## Runtime review (the review harness)
```
npx vite --port 4321 --strictPort    # in one shell
```
Then open `http://localhost:4321/`. It boots on Scene G. In the left DevPanel:
- **05I Hero** row = the 05H↔05I A/B comparison cameras (25 presets; 05H left, 05I right), covering the 15 static
  views, six clips, and three distances. The **Neutral eval light** toggle switches to strictly-neutral material light.
- Owner review index (no dev tools): open `proof/lab05i/iteration-02/index.html` (file:// or via the running app at
  `http://localhost:4321/proof/lab05i/iteration-02/index.html`).

## Capture matched evidence (headless)
```
# with vite running on :4321, in another shell:
OUT_DIR="$PWD/proof/<your-dir>/runtime/" node tools/capture-05i-review.mjs
```
Captures the 25 named comparison views + wireframe + neutral-light material views (deterministic SwiftShader, labeled
diagnostic-only). For real-GPU (Apple Metal) close-ups, launch Chrome without the SwiftShader flags (see
`tools/perf-05h-realgpu.mjs` for the pattern: `--use-angle=metal`, read back `WEBGL_debug_renderer_info` to confirm
real GPU). All capture scripts use the `window.__lab` bridge (`setReview`, `set`, `perfProbe`, `getErrorCount`).

## Review-camera specifications
The comparison presets are `G_HERO_05I` in `src/lab/cameraBridge.ts` (perspective camera, fov 42; each preset is a
`{pos, tgt}` pair; 05H at x=−0.55, 05I at x=+0.55). Reuse these exact framings for matched before/after evidence.
