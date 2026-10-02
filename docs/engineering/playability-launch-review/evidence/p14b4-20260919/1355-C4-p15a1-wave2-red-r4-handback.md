# 1355-C4: P15A.1 Wave 2 RED, revision r4 (1355-F6 items 1-3)

**Status: DONE, measured.** In `tree/`, branch `main` moves from 3b0b0b5 (r3) to 5952d5f in two commits, both in
`tests/helpers/p15a1-market-route.ts`. On r4 every held-route premise holds by week 30, at the same week on the
reference and on unchanged production, and every rival-route premise holds on the reference by week 66. On r4 `main`
plus ref3's `src`, the three integration files give 53 passed and 6 FIXTURE PENDING (59), the count 1355-C3
expected. The 13 route-premise failures of 1355-X are gone. The r4 patch passes `git apply --check` at real HEAD
af315499, which has no `src`, `generated` or `tests` drift since 1063ab4f.

## Changes

| Item (1355-F6) | Change | Commit |
|---|---|---|
| 1, slate | `pickStaff` skips any person a studio employs (`studioEmployerId(state, id) !== null`). The plan, order, weeks, shape and budgets stay as in r3 | 92b355a |
| 1, seed | `MARKET_ROUTE_SEED` moves from `p15a1-w2-market-01` to `p15a1-w2-market-03` | 5952d5f |
| 1, start week and cap | Unchanged: the slate starts at week 0 and `ROUTE_CAP_WEEK` stays 160 | none |
| 1, rival route | Unchanged: `RIVAL_ROUTE_SEED` stays `p15a1-w2-market-02` | none |
| 1, producer | No r4 producer. `1355-P-p15a1-market-producer-r3.ts` imports `MARKET_ROUTE_SEED` and `kRoute()` from the helper and mints K1 and K2 from them at mint time. Its capture ceiling mirrors the cap, which stays 160 | none |
| 2, probe | `1355-r4-route-probe.test.ts.txt`, run as `tests/zz-p15a1-route-probe.test.ts`; never committed | outside the patch |
| Classification | The 17 rows that read the held route gain a `route` field: premise, week, the 1355-F6 basis and the r3 outcome. A top-level `route` block declares each choice and the measured weeks. Summary counts unchanged | r4 JSON |

Unchanged: the 59 leaves and their RED reasons, the six fixture-pending leaves, `tests/helpers/p15-roots.ts`, every
re-pin declaration of 1355-C3, and 1355-F5's lookup rule. The r4 patch differs from r3's in the helper only.

## The route and its reasons

- **Seed `p15a1-w2-market-03`**, the next seed in the record's series after `-01` (r3's held route) and `-02` (the
  rival route). The probe shows every premise on it. `-01` cannot serve: its rivals greenlight nothing through week
  159, with or without the slate (stall finding 1). `-02` cannot serve either. Four rival pictures release there at
  week 12 and two share a genre, so the first due week is already pressured and `kRoute` throws "the first due week
  12 is already pressured, so no K2 week precedes K1" (probe run 2 on the reference).
- **The slate seats nobody a studio employs.** r3's rule filled 16 of the slate's 28 seats from the four rivals' own
  entry teams (stall finding 2). Under the r4 rule every held credit reads `credits a studio employs: 0`, and on `-03`
  the industry releases in the same weeks with the slate as without it (probe B).
- **Start week and cap unchanged.** The held-route premises hold by week 30 and the rival-route premises by week 66,
  inside the cap of 160. The slate does not move the industry, so a later start would only delay the held pictures'
  ready weeks.

## Premise weeks (reference and unchanged production agree)

| Premise | Week | Leaves |
|---|---|---|
| `routeAt(30)` | 30 (the route starts at week 7) | RED 3 leaf 1 |
| `twinWeek()` | 9 | RED 8; atomicity, player second subject |
| `kRoute().k2` | 12: four rival releases, drama, horror, adventure, romance | both K2 leaves |
| `kRoute().k1` | 21: a natural pair, committed null | both K1 leaves |
| `pairWeek()` | 21: r03's horror picture with held `prod-0005` | RED 4, RED 5 (2), RED 6, RED 9 (2); atomicity rival subject, witness, both call sites |
| `soloWeek()` | 26 | RED 7 |
| `rivalRouteAt(66)` | 66: sibling top 28 above market top 27 | cross-root leaf |
| `capturePremise` (RED 16 ramp) | 30; the paired picture releases at week 30, inside [30, 55] | RED 16 leaf 2; the producer |

At K1 the due set is r01 comedy, r02 comedy, r03 horror and r04 romance. The two comedies form a same-week pair,
and the horror and romance pictures meet the week-12 releases of their genres. On unchanged production (base `src`)
the probe prints the same week for every held-route premise and the same K2 and K1 due sets. The two industries
match through week 102 and part at week 103, after the reference's pressure has moved rival money since week 21. The
cross-root line fails on unchanged production by design: no P15 root exists below the step. Since the premises hold
there, the 13 leaves that stopped on the route in 1355-X's RED run now reach their classified RED reasons. I infer
this from the probe; I ran no RED file on unchanged production.

