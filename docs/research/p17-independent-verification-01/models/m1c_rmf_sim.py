# STATUS: HISTORICAL CALCULATOR (revision 02, 2026-09-12). Unmodified below this banner.
# The canonical calculator is ../redteam/R3-reviewer-corrections-calc.py (committed output ../redteam/R3-output.txt); the specification is the report §5 (index §5.7).
# Superseded here: candidate M1c's numbers; superseded by the canonical calculator.
#!/usr/bin/env python3
"""
Throwaway paper-model arithmetic for P17 RMF Model C — OVEREXPOSURE DEBT + HEAT LEDGER.
Read-only research artifact. Not production code. Lives only in scratchpad/p17/models/.
"""

import math

# ---------- constants (STARTING POINTS, all labelled in the report) ----------
R_RISE_RATE = 0.70          # alpha_up: how fast R jumps toward a target ABOVE current R
R_FALL_RATE = 0.12          # alpha_down: how fast R drifts toward a target BELOW current R
R_HALF_LIFE_WEEKS = 780.0   # 15 years, passive decay of R toward 0 every week regardless of releases

M_SCALE = 60.0              # ledger entry magnitude scale
MOMENTUM_HALF_LIFE = 26.0   # weeks, per-entry decay
LEDGER_CAP = 4

FATIGUE_SCALE = 40.0            # ΔF per release = FATIGUE_SCALE * (1-Q) * similarity
BASE_PAYDOWN = 0.6              # F recovered per week at baseline
QUALITY_BONUS_MAX_MULT = 2.5    # paydown multiplier when last release was Q=1.0 (interp from 1.0 at Q=0.5)
ACTIVE_PRODUCTION_DAMPING = 0.4 # paydown multiplier while a continuation is in active production

# band thresholds
REACTIVATION_WINDOW = 26.0
DORMANT_WEEKS = 156.0
ACTIVE_WEEKS = 104.0
REVIVAL_R_MIN = 25.0
FATIGUE_REST_MAX = 15.0
COOLING_M_MAX = 0.0

SIMILARITY = {
    "direct_sequel": 0.90,
    "prequel": 0.85,
    "remake": 0.60,
    "spin_off": 0.45,
    "reboot": 0.35,
}


def clamp(x, lo, hi):
    return max(lo, min(hi, x))


def quality(critic, audience, perf_ratio):
    """Q_i in [0,1], P17-owned pure read of public FilmResult facts. House style: weighted clamps."""
    c01 = clamp(critic / 100.0, 0, 1)
    a01 = clamp(audience / 100.0, 0, 1)
    perf01 = clamp((perf_ratio - 0.5) / 1.5, 0, 1)
    return clamp(0.35 * c01 + 0.25 * a01 + 0.40 * perf01, 0, 1)


def r_release_update(R, Q):
    target = 100.0 * Q
    if target > R:
        return R + R_RISE_RATE * (target - R)
    else:
        return R + R_FALL_RATE * (target - R)


def r_decay(R, weeks):
    if weeks <= 0:
        return R
    return R * (0.5 ** (weeks / R_HALF_LIFE_WEEKS))


def ledger_value_at(ledger, t):
    return sum(e["m0"] * (0.5 ** ((t - e["week"]) / e["halflife"])) for e in ledger)


def ledger_add(ledger, label, week, m0, halflife=MOMENTUM_HALF_LIFE):
    ledger.append({"label": label, "week": week, "m0": m0, "halflife": halflife})
    if len(ledger) > LEDGER_CAP:
        ledger.sort(key=lambda e: e["week"])
        ledger.pop(0)


def fatigue_accrue(F, Q, similarity):
    return F + FATIGUE_SCALE * (1 - Q) * similarity


def fatigue_paydown(F, weeks, Q_last, active_production):
    if weeks <= 0:
        return F
    quality_bonus = 1.0 + (QUALITY_BONUS_MAX_MULT - 1.0) * clamp((Q_last - 0.5) / 0.5, 0, 1)
    damping = ACTIVE_PRODUCTION_DAMPING if active_production else 1.0
    rate = BASE_PAYDOWN * quality_bonus * damping
    return max(0.0, F - rate * weeks)


