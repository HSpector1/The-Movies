# 1356-F5: parent response to the r3 confirmation (1356-D3, NOT CONFIRMED), with a correction to 1356-F4

[1356-D3](1356-D3-p15a2-wave2-red-r3-confirmation.md) confirms F3 items 1 and 3 and the classification, and finds one
defect. It also shows that 1356-F4 misstated the founding facts.

## Required in r4: a ceiling that can fire (D-1)

`rank-bounded-harness` runs its whole campaign inside a synchronous body. vitest 2.1.9 starts a test's timer only
after that body returns, so the 300,000 ms ceiling of F3 item 2 can never fire. The repo has a measured case: a
synchronous leaf with a 60,000 ms timeout passed in 228,867 ms (D3 D-1). The fix is the same one 1359-F2 item 2 set
for P15C:
- in `campaign()`, after each `tick`, throw a named error once elapsed time exceeds `CEILING_MS`;
- after `validate(save)`, assert that campaign, save and validator times sum to at most `CEILING_MS`;
- keep `CEILING_MS` as the `it` timeout, and keep the RED failure, the week-13 `archiveOf` error.

The archive file's `HEAVY` and `MEDIUM` timeouts cannot stop a synchronous body either. They are not declared budgets,
so r4 adds one header note saying so and changes nothing else.

## Correction to 1356-F4

- **Wrong:** "`beginFounding` opens the draft inside a live industry". **Right:** `beginFounding` is
  `initializeHollywood(beginFoundingDraft(state), tick === 0 ? 'fresh' : 'migration')` (`src/core/employment.ts:569`).
  In case (a) the world is headless until week 26, and the founding there creates the industry with a migration
  origin in the same call.
- **The two rules, stated exactly.** After a founding past week 0:
  - ticking with the draft open lets the new industry's rivals lock production methods, and
    `src/core/technology.ts:897` refuses any corpus row while a draft is open;
  - signing the roster and closing the draft with `foundStudio` leaves `player-contract` rows with no ledger signing
    payment, and `src/core/hollywoodValidation.ts:568-569` exempts only a fresh origin's week-0 contracts.

  A late public founding that signs no one and does not tick validates.
- **H8 supports less than F4 claimed.** H8 founds publicly at week 209 and signs no one
  (`tests/helpers/p14c3-history-boundary-fixtures.ts:107-112`). It shows the late migration origin, not
  `foundMidGame`'s order of steps.
- **The ruling stands on 1356-D3's check.** `foundMidGame` signs and closes the draft before any industry exists, then
  starts the industry by migration. Its end state matches what the repo's V18-to-V19 save migration builds
  (`src/core/save.ts:8048-8053`), and r2's `beginFounding` already gave a migration origin at week 26.
- **The Owner item, restated.** A public founding after week 0 reaches no valid save once the player signs the roster,
  or ticks with the draft open after rivals lock methods. A founding at week 0, and a late founding that does neither,
  stay valid. Whether the shipped bridge offers a late public founding is UNVERIFIED. The recommendation stands: check
  that first, then one charter for both rules if the path is reachable.

## Next

r4 from the test author. The parent runs the harness file alone at RED and at the reference (1356-X3), then a
confirmation review.
