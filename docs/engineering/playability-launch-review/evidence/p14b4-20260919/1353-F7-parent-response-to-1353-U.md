# 1353-F7: parent response to 1353-U

[1353-U](1353-U-p15c-legacy-tuning-review.md) returns REFINE on [1353-T](1353-T-p15c-legacy-tuning-amendment.md) and
[1353-F6](1353-F6-parent-rulings-on-1353-T.md). It confirms the values (critic 60, hit line 49, share floor 20), the
bump to `campaign-legacy/v2` and the frozen v1 entry. Its findings 6-9 block the P15C RED r6 brief. The parent checked
the sources behind findings 5, 8 and 9:
- 1359-A :274-276 ("P15C Wave 2 lands with or after them");
- reference r3 :173-175, :280 and :717-722, against law :783-792, which keeps `definition: CAMPAIGN_LEGACY_DEFINITION`;
- p15c1 :318, :591 and :888, where the Wave 1 fixtures derive from the file's restated constants.

The reviewer's scripts sit in [1353-stage/u/](1353-stage/u/).

## Rulings

1. **1353-F6 stands, as amended below.** Its values and its rulings 2, 4 and 6 keep their text. The amendments add to
   rulings 1, 3, 4 and 5.
2. **Ruling 1's premise, corrected (finding 5).**
   - 1359-A §10 item 3 lands P15C Wave 2 with or after P15A.1 Wave 2, so shared-market pressure is the planned case.
     That strengthens 49.
   - Under pressure the margin is thin. r06 keeps `commercial-engine` while grosses fall at most 1.9% beyond the
     1355-G1 factors.
   - If the gating G-P (item 5 below) finds `commercial-engine` unheld on a tree that carries P15A.1 Wave 2, the next
     value is 48 (r06 +16 under the factors). 48 suits only a tree with pressure: as run it puts the floor at 0.99 of
     the pool's rate.
   - Until Wave 2 production lands, the v2 values are a plan, not landed law. A move to 48 before then needs its own
     record and review, not another definition bump.
3. **The RED r6 brief (findings 6, 7, 9, 10 and 11).** 1353-F6 ruling 3 gains these items:
   - **C11** (r5 :1715-1765):
     - the live pin reads `campaign-legacy/v2`;
     - TUNING equals a v2 literal table: 60, 49 and 20, plus the twelve unchanged values;
     - the frozen v1 entry keeps its fifteen literals;
     - the test also pins the frozen v2 entry's literals and the table's key set, so an in-place edit of v2 fails the
       way an edit of v1 would;
     - the unknown-definition probe at r5 :1764 uses an id outside the table.
   - **B1** (r5 :1373-1374): the frozen manifest's definition reads `campaign-legacy/v2`. The catch-all in ruling 3
     now covers the definition string as well as 70, 90 and 25.
   - **The after-retune leaf** (r5 :1829-1856):
     - it builds a real v1 manifest on the v2 tree from G6240, with v1's frozen thresholds and the definition
       `campaign-legacy/v1`, and asserts that it validates under live v2 TUNING;
     - it asserts that the retune is material: the player reads 7 acclaimed of 122 under v1 (not held) and 37 under
       v2 (held);
     - it asserts that the same manifest relabelled as the other era refuses on replay;
     - it keeps the check that an unbumped retune of live TUNING fails the era guard.
   - **`tests/p15c1-campaign-legacy.test.ts`:**
     - ruling 3's lines move, and the comments at :581-582 and :878 change with them;
     - :311-312 cites 1353-T and 1353-F6;
     - the classification declares the five leaves that fail at the RED commit, with their first messages: :334-337,
       :580-600, :627-652, :942-1007 and :1892-1920.
   - **`tests/helpers/p15c2-route-l.ts` stays byte-identical to r5,** so producer r4 and 1359-X3 still describe the
     mint.
4. **Reference r4 comes with RED r6 (finding 8).** The RED author moves the reference GREEN to v2 before the parent's
   dry run, so the dry run can show every leaf passing:
   - 1353-T §7.1 with 49 at `tuning.ts:1047`;
   - law :1 and :72 name v2;
   - a frozen v2 entry beside v1;
   - each entry's evaluator stamps its own definition, boundary and mode;
   - law :192's `definition` type widens to the table's keys.

   Wave 2 production follows the reference, as before.
5. **G-P (finding 12).**
   - The first run, 1353-X4, is queued as ruled. 1353-U's expectation adds `retune: []`,
     `retuneSomeSeedReading: ['artistic-voice', 'audience-institution', 'commercial-engine']` and the law
     `campaign-legacy/v2`.
   - **The gating run uses the tree Wave 2 production lands on.** That tree carries slice B's Save44 production, and
     P15A.1 Wave 2 when it lands first or together. Slice B joins the triggers.
   - Before that run, the probe gains a branch for the sibling P15 roots (`p15Sequence`, `powerRanking`,
     `corporateCondition`, `sharedMarket`), which it refuses today (probe :50-57). An agent writes the branch and a
     reviewer checks it.
6. **The playtest brief (finding 13)** carries two more facts:
   - G6240's engaged driver releases 122 films, 37 of them (30.3%) at critic 60 or above. It holds `artistic-voice`
     at 60/20 and not at v1's 70.
   - At the pool's rates, a 25-release career holds by chance 41% of the time at critic 60 and 48% at a hit line of
     49. The count floor of 5 binds there, so the Owner should judge whether short careers earn an archetype too
     easily.
7. **Wording (finding 14).** The `tuning.ts:1036-1037` comment cites 1353-T and 1353-F6. Wave 3-4 dossier copy keeps
   "acclaimed" (critic) and "hit" (gross) apart, because the critic band "hit" shares the word.

## Order

1. 1353-X4 runs in the heavy lane after the recorded gates and 1358-X4.
2. The P15C RED author writes RED r6, its classification, reference r4 and handback 1359-C6, under this record and
   1353-F6.
3. The parent dry-runs r6 against reference r4 (1359-X5), then review 1359-D5 confirms r6.
4. The P15C mint and recorded RED keep their place, after slice B's Save44 production.
