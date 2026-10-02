# 1356-F4: parent ruling on r3's founding route (1356-C3)

## The deviation

1356-F3 item 1 told the author to found the case (a) studio at week 26 through the public draft: `beginFounding`,
the minimum roster, `foundStudio`. Built literally, that world still fails the step's validator, on another frozen
V24 rule: "Hollywood save: employment start lacks its actual player signing payment" (1356-C3). The author traced the
cause:
- `beginFounding` opens the draft inside a live industry, so each draft signing becomes a `player-contract`
  employment row (`src/core/industryEmployment.ts:29`);
- the validator requires a ledger signing payment for each such row, and exempts only a fresh origin's week-0
  contracts (`src/core/hollywoodValidation.ts:568-569`);
- the recruitment fund pays the bonus off the ledger, so no payment row exists.

r3 instead builds case (a) and three other leaves with a helper, `foundMidGame`:
1. it opens the draft with `beginFoundingHistoricalControl`, with no industry yet;
2. it signs the minimum roster and applies `foundStudio`;
3. it starts the industry at the same week with `initializeHollywood(…, 'migration')`.

The contracts become `existing-player-contract` rows, which the payment rule exempts.

## Ruling: accepted

- The construction follows the repo's own lawful late-founding pattern. C.3's H8 builds its "actual late founding"
  the same way: a migration-origin industry initialized at the late week (`tests/p14c3-profession-history.test.ts:216-218`,
  `origin: 'migration', originWeek: 209`).
- F3's facts hold, and 1356-X2 measures them:
  - origin week 26, with the draft closed from week 26 on (asserted each week to 66);
  - records 39, 52 and 65;
  - the excluded lower end and the required first record.

  Neither `originWeek` nor `recordedFromWeek` moves.
- `rank-fixed-cost-player-zero-while-founding` keeps its open draft, which its premise needs, but no longer ticks
  under it. That avoids the state 1356-X F-2 describes.

## The Owner item, widened (1356-X F-2)

Two rules make a public draft opened after week 0 inside a live industry unsavable:
- the technology corpus refuses rival method locks while the draft is open (1356-X);
- each draft signing lacks a ledger payment once the draft closes (above).

The shipped new game founds at week 0, where both rules hold. The repo's late founding goes through a migration
origin, where both hold too. Whether any shipped path opens a public draft after week 0 is UNVERIFIED. The
recommendation stands: a reachability check through the bridge first, then one charter for both rules if the path is
reachable.

## Next

A confirmation review of r3 (1356-D3), with 1356-X2 attached.
