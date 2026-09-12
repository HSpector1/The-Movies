def fame_reach(f, half=50):
    return f / (f + half)

def salary(s, f):
    return 25000 + 150000*s**2 + 600000*f**2

def castslot_exec(skill, rolefit):
    return 0.6*skill + 0.4*100*rolefit

CAST_WEIGHT = {'lead':1.0,'antagonist':0.6,'support':0.35}

# --- baseline three principals ---
fames = {'lead':40,'antagonist':25,'support':15}
num0 = sum(CAST_WEIGHT[k]*fame_reach(fames[k]) for k in CAST_WEIGHT)
den0 = sum(CAST_WEIGHT.values())
val0 = 100*num0/den0
print("baseline starDrawOpening (weighted-avg form) =", round(val0,3))

# check vs plain starDraw (linear fame, not fameReach) for sanity
num_lin = sum(CAST_WEIGHT[k]*fames[k]/100 for k in CAST_WEIGHT)
val_lin = 100*num_lin/den0
print("baseline linear starDraw (whole-run) =", round(val_lin,3))

# --- weighted-average generalization: add cameos as extra rank-decayed weighted terms ---
decay = 0.5
def add_cameo_series(num0, den0, fame_c, fit_c, n):
    num, den = num0, den0
    out = []
    for k in range(1, n+1):
        w = decay**(k-1) * fit_c
        num += w*fame_reach(fame_c)
        den += w
        out.append(100*num/den)
    return out

print("\n-- stacking identical fame-90 cameos, perfect segment fit --")
series = add_cameo_series(num0, den0, 90, 1.0, 5)
prev = val0
for i,v in enumerate(series,1):
    print(f"after cameo #{i}: starDrawOpening={v:.2f}  delta={v-prev:+.2f}")
    prev = v

fee90 = 0.35*salary(0.2, 0.90)
print("\nflat fee per fame-90 cameo (s=0.2, fee frac 0.35):", round(fee90,0))

print("\n-- single off-segment famous cameo example (fame85, fit .4) vs on-segment lead(40) --")
num1 = num0 + (1.0*0.4)*fame_reach(85)
den1 = den0 + 1.0*0.4
val1 = 100*num1/den1
print("with cameo weighted-avg form:", round(val1,3), " delta vs baseline:", round(val1-val0,3))

# performance-value side (Q2 worked example check)
principals_exec = {'lead':(70,0.8),'antagonist':(65,0.75),'support':(60,0.70)}
numE = sum(CAST_WEIGHT[k]*castslot_exec(*principals_exec[k]) for k in CAST_WEIGHT)
denE = sum(CAST_WEIGHT.values())
castExec0 = numE/denE
print("\ncastExecution (3 principals) =", round(castExec0,2))
cameo_exec = castslot_exec(20,0.3)
CAST_WEIGHT_cameo = 0.10
castExec1 = (denE*castExec0 + CAST_WEIGHT_cameo*cameo_exec)/(denE+CAST_WEIGHT_cameo)
print("castExecution (+cameo, weight .10) =", round(castExec1,2), " delta=", round(castExec1-castExec0,3))
craft_delta = 0.2*(castExec1-castExec0)
print("craft delta (weight .2) =", round(craft_delta,3), " approx criticMean delta (x0.65) =", round(0.65*craft_delta,3))
