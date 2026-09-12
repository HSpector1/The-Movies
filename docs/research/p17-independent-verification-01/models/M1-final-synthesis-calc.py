# STATUS: HISTORICAL CALCULATOR (revision 02, 2026-09-12). Unmodified below this banner.
# The canonical calculator is ../redteam/R3-reviewer-corrections-calc.py (committed output ../redteam/R3-output.txt); the specification is the report §5 (index §5.7).
# Superseded here: the synthesis calculator: ungated Recognition, forecast-only Fatigue, F = 0 reboot seed, expectation multiplier, per-branch Fatigue, 0.6 remake weight — all superseded; kept because redteam/R1 drove it.
"""
P17 M1 FINAL SYNTHESIS -- throwaway paper-arithmetic script.
Read-only. Lives only in scratchpad/p17/models/. No repo touched.

Implements the FINAL recommended RMF model: M1b's derived-kernel shape as base,
reformulated into an exact O(1) scalar accumulator (mathematically identical to
summing over the full installment list, since every kernel is a sum of terms that
all share one common per-meter decay clock), plus the grafts specified by both
judges (M1j, M1k) drawn from M1a and M1c.
"""

import math

# ---------------- constants (all STARTING POINTS) ----------------
HL_R = 650.0        # weeks, Recognition passive decay half-life (M1b base)
KAPPA_R = 0.15       # residual-installment weight in Recognition (M1b base)
FLOOR_FRAC = 0.35    # Recognition floor = FLOOR_FRAC * rPeak (grafted from M1a)

HL_M = 24.0          # weeks, Momentum half-life (M1b base)

HL_F_BASE = 104.0    # weeks, Fatigue baseline half-life (M1b base)
PAYDOWN_MAX = 2.5    # paydown-rate multiplier at lastQuality=1.0 (grafted from M1c)
SAT_Q = 0.75         # quality (0..1) above which NEW Fatigue accrual gates to 0 (grafted from M1a, rescaled)
SAT_SPAN = 0.10      # ramp width below SAT_Q -- RETUNED (M1a's own 0.35-wide span, ported
                     # verbatim onto M1b's case inputs/quality blend, was found by this script to
                     # also partially gate Case D's genuinely-mediocre 0.56-quality films (~46%
                     # dampened), eroding the Fatigue-visibility result Case D exists to demonstrate.
                     # Narrowed so the gate closes M1b's Case-B soft ding (quality 0.79-0.81 -> 0)
                     # while leaving quality<=0.65 (Case C's 0.425 flop, Case D/spam's 0.56) untouched.
FATIGUE_SCALE = 100.0

SIMILARITY = {
    'original': None,       # founding release of a branch: always exempt, no bucket needed
    'direct_sequel': 0.90,
    'prequel': 0.90,
    'remake': 0.70,
    'spin_off': 0.50,
    'reboot': None,         # founding release of its own new branch: always exempt
}

# band thresholds (M1b base -- this is the shape that cleanly isolated Case D)
DORMANT_WEEKS = 150.0
REVIVAL_R_BAR = 25.0
MOMENTUM_COOL = -5.0
FATIGUE_HOT = 60.0
REACT_WINDOW = 26.0

# outputs
AWARE_WR, AWARE_WM = 0.8, 0.2
EXP_A, EXP_B, EXP_C = 0.006, 0.004, 0.005   # +A*R +B*max(M,0) -C*F
EXP_LO, EXP_HI = 0.7, 2.0
REMAKE_COMPARISON_WEIGHT = 0.6   # NEW starting constant (M1b named the mechanism, not a number)
HL_REMAKE_COMPARISON = 260.0     # weeks (5yr) -- NEW, CORRECTED half-life for the remake comparison
                                 # penalty. M1b's text said to reuse HL_M (24wk/~6mo) "so recency of
                                 # the referenced film... drives comparison pressure", but at HL_M=24wk
                                 # a 10-year-old original (520wk) decays to a 2.9e-7 penalty multiplier
                                 # -- essentially zero -- which contradicts 04a's own cited evidence for
                                 # this exact mechanism (Amazing Spider-Man 2012 was punished for
                                 # retelling a 10-year-old origin "too soon"). HL_REMAKE_COMPARISON=260wk
                                 # keeps ~76% of the penalty at 2yr, ~25% at 10yr (still felt), and
                                 # ~1.6% at 30yr ("dormancy/nostalgia helps, no 20-year lock" per H).


