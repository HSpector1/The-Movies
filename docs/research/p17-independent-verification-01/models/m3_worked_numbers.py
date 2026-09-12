import math

# ---- constants (STARTING POINTS, all labeled as such in the report) ----
IMPULSE_M = 60.0
HALF_LIFE_M = 26.0
LAMBDA_M = math.log(2) / HALF_LIFE_M

IMPULSE_R = 25.0
PENALTY_R = 4.0
FLOOR_FRAC = 0.55
HALF_LIFE_R = 520.0
LAMBDA_R = math.log(2) / HALF_LIFE_R

IMPULSE_F = 50.0
RELIEF_K = 0.4
RELIEF_THRESHOLD = 0.15
HALF_LIFE_F = 78.0
LAMBDA_F = math.log(2) / HALF_LIFE_F

def quality_raw(critic, audience, box_total, expected_total):
    perf = max(0.0, min(box_total/expected_total, 2.0)) / 2.0
    return 0.4*(critic/100) + 0.3*(audience/100) + 0.3*perf

def excitement(critic, audience, box_total, expected_total):
    return quality_raw(critic, audience, box_total, expected_total) - 0.5

def decay_M(M, weeks):
    return M * math.exp(-LAMBDA_M*weeks)

def decay_F(F, weeks):
    return F * math.exp(-LAMBDA_F*weeks)

def decay_R(Rcur, Rpeak, weeks):
    floor = FLOOR_FRAC*Rpeak
    return floor + (Rcur-floor)*math.exp(-LAMBDA_R*weeks)

def release_update(M, F, Rcur, Rpeak, sim, exc):
    # Momentum
    M2 = IMPULSE_M*exc  # branch M is reset by the new release's impulse added on top of decayed prior M (already decayed by caller before calling)
    M_new = M + M2
    # Fatigue
    fat_gain = IMPULSE_F * sim * max(0.0, -exc)
    relief = RELIEF_K * max(0.0, exc-RELIEF_THRESHOLD) * F
    F_new = max(0.0, F + fat_gain - relief)
    # Recognition
    Rcur_new = Rcur + IMPULSE_R*max(0.0,exc) - PENALTY_R*max(0.0,-exc)
    Rpeak_new = max(Rpeak, Rcur_new)
    Rcur_new = max(FLOOR_FRAC*Rpeak_new, min(100.0, Rcur_new))
    return M_new, F_new, Rcur_new, Rpeak_new

print("=== Q: Film1 smash + Film2 dud (same branch, sequel, similarity=1.0) ===")
M, F, Rcur, Rpeak = 0.0, 0.0, 20.0, 20.0  # baseline start: a modest new property, R=20
print(f"start: M={M:.1f} F={F:.1f} R={Rcur:.1f} Rpeak={Rpeak:.1f}")

# Film 1: smash
exc1 = excitement(90, 88, 500e6, 300e6)
M, F, Rcur, Rpeak = release_update(M, F, Rcur, Rpeak, 1.0, exc1)
print(f"Film1 SMASH  excitement={exc1:+.3f} -> M={M:.1f} F={F:.1f} R={Rcur:.1f} Rpeak={Rpeak:.1f}")

# 30 weeks pass before Film2
weeks_between = 30
M = decay_M(M, weeks_between)
F = decay_F(F, weeks_between)
Rcur = decay_R(Rcur, Rpeak, weeks_between)
print(f"+{weeks_between}wk decay -> M={M:.1f} F={F:.1f} R={Rcur:.1f}")

# Film 2: dud
exc2 = excitement(35, 38, 90e6, 280e6)
M, F, Rcur, Rpeak = release_update(M, F, Rcur, Rpeak, 1.0, exc2)
print(f"Film2 DUD    excitement={exc2:+.3f} -> M={M:.1f} F={F:.1f} R={Rcur:.1f} Rpeak={Rpeak:.1f}")

print()
print("=== F half-life clearing check across real dormancy gaps ===")
for name, weeks, startF in [("Batman 1997->2005 (96mo)", 417, 90.0), ("Bond 1989->1995 (76mo)", 330, 70.0), ("Star Wars 1983->1999 (192mo)", 835, 40.0)]:
    endF = decay_F(startF, weeks)
    half_lives = weeks/HALF_LIFE_F
    print(f"{name}: {weeks}wk = {half_lives:.1f} F-half-lives, F {startF:.0f}->{endF:.2f}")

print()
print("=== M half-life spend-down check ===")
for wk in [26, 52, 104, 156]:
    print(f"M after {wk} weeks from M0=40: {decay_M(40, wk):.2f}")

print()
print("=== Reboot partial comparison term (TASM 2012 vs Casino Royale 2006 shape) ===")
def remake_comparison_penalty(ref_quality_0_100, age_weeks, recency_window_weeks=780, base_k=18.0):
    recency_factor = max(0.0, 1 - age_weeks/recency_window_weeks)
    return base_k * (ref_quality_0_100/100.0) * recency_factor

# TASM 2012: reboot retelling Spider-Man 2002's origin, prior branch's LAST film (Spider-Man 3, 2007) age at TASM release (2012-07) ~ 5yr = 260wk, quality ~ (62 RT-ish, but use its audience/critic composite; Raimi SM3 RT62/audience decent) call ref_quality=60
tasm_penalty_full = remake_comparison_penalty(60, 260)
W_PARTIAL = 0.4
tasm_partial = W_PARTIAL*tasm_penalty_full
print(f"TASM 2012: full remake-style penalty if it were a remake = {tasm_penalty_full:.2f}; reboot PARTIAL term (W=0.4) = {tasm_partial:.2f}")

# Casino Royale 2006: reboot, prior branch's last film Die Another Day (2002) age at CR release (2006-11) = 4yr = 209wk, but DAD was NOT well-regarded (director-cut quality ~ mixed/weaker, call ref_quality=40, below STRONG_THRESHOLD=65) -> condition fails -> term = 0
STRONG_THRESHOLD = 65
RECENT_WINDOW_WEEKS = 416  # 8 years
dad_age = 209
dad_quality = 40
condition = (dad_age < RECENT_WINDOW_WEEKS) and (dad_quality >= STRONG_THRESHOLD)
print(f"Casino Royale 2006: prior film age={dad_age}wk quality={dad_quality} -> condition(recent AND strong)={condition} -> comparison term = 0 (quality gate fails, not age)")

print()
print("=== Byte estimate sanity ===")
def est(name, n, per):
    print(f"{name}: n={n} x {per}B = {n*per}B")
est("branches (typical 2)", 2, 58)
est("branches (worst-case cap 8)", 8, 58)
est("installments (typical 10)", 10, 41)
est("installments (long-running 40)", 40, 41)
est("subPropertyIds (typical 2)", 2, 12)
est("keyAssociations (typical 6)", 6, 25)
est("milestones (typical 5)", 5, 18)
scalars = 16+16+4+4  # franchiseId, storyPropertyId ids + recognition + recognitionPeak
print(f"scalars: {scalars}B")
typical_total = scalars + 2*58 + 10*41 + 2*12 + 6*25 + 5*18
longrun_total = scalars + 6*58 + 40*41 + 4*12 + 10*25 + 12*18
print(f"TYPICAL franchise total ~ {typical_total}B")
print(f"LONG-RUNNING (Bond-scale) franchise total ~ {longrun_total}B")
