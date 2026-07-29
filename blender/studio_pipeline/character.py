"""Crew character system — "Grounded Studio Crew v1" (locked design bible, Asset Lab 05).

Roles are DATA (ROLES table). A character is built by:
  1. overlapping body + costume-silhouette primitives placed at the canonical rig's rest joints
  2. voxel-remesh fuse -> decimate to budget -> ONE continuous skin
  3. automatic bone-heat weights -> limit to 4 influences  (clean deform under all 43 CC0 clips)
  4. join a Head-weighted face card + headwear -> single skinned mesh
Role read is silhouette + costume + palette (tint is the weakest signal), per the bible.
Bones/vertex-groups are NEVER renamed — every group is a real UAL Mannequin bone.
"""
import bpy
from mathutils import Vector, Matrix
from . import config, core, rig, materials, paint
from .meshgen import MeshBuilder, T, S, segment_matrix

BODY_TARGET_TRIS = 2300

# role -> costume/palette config (a new role is a row, not a new model)
ROLES = {
    "Grip":      dict(size="standard", skin="skin_02", hair="hair_dark",  shirt="work_shirt_blue", trousers="trousers_grey",
                      belt=True, vest=False, coil=False, coat=False, apron=False, satchel=False,
                      hat="flatcap", hat_col="felt_grey", mustache=True),
    "Electric":  dict(size="heavy",    skin="skin_01", hair="hair_brown", shirt="work_shirt_tan",  trousers="trousers_brown",
                      belt=True, vest=True, coil=True, coat=False, apron=False, satchel=False,
                      hat="hardhat", hat_col="hardhat_amber", mustache=False),
    "CameraDP":  dict(size="standard", skin="skin_03", hair="hair_dark",  shirt="work_shirt_blue", trousers="trousers_grey",
                      belt=False, vest=False, coil=False, coat=False, apron=False, satchel=False,
                      hat="flatcap", hat_col="felt_brown", mustache=False),
    "Director":  dict(size="standard", skin="skin_04", hair="hair_grey",  shirt="coat_charcoal",   trousers="trousers_grey",
                      belt=False, vest=False, coil=False, coat=True, apron=False, satchel=False,
                      hat="fedora", hat_col="felt_brown", mustache=True),
    "PA":        dict(size="standard", skin="skin_01", hair="hair_brown", shirt="work_shirt_tan",  trousers="trousers_brown",
                      belt=False, vest=False, coil=False, coat=False, apron=False, satchel=True,
                      hat=None, hat_col="felt_grey", mustache=False),
    "Carpenter": dict(size="heavy",    skin="skin_03", hair="hair_grey",  shirt="work_shirt_tan",  trousers="trousers_brown",
                      belt=True, vest=False, coil=False, coat=False, apron=True, satchel=False,
                      hat="watchcap", hat_col="felt_grey", mustache=True),
}

SIZE = {"standard": dict(scale=1.0, girth=1.0), "heavy": dict(scale=0.985, girth=1.14)}


def crew_materials():
    P = config.PALETTE
    return {
        "skin_01": materials.solid("mat_skin_01", P["skin_01"], roughness=0.7),
        "skin_02": materials.solid("mat_skin_02", P["skin_02"], roughness=0.7),
        "skin_03": materials.solid("mat_skin_03", P["skin_03"], roughness=0.7),
        "skin_04": materials.solid("mat_skin_04", P["skin_04"], roughness=0.7),
        "work_shirt_blue": materials.solid("mat_shirt_blue", P["work_shirt_blue"], roughness=0.85, use_vcol=True),
        "work_shirt_tan":  materials.solid("mat_shirt_tan",  P["work_shirt_tan"],  roughness=0.85, use_vcol=True),
        "coat_charcoal":   materials.solid("mat_coat",       P["coat_charcoal"],   roughness=0.7),
        "trousers_grey":   materials.solid("mat_trousers_grey",  P["trousers_grey"],  roughness=0.85),
        "trousers_brown":  materials.solid("mat_trousers_brown", P["trousers_brown"], roughness=0.85),
        "leather":  materials.solid("mat_leather",  P["leather_brown"], roughness=0.5, metallic=0.0),
        "felt_grey":  materials.solid("mat_felt_grey",  P["felt_grey"],  roughness=0.9),
        "felt_brown": materials.solid("mat_felt_brown", P["felt_brown"], roughness=0.9),
        "hardhat_amber": materials.solid("mat_hardhat", P["hardhat_amber"], roughness=0.35),
        "canvas": materials.solid("mat_char_canvas", P["apron_canvas"], roughness=0.95, use_vcol=True),
        "satchel": materials.solid("mat_satchel", P["satchel_tan"], roughness=0.7),
    }


