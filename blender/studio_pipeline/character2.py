"""Crew character system v2 — "Readable Studio Crew" (Asset Lab 05B rebuild).

REPLACES the rejected voxel-remesh/paint-by-region/flat-face-card approach. Instead:
  * a deliberately authored low-poly humanoid built from primitives that are DIRECTLY skinned
    (SkinnedBuilder) to the canonical 65-bone UAL Mannequin — NO destructive voxel remesh,
    NO remove_small_islands, NO automatic bone-heat.
  * segmented-joint blend weighting (each limb rigid to its bone; a joint sphere blends the two
    adjacent bones) — the exact scheme the reference mannequin uses, so it deforms cleanly under
    all 43 CC0 clips without collapse.
  * REAL modeled face geometry (eyes, brows, nose, mouth) placed on the measured FRONT (-Y)
    hemisphere — physically cannot land on the back.
  * REAL clothing shells (shirt/coat torso + sleeves, trousers, boots) as distinct materials with
    visible silhouette boundaries (collar / cuff / waist / hem) — not paint.

COORDINATE STANDARD (measured, see docs/CHARACTER-COORDINATE-STANDARD.md):
  rig/character FORWARD = -Y in Blender (toes + nose point -Y). Build everything front-facing on
  -Y. Do NOT rotate the armature at build time. export_yup then maps -Y -> glTF/three.js +Z.
  ONE conversion, no stacked 180s.

Roles are DATA (ROLES). A role is a parameter row (palette + costume flags), never a new model.
Bones / vertex-group names are NEVER renamed — every group is a real UAL Mannequin bone.
"""
import math
import bpy
from mathutils import Vector, Matrix
from . import config, core, rig, materials
from .meshgen import T, S, R
from .skinning import SkinnedBuilder

# --- material slot order for the single skinned character mesh ---
# 0 skin | 1 shirt(upper garment) | 2 trousers(lower) | 3 leather(boots/belt) |
# 4 dark(hair + brows/mouth/pupil) | 5 white(eye) | 6 hat
SLOT = dict(skin=0, shirt=1, trousers=2, leather=3, dark=4, white=5, hat=6)

FORWARD = Vector((0.0, -1.0, 0.0))   # measured mannequin forward (see probe_orientation)

# role -> costume/palette config (a new role is a row, not a new model)
ROLES = {
    "PA":         dict(size="standard", skin="skin_01", hair="hair_brown", shirt="work_shirt_tan",  trousers="trousers_brown",
                       hat=None,        belt=False, coat=False),
    "Grip":       dict(size="standard", skin="skin_02", hair="hair_dark",  shirt="work_shirt_blue", trousers="trousers_grey",
                       hat="flatcap",   belt=True,  coat=False),
    "Electric":   dict(size="heavy",    skin="skin_01", hair="hair_brown", shirt="work_shirt_tan",  trousers="trousers_brown",
                       hat="hardhat",   belt=True,  coat=False),
    "Maintenance":dict(size="heavy",    skin="skin_03", hair="hair_grey",  shirt="work_shirt_blue", trousers="trousers_brown",
                       hat="hardhat",   belt=True,  coat=False),
    "Office":     dict(size="standard", skin="skin_04", hair="hair_grey",  shirt="coat_charcoal",   trousers="trousers_grey",
                       hat=None,        belt=False, coat=True),
    # extra existing roles kept only if they pass the same bar
    "CameraDP":   dict(size="standard", skin="skin_03", hair="hair_dark",  shirt="work_shirt_blue", trousers="trousers_grey",
                       hat="softcap",   belt=False, coat=False),
    "Director":   dict(size="standard", skin="skin_04", hair="hair_grey",  shirt="coat_charcoal",   trousers="trousers_grey",
                       hat="fedora",    belt=False, coat=True),
    "Carpenter":  dict(size="heavy",    skin="skin_02", hair="hair_brown", shirt="work_shirt_tan",  trousers="trousers_brown",
                       hat="softcap",   belt=True,  coat=False),
}

