"""
R3 — reviewer's corrected R/M/F calculator (paper model only; touches no repository code).

Starts from models/M1-final-synthesis-calc.py (the synthesis) and applies the three corrections the
independent reviewer adopts in the report after the red-team pass (redteam/R1, R2):

  C1  Recognition contributions are QUALITY-GATED:  raw_i = reach01_i * q_i * gateR(q_i),
      gateR(q) = clamp((q - 0.50) / 0.25, 0, 1).  Mediocre volume can no longer ratchet Recognition
      (or its durable floor) toward the cap; only genuinely good films build durable recognition.
      (Red-team root cause A.)
  C2  Fatigue DISCOUNTS the cash-facing awareness input:
      awareness = clamp(0.8*R/100 + 0.2*max(M,0)/100, 0, 1) * (1 - 0.5*min(F,100)/100).
      The separate "expectation multiplier" is dropped: the forecast reads the SAME awareness input
      at greenlight (ForecastInputs = ReceptionInputs), so the bar rises honestly with inheritance and
      falls with Fatigue.  (Red-team root cause B; boundary review A1.)
  C3  A reboot branch is seeded with F0 = GAMMA_REBOOT * (parent branch's current, decayed F) instead
      of 0 — reboot is not a fatigue cure (M3 §3.2, Terminator evidence).  (Red-team finding #9/#2.)
  C5  The Fatigue founding-film exemption applies only to the StoryProperty's FIRST-EVER film; a reboot's or
      spin-off's founding film accrues at its own similarity bucket (reboot 0.60, spin-off 0.50) — audiences
      have seen this story before, so serial mediocre reboots cannot each start Fatigue-free.
  C4  The remake comparison term is re-homed from the expectation multiplier to a discount on the
      awareness input: awareness *= (1 - 0.5 * q_ref * 2^(-age_ref/260wk)).

Everything else (Momentum kernel, Fatigue accrual/gate/paydown, bands, half-lives) is the synthesis's.
All constants remain STARTING POINTS.
"""
import math

HL_R, KAPPA_R, FLOOR_FRAC = 650.0, 0.15, 0.35
HL_M = 24.0
HL_F_BASE, PAYDOWN_MAX, SAT_Q, SAT_SPAN, FATIGUE_SCALE = 104.0, 2.5, 0.75, 0.10, 100.0
SIMILARITY = {'direct_sequel': 0.90, 'prequel': 0.90, 'remake': 0.70, 'spin_off': 0.50, 'reboot': 0.60}
DORMANT_WEEKS, REVIVAL_R_BAR, MOMENTUM_COOL, FATIGUE_HOT, REACT_WINDOW = 150.0, 25.0, -5.0, 60.0, 26.0
AWARE_WR, AWARE_WM = 0.8, 0.2
FATIGUE_AWARENESS_WEIGHT = 0.5      # C2
GAMMA_REBOOT = 0.2                   # C3
REMAKE_W, HL_REMAKE = 0.5, 260.0     # C4
GATE_R_LO, GATE_R_SPAN = 0.50, 0.25  # C1
EXPECTED_TOTAL = 150_000_000.0


def quality(c, a): return 0.5 * c / 100 + 0.5 * a / 100
def reach01(t): return t / (t + 10_000_000.0)
def surprise(comp, q): return max(-1.0, min(1.0, 0.5 * (comp - 1) + (q - 0.5)))
def satiation_gate(q): return 0.0 if q >= SAT_Q else max(0.0, min(1.0, (SAT_Q - q) / SAT_SPAN))
def paydown_mult(lq): return 1.0 if lq is None else 1.0 + (PAYDOWN_MAX - 1) * max(0.0, min(1.0, (lq - 0.5) / 0.5))
def gate_r(q): return max(0.0, min(1.0, (q - GATE_R_LO) / GATE_R_SPAN))            # C1


class Property:
    def __init__(self, name):
        self.name, self.bestScore, self.residual, self.peakId, self.rPeak, self.hasReleased = name, 0.0, 0.0, None, 0.0, False
        self.branches = []

    def register(self, iid, wk, q, reach):
        raw = reach * q * gate_r(q)                                                   # C1
        score = raw * 2 ** (wk / HL_R)
        if not self.hasReleased:
            self.bestScore, self.peakId, self.hasReleased = score, iid, True
        elif score > self.bestScore:
            self.residual += self.bestScore; self.bestScore, self.peakId = score, iid
        else:
            self.residual += score
        self.rPeak = max(self.rPeak, self.R(wk))

    def R_raw(self, wk): return 100 * (self.bestScore + KAPPA_R * self.residual) * 2 ** (-wk / HL_R)
    def R(self, wk): return max(0.0, min(100.0, self.R_raw(wk)))
    def R_reported(self, wk): return max(0.0, min(100.0, max(self.R_raw(wk), FLOOR_FRAC * self.rPeak)))


