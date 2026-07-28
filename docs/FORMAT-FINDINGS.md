# Format Findings (contract §3, §9)

What each format is, whether it loads in a modern three.js runtime, and what the pipeline
does with it.

## glTF / GLB — the preferred runtime format

- **Downtown ships `.gltf` + external `.bin` + shared PNG textures** (the "glTF (Godot)"
  export). Loads natively in three.js `GLTFLoader` / drei `useGLTF`. Fully parseable
  offline with `@gltf-transform` (used for the whole inventory: mesh/material/texture/anim
  counts, triangle/vertex counts, local AABBs).
- **The animation library ships `.glb`** (self-contained: skinned mesh + skeleton + 43
  clips + textures in one binary). This is the ideal runtime shape — one fetch, everything
  present. `useGLTF` returns `{ scene, animations }`; drei `useAnimations` drives them.
- **Recommendation: GLB is the target runtime format.** Self-contained, versioned, tooling
  is excellent, and it round-trips through `@gltf-transform` for optimization.

### Texture packing caveat (important)

The source Downtown glTFs **share** ~142 MB of 2K/4K PBR textures by filename across all 153
models. Converting each model to a *self-contained* GLB **embeds** its textures, so a naive
conversion duplicated the shared set 31× → **471 MB**. The fix (see CONVERSION-PIPELINE) is
to resize + recompress textures during conversion (1024 px, WebP), which drops the same 31
GLBs to **~17 MB** with no visible quality loss at management-camera distance. Lesson for any
future adoption: **decide the texture-sharing strategy up front** — either shared external
textures (smaller total, more files) or self-contained + compressed GLBs (simplest runtime).

### Material finding — reflective pavement (cosmetic)

Quaternius pavement materials (`MI_Asphalt`, `MI_Trim_MetalConcrete`) are authored
**metalness = 1.0** and `doubleSided`. Under image-based lighting the flat ground behaves as
a mirror and picks up the red of nearby brick buildings, appearing red at grazing angles.
The lab forces marked ground pieces to `metalness = 0`, `roughness = 1`, `envMapIntensity =
0`; this removes the mirror on the surfaces but a **residual red edge-glow** remains on the
tile curbs/bevels of the `MI_StreetDecals` pieces. It is **cosmetic**, confined to Scene A
pavement, and does not affect loading, scale, or any pass criterion. Any real adoption should
re-author these ground materials (matte, single-sided) rather than trust the pack defaults.

## FBX — load-direct for the prototype

- The prop pack and the animation library's FBX variants are **binary FBX v7400**. three.js
  `FBXLoader` (via drei `useFBX`) loads them directly. Contract §9 permits loading FBX
  directly when conversion tooling is unavailable, so the lab does exactly that for Scene B
  (no offline FBX→GLB step was required to prove the props).
- **Unit/origin quirks:** FBX has no canonical unit; props can arrive authored in cm and with
  arbitrary origins. `ModelFBX` defends against this: it measures the loaded object's local
  AABB, auto-scales cm→m when the max dimension exceeds 8 m, then grounds (min.y→0) and
  centres (x/z), so placement is predictable regardless of authored origin. This worked for
  all 12 curated props (they sit on the floor at sensible sizes in Scene B).
- **Recommendation:** FBX is fine as an *intake* format but **not** a runtime format. If these
  props were ever cleared for use, convert FBX→GLB offline (see CONVERSION-PIPELINE) rather
  than shipping FBXLoader to the client.

## DDS — legacy textures ARE recoverable

- The wintersets textures are standard **DirectDraw Surface** (DXT1 / DXT3, 16×256 up to
  1024×1024). Standard DDS is loadable by three.js `DDSLoader`. So even though the legacy
  *meshes* are a dead end, the legacy *textures* are technically recoverable to a modern
  runtime (KTX2/PNG/WebP after transcode). We do not do so here (DO-NOT-USE provenance).

## MSH (Lionhead *The Movies*) — not loadable, by design not converted

- `.msh` is a proprietary binary with no public spec: little-endian int32 chunk/count tables
  and null-terminated `.dds` texture references (e.g. `plant_ph03e_wnt.dds`). `file(1)`
  reports "data." A full importer would be a reverse-engineering project, which §5 explicitly
  says **not** to undertake ("do not build a complete MSH converter unless it is clearly
  simple" — it is not). Structure documented in WINTERSETS-ARCHAEOLOGY; no converter built.

## HDR — present, unused

- Downtown ships 3 interior `.HDR` environment maps. Not needed for these proofs (the lab
  uses a procedural `RoomEnvironment` for offline-safe IBL). Available if a future interior
  scene wants authored reflections.

## Summary table

| Format | Source | Runtime-loadable? | Pipeline action |
|---|---|---|---|
| glTF (`.gltf`+`.bin`) | Downtown | Yes (GLTFLoader) | optimize → self-contained GLB |
| GLB | Animation lib | Yes (ideal) | copy as-is (already self-contained) |
| FBX (binary 7400) | props, anim | Yes (FBXLoader) | load-direct for prototype; convert→GLB if adopted |
| DDS (DXT1/3) | wintersets | Yes (DDSLoader) | none (DO-NOT-USE) |
| MSH | wintersets | **No** (proprietary) | none — documented only |
| HDR | Downtown | Yes (RGBELoader) | none (procedural IBL used instead) |
