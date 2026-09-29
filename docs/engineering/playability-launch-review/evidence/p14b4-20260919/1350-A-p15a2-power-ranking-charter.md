<!-- 1350-A: drafted read-only by a planning agent at HEAD bf125cc3 from the parent's brief; saved verbatim by the parent (title number filled in, the agent's trailing file list removed). It is the parent's proposal pending review 1350-B and parent adoption. -->

# 1350-A: P15A.2 Power Ranking charter (quarterly, provisional formula)

This is a parent proposal at HEAD bf125cc3. It is source-only; no tests were run. Authority read: 1342-O item 2, 1122-A, `CODEX-P13-P15-OWNER-RULINGS.md` §4, RECONCILIATION-02 at c5b52b4d, the P15 package and annex at 2a7ff0d9, 1102-A, and 1323-A/F.

## 1. Authority and scope

- **Owner ruling 1342-O item 2** (approved text): "Use quarterly in-game ranking. Delegate the concrete formula, weights and tie handling to documented, reviewed provisional tuning within the selected P15 model; write the initial formula before implementing it. Keep categories explainable and preserve the existing distinctions between creative rank, Standing, Honors and finances." The ruling keeps the 1122-A presentation and forbids "invented Honors or private rival balances, and ... covert second financial ranking formula." 1342-O md:30 records that this closes the Power Ranking item of rulings §4.3 (`CODEX-P13-P15-OWNER-RULINGS.md:314`).
- **1122-A:10-12 (Owner, 2026-09-27):**
  - D2: a financial-strength band sits beside the creative rank.
  - D3: rivals show their public distress stage plus that band.
  - D4a: Honors reads NOT RECORDED until Awards exists.
- **Rulings §4.1:295:** "Power Ranking separated from persistent Standing".
- **Research, not authority:**
  - RECONCILIATION-02:18 relays "quarterly, transparent Power Ranking".
  - Its row 14 (:123) partly supersedes the package's 52-week candidate: finance goes beside the rank and never inside it, and the sum and the tie rule are tuning.
  - 1102-A:29 classes formula and cadence as tuning.
  - The package's three-lane candidate (package-15.md:448-458) was never approved. This charter uses its shape as a starting point.

**In scope:**
- Wave 1: the pure law.
- Wave 2: a quarterly snapshot archive, the band, and one Bridge view.

**Out of scope:**
- Distress, closure, loans and book net worth (P15B and P11).
- Awards (P08B).
- Acquisition (P16).
- The Legacy dossier (P15C).
- Any change to Standing, the Studio Charts lanes or the chart cadence.

## 2. Measured source facts

1. **Standing.** Three channels, each 0..100 (`types.ts:279-283`). The player's copy is `Studio.standing` (`types.ts:305`); each rival's is `RivalBusiness.standing` (`hollywoodTypes.ts:95`). Standing moves at release through `updateStanding` (`standing.ts:143`, called at `tick.ts:825` and `hollywoodTick.ts:352`) and through awareness drift (`tick.ts:889-895`, `hollywoodTick.ts:379-380`). It is cumulative, not windowed.
2. **The 13-week chart.** It is built on the produced week when `week%13===0||h.chart===null` (`hollywoodTick.ts:408-415`). Each row is `{studioId, standing copy, output}` (`hollywoodTypes.ts:128`). Only `chart` and `previousChart` are kept (`:146-147`). Scheduled entry runs first (`tick.ts:1118-1121`), then `finishHollywoodWeek` (`:1139`).
3. **Chart validation.** It checks the cadence (`hollywoodValidation.ts:543-546`), that the cohort equals the studios entered by the snapshot week (`:550-551`), and that output equals released films before that week (`:555-557`).
4. **Calendar.** Week 0 is 1920 · Week 1, and years have 52 weeks (`calendar.ts:13-20`). So `week%13===0` is the first week of each calendar quarter. Every authored arrival week (520, 988, 1560, 1872, 2548; `calendar.ts:3`) is a multiple of 13, so entrants always join on a chart boundary.
5. **Bridge.**
   - The `studios` view ranks by competition ranking, `1 + count(strictly greater)` (`bridge/industry.ts:90-94`).
   - Movement uses the `sameCohort` rule (`:89`, `:102`).
   - Tied rows are presented in studioId order (`:296`).
   - A trailing-52-week released-films lane is already derived at query time (`:282-294`).
   - The page notice says "there is no combined Power score" (`:243`).
   - Lane schema: `industry-schema.ts:16`, `:126`. `PROJECTION_VERSION = 56` (`bridge-schema.ts:283`). `LIVE_SAVE_VERSION = 42` (`save.ts:6553`).
