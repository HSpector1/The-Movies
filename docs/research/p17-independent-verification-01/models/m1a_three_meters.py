#!/usr/bin/env python3
"""
P17 Model A: three stored meters (R, M, F) with exponential decay.
Throwaway paper-model arithmetic only -- scratchpad/p17/models/, per HARD RULES.
"""

import math

# ---------------- Constants (STARTING POINTS, all labelled in the report) ----------------
REACH_HALF_SAT = 200.0        # $M; reach01 = total/(total+K)
Q_CRIT_W, Q_AUD_W = 0.4, 0.6  # blended quality index weights

GAINQ_FLOOR, GAINQ_SPAN = 55.0, 30.0   # gainQ = clamp((q-55)/30, 0, 1.3)
LOSSQ_FLOOR, LOSSQ_SPAN = 60.0, 45.0   # lossQ = clamp((60-q)/45, 0, 1.4)

BEAT_COEF = 0.3
BEAT_MULT_LO, BEAT_MULT_HI = 0.8, 1.3

R_GAIN_COEF = 48.0
R_GAIN_CAP = 50.0
R_LOSS_COEF = 10.0
R_LOSS_CAP = 8.0
R_ROOM_EXP = 1.3
FLOOR_FRACTION = 0.35          # Recognition decay floor = FLOOR_FRACTION * RPeak
H_R_WEEKS = 1000.0             # ~19.2y half-life

M_GAIN_COEF = 55.0
M_GAIN_CAP = 55.0
M_LOSS_COEF = 85.0
M_LOSS_CAP = 80.0
H_M_WEEKS = 65.0               # ~1.25y half-life

SATIATION_Q0 = 75.0
SATIATION_SPAN = 35.0
F_GAIN_COEF = 80.0
F_GAIN_CAP = 45.0
F_RELIEF_COEF = 25.0
F_RELIEF_CAP = 25.0
F_ROOM_EXP = 0.7
H_F_WEEKS = 156.0              # ~3y half-life

ACTIVE_WINDOW = 104.0
DORMANCY_WEEKS = 156.0
REVIVAL_R_THRESHOLD = 40.0
COOLING_M_FLOOR = 5.0
FATIGUE_WARN = 55.0

REVIVAL_BONUS_MAX = 0.25

SIM_EXP = 1.2


def decay(value, rest, half_life_weeks, weeks):
    if weeks <= 0:
        return value
    return rest + (value - rest) * (0.5 ** (weeks / half_life_weeks))


def clamp(x, lo, hi):
    return max(lo, min(hi, x))


def q_blend(critic, audience):
    return Q_CRIT_W * critic + Q_AUD_W * audience


def gainQ(q):
    return clamp((q - GAINQ_FLOOR) / GAINQ_SPAN, 0.0, 1.3)


def lossQ(q):
    return clamp((LOSSQ_FLOOR - q) / LOSSQ_SPAN, 0.0, 1.4)


def beat_mult(beat):
    return clamp(1 + BEAT_COEF * (beat - 1), BEAT_MULT_LO, BEAT_MULT_HI)


def room(x, exp):
    return clamp((100.0 - x) / 100.0, 0.0, 1.0) ** exp


