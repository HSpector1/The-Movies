# STATUS: HISTORICAL CALCULATOR (revision 02, 2026-09-12). Unmodified below this banner.
# The canonical calculator is ../redteam/R3-reviewer-corrections-calc.py (committed output ../redteam/R3-output.txt); the specification is the report §5 (index §5.7).
# Superseded here: M4's arithmetic; the Fatigue-inheritance constant is `SPINOFF_F_INHERIT` in the canonical calculator.
# Throwaway paper-model arithmetic for M4 (SubProperty + Crossover). Read-only scratchpad use only.

CAST_WEIGHT = {'lead': 1.0, 'antagonist': 0.6, 'support': 0.35}
BASE_MIN, BASE_MAX = 0.38, 0.65  # observed spin-off opening-inheritance band (RO 62%, Solo 38%, H&S 61%)

def hook_weight(slot=None, default=0.5):
    if slot is None:
        return default
    return CAST_WEIGHT[slot]

def transfer_fraction(hw):
    # hw in [0.35,1.0] roughly (CAST_WEIGHT range); org/location default 0.5
    return BASE_MIN + (BASE_MAX - BASE_MIN) * hw

print("=== Q3/Q4: hook weight -> transfer fraction ===")
for label, hw in [('lead-tied', hook_weight('lead')), ('antagonist-tied', hook_weight('antagonist')),
                   ('support-tied', hook_weight('support')), ('org/location/concept default', hook_weight())]:
    print(f"{label:32s} hw={hw:.2f}  frac={transfer_fraction(hw):.3f}")

print()
print("=== Worked SubProperty mint example ===")
R_parent = 72.0   # illustrative 0-100 scale
F_parent = 40.0
FATIGUE_INHERIT = 0.5
for label, hw in [('lead-tied', 1.0), ('support-tied', 0.35)]:
    frac = transfer_fraction(hw)
    R_sp0 = frac * R_parent
    F_sp0 = FATIGUE_INHERIT * F_parent
    print(f"{label:12s} frac={frac:.3f}  R_sp0={R_sp0:.1f} (of R_parent={R_parent})  F_sp0={F_sp0:.1f} (of F_parent={F_parent})  M_sp0=0.0")

print()
print("=== Crossover combinedR: rank-decayed sum, CROSSOVER_DECAY=0.6, capped at 100 ===")
DECAY = 0.6
CAP = 100.0

def combined_r(rs):
    rs_sorted = sorted(rs, reverse=True)
    total = 0.0
    for i, r in enumerate(rs_sorted):
        total += r * (DECAY ** i)
    return min(total, CAP), rs_sorted

for rs in [(80.0, 80.0), (70.0, 55.0), (80.0, 55.0, 55.0), (90.0, 90.0, 90.0)]:
    cr, sorted_rs = combined_r(rs)
    solo_ref = sorted_rs[0]
    ratio = cr / solo_ref
    print(f"participants={sorted_rs}  combinedR={cr:.1f}  ratio-to-top-solo={ratio:.2f}x")

print()
print("=== Crossover share normalization (billing-decay weights -> shares summing to 1) ===")
def shares_for(n):
    w = [DECAY ** i for i in range(n)]
    s = sum(w)
    return [round(x / s, 3) for x in w]

for n in [2, 3, 4]:
    print(f"n={n} participants -> shares={shares_for(n)}")

print()
print("=== Mid-range worked cases (typical, non-saturated) + one near-ceiling case (intentional cap bite) ===")
for rs in [(50.0, 50.0), (60.0, 45.0), (55.0, 55.0, 40.0), (85.0, 85.0)]:
    cr, sorted_rs = combined_r(rs)
    solo_ref = sorted_rs[0]
    ratio = cr / solo_ref
    tag = " <- CAP BITES (anti-snowball, intentional)" if cr >= CAP - 0.001 else ""
    print(f"participants={sorted_rs}  combinedR={cr:.1f}  ratio-to-top-solo={ratio:.2f}x{tag}")