class Branch:
    def __init__(self, name, prop, btype, parent=None, now=0.0):
        self.name, self.prop, self.btype = name, prop, btype
        self.M, self.F, self.lastUpdate, self.lastQ, self.lastRel, self.priorGap, self.hasReleased = 0.0, 0.0, now, None, None, None, False
        if btype == 'reboot' and parent is not None:                                  # C3
            _, pf = parent.project(now)
            self.F = GAMMA_REBOOT * pf
        prop.branches.append(self)

    def _advance(self, wk):
        dt = max(0.0, wk - self.lastUpdate)
        if dt > 0:
            self.M *= 2 ** (-dt / HL_M)
            self.F *= 2 ** (-dt / (HL_F_BASE / paydown_mult(self.lastQ)))
            self.lastUpdate = wk

    def project(self, wk):
        dt = max(0.0, wk - self.lastUpdate)
        return self.M * 2 ** (-dt / HL_M), self.F * 2 ** (-dt / (HL_F_BASE / paydown_mult(self.lastQ)))

    def release(self, iid, wk, critic, aud, total, expected, ctype):
        self._advance(wk)
        q, r01, comp = quality(critic, aud), reach01(total), total / expected
        self.M += 100 * surprise(comp, q)
        founding = not self.prop.hasReleased          # C5: only the PROPERTY's first-ever film is exempt
        accrual = 0.0
        if not founding:
            sim = SIMILARITY.get(ctype) or 0.90
            accrual = FATIGUE_SCALE * sim * (1 - q) * satiation_gate(q)
            self.F += accrual
        self.prop.register(iid, wk, q, r01)
        if self.hasReleased: self.priorGap = wk - self.lastRel
        self.lastRel, self.lastQ, self.hasReleased = wk, q, True
        return q, accrual

    def band(self, wk):
        m, f = self.project(wk); r = self.prop.R_reported(wk)
        if not self.hasReleased: return "NEW"
        W, G = wk - self.lastRel, self.priorGap
        if G is not None and W < REACT_WINDOW and G >= DORMANT_WEEKS and m >= 0: return "ACTIVE AGAIN"
        if W >= DORMANT_WEEKS: return "REVIVAL CANDIDATE" if r >= REVIVAL_R_BAR else "DORMANT"
        if m < MOMENTUM_COOL or f >= FATIGUE_HOT: return "COOLING"
        return "ACTIVE"

    def awareness(self, wk, remake_ref=None):
        m, f = self.project(wk); r = self.prop.R_reported(wk)
        a = max(0.0, min(1.0, AWARE_WR * r / 100 + AWARE_WM * max(m, 0) / 100))
        a *= (1 - FATIGUE_AWARENESS_WEIGHT * min(f, 100) / 100)                       # C2
        if remake_ref is not None:                                                     # C4
            q_ref, age = remake_ref
            a *= (1 - REMAKE_W * q_ref * 2 ** (-age / HL_REMAKE))
        return r, m, f, a

    def row(self, wk, label):
        r, m, f, a = self.awareness(wk)
        return f"{label:>40} | wk{wk:>5.0f} | R={r:6.2f} M={m:7.2f} F={f:7.2f} | {self.band(wk):<17} | aware={a:.3f}"


def hdr(t): print("\n" + "=" * 100 + f"\n{t}\n" + "=" * 100)


# ---------------------------------------------------------------- the seven cases
hdr("CASE A — breakout original, fast sequel (decision wk 4, release wk 60)")
p = Property("A"); b = Branch("main", p, "main")
b.release("F1", 0, 85, 80, 2.2 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'original'); print(b.row(0, "Film 1 (85/80, 2.2x)"))
print(b.row(4, "greenlight decision")); print(b.row(60, "sequel release week (no outcome)"))

hdr("CASE B — two straight hits, spin-off 40wk later (must not punish speed)")
p = Property("B"); b = Branch("main", p, "main")
b.release("F1", 0, 82, 80, 1.9 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'original'); print(b.row(0, "Film 1 smash"))
b.release("F2", 52, 80, 78, 1.7 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'direct_sequel'); print(b.row(52, "Film 2 smash"))
print(b.row(91, "main, spin-off decision wk 91"))
so = Branch("spin", p, "spinoff", now=91.0); print(so.row(91, "spin-off pre-release (NEW)"))
so.release("S1", 92, 75, 74, 1.4 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'spin_off'); print(so.row(92, "spin-off released (75/74, 1.4x)"))

hdr("CASE C — hit then flop; rest")
p = Property("C"); b = Branch("main", p, "main")
b.release("F1", 0, 90, 88, 2.5 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'original'); print(b.row(0, "Film 1 iconic"))
b.release("F2", 78, 45, 40, 0.6 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'direct_sequel'); print(b.row(78, "Film 2 weak"))
print(b.row(130, "+52wk rest"))

hdr("CASE D — four mediocre sequels at 40wk cadence (Fatigue must drive the band)")
p = Property("D"); b = Branch("main", p, "main")
for i in range(4):
    b.release(f"F{i+1}", 40 * i, 57, 55, 0.9 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'original' if i == 0 else 'direct_sequel')
    print(b.row(40 * i, f"Film {i+1} (57/55, 0.9x)"))

hdr("CASE E — 20-year dormancy of a major property")
p = Property("E"); b = Branch("main", p, "main")
b.release("F1", 0, 88, 85, 2.0 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'original'); print(b.row(0, "defining hit"))
for wk in (260, 520, 1040): print(b.row(wk, f"+{wk//52}y"))
pE, bE = p, b