def _body_primitives(mb, P, cfg, mats_idx):
    """Add body + costume-silhouette volumes to `mb`. mats_idx maps material slot names->idx."""
    g = SIZE[cfg["size"]]["girth"]
    body = mats_idx["shirt"]
    leg = mats_idx["trousers"]
    skin = mats_idx["skin"]
    leather = mats_idx["leather"]

    def h(n): return P[n]["head"]
    def c(n): return P[n]["center"]

    def ext(p0, p1, ov=0.03):
        p0, p1 = Vector(p0), Vector(p1)
        d = (p1 - p0).normalized()
        return (p0 - d * ov, p1 + d * ov)

    # --- torso (shirt) ---
    mb.add_box(size=(0.34 * g, 0.23 * g, 0.22), matrix=T(*((h("pelvis") + h("spine_01")) * 0.5)), mat=body)
    mb.add_box(size=(0.33 * g, 0.22 * g, 0.30), matrix=T(*c("spine_02")), mat=body)
    mb.add_box(size=(0.40 * g, 0.24 * g, 0.22), matrix=T(*(c("spine_03") + Vector((0, 0, 0.02)))), mat=body)
    # neck + head (skin) — head is an ovoid; face card added later
    mb.add_cylinder(0.062, 0.13, matrix=T(*c("neck_01")), mat=skin)
    mb.add_uvsphere(0.125, u=16, v=12,
                    matrix=T(*(c("Head") + Vector((0, -0.02, 0.03)))) @ Matrix.Diagonal((1, 1.0, 1.14, 1)), mat=skin)

    # costume: vest (extra torso bulk)
    if cfg["vest"]:
        mb.add_box(size=(0.44 * g, 0.28 * g, 0.30), matrix=T(*c("spine_02")), mat=body)
    # coat (director): long tapered skirt spine_03 -> knees, taller read
    if cfg["coat"]:
        top = c("spine_03") + Vector((0, 0, 0.02))
        mid = (h("thigh_l") + h("thigh_r")) * 0.5 + Vector((0, 0.02, -0.10))
        mb.add_box(size=(0.46, 0.30, 0.24), matrix=T(*top), mat=body)
        a, b = ext(top, mid, 0.02)
        mb.add_cone(0.30, 0.34, (b - a).length, matrix=segment_matrix(a, b, 0), mat=body)
    # apron (carpenter): flat front panel chest->thigh
    if cfg["apron"]:
        ax = 0.0
        az = (c("spine_02").z + h("thigh_l").z) * 0.5
        mb.add_box(size=(0.34, 0.06, 0.62), matrix=T(ax, 0.15, az), mat=mats_idx["canvas"])   # +Y front
    # tool belt (grip/electric/carpenter): waist ring
    if cfg["belt"]:
        wz = h("pelvis").z + 0.02
        mb.add_box(size=(0.40 * g, 0.30 * g, 0.07), matrix=T(0, 0, wz), mat=leather)
        mb.add_box(size=(0.10, 0.14, 0.12), matrix=T(0.20, 0.08, wz - 0.03), mat=leather)   # pouch (+Y front)
    # satchel (PA): bag on the hip (+Y front) + strap across the chest
    if cfg["satchel"]:
        mb.add_box(size=(0.22, 0.10, 0.20), matrix=T(-0.20, 0.12, h("pelvis").z + 0.10), mat=mats_idx["satchel"])
        mb.add_box_between(h("clavicle_r"), (-0.20, 0.12, h("pelvis").z + 0.16), 0.05, 0.02, mat=mats_idx["satchel"])
    # cable coil (electric): torus-ish over left shoulder
    if cfg["coil"]:
        sh = h("clavicle_l") + Vector((0.02, 0.02, 0.02))
        for k in range(3):
            mb.add_cylinder(0.10, 0.03, segments=14, matrix=T(sh.x, sh.y, sh.z - k * 0.03) @ Matrix.Rotation(1.2, 4, "X"), mat=leather)

    # --- arms ---
    for s in ("l", "r"):
        sgn = 1 if s == "l" else -1
        mb.add_uvsphere(0.072 * g, matrix=T(*h(f"upperarm_{s}")), mat=body)
        a, b = ext(h(f"upperarm_{s}"), h(f"lowerarm_{s}"))
        mb.add_cylinder(0.052 * g, (b - a).length, matrix=segment_matrix(a, b, 0.052), mat=body)
        mb.add_uvsphere(0.05, matrix=T(*h(f"lowerarm_{s}")), mat=skin)     # forearm skin (rolled sleeves)
        a, b = ext(h(f"lowerarm_{s}"), h(f"hand_{s}"))
        mb.add_cone(0.05, 0.037, (b - a).length, matrix=segment_matrix(a, b, 0), mat=skin)
        hb = h(f"hand_{s}")
        mb.add_box(size=(0.10, 0.085, 0.037), matrix=T(hb.x + 0.075 * sgn, hb.y, hb.z), mat=skin)   # mitten
        # --- legs ---
        mb.add_uvsphere(0.088 * g, matrix=T(*h(f"thigh_{s}")), mat=leg)
        a, b = ext(h(f"thigh_{s}"), h(f"calf_{s}"))
        mb.add_cone(0.088 * g, 0.062, (b - a).length, matrix=segment_matrix(a, b, 0), mat=leg)
        mb.add_uvsphere(0.06, matrix=T(*h(f"calf_{s}")), mat=leg)
        a, b = ext(h(f"calf_{s}"), h(f"foot_{s}"))
        mb.add_cone(0.062, 0.05, (b - a).length, matrix=segment_matrix(a, b, 0), mat=leg)
        fb = h(f"foot_{s}")
        mb.add_box(size=(0.095, 0.27, 0.075), matrix=T(fb.x, fb.y + 0.075, 0.037), mat=leather)   # shoe


