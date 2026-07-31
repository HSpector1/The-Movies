"""Asset Lab 05H — PROBE: measure the CC0 base mesh against the canonical 65-bone UAL
armature and render a rest-pose comparison (armature's own Mannequin reference vs our base
mesh). Read-only planning aid; writes proof to proof/lab05h/workflow-audit/. No bind here.
"""
import bpy, sys, math
from pathlib import Path
BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))
from studio_pipeline import config, core, render
from mathutils import Vector

BASE_GLB = config.ROOT / "licenses" / "asset-lab-05h" / "human_base_male_stylized_cc0.glb"
PROOF = config.ROOT / "proof" / "lab05h" / "workflow-audit"

core.reset_scene()
# import the rig source RAW (keep Mannequin ref + actions)
bpy.ops.import_scene.gltf(filepath=str(config.RIG_SOURCE_GLB))
arm = next(o for o in bpy.data.objects if o.type == "ARMATURE")
mannequin = next((o for o in bpy.data.objects if o.type == "MESH"), None)

print("PROBE_BEGIN")
print("  bones:", len(arm.data.bones))
acts = sorted(a.name for a in bpy.data.actions)
need = ["Idle_Loop","Walk_Loop","Idle_Talking_Loop","Sitting_Idle_Loop","PickUp_Table","Fixing_Kneeling"]
print("  actions total:", len(acts))
print("  required clips present:", {n: (n in acts) for n in need})

def wpos(bone_name, end="head"):
    b = arm.data.bones.get(bone_name)
    if not b: return None
    v = b.head_local if end == "head" else b.tail_local
    return arm.matrix_world @ v

key = ["pelvis","spine_01","spine_02","spine_03","neck_01","Head",
       "clavicle_l","upperarm_l","lowerarm_l","hand_l","thigh_l","calf_l","foot_l","ball_l"]
print("  armature key joints (world):")
for k in key:
    p = wpos(k)
    if p: print(f"    {k:12s} ({p.x:+.3f},{p.y:+.3f},{p.z:+.3f})")

# armature arm axis (upperarm_l head -> hand_l head): angle below horizontal
ua, ha = wpos("upperarm_l"), wpos("hand_l")
if ua and ha:
    d = (ha - ua); horiz = math.degrees(math.atan2(-d.z, math.hypot(d.x, d.y)))
    print(f"  armature L-arm span x={d.x:+.3f} z={d.z:+.3f}  angle_below_horizontal={horiz:.1f} deg")

# armature head-top estimate + shoulder width
head = wpos("Head"); print("  armature Head joint z:", round(head.z,3) if head else None)
cl, cr = wpos("clavicle_l"), wpos("clavicle_r")
if cl and cr: print(f"  armature clavicle span x: {abs(cl.x-cr.x):.3f}")

if mannequin:
    mn, mx, sz = core.world_bounds([mannequin])
    print(f"  Mannequin ref: vgroups={len(mannequin.vertex_groups)} bbox X[{mn.x:+.3f},{mx.x:+.3f}] Z[{mn.z:+.3f},{mx.z:+.3f}] h={sz.z:.3f}")

# import base mesh
before = set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=str(BASE_GLB))
base = next(o for o in (set(bpy.data.objects) - before) if o.type == "MESH")
mn, mx, sz = core.world_bounds([base])
print(f"  BASE mesh: bbox X[{mn.x:+.3f},{mx.x:+.3f}] Y[{mn.y:+.3f},{mx.y:+.3f}] Z[{mn.z:+.3f},{mx.z:+.3f}] h={sz.z:.3f}")

# --- rest-pose comparison render: Mannequin (left) vs base (right) ---
grey = bpy.data.materials.new("probe_grey"); grey.use_nodes = True
grey.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.6,0.6,0.62,1)
def flat(o, offx):
    o.data.materials.clear(); o.data.materials.append(grey)
    o.location.x += offx
for o in ([mannequin] if mannequin else []): flat(o, -0.6)
flat(base, +0.6)
# hide the armature display
arm.hide_render = True

render.neutral_world(); render.sun(); render.fill(); render.ground()
render.setup(res=(1400, 1000), samples=48)
PROOF.mkdir(parents=True, exist_ok=True)
render.camera((0, -6.2, 1.15), (0, 0, 1.0), lens=60)
render.render_to(str(PROOF / "probe-rest-front.png"))
render.camera((6.2, 0.0, 1.15), (0, 0, 1.0), lens=60)
render.render_to(str(PROOF / "probe-rest-side.png"))
print("  wrote probe-rest-front.png / probe-rest-side.png")
print("PROBE_END")
