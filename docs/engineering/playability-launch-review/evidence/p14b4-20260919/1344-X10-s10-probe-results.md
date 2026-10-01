# 1344-X10: parent run of the S10 probes r2 (after 1344-D5 and 1344-D6)

## How it ran

- **Merge tree.** The scratch merge tree stayed at a318722 throughout (x2's tree; no r2 edit applied yet).
- **Runbook.** The parent ran [RUNBOOK.md](1344-stage/s10/probes-r2/RUNBOOK.md) steps 0-8 verbatim, one probe at a
  time, through [run-probes-parent.sh](1344-stage/s10/run-probes-parent.sh), between 17:15:45 and 17:18:30 CDT on
  2026-10-01.
- **Clean tree.** After every step the merge tree's status read exactly `?? dist/`, and no probe copy was left behind.
- **Old tree.** The old-source tree held `src` and `generated` from ff803032, the 1338 run's source (src tree
  347cfcce), with the merge tree's tests, bridge, ui and configs. Step 8 removed it.
- **Outputs.** Every output is in [1344-stage/s10/out/](1344-stage/s10/out/), with the
  [run log](1344-stage/s10/run-probes-parent.log).

## Results

| Row | Ruling | Result |
|---|---|---|
| 1 `p14b4-rival-seating-preference:498` (seed-b digest) | F4 ruling 1 | **Attributed.** All gates true: `C1_head_anchor`, `C1_old_anchor`, `P1_d1_shelving_before_w211`, `P2_d2_thirteen_rejections`, `P3_C3_state_equal_at_Ws`, `P4_C2_first_moved_row_after_Ws`, `P6_d5_leaf_law_head` |
| 2 `bridge-p14b5-relationships:530` family 12, seed-b | F4 ruling 1 | **Attributed.** All gates true (C1 both anchors, P1 first moved row after Ws, P3 state equal at Ws, P4 law lines, P5 RNG unmoved, P6 extension row) |
| 3 `:550` family 12, `p13-public-commercial-adoption` | F4 ruling 1 | **Attributed.** All gates true |
| 4 `:550` family 12, `p13a-core-causal-01` | F4 ruling 1 | **Attributed.** All gates true |
| 5 `p14b5-relationships:596` | F4 ruling 2 (S7) | **Holds.** Every guard clause held on `after`: r01 carries one rejection of count 1 on ordinal 6, nothing shelved, hold 0, no `screenplayShelved` receipt. The stripped digest equals the pin `9702aa6869cf…` |
| 6 `p14b5-relationships:365-372` | F4 ruling 4 | **Attributed, PREMISE_CONFLICT.** All five predicates true (R1-R5: the shelving at 208, the counts at weeks 196-207, `film:11` at 208/213/217, no commission during the hold, no other take in weeks 197-221). The first r01 take after 213 is `studio-aca408ec-r01:film:12` at week 229, and it fails the leaf's witness conditions. Per F4 ruling 4 nothing widens and the three leaves return to the parent |
| 7 `p14b1-trust-chooser:683` | F4 ruling 3 (ORACLE) | **Holds.** Run A, the recorded leaf with logging, fails as recorded. Each mismatching read names a screenplay in the issuer's `screenplayShelving.shelved` (d1 true; first at week 196, issuer r03). Run B, the declared oracle edit alone, passes both leaves (:761, :802) |

## Consequences

- Rows 1-4 stay failing as retained 1338 identities with attributed changed primaries (F4 ruling 1). The sweep changes
  none of their assertions. 1344-N's success line counts them among the 78.
- Row 5: r2a's guarded strip applies. Row 7: r2c's oracle edit applies; x3 verifies its form, which differs from
  Run B.
- Row 6 needs a parent decision. These are NEW identities that passed at 1338. The success line allows no new
  identity, so the sweep cannot close with them failing unless the parent records an exception. That decision is
  recorded in 1344-F5.