## Probe output (reference: ref3's `src` under r4 `main`, final helper)

The parent's run, from a clean `main`:

```
T=/Users/zacheryspector/studio-scratch/1355-red/tree; cd $T && git checkout -q main && git status --porcelain   # prints nothing
git checkout ref3 -- src
cp ../1355-r4-route-probe.test.ts.txt tests/zz-p15a1-route-probe.test.ts
PROBE_SRC=reference node_modules/.bin/vitest run --project core tests/zz-p15a1-route-probe.test.ts
rm tests/zz-p15a1-route-probe.test.ts && git reset -q -- src && git checkout -- src && git clean -fdq src
```

Section A reads only the helper's exports. Section B rebuilds r3's slate with r3's `pickStaff` copied into the probe
(plus a flag for the r4 line) and runs three variants on three seeds. Cells read `week:inFlight/greenlit/released`
for rival pictures. Output, verbatim:

```
stdout | tests/zz-p15a1-route-probe.test.ts > A: the r4 route premises and the industry by week
A. src reference; held route seed p15a1-w2-market-03; rival route seed p15a1-w2-market-02; cap 160
held prod-0000 comedy (twin), ready week 8; credits a studio employs: 0
held prod-0001 comedy (twin), ready week 9; credits a studio employs: 0
held prod-0002 drama, ready week 10; credits a studio employs: 0
held prod-0003 crime, ready week 11; credits a studio employs: 0
held prod-0004 romance, ready week 12; credits a studio employs: 0
held prod-0005 horror, ready week 13; credits a studio employs: 0
held prod-0006 adventure, ready week 14; credits a studio employs: 0
routeAt(30), RED 3 leaf 1: first route week 7; week 30 reached true
pairWeek: week 21: rival studio-be7356c7-r03:film:1 (horror) with held prod-0005; 4 rival pictures due; 6 other held pictures ready
twinWeek: week 9: twins prod-0000, prod-0001 (comedy); 0 rival pictures due
soloWeek: week 26: held prod-0002 (drama); 0 rival pictures due
kRoute: K2 week 12 (due studio-be7356c7-r01:film:0 drama, studio-be7356c7-r02:film:0 horror, studio-be7356c7-r03:film:0 adventure, studio-be7356c7-r04:film:0 romance); K1 week 21 (due studio-be7356c7-r01:film:1 comedy, studio-be7356c7-r02:film:1 comedy, studio-be7356c7-r03:film:1 horror, studio-be7356c7-r04:film:1 romance; committed null)
held route player cash at week 160: -22,887,019
held route industry, week:inFlight/greenlit/released
  7:4/0/0 8:4/0/0 9:4/0/0 10:4/0/0 11:4/0/0 12:4/0/4 13:0/4/0 14:4/0/0 15:4/0/0 16:4/0/0
  17:4/0/0 18:4/0/0 19:4/0/0 20:4/0/0 21:4/0/4 22:0/4/0 23:4/0/0 24:4/0/0 25:4/0/0 26:4/0/0
  27:4/0/0 28:4/0/0 29:4/0/0 30:4/0/4 31:0/4/0 32:4/0/0 33:4/0/0 34:4/0/0 35:4/0/0 36:4/0/0
  37:4/0/0 38:4/0/0 39:4/0/4 40:0/4/0 41:4/0/0 42:4/0/0 43:4/0/0 44:4/0/0 45:4/0/0 46:4/0/0
  47:4/0/0 48:4/0/4 49:0/4/0 50:4/0/0 51:4/0/0 52:4/0/0 53:4/0/0 54:4/0/0 55:4/0/0 56:4/0/0
  57:4/0/4 58:0/4/0 59:4/0/0 60:4/0/0 61:4/0/0 62:4/0/0 63:4/0/0 64:4/0/0 65:4/0/0 66:4/0/4
  67:0/4/0 68:4/0/0 69:4/0/0 70:4/0/0 71:4/0/0 72:4/0/0 73:4/0/0 74:4/0/0 75:4/0/4 76:0/4/0
  77:4/0/0 78:4/0/0 79:4/0/0 80:4/0/0 81:4/0/0 82:4/0/0 83:4/0/0 84:4/0/4 85:0/4/0 86:4/0/0
  87:4/0/0 88:4/0/0 89:4/0/0 90:4/0/0 91:4/0/0 92:4/0/0 93:4/0/4 94:0/4/0 95:4/0/0 96:4/0/0
  97:4/0/0 98:4/0/0 99:4/0/0 100:4/0/0 101:4/0/0 102:4/0/4 103:0/3/0 104:3/0/0 105:3/0/0 106:3/1/0
  107:4/0/0 108:4/0/0 109:4/0/0 110:4/0/0 111:4/0/3 112:1/3/0 113:4/0/0 114:4/0/1 115:3/0/0 116:3/0/0
  117:3/0/0 118:3/1/0 119:4/0/0 120:4/0/3 121:1/3/0 122:4/0/0 123:4/0/0 124:4/0/0 125:4/0/0 126:4/0/1
  127:3/0/0 128:3/0/0 129:3/0/3 130:0/3/0 131:3/0/0 132:3/0/0 133:3/0/0 134:3/0/0 135:3/0/0 136:3/0/0
  137:3/0/0 138:3/0/3 139:0/3/0 140:3/0/0 141:3/0/0 142:3/0/0 143:3/0/0 144:3/0/0 145:3/0/0 146:3/0/0
  147:3/0/3 148:0/3/0 149:3/0/0 150:3/0/0 151:3/0/0 152:3/0/0 153:3/0/0 154:3/0/0 155:3/0/0 156:3/0/3
  157:0/3/0 158:3/1/0 159:4/0/0
  weeks 7-159: 64 greenlights, 64 releases; release weeks [12, 21, 30, 39, 48, 57, 66, 75, 84, 93, 102, 111, 114, 120, 126, 129, 138, 147, 156]
RED 3 leaf 2: week 4: no release due, a rival greenlights
RED 12: 11 rival-route weeks with a release in [0, 80)
RED 13: week 21: a release in the last 25 weeks and one due
RED 14, RED 16 leaf 4, phases: rivalRouteAt(70): 25 releases in 10 weeks before week 70
rivalRouteAt(66), cross-root leaf: week 66: sibling top 28 > market top 27
capturePremise, RED 16 ramp: week 30: recent studio-315405e1-r01:film:0, in flight studio-315405e1-r03:film:2 (horror); paired release week 30, window [30, 55]
rival route industry, week:inFlight/greenlit/released
  0:0/0/0 1:0/0/0 2:0/0/0 3:0/0/0 4:0/4/0 5:4/0/0 6:4/0/0 7:4/0/0 8:4/0/0 9:4/0/0
  10:4/0/0 11:4/0/0 12:4/0/4 13:0/3/0 14:3/0/0 15:3/0/0 16:3/1/0 17:4/0/0 18:4/0/0 19:4/0/0
  20:4/0/0 21:4/0/3 22:1/3/0 23:4/0/0 24:4/0/1 25:3/0/0 26:3/0/0 27:3/0/0 28:3/1/0 29:4/0/0
  30:4/0/3 31:1/3/0 32:4/0/0 33:4/0/0 34:4/0/0 35:4/0/0 36:4/0/1 37:3/0/0 38:3/0/0 39:3/0/3
  40:0/4/0 41:4/0/0 42:4/0/0 43:4/0/0 44:4/0/0 45:4/0/0 46:4/0/0 47:4/0/0 48:4/0/4 49:0/2/0
  50:2/0/0 51:2/0/0 52:2/2/0 53:4/0/0 54:4/0/0 55:4/0/0 56:4/0/0 57:4/0/2 58:2/2/0 59:4/0/0
  60:4/0/2 61:2/0/0 62:2/0/0 63:2/0/0 64:2/0/0 65:2/0/0 66:2/0/2 67:0/2/0 68:2/0/0 69:2/0/0
  70:2/0/0 71:2/0/0 72:2/0/0 73:2/0/0 74:2/0/0 75:2/0/2 76:0/2/0 77:2/0/0 78:2/0/0 79:2/0/0
  80:2/0/0 81:2/0/0 82:2/0/0 83:2/0/0 84:2/0/2 85:0/2/0 86:2/0/0 87:2/0/0 88:2/0/0 89:2/0/0
  90:2/0/0 91:2/0/0 92:2/0/0 93:2/0/2 94:0/2/0 95:2/1/0 96:3/0/0 97:3/0/0 98:3/0/0 99:3/0/0
  100:3/0/0 101:3/0/0 102:3/0/2 103:1/2/1 104:2/0/0 105:2/0/0 106:2/0/0 107:2/0/0 108:2/0/0 109:2/0/0
  110:2/0/0 111:2/0/2 112:0/2/0 113:2/0/0 114:2/0/0 115:2/0/0 116:2/0/0 117:2/0/0 118:2/0/0 119:2/0/0
  120:2/0/2 121:0/2/0 122:2/0/0 123:2/0/0 124:2/0/0 125:2/0/0 126:2/0/0 127:2/0/0 128:2/0/0 129:2/0/2
  130:0/2/0 131:2/0/0 132:2/0/0 133:2/0/0 134:2/0/0 135:2/1/0 136:3/0/0 137:3/0/0 138:3/0/2 139:1/2/0
  140:3/0/0 141:3/0/0 142:3/0/0 143:3/0/1 144:2/0/0 145:2/0/0 146:2/0/0 147:2/0/2 148:0/2/0 149:2/0/0
  150:2/0/0 151:2/0/0 152:2/0/0 153:2/0/0 154:2/0/0 155:2/0/0 156:2/0/2 157:0/1/0 158:1/0/0 159:1/0/0
  weeks 0-159: 48 greenlights, 47 releases; release weeks [12, 21, 24, 30, 36, 39, 48, 57, 60, 66, 75, 84, 93, 102, 103, 111, 120, 129, 138, 143, 147, 156]

stdout | tests/zz-p15a1-route-probe.test.ts > B: why the r3 held route stalls (seeds -01, -02, -03; r3 slate, r4 slate, no slate)
B. src reference
seed p15a1-w2-market-01: baseMarketValue 23,554,590; the 4 rivals employ 24 people, 24 of them the last 24 of 84 entries of state.talent
 r3 slate: rival employees in 16 of 28 seats; weeks 7-159: 0 greenlights, 0 releases; release weeks []; screenplayShelved receipts 0; player cash at 160 -20,490,529
  week 30 r01 productions 0; screenplays ready 2; shelved 0; seatable director 0/1, actor 0/3, craft 1/1; on the player's slate 4
  week 30 r02 productions 0; screenplays ready 2; shelved 0; seatable director 0/1, actor 0/3, craft 1/1; on the player's slate 4
  week 30 r03 productions 0; screenplays ready 2; shelved 0; seatable director 0/1, actor 0/3, craft 1/1; on the player's slate 4
  week 30 r04 productions 0; screenplays ready 2; shelved 0; seatable director 0/1, actor 0/3, craft 1/1; on the player's slate 4
  week 160 rival cash: r01 9,883,837; r02 7,023,578; r03 172,707; r04 -4,575,084
 r4 slate: rival employees in 0 of 28 seats; weeks 7-159: 0 greenlights, 0 releases; release weeks []; screenplayShelved receipts 28 (first week 15); player cash at 160 -20,944,922
  week 30 r01 productions 0; screenplays ready 2; shelved 2; seatable director 1/1, actor 3/3, craft 1/1; on the player's slate 0
  week 30 r02 productions 0; screenplays ready 2; shelved 2; seatable director 1/1, actor 3/3, craft 1/1; on the player's slate 0
  week 30 r03 productions 0; screenplays ready 2; shelved 2; seatable director 1/1, actor 3/3, craft 1/1; on the player's slate 0
  week 30 r04 productions 0; screenplays ready 2; shelved 2; seatable director 1/1, actor 3/3, craft 1/1; on the player's slate 0
  week 160 rival cash: r01 9,883,837; r02 7,023,578; r03 172,707; r04 -4,575,084
 no slate: rival employees in 0 of 0 seats; weeks 0-159: 0 greenlights, 0 releases; release weeks []; screenplayShelved receipts 28 (first week 15); player cash at 160 20,000,000
  week 30 r01 productions 0; screenplays ready 2; shelved 2; seatable director 1/1, actor 3/3, craft 1/1; on the player's slate 0
  week 30 r02 productions 0; screenplays ready 2; shelved 2; seatable director 1/1, actor 3/3, craft 1/1; on the player's slate 0
  week 30 r03 productions 0; screenplays ready 2; shelved 2; seatable director 1/1, actor 3/3, craft 1/1; on the player's slate 0
  week 30 r04 productions 0; screenplays ready 2; shelved 2; seatable director 1/1, actor 3/3, craft 1/1; on the player's slate 0
  week 160 rival cash: r01 9,883,837; r02 7,023,578; r03 172,707; r04 -4,575,084
seed p15a1-w2-market-02: baseMarketValue 42,486,846; the 4 rivals employ 24 people, 24 of them the last 24 of 84 entries of state.talent
 r3 slate: rival employees in 16 of 28 seats; weeks 7-159: 0 greenlights, 0 releases; release weeks []; screenplayShelved receipts 0; player cash at 160 -20,565,959
  week 30 r01 productions 0; screenplays ready 2; shelved 0; seatable director 0/1, actor 0/3, craft 1/1; on the player's slate 4
  week 30 r02 productions 0; screenplays ready 2; shelved 0; seatable director 0/1, actor 0/3, craft 1/1; on the player's slate 4
  week 30 r03 productions 0; screenplays ready 2; shelved 0; seatable director 0/1, actor 0/3, craft 1/1; on the player's slate 4
  week 30 r04 productions 0; screenplays ready 2; shelved 0; seatable director 0/1, actor 0/3, craft 1/1; on the player's slate 4
  week 160 rival cash: r01 12,380,567; r02 3,237,540; r03 -19,166; r04 -2,397,632
 r4 slate: rival employees in 0 of 28 seats; weeks 7-159: 44 greenlights, 47 releases; release weeks [12, 21, 24, 30, 36, 39, 48, 57, 60, 66, 75, 84, 93, 102, 103, 111, 120, 129, 138, 143, 147, 156]; screenplayShelved receipts 7 (first week 51); player cash at 160 -20,342,540
  week 30 r01 productions 1; screenplays produced 2, inProduction 1, ready 1; shelved 0; seatable director 0/1, actor 0/3, craft 0/1; on the player's slate 0
  week 30 r02 productions 1; screenplays produced 2, inProduction 1, ready 1; shelved 0; seatable director 0/1, actor 0/3, craft 0/1; on the player's slate 0
  week 30 r03 productions 1; screenplays produced 2, inProduction 1, ready 1; shelved 0; seatable director 0/1, actor 0/3, craft 0/1; on the player's slate 0
  week 30 r04 productions 1; screenplays produced 2, ready 1, inProduction 1; shelved 0; seatable director 0/1, actor 0/3, craft 0/1; on the player's slate 0
  week 160 rival cash: r01 12,801,659; r02 16,216,319; r03 6,972,818; r04 -2,267,738
 no slate: rival employees in 0 of 0 seats; weeks 0-159: 48 greenlights, 47 releases; release weeks [12, 21, 24, 30, 36, 39, 48, 57, 60, 66, 75, 84, 93, 102, 103, 111, 120, 129, 138, 143, 147, 156]; screenplayShelved receipts 7 (first week 51); player cash at 160 20,000,000
  week 30 r01 productions 1; screenplays produced 2, inProduction 1, ready 1; shelved 0; seatable director 0/1, actor 0/3, craft 0/1; on the player's slate 0
  week 30 r02 productions 1; screenplays produced 2, inProduction 1, ready 1; shelved 0; seatable director 0/1, actor 0/3, craft 0/1; on the player's slate 0
  week 30 r03 productions 1; screenplays produced 2, inProduction 1, ready 1; shelved 0; seatable director 0/1, actor 0/3, craft 0/1; on the player's slate 0
  week 30 r04 productions 1; screenplays produced 2, ready 1, inProduction 1; shelved 0; seatable director 0/1, actor 0/3, craft 0/1; on the player's slate 0
  week 160 rival cash: r01 12,801,659; r02 16,216,319; r03 6,972,818; r04 -2,267,738
seed p15a1-w2-market-03: baseMarketValue 64,574,534; the 4 rivals employ 24 people, 24 of them the last 24 of 84 entries of state.talent
 r3 slate: rival employees in 16 of 28 seats; weeks 7-159: 0 greenlights, 0 releases; release weeks []; screenplayShelved receipts 0; player cash at 160 -22,864,606
  week 30 r01 productions 0; screenplays ready 2; shelved 0; seatable director 0/1, actor 0/3, craft 1/1; on the player's slate 4
  week 30 r02 productions 0; screenplays ready 2; shelved 0; seatable director 0/1, actor 0/3, craft 1/1; on the player's slate 4
  week 30 r03 productions 0; screenplays ready 2; shelved 0; seatable director 0/1, actor 0/3, craft 1/1; on the player's slate 4
  week 30 r04 productions 0; screenplays ready 2; shelved 0; seatable director 0/1, actor 0/3, craft 1/1; on the player's slate 4
  week 160 rival cash: r01 10,126,546; r02 3,768,640; r03 -4,963,640; r04 -5,824,460
 r4 slate: rival employees in 0 of 28 seats; weeks 7-159: 64 greenlights, 64 releases; release weeks [12, 21, 30, 39, 48, 57, 66, 75, 84, 93, 102, 111, 114, 120, 126, 129, 138, 147, 156]; screenplayShelved receipts 2 (first week 131); player cash at 160 -22,887,019
  week 30 r01 productions 1; screenplays produced 2, inProduction 1, ready 1; shelved 0; seatable director 0/1, actor 0/3, craft 0/1; on the player's slate 0
  week 30 r02 productions 1; screenplays produced 2, inProduction 1, ready 1; shelved 0; seatable director 0/1, actor 0/3, craft 0/1; on the player's slate 0
  week 30 r03 productions 1; screenplays produced 2, inProduction 1, ready 1; shelved 0; seatable director 0/1, actor 0/3, craft 0/1; on the player's slate 0
  week 30 r04 productions 1; screenplays produced 2, inProduction 1, ready 1; shelved 0; seatable director 0/1, actor 0/3, craft 0/1; on the player's slate 0
  week 160 rival cash: r01 20,257,626; r02 43,859,067; r03 46,981,206; r04 62,659,347
 no slate: rival employees in 0 of 0 seats; weeks 0-159: 68 greenlights, 64 releases; release weeks [12, 21, 30, 39, 48, 57, 66, 75, 84, 93, 102, 111, 114, 120, 126, 129, 138, 147, 156]; screenplayShelved receipts 2 (first week 131); player cash at 160 20,000,000
  week 30 r01 productions 1; screenplays produced 2, inProduction 1, ready 1; shelved 0; seatable director 0/1, actor 0/3, craft 0/1; on the player's slate 0
  week 30 r02 productions 1; screenplays produced 2, inProduction 1, ready 1; shelved 0; seatable director 0/1, actor 0/3, craft 0/1; on the player's slate 0
  week 30 r03 productions 1; screenplays produced 2, inProduction 1, ready 1; shelved 0; seatable director 0/1, actor 0/3, craft 0/1; on the player's slate 0
  week 30 r04 productions 1; screenplays produced 2, inProduction 1, ready 1; shelved 0; seatable director 0/1, actor 0/3, craft 0/1; on the player's slate 0
  week 160 rival cash: r01 20,257,626; r02 43,859,067; r03 46,981,206; r04 62,659,347

 ✓ |core| tests/zz-p15a1-route-probe.test.ts (2 tests) 18917ms
   ✓ A: the r4 route premises and the industry by week 4276ms
   ✓ B: why the r3 held route stalls (seeds -01, -02, -03; r3 slate, r4 slate, no slate) 14640ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  19:33:46
   Duration  22.02s (transform 1.86s, setup 0ms, collect 2.47s, tests 18.92s, environment 0ms, prepare 111ms)
```

