# Asset Lab 05 — Asset Standards (naming · materials · LOD · collision · budgets)

The conventions the factory enforces so downstream use is predictable. All are encoded in
`blender/studio_pipeline/config.py` (the TUNING-equivalent) — never inline a named number.

## Scale & orientation

- **1 Blender unit = 1 metre.** Adult reference **1.8 m**. Confirmed on export bounds.
- **+Y up** on glTF export; characters authored facing +Y, then oriented for display/runtime.

## Naming

| Kind | Pattern | Examples |
|---|---|---|
| Character | `Char_<Role>_<Size>` | `Char_Grip_Standard`, `Char_Electric_Heavy` |
| Architecture | `Arch_M<NN>_<Name>` | `Arch_M01_StageWall`, `Arch_M11_MarqueeGate`, `Arch_M13_WaterTower` |
| Prop | `Prop_<Name>` | `Prop_StudioCamera`, `Prop_Fresnel`, `Prop_CStand` |
| Hand-attachable prop | `Prop_<Name>_attach_<bone>` | `Prop_Slate_attach_hand_l`, `Prop_Boom_attach_hand_r` |
| LOD tiers | `<Name>_LOD0 / _LOD1 / _LOD2` | share identical bone-named vertex groups |
| Collision proxy | `<Name>_COL` | separate GLB, never the render mesh |

**Bones / vertex groups are NEVER renamed** — every group is a real UAL Mannequin bone
(`root, pelvis, spine_01/02/03, neck_01, Head, clavicle/upperarm/lowerarm/hand_[lr]`, the five finger
chains incl. `*_04_leaf`, `thigh/calf/foot/ball/ball_leaf_[lr]`). This is the byte-shared guarantee.

Every exported object also carries glTF **extras**: `studio_role`, `studio_class`, `studio_attach`
(hand props), and provenance (`author`, `license: original-CC0-equivalent`, `pipeline`, `milestone`).

## Materials

glTF-safe by construction (`materials.py`):

- **`solid`** — Principled BSDF with constant base-colour / metallic / roughness → exported as
  pbrMetallicRoughness *factors*. Optional **vertex-colour multiply** (COLOR_0) for tonal variation.
- **`textured`** — adds tileable **image maps** (base / roughness / normal) generated procedurally with
  numpy (deterministic, tileable sine-sum fields; no bake step), sampled through the box-UV projector.
- Shared **library** (stucco, brick, concrete, metal, steel, wood, roof, painted, canvas, glass) +
  crew materials (skin, cloth, leather, felt, hard-hat) + per-character face image.
- Vertex-colour rule: `Col` defaults to **white** (a no-op multiply) and is tinted only where intended;
  `export_vertex_color="ACTIVE"` exports exactly one COLOR_0, so tints never leak across materials.

Draw-call discipline (the Lab 02–04 lever): share one material set across a family; per-instance
variation is vertex colour / tint, not a new material.

## Triangle budgets (`config.TRI_BUDGET`, stylized low-poly)

| Class | Budget | Typical actual |
|---|---|---|
| Character LOD0 | 6,000 | 2,000–2,500 |
| Prop | 2,500 | 36–588 |
| Architecture module | 1,200 | 12–708 |
| Assembled soundstage | 9,000 | ~912 |

The whole hero SET is ~4,180 tris — the Lab 02–04 lot norm was ~6,250, so a populated backlot stays
affordable by **instancing**, not unique meshes.

## LOD standard (`lod.generate_lods`)

Three tiers via the **Decimate (collapse)** modifier, which **preserves vertex groups** — so one
animation instance drives any character LOD and clips are never re-authored.

| Tier | Ratio | Purpose |
|---|---|---|
| LOD0 | 1.00 | hero / mid-shot (as authored) |
| LOD1 | ~0.50 | mid-ground |
| LOD2 | ~0.25 | background crowd |

All three tiers ship as GLBs: `<Name>.glb` (LOD0), `<Name>_LOD1.glb`, `<Name>_LOD2.glb`. Character LOD
tiers retain the full **65-bone** skeleton + weights (decimate collapse preserves vertex groups),
independently verified — so one animation instance drives any tier. The manifest records each tier's
tri count **and** its file, and `tools/validate-studio.mjs` fails if a tier's file is missing, its tris
disagree, or a character tier lost its skeleton (no phantom LOD rows).

## Collision standard (`lod.collision_proxy`)

A **separate, convex, low-poly** proxy per asset, exported as `<Name>_COL.glb`, never the render mesh,
never in the tri budget:

| Class | Proxy |
|---|---|
| Character | upright **capsule** (~0.44 m × 1.8 m) — animation-visual only, no per-limb collision |
| Architecture module / small prop | **box** (axis-aligned bounds) |
| Everything else | **convex hull** |

Typical proxies are 12–~230 tris. They are low-poly but **not** guaranteed below the render mesh: a few
already-trivial assets (ground tile, apple box, boom) have a proxy at or slightly above their tiny LOD0
tri count — the proxy is a bounding box/hull, not a further-simplified render mesh. **This is a spec
convention for downstream use — no physics/collision is BUILT in this lab (isolation).**
