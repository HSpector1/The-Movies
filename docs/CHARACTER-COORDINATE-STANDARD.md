# Character Coordinate Standard (Asset Lab 05B)

**The single authoritative convention. There are NO undocumented compensating rotations.**

## Measured ground truth

The canonical rig is the Quaternius UAL "Mannequin" (65 bones), imported from
`public/assets/animation/UAL1_Standard.glb`, transform-applied to identity (Z-up).
Its forward direction was **measured empirically** (see `blender/probe_orientation.py`), two
independent ways that agree:

| Probe | Result |
|-------|--------|
| `ball_l` bone head→tail (toes) | direction **(0, −1, 0)** → toes point **−Y** |
| Frontmost head vertex (nose) | on the **−Y** side (−Y extent 0.120 m > +Y 0.110 m) |

→ **The rig faces −Y in Blender.** (Height 1.829 m, matches the 1.8 m adult reference.)

## The one conversion

```
Blender/rig FORWARD = −Y   (author every face/clothing-front/accessory on the −Y hemisphere)
        │
        │  glTF export with export_yup=True   (Blender (x,y,z) → glTF (x, z, −y))
        ▼
glTF / three.js FORWARD = +Z
        │
        │  runtime: <group rotation={[0, rotY, 0]}>   (rotY = 0 faces +Z)
        ▼
Scene G camera sits at large +Z looking toward −Z → a rotY=0 crew member faces the camera.
```

Because the character is authored in the mannequin's **native** facing, the CC0 clips move it in
the direction it faces (walk travels −Y in Blender = +Z in three.js = the way the face points).
**Animation direction and facing direction agree by construction.**

## Rules (enforced)

1. Author all front-side geometry (eyes, brows, nose, mouth, clothing front, belt pouch, hat
   bill/peak/brim) on **−Y**. `character2.py` does this via `FORWARD = (0,−1,0)` and
   `fy = head_center.y − 0.092`.
2. **Do NOT** set `armature.rotation_euler = (0,0,π)` at build time. (The rejected Lab-05
   `build_all.py:117` did this to drag a wrongly-placed +Y face toward the camera — a stacked
   180° that made runtime facing unpredictable. It is removed from the 05B path.)
3. Exactly one axis conversion: `export_yup=True`. No per-layer rotation compensation.
4. The exported GLB's mesh node and armature root carry **identity** rotation (verified: no node
   carries a ~180° hack rotation; only UAL bind-pose joints carry their standard quaternions).

## Orientation test

`blender/probe_orientation.py` renders FRONT/BACK/LEFT/RIGHT/3-quarter of the reference
mannequin and prints the measured forward axis. The character face test (`base-face-front` vs
`base-face-back`) confirms features appear only on the −Y hemisphere and never on the back.
A machine check is added in the character validation suite (see CHARACTER-RIGGING-AND-WEIGHTS).
