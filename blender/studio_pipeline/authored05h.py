"""Asset Lab 05H — authored-base character pipeline.

Path A: a professionally authored CC0 human base mesh (Blender Studio Human Base Meshes
bundle v1.0.0, CC0 1.0; see licenses/asset-lab-05h/PROVENANCE.json) becomes a Project:Studio
character bound to the SAME 65-bone UAL armature and the SAME six clips as 05E-05G.

The base mesh ships arms-down; the armature rests in a T-pose. We re-pose the arms to T with
SMOOTH linear-blend re-posing (continuous inverse-distance arm weight -> no armpit sail), then
skin the mesh deterministically by inverse-distance to the deform-bone segments (bone-heat is
unreliable headless on this mesh). No external rig, clothing, hair, or animation is imported —
only the neutral body geometry. Everything else (workwear, materials) is authored by Studio.
"""
import math, bmesh
import bpy
from mathutils import Vector
from . import config, core

BASE_GLB = config.ROOT / "licenses" / "asset-lab-05h" / "human_base_male_stylized_cc0.glb"

DEFORM = ["pelvis","spine_01","spine_02","spine_03","neck_01","Head",
          "clavicle_l","upperarm_l","lowerarm_l","hand_l",
          "clavicle_r","upperarm_r","lowerarm_r","hand_r",
          "thigh_l","calf_l","foot_l","ball_l","thigh_r","calf_r","foot_r","ball_r"]
ARML = ("upperarm_l","lowerarm_l","hand_l")
ARMR = ("upperarm_r","lowerarm_r","hand_r")
# For re-posing only: arms + torso/head (NO legs) — arms-down forearms hang near the thighs,
# so including leg bones would steal arm weight and leave the arm under-rotated (drooped).
REPOSE_BONES = ["pelvis","spine_01","spine_02","spine_03","neck_01","Head",
                "clavicle_l","upperarm_l","lowerarm_l","hand_l",
                "clavicle_r","upperarm_r","lowerarm_r","hand_r"]


def dseg(p, a, b):
    ab = b - a; L2 = ab.dot(ab)
    t = 0.0 if L2 < 1e-9 else max(0.0, min(1.0, (p-a).dot(ab)/L2))
    return (p - (a + t*ab)).length


def _rotY(p, ang, S):
    r = p - S; c, s = math.cos(ang), math.sin(ang)
    return S + Vector((r.x*c + r.z*s, r.y, -r.x*s + r.z*c))


def _weights_at(p, segd, bones, K=5, P=3.0):
    ds = sorted(((dseg(p, *segd[b]), b) for b in bones), key=lambda x: x[0])[:K]
    ws = [(1.0/max(d, 1e-4))**P for d, _ in ds]; tot = sum(ws)
    return {b: w/tot for (d, b), w in zip(ds, ws)}