class Branch:
    def __init__(self, name, branch_type, week0, R=0.0, RPeak=0.0, M=0.0, F=0.0,
                 last_event_week=None, gap_before_last=None):
        self.name = name
        self.branch_type = branch_type
        self.R = R
        self.RPeak = RPeak
        self.M = M
        self.F = F
        self.last_event_week = last_event_week
        self.gap_before_last = gap_before_last
        self.week = week0
        self.log = []

    def floor_r(self):
        return FLOOR_FRACTION * self.RPeak

    def advance_weeks(self, weeks):
        if weeks <= 0:
            self.week += max(weeks, 0)
            return
        self.R = decay(self.R, self.floor_r(), H_R_WEEKS, weeks)
        self.M = decay(self.M, 0.0, H_M_WEEKS, weeks)
        self.F = decay(self.F, 0.0, H_F_WEEKS, weeks)
        self.week += weeks

    def weeks_since(self):
        if self.last_event_week is None:
            return 10_000  # never released
        return self.week - self.last_event_week

    def band(self):
        ws = self.weeks_since()
        gap = self.gap_before_last
        if ws >= DORMANCY_WEEKS:
            return "REVIVAL CANDIDATE" if self.R >= REVIVAL_R_THRESHOLD else "DORMANT"
        if ws < ACTIVE_WINDOW and gap is not None and gap >= DORMANCY_WEEKS:
            return "ACTIVE AGAIN"
        if ws < ACTIVE_WINDOW:
            return "ACTIVE" if (self.M >= COOLING_M_FLOOR and self.F < FATIGUE_WARN) else "COOLING"
        return "COOLING"

    def expect_mult(self):
        return clamp(1 + 0.006 * (self.R - 50) + 0.004 * self.M - 0.0035 * self.F, 0.6, 1.85)

    def awareness_input(self):
        ws = self.weeks_since()
        nostalgia = 0.0
        if ws >= ACTIVE_WINDOW:
            nostalgia = REVIVAL_BONUS_MAX * clamp((ws - ACTIVE_WINDOW) / DORMANCY_WEEKS, 0, 1) * (self.R / 100.0)
        return clamp(0.5 * (self.R / 100.0) + 0.3 * (self.M / 100.0) - 0.35 * (self.F / 100.0) + nostalgia, 0.0, 1.0)

    def apply_event(self, week, critic, audience, total, expected_total, opening, expected_opening,
                     similarity, continuation_type, label=""):
        # advance decay up to the event week first
        self.advance_weeks(week - self.week)

        q = q_blend(critic, audience)
        beat = total / expected_total
        bmult = beat_mult(beat)
        reach01 = total / (total + REACH_HALF_SAT)

        gQ = gainQ(q)
        lQ = lossQ(q)

        gain_r = R_GAIN_COEF * reach01 * gQ * bmult * room(self.R, R_ROOM_EXP)
        loss_r = R_LOSS_COEF * reach01 * lQ * (2 - bmult) * ((self.R / 100.0) ** 0.5)
        dR = clamp(gain_r - loss_r, -R_LOSS_CAP, R_GAIN_CAP)

        opening_beat = (opening / expected_opening) if expected_opening else beat
        opening_mult = clamp(1 + 0.5 * (opening_beat - 1), 0.6, 1.8)
        gain_m = M_GAIN_COEF * reach01 * gQ * opening_mult
        loss_m = M_LOSS_COEF * reach01 * lQ * clamp(2 - opening_mult, 0.4, 1.8)
        dM = clamp(gain_m - loss_m, -M_LOSS_CAP, M_GAIN_CAP)

        sat = clamp((SATIATION_Q0 - q) / SATIATION_SPAN, 0.0, 1.3)
        gain_f = F_GAIN_COEF * reach01 * sat * (similarity ** SIM_EXP) * room(self.F, F_ROOM_EXP)
        relief_f = F_RELIEF_COEF * reach01 * clamp((q - 75) / 25, 0, 1) * (self.F / 100.0)
        dF = clamp(gain_f - relief_f, -F_RELIEF_CAP, F_GAIN_CAP)

        self.gap_before_last = self.weeks_since() if self.last_event_week is not None else None
        self.R = clamp(self.R + dR, 0.0, 100.0)
        self.RPeak = max(self.RPeak, self.R)
        self.M = clamp(self.M + dM, -100.0, 100.0)
        self.F = clamp(self.F + dF, 0.0, 100.0)
        self.last_event_week = week

        self.log.append(dict(
            week=week, label=label, q=round(q, 1), beat=round(beat, 2),
            dR=round(dR, 2), dM=round(dM, 2), dF=round(dF, 2),
            R=round(self.R, 2), M=round(self.M, 2), F=round(self.F, 2),
            band=self.band(), expectMult=round(self.expect_mult(), 3),
            awareness=round(self.awareness_input(), 3),
        ))
        return self.log[-1]

    def snapshot(self, label=""):
        row = dict(week=self.week, label=label, q=None, beat=None, dR=None, dM=None, dF=None,
                   R=round(self.R, 2), M=round(self.M, 2), F=round(self.F, 2),
                   band=self.band(), expectMult=round(self.expect_mult(), 3),
                   awareness=round(self.awareness_input(), 3))
        self.log.append(row)
        return row


def print_case(title, rows):
    print(f"\n=== {title} ===")
    header = f"{'wk':>5} {'event':<28} {'q':>5} {'beat':>5} {'dR':>6} {'dM':>7} {'dF':>6} {'R':>6} {'M':>7} {'F':>6} {'band':<18} {'expMult':>7} {'aware':>6}"
    print(header)
    for r in rows:
        print(f"{r['week']:>5} {r['label']:<28} "
              f"{'' if r['q'] is None else r['q']:>5} "
              f"{'' if r['beat'] is None else r['beat']:>5} "
              f"{'' if r['dR'] is None else r['dR']:>6} "
              f"{'' if r['dM'] is None else r['dM']:>7} "
              f"{'' if r['dF'] is None else r['dF']:>6} "
              f"{r['R']:>6} {r['M']:>7} {r['F']:>6} {r['band']:<18} {r['expectMult']:>7} {r['awareness']:>6}")


# ---------------- CASE A ----------------
a = Branch("PropA-main", "main", week0=0)
r = a.apply_event(0, critic=85, audience=80, total=600, expected_total=300,
                   opening=198, expected_opening=90, similarity=0.0,
                   continuation_type="ORIGINAL", label="Film1 (original, enormous)")
