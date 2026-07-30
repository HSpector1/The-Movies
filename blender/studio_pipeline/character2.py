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
    "Maintenance":dict(size="heavy",    skin="skin_03", hair="hair_grey",  shirt=(0.20, 0.22, 0.13), trousers=(0.20, 0.22, 0.13),
                       hat="beanie",    belt=True,  coat=False, coveralls=True, hat_col=(0.16, 0.18, 0.11), facial_hair="stubble"),
    # Office: a lightweight dark top (NOT a long coat — that's Director) so it reads as admin, not a smock
    "Office":     dict(size="standard", skin="skin_04", hair="hair_grey",  shirt=(0.44, 0.21, 0.24), trousers="trousers_grey",
                       hat=None,        belt=False, coat=False, satchel=True, hair_style="bun"),
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
        s("leather",  (0.21, 0.15, 0.12),       roughness=0.5),    # 3 boots/belt (mid-brown; form reads vs the dark sole)
        s("dark",     (0.09, 0.07, 0.06),       roughness=0.55),   # 4 features + accessory (fixed dark)
        s("white",    (0.93, 0.92, 0.90),       roughness=0.4),    # 5 (eye white / paper)
        s("hat",      _col(P, cfg.get("hat_col", "felt_grey")), roughness=0.85),  # 6
        s("hivis",    (0.96, 0.48, 0.06),       roughness=0.55),   # 7 hi-vis vest
        s("hair",     hair_col,                 roughness=0.85),   # 8 hair (varies)
    ]


def _blend(a, b, wa=0.5):
    return {a: round(wa, 3), b: round(1 - wa, 3)}


