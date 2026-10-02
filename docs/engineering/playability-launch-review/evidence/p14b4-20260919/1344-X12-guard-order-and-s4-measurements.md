# 1344-X12: parent measurements for the sweep's open guard-order items, and one S9 edit

The 1344-C5 drafting pass found three items no run had settled:
- 1344-F4 ruling 7's condition on the helpers' S4 prepend;
- guard order at `p14c3-transitions` :169 and :198, open since g6 (F4 ruling 5);
- two alternation-regex leaves that no unit flagged, `p14p3-directing-promises` :361 and :438, plus `p14c2b-save-v36`
  :74 and :82.

The parent measured all of them in the scratch merge tree at 62f14e7, then restored the tree. Each run used one
vitest process with no other running. Outputs are in [1344-stage/x12](1344-stage/x12).

## 1. The helpers' S4 prepend (F4 ruling 7)

`tests/helpers/p14p3-fixtures.ts:110` sends the live envelope through `convertV43ToV42` before the frozen chain
`convertV42ToV41` and on down to V38. The ruling keeps it as S4 only if, without the step, the frozen chain refuses a
live envelope. The prepend was removed in place and D14 was run alone (`-t "D14"`), then the file was restored:
- without the step, D14 fails: `validateSaveV42: expected version 42` (`src/core/save.ts:10629`);
- with it, D14 passes (x3, [1344-X9](1344-X9-save43-sweep-dry-run-x3.md)).

The condition holds, and the row stays S4. Output: [s4-counterfactual-D14.txt](1344-stage/x12/s4-counterfactual-D14.txt).

## 2. Which guard fires first at six alternation-regex sites

For each test file, a scratch copy ran each site's thrown expression once more and logged its message, ahead of the
unchanged assertion. Each copy ran alone, and all copies were removed afterwards. Results:

| Site | Expected (regex) | First guard that fires | Reading |
|---|---|---|---|
| `p14c3-transitions:169` | `/downgrade\|transition\|discard\|profession/i` | `migrateToV42: cannot downgrade or discard a screenplay shelving rejection count of studio-de11f27b-r04` | **Masked by Save43.** The shelving guard (`src/core/save.ts:10698`) fires before the V37 profession transition guard the regex was written for |
| `p14c3-transitions:198` | `/downgrade\|retirement\|discard\|profession/i` | `migrateToV37: cannot downgrade or discard profession transition, industry retirement or entrant authority` | Not masked: the intended V37 guard (`src/core/professionHistory.ts:67`) |
| `p14p3-directing-promises:361` | `/director\|predicate\|promise\|discard/i` | `migrateToV39: cannot downgrade or discard an opportunity predicate or recorded first-take subject` | Not masked by Save43: the V39 predicate guard the regex names |
| `p14p3-directing-promises:438` | the same | the same V39 message | the same |
| `p14c2b-save-v36:74` | `/downgrade/i` | the same V39 message | **Masked, before Save43.** The titles name the V36 extension guard, but the V39 guard on the way down fires first |
| `p14c2b-save-v36:82` | `/downgrade/i` | the same V39 message | the same |

Every copy passed, except the `p14p3-directing-promises` copy, whose two failures are the retained 1338 rows D07 and
D18, as at x3.

## 3. What follows

- **`p14c3-transitions:169` is an S9 row** (1344-N:44-48). Parent commit 27b56c2 in the merge tree:
  - pins the measured message;
  - records the masking, citing both guards' source lines;
  - pins `:198`, which still reaches the V37 guard, to that guard's exact message. That leaf now covers the guard
    `:169` can no longer reach. No test reaches it on genuine pre-V38 input.

  After the commit the file ran alone: 35 passed (35) ([s9-transitions-verify.txt](1344-stage/x12/s9-transitions-verify.txt)).
  The classification carries both rows as S9.
- **`p14c2b-save-v36` :74 and :82 are a finding outside the sweep.** The V39 guard masks them. Under Save42, at 1338,
  the same helper chain also passed V39 on the way down, so the masking predates Save43. That is read from the chain;
  no run at 1338 measured it. The leaves pass without reaching the V36 guard their titles name. A repair builds
  their input so that the V36 guard is the first one reached, for example from a genuine pre-V39 capture. It needs its
  own small RED and review. 1344-K lists it under open items.
- **`p14p3-directing-promises` :361 and :438 need no edit.**
