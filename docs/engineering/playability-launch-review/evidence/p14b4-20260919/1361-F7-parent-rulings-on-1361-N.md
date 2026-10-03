# 1361-F7: parent rulings on 1361-N, the Save45 pin sweep plan

The planner classified 1361-M2's fallout in [1361-N](1361-N-save45-pin-sweep-plan.md):

| What | Count |
|---|---:|
| Core rows | 868 |
| UI rows | 11 |
| Test type-error sites | 38 |

**The units.** The plan groups the rows into units H and G1 to G5. Each file sits in exactly one unit, and H goes
first.
- **Certain:** 716 sweep rows.
- **To measure:** 103 rows, which wait for a dry run.
- **Awaiting a ruling:** 1 row, the hygiene row (ruling 1).

The parent adopts the plan with these rulings on its eleven questions (plan, "Open questions for the parent").

## Rulings

1. **The hygiene row** (`tests/hygiene.test.ts:45`).
   - **The cause.** The literal "Math.random" sits in a comment at L:79 of
     `tests/p15c2-campaign-legacy-integration.test.ts` ("// no Math.random; …"). The standing rule bans the literal in
     tests, comments included (1344-X9). The row has failed at HEAD since the RED landed (1360-L), so Save45 did not
     cause it.
   - **The fix.** The RED's owner rewords that one comment in its own tests-only commit, which lands in the Save45
     push before the recorded GREEN. The new wording may be "no unseeded randomness". The record is this ruling.
   - **What does not move.** No leaf changes, so the recorded RED's outcomes and messages stay comparable. The sweep
     itself still leaves the RED files alone (1361-F ruling 20).
   - **No exception.** No Owner exception is needed.
2. **S9: the plan pins the measured first guard** (1358-F10 ruling 4).
   - **A must-succeed chain that refuses** keeps its refusal; it does not strip. Its test then chooses an input with no
     recorded quarter (1358-F9 ruling 2).
   - **The anchors move again when P15A.1's (c) lands,** because the shared-market reason then comes first. Record
     1365's sweep re-pins them.
3. **S5: each file carries its own literal `withEmptyP15Roots(state, week)`** (1358-F9 ruling 6). Production's
   `initialP15Roots` never defines a test's expectation.
4. **S7 and S10 import their strip guards from `tests/helpers/p15-roots.ts`, read-only.**
   - **What they import:** `stripP15` and `p15Rows`, and they add the check `p15Sequence.next === 1`.
   - **Why:** a later P15 root then joins every guard through the helper's one list, which its own RED extends.
5. **The week-93 control** (`tests/p14d1-rival-shelving.test.ts:618`) takes the 1358-F12 form, as the plan proposes.
   - **The candidate is checked:** it holds no shared-market assessment and an unfrozen Legacy, its archive passes
     `validatePowerRankingArchive`, and its allocator passes `validateP15Allocator`.
   - **Then the four roots come out,** as :616 takes slice B's fields out.
   - **The genuine side** stays at its V44 lift (:569).
6. **The classes keep 1358-N's numbers.** P5 becomes T, because Save45 has no projection step.
7. **The 18 title renames stand.** The classification maps each old identity to its new one, so the success line
   compares like with like.
8. **The retained rows.**
   - **C20 gets no edit.** The 7 rows that H unmasks are re-attributed on their own evidence.
   - **R8** failed in 1358-I on a 5,000 ms timeout. If it passes after H, it reads GONE, with its cause recorded. A
     measured, attributed GONE row is acceptable; no row is edited to make it pass.
9. **The bare `.toThrow()` probes** at `p14b1-t4-regressions:86`, `p14c2rm-writer-continuation:379` and
   `p14c3-save-v38:121` take a pin only where the dry run shows a guard other than the tampered field's.
10. **No test adds a P15 root by hand.** Every lift that a test ticks ends at Save45 through `convertV44ToV45`.
    - **What this closes:** no test then ticks a state without `sharedMarket` (1361-D2 F7), and none reaches week 6240
      without `campaignLegacy` (1361-D3 F4).
    - **The presence check** at `campaignLegacy.ts:1165-1166` stays with its owner (1361-F6 ruling 4).
11. **G4 splits into G4a and G4b**, disjoint by file, each with at most about 70 edit lines.

## The order from here

- **Unit H first, then the G units.** Test authors work on disjoint files, at most two agents at a time.
- **Where the edits go.** The edits land in a merge tree of HEAD, plus the cumulative production patch through
  `p15c-c-r1`, plus the sibling patch r2.
- **The dry runs** cover the type gates, core over 447 files plus the sibling file, UI and d16. They repeat until
  1361-N's success line holds.
- **Then** the sweep's independent review, then the landing `1361-L` (HANDOFF "Next step" 3).