def band(M, F, R, W, G):
    """W = weeks since last release. G = gap before the most-recently-released film (weeks
    between the two most recent releases); infinity if fewer than 2 releases exist."""
    if W < REACTIVATION_WINDOW and G != math.inf and G >= DORMANT_WEEKS and M >= COOLING_M_MAX:
        return "ACTIVE AGAIN"
    if W >= DORMANT_WEEKS:
        if R >= REVIVAL_R_MIN and F <= FATIGUE_REST_MAX:
            return "REVIVAL CANDIDATE"
        return "DORMANT"
    if W >= ACTIVE_WEEKS or M < COOLING_M_MAX:
        return "COOLING"
    return "ACTIVE"


def awareness_input(R, M, F, is_dormant_or_revival):
    recognition_term = R / 100.0
    momentum_term = clamp(M / M_SCALE, -1, 1)
    base_a = clamp(0.65 * recognition_term + 0.35 * momentum_term, 0, 1)
    fatigue_damp = clamp(1 - 0.5 * clamp(F / 100.0, 0, 1), 0.5, 1.0)
    nostalgia_mult = 1.0
    if is_dormant_or_revival:
        nostalgia_mult = 1.0 + 0.20 * clamp(R / 100.0, 0, 1)
    return clamp(base_a * fatigue_damp * nostalgia_mult, 0, 1)


def expectation_multiplier(R, M, F):
    return clamp(1 + 0.006 * R + 0.004 * M - 0.006 * min(F, 100.0), 0.6, 1.8)


def row(label, week, R, ledger, F, W, G, Q_last=None):
    M = ledger_value_at(ledger, week)
    b = band(M, F, R, W, G)
    a = awareness_input(R, M, F, b in ("DORMANT", "REVIVAL CANDIDATE"))
    e = expectation_multiplier(R, M, F)
    print(f"{label:<34} wk{week:>5.0f}  R={R:6.2f}  M={M:7.2f}  F={F:6.2f}  W={W:6.1f}  G={G if G==math.inf else round(G,1):>7}  "
          f"band={b:<16} a={a:5.3f}  E={e:5.3f}")
    return M, b, a, e


print("=" * 130)
print("CASE A — breakout original, fast direct sequel")
print("=" * 130)
R = 0.0
ledger = []
F = 0.0
Q1 = quality(85, 80, 2.2)
print(f"Q(Film1) = {Q1:.3f}")
R = r_release_update(R, Q1)
ledger_add(ledger, "Film 1 (smash)", 0, M_SCALE * (Q1 - 0.5) * 2)
F = fatigue_accrue(F, Q1, SIMILARITY["direct_sequel"])
row("post-Film1 release", 0, R, ledger, F, 0.0, math.inf, Q1)
# week 4: greenlight decision point for Film 2 (development begins). No release yet -> only decay.
R4 = r_decay(R, 4)
F4 = fatigue_paydown(F, 4, Q1, active_production=False)  # not yet greenlit at week0-4 boundary; negligible either way
row("wk4: GREENLIGHT decision (Film2)", 4, R4, ledger, F4, 4.0, math.inf, Q1)
# project to week 60 (release of Film 2) under active-production damping, no Film2 outcome known yet
R60 = r_decay(R4, 56)
F60 = fatigue_paydown(F4, 56, Q1, active_production=True)
row("wk60: Film2 RELEASES (pre-outcome)", 60, R60, ledger, F60, 60.0, math.inf, Q1)

print()
print("=" * 130)
print("CASE B — two straight hits, then a fast spin-off (must not be punished for speed)")
print("=" * 130)
R = 0.0
ledger = []
F = 0.0
Q1 = quality(88, 82, 2.0)   # ASSUMPTION: representative "smash" numbers (case gives no exact figures)
print(f"Q(Film1 smash, assumed 88/82/2.0x) = {Q1:.3f}")
R = r_release_update(R, Q1)
ledger_add(ledger, "Film 1 (smash)", 0, M_SCALE * (Q1 - 0.5) * 2)
F = fatigue_accrue(F, Q1, SIMILARITY["direct_sequel"])
row("post-Film1", 0, R, ledger, F, 0.0, math.inf, Q1)

# gap to Film2 release at week 52, active production (damping) the whole gap
Rg = r_decay(R, 52)
Fg = fatigue_paydown(F, 52, Q1, active_production=True)
Q2 = quality(88, 82, 2.0)  # ASSUMPTION: Film2 also a smash
Rg = r_release_update(Rg, Q2)
ledger_add(ledger, "Film 2 (smash)", 52, M_SCALE * (Q2 - 0.5) * 2)
Fg = fatigue_accrue(Fg, Q2, SIMILARITY["direct_sequel"])
row("post-Film2 (52wk later)", 52, Rg, ledger, Fg, 0.0, 52.0, Q2)

