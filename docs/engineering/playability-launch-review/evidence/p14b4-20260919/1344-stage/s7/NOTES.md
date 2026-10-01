# 1344-s7 NOTES: what §7 leaves undefined or contradictory

Sources: 1344-A §7 (:172-185), 1344-F (:38-39 and Amendments 2-3), 1344-F2, 1344-F3 (:16-17, ruling 4), 1344-F4, the
1329 records, and HANDOFF.md step 8. The kit resolves none of these items. Where an item has several readings, the kit
reports every reading it can measure and names the one each output uses. The parent rules or sends the item to the Owner.

## Measures

1. **"retries per studio".** §7 does not say whether a retry is an attempt or an outcome. A staffing-blocked or
   cash-blocked retry changes no state and repeats at every decision (1344-A §3.4), so attempts and outcomes count very
   differently.
   - The kit counts retries that change state: viable (greenlit) and economic rejection (`retryWeek` advanced), from
     weekly state differences, as 1344-E §7 did.
   - The decide-diag adds cash-blocked retries (rows with `retry: true` and `outcome: cashBlocked`).
   - Staffing-blocked retries never reach the chooser (`hollywoodTick.ts:225`), so no public export sees them.
2. **"the first week each rival films again after shelving".** "Films" can mean the greenlight (`filmAnnounced`, the
   1344-E §7 reading), the first take (`firstTakes`, the 1329-A "stop filming" reading) or the release. "After
   shelving" can mean after each shelving or after the studio's first.
   - The kit reports all three for every shelving: the first event at or after the shelving's processed week.
   - A same-week greenlight counts: the ready loop continues after a shelving, and a retry can follow in the same
     decision.
   - A rival that never shelves has no value.
3. **"industry films after week 140 against HEAD's 53".** 53 is `hollywood.films.length` at 133aca7a, flat from week 140
   to 520 (1329-A :29). That count includes each rival's two authored starting films and grows only at release. "After
   week 140" can mean the count at week 520 (against 53) or the films added from week 140 (against 0). The kit reports
   both. "HEAD" here is 1329's 133aca7a. The old tree (ff803032, same source) must reproduce 53 (anchor).
4. **"shelvings per studio per year".** "Year" is undefined. The kit reports fixed buckets, year = floor(week / 52), the
   rival finance period rule (`hollywood.ts:44`). It also reports the most shelvings in any 52-week window, the form
   test 11 asserts and 1344-F Amendment 3 bounds at four by law. Campaign calendar years are not used.
5. **"rival cash, films, firstTakes per studio".** No week is named. 1329 reported cash every 10 weeks to week 300, and
   `firstTakes` only as an industry total (45). The kit reports the 10-week series and the week-520 value, and splits
   `firstTakes` by `studioId`. The player's takes appear under `otherStudios`. Per-studio films follow 1329's
   rival-economy definition, which includes the two authored films.

## Horizon and week numbering

6. **"520 weeks".** 1329's loop samples the state at ticks 0..520 and ticks 521 times; its summary line reads the state
   after tick 521. A fifth rival becomes eligible at week 520 (`RIVAL_ARRIVAL_WEEKS[4]`), and `tick.ts:1118-1121` enters
   it once the incremented week reaches 520, so the state at tick 520 already holds a fifth business with no history.
   - The kit keeps 1329's lines verbatim, for byte comparison.
   - Its §7 measures cover processed weeks 0..519 and the state at tick 520. The fifth rival appears in `studios` with
     no events; §7 does not say whether "per studio" includes it.
7. **Week numbers.** A receipt carries the week its tick processed, and the state after that tick is one tick later.
   F3 says r01's `script-0006` shelves "in the tick after week 93"; 1344-E's probe P4 shows a receipt dated 93 and
   states that first differ at tick 94. The kit dates events by receipt week and divergence by tick, and expects the
   first difference at the first shelving's week plus one. Take weeks are the take receipt's own `week` field.

## Controls

8. **Control (a), "test 3's HEAD-equality run".** The control's subject moved across three texts:
   - 1344-A §6.3: "state equals HEAD's state with `screenplayShelving` stripped".
   - 1344-F Amendment 2: every business, plus identical receipts.
   - 1344-F3 ruling 4: the whole state, byte for byte, at week 93, against the genuine e62c944f mint.
   The leaf does the last: the whole GameState as key-sorted JSON (not the save envelope), and receipts with `toEqual`.
   "HEAD" is therefore a minted Save42 file, not a live run, and the control covers one week. Amendment 2's second case
   ("a run whose every evaluation is viable") became one rival over 5 weeks of genesis. The kit adds a per-tick form
   against ff803032 (RUNBOOK step 6, `firstDifferentTick`), which §7 does not ask for.
