"""Assemble the vertical-slice HERO SET (static) and export one GLB the R3F Scene G loads:
an assembled soundstage from the kit + a concrete apron + dressed production props. Crew are
NOT baked in here — they load separately in Scene G so they can play the CC0 clips live.

  npm run blender:hero   ->   public/assets/studio/scenes/studio_hero_set.glb
"""
import sys, math
from pathlib import Path
BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))

import bpy
from mathutils import Vector
from studio_pipeline import config, core, architecture as A, props as PR, exporter

core.reset_scene()
mats, maps = A.kit_materials()

parts = []
# soundstage centred, doors toward -Y (front / camera side)
parts += A.assemble_soundstage(mats, maps, origin=(0, 2.0, 0), bays=3)

# concrete apron tiles in front of the doors (-Y)
for gx in (-1, 0, 1):
    for gy in (0, 1):
        t = A.ground_tile(mats); t.location = Vector((gx * 8.0, -8.0 - gy * 8.0, 0.0)); parts.append(t)

# a boundary wall run + gate + water tower to frame the lot
gate = A.marquee_gate(mats); gate.location = Vector((0, -20.0, 0)); parts.append(gate)
wt = A.water_tower(mats); wt.location = Vector((-16.0, -2.0, 0)); parts.append(wt)
for i in range(3):
    w = A.boundary_wall(mats); w.location = Vector((12.0, -20.0 + i * 2.0, 0)); parts.append(w)

# dressed production props on the apron
lib = PR.materials.library()
def prop(fn, loc, rot=0.0):
    o = fn(lib); o.location = Vector(loc); o.rotation_euler = (0, 0, rot); parts.append(o); return o

prop(PR.studio_camera, (-3.5, -9.0, 0), 0.3)
prop(PR.fresnel_light, (3.5, -8.0, 0), -0.4)
prop(PR.fresnel_light, (-5.5, -11.0, 0), 0.6)
prop(PR.c_stand, (2.0, -11.0, 0), 0.0)
prop(PR.apple_box, (-1.5, -7.5, 0), 0.2)
prop(PR.apple_box, (-1.1, -7.5, 0.203), 0.5)
prop(PR.directors_chair, (5.5, -12.0, 0), -0.8)
prop(PR.cable_reel, (6.5, -9.5, 0), 0.0)

meshes = [p for p in parts if p.type == "MESH"]
tot = sum(core.triangle_count(m) for m in meshes)
out = config.STUDIO_OUT / "scenes" / "studio_hero_set.glb"
exporter.export_glb(out, meshes)
print(f"HERO SET: {len(meshes)} meshes, {tot} tris -> {out}")
print("HERO_OK")