a.advance_weeks(4)
snap4 = a.snapshot("Film2 dev starts (wk4)")
a.advance_weeks(60 - 4)
snap60 = a.snapshot("Film2 greenlight/release eve (wk60)")
print_case("CASE A: breakout original -> fast direct sequel (wk60)", [r, snap4, snap60])

# ---------------- CASE B ----------------
b = Branch("PropB-main", "main", week0=0)
r1 = b.apply_event(0, critic=80, audience=78, total=480, expected_total=300,
                    opening=126, expected_opening=90, similarity=0.0,
                    continuation_type="ORIGINAL", label="Film1 (smash)")
b.advance_weeks(52)
r2 = b.apply_event(52, critic=82, audience=80, total=620, expected_total=420,
                    opening=155, expected_opening=115, similarity=0.9,
                    continuation_type="DIRECT_SEQUEL", label="Film2 (smash, +52wk)")
b.advance_weeks(40)
snap_spinoff_eve = b.snapshot("Spin-off greenlight eve (+40wk)")
print_case("CASE B: two straight hits -> spin-off 40wk later", [r1, r2, snap_spinoff_eve])

# ---------------- CASE C ----------------
c = Branch("PropC-main", "main", week0=0)
r1 = c.apply_event(0, critic=90, audience=88, total=750, expected_total=320,
                    opening=210, expected_opening=95, similarity=0.0,
                    continuation_type="ORIGINAL", label="Film1 (iconic)")
c.advance_weeks(78)
r2 = c.apply_event(78, critic=45, audience=42, total=210, expected_total=350,
                    opening=45, expected_opening=100, similarity=0.9,
                    continuation_type="DIRECT_SEQUEL", label="Film2 (weak, +78wk)")
snap_after = c.snapshot("Right after Film2 flop")
print_case("CASE C: hit then flop", [r1, r2, snap_after])

# ---------------- CASE D ----------------
d = Branch("PropD-main", "main", week0=0)
rows_d = []
week = 0
for i in range(4):
    if i > 0:
        d.advance_weeks(40)
        week += 40
    rr = d.apply_event(week, critic=57, audience=56, total=270, expected_total=300,
                        opening=68, expected_opening=80,
                        similarity=(0.0 if i == 0 else 0.9),
                        continuation_type="DIRECT_SEQUEL" if i > 0 else "ORIGINAL",
                        label=f"Film{i+1} (mediocre)")
    rows_d.append(rr)
print_case("CASE D: rapid mediocrity x4 @ 40wk cadence", rows_d)

# ---------------- CASE E ----------------
e = Branch("PropE-main", "main", week0=0, R=70.0, RPeak=80.0, M=15.0, F=45.0, last_event_week=0)
snap0 = e.snapshot("Last release (major hit, established)")
e.advance_weeks(1040)
snap_dormant = e.snapshot("+1040wk (20y) dormant")
print_case("CASE E: long dormancy (20y) on a major property", [snap0, snap_dormant])

# ---------------- CASE F (fork from E) ----------------
f_branch = Branch("PropE-reboot-F", "reboot", week0=1040, R=e.R, RPeak=e.RPeak, M=0.0, F=0.0,
                   last_event_week=None)
# gap_before_last for the OLD main branch is what feeds ACTIVE AGAIN off the story property;
# the reboot is a NEW branch, so its own "gap_before_last" stays None (first release on this branch).
r_f = f_branch.apply_event(1040, critic=85, audience=82, total=560, expected_total=350,
                            opening=150, expected_opening=95, similarity=0.3,
                            continuation_type="REBOOT", label="Reboot (excellent)")
print_case("CASE F: successful reboot after 20y dormancy", [snap_dormant, r_f])

# ---------------- CASE G (fork from E) ----------------
g_branch = Branch("PropE-reboot-G", "reboot", week0=1040, R=e.R, RPeak=e.RPeak, M=0.0, F=0.0,
                   last_event_week=None)
r_g = g_branch.apply_event(1040, critic=40, audience=38, total=175, expected_total=350,
                            opening=45, expected_opening=95, similarity=0.3,
                            continuation_type="REBOOT", label="Reboot (poor)")
print_case("CASE G: failed reboot after 20y dormancy", [snap_dormant, r_g])

# Also show what happens to the OLD main branch's own state (untouched by the reboot fork)
print("\n--- Story-level check: old main branch state is untouched by reboot forks (F and G) ---")
print(f"PropE-main at wk1040 (unchanged by either reboot): R={e.R:.2f} M={e.M:.2f} F={e.F:.2f} band={e.band()}")

# Half-life sanity check
print("\n--- Half-life sanity check ---")
for label, h in [("M", H_M_WEEKS), ("F", H_F_WEEKS), ("R", H_R_WEEKS)]:
    print(f"{label}: half-life {h} weeks = {h/52.1775:.2f} years; after 1 half-life retains 50%, "
          f"after 2 half-lives {0.25*100:.0f}%")
