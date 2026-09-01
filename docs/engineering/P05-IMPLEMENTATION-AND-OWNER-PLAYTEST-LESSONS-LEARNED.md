# Project: Studio — P05 Implementation and Owner-Playtest Lessons Learned

**Status: FINAL — OWNER-ACCEPTED P05 CLOSEOUT**

| Accepted authority | |
|---|---|
| TypeScript product seal | `a994de38e8f87b8680f5ab4bd6fb62e7b594c5db` |
| Unity product seal | `784f2d52e2459f2cf7a12cbde49319f2bb81df6c` |
| Player executable | `b5108a78895acb727f74fe23931ceaab76c6b36c06bdff603fd76f3d45fdd09e` |
| Engine bundle | `dba4e48b4bcc82e75bc8d20b194e26dbc6cb5c6739c710ae97a2f8da496056c3` |
| schema / protocol / projection / save | `sha256:0474ceafd6c148f329fe99eac328c79ed0b0caf906e0f7442b7f3cf0fe40cb4f` / 4 / 13 / V15 |

Owner verdict received 2026-09-01 with the P06 campaign order. This document records only
what P05 taught **beyond** the P04 lessons, which all still stand
(`docs/engineering/P04-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md`). The P04
headline — every Owner-found defect lives in the gap between "the authority is correct"
and "a person can actually do the thing" — was proven twice more in this arc (P05A.1's
hidden solvency refusal, P05A.3's unreachable hiring route). The lessons below are the
new mechanisms.

## The fourteen P05 lessons

1. **Synthetic fixtures with excess roster depth can hide real-player liveness defects.**
   Every authored casting fixture had deep talent pools, so "each role pool is nonempty"
   was always trivially true. The Owner's real profile had exactly two distinct available
   Actors for three roles. Proof worlds must include rosters at and below the legal
   minimum, not only comfortable ones.

2. **Cross-pool distinctness cannot be inferred from each role pool being nonempty.**
   Three nonempty pools drawing on two people is unstaffable. Any "N distinct people
   across M requirements" law needs a distinctness test across the union, not M
   emptiness tests.

3. **Authority blockers must not be filtered out merely because a more specific
   presentation was expected to replace them.** RC-1 was one line —
   `.filter((b) => b.kind !== 'package-staffing')` — that dropped the exact shortage
   sentence from the wire because a richer casting surface was "going to" own it. A
   blocker may leave a projection only when its replacement demonstrably renders.

4. **Existing legal engine capabilities are not useful until a player route exposes
   them.** `signContract` was legal in the engine for weeks while no post-founding
   intent, button or market surface reached it (RC-2). An engine-capability audit must
   ask "from which visible surface can a player invoke this?" for every player-relevant
   action.

5. **Talent shortage needs an exact count, reason, and remedy.** "CASTING SHORTAGE —
   only 2 of 3 required Actors are available — FIND AN ACTOR" worked because it named
   the number, the cause and the next action. Generic "cannot proceed" copy is the same
   defect class as P05A.1's hidden solvency refusal.

6. **Busy talent should remain visible where useful, with exact current work and return
   timing.** Omitting busy people (RC-3) made the roster look smaller than the studio
   the player owns. Busy rows carry an authoritative `returnWeek` and the exact current
   assignment; hiding them is misinformation by omission.

7. **Hiring candidates, freelancers, contracted talent, and unavailable talent are
   distinct states.** Projection 13 keeps them distinct on the wire. Collapsing any two
   (a candidate presented as available-now; a busy contracted actor presented as
   absent) produced Owner-visible lies. Vocabulary and wire shape must keep all four.

8. **Optional mechanics must explain purpose, cost, skip path, and retained results.**
   Camera Tests became acceptable to the Owner only when the surface said what a test
   buys, what it costs in time, that skipping is legal, and that results persist. Every
   optional mechanic P06+ adds inherits this four-part disclosure.

9. **Affordability and capacity are independent gates.** The D-12 solvency gate and
   facility capacity both stop a greenlight, for different reasons, with different
   remedies. One "blocked" state that merges them points players at the wrong fix.

10. **General package readiness does not prove current-draft legality.** A package that
    was READY can become unstaffable while it sits (roster changed underneath it).
    P05A.3's board declared READY from stale generality; legality must be recomputed
    from the current draft against the current world.

11. **Real-profile economic state belongs in final proof.** Both Owner rejections were
    found on the real profile's economics (unaffordable greenlight; two-actor roster),
    never on authored fixtures. A private byte-copy of the Owner profile is a mandatory
    proof layer, not an optional extra.

12. **Side rails/buttons are useful shortcuts but may not prime world ownership.** The
    casting route had to work from the world (building → project → market) with the rail
    as an accelerator. P06's Production/Post building inherits this as hard law.

13. **The Owner's comprehension is a product test, not merely successful command
    dispatch.** P05A.2 was rejected with zero broken commands: the Owner could operate
    everything and understand almost nothing. "Can the Owner answer what/why/what-next
    questions unprompted?" is a first-class acceptance criterion.

14. **A game may be economically constrained without being broken, but the path to
    future revenue and recovery must be understandable.** The Owner ended P05 unable to
    fund another movie while several were still in flight — accepted as an observed
    state, not a defect. What must never be unclear is whether and how money comes back.
    P06's §21 economic-liveness audit classifies this exactly (intended temporary
    constraint vs. true deadlock) before any tuning is even discussable.

## Record

**P05 ACCEPTED / CLOSED.** No further P05 product changes; P05 research is not reopened.
Next authorized work: the P06 five-day campaign (Post/Release + Living Studio Command
Layer) under the Owner order of 2026-09-01.