def _headwear(P, cfg, mat):
    """Separate hat mesh, later weighted 100% to Head. Returns object or None."""
    kind = cfg["hat"]
    if not kind:
        return None
    c = P["Head"]["center"] + Vector((0, -0.005, 0.03))
    top = c.z + 0.115
    mb = MeshBuilder()
    if kind == "hardhat":
        mb.add_uvsphere(0.135, u=16, v=8, matrix=T(c.x, c.y, top - 0.02) @ Matrix.Diagonal((1, 1, 0.7, 1)), mat=0)
        mb.add_cylinder(0.18, 0.02, segments=20, matrix=T(c.x, c.y + 0.02, top - 0.05), mat=0)
    elif kind == "fedora":
        mb.add_cylinder(0.19, 0.02, segments=24, matrix=T(c.x, c.y, top - 0.02), mat=0)          # brim
        mb.add_cone(0.115, 0.10, 0.13, segments=20, matrix=T(c.x, c.y, top + 0.05), mat=0)       # crown
    elif kind == "flatcap":
        mb.add_uvsphere(0.135, u=16, v=8, matrix=T(c.x, c.y, top - 0.03) @ Matrix.Diagonal((1, 1.1, 0.55, 1)), mat=0)
        mb.add_box(size=(0.16, 0.10, 0.015), matrix=T(c.x, c.y + 0.13, top - 0.02), mat=0)       # bill (+Y front)
    elif kind == "watchcap":
        mb.add_uvsphere(0.135, u=16, v=8, matrix=T(c.x, c.y, top - 0.04) @ Matrix.Diagonal((1, 1, 0.65, 1)), mat=0)
    obj = mb.finish("Hat", materials=[mat], shade_smooth=True)
    return obj


def _face_card(P, face_mat):
    """A curved quad in front of the head carrying the painted-face texture; weighted to Head."""
    c = P["Head"]["center"] + Vector((0, -0.005, 0.03))
    w, hgt = 0.19, 0.22
    z0, z1 = c.z - hgt * 0.5, c.z + hgt * 0.5
    y = c.y + 0.145                      # rig faces +Y; sit the card just in front of the head
    verts, faces, uvs = [], [], []
    nx, nz = 3, 3
    for iz in range(nz):
        for ix in range(nx):
            u = ix / (nx - 1)
            v = iz / (nz - 1)
            x = c.x - (u - 0.5) * w      # mirror u so texture reads correctly from the front
            z = z0 + v * hgt
            yb = y - (abs(u - 0.5) ** 2) * 0.06 - (abs(v - 0.5) ** 2) * 0.04  # edges recede toward head
            verts.append((x, yb, z))
            uvs.append((u, v))
    for iz in range(nz - 1):
        for ix in range(nx - 1):
            a = iz * nx + ix
            faces.append((a, a + 1, a + 1 + nx, a + nx))
    me = bpy.data.meshes.new("FaceCard")
    me.from_pydata(verts, [], faces)
    me.update()
    uvl = me.uv_layers.new(name="UVMap")
    for poly in me.polygons:
        for li in poly.loop_indices:
            uvl.data[li].uv = uvs[me.loops[li].vertex_index]
    me.materials.append(face_mat)
    for p in me.polygons:
        p.use_smooth = True
    return bpy.data.objects.new("FaceCard", me)


def _weight_all_to(obj, bone):
    vg = obj.vertex_groups.new(name=bone)
    vg.add([v.index for v in obj.data.vertices], 1.0, "REPLACE")


