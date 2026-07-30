"""Asset Lab 05B — build the ONE base character (character2) and render a validation grid:
front / back / left / right / three-quarter, plus posed frames under real CC0 clips. Exports a
GLB for byte inspection. Base must pass before role variants (contract 05B section 13).

  blender --background --factory-startup --python blender/build_base_char.py -- [ROLE] [OUTDIR]
"""
import sys, math
from pathlib import Path
BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))

import bpy
from mathutils import Vector
from studio_pipeline import config, core, rig, character2, render, anim, exporter

ARGV = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ROLE = ARGV[0] if len(ARGV) > 0 else "PA"
OUT = Path(ARGV[1]) if len(ARGV) > 1 else (config.ROOT / "proof" / "lab05b" / "iteration-01")
OUT.mkdir(parents=True, exist_ok=True)

core.reset_scene()
render.neutral_world(strength=0.6)          # 05C: neutral studio, not the overexposed warm sky
render.sun(strength=2.1)
render.fill(strength=0.5)
render.rim(strength=1.3)
render.backdrop()
render.ground(size=40, color=(0.42, 0.43, 0.46))   # visible neutral floor so foot grounding reads
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = scene.render.resolution_y = 768
scene.render.image_settings.file_format = "PNG"
render.set_look(scene, exposure=-0.55)   # not overexposed; skin/clothes separate

arm = rig.load_canonical_rig(keep_actions=True)
obj = character2.build_character2(ROLE, arm, seed=1)

tris = core.triangle_count(obj)
mn, mx, size = core.world_bounds([obj])
print(f"[base:{ROLE}] tris={tris}  height={size.z:.3f}m  bounds X={size.x:.2f} Y={size.y:.2f}")
print(f"  vertex groups: {len(obj.vertex_groups)}  materials: {len(obj.data.materials)}")

# FIXED generous frame that always contains a ~1.8 m figure standing/kneeling near origin,
# so posed shots are honest (armature deform is NOT reflected in obj.bound_box, so we cannot
# auto-frame per pose without evaluating the mesh; a fixed frame avoids cropping fragments).
center = Vector((0, 0, 0.92))
DIST = 4.6
cam = render.camera((0, -DIST, center.z), center, lens=50)

def eval_minmax_z(o):
    dg = bpy.context.evaluated_depsgraph_get()
    ev = o.evaluated_get(dg); me = ev.to_mesh()
    zs = [(o.matrix_world @ v.co).z for v in me.vertices]
    ev.to_mesh_clear()
    return (min(zs), max(zs)) if zs else (0, 0)

def shoot(name, dirv, elev=0.10):
    d = Vector(dirv).normalized()
    cam.location = center + d * DIST + Vector((0, 0, elev * DIST))
    look = center - cam.location
    cam.rotation_euler = look.to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = str(OUT / f"{name}.png")
    bpy.ops.render.render(write_still=True)
    print("  shot", name)

# neutral rest pose (T-pose) — the raw build
shoot("base-front", (0, -1, 0))
shoot("base-back",  (0, 1, 0))
shoot("base-left",  (-1, 0, 0))
shoot("base-right", (1, 0, 0))
shoot("base-3q",    (-0.8, -1, 0))
shoot("base-3q-rear", (0.8, 1, 0))
# head close-ups (face must be on -Y front)
head_c = Vector((0, 0, size.z * 0.92))
cam.location = head_c + Vector((0, -0.7, 0.05)); cam.rotation_euler = (head_c - cam.location).to_track_quat("-Z", "Y").to_euler()
scene.render.filepath = str(OUT / "base-face-front.png"); bpy.ops.render.render(write_still=True); print("  shot base-face-front")
cam.location = head_c + Vector((0, 0.7, 0.05)); cam.rotation_euler = (head_c - cam.location).to_track_quat("-Z", "Y").to_euler()
scene.render.filepath = str(OUT / "base-face-back.png"); bpy.ops.render.render(write_still=True); print("  shot base-face-back")
# hand close-up (left hand at T-pose extent) + lower-body close-up (trousers/boots read)
hand_t = Vector((size.x * 0.5 - 0.06, 0, 1.46))
# above-front-3q view (side-on hid the fingers along the arm axis; this shows the fan + knuckles)
cam.location = hand_t + Vector((0.10, -0.30, 0.30)); cam.rotation_euler = (hand_t - cam.location).to_track_quat("-Z", "Y").to_euler()
scene.render.filepath = str(OUT / "base-hand.png"); bpy.ops.render.render(write_still=True); print("  shot base-hand")
low_t = Vector((0, 0, 0.5))
cam.location = low_t + Vector((0, -1.7, 0.15)); cam.rotation_euler = (low_t - cam.location).to_track_quat("-Z", "Y").to_euler()
scene.render.filepath = str(OUT / "base-lowerbody.png"); bpy.ops.render.render(write_still=True); print("  shot base-lowerbody")

# posed under the SIX required clips — proper framing + feet-grounding numbers
def pose(action, frame):
    try:
        anim.apply_action(arm, action)
        scene.frame_set(int(frame))
        bpy.context.view_layer.update()
    except Exception as e:
        print("  pose fail", action, e)

SIX = [("Idle_Loop", 24, "idle"), ("Walk_Loop", 8, "walk"), ("Idle_Talking_Loop", 30, "talk"),
       ("Sitting_Idle_Loop", 30, "sit"), ("PickUp_Table", 20, "pickup"), ("Fixing_Kneeling", 40, "kneel")]
for action, frame, tag in SIX:
    if bpy.data.actions.get(action):
        pose(action, frame)
        zmin, zmax = eval_minmax_z(obj)
        print(f"  [{tag}] deformed z-range {zmin:+.3f}..{zmax:+.3f} (foot grounding: min z should be ~0)")
        shoot(f"pose-{tag}-front", (0, -1, 0))
        shoot(f"pose-{tag}-3q", (-0.8, -1, 0.14))
    else:
        print(f"  MISSING CLIP: {action}")

# rest again then export
if arm.animation_data:
    arm.animation_data.action = None
scene.frame_set(0)
z0, z1 = eval_minmax_z(obj)
print(f"  [rest] deformed z-range {z0:+.3f}..{z1:+.3f}")
glb = OUT / f"Char_{ROLE}_probe.glb"
exporter.export_glb(glb, [arm, obj], with_animations=False)
print("  exported", glb, glb.stat().st_size, "bytes")
print("BASE_BUILD_OK")
