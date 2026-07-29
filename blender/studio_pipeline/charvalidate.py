"""Character validation gate (Asset Lab 05B).

The geometric checks that FAIL the character pipeline on the exact defects the owner rejected:
face-on-back, a disconnected visible part, wrong height, or floating feet. Shared by the export
build (build_characters05b.py) and the automated test (test_character_gate.py).
"""
import bmesh
from . import core, character2


def island_sizes(o):
    bm = bmesh.new(); bm.from_mesh(o.data); bm.verts.ensure_lookup_table()
    seen = set(); sizes = []
    for v in bm.verts:
        if v.index in seen:
            continue
        cnt = 0; stack = [v]; seen.add(v.index)
        while stack:
            cur = stack.pop(); cnt += 1
            for e in cur.link_edges:
                ov = e.other_vert(cur)
                if ov.index not in seen:
                    seen.add(ov.index); stack.append(ov)
        sizes.append(cnt)
    bm.free(); return sizes


def validate(o):
    """Return (ok, issues[], stats). Fails on the rejected defects."""
    issues = []
    mn, mx, size = core.world_bounds([o])
    # 1) face features on the -Y front: head-region 'dark' verts must average to -Y
    dark = character2.SLOT["dark"]
    ys = [(o.matrix_world @ o.data.vertices[vi].co).y
          for p in o.data.polygons if p.material_index == dark
          for vi in p.vertices
          if (o.matrix_world @ o.data.vertices[vi].co).z > 1.3]
    if ys:
        my = sum(ys) / len(ys)
        if my > -0.02:
            issues.append(f"FACE-NOT-ON-FRONT (head feature mean y={my:.3f} > 0)")
    else:
        issues.append("no facial feature geometry")
    # 2) height sane (stylized adult)
    if not (1.70 <= size.z <= 1.95):
        issues.append(f"height {size.z:.3f} out of [1.70,1.95]")
    # 3) feet grounded (rest pose): min z near 0 -> no floating body
    if mn.z < -0.06 or mn.z > 0.15:
        issues.append(f"feet-not-grounded (min z={mn.z:.3f})")
    # 4) no stray fragment island
    sizes = island_sizes(o)
    strays = [s for s in sizes if s < 6]
    if strays:
        issues.append(f"{len(strays)} stray fragment island(s) <6 verts")
    return (len(issues) == 0, issues,
            dict(tris=core.triangle_count(o), height=round(size.z, 3), islands=len(sizes)))
