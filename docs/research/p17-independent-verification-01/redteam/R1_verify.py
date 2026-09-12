"""
R1 min-maxer red-team verification script. READ-ONLY paper arithmetic only.
Reuses the EXACT classes/constants from models/M1-final-synthesis-calc.py (the
report's chosen final RMF core) by importing it as a module (its top-level prints
just run once; harmless) and then driving its own Property/Branch classes with
new scenarios the seven canonical cases don't cover. No repo touched.
"""
import sys, math
import os
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "models")   # sibling models/ folder in the published package
sys.path.insert(0, MODELS_DIR)

import importlib.util
spec = importlib.util.spec_from_file_location(
    "m1final",
    os.path.join(MODELS_DIR, "M1-final-synthesis-calc.py"),
)
m1final = importlib.util.module_from_spec(spec)
import io, contextlib
buf = io.StringIO()
with contextlib.redirect_stdout(buf):   # swallow the module's own 7-case demo prints
    spec.loader.exec_module(m1final)

Property = m1final.Property
Branch = m1final.Branch
EXPECTED_TOTAL = m1final.EXPECTED_TOTAL

print("="*100)
print("ATTACK 1/2/3/4 ROOT CAUSE -- extended mediocre-spam stress test (20 releases, two cadences)")
print("="*100)
for cadence in [8, 15, 40]:
    p = Property(f"Spam@{cadence}wk")
    b = Branch("main", p, "main")
    print(f"\n-- cadence={cadence}wk, quality held at critic57/aud55 (q~0.436), box 0.9x forecast forever --")
    for i in range(20):
        wk = i * cadence
        ct = 'original' if i == 0 else 'direct_sequel'
        b.release(f"F{i+1}", wk, 57, 55, 0.9*EXPECTED_TOTAL, EXPECTED_TOTAL, ct)
        r, m, f, a, e = b.outputs(wk)
        if i in (0,1,2,3,4,7,11,15,19):
            print(f"  release#{i+1:>2} wk{wk:>4}: R={r:6.2f} M={m:7.2f} F={f:8.2f} aware={a:.3f} exp={e:.3f} band={b.band(wk)}")

print()
print("="*100)
print("Root-cause isolation: raw bestScore / residualScoreSum growth (why R ratchets with COUNT)")
print("="*100)
p2 = Property("Isolate")
b2 = Branch("main", p2, "main")
for i in range(6):
    wk = i*15
    b2.release(f"G{i+1}", wk, 57, 55, 0.9*EXPECTED_TOTAL, EXPECTED_TOTAL, 'original' if i==0 else 'direct_sequel')
    print(f"  after release#{i+1} (wk{wk}): bestScore={p2.bestScore:.6f} residualScoreSum={p2.residualScoreSum:.6f} "
          f"R_raw(now)={p2.R_raw(wk):.3f} rPeak={p2.rPeak:.3f}")
print("  -> raw per-release value (reach*q) is CONSTANT here (~0.521); bestScore/residual still both")
print("     grow every release because register_release compares TIME-INFLATED scores (raw*2^(t/HL_R)),")
print("     so a later release always 'outbids' an earlier one of IDENTICAL quality purely by being later,")
print("     and every outbid old peak is permanently banked into residualScoreSum at weight kappa_R=0.15.")

print()
print("="*100)
print("Sensitivity: does raising/lowering kappa_R change the qualitative conclusion?")
print("="*100)
for kappa in [0.05, 0.15, 0.30]:
    m1final.KAPPA_R = kappa
    p3 = Property(f"kappa={kappa}")
    b3 = Branch("main", p3, "main")
    for i in range(12):
        wk = i*15
        b3.release(f"H{i+1}", wk, 57, 55, 0.9*EXPECTED_TOTAL, EXPECTED_TOTAL, 'original' if i==0 else 'direct_sequel')
    r,m,f,a,e = b3.outputs(11*15)
    print(f"  kappa_R={kappa:.2f}: after 12 mediocre releases @15wk -> R={r:.2f} aware={a:.3f} (F internal={f:.1f})")
m1final.KAPPA_R = 0.15  # restore

print()
print("="*100)
print("ATTACK 9/10 -- reboot Fatigue reset: does a reboot immediately after a HEAVILY fatigued main")
print("branch (zero elapsed time, no dormancy at all) get F=0 for free in the actual final-synthesis code?")
print("="*100)
p4 = Property("RebootLaunder")
main4 = Branch("main", p4, "main")
wk = 0
for i in range(6):   # hammer the main branch with mediocre similar sequels to build up real Fatigue
    main4.release(f"M{i+1}", wk, 57, 55, 0.9*EXPECTED_TOTAL, EXPECTED_TOTAL, 'original' if i==0 else 'direct_sequel')
    wk += 15
r,m,f,a,e = main4.outputs(wk-15)
print(f"  main branch after 6 rapid mediocre sequels (wk{wk-15}): R={r:.2f} M={m:.2f} F={f:.2f} band={main4.band(wk-15)}")
reboot4 = Branch("reboot", p4, "reboot", parent=main4)
r2,m2,f2,a2,e2 = reboot4.outputs(wk-15)   # SAME week, zero dormancy, immediately after the last flop-ish sequel
print(f"  brand-new REBOOT branch opened the SAME WEEK (zero dormancy): R={r2:.2f} M={m2:.2f} F={f2:.2f} band={reboot4.band(wk-15)}")
print("  -> F resets to 0.00 with ZERO elapsed time and ZERO partial inheritance from the fatigued main branch.")
print("     Compare to M3's own explicit reboot rule (F0_new = gamma(0.2) x weighted-avg of prior branch F's) --")
print("     that formula is NOT present anywhere in this Branch class. Branch.__init__ hardcodes self.F=0.0")
print("     unconditionally for every new branch, main or reboot, regardless of the parent's own current Fatigue.")

