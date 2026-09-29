# 1351-F: parent response to the P15A.2 production handback 1351-E

[1351-E](1351-E-p15a2-production-handback.md) returned PARTIAL: 32 of 34 leaves pass on RED r3 (sha256 0083412f…),
and the type gates exit 0. The writer edited no test and names two test defects. The parent checked both against the
test file and rules on the one open behaviour.

## Test defects (revision 1351-C4)

1. **F1, `tests/p15a2-power-ranking.test.ts:287`.** The leaf first checks its own helper. The helper computes a
   critic-61, full-reach film as `10 × (0.5 × 0.61 + 0.5 × 1) × 10`. In float64 that is 80.49999999999999, which rounds
   to 80, while the law gives 81. The leaf fails before production runs. The helper computes in integer tenths with
   one division, as production does, and keeps every other helper value the file relies on.
2. **F2, `:943`.** The entrant leaf runs at week 104, so its window is [52, 104). EARLY's and MID's releases sit at
   tick 10, outside that window. Both studios score 0 and tie. The window-edge leaf excludes W−53 correctly, so the
   entrant leaf is wrong: its releases move to tick 60.

## Decision on F3: authored pre-campaign films count in no lane

1350-A excludes authored pre-1920 films from Releases only. The Films lane named no exclusion, so production scores an
authored film if it falls in the window. Only a snapshot before week 52 can hold one, and ranks publish from week 52
(1350-A §3), so no published rank changes. Unpublished lanes would still carry a fact only rival founders can have,
because the player has no authored film.

The ruling: authored pre-campaign films count in no lane. The Power Ranking measures campaign momentum. This amends
1350-A §3 by one condition. RED r4 pins it with a leaf that places a finished authored film inside an early window:
the Films lane is 0.0 with its "no finished release in the window" reason, and Releases does not count it. Production
adds the same condition to the Films lane.

## Order

1351-C4 (tests) → parent dry run → production revision 1351-E2 by the single writer after 1346-E2 → implementation
review → landing. Wave 2's adapter maps `AuthoredFilm.released` (a year) to `authoredPreCampaign: true`. With this
ruling, its tick choice cannot change a lane.
