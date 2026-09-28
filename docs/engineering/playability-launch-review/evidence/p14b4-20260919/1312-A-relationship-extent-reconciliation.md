# 1312-A: remaining P14B relationship scope — reconciliation and the next ready slice

Parent proposal, source-only, at HEAD 8a3d9e1f. 1102-A and 1129 keep "romance/conflict/retention and any quality
consumption of relationship evidence" open and require their own bounded rule reconciliation before implementation:
"do not infer thresholds, reciprocity or conflict law from labels." This record does that reconciliation against the
companion (`docs/engineering/p14-preparation-8ef5246a/P14-PREPARATION-COMPANION.md`) and the landed B.5/B.6 source,
separates what is specified from what is not, and names one ready slice.

## Settled and landed

- Settled law: S19 (the Movies+ model including romance and enemies/nemeses, growth through shared work), S20 (no
  social grind), S22 (romance regardless of gender; no marriage or family in P14). Recommendations: R16 (ladder,
  romance as a separate track, drivers, drift), R17 (chemistry as a read-only projection, casting warning, no
  refusal). Q2 (compatibility prior) and Q4 (Nemeses refusal) stay at their recommended first behavior: one base
  growth rate, warning only.
- Landed (P14B.5/B.6, `src/core/relationships.ts`): the eight-rung friendship ladder with the §5.3 evidence condition
  (Enemies and Nemeses need a conflict record; none is minted, so those bands read Strained), five drivers
  (`sharedProduction`, `repeatedCollaboration`, `sharedSuccess`, `sharedFailure`, `cancelledAfterFirstTake`), drift
  on read, the D5 "works with friends / enemies here" chooser input (`talentMarket.ts:912-917`), the
  `nemesisOnRoster` reservation (`talentMarket.ts:1196`), and the B.6 chemistry readout and casting warning.
- Result-quality consumption of chemistry belongs to the production result owner (§5.6), not P14B.

## Reconciliation of what remains

| Item | Companion text | Specified enough to implement? |
| --- | --- | --- |
| Casting competition lost | §5.4 row 5: "both auditioned in the same casting session for the same slot; one was chosen", sign −, evidence casting-session references, "the principal source of negative relationships" | **Yes.** Every casting session holds exactly two auditioned candidates per slot (`CastingSlate = Record<CastSlot,[string,string]>`, `types.ts:879`); greenlight does not require the slot holder to come from the slate, so the driver applies exactly when the greenlit production seats one of that slot's two auditioned candidates, and names the other. Magnitude is a named hypothesis like every landed driver constant. |
| Repeated competition for the same seats | §5.4 row 6: − (small), casting references, "professional-rivalry evidence" | **Yes**, as the competition analogue of the landed `repeatedCollaboration` accelerator: the Nth competition between the same pair, capped. |
| Conflict record (Enemies, Nemeses) | §5.3: Enemies = "recorded conflict"; Strained = "recent negative driver without a conflict record" | **No.** No companion line says which event is a conflict. Choosing "a lost casting competition is a conflict" or "N lost competitions against the same person" would invent conflict law from a label. **Isolated decision D-1312-1.** |
| Romance formation | §5.4a: eligibility (both adults, neither a current Partner, Friends or above), own drivers (proximity seats across more than one production, shared success), own decay horizon, deterministic threshold crossing, dated formation event, coexistence with the friendship tier, consequences = Inseparable chemistry plus D5 shared-studio preference | Formation: **yes**, with the threshold and horizon as named hypotheses. |
| Romance ending | §5.4a: "a breakup ends the romance bond (a recorded event…)"; §5.5: "Partners are exempt from ordinary drift while the tier holds (ending is a rule, not decay)" | **No.** No companion line gives the ending rule. Formation without ending makes every Partners bond permanent, a gameplay consequence that a later rule would have to unwind with a save change. **Isolated decision D-1312-2**, and romance formation waits with it so the track lands whole. |
| Retention attention | §5.6: "a Partner or Inseparable collaborator leaving at expiry is an attention item, not a hidden penalty; attention copy names the pair" | **Yes for Inseparable** (the tier exists today). Partners joins when the romance track lands. |

## The ready slice (1312)

1. **Two casting drivers.** `castingCompetitionLost` (−) is minted once per slot when a player production is greenlit
   for a project whose casting session auditioned two candidates for a slot and the production seats one of them in
   that slot: an edge between the seated person and the other candidate, evidence `{ref: sessionId, slot}`. A slot
   filled by someone outside its slate mints nothing. `repeatedCompetition` (− small, capped) accompanies it from the second
   competition of the same pair. Minted from the advance's delta at the landed single seam, never from a root scan;
   no RNG; rivals hold no casting sessions, so no rival edge is minted (the evidence does not exist, not a policy).
   Both kinds join `RelationshipDriverKind`, a persisted enum: **Save42**, with frozen V≤41 readers refusing the new
   kinds and a lossless 42→41 downgrade only when neither kind is present.
2. **Retention attention for Inseparable pairs.** A read-model annotation on the player's upcoming `contractExpiry`
   event names the Inseparable collaborator on the player's roster at that week; no persisted fact. This is a
   projection change (one field on the upcoming-event row), bundled with item 1's projection bump.
3. **Tests.** RED against unchanged production: the two drivers on a generated world driven through a real casting
   session and greenlight; the evidence rows; no RNG draw; the Strained band now reachable by competition alone and
   Enemies still unreachable (the evidence condition holds); the attention annotation; Save42 migrate/validate/downgrade
   on genuine outgoing Save41 inputs minted before the writer moves; the prior-schema registration of outgoing56.

Out of this slice: D-1312-1 and D-1312-2 (recorded for the Owner as product rules, with the options above), result-
quality consumption, in-term poaching (P14D parking label), the R3 skipped leaves.

## Ownership

Parent writes production; test-author writes RED and the Save41 genuine-input producer; contract-auditor reviews this
proposal (1312-B), the RED and the implementation. The 1309 sweep and the broad rerun land first, so this slice's
own broad effects are attributable. Unity/native and Owner access stay deferred.
