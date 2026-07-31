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
