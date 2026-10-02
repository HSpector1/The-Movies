# 1356-F3: parent response to the P15A.2 reference run (1356-X)

[1356-X](1356-X-p15a2-wave2-reference-run.md) ran the confirmed RED r2 and its reference. One leaf failed outside its
declared reason. The test author revises the RED as r3, with these changes only.

## Required in r3

1. **`rank-validate-cadence-boundary` case (a) founds the studio.** At week 26 the leaf hires the minimum founding
   roster and applies `foundStudio`, and only then ticks to 66. The world must hold a closed draft
   (`state.founding === null`) from week 26 on, and the leaf asserts that as a premise. The case's cadence facts stay:
   origin week 26, first record 39, records 39, 52 and 65, the excluded lower end and the required first record. If
   founding at 26 moves `originWeek` or `recordedFromWeek`, the leaf re-derives its weeks from them, never from a
   guess.
2. **The harness ceiling.** It drops from the PROVISIONAL 2 h to 300,000 ms, citing 1356-X (`campaignMs` 61,020 run
   alone). The header keeps "run alone".

Nothing else changes. Declare in the handback whether case (b) or any other leaf also ticks with an open founding
draft. Any that does gets the same fix.

## The conflict in the law (1356-X F-2)

The RED does not depend on it once case (a) founds the studio. It goes to the Owner as its own item, with a
recommendation.
- **The conflict.** The method-lock writer engages on an open founding draft, and the technology validator refuses
  any corpus row while one is open.
- **Recommendation.** The validator's rule names the player's corpus. It should refuse only rows of the player's own
  studio while the draft is open, and keep refusing every row when no industry exists.
- **Before any change.** A repair needs its own charter and review, and a reachability check through the shipped
  bridge.

## Type gates (1356-X F-3)

The two `src` errors belong to the reference, which no one ships. The production writer's type gates must be clean
on `src`, and the production's sweep moves the 33 test pins.

## Next

- r3 from the test author, then a confirmation review.
- After that, the parent re-runs the reference (1356-X2) before the recorded RED.
