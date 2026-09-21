#!/usr/bin/env python3
"""599-A paper route model: per-frame calc-bucket savings (layer L1, from the site TSV delta_A),
plus hand-listed dead/zero-subtree skips (L2) and pure-literal folding (L3).
Multiplicities come from reading the module (n=1, f=5, sets=2, external=0, adoptions=0,
placements=0, commitments=0, allSilent; founding lot). Paper only; nothing executed."""
import csv, sys
TSV = sys.argv[1]
delta = {}; cur = {}; method = {}
for r in csv.DictReader(open(TSV), delimiter='\t'):
    key = (int(r['line']), int(r['ord']))
    delta[key] = int(r['delta_A']) if r['delta_A'] not in ('None', '') else 0
    cur[key] = int(r['current_k']); method[key] = r['method']
    if delta[key] < 0: delta[key] = 0   # C1 may only fall; under-reserved sites are left as-is

def S(*keys):
    out = []
    for k in keys:
        if isinstance(k, tuple) and len(k) == 3:   # (line, first_ord, last_ord)
            out += [(k[0], o) for o in range(k[1], k[2] + 1)]
        else:
            out.append(k)
    return out

def L1(sites, mult=1):
    return sum(delta[s] for s in sites) * mult

SORTBILL5 = S((376,1)) * 3 + S((379,1), (380,1), (382,1,4), (383,1))
ORDERBILL = S((1143,1,3), (1144,1))               # sortBill(n=1) returns early: no sites
WFUPDATE = S((1107,1,3))
SMALL = S((1242,1), (1243,1), (1244,1,2), (1247,1,2), (1248,1,3), (1249,1,2), (1250,1))
ARRIVAL0 = S((1133,1,4))                           # possible = 0 assumed on every measured frame
FRAME_COMMON = S((1925,1,3)) + ARRIVAL0 + S((1954,1,2), (1955,1), (1962,1), (2007,1,3), (2012,1,2), (2013,1))

RESTRICTED_ALWAYS = S((1172,1), (1173,1,3), (1174,1,2), (1175,1), (1177,1,4), (1178,1), (1179,1,3), (1180,1,4)) + WFUPDATE + ORDERBILL
RESTR = {
    'o1': RESTRICTED_ALWAYS + S((1167,1)),                       # rT 8 (w1)
    't1': RESTRICTED_ALWAYS + S((1159,1), (1161,1), (1162,1)),   # rT 5 scheduled (w5; 538 w60)
    'c1': RESTRICTED_ALWAYS + S((1165,1)),                       # rT 3 (w7)
}
GENERAL_COMMON = S((1482,1,2), (1483,1,3), (1486,1,4)) + WFUPDATE + S((1511,1), (1585,1,2), (1590,1,3), (1591,1,5), (1592,1,2), (1593,1,2), (1595,1,3)) + ORDERBILL
ALLOC_COMMON = S((1198,1,4), (1201,1,2), (1202,1,3), (1203,1,2), (1204,1,4), (1208,1,2), (1209,1,3), (1210,1), (1235,1,2)) + SORTBILL5
GEN = {
    'retainedDev': GENERAL_COMMON + S((1493,1,3), (1499,1), (1524,1), (1525,1), (1528,1)) + SMALL
                   + ALLOC_COMMON + S((1227,1,4), (1228,1,2), (1236,1,2)),
    'wrapSingle':  GENERAL_COMMON + S((1494,1,2), (1495,1,2), (1540,1), (1578,1)) + SMALL * 2
                   + ALLOC_COMMON + S((1196,1), (1197,1,2), (1218,1), (1219,1,3), (1225,1,2), (1236,1,2)),
    'postExit':    GENERAL_COMMON + S((1494,1), (1499,1), (1581,1)) + SMALL * 2
                   + ALLOC_COMMON + S((1196,1), (1197,1,2)),
}
SE_COMMON = S((1320,1,2), (1321,1,2), (1322,1), (1323,1), (1324,1,2), (1328,1)) + WFUPDATE + S((1331,1), (1341,1), (1342,1,2), (1343,1,3), (1346,1,2), (1347,1,2)) + SORTBILL5 \
            + S((1364,1), (1365,1,2), (1371,1,2), (1372,1), (1381,1), (1382,1), (1392,1), (1396,1,2), (1406,1), (1417,1), (1422,1,2), (1423,1)) + ORDERBILL + S((1425,1)) + SMALL