print()
print("="*100)
print("ATTACK 1/9 compound -- does Fatigue reduce the CASH-facing awareness term at all, at any F?")
print("="*100)
p5 = Property("FatigueVsAwareness")
b5 = Branch("main", p5, "main")
b5.release("X1", 0, 57, 55, 0.9*EXPECTED_TOTAL, EXPECTED_TOTAL, 'original')
# force F to an extreme value directly to isolate the awareness formula's dependency on F
for forced_f in [0.0, 60.0, 150.0, 500.0]:
    b5.F = forced_f
    r,m,f,a,e = b5.outputs(0)
    print(f"  branch.F forced to {forced_f:7.1f} -> outputs: R={r:.2f} M={m:.2f} F(reported)={f:.2f} aware={a:.4f} exp={e:.4f}")
print("  -> 'aware' (the term that feeds P07's preMarketingAwarenessOf / real box office, per M2 Seam A)")
print("     is IDENTICAL across every value of F. Only 'exp' (the narrative/fame expectation bar) moves.")

print()
print("="*100)
print("ATTACK 4 -- once rPeak is spam-ratcheted to 100, how permanent is the floor, and via what mechanism?")
print("="*100)
p6 = Property("PermaFloor")
b6 = Branch("main", p6, "main")
wk = 0
for i in range(8):
    b6.release(f"Y{i+1}", wk, 57, 55, 0.9*EXPECTED_TOTAL, EXPECTED_TOTAL, 'original' if i==0 else 'direct_sequel')
    wk += 15
print(f"  rPeak after 8 mediocre spam releases: {p6.rPeak:.2f}  (FLOOR_FRAC={m1final.FLOOR_FRAC} -> floor={m1final.FLOOR_FRAC*p6.rPeak:.2f})")
for gap in [0, 260, 520, 1040, 2080]:
    r = p6.R_reported(wk-15+gap)
    print(f"    +{gap:5d}wk of total silence after the spam run -> R_reported={r:.2f}")
print("  -> the floor (35.0 at rPeak=100) was earned by EIGHT MEDIOCRE, forecast-missing (0.9x) films,")
print("     none of which was individually a hit; it is permanent for the ~1000wk R half-life horizon.")

print()
print("="*100)
print("ATTACK 5/13 -- SubProperty/crossover Recognition cap check (M4's combinedR, using ratchet-maxed inputs)")
print("="*100)
def combined_r(rs, decay=0.6, cap=100.0):
    rs_sorted = sorted(rs, reverse=True)
    total = sum(r*(decay**i) for i,r in enumerate(rs_sorted))
    return min(total, cap)
print("  Two independently ratchet-maxed properties (R=100 each) crossed over:")
print(f"    combinedR = {combined_r([100,100]):.1f}  (hard-capped; NOT infinite -- M4's cap genuinely bites)")
print("  BUT: M4 Part B.7 states a crossover is a one-off Production/FilmResult with NO stated cap on how many")
print("  times the SAME two maxed properties can cross over again later (crossovers are explicitly NOT branches,")
print("  so N_MAX_BRANCHES=8 does not bound them) -- so a near-100 awareness subsidy is repeatable indefinitely,")
print("  bounded only by cast-capacity/budget (P11/P13/P14), not by anything P17 tracks about crossover COUNT.")

print()
print("="*100)
print("EXPECTATION-MULTIPLIER FORMULA DIVERGENCE ACROSS THE THREE CANDIDATES (documentation cross-check)")
print("="*100)
print("  M1a: expMult = clamp(1 + 0.006*(R-50) + 0.004*M        - 0.0035*F,        0.6, 1.85)  <- CENTERED on R=50, signed M")
print("  M1b: expectationMultiplier = clamp(1 + 0.006*R + 0.004*max(M,0) - 0.005*F,        0.7, 2.0)   <- raw R, M clamped >=0")
print("  M1c: expectationMult = clamp(1 + 0.006*R + 0.004*M     - 0.006*min(F,100),        0.6, 1.8)   <- raw R, signed M unclamped")
print("  FINAL (this file): expect = clamp(1.0 + 0.006*R + 0.004*max(M,0) - 0.005*F, 0.7, 2.0)          <- matches M1b's convention")
for R,M,F in [(0,0,0),(0,-50,0),(50,0,0)]:
    a_centered = max(0.6, min(1.85, 1+0.006*(R-50)+0.004*M-0.0035*F))
    b_raw = max(0.7, min(2.0, 1+0.006*R+0.004*max(M,0)-0.005*F))
    c_raw_signed = max(0.6, min(1.8, 1+0.006*R+0.004*M-0.006*min(max(F,0),100)))
    print(f"  R={R:3d} M={M:4d} F={F:3d}: M1a(centered)={a_centered:.3f}  M1b/FINAL(raw,Mclamped)={b_raw:.3f}  M1c(raw,Msigned)={c_raw_signed:.3f}")
print("  -> at a BRAND NEW property (R=M=F=0) M1a's centered form gives a 0.7x DISCOUNTED bar (originals get an")
print("     easier bar than a franchise at R=0), while M1b/M1c/FINAL give exactly 1.0x (no originals discount).")
print("     This is a genuine, undocumented resolution of a real cross-model disagreement -- nothing in the")
print("     surviving texts explains why FINAL silently adopted M1b's convention over M1a's on this specific point.")
