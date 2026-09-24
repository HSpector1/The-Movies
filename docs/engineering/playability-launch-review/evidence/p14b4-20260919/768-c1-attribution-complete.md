# 768 — every remaining C.1 failure attributed, and three corrections to my own records

Nine parallel attribution agents over the 80 new-vs-baseline failure lines of run 767, each required
to name the first changed age, the consumer it reaches and the downstream effect. Every
`approved_behavioral_change` claim was then handed to an independent verifier instructed to REFUTE
it, defaulting to overturned when the chain was asserted rather than traced. 57 agents, no errors.
Read-only throughout: no file was edited and no expectation was changed.

## The result

| category | cases | confidence |
| --- | --- | --- |
| **production_defect** | **0** | — |
| `inconsistent_fixture` | 32 | **32 measured** |
| `approved_behavioral_change` | 48 | 35 measured, **13 reasoned** |
| `inherited` | 0 | (the 80 are new-vs-baseline by construction) |

**48 of 48 approved-change labels survived adversarial refutation.** That is the label a real defect
travels under, so it was the one worth attacking, and none of it broke.

**A qualification that constrains the next pass: 13 of the 48 are REASONED, not measured.** The
seating group could not read the actual stored ages of two rival people at their crossing weeks,
because my read-only rule permitted running test files only and no existing test prints those values.
**No expectation moves on a reasoned attribution.** Those 13 are measured first or they stay failing.

## The phase question is SETTLED: no defect for players

Record 767 refused to classify this group until one question was answered. It is answered, three
independent ways, all measured:

1. **The twin is not what the helper claims.** `tests/contracts/_v14Contract.ts` hand-deletes
   `talentProvenance` from a LIVE C.1 state, so the ages it leaves are C.1's own floors and the twin
   is **100% integer**. A genuine pre-C.1 file is not: gunzipped and counted across the corpus,
   `genuine-v32-owes-two-p1` holds 1 integer in 84, `fresh-tick0` 4 in 84, `authored` 5 in 86, and
   both bare worlds 0 in 60. The helper's own error text calls the twin "what every pre-C2 file on a
   player's disk looks like". Measurably it is not.
2. **The real supported conversion is lossless**, and the RED proves it: `migrateToV33` writes
   `ageAtMigration` bit-exact on all six genuine V32 worlds, and V32→V33→V32 reproduces the exact
   original bytes. `grep Math.floor src/core/save.ts` returns exactly ONE age site — the flooring
   inside `convertV32ToV33`, taken AFTER the anchor.
3. **The already-integer ages in a genuine old save are a disclosed inherent limit, not a defect.**
   Every one of them is age 28 from the `Math.max(28, person.age)` clamp at `hollywood.ts:221`. Their
   birthday lands at migrationWeek+52, and that is correct: pre-C.1 the engine had no aging, so a
   stored `28` carries no information about when the person turned 28. There is no phase to recover.

All nine are `inconsistent_fixture`. The twin needs re-expressing; production needs nothing.

## CORRECTION 1 — contract §8's age-consumer inventory is incomplete, and its argument is wrong

§8 discloses that C.1 ships aging without retirement and argues nothing breaks numerically "because
both consumers floor": `ageFactor` at 0.85 from 56, `ageRunwayMult` at 0.35 from 60.

**`isProven` (`src/core/talentMarket.ts:693`) is a THIRD consumer and it does not floor.** It is a
hard one-way threshold at 30. I already knew it was a market decision — 759-C's amendment A4 is
exactly that finding — and I still wrote a disclosure whose argument only covered the two continuous
consumers.

**The consequence, measured rather than reasoned.** With a static population and no retirement or
fresh young supply, the capable-but-unproven pool drains monotonically: 13 → 6 on seed-b by week 215,
13 → 7 on the default seed by week 220. Every rival-template actor minted at exactly 28 is
permanently proven from week 104. **So the flexible `LEAD_OR_SIGNIFICANT_ROLE_COUNT` authoring branch
of `authorRivalPromise` decays out of any campaign more than roughly two to four years old.**

