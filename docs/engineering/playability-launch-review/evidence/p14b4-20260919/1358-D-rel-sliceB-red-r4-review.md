<!-- 1358-D: independent review (read-only) of relationship slice B RED r4, saved verbatim by the parent -->

# 1358-D: independent review of relationship slice B RED r4

**Verdict: REFINE**

**Scope.** I read 1347-A, B and F, 1358-F, F2 and F3, 1358-C to C4, 1358-X and X2, the r3 and r4 patches, the r4 classification, the X2 outputs, the six test files in `/Users/zacheryspector/studio-scratch/1358-x2/tree` (commit 6b1c8f8), the producer tree, and the cited source at HEAD e7f075ce. Every `tests/...:n` below is an r4 line in that tree. I decoded the dry-run capture with python3. I ran no vitest, tsc, node, tsx or vite-node, and I opened nothing else under `tests/fixtures`.

**The inputs match their records.**
- sha256 values: r4 patch d41ea111…, classification 3b008e0a…, producer 04713f73… (equal to the ptree copy), x2 JSON f2908cb0…, x2 text 323baeec…, tsc output 3cc6aa84…, p2-dry ba5f6f96….
- The tree's six test blobs equal the patch post-images.
- e7f075ce changes nothing under `src`, `bridge`, `ui`, `generated` or `tests` relative to b0809602.

## 1. Coverage: NOT MET

These obligations have leaves:
- **The log:** one row per pair per production, two slots in one row, one row per production after a re-greenlight, rows never exceeding `sharedCompetitions`, and no RNG draw (competitions-log :186-243).
- **Rivals:** labels :61-151.
- **Romance:** the constants, decay, status, eligibility under Reading B, both high-proximity seat pairs, success growth, the ruled write order, formation, re-formation, the ending on read and at the next touch, the drift exemption and its resumption, and the strict Picks (romance :155-578).
- **Save44:** the migration and the refusals (save-v44 :89-290).
- **Bridge:** projection 57, disclosure, the DTO shape, the leak law and the Mentor gate (Bridge :140-290).
- **Rulings:** every item of 1358-F §1-§3 and §5, F2 §1-§7 and F3 §1-§3 has landed.

These obligations have no leaf:
- **Romance consequences** (1347-A:60, and §6 item 3 at :151, which 1347-F adopted unamended and 1347-B:41 calls routine).
  - No slice B file tests that Partners:
    - counts as a close tie in D5, below hostility (`src/core/talentMarket.ts:911-919`);
    - joins the expiry note (`bridge/finance-upcoming.ts:24-39`, 1347-A:18);
    - adds a chemistry reason;
    - reads sign +1 at Strained and -1 at Enemies (`src/core/relationships.ts:480-491`).
  - Under 1347-F Amendment 2, "below hostility" can only mean that a Partners pair whose own tier is Enemies counts as enemies.
- **Non-triggers at the write seam** (1347-A:129).
  - Romance :253 and :259 prove only that `romanceStatus` cannot read studio, retirement or tier.
  - The ending is recorded in `advanceRelationshipsWeek(state, delta, week)`, which holds the whole state. A GREEN that ends a bond on retirement or on a studio change there passes every leaf.
- **A third party's derived ending at a formation check** (1347-A:56: "or either person's formation check").
  - Romance :277 stages an open, undecayed bond.
  - No leaf stages a third-party bond that has already ended on read. Such a bond must not block (d,l), and the formation check must record its ending.
- **The ending changes no closeness and no counter** (1347-A:57, :127).
  - Romance :488 checks driver kinds only.
  - Its peak expression at :502 cannot fail, because peak only rises.
- **The Save44 chain and the live route:** see check 3.

## 2. Assertion strength: NOT MET

- **X2 against the classification.**
  - All 87 rows match an X2 test by full identity: 73 `fails` failed, 13 `control-passes` passed, and the one `not executed` row (the third-party leaf) failed at its guard (:279), as the row derives.
  - For all 74 failing slice B rows, X2's first message is the row's declared failure. Examples:
    - :347 "expected 300 to be 401";
    - :418 "expected NaN to be undefined";
    - :510 "expected 70 to be 90";
    - every save-v44 refusal fails as a regex mismatch on "validateSaveV44 is not a function";
    - Bridge :140 "expected 56 to be 57";
    - the TypeErrors at Bridge :277 and :289.
  - No row mismatches at X2.
- **A leaf that a lawful GREEN fails (blocking 1).**
  - Bridge :280-290 expects Mentor withheld after it removes the release of a picture the player made. The fixture is `tests/helpers/p14c3-cohort-transition-fixtures.ts:127-161, :214-231`, and that picture's first take keeps `studioId` = player.
  - 1347-A:105 lets evidence cite "released pictures or the viewer's own". §6 item 8 (:156) withholds Mentor only for rival pictures until they are public, and 1348-E:238 reads it the same way.
  - Under the charter, this variant shows Mentor.