def quality(critic, audience):
    return 0.5 * (critic / 100.0) + 0.5 * (audience / 100.0)


def reach01(total_dollars):
    return total_dollars / (total_dollars + 10_000_000.0)


def surprise(comparator, q):
    return max(-1.0, min(1.0, 0.5 * (comparator - 1.0) + (q - 0.5)))


def satiation_gate(q):
    if q >= SAT_Q:
        return 0.0
    return max(0.0, min(1.0, (SAT_Q - q) / SAT_SPAN))


def paydown_mult(last_quality):
    if last_quality is None:
        return 1.0
    return 1.0 + (PAYDOWN_MAX - 1.0) * max(0.0, min(1.0, (last_quality - 0.5) / 0.5))


class Property:
    """StoryProperty root: Recognition lives ONLY here, shared by every branch."""
    def __init__(self, name):
        self.name = name
        self.bestScore = 0.0
        self.residualScoreSum = 0.0
        self.peakInstallmentId = None
        self.rPeak = 0.0
        self.hasReleased = False

    def register_release(self, installment_id, now_week, q, reach):
        raw = reach * q
        score = raw * (2.0 ** (now_week / HL_R))
        if not self.hasReleased:
            self.bestScore = score
            self.peakInstallmentId = installment_id
            self.hasReleased = True
        elif score > self.bestScore:
            self.residualScoreSum += self.bestScore
            self.bestScore = score
            self.peakInstallmentId = installment_id
        else:
            self.residualScoreSum += score
        r_now = self.R(now_week)
        self.rPeak = max(self.rPeak, r_now)

    def R_raw(self, now_week):
        decay = 2.0 ** (-now_week / HL_R)
        return 100.0 * (self.bestScore + KAPPA_R * self.residualScoreSum) * decay

    def R(self, now_week):
        return max(0.0, min(100.0, self.R_raw(now_week)))

    def R_reported(self, now_week):
        floor = FLOOR_FRAC * self.rPeak
        return max(0.0, min(100.0, max(self.R_raw(now_week), floor)))


