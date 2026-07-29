"""Original modular studio architecture kit-of-parts (Asset Lab 05 design bible).

Grid module = 2 m. Every piece authored at 1 u = 1 m, +Y front, function-coded procedural
PBR (corrugated metal / brick / stucco / concrete). Pieces snap on the 2 m grid to assemble a
soundstage + a bit of lot. Original film-studio vocabulary (NOT a generic downtown kit):
elephant-door soundstage bays, barrel-vault + ridge-monitor roofs, boundary wall, marquee
gate, water-tower landmark. Low-poly stylized — the whole assembled stage stays well under
the Lab-04 ~6,250-tri lot norm.
"""
import math
import bpy
from mathutils import Matrix
from . import config, core, materials, paint
from .meshgen import MeshBuilder, T, S, R

GRID = 2.0
STAGE_H = 8.0


def _finish(mb, name, mats, cls="architecture_module", role=None, textured_uv=None, smooth=False):
    obj = mb.finish(name, materials=mats, shade_smooth=smooth)
    bpy.context.scene.collection.objects.link(obj)
    if textured_uv is not None:
        from .meshgen import box_uv_project
        box_uv_project(obj, texel_density=textured_uv)
    core.set_custom_props(obj, {"studio_role": role or name, "studio_class": cls, **config.PROVENANCE})
    return obj


def stage_wall(mats, maps, w=GRID, h=STAGE_H):
    """M-01 corrugated soundstage wall panel (one 2 m bay)."""
    mb = MeshBuilder()
    mb.add_box(size=(w, 0.20, h), matrix=T(0, 0, h / 2), mat=0)
    # rivet bands (thin horizontal strips) — silhouette detail
    for z in (1.0, h - 1.0):
        mb.add_box(size=(w, 0.24, 0.08), matrix=T(0, 0, z), mat=1)
    obj = _finish(mb, "Arch_M01_StageWall", [mats["corrugated"], mats["steel_dark"]], role="stage_wall",
                  textured_uv=0.5, smooth=False)
    return obj


def elephant_door(mats, w=4.0, h=STAGE_H):
    """M-02 elephant-door bay: big sliding stage doors in a frame."""
    mb = MeshBuilder()
    jamb = 0.3
    mb.add_box(size=(jamb, 0.30, h), matrix=T(-w / 2 + jamb / 2, 0, h / 2), mat=0)
    mb.add_box(size=(jamb, 0.30, h), matrix=T(w / 2 - jamb / 2, 0, h / 2), mat=0)
    mb.add_box(size=(w, 0.30, 0.5), matrix=T(0, 0, h - 0.25), mat=0)                      # lintel
    # two door leaves (slightly recessed)
    lw = (w - jamb * 2) / 2
    for i, sx in enumerate((-1, 1)):
        mb.add_box(size=(lw - 0.05, 0.14, h - 0.6), matrix=T(sx * lw / 2, -0.06, (h - 0.6) / 2 + 0.05), mat=1)
        for k in range(4):                                                                # cross-battens
            mb.add_box(size=(lw - 0.1, 0.16, 0.08), matrix=T(sx * lw / 2, -0.1, 1.0 + k * 1.8), mat=2)
    obj = _finish(mb, "Arch_M02_ElephantDoor", [mats["stucco"], mats["metal"], mats["steel_dark"]],
                  role="elephant_door", textured_uv=0.5)
    paint.by_height(obj, (0.5, 0.45, 0.4), (1, 1, 1), 0, h)
    return obj


