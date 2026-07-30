"""Procedural mesh toolkit. A MeshBuilder accumulates primitives (each placed by a 4x4
matrix and tagged with a material-slot index) into one bmesh, then bakes an object.

Uses bmesh.ops exclusively — deterministic and identical headless or in-UI. No randomness.
"""
import math
import bmesh
from mathutils import Matrix, Vector


def T(x=0.0, y=0.0, z=0.0):
    return Matrix.Translation((x, y, z))


def S(sx, sy=None, sz=None):
    sy = sx if sy is None else sy
    sz = sx if sz is None else sz
    return Matrix.Diagonal((sx, sy, sz, 1.0))


def R(axis, angle):
    return Matrix.Rotation(angle, 4, axis)


def segment_matrix(p0, p1, radius, radius2=None):
    """Matrix that maps a unit Z-cylinder (create_cone depth=1, centered) to span p0->p1."""
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    length = d.length
    if length < 1e-9:
        length = 1e-6
    mid = (p0 + p1) * 0.5
    quat = d.normalized().to_track_quat("Z", "Y")
    return T(*mid) @ quat.to_matrix().to_4x4() @ Matrix.Diagonal((1, 1, length, 1))


class MeshBuilder:
    def __init__(self):
        self.bm = bmesh.new()

    # --- low-level: tag the faces of freshly created verts with a material slot ---
    def _tag(self, verts, mat):
        seen = set()
        for v in verts:
            for f in v.link_faces:
                if id(f) not in seen:      # face indices aren't live; identity is
                    seen.add(id(f))
                    f.material_index = mat
        return verts

    # --- primitives (all accept an optional placement matrix) ---
    def add_box(self, size=(1, 1, 1), matrix=None, mat=0):
        m = (matrix or Matrix.Identity(4)) @ S(*size)
        res = bmesh.ops.create_cube(self.bm, size=1.0, matrix=m)
        return self._tag(res["verts"], mat)

    def add_cylinder(self, radius, depth, segments=16, matrix=None, mat=0, cap=True):
        m = matrix or Matrix.Identity(4)
        res = bmesh.ops.create_cone(self.bm, cap_ends=cap, cap_tris=False,
                                    segments=segments, radius1=radius, radius2=radius,
                                    depth=depth, matrix=m)
        return self._tag(res["verts"], mat)

    def add_cone(self, radius1, radius2, depth, segments=16, matrix=None, mat=0, cap=True):
        m = matrix or Matrix.Identity(4)
        res = bmesh.ops.create_cone(self.bm, cap_ends=cap, cap_tris=False,
                                    segments=segments, radius1=radius1, radius2=radius2,
                                    depth=depth, matrix=m)
        return self._tag(res["verts"], mat)

    def add_sphere(self, radius, subdivisions=2, matrix=None, mat=0):
        m = matrix or Matrix.Identity(4)
        res = bmesh.ops.create_icosphere(self.bm, subdivisions=subdivisions,
                                         radius=radius, matrix=m)
        return self._tag(res["verts"], mat)

    def add_uvsphere(self, radius, u=16, v=8, matrix=None, mat=0):
        m = matrix or Matrix.Identity(4)
        res = bmesh.ops.create_uvsphere(self.bm, u_segments=u, v_segments=v,
                                        radius=radius, matrix=m)
        return self._tag(res["verts"], mat)

    def add_segment(self, p0, p1, radius, radius2=None, segments=12, mat=0, cap=True):
        """A (optionally tapered) cylinder spanning two world points — limbs, poles, cables."""
        m = segment_matrix(p0, p1, radius, radius2)
        r2 = radius if radius2 is None else radius2
        res = bmesh.ops.create_cone(self.bm, cap_ends=cap, cap_tris=False, segments=segments,
                                    radius1=radius, radius2=r2, depth=1.0, matrix=m)
        return self._tag(res["verts"], mat)

    def add_loft(self, rings, segments=20, mat=0, cap_start=True, cap_end=True):
        """Bridge a stack of elliptical rings into ONE continuous, manifold tube surface.

        This is the organic-body primitive: unlike a stack of overlapping ellipsoids (which
        crease and read "assembled" where two surfaces interpenetrate), a loft is a single
        surface, so a torso/limb reads as one continuous, fitted form.

        `rings` = list of (cx, cy, cz, rx, ry) — each an axis-aligned ellipse (half-width rx in
        X, half-depth ry in Y) centred at (cx,cy,cz). Rings are bridged bottom->top with quads.
        Returns a list (one entry per ring) of that ring's BMVerts, so a caller can weight each
        ring to its own bone/blend (progressive skinning along the spine or a limb).
        """
        bm = self.bm
        ring_verts = []
        for (cx, cy, cz, rx, ry) in rings:
            vs = []
            for i in range(segments):
                a = 2.0 * math.pi * i / segments
                vs.append(bm.verts.new((cx + rx * math.cos(a), cy + ry * math.sin(a), cz)))
            ring_verts.append(vs)
        faces = []
        for r in range(len(ring_verts) - 1):
            a_ring, b_ring = ring_verts[r], ring_verts[r + 1]
            for i in range(segments):
                j = (i + 1) % segments
                faces.append(bm.faces.new((a_ring[i], a_ring[j], b_ring[j], b_ring[i])))
        if cap_start and len(ring_verts) > 0:
            faces.append(bm.faces.new(list(reversed(ring_verts[0]))))
        if cap_end and len(ring_verts) > 0:
            faces.append(bm.faces.new(ring_verts[-1]))
        for f in faces:
            f.material_index = mat
        return ring_verts

    def add_box_between(self, p0, p1, w, h, mat=0):
        """A rectangular beam spanning p0->p1 with cross-section w (x) by h (y)."""
        p0, p1 = Vector(p0), Vector(p1)
        d = p1 - p0
        length = max(d.length, 1e-6)
        mid = (p0 + p1) * 0.5
        quat = d.normalized().to_track_quat("Z", "Y")
        m = T(*mid) @ quat.to_matrix().to_4x4()
        return self.add_box(size=(w, h, length), matrix=m, mat=mat)

    # --- ops on accumulated geometry ---
    def bevel(self, offset=0.01, segments=1, only_verts=None):
        geom = list(self.bm.edges) if only_verts is None else only_verts
        bmesh.ops.bevel(self.bm, geom=geom, offset=offset, segments=segments,
                        affect="EDGES", clamp_overlap=True)

    def solidify_last(self, thickness):
        pass  # (reserved) — most shells are built with explicit thickness instead

    def recalc_normals(self):
        bmesh.ops.recalc_face_normals(self.bm, faces=list(self.bm.faces))

    # --- bake to a Blender object ---
    def finish(self, name, materials=None, shade_smooth=False, auto_smooth_deg=None):
        import bpy
        self.recalc_normals()
        me = bpy.data.meshes.new(name)
        self.bm.normal_update()
        self.bm.to_mesh(me)
        self.bm.free()
        obj = bpy.data.objects.new(name, me)
        if materials:
            for m in materials:
                me.materials.append(m)
        if shade_smooth:
            for p in me.polygons:
                p.use_smooth = True
        return obj


def box_uv_project(obj, texel_density=1.0):
    """World-space box (triplanar-pick) UV projection for tiling PBR on architecture/props.

    Each face's UV comes from its two world axes least aligned with its dominant normal axis,
    scaled by texel_density (UV units per metre). Deterministic; export-safe UV layer.
    """
    import bpy
    me = obj.data
    uv = me.uv_layers.get("UVMap") or me.uv_layers.new(name="UVMap")
    mw = obj.matrix_world
    for poly in me.polygons:
        n = poly.normal
        ax, ay, az = abs(n.x), abs(n.y), abs(n.z)
        for li in poly.loop_indices:
            vi = me.loops[li].vertex_index
            co = mw @ me.vertices[vi].co
            if az >= ax and az >= ay:      # floor/ceiling -> XY
                u, v = co.x, co.y
            elif ax >= ay:                  # wall facing X -> YZ
                u, v = co.y, co.z
            else:                            # wall facing Y -> XZ
                u, v = co.x, co.z
            uv.data[li].uv = (u * texel_density, v * texel_density)
    return obj
