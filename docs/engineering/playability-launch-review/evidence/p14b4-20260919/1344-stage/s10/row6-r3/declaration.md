# 1344-C5 r3, unit r3-row6: S10 row 6 re-witness declaration (1344-F5 Part A)

Test-author, read-only. Nothing here was run. Per F5 A2, an independent review checks this declaration before the
probe runs, and only a verified witness is pinned.

Sources:
- 1344-F5 Part A (binding); 1344-X10 row 6; the r2 record `1344-stage/s10/out/row6.json` and `row6.log` (merge
  a318722); 1344-X8 core failures (markers 65-67).
- The S10 form and its reviewed conventions: `declarations-r2.md` (row 6), `probes-r2/s10-row6-rival-chain.block.ts.txt`,
  `probes-r2/RUNBOOK.md`, 1344-D5 (R6a, R6b, R6c, section 3) and 1344-D6.
- The merge tree `/Users/zacheryspector/studio-scratch/1344-merge/tree` at 6935ea5. Line numbers are 6935ea5's unless
  marked.

Evidence paths are relative to
`/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919`.

## Expected outcome

**NONE.** Inside the guard, the first take after 213 lands at post-tick 229, and two studios take that week: r01
(`film:12`) and r02 (`film:14`). The leaf needs the repeat take alone in its week (:397) and allows no take in any
earlier week (:400). No take of any rival qualifies. Once the probe confirms this, F5 A3 applies: the test does not
change, and the three leaves stay failing as a declared exception (part f).

## Line map, a318722 to 6935ea5

r2a added 7 comment lines above `FROZEN.rival` and 18 lines in and above `bytes()`. `src` (tree `db80ca31`) and
`generated` (tree `8b0ab810`) are identical at both commits. `git diff --stat a318722 6935ea5` lists 17 test files and
nothing else. The `p14b5-relationships` hunks change no value or function that `rivalWorld`, `lifted`, `fixture`,
`seatPairs` or `canon` reads: the `FROZEN` hunk adds comments only.

| What | a318722 (r2, X8) | 6935ea5 |
|---|---|---|
| `FROZEN.rival` | :154-155 | :161-162 |
| `rivalWorld()` | :352-384 | :377-409 |
| loop condition, guard | :357-358 | :382-383 |
| first take, release, repeat branches | :364-373 | :389-398 |
| repeat assertion | :372 | :397 |
| else branch | :375 | :400 |
| six-key check | :378-380 | :403-405 |
| leaves | :626, :636, :834 | :651, :661, :859 |
| shared-pair premise | :641-642 | :666-667 |

## a. Assertion, leaves and the values that may change

- Assertion :397, inside `rivalWorld()`: `expect(newTakes.map((t) => t.productionId)).toEqual([FROZEN.rival.repeatTake])`.
  x2 recorded all three leaves failing there with `expected [] to deeply equal [ 'studio-aca408ec-r01:film:6' ]`,
  frame :372:53 at a318722.
- The three leaves, each through `rivalWorld()`:
  1. :651, family 2: "the first post-migration RIVAL take mints six edges under the same law; the 45 pre-migration
     takes mint none (Q3)";
  2. :661, family 2: "the same pair on a second production is ONE edge with sharedProductions 2 and a
     repeatedCollaboration driver of the capped accelerator; a < b regardless of seat order";
  3. :859, family 5: "a rival release (hollywood.films / industry.growth) mints under the same law; a release whose
     take predates every edge mints nothing (I2)".
- Values that may change: `FROZEN.rival.repeatTake` and `FROZEN.rival.repeatTakeWeek` (:162). Nothing else changes:
  - `studioId`, `firstTake`, `firstTakeWeek` and `firstReleaseWeek` (:161) stay. :656 checks `studioId` against the
    first take, and the first take stays `film:11` under every reading (part b).
  - The guard (:382-383), the fixture (`V30_PINS` :118) and every assertion line stay.
- Under the expected NONE, no value changes.

## b. The selection rule

**Receipts.** R is the list of take receipts that `rivalWorld`'s own expression
`state.firstTakes.slice(before.firstTakes.length)` (:387) yields over post-ticks 197..237, in append order. F is the
list of film ids `state.hollywood.films` gains per post-tick (:388). `appendFirstTakes` (`src/core/promises.ts:136-164`)
only appends, and it stamps `week` with the week the advance produces (`src/core/tick.ts:1138-1142`). Append order is
therefore week order.

