# Playtest-response slice — results (CLOSED on the final gate 2026-10-29, 02:11 CDT; opened 2026-10-28, 21:45 CDT)

Entry: ENTRY.md. Ruling: OWNER-RULING-20261028.md. Measurements: MEASUREMENTS.md. Candidate: p18-season-20261028 at 6da4206a (= b3c179b0 + bab5f462 + 6a846c99 + 91f6da7e FIX-1 + 6da4206a FIX-2), pushed. RED branch playtest-response-red-20261028 at 57fc768a, pushed. Unity pairing sprint15-consumer-20261028 at 8290f2c, pushed (STATIC-UNRUN). Both full gates are audited (lane/full-tree-r1 on 6a846c99, lane/full-tree-r2 on the final commit); the independent review is filed (REVIEW.md) and FIX-1 (91f6da7e) with FIX-2 (6da4206a) applies its findings 2 to 11; the CF09 seal on the final pair passed (PAIR-VERIFICATION-20261029.json). Tag p18-sprint16-playtest-candidate-r3-20261028 at 6da4206a.

## Lane runs

| Run | HEAD | Content | Result |
|---|---|---|---|
| measure-r1 | b3c179b0 | p12 case profile; save-cost probe | profile captured; the probe aborted on the Chrome-written P18 save (Node refuses it: decision 5, measured) |
| measure-r2 | b3c179b0 | save-cost, refusal reported | aborted on the player's closure during the idle walk |
| measure-r3 | b3c179b0 | save-cost, closure reported | MEASURED (MEASUREMENTS.md §3b) |
| measure-r4 | b3c179b0 | per-root save growth | MEASURED: hollywood 1.29 MB of 1.69 MB |
| capture68-r1 | b3c179b0 | genuine outgoing68 runtime checkpoint | captured (OUTGOING68-RECEIPT.json) |
| red-r1 | 57fc768a (red branch) | the two witness files on the parent | RED by assertion in exactly the new cases: W3 "expected 17 to be 1", the follow-on "expected 'live' to be 'cancelled'", the participant case "expected 'live' to be 'cancelled'"; 8 and 18 other cases unchanged |
| focused-r1 | bab5f462 | p12 alone; 19 core files; ui P18 | p12 8/13 (was 2/13 alone), five over budget by 142–1,618 ms; core 406/424: the W3 settlement-row assertion wrong where U0 = 0 (fixed in 6a846c99), F10/F11 body pins to measure (pinned in 6a846c99), 13 INHERITED-SAME (bridge-p14b2-trust 8, bridge-p14b5-relationships family 12: 5, identical first lines to full-tree-r4) and 3 MISSING-INPUT (bridge-p14p4p5 B55-1..3: sparse-excluded docs evidence, re-materialized before the gate); ui 9/9 |
| measure-r5 | 6a846c99 | the same p12 case profile after the repair | 7,991 ms under the profiler (was 15,524); snapshot 944 ms (was 5,212) |
| full-tree-r1 | 6a846c99 | the full gate | AUDITED CLEAN WITH NOTES (lane/full-tree-r1/AUDIT.md): core 6053/6196 with 129 failed, ui 2749/2757 with 3 failed; zero NEW; 93 INHERITED-SAME; 1 INHERITED-CHANGED (the projection20 pin's message moved 68 → 69, already failing); 6 baseline timeouts passed here (8–19 s); 35 MISSING-INPUT rows of which 28 are rows that passed in the baseline and were unverified here because four tracked evidence files were outside the sparse checkout (materialized afterwards, together with the 20 other baseline-manifest docs files; the final gate verifies them) and 7 are the inherited r3n1 generated-fixture rows; budgets unchanged; core stage 5899 s against the baseline's 8466 s |
| focused-r2 | 91f6da7e | FIX-1: p12 alone; the twelve invalidated core files including the new differential test; ui P18 | core 342/343: the one failure was the new validator-level case itself (the relabelled `participant` save still carried a `rights` cancellation receipt, which the validator replays); FIX-2 (6da4206a, test-only) flips the receipt too and adds a bogus-cause refusal, 11/11 alone (28 s); every other FIX-1 file green: lock 69/69 with the version-1 refusal, generator pins unchanged (the verifier bundle is not in F10/F11), the differential test, bridge.test.ts, checkpoint, P18 files; ui 9/9; p12 stage 5/13 under coordinator activity (not read as alone; see p12-alone-r1) |
| p12-alone-r1 | 6da4206a | bridge-p12-campaign-library alone, coordinator idle | 7/13: six over the 5,000 ms budget by 17–1,731 ms (MEASUREMENTS.md, 6b final) |
| full-tree-r2 | 6da4206a | the final full gate (all 24 baseline-manifest docs inputs present) | AUDITED CLEAN WITH NOTES (lane/full-tree-r2/AUDIT.md): core 6108/6223 with 101 failed, ui 2749/2757 with 3 failed; zero NEW in both; 93 INHERITED-SAME; 2 INHERITED-CHANGED (the projection20 pin's message at 69, and the inherited p15c2 legacy-root-downgrade budget row now reached at 188,452 ms against 120,000, baseline 215,827); 6 MISSING-INPUT rows, all three gitignored r3n1 fixtures; the 6 baseline timeouts passed again; the 28 rows unverified in r1 all pass; the new differential test 25/25, the lock 78/78, the season witnesses 11/11; p12 under lane load 2/13; budgets unchanged; stages 00:09:45–02:02:58 CDT, core 5708 s |

## Decisions, state

| # | State |
|---|---|
| 1a | PENDING (Owner plays the route; OWNER-INVITATION.md unchanged) |
| 2b | RECORDED |
| 3b | MEASURED: 0.45–2.8 MB and under 0.3 s per save at weeks 1,872–2,061 on an operated world; growth ~13 KB per idle week, almost all rival/industry history; recommendation: no performance slice before promotion |
| 4c | MEASURED: every cost-cutting entry (25 of 25 across the Sprint 14 seeds) happened with cash above the reserve and ended in closure within ~90–200 weeks with zero further greenlights; the mode has no exit a rival takes. Back to the Owner: 4a (exit rule, bounded design slice; recommended) or 4b (accept) |
| 5b | RECORDED; the limitation measured live (a Chrome-written save refused by Node) |
| 6b | REPAIRED (bridge/schema/runtime.ts) and LANDED on 6da4206a: the eleven inherited cases sit within a few hundred ms of the 5,000 ms budget (idle at the final commit 7/13, max 6,731 ms; which cross varies by run), the two 20 s cases never near their budget (max 12,418 ms); under lane load 2/13. Not timing-qualified. Fallback 6a values for the Owner: the eleven named inherited cases (or the file) at 10,000 ms per leaf (MEASUREMENTS.md, 6b final) |
| 7c | LANDED on 6da4206a, RED-first, full gate zero NEW, review ACCEPTABLE: cancellation at the boundary on a lost P16 permission or a lost required person, causes 'rights' and 'participant'; integrity reasons fail validation by name instead of cancelling (FIX-1); the title sale mid-season is the one lawful trigger and cancels at once. ACCEPTANCE OPEN: REVIEW.md readings 1 (the sale's undisclosed K charge) and 12 (`deadline` label at the final boundary) |
| 8b | LANDED on 6da4206a: attestation 2 without a save version, version-1 attestations refused by name (FIX-1); CF09 seal PASS on the final pair 6da4206a ↔ 8290f2c, both generated-contract blobs 348731d6, projection 69, protocol 4, schema identity 6cdb8065 (PAIR-VERIFICATION-20261029.json). Native client STATIC-UNRUN |

## Full gate, audit, review

- Full gate full-tree-r1 at 6a846c99: CLEAN WITH NOTES, zero new assertion failures (row above; lane/full-tree-r1/{AUDIT.md, COMPARE-core.txt, COMPARE-ui.txt, LANE-SUMMARY.txt, SELECTION.json}). The one note that needs action is the 28 unverified rows from the sparse checkout; their inputs are now present and the final gate covers them.
- Independent review of bab5f462 + 6a846c99: ACCEPTABLE with twelve findings (REVIEW.md). FIX-1 commit 91f6da7e closes findings 2 to 11: rights stalls cancel only on a genuine end of authority and throw by name on integrity reasons; the validator requires tick causes strictly after C; `settledCompletely` and the malformed-`required` case corrected with a new differential exactness test for `firstRefusal`; version-1 attestations refused by name; dead branch, comments, label and indentation. Findings 1 (title-sale K charge without disclosure) and 12 (`deadline` label on an undeliverable complete season) are product readings for the Owner, with the coordinator's recommendations in REVIEW.md.
- Verification of FIX-1 and FIX-2: typecheck passes; focused-r2 (row above) green except the new case FIX-2 corrected; the final full gate full-tree-r2 at 6da4206a AUDITED CLEAN WITH NOTES with zero NEW (row above; lane/full-tree-r2/{AUDIT.md, COMPARE-core.txt, COMPARE-ui.txt, LANE-SUMMARY.txt, SELECTION.json}); the 28 rows r1 left unverified pass.
- CF09 seal on the final pair (2026-10-29, 02:06 CDT), run from the full records checkout on refs/heads/p18-season-20261028 at 6da4206a against the Unity worktree on refs/heads/sprint15-consumer-20261028 at 8290f2c with both remotes named: PASS (PAIR-VERIFICATION-20261029.json). FIX-1 and FIX-2 changed no contract bytes, so the Sprint 15 pairing holds without a Unity change.

## Claims

- MEASURED: 3b, 4c, 6b before/after and idle at the final commit; the decision 5 refusal.
- RED-first witnesses: W3 and the participant case red on the parent (lane/red-r1), green on the candidate, verified by both full gates.
- LANDED (technical, two full gates with zero NEW, independent review ACCEPTABLE, ten findings fixed): 7c, 6b, 8b, projection 69 with its genuine outgoing68 prior. Tag p18-sprint16-playtest-candidate-r3-20261028 at 6da4206a, pushed; draft PR #20 head follows the branch, still a draft.
- STATIC-UNRUN: the Unity pairing 8290f2c, CF09 seal PASS on the final pair; native evidence BLOCKED on this host.
- NOT TIMING-QUALIFIED: the eleven inherited p12 cases and the three ui 30 s rows (inherited; measured, budgets unchanged).
- NOT DONE, for the Owner: the playtest verdict (1a; OWNER-INVITATION.md now names candidate r3); 4a vs 4b; 6a exception values (eleven cases at 10,000 ms) or an accepted limitation; REVIEW.md readings 1 and 12; promotion to main (separate authorization); Sprint 17 not started.