## Why the r3 route stalls (1355-F6 item 3)

Two causes stall r3's route, and each suffices alone. The player's negative cash plays no part.

1. **Seed `-01` never greenlights: a law effect.** Probe B, `-01`, no slate: weeks 0-159 bring 0 greenlights and 0
   releases, and 28 `screenplayShelved` receipts from week 15. At week 30 each rival holds two screenplays, both ready
   and both shelved, with every own employee seatable (director 1/1, actors 3/3, craft 1/1). A rival shelves a
   screenplay only after 13 economic rejections (`hollywoodTick.ts:267`, `:281`). `evaluate` returns
   `economicRejection` only when the cash gate skipped no candidate and no candidate passed the viability gate
   (`hollywoodTick.ts:236`; `hollywoodPolicy.ts:73`). So the rival viability law rejects every package in this world,
   from the first ready screenplay on. With no revenue, rival cash drains: at week 160 r03 holds 172,707 and r04
   -4,575,084. Which forecast input sinks every package is UNVERIFIED. One lead: baseMarketValue is 23,554,590 on
   `-01`, against 42,486,846 on `-02` and 64,574,534 on `-03`. The seed scan below found two more thin worlds among
   ten: `-10` and `-11` bring 1 and 8 rival releases by week 160 on the r4 held route. This is a law effect; the
   parent decides whether it is a finding for P14's §7 (rival films after week 140, 1344-F).