**Fixed values.** S = `studio-aca408ec-r01`, F11 = `studio-aca408ec-r01:film:11`, W1 = 213, WR = 217. LAST = 237: the
chain starts at 196, and `guard > 40` (:383) throws before a 42nd tick (D5 R6a).

**Predicates, in order.** The first predicate that fails ends the rule with NONE and that predicate's name.

| # | Predicate (code over R) | Leaf line |
|---|---|---|
| P1 | `T1 = R.find((t) => t.week > W1)` exists. `T1.week <= LAST` holds because R stops at 237. | :382-383 |
| P2 | `T1.week > WR` | :389-398, :403-405 |
| P3 | `R.filter((t) => t.week === T1.week).length === 1` | :397 |
| P4 | `seatPairs(T1).some((p) => seatPairs(f11).some((q) => canon(q.x, q.y).join('\|') === canon(p.x, p.y).join('\|')))`, where `f11` is F11's receipt | :666-667 |
| P5 | `state.hollywood.businesses.some((b) => b.studioId === T1.studioId)` | F5 A1 |

Witness = `{ repeatTake: T1.productionId, repeatTakeWeek: T1.week }` when P1-P5 hold, and NONE otherwise. The probe
record adds `studioId` for the reader; only the two named values reach the test.

Reasons for each predicate:
- **P2.** At 217 the if-chain takes the release branch (:393), so the repeat branch never runs. A repeat week in
  214-216 ends the loop before 217, `atRelease` stays unset, and :404 throws. A take at 217 also ends the rule:
  the leaf leaves takes at 217 unchecked, and D6 accepted NONE there as the safe direction.
- **No skipping.** The else branch (:400) requires an empty `newTakes` in every post-tick before the repeat week
  other than 213 and 217. If a later take were the witness, :400 would fail at T1's week. So no take after T1 can serve
  for r01 or for any other rival, and F5's "r01 first, then another rival of the same fixture" reduces to P5. This is
  D5 R6b's "do not skip earlier takes".
- **P5.** r01 is the primary witness. Any other business of this fixture is F5 A1's "another rival". The player's
  studio is not a rival business, so its take never serves.
- **The first take cannot move.** The leaf's premises hold only when the chain's first take is `film:11` at 213 and
  no take precedes it (:389-391, and :400 before 213). Another rival's whole chain would need its own first take to
  open the chain. R holds nothing before 213, and the 213 take is r01's. "Another rival" can therefore supply only the
  repeat take, and `studioId` stays.
- **Correction to r2.** r2's REPIN test was `next.week !== 217`, which admits 214-216. :404 refuses those weeks, and
  P2 closes the gap. On the record the gap is moot, because R5 found no take other than `film:11` in 197-221.

## c. Expected witness from row6.json: NONE, reason P3

The record decides this:
- The r2 probe recorded every take receipt of every studio, by the same expression, over post-ticks 197..237
  (`s10-row6-rival-chain.block.ts.txt:30-36`).
- `src` and `generated` have not changed since that run (line map). `fixture()` pins the fixture by sha256
  (:170-171). `tick` is deterministic from the state: the replay leaf at :591-595 compares two runs byte for byte, and
  the probes use no `Math.random` (D5). The probe's `A0` gate checks the reproduction.

Recorded R (`row6.json` `takes`). People are `person-studio-aca408ec-<id>`, studios are `studio-aca408ec-<id>`.

| post-tick | studio | production | director | lead, antagonist, support |
|---|---|---|---|---|
| 213 | r01 | film:11 | r02-1 | r02-3, r02-2, r02-0 |
| 229 | r01 | film:12 | r02-1 | r02-4, r02-3, r02-2 |
| 229 | r02 | film:14 | r01-1 | r01-4, r01-2, r01-3 |

Recorded F (`predicates.R3_d3_film11_208_213_217.detail.films`): 217 `[film:11]`; 233 `[film:12, film:14]`.

