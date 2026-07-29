"""DIAGNOSTIC: find which vertices shard under animation and which bones they're weighted to."""
import sys
from pathlib import Path
BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))
import bpy
from studio_pipeline import config, core, rig, character2, anim

core.reset_scene()
arm = rig.load_canonical_rig(keep_actions=True)
obj = character2.build_character2("PA", arm, seed=1)

# rest positions
rest = [obj.matrix_world @ v.co for v in obj.data.vertices]
grp_names = {g.index: g.name for g in obj.vertex_groups}

# per-vertex weight map
def vgroups(v):
    return {grp_names[ge.group]: round(ge.weight, 2) for ge in v.groups}

# apply idle, evaluate deformed
anim.apply_action(arm, "Idle_Loop")
bpy.context.scene.frame_set(24)
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
ev = obj.evaluated_get(dg); me = ev.to_mesh()
disp = []
for i, v in enumerate(me.vertices):
    d = (obj.matrix_world @ v.co - rest[i]).length
    disp.append((d, i))
ev.to_mesh_clear()
disp.sort(reverse=True)
print("TOP DISPLACED VERTS (idle):")
for d, i in disp[:14]:
    print(f"  v{i:4d} disp={d:.3f}m  rest={tuple(round(x,2) for x in rest[i])}  groups={vgroups(obj.data.vertices[i])}")

# also: how many verts have NO group, or groups summing far from 1
noG = [i for i, v in enumerate(obj.data.vertices) if len(v.groups) == 0]
badsum = [i for i, v in enumerate(obj.data.vertices) if abs(sum(ge.weight for ge in v.groups) - 1.0) > 0.05]
print(f"verts with NO group: {len(noG)}   verts weight-sum != 1: {len(badsum)}")
if noG[:6]:
    print("  no-group examples:", [(i, tuple(round(x,2) for x in rest[i])) for i in noG[:6]])
print("DIAG_OK")