def build_character(role, arm, seed=1):
    """Build one crew character parented to `arm`. Returns the single skinned mesh object."""
    cfg = ROLES[role]
    P = rig.rest_points(arm)
    cm = crew_materials()
    # material slot order for the body mesh
    slot_names = ["shirt", "trousers", "skin", "leather", "canvas", "satchel"]
    slot_mats = {
        "shirt": cm[cfg["shirt"]], "trousers": cm[cfg["trousers"]], "skin": cm[cfg["skin"]],
        "leather": cm["leather"], "canvas": cm["canvas"], "satchel": cm["satchel"],
    }
    mats_idx = {name: i for i, name in enumerate(slot_names)}
    mats_idx["shirt"] = 0
    body_mats = [slot_mats[n] for n in slot_names]

    mb = MeshBuilder()
    _body_primitives(mb, P, cfg, mats_idx)
    body = mb.finish(f"Char_{role}", materials=body_mats)
    bpy.context.scene.collection.objects.link(body)

    # fuse -> decimate
    core.select_only(body)
    m = body.modifiers.new("Remesh", "REMESH")
    m.mode = "VOXEL"; m.voxel_size = 0.030; m.adaptivity = 0.5
    bpy.ops.object.modifier_apply(modifier=m.name)
    core.remove_small_islands(body, min_verts=24)
    t0 = core.triangle_count(body)
    if t0 > BODY_TARGET_TRIS:
        d = body.modifiers.new("Dec", "DECIMATE")
        d.ratio = BODY_TARGET_TRIS / t0
        bpy.ops.object.modifier_apply(modifier=d.name)
    for p in body.data.polygons:
        p.use_smooth = True

    # Voxel-remesh collapses material slots -> use ONE shared vcol material and colour the body
    # by REGION via vertex colours (nearest-bone classification). Survives remesh; one draw call.
    body.data.materials.clear()
    body.data.materials.append(materials.solid("mat_crew", (1, 1, 1), roughness=0.85, use_vcol=True))
    skin_c = config.PALETTE[cfg["skin"]]; shirt_c = config.PALETTE[cfg["shirt"]]
    trouser_c = config.PALETTE[cfg["trousers"]]; leather_c = config.PALETTE["leather_brown"]
    region = {
        "Head": skin_c, "neck_01": skin_c, "hand_l": skin_c, "hand_r": skin_c,
        "lowerarm_l": skin_c, "lowerarm_r": skin_c,
        "spine_01": shirt_c, "spine_02": shirt_c, "spine_03": shirt_c,
        "clavicle_l": shirt_c, "clavicle_r": shirt_c, "upperarm_l": shirt_c, "upperarm_r": shirt_c, "pelvis": shirt_c,
        "thigh_l": trouser_c, "thigh_r": trouser_c, "calf_l": trouser_c, "calf_r": trouser_c,
        "foot_l": leather_c, "foot_r": leather_c, "ball_l": leather_c, "ball_r": leather_c,
    }
    paint.paint_by_region(body, arm, region)

    # automatic bone-heat weights -> limit 4
    bpy.ops.object.select_all(action="DESELECT")
    body.select_set(True); arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type="ARMATURE_AUTO")
    bpy.ops.object.select_all(action="DESELECT")
    body.select_set(True); bpy.context.view_layer.objects.active = body
    bpy.ops.object.vertex_group_limit_total(limit=4)

    # face card + headwear, weighted rigidly to Head, joined into the single skin
    face_img = materials.face_texture(f"face_{role}", config.PALETTE[cfg["skin"]],
                                      config.PALETTE[cfg["hair"]], seed=seed, mustache=cfg["mustache"])
    fm = bpy.data.materials.new(f"mat_faceimg_{role}")
    fm.use_nodes = True
    bsdf = fm.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Roughness"].default_value = 0.75
    tex = fm.node_tree.nodes.new("ShaderNodeTexImage"); tex.image = face_img
    uvn = fm.node_tree.nodes.new("ShaderNodeUVMap"); uvn.uv_map = "UVMap"   # pin: survives join
    fm.node_tree.links.new(uvn.outputs["UV"], tex.inputs["Vector"])
    fm.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])

    extras = []
    face = _face_card(P, fm)
    bpy.context.scene.collection.objects.link(face)
    _weight_all_to(face, "Head")
    paint.ensure_col(face)                    # white Col -> not darkened by merged COLOR_0
    extras.append(face)
    hat = _headwear(P, cfg, cm[cfg["hat_col"]] if cfg["hat"] else cm["felt_grey"])
    if hat:
        bpy.context.scene.collection.objects.link(hat)
        _weight_all_to(hat, "Head")
        paint.ensure_col(hat)
        extras.append(hat)

    # join extras into the body (single skinned mesh)
    bpy.ops.object.select_all(action="DESELECT")
    for e in extras:
        e.select_set(True)
    body.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()
    body.data.validate(verbose=False)         # clean any degenerate geo from remesh/join

    core.set_custom_props(body, {
        "studio_role": role, "studio_class": "character",
        "studio_build_size": cfg["size"], **config.PROVENANCE,
    })
    body.name = f"Char_{role}_{cfg['size'].capitalize()}"
    return body
