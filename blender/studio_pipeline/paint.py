"""Vertex-colour helpers ("Col" attribute) — export-safe COLOR_0 variation/weathering.

Deterministic (seeded). Used for brick/stucco tonal variation, ground-up weathering, and
per-face role tinting on characters — none of which need textures or UVs.
"""
import numpy as np
import bpy
from mathutils import Vector


def ensure_col(obj, name="Col"):
    me = obj.data
    attr = me.color_attributes.get(name)
    if attr is None:
        attr = me.color_attributes.new(name=name, type="FLOAT_COLOR", domain="POINT")
        for d in attr.data:              # default WHITE -> multiply is a no-op until tinted
            d.color = (1.0, 1.0, 1.0, 1.0)
    if me.color_attributes.active_color is not attr:
        me.color_attributes.active_color = attr
    return attr


def tint_slots(obj, slot_indices, rgba):
    """Set Col only on vertices touched by faces in `slot_indices` (avoids multi-material leak)."""
    me = obj.data
    attr = ensure_col(obj)
    c = (*rgba, 1.0) if len(rgba) == 3 else rgba
    slots = set(slot_indices)
    for poly in me.polygons:
        if poly.material_index in slots:
            for vi in poly.vertices:
                attr.data[vi].color = c


def fill(obj, rgba):
    attr = ensure_col(obj)
    c = (*rgba, 1.0) if len(rgba) == 3 else rgba
    for d in attr.data:
        d.color = c


def by_height(obj, low_rgba, high_rgba, zmin=None, zmax=None):
    """Vertical gradient (ground grime low -> clean high), in object-local Z."""
    me = obj.data
    attr = ensure_col(obj)
    zs = [v.co.z for v in me.vertices]
    zmin = min(zs) if zmin is None else zmin
    zmax = max(zs) if zmax is None else zmax
    span = max(zmax - zmin, 1e-6)
    lo = np.array((*low_rgba, 1.0) if len(low_rgba) == 3 else low_rgba)
    hi = np.array((*high_rgba, 1.0) if len(high_rgba) == 3 else high_rgba)
    for i, v in enumerate(me.vertices):
        t = min(1.0, max(0.0, (v.co.z - zmin) / span))
        attr.data[i].color = tuple(lo * (1 - t) + hi * t)


def _point_seg_dist(p, a, b):
    ab = b - a
    t = 0.0 if ab.length_squared < 1e-12 else max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared))
    return (p - (a + ab * t)).length


def paint_by_region(obj, arm, bone_rgb):
    """Colour each vertex by its NEAREST rig bone segment -> region colour (skin/shirt/etc).

    Lets a single vcol material carry a multi-colour crew body that survives voxel-remesh
    (which collapses material slots). bone_rgb maps a curated set of bone names -> rgb.
    """
    from . import rig as _rig
    P = _rig.rest_points(arm)
    segs = [(P[n]["head"], P[n]["tail"], rgb) for n, rgb in bone_rgb.items() if n in P]
    attr = ensure_col(obj)
    for i, v in enumerate(obj.data.vertices):
        p = v.co
        best, col = 1e18, (1.0, 1.0, 1.0)
        for a, b, rgb in segs:
            d = _point_seg_dist(p, a, b)
            if d < best:
                best, col = d, rgb
        attr.data[i].color = (col[0], col[1], col[2], 1.0)
    return attr


def noise_tint(obj, amount=0.12, seed=1, cell=0.6):
    """Multiply each vertex colour by a per-cell brightness in [1-amount, 1+amount].

    Cells are quantised world positions -> neighbouring bricks/panels share a tone. Seeded.
    """
    me = obj.data
    attr = ensure_col(obj)
    rng = np.random.default_rng(seed)
    cache = {}
    for i, v in enumerate(me.vertices):
        key = (round(v.co.x / cell), round(v.co.y / cell), round(v.co.z / cell))
        if key not in cache:
            cache[key] = 1.0 + rng.uniform(-amount, amount)
        f = cache[key]
        c = attr.data[i].color
        attr.data[i].color = (min(1, c[0] * f), min(1, c[1] * f), min(1, c[2] * f), c[3])
