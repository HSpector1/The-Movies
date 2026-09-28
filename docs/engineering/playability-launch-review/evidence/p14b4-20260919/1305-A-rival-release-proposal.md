# 1305-A: R3 rival early release under the player's law, with Save41

Parent proposal, source-only. It closes the P14 obligation that a rival may release its own employee under the same
termination law as the player. No project code, compiler or test ran to produce it.

## Authority and gap

Companion §2.1.9 ("Rival early termination is symmetric in law and is Ready work"), §3.5 E4 (cost check under the
26-week cap: "the one rule under which symmetric rival release is both affordable and non-trivial"), §3.6 (a governed
change to `RivalMoneyKind`, the period exact-key shape, the rival finance reconciliation, an end-reason marker and a
rival decision path; "ungated as legality, exactly as the player's is, and reserve-bounded as strategy") and register
row R3. 1102-A and 1129 list it as open. At 993e6b01:

- `RivalMoneyKind` (`src/core/hollywoodTypes.ts:53`) and `RIVAL_MONEY_KINDS` (`src/core/hollywood.ts:24`) have no
  `termination`; periods are exact-keyed (`src/core/hollywoodValidation.ts:262`).
- An employment end receipt with reason `termination` is lawful only for the player
  (`hollywoodValidation.ts:445`, `:512`).
- Rival `staff()` (`src/core/hollywoodTick.ts:93`) keeps one own employee per team slot plus the research policy's
  Scientists. An own employee who fills no slot is paid to contract end. Real sources of such surplus exist: a
  profession transition rewrites `Talent.role` (C.3), and `rivalScientistDemand` can fall.

Already symmetric and reused: `terminationCost` (`src/core/employment.ts:197`), `releaseFloor` for any releasing
studio (`src/core/talentMarket.ts:209`), `breakPromisesOnTermination` for any issuer (`src/core/promises.ts:1076`),
rival expiries entering `state.freeAgents` (`hollywoodTick.ts:392`), `industryBusyTalentIds` for rival seats and
writing (`src/core/hollywood.ts:92`).

## Law (legality, identical to the player's)

1. Charge `terminationCost(terms, week)`, paid from rival Cash as the new movement kind `termination`, lump sum,
   ungated by solvency.
2. Effective end is the release week: the row gets `endedWeek = week`, leaves `activeEmploymentOrdinals`, and one
   employment end receipt with reason `termination` is appended (fromStudioId = the rival, toStudioId = null).
3. The person joins `state.freeAgents` that week, as a rival expiry does, and any entered studio may sign them.
4. R2 binds rivals: a person seated on the rival's active production or writing for it cannot be released.
5. R1 binds rivals: re-hiring its own released person prices through the studio-aware floored entry, so rival
   re-hire in `staff()` stops using bare `offerForTalent` for that person while a floor is unexpired.

## Strategy (when a rival chooses to release; implementation recommendation R3)

Inside `staff()`, after the slot loop has chosen whom to retain, each own active employee not retained is surplus.
In ascending employment-ordinal order the rival releases a surplus employee only when all hold:

- not in the rival's production or writing seats (`industryBusyTalentIds`) and not holding an unreleased seat on
  one of its own technology projects (`state.technology.projects` rows for this studio, `seat.releasedWeek === null`,
  as `src/core/rivalResearch.ts:160` counts them); the strategy is stricter than R2 and never touches a research
  seat, so no rival research release handler is needed;
- more than `HIRING_TERMINATION_CAP_WEEKS` (26) weeks remain, so releasing saves pay; with 26 or fewer the charge
  equals all remaining pay and keeping the person costs the same;
- no open or current promise issued by this rival to this person (E7's BROKEN consequence then never arises for a
  rival; the promise path stays unchanged);
- Cash after the charge stays at or above `operatingReserve` computed without this employee.

No new tuning constant; no RNG; each release recomputes the reserve. A case subject is inside the 12-week renewal
window and therefore never eligible.

## Persistence: Save41

- `termination` joins `RivalMoneyKind` and `RIVAL_MONEY_KINDS`; `newFinancePeriod` seeds it at 0.
- The live V41 validator requires the new key and reconciles, per period (the `periodOf` idiom used for research),
  `movements.termination` against minus the sum of `terminationCost(terms, endedWeek)` over this rival's rows ended
  by a `termination` receipt in that period, and admits a rival `termination` end receipt only when
  `week < endWeekExclusive`. Frozen V40-and-earlier validators keep the exact old keyset and the player-only rule,
  versioned by era (the law frozen readers reconcile must not move for them).
- 40→41 migration adds `termination: 0` to every period of every rival; nothing else changes. 41→40 downgrade is
  lossless only when every `termination` movement is 0 and no rival termination receipt exists; otherwise it
  refuses with a named reason.
- Genuine outgoing Save40 fixtures are minted at the last Save40 writer before the writer moves, with sha256
  provenance first, as generated test campaigns only.

Projection: rival finance movements are not projected (no Bridge reader of `RIVAL_MONEY_KINDS`). The Industry feed
renders every employment end receipt as "Contract ended" without its reason (`bridge/industry.ts:116`, `:350`), which
satisfies "published this week as a public employment transition"; the schema's `transition` enum
(`bridge/schema/bridge-schema.ts:2679`) covers starts only. R3 alone adds no projected value; the combined increment
carries R2's projection bump (1304-F).

## Tests (RED against unchanged production)

- Decision and effects on a generated world advanced by public ticks to a week with a rival roster, plus one labeled
  synthetic surplus employee added through the rival's own hiring path (the natural-world witness is not claimed):
  release happens exactly when every strategy condition holds; one failure of each condition keeps the person;
  charge, `termination` movement, end receipt, freeAgents entry, payroll stop and reserve after release are exact.
- R1: a later rival re-hire of the released person prices at the floor until the original end week, then at market.
- Save41: fresh V41 validates; genuine V40 migrates by adding zeros only; every frozen reader still admits its own
  version; 41→40 downgrade lossless with zero movements and refused after a real rival release; forged
  unreconciled `termination` movements and a rival termination receipt without its movement are refused.
- Player behavior, rival hiring and research are byte-identical on worlds without surplus.

## Open, not claimed

Natural reachability of rival surplus on an unmodified generated world is not proven and no search is proposed; like
the rival material-policy witness it stays OPEN until a named genuine input shows it.

## Ownership

Parent writes production (R2 and R3 together, one save bump 41 and one projection bump per 1304-F), test-author
writes RED and neighbor attributions, contract-auditor reviews. Unity/native and Owner access stay deferred.
