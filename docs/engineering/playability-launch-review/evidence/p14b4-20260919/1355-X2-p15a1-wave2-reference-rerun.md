# 1355-X2: parent reference re-run of the P15A.1 Wave 2 RED r4, with its route probe

**Script.** `/Users/zacheryspector/studio-scratch/1355-x2/run-1355-X2.sh`. It is 1355-X's script with the RED r4
patch, plus the r4 route probe. It ran alone in the heavy lane, on a fresh scratch tree from repo HEAD af315499.
Patches:
- RED r4 [1355-p15a1-wave2-red-r4.patch](1355-stage/1355-p15a1-wave2-red-r4.patch) (sha256 2092c198…, from
  [1355-C4](1355-C4-p15a1-wave2-red-r4-handback.md));
- 1356's reference (83cb2a59…), then 1355's reference r3 (ac34afdc…).

| Run | Result | Expected |
|---|---|---|
| RED, 3 files | 55 failed, 4 passed (59) | 4 pass, 55 fail |
| Reference, 3 files | 53 passed, 6 failed (59) | 53 pass, 6 FIXTURE PENDING |
| Route probe, reference | passed; every premise found | every premise week found |
| Type gate, root, reference | exit 2 | unchanged from 1355-X F-2 (the references' `src` errors and the Save44 bump's pins) |

**The 6 failures** are the six `fixturePending` leaves of the r4 classification, each failing "FIXTURE PENDING":
- `market-seam-default-exact`;
- K1's pin comparison and K2's byte equality;
- both `market-old-save` capture leaves;
- `market-disengaged-world`'s pin.

The 13 route-premise failures of 1355-X are gone.

**Probe output (the held route, seed `p15a1-w2-market-03`).** It matches 1355-C4:

| Premise | Week |
|---|---|
| `twinWeek` | 9 |
| K2 | 12 |
| K1 and `pairWeek` | 21 |
| `soloWeek` | 26 |
| `routeAt(30)` | reached |

No held picture seats anyone a studio employs. The player's cash at week 160 is −22,887,019.

## For P14's §7

1355-C4 found that on seed `p15a1-w2-market-01` the four rivals greenlight nothing through week 159, with or without
the player's slate. They shelve 28 screenplays from week 15, on the economic-rejection path, and one rival's cash
reaches −4,575,084. The author did not establish which input makes every package fail, and leaves it UNVERIFIED. Its
lead is the seed's base market value, 23.6M against 42.5M (`-02`) and 64.6M (`-03`).

That is the rival stall 1344-A §7 measures. The §7 run adds this seed to its report as one flagged observation, with
the Owner deciding whether it is in scope. The §7 kit's definitions (1344-F5 Part B) stay unchanged.

**Next.** A confirmation review of r4.
