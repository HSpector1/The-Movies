# 1312-F: parent adoption of the relationship reconciliation

The parent read frozen [1312-A](1312-A-relationship-extent-reconciliation.md) and independent
[1312-B](1312-B-relationship-reconciliation-review.md) (REFINE, two required changes, two drafting notes) in full.
Adopt 1312-A with the amendments below. 1312-A stays byte-frozen.

## Amendment 1: the casting drivers reverse a named deferral

645-A §1(e) and 647-A2 (the B.5 expansion) excluded `castingCompetitionLost` and repeated seat competition because
"the only lawful source today is the player-only `CastingSession` … so a B.5 driver would be asymmetric under S25;
deferred with that reason." S25 settles "symmetric player/rival law". The same B.5 slice then landed
`cancelledAfterFirstTake`, whose evidence (a cancel receipt after a first take) is also produced only by the player,
because no rival cancellation policy exists (P13B-S8, OPEN). That driver's law is written for any studio and applies
to every studio that produces the evidence. The casting drivers are adopted on the same footing: the law names any
studio's casting session; rivals seat without auditions, so no rival session exists and no rival edge is minted.
This is an evidence asymmetry, not a policy asymmetry, and it does not reverse S25. If a rival audition model is ever
selected, the same driver reaches it unchanged.

## Amendment 2: D-1312-2 carries candidate rules

1312-A's closing sentence claims options for both isolated decisions; its D-1312-2 row gives none. The candidates,
none selected:

| Candidate ending rule for Partners | Consequence | Tension with the companion |
| --- | --- | --- |
| (a) Drift apart: while the pair shares no work, the romance value decays on its own horizon and the bond ends below an exit threshold under the formation threshold | Partners end quietly without conflict; long careers apart end most pairs | §5.5 says Partners are exempt from ordinary drift and "ending is a rule, not decay"; a separate romance-value decay is allowed by §5.4a ("it decays on its own horizon") but its use after formation is not stated |
| (b) Strain: the bond ends when the friendship tier falls below Friends, the eligibility floor, recording the ordinary negative driver that caused it | Breakups follow the work record (lost competitions, flops), explainable from drivers | makes the friendship track decide the romance track, which §5.4a keeps separate ("coexistence": Partners · Strained is legal) |
| (c) Industry exit only: the bond ends when either person retires from the industry, recorded as an event | Partners are career-long; no breakup mechanic in P14 | §5.4a names "a breakup" as part of the track |

D-1312-1 (conflict-record source) keeps 1312-A's two candidates plus (c) no conflict source in P14, leaving Enemies
and Nemeses unreachable as today.

## Drafting notes adopted for the 1312 expansion

3. The casting drivers mint synchronously inside `applyGreenlight` (`src/core/actions.ts:291-359`), which covers
   direct and queue-admitted greenlights, correlated to the session by `scriptProjectId`
   (`src/core/productionAdmission.ts:98-148`), on the `cancelledAfterFirstTake` precedent (`actions.ts:592-599`), not
   at the tick-tail delta seam. The expansion decides whether `RelationshipEdge` gains an exact competition counter
   beside `sharedProductions`, so "the Nth competition" survives the `recent` cap.
4. Still open P14B items outside this reconciliation's four named items: the Mentor/Rivals evidence labels (§5.3,
   HIS-014), the §5.5 compaction window, the shared-awards driver (§5.4, P08). None is closed by omission.

## Order

The 1309 sweep and its broad rerun land first. Then the 1312 expansion draft (parent), its review, genuine outgoing
Save41 inputs minted before the Save42 writer moves, RED (test-author), review, implementation, GREEN. D-1312-1 and
D-1312-2 go to the Owner decision list in the handoff; neither blocks the ready slice.
