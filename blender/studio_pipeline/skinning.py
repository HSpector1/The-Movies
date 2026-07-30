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
        # deform layer created up-front on the empty bmesh; every vert added later inherits it.
        self.mb.bm.verts.layers.deform.verify()
        self.gi = {}      # bone name -> group index (assignment order)
        self.order = []   # bones in group-index order

    def add(self, verts, weights):
        if isinstance(weights, str):
            weights = {weights: 1.0}
        # Assign weights on the deform layer NOW, while these BMVerts are freshly created and
        # valid. Holding refs OR raw indices across later create-ops is unsafe (refs get
        # invalidated; indices drift) -> the deform layer + real verts, set immediately, is the
        # only robust path. group indices are stable (order tracked here, groups made in build()).
        for bone in weights:
            if bone not in self.gi:
                self.gi[bone] = len(self.order)
                self.order.append(bone)
        dl = self.mb.bm.verts.layers.deform.active
        for v in verts:
            dv = v[dl]
            for bone, w in weights.items():
                dv[self.gi[bone]] = float(w)
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

    def loft(self, rings, segments=20, mat=0, cap_start=True, cap_end=True):
        """A single lofted tube skinned progressively along its rings.

        `rings` = list of (weights, cx, cy, cz, rx, ry); each ring's verts are weighted to that
        ring's own `weights` map, so a torso loft follows the spine (and a limb loft its bones)
        with proper linear-blend skinning — one continuous fitted surface that still deforms
        cleanly under every clip.
        """
        geo = [(cx, cy, cz, rx, ry) for (_w, cx, cy, cz, rx, ry) in rings]
        ring_verts = self.mb.add_loft(geo, segments=segments, mat=mat,
                                      cap_start=cap_start, cap_end=cap_end)
        for (wmap, *_), vs in zip(rings, ring_verts):
            self.add(vs, wmap)
        return ring_verts

    def tube(self, rings, up=(0, 0, 1), segments=16, mat=0, cap_start=True, cap_end=True):
        """A single swept tube skinned progressively along its rings — a continuous LIMB.

        `rings` = list of (weights, center, radius); center is a Vector, radius is r or (rx, ry).
        Each ring's verts are weighted to that ring's own bone/blend, so the limb bends at its
        joints as one surface (no butt-jointed segment rings).
        """
        centers = [c for (_w, c, _r) in rings]
        radii = [r for (_w, _c, r) in rings]
        ring_verts = self.mb.add_tube(centers, radii, up=up, segments=segments, mat=mat,
                                      cap_start=cap_start, cap_end=cap_end)
        for (wmap, *_), vs in zip(rings, ring_verts):
            self.add(vs, wmap)
        return ring_verts

    def build(self, name, materials, armature, shade_smooth=False):
        bm = self.mb.bm
        self.mb.recalc_normals()
        bm.normal_update()
        me = bpy.data.meshes.new(name)
        obj = bpy.data.objects.new(name, me)
        for m in (materials or []):
            me.materials.append(m)
        # create vertex groups in the SAME order as the deform-layer indices assigned in add(),
        # so group index N is bone self.order[N]. to_mesh then carries the deform weights across.
        for bone in self.order:
            obj.vertex_groups.new(name=bone)
        bm.to_mesh(me)
        bm.free()
        if shade_smooth:
            for p in me.polygons:
                p.use_smooth = True
        bpy.context.scene.collection.objects.link(obj)   # into the view layer
        bind(obj, armature)
        return obj
