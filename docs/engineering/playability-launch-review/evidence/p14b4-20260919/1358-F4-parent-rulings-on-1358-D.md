# 1358-F4: parent rulings on 1358-D, for slice B RED r5

[1358-D](1358-D-rel-sliceB-red-r4-review.md) returned REFINE with five blocking defects. It confirmed that every X2
failure carries its declared reason and that the producer r4 is sound. The test author makes r5 with the items
below, all test-side.

## Blocking items

1. **The Mentor gate follows the charter** (blocking 1).
   - Evidence "cites only released pictures or the viewer's own"
     ([1347-A](1347-A-p14b-relationship-rulings-charter.md):105). §6 item 8 withholds Mentor only for rival pictures
     until all three are public.
   - r5 moves Bridge :280-290's unreleased picture to a rival: the first take's `studioId` names a rival business,
     and no release fact exists. The leaf expects Mentor withheld.
   - Today's variant stays as a second leaf with the expectation flipped: the viewer's own unreleased picture shows
     Mentor, and the evidence cites that picture.
2. **The romance obligations stay in slice B** (blocking 2). 1347-A:60 and §6 item 3, which 1347-F adopted unamended,
   are slice B law, and 1347-B:41 calls them routine. Add one leaf each:
   - **(a) Consequences.**
     - D5 settlement through the p14b5 family 6b apparatus: a Partners counterpart at Friends counts as a close tie,
       and a Partners pair at Enemies with evidence counts as enemies (1347-F Amendment 2).
     - `financeUpcoming` names a Partners roster counterpart.
     - `pairChemistry` returns +1 with a Partners reason at Strained, and -1 at Enemies.
   - **(b) Non-triggers at the write seam.** Call `advanceRelationshipsWeek` at a staged retirement week, with a
     studio change and a drop to Strained. Expect `endedWeek` null and `romanceStatus` 'partners'.
   - **(c) A decayed third-party bond.** Stage an open (l,z) bond that has decayed and a crossing take on (d,l).
     Expect (d,l) to form and (l,z) to record its derived ending (1347-A:56).
   - **(d) The ending moves no closeness and no counter** (1347-A:57, :127). Replace the :502 expression with a
     comparison against a twin edge whose `romance` is null.
3. **The Save44 chain and the live route** (blocking 3). Add two leaves:
   - `migrateToLive(importSave(<the GENUINE V43 raw>))` reads version 44, with `competitions: []` and `romance: null`
     on every edge. Through `makeSave` and `validateSave` this also covers the live stamp and the dispatch.
   - `migrateToV43(convertV43ToV44(v43))` deep-equals `v43`.
4. **Save-v44 :242** (blocking 4): `endedWeek: 150` becomes 120, inside the week-130 save's recording interval, so the
   ordering refusal is what the leaf exercises.
5. **The mint precedes the recorded RED** (blocking 5).
   - **The order:**
     1. the RED r5 commit (tests and the producer);
     2. the recorded mint 1358-P at that commit (Save43 source);
     3. the fixture commit;
     4. the recorded RED.
   - **Why.** At RED the GENUINE leaf then fails on the missing Save44 law, not on a missing file.
   - **The classification.** The GENUINE row declares the post-mint failure, and the third-party row records its
     observed `fails`.

## Adopted from 1358-D's checks and notes

- **The producer cancel at :139** (r4's one unordered change) is adopted. It makes the producer a strict prefix of the
  conflict-evidence route (1358-D check 4).
- **`BASEWORLD_BUDGET_MS` becomes 120,000** (note 1). At the worst measured load factor of 3.7, X2's 22.6 s build
  reaches about 84 s, which leaves 7% headroom under 90 s.
- **Sub-assertions that cannot fail** (check 2) are rewritten so each can fail:
  - labels :143-146, where `rivals` never receives `state`;
  - competitions-log :219-221, where `<=` always holds. Fix the comment "strictly later" or the assertion.
- **Titles.** Failing leaves lose their "[control: …]" prefix: labels :121 and :127, and romance :405. Retitle
  :405, or extend it to check formation.
- **Notes 2-9 and 11, as 1358-D words them:**
  - the GENUINE leaf keeps its input's `screenplayShelving` (strip and compare);
  - the V42-competitions leaf converts from V43 and asserts `hasConflictEvidence` true and
    `professionalRivalsEvidence` null;
  - the downgrade regexes name the downgrade;
  - forged log weeks derive from the edge;
  - labels read an edge held in the state;
  - romance :432 and :474 follow the :140 comment;
  - both `campaignDate` labels appear in the evidence;
  - each typeof guard's message names its constant.
- **Note 10.**
  - Add one leaf in which a log row survives after its driver folds out of `recent` (1347-A:13, :33).
  - The "second shared production" negative leaf is unreachable from the baseline, so it is not required.
  - The RED's `productionId` follows the brief where 1347-A:33 says `ref`. The landing record notes it.

## Next

1. r5 from the author, applying alone at HEAD, with a classification and a handback (1358-C5).
2. **Parent dry run 1358-X3.** It runs the six files with X2's capture placed where the GENUINE leaf reads it, so the
   post-mint reasons are measured. It also runs the type gates and the producer again.
3. Confirmation review 1358-D2.
4. The four steps of item 5.
