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
# 0 skin | 1 shirt(upper) | 2 trousers(lower) | 3 leather(boots/belt) | 4 dark(brows/mouth/pupil
# + accessories, always dark) | 5 white(eye/paper) | 6 hat | 7 hi-vis vest | 8 hair(varies)
SLOT = dict(skin=0, shirt=1, trousers=2, leather=3, dark=4, white=5, hat=6, hivis=7, hair=8)

FORWARD = Vector((0.0, -1.0, 0.0))   # measured mannequin forward (see probe_orientation)

# role -> costume/palette config (a new role is a row, not a new model). Role read = silhouette
# (hat/vest/coat) + palette + accessory, never a tiny label. Skin tone is assigned per-instance
# (deterministic, NOT tied to job) — the row's `skin` is only the lineup default.
ROLES = {
    "PA":         dict(size="standard", skin="skin_01", hair="hair_brown", shirt="work_shirt_tan",  trousers="trousers_brown",
                       hat=None,        belt=False, coat=False, clip=True, hair_style="sidepart"),
    "Grip":       dict(size="standard", skin="skin_02", hair="hair_dark",  shirt="work_shirt_blue", trousers="trousers_grey",
                       hat="flatcap",   belt=True,  coat=False, radio=True, hat_col=(0.24, 0.24, 0.26), facial_hair="mustache"),
    "Electric":   dict(size="heavy",    skin="skin_01", hair="hair_brown", shirt="work_shirt_tan",  trousers="trousers_brown",
                       hat="hardhat",   belt=True,  coat=False, vest=True, radio=True, hat_col=(0.92, 0.56, 0.08), coil=True),
    # Maintenance: slate COVERALLS (same top+bottom) + soft cap — a distinct mechanic silhouette,
    # deliberately NOT hi-vis/hard-hat so it never reads as the Electric/Grip crew.
    "Maintenance":dict(size="heavy",    skin="skin_03", hair="hair_grey",  shirt=(0.33, 0.36, 0.23), trousers=(0.33, 0.36, 0.23),
                       hat="softcap",   belt=True,  coat=False, radio=True, hat_col=(0.22, 0.24, 0.16), facial_hair="stubble"),
    # Office: a lightweight dark top (NOT a long coat — that's Director) so it reads as admin, not a smock
    "Office":     dict(size="standard", skin="skin_04", hair="hair_grey",  shirt=(0.44, 0.21, 0.24), trousers="trousers_grey",
                       hat=None,        belt=False, coat=False, clip=True, hair_style="bun"),
    # extra existing roles kept only if they pass the same bar
    "CameraDP":   dict(size="standard", skin="skin_03", hair="hair_dark",  shirt=(0.24, 0.34, 0.29), trousers="trousers_grey",
                       hat="softcap",   belt=False, coat=False, hat_col=(0.18, 0.24, 0.34)),
    "Director":   dict(size="standard", skin="skin_04", hair="hair_grey",  shirt="coat_charcoal",   trousers="trousers_grey",
                       hat="fedora",    belt=False, coat=True,  hat_col=(0.26, 0.19, 0.14), facial_hair="goatee"),
    "Carpenter":  dict(size="heavy",    skin="skin_02", hair="hair_brown", shirt="work_shirt_tan",  trousers="trousers_brown",
                       hat="softcap",   belt=True,  coat=False, hat_col=(0.34, 0.27, 0.19), facial_hair="beard", apron=True),
}

# Proportion profiles (05D redo). Each profile has its OWN ratio SIGNATURE (chest / waist / hip /
# limb / shoulder), not a single uniform girth — so slim reads as a pinched-waist lean build and
# wide as a broad-ribcage stocky build, per the Loop-3 anatomy gate. Skeleton height stays shared.
SIZE = {
    "standard": dict(chest=1.00, waist=1.00, hip=1.00, limb=1.00, shoulder=1.00),
    "heavy":    dict(chest=1.14, waist=1.24, hip=1.16, limb=1.14, shoulder=1.12),  # broad + full waist
    "slim":     dict(chest=0.94, waist=0.78, hip=0.86, limb=0.83, shoulder=0.98),  # pinched waist, lean limbs
}


def _col(P, v):
    """Accept either a PALETTE key or a literal RGB tuple (per-instance override)."""
    return tuple(v) if isinstance(v, (tuple, list)) else P[v]