SIZE = {"standard": dict(girth=1.00, height=1.00), "heavy": dict(girth=1.16, height=0.99)}


def char_materials(cfg):
    P = config.PALETTE
    hair_dark = P.get(cfg["hair"], (0.12, 0.09, 0.07))
    return [
        materials.solid("mat2_skin",     P[cfg["skin"]],     roughness=0.72),   # 0
        materials.solid("mat2_shirt",    P[cfg["shirt"]],    roughness=0.85),   # 1
        materials.solid("mat2_trousers", P[cfg["trousers"]], roughness=0.85),   # 2
        materials.solid("mat2_leather",  P["leather_brown"], roughness=0.5),    # 3
        materials.solid("mat2_dark",     hair_dark,          roughness=0.8),    # 4 (hair + features)
        materials.solid("mat2_white",    (0.93, 0.92, 0.90), roughness=0.4),    # 5 (eye white)
        materials.solid("mat2_hat",      P["felt_grey"],     roughness=0.85),   # 6
    ]


def _blend(a, b, wa=0.5):
    return {a: round(wa, 3), b: round(1 - wa, 3)}


def build_character2(role, arm, seed=1):
    """Author one readable crew character, directly skinned to `arm`. Returns the mesh object."""
    cfg = ROLES[role]
    g = SIZE[cfg["size"]]["girth"]
    J = rig.rest_points(arm)

    def h(n): return J[n]["head"].copy()
    def t(n): return J[n]["tail"].copy()
    def c(n): return J[n]["center"].copy()

    sb = SkinnedBuilder()
    upper = SLOT["shirt"]
    lower = SLOT["trousers"]
    skin = SLOT["skin"]
    leather = SLOT["leather"]
    dark = SLOT["dark"]
    white = SLOT["white"]

    # ============================================================ TORSO (garment)
    pelvis = h("pelvis"); s1 = c("spine_01"); s2 = c("spine_02"); s3 = c("spine_03")
    neck = h("neck_01"); head_c = c("Head")
    # hip block (trousers) — the waistline
    sb.box(_blend("pelvis", "spine_01", 0.7), size=(0.30 * g, 0.21 * g, 0.16),
           matrix=T(pelvis.x, pelvis.y, pelvis.z + 0.02), mat=lower)
    # belly + chest + upper chest (shirt), gently widening to the shoulders
    sb.box("spine_01", size=(0.32 * g, 0.22 * g, 0.20), matrix=T(*s1), mat=upper)
    sb.box("spine_02", size=(0.36 * g, 0.23 * g, 0.24), matrix=T(*s2), mat=upper)
    sb.box("spine_03", size=(0.40 * g, 0.24 * g, 0.18), matrix=T(s3.x, s3.y, s3.z + 0.01), mat=upper)
    # collar ring (shirt) so the neck emerges from a clear neckline
    sb.cyl("spine_03", 0.085 * g, 0.05, segments=14, matrix=T(neck.x, neck.y, neck.z - 0.01), mat=upper)
    # coat: long tapered skirt for office/director read
    if cfg.get("coat"):
        top = s3.z
        skirt_z = (h("thigh_l").z + h("thigh_r").z) * 0.5 - 0.05
        depth = top - skirt_z
        sb.cone("spine_01", 0.24 * g, 0.30 * g, depth, segments=16,
                matrix=T(0, 0.01, (top + skirt_z) * 0.5), mat=upper)
    # tool belt
    if cfg.get("belt"):
        sb.box("pelvis", size=(0.34 * g, 0.24 * g, 0.06), matrix=T(pelvis.x, pelvis.y, pelvis.z + 0.02), mat=leather)
        sb.box("pelvis", size=(0.09, 0.10, 0.10), matrix=T(0.16, -0.11, pelvis.z + 0.0), mat=leather)  # pouch (front -Y)

    # ============================================================ NECK + HEAD (skin)
    sb.cyl(_blend("neck_01", "spine_03", 0.6), 0.055, 0.12, segments=12,
           matrix=T(neck.x, neck.y, neck.z + 0.04), mat=skin)
    # head ovoid — slightly narrower in X, deeper/taller, chin dropped forward (-Y)
    sb.uvsphere("Head", 0.108, u=22, v=16,
                matrix=T(head_c.x, head_c.y - 0.008, head_c.z + 0.02) @ Matrix.Diagonal((0.9, 1.02, 1.16, 1)), mat=skin)

    # ----- FACE on the measured FRONT (-Y). y decreases toward the face. -----
    hx, hy, hz = head_c.x, head_c.y, head_c.z + 0.02
    fy = hy - 0.092          # front surface plane of the head ovoid
    ex = 0.041               # eye separation (half)
    for sgn in (-1, 1):
        # eye white + dark pupil (pupil pokes slightly further -Y)
        sb.uvsphere("Head", 0.024, u=10, v=8, matrix=T(hx + sgn * ex, fy + 0.006, hz + 0.018), mat=white)
        sb.uvsphere("Head", 0.013, u=8, v=6, matrix=T(hx + sgn * ex, fy - 0.008, hz + 0.016), mat=dark)
        # eyebrow
        sb.box("Head", size=(0.05, 0.016, 0.013), matrix=T(hx + sgn * ex, fy - 0.004, hz + 0.052), mat=dark)
    # nose (skin wedge protruding -Y)
    sb.box("Head", size=(0.028, 0.05, 0.03), matrix=T(hx, fy - 0.018, hz - 0.004), mat=skin)
    # mouth (dark)
    sb.box("Head", size=(0.052, 0.014, 0.016), matrix=T(hx, fy - 0.002, hz - 0.060), mat=dark)
    # ears
    for sgn in (-1, 1):
        sb.uvsphere("Head", 0.02, u=8, v=6, matrix=T(hx + sgn * 0.098, hy + 0.01, hz) @ Matrix.Diagonal((0.5, 1, 1.2, 1)), mat=skin)

    # ----- hair / headwear -----
    hat = cfg.get("hat")
    if hat != "hardhat":  # hard hat covers hair; otherwise show hair
        hair_col = SLOT["dark"]
        sb.uvsphere("Head", 0.116, u=18, v=12,
                    matrix=T(hx, hy + 0.028, hz + 0.03) @ Matrix.Diagonal((1.0, 1.0, 0.98, 1)), mat=hair_col)
    _add_headwear(sb, hat, Vector((hx, hy, hz)))

    # ============================================================ ARMS (T-pose along X)
    for s in ("l", "r"):
        sgn = 1 if s == "l" else -1
        ua_h, la_h, hn_h = h(f"upperarm_{s}"), h(f"lowerarm_{s}"), h(f"hand_{s}")
        # shoulder cap (shirt)
        sb.uvsphere(_blend(f"clavicle_{s}", f"upperarm_{s}", 0.4), 0.072 * g, u=12, v=10, matrix=T(*ua_h), mat=upper)
        # upper-arm sleeve (shirt), tapering to the elbow
        sb.segment(f"upperarm_{s}", ua_h, la_h, 0.056 * g, 0.05, segments=12, mat=upper)
        # elbow joint (blend) — sleeve cuff sits here
        sb.uvsphere(_blend(f"upperarm_{s}", f"lowerarm_{s}"), 0.052, u=10, v=8, matrix=T(*la_h), mat=upper)
        # forearm (skin, rolled sleeve)
        sb.segment(f"lowerarm_{s}", la_h, hn_h, 0.046, 0.036, segments=12, mat=skin)
        # wrist + hand mitten (skin)
        sb.uvsphere(_blend(f"lowerarm_{s}", f"hand_{s}"), 0.04, u=8, v=6, matrix=T(*hn_h), mat=skin)
        hand_end = hn_h + Vector((sgn * 0.085, 0.0, 0.0))
        sb.box(f"hand_{s}", size=(0.11, 0.085, 0.04),
               matrix=T((hn_h.x + hand_end.x) * 0.5 + sgn * 0.02, hn_h.y, hn_h.z), mat=skin)

    # ============================================================ LEGS
    for s in ("l", "r"):
        th_h, ca_h, ft_h, bl_t = h(f"thigh_{s}"), h(f"calf_{s}"), h(f"foot_{s}"), t(f"ball_{s}")
        # hip cap (trousers)
        sb.uvsphere(_blend("pelvis", f"thigh_{s}", 0.4), 0.088 * g, u=12, v=10, matrix=T(*th_h), mat=lower)
        # thigh (trousers)
        sb.segment(f"thigh_{s}", th_h, ca_h, 0.082 * g, 0.062, segments=12, mat=lower)
        # knee (blend)
        sb.uvsphere(_blend(f"thigh_{s}", f"calf_{s}"), 0.06, u=10, v=8, matrix=T(*ca_h), mat=lower)
        # calf (trousers) down to the ankle
        sb.segment(f"calf_{s}", ca_h, ft_h, 0.06, 0.045, segments=12, mat=lower)
        # ankle collar (blend) — keeps the trouser->boot join closed
        sb.uvsphere(_blend(f"calf_{s}", f"foot_{s}", 0.4), 0.05, u=8, v=6, matrix=T(*ft_h), mat=leather)
        # boot: heel block at the ankle + toe box forward (-Y), on the ground
        heel_z = 0.045
        sb.box(_blend(f"foot_{s}", f"ball_{s}", 0.7), size=(0.095, 0.13, 0.09),
               matrix=T(ft_h.x, ft_h.y - 0.02, heel_z), mat=leather)
        sb.box(f"ball_{s}", size=(0.09, 0.16, 0.06),
               matrix=T(ft_h.x, ft_h.y - 0.13, heel_z - 0.012), mat=leather)  # toe forward (-Y)

    mats = char_materials(cfg)
    obj = sb.build(f"Char2_{role}", materials=mats, armature=arm, shade_smooth=True)

    core.set_custom_props(obj, {
        "studio_role": role, "studio_class": "character", "studio_build_size": cfg["size"],
        "studio_front_axis": "-Y", "studio_pipeline_ver": "character2",
        **config.PROVENANCE, "milestone": "asset-lab-05b",
    })
    obj.name = f"Char_{role}_{cfg['size'].capitalize()}"
    return obj


