"""Asset Lab 05G — HERO Electric SURGICAL CORRECTION builder (ADDITIVE, distinct from 05F).

This file starts as a byte-identical copy of the accepted 05F hero (character_hero.py) and is then
corrected ONLY in the three regions the owner rejected at human scale on the Apple M3 ("ASSET LAB
05F — REVISE"), leaving every passed region (face, head, hair, hat, neck, hands, boots, skeleton,
animation, runtime) untouched:

  * shoulders + sleeves → pointed deltoid wedges removed; a continuous deltoid cap bridges the torso
                          top into the sleeve so the arm flows out of the body (no fin, no gap)  — Iteration 1.
  * fitted safety vest  → the two proud chest-pod panels rebuilt as a THIN torso-following shell
                          (narrower opening, real side wrap, restrained surface bands)          — Iteration 2.
  * pelvis + trousers   → front crotch box + rear belt shelf removed; one continuous trouser seat
                          with waist->pelvis->thigh flow and at most one small hip accessory     — Iteration 3.

The 05F hero (character_hero.py) and ALL 05E GLBs remain byte-identical; this is exported under the
distinct stem electric_hero_05g*.glb. Helpers are imported from character2 so nothing is duplicated.

CORRECT_05G gates each surgical change so the git history + renders show exactly what each iteration
did (all False == a byte-identical 05F baseline; each iteration flips one flag True).
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
    "face":   True,    # Iteration 6
}

# 05G surgical-correction gates. All False == a BYTE-IDENTICAL copy of the accepted 05F hero (the
# "before" baseline). Each 05G iteration flips exactly one flag True so the before/after is provable.
CORRECT_05G = {
    "shoulder": True,    # Iteration 1 — deltoid cap, sleeve join, armpit
    "vest":     True,    # Iteration 2 — thin fitted shell
    "pelvis":   False,   # Iteration 3 — trouser silhouette, belt/accessory
}


def build_hero(arm, tag="ElectricHero", seed=1):
    """Author the hero Electric character, directly skinned to `arm`. Returns the mesh object."""
    cfg = dict(ROLES["Electric"])
    if HERO_STAGE["face"]:
        cfg["skin"] = (0.89, 0.69, 0.55)   # 05F: a touch warmer/richer skin (owner: no washed-out skin)
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
        # back (+Y) + up so it closes the crotch V from behind rather than protruding at the front. 05F
        # iter-5: weighted pelvis + BOTH thighs so it STRETCHES with a wide stance (no inseam notch on
        # the pickup pose) instead of staying central while the legs spread.
        ell({"pelvis": 0.5, "thigh_l": 0.25, "thigh_r": 0.25}, 0.0, th_l.y + 0.036, crotch_z + 0.002, 0.060 * HI, 0.036 * HI, 0.050, lower, u=12, v=8)

    # ============================================================ ACCESSORIES (belt/radio/coil — reused)
    if cfg.get("belt"):
        # a CLEAN leather belt band at the natural waist — clearly PROUD of the hip loft (so only the belt
        # shows, no radius-match beat) + a smooth 24-seg edge (final-gate: the 18-seg edge read faceted/
        # scalloped at human scale against the smooth-shaded hip loft).
        sb.cyl("pelvis", 0.168 * g, 0.044, segments=18,
               matrix=T(pelvis.x, pelvis.y, pelvis.z + 0.046) @ Matrix.Diagonal((1.0, 0.82, 1.0, 1)), mat=leather)
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
        # The two upper rings blend a little CLAVICLE so the armhole edge tracks the deltoid on shoulder
        # abduction instead of delaminating into a floating flap (iter-2 rigging major). Symmetric so the
        # ring does not shear sideways. The hem ring stands ~0.6 cm proud for lumbar clearance in deep flex.
        w_up = {"spine_02": 0.36, "spine_03": 0.5, "clavicle_l": 0.07, "clavicle_r": 0.07}
        w_top = {"spine_03": 0.72, "clavicle_l": 0.14, "clavicle_r": 0.14}
        if CORRECT_05G["vest"]:
            # 05G ITER 2 — THIN FITTED SHELL. Owner (05F REVISE): the vest read as two padded chest pods —
            # excessive projection from the rib cage, excessive thickness, a wide centre opening, weak side
            # wrap, bands reinforcing the block. Corrections: (a) NARROWER opening (gap 0.38 -> 0.22) so the
            # two front panels read as one zip line, not two pods; (b) rx pulled IN to sit ~0.5-0.7 cm proud
            # of the torso (was ~1.4 cm) so it hugs the rib cage; (c) ry raised a touch so the cross-section
            # is ROUNDER (real side wrap around the ribs) instead of a flat frontal slab.
            gap = 0.22
            # ry (front-back DEPTH) is the "projection from the rib cage" the owner rejected — the CHEST is
            # pulled to only ~0.5 cm proud of the torso so it HUGS the ribs (kills the pod look). But the
            # thinner shell removed the clearance the fat 05F vest had, so the reviewer C caught the hem
            # EDGE piercing the shirt where the belly folds in the seated/kneel flex. Fix: GRADUATE the fit
            # — keep the chest fitted, but give the HEM + lower-chest a little more depth (clearance) and
            # raise the hem above the waist fold line so the panel edge never digs into the compressing
            # abdomen. Still far thinner than 05F; the extra clearance is only at the belly, not the chest.
            vest_rings = [
                ("spine_01",                          0.0, yb + 0.008, s1.z + 0.044, 0.152 * WA, 0.112 * WA),  # hem raised above the waist fold + belly clearance
                (_blend("spine_01", "spine_02", 0.5), 0.0, yb - 0.004, (s1.z + s2.z) * 0.5, 0.178 * CH, 0.115 * CH),  # lower chest (clearance for the seated fold)
                ("spine_02",                          0.0, yb - 0.008, s2.z + 0.010, 0.183 * CH, 0.110 * CH),  # chest (~0.5 cm proud, hugging)
                (w_up,                                0.0, yb - 0.004, (s2.z + s3.z) * 0.5 + 0.005, 0.189 * SH, 0.102 * SH),  # upper chest
                (w_top,                               0.0, yb - 0.002, s3.z - 0.018, 0.186 * SH, 0.096 * SH),  # top (armhole/neck edge, flush)
            ]
        else:
            gap = 0.38                      # half-gap (radians) at the front-centre → the open zip line
            vest_rings = [
                ("spine_01",                          0.0, yb + 0.012, s1.z + 0.030, 0.144 * WA, 0.100 * WA),  # hem raised to the waist (above the seat) + hugging
                (_blend("spine_01", "spine_02", 0.5), 0.0, yb - 0.004, (s1.z + s2.z) * 0.5, 0.181 * CH, 0.112 * CH),  # lower chest
                ("spine_02",                          0.0, yb - 0.010, s2.z + 0.010, 0.192 * CH, 0.116 * CH),  # chest (proud front)
                (w_up,                                0.0, yb - 0.004, (s2.z + s3.z) * 0.5 + 0.005, 0.196 * SH, 0.107 * SH),  # upper chest
                (w_top,                               0.0, yb - 0.002, s3.z - 0.018, 0.186 * SH, 0.098 * SH),  # top (lowered so it does not pile up at the shoulder)
            ]
        a0, a1 = front + gap, front + 2 * math.pi - gap
        sb.arc_loft([(w, cx, cy, cz, rx, ry) for (w, cx, cy, cz, rx, ry) in vest_rings], a0, a1, segments=28, mat=hv)
        # OVER-SHOULDER YOKE STRAPS (iter-2 must_fix): a hi-vis strap over each trapezius connecting the
        # front panel to the back panel, weighted to the clavicle so the vest reads as SHOULDER-HUNG (not
        # a chest wrap) and the armhole edge follows the shoulder. This is what makes it unmistakably a vest.
        for s in ("l", "r"):
            sgn = 1 if s == "l" else -1
            wstrap = _blend(f"clavicle_{s}", "spine_03", 0.6)
            # start/end ON the vest front-top + back-top corners (rx≈0.188*SH, ry≈0.099*SH at the top
            # ring) so the strap is a continuous bridge, NOT a floating segment with a detached front cap
            # (iter-5: that gap read as a stray orange shard near the neck).
            # LOWERED onto the shoulder slope + THINNER so the yoke reads as a flat strap hugging the
            # deltoid, not a raised angular wedge peaking above the shoulder (final-gate defect-D note).
            p_front = Vector((sgn * 0.088, yb - 0.100, s3.z - 0.026))
            p_back = Vector((sgn * 0.088, yb + 0.090, s3.z - 0.018))
            sb.segment(wstrap, p_front, p_back, 0.025, 0.023, segments=8, mat=hv, cap=False)
        # restrained reflective bands: two THIN white arc-strips wrapping the vest sides/back, sat just
        # proud of the shell (was the two rigid full-ring rails). Each band = a 2-ring arc-loft.
        if CORRECT_05G["vest"]:
            # 05G: bands FOLLOW the thinner shell — pulled in to match the new chest radius and sat only
            # ~0.2 cm proud (was ~0.4 cm on a fatter shell), and THINNER in z, so they read as reflective
            # tape ON the garment surface, not rails reinforcing a block.
            band_defs = ((s2.z + 0.048, 0.183 * CH, 0.111 * CH), (s2.z - 0.026, 0.181 * CH, 0.110 * CH))
            band_off, band_dz = 0.002, 0.009
        else:
            band_defs = ((s2.z + 0.050, 0.194 * CH, 0.118 * CH), (s2.z - 0.030, 0.190 * CH, 0.116 * CH))
            band_off, band_dz = 0.004, 0.012
        for bz, brx, bry in band_defs:
            band = [("spine_02", 0.0, yb - 0.008, bz + dz, brx + band_off, bry + band_off) for dz in (band_dz, -band_dz)]
            sb.arc_loft([(w, cx, cy, cz, rx, ry) for (w, cx, cy, cz, rx, ry) in band], a0, a1, segments=28, mat=white)
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
    sb.uvsphere("Head", 1.0, u=10, v=8, matrix=T(hx, hy - 0.052, hz - 0.064) @ Matrix.Diagonal((0.040 * v_chin, 0.044 * v_chin, 0.038, 1)), mat=skin)  # 05F: slightly firmer chin/jaw
    for sgn in (-1, 1):
        sb.uvsphere("Head", 1.0, u=8, v=6, matrix=T(hx + sgn * 0.051, hy - 0.058, hz + 0.005) @ Matrix.Diagonal((0.030, 0.036, 0.038, 1)), mat=skin)  # 05F: fuller cheekbone
    sb.uvsphere("Head", 1.0, u=12, v=6, matrix=T(hx, hy - 0.088, hz + 0.050) @ Matrix.Diagonal((0.088, 0.030, 0.020, 1)), mat=skin)  # 05F: stronger brow ridge
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
        # 05G ITER 1 — DELTOID CAP + sleeve join. Owner (05F REVISE): "pointed shoulder wedges / detached
        # deltoid fins / sleeve that does not join the torso." A single ROUNDED deltoid mass sits over the
        # torso-to-sleeve junction: it rounds off the pointed shoulder corner and welds the sleeve cap into
        # the body so the arm reads as flowing OUT of the shoulder (no fin, no gap). Weighted mostly to the
        # upper arm (swings with the limb) + clavicle + spine_03 (stays welded to the torso, no delamination).
        if CORRECT_05G["shoulder"]:
            # Deltoid cap: a FLATTENED dome (not a ball) — wider front-back than tall, so it reads as a firm
            # deltoid rather than a padded shoulder puck (reviewer note: 05F+cap was slightly too spherical/
            # full). Sat a touch lower + inboard so the silhouette does not broaden past 05F when the arm
            # raises. Weighted mostly to the upper arm (swings with the limb) + clavicle + spine (welded).
            dc = Vector((ua_h.x - sgn * 0.032, ua_h.y - 0.006, ua_h.z + 0.004))
            sb.uvsphere({f"upperarm_{s}": 0.52, f"clavicle_{s}": 0.30, "spine_03": 0.18}, 1.0, u=16, v=12,
                        matrix=T(dc.x, dc.y, dc.z) @ Matrix.Diagonal((0.082 * SH, 0.092 * SH, 0.072 * SH, 1)), mat=upper)
            # a small inboard fillet closes the neck-side notch between the deltoid cap and the trapezius so
            # the shoulder slope is one continuous curve from neck to arm (no re-entrant corner = no wedge).
            # Kept small + low so it fills the notch WITHOUT piling into a neck-side lump (reviewer note).
            fc = Vector((ua_h.x - sgn * 0.090, ua_h.y - 0.004, ua_h.z + 0.018))
            sb.uvsphere({f"clavicle_{s}": 0.42, "spine_03": 0.58}, 1.0, u=12, v=8,
                        matrix=T(fc.x, fc.y, fc.z) @ Matrix.Diagonal((0.056 * SH, 0.062 * SH, 0.048 * SH, 1)), mat=upper)
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
            (_blend("pelvis", f"thigh_{s}", 0.4), Vector((th_h.x - sgn * 0.006, th_h.y - 0.014, th_h.z + 0.075)), (0.100 * HI, 0.104 * HI)),  # tucked FORWARD + narrower so the rear seat fully covers the leg top (hides the rear seam)
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
        "studio_front_axis": "-Y", "studio_pipeline_ver": "character_hero_05g",
        **config.PROVENANCE, "milestone": "asset-lab-05g",
    })
    obj.name = "Char_ElectricHero05G"
    return obj