def char_materials(cfg, tag="base"):
    # UNIQUELY named per character (materials.solid reuses by name; a lineup of characters would
    # otherwise all share one material and take the last-built colour).
    P = config.PALETTE
    hair = cfg["hair"]
    hair_col = tuple(hair) if isinstance(hair, (tuple, list)) else P.get(hair, (0.12, 0.09, 0.07))
    # 05C: darken light/grey hair so it reads against pale skin (Office was reading bald)
    if sum(hair_col) > 1.2:
        hair_col = tuple(c * 0.68 for c in hair_col)

    def s(slot, color, **kw):
        return materials.solid(f"mat2_{slot}_{tag}", color, **kw)
    return [
        s("skin",     _col(P, cfg["skin"]),     roughness=0.72),   # 0
        s("shirt",    _col(P, cfg["shirt"]),    roughness=0.85),   # 1
        s("trousers", _col(P, cfg["trousers"]), roughness=0.85),   # 2
        s("leather",  (0.15, 0.11, 0.10),       roughness=0.45),   # 3 boots/belt (dark)
        s("dark",     (0.09, 0.07, 0.06),       roughness=0.55),   # 4 features + accessory (fixed dark)
        s("white",    (0.93, 0.92, 0.90),       roughness=0.4),    # 5 (eye white / paper)
        s("hat",      _col(P, cfg.get("hat_col", "felt_grey")), roughness=0.85),  # 6
        s("hivis",    (0.96, 0.48, 0.06),       roughness=0.55),   # 7 hi-vis vest
        s("hair",     hair_col,                 roughness=0.85),   # 8 hair (varies)
    ]


def _blend(a, b, wa=0.5):
    return {a: round(wa, 3), b: round(1 - wa, 3)}