def _add_headwear(sb, kind, head_center):
    """Add headwear geometry weighted 100% to Head (follows head translation+rotation)."""
    if not kind:
        return
    c = head_center + Vector((0, 0.005, 0.0))
    top = c.z + 0.12
    if kind == "hardhat":
        sb.uvsphere("Head", 0.132, u=16, v=8, matrix=T(c.x, c.y, top - 0.03) @ Matrix.Diagonal((1, 1, 0.72, 1)), mat=SLOT["hat"])
        sb.cyl("Head", 0.16, 0.02, segments=18, matrix=T(c.x, c.y - 0.02, top - 0.055), mat=SLOT["hat"])   # brim front -Y
    elif kind == "fedora":
        sb.cyl("Head", 0.185, 0.02, segments=22, matrix=T(c.x, c.y, top - 0.02), mat=SLOT["hat"])          # brim
        sb.cone("Head", 0.115, 0.10, 0.12, segments=18, matrix=T(c.x, c.y, top + 0.05), mat=SLOT["hat"])   # crown
    elif kind == "flatcap":
        sb.uvsphere("Head", 0.128, u=16, v=8, matrix=T(c.x, c.y, top - 0.04) @ Matrix.Diagonal((1, 1.08, 0.5, 1)), mat=SLOT["hat"])
        sb.box("Head", size=(0.15, 0.10, 0.014), matrix=T(c.x, c.y - 0.135, top - 0.03), mat=SLOT["hat"])  # bill front -Y
    elif kind == "softcap":
        sb.uvsphere("Head", 0.126, u=16, v=8, matrix=T(c.x, c.y + 0.005, top - 0.045) @ Matrix.Diagonal((1, 1.05, 0.55, 1)), mat=SLOT["hat"])
        sb.box("Head", size=(0.14, 0.11, 0.014), matrix=T(c.x, c.y - 0.14, top - 0.05), mat=SLOT["hat"])   # peak front -Y