2. **The r3 slate held the rivals' own people: a route defect.** `enterRival` mints each rival's six-person entry team
   and appends it to `state.talent` (`hollywood.ts:244`, `:271`). On all three seeds the 24 rival employees are the
   last 24 of 84 entries. r3's `pickStaff` read that list from the end and checked no employment. The headless
   greenlight checks only the player's own seats and writing work (`actions.ts:341-343`); its contract and freelancer
   check (`actions.ts:421-428`) runs only in the engaged economy. So the slate took each rival's director and three
   actors, 16 of its 28 seats. A rival keeps its own busy employee in the slot (`hollywoodTick.ts:141-142`) and hires
   no replacement. `evaluate` then returns `staffingBlocked` (`:210`, `:225`), which never counts toward shelving
   (`:267`). The held pictures never release, so the block never lifts. Probe B, `-01`, r3 slate: at week 30 every
   rival holds two ready screenplays, seatable director 0/1 and actors 0/3, four of its people on the player's slate,
   and no shelving. The block alone stalls a working world: on `-02` the r3 slate leaves 0 greenlights and 0 releases
   in weeks 7-159, against 47 releases under the r4 slate and 47 with no slate; on `-03`, 0 against 64 and 64.
   The engaged path closes this gap: an engaged greenlight refuses anyone neither contracted nor an available
   freelancer (`productionAdmission.ts:236-239`), and the freelancer and hiring pools exclude rival employees
   (`employment.ts:375`, `:418`). Whether a headless world with an industry is reachable in play is UNVERIFIED.