hdr("CASE F / G — reboot after E (branch seeded with 0.2 x old branch's decayed F = 0 here)")
for lab, (c, a, x) in (("F success (85/80,1.6x)", (85, 80, 1.6)), ("G failure (40/38,0.5x)", (40, 38, 0.5))):
    p = Property("EFG"); old = Branch("main", p, "main"); old.release("F1", 0, 88, 85, 2.0 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'original')
    rb = Branch("reboot", p, "reboot", parent=old, now=1040.0); print(rb.row(1040, "reboot pre-release"))
    rb.release("R1", 1040, c, a, x * EXPECTED_TOTAL, EXPECTED_TOTAL, 'reboot'); print(rb.row(1040, lab)); print(old.row(1040, "  old branch same instant"))

hdr("CASE R — remake of E's defining hit at 2 / 10 / 30 years (awareness discount, C4)")
for yrs in (2, 10, 30):
    wk = 52 * yrs
    r, m, f, a0 = bE.awareness(wk); r, m, f, a1 = bE.awareness(wk, remake_ref=(quality(88, 85), wk))
    print(f"  ref age {yrs:>2}y: awareness without comparison {a0:.3f} -> with {a1:.3f}  (discount x{a1/a0:.3f})")

# ---------------------------------------------------------------- red-team probes
hdr("RED-TEAM PROBE 1 — 20 mediocre releases (57/55, 0.9x) at 15-wk cadence: does R ratchet to 100? does awareness reward it?")
p = Property("spam"); b = Branch("main", p, "main")
for i in range(20):
    wk = 15 * i; b.release(f"F{i+1}", wk, 57, 55, 0.9 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'original' if i == 0 else 'direct_sequel')
    if i in (0, 1, 2, 3, 4, 7, 11, 19): print(b.row(wk, f"release #{i+1}"))
print(f"  rPeak (durable floor base) after 20 mediocre films = {p.rPeak:.2f}  (floor = {FLOOR_FRAC*p.rPeak:.2f})")

hdr("RED-TEAM PROBE 2 — same property, 20 GOOD releases (80/78, 1.3x) at 15-wk cadence (quality volume SHOULD build recognition)")
p = Property("good"); b = Branch("main", p, "main")
for i in range(20):
    wk = 15 * i; b.release(f"F{i+1}", wk, 80, 78, 1.3 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'original' if i == 0 else 'direct_sequel')
    if i in (0, 3, 7, 19): print(b.row(wk, f"release #{i+1}"))

hdr("RED-TEAM PROBE 3 — spam 8 mediocre, park 3 years, revive with one mediocre film (park-and-revive)")
p = Property("park"); b = Branch("main", p, "main")
for i in range(8):
    b.release(f"F{i+1}", 15 * i, 57, 55, 0.9 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'original' if i == 0 else 'direct_sequel')
print(b.row(105, "after 8 mediocre films")); print(b.row(105 + 156, "+3y parked"))
b.release("F9", 105 + 156, 57, 55, 0.9 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'direct_sequel'); print(b.row(105 + 156, "mediocre revival"))
fresh = Property("fresh"); fb = Branch("main", fresh, "main"); fb.release("O1", 0, 57, 55, 0.9 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'original')
print(fb.row(0, "  vs a fresh mediocre ORIGINAL"))

hdr("RED-TEAM PROBE 4 — fatigued franchise (F=90 on main) rebooted immediately: does the reboot dodge Fatigue?")
p = Property("dodge"); b = Branch("main", p, "main")
for i in range(4):
    b.release(f"F{i+1}", 40 * i, 57, 55, 0.9 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'original' if i == 0 else 'direct_sequel')
print(b.row(120, "main after 4 mediocre films"))
rb = Branch("reboot", p, "reboot", parent=b, now=124.0); print(rb.row(124, "reboot branch pre-release (seeded F)"))
rb.release("R1", 124, 57, 55, 0.9 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'reboot'); print(rb.row(124, "mediocre reboot released"))
print(b.row(124, "  main branch same instant"))

hdr("RED-TEAM PROBE 5 — famous property (one iconic film, R~87) milked by FIVE serial mediocre reboots, 60wk apart")
p = Property("rebootspam"); main = Branch("main", p, "main"); main.release("F1", 0, 90, 88, 2.5 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'original')
print(main.row(0, "iconic original")); prev = main
for n in range(5):
    wk = 104 + 60 * n
    rb = Branch(f"reboot{n+1}", p, "reboot", parent=prev, now=float(wk)); pre = rb.row(wk, f"reboot #{n+1} pre-release (seeded)")
    rb.release(f"R{n+1}", wk, 57, 55, 0.9 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'reboot'); print(pre); print(rb.row(wk, f"reboot #{n+1} released (57/55, 0.9x)")); prev = rb
fresh = Property("fresh2"); fb = Branch("main", fresh, "main"); fb.release("O1", 0, 57, 55, 0.9 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'original')
print(fb.row(0, "  vs a fresh mediocre ORIGINAL"))