def barrel_roof(mats, span=GRID, length=GRID, rise=1.1, monitor=True):
    """M-03 barrel-vault roof bay (+ optional ridge monitor)."""
    mb = MeshBuilder()
    segs = 7
    for i in range(segs):
        a0 = math.pi * i / segs
        a1 = math.pi * (i + 1) / segs
        x0, z0 = math.cos(a0) * span / 2, math.sin(a0) * rise
        x1, z1 = math.cos(a1) * span / 2, math.sin(a1) * rise
        cx = (x0 + x1) / 2
        cz = (z0 + z1) / 2 + STAGE_H
        seg_w = math.hypot(x1 - x0, z1 - z0)
        ang = math.atan2(z1 - z0, x1 - x0)
        mb.add_box(size=(seg_w, length, 0.12), matrix=T(cx, 0, cz) @ R("Y", -ang), mat=0)
    if monitor:
        mb.add_box(size=(span * 0.4, length, 0.7), matrix=T(0, 0, STAGE_H + rise + 0.35), mat=1)  # ridge monitor
    return _finish(mb, "Arch_M03_BarrelRoof", [mats["roof"], mats["metal"]], role="barrel_roof", smooth=True)


def stage_corner(mats, h=STAGE_H):
    """M-04 stage corner post + parapet cap."""
    mb = MeshBuilder()
    mb.add_box(size=(0.3, 0.3, h), matrix=T(0, 0, h / 2), mat=0)
    mb.add_box(size=(0.5, 0.5, 0.4), matrix=T(0, 0, h + 0.2), mat=1)
    return _finish(mb, "Arch_M04_StageCorner", [mats["corrugated"], mats["concrete"]], role="stage_corner",
                   textured_uv=0.5)


def ground_tile(mats, size=8.0):
    """M-14 lot ground tile (apron / plaza), textured concrete."""
    mb = MeshBuilder()
    mb.add_box(size=(size, size, 0.08), matrix=T(0, 0, -0.04), mat=0)
    obj = _finish(mb, "Arch_M14_GroundTile", [mats["concrete"]], role="ground_tile", cls="architecture_ground",
                  textured_uv=0.35)
    paint.noise_tint(obj, amount=0.06, seed=11, cell=1.0)
    return obj


def boundary_wall(mats, w=GRID, h=3.0):
    """M-10 boundary wall section + pier."""
    mb = MeshBuilder()
    mb.add_box(size=(w, 0.3, h), matrix=T(0, 0, h / 2), mat=0)
    mb.add_box(size=(0.5, 0.5, h + 0.3), matrix=T(w / 2, 0, (h + 0.3) / 2), mat=0)
    mb.add_box(size=(w + 0.5, 0.45, 0.2), matrix=T(0.25, 0, h + 0.1), mat=1)                # coping
    obj = _finish(mb, "Arch_M10_BoundaryWall", [mats["stucco"], mats["concrete"]], role="boundary_wall",
                  textured_uv=0.5)
    paint.by_height(obj, (0.55, 0.5, 0.42), (1, 1, 1), 0, h)
    return obj


def marquee_gate(mats):
    """M-11 marquee entrance gate (2-bay hero) — the studio's front door."""
    mb = MeshBuilder()
    W, H, opening = 10.0, 6.0, 6.0
    pier = (W - opening) / 2
    for sx in (-1, 1):
        px = sx * (opening / 2 + pier / 2)
        mb.add_box(size=(pier, 1.0, H), matrix=T(px, 0, H / 2), mat=0)
        mb.add_box(size=(pier + 0.3, 1.2, 0.4), matrix=T(px, 0, H + 0.2), mat=1)             # cap
    mb.add_box(size=(opening + pier, 1.0, 1.2), matrix=T(0, 0, H + 0.6), mat=2)              # marquee header
    mb.add_box(size=(opening + pier - 0.2, 0.6, 0.8), matrix=T(0, -0.5, H + 0.6), mat=3)     # sign face
    return _finish(mb, "Arch_M11_MarqueeGate", [mats["stucco"], mats["concrete"], mats["paint_maroon"], mats["canvas"]],
                   role="marquee_gate", textured_uv=0.4)


