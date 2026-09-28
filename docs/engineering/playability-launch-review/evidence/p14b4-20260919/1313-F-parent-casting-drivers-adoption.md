# 1313-F: parent adoption of the casting-driver expansion

The parent read frozen [1313-A](1313-A-casting-drivers-expansion.md) and independent
[1313-B](1313-B-casting-drivers-review.md) (REFINE: four required changes, six notes) in full and checked each cited
line. Adopt 1313-A with the amendments below. 1313-A stays byte-frozen. Every number stays a named hypothesis.

## Amendment 1: the seam is inside `applyGreenlight` (1312-F note 3)

1313-A moved the mint to `applyGreenlightScriptProjectNow` without reconciling 1312-F. Today both places see the
same greenlights: `applyGreenlight` (`src/core/actions.ts:290-300`) takes `scriptProjectId` as a parameter, its only
other caller is the legacy `greenlight` action, and a managed casting session requires managed development, where
`requireGreenlightHeader` refuses a greenlight without a script project. 1312-F's place also covers any later caller,
so it wins. The mint runs in `applyGreenlight` after the production is admitted, when `scriptProjectId` is defined
and the project has a complete casting session (`castingSessionForProject`). The studio comes from
`state.hollywood?.playerStudioId`, and no driver is minted when it is undefined: the `applyCancel` precedent at
`actions.ts:621-624`, which 1313-A cited at the wrong lines (`:592-599` is the not-found throw).

## Amendment 2: one competition per pair per admitted production

A slate may name the same two people in two slots (`assertCastingSlateLaw`, `src/core/castingSessions.ts:121-142`,
requires only distinct people within a slot and three distinct people overall). The law counts competitions the way
`sharedProductions` counts productions:

- For each slot, the pair is (seated person, the slot's other candidate) when the seated person is one of that
  slot's two candidates. The helper collects these pairs in canonical form and de-duplicates them before any write.
- Each distinct pair gets one `castingCompetitionLost` driver with `ref` = the production id, and
  `sharedCompetitions` rises by one. A pair where each person won one slot from the other still records one
  competition on that production.
- The helper runs once per admission and production ids never repeat (`predictProductionId`, `actions.ts:362-364`),
  so exactness does not depend on the capped `recent` window.

## Amendment 3: a re-greenlight after a cancel is a new casting decision

`applyCancel` returns the script project to Ready, and its complete casting session stays usable. Greenlighting it
again seats people against the same audition under a new production id, and that admission mints again. This is
the stated law: each greenlight chooses among the auditioned candidates again. The effect only lowers closeness,
and the player pays for the cancel (no refund), so the repeat cannot be farmed for a benefit.

## Amendment 4: the expiry note reads edges, not `tiersOnRoster`

`tiersOnRoster` (`src/core/relationships.ts:337-345`) returns tiers without counterparts and cannot name anyone.
`financeUpcoming` builds the sentence from `state.relationships` directly: each edge touching the expiring person
whose counterpart is on the player's roster at the row's week, with `currentTier(edge, week) === 'Inseparable'`, in
roster order. The roster test restates the employer-interval predicate of `bridge/relationships.ts` `rosterAt`
(`:100-112`, not exported) under that file's documented "restated, not re-decided" rule.

## Notes adopted for RED and implementation

5. `newEdge` gains a branch for a first driver of kind `castingCompetitionLost`: `sharedProductions: 0`,
   `sharedCompetitions: 1`, `firstSharedWeek` = the greenlight week. It has no other caller.
6. `pairChemistry` (`relationships.ts:373`): when `edge.sharedProductions === 0`, the dormancy reason reads
   "they have never worked together" in place of "they have not worked together lately".
7. `counted()` gains `castingCompetitionLost` (increments `sharedCompetitions`) and `repeatedCompetition` (no
   counter, like `repeatedCollaboration`).
8. Save42: the era-31 relationships check uses a frozen five-kind catalogue constant, separate from the live
   seven-kind `RELATIONSHIP_DRIVER_KINDS`, so a missed strip before the V41 chain is refused, not admitted.
9. The RED names every reader of `RELATIONSHIP_DRIVER_KINDS` and `RelationshipDriverKind` under `src/`, `bridge/`
   and `ui/src/` (a filename grep, no fixture reads) and pins each one's behaviour on the two new kinds.

## Measured route for the Save41 producer and the RED

[1314-P](1314-P-casting-route-probe.ts) ([output](1314-P-casting-route-probe.txt)) measured a lawful route on the
unchanged Save41 engine, public actions only: `p13aGeneratedStudio('r1314-casting-01')`; sign the week-0 market
writer, director, craft and three actors for 208 weeks; build `set-grand-ballroom` on `facility-soundstage-07`
through week 10; activate script development and casting sessions; commission concept 0, accept at week 9; audition
`lead [a, b]`, `antagonist [b, c]`, `support [c, a]`; acknowledge at week 10; greenlight seating a, b and c in
lead, antagonist and support; shoot at the week-15 first take; commit to release (released week 18). At week 19
the six seated pairs hold `sharedProduction` edges, 30 edges exist in the world, and `validateSaveV41(makeSave)`
accepts. The three competition pairs of this slate are (a, b), (b, c) and (a, c).

## Order

Unchanged from 1313-A §5 and 1312-F: the 1309 sweep and broad rerun land first; then the Save41 outgoing producer
on the 1314-P route (parent draft, independent review, one recorded run, before the Save42 writer moves), RED
(test-author) against 1313-A as amended here, review, production, GREEN and one Save42 pin sweep.