SE = {
    'rT7': SE_COMMON + S((1265,1,2)) + S((1355,1), (1360,1), (1377,1), (1378,1), (1379,1,2), (1380,1,3), (1399,1)) + SMALL + S((1407,1), (1408,1,2), (1414,1)),
    'rT6': SE_COMMON + S((1413,1,2), (1416,1)),
}
CMD_ASSIGN = S((1838,1,4)) + WFUPDATE + S((1845,1,3)) + ARRIVAL0
CMD_SCHEDULE = S((1838,1,4)) + WFUPDATE

# ---- L2: dead / structurally-zero subtree skips (units beyond L1, i.e. after right-sizing), per evaluation
# sweepBill non-general phaseTransitions arms: keyLength+keyConstruction+transition dead (:1483/:1486)
L2_SWEEP_DEAD = 166          # H1: 246 today minus the 80 already removed by L1 at those sites; general path +0 (inline arm)
L2_RESTR_WFUPDATE = 126      # H4: (1178,1) t+r == 0 as a separate guarded statement + pay(14): 140 - 14; nonzero path -14
L2_RESTR_O = 80              # H5: (1174,1) o == 0 separate guarded statement + pay(10): 90 - 10; nonzero path -10
L2_ALLOC_RAW0 = 38 + 134     # H2: raw guards (+38 zero / -32 nonzero) + occupancy guards (+134 zero / -16 nonzero), rawOwners=0 & occupied=0
L2_ALLOC_OCC0 = 134          # H2 occupancy guards only (retainedDev: occupied=0, claims=1)
L2_ALLOC_ADOPT0 = 0          # adoption/placement guards: +28 zero / -24 nonzero -> EXCLUDED (marginal)
L2_ALLOC_SEL0 = 0            # selection guard: +16 zero / -2 nonzero -> EXCLUDED (marginal)
L2_SE_RAW0 = 96              # H6: (1342,1..2) shooting-guarded separate statement + pay(6): 102 - 6; rT6 path -6
L2_SE_EXT0 = 96              # H7: (1343,1..3) external-guarded separate statement + pay(10): 106 - 10
L2_SE_T0 = 0                 # (1346,2) t guard: +18 zero / -8 nonzero -> EXCLUDED (marginal)
L2_SMALL_PAIRS0 = 98 - 18    # H3: (1248,1..3)+(1249,1..2) before*after=0 separate guarded statement + pay(18)
L2_SMALL_PAIRS_NZ = -18                     # nonzero calls pay the guard
# ---- L3: pure-literal folding (module-init constants; values identical)
L3_RESTR_EQ14 = 28                           # (1179,2)
L3_SE_CONSTS = 28 + 28 + 72 + (32 + 52)      # (1321,1..2) (1322,1) (1392,1): capabilityText/phaseText/capabilityKey/release
L3_RETAINED_RELEASE = 32 + 52 + 28 + 72      # (1493,1..3) whole literal subtree
L3_RETENTION_SINGLEWRAP = 16 + 28 + 72       # (1225,1..2) whole literal subtree
L3_KEY219 = 72                                # (1228,1) / (1230,1) keyBill(2,19)