def build_character2(role, arm, seed=1, overrides=None, tag=None):
    """Author one readable crew character, directly skinned to `arm`. Returns the mesh object.

    `overrides` merges onto the role row (per-instance skin tone / outfit palette; skin tone is
    assigned this way so it is NOT tied to job). `tag` uniquely names this character's materials.
    """
    cfg = dict(ROLES[role])
    if overrides:
        cfg.update(overrides)
    tag = tag or f"{role}_{seed}"
    prof = SIZE[cfg["size"]]
    CH, WA, HI, LI, SH = prof["chest"], prof["waist"], prof["hip"], prof["limb"], prof["shoulder"]
    g = (CH + WA + HI) / 3.0   # general girth fallback for misc clothing details
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

    def ell(w, cx, cy, cz, hxx, hyy, hzz, mat, u=20, v=14):
        """A rounded ellipsoid (half-extents hxx,hyy,hzz) — the organic building block that
        replaces the Lab-05B stacked boxes so the torso/hips read as a body, not armor."""
        sb.uvsphere(w, 1.0, u=u, v=v, matrix=T(cx, cy, cz) @ Matrix.Diagonal((hxx, hyy, hzz, 1)), mat=mat)

    # --- pelvis / hips (trousers): rounded mass + a seat that closes the crotch gap ---
    ell("pelvis", pelvis.x, pelvis.y + 0.006, pelvis.z + 0.05, 0.150 * HI, 0.115 * HI, 0.120, lower, u=18, v=12)
    seat_z = (pelvis.z + h("thigh_l").z) * 0.5 - 0.01
    ell("pelvis", 0, pelvis.y, seat_z, 0.156 * HI, 0.120 * HI, 0.105, lower, u=16, v=10)
    # --- torso (shirt): rounded, FLATTENED (front-back) ellipsoids waist -> chest -> yoke; a low
    #     shirt hem overlaps the waistband so there is NO gap between shirt and trousers ---
    # The belly/waist tuck BACK (+Y) relative to the chest so the FRONT profile is vertical/athletic
    # (no paunch overhanging the belt); the chest is the front-most point.
    ell(_blend("spine_01", "pelvis", 0.6), 0, s1.y + 0.022, pelvis.z + 0.125, 0.140 * WA, 0.088 * WA, 0.098, upper)  # shirt hem
    sb.cyl(_blend("spine_01", "pelvis", 0.6), 0.143 * WA, 0.022, segments=18,
           matrix=T(0, s1.y + 0.02, pelvis.z + 0.052) @ Matrix.Diagonal((1.0, 0.76, 1.0, 1)), mat=upper)  # shirt-hem edge (constructed bottom)
    ell("spine_01", s1.x, s1.y + 0.016, s1.z, 0.138 * WA, 0.088 * WA, 0.135, upper)   # waist (PINCHED via WA)
    ell("spine_02", s2.x, s2.y, s2.z + 0.005, 0.172 * CH, 0.102 * CH, 0.148, upper)   # chest (BROAD via CH → real waist above the belt)
    ell("spine_03", s3.x, s3.y - 0.004, s3.z + 0.015, 0.186 * SH, 0.099 * SH, 0.100, upper)  # shoulder yoke (SH)
    # trapezius: soften the neck -> shoulder transition (no square corner)
    ell(_blend("spine_03", "neck_01", 0.7), neck.x, neck.y + 0.012, neck.z - 0.045, 0.115 * SH, 0.095 * SH, 0.058, upper, u=14, v=10)
    # collar: a raised folded band at the neckline (a real shirt collar, not just a ring)
    sb.cyl("spine_03", 0.082 * g, 0.045, segments=18,
           matrix=T(neck.x, neck.y, neck.z + 0.006) @ Matrix.Diagonal((1.0, 0.92, 1.0, 1)), mat=upper)
    # front placket + buttons down the chest (shirt roles — reads as a worn buttoned shirt)
    if not cfg.get("coat") and not cfg.get("vest"):
        pz0, pz1 = s2.z + 0.04, s1.z - 0.02
        sb.box("spine_02", size=(0.026, 0.02, pz0 - pz1), matrix=T(0, s2.y - 0.099 * g, (pz0 + pz1) * 0.5), mat=SLOT["dark"])
        for i in range(3):
            sb.uvsphere("spine_02", 0.009, u=6, v=6, matrix=T(0, s2.y - 0.106 * g, pz0 - 0.03 - i * 0.075), mat=SLOT["dark"])
        # chest pocket (work shirt / coveralls)
        sb.box("spine_02", size=(0.058, 0.016, 0.058), matrix=T(0.075, s2.y - 0.098 * g, s2.z - 0.015), mat=upper)
    # coat: long tapered skirt for office/director read
    if cfg.get("coat"):
        top = s3.z
        skirt_z = (h("thigh_l").z + h("thigh_r").z) * 0.5 - 0.05
        depth = top - skirt_z
        sb.cone("spine_01", 0.24 * g, 0.30 * g, depth, segments=16,
                matrix=T(0, 0.01, (top + skirt_z) * 0.5), mat=upper)
    # tool belt — a rounded band (flattened disc) hugging the waist, not a boxy slab
    if cfg.get("belt"):
        sb.cyl("pelvis", 0.152 * g, 0.052, segments=20,
               matrix=T(pelvis.x, pelvis.y, pelvis.z + 0.02) @ Matrix.Diagonal((1.0, 0.82, 1.0, 1)), mat=leather)
        sb.box("pelvis", size=(0.08, 0.09, 0.09), matrix=T(0.15, -0.115, pelvis.z + 0.0), mat=leather)  # pouch (front -Y)
    # hi-vis safety vest (electric/maintenance): a FITTED rounded shell hugging the chest ~2cm proud
    # of the shirt (was a bulky floating box). Full straps/opening refinement is iteration 3.
    if cfg.get("vest"):
        hv = SLOT["hivis"]
        ell("spine_02", s2.x, s2.y, s2.z + 0.005, 0.190 * g, 0.112 * g, 0.140, hv)          # chest
        ell("spine_03", s3.x, s3.y - 0.006, s3.z + 0.012, 0.200 * g, 0.108 * g, 0.098, hv)  # upper chest
        ell("spine_01", s1.x, s1.y + 0.002, s1.z + 0.02, 0.156 * g, 0.108 * g, 0.085, hv)   # lower hem
        # reflective bands (silver) wrapping the vest — the classic hi-vis read
        for bz in (s2.z + 0.055, s2.z - 0.045):
            sb.cyl("spine_02", 0.198 * g, 0.020, segments=22,
                   matrix=T(s2.x, s2.y, bz) @ Matrix.Diagonal((1.0, 0.60, 1.0, 1)), mat=SLOT["white"])
    # carpenter's apron — a flat canvas front panel chest→thigh (distinct role silhouette in greyscale)
    if cfg.get("apron"):
        ax_z = (s2.z + h("thigh_l").z) * 0.5
        sb.box("spine_01", size=(0.30, 0.028, 0.44), matrix=T(0, s2.y - 0.104 * g, ax_z), mat=leather)
        sb.box("pelvis", size=(0.12, 0.05, 0.10), matrix=T(0.0, -0.12, ax_z - 0.10), mat=leather)  # tool pouch on the apron
    # cable coil over the left shoulder (electric) — distinct utility prop
    if cfg.get("coil"):
        cl = h("clavicle_l") if "clavicle_l" in J else h("upperarm_l")
        for k in range(3):
            sb.cyl(_blend("spine_03", "clavicle_l", 0.5), 0.085, 0.024, segments=12,
                   matrix=T(cl.x + 0.02, cl.y + 0.03, cl.z - k * 0.03) @ R("X", 1.25), mat=leather)
    # clipboard clutched to the front (PA / office) — reads at any pose, weighted to the torso
    if cfg.get("clip"):
        cz = c("spine_01").z + 0.02
        # held clearly IN FRONT of the torso (pushed -Y past the coat/shirt), tilted top-back
        sb.box("spine_01", size=(0.16, 0.02, 0.21), matrix=T(0.05, -0.205, cz) @ R("X", -0.28), mat=SLOT["dark"])
        sb.box("spine_01", size=(0.14, 0.006, 0.18), matrix=T(0.05, -0.214, cz + 0.004) @ R("X", -0.28), mat=SLOT["white"])
    # belt radio: a small snug box on the FRONT-left of the belt (no antenna — a thin cylinder read
    # as a floating stick in deep crouches). Weighted to pelvis so it stays with the waist.
    if cfg.get("radio") and cfg.get("belt"):
        sb.box("pelvis", size=(0.05, 0.045, 0.09), matrix=T(-0.14, -0.115, pelvis.z + 0.04), mat=SLOT["dark"])

    # ============================================================ NECK + HEAD (skin)
    sb.cyl(_blend("neck_01", "spine_03", 0.6), 0.055, 0.12, segments=12,
           matrix=T(neck.x, neck.y, neck.z + 0.04), mat=skin)
    # head ovoid — slightly narrower in X, deeper/taller, chin dropped forward (-Y)
    sb.uvsphere("Head", 0.108, u=22, v=16,
                matrix=T(head_c.x, head_c.y - 0.008, head_c.z + 0.02) @ Matrix.Diagonal((0.9, 1.02, 1.16, 1)), mat=skin)

    # ----- FACE (-Y front): clean, symmetric, FRIENDLY stylized features (05C) -----
    hx, hy, hz = head_c.x, head_c.y, head_c.z + 0.02
    fy = hy - 0.092          # feature front plane
    ex = 0.0335              # eye separation (half) — brought inward (Loop-6 gate: eyes read wide-set)
    # ----- head SCULPT (05D): SUBTLE cheekbone/chin/brow planes so the head reads sculpted (not egg,
    #       not jowly). Small, restrained forms that blend into the ovoid via shade-smooth. -----
    sb.uvsphere("Head", 1.0, u=10, v=8,
                matrix=T(hx, hy - 0.052, hz - 0.064) @ Matrix.Diagonal((0.038, 0.042, 0.036, 1)), mat=skin)   # chin (smaller, up+back — not jowly)
    for sgn in (-1, 1):
        sb.uvsphere("Head", 1.0, u=8, v=6,
                    matrix=T(hx + sgn * 0.050, hy - 0.058, hz + 0.004) @ Matrix.Diagonal((0.028, 0.034, 0.036, 1)), mat=skin)  # cheekbone (subtle, higher)
    sb.uvsphere("Head", 1.0, u=12, v=6,
                matrix=T(hx, hy - 0.088, hz + 0.050) @ Matrix.Diagonal((0.084, 0.026, 0.016, 1)), mat=skin)   # brow ridge
    sb.uvsphere("Head", 1.0, u=8, v=6,
                matrix=T(hx, hy - 0.090, hz + 0.020) @ Matrix.Diagonal((0.013, 0.024, 0.044, 1)), mat=skin)   # nose bridge (nose->brow)
    for sgn in (-1, 1):
        # eye = a lit EYEBALL + dark iris + catch-light, BRACKETED by upper & lower lids (reads as a
        # shaped eye, not an oversized dark void with a floating dot).
        sb.uvsphere("Head", 1.0, u=10, v=8,
                    matrix=T(hx + sgn * ex, fy + 0.006, hz + 0.015) @ Matrix.Diagonal((0.030, 0.013, 0.021, 1)), mat=white)   # eyeball
        sb.uvsphere("Head", 0.0135, u=8, v=6, matrix=T(hx + sgn * ex, fy - 0.006, hz + 0.014), mat=dark)                        # iris/pupil (forward)
        sb.uvsphere("Head", 0.0055, u=6, v=6, matrix=T(hx + sgn * ex - sgn * 0.004, fy - 0.012, hz + 0.013), mat=white)         # catch-light (lowered onto the iris — relaxed gaze)
        sb.uvsphere("Head", 1.0, u=8, v=6,
                    matrix=T(hx + sgn * ex, fy + 0.003, hz + 0.030) @ Matrix.Diagonal((0.037, 0.013, 0.007, 1)), mat=skin)      # upper lid
        sb.uvsphere("Head", 1.0, u=8, v=6,
                    matrix=T(hx + sgn * ex, fy + 0.004, hz + 0.001) @ Matrix.Diagonal((0.035, 0.012, 0.006, 1)), mat=skin)      # lower lid
        sb.uvsphere("Head", 1.0, u=10, v=6,
                    matrix=T(hx + sgn * ex, fy - 0.002, hz + 0.044) @ Matrix.Diagonal((0.033, 0.012, 0.0085, 1)), mat=SLOT["hair"])  # brow
    # nose = a small soft bump protruding -Y (skin), not a lump wedge
    sb.uvsphere("Head", 1.0, u=10, v=8,
                matrix=T(hx, fy - 0.008, hz - 0.006) @ Matrix.Diagonal((0.015, 0.021, 0.019, 1)), mat=skin)
    # mouth = TWO lit lips (upper + lower, skin) with a thin dark line between + upward corners → a
    # gentle smile that actually reads (was a single black bar).
    sb.uvsphere("Head", 1.0, u=10, v=6, matrix=T(hx, fy - 0.004, hz - 0.046) @ Matrix.Diagonal((0.028, 0.013, 0.008, 1)), mat=skin)   # upper lip
    sb.uvsphere("Head", 1.0, u=10, v=6, matrix=T(hx, fy - 0.004, hz - 0.058) @ Matrix.Diagonal((0.028, 0.014, 0.009, 1)), mat=skin)   # lower lip
    sb.uvsphere("Head", 1.0, u=12, v=4, matrix=T(hx, fy - 0.002, hz - 0.052) @ Matrix.Diagonal((0.024, 0.010, 0.0035, 1)), mat=dark)  # thin mouth line
    for sgn in (-1, 1):
        sb.uvsphere("Head", 0.006, u=6, v=6, matrix=T(hx + sgn * 0.024, fy - 0.003, hz - 0.047), mat=dark)  # lifted corner (smile)
    # ears
    for sgn in (-1, 1):
        sb.uvsphere("Head", 0.021, u=8, v=6, matrix=T(hx + sgn * 0.098, hy + 0.012, hz) @ Matrix.Diagonal((0.5, 1, 1.25, 1)), mat=skin)

    # ----- hair / headwear -----
    hat = cfg.get("hat")
    hc = Vector((hx, hy, hz))
    if hat:                       # a cap/hat: show a fringe so the head is never bald under it
        _add_hair_fringe(sb, hc, SLOT["hair"])
    else:                         # bare head: a designed hairstyle
        _add_hair(sb, cfg.get("hair_style", "short"), hc, SLOT["hair"])
    _add_headwear(sb, hat, hc)
    if cfg.get("facial_hair"):
        _add_facial_hair(sb, cfg["facial_hair"], hc, SLOT["hair"])

    # ============================================================ ARMS (T-pose along X)
    for s in ("l", "r"):
        sgn = 1 if s == "l" else -1
        ua_h, la_h, hn_h = h(f"upperarm_{s}"), h(f"lowerarm_{s}"), h(f"hand_{s}")
        # shoulder cap (shirt) — round deltoid pulled in + sloping into the arm (no flat plateau)
        sb.uvsphere(_blend(f"clavicle_{s}", f"upperarm_{s}", 0.45), 0.062 * SH, u=14, v=10,
                    matrix=T(ua_h.x - sgn * 0.014, ua_h.y, ua_h.z - 0.006) @ Matrix.Diagonal((0.95, 1.05, 1.02, 1)), mat=upper)
        # upper-arm sleeve (shirt), tapering to the elbow
        sb.segment(f"upperarm_{s}", ua_h, la_h, 0.056 * LI, 0.05 * LI, segments=12, mat=upper)
        # bicep fullness so the upper arm is not a straight tube
        bic = ua_h.lerp(la_h, 0.4)
        sb.uvsphere(f"upperarm_{s}", 1.0, u=10, v=8,
                    matrix=T(bic.x, bic.y - 0.004, bic.z) @ Matrix.Diagonal((0.072, 0.060 * LI, 0.058 * LI, 1)), mat=upper)
        # elbow joint (blend) — sleeve cuff sits here
        sb.uvsphere(_blend(f"upperarm_{s}", f"lowerarm_{s}"), 0.050 * LI, u=10, v=8, matrix=T(*la_h), mat=upper)
        # rolled-sleeve cuff: a thicker shirt band just before the skin forearm begins
        cuff_p = ua_h.lerp(la_h, 0.86)
        sb.uvsphere(f"upperarm_{s}", 0.057 * LI, u=12, v=8, matrix=T(*cuff_p), mat=upper)
        # forearm (skin) tapering firmly to a slim wrist
        sb.segment(f"lowerarm_{s}", la_h, hn_h, 0.046 * LI, 0.034, segments=12, mat=skin)
        # wrist + hand mitten (skin)
        sb.uvsphere(_blend(f"lowerarm_{s}", f"hand_{s}"), 0.04, u=8, v=6, matrix=T(*hn_h), mat=skin)
        # HAND: flattened palm + FOUR individual fingers + a thumb (professional stylized hand, not
        # a paddle). Weighted rigidly to hand_{s}, so the extra geometry is deformation-safe.
        palm = hn_h + Vector((sgn * 0.038, 0, 0))
        sb.uvsphere(f"hand_{s}", 1.0, u=10, v=8,
                    matrix=T(palm.x, palm.y, palm.z) @ Matrix.Diagonal((0.045, 0.046, 0.024, 1)), mat=skin)   # palm
        fbaseX = hn_h.x + sgn * 0.064
        ftipX = hn_h.x + sgn * 0.108
        # (y-offset across the palm, extra tip length) — middle finger longest, pinky shortest.
        # Fingers packed close so they read as a hand, not a splayed claw.
        for fy_off, flen in ((-0.022, 0.004), (-0.0075, 0.011), (0.0075, 0.003), (0.022, -0.008)):
            p0 = Vector((fbaseX, hn_h.y + fy_off, hn_h.z + 0.002))
            p1 = Vector((ftipX + sgn * flen, hn_h.y + fy_off * 1.1, hn_h.z - 0.004))
            sb.segment(f"hand_{s}", p0, p1, 0.0145, 0.0105, segments=6, mat=skin)
        # thumb: off the front-inner edge of the palm, angled forward (-Y)
        tp0 = Vector((hn_h.x + sgn * 0.044, hn_h.y - 0.020, hn_h.z))
        tp1 = Vector((hn_h.x + sgn * 0.058, hn_h.y - 0.062, hn_h.z - 0.004))
        sb.segment(f"hand_{s}", tp0, tp1, 0.015, 0.011, segments=6, mat=skin)

    # ============================================================ LEGS
    for s in ("l", "r"):
        th_h, ca_h, ft_h, bl_t = h(f"thigh_{s}"), h(f"calf_{s}"), h(f"foot_{s}"), t(f"ball_{s}")
        # hip cap (trousers) — rounder, flows into the pelvis mass (no boxy hip)
        sb.uvsphere(_blend("pelvis", f"thigh_{s}", 0.4), 0.078 * HI, u=14, v=10,
                    matrix=T(th_h.x, th_h.y, th_h.z + 0.01) @ Matrix.Diagonal((1.05, 1.0, 1.1, 1)), mat=lower)
        # thigh (trousers) — WIDEST at the hip, tapering firmly to the knee (front taper: thigh>knee)
        sb.segment(f"thigh_{s}", th_h, ca_h, 0.094 * LI, 0.060, segments=12, mat=lower)
        # knee (blend) — narrower than the thigh so the front silhouette reads thigh>knee>calf
        sb.uvsphere(_blend(f"thigh_{s}", f"calf_{s}"), 0.058, u=12, v=8, matrix=T(*ca_h), mat=lower)
        # calf (trousers) — NARROWER than the thigh, tapering hard to the ankle
        sb.segment(f"calf_{s}", ca_h, ft_h, 0.056 * LI, 0.036, segments=12, mat=lower)
        # calf-muscle fullness on the BACK only (+Y, small X) so it shapes the side, not the front width
        cmus = ca_h.lerp(ft_h, 0.32)
        sb.uvsphere(f"calf_{s}", 1.0, u=10, v=8,
                    matrix=T(cmus.x, cmus.y + 0.020, cmus.z) @ Matrix.Diagonal((0.044, 0.058, 0.078, 1)), mat=lower)
        # trouser break — the trouser leg folds slightly over the boot top (constructed, not plugged in)
        sb.uvsphere(f"calf_{s}", 1.0, u=10, v=8,
                    matrix=T(ft_h.x, ft_h.y + 0.004, ft_h.z + 0.028) @ Matrix.Diagonal((0.058, 0.062, 0.030, 1)), mat=lower)
        # ankle collar (blend) — keeps the trouser->boot join closed
        sb.uvsphere(_blend(f"calf_{s}", f"foot_{s}", 0.4), 0.05, u=8, v=6, matrix=T(*ft_h), mat=leather)
        # SHOE: a rounded work boot — instep/heel + rounded toe + a thin dark sole (not angular boxes)
        heel_z = 0.048
        sb.uvsphere(_blend(f"foot_{s}", f"ball_{s}", 0.7), 1.0, u=10, v=8,
                    matrix=T(ft_h.x, ft_h.y - 0.012, heel_z) @ Matrix.Diagonal((0.050, 0.072, 0.052, 1)), mat=leather)   # instep/heel
        sb.uvsphere(f"ball_{s}", 1.0, u=12, v=8,
                    matrix=T(ft_h.x, ft_h.y - 0.115, heel_z - 0.006) @ Matrix.Diagonal((0.047, 0.090, 0.044, 1)), mat=leather)  # rounded toe
        sb.box(_blend(f"foot_{s}", f"ball_{s}", 0.5), size=(0.094, 0.265, 0.024),
               matrix=T(ft_h.x, ft_h.y - 0.058, 0.013), mat=SLOT["dark"])   # sole (dark, grounds the shoe)

    mats = char_materials(cfg, tag)
    obj = sb.build(f"Char2_{role}", materials=mats, armature=arm, shade_smooth=True)

    core.set_custom_props(obj, {
        "studio_role": role, "studio_class": "character", "studio_build_size": cfg["size"],
        "studio_front_axis": "-Y", "studio_pipeline_ver": "character2",
        **config.PROVENANCE, "milestone": "asset-lab-05b",
    })
    obj.name = f"Char_{role}_{cfg['size'].capitalize()}"
    return obj


