<!-- 1355-D4: confirmation review (contract auditor, read-only) of 1355-C4 r4 -->

# 1355-D4: confirmation of the P15A.1 Wave 2 RED r4 (1355-C4)

**Verdict: CONFIRMED.** r4 meets 1355-F6 items 1-3 and leaves 1355-F4 and 1355-F5 intact. No note below blocks the RED.

I read repo HEAD 2eaacb29 (`git diff --stat 1063ab4f HEAD -- src generated tests/*.ts tests/helpers` is empty) and `tree/` main 5952d5f. I ran no test, node, tsc or script, used read-only git only, and deleted the temp index. Keys: H `tests/helpers/p15a1-market-route.ts` at 5952d5f; T and At the main and atomicity test files there; Pr the probe; P producer r3 (sha256 5007e231…, unchanged); K the r4 classification; A 1355-A; Xp, Xr, Xf the parent's X2 outputs `studio-scratch/1355-x2/x-probe.txt`, `x-red.txt`, `x-ref.txt`; X1r `studio-scratch/1355-x/x-red.txt`.

| Item | Status |
|---|---|
| F6 1, every premise holds | MET (Xp:13-17, :37-42; Xf:151) |
| F6 1, choices declared with reasons | MET (C4:12-18, :25-37; K:6-41) |
| F6 2, probe | MET (Pr:1-7, :55-138) |
| F6 3, stall explained | MET; unmeasured parts marked UNVERIFIED (C4:216, :233, :313-314) |
| Only the helper changed | MET (`git diff 3b0b0b5..5952d5f`: H only, 13 added, 3 removed) |
| Patch | MET: sha256 2092c198… is byte-identical to `git diff 4d09e80..main`; `git apply --check --cached` exits 0 at 2eaacb29 |
| Producer | MET: reads `MARKET_ROUTE_SEED` and `kRoute()` from H (P:39, :76, :151); its cap literal equals H:225 (P:46) |
| Classification | MET: 17 changed rows, each `basis` cites 1355-F6 item 1 (K:98-671) |

## F6 item 1: printed weeks against what each helper needs
Xp matches C4:77-193 line for line except the `src` label (the parent set no PROBE_SRC). On seed `-03`:
- `pairWeek` (H:272-283) needs all seven held pictures ready (weeks 8-14, Xp:6-12) and a due rival alone in a held genre. No rival is due in weeks 13-20 (Xp:20-21). At 21, H:277 skips the r01/r02 comedies and takes r03 horror with prod-0005, with six other held pictures ready against RED 4's two (Xp:14; T:272).
- `twinWeek` (H:288-293): week 9, no rival due (Xp:15). `soloWeek` (H:298-304) scans from 26 (tuning.ts:1013): week 26, prod-0002 drama, none due (Xp:16).
- `kRoute` (H:316-340): K2 12 (four genres, no history), K1 21, a natural pair, committed null (Xp:17). H:324-327 leaves every due week before K1 unpressured, so H:309-310 holds. The parent's RED run on unchanged production computes K2 week 12 with digest 083e525c… (Xr:46), the reference's digest (Xf:29), and K1 21, committed null, on both (Xr:42; Xf:26).
- `rivalRouteAt(66)`: sibling top 28 above market top 27 (Xp:41). `capturePremise`: week 30, paired release 30 inside [30, 55] (Xp:42); P:120-129 re-proves it on reloaded bytes before writing.
- Others: RED 3 leaf 2 at week 4 (T:258; Xp:37); RED 12, 11 weeks (T:507; Xp:38); RED 13 at week 21 (T:531; Xp:39); RED 14 and RED 16 leaf 4 (T:641, :790; Xp:40); the slate (H:173, :205).
- Neither X2 run prints "route premise". Against X1r, exactly 13 leaves change, each from a route-premise failure to its classified reason (Xr:3-116). The reference fails only the six fixture-pending leaves (Xf:10, :25, :28, :58, :60, :65).

