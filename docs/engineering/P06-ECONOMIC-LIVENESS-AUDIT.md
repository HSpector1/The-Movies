# P06 Economic Liveness Audit (campaign order §21)

**Status: CLASSIFIED — INTENDED TEMPORARY CASH CONSTRAINT. No remedy authorized
or needed; no tuning touched.**

**Method:** headless probes over a byte-copy of the Owner's post-P05-acceptance
profile (baseline sha256 `d949003e…`; the durable profile untouched), run on the
sealed engine at TS `a994de3…`. Probe scripts retained in the campaign
scratchpad; trajectories reproduced below.

## Observed starting state (the Owner's real position, game week 8)

Cash **$74,470**; three active productions (prod-0004 shooting t5, prod-0005
t6, prod-0008 t8); **zero films ever released** (no revenue history); weekly
overhead ≈$25.5k plus payroll; standing 38.6/50/40.

## Trajectory A — nobody at the controls (naive weekly advance, no decisions)

All three productions stall at their legal decision stops (unscheduled shooting
takes / unresolved operations); nothing ever wraps or releases; cash bleeds
≈$97–100k/week to −$1.7M over 18 weeks. This is the engine refusing to invent
player decisions — not a deadlock; it is what "the studio is waiting for you"
looks like from the ledger's side.

## Trajectory B — attentive player (auto-resolving each published production
operation, then advancing — exactly what the decision ladder guides)

| Wk (game) | Cash | Events |
|---|---|---|
| 9–12 | −$22k → −$314k | shooting completes; payroll/overhead continue; cash legally negative (no-hard-bankruptcy ruling; D-12 gates only NEW commitments) |
| 13 | **+$1.65M** | prod-0004 releases (opening $3.96M, total $8.54M, critic 41) |
| 14 | $5.53M | prod-0005 releases (total $15.30M, critic 81) |
| 17 | $11.9M | prod-0008 releases (total $5.62M, critic 38); three runs active |
| 22 | ~$14.0M peak | runs complete |
| 23+ | −$100k/wk drift | empty slate burn — the studio now needs (and can easily afford) new pictures |

## Classification and findings

1. **A legal recovery path exists and is short**: the Owner is 5 game-weeks from
   a +$1.9M swing and 9 from ~$12M, using nothing but the decisions the engine
   already publishes. The inability to start another movie is the D-12
   present-affordability gate functioning as accepted law.
2. **No permanent-trap state was found**: negative cash blocks no existing work,
   no decision, and no release; only new commitments gate on affordability.
3. **The product gap is visibility, not tuning** (campaign order §21 "prefer
   better visibility"): nothing currently tells the player that (a) negative
   cash is survivable, (b) revenue arrives at release, (c) the fastest way back
   is driving the slate through Post to Release. P06's chartered surfaces are
   the remedy already in flight: truthful ready/committed release-week
   semantics (`studioCalendar`), the Release Review's hold-consequence and
   already-paid rows, the movie rail's lifecycle vocabulary, and the
   release-review decision stop that actively points at the next revenue event.
4. **P06 gate interaction**: under the commitment gate the same trajectory
   requires explicit `Commit <title> to Release` per picture; the decision stop
   makes that the guided next action, so the recovery path stays equally
   discoverable. The hold law (talent stays busy; weekly exposure continues) is
   the honest cost of delaying it.
5. For the hostile reviewer: this audit changed no constants, no formulas, and
   no economy law; it is observation only.