def _hair_ell(sb, cx, cy, cz, sx, sy, sz, mat, u=16, v=10):
    sb.uvsphere("Head", 1.0, u=u, v=v, matrix=T(cx, cy, cz) @ Matrix.Diagonal((sx, sy, sz, 1)), mat=mat)


def _add_hair(sb, style, hc, mat):
    """A designed hairstyle for a bare head (weighted Head). Covers top/back/sides; the -Y face
    stays skin. >=4 distinct silhouettes so heads never read bald or interchangeable."""
    hx, hy, hz = hc.x, hc.y, hc.z
    _hair_ell(sb, hx, hy + 0.030, hz + 0.032, 0.120, 0.120, 0.112, mat)          # base cap (all styles)
    if style == "sidepart":
        _hair_ell(sb, hx + 0.055, hy - 0.052, hz + 0.078, 0.058, 0.050, 0.034, mat)  # swept front bang
        _hair_ell(sb, hx - 0.02, hy - 0.060, hz + 0.088, 0.070, 0.045, 0.030, mat)
    elif style == "bun":
        _hair_ell(sb, hx, hy + 0.122, hz + 0.060, 0.056, 0.052, 0.052, mat, u=12)     # bun at back-top
    elif style == "ponytail":
        _hair_ell(sb, hx, hy + 0.118, hz - 0.030, 0.036, 0.046, 0.078, mat, u=10)     # tail hanging back
    elif style == "curly":
        _hair_ell(sb, hx, hy + 0.035, hz + 0.052, 0.130, 0.130, 0.126, mat, u=20, v=14)  # fuller rounded
    elif style == "quiff":
        _hair_ell(sb, hx, hy - 0.050, hz + 0.098, 0.070, 0.055, 0.048, mat)           # raised front quiff
    # "short" = just the base cap


