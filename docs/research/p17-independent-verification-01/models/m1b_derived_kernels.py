#!/usr/bin/env python3
"""
P17 Model B: DERIVED-FROM-INSTALLMENTS RMF kernels.
Throwaway paper-history calculator. Read-only; touches nothing but this folder.
"""

import math

# ---------- tunable constants (STARTING POINTS, all flagged in the report) ----------
HL_R = 650.0     # Recognition peak-anchor half-life, weeks (~12.5 years)
HL_M = 24.0      # Momentum half-life, weeks (~5.5 months)
HL_F = 104.0     # Fatigue half-life per contributing installment, weeks (~2 years)
KAPPA_R = 0.15   # weight applied to every non-peak installment's Recognition contribution
ASSUMED_EXPECTED_TOTAL = 150_000_000.0  # baseline forecast used to turn the cases' "Nx forecast" ratios into dollars
REACH_SAT = 10_000_000.0  # same saturation constant as computeStarPowerDelta's reach01 (starPower.ts / tuning.ts 552-568)

DORMANT_WEEKS = 150.0     # ~3 years: branch treated as dormant if nothing has released in this long
REVIVAL_R_BAR = 25.0      # Recognition floor for DORMANT -> REVIVAL CANDIDATE
FATIGUE_HOT = 60.0        # Fatigue level that forces COOLING even if Momentum is not negative
MOMENTUM_COOL = -5.0      # Momentum below this forces COOLING


def decay(age_weeks, half_life):
    if age_weeks < 0:
        return 0.0
    return 2.0 ** (-age_weeks / half_life)


def quality(critic, audience):
    return 0.5 * (critic / 100.0) + 0.5 * (audience / 100.0)


def reach01(total):
    return total / (total + REACH_SAT)


class Installment:
    def __init__(self, name, release_week, critic, audience, comparator, itype, similarity, branch):
        self.name = name
        self.release_week = release_week
        self.critic = critic
        self.audience = audience
        self.comparator = comparator          # boxOffice.total / forecast.expectedTotal
        self.type = itype                     # 'original'|'direct_sequel'|'prequel'|'spin_off'|'remake'|'reboot'
        self.similarity = similarity          # None for 'original'
        self.branch = branch
        self.total = comparator * ASSUMED_EXPECTED_TOTAL

    def quality(self):
        return quality(self.critic, self.audience)

    def reach(self):
        return reach01(self.total)

    def surprise(self):
        q = self.quality()
        return max(-1.0, min(1.0, 0.5 * (self.comparator - 1.0) + (q - 0.5)))


def recognition(installments, now_week, property_filter=None):
    """Peak-anchored slow kernel + small accumulation term. Property-wide by default
    (spans every branch of the StoryProperty); pass property_filter to scope to one
    branch/SubProperty using the SAME function."""
    rows = [i for i in installments if i.release_week <= now_week and (property_filter is None or property_filter(i))]
    if not rows:
        return 0.0, []
    scored = []
    for i in rows:
        age = now_week - i.release_week
        peak_score = i.reach() * i.quality() * decay(age, HL_R)
        scored.append((i, peak_score))
    scored.sort(key=lambda t: -t[1])
    total = 0.0
    contributions = []
    for rank, (i, score) in enumerate(scored):
        w = 1.0 if rank == 0 else KAPPA_R
        contrib = 100.0 * w * score
        total += contrib
        contributions.append((i.name, contrib))
    return max(0.0, min(100.0, total)), contributions


def momentum(installments, now_week, branch):
    rows = [i for i in installments if i.branch == branch and i.release_week <= now_week]
    total = 0.0
    contributions = []
    for i in rows:
        age = now_week - i.release_week
        c = 100.0 * i.surprise() * decay(age, HL_M)
        total += c
        contributions.append((i.name, round(c, 2)))
    return max(-100.0, min(100.0, total)), contributions


def fatigue(installments, now_week, branch):
    # the founding film of a branch (its earliest release, whatever its type label)
    # has nothing prior WITHIN THIS BRANCH to be "similar" to, so it never contributes.
    branch_rows = sorted([i for i in installments if i.branch == branch and i.release_week <= now_week],
                          key=lambda i: i.release_week)
    rows = branch_rows[1:]
    total = 0.0
    contributions = []
    for i in rows:
        age = now_week - i.release_week
        c = 100.0 * i.similarity * (1.0 - i.quality()) * decay(age, HL_F)
        total += c
        contributions.append((i.name, round(c, 2)))
    return max(0.0, min(100.0, total)), contributions


def weeks_since_last(installments, now_week, branch):
    rows = [i for i in installments if i.branch == branch and i.release_week <= now_week]
    if not rows:
        return None
    return now_week - max(i.release_week for i in rows)


def gap_before_last(installments, now_week, branch):
    rows = sorted([i for i in installments if i.branch == branch and i.release_week <= now_week], key=lambda i: i.release_week)
    if len(rows) < 2:
        return None
    return rows[-1].release_week - rows[-2].release_week


def descriptor(installments, now_week, branch):
    rows = [i for i in installments if i.branch == branch and i.release_week <= now_week]
    if not rows:
        return "NEW"
    r, _ = recognition(installments, now_week)
    m, _ = momentum(installments, now_week, branch)
    f, _ = fatigue(installments, now_week, branch)
    wsl = weeks_since_last(installments, now_week, branch)
    gap = gap_before_last(installments, now_week, branch)
    if wsl > DORMANT_WEEKS:
        return "REVIVAL CANDIDATE" if r >= REVIVAL_R_BAR else "DORMANT"
    if gap is not None and gap > DORMANT_WEEKS and wsl <= 26 and m >= 0:
        return "ACTIVE AGAIN"
    if m < MOMENTUM_COOL or f >= FATIGUE_HOT:
        return "COOLING"
    return "ACTIVE"