3. **Player cash below zero is no cause.** On `-01` with no slate the player keeps 20,000,000 and the industry still
   makes nothing. On `-03` under the r4 slate the player ends at -22,887,019 and the rivals release 64 films, in the
   same weeks as with no slate.

## Seed scan (scratch, supporting)

Ten copies of the helper as it stood at run 4 (r4 slate rule, seed `-02`), each differing from it only in the
`MARKET_ROUTE_SEED` line (`-03` to `-12`), and one test file importing them, run once on the reference and then
deleted. The choice of `-03` needs no scan, since `-03` is the next seed; the scan shows how often a seed fails.
Output, verbatim:

```
p15a1-w2-market-03: slate 7 held, genres comedy/comedy/drama/crime/romance/horror/adventure; pair 21; twin 9; solo 26; K K2 12 K1 21 committed null; industry 64 releases by 160, first week 12 [drama,horror,adventure,romance], player cash -22887019
p15a1-w2-market-04: slate 7 held, genres comedy/comedy/drama/crime/romance/horror/adventure; pair 20; twin 9; solo 26; K K2 11 K1 12 committed null; industry 50 releases by 160, first week 11 [adventure], player cash -21662618
p15a1-w2-market-05: slate 7 held, genres comedy/comedy/drama/crime/romance/horror/adventure; pair 20; twin 9; solo 26; K K2 11 K1 12 committed null; industry 57 releases by 160, first week 11 [adventure], player cash -20526785
p15a1-w2-market-06: slate 7 held, genres comedy/comedy/drama/crime/romance/horror/adventure; pair 21; twin 9; solo 26; K FAILED (the first due week 12 is already pressured, so no K2 week precedes K1); industry 68 releases by 160, first week 12 [horror,romance,romance,crime], player cash -18465401
p15a1-w2-market-07: slate 7 held, genres comedy/comedy/drama/crime/romance/horror/adventure; pair 21; twin 9; solo 26; K FAILED (the first due week 12 is already pressured, so no K2 week precedes K1); industry 30 releases by 160, first week 12 [comedy,romance,horror,horror], player cash -19040785
p15a1-w2-market-08: slate 7 held, genres comedy/comedy/drama/crime/romance/horror/adventure; pair 21; twin 9; solo 26; K FAILED (the first due week 12 is already pressured, so no K2 week precedes K1); industry 43 releases by 160, first week 12 [romance,adventure,crime,romance], player cash -18944464
p15a1-w2-market-09: slate 7 held, genres comedy/comedy/drama/crime/romance/horror/adventure; pair 21; twin 9; solo 26; K FAILED (the first due week 12 is already pressured, so no K2 week precedes K1); industry 30 releases by 160, first week 12 [romance,drama,horror,drama], player cash -22701695
p15a1-w2-market-10: slate 7 held, genres comedy/comedy/drama/crime/romance/horror/adventure; pair 15; twin 9; solo 26; K FAILED (no pressured week (a natural pair, or a held picture sharing a due rival genre)); industry 1 releases by 160, first week 15 [drama], player cash -17292286
p15a1-w2-market-11: slate 7 held, genres comedy/comedy/drama/crime/romance/horror/adventure; pair 21; twin 9; solo 26; K FAILED (the first due week 12 is already pressured, so no K2 week precedes K1); industry 8 releases by 160, first week 12 [horror,horror,crime], player cash -21338057
p15a1-w2-market-12: slate 7 held, genres comedy/comedy/drama/crime/romance/horror/adventure; pair 39; twin 9; solo 26; K K2 12 K1 21 committed null; industry 63 releases by 160, first week 12 [comedy,drama,horror,romance], player cash -19925698
```

