# 3D Asset Pipeline Guardrails

The production 3D asset root is `ui/public/spike3d/`. Run `npm run audit:3d-assets` before adopting a GLB or texture. The command writes its generated JSON evidence to `.tmp/3d-asset-audit.json`, which is intentionally gitignored, and exits non-zero for hard violations.

## Hard gates

- Every production GLB, glTF, PNG, JPG/JPEG, and WebP needs a matching path entry in `ui/public/spike3d/PROVENANCE-lab05h.json`.
- A GLB may not exceed 25 MiB and a raster texture may not exceed 16 MiB unless its relative path is explicitly listed in `scripts/3d-asset-audit-allowlist.json`.
- Identical SHA-256 payloads under different asset paths require their hash to be explicitly listed in that allowlist.

The provenance JSON accepts entries with `path`, `assetPath`, `relativePath`, `relative_path`, or `file`; use paths relative to `ui/public/spike3d/`. A provenance entry records the source, license, and evidence for a particular production file. The companion `PROVENANCE-REGISTER.md` explains the pack-level licensing decisions; it does not replace file-level entries.

## Informational metrics

For every GLB, the report records scenes, nodes, meshes, primitives, materials, textures, animation clips, approximate triangles, skinned-mesh evidence, and obvious attachment-node names. The report also includes a character animation-readiness table. These are observations, not art-direction gates.

## Not validated

This audit does not validate visual quality, scale, pivots, UVs, texture quality, runtime frame time, licensing correctness beyond the supplied record, animation quality, or renderer integration. It intentionally sets no polygon or animation-count limits.

Before adoption, inspect an authored GLB in its DCC/viewer, confirm source/license evidence, add its file-level provenance entry, run the audit, and review the generated structural and character-readiness evidence. Add an allowlist entry only with a documented, intentional exception.