6. **Film facts.**
   - `criticScore` is clamped to 0..100 at reception (`reception.ts:426`) and frozen in `FilmResult` (`types.ts:253-264`).
   - The audience score is recomputed from live segment shares (`receptionVerdict.ts:103-107`), so it is not a frozen fact.
   - For a film still in its run, only the gross earned so far is public; the rest stays private (`bridge/industry.ts:66-68`).
   - Runs last `THEATRICAL_WEEKS = 6` (`tuning.ts:463`). Rival settlement is recorded in `settledWeek` (`hollywoodTick.ts:373-375`); player runs carry a `status` (`types.ts:315-327`).
7. **Finance.**
   - Rival cash is `RivalAccount.cash`, with periods that are one year long (`hollywoodTypes.ts:67-72`, `hollywood.ts:44`). No Bridge path reads it (`bridge/industry.ts:125`).
   - The rival fixed cost helper `rivalWeeklyOperatingCost` (payroll + overhead + capacity Opex, `hollywood.ts:106-111`) also sizes rival reserves of 12-20 weeks (`hollywoodTick.ts:59-60`, `hollywoodStartingData.ts:12-28`).
   - The player's burn adds research to the same three terms (`economyView.ts:70-73`).
   - No band, distress stage, loan or book-net-worth code exists. The only related code is the player recap's `RecoveryPosition` (`studioRunRecap.ts:79-84`).
8. **Honors.** None are recorded. `blueprintRequirements.ts:68` says "Awards are not part of the game yet.", and `bridge/industry.ts:248` says "honors are not recorded."
9. **Announcements.** `filmAnnounced` is emitted only for rivals (`hollywoodTick.ts:249`); player release rows live in `studioHistory` (`tick.ts:655`). A "scheduled-to-released" delivery lane would therefore read sources that differ between player and rivals (inferred).

## 3. The initial formula, `power-ranking/v1`

**Cadence.** A snapshot is taken at produced week W when `W%13===0`, the chart's own quarterly boundary. The chart's off-cadence first observation (`h.chart===null`) never produces a ranking. The window is `[W−52, W)`: the four complete quarters before W.

**Symmetry.** One function reads the same facts for every studio: films released in the window with `releaseTick`, `criticScore`, whether the run has ended by W, and final gross; plus cash and weekly fixed cost. It has no player flag and uses no RNG.

**Lane F, "Films" (0.0-10.0).**
- Each film released in the window whose run has ended by W scores `10 × (CRITIC_SHARE × criticScore/100 + (1−CRITIC_SHARE) × reach)`.
- `reach = min(1, totalGross / max(baseMarketValue,1) / REACH_SCALE)`, the same guard as `standing.ts:121`.
- The lane is the mean of the best `FILM_CAP` film scores. With no finished film, the lane is 0.0 with the reason "no finished release in the window".
- A film still in its run counts toward Releases now and toward Films at the next snapshot. A 6-week run always finishes inside the next window.
- Example: critic 60 and gross 0.45 × baseMarketValue give reach 0.5 and a film score of 5.5.

**Lane R, "Releases" (0.0-10.0).** `10 × min(n, RELEASE_CAP) / RELEASE_CAP`, where n counts campaign releases in the window. Authored pre-1920 films are excluded. This lane replaces the package's "delivery" lane, because fact 9 shows no symmetric source for delivery.

**Lane H, "Honors".** Always NOT RECORDED, with no numeric field. When Awards records real honors, formula v2 adds the lane. v1 snapshots keep their tag and are never recomputed (RECONCILIATION-02:183).

**Precision.** Film scores and lanes are stored as integer tenths, rounded half up once each, so equality comparisons are exact.