def _add_hair_fringe(sb, hc, mat):
    """A fringe/sideburn band that shows under a hat so a hatted head is never bald."""
    hx, hy, hz = hc.x, hc.y, hc.z
    _hair_ell(sb, hx, hy + 0.038, hz - 0.008, 0.114, 0.114, 0.078, mat, u=18)   # lower back/side band
    for sgn in (-1, 1):                                                          # temple sideburns
        _hair_ell(sb, hx + sgn * 0.088, hy - 0.018, hz + 0.028, 0.030, 0.055, 0.060, mat, u=8, v=6)


def _add_facial_hair(sb, kind, hc, mat):
    """Facial hair (weighted Head), hair-coloured. Adds character + age variety."""
    hx, hy, hz = hc.x, hc.y, hc.z
    fy = hy - 0.092
    if kind in ("mustache", "beard", "goatee"):
        _hair_ell(sb, hx, fy - 0.004, hz - 0.036, 0.028, 0.012, 0.010, mat, u=10, v=6)  # mustache
    if kind == "beard":
        _hair_ell(sb, hx, fy + 0.004, hz - 0.072, 0.050, 0.046, 0.044, mat, u=12, v=8)  # chin/jaw mass
        for sgn in (-1, 1):
            _hair_ell(sb, hx + sgn * 0.050, fy + 0.028, hz - 0.048, 0.020, 0.044, 0.052, mat, u=8, v=6)  # jawline
    elif kind == "goatee":
        _hair_ell(sb, hx, fy - 0.002, hz - 0.070, 0.024, 0.028, 0.026, mat, u=10, v=6)  # chin tuft
    elif kind == "stubble":
        _hair_ell(sb, hx, fy + 0.010, hz - 0.058, 0.058, 0.040, 0.030, mat, u=12, v=6)  # low-jaw shadow


