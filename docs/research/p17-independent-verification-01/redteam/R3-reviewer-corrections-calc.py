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

REVISION 2 (2026-09-12) — canonical-specification reconciliation requested by Future Ops after reviewing
commit 38ca0068.  THIS FILE IS THE CANONICAL CALCULATOR for the report's reconciled rule set (§5, §8, §9,
§10); its committed output is R3-output.txt.  Every models/*.py calculator is a HISTORICAL input.
Changes in this revision:
  C3 (revised)  FATIGUE IS PROPERTY-WIDE.  Revision 1 kept Fatigue per branch and seeded a reboot line with
       GAMMA_REBOOT * the parent line's F.  PROBE 6 showed that no seed rule can stop fatigue laundering,
       because a sequel on ANY existing continuity is always legal: a player rotating mediocre sequels across
       old, dormant continuities (or opening a fresh line per film) reads a paid-down or empty line while the
       audience is tired of the property.  The reconciled rule keeps ONE Fatigue scalar per StoryProperty
       (accrual = 100 * similarity * (1 - q) * gate, quality-scaled paydown, as before); Momentum stays per
       continuity.  A reboot therefore resets Momentum and accrues at its own similarity (0.60) but inherits
       the property's Fatigue in full — "reboot is not a fatigue cure" (Terminator, TASM), now exact.  The
       per-continuity ledger is display only (`lineOnly` below shows what the retired per-branch read would
       have said, so the laundering that revision 1 permitted is visible).  Spin-offs are SubProperties: they
       are minted with SPINOFF_F_INHERIT * the parent's Fatigue (§9) and keep their own scalar thereafter.
  C4'  Reboot partial comparison term (§8): a reboot pays W_PARTIAL * the remake discount against the most
       recent prior continuity's last film ONLY if that film is recent (< REBOOT_REF_RECENT_WK) and strong
       (quality >= REBOOT_REF_STRONG_Q).  Stated in §8 since revision 1; now actually executed (CASE R2).
  PROBE 6 (new): lifetime branch cap (M3, revision 1) vs active-continuity cap (§10, revision 2) — the ninth
       requested continuity, exhaustion inside a 1920-2040 campaign and beyond it, and fatigue laundering
       under four play patterns, printing the property-wide read next to the retired per-line read.
Verified by diff against the revision-1 output: Cases A-F, R and probes 1-3 are bit-identical; Case G's old
line, probe 4 and probe 5 move (documented in the report §5.4) because the property-wide read is stronger
than the retired seed.
"""
import math

HL_R, KAPPA_R, FLOOR_FRAC = 650.0, 0.15, 0.35
HL_M = 24.0
HL_F_BASE, PAYDOWN_MAX, SAT_Q, SAT_SPAN, FATIGUE_SCALE = 104.0, 2.5, 0.75, 0.10, 100.0
SIMILARITY = {'direct_sequel': 0.90, 'prequel': 0.90, 'remake': 0.70, 'spin_off': 0.50, 'reboot': 0.60}
DORMANT_WEEKS, REVIVAL_R_BAR, MOMENTUM_COOL, FATIGUE_HOT, REACT_WINDOW = 150.0, 25.0, -5.0, 60.0, 26.0
AWARE_WR, AWARE_WM = 0.8, 0.2
FATIGUE_AWARENESS_WEIGHT = 0.5      # C2
SPINOFF_F_INHERIT = 0.5              # §9: a SubProperty is minted with 0.5 * the parent property's Fatigue
W_PARTIAL, REBOOT_REF_RECENT_WK, REBOOT_REF_STRONG_Q = 0.4, 416.0, 0.65   # C4' reboot partial comparison (§8)
N_MAX_OPEN_CONTINUITIES = 3          # §10 active-continuity cap: main/reboot lines that are NEW or not dormant
N_MAX_BRANCHES_LIFETIME = 8          # M3's revision-1 lifetime cap, kept only so PROBE 6 can show it
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
        self.Fp, self.fLastUpdate, self.fLastQ = 0.0, 0.0, None                       # C3 (revised): ONE Fatigue per property

    def _advance_F(self, wk):
        dt = max(0.0, wk - self.fLastUpdate)
        if dt > 0:
            self.Fp *= 2 ** (-dt / (HL_F_BASE / paydown_mult(self.fLastQ)))
            self.fLastUpdate = wk

    def F(self, wk):
        dt = max(0.0, wk - self.fLastUpdate)
        return self.Fp * 2 ** (-dt / (HL_F_BASE / paydown_mult(self.fLastQ)))

    def open_continuities(self, wk):
        """main/reboot lines that are NEW (in flight) or not dormant — what the §10 active cap counts."""
        return [b for b in self.branches if b.btype != 'spinoff' and (not b.hasReleased or wk - b.lastRel < DORMANT_WEEKS)]

    def n_continuities(self): return sum(1 for b in self.branches if b.btype != 'spinoff')

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
        if btype == 'spinoff':                                                         # §9: F_sp(t0) = 0.5 * parent Fatigue
            self.F = SPINOFF_F_INHERIT * prop.F(now)
        # revision 1 seeded a reboot line with GAMMA_REBOOT * parent F here — retired (C3 revised)
        prop.branches.append(self)

    def _advance(self, wk):
        dt = max(0.0, wk - self.lastUpdate)
        if dt > 0:
            self.M *= 2 ** (-dt / HL_M)
            self.F *= 2 ** (-dt / (HL_F_BASE / paydown_mult(self.lastQ)))
            self.lastUpdate = wk

    def lineOnly(self, wk):
        """The retired revision-1 per-line Fatigue read (display ledger only in revision 2)."""
        dt = max(0.0, wk - self.lastUpdate)
        return self.F * 2 ** (-dt / (HL_F_BASE / paydown_mult(self.lastQ)))

    def project(self, wk):
        """(M of this continuity, F read): F is the property's scalar for main/reboot lines; a spin-off reads its own."""
        dt = max(0.0, wk - self.lastUpdate)
        m = self.M * 2 ** (-dt / HL_M)
        return m, (self.lineOnly(wk) if self.btype == 'spinoff' else self.prop.F(wk))

    def release(self, iid, wk, critic, aud, total, expected, ctype):
        self._advance(wk)
        q, r01, comp = quality(critic, aud), reach01(total), total / expected
        self.M += 100 * surprise(comp, q)
        founding = not self.prop.hasReleased          # C5: only the PROPERTY's first-ever film is exempt
        accrual = 0.0
        if not founding:
            sim = SIMILARITY.get(ctype) or 0.90
            accrual = FATIGUE_SCALE * sim * (1 - q) * satiation_gate(q)
            self.F += accrual                                   # per-line ledger (display / retired read) or the SubProperty's own F
        if self.btype != 'spinoff':                                                     # C3 (revised): the property accrues
            self.prop._advance_F(wk); self.prop.Fp += accrual; self.prop.fLastQ = q
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

    def awareness(self, wk, remake_ref=None, reboot_ref=None):
        m, f = self.project(wk); r = self.prop.R_reported(wk)
        a = max(0.0, min(1.0, AWARE_WR * r / 100 + AWARE_WM * max(m, 0) / 100))
        a *= (1 - FATIGUE_AWARENESS_WEIGHT * min(f, 100) / 100)                       # C2
        if remake_ref is not None:                                                     # C4
            q_ref, age = remake_ref
            a *= (1 - REMAKE_W * q_ref * 2 ** (-age / HL_REMAKE))
        if reboot_ref is not None:                                                     # C4' (§8): partial, conditional
            q_ref, age = reboot_ref
            if age < REBOOT_REF_RECENT_WK and q_ref >= REBOOT_REF_STRONG_Q:
                a *= (1 - W_PARTIAL * REMAKE_W * q_ref * 2 ** (-age / HL_REMAKE))
        return r, m, f, a

    def row(self, wk, label):
        r, m, f, a = self.awareness(wk)
        return f"{label:>40} | wk{wk:>5.0f} | R={r:6.2f} M={m:7.2f} F={f:7.2f} | {self.band(wk):<17} | aware={a:.3f}"


def hdr(t): print("\n" + "=" * 100 + f"\n{t}\n" + "=" * 100)

print("R3 CANONICAL CALCULATOR OUTPUT — revision 2 (2026-09-12). Specification: report §5 (index §5.7). Revision-1 output: git 38ca0068.")


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

hdr("CASE F / G — reboot after E (property Fatigue decayed to 0 over 20 years; Momentum starts at 0 on the new line)")
for lab, (c, a, x) in (("F success (85/80,1.6x)", (85, 80, 1.6)), ("G failure (40/38,0.5x)", (40, 38, 0.5))):
    p = Property("EFG"); old = Branch("main", p, "main"); old.release("F1", 0, 88, 85, 2.0 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'original')
    rb = Branch("reboot", p, "reboot", parent=old, now=1040.0); print(rb.row(1040, "reboot pre-release"))
    rb.release("R1", 1040, c, a, x * EXPECTED_TOTAL, EXPECTED_TOTAL, 'reboot'); print(rb.row(1040, lab)); print(old.row(1040, "  old branch same instant"))

hdr("CASE R — remake of E's defining hit at 2 / 10 / 30 years (awareness discount, C4)")
for yrs in (2, 10, 30):
    wk = 52 * yrs
    r, m, f, a0 = bE.awareness(wk); r, m, f, a1 = bE.awareness(wk, remake_ref=(quality(88, 85), wk))
    print(f"  ref age {yrs:>2}y: awareness without comparison {a0:.3f} -> with {a1:.3f}  (discount x{a1/a0:.3f})")

hdr("CASE R2 — reboot partial comparison (C4', §8): 0.4 x the remake discount, only if the prior line's last film was recent AND strong")
for lab, q_ref, age in (("TASM-like: prior line ended 5y ago on a 0.62-quality film", 0.62, 260),
                        ("prior line ended 5y ago on a 0.80-quality film", 0.80, 260),
                        ("Casino-Royale-like: prior line ended 4y ago on a 0.40-quality film", 0.40, 209),
                        ("prior line ended 9y ago on a 0.80-quality film", 0.80, 468)):
    r, m, f, a0 = bE.awareness(1040); r, m, f, a1 = bE.awareness(1040, reboot_ref=(q_ref, age))
    fired = age < REBOOT_REF_RECENT_WK and q_ref >= REBOOT_REF_STRONG_Q
    print(f"  {lab:<62}: {'fires' if fired else 'no term'}  awareness {a0:.3f} -> {a1:.3f} (x{a1/a0:.3f})")

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

hdr("RED-TEAM PROBE 4 — fatigued franchise (F=90) rebooted immediately: does the reboot dodge Fatigue? (revision 2: no)")
p = Property("dodge"); b = Branch("main", p, "main")
for i in range(4):
    b.release(f"F{i+1}", 40 * i, 57, 55, 0.9 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'original' if i == 0 else 'direct_sequel')
print(b.row(120, "main after 4 mediocre films"))
rb = Branch("reboot", p, "reboot", parent=b, now=124.0); print(rb.row(124, "reboot line pre-release (property F)"))
rb.release("R1", 124, 57, 55, 0.9 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'reboot'); print(rb.row(124, "mediocre reboot released"))
print(b.row(124, "  main branch same instant"))

hdr("RED-TEAM PROBE 5 — famous property (one iconic film, R~87) milked by FIVE serial mediocre reboots, 60wk apart")
p = Property("rebootspam"); main = Branch("main", p, "main"); main.release("F1", 0, 90, 88, 2.5 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'original')
print(main.row(0, "iconic original")); prev = main
for n in range(5):
    wk = 104 + 60 * n
    rb = Branch(f"reboot{n+1}", p, "reboot", parent=prev, now=float(wk)); pre = rb.row(wk, f"reboot #{n+1} pre-release (property F)")
    rb.release(f"R{n+1}", wk, 57, 55, 0.9 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'reboot'); print(pre); print(rb.row(wk, f"reboot #{n+1} released (57/55, 0.9x)")); prev = rb
fresh = Property("fresh2"); fb = Branch("main", fresh, "main"); fb.release("O1", 0, 57, 55, 0.9 * EXPECTED_TOTAL, EXPECTED_TOTAL, 'original')
print(fb.row(0, "  vs a fresh mediocre ORIGINAL"))

# ---------------------------------------------------------------- probe 6: branch limits and fatigue laundering (revision 2)
hdr("PROBE 6 — lifetime branch cap vs active-continuity cap; the ninth requested continuity; fatigue laundering")
CADENCE, N_FILMS = 40, 20

def mediocre_run(pattern):
    """20 mediocre films (57/55, 0.9x) at 40-wk cadence.  pattern(i, wk, prop, lines) -> (wants_new_line, opened, branch, ctype).
    Returns per-film (wk, line, propertyF_read, lineOnly_read, awareness) measured at the greenlight/release instant BEFORE
    the film's own accrual (what the film earns), plus the first refused new-line request and the 9th-line request."""
    p = Property("p6"); lines = [Branch("main", p, "main")]
    rows, first_refusal, ninth = [], None, None
    for i in range(N_FILMS):
        wk = CADENCE * i
        if i == 0:
            b, ctype = lines[0], 'original'
        else:
            wants, opened, b, ctype = pattern(i, wk, p, lines)
            if wants and not opened and first_refusal is None: first_refusal = (wk, p.n_continuities(), len(p.open_continuities(wk)))
            if wants and p.n_continuities() == (9 if opened else 8) and ninth is None: ninth = (wk, opened)
        pre_m, pre_f = b.project(wk); pre_line = b.lineOnly(wk); r, _, _, a = b.awareness(wk)
        a_retired = max(0.0, min(1.0, AWARE_WR * r / 100 + AWARE_WM * max(pre_m, 0) / 100)) * (1 - FATIGUE_AWARENESS_WEIGHT * min(pre_line, 100) / 100)
        b.release(f"F{i+1}", wk, 57, 55, 0.9 * EXPECTED_TOTAL, EXPECTED_TOTAL, ctype)
        rows.append((wk, b.name, pre_f, pre_line, a, a_retired))
    return p, rows, first_refusal, ninth

def pat_single(i, wk, p, lines): return False, False, lines[0], 'direct_sequel'

def new_line(p, lines, wk):
    b = Branch(f"line{p.n_continuities()+1}", p, "reboot", now=float(wk)); lines.append(b); return b

def make_pat_new_line(cap_kind, fallback):
    """Want a new continuity for every film.  Legal under cap_kind ('none' | 'lifetime' | 'active')?  Else fallback:
    'least_line' = the existing line with the lowest retired per-line read (revision-1 laundering choice);
    'keep_open'  = the OPEN line released most recently, so the other open lines go dormant soonest and a new line becomes
                   legal again as early as possible (the reboot-heavy player's choice under the active cap)."""
    def pat(i, wk, p, lines):
        if cap_kind == 'none': legal = True
        elif cap_kind == 'lifetime': legal = p.n_continuities() < N_MAX_BRANCHES_LIFETIME
        else: legal = len(p.open_continuities(wk)) < N_MAX_OPEN_CONTINUITIES
        if legal: return True, True, new_line(p, lines, wk), 'reboot'
        if fallback == 'least_line': b = min(lines, key=lambda x: x.lineOnly(wk))
        else: b = max(p.open_continuities(wk), key=lambda x: x.lastRel if x.hasReleased else -1)
        return True, False, b, 'direct_sequel'
    return pat

def show(title, res):
    p, rows, refusal, ninth = res
    print(f"\n  {title}")
    print(f"     continuities created: {p.n_continuities():>2} | first refused new-line request: " +
          ("none" if refusal is None else f"wk {refusal[0]} ({refusal[1]} lines exist, {refusal[2]} open)") +
          " | 9th line requested: " + ("never (fewer than 8 exist)" if ninth is None else f"wk {ninth[0]} -> {'LEGAL' if ninth[1] else 'ILLEGAL'}"))
    for wk, name, pf, pl, a, ar in rows:
        if wk // CADENCE in (1, 2, 3, 5, 8, 12, 19):
            print(f"     film {wk//CADENCE+1:>2} wk{wk:>4} on {name:<6} | property F (read) {pf:6.1f} | retired per-line read {pl:6.1f} | awareness earned {a:.3f} (retired read would give {ar:.3f})")
    aw = [a for *_, a, _ in rows[1:]]; ar = [x for *_, x in rows[1:]]
    print(f"     mean awareness earned, films 2-20: {sum(aw)/len(aw):.3f}   (under the retired per-line read: {sum(ar)/len(ar):.3f})")

show("6a  single continuity, 19 mediocre sequels (baseline)", mediocre_run(pat_single))
show("6b  a NEW continuity for every film, NO cap at all (what unlimited branching would permit)", mediocre_run(make_pat_new_line('none', 'least_line')))
show("6c  M3 LIFETIME cap 8: 7 new lines, then sequels rotate onto whichever existing line has the lowest per-line read", mediocre_run(make_pat_new_line('lifetime', 'least_line')))
show("6d  §10 ACTIVE cap 3, naive: new line whenever legal, else the lowest per-line read (keeps all 3 open, so never legal again)", mediocre_run(make_pat_new_line('active', 'least_line')))
show("6e  §10 ACTIVE cap 3, reboot-heavy: sequel on the most recently released open line so the others go dormant and a new line becomes legal", mediocre_run(make_pat_new_line('active', 'keep_open')))
print("""
  Reading the columns: 'property F (read)' is what revision 2's awareness input and band see; 'retired per-line read' is what
  revision 1 would have seen.  Under revision 2 the ONLY difference between patterns is the similarity bucket (a reboot's own
  film accrues at SIMILARITY['reboot'] = 0.60 instead of 0.90) — a tuning constant, not a branch trick; under the retired
  per-line read, 6b/6c would have read an empty or paid-down line while the audience was tired of the property.  The active
  cap bounds concurrent/display complexity (never more than 3 open lines) — it is not what prevents laundering.
""")

# ninth continuity and campaign horizon under each cap
print("  Ninth continuity / horizon:")
for founded, cadence_yrs in ((1925, 12), (1925, 20), (1950, 15)):
    ninth_lifetime = founded + 8 * cadence_yrs
    print(f"     property founded {founded}, a new continuity every {cadence_yrs} y: 8 lifetime branches spent by {founded + 7*cadence_yrs}; "
          f"9th request in {ninth_lifetime} -> LIFETIME cap: ILLEGAL FOREVER{' (inside the 1920-2040 campaign)' if ninth_lifetime <= 2040 else ' (after 2040)'}; "
          f"ACTIVE cap: legal whenever < {N_MAX_OPEN_CONTINUITIES} lines are open")
rate_lines_per_wk = N_MAX_OPEN_CONTINUITIES / DORMANT_WEEKS
for label, weeks in (("1920-2040 campaign", 120 * 52), ("200-year sandbox", 200 * 52)):
    n = int(rate_lines_per_wk * weeks)
    print(f"     ACTIVE cap worst case ({label}, {weeks} wk): <= {n} continuities ever (rate bound {N_MAX_OPEN_CONTINUITIES} per {DORMANT_WEEKS:.0f} wk) "
          f"~= {n * 58 / 1024:.1f} KB at M3's 58 B per branch record; typical real cases need <= 4")
