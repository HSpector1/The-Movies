# P17 M5 paper-history calculator (throwaway, scratchpad-only). No repo access.
# Reuses EXACT public formulas cited in evidence/02 where noted; everything else is a
# new P17-owned aggregation clearly marked DESIGN INFERENCE / STARTING POINT.

def reach01(total):
    # EXACT reuse of starPower.ts reach01 (evidence 02 §c.5): total/(total+10,000,000)
    return total / (total + 10_000_000)

ROLE_IMPORTANCE_WEIGHT = {  # P17-owned starting point (mirrors STAR_POWER_ROLE_WEIGHTS shape, tuning.ts:571-578)
    'lead': 1.0, 'antagonist': 0.7, 'director': 0.9, 'support': 0.45, 'writer': 0.35,
}
ASSOCIATION_WEIGHT_CAP = 4.0
MIN_APPEARANCES_FOR_MAJOR = 2

def association_weight(appearances):
    # appearances: list of (role, boxOfficeTotal)
    raw = sum(ROLE_IMPORTANCE_WEIGHT[role] * reach01(total) for role, total in appearances)
    return min(raw, ASSOCIATION_WEIGHT_CAP), raw

def classify(appearances):
    n = len(appearances)
    capped, raw = association_weight(appearances)
    if n < MIN_APPEARANCES_FOR_MAJOR:
        return 'MINOR APPEARANCE', capped, raw
    roles = [a[0] for a in appearances]
    dominant = max(set(roles), key=roles.count)
    if dominant == 'director':
        return ('SIGNATURE DIRECTOR' if capped >= 1.3 else 'MINOR APPEARANCE'), capped, raw
    if dominant == 'lead':
        return ('ICONIC LEAD' if capped >= 1.6 else 'CORE ENSEMBLE'), capped, raw
    if dominant == 'antagonist':
        return ('CORE ENSEMBLE' if capped >= 0.8 else 'RECURRING SUPPORT'), capped, raw
    if dominant in ('support', 'writer'):
        return ('RECURRING SUPPORT' if capped >= 0.3 else 'MINOR APPEARANCE'), capped, raw
    return 'MINOR APPEARANCE', capped, raw

print("=== Worked branch: 4 installments, hypothetical box office totals ===")
films = [
    ("Film 1", 90_000_000),
    ("Film 2", 210_000_000),
    ("Film 3", 260_000_000),
    ("Film 4", 140_000_000),
]
for name, total in films:
    print(f"  {name}: total=${total:,}  reach01={reach01(total):.3f}")

print()
print("=== Talent association classification across the branch ===")
cast = {
    "Talent A (lead, all 4)": [('lead', t) for _, t in films],
    "Talent B (antagonist, films 2-3 only)": [('antagonist', films[1][1]), ('antagonist', films[2][1])],
    "Talent C (support, films 1 & 4)": [('support', films[0][1]), ('support', films[3][1])],
    "Talent D (director, films 1-2)": [('director', films[0][1]), ('director', films[1][1])],
    "Talent E (support, film 3 only, one-off breakout)": [('support', films[2][1])],
    "Talent F (lead, film 3 only, guest cameo billed lead)": [('lead', films[2][1])],
}
for name, appearances in cast.items():
    band, capped, raw = classify(appearances)
    print(f"  {name}: n={len(appearances)} raw={raw:.3f} capped={capped:.3f} -> {band}")

print()
print("=== ContinuityCredit worked example: Film 5 (recast lead, support returns) ===")
RECAST_RETENTION = 0.35
# Talent A (ICONIC LEAD, capped weight from above) is recast; Talent C (RECURRING SUPPORT) returns.
wA = classify(cast["Talent A (lead, all 4)"])[1]
wC = classify(cast["Talent C (support, films 1 & 4)"])[1]
numer = wA * RECAST_RETENTION + wC * 1.0
denom = wA + wC
credit = numer / denom
print(f"  weight(iconic lead)={wA:.3f} (RECAST, multiplier {RECAST_RETENTION})")
print(f"  weight(recurring support)={wC:.3f} (RETURNS, multiplier 1.0)")
print(f"  ContinuityCredit = {numer:.3f} / {denom:.3f} = {credit:.3f}")

for lo, hi, label in [(0.75, 0.25, "gentle swing (recommended)"), (0.5, 0.5, "aggressive swing (rejected, too strong given JW/Ghostbusters evidence)")]:
    mult = lo + hi * credit
    print(f"  InheritedAwarenessInput multiplier [{label}]: {lo}+{hi}*credit = {mult:.3f}")

print()
print("=== Early greenlight worked example (Direction G) ===")
# Franchise state at Film2 greenlight (Film1 still in production, not yet released)
R, M = 65, 10  # Recognition, Momentum (illustrative units 0-100 / -100..+100)
F = 15
print(f"  At Film2 greenlight: R={R} M={M} F={F} (from Film0's decayed momentum; Film1 unreleased)")
base_expected_total = 250_000_000  # what Film2's own package/quality would forecast on its own merits
inherited_bonus_at_greenlight = 1.0 + 0.004 * M - 0.002 * F  # illustrative, P17-owned starting shape
locked_forecast = base_expected_total * inherited_bonus_at_greenlight
print(f"  Film2 locked forecast.expectedTotal = {base_expected_total:,} * {inherited_bonus_at_greenlight:.3f} = {locked_forecast:,.0f}")
print("  -> FROZEN on Production.forecastSnapshot / FilmResult.forecast at Film2's OWN greenlight (Sec d.3).")

# Film1 releases and bombs
M_after_bomb, F_after_bomb = -35, 55
print(f"  Film1 RELEASES and bombs -> franchise M: {M} -> {M_after_bomb}, F: {F} -> {F_after_bomb} (R barely moves)")
print("  Film2's LOCKED forecast is UNCHANGED (still", f"{locked_forecast:,.0f})")

# Recommended: inherited awareness for Film2's REALIZED reception is read LIVE at Film2's release
inherited_bonus_at_release = 1.0 + 0.004 * M_after_bomb - 0.002 * F_after_bomb
realized_total_using_live_read = base_expected_total * inherited_bonus_at_release
print(f"  If read at RELEASE (recommended): live multiplier = {inherited_bonus_at_release:.3f}")
print(f"  Film2 realized boxOffice trends toward {realized_total_using_live_read:,.0f} (BEFORE the film's own craft/appeal path)")
delta_vs_forecast = (realized_total_using_live_read / locked_forecast) - 1
print(f"  boxDelta vs locked forecast ~ {delta_vs_forecast:+.1%} -> newspaper reports a big MISS, fully explained by the AT RISK descriptor shown pre-release")