That is a product consequence, it is not in any disclosure I wrote, and it is raised for the Owner
below rather than decided here.

## CORRECTION 2 — §12 F4's falsifier claim is FALSE, and so is a comment C.1 shipped

I wrote, and marked MEASURED: "no test file imports `historicalHashState` or `liftV18Control`; the
observatory is a CLI … so the full-core run does not exercise it".

**Both clauses are false.** `tests/bridge-p05a1-owner-greenlight.test.ts:27` and
`tests/bridge-p05a3-roster-liveness.test.ts:34` import `liftV18Control`, and they are exactly these
10 failures. The comment C.1 then shipped at `src/harness/roster-wall/historical-control.ts:30-33` —
"it is never ticked, never saved at V33 … no V33 validator ever sees it" — is false on both clauses
too: the bridge reaches `validateSaveV33` through `stateDigest`, and `player-policy.ts:1122` assigns
a lifted control and immediately ticks it in a loop.

**So my F4 decision produces a state the engine refuses.** I instructed that `liftV18Control` must
NOT floor its ages, on the reasoning that the control is frozen and never validated. It is validated,
and it is ticked. An unfloored root violates condition 2 the moment either happens.

**DECIDED, reversing my own instruction: `liftV18Control` must produce a LAWFUL state, which means
flooring.** The historical hash consequences are attributed and reported, never re-pinned silently.
My original F4 goal of "no historical hash should move" was already recorded as unachievable at 766;
this is the same fact arriving a third time, and the honest resolution is to stop protecting a number
that cannot be protected and to attribute what moves.

Cost, measured in advance so nobody discovers it later: on the p05a3 fixture `t-act-17` moves
25.44049 → 25 and its `ageFactor` falls about 0.25%, while `t-act-25` moves 43.42242 → 43 and its
`ageFactor` RISES. **The repricing is not one-signed**, so each moved figure needs its own trace.

## CORRECTION 3 — one stray literal, from C.1's own writer commit

The `p14b7` group-9 version literal was introduced by `a04fa398`, not inherited from a pre-existing
idiom. The fix is to revert that one literal to 32. Recorded separately from the 31 fixture
inconsistencies because its cause is different: a sweep overreach, not a law change.

## Two decisions, with recommendations, held rather than taken

**D1 — the unproven-pool decay (OWNER).** Does the flexible seat-class authoring branch decaying out
of every mature campaign count as an accepted consequence of shipping aging before retirement, or as
a defect to fix now? **Recommendation: accept it for C.1 and make it §6.2's entry criterion.**
Retirement plus the cohort replenishment §6.5 already owns are precisely the mechanisms that refill a
young pool, C.1 has no authority to build either, and the alternative — a floor or a cap bolted onto
`isProven` — would be an unbudgeted product rule invented to hide a disclosure gap. The dependent
work held is nothing: no slice in flight depends on that branch.

**D2 — the downgrade predicate (mine unless the Owner rules otherwise).**
`convertV33ToV32` refuses an `authored_exact_week` row even at `tick === boundaryWeek`, yet
`ageAtEntry` still holds the exact pre-C.1 float — measured at 47.445061789257494 — so a boundary
downgrade could restore byte-identical V32 bytes. **Recommendation: leave the predicate as written.**
It refuses on identity grounds, not on information grounds: a V33-native campaign has no V32 ancestor
bytes, so "restoring" them would be minting a file that never existed. No production path downgrades.
The affected fixture is re-minted at the old writer instead.

## Standing qualifications

No expectation has been changed by anyone at any point in this attribution. C.1's own suite is 46/46.
The `ui` project is unrun and FU-1 unreturned. Unity/native deferred. Whether ticking an unfloored
control would have moved accepted roster-wall numbers is UNMEASURED — the observatory is a CLI that
was outside the agents' remit — and it must be checked before anything there is re-pinned.