class Branch:
    """Per-branch Momentum + Fatigue accumulators. No Recognition field here."""
    def __init__(self, name, prop, branch_type, parent=None):
        self.name = name
        self.prop = prop
        self.branch_type = branch_type
        self.parent = parent
        self.M = 0.0
        self.F = 0.0
        self.lastUpdateWeek = 0.0
        self.lastQuality = None
        self.lastReleaseWeek = None
        self.priorGapWeeks = None
        self.hasReleased = False
        self.ledger_display = []   # bounded display list only, not authoritative

    def _advance(self, now_week):
        dt = now_week - self.lastUpdateWeek
        if dt < 0:
            dt = 0
        if dt > 0:
            self.M *= 2.0 ** (-dt / HL_M)
            eff_hl_f = HL_F_BASE / paydown_mult(self.lastQuality)
            self.F *= 2.0 ** (-dt / eff_hl_f)
            self.lastUpdateWeek = now_week

    def project(self, now_week):
        """Non-mutating snapshot of (M, F) at now_week -- for decision-point reads."""
        dt = max(0.0, now_week - self.lastUpdateWeek)
        m = self.M * (2.0 ** (-dt / HL_M))
        eff_hl_f = HL_F_BASE / paydown_mult(self.lastQuality)
        f = self.F * (2.0 ** (-dt / eff_hl_f))
        return m, f

    def release(self, installment_id, now_week, critic, audience, total, expected,
                continuation_type):
        self._advance(now_week)
        q = quality(critic, audience)
        r01 = reach01(total)
        comparator = total / expected

        # Momentum
        s = surprise(comparator, q)
        m0 = 100.0 * s
        self.M += m0

        # Fatigue -- EXACTLY the branch's founding release is exempt (fixes M1c's bug: neither
        # M1a's s=0 convention nor M1b's rows[1:] exclusion is keyed on the DECLARED type, both are
        # keyed on "is there a predecessor on this branch at all". Mirrored here on `founding`, not on
        # continuation_type, which additionally closes a mislabeling loophole M1c's judges flagged
        # (relabeling a non-founding release "reboot"/"original" to dodge Fatigue): any NON-founding
        # release with a founding-only type falls back to the worst-case bucket (0.90) instead of a
        # free pass, so mislabeling never helps and can only hurt.
        founding = not self.hasReleased
        if founding:
            accrual = 0.0
            sim = None
        else:
            sim = SIMILARITY.get(continuation_type) or 0.90
            gate = satiation_gate(q)
            accrual = FATIGUE_SCALE * sim * (1.0 - q) * gate
            self.F += accrual

        # Recognition (property-wide)
        self.prop.register_release(installment_id, now_week, q, r01)

        # bookkeeping
        if self.hasReleased:
            self.priorGapWeeks = now_week - self.lastReleaseWeek
        self.lastReleaseWeek = now_week
        self.lastQuality = q
        self.hasReleased = True
        self.ledger_display.append({'id': installment_id, 'week': now_week, 'm0': m0,
                                     'q': q, 'accrual': accrual, 'sim': sim})
        if len(self.ledger_display) > 6:
            self.ledger_display.pop(0)

        return {'q': q, 'comparator': comparator, 'reach01': r01, 'surprise': s,
                'm0': m0, 'accrual': accrual}

    def band(self, now_week):
        m, f = self.project(now_week)
        r = self.prop.R_reported(now_week)
        if not self.hasReleased:
            return "NEW"
        W = now_week - self.lastReleaseWeek
        G = self.priorGapWeeks   # None (brand-new/one-release branch) must NEVER read as a long gap
        if G is not None and W < REACT_WINDOW and G >= DORMANT_WEEKS and m >= 0:
            return "ACTIVE AGAIN"
        if W >= DORMANT_WEEKS:
            return "REVIVAL CANDIDATE" if r >= REVIVAL_R_BAR else "DORMANT"
        if m < MOMENTUM_COOL or f >= FATIGUE_HOT:
            return "COOLING"
        return "ACTIVE"

    def outputs(self, now_week):
        m, f = self.project(now_week)
        r = self.prop.R_reported(now_week)
        awareness = max(0.0, min(1.0, AWARE_WR * (r / 100.0) + AWARE_WM * (max(m, 0.0) / 100.0)))
        expect = max(EXP_LO, min(EXP_HI, 1.0 + EXP_A * r + EXP_B * max(m, 0.0) - EXP_C * f))
        return r, m, f, awareness, expect

    def row(self, now_week, label=""):
        r, m, f, a, e = self.outputs(now_week)
        b = self.band(now_week)
        return f"{label:>34} | wk{now_week:>5.0f} | R={r:6.2f} M={m:7.2f} F={f:6.2f} | {b:<17} | aware={a:.3f} exp={e:.3f}"


def remake_expect(prop, branch, now_week, ref_quality, ref_age_weeks):
    r, m, f, a, e_before_clamp_note = branch.outputs(now_week)
    penalty = REMAKE_COMPARISON_WEIGHT * ref_quality * (2.0 ** (-ref_age_weeks / HL_REMAKE_COMPARISON))
    e_final = max(EXP_LO, min(EXP_HI, e_before_clamp_note - penalty))
    return e_before_clamp_note, e_final, penalty


EXPECTED_TOTAL = 150_000_000.0   # $150M flat forecast baseline, reused from M1b's own case assumption


def mm(x):
    return x * EXPECTED_TOTAL


print("=" * 100)
print("VERIFY against M1b's own published Case A week-0 numbers (sanity check of the O(1) reformulation)")
p = Property("VerifyA")
b = Branch("main", p, "main")
res = b.release("F1", 0, 85, 80, mm(2.2), EXPECTED_TOTAL, 'original')
print(b.row(0, "Film1 @wk0"))
print("Expect ~ R=80.1 M=92.5 F=0.0 aware=0.826 exp=1.850")
print()

