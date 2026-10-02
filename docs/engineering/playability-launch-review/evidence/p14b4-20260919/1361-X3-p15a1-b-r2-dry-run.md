# 1361-X3: dry run of `p15a1-b-r2`

**The candidate.** `p15a1-b-r2`, b0b6fb01. It is P15A.1's commit (b) with 1361-D2 F3's guard folded in, one commit on
`p15a1-a-r1`; [1361-F5](1361-F5-parent-rulings-on-g2.md) Amendment 1 records it. After G2's Retune this is the P15A.1
part of Save45, and P15C now builds on it.

**The run.**
- **Script:** [run-1361-X.sh](1361-stage/prod/run-1361-X.sh), unchanged, called by
  [run-1361-X3-b-r2-then-gp.sh](1361-stage/gp-x/run-1361-X3-b-r2-then-gp.sh).
- **Tree:** checked out at the tag, clean before and after, and returned to the writer's branch `b-r2`.
- **When:** alone in the heavy lane on Node v20.20.2, 2026-10-02 15:59:33 to 16:04:44 CDT.
- **Outputs:** [1361-stage/x-r3b/](1361-stage/x-r3b/).

## Results

| Check | `p15a1-b-r2` | `p15a1-b-r1` (1361-X2) |
|---|---|---|
| Root, UI, Bridge type gates: errors in `src/` | 0, 0, 0 | 0, 0, 0 |
| The same gates: errors in `tests/` | 33, 4, 9 | 33, 4, 9 |
| 1356 archive and isolation | 71 passed (71) | 71 passed (71) |
| 1356 harness, alone (`campaignMs`; ceiling 300,000) | passed, 70,404 | passed, 79,889 |
| 1355's three files | 14 passed, 45 failed | 15 passed, 44 failed |
| 1359's three files | 40 failed, 76 passed | the same |
| Both generator checks | exit 0 | exit 0 |

**1355 matches Amendment 1 exactly.** The failing set is b-r1's 44 plus one leaf. The added leaf is
`market-forecast-paths-unchanged`, and it fails with the guard's message "(12 recorded)". Of the 44, only
`market-live-window-stock-retire` changes its message: it now fails at the guard ("3 recorded"), where b-r1 failed at
the assertion. Every other message is unchanged.

[1355-leaves-red-at-b-r2.tsv](1361-stage/x-r3b/1355-leaves-red-at-b-r2.tsv) holds the 45 leaves with their messages.
This is the list the landing's recorded run of 1355's files must match.

**1359 is unchanged.** It has the same 40 failing leaves with the same messages, so no 1359 leaf trips the guard.

**The harness time** is a measurement, not a comparison: run-to-run noise covers the difference (1361-F4 ruling 4).
