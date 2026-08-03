"""Asset Lab 05I — CORRECTIVE character pass over the accepted 05H foundation (thin, additive).

Owner ruling (2026-08-03): accept the 05H authored-base foundation; the finished 05H hero needs a
correction pass. This module is the additive correction LAYER: it imports the accepted 05H generator
(`authored05h`), builds its base body + rig (UNCHANGED foundation, same 65-joint skeleton, same warm-tan
skin material, same topology order), then applies ONLY the approved 05I corrections:

  A. Garments  — reconstruct a COMPLETE, readable safety vest (open-front arc-loft shell, not offset
                 scraps), a fuller work shirt that reads as clothing (not paint), stable in all 6 clips.
  B. Body/face — reduce exaggerated muscularity; soften shoulders/chest/arms/neck + the face
                 (brow/nose/jaw/ears); approachable stylised studio worker. Preserves topology + weights.
  C. Details   — boots that FULLY cover the feet; a hard hat that closes over the crown (no scalp);
                 restrained hair; belt/radio; corrected materials + neutral review readiness.

Garment/boot/hat geometry is fitted to the body's ACTUAL vertex bounds (robust to the slimmed body),
not bone guesses. authored05h.py and every electric_hero_05h*.glb remain byte-unchanged. Exports as
electric_hero_05i*.
"""
import math
import bmesh
import bpy
from mathutils import Vector
from . import config, core, authored05h as h
from .meshgen import MeshBuilder, T

# --- tunable correction parameters (one coherent Iteration 1) ---------------------------------
MUSCLE = {          # perpendicular-to-bone-axis girth scale per region (1.0 = unchanged)
    "upperarm_l": 0.74, "upperarm_r": 0.74, "lowerarm_l": 0.82, "lowerarm_r": 0.82,
    "thigh_l": 0.87, "thigh_r": 0.87, "calf_l": 0.90, "calf_r": 0.90,
    "spine_02": 0.82, "spine_03": 0.76, "clavicle_l": 0.82, "clavicle_r": 0.82,
}
CHEST_Y_SQUASH = 0.74   # extra front-depth reduction for the puffed chest (spine_02/03, y<0)
SHOULDER_X = 0.85       # narrow the shoulder span (clavicle-dominant verts)


def _seg(arm):
    return {b.name: (b.head_local.copy(), b.tail_local.copy()) for b in arm.data.bones}


def _axis(p, a, b):
    ab = b - a
    L2 = ab.dot(ab)
    t = 0.0 if L2 < 1e-9 else max(0.0, min(1.0, (p - a).dot(ab) / L2))
    foot = a + t * ab
    return foot, (p - foot)


def _region_bounds(me, seg, bones, wmin=0.3):
    """Axis-aligned min/max over verts whose summed weight to `bones` >= wmin (actual body geometry)."""
    mn = Vector((1e9, 1e9, 1e9)); mx = Vector((-1e9, -1e9, -1e9))
    found = False
    for v in me.vertices:
        w = h._weights_at(v.co, seg, h.DEFORM, K=4, P=3.0)
        if sum(w.get(b, 0.0) for b in bones) >= wmin:
            found = True
            mn = Vector((min(mn.x, v.co.x), min(mn.y, v.co.y), min(mn.z, v.co.z)))
            mx = Vector((max(mx.x, v.co.x), max(mx.y, v.co.y), max(mx.z, v.co.z)))
    return (mn, mx) if found else (Vector((0, 0, 0)), Vector((0, 0, 0)))


def _reduce_muscularity(me, seg):
    for v in me.vertices:
        w = h._weights_at(v.co, seg, h.DEFORM, K=4, P=3.0)
        if not w:
            continue
        bn = max(w, key=w.get)
        f = MUSCLE.get(bn)
        if f is None:
            continue
        a, b = seg[bn]
        foot, perp = _axis(v.co, a, b)
        blend = min(1.0, w[bn] / 0.6)
        s = 1.0 + (f - 1.0) * blend
        new = foot + perp * s
        if bn in ("spine_02", "spine_03") and new.y < 0:
            new.y = foot.y + (new.y - foot.y) * (CHEST_Y_SQUASH + (1 - CHEST_Y_SQUASH) * (1 - blend))
        if bn in ("clavicle_l", "clavicle_r"):
            new.x *= (SHOULDER_X + (1 - SHOULDER_X) * (1 - blend))
        v.co = new
    me.update()