print("=" * 100)
print("CASE A -- breakout original, fast direct sequel")
print("=" * 100)
pA = Property("A")
bA = Branch("main", pA, "main")
bA.release("A-Film1", 0, 85, 80, mm(2.2), EXPECTED_TOTAL, 'original')
print(bA.row(0, "Film1 releases"))
print(bA.row(4, "Film2 greenlit (decision)"))
print(bA.row(60, "Film2 release wk (no outcome given)"))
print()

print("=" * 100)
print("CASE B -- two straight hits, spin-off 40wk later (temporal-leak FIXED: greenlight read wk91, pre-outcome)")
print("=" * 100)
pB = Property("B")
bB_main = Branch("main", pB, "main")
bB_main.release("B-Film1", 0, 82, 80, mm(1.9), EXPECTED_TOTAL, 'original')
print(bB_main.row(0, "Film1 (main)"))
bB_main.release("B-Film2", 52, 80, 78, mm(1.7), EXPECTED_TOTAL, 'direct_sequel')
print(bB_main.row(52, "Film2 (main, direct sequel)"))
print(bB_main.row(91, "main state, wk91 (pre-spinoff-decision)"))
bB_spin = Branch("spinoff", pB, "spinoff", parent=bB_main)
# decision-time read for the NEW branch before it has ever released: pure cold start
print(bB_spin.row(91, "SPINOFF pre-release (decision time)"))
bB_spin.release("B-Spinoff", 92, 75, 74, mm(1.4), EXPECTED_TOTAL, 'spin_off')
print(bB_main.row(92, "main, post-spinoff-release"))
print(bB_spin.row(92, "SPINOFF, post-release (outcome known)"))
print()

print("=" * 100)
print("CASE C -- iconic hit then flop")
print("=" * 100)
pC = Property("C")
bC = Branch("main", pC, "main")
bC.release("C-Film1", 0, 90, 88, mm(2.5), EXPECTED_TOTAL, 'original')
print(bC.row(0, "Film1 (iconic)"))
bC.release("C-Film2", 78, 45, 40, mm(0.6), EXPECTED_TOTAL, 'direct_sequel')
print(bC.row(78, "Film2 (weak), right after"))
print(bC.row(130, "+52wk rest, no Film3 yet"))
print()

print("=" * 100)
print("CASE D -- rapid mediocrity x4 @ 40wk cadence")
print("=" * 100)
pD = Property("D")
bD = Branch("main", pD, "main")
weeks_D = [0, 40, 80, 120]
ctypes_D = ['original', 'direct_sequel', 'direct_sequel', 'direct_sequel']
for i, (wk, ct) in enumerate(zip(weeks_D, ctypes_D), start=1):
    bD.release(f"D-Film{i}", wk, 57, 55, mm(0.9), EXPECTED_TOTAL, ct)
    print(bD.row(wk, f"Film{i} (wk{wk})"))
print()

print("=" * 100)
print("CASE E -- 20-year dormancy of a major property")
print("=" * 100)
pE = Property("E")
bE = Branch("main", pE, "main")
bE.release("E-Film1", 0, 88, 85, mm(2.0), EXPECTED_TOTAL, 'original')
print(bE.row(0, "Film1 (defining hit)"))
for wk in [260, 520, 1040]:
    print(bE.row(wk, f"+{wk}wk dormant"))
print(f"  (rPeak recorded for property E: {pE.rPeak:.2f}; floor = {FLOOR_FRAC*pE.rPeak:.2f})")
print()

print("=" * 100)
print("FLOOR_FRAC sensitivity check on Case E (20yr dormancy) -- BEFORE Case F/G mutate the property")
print("=" * 100)
_snapshot_bestScore, _snapshot_residual, _snapshot_rPeak = pE.bestScore, pE.residualScoreSum, pE.rPeak
for ff in [0.0, 0.20, 0.35, 0.50]:
    floor = ff * _snapshot_rPeak
    raw = pE.R_raw(1040)
    reported = max(0.0, min(100.0, max(raw, floor)))
    print(f"  FLOOR_FRAC={ff:.2f}: raw R(1040)={raw:.2f}  floor={floor:.2f}  reported={reported:.2f}")