The rule on R:
- P1: T1 = r01 `film:12` at 229. Holds.
- P2: 229 > 217. Holds.
- P3: R holds two receipts at 229, `film:12` and `film:14`. **Fails: NONE, reason P3.**
- P4 and P5 would hold: `film:12` shares three pairs with `film:11` (r02-1|r02-3, r02-1|r02-2, r02-3|r02-2), and r01
  is a rival.
- The fallback rival gives nothing. r02's `film:14` sits in the same week, and its four people (r01-1..r01-4) share no
  pair with `film:11`'s (r02-0..r02-3). No take lands in 230..237.

The probe must find: every gate true; `witness` `"NONE"`; `reason` `P3_NOT_ALONE_IN_ITS_WEEK`; `t1`
`studio-aca408ec-r01:film:12` at 229; `sameWeek` `[studio-aca408ec-r01:film:12, studio-aca408ec-r02:film:14]`;
`lawful` `[]`.

## d. Predicates

**A lawful witness W satisfies all of these:**
- L1 (:383): `W.week <= 237`.
- L2 (:382, :389-398, :403-405): `W.week > 217`.
- L3 (:397): W is the only take receipt in its week.
- L4 (:400): R holds no receipt in 197..`W.week` other than `film:11` at 213 and W. Equivalently, W = T1.
- L5 (:389-391, :656): the 213 receipts are exactly `[film:11]`, r01's, and none precede them.
- L6 (:393-394): the films added at 217 are exactly `[film:11]`.
- L7 (:666-667): W shares a canonical seat pair with `film:11`.
- L8 (F5 A1): `W.studioId` is a rival business of this fixture, r01 first.
- L9 (F5 A1): the fixture is `rival-current-p1-and-p2` at its `V30_PINS` (`fixture()` asserts both sha256 pins and
  tick 196), and the chain runs 41 ticks.

**Probe gates.** The probe asserts these, and a false gate fails it:

| Gate | True when |
|---|---|
| `G1_start_196` | the lifted fixture starts at tick 196 (L9) |
| `G2_fixed_fields_in_file` | `FROZEN.rival`'s four fixed fields in the copied file equal part b's |
| `G3_weeks_197_237` | the 41 post-ticks are 197..237, consecutive |
| `G4_take_week_is_post` | every receipt's `week` equals the post-tick that appended it |
| `G5_first_take_213` | L5 |
| `G6_release_217` | L6 |
| `A0_anchor_recorded_chain` | R and F equal the r2 record (`takes`, and `R3_d3...detail.films`). The D5 C1 convention applies: false means this run is not the declared chain |
| `P_SIM_rule_equals_leaf` | a separate simulation of `rivalWorld`'s control flow (:382-405) plus :666-667, run with each rival take as the repeat, accepts at most one take, and that take (or NONE) equals the rule's witness |

**Refuters.** Any one of these refutes a reported witness:
- a false gate;
- a second receipt in W's week (L3);
- a receipt in 214..`W.week - 1` (L4);
- `W.week <= 217` or `W.week > 237` (L1, L2);
- no shared pair (L7);
- W not a rival business (L8);
- after the part f edit, any of the three leaves failing at a premise line: :383, :390-391, :394, :397, :400, :404,
  :656, :667 or :863.

Any one of these refutes NONE:
- `A0` false: the chain moved, and part c no longer describes it;
- `P_SIM` false: the leaf's own control flow accepts a take that the rule rejects.

A leaf failing at a law line (:654, :658, :668-690, :864-882) after an edit is a finding for the parent. The rule never
re-picks a witness to avoid one.

## e. Probe

- File: `s10-r3-row6-witness.block.ts.txt` in this directory. RUNBOOK.md step 1 appends it to a NEW-named copy,
  `tests/zz-s10-r3-row6.test.ts`, beside `tests/p14b5-relationships.test.ts` in the merge tree, runs it, and deletes it.
  Step 2 confirms that no copy is left and that the tree reads `?? dist/`.
- The probe reuses the base file's `lifted`, `tick`, `FROZEN`, `seatPairs`, `canon` and `readFileSync`, plus public
  exports. It uses no RNG and spies on nothing.
- It ticks 41 times from 196 (block :31), records R and F per post-tick, and then evaluates G1 (:28), G2-G6 and A0
  (:48-59), P1-P5 (:61-76) and P_SIM (:78-92).
