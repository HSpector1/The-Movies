# Conversion Pipeline (contract §9)

A repeatable, local, deterministic intake → conversion → validation chain. **No Blender, no
global installs, no sudo, no legacy executables.** Everything runs from `node` against local
dependencies.

```
sources/original-archives/*.zip
        │  (manual unzip → sources/extracted/<pack>/)
        ▼
  hash-archives ──► manifests/source-archives.json      (SHA-256, §2)
        ▼
  inventory ──────► manifests/source-assets.json        (types/sizes/bounds/anims, §3)
        ▼
  curate ─────────► manifests/curation.json  + copies FBX/GLB → public/assets/  (§5)
        ▼
  optimize-gltf ──► public/assets/downtown/*.glb  + manifests/optimization.json (§9)
        ▼
  build-manifest ─► manifests/runtime-assets.json + public/runtime-assets.json  (§9)
        ▼
  validate-assets ► manifests/validation.json           (load/parse check, §9)
```

Run the whole chain: `npm run pipeline`. Each stage is independently runnable and
idempotent.

## Stage detail

### hash-archives (§2)
SHA-256 every archive in `sources/original-archives/`; when the Downloads original is still
present, verify the preserved copy is byte-identical. Fails loudly on mismatch. Originals are
never opened for writing.

### inventory (§3)
Walks `sources/extracted/`. For every glTF/GLB, `@gltf-transform` (with `ALL_EXTENSIONS`
registered) reports meshes, materials, textures, skins, animations (name + duration),
triangles, vertices, and a local-space AABB (from POSITION accessor min/max). FBX headers are
probed for format + version; DDS headers for dims + fourCC; MSH files are scanned for embedded
`.dds` references. Output is the full `source-assets.json`.

### curate (§5)
Selects the **representative subset** (not the full kit — §13 forbids expanding to a full
environment): 31 Downtown pieces (with role tags), 12 FBX props, 2 animation libraries, plus
the 6 required-role → clip mapping. Copies the no-conversion-needed runtime files (FBX props,
animation GLBs) into `public/assets/`. Writes `curation.json` as the single source of truth
for the subset.

### optimize-gltf (§9 "glTF optimization where practical")
For each curated Downtown `.gltf`: read (resolving external `.bin` + shared textures), then
`@gltf-transform` transforms **dedup → weld → prune → textureCompress**, then write a
**self-contained `.glb`**.

- **Geometry:** `dedup` (merge duplicate accessors/materials), `weld` (merge coincident
  vertices), `prune` (drop unused) — all pure JS.
- **Textures:** `textureCompress({ encoder: sharp, targetFormat: 'webp', resize:
  [1024,1024] })`. `sharp` is a **local** dependency (prebuilt darwin-arm64 binary in
  `node_modules`); this is the one native codec used, and it never touches the system. WebP +
  1024 px is why the self-contained GLBs are ~17 MB total instead of ~471 MB (see
  FORMAT-FINDINGS). Alpha is preserved (verified on the decal atlas).
- Records per-model output size in `optimization.json` (31/31 converted).

> Note: a benign `objc[…] libvips` dylib-coexistence warning may print (sharp bundles libvips
> twice via `ndarray-pixels`). It is cosmetic; all 31 conversions complete.

### build-manifest (§9)
Merges curation roles with inventory facts (bounds, triangles, materials, provenance) into
`runtime-assets.json` (also served at `public/runtime-assets.json` for the viewer). Separates
`reusable` (CC0) from `prototype-only` (LICENSE-UNCLEAR) and records the DO-NOT-USE exclusion
of wintersets. This manifest is what the app renders from — **no asset path is hard-coded in a
scene.**

### validate-assets (§9)
Loads every runtime asset: GLB via `@gltf-transform` (assert ≥1 mesh), FBX via binary-magic
check. Writes `validation.json`; nonzero exit on any failure. Current result: **45/45 pass.**

## FBX conversion decision

Contract §9 allows loading FBX directly "if conversion tooling is unavailable." The lab loads
the prop FBX **directly** (drei `useFBX`) rather than converting, because (a) it is sufficient
to prove the props load and (b) the props are **LICENSE-UNCLEAR**, so producing derived,
redistributable GLBs of them is premature. If they were ever cleared, the recommended offline
converter is three.js `FBXLoader` → `GLTFExporter` run in a headless browser (reusing the same
`puppeteer-core` already used for capture), which sidesteps Node DOM shims. This is documented,
not built, to stay within scope.

## Reproducibility

Delete `public/assets/` and `manifests/*.json`, re-drop the archives, run `npm run pipeline`
— byte-for-identical geometry manifests result (texture re-encode is deterministic for a
fixed sharp/libvips version). The pipeline is the artifact; the binaries are regenerable and
git-ignored.
