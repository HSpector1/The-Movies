# Playtest-response slice — results (IN PROGRESS, 2026-10-28, 21:45 CDT)

Entry: ENTRY.md. Ruling: OWNER-RULING-20261028.md. Measurements: MEASUREMENTS.md. Candidate: p18-season-20261028 at 6a846c99 (= b3c179b0 + bab5f462 + 6a846c99), pushed. RED branch playtest-response-red-20261028 at 57fc768a, pushed. Unity pairing sprint15-consumer-20261028 at 8290f2c, pushed (STATIC-UNRUN). The full gate (lane/full-tree-r1) and the independent review are running at the time of this draft; their sections are filled after they end.

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
| full-tree-r1 | 6a846c99 | the full gate | PENDING |

## Decisions, state

| # | State |
|---|---|
| 1a | PENDING (Owner plays the route; OWNER-INVITATION.md unchanged) |
| 2b | RECORDED |
| 3b | MEASURED: 0.45–2.8 MB and under 0.3 s per save at weeks 1,872–2,061 on an operated world; growth ~13 KB per idle week, almost all rival/industry history; recommendation: no performance slice before promotion |
| 4c | MEASURED: every cost-cutting entry (25 of 25 across the Sprint 14 seeds) happened with cash above the reserve and ended in closure within ~90–200 weeks with zero further greenlights; the mode has no exit a rival takes. Back to the Owner: 4a (exit rule, bounded design slice; recommended) or 4b (accept) |
| 5b | RECORDED; the limitation measured live (a Chrome-written save refused by Node) |
| 6b | REPAIRED (bridge/schema/runtime.ts): eleven cases failing alone became five, the two 20 s cases 7.4 and 5.8 s; the residual is the save/validate cycle on the library; fallback 6a to the Owner with the measured maxima (MEASUREMENTS.md) |
| 7c | CANDIDATE, RED-first: cancellation at the boundary on a lost P16 permission or a lost required person, causes 'rights' and 'participant'; the title sale mid-season is the one lawful trigger and now cancels at once (a product reading of contract §7 "authority genuinely ends", named for the Owner) |
| 8b | CANDIDATE: attestation 2 without a save version; the native client reads no save file |

## Full gate, audit, review

PENDING.

## Claims so far

- MEASURED: 3b, 4c, 6b before/after; the decision 5 refusal.
- RED-first witnesses: W3 and the participant case red on the parent, green on the candidate (focused-r1 after the assertion fix: verified by the full gate).
- CANDIDATE: 7c, 6b, 8b, projection 69 and its prior.
- STATIC-UNRUN: the Unity pairing 8290f2c.
- NOT DONE: Owner verdict (1a); 4a/4b choice; 6a exception values; CF09 seal on the final pair (after the gate).