**Points and rank.**
- Points = F + R, shown as "x.x of 20 · 2 of 3 lanes recorded (Honors not recorded)".
- Rank uses competition ranking (1-1-3): 1 + the number of ranked studios with strictly more points. This is the rule already used at `bridge/industry.ts:93`.
- Tied rows are presented in studioId order, which never changes a rank.
- No secondary tie-break is used: not a lane, not Standing, not money.

**Eligibility.**
- Ranks are published only once the industry record covers the whole window (`h.originWeek ≤ W−52`). Before that the page reads "Not enough comparable history for a Power Ranking." (annex:1028).
- A studio is ranked once `enteredWeek ≤ W−52`. Until then its row shows its lanes and "Ranked from <date>".
- Inferred: a fresh campaign's first ranked snapshot is week 52 (1921 · Week 1), because originWeek is the starting tick (`hollywood.ts:174`).
- Movement uses the prior snapshot's rank when the ranked cohort is identical; otherwise it shows `new` or `unavailable`, as at `bridge/industry.ts:102`.

**Financial-strength band (D2/D3; shown beside the rank, never part of it).**
- `weeks = floor(cash / weeklyFixedCost)`.
- Player fixed cost: `weeklyPayroll + weeklyOverhead + weeklyFacilityOperatingCost`, under the founding gate `weeklyBurn` uses. Rival fixed cost: `rivalWeeklyOperatingCost`. Research spending is discretionary and is excluded on both sides.
- Labels:
  - In the red: cash ≤ 0 (the existing wording at `financeReport.ts:280-282`).
  - Strained: cash > 0 and weeks < 13.
  - Stable: 13 to 25 weeks.
  - Thriving: 26 weeks or more, or a fixed cost of 0.
- The band is frozen with its snapshot. It never feeds points, rank, row order or any sort key. No rival row carries a finance number.
- The "Leveraged" label and the debt/asset input from the research report (§4.2) wait for loans.
- 13-week averaging is not needed yet. Nothing can be borrowed, so a studio cannot inflate its cash just before a snapshot (inferred).

**Distress stage.** Every row shows `notRecorded` until P15B's distress law writes a stage. Following 1347-F, no enum member is published before a writer exists.

**What the player sees in each row:**
- rank ("#n of m ranked") and movement since the prior quarter;
- the Films value with up to four counted films (title, critic score, reach points);
- the Releases value with its count and cap;
- Honors NOT RECORDED;
- points;
- the band;
- the distress stage.

The page also shows the definition version, the window dates and the annex M.4 banner: "Power Ranking is recent comparative momentum. Studio Standing and Studio History are separate." The notice at `:243` changes the day this ships, and Studio Charts stays.

| TUNING constant | Value | Provisional reason |
|---|---|---|
| `POWER_RANKING_WINDOW_WEEKS` | 52 | Four complete quarters. One film cannot swing a year, and it matches the existing "Last 52 weeks" lane (`:284`) |
| `POWER_RANKING_FILM_CAP` | 4 | The package candidate (package:450), so volume cannot buy the Films lane |
| `POWER_RANKING_RELEASE_CAP` | 4 | A typical rival releases about two films a year (1323-A:96) and scores 5.0. Four a year fills the lane, and more adds nothing |
| `POWER_RANKING_CRITIC_SHARE` | 0.5 | Critics and audience reach weigh equally. Both are public and frozen |
| `POWER_RANKING_REACH_SCALE` | 0.9 | The measured pooled p90 reach (`tuning.ts:91`), copied into its own constant so Standing tuning cannot move the rank |
| `POWER_RANKING_BAND_STABLE_WEEKS` / `_THRIVING_WEEKS` | 13 / 26 | One and two quarters of fixed costs. Authored rival reserves are 12-20 weeks, so an ordinary rival reads Stable |

## 4. Persistence and projection

