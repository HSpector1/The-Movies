"""Asset Lab 05F — HERO Electric character builder (ADDITIVE proof).

ONE genuinely-improved stylized Electric crew character, built on the SAME accepted 05E technical
pipeline (65-bone UAL Mannequin, SkinnedBuilder, loft/tube primitives, materials, coordinate/export
conventions) — but with the weak regions the owner rejected at human scale REBUILT as intentional,
continuous surfaces:

  * pelvis + trousers  → one continuous lofted hip with a shaped seat that flows into the leg tubes
                         (no diaper shell, no crotch-ball protrusion) — Iteration 1.
  * fitted safety vest → a thin torso-following shell (open front, armholes, restrained bands)       — Iteration 2.
  * shoulders + hands  → continuous deltoid-into-yoke + an intentional modelled hand                 — Iteration 3.
  * work boots         → toe box / vamp / heel / sole / ankle opening                                 — Iteration 4.

This file is SEPARATE from character2.py: the 05E crew (all 8 roles, incl. the 05E Electric GLBs)
is NOT touched. The strong 05E constructs (lofted torso, tube arms, face) are reused; only the
rejected regions are rebuilt. Helpers are imported from character2 so nothing is duplicated that
could drift.
"""
import math
import bpy
from mathutils import Vector, Matrix
from . import config, core, rig, materials
from .meshgen import T, S, R
from .skinning import SkinnedBuilder
from .character2 import (
    SLOT, SIZE, ROLES, _blend, char_materials,
    _add_hair_fringe, _add_headwear, _add_facial_hair,
)

# which regions are the rebuilt HERO versions vs still copied from 05E (advances each iteration)
HERO_STAGE = {
    "pelvis": True,    # Iteration 1
    "vest":   True,    # Iteration 2
    "arms":   True,    # Iteration 3
    "hands":  True,    # Iteration 3
    "boots":  True,    # Iteration 4
    "face":   False,   # Iteration 6
}


