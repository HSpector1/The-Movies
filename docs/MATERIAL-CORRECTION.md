# Material Correction — the Lab 01 red pavement (contract §6)

The owner flagged "excessive red pavement and edge glow" in Asset Lab 01. §6 requires the
**actual cause** and the **smallest correction**, not hiding it with darker lighting. This
documents the full investigation.

## What it was NOT (ruled out with evidence)

Asset Lab 01's first correction attempt assumed reflective metal + environment reflections and
applied `metalness = 0` / `envMapIntensity = 0`. That **reduced a sheen but left a residual
red edge-glow** — proving the reflection theory was incomplete. Systematic check of the
optimized `Street_2Lane.glb` / `Sidewalk_Straight_3m.glb` materials:

| Suspected cause | Finding | Verdict |
|---|---|---|
| Emissive channel | `emissiveFactor = [0,0,0]` on all pavement materials | not it |
| Base-color factor | `[1,1,1,1]` (white) on all | not it |
| Base-color texture | asphalt/concrete albedo; scan of `T_Street_Decals` = **0% red** pixels | not it |
| ORM misread / metallic | `metalness = 1.0` gives sheen but reflects gray IBL, not crimson | secondary only |
| Tone mapping / color space | ACES + sRGB correct; red persisted with envMap off | not it |
| Environment reflection | killed via `envMapIntensity = 0`; red **still present** | not it |

## Actual cause — red vertex colors (a shader mask)

The pavement meshes carry a **`COLOR_0` vertex-color attribute whose RED channel is saturated**:

```
Street_2Lane primitive COLOR_0 samples: [1,1,1,1] [1,0.16,0.16,1] [1,0.01,0.01,1] ...
Street_2Lane 2nd primitive: ALL [1,0,0,1]   (pure red)
Sidewalk_Straight_3m: [1,1,1,1] ... [1,0,0,1]
Building_Small_1: every COLOR_0 = [1,1,1,1] (white — unaffected)
```

three.js `GLTFLoader` **auto-enables `material.vertexColors`** for any mesh that has a
`COLOR_0` attribute. `MeshStandardMaterial` then multiplies the (gray) asphalt albedo by the
(red) vertex color, so the pavement renders red — independent of metalness, roughness,
emissive, tone mapping, or environment. That independence is exactly why the Lab 01 metalness/
envMap fix could not remove it.

Why is the red there at all? Quaternius' **SOURCE** version ships custom shaders ("wear",
"fake interior windows" — per the pack's own `License_Standard.txt`). The vertex-color RED
channel is a **shader mask** for those effects. It is meaningless to a standard glTF PBR
material, which naively treats it as colour. Buildings don't use the mask, so their `COLOR_0`
is all-white and they were never affected.

## The smallest correction

Disable vertex colors on the imported materials:

```ts
// src/components/models.tsx (ModelGLB import loop)
if (s.vertexColors) { s.vertexColors = false; s.needsUpdate = true }
```

One boolean per material. No lighting change, no texture edit, no geometry edit. The gray
asphalt/concrete albedo now shows correctly; white-vertex-colour buildings are visually
unchanged. Verified in `proof/lab02/09-material-after.png` (Scene A pavement, now gray) versus
the preserved Lab 01 `proof/04-road-sidewalk.png` (red).

## Belt-and-braces for Scene D

Scene D does not rely on the CC0 pavement at all — its roads/sidewalks use the **authored warm
material family** (`src/lab/materials.ts`), which is matte dielectric concrete/asphalt and
cannot exhibit the mask. The vertex-color fix additionally cleans up any CC0 piece reused in
Scene D (bollards, planters). Both the root-cause fix and the authored-material path are in
place, so the defect is corrected, not merely hidden.

## Lesson for adoption

Third-party glTF may carry vertex-color/UV channels that are **engine-specific masks**, not
colour. Any importer should decide per-pack whether `COLOR_0` is real vertex colour or a mask,
and disable `vertexColors` when it is a mask.