print()

print("=" * 100)
print("CASE F -- successful reboot after Case E's dormancy")
print("=" * 100)
bF_reboot = Branch("reboot", pE, "reboot", parent=bE)
print(bF_reboot.row(1040, "pre-reboot (shared property state)"))
bF_reboot.release("F-Reboot", 1040, 85, 80, mm(1.6), EXPECTED_TOTAL, 'reboot')
print(bF_reboot.row(1040, "REBOOT releases (excellent)"))
print(bE.row(1040, "  old main branch, same instant (isolation check)"))
print()

print("=" * 100)
print("CASE G -- failed reboot after Case E's dormancy (fresh property copy, same start as F)")
print("=" * 100)
pG = Property("G")
bG_old = Branch("main", pG, "main")
bG_old.release("G-Film1", 0, 88, 85, mm(2.0), EXPECTED_TOTAL, 'original')
for wk in [1040]:
    pass
bG_reboot = Branch("reboot", pG, "reboot", parent=bG_old)
print(bG_reboot.row(1040, "pre-reboot (shared property state)"))
bG_reboot.release("G-Reboot", 1040, 40, 38, mm(0.5), EXPECTED_TOTAL, 'reboot')
print(bG_reboot.row(1040, "REBOOT releases (poor)"))
print(bG_old.row(1040, "  old main branch, same instant (isolation check)"))
print()

print("=" * 100)
print("BONUS CASE R -- REMAKE, two referenced-film ages (fills the evidence gap M1k flagged)")
print("=" * 100)
# A beloved original still fresh (age_ref small) vs the same original decades later
pR = Property("R")
bR = Branch("main", pR, "main")
bR.release("R-Original", 0, 88, 85, mm(2.0), EXPECTED_TOTAL, 'original')
print(bR.row(0, "Original film releases"))
# Remake proposed 2 years later (original still fresh & beloved)
r, m, f, a, e = bR.outputs(104)
e2, e2p, pen2 = remake_expect(pR, bR, 104, ref_quality=quality(88, 85), ref_age_weeks=104)
print(f"{'Remake greenlit @2yr, pre-penalty':>34} | wk{104:>5.0f} | exp(before penalty)={e2:.3f}  penalty={pen2:.3f}  exp(remake)={e2p:.3f}")
# Remake proposed 10 years later -- the real-world calibration point (Amazing Spider-Man 2012 vs 2002)
e10, e10p, pen10 = remake_expect(pR, bR, 520, ref_quality=quality(88, 85), ref_age_weeks=520)
print(f"{'Remake greenlit @10yr, pre-penalty':>34} | wk{520:>5.0f} | exp(before penalty)={e10:.3f}  penalty={pen10:.3f}  exp(remake)={e10p:.3f}")
# Remake proposed 30 years later (original faded from comparison, though R itself may still be decent)
e30_2, e30p, pen30 = remake_expect(pR, bR, 1560, ref_quality=quality(88, 85), ref_age_weeks=1560)
print(f"{'Remake greenlit @30yr, pre-penalty':>34} | wk{1560:>5.0f} | exp(before penalty)={e30_2:.3f}  penalty={pen30:.4f}  exp(remake)={e30p:.3f}")
print()

print("=" * 100)
print("EXPLOIT STRESS TEST -- 8 mediocre releases at 15wk cadence (same as M1c's own spam probe)")
print("=" * 100)
pS = Property("S")
bS = Branch("main", pS, "main")
for i in range(8):
    wk = i * 15
    ct = 'original' if i == 0 else 'direct_sequel'
    bS.release(f"S-Film{i+1}", wk, 57, 55, mm(0.9), EXPECTED_TOTAL, ct)
    r, m, f, a, e = bS.outputs(wk)
    print(f"  Film{i+1} wk{wk:>4}: R={r:6.2f} M={m:7.2f} F={f:7.2f} aware={a:.3f} exp={e:.3f} band={bS.band(wk)}")
print()
