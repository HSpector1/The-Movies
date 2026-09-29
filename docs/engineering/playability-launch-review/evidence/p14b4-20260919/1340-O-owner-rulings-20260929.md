# 1340-O: Owner rulings of 2026-09-29, recorded verbatim

The Owner gave two explicit rulings in the Claude session on 2026-09-29, after the T1 closure
([1337-K](1337-K-parent-timing-t1-closure.json)) was pushed at 1e9ef1f4. The parent recorded both word for word
below. They close the five open decisions and the UI time-budget question (D-1339-1). The Owner also said: "Do not
reopen these five choices for routine implementation details."

Where the rulings are recorded:
- this record, the durable form of both rulings;
- the decision index [DECISIONS.md](../../../../../DECISIONS.md), section "Owner rulings, 2026-09-29";
- the handoff CURRENT blocks, whose "Owner decisions open" lines the rulings close.

The parent left two older registers unedited, because both are retained byte-for-byte from other commits:
- [CODEX-P13-P15-OWNER-RULINGS.md](../../../p14-preparation-8ef5246a/CODEX-P13-P15-OWNER-RULINGS.md), retained
  from 8ef5246a at 7c4ba4c1. Its own §8 says a newer explicit Owner ruling governs, so D-1323-1 closes the "exact
  shared-market formula" item of its §4.3. The other §4.3 items stay open.
- [P12A-DECISION-AND-REQUIREMENT-REGISTER.md](../../../P12A-DECISION-AND-REQUIREMENT-REGISTER.md), the P12A-era
  register. HIS-014 there says "narrative labels prohibited until authored". The Mentor and Professional Rivals
  definitions below are that authoring.

## Ruling 1: the five open decisions

```text
OWNER RULINGS — RESOLVE THE FIVE OPEN DECISIONS

Record these in the existing decision register and continuation files.
These are explicit approvals. Apply them at the next safe checkpoint
without interrupting an active recorded run.

D-1329-1 — RIVAL STALL
Approve option B: charter and implement bounded screenplay shelving.

A rival may shelve a Ready, unproduced screenplay after repeated
decision opportunities find no viable package under its existing policy.
Distinguish economic rejection from temporary staffing, cash or
facility blockage. Do not claim the screenplay is impossible forever.

Shelving frees the active development slot without deleting the
screenplay, its costs or history, granting refunds, or erasing promises.
Respect existing obligations and their existing consequence owners.

Choose the consecutive-failure threshold and retry/cooldown settings
as named provisional tuning. Prevent immediate shelve/recommission loops.
Verify the measured stalled route and relevant controls without forcing
the old hiring outcomes or changing tests merely to restore old results.

D-1323-1 — SHARED MARKET
Approve the complete 1323-A formula as amended by 1323-F:
four-week weights 1.00/0.55/0.55/0.20;
stock 0.20 from R+4, half-life 13 weeks, retired at R+26;
one unit per release; per-studio same-genre window cap;
factor 1 - 0.25 * (1 - exp(-P/2)).

Retain self-exclusion, same-week symmetry and all specified boundaries.
Treat the constants as provisional tuning, with the planned Wave 4
KEEP/REVISE/REJECT playtest. This closes the formula decision and
authorizes the planned P15A.1 implementation sequence.

D-1312-1 — CONFLICT RECORDS
Choose repeated competition: initially three distinct recorded casting
competitions between the same pair, counted under the existing
production/event deduplication rules.

This establishes conflict evidence, not an automatic Enemies/Nemeses
tier. Existing closeness and tier rules still govern. One lost audition,
a shared flop or a cancellation alone does not establish conflict.
Do not apply the existing negative drivers twice.

D-1312-2 — ROMANCE ENDING
Choose candidate A with this explicit clarification:
Partners remain exempt from ordinary friendship drift, but sustained
separation may decay the separate romance track and end the bond.

Use a grace period and an exit threshold below formation, with numeric
settings delegated as provisional tuning. Record the ending once.
Do not erase friendship/history or add a conflict penalty to an
amicable breakup. Changing studios, retirement or a friendship-tier
drop alone does not automatically end the romance.

HIS-014 — EVIDENCE LABELS
Mentor: the same director directed an actor's first three qualifying
pictures, where authoritative history establishes those first three.
Do not infer missing early-career history from an incomplete record.

Professional Rivals: at least two distinct recorded competitions
between the pair for the same casting slot.

Labels cite their evidence, decorate existing tiers and create no
additional skill, trust, chemistry or closeness effect by themselves.
Do not fabricate labels retrospectively.

EXECUTION
Prioritize the rival-stall correction and its verification before
integrating additional shared-market pressure into the live economy.
Continue independent authorized work meanwhile.

Finish the remaining P14 requirements and continue the planned
P15 → P16 → P17 → sufficiently specified P18 work.
Do not reopen these five choices for routine implementation details.

Keep two concurrent specialists maximum, one production writer,
independent tests/review, bounded data access and verified GitHub
checkpoints. Unity/native acceptance remains deferred.
```

## Ruling 2: the UI project's default test time budget (D-1339-1)

```text
Approved: change the UI project's default testTimeout in the repository's
existing Vitest config. Start at 30,000 ms, justified by the recorded
5.6–24.8-second UI test durations.

This is an authorized repo-scoped change, not permission for machine/global
settings changes. Leave core/bridge budgets and explicit performance
requirements unchanged. Do not disable timeouts, add retries, remove
assertions, or classify unrelated failures as timing problems.

Apply after any active recorded run finishes. Run the affected UI checks
and a comparable recorded UI suite, report actual durations and remaining
failures, then commit/push. Preserve the earlier failed evidence.

Treat this as test-harness stabilization—not proof of acceptable in-game
performance or completed Unity/UI acceptance.
```

## Decisions closed

| Id | Question | Owner choice | Source options |
|---|---|---|---|
| D-1329-1 | What a rival does with a Ready screenplay it cannot profitably make | Option B: charter and implement bounded shelving | [1329-A](1329-A-c8-natural-chain-finding.md) |
| D-1323-1 | Exact P15A.1 shared-market formula | The 1323-A formula as amended by 1323-F; constants provisional; Wave 4 playtest | [1323-F](1323-F-parent-p15a1-charter-adoption.md) |
| D-1312-1 | Source of the conflict record (Enemies/Nemeses) | Three distinct recorded casting competitions between the pair; evidence only | [1312-A](1312-A-relationship-extent-reconciliation.md), [1312-F](1312-F-parent-relationship-adoption.md) |
| D-1312-2 | Romance ending rule | Candidate A with the separation-decay clarification | [1312-A](1312-A-relationship-extent-reconciliation.md), [1312-F](1312-F-parent-relationship-adoption.md) |
| HIS-014 | Mentor and Professional Rivals label definitions | Mentor: first three qualifying pictures under one director, from authoritative history. Rivals: two distinct competitions for the same casting slot | companion §5.3 |
| D-1339-1 | UI time budget | UI project `testTimeout` 30,000 ms in `vitest.workspace.ts` | [1339-I](1339-I-broad-ui-attribution.md), [1337-K](1337-K-parent-timing-t1-closure.json) |

## Execution order the parent takes from the rulings

1. U2: the UI `testTimeout` (ruling 2), with the recorded UI gate.
2. The rival-shelving charter and implementation (D-1329-1), then its verification: the measured stalled route and
   controls. This comes before any shared-market pressure enters the live economy.
3. Independent work meanwhile: the P15A.1 sequence up to integration (RED and staging), and the P14 relationship
   rules D-1312-1, D-1312-2 and HIS-014. Each gets its own charter, review, RED, production and closure.
