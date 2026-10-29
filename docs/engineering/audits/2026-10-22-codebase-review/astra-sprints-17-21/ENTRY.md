# ASTRA Sprints 17–21 — entry and decision ledger (2026-10-29, 08:05 CDT)

Governing order: OWNER-ASSIGNMENT-ASTRA-17-21.txt in this folder (sha256 34c4fbc8502c255f…, the Owner's file copied verbatim). It supersedes the Sprint 16 stop and authorizes five bounded work packages. It grants no playtest acceptance, no waiver, no release and no gameplay merge into main. Coordinator: Claude Fable 5.1, the existing one; integration workspace studio-scratch/p17-continuation-20261027-wt on p18-season-20261028; records on wip/headless-program-20260916-ts.

## Recovery of the actual state (once)

| Reference | Assignment value | Found 2026-10-29, 07:55 CDT |
|---|---|---|
| Gameplay p18-season-20261028 | 6da4206a | 6da4206a local and remote; tag p18-sprint16-playtest-candidate-r3-20261028 present |
| Records wip/headless-program-20260916-ts | e20ab395 | e20ab395 local and remote |
| main | ab65eb20 | ab65eb20 remote; merge base with the candidate 8792de52 |
| Draft PR #20 | OPEN/DRAFT, mergeable false | OPEN, draft, mergeable CONFLICTING, state DIRTY, head 6da4206a (Sprint 21 refreshes it) |
| Unity sprint15-consumer-20261028 | 8290f2c | 8290f2c local and remote; CF09 seal PASS with 6da4206a (playtest-response/PAIR-VERIFICATION-20261029.json) |

No newer local work exists beyond these refs; nothing was reset. Foreign Codex processes run on the host and are left alone; no Godot process is present. Host: AC power, 4.8 GB free disk, swap 6.7 of 8 GB in use.

## Decisions recorded (assignment §2)

| # | Decision | Record |
|---|---|---|
| A | Rival recovery: 4a. A bounded exit/restart policy for cost cutting, not guaranteed survival; real failure, O1 disposal safeguards and the O6 disbursed-loan exit preserved; no subsidies, cash injections, obligatory lending, replacement rivals or minimum population. | Sprint 17 (this folder, sprint17/) |
| B | TV title sale: review finding 1 option (a). Lawful sales stay available; a sale that would cancel a live season discloses the cancellation and its existing financial consequences before commitment; no new fee, no waiver, no claim that every sale removes authority. | Sprint 18 |
| C | Final deadline: review finding 12 option (a). The final-boundary `deadline` classification stays; explain the underlying inability to deliver where supported; money and cancellation history unchanged. | Sprint 18 |
| D | Save portability: the bounded permanent compatibility work (the earlier 5c direction). The same-runtime-only limitation stays disclosed until evidence replaces it; no approximate accounting, no save-format redesign. | Sprint 19 |
| E | Native surfaces: the minimum existing-game workflows for P16 rights/acquisitions, P17 continuations/featured appearances and the bounded P18 season in the native client, on the engine's real commands, quotes and state. Read-only queries and generic memo buttons do not count. | Sprint 20 |
| F | No blanket timing waiver. Budgets and original failures stay; the proposed p12 10,000 ms exception is NOT adopted; no multi-sprint overrun hunt; remaining specific exceptions reported at close-out. | all sprints |
| G | Owner acceptance and main promotion stay separate; missing feedback blocks no unrelated engineering; no simulated playtest or agent verdict stands in for the Owner's KEEP/REVISE/REJECT. | all sprints |

## Correction to a retained measurement (playtest-response/MEASUREMENTS.md §4c)

The §4c text said the only exit from cost cutting is a corporate loan "which no rival takes on these routes". The retained Sprint 14 harness output (studio-scratch/sprint14-20261028/harness-r2/out/rival/*.rivals.jsonl and *.rival-summary.json) shows the opposite for every one of the 25 cutting rivals: each took the O6 distress loan (principal 1,001,000 to 1,369,000; installments 884,000 to 1,238,000 repaid before closure), which ended cutting for one evaluation, re-entered cutting in the same week (the entry law held again at negative cash), and closed 40 to 50 weeks later. Each also received the 450,000 O1 laboratory refund during its first episode. The first episode (entry with the team intact and cash above reserve, then R3 releases, then the slow burn to negative cash) lasted 33 to 109 weeks; the loan came at distress, too late and too small to restart. The §4c conclusion (entry is terminal on the measured routes; 4a recommended) stands; the sentence about borrowing was wrong and PROGRAM-CLOSEOUT.md §3 and the assignment's "a loan that those rivals never take" inherited it. Corrected in MEASUREMENTS.md with a dated note; the Sprint 17 design reads the corrected facts.

## Sprint plan (bounded outcomes, assignment §3–§7)

1. Sprint 17: restart examination for cutting rivals (sprint17/). 2. Sprint 18: reachable rights and television transactions with disclosed consequences. 3. Sprint 19: portable saves for the named runtime pair and trustworthy import errors. 4. Sprint 20: real Unity consumer on this host if the toolchain allows, else a named blocker with preserved work. 5. Sprint 21: playtest response, integration milestone, PR #20 refresh, GO / CONDITIONAL GO / NO-GO. Each sprint ends with a pushed checkpoint and a brief results update; Sprint 22 does not start.
