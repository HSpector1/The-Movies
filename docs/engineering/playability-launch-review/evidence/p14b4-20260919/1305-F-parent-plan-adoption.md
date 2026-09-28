# 1305-F: parent adoption of R3 rival early release, with a suspected scientist staffing defect

The parent read frozen [1305-A](1305-A-rival-release-proposal.md) and independent
[1305-B](1305-B-rival-release-plan-review.md) (REFINE, three amendments) in full and checked B's two source claims.
Adopt A's law, strategy, Save41 persistence and test plan with the amendments below. A stays byte-frozen. No Owner
decision is involved (B Q7).

## Amendment 1: one owner moves ended rival employment into freeAgents

`finishHollywoodWeek` (`src/core/hollywoodTick.ts:371-392`) is the one place a rival's ended employment reaches
`state.freeAgents`, and today it unions only rows whose `endWeekExclusive <= week`. The release step inside `staff()`
sets `endedWeek = week` and appends the `termination` end receipt; `finishHollywoodWeek` then also unions the
`talentId` of every rival employment end receipt with reason `termination` at this week. No separate list is threaded
through `advanceHollywoodWeek`, and no second source of truth is created. Because the strategy excludes promise
beneficiaries and research-seat holders, no promise or technology effect needs a channel. If implementation shows a
same-week ordering problem, the parent stops and reports it rather than adding a parallel path.

## Amendment 2: surplus is defined against the role targets, not the deficit slots

Parent check of B's claim: `rivalScientistDemand` returns `max(0, min(capacity, demanded) - employed)`
(`src/core/rivalResearch.ts:113-123`), `staff()` turns that deficit into `extraRoles`, and its slot loop fills each
slot with an existing unretained employee of that role before hiring (`hollywoodTick.ts:138-141`). Confirmed. So
"not retained by the slot loop" is not a valid surplus test for Scientists, and R3 must not release a Scientist on it.

R3's surplus test is therefore: an own active employee whose current role is not one of `RIVAL_TEAM_ROLES` and is not
`scientist`, or who is a team-role employee beyond that role's count in `RIVAL_TEAM_ROLES` after the slot loop.
Scientists are never R3-surplus in this increment.

**Suspected existing defect (source reasoning, not yet measured).** The same deficit-slot interaction means a rival
with `n > 0` employed Scientists and deficit `d > 0` retains `min(n, d)` existing Scientists into the deficit slots
and hires only `max(0, d - n)`. It ends at `max(n, d)` instead of the target `n + d`, and when `d <= n` it never
hires. This contradicts `rivalScientistDemand`'s own contract ("How many Scientists this rival still needs to fill the
seats its own policy demands") and P13B-S8's symmetric research staffing. It is recorded here only as a hypothesis.
Before any change: a RED witness on a generated world must show a rival whose employed Scientists stay below
`min(capacity, demanded)` across consecutive weeks with affordable reserve. Only a measured witness makes it a
defect. The fix would then be a separate reviewed production correction, and because it changes rival behavior on
research-active worlds, the reviewer pre-declares which natural-chain assertions may move and what receipts a lawful
movement must show (lesson on pre-declared natural-chain attribution). It is not folded into R3 silently.

## Amendment 3: the synthetic surplus mechanism

The R3 RED creates surplus by a profession transition of a rival team-role employee on a generated world, using
C.3's own profession-change primitive if one exists at the engine boundary, and otherwise a single labeled
`Talent.role` rewrite of that employee as a reader-admitted synthetic trigger. The scientist-demand route is not
used. Natural reachability of rival surplus stays OPEN; no search is released.

## Order

After 1302/1303 attribution: 1304-C/D R2 RED review and run, R3 RED (1305-C) and review (1305-D), the scientist
staffing RED witness as its own small gate, then one parent production increment for R2 and R3 (save 41, one
projection bump), its GREEN and neighbor gates, the pin sweep reusing the 1301 classification, and closure.
Unity/native and Owner access stay deferred.