def water_tower(mats):
    """M-13 water tower — the iconic studio landmark (legs + tank + cap)."""
    mb = MeshBuilder()
    base, top = 0.0, 10.0
    spread = 1.6
    for a in range(4):
        ang = math.pi / 4 + a * math.pi / 2
        x, y = math.cos(ang) * spread, math.sin(ang) * spread
        mb.add_segment((x, y, base), (0.5 * math.cos(ang), 0.5 * math.sin(ang), top), 0.08, mat=0)
    for z in (3.0, 6.5):                                                                     # cross bracing rings
        for a in range(4):
            ang0 = math.pi / 4 + a * math.pi / 2
            ang1 = math.pi / 4 + (a + 1) * math.pi / 2
            t = z / top
            r = spread * (1 - t) + 0.5 * t
            p0 = (math.cos(ang0) * r, math.sin(ang0) * r, z)
            p1 = (math.cos(ang1) * r, math.sin(ang1) * r, z)
            mb.add_segment(p0, p1, 0.04, mat=0)
    mb.add_cylinder(1.5, 3.0, segments=20, matrix=T(0, 0, top + 1.5), mat=1)                 # tank
    mb.add_cone(1.5, 0.2, 1.2, segments=20, matrix=T(0, 0, top + 3.6), mat=2)                # conical cap
    mb.add_cylinder(0.1, 1.4, segments=8, matrix=T(0, 0, top + 4.6), mat=2)                  # finial
    return _finish(mb, "Arch_M13_WaterTower", [mats["steel_dark"], mats["paint_green"], mats["metal"]],
                   role="water_tower", cls="architecture_landmark", smooth=True)


def kit_materials():
    """Shared architecture material set (solid + textured hero surfaces)."""
    maps = materials.gen_texture_maps(size=256)
    lib = materials.library()
    lib["corrugated"] = materials.textured("mat_corrugated", config.PALETTE["metal_corrugate"], maps,
                                           "corrugated_metal", metallic=0.7, roughness=0.5)
    lib["brick_tex"] = materials.textured("mat_brick_tex", config.PALETTE["brick_studio"], maps, "brick", roughness=0.9)
    return lib, maps


def build_all_modules():
    """Build every kit module once (for thumbnails/catalog). Returns list of objects."""
    mats, maps = kit_materials()
    objs = [
        stage_wall(mats, maps), elephant_door(mats), barrel_roof(mats), stage_corner(mats),
        ground_tile(mats), boundary_wall(mats), marquee_gate(mats), water_tower(mats),
    ]
    return objs


def assemble_soundstage(mats, maps, origin=(0, 0, 0), bays=3):
    """Assemble one soundstage from the kit: elephant-door front, corrugated sides, barrel roof."""
    import mathutils
    o = mathutils.Vector(origin)
    parts = []
    depth = bays * GRID
    # front wall: elephant door centred, flanked by wall bays
    front = elephant_door(mats); front.location = o + mathutils.Vector((0, -depth / 2, 0)); parts.append(front)
    for sx in (-1, 1):
        w = stage_wall(mats, maps); w.location = o + mathutils.Vector((sx * (2.0 + GRID / 2 + 1.0), -depth / 2, 0)); parts.append(w)
    # side + back walls
    for b in range(bays):
        yb = o.y - depth / 2 + GRID / 2 + b * GRID
        for sx in (-1, 1):
            w = stage_wall(mats, maps); w.location = mathutils.Vector((o.x + sx * 4.0, yb, 0)); w.rotation_euler = (0, 0, math.pi / 2); parts.append(w)
    back = stage_wall(mats, maps); back.location = o + mathutils.Vector((0, depth / 2, 0)); parts.append(back)
    for sx in (-1, 1):
        w = stage_wall(mats, maps); w.location = o + mathutils.Vector((sx * (2.0 + GRID / 2 + 1.0), depth / 2, 0)); parts.append(w)
    # corners
    for sx in (-1, 1):
        for sy in (-1, 1):
            c = stage_corner(mats); c.location = mathutils.Vector((o.x + sx * 4.2, o.y + sy * depth / 2, 0)); parts.append(c)
    # roof bays
    for b in range(bays):
        yb = o.y - depth / 2 + GRID / 2 + b * GRID
        r = barrel_roof(mats, span=8.4, length=GRID, monitor=(b == bays // 2)); r.location = mathutils.Vector((o.x, yb, 0)); parts.append(r)
    return parts
