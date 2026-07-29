"""LOD + collision standard (Asset Lab 05).

LOD: three tiers via the Decimate (collapse) modifier, which preserves vertex groups so ONE
animation instance drives any character LOD. Names carry _LOD0/_LOD1/_LOD2.
Collision: a SEPARATE convex low-poly proxy (<~50 tris) named <asset>_COL — an upright capsule
for characters, a box for grid modules/small props, a convex hull otherwise. Presentation-only
spec convention: NO physics is built in this lab (isolation).
"""
import math
import bmesh
import bpy
from mathutils import Matrix
from . import config, core
from .meshgen import MeshBuilder, T, R


def _dup(obj, name):
    me = obj.data.copy()
    new = bpy.data.objects.new(name, me)
    for c in obj.users_collection:
        c.objects.link(new)
    new.matrix_world = obj.matrix_world.copy()
    return new


def decimate_ratio(obj, ratio):
    core.select_only(obj)
    d = obj.modifiers.new("Dec", "DECIMATE")
    d.decimate_type = "COLLAPSE"
    d.ratio = ratio
    d.use_collapse_triangulate = True
    bpy.ops.object.modifier_apply(modifier=d.name)
    return obj


def generate_lods(obj, ratios=None):
    """Return {tier: object}. Tier 0 is `obj` (renamed _LOD0); 1..n are decimated duplicates.

    Vertex groups + parenting are duplicated, so skinned LODs animate from the same clips.
    """
    ratios = ratios or config.LOD_RATIOS
    base = obj.name
    obj.name = base + config.LOD_SUFFIX[0]
    out = {0: obj}
    t0 = core.triangle_count(obj)
    for i in range(1, len(ratios)):
        lod = _dup(obj, base + config.LOD_SUFFIX[i])
        # copy vertex groups membership comes with mesh copy; also copy modifiers/parent for skin
        lod.parent = obj.parent
        for m in obj.modifiers:
            if m.type == "ARMATURE":
                am = lod.modifiers.new("Armature", "ARMATURE")
                am.object = m.object
        target = ratios[i] / ratios[0]
        if t0 > 4:
            decimate_ratio(lod, max(0.02, target))
        out[i] = lod
    return out


def _hull(obj, name):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    res = bmesh.ops.convex_hull(bm, input=bm.verts, use_existing_faces=False)
    interior = set(res.get("geom_interior", [])) | set(res.get("geom_unused", []))
    if interior:
        bmesh.ops.delete(bm, geom=list(interior), context="VERTS")
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    new = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(new)
    new.matrix_world = obj.matrix_world.copy()
    return new


def _box_proxy(obj, name):
    mn, mx, size = core.world_bounds([obj])
    center = (mn + mx) * 0.5
    mb = MeshBuilder()
    mb.add_box(size=(max(size.x, 0.05), max(size.y, 0.05), max(size.z, 0.05)), matrix=T(*center))
    new = mb.finish(name)
    bpy.context.scene.collection.objects.link(new)
    return new


def _capsule_proxy(name, width=0.44, height=1.80):
    r = width / 2
    mb = MeshBuilder()
    mb.add_cylinder(r, height - width, segments=10, matrix=T(0, 0, height / 2))
    mb.add_sphere(r, subdivisions=1, matrix=T(0, 0, height - r))
    mb.add_sphere(r, subdivisions=1, matrix=T(0, 0, r))
    new = mb.finish(name)
    bpy.context.scene.collection.objects.link(new)
    return new


def collision_proxy(obj, cls):
    """Build the collision proxy for `obj` per its class. Returns the proxy object."""
    name = obj.name.split(config.LOD_SUFFIX[0])[0] + config.COLLISION_SUFFIX
    if cls == "character":
        prox = _capsule_proxy(name)
    elif cls in config.COLLISION_BOX_CLASSES:
        prox = _box_proxy(obj, name)
    else:
        prox = _hull(obj, name)
    core.set_custom_props(prox, {"studio_class": "collision", "studio_for": obj.name})
    return prox
