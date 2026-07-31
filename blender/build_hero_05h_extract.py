"""Asset Lab 05H — extract ONE CC0 base body mesh from the Blender Studio Human Base
Meshes bundle (CC0 1.0, Blender Foundation) into a clean, committable GLB.

This is the ONLY imported third-party geometry in 05H. Provenance: see
licenses/asset-lab-05h/PROVENANCE.json. The bundle .zip is preserved (gitignored) under
sources/asset-lab-05h/; its sha256 is recorded in the provenance file.

We take GEO-body_male_stylized (all-quad, ~12.5k faces, ~1.80 m), drop the SUBSURF cage
(keep the editable base cage) and MASK modifiers (show the full body), apply any remaining
generative modifiers, ground it (min z = 0, X-centred), and export just that one mesh.

  blender --background --factory-startup --python blender/build_hero_05h_extract.py
"""
import bpy, sys
from pathlib import Path
BLENDER_DIR = Path(__file__).resolve().parent
ROOT = BLENDER_DIR.parent
BUNDLE = Path("/tmp/hbm05h/human_base_meshes_bundle.blend")
OUT = ROOT / "licenses" / "asset-lab-05h" / "human_base_male_stylized_cc0.glb"
SRC_OBJ = "GEO-body_male_stylized"

bpy.ops.wm.open_mainfile(filepath=str(BUNDLE))
obj = bpy.data.objects.get(SRC_OBJ)
assert obj, f"missing {SRC_OBJ}"

print("EXTRACT_BEGIN")
print("  modifiers on source:")
for m in obj.modifiers:
    print(f"    {m.type:12s} {m.name!r} show_viewport={m.show_viewport} show_render={m.show_render}")

# Keep the editable base cage: drop SUBSURF (no smoothing multiply) and MASK (reveal full body).
for m in list(obj.modifiers):
    if m.type in {"SUBSURF", "MASK"}:
        obj.modifiers.remove(m)

# Isolate + apply remaining modifiers (e.g. MIRROR) by converting to a plain mesh.
for o in list(bpy.data.objects):
    o.select_set(False)
obj.select_set(True)
bpy.context.view_layer.objects.active = obj
bpy.ops.object.convert(target="MESH")   # applies remaining modifiers
obj = bpy.context.view_layer.objects.active

# Ground it: min z -> 0, centre X on 0 (keep Y as authored).
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
me = obj.data
xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]; zs = [v.co.z for v in me.vertices]
cx = (min(xs) + max(xs)) / 2.0
dz = min(zs)
for v in me.vertices:
    v.co.x -= cx
    v.co.z -= dz
me.update()

# Report final geometry.
xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]; zs = [v.co.z for v in me.vertices]
quads = sum(1 for p in me.polygons if len(p.vertices) == 4)
tris_n = sum(1 for p in me.polygons if len(p.vertices) == 3)
ngons = sum(1 for p in me.polygons if len(p.vertices) > 4)
tri_total = sum(len(p.vertices) - 2 for p in me.polygons)
print(f"  final verts={len(me.vertices)} faces={len(me.polygons)} quads={quads} tris={tris_n} ngons={ngons} tri_total={tri_total}")
print(f"  bbox X[{min(xs):.3f},{max(xs):.3f}] Y[{min(ys):.3f},{max(ys):.3f}] Z[{min(zs):.3f},{max(zs):.3f}]  height={max(zs)-min(zs):.3f}")
# widest verts (arm pose hint): the max-|x| vert and its z
vx = max(me.vertices, key=lambda v: abs(v.co.x))
print(f"  widest vert x={vx.co.x:.3f} at z={vx.co.z:.3f} (z-frac {(vx.co.z-min(zs))/(max(zs)-min(zs)):.2f})")

OUT.parent.mkdir(parents=True, exist_ok=True)
for o in list(bpy.data.objects):
    o.select_set(o is obj)
bpy.context.view_layer.objects.active = obj
bpy.ops.export_scene.gltf(
    filepath=str(OUT), export_format="GLB", use_selection=True,
    export_yup=True, export_apply=True, export_materials="NONE",
    export_normals=True, export_skins=False, export_animations=False,
)
print(f"  wrote {OUT}  ({OUT.stat().st_size} bytes)")
print("EXTRACT_END")