# gap to spin-off release at week 92 (40wk after Film2), active production damping
Rs = r_decay(Rg, 40)
Fs = fatigue_paydown(Fg, 40, Q2, active_production=True)
M_parent_at_92 = ledger_value_at(ledger, 92)
print(f"  parent-franchise M just before spin-off release (wk92) = {M_parent_at_92:.2f}")
row("wk92: parent state at spin-off release", 92, Rs, ledger, Fs, 40.0, 40.0, Q2)
# spin-off SubProperty: own fresh R/M/F, but inherits a similarity-scaled seed of parent M as its own opening ledger entry
spin_similarity = SIMILARITY["spin_off"]
inherited_seed = spin_similarity * M_parent_at_92
spin_ledger = []
ledger_add(spin_ledger, "inherited parent momentum", 92, inherited_seed, halflife=13.0)
spin_R0 = 0.0  # SubProperty starts with no Recognition of its own; inherited AWARENESS is a separate P07 input, not R
print(f"  SPIN-OFF SubProperty seed: inherited_m0 = similarity({spin_similarity}) * parentM({M_parent_at_92:.2f}) = {inherited_seed:.2f} (half-life 13wk)")
row("SPIN-OFF SubProperty @wk92 (own state)", 92, spin_R0, spin_ledger, 0.0, 0.0, math.inf)

print()
print("=" * 130)
print("CASE C — hit then flop (recognition survives, momentum falls, franchise salvageable)")
print("=" * 130)
R = 0.0
ledger = []
F = 0.0
Q1 = quality(90, 88, 2.5)  # ASSUMPTION: audience 88 (unspecified in case, iconic-consistent)
print(f"Q(Film1 iconic) = {Q1:.3f}")
R = r_release_update(R, Q1)
ledger_add(ledger, "Film 1 (iconic)", 0, M_SCALE * (Q1 - 0.5) * 2)
F = fatigue_accrue(F, Q1, SIMILARITY["direct_sequel"])
row("post-Film1 (iconic)", 0, R, ledger, F, 0.0, math.inf, Q1)

Rg = r_decay(R, 78)
Fg = fatigue_paydown(F, 78, Q1, active_production=True)
Q2 = quality(45, 40, 0.6)  # ASSUMPTION: audience 40 (unspecified, weak-consistent)
print(f"Q(Film2 weak) = {Q2:.3f}")
Rg = r_release_update(Rg, Q2)
ledger_add(ledger, "Film 2 (weak)", 78, M_SCALE * (Q2 - 0.5) * 2)
Fg = fatigue_accrue(Fg, Q2, SIMILARITY["direct_sequel"])
row("post-Film2 (weak, wk78)", 78, Rg, ledger, Fg, 0.0, 78.0, Q2)
# project forward 52 weeks of rest (no third film yet) to show salvageability
Rrest = r_decay(Rg, 52)
Frest = fatigue_paydown(Fg, 52, Q2, active_production=False)
row("wk130: +52wk rest, no Film3 yet", 130, Rrest, ledger, Frest, 52.0, 78.0, Q2)

print()
print("=" * 130)
print("CASE D — rapid mediocrity x4 @ 40-week cadence (fatigue must matter, visibly)")
print("=" * 130)
R = 0.0
ledger = []
F = 0.0
Q_last = 0.5
week = 0.0
for i in range(1, 5):
    if i == 1:
        Rg, Fg = R, F
    else:
        Rg = r_decay(R, 40)
        Fg = fatigue_paydown(F, 40, Q_last, active_production=True)
    Qi = quality(57, 52, 0.9)  # mid of critic 55-60, ASSUMPTION audience ~52, ratio 0.9
    Rg = r_release_update(Rg, Qi)
    ledger_add(ledger, f"Film {i} (mediocre)", week, M_SCALE * (Qi - 0.5) * 2)
    Fg = fatigue_accrue(Fg, Qi, SIMILARITY["direct_sequel"])
    row(f"post-Film{i} (mediocre, Q={Qi:.3f})", week, Rg, ledger, Fg, 0.0, 40.0 if i > 1 else math.inf, Qi)
    R, F, Q_last = Rg, Fg, Qi
    week += 40.0

