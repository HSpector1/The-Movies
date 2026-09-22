# 676-P — parent analysis: why negative tiers cannot occur and why positive tiers saturate

ARITHMETIC AND SOURCE READING ONLY. No test ran for this note; nothing here is a measurement. It
states what the landed constants and the landed engine rules IMPLY, so that the week-260 observation
(676/677/682) can be read against a claim instead of standing alone. Written 2026-09-22 on source
`ddf58e87`.

**Revision 2, after the independent review `678-C-week260-review.md`.** Revision 1 of this note
claimed a floor of 46 and it was WRONG: 678-C D1 demonstrated a lawful sequence reaching 45, and the
parent confirmed the arithmetic. The conclusion is unchanged and the margin is now one point, not
two. Revision 1 also overstated the rival-casting claim (D3) and carried two bad citations (D4). All
are corrected below. The floor is measured, not argued, by `681-b5-closeness-floor-witness.ts`.

## 1. The claim under test

Record 675 item 1: "a low-proximity edge starts at 52 and the flop trajectory bottoms at 47, while
Strained needs < 45 … negative tiers have no natural producer under the landed constants."

`RELATIONSHIP_TIER_FLOOR.Acquaintances = 45`, so the Strained band is 31–44 and the claim is that no
B.5-minted edge ever reads ≤ 44. Enemies and Nemeses are separately unreachable BY RULE
(`relationships.ts:131-134`, plan scope (4)): they require a conflict record and B.5 mints no
conflict-record driver kind. The whole negative half of the ladder therefore rests on this one value
question.

## 2. The source facts the bound needs

1. `relationships.ts:114-120` `currentCloseness` — drift moves a value TOWARD `RELATIONSHIP_BASELINE`
   (50) and never past it, from either side. For any stored value v the value after any dormancy lies
   between v and 50 inclusive; a value below 50 can only RISE. Full return needs
   `RELATIONSHIP_DRIFT_GRACE_WEEKS + RELATIONSHIP_DRIFT_RETURN_WEEKS` = 312 dormant weeks.
2. `relationships.ts:169-181` `writeEdge` — every driver materializes drift first, then applies its
   delta. The only negative deltas B.5 mints are `−RELATIONSHIP_FAILURE_DELTA` (4) at a release below
   the failure critic score and `−RELATIONSHIP_CANCEL_DELTA` (2) at a player cancel.
3. `relationships.ts:233-245` `driveTake` — a release or cancel driver applies only to an edge that
   already exists and only when `take.week >= edge.firstSharedWeek`. 678-C Q5 strengthened this:
   `appendFirstTakes` (`promises.ts:120-143`) and `advanceRelationshipsWeek`
   (`relationships.ts:263-266`) consume the SAME take entries under the SAME guards
   (`tick.ts:1103-1121`), so a receipt cannot exist without its own six `sharedProduction` credits
   stamped at the same week. Every negative driver is preceded on that edge by that production's own
   credit of `+RELATIONSHIP_PROXIMITY_{LOW,MID,HIGH}` (≥ 2) plus, from the second shared production
   onward, `min(sharedProductions − 1, RELATIONSHIP_REPEAT_CAP)` ≥ 1.