def _soften_face(me):
    # gentle structural eases FIRST (brow/nose/ears), THEN smooth — so the result is EVEN, not lumpy.
    for v in me.vertices:
        z, y, x = v.co.z, v.co.y, v.co.x
        if 1.60 < z < 1.69 and y < -0.02:       # beetled brow -> ease back
            v.co.y += 0.014
        if 1.56 < z < 1.64 and y < -0.05:        # heavy nose -> ease toward the face plane
            v.co.y += 0.016
        if 1.54 < z < 1.68 and abs(x) > 0.070:   # oversized pointed ears -> tame width
            v.co.x *= 0.86
        if 1.60 < z < 1.67 and -0.095 < y < -0.03 and abs(x) < 0.075 and v.co.y < -0.035:
            v.co.y = -0.035                       # fill the deep sculpted eye sockets (fixes the gaunt read)
    me.update()
    # strong, even smoothing -> a simple, approachable stylised face (fills the sculpted eye sockets,
    # removes the gaunt lumps). Approachable-worker read is the target, not photoreal detail.
    face = [v.index for v in me.vertices if v.co.z > 1.54]
    bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
    fv = [bm.verts[i] for i in face]
    for _ in range(6):
        bmesh.ops.smooth_vert(bm, verts=fv, factor=0.42, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    bm.to_mesh(me); bm.free(); me.update()


def build_authored_base_05i(arm):
    base = h.build_authored_base(arm, tag="ElectricHero05I")   # same topology, rig, tan skin material
    seg = _seg(arm)
    _reduce_muscularity(base.data, seg)
    _soften_face(base.data)
    base.data.update()
    return base


def _skin_new(obj, arm, seg, bones):
    for bn in bones:
        if bn not in obj.vertex_groups:
            obj.vertex_groups.new(name=bn)
    vg = {bn: obj.vertex_groups[bn] for bn in bones}
    for vi, v in enumerate(obj.data.vertices):
        w = h._weights_at(v.co, seg, bones, K=4, P=3.0)
        for bn, wt in w.items():
            vg[bn].add([vi], wt, "REPLACE")
    m = obj.modifiers.new("Armature", "ARMATURE"); m.object = arm
    obj.parent = arm
    core.set_custom_props(obj, {"studio_class": "garment"})
    for p in obj.data.polygons:
        p.use_smooth = True


def _apply_solidify(obj, thickness):
    sol = obj.modifiers.new("Solidify", "SOLIDIFY"); sol.thickness = thickness; sol.offset = 0.0
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier="Solidify")


def _complete_vest(base, arm, seg):
    """COMPLETE open-front hi-viz safety vest: one continuous arc-loft shell fitted to the torso's
    actual bounds, wrapping back + sides, open at the front centre, waist to shoulders. Never fragments."""
    waist = seg["spine_01"][0].z
    top = seg["spine_03"][1].z + 0.02
    mn, mx = _region_bounds(base.data, seg, ["spine_02", "spine_03"], 0.3)
    cy = (mn.y + mx.y) * 0.5
    rx = (mx.x - mn.x) * 0.5 + 0.030
    ry = (mx.y - mn.y) * 0.5 + 0.028
    FRONT = 3 * math.pi / 2
    gap = 0.16                         # narrow front opening — vest covers the chest (no nude-torso read)
    a0, a1 = FRONT + gap, FRONT + 2 * math.pi - gap
    levels = [
        (waist - 0.03, rx * 0.98, ry * 0.98),
        (waist + 0.10, rx, ry),
        ((waist + top) * 0.5, rx * 1.02, ry * 1.02),
        (top - 0.12, rx * 0.92, ry * 0.92),
        (top - 0.02, rx * 0.72, ry * 0.74),
    ]
    mb = MeshBuilder()
    mb.add_arc_loft([(0.0, cy, z, ax, ay) for (z, ax, ay) in levels], a0, a1, segments=18, mat=0)
    vest = mb.finish("Hero05I_Vest", shade_smooth=True)
    bpy.context.scene.collection.objects.link(vest)
    _apply_solidify(vest, 0.02)
    vest.data.materials.clear()
    vest.data.materials.append(h._solid_mat("mat_i_vest", (0.95, 0.62, 0.11), 0.5))   # hi-viz orange
    _skin_new(vest, arm, seg, ["spine_01", "spine_02", "spine_03", "neck_01", "clavicle_l", "clavicle_r"])
    return vest, (cy, rx, ry, a0, a1)


