# Asset Lab 05 — Crew Character System ("Grounded Studio Crew v1")

The crew are the milestone's hero deliverable and its hardest technical constraint: **original,
stylized studio-crew humans that the existing CC0 animation library drives unchanged.** This is the
one place the factory had to prove a genuinely new capability (Labs 02–04 characters were the raw CC0
mannequin, tinted).

## The animation-compatibility guarantee (why it just works)

`public/assets/animation/UAL1_Standard.glb` is the Quaternius **Universal Animation Library**: a
skinned "Mannequin" mesh on a **65-bone Unreal-style skeleton** (`root, pelvis, spine_01/02/03,
neck_01, Head, clavicle/upperarm/lowerarm/hand_[lr]` + five finger chains each, `thigh/calf/foot/
ball_[lr]` + leaves) with **43 animation clips** (Idle_Loop, Walk_Loop, Jog_Fwd_Loop, Fixing_Kneeling,
PickUp_Table, Push_Loop, Sitting_*, Idle_Talking_Loop, Driving_Loop, …).

Rather than invent a skeleton and retarget, the pipeline **reuses that exact armature as the canonical
rig** (`rig.load_canonical_rig`): import the GLB, delete its meshes, bake the armature to an identity
Z-up transform so bone `head_local`/`tail_local` are directly usable world positions, and skin our own
body geometry to it. Because the bones are byte-identical in name, hierarchy, and rest pose, **every
clip binds by bone name for free** — in Blender (`mixer` deformation proven per clip) and in three.js
(`AnimationMixer.clipAction` resolves tracks like `pelvis.quaternion` by name). Exported character GLBs
carry the full **65 joints** + `JOINTS_0/WEIGHTS_0` (verified on the bytes).

> Rest pose is a clean **T-pose** (measured: arms horizontal at z≈1.44, head-top z≈1.65 → ~1.8 m with
> the head mesh). Bodies are built at that rest pose; clips reposition them.

## Construction (the deformation-safe method)

Locked from the design judge-panel (Concept A identity + Concept C deformation architecture). Per role,
`character.build_character`:

1. **Overlapping primitives** (`meshgen.MeshBuilder`) placed at the rig's rest joints — tapered
   cylinders/cones for limbs, boxes for torso, spheres at every joint (shoulder/elbow/hip/knee) so
   segments always overlap, an ovoid head, mitten hands, wedge shoes — plus **costume-silhouette
   volumes** baked into the same mesh (belt, vest, long coat, apron, satchel, cable coil).
2. **Voxel remesh** (`voxel_size 0.03`) fuses the overlapping parts into **one continuous skin**;
   stray islands removed; **decimate** to the ~2.3 k-tri budget; shade-smooth.
3. **Automatic bone-heat weights** (`ARMATURE_AUTO`) → **limit to 4 influences**. Auto-weights on a
   fused, joint-overlapping body deform cleanly under the full clip set — no candy-wrapper tearing
   (the failure mode of naïve rigid segments, which we tested and rejected).
4. **Region colour** by nearest-bone classification (`paint.paint_by_region`) into a single **vertex-
   colour** (COLOR_0) channel + one shared `mat_crew` material — skin on head/forearms/hands, shirt on
   torso, trousers on legs, leather on feet. Survives remesh (which collapses material slots) and keeps
   the crew to one draw call's worth of material.
5. **Face** = a curved card in front of the head, planar-UV'd, carrying a **procedural painted face
   texture** (numpy, seeded: skin, hairline, brows, eye-almonds + pupils, nose shadow, mouth, optional
   mustache), weighted 100 % to `Head`. **Headwear** (flat cap / hard hat / fedora / watch cap) as a
   separate Head-weighted mesh. Both are **joined** into the body → **one skinned mesh** per character.

`mesh.validate()` after the join guarantees clean export geometry.

## Roles are data

`character.ROLES` is a table — a new role is a row, not a new model. Each row sets body size
(standard / heavy), skin + hair tone, shirt/trousers palette, and which costume volumes + hat + face
seed apply. Role read is **silhouette + costume + palette** (per the bible, tint is the weakest
signal): the Director is tall in a long coat + fedora; the Electric is a heavy build in a hard hat with
a shoulder cable coil; the Carpenter wears an apron; the PA carries a satchel; Grip/Camera wear caps.

| Role | Build | Signature |
|---|---|---|
| Grip | standard | tool belt, flat cap, rolled sleeves |
| Electric / Gaffer | heavy | utility vest, **hard hat**, shoulder cable coil |
| Camera / DP | standard | trim silhouette, flat cap |
| Director | standard | **long coat** (tall read), fedora, grey hair |
| PA / Runner | standard | satchel across the chest |
| Carpenter / Set | heavy | **apron**, watch cap |

## Verification done

- **Blender headless:** each of Walk_Loop, Fixing_Kneeling, Sitting_Idle_Loop, PickUp_Table deforms a
  built body by 3–96 cm (measured max per-vertex displacement) — clips are genuinely driving the mesh.
- **Export:** all 6 character GLBs report **65 joints** with names matching `UAL1_Standard.glb`, all
  primitives skinned; tri counts 2.0–2.5 k (budget 6 k).
- **Runtime:** Scene G loads the character GLBs + the CC0 clip GLB and plays clips via `AnimationMixer`,
  console-error-free, with live motion (proof `11-anim-t0` ≠ `12-anim-t1`).

## Known limitations (honest)

- Fidelity is **stylized greybox-plus**, not final identity art — soft "action-figure" bodies, a
  flat-card face that reads at management distance (weak at extreme close-up).
- A few remesh stray specks can survive on some characters (cosmetic; cleanup pass is future work).
- Deep-flexion clips (deep crouch/sit) show the accepted stylized rigid-chunk read at the extremes.
- Hand props are **not** baked into characters — they are separate assets tagged with the target hand
  bone (`studio_attach`) for scene-side parenting; that parenting is future integration work.