- **A leaf that GREEN can pass for the wrong reason (blocking 4).**
  - Save-v44 :242 stages `endedWeek: 150` on a save made at week 130 (`tests/p14d1-rival-shelving-fixtures.ts:9`).
  - The house root law bounds every week by the recording interval (`src/core/relationships.ts:547-554`, applied at :576-577, :587 and :596).
  - A Save44 validator that extends that law refuses week 150 first. That message matches `/romance|bond|order/i`, so the ordering check is never exercised.
- **Sub-assertions that cannot fail.**
  - Romance :502.
  - Labels :143-146: `rivals` never receives `state`. The edge half at :148-150 is a real check.
  - Competitions-log :219-221: P3a and P3b share one tick, so `<=` always holds, and the comment "strictly later" is wrong.
- **The controls pass for the right reason.**
  - Romance :265: slice A leaves romance null, and the `sharedProductions` premise reads 2.
  - Romance :474: the staged `endedWeek` is kept.
  - Romance :529: slice A counts from lastEventWeek and reads 60; counting from endedWeek would give 57.
  - Romance :569: the closure is never called, so the RED shows at the type gate.
  - Competitions-log :232 and :237, and Bridge :160, :212 and :234: the existing route, disclosure and leak law.
  - Each becomes a real check at GREEN, except the :502 expression.
- **The guards fail by name.**
  - The typeof guards fail before any fixture work (:205, :279, :298, :366, :453, :539).
  - The budget checks throw `BaseWorldBudgetExceeded` (:142-145), `RosterWorldBudgetExceeded` (Bridge :121-125) and `CohortThreeFilmsBudgetExceeded` (Bridge :261-265). Each message names its constant, and each caches the error so no later leaf rebuilds.
  - No budget fired in X2.

## 3. Save44 (`tests/p14b10-save-v44.test.ts`): NOT MET

- **Migration from 43: met.**
  - :105-119 runs the real `convertV42ToV43` (`save.ts:10678-10685`), then `convertV43ToV44`, and strips and compares every edge.
  - :121-146 runs the producer capture.
- **Refusals: met, but loosely pinned.**
  - :172-266 holds five log refusals, four romance refusals and three accepted shapes (1347-A:94). :275-290 holds the two downgrade refusals by name.
  - `convertV44ToV43` will validate first, as `convertV43ToV42` does (`save.ts:10690`). So `/competit/i` and `/romance/i` also accept a refusal from the validator.
- **The chain: not met.**
  - `migrateToV44` is only asserted to exist (:94); no leaf calls it.
  - No leaf sends a V44 envelope down the chain. Save44 must extend 38 downward `saveVersion === 43` branches (the first is at `save.ts:7414`) and `migrateToV43` (`save.ts:10706-10709`).
- **Live against historical saves: not met.**
  - :90 pins `LIVE_SAVE_VERSION`.
  - No leaf covers `makeSave` stamping 44 (`save.ts:6560-6569`), `validateSave` dispatching 44 (`save.ts:5436-5439`), or `migrateToLive` lifting a V43 save (`save.ts:10138-10140`).
  - The Save43 RED had both kinds of leaf (`tests/p14d1-rival-shelving-save-v43.test.ts:82-87, :89-108`).
  - The "lossless" leaf (:270-273) checks only that nothing throws.
- **"V42 competitions count as evidence but give no Rivals label"** (:149-160) checks only that the validator accepts the edge. It calls neither `hasConflictEvidence` nor `professionalRivalsEvidence`, and no migration runs, although the title says "after migration".
- **The GENUINE leaf's title** says it "preserves its non-empty screenplayShelving". The body checks shelving on the input only (:136-139).

## 4. The producer r4: MET

- **Founding order.**
  - Producer :135 calls `foundStudio(fundIfNeeded(s0), market)`. `foundStudio` (:76-87) follows conflict-evidence :237-246 step for step.
  - p14b9 :144-154 differs only in signing every market actor (:147).
  - The cycle at :136-139 equals conflict-evidence :285-288.
  - C4's three equivalences hold:
    - `hiringMarketIds` reads no cash (`src/core/employment.ts:410-443`);
    - `p13aGeneratedStudio` does not tick (`src/harness/p13a/fixtures.ts:9-12`, `src/core/worldgen.ts:676`);
    - `fundIfNeeded` (:115-123) writes the same cash, kind and amount as `fund` (`tests/helpers/p14b2-fixtures.ts:15-19`), but with a different ledger note and no zero-delta row.
