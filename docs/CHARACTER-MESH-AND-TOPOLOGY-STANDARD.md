# Character Mesh & Topology Standard (Asset Lab 05B)

## Construction method: authored primitives, directly skinned — NO remesh

A crew character is a **single skinned mesh** assembled from deliberately-placed low-poly
primitives (boxes, cylinders, spheres, cones), each **directly weighted** to the canonical UAL
bones via `SkinnedBuilder`. There is **no voxel remesh, no `remove_small_islands`, no
paint-by-region** — those were the Lab-05 root causes (thin features destroyed, clothing fused,
feet deleted). Primitives are placed against the rig's rest joints (`rig.rest_points`).

## Required anatomy (all present, all connected)

torso · pelvis/hips · neck · head · 2× (upper arm, forearm, hand) · 2× (thigh, lower leg, foot).
Connectivity is guaranteed by construction (overlapping primitives at shared joints) and enforced
by the gate (`charvalidate.validate`: no stray island < 6 verts; feet grounded; height in range).
Separate skinned pieces (clothing shells, hair, hats, boots, accessories) are intentional and
visually joined.

## Proportions

- Height ≈ **1.77–1.86 m** (measured 1.774 standard / 1.815 heavy); ~7-head stylized.
- Believable shoulder width, arm/leg lengths, readable head + hands, feet sized to read.
- `SIZE` girth: standard 1.00, heavy 1.16 (Electric/Maintenance/Carpenter).
- No extreme tapering, no balloon joints (the remesh artifacts) — segments taper gently.

## Deformation topology (segmented-joint scheme)

Each limb segment is rigid to its bone; a **joint sphere blends the two adjacent bones** at
shoulder, elbow, wrist, hip, knee, ankle, and neck. This is the exact scheme the reference UAL
Mannequin uses, so it deforms cleanly under all 43 CC0 clips without single-edge hinge collapse
(validated across the six required clips + a deep-kneel stress pose). Voxel remesh is **not** used
as an intermediate either — the authored low-poly base IS the final deforming body.

## Budget

~4.0–4.4 k tris/char at LOD0 (well under the 8–12 k budget). See the LOD + performance docs.