def frame(kind):
    l1 = L1(FRAME_COMMON); l2 = 0; l3 = 0; note = []
    if kind == 'w1':
        l1 += L1(RESTR['o1']); l2 += L2_RESTR_WFUPDATE - 10; l3 += L3_RESTR_EQ14
    elif kind == 'w5':
        l1 += L1(RESTR['t1']); l2 += L2_RESTR_O - 14; l3 += L3_RESTR_EQ14
    elif kind == 'w7':
        l1 += L1(RESTR['c1']); l2 += L2_RESTR_WFUPDATE + L2_RESTR_O; l3 += L3_RESTR_EQ14
    elif kind == 'w2':
        l1 += L1(GEN['retainedDev']); l2 += L2_SWEEP_DEAD + L2_ALLOC_OCC0 + L2_ALLOC_ADOPT0 + L2_ALLOC_SEL0 + L2_SMALL_PAIRS_NZ
        l3 += L3_RETAINED_RELEASE + L3_KEY219
    elif kind == 'w3':
        l1 += L1(SE['rT7']); l2 += L2_SE_RAW0 + L2_SE_EXT0 + L2_SE_T0 + 2 * L2_SMALL_PAIRS0; l3 += L3_SE_CONSTS
    elif kind == 'w4':
        l1 += L1(SE['rT6']); l2 += L2_SE_EXT0 + L2_SMALL_PAIRS_NZ - 6; l3 += L3_SE_CONSTS
    elif kind == 'w6':
        l1 += L1(GEN['wrapSingle']); l2 += L2_SWEEP_DEAD + L2_ALLOC_RAW0 + L2_ALLOC_ADOPT0 + 2 * L2_SMALL_PAIRS0
        l3 += L3_RETENTION_SINGLEWRAP
    elif kind == 'w8':
        l1 += L1(GEN['postExit']); l2 += L2_SWEEP_DEAD + L2_ALLOC_RAW0 + L2_ALLOC_ADOPT0 + 2 * L2_SMALL_PAIRS0
    return l1, l2, l3

def commands():
    return L1(CMD_ASSIGN) + L1(CMD_SCHEDULE), 0, 0

print('per-frame (L1 buckets, L2 dead/zero skips, L3 literal folding, total):')
tot = {}
for k in ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8']:
    a, b, c = frame(k); tot[k] = (a, b, c, a + b + c)
    print(f'  {k}: L1 {a:5d}  L2 {b:5d}  L3 {c:5d}  total {a+b+c:5d}')
ca, cb, cc = commands(); print(f'  two commands at w5: L1 {ca}  total {ca}')
stale = sum(tot[k][3] for k in tot) + ca
stale_l1 = sum(tot[k][0] for k in tot) + ca
print(f'STALE route (8 sweep bills + 2 commands): L1 {stale_l1}  all layers {stale}')
ft = sum(tot[k][3] for k in ['w1', 'w2', 'w3', 'w4', 'w5', 'w6']) + ca
ft_l1 = sum(tot[k][0] for k in ['w1', 'w2', 'w3', 'w4', 'w5', 'w6']) + ca
print(f'FIRST-TAKE route (6 frames + 2 commands): L1 {ft_l1}  all layers {ft}')
s538 = tot['w5'][3] + tot['w6'][3]; s538_l1 = tot['w5'][0] + tot['w6'][0]
print(f'538 scenario 1 (frames rT5 + rT4, no commands; prepare separate): L1 {s538_l1}  all layers {s538}')
# prepare-time: sortBill(5) once (facilities sorted at prepare via sorted()), company() per picture, writers per project(?), :783 per picture, sortedOutput :432 per in-order uniqueIds call (4 calls)
prep = L1(SORTBILL5) + L1(S((516,1,3), (517,1,2))) + L1(S((783,1))) + 4 * L1(S((432,1,2)))
print(f'PREPARE-only L1 (sortBill(5) x1, company x1, :783 x1, sortedOutput x4; writers not on a Started prepare): {prep}')
print('cumulative used at the w8 sweep reservation today: 194726 + 5765 requested = 200491 (> 200000 by 491)')
print(f'w8 sweep reservation: today 200491 needed; after C1 prefix saving {stale + prep} -> {200491 - stale - prep} (fits the w8 reservation; the route still needs ~28k (598) to complete, so it cuts later)')