def _import_base():
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(BASE_GLB))
    o = next(x for x in (set(bpy.data.objects) - before) if x.type == "MESH")
    o.name = "AuthoredBase05H"
    # glTF splits verts at normal/UV seams -> weld back to the ~12.5k quad cage
    bm = bmesh.new(); bm.from_mesh(o.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    bm.to_mesh(o.data); bm.free()
    return o


def _align(o, arm):
    """Scale to ~1.75 m, ground, centre X."""
    core.apply_transforms(o)
    mn, mx, sz = core.world_bounds([o]); f = 1.75 / sz.z
    o.scale = (f, f, f); bpy.context.view_layer.update(); core.apply_transforms(o)
    mn, mx, sz = core.world_bounds([o])
    o.location.x -= (mn.x + mx.x)/2; o.location.z -= mn.z
    bpy.context.view_layer.update(); core.apply_transforms(o)


def build_authored_base(arm, raise_deg=84.0, tag="ElectricHero05H", neutral_mat=True):
    """Import the CC0 base, re-pose arms to T, skin to `arm`. Returns the skinned object."""
    RAISE = math.radians(raise_deg)
    base = _import_base()
    _align(base, arm)
    me = base.data

    seg = {b.name: (b.head_local.copy(), b.tail_local.copy()) for b in arm.data.bones}
    sh = {"l": arm.data.bones["upperarm_l"].head_local.copy(),
          "r": arm.data.bones["upperarm_r"].head_local.copy()}
    # re-pose bone config: arm bones rotated down to match the arms-down mesh
    reposeseg = dict(seg)
    for side, ang in (("l", +RAISE), ("r", -RAISE)):
        S = sh[side]
        for bn in (ARML if side == "l" else ARMR):
            a, b = seg[bn]; reposeseg[bn] = (_rotY(a, ang, S), _rotY(b, ang, S))

    # smooth linear-blend re-pose. All bones weight (legs self-claim), but the ROTATION AMOUNT
    # is a smoothstep of the arm weight so an arm-dominant vert rotates FULLY (rigid arm, no
    # droop) while legs/torso stay put and the shoulder crease blends (no sail).
    def ss(t): t = max(0.0, min(1.0, t)); return t*t*(3-2*t)
    Pl = Vector((sh["l"].x, 0, sh["l"].z)); Pr = Vector((sh["r"].x, 0, sh["r"].z))
    trans = []
    for vi, v in enumerate(me.vertices):
        w = _weights_at(v.co, reposeseg, DEFORM, K=6, P=3.0)
        wL = sum(w.get(b, 0.0) for b in ARML); wR = sum(w.get(b, 0.0) for b in ARMR)
        fL = ss((wL - 0.25)/0.35); fR = ss((wR - 0.25)/0.35)
        if fL + fR < 0.01:
            continue
        s = min(1.0, fL + fR); fL, fR = fL*s/(fL+fR), fR*s/(fL+fR)  # keep blend <= 1
        v.co = fL*_rotY(v.co, -RAISE, Pl) + fR*_rotY(v.co, +RAISE, Pr) + (1.0-fL-fR)*v.co
        if 0.12 < max(fL, fR) < 0.88:
            trans.append(vi)
    me.update()
    # relax the shoulder-transition ring to fair out any residual armpit web
    bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
    sv = [bm.verts[i] for i in trans]
    for _ in range(4):
        bmesh.ops.smooth_vert(bm, verts=sv, factor=0.4,
                              use_axis_x=True, use_axis_y=True, use_axis_z=True)
    bm.to_mesh(me); bm.free(); me.update()

    # tighten the hands: pull hand-dominant verts toward the hand-bone axis (kill finger splay)
    for side in ("l", "r"):
        hb = seg[f"hand_{side}"]; up = seg[f"upperarm_{side}"]
        for v in me.vertices:
            w = _weights_at(v.co, seg, DEFORM)
            if w.get(f"hand_{side}", 0.0) < 0.55:
                continue
            a, b = hb; ab = b - a; L2 = ab.dot(ab)
            t = 0.0 if L2 < 1e-9 else max(0.0, min(1.0, (v.co-a).dot(ab)/L2))
            axis = a + t*ab
            v.co = axis + (v.co - axis) * 0.62
    me.update()

    # deterministic inverse-distance skin to the T-rest deform bones
    for bn in DEFORM:
        base.vertex_groups.new(name=bn)
    vg = {bn: base.vertex_groups[bn] for bn in DEFORM}
    for vi, v in enumerate(me.vertices):
        for bn, w in _weights_at(v.co, seg, DEFORM, K=5, P=3.0).items():
            vg[bn].add([vi], w, "REPLACE")
    m = base.modifiers.new("Armature", "ARMATURE"); m.object = arm
    base.parent = arm

    if neutral_mat:
        mat = bpy.data.materials.new("mat_authored_skin"); mat.use_nodes = True
        b = mat.node_tree.nodes["Principled BSDF"]
        b.inputs["Base Color"].default_value = (*config.PALETTE["skin_01"], 1)
        b.inputs["Roughness"].default_value = 0.72
        me.materials.clear(); me.materials.append(mat)
        for p in me.polygons:
            p.use_smooth = True
    core.set_custom_props(base, {"studio_role": tag, "studio_class": "character",
                                 "studio_base": "cc0-blender-studio-human-base-meshes-v1.0.0"})
    return base


# ---------------------------------------------------------------------------
# Iteration 2 — fitted workwear authored as offset shells of the base body.
# A garment is a duplicate of the relevant body region pushed out along its normals; it
# inherits the body's skin weights, so it deforms identically under the six clips and can never
# be a detached pod/box/ring (the 05F/05G rejections). Belt/radio/hat are small authored pieces.
# ---------------------------------------------------------------------------

def _solid_mat(name, color, rough=0.7, metallic=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metallic
    return m


def _region_weight(v, gidx):
    return sum(g.weight for g in v.groups if g.group in gidx)


def _garment(base, arm, name, region_bones, thickness, mat, keep=None):
    """Duplicate the base, keep only `region_bones`-weighted verts, offset along normals,
    optional `keep(co)->bool` trim. Inherits skin weights; binds to `arm`."""
    o = base.copy(); o.data = base.data.copy(); o.name = name
    bpy.context.scene.collection.objects.link(o)
    gidx = {o.vertex_groups[b].index for b in region_bones if b in o.vertex_groups}
    me = o.data
    bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
    dl = bm.verts.layers.deform.active
    dead = []
    for v in bm.verts:
        w = sum(val for gi, val in v[dl].items() if gi in gidx) if dl else 0.0
        if w < 0.5 or (keep is not None and not keep(v.co)):
            dead.append(v)
    bmesh.ops.delete(bm, geom=dead, context="VERTS")
    bm.normal_update()
    for v in bm.verts:
        v.co = v.co + v.normal * thickness
    bm.to_mesh(me); bm.free()
    # strip stray islands the trim may have left, re-shade, material
    core.remove_small_islands(o, min_verts=8)
    me.materials.clear(); me.materials.append(mat)
    for p in me.polygons: p.use_smooth = True
    for m in list(o.modifiers): o.modifiers.remove(m)
    am = o.modifiers.new("Armature", "ARMATURE"); am.object = arm; o.parent = arm
    core.set_custom_props(o, {"studio_class": "garment"})
    return o


def _rigid_piece(mb_obj, arm, bone, mat, name):
    """Bind a small authored mesh rigidly to one bone."""
    mb_obj.name = name
    mb_obj.vertex_groups.new(name=bone)
    vg = mb_obj.vertex_groups[bone]
    vg.add([v.index for v in mb_obj.data.vertices], 1.0, "REPLACE")
    mb_obj.data.materials.clear(); mb_obj.data.materials.append(mat)
    for p in mb_obj.data.polygons: p.use_smooth = True
    am = mb_obj.modifiers.new("Armature", "ARMATURE"); am.object = arm; mb_obj.parent = arm
    core.set_custom_props(mb_obj, {"studio_class": "garment"})
    return mb_obj


def build_workwear(base, arm):
    """Author the Electric role's fitted workwear over `base`. Returns the list of pieces."""
    from .meshgen import MeshBuilder, T
    P = config.PALETTE
    pieces = []
    seg = {b.name: (b.head_local.copy(), b.tail_local.copy()) for b in arm.data.bones}
    waist_z = seg["spine_01"][0].z    # ~1.05
    hip_z = seg["pelvis"][0].z        # ~0.92

    # SHIRT — torso + arms, hem at the hip, sleeve to wrist
    shirt = _garment(base, arm, "Hero05H_Shirt",
                     ["spine_01","spine_02","spine_03","neck_01",
                      "clavicle_l","clavicle_r","upperarm_l","upperarm_r","lowerarm_l","lowerarm_r"],
                     0.013, _solid_mat("mat_h_shirt", P["work_shirt_blue"], 0.75),
                     keep=lambda c: c.z > hip_z - 0.02)
    pieces.append(shirt)

    # TROUSERS — pelvis + legs, waistband at the hip, to the ankle
    trousers = _garment(base, arm, "Hero05H_Trousers",
                        ["pelvis","thigh_l","thigh_r","calf_l","calf_r"],
                        0.015, _solid_mat("mat_h_trousers", P["trousers_grey"], 0.8),
                        keep=lambda c: c.z < waist_z + 0.02 and c.z > 0.16)
    pieces.append(trousers)

    # BOOTS — feet + lower calf
    boots = _garment(base, arm, "Hero05H_Boots",
                     ["foot_l","foot_r","ball_l","ball_r","calf_l","calf_r"],
                     0.02, _solid_mat("mat_h_boots", P["leather_brown"], 0.55),
                     keep=lambda c: c.z < 0.22)
    pieces.append(boots)

    # VEST — chest + back shell, fitted (NOT a pod), open front, from shoulders to just below waist
    vest_top = seg["spine_03"][1].z + 0.04
    vest = _garment(base, arm, "Hero05H_Vest",
                    ["spine_01","spine_02","spine_03"], 0.036,
                    _solid_mat("mat_h_vest", P["vest_olive"], 0.65),
                    keep=lambda c: c.z < vest_top and c.z > waist_z - 0.10
                    and not (abs(c.x) < 0.05 and c.y < -0.03))   # open the front centre
    pieces.append(vest)

    # REFLECTIVE BANDS — two bright hi-viz strips wrapping the vest (follow the surface)
    hi = _solid_mat("mat_h_hiviz", (0.96, 0.82, 0.16), 0.35)
    for bz in (seg["spine_02"][0].z + 0.02, seg["spine_02"][0].z - 0.10):
        band = _garment(base, arm, f"Hero05H_Band_{bz:.2f}", ["spine_01","spine_02","spine_03"], 0.040, hi,
                        keep=lambda c, z=bz: abs(c.z - z) < 0.032 and not (abs(c.x) < 0.05 and c.y < -0.03))
        pieces.append(band)

    # BELT — a slim ring of small boxes at the waist
    import mathutils
    belt_mb = MeshBuilder()
    for i in range(28):
        a = (i/28)*2*math.pi
        belt_mb.add_box(size=(0.03, 0.03, 0.05),
                        matrix=mathutils.Matrix.Translation((0.17*math.cos(a), 0.11*math.sin(a), hip_z+0.03)))
    belt = belt_mb.finish("Hero05H_Belt")
    bpy.context.scene.collection.objects.link(belt)
    _rigid_piece(belt, arm, "pelvis", _solid_mat("mat_h_belt", P["leather_brown"], 0.5), "Hero05H_Belt")
    pieces.append(belt)

    # RADIO — small box on the right hip
    radio_mb = MeshBuilder()
    radio_mb.add_box(size=(0.05, 0.035, 0.09),
                     matrix=mathutils.Matrix.Translation((0.17, 0.02, hip_z + 0.02)))
    radio = radio_mb.finish("Hero05H_Radio")
    bpy.context.scene.collection.objects.link(radio)
    _rigid_piece(radio, arm, "thigh_r", _solid_mat("mat_h_radio", P["steel_dark"], 0.4, 0.6), "Hero05H_Radio")
    pieces.append(radio)

    # HARD HAT — a dome over the head
    head_top = seg["Head"][1].z
    hat_mb = MeshBuilder()
    hat_mb.add_uvsphere(0.115, u=20, v=10, matrix=T(0, -0.01, head_top - 0.02))
    hat_mb.add_cylinder(0.135, 0.02, segments=20, matrix=T(0, -0.01, head_top - 0.055))  # brim
    hat = hat_mb.finish("Hero05H_Hat")
    bpy.context.scene.collection.objects.link(hat)
    # keep only the upper hemisphere of the dome
    hbm = bmesh.new(); hbm.from_mesh(hat.data)
    bmesh.ops.delete(hbm, geom=[v for v in hbm.verts if v.co.z < head_top - 0.055], context="VERTS")
    hbm.to_mesh(hat.data); hbm.free()
    _rigid_piece(hat, arm, "Head", _solid_mat("mat_h_hat", P["hardhat_amber"], 0.4), "Hero05H_Hat")
    pieces.append(hat)

    return pieces