## Optional run: r4 `main` plus ref3's `src`

`node_modules/.bin/vitest run --project core --reporter=verbose tests/p15a1-market-integration*.test.ts` on a
temporary branch of `main` with ref3's `src` committed over it. Every failing line, verbatim, plus the totals:

```
 × |core| tests/p15a1-market-integration.test.ts > p15a1 market seam (RED 1-2, 1355-A §3.2) > market-seam-default-exact: the default path is bit-equal to the RED-commit pin [control, fixture-pending]
   → FIXTURE PENDING: tests/fixtures/p15/p15a1-market-pins/MANIFEST.json is minted by 1355-P at the last writer below the P15 save step (1355-A §4 "pins minted at the RED commit on unchanged production"). Computed at this commit: [{"name":"default-headless","digest":"29a04b42fcfcdeeac45bd56121390dd3444a5c7f16c834b836570387130cf2b0"},{"name":"default-engaged","digest":"0dde8ac354483daa2ccb00ab61b319a6f60267d646ddcb47627a1826f61991f6"},{"name":"stars-heavy-marketing","digest":"a2ef93d2b25532525a95c6e856ecfed2cbe107a649c388b57cec1774953abc9f"}]
 × |core| tests/p15a1-market-integration.test.ts > p15a1 market chronology controls (RED 10-11, 1355-A §4 K1/K2) > market-week-diff-confined (K1): one pressured tick differs from the RED-commit pin only inside the pressured chain [control, fixture-pending]
   → FIXTURE PENDING: tests/fixtures/p15/p15a1-market-pins/MANIFEST.json is minted by 1355-P at the last writer below the P15 save step (1355-A §4 "pins minted at the RED commit on unchanged production"). Computed at this commit: K1 week 21, committed null, post-tick digest 71936ed4766f1e347203f6393701115d141c02a4abdd4cff3ea1cd3c5a3d8daf
 × |core| tests/p15a1-market-integration.test.ts > p15a1 market chronology controls (RED 10-11, 1355-A §4 K1/K2) > market-no-pressure-week-identity (K2): the post-tick state minus the new roots is byte-equal to the RED-commit pin [control, fixture-pending]
   → FIXTURE PENDING: tests/fixtures/p15/p15a1-market-pins/MANIFEST.json is minted by 1355-P at the last writer below the P15 save step (1355-A §4 "pins minted at the RED commit on unchanged production"). Computed at this commit: K2 week 12, digest 083e525c33fed9c085f288438b23ad55ba264a2acceaf42bf5b2ca232a7ab652
 × |core| tests/p15a1-market-integration.test.ts > p15a1 market old saves (RED 16) > market-old-save: the genuine capture below the step loads to the empty root at its tick; a second migration is a no-op; it round-trips while empty [fixture-pending]
   → FIXTURE PENDING: no genuine capture below the P15 save step at tests/fixtures/p15/genuine-below-p15-save-step/ (1355-F Amendment 3: minted by 1355-P at the last Save43 writer)
 × |core| tests/p15a1-market-integration.test.ts > p15a1 market old saves (RED 16) > market-old-save: the first batches after migration see no pre-migration release [fixture-pending]
   → FIXTURE PENDING: no genuine capture below the P15 save step at tests/fixtures/p15/genuine-below-p15-save-step/ (1355-F Amendment 3: minted by 1355-P at the last Save43 writer)
 × |core| tests/p15a1-market-integration.test.ts > p15a1 market disengaged world (RED 17) > market-disengaged-world: the M0A outputs equal the RED-commit pin [control, fixture-pending]
   → FIXTURE PENDING: tests/fixtures/p15/p15a1-market-pins/MANIFEST.json is minted by 1355-P at the last writer below the P15 save step (1355-A §4 "pins minted at the RED commit on unchanged production"). Computed at this commit: M0A 40 weeks, digest 405f3b4dcce303aa0346a9a0b6073c71237afe56ac35da1bb5d126f6a2230379
 Test Files  1 failed | 2 passed (3)
      Tests  6 failed | 53 passed (59)
   Duration  12.31s (transform 2.72s, setup 0ms, collect 7.20s, tests 14.33s, environment 1ms, prepare 815ms)
```