def build_hero(arm, tag="ElectricHero", seed=1):
    """Author the hero Electric character, directly skinned to `arm`. Returns the mesh object."""
    cfg = dict(ROLES["Electric"])
    prof = SIZE[cfg["size"]]
    CH, WA, HI, LI, SH = prof["chest"], prof["waist"], prof["hip"], prof["limb"], prof["shoulder"]
    NK = prof.get("neck", 1.0)
    g = (CH + WA + HI) / 3.0
    v_headw = v_headh = v_nose = v_mouth = v_chin = v_brow = 1.0
    v_eye = 0.0

    J = rig.rest_points(arm)

    def h(n): return J[n]["head"].copy()
    def t(n): return J[n]["tail"].copy()
    def c(n): return J[n]["center"].copy()

    sb = SkinnedBuilder()
    upper = SLOT["shirt"]; lower = SLOT["trousers"]; skin = SLOT["skin"]
    leather = SLOT["leather"]; dark = SLOT["dark"]; white = SLOT["white"]

    pelvis = h("pelvis"); s1 = c("spine_01"); s2 = c("spine_02"); s3 = c("spine_03")
    neck = h("neck_01"); head_c = c("Head")

    def ell(w, cx, cy, cz, hxx, hyy, hzz, mat, u=16, v=12):
        sb.uvsphere(w, 1.0, u=u, v=v, matrix=T(cx, cy, cz) @ Matrix.Diagonal((hxx, hyy, hzz, 1)), mat=mat)

    # ============================================================ TORSO (reused 05E loft — strong)
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
                tt = (z - z0) / max(z1 - z0, 1e-6)
                return {b0: round(1 - tt, 3), b1: round(tt, 3)}
        return {_spine_cp[-1][1]: 1.0}

    yb = s2.y
    torso_rings = [
        (pelvis.z + 0.100, yb + 0.014, 0.134 * WA, 0.086 * WA),
        (s1.z - 0.010,     yb + 0.014, 0.126 * WA, 0.080 * WA),
        (s1.z + 0.040,     yb + 0.006, 0.142 * WA, 0.088 * WA),
        ((s1.z + s2.z) * 0.5, yb - 0.004, 0.165 * CH, 0.098 * CH),
        (s2.z + 0.010,     yb - 0.008, 0.178 * CH, 0.103 * CH),
        ((s2.z + s3.z) * 0.5 + 0.005, yb - 0.004, 0.186 * SH, 0.094 * SH),
        (s3.z + 0.015,     yb - 0.002, 0.188 * SH, 0.088 * SH),
        (neck.z - 0.010,   yb + 0.004, 0.112 * SH, 0.084 * SH),
    ]
    sb.loft([(_spine_w(z), 0.0, cy, z, rx, ry) for (z, cy, rx, ry) in torso_rings], segments=24, mat=upper)
    ell(_blend("spine_03", "neck_01", 0.7), neck.x, neck.y + 0.014, neck.z - 0.050, 0.100 * SH, 0.088 * SH, 0.050, upper, u=14, v=8)
    sb.cyl("spine_03", 0.082 * g, 0.045, segments=18,
           matrix=T(neck.x, neck.y, neck.z - 0.006) @ Matrix.Diagonal((1.0, 0.92, 1.0, 1)), mat=upper)

    th_l = h("thigh_l"); th_r = h("thigh_r")

    # ============================================================ PELVIS + TROUSERS (HERO rebuild)
    if HERO_STAGE["pelvis"]:
        # ONE continuous lofted hip/seat (replaces the 05E pelvis+seat+crotch-ball ellipsoids). Rings run
        # waistband -> hip -> shaped SEAT -> crotch base, weighted to the pelvis bone, so the rear reads
        # as a believable seat (a curve, not a rounded diaper shell) and the front is clean (no ball).
        # cy pushes the lower/rear rings BACK (+Y) for the buttock, and the crotch base narrows in.
        crotch_z = th_l.z - 0.010
        # 6 rings, and the bottom two NARROW + tuck between the legs so the wide leg-tube tops cover the
        # hip loft's lower edge — this hides the seat->thigh junction (the iter-1 jagged seam) instead of
        # letting two mismatched surfaces cross. segments=18 matches the leg tubes so overlapping edges align.
        hip_rings = [
            (pelvis.z + 0.086, 0.004, 0.150 * HI, 0.112 * HI),   # waistband (overlaps the shirt hem)
            (pelvis.z + 0.040, 0.004, 0.153 * HI, 0.117 * HI),   # upper hip
            (pelvis.z - 0.010, 0.008, 0.159 * HI, 0.123 * HI),   # widest hip
            (pelvis.z - 0.055, 0.020, 0.154 * HI, 0.132 * HI),   # SEAT (pushed back for the buttock)
            (pelvis.z - 0.100, 0.014, 0.132 * HI, 0.118 * HI),   # lower seat (seat curve continues down)
            (crotch_z,         0.008, 0.100 * HI, 0.098 * HI),   # crotch base (narrow, tucked between legs)
        ]
        sb.loft([("pelvis", 0.0, cy, z, rx, ry) for (z, cy, rx, ry) in hip_rings], segments=18, mat=lower)
        # (The hip loft's own top ring IS the waistband — no separate band cylinder, which previously
        #  crossed the loft at a mismatched segment count and produced the jagged crenellation seam.)
        # crotch inseam gusset — a THIN, RECESSED wedge between the thigh tops (NOT a proud ball). Pushed
        # back (+Y) + up so it closes the crotch V from behind rather than protruding at the front.
        ell("pelvis", 0.0, th_l.y + 0.036, crotch_z + 0.002, 0.056 * HI, 0.034 * HI, 0.048, lower, u=12, v=8)

    # ============================================================ ACCESSORIES (belt/radio/coil — reused)
    if cfg.get("belt"):
        # a CLEAN leather belt band sitting at the natural waist, clearly proud of the trousers + matching
        # the hip loft's 18 segments (a 22-seg band beat against the 18-seg loft and read as crenellation).
        sb.cyl("pelvis", 0.160 * g, 0.046, segments=18,
               matrix=T(pelvis.x, pelvis.y, pelvis.z + 0.048) @ Matrix.Diagonal((1.0, 0.80, 1.0, 1)), mat=leather)
        # hero: FLAT hip pouch hugging the trouser (was a proud floating cube) — thin front-back, sits on the hip
        sb.box("pelvis", size=(0.058, 0.024, 0.072), matrix=T(0.140, -0.058, pelvis.z - 0.030), mat=leather)
    if cfg.get("radio") and cfg.get("belt"):
        # flat radio clipped to the belt (thin front-back, hugs the hip)
        sb.box("pelvis", size=(0.044, 0.026, 0.072), matrix=T(-0.146, -0.086, pelvis.z + 0.010), mat=SLOT["dark"])

    # ============================================================ VEST (HERO: fitted open-front shell)
    if cfg.get("vest") and HERO_STAGE["vest"]:
        # A FITTED safety-vest SHELL that follows the torso loft ~1.5 cm proud — an OPEN-FRONT arc (the
        # shirt shows between the two front panels), ending below the shoulders (natural armholes) and
        # below the neck (natural neck opening). Replaces the 05E three-inflated-ring + rigid-rail vest.
        hv = SLOT["hivis"]
        front = 1.5 * math.pi           # -Y front
        gap = 0.38                      # half-gap (radians) at the front-centre → the open zip line
        a0, a1 = front + gap, front + 2 * math.pi - gap
        # The two upper rings blend a little CLAVICLE so the armhole edge tracks the deltoid on shoulder
        # abduction instead of delaminating into a floating flap (iter-2 rigging major). Symmetric so the
        # ring does not shear sideways. The hem ring stands ~0.6 cm proud for lumbar clearance in deep flex.
        w_up = {"spine_02": 0.36, "spine_03": 0.5, "clavicle_l": 0.07, "clavicle_r": 0.07}
        w_top = {"spine_03": 0.72, "clavicle_l": 0.14, "clavicle_r": 0.14}
        vest_rings = [
            ("spine_01",                          0.0, yb + 0.012, s1.z + 0.006, 0.150 * WA, 0.105 * WA),  # hem (proud for clearance)
            (_blend("spine_01", "spine_02", 0.5), 0.0, yb - 0.004, (s1.z + s2.z) * 0.5, 0.181 * CH, 0.112 * CH),  # lower chest
            ("spine_02",                          0.0, yb - 0.010, s2.z + 0.010, 0.192 * CH, 0.116 * CH),  # chest (proud front)
            (w_up,                                0.0, yb - 0.004, (s2.z + s3.z) * 0.5 + 0.005, 0.196 * SH, 0.107 * SH),  # upper chest
            (w_top,                               0.0, yb - 0.002, s3.z - 0.006, 0.188 * SH, 0.099 * SH),  # top (below the shoulder yoke)
        ]
        sb.arc_loft([(w, cx, cy, cz, rx, ry) for (w, cx, cy, cz, rx, ry) in vest_rings], a0, a1, segments=22, mat=hv)
        # OVER-SHOULDER YOKE STRAPS (iter-2 must_fix): a hi-vis strap over each trapezius connecting the
        # front panel to the back panel, weighted to the clavicle so the vest reads as SHOULDER-HUNG (not
        # a chest wrap) and the armhole edge follows the shoulder. This is what makes it unmistakably a vest.
        for s in ("l", "r"):
            sgn = 1 if s == "l" else -1
            wstrap = _blend(f"clavicle_{s}", "spine_03", 0.6)
            p_front = Vector((sgn * 0.090, yb - 0.088, s3.z + 0.006))
            p_back = Vector((sgn * 0.090, yb + 0.084, s3.z + 0.010))
            sb.segment(wstrap, p_front, p_back, 0.030, 0.028, segments=8, mat=hv)
        # restrained reflective bands: two THIN white arc-strips wrapping the vest sides/back, sat just
        # proud of the shell (was the two rigid full-ring rails). Each band = a 2-ring arc-loft.
        for bz, brx, bry in ((s2.z + 0.050, 0.194 * CH, 0.118 * CH), (s2.z - 0.030, 0.190 * CH, 0.116 * CH)):
            band = [("spine_02", 0.0, yb - 0.008, bz + dz, brx + 0.004, bry + 0.004) for dz in (0.012, -0.012)]
            sb.arc_loft([(w, cx, cy, cz, rx, ry) for (w, cx, cy, cz, rx, ry) in band], a0, a1, segments=22, mat=white)
    if cfg.get("coil"):
        cl = h("clavicle_l") if "clavicle_l" in J else h("upperarm_l")
        for k in range(3):
            sb.cyl(_blend("spine_03", "clavicle_l", 0.5), 0.085, 0.024, segments=12,
                   matrix=T(cl.x + 0.02, cl.y + 0.03, cl.z - k * 0.03) @ R("X", 1.25), mat=leather)

    # ============================================================ NECK + HEAD + FACE (05E copy)
    sb.cyl(_blend("neck_01", "spine_03", 0.6), 0.051 * NK, 0.125, segments=12,
           matrix=T(neck.x, neck.y, neck.z + 0.045), mat=skin)
    sb.uvsphere("Head", 0.108, u=18, v=14,
                matrix=T(head_c.x, head_c.y - 0.008, head_c.z + 0.02) @ Matrix.Diagonal((0.9 * v_headw, 1.02, 1.16 * v_headh, 1)), mat=skin)
    hx, hy, hz = head_c.x, head_c.y, head_c.z + 0.02
    fy = hy - 0.092
    ex = 0.0335 + v_eye
    sb.uvsphere("Head", 1.0, u=10, v=8, matrix=T(hx, hy - 0.052, hz - 0.064) @ Matrix.Diagonal((0.038 * v_chin, 0.042 * v_chin, 0.036, 1)), mat=skin)
    for sgn in (-1, 1):
        sb.uvsphere("Head", 1.0, u=8, v=6, matrix=T(hx + sgn * 0.050, hy - 0.058, hz + 0.004) @ Matrix.Diagonal((0.028, 0.034, 0.036, 1)), mat=skin)
    sb.uvsphere("Head", 1.0, u=12, v=6, matrix=T(hx, hy - 0.088, hz + 0.050) @ Matrix.Diagonal((0.084, 0.026, 0.016, 1)), mat=skin)
    sb.uvsphere("Head", 1.0, u=8, v=6, matrix=T(hx, hy - 0.090, hz + 0.020) @ Matrix.Diagonal((0.013, 0.024, 0.044, 1)), mat=skin)
    for sgn in (-1, 1):
        sb.uvsphere("Head", 1.0, u=10, v=8, matrix=T(hx + sgn * ex, fy + 0.006, hz + 0.015) @ Matrix.Diagonal((0.030, 0.013, 0.021, 1)), mat=white)
        sb.uvsphere("Head", 0.0135, u=8, v=6, matrix=T(hx + sgn * ex, fy - 0.006, hz + 0.014), mat=dark)
        sb.uvsphere("Head", 0.0055, u=6, v=6, matrix=T(hx + sgn * ex - sgn * 0.004, fy - 0.012, hz + 0.013), mat=white)
        sb.uvsphere("Head", 1.0, u=8, v=6, matrix=T(hx + sgn * ex, fy + 0.003, hz + 0.030) @ Matrix.Diagonal((0.037, 0.013, 0.007, 1)), mat=skin)
        sb.uvsphere("Head", 1.0, u=8, v=6, matrix=T(hx + sgn * ex, fy + 0.004, hz + 0.001) @ Matrix.Diagonal((0.035, 0.012, 0.006, 1)), mat=skin)
        sb.uvsphere("Head", 1.0, u=10, v=6, matrix=T(hx + sgn * ex, fy - 0.002, hz + 0.044) @ Matrix.Diagonal((0.033, 0.012 * v_brow, 0.0085 * v_brow, 1)), mat=SLOT["hair"])
    sb.uvsphere("Head", 1.0, u=10, v=8, matrix=T(hx, fy - 0.008, hz - 0.006) @ Matrix.Diagonal((0.015 * v_nose, 0.021 * v_nose, 0.019 * v_nose, 1)), mat=skin)
    sb.uvsphere("Head", 1.0, u=10, v=6, matrix=T(hx, fy - 0.004, hz - 0.046) @ Matrix.Diagonal((0.028 * v_mouth, 0.013, 0.008, 1)), mat=skin)
    sb.uvsphere("Head", 1.0, u=10, v=6, matrix=T(hx, fy - 0.004, hz - 0.058) @ Matrix.Diagonal((0.028 * v_mouth, 0.014, 0.009, 1)), mat=skin)
    sb.uvsphere("Head", 1.0, u=12, v=4, matrix=T(hx, fy - 0.002, hz - 0.052) @ Matrix.Diagonal((0.024 * v_mouth, 0.010, 0.0035, 1)), mat=dark)
    for sgn in (-1, 1):
        sb.uvsphere("Head", 0.006, u=6, v=6, matrix=T(hx + sgn * 0.026, fy - 0.003, hz - 0.043), mat=skin)
    for sgn in (-1, 1):
        sb.uvsphere("Head", 0.021, u=8, v=6, matrix=T(hx + sgn * 0.098, hy + 0.012, hz) @ Matrix.Diagonal((0.5, 1, 1.25, 1)), mat=skin)
    hc = Vector((hx, hy, hz))
    _add_hair_fringe(sb, hc, SLOT["hair"])
    _add_headwear(sb, cfg.get("hat"), hc)
    if cfg.get("facial_hair"):
        _add_facial_hair(sb, cfg["facial_hair"], hc, SLOT["hair"])

    # ============================================================ ARMS + HANDS (05E copy — refined Iter 3)
    for s in ("l", "r"):
        sgn = 1 if s == "l" else -1
        ua_h, la_h, hn_h = h(f"upperarm_{s}"), h(f"lowerarm_{s}"), h(f"hand_{s}")
        sleeve_rings = [
            (_blend(f"clavicle_{s}", f"upperarm_{s}", 0.4), Vector((ua_h.x - sgn * 0.012, ua_h.y, ua_h.z - 0.004)), (0.066 * SH, 0.064 * SH)),
            (f"upperarm_{s}", ua_h.lerp(la_h, 0.40), (0.058 * LI, 0.056 * LI)),
            (f"upperarm_{s}", ua_h.lerp(la_h, 0.80), (0.052 * LI, 0.050 * LI)),
            (_blend(f"upperarm_{s}", f"lowerarm_{s}"), la_h.copy(), (0.050 * LI, 0.049 * LI)),
            (f"lowerarm_{s}", la_h.lerp(hn_h, 0.30), (0.051, 0.050)),
        ]
        sb.tube(sleeve_rings, up=(0, 0, 1), segments=16, mat=upper)
        fore_rings = [
            (f"lowerarm_{s}", la_h.lerp(hn_h, 0.26), (0.045, 0.044)),
            (f"lowerarm_{s}", la_h.lerp(hn_h, 0.62), (0.040, 0.039)),
            (_blend(f"lowerarm_{s}", f"hand_{s}", 0.4), hn_h.copy(), (0.032, 0.031)),
        ]
        sb.tube(fore_rings, up=(0, 0, 1), segments=16, mat=skin)
        # armpit fill (HERO arms): closes the sleeve-to-torso-side hollow under the deltoid so the arm
        # flows out of the body with no weak armpit gap. Weighted upperarm/spine so it deforms with both.
        if HERO_STAGE["arms"]:
            ap = Vector((ua_h.x - sgn * 0.052, ua_h.y + 0.008, ua_h.z - 0.055))
            sb.uvsphere(_blend(f"upperarm_{s}", "spine_03", 0.5), 1.0, u=8, v=6,
                        matrix=T(ap.x, ap.y, ap.z) @ Matrix.Diagonal((0.050, 0.060, 0.052, 1)), mat=upper)
        if HERO_STAGE["hands"]:
            # HERO HAND: a fuller, intentionally-modelled hand — a smooth wrist, a rounded palm with real
            # THICKNESS, four GROUPED fingers with DEEPER valleys + rounded tapered tips (grouped digits,
            # not a fused mitten slab), and a full opposable thumb. Rigid to hand_{s}, so deform-safe.
            sb.uvsphere(_blend(f"lowerarm_{s}", f"hand_{s}", 0.4), 0.036, u=10, v=8, matrix=T(hn_h.x, hn_h.y, hn_h.z), mat=skin)  # smooth wrist (softens the ring)
            palm = hn_h + Vector((sgn * 0.036, 0, 0))
            sb.uvsphere(f"hand_{s}", 1.0, u=12, v=10, matrix=T(palm.x, palm.y, palm.z) @ Matrix.Diagonal((0.050, 0.056, 0.030, 1)), mat=skin)  # palm (thick)
            sb.uvsphere(f"hand_{s}", 1.0, u=12, v=6, matrix=T(hn_h.x + sgn * 0.066, hn_h.y, hn_h.z + 0.006) @ Matrix.Diagonal((0.018, 0.050, 0.026, 1)), mat=skin)  # knuckle ridge
            fbaseX = hn_h.x + sgn * 0.076
            ftipX = hn_h.x + sgn * 0.122
            for fy_off, flen, rr in ((-0.033, -0.004, 0.0118), (-0.011, 0.006, 0.0128), (0.010, 0.002, 0.0124), (0.031, -0.010, 0.0110)):
                base = Vector((fbaseX, hn_h.y + fy_off, hn_h.z + 0.004))
                tip = Vector((ftipX + sgn * flen, hn_h.y + fy_off * 1.14, hn_h.z - 0.017))  # wider fan → deeper valleys
                sb.segment(f"hand_{s}", base, tip, rr, rr * 0.70, segments=6, mat=skin)
                sb.uvsphere(f"hand_{s}", rr * 0.72, u=6, v=5, matrix=T(tip.x, tip.y, tip.z), mat=skin)  # rounded fingertip
            sb.uvsphere(f"hand_{s}", 1.0, u=8, v=6, matrix=T(hn_h.x + sgn * 0.038, hn_h.y - 0.028, hn_h.z + 0.008) @ Matrix.Diagonal((0.022, 0.026, 0.020, 1)), mat=skin)  # thenar base
            tp0 = Vector((hn_h.x + sgn * 0.046, hn_h.y - 0.032, hn_h.z + 0.010))
            tp1 = Vector((hn_h.x + sgn * 0.080, hn_h.y - 0.056, hn_h.z + 0.004))
            sb.segment(f"hand_{s}", tp0, tp1, 0.0166, 0.0120, segments=6, mat=skin)  # full thumb
            sb.uvsphere(f"hand_{s}", 0.011, u=6, v=5, matrix=T(tp1.x, tp1.y, tp1.z), mat=skin)  # rounded thumb tip
        else:
            palm = hn_h + Vector((sgn * 0.040, 0, 0))
            sb.uvsphere(f"hand_{s}", 1.0, u=10, v=8, matrix=T(palm.x, palm.y, palm.z) @ Matrix.Diagonal((0.052, 0.050, 0.018, 1)), mat=skin)
            fbaseX = hn_h.x + sgn * 0.062; ftipX = hn_h.x + sgn * 0.114
            for fy_off, flen, rbase, rtip in ((-0.022, 0.002, 0.0116, 0.0082), (-0.007, 0.020, 0.0122, 0.0090),
                                              (0.008, 0.010, 0.0118, 0.0086), (0.022, -0.016, 0.0104, 0.0072)):
                base = Vector((fbaseX, hn_h.y + fy_off, hn_h.z + 0.002))
                tip = Vector((ftipX + sgn * flen, hn_h.y + fy_off * 1.22, hn_h.z - 0.014))
                sb.segment(f"hand_{s}", base, tip, rbase, rtip, segments=6, mat=skin)
            sb.uvsphere(f"hand_{s}", 1.0, u=8, v=6, matrix=T(hn_h.x + sgn * 0.040, hn_h.y - 0.024, hn_h.z + 0.006) @ Matrix.Diagonal((0.017, 0.020, 0.016, 1)), mat=skin)
            tp0 = Vector((hn_h.x + sgn * 0.044, hn_h.y - 0.028, hn_h.z + 0.008)); tp1 = Vector((hn_h.x + sgn * 0.076, hn_h.y - 0.058, hn_h.z + 0.006))
            sb.segment(f"hand_{s}", tp0, tp1, 0.0140, 0.0092, segments=6, mat=skin)

    # ============================================================ LEGS (HERO: emerge from the hip loft)
    for s in ("l", "r"):
        sgn = 1 if s == "l" else -1
        th_h, ca_h, ft_h, bl_t = h(f"thigh_{s}"), h(f"calf_{s}"), h(f"foot_{s}"), t(f"ball_{s}")
        # trouser leg tube, top ring tucked UP into the hip loft (overlaps it) so the leg emerges from
        # the seat as one continuous garment — no gap, no separate "leg shell".
        leg_rings = [
            (_blend("pelvis", f"thigh_{s}", 0.4), Vector((th_h.x - sgn * 0.006, th_h.y + 0.006, th_h.z + 0.075)), (0.106 * HI, 0.106 * HI)),  # wide+high: covers the hip loft's lower edge (hides the junction)
            (f"thigh_{s}", Vector((th_h.x, th_h.y + 0.004, th_h.z)), (0.096 * LI, 0.098 * LI)),
            (f"thigh_{s}", th_h.lerp(ca_h, 0.5), (0.078 * LI, 0.082 * LI)),
            (_blend(f"thigh_{s}", f"calf_{s}"), Vector((ca_h.x, ca_h.y - 0.004, ca_h.z)), (0.066, 0.070)),
            (f"calf_{s}", ca_h.lerp(ft_h, 0.34) + Vector((0, 0.010, 0)), (0.058 * LI, 0.070 * LI)),
            (f"calf_{s}", ca_h.lerp(ft_h, 0.74), (0.048, 0.050)),
            (_blend(f"calf_{s}", f"foot_{s}", 0.4), ft_h.copy(), (0.045, 0.047)),
        ]
        sb.tube(leg_rings, up=(0, 1, 0), segments=18, mat=lower)
        # WORK BOOT (HERO): a defined stylized work boot — ankle collar (boot opening, trouser tucks in) +
        # shaped vamp/instep + a boxy toe cap with a top plane + a raised heel block + a soled base with a
        # heel lift. The toe splays slightly outward for a left/right read. Replaces the 05E rounded-lump-
        # on-a-flat-slab shoe.
        if HERO_STAGE["boots"]:
            toe_out = sgn * 0.008
            # boot UPPER (leather) — ONE smooth shaped mass covering ankle→instep→arch (the foot body),
            # so the boot reads as a single form, not a pile of lumps. Slightly de-pillowed to follow the sole.
            sb.uvsphere(_blend(f"foot_{s}", f"ball_{s}", 0.35), 1.0, u=16, v=12,
                        matrix=T(ft_h.x, ft_h.y - 0.030, 0.054) @ Matrix.Diagonal((0.054, 0.114, 0.054, 1)), mat=leather)
            # boot collar (leather) at the ankle — the opening the trouser tucks INTO (wide → hides the cuff)
            sb.uvsphere(_blend(f"calf_{s}", f"foot_{s}", 0.4), 1.0, u=14, v=8,
                        matrix=T(ft_h.x, ft_h.y + 0.004, ft_h.z + 0.010) @ Matrix.Diagonal((0.061, 0.061, 0.066, 1)), mat=leather)
            # toe cap (leather) — a DEFINED, slightly squarer/flatter toe box (slight outward splay = L/R read)
            sb.uvsphere(f"ball_{s}", 1.0, u=14, v=10,
                        matrix=T(ft_h.x + toe_out, ft_h.y - 0.134, 0.043) @ Matrix.Diagonal((0.050, 0.056, 0.042, 1)), mat=leather)
            # sole plate (dark) — pulled IN toward the upper footprint (was overhanging as a slab)
            sb.box(_blend(f"foot_{s}", f"ball_{s}", 0.5), size=(0.092, 0.278, 0.026), matrix=T(ft_h.x, ft_h.y - 0.056, 0.013), mat=SLOT["dark"])
            # heel (dark) — a heel block under the back, raising the boot (a heel, not a flat slab)
            sb.box(f"foot_{s}", size=(0.082, 0.070, 0.034), matrix=T(ft_h.x, ft_h.y + 0.026, 0.030), mat=SLOT["dark"])
        else:
            heel_z = 0.050
            sb.uvsphere(_blend(f"calf_{s}", f"foot_{s}", 0.4), 1.0, u=10, v=8,
                        matrix=T(ft_h.x, ft_h.y + 0.006, ft_h.z + 0.006) @ Matrix.Diagonal((0.052, 0.052, 0.062, 1)), mat=leather)
            sb.uvsphere(_blend(f"foot_{s}", f"ball_{s}", 0.6), 1.0, u=10, v=8,
                        matrix=T(ft_h.x, ft_h.y - 0.020, heel_z) @ Matrix.Diagonal((0.054, 0.078, 0.058, 1)), mat=leather)
            sb.uvsphere(f"ball_{s}", 1.0, u=12, v=8,
                        matrix=T(ft_h.x, ft_h.y - 0.114, heel_z - 0.010) @ Matrix.Diagonal((0.051, 0.092, 0.047, 1)), mat=leather)
            sb.box(_blend(f"foot_{s}", f"ball_{s}", 0.5), size=(0.098, 0.262, 0.030),
                   matrix=T(ft_h.x, ft_h.y - 0.056, 0.014), mat=SLOT["dark"])

    mats = char_materials(cfg, tag)
    obj = sb.build(f"CharHero_{tag}", materials=mats, armature=arm, shade_smooth=True)
    core.set_custom_props(obj, {
        "studio_role": "ElectricHero", "studio_class": "character", "studio_build_size": cfg["size"],
        "studio_front_axis": "-Y", "studio_pipeline_ver": "character_hero_05f",
        **config.PROVENANCE, "milestone": "asset-lab-05f",
    })
    obj.name = "Char_ElectricHero"
    return obj
