"""DIAGNOSTIC (Asset Lab 05B): empirically determine the UAL Mannequin's true forward axis,
render clean reference shots of the reference mannequin, and sample the Walk clip's travel
direction. This nails the ONE authoritative coordinate convention (contract 05B section 8)
before any character geometry is authored. Not committed as pipeline; converted into the
character-coordinate standard + orientation test.

  blender --background --factory-startup --python blender/probe_orientation.py
"""
import sys, math
from pathlib import Path
BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))

import bpy
from mathutils import Vector
from studio_pipeline import config, core, render

OUT = config.ROOT / "proof" / "lab05b" / "root-cause"
OUT.mkdir(parents=True, exist_ok=True)

core.reset_scene()
bpy.ops.import_scene.gltf(filepath=str(config.RIG_SOURCE_GLB))
arm = next((o for o in bpy.data.objects if o.type == "ARMATURE"), None)
mann = next((o for o in bpy.data.objects if o.type == "MESH" and "Mann" in o.name), None)
if mann is None:
    mann = next((o for o in bpy.data.objects if o.type == "MESH"), None)
print("ARMATURE:", arm.name if arm else None, "| MESH:", mann.name if mann else None)

# --- bone-based forward: ball bone points toward the toes (forward+down) ---
def bhead(n): return arm.data.bones[n].head_local.copy()
def btail(n): return arm.data.bones[n].tail_local.copy()

toe_dir = None
for foot, ball in (("foot_l", "ball_l"), ("foot_r", "ball_r")):
    if foot in arm.data.bones and ball in arm.data.bones:
        d = (btail(ball) - bhead(ball))
        d.z = 0
        if d.length > 1e-6:
            toe_dir = d.normalized()
            print(f"  toe dir from {ball}: ({toe_dir.x:+.3f}, {toe_dir.y:+.3f}, {toe_dir.z:+.3f})")
            break

# --- mesh-based forward: nose is the frontmost head vertex along the horizontal ---
world = mann.matrix_world
head_z = bhead("Head").z if "Head" in arm.data.bones else 1.6
head_vs = [world @ v.co for v in mann.data.vertices if (world @ v.co).z > head_z]
if head_vs:
    cx = sum(v.x for v in head_vs) / len(head_vs)
    cy = sum(v.y for v in head_vs) / len(head_vs)
    # frontmost along +Y and -Y
    ext_py = max(v.y for v in head_vs) - cy
    ext_ny = cy - min(v.y for v in head_vs)
    ext_px = max(v.x for v in head_vs) - cx
    ext_nx = cx - min(v.x for v in head_vs)
    print(f"  head extents  +Y={ext_py:.3f} -Y={ext_ny:.3f}  +X={ext_px:.3f} -X={ext_nx:.3f}")
    face_axis = "+Y" if ext_py > ext_ny else "-Y"
    print(f"  nose (frontmost head vtx) suggests FACE toward: {face_axis}")

# --- full-body bounds / height ---
mn, mx, size = core.world_bounds([mann])
print(f"  mannequin bounds min={tuple(round(x,3) for x in mn)} max={tuple(round(x,3) for x in mx)}")
print(f"  height(Z)={size.z:.3f} m  width(X)={size.x:.3f}  depth(Y)={size.y:.3f}")

# --- walk-clip travel direction (does the character move where it faces?) ---
walk = bpy.data.actions.get("Walk_Loop")
if walk and arm.animation_data is None:
    arm.animation_data_create()
if walk:
    arm.animation_data.action = walk
    try:
        slots = getattr(walk, "slots", None)
        if slots and hasattr(arm.animation_data, "action_slot"):
            arm.animation_data.action_slot = slots[0]
    except Exception as e:
        print("  slot bind:", e)
    fr = walk.frame_range
    print(f"  Walk_Loop frames {fr[0]:.0f}..{fr[1]:.0f}")

# --- render reference mannequin from 4 sides (proves render works + gives reference) ---
# engine detection: Blender 5.x uses BLENDER_EEVEE_NEXT
def pick_engine():
    try:
        prop = bpy.types.RenderSettings.bl_rna.properties["engine"]
        ids = [e.identifier for e in prop.enum_items]
    except Exception:
        ids = []
    for cand in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE", "CYCLES", "BLENDER_WORKBENCH"):
        if cand in ids:
            return cand, ids
    return "BLENDER_WORKBENCH", ids

eng, ids = pick_engine()
print("  available engines:", ids)
print("  chosen engine:", eng)

render.warm_world(strength=0.7)
render.sun(strength=3.0)
render.fill(strength=0.6)
render.ground(size=20)
scene = bpy.context.scene
scene.render.engine = eng
scene.render.resolution_x = scene.render.resolution_y = 768
scene.render.image_settings.file_format = "PNG"
if eng == "CYCLES":
    scene.cycles.samples = 32; scene.cycles.device = "CPU"
render.set_look(scene, exposure=0.0)

center = Vector(((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, (mn.z + mx.z) / 2))
radius = max(size.length * 0.5, 1.0)
cam = render.camera((0, -radius * 2.4, center.z + 0.2), center, lens=55)

# camera positions: front (-Y), back (+Y), left (-X), right (+X), threeq (-X,-Y)
views = {
    "mann-front": Vector((0, -1, 0)),
    "mann-back":  Vector((0, 1, 0)),
    "mann-left":  Vector((-1, 0, 0)),
    "mann-right": Vector((1, 0, 0)),
    "mann-3q":    Vector((-0.8, -1, 0)),
}
for name, dirv in views.items():
    d = dirv.normalized()
    cam.location = center + d * radius * 2.4 + Vector((0, 0, 0.15))
    look = center - cam.location
    cam.rotation_euler = look.to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = str(OUT / f"{name}.png")
    bpy.ops.render.render(write_still=True)
    print("  rendered", name)

print("PROBE_OK")
