# 1355-X: parent reference run of the P15A.1 Wave 2 RED r3

## How it ran

- **Script.** `/Users/zacheryspector/studio-scratch/1355-x/run-1355-X.sh`, step 4 of the heavy queue, alone in the
  heavy lane.
- **Tree.** A fresh scratch tree from repo HEAD f90a2def. On it, the staged patches only:
  - RED r3 [1355-p15a1-wave2-red-r3.patch](1355-stage/1355-p15a1-wave2-red-r3.patch), sha256 88d7551f…;
  - for the reference run, 1356-C's reference (83cb2a59…), then
    [1355-p15a1-wave2-reference-r3.patch](1355-stage/1355-p15a1-wave2-reference-r3.patch) (ac34afdc…), in the order
    of 1355-C3's "Reference run".
- **Files.** The three `tests/p15a1-market-integration*.test.ts` files, run with the verbose reporter. Outputs stay
  in scratch (`x-red.txt`, `x-ref.txt`, `x-ref-tsc.txt`).

## Results

| Run | Result | Expected (1355-C3) |
|---|---|---|
| RED | 55 failed, 4 passed (59); 7.8 s | 4 pass, 55 fail |
| Reference | 42 passed, **17 failed** (59); 13.2 s | 53 pass, 6 FIXTURE PENDING |
| Type gate, root, reference | exit 2, 35 errors (the same 35 as 1356's reference alone) | not stated |

**The 17 failures.**
- 4 are FIXTURE PENDING, as declared: `market-seam-default-exact` and `market-disengaged-world` (the pins) and both
  `market-old-save` leaves (the capture).
- 13 stop on the route premise before any law check. 9 report "no week, after the whole held slate is ready, with one
  due rival picture whose genre a held picture shares". 4 report "no pressured week (a natural pair, or a held picture
  sharing a due rival genre)". Both messages read "route premise failed by week 160 on seed p15a1-w2-market-01". The
  other two declared fixture-pending leaves (K1's pin comparison and K2's byte equality) are among the 13: the route
  fails before they reach their fixture.

## Probe (a scratch-only test file, removed after the run)

The probe read the held route through the helper's own exports (`heldRoute`, `routeAt`, `rivalDue`,
`releaseHistory`) on the reference tree:
- the slate's seven pictures (comedy twice, then drama, crime, romance, horror and adventure) are all ready by week 14;
- from week 7 to week 160, no rival picture is ever due, and no release of any studio occurs;
- at week 160 all four rivals hold no production, and the player's cash is −20,490,529.

## Finding

**F-1, the RED's route.** On this seed, with this slate, the industry produces nothing for 160 weeks, so no route
week can meet any premise that needs a rival release. 1355-D flagged the route premises as unmeasured; the
measurement shows they never hold. 13 leaves serve no purpose until the route changes. The probe does not establish
why the rivals never produce. The slate holds 35 people and the player's cash goes deeply negative, but neither is
shown to be the cause.

**F-2, type gates.** As in [1356-X](1356-X-p15a2-wave2-reference-run.md) F-3: the reference's two `src` errors come
from 1356's reference, and the 33 test errors are the Save44 bump's pins.

[1355-F6](1355-F6-parent-response-to-1355-X.md) rules on these.