print()
print("=" * 130)
print("CASE E — 20-year dormancy (1040 weeks) of a major (R-high) property")
print("=" * 130)
R0 = 90.0  # ASSUMPTION: "major property, R high" starting point at last release before dormancy
F0 = 30.0  # ASSUMPTION: some residual fatigue debt at the moment dormancy begins
ledger0 = []
ledger_add(ledger0, "last film before dormancy", 0, 10.0)  # small residual momentum embers
Re = r_decay(R0, 1040)
Fe = fatigue_paydown(F0, 1040, 0.5, active_production=False)  # full-speed paydown (no production happening)
row("start of dormancy (wk0)", 0, R0, ledger0, F0, 0.0, math.inf)
row("wk1040 (20yr later, still dormant)", 1040, Re, ledger0, Fe, 1040.0, math.inf)
print(f"  R half-life ({R_HALF_LIFE_WEEKS}wk) => decay factor over 1040wk = {0.5**(1040/R_HALF_LIFE_WEEKS):.3f}")

print()
print("=" * 130)
print("CASE F — successful reboot after 20yr dormancy")
print("=" * 130)
Qf = quality(85, 78, 1.6)  # ASSUMPTION: audience 78
print(f"Q(reboot, excellent) = {Qf:.3f}")
Rf = r_release_update(Re, Qf)
ledgerF = list(ledger0)
ledger_add(ledgerF, "Reboot (excellent)", 1040, M_SCALE * (Qf - 0.5) * 2)
Ff = fatigue_accrue(Fe, Qf, SIMILARITY["reboot"])
row("post-reboot (excellent), wk1040", 1040, Rf, ledgerF, Ff, 0.0, 1040.0, Qf)
row("wk1046: 6wk after (ACTIVE AGAIN window)", 1046, r_decay(Rf, 6), ledgerF, fatigue_paydown(Ff, 6, Qf, True), 6.0, 1040.0, Qf)

print()
print("=" * 130)
print("CASE G — failed reboot after 20yr dormancy (same starting point as Case F)")
print("=" * 130)
Qg = quality(40, 38, 0.5)  # ASSUMPTION: audience 38
print(f"Q(reboot, poor) = {Qg:.3f}")
Rg2 = r_release_update(Re, Qg)
ledgerG = list(ledger0)
ledger_add(ledgerG, "Reboot (poor)", 1040, M_SCALE * (Qg - 0.5) * 2)
Fg2 = fatigue_accrue(Fe, Qg, SIMILARITY["reboot"])
row("post-reboot (poor), wk1040", 1040, Rg2, ledgerG, Fg2, 0.0, 1040.0, Qg)
row("wk1046: 6wk after (ACTIVE AGAIN window)", 1046, r_decay(Rg2, 6), ledgerG, fatigue_paydown(Fg2, 6, Qg, True), 6.0, 1040.0, Qg)

print()
print("=" * 130)
print("SELF-CRITIQUE MINI-CASE — fast-sequel-spam stress test (8 mediocre releases @ 15wk cadence)")
print("=" * 130)
R = 0.0
ledger = []
F = 0.0
Q_last = 0.5
week = 0.0
for i in range(1, 9):
    if i > 1:
        R = r_decay(R, 15)
        F = fatigue_paydown(F, 15, Q_last, active_production=True)
    Qi = quality(55, 50, 0.85)
    R = r_release_update(R, Qi)
    ledger_add(ledger, f"spam {i}", week, M_SCALE * (Qi - 0.5) * 2)
    F = fatigue_accrue(F, Qi, SIMILARITY["direct_sequel"])
    row(f"spam release {i}", week, R, ledger, F, 0.0, 15.0 if i > 1 else math.inf, Qi)
    Q_last = Qi
    week += 15.0

print()
print("=" * 130)
print("SELF-CRITIQUE MINI-CASE — reboot-as-cheap-fatigue-cure check (same bad Q, different similarity)")
print("=" * 130)
Qbad = quality(45, 40, 0.6)
for label, sim in [("direct_sequel flop", SIMILARITY["direct_sequel"]), ("reboot flop (same Q)", SIMILARITY["reboot"])]:
    dF = FATIGUE_SCALE * (1 - Qbad) * sim
    print(f"  {label:<24} similarity={sim:.2f}  ΔF = {FATIGUE_SCALE}*(1-{Qbad:.3f})*{sim:.2f} = {dF:.2f}")