def _add_headwear(sb, kind, head_center):
    """Add headwear geometry weighted 100% to Head (follows head translation+rotation)."""
    if not kind:
        return
    c = head_center + Vector((0, 0.005, 0.0))
    top = c.z + 0.12
    if kind == "hardhat":
        # dome hugging the crown (not a bowl balanced high) + a brim RAISED clear of the eyeline
        sb.uvsphere("Head", 0.124, u=18, v=10, matrix=T(c.x, c.y, c.z + 0.082) @ Matrix.Diagonal((1.0, 1.02, 0.86, 1)), mat=SLOT["hat"])
        sb.cyl("Head", 0.138, 0.016, segments=20, matrix=T(c.x, c.y - 0.010, c.z + 0.060), mat=SLOT["hat"])   # brim (raised)
    elif kind == "fedora":
        sb.cyl("Head", 0.185, 0.02, segments=22, matrix=T(c.x, c.y, top - 0.02), mat=SLOT["hat"])          # brim
        sb.cone("Head", 0.115, 0.10, 0.12, segments=18, matrix=T(c.x, c.y, top + 0.05), mat=SLOT["hat"])   # crown
    elif kind == "flatcap":
        sb.uvsphere("Head", 0.128, u=16, v=8, matrix=T(c.x, c.y, top - 0.04) @ Matrix.Diagonal((1, 1.08, 0.5, 1)), mat=SLOT["hat"])
        sb.box("Head", size=(0.15, 0.10, 0.014), matrix=T(c.x, c.y - 0.135, top - 0.03), mat=SLOT["hat"])  # bill front -Y
    elif kind == "softcap":
        sb.uvsphere("Head", 0.126, u=16, v=8, matrix=T(c.x, c.y + 0.005, top - 0.045) @ Matrix.Diagonal((1, 1.05, 0.55, 1)), mat=SLOT["hat"])
        sb.box("Head", size=(0.14, 0.11, 0.014), matrix=T(c.x, c.y - 0.14, top - 0.05), mat=SLOT["hat"])   # peak front -Y
