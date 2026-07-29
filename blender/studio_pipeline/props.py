"""Film-production props & equipment (Asset Lab 05 design bible).

Stylized/low-poly, 1 u = 1 m real dimensions. A representative production set for a working
soundstage/apron. Hand-attachable props (clapperboard, boom, megaphone) are authored with the
grip at the origin and carry a `studio_attach` bone tag so they parent to a Mannequin hand
bone with an identity offset. No collision/physics is built here (isolation) — just geometry.
"""
import math
import bpy
from mathutils import Matrix
from . import config, core, materials
from .meshgen import MeshBuilder, T, S, R, segment_matrix


def _finish(mb, name, mats, role, attach=None, smooth=False):
    obj = mb.finish(name, materials=mats, shade_smooth=smooth)
    bpy.context.scene.collection.objects.link(obj)
    props = {"studio_role": role, "studio_class": "prop", **config.PROVENANCE}
    if attach:
        props["studio_attach"] = attach
    core.set_custom_props(obj, props)
    return obj


def _tripod(mb, top_z, leg_r=0.9, mat_leg=1):
    for a in range(3):
        ang = a * 2 * math.pi / 3
        foot = (math.cos(ang) * leg_r, math.sin(ang) * leg_r, 0.0)
        mb.add_segment(foot, (0, 0, top_z), 0.025, mat=mat_leg)


def studio_camera(mats):
    """Studio camera on tripod + dolly deck."""
    mb = MeshBuilder()
    deck_z = 0.08
    mb.add_box(size=(1.0, 0.7, deck_z), matrix=T(0, 0, deck_z / 2), mat=3)                 # dolly deck
    for sx in (-1, 1):
        for sy in (-1, 1):
            mb.add_cylinder(0.08, 0.06, segments=12, matrix=T(sx * 0.42, sy * 0.28, 0.03) @ R("X", math.pi/2), mat=1)  # wheels
    _tripod(mb, 1.45, leg_r=0.5, mat_leg=1)
    mb.add_box(size=(0.4, 0.55, 0.34), matrix=T(0, 0, 1.55), mat=0)                        # body
    mb.add_cylinder(0.11, 0.28, segments=16, matrix=T(0, -0.42, 1.6) @ R("X", math.pi/2), mat=1)   # lens (+Y front? -Y here)
    mb.add_cylinder(0.24, 0.10, segments=20, matrix=T(0.0, 0.05, 1.85), mat=2)             # film magazine
    mb.add_cylinder(0.24, 0.10, segments=20, matrix=T(0.0, 0.28, 1.85), mat=2)
    mb.add_segment((0.2, 0.1, 1.55), (0.55, 0.5, 1.15), 0.02, mat=1)                       # pan handle
    return _finish(mb, "Prop_StudioCamera", [mats["steel_dark"], mats["metal"], mats["paint_maroon"], mats["wood"]], "camera", smooth=True)


def fresnel_light(mats):
    """Fresnel spotlight (junior) on a stand."""
    mb = MeshBuilder()
    _tripod(mb, 0.65, leg_r=0.45, mat_leg=1)
    mb.add_cylinder(0.03, 1.4, segments=10, matrix=T(0, 0, 1.35), mat=1)                   # riser
    head_z = 1.9
    mb.add_cylinder(0.16, 0.34, segments=20, matrix=T(0, 0.0, head_z) @ R("X", math.pi/2), mat=0)  # head barrel
    mb.add_cone(0.20, 0.16, 0.10, segments=20, matrix=T(0, -0.20, head_z) @ R("X", -math.pi/2), mat=2)  # lens ring
    for a in range(4):                                                                     # barn doors
        ang = a * math.pi / 2
        mb.add_box(size=(0.22, 0.02, 0.12), matrix=T(0, -0.28, head_z) @ R("Y", ang) @ T(0, 0, 0.14), mat=0)
    mb.add_box(size=(0.10, 0.16, 0.10), matrix=T(0, 0.18, head_z), mat=0)                  # yoke/housing
    return _finish(mb, "Prop_Fresnel", [mats["steel_dark"], mats["metal"], mats["glass"]], "light", smooth=True)


def c_stand(mats):
    """C-stand with grip arm."""
    mb = MeshBuilder()
    for a in range(3):
        ang = a * 2 * math.pi / 3
        mb.add_segment((0, 0, 0.02), (math.cos(ang) * 0.5, math.sin(ang) * 0.5, 0.0), 0.02, mat=0)
    mb.add_cylinder(0.022, 2.4, segments=10, matrix=T(0, 0, 1.2), mat=0)                   # column
    mb.add_cylinder(0.016, 0.9, segments=8, matrix=T(0.45, 0, 2.3) @ R("Y", math.pi/2), mat=0)  # grip arm
    mb.add_cylinder(0.03, 0.05, segments=10, matrix=T(0, 0, 2.35), mat=1)                  # knuckle
    mb.add_cylinder(0.03, 0.05, segments=10, matrix=T(0.9, 0, 2.3), mat=1)
    return _finish(mb, "Prop_CStand", [mats["steel_dark"], mats["metal"]], "grip", smooth=True)