def _seed_floats(seed, n):
    """Deterministic list of n floats in [0,1) from an int seed (NO Math.random — reproducible)."""
    out = []
    x = ((int(seed) + 1) * 2654435761) & 0xffffffff
    for _ in range(n):
        x = (x * 1103515245 + 12345) & 0x7fffffff
        out.append(x / 0x7fffffff)
    return out


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
    # per-instance identity variation (deterministic from seed) — a crowd reads as distinct PEOPLE,
    # not one recoloured character. Only shapes head/face features; never touches the skeleton.
    if cfg.get("vary"):
        r = _seed_floats(seed, 8)
        v_headw = 0.93 + 0.14 * r[0]     # head width
        v_headh = 0.97 + 0.08 * r[1]     # head height
        v_nose = 0.80 + 0.45 * r[2]      # nose size
        v_mouth = 0.88 + 0.28 * r[3]     # mouth width
        v_chin = 0.85 + 0.34 * r[4]      # chin size
        v_eye = -0.0035 + 0.007 * r[5]   # eye-spacing delta
        v_brow = 0.88 + 0.32 * r[6]      # brow thickness
    else:
        v_headw = v_headh = v_nose = v_mouth = v_chin = v_brow = 1.0
        v_eye = 0.0
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

    def ell(w, cx, cy, cz, hxx, hyy, hzz, mat, u=16, v=12):   # 05D: leaner default subdiv (tri budget)
        """A rounded ellipsoid (half-extents hxx,hyy,hzz) — the organic building block that
        replaces the Lab-05B stacked boxes so the torso/hips read as a body, not armor."""
        sb.uvsphere(w, 1.0, u=u, v=v, matrix=T(cx, cy, cz) @ Matrix.Diagonal((hxx, hyy, hzz, 1)), mat=mat)

    # --- pelvis / hips (trousers): a rounded seat that flows into the thighs — 05E closes the dark
    #     crotch V with a central bridge fill, and tucks the hip mass so it does not read as a paunch. ---
    ell("pelvis", pelvis.x, pelvis.y + 0.004, pelvis.z + 0.05, 0.146 * HI, 0.110 * HI, 0.118, lower, u=18, v=12)  # hip mass (tucked)
    seat_z = (pelvis.z + h("thigh_l").z) * 0.5 - 0.01
    ell("pelvis", 0, pelvis.y + 0.006, seat_z, 0.150 * HI, 0.116 * HI, 0.100, lower, u=16, v=10)                  # seat
    # crotch bridge — a narrow fill between the thigh tops so the inner-thigh join reads CLOSED (no dark V)
    ell("pelvis", 0, pelvis.y - 0.006, h("thigh_l").z - 0.002, 0.052 * HI, 0.066 * HI, 0.066, lower, u=12, v=8)
    # --- torso (shirt): ONE lofted, continuously-skinned shell (05E) — NOT a stack of ellipsoids.
    #     A single surface reads as a fitted garment; a pile of overlapping spheres creased at every
    #     boundary and read "musclebound / assembled". Rings run hem -> pinched waist -> broad chest
    #     -> shoulder yoke -> neck taper; the chest ring is proud in -Y (front) and the waist tucks
    #     back (+Y) so the FRONT profile is athletic, without a hard pec/belly boundary. Each ring is
    #     weighted along the spine (_spine_w) so the whole torso deforms as one under every clip. ---
    _spine_cp = sorted([(pelvis.z, "pelvis"), (s1.z, "spine_01"), (s2.z, "spine_02"),
                        (s3.z, "spine_03"), (neck.z, "neck_01")])

    def _spine_w(z):
        if z <= _spine_cp[0][0]:
            return {_spine_cp[0][1]: 1.0}
        if z >= _spine_cp[-1][0]:
            return {_spine_cp[-1][1]: 1.0}
        for k in range(len(_spine_cp) - 1):
            z0, b0 = _spine_cp[k]; z1, b1 = _spine_cp[k + 1]
            if z0 <= z <= z1:
                t = (z - z0) / max(z1 - z0, 1e-6)
                return {b0: round(1 - t, 3), b1: round(t, 3)}
        return {_spine_cp[-1][1]: 1.0}

    yb = s2.y   # torso front-back centre baseline (spine is ~vertical, so s1/s2/s3 y are ~equal)
    # (z, cy, rx, ry): a smooth S-curve silhouette. rx uses WA/CH/SH per profile; ry is the flatter
    # front-back depth. cy nudges the belly back (+Y) and the chest forward (-Y) for an athletic front.
    torso_rings = [
        (pelvis.z + 0.100, yb + 0.014, 0.138 * WA, 0.092 * WA),   # low shirt hem (overlaps waistband)
        (s1.z - 0.010,     yb + 0.014, 0.132 * WA, 0.086 * WA),   # pinched waist (WA)
        (s1.z + 0.040,     yb + 0.006, 0.146 * WA, 0.094 * WA),   # rising ribcage
        ((s1.z + s2.z) * 0.5, yb - 0.004, 0.166 * CH, 0.104 * CH),  # lower chest
        (s2.z + 0.010,     yb - 0.008, 0.178 * CH, 0.110 * CH),   # chest (broadest + proud front)
        ((s2.z + s3.z) * 0.5 + 0.005, yb - 0.004, 0.186 * SH, 0.100 * SH),  # upper chest
        (s3.z + 0.015,     yb - 0.002, 0.188 * SH, 0.092 * SH),   # shoulder yoke (SH)
        (neck.z - 0.010,   yb + 0.004, 0.116 * SH, 0.088 * SH),   # neck taper (into the collar)
    ]
    sb.loft([(_spine_w(z), 0.0, cy, z, rx, ry) for (z, cy, rx, ry) in torso_rings],
            segments=24, mat=upper)
    # trapezius: a small fill softening the neck -> shoulder run (no square corner at the yoke top)
    ell(_blend("spine_03", "neck_01", 0.7), neck.x, neck.y + 0.014, neck.z - 0.050, 0.100 * SH, 0.088 * SH, 0.050, upper, u=14, v=8)
    # collar: a raised folded band at the neckline (a real shirt collar, not just a ring)
    sb.cyl("spine_03", 0.082 * g, 0.045, segments=18,
           matrix=T(neck.x, neck.y, neck.z - 0.006) @ Matrix.Diagonal((1.0, 0.92, 1.0, 1)), mat=upper)  # 05E: dropped to reveal neck
    # front placket + buttons (shirt roles). 05E: the placket is a THIN RAISED SEAM in the SHIRT
    # colour (reads via a soft shading line, like real fabric) — NOT the old near-black box that read
    # as a painted-on stripe. Only the small buttons stay dark, as buttons should.
    if not cfg.get("coat") and not cfg.get("vest"):
        pz0, pz1 = s2.z + 0.045, s1.z - 0.010
        front_y = yb - 0.108 * CH   # sit the seam just proud of the lofted chest front
        sb.box("spine_02", size=(0.020, 0.014, pz0 - pz1), matrix=T(0, front_y, (pz0 + pz1) * 0.5), mat=upper)   # raised placket seam (shirt)
        for i in range(4):
            sb.uvsphere("spine_02", 0.0075, u=6, v=6, matrix=T(0, front_y - 0.006, pz0 - 0.028 - i * 0.058), mat=SLOT["dark"])  # small buttons
        # chest pocket (work shirt / coveralls) — a subtle fabric panel, shirt-coloured
        sb.box("spine_02", size=(0.056, 0.012, 0.052), matrix=T(0.078, yb - 0.104 * CH, s2.z - 0.010), mat=upper)
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
        # tool pouch — a small FLAT bag seated on the belt + hanging on the hip (a box reads as a bag;
        # a sphere read as a ball jutting off the hip). Kept snug (front -Y, low) so it never floats.
        sb.box("pelvis", size=(0.070, 0.052, 0.088), matrix=T(0.118, -0.074, pelvis.z - 0.030), mat=leather)
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
    # office satchel — diagonal shoulder strap + hip bag (distinct greyscale silhouette vs the PA clipboard)
    if cfg.get("satchel"):
        sb.segment(_blend("spine_03", "spine_01", 0.5), Vector((0.09, s2.y - 0.09 * g, s3.z)),
                   Vector((-0.16, pelvis.y - 0.03, pelvis.z + 0.14)), 0.018, 0.016, segments=8, mat=leather)  # strap
        sb.box("pelvis", size=(0.15, 0.11, 0.15), matrix=T(-0.17, -0.03, pelvis.z + 0.10), mat=leather)        # bag on hip
    # maintenance coverall bib + shoulder straps (one-piece chest silhouette vs a shirt+belt = greyscale-distinct)
    if cfg.get("coveralls"):
        sb.box("spine_02", size=(0.19, 0.02, 0.22), matrix=T(0, s2.y - 0.104 * g, s2.z - 0.015), mat=lower)   # chest bib panel
        for sgn in (-1, 1):
            sb.segment("spine_03", Vector((sgn * 0.085, s3.y - 0.07, s3.z + 0.05)),
                       Vector((sgn * 0.065, s1.y - 0.088, s1.z)), 0.015, 0.015, segments=6, mat=lower)         # bib strap
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
    sb.cyl(_blend("neck_01", "spine_03", 0.6), 0.051, 0.125, segments=12,
           matrix=T(neck.x, neck.y, neck.z + 0.045), mat=skin)   # 05E: slightly slimmer/taller (was a stump)
    # head ovoid — slightly narrower in X, deeper/taller, chin dropped forward (-Y)
    sb.uvsphere("Head", 0.108, u=18, v=14,
                matrix=T(head_c.x, head_c.y - 0.008, head_c.z + 0.02) @ Matrix.Diagonal((0.9 * v_headw, 1.02, 1.16 * v_headh, 1)), mat=skin)

    # ----- FACE (-Y front): clean, symmetric, FRIENDLY stylized features (05C) -----
    hx, hy, hz = head_c.x, head_c.y, head_c.z + 0.02
    fy = hy - 0.092          # feature front plane
    ex = 0.0335 + v_eye      # eye separation (half) — brought inward (Loop-6 gate) + per-instance vary
    # ----- head SCULPT (05D): SUBTLE cheekbone/chin/brow planes so the head reads sculpted (not egg,
    #       not jowly). Small, restrained forms that blend into the ovoid via shade-smooth. -----
    sb.uvsphere("Head", 1.0, u=10, v=8,
                matrix=T(hx, hy - 0.052, hz - 0.064) @ Matrix.Diagonal((0.038 * v_chin, 0.042 * v_chin, 0.036, 1)), mat=skin)   # chin (varies)
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
                    matrix=T(hx + sgn * ex, fy - 0.002, hz + 0.044) @ Matrix.Diagonal((0.033, 0.012 * v_brow, 0.0085 * v_brow, 1)), mat=SLOT["hair"])  # brow (varies)
    # nose = a small soft bump protruding -Y (skin), not a lump wedge
    sb.uvsphere("Head", 1.0, u=10, v=8,
                matrix=T(hx, fy - 0.008, hz - 0.006) @ Matrix.Diagonal((0.015 * v_nose, 0.021 * v_nose, 0.019 * v_nose, 1)), mat=skin)
    # mouth = TWO lit lips (upper + lower, skin) with a thin dark line between + upward corners → a
    # gentle smile that actually reads (was a single black bar). Width varies per-instance.
    sb.uvsphere("Head", 1.0, u=10, v=6, matrix=T(hx, fy - 0.004, hz - 0.046) @ Matrix.Diagonal((0.028 * v_mouth, 0.013, 0.008, 1)), mat=skin)   # upper lip
    sb.uvsphere("Head", 1.0, u=10, v=6, matrix=T(hx, fy - 0.004, hz - 0.058) @ Matrix.Diagonal((0.028 * v_mouth, 0.014, 0.009, 1)), mat=skin)   # lower lip
    sb.uvsphere("Head", 1.0, u=12, v=4, matrix=T(hx, fy - 0.002, hz - 0.052) @ Matrix.Diagonal((0.024 * v_mouth, 0.010, 0.0035, 1)), mat=dark)  # thin mouth line
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
        # SLEEVE (05E): ONE continuous shirt tube — deltoid -> bicep -> elbow -> rolled cuff. The
        # deltoid ring is wide enough to MEET the torso yoke (arm flows out of the shoulder, no plug),
        # and the elbow bends as one surface (no butt-jointed segment ring / crease).
        sleeve_rings = [
            (_blend(f"clavicle_{s}", f"upperarm_{s}", 0.4), Vector((ua_h.x - sgn * 0.012, ua_h.y, ua_h.z - 0.004)), (0.066 * SH, 0.064 * SH)),  # deltoid (meets yoke)
            (f"upperarm_{s}",                               ua_h.lerp(la_h, 0.40),                                  (0.058 * LI, 0.056 * LI)),   # bicep
            (f"upperarm_{s}",                               ua_h.lerp(la_h, 0.80),                                  (0.052 * LI, 0.050 * LI)),   # lower upper-arm
            (_blend(f"upperarm_{s}", f"lowerarm_{s}"),      la_h.copy(),                                            (0.050 * LI, 0.049 * LI)),   # elbow (keeps volume)
            (f"lowerarm_{s}",                               la_h.lerp(hn_h, 0.30),                                  (0.051, 0.050)),              # rolled sleeve cuff (proud lip)
        ]
        sb.tube(sleeve_rings, up=(0, 0, 1), segments=16, mat=upper)
        # FOREARM (skin): a second tube from under the sleeve cuff to a slim wrist (overlaps the cuff
        # at ~0.26 so there is no gap; the sleeve/skin boundary reads as the rolled cuff, away from the
        # elbow joint so the bend stays clean).
        fore_rings = [
            (f"lowerarm_{s}",                            la_h.lerp(hn_h, 0.26), (0.045, 0.044)),
            (f"lowerarm_{s}",                            la_h.lerp(hn_h, 0.62), (0.040, 0.039)),
            (_blend(f"lowerarm_{s}", f"hand_{s}", 0.4),  hn_h.copy(),           (0.032, 0.031)),   # slim wrist
        ]
        sb.tube(fore_rings, up=(0, 0, 1), segments=16, mat=skin)
        # HAND: a flatter, slightly larger palm + FOUR relaxed fingers + a thumb (a competent stylized
        # hand — not a paddle, not a claw). Rigid to hand_{s}, so the extra geometry is deform-safe.
        palm = hn_h + Vector((sgn * 0.040, 0, 0))
        sb.uvsphere(f"hand_{s}", 1.0, u=10, v=8,
                    matrix=T(palm.x, palm.y, palm.z) @ Matrix.Diagonal((0.050, 0.052, 0.021, 1)), mat=skin)   # palm (flatter)
        fbaseX = hn_h.x + sgn * 0.062
        ftipX = hn_h.x + sgn * 0.116   # LONGER fingers (were stubby)
        # (y-offset across the palm, extra tip length, tip radius) — middle longest, pinky shortest.
        # Fingers sit CLOSE (relaxed, gentle splay ~±0.02) with a soft downward curl; a knuckle bump
        # at each base — so they read as distinct digits from front/3q without becoming a spread claw.
        for fy_off, flen, rtip in ((-0.021, 0.004, 0.0080), (-0.007, 0.014, 0.0090),
                                   (0.007, 0.006, 0.0088), (0.021, -0.010, 0.0078)):
            base = Vector((fbaseX, hn_h.y + fy_off, hn_h.z + 0.002))
            tip = Vector((ftipX + sgn * flen, hn_h.y + fy_off * 1.22, hn_h.z - 0.014))
            sb.segment(f"hand_{s}", base, tip, 0.0118, rtip, segments=6, mat=skin)
            sb.uvsphere(f"hand_{s}", 0.011, u=6, v=5, matrix=T(base.x, base.y, base.z), mat=skin)  # knuckle
        # thumb: off the front-inner edge of the palm, angled forward (-Y) + slightly up
        tp0 = Vector((hn_h.x + sgn * 0.046, hn_h.y - 0.022, hn_h.z + 0.004))
        tp1 = Vector((hn_h.x + sgn * 0.064, hn_h.y - 0.066, hn_h.z + 0.002))
        sb.segment(f"hand_{s}", tp0, tp1, 0.0145, 0.0100, segments=6, mat=skin)

    # ============================================================ LEGS
    for s in ("l", "r"):
        th_h, ca_h, ft_h, bl_t = h(f"thigh_{s}"), h(f"calf_{s}"), h(f"foot_{s}"), t(f"ball_{s}")
        # TROUSER LEG (05E): ONE continuous swept tube hip -> thigh -> knee -> calf -> ankle, each
        # ring weighted along the thigh/calf/foot chain (no butt-jointed segment cones, so NO knee
        # seam-band and no hip gap). Front taper thigh>knee>calf reads via the rx fall-off; a fuller
        # calf via the ry bump + a small back nudge. The trouser ends at the ankle, tucked into the boot.
        leg_rings = [
            (_blend("pelvis", f"thigh_{s}", 0.5), Vector((th_h.x - sgn * 0.004, th_h.y + 0.004, th_h.z + 0.030)), (0.090 * HI, 0.094 * HI)),
            (f"thigh_{s}",                        Vector((th_h.x, th_h.y + 0.004, th_h.z)),                       (0.094 * LI, 0.096 * LI)),
            (f"thigh_{s}",                        th_h.lerp(ca_h, 0.5),                                           (0.078 * LI, 0.082 * LI)),
            (_blend(f"thigh_{s}", f"calf_{s}"),   Vector((ca_h.x, ca_h.y - 0.004, ca_h.z)),                       (0.066, 0.070)),
            (f"calf_{s}",                         ca_h.lerp(ft_h, 0.34) + Vector((0, 0.010, 0)),                  (0.058 * LI, 0.070 * LI)),
            (f"calf_{s}",                         ca_h.lerp(ft_h, 0.74),                                          (0.048, 0.050)),
            (_blend(f"calf_{s}", f"foot_{s}", 0.4), ft_h.copy(),                                                  (0.045, 0.047)),
        ]
        sb.tube(leg_rings, up=(0, 1, 0), segments=18, mat=lower)
        # SHOE (05E): a PROPER stylized work boot — a bigger, better-read boot with a defined ankle
        # cuff (the boot opening the trouser tucks into), a fuller instep/heel, a work-boot toe box,
        # and a dark sole that gives the boot a value break (was a small near-black rounded lump).
        heel_z = 0.052
        # boot cuff / ankle (blend calf->foot, leather) — reads as the boot top + closes the join
        sb.uvsphere(_blend(f"calf_{s}", f"foot_{s}", 0.4), 1.0, u=10, v=8,
                    matrix=T(ft_h.x, ft_h.y + 0.006, ft_h.z + 0.002) @ Matrix.Diagonal((0.050, 0.052, 0.056, 1)), mat=leather)
        # instep / heel mass (fuller)
        sb.uvsphere(_blend(f"foot_{s}", f"ball_{s}", 0.6), 1.0, u=10, v=8,
                    matrix=T(ft_h.x, ft_h.y - 0.022, heel_z) @ Matrix.Diagonal((0.058, 0.084, 0.062, 1)), mat=leather)
        # toe box (rounded work-boot toe) — bigger + forward
        sb.uvsphere(f"ball_{s}", 1.0, u=12, v=8,
                    matrix=T(ft_h.x, ft_h.y - 0.122, heel_z - 0.010) @ Matrix.Diagonal((0.055, 0.102, 0.050, 1)), mat=leather)
        # sole (dark) — grounds the shoe + a clear value break under the leather upper
        sb.box(_blend(f"foot_{s}", f"ball_{s}", 0.5), size=(0.106, 0.284, 0.032),
               matrix=T(ft_h.x, ft_h.y - 0.060, 0.015), mat=SLOT["dark"])

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
    elif kind == "beanie":   # rounded knit cap, NO bill — a distinct head silhouette vs the flat/soft caps
        sb.uvsphere("Head", 0.134, u=16, v=10, matrix=T(c.x, c.y, top - 0.055) @ Matrix.Diagonal((1.0, 1.0, 0.72, 1)), mat=SLOT["hat"])
        sb.cyl("Head", 0.132, 0.03, segments=18, matrix=T(c.x, c.y, top - 0.085), mat=SLOT["hat"])         # folded brim band