The K1 and K2 pin leaves now reach their fixture and compute K1 week 21 and K2 week 12. Before r4 they stopped on the
route.

## Runs (heavy lane, `tree/` only, one vitest process at a time, `pgrep -f vitest` empty before each)

| # | `src` | File | Wall | Outcome |
|---|---|---|---|---|
| 1 | reference | probe, r4 slate rule on `-01` | 20 s | `-01` stalls with and without the slate |
| 2 | reference | probe, seed `-02` | 20 s | `kRoute` fails: week 12 already pressured |
| 3 | reference | seed scan, first draft | 1 s | vite refused the template-string import; no result |
| 4 | reference | seed scan | 30 s | output above |
| 5 | reference | probe, seed `-03` | 29 s | every premise holds |
| 6 | unchanged production | probe, seed `-03` | 23 s | same premise weeks |
| 7 | reference, committed `main` | probe, final | 23 s | identical to run 5 except timings; the output above |
| 8 | reference, committed `main` | three integration files | 13 s | 53 passed, 6 FIXTURE PENDING |

Total wall time: 159 s.

## Outside the brief

- In the real repo, besides the brief's `git apply --check` under a temporary index (deleted), I ran read-only
  `git rev-parse HEAD`, `git status --short`, `git log --oneline 1063ab4f..HEAD` and
  `git diff --stat 1063ab4f HEAD -- src generated tests/*.ts tests/helpers`, to confirm no drift since the tree's
  base. They wrote nothing.