- It writes `out/row6-r3.json` (gates, witness, reason, `t1`, `sameWeek`, `sharedPairs`, `lawful`, R and F) and logs
  `S10-r3-row6 gates` and `S10-r3-row6 witness`. Then it asserts the gates (:101).
- The witness is recorded and never asserted, as in r2. RUNBOOK step 3 reads it.
- Path rule: `r3Out()` throws for any path outside `/Users/zacheryspector/studio-scratch/1344-r3/row6/out/`. The probe
  reads `1344-stage/s10/out/row6.json` read-only and writes nothing else.

## f. The test edit, and the F5 A3 fallback

**Pinning.** A witness is verified when the review has accepted this declaration before the run, the run exits 0
with every gate true, and the JSON's `witness` is an object. With `A0` true, the recorded chain gives NONE, so this
declaration expects no edit. A moved chain (`A0` false) needs a new declaration and review before anything is pinned.

**The edit, only for a verified witness** (`<T>` and `<W>` are the JSON's `witness.repeatTake` and
`witness.repeatTakeWeek`). Two values change, plus a provenance comment in the style of r2a's `FROZEN` comment
(:152-158):

```diff
   // The rival chain from `rival-current-p1-and-p2` (196): first post-migration take, its release, the repeat take.
+  // 1344-F5 Part A: r01 shelves script-0006 at week 208, so film:6 no longer takes at 222. The repeat take is
+  // re-witnessed by rule r3-row6 (1344-r3/row6/declaration.md part b) from the probe record row6-r3.json.
   rival: { studioId: 'studio-aca408ec-r01', firstTake: 'studio-aca408ec-r01:film:11', firstTakeWeek: 213, firstReleaseWeek: 217,
-    repeatTake: 'studio-aca408ec-r01:film:6', repeatTakeWeek: 222 },
+    repeatTake: '<T>', repeatTakeWeek: <W> },
```

Verification, after x3 and with no other vitest running:
`(cd "$MERGE" && node_modules/.bin/vitest run --project core tests/p14b5-relationships.test.ts -t "CANONICAL KEY and REPETITION|a rival release")`.
It must report the three leaves passed. A failure at a premise line refutes the witness, and the edit is reverted. A
failure at a law line goes to the parent (part d).

**Fallback, the expected case (F5 A3).** The probe confirms NONE. The test does not change. The three leaves stay
failing with their X10 attribution, and the sweep's closure carries them as a declared exception. Entry text:

> **Declared exception (1344-F5 A3): three NEW identities in `tests/p14b5-relationships.test.ts` that passed at
> 1338.** The leaves are :651 and :661 (family 2) and :859 (family 5). Each fails inside `rivalWorld()` at :397:53
> (recorded :372:53 at a318722): `expected [] to deeply equal [ 'studio-aca408ec-r01:film:6' ]`.
> - Attribution (1344-X10 row 6, R1-R5 true): r01 shelves `script-0006` at week 208 on its 13th rejection, with retry
>   week 234, so `film:6` no longer takes at post-tick 222.
> - Re-witness (1344-F5 A1, rule r3-row6): NONE, reason P3. Inside the 41-tick guard the first take after 213 lands
>   at post-tick 229, where r01's `film:12` and r02's `film:14` both take. The leaf needs the repeat take alone in its
>   week (:397) and allows no take in any earlier week (:400), so no rival's take qualifies.
> - The fixture and the guard are unchanged. The shelving law removed the natural premise these leaves were written
>   against.

## Open for the reviewer

1. P2 ends the rule at a take in 217 and does not skip it. A literal reading of F5 A1 could skip one, because the
   leaf never checks takes at 217. If a take at 217 ever came with a lawful take after it, `P_SIM` (which follows the
   leaf literally) would read false and the probe would fail, so the case would reach the parent and not resolve
   silently. The record has no take at 217, so the choice changes nothing here.
2. If a witness were ever pinned, the comments at :372-374 ("the same studio's repeat take") and :400 ("between 196
   and 222") would go stale. This declaration leaves them, because only the witness values may change.
3. `A0` turns any WITNESS outcome on this declaration into a contradiction of part c. That is deliberate: F5 A2 pins
   only a witness declared and reviewed before the run.
