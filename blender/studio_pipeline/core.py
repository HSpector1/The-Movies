"""Core Blender-scene helpers: reset, collections, object linking, modifiers, transforms.

Headless-safe. Prefers explicit data-API + bmesh over context-sensitive `bpy.ops` wherever
practical, so scripts behave identically with or without a UI.
"""
import bpy


def reset_scene():
    """Empty factory scene, metric units, +Z up world. The clean slate for every build."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    return scene


def ensure_collection(name, parent=None):
    """Get-or-create a collection linked under `parent` (scene collection if None)."""
    coll = bpy.data.collections.get(name)
    if coll is None:
        coll = bpy.data.collections.new(name)
    target = parent if parent is not None else bpy.context.scene.collection
    if coll.name not in [c.name for c in target.children]:
        try:
            target.children.link(coll)
        except RuntimeError:
            pass
    return coll


def link_object(obj, collection):
    """Link `obj` to exactly `collection` (unlink from any others)."""
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    collection.objects.link(obj)
    return obj


def deselect_all():
    for o in bpy.data.objects:
        o.select_set(False)


def select_only(objs):
    """Select exactly `objs` (list or single) and make the first active."""
    if not isinstance(objs, (list, tuple)):
        objs = [objs]
    deselect_all()
    for o in objs:
        o.select_set(True)
    if objs:
        bpy.context.view_layer.objects.active = objs[0]
    return objs


def set_custom_props(obj, props: dict):
    """Attach custom properties (exported as glTF extras) — asset role/class/provenance."""
    for k, v in props.items():
        obj[k] = v
    return obj


def apply_transforms(obj, location=True, rotation=True, scale=True):
    select_only(obj)
    bpy.ops.object.transform_apply(location=location, rotation=rotation, scale=scale)
    return obj


def join_objects(objs, name=None):
    """Join a list of mesh objects into the first; returns the surviving object."""
    objs = [o for o in objs if o is not None]
    if not objs:
        return None
    if len(objs) == 1:
        if name:
            objs[0].name = name
        return objs[0]
    select_only(objs)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    survivor = objs[0]
    if name:
        survivor.name = name
    return survivor


def add_modifier_apply(obj, mtype, **kwargs):
    """Add a modifier, set kwargs, and apply it (baking it into the mesh)."""
    mod = obj.modifiers.new(name=mtype, type=mtype)
    for k, v in kwargs.items():
        setattr(mod, k, v)
    select_only(obj)
    bpy.ops.object.modifier_apply(modifier=mod.name)
    return obj


def triangle_count(obj):
    """Exact triangle count after triangulating the evaluated mesh (read-only)."""
    me = obj.data
    total = 0
    for poly in me.polygons:
        n = len(poly.vertices)
        total += max(0, n - 2)
    return total


def remove_small_islands(obj, min_verts=20):
    """Delete disconnected mesh islands smaller than min_verts (voxel-remesh stray specks)."""
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    seen = set()
    to_delete = []
    for v in bm.verts:
        if v.index in seen:
            continue
        # flood fill this island
        stack = [v]
        island = []
        seen.add(v.index)
        while stack:
            cur = stack.pop()
            island.append(cur)
            for e in cur.link_edges:
                o = e.other_vert(cur)
                if o.index not in seen:
                    seen.add(o.index)
                    stack.append(o)
        if len(island) < min_verts:
            to_delete.extend(island)
    removed = len(to_delete)
    if to_delete:
        bmesh.ops.delete(bm, geom=to_delete, context="VERTS")
    bm.to_mesh(obj.data)
    bm.free()
    return removed


def world_bounds(objs):
    """Axis-aligned world-space bounds (min, max, size) over a list of objects."""
    if not isinstance(objs, (list, tuple)):
        objs = [objs]
    import mathutils
    mn = mathutils.Vector((1e18, 1e18, 1e18))
    mx = mathutils.Vector((-1e18, -1e18, -1e18))
    for o in objs:
        if o.type != "MESH":
            continue
        for corner in o.bound_box:
            wc = o.matrix_world @ mathutils.Vector(corner)
            mn = mathutils.Vector((min(mn[i], wc[i]) for i in range(3)))
            mx = mathutils.Vector((max(mx[i], wc[i]) for i in range(3)))
    size = mx - mn
    return mn, mx, size
