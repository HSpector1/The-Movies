# Character Rigging & Weights (Asset Lab 05B)

## Rig

Characters skin to the **canonical 65-bone UAL Mannequin** armature (imported from
`UAL1_Standard.glb`, baked to identity Z-up). **Bone / vertex-group names are never renamed** —
every group is a real UAL bone — so all 43 CC0 clips bind by bone-name for free. The armature is
exported at **identity** (no `(0,0,π)` hack).

## Weighting: deform-layer, at add-time (the fixed method)

`SkinnedBuilder` assigns weights on the bmesh **deform layer using the live BMVerts at add()-time**,
tracking group indices as it goes. This replaced a latent index-based scheme that silently
mis-mapped weights across primitives (a foot vertex was weighted to `hand_r` → the mesh sheared
into shards under animation). Holding BMVert refs OR raw indices across later create-ops is unsafe;
the deform layer set immediately is the only robust path.

Weighting scheme = **segmented joints**: each limb segment rigid to its bone; a joint sphere
blends the two adjacent bones (`_blend`) at shoulder/elbow/wrist/hip/knee/ankle/neck. Accessories
weight 100% to their bone (headwear→Head, radio/belt→pelvis, clipboard→spine_01).

## Required weight checks (all pass)

`diag_weights.py` + `charvalidate` confirm: **0 unweighted verts**, **0 verts with weight-sum ≠ 1**,
no head/foot verts weighted to arm bones (the top-displaced verts under animation are the hands/
wrists, as expected). glTF export normalises to ≤4 influences per vertex (glTF-compatible).

## Pose validation grid (six required clips + rest)

Rendered front/side/3q for: rest, Idle, Walk (contact+passing), Idle_Talking, Sitting, PickUp_Table,
Fixing_Kneeling. Feet grounded (min z ≈ 0.00) in all standing clips; no shards, no joint collapse,
no detached pieces. Evidence: `proof/lab05b/iteration-01..02` pose-*.png + `final/pose-*.png`.

## Automated enforcement

`test_character_gate.py` (gate passes correct / rejects face-on-back), `validate-characters.mjs`
(GLB: identity node, 65 joints, LOD skeleton consistency, height). Pipeline:
`npm run blender:characters:pipeline` (build gate + GLB validate) — fails on face-on-wrong-side or
disconnected parts.
