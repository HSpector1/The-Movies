"""Apply / sample the CC0 clip library on a rigged character — for proof + vertical-slice.

Handles Blender 4.4+ slotted actions. Nothing here is exported onto characters; it exists to
VERIFY (headless) that a character actually deforms under the 43 clips, and to pose the hero
character for renders.
"""
import bpy
from mathutils import Vector


def apply_action(arm, name):
    act = bpy.data.actions.get(name)
    if act is None:
        raise KeyError(f"action not found: {name}")
    if arm.animation_data is None:
        arm.animation_data_create()
    ad = arm.animation_data
    ad.action = act
    # Blender 4.4+ slotted actions: bind the first slot so the channels evaluate
    try:
        slots = getattr(act, "slots", None)
        if slots and len(slots) > 0 and hasattr(ad, "action_slot"):
            ad.action_slot = slots[0]
    except Exception as e:  # pragma: no cover
        print("[anim] slot bind warning:", e)
    return act


def eval_world_positions(obj):
    bpy.context.view_layer.update()          # force modifier (armature) re-eval at this frame
    dg = bpy.context.evaluated_depsgraph_get()
    ev = obj.evaluated_get(dg)
    me = ev.to_mesh()
    mw = obj.matrix_world
    coords = [(mw @ v.co).copy() for v in me.vertices]
    ev.to_mesh_clear()
    return coords


def max_deformation(obj, arm, action_name, frames):
    """Max per-vertex displacement (metres) between the rest frame and any sampled frame.

    A value well above zero proves the clip actually drives the skinned mesh.
    """
    scene = bpy.context.scene
    apply_action(arm, action_name)
    scene.frame_set(int(frames[0]))
    base = eval_world_positions(obj)
    worst = 0.0
    for f in frames[1:]:
        scene.frame_set(int(f))
        cur = eval_world_positions(obj)
        for a, b in zip(base, cur):
            d = (a - b).length
            if d > worst:
                worst = d
    return worst