- **Funding before founding is right.** Both reference routes fund before the first `signContract` (p14b9 :145, conflict-evidence :237). They fund only after cancels after that (conflict-evidence :286, :288).
- **The cancel at :139 is lawful.**
  - It is the reference route's own player action at :288. It makes the producer a strict prefix of conflict-evidence through :288; r3 diverged there.
  - A cancel before any first take moves no relationship counter. In the capture, each slate pair holds `sharedCompetitions` 2 and `sharedCancellations` 0.
  - F3 §4 froze r3, so the parent should adopt this change in one line.
- **Premises.** All held in X2:
  - `LIVE_SAVE_VERSION` is 43 (:55);
  - the HEAD pin (:56-58);
  - the output guard (:59) and `flag: 'wx'` (:53);
  - at least three market actors (:72-73);
  - the pair premise (:140-141);
  - the shelving premise by week 400 (:145-156);
  - the writer round trip (:160-161).
- **The week-284 capture.**
  - Gzip hash a731677f… and decoded hash 1a3866a9… both equal the MANIFEST.
  - saveVersion is 43 and the tick is 284.
  - It holds 39 edges, none with a `competitions` or `romance` key.
  - The three slate pairs sit at `sharedCompetitions` 2, with closeness 100, 92 and 76 after later shared work from week 261.
  - Rival studio r04 holds 1 rejection and 0 shelved screenplays.
  - All six player contracts carry `endedWeek` 208. The player holds 10,807,746 in cash and no active production.
  - Only the GENUINE leaf reads the capture (:134-145), and none of its assertions assumes a live contract.

## 5. Budgets: MET

- **F3's numbers are in the code:** romance :130 sets 90,000; Bridge :98 sets 45,000; Bridge :251 sets 240,000. No "PROVISIONAL" remains, and the timeouts keep the 1356-F5 note.
- **X2's figures match the JSON:**
  - `baseWorld()`: 22,617 ms, 4.0× under budget;
  - `rosterWorld()`: 9,867 ms, 4.6×;
  - the Mentor cohort: 46,539 ms, 5.2×.
  - Node v20 ran these 1.6×, 1.7× and 1.2× slower than v22. F3 assumed 1.4×.
- **Full-suite risk.**
  - X2 already ran three workers at once: romance from 0.0 to 22.9 s, Bridge from 0.4 to 57.8 s and p14b5 from 0.1 to 52.5 s. Vitest 2.1.9 defaults to `max(numCpus - 1, 1)`, which is three forks on this 4-thread i5-5250U, so a full-suite run has the same concurrency.
  - `tests/p14b5-relationships.test.ts` ran 38.4-54.3 s in the 1302-1338 broad and full-core runs, against 52.4 s in X2.
  - The worst load factor this repo has measured is 3.7× (1359-F4:12, 1353-F3:20-21). At that factor:
    - `baseWorld()` would take about 84 s against its 90 s budget (7% headroom);
    - `rosterWorld()` about 37 s against 45 s;
    - the cohort about 172 s against 240 s.
- **Verdict on false fires.** Under the heavy-lane lock, no budget should fire. Only `baseWorld()` can fire, and only under outside load. I would set it to 120,000 ms.
- **A minor slip.** F3's 240 s cohort budget sits just under its own "six times, rounded up" rule (40,219 × 6 = 241,314). That is harmless at 5.2×.

## 6. Type-level RED: MET

- The root gate exits 2 with exactly 17 errors; the UI and Bridge gates exit 0.
  - TS2305 ×10: labels (47,10) and (48,10); romance (89,3), (89,24), (89,48), (89,77), (90,3), (90,27), (91,47) and (91,81).
  - TS2353 ×5: (514,90), (532,90), (551,92), (552,91) and (563,126).
  - TS2578 ×2: (572,7) and (574,7).
- All 17 are intended under 1348-C5, and no other errors appear. Save-v44, competitions-log and Bridge add none.
- Against 1358-X, the positions shift by exactly +3 and +6, which matches r4's added lines.

## 7. Rebase and diff: MET

- Comparing post-images, r3 and r4 are identical for competitions-log, labels, save-v44 and the p14b5 hunk.
- **Romance** changes only in:
  - the header;
  - the budget constant, comment and message;
  - the third-party guard.
- **Bridge** changes only in:
  - the header;
  - the `performance` import;
  - the self-timing of `rosterWorld()`;
  - the two declared comment fixes (:90, :110-111);
  - the `mentorCohort()` wrapper and its two call sites.
- **The producer** changes only in:
  - the founding call;
  - the cancel;
  - the docstring and the provenance route.
- The base blobs (p14b5 1225928, producer 9b2b4a4) equal both b0809602 and e7f075ce, so r4 applies alone at HEAD.

## 8. Classification integrity: MET, with one row to update

I checked all 87 rows against X2 and 30 against the code.

