# Bounded soundstage preview

Open **START PREVIEW.command** on this Mac. It uses the installed Node20.20.2, Three0.185.1, Vite6.4.3 and the existing intensive-work lane. No dependencies are installed. The built preview is served only at **http://127.0.0.1:4197/**; the exact URL opens after the server is ready, in a fresh isolated Chrome window using the installed Playwright1.62.0. If that port is occupied, the launcher fails without stopping anything. Set `PREVIEW_PORT` to another unused unprivileged port when launching from a terminal.

Close the isolated Chrome window, or press **Control-C in the launcher Terminal**, when finished. “Stop preview” releases the renderer; the Terminal must also stop to release the integration lane. Keep AC power connected. The launcher requires3.5GiB free before starting and stops below3GiB while running. Logs stay in `.runs/`. The symlink to installed dependencies is local and ignored by Git; `STUDIO_INTEGRATION_ROOT` can point to the existing integration checkout if its location changes.

Drag to orbit and use the wheel to zoom. The three view buttons restore fixed management, crew/floor and exterior close-up cameras. Switch material modes without moving geometry, camera or lights:

- **Baseline:** original selected floor materials, with no downloaded maps loaded.
- **Concrete:** Concrete Floor base color and roughness on the8×8m interior only.
- **Asphalt:** Asphalt03 base color and roughness on the4×8m exterior only.
- **Both:** the two candidate surfaces together.

All new maps are1024×1024 JPEGs, sampled at anisotropy1. Concrete repeats every2.1m and asphalt every2m. Only base color uses sRGB; roughness stays linear. Both candidates use metalness0/roughness1 multiplied by the roughness map, without normals, displacement or geometry changes. Baseline UVs and candidate UVs are identical; only texture transforms and material references differ. Changing back releases candidate texture resources, although browser HTTP cache behavior is separate.

Figure/pose controls demonstrate idle, walk-in-place, directing and a work stance. **These are procedural bone offsets, not imported clips, filming, pathfinding or simulation commands.** Two inspected65-bone rigs share bind hierarchy; neither has embedded animation. No camera grip/contact, chair sitting or synchronized camera operation has been established. The scene never opens the game app or reads campaign storage.

The cutaway uses repeated original2m wall modules shortened to3.2m in this preview, one corner shortened to match, and two instances of the original floor tile. Authored units are nominal metres and exported geometry is Y-up; the rig's original root rotation is preserved. Props and people retain authored scale. Exact selections, hashes, authors, licensing references, acquisition dates and map dimensions are in [PROVENANCE.json](PROVENANCE.json), extending the existing register and file-level structure. [Asset review](evidence/asset-review.md) records authored bounds, bones, source-axis caveats and bind hand origins. No prop is attached to those origins; real grip offsets/IK remain an animation gap.

The four new maps cost2,810,901bytes; including53,732bytes of publisher API metadata, acquisition totals**2,864,633bytes (2.73MiB)** of the25MiB allowance. The nine reused GLBs total585,560bytes. No ambientCG fallback was needed. The scoped local search found no equivalent copy in the relevant asset inventory/Downloads names; this is not a claim about every file on the Mac.

Primary sources: [Concrete Floor](https://polyhaven.com/a/concrete_floor) by eye-candy.xyz; [Asphalt03](https://polyhaven.com/a/asphalt_03) photographed by Charlotte Baglioni and processed by Dario Barresi; [Poly Haven CC0 asset licence](https://polyhaven.com/license). Only asset files were downloaded, not website example renders. Project-generated assets remain owner-owned, with the existing CC0 Quaternius rig provenance; they are not newly reclassified as third-party CC0 geometry.

Verification uses the unchanged existing `scripts/audit-3d-assets.mjs` against **public/assets only**, plus exact-file/hash/JPEG/header checks in `scripts/verify-assets.mjs`. The existing audit's `passed` flag does not include its structural-error list and does not establish licensing or rig/clip compatibility; read the separate verifier and independent review. Type/build/browser checks run serially inside the same intensive lane. Never run this browser alongside integration tests.

See [RESULTS.md](RESULTS.md) for the measured comparison, per-asset decisions and matched screenshots. Browser resource counts are not GPU-byte measurements. Headless Chrome observations do not certify interactive Mac GPU performance or Unity compatibility. No automatic merge or finished-art adoption is authorized; the main P15B→P18 program resumes after this finite preview releases its resources.