def awareness_input(installments, now_week, branch):
    r, _ = recognition(installments, now_week)
    m, _ = momentum(installments, now_week, branch)
    return max(0.0, min(1.0, 0.8 * (r / 100.0) + 0.2 * (max(m, 0.0) / 100.0)))


def expectation_multiplier(installments, now_week, branch):
    r, _ = recognition(installments, now_week)
    m, _ = momentum(installments, now_week, branch)
    f, _ = fatigue(installments, now_week, branch)
    raw = 1.0 + 0.006 * r + 0.004 * max(m, 0.0) - 0.005 * f
    return max(0.7, min(2.0, raw)), r, m, f


def report(name, installments, weeks, branch):
    print(f"\n=== {name} (branch={branch}) ===")
    print(f"{'week':>6} {'R':>7} {'M':>7} {'F':>7} {'band':<18} {'expMult':>8} {'awareIn':>8}")
    for w in weeks:
        r, rc = recognition(installments, w)
        m, mc = momentum(installments, w, branch)
        f, fc = fatigue(installments, w, branch)
        band = descriptor(installments, w, branch)
        mult, _, _, _ = expectation_multiplier(installments, w, branch)
        aw = awareness_input(installments, w, branch)
        print(f"{w:>6} {r:7.1f} {m:7.1f} {f:7.1f} {band:<18} {mult:8.3f} {aw:8.3f}")
        if mc:
            print(f"       M contributions: {mc}")
        if fc:
            print(f"       F contributions: {fc}")


# ---------------- CASE A ----------------
A = [
    Installment("Film1", 0, 85, 80, 2.2, 'original', None, 'main'),
]
report("CASE A: breakout original, fast follow-up", A, [0, 4, 60], 'main')

# ---------------- CASE B ----------------
B = [
    Installment("Film1", 0, 82, 80, 1.9, 'original', None, 'main'),
    Installment("Film2", 52, 80, 78, 1.7, 'direct_sequel', 0.9, 'main'),
    Installment("SpinOff", 92, 75, 74, 1.4, 'spin_off', 0.5, 'spin1'),
]
report("CASE B: two straight hits then spin-off (main branch)", B, [0, 52, 92, 93], 'main')
report("CASE B: spin-off branch", B, [92, 93], 'spin1')

# ---------------- CASE C ----------------
C = [
    Installment("Film1", 0, 90, 88, 2.5, 'original', None, 'main'),
    Installment("Film2", 78, 45, 40, 0.6, 'direct_sequel', 0.9, 'main'),
]
report("CASE C: iconic hit then flop", C, [0, 78, 79], 'main')

# ---------------- CASE D ----------------
D = [
    Installment("Film1", 0, 57, 55, 0.9, 'original', None, 'main'),
    Installment("Film2", 40, 57, 55, 0.9, 'direct_sequel', 0.9, 'main'),
    Installment("Film3", 80, 57, 55, 0.9, 'direct_sequel', 0.9, 'main'),
    Installment("Film4", 120, 57, 55, 0.9, 'direct_sequel', 0.9, 'main'),
]
report("CASE D: rapid mediocrity x4", D, [0, 40, 80, 120, 121], 'main')

# ---------------- CASE E ----------------
E = [
    Installment("DefiningHit", 0, 88, 85, 2.0, 'original', None, 'main'),
]
report("CASE E: 20-year dormancy", E, [0, 260, 520, 1040], 'main')

# ---------------- CASE F (reboot after E) ----------------
F = E + [
    Installment("Reboot", 1040, 85, 80, 1.6, 'reboot', None, 'reboot1'),
]
report("CASE F: successful reboot after dormancy", F, [1040, 1041], 'reboot1')
print("  (property-wide Recognition at week 1041, feeding the reboot's own awareness/expectation):")
r, rc = recognition(F, 1041)
print(f"  R={r:.1f}  contributions={rc}")

# ---------------- CASE G (failed reboot after E) ----------------
G = E + [
    Installment("Reboot", 1040, 40, 35, 0.5, 'reboot', None, 'reboot1'),
]
report("CASE G: failed reboot after dormancy", G, [1040, 1041], 'reboot1')
r, rc = recognition(G, 1041)
print(f"  R={r:.1f}  contributions={rc}")

# ---------------- Sanity: decay values referenced in the write-up ----------------
print("\n--- decay reference values ---")
for wk in [26, 52, 104, 130, 260, 520, 1040, 1872]:
    print(f"week {wk:5d}: decay_R(HL={HL_R})={decay(wk,HL_R):.4f}  decay_M(HL={HL_M})={decay(wk,HL_M):.6f}  decay_F(HL={HL_F})={decay(wk,HL_F):.4f}")

# reach01 flatness note
print("\n--- reach01 at ASSUMED_EXPECTED_TOTAL=150M for various comparators ---")
for comp in [0.5, 0.6, 0.9, 1.4, 1.6, 1.7, 1.9, 2.0, 2.2, 2.5]:
    tot = comp * ASSUMED_EXPECTED_TOTAL
    print(f"comparator={comp:>4}: total=${tot/1e6:.1f}M reach01={reach01(tot):.4f}")

# small-budget contrast
print("\n--- reach01 contrast for a modest $5M-forecast horror hit ---")
small_total = 5_000_000 * 2.2
print(f"small film total=${small_total/1e6:.1f}M reach01={reach01(small_total):.4f}  vs tentpole 2.2x reach01={reach01(2.2*150_000_000):.4f}")