4. `actions.ts:337-339` — `applyGreenlight` builds `busy` from `activeProductionCompanyTalentIds`
   (`employment.ts:125-127`, which takes the state and delegates to `productionCompanyTalentIds`,
   `productionPeople.ts:4-14`) plus `activeWritingAssignmentIds`, then
   `assertGreenlightStaffingIdle`. It DELIBERATELY excludes `industryBusyTalentIds` (comment
   `:335-336`), so this gate is narrower than `busyTalentIds`: it does not refuse someone seated in a
   live RIVAL picture (678-C Q5). It does refuse anyone on the player's own active production, which
   is what the bound needs. The gate recomputes `busy` from the evolving state on EVERY call, player
   action or queue admission alike (the comment at `:284-286`, "may already reflect earlier actions in
   this call"), so a same-week double-seat through batched admissions does not exist. This closes
   678-C's first open item.
5. `releaseAuthority.ts:5-6` "releaseReady (remainingTicks === 1) HOLDS until an explicit
   `commitPictureToRelease`" and `tick.ts:158` "the Production (removed from activeProductions at
   RELEASE)" — a finished picture the player never commits stays in `activeProductions`, so its
   quartet stays busy. Rivals cannot shelve: `decide()` (`hollywoodTick.ts:157`) uses the full
   `busyTalentIds`, which includes the player's active productions and every rival production
   (`employment.ts:160-163`), and the ready-project loop opened at `:160` breaks at `:161` while
   `b.productions.length !== 0`, capping a rival at one picture.

Facts 4 and 5 together give the structural bound: **an edge can carry at most one pending release
outcome at a time.** A shelved picture blocks its own pair from starting a second one.

## 3. The bound: 45

Worst case, low proximity, every picture a flop, released inside the 52-week grace window (the
ordinary pipeline, no drift):

    mint 52 → flop 48 → take#2 51 → flop 47 → take#3 51 → flop 47 → take#4 52 → flop 48 → …

That bottoms at **47** on the second and third shared production and rises thereafter. This is record
675 item 1's figure, and it is correct FOR THIS SCHEDULE ONLY.

Worst case including drift, which revision 1 of this note missed. The player shelves the finished
picture past `GRACE + RETURN` (312 weeks) and only then commits it to a flop release. Drift erases
the accumulated closeness back to 50 while the pending penalty survives, and the drifted flop then
re-enters the ordinary chain one point lower, where the second production's accelerator is still 1:

    mint 52 → shelve 313 weeks → drift 50 → flop 46 → take#2 46+2+1 = 49 → flop 45

**45 is the floor**, and it is a fixed point: production 3 nets 0 (`+2 +2 −4`), production 4 onward
nets `+1`, and any further full drift returns exactly to 50 (`v + trunc((50−v)·260/260) = 50`).
`bandOf(45)` returns `Acquaintances` because 45 IS `RELATIONSHIP_TIER_FLOOR.Acquaintances`, so the
floor sits exactly ON the band boundary, one point above the Strained ceiling of 44.

Conclusion: under the landed constants, on the landed engine, `currentTier` can never return
Strained, Enemies or Nemeses for an edge B.5 minted. That holds over the rules and does not depend on
any seed. The only Strained witness anywhere is the staged, validator-admitted edge in the RED
(family 4), which is exactly what the plan says it is.

## 3a. Sensitivity: the band opens at `RELATIONSHIP_FAILURE_DELTA = 5`

Once the repeat accelerator caps, one production cycle nets
`RELATIONSHIP_PROXIMITY_LOW + RELATIONSHIP_REPEAT_CAP − RELATIONSHIP_FAILURE_DELTA` = `5 − F`.

| F | per-cycle net | minimum, ordinary pipeline | minimum, one shelved release | Strained reachable |
|---|---|---|---|---|
| 4 (landed) | +1 | 47 | 45 | no |
| 5 | 0 | 44 | 42 | yes, at the band ceiling |
| 6 | −1 | declines without bound | declines without bound | yes |
| 7 | −2 | declines faster | declines faster | yes |

The landed value is one step below the threshold. Revision 1's "raising 4 to 7" was wrong in both
directions: 5 already opens the band, and 6 turns a repeatedly-flopping pair into a monotone decline
toward 0. No change is proposed here and none is authorized; this is the shape of the Owner's dial.

## 4. Why the positive half saturates

`hollywoodStartingData.ts:46` `RIVAL_TEAM_ROLES = ['writer','director','actor','actor','actor','craft']`:
a rival studio's payroll holds one director, three actors and one craft worker, and
`hollywoodTick.ts:160-169` `decide()` picks `employees.find(director)` with the first three idle
actors. WHILE A RIVAL'S ROSTER IS UNCHANGED its every picture therefore seats the same quartet and
drives the same six pairs.

Revision 1 said "every picture a rival EVER makes seats the identical quartet". That is refuted by
this run's own numbers (678-C D3): the edge counts are 27, 27, 36 and 24, not a fixed 24. The roster
does change — `hollywoodTick.ts:129-138` replaces an unavailable role-holder and mints a new person
at `:137-138`; `:167-170` puts eligible promised people into the triple ahead of the historical
first-three rule; and `:182` takes `candidate.cast` from the package chooser, which may permute which
actor sits lead, antagonist or support and so change a pair's proximity class between pictures.

The supported claim is the weaker one, and the measurement carries it: heavy repetition on a
near-fixed roster drives most edges to the clamp. Once the accelerator pins at +3 the per-picture gain
is at least +5 for the weakest pair with no counterweight, so the value climbs to 100 and stays.
`maxSharedProductionsOnOneEdge` reads 17 to 28 and `p13-public-commercial-adoption` reads 24 of 24
edges Inseparable at week 260, first at week 45. 658-W observed the same thing at week 207.

The consequence for the Owner is not that a constant is wrong. It is that for rival rosters the
relationship model has, in practice, one reachable outcome. Variety exists where casting actually
changes, which is the player's studio.

## 5. What this note does NOT establish

It is arithmetic over the rules plus the source facts of §2. It is not a measurement: it does not say
how many edges or drivers a real campaign holds, what the root costs in the accepted encoding, or
whether §3's drift path is ever exercised in play. Those are 677/682's job, and a finite run observing
no Strained would not by itself prove §3's impossibility claim.

Revision 1 of this note was called a proof and contained a demonstrated error. It is an ARGUMENT,
independently attacked in 678-C Q5 (which found no route past the bound) and corrected here. The
floor itself is converted from argument to measured fact by `681-b5-closeness-floor-witness.ts`, which
drives the real owner functions over a named, staged worst case; that probe is a constructed sequence,
not natural play, and it says so.