- **Lanes could be derived; the band cannot.** Lanes can be rebuilt later from persisted films. Cash at W cannot be recovered, and frozen snapshots must never be recomputed under a later formula. The Legacy dossier (ruling 5) needs quarterly history that no later version could backfill (RECONCILIATION-02 §4.3(4); annex G.1:541).
- **Proposed root.** `powerRanking: {version:1, recordedFromWeek, snapshots[]}`. Each snapshot is `{week, definitionVersion, rows:[{studioId, filmIds(≤4), filmsTenths, releases, band}]}`. Rank, points and movement are derived from the rows; there is no stored blended score (annex D.4:251).
- **Size.** About 480 snapshots per century, with at most ten rows each.
- **Migration.** An empty archive with `recordedFromWeek` set to the migration week, and no backfill (annex G.2:557).
- **Order.** Save43 goes to shelving (1344-A:111-126). Save44 and projection 57 go to relationship slice B (1347-A:92-93, 1347-F:62-67). P15A.1 Wave 2 then needs its own root and save (1323-A:106).
  - P15A.2 Wave 1 (pure `src/core/powerRanking.ts` plus the constants) needs no save and no projection. It can be staged now, queued behind the one production writer.
  - Wave 2 takes the next save after P15A.1 Wave 2 (expected Save46) and the next projection after 57, both allocated from the live values when production starts.

## 5. RED tests

1. `rank-quarter-boundary`: exactly one snapshot per produced week with W%13===0; none at W±1 or at originWeek+1.
2. `rank-window-edges`: releaseTick W−52 counts and W−53 does not; release and settlement edges tested separately.
3. `rank-running-film`: an unfinished run counts in Releases only, then in Films at the next snapshot.
4. `rank-film-cap`, `rank-release-cap`: a fifth film or fifth release changes nothing; the best four are selected.
5. `rank-ties`: equal points produce 1-1-3; swapping the IDs of tied studios swaps only their presentation order.
6. `rank-owner-swap`, `rank-id-swap`: the same facts give the same lanes and band whether the studio is the player or a rival.
7. `rank-determinism`: two runs produce byte-identical archives, and RNG stream positions match the control.
8. `rank-standing-independent`: changing any Standing channel changes nothing; the ranking writes no Standing and no chart.
9. `rank-finance-independent`: changing cash or fixed cost changes only the band, never points, rank or order; no band sort key exists.
10. `rank-no-private-balance`: rival rows carry no finance number, and a probe cash value appears nowhere in the payload.
11. `rank-honors-not-recorded`: every row shows `notRecorded`, has no numeric honors field, and is labelled "2 of 3 lanes".
12. `rank-distress-not-recorded`: v1 publishes only `notRecorded`.
13. `rank-explainable`: each counted film is a real release of that studio in the window, and the lanes recompute exactly from its public facts.
14. `rank-eligibility`: early weeks show "not available"; an entrant is unranked until 52 weeks after entry; movement follows cohort changes.
15. `rank-persistence`: the snapshot survives a save/load round trip; validation rejects off-cadence, future, wrong-cohort, out-of-window and lane-mismatch rows; migration yields an empty archive.
16. `rank-bounded-harness`: a pure 6,240-week run gives exactly 480 snapshots with bounded rows.

## 6. Open questions

- **Q1 (parent): archive or current plus prior?** Recommended: archive, per §4.
- **Q2 (parent): where the root lives.** Recommended: a new P15 root rather than a key inside `HollywoodState` (`hollywoodValidation.ts:81`).
- **Q3 (parent): when the step runs.** Recommended: at the end of the tick, after `advanceLifecycleSettlement` (`tick.ts:1160`), so cash is final for the week. The alternative is beside the chart at `hollywoodTick.ts:408`.
- **Q4 (parent): publish the two-lane total?** RECONCILIATION-02:183 advises publishing no sum while a lane is NOT RECORDED. This charter publishes it with its scale stated, so the order can be checked from visible numbers. Either choice is class C (RECONCILIATION-02:82).
- **Q5 (parent): which tie rule?** The package proposed dense ties (:455). This charter uses competition ranking, as the adjacent screen does (research report §4.3(2)).
- **Q6 (parent): share a save step?** P15A.1 Wave 2 and P15A.2 Wave 2 could share one save step if they are ready together.
- **Owner questions: none.** Package :453 says the definition "never reads ... cash/valuation". The band does read cash, but it stays outside the definition's order, which is what D2 and RECONCILIATION-02 row 14 require. Showing the distress stage as `notRecorded` keeps D3's presentation without inventing a stage.
