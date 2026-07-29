"""Skin procedurally-built geometry to the canonical UAL armature.

SkinnedBuilder wraps a MeshBuilder and records, per added primitive, the bone weight map to
apply. On build() it bakes the mesh, creates one vertex group per bone, assigns weights, adds
the Armature modifier, and parents to the rig. Supports rigid (one bone) and blended (multi-
bone) weighting so joints like elbow/knee/shoulder deform smoothly under the 43 clips.
"""
import bpy
from .meshgen import MeshBuilder


def bind(obj, armature):
    """Add the Armature modifier and parent to the rig (both at identity world transform)."""
    mod = obj.modifiers.new("Armature", "ARMATURE")
    mod.object = armature
    mod.use_vertex_groups = True
    obj.parent = armature
    obj.matrix_world = armature.matrix_world.copy()
    return obj


class SkinnedBuilder:
    def __init__(self):
        self.mb = MeshBuilder()
        self.records = []  # (verts, {bone: weight})

    def add(self, verts, weights):
        if isinstance(weights, str):
            weights = {weights: 1.0}
        # capture indices NOW (verts are live and create-ops only append, so indices are
        # stable and survive to_mesh); avoids holding fragile BMVert refs until build().
        self.mb.bm.verts.index_update()
        self.records.append(([v.index for v in verts], weights))
        return verts

    # convenience primitives that immediately weight to a bone (or weight map)
    def box(self, weights, size=(1, 1, 1), matrix=None, mat=0):
        return self.add(self.mb.add_box(size=size, matrix=matrix, mat=mat), weights)

    def sphere(self, weights, radius, subdivisions=2, matrix=None, mat=0):
        return self.add(self.mb.add_sphere(radius, subdivisions, matrix, mat), weights)

    def uvsphere(self, weights, radius, u=16, v=8, matrix=None, mat=0):
        return self.add(self.mb.add_uvsphere(radius, u, v, matrix, mat), weights)

    def cyl(self, weights, radius, depth, segments=16, matrix=None, mat=0, cap=True):
        return self.add(self.mb.add_cylinder(radius, depth, segments, matrix, mat, cap), weights)

    def segment(self, weights, p0, p1, radius, radius2=None, segments=12, mat=0, cap=True):
        return self.add(self.mb.add_segment(p0, p1, radius, radius2, segments, mat, cap), weights)

    def cone(self, weights, r1, r2, depth, segments=16, matrix=None, mat=0, cap=True):
        return self.add(self.mb.add_cone(r1, r2, depth, segments, matrix, mat, cap), weights)

    def build(self, name, materials, armature, shade_smooth=False):
        bm = self.mb.bm
        self.mb.recalc_normals()
        bm.verts.index_update()
        bm.normal_update()
        me = bpy.data.meshes.new(name)
        bm.to_mesh(me)
        bm.free()
        # bone -> {weight: [vidx]} so we can batch vertex_groups.add by identical weight
        by_bone = {}
        for idxs, weights in self.records:
            for vidx in idxs:
                for bone, w in weights.items():
                    by_bone.setdefault(bone, {}).setdefault(round(w, 4), []).append(vidx)
        obj = bpy.data.objects.new(name, me)
        for m in (materials or []):
            me.materials.append(m)
        if shade_smooth:
            for p in me.polygons:
                p.use_smooth = True
        for bone, wmap in by_bone.items():
            vg = obj.vertex_groups.new(name=bone)
            for w, idxs in wmap.items():
                vg.add(idxs, w, "REPLACE")
        bpy.context.scene.collection.objects.link(obj)   # into the view layer
        bind(obj, armature)
        return obj