def _reflective_bands(base, arm, seg, vgeo):
    cy, rx, ry, a0, a1 = vgeo
    bands = []
    for k, bz in enumerate((seg["spine_02"][0].z + 0.05, seg["spine_02"][0].z - 0.06)):
        mb = MeshBuilder()
        mb.add_arc_loft([(0.0, cy, bz - 0.018, rx + 0.006, ry + 0.006),
                         (0.0, cy, bz + 0.018, rx + 0.006, ry + 0.006)], a0, a1, segments=18, mat=0)
        band = mb.finish(f"Hero05I_Band_{k}", shade_smooth=True)
        bpy.context.scene.collection.objects.link(band)
        _apply_solidify(band, 0.014)
        band.data.materials.clear()
        band.data.materials.append(h._solid_mat("mat_i_hiviz", (0.93, 0.93, 0.86), 0.3))  # silver reflective
        _skin_new(band, arm, seg, ["spine_01", "spine_02", "spine_03"])
        bands.append(band)
    return bands


def _boots(base, arm, seg):
    """One boot per foot, fitted CLOSE to the foot's actual bounds (not oversized), plus an ankle shaft
    that rises up the lower shin so the boot stays connected to the leg in motion (no ankle gap). Skinned
    to foot/ball/calf so the shaft follows the shin."""
    boots = []
    for side in ("l", "r"):
        mn, mx = _region_bounds(base.data, seg, [f"foot_{side}", f"ball_{side}"], 0.3)
        cx = (mn.x + mx.x) * 0.5
        toe = mn.y - 0.020                     # body faces -Y: toes are the most -Y (tight margin)
        heel = mx.y + 0.015
        cy = (toe + heel) * 0.5
        dy = heel - toe
        wx = (mx.x - mn.x) + 0.020              # close to the foot, not a clown box
        top = 0.115
        # ankle centre for the shaft: over the heel, up the calf
        ah = seg[f"calf_{side}"][0]             # calf head = ankle-ish
        mb = MeshBuilder()
        mb.add_box(size=(wx, dy, top), matrix=T(cx, cy, top * 0.5))       # foot box
        mb.add_cylinder(0.052, 0.20, segments=14, matrix=T(cx, mx.y - 0.005, 0.17))  # shaft up the shin -> connects to leg
        boot = mb.finish(f"Hero05I_Boot_{side}", shade_smooth=True)
        bm = bmesh.new(); bm.from_mesh(boot.data)
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=0.014, segments=2, affect="EDGES", clamp_overlap=True)
        bm.normal_update(); bm.to_mesh(boot.data); bm.free()
        bpy.context.scene.collection.objects.link(boot)
        boot.data.materials.clear()
        boot.data.materials.append(h._solid_mat("mat_i_boots", (0.22, 0.15, 0.10), 0.55))
        _skin_new(boot, arm, seg, [f"foot_{side}", f"ball_{side}", f"calf_{side}"])
        boots.append(boot)
    return boots


