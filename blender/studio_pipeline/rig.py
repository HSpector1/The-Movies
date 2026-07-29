"""Canonical rig: the Unreal/Quaternius UAL "Mannequin" armature (65 bones).

Characters skin to THIS exact armature so all 43 CC0 clips (in UAL1_Standard.glb) bind by
bone-name for free. We import the source GLB, isolate the armature, bake it to an identity,
Z-up transform so bone head/tail *_local coordinates are directly usable world positions,
and hand back the rest-pose joint table the character builder places geometry against.
"""
import bpy
from mathutils import Vector
from . import config, core


def load_canonical_rig(keep_actions=False):
    """Import UAL1_Standard.glb, delete its meshes, return the bare armature at rest.

    If keep_actions is False, purge the 43 imported actions (characters export without
    animation; the clip library is exported separately). Returns the armature object.
    """
    if not config.RIG_SOURCE_GLB.exists():
        raise FileNotFoundError(f"rig source missing: {config.RIG_SOURCE_GLB}")
    bpy.ops.import_scene.gltf(filepath=str(config.RIG_SOURCE_GLB))

    arm = next((o for o in bpy.data.objects if o.type == "ARMATURE"), None)
    if arm is None:
        raise RuntimeError("no armature in rig source")

    # drop the reference meshes (Mannequin, Icosphere) — we author our own bodies
    for o in list(bpy.data.objects):
        if o.type == "MESH":
            bpy.data.objects.remove(o, do_unlink=True)

    # bake the armature to identity world transform so *_local == world (Z-up, standing)
    arm.parent = None
    core.select_only(arm)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    if not keep_actions:
        for a in list(bpy.data.actions):
            bpy.data.actions.remove(a)
    return arm


def rest_points(arm):
    """bone_name -> {head, tail, center, length, dir} in world (== armature-local) space."""
    pts = {}
    for b in arm.data.bones:
        head = b.head_local.copy()
        tail = b.tail_local.copy()
        d = (tail - head)
        pts[b.name] = {
            "head": head,
            "tail": tail,
            "center": (head + tail) * 0.5,
            "length": d.length,
            "dir": d.normalized() if d.length > 1e-9 else Vector((0, 0, 1)),
        }
    return pts


def bone_names(arm):
    return [b.name for b in arm.data.bones]
