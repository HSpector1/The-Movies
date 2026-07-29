"""Asset Lab 05B iteration 4 — character LOD0/1/2 generation + validation + comparison renders.

Reuses lod.generate_lods (Decimate collapse, preserves vertex groups) + exporter.export_glb.
Validates that each tier keeps face-on-front, height, the skeleton, and connectivity.

  blender --background --factory-startup --python blender/build_char_lods.py -- [ROLE] [OUTDIR]
"""
import sys
from pathlib import Path
BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))

import bpy
import bmesh
from mathutils import Vector
from studio_pipeline import config, core, rig, character2, render, anim, lod, exporter

ARGV = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ROLE = ARGV[0] if len(ARGV) > 0 else "Electric"
OUT = Path(ARGV[1]) if len(ARGV) > 1 else (config.ROOT / "proof" / "lab05b" / "iteration-04")
OUT.mkdir(parents=True, exist_ok=True)

core.reset_scene()
render.warm_world(strength=0.55); render.sun(strength=2.6); render.fill(strength=0.6); render.ground(size=20)
sc = bpy.context.scene
sc.render.engine = "BLENDER_EEVEE"
sc.render.resolution_x = sc.render.resolution_y = 768
sc.render.image_settings.file_format = "PNG"
render.set_look(sc, exposure=-0.35)

arm = rig.load_canonical_rig(keep_actions=True)
obj = character2.build_character2(ROLE, arm, seed=1)


def islands(o):
    bm = bmesh.new(); bm.from_mesh(o.data); bm.verts.ensure_lookup_table()
    seen = set(); count = 0
    for v in bm.verts:
        if v.index in seen:
            continue
        count += 1; stack = [v]; seen.add(v.index)
        while stack:
            cur = stack.pop()
            for e in cur.link_edges:
                ov = e.other_vert(cur)
                if ov.index not in seen:
                    seen.add(ov.index); stack.append(ov)
    bm.free(); return count


def front_face_ok(o):
    """A proxy for face-on-front: the dark 'features' verts (material slot 4) must sit on -Y."""
    dark_polys = [p for p in o.data.polygons if p.material_index == character2.SLOT["dark"]]
    if not dark_polys:
        return None
    ys = []
    for p in dark_polys:
        for vi in p.vertices:
            ys.append((o.matrix_world @ o.data.vertices[vi].co).y)
    # head features live near z~1.6; most dark verts should be at -Y (front). report the mean.
    head_ys = [y for y in ys if y < -0.03]
    return (len(head_ys), round(sum(ys) / len(ys), 3))


lods = lod.generate_lods(obj, ratios=[1.0, 0.6, 0.35])
print(f"[LODs:{ROLE}]")
for tier, o in lods.items():
    mn, mx, size = core.world_bounds([o])
    ff = front_face_ok(o)
    print(f"  LOD{tier}: tris={core.triangle_count(o):5d} height={size.z:.3f} "
          f"vgroups={len(o.vertex_groups)} islands={islands(o)} feature_front={ff}")
    exporter.export_glb(OUT / f"Char_{ROLE}_LOD{tier}.glb", [arm, o], with_animations=False)

center = Vector((0, 0, 0.92)); DIST = 4.6
cam = render.camera((0, -DIST, center.z), center, lens=50)


def isolate(keep):
    for _, o in lods.items():
        o.hide_render = (o is not keep)


def shoot(name, camloc, tgt):
    cam.location = Vector(camloc)
    cam.rotation_euler = (Vector(tgt) - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = str(OUT / name); bpy.ops.render.render(write_still=True); print("  shot", name)


# rest: front + face close-up per LOD
for tier, o in lods.items():
    isolate(o)
    shoot(f"lod{tier}-front.png", (0, -DIST, center.z), (0, 0, center.z))
    shoot(f"lod{tier}-face.png", (0, -0.72, 1.66), (0, 0, 1.62))

# animated (walk) per LOD — confirm skinning survives decimation
anim.apply_action(arm, "Walk_Loop"); sc.frame_set(8); bpy.context.view_layer.update()
for tier, o in lods.items():
    isolate(o)
    shoot(f"lod{tier}-walk.png", (-DIST * 0.5, -DIST * 0.8, 1.3), (0, 0, 0.9))

print("LODS_BUILD_OK")