def apple_box(mats):
    """Apple box (full)."""
    mb = MeshBuilder()
    mb.add_box(size=(0.508, 0.305, 0.203), matrix=T(0, 0, 0.101), mat=0)
    for sy in (-1, 1):                                                                     # hand holes = dark insets
        mb.add_box(size=(0.16, 0.02, 0.07), matrix=T(0, sy * 0.153, 0.101), mat=1)
    obj = _finish(mb, "Prop_AppleBox_Full", [mats["wood"], mats["steel_dark"]], "grip")
    from . import paint
    paint.fill(obj, config.PALETTE["wood_scaffold"]); paint.noise_tint(obj, 0.1, seed=5, cell=0.2)
    return obj


def directors_chair(mats):
    """Folding director's canvas chair."""
    mb = MeshBuilder()
    seat_z = 0.5
    for sx in (-1, 1):                                                                     # crossed legs
        mb.add_segment((sx * 0.24, -0.22, 0), (sx * 0.24, 0.22, seat_z + 0.02), 0.022, mat=0)
        mb.add_segment((sx * 0.24, 0.22, 0), (sx * 0.24, -0.22, seat_z + 0.02), 0.022, mat=0)
    mb.add_box(size=(0.5, 0.44, 0.03), matrix=T(0, 0, seat_z), mat=1)                      # canvas seat
    mb.add_box(size=(0.5, 0.03, 0.22), matrix=T(0, -0.2, seat_z + 0.34), mat=1)            # canvas back
    for sx in (-1, 1):
        mb.add_cylinder(0.02, 0.44, segments=8, matrix=T(sx * 0.24, -0.2, seat_z + 0.22), mat=0)
    return _finish(mb, "Prop_DirectorsChair", [mats["wood"], mats["canvas"]], "set", smooth=True)


def cable_reel(mats):
    """Cable reel (stinger)."""
    mb = MeshBuilder()
    mb.add_cylinder(0.35, 0.02, segments=24, matrix=T(0, -0.24, 0.35) @ R("X", math.pi/2), mat=0)
    mb.add_cylinder(0.35, 0.02, segments=24, matrix=T(0, 0.24, 0.35) @ R("X", math.pi/2), mat=0)
    mb.add_cylinder(0.14, 0.48, segments=16, matrix=T(0, 0, 0.35) @ R("X", math.pi/2), mat=1)  # hub
    mb.add_cylinder(0.24, 0.44, segments=20, matrix=T(0, 0, 0.35) @ R("X", math.pi/2), mat=2)  # coiled cable
    mb.add_segment((0.30, 0, 0.35), (0.30, 0, 0.7), 0.02, mat=0)                           # frame handle
    return _finish(mb, "Prop_CableReel", [mats["steel_dark"], mats["metal"], mats["paint_green"]], "electric", smooth=True)


def clapperboard(mats):
    """Clapperboard / slate — HAND-ATTACHABLE (hand_l)."""
    mb = MeshBuilder()
    mb.add_box(size=(0.28, 0.015, 0.24), matrix=T(0, 0, 0.12), mat=0)                      # slate
    mb.add_box(size=(0.28, 0.02, 0.045), matrix=T(0, 0, 0.27), mat=1)                      # clap stick
    for i in range(5):                                                                     # diagonal stripes
        mb.add_box(size=(0.045, 0.025, 0.05), matrix=T(-0.11 + i * 0.055, 0, 0.29), mat=2)
    return _finish(mb, "Prop_Slate_attach_hand_l", [mats["steel_dark"], mats["wood"], mats["canvas"]],
                   "camera", attach="hand_l", smooth=False)


def boom_mic(mats):
    """Boom microphone on fishpole — HAND-ATTACHABLE (hand_r)."""
    mb = MeshBuilder()
    mb.add_cylinder(0.018, 2.8, segments=10, matrix=T(0, 1.2, 0) @ R("X", math.pi/2), mat=0)   # pole along +Y
    mb.add_cylinder(0.05, 0.32, segments=14, matrix=T(0, 2.7, 0) @ R("X", math.pi/2), mat=1)   # zeppelin
    mb.add_cone(0.05, 0.03, 0.1, segments=12, matrix=T(0, 2.9, 0) @ R("X", -math.pi/2), mat=1)
    return _finish(mb, "Prop_Boom_attach_hand_r", [mats["metal"], mats["steel_dark"]], "sound",
                   attach="hand_r", smooth=True)


def megaphone(mats):
    """Megaphone — HAND-ATTACHABLE (hand_r)."""
    mb = MeshBuilder()
    mb.add_cone(0.03, 0.12, 0.34, segments=18, matrix=T(0, 0.17, 0) @ R("X", -math.pi/2), mat=0)  # cone +Y
    mb.add_cylinder(0.035, 0.08, segments=12, matrix=T(0, 0, 0), mat=1)                    # grip
    return _finish(mb, "Prop_Megaphone_attach_hand_r", [mats["paint_maroon"], mats["steel_dark"]], "director",
                   attach="hand_r", smooth=True)


def build_all_props():
    lib = materials.library()
    return [
        studio_camera(lib), fresnel_light(lib), c_stand(lib), apple_box(lib), directors_chair(lib),
        cable_reel(lib), clapperboard(lib), boom_mic(lib), megaphone(lib),
    ]