- Run 6 put the probe on unchanged production to confirm the K1 and K2 weeks the producer will mint.
- The scan file and the ten helper copies lived in `tree/tests` during runs 3-4, then I deleted them. Never committed.
- I created and deleted two temporary branches, `r4-probe-ref` and `r4-ref-run` (the second held one temporary
  commit of ref3's `src`). `main` is clean at 5952d5f.
- Run outputs sit in my session scratchpad, outside `S/1355-red/`.

## Uncertain

- Which forecast input makes every package on `-01` non-viable. baseMarketValue is a lead, unproven.
- Whether a headless world with an industry is reachable in play.
- The probe proves the RED 16 ramp on the in-memory rival route. The producer proves it again on reloaded bytes at
  mint time. RED 13, which passes on the reference, shows a save, reload and 30 ticks equal the unsaved route.

## sha256

| File | sha256 |
|---|---|
| `1355-p15a1-wave2-red-r4.patch` (`git diff 4d09e80..5952d5f`) | 2092c19874aa08af2d54301e9a56ad20b04c517d7ce769ef155efd5c20c5a686 |
| `1355-p15a1-wave2-red-r4-classification.json` | d11a0fb3b55a69ecd6d9bf483546a93153b737decd11b6d89126b3968aa5356f |
| `1355-r4-route-probe.test.ts.txt` | ffc5c79893f9337a4632d346a2d1c85737419cd918ad9710ae028c0f0f601dd3 |
| `1355-P-p15a1-market-producer-r3.ts` (unchanged, still current) | 5007e231468ad566d7c69fe45b78261270550bbc1c9c8ad7c488c2b3e8ba5707 |
| `1355-C4-handback.md` | in the reply; a file cannot carry its own hash |
