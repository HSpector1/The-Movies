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

## The d16 suite at `base` and at `p15a1-b-r2` (1361-F4 ruling 2; 1361-F5 ruling 3)

The d16 suite runs under `src/harness/d16/vitest.d16.config.ts`, outside the `core` project. Until now no run in the P15
chain had measured it.

**The run.**
- **Script:** [run-d16.sh](1361-stage/d16/run-d16.sh). It ran on an archive of each writer tag, with `node_modules`
  linked, so the writer's working tree stayed untouched.
- **When:** alone in the lane on Node v20.20.2, 16:17:00 to 16:28:02 CDT.
- **Outputs:** [1361-stage/d16/](1361-stage/d16/) (`d16-base.json` sha256 55eb745d…, `d16-b-r2.json` sha256 6d2febfd…).

| Tree | Result |
|---|---|
| `base` (1045432, `src` as at f3fe97d0) | 12 failed, 164 passed (176) |
| `p15a1-b-r2` | 12 failed, 164 passed (176): the same 12 leaves with the same messages |

**The baseline already fails.** Twelve leaves fail at `base`:
- seven in `driver.test.ts`, three in `isolation.test.ts` and two in `publicity.test.ts`;
- seven read "expected 0 to be greater than N" (N is 0, 20 or 50). They measured a count of zero: of films, of runs, or
  of corpus entries, by their titles. Why the driver's runs yield zero is unmeasured.
- Two of them are the leaves 1361-D2 F2 expected (c) to break: the discovery-multiplier spread and the exactly-1 case.
  They fail at `base` already.

**What follows.**
- **(a) and (b) move nothing in d16.**
- **At the landing,** the landed tree must fail exactly these 12 with these messages. Any other change is a finding.
- **The drift itself goes to the closure's open items** for a bounded review. The question is why the d16 runs stopped
  releasing films and whether the analysis harness is retired or repaired. P15 does not repair it.
- **(d)** still rides with the retuned (c). Its effect can be measured only once d16 releases films again.