The hand derivations hold:

| Leaf | Derived value |
|---|---|
| :449 | ending week 264 |
| :538 | ending week 1252 |
| :364 | 42, 60 and 38 for the three write orders |
| :560 | 66, which reads Friends |
| :529 | 60, against 57 counted from endedWeek |
| :510 | 70 at week 1182 |

The counts are 73 fails, 13 control-passes and 1 not executed. Three findings:
- **The GENUINE row will go stale.** X2-Next puts the recorded mint before the recorded RED. After the mint, this leaf passes its premises and then fails on `convertV43ToV44 is not a function`, not on the missing fixture (blocking 5).
- **The third-party row** still reads "not executed", although X2 observed it failing.
- **Three failing leaves carry "[control: …]" in their titles:** labels :121 and :127, and romance :405.

## 9. C4's "Uncertain" list

1. **Shelving by week 400.** X2 answered it: week 284, with one rejection and nothing shelved. No ruling is needed.
2. **The cancel at :139.** It needs a one-line adoption. I recommend adopting it.
3. **Contract expiry.** Answered: no leaf depends on the contracts being live. No ruling is needed.
4. **The Mentor timer.** C4's reasoning is correct, because no config turns off per-file isolation. No ruling is needed.

Two further points need the parent:
- whether the item 8 public gate also covers the viewer's own pictures (blocking 1);
- whether to defer the romance consequences out of slice B (blocking 2a).

## Blocking defects

1. **Bridge :280-290 asserts a rule the charter does not hold.**
   - *Fix:* move the unreleased picture to a rival. Set its first-take `studioId` to a rival business and drop its release fact, then expect Mentor withheld. Optionally keep today's variant with the expectation flipped.
   - *Alternative:* the parent rules that item 8 also covers the viewer's own pictures.
2. **Romance obligations without a leaf.** One staged leaf each:
   - **(a) Consequences:**
     - a D5 settlement through the p14b5 family 6b apparatus: a Partners counterpart at Friends gives close ties, and a Partners pair at Enemies with evidence gives enemies;
     - `financeUpcoming` naming a Partners roster counterpart;
     - `pairChemistry` returning sign +1 with a Partners reason at Strained, and -1 at Enemies.
   - **(b) Non-triggers:** call `advanceRelationshipsWeek` at a staged retirement week, with a studio change and a drop to Strained. Expect `endedWeek` null and `romanceStatus` 'partners'.
   - **(c) A decayed third-party bond:** stage a decayed open (l,z) bond and a crossing take on (d,l). Expect (d,l) to form and (l,z) to record its derived ending.
   - **(d) No closeness or counter change at the ending:** in :488, replace the :502 expression with a comparison against a twin edge that has `romance: null`.
3. **The Save44 chain and the live route are untested.** Add two leaves:
   - `migrateToLive(importSave(<GENUINE V43 raw>))` reads version 44, with empty fields on every edge;
   - `migrateToV43(convertV43ToV44(v43))` deep-equals `v43`.
4. **Save-v44 :242:** change `endedWeek: 150` to `120`.
5. **Before the recorded RED,** set the GENUINE row's reason to the post-mint failure, and record the third-party row as observed `fails`.

## Non-blocking notes

1. Set `BASEWORLD_BUDGET_MS` to 120,000.
2. GENUINE leaf: assert that the output keeps the input's `screenplayShelving`, and reuse the strip-and-compare at :117-118.
3. Save-v44 :149-160: convert from V43, then assert `hasConflictEvidence` true and `professionalRivalsEvidence` null.
4. Downgrade leaves: match `/cannot downgrade.*competit/i` and `/cannot downgrade.*romance/i`.
5. The forged leaves stage literal weeks (10 to 100) on edge 0. A validator that bounds log weeks by the edge's `lastEventWeek`, as `recent` is bounded at `src/core/relationships.ts:597`, could refuse the accepted shapes. Derive the weeks from the edge instead. I did not open that fixture.
6. Labels :135-151: read the label from an edge held in the state.
7. Romance :432 and :474 stage weeks down to -500, which contradicts the :140 comment.
8. Romance :405's title says the rival pair "forms", but the leaf checks only the first gain.
9. Bridge :156-157: assert that both `campaignDate` labels appear in the evidence (1347-A:66).
10. Three gaps worth noting:
    - No leaf shows a log row surviving after its driver folds out of `recent`, which is the log's purpose (1347-A:13, :33).
    - "From the pair's second shared production" (1347-A:48) has no negative leaf. It is unreachable from the baseline, where one production lifts closeness to at most 56.
    - The RED uses `productionId` where 1347-A:33 says `ref`. The landing record should note that the brief's decision governs.
11. The typeof guards could pass the constant's name as the `expect` message.