def _hard_hat(base, arm, seg):
    """A hard hat sized + placed from the head's ACTUAL vertex bounds so it closes over the crown
    (no exposed scalp). Larger dome cut low to the hairline + a brim. Rigid to Head."""
    mn, mx = _region_bounds(base.data, seg, ["Head"], 0.4)
    cx = (mn.x + mx.x) * 0.5
    hy = (mn.y + mx.y) * 0.5 - 0.005
    head_top = mx.z
    hw = (mx.x - mn.x) * 0.5
    r = hw + 0.018                       # snug crown — sits ON the head, not a floating ball
    dome_cz = head_top - 0.055           # dome centre near the crown (top just above the head)
    cut = head_top - 0.135               # rim at the BROW (above the eyes), never across the face
    mb = MeshBuilder()
    mb.add_uvsphere(r, u=24, v=14, matrix=T(cx, hy, dome_cz))
    mb.add_cylinder(r + 0.026, 0.020, segments=24, matrix=T(cx, hy, cut + 0.004))   # brim at the brow line
    hat = mb.finish("Hero05I_Hat", shade_smooth=True)
    bm = bmesh.new(); bm.from_mesh(hat.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < cut], context="VERTS")
    bm.to_mesh(hat.data); bm.free()
    bpy.context.scene.collection.objects.link(hat)
    h._rigid_piece(hat, arm, "Head", h._solid_mat("mat_i_hat", (0.90, 0.58, 0.10), 0.4), "Hero05I_Hat")
    return hat


def build_workwear_05i(base, arm):
    """Corrected Electric workwear over the softened 05I base."""
    P = config.PALETTE
    seg = _seg(arm)
    hip_z = seg["pelvis"][0].z
    waist_z = seg["spine_01"][0].z
    pieces = []

    # SHIRT — proven offset-shell, thicker so it reads as a garment not paint.
    shirt = h._garment(base, arm, "Hero05I_Shirt",
                       ["spine_01", "spine_02", "spine_03", "neck_01", "clavicle_l", "clavicle_r",
                        "upperarm_l", "upperarm_r", "lowerarm_l", "lowerarm_r"],
                       0.024, h._solid_mat("mat_i_shirt", P["work_shirt_blue"], 0.78),
                       keep=lambda c: c.z > hip_z - 0.02)
    pieces.append(shirt)

    # TROUSERS — proven offset-shell (read fine on 05H).
    trousers = h._garment(base, arm, "Hero05I_Trousers",
                          ["pelvis", "thigh_l", "thigh_r", "calf_l", "calf_r"],
                          0.016, h._solid_mat("mat_i_trousers", P["trousers_grey"], 0.8),
                          keep=lambda c: c.z < waist_z + 0.02 and c.z > 0.14)
    pieces.append(trousers)

    # BOOTS — clean enclosing boots (replaces the thin shell that left feet bare).
    pieces += _boots(base, arm, seg)

    # VEST — complete open-front hi-viz shell + reflective bands (replaces the fragmented offset vest).
    vest, vgeo = _complete_vest(base, arm, seg)
    pieces.append(vest)
    pieces += _reflective_bands(base, arm, seg, vgeo)

    # BELT + RADIO — accepted authored pieces.
    import mathutils
    belt_mb = MeshBuilder()
    for i in range(28):
        a = (i / 28) * 2 * math.pi
        belt_mb.add_box(size=(0.03, 0.03, 0.05),
                        matrix=mathutils.Matrix.Translation((0.17 * math.cos(a), 0.11 * math.sin(a), hip_z + 0.03)))
    belt = belt_mb.finish("Hero05I_Belt")
    bpy.context.scene.collection.objects.link(belt)
    h._rigid_piece(belt, arm, "pelvis", h._solid_mat("mat_i_belt", P["leather_brown"], 0.5), "Hero05I_Belt")
    pieces.append(belt)

    radio_mb = MeshBuilder()
    radio_mb.add_box(size=(0.05, 0.035, 0.09), matrix=mathutils.Matrix.Translation((0.17, 0.02, hip_z + 0.02)))
    radio = radio_mb.finish("Hero05I_Radio")
    bpy.context.scene.collection.objects.link(radio)
    h._rigid_piece(radio, arm, "thigh_r", h._solid_mat("mat_i_radio", P["steel_dark"], 0.4, 0.6), "Hero05I_Radio")
    pieces.append(radio)

    # HAIR — restrained cap that meets the hat brim; excludes the front face.
    hair = h._garment(base, arm, "Hero05I_Hair", ["Head"], 0.012,
                      h._solid_mat("mat_i_hair", P["hair_dark"], 0.85),
                      keep=lambda c: 1.55 < c.z < 1.66 and c.y > 0.055)   # nape/back only — never below the front brim
    pieces.append(hair)

    # HARD HAT — closes over the crown (no exposed scalp).
    pieces.append(_hard_hat(base, arm, seg))

    return pieces
