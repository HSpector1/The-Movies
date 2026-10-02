# 1353-U: independent review of 1353-T and 1353-F6

**REFINE.** Adopt the values and rulings 1, 2, 4, 5 and 6 as 1353-F6 gives them: critic 60, hit line 49, share floor 20, `campaign-legacy/v2`, and v1 kept in `LEGACY_DEFINITIONS`. Ruling 3 needs findings 6-9 added before the RED r6 brief goes out:
- RED r5 has two more live-v1 pins than ruling 3 lists.
- The after-retune leaf can pass without ever validating a v1 manifest.
- The reference GREEN writes the live definition into every era's replay.
- Three more Wave 1 leaves fail at the RED commit.

I reviewed read-only on 2026-10-02 CDT, from 00:31 to 00:51, at HEAD bc2f6007 on `wip/headless-program-20260916-ts`. `git diff --stat b0809602 bc2f6007 -- src bridge ui/src` prints nothing. No node, vitest, tsc, tsx or vite-node process ran. I read source through `git show bc2f6007:<path>` and never touched the worktree, the index, the stash or `tests/fixtures`. python3 only read files and printed.

Notation:
- E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`.
- "law :N" is `src/core/campaignLegacy.ts` at HEAD.
- "p15c1 :N" is `tests/p15c1-campaign-legacy.test.ts` at HEAD.
- "r5 :N" is `E/1359-stage/1359-p15c-wave2-red-r5.patch`.
- "ref :N" is `E/1359-stage/1359-p15c-wave2-reference-r3.patch`.
- "GP :N" is `E/1359-stage/gp/1359-GP-probe.ts`.

Helper scripts, in `/Users/zacheryspector/studio-scratch/1353-u/`:
- `1353-U-check.py` (sha256 `f146b023ff1726d031eb23dffb38a747d2f576ae665289d296e6e1f795ab678f`). It recomputes everything independently of `1353-T-holders.py`: provenance, the 1355-G1 join, hit lines 45-55, leave-one-out rates, a binomial volume test, break-even pressure, §3.5, §3.6, the thin seeds and the G-P expectation. Its section numbers (§1-§11) are cited below.
- `1353-U-g6240.py` (sha256 `1d2178a2d1a423245cddd30ecaaf48424fae3a4c4028f6bc251c98aad365e17c`). It counts v1 against 60/49/20 on the genuine Save38 at week 6240 (the RED's G6240), a harness endurance capture.
- Read copies made with `git show`: `campaignLegacy.HEAD.ts`, `tuning.HEAD.ts`, `receptionVerdict.HEAD.ts`, `p15c1.HEAD.test.ts`.

## Findings

### 1353-T §8 items 1-6, 9 and 11: confirmed

1. **Reproduction and provenance (items 1-2). Non-blocking; confirmed.**
   - `python3 E/1353-stage/t/1353-T-holders.py E/1353-stage/t/dist.json E/1355-stage/g1/1355-G1-output.json` prints both `check:` lines. Every row of §2.2, §4.1, §4.2 and §6.1 matches.
   - The sha256 values of `dist.json` (6ee10685…), the probe (5d1c10e7…), the holders script (0e30cf39…), the notes (798add0e…) and `dist.err` (c69082bb…) equal 1353-T §2.1 and §9.
   - The E copies equal the scratch copies, and so does the record itself (17c2e406…).
   - Every seed reads `lawCheck` with 10 studios, 102 comparisons and 0 mismatches, and the top level reads `pass`.
   - The manifest hashes 59d52963… and 0c953377… equal `E/1359-stage/gp/1359-GP-output.json` (`1353-U-check.py`, provenance block).
   - The run used Node v20.20.2 from 23:51:34 to 23:59:30 and exited 0 (`E/1353-stage/t/runs.meta:11-12`).

2. **Rules, anchors and other archetypes (items 3, 4, 6). Non-blocking; confirmed.**
   - `rule()` (`E/1353-stage/t/1353-T-holders.py:32-41`) uses the law's products from law :586, :588, :591, :616-618, :620 and :623. It reads grosses for settled releases only.
   - `receptionVerdict.ts:34` (`mixedBelow: 60`) starts the critic band "hit" at 60. `tuning.ts:182-184` puts 60 above the D-6 corpus's p90.
   - On seed-b, 60 sits between p83 (59.95) and p84 (60.46), with 328 of 1,952 releases at or above it. 0.50 sits between p83 (0.4966) and p84 (0.5035), with 321. 0.49 sits between p81 (0.4856) and p82 (0.4907), with 353 (`1353-U-check.py` §5).
   - `git grep` at HEAD over `src`, `bridge` and `ui/src` finds the four keys only at law :586, :591, :618 and :623 and in `tuning.ts`. No module imports the law, and no lens reads a changed key (law :711-755).

3. **Thin seeds (item 9). Non-blocking; confirmed with wider margins than 1353-T states.**
   - At share 20, no p13a-core-causal-01 studio holds `artistic-voice` above critic 49, or `commercial-engine` above a hit line of 23.
   - On p13a-wait-control-01 the limits are critic 54 and a hit line of 17. The highest reach on the two seeds is 0.422 and 0.341.
   - Every 1355-G1 factor lies in [0.8253, 1.0000], so pressure cannot add a holder (`1353-U-check.py` §8 and the G1 join line).

4. **Pattern figures, alternatives and kept values (items 5, 11). Non-blocking; confirmed.** These all reproduce (`1353-U-check.py` §5-§7, §10):
   - all eight §3.6 rows;
   - the §3.5 figures: r07 2.15 at critic 64, r06 1.49 at a hit line of 52, r06's maximum 1.78 across lines 45-60, and its own share falling from 37.5% to 10.0%;
   - the kept-value counts: critic below 35, 63 releases; flops, 435; reach p25, 0.320; critic 59, 19.4%; hit line 48, 20.2%;
   - the careers in §2.3.

### Item 7 replaced: F6 ruling 1 (hit line 49)

5. **49 is the best value, and F6's table reproduces exactly. One premise of ruling 1 understates the record. Non-blocking.** The figures are on seed-b at share floor 20, from `1353-U-check.py` §1-§4.

   | Line | Grosses | Pool at the line | Floor ÷ pool rate | Holders (margin) | Floor ÷ rest of pool | Chance an average rival holds, n = 273 / 419 / 464 |
   |---|---|---:|---:|---|---|---|
   | hit 48 | as run | 394 (20.2%) | 0.99 | r06 +30, r07 +7, r08 +4 | | 0.53 / 0.55 / 0.55 |
   | hit 49 | as run | 353 (18.1%) | 1.11 | r06 +15, r07 +3 | r06 1.21, r07 1.15 | 0.21 / 0.16 / 0.15 |
   | hit 49 | × 1355-G1 factors | 297 (15.2%) | 1.31 | r06 +6 | r06 1.48 | 0.017 / 0.005 / 0.003 |
   | hit 50 | as run | 321 (16.4%) | 1.22 | r06 +9 | r06 1.34 | 0.061 / 0.030 / 0.023 |
   | hit 50 | × 1355-G1 factors | 267 (13.7%) | 1.46 | none (r06 -1) | | 0.002 / 0.000 / 0.000 |
   | critic 60 | no factor applies | 328 (16.8%) | 1.19 | r06 +11, r07 +29 | r06 1.32, r07 1.42 | 0.084 / 0.046 / 0.038 |

   "Rest of pool" leaves the studio's own releases out of the pool. "Chance" is a binomial null model: a studio whose every release hits at the pool's rate, at seed-b's career lengths.

   - **Why 49.** It is the only integer line that does both jobs:
     - It keeps the share floor above the pool's rate on today's tree; 48 gives 0.99.
     - It keeps a holder under the measured factors; 50 leaves r06 at -1.
   - **Ruling 1's ratio argument holds.** Under the factors 49 asks 1.31 times the pool's rate, against 1.22 at 50 as run. Leaving the holder out of the pool keeps the order: r06 faces 1.48 against 1.34.
   - **The no-anchor claim holds.** No shipped reach boundary sits near 0.49-0.50. The nearest shipped figure is `AWARENESS_REACH_NEUTRAL` 0.58 × `AWARENESS_REACH_SCALE` 0.9 = 0.522 (`tuning.ts:108-109`), which is Standing tuning. At a line of 52, r06 holds by +2 as run and nobody holds under the factors.
   - **Premise correction.** Ruling 1 says no record fixes the landing order. 1359-A §10 item 3 (`E/1359-A-p15c-wave2-charter.md:274-276`) plans P15C Wave 2 "with or after" P15A.1 Wave 2, while still allowing P15C to land first. Pressure is therefore the planned case, which strengthens 49.
   - **What 49 costs on today's tree.** The floor is only 1.11 times the pool's rate:
     - r07 holds by +3, although its commercial rate is only 1.20 times the rest of the pool;
     - an average prolific rival holds by chance 15-21% of the time, against 2-6% at 50.

     That meets the letter of "a pattern, not volume" (1359-F5 ruling 3) with a thin margin. Under the factors, 49 meets it comfortably (0.3-1.7%).
   - **49's margin under pressure is thin.** r06 keeps the archetype only while every gross falls by at most 1.9% beyond the 1355-G1 factors (k* 0.9814). 1355-G1's own first-order loss on seed-b is 3.39%, and a closed loop could exceed the open-loop estimate.
     - The next contingency is 48: r06 +16 under the factors, with 3.9% of headroom.
     - 48 is valid only on a tree that carries pressure, because as run it puts the floor below the pool's rate (0.99).
   - **Moving the share floor doesn't help.** 49/21 gives r06 +11 as run and +2 under the factors. 50/19 gives +13 and +3. Both also move `artistic-voice`, which shares the key at law :591 and :623.

### Items 10-11, read with F6 rulings 2-4

6. **RED r5 carries two more live-v1 pins than ruling 3 lists. Blocking for the r6 brief.**
   - **B1 at r5 :1373-1374.** `legacy-tick-freezes-once-at-6240` expects `['official2040', 'campaign-legacy/v1', B, LEGACY_POST_FINALE_MODE]`. The step writes the live definition, so under v2 this leaf fails at production. Ruling 3's catch-all names "70, 90 or 25" and not the definition string, so it does not reach this line.
   - **C11's unknown-definition probe at r5 :1764.** It tampers with `genuineFrozen()`, setting `definition` to `'campaign-legacy/v2'`, and expects a refusal.
     - Under v2 the frozen manifest already reads v2, so the tamper changes nothing.
     - `makeSave` then accepts it, and `thrownMessage` throws "expected a refusal, but the call returned" (r5 :149-156).
     - The probe needs an id outside the table. The `campaign-legacy/v0` probe at r5 :1624 stays valid.
   - **No other r5 line restates 70, 90 or 25 as a live value.** Only C11's v1 table (r5 :1737-1738) and the after-retune leaf's arbitrary RETUNE values (r5 :1838-1839) carry those numbers. The critic 80 and audience 70 at r5 :1885 belong to an authored film, which never counts as a release.
   - **No integration leaf places a hand fixture against a line.** The replay, bounds and refs leaves take whatever refs the freeze cites, and they flip outcomes instead of relying on them (r5 :1643-1667, :1676, :1785-1815). `1359-p15c-wave2-sibling-r2.patch` contains none of these tokens.

7. **The after-retune leaf can pass without validating a v1 manifest. Blocking for the r6 brief.**
   - r5 :1829-1856 starts from `genuineFrozen()` (r5 :269-279), which runs the live step, so on a v2 tree its manifest reads `campaign-legacy/v2`.
   - Kept as written, the leaf checks a v2 manifest after a simulated retune, and it passes. Its name, and ruling 2, promise a v1 manifest that validates after the v1-to-v2 retune.
   - r6 must build a real v1 manifest on the v2 tree: built with v1's frozen thresholds and stamped `campaign-legacy/v1`. `TUNING` is a plain mutable object (`tuning.ts:27`), and the leaf already mutates it (r5 :1845). An `evaluate` taken from the definition entry would also work.
   - G6240 tells the eras apart, so the leaf can assert that the retune is material. The player's `artistic-voice` reads 7 of 122 at critic 70 (not held) and 37 of 122 at critic 60 (held) (`1353-U-g6240.py`). Relabelling the same manifest as the other era should then refuse on replay.

8. **The reference GREEN writes the live definition into every era's replay. Blocking for ruling 4's "one frozen row" and for the r6 dry run.**
   - At ref :173-175 and ref :280, both `buildLegacyManifest` and the v1 entry's `evaluate` call `evaluateLegacyManifest`.
   - Its return block keeps `definition: CAMPAIGN_LEGACY_DEFINITION` (law :787). The reference's hunks cover original lines up to :781 and resume at :803, so law :785-792 stays as it is.
   - At ref :717-721 the validator replays a stored manifest through `entry.evaluate(...)` and compares every field except `standingAtBoundary`, `definition` included (ref :725-745).
   - With the constant at v2, the v1 entry's replay returns `definition: 'campaign-legacy/v2'`. Every stored v1 manifest would then refuse at `official.definition`. r5 cannot show this, because its live definition equals its only entry.
   - **Fix.** Each entry's evaluator stamps its own id, boundary and mode. Law :192 types `definition` as `typeof CAMPAIGN_LEGACY_DEFINITION`; after the bump that narrows to v2, so it must widen to the table's keys.
   - **The reference must move to v2 before r6's dry run.** That means 60/49/20, law :72, a frozen v2 entry beside v1, and the fix above. Otherwise the dry run cannot show that every leaf passes at a reference GREEN. Ruling 3 does not mention the reference.

9. **Wave 1 test file: every line ruling 3 cites holds what F6 says, but ruling 3 misses two comments and three derived leaves.** Blocking for the r6 classification; the comments are non-blocking.
   - **Confirmed at HEAD:** p15c1 :1 (title), :313 (70), :317 (25), :318 (90), :336 (`campaign-legacy/v1`), the comments at :382, :629-630 and :642-643, and :1894 (70), :1898 (25), :1899 (90).
   - **Missed comments:** p15c1 :581-582 ("95% BMV each") and :878 ("hits (95% BMV, settled)"). Both describe the v1 hit fixture, which becomes 54%.
   - **Leaves that fail at the RED commit through derived fixtures.** Each passes at production; I checked them against law :586-623.
     - `legacy-archetype-edges-commercial-engine-min-films-n-minus-1-vs-n` (p15c1 :580-600): its hits sit at (49 + 5)% = 54% of BMV, under v1's 90%. CE-N reads not held at :599.
     - `legacy-archetype-edges-artistic-voice-share-exactly-at-threshold` (:627-652): nExact becomes 25, and at v1's 25% floor 500 < 625. S-EXACT reads not held at :650.
     - `legacy-coexist-every-evaluated-archetype-held` (:942-1007): `buildAllStarFacts` (:884-913) grosses 54% of BMV. ALLSTAR1/commercial-engine reads not held at :975.
   - **Five p15c1 leaves fail at the RED commit in all.** These are the three above plus the two pin leaves, `campaign-legacy-definition-version-export` (:334-337) and `tuning-legacy-bounded-terms` (:1892-1920). The classification must declare all five with their first messages, or the recorded RED shows undeclared failures.
   - **No other fixture crosses a line.**
     - Critic literals are 10, 20, 50, 90, 99 and ACCLAIM + 10.
     - Gross literals are 0, 500, 123,456 (an inRun refusal), BMV and (FLOP - 25)% = 5%.
     - The boundary-cut fixture (:393-394) becomes critic 70, exactly v1's line at the RED commit. It passes on both trees because the law compares with ≥.

10. **Producer r4 captures no value that depends on the three keys or the definition string. Non-blocking; confirmed, on one condition.**
    - It writes `exportSave(makeSave(routeAt(week)))` for weeks 6239 and 6240 (`E/1359-stage/1359-P-p15c2-route-l-producer-r4.ts:72-79`).
    - It asserts no `campaignLegacy` root on the fresh world or on either capture (:61, :75). Its MANIFEST holds only the route, sizes, hashes and timings (:85-97).
    - The route helper imports only `LEGACY_BOUNDARY_WEEK` from the law (r5 :365) and reads `TUNING.CONTRACT_MAX_WEEKS` and `TICKS_PER_YEAR` (r5 :406, :425). Nothing in `src` imports the law.
    - The mint runs while TUNING still holds v1 (ruling 4), so it stays as 1359-X3 dry-ran it. **Condition:** r6 must leave `tests/helpers/p15c2-route-l.ts` byte-identical to r5.

11. **Ruling 2 (keep v1) is consistent with the charters. Non-blocking; confirmed, once finding 8 is fixed.**
    - 1359-A §5.1 (`E/1359-A-p15c-wave2-charter.md:177-181`) says "A v2 adds an entry and leaves v1 untouched".
    - 1359-F Amendment 1 (`E/1359-F-parent-p15c-wave2-charter-adoption.md:22-23`) keeps v1 reachable "after any retune", with an old-law fixture whose v1 manifest still validates. Dropping v1 would need an amendment to 1359-F; keeping it needs none.
    - "No save stores a v1 manifest" holds:
      - at HEAD, no state type, save or bridge file mentions `campaignLegacy` (`git grep`);
      - the root arrives only with Wave 2 production (1359-A :280-281), which ruling 4 ties to v2;
      - G-P gates that production (1359-A :260-263), and v1 failed G-P (1359-X4).
    - **Recommendation:** C11 should also pin the frozen v2 entry's fifteen literals and the table's key set. Then a later retune that edits v2 in place fails the way an edit to v1 would.

12. **Ruling 5's G-P expectation and 1353-T §7.4. Non-blocking; confirmed for the first run, with two gaps for the second.**
    - **Expected on 1359-X4's two seeds at 60/49/20:**
      - `artistic-voice` 0/10 and 2/10 (r06 +11, r07 +29);
      - `commercial-engine` 0/10 and 2/10 (r06 +15, r07 +3);
      - every other row as in 1359-X4.
    - **Expected `retuneCheck`:** `retune: []`, `retuneSomeSeedReading: ['artistic-voice', 'audience-institution', 'commercial-engine']`, `law: 'campaign-legacy/v2'` (`1353-U-check.py` §9).
    - **The probe needs no change for the first run.** The 1359-GP probe reads `CAMPAIGN_LEGACY_DEFINITION` and TUNING from the tree (GP :25, :32, :357-358). `campaign-legacy/v1` appears only in its comment at GP :5, and it checks no threshold or definition.
    - **Gap 1:** the probe refuses any state that carries `p15Sequence`, `powerRanking`, `corporateCondition` or `sharedMarket` (GP :50-57; its own note at :48-49). Ruling 5's second run, on a tree with P15A.1 Wave 2 production, needs that branch first.
    - **Gap 2:** slice B's Save44 production lands before P15C Wave 2 (F6 Order 4). No record shows that slice B leaves the natural routes byte-identical; 1348-X7 covered slice A only. Add slice B to ruling 5's triggers, or run a 1348-X7-style route check after it lands.

13. **Player evidence (item 8, ruling 6). Non-blocking; I agree, and the playtest brief gains one data point.**
    - 1353-T §6.3 names D-6 as the only player evidence. G6240 is a 120-year capture of an engaged driver, with 122 player films:
      - critic p50 54.4, p75 61.4, p90 66.0;
      - 37 films at critic 60 or above (30.3%), so the player holds `artistic-voice` at 60/20.
    - Its commercial record is unusable: 104 of the 122 films grossed 0 (`1353-U-g6240.py`).
    - **Short careers hold by chance.** A 25-release career at the pool's rate holds by chance 41% of the time at critic 60, 48% at hit line 49 as run, and 39% at hit line 50 as run. The brief should say so.

14. **Wording. Non-blocking.**
    - The new text at `tuning.ts:1036-1037` should cite 1353-F6 beside 1353-T, since 49 comes from F6.
    - The critic band "hit" (60-79, `receptionVerdict.ts:33-39`) shares its word with `commercial-engine`'s gross "hit". Wave 3-4 dossier copy must keep "acclaimed" and "hit" apart.
    - p15c1 :311-312 attributes the restated values to "§5.5 TUNING". r6 should cite 1353-T and 1353-F6.

## For the P15C Wave 2 RED r6 brief

1. **C11** (r5 :1715-1765):
   - The live pin reads `campaign-legacy/v2`.
   - TUNING equals a v2 literal table: 60 / 49 / 20 plus the twelve unchanged values.
   - The frozen v1 entry keeps its fifteen literals (r5 :1736-1741).
   - Pin the frozen v2 entry's literals and the table's key set.
   - Replace `campaign-legacy/v2` at r5 :1764 with an id outside the table.
2. **B1** (r5 :1373-1374): the frozen manifest's definition reads `campaign-legacy/v2`.
3. **The after-retune leaf** (r5 :1829-1856):
   - Build a v1 manifest from G6240 on the v2 tree, using v1's thresholds and the definition `campaign-legacy/v1`.
   - Assert that it validates under live v2 TUNING.
   - Assert that the retune is material: the player reads 7 (not held) under v1 and 37 (held) under v2.
   - Assert that relabelling it as the other era refuses, and keep the unbumped-retune check.
4. **The reference GREEN moves to v2 before the r6 dry run:**
   - 1353-T §7.1 with 49 at `:1047`;
   - law :1 and :72 naming v2;
   - a frozen v2 entry beside v1;
   - each entry's evaluator stamping its own definition;
   - law :192's type widened to the table's keys.
5. **`tests/p15c1-campaign-legacy.test.ts`:**
   - Move ruling 3's lines, and rewrite the comments at :581-582 and :878 as well.
   - The classification declares five leaves failing at the RED commit, with their first messages: :334-337, :580-600, :627-652, :942-1007 and :1892-1920.
6. **`tests/helpers/p15c2-route-l.ts`** stays byte-identical to r5, so producer r4 and 1359-X3 still describe the mint.

Findings 5, 12 and 13 belong to G-P, Wave 2 production and the playtest brief, not to r6.