9. **Control (b), "player-only saves".** The phrase is undefined. Readings:
   - a campaign with no rival industry (`hollywood` null), the M0A corpus control the validator names;
   - the player's own development inside a rival world (test 10, which runs only 60 weeks, before the first shelving
     at week 93).
   Old Owner profile saves are not player-only after migration: `convertV18ToV19` gives them an industry. The kit
   checks the first reading on both corpus routes (52 weeks each, both trees, byte for byte). It checks the second on
   every candidate route over 520 weeks: no shelving receipt names the player, and no shelving key appears on the
   player's development.
10. **Control (c), "no refunds or ledger movement at shelving (the rival ledger reconciles)".** Other money moves in
    the shelving week (payroll, overhead, same-decision greenlights). Only the first shelving of a route has a
    counterfactual: the old tree's same tick.
    - The kit checks that first tick exactly: every rival account equal across trees.
    - At every later shelving it checks: cost row unchanged; production and marketing movement equal to the same
      week's greenlights; no development movement; no positive movement other than studio revenue; cash change equal
      to the summed movements; the live validator (`makeSave`) passing.
    - A research refund in the same week would fail the positive-movement check. The kit lists the kind and its delta,
      and the parent attributes it.
11. **Control (d), "determinism across two runs".** It does not say same process or separate processes, or what to
    compare. The kit uses two separate vitest processes and compares five outputs byte for byte, including the
    key-sorted final state. 1344-A test 12 compares `exportSave` of a 130-week route.

## Rows

12. **"The 42 C8 rows (21 natural searches)".** 1329-A's 21 natural-search rows include `bridge-p14b2-trust:363`, which
    1338-I files under C1, so the 42 C8 rows hold 20 of them. 1329-A :18 calls the 13 seating rows "on seed-b"; the
    `:807` row searches p13a-core-causal-01. The kit carries the C1 row as a separate row.
13. **"and the UNRESOLVED ledger and seating rows".** §7 names the 7 UNRESOLVED rows; the brief and HANDOFF.md step 8
    name only the 42 C8 rows. Four of the seven are the S10 rows 1-4 that the sweep attributes with its own probes
    (1344-F4 ruling 1). F4 does not say whether §7 adopts that attribution or repeats it on the candidate. The kit
    carries all 7 and points to the S10 outputs.
14. **"attributed on their own evidence".** No standard for "attributed" is given: receipt-level causation, a moved
    premise, or an unchanged primary on an unchanged chain. The worksheet supplies the evidence it can measure and
    leaves the attribution column to the parent.

## Sources and baselines

15. **The baseline assumes shelving is the only behavioural change.** The comparisons need the candidate's `src` to
    equal 9fc79624's: shelving and the pure P15 modules over ff803032 (1344-D5 §2). `build-trees.sh` refuses
    otherwise. If other production lands before §7 (HANDOFF.md step 9 queues P15 Wave 2 after §7), movements stop
    being attributable to shelving alone.
16. **1329's decide-diag record.** It cannot be re-run as recorded.
    - The jsonl was re-serialized (spaced JSON) and holds only r01 and r02: weeks 103-215 at HEAD, 103-230 at
      75d70e18. The filter is not recorded.
    - Its `employees` field read decide()'s busy set and refusals, which no public export exposes.
    - The kit's diag reproduces every other field through a chooser spy and checks itself against 1329 in that window.
    - 1329's bisect over commits is not re-run: it measured commits before 1302, not the candidate.
17. **A defect in 1329's natural-chain probe.** It defines the player as `s.studio.id`, but `Studio` has no `id`
    (`types.ts:303-308`). Every promise therefore counts as a rival's, and the summary's `issuer` never reads "player".
    The defect changes nothing on a route where the player issues no promise or proposal. The kit keeps the line
    verbatim for byte comparison and records the player's issued promises and proposal weeks (`s7.json` `player`), so
    the report can show the defect inert.

## Scope and thresholds

18. **"Natural route" in 1344-F3.** F3 speaks of the p13a-core-causal-01 genesis route. The C8 and UNRESOLVED rows also
    walk natural routes on seed-b, `p13b-s8-bridge-probe-01` and `p13-public-commercial-adoption`. The kit reports
    divergence and movements on all four seeds; F3's requirement may cover only the first.
19. **"Recorded gates: core and UI, attributed against 1338 and 1343".** It is unclear whether §7 needs its own recorded
    gates or adopts the sweep's (1344-N step 3 places the sweep's gates before §7). The kit runs no gate.
20. **No thresholds.** §7 sets no pass line for any measured value. 1344-F withdrew "films after week 140 exceed 53" and
    the per-year pin from test 11.
    - The kit checks only law consequences and method: anchors, divergence, controls.
    - It reports, unjudged, behaviour that may concern the Owner: retries that never succeed, shelved lists that only
      grow (1344-E finding 4: v1 has no pruning), rival cash below zero (P15B scope).