## The two choices
- **Slate rule (H:168): a fair reading.** A names holding (A:223, :233-234) and sets no staffing rule. Engaged play bars a rival's employee from any seat: admission takes only contracted people or free freelancers (actions.ts:421-438; productionAdmission.ts:236-239), both pools exclude rival employees (employment.ts:375, :418), and nobody approaches a person in term (talentMarket.ts:105-106). The headless greenlight checks only the player's own seats and writing (actions.ts:341-343; employment.ts:127-129). No leaf tests greenlight admission, so the gap touched only the route. The rule closes it, and the slate leaves `-03`'s industry untouched: the same release weeks and week-160 rival cash with and without it (Xp:109 and :115; :114 and :120).
- **Seed `-03`**, the next in the series (C4:27, :242). The route is seed-sensitive: six of ten seeds fail `kRoute` (C4:249-254).
- **Silent dependence: none.** Each premise fails by name (H:173, :205, :265, :336; T:258, :272, :507, :531, :669, :755). P computes K1 and K2 from `kRoute()` before its first write and stops on a failed premise (P:9, :76, :143-145); the pin leaves compare weeks (T:434-435, :472).

## F6 items 2 and 3
- **Probe.** Pr (sha256 ffc5c798…) sits beside the patch, reads each premise through the helper's exports (Pr:19-23, :65-84, :111-134), and prints in-flight, greenlit and released counts by week with totals (Pr:33-53, :87, :136). It is not among the patch's five files, and `git log --all -- 'tests/zz-*'` in `tree/` is empty. The author ran the probe, a seed scan and the three RED files, no broad suite (C4:286-295).
- **Stall.** `-01` stalls with no slate and the player at 20,000,000 (Xp:77-82). Its 28 shelvings each follow 13 economic rejections, the only outcome that counts (hollywoodTick.ts:236, :267-281; hollywoodPolicy.ts:62, :73; tuning.ts:33). The r3 slate seats 16 rival employees and leaves directors 0/1 and actors 0/3 seatable (Xp:65-69); `staff()` keeps the busy employee (hollywoodTick.ts:141-142), `evaluate` returns `staffingBlocked` (:210, :225), and that never counts (:267). The block alone zeroes `-02` and `-03` (Xp:84 against :90; :103 against :109). Player cash is no cause (Xp:77, :109). Every source citation in C4:209-233 matches the code.

## Unchanged
The diff touches H:17, :147-152 and :161-168 only. The three test files and `tests/helpers/p15-roots.ts` match r3, so the 59 leaves, the re-pin header (T:22-27), F4's R1-R3 and F5's phase lookup stand. K differs from r3's JSON only in `record`, `revision`, the `route` block and 17 `route` fields; every `expectedFailureToday`, `fixturePending` and `repinAtSiblingLanding` matches, as does the summary (K:42). The reference type gate shows the same 35 errors as 1355-X.

## Notes (non-blocking)
- K's `basis` lines and C4:53-55 report run 6 on unchanged production (C4:293), whose output is not attached. Xr confirms K1, K2 and no premise failure there. The pair, twin and solo weeks there and the week-103 split stay UNVERIFIED.
- C4:29-31 rejects `-02` on run 2 (C4:289), also not attached: UNVERIFIED. No held-route leaf uses `-02`.
- K1's confinement check (T:450-452) first runs after the mint, now on four pressured rival releases. A scratch diff of the two week-21 post-tick states against H:447-475 would test it sooner.
- The industry step resolves r01 and r02 before r03 (hollywood.ts:168, :182-183; hollywoodTick.ts:360, :388), and their week-21 comedy pair returns `pressureFactor(1)`, so At:85-86 no longer singles out the player's call. F4 R3's target, a refusal before any reception, still fails at At:82.
- P:46 copies `ROUTE_CAP_WEEK` as a literal; it holds while the cap stays 160.
- The headless gap (actions.ts:341-343) becomes a product question if a headless world with an industry is reachable in play (C4:233). The parent may route it beside the §7 observation (X2:37-45).
